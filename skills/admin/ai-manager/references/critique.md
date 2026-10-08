# Critiquing the shelf

`critique` judges the whole system against what it's meant to be, then hands each verdict to the
clean path. The author, 4 Oct 2026, on `founder-os`, `board` and `batch-workload`: "there are things
that are badly called skills and there are things that are redundant." A shelf drifts that way
one reasonable skill at a time, so the only check that catches it reads all of them at once.

## The target system

The kit is a company. Agents are the staff, one per role (the `/admin/ai-library/company`
page draws them by division). Skills are the jobs they do, and references are the files
they read. 6 rules follow, and each verdict cites one.

1. One tool or one outcome, one skill. 2 skills that drive the same tool (`board`,
   `clickup`) or produce the same result are one skill with two branches.
2. The name says the job to a non-technical agency owner. Name it after the tool it drives
   (`clickup`, `email`) or the thing it hands back (`proposal`, `inbox`). A brand, a
   metaphor or an "OS" suffix fails: `founder-os` told nobody it was the morning brief. So does a
   near-twin: `board` and `boards` sat side by side doing unrelated work.
3. One fact, one home. Reference data lives in markdown, live data lives in the app and its
   CLI. A skill that copies a table the CLI prints, or a step another skill owns, is the bug.
4. No agent and skill share a name or a job. The agent is who, the skill is how.
5. Group by module, the way it's sold: sales first, then delivery, then the rest. A skill
   filed where no agent of that module reaches it is in the wrong folder.
6. Short. A description is what plus when. A body is the steps the model wouldn't take
   alone. Cut any sentence that restates the obvious.

These came out of the 3 Oct 2026 walk with Sofiane (`qmd search "Walk with Sofiane"`):
reference data in GitHub markdown, dynamic data in Supabase, every screen read-only, and the
why told through the owner's own Drive.

## The yardstick

Matt Pocock's set (github.com/mattpocock/skills) is the best-tuned shelf we know of, so it's the
bar. `scripts/shelf_stats.py <ours> <his clone>` prints both:

| Median | His 37 | Ours before | Ours after the 4 Oct rewrite |
| --- | --- | --- | --- |
| SKILL.md | 75 lines | 106 lines | 71 lines |
| Whole skill | 91 lines, 2 files | 615 lines, 8 files | 356 lines, 6 files |
| Description | 136 chars | 274 chars | 181 chars |
| Typed by hand only | 59% | 0% | 4% |

What closes the gap, each one his habit:

- A description is a pointer. Lead with the word you'd type, one trigger per
  case the body handles, no synonyms for the same case.
- Typed-only skills set `disable-model-invocation: true`, so their description leaves every
  session. Keep it off a skill on an agent's `skills:` line: the skills docs say the flag also stops
  the preload (read 4 Oct 2026).
- An alias is one line. His `grill-me` body is "Call the Skill tool with grilling."
- End each step on "done when" and a checkable condition. A vague end gets a step rushed.
- Say what to do, not what to avoid. A "never X" puts X in the reader's head. Keep a ban only
  as a guardrail, paired with the thing to do instead.
- The environment is the source. A body that copies `--help`, a config file or a command list
  is a cache that goes stale. Write down only what looking can't find: the reason, the trap.
- A lesson becomes a check (his `retro`): a mechanical slip becomes a lint
  or a test, a judgment call becomes one line in the standard. A failure log over 25 entries is
  sediment; fold it into the body or a gate and empty it.

## Running it

1. Run `shelf_stats.py`, then list every skill and agent with its description and size,
   across every source repo (`readlink -f` on each `.claude/skills/*/SKILL.md`; `clickup-utils`
   and plugins count).
2. Sort the names and read the neighbours, then group by the tool each one drives. Most
   verdicts fall out of those two lists before any body is opened.
