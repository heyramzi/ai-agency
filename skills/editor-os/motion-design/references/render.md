# Rendering: alpha, and the HyperFrames lane

An overlay that renders without its alpha channel looks right in every preview and wrong in the edit. Read the
first half before your first keyed render. The second half covers the other renderer.

## Alpha fails silently

The project's `remotion.config.ts` sets h264 for opaque clips. An overlay that inherits it renders clean,
exits zero and arrives as a black rectangle. Only opening the file over footage catches it.

The wrong codec keys as a black rectangle, and there are 2 lanes. A clip for an editor's timeline ships as
a QuickTime Animation MOV (`qtrle` with `argb`). HEVC with alpha in a MOV is about a fifth the size and
right for a shelf anybody downloads, because every plan of the editor reads it; but an HEVC-alpha MOV
sideloaded into an editor project has keyed as a black rectangle more than once, and qtrle fixed it. "For the
timeline" means qtrle, "for download" means HEVC.

Ship a MOV and never a WebM. In a 6-format test in Descript every MOV and the GIF keyed, and the WebM didn't: it imports a
VP9 alpha WebM and flattens it, and its *Supported file types* page promises transparency for nothing, so
importable and keyable are separate claims and only the test settles the second.

qtrle is large for glass and grain. Run-length coding gets nothing from per-pixel frost, so the same clips
are a fifth the size as HEVC. Don't fix a big file by dropping the grain; check the bitrate first.

Remotion can't write HEVC or qtrle alpha, so the render is 2 steps, ProRes 4444 then ffmpeg:

```bash
remotion render src/index.ts <CompId> <out>.mov \
  --config=remotion.prores.config.ts --codec=prores --prores-profile=4444 \
  --pixel-format=yuva444p10le --image-format=png
ffmpeg -v error -i <out>.mov -c:v hevc_videotoolbox -pix_fmt bgra \
  -alpha_quality 0.95 -b:v 40M -tag:v hvc1 -c:a copy -y <download>.mov
ffmpeg -v error -i <out>.mov -c:v qtrle -pix_fmt argb -c:a copy -g 600 -y <timeline>.mov   # the timeline version
```

- `remotion.prores.config.ts` exists because the default sets `Config.setCrf(16)` and ProRes has no CRF, so a
  ProRes render through the opaque config dies before frame one. Never put `defaultCodec: "prores"` in it.
- `-pix_fmt bgra` is what puts the alpha in; without it the file is opaque and nothing says so. `-c:a copy`
  keeps the sound, and `-an` silently throws it away. `-b:v 40M` tops the useful range (PSNR plateaus at
  37.7dB; the ceiling is videotoolbox's 4:2:0 chroma). `hevc_videotoolbox` with `-pix_fmt yuva420p` silently
  drops the alpha plane. `-g 600` on qtrle takes the whole kit down by a third (ffmpeg wrote a keyframe every
  12 frames).
- Still frames cost zero, so duration is free and motion isn't: an alpha MOV's size is dirty area times frames
  moved. Budget in this order: shorten the exit, drop frost on a large pane, cap the entry spring, trim the
  shadow. Clamp and round a spring's driven value past its visible settle (an unsettled tail bills qtrle
  at full size). If the GROUND is the graphic (no repeated frames) it bills near raw, so ship a
  motion-compensated mp4. Render `--sequence --image-format=png` and encode qtrle from the PNGs when a ProRes
  intermediate wastes inter-frame coding (34MB versus 28MB); the flag is `--sequence`, no trailing slash,
  reassembled with `-pattern_type glob -i "name-*.png"`.
- Still render a WebM twin as the browser preview: no browser decodes an HEVC alpha layer, so a
  `<video src="*.mov">` tile is blank. `alphaPreviewWebm` is named for that one job. On Remotion 4.0.504 the
  alpha defaults go through `calculateMetadata`; `defaultCodec`, `defaultPixelFormat` and
  `defaultVideoImageFormat` as `<Composition>` props are 4.0.512 docs and fail the typecheck.
