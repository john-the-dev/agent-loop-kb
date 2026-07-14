# Entry schema

Every file in [`entries/`](entries/) is `<id>.md`: a YAML front-matter block, then a plain-text summary body. CI ([`scripts/validate.mjs`](scripts/validate.mjs)) enforces this.

## Front-matter fields

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `id` | ✅ | string | Stable slug; must equal the filename (`<id>.md`). `[a-z0-9-]+`. |
| `title` | ✅ | string | Human title. |
| `url` | ✅ | string | Canonical source URL. |
| `category` | ✅ | enum | `frameworks` · `orchestration` · `evaluation` · `memory` · `tools` · `protocols` · `security` · `infra` · `research` · `general` |
| `source_type` | ✅ | enum | `docs` · `blog` · `paper` · `release` · `repo` · `research` |
| `status` | ✅ | enum | `current` · `experimental` · `deprecated` · `superseded` |
| `grade` | ✅ | enum | `A` · `B` · `C` · `D` · `unrated` (see [`GRADING.md`](GRADING.md)) |
| `added` | ✅ | date | `YYYY-MM-DD` first added. |
| `last_verified` | ✅ | date | `YYYY-MM-DD` last checked accurate. >90d = stale. |
| `superseded_by` | ➖ | id \| null | Required when `status: superseded`. |
| `evidence` | ✅ | list | Dated, checkable statements justifying `grade`/`status`. May be empty only for `grade: unrated`. |
| `tags` | ➖ | list | Freeform keywords. |

## Body

Everything after the front-matter is the summary — 1–4 sentences, plain text, self-contained. This is what gets embedded for retrieval.

## Compiled output

[`scripts/build.mjs`](scripts/build.mjs) emits [`dist/kb.json`](dist/kb.json): an array of
`{ id, title, url, category, source_type, status, grade, added, last_verified, tags, text }`.
The Agent Loop site ingests this (drops `status: deprecated`/`grade: D` from active retrieval, or down-weights them).
