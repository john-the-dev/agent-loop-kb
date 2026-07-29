---
id: planning-decomposition
title: "Planning and task decomposition"
url: https://arxiv.org/abs/2210.03629
category: general
source_type: paper
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-29
superseded_by: null
evidence: []
tags: [planning, decomposition, react, interleaves, reasoning]
---

ReAct interleaves reasoning, actions, and observations so the agent can revise its approach from environmental feedback; plan-then-execute first creates a task graph and is better when dependencies and approval points must be visible. Decompose work into verifiable steps with explicit inputs, outputs, dependencies, and stopping conditions, then replan when observations invalidate assumptions rather than blindly following the original plan. Reflection can improve a failed attempt, but bound reflection rounds and require new evidence or a changed action to prevent expensive self-critique loops.

## Deep dive

The gap between a demo agent and a reliable one is usually planning. A model that can answer any single question still fails at multi-step tasks — not because it can't do the steps, but because it commits to a bad plan early, never revises it, and burns its budget executing a doomed approach with confidence. Good planning is less about generating the perfect plan up front and more about staying able to change it.

## Two shapes: interleaved vs plan-first

**ReAct** ([arXiv:2210.03629](https://arxiv.org/abs/2210.03629)) interleaves reasoning, action, and observation — think a little, act, observe the result, think again. Its strength is *feedback incorporation*: the agent revises course from what the environment actually returned, which is essential when outcomes are uncertain (search, web navigation, debugging). Its weakness is that without structure it can wander.

**Plan-then-execute** first builds a task graph, then runs it. It shines when dependencies and approval points must be *visible before execution* — a deploy pipeline, a multi-file refactor, anything where a human needs to sanction the plan or where steps have ordering constraints. The cost is rigidity: a plan made before any observation is a hypothesis, and treating it as a contract is how agents march off cliffs.

Most robust systems combine them: plan coarsely, execute with ReAct-style feedback inside each step, and replan when observations invalidate assumptions.

## Decompose into *verifiable* steps

The load-bearing word is verifiable. A step like "research the topic" has no stopping condition and no success test — the agent can't tell when it's done or whether it succeeded. A good decomposition gives each step explicit **inputs, outputs, dependencies, and a stopping condition**. This is what makes [evaluation](/library/evaluation-strategy) possible at the trajectory level, and what lets a supervisor detect a stuck sub-task instead of discovering failure only at the end.

## Replanning and the reflection trap

When an observation contradicts the plan, *replan* — don't blindly execute the next queued step. But reflection has a failure mode of its own: unbounded self-critique. [Reflexion (arXiv:2303.11366)](https://arxiv.org/abs/2303.11366) showed that verbal self-feedback across attempts improves task success — but only when each reflection is grounded in *new evidence* and produces a *changed action*. A reflection loop that re-critiques the same failed attempt without new information is an expensive way to burn tokens and converge on nothing. Bound the rounds, and require every reflection to either cite a new observation or change the next action — otherwise stop and escalate.

## The supervisor's view

At scale, planning becomes a control problem: a supervisor decomposes, dispatches sub-tasks (sometimes to [subagents](/library/subagents)), monitors for stuck or looping steps against their stopping conditions, and replans on failure. The plan is a living artifact on disk, not a one-shot generation — which is also what makes the whole run resumable after a crash.

*Sources: [ReAct (arXiv:2210.03629)](https://arxiv.org/abs/2210.03629) · [Reflexion (arXiv:2303.11366)](https://arxiv.org/abs/2303.11366).*

*Related: [subagents](/library/subagents), [durable agent execution](/library/durable-agent-execution), [evaluation strategy](/library/evaluation-strategy), [the agent loop](/library/agent-loop).*
