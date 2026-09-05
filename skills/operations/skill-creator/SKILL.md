---
name: skill-creator
description: "Writes, repairs and reviews skills and agents: the shape one takes, the description that makes it fire, the quality floor, and the failure log that stops it repeating a mistake. Use when writing or editing one, when it fires wrong, before it ships, or when a session teaches you what a file missed."
license: Complete terms in LICENSE.txt
argument-hint: "[new|agent · trigger|improve · heal|log · review|package] [target]"
tags: [makes, agents]
---

# Skill Creator

Every skill and every agent in this workspace is written through this file, and repaired through
it. A skill is a slot in a registry that every session pays for before the user asks anything, so
the bar is not "is this useful" but "does this earn its place against everything already here".

**Writing one and healing one are the same skill.** They were two until 5 Sep 2026, and the split
cost more than it bought: both wrote against the same floor, each opened by routing to the other,
and the closing step of one was a command in the other. One file, one log, one CLI.

Three principles carry the rest.

- **Extraction, not design.** A skill comes out of work already done twice. That run is the spec
  and its transcript is the first draft. A planning session that asks what skills should exist
  produces files nobody triggers. The same rule governs a repair: a learning comes out of a
  failure that cost real time, not out of a review of what a file might say better.
- **The floor is shared.** [references/skill-floor.md](references/skill-floor.md) holds the quality
  bar, and `ai-cleaner` writes against the same one. A standard restated in three places is three
  standards by the end of the quarter.
- **Verified by outcome in a cleared session.** A skill is proven by running the task again with
  the context cleared, not by reading the file back. Everything else is a proxy, and a heal that
  works only in the session that wrote it has not landed.

## The two paths

**Write** when nothing covers the request. **Repair** when something does and it is wrong, stale,
or silent about what it just cost you. Repair is the common one, and reaching for a new file when
an existing one was wrong is how a registry doubles without getting better.

| Command | Path | Does | Reference |
|---|---|---|---|
| `new [name]` | Write | A skill out of a run already done twice | [creation-process.md](references/creation-process.md) |
| `agent [name]` | Write | An agent, or the finding that it should be a skill | [agent-contract.md](references/agent-contract.md) |
| `heal [target]` | Repair | The five-step loop below, on the file that should have known | [healing.md](references/healing.md) |
| `log [skill]` | Repair | Append one dated failure mode to a skill's own log | below |
| `trigger [skill]` | Repair | A description that fires on the wrong prompts or not at all | [triggering.md](references/triggering.md) |
| `improve [skill]` | Repair | Run it, judge the output, correct the file, retest cleared | [evaluating.md](references/evaluating.md) |
| `review [target]` | Judge | The mechanical script, then the eight-dimension rubric | [review-rubric.md](references/review-rubric.md) |
| `package [skill]` | Ship | Validate and zip for distribution outside this workspace | `scripts/package_skill.py` |

With no argument, pick the path from what the conversation already shows: a correction or a cost
is `heal`, a request for something that does not exist is `new`. Never start writing a skill on an
implied request.

**Overlap, duplicate names, a registry over budget, a body to split: that is `ai-cleaner`.**
Cleaning removes files and shrinks the ones that stay; this skill adds truth to one file and
writes new ones. Heal continuously, clean on a schedule.

## Setup, before writing anything

1. **Search first.** Read [references/contract.md](references/contract.md), then grep the skill and
   agent descriptions for the topic. If something covers 70% of the request, strengthen it instead.
   Search `scripts/` directories too: a capability already shipped as a script reads as a missing
   skill.
2. **Load the one reference that owns the request** from the table above. For anything else, this
   file is enough.
3. **Load [references/skill-floor.md](references/skill-floor.md) immediately before writing or
   rewriting a body.** It carries the quality bar, the shapes to refuse, and the reflexes no script
   catches. Do not load it for planning-only work.

## The four kinds

The kind names what the reader of the finished file is doing when they open it, and it decides what
the body contains: **Procedure** (a sequence with gates and recovery), **Judgment** (a quality floor
and a list of refusals), **Interface** (exact invocations and the traps), **Context** (values a
model cannot hold, and where they live). Pick from what the reader needs, not from the topic; a
skill that names a CLI is still Judgment if the hard part is deciding what to run. How each one
fails: [references/creation-process.md](references/creation-process.md).

## Writing a file

Work down this order and stop at the first level that ends the problem, because each level removes
the failure instead of describing it.

1. **Architecture.** Change the code or the data so the mistake cannot be expressed.
2. **A lint rule, a test, or a CI gate.** The agent hits it and fixes it before reporting back.
3. **A skill or a rule.** Only now, and best on the process around the code rather than a list of
   things not to do inside it.
4. **A human in the loop.** You should not get here.

When a skill is still the answer, name in one line why levels 1 and 2 cannot hold it.

Then: start with the reusable parts (`scripts/`, `references/`, `assets/`), because they decide
what the body has to say. Write the body last, as a router. Initialise with
`scripts/init_skill.py <name> --path <dir>` and delete the example files it leaves behind.
Placement, naming and the reconcilers belong to [references/contract.md](references/contract.md).
The one thing worth carrying here: the directory name is the slash command, so name the directory
what should be typed.

## Repairing a file

Five steps, in order. Step 2 is the one that gets skipped, and skipping it is what turns
instruction files into archives nobody trusts.

**1. Find the owning file.** Every fact has exactly one home. Grep for where the fact already lives
before writing it anywhere. If it lives nowhere, the home is the most specific file whose job it
describes: a skill beats a rule beats a root-level `CLAUDE.md` or `AGENTS.md`. Follow symlinks to
their source, because a registry projection is a copy and the next sync overwrites it.

