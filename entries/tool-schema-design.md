---
id: tool-schema-design
title: "Function and tool schema design"
url: https://developers.openai.com/api/docs/guides/function-calling
category: tools
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [function, tool, schema, design, expose]
---

Expose narrow, intent-level tools with unambiguous names and descriptions, explicit required fields, typed enums and bounds, and no overlapping functions that differ only subtly. Do not make the model invent database keys or hidden defaults: provide lookup tools, use stable external identifiers, and return structured success or actionable error objects. Keep authorization, validation, and side-effect confirmation in the executor, and use strict schema mode where available while testing selection and argument accuracy across realistic prompts.
