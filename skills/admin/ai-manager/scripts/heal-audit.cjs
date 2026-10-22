"use strict";

/**
 * Audits a parsed skill against the log rules: what is missing, what to warn about, what is stale.
 */

const {
  LOG_ENTRIES_MAX,
  ENTRY_CHARS_MAX,
  ASK_COVERAGE_FLOOR,
  FOLD_AFTER_DAYS,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-constants.cjs");
const { daysBetween } = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-parse.cjs");

/**
 * Every CLAUDE.md already makes a session log its lessons, so a skill needs no scaffold
 * (4 Oct 2026). Its log stays short: over 25 entries is sediment.
 */
const ENTRIES_MAX = 25;

function audit(skill, now) {
  const missing = [];
  if (skill.hasLog && skill.entries.length > ENTRIES_MAX)
    missing.push(`over ${ENTRIES_MAX} entries, fold them`);

  const warnings = [];
  if (skill.hasLog && !skill.logIsLast) {
    warnings.push("Learned Patterns is not the last section, so appends land mid-document.");
  }
  if (skill.hasLog && skill.entries.length === 0) {
    warnings.push("Learned Patterns is empty. Seed it from the run that motivated the skill.");
  }
  // A log of one-line rules can hold 128 entries and still be 130 lines, and warning on the count
  // there tells a maintainer to undo the fix.
  const meanChars =
    skill.entries.length > 0
      ? skill.entries.reduce((n, e) => n + e.text.length, 0) / skill.entries.length
      : 0;
  const inlineEvidence = meanChars > ENTRY_CHARS_MAX;
  const overlong = skill.entries.filter((e) => e.text.length > ENTRY_CHARS_MAX);
  if (overlong.length > 0) {
    warnings.push(
      `${overlong.length} entries over ${ENTRY_CHARS_MAX} characters (mean ${Math.round(meanChars)}). ` +
        `Rewrite them as the rule alone; the run belongs in git.`,
    );
  }
  if (skill.entries.length > LOG_ENTRIES_MAX && (inlineEvidence || !skill.entriesFile)) {
    warnings.push(
      `${skill.entries.length} entries is a second body. Compress each entry to its rule ` +
        `with compress_log.py, or fold the hardened ones into the prose.`,
    );
  }
  // WHY count the asks: `[ask: ...]` is the only thing in an entry that can be re-run, and replay
  // is the gap self-healing.md has named open since 2026-08-31.
  const asks = skill.entries.filter((e) => /\[ask:/i.test(e.text));
  if (skill.entries.length >= ASK_COVERAGE_FLOOR && asks.length === 0) {
    warnings.push(
      `No entry carries an \`[ask: ...]\`, so none of these ${skill.entries.length} can be replayed. ` +
        `Add it when a prompt caused the failure.`,
    );
  }
  const stale = skill.entries.filter((e) => e.date && daysBetween(e.date, now) > FOLD_AFTER_DAYS);
  if (stale.length > 0) {
    warnings.push(`${stale.length} entries older than ${FOLD_AFTER_DAYS} days. Run \`fold\`.`);
  }
  const dated = skill.entries.filter((e) => e.date);
  const unordered = dated.some((e, i) => i > 0 && e.date > dated[i - 1].date);
  if (unordered) warnings.push("Entries are not newest first.");

  return { missing, warnings, stale };
}

module.exports = { audit };
