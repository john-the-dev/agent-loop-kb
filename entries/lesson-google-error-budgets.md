---
id: lesson-google-error-budgets
title: "Error budgets balance reliability against velocity"
url: https://sre.google/sre-book/embracing-risk/
category: lessons
source_type: retrospective
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [reliability, slo, error-budget, evaluation]
---

Google SRE popularized the error budget: 100% reliability is the wrong target; you set an allowed failure rate, and while you're within budget you ship features, when you exceed it you stop and harden. Lesson: make the reliability-vs-speed tradeoff explicit and measurable. For agents: define an acceptable task-failure rate and let it gate whether you ship new capabilities or spend the cycle hardening the loop.

## Deep dive

The error budget is usually taught as a reliability tool. Its more useful property is political: it **settles the ship-versus-harden argument before anyone is having it**, using a number both sides agreed to while calm. That matters more for agents than for services, because agents fail in ways that are easy to argue about.

## The target is not 100%, and saying so out loud is the point

Google SRE's move was to name an allowed failure rate — 99.9%, say — and treat the remaining 0.1% as a *budget to spend*. Under budget, ship. Over budget, stop shipping and harden until you are back under. The reliability target stops being an aspiration nobody can act on and becomes a switch with two positions.

The agent version needs one extra decision first: **what counts as a failure?** For a service, a 500 is unambiguous. An agent can produce a wrong answer confidently, do the right thing by a route you did not intend, half-complete a task, or succeed while burning ten times the expected budget. None of those throws. So the budget is only as meaningful as the failure definition underneath it, which has to be specific enough to count without argument — task not completed, wrong tool called, human had to intervene, [approval gate](/library/human-approval-gates) rejected the action. Vague definitions produce a budget that is never exceeded because nothing qualifies.

## What makes it work is that it is agreed in advance

The reason to set a budget *before* trouble is that the argument during an incident is unwinnable. Every individual failure has a plausible story — bad input, unusual phrasing, a flaky tool — and a series of individually-excusable failures is exactly what a systemic problem looks like from the inside. A budget converts "was that one bad?" into "are we over?", which is a question with an answer.

For agents this has a sharper edge: **the failures you argue about are correlated with the failures that matter.** An agent that quietly does the wrong thing produces no error, no alert, and a plausible transcript — see [observability](/library/agent-observability), where the whole difficulty is that a confident wrong action looks like a successful one. If your failure count comes only from crashes, your budget is measuring the least interesting failure mode you have.

## Spending it is the feature, not the leak

The part teams skip is that being *under* budget is also information: it means you are being too conservative and could ship faster, take more risk, expand autonomy. A budget consistently unspent is a signal that the gates are tighter than the actual failure rate justifies — the same reasoning that says [approval gates](/library/human-approval-gates) belong on irreversible actions rather than everything.

So the loop is: define failure concretely, measure it against your real task distribution with an [evaluation suite](/library/agent-evals) rather than impressions, and let the number decide the cycle. Over budget, spend it on [guardrails](/library/guardrails-safety), retries, [bounded ceilings](/library/lesson-cloudflare-regex-2019). Under budget for a while, widen what the agent may do unattended. Neither decision then depends on whose intuition is loudest that week — which is the actual contribution, and the reason it survived contact with real engineering organisations.

*Sources: Google SRE Book — error budgets and the reliability/velocity tradeoff.*

*Related: [agent evaluation](/library/agent-evals), [evaluation strategy](/library/evaluation-strategy), [agent observability](/library/agent-observability), [human approval gates](/library/human-approval-gates), [guardrails and safety](/library/guardrails-safety), [unbounded operations](/library/lesson-cloudflare-regex-2019).*
