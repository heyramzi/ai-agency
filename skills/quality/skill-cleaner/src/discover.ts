import { existsSync, lstatSync, readdirSync, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import type { Located, Origin } from "./types.js";

/** The one Claude Code reads. */
const CLAUDE_HOME = ".claude/skills";

/**
 * Homes belonging to other runtimes. Off by default: a skill mirrored into a
 * sibling runtime is a copy of one you already own, and counting all of them
 * turns one real problem into a dozen entries that bury it.
 */
const OTHER_RUNTIME_HOMES = [
  ".agents/skills",
  ".opencode/skills",
  ".codex/skills",
  ".gemini/skills",
];

const SKILL_HOMES = [CLAUDE_HOME, ...OTHER_RUNTIME_HOMES];

const PLUGIN_HOMES = [".claude/plugins"];

/** Never worth descending into, and `node_modules` alone can cost minutes. */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".svelte-kit", ".next"]);

/**
 * Packaged layouts nest one level (`skills/<package>/<name>/SKILL.md`) and
 * plugin caches nest three or four (`plugins/cache/<market>/<plugin>/<ver>/skills/...`).
 * Eight is slack on the deepest real layout, and it is what stops a symlink
 * that points at its own ancestor from walking forever even before the
 * realpath guard catches it.
 */
const MAX_DEPTH = 8;

/**
 * Roots to scan when the user names none: the current project and everywhere on
 * this machine a skill can be registered from. Discovery has to be exhaustive
 * by default, because the whole failure mode being hunted is a skill in a place
 * its author forgot about.
 */
export function defaultRoots(
  cwd = process.cwd(),
  home = homedir(),
  opts: { allRuntimes?: boolean } = {},
): string[] {
  const homes = opts.allRuntimes ? SKILL_HOMES : [CLAUDE_HOME];
  return [cwd, ...[...homes, ...PLUGIN_HOMES].map((rel) => join(home, rel))].filter((r) =>
    existsSync(r),
  );
}

function classify(realPath: string, home: string): Origin {
  const inHome = (rel: string) => realPath.startsWith(join(home, rel) + sep);
  if (PLUGIN_HOMES.some(inHome)) return "plugin";
  // A skill shipped inside an application bundle is vendor-managed the same way
  // an installed plugin is: its app updates it, nobody authors it here.
  if (realPath.includes(`.app${sep}Contents${sep}`)) return "plugin";
  if (SKILL_HOMES.some(inHome)) return "personal";
  return "project";
}

/**
 * Walk up looking for a `.git`. A worktree or submodule has `.git` as a file
 * rather than a directory, so existence is the test and not `isDirectory`.
 */
export function repoOf(fromPath: string): string | null {
  let dir = dirname(fromPath);
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

/**
 * Every SKILL.md under `root`, following symlinks.
 *
 * Two things make this harder than a glob. Symlinked skill trees are the normal
 * way a shared library is wired into a project, so the walk has to follow links
 * or it finds nothing at all (a `find` without `-L` reports zero skills for a
 * fully symlinked registry). And following links means a link pointing at an
 * ancestor turns the tree into a cycle, so every resolved directory is recorded
 * and never entered twice.
 */
export function walkSkills(root: string, home = homedir()): Located[] {
  const found: Located[] = [];
  const seenDirs = new Set<string>();
  const rootReal = safeReal(root);
  if (!rootReal) return found;
  // Origins compare against resolved skill paths, so the home must be resolved
  // too: on macOS `/var` is a symlink to `/private/var`, and an unresolved home
  // silently classifies everything under it as "project".
  const homeReal = safeReal(home) ?? home;

  const visit = (dir: string, depth: number, viaSymlink: boolean): void => {
    if (depth > MAX_DEPTH) return;
    const real = safeReal(dir);
    if (!real || seenDirs.has(real)) return;
    seenDirs.add(real);

    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return; // unreadable directory is not a reason to abandon the scan
    }

    // A directory holding a SKILL.md is a skill; anything under it is that
    // skill's bundled material. A nested SKILL.md (vendored source, an example)
    // is not a registration, so the walk stops here.
    const isSkill = entries.includes("SKILL.md");

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const child = join(dir, entry);
      const link = safeLstat(child);
      if (!link) continue;
      const linked = viaSymlink || link.isSymbolicLink();

      if (entry === "SKILL.md") {
        const childReal = safeReal(child);
        // A dangling link is reported by the analyzer, not swallowed here.
        if (!childReal) continue;
        found.push({
          path: child,
          realPath: childReal,
          root,
          origin: classify(childReal, homeReal),
          viaSymlink: linked,
          repo: repoOf(childReal),
        });
        continue;
      }

      if (isSkill) continue;
      const target = safeStat(child);
      if (target?.isDirectory()) visit(child, depth + 1, linked);
    }
  };

  visit(root, 0, false);
  return found;
}

/**
 * Symlinks in a skills tree are the point, not an edge case: one source
 * directory is linked into many projects. Deduping on `realPath` collapses
 * those back to the single skill they are, while keeping every path it was
 * reachable from so the report can name them.
 */
export function dedupe(located: Located[]): Map<string, Located[]> {
  const byReal = new Map<string, Located[]>();
  for (const item of located) {
    const list = byReal.get(item.realPath);
    if (list) list.push(item);
    else byReal.set(item.realPath, [item]);
  }
  return byReal;
}

/**
 * Symlinks that point at nothing, which read as a missing skill.
 *
 * Restricted to paths inside a `skills/` directory. A repository is full of
 * links for reasons that are none of this tool's business, and reporting them
 * all turns six real dead skills into nineteen lines of noise.
 */
export function danglingLinks(root: string): string[] {
  const broken: string[] = [];
  const seen = new Set<string>();

  const visit = (dir: string, depth: number): void => {
    if (depth > MAX_DEPTH || seen.has(dir)) return;
    seen.add(dir);
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const child = join(dir, entry);
      const link = safeLstat(child);
      if (!link) continue;
      if (link.isSymbolicLink() && !existsSync(child)) {
        if (insideSkillsDir(child)) broken.push(child);
        continue;
      }
      if (safeStat(child)?.isDirectory()) visit(child, depth + 1);
    }
  };

  visit(resolve(root), 0);
  return broken;
}

export const insideSkillsDir = (path: string): boolean =>
  dirname(path).split(sep).includes("skills");

function safeReal(p: string): string | null {
  try {
    return realpathSync(p);
  } catch {
    return null;
  }
}

function safeStat(p: string) {
  try {
    return statSync(p); // follows links on purpose
  } catch {
    return null;
  }
}

function safeLstat(p: string) {
  try {
    return lstatSync(p);
  } catch {
    return null;
  }
}
