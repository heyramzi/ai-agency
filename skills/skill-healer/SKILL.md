---
name: skill-healer
description: "Use when a session teaches you something an instruction file should have known: a correction, a step that turned out to be stale, an approach that beat the documented one, or a failure that cost real time. Also use when a skill keeps repeating a mistake it already made, when setting up a registry so its skills learn from their own runs, or at the end of a session to write down what it taught. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: Requires Node 20 or later
---

# Skill Healer

A registry decays in two directions. It accumulates, which is `skill-cleaner`'s
job. It also goes stale: a file keeps giving an instruction that stopped being
true, and every session that reads it pays again for the same wrong turn. This is
the second one.

The unit of repair is one file, edited in the session that learned the thing. A
learning that stays in the conversation is lost when the conversation ends, and
the next session makes the same mistake against the same unchanged file.

## The loop

Five steps, in order. Step 2 is the one that gets skipped, and skipping it is
what turns instruction files into archives nobody trusts.

**1. Find the owning file.** Every fact has exactly one home. Grep for where the
fact already lives before writing it anywhere. If it lives nowhere, the home is
the most specific file whose job it describes: a skill beats a rule beats a
root-level `CLAUDE.md` or `AGENTS.md`. Follow symlinks to their source, because a
registry projection is a copy and the next sync overwrites it.

**2. Delete what the learning contradicts.** The stale claim, the superseded
step, the example that no longer holds. A wrong sentence left standing outranks a
right sentence appended after it: instructions are read top to bottom and trusted
equally, so the reader has no way to know the later one won.

**3. Write the smallest edit that prevents a repeat.** Patch an existing file
rather than creating a new one, tighten a sentence rather than adding a
paragraph. Specific and specific. "Check dates carefully" teaches nothing.
"Buffer accepts a 600-character tweet and lets it die at send, so measure before
scheduling" prevents a repeat.

**4. Read it back.** Re-read the changed section. Confirm the frontmatter still
parses, the links still resolve, and nothing else in the file now contradicts the
edit.

**5. Retest in a cleared session.** Reading the edit back proves the file says the
right thing. It does not prove the file *changes what happens*, because this
session already knows the lesson and will comply with it whether or not the text
carries any weight. Run the task again with the context cleared and judge the
output. Where a full rerun is not worth it, the cheap version is to ask what the
file alone would produce, without leaning on the conversation. A heal that only
works in the session that wrote it has not landed. The full loop for this, and
the risk tiers that decide how hard to hold it, are in `skill-creator`.

## What counts as a learning

A correction from the user, an instruction that turned out to be wrong or stale,
an approach that clearly beat the documented one, or a failure that cost real
time. Not: a detail that only mattered to this conversation.

The test is whether the next session would do better for knowing it. If it would
not, the learning is conversation, not documentation.

## The failure log

Every skill keeps an append-only log about itself. A skill that repeats a mistake
it already made is a bug, and the fix is not a better model. It works because the
log lives inside the skill, so the next run reads it as instructions.

Four parts, all required. Three of them heal by accident: the promise with no log
has nowhere to write, and the log with no closing step is never written to.

1. **Frontmatter** states that the skill appends new failure modes to its own
   pattern list after each run. It goes in the description because the
   description is what gets read when deciding whether to load the skill.
2. **The closing step of the flow** reads: if this run surfaced a failure mode
   not already listed, append it to Learned Patterns with today's date.
3. **A verification item** confirming new patterns were appended.
4. **`## Learned Patterns`** last in the file, seeded with real entries from the
   run that motivated the skill. Never ship it empty; an empty log teaches the
   reader to skip the section.

Entry format, newest first:

```
- YYYY-MM-DD: <what went wrong or was assumed> <what to do instead>.
```

## Run it

No dependencies. Node 20 or later, nothing installed.

```bash
node scripts/skill-healer.cjs check
```

| Command | What it does |
| --- | --- |
| `check [paths...]` | Which skills carry the scaffold, which do not |
| `retrofit <skill> --apply` | Add the missing parts to one skill |
| `log <skill> "<entry>" --apply` | Append a dated entry, newest first |
| `fold <skill>` | Entries old enough to belong in the body instead |

Flags: `--json`, `--quiet`, `--date <YYYY-MM-DD>`. `retrofit` and `log` are dry
runs unless you pass `--apply`. Exit code is 1 when a skill is missing the
scaffold, so `check` drops into CI.

`log` refuses to write an entry the log already contains, so a run that
rediscovers a known failure does not double it.

