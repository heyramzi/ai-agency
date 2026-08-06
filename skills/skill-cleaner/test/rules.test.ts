import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseSkill } from "../src/parse.js";
import { bundledPathMentions, checkSkill, referencedFiles } from "../src/rules.js";
import type { Located } from "../src/types.js";
import { type Fixture, fixture } from "./fixture.js";

let fx: Fixture;
beforeEach(() => {
  fx = fixture();
});
afterEach(() => fx.cleanup());

const GOOD = "name: alpha\ndescription: Use when the alpha thing needs doing in a project checkout.";

function check(rel: string, frontmatter: string, body?: string) {
  const path = fx.skill(rel, frontmatter, body);
  const located: Located = {
    path,
    realPath: path,
    root: fx.dir,
    origin: "project",
    viaSymlink: false,
    repo: fx.dir,
  };
  return checkSkill(parseSkill(located)).map((f) => f.code);
}

/** SKILL.md with no frontmatter fence at all. */
function checkRaw(rel: string, contents: string) {
  const path = fx.file(`${rel}/SKILL.md`, contents);
  return checkSkill(
    parseSkill({
      path,
      realPath: path,
      root: fx.dir,
      origin: "project",
      viaSymlink: false,
      repo: fx.dir,
    }),
  ).map((f) => f.code);
}

describe("a well-formed skill", () => {
  it("produces no findings", () => {
    expect(check("alpha", GOOD)).toEqual([]);
  });

  it("accepts every optional field the specification defines", () => {
    expect(
      check(
        "alpha",
        `${GOOD}\nlicense: MIT\ncompatibility: Requires git\nallowed-tools: Read Bash(git:*)\nmetadata:\n  author: upsys`,
      ),
    ).toEqual([]);
  });
});

describe("frontmatter", () => {
  it("flags a file with no frontmatter, which never registers", () => {
    expect(checkRaw("alpha", "# Alpha\n\nJust prose.\n")).toEqual(["missing-frontmatter"]);
  });

  it("flags frontmatter that does not parse", () => {
    expect(check("alpha", "name: [unclosed")).toEqual(["frontmatter-unparseable"]);
  });

  it("flags frontmatter that parses to something other than a map", () => {
    expect(check("alpha", "- just\n- a list")).toEqual(["frontmatter-unparseable"]);
  });

  it("does not treat a horizontal rule in the body as a fence", () => {
    const codes = check("alpha", GOOD, "# Alpha\n\nOne thing.\n\n---\n\nAnother thing.\n");
    expect(codes).toEqual([]);
  });

  it("flags a key the specification does not define, since the runtime ignores it", () => {
    expect(check("alpha", `${GOOD}\ndescriptoin: typo`)).toEqual(["unknown-field"]);
  });
});

describe("name", () => {
  it("requires it", () => {
    expect(check("alpha", "description: Use when a thing that has no name needs doing.")).toContain(
      "missing-name",
    );
  });

  it.each([
    ["Alpha", "name-charset"],
    ["al pha", "name-charset"],
    ["-alpha", "name-hyphen-edge"],
    ["alpha-", "name-hyphen-edge"],
    ["al--pha", "name-double-hyphen"],
  ])("rejects `%s`", (name, code) => {
    expect(check(name, `name: ${name}\ndescription: Use when a badly named thing needs doing.`)).toContain(
      code,
    );
  });

  it("requires the name to match its directory, because the runtime keys on one of them", () => {
    expect(
      check("alpha", "name: beta\ndescription: Use when the mismatched thing needs doing here."),
    ).toContain("name-dir-mismatch");
  });

  it("rejects a name over 64 characters", () => {
    const long = "a".repeat(65);
    expect(check(long, `name: ${long}\ndescription: Use when a very long name needs doing.`)).toContain(
      "name-too-long",
    );
  });
});

describe("description", () => {
  it("requires it", () => {
    expect(check("alpha", "name: alpha")).toContain("missing-description");
  });

  it("rejects one over 1024 characters", () => {
    expect(check("alpha", `name: alpha\ndescription: ${"Use when ".repeat(200)}`)).toContain(
      "description-too-long",
    );
  });

  it("warns on one too thin to carry a trigger", () => {
    expect(check("alpha", "name: alpha\ndescription: Helps with PDFs.")).toContain(
      "description-thin",
    );
  });

  it("warns when it never says when to apply", () => {
    expect(
      check("alpha", "name: alpha\ndescription: A comprehensive toolkit for document processing."),
    ).toContain("description-no-trigger");
  });

  it("warns on first person, since it is injected into the system prompt", () => {
    expect(
      check("alpha", "name: alpha\ndescription: I can help you when you need alpha things done."),
    ).toContain("description-first-person");
  });
});

