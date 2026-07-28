---
id: latency-streaming
title: "Latency and streaming agent results"
url: https://developers.openai.com/api/docs/guides/latency-optimization
category: evaluation
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [latency, streaming, results, optimize, both]
---

Optimize both time to first useful feedback and total task time: stream text or structured progress, acknowledge long-running work immediately, and expose tool status without leaking private reasoning. Parallelize independent retrievals or tool calls, prefetch predictable context, cache stable prefixes, and avoid serial model calls that code could replace. Streaming improves perceived speed but does not reduce completion latency by itself, so preserve cancellation, backpressure, and a final authoritative result distinct from partial output.

## Deep dive

Agent latency is two different metrics wearing one name: **time to first useful feedback** (does the user know something is happening?) and **total task time** (when is it actually done?). Users forgive a slow task that talks; they abandon a fast one that goes silent for forty seconds. Optimize both, but never confuse them — streaming fixes the first and does *nothing* for the second.

## Cutting real latency

[OpenAI's latency-optimization guide](https://platform.openai.com/docs/guides/latency-optimization) organizes the levers well, and they map directly onto agent loops:

1. **Fewer serial model calls.** Every hop in a chain is a full round-trip. Collapse plan-then-act pairs where the plan is trivial, and never use a model call for what a regex or a join could do — the guide's "use fewer tokens / make fewer requests" advice is doubly true when each request feeds the next.
2. **Parallelize the independent.** Retrievals, tool calls, and subagent fan-outs that don't depend on each other should run concurrently; an agent that awaits three searches serially triples its own latency.
3. **Cache the stable prefix.** System prompt + tool definitions re-sent every turn are exactly what [prompt caching](/library/prompt-caching) exists for — cache reads cut both cost and time-to-first-token on every subsequent call.
4. **Prefetch the predictable.** If step 3 always needs the user's calendar, start fetching it during step 2's model call, not after.
5. **Right-size the model.** Routing classification and extraction to a small fast model, reserving the frontier model for the hard reasoning steps, is often the single biggest total-time win.

## Streaming as UX, honestly

Stream tokens for prose and structured progress events for tool phases ("searching…", "3 files read") — [Anthropic's streaming docs](https://docs.claude.com/en/docs/build-with-claude/streaming) cover the event model, including streaming during tool use. Expose *status*, not private chain-of-thought. And keep three engineering invariants that streaming tempts you to drop:

- **Cancellation**: a user who sees the wrong direction at token 50 must be able to stop the run — and cancel any in-flight tool side effects safely (idempotency again).
- **Backpressure**: a consumer slower than the stream must not silently drop frames or balloon memory.
- **A final authoritative result**, distinct from the partial stream. Partial output is a preview; downstream systems consume only the committed final — otherwise a mid-stream disconnect becomes a half-acted-on answer.

## The agent-specific trap

Long-running agents also need **liveness signaling** at the task level: an immediate acknowledgment ("on it — this will take a few minutes"), progress at real milestones, and a completion notification. That's cheap to build and worth more perceived speed than any decoding optimization.

*Sources: [OpenAI — Latency optimization](https://platform.openai.com/docs/guides/latency-optimization) · [Anthropic — Streaming Messages](https://docs.claude.com/en/docs/build-with-claude/streaming).*

*Related: [prompt caching](/library/prompt-caching), [token budgets](/library/token-budgets), [multi-agent orchestration](/library/multi-agent-orchestration), [tool retries & idempotency](/library/tool-retries-idempotency).*
