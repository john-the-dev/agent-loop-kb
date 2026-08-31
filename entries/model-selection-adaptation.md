---
id: model-selection-adaptation
title: "Choosing models, prompting, RAG, and fine-tuning"
url: https://docs.claude.com/en/docs/about-claude/models/choosing-a-model
category: evaluation
source_type: blog
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, 'Choosing the right model - Claude Platform Docs'"
  - "CAVEAT driving B not A: primary and correct for choosing among ONE vendor's models, but the entry also claims ADAPTATION — switching tiers at runtime as task difficulty changes — which a selection guide does not cover"
tags: [choosing, models, prompting, fine, tuning]
---

Choose the smallest model that meets measured quality, tool-use, context, latency, modality, privacy, and reliability requirements on your own task distribution, then route exceptional cases upward. Improve instructions and examples when behavior is underspecified, use RAG when answers depend on changing or private facts that need provenance, and fine-tune when many examples define a stable behavior, format, or domain pattern that prompting cannot deliver economically. Fine-tuning does not reliably teach fresh facts or replace authorization, retrieval, or deterministic business logic, and every adaptation choice should be validated by the same regression suite.

## Deep dive

Most model-selection debate is conducted on the wrong evidence. Public leaderboards measure a distribution that is not yours, and vendor benchmarks measure the one where their model wins. **The only ranking that predicts production behavior is the one you compute on your own task distribution** — which means model selection is downstream of evaluation, not a substitute for it.

Everything below assumes you have an eval set. If you don't, building one is the higher-priority work.

## Start small and route upward

The default should be the smallest model that clears your measured quality bar, with exceptional cases escalated — not the largest model everywhere with cost-cutting attempted later. Two reasons this ordering is better than its reverse:

1. **Small-first exposes the hard cases.** When a small model handles 85% of traffic, the 15% it fails is a *characterized* set you can route, and you learn what actually makes your task hard. Starting large hides that structure behind uniform adequacy.
2. **Latency is a quality attribute for agents, not just a cost one.** An agent loop makes several model calls per user-visible action, so per-call latency multiplies. A model that is twice as fast and marginally worse per call can produce a better *agent* because it affords an extra verification step within the same budget.

Route on measurable signals — task type, input length, tool-call complexity, or a confidence/verifier score — and log every escalation. The escalation rate is one of the more useful health metrics you can keep: when it drifts up, something changed in your traffic or your prompts.

## The selection criteria that actually differentiate

Quality is table stakes. In practice agents are decided by:

- **Tool-use reliability.** Does it emit well-formed calls, respect schemas, and *stop* calling tools when it has enough? A model that is smarter in prose but sloppier in structured output is worse for an agent.
- **Long-context behavior, not the context number.** The advertised window says what fits, not what the model attends to. Test retrieval-in-the-middle on your own documents.
- **Structured-output conformance.** Constrained decoding or schema enforcement changes the calculus here — a model with weaker free-form JSON can be fine behind a grammar.
- **Latency shape**, including time-to-first-token if you stream.
- **Privacy and deployment constraints**, which are frequently the binding constraint and are worth establishing *first* — they can eliminate most of the candidate set before quality matters at all.

## Choosing among prompting, RAG, and fine-tuning

These solve different problems and are routinely swapped for each other, which is why so much effort gets spent for so little movement. The diagnostic question is **what kind of thing is missing**:

| the failure is… | the fix is |
|---|---|
| the model doesn't know *what you want* | better instructions, examples, output schema |
| the model doesn't know *the facts* | retrieval |
| the model doesn't reliably produce *the form* | fine-tuning, or constrained decoding |

**Underspecified behavior** — inconsistent formatting, missed edge rules, wrong tone — is an instruction problem. Fixing prompts is cheap, immediately reversible, and improves as models improve. Exhaust it first, because a fine-tune trained on top of a vague spec bakes the vagueness in.

**Missing or changing knowledge** is a retrieval problem. Facts that postdate training, are private to your organization, or change frequently should be fetched, not memorized. Fine-tuning on a snapshot of a moving corpus produces a model that is confidently out of date and gives you no way to cite sources.

**Persistent form or style mismatch that survives good prompting**, or a need to compress a long prompt into a smaller model, is where fine-tuning pays. It is also the option with the largest hidden cost: a training set to build and maintain, an eval to prevent regressions, and a re-run every time you want to move to a newer base model. Treat "we will have to redo this on the next model generation" as part of the price.

## Re-evaluate on a schedule, not on vibes

Model quality, pricing, and availability all move. A selection made six months ago on a task distribution that has since shifted is an unexamined assumption sitting in your critical path. Keep the eval runnable as a single command, re-run it on candidate models when they ship, and record the result with the date — so the next person asking "why this model?" gets an answer with evidence attached rather than institutional memory.
