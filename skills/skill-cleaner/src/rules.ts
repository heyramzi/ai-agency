import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, normalize } from "node:path";
import { str } from "./parse.js";
import type { Finding, Skill } from "./types.js";

/**
 * Everything the Agent Skills specification defines. Anything else in the
 * frontmatter is reported, because a misspelled key is silently ignored by the
 * runtime and looks exactly like a key that works.
 */
const SPEC_FIELDS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);

/**
 * Fields Claude Code reads that the cross-runtime specification does not
 * define. Legitimate where they are used, so they are not reported: the point
 * of `unknown-field` is catching a typo, and calling these typos would bury
 * the real ones.
 */
const RUNTIME_FIELDS = new Set([
  "argument-hint",
  "disable-model-invocation",
  "user-invocable",
  "model",
]);

const NAME_MAX = 64;
const DESCRIPTION_MAX = 1024;
const COMPATIBILITY_MAX = 500;
/** The spec's recommendation. Past this, the body stops being read carefully. */
const BODY_LINES_MAX = 500;
/** Under this a description cannot carry a trigger, so nothing will match it. */
const DESCRIPTION_MIN_USEFUL = 40;
/**
 * Once loaded, every body line competes with the conversation for context. Past
 * this with nothing split into bundled files, the skill has outgrown a single
 * document and is paying for detail on every load; the fix the spec prescribes
 * is progressive disclosure, not trimming. Half a body-too-long, because a
 * monolith should be restructured well before it becomes illegible.
 */
const BODY_MONOLITH_LINES = 200;

/** Relative links and bare `scripts/x.py` mentions that a skill points at. */
const MD_LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;

