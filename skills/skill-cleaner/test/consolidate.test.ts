import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyze } from "../src/analyze.js";
import {
  applyConsolidation,
  mergeBodies,
  pickWinner,
  planConsolidation,
  repoint,
  sections,
} from "../src/consolidate.js";
import { parseSkill } from "../src/parse.js";
import type { Origin, Skill } from "../src/types.js";
import { type Fixture, fixture } from "./fixture.js";

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

function load(
  rel: string,
  frontmatter: string,
  body = "# Skill\n\nDo the thing.\n",
  opts: { origin?: Origin; repo?: string | null } = {},
): Skill {
  const path = fx.skill(rel, frontmatter, body);
  return parseSkill({
    path,
    realPath: path,
    root: fx.dir,
    origin: opts.origin ?? "project",
    viaSymlink: false,
    repo: opts.repo === undefined ? fx.dir : opts.repo,
  });
}

describe("sections", () => {
  it("splits on level-two headings and keeps their bodies", () => {
    const parts = sections("# T\n\nintro\n\n## One\n\na\n\n## Two\n\nb\n");
    expect(parts.map((p) => p.heading)).toEqual(["One", "Two"]);
    expect(parts[0]?.text).toContain("a");
  });

  it("ignores a heading inside a fenced block, which is sample markdown", () => {
    const parts = sections("## Real\n\n```md\n## Not a section\n```\n");
    expect(parts.map((p) => p.heading)).toEqual(["Real"]);
  });
});

describe("pickWinner", () => {
  it("prefers the copy inside a repository over one that lives nowhere", () => {
    const homeless = load("a", "name: dup\ndescription: one", undefined, { repo: null });
    const tracked = load("b", "name: dup\ndescription: two");
    expect(pickWinner([homeless, tracked]).winner.realPath).toBe(tracked.realPath);
  });

  it("prefers a project skill over a vendored plugin copy", () => {
    const plugin = load("a", "name: dup\ndescription: one", undefined, { origin: "plugin" });
    const project = load("b", "name: dup\ndescription: two", undefined, { origin: "project" });
    expect(pickWinner([plugin, project]).winner.realPath).toBe(project.realPath);
  });

  it("falls back to the longer body, which is the one that kept being edited", () => {
    const short = load("a", "name: dup\ndescription: one", "# A\n");
    const long = load("b", "name: dup\ndescription: two", "# B\n\nmore\n\nand more\n");
    expect(pickWinner([short, long]).winner.realPath).toBe(long.realPath);
  });

  it("is deterministic when everything else ties", () => {
    const a = load("a", "name: dup\ndescription: one");
    const b = load("b", "name: dup\ndescription: two");
    expect(pickWinner([a, b]).winner.realPath).toBe(pickWinner([b, a]).winner.realPath);
  });
});

describe("planConsolidation", () => {
  it("turns an identical copy into a link and keeps one source", () => {
    const a = load("keep/dup", "name: dup\ndescription: same");
    const b = load("copy/dup", "name: dup\ndescription: same");
    const plan = planConsolidation([a, b], analyze([a, b]));
    const links = plan.actions.filter((x) => x.kind === "link");
    expect(links).toHaveLength(1);
  });

  it("refuses to merge a pair when one side is outside any repository", () => {
    const shared =
      "description: Drafting, editing and polishing long form written articles, newsletters and essays published weekly";
    const inside = load("a/one", `name: one\n${shared}`);
    const outside = load("b/two", `name: two\n${shared}`, undefined, { repo: null });
    const plan = planConsolidation([inside, outside], analyze([inside, outside]));
    expect(plan.actions.filter((x) => x.kind === "merge")).toHaveLength(0);
    expect(plan.skipped[0]?.reason).toMatch(/outside any repository/);
  });

  it("never acts on a skill twice, even when two findings name it", () => {
    // Long enough to clear the eight-significant-word floor that `overlaps`
    // needs before a similarity score means anything.
    const shared =
      "description: Drafting, editing and polishing long form written articles, newsletters and essays published weekly";
    const a = load("a/one", `name: one\n${shared}`);
    const b = load("b/two", `name: two\n${shared}`);
    const c = load("c/three", `name: three\n${shared}`);
    const plan = planConsolidation([a, b, c], analyze([a, b, c]));
    const merged = plan.actions.filter((x) => x.kind === "merge").map((x) => x.loser);
    expect(new Set(merged).size).toBe(merged.length);
  });

  it("repoints a survivor that routed to the name being merged away", () => {
    // Long enough to clear the eight-significant-word floor that `overlaps`
    // needs before a similarity score means anything.
    const shared =
      "description: Drafting, editing and polishing long form written articles, newsletters and essays published weekly";
    const a = load("a/keeper", `name: keeper\n${shared}`, "# Keeper\n\nLonger body here.\n\nMore.\n");
    const b = load("b/goner", `name: goner\n${shared}`, "# Goner\n");
    const other = load(
      "c/other",
      "name: other\ndescription: an unrelated skill that routes elsewhere entirely",
      "# Other\n\nHand the draft to the `goner` skill when done.\n",
    );
    const plan = planConsolidation([a, b, other], analyze([a, b, other]));
    const repoints = plan.actions.filter((x) => x.kind === "repoint");
    expect(repoints).toHaveLength(1);
    expect(repoints[0]).toMatchObject({ from: "goner", to: "keeper", path: other.realPath });
  });
});

