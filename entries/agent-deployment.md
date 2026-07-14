---
id: agent-deployment
title: "Deploying agents on serverless infrastructure"
url: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
category: memory
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [deploying, serverless, infrastructure, treat, workers]
---

Treat serverless agent workers as stateless and persist conversation state, plans, checkpoints, idempotency records, and pending approvals in durable services because instances can disappear or be retried at any time. Cold starts, execution-duration limits, connection limits, and burst concurrency make long agent loops better suited to queues plus resumable steps than one synchronous function invocation. Pin prompt, model, tool, and schema versions; reuse safe connections and cached clients within a warm instance, but never rely on local memory for correctness.
