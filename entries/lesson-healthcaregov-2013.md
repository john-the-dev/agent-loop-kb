---
id: lesson-healthcaregov-2013
title: "Avoid big-bang launches; roll out incrementally"
url: https://en.wikipedia.org/wiki/HealthCare.gov
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-08-12
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
  - "Expanded to a full deep dive 2026-08-12; extensively documented in US government oversight reporting"
tags: [rollout, canary, launch, load]
---

HealthCare.gov's 2013 launch failed publicly: a big-bang release of an integrated system that had never been tested end-to-end at anything near real volume. Lesson: launch incrementally, test at realistic load, and give someone end-to-end ownership. For agents: roll new capabilities to a fraction of traffic, test with production-shaped inputs, and never let a mandatory gate sit in front of every user.

## Deep dive

HealthCare.gov opened on 1 October 2013 and essentially did not work. The widely-reported figure for completed enrolments on day one is single digits. It became functional over the following two months under an emergency effort — which is itself the most useful part of the story, because it demonstrates the system was buildable. The launch failed, not the design.

Three things are worth separating, because they are independent and each is a decision, not an accident.

## It was a big-bang launch of a system nobody had run whole

The site integrated many components built by different contractors, plus live connections to external verification systems. Integration testing happened late and was never completed at anything like production scale. On launch day, the first time the assembled system met real traffic was **in front of every user in the country at once**.

There was no fraction — no state-by-state phasing, no percentage rollout, no early-access cohort. The choice was binary and the failure was therefore total. A canary does not make you correct; it makes the first failure small enough to learn from.

## Load testing was performed against a fantasy

Testing used volumes far below what was plausible for a national launch with a deadline-driven signup surge. The system passed its tests. The tests were the problem.

This is worth stating precisely, because "we load tested" is a claim people make and believe: **a load test at the wrong scale is not weak evidence, it is misleading evidence.** It produces a green result that actively supports a wrong conclusion. Untested would have been more honest, because nobody would have felt reassured.

## A mandatory gate in front of everything

An architectural decision made late required users to create an account and be identity-verified *before* they could browse plans. Every visitor — including the merely curious — was funnelled through the heaviest, most dependency-laden path in the system before reaching anything of value.

That turned a browsing workload into an authentication-and-verification workload, multiplied by everyone. Part of the eventual fix was letting people look before signing up.

## The agent translation

- **Big-bang capability launches.** Enabling a new tool, a new model, or autonomous execution for *all* traffic at once is the same shape. Ship it to 1%, keep a config-only kill switch, and expand on evidence.
- **Evaluating on a fantasy distribution.** This is the load-test failure, and it is endemic to agent work. A curated eval set of clean, well-formed, representative-looking tasks is the 10%-volume load test: it passes, and it tells you nothing about the messy, adversarial, truncated, multi-lingual, contradictory inputs production will supply. **Your eval set should be sampled from real traffic, not written by the team that built the agent.**
- **A mandatory heavy gate.** An agent architecture where every request — however trivial — first performs a full retrieval, a planning pass, and three tool calls is the account-creation bottleneck. Most requests do not need the expensive path. Route cheap things cheaply; reserve the heavy pipeline for what needs it.
- **Diffuse ownership.** Nobody owned HealthCare.gov end to end. Multi-agent systems recreate this structurally: each sub-agent is individually fine, and no component is responsible for whether the *user's* outcome was good. Somebody must own the end-to-end trace.

## What to actually build

**Make the rollout a dial, not a switch** — percentage of traffic, per-cohort, reversible without a deploy.

**Build the eval set from production traffic**, including the failures, the malformed inputs and the tasks users abandoned. Refresh it on a schedule; a set frozen at launch describes a distribution that no longer exists.

**Load-test with realistic concurrency and realistic payloads.** For agents that means long contexts, parallel tool calls and provider rate limits — not one clean request in a quiet loop.

**Put a fast path in front of the expensive path.** Classify cheaply, then escalate. Every request paying the worst-case cost is a bottleneck that only appears under load.

**Name an owner for the end-to-end outcome**, distinct from the owners of the parts.

## The test

Ask: **the first time this meets real traffic, what fraction of users experiences it?** If the answer is "all of them," you have the HealthCare.gov shape — and the second question is what your rollback looks like at that scale.

Related: [Deploy discipline](/library/lesson-knight-capital-deploy), [Evaluation strategy](/library/evaluation-strategy), [Unbounded work will exhaust the system](/library/lesson-cloudflare-regex-2019), [Error budgets](/library/lesson-google-error-budgets).
