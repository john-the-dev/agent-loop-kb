---
id: latency-streaming
title: "Latency and streaming agent results"
url: https://developers.openai.com/api/docs/guides/latency-optimization
category: evaluation
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [latency, streaming, results, optimize, both]
---

Optimize both time to first useful feedback and total task time: stream text or structured progress, acknowledge long-running work immediately, and expose tool status without leaking private reasoning. Parallelize independent retrievals or tool calls, prefetch predictable context, cache stable prefixes, and avoid serial model calls that code could replace. Streaming improves perceived speed but does not reduce completion latency by itself, so preserve cancellation, backpressure, and a final authoritative result distinct from partial output.