/** A single-token backtick span, the only shape that can be a bare path claim. */
const CODE_SPAN = /`([^`\s]+)`/g;

/**
 * Directories the spec reserves for a skill's own bundled resources. A
 * backticked path is only read as a claim about this skill's directory when it
 * starts with one of these. Everything else in backticks (`~/.claude/skills`,
 * `.claude/skills/x.md`, a project path) describes somebody else's tree, and
 * reporting those trains the reader to ignore the rule.
 */
const BUNDLED_DIRS = ["references/", "scripts/", "assets/", "templates/", "examples/"];

export function checkSkill(skill: Skill): Finding[] {
  const findings: Finding[] = [];
  const at = [skill.realPath];
  const add = (code: string, severity: Finding["severity"], message: string, fixable = false) =>
    findings.push({ code, severity, message, paths: at, fixable });

  if (skill.raw === null) {
    add("missing-frontmatter", "error", "No YAML frontmatter, so the skill is never registered.");
    return findings;
  }
  if (skill.parseError) {
    add("frontmatter-unparseable", "error", `Frontmatter does not parse: ${skill.parseError}`);
    return findings;
  }
  if (skill.lenient) {
    add(
      "frontmatter-lenient-yaml",
      "warn",
      "Frontmatter is not valid YAML and loads only because the runtime is forgiving. `skills-ref validate` and stricter readers reject it. Quote any value containing `: `.",
      true,
    );
  }

  const name = str(skill.frontmatter.name);
  const description = str(skill.frontmatter.description);
  const dirName = basename(skill.dir);

  // ---- name
  if (name === null) {
    add("missing-name", "error", "`name` is required and must be a string.");
  } else {
    if (name.length > NAME_MAX) {
      add("name-too-long", "error", `\`name\` is ${name.length} chars, max is ${NAME_MAX}.`);
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      add(
        "name-charset",
        "error",
        `\`name: ${name}\` must be lowercase letters, numbers and hyphens only.`,
      );
    }
    if (name.startsWith("-") || name.endsWith("-")) {
      add("name-hyphen-edge", "error", `\`name: ${name}\` must not start or end with a hyphen.`);
    }
    if (name.includes("--")) {
      add("name-double-hyphen", "error", `\`name: ${name}\` must not contain consecutive hyphens.`);
    }
    if (/claude|anthropic/.test(name)) {
      add(
        "name-reserved-word",
        "warn",
        `\`name: ${name}\` contains a reserved word ("claude"/"anthropic"). Claude Code loads it; a claude.ai or API upload rejects it.`,
      );
    }
    if (name !== dirName) {
      add(
        "name-dir-mismatch",
        "error",
        `\`name: ${name}\` must match the directory name \`${dirName}\`.`,
        true,
      );
    }
  }

  // ---- description
  /**
   * A skill the model cannot invoke is never matched against its description,
   * so trigger-quality checks on it are noise: run against a registry of 35,
   * they produced 19 findings and every one was a user-invoked skill. The spec
   * limits still hold either way.
   */
  const userInvokedOnly = skill.frontmatter["disable-model-invocation"] === true;
  if (description === null) {
    add("missing-description", "error", "`description` is required and must be a string.");
  } else {
    if (description.length > DESCRIPTION_MAX) {
      add(
        "description-too-long",
        "error",
        `\`description\` is ${description.length} chars, max is ${DESCRIPTION_MAX}.`,
      );
    } else if (!userInvokedOnly && description.trim().length < DESCRIPTION_MIN_USEFUL) {
      add(
        "description-thin",
        "warn",
        `\`description\` is ${description.trim().length} chars and cannot carry a trigger, so nothing will match it.`,
      );
    }
    if (/<\/?[a-zA-Z][^>]*>/.test(description)) {
      add(
        "description-xml-tags",
        "warn",
        "`description` contains an XML/HTML tag. Claude Code loads it; platform validation rejects it.",
      );
    }
    if (!userInvokedOnly) {
      if (!/\buse\b|\bwhen\b|\btriggers?\b/i.test(description)) {
        add(
          "description-no-trigger",
          "warn",
          "`description` never says when to use the skill, so the model has nothing to match a task against.",
        );
      }
      if (/^(I |I'll |I can |This skill lets me )/.test(description.trim())) {
        add(
          "description-first-person",
          "warn",
          "`description` is first person. It is injected into the system prompt and should read in the third person.",
        );
      }
    }
  }

  // ---- optional fields
  const compatibility = str(skill.frontmatter.compatibility);
  if (compatibility !== null && compatibility.length > COMPATIBILITY_MAX) {
    add(
      "compatibility-too-long",
      "error",
      `\`compatibility\` is ${compatibility.length} chars, max is ${COMPATIBILITY_MAX}.`,
    );
  }
  if ("compatibility" in skill.frontmatter && compatibility === null) {
    add("compatibility-not-string", "error", "`compatibility` must be a string.");
  }
  const metadata = skill.frontmatter.metadata;
  if (metadata !== undefined) {
    const flat =
      metadata !== null &&
      typeof metadata === "object" &&
      !Array.isArray(metadata) &&
      Object.values(metadata as Record<string, unknown>).every((v) => typeof v === "string");
    if (!flat) {
      add("metadata-not-flat", "warn", "`metadata` must be a flat map of string keys to strings.");
    }
  }
  for (const key of Object.keys(skill.frontmatter)) {
    if (SPEC_FIELDS.has(key) || RUNTIME_FIELDS.has(key)) continue;
    add(
      "unknown-field",
      "warn",
      `\`${key}\` is not a field any runtime reads, so it is silently dropped. Put it under \`metadata:\`, or fix the spelling.`,
    );
  }

  // ---- body
  if (skill.bodyLines > BODY_LINES_MAX) {
    add(
      "body-too-long",
      "warn",
      `Body is ${skill.bodyLines} lines against a ${BODY_LINES_MAX} line recommendation. Move reference material into \`references/\`.`,
    );
  }
  if (skill.bodyLines === 0) {
    add("body-empty", "error", "Frontmatter with no body: the skill registers but teaches nothing.");
  }

  const direct = referencedFiles(skill.body);
  if (
    skill.bodyLines > BODY_MONOLITH_LINES &&
    skill.bodyLines <= BODY_LINES_MAX &&
    direct.length === 0
  ) {
    add(
      "body-verbose",
      "warn",
      `Body is ${skill.bodyLines} lines with nothing split out. Every line competes with the conversation on every load; move detail into \`references/\` and link it.`,
    );
  }

  // Seeded with SKILL.md itself: a reference file linking back to the root is
  // navigation, not content buried two levels deep.
  const resolvedDirect = new Set([
    normalize(join(skill.dir, "SKILL.md")),
    ...direct.map((target) => normalize(join(skill.dir, target))),
  ]);
  // Reference files linking onward to files SKILL.md never links bury those
  // files two levels deep, where they are previewed rather than read. One
  // finding per skill: a deep tree chains from many files for the same reason,
  // and a page of repeats trains the reader to ignore the rule.
  const chaining = new Set<string>();
  for (const target of direct) {
    const path = join(skill.dir, target);
    if (!existsSync(path)) {
      add(
        "broken-reference",
        "error",
        `Points at \`${target}\`, which does not exist next to SKILL.md.`,
      );
      continue;
    }
    if (!/\.md$/i.test(target)) continue;
    // A link to another skill's SKILL.md hands over to that skill; its onward
    // links are its own tree's business, judged when it is scanned.
    if (basename(target) === "SKILL.md") continue;
    const chained = referencedFiles(readFileSync(path, "utf8")).filter(
      // Only prose buries prose. A reference file linking a code sample,
      // a fixture or an image is showing its work, not hiding a third level
      // of instructions: those get opened deliberately, not previewed.
      (onward) => /\.md$/i.test(onward),
    ).filter(
      (onward) => !resolvedDirect.has(normalize(join(dirname(path), onward))),
    );
    if (chained.length > 0) chaining.add(target);
  }
  if (chaining.size > 0) {
    add(
      "nested-reference",
      "warn",
      `\`${[...chaining].join("`, `")}\` link onward to files SKILL.md never links itself. Chained files get previewed, not read; keep references one level deep from SKILL.md.`,
    );
  }

  return findings;
}