## Healing is not accretion

The failure mode of this skill is instruction files that only ever grow until
nothing in them is load-bearing. A registry where every file is 400 lines of
accumulated caveats is not better documented, it is unreadable, and unreadable
is the same as undocumented.

- An edit should leave the file no longer than it found it, unless the learning
  is a really new case.
- A learning that repeats across three or more files becomes one rule, and the
  three copies become pointers to it.
- An entry that has hardened into how the body describes the work gets folded
  into the body and deleted from the log. The log records what the body does not
  yet say. `fold` lists the candidates; it does not rewrite prose, because which
  sentence absorbs the lesson is a judgment about the work.
- Past 25 entries the log has become a second body. That is the signal to fold,
  not to raise the number.

Detail on retrofitting an existing registry, and the SSOT rules that decide which
file owns a fact: [references/healing.md](references/healing.md).

## What it will not do

It does not decide what a session taught. Reading a transcript and naming the
learning is the judgment this skill exists to support, not something the script
guesses at. `check` tells you the log is empty; only you know what belongs in it.

It also does not merge or delete skills. Overlap, duplicate names and registry
budgets are `skill-cleaner`. Healing adds truth to one file; cleaning removes
files. Running healer on a bloated registry documents the bloat.

## Closing a run

If this run surfaced a failure mode not already listed, append it to Learned
Patterns with today's date before finishing:

```bash
node scripts/skill-healer.cjs log . "what was assumed, what to do instead" --apply
```

## Verification

- [ ] The owning file was edited, not the conversation
- [ ] What the learning contradicts was deleted, not left below the new text
- [ ] The file is no longer than it was, or the learning is a really new case
- [ ] Frontmatter still parses and links still resolve
- [ ] The heal was retested against a cleared context, not only re-read
- [ ] New failure modes from this run appended to Learned Patterns

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- 2026-08-17: Reported a fact as having two homes because two paths held it, without resolving either one; the first was a symlink to the second, so the registry was already single-source and the duplication did not exist. Resolve every path with readlink -f before calling anything a duplicate, and note that find -type f hides symlinks while diff and wc follow them.
- 2026-08-16: A rule was filed under a heading scoped to one repo, so it would only ever be read by sessions taking that path, while two of the three failures it describes came from sessions that never open the file. Check who reads the section, not just which file owns the fact, and place the general form where its audience already loads it.
- 2026-08-08: A skill can carry all four scaffold parts and still never heal, because the closing step said "consider appending" rather than naming the command. Hedged instructions read as optional and get skipped; the closing step names the exact command to run.
- 2026-08-08: Retrofitting a description by appending the promise sentence broke a plain YAML scalar whose value already contained `: `, which strict readers then rejected. Preserve the original quoting style when rewriting a frontmatter value, and never introduce a colon-space into an unquoted scalar.
- 2026-08-08: An append targeting the end of the file landed mid-document on skills where Learned Patterns was not the last section, silently attaching entries to whatever followed. Check that the log is the final section before writing to it, and report it when it is not.
- 2026-08-08: A lookahead ending in `$` under the /m flag matched end-of-line rather than end-of-string, so the lazy group before it matched nothing and every appended entry landed directly under the heading, above the prose introducing it. Rebuild the section from its parsed parts instead of splicing at a matched offset.
- 2026-08-08: Dedupe compared the caller's raw entry against stored text that had already been normalised with a trailing period, so the same lesson logged twice. Normalise both sides before comparing.
- 2026-08-08: Read a skill's description with a regex whose lookahead ended in $ under the /m flag, so a block-scalar description was truncated to its first line and a promise written on line four read as missing. Parse frontmatter values line by line, stopping at the next top-level key.
- 2026-08-08: Counted only the entries inside the Learned Patterns section, so three skills whose log had outgrown the body and moved to references/learned-patterns.md reported as empty while holding 12, 28 and 62 entries. Follow the link out of the section before calling a log empty.
- 2026-08-08: Matched the scaffold on exact wording: '## Learned Patterns' case-sensitively, 'if this run surfaced' literally, and 'appends new failure modes' with no room for a quantifier. Five honest skills read as broken. Match the commitment, not the sentence, and keep the strictness for hedges like 'consider appending'.
- 2026-08-08: retrofit appended its closing step and its Verification fallback to the end of the file, which on a skill that already had a log put both sections after it, so the next check reported the log as no longer last. Insert new sections before the log heading when one exists.
