---
id: lesson-gitlab-2017-backups
title: "Test your recovery, not just your backups"
url: https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/
category: lessons
source_type: post-mortem
status: current
grade: A   # timeless, widely-documented public engineering lesson
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Public post-mortem/record; well-documented, durable lesson (verified 2026-07-14)"
tags: [backups, recovery, state, memory]
---

In 2017 GitLab lost production data when a tired engineer removed a directory on the wrong host, then discovered that five separate backup/replication methods had silently been failing. Lesson: an untested backup is not a backup. For agents: verify that agent memory/state can actually be restored, and snapshot state before any destructive agent action so a bad step is recoverable.
