---
id: prompt-caching
title: "Prompt caching and context reuse"
url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
category: memory
source_type: docs
status: current
grade: unrated   # seeded baseline — pending first evidence-graded review (see GRADING.md)
added: 2026-07-14
last_verified: 2026-07-28
superseded_by: null
evidence: []
tags: [prompt, caching, context, reuse, reduces]
---

Prompt caching reduces latency and input cost when many calls share a long stable prefix such as system instructions, tool definitions, examples, or reference documents. Put stable content before volatile conversation state, keep serialization byte-for-byte consistent, and monitor cache creation, hit rate, read tokens, expiration, and provider-specific minimums. Caching is an optimization rather than memory: invalidate or version cached prefixes when policies, permissions, schemas, or source data change.

## Deep dive

An agent loop re-sends nearly the same prompt dozens of times per task: the system prompt, the tool definitions, and the growing conversation are identical on every call except the newest turn. Prompt caching lets the provider store the processed prefix and skip re-computing it — which for a long-running agent is the single cheapest large win available: no quality trade-off, just less latency and a much smaller bill.

## How the providers differ

- **Anthropic** uses [explicit cache breakpoints](https://platform.claude.com/docs/en/build-with-claude/prompt-caching): you mark where the stable prefix ends. Cache writes cost a premium over base input tokens, cache *reads* cost a small fraction of them, and entries expire on a short TTL (with a paid longer-TTL option) — so the economics reward prefixes that are reused quickly and often.
- **OpenAI** applies [caching automatically](https://platform.openai.com/docs/guides/prompt-caching) once a prompt exceeds a minimum length, discounting the cached portion with no code changes — but you only benefit if your prompts actually share a byte-identical prefix.
- **Gemini** offers [context caching](https://ai.google.dev/gemini-api/docs/caching) with both implicit caching and explicitly-managed cached content objects you create and reference across requests, suited to a large document or video you'll query repeatedly.

The shared contract across all three: caching operates on an **exact prefix match**. One changed byte early in the prompt invalidates everything after it.

## Structuring an agent for cache hits

1. **Stability-ordered prompts.** System instructions and tool definitions first, few-shot examples next, conversation history after, and the volatile parts — current time, retrieved documents, the user's newest message — last.
2. **Never interleave volatility.** A timestamp ("Current time: 14:03:27") rendered into the system prompt destroys the cache on every single call. Move it to the end, truncate it to the granularity you need, or pass it as a message.
3. **Byte-stable serialization.** Non-deterministic JSON key order, shuffled tool lists, or a randomized retriever re-ranking the same documents will silently zero your hit rate. Serialize canonically.
4. **Watch the metrics, not the vibes.** Providers report cache reads/writes per request. An agent fleet with a low hit rate usually has one volatile line in a shared prefix — findable in minutes once you actually look.

## What caching is not

It is not memory and not state: the cache stores computation over tokens you still send, it can evict at any time, and it must never be load-bearing for correctness. Version your prefixes — when a policy, permission set, or tool schema changes, the *content* changes, and stale-prefix reuse is a bug the cache will happily hide.

*Sources: [Anthropic — Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) · [OpenAI — Prompt caching](https://platform.openai.com/docs/guides/prompt-caching) · [Google — Gemini context caching](https://ai.google.dev/gemini-api/docs/caching).*

*Related: [token budgets](/library/token-budgets), [context compaction](/library/context-compaction), [latency & streaming](/library/latency-streaming), [agent cost control](/library/agent-cost-control).*
