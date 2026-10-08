# Healing

Open this when a learning has no obvious home, when you retrofit a registry or when a file is over its
ceiling.

## Home of each fact

Specificity wins: the narrowest file whose job already covers it, since that's the one a reader
opens when it matters.

| The learning is about | Home |
| --- | --- |
| how one task is done | the skill for that task |
| a mechanical coding mistake (a pattern a parser can see) | a lint rule, hook or typecheck flag, never prose |
| a constraint every skill in a domain hits | a rule scoped to that domain |
| the repo's shape, commands, conventions | `CLAUDE.md` / `AGENTS.md` |
| an external system's behaviour | the skill that talks to it |
| a one-off about this conversation | nowhere |

A learning homed too high (one API's pagination in a root `CLAUDE.md`) costs every session.
A learning in 2 places: the copies drift and the reader can't tell which is current, so a second mention
becomes a pointer. A file that mirrors another opens by naming its source; update the source first.

## Leave alone

- A failure that was the model's fault and not the file's. The instruction was correct and clear, and a
  caveat only lengthens the file.
- A preference stated once. Wait for the second time.
- Anything the code already says. Document why this way, what was tried and abandoned, and
  which external system lies about itself. Grep the implementation before calling an entry
  unowned: 2 DepthFlow rules read homeless and were verbatim in `loop.ts`.

## Entries

Weak: "Be careful with the API rate limits." and "Fixed a bug in the upload path." (a
changelog). Strong: "The export endpoint returns 200 with an
empty body while the job runs, so a naive read stores an empty file and reports success. Poll
`status` until `complete` first." It names the symptom, the false signal and the action.

Format, newest first:
`- YYYY-MM-DD: <what went wrong or was assumed> <what to do instead>. [ask: <the ask that caused it>]`

An entry is one line of 240 characters at most, opening with the rule. The entry carries the rule and one checkable
anchor (the error string, the threshold, the flag); the story belongs in git. `heal.cjs log`
refuses longer (`--long` overrides). Keep the ask when a prompt caused the failure, because the
wording that broke the skill is the only input that proves the edit worked; `check` warns on a log
of 5 or more entries with none (on 5 Sep 2026 the field was absent from all 758 entries in 34 logs).

## The scaffold

1. A stated promise in the body that new failure modes get appended after each run, never in
   the description (preloaded into every session, and it says nothing about when to pick the skill).
2. The closing step names the command: "if this run surfaced a failure mode not already
   listed, append it with today's date". "Consider appending" reads as optional and gets skipped.
3. A verification item confirming it.
4. `## Learned Patterns` last in the file, seeded with real entries, never empty (an empty log
   teaches the reader to skip the section). Past a handful it moves to `references/learned-patterns.md`.

Retrofit only skills you're using, seeded with the failure that made you open the file
(`check --quiet` lists gaps); 60 at once makes 60 empty logs.

## Healing without bloat

- An edit leaves the file no longer than it found it, unless the case is really new.
- A learning repeated in 3 or more files becomes one rule, and the copies become pointers.
- An entry that hardened into how the body describes the work is folded into the body and deleted
  from the log. `fold` lists candidates but doesn't rewrite prose.
- Past 25 entries a log in `SKILL.md` is a second body: fold, don't raise the number. Once in
  `references/` the character count is the measure (130 one-line rules beat 25 paragraphs).
- There is no `learned-patterns-archive.md`. 15 of them reached 5,296 lines holding 67
  rules never folded anywhere; `review_skill.py` errors on one.

## Over the ceiling: restructure, don't shave

The author, 14 Sep 2026, watching a session shave sentences off `skool` to fit a new command under the
250-line cap: *"instead of trimming things just to refactor so that you just keep the essence and
key value"* and *"sometimes it's better to rework than to cut off, because you might lose value and
in what you keep there might be fluff"*. Read the whole body first and look for 3 shapes (all were in
`skool`):

- The same claim twice, in different words 3 lines apart; each edit read only its own paragraph.
- Several paragraphs on one subject, each ending with its own pointer to the same reference
  (5 on pushing a course, each "see classroom.md"). Make one section, keep the rules, one pointer.
- A rule whose evidence outgrew it. The incident belongs in the reference, the rule in the body.
  4 lines of what happened to 1 of what to do has the ratio backwards.

A restructure that doesn't end shorter hasn't found the fluff.

## Why one skill

Writing, healing, reorganising and cleaning share one floor. The author, 5 Sep 2026: *"merge skill
healer and skill creator into one. This is the easiest and most DRY solution."* 11 Sep: *"the skill
manager should take care of skill cleaning as well, so that we are more DRY and we don't have another
skill cleaner."* 14 Sep: *"the skill manager should take care of reorganizing, not just adding or
trimming."*
