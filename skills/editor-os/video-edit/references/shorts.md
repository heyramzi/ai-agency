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

## The look

The bar is two Claude-edited Shorts: @justyn.ai `7696963836116520213` and @claragig `7697241833600077078`. A blind
read put ours under both for the same reasons,
and the fix is art direction, not more inserts: every graphic looks made for this room by one designer.

- **Colour from the room.** Pull a frame of the take and take 2 to 3 colours from the set and the wardrobe. The
  kit is those plus the brand's neutrals and accent. A graphic colour that's nowhere in the frame needs a reason.- **Quiet captions, rare big type.** One small caption style for the whole video (about 4 to 6% of frame height),
  no heavy stroke. Big type lands 3 to 8 times a video, on the word that carries the line, often behind the head
  with the matte in front.
- **In the space.** Type behind the head, then the head, then props in front with a soft shadow that matches the
  room's light. A screen that takes the frame blurs the room behind it rather than leaving it.
- **Real words.** A prop shows what it would really say ("Opus 5.5", a real commenter's name), readable on a
  phone. Grey skeleton bars only as background.
- **One kit first.** The one `motion-designer` builds the video's caption pill, display type, card and shadow
  before any prop, and every clip uses them.

These are brackets, not gates: a beat can step outside one, and its slot's `reason` says why.
## Overlays and b-roll before motion

A Short's b-roll runs as one chain: each overlay runs until the next one starts, with no `Shorts Head` scene in
between. His face comes back only after the Title and for the closing lines and the CTA.A chained clip never freezes and never slows past 0.75x. When the shot is too short for its stretch, fetch a longer
cut of the same stock shot (`source.py fetch` with a longer `--dur` from the same URL in `sources.json`), or lay a
second clip that matches the words said there. A `-held` copy with a frozen last frame reads as stuck.
B-roll sits on `Shorts Green Screen` with his face at the bottom, never `Shorts Full Screen Insert`, which hides
it.A beat that names a tool, app or screen gets the real thing: its logo, or its UI cropped to one field that
reads at phone width. A named object, idea or claim gets a prop from the kit that acts on the word: a dropdown
picked, a knob turned, a card struck through, a toggle flipped, a button clicked. Stock footage of people is fine
in light doses, about a quarter of the inserts at most; more reads as nobody's world.
Motion goes wherever a beat needs one: a number, a split, a structure, an idea no camera can show, or any
beat he picks. There's no cap on how many.

Read the cut once and mark every tool, object, screen and place a viewer could point at. The table picks
the picture for it and where it goes.

| The line | Picture | Where |
|---|---|---|
| Names a tool, app or brand | its real logo, or several around the head: `ShortsPop` first, landing on the words that name them (cluster for several, single for one) | over the head on `Shorts Head` |
| Names an object or an action (pick, turn up, cross off, switch on) | a kit prop doing it on the word: "pick the model, turn effort to max" is a model dropdown a cursor picks, then a knob turning to max | over the head |
| Talks about a result or a place | a found shot or still, light on strangers | under the head on `Shorts Green Screen` (the matte keeps him in front) |
| Points at a screen | one field or label: a screenshot card; a flow: the recording | card above the head, under his cut-out so his cap draws over it; recording on `Shorts Split` or `Shorts Bottom` |
| Moves to a scene with no face needed (not stock b-roll, which stays on Green Screen) | a drawn or screen clip, full frame | `Shorts Full Screen Insert` |
| States the video's one idea, the line the rest builds on | a full-frame motion clip in the brand (`motion-design`) | `Shorts Full Screen Insert` |
| Names 2 to 4 key nouns in a row ("a system for operations and delivery") | the `KeywordsAroundFace` cell: each noun lands around the face on the beat it's said, with letters scrambling then locking in (`fill KeywordsAroundFace --words=... --frames=...`) | over the head on `Shorts Head`, face full, words above y 600 |
| Says a number, a split or a structure no camera can show | a motion clip from the library | over or under the head |

An overlay over or under the head is the common one; full frame is the exception, 0 to 2 a Short. The long-form shot read's redundancy test doesn't apply: a logo on the word that names
it is recognition. Brief `broll` with every noun in the same turn as the motion brief, never after it. `editor-os motion place --plan <dir>` runs these rules over the plan's slots (`motion-design`, `references/placement.md`) and gives each a one-clause `reason` to write into the slot.
Place each with `editor-os overlay <name> --file "<clip>" --at "<the word>"`, landing 0 to 3 frames
before the word; add `--layout "Shorts Green Screen"` for an under-the-head picture. A gap of more than 2
frames between one clip's leave and the next one's start puts the layout before it back, so close it with
`--until` and read the frame sheet for a `Shorts Head` scene mid-chain.

## Pace

Cut the fluff and make the calls yourself: the brief's hook opens, a line said twice keeps its last
whole take, a CTA said twice keeps the second unless the brief names one. Fit under 60s by cutting, not by speeding up. The planner works to `TARGET` in the edit tool's `plan.ts` (first cut,
words per minute, length) and `editor-os verify` flags a miss. Leave those numbers out of a brief.

The last kept range runs to the end of the closing sentence plus about 0.3s of breath, never to the CTA keyword. Check its end against the transcript words, because the range's own `quote` can still list words the cut dropped.
One take is one Short: the camera decides the count, never the transcript.
