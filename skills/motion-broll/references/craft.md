# Craft

How a clip is actually rendered: the finishing passes, the primitives that
exist because something failed without them, the frame, the two grounds, the alpha cut, type, and
who is allowed to nudge what. SKILL.md holds the judgment; this holds the mechanics.

## Finishing: what makes it look photographed instead of composited

Three things, all in `Shot.tsx`, and every new clip gets them by being wrapped in `<Shot>`.

**Grain over the whole frame, graphics included.** The backdrop's shader noise sits *under* the
graphics, so every box and label on top of it is mathematically clean, and clean elements over a
grained ground is the exact signature of something composited rather than shot. One pass over the
composite puts everything in the same air; it cannot be done inside `<Backdrop>` by definition.
Details that matter: the seed changes every frame (static grain is dirt on the lens, it has to
boil), it goes through `feColorMatrix saturate 0` (feTurbulence is per-channel, so at any visible
opacity it is coloured confetti), and it blends `overlay` so it bites in the midtones where banding
lives and leaves the blacks alone.

**One key light per shot, positioned where the subject is.** Glow used to be a property of individual
elements, so each clip implied its own light source and a set of them cut together had none. A light
that does not follow the subject lands on the wrong half of the frame the moment a clip composes
anywhere but the centre, so `<Shot lightY={...}>` takes it.

**A specular top edge.** With a vignette darkening four corners and a key light in the middle, the
frame is a blob. One brighter edge gives the light a direction, which is the difference between
"there is a glow here" and "this is lit from above".

## Panels and impacts go through the primitives

Two failures were structural rather than matters of taste, so they are fixed in `primitives.tsx` and
nothing new should hand-roll either:

- **`Plate`** is a lit panel drawn *behind* its content. `filter` applies to an element's whole
  subtree, so a glow on the container that holds a label glows the label too and the text goes soft.
  Content is an unfiltered sibling laid over the plate.
- **`Landing`** puts a `Ripple` at a point. `Ripple` is absolutely positioned with no offsets and
  relies on a zero-size flex parent; give it a `width: 100%` parent instead and the ring hangs down
  and right of whatever landed, silently.

And a rule that is not a component: **say "this one" with colour, not with more light**, and
cross-fade two plates rather than switching a colour with a ternary. A threshold on a value that
moves continuously flips inside one frame and pops, and a colour cannot be interpolated inside a CSS
string.

## The frame

- 1080x1920. Keep the subject between roughly y=300 and y=1650. Below that is where TikTok, Reels
  and Shorts put captions and the handle.
- That band is a floor, not a composition. Work out the full extent of everything the clip draws and
  centre *that*, or a design that grows downward ends up top-heavy with a dead third underneath.
- Type has almost no horizontal room in portrait. Check the rendered width of a label against 1080,
  not the left edge of the element holding it.
- Colours come from `tokens.ts`, which is a transcription of your own brand palette. Do not invent
  values.
- Every clip carries its own `<Backdrop />`. Clips are cut in individually and never inherit one.
- Brand colours are exempt from the palette, not from contrast: a mark darker than the backdrop needs
  a light substitute for its border, glow and wires or it renders permanently unlit. Notion is
  `#000000`.

## Every landscape clip ships in two frames, not one

A full-frame clip is a cutaway: it replaces the picture for a few seconds. The speaker also cuts the same
graphic **beside** himself, either keyed over the empty half of the room or as a vertical split
screen, and that is a second frame rather than a second use of the first one.

- **1920x1080** is the cutaway. Opaque for a straight cut, alpha for keying over the whole picture.
- **960x1080** is the beside-the-face frame. `NARROW_W` and `NARROW_H` in
  the per-project file. Opaque for a split screen, alpha for keying next to the speaker.

Four files per clip, and every one of them is a deliverable. The render scripts come in pairs:
`render:<set>` / `render:<set>-mov` for the wide frame and `render:<set>-narrow` /
`render:<set>-narrow-mov` for the narrow one.

**The narrow frame is exactly half the wide one and it is committed to neither side.** Both of the speaker's
uses want to place and resize it himself, and a graphic composed into the left half of a 1920 frame
has already chosen the left half. A 960x1080 file has not, and it drops onto a split screen at 1:1
with no scale at all.

**It is a re-layout, not a scale.** Every label in a landscape set is sized against a 1920 frame,
and 45 percent of a 32px label is 14px, which is unreadable at 1080p and worse after the encode. So
the figure is stood on end: a row of stations becomes a column, a vertical wall becomes a horizontal
one, a rack beside the card goes under it. What must not change is which element carries which
claim - a variant that moves a break, a focal point or an accent is a different clip, not a variant.

