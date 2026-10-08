# Sequencing: rhythm, pins, sound, and the review board

## Contents

[The gates](#the-gates), [Shot triggers](#shot-triggers),
[The clock a clip is cut against](#the-clock-a-clip-is-cut-against),
[Pins: placing b-roll, overlays and zooms](#pins-placing-b-roll-overlays-and-zooms),
[Sound on the cut](#sound-on-the-cut), [Review in Editor OS](#review-in-editor-os)

Open this before writing a `pins.json`, placing a clip, when an edit is "done" but reads flat, and when preparing the review page. `scripts/sequence.py` implements every number here; this file is the reasoning. Stamping looks over cards: [layouts.md](layouts.md).

## The gates

`sequence.py audit` reads the speed-adjusted play clock off a `dscript grab` payload or a `pnpm descript doc` export. It exits 1 on any of three:

- **A state change every 7 s or better, median.** A state change is a card or a clip arriving; a jump cut isn't one (same frame 2 words later).
- **20% to 50% of runtime under a full-frame overlay.** Under 20% it's a face talking; over 50% nobody feels present. A build-along is legitimately 60% screen: read the gate as "why is this one different".
- **No stretch over 12 s where nothing changes.** Run it on the finished cut before the b-roll pass, and after.

| | ES02 (the standard) | EC51 (what it replaced) |
|---|---|---|
| runtime | 7:34 | 22:54 |
| jump cuts | 70, one per 6.5 s | 123, one per 11.2 s |
| state changes | 69, median gap 5.4 s | 23, median 10.0 s |
| full-frame overlays | 20, median 4.7 s | 2, median 64.2 s |
| coverage | 24% | 9% |
| still stretches over 12 s | 6 | 4 (one 18:47 long) |

`balance` reads the distribution, because an average isn't a rhythm. `pnpm descript doc <project> --out doc.json` then `python3 scripts/sequence.py balance doc.json` (it needs the real document). EC49 (18:50) passed `audit` (median 7.1 s, 20% coverage) while `balance` found 4 minutes with nothing on screen, the thinnest fifth holding 7% of the dressing, and 74% of runtime silent (longest 2:50) (17 state changes in minute one, three in minute sixteen: 2 edits joined). Run `audit` and `balance` on every finished edit; read the per-minute table and skip the verdict line.

| 8 Sep 2026 baseline | ES02 7:39 | EC49 19:00 | EA20 20:02 |
|---|---|---|---|
| cards | 95 | 154 | 86 |
| median state gap | **4.6 s** | 7.1 s | 7.8 s |
| full-frame coverage | **28%** | 22% | 15% |
| still stretches over 12 s | 6 | 19 | 23 |
| naked minutes | **0** | 2 | 10 |
| arrivals carrying a sound | 10% | 27% | 27% |
| longest silence | 110 s | 163 s | **789 s** |

Four `balance` gates: **no naked minute** (under 6 s of clip, graphic or title AND at most one sound); **no silent stretch over 45 s** (the median isn't the gate: EC49's 44 sounds arrive in 2 bursts); **80% of arrivals carry a sound within 0.6 s** (EC49 23%); **no fifth of runtime under 8% of the dressing**. Lanes are classified off the document: `sound` (audio, no picture), `title` (no media), `graphic` (clip whose house name carries `[mm-ss]`), `footage` (any other clip or still). `chrome` (a plate, a progress HUD) isn't dressing: a scene counts only above the camera on some card and wider than `CHROME_W` (0.15 frame widths), else EC49 read 199% title. A naked minute is a brief dispatched in the same turn, never a line in the summary; inside a demo it's a `broll` brief (`motion-design` fires where a script argues, a demo shows), and a sound raises NAKED only to `thin`.

A screen demo can't pass the spread gate, and shouldn't. EA20 (7 Sep 2026) closed every other gate (0 naked minutes, no silent stretch, 88% of arrivals heard, 121 sounds) and failed this one on purpose, 3:33 to 22:03 dressed by sound and card rhythm alone: hold no framing past ~10 s and put a whoosh on every arrival.

## Shot triggers

`sequence.py plan` detects triggers in the surviving script:

| trigger | fires on | the shot |
|---|---|---|
| `list` | 3 or more clauses, each under 2.6 s, ending in commas | one clip per clause, 1.0-1.5 s, full frame |
| `screen` | "this is what it looks like", "an example of", "let me show you" | screen-beside-portrait look, zoom to 200% at the detail |
| `motion` | a count: "50 plus agencies", "three pillars" | motion clip full frame, camera corner at 0.10 wide |
| `cta` | "the link is down description", "book a call" | the CTA card |
| `jumpcut` | a dead stretch with an announcement of the next sentence, under 3.5 s | ignore it: breaks the frame AND shortens |
| `zoom` | a dead stretch with nothing to cut | next ladder step, on a sentence start |
| `punch` | a contrastive opener: "But", "Now", "Here's why", "Except" | 1.0x to 1.22x hard crop on the word's first consonant |

A dead stretch prefers a jump cut (ES02's 29 s from 6:31 splits by ignoring `And one last thing,` at 6:43); jump cuts land in a `.phrases.json` through `resolve.py` and `dscript apply`, not `--pins`. The zoom ladder returns to 100 between steps (`110, 100, 120, 100, 130, 100`): a zoom pin has no closing card, so two in a row drift. A punch-in is the opposite move, a hard cut with zero dead frames: the cheapest tension device (no graphic, one crop) and the next sentence arrives marked important; it lives here because Remotion never sees the speaker's frame. The speaker shrinking into a rounded glass window is the other move from that teardown and replaces a cut (`speaker bubble`, [layouts.md](layouts.md)).

A motion clip is named `13b [06-41] Each Video Builds A Space Portal.mp4`; `plan` binds it to a slot within 25 s of its bracket (EP33: `10 [19-02] Less Than Five Minutes.mov` to 19:02 exactly). The bracket is a seed, never the anchor: the pin resolves on the phrase (ES02's `[01-28]` clip sits at 1:33 after the cut, correctly).

```bash
C=~/.descript-clip/current.json                     # what `dscript grab` wrote
python3 scripts/sequence.py audit $C
python3 scripts/sequence.py plan $C --out pins.json   # every OPEN slot is a clip that doesn't exist yet
python3 scripts/pins.py resolve pins.json           # dry run, refuses what it can't land
python3 scripts/dscript.py apply cuts.json --pins pins.json
python3 scripts/sequence.py audit $C                # grab again first: the gate should pass
```

An `OPEN` slot is the brief for `broll` or `motion-design`, trigger and line written. Don't fill one with a clip that argues something else to turn a number green. `plan` invents no geometry (a project with no placed clip has no look to clone: drag one in, copy again) and binds no clip that isn't on the timeline.

The shot read. The `plan` triggers are all surface patterns, so "ClickUp, your project tool, could talk to Notion, your documentation tool" fires nothing and takes a zoom (EA20: 29 zoom steps to 13 graphic slots; the author: "why isn't the descript skill smart enough to know that this is a visual context?"). Run it after `plan`, as an addition:

```bash
python3 scripts/visuals.py brief doc.json --out visuals.txt
python3 scripts/visuals.py check doc.json briefs.json --plan pins.json    # exits 1 over 45% zoom steps
```

Hand ONE Sonnet agent the WHOLE script (a split reader can't inherit the first frame of a repeated structure) plus the plan's table. Its brief: read `visuals.txt` (one paragraph per line, `[index] timecode`), skip what pass 1 already found (numbers, demonstratives, contrastive openers, dead air), and report a beat only if it passes **what would a viewer know after this clip that the sentence did not tell them?**, with exactly one answer: `quantity` (arithmetic made comparable), `consequence` (cost or return left implicit), `structure` (two things joined, a loop, 3 layers), `recognition` (a real product or screen they have open). Report only when the sentence works muted and the clip says something muted (a graphic that is the sentence in shapes is redundancy), the drawing is CONCRETE, and it isn't a screen the recording shows. Skip live demos, film or meme beats, and anything over one beat per 30 s. Output a JSON array only (8 to 20 entries per 20 minutes, strict) shaped `{"i": 115, "line": "<verbatim substring of that paragraph>", "adds": "structure", "shows": "<one sentence naming what's in the frame, no style or template id>"}`. `check` drops (never repairs) a brief that doesn't land verbatim, then marks each `covered`, `zoom only` or nothing. `zoom only` is the failure being measured. Dispatch every resolved brief the same turn: `motion-design` owns anything drawn and `broll` owns anything found. A screen already recorded needs no agent.

Two ways to turn a still into a clip, shipped side by side so you pick by looking. `pnpm broll:loop <image>` (DepthFlow parallax, local, free, 270 fps) or a hosted image-to-video model for physics the depth map can't fake (check at 480p).

## The clock a clip is cut against

A clip's length is the span between two phrases in the cut. A subtitle export timed the Glance set **203.8 s wrong** (a cut took 2038.3 s to 1834.5 s; 12 clips designed against timings out up to 196 s). A cut isn't a uniform shift: drift was 0.85 s at the start, then 6 s at 2:30 and 196 s at 29:00.

```bash
pnpm descript doc <project> --out doc.json
python3 scripts/beatclock.py doc.json                      # every surviving tau, with its start
python3 scripts/beatclock.py doc.json --find "a phrase"
python3 scripts/beatclock.py doc.json --beat "first words" "last words"   # start, end, duration
```

It walks the superTau and skips blocked taus. It divides each duration by `speed` (ES02: 476.83 s undivided, 454.54 s true), and its total equals `get_project`'s duration. Re-run after any cut, reorder or paste. A beat is its own sentence; neighbours are a constraint (2 beats 2.6 s apart are a montage, not 2 clips). A shortened beat loses its last movement. With ignores, report duration by summing unblocked taus (what `pnpm descript script` prints). A cut's length comes off layout cards or the last timecode, never the bed's seconds (the bed is 181 s under a 2:21 cut). A `[mm-ss]` in a media name goes stale on every re-cut: to find where a clip really plays, map `pinScenes[].id` to the card through `cards.components[].layers[].sourceSceneId` and read `layout cards`. The SRT and `layout cards` agree; the markdown transcript drifts late (58 s at 5:30).

## Pins: placing b-roll, overlays and zooms

A pin is three coupled objects: `pinTrack` (media, in/out via `audioSegment.offset/duration`, `speed`), `cardBoundaryComponent` (the whole layer stack at a point; the clip is one layer by `sourceSceneId`), `sceneComponent` (`tauAnchor` to `endAnchor {cardBoundary}`). An insert is a state change: a card at the in-point carrying the layer, a card at the out-point without it. Miss the closing card and the clip runs to the end. Layer order is z-order, **index 0 on top**; geometry is width-normalised (full 16:9 `box {width: 1, height: 0.5625}`; `position` 0..1 names the centre; `--anchor` converts). Geometry is cloned from a layout already in the project (`catalogue` prints them): box, contentScale, contentPosition, shadow trio, glassBlur, colorAdjustments, and the camera layer is replaced by the layout's, not merged. A zoom changes only `contentScale` and needs no closing card: `{"zoom": 130, "from": "..."}`. Overrides: `"geo": {"contentScale": {"x": 1.4, "y": 1.4}}`, `"z": 0`, `"cam": false`, `"speed": 2`. A still holds its slot to the closing card whatever `--seconds` says. `audioSegment.duration` is the ref's audio duration, not its video one. `--media` resolves against the media library: read names off `assets` or `doc`, never a pin (pin `1b [00-28] ...`, media `4a [00-24] ...`).

```json
[{"media": "19 [02-00] Nobody Pointed At It.mp4", "in": 0, "dur": 16.8, "layout": "02 [00-20] Mental Load Fades",
  "from": "Nobody takes care of harnessing that information", "to": "for your sales team and your AI"}]
```

- Run `catalogue` before any zoom and read the layout line as a gate. `none - no card in this payload carries a pin layer` means no stack to clone, and every zoom lands an **empty card** (EC49, 31 Aug: 14 blank cards). Then `pnpm descript layout pace` is both placement and repair (`--screen SCREEN` on a screen tour).
- A b-roll ends where its scene ends. The author said this on 28 Sep 2026 about B01a stopping 0.2 s short: "when you insert a b-roll you need to make sure that it always ends at the end of the sequence." At 85% or more of the card `pin` slows it so the last frame lands on the close (~0.9x is invisible; reports `speed` and `holds: 0`); below 0.85x it refuses and asks for `--to` on an earlier word. Longer is fine (`holds` negative). A keyed overlay isn't held to this. Anything above 0 on a b-roll is the empty frame.
- Refusals. Clipboard route (`dscript.py pins`) can't place media never on the timeline (40 of 43 on EC51); `pnpm descript pin` reads the guid off the document and can (an EC51 clip imported 15 days earlier), so reach for the CLI first. Phrases resolve against the surviving script only (a pre-cut phrase after a reorder refuses); an ambiguous phrase takes `nth`/`pre`/`post`; a project that never had a pinTrack needs one clip dragged in. `--to "<phrase>"` is a real order check (`beatclock.py --find` both phrases first).
- `--to` where the stretch has no cards. The default closes on the next card, which on a canvas walk is 20 minutes on (EC51, `holds: 398.6`). `--to` cuts the closing card in the standing look; read `ends` against the clip length in `--dry` (shorter truncates, longer freezes).
- An alpha `.mov` needs `--keep-cameras`. `pin` hides cameras under anything taking the full frame (`camerasHidden`), and can't tell a keyed clip from b-roll. A qtrle overlay draws in the web editor only while playing: press play before judging a key. `pin` once wrote every effect enabled regardless of the layout's `isDisabled` rows.
- No transition where the camera goes off. The author, 9 Sep 2026: a smart transition there "creates some weird flicker". `pin` clears the two boundaries bracketing a clip (`transitionsCleared`); `descript transition sweep <project> <comp>` does a whole composition (`--dry` first); one boundary is `transition <card> --off`.
- `pin rm` removes scene, registration and every layer in one write (`--at` scopes it). A pin's `sortTiebreaker` is `index + 0.5`, so any card change needs `realign()`. A placed pin on a stretch with no cards (EC51): `pin --to` cuts it.
- The transparent plate removes a clip when nothing else does: an alpha clip over the card's exact length hands the face back. `ffmpeg -y -f lavfi -i "color=c=black@0.0:s=1920x1080:r=30:d=<s>,format=argb" -vcodec qtrle -t <s> plate.mov`; import, `media swap` the unwanted clip for it, then `rename`/`mv` the survivor (a swap keeps the OLD media's id and name). Match the card length or run a few hundredths over. Swap by media id, never name: two copies of one stock clip are routine and a name match swaps the unplaced one silently.
- Tests: `scripts/test_pins.py <grab.json>` derives its spec from the payload (closing card drops the layer, geometry matches, no dangling scene, no id collisions). The filler pass cuts sentence-opening `now`/`so` positionally (`so that` keeps `so`).
- A screen share pinned as long clips over a cut take drifts at every cut, and a silent re-run recorded apart has no offset (EC51): one pin per board via an `edits` batch, `pin --at <sentence> --to <next sentence> --from <screen second> --onto SCREEN`, normal speed; the author rejected a pieced track with speed changes. A project's Stock Media folder is what was auditioned: count `pinScenes` per mediaRef for what was used.

## Sound on the cut

A sound is a pin no layer draws, [layouts.md](layouts.md) owns the object and `--sound`; levels, -14 LUFS and the density law are in `editor-os/motion-design/references/sound.md`. Sound is the third hook (`@kienobimedia`, 2026: "Everyone obsesses over the words and the visuals, but sound is the third hook most creators skip"), which became the 80%-of-arrivals gate.

| the edit does this | EC49's stock use | the clean kit |
|---|---|---|
| cutaway or graphic arrives | `Whip Low Whoosh` (12 of 16, 5 of 5) | `whoosh` |
| a title or text line arrives | `Text Readout Digital` (20) | `ui` |
| a line replaces the one before | `Designed Transitions Shuffle ...Flicker 01` | `ui`, lower gain |
| a section ends and another starts | `Deep Low Whoosh` | `impact`, or `riser` into the cut |
| the video opens | `Fast Hi-Tech Whoosh 3` | `riser` + `impact` |
| a wide shot is held | `Atmospheric Swish Wind Swoosh`, gain 0.30 | `swell` |
| mouse click on a screen recording | never used | `click` |
| typing on a screen recording | never used | `type-2s` / `type-4s` |

The last two rows are the finding: 12 unbroken demo minutes with no click or keystroke voiced (also all four naked minutes), voices the kit has held since 2026-08-27. ES02 places three a minute; EC49 2.3, in 2 bursts. Placing: sounds go in the same `edits` pass as the splits and clips (a separate pass is written last, so not at all): `pnpm descript pin <project> <comp> --media "Whip Low Whoosh" --at "<phrase>" --sound --gain 0.4`, `balance` before to find the silence and after to prove it; the pin pass writes `pin --sound` beside every graphic arrival. Three finished edits put a sound on at most 27% of arrivals: sound is this channel's standing gap. On the frame, never one frame early; never 2 cuts in a row (delete one whoosh). EA20 ran 12 minutes of screen recording without a `click` or `type-2s`.

## Review in Editor OS

The project page is the review board: its rail lists the passes and choices left; a pass is done when nothing in it is open (no Finish button), and a review click places nothing.

`editor-os transcript <project>` pulls the cut, words and chapters into `edit.json` (rerun after a cut changes). `editor-os plan <project>` reads `beats.json`, `pins.json` and the music offer into `edit.json`, keeping earlier decisions by beat. `beats.json` is optional input: `layouts`, `motion`, `broll`, `sfx` rows `[code, "m:ss", "spoken line"]` (layout rows add pack names); files go under `motion/`, `broll/<worker>/`, `sfx/`, each named with its beat code first (`M1 [01-16] Tools.mp4`); the page finds new files on refresh, and a beat with no file shows what's missing.

The page reads the transcript in paragraphs with removals marked, and a note on a line asks for a fix. Each beat is a card (layouts and zooms, then inserts in playing order: keep the AI's pick or another; an unrendered beat can't be kept), and music offers 3 tracks. Decisions live in `edit.json`, notes in `edit.notes.json`, beside `RUN.json`, and only the studio writes them, through an `editor-os` verb. `editor-os feedback <project>` and `editor-os wait` read them; answer a note with `editor-os reply <project> <id> "<what changed>"` (a note reopens its beat until accepted). `editor-os place <project>` refuses until he has decided every beat and the music, then applies kept layouts, pins kept media and sounds, lays the bed.
