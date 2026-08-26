import { existsSync, mkdirSync, readFileSync, renameSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { repoOf } from "./discover.js";
import { str } from "./parse.js";
import type { Finding, Skill } from "./types.js";

export type Applied = { action: string; path: string };

/**
 * Only repairs with one possible correct outcome. Everything a human would have
 * to choose between (which duplicate wins, whether two skills should merge) is
 * reported by `audit` and left alone, because the destructive version of a
 * wrong guess here is an unrecoverable skill.
 */
export function applyFixes(
  skills: Skill[],
  findings: Finding[],
  opts: { dryRun: boolean },
): Applied[] {
  const applied: Applied[] = [];
  const byPath = new Map(skills.map((s) => [s.realPath, s]));

  for (const finding of findings) {
    if (!finding.fixable) continue;

    if (finding.code === "dangling-symlink") {
      for (const path of finding.paths) {
        applied.push({ action: "remove dangling symlink", path });
        if (!opts.dryRun) unlinkSync(path);
      }
      continue;
    }

    if (finding.code === "frontmatter-lenient-yaml") {
      for (const path of finding.paths) {
        applied.push({ action: "quote frontmatter values so strict YAML accepts them", path });
        if (!opts.dryRun) writeFileSync(path, quoteFrontmatter(readFileSync(path, "utf8")));
      }
      continue;
    }

    if (finding.code === "name-dir-mismatch") {
      for (const path of finding.paths) {
        const skill = byPath.get(path);
        if (!skill) continue;
        const dirName = basename(skill.dir);
        applied.push({ action: `set name to \`${dirName}\``, path });
        if (!opts.dryRun) writeFileSync(path, renameField(readFileSync(path, "utf8"), dirName));
      }
    }
  }

  return applied;
}

/**
 * Rewrites the `name` line in place rather than re-serialising the YAML, so
 * comments, key order and quoting style in the rest of the frontmatter survive
 * a fix that is only about one value.
 */
export function renameField(text: string, name: string): string {
  return text.replace(/^(---\r?\n[\s\S]*?)^name:.*$/m, `$1name: ${name}`);
}

/**
 * Wrap any top-level scalar that strict YAML would choke on in double quotes.
 *
 * Only the offending lines are touched, and only those that are already plain
 * scalars: a value that is quoted, a block scalar (`|`, `>`), a flow collection
 * or the parent of an indented map is left exactly as it was, because quoting
 * any of those changes what the value means.
 */
export function quoteFrontmatter(text: string): string {
  const fence = /^(---\r?\n)([\s\S]*?)(\r?\n---)/;
  return text.replace(fence, (_all, open: string, raw: string, close: string) => {
    const fixed = raw.split("\n").map((line) => {
      const match = /^([A-Za-z][\w-]*:)([ \t]+)(.*)$/.exec(line);
      if (!match) return line;
      const [, key = "", gap = " ", value = ""] = match;
      const trimmed = value.trim();
      if (!trimmed) return line; // parent of a nested map, or an empty value
      if (/^["'|>[{&*!]/.test(trimmed)) return line;
      if (!/:\s/.test(trimmed) && !trimmed.includes(" #")) return line;
      return `${key}${gap}"${trimmed.replace(/(["\\])/g, "\\$1")}"`;
    });
    return `${open}${fixed.join("\n")}${close}`;
  });
}

/**
 * Move a skill that lives nowhere into a repository and link it back to where
 * it was, so it keeps working immediately while becoming reviewable.
 *
 * The link is what makes this safe to run: nothing that referenced the old
 * location breaks, and the next audit resolves the link and sees a skill that
 * now has a repo behind it.
 */
export function adopt(
  skillDir: string,
  intoRepo: string,
  opts: { dryRun: boolean },
): { from: string; to: string; link: string } {
  const from = resolve(skillDir);
  if (!existsSync(join(from, "SKILL.md"))) {
    throw new Error(`${from} has no SKILL.md, so it is not a skill directory.`);
  }
  const repo = resolve(intoRepo);
  if (!existsSync(join(repo, ".git"))) {
    throw new Error(`${repo} is not a git repository, which defeats the point of adopting.`);
  }
  if (repoOf(join(from, "SKILL.md")) !== null) {
    throw new Error(`${from} is already inside a repository.`);
  }

  const to = join(repo, ".claude", "skills", basename(from));
  if (existsSync(to)) throw new Error(`${to} already exists.`);

  if (!opts.dryRun) {
    mkdirSync(dirname(to), { recursive: true });
    renameSync(from, to);
    // Relative so the link survives the home directory moving or being mounted
    // at a different path on another machine.
    symlinkSync(relative(dirname(from), to), from, "dir");
  }
  return { from, to, link: `${from} -> ${relative(dirname(from), to)}` };
}
