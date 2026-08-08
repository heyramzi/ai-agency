#!/usr/bin/env node
"use strict";

/**
 * skill-healer - keep the failure log inside a skill honest.
 *
 * A skill that repeats a mistake it already made is a bug. The fix is not a
 * better model, it is a log that lives inside the skill, because the next run
 * reads it as instructions. This checks that the log scaffold is present,
 * retrofits it where it is not, and appends entries without letting the log
 * grow into a second body.
 *
 * No dependencies. Node 20 or later.
 */

const { readFileSync, writeFileSync, existsSync, readdirSync, statSync } = require("node:fs");
const { join, basename, dirname, resolve, relative } = require("node:path");

const USAGE = `skill-healer - keep the failure log inside a skill honest

  skill-healer check [paths...]              Which skills carry the scaffold, which do not
  skill-healer retrofit <skill> [--apply]    Add the missing parts of the scaffold
  skill-healer log <skill> <entry> [--apply] Append a dated entry, newest first
  skill-healer fold <skill>                  Entries old enough to belong in the body

Options
  --apply       Write the change (retrofit and log are dry runs by default)
  --date <ymd>  Date for a logged entry (default: today, local time)
  --json        Machine-readable output
  --quiet       Only skills missing something

With no paths, check scans ./skills and ./.claude/skills. Exits 1 when a skill
is missing the scaffold.`;

/** The heading the log lives under. Fixed, because tools and prose both cite it. */
const LOG_HEADING = "## Learned Patterns";

/**
 * The phrase that tells a reader of the description that this skill rewrites
 * itself. It belongs in the description rather than only the body: the
 * description is the part the model reads when deciding what to load.
 */
const FRONTMATTER_PROMISE = /appends?\s+(?:new\s+)?(?:failure\s+modes?|patterns?)[^.]*\bafter each run\b/i;

/** An entry: `- YYYY-MM-DD: what went wrong, what to do instead.` */
const ENTRY = /^-\s+(\d{4}-\d{2}-\d{2}):\s*(.+)$/;

/**
 * Past this many entries the log has stopped being a log and become a second
 * body. That is the signal to fold the hardened ones into the prose, not to
 * raise the number.
 */
const LOG_ENTRIES_MAX = 25;

/**
 * An entry this old has either changed how the body describes the work, or it
 * never mattered. Either way it stops earning its line.
 */
const FOLD_AFTER_DAYS = 180;

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
  if (!existsSync(file)) throw new Error(`${path} has no SKILL.md, so it is not a skill directory.`);
  return file;
}

/** Every SKILL.md one level under the given roots. */
function discover(roots) {
  const found = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root)) {
      const dir = join(root, entry);
      let stats;
      try {
        stats = statSync(dir);
      } catch {
        continue; // a dangling symlink is skill-cleaner's finding, not this one's
      }
      if (!stats.isDirectory()) continue;
      const file = join(dir, "SKILL.md");
      if (existsSync(file)) found.push(file);
    }
  }
  return found.sort();
}

/**
 * Split a SKILL.md into the parts this tool reasons about.
 *
 * The body is read as text rather than parsed as YAML on purpose: the only
 * frontmatter facts needed here are the name and whether the description makes
 * the promise, and a regex over two lines does not justify a dependency.
 */
function read(file) {
  const text = readFileSync(file, "utf8");
  const fence = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const frontmatter = fence ? fence[1] : "";
  const nameMatch = /^name:\s*["']?([^"'\n]+?)["']?\s*$/m.exec(frontmatter);
  const descMatch = /^description:\s*([\s\S]*?)(?=\n[a-z-]+:|$)/m.exec(frontmatter);

  const headingAt = text.indexOf(`\n${LOG_HEADING}`);
  const logBlock = headingAt === -1 ? null : text.slice(headingAt + 1);

  return {
    file,
    text,
    name: nameMatch ? nameMatch[1].trim() : basename(dirname(file)),
    description: descMatch ? descMatch[1].replace(/\s+/g, " ").trim() : "",
    hasLog: headingAt !== -1,
    /** True when the log is the last section, which is where it belongs. */
    logIsLast: logBlock !== null && !/\n##\s/.test(logBlock.slice(LOG_HEADING.length + 1)),
    entries: logBlock ? parseEntries(logBlock) : [],
    bodyLines: text.split("\n").length,
  };
}

