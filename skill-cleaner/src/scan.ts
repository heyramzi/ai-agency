import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { analyze } from "./analyze.js";
import { danglingLinks, dedupe, defaultRoots, walkSkills } from "./discover.js";
import { parseSkill } from "./parse.js";
import { isMarketplaceClone, keepNewestPluginVersions } from "./plugins.js";
import { checkSkill } from "./rules.js";
import type { Report, Skill } from "./types.js";

export function scan(
  roots: string[] = [],
  opts: { home?: string; allRuntimes?: boolean } = {},
): Report {
  const home = opts.home ?? homedir();
  const targets = (
    roots.length > 0
      ? roots.map((r) => resolve(r))
      : defaultRoots(process.cwd(), home, { allRuntimes: opts.allRuntimes })
  ).filter((r) => existsSync(r));

  const located = keepNewestPluginVersions(
    targets.flatMap((root) => walkSkills(root, home)).filter((item) => !isMarketplaceClone(item.realPath)),
  );
  const skills: Skill[] = [];
  const findings = [];

  for (const [realPath, group] of dedupe(located)) {
    const first = group[0];
    if (!first) continue;
    // Prefer the reachable path with a repo behind it, so a skill linked from a
    // home directory into a checkout is attributed to the checkout.
    const primary = group.find((item) => item.repo !== null) ?? first;
    try {
      const skill = parseSkill({ ...primary, realPath });
      skills.push(skill);
      findings.push(...checkSkill(skill));
    } catch (error) {
      findings.push({
        code: "unreadable",
        severity: "error" as const,
        message: `Could not be read: ${error instanceof Error ? error.message : String(error)}`,
        paths: [realPath],
      });
    }
  }

  findings.push(...analyze(skills, targets.flatMap((root) => danglingLinks(root))));

  return { scanned: targets, skills, findings };
}
