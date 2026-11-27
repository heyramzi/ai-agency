---
name: ai-manager
description: "Writes, repairs and cleans skills and agents. Use when writing or editing a skill or agent, when one fires wrong, before it ships, or when the skill list holds duplicates or far more skills than the source."
author: "Anthropic"
license: Complete terms in LICENSE.txt
argument-hint: "[new|agent · heal · audit · clean] [target]"
tags: [makes, agents]
lane: judgment
---

# AI Manager

A skill is a slot every session pays for before the user asks anything, so the bar is "does this
still matter next to everything already here". Edit through this skill unprompted, even a small
change asked for in passing (4 Oct 2026). Every source lives in the kit's `ai-doc/`; the
`.claude/` and `.agents/` trees are projections the next sync overwrites.

## The architecture

A skill is found by its description: every session sees all of them and there's no router agent.
An agent's `skills:` line is what it preloads whole at spawn, at most `agentMaxPreloads` of its
core skills. Any other skill its body names, it calls through the Skill tool when it needs it.
Preloading every named skill gave `frontend-designer` 8 skills and 14.8k tokens at spawn. An agent
with nothing to preload is a persona: give it a skill or delete it.

The `audit` command parses every frontmatter block with a real YAML parser and fails an agent
whose `skills:` names a missing skill or preloads more than 3. Run it in a pre-commit hook.

5 principles. A skill comes from work done twice or a failure that cost real time, never from a
design. A skill that sets a bar ships the eval that holds it. The floor is one shared file,
[skill-floor.md](references/skill-floor.md), never restated. A finding names its pattern, quotes
its evidence and says what in the repo makes it wrong: no pattern, no finding, and a clean shelf
is a valid result. You verify by outcome in a cleared session, never by reading the file back.

## The 4 commands

| Command | When | Open |
|---|---|---|
| `new [name]`, `agent [name]` | nothing covers it (search first: a 70% match means `heal` that one) | [contract.md](references/contract.md), [creation-process.md](references/creation-process.md) |
| `heal [target]` | a correction, a stale line, a cost the file was silent about, a skill that fires wrong or does worse than it should. No target: drain the hooks' queue | [healing.md](references/healing.md), [review-rubric.md](references/review-rubric.md), [triggering](references/skill-floor.md#triggering) |
| `audit` | mechanical: `bun run vibekit doctor` from the kit's `CLIs/`, fix each failure at its source, re-run | none |
| `clean [folder]` | the shelf is the problem: duplicates, bad names, two files ruling differently, size | [cleaning.md](references/cleaning.md), which opens [critique.md](references/critique.md), [consistency.md](references/consistency.md) and [context-budget.md](references/context-budget.md) |

Heal is the common one: a new file where an old one was wrong is how a registry doubles without
improving. Heal continuously; clean as a pass over the whole tree. One project's look (a value
The author corrected on a screen) isn't a skill fix: it goes to that repo's `DESIGN.md` through
`ui-design`'s `references/design-taste.md`. Zipping a skill for outside this workspace is
`scripts/package_skill.py`.

## new

1. Read [contract.md](references/contract.md), then grep skill and agent descriptions and
   `scripts/` for the topic.
2. Work down the ladder in contract.md (architecture, then a lint or CI gate, then a skill) and
   say in a line why 1 and 2 can't hold it.
3. The kind (Procedure, Judgment, Interface, Context) decides what the body holds:
   [creation-process.md](references/creation-process.md). A Judgment skill writes its eval first.
4. Write the scripts, references and assets first (`scripts/init_skill.py <name> --path <dir>`),
   then the body last, as a router, after opening [skill-floor.md](references/skill-floor.md).

Done when `audit` passes and every floor check has an answer.

## heal

1. Find the owning file. Grep for where the fact lives and follow symlinks to the source.
2. Delete what the learning contradicts. A wrong sentence left standing outranks a right one
   appended after it.
3. Write the smallest edit that prevents a repeat, patched into an existing file. "Buffer
   accepts a 600-character tweet and lets it die at send" prevents one; "check lengths" doesn't.
4. Read it back: frontmatter parses, links resolve, no gate the skill ships contradicts it.
5. Retest in a cleared session, since this one already knows the lesson. Loop and stop rule:
   [review-rubric.md](references/review-rubric.md).

A learning is a correction, a stale instruction, an approach that beat the documented one, or a
failure that cost real time. An edit leaves the file no longer than it found it; over the ceiling,
restructure, don't shave ([healing.md](references/healing.md)). A lesson goes into the body as the
fix. A `## Learned Patterns` log exists only while it holds real entries the body can't take yet
(format and limits: healing.md); append with `node scripts/heal.cjs log <skill> "<entry>" --apply`
and drain other sessions' lessons with `node scripts/heal-proposals.mjs pending`.

## clean

Start with `audit` over the whole machine, because one folder looks clean while the panel lists
twice the source (7 Oct 2026, and again on 27 Nov 2026 through `kit/`). Its `contextCost`,
`families` and `findings` are the worklist. Then follow [cleaning.md](references/cleaning.md):
descriptions widest first, agent triage, a merge of every overlapping pair, a simplification pass.
Done when the registry is smaller or equal and `contextCost` is reported before and after.

## Closing every run

1. `audit` exits 0. A failure is fixed before you stop; a finding or warning goes in the report as
   a line offering a `clean`, since nothing else tells the author the shelf has grown.
2. Sync: `bun run vibekit sync <repo>` from the kit's `CLIs/`, per repo you changed. A repo whose `vibekit.json` doesn't list the skill answers `Unknown skill`.
3. A shipped or misfiring skill gets the rubric and a cold-session retest: a reread passes what a
   cold run breaks.

## Verification

- [ ] The search ran, and nothing existing covered 70% of it
- [ ] A repair deleted what the learning contradicts
- [ ] A clean reduced `contextCost`; a standard-setting skill ships its eval
- [ ] `audit` exits 0, its findings are in the report, and the sync ran after it

---

*Originates in Anthropic's skill-creator, Apache License 2.0.*
