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
