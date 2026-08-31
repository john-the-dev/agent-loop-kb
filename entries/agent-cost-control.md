---
id: agent-cost-control
title: "Cost control and token economics"
url: https://www.anthropic.com/engineering/building-effective-agents
category: evaluation
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Building Effective AI Agents \ Anthropic' — a primary vendor engineering essay, and a real one"
  - "CAVEAT driving B not A: the essay is about agent design generally and does not address cost control — token budgeting, model tiering, caching economics — which is what this entry is about. It underpins the entry's framing, not its subject"
  - "SHARED-SOURCE CAVEAT: this exact url backs FOUR entries in this KB — agent-loop, agent-cost-control, customer-support-agents and multi-agent-orchestration. agent-loop reaches it via /research/building-effective-agents, which 301s to the /engineering/ path, so it is one essay under two urls. A single general essay cannot be the sole evidence for four different applied claims; measured 2026-08-30"
  - "NEGATIVE CONTROL: /engineering/not-a-real-post-xyz returns 404, so the 200s here are real pages rather than a catch-all route"
tags: [cost, control, token, economics, measure]
---

Measure cost per completed task, not cost per model call, because cheap models can become expensive when they cause retries or long trajectories. Reduce repeated input with prompt caching, retrieve only relevant chunks, compact history, cap tool and reasoning loops, and route routine classification or extraction to smaller models while escalating difficult cases based on confidence or validation failure. Set per-run and per-tenant budgets and surface budget exhaustion as an explicit partial outcome rather than silently degrading quality.

## Deep dive

The most common cost mistake in agent systems is optimizing the wrong unit. Teams compare models by price per million tokens, pick the cheapest, and then watch the bill grow anyway — because the cheap model retries more, wanders through longer trajectories, and escalates to humans more often. The unit that matters is **cost per completed task**, and a more capable model that finishes in 6 tool calls routinely beats a cheaper one that takes 15. [Anthropic's guide to building effective agents](https://www.anthropic.com/engineering/building-effective-agents) makes the underlying point: added cost and latency must buy measurable outcome improvement, and simple single-call designs should win whenever they suffice.

## Where the tokens actually go

**1. Repeated input dwarfs output.** An agent loop re-sends its system prompt, tool schemas, and accumulated history on every turn — a 20-turn trajectory can re-read the same context 20 times. [Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) attacks exactly this: cache reads are billed at roughly a tenth of fresh input, so structuring prompts as a stable prefix (system + tools first, volatile content last) turns the dominant cost bucket into the cheapest one. In practice this is the single highest-leverage change most teams can make in an afternoon.

**2. Context that never gets pruned.** Retrieval that stuffs top-20 chunks "to be safe," tool outputs appended verbatim forever, history that grows without compaction — all of it is paid on every subsequent turn. Retrieve less and rerank harder, summarize closed episodes, and cap tool output size at the boundary.

**3. Unbounded loops.** A stuck agent that retries the same failing tool call is a token furnace. Cap tool-call and reasoning iterations, detect repeated near-identical calls, and treat a budget-exceeded run as an explicit outcome — surfaced as partial success or escalation — rather than letting it silently degrade quality or burn to the cap.

## Routing: escalate on evidence, not vibes

Routing routine classification and extraction to small models while reserving frontier models for hard cases is the other structural lever. [FrugalGPT (arXiv:2305.05176)](https://arxiv.org/abs/2305.05176) demonstrated the cascade pattern — try cheap, escalate on low confidence — matching top-model accuracy at a fraction of the cost. The operational key is the escalation trigger: validation failure, low self-reported confidence calibrated against evals, or schema violations. Route on measured difficulty signals, and make the escalation rate a tracked metric — a rising rate means your cheap tier's job drifted.

## Budgets as a product feature

Set per-run and per-tenant budgets the way you set rate limits: enforced at the platform layer, visible in observability, with exhaustion producing a defined partial outcome. A budget that only exists in a dashboard is a report, not a control.

*Sources: [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Anthropic — Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) · [FrugalGPT (arXiv:2305.05176)](https://arxiv.org/abs/2305.05176).*

*Related: [token budgets](/library/token-budgets), [prompt caching](/library/prompt-caching), [model selection & adaptation](/library/model-selection-adaptation), [agent evaluation pitfalls](/library/agent-evals).*
