---
id: human-approval-gates
title: "Human approval gates for high-stakes actions"
url: https://www.anthropic.com/research/trustworthy-agents
category: general
source_type: research
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Trustworthy agents in practice \ Anthropic'"
  - "CAVEAT driving B not A: the essay is about agent trustworthiness broadly; this entry is specifically about approval GATES — where to interpose a human, what the gate blocks, how it fails open or closed. The source motivates the need for gates more than it specifies them"
tags: [human, approval, gates, high, stakes]
---

Place approval gates immediately before consequential actions such as sending messages, moving money, changing production, deleting data, or releasing regulated decisions, rather than asking once at session start. The approval view should show the exact proposed action, target, material parameters, evidence, uncertainty, and reversible alternatives; any later parameter change invalidates the approval. Persist who approved what and when, support rejection and editing, and fail closed when the approver or policy service is unavailable.

## Deep dive

The approval gate is the one guardrail that survives every other failure: injection got past your filters, the model hallucinated a parameter, the plan drifted — none of it matters if the send/pay/delete still needs a human click. But gates are routinely built wrong in two opposite ways: asked too early (a session-start "may I act on your behalf?" that authorizes everything after) or so often that the human rubber-stamps without reading. Both are approval theater. [Anthropic's trustworthy-agents research agenda](https://www.anthropic.com/research/trustworthy-agents) frames the underlying requirement as *humans staying meaningfully in the loop as agents gain autonomy* — meaningful being the operative word.

## Gate placement: at the action, not the session

Approve the **specific consequential action at the moment it is about to execute**, with everything the approver needs on one screen:

- the exact operation and target ("send this email to alice@…", not "proceed?")
- material parameters (amount, recipients, scope) — rendered, not summarized
- the evidence the agent is acting on, and its stated uncertainty
- reversible alternatives, when they exist ("save as draft instead")

Two invariants make the approval real rather than ceremonial: **any parameter change after approval invalidates it** (the agent re-proposes; it never edits an approved action), and **the approved payload is the executed payload** — the gate sits between the model and the tool, in code, so what was shown is byte-for-byte what runs.

## Design against rubber-stamping

A gate the human stops reading is a gate that has already failed. Keep the approval surface *scarce* (gate irreversible and externally-visible actions; let reversible, low-stakes steps flow), *informative* (show what changed since the last similar approval), and *tiered* — standing approvals for narrow, well-defined action classes ("always allow git push to my fork") are better than either extreme, provided the standing grant is itself explicit, scoped, and revocable.

## The operational contract

- **Persist the audit trail**: who approved what payload, when, from which surface — it's both your incident forensics and your compliance story.
- **Support reject *and edit***: a gate that only offers OK/Cancel forces the human to abandon good work over one wrong parameter; letting the approver amend the payload (which re-runs validation) keeps the loop productive.
- **Fail closed**: if the approver is unreachable or the policy service is down, consequential actions queue — they never default through. An agent that "assumed yes" once will be assumed to always.

*Sources: [Anthropic — Building trustworthy agents](https://www.anthropic.com/research/trustworthy-agents) · [Design Patterns for Securing LLM Agents (arXiv:2506.08837)](https://arxiv.org/abs/2506.08837).*

*Related: [guardrails & safety](/library/guardrails-safety), [prompt injection defense](/library/prompt-injection-defense), [tool retries & idempotency](/library/tool-retries-idempotency), [agent observability](/library/agent-observability).*
