---
id: tool-schema-design
title: "Function and tool schema design"
url: https://developers.openai.com/api/docs/guides/function-calling
category: tools
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-29
superseded_by: null
evidence: []
tags: [function, tool, schema, design, expose]
---

Expose narrow, intent-level tools with unambiguous names and descriptions, explicit required fields, typed enums and bounds, and no overlapping functions that differ only subtly. Do not make the model invent database keys or hidden defaults: provide lookup tools, use stable external identifiers, and return structured success or actionable error objects. Keep authorization, validation, and side-effect confirmation in the executor, and use strict schema mode where available while testing selection and argument accuracy across realistic prompts.

## Deep dive

Tool schemas are the API contract between your system and a caller that reads documentation *every single time* and takes it literally. Most tool-use failures blamed on the model trace back to the schema: ambiguous names, overlapping tools, parameters the model must guess. Design the contract like you're onboarding a brilliant new engineer with no institutional context — because that is functionally who is calling it.

## Name for intent, not implementation

A tool named `query_db_v2` with a `sql` string parameter forces the model to know your schema, your dialect, and your safety rules. A tool named `find_customer_orders` with typed filters encodes the intent and makes misuse structurally hard. [Anthropic's guide to writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) is emphatic that descriptions carry most of the weight: state what the tool does, when to use it, and when NOT to — the negative space ("not for bulk exports") prevents more errors than the positive description.

**No near-twins.** Two tools that differ only subtly (`search_docs` vs `query_documents`) split the model's choice probability and produce coin-flip selection. Merge them or differentiate them sharply.

## Make invalid states unrepresentable

Everything you can move from convention into the type system is an error class deleted: enums instead of free strings, explicit `required` fields, numeric bounds, formats for dates and IDs. [OpenAI's function-calling guide](https://platform.openai.com/docs/guides/function-calling) recommends strict schema mode where available — the model is constrained to emit only valid shapes, so "argument hallucination" becomes a parse-time impossibility instead of a runtime surprise.

The classic anti-pattern is making the model invent keys: any parameter like `customer_id` that the model has no way to *know* invites fabrication. Provide a lookup tool, accept stable external identifiers (email, order number), or thread IDs through prior tool results.

## Errors are part of the schema

A tool that returns `"error: failed"` teaches the model nothing; a tool that returns `{"error": "date_range_too_wide", "max_days": 90}` lets it self-correct on the next call. Return structured success AND structured, actionable failure. Keep authorization, validation, and side-effect confirmation in the *executor* — the schema tells the model what's callable, but the runtime decides what's permitted; a model should never be the enforcement layer.

## Test selection, not just execution

Schema quality is measurable: across realistic prompts, does the model pick the right tool (selection accuracy) with the right arguments (argument accuracy)? Track both separately — selection failures point at names/descriptions, argument failures at parameter design. Evolve schemas with the same discipline as public APIs: additive changes, versioned breaks, and a changelog the [evals](/library/agent-evals) can regression-test against.

*Sources: [Anthropic — Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) · [OpenAI — Function calling guide](https://platform.openai.com/docs/guides/function-calling).*

*Related: [tool use](/library/tool-use), [structured outputs](/library/structured-outputs), [tool retries & idempotency](/library/tool-retries-idempotency), [agent evaluation pitfalls](/library/agent-evals), [Agent Skills vs MCP servers](/library/agent-skills-vs-mcp).*