describe("user-invoked skills", () => {
  // mattpocock/skills reported 19 description warnings; every one was a
  // `disable-model-invocation: true` skill. The model never matches against
  // those descriptions, so trigger-quality checks on them are pure noise.
  it("does not demand a trigger from a skill only the human can invoke", () => {
    expect(
      check(
        "alpha",
        "name: alpha\ndescription: Stop. That last message did not land — re-pitch it.\ndisable-model-invocation: true",
      ),
    ).toEqual([]);
  });

  it("still demands one when the model can invoke it", () => {
    expect(
      check("alpha", "name: alpha\ndescription: Stop. That last message did not land — re-pitch it."),
    ).toEqual(["description-no-trigger"]);
  });

  it("still enforces the spec limits either way", () => {
    expect(
      check(
        "alpha",
        `name: alpha\ndescription: ${"x".repeat(1025)}\ndisable-model-invocation: true`,
      ),
    ).toContain("description-too-long");
  });
});

describe("platform validation", () => {
  it("warns on a name containing a reserved word", () => {
    expect(
      check("claude-tools", "name: claude-tools\ndescription: Use when the claude tooling needs a check."),
    ).toEqual(["name-reserved-word"]);
  });

  it("warns on an XML tag in the description", () => {
    expect(
      check("alpha", "name: alpha\ndescription: Use when processing <files> that arrive from intake."),
    ).toEqual(["description-xml-tags"]);
  });

  it("does not read a comparison as a tag", () => {
    expect(
      check("alpha", "name: alpha\ndescription: Use when a list has more than 5 < n items to rebalance."),
    ).toEqual([]);
  });
});

describe("body", () => {
  it("flags frontmatter with nothing after it", () => {
    expect(check("alpha", GOOD, "")).toContain("body-empty");
  });

  it("warns past the 500 line recommendation", () => {
    expect(check("alpha", GOOD, "line\n".repeat(501))).toContain("body-too-long");
  });

  it("warns on a long monolith that splits nothing out", () => {
    expect(check("alpha", GOOD, "line\n".repeat(220))).toEqual(["body-verbose"]);
  });

  it("accepts the same length when detail is pushed into references", () => {
    fx.file("alpha/references/DETAIL.md", "# Detail\n");
    const body = `See [the detail](references/DETAIL.md).\n${"line\n".repeat(220)}`;
    expect(check("alpha", GOOD, body)).toEqual([]);
  });

  it("flags a reference to a file that is not there", () => {
    expect(check("alpha", GOOD, "See [the guide](references/GUIDE.md).")).toContain(
      "broken-reference",
    );
  });

  it("says nothing about a reference that resolves", () => {
    fx.file("alpha/references/GUIDE.md", "# Guide\n");
    expect(check("alpha", GOOD, "See [the guide](references/GUIDE.md).")).toEqual([]);
  });

  it("flags a reference file that links onward, past one level deep", () => {
    // Claude previews chained files with `head -100` instead of reading them.
    fx.file("alpha/references/GUIDE.md", "See [the details](details.md).");
    expect(check("alpha", GOOD, "See [the guide](references/GUIDE.md).")).toEqual([
      "nested-reference",
    ]);
  });

  it("does not police another skill's tree through a cross-skill link", () => {
    // seo-keyword-research links a sibling skill's SKILL.md; that skill's
    // onward links are its own tree's business, judged when it is scanned.
    fx.file("beta/SKILL.md", "---\nname: beta\ndescription: Use when b.\n---\n\nSee [g](references/G.md).\n");
    fx.file("beta/references/G.md", "# G\n");
    expect(check("alpha", GOOD, "Related craft in [beta](../beta/SKILL.md).")).toEqual([]);
  });

  it("allows a reference file linking a code sample", () => {
    // remotion's text-animations.md links the .tsx it is teaching. Showing the
    // work is not a third level of instructions, and flagging it sent the
    // reader to rewrite a reference file that was already right.
    fx.file("alpha/references/GUIDE.md", "Copy [the component](assets/thing.tsx).");
    fx.file("alpha/references/assets/thing.tsx", "export const Thing = () => null;\n");
    expect(check("alpha", GOOD, "See [the guide](references/GUIDE.md).")).toEqual([]);
  });

  it("allows a reference file linking back to SKILL.md", () => {
    // mattpocock/skills produced six of these and every one was a backlink
    // to the root, not content buried two levels deep.
    fx.file("alpha/references/GUIDE.md", "Come back to [the skill](../SKILL.md) when done.");
    expect(check("alpha", GOOD, "See [the guide](references/GUIDE.md).")).toEqual([]);
  });

  it("allows a reference file cross-linking a sibling SKILL.md also links", () => {
    fx.file("alpha/references/GUIDE.md", "See also [the other](EXTRA.md).");
    fx.file("alpha/references/EXTRA.md", "# Extra\n");
    const body = "See [the guide](references/GUIDE.md) and [the extra](references/EXTRA.md).";
    expect(check("alpha", GOOD, body)).toEqual([]);
  });
});