describe("applyConsolidation", () => {
  it("dry run changes nothing on disk", () => {
    const a = load("keep/dup", "name: dup\ndescription: same");
    const b = load("copy/dup", "name: dup\ndescription: same");
    const plan = planConsolidation([a, b], analyze([a, b]));
    applyConsolidation(plan, { dryRun: true });
    expect(existsSync(b.realPath)).toBe(true);
    expect(lstatSync(join(fx.dir, "copy/dup")).isSymbolicLink()).toBe(false);
  });

  it("replaces the duplicate directory with a link that still resolves", () => {
    const a = load("keep/dup", "name: dup\ndescription: same");
    const b = load("copy/dup", "name: dup\ndescription: same");
    const plan = planConsolidation([a, b], analyze([a, b]));
    const link = plan.actions.find((x) => x.kind === "link");
    if (link?.kind !== "link") throw new Error("expected a link action");
    const before = readFileSync(a.realPath, "utf8");

    applyConsolidation(plan, { dryRun: false });

    expect(lstatSync(link.loser).isSymbolicLink()).toBe(true);
    // The link is what keeps the old path loading, so reading through it has to
    // return the surviving skill rather than nothing.
    expect(readFileSync(join(link.loser, "SKILL.md"), "utf8")).toBe(before);
  });

  it("carries unique sections across and deletes the loser", () => {
    // Long enough to clear the eight-significant-word floor that `overlaps`
    // needs before a similarity score means anything.
    const shared =
      "description: Drafting, editing and polishing long form written articles, newsletters and essays published weekly";
    const a = load("a/keeper", `name: keeper\n${shared}`, "# Keeper\n\n## Shared\n\nkeep\n\n## Extra\n\nx\n");
    const b = load("b/goner", `name: goner\n${shared}`, "# Goner\n\n## Shared\n\ndrop\n\n## Only Here\n\nrare\n");
    const plan = planConsolidation([a, b], analyze([a, b]));
    applyConsolidation(plan, { dryRun: false });

    const merged = readFileSync(a.realPath, "utf8");
    expect(merged).toContain("## Only Here");
    expect(merged).toContain("merged from `goner`");
    // The winner's own version of a shared heading survives untouched.
    expect(merged).toContain("keep");
    expect(merged).not.toContain("drop");
    expect(existsSync(join(fx.dir, "b/goner"))).toBe(false);
  });
});

describe("mergeBodies", () => {
  it("leaves the winner byte for byte when there is nothing unique", () => {
    const a = load("a/keeper", "name: keeper\ndescription: one", "# Keeper\n\n## Same\n\nx\n");
    const b = load("b/goner", "name: goner\ndescription: two", "# Goner\n\n## Same\n\ny\n");
    const before = readFileSync(a.realPath, "utf8");
    const out = mergeBodies({
      kind: "merge",
      name: "goner",
      winner: a.realPath,
      loser: b.realPath,
      sections: [],
    });
    expect(out).toBe(before);
  });
});

describe("repoint", () => {
  it("rewrites both routing shapes", () => {
    expect(repoint("use the `old` skill now", "old", "new")).toBe("use the `new` skill now");
    expect(repoint("see skill `old` there", "old", "new")).toBe("see skill `new` there");
  });

  it("leaves the name alone when it is ordinary prose or another value", () => {
    expect(repoint("the field `old` is set", "old", "new")).toBe("the field `old` is set");
    expect(repoint("old habits", "old", "new")).toBe("old habits");
  });
});
