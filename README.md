# vibe-systems

Tools for keeping an agent setup honest.

Agent configuration rots in a specific way: it never fails loudly. A broken skill
is not reported, it is simply never offered. A duplicated name does not conflict,
one side just stops existing. Everything here exists to make that class of silent
failure visible, and to repair the parts of it that have exactly one correct
answer.

## Start here

Fork it. This repo is a base to build your own kit on, not a library to depend
on. Add your skills under `skills/`, keep the two that ship with it, and they
keep the rest honest as the registry grows.

```
/plugin marketplace add heyramzi/vibe-systems
/plugin install vibe-systems@vibe-systems
```

Or clone it and point Claude Code at the directory.

## The two failure modes

A skills registry decays in two directions at once, and the fixes pull against
each other. Keeping them as separate skills on separate cadences is the point.

| Skill | Direction | Cadence | Use when |
| --- | --- | --- | --- |
| [**skill-cleaner**](skills/skill-cleaner) | Subtractive | Scheduled | Duplicates and overlapping skills compete for the same task, a skill works some days and not others, skills are scattered across projects and home directories, or links are dead |
| [**skill-healer**](skills/skill-healer) | Additive | Per session | A session taught you something a file should have known, or a skill keeps repeating a mistake it already made |

**It accumulates.** Every skill you add competes with the others for the same
triggers. Past a certain size the model is not choosing the right skill, it is
choosing between four that all look right, and you cannot tell which one it
picked. `skill-cleaner` merges those down to one survivor each, behind a git
guard so a bad merge is one command to undo.

**It goes stale.** A file keeps giving an instruction that stopped being true,
and every session pays again for the same wrong turn. `skill-healer` writes the
lesson into the file that should have known it, in the session that learned it,
and deletes what the lesson contradicts.

Run them on the same cadence and they fight: one pass adding caveats while
another removes them. Heal continuously, clean on a schedule, and let the clean
pass fold in what the heal passes accumulated.

## Layout

```
.claude-plugin/
  marketplace.json      this repo as a marketplace
  plugin.json           this repo as a plugin
skills/
  <skill-name>/
    SKILL.md            frontmatter and instructions
    references/         detail loaded only when needed
    scripts/            executables, committed, no install step
```

Each skill is self-contained, carries its own reference material, and ships a
dependency-free script so it works on a fresh clone. Node 20 or later, nothing
installed.

## Checking your own fork

Both tools run against this repo, and against each other. That is the intended
way to use them on your own:

```bash
node skills/skill-cleaner/scripts/skill-cleaner.cjs audit skills
node skills/skill-healer/scripts/skill-healer.cjs check skills
```

Both exit non-zero when something is wrong, so they drop into CI as-is.

MIT.
