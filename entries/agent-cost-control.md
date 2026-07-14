---
id: agent-cost-control
title: "Cost control and token economics"
url: https://www.anthropic.com/engineering/building-effective-agents
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [cost, control, token, economics, measure]
---

Measure cost per completed task, not cost per model call, because cheap models can become expensive when they cause retries or long trajectories. Reduce repeated input with prompt caching, retrieve only relevant chunks, compact history, cap tool and reasoning loops, and route routine classification or extraction to smaller models while escalating difficult cases based on confidence or validation failure. Set per-run and per-tenant budgets and surface budget exhaustion as an explicit partial outcome rather than silently degrading quality.
