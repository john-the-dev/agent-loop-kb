---
id: agent-identity-secrets
title: "Agent identity and secret management"
url: https://csrc.nist.gov/pubs/sp/800/207/final
category: memory
source_type: blog
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence: []
tags: [identity, secret, management, give, each]
---

Give each agent workload a distinct identity and short-lived, task-scoped credentials instead of placing broad API keys in prompts, tool output, logs, or persistent memory. A trusted executor should obtain secrets only after policy checks, constrain target resources and operations, and return the minimum result rather than exposing raw credentials to the model. Rotate credentials, audit principal-to-action mappings, isolate tenants, and revoke active sessions when a user, connector, or agent run loses authorization.
