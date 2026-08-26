# Composing a board

The element vocabulary, the colour rules and the layout constraints. How a board gets
drafted, checked and pushed is in `SKILL.md`.

## The vocabulary

`node(cx, cy, r, label)` is a circle plus its centred caption and is the workhorse. `circle`, `text`,
`arrow`, `underline` and `ring` are the rest. Coordinates are a plain top-left canvas, y grows
downward, and every position is absolute, so a board is a set of named x constants with items hung
off them.

Colours are two constants: `INK` for every stroke and `HIGHLIGHT` for the marker pass. Derive both
from your own brand tokens rather than picking them by eye, and keep them as hex, because Excalidraw
stores hex. If the palette moves, re-derive rather than eyeballing a replacement.

**The sketchy look is a switch, not the tool.** `LOOK` in `tool/src/scene.ts` is `clean` since 16 August
2026: figures draw as straight strokes in a clean face, and only the highlight ring and underline stay rough,
because those stand in for a marker pass over a finished diagram. `hand` restores rough.js and
Excalifont everywhere. Never set roughness or `fontFamily` on an element to work around the house
look; change `LOOK` and rebuild, or every board drifts apart.

## One hue per concept

A board that carries several parallel ideas gets a colour per idea, from `HUES` in `tool/src/scene.ts`
(`indigo`, `amber`, `rose`, `green`, `teal`, `violet`). Each entry is a stroke, a pale tint for the
fill, and a darker label that survives sitting on that tint, so `node(cx, cy, r, name, size,
HUES.amber)` gives a filled circle whose caption stays readable.

**Colour the things that differ, leave everything else `INK`.** Four spaces, five stages, three
products: those are parallel concepts and a viewer sorts them by colour before reading a word. The
explanation around them is not a concept, it is prose, and prose in six colours is decoration.

**The hue is the concept's identity across the whole board, and across the set.** Give a caption the
same hue as the node it belongs to, and give an arrow leaving a node that node's hue, so a group
reads as a group. If a second board covers the same concepts, it keeps the same assignment: two
boards in one video that recolour the same four ideas cost more than they buy.

**One monochrome board is still the default.** Reach for `HUES` when the board is a taxonomy or a
comparison. A board that is one argument in three beats stays `INK` with `HIGHLIGHT` for emphasis.

## Composition

**One column per beat of the argument.** Declare the centres as constants (`const STACK = 380`) and
place everything relative to them. Two or three columns fill a frame; four is too wide to read on
camera.

**Captions sit beside a node, never on it.** Text is centred on its `(cx, cy)` and its width is
roughly `longest_line * fontSize * 0.52`, so a caption's half-width plus the circle radius decides
the offset. Getting this wrong is the most common defect and the layout gate below is what catches it.

**Rings and underlines are the emphasis budget.** One `ring` for the single number the board is
built around, `underline` for a title and for a total that has been ruled off. More than two rings
and none of them mean anything.

**Show arithmetic as a sum, never as a total.** A board is the one surface where the working can be
on screen: the parts, a rule across, then the result. Quoting the result alone throws away the
retention that the calculation buys.

**The talking points ride along as their own board, at negative x.** Build them with `paragraph`,
which anchors at the top-left, and push them separately so they land in the same room without
touching the diagram. **Bullets, never prose**: the opening and closing lines are said as written and
the middle is spoken live, so a written-out middle gets read out on camera. `shorts-production`, "The
note shape", owns that split.
