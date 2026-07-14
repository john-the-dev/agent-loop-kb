---
id: rag-basics
title: "Retrieval-augmented generation basics"
url: https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview
category: evaluation
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [retrieval, augmented, generation, basics, embeds]
---

Retrieval-augmented generation embeds a question, retrieves semantically similar passages from a knowledge base, and places those passages in the model context. Good RAG systems preserve source metadata, retrieve compact relevant chunks, instruct the model to stay grounded, and evaluate retrieval separately from answer generation.
