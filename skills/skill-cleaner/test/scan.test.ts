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
});
