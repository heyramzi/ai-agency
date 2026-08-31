# Rendering a thumbnail programmatically

Step 7, execution route B. The build order from step 6 is the input; nothing here
re-decides the concept.

## Do not draw his face

**A face variant is composited, not generated.** `--photo` takes the face plate, conforms it
to 1280x720, sets the words in Manrope 800 and passes them behind the real subject. No model
is called, it costs nothing, and the likeness is perfect because it is not a likeness.

```bash
# composite the plate rather than calling a model at all
```

The reason it exists is the fault it fixes. `cutSubject` lifts the subject off the RENDERED
plate, so a generated frame has always contained zero photographed pixels of him: the plate
was only ever a reference the model looked at. The verdict, 26 Aug 2026, on a frame built from
`deadpan-wide-left-02`: "it doesn't look like me at all. It looks AI generated way too much."
That was right, and no model choice fixes it, because the industry's own answer is the same
one: the reliable route to a consistent person is to composite them, not to prompt for them.

It also lands the frame in daylight and in a real room with real objects in it, which is
where the faceless winners in this niche shoot and where our own wall never goes.

Generate when the frame needs something that does not exist to be photographed: an object,
a figure, a room we do not have. Never to obtain him.

`--photo` fills the frame with the plate's own room. When the background has to be a **real
artifact** instead — a screenshot, a board, a dashboard — do not generate it either: composite
his real cut-out face onto the real background, no model at all. That mode, its recipe and its
`magick` gotchas are in [`composites.md`](composites.md).

## Which model

**The model, the tier, the price and the ban all live in one place**, and it is not this file:
`vibe-kit/ai-doc/references/image-generation.md`. Short version, so you do not have to open it
to know whether you need to: ask `@heyramzi/ai` for a tier, never type an id, and `large`
(Nano Banana Pro) is banned outright, so `--model=pro` throws rather than falling back.

Two things are this pipeline's own:

- `render-thumbnail.ts` draws on the `medium` tier and takes `--model=<id>` to override, with
  `pro` and `flash` as the two shorthands. Overriding is for a test, never for a shipped frame.
- **The two things rival models are ranked on do not reach this pipeline.** Ideogram's in-image
  type accuracy is irrelevant because the words here are set in real Manrope through headless
  Chrome, and FLUX.2's photorealism does not come with the face compositing that keeps one
  person identical across a wall of frames.


**OpenAI re-renders the person; Gemini keeps the photograph.** Tested twice, and the
gap between the two tests is the useful part:

- **Editing a finished frame**, `gpt-image-2` returned a face that is a lookalike, not
  the subject: narrower jaw, different beard, different mouth. `gpt-image-1` was worse
  and cropped the type off.
- **Building from the source plate**, handed the same three reference images Gemini
  gets, it does far better: a convincing likeness, excellent tile lighting and a
  correctly reproduced card. Still not the photograph, though. The beard fills in, the
  brow heavies, the face idealises slightly. It is a good painting of him.

Gemini's Pro and Flash image models return the photographed face unchanged in both
cases, because they composite where OpenAI resamples the whole canvas.

So: OpenAI is not disqualified by one bad output, it is disqualified by what it *is*.
On a channel where the same face appears every week, a per-frame re-render drifts, and
drift across a wall of thumbnails is exactly the thing a recognisable face is for. Use
it for objects, product shots and illustration with nobody in frame. Never for the face.

**Seeds do not work.** `generationConfig.seed` is accepted without error by
`gemini-3.1-flash-image` and ignored: the same seed twice returns two different images
(verified 19 Aug 2026, same prompt, hashes differ). There is no way to re-roll a frame
you liked. The substitute is the edit pass below.

No Gemini image model returns an alpha channel, so key the backdrop off
afterwards with `logo3d/key.ts`.

## Changing one thing in a frame you already like

The most common request after a good render is "this one, but ___". Do not re-render the
brief: you will get a different face, a different card and a different crop, because
there is no seed. **Hand the finished PNG back as the first attached image and edit it.**

