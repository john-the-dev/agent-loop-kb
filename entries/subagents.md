---
id: subagents
title: "When should you use subagents?"
url: https://www.anthropic.com/engineering/multi-agent-research-system
category: orchestration
source_type: docs
status: current
grade: unrated   # pending first evidence-graded review
added: 2026-07-28
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [subagents, context-isolation, handoff, orchestration, fan-out]
---

A subagent is a specialized worker with its own isolated context window and restricted tools; the orchestrator hands off a bounded task and only the result flows back. Use subagents when work decomposes into independent pieces with clean inputs and outputs — the isolation cuts token bloat sharply and keeps the main loop sharp. The failure mode to engineer against is the lossy handoff: make results an explicit structured contract, not free prose.

## Deep dive

A **subagent** is a specialized worker your main agent spins up to handle one focused task. It gets its own **isolated context window**, its own system prompt, and a **restricted set of tools**. The orchestrator hands off a job, the subagent works independently, and only its *result* flows back — the messy details never pollute the main conversation.

## Why subagents exist: context isolation

As an agent's conversation grows, its context fills with tool output, dead ends, and half-finished reasoning. That bloat makes it slower, pricier, and more error-prone. Subagents contain the mess: the subagent may read 50 files, but the orchestrator only sees the 3-line answer. [Anthropic's multi-agent research system write-up](https://www.anthropic.com/engineering/multi-agent-research-system) describes exactly this pattern — subagents "operating in parallel with their own context windows" act as intelligent filters, compressing large explorations down to the insights the lead agent actually needs. (Note the honest trade-off from the same report: multi-agent runs consume substantially *more total tokens* than single-agent chat — what isolation buys is a sharp, uncluttered main loop, not a smaller bill.)

## When to use subagents

Reach for subagents when a task **decomposes into independent pieces** that don't need to talk to each other:

- A **researcher** subagent that reads docs and returns a summary.
- A **reviewer** subagent that checks output against rules.
- **Fan-out**: run several specialists in parallel, each on its own slice, then merge.

Rule of thumb: if you can describe the subtask with a clean input and a clean output, it's a good subagent.

## When NOT to use them

Skip subagents when workers need to **share discoveries mid-task**, challenge each other, or coordinate on a moving target — a single well-run loop (or a collaborative "agent team") beats rigid delegation there. And don't over-split: every handoff is a place to lose information.

## The one thing that breaks subagents: the handoff

The failure mode is a **lossy handoff** — the subagent knew the answer but its summary dropped the detail the orchestrator needed. Guard against it:

1. Make handoffs an **explicit contract** — a structured result (JSON, a filled template), not free prose.
2. Use a **plan → approve → execute** pipeline for risky work, with the review gate *before* any file is modified, not after.
3. Give each subagent the **least tools** it needs — fewer tools, fewer ways to go wrong.

## Bottom line

Use subagents to **isolate context and parallelize independent work**; keep a single loop when the work is tightly coupled. The 2026 SDKs (including the Claude Agent SDK's new hierarchical spawning) make this cheap to try — the engineering is in the handoff, not the spawn.

*Sources: [Anthropic — How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) · [Claude Code subagents docs](https://docs.claude.com/en/docs/claude-code/sub-agents).*
