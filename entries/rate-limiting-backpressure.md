---
id: rate-limiting-backpressure
title: "Rate limiting and backpressure"
url: https://developers.openai.com/api/docs/guides/rate-limits
category: memory
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [rate, limiting, backpressure, model, providers]
---

Model providers can limit requests, input tokens, output tokens, or concurrent work, so admission control must estimate token load rather than count requests alone. Use per-tenant quotas, bounded queues, concurrency semaphores, exponential backoff with jitter, and provider reset headers; shed or defer low-priority work before queues consume all memory or exceed user deadlines. Propagate cancellation through agent and tool calls, and avoid synchronized retry storms or unbounded worker fan-out after a limit clears.
