---
id: evaluation-strategy
title: "Offline and online agent evaluation"
url: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-29
superseded_by: null
evidence: []
tags: [offline, online, evaluation, evals, provide]
---

Offline evals provide repeatable pre-release regression tests over representative tasks, adversarial cases, tool failures, and multi-step trajectories; online evals measure real completion, escalation, latency, cost, and safety signals under production traffic. Maintain frozen golden sets plus newly mined failures, run repeated trials for nondeterministic agents, and score both final outcomes and critical intermediate constraints. LLM judges are scalable but can be biased by style, verbosity, ordering, or shared model errors, so calibrate them against blinded human labels and deterministic checks and track judge-version changes.

## Deep dive

Teams usually build one eval and ask it to do two jobs: catch regressions before release and tell them how the agent behaves in production. It can't do both. Offline and online evaluation answer different questions with different data, and a strategy is the deliberate split between them — plus the pipeline that feeds one from the other.

## Offline: the regression gate

The offline suite is your frozen, repeatable pre-release check: representative tasks, adversarial cases, injected tool failures, and full multi-step trajectories. Two properties make it trustworthy. **Frozen golden sets** — if the suite changes every week, score movements are meaningless; version it like code and change it deliberately. **Repeated trials** — agent trajectories are nondeterministic, and [τ-bench (arXiv:2406.12045)](https://arxiv.org/abs/2406.12045) showed how much this matters by measuring pass^k (success on *all* k attempts of the same task): agents that look strong on a single attempt collapse when asked to succeed eight times in a row. Report consistency, not just best-case.

[Anthropic's eval guide](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) adds the discipline most teams skip: read failed transcripts and attribute each failure to model, scaffold, tool, or environment before averaging anything into a metric. A pass rate that mixes harness bugs with model regressions steers your roadmap into the wrong layer.

## Online: the reality check

Production traffic answers what offline can't: real task-completion rate, escalation-to-human rate, latency and cost distributions, and safety-signal frequency under inputs you didn't think to write. Instrument these as first-class metrics from day one. The highest-value pipeline in the whole strategy is the loop between the two: **mine online failures into offline cases**. Every production incident that surprised you is a golden-set candidate; a suite that doesn't grow from production saturates, and scores drift up while quality doesn't.

## LLM judges: scalable, biased, calibratable

Trajectory grading at scale needs LLM judges, and judge bias is well documented — [MT-Bench and the LLM-as-judge study (arXiv:2306.05685)](https://arxiv.org/abs/2306.05685) measured position bias, verbosity bias, and self-enhancement bias, alongside the subtler failure of shared blind spots between judge and judged. The mitigations are mechanical: calibrate the judge against blinded human labels on a sample, pair it with deterministic checks (schema validity, constraint satisfaction, final-state assertions) that can't be charmed by fluent prose, randomize orderings, and **version the judge** — a silent judge-model upgrade shifts scores and gets misread as an agent change. [OpenAI's evals guide](https://platform.openai.com/docs/guides/evals) treats these calibration steps as core workflow, not hygiene.

## The minimal strategy

A versioned offline suite with repeated trials and failure attribution · online completion/escalation/latency/cost/safety metrics · a standing pipeline that promotes production failures into the golden set · judges calibrated against humans and paired with deterministic checks. Anything less is either a demo gate or a dashboard — not a strategy.

*Sources: [Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) · [τ-bench (arXiv:2406.12045)](https://arxiv.org/abs/2406.12045) · [LLM-as-judge (arXiv:2306.05685)](https://arxiv.org/abs/2306.05685) · [OpenAI — Evals guide](https://platform.openai.com/docs/guides/evals).*

*Related: [agent evaluation pitfalls](/library/agent-evals), [determinism & reproducibility](/library/determinism-reproducibility), [agent observability](/library/agent-observability), [guardrails & safety](/library/guardrails-safety).*
