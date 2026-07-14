---
id: prompt-injection-defense
title: "Defending against prompt injection"
url: https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection
category: tools
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [defending, against, prompt, injection, treat]
---

Treat retrieved pages, emails, documents, tool outputs, and user-uploaded files as untrusted data, even when they contain text claiming to be system instructions. Keep instructions and data in distinct channels or fields, label provenance, minimize the data sent to privileged agents, and never let content grant itself permissions or select secrets to reveal. Enforce authorization and destination allow-lists outside the model, require confirmation for sensitive writes, and test indirect-injection cases where malicious instructions arrive through a trusted connector.
