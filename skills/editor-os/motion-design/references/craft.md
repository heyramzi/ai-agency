# Craft: building a clip and checking it

Contents: Finishing, Primitives that exist because something failed, One motion language, The frame, Grounds and the
overlay cut, Type, Traps that render clean, Verify by looking.

Mechanics for a Remotion motion project; SKILL.md holds the judgment. `Shot`, `Backdrop`, `tokens.ts` and
`motion.ts` are one project's kit: build your own, one file each, so every clip pulls from one place.

## Finishing: photographed, not composited
`Shot.tsx` adds 3 finishes, and a clip gets them by wrapping in `<Shot>`.
- **Grain over the whole frame, graphics included**, in one pass over the composite, so it can't live in
  `<Backdrop>`: grain under the graphics reads as composited. New seed every frame (static grain is dirt on the
  lens), through `feColorMatrix saturate 0` (feTurbulence is per-channel, so coloured confetti otherwise), blended
  `overlay` so it bites the midtones where banding lives. At or under 6%.
- One key light per shot, placed where the subject is (`<Shot lightY={...}>`). Per-element glow leaves a set
  with no light source.
- A specular top edge. Vignette plus key light alone is a blob; one brighter edge gives it direction.

## Primitives that exist because something failed
- `Plate` is a lit panel drawn behind its content. `filter` applies to a whole subtree, so a glow on the
  container glows the label. Content is an unfiltered sibling over the plate.
- `Landing` puts a `Ripple` at a point. `Ripple` has no offsets and relies on a zero-size flex parent; under a
  `width: 100%` parent the ring hangs down and right of what landed, silently.
- Say "this one" with colour, not more light. Cross-fade between plates; a ternary on a moving value flips inside
  one frame and pops.
- People on screen (avatars, a team row, assignees) are photoreal faces of people who don't exist: pull them once from
  thispersondoesnotexist.com into the project's `public/` and crop round. Never drawn or initials avatars, never a real person's photo.

## One motion language

The eye reads acceleration before colour, so clips with their own inline springs look like different hands.
`motion.ts` is the one home:

- `ENTER` (16/130) arrives and takes its place, the default in an empty frame
- `ARRIVE` (13/190) lands on a surface, snappier
- `SETTLE` (damping 200) no overshoot, for opacity and light (overshoot on a fade flickers)
- `DEPART` (22/90) weight leaving, heavier than it arrived
- `TRAVEL` (inOut cubic) a journey between known positions
- `ANTICIPATE` (4 frames) the load before a big move; from dead rest it reads as dragged
- `HOLD` (18 frames) the floor on the tail after the last element resolves

**Journeys interpolate, arrivals spring.** A spring at every waypoint turns a route into arrivals. Add a
missing curve to `motion.ts` with its own WHY; an inline curve starts the drift again.

**Design both ends**. A clip built entry-first stops; it doesn't end. Name the exit in the
header comment, one of three: depart (under `DEPART`), resolve and hold (settle, then `HOLD`), or hand over
(everything goes but the one mark the next clip inherits, the default in a set). An alpha clip has no ground to
hide behind, so its exit is what separates an overlay from a pop. A long take runs on its own 4 camera helpers,
`TAU`, `dolly`, `countTo` and `wordFlow`, and mixes none of them with these (`recipes.md`).

## The frame

- **Portrait 1080x1920.** Subject between about y=300 and y=1650, the composition floor. The platform UI reaches
  higher and comes in from the right (the action rail sits over the middle-right, where a card lands).
  `python3 scripts/deadzone.py out/Clip.mp4 --for reels --sheet` measures ink inside the per-platform rectangles
  and exits non-zero; run it on every portrait render (`--for tiktok` too). `n-plus-one.mp4` passed 300/1650 and
  failed it: its key moment sat below y=1436 under the Reels caption block. The numbers are a conservative
  intersection of disagreeing guides; `--calibrate` fits a real screenshot.
