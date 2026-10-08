# Skill floor

Load once the shape is settled, right before writing a `SKILL.md`, an agent or a rewrite. It
carries the bar, the shapes to refuse and the reflexes no script catches. `scripts/review_skill.py
<dir>` settles the mechanical half; act on its findings and use this for what it can't see.

## Verify

Run each check on the written file. Read it back and answer with the line that satisfies it, or the
edit that will.

- Trigger. The description says what and when, in third person, in the words a user types
  ([Triggering](#triggering)).
- Provenance. All examples happened, with the real path, number, error or name. An invented
  one teaches the reader to trust none.
- Altitude. The body routes; references do. A section liftable whole into a reference goes
  there. No `.md` runs past 200 lines, a skill holds at most 10 (both gated), and a body that
  is mostly reference material fails at 120. `humanizer` once ran 247 lines pointing at 21 files
  of 330 KB; a session read the body, opened none, and shipped the slop it exists to stop.
- Disclosure. A reference link states the condition that opens it ("read `api-errors.md`
  when the call returns a non-200"). Without one it loads always or never, by coin toss.
- Freedom. Fragile and one-way steps get the exact command. Craft steps get criteria and
  a default, with the reason beside a hard rule. A craft number is a default the model may leave.
- Verdict. A check has a pass condition a reader can answer. "Improve the hierarchy" has
  none; "blur the detail and name the primary element, the secondary and the groups in order" does.
- Enforcement. A skill that sets a standard ships it as an eval in its own reference: numbered
  checks, each pass or fail on the finished output in a fresh read, looped to all-pass, with a round
  ceiling and an exit for a draft that can't pass without inventing facts. Prose describing an audit
  isn't one; that sentence sat in `humanizer` while every session skipped the pass it named.
- Shape. Every rule has a before and after, a string to grep or a number to measure. A rule
  naming a category describes the failure instead of removing it.
- Coherence. Read the skill's rules against each other and any gate it ships against the rule
  it claims to enforce: two `humanizer` rules contradicted each other, and its pronoun lint failed
  a ledger at parity while the rule asked only that first person outnumber second.
- Cost. The skill states its ceiling wherever a loop could open (passes, reads, when to stop).
- Boundaries. It names what it doesn't own and which skill does, by name and never by path: a
  path that resolves in `ai-doc/` breaks in every flattened `.claude/skills/` projection.
- Handoff. The last line says where the work goes next, or that it's done.
- Frontmatter. `name` equals the directory; `description` under 240 characters, no angle
  brackets; `allowed-tools` only where it removes a prompt hit every run;
  `disable-model-invocation: true` on anything only ever typed.
- Self-healing. The 4 parts seeded with real entries, or the section absent
  (`heal.cjs check <dir>`).

## Refuse

Defaults a body falls into when nobody decided; recognising one means cutting the section.

- A skill designed before its second run. The signal to write one is having just done the
  thing a second time, and that run is the draft.
- A persona in a `SKILL.md`, or an agent whose body is a checklist with no judgment.
- A hand-maintained list of what's in the next directory. It goes stale silently: generate it
  or delete it.
- A wrapper restating the skill it calls. A file longer than its usage table holds something
  with an owner elsewhere.
- Prose the base model knows (what a CSV is, what good typography looks like). What survives is
  what this workspace decided.
- `ALWAYS` and `NEVER` in capitals where the reason would do the work. A reader who knows why
  handles the case the rule didn't foresee.
- A menu of equal options where a default belongs: pick one, name the alternative in a clause.
- An abstract anti-pattern. "Avoid generic output" is unfalsifiable; "a colored `border-left`
  above 1px on a card" is a grep.
- "See `references/` for details." The condition is the whole pointer.
- A line announcing that a tool or skill is gone or was merged. Delete every mention instead.
  The author, 23 Sep 2026: *"it's about removing mentions of it."* `check-skill-length.mjs` fails the words.
- A date, version or "as of August 2026" inside a claim; it ages into a lie that reads as
  current. Write the current shape and a labelled legacy section where the old one still exists.
- Filler headings from an imported pack ("Initial Assessment", "Best Practices", a Success
  Metrics table nobody measures), or an empty `## Learned Patterns`.
- A second copy of a fact that already has a home (a ban no evidence earns back). Copies
  disagree 3 months later with both reading as current. Grep for the fact before writing it.

## Triggering

Read when writing a description, when a skill keeps getting picked for the wrong prompt, or when
one that should have fired stayed quiet. The description is the only part preloaded into every
session, read against every sibling at once.

Undertriggering is the common failure. A neutral summary loses to the model's own confidence,
so lean on the trigger half: name the contexts and phrasings. **A one-step task won't trigger a
skill however good the description** ("read this PDF" is handled directly), so a skill whose whole
job is one tool call has a shape problem.

2 halves, both required, third person: **what it does**, concretely enough to separate it from
siblings; **when to reach for it**, in the words a user types (casual phrasing, tool and file
names). A third earns its place when a sibling is close: what it is *not* for (`impeccable` ends
"Not for backend-only or non-UI tasks").

The description ceiling is 240 characters, refused at commit by `check-descriptions.py` (the old 500
budget behind a 1024 cap nothing reached left 135 of 186 assets over, about 17k tokens spent before
the user typed). Over it, cut the mechanism first, then the inventory, then the self-description.

**Trigger evals**, for a skill beside close siblings: 20 realistic queries, 8 to 10 should-trigger
(varied phrasing, an uncommon use, one that beats a sibling) and 8 to 10 should-not (near-misses
sharing keywords), stored as `evals/trigger.json` (`{"query": "...", "should_trigger": true}`), each
run three times. Score the should-not half first: a description firing on everything displaces the
right skill in neighbouring sessions. Tune against 60% and judge on the rest.

**Two descriptions that keep matching one prompt are usually one skill with two branches.**
Merge ([critique.md](critique.md#doing-the-merge)); narrowing both leaves them overlapping.
