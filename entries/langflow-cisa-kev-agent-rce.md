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

### Four listings, one root cause

Langflow is a visual builder for AI agents and RAG pipelines. Between 2025 and 2026 it accumulated an
unusual distinction: **repeat entries in CISA's Known Exploited Vulnerabilities catalog**. KEV is not a
severity score — an entry means exploitation was *observed in the wild*.

- **CVE-2025-3248** (CVSS 9.8, KEV 2025-05-05) — unauthenticated `exec()` reachable on
  `/api/v1/validate/code`. Code submitted for "validation" was executed before any authentication ran.
- **CVE-2026-33017** (9.3) — unauthenticated RCE via `/api/v1/build_public_tmp/.../flow`.
- **CVE-2025-34291** (9.4) — a CORS-plus-CSRF token chain ending in account takeover.
- **CVE-2026-55255** — an IDOR on `/api/v1/responses`: pass someone else's identifier, read their flows
  and the secrets embedded in them.

Different endpoints, one shape. In each case a request reached privileged behaviour before the system
established *who was asking* and *whether they were allowed*.

### The ~20 hour number is the part to sit with

For CVE-2026-33017, attackers were exploiting in the field **within roughly 20 hours of disclosure —
before a public proof-of-concept existed**. That collapses the mental model most patch processes are
built on. "Patch within a week" assumes a lag between disclosure and weaponisation that no longer
reliably exists for internet-reachable agent infrastructure. If your exposure window is measured in
days, you were never actually protected by patch velocity; you were protected by not being noticed.

### Why an agent framework is a worse thing to lose than an app

A typical web app breach leaks that app's data. An agent-building platform is a **concentrated
credential store**: model API keys, cloud credentials, database connection strings, and the tool
definitions describing exactly what each credential can reach — all colocated so that flows can use
them.

So the blast radius is categorically different. One authorisation gap does not leak one secret; it
leaks *the ring*, plus a map of what each key opens. The IDOR case makes this concrete: reading another
tenant's flow returns their secrets as an ordinary property of the flow.

This is also why exploitation was commercial rather than opportunistic. The **Flodrix botnet** and a
Sysdig-documented agentic-ransomware operator (**JADEPUFFER**) chained the IDOR with the RCE in June
2026 — harvest credentials, then use them. An agent platform is worth building tooling against.

### What to actually do

1. **Authenticate *and* authorise every flow and tool endpoint, deny-by-default.** Authentication alone
   would not have stopped the IDOR: the caller was authenticated, just not checked against the object
   they named. Every identifier arriving from a client is a claim, not a fact.
2. **Do not expose an agent builder directly to the internet.** Put it behind a VPN or identity-aware
   proxy. Three of these four were unauthenticated paths; network reachability was the precondition.
3. **Scope secrets per tenant and per agent, with short lifetimes.** The goal is that reading one flow
   yields credentials that are narrow and expiring, not a master set.
4. **Treat any exposed instance as compromised even after patching.** Patching closes the door; it does
   not evict anyone already inside or rotate what they took. Rotate credentials and audit flow contents.
5. **Never pass client-supplied code to `exec()`** — but note that CVE-2025-3248 is the *least*
   interesting of the four. The authorisation bugs are the durable lesson, because they look like
   ordinary application code rather than obvious footguns.

### The transferable point

Agent frameworks tend to be adopted as developer tools and then quietly promoted to production
infrastructure without the review that promotion normally triggers. The security posture stays that of
a local prototyping utility while the credential concentration becomes that of a secrets manager.
Harden them on the second basis, not the first.