**The same pass builds a cinematic frame from a flat plate, and this is the route to reach for.**
The edit is not only for one small change: hand the model a real, flatly-lit `--photo` plate as
the reference, tell it to keep his face, hair, beard, expression, hand and pose pixel-for-pixel,
and then transform *everything else* — swap the plain room for a near-black defocused studio, add
a warm rim light, float glowing abstract panels around him. Gemini keeps the photographed face
through the edit and generates the world, which is exactly the look the flat composite in
[`composites.md`](composites.md) cannot reach. Verified 26 Aug 2026 on the "hiring won't fix it"
base at `tier: large`: four samples, the face held in all four, the flat composite it replaced
was rejected. Call it directly with `generateImage(router, { references: [{bytes, mediaType}],
tier: "large" })` and set the type afterward. Re-lighting the scene is allowed; resampling his
skin is not, so say "keep his facial detail, do not plasticise the skin."

```
Edit the FIRST attached image. It is a finished YouTube thumbnail and it is already correct.

Make exactly ONE change: <the change, with its geometry and its light>

Everything else in the frame is unchanged and must be reproduced pixel for pixel:
  - his face, hair, beard, expression, skin, clothing and hand exactly as they are
  - <every other element, named individually, with its position and its content>
  - the framing and the crop

Do not redraw the face. Do not restyle. Do not re-typeset the text. Do not change the crop.
```

**Naming what must not change is the whole job.** A model asked only to enlarge a logo
will cheerfully re-typeset the overlay and re-crop the frame, because nothing told it
not to. List the survivors explicitly, then run the pass and take three samples. The edit
pass is the one case still on Pro, and it is on Pro because nobody has re-run it on
Nano Banana 2 since 25 Aug, not because Pro won a comparison.

## The template is what a render is built from

A concept carrying a `templateId` is rendered from
[`templates.md`](templates.md), not from its prose fields: `buildPrompt` in
`render-thumbnail.ts` hands off to `compileTemplatePrompt` and the three paragraphs are
only there for the wall and for a designer handoff. The template also names the provider,
so `--provider=` is for a deliberate comparison and nothing else.

## The client, and the key order

Put every image caller behind **one module**. Import
`googleImageClient()` and `NANO_BANANA_MODEL` from it; do not build a provider by hand
and do not add a new key anywhere.

It walks three lanes in order and only changes lane when the lane itself failed, meaning
a quota answer (429, or a 403 naming `RESOURCE_EXHAUSTED`) or a rejected key (401, or a
400 naming the key). A malformed request is returned as is, because retrying it on the
next key just spends the next key.

OpenAI takes no lane: it reads `OPENAI_API_KEY`, and **there is deliberately none set**. It
also bills an image by the tokens it returns rather than at a flat rate ($30 per 1M image
output tokens, off platform.openai.com/docs/pricing on 26 Aug 2026), so if a key is ever
added, `generateImage` costs a frame from the usage the response carries and the catalog
number is only a floor.

**Known state, 26 Aug 2026: the direct Google key is not in `app/.env.local` either.** Every
image call in this workspace lands on lane 3, the Cloudflare AI Gateway, which holds its own
Google key. That is the fallback doing its job and it is the lane every verified render here
was drawn on.

1. `GOOGLE_GENERATIVE_AI_API_KEY`: direct to Google AI Studio. The priority lane.
2. `GOOGLE_GENERATIVE_AI_API_KEY_BACKUP`: direct, a second key. Leave it unset rather
   than setting a dead one.
3. `CF_AIG_*`: the Cloudflare AI Gateway, which holds its own Google key.

Lock the lane order with a test, and keep it identical in any second caller that carries
its own copy.

**Known state, 19 Aug 2026:** the direct key's free-tier image quota is exhausted, so
image calls fall to the gateway on the first request and succeed there. Text calls on
the direct key still work. This is the fallback doing its job, not a fault.

Working callers to copy:

- a carousel renderer: through the AI SDK, `generateText` with
  `responseModalities: ["IMAGE"]`
- the mood-board generator: the same, with reference images attached as
  file parts, which is the shape a thumbnail render needs
- a 3D logo generator: raw `generateContent` with one reference image

## Generating options onto the mood board

The fastest route to a rendered option is the mood board's own generator, because it
already reads the concept, resolves the owned assets and writes the result to the board:

```bash
node scripts/render.mjs --prompt prompt.txt --ref face.webp --ref box.png --out out/a.png
```

It reads the chosen concept's `metadata.thumbnailConcepts` and hands the model the
owned assets named there (face plate, product box, 3D tile) as image parts, so identity
is photographic and free. PNGs land in the **private** `app-assets` bucket, so board
nodes point at `/api/storage/serve-url?bucket=app-assets&path=…&mode=redirect`, never at
a storage public URL.

## Where a finished frame goes

