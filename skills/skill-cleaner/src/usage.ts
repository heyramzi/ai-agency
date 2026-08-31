import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { str } from "./parse.js";
import type { Finding, Skill } from "./types.js";

/**
 * The invocation ledger, one JSON line per skill or subagent run. A registry
 * cannot tell a dead skill from a rarely-needed one by reading files, because
 * nothing in a SKILL.md records that it ran; the ledger is the only evidence,
 * and this is where it is read.
 *
 * Home: derived from the session transcripts by a sync script outside this
 * repo, rather than by a PostToolUse hook: a hook that stops firing is
 * indistinguishable from a skill nobody ran, and the one that used to write
 * this caught 1 run in 1,532 before it was removed on 26 Aug 2026.
 */
export const DEFAULT_LEDGER = join(homedir(), ".claude", "skill-usage.jsonl");

/**
 * Below this the ledger is too young to accuse anything of being unused: a
 * two-week-old ledger would report every seasonal skill as dead. Reported once
 * as a note instead, so the reader learns why there is no verdict yet.
 */
const MIN_LEDGER_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export type Ledger = {
  path: string;
  /** Skill name -> the last run recorded for it, as an ISO string. */
  lastUse: Map<string, string>;
  /** Oldest entry, ISO. Null when the ledger holds nothing readable. */
  since: string | null;
  /** Whole days the ledger covers, floor. */
  days: number;
};

type Entry = { at?: unknown; kind?: unknown; name?: unknown };

export function readLedger(path: string = DEFAULT_LEDGER, now = Date.now()): Ledger | null {
  if (!existsSync(path)) return null;

  const lastUse = new Map<string, string>();
  let since: string | null = null;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let entry: Entry;
    try {
      entry = JSON.parse(line) as Entry;
    } catch {
      continue;
    }
    const at = typeof entry.at === "string" ? entry.at : null;
    const name = typeof entry.name === "string" ? entry.name : null;
    if (!at || !name || Number.isNaN(Date.parse(at))) continue;
    if (!since || at < since) since = at;
    // Agents are recorded in the same ledger. They are named the same way a
    // skill is, so they are kept: a name that ran, ran.
    if (entry.kind !== "skill" && entry.kind !== "agent") continue;
    const seen = lastUse.get(name);
    if (!seen || at > seen) lastUse.set(name, at);
  }

  const days = since ? Math.floor((now - Date.parse(since)) / DAY_MS) : 0;
  return { path, lastUse, since, days };
}

/**
 * One `never-used` warning per skill the ledger has never seen run. Plugin
 * skills are left out for the same reason `scan` leaves their authoring out:
 * deleting a vendor's skill is not the reader's call.
 */
export function unusedFindings(skills: Skill[], ledger: Ledger | null): Finding[] {
  if (!ledger) return [];
  if (ledger.days < MIN_LEDGER_DAYS) {
    return [
      {
        code: "usage-ledger-young",
        severity: "warn",
        message:
          `The invocation ledger covers ${ledger.days} day(s), under the ${MIN_LEDGER_DAYS} ` +
          "needed before silence means unused. No skill is reported as unused yet.",
        paths: [ledger.path],
      },
    ];
  }

  const findings: Finding[] = [];
  for (const skill of skills) {
    if (skill.origin === "plugin") continue;
    // The reference that reaches the runtime is the DIRECTORY name; the
    // frontmatter `name` is only a display label and the two are allowed to
    // differ. Both are accepted, so a mismatch cannot fake a dead skill.
    const dir = basename(skill.dir);
    const declared = str(skill.frontmatter.name);
    if (ledger.lastUse.has(dir)) continue;
    if (declared && ledger.lastUse.has(declared)) continue;
    findings.push({
      code: "never-used",
      severity: "warn",
      message: `Never invoked in the ${ledger.days} days the ledger covers. Delete it, or fix the description that fails to trigger it.`,
      paths: [skill.realPath],
    });
  }
  return findings;
}
