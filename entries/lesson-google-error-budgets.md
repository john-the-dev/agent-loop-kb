---
id: lesson-google-error-budgets
title: "Error budgets balance reliability against velocity"
url: https://sre.google/sre-book/embracing-risk/
category: lessons
source_type: retrospective
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; primary source is Google's SRE book, Embracing Risk"
tags: [reliability, slo, error-budget, evaluation]
---

Google's SRE practice sets an availability target, treats the gap below 100% as a spendable error budget, and ties release velocity to whether the budget is intact. Lesson: reliability and speed are one shared quantity, not opposing camps. For agents: set an explicit task-success target, treat the shortfall as budget, and gate expansions of autonomy on having budget left.

## Deep dive

The error budget is one of the few operational ideas that changes an argument into an arithmetic, and that is its entire value. Google's [Embracing Risk](https://sre.google/sre-book/embracing-risk/) chapter lays it out: pick a reliability target below 100%, and the difference is a **budget** the team may spend.

If a service targets 99.9% over a month, roughly 43 minutes of unavailability is not a failure — it is the allowance. Spend it on risky deploys, migrations, experiments. Spend it all, and the rule bites: **feature work stops and reliability work starts** until the budget recovers.

## Why 100% is the wrong target

Stated plainly, because it sounds wrong at first: **an availability target of 100% is always incorrect.** It is unachievable, and pursuing it produces worse outcomes than aiming lower. Users cannot perceive the difference between 99.99% and 100% — their own network, device and ISP contribute more unreliability than that gap. So the last increment costs enormously and delivers nothing anyone experiences.

Once the target is below 100%, the remainder is not "failure we tolerate." It is a *resource*, and resources get allocated deliberately.

## The organisational trick

The mechanism's real work is on incentives. Traditionally ops is rewarded for stability and dev for shipping, so the two argue, and the argument is settled by whoever is more senior or more recently burned.

The error budget dissolves that. There is one number both sides read. Budget remaining means ship — ops cannot object on a feeling. Budget exhausted means stop — dev cannot override on a deadline. **Both teams now want the same thing**, because the way to earn more shipping room is to make the system more reliable.

The subtle part: an *unspent* budget is also a signal. A team that never uses its budget is being too cautious and could be moving faster. The budget is a target to spend, not a limit to avoid.

## The agent translation

Agent systems need this more than conventional services, because "correct" is not binary and the temptation to chase perfection is stronger.

- **The target is task success, not uptime.** Availability barely matters for an agent; what matters is *the fraction of tasks completed correctly without human rescue*. Set that explicitly — 95% on a defined task distribution — and the remaining 5% is budget.
- **100% task success is the same error, worse.** An agent that never errs is either trivially scoped or lying about its scope. Demanding it produces a system that refuses everything uncertain, which users experience as useless rather than safe.
- **Spend the budget on autonomy.** This is the sharpest mapping. Every expansion — a new tool, acting without confirmation, a longer horizon — is a risky deploy. Gate them on budget: success rate above target, expand scope; below, roll autonomy back and fix quality first. That gives you a principled answer to "should the agent be allowed to do X yet," which teams otherwise settle by vibes.
- **Measure rescue rate, not just failures.** A task the human silently corrected did not succeed. If your metric only counts explicit errors, your budget is fiction — and this is the most common way agent metrics flatter themselves.
- **Different budgets for different blast radii.** Drafting a summary and sending an email do not deserve the same target. Tie the budget to reversibility.

## What to actually build

**Write the SLO down with its task distribution attached.** "95% success" is meaningless without "on these tasks." The distribution is half the definition, and it must come from real traffic.

**Instrument rescue and abandonment**, not just thrown errors. Those are your real failures and they are invisible to exception counting.

**Make the budget visible and current.** A number computed quarterly changes no decisions. It has to be checkable at the moment someone proposes widening a permission.

**Write the policy before you need it** — what happens at exhaustion, who can override, what "reliability work" means concretely. Agreeing the rule while the budget is healthy is what makes it hold when it is not.

## The test

Ask: **what is your agent's acceptable failure rate, and who agreed to it?** If the answer is "it should just work," you have no budget — which means every incident is a crisis and every expansion of autonomy is decided by argument rather than evidence.

Related: [Evaluation strategy](/library/evaluation-strategy), [Avoid big-bang launches](/library/lesson-healthcaregov-2013), [Inject failure deliberately](/library/lesson-netflix-chaos), [Controlling agent cost](/library/agent-cost-control).
