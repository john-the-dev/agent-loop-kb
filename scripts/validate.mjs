#!/usr/bin/env node
// Validate every entry against SCHEMA.md + GRADING.md. Exit 1 on any error.
import { loadAll, ENUMS, REQUIRED, STALE_DAYS, daysSince } from "./lib.mjs";

const entries = loadAll();
const errors = [];
const warnings = [];
const ids = new Set();

for (const e of entries) {
  const f = e.__file;
  if (e.__error) { errors.push(`${f}: parse error — ${e.__error}`); continue; }

  for (const k of REQUIRED) {
    if (e[k] === undefined || e[k] === "") errors.push(`${f}: missing required field "${k}"`);
  }
  if (e.id && `${e.id}.md` !== f) errors.push(`${f}: id "${e.id}" must match filename`);
  if (e.id && !/^[a-z0-9-]+$/.test(e.id)) errors.push(`${f}: id must be [a-z0-9-]`);
  if (e.id) { if (ids.has(e.id)) errors.push(`${f}: duplicate id "${e.id}"`); ids.add(e.id); }

  for (const k of Object.keys(ENUMS)) {
    if (e[k] !== undefined && !ENUMS[k].includes(e[k])) errors.push(`${f}: ${k}="${e[k]}" not in [${ENUMS[k].join(", ")}]`);
  }
  for (const k of ["added", "last_verified"]) {
    if (e[k] && !/^\d{4}-\d{2}-\d{2}$/.test(e[k])) errors.push(`${f}: ${k}="${e[k]}" must be YYYY-MM-DD`);
  }
  if (e.status === "superseded" && !e.superseded_by) errors.push(`${f}: status=superseded requires superseded_by`);
  if (Array.isArray(e.evidence) && e.evidence.length === 0 && e.grade !== "unrated")
    errors.push(`${f}: evidence[] empty but grade="${e.grade}" (only "unrated" may lack evidence)`);
  if (!e.text || e.text.length < 20) errors.push(`${f}: summary body too short`);

  if (e.last_verified && daysSince(e.last_verified) > STALE_DAYS)
    warnings.push(`${f}: STALE — last_verified ${e.last_verified} (${daysSince(e.last_verified)}d ago)`);
  if (e.grade === "unrated") warnings.push(`${f}: unrated — needs first evidence-graded review`);
}

for (const w of warnings) console.log(`⚠️  ${w}`);
if (errors.length) {
  for (const err of errors) console.error(`❌ ${err}`);
  console.error(`\n${errors.length} error(s) across ${entries.length} entries.`);
  process.exit(1);
}
console.log(`\n✅ ${entries.length} entries valid. ${warnings.length} warning(s).`);