**2. Delete what the learning contradicts.** The stale claim, the superseded step, the example that
no longer holds. A wrong sentence left standing outranks a right sentence appended after it:
instructions are read top to bottom and trusted equally, so the reader has no way to know the later
one won.

**3. Write the smallest edit that prevents a repeat.** Patch an existing file rather than creating
a new one, tighten a sentence rather than adding a paragraph. Specific, and specific about the
consequence. "Check dates carefully" teaches nothing. "Buffer accepts a 600-character tweet and
lets it die at send, so measure before scheduling" prevents a repeat.

**4. Read it back.** Confirm the frontmatter still parses, the links still resolve, and nothing
else in the file now contradicts the edit.

**5. Retest in a cleared session.** Reading the edit back proves the file says the right thing. It
does not prove the file *changes what happens*, because this session already knows the lesson and
will comply with it whether or not the text carries any weight. Run the task again with the context
cleared and judge the output. Where a full rerun is not worth it, ask what the file alone would
produce, without leaning on the conversation.

**What counts as a learning:** a correction from the user, an instruction that turned out to be
wrong or stale, an approach that clearly beat the documented one, or a failure that cost real time.
Not a detail that only mattered to this conversation. The test is whether the next session would do
better for knowing it. Which file owns a fact, what not to heal, and worked entries good and bad:
[references/healing.md](references/healing.md).

## The failure log

Every skill keeps an append-only log about itself. A skill that repeats a mistake it already made
is a bug, and the fix is not a better model. It works because the log lives inside the skill, so
the next run reads it as instructions.

Four parts, all required. Three of them heal by accident: the promise with no log has nowhere to
write, and the log with no closing step is never written to.

1. **A stated promise** in the body that the skill appends new failure modes after each run. Not in
   the description: every description is preloaded into every session, and this sentence tells the
   runtime nothing about when to pick the skill.
2. **The closing step of the flow** reads: if this run surfaced a failure mode not already listed,
   append it to Learned Patterns with today's date.
3. **A verification item** confirming new patterns were appended.
4. **`## Learned Patterns`** last in the file, seeded with real entries. Never ship it empty; an
   empty log teaches the reader to skip the section. Past a handful it moves to
   `references/learned-patterns.md`, because a body is read in full on every invocation and a log
   is read on almost none.

Entry format, newest first:

```
- YYYY-MM-DD: <what went wrong or was assumed> <what to do instead>. [ask: <the ask that caused it>]
```

**One line, 240 characters, opening with the law.** A log is paid for in context on every run, so
the entry carries the rule and one checkable anchor (the error string, the threshold, the flag) and
nothing else. The story belongs in git. `heal.cjs log` refuses a longer entry; `--long` overrides.

**Keep the ask when a prompt caused the failure**, and `check` counts them, because this field died
once already: on 5 Sep 2026 it was absent from all 758 entries in all 34 logs, written as optional
and enforced by nothing. An edited file is believed rather than checked, and the wording that broke
the skill is the only input that proves the edit worked. A log of 5 or more entries with no ask
anywhere now warns.

Ship the scaffold only when the run that motivated the skill already produced real failures to seed
it with.

## Run it

Node 20 or later and Python 3, nothing installed.

```bash
node scripts/heal.cjs check [paths...]         # which skills carry the scaffold
node scripts/heal.cjs retrofit <skill> --apply # add the missing parts to one
node scripts/heal.cjs log <skill> "<entry>" --apply
node scripts/heal.cjs fold <skill>             # entries that belong in the body now
python3 scripts/review_skill.py <dir-or-tree>  # the mechanical pass
```

`retrofit` and `log` are dry runs without `--apply`. `log` refuses an entry the log already holds,
so a run that rediscovers a known failure does not double it. `check` exits 1 when a skill is
missing the scaffold, so it drops into CI; the ask and length findings are warnings and do not.

## Before it ships

Two passes, in order, and the first one is free.

**Mechanical.** `review_skill.py` checks what needs no opinion: frontmatter against the published
ceilings, name against directory, description length and person, body size, dead links, references
nothing can reach, scripts an agent cannot drive, and the floor checks a script can see. Takes a
whole tree, exits 1 on any error. `--json`, `--quiet`.

**Judgment.** [references/review-rubric.md](references/review-rubric.md) scores the eight
dimensions a script cannot. Read it when a skill is about to ship, when one keeps getting picked
for the wrong prompt, or when its output changes between sessions.

Neither replaces the cleared-session retest. A skill can score 40 and still fail the only test that
matters.


## Healing is not accretion

The failure mode of this skill is instruction files that only ever grow until nothing in them is
load-bearing. An edit should leave the file no longer than it found it, a learning repeated across
three files becomes one rule and two pointers, and an entry that has hardened into the body gets
folded out of the log. The five rules that hold that line, including why there is no
`learned-patterns-archive.md`, are in [references/healing.md](references/healing.md).

## Closing a run

If this run surfaced a failure mode not already listed, append it to Learned Patterns with today's
date before finishing. A learning that stays in the conversation is lost when the conversation
ends. This skill appends new failure modes to its own pattern list after each run.

```bash
node scripts/heal.cjs log . "what was assumed, what to do instead" --apply
```

## Verification

- [ ] Nothing existing covered 70% of it, and the search that established that was run
- [ ] For a repair: what the learning contradicts was deleted, not left below the new text
- [ ] The floor was loaded before the body was written, and every check answers
- [ ] `review_skill.py` reports no errors
- [ ] Retested in a cleared session, rather than read back
- [ ] Synced, and the lead tables reconcile
- [ ] New failure modes from this run appended to Learned Patterns

## Learned Patterns

What runs of this skill have taught it, newest first:
[references/learned-patterns.md](references/learned-patterns.md).

---

*Originates in Anthropic's skill-creator, Apache License 2.0.*
