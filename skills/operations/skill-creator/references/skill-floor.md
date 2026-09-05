# Skill floor

Load this once the shape is settled and immediately before writing a `SKILL.md`, an agent, or a
rewrite of one. It carries the quality bar, the shapes to refuse, and the reflexes no script
catches. Do not load it for planning-only work.

`python3 scripts/review_skill.py <dir>` already settles the mechanical half. Act on its findings
rather than re-checking each one by hand; what follows is what it cannot see.

## Verify

Each of these is a check on the written file, never on the intention behind it. Read the file back
and answer with the line that satisfies the check, or with the edit that will.

- **Trigger.** The description says what the skill does and when to reach for it, in the third
  person, in the words a user would actually type. Read every sibling description in the family
  before writing this one: two descriptions that both fit the same prompt are one skill written
  twice.
- **Provenance.** Every example is something that happened, with the real path, number, error or
  name. An invented example teaches the reader to trust none of them.
- **Altitude.** The body routes; the references do. If a section can be lifted whole into a
  reference with a one-line pointer left behind, it belongs there. Under 250 lines is the budget,
  and a body that is mostly reference material is failing at 120.
- **Disclosure.** Every reference link carries the condition that opens it: "read `api-errors.md`
  when the call returns a non-200". A pointer with no condition is loaded always or never, and
  which one is a coin toss.
- **Freedom.** Fragile and one-way steps carry the exact command. Craft steps carry criteria and a
  default, so the reader can tell an edge case from a violation. State the reason behind a hard
  rule in the same breath as the rule.
- **Verdict.** Every check has a pass condition a reader can answer. "Improve the hierarchy" has
  none. "Blur the detail and name the primary element, the secondary, and the groups in order" has
  one. A named test that returns an answer beats a paragraph describing quality.
- **Cost.** The skill states its own ceiling where a loop could open: how many passes, how many
  reads, when to stop. Work with no stated ceiling runs until the context does.
- **Boundaries.** The skill names what it does not own and names the skill that does. Name the
  other skill; never link to it by path, because a path that resolves in `ai-doc/` breaks in every
  flattened `.claude/skills/` projection.
- **Handoff.** The last line says where the work goes next, or says the work is done.
- **Frontmatter.** `name` equals the directory. `description` under 300 characters and free of
  angle brackets. `allowed-tools` only where it removes a prompt the skill hits every run.
  `disable-model-invocation: true` on anything that should only ever be typed.
- **Self-healing.** The four parts, seeded with real entries, or the section is absent. `skill-creator`
  owns the format and `skill-creator check <dir>` owns the verdict.

## Refuse

These are the defaults a body falls into when nobody decided, and the run's own evidence can earn
any of them back. Reaching for one while the choice was free means the decision was skipped;
recognising that means cutting the section, not softening it.

Shapes that look like a skill:

- **A skill designed before its second run.** A planning session that asks "what skills should
  exist" produces files nobody triggers. The signal to write one is having just done the thing for
  the second time, and that run is the draft.
- **A persona in a `SKILL.md`.** "Expert X specialising in Y" with no procedure is an agent
  wearing the wrong extension. The reverse also holds: an agent whose body is a checklist with no
  judgment is a skill in a costume.
- **A registry of the filesystem.** A hand-maintained list of what is in the next directory goes
  stale in silence, because nothing reconciles it. Generate it or delete it.
- **A wrapper that restates the skill it calls.** Naming the skill reaches everything that skill
  reaches. A file longer than its own usage table is holding something with an owner elsewhere.

Sentences that cost more than they carry:

- Prose the base model already knows. What a CSV is, what a migration does, what good typography
  looks like in general. What survives is what this workspace decided: a number, a path, a name, a
  preference, a thing that went wrong once.
- `ALWAYS` and `NEVER` in capitals where the reason would do the same work better. A reader who
  knows why can handle the case the rule did not foresee; a reader holding a shouted rule cannot.
- A menu of equal options where a default belongs. Pick one, name the alternative in a clause.
- An anti-pattern stated abstractly. "Avoid generic output" is unfalsifiable. "A colored
  `border-left` above 1px on a card" can be checked by grep.
- "See `references/` for details." The condition is the whole pointer.
- A date, a version, or "as of August 2026" inside a claim. It ages into a lie that reads as
  current. Write the current shape and, where the old one still exists somewhere, a labelled
  legacy section.
- Filler headings from an imported pack: "Initial Assessment", "Best Practices", "Common
  Mistakes", a Success Metrics table nobody measures.
- A `## Learned Patterns` section shipped empty. It teaches the reader to skip the section.

One of these is a ban rather than a default, and no evidence earns it back:

- **A second copy of a fact that already has a home.** Every fact lives in exactly one file and
  every other mention is a pointer to it. Two copies do not disagree on the day they are written;
  they disagree three months later, both read as current, and the reader has no way to tell which
  one won. Grep for the fact before writing it anywhere.

The floor holds the mechanics. It never decides what the skill is for. With every check green,
spend the file on what only this workspace knows.
