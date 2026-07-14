---
id: lesson-aws-s3-2017-guardrails
title: "Guardrails on destructive commands limit blast radius"
url: https://aws.amazon.com/message/41926/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [guardrails, destructive-ops, blast-radius, tools]
---

The 2017 AWS S3 outage began when an engineer ran a debugging command with a mistyped parameter that removed far more capacity than intended, cascading across dependent systems. Lesson: destructive operations need typed inputs, confirmation, and limits on how much they can affect at once. For agents: tools that delete/modify state must have typed args, dry-run/confirm modes, and blast-radius caps — an agent should never be able to wipe more than a bounded scope in one call.
