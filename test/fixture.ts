import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export type Fixture = {
  dir: string;
  /** Write a SKILL.md at `<dir>/<rel>/SKILL.md`. */
  skill: (rel: string, frontmatter: string, body?: string) => string;
  file: (rel: string, contents: string) => string;
  link: (from: string, to: string) => void;
  cleanup: () => void;
};

export function fixture(): Fixture {
  const dir = mkdtempSync(join(tmpdir(), "skill-cleaner-"));

  const file = (rel: string, contents: string) => {
    const path = join(dir, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
    return path;
  };

  return {
    dir,
    file,
    skill: (rel, frontmatter, body = "# Skill\n\nDo the thing.\n") =>
      file(join(rel, "SKILL.md"), `---\n${frontmatter}\n---\n\n${body}`),
    link: (from, to) => {
      mkdirSync(dirname(join(dir, from)), { recursive: true });
      symlinkSync(join(dir, to), join(dir, from));
    },
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/** A fixture root that counts as a repository, for the codebase-only rule. */
export function makeRepo(fx: Fixture, rel: string): string {
  const repo = join(fx.dir, rel);
  mkdirSync(join(repo, ".git"), { recursive: true });
  return repo;
}
