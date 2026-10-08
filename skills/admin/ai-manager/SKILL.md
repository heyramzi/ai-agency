---
name: ai-manager
description: "Writes, repairs and cleans skills and agents. Use when writing or editing a skill or agent, when one fires wrong, before it ships, or when the skill list holds duplicates or far more skills than the source."
author: "Anthropic"
license: Complete terms in LICENSE.txt
argument-hint: "[critique · audit · new|agent · trigger|improve · heal|log · clean · review|package] [target]"
tags: [makes, agents]
lane: judgment
---

# AI Manager

Instruction files: use [writing-for-agents.md](references/writing-for-agents.md) to prune no-ops and disclose task-specific reference.
A skill is a slot every session pays for before the user asks anything, so the bar is "does this
still matter next to everything already here". Edit through it unprompted, even a small change
asked for in passing (4 Oct 2026): source in `vibe-kit/ai-doc`, log, audit.

## The architecture, and the gate that holds it

A skill is found by its description; every session sees all of them and there's no router agent.
An agent's `skills:` line is what it preloads whole at spawn, 1 to 3 core skills. Any other skill
its body names, it calls through the Skill tool when it needs it (sub-agents docs, read 4 Oct
2026). Until then the old rule made every agent preload every skill it named, and
`frontend-designer` started with 8 skills and 14.8k tokens. With nothing to preload, it's a
persona: give it a skill or delete it.

The `audit` command parses every frontmatter block with a real YAML parser and fails an agent
whose `skills:` names a missing skill or preloads more than 3. Run it in a pre-commit hook.

There are 4 principles. A skill comes from work done twice or a failure that cost real time, and never from a design. A skill that sets a bar ships the eval that holds it. The floor is one shared file, [skill-floor.md](references/skill-floor.md), and it's never restated. And you verify by outcome in a cleared session, never by reading the file back.

## The paths

Write when nothing covers it. Repair when something does and it's wrong, stale or silent
about what it just cost you. That's the common one, and a new file where an old one was wrong is
how a registry doubles without improving. Clean when the shelf is the problem.

