---
id: durable-agent-execution
title: "Durable execution and checkpointing"
url: 
category: tools
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [durable, execution, checkpointing, long, running]
---

Long-running agents should execute as resumable state machines whose durable checkpoint records the current step, validated state, completed side effects, pending approvals, retry counters, and versioned inputs. Use an outbox or equivalent transactional pattern when a state update and external message must agree, and assign idempotency keys so crash recovery can safely replay a step. Define terminal states, cancellation and compensation paths, and migration behavior for runs that outlive a prompt, model, tool, or schema deployment.
