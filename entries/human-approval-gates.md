---
id: human-approval-gates
title: "Human approval gates for high-stakes actions"
url: https://www.anthropic.com/research/trustworthy-agents
category: general
source_type: research
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [human, approval, gates, high, stakes]
---

Place approval gates immediately before consequential actions such as sending messages, moving money, changing production, deleting data, or releasing regulated decisions, rather than asking once at session start. The approval view should show the exact proposed action, target, material parameters, evidence, uncertainty, and reversible alternatives; any later parameter change invalidates the approval. Persist who approved what and when, support rejection and editing, and fail closed when the approver or policy service is unavailable.
