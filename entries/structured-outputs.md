---
id: structured-outputs
title: "Structured outputs with JSON Schema"
url: https://developers.openai.com/api/docs/guides/structured-outputs
category: general
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [structured, outputs, json, schema, constrained]
---

Use schema-constrained generation when downstream code needs machine-readable output: define required fields, closed enums, bounds, and disallow unexpected properties where the provider's supported JSON Schema subset permits it. Schema conformance guarantees shape, not truth, so still perform semantic validation, authorization, range checks, and referential checks before acting. Handle refusals, truncation, and provider errors as distinct outcomes, and version schemas so producers and consumers can evolve safely.

## Deep dive

The moment an LLM's output feeds code instead of a human, "usually valid JSON" becomes a bug class: a stray markdown fence, a trailing comma, or an invented field name breaks the parser on the 1-in-50 call, which for an agent loop means a crash mid-task. Schema-constrained generation closes that class — [OpenAI's structured outputs](https://platform.openai.com/docs/guides/structured-outputs) enforce conformance to a supplied JSON Schema during decoding, and [Anthropic's structured outputs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs) offer the same contract (with tool-input schemas as the long-standing equivalent pattern). The retry-on-parse-failure loop you wrote in 2024 is now the provider's job.

## Write schemas that carry intent

The schema is not just a validator — the model reads it as instructions:

- **Closed enums over free strings.** `"status": "open" | "resolved" | "escalated"` eliminates the synonym roulette ("closed", "done", "finished") that breaks downstream switch statements.
- **Required fields + no additional properties**, where the provider's schema subset allows, so drift is impossible in both directions.
- **Field descriptions do prompting work.** Units, timezone, format, and "null when unknown — never guess" belong on the field, next to where the model decides.
- **Model uncertainty explicitly.** A nullable field with a "why missing" companion beats forcing a value; forced fields get filled with plausible fabrications.

## Shape is not truth

Provider-side conformance guarantees the JSON parses and matches the schema — nothing more. The values can still be wrong, stale, unauthorized, or referentially broken (`customer_id` that doesn't exist). Treat schema-valid output as *untrusted input that parses*: semantic validation, range checks, authorization, and existence checks still run in your code before anything acts on it. This matters doubly for agents, where a structured tool call is often one step from a side effect.

## Handle the non-happy paths as distinct outcomes

Refusals, truncation (max-token cutoffs mid-object), and provider errors are different failures with different fixes — a refusal should surface, truncation should raise the budget or shrink the schema, an API error should retry. Collapsing them into one catch block turns a diagnosable failure into a mystery. And version your schemas: producers and consumers evolve independently, and a silently-added enum value is a breaking change to the consumer that switches on it.

*Sources: [OpenAI — Structured outputs](https://platform.openai.com/docs/guides/structured-outputs) · [Anthropic — Structured outputs](https://docs.claude.com/en/docs/build-with-claude/structured-outputs).*

*Related: [tool schema design](/library/tool-schema-design), [tool use](/library/tool-use), [guardrails & safety](/library/guardrails-safety), [determinism & reproducibility](/library/determinism-reproducibility).*
