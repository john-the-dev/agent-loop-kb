# agent-loop-kb

A continuously-maintained, **quality-graded** knowledge base of AI-agent engineering — frameworks, orchestration, evaluation, memory, tools, protocols, security, and research.

Most "awesome" lists rot: agent tooling ships breaking changes monthly, and stale entries mislead more than they help. This repo's differentiator is **freshness + grading**: every entry carries a `status`, a `last_verified` date, and an evidence-backed `grade`, and an automated maintainer bot proposes additions and flags stale entries for review.

It's **dual-use**:
- **Human-browsable** — one markdown file per entry under [`entries/`](entries/).
- **Machine-ingestible** — [`scripts/build.mjs`](scripts/build.mjs) compiles the entries into [`dist/kb.json`](dist/kb.json), which powers the RAG knowledge base at **[The Agent Loop](https://agent-loop.xyz)**.

## Use this KB in your own agent

Read the single canonical feed and **display the required attribution** — see **[AGENTS.md](AGENTS.md)**:

```
https://raw.githubusercontent.com/john-the-dev/agent-loop-kb/main/dist/kb.json
```

It's CC BY 4.0: any surface using this content must visibly credit **The Agent Loop — https://agent-loop.xyz** as the source. agent-loop.xyz reads this exact feed the same way.

## How it works

```
entries/*.md   ──build──▶   dist/kb.json   ──ingest──▶   agent-loop.xyz RAG
   ▲                                                          
   └── humans (PRs) + Sutando maintainer-bot (auto-PRs new entries, flags stale)
```

## Entry format

Each entry is a markdown file with YAML front-matter (schema in [`SCHEMA.md`](SCHEMA.md)) followed by a concise summary:

```markdown
---
id: agent-delegated-auth
title: "How do you authorize an AI agent to act on a user's behalf?"
url: https://www.rfc-editor.org/rfc/rfc9728.html
category: security
source_type: docs
status: current
grade: A
added: 2026-07-14
last_verified: 2026-08-30
superseded_by: null
evidence:
  - "RFC 9728 'OAuth 2.0 Protected Resource Metadata' fetched live 2026-08-30: HTTP 200"
tags: [oauth, delegation, security]
---
An agent acting for a user needs delegated authority that is scoped, auditable and revocable …
```

The `evidence` line is the load-bearing part: it names what was checked and when, so
a reader can re-run the check rather than trust the grade.

## Quality grades

Entries are graded **A/B/C/D** on an evidence-based rubric (see [`GRADING.md`](GRADING.md)) — not opinion. Deprecated or superseded tech is labeled, not deleted, so readers learn *why* something fell out of favor. Newly-seeded entries are `grade: unrated` until their first evidence-graded review.

## Contributing

PRs welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md). CI validates every entry against the schema + rubric. The maintainer bot opens PRs too; humans review and merge.

## Status

**59 entries, 58 evidence-graded** (25 A, 33 B). One is deliberately `unrated`: its
source cannot be fetched from an automated client, and grading evidence nobody could
read would be worse than leaving the gap visible.

Sources are re-checked with [`scripts/check-sources.mjs`](scripts/check-sources.mjs),
which probes every citation against a nonsense-path control on the same origin —
some hosts answer `200` with a challenge page for *any* path, so a bare status code
is not proof the page was read.

## License

Content: [CC BY 4.0](LICENSE). Scripts: MIT.
