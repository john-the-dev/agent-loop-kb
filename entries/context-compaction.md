---
id: context-compaction
title: "Context management and compaction"
url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
category: tools
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Effective context engineering for AI agents \ Anthropic'"
  - "CAVEAT driving B not A: the essay covers context engineering broadly, while the entry is specifically about COMPACTION — summarise-and-discard under a window limit. The essay supports the surrounding discipline more than the specific mechanism the entry names"
tags: [context, management, compaction, manage, retain]
---

Manage context as a budget: retain the system policy, current objective, unresolved constraints, recent actions, exact error messages, and identifiers needed for future tool calls, while dropping duplicated prose and superseded attempts. A sliding window preserves local conversational detail, whereas periodic summaries compress older history; summaries should separate verified facts from hypotheses and link to durable artifacts rather than paraphrasing critical code or numbers. Trigger compaction before the window is full and test that an agent can resume from the compacted state without losing commitments or repeating side effects.

## Deep dive

Every long-running agent eventually faces the same arithmetic: the context window is finite, the task history is not. What separates agents that degrade gracefully from agents that quietly lose the plot is *what they choose to keep* — because compaction is not a storage problem, it is a judgment call about which information still constrains future behavior.

## Keep what still binds, drop what's spent

[Anthropic's context-engineering guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) frames context as a budgeted resource where every token competes for the model's attention. The keep-list is shorter than most teams expect: the system policy, the current objective, unresolved constraints ("never push to main", "the user chose option B"), recent actions and their results, exact error messages, and the identifiers future tool calls will need. The drop-list is everything already *spent*: duplicated prose, superseded attempts, tool outputs whose conclusions have been extracted, exploratory dead ends.

The subtle failure is dropping something that looked spent but still binds — a commitment made 40 turns ago, a constraint stated once. This is why compaction summaries must separate **verified facts from hypotheses**, and why they should *link* to durable artifacts (files, PRs, notes on disk) instead of paraphrasing critical code or numbers — a paraphrase drifts; a path does not.

## Why more context isn't the answer

Long-context models tempt teams to skip compaction entirely. Measurement says otherwise: [Chroma's context-rot study](https://research.trychroma.com/context-rot) ran 18 models across needle-retrieval and long-conversation tasks and found performance degrades non-uniformly as input grows — even on tasks a short context handles perfectly. Distractors accumulate, attention dilutes, and the model starts answering from the wrong region of history. Relatedly, agents that re-read their whole raw history each turn pay the [cost problem](/library/agent-cost-control) on top of the accuracy one.

## Compact early, resume honestly

Trigger compaction *before* the window forces it — a compaction under pressure has no room to be careful. And treat resumability as a testable property: after compacting, can the agent state its current objective, its open commitments, and what it must NOT redo (side effects already executed)? An agent that re-sends an email after compaction because the "already sent" fact got summarized away is the canonical failure. Sliding windows preserve recent local detail; periodic summaries compress the old; durable state (task lists, decision logs, memory files) lives *outside* the window entirely and gets re-read on demand — the pattern every production harness converges on.

*Sources: [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) · [Chroma — Context rot](https://research.trychroma.com/context-rot).*

*Related: [context rot](/library/context-rot), [agent memory tiers](/library/agent-memory-tiers), [token budgets](/library/token-budgets), [cost control](/library/agent-cost-control).*
