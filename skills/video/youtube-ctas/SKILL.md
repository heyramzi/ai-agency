---
name: youtube-ctas
description: "Builds the evergreen 1920x1080 transparent overlays a finished YouTube edit is dressed with, in Remotion: subscribe, like, comment, book-a-call and link-in-the-description pills, the channel lower third, and the end-screen bed. Use when a CTA, a lower third or an end card is needed, when an overlay renders without its alpha channel, when an overlay has to land where YouTube's own clickable elements go, or when adding a clip to the overlay shelf the editor pulls from. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: Remotion (Node 20 or later) and ffmpeg
---

# YouTube CTAs

The kit is a folder inside the same Remotion project as the b-roll, at 1920x1080 rather than
1080x1920. It renders to one shelf folder that the editor pulls from, and that shelf is the
deliverable: a set of transparent MOVs an edit is dressed with for years.

It is not the b-roll skill and does not overlap it:

- Motion-graphic clips cut against a read: `motion-broll`. That skill owns the palette, the spring
  vocabulary and the finishing rules, and this one inherits all of them.
- Remotion API questions: the `remotion-best-practices` router and its sub-skills.
- Scheduling, encoding and filing the finished video: `shorts-production`.

## What separates an overlay from b-roll

Three things, and each one flips a rule that `motion-broll` states:

1. **There is no read and no clock.** A CTA is dropped wherever the edit wants it. So there is no
   `beats.ts`, and the duration is a property of the ask, not of a sentence.
2. **It is reused for years across every video.** So it is worth more hand-tuning than a clip that
   serves one line once, which is why the whole kit is written in the Studio-editable inline form
   rather than behind shared constants. The reasoning is in `motion-broll` under
   "Who is allowed to fine-tune".
3. **It has an alpha channel.** Everything below turns on that.

## Alpha is where this silently fails

`remotion.config.ts` sets h264 for the b-roll. An overlay that inherits it renders clean, exits
zero, and arrives as a video with a black rectangle where the transparency should be. Nothing
catches it except opening the file over footage, which is exactly the silent-invisibility failure
`motion-broll` is built around.

**The shelf ships QuickTime Animation (`qtrle`) in a MOV, not WebM.** A six-format pack tested in
Descript settled it: every MOV keys, GIF keys, WebM does not. The eight WebM files
were never faulty, both alpha checks pass on all of them. Descript simply imports a VP9 alpha WebM
and flattens it. Descript's *Supported file types* page is a container x codec table that promises
transparency for nothing, so importable and keyable are separate claims and only the test settled
the second.

qtrle rather than ProRes 4444, which also keys: QuickTime Animation stores ARGB directly, so it is
lossless with no RGB→YUV step at all, where ProRes 4444 is 12-bit YUV applied to an 8-bit RGBA
source: more bits, less exact, five times the size. Sizes: qtrle 7-25MB, ProRes 30-100MB, HEVC
~0.6MB but lossy, WebM 0.2-0.9MB. GIF keys too and is not shipped, its alpha being 1-bit.

The qtrle figures roughly tripled when the frost layer went in, and that is expected rather than a
regression: QuickTime Animation is run-length encoding, and per-pixel grain is exactly what
run-length encoding cannot compress. It is the price of the surface, paid once per clip, and 25MB is
nothing for a file that lives on a local timeline. Do not "fix" it by dropping the grain.

**The file size is the statement's length, and nothing else.** Measured on `cta-skool`: the hold
costs zero bytes per frame, because a still pane is one RLE run; the whole bill is the ~20 entrance
frames and the ~8 exit frames, where the pane fades and scales and every pixel in it changes. So the
bill is the pane's area times those frames, and on a fixed-height shape the pane's area is its
width. Two measured points, ink box including the glow spill against the shipped MiB:
1380px/23.9MiB on `cta-call`, 1518px/26.3MiB on the first cut of `cta-skool` — the same ratio to
within a percent. **A hero statement past about 21 characters crosses Cloudflare's 25MiB per-asset
ceiling and fails the whole app's deploy.** Measure a candidate before rendering it, in seconds,
with `remotion still --props='{...}'` and `magick -format "%@"`; the entrance is the only other
lever and its 10-frame settle is shared by all three shapes, so shorten the words.

Remotion cannot write qtrle, so the render is two steps and `render:youtube-ctas-mov` does both:

```bash
remotion render src/index.ts <CompId> <out>.mov \
  --config=remotion.prores.config.ts --codec=prores --prores-profile=4444 \
  --pixel-format=yuva444p10le --image-format=png
ffmpeg -v error -i <out>.mov -c:v qtrle -pix_fmt argb -c:a copy -y <shelf>.mov
```

