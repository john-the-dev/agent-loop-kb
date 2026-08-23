---
id: operations-agents
title: "Production back-office agents"
url: https://www.uipath.com/ai/agentic-ai
category: orchestration
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [production, back, office, useful, documents]
---

Back-office agents are useful when documents vary and judgment is needed, while deterministic RPA remains preferable for stable screens and fixed rules; combine them by letting the model interpret inputs and a workflow engine enforce state transitions. Document pipelines should retain the original, extract fields with page or region provenance, validate totals and identifiers, deduplicate work, and route low-confidence or policy-exception cases to humans. For invoice processing, the agent can classify and extract an invoice, but deterministic services perform vendor matching, three-way matching, duplicate detection, and payment approval.

## Deep dive

The useful question for back-office automation is not "can an agent do this?" but **"does this task vary in ways a rule cannot enumerate?"** Get that wrong in either direction and you pay: rules on genuinely variable input produce endless exception queues, and models on stable input produce nondeterminism where you had certainty.

## Where the line falls

**Deterministic automation wins** when the screen, form, or file layout is stable, the rules are fixed and enumerable, and the volume is high. It is cheaper per transaction, exactly reproducible, and auditable by reading the code. Replacing a working RPA path with a model because agents are interesting is a downgrade.

**Agents win** when documents arrive in arbitrary formats from parties you don't control, when the task requires reconciling conflicting sources, or when the rule is genuinely fuzzy ("is this invoice a duplicate of that one?" where vendor names, dates, and amounts all differ slightly). These are the cases that historically became "the exception queue a human works through."

**The combination is usually the right answer**, and the division of labor is specific: the model interprets *inputs* — extracting, classifying, matching, summarizing — and a workflow engine owns *state transitions*. The model proposes; the engine decides what may happen next.

## Why the workflow engine keeps the state machine

This is the load-bearing design choice, and it is worth being precise about why.

A back-office process is a state machine with compliance meaning: an invoice moves received → matched → approved → paid, and skipping a state is a control failure, not a bug. If the model decides transitions, then the set of reachable states is whatever the model outputs today, and it can change with a prompt edit or a model upgrade. If the engine decides them, the reachable set is fixed and reviewable, and the model's influence is confined to supplying *evidence* for a transition that the engine either accepts or rejects.

Practically: the engine enforces the sequence, the required approvals, the timeouts, and the retries. The agent fills in the parts that require reading something.

## Document pipelines need provenance, not just extraction

An extracted field without a source is an assertion. An extracted field with a page, a bounding box, or a text span is a claim someone can check in seconds. Provenance is what makes human review fast enough to be economical — a reviewer confirming a highlighted region works an order of magnitude faster than one hunting through a PDF.

It is also the difference between a correctable pipeline and an unfalsifiable one. When a downstream number is wrong, provenance tells you whether extraction misread the document or a rule misused a correct value. Without it, every error investigation starts from zero.

Design the pipeline so that **every value the process acts on carries a pointer back to where it came from**, and so that low-confidence extractions are routed rather than silently defaulted.

## Idempotency and replay

Back-office work touches systems of record — ERPs, ledgers, ticketing. Those systems generally do not distinguish a retry from a new instruction, so a re-run after a partial failure can post a second journal entry or create a duplicate vendor.

Give each unit of work a deterministic key derived from the source document and the operation, record completion before acknowledging, and check that record before acting. This is the same discipline that queue-driven agent steps need, and for the same reason: the infrastructure will re-deliver, and the only question is whether the effect is duplicated.

## Human-in-the-loop that stays meaningful

Approval gates decay. A reviewer presented with 200 auto-approved-looking items will approve all 200, and the control becomes theater. Two habits keep it real:

- **Route by uncertainty, not by rule alone.** Send the reviewer the ambiguous cases with evidence attached, and let the confident ones through automatically. A queue that is mostly clear cases trains the reviewer to skim.
- **Measure the override rate.** If a human approval step never rejects anything, it is not a control — it is latency. That is a finding to act on, whether by tightening what routes to review or by removing a gate that adds nothing.

## What to instrument

Straight-through-processing rate (what fraction completes with no human touch), exception reasons grouped by cause, extraction confidence against realized error, override rate per gate, and cost per document. The first tells you whether the automation is working; the rest tell you *where* to spend the next increment of effort — which is usually a specific document type or a specific vendor, not the model.
