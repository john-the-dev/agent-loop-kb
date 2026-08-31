# agent-loop-kb

A continuously-maintained, **quality-graded** knowledge base of AI-agent engineering — frameworks, orchestration, evaluation, memory, tools, protocols, security, and research.

Most "awesome" lists rot: agent tooling ships breaking changes monthly, and stale entries mislead more than they help. This repo's differentiator is **freshness + grading**: every entry carries a `status`, a `last_verified` date, and an evidence-backed `grade`. An automated maintainer that proposes additions and flags stale entries is planned, not yet running — grading is done by maintainers and contributors today.

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
   └── humans (PRs)   [maintainer-bot: planned, not yet running]
```

## Entry format

Each entry is a markdown file with YAML front-matter (schema in [`SCHEMA.md`](SCHEMA.md)) followed by a concise summary:

```markdown
---
id: token-budgets
title: "Token budgets change agent capability"
url: https://www.aisi.gov.uk/
category: evaluation
source_type: research
status: current
grade: A
added: 2026-07-14
last_verified: 2026-07-14
superseded_by: null
evidence:
  - "AISI eval, 1M→10M tokens = +25% SWE success (verified 2026-07-14)"
tags: [tokens, budget, evaluation]
---
Increasing an agent's token budget from 1M to 10M improved SWE-task success by ~25% …
```

## Quality grades

Entries are graded **A/B/C/D** on an evidence-based rubric (see [`GRADING.md`](GRADING.md)) — not opinion. Deprecated or superseded tech is labeled, not deleted, so readers learn *why* something fell out of favor. Newly-seeded entries are `grade: unrated` until their first evidence-graded review.

## Contributing

PRs welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md). CI validates every entry against the schema + rubric.

**Good first contribution:** any entry `scripts/validate.mjs` still flags as `grade: unrated`, or any entry whose `evidence` you can strengthen — or contradict — with a dated, checkable source. [`GRADING.md`](GRADING.md) is the rubric, and re-grading against it counts as much as first-grading. One entry, evidenced, is a complete and useful PR.

## Status

**MVP / seed.** Seeded from 36 curated entries. Automated maintainer loop and site-ingestion wiring are landing next (see the repo issues / project notes).

## License

Content: [CC BY 4.0](LICENSE). Scripts: MIT.