| Command | Does | Open |
|---|---|---|
| `critique` | one verdict per skill and agent against the philosophy, then execute | [critique.md](references/critique.md) |
| `audit` | run the gate, fix each failure at its source, re-run | above |
| `new [name]`, `agent [name]` | a skill from a run done twice, or an agent (or the finding it's a skill) | [creation-process.md](references/creation-process.md) |
| `heal [target]`, `log [skill]` | the 5-step loop below; one dated entry in a skill's log | [healing.md](references/healing.md) |
| `trigger [skill]` | a description that fires wrong or not at all | [skill-floor.md](references/skill-floor.md#triggering) |
| `improve [skill]`, `review [target]` | run it and correct by outcome; the script, then the eight-dimension rubric | [review-rubric.md](references/review-rubric.md) |
| `clean [folder]` | measure registry and session context, merge, delete, simplify | [cleaning.md](references/cleaning.md), [context-budget.md](references/context-budget.md) |
| `package [skill]` | validate and zip for outside this workspace | `scripts/package_skill.py` |

With no argument: a correction is `heal`, something missing is `new`, bad names or overlap is
`critique`, size is `clean`, a broken agent link is `audit`. Heal continuously; critique and
clean as a pass over the whole tree.

## Setup, before writing

1. Search first. Read [contract.md](references/contract.md), then grep skill and agent
   descriptions and `scripts/` for the topic. A 70% match means strengthen that.
2. Open the one reference that owns the request, and [skill-floor.md](references/skill-floor.md)
   right before writing a body.

## Writing

The kind (Procedure, Judgment, Interface, Context) names what the reader is doing when they open
the file and decides what the body holds: [creation-process.md](references/creation-process.md).
A skill is the third-best fix: work down the ladder in [contract.md](references/contract.md)
(architecture, then a lint or CI gate, then a skill) and say in a line why 1 and 2 can't hold it.
Write the scripts, references and assets first, since they decide what the body says
(`scripts/init_skill.py <name> --path <dir>`). A Judgment skill writes its eval before the body.
The body is last, a router, in the directory that names the slash command.

Done when `review_skill.py` has no errors and every floor check has an answer.

## Repairing

1. Find the owning file. Grep for where the fact lives; follow symlinks to the source, since a
   projection is a copy the next sync overwrites.
2. Delete what the learning contradicts. A wrong sentence left standing outranks a right one
   appended after it.
3. Write the smallest edit that prevents a repeat, patched into an existing file. "Buffer
   accepts a 600-character tweet and lets it die at send" prevents one; "check lengths" doesn't.
4. Read it back. Frontmatter parses, links resolve and no gate the skill ships contradicts it.
5. Retest in a cleared session. This session already knows the lesson and complies
   regardless. Loop and stop rule: [review-rubric.md](references/review-rubric.md).

A learning is a correction, a stale instruction, an approach that beat the documented one, or a
failure that cost real time. An edit leaves the file no longer than it found it; over the ceiling,
restructure it and don't shave ([healing.md](references/healing.md)).

## Cleaning

Start with the whole machine, because one folder looks clean while the panel lists 320 skills
for a 60-skill source (7 Oct 2026):

```bash
cd ~/Studio/vibe-kit/CLIs && pnpm --silent vibekit doctor   # copies, orphans, dead trees, sessionVisible
python3 scripts/context_cost.py <folder>    # counts, metadata cost, every violation
python3 scripts/dead_pointers.py <folder>   # routes into assets that no longer exist
```

Then the descriptions pass widest first, agent triage, a merge of every overlapping pair, and a
simplification pass. Done when the registry is smaller or equal and metadata is reported before
and after.

## The failure log

A skill keeps an append-only log about itself, because the next run reads it as instructions.
The log has 4 parts: the stated promise in the body, the closing step, a verification item, and
`## Learned Patterns` last, seeded with real entries. Format and the 240-character law:
[healing.md](references/healing.md). Node 20+ and Python 3, nothing installed:

```bash
node scripts/heal.cjs check [paths...]         # which skills carry the scaffold (exits 1 if not)
node scripts/heal.cjs retrofit <skill> --apply # add the missing parts
node scripts/heal.cjs log <skill> "<entry>" --apply
node scripts/heal.cjs fold <skill>             # entries that belong in the body now
```

`retrofit` and `log` are dry runs without `--apply`.

## Before it ships

Mechanical, free: `scripts/review_skill.py` checks frontmatter, name, description, body size,
dead links, unreachable references and scripts an agent can't drive; exits 1 on an error.
Judgment: the rubric in [review-rubric.md](references/review-rubric.md), when a skill is about
to ship or fires wrong. A cold Sonnet session on the rewritten `humanizer` broke it on 4 points
a reread had passed.


## Closing a run

Every run, not only `clean`, ends with `pnpm --silent vibekit doctor` from `CLIs/`. Any finding,
or `sessionVisible` above twice `sourceSkills`, goes in your report as a line offering a `clean`.
Nothing else would ever tell the author the shelf has grown.

If this run surfaced a failure mode not already listed, log it before finishing:
`node scripts/heal.cjs log . "what was assumed, what to do instead" --apply`.

## Verification

- [ ] Nothing existing covered 70% of it, and the search was run
- [ ] A repair deleted what the learning contradicts
- [ ] A clean reduced metadata, and `dead_pointers.py` reports none
- [ ] The floor's checks all have answers, and a standard-setting skill ships its eval
- [ ] `review_skill.py` has no errors, and a cleared-session retest ran
- [ ] `audit` passes and the sync ran after it
- [ ] `vibekit doctor` ran and its findings are in the report
- [ ] New failure modes appended to Learned Patterns

## Learned Patterns

What runs of this skill have taught it, newest first:
[references/learned-patterns.md](references/learned-patterns.md).

---

*Originates in Anthropic's skill-creator, Apache License 2.0.*
