---
id: model-selection-adaptation
title: "Choosing models, prompting, RAG, and fine-tuning"
url: 
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [choosing, models, prompting, fine, tuning]
---

Choose the smallest model that meets measured quality, tool-use, context, latency, modality, privacy, and reliability requirements on your own task distribution, then route exceptional cases upward. Improve instructions and examples when behavior is underspecified, use RAG when answers depend on changing or private facts that need provenance, and fine-tune when many examples define a stable behavior, format, or domain pattern that prompting cannot deliver economically. Fine-tuning does not reliably teach fresh facts or replace authorization, retrieval, or deterministic business logic, and every adaptation choice should be validated by the same regression suite.
