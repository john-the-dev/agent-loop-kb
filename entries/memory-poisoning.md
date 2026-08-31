---
id: memory-poisoning
title: "How do you defend an AI agent against memory poisoning?"
url: https://genai.owasp.org/llm-top-10/
category: security
source_type: research
status: current
grade: B
added: 2026-07-28
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'LLMRisks Archive - OWASP Gen AI Security Project'"
  - "CAVEAT driving B not A: the url is the LLM Top-10 INDEX, not the specific risk entry for memory or data poisoning. The index establishes that OWASP tracks this class; it does not itself carry the poisoning detail the entry asserts. Repointing at the individual risk page would make this an A"
tags: [memory-poisoning, prompt-injection, security, provenance, least-privilege]
---

Memory poisoning plants malicious content in an agent's long-term memory so it activates on a later task, often against a different user — unlike one-shot prompt injection, the payload sits dormant in a store the agent trusts. Defend by treating every retrieved memory as untrusted data, verifying on recall before high-stakes actions, tagging provenance and trust tiers on writes, quarantining new memories, separating per-user namespaces, and gating irreversible actions behind approval.

## Deep dive

**Memory poisoning** is when an attacker plants malicious content in an agent's *long-term memory* so it activates later — on a future task, in a future session, often against a different user. Unlike a one-shot prompt injection, the payload sits dormant in the store the agent trusts, then fires when a relevant query retrieves it. This is demonstrated, not hypothetical: the [GhostWriter attack (arXiv:2607.06595)](https://arxiv.org/abs/2607.06595) poisons the memory store of tool-using personal agents via untrusted email/calendar content and reports ~98% injection and ~60% average activation rates against state-of-the-art memory-augmented agents.

## Why memory makes it worse
An agent's memory is designed to be *believed*. Once a false "fact" or instruction is stored, the agent recalls it as ground truth and acts on it — no further attacker access required. The blast radius is every future retrieval, which is exactly what makes poisoning more dangerous than a single hijacked prompt.

## Six defenses that actually help

1. **Treat every retrieved memory as untrusted data, never as instructions.** Wrap recalled content in clear delimiters and a system rule: memories are observations to reason about, not commands to obey.
2. **Verify on recall, not just on write.** Before acting on a high-stakes recalled fact, re-check it against a trusted live source. Stale or planted memories should not silently drive irreversible actions.
3. **Provenance + least privilege on writes.** Tag each memory with who/what wrote it and from which source. Memory written from untrusted room/user content gets a lower trust tier and cannot authorize privileged actions (sends, payments, deploys).
4. **Quarantine new memories (TTL + review).** New writes enter a probationary state; they influence low-stakes reasoning but require corroboration or a review window before they can drive consequential actions.
5. **Separate memory namespaces per user/tenant.** A payload planted in one user's context must never surface in another's — cross-user retrieval is the highest-severity failure.
6. **Human-in-the-loop for irreversible actions.** Assume some injections will land; gate spend, external posts, and config changes behind approval so a poisoned memory can't complete the loop on its own.

## The mindset
Injection is not fully solvable at the model layer, so build assuming some poisoned content *will* reach memory. The goal is containment: least privilege, verification on recall, provenance, and approval gates so a planted memory can inform reasoning but never unilaterally act. An agent that verifies a recalled fact before trusting it is far harder to weaponize than one that treats its own memory as infallible.

*Sources: [When Agents Remember Too Much: Memory Poisoning Attacks on LLM Agents (arXiv:2607.06595)](https://arxiv.org/abs/2607.06595).*

*Related: [Guardrails & Safety](/library/guardrails-safety) · [Human approval gates](/library/human-approval-gates) · [Prompt injection defense](/library/prompt-injection-defense) · [Agent memory tiers](/library/agent-memory-tiers), [the agent security map](/library/agent-security).
