# YouTube CTAs: the evergreen overlay kit

## Contents

[Overlay versus clip](#overlay-versus-clip),
[Constants or Studio: who may fine-tune a clip](#constants-or-studio-who-may-fine-tune-a-clip),
[Placement](#placement), [House rules](#house-rules),
[The glass surface (`glass/surface.tsx`)](#the-glass-surface-glasssurfacetsx)

The 1920x1080 transparent overlays that dress a finished YouTube edit: subscribe, like, a booking link, a
product ask. They live in Remotion and run for years. They aren't clips cut to a sentence, so this
skill's clock and planning rules don't apply; its palette, motion vocabulary and finishing rules do.

## Overlay versus clip

1. It has no read and no clock. It's dropped wherever the edit wants it, so duration belongs to the ask.
2. It's worth hand-tuning, since it runs for years. Write the inline form (inline `style`, inline
   `interpolate()` with hardcoded ranges) so Studio can nudge it (next section).
3. It has alpha, and alpha fails silently. Read `render.md` before the first render.

## Constants or Studio: who may fine-tune a clip

Studio writes edits back only where it can read the markup: inline `style`, inline `interpolate()` with
hardcoded ranges, `scale`/`translate`/`rotate` not `transform`, inline `defaultProps`, `Interactive.Div` with
a hardcoded `name`. A value behind a constant, spread or arithmetic goes grey.

- A set cut into one read keeps the constants (`beats.ts`, `motion.ts`). That's what makes 15 clips
  one hand, and retiming stays one edit.
- A one-off the owner will nudge by eye takes the inline form (overlays, CTAs, a title card). Colour
  still comes from `tokens.ts`, pasted inline with the token name in a comment.

Don't mix the two in one composition: half-interactive markup reads as broken.

## Placement

An overlay rides the teach and never interrupts it. A viewer deep in a video has stopped noticing they're
watching one, and anything that breaks that frame wakes them, and a woken viewer remembers they have work to
do. It lands over a sentence still running, never over a pause cut in to make room, and never gets its own
scene. The outbound ask belongs in the last 20 seconds (mid-roll CTAs between 55% and 70% of a video
measure far better than end-screen ones). If a break is unavoidable (a sponsor read), put it after the channel's
average view duration so it lands on viewers who were leaving anyway. Keep the middle of an end card empty if
the presenter's face sits there. YouTube owns the bottom 90px (progress bar and controls on mouse move) and the
top right (the cards teaser).

## House rules

- There are 3 shapes in one hierarchy. The hero is tall, with an ask and an address on a second line. The pill
  is one line with one badge. The subscribe unit has an avatar, a handle and a button that presses. Size carries the hierarchy, so it
  needs no second hue; the one accent marks the one ask for money. A whole slab in terra fails over footage
  (translucency drags it to brick and the glass edge stops reading), and a sand fill rendered as a flesh-toned
  disc that pulled the eye off Subscribe.
- Use one `interpolate()` per CSS property, with the exit as extra stops (`[0, in, durationInFrames - n,
  durationInFrames - 2]`). Calling it twice on one property means the second silently wins, and Studio can't keyframe it.
- Use `boxShadow` on anything containing type, and never a `filter` glow. A filter hits the whole subtree and
  haloes the word inside.
- Never uppercase a handle. It's a literal string a viewer types into a search box. Type rules stop
  at anything the viewer must reproduce.
- Nothing touches the frame edge, and that includes a shadow. The author, 25 Sep 2026: *"sometimes the shadow clips
  beyond the 16 by 9 video."* The shapes once rose 400px from below the frame and the 92px ambient shadow
  reached the last row at rest. Now the block hangs at `BLOCK_CENTRE_Y = 788`, rises `RISE` (24px) under the
  fade, and the exit eases in so a spring can't overshoot toward the edge. A long product ask takes a smaller
  `statementSize` and keeps the pane width. `alpha-edges.sh` proves it and the render script won't ship a failure.
- Use one ring and no repeating pulse. A loop needs modulo arithmetic Studio can't keyframe, and a CTA that
  keeps pinging outlives its welcome in 2 seconds. The subscribe unit has no ring: it would sit outside the
  glass pane (clipping its own sweep) and need absolute coordinates that move with the handle string.
- Never build a colour by appending a hex alpha to an `oklch()` string. `` `${disc}73` `` is invalid, one
  invalid value drops the whole `box-shadow` list, and the render exits zero looking like nothing was set.
  Write it inside: `oklch(0.65 0.2 30 / 0.45)`.
- Never centre an icon above the statement (`impeccable` names it the most templated layout). The icon
  goes left of the type on the reading line and the group is centred; the type is left-aligned off the icon.
- Review over mid-grey; a CTA reviewed on white or black lies about its contrast:

```bash
npx remotion still src/index.ts <CompId> out/cta-stills/<CompId>-<frame>.png --frame=<frame>
ffmpeg -y -f lavfi -i color=c=0x4a5560:s=1920x1080 -i in.png -filter_complex "[0][1]overlay" -frames:v 1 flat.png
```

## The glass surface (`glass/surface.tsx`)

7 layers, because `backdrop-filter` samples what's behind the element in the same document and an alpha
overlay has nothing there. (1) A 1.5px gradient rim, bright top-left to dim bottom-right: a flat border draws a
box, a gradient rim draws a curved surface catching light. (2) A hairline ring, indigo 0.16. (3) 2 shadows:
3px contact and 92px ambient; one alone gives a sticker or a cloud. (4) A body gradient, lighter at the top.
(5) An inset top highlight and inset bottom darkening, the pane's thickness. (6) Frost: `feTurbulence` grain at
3.5% plus a cream bloom top-left; above about 6% it reads as a noise texture. (7) A specular sweep
crossing once, never looping. The frost is an SVG background image, never a CSS `filter` (it would frost
the type). Sweep length is a file-size bill: 30 frames across a wide pane repainted the grain every frame (14MB
of a 24MB file on `cta-call`), and 18 frames brought it to 22.8MiB; a glint that took a full second read as a
wash anyway. `shine` runs 54 frames, so a clip carrying it can't be cut under about 80.

The concentric radius rule: every curve that wraps a curve shares its centre. `Glass` takes the pane's
radius and gives the rim `radius + 1.5`; set the pane's radius to the round thing's radius plus the padding
around it (a 53px avatar in 22px of padding gives 75px, so 62 is wrong). It's the first thing anybody spots on a
finished render. All 3 shapes come out as stadiums; when they don't, the round element isn't the tallest
child, so grow it. The far padding is larger on the 2 type shapes so the last letter clears the stadium end.

| shape | child r | padding | pane |
|---|---|---|---|
| `CtaSubscribeUnit` | 53 | 22 | 75 |
| `CtaHero` | 62 | 40 | 102 |
| `CtaPill` | 41 | 17 | 58 |

Icons: Phosphor duotone (`@phosphor-icons/react`); regular vanishes at distance on a phone and fill fights
the type. The ghost layer needs lifting: Phosphor writes `opacity="0.2"` as a literal and `duotoneOpacity` isn't
in `IconProps` on 2.1.10, so `glass/icons.tsx` injects one rule lifting it to 0.38. The brand mark stays
hand-drawn. A glyph on terra is ink, never cream (3.24:1 fails at any size; cream on indigo is 8.4:1).

Type: Space Grotesk, the Code/Label role, short, uppercase and tracked out. Manrope is the heading face and
doesn't belong here. Space Grotesk's character shows in lowercase, so it sits on the handle (46px, tracking -0.9) and the call CTA's
sub-label; at 42px caps with +4.2 tracking a pill word is nearly face-agnostic. `font.ts` loads the woff2
through `delayRender` until `document.fonts.load` resolves for every weight. Don't swap in a Google Fonts URL:
a slow request leaves the first frames in the fallback, which exits zero.


Done when every MOV is `qtrle`/`argb` for a timeline (or HEVC for a shelf) and keys in a decoded corner, alpha
is 0 in the 8px edge band on every frame (end cards are the opaque exception), an audio track is present with
each transient on its named frame, every curve is concentric with the one it wraps, frost grain is at or
under 6%, a still of every phase was looked at over mid-grey, and every file is under the host's size cap.
