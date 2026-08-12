---
id: lesson-knight-capital-deploy
title: "Deploy discipline: dormant code + partial rollout can be catastrophic"
url: https://en.wikipedia.org/wiki/Knight_Capital_Group
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [deploy, rollout, feature-flags, risk]
---

Knight Capital lost ~$440M in 45 minutes in 2012 after a deploy left an old, repurposed feature flag enabling long-dormant code on some servers but not others. Lesson: never leave dead code reachable, and roll changes out uniformly with kill-switches. For agents: version and feature-flag tool rollouts, remove dormant tool paths an agent could trigger, and make a bad rollout instantly reversible.

## Deep dive

Knight Capital is usually told as a deploy story, and the deploy is the least interesting part. What made it a $440M event in 45 minutes was that **the system had no way to be wrong slowly** — no partial exposure, no kill switch, and no answer to "which version is actually running where?" Agents inherit every one of those properties by default, and one more besides.

## Dormant code is not dead code

The [failure](https://en.wikipedia.org/wiki/Knight_Capital_Group) was not a bug in new code. It was old code — a years-dormant routine — reachable again because a flag was *repurposed* rather than retired, and one of eight servers never received the update. The new meaning of the flag turned the old routine on. Nothing was broken until something else changed.

For agents this maps almost too neatly. A **tool left registered but no longer intended** is exactly that dormant routine: the model reads the tool table, not your intentions, and it will call the thing that looks applicable. A deprecated tool whose description still reads plausibly is one confused turn away from executing. So retire, don't orphan — remove the tool from the table rather than leaving it hidden behind a prompt instruction not to use it, because a prompt is a request and a registration is a capability. The same goes for a [schema](/library/tool-schema-design) that still accepts a parameter the handler no longer honours: the model will supply it and believe it did something.

## "Which version is running where" must have an answer

Eight servers, seven updated, and no mechanism that noticed. The deploy reported success. For an agent fleet the equivalent question is harder than it looks, because behaviour is spread across things that version independently: the model snapshot, the prompt, the tool schemas, the retrieval index, and the code. A partial rollout can leave a new prompt talking to an old tool contract, which is not a crash — it is an agent confidently doing the wrong thing, and it will look like a quality problem rather than a deploy problem.

This is why version pinning is a *safety* control and not a tidiness one, and why [observability](/library/agent-observability) has to record the resolved versions with each run rather than just the outcome. If a bad hour cannot be attributed to a specific combination, you cannot roll it back — you can only guess. Related and easy to miss: a long-running process holds the code it loaded at start, so "deployed" and "running" drift silently. A fleet where nothing has restarted is not a fleet running your latest change.

## Make being wrong survivable

Knight had 45 minutes of unbounded loss because nothing stopped it. Agents act in loops, which means a wrong decision does not happen once — it happens repeatedly, quickly, until something intervenes. The controls that matter are therefore the boring ones: a **kill switch** that disables a tool or the whole loop without a deploy; **[rate limits and backpressure](/library/rate-limiting-backpressure)** so a runaway loop hits a ceiling rather than a bill; **[human approval](/library/human-approval-gates)** on the irreversible actions specifically, since those are the ones you cannot walk back; and staged exposure so a mistake reaches a fraction of traffic first.

Note what none of those require: knowing in advance what will go wrong. That is the actual lesson. Knight's engineers were not stupid and did not lack tests — they lacked a way to *limit the blast radius of being wrong*, which is a different engineering problem from being right, and the only one that scales to systems that act on their own.

*Sources: [Knight Capital Group — public record of the 2012 trading incident](https://en.wikipedia.org/wiki/Knight_Capital_Group).*

*Related: [tool schema design](/library/tool-schema-design), [human approval gates](/library/human-approval-gates), [rate limiting and backpressure](/library/rate-limiting-backpressure), [agent observability](/library/agent-observability), [guardrails and safety](/library/guardrails-safety), [deploying agents on serverless infrastructure](/library/agent-deployment).*
