# Grading rubric

Grades exist so "bad tech" and "outdated knowledge" are **evidence-based, not opinion**. Every non-seed entry carries a `grade` and an `evidence` list justifying it. Re-grade when the evidence changes.

## Grades

| Grade | Meaning |
|-------|---------|
| **A** | Current best-practice. Actively maintained, widely adopted, verified accurate within the last 90 days. Safe to build on. |
| **B** | Solid and useful, with caveats. Maintained but niche, or accurate-but-aging, or best-for-specific-cases. Note the caveat in `evidence`. |
| **C** | Use with caution. Slowing maintenance, partial adoption, known rough edges, or partially superseded. |
| **D** | Discouraged. Deprecated, abandoned, superseded, or carrying unresolved security/correctness issues. Kept for the historical record and to warn readers — set `status: deprecated` (or `superseded`) and fill `superseded_by`. |
| **unrated** | Seeded or newly-added, not yet evidence-graded. The maintainer bot grades these on its next pass. |

## Signals (what `evidence` should cite)

Grade from concrete, checkable signals — not vibes:

- **Maintenance** — last commit / release recency; open-vs-closed issue ratio; is it still shipping?
- **Adoption** — stars/downloads trend, production use, ecosystem integrations (e.g. MCP support).
- **Recency of the claim** — does the statement still hold given the latest releases? (Agent frameworks change monthly.)
- **Correctness/safety** — known CVEs (e.g. a CISA-KEV listing), correctness caveats, breaking-change history.
- **Source quality** — primary docs / peer-reviewed paper / official release note > secondhand blog.

Each `evidence` item should be a dated, checkable statement, e.g.:
`"last release 2026-06, 40k stars, MCP-native (checked 2026-07-14)"` or
`"CVE-2026-55255 in CISA KEV, actively exploited (2026-07-11) → grade D"`.

## Before you write "fetched live" — run the source check

```
node scripts/check-sources.mjs          # report
node scripts/check-sources.mjs --strict # exit 1 if a GRADED entry is unverifiable
```

It fetches every source — front-matter `url` **and** body links — plus one
nonsense-path control per origin, and classifies each `ok` / `catch-all` /
`blocked` / `dead` / `error`.

**Why the control, and not just a status check.** On 2026-08-31 two entries were
graded on regulator pages that were never read. `www.ecfr.gov` answers **200**
with the title `Federal Register :: Request Access` for *every* path, so a bare
200 from that host means nothing at all. Only a path that should not exist can
tell a real page from a catch-all.

Three rules that came out of that, and out of the fixes to it:

1. **A 200 is not a read.** Compare the title against a control before claiming
   the source says anything.
2. **A failure describes your CLIENT, not the page.** `www.ftc.gov` returned 403
   to `curl` and 200 to `node`'s `fetch` on the same URL, minutes apart. If one
   client is refused, try another before concluding anything about the source.
3. **When a source genuinely cannot be verified, say that** — "HTTP 403 from
   here, not read" — rather than grading it or writing "fetched live". Leaving an
   entry `unrated` on an unreadable source is a correct outcome, not a gap.

Not wired into CI on purpose: it makes live third-party requests, so per-push
runs would be flaky and impolite to the sites being cited. Run it when grading,
and when re-verifying a stale entry.

## Lifecycle

- `status: current` → in-use, verified.
- `status: experimental` → promising but unproven; grade B/C.
- `status: deprecated` → maintainers deprecated it; grade D, keep for the record.
- `status: superseded` → replaced by something better; set `superseded_by: <id>`, grade C/D.

## Staleness

An entry is **stale** when `last_verified` is more than **90 days** old. The maintainer bot flags stale entries in a `review-needed` PR; a human (or the bot with evidence) re-verifies and updates `last_verified` + `grade`.
