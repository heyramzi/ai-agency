# Shorts (9:16)

Read this when `RUN.json` says `format: vertical`. The local route is the main path: `editor-os new
"<title>" --take <folder or file>` runs the first cut, and every change after it is a verb
(`retime`, `keep`, `tighten`, `title`, `layout`, `overlay`, `pick`). The trunk rules in `SKILL.md`
still hold. This file only adds what a Short does differently.


## The cast

Every clip is made by its own worker, so the brief names who appears and in which colour once. `BRIEF.md` carries a
`## The cast` section with one line, like "Ana is blue, Marc is orange, Lea is green." Write it before the first clip
is briefed, and put it in every clip's brief. `cut check` warns when a Short has 2 clips or more and no cast line.

## The hook title

The opening card has a small line, a BIG line and a small line. They name the video's idea (the topic, the
hook word, the frame such as mistake, trap, fix or rule), never a line of the speech, and they have
to read at grid size, so the big one is a short word or phrase. Put a claim on the card that the opening line
doesn't say (the video's sharpest number or contrast), never a restatement of it, and no line repeats
another. Write them with `video-script`'s hook
rules, run them through the slop gate, set the best with `editor-os title <name> "<small>" "<BIG>"
"<small>"` (it refuses until the transcript cleanup in `SKILL.md` is recorded), and offer 3 options as a note on the hook beat. The planner never derives one, and `cut
check` fails until it's set. No slot starts before the Title scene ends: read its span in `edit.json` before planning the first one.

## Layouts

A Short draws from 7 cards in the pack: `Shorts Title`, `Shorts Head`, `Shorts Bottom`, `Shorts Split`,
`Shorts Green Screen`, `Shorts Full Screen Insert` and `Shorts Reaction`. The Layouts tab prints a trigger
`job` line under each card. Pick by that line, and never invent a layout or its geometry. The verbs and
the sync check: [sequencing.md](sequencing.md#clips-and-layouts-on-the-local-route).

- `Shorts Split` is for a real screen recording, and it frames the camera from the face it measures (the render
  does it, once per take), so the caption never sits on the forehead. A clip over the head goes on `Shorts Bottom`,
  because Split has no Media slot.
- `Shorts Bottom` shows the whole head, with the caption above the hat. An overlay on it keeps its
  content above the caption band: `overlay` prints that line, and `cutcheck` and every render fail a
  clip that fills the band. A Bottom layout a word early left an empty slot, so the pair moves together.
- `Shorts Green Screen` draws no backdrop behind its 1080x730 clip, so the band below it renders black.
  That's a known gap until the card is fixed, not a look: don't pick it for that band.
- A `Shorts Title` scene starts on the word its text shows, never on the sentence before it. A "100" card
  belongs on "100", not on "So step one,". If a drawn overlay already shows that number
  or word on the beat, skip the Title card.
- No scene holds past 6s: `layout <name> --at "<first words>"` splits it (same layout punches in or
  out), and `cutcheck` flags a hold it missed.
- Moves ease. The head and screen grow and shrink between layouts. A switch never hard-cuts,
  except on a source cut. The captions glide with the layout, because the Caption box moves with it.

## Overlays and b-roll before motion

A Short changes picture every 2 to 3s. A beat that names a tool, app, object, screen or place gets the
real thing: its logo, a cutout, a screenshot, a found shot, never a drawing of it. One Short shipped 5
motion clips held 3.5 to 7s and nothing found. Its fault was that nothing real showed up on screen.
The bar is @nextbysophie's reel `Dc4qQwBxDCG`: about 25 changes in 63s, 4 of them full frame.

Motion goes wherever a beat needs one: a number, a split, a structure, an idea no camera can show, or any
beat he picks. There's no cap on how many.

Read the cut once and mark every tool, object, screen and place a viewer could point at. The table picks
the picture for it and where it goes.

| The line | Picture | Where | Hold |
|---|---|---|---|
| Names a tool, app or brand | its real logo, or several around the head: `ShortsPop` first, landing on the words that name them (cluster for several, single for one) | over the head on `Shorts Head` | 1 to 2s |
| Says "a lot" of one thing ("all my inboxes") | one mark filling the frame | over the head | 1 to 1.5s |
| Names an object (a laptop, an invoice) | a keyed cutout beside him or in his hand | over the head | 1.5 to 2s |
| Talks about a result or a place | a found shot or still | under the head on `Shorts Green Screen` (the matte keeps him in front) | 2 to 3s |
| Points at a screen | one field or label: a screenshot card; a flow: the recording | card above the head, under his cut-out so his cap draws over it; recording on `Shorts Split` or `Shorts Bottom` | 2 to 3s |
| Moves to a scene with no face needed | a found shot, full frame | `Shorts Full Screen Insert` | 1.5 to 3s |
| States the video's one idea, the line the rest builds on | a full-frame motion clip in the brand (`motion-design`) | `Shorts Full Screen Insert` | 2 to 4s |
| Says a number, a split or a structure no camera can show | a motion clip from the library | over or under the head | 2 to 3s |

In any Short: at least one overlay per 5s and at most 4 cutaways. An overlay over or under the head is
the common one; full frame is the exception. The long-form shot read's redundancy test doesn't apply: a logo on the word that names
it is recognition. Brief `broll` with every noun in the same turn as the motion brief, never after it. `editor-os motion place --plan <dir>` runs these rules over the plan's slots (`motion-design`, `references/placement.md`) and gives each a one-clause `reason` to write into the slot.
Place each with `editor-os overlay <name> --file "<clip>" --at "<the word>"`, landing 0 to 3 frames
before the word; add `--layout "Shorts Green Screen"` for an under-the-head picture.

## Pace

Cut the fluff and make the calls yourself: the brief's hook opens, a line said twice keeps its last
whole take, a CTA said twice keeps the second unless the brief names one. Fit under 60s by cutting, not by speeding up. The planner works to `TARGET` in the edit tool's `plan.ts` (first cut,
words per minute, length) and `editor-os verify` flags a miss. Leave those numbers out of a brief.

The last kept range runs to the end of the closing sentence plus about 0.3s of breath, never to the CTA keyword. Check its end against the transcript words, because the range's own `quote` can still list words the cut dropped.
