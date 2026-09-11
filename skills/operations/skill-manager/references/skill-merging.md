# Merging two skills that are the same skill

Two skills that read alike are usually one skill that was written twice. Keeping both costs
description budget in every session, splits the learned patterns across two logs, and makes the
runtime pick wrong: when two descriptions both half-match a request, neither wins reliably.

**One tree with two branches beats two trees that look almost like each other, when the trunk is
the same.** The trunk is the shared judgment: written once, it stays consistent. The branches are
the inputs the skill takes. Two skills that share 70% of their prose carry that trunk twice, and
two copies drift apart from the day they are written.

## Contents

- [Finding the pairs](#finding-the-pairs)
- [Merge, or disambiguate](#merge-or-disambiguate)
- [The shape of a merged skill](#the-shape-of-a-merged-skill)
- [Doing the merge](#doing-the-merge)
- [What breaks, and what to repoint](#what-breaks-and-what-to-repoint)

## Finding the pairs

Group by topic across **all** packages first, then triage inside each group. Topic trios
accumulate across category folders and are invisible when you read one folder at a time.

Four signals, in order of how often they are right:

1. **Shared noun in the name.** `screenshot-review` and `ios-screenshot-loop`. Run the name
   list through a sort and read the neighbours.
2. **Description overlap.** Under 40% is complementary, keep both. 40 to 70% is adjacent, merge
   unless a written reason survives step 2 below. Over 70% is redundant, merge.
3. **The same reference file, or a near-copy of one.** Two skills carrying the same table have
   already merged in content and not in structure.
4. **One routes to the other in its own description.** A skill whose description says "for X, use
   `y`" is naming its own trunk.

## Merge, or disambiguate

Read **both bodies** before merging on description overlap alone. Two skills can read 70%
identical and be fully complementary, because the overlap is in the domain vocabulary while the
inputs differ: `improve-codebase-architecture` takes a whole codebase, `code-refactoring` takes
a diff, a file or a folder. That pair is not a merge, it is two descriptions that fail to say
what they take.

So each pair ends one of two ways, and both are edits:

- **Merge** when the two do the same job on the same input, or when one is a special case of the
  other. This is the default.
- **Disambiguate** when the inputs genuinely differ. Rewrite both descriptions to lead with the
  input, not the topic, so the runtime can tell them apart. Leaving two vague descriptions in
  place is not a third option.

## The shape of a merged skill

The survivor takes the broader name, and:

- **One description** naming both triggers. Not a concatenation: write the job once, then the
  two entry points. If the description cannot be written without an "and also", the merge was
  wrong and the pair should have been disambiguated.
- **One shared body.** The judgment both skills were teaching, written once.
- **A named branch per input**, as a section. "When the input is a repo", "when the input is a
  diff". A reader picks their branch and reads the shared body either way.
- **The union of concrete instructions**, not the union of prose. Two skills describing the same
  step in different words keep the more specific wording and drop the other.
- **One Learned Patterns log**, holding both logs' entries in date order. A merge that drops one
  skill's failure log throws away the part that cannot be re-derived.

## Doing the merge

1. Write the merged description first. It is the test: if it comes out clean, the merge is real.
2. Move the union of concrete instructions into the survivor, branch by branch.
3. Move the reference files across, and de-duplicate them: two references saying the same thing
   become one, and the survivor's `SKILL.md` links it.
4. Concatenate the Learned Patterns logs, sort by date, drop exact duplicates.
5. `git rm` the loser and repoint everything below.

## What breaks, and what to repoint

A skill's command is its **directory** name, so deleting a directory deletes a `/command` that
somebody's muscle memory and somebody's manifest both use.

- **`vibekit.json` in every consumer.** Grep the deleted path across all of them and repoint the
  entry to the survivor, then `pnpm vibekit sync <dir>` per consumer. A consumer subscribing to a
  whole folder needs nothing, but one subscribing to the exact path breaks silently.
- **Sibling descriptions that route by name.** Grep the deleted registered name across the whole
  of `ai-doc/`, descriptions included, and repoint. A description that names a skill that no
  longer exists sends the runtime nowhere.
- **Agents that name it.** Area leads list the skills in their area by name.
- **The usage ledger.** `~/.claude/skill-usage.jsonl` keeps writing the old name from any session
  that has not restarted. Do not read a post-merge gap in the survivor's usage as disuse.

Report the merge as one line per pair: the two names in, the one name out, and the reason.
