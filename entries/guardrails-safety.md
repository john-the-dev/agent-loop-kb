---
id: guardrails-safety
title: "Layered guardrails for agent actions"
url: https://www.nist.gov/itl/ai-risk-management-framework
category: tools
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [layered, guardrails, actions, should, enforced]
---

Guardrails should be enforced in code around the model: validate inputs and outputs, authorize every tool call against the user and task, constrain arguments with allow-lists, and run code or file operations in resource-limited sandboxes. Separate read tools from write tools, default to least privilege, redact secrets, impose spend and iteration limits, and require approval for irreversible or externally visible actions. Model-based safety classifiers can add defense in depth but must not be the sole control for permissions or transaction integrity.
