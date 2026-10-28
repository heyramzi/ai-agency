"use strict";

/**
 * Thresholds and entry patterns the heal scripts share: the log heading, the entry shapes and the limits.
 */

/** The heading the log lives under. Fixed, because tools and prose both cite it. */
const LOG_HEADING = "## Learned Patterns";

/**
 * The description is preloaded into every session for every skill in the registry, and this sentence
 * does nothing for the choice of which skill to load...
 */
// The quantifier between the verb and the noun is free: "appends new failure modes", "appends every
// new failure mode", "appends any failure it hits" all make the same promise...
const _HEAL_PROMISE =
  /appends?\s+(?:\w+\s+){0,3}(?:failure\s+modes?|patterns?)[^.]*\bafter each run\b/i;

/** An entry: `- YYYY-MM-DD: what went wrong, what to do instead.` */
const ENTRY = /^-\s+\*{0,2}(\d{4}-\d{2}-\d{2})\s*(?:\([^)]*\))?\s*[,.:\u2013\u2014-]\s*(.+)$/;

/**
 * Reading only the ISO form reported eight logs as empty while they held between 8 and 300 entries,
 * so the 25-entry ceiling never fired on the logs furthest past it.
 */
const ENTRY_DATED =
  /^-\s+\*{0,2}(\d{1,2})\s+([A-Z][a-z]{2})[a-z]*\.?\s+(\d{4})\s*[,.:\u2014\u2013-]*\s*(.+)$/;
const MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");

/**
 * A skill published for other people to fork carries its lessons without the author's calendar...
 */
const ENTRY_UNDATED = /^-\s+(.+)$/;

/**
 * A full log is the signal to fold entries into the prose; a long entry is a run's story, which belongs in git.
 */
const {
  logMaxEntries: LOG_ENTRIES_MAX,
  logEntryMaxChars: ENTRY_CHARS_MAX,
} = require("#ai-doc/limits.json");

/** Entries a log needs before "no replayable ask anywhere" reads as a dropped convention. */
const ASK_COVERAGE_FLOOR = 5;

/**
 * An entry this old has either changed how the body describes the work, or it
 * never mattered. Either way it stops earning its line.
 */
const FOLD_AFTER_DAYS = 180;

module.exports = {
  LOG_HEADING,
  ENTRY,
  ENTRY_DATED,
  MONTHS,
  ENTRY_UNDATED,
  LOG_ENTRIES_MAX,
  ENTRY_CHARS_MAX,
  ASK_COVERAGE_FLOOR,
  FOLD_AFTER_DAYS,
};
