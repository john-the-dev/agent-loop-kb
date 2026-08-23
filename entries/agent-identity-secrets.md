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

Secrets management for agents fails in a way that ordinary service secrets do not: **an agent's context window is an exfiltration surface.** A service that holds an API key in memory leaks it only if the process is compromised. An agent that holds one in its prompt leaks it to anyone who can get the model to repeat its instructions — which is the entire premise of prompt injection.

That single difference drives every recommendation here.

## Never put a credential where the model can see it

The rule is blunt because the failure is blunt. A secret in the system prompt, in tool output, in retrieved documents, or in conversation memory can be reflected back out — verbatim, paraphrased, base64-encoded, or embedded in a URL the agent is asked to fetch. [OWASP's LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) tracks this as sensitive information disclosure precisely because it recurs.

The structural fix is to move the credential out of the model's reach entirely:

- The **model** decides *that* a call should happen and with what arguments.
- A **trusted executor** — ordinary code the model cannot introspect — attaches credentials and performs the call.
- The model receives the *result*, never the material used to obtain it.

This also means scrubbing on the way back. Tool responses routinely contain tokens, signed URLs, and `Authorization` echoes; if you pass responses through unfiltered, you have re-introduced the secret one layer later. Redact at the executor boundary, before the text becomes context.

## Distinct identity per workload

Give each agent workload its own identity rather than sharing one deployment-wide key. Shared keys destroy three things at once: attribution (which agent made this call?), revocation (rotating breaks everything), and least privilege (the key must be the union of everyone's needs).

Inside a trust boundary, [SPIFFE/SPIRE](https://spiffe.io/) issues short-lived X.509 identities to workloads without any long-lived secret to steal — the workload proves what it is via attestation, and receives a credential that expires in minutes. For user-facing delegation — where the agent acts *on behalf of* a person — see [How do you authorize an AI agent to act on a user's behalf?](https://agent-loop.xyz/library/agent-delegated-auth); the two problems are adjacent and often conflated, but identity ("what is this workload") and delegation ("whose authority is it borrowing") need separate answers.

## Short-lived and task-scoped beats long-lived and broad

Two properties do most of the work:

**Short-lived.** A credential that expires in minutes converts a permanent compromise into a bounded one. It also forces the rotation path to be exercised continuously, so it works when you need it — as opposed to an annual rotation that breaks in unfamiliar ways the one time it runs.

**Task-scoped.** Mint the credential for the specific operation and target, not for the capability in general. "Read this document id" is recoverable when leaked; "read the documents API" is not. Where the downstream system supports it, bind the token's audience to the single service that should accept it, so a leaked token cannot be replayed elsewhere.

## Policy check before issuance, not after

The executor should not be a credential vending machine that fills any request the model makes. Between "the model asked" and "the credential is issued" there is a policy decision: is this workload allowed to touch this resource, with this operation, right now, on behalf of this principal? Externalizing that to a policy engine keeps the rules inspectable and testable rather than scattered through tool implementations.

The reason this matters more for agents than for ordinary services: a service's call graph is written by an engineer and reviewed. An agent's call graph is generated at runtime from text that may be adversarial. The policy layer is the thing that stays fixed while the caller's intent does not.

## Memory and logs are durable leak surfaces

Two places where a secret outlives the request that introduced it:

- **Persistent agent memory.** If a tool result containing a token gets summarized into long-term memory, the token is now in every future context. Filter *before* the write, because filtering on read means the data is already sitting in your store.
- **Observability.** Traces that capture full prompts and tool payloads are enormously useful and are a secondary credential store. Redact at the instrumentation layer, and treat trace storage with the same access controls as the secret store itself.

## What good looks like

An agent that cannot name a single credential it uses; an executor that attaches them; a policy engine that authorizes each issuance; identities that expire on the order of minutes; scoped, audience-bound tokens; and redaction on every path where tool output becomes context, memory, or a log line.
