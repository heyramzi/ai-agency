#!/usr/bin/env node
"use strict";

/**
 * This checks that the log scaffold is present, retrofits it where it is not, and appends entries
 * without letting the log grow into a second body.
 */

const { writeFileSync, existsSync } = require("node:fs");
const { join, resolve, relative } = require("node:path");
const {
  ENTRY_CHARS_MAX,
  FOLD_AFTER_DAYS,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-constants.cjs");
const {
  today,
  daysBetween,
  skillFile,
  discover,
  read,
  parseEntries,
  normalise,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-parse.cjs");
const { audit } = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-audit.cjs");
const {
  retrofit,
  sameEntry,
  appendEntry,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-write.cjs");

const USAGE = `heal.cjs: keep the failure log inside a skill honest

  heal.cjs check [paths...]              Which skills carry the scaffold, which do not
  heal.cjs retrofit <skill> [--apply]    Add the missing parts of the scaffold
  heal.cjs log <skill> <entry> [--apply] Append a dated entry, newest first
  heal.cjs fold <skill>                  Entries old enough to belong in the body

Options
  --apply       Write the change (retrofit and log are dry runs by default)
  --date <ymd>  Date for a logged entry (default: today, local time)
  --long        Log an entry over 240 characters anyway
  --json        Machine-readable output
  --quiet       Only skills missing something

With no paths, check scans ./skills and ./.claude/skills. Exits 1 when a skill
is missing the scaffold.`;

function main(argv) {
  const flags = { apply: false, json: false, quiet: false, date: null, long: false };
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") flags.apply = true;
    else if (arg === "--json") flags.json = true;
    else if (arg === "--quiet") flags.quiet = true;
    else if (arg === "--long") flags.long = true;
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
    const roots =
      rest.length > 0
        ? rest.map((r) => resolve(r))
        : [resolve("skills"), resolve(".claude/skills")];
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
        process.stdout.write(`\nRetrofit one with \`heal.cjs retrofit <skill> --apply\`.\n`);
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
    // Strip it before the ceiling and the duplicate check, so both judge the rule alone.
    const entry = words
      .join(" ")
      .trim()
      .replace(/^\d{4}-\d{2}-\d{2}\s*:\s*/, "");
    if (!target || !entry) {
      process.stderr.write(
        'log needs a skill and an entry: heal.cjs log ./skills/x "what went wrong, what to do instead"\n',
      );
      return 2;
    }
    // Refuse before reading the skill: the writer has the run in front of them and is the only one
    // who can say which sentence is the rule.
    if (normalise(entry).length > ENTRY_CHARS_MAX && !flags.long) {
      process.stderr.write(
        `Entry is ${normalise(entry).length} characters; the ceiling is ${ENTRY_CHARS_MAX}.\n` +
          `Lead with the law, keep one checkable anchor, drop the run. --long to override.\n`,
      );
      return 2;
    }
    const file = skillFile(target);
    const skill = read(file);
    if (skill.entries.some((e) => sameEntry(e.text, entry))) {
      process.stdout.write(`Already logged, not repeating it.\n`);
      return 0;
    }
    const next = appendEntry(skill, entry, now);
    const dest = skill.entriesFile || file;
    if (flags.apply) writeFileSync(dest, next);
    const prefix = flags.apply ? "logged" : "would log";
    process.stdout.write(`${prefix} to ${short(dest)}:\n  - ${now}: ${entry}\n`);
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
      process.stdout.write(
        `Nothing has hardened yet. ${skill.entries.length} entries, all recent.\n`,
      );
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
