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

The mental model that prevents most serverless-agent bugs: **a function invocation is a lease, not a process.** You are borrowing compute that can be frozen, reused, duplicated, or destroyed between any two lines of your agent loop. Every correctness property has to live somewhere that survives that.

## What actually disappears

Serverless runtimes reuse execution environments when they can, which is what makes warm invocations fast — and what makes local state so seductive. The trap is that reuse is an *optimization*, never a guarantee:

- **In-process memory** survives *sometimes*. A conversation cached in a module-level dict will be there on the next call often enough to pass testing, and absent in production under scale-out.
- **Local scratch space** (`/tmp` on Lambda) is scoped to the execution environment. It persists across warm invocations of *that* environment — so it is a legitimate cache, and an illegitimate source of truth.
- **Background work after the response** is not guaranteed to run. The runtime may freeze the environment the moment you return. A "fire-and-forget" write to your database after responding is a write that sometimes does not happen.

Anything the agent must not lose — conversation state, plan/step position, checkpoints, idempotency records, pending approvals — belongs in a durable service before the invocation returns.

## Duration limits are an architecture constraint, not a tuning knob

[AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html) caps a single invocation at 15 minutes; other platforms cap CPU time or wall-clock more aggressively still. An agent loop that plans, calls five tools, retries two of them, and summarizes can exceed that on a bad day even when the median run takes twenty seconds.

The fix is not a longer timeout. It is to stop modelling the agent as one synchronous call:

1. **Decompose into resumable steps.** Each step reads state, does one unit of work, writes state, and enqueues the next step.
2. **Put a queue between steps.** The queue provides the retry semantics and the backpressure you would otherwise hand-roll.
3. **Make each step idempotent** — see below, because the queue will hand you the same message twice.

This is the same shape as durable execution engines, and if your workload justifies one, adopting it beats reimplementing it. But the decomposition matters more than the tool: a well-partitioned agent survives on plain queues, and a monolithic one fails on any runtime.

## At-least-once delivery makes idempotency mandatory

Queue-driven and asynchronous invocation paths retry on failure, and retries can also fire when the work *succeeded* but the acknowledgement was lost. So the agent will occasionally re-execute a step it already completed. If that step sent an email, charged a card, or posted a message, the retry is a duplicate side effect.

Persist an **idempotency record** keyed by a deterministic id derived from the work itself — not from a timestamp or a random id generated inside the invocation, both of which differ on the retry. Write the record in the same transaction as the effect where you can, and check it before acting where you cannot.

## Connections behave differently than in a long-lived server

Two limits collide. Serverless scales out to many small environments, and each one wants its own database connection; connection pools sized for a handful of application servers exhaust immediately under that fan-out. Meanwhile the *right* pattern within a single environment is the opposite — create the client once at module scope and reuse it across warm invocations, because per-invocation client construction pays TLS and auth setup on every call.

So: **reuse aggressively inside an environment, and put a proxy or serverless-native datastore in front of anything with a hard connection ceiling.**

## Cold starts are a latency budget line item

A cold start pays runtime initialization plus your module-level setup. Large dependency trees and eager client construction at import time both land directly on the user's first token. Practical levers, in order of usual payoff: trim the dependency graph, defer expensive client construction until first use, and keep model/tool schemas as data rather than code that must be parsed at import.

For interactive agents, the honest measure is p99 time-to-first-token including cold starts, not median warm latency — the cold path is exactly the one a returning user hits after an idle period.

## Pin everything that can change underneath you

An agent's behavior is a function of prompt, model, tool definitions, and output schema. All four drift independently, and a deployment that pins only the code pins none of the things that actually determine output. Version them explicitly and record the versions with each run, so a behavior regression can be attributed rather than guessed at. This is also what makes evaluation results meaningful across deploys — a score is only comparable against a known configuration.
