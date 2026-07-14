---
id: tool-retries-idempotency
title: "Retries, timeouts, and idempotent tools"
url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
category: tools
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [retries, timeouts, idempotent, tools, give]
---

Give every networked tool a connection timeout, an overall deadline, and a bounded retry policy using exponential backoff with jitter only for transient failures such as throttling or selected 5xx responses. Never automatically retry validation, authorization, or permanent business errors, and respect provider retry hints. Side-effecting operations need an idempotency key and stored outcome so a timeout after a successful write cannot create a duplicate charge, ticket, email, or order.
