---
id: multi-agent-orchestration
title: "Multi-agent orchestration tradeoffs"
url: https://www.anthropic.com/engineering/building-effective-agents
category: orchestration
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [multi, orchestration, tradeoffs, multiple, subtasks]
---

Use multiple agents when subtasks are genuinely independent, require distinct tools or context, or benefit from parallel search or review; a single agent is usually cheaper, faster, and easier to debug for sequential work. In the supervisor pattern, one coordinator decomposes the task, gives workers bounded contracts, and merges results, while handoffs must carry the goal, evidence, state, ownership, and completion criteria explicitly. Cap fan-out, recursion, and per-worker budgets because coordination messages, duplicated context, and synthesis can cost more than the useful work.
