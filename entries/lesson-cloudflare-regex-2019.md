---
id: lesson-cloudflare-regex-2019
title: "Unbounded work will exhaust the system"
url: https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [resource-limits, runaway, loops, budgets]
---

In 2019 a single regular expression with catastrophic backtracking consumed CPU globally and took Cloudflare offline. Lesson: any operation without an explicit bound can consume all resources. For agents: cap loop iterations, token budgets, tool-call counts, and wall-clock per task — a runaway agent loop is the same failure mode as an unbounded regex, and needs the same hard ceilings.

## Deep dive

One regex. Not a bad deploy, not a security breach — a pattern with a nested quantifier that, on the wrong input, does exponential work. It went out as part of a routine managed-rules update and consumed CPU across the global fleet. The instructive part is that **nothing in the system was wrong except the absence of a ceiling**, and that is the property agents share most directly.

## Unbounded is a property of the operation, not the input

Catastrophic backtracking is not a rare input hitting a fragile pattern; it is a pattern whose worst case was always exponential, meeting an input that finally explored it. The pattern had presumably run correctly millions of times. **Correct-on-observed-inputs tells you nothing about the bound**, and the bound is the only thing that governs the worst case.

Agent loops have exactly this shape. A loop that reads a result, forms a hypothesis, and acts again has no intrinsic terminator — it stops when the model decides it is done, which is a *behavioural* property, not a structural one. It usually converges in three steps. Nothing about "usually three" limits it to thirty, or to three hundred while burning tokens and calling tools. The absence of a bound is not visible in any run that happened to terminate.

So the useful question is not "does it terminate?" but **"what stops it if it doesn't?"** — and the answer must be a number in the code, not a property of the model's judgement.

## Four independent ceilings, because they fail differently

A runaway needs bounding on every axis it can consume, and one cap does not imply the others:

- **Iterations** — a hard maximum on loop turns. The cheapest and most often missing.
- **Tokens** — a per-task budget. Iteration caps do not bound this; one turn can carry an enormous context.
- **Tool calls** — separately capped, because a single turn can fan out, and because tool calls are what touch the world. This is where an unbounded loop stops being expensive and starts being *destructive* — see [blast-radius caps](/library/lesson-aws-s3-2017-guardrails), where the same "cap the call and the session" distinction applies.
- **Wall-clock** — the backstop that catches what the other three miss, including a loop that is slow rather than numerous, or blocked on something that never returns.

Each catches a failure the others let through. And all four should **fail closed**: on hitting a ceiling, stop and surface, never silently continue with a raised limit.

## The bound must be outside the thing being bounded

Cloudflare's fix was not "write better regexes" — it was a CPU limit on rule execution, plus a staged rollout so a bad pattern reaches a fraction of traffic first. Both are external to the pattern.

The agent equivalent matters because the tempting version is internal: instructing the model to "stop after a few attempts". That is the same category error as [a prompt-based guardrail](/library/lesson-therac-25) — the thing you are asking to enforce the limit is the thing that has already failed when the limit is needed. A model looping unproductively is, by construction, a model whose judgement about when to stop is not working. The ceiling has to live in the harness, where it holds regardless of what the model concludes.

Pair the ceilings with [observability](/library/agent-observability) that records *which* ceiling fired. "Task stopped" is not diagnostic; "hit the 40-call tool cap at turn 12" tells you whether you have a bug, a bad task, or a limit set too low — three very different fixes that look identical from the outside.

*Sources: Cloudflare's public post-mortem of the 2019-07-02 global outage.*

*Related: [rate limiting and backpressure](/library/rate-limiting-backpressure), [agent cost control](/library/agent-cost-control), [guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails), [Therac-25 and independent safety layers](/library/lesson-therac-25), [agent observability](/library/agent-observability), [human approval gates](/library/human-approval-gates).*
