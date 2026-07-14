---
id: operations-agents
title: "Production back-office agents"
url: 
category: orchestration
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, back, office, useful, documents]
---

Back-office agents are useful when documents vary and judgment is needed, while deterministic RPA remains preferable for stable screens and fixed rules; combine them by letting the model interpret inputs and a workflow engine enforce state transitions. Document pipelines should retain the original, extract fields with page or region provenance, validate totals and identifiers, deduplicate work, and route low-confidence or policy-exception cases to humans. For invoice processing, the agent can classify and extract an invoice, but deterministic services perform vendor matching, three-way matching, duplicate detection, and payment approval.
