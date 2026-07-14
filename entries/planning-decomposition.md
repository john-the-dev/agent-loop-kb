---
id: planning-decomposition
title: "Planning and task decomposition"
url: https://arxiv.org/abs/2210.03629
category: general
source_type: paper
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [planning, decomposition, react, interleaves, reasoning]
---

ReAct interleaves reasoning, actions, and observations so the agent can revise its approach from environmental feedback; plan-then-execute first creates a task graph and is better when dependencies and approval points must be visible. Decompose work into verifiable steps with explicit inputs, outputs, dependencies, and stopping conditions, then replan when observations invalidate assumptions rather than blindly following the original plan. Reflection can improve a failed attempt, but bound reflection rounds and require new evidence or a changed action to prevent expensive self-critique loops.
