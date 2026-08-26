# Diagrams: boxes, arrows, and the four ways they go wrong

A box-and-arrow figure is the one graphic that earns its place by *arrangement*. Speech is serial,
so a read has to name five parts one after another. A frame holds them at once and shows which one
feeds which. That is the third of the four things a graphic can add - a structure that has no name
yet - and it is a real one.

It is also the graphic that fails most predictably, and every failure is a failure of restraint.

## The four failures

**Mermaid slop.** Default rounded boxes, a drop shadow, six colours, a font nobody chose. It reads
as output rather than as design and it dates the video to the tool. Nothing in this project renders
a diagram from a text description. `diagram.tsx` is the vocabulary; a clip composes it by hand.

**Density.** Everything the read mentions gets a node, so eleven boxes arrive and the viewer reads
none of them. **Four to six.** The highest-quality edit available here is deletion, and the box you
are reluctant to cut is usually the one the read already explained in words.

**No focal point.** Every node styled the same is a map with no "you are here". Exactly one node
carries the accent. Two accents is zero accents. This is `craft.md`'s rule - say "this one" with
colour, not with more light - and a diagram is where it gets broken first.

**Arriving whole.** A finished diagram dropped on screen is a slide the viewer has to parse alone
while the speaker keeps talking. Nodes land in the order the speaker names them; edges draw after the two boxes they
join both exist. A figure that assembles itself in the read's own order has taught the structure by
the time it is complete.

## The vocabulary

`src/diagram.tsx`. Three parts and nothing else, because a diagram where five boxes have five
treatments has spent its whole contrast budget on decoration.

- **`Node`** — a `Plate` with an uppercase title, an optional sentence-case sub, an optional mark on
  the left for a logo or a glyph. `kind="focal"` fills terra; everything else is night with a veil
  edge.
- **`Edge`** — an orthogonal polyline with a drawn head. `solid` is flow. `dashed` is a return, a
  write-back, a loop closing, and that is the only semantic difference a line style is allowed to
  carry here. A feedback edge drawn like a forward edge turns a loop into a tangle.
- **`Edges`** — the one SVG layer they all sit on, under every node. See `SvgLayer` in
  `primitives.tsx` for why a bare `<svg>` in an `AbsoluteFill` silently never paints.

Routes are `straight`, `hv`, `vh`, `hvh`, `vhv`. Right angles, never curves: a curved edge between
two rectangles reads as decoration, and past three edges the curves cross at angles the eye has to
untangle. Right angles read as a circuit, which is what a system diagram is claiming to be.

A return path takes its own route rather than retracing the forward one. Two movements on the same
road read as traffic; a different road says they are different movements, which is the claim.

## Uppercase titles, sentence-case subs

A node label is not read, it is **recognised**. The viewer is matching a word to a shape they will
see again two arrows later, and uppercase gives every label the same silhouette height, which is
what makes a row of them scan as a set. The sentence-shaped half of the idea goes in the sub.

One trap that only a still catches: on a terra focal node the `muted` token is the same value as the
fill, so the sub disappears. Contrast is against what is behind the text, never against the
palette's idea of "secondary".

## What to take from cathrynlavery/diagram-design, and what not to

That skill is 28 static HTML diagram types with an editorial skin. Its output is a web page, so
none of its markup is usable here. Three of its judgments are, and they are already folded into the
rules above: **one accent, reserved for the one or two things the reader should look at first**;
**target density around 4/10, every node earns its place**; and **no generic rounded boxes** as a
default register.

Its taxonomy is worth reading before composing an unfamiliar figure, because naming what you are
drawing - a layer stack, a swimlane, a quadrant, a loop - usually settles the layout in one step.
Its skin is not: paper-and-ink editorial on white is the opposite of this project's ground, and
adopting its palette would restyle the whole set. Colours come from `tokens.ts`.

## Landscape is the frame now, and it is not portrait rotated

`tokens.ts` still says 1080x1920 because Shorts are still Shorts, but every course and long-form
read is 1920x1080 and takes its geometry from the per-project file.

A landscape diagram has roughly a third of the vertical budget and twice the horizontal, so the same
figure has to be spread sideways. Two consequences that have both already cost a rebuild:

- **Empty side gutters mean the clip was not redesigned.** Widen the subject until it carries the
  vertical budget, then spend the gutters on things that belong to it: a readout on one side, the
  labels on the other.
- **Check the outer eighth.** `SAFE_X` is 200 and `SAFE_Y` is 140. A node centred at x=1600 with a
  480px width ends at 1840, which is outside the band and inside YouTube's hover chrome.

## Verify at the resolve frame of every phase

Render a still at the frame each phase lands, and look at all of them. The failures this register
produces are silent by construction: an arrowhead drawn past its endpoint and hidden under the node,
a line clipped at x=1080 by a portrait-sized SVG layer, a stroke that runs out before the end of its
path. Every one of those renders clean, typechecks clean and exits zero.
