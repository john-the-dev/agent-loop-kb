---
id: agent-observability
title: "Tracing and replay for agents"
url: https://opentelemetry.io/docs/concepts/signals/traces/
category: orchestration
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [tracing, replay, represent, each, trace]
---

Represent each agent run as a trace with spans for model calls, retrieval, tool execution, guardrails, handoffs, and human approvals, linked by stable run and parent identifiers. Log model and prompt versions, token counts, latency, tool names and validated arguments, result status, retries, state transitions, citations, and final outcome, while redacting secrets and minimizing retained personal data. Store enough versioned inputs and environment references to replay failures, but distinguish deterministic replay of recorded tool results from a fresh live rerun that may change external state.
