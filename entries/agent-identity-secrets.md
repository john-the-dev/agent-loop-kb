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

## Deep dive

Most agent security writing starts at the wrong end — the credential. The harder question is *whose authority is this action taken under*, and agents blur that by design: one process reads a webpage, a teammate's message, and a production API key inside the same context window. The credential is downstream. Identity is the thing that has to be right first.

## An agent's identity is not the caller's identity

The default mistake is letting the agent inherit the operator's authority for everything it does. It works until the agent starts handling input from anyone else — and then every message is executing as you. [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final) frames zero trust around per-request authorization by an explicit policy decision point rather than by network position or session inheritance, and that maps cleanly onto agents: **each inbound message carries its own trust tier, and the tier — not the transport — decides what the agent may do.** A message that arrives on your authenticated connection is not thereby yours; a shared channel means anyone in it can produce text your agent will read.

Two properties make a tier real rather than decorative. It must be **assigned by the receiving edge**, not derived from anything the sender controls — a sender who can set their own tier has no tier. And it must **fail closed**: unknown sender, unreadable policy file, or a crashed authorization hook all have to mean *less* access, not more. A guard that silently allows on error is a guard that reports success right up until it matters. This is also why a policy file the agent itself can write is not an authorization boundary — self-forged authority is not authority.

## Secrets: hold a capability, not a key

Once identity is settled, credential handling gets simpler, and the rule is that **the model should never see the secret**. A trusted executor outside the context window resolves a named capability (`send_email`, `read_calendar`) into a scoped, short-lived credential, performs the call, and returns only the result. The model manipulates a handle; the key never enters a prompt, a tool result, a log line, or persistent [memory](/library/agent-memory-tiers) — which matters because anything in context can be exfiltrated by a successful [prompt injection](/library/prompt-injection-defense), and anything in memory outlives the run that leaked it.

Two failure modes deserve naming because they are quiet. **A credential proxy that silently substitutes a different account** turns every usage number and bill into a measurement of someone else's identity — the calls succeed, so nothing alerts; only an identity check catches it. And **secrets written to disk mid-write are readable**: create credential files with owner-only permissions atomically — `mkstemp` with `0600`, write, `fsync`, `os.replace` — rather than creating then `chmod`-ing, which leaves a window where the file exists and is world-readable.

## Revocation is the part everyone skips

Granting is easy to get right because you are thinking about it. Revocation happens later, under time pressure, and it is where the design is actually tested: when a user leaves, a connector is disconnected, or a run is compromised, **in-flight sessions and cached grants must die too**, not just the record in the database. Bind each grant to an authenticated principal and source rather than to a bearer token that anyone holding can replay, keep the principal-to-action mapping auditable, and make [human approval](/library/human-approval-gates) the gate for the irreversible actions — sends, deletes, payments, config changes — so that an authorization mistake still needs a second, human signature before it becomes permanent. Log the *decision*, not just the outcome, or your [observability](/library/agent-observability) will tell you what happened without ever telling you under whose authority.

*Sources: [NIST SP 800-207 — Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final).*

*Related: [prompt injection defense](/library/prompt-injection-defense), [human approval gates](/library/human-approval-gates), [guardrails and safety](/library/guardrails-safety), [agent memory tiers](/library/agent-memory-tiers), [agent observability](/library/agent-observability), [subagents](/library/subagents).*
