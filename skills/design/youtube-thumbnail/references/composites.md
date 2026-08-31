# Producing the assets a frame is composited from

Step 6b. The build order named its assets; this is where the ones that do not exist
yet get made, before a single image call is spent.

**The law this whole file serves: anything that has to be exactly right is built and
handed in, never described.** The face, a real logo, words printed on an object, a
count of things. A model asked to draw any of them authors something plausible and
different on every render, and plausible is the failure that ships, because at 320
pixels a wrong mark and a right one look the same.

Naming it in prose is the mistake. Handing over the file is the fix.

## What the model is allowed to author

| | Built, then handed in | The model's job |
| --- | --- | --- |
| The face | A plate from the owned library, unchanged | Light it, put it in a room |
| A brand mark | A 3D tile off the vendor's own SVG | Tilt it, glow it, cast its shadow |
| Words on an object | HTML, screenshotted | Bend it in the hand, take the room's light |
| A count of anything | HTML, screenshotted | Place it, grade it |
| The overlay type | Real Manrope, composited behind the subject | Nothing |
| The room, the depth, the light | | All of it |

The last row is the point. A model that is only asked to light, place and grade is
being asked for the one thing it is reliably excellent at.

## The whole frame, composited from real pixels, no model at all

The third execution route, beside `--photo` and model generation. Reach for it when the
background is itself a real artifact worth keeping verbatim: a screenshot, a workload board,
a document, a dashboard. Generating it would make the model invent the on-screen text, which
is the one thing prose can never pin (see the redaction and card notes below), and handing the
face to the model would redraw him. Compositing keeps both real: his real face, and the real
data on the screen. On the "Ops Ceiling" frames, 26 Aug 2026: the AI-faced renders were
rejected, the composite of the real face over the real workload screenshot was kept.

**The winning recipe is both moves, not a choice between them.** A flat real screen on a flat
`--photo` plate looks amateur; a fully generated frame invents the screen. What was kept, 26 Aug
2026, on both the "hiring won't fix it" and the Glance "clients see this" frames, was the two
stitched together:

1. **Edit-pass the scene** ([`rendering.md`](rendering.md)): hand the model his real base frame,
   keep the face pixel-for-pixel, generate a dark cinematic studio with a warm rim light, and tell
   it to keep one zone (say the left two thirds) **dark, empty and defocused — no screen, panel or
   object there.** That zone is where the real thing goes.
2. **Composite the real screenshot into the cleared zone** as a floating device: a dark bezel, a
   slight tilt, a coloured glow keyed to the content, a drop shadow, sized so it never covers his
   face. His gesturing hand from the base plate then reads as presenting it.

The result has the generated cinematic depth *and* the real product pixels — the ClickUp board with
its real red 200% bars, the Glance portal with its real 33% / 3 tasks / 38h. When he says "the AI
did not use the imagery we gave it," this is the fix: the model was never meant to draw the screen,
only the room around the hole left for it.

**The flat composite below (screenshot as the whole background) is the fallback**, for when there is
no room to generate — but reach for the two-step recipe first. Use the flat version only when the
on-screen data has to fill the frame and be legible. A flat cut-out laid onto
a flat screenshot reads as amateur the moment it sits next to a generated frame with real depth
and light — same day, on a flat "hiring won't fix it" build: "you're just slapping the
image like that... it looks extremely shit." When the frame can be cinematic and the artifact
can be impressionistic (an out-of-focus glowing panel rather than a readable board), the **edit
pass** in [`rendering.md`](rendering.md) wins: hand the model his real base frame, tell it to
keep the face pixel-for-pixel, and let it build the dark scene and the floating panels around
him. That keeps the real face *and* gets the generated look, which a flat composite never will.

Three layers, stacked with `magick`, then the type set through `composeThumbnail`:

```bash
# 1. the real background, filled to frame
magick screenshot.png -resize 1280x720^ -gravity center -extent 1280x720 bg.png
# 2. the real face, cut off its plate with Apple Vision, trimmed to its bounding box
magick static/youtube/faces/<pose>/<plate>.webp face.png
cutout face.png subject.png
magick subject.png -trim +repage subject-trim.png
# 3. lay him in (right third, flush to the bottom); scale by height
magick bg.png \( subject-trim.png -resize x700 \) -gravity SouthEast -geometry +0+0 -composite plate.png
```

Then call `composeThumbnail({plate, out, type, appRoot, work})` from
the compositor for the words: it re-cuts the subject off the composited plate and
tucks the type behind his shoulder, the same depth move as everywhere else. The background can
also **float** as a tilted panel rather than fill the frame — his hand from an "explaining" or
"holding" plate then reads as presenting it.

File the result with `render-thumbnail.ts --concept=<uuid> --file-dir=<dir>`: with no `--model`
named it is filed as an upload at **zero cost**, which is correct because no image call was
made.

Two gotchas that cost real time on 26 Aug 2026, both about `magick`:

- **Rotate greys an alpha-masked PNG.** Rounding the corners with `-compose CopyOpacity` and
  then `-rotate` returns a greyscale panel, because the grayscale mask contaminates the
  colorspace through the rotate. Tilt the **opaque** screenshot first (`-background none
  -rotate -6` on the un-masked image keeps colour), then add a bezel/shadow. Sharp corners on
  a tilted screen read fine.
