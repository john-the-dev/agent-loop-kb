// Zero-dependency front-matter parser for entries/*.md
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const ENUMS = {
  category: ["frameworks", "orchestration", "evaluation", "memory", "tools", "protocols", "security", "infra", "research", "lessons", "general"],
  source_type: ["docs", "blog", "paper", "release", "repo", "research", "post-mortem", "retrospective", "talk"],
  status: ["current", "experimental", "deprecated", "superseded"],
  grade: ["A", "B", "C", "D", "unrated"],
};
export const REQUIRED = ["id", "title", "url", "category", "source_type", "status", "grade", "added", "last_verified", "evidence"];
export const ENTRIES_DIR = fileURLToPath(new URL("../entries/", import.meta.url));
export const STALE_DAYS = 90;

function stripComment(v) {
  // strip trailing `   # comment` but keep # inside quotes/urls
  const m = v.match(/\s+#\s.*$/);
  return (m ? v.slice(0, m.index) : v).trim();
}

function parseScalar(raw) {
  let v = stripComment(raw);
  if (v === "null" || v === "") return v === "" ? "" : null;
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  }
  return v.replace(/^["']|["']$/g, "");
}

export function parseEntry(text) {
  if (!text.startsWith("---")) throw new Error("missing front-matter");
  const end = text.indexOf("\n---", 3);
  if (end === -1) throw new Error("unterminated front-matter");
  const fm = text.slice(3, end).trim();
  const body = text.slice(end + 4).trim();
  const data = {};
  let listKey = null;
  for (const line of fm.split("\n")) {
    if (listKey && /^\s+-\s/.test(line)) {
      data[listKey].push(line.replace(/^\s+-\s/, "").trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    listKey = null;
    const m = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    if (rawVal.trim() === "") { data[key] = []; listKey = key; continue; } // block list
    data[key] = parseScalar(rawVal);
  }
  // Optional long-form section: everything under a "## Deep dive" heading
  // becomes `body` (markdown); the text above it stays the embeddable summary.
  const marker = body.search(/(^|\n)## Deep dive[ \t]*(\n|$)/);
  if (marker === -1) {
    data.text = body;
    data.body = null;
  } else {
    data.text = body.slice(0, marker).trim();
    data.body = body.slice(marker).replace(/^\s*## Deep dive[ \t]*\n?/, "").trim() || null;
  }
  return data;
}

export function loadAll() {
  const files = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith(".md"));
  return files.map((f) => {
    try {
      const e = parseEntry(readFileSync(join(ENTRIES_DIR, f), "utf8"));
      e.__file = f;
      return e;
    } catch (err) {
      return { __file: f, __error: err.message };
    }
  });
}

export function daysSince(dateStr, now = new Date("2026-07-14T00:00:00Z")) {
  const d = new Date(dateStr + "T00:00:00Z");
  return Math.floor((now - d) / 86400000);
}
