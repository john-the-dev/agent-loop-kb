---
id: prompt-injection-defense
title: "Defending against prompt injection"
url: https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection
category: tools
source_type: blog
status: current
grade: A
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Prompt injection is not SQL injection (it may be worse)' — UK NCSC, a national cyber-security authority"
  - "the title states the entry's own central argument: that prompt injection resists the parameterisation fix that solved SQL injection. Authoritative and vendor-neutral, which is rare for this topic and is why this is an A rather than another vendor B"
tags: [defending, against, prompt, injection, treat]
---

Treat retrieved pages, emails, documents, tool outputs, and user-uploaded files as untrusted data, even when they contain text claiming to be system instructions. Keep instructions and data in distinct channels or fields, label provenance, minimize the data sent to privileged agents, and never let content grant itself permissions or select secrets to reveal. Enforce authorization and destination allow-lists outside the model, require confirmation for sensitive writes, and test indirect-injection cases where malicious instructions arrive through a trusted connector.

## Deep dive

Prompt injection is the top-ranked risk in the [OWASP Top 10 for LLM applications](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) for a structural reason: an LLM has one input stream, and everything in it — your system prompt, the user's request, a scraped web page, a tool result — is just tokens. Any text the model reads can try to act like instructions. That is why the UK NCSC argues that [prompt injection is not SQL injection](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection): with SQL you could fix the vulnerability class with parameterized queries; with LLMs there is no equivalent boundary *inside* the model, so defenses must assume some injections get through.

## The threat model that matters for agents

Direct injection ("ignore previous instructions") is the easy case. The dangerous one for agents is **indirect injection**: malicious instructions arriving through content the agent was legitimately asked to process — a web page it retrieved, an email it summarized, an issue comment it triaged. Simon Willison's ["lethal trifecta"](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) names the condition to watch for: an agent that combines (1) access to private data, (2) exposure to untrusted content, and (3) the ability to communicate externally can be manipulated into exfiltrating the private data. If your agent has all three, an injection is not a wrong answer — it is a breach.

## Defenses that survive contact

Because the model layer cannot be fully hardened, effective defense is architectural — contain what a compromised model can *do*:

1. **Separate instructions from data.** Delimit and label untrusted content; tell the model retrieved text is observation, never command. This raises the bar but is not sufficient on its own.
2. **Break the trifecta.** Deny at least one leg: strip external-send tools from agents that read untrusted content, or wall private data off from them. The [Design Patterns for Securing LLM Agents paper (arXiv:2506.08837)](https://arxiv.org/abs/2506.08837) systematizes this — patterns like plan-then-execute and context minimization all work by constraining what the untrusted-content-reading component is *able* to trigger.
3. **Enforce authorization outside the model.** Allow-lists for destinations, scoped credentials, and permission checks live in code the model cannot rewrite. Content must never be able to grant itself capability.
4. **Gate irreversible actions.** Sends, payments, deletes, and config changes get human confirmation — so a successful injection can propose but not complete the damaging step.
5. **Test indirect paths.** Red-team through your connectors: plant instructions in a test email, calendar invite, or web page and verify the agent surfaces rather than obeys them.

## The mindset

Design as if injection *will* succeed occasionally, and make success boring: least privilege, broken trifecta, external authorization, and approval gates turn "the model got fooled" from an incident into a non-event.

*Sources: [OWASP LLM01 — Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) · [NCSC — Prompt injection is not SQL injection](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection) · [Willison — The Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) · [Design Patterns for Securing LLM Agents (arXiv:2506.08837)](https://arxiv.org/abs/2506.08837).*

*Related: [memory poisoning](/library/memory-poisoning), [guardrails & safety](/library/guardrails-safety), [human approval gates](/library/human-approval-gates), [tool schema design](/library/tool-schema-design), [the agent security map](/library/agent-security).*
