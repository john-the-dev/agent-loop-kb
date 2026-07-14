#!/usr/bin/env node
// Compile entries/*.md → dist/kb.json (machine-ingestible by agent-loop.xyz RAG).
import { mkdirSync, writeFileSync } from "node:fs";
import { loadAll } from "./lib.mjs";

const DIST = new URL("../dist/", import.meta.url).pathname;

const entries = loadAll()
  .filter((e) => !e.__error)
  .map((e) => ({
    id: e.id,
    title: e.title,
    url: e.url,
    category: e.category,
    source_type: e.source_type,
    status: e.status,
    grade: e.grade,
    added: e.added,
    last_verified: e.last_verified,
    superseded_by: e.superseded_by ?? null,
    tags: Array.isArray(e.tags) ? e.tags : [],
    text: e.text,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

mkdirSync(DIST, { recursive: true });
writeFileSync(`${DIST}kb.json`, JSON.stringify(entries, null, 2) + "\n");

const byGrade = entries.reduce((m, e) => ((m[e.grade] = (m[e.grade] || 0) + 1), m), {});
console.log(`Built dist/kb.json — ${entries.length} entries. Grades: ${JSON.stringify(byGrade)}`);
