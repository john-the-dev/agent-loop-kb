---
id: rag-basics
title: "Retrieval-augmented generation basics"
url: https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview
category: evaluation
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [retrieval, augmented, generation, basics, embeds]
---

Retrieval-augmented generation embeds a question, retrieves semantically similar passages from a knowledge base, and places those passages in the model context. Good RAG systems preserve source metadata, retrieve compact relevant chunks, instruct the model to stay grounded, and evaluate retrieval separately from answer generation.

## Deep dive

RAG's premise — introduced by the original [retrieval-augmented generation paper (arXiv:2005.11401)](https://arxiv.org/abs/2005.11401) — is that a model shouldn't have to memorize what it can look up: pair a generator with a retriever over an external corpus, and answers can stay current and attributable without retraining. In 2026 the architecture is table stakes; what separates working systems from demos is everything around the embedding search.

## The pipeline, honestly

A production pipeline is: chunk → index → retrieve → (rerank) → assemble context → generate → cite. Each stage fails independently, which is why [Microsoft's RAG overview](https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview) treats retrieval as an information-retrieval problem first and an LLM problem second. The two highest-leverage upgrades over naive cosine search are usually **hybrid retrieval** (dense vectors + BM25 keyword matching — embeddings miss exact identifiers, error codes, and product names that keyword search catches trivially) and a **reranker** over the top-k candidates.

**Chunking is where context dies silently.** A chunk that reads fine in isolation often loses the fact that anchors it ("the company", "this method" — which one?). [Anthropic's contextual retrieval](https://www.anthropic.com/news/contextual-retrieval) attacks exactly this: prepend a short chunk-specific explanatory context (generated once, at index time) before embedding, and combine with BM25 — their published benchmark cut top-20 retrieval failure rates by roughly half, with reranking pushing failures down further.

## Grounding is an instruction, not a hope

The model must be told what the retrieved context is *for*: answer from it, say what's missing instead of guessing, and cite which passage supports which claim. Preserve source metadata (URL, title, date) through the whole pipeline so citations are real links, not decorations — and so stale documents can be filtered by date at query time.

## Evaluate the stages separately

A wrong answer has two very different causes: the passage wasn't retrieved, or it was retrieved and the model ignored or mangled it. Score retrieval on its own (did the gold passage appear in top-k?) and generation on its own (given the right passages, was the answer faithful?). Teams that only measure end-to-end answer quality routinely tune the wrong stage.

## When RAG is the wrong tool

Facts that fit comfortably in the prompt don't need a retriever. Stable behavioral patterns are better taught by prompting or fine-tuning. RAG earns its complexity when the corpus is large, changing, or private, and when provenance matters.

*Sources: [Lewis et al. — Retrieval-Augmented Generation (arXiv:2005.11401)](https://arxiv.org/abs/2005.11401) · [Anthropic — Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) · [Microsoft — RAG overview](https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview).*

*Related: [retrieval quality](/library/retrieval-quality), [context rot](/library/context-rot), [agent memory tiers](/library/agent-memory-tiers), [evaluation strategy](/library/evaluation-strategy), [groundedness and hallucination](/library/groundedness-hallucination).*
