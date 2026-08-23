---
id: agent-security
title: "AI agent security: the complete map"
url: https://agent-loop.xyz/library/agent-security
category: security
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-08-16
last_verified: 2026-08-16
superseded_by: null
evidence: []
tags: [security, hub, prompt-injection, memory-poisoning, sandboxing, guardrails, pillar]
---
Pillar hub mapping the four agent attack surfaces — input (prompt injection), memory (poisoning), execution (sandboxing), authority (guardrails/approval gates) — with links to the deep-dive guide for each, plus real incident case studies (Langflow KEV, Therac-25, Knight Capital).

## Deep dive

**Short answer:** securing an AI agent means defending four distinct attack surfaces — what goes *into* the model (injection), what the model *remembers* (memory), what the model *runs* (code execution), and what the model is *allowed to do* (authority). This hub maps each surface to a deep-dive guide.

## 1. Input: prompt injection

Any text your agent reads — web pages, emails, tool output — can carry instructions aimed at the model. Injection remains the #1 practical agent exploit because it needs no access to your infrastructure, only to something your agent will eventually read.
→ [Prompt injection defense](/library/prompt-injection-defense)

## 2. Memory: poisoning the well

Persistent memory turns a one-shot injection into a standing compromise: plant a fact once and the agent re-reads it forever. Memory needs provenance, quarantine for un-trusted writes, and periodic audits.
→ [Defending against memory poisoning](/library/memory-poisoning)

## 3. Execution: sandboxing generated code

Agents that write and run code need real isolation — microVMs or user-space kernels, locked-down egress, scoped credentials — because LLM-generated code must be treated as hostile by default.
→ [Sandboxing agent code execution](/library/sandboxing-code-execution)

## 4. Authority: guardrails and approval gates

The blast radius of a compromised agent equals the permissions you gave it. Cap it with explicit guardrails, human approval for irreversible actions, and least-privilege tool scopes.
→ [Guardrails and safety](/library/guardrails-safety) · [Human approval gates](/library/human-approval-gates)

## Case studies

Real incidents beat theory. The Langflow RCE reached CISA's KEV list because an agent-builder exposed unauthenticated code execution:
→ [Langflow CVE in CISA KEV](/library/langflow-cisa-kev-agent-rce)

And the pre-LLM history of safety-critical software failure still sets the frame for what "unsafe autonomy" costs:
→ [Therac-25](/library/lesson-therac-25) · [Knight Capital](/library/lesson-knight-capital-deploy)

## The one-paragraph security model

Treat the model as an enthusiastic intern with no loyalty: everything it reads may be adversarial (injection), everything it remembers may be planted (poisoning), everything it executes may be a payload (sandboxing), and everything it's permitted to do will eventually be done wrong (authority). Defense-in-depth across all four layers — not any single fix — is what makes an agent deployable.
