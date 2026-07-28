---
id: context-compaction
title: "Context management and compaction"
url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
category: tools
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [context, management, compaction, manage, retain]
---

Manage context as a budget: retain the system policy, current objective, unresolved constraints, recent actions, exact error messages, and identifiers needed for future tool calls, while dropping duplicated prose and superseded attempts. A sliding window preserves local conversational detail, whereas periodic summaries compress older history; summaries should separate verified facts from hypotheses and link to durable artifacts rather than paraphrasing critical code or numbers. Trigger compaction before the window is full and test that an agent can resume from the compacted state without losing commitments or repeating side effects.
