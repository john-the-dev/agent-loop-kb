---
id: lesson-cloudflare-regex-2019
title: "Unbounded work will exhaust the system"
url: https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [resource-limits, runaway, loops, budgets]
---

In 2019 a single regular expression with catastrophic backtracking consumed CPU globally and took Cloudflare offline. Lesson: any operation without an explicit bound can consume all resources. For agents: cap loop iterations, token budgets, tool-call counts, and wall-clock per task — a runaway agent loop is the same failure mode as an unbounded regex, and needs the same hard ceilings.
