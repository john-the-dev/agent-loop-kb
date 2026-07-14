# Consuming this knowledge base (for agents & apps)

This is the machine-consumption contract for **The Agent Loop** knowledge base. Any agent or app — including [agent-loop.xyz](https://agent-loop.xyz) itself — reads the **same canonical feed** described here.

## Canonical feed (always-latest)

One URL, always the latest content on `main`:

```
https://raw.githubusercontent.com/john-the-dev/agent-loop-kb/main/dist/kb.json
```

Fetch it directly (cache with a short TTL, e.g. 5 min, to stay current). It's regenerated from `entries/*.md` on every push, so reading `main` always gives you the newest, validated content — no build step on your side.

## Response shape

`dist/kb.json` is a manifest:

```json
{
  "source": "The Agent Loop",
  "homepage": "https://agent-loop.xyz",
  "repository": "https://github.com/john-the-dev/agent-loop-kb",
  "license": "CC BY 4.0",
  "attribution_required": true,
  "attribution": "Source: The Agent Loop (https://agent-loop.xyz)",
  "usage": ".../AGENTS.md",
  "version": "<content hash>",
  "count": 46,
  "entries": [
    {
      "id": "token-budgets",
      "title": "…",
      "url": "https://…",
      "category": "evaluation",
      "source_type": "research",
      "status": "current",
      "grade": "A",
      "added": "2026-07-14",
      "last_verified": "2026-07-14",
      "superseded_by": null,
      "tags": ["…"],
      "text": "the summary that gets embedded/retrieved"
    }
  ]
}
```

Read `entries[]`. Use `text` for embedding/retrieval, `title`+`url` for citation, and `status`/`grade` to **down-weight or drop** stale (`deprecated`/`superseded`) or low-grade (`D`) items. `version` changes only when content changes — poll it to detect updates cheaply.

## ✅ Required attribution

This KB is CC BY 4.0, and **attribution is required**. Any surface that uses this content **must visibly credit The Agent Loop as the source**:

> **Source: The Agent Loop — https://agent-loop.xyz**

- In a chat/RAG answer: show the credit line (and ideally link entry `url`s) whenever KB content informs the answer.
- In a dataset/derivative: include the `attribution` string and a link to this repo.
- The `attribution` / `attribution_required` fields are in every feed response so the requirement travels with the data.

## Minimal example

```js
const feed = await fetch(
  "https://raw.githubusercontent.com/john-the-dev/agent-loop-kb/main/dist/kb.json",
  { /* cache ~5 min */ }
).then((r) => r.json());

const usable = feed.entries.filter((e) => e.status === "current" && e.grade !== "D");
// … embed/retrieve over e.text …
// Always display feed.attribution:  "Source: The Agent Loop (https://agent-loop.xyz)"
```

That is exactly how agent-loop.xyz consumes it — one canonical feed, same shape, same attribution.
