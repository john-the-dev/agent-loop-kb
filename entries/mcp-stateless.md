---
id: mcp-stateless
title: "MCP went stateless: the 2026-07-28 spec revision"
url: https://modelcontextprotocol.io/
category: protocols
source_type: release
status: current
grade: A
added: 2026-07-28
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "the dated claim checks out at the official spec site: https://modelcontextprotocol.io/specification/2026-07-28 returns HTTP 200 and its page mentions Stateless, fetched 2026-08-30"
  - "NEGATIVE CONTROL run because a docs SPA can answer 200 for any path: /specification/2019-01-01 and /specification/not-a-real-revision both return 404, so the 200 on the dated path is a real revision and not a catch-all"
  - "CAVEAT on the citation, not the claim: the entry's url is the site ROOT (title 'What is the Model Context Protocol (MCP)?'), which is a general overview and does not itself evidence a dated spec revision. The revision page above is the precise source and is where the url should point"
tags: [mcp, stateless, protocol, migration, extensions]
---

The largest MCP revision since launch makes the protocol stateless: the initialize handshake and sessions are gone, every tool call is a self-contained HTTP request, and server-initiated interactions (sampling, elicitation) are restructured as multi-round-trip requests — allowed only while the server is processing a client request. Nothing running breaks on day one (adoption is opt-in, SDKs shipped compatible betas), but migrating servers must read capabilities from _meta and implement server/discover — and agents should start treating tool-returned handles as first-class state.

## Deep dive

The Model Context Protocol's largest revision since launch — the 2026-07-28 specification (release candidate locked May 21, 2026; final spec published July 28, 2026): **MCP is now stateless at the protocol layer.** The `initialize` handshake is gone, sessions are gone, and every tool call is a self-contained HTTP request carrying its own protocol version, identity, and capabilities. Server-initiated interactions are not gone — they are restructured as **multi-round-trip requests** (see below) and may only be issued while the server is actively processing a client request.

## Why it changed

The original stateful design forced real operational pain: a remote MCP server needed sticky sessions, a shared session store (typically Redis), and gateway-level packet inspection just to route traffic. The core team spent two years watching deployments fight session supervision for every individual action — the new spec removes the whole class of problem. A stateless server now runs behind a plain round-robin load balancer, routes on an `Mcp-Method` header, and lets clients cache `tools/list` responses for as long as the server's `ttlMs` allows.

## What actually breaks

**Nothing already running breaks on day one** — adoption is opt-in, and all tier-1 SDKs (Python, TypeScript, Go, C#) shipped backward-compatible support in the June 29 betas. But when you migrate:

- Servers that read the session header or relied on `initialize` must switch to reading protocol version and capabilities from `_meta`, implement `server/discover`, and attach `ttlMs` / `cacheScope` to list and read results.
- Clients must send `Mcp-Method` and `Mcp-Name` headers on Streamable HTTP POSTs.
- Server-to-client requests are restructured, not removed. The old model — the server pushing sampling or elicitation requests over an open SSE stream — is replaced by **multi-round-trip requests (MRTR)**: when a server needs input mid-call, it returns an `InputRequiredResult` carrying `inputRequests` (prompts + schemas) plus an opaque `requestState` payload; the client gathers answers and re-issues the original call with `inputResponses` and the echoed `requestState`. All state lives in the payload, not a held connection, and the spec now mandates that server-initiated requests may only be issued while the server is actively processing a client request — so users are never prompted out of the blue. Anything built on the old open reverse channel needs porting to this request/response shape.

## The agent-architecture upside

The subtle win for agent builders: state moves out of transport metadata and **into the agent's reasoning loop**. Where a workflow previously depended on hidden session state, a stateless server returns explicit handles — a `basket_id`, a `workflow_run_id` — that the agent can reason about, compose with other handles, and pass forward across multi-step tool chains. That's a better fit for how agent loops actually work: durable context lives with the agent, not the wire.

Two official extensions ship alongside, under the new Extensions framework (reverse-DNS IDs, independent versioning): **MCP Apps** (servers ship interactive HTML rendered in a sandboxed iframe) and a redesigned **Tasks** extension built for the stateless model. A formal lifecycle policy now guarantees twelve months minimum between a feature's deprecation and removal.

## Bottom line

If you run MCP servers: nothing forces migration today, but the stateless path deletes your session store, your sticky-session config, and a category of scaling bugs — plan the `_meta`/`server/discover` migration this quarter. If you build agents: start treating tool-returned handles as first-class state, because the protocol just stopped hiding it for you.

*Sources: [MCP blog — the 2026-07-28 release candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/), [MCP blog — SDK betas for 2026-07-28](https://blog.modelcontextprotocol.io/posts/sdk-betas-2026-07-28/), [modelcontextprotocol.io](https://modelcontextprotocol.io/).*

*Related: [Model Context Protocol](/library/mcp), [tool use](/library/tool-use), [tool schema design](/library/tool-schema-design), [durable execution](/library/durable-agent-execution), [the A2A protocol](/library/a2a-protocol).*
