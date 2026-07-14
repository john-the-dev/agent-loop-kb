---
id: agent-memory-tiers
title: "Short-term and long-term agent memory"
url: 
category: memory
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [short, term, long, memory, working]
---

Short-term memory is the working context supplied on each model call: recent messages, the current plan, tool results, and task-local state; it is bounded by the context window and disappears unless persisted. Long-term memory lives in an external store and should contain durable, scoped facts such as user preferences, decisions, and prior outcomes, with provenance, timestamps, access controls, and deletion support. Retrieve long-term memories only when relevant, and never treat model-written memories as authoritative without validation because stale or poisoned records can propagate across sessions.
