---
id: structured-outputs
title: "Structured outputs with JSON Schema"
url: https://developers.openai.com/api/docs/guides/structured-outputs
category: general
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [structured, outputs, json, schema, constrained]
---

Use schema-constrained generation when downstream code needs machine-readable output: define required fields, closed enums, bounds, and disallow unexpected properties where the provider's supported JSON Schema subset permits it. Schema conformance guarantees shape, not truth, so still perform semantic validation, authorization, range checks, and referential checks before acting. Handle refusals, truncation, and provider errors as distinct outcomes, and version schemas so producers and consumers can evolve safely.
