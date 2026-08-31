#!/usr/bin/env node
// Probe each entry's source WITH a nonsense-path control on the same origin.
//
// WHY THE CONTROL IS THE WHOLE POINT. On 2026-08-31 two entries were graded
// "fetched live" on pages that were never read: www.ecfr.gov answers 200 with
// "Federal Register :: Request Access" for EVERY path, so a bare 200 from that
// host is a catch-all that proves nothing. A bare status check cannot see this;
// only comparing against a path that should NOT exist can.
//
// Deliberately NOT wired into CI: it makes live requests to third-party sites,
// so running it per-push would be both flaky and rude. Run it when grading.
//   node scripts/check-sources.mjs            # report, always exit 0
//   node scripts/check-sources.mjs --strict   # exit 1 if a GRADED entry is unverifiable
import { loadAll } from "./lib.mjs";

const STRICT = process.argv.includes("--strict");
const CONTROL = "/zz-nonexistent-control-" + "9".repeat(8);
const PAUSE_MS = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOne(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(25000) });
    const body = await res.text().catch(() => "");
    const m = body.match(/<title[^>]*>([^<]*)<\/title>/i);
    return { status: res.status, title: (m ? m[1] : "").trim().slice(0, 60) };
  } catch (err) {
    return { status: 0, title: `ERROR ${err.name}` };
  }
}

// One control per ORIGIN, not per entry — fewer requests, same discrimination.
const controls = new Map();
async function controlFor(origin) {
  if (!controls.has(origin)) {
    await sleep(PAUSE_MS);
    controls.set(origin, await fetchOne(origin + CONTROL));
  }
  return controls.get(origin);
}

function classify(real, ctrl) {
  if (real.status === 0) return "error";
  if (real.status === 404) return "dead";
  if (real.status === 401 || real.status === 403) return "blocked";
  if (real.status >= 200 && real.status < 300) {
    const sameStatus = ctrl.status === real.status;
    const sameTitle = ctrl.title === real.title;
    if (sameStatus && sameTitle) return "catch-all";
    return "ok";
  }
  return `http-${real.status}`;
}

// BODY links count. The two entries that triggered this script cited their
// regulator source in the BODY, not front-matter — probing only `url` misses them.
const targets = [];
for (const e of loadAll()) {
  const seen = new Set();
  if (e.url && /^https?:/.test(e.url)) { seen.add(e.url); targets.push({ e, url: e.url, where: "url" }); }
  for (const m of (e.body || "").matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    if (!seen.has(m[1])) { seen.add(m[1]); targets.push({ e, url: m[1], where: "body" }); }
  }
}
const rows = [];
for (const t of targets) {
  let origin;
  try { origin = new URL(t.url).origin; } catch { continue; }
  const ctrl = await controlFor(origin);
  await sleep(PAUSE_MS);
  const real = await fetchOne(t.url);
  rows.push({ id: t.e.id, grade: t.e.grade, where: t.where, verdict: classify(real, ctrl), real, ctrl });
}

const BAD = new Set(["catch-all", "blocked", "dead", "error"]);
for (const r of rows.sort((a, b) => a.verdict.localeCompare(b.verdict) || a.id.localeCompare(b.id))) {
  const mark = BAD.has(r.verdict) ? "!!" : "ok";
  console.log(`${mark} ${r.verdict.padEnd(10)} ${r.grade.padEnd(8)} ${r.where.padEnd(4)} ${r.id.padEnd(30)} ${r.real.status} ${r.real.title}`);
  if (r.verdict === "catch-all") console.log(`   control returned the SAME: ${r.ctrl.status} ${r.ctrl.title}`);
}

const unver = rows.filter((r) => BAD.has(r.verdict));
const blocking = unver.filter((r) => r.where === "url" && r.grade !== "unrated");
const supporting = unver.filter((r) => !(r.where === "url" && r.grade !== "unrated"));
console.log(`\n${rows.length} sources probed (front-matter + body links); ${unver.length} unverifiable.`);
console.log(`  ${blocking.length} are the GRADED source of a graded entry — those undercut the grade.`);
console.log(`  ${supporting.length} are body citations or on unrated entries — worth repointing, but the grade may still stand.`);
if (unver.length) {
  console.log("Unverifiable is a statement about ACCESS, not about the page. Say that in the evidence");
  console.log("rather than writing 'fetched live', and re-try with a second client before concluding.");
}
if (STRICT && blocking.length) process.exit(1);
