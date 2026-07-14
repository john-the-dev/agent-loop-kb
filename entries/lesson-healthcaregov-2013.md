---
id: lesson-healthcaregov-2013
title: "Avoid big-bang launches; roll out incrementally"
url: https://en.wikipedia.org/wiki/HealthCare.gov
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [rollout, canary, launch, load]
---

HealthCare.gov's 2013 launch failed under load because a large, integration-heavy system was flipped on for everyone at once with inadequate end-to-end testing. Lesson: stage rollouts and test the whole path under real load before a full cutover. For agents: canary new agent behaviors to a small slice of traffic, watch failure rates, and expand gradually rather than switching all users to a new loop at once.
