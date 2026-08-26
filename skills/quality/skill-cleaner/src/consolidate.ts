import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { repoOf } from "./discover.js";
import { str } from "./parse.js";
import type { Finding, Skill } from "./types.js";

/**
 * The half of a cleanup that changes what the registry contains, rather than
 * what it says. `fix` repairs a file; this removes one.
 *
 * Every action here is destructive and none of it is guessed at safely, so the
 * whole command refuses to run against a dirty git tree. That single guard is
 * what makes an automatic merge defensible: the recovery for a bad one is
 * `git checkout .`, and it is always available.
 */
export type Action =
  | { kind: "link"; name: string; winner: string; loser: string }
  | { kind: "merge"; name: string; winner: string; loser: string; sections: string[] }
  | { kind: "repoint"; name: string; path: string; from: string; to: string };

export type Plan = {
  actions: Action[];
  /** Why a finding was left alone, so the report never silently drops one. */
  skipped: { reason: string; paths: string[] }[];
};

export type Consolidated = { action: string; path: string };

/**
 * Which copy survives. Deterministic on purpose: a rule the reader can predict
 * beats a heuristic that is right more often, because the whole command is
 * destructive and a surprising winner is the expensive outcome.
 *
 * Ordered by how much the location says about whether the file is maintained.
 * A skill in a repository is reviewed; one in a plugin directory is a vendored
 * copy that the next install overwrites.
 */
const ORIGIN_RANK = { project: 0, personal: 1, plugin: 2 } as const;

export function pickWinner(group: Skill[]): { winner: Skill; losers: Skill[] } {
  const ranked = [...group].sort((a, b) => {
    // In a repo beats not in a repo: everything else is a preference, this is
    // the difference between reviewable and unreviewable.
    const repo = Number(a.repo === null) - Number(b.repo === null);
    if (repo !== 0) return repo;
    const origin = ORIGIN_RANK[a.origin] - ORIGIN_RANK[b.origin];
    if (origin !== 0) return origin;
    // The longer body is the one that kept being edited. Only reached when both
    // sides are equally reviewable, so it decides between real candidates.
    if (a.bodyLines !== b.bodyLines) return b.bodyLines - a.bodyLines;
    return a.realPath.localeCompare(b.realPath);
  });
  const [winner, ...losers] = ranked;
  if (!winner) throw new Error("pickWinner needs at least one skill.");
  return { winner, losers };
}

/** `## ` headings, which is the granularity a merge can move without reading prose. */
export function sections(body: string): { heading: string; text: string }[] {
  const out: { heading: string; text: string }[] = [];
  const lines = body.split("\n");
  let current: { heading: string; text: string } | null = null;
  let fenced = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) fenced = !fenced;
    // A `## ` inside a fence is sample markdown, not a section of this document.
    if (!fenced && /^##\s+/.test(line)) {
      if (current) out.push(current);
      current = { heading: line.replace(/^##\s+/, "").trim(), text: line };
      continue;
    }
    if (current) current.text += `\n${line}`;
  }
  if (current) out.push(current);
  return out;
}

/**
 * Build the plan without touching anything.
 *
 * A skill consumed by one action is not offered to the next: once `a` has been
 * merged into `b`, an overlap finding pairing `a` with `c` is stale, and acting
 * on it would move a directory that no longer exists.
 */
export function planConsolidation(skills: Skill[], findings: Finding[]): Plan {
  const byPath = new Map(skills.map((s) => [s.realPath, s]));
  const consumed = new Set<string>();
  const actions: Action[] = [];
  const skipped: Plan["skipped"] = [];

  const resolve = (paths: string[]) =>
    paths.map((p) => byPath.get(p)).filter((s): s is Skill => s !== undefined);

  // Identical copies first. They are the only case with no content decision at
  // all, so resolving them shrinks what the harder passes have to consider.
  for (const finding of findings.filter((f) => f.code === "duplicate-copy")) {
    const group = resolve(finding.paths).filter((s) => !consumed.has(s.realPath));
    if (group.length < 2) continue;
    const { winner, losers } = pickWinner(group);
    for (const loser of losers) {
      consumed.add(loser.realPath);
      actions.push({
        kind: "link",
        name: str(winner.frontmatter.name) ?? "unnamed",
        winner: winner.dir,
        loser: loser.dir,
      });
    }
  }

  for (const finding of findings.filter(
    (f) => f.code === "duplicate-name" || f.code === "overlap",
  )) {
    const group = resolve(finding.paths).filter((s) => !consumed.has(s.realPath));
    if (group.length < 2) {
      skipped.push({
        reason: "already consolidated by an earlier action in this plan",
        paths: finding.paths,
      });
      continue;
    }
    const outside = group.filter((s) => s.repo === null);
    if (outside.length > 0) {
      // Nothing outside a repo can be recovered after this command, so it is
      // never a candidate. `adopt` puts it under git first.
      skipped.push({
        reason: "a side of this pair lives outside any repository, so a merge could not be undone. Run `adopt` first",
        paths: outside.map((s) => s.realPath),
      });
      continue;
    }
    const { winner, losers } = pickWinner(group);
    const winnerHeadings = new Set(sections(winner.body).map((s) => s.heading.toLowerCase()));
    for (const loser of losers) {
      consumed.add(loser.realPath);
      const unique = sections(loser.body)
        .filter((s) => !winnerHeadings.has(s.heading.toLowerCase()))
        .map((s) => s.heading);
      actions.push({
        kind: "merge",
        name: str(loser.frontmatter.name) ?? "unnamed",
        winner: winner.realPath,
        loser: loser.realPath,
        sections: unique,
      });
    }
  }

  // Repointing comes last because it needs the final survivor set: a body that
  // routes to a name being merged away has to name the winner instead, or the
  // next audit reports it as an unknown-skill-reference.
  const renamed = new Map<string, string>();
  for (const action of actions) {
    if (action.kind !== "merge") continue;
    const loser = byPath.get(action.loser);
    const winner = byPath.get(action.winner);
    const from = str(loser?.frontmatter.name);
    const to = str(winner?.frontmatter.name);
    if (from && to && from !== to) renamed.set(from, to);
  }
  for (const skill of skills) {
    if (consumed.has(skill.realPath)) continue;
    for (const [from, to] of renamed) {
      if (!routes(skill.body, from)) continue;
      actions.push({
        kind: "repoint",
        name: str(skill.frontmatter.name) ?? "unnamed",
        path: skill.realPath,
        from,
        to,
      });
    }
  }

  return { actions, skipped };
}

