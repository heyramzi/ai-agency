---
name: skill-cleaner
description: "Use when a skills registry feels messy or untrustworthy: a skill that seems to work some days and not others, a skill you wrote that never gets picked, duplicate or overlapping skills, skills scattered across projects and home directories, dead symlinks, or before publishing a skills repo. Also use when auditing SKILL.md frontmatter for spec compliance."
license: MIT
compatibility: Requires Node 20 or later
---

# Skill Cleaner

A skills registry fails silently. Nothing throws. A malformed name is never
offered, two skills sharing a name quietly become one, and a copy made months ago
keeps answering while the original gets every edit. This finds all of it.

## Run it

The bundled script has no dependencies. Node 20 or later, nothing installed.

```bash
node scripts/skill-cleaner.cjs audit
```

With no arguments it scans the current project, `~/.claude/skills`, and every
installed plugin. Exit code is 1 when errors remain, so it drops into CI.

| Command | What it does |
| --- | --- |
| `audit [roots...]` | Report everything wrong, across every registry |
| `fix [roots...] --apply` | Apply only the repairs with one correct outcome |
| `adopt <dir> --into <repo> --apply` | Move a homeless skill into a repo, link it back |

Flags: `--json`, `--quiet` (errors only), `--all-runtimes` (also scan
`~/.agents`, `~/.codex`, `~/.opencode`, `~/.gemini`), `--plain`.

`fix` and `adopt` are dry runs unless you pass `--apply`. Read the dry run first.

## Reading the output

Full list of check codes and what each one means: [references/checks.md](references/checks.md).

Start with these three, in this order. They are the ones that cost something.

**`duplicate-name`** is the only finding that silently changes behaviour. Two
skills registering the same name means the runtime keeps one and drops the rest,
and which one survives depends on load order. This is the answer when a skill
"works some days and not others".

**`outside-codebase`** is a skill whose resolved path is in no repository. It
cannot be reviewed, rolled back, or used on another machine. `adopt` moves it
into a repo and leaves a relative symlink at the old path, so it keeps loading
the moment the command finishes.

**`dangling-symlink`** is usually the cheapest and largest cleanup in the list.
Links left behind by a skill directory that was deleted months ago still sit in
the registry, still load, and return nothing.

Then two that catch a skill which parses perfectly and has stopped being true.
**`unknown-skill-reference`** is a body routing to a skill no registry provides.
An instruction to hand the draft to a named skill still reads as authoritative
after that name is gone. **`dangling-bundled-path`** is a companion file
named in prose rather than linked, so `broken-reference` never saw it. Both are
judged against the whole registry, because a skill quoting a sibling's reference
file is the normal case and not a fault.

## What it will not do

It reports overlapping skills with a similarity score and their paths, and then
stops. Whether two adjacent skills should become one is a judgment call about the
work they cover, and a wrong merge is destructive and hard to undo. Same for
which side of a name collision wins.

`fix` only touches the three findings with exactly one correct outcome: quoting
frontmatter that strict YAML rejects, aligning a name to its directory, and
removing dead links.

## Three things that surprise people

**A personal skill is fine if it is a symlink into a repository.** The
`outside-codebase` check runs on the resolved path, so linking a checkout into
`~/.claude/skills` passes. Personal and versioned are not a trade.

**Frontmatter that loads is not frontmatter that is valid.**
`description: Use when X: do Y` is invalid YAML, because a plain scalar cannot
contain `: `. Claude Code accepts it. Stricter readers do not. That is reported
as `frontmatter-lenient-yaml`, a warning rather than an error, and `fix` repairs
it by quoting the value.

**A user-invoked skill is not judged on its trigger.** With
`disable-model-invocation: true` the model never matches the description, so
`description-thin` and `description-no-trigger` do not run on it. On one public
registry that exemption dissolved 19 of 20 findings.

## Developing

```bash
pnpm install
pnpm test      # 112 tests
pnpm build     # typecheck, then rebuild scripts/skill-cleaner.cjs
```

The bundle in `scripts/` is committed on purpose, so the skill works on a fresh
clone with no install step. Rebuild it in the same commit as any source change.
