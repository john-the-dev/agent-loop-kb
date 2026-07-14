---
id: customer-support-agents
title: "Production customer support agents"
url: https://www.anthropic.com/engineering/building-effective-agents
category: general
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, customer, support, deflect, repetitive]
---

A support agent can deflect repetitive requests by answering from versioned help-center content and resolving low-risk tasks such as checking delivery status, but it should cite the grounding article and avoid inventing policy. Route by intent and risk, preserve brand tone without masking uncertainty, authenticate users before account access, and escalate on low confidence, repeated failure, abuse, exceptions, or requests outside authority. For a refund request, the agent can gather order evidence and explain eligibility, while a deterministic policy service decides the amount and an approval gate handles exceptions.
