import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseSkill } from "../src/parse.js";
import { checkSkill, referencedFiles } from "../src/rules.js";
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

describe("body", () => {
  it("flags frontmatter with nothing after it", () => {
    expect(check("alpha", GOOD, "")).toContain("body-empty");
  });

  it("warns past the 500 line recommendation", () => {
    expect(check("alpha", GOOD, "line\n".repeat(501))).toContain("body-too-long");
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