**A rendered thumbnail is filed on its concept, never handed over as a loose file or a
standalone HTML sheet.** The Concepts page at `/youtube/concepts` is the wall the frames
are judged on, and a frame that is not on it does not exist to the person packaging the
video.

Two writes, both mirroring the upload use-cases module:

- **The images.** Upload each PNG to the public `presentation-media` bucket under
  `youtubeAsset/<slug>/<timestamp>-<uuid>-<slug>.png`, then insert an `app.media_assets`
  row with `kind='youtubeAsset'` and `metadata = {conceptId, type}`. `type` is one of
  `thumbnail`, `variant`, `overlay`, `reference`; the winner gets `thumbnail` and the
  rest get `variant`. That metadata is what groups the grid on the page.
- **The reasoning.** Merge the build orders into
  `app.youtube_concepts.metadata.thumbnailConcepts`, matching
  `thumbnailConceptSetSchema` in the concept module. A stored
  set that fails the schema is treated as absent and silently disappears, so read it
  back before calling it done.

In the browser the same two writes are `POST /api/youtube/thumbnails` (multipart:
`file`, `name`, `conceptId`, `type`) and the page's own **Draw concepts** button.

## Set the type yourself, and put it behind the subject

**This is wired into the renderer since 20 Aug 2026 and is no longer
a manual four-step.** Give the concept a `type` block and the script does all of it:

```json
"type": {
  "lines": ["ClickUp was", "layer one"],
  "placement": "top-left",     // top-left | top-right | left-center | bottom-left
  "shape": "tab",              // tab hugs each line; band bleeds off the left edge
  "plate": "#414FD2",          // brand indigo
  "ink": "#FBF3EF",            // brand cream
  "behindSubject": true
}
```

Its presence forces `No text anywhere in the image` into the prompt, so there is nothing
to paint out. The size is fitted in the page, so a two-word line and a five-word line
both fill the column. `scripts/thumbnail-compose.ts` owns it.

The manual version, for a frame rendered somewhere else:

1. **Render a clean plate.** Ask the edit pass to remove the text completely and continue
   the background where it was. No text anywhere in the image.
2. **Cut the subject out.** A `cutout <in.png> <out.png>` helper runs Apple's
   `VNGenerateForegroundInstanceMaskRequest` on the Neural Engine: free, no key, no
   upload, and it takes the person, the hand and whatever they are holding in one mask.
