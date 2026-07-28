---
id: multi-agent-orchestration
title: "Multi-agent orchestration tradeoffs"
url: https://www.anthropic.com/engineering/building-effective-agents
category: orchestration
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [multi, orchestration, tradeoffs, multiple, subtasks]
---

Use multiple agents when subtasks are genuinely independent, require distinct tools or context, or benefit from parallel search or review; a single agent is usually cheaper, faster, and easier to debug for sequential work. In the supervisor pattern, one coordinator decomposes the task, gives workers bounded contracts, and merges results, while handoffs must carry the goal, evidence, state, ownership, and completion criteria explicitly. Cap fan-out, recursion, and per-worker budgets because coordination messages, duplicated context, and synthesis can cost more than the useful work.

## Deep dive

The most expensive mistake in multi-agent design is reaching for it by default. [Anthropic's "Building effective agents"](https://www.anthropic.com/engineering/building-effective-agents) opens with exactly this warning: the most successful production implementations use simple, composable patterns, and complexity should be added only when it demonstrably pays. A single well-run loop is cheaper, faster, and radically easier to debug — one transcript, one context, one place to look when it breaks.

## When multiple agents actually win

Three conditions justify the jump:

1. **Genuine independence.** Subtasks that don't need to talk mid-flight — parallel research angles, per-file migrations, independent review lenses. [Anthropic's multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) is the canonical worked example: a lead agent decomposes a query, parallel subagents each search with their own context window, and only distilled findings flow back. Their honest accounting: it outperformed single-agent on breadth-heavy research *and* consumed far more total tokens — the win is capability and wall-clock, never cost.
2. **Conflicting contexts or tools.** A safety reviewer shouldn't share a context with the generator it reviews; a sandboxed code-runner shouldn't hold production credentials. Separation here is a control boundary, not an optimization.
3. **Specialist prompting.** When one system prompt would have to be three things at once, three scoped agents each stay sharp — the pattern frameworks like [AG2](https://docs.ag2.ai/latest/) (group chats, nested conversations, handoffs) and the [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents) (agents-as-tools, handoffs) both make first-class.

## The orchestration patterns that recur

- **Supervisor / worker**: one coordinator owns decomposition, contracts, and synthesis. Workers never see each other; all integration risk concentrates in the merge step — which is where to spend your testing budget.
- **Pipeline**: each agent transforms and passes on. Cheap to reason about; fragile when a middle stage silently degrades, so validate at stage boundaries.
- **Debate / panel**: independent attempts judged against each other. Buys robustness on wide solution spaces; costs a multiple of every token.

Whatever the topology, **the handoff is the product**: a contract carrying goal, evidence, current state, ownership, and completion criteria. Free-prose handoffs are where multi-agent systems lose the detail that mattered.

## Budget the coordination tax

Coordination messages, duplicated context, and synthesis passes are pure overhead — cap fan-out, cap recursion depth (an agent spawning agents that spawn agents is an outage generator), and give every worker an explicit token/time budget. If the overhead exceeds the parallel win, the correct architecture was one agent all along.

*Sources: [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Anthropic — Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) · [AG2 documentation](https://docs.ag2.ai/latest/) · [OpenAI — Agents guide](https://platform.openai.com/docs/guides/agents).*

*Related: [subagents](/library/subagents), [planning & decomposition](/library/planning-decomposition), [agent cost control](/library/agent-cost-control), [context rot](/library/context-rot).*
