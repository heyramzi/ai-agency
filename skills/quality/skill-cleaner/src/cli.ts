#!/usr/bin/env node
import { parseArgs } from "node:util";
import { applyConsolidation, dirtyRepos, planConsolidation } from "./consolidate.js";
import { adopt, applyFixes } from "./fix.js";
import { render } from "./report.js";
import { scan } from "./scan.js";
import { DEFAULT_LEDGER } from "./usage.js";

const USAGE = `skill-cleaner - audit, consolidate and clean up Agent Skills

  skill-cleaner audit [roots...]        Report everything wrong across every registry
  skill-cleaner fix [roots...]          Apply only the repairs with one correct outcome
  skill-cleaner consolidate [roots...]  Merge duplicates and overlaps, one survivor each
  skill-cleaner adopt <dir> --into <repo>   Move a homeless skill into a repo, link it back

Options
  --json          Machine-readable output
  --quiet         Errors only, no warnings
  --apply         For \`fix\` and \`consolidate\`: write the changes (default is a dry run)
  --into <repo>   For \`adopt\`: the repository to move the skill into
  --all-runtimes  Also scan ~/.agents, ~/.codex, ~/.opencode and ~/.gemini
  --usage <path>  Invocation ledger to read (default ~/.claude/skill-usage.jsonl)
  --no-usage      Do not report unused skills, even with a ledger present
  --plain         No colour (also honours NO_COLOR)

With no roots, scans the current project, ~/.claude/skills and installed
plugins. Exits 1 when errors remain.

\`consolidate\` deletes skills. It refuses to run against a dirty git tree, so
\`git diff\` is always the review and \`git checkout .\` is always the undo.`;

const CONFIG = {
  allowPositionals: true,
  options: {
    json: { type: "boolean", default: false },
    quiet: { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
    into: { type: "string" },
    "all-runtimes": { type: "boolean", default: false },
    usage: { type: "string" },
    "no-usage": { type: "boolean", default: false },
    plain: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
} as const;

function main(argv: string[]): number {
  let parsed: ReturnType<typeof parseArgs<typeof CONFIG>>;
  try {
    parsed = parseArgs({ ...CONFIG, args: argv });
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n\n${USAGE}\n`);
    return 2;
  }
  const { values, positionals } = parsed;

  const [command = "audit", ...rest] = positionals;
  if (values.help || command === "help") {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }

  const color = !values.plain && process.stdout.isTTY === true && !process.env.NO_COLOR;

  if (command === "adopt") {
    const [dir] = rest;
    if (!dir || !values.into) {
      process.stderr.write("adopt needs a skill directory and --into <repo>\n");
      return 2;
    }
    try {
      const moved = adopt(dir, values.into, { dryRun: !values.apply });
      const prefix = values.apply ? "adopted" : "would adopt";
      process.stdout.write(`${prefix}: ${moved.from}\n  -> ${moved.to}\n  link ${moved.link}\n`);
      if (!values.apply) process.stdout.write("\nRe-run with --apply to move it.\n");
      return 0;
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      return 2;
    }
  }

  if (command !== "audit" && command !== "fix" && command !== "consolidate") {
    process.stderr.write(`unknown command \`${command}\`\n\n${USAGE}\n`);
    return 2;
  }

  const report = scan(rest, {
    allRuntimes: values["all-runtimes"],
    usage: values["no-usage"] ? undefined : (values.usage ?? DEFAULT_LEDGER),
  });
  const visible = values.quiet
    ? report.findings.filter((f) => f.severity === "error")
    : report.findings;

  if (command === "consolidate") {
    const plan = planConsolidation(report.skills, report.findings);

    if (plan.actions.length === 0) {
      if (values.json) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
      else process.stdout.write("Nothing to consolidate. No duplicates, no overlaps.\n");
      return 0;
    }

    // Checked before the dry run prints, not only before the write, so the
    // reader learns the plan cannot be applied at the same time as they learn
    // what it would do.
    const dirty = values.apply ? dirtyRepos(plan, report.skills) : [];
    if (dirty.length > 0) {
      process.stderr.write(
        `Refusing to consolidate: uncommitted changes in\n${dirty.map((r) => `  ${r}`).join("\n")}\n\n` +
          "This command deletes skills. A clean tree is what makes `git checkout .` an undo.\n",
      );
      return 2;
    }

    const done = applyConsolidation(plan, { dryRun: !values.apply });
    if (values.json) {
      process.stdout.write(
        `${JSON.stringify({ applied: done, skipped: plan.skipped, dryRun: !values.apply }, null, 2)}\n`,
      );
      return 0;
    }
    const prefix = values.apply ? "" : "would ";
    for (const item of done) process.stdout.write(`${prefix}${item.action}\n  ${item.path}\n`);
    for (const skip of plan.skipped) {
      process.stdout.write(`skipped: ${skip.reason}\n${skip.paths.map((p) => `  ${p}`).join("\n")}\n`);
    }
    if (values.apply) {
      process.stdout.write("\nReview with `git diff`, then fold each merge marker into the prose above it.\n");
    } else {
      process.stdout.write("\nRe-run with --apply to write these. Requires a clean git tree.\n");
    }
    return 0;
  }

  if (command === "fix") {
    const applied = applyFixes(report.skills, report.findings, { dryRun: !values.apply });
    if (values.json) {
      process.stdout.write(`${JSON.stringify({ applied, dryRun: !values.apply }, null, 2)}\n`);
    } else if (applied.length === 0) {
      process.stdout.write("Nothing mechanically fixable.\n");
    } else {
      const prefix = values.apply ? "fixed" : "would fix";
      for (const item of applied) process.stdout.write(`${prefix}: ${item.action} — ${item.path}\n`);
      if (!values.apply) process.stdout.write("\nRe-run with --apply to write these.\n");
    }
    return 0;
  }

  if (values.json) {
    process.stdout.write(
      `${JSON.stringify({ scanned: report.scanned, count: report.skills.length, findings: visible }, null, 2)}\n`,
    );
  } else {
    process.stdout.write(
      `${render({ ...report, findings: visible }, { color, cwd: process.cwd() })}\n`,
    );
  }

  return visible.some((f) => f.severity === "error") ? 1 : 0;
}

process.exitCode = main(process.argv.slice(2));
