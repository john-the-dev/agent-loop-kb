---
id: prompt-caching
title: "Prompt caching and context reuse"
url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
category: memory
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [prompt, caching, context, reuse, reduces]
---

Prompt caching reduces latency and input cost when many calls share a long stable prefix such as system instructions, tool definitions, examples, or reference documents. Put stable content before volatile conversation state, keep serialization byte-for-byte consistent, and monitor cache creation, hit rate, read tokens, expiration, and provider-specific minimums. Caching is an optimization rather than memory: invalidate or version cached prefixes when policies, permissions, schemas, or source data change.
