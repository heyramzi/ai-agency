# Registers: figures, overlays, 3D and the named recipes

## Contents

[Diagrams](#diagrams), [Analogies](#analogies),
[Lists that aren't a vertical bullet list](#lists-that-arent-a-vertical-bullet-list),
[Overlays: words over his face](#overlays-words-over-his-face), [3D](#3d),
[The long take](#the-long-take), [The live screen](#the-live-screen),
[The code walk, the introduction, the hand-drawn and the paper board](#the-code-walk-the-introduction-the-hand-drawn-and-the-paper-board)

The everyday registers first (diagram, analogy, list, words over his face, a rendered object), then 6 named
recipes measured frame by frame off a reference. Build one worked example of a recipe before using it.

## Diagrams

A box-and-arrow figure adds a structure with no name yet. It fails 4 ways.

- Mermaid slop: default rounded boxes, a shadow, 6 colours, a font nobody chose. Nothing here renders a
  diagram from text: `diagram.tsx` is the vocabulary and a clip composes it by hand.
- Density: 4 to 6 nodes. The box you're reluctant to cut is the one the read already explained.
- Nothing to look at first: exactly one node takes the accent, and a second accent cancels the first.
- Arriving whole: nodes land in the order he names them; edges draw after both boxes exist.

The vocabulary, from `diagram.tsx` only: `Node` (a `Plate`, uppercase title, optional sentence-case sub,
`kind="focal"` fills terra), `Edge` (orthogonal polyline: `straight`, `hv`, `vh`, `hvh`, `vhv`; dashed means
a return or a loop closing and nothing else; a return takes its own road), `Edges` (the one SVG layer, via
`SvgLayer`: a bare `<svg>` in an `AbsoluteFill` never paints). Labels are recognised, not read. On a terra
focal node the `muted` token equals the fill and a sub vanishes, so check contrast against what's behind the
text. From `cathrynlavery/diagram-design` we kept 3 judgments only: one accent for the first look, density near 4/10 and no generic rounded boxes.

Verify at every phase's resolve frame. An arrowhead hidden under its node, a line clipped by a
portrait-sized SVG layer and a stroke that runs out early are all silent failures. Check the outer eighth too.

## Analogies

An analogy claims 2 structures are the same shape. `AnalogyBridge` (`analogy.tsx`) puts familiar left, real
right, one line per pair, landing as he names them, so the viewer watches "recipe" become "template". The line
arrives before its word; the accent is an edge on a whole column, never a fill. It needs 4 tests, and any failure costs
more than it buys: the familiar side is one everybody knows (kitchens, keys, rent, hiring, traffic); the
structures match on 3 points or more; it breaks somewhere and the header comment names where; it isn't
already his own words.

Pick one familiar world for the whole video (a kitchen: recipes, the pass, the rack) and extend it before
opening a new domain. Name where it breaks: a restaurant's customers order off a fixed menu, an agency's
client asks for what isn't on it.

For a quantity, draw the quantity.

## Lists that aren't a vertical bullet list

A vertical list loses the viewer: the eye jumps ahead and leaves. 4 replacements:
a horizontal spectrum (a gradient axis, numbered ticks, cards zig-zagging above and below with a real
thumbnail, label, 2-line note and metric chip; holds 10 to 15 items); a sliding calendar (monthly grids
in 3D perspective, the camera gliding across, the active month lit); a paired-container reveal (2 pills
at once, the first filled and the second an empty wireframe, so the empty slot is an open loop); a formula
bar (`[topic] + [format] + [layout] = Formula` as pill badges summing into a container).

## Overlays: words over his face

An overlay keys over him, and he stays on screen. Pick the register by the beat: his face plus a list he's
reciting is an overlay (he's the proof, the words the index); a structure, quantity or mechanism is full
frame; a screen he's demonstrating gets neither, since a graphic over evidence argues with it. An overlay is
the cheaper to be wrong about.

`caption.tsx` has 3. `GlassCaption` (frosted pane) for a long list, a set, or a bright or busy plate.
`PlainCaption` (words on nothing) for one statement of 2 or 3 lines. `DefocusedCamOverlay` blurs his
plate (about 20 to 30px plus a dark vignette) so vocal presence stays while 100% of focus goes to a
foreground fork or formula. A video using only one has a lower third or subtitles.

Sentence case here, uppercase everywhere else, by what the clip replaces: the picture takes `type.ts`
(uppercase, tracked, labels only). A clip that sits on it takes `caption.tsx` (sentence case, brand
face). Mixing them in one video looks like 2 hands. Rows land one at a time on his words: frames between
the first and last named item divided by row count. A list whose rows compete shows every row from frame one
with only the spoken one lit.

3 failures only happen over footage (clean render, clean typecheck, exit zero):

- Cream text on a bright wall vanishes, and a wide soft shadow darkens the field, never the glyph edge.
  `legible()` is 3 shadows (tight zero-offset outline, contact, field); the outline carries it.
- The alpha key light behind bare type reads as a grey disc on his wall: `lightStrength={0}` on any overlay
  that's all type.
- `backdrop-filter` samples the same document and an alpha render has nothing behind, so build the pane from
  a layered gradient and faked blur.

**Verify against a bright card:** composite the still over `#d8d3c8`, about the wall and sofa behind him.

## 3D

A real rendered object keyed over him (`three.tsx`, `@remotion/three`). A WebGL frame costs several DOM
frames, so use it only when the object is the point (a hierarchy, a volume, a physical thing). The tell is
reflection: light travelling across a curved surface. 2 or 3 per video.

- The environment decides whether it looks bought or made. A `meshPhysicalMaterial` with no environment is flat
  plastic however many lights you add. 3 lights then stop (key, rim, low fill); `RoomEnvironment` ships in
  `three`, generated in memory. The material is 2 layers: a coloured metal body under a clear coat.
- 2 wiring bugs look like taste failures. A module-level renderer handle isn't reactive (use
  `useThree`, stash nothing from `onCreated`), and assigning `scene.environment` in `useEffect` misses
  Remotion's frame capture, so the render equals one with no environment. `PMREMGenerator.fromScene` is
  synchronous, so skip `delayRender`; a loaded model, HDRI or texture needs it.
- Alpha: `gl={{ alpha: true }}`, no `scene.background`, no brand grain (the surface has its own specular).
  A WebGL edge clean on ink can carry a dark fringe on a light wall.
- Long glass: the default 75 degrees gives a small object harsh perspective; `Stage` defaults to 25, a
  phone's.

## The long take

Landscape, 10 to 15s, no cut: one unbroken canvas the camera travels, for an argument with more than one
step. Reference `youtube.com/watch?v=5-EFvUKqZmA` from 1:14, torn down with `ffmpeg` extraction and phase
correlation (`python3 scripts/teardown.py sheet|camera|ground src.mp4`, about 10 minutes; `camera` and
`ground` take `--ss`). Run it on your own render too: `SpecLongTake` measures 0 hard cuts, tau 0.46s and a
ground swing of 75 against the reference's 76.

1. The camera never rests: residual 0.10 to 0.31% of frame width per frame, about 0.2%. A frame that
   stops reads as a slide.
2. One settle constant, tau about 0.5s, shared by everything (dolly, counter, type). A dolly accelerates
   15 frames then decays; roughly 1 part acceleration to 4 settle (tau measured 0.28 to 0.76s).
3. 2 speeds: travel 4.0 to 4.2% per frame, drift 2.8%, residual 0.1 to 0.3% ("alive").
4. Mid-grey ground, `#6F6F6F` to `#C8C8C8`, 2 gradients multiplied; panels are the light thing.
5. Type is a live per-word flow: words land 100 to 170ms apart, each larger, lighter and blurred,
   travelling in as it darkens and shrinks. Sentence case is legal because it's the conclusion the read
   hasn't reached yet.
6. A counter starts at half the target, accelerates, decays on tau and lands exact ($5,006 to $10,000
   over 2.3s), so frame one is a plausible number.
7. A comparison is a visual rhyme: same card, position and connector twice, recoloured.
8. The UI is vector, so it can be lit, blurred and typed into.
9. A held comparison (second reference, 1:30 to 2:11) gains one label per phrase within about 0.2s of its
   word, the label the compressed noun ("40x more followers"), moves between objects as a fast blurred whip.
   At 12s against a 41s reference, the build lost the 2 return legs. The author, 28 Aug 2026: "the anchor
   comparison lasted more than half a minute." The fix: 5 stations, a label every 50 frames. Use it when
   the read spends 30s or more on one comparison; use the travelling shape when the argument moves places.

Build (`src/specimens/LongTake.tsx`): `<Shot ground="daylight" cameraX cameraY>`, one `<Canvas>` per
sequence wider than the frame, elements at world coordinates, the camera a transform on the canvas. Nothing
has an entrance (a fade timed to the camera's arrival renders a grey wall with a line across it).
Primitives in `motion.ts`: `settle(frame, from, to, at)` at tau 0.45s, `countTo`, `wordFlow`. No hard cut.
Clock: establish 15%, build 45%, conclude 25%, pull back and hold 15%. The palette was Meta's because the
subject was: map the structure onto brand tokens, never copy the hex. One per video, on the beat that carries
the argument.

## The live screen

A real interface at poster scale filling the frame, where its own state change is the beat: no window, ground,
shadow or pointer. Reference `youtube.com/watch?v=SFRXddv7XfE` 2:29.67 to 2:45.70: visit one 295 frames (page
arrives empty, gets annotated, loads), a face beat of 32, visit 2 at 154 (pushed in, section swap, selection).

- Roughly 250% zoom with the window thrown away; the query's already typed and nobody operates anything.
- The annotation is a second voice and the only thing that glows: monospace mint `#2EE3BF`, a lead line
  one word every 6 frames, notes one character per frame (both about 22 chars/sec), the note starting before
  the line above finishes.
- It clears, then 17 frames of nothing before results arrive. Deleting the pause is the first cut a
  session makes and it breaks the beat.
- The page loads like a page: 3 rows 3 frames apart, the plate settling up about 5% of frame height,
  done 27 frames after the first row. Then 99 frames dead still, only a caret blinking at a 32-frame period.
- The section swaps by a 24-frame cross-dissolve, the old page still about 12% readable 18 frames later (the
  one cross-dissolve allowed: a page replacing itself). The selection band lands in 4 frames, never a drag,
  0.7s before the words naming it.
- Plate `#383A40` to `#2E3034`, a 2px scanline at 5 levels, untilted.
- The reference restates the read at 2:29, breaking redundancy: copy the device and skip the copy.

Build (`src/anchors/LiveScreen.tsx`; `design.ts` section C holds the numbers): 1920x1080, tokens
`screenCore/Edge/Panel/Ink/InkMuted/Scanline` untinted, `MONO_FONT` (a fixed advance makes per-character
reveal read as a machine writing), no alpha variant. Words are props; re-render, don't fork. The artefact
must be the real thing: real favicons, URLs, titles and answers, taken off a real search. It runs under a
voice that never stops; timed against silence it's 30% too slow. Tools: `teardown.py cuts|palette|sheet`.

## The code walk, the introduction, the hand-drawn and the paper board

Code walk (30 Aug 2026): a file at poster scale, no window, no syntax colours. Use it when the proof is
code a viewer could check. The camera settles on one line, the rest drops to 30%, a margin note says why,
3 seconds still, then a second line that makes one argument with the first. The numbers come from `code-scroll`:
21 frames still, a 36-frame 196px symmetric-ease travel, a 14-frame dim starting 2 frames before the
travel ends (to about -14% luminance; started after the move it reads as 2 events), then 87 frames still.
2 stations, never 3. Silent.

Introduction (30 Aug 2026): nothing introduces itself. A question is typed into a composer on the pale
wall, the assistant thinks, the answer is the product, a claim somebody else made. Off
`blue-sweater-intro-video`, 288 frames at 24fps: line 2 to 12, composer 35 to 60, typing 104 to 132, hold
132 to 283 (6.3s, over half). A cut on the click makes it an ad. The question asks for the category, never the
product. Draw the wait (36 frames of one breathing dot). The field leaves before the card lands. A single
pointer and click (the one operated screen, because the cursor is the point). Generic composer skin; length
set through `askDuration`.

Hand-drawn (the default for a new clip; anything else needs an argument. The author: "I think we should go for
this for all the future design more hand-drawn kind of"): paper, one marker colour per video, geometry a
machine didn't make. 3 pieces: a seeded wobble (so it doesn't boil) with rough primitives, an ink layer
(everything draws on; a fade-up reads as composited), a paper ground with no key light, vignette or glow.
Draw the analogy as the thing itself, with no symbol standing in ("why don't you simply use the actual metaphor of the lobster
restaurant"): the redundancy rule bars drawing the words but allows drawing the world. Logos stay real marks on a rough
tile. Draw a creature at its familiar angle: top-down, the lobster was a beetle at 45 degrees and a rabbit
at 20, and it cost 3 passes.

Paper board (vertical, from a 62.5s Reel, 1080x1920, 24fps; sources live in `sources.json`): a light
gridded ground, the speaker demoted to a card at the foot, one real screenshot as the subject, one karaoke
word between. Top to bottom, fixed for all 62s: a 2-line headline (the load-bearing half in accent red), the
artefact at about half the height, one karaoke word, the speaker in a rounded card at about 35% of frame width.
18 hard cuts, median gap 3.46s, alternating board and full-bleed face; karaoke changes every 0.35 to 0.40s,
one word, never a phrase; the headline builds grey, resolves black and red. 4 palette values. It needs a
light ground, a face plate built against real raw footage, a one-word-per-cue karaoke track and screenshots
(somebody else's screen, so the licence goes in the ledger). Nothing is drawn. The work is capture, layout and cadence.
