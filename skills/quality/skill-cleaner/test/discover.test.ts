import { mkdirSync, realpathSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { danglingLinks, dedupe, repoOf, walkSkills } from "../src/discover.js";
import { type Fixture, fixture, makeRepo } from "./fixture.js";

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

const FM = "name: alpha\ndescription: Use when the alpha thing needs doing in a project.";

describe("walkSkills", () => {
  it("finds a flat skill", () => {
    fx.skill(".claude/skills/alpha", FM);
    const found = walkSkills(join(fx.dir, ".claude/skills"));
    expect(found).toHaveLength(1);
    expect(found[0]?.viaSymlink).toBe(false);
  });

  it("finds a packaged skill nested under its package", () => {
    fx.skill(".claude/skills/maintenance/alpha", FM);
    expect(walkSkills(join(fx.dir, ".claude/skills"))).toHaveLength(1);
  });

  it("follows a symlinked skill directory, which a plain glob would miss", () => {
    fx.skill("source/alpha", FM);
    fx.link(".claude/skills/alpha", "source/alpha");

    const found = walkSkills(join(fx.dir, ".claude/skills"));
    expect(found).toHaveLength(1);
    expect(found[0]?.viaSymlink).toBe(true);
    expect(found[0]?.realPath).toBe(realpathSync(join(fx.dir, "source/alpha/SKILL.md")));
  });

  it("follows a symlink standing in for the whole skills directory", () => {
    fx.skill("source/alpha", FM);
    fx.skill("source/beta", "name: beta\ndescription: Use when the beta thing needs doing.");
    mkdirSync(join(fx.dir, ".claude"), { recursive: true });
    symlinkSync(join(fx.dir, "source"), join(fx.dir, ".claude/skills"));

    expect(walkSkills(join(fx.dir, ".claude/skills"))).toHaveLength(2);
  });

  it("terminates on a symlink pointing at its own ancestor", () => {
    fx.skill("source/alpha", FM);
    fx.link("source/alpha/loop", "source");

    // The assertion is that this returns at all rather than recursing forever.
    expect(walkSkills(join(fx.dir, "source"))).toHaveLength(1);
  });

  it("does not register a SKILL.md vendored inside another skill", () => {
    // The vercel plugin ships each skill with its source under
    // `<skill>/upstream/SKILL.md`; the runtime registers the outer skill only.
    fx.skill(".claude/skills/alpha", FM);
    fx.skill(".claude/skills/alpha/upstream", "name: upstream\ndescription: Vendored source of alpha.");
    const found = walkSkills(join(fx.dir, ".claude/skills"));
    expect(found).toHaveLength(1);
    expect(found[0]?.realPath.endsWith("alpha/SKILL.md")).toBe(true);
  });

  it("does not descend into node_modules", () => {
    fx.skill(".claude/skills/node_modules/pkg/alpha", FM);
    expect(walkSkills(join(fx.dir, ".claude/skills"))).toHaveLength(0);
  });

  it("keeps scanning past a directory it cannot read", () => {
    fx.skill(".claude/skills/alpha", FM);
    expect(walkSkills(join(fx.dir, "missing"))).toEqual([]);
  });
});

describe("dedupe", () => {
  it("collapses one skill reachable from two projects into a single entry", () => {
    fx.skill("shared/alpha", FM);
    fx.link("one/.claude/skills/alpha", "shared/alpha");
    fx.link("two/.claude/skills/alpha", "shared/alpha");

    const located = [
      ...walkSkills(join(fx.dir, "one/.claude/skills")),
      ...walkSkills(join(fx.dir, "two/.claude/skills")),
    ];
    const byReal = dedupe(located);

    expect(located).toHaveLength(2);
    expect(byReal.size).toBe(1);
    expect([...byReal.values()][0]).toHaveLength(2);
  });
});

describe("origin", () => {
  it("classifies a skill inside an application bundle as vendor-managed", () => {
    // A macOS app shipping its own skill updates it with the app; adopting it
    // into a repo or linting its authoring would fight the vendor.
    fx.skill("Apps/ego.app/Contents/Resources/ego-skills/alpha", FM);
    const found = walkSkills(join(fx.dir, "Apps"));
    expect(found).toHaveLength(1);
    expect(found[0]?.origin).toBe("plugin");
  });
});

describe("repoOf", () => {
  it("finds the enclosing worktree", () => {
    const repo = makeRepo(fx, "project");
    const skill = fx.skill("project/.claude/skills/alpha", FM);
    expect(repoOf(skill)).toBe(repo);
  });

  it("returns null when nothing above it is a repository", () => {
    const skill = fx.skill("loose/alpha", FM);
    expect(repoOf(skill)).toBe(null);
  });

  it("treats a .git file as a repository, as worktrees and submodules have", () => {
    fx.file("project/.git", "gitdir: /elsewhere/.git/worktrees/project\n");
    const skill = fx.skill("project/.claude/skills/alpha", FM);
    expect(repoOf(skill)).toBe(join(fx.dir, "project"));
  });
});

describe("danglingLinks", () => {
  it("reports a link whose target is gone", () => {
    fx.file(".claude/skills/.keep", "");
    symlinkSync(join(fx.dir, "nowhere"), join(fx.dir, ".claude/skills/broken"));
    expect(danglingLinks(fx.dir)).toEqual([join(fx.dir, ".claude/skills/broken")]);
  });

  it("says nothing about a link that resolves", () => {
    fx.skill("source/alpha", FM);
    fx.link(".claude/skills/alpha", "source/alpha");
    expect(danglingLinks(fx.dir)).toEqual([]);
  });
});

describe("danglingLinks scope", () => {
  it("ignores a broken link that has nothing to do with skills", () => {
    fx.file("clients/acme/placeholder", "x");
    symlinkSync(join(fx.dir, "gone.md"), join(fx.dir, "clients/acme/CLAUDE.md"));
    expect(danglingLinks(fx.dir)).toEqual([]);
  });

  it("still reports a broken link inside a skills directory", () => {
    fx.file(".claude/skills/keep/SKILL.md", "---\nname: keep\ndescription: Use when keeping.\n---\n\nx\n");
    symlinkSync(join(fx.dir, "gone"), join(fx.dir, ".claude/skills/convex"));
    expect(danglingLinks(fx.dir)).toEqual([join(fx.dir, ".claude/skills/convex")]);
  });
});
