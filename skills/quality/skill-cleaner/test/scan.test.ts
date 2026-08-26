import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scan } from "../src/scan.js";
import { type Fixture, fixture } from "./fixture.js";

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

describe("scan", () => {
  it("does not lint the authoring of an installed plugin", () => {
    // A plugin's verbosity or missing trigger is its vendor's to fix; reporting
    // it on every audit is noise the user cannot act on. One audit reported 192
    // such findings from the official plugins alone.
    fx.skill(
      ".claude/plugins/cache/market/plug/1.0.0/skills/alpha",
      "name: alpha\ndescription: Short.\nversion: 2",
    );
    const report = scan([`${fx.dir}/.claude/plugins`], { home: fx.dir });

    expect(report.skills).toHaveLength(1);
    expect(report.findings).toEqual([]);
  });

  it("still lints a project skill with the same content", () => {
    fx.skill("project/.claude/skills/alpha", "name: alpha\ndescription: Short.\nversion: 2");
    const report = scan([`${fx.dir}/project`], { home: fx.dir });

    const codes = report.findings.map((f) => f.code);
    expect(codes).toContain("description-thin");
    expect(codes).toContain("unknown-field");
  });

  it("still counts plugin skills in registry-level analysis", () => {
    const fm = "name: alpha\ndescription: Use when the alpha job needs doing here.";
    fx.skill(".claude/plugins/cache/market/plug/1.0.0/skills/alpha", fm);
    fx.skill("project/.claude/skills/alpha", `${fm}\n`, "# Different body\n");
    const report = scan([`${fx.dir}/project`, `${fx.dir}/.claude/plugins`], { home: fx.dir });

    expect(report.findings.map((f) => f.code)).toContain("duplicate-name");
  });

  it("stops offering to align a name onto one another skill already holds", () => {
    // `CLIs/umami` was named `umami-cli` next to an `analytics/umami`. Applying
    // the fix aligned it to its directory and created a duplicate-name error,
    // where the runtime keeps one and silently drops the other.
    fx.skill("project/.claude/skills/umami", "name: umami\ndescription: Use when reading traffic.");
    fx.skill("project/clis/umami", "name: umami-cli\ndescription: Use when querying the CLI.");
    const report = scan([`${fx.dir}/project`], { home: fx.dir });

    const mismatch = report.findings.find((f) => f.code === "name-dir-mismatch");
    expect(mismatch).toBeDefined();
    expect(mismatch?.fixable).toBe(false);
  });

  it("still offers to align a name when the directory name is free", () => {
    fx.skill("project/.claude/skills/beta", "name: beta-cli\ndescription: Use when doing beta.");
    const report = scan([`${fx.dir}/project`], { home: fx.dir });

    expect(report.findings.find((f) => f.code === "name-dir-mismatch")?.fixable).toBe(true);
  });
});