- `mix-blend-mode: difference` is a no-op on alpha (nothing behind to sample): use a hard-edged travelling
  mask. A large translucent pane exits by an animated mask-wipe, never a fade (a fade recomputes the surface
  every frame; two thirds of one pane's export was its exit).

Verify the alpha from a decoded frame, because ffprobe can't see it. Both formats keep alpha in a side channel, so `ffprobe` says `yuv420p` on
a correct file. A decoded frame says `yuva420p` (`-read_intervals %+#1 -show_entries frame=pix_fmt`, ffmpeg 9
decodes that layer, so HEVC alpha converts to qtrle without a re-render). Older ffmpeg reads it opaque, and a
corner test passes a file that keys to black. AVFoundation is the decoder that's always right on a Mac.

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 out.mov   # hevc or qtrle
magick /tmp/f.png -format "%[pixel:p{10,10}]\n" info:   # srgba(0,0,0,0), on a frame decoded at 1.5s through AVFoundation
ffprobe -v error -show_entries stream_tags -of json out.webm                                # alpha_mode: "1"
```

`scripts/alpha-edges.sh` checks an 8px border band at alpha 0 on every frame. A full-frame dark end card is
the one overlay whose corner is opaque, by design: name it as an exception in the verifier. A "blank" render
is confirmed by a composite and pixel count, since a mean-alpha check fails a sparse overlay under 1% of
pixels. Don't match a frame grab with `drawbox` (it leaves alpha untouched) or `-ss` before `-i` (it restarts
PTS); matte with a generated `color` source. What an overlay sounds like: `sound.md`.

Done when: the codec reads right, a corner decodes `srgba(0,0,0,0)` and the edge band is clear on every frame.

## The HyperFrames lane

Both renderers open Chrome, draw every frame and encode. Remotion takes a React component; HyperFrames (HeyGen,
Apache-2.0, renders locally, no build step) takes an HTML file with `data-start`/`data-duration` and a
paused GSAP timeline on `window.__timelines`. Treat it as an addition: never port a Remotion
clip, since a machine translation carries about 80% across and the missing 20% is the taste.

Reach for HyperFrames when the source is already a web page, HTML prototype, GSAP or Lottie file (it seeks
what it's handed); captions or cards go on footage that exists (`embedded-captions` runs 35 identities with
local Whisper and subject matting so a word sits behind his head; `talking-head-recut` times cards to the
transcript); it's one throwaway clip nothing reuses; a client runs it on their own machine (no seat count;
Remotion is free only up to 3 people); you want 20 variants of one card (`--batch rows.json`,
`compare v1/ v2/`); or the input is a website, Figma frame or PR (`capture`, `figma`, `pr-to-video`).

Stay in Remotion when the clip reuses a token, scene or component; it has to cut next to a Remotion clip
(font and spring both need re-fitting by hand, an hour of work against 10 minutes); the beat is a figure in the house
language; the video already has a plan and a built set (consistency beats a better renderer for one clip);
the motion comes from class-toggled CSS transitions (they don't seek, below); or a composition input must be
typed and validated.

Install on demand and never vendor (20 skills, about 1100 files): `npx hyperframes skills check` (read-only),
`skills update` (core set, 9 skills, about 6.7MB), `skills update pr-to-video` (one workflow). Files live once
in `~/.agents/skills/` and each `~/.claude/skills/hyperframes*` symlinks to it; `skills update` recreates the
second copy, so re-link. Ask `/hyperframes` for a video and its router installs only the workflow it picks.
The HTML authoring contract is `/hyperframes-core`. A hosted video model instead is a prompting job.


HyperFrames beats Remotion at generating options:

```bash
npx hyperframes render --variables '{"title":"Hours back"}' -o a.mp4
npx hyperframes render --batch rows.json --json     # one render per row
npx hyperframes snapshot --at 0,2,5                 # stills, no encode: judge a variant here
```

Read values with `window.__hyperframes.getVariables()`, declare them in `data-composition-variables`, and add
`--strict-variables` so a typo fails and never falls back to the default.

### Measured (26 Aug 2026, v0.8.15)

- A 10s 1080x1920 project rendered in 12.1s to 2.3MB on 6 workers; the first `npx` adds about 8s. `--format
  mov` writes ProRes 4444 `yuva444p12le`, so the qtrle conversion for Descript is unchanged; `webm` and
  `png-sequence` carry alpha too. `init` refuses non-interactive runs without `--example blank --resolution
  portrait --non-interactive`. Rendering one `<template>` sub-composition with `-c` cost 1m37s for 3
  seconds and printed `sub_timeline_readiness_timeout`: render the project and skip the fragment. Telemetry is
  on by default (`npx hyperframes telemetry disable`). A scaffold pins its CLI version
  (`npx hyperframes@latest upgrade --project . --check`).
- What seeks, tested with a 1200px move written 4 ways: CSS `@keyframes` yes, frame-accurate; Web Animations API
  created and never played yes; GSAP on the registered timeline yes; and a CSS `transition` fired by a class
  the timeline toggles fails, since frames are captured out of order across 6 workers and each restarts the
  transition. So a UI-motion snippet library ports its durations, beziers, blur and distance scales and
  open/close asymmetry but drops its trigger: re-express as `@keyframes` with `animation-delay` or drive it from
  GSAP. None of it pastes into Remotion, which has no CSS animation to advance (re-author as `interpolate`
  and `spring`). A motion file is physics (4 springs and one weight for every clip); a UI-motion library is
  durations and beziers for opening, closing or swapping. A figure wants the first, an interface clip the
  second; mixing them is how a set stops looking like one hand.
- To match a Remotion clip in HyperFrames, ship the face with the project. Its Chrome has no SF Pro, so
  `-apple-system` fell to Helvetica and every row came out 5% wide (511px versus 487); copy
  `/System/Library/Fonts/SFNS.ttf` in with `@font-face` `font-weight: 100 900` and the row lands at 482. A
  Remotion spring has no GSAP twin: for an arrival that stops, fit `back.out(1.6)` over 0.4s (about damping 13,
  stiffness 190); for anything cut beside the original, sample the render frame by frame and replay one
  keyframe per frame at `ease: "none"` (9 points mid-run down to 2px of 620). A full-frame gradient over
  alpha took a ProRes intermediate from 19MB to 475MB while the qtrle deliverable stayed 36MB: keep the
  intermediate out of git.
