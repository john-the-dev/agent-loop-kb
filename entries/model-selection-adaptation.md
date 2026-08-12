---
id: model-selection-adaptation
title: "Choosing models, prompting, RAG, and fine-tuning"
url: https://docs.claude.com/en/docs/about-claude/models/choosing-a-model
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [choosing, models, prompting, fine, tuning]
---

Choose the smallest model that meets measured quality, tool-use, context, latency, modality, privacy, and reliability requirements on your own task distribution, then route exceptional cases upward. Improve instructions and examples when behavior is underspecified, use RAG when answers depend on changing or private facts that need provenance, and fine-tune when many examples define a stable behavior, format, or domain pattern that prompting cannot deliver economically. Fine-tuning does not reliably teach fresh facts or replace authorization, retrieval, or deterministic business logic, and every adaptation choice should be validated by the same regression suite.

## Deep dive

The adaptation question is usually asked backwards. Teams start from "should we fine-tune?" — a question about *technique* — when the useful question is "what kind of gap is this?" Prompting, retrieval, and fine-tuning each fix a different failure, and picking by technique means you find out which one you needed after you have paid for it.

## Diagnose the gap before choosing the lever

Three gaps, three answers, and they are not interchangeable. If the model **could** do the task but is guessing at what you want — inconsistent format, missing edge cases, wrong tone — the behaviour is *underspecified* and the fix is instructions and examples. If the model doesn't **know** something because it is private, fresh, or changes — your pricing, this customer's history, yesterday's incident — that is a knowledge gap and the fix is [retrieval](/library/rag-basics), which also gives you provenance and revocability that weights never will. If the model knows and understands but cannot **reliably produce the shape** you need across thousands of examples, that is a behaviour gap and fine-tuning earns its keep.

The expensive mistake is fine-tuning a knowledge gap. Weights are a poor database: you cannot cite them, cannot revoke a fact from them, cannot update one row, and re-training to correct a single error is absurd. [Anthropic's model guidance](https://docs.claude.com/en/docs/about-claude/models/choosing-a-model) frames selection around measured requirements rather than reputation, and the same discipline applies here — **fine-tuning does not reliably teach fresh facts, and it never replaces authorization, retrieval, or deterministic business logic.** A tuned model that has "learned" your access rules is not enforcing them.

## Smallest model that passes, then route upward

Start from the smallest model that meets measured quality on **your** task distribution, not on a public leaderboard — benchmark rank is a claim about someone else's distribution. Then route exceptional cases upward rather than paying the large model's price on every call: escalate on a confidence signal, a validation failure, or a [structured output](/library/structured-outputs) that failed to parse. That escalation path is worth building early, because it converts model choice from a single irreversible decision into a dial you can turn per-case, and it is the mechanism behind most real [cost control](/library/agent-cost-control) — cost per *completed task*, not per call.

Selection is also multi-dimensional in a way "which is smartest" hides: tool-use reliability, context window, latency under your [streaming](/library/latency-streaming) requirements, modality, and privacy constraints can each disqualify a model that wins on raw quality. A model that reasons beautifully and calls tools unreliably is the wrong model for an agent.

## One regression suite judges every lever

Whatever you change — a prompt, a retrieval index, a model, a fine-tune — validate it against the **same** [evaluation](/library/agent-evals) suite, or you cannot compare the options you are choosing between. This is also the only defence against the most common self-deception in adaptation work: a change that improves the examples you were looking at while quietly regressing the ones you were not. Pin the model snapshot when you evaluate, since a provider silently moving the model behind a name will move your results without touching your code — the [reproducibility](/library/determinism-reproducibility) discipline is what makes a comparison mean anything at all.

*Sources: [Anthropic — Choosing a model](https://docs.claude.com/en/docs/about-claude/models/choosing-a-model).*

*Related: [RAG basics](/library/rag-basics), [agent evaluation](/library/agent-evals), [agent cost control](/library/agent-cost-control), [structured outputs](/library/structured-outputs), [determinism and reproducibility](/library/determinism-reproducibility), [latency and streaming](/library/latency-streaming).*
