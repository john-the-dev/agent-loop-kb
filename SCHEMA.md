# Entry schema

Every file in [`entries/`](entries/) is `<id>.md`: a YAML front-matter block, then a plain-text summary body. CI ([`scripts/validate.mjs`](scripts/validate.mjs)) enforces this.

## Front-matter fields

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `id` | ✅ | string | Stable slug; must equal the filename (`<id>.md`). `[a-z0-9-]+`. |
| `title` | ✅ | string | Human title. |
| `url` | ✅ | string | Canonical source URL. |
| `category` | ✅ | enum | `frameworks` · `orchestration` · `evaluation` · `memory` · `tools` · `protocols` · `security` · `infra` · `research` · `lessons` · `general` |
| `source_type` | ✅ | enum | `docs` · `blog` · `paper` · `release` · `repo` · `research` · `post-mortem` · `retrospective` · `talk` |
| `status` | ✅ | enum | `current` · `experimental` · `deprecated` · `superseded` |
| `grade` | ✅ | enum | `A` · `B` · `C` · `D` · `unrated` (see [`GRADING.md`](GRADING.md)) |
| `added` | ✅ | date | `YYYY-MM-DD` first added. |
| `last_verified` | ✅ | date | `YYYY-MM-DD` last checked accurate. >90d = stale. |
| `superseded_by` | ➖ | id \| null | Required when `status: superseded`. |
| `evidence` | ✅ | list | Dated, checkable statements justifying `grade`/`status`. May be empty only for `grade: unrated`. |
| `tags` | ➖ | list | Freeform keywords. |

## Body

Everything after the front-matter is the summary — 1–4 sentences, plain text, self-contained. This is what gets embedded for retrieval.

### Optional deep dive

An entry may follow the summary with a `## Deep dive` heading. Everything under it is long-form markdown (sections, lists, links) compiled into the feed as `body` and rendered as the full article on the entry's site page. The summary above the heading remains the retrieval/embedding text. If the heading is present the deep dive must be ≥ 300 characters (validated).

## `category: lessons`

A **lesson** is an engineering lesson drawn from a **famous, publicly-documented** project or incident (post-mortem, retrospective, or published talk), stated with its takeaway for AI-agent engineering. Rules:

- **Public sources only.** Every lesson must cite a public post-mortem, retrospective, paper, or reputable record. **Never include private, proprietary, or non-public project details** — no internal specifics from anyone's closed-source or personal projects.
- Use `source_type: post-mortem` / `retrospective` / `talk`.
- The body should name the public case, the durable lesson, and how it applies to building agents.

## Compiled output

[`scripts/build.mjs`](scripts/build.mjs) emits [`dist/kb.json`](dist/kb.json): a **manifest** `{ source, homepage, repository, license, attribution_required, attribution, usage, version, count, entries[] }` where each entry is `{ id, title, url, category, source_type, status, grade, added, last_verified, superseded_by, tags, evidence, text, body }` (`body` = the optional deep-dive markdown, else `null`). See [AGENTS.md](AGENTS.md) for the consumption contract + required attribution.
The Agent Loop site ingests this (drops `status: deprecated`/`grade: D` from active retrieval, or down-weights them).