- Check a label's rendered width against 1080. Colours come from `tokens.ts`; a Short's kit adds 2 to 3 taken from
  a frame of the take, so the graphics belong to the room (`video-edit/references/shorts.md#the-look`). A clip
  carries its own `<Backdrop />`.
  A brand mark darker than the backdrop needs a light substitute for border, glow and wires or it renders
  permanently unlit (Notion is `#000000`).
- A wide frame has a third of the vertical budget and twice the horizontal: don't rotate a portrait layout into
  it. `SAFE_X` 200, `SAFE_Y` 140. `SvgLayer` and `Grain` default to Shorts; audit every shared primitive for a
  hardcoded frame before trusting a 16:9 render.

### Wide clips ship in a wide and a narrow frame

**1920x1080** is the cutaway (opaque for a straight cut, alpha for keying over the empty half of the room);
**960x1080** (`NARROW_W/H`) sits beside the face, half the wide frame and committed to neither side. A clip makes
4 files, with render scripts in pairs (`render:<set>`, `render:<set>-mov`, `<set>-narrow`, `<set>-narrow-mov`).

- Re-layout, don't scale: 45% of a 32px label is 14px. Stand it on end (a row becomes a column); which element
  carries which claim mustn't change.
- One `Layout` object per clip with a wide and a narrow member, chosen by `narrow?: boolean`; a second set of x/y
  constants is how versions drift. A single track is `along`/`cross`, swapped by `pt(along, cross)`.
- Name the key light per variant: deriving `lightX` from a card's centre moved 2 approved wide renders. Render the
  wide still before and after adding the narrow one: byte-identical is the pass.
- Register `X`, `XAlpha`, `XNarrow`, `XNarrowAlpha`; the narrow pair take `defaultProps={{ narrow: true }}`.

## Grounds, and the overlay cut
`<Shot ground="grid">` (ink, 2 parallax grids, vignette) is the default so nothing ships a silent restyle.
`"bloom"` is the indigo `NoiseField`, dithered at 0.30 (a stock gradient bands across 1920px of near-black).
`"daylight"` is the pale mid-grey wall, lighter panels, ink type, key light white at about a fifth, no
`Ambient`: the long take only. A Short's full-frame clip takes none of these: its ground is a frame of the take,
blurred, so the viewer never leaves the room, and a prop over the face casts a soft shadow from the room's light.

`<Shot alpha>` is its own deliverable, with no ground, because it keys over the recording. Grain would haze every
empty alpha pixel and `Ambient` is a white wash over footage, so both come out; the key light stays at about a
third. Register it as its own composition with `defaultProps={{ alpha: true }}` and
`calculateMetadata={alphaPreviewWebm}`, since the editor needs a file per option. Codecs and checks: `render.md`.

## Type

