import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Frontmatter, Located, Skill } from "./types.js";

/**
 * Frontmatter is the opening `---` fence. Anchored to the start of the file
 * because a `---` further down is a horizontal rule in the body, and treating
 * one as a fence silently swallows half the skill.
 */
const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseSkill(located: Located): Skill {
  const text = readFileSync(located.realPath, "utf8");
  const hash = createHash("sha256").update(text).digest("hex");
  const dir = dirname(located.realPath);
  const match = FENCE.exec(text);

  if (!match?.[1]) {
    return {
      ...located,
      dir,
      frontmatter: {},
      raw: null,
      body: text,
      bodyLines: countLines(text),
      hash,
      parseError: null,
      lenient: false,
    };
  }

  const raw = match[1];
  const body = text.slice(match[0].length);
  let frontmatter: Frontmatter = {};
  let parseError: string | null = null;
  let lenient = false;
  try {
    const parsed = parseYaml(raw) as unknown;
    // A scalar or a list where a map belongs is a parse success but a shape
    // failure, and reads downstream as "no name, no description".
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      frontmatter = parsed as Frontmatter;
    } else {
      parseError = "frontmatter is not a key-value map";
    }
  } catch (error) {
    // Strict YAML rejects `description: Use when X: do Y` because a plain
    // scalar cannot contain ": ". Claude Code's loader takes it anyway, so a
    // skill written that way works today and would be a false alarm to call
    // dead. Recover the fields the same forgiving way and record that the file
    // only survives because the reader was generous.
    const recovered = recoverFlatFields(raw);
    if (recovered) {
      frontmatter = recovered;
      lenient = true;
    } else {
      parseError = error instanceof Error ? error.message : String(error);
    }
  }

  return {
    ...located,
    dir,
    frontmatter,
    raw,
    body,
    bodyLines: countLines(body),
    hash,
    parseError,
    lenient,
  };
}

/**
 * Line-oriented `key: value` reader for frontmatter that strict YAML refuses.
 * Deliberately shallow: it only recovers top-level scalars, and returns null if
 * it cannot find the two required fields, so a genuinely broken file is still
 * reported as broken rather than papered over.
 */
export function recoverFlatFields(raw: string): Frontmatter | null {
  const fields: Frontmatter = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = /^([A-Za-z][\w-]*):[ \t]+(.*)$/.exec(line);
    if (!match?.[1]) continue;
    const value = (match[2] ?? "").trim();
    if (value) fields[match[1]] = stripQuotes(value);
  }
  return typeof fields.name === "string" && typeof fields.description === "string" ? fields : null;
}

const stripQuotes = (value: string): string =>
  /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;

const countLines = (text: string): number => (text.trim() === "" ? 0 : text.trim().split("\n").length);

export const str = (value: unknown): string | null => (typeof value === "string" ? value : null);
