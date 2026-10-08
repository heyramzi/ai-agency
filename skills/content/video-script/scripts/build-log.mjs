#!/usr/bin/env node
// What got built across ~/Studio in the last N days, clustered by repo and scope and ranked, as raw material for content.
// usage: node build-log.mjs [--days 7] [--json] [--root ~/Studio]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const days = Number(opt("--days", 7));
const root = opt("--root", path.join(os.homedir(), "Studio"));
const asJson = args.includes("--json");

// Projection syncs, releases and gallery refreshes say nothing a viewer would watch.
const NOISE =
  /^(?:chore\((?:main|skills|slides|release|deps)\)|chore: release|docs\(agents\)|Merge |Revert )|\bproject(?:s|ed)? (?:the )?\S+ skills?\b|gallery (?:synced|picks up)/i;
const WEIGHT = { feat: 3, fix: 2, refactor: 2, perf: 2, test: 1, docs: 1, chore: 0.25 };

const repos = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, ".git")))
  .map((d) => d.name);

const clusters = new Map();
for (const repo of repos) {
  let out = "";
  try {
    out = execFileSync(
      "git",
      [
        "-C",
        path.join(root, repo),
        "log",
        `--since=${days}.days.ago`,
        "--no-merges",
        "--date=short",
        "--format=%h%x1f%ad%x1f%s%x1f%b%x1e",
      ],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
  } catch {
    continue;
  }
  for (const rec of out.split("\x1e")) {
    const [hash, date, subject, body = ""] = rec.trim().split("\x1f");
    if (!hash || !subject || NOISE.test(subject)) continue;
    const m = subject.match(/^(\w+)(?:\(([^)]+)\))?!?:\s*(.*)$/);
    const type = m?.[1] ?? "other";
    const scope = m?.[2] ?? "-";
    const why = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^Co-Authored-By/i.test(l))
      .slice(0, 2)
      .join(" ");
    const key = `${repo} · ${scope}`;
    const c = clusters.get(key) ?? { repo, scope, score: 0, commits: [] };
    // A commit that says why is a story; one that does not is volume.
    c.score += why ? (WEIGHT[type] ?? 1) : 0.25;
    c.commits.push({ hash, date, type, subject: m?.[3] ?? subject, why });
    clusters.set(key, c);
  }
}

const ranked = [...clusters.values()].toSorted((a, b) => b.score - a.score);
if (asJson) {
  console.log(JSON.stringify({ days, root, clusters: ranked }, null, 2));
} else {
  console.log(
    `# Build log, last ${days} days, ${ranked.length} clusters across ${repos.length} repos\n`,
  );
  for (const c of ranked) {
    console.log(`## ${c.repo} · ${c.scope}  (score ${c.score}, ${c.commits.length} commits)`);
    const told = [...c.commits].toSorted(
      (a, b) => (b.why ? (WEIGHT[b.type] ?? 1) : 0) - (a.why ? (WEIGHT[a.type] ?? 1) : 0),
    );
    for (const k of told.slice(0, 6)) {
      console.log(
        `- ${k.date} ${k.hash} ${k.type}: ${k.subject}${k.why ? `\n  ${k.why.slice(0, 220)}` : ""}`,
      );
    }
    if (c.commits.length > 6) console.log(`- … ${c.commits.length - 6} more`);
    console.log("");
  }
}
