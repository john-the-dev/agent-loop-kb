---
id: retrieval-quality
title: "Chunking, hybrid retrieval, and reranking"
url: https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview
category: evaluation
source_type: docs
status: current
grade: B
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "source fetched live 2026-08-30: HTTP 200, title 'Hybrid Search Overview - Azure AI Search | Microsoft Learn'"
  - "CAVEAT driving B not A: the source substantiates the hybrid-retrieval half well, but the entry also asserts chunking boundaries and reranking practice that this page does not cover — so it under-evidences part of its own claim"
  - "NEGATIVE CONTROL for this batch: learn.microsoft.com returns 404 on a fabricated path (/azure/search/not-a-real-page-xyz), so the 200s above are real pages and not a docs catch-all route, checked 2026-08-30"
tags: [chunking, hybrid, retrieval, reranking, chunk]
---

Chunk along semantic boundaries and keep headings, source URL, timestamps, permissions, and neighboring relationships; chunks should be small enough to isolate an answer but large enough to preserve definitions and exceptions. Hybrid retrieval combines lexical search, which excels at exact identifiers and rare terms, with vector search for paraphrases, then a reranker scores a broader candidate set before context assembly. Evaluate retrieval separately with recall at k, ranking metrics, citation coverage, and hard negatives, and apply access filters before results reach the model.

## Deep dive

Most "the agent hallucinated" reports in RAG systems are really "retrieval returned the wrong chunks and the model did its best with them." Retrieval quality is a pipeline property — chunking, candidate generation, reranking, and assembly each lose information independently — and the failures compound silently unless you evaluate each stage on its own.

## Chunking: where answers get cut in half

Chunk along semantic boundaries — headings, sections, list items — not fixed character counts that split a definition from its exception. Each chunk should carry its metadata: source URL, title, timestamps, permissions, and links to neighboring chunks so the assembler can widen context when needed. The subtle failure is that a chunk that reads fine to a human is ambiguous in isolation: "the limit is 100" retrieved without its section heading answers the wrong question confidently. [Anthropic's contextual retrieval work](https://www.anthropic.com/news/contextual-retrieval) attacks exactly this by prepending a short generated context line to every chunk before embedding — in their measurements, contextualized embeddings plus BM25 cut retrieval failure rates substantially versus vanilla chunking.

## Hybrid candidates: lexical and vector see different things

Vector search finds paraphrases and conceptual matches but is weak on exact identifiers — error codes, SKUs, function names, rare proper nouns — precisely where lexical search (BM25) excels. Production systems run both and fuse results, commonly with reciprocal rank fusion; [Azure AI Search's hybrid overview](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) documents the pattern and why fused candidates beat either method alone. If your corpus contains code, logs, or part numbers and you run vector-only, you have a known blind spot.

## Reranking: spend precision where it's cheap

First-stage retrieval optimizes recall over millions of items and is deliberately coarse. A [cross-encoder reranker](https://www.sbert.net/examples/applications/cross-encoder/README.html) then scores query and candidate *together* — far more accurate than comparing independent embeddings — over a broad candidate set (say top-50) to pick the handful that enter the context window. This two-stage split is the standard trade: cheap recall wide, expensive precision narrow. Skipping it and stuffing top-20 raw candidates into context costs tokens and, worse, buries the right answer amid plausible distractors.

## Evaluate the stages separately

Score retrieval with recall@k and ranking metrics (MRR/nDCG) against a labeled set that includes **hard negatives** — passages that look relevant but aren't — and track citation coverage: what fraction of generated claims trace to a retrieved chunk. When end-to-end quality drops, stage metrics tell you whether chunking, candidates, or reranking broke. And apply access-control filters *before* results reach the model: a chunk the user shouldn't see doesn't belong in the candidate set, let alone the context window.

*Sources: [Anthropic — Contextual retrieval](https://www.anthropic.com/news/contextual-retrieval) · [Azure AI Search — Hybrid search overview](https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview) · [SBERT — Cross-encoder reranking](https://www.sbert.net/examples/applications/cross-encoder/README.html).*

*Related: [RAG basics](/library/rag-basics), [context rot](/library/context-rot), [token budgets](/library/token-budgets), [agent memory tiers](/library/agent-memory-tiers), [groundedness and hallucination](/library/groundedness-hallucination).*
