# Contributing

Thanks for helping keep AI-agent engineering knowledge accurate and fresh.

## Add or update an entry

1. Create/edit `entries/<id>.md` (`<id>` = a stable `[a-z0-9-]` slug = the filename).
2. Fill the front-matter per [`SCHEMA.md`](SCHEMA.md). Grade it per [`GRADING.md`](GRADING.md) and back the grade with dated `evidence`.
3. Rebuild the compiled output: `node scripts/build.mjs` (commit the updated `dist/kb.json`).
4. Validate: `node scripts/validate.mjs` (CI runs this on every PR).
5. Open a PR.

## Principles

- **Evidence over opinion.** A grade or a `deprecated` status must cite checkable evidence (release dates, adoption, CVEs, correctness notes).
- **Label, don't delete.** Outdated/bad tech stays with `status: deprecated`/`superseded` and a `D`/`C` grade, so readers learn *why*. Deleting loses the lesson.
- **Keep summaries tight** — 1–4 self-contained sentences; that text is what gets embedded for retrieval.
- **Lessons are public-only.** `category: lessons` entries must come from famous, publicly-documented projects/post-mortems. Never include private, proprietary, or non-public project details (anyone's).
- **Primary sources first** — official docs / papers / release notes over secondhand blogs.

## Automation

CI validates the schema and rubric on every PR; `node scripts/validate.mjs` runs the same checks locally and lists every `unrated` entry and every entry past the 90-day staleness bar.

There is **no bot proposing or grading entries** — grading requires independent sources a human has actually read, which is the whole point of the rubric. If that changes, this section changes with it.