`remotion.prores.config.ts` exists because the default config sets `Config.setCrf(16)` and ProRes
has no CRF, so a ProRes render through the b-roll config dies before it writes a frame. `-c:a copy`
carries the sound track through untouched; `-an` there silently throws it away. `-g 600` is not
optional either: ffmpeg writes a full qtrle keyframe every 12 frames by default, which on clips that
hold still is about a third of the kit's total size in pure redundancy.

**A WebM twin still gets rendered, as the browser preview.** No browser decodes QuickTime Animation,
so a `<video src="*.mov">` tile in a browser shelf is a blank rectangle and `drawImage` off it an
empty canvas. `render:youtube-ctas` writes vp9 into `design/youtube-ctas-preview/`, the shelf plays
that, and download and drag hand over the MOV. That is the WebM's only remaining job, which is why
`alphaPreviewWebm` is named as it is: the Studio gives you the preview, the CLI the deliverable. Do
not put `defaultCodec: "prores"` in that file, the config's CRF kills it as it kills the CLI.

On Remotion 4.0.504 the alpha defaults must go through `calculateMetadata`. `defaultCodec`,
`defaultPixelFormat` and `defaultVideoImageFormat` are `<Composition>` props in the 4.0.512 docs
and do not exist in `CompositionProps` here, so passing them there fails the typecheck.

**Verify the alpha, do not assume it.** On the MOV, `ffprobe` must report `qtrle,argb` and an empty
corner must decode transparent. On the WebM, `ffprobe` reports `yuv420p` even on a correct file,
because WebM keeps alpha in a side channel rather than in the pixel format.

```bash
# the shipped MOV
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,pix_fmt -of csv=p=0 out.mov
ffmpeg -v error -ss 1.5 -i out.mov -vframes 1 -y /tmp/f.png
magick /tmp/f.png -format "%[pixel:p{10,10}]\n" info:      # expect srgba(0,0,0,0)

# the preview WebM
ffprobe -v error -show_entries stream_tags -of json out.webm   # expect alpha_mode: "1"
ffmpeg -v error -vcodec libvpx-vp9 -i out.webm -vframes 1 -pix_fmt rgba -f rawvideo - \
  | head -c 4 | xxd    # expect 00000000
```

`cta-end-card` is the one file whose corner is not transparent, and that is correct: it is a
full-frame dark bed by design and reads `srgba(0,5,20,0.86)` once its scrim is up.

What each overlay sounds like, and the ducking it needs, is in
[references/sound.md](references/sound.md).

## Where an overlay sits, and what it says

**The kit ships as three shapes, all centred on `y = 826`.** One shape was wrong: a calendar
booking and a thumbs-up drawn at the same size says they are the same request. The hierarchy lives
in the geometry, which is the one place it cannot be argued with.

| shape | height | clips | what it is |
|---|---|---|---|
| `CtaSubscribeUnit` | 150 | Subscribe, Follow | avatar, handle, and a button that presses at frame 40 and turns into "Subscribed" / "Following" |
| `CtaHero` | 204 | Book a call, Build it yourself, Join the community | the asks that carry an address on a second line |
| `CtaPill` | 116 | Like, Comment, both handles | one line, one badge, no room for a second tier |
| `CtaProduct` | 204 pane | Agency Master, ClickUp Master | `CtaHero`'s pane with the product box standing in front of it |

**`CtaProduct` is the one shape whose subject is an object rather than an action**, so it lives in
`src/product-ctas/` and its box is CSS 3D geometry rather than the shipped packshot. A product signs
with its own mark there, never a stock glyph. It has three transform rules and a hard file-size
budget nothing else in the kit has: [references/product-ctas.md](references/product-ctas.md).

**Subscribe is a rehearsal, not a description.** "Subscribe" beside a bell icon *describes* the
action. An avatar, a handle and a button that presses and flips to "Subscribed" is the viewer
watching the outcome and then reproducing it. Remotion's own transparent-CTA prompt builds the same
thing. It has no tap ring: a ring has to sit outside the glass pane, which clips its own sweep,
and outside the pane it needs absolute coordinates that move with the handle string.

**A third party's logo on the disc keeps that party's colours.** `accent="platform"` on `CtaHero`
paints the disc the platform's own paper and leaves the slab indigo, because the pane is ours even
when the disc is not. The mark itself lives outside `icons.tsx` — `skool-mark.tsx` is the pattern:
it ignores `Icon`'s `color` prop, reads `size` as a width because it is wider than it is tall, and
carries its provenance in its header. Repainting somebody's logo in our palette is a forgery of the
logo, which is the same argument the subscribe slab already makes.

