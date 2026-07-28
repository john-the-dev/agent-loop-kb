---
id: tool-use
title: "Reliable tool use"
url: https://platform.openai.com/docs/guides/function-calling
category: tools
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [reliable, tool, using, work, best]
---

Tool-using agents work best with narrow tools, explicit schemas, actionable error messages, and observable results. Validate arguments before execution, use idempotency keys for side effects, limit permissions, and return structured outputs so the model can accurately decide what to do next.

## Deep dive

Most "the agent is dumb" complaints trace back to tool design, not model capability. The model can only be as reliable as the interface you hand it: vague tool names, kitchen-sink parameters, and error messages like `500 Internal Error` force it to guess — and an agent that guesses inside a loop compounds the guess on every subsequent step.

## Design tools for the model that will read them

[Anthropic's guide to writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) distills what their own teams converged on: fewer, more targeted tools beat exhaustive API mirrors; names and descriptions are prompts, so write them for the model, not for a human SDK reference; and return responses that are informative but token-efficient. A tool that wraps "search flights, filter by date, sort by price" as one clear operation outperforms three chained generic endpoints, because every extra round-trip is another chance to mis-plan.

Schema precision does real work too. Both [OpenAI's function-calling docs](https://platform.openai.com/docs/guides/function-calling) and [Anthropic's tool-use docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview) make the same points: constrain inputs with enums and formats instead of free strings, describe each parameter's semantics (units, timezone, valid ranges), and state when the tool should — and should not — be used. Ambiguity you leave in the schema resurfaces as a hallucinated argument at 2am.

## Errors are part of the interface

An agent recovers from failure exactly as well as your error messages allow. `{"error": "invalid_date", "hint": "use YYYY-MM-DD; dates in the past are not bookable"}` gives the loop a next move; a bare 400 gives it a coin flip. Design error responses as *instructions for retry*: what was wrong, what a valid call looks like, whether retrying can help at all.

## Side effects need idempotency

Agents retry — after timeouts, after truncated responses, after crash recovery. Any tool with a side effect (send, charge, create, deploy) therefore needs an [idempotency key](https://docs.stripe.com/api/idempotent_requests) — the pattern Stripe's API popularized: the caller supplies a unique key per logical operation, and replays with the same key return the original result instead of double-charging. Without it, "the agent retried" and "the customer paid twice" are the same event.

## The checklist

Narrow, well-named tools · enum-constrained schemas with semantic descriptions · errors that teach the retry · idempotency keys on every side effect · least-privilege scopes per tool · structured (not prose) results so the next step starts from facts.

*Sources: [Anthropic — Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) · [OpenAI — Function calling](https://platform.openai.com/docs/guides/function-calling) · [Anthropic — Tool use overview](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview) · [Stripe — Idempotent requests](https://docs.stripe.com/api/idempotent_requests).*

*Related: [tool schema design](/library/tool-schema-design), [tool retries & idempotency](/library/tool-retries-idempotency), [structured outputs](/library/structured-outputs), [agent loop](/library/agent-loop).*
