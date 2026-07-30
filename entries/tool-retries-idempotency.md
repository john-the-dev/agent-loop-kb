---
id: tool-retries-idempotency
title: "Retries, timeouts, and idempotent tools"
url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
category: tools
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-29
superseded_by: null
evidence: []
tags: [retries, timeouts, idempotent, tools, give]
---

Give every networked tool a connection timeout, an overall deadline, and a bounded retry policy using exponential backoff with jitter only for transient failures such as throttling or selected 5xx responses. Never automatically retry validation, authorization, or permanent business errors, and respect provider retry hints. Side-effecting operations need an idempotency key and stored outcome so a timeout after a successful write cannot create a duplicate charge, ticket, email, or order.

## Deep dive

Retries look like a reliability feature until an agent turns one uncertain tool call into three charges, three emails, or a synchronized flood against a struggling service. The safe design starts by separating three questions: **Did the request time out? Is the failure transient? Is repeating the operation safe?** A retry is justified only when the answers line up.

## Timeouts are layered budgets

A networked tool needs both a short **connection timeout** and an **overall deadline** for the logical operation. The connection timeout stops a dead endpoint from consuming the whole run; the deadline prevents DNS, connection, response, and backoff delays from quietly exceeding the agent's task budget. Each retry spends from the same deadline rather than resetting the clock.

[Amazon's Builders' Library](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) recommends choosing timeouts from the downstream service's latency distribution, then accounting for network overhead and deployment effects such as cold connections. For agents, expose the exhausted deadline as a structured outcome—`transient_failure`, attempts used, and the last provider request ID—so the model can switch strategy or escalate instead of starting another hidden retry loop.

## Retry a class of failure, not every error

Connection resets, socket timeouts, throttling, and selected `5xx` responses are usually transient. Invalid arguments, failed authorization, missing resources, and business-rule rejection require a changed request or human action; repeating them only adds load. [Google Cloud's retry guidance](https://cloud.google.com/storage/docs/retry-strategy) makes the second gate explicit: even a transient response should be retried automatically only when the operation is idempotent or protected by a precondition.

Use exponential backoff with random jitter and a hard attempt/deadline cap. Backoff gives the dependency room to recover; jitter prevents thousands of workers from retrying on the same schedule and causing another outage. Honor `Retry-After` or provider-specific hints when present. Put the policy in the executor, not in the model prompt, so a hallucinated “try again” cannot bypass it.

## The ambiguous-success trap

The most dangerous failure is a timeout **after the server committed the write but before the client received the response**. From the agent's perspective the outcome is unknown. Retrying with a fresh request may duplicate the effect; refusing to retry may leave the task falsely reported as failed.

An idempotency key resolves that ambiguity. Generate one stable key for the logical action, persist it with the task or checkpoint, and reuse it on every replay. The service stores the first outcome and returns it for the same key. [Stripe's idempotent-request contract](https://docs.stripe.com/api/idempotent_requests) demonstrates the pattern: repeated create/update requests with the same key return the recorded result rather than performing the action again, while changed parameters are rejected.

If the provider has no native key, build deduplication at the tool boundary: store `(operation, target, idempotency_key) → outcome` before returning success, and query that record before executing a replay. Conditional writes and resource-version preconditions can make updates safely retryable too.

## What to record

For every attempt, capture the logical idempotency key, provider request ID, attempt number, error class, delay, elapsed deadline, and final disposition. That turns “the agent called the tool twice” from a mystery into an auditable decision—and lets evals inject timeout-after-commit failures to prove the duplicate-effect path is actually closed.

*Sources: [AWS Builders' Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) · [AWS Builders' Library — Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) · [Google Cloud — Retry strategy](https://cloud.google.com/storage/docs/retry-strategy) · [Stripe — Idempotent requests](https://docs.stripe.com/api/idempotent_requests).*

*Related: [tool use](/library/tool-use), [tool schema design](/library/tool-schema-design), [durable agent execution](/library/durable-agent-execution), [rate limiting & backpressure](/library/rate-limiting-backpressure).*
