# vibe-systems

Tools for keeping an agent setup honest.

Agent configuration rots in a specific way: it never fails loudly. A broken skill
is not reported, it is simply never offered. A duplicated name does not conflict,
one side just stops existing. Everything here exists to make that class of silent
failure visible, and to repair the parts of it that have exactly one correct
answer.

## Install

```
/plugin marketplace add heyramzi/vibe-systems
/plugin install vibe-systems@vibe-systems
```

Or clone it and point Claude Code at the directory.

## Skills

| Skill | Use when |
| --- | --- |
| [**skill-cleaner**](skills/skill-cleaner) | A skills registry feels messy: a skill that works some days and not others, one you wrote that never gets picked, duplicates, skills scattered across projects and home directories, or dead symlinks. |

More to come. Each skill is self-contained, carries its own reference material,
and ships a dependency-free script in `scripts/` so it works on a fresh clone.

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

MIT.
