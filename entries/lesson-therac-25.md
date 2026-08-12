---
id: lesson-therac-25
title: "Concurrency bugs and removed safety interlocks are lethal"
url: https://en.wikipedia.org/wiki/Therac-25
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [safety, concurrency, interlocks, autonomy]
---

The Therac-25 radiation machine (1985–87) gave massive overdoses due to race conditions after hardware safety interlocks were replaced with software-only checks that had subtle timing bugs. Lesson: don't remove independent safety layers, and treat concurrency as a first-class hazard. For agents: keep human/hardware approval gates for high-consequence actions, and guard concurrent tool calls that share state — autonomy must not bypass the interlocks.

## Deep dive

Therac-25 is the canonical software-safety case, and the part most often skipped is *why* the earlier machines were safe. The Therac-6 and Therac-20 ran much of the same buggy software. They did not kill anyone, because a **hardware interlock** physically prevented the beam from firing in the wrong configuration. The bug was always there; the independent layer was what made it survivable. When that layer was removed on the grounds that software could do the job, the latent defect became lethal.

That is the lesson worth carrying into agent design, and it is not "test more."

## An independent layer is one that fails differently

The interlock's value was not that it was better than the software — it was that it failed for **different reasons**. Software checks and mechanical stops do not share a failure mode, so it takes two unrelated faults to get through. Replacing the mechanism with a second software check *inside the same system* looks like defence in depth and is not: both layers now die to the same bad state, the same race, the same deploy.

Agent architectures reproduce this error in a specific way. A guardrail implemented as **an instruction in the prompt** is not independent of the model — it shares the model's failure mode entirely, and the thing it is meant to catch (the model doing something unintended) is precisely the condition under which it stops working. A second model reviewing the first is better but still correlated: same training, similar blind spots, same [prompt injection](/library/prompt-injection-defense) in context if both read the untrusted input. The independent layers are the ones outside the model's control — a typed schema that cannot express the dangerous call, a rate limit, a [human approval gate](/library/human-approval-gates) on irreversible actions, a permission the credential simply does not carry. **Ask of any safety control: does it fail for a different reason than the thing it protects?**

## Concurrency is a first-class hazard, not a bug class

The Therac-25 overdoses needed a specific timing: an experienced operator editing the screen fast enough to change the beam configuration inside a window the software did not expect. Rare, and therefore invisible in testing and unreproducible when reported — the manufacturer initially could not replicate it, and that is a normal outcome for a race, not evidence of absence.

Agents now routinely run concurrent tool calls, parallel subagents, and background tasks over shared state — files, queues, claims, memory. That is the same hazard class, arriving by default rather than by choice. Two subagents editing one file, or a retried step racing its own earlier attempt, is a Therac-shaped bug: correct in isolation, wrong on timing. It is why [idempotency](/library/tool-retries-idempotency) and atomic claim protocols matter more than they seem, and why "I ran it and it worked" is weak evidence for anything concurrent — you sampled one interleaving out of many.

## Autonomy must not be the thing that removes the interlock

The decision that killed people was not a coding mistake; it was an *architectural* one, made for good-sounding reasons — the software was capable, the hardware was expensive and redundant. Every argument for removing a human gate from an agent workflow has the same shape: the agent is reliable now, the approval is slow, it usually just clicks yes.

The counter is that gates are not priced on the common case. They exist for the run where the model is confidently wrong, which by construction looks exactly like the runs where it was right. Keep the gate on the irreversible actions specifically — sends, deletes, payments, deploys — and let autonomy expand everywhere the mistake is cheap. That distinction is what makes an agent both fast and survivable, and it does not require predicting which run goes wrong.

*Sources: public record of the Therac-25 accidents (1985–87) and the subsequent Leveson–Turner investigation.*

*Related: [human approval gates](/library/human-approval-gates), [guardrails and safety](/library/guardrails-safety), [tool retries and idempotency](/library/tool-retries-idempotency), [prompt injection defense](/library/prompt-injection-defense), [tool schema design](/library/tool-schema-design), [guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails).*
