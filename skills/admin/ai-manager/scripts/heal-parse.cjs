"use strict";

/**
 * Reads a skill: finds SKILL.md files, parses the frontmatter and the failure log into entries.
 */

const { readFileSync, existsSync, readdirSync, statSync } = require("node:fs");
const { join, basename, dirname, resolve } = require("node:path");
const {
  LOG_HEADING,
  ENTRY,
  ENTRY_DATED,
  MONTHS,
  ENTRY_UNDATED,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-constants.cjs");

function today(override) {
  if (override) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(override)) {
      throw new Error(`--date must be YYYY-MM-DD, got \`${override}\``);
    }
    return override;
  }
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function daysBetween(from, to) {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

/** Resolve a skill argument to its SKILL.md, accepting either the file or its directory. */
function skillFile(target) {
  const path = resolve(target);
  if (path.endsWith("SKILL.md")) {
    if (!existsSync(path)) throw new Error(`${path} does not exist.`);
    return path;
  }
  const file = join(path, "SKILL.md");
  if (!existsSync(file))
    throw new Error(`${path} has no SKILL.md, so it is not a skill directory.`);
  return file;
}

/**
 * A flat registry (`.claude/skills/<name>/`) and a packaged source (`ai-doc/skills/<area>/<name>/`)
 * are both real layouts, and a one-level scan reads the packaged one as empty...
 */
function discover(roots) {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 4) return;
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "node_modules") continue;
      const child = join(dir, entry);
      let stats;
      try {
        stats = statSync(child);
      } catch {
        continue; // a dangling symlink is the clean pass's finding, not this one's
      }
      if (!stats.isDirectory()) continue;
      const file = join(child, "SKILL.md");
      if (existsSync(file)) found.push(file);
      else walk(child, depth + 1);
    }
  };
  for (const root of roots) {
    if (!existsSync(root)) continue;
    walk(root, 0);
  }
  return found.toSorted();
}

/**
 * The body is read as text rather than parsed as YAML on purpose: the only frontmatter facts needed
 * here are the name and whether the description makes the promise...
 */
function read(file) {
  const text = readFileSync(file, "utf8");
  const fence = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const frontmatter = fence ? fence[1] : "";
  const nameMatch = /^name:\s*["']?([^"'\n]+?)["']?\s*$/m.exec(frontmatter);
  const description = readDescription(frontmatter);

  // Case-insensitive: "## Learned patterns" is the same section, and reading it
  // as absent reports a skill with a full log as having none.
  const headingMatch = /\n##\s+learned\s+patterns\s*$/im.exec(text);
  const headingAt = headingMatch ? headingMatch.index : -1;
  const logBlock = headingAt === -1 ? null : text.slice(headingAt + 1);

  // Reading only the section then reports a 60-entry log as empty, so follow the link and count the
  // entries where they actually live.
  let entries = logBlock ? parseEntries(logBlock) : [];
  let entriesFile = null;
  // A skill that points at its log from a `Closing a run` step instead of from a `Learned Patterns`
  // heading is still a skill with a log...
  if (entries.length === 0) {
    const searched = logBlock || text;
    // A pointer written as ``[`x.md`](references/x.md)`` puts the bare filename leftmost, and
    // taking that one alone resolved to a path that does not exist...
    const targets = [...searched.matchAll(/\(([^)]*learn[^)]*\.md)\)|`([^`]*learn[^`]*\.md)`/gi)]
      .map((m) => m[1] || m[2])
      .flatMap((t) => [join(dirname(file), t), join(dirname(file), "references", t)]);
    const resolved = targets.find((t) => existsSync(t));
    if (resolved) {
      entries = parseEntries(readFileSync(resolved, "utf8"), { inBody: false });
      entriesFile = resolved;
    }
  }

  return {
    file,
    text,
    name: nameMatch ? nameMatch[1].trim() : basename(dirname(file)),
    description,
    hasLog: headingAt !== -1 || entriesFile !== null,
    /** True when the log is the last section, which is where it belongs. */
    logIsLast: logBlock !== null && !/\n##\s/.test(logBlock.slice(LOG_HEADING.length + 1)),
    entries,
    /** Set when the entries live in references/ rather than in the body. */
    entriesFile,
    bodyLines: text.split("\n").length,
  };
}

/**
 * Read line by line rather than by regex: a lookahead ending in `$` under /m stops at the first
 * end-of-line...
 */
function readDescription(frontmatter) {
  const lines = frontmatter.split("\n");
  const start = lines.findIndex((l) => l.startsWith("description:"));
  if (start === -1) return "";

  const collected = [lines[start].replace(/^description:\s*/, "")];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^[a-z-]+:/i.test(lines[i])) break; // next top-level key
    collected.push(lines[i]);
  }
  return collected
    .join(" ")
    .replace(/^[|>][-+\d]*\s*/, "") // block scalar indicator
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Every entry in a log block.
 */
function parseEntries(logBlock, { inBody = true } = {}) {
  const entries = [];
  const seen = new Set();
  const add = (date, text, raw) => {
    const key = normalise(text).toLowerCase();
    if (seen.has(key)) return; // a Contents list and its own headings are one log
    seen.add(key);
    entries.push({ date, text, raw });
  };
  for (const line of logBlock.split("\n")) {
    const trimmed = line.trim();
    // Reading one shape only lost a whole log; reading both without deduping counted every entry
    // twice.
    if (!inBody) {
      const head = /^#{2,3}\s+(.+)$/.exec(trimmed);
      if (head) {
        const [hit] = parseEntries(`- ${head[1]}`, { inBody: false });
        if (hit) add(hit.date, hit.text, trimmed);
        continue;
      }
    }
    // A `## ` heading ends the section, but only inside a body.
    if (inBody && /^##\s/.test(line) && !line.startsWith(LOG_HEADING)) break;
    const iso = ENTRY.exec(trimmed);
    if (iso) {
      add(iso[1], iso[2], trimmed);
      continue;
    }
    const dated = ENTRY_DATED.exec(trimmed);
    if (dated) {
      const month = MONTHS.indexOf(dated[2].toLowerCase());
      if (month === -1) continue;
      const date = `${dated[3]}-${String(month + 1).padStart(2, "0")}-${dated[1].padStart(2, "0")}`;
      add(date, dated[4], trimmed);
    }
    const undated = ENTRY_UNDATED.exec(trimmed);
    if (undated) {
      add(null, undated[1], trimmed);
      continue;
    }
    // Reading only first lines reported every wrapped log as carrying no `[ask: ...]` at all and
    // measured its entries at a fraction of their length...
    const last = entries[entries.length - 1];
    if (last && trimmed !== "" && /^\s+\S/.test(line)) {
      last.text = `${last.text} ${trimmed}`;
      last.raw = `${last.raw}\n${line}`;
    }
  }
  return entries;
}

/** One line per entry, dates descending, so the log reads newest first. */
function normalise(entry) {
  return entry.replace(/\s+/g, " ").trim().replace(/\.?$/, ".");
}

module.exports = { today, daysBetween, skillFile, discover, read, parseEntries, normalise };
