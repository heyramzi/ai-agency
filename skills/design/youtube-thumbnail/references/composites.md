# Compositing

Step 7, the build-and-composite half of [`rendering.md`](rendering.md): what is built and handed in, how a real artifact becomes the frame, how type goes behind the subject.

## The model's share

Anything that has to be exactly right is built and handed in, never described. A model asked to
draw a face, logo, words on an object or a count authors something plausible and different each
render, and at 320px a wrong mark and a right one look alike.

| | Built, then handed in | The model's job |
| --- | --- | --- |
| The face | Plate from the owned library, unchanged | Light it, put it in a room |
| A brand mark | 3D tile off the vendor's SVG | Tilt, glow, cast its shadow |
| Words on an object, a count | HTML, screenshotted | Bend it in the hand, take the room's light |
| Overlay type | Real Manrope, composited behind the subject | Nothing |
| Room, depth and light | | All of it |

Producers are wired into the render script so a missing file is built instead of skipped (the mood-board
script skips a missing reference and renders a frame with a mark nobody supplied; here the run stops
and names the file). An asset carries a `build` block:

```jsonc
{ "url": "/design/thumbnail-artwork/ops-ceiling-bars.png",
  "role": "The ceiling figure artwork, on transparency. Reproduce it exactly",
  "build": { "kind": "artwork",   // or "logo3d"
             "source": "artwork/ops-ceiling-bars.html",
             "width": 900, "height": 620 } }
```

`kind: "logo3d"` swaps `source` for the vendor SVG and adds `tile` (gradient prompt, e.g. `"a
ClickUp brand gradient from magenta #FF02F0 through orange #F76808 and violet #6647F0 into blue
#0091FF"`) and `symbol` (e.g. `"pure white"`).

```bash
export GOOGLE_API_KEY=...
node scripts/render.mjs --prompt prompt.txt --ref face.webp --out out/a.png
node scripts/render.mjs --prompt prompt.txt --ref face.webp --out out/b.png --passes 3
node scripts/render.mjs --text "<the edit instruction>" --ref out/a.png --out out/a-edit.png
```

3D tile. `logo3d:gen` in `website/` (owned by `graphics`' logo-3d branch; read it before
changing a flag, its negative list is load-bearing) relights the real SVG. Colour tile and symbol
separately, or the symbol takes the tile's hue (legible at 1024, a smudge at 320). Keep the tile
near the angle it was handed in: 10 to 15 degrees at 35% of frame height comes back exact, a hard
tilt at 55% merges the shapes. Check the mark against the source SVG at full resolution.

Artwork card from HTML, for words, rows, colours or a count: a 40-line file shot at 2x on a
transparent canvas.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --default-background-color=00000000 --window-size=900,620 \
  --screenshot=card.png "file://$PWD/card.html"
```

It covers 3 shapes that used to fail: a printed card or list of rows (prose descriptions gave a card with the wrong row count 1 time in 4); redaction (a model asked to blur text obeys
about half the time, else invents confident fake words, so draw grey slabs at the real word
lengths); a figure with a count (a viewer checks the number first). Done when words, colours and
row count match the copy and the artwork sits on transparency.

Attach by ordinal. A model told "use the attached photograph" with 3 attachments picks one
at random. Number them and bind each to its role, and ask for reproduction, not inspiration:

```
These are attached, in order:
  Image 1: Face plate, the subject frowning and pointing to frame left. Use it unchanged.
  Image 2: The ceiling figure artwork, on transparency. Reproduce it exactly.
"reproduce that exact object at almost exactly the angle it is presented in, do not rotate the
mark, do not merge the shapes." Then crop the mark at full resolution and look.
```

When a reference image exists, point instead of describing: hand the winner tile whose composition
you borrow, plus a second image for the type treatment. Don't copy a composition closely enough
to be recognisably another creator's: change subject, type and palette, keep structure. The
`Avoid` line isn't boilerplate: a second person, a shocked expression, a readable screenshot, a
chart, more than 2 working colours, a centred symmetric composition, more than 4 words of
text, a flat cut-out look, an object square-on, fused or extra fingers.

## Real pixels, no model at all

For a background that's a real artifact worth keeping verbatim (screenshot, board, document,
dashboard): generating it invents the on-screen text, handing the face over redraws him, and compositing
keeps both real.
On the "Ops Ceiling" frames, 26 Aug 2026: the AI-faced renders were rejected, the composite of the
real face over the real workload screenshot was kept.

The winning recipe is both moves. A flat real screen on a flat `--photo` plate looks amateur; a
fully generated frame invents the screen. Kept 26 Aug 2026 on "hiring won't fix it" and Glance's
"clients see this":

1. Edit-pass the scene. Feed in his real base frame and get it back with the face kept pixel for pixel,
   a dark cinematic studio and a warm rim light. One zone (say the left 2/3) stays dark, empty
   and defocused, with no screen, panel or object in it.
2. Composite the real screenshot into that zone as a floating device with a dark bezel, a slight tilt,
   glow keyed to the content and a drop shadow, sized to never cover his face. His gesturing hand then
   reads as presenting it. Result: cinematic depth *and* real pixels (the board's 200% bars, the
   portal's 33% / 3 tasks / 38h).

The flat composite is the fallback for when there's no room to generate and the data must fill the
frame.
Same day, on a flat cut-out over a flat screenshot: "you're just slapping the image like that... it
looks extremely shit."
3 layers with `magick`, then the type through `composeThumbnail`:

```bash
magick screenshot.png -resize 1280x720^ -gravity center -extent 1280x720 bg.png   # real background
magick static/youtube/faces/<pose>/<plate>.webp face.png
cutout face.png subject.png
magick subject.png -trim +repage subject-trim.png
magick bg.png \( subject-trim.png -resize x700 \) -gravity SouthEast -geometry +0+0 -composite plate.png
```

The compositor re-cuts the subject off the composited plate and tucks the type behind its shoulder.
File with `render-thumbnail.ts --concept=<uuid> --file-dir=<dir>` and no `--model`: it files as an
upload at zero cost. Two `magick` traps:

- Rotate greys an alpha-masked PNG (`-compose CopyOpacity` then `-rotate`). Tilt the opaque
  screenshot first (`-background none -rotate -6`), then add bezel and shadow.
- Force truecolour out. A step merging `-shadow` can collapse the panel to grey: write
  `PNG32:panel.png` and verify `magick panel.png -colorspace HSL -channel G -separate -format
  '%[fx:mean]' info:` (near zero means grey).

## Type behind the subject

Give the concept a `type` block and the script does the rest (no text goes in the prompt, the size
is fitted in the page; `scripts/thumbnail-compose.ts` owns it):

```json
"type": { "lines": ["ClickUp was", "layer one"],
  "placement": "top-left",   // top-left | top-right | left-center | bottom-left
  "shape": "tab",            // tab hugs each line; band bleeds off the left edge
  "plate": "#414FD2", "ink": "#FBF3EF", "behindSubject": true }
```

For a frame rendered elsewhere: cut the subject out
with a `cutout <in.png> <out.png>` helper (Apple's
`VNGenerateForegroundInstanceMaskRequest`, free, no key, no upload), set real Manrope 800 through
headless Chrome, stack plate, type, subject. A band bleeding off the edge and dying behind his head
reads as in the room; on top it reads as a label. Occlude the plate, never a glyph: the first
composite hid the full stop after "it." behind the card and read as a typo. Under 4 words on a
solid tab the model sets type reliably; when it must be exactly the brand's, composite it. Font:
Manrope 800.

