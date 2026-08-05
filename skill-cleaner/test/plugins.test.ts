import { describe, expect, it } from "vitest";
import { compareVersions, isMarketplaceClone, keepNewestPluginVersions } from "../src/plugins.js";
import type { Located } from "../src/types.js";

const at = (realPath: string): Located => ({
  path: realPath,
  realPath,
  root: "/",
  origin: "plugin",
  viaSymlink: false,
  repo: null,
});

describe("isMarketplaceClone", () => {
  it("spots the upstream clone a plugin is installed from", () => {
    expect(isMarketplaceClone("/home/.claude/plugins/marketplaces/x/.cursor/skills/a/SKILL.md")).toBe(true);
  });

  it("leaves the installed cache alone", () => {
    expect(isMarketplaceClone("/home/.claude/plugins/cache/x/y/1.0.0/skills/a/SKILL.md")).toBe(false);
  });
});

describe("keepNewestPluginVersions", () => {
  it("keeps only the live version of a plugin that has been upgraded", () => {
    const kept = keepNewestPluginVersions([
      at("/h/.claude/plugins/cache/m/p/4.0.0/skills/a/SKILL.md"),
      at("/h/.claude/plugins/cache/m/p/4.0.4/skills/a/SKILL.md"),
      at("/h/.claude/plugins/cache/m/p/4.0.2/skills/a/SKILL.md"),
    ]);
    expect(kept.map((k) => k.realPath)).toEqual([
      "/h/.claude/plugins/cache/m/p/4.0.4/skills/a/SKILL.md",
    ]);
  });

  it("keeps every skill inside the version it kept", () => {
    const kept = keepNewestPluginVersions([
      at("/h/.claude/plugins/cache/m/p/1.0.0/skills/a/SKILL.md"),
      at("/h/.claude/plugins/cache/m/p/1.0.0/skills/b/SKILL.md"),
    ]);
    expect(kept).toHaveLength(2);
  });

  it("does not touch skills outside a plugin cache", () => {
    const project = at("/repo/.claude/skills/a/SKILL.md");
    expect(keepNewestPluginVersions([project])).toEqual([project]);
  });
});

describe("compareVersions", () => {
  it("orders numerically, where a string sort would not", () => {
    expect(compareVersions("4.0.10", "4.0.9")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("2.0.0", "10.0.0")).toBeLessThan(0);
  });

  it("treats a missing segment as zero", () => {
    expect(compareVersions("1.2", "1.2.0")).toBe(0);
  });
});