/**
 * The body with every closed fenced block blanked out. A skill that teaches a
 * markdown or config format writes example paths that were never meant to
 * resolve, and reporting those is how a real broken link gets lost in the
 * noise. An unclosed fence is left alone on purpose: reading the rest of the
 * file as code would hide every reference after one stray backtick line.
 */
function withoutFences(body: string): string {
  const lines = body.split("\n");
  const kept = [...lines];
  let open: { at: number; char: string } | null = null;
  for (const [index, line] of lines.entries()) {
    const marker = /^[ \t]*(`{3,}|~{3,})/.exec(line)?.[1];
    if (!marker) continue;
    const char = marker[0] ?? "";
    if (!open) {
      open = { at: index, char };
    } else if (char === open.char && /^[ \t]*(?:`{3,}|~{3,})[ \t]*$/.test(line)) {
      for (let j = open.at; j <= index; j++) kept[j] = "";
      open = null;
    }
  }
  return kept.join("\n");
}

/**
 * Only relative paths that look like bundled files. Absolute paths, URLs and
 * anchors belong to somewhere else. Templates (`{scenario_url}`) and bare words
 * used as link text targets (`clickup`) are skipped too: neither was ever meant
 * to name a file, and reporting them trains the reader to ignore this rule.
 */
export function referencedFiles(body: string): string[] {
  const targets = new Set<string>();
  for (const match of withoutFences(body).matchAll(MD_LINK)) {
    const href = match[1];
    if (!href) continue;
    if (/^([a-z]+:|\/|#)/i.test(href)) continue;
    if (/[{}$<>*]/.test(href)) continue;
    const path = href.split("#")[0] ?? href;
    if (!path.includes("/") && !/\.[a-z0-9]{1,5}$/i.test(path)) continue;
    targets.add(path);
  }
  return [...targets].filter(Boolean);
}

/**
 * Bundled paths a skill names in prose rather than linking, e.g. "the ledger is
 * `references/ledger.json`". The same promise as a link, and it fails the same
 * way, but it can only be judged against the whole registry: a skill quoting
 * *another* skill's reference file is the common case here, not a mistake. So
 * this only extracts candidates; `analyze` decides which are dangling.
 */
export function bundledPathMentions(body: string): string[] {
  const targets = new Set<string>();
  for (const match of withoutFences(body).matchAll(CODE_SPAN)) {
    const path = match[1];
    if (!path) continue;
    if (/[{}$<>*]/.test(path)) continue;
    if (!BUNDLED_DIRS.some((dir) => path.startsWith(dir))) continue;
    if (!/\.[a-z0-9]{1,5}$/i.test(path)) continue;
    targets.add(path);
  }
  return [...targets];
}
