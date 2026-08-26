# skill-cleaner checks

Why the discovery is shaped the way it is, and what every check code means.

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

**A skill's subtree belongs to the skill.** A SKILL.md nested inside a
directory that already has one is bundled material, not a registration: the
vercel plugin ships each skill's source under `<skill>/upstream/SKILL.md`, and
walking into it read one plugin as eleven collisions on the name `upstream`.
The walk stops at the first SKILL.md it finds on a branch.

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

## What a description is for decides what gets checked

A description exists so the model can match a task against it. A skill with
`disable-model-invocation: true` is never matched — only the human can call it —
so the trigger checks (`description-thin`, `description-no-trigger`,
`description-first-person`) do not run on it. Run against a public registry of
35 skills, those checks produced 19 findings; every one was a user-invoked
skill, and every one was noise. The spec limits still apply to everyone.

Two more platform rules land in the same "forgiving loader" family as the YAML
trap: a `name` containing `claude` or `anthropic` (`name-reserved-word`) and an
XML tag in the description (`description-xml-tags`). Claude Code loads both;
a claude.ai or API upload rejects both. Warnings, because they run fine today.

## Context is what a skill spends

Two checks come straight from the authoring guidance: once a SKILL.md loads,
every line competes with the conversation, and the prescribed fix for a long
skill is progressive disclosure, not trimming.

**`body-verbose`** is a body past 200 lines that names no bundled file at all —
a monolith paying for every detail on every load, with the split not even
started. It stops firing the moment detail moves into `references/`, whether
that file is linked or merely backticked: `dangling-bundled-path` already
treats a path named in prose as a real reference, and counting only markdown
links called a skill carrying five reference files a monolith. `body-too-long`
takes over at the spec's 500.

**`nested-reference`** is a reference file linking onward to a file SKILL.md
never links itself. That file now sits two levels deep, where it gets previewed
with a partial read instead of read. A backlink to SKILL.md is navigation and
does not count, and a skill reports this once with the offending files listed,
not once per file: a deliberately deep tree chains from many files for the same
reason, and a page of repeats trains the reader to ignore the rule. Only onward
links to markdown count. A reference file linking the `.tsx` it is teaching, a
fixture or an image is showing its work, and those get opened deliberately
rather than previewed.

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

## Rot that is not malformed

Everything above is about a skill being wrong on its own terms. The two checks
below are about a skill that parses perfectly and has quietly stopped being true,
which is the failure mode that costs the most and shows the least.

**`unknown-skill-reference`** is the routing equivalent of a dangling symlink. A
skill that says "pass the draft through the `voice-dna` skill" is issuing an
instruction, and when no `voice-dna` is registered anywhere, the instruction
still reads as authoritative and the step simply never happens. Skills that
delegate are exactly the ones where a rename three directories away goes
unnoticed. Only the `` `name` skill `` and `` skill `name` `` shapes count, and
the match is case-sensitive: skill names are lowercase by spec, and matching
loosely turns a pillar-code table (`` `S` Skill, `C` ClickUp ``) into a page of
findings. A plugin reference resolves by either `plugin:name` or `name`.

**`dangling-bundled-path`** is a skill naming a companion file in prose rather
than linking it. `broken-reference` only sees markdown links, so
"the ledger is `references/ledger.json`" made exactly the same promise and was
checked by nothing. The promise fails the same way.

This one is only judgeable against the whole registry, which is why it lives in
`analyze` and not in the per-skill rules. Skills quote each other's reference
files constantly, and against a single skill's own directory every one of those
reads as broken: the first cut of this check reported 48 findings on a real
registry and the overwhelming majority were a correct pointer at a sibling. So a
path that exists next to *any* scanned skill is a cross-reference and stays
quiet, whether or not that sibling ever mentions it. What survives is a file no
skill anywhere provides. The same registry then reported five, all real.

Both are warnings. The skill still loads and still does most of its job; what
has gone is one instruction inside it.

## What it will not do

It will not merge two skills for you. Overlap is reported with a similarity
score and the paths; whether two adjacent skills should become one is a judgment
call about the work, not about the text, and the wrong guess is destructive and
hard to undo. Same for which side of a name collision wins.

`fix` only touches repairs with exactly one correct outcome:

| Finding | Repair |
| --- | --- |
| `frontmatter-lenient-yaml` | Quote the offending values |
| `name-dir-mismatch` | Set `name` to the directory name, unless that name is taken |
| `dangling-symlink` | Remove the dead link |

It is a dry run unless you pass `--apply`.

That "unless" is load-bearing. `CLIs/umami` was named `umami-cli` next to an
`analytics/umami`, and aligning it to its directory turned a cosmetic warning
into a `duplicate-name` error, where the runtime keeps one and silently drops
the other. A repair that creates a worse finding is not a one-outcome repair,
so the finding is still reported and simply stops being offered as fixable.

## Checks

**Fatal** — the skill does not work, or two of them collide.

`missing-frontmatter` · `frontmatter-unparseable` · `missing-name` ·
`missing-description` · `name-charset` · `name-too-long` · `name-hyphen-edge` ·
`name-double-hyphen` · `name-dir-mismatch` · `description-too-long` ·
`compatibility-too-long` · `body-empty` · `broken-reference` ·
`duplicate-name` · `outside-codebase` · `dangling-symlink`

**Warnings** — it works, but something will bite later.

`frontmatter-lenient-yaml` · `description-thin` · `description-no-trigger` ·
`description-first-person` · `description-xml-tags` · `name-reserved-word` ·
`unknown-field` · `metadata-not-flat` · `body-too-long` · `body-verbose` ·
`nested-reference` · `duplicate-copy` · `overlap` · `unknown-skill-reference` ·
`dangling-bundled-path`

Fields Claude Code reads but the cross-runtime spec omits (`argument-hint`,
`disable-model-invocation`, `user-invocable`, `model`) are accepted silently.
The point of `unknown-field` is catching `descriptoin:`, and calling legitimate
fields typos would bury the real ones.
