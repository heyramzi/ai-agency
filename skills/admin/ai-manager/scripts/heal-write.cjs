"use strict";

/**
 * Appends a dated entry to a skill's log, newest first.
 */

const { readFileSync } = require("node:fs");
const {
  LOG_HEADING,
  ENTRY,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-constants.cjs");
const {
  parseEntries,
  normalise,
} = require("#ai-doc/skills/admin/kit/ai-manager/scripts/heal-parse.cjs");

/** Compare on content alone, so a re-run does not log what punctuation hid. */
function sameEntry(a, b) {
  return normalise(a).toLowerCase() === normalise(b).toLowerCase();
}

/**
 * The section is rewritten rather than spliced because the log has three parts that a positional
 * insert keeps confusing: the heading, an optional line of prose introducing it...
 */
function appendEntry(skill, entry, now) {
  const line = `- ${now}: ${normalise(entry)}`;
  if (skill.entriesFile) {
    const text = readFileSync(skill.entriesFile, "utf8");
    const lines = text.split("\n");
    // Newest first, so the entry goes above the first one already there. With no
    // entries yet it goes at the end, under whatever prose introduces the file.
    const at = lines.findIndex((l) => ENTRY.test(l.trim()));
    if (at === -1) return `${text.replace(/\s*$/, "")}\n\n${line}\n`;
    // An index of one-line rules runs them together; a log of paragraphs separates them, and mixing
    // the two makes every append visible as a formatting change.
    const spaced = lines
      .slice(at + 1)
      .some((l, i) => l.trim() === "" && ENTRY.test((lines[at + i + 2] || "").trim()));
    lines.splice(at, 0, ...(spaced ? [line, ""] : [line]));
    return lines.join("\n");
  }
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
  for (const line of section.split("\n").slice(1)) {
    const [parsed] = parseEntries(line);
    if (parsed) entries.push(parsed);
    else if (line.trim() !== "") intro.push(line);
  }

  entries.push({ date: now, text: normalise(entry) });
  // Stable within a date, so entries logged on the same day keep the order they
  // were learned in rather than being reshuffled on every write.
  entries.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  const rebuilt =
    [
      LOG_HEADING,
      "",
      ...(intro.length > 0 ? [...intro, ""] : []),
      ...entries.map((e) => e.raw || (e.date ? `- ${e.date}: ${e.text}` : `- ${e.text}`)),
    ].join("\n") + "\n";

  return skill.text.slice(0, start) + rebuilt + skill.text.slice(end);
}

module.exports = { sameEntry, appendEntry };
