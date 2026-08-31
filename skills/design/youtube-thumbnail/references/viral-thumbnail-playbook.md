# Viral Thumbnail Playbook

> **Scope: general YouTube, not this niche.** This page is background material,
> derived from entertainment-scale channels and creator write-ups. Where it disagrees
> with [`niche-evidence.md`](niche-evidence.md), the evidence file wins, because that
> one is 270 measured frames from the ten channels we actually compete with.
>
> Specifically refuted here for the founder, systems and AI-tooling niche: the MrBeast
> pattern (a face at 40%+ of frame with one emotion at 11, four colours at max
> saturation), the "faces with extreme emotion" lever, and "stakes and numbers" where
> the number is somebody else's money. Read the evidence file first.

## Contents

- Why thumbnails decide everything
- The seven psychological levers
- The MrBeast pattern, distilled
- Composition rules
- Color combinations that ship
- Text rules
- Render prompts per archetype
- Tools
- Source notes

Deep reference for the `youtube-thumbnail` skill. Numbers and patterns below are pulled from current creator data and design research; treat them as priors, not laws.

## Why thumbnails decide everything

- Over 75% of YouTube views happen on mobile, on a 4-6 inch screen. Design for that frame, not your 27-inch monitor.
- Viewers process a thumbnail in under one second. Composition, not detail, wins.
- YouTube's A/B thumbnail test (up to 3 variants) selects on watch-time share, not raw click-through. A higher CTR with worse retention can lose.

## The seven psychological levers

1. **Curiosity gap.** The thumbnail shows the question; the video answers it. Hidden object, blurred face, mid-action freeze, "what happens next".
2. **Pattern interrupt.** YouTube's UI is white and gray. Hot complementary colors break the scan.
3. **Faces with extreme emotion.** Mirror neurons fire on shocked, joyful, fearful faces. Neutral faces lose.
4. **Stakes and numbers.** "$10,000", "24 hours", "100 vs 1". Digits anchor attention.
5. **Forbidden / taboo signals.** Red tape, caution colors, redacted black bars. Brain treats taboo as "must check".
6. **Social proof.** Recognizable logos, recognizable people, recognizable products. Familiarity buys the click.
7. **Juxtaposition.** Two unlike things in the same frame imply a story. Pizza on a Lambo. Grandma holding a chainsaw.

Stack one or two levers. Three is busy. Four is noise.

## The MrBeast pattern, distilled

- One face, taking 40%+ of the frame, single emotion turned to 11.
- Four core colors: red, blue, green, yellow, all max saturation.
- One hero object on the opposite side of the face, scaled larger than reality.
- Zero or one number on screen. Often a dollar amount.
- Negative space behind the face, often blurred or color-flooded.
- Dramatic rim light on the face, often with a colored gel matching the dominant color.

What he never does: small faces, neutral expressions, long text, pastel palettes, photo-realistic backgrounds with detail.

## Composition rules

### Rule of thirds

Divide the 1280x720 canvas into a 3x3 grid. Place the focal point on one of the four intersections (left-top, right-top, left-bottom, right-bottom). The eye lands there first.

For two-element compositions (face + object), put the face on one third and the object on the opposite third. Eye line from the face should point toward the object.

### Negative space

30-40% of the frame should be visually quiet. A loud subject on a calm background pops; a loud subject on a loud background dies on mobile.

Quiet does not mean empty. A solid gradient, a blurred backdrop, or a single color wash all count.

### Safe zones (avoid)

- Bottom-right ~120x40 px at full canvas: YouTube timestamp overlay.
- Bottom-left ~15%: watched-progress bar may appear here.
- Top-right corner on home feed: hover-menu dots can sit here.
- Center-bottom: when YouTube auto-generates captions in some surfaces.

Keep faces, numbers, and overlay text out of these. Backgrounds can extend into them.

## Color combinations that ship

| Pair | Hex pair | Mood | Notes |
|---|---|---|---|
| Yellow / violet | `#FFD60A` / `#5B2A86` | Energy, premium | High CTR in tech and finance |
| Red / cyan | `#FF2D2D` / `#00C2FF` | Urgency, drama | Default for challenges and fails |
| Blue / orange | `#0A84FF` / `#FF7A00` | Cinematic | Documentaries, interviews |
| Green / magenta | `#3AE36F` / `#FF2D9C` | Comedy, gaming | Bold, slightly chaotic |
| Black / yellow | `#0A0A0A` / `#FFD60A` | Hazard, attention | Money, exposed, warning |
| Red / white | `#FF1F1F` / `#FFFFFF` | Direct, stop-and-look | News, breaking, callouts |

Always pair with high luminance contrast (one light, one dark) so the thumbnail survives grayscale conversion. If it works in black-and-white, it works on mobile.

## Text rules

- Maximum 4 words. Aim for 1-2.
- Heavy condensed sans-serif. Bebas Neue, Impact, Anton, BLOK, or similar.
- White or yellow fill. 8-12 px black stroke. Hard drop shadow, no soft blur.
- Numbers beat words. "$10K" beats "ten thousand dollars".
- The overlay should add what the title can't: an emotional verdict ("BANNED"), a stake ("$0 LEFT"), a contradiction ("ON PURPOSE").
- Never duplicate the title. Two messages compete; one wins; the click does not happen.

