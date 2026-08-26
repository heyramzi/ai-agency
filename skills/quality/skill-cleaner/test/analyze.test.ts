import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyze, jaccard, significantWords } from "../src/analyze.js";
import { parseSkill } from "../src/parse.js";
import type { Origin, Skill } from "../src/types.js";
import { type Fixture, fixture } from "./fixture.js";

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

function load(rel: string, frontmatter: string, body?: string, over: Partial<Skill> = {}): Skill {
  const path = fx.skill(rel, frontmatter, body);
  return {
    ...parseSkill({
      path,
      realPath: path,
      root: fx.dir,
      origin: "project" as Origin,
      viaSymlink: false,
      repo: fx.dir,
    }),
    ...over,
  };
}

const codes = (skills: Skill[], dangling: string[] = []) =>
  analyze(skills, dangling).map((f) => f.code);

describe("duplicate-name", () => {
  it("flags the same name registered from two places with different content", () => {
    const a = load("one/alpha", "name: alpha\ndescription: Use when doing alpha in project one.");
    const b = load("two/alpha", "name: alpha\ndescription: Use when doing alpha in project two.", "# Other\n");
    expect(codes([a, b])).toContain("duplicate-name");
  });

  it("does not flag two names that merely resemble each other", () => {
    const a = load("alpha", "name: alpha\ndescription: Use when doing the alpha job here.");
    const b = load("alpha-two", "name: alpha-two\ndescription: Use when doing a wholly separate beta job.");
    expect(codes([a, b])).not.toContain("duplicate-name");
  });

  it("reports byte-identical twins as a copy, not as a name collision", () => {
    const fm = "name: alpha\ndescription: Use when doing alpha work anywhere at all.";
    const found = codes([load("one/alpha", fm), load("two/alpha", fm)]);
    expect(found).toContain("duplicate-copy");
    expect(found).not.toContain("duplicate-name");
  });
});

describe("unknown-skill-reference", () => {
  const routed = (body: string) =>
    codes([
      load("alpha", "name: alpha\ndescription: Use when doing the alpha job in a checkout.", body),
      load("humanizer", "name: humanizer\ndescription: Use when copy reads as machine written."),
    ]);

  it("flags a body routing to a skill that is registered nowhere", () => {
    expect(routed("Pass the draft through the `voice-dna` skill before shipping.")).toContain(
      "unknown-skill-reference",
    );
  });

  it("stays quiet when the skill it routes to is registered", () => {
    expect(routed("Pass the draft through the `humanizer` skill before shipping.")).not.toContain(
      "unknown-skill-reference",
    );
  });

  it("reads the other word order too", () => {
    expect(routed("Hand it to the skill `voice-dna` and wait.")).toContain(
      "unknown-skill-reference",
    );
  });

  it("resolves a plugin-namespaced reference by its bare name", () => {
    expect(routed("Start with the `superpowers:humanizer` skill.")).not.toContain(
      "unknown-skill-reference",
    );
  });

  it("ignores backticked words that are not routing to a skill", () => {
    const body = "Set `privacy` to public. The `status` field is a string. Run `audit` first.";
    expect(routed(body)).not.toContain("unknown-skill-reference");
  });

  it("does not flag a skill for naming itself", () => {
    expect(routed("This `alpha` skill owns the alpha job.")).not.toContain(
      "unknown-skill-reference",
    );
  });
});

