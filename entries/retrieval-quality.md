---
id: retrieval-quality
title: "Chunking, hybrid retrieval, and reranking"
url: https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [chunking, hybrid, retrieval, reranking, chunk]
---

Chunk along semantic boundaries and keep headings, source URL, timestamps, permissions, and neighboring relationships; chunks should be small enough to isolate an answer but large enough to preserve definitions and exceptions. Hybrid retrieval combines lexical search, which excels at exact identifiers and rare terms, with vector search for paraphrases, then a reranker scores a broader candidate set before context assembly. Evaluate retrieval separately with recall at k, ranking metrics, citation coverage, and hard negatives, and apply access filters before results reach the model.
