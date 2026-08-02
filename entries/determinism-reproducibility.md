---
id: determinism-reproducibility
title: "Determinism and reproducibility"
url: https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [determinism, reproducibility, lower, temperature, reduce]
---

Lower temperature can reduce sampling variation for extraction and routing, but it does not make a hosted model or a multi-step agent deterministic because model revisions, parallel tools, retrieval indexes, and external state can change outcomes. Record model snapshots when available, parameters, prompts, tool and data versions, seeds where supported, timestamps, and complete trajectories, then evaluate with repeated trials and outcome tolerances. For reasoning models, follow provider guidance on sampling controls and put exact calculations, policy decisions, and invariants in deterministic code rather than relying on identical natural-language reasoning traces.

## Deep dive

The first thing to unlearn is that `temperature=0` gives you determinism. It does not, and understanding *why* changes how you build reliable agents. Greedy decoding removes the sampling step, but the token probabilities being argmax'd are themselves not bit-identical run to run — so the same prompt to the same model version can still produce different text. Chasing reproducibility by turning temperature down and being surprised when outputs still drift is the most common wasted afternoon in agent evaluation.

## Why "the same prompt, same model" still varies: batch invariance

Thinking Machines' [Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) pins the real culprit, and it is not "GPUs are random." Floating-point addition is non-associative — `(a+b)+c` need not equal `a+(b+c)` — so the *order* of reductions changes the last bits of a result. On a shared inference server your request is dynamically **batched** with other users' requests, and the batch size changes how matmuls and reductions are tiled, which changes that order, which occasionally flips a token. The nondeterminism is upstream of sampling: it comes from your request sharing a server with a fluctuating, invisible set of other requests. The fix the piece demonstrates is *batch-invariant kernels* — making the numerics independent of batch size — which is a serving-side property you usually cannot control as an API consumer. So treat run-to-run token drift on a hosted endpoint as a given, not a bug to eliminate.

## Pin what you can; version everything else

Determinism is layered. Sampling controls (temperature, top-p, and a `seed` where the provider supports it) reduce *sampling* variance but not batch-induced variance. Above that sits an entire environment that silently changes answers: the model **snapshot** (a provider bumping the model behind the same name is the classic "our evals moved overnight" — pin a dated snapshot when the API offers one, per provider [model guidance](https://docs.claude.com/en/docs/about-claude/models/choosing-a-model)), plus retrieval indexes, tool versions, and any external state the [agent loop](/library/agent-loop) reads. Reproducibility is therefore a *recording* discipline, not a flag: log the model snapshot, parameters, full prompt, tool/data versions, seed, timestamp, and the complete trajectory. Without that record you cannot even tell whether a regression came from your code, a retrieval change, or a silent model update.

## Design for tolerance, and make the load-bearing parts deterministic

Because exact-match reproducibility is unattainable on hosted models, [evaluate](/library/agent-evals) with repeated trials and outcome tolerances — pass@k, semantic-equivalence checks, and metric bands — rather than string equality against a golden transcript; a suite that demands identical text will flake forever and teach the team to ignore it. And move anything that must be exact out of the model's head: arithmetic, policy decisions, thresholds, and invariants belong in deterministic code the agent *calls*, not in a natural-language reasoning trace you hope reproduces. [Structured outputs](/library/structured-outputs) help by constraining the surface you diff, and [idempotent tools](/library/tool-retries-idempotency) keep a re-run trajectory from doubling side effects. The goal is not a bit-identical agent — it is one whose *decisions* are reproducible even when its *wording* is not.

*Sources: [Thinking Machines — Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/) · [Anthropic — Choosing a model (snapshots & versions)](https://docs.claude.com/en/docs/about-claude/models/choosing-a-model).*

*Related: [agent evaluation](/library/agent-evals), [structured outputs](/library/structured-outputs), [tool retries & idempotency](/library/tool-retries-idempotency), [what an agent loop is](/library/agent-loop), [token budgets](/library/token-budgets).*
