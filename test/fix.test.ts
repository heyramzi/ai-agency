import { existsSync, lstatSync, readFileSync, readlinkSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { adopt, applyFixes, renameField } from "../src/fix.js";
import { parseSkill } from "../src/parse.js";
import { checkSkill } from "../src/rules.js";
import type { Skill } from "../src/types.js";
import { type Fixture, fixture, makeRepo } from "./fixture.js";

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

function load(rel: string, frontmatter: string): Skill {
  const path = fx.skill(rel, frontmatter);
  return parseSkill({
    path,
    realPath: path,
    root: fx.dir,
    origin: "project",
    viaSymlink: false,
    repo: fx.dir,
  });
}

describe("renameField", () => {
  it("rewrites only the name line and leaves the rest byte for byte", () => {
    const before = "---\n# keep me\nname: old\ndescription: 'Use when: quoted'\n---\n\nBody\n";
    expect(renameField(before, "new")).toBe(
      "---\n# keep me\nname: new\ndescription: 'Use when: quoted'\n---\n\nBody\n",
    );
  });

  it("does not touch a `name:` that appears in the body", () => {
    const before = "---\nname: old\n---\n\nSet `name: something` in your frontmatter.\n";
    expect(renameField(before, "new")).toBe(
      "---\nname: new\n---\n\nSet `name: something` in your frontmatter.\n",
    );
  });
});

describe("applyFixes", () => {
  it("changes nothing on a dry run", () => {
    const skill = load("alpha", "name: beta\ndescription: Use when the directory and the frontmatter name disagree.");
    const applied = applyFixes([skill], checkSkill(skill), { dryRun: true });

    expect(applied).toHaveLength(1);
    expect(readFileSync(skill.realPath, "utf8")).toContain("name: beta");
  });

  it("aligns the name to its directory when told to write", () => {
    const skill = load("alpha", "name: beta\ndescription: Use when the directory and the frontmatter name disagree.");
    applyFixes([skill], checkSkill(skill), { dryRun: false });

    expect(readFileSync(skill.realPath, "utf8")).toContain("name: alpha");
    expect(checkSkill(parseSkill(skill)).map((f) => f.code)).toEqual([]);
  });

  it("removes a dangling symlink", () => {
    const broken = join(fx.dir, "broken");
    symlinkSync(join(fx.dir, "nowhere"), broken);

    applyFixes(
      [],
      [
        {
          code: "dangling-symlink",
          severity: "error",
          message: "",
          paths: [broken],
          fixable: true,
        },
      ],
      { dryRun: false },
    );

    expect(lstatSync(broken, { throwIfNoEntry: false })).toBeUndefined();
  });

  it("leaves findings that need a judgment call alone", () => {
    const a = load("one/alpha", "name: alpha\ndescription: Use when doing alpha one way here.");
    const b = load("two/alpha", "name: alpha\ndescription: Use when doing alpha another way.");
    const collision = {
      code: "duplicate-name",
      severity: "error" as const,
      message: "",
      paths: [a.realPath, b.realPath],
    };

    expect(applyFixes([a, b], [collision], { dryRun: false })).toEqual([]);
    expect(existsSync(a.realPath)).toBe(true);
    expect(existsSync(b.realPath)).toBe(true);
  });
});

describe("adopt", () => {
  it("moves a homeless skill into a repo and links the old path at it", () => {
    const repo = makeRepo(fx, "project");
    fx.skill("loose/alpha", "name: alpha\ndescription: Use when doing the alpha job.");
    const from = join(fx.dir, "loose/alpha");

    const moved = adopt(from, repo, { dryRun: false });

    expect(moved.to).toBe(join(repo, ".claude/skills/alpha"));
    expect(existsSync(join(moved.to, "SKILL.md"))).toBe(true);
    expect(lstatSync(from).isSymbolicLink()).toBe(true);
    expect(existsSync(join(from, "SKILL.md"))).toBe(true);
  });

  it("links relatively, so the pair survives the home directory moving", () => {
    const repo = makeRepo(fx, "project");
    fx.skill("loose/alpha", "name: alpha\ndescription: Use when doing the alpha job.");
    const from = join(fx.dir, "loose/alpha");

    adopt(from, repo, { dryRun: false });

    expect(readlinkSync(from).startsWith("/")).toBe(false);
  });

  it("moves nothing on a dry run", () => {
    const repo = makeRepo(fx, "project");
    fx.skill("loose/alpha", "name: alpha\ndescription: Use when doing the alpha job.");
    const from = join(fx.dir, "loose/alpha");

    adopt(from, repo, { dryRun: true });

    expect(lstatSync(from).isDirectory()).toBe(true);
    expect(existsSync(join(repo, ".claude/skills/alpha"))).toBe(false);
  });

  it("refuses a directory that is not a skill", () => {
    const repo = makeRepo(fx, "project");
    fx.file("loose/alpha/notes.md", "hi");
    expect(() => adopt(join(fx.dir, "loose/alpha"), repo, { dryRun: true })).toThrow(/no SKILL.md/);
  });

  it("refuses a destination that is not a repository", () => {
    fx.skill("loose/alpha", "name: alpha\ndescription: Use when doing the alpha job.");
    expect(() => adopt(join(fx.dir, "loose/alpha"), fx.dir, { dryRun: true })).toThrow(
      /not a git repository/,
    );
  });

  it("refuses a skill that already has a repository behind it", () => {
    const repo = makeRepo(fx, "project");
    const other = makeRepo(fx, "elsewhere");
    fx.skill("elsewhere/skills/alpha", "name: alpha\ndescription: Use when doing the alpha job.");
    expect(() => adopt(join(other, "skills/alpha"), repo, { dryRun: true })).toThrow(
      /already inside a repository/,
    );
  });

  it("refuses to overwrite an existing skill of the same name", () => {
    const repo = makeRepo(fx, "project");
    fx.skill("project/.claude/skills/alpha", "name: alpha\ndescription: Use when doing alpha.");
    fx.skill("loose/alpha", "name: alpha\ndescription: Use when doing the alpha job.");
    expect(() => adopt(join(fx.dir, "loose/alpha"), repo, { dryRun: true })).toThrow(
      /already exists/,
    );
  });
});