**The slab is the platform's, so its colour, its wording and its confirm glyph are props.** The
older rule here said the button stays cream because it is borrowing YouTube's affordance, and that
half was right: YouTube's is a solid light slab with dark type, and painting *that* one terra makes
it your button that happens to say Subscribe. What the rule got wrong was reading a constant into
a borrowing. TikTok's slab is a solid red one saying Follow, hollowing out to Following behind a
tick, so `accent="terra"` on `cta-follow-tiktok` is the same argument rather than an exception to
it — and the tick pops on `scale` rather than borrowing the bell's rotation, because a rotation on a
tick reads as an error. Terra is still off every ask we style ourselves except the discovery call.
`buttonWidth` is set per wording (372 for "Subscribed", 330 for "Following"): the faces cross-fade
at a fixed width so nothing reflows under the press, which means a short word left in a box sized
for a long one swims.

The corner geometry is not deleted, it is kept in the `youtube-ctas-corner` folder at
`left: 120, top: 798`. It is still the right answer for an overlay that runs under a sentence while
the edit continues, because the centre of frame is where the speaker and the screen capture live.
Reach for it when a CTA accompanies a line rather than owns the moment.

Either way, the frame is shared with YouTube's own furniture:

- **The bottom ~90px** is the progress bar and the controls whenever the viewer moves the mouse.
- **The top right** is where the cards teaser appears.

**Never centre an icon above the statement.** It is the most templated layout there is. The icon goes left of the type on the reading line and the group is what gets
centred, which is also why the type is left-aligned: it hangs off the icon rather than floating.

**A second line is an address, or it does not exist.** The old rule here said every CTA carries a
reason under the ask. It was right that mid-roll CTAs between 55% and 70% of a video measure far
better than end-screen ones, and wrong about what counts as a reason. Five of the seven labels were
invented to satisfy the rule: "New video every week" (three clips) is a promise the channel does not
keep, "It travels further" is false, and "I read every one" is true and about me rather than about
the viewer. All five are cut. Two survive, and both say *where to go*: a
bookable URL, and "Link in the description". Those clips are the two heroes; every
other ask is a pill, which has no second line to fill. Keep an indication under about 30 characters,
and never track it out or uppercase it, because it is a string the viewer reads and reproduces.

`shine` runs 54 frames, so any clip carrying it cannot be cut below about 80 without truncating its
own chord. Two of the seven carry it, which is what keeps it meaning something. On the subscribe
unit the chord lands on the *press* at frame 46, not on the entrance, so that clip needs 135 frames
rather than 120: the tail has to finish before the exit starts.

The end card is drawn to YouTube's element picker, which snaps to a grid and refuses to sit within
10% of any edge. Off that geometry, a placed element lands beside its own placeholder: two video
slots 560x315 at `left: 700` and `left: 1300`, `top: 383`; the subscribe circle 300px at
`left: 180, top: 390`; all centred on `y = 540`, everything 60px inside the frame. It gets no exit
animation, because fading it takes the clickable targets away while the viewer is reaching.

**The end card's subscribe disc carries the channel's avatar, on the same `avatar?` prop as
`CtaSubscribeUnit` and for the same reason.** YouTube's placed element paints the real channel
picture into that circle, so a bed showing a brand mark under a channel whose avatar is a face
reads as two channels for the seconds before the element settles. Pass the channel's own avatar;
falling back to the mark is only right where the mark *is* that channel's avatar. The disc needs `overflow: hidden` for the photo to
take the 150px radius. The photo costs about 2.9MiB of qtrle (8.7 to 11.6MiB), all of it in the
20-frame entrance, which is the same bill the width rule describes.

The glass surface, its concentric radii, the icon set and the type ramp are in
[references/surface.md](references/surface.md).

## The house rules this kit adds

- **One `interpolate()` per CSS property, with the exit as extra stops.** Two calls on the same
  property means the second silently wins, and in the Studio a property with two sources cannot be
  keyframed at all. Four stops, `[0, in, durationInFrames - n, durationInFrames - 2]`.
- **`boxShadow`, never the `glow()` filter, on anything containing type.** `filter` applies to the
  whole subtree, so a glow on a pill haloes the word inside it and the text goes soft. This is the
  `Plate` lesson from `primitives.tsx`, solved without needing `Plate`.
- **Hierarchy comes from size, and terra marks exactly one clip.** The hero is 204px tall and the
  pill is 116px; that is the hierarchy, and it needs no second hue to state it. Terra appears on the
  discovery call's icon disc and nowhere else, because that is the one ask for money. The whole slab
  in terra was rendered rather than argued about, and it fails: over footage the translucency drags
  it to brick and the glass edge stops reading, which is the banner-ad failure DESIGN.md already
  recorded on the website, in a different room. A sand fill was tried earlier for a secondary ask
  and rendered as a flesh-toned disc that pulled the eye off Subscribe entirely.
