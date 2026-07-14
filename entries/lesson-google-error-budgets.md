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