function parseEntries(logBlock) {
  const entries = [];
  for (const line of logBlock.split("\n")) {
    if (/^##\s/.test(line) && !line.startsWith(LOG_HEADING)) break;
    const match = ENTRY.exec(line.trim());
    if (match) entries.push({ date: match[1], text: match[2] });
  }
  return entries;
}

/**
 * The four parts, all required. A skill with three of them heals by accident:
 * the promise without the log has nowhere to write, and the log without the
 * final step is never written to.
 */
function audit(skill, now) {
  const missing = [];
  if (!FRONTMATTER_PROMISE.test(skill.description)) missing.push("frontmatter-promise");
  if (!/if this run surfaced/i.test(skill.text)) missing.push("execution-step");
  if (!/append(ed)?[^.\n]*\bLearned Patterns\b/i.test(skill.text)) missing.push("checklist-item");
  if (!skill.hasLog) missing.push("learned-patterns");

  const warnings = [];
  if (skill.hasLog && !skill.logIsLast) {
    warnings.push("Learned Patterns is not the last section, so appends land mid-document.");
  }
  if (skill.hasLog && skill.entries.length === 0) {
    warnings.push("Learned Patterns is empty. Seed it from the run that motivated the skill.");
  }
  if (skill.entries.length > LOG_ENTRIES_MAX) {
    warnings.push(
      `${skill.entries.length} entries is a second body. Fold the hardened ones into the prose.`,
    );
  }
  const stale = skill.entries.filter((e) => daysBetween(e.date, now) > FOLD_AFTER_DAYS);
  if (stale.length > 0) {
    warnings.push(`${stale.length} entries older than ${FOLD_AFTER_DAYS} days. Run \`fold\`.`);
  }
  const unordered = skill.entries.some((e, i) => i > 0 && e.date > skill.entries[i - 1].date);
  if (unordered) warnings.push("Entries are not newest first.");

  return { missing, warnings, stale };
}

/**
 * Add only the parts that are absent, and put each where it is read.
 *
 * The log goes last because appends target the end of the file, and the
 * execution step goes into the existing flow rather than a new section, so a
 * retrofitted skill reads like one that was written with the scaffold.
 */
function retrofit(skill, missing, now) {
  let text = skill.text;

  if (missing.includes("frontmatter-promise")) {
    text = text.replace(
      /^(description:\s*)(["']?)([\s\S]*?)\2(\s*)$/m,
      (all, key, quote, value, tail) => {
        const trimmed = value.trim().replace(/\s+$/, "");
        const joined = `${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."} Appends new failure modes to its own pattern list after each run.`;
        // Requote only if it was quoted, so a plain scalar stays plain and a
        // quoted one does not gain a nested quote.
        return `${key}${quote}${joined}${quote}${tail}`;
      },
    );
  }

  if (missing.includes("execution-step")) {
    text = `${text.replace(/\s*$/, "")}\n\n## Closing a run\n\nIf this run surfaced a failure mode not already listed, append it to Learned\nPatterns with today's date before finishing. A learning that stays in the\nconversation is lost when the conversation ends.\n`;
  }

  if (missing.includes("checklist-item")) {
    const checklist = /\n(- \[ \] .+\n)(?!\s*- \[ \])/;
    const item = "- [ ] New failure modes from this run appended to Learned Patterns\n";
    text = checklist.test(text)
      ? text.replace(checklist, (all, last) => `\n${last}${item}`)
      : `${text.replace(/\s*$/, "")}\n\n## Verification\n\n${item}`;
  }

  if (missing.includes("learned-patterns")) {
    text = `${text.replace(/\s*$/, "")}\n\n${LOG_HEADING}\n\nAppended when a run surfaces something this skill did not already know. Newest first.\n\n- ${now}: Scaffold added by \`skill-healer retrofit\`. Replace this line with the first real failure mode; an empty log trains the reader to skip the section.\n`;
  }

  return text;
}

/** One line per entry, dates descending, so the log reads newest first. */
function normalise(entry) {
  return entry.replace(/\s+/g, " ").trim().replace(/\.?$/, ".");
}

/** Compare on content alone, so a re-run does not log what punctuation hid. */
function sameEntry(a, b) {
  return normalise(a).toLowerCase() === normalise(b).toLowerCase();
}

/**
 * Rebuild the log section with the new entry in date order.
 *
 * The section is rewritten rather than spliced because the log has three parts
 * that a positional insert keeps confusing: the heading, an optional line of
 * prose introducing it, and the entries. Splicing after the heading buries the
 * prose under the newest entry; splicing after the prose has to find where the
 * prose ends. Reading the parts and re-emitting them is shorter than either and
 * cannot land an entry outside the section.
 */
function appendEntry(skill, entry, now) {
  const line = `- ${now}: ${normalise(entry)}`;
  if (!skill.hasLog) {
    return `${skill.text.replace(/\s*$/, "")}\n\n${LOG_HEADING}\n\n${line}\n`;
  }

  const start = skill.text.indexOf(`\n${LOG_HEADING}`) + 1;
  const after = skill.text.slice(start + LOG_HEADING.length);
  // A later `## ` heading ends the section. Without one the section runs to EOF,
  // which is where the log belongs anyway.
  const nextHeading = after.search(/\n##\s/);
  // Stop *on* the newline rather than past it, so the blank line separating the
  // log from whatever follows survives the rewrite.
  const end = nextHeading === -1 ? skill.text.length : start + LOG_HEADING.length + nextHeading;

  const section = skill.text.slice(start, end);
  const intro = [];
  const entries = [];
  for (const raw of section.split("\n").slice(1)) {
    const match = ENTRY.exec(raw.trim());
    if (match) entries.push({ date: match[1], text: match[2] });
    else if (raw.trim() !== "") intro.push(raw);
  }

  entries.push({ date: now, text: normalise(entry) });
  // Stable within a date, so entries logged on the same day keep the order they
  // were learned in rather than being reshuffled on every write.
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const rebuilt =
    [LOG_HEADING, "", ...(intro.length > 0 ? [...intro, ""] : []), ...entries.map((e) => `- ${e.date}: ${e.text}`)]
      .join("\n") + "\n";

  return skill.text.slice(0, start) + rebuilt + skill.text.slice(end);
}

function main(argv) {
  const flags = { apply: false, json: false, quiet: false, date: null };
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") flags.apply = true;
    else if (arg === "--json") flags.json = true;
    else if (arg === "--quiet") flags.quiet = true;
    else if (arg === "--date") flags.date = argv[++i];
    else if (arg === "-h" || arg === "--help") return usage(0);
    else if (arg.startsWith("--")) {
      process.stderr.write(`unknown flag \`${arg}\`\n\n${USAGE}\n`);
      return 2;
    } else positionals.push(arg);
  }

  const [command = "check", ...rest] = positionals;
  if (command === "help") return usage(0);

  const now = today(flags.date);
  const short = (p) => {
    const rel = relative(process.cwd(), p);
    return rel && !rel.startsWith("..") ? rel : p;
  };

  if (command === "check") {
    const roots = rest.length > 0 ? rest.map((r) => resolve(r)) : [resolve("skills"), resolve(".claude/skills")];
    // A root that is itself a skill is the single-skill case, not a registry.
    const files = roots.flatMap((root) =>
      existsSync(join(root, "SKILL.md")) ? [join(root, "SKILL.md")] : discover([root]),
    );
    if (files.length === 0) {
      process.stderr.write(`No SKILL.md found under ${roots.map(short).join(", ")}\n`);
      return 2;
    }

    const results = files.map((file) => {
      const skill = read(file);
      const { missing, warnings } = audit(skill, now);
      return { name: skill.name, path: file, entries: skill.entries.length, missing, warnings };
    });

    if (flags.json) {
      process.stdout.write(`${JSON.stringify({ checked: results.length, results }, null, 2)}\n`);
    } else {
      const shown = flags.quiet
        ? results.filter((r) => r.missing.length > 0 || r.warnings.length > 0)
        : results;
      const healing = results.filter((r) => r.missing.length === 0).length;
      process.stdout.write(`${healing}/${results.length} skills carry the failure log\n\n`);
      for (const r of shown) {
        const mark = r.missing.length === 0 ? "ok  " : "miss";
        const detail = r.missing.length === 0 ? `${r.entries} entries` : r.missing.join(", ");
        process.stdout.write(`  ${mark}  ${r.name}  ${detail}\n`);
        for (const w of r.warnings) process.stdout.write(`        ${w}\n`);
      }
      const broken = results.filter((r) => r.missing.length > 0);
      if (broken.length > 0) {
        process.stdout.write(`\nRetrofit one with \`skill-healer retrofit <skill> --apply\`.\n`);
      }
    }
    return results.some((r) => r.missing.length > 0) ? 1 : 0;
  }

  if (command === "retrofit") {
    const [target] = rest;
    if (!target) {
      process.stderr.write("retrofit needs a skill directory or SKILL.md\n");
      return 2;
    }
    const file = skillFile(target);
    const skill = read(file);
    const { missing } = audit(skill, now);
    if (missing.length === 0) {
      process.stdout.write(`${skill.name} already carries all four parts.\n`);
      return 0;
    }
    const next = retrofit(skill, missing, now);
    if (flags.apply) writeFileSync(file, next);
    const prefix = flags.apply ? "added" : "would add";
    process.stdout.write(`${prefix} to ${short(file)}: ${missing.join(", ")}\n`);
    if (!flags.apply) process.stdout.write("\nRe-run with --apply to write it.\n");
    return 0;
  }

  if (command === "log") {
    const [target, ...words] = rest;
    const entry = words.join(" ").trim();
    if (!target || !entry) {
      process.stderr.write('log needs a skill and an entry: skill-healer log ./skills/x "what went wrong, what to do instead"\n');
      return 2;
    }
    const file = skillFile(target);
    const skill = read(file);
    if (skill.entries.some((e) => sameEntry(e.text, entry))) {
      process.stdout.write(`Already logged, not repeating it.\n`);
      return 0;
    }
    const next = appendEntry(skill, entry, now);
    if (flags.apply) writeFileSync(file, next);
    const prefix = flags.apply ? "logged" : "would log";
    process.stdout.write(`${prefix} to ${short(file)}:\n  - ${now}: ${entry}\n`);
    if (!flags.apply) process.stdout.write("\nRe-run with --apply to write it.\n");
    return 0;
  }

  if (command === "fold") {
    const [target] = rest;
    if (!target) {
      process.stderr.write("fold needs a skill directory or SKILL.md\n");
      return 2;
    }
    const skill = read(skillFile(target));
    const { stale } = audit(skill, now);
    if (flags.json) {
      process.stdout.write(`${JSON.stringify({ name: skill.name, stale }, null, 2)}\n`);
      return 0;
    }
    if (stale.length === 0) {
      process.stdout.write(`Nothing has hardened yet. ${skill.entries.length} entries, all recent.\n`);
      return 0;
    }
    process.stdout.write(
      `${stale.length} entries older than ${FOLD_AFTER_DAYS} days.\n` +
        `Each one either changed how the body describes the work, in which case say it in the\n` +
        `body and delete the line, or it never mattered and the line goes anyway.\n\n`,
    );
    for (const e of stale) process.stdout.write(`  ${e.date}  ${e.text}\n`);
    return 0;
  }

  process.stderr.write(`unknown command \`${command}\`\n\n${USAGE}\n`);
  return 2;
}

function usage(code) {
  process.stdout.write(`${USAGE}\n`);
  return code;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}

module.exports = { read, audit, retrofit, appendEntry, parseEntries, discover, daysBetween };
