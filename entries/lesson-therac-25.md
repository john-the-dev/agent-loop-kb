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
