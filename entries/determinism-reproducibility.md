---
id: determinism-reproducibility
title: "Determinism and reproducibility"
url: https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [determinism, reproducibility, lower, temperature, reduce]
---

Lower temperature can reduce sampling variation for extraction and routing, but it does not make a hosted model or a multi-step agent deterministic because model revisions, parallel tools, retrieval indexes, and external state can change outcomes. Record model snapshots when available, parameters, prompts, tool and data versions, seeds where supported, timestamps, and complete trajectories, then evaluate with repeated trials and outcome tolerances. For reasoning models, follow provider guidance on sampling controls and put exact calculations, policy decisions, and invariants in deterministic code rather than relying on identical natural-language reasoning traces.
