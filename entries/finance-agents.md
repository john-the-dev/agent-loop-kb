---
id: finance-agents
title: "Production agents in finance"
url: https://www.nist.gov/privacy-framework
category: general
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, finance, need, data, minimization]
---

Finance agents need data minimization, field-level protection for PII, least-privilege access, immutable audit trails, retention controls, and jurisdiction-specific compliance review. Keep ledger math, eligibility, limits, sanctions screening, and transaction authorization in deterministic services; the model may collect evidence or explain a result but must not override those checks. For an expense-review use case, the agent can extract receipt fields and flag policy anomalies with source spans, while rules validate totals and a human approves ambiguous or high-value reimbursements.

## Deep dive

Finance is where agent mistakes stop being embarrassing and start being regulated events. The design rule that survives contact with auditors: **the model gathers and explains; deterministic systems decide and move money.** Everything else in this entry is elaboration of that split.

## Why the split is non-negotiable

Three properties of financial workflows make free-form model authority unacceptable:

1. **Regulatory classification.** The [EU AI Act's Annex III](https://artificialintelligenceact.eu/annex/3/) explicitly lists creditworthiness evaluation as high-risk, which triggers documentation, human-oversight, and accuracy obligations. In the US, model-driven decisions inherit existing model-risk-management regimes — the Federal Reserve's [SR 11-7](https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm) expects inventoried models, validation independent of developers, and documented limitations. An LLM that silently decides is an unvalidated model in production.
2. **Determinism requirements.** Ledger math, limits, sanctions screening, and transaction authorization have exact right answers. A system that is 99% accurate at arithmetic is a defective calculator. Agents add value in the fuzzy layer — document extraction, anomaly narration, evidence assembly — not by re-deriving what a rules engine already computes exactly.
3. **Audit reconstruction.** When a regulator or dispute process asks "why was this transaction approved," the answer must be reconstructable. That means immutable logs of what the agent saw, what it extracted, what the deterministic checks returned, and who approved — the [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) 's govern/map/measure/manage cycle presumes exactly this traceability.

## The architecture that works

A production-shaped finance agent stack has four layers: **extraction** (the model reads receipts, statements, contracts and emits structured fields with source spans, so every value points back to the pixels or text it came from); **validation** (deterministic rules recompute totals, check policy thresholds, run sanctions/KYC screens — the model's output is input to these checks, never a substitute); **decision** (rules auto-approve the clear cases; everything ambiguous, high-value, or policy-flagged routes to a human with the agent's evidence attached); and **audit** (append-only records tying each decision to model version, prompt, extracted fields, rule results, and approver identity).

PII handling runs through all four: minimize what enters the context window (the model rarely needs full account numbers to classify an expense), apply field-level protection so retention rules can target exactly the sensitive fields, and keep retention jurisdiction-aware.

## Failure modes to design against

- **Confident extraction of absent data** — the model "reads" a total that isn't on the receipt. Source spans plus deterministic recomputation catch this; trusting the number alone doesn't.
- **Authority creep** — a copilot that starts as "drafts the approval memo" quietly becomes the de-facto approver because humans rubber-stamp. Measure override rates; a reviewer who never rejects is not a control.
- **Cross-tenant leakage** — retrieval that can see other customers' documents turns one prompt injection into a data breach. Scope retrieval credentials per case, not per service.

*Sources: [EU AI Act Annex III](https://artificialintelligenceact.eu/annex/3/) · [Federal Reserve SR 11-7](https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm) · [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework).*

*Related: [human approval gates](/library/human-approval-gates), [prompt injection defense](/library/prompt-injection-defense), [agent observability](/library/agent-observability), [legal agents](/library/legal-agents).*
