"use strict";

/**
 * Writes a skill: retrofits the scaffold and appends a dated entry to the log, newest first.
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

/**
 * The log goes last because appends target the end of the file, and the execution step goes into the
 * existing flow rather than a new section...
 */
/**
 * Appending to the end of the file is only correct when there is no log yet.
 */
function appendSection(text, section) {
  const heading = /\n##\s+learned\s+patterns\s*$/im.exec(text);
  const body = `${section.replace(/\s*$/, "")}\n`;
  if (!heading) return `${text.replace(/\s*$/, "")}\n\n${body}`;
  return `${text.slice(0, heading.index).replace(/\s*$/, "")}\n\n${body}\n${text.slice(heading.index + 1)}`;
}

function retrofit(skill, missing, now) {
  let text = skill.text;

  const PROMISE = "This skill appends new failure modes to its own pattern list after each run.";

  if (missing.includes("execution-step")) {
    // The promise rides along in the same section, because both parts speak to
    // the session that has already loaded the skill.
    const promise = missing.includes("heal-promise") ? `${PROMISE}\n\n` : "";
    text = appendSection(
      text,
      `## Closing a run\n\n${promise}If this run surfaced a failure mode not already listed, append it to Learned\nPatterns with today's date before finishing. A learning that stays in the\nconversation is lost when the conversation ends.`,
    );
  } else if (missing.includes("heal-promise")) {
    const closing = /\n## Closing a run\s*\n+/.exec(text);
    text = closing
      ? `${text.slice(0, closing.index + closing[0].length)}${PROMISE}\n\n${text.slice(closing.index + closing[0].length)}`
      : appendSection(text, `## Closing a run\n\n${PROMISE}`);
  }

  if (missing.includes("checklist-item")) {
    const checklist = /\n(- \[ \] .+\n)(?!\s*- \[ \])/;
    const item = "- [ ] New failure modes from this run appended to Learned Patterns\n";
    text = checklist.test(text)
      ? text.replace(checklist, (all, last) => `\n${last}${item}`)
      : appendSection(text, `## Verification\n\n${item}`);
  }

  if (missing.includes("learned-patterns")) {
    text = `${text.replace(/\s*$/, "")}\n\n${LOG_HEADING}\n\nAppended when a run surfaces something this skill did not already know. Newest first.\n\n- ${now}: Scaffold added by \`heal.cjs retrofit\`. Replace this line with the first real failure mode; an empty log trains the reader to skip the section.\n`;
  }

  return text;
}

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

module.exports = { retrofit, sameEntry, appendEntry };
