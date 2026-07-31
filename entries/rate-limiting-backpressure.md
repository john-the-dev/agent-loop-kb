---
id: rate-limiting-backpressure
title: "Rate limiting and backpressure"
url: https://developers.openai.com/api/docs/guides/rate-limits
category: memory
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-31
superseded_by: null
evidence: []
tags: [rate, limiting, backpressure, model, providers]
---

Model providers can limit requests, input tokens, output tokens, or concurrent work, so admission control must estimate token load rather than count requests alone. Use per-tenant quotas, bounded queues, concurrency semaphores, exponential backoff with jitter, and provider reset headers; shed or defer low-priority work before queues consume all memory or exceed user deadlines. Propagate cancellation through agent and tool calls, and avoid synchronized retry storms or unbounded worker fan-out after a limit clears.

## Deep dive

Agent systems hit rate limits differently than web apps do. A single user request can fan out into dozens of model calls across subagents, retries, and tool loops — so the moment a limit clears, every queued worker fires at once and re-trips it. Admission control that counts requests misses the real constraint: model providers limit **tokens**, not just calls. Both [Anthropic](https://docs.anthropic.com/en/api/rate-limits) and [OpenAI](https://platform.openai.com/docs/guides/rate-limits) enforce separate request-per-minute and token-per-minute ceilings, which means a burst of small calls and one giant-context call can exhaust the same quota in completely different ways. Estimate token load before dispatch, and admit work against the token budget, not the request count.

## Backpressure beats buffering

The default failure shape is an unbounded queue: work piles up behind a limit, memory grows, user deadlines silently expire, and when capacity returns the system floods itself. [Amazon's load-shedding guidance](https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/) is the canonical treatment: past the saturation point, taking on more work reduces useful throughput, so the system must reject or defer early — while the rejection is still cheap. For agents that means bounded queues with explicit overflow behavior, concurrency semaphores around model and tool calls, and priority classes: interactive runs shed cron and batch work first, and a deferred low-priority task is an outcome to report, not an error to retry.

## The mechanics that work

[Stripe's rate-limiter writeup](https://stripe.com/blog/rate-limiters) covers the algorithmic core — token buckets for smooth admission with burst headroom, plus separate limiters for load shedding by priority. Layer that with the provider's own signals: respect `Retry-After` and reset headers instead of inventing a schedule, use exponential backoff with **jitter** so a fleet of workers doesn't retry in lockstep, and put the policy in the executor so a model deciding "try again" cannot bypass it. After a limit clears, ramp concurrency back up gradually — going from 0 to full parallelism is how you trip the limit twice in one minute.

## Cancellation must propagate

An agent-specific trap: the user abandons a run, but its subagents and queued tool calls keep spending quota for minutes. Cancellation has to flow through the whole tree — parent run, subagents, pending retries, queued work — or backpressure protects the provider while the budget bleeds internally. Track two metrics per tenant: time-in-queue at each priority, and spend-after-cancellation. The first tells you when to shed sooner; the second should be near zero.

*Sources: [Anthropic — API rate limits](https://docs.anthropic.com/en/api/rate-limits) · [OpenAI — Rate limits guide](https://platform.openai.com/docs/guides/rate-limits) · [AWS Builders' Library — Using load shedding to avoid overload](https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/) · [Stripe — Scaling your API with rate limiters](https://stripe.com/blog/rate-limiters).*

*Related: [retries, timeouts & idempotent tools](/library/tool-retries-idempotency), [cost control & token economics](/library/agent-cost-control), [token budgets](/library/token-budgets), [durable agent execution](/library/durable-agent-execution).*

