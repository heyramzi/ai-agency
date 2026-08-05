import { str } from "./parse.js";
import type { Finding, Skill } from "./types.js";

/**
 * Above this share of shared description words, two skills compete to match.
 * Tuned against a real 500-skill registry: 0.6 reported 385 pairs, which is a
 * number nobody reads. What survives 0.75 is genuinely the same trigger stated
 * twice.
 */
const OVERLAP_THRESHOLD = 0.75;

/** Below this, two descriptions are too short for a score to mean anything. */
const OVERLAP_MIN_WORDS = 8;

/** Words in every description, which would make everything look alike. */
const STOPWORDS = new Set(
  `a an and are as at be but by for from has have how in into is it its of on or over per that the
   this to under use used uses using was when where which while who why with without you your
   skill skills claude agent agents run runs should must can will need needs`
    .split(/\s+/)
    .filter(Boolean),
);

export function analyze(skills: Skill[], danglingBySrc: string[] = []): Finding[] {
  return [
    ...registryCollisions(skills),
    ...identicalCopies(skills),
    ...overlaps(skills),
    ...outsideCodebase(skills),
    ...danglingBySrc.map(
      (path): Finding => ({
        code: "dangling-symlink",
        severity: "error",
        message: "Symlink points at nothing, so the skill it stood for is simply absent.",
        paths: [path],
        fixable: true,
      }),
    ),
  ];
}

/**
 * Two different skills registering the same `name`. The runtime keeps one and
 * drops the other with no error, so the symptom is a skill that "sometimes does
 * not exist" depending on which registry loaded first. This is the single most
 * expensive thing in this file to leave undetected.
 */
function registryCollisions(skills: Skill[]): Finding[] {
  const byName = new Map<string, Skill[]>();
  for (const skill of skills) {
    const name = str(skill.frontmatter.name);
    if (!name) continue;
    const list = byName.get(name);
    if (list) list.push(skill);
    else byName.set(name, [skill]);
  }

  const findings: Finding[] = [];
  for (const [name, group] of byName) {
    if (group.length < 2) continue;
    // Byte-identical copies are reported separately, as a consolidation job
    // rather than a correctness bug: whichever one wins, behaviour is the same.
    if (new Set(group.map((s) => s.hash)).size === 1) continue;
    findings.push({
      code: "duplicate-name",
      severity: "error",
      message: `\`${name}\` is registered from ${group.length} places with different content. The runtime keeps one and silently drops the rest.`,
      paths: group.map((s) => s.realPath),
    });
  }
  return findings;
}

/**
 * The same bytes at several real paths. Not a runtime bug, but every copy is a
 * place the next edit can fail to reach, which is how two copies stop being
 * identical and become a `duplicate-name` instead.
 */
function identicalCopies(skills: Skill[]): Finding[] {
  const byHash = new Map<string, Skill[]>();
  for (const skill of skills) {
    const list = byHash.get(skill.hash);
    if (list) list.push(skill);
    else byHash.set(skill.hash, [skill]);
  }

  const findings: Finding[] = [];
  for (const group of byHash.values()) {
    if (group.length < 2) continue;
    const name = str(group[0]?.frontmatter.name) ?? "unnamed";
    findings.push({
      code: "duplicate-copy",
      severity: "warn",
      message: `\`${name}\` exists as ${group.length} identical copies. Keep one source and symlink the rest, or the next edit only lands on one.`,
      paths: group.map((s) => s.realPath),
    });
  }
  return findings;
}

/**
 * Descriptions that describe the same trigger. Reported, never merged: whether
 * two adjacent skills should become one is a judgment call about the work, not
 * about the text, and a tool that guesses gets it wrong destructively.
 */
function overlaps(skills: Skill[]): Finding[] {
  const candidates = skills
    .map((skill) => ({ skill, words: significantWords(str(skill.frontmatter.description) ?? "") }))
    .filter((c) => c.words.size >= OVERLAP_MIN_WORDS);

  const findings: Finding[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (!a || !b) continue;
      if (a.skill.hash === b.skill.hash) continue; // already a duplicate-copy
      // Same name is already the sharper `duplicate-name`, and saying it twice
      // makes the report look longer than the problem is.
      if (str(a.skill.frontmatter.name) === str(b.skill.frontmatter.name)) continue;
      const score = jaccard(a.words, b.words);
      if (score < OVERLAP_THRESHOLD) continue;
      findings.push({
        code: "overlap",
        severity: "warn",
        message: `\`${str(a.skill.frontmatter.name)}\` and \`${str(b.skill.frontmatter.name)}\` describe the same trigger (${Math.round(score * 100)}% shared). One of them will be picked at random.`,
        paths: [a.skill.realPath, b.skill.realPath],
      });
    }
  }
  return findings;
}

/**
 * A skill whose real path is in no repository. It cannot be reviewed, shared,
 * rolled back or reproduced on another machine, and it is invisible to everyone
 * except the one account that owns the home directory.
 *
 * The check is on the resolved path on purpose. A personal skill that is a
 * symlink into a checkout is fine, and is in fact the intended way to make one
 * available everywhere.
 */
function outsideCodebase(skills: Skill[]): Finding[] {
  return skills
    .filter((skill) => skill.origin !== "plugin" && skill.repo === null)
    .map((skill) => ({
      code: "outside-codebase",
      severity: "error" as const,
      message: `\`${str(skill.frontmatter.name) ?? "unnamed"}\` lives outside any repository. It cannot be reviewed, rolled back or used on another machine. Run \`skill-cleaner adopt\` to move it into one and link it back.`,
      paths: [skill.realPath],
    }));
}

export function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared++;
  return shared / (a.size + b.size - shared);
}
