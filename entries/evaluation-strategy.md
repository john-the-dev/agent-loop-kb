---
id: evaluation-strategy
title: "Offline and online agent evaluation"
url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [offline, online, evaluation, evals, provide]
---

Offline evals provide repeatable pre-release regression tests over representative tasks, adversarial cases, tool failures, and multi-step trajectories; online evals measure real completion, escalation, latency, cost, and safety signals under production traffic. Maintain frozen golden sets plus newly mined failures, run repeated trials for nondeterministic agents, and score both final outcomes and critical intermediate constraints. LLM judges are scalable but can be biased by style, verbosity, ordering, or shared model errors, so calibrate them against blinded human labels and deterministic checks and track judge-version changes.
