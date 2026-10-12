# Registers: figures, analogies, lists, overlays and 3D

## Contents

[Diagrams](#diagrams), [Analogies](#analogies),
[Lists that aren't a vertical bullet list](#lists-that-arent-a-vertical-bullet-list),
[Overlays: words over his face](#overlays-words-over-his-face), [3D](#3d)

The everyday registers: a diagram, an analogy, a list, words over his face and a rendered object. The 7 named
recipes, each measured off a reference, are in [recipes.md](recipes.md).

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
