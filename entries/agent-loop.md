---
id: agent-loop
title: "What an agent loop is"
url: https://www.anthropic.com/research/building-effective-agents
category: tools
source_type: research
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [what, loop, repeatedly, reads, current]
---

An agent loop repeatedly reads the current state, chooses an action, uses a tool, observes the result, and corrects its plan. The model is only one component: reliable agents also need clear goals, useful tools, bounded context, termination conditions, and feedback from the environment.

## Deep dive

The single most useful shift when building agents is to stop thinking of the model as the agent and start thinking of the **loop** as the agent. The model contributes one step — pick the next action given the current state — and everything that makes the system reliable lives in the machinery around that step: the goal it is held to, the tools it can call, the state it is allowed to see, and the condition that ends the run. Anthropic's [Building effective agents](https://www.anthropic.com/research/building-effective-agents) draws the line precisely: *workflows* thread a model through predefined code paths, while *agents* let the model direct its own process — dynamically choosing tools and deciding when it is done. The loop is what turns a one-shot completion into an agent, and it is also where almost all of the failure modes live.

## Observe → decide → act → observe, and why the first arrow is the hard one

The canonical cycle is: read the current state, choose an action, execute it through a tool, observe the real result, update the plan, and check whether to stop. The step teams under-invest in is the *observe* — feeding the true outcome of an action back into the next decision. An agent that assumes its last action succeeded, instead of reading what actually happened, drifts from reality within a few turns. This is the core insight of [ReAct (Yao et al., arXiv:2210.03629)](https://arxiv.org/abs/2210.03629): interleaving explicit reasoning traces with actions — and grounding the next thought in the *observed* tool result — measurably reduces hallucination compared with a model that acts without reading back. Honest observation is also why [tool retries must be idempotent](/library/tool-retries-idempotency): the loop will re-run steps, and a re-observed world has to be trustworthy for the next decision to be sound.

## Termination is a first-class part of the loop, not an afterthought

A loop with no termination condition is not an agent, it is an infinite regress with a bill attached. Every loop needs bounded iteration, explicit stop conditions (goal met, no-progress detected, budget exhausted, human handoff), and loud failure when it hits a limit. Left unbounded, an agent will retry a failing step until it runs out of [token budget](/library/token-budgets) or trips [rate limits and backpressure](/library/rate-limiting-backpressure) — and a run that silently stops mid-task is far harder to debug than one that ends with "no progress for 3 iterations, halting." Pair termination with [planning and decomposition](/library/planning-decomposition) so the loop has a checkable notion of "done," and with [durable execution](/library/durable-agent-execution) so a long loop can survive a crash without restarting from zero.

## Bounded context keeps the loop honest over long horizons

Because the loop runs many times, whatever it carries forward compounds. Feed the model the whole history and attention degrades and cost balloons; feed it too little and it forgets the goal. Bounded, curated context — recent observations, the active plan, and durable facts pulled from [memory tiers](/library/agent-memory-tiers) rather than the raw transcript — is what lets a loop run for dozens of turns without either forgetting why it started or drowning in its own scrollback. The loop is only as reliable as the state it observes each turn, so treat context as a working set to maintain, not a log to accumulate.

*Sources: [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents) · [Yao et al., ReAct (arXiv:2210.03629)](https://arxiv.org/abs/2210.03629).*

*Related: [planning & decomposition](/library/planning-decomposition), [tool retries & idempotency](/library/tool-retries-idempotency), [token budgets](/library/token-budgets), [agent memory tiers](/library/agent-memory-tiers), [durable execution](/library/durable-agent-execution), [agent evaluation](/library/agent-evals).*
