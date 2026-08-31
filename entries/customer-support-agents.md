---
id: customer-support-agents
title: "Production customer support agents"
url: https://www.anthropic.com/engineering/building-effective-agents
category: general
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "same source, HTTP 200, 'Building Effective AI Agents \ Anthropic'"
  - "CAVEAT driving B not A: the essay uses customer support only as a worked example; it is not a source on support-agent practice (deflection, escalation policy, CSAT), which is what this entry claims"
  - "SHARED-SOURCE CAVEAT: this exact url backs FOUR entries in this KB — agent-loop, agent-cost-control, customer-support-agents and multi-agent-orchestration. agent-loop reaches it via /research/building-effective-agents, which 301s to the /engineering/ path, so it is one essay under two urls. A single general essay cannot be the sole evidence for four different applied claims; measured 2026-08-30"
  - "NEGATIVE CONTROL: /engineering/not-a-real-post-xyz returns 404, so the 200s here are real pages rather than a catch-all route"
tags: [production, customer, support, deflect, repetitive]
---

A support agent can deflect repetitive requests by answering from versioned help-center content and resolving low-risk tasks such as checking delivery status, but it should cite the grounding article and avoid inventing policy. Route by intent and risk, preserve brand tone without masking uncertainty, authenticate users before account access, and escalate on low confidence, repeated failure, abuse, exceptions, or requests outside authority. For a refund request, the agent can gather order evidence and explain eligibility, while a deterministic policy service decides the amount and an approval gate handles exceptions.

## Deep dive

Customer support is the most-deployed agent vertical and the one with the clearest public evidence of both the upside and the failure cost. The load-bearing design question is not "can the model answer" — it usually can — but **whose words legally bind you and what the agent is authorized to do to an account.**

## The two public benchmarks that frame the vertical

The upside: [Klarna's AI assistant](https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/) publicly reported handling two-thirds of support chats in its first month — 2.3M conversations, the workload equivalent of ~700 full-time agents, with matched satisfaction and a large drop in repeat inquiries. That scale is what makes deflection economics real.

The downside: in *Moffatt v. Air Canada* (2024), a tribunal [held the airline liable](https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html) for a bereavement-fare policy its website chatbot invented, rejecting the argument that the chatbot was a "separate legal entity responsible for its own actions." The precedent is blunt: **your agent's answers are your company's representations.** An invented policy is not a UX bug; it is a binding commitment made at scale.

Together these define the operating envelope: deflect aggressively where answers are grounded and reversible, and treat policy statements and account mutations as controlled actions.

## Grounding: answer from documents, not from weights

The Air Canada failure was ungrounded generation. The fix is architectural, not prompt-level: the agent answers **from versioned help-center content and cites the article it used**, so every policy claim has a source that support leadership actually controls. No retrieval hit → say so and escalate; never fall back to the model's prior. Version the content store, and log which document version grounded each answer — when policy changes, you can identify what the agent told customers under the old version.

## Authorization: intent × risk routing

Route every conversation on two axes. **Intent** determines which tools are even reachable (a shipping-status intent never needs the refund tool). **Risk** determines who decides: read-only lookups auto-resolve; state changes on an account require authenticated identity (authenticate *before* account access, not after the model has already read the record); money movement gets the same shape as every other high-stakes vertical — the model gathers evidence and explains eligibility, a **deterministic policy service computes the amount**, and exceptions cross a human approval gate. [τ-bench](https://arxiv.org/abs/2406.12045) — built specifically on airline/retail support scenarios with policy constraints — shows why: agents violate stated policy under multi-turn pressure at rates a single-turn demo never reveals, and its pass^k consistency metric collapses exactly on the tasks where authority matters.

## Escalation is a feature, not a failure

Define hard triggers, and log them as first-class outcomes: low retrieval confidence, repeated tool failure, abuse, explicit human request, anything outside the tool allowlist. Two metrics keep the system honest over time: **escalation precision** (were the escalated cases genuinely hard?) and **containment regret** (of the auto-resolved cases, how many reopened or churned?). Deflection rate alone rewards confidently wrong answers — the exact behavior the tribunal priced.

*Sources: [Klarna AI assistant press release](https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/) · [Moffatt v. Air Canada, 2024 BCCRT 149](https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html) · [τ-bench (arXiv:2406.12045)](https://arxiv.org/abs/2406.12045).*

*Related: [rag basics](/library/rag-basics), [human approval gates](/library/human-approval-gates), [guardrails & safety](/library/guardrails-safety), [agent evals](/library/agent-evals), [back-office operations agents](/library/operations-agents), [groundedness and hallucination](/library/groundedness-hallucination).*