describe("referencedFiles", () => {
  it("takes relative paths and leaves urls, absolutes and anchors alone", () => {
    const body = `
      [a](references/A.md)
      [b](https://example.com/b.md)
      [c](/etc/hosts)
      [d](#section)
      [e](scripts/run.py#L4)
    `;
    expect(referencedFiles(body).sort()).toEqual(["references/A.md", "scripts/run.py"]);
  });

  it("leaves backticked prose alone; bundledPathMentions owns that shape", () => {
    expect(referencedFiles("The ledger is `references/ledger.json`.")).toEqual([]);
  });

  it("ignores links inside a fenced block, which are syntax being demonstrated", () => {
    // A skill that teaches a markdown format writes example links that were
    // never meant to resolve. Reporting them is how a real broken link gets
    // lost in the noise.
    const body = [
      "Write a slide like this:",
      "",
      "```markdown",
      "![Board](./shots/board.png){ratio=16/8}",
      "[the guide](references/NOPE.md)",
      "```",
      "",
      "See [the real one](references/REAL.md).",
    ].join("\n");
    expect(referencedFiles(body)).toEqual(["references/REAL.md"]);
  });

  it("does not let an unclosed fence swallow the rest of the body", () => {
    const body = "```\nopen forever\n\nSee [the guide](references/REAL.md).";
    expect(referencedFiles(body)).toEqual(["references/REAL.md"]);
  });
});

describe("bundledPathMentions", () => {
  it("takes a bundled path named in backticks, with no markdown link around it", () => {
    // The ledger this check exists for was named in prose for a week while the
    // file did not exist, and nothing reported it.
    expect(bundledPathMentions("The ledger is `references/ledger.json`.")).toEqual([
      "references/ledger.json",
    ]);
  });

  it("leaves backticked paths that are not bundled resources alone", () => {
    const body = `
      Run it against \`~/.claude/skills\` and \`/etc/hosts\`.
      Your project keeps them in \`.claude/skills/foo.md\`, which is not ours.
      Prose about \`node_modules/x.js\` is somebody else's tree.
    `;
    expect(bundledPathMentions(body)).toEqual([]);
  });

  it("does not treat a command containing a path as a mention", () => {
    // `node scripts/x.cjs audit` is an instruction, not a claim that the file
    // sits next to SKILL.md. Only a bare single-token span counts.
    expect(bundledPathMentions("Run `node scripts/skill-cleaner.cjs audit` to start.")).toEqual([]);
  });

  it("ignores a bundled directory named without a file", () => {
    expect(bundledPathMentions("Move reference material into `references/`.")).toEqual([]);
  });

  it("ignores a path quoted inside a fenced block", () => {
    const body = "```\nreferences/example.json\n```\n\nThe real one is `references/ledger.json`.";
    expect(bundledPathMentions(body)).toEqual(["references/ledger.json"]);
  });
});

describe("lenient frontmatter", () => {
  it("rescues a description whose unquoted value contains a colon, as the runtime does", () => {
    const codes = check(
      "alpha",
      "name: alpha\ndescription: Use when interacting with ClickUp: reading tasks and updating them.",
    );
    expect(codes).toEqual(["frontmatter-lenient-yaml"]);
  });

  it("still reports a block that nothing can recover", () => {
    expect(check("alpha", "name: [unclosed")).toEqual(["frontmatter-unparseable"]);
  });

  it("says nothing when the same value is quoted properly", () => {
    expect(
      check("alpha", 'name: alpha\ndescription: "Use when interacting with ClickUp: reading tasks."'),
    ).toEqual([]);
  });
});

describe("runtime frontmatter extensions", () => {
  it("accepts the fields Claude Code reads but the cross-runtime spec omits", () => {
    expect(
      check("alpha", `${GOOD}\nargument-hint: <task-id>\ndisable-model-invocation: true\nuser-invocable: true\nmodel: sonnet`),
    ).toEqual([]);
  });

  it("still flags a field no runtime reads", () => {
    expect(check("alpha", `${GOOD}\nversion: 2\nauthor: someone`)).toEqual([
      "unknown-field",
      "unknown-field",
    ]);
  });
});
