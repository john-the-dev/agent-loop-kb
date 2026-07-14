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