- **A handle is never uppercased.** Every other label in this project is tracked-out caps, but a
  YouTube handle is a literal string a viewer types into a search box, and an uppercased handle is not that
  string. Type rules stop at anything the viewer has to reproduce.
- **One ring, not a repeating pulse.** A loop needs modulo arithmetic, which the Studio cannot
  keyframe, and a CTA that keeps pinging outlives its welcome inside two seconds. The subscribe unit
  has no ring at all: it would have to sit outside the glass pane, which clips its own sweep, and
  outside the pane it needs absolute coordinates that move with the handle string. A signal that
  silently mislands on one of two clips is worse than no signal.
- **Never build a colour by appending a hex alpha to an `oklch()` string.** `` `${disc}73` `` yields
  `oklch(...)73`, which is invalid, and *one* invalid value drops the whole `box-shadow` list — the
  disc's rim and thickness with it. It renders clean, exits zero, and looks like nothing was set.
  Write the alpha inside the function: `oklch(0.65 0.2 30 / 0.45)`.

**Publishing is two files, not one.** The MOV is the deliverable and a browser cannot play it, so
render the WebM preview beside it and let the shelf show the WebM while the editor downloads the
MOV. A shelf that lists only MOVs looks broken to everyone browsing it.

## Execution flow

1. **Pick a shape before writing anything.** A new ask is almost always a `CtaPill` or a `CtaHero`
   in `src/youtube-ctas/glass/` with different props, not a fourth component. Write a new one only
   when the ask needs a mechanism the three do not have, the way Subscribe needed a button that
   presses. Inside a shape: inline styles, inline `interpolate()`, `Interactive.Div` with a
   hardcoded `name` on anything worth grabbing. Shared surface values go in `glass/surface.tsx`,
   never copied into a second shape.
2. Register it in `Root.tsx` under the `youtube-ctas` folder, written out rather than mapped, with
   `calculateMetadata={alphaPreviewWebm}` and inline `defaultProps`.
3. `pnpm typecheck`.
4. Render a still at each phase, composite it over a mid-grey, and **look at it**:
   ```bash
   npx remotion still src/index.ts <CompId> out/cta-stills/<CompId>-<frame>.png --frame=<frame>
   ffmpeg -y -f lavfi -i color=c=0x4a5560:s=1920x1080 -i in.png \
     -filter_complex "[0][1]overlay" -frames:v 1 flat.png
   ```
   A CTA reviewed on a white page or on black lies about its contrast, because it is designed for
   neither.
5. Add the beats to the composition with `<Sfx>`, then `pnpm build:sfx` if the kit changed.
6. `pnpm render:youtube-ctas-mov` for the deliverable, `pnpm render:youtube-ctas` for the preview.
7. Run the alpha checks and the transient check above on at least one output.
8. Put the MOV on the shelf the editor pulls from, and confirm it plays there. A browser preview
   needs the WebM beside it; a MOV will not play in a `<video>` tag.

## Verification checklist

- [ ] The MOV reports `qtrle,argb` and an empty corner decodes `srgba(0,0,0,0)`
- [ ] The preview WebM reports `alpha_mode: "1"` and a zero alpha byte in an empty corner
- [ ] An audio track is present and every transient lands on the frame the component names
- [ ] Nothing in the bottom 90px or the top-right corner
- [ ] End-card geometry matches the coordinates above, and it has no exit
- [ ] One `interpolate()` per property, exit folded in as extra stops
- [ ] No `filter` on any element that contains type, frost included
- [ ] Every wrapping curve is concentric with the curve it wraps: inner radius + its padding
- [ ] No colour built by appending a hex alpha to an `oklch()` string
- [ ] Frost grain is at or under 6%
- [ ] A still of every phase was composited over mid-grey and looked at
- [ ] Every MOV is under 25MiB, and any product box carries its own product's mark
- [ ] The clip is on the shelf the editor pulls from, with its WebM preview beside it

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one
not already listed, append it to Learned Patterns before finishing.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- An overlay that inherits the project's h264 config renders clean, exits zero, and arrives as a
  black rectangle where the transparency should be. Nothing catches it except opening the file over
  footage, so the alpha check is part of the render, not part of review.
- Importable and keyable are two different claims. A container-by-codec support table promises
  neither, and only a test in the editor that will actually cut the clip settles the second.
- A reason line under an ask is a liability unless it says where to go. Invented reasons ("new video
  every week", "it travels further") are promises the channel does not keep or claims about the
  presenter rather than the viewer.
- A sound that lands on the entrance when the component animates the press is not late by a little,
  it is on the wrong event. Name the frame in the component and check the transient against it.