- **Force truecolour on the way out.** Any step that merges a `-shadow` can collapse the panel
  to greyscale; write it as `PNG32:panel.png` and verify with
  `magick panel.png -colorspace HSL -channel G -separate -format '%[fx:mean]' info:` (a
  near-zero saturation mean means it went grey).

## Declaring a produced asset

A thumbnail concept's assets carry an optional `build`, which is the recipe for the
file when the library does not hold it yet
(the concept schema):

```jsonc
{
  "url": "/design/thumbnail-artwork/ops-ceiling-bars.png",
  "role": "The ceiling figure artwork, on transparency. Reproduce it exactly",
  "build": {
    "kind": "artwork",                                   // or "logo3d"
    "source": "artwork/ops-ceiling-bars.html",
    "width": 900,
    "height": 620
  }
}
```

```jsonc
{
  "url": "/design/thumbnails-3d/clickup-3d.png",
  "role": "ClickUp 3D tile, small, above the shoulder",
  "build": {
    "kind": "logo3d",
    "source": "static/logos/svg/clickup-symbol.svg",
    "tile": "a ClickUp brand gradient from magenta #FF02F0 through orange #F76808 and violet #6647F0 into blue #0091FF",
    "symbol": "pure white"
  }
}
```

Then one command produces everything and renders:

```bash
node scripts/render.mjs --prompt prompt.txt --ref face.webp --out out/a.png
node scripts/render.mjs --prompt prompt.txt --ref face.webp --out out/b.png --passes 3
node scripts/render.mjs --text "<the edit instruction>" --ref out/a.png --out out/a-edit.png
```

**A named asset that is neither on disk nor buildable is fatal, on purpose.** The
mood board script skips a missing file and renders anyway, which is how a frame comes
back carrying a mark the model invented. Here the run stops and names the file.

## The two producers

### A 3D tile, from the vendor's own SVG

`logo3d:gen` in `website/`, owned by the `logo-3d` skill. It rasterises the real SVG,
hands it to the image model as a reference, and keys the backdrop off, so the mark is
relit rather than recalled. Read that skill before changing a flag: the balloon
prompt's negative list is load-bearing, and deleting it to shorten the prompt turns
latex into stitched leather on every run.

Two rules from it that bite at composite time:

- **Colour the tile and the symbol separately.** Told only to keep the brand colours,
  the model gives the symbol the tile's own hue. Legible at 1024, a smudge at 320.
- **Keep the tile near the angle it was handed in.** The mark degrades the further it
  is rotated or blown up: at 10 to 15 degrees and 35% of frame height it comes back
  exact, at a hard tilt and 55% the shapes merge. `magick <tile> -flop` when the
  perspective fights a head turned the other way, into the run's scratchpad, never
  over the owned asset.

### An artwork card, from HTML

Anything with words, rows, colours or a count. A 40-line HTML file is enough, and it
is shot at 2x on a transparent canvas so the model can place it on any ground:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --default-background-color=00000000 --window-size=900,620 \
  --screenshot=card.png "file://$PWD/card.html"
```

Keep the HTML sources in one folder and the rendered PNGs beside the other owned
assets. Write the *why* into the file: the next person
needs to know which property is load-bearing before they tidy it.

Three shapes this covers, and they are the three that used to fail:

- **A printed card**, a list of names, a set of rows. Four prose descriptions of the
  same card produced four different cards, one with the wrong row count.
- **Redaction.** Asking a model to blur text is obeyed about half the time and
  otherwise returns confident fake words. Draw the redaction as plain grey slabs whose
  widths track the real word lengths, and there is nothing left to invent.
- **A figure with a count**, like five bars where one is doing something the others
  are not. The copy often names the number, and a viewer checks a number faster than
  they read anything else.

### The overlay type, which the model draws only when it may

Under four words on a solid tab, the model sets reliably and the letterforms are close
enough. When the type has to be exactly the brand's, take it back with the four-step
composite in [`rendering.md`](rendering.md): clean plate, cut the subject out with
the cutout tool, set the real heading face through headless Chrome, stack plate,
type, subject. The type then lands *behind* the person, which is the same depth move as
the floating tile.

## Attaching them

Order matters, because a model told "use the attached photograph" with three
attachments picks one at random. The render script numbers them in the prompt and binds
each ordinal to its role, so the reference and the sentence about it cannot drift apart:

```
Attached, in order:
  Image 1: Face plate, the subject frowning and pointing to frame left. Use it unchanged.
  Image 2: The ceiling figure artwork, on transparency. Reproduce it exactly.
```

Ask for reproduction, not inspiration: *"reproduce that exact object at almost exactly
the angle it is presented in, do not rotate the mark, do not merge the shapes."*

## Checks that belong to this step

- [ ] Every asset in the build order resolves to a real file after the produce pass
- [ ] A produced 3D tile is checked against its source SVG at full resolution
- [ ] A produced card's words, colours and **row count** match what the copy claims
- [ ] The artwork is on transparency, so the model owns the ground and the light
- [ ] Nothing that had to be exact was left in prose
