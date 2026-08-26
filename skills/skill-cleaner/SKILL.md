---
name: skill-cleaner
description: "Use when a skills registry feels messy or untrustworthy: a skill that seems to work some days and not others, a skill you wrote that never gets picked, duplicate or overlapping skills competing for the same task, skills scattered across projects and home directories, dead symlinks, or before publishing a skills repo. Also use when merging redundant skills down to one survivor, or when auditing SKILL.md frontmatter for spec compliance. Appends new failure modes to its own pattern list after each run."
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
| `consolidate [roots...] --apply` | Merge duplicates and overlaps down to one survivor each |
| `adopt <dir> --into <repo> --apply` | Move a homeless skill into a repo, link it back |

Flags: `--json`, `--quiet` (errors only), `--all-runtimes` (also scan
`~/.agents`, `~/.codex`, `~/.opencode`, `~/.gemini`), `--usage <path>`,
`--no-usage`, `--plain`.

Every writing command is a dry run unless you pass `--apply`. Read the dry run
first.

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

## Unused skills

Which skill is dead is the one question the files cannot answer, because
nothing in a SKILL.md records that it ran. The evidence comes from an
invocation ledger: `~/.claude/skill-usage.jsonl`, one JSON line per run,
appended by a Claude Code PostToolUse hook on the `Skill` and `Agent` tools
(`REDACTED/hooks/skill-usage.mjs`). Point somewhere else with
`--usage <path>`, or turn the check off with `--no-usage`.

**`never-used`** is a skill the ledger has never seen invoked. It is a warning,
never fixable, because the repair is a judgment: delete it, or repair the
description that fails to trigger it.

The ledger has to be older than 30 days before any of that is said. Under that,
one `usage-ledger-young` note replaces every verdict, since a young ledger
would report a seasonal skill as dead. Matching accepts the directory name and
the frontmatter `name`, because a skill is invoked by its directory while the
frontmatter is only a label. Plugin skills are exempt, as they are in the
authoring rules: deleting a vendor's skill is not your call.

## Consolidating

Two skills that answer the same question are worse than one, because the
runtime picks between them and you do not get to know which. `consolidate` cuts
each duplicate and overlap down to one survivor.

It resolves three things, in this order:

**Identical copies** become a link. One source keeps every future edit, and the
old path still loads, so nothing that referenced it breaks.

**Duplicate names and overlapping pairs** become a merge. The survivor is
picked by a rule you can predict rather than a heuristic that is usually right:
a skill inside a repository beats one that is not, a project skill beats a
vendored plugin copy, then the longer body, then the path. The loser's sections
that the survivor has no heading for are appended under a marker, and the loser
is deleted.

**Routing that named the loser** is repointed at the survivor, so a body reading
"hand this to the `x` skill" does not go on naming something that no longer
exists.

The marker is deliberate. Folding two documents into prose that reads as though
one person wrote it is the part a tool does badly, so it carries the material
across, says where it came from, and leaves that edit to you.

### The guard

`consolidate --apply` refuses to run when any repository it would touch has
uncommitted changes. That single rule is what makes an automatic merge
reasonable: the review is `git diff` and the undo is `git checkout .`, both
always available. A skill outside any repository is never merged at all, because
nothing there can be recovered. Run `adopt` on it first.

## What it will not do

`fix` only touches the findings with exactly one correct outcome: quoting
frontmatter that strict YAML rejects, aligning a name to its directory, and
removing dead links. It never merges; that is `consolidate`, behind its own
flag and its own guard.

Neither command writes the prose. `consolidate` moves sections and marks them;
deciding what the merged skill should say is the judgment it exists to set up.

Keeping a registry current as it teaches you things is a different job, and it
belongs to the `skill-healer` skill in this repo.

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
pnpm test      # 141 tests
pnpm build     # typecheck, then rebuild scripts/skill-cleaner.cjs
```

The bundle in `scripts/` is committed on purpose, so the skill works on a fresh
clone with no install step. Rebuild it in the same commit as any source change.

## Closing a run

If this run surfaced a failure mode not already listed, append it to Learned
Patterns with today's date before finishing:

```bash
node ../skill-healer/scripts/skill-healer.cjs log . "what was assumed, what to do instead" --apply
```

## Verification

- [ ] The dry run was read before `--apply`
- [ ] Every merge marker folded into the prose above it, then deleted
- [ ] `pnpm test` and `pnpm build` run in the same commit as any source change
- [ ] New failure modes from this run appended to Learned Patterns

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- 2026-08-08: A merge picked a survivor by lexicographic path when body length and location tied, which surprised a reader who expected the skill they had been editing to win. The tie-break is documented rather than made smarter, because a predictable rule beats an accurate one when the command deletes files.
- 2026-08-08: Overlap needs eight significant words in a description before a similarity score means anything, so short descriptions never pair no matter how identical they are. A registry of terse descriptions reports zero overlaps and looks clean while competing for the same triggers.
- 2026-08-08: Acting on every overlap finding in sequence moved a directory twice, because a skill named in two findings was already merged away by the first. Mark a skill consumed when an action claims it, and skip later findings that name it.
