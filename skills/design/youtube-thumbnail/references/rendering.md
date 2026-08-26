# Rendering programmatically

Step 8, execution route B. The build order is the input; nothing here re-decides the
concept.

## Prompt in pictures before you prompt in words

**When a reference image exists, stop describing and start pointing.** Image models take
images as arguments. Hand over the photograph and say "this person, unchanged"; hand over
the object and say "this object, as supplied". A paragraph describing a face is a lossy
translation of a picture you are already holding, and the model will invent the difference.

This is also what makes a written style guide unnecessary. Your house style is your last
ten thumbnails, so the reference for consistency is those files.

**The face is a composite, not a generation.** Never ask a model to change the expression
on a real photograph. It distorts the face, and the distortion lands worst on the feature
the eye checks first. Keep the real photo and let the model do everything around it: the
environment, the separation, the type, the colour.

**Spam and select.** Two or three passes of the same prompt cost almost nothing and differ
more than another paragraph of instruction would. Selection is cheaper than prompting.

**One warning about copying a composition.** Borrowing a layout is remix and it is how this
pipeline earns its speed. Reproducing another creator's thumbnail closely enough to be
recognisably theirs is not, and it is the one output here that can cost you the account.
Change the subject, the type and the palette; keep the structure.

## Hands are the failure you will ship

This is the single most expensive mistake in the whole workflow, because a plausible hand
silhouette reads as correct at a glance and only falls apart at full size. A composite pass
fused four photographed fingers into one blade **and** added an entire second hand, and both
survived a review checklist that already said "no mangled hands".

Three rules, in order of how much they save you:

1. **Prefer a source frame with no hands in it.** A model cannot mangle what the photograph
   never had. Crop at mid-chest and put the object behind the subject rather than in a grip.
2. **Ban them explicitly** when the frame should have none. Not "no mangled hands" but:
   *"there are no hands, arms, forearms or fingers anywhere in this image; the photograph
   does not contain any and you must not add, imagine or reveal any."*
3. **Crop and count.** Before delivery, cut the hand region out at full resolution and count
   the fingers. Do the same for eyes and for every glyph. A checklist item you tick from the
   thumbnail-sized preview is not a check.

## Text on the frame

Models hold short strings at roughly 94% accuracy and fall off fast on longer ones. Quote
the exact string, keep it to four words, and re-render rather than accept a misspelling.

**An instruction to blur text is followed about half the time.** The other half comes back
with confident fake words, which is worse than no blur because it fails the "nothing
readable" rule while looking deliberate. Say *"no letters, no words, no readable characters,
just soft shapes where the names would be"* rather than "blurred", and re-render when it
comes back legible.

## Prompt template

Build it from the build order. Keep it tight.

```
Create a YouTube thumbnail, 1280x720, 16:9.

Image 1 is a photograph of a real person. Image 2 is <the object>.
Person: use image 1 unchanged. Keep the face, hair, build, clothing and skin tone
  exactly as photographed. Do not restyle, smooth, slim, age, re-pose or re-light.
  Do not change the expression.
  Position: <15-30% of frame height in a real room> OR <mid-shot, right of centre>
<hand ban, verbatim, when the frame should carry none>
Subject: <the one thing: what it is, where it sits, what state it is in. Name image 2
  and say "reproduced exactly as supplied" when it is an owned asset.>
Background: <one short phrase, low detail, supports the subject>
Composition: <subject position on the thirds grid; where the empty third is>
Lighting: <direction of the key, one rim light, where the shadow falls>
Colour: <hex 1>, <hex 2>, accent <hex 3> used once.
Text overlay: "<exact words>" and no other text anywhere in the image.
  Font: heavy geometric sans, extra bold, one weight and one size.
  Fill <hex>. Plate: solid <hex> tab, square corners, no outline, no shadow.
  Position: <upper left | left-centre>, clear of the bottom-right 15% and bottom-left 10%.
Style: real photography, sharp on the subject, legible at 320 pixels wide.
Avoid: any hand or finger, a second person, any other face, a shocked expression, a
  readable screenshot, a chart, an arrow, an emoji, a border, a drop shadow on the text,
  a third chromatic colour, more than four words of text.
```

The `Avoid` line is not boilerplate. Every item on it should be a control marker you
measured in your own banding pass; cut the ones that are not and add the ones that are.

## The renderer

[`../scripts/render.mjs`](../scripts/render.mjs) is a dependency-free Node script that takes
a prompt and a list of reference images and writes a PNG. It is built against Google's
Gemini image models, which hold a reference image well, and it walks more than one API lane
so a quota answer on the first key falls through to the second instead of failing the run.

```bash
export GOOGLE_API_KEY=...            # or GOOGLE_API_KEY_BACKUP as a second lane
node scripts/render.mjs \
  --prompt prompt.txt \
  --ref face.webp --ref object.png \
  --out out/option-a.png \
  --passes 2
```

Behind a proxy or an AI gateway, point it at the gateway instead. With `IMAGE_API_HEADERS`
set and no key present, the gateway is assumed to hold the upstream credential itself:

```bash
export IMAGE_API_BASE="https://<your-gateway>/google-ai-studio/v1beta"
export IMAGE_API_HEADERS="cf-aig-authorization: Bearer <token>"
node scripts/render.mjs --prompt prompt.txt --out out/option-a.png
```

`IMAGE_MODEL` overrides the model id. Swap the endpoint for any image API that accepts
reference images; the structure of the call is what matters, not the vendor.

## When the render comes back wrong

| Symptom | Fix |
| --- | --- |
| Text misspelled | Shorten the string. Four words is the practical ceiling for reliable glyphs. |
| Face distorted | You asked it to change an expression. Go back to a composite. |
| A hand is wrong, or there is an extra one | Re-render from a hands-free source frame with the explicit ban. Do not retouch. |
| Blurred text came back legible | Say "no letters, no words, no readable characters". Re-render. |
| Five things in frame | The prompt described a scene. Name one subject and one accent, nothing else. |
| Washed out at 320px | Two working colours, and put the type on a solid plate rather than an outline. |
| Looks like the reference | Change subject, type and palette. Keep only the structure. |
| Quota error on every lane | All lanes are rate limited. Wait, or add another key. |

## Where a finished frame goes

**A rendered thumbnail is filed where the packaging decision gets made, not handed over as
a loose file or a standalone HTML sheet.** Whatever your system is, put the frames and the
build order that produced them in the same place, so the reasoning is next to the picture
when somebody has to choose. A frame that only exists in a chat log does not exist.
