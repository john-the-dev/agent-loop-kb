#!/usr/bin/env node
// Compile entries/*.md → dist/kb.json, the single CANONICAL feed every consumer
// (agent-loop.xyz and any third-party agent) reads. It is a manifest object:
// attribution + license + version + entries[]. `version` is a deterministic
// content hash so rebuilds are byte-identical unless content changed (CI-safe).
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { loadAll } from "./lib.mjs";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

const SOURCE = "The Agent Loop";
const HOMEPAGE = "https://agent-loop.xyz";
const REPOSITORY = "https://github.com/john-the-dev/agent-loop-kb";
const ATTRIBUTION = "Source: The Agent Loop (https://agent-loop.xyz)";

const entries = loadAll()
  .filter((e) => !e.__error)
  .map((e) => ({
    id: e.id,
    title: e.title,
    // Feed contract: url is a valid http(s) string or null — never an empty
    // list/other shape (consumers render it as a link).
    url: typeof e.url === "string" && /^https?:\/\/\S+$/.test(e.url) ? e.url : null,
    category: e.category,
    source_type: e.source_type,
    status: e.status,
    grade: e.grade,
    added: e.added,
    last_verified: e.last_verified,
    superseded_by: e.superseded_by ?? null,
    tags: Array.isArray(e.tags) ? e.tags : [],
    evidence: Array.isArray(e.evidence) ? e.evidence : [],
    text: e.text,
    body: e.body ?? null,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

// Deterministic version = short hash of the entries payload only.
const version = createHash("sha256").update(JSON.stringify(entries)).digest("hex").slice(0, 12);

const manifest = {
  source: SOURCE,
  homepage: HOMEPAGE,
  repository: REPOSITORY,
  license: "CC BY 4.0",
  attribution_required: true,
  attribution: ATTRIBUTION,
  usage: `${REPOSITORY}/blob/main/AGENTS.md`,
  version,
  count: entries.length,
  entries,
};

mkdirSync(DIST, { recursive: true });
writeFileSync(`${DIST}kb.json`, JSON.stringify(manifest, null, 2) + "\n");

const byGrade = entries.reduce((m, e) => ((m[e.grade] = (m[e.grade] || 0) + 1), m), {});
console.log(`Built dist/kb.json — v${version}, ${entries.length} entries. Grades: ${JSON.stringify(byGrade)}`);
