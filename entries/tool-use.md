---
id: tool-use
title: "Reliable tool use"
url: https://platform.openai.com/docs/guides/function-calling
category: tools
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [reliable, tool, using, work, best]
---

Tool-using agents work best with narrow tools, explicit schemas, actionable error messages, and observable results. Validate arguments before execution, use idempotency keys for side effects, limit permissions, and return structured outputs so the model can accurately decide what to do next.
