# Healing detail

## Contents

- Deciding which file owns a fact
- Retrofitting a registry
- What not to heal
- Worked examples
- Healing is not accretion
- Cadence

Loaded when a learning does not have an obvious home, or when retrofitting a
registry that was never written to heal.

## Deciding which file owns a fact

Specificity wins. The home is the narrowest file whose job already covers the
fact, because that is the file a reader consults when the fact matters.

| The learning is about | Home |
| --- | --- |
| How one task is performed | The skill that performs it |
| A constraint every skill in a domain hits | A rule scoped to that domain |
| The shape of the repo, its commands, its conventions | `CLAUDE.md` / `AGENTS.md` |
| An external system's behaviour | The skill that talks to that system |
| A one-off about this conversation | Nowhere. Let it go. |

Two failure modes when placing a fact:

**Writing it too high.** A detail about one API's pagination in a root
`CLAUDE.md` is read by every session that touches the repo and matters to almost
none of them. Cost is paid on every load, value is collected once.

**Writing it in two places.** The same fact in two files will drift, and the
reader cannot tell which copy is current. Second mentions become pointers to the
home, not restatements.

A file that intentionally reflects another opens by saying so and naming its
source. Update the source first, then the mirror.

## Retrofitting a registry

Opportunistic beats systematic. Adding the scaffold to 60 skills in one pass
produces 60 empty logs, and an empty log is worse than none: it looks like the
skill has nothing to teach when the truth is nobody has written it down.

The order that works:

1. `check --quiet` to see what is missing across the registry.
2. Retrofit the skills you actually use, when you next use them, seeding each
   log with the failure that made you open the file.
3. Leave the rest. A skill nobody runs has no failure modes to record, and it is
   `skill-cleaner`'s problem rather than this one's.

The exception is a skill that has just cost you time. Retrofit that one now,
while you still remember precisely what it got wrong.

## What not to heal

**A failure that was the model's, not the file's.** If the instruction was
correct and clear and the run went wrong anyway, adding a caveat to the file
makes it longer without making the next run better. Not every failure has a
documentation fix.

**A preference stated once.** Wait for the second time. A rule written from a
single data point is usually a rule about that data point.

**Anything the code already says.** If a reader can learn it by reading the
source, the file restating it is one more thing to keep in sync. Document the
things the code cannot tell you: why this way, what was tried and abandoned,
which external system lies about its own behaviour.

## Worked examples

Weak, and why:

> - 2026-03-02: Be careful with the API rate limits.

Names no limit, no symptom, no action. The next session reads it, agrees, and
learns nothing it did not already assume.

> - 2026-03-02: Fixed a bug in the upload path.

Records that work happened. A changelog entry wearing a lesson's clothes.

Strong, and why:

> - 2026-03-02: The export endpoint returns 200 with an empty body while the job
>   is still running, so a naive read stores an empty file and reports success.
>   Poll `status` until it reads `complete` before reading the body.

Names the symptom, the false signal, and the action. A session that reads it
cannot make the mistake.

> - 2026-03-02: Assumed the folder-scoped delete would find a note created in
>   that same folder seconds earlier. It fails with -1728. Delete by full note id
>   rather than by walking a folder.

Records the assumption, not just the fix, so a reader recognises the situation
before repeating it.

## Healing is not accretion

- An edit should leave the file no longer than it found it, unless the learning is a really new
  case.
- A learning that repeats across three or more files becomes one rule, and the three copies become
  pointers to it.
- An entry that has hardened into how the body describes the work gets folded into the body and
  deleted from the log. `fold` lists the candidates; it does not rewrite prose, because which
  sentence absorbs the lesson is a judgment about the work.
- Past 25 entries a log still living in the `SKILL.md` has become a second body. That is the signal
  to fold, not to raise the number. Once it has moved to `references/`, the character count is the
  measure and not the entry count: 130 one-line rules are cheaper to read than 25 paragraphs.
- **There is no `learned-patterns-archive.md`.** A second log beside the first is a body nobody
  opens: fifteen of them reached 5,296 lines, and 67 rules inside them had never been folded into
  any log at all. `review_skill.py` errors on one.

The short form is in `SKILL.md`.

## Cadence

Healing is per-session and reactive: it fires when something is learned.
Cleaning is scheduled and subtractive: it fires on a calendar.

Running them on the same cadence collapses the difference and produces a weekly
pass that both adds and removes, where the two halves fight. Heal continuously,
clean on a schedule, and let the clean pass fold the hardened entries the heal
passes accumulated.