**One `Layout` object per clip, two members, chosen by a `narrow?: boolean` prop.** A second set of
x/y constants is how the two versions drift apart the first time somebody nudges anything. Where the
figure is a single track, express it as `along` and `cross` and let `pt(along, cross)` swap the axes;
where it is not, name the boxes and let the two objects differ.

**The key light is named per variant, never computed from the layout.** It follows the subject, and
the subject moves between frames. Deriving `lightX` from a card's centre changed the *approved wide
render* of two clips by moving their key light, which nothing in the diff looked like.

**Prove the wide render did not move.** Render its still before and after adding the narrow variant
and compare the hashes. Byte-identical is the pass. A pixel of drift is invisible to the eye, real in
the file, and free to catch.

Register four compositions per clip: `X`, `XAlpha`, `XNarrow`, `XNarrowAlpha`. The narrow pair takes
`defaultProps={{ narrow: true }}` and the alpha of it takes both flags.

## Two grounds, and the overlay cut

`<Shot ground="grid">` is the original world: ink, two parallaxing grids, a vignette. It is what
every already-approved clip stands on, and it stays the default so that nothing ships a silent
restyle.

`<Shot ground="bloom">` is the indigo noise field in `NoiseField.tsx`: a soft bloom of brand colour
on ink, dithered hard at 0.30. It is a material rather than a finish - at low grain it is a stock
gradient, and the grain is also what kills the banding a gradient shows across 1920px of near-black.
One thing doing two jobs.

**`<Shot alpha>` is a different deliverable, not a different look.** It renders with no ground at
all, for a clip keyed over the speaker's screen recording instead of cut in whole. Three things follow:

- The grain and the specular edge come out with the backdrop. `Grain` is a full-frame rect at
  `mixBlendMode: overlay`, and over a transparent ground it composites straight into the alpha
  channel as a boiling haze across every pixel that is supposed to be empty. The key comes out
  dirty. `Ambient` is a cream gradient down the top quarter, which over footage is a white wash.
- The key light stays, at about a third strength. It is the one pass that makes a graphic look like
  it is in the same room as the shot.
- Register the alpha version as its **own composition** with `defaultProps={{ alpha: true }}` and
  `calculateMetadata={alphaPreviewWebm}`, not as a render flag. Descript needs a file per option,
  and "over the speaker's screen" versus "instead of the speaker's screen" are two different shots for an editor to
  choose between.

Render it the way `youtube-ctas` does: ProRes 4444 through `remotion.prores.config.ts`, then ffmpeg
to `qtrle`. Remotion cannot write QuickTime Animation and Descript only keys the MOVs.

## Type

Most clips have no words at all, and that is the default. Add type only when the read names
something the viewer is being sent away to find. "API, CLI or MCP" is jargon, it is the search term,
and no shape can say it.

When you do: labels only, uppercase, tracked out, never a sentence. A viewer reading prose has
stopped listening.

**That rule covers a clip that replaces the picture, and only that.** An overlay keyed over the speaker's face
is the case where the sentence is the point: the speaker is reading the list out loud and the words on screen
are what the speaker is saying. Those are sentence case, in Space Grotesk, set to be read.
[overlays.md](overlays.md) holds the split and the three failures that only happen over footage.

The brand font lives in `src/font.ts` and is loaded through `delayRender`. It used to sit inside
`youtube-ctas/`, which is why every b-roll clip was set in the system stack while every CTA was set
in Space Grotesk. One project, one typeface.

## Who is allowed to fine-tune: the constants-versus-Studio call

Remotion Studio can now write edits back into the source, but only where it can read the markup:
inline `style` objects, inline `interpolate()` calls with hardcoded ranges and easings, `scale` /
`translate` / `rotate` instead of `transform`, inline `defaultProps` on `<Composition>`, and
`Interactive.Div` with a hardcoded `name`. A value behind a constant, a spread or any arithmetic
goes grey in the Studio and can only be changed in the editor. `remotion-interactivity` has the
full list.

That is in direct conflict with the two rules above it, and the conflict is resolved by what the
clip is for, not by preference:

- **A set of clips cut into one read keeps the constants.** Named frame numbers in `beats.ts` and
  named springs in `motion.ts` are what make fifteen clips look like one hand. Hardcoding those
  inline to buy Studio handles trades the only thing holding the set together for a convenience,
  and the drift comes back within one video. Retiming stays one edit.
- **A one-off that the speaker will nudge by eye takes the inline form.** Overlays, CTAs, a title card:
  no siblings to stay continuous with, so the faster loop beats the abstraction. Colour still comes
  from `tokens.ts`, pasted inline with the token name in a comment beside it.

Never mix the two inside one composition. Half-interactive markup reads as broken rather than as
deliberate, because the greyed-out control gives no reason for being grey.

