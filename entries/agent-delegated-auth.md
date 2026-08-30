---
id: agent-delegated-auth
title: "How do you authorize an AI agent to act on a user's behalf?"
url: https://www.rfc-editor.org/rfc/rfc9728.html
category: security
source_type: docs
status: current
grade: A
added: 2026-08-23
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "RFC 9728 'OAuth 2.0 Protected Resource Metadata' fetched live 2026-08-30: HTTP 200, Category Standards Track — a ratified IETF standard, not a draft"
  - "entry's central claim (MCP servers implement RFC 9728 Protected Resource Metadata) names the exact RFC the source title states, verified 2026-08-30"
  - "primary standards document, the top source-quality tier in GRADING.md; no superseding RFC found for 9728 as of 2026-08-30"
tags: [identity, oauth, delegation, scoped-tokens, mcp, rfc9728, rfc8707, spiffe, authorization]
---
Give an AI agent its own identity rather than the user's credentials: issue short-lived tokens whose sub names the human, act names the agent, aud binds a single resource server, and scope grants the narrowest verb that finishes the job. MCP servers are OAuth 2.0 resource servers and must implement RFC 9728 Protected Resource Metadata, returning 401 with a WWW-Authenticate resource_metadata pointer and binding token audience via RFC 8707. Subagents get narrowed derived tokens, never copies of the parent's credentials. Anti-patterns: inherited user tokens, unscoped API keys, standing credentials.

## Deep dive

**Short answer:** give the agent **its own identity**, then issue it a short-lived token that names *both* the user and the agent and carries the narrowest scope that finishes the job. If your agent authenticates *as* the user, you have not built delegation — you have built impersonation, and every prompt injection inherits the user's full authority.

## The mistake that makes everything else unfixable

The default shortcut is to hand the agent a credential that already exists: the user's session token, or one unscoped API key shared by the whole deployment. Three named anti-patterns, and they fail the same way:

- **inherited user tokens** — the agent is indistinguishable from the human in every downstream audit log
- **unscoped API keys** — a tool that only needs to read calendars can drain your billing API
- **standing credentials** — nothing expires, so a leak is permanent

An agent is neither a human nor a service account. It has a *delegation chain* — this agent, acting for this user, with this scope — and neither existing identity class can express that.

## What a delegated token actually looks like

Four claims carry the whole model:

| claim | meaning |
|---|---|
| `sub` | the human the action is performed for |
| `act` | the agent performing it |
| `aud` | the single resource server the token is valid against |
| `scope` | the narrowest verb that completes the task |

Scope is where most of the safety lives. `email.draft` and `email.send` are one word apart and a world apart in blast radius — an agent that can draft is reviewable, an agent that can send is not.

Keep the two protocols separate: **OIDC** authenticates the human, **OAuth 2.1** authorizes the tool call. Conflating them is precisely what lets a compromised agent reuse a session cookie against a system nobody authorized.

## MCP makes this concrete

MCP servers are OAuth 2.0 resource servers and must implement **RFC 9728** (Protected Resource Metadata). The discovery flow:

1. Unauthenticated call returns **401** with `WWW-Authenticate: Bearer resource_metadata="https://…/.well-known/oauth-protected-resource"`
2. Client fetches that PRM document and reads `authorization_servers`
3. Client fetches the authorization server's `/.well-known/oauth-authorization-server` for endpoints
4. Authorization-code flow with PKCE; the token request carries `resource` (**RFC 8707**) so the issued token's audience binds to that one server

Two details implementations get wrong:

- **Return 401 at the HTTP boundary, not a tool-level error.** A handler that replies `{"error":"unauthorized"}` with HTTP 200 is invisible to the client's auth machinery — the client never learns where to get a token, so the flow silently never starts.
- **Bind the audience.** Without the `resource` parameter, a token minted for one MCP server is replayable against every other server that trusts the same issuer.

## Multi-agent: narrow on the way down

A subagent must receive a token **derived** from the parent's authority with *fewer* scopes — never a copy of the parent's credentials. Skip this and your agent hierarchy becomes a privilege-escalation ladder: the orchestrator holds broad authority, and any injected subagent borrows all of it.

## Internal traffic is a different problem

Public and browser-based agents use OAuth 2.1 with PKCE for secret-less proof-of-possession. Service-to-service traffic inside your own perimeter is better served by **SPIFFE/SPIRE** X.509 SVIDs over mTLS. CNCF's 2026 shorthand is worth memorizing: *SPIFFE for identity, OAuth 2.0 for access delegation, OPA for policy.*

## The honest state of the standards

**No dominant agent-identity standard exists yet.** The OpenID Foundation has published a consensus whitepaper on agentic identity; **OIDC-A 1.0** is a proposal extending OIDC with delegation-chain validation and attestation; the IETF has an AIP track. All still moving.

So build on the parts that are stable — OAuth 2.1, RFC 9728, RFC 8707, PKCE — and keep agent-specific identity claims behind an abstraction you can swap. The failure modes above are already well understood; the standard that names them is not settled.
