---
name: skill-healer
description: "Use when a session teaches you something an instruction file should have known: a correction, a step that turned out to be stale, an approach that beat the documented one, or a failure that cost real time. Also use when a skill keeps repeating a mistake it already made, when setting up a registry so its skills learn from their own runs, or at the end of a session to write down what it taught. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: Requires Node 20 or later
tags: [makes, agents]
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
paragraph. The bar the edit has to clear is `skill-floor.md`, owned by the
`skill-creator` skill; read it when the edit runs to more than a sentence. Specific and specific. "Check dates carefully" teaches nothing.
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

1. **A stated promise** that the skill appends new failure modes to its own
   pattern list after each run. It goes in the body, not the description: every
   description in the registry is preloaded into every session, and this
   sentence tells the runtime nothing about when to pick the skill. Skills that
   still carry it in the description still pass the check.
2. **The closing step of the flow** reads: if this run surfaced a failure mode
   not already listed, append it to Learned Patterns with today's date.
3. **A verification item** confirming new patterns were appended.
4. **`## Learned Patterns`** last in the file, seeded with real entries from the
   run that motivated the skill. Never ship it empty; an empty log teaches the
   reader to skip the section.

Entry format, newest first:

```
- YYYY-MM-DD: <what went wrong or was assumed> <what to do instead>. [ask: <the ask that caused it>]
```

**One line, 240 characters, and it opens with the law.** A log is read before a run and paid for
in context every time, so the entry carries the rule and one checkable anchor - the error string,
the threshold, the flag - and nothing else. The story of the run belongs in the archive or in git.
`log` refuses a longer entry, because the only person who can say which sentence is the rule is
the one holding the run; `--long` overrides it.

**Keep the ask when a prompt caused the failure.** The lesson alone cannot be
retested: an edited file is believed rather than checked, and the same wording
that broke the skill once is the only input that proves the edit worked. Ten
words of the original ask is enough to re-run it later and read the result. Leave
the bracket off when the failure came from a tool or an API rather than a prompt.

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

Flags: `--json`, `--quiet`, `--date <YYYY-MM-DD>`, `--long`. `retrofit` and `log` are dry
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
- Past 25 entries a log still living in the `SKILL.md` has become a second body.
  That is the signal to fold, not to raise the number. Once the log has moved to
  `references/`, the count stops being the measure and the character does: 130
  one-line rules are cheaper to read than 25 paragraphs, and deleting a live rule
  to hit a number is the expensive mistake.
- A log lives in `references/learned-patterns.md`, never in the `SKILL.md`. A
  body is read in full on every invocation and a log is read on almost none.
- Past the ceiling the log splits in two rather than growing: one line per entry
  in `learned-patterns.md`, the entry as its run wrote it in
  `learned-patterns-archive.md`, and `SKILL.md` links both. `ai-cleaner`'s
  `split_log.py` does it. The rule is what a session needs before a run; the
  evidence is for when the rule is argued with.
- The split does not dry the log on its own. `split_log.py` moves the paragraph,
  it does not rewrite it: on 2026-09-02 the "one line per entry" side of six
  already-split logs still averaged 273 characters. Rewrite each line as the law
  after splitting, or the file is a second body with newlines in it.

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

- 2026-09-02: Grep the implementation before calling a log entry unowned, not only the skill's own references. Two DepthFlow rules read as homeless and were already verbatim in `loop.ts`, which is their real home.
- 2026-09-02: Splitting a log does not dry it. Six split logs still averaged 273 characters on the rule side; `log` now refuses an entry over 240 and `check` warns on the mean.
- 2026-09-02: Anchor a section rewrite on the heading at the start of a line. Partitioning on `## Learned Patterns` matched the scaffold list that names the heading and truncated 110 lines of body.
- 2026-08-26: Walk down until a directory owns a SKILL.md rather than looking one level under a root; `check ai-doc/skills` printed "No SKILL.md found" across 191 packaged skills.
- 2026-08-26: Count every entry shape and keep `raw` so a rebuild does not reformat somebody's log; a one-format regex reported eight logs holding 8 to 300 entries as empty.
- 2026-08-26: A read path and a write path that disagree about where the log lives will split it across two files in silence. `log` wrote to the body while `read` followed the link to `references/`.
- 2026-08-17: Scaffold parts that address the session already inside the skill go in the body; only what drives selection earns a place in the description, which is preloaded for every skill.
- 2026-08-17: Resolve every path with `readlink -f` before calling anything a duplicate. `find -type f` hides symlinks while `diff` and `wc` follow them.
- 2026-08-16: Check who reads a section, not just which file owns the fact. A rule filed under a repo-scoped heading was invisible to the sessions that caused two of its three failures.
- 2026-08-08: The closing step names the exact command to run. "Consider appending" reads as optional and gets skipped, so a skill with all four scaffold parts still never heals.
- 2026-08-08: Preserve the original quoting style when rewriting a frontmatter value, and never introduce a colon-space into an unquoted scalar.
- 2026-08-08: Check the log is the final section before appending to it, and report it when it is not, or entries attach to whatever follows.
- 2026-08-08: Rebuild a section from its parsed parts instead of splicing at a matched offset; a lookahead ending in `$` under `/m` matches end-of-line, not end-of-string.
- 2026-08-08: Normalise both sides before comparing a new entry to a stored one, or the same lesson logs twice on punctuation alone.
- 2026-08-08: Parse frontmatter values line by line, stopping at the next top-level key; a regex truncated a block-scalar description to its first line.
- 2026-08-08: Follow the link out of the Learned Patterns section before calling a log empty; three skills reported empty while holding 12, 28 and 62 entries.
- 2026-08-08: Match the commitment, not the sentence. Exact-wording checks on the scaffold read five honest skills as broken; keep the strictness for hedges like "consider appending".
- 2026-08-08: Insert new sections before the log heading when one exists, or `retrofit` pushes the log out of the last place it just checked for.
