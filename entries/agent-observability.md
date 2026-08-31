---
id: agent-observability
title: "Tracing and replay for agents"
url: https://opentelemetry.io/docs/concepts/signals/traces/
category: orchestration
source_type: docs
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Traces | OpenTelemetry' — the primary spec-level doc for distributed tracing concepts"
  - "CAVEAT driving B not A: OTel Traces defines spans, context propagation and sampling generically; the entry is about AGENT observability — tool-call attribution, token and cost accounting, trajectory replay — which the page does not address. The tracing substrate is evidenced, the agent-specific layer is not"
tags: [tracing, replay, represent, each, trace]
---

Represent each agent run as a trace with spans for model calls, retrieval, tool execution, guardrails, handoffs, and human approvals, linked by stable run and parent identifiers. Log model and prompt versions, token counts, latency, tool names and validated arguments, result status, retries, state transitions, citations, and final outcome, while redacting secrets and minimizing retained personal data. Store enough versioned inputs and environment references to replay failures, but distinguish deterministic replay of recorded tool results from a fresh live rerun that may change external state.

## Deep dive

An agent that fails without a trace fails twice: once for the user, and once for the engineer who now has to guess. Chat apps get away with logging request/response pairs; agents cannot — a single run is a *tree* of model calls, retrievals, tool executions, retries, and handoffs, and the failure you're hunting usually lives in the relationship between spans, not inside any one of them.

## Traces, not logs

Model each run as a distributed trace: one root span per run, child spans for every model call, retrieval, tool execution, guardrail check, and human approval, linked by stable run/parent IDs — the same discipline [OpenTelemetry's tracing model](https://opentelemetry.io/docs/concepts/signals/traces/) brings to microservices, because an agent *is* a distributed system whose services happen to include a probabilistic one. This is now standardized: the [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) define attribute names for models, token usage, tool calls, and agent operations, so your traces stay portable across backends instead of bespoke per vendor. Purpose-built platforms like [Langfuse](https://langfuse.com/docs) layer agent-native views (session trees, cost roll-ups, eval scores per trace) on the same structure.

## What each span must carry

- **Identity**: model + version, prompt/template version, agent + tool names. Half of "the agent got worse" incidents are an untracked prompt or model change.
- **Economics**: input/output/cached token counts and latency per span — cost regressions localize instantly when every span is priced.
- **Decisions**: validated tool arguments, result status, retry counts, state transitions, which retrieved documents were actually cited.
- **Hygiene**: secrets redacted at the SDK boundary, personal data minimized *before* it reaches the trace store — a trace store full of raw user data is a second breach surface with a longer retention policy.

## Replay is two different things

Store versioned inputs and environment references so failures can be re-executed — but keep the two replay modes distinct. **Deterministic replay** feeds recorded tool results back to reproduce the decision path: safe, hermetic, ideal for debugging the model's choices. **Live rerun** executes tools again against the world: it may double-charge, re-send, or diverge because external state moved. Confusing them turns a debugging session into an incident. Tag every replay with its mode, and gate live reruns behind the same approval checks as production runs.

## Start pragmatic

Day one: run IDs + spans with token counts and tool statuses, and transcripts you can actually read. Grow toward sampled evals scored on traces. The teams that skip observability don't skip the failures — they just meet them without evidence.

*Sources: [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/) · [OpenTelemetry — GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) · [Langfuse documentation](https://langfuse.com/docs).*

*Related: [agent evals](/library/agent-evals), [determinism & reproducibility](/library/determinism-reproducibility), [agent cost control](/library/agent-cost-control), [durable agent execution](/library/durable-agent-execution).*