3. **Set the type in the real font.** An HTML file with `@font-face` pointing at the
   `.woff2` on disk, screenshotted transparent:
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless --disable-gpu --hide-scrollbars --default-background-color=00000000 \
     --window-size=1376,768 --screenshot=type.png "file://$PWD/type.html"
   ```
4. **Stack it: plate, type, subject.**
   ```bash
   magick plate.png type.png -composite subject.png -composite final.png
   ```

The type now lands **behind** the person, which is the depth move the whole craft layer
is about: a band that bleeds off the left edge and dies behind his head reads as a thing
in the room, where the same band drawn on top reads as a label on a picture.

Two shapes, both built this way:

- **A band.** One rectangle, bleeding off the frame edge, ending behind the head. The
  words sit in the clear part, so nothing legible is ever occluded.
- **A stepped tab.** One inline-block per line, each hugging its own text. Closest to a
  drawn-on overlay, and it still passes behind the hands and whatever they hold.

**Watch the punctuation.** The first composite hid the full stop after "it." behind the
card, which reads as a typo rather than as depth. Occlude the plate, never a glyph.

The brand face is **Manrope**, 800 for overlays, loaded from the `.woff2` on disk.

## Prompt in pictures before you prompt in words

**When a reference image exists, stop describing and start pointing.** These models take
images as arguments: hand them the winner tile whose composition you are borrowing and
say "this layout, this subject"; hand them a second image and say "this type treatment".
A paragraph describing a colour pair and a gaze direction is a lossy translation of a
picture you are already holding.

This is what makes a written style guide unnecessary. The house style is the last ten
thumbnails, so the reference for consistency is those files.

**The face is a composite, not a generation.** Never ask a model to change the
expression on a real photograph: it distorts the face, and the distortion is worst on
the feature the eye checks first. Keep the real photo and let the model do everything
around it, meaning the environment, the separation glow, the type and the colour. Where
the subject has to be dropped into a borrowed composition, replace the person and name
what stays ("keep the hand and the pose"), then iterate in small passes rather than
regenerating the frame. Spam a few variants of each pass and pick: selection is cheaper
than prompting.

**Text inside the frame obeys the same law, and it is the one people try to prompt.**
Not the overlay, which the model sets reliably at four words, but writing on an object:
a card, a screen, a label, a list of names. Prose cannot pin it. The same card described
four ways came back with the wrong row count once and different colours every time.

Build the artwork instead and attach it as a reference image:

```bash
# a 40-line HTML file, screenshotted at 2x, is enough
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=660,760 --screenshot=card.png "file://$PWD/card.html"
```

Then point at it: *"the THIRD attached image is the printed card artwork. Reproduce it
exactly: same words, same order, same colours, correctly spelled. Do not invent,
translate, reorder or add text. It is a real matte-printed card, so it takes the light
of the room and bends slightly in the hand."* The model lights it and places it, which
is the job it is good at, and authors nothing.

**Mirror an asset whose perspective fights the subject.** A 3D tile is rendered at one
fixed three-quarter angle. Behind a head turned the other way, two vanishing points
disagree and the frame reads wrong before anyone can name why. `magick <tile> -flop`
fixes it. Keep the mirrored copy in the run's scratchpad; never overwrite the owned asset.

**A real logo obeys the same law, and the failure is quiet.** A supplied 3D tile comes
back exact when it is asked for near the angle it was handed in, and degrades as it is
rotated or blown up away from it: the ClickUp chevron and smile merged into one shape at
55% of frame height and at a hard desk tilt, while the same asset at 10 to 15 degrees and
35% came back perfect. A wrong mark is worse than no mark, and at 320 pixels it looks
fine. **Say "reproduce that exact object at almost exactly the angle it is presented in,
do not rotate the mark, do not merge the shapes", then crop the mark at full resolution
and look.**

**Grade, never regenerate, and that is what makes skin look expensive.** The frame kept
from an earlier run was described as *"my face and skin enhanced without feeling
like AI"*, and nothing had touched the face.
 It was the dark defocused ground plus a rim
light, which is what a portrait photographer does to a real person. Ask for re-lighting
and colour, never for resampled skin: the moment a model redraws skin it goes plastic.
The recipe is in [`craft.md`](craft.md).

**One warning about copying a composition.** Borrowing a layout is remix and it is how
this pipeline earns its speed. Reproducing another creator's thumbnail closely enough to
be recognisably theirs is not, and it is the one output here that can cost the account.
Change the subject, the type and the palette; keep the structure.

## Prompt template

Build from the step 6 build order. Keep it under ~120 words and quote the exact overlay
string, because the model holds short strings at roughly 94% accuracy and far less on
long ones.

```
Create a YouTube thumbnail, 1280x720, 16:9.

Subject: <the one thing, in detail: what it is, where it sits, what state it is in>
[face variant] Person: use the attached photograph unchanged. Build the scene around it.
  Scale: <15-30% of frame height, in a real room> OR <mid-shot, holding the artifact>
Background: <one short phrase, low detail, supports the subject>
Composition: <subject position on the thirds grid; where the empty third is>
Lighting: <direction of the key, one rim light, where the shadow falls>
Colour: <hex 1>, <hex 2>, accent <hex 3> used once.
Text overlay: "<exact words>"
  Font: heavy geometric sans, extra bold. Fill: <hex>. Plate: solid <hex> tab, no radius.
  Position: <top-left | top-right | left-centre>, clear of the bottom-right 15%.
Style: real photography, sharp on the subject, mobile-legible at 320px.
Avoid: a second person, a shocked expression, a readable screenshot, a chart, more than
  two working colours, a centred symmetric composition, more than four words of text,
  a flat cut-out pasted look, an object square-on to camera, fused or extra fingers.
```

The `Avoid` line is not boilerplate. Every item on it is a measured control marker in
this niche; see [`niche-evidence.md`](niche-evidence.md).

## When the render comes back wrong

| Symptom | Fix |
| --- | --- |
| Text misspelled | Shorten the string. Four words is the practical ceiling for reliable glyphs. |
| Face distorted | You asked it to change an expression. Go back to a composite. |
| Five things in frame | The prompt described a scene. Name one subject and one accent, nothing else. |
| Washed out at 320px | Two working colours, and put the type on a solid plate rather than an outline. |
| Looks like the reference | Change subject, type and palette. Keep only the structure. |
| Quota error on every lane | All three lanes are rate limited. Wait, or add a second direct key as lane 2. |
