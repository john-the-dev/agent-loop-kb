---
id: lesson-aws-s3-2017-guardrails
title: "Guardrails on destructive commands limit blast radius"
url: https://aws.amazon.com/message/41926/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; primary source is AWS's own service-event summary"
tags: [guardrails, destructive-ops, blast-radius, tools]
---

The 2017 AWS S3 outage began when an engineer ran a debugging command with a mistyped parameter that removed far more capacity than intended, cascading across dependent systems. Lesson: destructive operations need typed inputs, confirmation, and limits on how much they can affect at once. For agents: tools that delete/modify state must have typed args, dry-run/confirm modes, and blast-radius caps — an agent should never be able to wipe more than a bounded scope in one call.

## Deep dive

On 28 February 2017 a large fraction of the web stopped working for several hours. The trigger, per [AWS's own summary of the event](https://aws.amazon.com/message/41926/), was an authorised engineer running an established playbook to remove a small number of servers from a billing subsystem — and mistyping one parameter, so the command removed a far larger set than intended.

What makes this the canonical guardrail case is not the typo. Typos are inevitable and unpreventable. It is that **a routine, approved operation was capable of removing an unbounded amount of capacity, and nothing between the intent and the effect asked whether the number was sane.**

## Four properties that turned a typo into an outage

**The command had no ceiling.** Removing *some* servers was legitimate; the tool did not distinguish "a few" from "most of them." The permission was binary — you may remove capacity — with no notion of how much.

**The removal was instantaneous.** All the capacity went at once. There was no rate limit that would have let a human or a monitor notice the effect and stop it partway.

**Recovery had never been exercised at that scale.** The affected subsystems required a full restart, and they had not been fully restarted in years. Their startup path — safety checks, metadata integrity — was correct but slow, and had never been measured under real load because nobody had needed it. The restart, not the removal, is where most of the hours went.

**The status dashboard depended on the thing that was down.** During the early part of the event AWS could not update its own health dashboard, because that dashboard's own hosting depended on S3 in the affected region. The observability plane shared a failure domain with the system it observed.

That last one generalises further than the others, and it is the one most often rebuilt from scratch by the next team.

## The agent translation

An agent with tools is a system where a **generated** parameter reaches a destructive operation. The engineer's typo is a stand-in for every way a model produces a wrong argument — a hallucinated path, a glob wider than intended, an off-by-one in a range, an ID from the wrong context window. You cannot prevent the wrong argument. You can prevent it from being *catastrophic*.

- **A confirmation prompt is not a guardrail.** It moves the decision to a human who has seen fifty of them today and is pattern-matching, not reading. If the answer to "are you sure?" is always yes, you have added latency, not safety.
- **The model asserting it will be careful is not a guardrail.** A system prompt saying "only delete the specific file" shares a failure domain with the thing it constrains — the same context that can be confused or injected into. Enforcement has to sit in the tool.
- **A guardrail is a rule the caller cannot influence**, evaluated at the point of effect, on the actual resolved arguments.

## What to actually build

**Bound the scope, not just the permission.** `delete(paths)` should refuse when `len(paths)` exceeds a cap, or when the resolved set exceeds a fraction of what exists. "You may delete" and "you may delete 40,000 things in one call" are different grants and should be expressed differently.

**Make the destructive verb take typed, narrow arguments.** Prefer explicit IDs over patterns. Where a pattern is unavoidable, resolve it first, show the resolved set, and cap it — the dangerous step is the expansion from glob to list, so that is where the check belongs.

**Default to dry-run for anything irreversible**, and make the agent's own second call the confirmation — with the resolved set echoed back, so a mismatch between intent and expansion is visible before it executes.

**Rate-limit the effect, not just the calls.** Deleting 10,000 items over ten minutes is recoverable in a way that deleting them in one second is not. A slow destructive path is an opportunity for a monitor, a human, or a health check to intervene.

**Keep the observability plane out of the blast radius.** Your agent's logs, traces, and health signals must not be written through the system the agent might break. If an agent can corrupt its own workspace, its audit trail cannot live only in that workspace — that is exactly when you need it most.

**Rehearse the recovery.** The S3 restart was slow because it had never been run at scale. If your agent's recovery path — replaying a task queue, rebuilding an index, restoring memory — has never been exercised, its duration is unknown, and you will be discovering it during an incident.

## The test

For every tool an agent can call, ask: **what is the worst single invocation, assuming the arguments are wrong in the most unhelpful way possible?** If the answer is unbounded, the tool is under-specified — regardless of how careful the prompt is, and regardless of the model's demonstrated behaviour so far.

Related: [Concurrency bugs and removed safety interlocks](/library/lesson-therac-25), [Unbounded work will exhaust the system](/library/lesson-cloudflare-regex-2019), [Prompt injection defense](/library/prompt-injection-defense), [Tool schema design](/library/tool-schema-design).
