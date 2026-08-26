import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { join } from "node:path";
import { readLedger, unusedFindings } from "../src/usage.js";
import { scan } from "../src/scan.js";
import { type Fixture, fixture } from "./fixture.js";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-08-23T12:00:00.000Z");
const ago = (days: number) => new Date(NOW - days * DAY).toISOString();

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

function ledgerFile(lines: object[]): string {
  return fx.file("ledger.jsonl", `${lines.map((line) => JSON.stringify(line)).join("\n")}\n`);
}

const DESCRIPTION = "Use when the alpha job needs doing in this repository.";

describe("readLedger", () => {
  it("keeps the newest run per name and measures the window it covers", () => {
    const path = ledgerFile([
      { at: ago(90), kind: "skill", name: "alpha" },
      { at: ago(3), kind: "skill", name: "alpha" },
      { at: ago(10), kind: "agent", name: "frontend-developer" },
      { at: ago(5), kind: "bash", name: "ignored" },
      { at: "not a date", kind: "skill", name: "broken" },
    ]);

    const ledger = readLedger(path, NOW);

    expect(ledger?.lastUse.get("alpha")).toBe(ago(3));
    expect(ledger?.lastUse.get("frontend-developer")).toBe(ago(10));
    expect(ledger?.lastUse.has("ignored")).toBe(false);
    expect(ledger?.lastUse.has("broken")).toBe(false);
    expect(ledger?.days).toBe(90);
  });

  it("survives a half-written last line", () => {
    const path = fx.file(
      "partial.jsonl",
      `${JSON.stringify({ at: ago(40), kind: "skill", name: "alpha" })}\n{"at":"2026-`,
    );
    expect(readLedger(path, NOW)?.lastUse.get("alpha")).toBe(ago(40));
  });

  it("is null when no ledger exists", () => {
    expect(readLedger(join(fx.dir, "nope.jsonl"), NOW)).toBeNull();
  });
});

describe("unusedFindings", () => {
  it("reports a skill the ledger has never seen", () => {
    fx.skill("project/.claude/skills/alpha", `name: alpha\ndescription: ${DESCRIPTION}`);
    fx.skill("project/.claude/skills/beta", `name: beta\ndescription: ${DESCRIPTION}`);
    const path = ledgerFile([
      { at: ago(60), kind: "skill", name: "alpha" },
      { at: ago(2), kind: "skill", name: "alpha" },
    ]);

    const report = scan([`${fx.dir}/project`], { home: fx.dir, usage: path });
    const unused = report.findings.filter((f) => f.code === "never-used");

    expect(unused).toHaveLength(1);
    expect(unused[0].paths[0]).toContain("beta");
  });

  it("matches on the directory name, which is what invokes a skill", () => {
    // The frontmatter `name` is a display label; `/code-refactoring` comes from
    // the folder. A ledger entry for the folder must count as a run.
    fx.skill("project/.claude/skills/alpha", `name: Alpha Helper\ndescription: ${DESCRIPTION}`);
    const path = ledgerFile([
      { at: ago(60), kind: "skill", name: "alpha" },
      { at: ago(1), kind: "skill", name: "alpha" },
    ]);

    const report = scan([`${fx.dir}/project`], { home: fx.dir, usage: path });
    expect(report.findings.filter((f) => f.code === "never-used")).toEqual([]);
  });

  it("accuses nothing while the ledger is younger than the window", () => {
    fx.skill("project/.claude/skills/beta", `name: beta\ndescription: ${DESCRIPTION}`);
    const path = ledgerFile([{ at: ago(4), kind: "skill", name: "alpha" }]);

    const report = scan([`${fx.dir}/project`], { home: fx.dir, usage: path });

    expect(report.findings.filter((f) => f.code === "never-used")).toEqual([]);
    expect(report.findings.map((f) => f.code)).toContain("usage-ledger-young");
  });

  it("leaves a plugin's skills alone, the way the authoring rules do", () => {
    fx.skill(
      ".claude/plugins/cache/market/plug/1.0.0/skills/vendor",
      `name: vendor\ndescription: ${DESCRIPTION}`,
    );
    const path = ledgerFile([
      { at: ago(90), kind: "skill", name: "alpha" },
      { at: ago(1), kind: "skill", name: "alpha" },
    ]);

    const report = scan([`${fx.dir}/.claude/plugins`], { home: fx.dir, usage: path });
    expect(report.findings.filter((f) => f.code === "never-used")).toEqual([]);
  });

  it("says nothing at all when no ledger path is given, which is what --no-usage does", () => {
    fx.skill("project/.claude/skills/beta", `name: beta\ndescription: ${DESCRIPTION}`);
    const report = scan([`${fx.dir}/project`], { home: fx.dir });
    expect(report.findings.filter((f) => f.code.includes("used"))).toEqual([]);
  });

  it("returns nothing when there is no ledger to read", () => {
    expect(unusedFindings([], null)).toEqual([]);
  });
});