describe("dangling-bundled-path", () => {
  it("flags a bundled file no scanned skill provides", () => {
    const a = load(
      "alpha",
      "name: alpha\ndescription: Use when doing the alpha job in a checkout.",
      "The ledger is `references/ledger.json` and the audit joins against it.",
    );
    expect(codes([a])).toContain("dangling-bundled-path");
  });

  it("stays quiet when the skill actually ships the file", () => {
    fx.file("beta/references/ledger.json", "{}");
    const b = load(
      "beta",
      "name: beta\ndescription: Use when doing the beta job in a checkout.",
      "The ledger is `references/ledger.json`.",
    );
    expect(codes([b])).not.toContain("dangling-bundled-path");
  });

  it("stays quiet when a sibling skill provides it, which is the common shape", () => {
    // "See the `humanizer` skill, `references/patterns.md`" is a correct pointer
    // at somebody else's file, and judging it per-directory reported 48 of these.
    fx.file("humanizer/references/patterns.md", "# patterns\n");
    const owner = load(
      "humanizer",
      "name: humanizer\ndescription: Use when copy reads as machine written anywhere.",
      "Patterns live in `references/patterns.md`.",
    );
    const quoter = load(
      "alpha",
      "name: alpha\ndescription: Use when doing the alpha job in a checkout.",
      "Full treatment in the `humanizer` skill, `references/patterns.md` section 9.",
    );
    expect(codes([owner, quoter])).not.toContain("dangling-bundled-path");
  });

  it("counts a provider that ships the file without ever naming it", () => {
    fx.file("humanizer/references/patterns.md", "# patterns\n");
    const owner = load(
      "humanizer",
      "name: humanizer\ndescription: Use when copy reads as machine written anywhere.",
      "No backticked path anywhere in this body.",
    );
    const quoter = load(
      "alpha",
      "name: alpha\ndescription: Use when doing the alpha job in a checkout.",
      "Full treatment in the `humanizer` skill, `references/patterns.md` section 9.",
    );
    expect(codes([owner, quoter])).not.toContain("dangling-bundled-path");
  });
});

describe("outside-codebase", () => {
  it("flags a skill with no repository behind it", () => {
    const loose = load("loose/alpha", "name: alpha\ndescription: Use when doing alpha work.", undefined, {
      repo: null,
      origin: "personal",
    });
    expect(codes([loose])).toContain("outside-codebase");
  });

  it("accepts a personal skill that is a symlink into a checkout", () => {
    const linked = load("alpha", "name: alpha\ndescription: Use when doing alpha work here.", undefined, {
      origin: "personal",
      viaSymlink: true,
      repo: join(fx.dir, "repo"),
    });
    expect(codes([linked])).not.toContain("outside-codebase");
  });

  it("leaves installed plugin skills alone, since they are not authored here", () => {
    const plugin = load("alpha", "name: alpha\ndescription: Use when doing alpha work here.", undefined, {
      origin: "plugin",
      repo: null,
    });
    expect(codes([plugin])).not.toContain("outside-codebase");
  });
});

describe("overlap", () => {
  it("flags two skills competing for the same trigger", () => {
    const a = load(
      "audit-one",
      "name: audit-one\ndescription: Use when auditing markdown documentation files for broken links, stale headings and malformed frontmatter blocks.",
    );
    const b = load(
      "audit-two",
      "name: audit-two\ndescription: Use when auditing markdown documentation files for stale headings, broken links and malformed frontmatter blocks.",
    );
    expect(codes([a, b])).toContain("overlap");
  });

  it("leaves genuinely different skills alone", () => {
    const a = load(
      "deploy",
      "name: deploy\ndescription: Use when shipping a build to production through the release pipeline.",
    );
    const b = load(
      "invoice",
      "name: invoice\ndescription: Use when a client needs billing paperwork raised against a signed order.",
    );
    expect(codes([a, b])).not.toContain("overlap");
  });
});

describe("dangling-symlink", () => {
  it("passes broken links through as fixable findings", () => {
    const found = analyze([], ["/tmp/nope"]);
    expect(found[0]?.code).toBe("dangling-symlink");
    expect(found[0]?.fixable).toBe(true);
  });
});

describe("similarity", () => {
  it("drops filler words that every description contains", () => {
    expect(significantWords("Use when the skill should run for the user")).toEqual(
      new Set(["user"]),
    );
  });

  it("scores no shared words as zero and identical sets as one", () => {
    expect(jaccard(new Set(["a"]), new Set(["b"]))).toBe(0);
    expect(jaccard(new Set(["a", "b"]), new Set(["a", "b"]))).toBe(1);
    expect(jaccard(new Set(), new Set(["a"]))).toBe(0);
  });
});

describe("overlap against duplicate-name", () => {
  it("does not repeat a collision the sharper rule already reported", () => {
    const a = load("one/alpha", "name: alpha\ndescription: Use when auditing documentation files for broken links, stale headings and malformed frontmatter.");
    const b = load("two/alpha", "name: alpha\ndescription: Use when auditing documentation files for stale headings, broken links and malformed frontmatter.", "# Other\n");
    const found = codes([a, b]);
    expect(found).toContain("duplicate-name");
    expect(found).not.toContain("overlap");
  });
});
