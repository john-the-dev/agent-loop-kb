---
id: durable-agent-execution
title: "Durable execution and checkpointing"
url: https://docs.temporal.io/evaluate/understanding-temporal
category: tools
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, h1 'Understanding Temporal'; on-page counts workflow x41, durable execution x7, replay x3 — the page genuinely covers the entry's subject"
  - "CAVEAT driving B not A: Temporal is ONE implementation of durable execution. The entry argues the pattern generally — checkpointing, replay-safety, idempotent side effects — and a single vendor's evaluate-page cannot establish the general case"
  - "METHOD NOTE: this page returns an EMPTY <title> AND an empty og:title; the identifying text is in the h1 and body. Third source in this PR where an empty title meant the probe was wrong rather than the page being opaque"
tags: [durable, execution, checkpointing, long, running]
---

Long-running agents should execute as resumable state machines whose durable checkpoint records the current step, validated state, completed side effects, pending approvals, retry counters, and versioned inputs. Use an outbox or equivalent transactional pattern when a state update and external message must agree, and assign idempotency keys so crash recovery can safely replay a step. Define terminal states, cancellation and compensation paths, and migration behavior for runs that outlive a prompt, model, tool, or schema deployment.

## Deep dive

An agent that runs for hours — booking travel, migrating a codebase, working a support queue — will eventually be interrupted mid-flight: the process is redeployed, the machine reboots, the model call times out. What happens next separates a toy from a system. A durable agent resumes exactly where it left off, having neither forgotten its commitments nor repeated the side effects it already performed. That property doesn't come from the model; it comes from treating the run as a **resumable state machine** with a durable checkpoint.

## The checkpoint is the contract

The checkpoint is what survives a crash, so its contents define what "resume" can mean. A useful one records: the current step, the validated state so far, **which side effects have completed** (the email sent, the payment charged), pending approvals, retry counters, and the versioned inputs the run started from. The load-bearing item is the completed-side-effects log — without it, recovery re-sends the email. Frameworks like [Temporal](https://docs.temporal.io/evaluate/understanding-temporal) build their whole model around this: application code is written as if it never fails, and the platform persists every step's result so a replay skips work already done.

## The two-generals problem, in miniature

The hardest case is when a state update and an external action must agree: you charged the card AND you must record that you charged it. If the process dies between the two, recovery either double-charges or forgets. The classic fix is the **transactional outbox**: write "charge intended" to your own store in the same transaction as the rest of the state, then a separate deliverer performs the external call and marks it done — so the intent and the record can never disagree, and a redelivery is detectable. [Microsoft's outbox guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/transactional-outbox-cosmos) documents the pattern for exactly this durability gap.

## Idempotency makes replay safe

Durable execution *replays* steps after a crash, so every step with an external effect needs an **idempotency key** — a stable id the downstream system uses to collapse duplicate requests into one. This is the same discipline as [tool retries and idempotency](/library/tool-retries-idempotency), applied at the checkpoint boundary: assign the key when the step is first attempted, persist it in the checkpoint, and reuse it on replay so the second attempt is a no-op at the destination rather than a second charge.

## Runs that outlive their own software

A run measured in hours or days will outlive a prompt tweak, a model swap, a tool signature change, or a schema migration. That makes **versioning** a first-class concern: pin the run to the versions it started with, and define explicit migration behavior for in-flight runs when you deploy a change — pause-and-drain, or a compatibility shim — rather than letting a redeploy silently change the rules mid-run (the [Knight Capital](/library/lesson-knight-capital-deploy) failure mode). And define the boring-but-critical edges up front: terminal states, cancellation, and compensation (the saga-style "undo" for steps that can't be rolled back), so a run that must stop can stop cleanly instead of stranding half-finished side effects.

*Sources: [Temporal — Understanding durable execution](https://docs.temporal.io/evaluate/understanding-temporal) · [Microsoft — Transactional outbox](https://learn.microsoft.com/en-us/azure/architecture/best-practices/transactional-outbox-cosmos).*

*Related: [tool retries & idempotency](/library/tool-retries-idempotency), [planning & decomposition](/library/planning-decomposition), [agent memory tiers](/library/agent-memory-tiers), [the Knight Capital deploy lesson](/library/lesson-knight-capital-deploy).*
