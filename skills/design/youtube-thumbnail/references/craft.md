# The craft layer: depth, light, the floating object, the plate

[`evidence.md`](evidence.md) says what goes in the frame, never why 2 frames holding the same
things look one professional and one homemade. Source: Higgsfield AI (`@HiggsfieldAI`, 133
uploads), top 24 against bottom 24, 19 August 2026, a different niche on purpose.

## 0. Evidence transfers by layer

| Layer | Holds | Transfers between niches? |
| --- | --- | --- |
| Claim | subject, expression, words, promise | No, audience-specific |
| Craft | depth, light, lens, type placement | Yes, it's physics and perception |

Higgsfield's shocked faces, `$1280/day` and `INSANE` are all control markers here. Borrow craft
from the best-produced channel in any niche; borrow claim only from your own banded evidence.

## 1. Clean means depth, not fewer things

Winners carry more objects than controls. What separates them: winners sit on 3 depth
planes, controls on one. Far is the ground (a real place or gradient, dark, well out of focus,
never a flat fill). Mid is the subject, the only sharp thing. Near/behind is one floating
object crossing the subject's silhouette. A person and a logo side by side, both sharp, read busier
than a winner holding 4. Flatness is the fault, element count is usually innocent. This keeps
the one-thing rule: one subject on 3 planes.

## 2. Separation is light, never a cutout

All 24 Higgsfield winners have a rim light (bright edge down shoulder and jaw, cool, from behind); no
control does. A cutout with an even, unlit edge reads as pasted in about 200 ms at 320px. 3
lights: key (soft, from the side the face turns toward), rim (harder, cooler, behind the
opposite shoulder), spill (from the floating object onto the near shoulder). The dark ground
carries one soft bloom and no black fill.

The note on the kept frame: *"the quality of my face and skin looks enhanced without feeling too
much like AI."* Nothing touched the face; the dark defocused ground plus the rim did it.
So grade, never regenerate: re-light and colour the photograph; once the model resamples skin
it goes plastic, and skin is the first thing a viewer checks.

## 3. A floating object needs all 4

Most common failure: the object is *placed*, not *lit*. It floats only if it:

1. Occludes or is occluded (behind the shoulder, hair or hand). An object touching nothing is a badge.
2. Tilts 10 to 20 degrees in perspective. Square-on is a UI element.
3. Glows onto neighbours. colour on the near shoulder, bloom on the wall.
4. Casts a real soft shadow behind it.

Size 30 to 60% of frame height (under 25% is decoration; the timid version looks cheap). At the top
of the range let it run off the frame: cropped reads as in the room. Contact matters, not size:
a tile level with the head touching nothing is a logo bug at 20% and 60%; one whose edge disappears
behind the head, lit and casting, is an object at both. Place it behind the shoulder or head, never
beside the head at head scale (logo bug) or centred behind it (halo). Mirror it when its fixed
3/4 angle fights the subject's turn: `magick <tile> -flop` on a scratchpad copy.

## 4. Type sits in the plane too

Winners use bare heavy sans (white, soft shadow, over a dark defocused region) or a solid
tab with square corners when nothing is quiet. The control shape is small thin type, centred,
with a logo lockup above (9 of 24 controls, zero winners). Place it in the opposite third from
the subject, vertically centred or high; an accent colour touches one word at most.

## 5. Consistency lives in the treatment

The Higgsfield wall reads as one channel because palette, rim light and type system repeat; the
compositions don't. Reusing a *layout* decays CTR; reusing a *treatment* builds the recognisable
wall. Hold the light recipe and 2 working colours; change what's in the frame.

## 6. The prompt block (under the subject description, see `rendering.md`)

```
Depth: 3 separate planes. The room sits far behind, pushed dark and well out of
  focus. He is the only sharp thing in the frame. The <object> floats in the middle
  distance, in front of the wall and behind his shoulder, with his shoulder and hair
  overlapping its lower edge so it sits in the room rather than on top of the picture.
Light: soft key from the left on his face; one cool rim light down his right shoulder
  and jaw that separates him from the wall; the <object> emits its own <colour> light,
  which lands on his shoulder and blooms softly on the wall behind it, and it casts a
  real soft shadow onto that wall.
Avoid: a flat cut-out pasted look, an object square-on to camera, a logo bug beside the head
```

## 7. Checks (full resolution)

- Trace the edge. Same brightness inside the line everywhere means no rim.
- Find the shadow. No shadow, no object.
- Squint at the planes. 3 tonal groups at 3 sharpnesses means the stack is there.

## The orbit treatment (approved 26 Aug 2026)

Translucent panels caught mid-turn around the subject at different angles and depths, each spilling
a soft prismatic bloom onto him; near-black ground, one key, rim down the jaw.
The verdict: "I do like this concept. It could be used in the future, just not this time, but I
like the rotating things around me. It looks cool."
It's a treatment, so reusable across a wall, while the composition changes per video. 2
conditions: the panels carry no glyphs (it's a texture, and a document would read as content), and there are 3 or 4
(the 2-element law counts the orbit as one element). It's generated, his photograph is the
subject, so generate the orbit and the room, then composite him in.

## The plate: contrast, type and safe area

- Canvas 1280x720, judged at 320x180. One label block in one heavy condensed weight: white on dark,
  black on light, or a solid tab (winners use tabs far more than outlines).
- 2 colours doing work, a third only as one accent.
- Keep the bottom-right ~15% clear of the timestamp and the bottom-left ~10% clear of the progress bar.
- The 50% test, for TV. Only a frame's top portion shows on TV home and suggested rows until the
  viewer presses down. Cover the bottom half: does it still say what the video is about? If not,
  move subject and type up. Check Analytics -> Audience -> Device type; at 10% TV or more this
  outranks a composition you prefer, and `bottom-left` type is invisible to those viewers.
- Squint test. Blur until the words are gone; the step 3 thing must still read.
