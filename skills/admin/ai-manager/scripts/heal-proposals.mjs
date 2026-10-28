#!/usr/bin/env node
// The heal backstop's queue: every session's unsettled lessons, written by hooks/extensions/heal-end.mjs.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { unsettled } from "#ai-doc/hooks/extensions/heal-end.mjs";
import { HEAL_DIR } from "#ai-doc/hooks/extensions/heal-stop.mjs";

// =========================
// CONSTANTS
// =========================
const PROPOSALS_DIR = join(HEAL_DIR, "proposals");
const CLOSED = ["healed", "dismissed"];

const USAGE = `heal-proposals.mjs: drain ~/.claude/heal/proposals

  heal-proposals.mjs pending [--json]               Rescan each pending proposal, close the empty ones, list the rest
  heal-proposals.mjs close <file> healed|dismissed <why>   Close one after settling it`;

// =========================
// FUNCTIONS
// =========================
const field = (text, key) => new RegExp(`^${key}: (.+)$`, "m").exec(text)?.[1]?.trim() ?? null;
const transcriptOf = (text) => /^## Transcript\n\n(.+)$/m.exec(text)?.[1]?.trim() ?? null;

function close(file, status, why, now = new Date()) {
  const text = readFileSync(file, "utf8");
  const date = now.toLocaleDateString("en-CA");
  writeFileSync(
    file,
    `${text.replace(/^status: pending$/m, `status: ${status}`).trimEnd()}\n\n## Closed\n\n${date}, ${status}: ${why}\n`,
  );
}

/** Every pending proposal, rescanned with today's scanner, so a filter fixed since then drops its noise. */
export function pending({ dir = PROPOSALS_DIR, now = new Date() } = {}) {
  if (!existsSync(dir)) return [];
  const open = [];
  for (const name of readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()) {
    const file = join(dir, name);
    const text = readFileSync(file, "utf8");
    if (field(text, "status") !== "pending") continue;
    const transcript = transcriptOf(text);
    // A transcript Claude Code has since deleted can't be rescanned; the proposal stands as written.
    const signals = transcript && existsSync(transcript) ? unsettled(transcript) : null;
    if (signals?.length === 0) {
      close(file, "dismissed", "the current scanner finds nothing unsettled in this session", now);
      continue;
    }
    open.push({ file, session: field(text, "session"), transcript, signals });
  }
  return open;
}

function main(argv) {
  const [command, ...rest] = argv;
  if (command === "pending") {
    const open = pending();
    if (rest.includes("--json")) {
      process.stdout.write(`${JSON.stringify(open, null, 2)}\n`);
      return 0;
    }
    process.stdout.write(`${open.length} pending heal proposal${open.length === 1 ? "" : "s"}\n`);
    for (const p of open) {
      process.stdout.write(`\n${p.file}\n`);
      if (!p.signals) {
        process.stdout.write("  transcript gone, read the signals in the file\n");
        continue;
      }
      for (const s of p.signals)
        process.stdout.write(`  [${s.id}] ${s.kind} (${s.scope ?? "no scope"}): ${s.quote}\n`);
    }
    if (open.length)
      process.stdout.write(
        "\nSettle each down the ladder, then `close <file> healed|dismissed <why>`.\n",
      );
    return 0;
  }
  if (command === "close") {
    const [file, status, ...why] = rest;
    if (!file || !CLOSED.includes(status) || why.length === 0 || !existsSync(file)) {
      process.stderr.write(`${USAGE}\n`);
      return 2;
    }
    close(file, status, why.join(" "));
    process.stdout.write(`${status}: ${file}\n`);
    return 0;
  }
  process.stdout.write(`${USAGE}\n`);
  return command ? 2 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}