/** The two shapes `analyze` counts as routing, kept in sync with it deliberately. */
function routes(body: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\`${escaped}\`\\s+skill\\b|\\bskills?\\s+\`${escaped}\``).test(body);
}

/**
 * Every repository the plan touches must be clean, or the plan does not run.
 *
 * Checked across all of them rather than per action, because a merge that
 * half-applies leaves a registry in a state neither the old nor the new audit
 * describes, and the point of the guard is that recovery is one command.
 */
export function dirtyRepos(plan: Plan, skills: Skill[]): string[] {
  const byPath = new Map(skills.map((s) => [s.realPath, s]));
  const repos = new Set<string>();
  for (const action of plan.actions) {
    const paths =
      action.kind === "repoint"
        ? [action.path]
        : [action.winner, action.loser];
    for (const path of paths) {
      const repo = byPath.get(path)?.repo ?? repoOf(path);
      if (repo) repos.add(repo);
    }
  }
  return [...repos].filter((repo) => {
    try {
      const out = execFileSync("git", ["-C", repo, "status", "--porcelain"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return out.trim() !== "";
    } catch {
      return true; // no git, or git refused: treat as unsafe rather than assume clean
    }
  });
}

export function applyConsolidation(
  plan: Plan,
  opts: { dryRun: boolean },
): Consolidated[] {
  const done: Consolidated[] = [];

  for (const action of plan.actions) {
    if (action.kind === "link") {
      done.push({
        action: `replace identical copy of \`${action.name}\` with a link to ${action.winner}`,
        path: action.loser,
      });
      if (!opts.dryRun) {
        rmSync(action.loser, { recursive: true, force: true });
        symlinkSync(relative(dirname(action.loser), action.winner), action.loser, "dir");
      }
      continue;
    }

    if (action.kind === "merge") {
      const detail =
        action.sections.length > 0
          ? `carrying ${action.sections.length} section${action.sections.length === 1 ? "" : "s"} across`
          : "with nothing unique to carry across";
      done.push({ action: `merge \`${action.name}\` into ${action.winner}, ${detail}`, path: action.loser });
      if (!opts.dryRun) {
        writeFileSync(action.winner, mergeBodies(action));
        rmSync(dirname(action.loser), { recursive: true, force: true });
      }
      continue;
    }

    done.push({
      action: `repoint routing from \`${action.from}\` to \`${action.to}\``,
      path: action.path,
    });
    if (!opts.dryRun) {
      writeFileSync(action.path, repoint(readFileSync(action.path, "utf8"), action.from, action.to));
    }
  }

  return done;
}

/**
 * Append the loser's unique sections under a heading that says where they came
 * from, rather than interleaving them into the winner's prose.
 *
 * Interleaving is what a human does afterwards. A tool that attempts it
 * produces a document that reads as though nobody wrote it, and the marker is
 * what tells the next reader which half still needs editing.
 */
export function mergeBodies(action: Extract<Action, { kind: "merge" }>): string {
  const winner = readFileSync(action.winner, "utf8");
  if (action.sections.length === 0) return winner;
  const loser = readFileSync(action.loser, "utf8");
  const carried = sections(loser)
    .filter((s) => action.sections.includes(s.heading))
    .map((s) => s.text.replace(/\s*$/, ""))
    .join("\n\n");
  return `${winner.replace(/\s*$/, "")}\n\n<!-- merged from \`${action.name}\`. Fold these into the sections above and delete this marker. -->\n\n${carried}\n`;
}

/** Rewrite only the two routing shapes, so a name used as ordinary prose survives. */
export function repoint(text: string, from: string, to: string): string {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(new RegExp(`\`${escaped}\`(\\s+skill\\b)`, "g"), `\`${to}\`$1`)
    .replace(new RegExp(`(\\bskills?\\s+)\`${escaped}\``, "g"), `$1\`${to}\``);
}
