---
id: agent-deployment
title: "Deploying agents on serverless infrastructure"
url: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
category: memory
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [deploying, serverless, infrastructure, treat, workers]
---

Treat serverless agent workers as stateless and persist conversation state, plans, checkpoints, idempotency records, and pending approvals in durable services because instances can disappear or be retried at any time. Cold starts, execution-duration limits, connection limits, and burst concurrency make long agent loops better suited to queues plus resumable steps than one synchronous function invocation. Pin prompt, model, tool, and schema versions; reuse safe connections and cached clients within a warm instance, but never rely on local memory for correctness.

## Deep dive

"Stateless worker" is easy to agree with and hard to actually implement, because an agent loop *feels* stateful from the inside. It has a plan, a scratchpad, a half-finished tool call. Serverless makes that feeling expensive: the instance holding all of it can vanish between two steps, and the platform's answer to vanishing is to run your handler *again*.

## The retry is the design constraint, not an edge case

[AWS Lambda's guidance](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html) is blunt about separating handler logic from durable state and making functions idempotent, and for agents that has a sharper consequence than for ordinary request handlers: **an agent step usually has side effects that are not naturally idempotent** — it sent the email, opened the PR, charged the card. A retried request handler recomputes a response; a retried agent step can act on the world twice.

So the unit of durability is not the conversation, it is the *side effect*. Write an idempotency record **before** the effect and check it on entry, or make the effect itself carry a caller-supplied key the downstream service dedupes on. The failure everyone hits once is the crash *between* performing the effect and recording that it happened — a window you cannot eliminate, only shrink and then detect. Detecting it is why the marker matters more than the retry count: a per-effect marker tells a restarted worker "this already happened", where a counter only tells it "this is attempt three" and leaves it guessing.

## Long loops belong in queues, and claims need leases

Execution-duration limits and burst concurrency make a multi-step agent loop a poor fit for one synchronous invocation. Decompose into resumable steps behind a queue, with state in a [durable store](/library/durable-agent-execution) between them, so a timeout costs one step rather than the run.

The moment you have queued work and more than one worker, you need a **claim** — and a claim without a lease is a deadlock waiting to happen. If a worker claims an item and dies, that item must become available again; if a worker is merely *slow*, it must not be reaped out from under itself. The shape that works is a claim carrying a timestamp the holder **renews** while it is alive, plus a staleness window after which another worker may take it. Two properties are worth testing explicitly, because implementations usually get one and not both: a live renewing worker must **refuse** a competing claimer, and a dead one must **release** after the window. A claim protocol tested only in the happy direction cannot distinguish "renewal works" from "nothing is ever reaped", and the second failure is silent — work simply stops being picked up, forever, with no error anywhere.

## Pin the versions, and don't trust warm memory for correctness

A warm instance is a cache, never a source of truth. Reusing connections and clients inside one is good practice; letting a decision depend on something a previous invocation left in a module global is a bug that only appears under the *specific* traffic pattern that reuses that instance — which is to say, in production and not in your tests. Keep the prompt, model snapshot, tool schemas, and [structured output](/library/structured-outputs) contracts pinned and versioned alongside the code, so a replayed step reconstructs the same behaviour rather than whatever the current defaults happen to be. Pair that with [observability](/library/agent-observability) that records the step boundary, not just the run: when a retry doubles an effect, the thing you need in the log is which step re-entered and what marker it saw.

*Sources: [AWS Lambda — Best practices for working with Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html).*

*Related: [durable agent execution](/library/durable-agent-execution), [tool retries and idempotency](/library/tool-retries-idempotency), [rate limiting and backpressure](/library/rate-limiting-backpressure), [agent observability](/library/agent-observability), [structured outputs](/library/structured-outputs), [latency and streaming](/library/latency-streaming).*