## Render prompts per archetype

### Reaction face

```
YouTube thumbnail, 1280x720. A close-up of <creator description>, face filling 50% of the frame on the left-third, eyes wide and pointing toward the right-third. Mouth open in genuine shock. <hair, outfit color>. Background: solid <color> with subtle radial gradient. To the right of the face on the right-third intersection: <hero object> at exaggerated scale, slight motion-freeze. Lighting: hard key from camera right, blue rim light from behind. Color palette: <primary hex> dominant, <secondary hex> accent. Text overlay: "<1-2 words>" top-right, heavy condensed sans-serif, white fill, 10 px black stroke, hard drop shadow. Hyper-real, sharp focus, mobile-legible. Avoid cluttered backgrounds, neutral expressions, low contrast.
```

### Juxtaposition

```
YouTube thumbnail, 1280x720. Split frame with a subtle vertical divider at 50%. Left side: <element A> on <background A in color X>. Right side: <element B> on <background B in color Y>, complementary to X. A bold white "VS" or arrow at the divider. Both elements at equal visual weight. Lighting matches each side independently. Color palette: <pair hex>. No text overlay, the VS does the work. Hyper-real, high contrast, mobile-legible.
```

### Single hero object

```
YouTube thumbnail, 1280x720. <Hero object> centered on the right-third intersection, scaled 30% larger than realistic, three-quarter angle. Background: solid <color> with a soft radial vignette. Dramatic studio lighting with a hot rim light, hard product shadow. Color palette: <primary hex> background, <accent hex> highlight. Text overlay top-left: "<1-2 words>", heavy condensed sans-serif, white fill, black stroke, hard drop shadow. Hyper-real, sharp focus, no logos, no clutter.
```

### Before / after

```
YouTube thumbnail, 1280x720. Vertical split. Left half: <before state>, cool color grade (teal/blue), muted contrast, slightly desaturated. Right half: <after state>, warm color grade (orange/red), high contrast, vibrant. A subtle arrow or "AFTER" label at the divider. Same subject in both halves where possible. Lighting flipped from flat (left) to dramatic (right). Color palette: cool <hex> / warm <hex>. Text overlay: "<1-2 words>" at the top-center, heavy condensed sans-serif. Hyper-real, mobile-legible.
```

### Numbered stakes

```
YouTube thumbnail, 1280x720. A giant number "<digits>" on the right-third, taking 50% of the frame height, in <accent color>, heavy condensed font, white fill with 12 px black stroke, hard drop shadow. To the left on the left-third intersection: <creator face> reacting to the number with shock or awe, eyes pointing toward the number. Background: solid <color> with a subtle radial gradient. Color palette: <pair hex>, high saturation. Hyper-real, sharp focus.
```

### Mystery / question

```
YouTube thumbnail, 1280x720. <Object> partially hidden behind <occluder> on the right-third. A hand reaching in from the left edge toward the object. A large white question mark with hard black stroke over the occluder. Background: dark, vignetted, single hot light on the object. Color palette: deep <dark hex> dominant, hot <accent hex> on the object. No text overlay other than the question mark. Hyper-real, dramatic, slightly cinematic.
```

### Forbidden / danger

```
YouTube thumbnail, 1280x720. <Subject> center-right with a bold red diagonal "X" or caution-tape band across the frame. Background: dark, slight red color cast, soft vignette. Creator face on the left-third with a fearful or warning expression, finger pointing at the subject. Color palette: red <#FF2D2D> dominant, black, white, with one yellow accent. Text overlay top-left: "BANNED" or "WARNING", heavy condensed sans-serif, white fill, black stroke. Hyper-real, mobile-legible.
```

## Tools

- **Nano Banana 2 (`gemini-3.1-flash-image`)**: the default. Best for thumbnails with short on-image text (≤4 words), and much the strongest at holding a supplied reference image, which is what keeps a face or a real logo from being redrawn.
- **Nano Banana (`gemini-2.5-flash-image`)**: the previous generation, kept here only so the name is recognisable. Every caller in the workspace moved to 3.1 on 2026-08-17. Do not start a new one on it.
- **Imagen 4**: best for fully illustrative thumbnails without on-image text. Strong photorealism, slower.
- **Photoshop / Figma**: final compositing of generated subject onto a hand-built color background with hand-laid text. Best CTR work is usually a hybrid, not a single generation.

## Source notes

The numbers and patterns above are drawn from public creator data and design research. Useful starting reads:

- Banana Thumbnail blog: psychology and concept libraries
- ThumbMagic, Awisee, Ampifire: 2026 best-practice guides
- YouGenie, Async, Touhfa, 1of10: MrBeast pattern breakdowns
- ThumbnailPeak, Thumbmachine: composition and rule of thirds
- Vmake AI: color psychology masterclass

Treat any single source as a prior, not a rule. The real test is the squint test and the A/B variant winner.
