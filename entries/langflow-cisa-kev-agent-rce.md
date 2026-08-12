---
id: langflow-cisa-kev-agent-rce
title: "Agent-building frameworks are high-value RCE targets — Langflow's repeat CISA-KEV listings"
url: https://thehackernews.com/2026/07/cisa-adds-4-actively-exploited-adobe.html
category: security
source_type: research
status: current
grade: A   # CISA KEV (confirmed exploitation) + Sysdig field campaigns — hard evidence
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "Langflow flaws repeatedly added to CISA's Known Exploited Vulnerabilities catalog: CVE-2025-3248 (CVSS 9.8, unauth exec() on /api/v1/validate/code, KEV 2025-05-05), CVE-2026-33017 (9.3, unauth RCE on /api/v1/build_public_tmp/.../flow, exploited within ~20h of disclosure), CVE-2025-34291 (9.4, CORS+CSRF token chain → account takeover), CVE-2026-55255 (IDOR on /api/v1/responses → read other users' flows + their secrets) (verified 2026-07-14)"
  - "Real-world weaponization: Flodrix botnet + Sysdig-documented agentic-ransomware operator (JADEPUFFER) chaining the IDOR + RCE, June 2026 (verified 2026-07-14)"
tags: [security, rce, idor, langflow, cisa-kev, credentials, authorization, agent-frameworks]
---

Langflow — a popular open-source visual framework for building AI agents and RAG pipelines — has had multiple critical flaws added to CISA's Known Exploited Vulnerabilities catalog over the past year (unauthenticated `exec()` RCE, an account-takeover token chain, and an IDOR that reads other tenants' flows). Attackers moved within ~20 hours of one disclosure, before any public PoC. The lesson for agent engineering: an agent-building platform is a concentrated credential store — it holds model API keys, cloud credentials, and DB strings — so a single authz gap (an ID that isn't checked against the caller, or code passed to `exec()` before auth) doesn't leak one secret, it leaks the whole ring. Harden agent frameworks like production infrastructure: authenticate AND authorize every flow/tool endpoint (deny-by-default), never expose them directly to the internet, scope secrets per tenant/agent with short-lived tokens, and treat any exposed instance as potentially compromised even after patching.

## Deep dive

Most agent security writing is about what the *model* might be tricked into doing. Langflow is a reminder that the more direct risk is often the platform the agent runs on — and that an agent-building framework is a fundamentally different asset from the apps it builds, because of what it necessarily holds.

## The concentration problem

An agent platform is a **credential concentrator**. To do its job it stores model API keys, cloud credentials, database strings, and third-party tokens — for every flow, for every tenant. That changes the arithmetic of a single authorization bug: an IDOR in an ordinary app leaks one user's records; an IDOR in an agent platform (`/api/v1/responses` returning another user's flows) leaks *their flow definitions and the secrets embedded in them*. You do not lose a secret, you lose the ring.

The listed flaws are worth reading as a set rather than individually, because they compose. An unauthenticated `exec()` on a validation endpoint is already fatal on its own. But pair the IDOR with the RCE and an attacker reads other tenants' flows to learn what is worth taking, then executes. That is exactly what the documented June 2026 campaign chained. **Vulnerabilities in a credential concentrator multiply rather than add.**

## Twenty hours is the actual patching window

CVE-2026-33017 was exploited within roughly 20 hours of disclosure — before a public PoC existed. That number should reset anyone's mental model of "we'll patch next sprint." Agent frameworks are attractive precisely because they are new, widely deployed by people who are not primarily security engineers, and often stood up quickly for experimentation and then left running.

Which points at the most common real-world failure: **an internal prototype exposed to the internet.** Nobody decides to publish their agent platform; someone starts it on a cloud VM to show a colleague, and it stays up. The controls that survive that pattern are the boring ones — never bind these services to a public interface, put them behind an authenticating proxy, and treat "it's just a demo" as the exact condition under which this happens.

## Deny-by-default on every flow and tool endpoint

The pattern across these CVEs is endpoints that execute or reveal before checking who is asking. So: **authenticate AND authorize every endpoint**, and note those are two things — the account-takeover chain shows that authenticated-but-unauthorized is its own failure. Every object lookup must be scoped to the caller, not just to a valid ID; an ID that is not checked against the requester is an IDOR waiting to be found.

Then bound what a compromise reaches. Scope secrets per tenant and per agent with short-lived tokens rather than one long-lived key the platform holds for everyone — the same [capability-not-key](/library/agent-identity-secrets) discipline that keeps credentials out of a model's context also limits what one breach yields. Keep the [blast radius](/library/lesson-aws-s3-2017-guardrails) of any single flow bounded, and log resolved identities so you can answer *whose* credentials moved.

**And treat any exposed instance as compromised even after patching.** Patching closes the door; it does not evict anyone already inside or rotate the keys they took. That step gets skipped constantly, because patching *feels* like remediation and rotation feels like paperwork.

*Sources: [CISA KEV additions covering the Langflow flaws](https://thehackernews.com/2026/07/cisa-adds-4-actively-exploited-adobe.html) · CVE-2025-3248, CVE-2026-33017, CVE-2025-34291, CVE-2026-55255.*

*Related: [agent identity and secret management](/library/agent-identity-secrets), [prompt injection defense](/library/prompt-injection-defense), [guardrails and safety](/library/guardrails-safety), [human approval gates](/library/human-approval-gates), [agent observability](/library/agent-observability), [guardrails on destructive commands](/library/lesson-aws-s3-2017-guardrails).*
