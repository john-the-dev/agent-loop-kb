---
id: a2a-protocol
title: "What is the A2A protocol and when should you use it?"
url: https://a2a-protocol.org/
category: protocols
source_type: docs
status: current
grade: B
added: 2026-08-16
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "the cited url https://a2a-protocol.org/ is a REDIRECT STUB, not documentation: title 'Redirecting', and curl -L does not move because the redirect is a client-side meta refresh (content='1; url=latest/'). The real docs are https://a2a-protocol.org/latest/, HTTP 200, title 'A2A Protocol' - that is where the url should point"
  - "verified ON that page 2026-08-30: 'Linux Foundation' x3, 'Agent Card' x1, 'SSE' x11 - so the entry's Linux-Foundation, Agent-Cards-for-discovery and streaming claims are corroborated at the source"
  - "CAVEAT driving B not A: the same scan found ZERO occurrences of json-rpc, webhook, or task lifecycle, which are three more things the entry asserts. They may sit on deeper spec pages, but the page this entry effectively points to does not evidence them. NEGATIVE CONTROL: /latest/not-a-real-a2a-page-xyz returns 404, so these are real absences and not a catch-all route"
tags: [a2a, agent-to-agent, interoperability, protocols, agent-cards, json-rpc, linux-foundation, mcp]
---
A2A (Agent-to-Agent) is the Linux Foundation open protocol for cross-vendor agent interop: JSON-RPC over HTTP with Agent Cards for discovery, task lifecycles for long-running delegation, and SSE/webhooks for streaming. Use it between agents from different teams or products; use MCP for an agent's own tools. v1.0 support now ships in major runtimes (e.g. Hermes Agent, Aug 2026).

## Deep dive

**Short answer:** A2A (Agent-to-Agent) is the open protocol for making independent AI agents interoperate — discover each other, delegate tasks, and stream results — across vendors and frameworks. Use it when two or more agents built by *different teams or products* need to work together; keep using MCP for an agent talking to its own *tools*.

## What A2A actually is

A2A was announced by Google in April 2025 with 50+ launch partners and donated to the Linux Foundation in June 2025, which is what made it a neutral standard rather than one vendor's SDK. Mechanically it is JSON-RPC 2.0 over HTTP(S):

- **Agent Cards** — a JSON document (served at a well-known URL) advertising an agent's identity, skills, endpoint, and auth requirements. This is the discovery layer: a client agent fetches the card to learn what a remote agent can do before sending it anything.
- **Tasks** — the unit of work. A client agent opens a task with a remote agent; the task carries a lifecycle (submitted → working → input-required → completed/failed) so long-running work is first-class, not a hack on request/response.
- **Messages and artifacts** — turns within a task, and the durable outputs a task produces.
- **Streaming + push** — Server-Sent Events for live progress, webhooks for very long tasks, so a delegating agent isn't forced to poll.

## A2A vs MCP (the confusion to kill)

They are complements, not competitors. MCP standardizes the *vertical* connection — one agent to its tools, files, and data sources. A2A standardizes the *horizontal* connection — peer agents negotiating work with each other. A realistic stack uses both: your agent reaches its own tools over MCP, and hands a subtask to a partner company's agent over A2A. If everything runs inside one framework and one trust boundary, you don't need A2A at all — a plain subagent call is simpler and faster.

## Why it matters right now

Adoption crossed from spec to shipping product in 2026: v1.0 of the protocol stabilized, major agent runtimes bundle A2A support (Nous Research's Hermes Agent shipped an A2A v1.0 plugin in its August 2026 release, closing one of its oldest feature requests), and enterprise platforms (Google ADK, Azure AI Foundry, SAP, Salesforce) expose A2A endpoints. Interop is becoming a checklist item the way OpenAPI once did.

## Engineering cautions

- **Trust boundary, not just transport.** A remote agent is an untrusted principal: validate artifacts, scope credentials per task, and never let a remote agent's output flow into privileged actions without your own approval gates.
- **Agent Cards are claims, not proof.** Treat advertised skills like an unverified résumé; probe with a low-stakes task first.
- **Lifecycle discipline.** Model the input-required state explicitly, or delegated tasks will silently stall.
- **Observability.** Log task IDs end-to-end; cross-agent traces are your only debugging tool when the other side is a black box.
