---
id: lesson-netflix-chaos
title: "Inject failure deliberately to build resilience"
url: https://netflix.github.io/chaosmonkey/
category: lessons
source_type: retrospective
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [chaos-engineering, resilience, testing, fault-injection]
---

Netflix's Chaos Monkey randomly kills production instances so the system is forced to tolerate failure as a normal condition rather than a rare emergency. Lesson: resilience comes from routinely exercising failure paths, not avoiding them. For agents: fault-inject dependencies — time out tools, return malformed tool output, drop context — and confirm the agent degrades gracefully instead of only testing the happy path.