3. Give each skill one verdict: keep, rename, fold into X, disambiguate, or delete, with the
   rule it breaks. A product boundary is a real reason to keep two skills apart (a free kit and
   a paid pack can't share one file), so say it when it applies.
4. Report it as one table, worst first, then execute every verdict through the merge below
   and the clean path. A critique that ends as a table is half the job.

## Lessons from the 4 Oct 2026 rewrite

The whole shelf went through this file that day. It ran 11 parallel Sonnet rewriters with one shared brief, one per area. What held it together, and what bit:

- Some boundaries are not yours to fold. A free kit and a paid pack
  (`clickup-utils/scripts/skills.mjs`), a runtime registry (`agency-os` frontmatter is what
  `agency pull` exports), a vendored tree pinned to an upstream commit. Edit the description
  there and nothing else.
- Manual-only only where nothing reaches the skill by name: no agent `skills:` line, no
  backticked mention in another skill. Grep both before setting the flag.
- `author:` marks a borrowed core. A borrowed reference inside our skill credits its author
  in that file. Never guess one.
- A rename or a move touches five places: the folder, `scripts/skill-folds.json`, every
  `vibekit.json`, every path in prose (grep the old path across `~/Studio`, projections
  excluded), and the app's `areas.ts`, `cast.ts` and `icons.ts` when an area moves. Sync after.
- `skillOverrides` rots. A settings file listed 74 dead names, and one "off" hid
  `ui-design` from the person typing it. `off` blocks the typed command too; to save context,
  set `disable-model-invocation` instead.
- Rewriters keep facts and drop prose. The brief said what must survive (numbers, rulings,
  traps, exact commands, fences) before it said what to cut, and no batch lost one.
- A per-skill closing step duplicates the standing self-healing rule every session already
  loads. `heal.cjs check` now gates only log hygiene: last section, newest first, 25 entries.

## Merging two skills that are the same skill

Skills that read alike are usually one skill written twice. Keeping both costs description
budget in every session, splits the failure log in two, and makes the runtime pick wrong: when
two descriptions both half-match a request, neither wins reliably. The trunk is the shared
judgment, written once; the branches are the inputs.

- [Finding the pairs](#finding-the-pairs)
- [Merge, or disambiguate](#merge-or-disambiguate)
- [The shape of a merged skill](#the-shape-of-a-merged-skill)
- [Doing the merge](#doing-the-merge)
- [Repointing after a merge](#repointing-after-a-merge)

### Finding the pairs

Group by topic across all packages first, then triage inside each group. Topic trios
accumulate across category folders and are invisible when you read one folder at a time.

The 4 signals, in order of how often they are right:

1. Shared noun in the name. `screenshot-review` and `ios-screenshot-loop`, before the 21 Sep 2026 merge. Run the name
   list through a sort and read the neighbours.
2. Description overlap. Under 40% is complementary, keep both. 40 to 70% is adjacent, merge
   unless a written reason survives step 2 below. Over 70% is redundant, merge.
3. The same reference file, or a near-copy of one. Two skills carrying the same table have
   already merged in content and not in structure.
4. One routes to the other in its own description. A skill whose description says "for X, use
   `y`" is naming its own trunk.

### Merge, or disambiguate

Read both bodies before merging on description overlap alone. Two skills can read 70%
identical and be fully complementary, because the overlap is in the domain vocabulary while the
inputs differ: the old `improve-codebase-architecture` took a whole codebase, the old
`code-refactoring` took a diff, a file or a folder. A pair like that is not two descriptions
made narrower, it is one merge with a named branch per input: both folded into `refactor`
(`engineering/code/refactor`), one branch for a whole codebase and one for a diff, file or folder.

So each pair ends one of two ways, and both are edits:

- Merge when the two do the same job on the same input or one is a special case of the
  other. This is the default.
- Disambiguate when the inputs differ. Rewrite both descriptions to lead with the
  input and leave the topic out, so the runtime can tell them apart. Leaving 2 vague descriptions in
  place is never an option.

### The shape of a merged skill

The survivor takes the broader name, and:

- One description naming both triggers. Not a concatenation: write the job once, then the
  two entry points. If the description cannot be written without an "and also", the merge was
  wrong and the pair should have been disambiguated.
- One shared body. The judgment both skills were teaching, written once.
- A named branch per input, as a section. "When the input is a repo", "when the input is a
  diff". A reader picks their branch and reads the shared body either way.
- The union of concrete instructions, never the union of prose. When 2 skills describe the same
  step in different words, keep the more specific wording and drop the other.
- One Learned Patterns log, holding both logs' entries in date order. A merge that drops one
  skill's failure log throws away the part that cannot be re-derived.

### Doing the merge

1. Write the merged description first. It is the test: if it comes out clean, the merge is real.
2. Move the union of concrete instructions into the survivor, branch by branch.
3. Move the reference files across, and de-duplicate them: two references saying the same thing
   become one, and the survivor's `SKILL.md` links it.
4. Concatenate the Learned Patterns logs, sort by date, drop exact duplicates.
5. `git rm` the loser and repoint everything below.

### Repointing after a merge

A skill's command is its directory name, so deleting a directory deletes a `/command` that
somebody's muscle memory and somebody's manifest both use.

- `vibekit.json` in every consumer. Grep the deleted path across all of them and repoint the
  entry to the survivor, then `pnpm vibekit sync <dir>` per consumer. A repo subscribing to a
  whole folder needs nothing, but one subscribing to the exact path breaks silently.
- Sibling descriptions that route by name. Grep the deleted registered name across the whole
  of `ai-doc/`, descriptions included, and repoint. A description that names a skill that no
  longer exists sends the runtime nowhere.
- Agents that name it. Area leads list the skills in their area by name.
- The usage ledger. `~/.claude/skill-usage.jsonl` keeps writing the old name from any session
  that has not restarted. Do not read a post-merge gap in the survivor's usage as disuse.

Report the merge as one line per pair: the two names in, the one name out, and the reason.
