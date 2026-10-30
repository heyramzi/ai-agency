#!/usr/bin/env node
// Routing eval: runs each prompt in evals/routing.json through `claude -p` in a scratch consumer
// repo and grades the first Skill or Agent call it makes.

import { spawn } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, join } from "node:path";

// =========================
// CONSTANTS
// =========================
const VIBE_KIT = process.env.VIBE_KIT_ROOT ?? join(homedir(), "Studio/vibe-kit");
const EVALS = join(VIBE_KIT, "ai-doc/skills/admin/kit/ai-manager/evals");
const SKILLS_SRC = join(VIBE_KIT, "ai-doc/skills");
const AGENTS_SRC = join(VIBE_KIT, ".claude/agents");
const AGENTS_CORE = join(VIBE_KIT, "ai-doc/references/agents-core.md");
const CASES = join(EVALS, "routing.json");
const RESULTS = join(EVALS, "routing-results.json");
const CLAUDE_BIN = process.env.CLAUDE_BIN ?? join(homedir(), ".local/bin/claude");
const TIMEOUT_MS = 240_000;
// Readable code, or a code-shaped prompt searches an empty repo and asks for context instead of routing.
const CODE_DIR = join(homedir(), "Studio");

// No Bash or writes: a prompt like "clean up the CRM" must not touch anything real.
const DISALLOWED = ["Bash", "Write", "Edit", "NotebookEdit", "WebFetch", "WebSearch"];

const USAGE = `routing-eval.mjs: which skill or agent each prompt in evals/routing.json reaches

  routing-eval.mjs [--model sonnet] [--max-turns 6] [--runs 1] [--jobs 4] [--case <substring>] [--no-write]

Writes evals/routing-results.json unless --no-write or --case is given.`;

// =========================
// FUNCTIONS
// =========================
function parseArgs(argv) {
  const opts = { model: "sonnet", maxTurns: 6, runs: 1, jobs: 4, filter: null, write: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--model") opts.model = argv[++i];
    else if (arg === "--max-turns") opts.maxTurns = Number(argv[++i]);
    else if (arg === "--runs") opts.runs = Number(argv[++i]);
    else if (arg === "--jobs") opts.jobs = Number(argv[++i]);
    else if (arg === "--case") opts.filter = argv[++i];
    else if (arg === "--no-write") opts.write = false;
    else if (arg === "-h" || arg === "--help") {
      console.log(USAGE);
      process.exit(0);
    } else throw new Error(`unknown argument ${arg}\n\n${USAGE}`);
  }
  return opts;
}

function skillDirs(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (existsSync(join(path, "SKILL.md"))) out.push(path);
    else skillDirs(path, out);
  }
  return out;
}

function agentFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) agentFiles(path, out);
    else if (entry.name.endsWith(".md")) out.push(path);
  }
  return out;
}

/** Agent name to the skills its `skills:` line preloads: routing there loads the expected skill too. */
function agentPreloads() {
  const preloads = {};
  for (const file of agentFiles(AGENTS_SRC)) {
    const text = readFileSync(file, "utf8");
    const name = /^name:\s*(.+)$/m.exec(text)?.[1]?.trim();
    const skills = /^skills:\s*\[(.*)\]$/m.exec(text)?.[1] ?? "";
    if (name)
      preloads[name] = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  }
  return preloads;
}

/** A consumer repo that subscribes to every skill: the whole shelf competes for each prompt. */
function buildScratch() {
  const root = mkdtempSync(join(tmpdir(), "routing-eval-"));
  const skills = join(root, ".claude/skills");
  mkdirSync(skills, { recursive: true });
  for (const dir of skillDirs(SKILLS_SRC)) symlinkSync(dir, join(skills, basename(dir)));
  symlinkSync(AGENTS_SRC, join(root, ".claude/agents"));
  copyFileSync(AGENTS_CORE, join(root, "CLAUDE.md"));
  return root;
}

const routeOf = (block) => {
  if (block.name === "Skill") return `skill:${String(block.input?.skill ?? "").replace(/^\//, "")}`;
  if (block.name === "Agent" || block.name === "Task")
    return `agent:${block.input?.subagent_type ?? "general-purpose"}`;
  return null;
};

/** One `claude -p` run, killed as soon as the first Skill or Agent call shows up in the stream. */
function runOnce(query, cwd, { model, maxTurns }) {
  return new Promise((resolve) => {
    const args = [
      "-p",
      query,
      "--output-format",
      "stream-json",
      "--verbose",
      "--max-turns",
      String(maxTurns),
      "--model",
      model,
      "--add-dir",
      CODE_DIR,
      "--setting-sources",
      "project",
      "--strict-mcp-config",
      "--no-session-persistence",
      "--disallowedTools",
      ...DISALLOWED,
    ];
    const child = spawn(CLAUDE_BIN, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const seen = { route: null, firstTool: null };
    let buffer = "";
    const finish = () => {
      clearTimeout(timer);
      child.kill("SIGTERM");
      resolve(seen);
    };
    const timer = setTimeout(() => {
      seen.firstTool ??= "timeout";
      finish();
    }, TIMEOUT_MS);
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        if (event.type !== "assistant") continue;
        for (const block of event.message?.content ?? []) {
          if (block.type !== "tool_use") continue;
          seen.firstTool ??= block.name;
          seen.route = routeOf(block);
          if (seen.route) return finish();
        }
      }
    });
    child.on("close", finish);
  });
}

function grade(testCase, route, preloads) {
  if (testCase.not) return !testCase.not.includes(route);
  if (route === testCase.expect) return true;
  const [kind, name] = testCase.expect.split(":");
  const agent = route?.startsWith("agent:") ? route.slice(6) : null;
  return kind === "skill" && Boolean(agent && preloads[agent]?.includes(name));
}

async function pool(items, size, work) {
  const results = Array.from({ length: items.length });
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cases = JSON.parse(readFileSync(CASES, "utf8")).filter(
    (c) => !opts.filter || c.query.includes(opts.filter),
  );
  const preloads = agentPreloads();
  const scratch = buildScratch();
  const jobs = cases.flatMap((testCase) => Array.from({ length: opts.runs }, () => testCase));
  try {
    const runs = await pool(jobs, opts.jobs, async (testCase) => {
      const seen = await runOnce(testCase.query, scratch, opts);
      const pass = grade(testCase, seen.route, preloads);
      console.log(
        `${pass ? "PASS" : "MISS"}  ${testCase.cluster.padEnd(10)} ${(seen.route ?? `none (${seen.firstTool ?? "no tool"})`).padEnd(32)} ${testCase.query}`,
      );
      return { ...testCase, got: seen.route, firstTool: seen.firstTool, pass };
    });
    const clusters = {};
    for (const run of runs) {
      const tally = (clusters[run.cluster] ??= { pass: 0, total: 0 });
      tally.total++;
      if (run.pass) tally.pass++;
    }
    const passed = runs.filter((r) => r.pass).length;
    console.log(`\n${passed}/${runs.length} passed`);
    for (const [name, t] of Object.entries(clusters))
      console.log(`  ${name.padEnd(10)} ${t.pass}/${t.total}`);
    if (opts.write && !opts.filter) {
      const report = {
        date: new Date().toISOString(),
        model: opts.model,
        maxTurns: opts.maxTurns,
        runsPerCase: opts.runs,
        passed,
        total: runs.length,
        clusters,
        runs,
      };
      writeFileSync(RESULTS, `${JSON.stringify(report, null, 2)}\n`);
      console.log(`\nwrote ${RESULTS}`);
    }
    process.exitCode = passed === runs.length ? 0 : 1;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

await main();
