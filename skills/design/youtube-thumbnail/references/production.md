# Producing the frame: depth, assets, handoff and critique

Steps 5b to 8 of the workflow in `SKILL.md`. They run once the variant, the words and the plate
are settled, and they are followed in order.

### 5b. Build the depth and the light

Steps 2 to 5 decide **what is in the frame**. They do not decide why two frames holding
the same things look one professional and one homemade. That is the craft layer and it
has its own rules: [`references/craft.md`](craft.md). Read it before writing
a prompt or a designer spec.

The four that carry most of it:

- **Clean means depth, not fewer things.** Three planes: a defocused ground, the sharp
  subject, one object floating between them. A frame where everything sits on one plane
  reads cluttered at two elements; a frame with the stack reads calm at four.
- **Separation is light, never a cutout.** A rim light down the shoulder and jaw is what
  puts a figure in a room. Its absence is what makes a composite look pasted, and the
  eye catches it at 320 pixels.
- **A floating object must occlude, tilt, glow and cast.** All four. Miss one and it is
  a sticker beside the head, which is the control shape.
- **Craft transfers between niches; claims do not.** Take lighting and layering from the
  best-produced channel you can find anywhere. Take subject, expression and words only
  from your own banded evidence.

### 6. Write the build order

Output exactly this, before anything is drawn or rendered:

```
THUMBNAIL BUILD ORDER
Title:        <video title as published>
Promise:      <one sentence>
Variant:      face | faceless
The one thing:<what the eye lands on, and what it tells the viewer>
Frame:        <what is photographed or composited, framing, where the subject sits>
Depth:        <what is on each of the three planes: far / subject / floating>
Light:        <key direction, where the rim runs, what the floating object spills onto>
Words:        "<2-4 words>"  | placement | plate colour
Plate:        <background, the two working colours with hex>
Assets:       <exact files, by path, each marked owned or produced>
Not in frame: <what was deliberately left out and why>
Why it wins:  <which finding in niche-evidence.md this bets on>
```

Then two variants, changing **one** variable each, so a YouTube A/B test gives a clean
signal: variant B changes the words only, variant C changes the variant (face
<-> faceless) with the same words.

### 6b. Produce the assets the frame is composited from

The build order named its assets. Some of them do not exist yet, and that is normal:
**anything that has to be exactly right is built and handed in, never described.**
The face, a real logo, words printed on an object, a count of things. A model asked
to draw any of those authors something plausible and different on every render, and
plausible is the failure that ships, because at 320 pixels a wrong mark and a right
one look the same.

Two producers cover it, and both are wired into the render script so a missing file
is made rather than skipped: a **3D tile** from the vendor's own SVG through
`logo3d:gen`, and an **artwork card** from an HTML file through headless Chrome. The
recipe rides on the asset itself as a `build` block, so the concept is reproducible
by anyone who opens it later.

Full contract, both producers, and the checks:
[`references/composites.md`](composites.md). Read it before the first
image call, not after a render comes back with an invented logo.

```bash
export GOOGLE_API_KEY=...
node scripts/render.mjs --prompt prompt.txt --ref face.webp --out out/a.png   # one frame
node scripts/render.mjs --prompt prompt.txt --ref face.webp --out out/b.png --passes 3
node scripts/render.mjs --text "<the edit instruction>" --ref out/a.png --out out/a-edit.png
```

The script prints the run's estimate before it draws anything and its spend after, and
files each frame with the model that drew it and what it cost, which is what the price
on the Concepts wall reads.

An asset that is neither on disk nor buildable stops the run and names the file. That
is deliberate: the mood-board script skips a missing reference and renders anyway,
which is exactly how a frame comes back carrying a mark nobody supplied.

### 7. Execute: designer handoff or programmatic render

Both start from the same build order. Pick by who is doing the work.

**Designer handoff.** The build order becomes a one-page spec with a layout diagram,
the exact strings, hexes, fonts and asset paths, so nothing is left to interpretation
and nothing has to be re-decided in Figma:
[`references/designer-handoff.md`](designer-handoff.md).

**Programmatic render.** Nano Banana 2 through the app's own client, with the owned
face plates and 3D tiles handed in as reference images so identity is photographic and
free: [`references/rendering.md`](rendering.md).

### 8. Critique before delivery

Run this on the finished frame, not on the plan:

- [ ] At 320x180 the one thing from step 2 is unmistakable
- [ ] One or two elements, not five
- [ ] Exactly one person, or none. No second face anywhere
- [ ] Words are 2-4, make a claim, and are not a restatement of the title
- [ ] No hype adjective, no client money, no numbered ramp of generic icons
- [ ] Nothing readable is asked of the viewer: no legible dashboard, chart or spreadsheet
- [ ] Two working colours; the plate fights the white YouTube UI
- [ ] Bottom-right 15% clear
- [ ] A rim light runs down the subject; the figure is not an evenly lit cutout
- [ ] Every floating object occludes, tilts, glows onto its neighbours and casts a shadow
- [ ] **Hands and any real logo checked at full resolution**, cropped and counted, not on
      the thumbnail-sized preview where a plausible silhouette reads as correct
- [ ] No mangled hands, eyes or glyphs
- [ ] Distinct from the last three published frames
- [ ] Every frame the run produced is filed on the concept, not only the pick
- [ ] New failure modes appended to Learned Patterns

Two or more failures means rebuild, not retouch.

The full list of what a frame must not carry, claim faults and craft faults together:
[`references/anti-patterns.md`](anti-patterns.md).

The anti-patterns are in [references/anti-patterns.md](anti-patterns.md).