Most clips have no words. Add type only when the read names something the viewer is sent away to find ("API, CLI
or MCP"; no shape says it), and then labels only: uppercase, tracked out, never a sentence, because a viewer
reading prose has stopped listening. That's a clip that **replaces** the picture. An overlay keyed over the face
is sentence case, set to be read (`registers.md`); a product film's type is the voice (`product-film.md`).

Text a person would type into a drawn UI (a chat message, a prompt, a search, a form field) is the real example, never a summary in labels or placeholders. The labels-only rule is for captions, not for what's inside the UI: a bubble that says "Who I am · What I do · What I want" becomes "Hi, I run a 6-person bookkeeping firm in Lyon. Help me write a reminder to a client who is late on documents."
House face only: `BRAND_FONT`, with `useBrandFont()` called once in the composition (`src/font.ts` in the kit);
Clash Display got "stick to our fonts". The generated brand lists one static 400 file, so a heavier weight is a
faked bold: load the variable Satoshi (300 to 900). A font loaded inside one clip family
leaves the others in the system stack. `label()`, `numeral()` and `ui()` carry `fontFamily`; a bare
`<span style>` renders in the serif fallback with a clean typecheck. `label()` carries `whiteSpace: nowrap`, so an
over-wide caption prints through both edges.

## Traps that render clean

Code, geometry, light, content and pipeline faults that pass a typecheck and an exit code:
[traps.md](traps.md). Read it before signing off any clip.

## Verify by looking

```bash
npx remotion still src/index.ts <CompId> out/stills/<CompId>-<frame>.png --frame=<frame> --log=error
```

Still every phase's resolve frame and open it: what's lit, what's drawn, anything off the frame, anything present
that isn't a graphic, and **count the marks**. A reveal or a count is judged on every frame through it (`watch.py
--fps 30 --range <its seconds>`): the hold still passed while mid-reveal frames showed the broken U. Remotion serves
a stale webpack bundle after an edit: `rm -rf node_modules/.cache/webpack` before re-rendering, and check a frame
that should differ, because the mtime proves nothing. A still can't show the encode, alpha, audio or a cut:

```bash
python3 scripts/watch.py out/CompId.mp4 --assert --expect-frames 240   # alpha exists, length, no empty frame
python3 scripts/watch.py out/CompId.mp4 --sheet                        # the whole clip, plus _sheet.jpg
python3 scripts/watch.py out/CompId.mp4 --fps 4 --range 1.5-3          # a flagged stretch
python3 scripts/watch.py out/cta.mov --sheet --bg 0x101820             # alpha over the colour it keys onto
```

`--assert` caches verdicts in `~/.cache/motion-watch` and forces `libvpx-vp9` on a webm, whose alpha hides in a side
channel (`alpha_mode=1`); without it a clip that lost its channel passes at 100% opacity. Cut every still with that
decoder: on 30 Aug 2026 20 of 30 style-grid posters cut with the default one showed fades wrong. **Measure a finding
from a decoded frame and the template's own constants, never from a contact sheet.** `rm -rf <clip>.watch` before
every `--sheet`, or a re-render reads back the old frames. `--assert` says nothing about legibility.

Run each clip's review in a subagent that opens the frames, so the building session never loads the images. It
reviews like a harsh director and scores 1 to 10 on 7 axes: hook (something lands in the first 2s), readable at
360px wide, motion (eases and settles; never slides, stutters at a loop seam or flashes over 3 a second), variety
(something new every 2 to 4s, skipped under 6s), composition (one subject, no frame border), brand, and sound sync.
Motion and composition also fail on the tells of motion nobody designed, each with its fix: a crossfade or blur-in
between unrelated scenes (grow the next scene out of an element on screen), a particle burst, shockwave ring or lens
flare from nothing (motion starts from something on screen), overshoot on every element (landings only), camera
shake, RGB split, HUD text in the corners, a hold with nothing left to read, a second glow (`storytelling.md`),
`Math.random` (Remotion's seeded `random()`, or 2 renders differ), and anything that would pass as a stock template.
It names the 3 worst problems with timecodes. Fix those, re-render only the seconds they touch and score again,
until every axis reads 8 or more. The phone sheet is its own render, since a full-size sheet hides type that dies
on a phone:

```bash
ffmpeg -i out/final.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 out/phone.png
```

A clip that doesn't carry the idea isn't scored; it goes back to the value test. Three more tests, any fail sends it back:

- Mute: sound and captions off, does the picture alone tell the beat's idea?
- Swap: cover the logo and swap in another tool. A clip that names a tool and works unchanged is generic.
- Started action: every prompt typed, claim made or toggle flipped gets answered on screen before the clip ends. Capabilities are never flashed as small labels.

**The verdict is binding**: a note that survives a re-render is fixed or answered in the WHY comment, and an
overruled `WHY` is rewritten to record the reversal.Hand the whole file, with its audio, to a video-capable model and ask for timecoded notes. Make it state the file's
duration and check that against ffprobe. Put each correction made at final review into your own notes.

Done when: every rendered file scores 8 or more on all 7 axes, each wide still is unchanged by its narrow
twin, and a portrait render passes `deadzone.py`.
