---
id: agent-evals
title: "Agent evaluation pitfalls"
url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [evaluation, pitfalls, evaluations, should, separate]
---

Agent evaluations should separate model quality from scaffold, tool, and environment failures. Single-run pass rates hide nondeterminism, while overly short time or token limits can misclassify capable agents. Use repeated trials, inspect trajectories, score intermediate outcomes, and test realistic failure recovery.
