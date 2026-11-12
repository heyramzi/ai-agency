# Design taste

Open this when a correction is about how one project looks or moves: a value, a surface, a spacing,
a curve. It goes to that repo's `DESIGN.md`, never into a shared skill, because Glance's card
shadow isn't a rule for CBAM. A correction that holds for every project goes to the skill that owns
it (`ui-design`, `transitions-dev`, `anti-ai-slop`) through the normal heal loop.

Adapted from Emil Kowalski's `learn-taste` (MIT, [emilkowalski/skills](https://github.com/emilkowalski/skills),
upstream `f7ce8c0`, read 12 Nov 2026), rewritten for our `DESIGN.md` format and the heal loop.

## Rules

1. **Only the author's taste.** Every rule traces to something he said, edited or confirmed. A rule that
   just seems like good practice is the agent's taste, which is what he was correcting.
2. **Never invent a why.** No reason given: write your best guess, mark it *inferred*, and ask. A
   wrong why is worse than none, because the next agent stretches it to cases it doesn't fit.
3. **Propose, then stop.** Write only what he approves. His approval stands in for healing.md's
   "wait for the second time": he's confirming the rule, not stating it in passing.
4. **A check beats a sentence.** A violation code can match (a raw hex instead of a token, a literal
   duration, a banned property) gets a lint rule or a test, plus one line in `DESIGN.md` for the why.
5. **Write for an agent that wasn't here.** Name the component class, the value, the token, the
   file. Never "the card from earlier".

## Collect: five signals

Read the session from its first turn. Explicit corrections are the minority.

| Signal | Example | What it gives you |
| --- | --- | --- |
| Explicit correction | "No, semi-transparent shadow, not a border" | The rule, often with the why |
| Silent edit | He changed `duration: 400` to `200` in a file you wrote | His value is the rule. Find it in a file-changed-outside-your-edits notice, or diff the file against what you last wrote |
| Repeated nudge | "Smaller." then "Still too big." then "Ok" | Record where he landed, not the steps |
| Revert or rejection | "Undo that", picking variant B, deleting what you added | What not to do. The why is usually missing, so ask |
| Confirmed non-obvious choice | "Yes, keep the icon outside the button" | Only if a fresh agent would plausibly do otherwise |

Keep his exact words or the diff. Skip functional bugs, one-screen content ("the headline says
Pricing") and corrections to your reading of the task.

## Filter and generalize

Would a fresh agent building a *different* component in this repo make the same mistake? No: skip
it. Yes: read the repo's `DESIGN.md` and `AGENTS.md` first.

- **A rule already says it.** The rule failed, so make it stricter (a number, a token, "never")
  instead of adding a duplicate.
- **A rule contradicts it.** Show both, and he picks. The old one gets deleted, not left beside the new.
- **Nothing covers it.** Write it at the class level.

| Level | Example | Verdict |
| --- | --- | --- |
| Instance | "The pricing card gets a shadow, not a border" | Too narrow: protects one card |
| Class | "Raised surfaces (cards, popovers, menus) use `--shadow-raised`, never a solid border" | Write this |
| Universal | "Never use borders" | Too broad: breaks inputs, dividers, tables |

The same correction on 2 different components is evidence for the class level. Word it with the
repo's own tokens and "always" or "never", unless he framed it as a preference.

Self-test: read only the rule and its why, then picture the original task. If an agent that knows
nothing else could still build the wrong version, add the value, the token or the exception.

## Write

Into the existing section of the repo's `DESIGN.md` that matches (Colors, Typography, Elevation,
Motion, Components...). Our files open with YAML tokens and their own headings, so never impose a
new section list. A changed token value goes in the YAML block too. If neither `AGENTS.md` nor
`CLAUDE.md` points at `DESIGN.md`, propose the line `Before building or changing UI, read DESIGN.md.`

```md
- **Raised surfaces (cards, popovers, menus) use `--shadow-raised`, never a solid border.**
  Why: a solid border reads flat and heavy; a semi-transparent shadow adapts to both themes.
  <!-- 2026-11-12: "no, semi-transparent shadow, not a border" -->
```

The comment keeps the date and his words, so a later conflict shows which rule is newer.

## Report, then stop

| # | You said | Rule | Why | Where |
| --- | --- | --- | --- | --- |
| 1 | "no, semi-transparent shadow, not a border" | Raised surfaces use `--shadow-raised`, never a border | Borders look heavy; shadows adapt to both themes | `DESIGN.md` › Elevation |
| 2 | Changed `400` to `200` in `Dropdown.svelte` | Dropdowns and popovers open in 150 to 200ms | *inferred:* 400ms dragged on a surface opened many times a day | `DESIGN.md` › Motion |

Then: **Needs your answer** (each *inferred* why and unclear level, with your pick), **Conflicts**,
**Make it a check** (the exact rule config and what it flags today) and **Skipped** (one line each).
Close with "Say `write all` or `write 1, 3`." After approval, write only those, show the diff, and
run any new check across the repo. When it flags existing code, report the count and ask whether
it's a warning or a fix: fixing changes component code, and this pass only writes rules.

No corrections in the session is a good result. Say so in one line.

`prune`: read the `DESIGN.md`, propose merges for duplicates, fixes for contradictions and numbers
for vague rules. Same propose-then-stop.
