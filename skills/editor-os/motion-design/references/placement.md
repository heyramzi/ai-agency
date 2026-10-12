# Placement: the rule table, the judge and the bespoke clip

`editor-os motion place` picks motion for a script. It runs each line through a rule table with no AI, then a judge
where the table can't settle it, then a per-minute budget. A placement comes back with a one-clause reason
for the plan, so he can overrule it in review.

```
editor-os motion place --lines <file>            "mm:ss<TAB>line" rows, or a JSON list of {at, line, slot?, context?}
editor-os motion place --plan <dir>              the slots of <dir>/plan.json (RUN.json says if it's a Short)
editor-os motion place --line "<sentence>" --short
  --position open|body|boundary|guest|close  --opened-on-list  --shot  --busy  --ground  --no-judge  --judge all  --json
```

Copy each `reason` into the slot's `reason` in plan.json. A `bespoke` one also carries its `job`.

## The outcomes

- `cell`: one cell answers it. `variant` is `alpha` (keyed over the face, the default since the face carries most
  lines) or `raw` (full-frame ground, when the graphic is the point). `mode` is set for a cell with modes (`Cta`).
- `broll`: a picture answers it. Either the line names a thing a camera could film and no drawn cell fits this
  format, or a real shot exists and the cell is an `either` lane cell. A drawn lane cell never gives way.
- `bespoke`: no cell does the job and a clip would still add something. Build it from the kit (below) and report `job`.
- `none`: a clip adds nothing the sentence doesn't say, the line is too short to carry one, or the budget is spent.
  His face holds it.
- `verify`: the judge wasn't sure, or isn't there. Nothing is guessed. `lean` says which way it tilted. Ask him.

## The rule table

`packages/motion/rules.json`, beside `library.json`. A rule is a sentence shape (`signals`, `all`, `not`, plus
a `context` for what the words can't say: format, position, whether a shot exists) and the cells that answer it.
A cell with its own `signals` is the specific answer, and the cells without are the default. `twins.opaque` is the
cell for a busy plate, `twins.raw` the full-frame one. `lane: overlay` in place of a `cell` covers every cell in
that lane, so a new one is covered the day it lands. A rule carries one `example` line that must fire it.

One cell answers one rule. `packages/studio/src/motion-rules.test.ts` fails when an offered cell has no rule,
when one answers two, or when a rule names a cell, a mode or a pattern that isn't there. Adding a cell to
`library.json` means adding it to a rule in the same change.

Where the rules leave exactly one cell, that's the placement. Two or more, or none, go to the judge.

## The judge

Jev, TypeSafe's judgment model through Kilo, the way the SEO audit uses it (`jev-seo/references/judgments.md`).
It needs `KILO_API_KEY` (env, `.env.local`, or Proton Pass Dev/Kilo). Without it a line the rules leave open is
`verify`, never a guess. The checks:

- **Strengthens** (Noul): does the line hold a number, an order, a contrast, a structure or a named thing that lands
  faster seen than heard? No at 0.20 or below is `none`. Anything between is `verify`.
- **Carry** (Noul, only when a clip sits within 30s before): does the line continue that clip's subject? Yes breaks a
  tie toward the same cell, since an earlier beat's structure is inherited, never redrawn.
- **Budget** (code, never asked): 2 motion clips in any 60s. Overlay-lane pops and b-roll don't count.

Beside those, a Choice over the candidate cells (every offered cell when the rules left none) with a `no_match`
option. At 0.80 confidence or more it decides. Under it, two or more candidates is `verify`; with none, the rules
found nothing and no cell is a clear fit, so the line is `bespoke` and the nearest cell is named, not used.

## Building a bespoke clip

The house look comes from the kit, so a clip with no cell is built out of its parts, never from a blank file:

1. Read the nearest cell in the same family for the structure, and `tokens.ts`, `type.ts`, `motion.ts`,
   `primitives.tsx` and the family's `design.ts` for colour, type, easing and the frame. No literal hex, font or
   spring in the new file.
2. Put it in the video's own folder (`<video-code>/`, or `<code>-steps/` for a Short) and register it in that
   folder's Root. It's alpha unless the graphic is the point (`craft.md`). A logo or a screenshot isn't built: `broll`
   supplies it and `ShortsPop` places it.
3. Render, look at a still per phase, and score it on the 7 axes like any clip.
4. Report the missing job in the library's own words: the trigger in the script, never the look. A job that
   comes up in a second video earns a cell.
