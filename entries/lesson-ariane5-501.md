---
id: lesson-ariane5-501
title: "Reuse code only after re-validating its assumptions"
url: https://en.wikipedia.org/wiki/Ariane_flight_V88
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [code-reuse, assumptions, overflow, regression]
---

Ariane 5's maiden flight was destroyed in 1996 when inertial-reference software reused from the slower Ariane 4 hit an unhandled overflow under the new rocket's higher values. Lesson: reused components carry hidden assumptions from their original context. For agents: prompts, tools, and sub-agents reused in a new task carry old assumptions — re-test them in the new context instead of assuming they still hold.
