---
id: agent-memory-tiers
title: "Short-term and long-term agent memory"
url: https://arxiv.org/abs/2310.08560
category: memory
source_type: paper
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source is arXiv 2310.08560 'MemGPT: Towards LLMs as Operating Systems', citation_date 2023-10-12, at least v2, fetched live 2026-08-30: HTTP 200"
  - "CAVEAT driving B not A: foundational and widely cited, but a 2023 preprint — the tiered-memory idea it introduced is current while its specific system details have been overtaken (checked 2026-08-30)"
  - "source_type corrected blog -> paper: arXiv preprint, which GRADING.md ranks above secondhand blog"
tags: [short, term, long, memory, working]
---

Short-term memory is the working context supplied on each model call: recent messages, the current plan, tool results, and task-local state; it is bounded by the context window and disappears unless persisted. Long-term memory lives in an external store and should contain durable, scoped facts such as user preferences, decisions, and prior outcomes, with provenance, timestamps, access controls, and deletion support. Retrieve long-term memories only when relevant, and never treat model-written memories as authoritative without validation because stale or poisoned records can propagate across sessions.

## Deep dive

An agent with no memory beyond its context window is a brilliant amnesiac: it re-solves the same problem every session, forgets what the user told it yesterday, and cannot learn from its own past mistakes. Memory tiers fix this — but the naive version ("dump everything into a vector store and retrieve on every turn") creates new failure modes worse than forgetting. The design question is not *whether* to persist, but *what* deserves to outlive the window and *how* to trust it when it comes back.

## Two tiers, two jobs

**Short-term (working) memory** is what you supply on each model call: recent messages, the active plan, tool results, task-local state. It is fast, high-fidelity, and bounded by the window — and it vanishes unless deliberately persisted. Its enemy is dilution: the more you cram in, the worse retrieval-within-context gets (see [context rot](/library/context-rot)).

**Long-term memory** lives in an external store and should hold *durable, scoped* facts: user preferences, decisions and their rationale, prior outcomes. [MemGPT (arXiv:2310.08560)](https://arxiv.org/abs/2310.08560) framed this as an OS-style hierarchy — the agent pages information between a small fast "main context" and a large slow external store, deciding what to promote and evict, much as an operating system manages RAM versus disk. The key insight is that the *agent itself* manages the boundary as a first-class action, not a hidden framework detail.

## What earns a place in long-term store

Not everything. A good long-term record is: **scoped** (a fact about a specific entity, not a vague impression), **provenanced** (where it came from, when, how confident), **timestamped** (so staleness is visible), and **revisable** (supports update and deletion — GDPR-style "forget this" is a functional requirement, not a nicety). Conversation transcripts dumped wholesale fail all four tests; "user prefers metric units (stated 2026-07-14, high confidence)" passes.

## The trust problem

The dangerous failure is treating model-written memories as authoritative. An agent that writes a wrong inference to long-term store, then retrieves and acts on it next session, has laundered a guess into a "fact" — and memory poisoning ([an active attack surface](/library/memory-poisoning)) exploits exactly this. Retrieve long-term memories *only when relevant* (over-retrieval reintroduces the dilution problem), and validate on read: check timestamps, prefer recent over stale, and never let a single unverified memory override direct evidence in the current context.

## The practical stack

Most production agents converge on three layers: the context window (working), a scoped key-value or document store for durable facts (long-term), and durable task state on disk (plans, decision logs) that is re-read on demand rather than held resident. The art is in the promotion policy — what graduates from working to long-term — and the retrieval filter that keeps the window clean.

*Sources: [MemGPT (arXiv:2310.08560)](https://arxiv.org/abs/2310.08560).*

*Related: [context rot](/library/context-rot), [context compaction](/library/context-compaction), [memory poisoning](/library/memory-poisoning), [retrieval quality](/library/retrieval-quality).*
