# skill-cleaner

Audits, consolidates and cleans up Agent Skills across every place they hide.

A skill registry rots quietly. Nothing throws. A skill with a broken name is
never offered, two skills with the same name silently become one, a copy made
six months ago keeps answering while the original gets all the edits, and a
skill that only exists in your home directory works perfectly right up until
someone else clones the repo. `skill-cleaner` finds all of that in about two
seconds and tells you which parts it can safely repair itself.

```bash
npx skill-cleaner audit
```

## What it does

```
skill-cleaner audit [roots...]              Report everything wrong, across every registry
skill-cleaner fix [roots...] --apply        Apply only the repairs with one correct outcome
skill-cleaner adopt <dir> --into <repo>     Move a homeless skill into a repo, link it back
```

With no roots it scans the current project, `~/.claude/skills`, and every
installed plugin. `--all-runtimes` adds `~/.agents`, `~/.codex`, `~/.opencode`
and `~/.gemini`. `--json` for machine output. Exit code 1 when errors remain, so
it drops straight into CI or a pre-commit hook.

## Why discovery is the hard part

Most of this tool is finding the skills. The checks are easy once you have them.

**Symlinks are the normal case, not an edge case.** The standard way to share
one skill library across many projects is to symlink it in. A `find` that does
not follow links reports *zero* skills for a fully symlinked registry: on the
registry this was built against, 156 skills looked like 0. So the walk follows
links, and then has to survive the consequence, which is that a link pointing at
its own ancestor makes the tree infinite. Every resolved directory is recorded
and never entered twice.

**Identity is the resolved path, never the path you arrived by.** The same
skill reached from four projects is one skill, not four. Deduplicating on the
real path collapses them while keeping every route it was reachable from, which
is what lets the report say *where* a conflict is visible from.

**A plugin is not a registry.** Installed plugins keep every version you have
ever had cached, and a marketplace checkout usually ships one mirror of each
skill per supported runtime. Counted naively, one plugin reported itself as 25
conflicting registrations of the same name. Only the newest cached version
counts, and marketplace checkouts are skipped entirely: they are what a plugin
is installed *from*, not what the runtime loads.

## Why the loader being forgiving is a trap

`description: Use when interacting with ClickUp: reading tasks` is not valid
YAML. A plain scalar cannot contain `: `. Claude Code takes it anyway.

So the skill works, and keeps working, until the day it is validated by anything
stricter (`skills-ref validate`, another runtime, a CI check) and abruptly does
not. Calling it fatal is wrong, because it runs fine today. Ignoring it is also
wrong. `skill-cleaner` recovers the fields the same forgiving way the runtime
does, keeps checking the rest of the skill, and reports it as
`frontmatter-lenient-yaml` — a warning that `fix` can repair by quoting the
value.

## Skills belong in a repository

A skill in `~/.claude/skills` cannot be reviewed, cannot be rolled back, does
not exist for anyone else, and disappears with the laptop. `outside-codebase`
reports it, and `adopt` repairs it:

```bash
skill-cleaner adopt ~/.claude/skills/my-skill --into ~/code/my-repo --apply
```

That moves the directory into `<repo>/.claude/skills/` and leaves a **relative**
symlink behind at the old path, so the skill keeps loading immediately while
becoming a reviewable file in a repository.

The check runs on the resolved path, which is what makes this workable: a
personal skill that is *already* a symlink into a checkout is correct and is not
reported. Personal and versioned are not opposites — the link is how you get
both.

## What it will not do

It will not merge two skills for you. Overlap is reported with a similarity
score and the paths; whether two adjacent skills should become one is a judgment
call about the work, not about the text, and the wrong guess is destructive and
hard to undo. Same for which side of a name collision wins.

`fix` only touches repairs with exactly one correct outcome:

| Finding | Repair |
| --- | --- |
| `frontmatter-lenient-yaml` | Quote the offending values |
| `name-dir-mismatch` | Set `name` to the directory name |
| `dangling-symlink` | Remove the dead link |

It is a dry run unless you pass `--apply`.

## Checks

**Fatal** — the skill does not work, or two of them collide.

`missing-frontmatter` · `frontmatter-unparseable` · `missing-name` ·
`missing-description` · `name-charset` · `name-too-long` · `name-hyphen-edge` ·
`name-double-hyphen` · `name-dir-mismatch` · `description-too-long` ·
`compatibility-too-long` · `body-empty` · `broken-reference` ·
`duplicate-name` · `outside-codebase` · `dangling-symlink`

**Warnings** — it works, but something will bite later.

`frontmatter-lenient-yaml` · `description-thin` · `description-no-trigger` ·
`description-first-person` · `unknown-field` · `metadata-not-flat` ·
`body-too-long` · `duplicate-copy` · `overlap`

Fields Claude Code reads but the cross-runtime spec omits (`argument-hint`,
`disable-model-invocation`, `user-invocable`, `model`) are accepted silently.
The point of `unknown-field` is catching `descriptoin:`, and calling legitimate
fields typos would bury the real ones.

## Development

```bash
pnpm install
pnpm test        # 77 tests
pnpm build
```

Built against the [Agent Skills specification](https://agentskills.io/specification),
and tuned against a real 264-skill registry — every threshold in here moved at
least once because of what that registry actually contained.

MIT.
