# Sequencing: rhythm, pins, sound, and the review board

## Contents

[The gates](#the-gates), [Shot triggers](#shot-triggers),
[The clock a clip is cut against](#the-clock-a-clip-is-cut-against),
[Clips and layouts on the local route](#clips-and-layouts-on-the-local-route),
[Sound on the cut](#sound-on-the-cut), [Review in Editor OS](#review-in-editor-os)

Open this before writing a `pins.json`, when an edit is "done" but reads flat, and when preparing the review page. `scripts/sequence.py` implements every number here; this file is the reasoning. Placing a clip: [pins.md](pins.md).
Stamping looks over cards: the layouts page in the studio.

## The gates

`sequence.py audit` reads the speed-adjusted play clock off a `dscript grab` payload or a `pnpm descript doc` export. It exits 1 on any of three:

- **A state change every 7 s or better, median.** A state change is a card or a clip arriving; a jump cut isn't one (same frame 2 words later).
- **20% to 50% of runtime under a full-frame overlay.** Under 20% it's a face talking; over 50% nobody feels present. A build-along is legitimately 60% screen: read the gate as "why is this one different".
- **No stretch over 12 s where nothing changes.** Run it on the finished cut before the b-roll pass, and after.

| | the standard | what it replaced |
|---|---|---|
| runtime | 7:34 | 22:54 |
| jump cuts | 70, one per 6.5 s | 123, one per 11.2 s |
| state changes | 69, median gap 5.4 s | 23, median 10.0 s |
| full-frame overlays | 20, median 4.7 s | 2, median 64.2 s |
| coverage | 24% | 9% |
| still stretches over 12 s | 6 | 4 (one 18:47 long) |

`balance` reads the distribution, because an average isn't a rhythm. `pnpm descript doc <project> --out doc.json` then `python3 scripts/sequence.py balance doc.json` (it needs the real document). An 18:50 cut passed `audit` (median 7.1 s, 20% coverage) while `balance` found 4 minutes with nothing on screen, the thinnest fifth holding 7% of the dressing, and 74% of runtime silent (longest 2:50) (17 state changes in minute one, three in minute sixteen: 2 edits joined). Run `audit` and `balance` on every finished edit; read the per-minute table and skip the verdict line.

| 8 Sep 2026 baseline | the standard, 7:39 | a long talk, 19:00 | a screen demo, 20:02 |
|---|---|---|---|
| cards | 95 | 154 | 86 |
| median state gap | **4.6 s** | 7.1 s | 7.8 s |
| full-frame coverage | **28%** | 22% | 15% |
| still stretches over 12 s | 6 | 19 | 23 |
| naked minutes | **0** | 2 | 10 |
| arrivals carrying a sound | 10% | 27% | 27% |
| longest silence | 110 s | 163 s | **789 s** |

Four `balance` gates: **no naked minute** (under 6 s of clip, graphic or title AND at most one sound); **no silent stretch over 45 s** (the median isn't the gate: one talk's 44 sounds arrived in 2 bursts); **80% of arrivals carry a sound within 0.6 s** (23% in that talk); **no fifth of runtime under 8% of the dressing**. Lanes are classified off the document: `sound` (audio, no picture), `title` (no media), `graphic` (clip whose house name carries `[mm-ss]`), `footage` (any other clip or still). `chrome` (a plate, a progress HUD) isn't dressing: a scene counts only above the camera on some card and wider than `CHROME_W` (0.15 frame widths), else one talk read 199% title. A naked minute is a brief dispatched in the same turn, never a line in the summary; inside a demo it's a `broll` brief (`motion-design` fires where a script argues, a demo shows), and a sound raises NAKED only to `thin`.

A screen demo can't pass the spread gate, and shouldn't. One screen demo (7 Sep 2026) closed every other gate (0 naked minutes, no silent stretch, 88% of arrivals heard, 121 sounds) and failed this one on purpose, 3:33 to 22:03 dressed by sound and card rhythm alone: hold no framing past ~10 s and put a whoosh on every arrival.

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

A dead stretch prefers a jump cut (a 29 s stretch from 6:31 splits by ignoring `And one last thing,` at 6:43); jump cuts land in a `.phrases.json` through `resolve.py` and `dscript apply`, not `--pins`. The zoom ladder returns to 100 between steps (`110, 100, 120, 100, 130, 100`): a zoom pin has no closing card, so two in a row drift. A punch-in is the opposite move, a hard cut with zero dead frames: the cheapest tension device (no graphic, one crop) and the next sentence arrives marked important; it lives here because Remotion never sees the speaker's frame. The speaker shrinking into a rounded glass window is the other move from that teardown and replaces a cut (`speaker bubble`, the layouts page in the studio).

A motion clip is named `13b [06-41] Each Video Builds A Space Portal.mp4`; `plan` binds it to a slot within 25 s of its bracket (`10 [19-02] Less Than Five Minutes.mov` lands on 19:02 exactly). The bracket is a seed, never the anchor: the pin resolves on the phrase (a `[01-28]` clip sits at 1:33 after the cut, correctly).

```bash
C=~/.descript-clip/current.json                     # what `dscript grab` wrote
python3 scripts/sequence.py audit $C
python3 scripts/sequence.py plan $C --out pins.json   # every OPEN slot is a clip that doesn't exist yet
python3 scripts/pins.py resolve pins.json           # dry run, refuses what it can't land
python3 scripts/dscript.py apply cuts.json --pins pins.json
python3 scripts/sequence.py audit $C                # grab again first: the gate should pass
```

An `OPEN` slot is the brief for `broll` or `motion-design`, trigger and line written. Don't fill one with a clip that argues something else to turn a number green. `plan` invents no geometry (a project with no placed clip has no look to clone: drag one in, copy again) and binds no clip that isn't on the timeline.

The shot read. The `plan` triggers are all surface patterns, so "ClickUp, your project tool, could talk to Notion, your documentation tool" fires nothing and takes a zoom (one screen demo: 29 zoom steps to 13 graphic slots). Run it after `plan`, as an addition:

```bash
python3 scripts/visuals.py brief doc.json --out visuals.txt
python3 scripts/visuals.py check doc.json briefs.json --plan pins.json    # exits 1 over 45% zoom steps
```

Hand ONE Sonnet agent the WHOLE script (a split reader can't inherit the first frame of a repeated structure) plus the plan's table. Its brief: read `visuals.txt` (one paragraph per line, `[index] timecode`), skip what pass 1 already found (numbers, demonstratives, contrastive openers, dead air), and report a beat only if it passes **what would a viewer know after this clip that the sentence did not tell them?**, with exactly one answer: `quantity` (arithmetic made comparable), `consequence` (cost or return left implicit), `structure` (two things joined, a loop, 3 layers), `recognition` (a real product or screen they have open). Report only when the sentence works muted and the clip says something muted (a graphic that is the sentence in shapes is redundancy), the drawing is CONCRETE, and it isn't a screen the recording shows. Skip live demos, film or meme beats, and anything over one beat per 30 s (long-form only: a Short follows [shorts.md](shorts.md#overlays-and-b-roll-before-motion)). Output a JSON array only (8 to 20 entries per 20 minutes, strict) shaped `{"i": 115, "line": "<verbatim substring of that paragraph>", "adds": "structure", "shows": "<one sentence naming what's in the frame, no style or template id>"}`. `check` drops (never repairs) a brief that doesn't land verbatim, then marks each `covered`, `zoom only` or nothing. `zoom only` is the failure being measured. Dispatch every resolved brief the same turn: `motion-design` owns anything drawn and `broll` owns anything found. A screen already recorded needs no agent.

Two ways to turn a still into a clip, shipped side by side so you pick by looking. `pnpm broll:loop <image>` (DepthFlow parallax, local, free, 270 fps) or a hosted image-to-video model for physics the depth map can't fake (check at 480p).

## The clock a clip is cut against

A clip's length is the span between two phrases in the cut. A subtitle export timed one set **203.8 s wrong** (a cut took 2038.3 s to 1834.5 s; 12 clips designed against timings out up to 196 s). A cut isn't a uniform shift: drift was 0.85 s at the start, then 6 s at 2:30 and 196 s at 29:00.

```bash
pnpm descript doc <project> --out doc.json
python3 scripts/beatclock.py doc.json                      # every surviving tau, with its start
python3 scripts/beatclock.py doc.json --find "a phrase"
python3 scripts/beatclock.py doc.json --beat "first words" "last words"   # start, end, duration
```

It walks the superTau and skips blocked taus. It divides each duration by `speed` (one cut: 476.83 s undivided, 454.54 s true), and its total equals `get_project`'s duration. Re-run after any cut, reorder or paste. A beat is its own sentence; neighbours are a constraint (2 beats 2.6 s apart are a montage, not 2 clips). A shortened beat loses its last movement. With ignores, report duration by summing unblocked taus (what `pnpm descript script` prints). A cut's length comes off layout cards or the last timecode, never the bed's seconds (the bed is 181 s under a 2:21 cut). A `[mm-ss]` in a media name goes stale on every re-cut: to find where a clip really plays, map `pinScenes[].id` to the card through `cards.components[].layers[].sourceSceneId` and read `layout cards`. The SRT and `layout cards` agree; the markdown transcript drifts late (58 s at 5:30).

## Clips and layouts on the local route

Run `editor-os layout sync --check` before you pick a layout. Drift means the layout packs are behind
Descript: report it, and don't pick from a stale pack.

A new file doesn't change the page. An `N ... alpha.mov` beside `N ....mp4` only adds an option;
the pick, plan slot and `.drafts/<beat>.mp4` clip stay on the old clip until
`editor-os pick <name> <beat id> "<file>"`. A clip with no beat of its own (an overlay beside a step
label) goes in with `editor-os overlay <name> --file "<file>" --at "<first words>" [--until "<last words>"] [--layout "<layout>" [--zoom 1.12] [--then "<layout>"]] [--note n18]`: it
anchors on words, never a timecode, and a phrase may cross a paragraph. `--layout` makes the whole pair in the same save: the clip's first word gets that layout (zoom 1 unless `--zoom`) and where the card starts to leave the layout goes back to what it was, or to `--then`. Don't run `layout --at` after it. That is also the proof for pass 5 and 6 when the clip has no beat of its own. A scene's look changes with
`editor-os layout <name> <second> | --at "<first words>" ["<layout>"] [--zoom 1.12] [--text "<line>"...]`, any layout in the pack. A second within 0.25s of a scene's start sets that scene. A second inside a scene splits it at the nearest word start (a phrase break within 1s wins, a second clear of each edge), except at an overlay's enter or leave, which it lands on exactly; on the same layout the split punches in or out, so a hold past 6s gets a change without a hand edit (`cutcheck` flags one, and `layout <name> --fix-holds` makes every split it names in one save, alternating zoom 1 and 1.12; it never splits inside a clip, so a hold that is one long clip stays and is named: shorten that clip with `overlay --until`). `--text` fills a Title card and clears itself on a layout that draws none. A layout and its overlay enter and exit together: the overlay pulls its layout onto its first word and the next layout onto where the card starts to leave, and keeps both through a re-cut. `cutcheck` fails a pair that drifted at either end, and a clip that draws inside the caption box. 2 clips that overlap (an opaque one still on screen when the next starts) can't pass that edge check: trim one with `overlay --until`, don't move layout times. After any clip change, open the preview and look.

Text and marks are alpha. A beat of only words or a light diagram is an ARGB `.mov` with nothing
behind it (`motion-design`). Check by compositing frames over
gray and over dark with Python PIL; an ffmpeg `tile` sheet over alpha comes out cropped or black. The
`lane` sets the badge: a clip in `broll/` is `found` (B-roll), a drawn one is `drawn` (Motion).

## Sound on the cut

A sound is a pin no layer draws, the layouts page in the studio owns the object and `--sound`;
 which slot a moment takes, the timing against the frame, levels and density are the `sound` skill's. Sound is the third hook (`@kienobimedia`, 2026: "Everyone obsesses over the words and the visuals, but sound is the third hook most creators skip"), which became the 80%-of-arrivals gate.

A screen demo is where sound goes missing: 12 unbroken demo minutes carried no click or keystroke (also all four naked minutes), though the kit has both. The standard cut places three a minute; a long talk, 2.3, in 2 bursts. Placing: sounds go in the same `edits` pass as the splits and clips (a separate pass is written last, so not at all): `pnpm descript pin <project> <comp> --media "Whip Low Whoosh" --at "<phrase>" --sound --gain 0.4`, `balance` before to find the silence and after to prove it; the pin pass writes `pin --sound` beside every graphic arrival. Three finished edits put a sound on at most 27% of arrivals: sound is this channel's standing gap.

A Short's sound that `cut check` flags on a speech onset moves with `editor-os sound <project> <second> --to <second>` (to a pause between words) or goes with `--remove`; the second is output time, within 0.25s of the sound's start, and the change survives later `keep` and `tighten`.

## Review in Editor OS

The project page is the review board: its rail lists the passes and choices left; a pass is done when nothing in it is open (no Finish button), and a review click places nothing.

`editor-os transcript <project>` pulls the cut, words and chapters into `edit.json` (rerun after a cut changes). `editor-os plan <project>` reads `beats.json`, `pins.json` and the music offer into `edit.json`, keeping earlier decisions by beat. `beats.json` is optional input: `layouts`, `motion`, `broll`, `sfx` rows `[code, "m:ss", "spoken line"]` (layout rows add pack names); files go under `motion/`, `broll/<worker>/`, `sfx/`, each named with its beat code first (`M1 [01-16] Tools.mp4`); the page finds new files on refresh, and a beat with no file shows what's missing.

The page reads the transcript in paragraphs with removals marked, and a note on a line asks for a fix. Each beat is a card (layouts and zooms, then overlays in playing order: keep the AI's pick or another; an unrendered beat can't be kept), and music offers 3 tracks. Decisions live in `edit.json`, notes in `edit.notes.json`, beside `RUN.json`. The feedback loop (`wait`, `reply`, `note`) is the `editor-os` skill's; a note reopens its beat until accepted. `editor-os place <project>` refuses until he has decided every beat and the music, then applies kept layouts, pins kept media and sounds, lays the bed.
