---
id: context-rot
title: "What is context rot, and how do you prevent it?"
url: https://research.trychroma.com/context-rot
category: memory
source_type: research
status: current
grade: A
added: 2026-07-28
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Context Rot: How Increasing Input Tokens Impacts LLM Performance' — primary research from the group that ran it"
  - "the source IS the study the entry is about, not a secondhand account of it: the title states the exact effect the entry names, so the claim and the evidence are the same object"
tags: [context-rot, lost-in-the-middle, compaction, context-engineering, attention]
---

Context rot is the degradation of agent performance as the context window fills — long before the technical token limit — because attention favors the start and end of the window and buries the middle. Prevent it with compaction over accumulation, externalized memory, position-aware window structure, aggressive eviction of stale output, and delegation of bounded sub-tasks to fresh subagent windows.

## Deep dive

**Context rot** is the degradation of an agent's performance as its context window fills up — even when the total token count stays well under the model's technical limit. Task coherence erodes as older but still-relevant information gets buried under newer tokens or quietly drops out at the edges of the model's attention. This is measured, not anecdotal: [Chroma's "Context Rot" technical report](https://research.trychroma.com/context-rot) evaluated 18 models (including GPT-4.1, Claude 4, Gemini 2.5) and found performance degrades — increasingly unevenly — as input length grows, even on tasks as simple as repeating text, and the ["Lost in the Middle" study](https://arxiv.org/abs/2307.03172) showed accuracy drops sharply when relevant information sits in the middle of a long context rather than at the edges. In practice, agents start failing well before the advertised window is full.

## Why it happens

Attention is not uniform across a long window. Models reliably attend to the start and end of the context ("primacy" and "recency") but degrade in the middle — the "lost in the middle" effect. As an agent loop appends tool results, retrieved documents, and prior turns, the instructions and facts that mattered on turn 3 sink into that low-attention middle by turn 30. Nothing was truncated, so it looks fine — but the model has effectively stopped using it.

## How to prevent it

**1. Compaction over accumulation.** When the window approaches a threshold (not the hard limit), summarize the older turns into a compact state and reinitialize with that summary. Keep verbatim only what must stay verbatim — open sub-goals, the active plan, unresolved errors.

**2. Externalize memory.** Offload durable facts to a store (files, vector DB, scratchpad) and retrieve on demand. The window should hold the *working set* for the current step, not the entire history.

**3. Structure the window by position.** Pin the system prompt and current task at the top; keep the most recent tool output at the bottom. Put reference material that must survive in those high-attention zones, not the middle.

**4. Evict aggressively.** Drop stale tool outputs, resolved errors, and superseded plans. A smaller, cleaner window outperforms a larger, noisier one — fewer distractor tokens means sharper attention on what matters.

**5. Delegate to subagents.** Hand a bounded sub-task to a fresh agent with its own clean window, and return only the result. This is compaction by architecture: the parent never sees the sub-task's intermediate churn.

## The one-line rule

Context engineering asks *what tokens should occupy the window at every moment* — including what to evict, compress, or delegate. Treat the window as a scarce, actively-managed resource, not an append-only log, and context rot stops being your top failure mode.

*Sources: [Chroma — Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://research.trychroma.com/context-rot) · [Liu et al. — Lost in the Middle (TACL 2024)](https://arxiv.org/abs/2307.03172) · [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).*

*Related: [context compaction](/library/context-compaction), [token budgets](/library/token-budgets), [agent memory tiers](/library/agent-memory-tiers), [multi-agent orchestration](/library/multi-agent-orchestration).*
