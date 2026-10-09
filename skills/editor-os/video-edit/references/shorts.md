# Shorts (9:16)

Read this when `RUN.json` says `format: vertical`. The local route is the main path: `editor-os new
"<title>" --take <folder or file>` runs the first cut, and every change after it is a verb
(`retime`, `keep`, `tighten`, `title`, `layout`, `overlay`, `pick`). The trunk rules in `SKILL.md`
still hold. This file only adds what a Short does differently.

## The hook title

The opening card has a small line, a BIG line and a small line. They name the video's idea (the topic, the
hook word, the frame such as mistake, trap, fix or rule), never a line of the speech, and they have
to read at grid size, so the big one is a short word or phrase. Write them with `video-script`'s hook
rules, run them through the slop gate, set the best with `editor-os title <name> "<small>" "<BIG>"
"<small>"`, and offer 3 options as a note on the hook beat. The planner never derives one, and `cut
check` fails until it's set. No slot starts before the Title scene ends: read its span in `edit.json` before planning the first one.

## Layouts

A Short draws from 7 cards in the pack: `Shorts Title`, `Shorts Head`, `Shorts Bottom`, `Shorts Split`,
`Shorts Green Screen`, `Shorts Full Screen Insert` and `Shorts Reaction`. The Layouts tab prints a trigger
`job` line under each card. Pick by that line, and never invent a layout or its geometry. The verbs and
the sync check: [sequencing.md](sequencing.md#clips-and-layouts-on-the-local-route).

- `Shorts Bottom` shows the whole head, with the caption above the hat. An overlay on it keeps its
  content above the caption band: `overlay` prints that line, and `cutcheck` and every render fail a
  clip that fills the band. A Bottom layout a word early left an empty slot, so the pair moves together.
- No scene holds past 6s: `layout <name> --at "<first words>"` splits it (same layout punches in or
  out), and `cutcheck` flags a hold it missed.
- Moves ease. The head and screen grow and shrink between layouts. A switch never hard-cuts,
  except on a source cut. The captions glide with the layout, because the Caption box moves with it.

## Overlays and b-roll before motion

A Short changes picture every 2 to 3s, and most of those changes are real things, not drawings: the
logo of the tool he names, the object, the screen, a found shot. One Short shipped 5 motion clips held 3.5 to
7s and nothing found. The bar is @nextbysophie's reel `Dc4qQwBxDCG`: about 25 changes in 63s, 4
of them full frame, and almost no drawn motion.

Read the cut once and mark every tool, object, screen and place a viewer could point at. The table picks
the picture for it and where it goes.

| The line | Picture | Where | Hold |
|---|---|---|---|
| Names a tool, app or brand | its real logo, or several around the head | over the head on `Shorts Head` (`ShortsPop`) | 1 to 2s |
| Says "a lot" of one thing ("all my inboxes") | one mark filling the frame | over the head | 1 to 1.5s |
| Names an object (a laptop, an invoice) | a keyed cutout beside him or in his hand | over the head | 1.5 to 2s |
| Talks about a result or a place | a found shot or still | under the head on `Shorts Green Screen` (the matte keeps him in front) | 2 to 3s |
| Points at a screen | one field or label: a screenshot card; a flow: the recording | card over the head; recording on `Shorts Split` or `Shorts Bottom` | 2 to 3s |
| Moves to a scene with no face needed | a found shot, full frame | `Shorts Full Screen Insert` | 1.5 to 3s |
| Says a number, a split or a structure no camera can show | a motion clip from the library | over or under the head | 2 to 3s |

In any Short: at least one overlay per 5s, at most 4 cutaways and at most 2 motion clips
(the closing CTA card is `cta-creation`'s and doesn't count). An overlay over or under the head is the common one; full frame is the exception. The long-form
shot read's cap (one beat per 30s) and its redundancy test don't apply: a logo on the word that names
it is recognition. Brief `broll` with every noun in the same turn as the motion brief, never after it.
Place each with `editor-os overlay <name> --file "<clip>" --at "<the word>"`, landing 0 to 3 frames
before the word; add `--layout "Shorts Green Screen"` for an under-the-head picture.

## Pace

Cut the fluff and make the calls yourself: the brief's hook opens, a line said twice keeps its last
whole take, a CTA said twice keeps the second unless the brief names one. Fit under 60s by cutting, not by speeding up. The planner works to `TARGET` in the edit tool's `plan.ts` (first cut,
words per minute, length) and `editor-os verify` flags a miss. Leave those numbers out of a brief.

