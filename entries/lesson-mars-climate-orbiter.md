---
id: lesson-mars-climate-orbiter
title: "Interface contracts: mismatched units/schemas cause silent disaster"
url: https://en.wikipedia.org/wiki/Mars_Climate_Orbiter
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [interfaces, schemas, validation, tools]
---

NASA lost the Mars Climate Orbiter in 1999 because one team produced output in imperial units while another consumed it as metric; the mismatch was never validated at the boundary. Lesson: every interface needs an enforced, typed contract. For agents: define strict tool schemas and validate types/units/formats at the tool boundary — never trust that the model and the tool agree on shape implicitly.
