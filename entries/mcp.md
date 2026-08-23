---
id: mcp
title: "Model Context Protocol"
url: https://modelcontextprotocol.io/docs/learn/architecture
category: tools
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-29
superseded_by: null
evidence: []
tags: [model, context, protocol, open, standard]
---

The Model Context Protocol is an open standard for connecting AI applications to external tools and data. MCP uses a client-server architecture: servers expose resources, prompts, and tools, while hosts manage model access, permissions, and user consent. It reduces custom integration work but does not replace security boundaries.

## Deep dive

Model Context Protocol (MCP) standardizes the boundary between an AI application and the systems that supply context or actions. It is best understood as an interoperability layer—not an agent framework, planner, memory system, or permission model. MCP makes integrations portable across compatible hosts; the host still owns model orchestration, trust decisions, and user experience.

## Host, client, and server are different roles

The [official architecture](https://modelcontextprotocol.io/docs/learn/architecture) defines three participants. The **host** is the AI application. It creates one **client** for each connected **server**, and each client maintains its own dedicated connection. A server exposes capabilities whether it runs as a local child process or as a remote service.

That separation matters operationally. A host should isolate server credentials, failures, and permissions per connection rather than pooling every integration into one ambiently privileged process. Disconnecting one server should not corrupt the other client sessions, and a compromised server should not inherit access intended for its peers.

MCP has two layers:

- The **data layer** uses JSON-RPC 2.0 for lifecycle messages, requests, results, errors, and notifications.
- The **transport layer** carries those messages. Standard transports are local `stdio` and remote Streamable HTTP, which uses HTTP POST and can use Server-Sent Events for streaming.

The protocol shape stays consistent across transports, but the security boundary does not. A `stdio` server is executable code on the host machine; a remote server crosses a network and needs authentication, authorization, origin validation, and transport security.

## Pick the primitive by who controls it

Servers expose three core primitives with distinct control models:

- **Prompts** are user-controlled templates or workflows.
- **Resources** are application-controlled context, such as file contents or repository data.
- **Tools** are model-controlled functions that can retrieve data or cause actions.

The [server-feature specification](https://modelcontextprotocol.io/specification/2025-06-18/server/index) makes this distinction explicit. Do not collapse everything into a tool. Read-only context belongs in resources when the host should decide when to attach it; a named workflow the user deliberately selects belongs in prompts; an operation the model may choose belongs in tools.

Tools declare a name, description, JSON Schema input, and optionally a structured output schema. Clients discover them with `tools/list` and invoke them with `tools/call`. The [tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) also warns that tool annotations are untrusted unless the server itself is trusted. “Read-only” in metadata is a claim, not a sandbox.

## Negotiate before operating

MCP is stateful. The client begins with `initialize`, proposing a protocol version, its capabilities, and implementation identity. The server returns its selected version and capabilities; the client then sends `notifications/initialized`. Both sides must use only features that were negotiated.

The [lifecycle specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) says an incompatible version should end the connection. For Streamable HTTP, subsequent requests carry the negotiated version in `MCP-Protocol-Version`. Production clients should pin the revisions they have tested, reject incompatible responses, impose request deadlines, handle cancellation, and log server identity plus negotiated capabilities. Silent “best effort” version drift turns protocol changes into hard-to-debug tool failures.

## Security lives around the protocol

MCP deliberately enables arbitrary data access and code-execution paths. The [authoritative specification](https://modelcontextprotocol.io/specification/2025-06-18/index) requires implementers to preserve user control: users should understand what data is exposed, approve tool execution, and control server-initiated sampling. The protocol cannot enforce those policies for the host.

A safe host therefore:

1. allowlists servers and pins their package or deployment provenance;
2. grants the smallest filesystem, network, and secret scope each server needs;
3. treats tool descriptions, annotations, resource text, and prompt content as untrusted input;
4. shows the actual operation and target before irreversible calls;
5. keeps approval, idempotency, timeout, audit, and rate-limit enforcement outside the model prompt;
6. never forwards a token issued for one server to another.

For remote servers, MCP authorization follows OAuth conventions. The [authorization guidance](https://modelcontextprotocol.io/docs/tutorials/security/authorization) treats the MCP server as a protected resource; clients should discover the appropriate authorization server and request tokens for the intended resource. Authentication proves an identity. It does not replace per-tool authorization or consent.

## A production readiness checklist

Before enabling a server, verify its source and release, enumerate every exposed primitive, inspect schemas and side effects, and test initialization plus incompatible-version failure. Exercise timeouts, cancellation, malformed results, server restarts, and list-change notifications. Record every tool attempt with server identity, tool name, sanitized arguments, approval decision, duration, and final disposition.

MCP removes bespoke connector plumbing. It does not remove the need for isolation, least privilege, reliable tool semantics, or a human boundary around consequential actions. The strongest implementation treats portability and safety as separate requirements and designs both explicitly.

*Sources: [MCP architecture overview](https://modelcontextprotocol.io/docs/learn/architecture) · [MCP specification](https://modelcontextprotocol.io/specification/2025-06-18/index) · [Lifecycle](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) · [Server features](https://modelcontextprotocol.io/specification/2025-06-18/server/index) · [Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) · [Authorization tutorial](https://modelcontextprotocol.io/docs/tutorials/security/authorization).*

*Related: [tool use](/library/tool-use), [tool schema design](/library/tool-schema-design), [human approval gates](/library/human-approval-gates), [prompt injection defense](/library/prompt-injection-defense), [MCP stateless transport](/library/mcp-stateless), [agent identity and secret management](/library/agent-identity-secrets), [agent frameworks as RCE targets](/library/langflow-cisa-kev-agent-rce).*
