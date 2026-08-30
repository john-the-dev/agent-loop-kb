---
id: guardrails-safety
title: "Layered guardrails for agent actions"
url: https://www.nist.gov/itl/ai-risk-management-framework
category: tools
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [layered, guardrails, actions, should, enforced]
---

Guardrails should be enforced in code around the model: validate inputs and outputs, authorize every tool call against the user and task, constrain arguments with allow-lists, and run code or file operations in resource-limited sandboxes. Separate read tools from write tools, default to least privilege, redact secrets, impose spend and iteration limits, and require approval for irreversible or externally visible actions. Model-based safety classifiers can add defense in depth but must not be the sole control for permissions or transaction integrity.

## Deep dive

The first design decision in agent safety is *where the enforcement lives*. A rule stated in the prompt is a request; a rule enforced in code around the model is a control. Prompts get overridden by injection, drift under compaction, and fail probabilistically — so anything that must *always* hold (permissions, spend limits, destination allow-lists, transaction integrity) belongs in the deterministic layer the model cannot rewrite. The [OWASP Top 10 for LLM applications](https://genai.owasp.org/llm-top-10/) reads as a catalog of what happens when this line is blurred: prompt injection, insecure output handling, and excessive agency are all failures of trusting the model layer with control-layer jobs.

## The control stack, layer by layer

1. **Input/output validation.** Schema-check tool arguments before execution; treat model output feeding downstream code as untrusted input that happens to parse.
2. **Per-call authorization.** Every tool call is checked against *this user, this task, this moment* — not against what the model claims. Content must never grant itself capability.
3. **Least privilege, structurally.** Read tools separated from write tools; scoped credentials per tool; the agent that ingests untrusted content doesn't hold the send-externally capability (the trifecta break from [prompt-injection defense](/library/prompt-injection-defense)).
4. **Sandboxed execution.** Code and file operations run resource-limited and network-restricted — an agent that can execute code can execute *any* code it was tricked into writing.
5. **Budget caps.** Spend, iteration, and recursion limits turn a runaway loop from an incident into a log line.
6. **Approval gates on irreversibility.** Sends, payments, deletions, deploys: a human confirms, so the worst reachable state without sign-off is a *proposal*.

This layering is what [NIST's AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) formalizes as govern/map/measure/manage — the useful discipline it adds is writing down, per capability, what the failure would cost and which layer catches it.

## Classifiers are seatbelts, not brakes

Model-based safety classifiers (moderation endpoints, judge models screening outputs) add real defense in depth — they catch categories rules can't enumerate. But they are probabilistic, and a control that fails 1% of the time is not a control for permissions or money. Use classifiers to *flag and filter*; use code to *forbid*.

## The test that matters

Red-team the deployed system, not the model: plant hostile instructions in the content your agent actually ingests (email, tickets, web pages) and verify the damaging action is structurally unreachable — not merely that the model usually declines.

*Sources: [OWASP — Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) · [NIST — AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).*

*Related: [prompt injection defense](/library/prompt-injection-defense), [human approval gates](/library/human-approval-gates), [tool use](/library/tool-use), [structured outputs](/library/structured-outputs), [the agent security map](/library/agent-security), [sandboxing code execution](/library/sandboxing-code-execution).*
