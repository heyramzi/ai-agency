# Craft: building a clip and checking it

## Contents

[Finishing: photographed, not composited](#finishing-photographed-not-composited), [Primitives that exist because something failed](#primitives-that-exist-because-something-failed),
[One motion language](#one-motion-language), [The frame](#the-frame), [Grounds, and the overlay cut](#grounds-and-the-overlay-cut),
[Type](#type), [Traps that render clean](#traps-that-render-clean), [Verify by looking](#verify-by-looking)

Mechanics for a Remotion motion project; SKILL.md holds the judgment. `Shot`, `Backdrop`, `tokens.ts` and
`motion.ts` are one project's kit: build your own, one file each, so every clip pulls from one place.

## Finishing: photographed, not composited
`Shot.tsx` adds 3 finishes, and a clip gets them by wrapping in `<Shot>`.
- **Grain over the whole frame, graphics included.** Grain under the graphics leaves clean elements on a
  grained ground, which reads as composited. One pass over the composite, so it can't live in `<Backdrop>`.
  New seed every frame (static grain is dirt on the lens), through `feColorMatrix saturate 0` (feTurbulence
  is per-channel, so it's coloured confetti otherwise), blended `overlay` so it bites the midtones where
  banding lives. Keep it at or under 6%.
- One key light per shot, placed where the subject is (`<Shot lightY={...}>`). Per-element glow leaves a set
  with no light source.
- Add a specular top edge. Vignette plus key light alone is a blob, and one brighter edge gives it direction.

## Primitives that exist because something failed
- `Plate` is a lit panel drawn behind its content. `filter` applies to an element's whole subtree, so a
  glow on the container holding a label glows the label. Content is an unfiltered sibling over the plate.
- `Landing` puts a `Ripple` at a point. `Ripple` has no offsets and relies on a zero-size flex parent;
  under a `width: 100%` parent the ring hangs down and right of what landed, silently.
- Say "this one" with colour. More light doesn't do it. Cross-fade between plates and don't switch a colour
  with a ternary, because a threshold on a moving value flips inside one frame and pops.

## One motion language

Continuity comes from shared physics. The eye reads acceleration before colour, so clips that each carry
their own inline springs look like the work of different hands. `motion.ts` is the one home:

- `ENTER` (16/130) arrives and takes its place, the default in an empty frame
- `ARRIVE` (13/190) lands on a surface, snappier
- `SETTLE` (damping 200) no overshoot, for opacity and light (overshoot on a fade flickers)
- `DEPART` (22/90) weight leaving, heavier than it arrived
- `TRAVEL` (inOut cubic) a journey between known positions
- `ANTICIPATE` (4 frames) the load before a big move; from dead rest it reads as dragged
- `HOLD` (18 frames) the floor on the tail after the last element resolves

**Journeys interpolate, arrivals spring.** A spring at every waypoint turns a route into arrivals. Add a
missing curve to `motion.ts` with its own WHY; an inline curve starts the drift again.

**Design both ends**. A clip built entry-first arrives well, resolves and sits until the render runs out: it stops, it
doesn't end. An `ENTER` with no exit is half a clip, so name the exit in the header comment. It's one of
three: depart (the subject leaves under `DEPART`), resolve and hold (settle, then `HOLD`), or hand over
(everything goes except the one mark the next clip inherits, the default in a set). An alpha clip has no
ground to hide behind, so its exit is what separates an overlay from a pop. A long take runs on its own 4 camera helpers, `TAU`, `dolly`,
`countTo` and `wordFlow`, and mixes none of them with these (`registers.md`).

## The frame

- **Portrait 1080x1920.** Subject between about y=300 and y=1650; below is where TikTok, Reels and Shorts put
  captions and the handle. 1650 is the composition floor. It isn't where the platform UI starts: that
  reaches higher and comes in from the right (the action rail sits over the middle-right, where a card lands).
  `python3 scripts/deadzone.py out/Clip.mp4 --for reels --sheet` measures ink inside the per-platform
  rectangles and exits non-zero; run it on every portrait render (`--for tiktok` too). We wrote it after
  `n-plus-one.mp4` passed 300/1650 and failed it: its key moment sat below y=1436 under the Reels caption block.
  The numbers are a conservative intersection of disagreeing guides; `--calibrate` fits a real screenshot.
- Check a label's rendered width against 1080. Colours come from `tokens.ts`; don't invent values. A clip carries its own `<Backdrop />`. Brand
  colours may leave the palette but still have to pass contrast: a mark darker than the backdrop needs a light
  substitute for border, glow and wires or it renders permanently unlit (Notion is `#000000`).
- A wide frame has a third of the vertical budget and twice the horizontal, so you can't rotate a portrait
  layout into it. `SAFE_X` 200, `SAFE_Y` 140. Audit every shared primitive for a hardcoded frame (`SvgLayer`
  and `Grain` default to Shorts) before trusting a 16:9 render.

### Wide clips ship in a wide and a narrow frame

The presenter cuts the same graphic beside themselves, keyed over the empty half of the room or as a split screen.
**1920x1080** is the cutaway (opaque for a straight cut, alpha for keying); **960x1080** (`NARROW_W/H`) sits
beside the face, exactly half the wide frame and committed to neither side. A clip makes 4 files, with render
scripts in pairs (`render:<set>`, `render:<set>-mov`, `<set>-narrow`, `<set>-narrow-mov`).

- Re-layout the figure and don't scale it, because 45% of a 32px label is 14px. Stand it on end (a row
  becomes a column); which element carries which claim mustn't change.
- Keep one `Layout` object per clip with a wide and a narrow member, chosen by `narrow?: boolean`. A second set of x/y
  constants is how versions drift. A single track is `along`/`cross`, swapped by `pt(along, cross)`.
- Name the key light per variant. Deriving `lightX` from a card's centre moved the approved wide render of
  2 clips. Render the wide still before and after adding the narrow one: byte-identical is the pass.
- Register `X`, `XAlpha`, `XNarrow`, `XNarrowAlpha`; the narrow pair take `defaultProps={{ narrow: true }}`.

## Grounds, and the overlay cut
`<Shot ground="grid">` (ink, 2 parallax grids, vignette) is the default so nothing ships a silent restyle.
`"bloom"` is the indigo `NoiseField`, dithered at 0.30 (a stock gradient bands across 1920px of near-black).
`"daylight"` is the pale mid-grey wall, lighter panels, ink type, key light white at about a fifth, no
`Ambient`: the long take only.

`<Shot alpha>` is a different deliverable from a restyled `<Shot>`. It has no ground, because the clip keys over his
recording. Grain composites into the alpha channel as a haze across every empty pixel and `Ambient` is a
white wash over footage, so both come out. The key light stays at about a third. Register it as its own
composition with `defaultProps={{ alpha: true }}` and `calculateMetadata={alphaPreviewWebm}`, since the editor
needs a file per option. Codecs, the render and the checks: `render.md`.

## Type

Most clips have no words, and that's the default. Add type only when the read names something the viewer is
sent away to find ("API, CLI or MCP" is the search term; no shape says it). Then labels only: uppercase,
tracked out, never a sentence, because a viewer reading prose has stopped listening. That covers a clip that
**replaces** the picture. An overlay keyed over his face is the other case (sentence case, set to be read;
`registers.md`), and a product film's type is the voice (`product-film.md`).

Load the brand font once, in one file, through `delayRender`; a font loaded inside one clip family leaves the
others in the system stack. `label()`, `numeral()` and `ui()` carry `fontFamily`; a bare `<span style>` doesn't
and Remotion inherits none, so it renders in the serif fallback with a clean typecheck. `label()` carries
`whiteSpace: nowrap`, so an over-wide caption prints through both edges.

## Traps that render clean

None fails a typecheck or an exit code; a still or a contact sheet catches them.

Code: `interpolate()` rejects a decreasing input range (screen Y falls as things rise). A `const at` inside a `.map` shadows the
imported `at()`. A bare block comment in JSX renders as text. An SVG `<mask>` is luminance, so draw edge fades in white. Clamp and
round a spring-driven value before a CSS percentage or `color-mix()` (an overshoot past 100% voids the declaration and falls back
to black). Reveal paths with `pathLength={1}`, `strokeDasharray={1}` and offset `1 - progress`; a dashed stroke can't reveal by
offset. A cubic's extent isn't its control points. A half-way `countTo` start skips rounding and shows "4.5" all hold. Re-anchor a
projection by translation only (a bigger size into `iso()` plus rescaled offsets applies it twice). A `translateY` on a layer that
also has `scale` compounds.

Geometry: an orthogonal route whose ends share a coordinate collapses to a line. An arc ending at a station's centre angle ends
inside it. An outline ring with a night fill is a hole, so a delivered object needs a mark inside. "Nothing here yet" is a dashed
box, never a hairline. A leader under about 200px reads as a stub. A group reads as one only when the gap inside is much smaller
than beside it. Stroke weight decides object versus diagram over footage: 12px+ an object, 3px a scratch on the lens. A circle is
the wrong loop in 16:9, use an ellipse. Close a broken ring by growing its arcs, not with a joining object (a seam reads as a
spinner). Draw a repeated small object as its silhouette plus one glyph (a banknote portrait read as a sad emoji). Centre a
composition as a whole, gutter included, and measure the figure's full extent (tiles, labels, bracket, the bracket's label),
vertically as well as across.

Light and motion: 2 lit strokes at one geometry double the glow, so cross-fade. Light the destination on arrival, never before.
A pulse ring on a tracked object's edge reads as a stray bubble: change the object. Spread a recycled particle's period by about
plus or minus 28%, or the band comes round in phase and pulses. A dashoffset chart reveal is a stencil lift: multiply each point's
height by a climb factor so the run rises as it extends. `SETTLE` is too slow for landings under a second apart; a beat under 5
seconds can't afford a slow stagger. A last frame equal to the first means nothing happened (an accumulation's point is drawn by
ADDING), and resolving everything back to neutral argues against the clip's own point. Bring an overlay's light up about a second
before its clause and start it about 0.2s before its first row, or the head reads blank.

Content: a label where a value belongs is an invented line item; a chart with no type invents no figure. A recognition beat is
still wrong if it only re-names the subject. A depicted third-party interface keeps its own colours, but a terminal outcome line
takes Sand, never Terra (`8 passed, 0 failed` looked like a failure). Photograph a live-screen page, never redraw it, and light
the thing that is PLAYING. Size kinetic type by ratio against the previous word (cap largest to smallest at about 6:1). Round a
locked close-up's drift to whole pixels and freeze the camera when the action ends, or every frame resamples and bills near raw.

Pipeline: `-shortest` without `apad` truncates the video to the audio. A render running in another project starves this one (`ps
aux | grep chrome-headless` before waiting). A still answers a LOOK complaint, the full clip a MOTION one. A template reserving a
block must spend it (scale the whole geometry by one factor). `SvgLayer` and `Grain` hardcode the Shorts frame. Drop only
`undefined` props, never an empty string (a card once read "€36,000K"). A merged multi-path logo comes out a blob (a subpath's
leading `m` is absolute only at the start of its path); simple-icons lacks `openai` and `monday`
( covers gaps). Nothing the
camera scales carries `will-change`: Chrome rasterises the layer once, so scaled text goes soft. Strip it from pasted
`transitions-dev` CSS (`07-panel-reveal.css` and `16-tabs-sliding.css` both set it).

## Verify by looking

```bash
npx remotion still src/index.ts <CompId> out/stills/<CompId>-<frame>.png --frame=<frame> --log=error
```

Still every phase's resolve frame and open it: what's lit, what's drawn, anything off the frame, anything
present that isn't a graphic, and **count the marks**. Remotion serves a stale webpack bundle after an edit:
`rm -rf node_modules/.cache/webpack` before re-rendering, and check a frame you know should differ, because the
mtime proves nothing. A still can't show the encode, alpha, audio or a cut, so watch the file too:

```bash
python3 scripts/watch.py out/CompId.mp4 --assert --expect-frames 240   # alpha exists, length, no empty frame
python3 scripts/watch.py out/CompId.mp4 --sheet                        # the whole clip, plus _sheet.jpg
python3 scripts/watch.py out/CompId.mp4 --fps 4 --range 1.5-3          # a flagged stretch
python3 scripts/watch.py out/cta.mov --sheet --bg 0x101820             # alpha over the colour it keys onto
```

`--assert` caches verdicts in `~/.cache/motion-watch` and forces `libvpx-vp9` on a webm, whose alpha hides in
a side channel (`alpha_mode=1`); without it a clip that lost its channel passes at 100% opacity. Cut every
still with the same decoder: on 30 Aug 2026 20 of 30 style-grid posters were cut with the default
one and showed fades wrong that the clip drew right. **Measure a finding from a decoded frame and the
template's own constants, never from a contact sheet.** `rm -rf <clip>.watch` before every `--sheet`, or a
re-render reads back the old frames. `--assert` says nothing about legibility.

Run each clip's review in a subagent that opens the frames, so the building session never loads the images.
It reviews like a harsh director and scores 1 to 10 on 7 axes: hook (something lands in the first 2s),
readable at 360px wide, motion (eases and settles, never slides or stutters at a loop seam), variety (something
new every 2 to 4s, skipped under 6s), composition (one subject, no text in the corners, no frame border), brand,
and sound sync. It names the 3 worst problems with timecodes. Fix those, re-render only the seconds they touch
and score again, until every axis reads 8 or more. The phone sheet is its own render, since a full-size sheet
hides type that dies on a phone:

```bash
ffmpeg -i out/final.mp4 -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 out/phone.png
```

A clip that doesn't carry the idea isn't scored; it goes back to the value test.

Hand the whole file, with its audio, to a video-capable model and ask for timecoded notes. **The verdict is
binding**: a note that survives a re-render is fixed or answered in the WHY comment, and an overruled `WHY` is
rewritten to record the reversal. Make it state the file's
duration and check that against ffprobe. Put each correction made at final review into your own notes.

Done when: every rendered file scores 8 or more on all 7 axes, each wide still is unchanged by its narrow
twin, and a portrait render passes `deadzone.py`.
