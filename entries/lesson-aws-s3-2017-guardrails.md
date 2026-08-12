---
id: lesson-aws-s3-2017-guardrails
title: "Guardrails on destructive commands limit blast radius"
url: https://aws.amazon.com/message/41926/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [guardrails, destructive-ops, blast-radius, tools]
---

The 2017 AWS S3 outage began when an engineer ran a debugging command with a mistyped parameter that removed far more capacity than intended, cascading across dependent systems. Lesson: destructive operations need typed inputs, confirmation, and limits on how much they can affect at once. For agents: tools that delete/modify state must have typed args, dry-run/confirm modes, and blast-radius caps — an agent should never be able to wipe more than a bounded scope in one call.

## Deep dive

The S3 incident is a rare post-mortem where the fix AWS shipped is more instructive than the failure. An engineer ran an established playbook command with one parameter wrong, and it removed far more capacity than intended. The correction was not "be more careful" or "require two engineers" — it was to **make the tool incapable of removing that much at once**. That distinction is the entire lesson, and it is the one agent tool design gets wrong most often.

## The tool, not the operator, is where the limit belongs

[AWS's own account](https://aws.amazon.com/message/41926/) is explicit: the tooling was changed to remove capacity more slowly and to **refuse to drop below minimum capacity levels**. The safety property was moved into the thing being called. Anything that depends on the caller being careful is not a guardrail — it is a hope, and it scales exactly as well as the caller's worst moment.

For agents this stops being a nicety, because the caller is a language model with no stake in the outcome and an unbounded willingness to retry. Every argument in your [tool schema](/library/tool-schema-design) is an attack surface against your own infrastructure, filled in by something that pattern-matched its way to a plausible value. A `delete(scope)` that will happily accept `scope="*"` is not protected by a description saying "use narrow scopes" — descriptions are advisory and arguments are executable. The model reads the same string a careful engineer does and draws a different conclusion about what is reasonable.

## Three properties, in order of how much they save you

**Typed and bounded arguments** come first, because they eliminate whole classes rather than catching instances. An enum cannot be mistyped into something catastrophic; a max-N cap makes "delete everything" unrepresentable rather than merely discouraged. Prefer making the dangerous call *impossible to express* over detecting it later — a validation that runs after the model has chosen is strictly weaker than a type that never let it choose.

**Dry-run by default** is next, and it is underrated because it converts an irreversible action into a reviewable proposal. A tool that returns "this would affect 4,812 objects" before doing anything gives both the model and any [human gate](/library/human-approval-gates) a number to react to — and a count wildly larger than intended is exactly the signal that catches a mistyped parameter, which no amount of reading the command would have.

**Blast-radius caps** come last but are the ones that actually bound the loss. AWS's fix was a floor: the tool cannot take capacity below a minimum, full stop. The agent equivalent is a per-call ceiling *and* a per-run budget, because an agent that cannot delete more than 100 at once will simply call it fifty times — a serial loop reaching the same total the single call was blocked from. Cap the call and the session, or you have moved the problem rather than solved it.

## Why this matters more for agents than for engineers

A human who mistypes a command usually notices something is wrong and stops. An agent in a loop does not: it observes an unexpected result, forms a new hypothesis, and acts again — often faster, and sometimes *more* destructively as it tries to "fix" what it just did. The recovery instinct is the dangerous part. So pair the caps with [observability](/library/agent-observability) that records the resolved arguments, not just the tool name, and with [rate limits](/library/rate-limiting-backpressure) that make a runaway sequence hit a wall. The goal is not an agent that never errs; it is an infrastructure where its worst single call, and its worst hour, are both survivable.

*Sources: [AWS — Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/41926/).*

*Related: [tool schema design](/library/tool-schema-design), [human approval gates](/library/human-approval-gates), [guardrails and safety](/library/guardrails-safety), [rate limiting and backpressure](/library/rate-limiting-backpressure), [agent observability](/library/agent-observability), [tool retries and idempotency](/library/tool-retries-idempotency).*
