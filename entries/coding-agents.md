---
id: coding-agents
title: "Production coding agents"
url: https://arxiv.org/abs/2310.06770
category: security
source_type: paper
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, coding, should, work, isolated]
---

Coding agents should work in isolated, least-privilege sandboxes with repository-scoped credentials, network controls, resource limits, and explicit approval for destructive commands, secret access, or deployment. Use a test-driven loop: reproduce the failure, inspect relevant code, make a minimal diff, run targeted tests and static checks, then report evidence and remaining risk. Deliver reviewable patches rather than opaque rewrites, never weaken tests merely to pass, and protect the agent from prompt injection embedded in source files, issues, or dependency output.
