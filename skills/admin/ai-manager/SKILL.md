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
An agent's `skills:` line is what it preloads whole at spawn, its few core skills. Any other skill
its body names, it calls through the Skill tool when it needs it. Preloading every named skill
is what gave `frontend-designer` 8 skills and 14.8k tokens at spawn. With nothing to preload, it's a
persona: give it a skill or delete it.

The `audit` command parses every frontmatter block with a real YAML parser and fails an agent
whose `skills:` names a missing skill or preloads more than 3. Run it in a pre-commit hook.

There are 5 principles. A skill comes from work done twice or a failure that cost real time, and never from a design. A skill that sets a bar ships the eval that holds it. The floor is one shared file, [skill-floor.md](references/skill-floor.md), and it's never restated. A finding names its pattern, quotes its evidence and says what in the repo makes it wrong: no pattern, no finding, and a clean shelf is a valid result. And you verify by outcome in a cleared session, never by reading the file back.

## The paths

Write when nothing covers it. Repair when something does and it's wrong, stale or silent
about what it just cost you. That's the common one, and a new file where an old one was wrong is
how a registry doubles without improving. Clean when the shelf is the problem.

| Command | Does | Open |
|---|---|---|
| `critique` | one verdict per skill and agent, plus every contradiction, dead fact and gate drift the pattern scan finds, then execute | [critique.md](references/critique.md), [consistency.md](references/consistency.md) |
| `audit` | run `vibekit doctor`, fix each failure at its source, re-run | above |
| `new [name]`, `agent [name]` | a skill from a run done twice, or an agent (or the finding it's a skill) | [creation-process.md](references/creation-process.md) |
| `heal [target]`, `log [skill]` | the 5-step loop below; one dated entry in a skill's log. With no target, drain the heal hooks' proposals first | [healing.md](references/healing.md#the-hooks-queue) |
| `trigger [skill]` | a description that fires wrong or not at all | [skill-floor.md](references/skill-floor.md#triggering) |
| `improve [skill]`, `review [target]` | run it and correct by outcome; the script, then the eight-dimension rubric | [review-rubric.md](references/review-rubric.md) |
| `clean [folder]` | measure registry and session context, merge, delete, simplify | [cleaning.md](references/cleaning.md), [context-budget.md](references/context-budget.md) |
| `package [skill]` | validate and zip for outside this workspace | `scripts/package_skill.py` |

With no argument: a correction is `heal`, something missing is `new`, bad names, overlap or two
files disagreeing is `critique`, size is `clean`, a broken agent link is `audit`. Heal continuously; critique and
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

Done when `audit` passes and every floor check has an answer.

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

Start with `audit` over the whole machine, because one folder looks clean while the panel lists
320 skills for a 60-skill source (7 Oct 2026). Its `contextCost`, `families` and `findings` are the
worklist. Then the descriptions pass widest first, agent triage, a merge of every overlapping pair,
and a simplification pass. Done when the registry is smaller or equal and `contextCost` is
reported before and after.

## The failure log

No skill needs a scaffold: the standing self-healing rule already tells every session to heal.
A lesson goes into the body as the fix. A skill keeps a `## Learned Patterns` log only when it
has real entries the body can't hold yet: last in the file, newest first, never empty, and
`audit` fails it otherwise. Format and entry length: [healing.md](references/healing.md). Append
with `node scripts/heal.cjs log <skill> "<entry>" --apply`, see what has hardened with `fold`, and
drain other sessions' lessons with `node scripts/heal-proposals.mjs pending`.

## Before it ships

Mechanical: `audit`. Judgment: the rubric in [review-rubric.md](references/review-rubric.md), when
a skill is about to ship or fires wrong. Then retest it in a cold session: a reread passes what a
cold run breaks.
## Closing a run

Every run, not only `clean`, ends with `audit`. A failure is fixed before you stop; a finding or a
warning goes in your report as a line offering a `clean`. Nothing else would ever tell the author the
shelf has grown. Log a failure mode this run surfaced with `heal.cjs log`.

## Verification

- [ ] Nothing existing covered 70% of it, and the search was run
- [ ] A repair deleted what the learning contradicts
- [ ] A clean reduced `contextCost`, and the floor's checks all have answers
- [ ] A standard-setting skill ships its eval, and a cleared-session retest ran
- [ ] `audit` exits 0, its findings are in the report, and the sync ran after it
- [ ] New failure modes appended to Learned Patterns

## Learned Patterns

What runs of this skill have taught it, newest first:
[references/learned-patterns.md](references/learned-patterns.md).

---

*Originates in Anthropic's skill-creator, Apache License 2.0.*
