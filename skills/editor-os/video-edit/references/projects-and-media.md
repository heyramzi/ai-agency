# Projects and media: organise, name, tracks

Open this for pass 0 (organise), pass 8 (handoff), before an import, and before touching Studio Sound. `pnpm descript --help` lists the verbs; this holds what it can't say. Credentials and the write model: [descript-cli.md](descript-cli.md).

## Verbs with a trap

- Every editor move the app's history holds has a verb (84 action types, 2026-09-08), except cloud tasks (Correct, Regenerate, Overdub, filler detection, room tone, Underlord). Separate sequences become one with `sequence join <first> --append <b>,<c>`, which matches tracks by name, and an empty composition plays it with `comp fill`. `get_project` is `comps` plus `assets`; `export_transcript` is the export's own subtitle track (`ffmpeg -map 0:s:0`).
- `comp:` and `media:` say which panel. One name is often a composition and a mediaRef (Descript names a sequence after its composition); unprefixed, the pair is refused, not guessed.
- Every write replays the whole commit graph, so 26 single renames is 26 replays: reorganise with one `batch` (key is `item`; a wrong key dies on op 1 as `undefined`).
- `rm` refuses a live publish; `assets prune <project> --kind audio` is read only; `realign <project> <comp>` repairs "sortTiebreaker already used"; `doctor --fix` repairs `Composition in media file folder!` blanking the Project panel (a media-panel item typed other than `media_reference`), and `missing assetjson` on a sequence is normal; `card merge <pack> Camera <id>` deletes a card (its span joins the one before); `share <email> <id>,<id>` gives an editor Can edit with no drive seat; `room new "<title>" --start <ISO+offset> --end <ISO+offset>` schedules a Rooms recording and prints the join link (each run makes a new Room, and a calendar event isn't synced to it).
- `comments <p> --todo` lists his open notes, including one where his reply sits under yours; `comment reply <p> <id> "..." --done` says it's placed and prefixes 🤖, so every agent reply uses it. Never `comment resolve`: he ticks after checking. Briefs for his comments come from, never hand-written or Orca panes, one native Sonnet subagent per brief. The loop runs until `comments` lists none.
- `track shift "CAM GS" --to CAM` puts the keyed twin on CAM's clock (the gate demands it); `track add <p> <seq> CAM --segments pieces.json` (`[{at, offset, seconds, media?}]`) lets one track span the takes of a joined sequence; `sequence new <p> "SEQ <code> · <Title>" --media <mic> --frame <screen>` gives a take with no sequence one; `gaps <p> <comp>` lists pauses longest first (`gaps close --over 1`); `cue` writes the keyframe behind Smart Zoom; `card copy`, `layer copy`, `layer paste` copy framing between cards.

## Pass 0: organise

**The pack's camera cards bind to a track named `CAM`**, so a sequence still wearing recorder names refuses every `layout pace` and `layout apply` ("has no CAM track for that layer", 8 Sep 2026). That's why organise is a pass: it reads ASSETS and ALIGNMENT too. One camera was uploaded and never joined, its transcript carried right words over wrong times, and `tracks` printed clean through both.

**A project is one sequence with 4 layers.** However many takes, `sequence join` them in order, then `comp fill`. Takes all carry `CAM`, `CAM GS`, `MIC` and `SCREEN`. Sync each camera from the audio, head and tail, never by eye (2 cameras dropped at 0 by hand sat 1.04 s and 6.5 s off). Only both ends tell a steady offset from a walking clock: one take read 29.24 s at the head and 29.23 s at 2269 s. An intro recorded in the web recorder has no separate mic, so that file is `MIC` and `CAM`/`CAM GS` play an untranscribed copy of its mediaRef; the same transcribed file on a muted track makes the app drop its words, and a picture track cut from it is refused unless its taus carry `ignoreAlignment` (`track add` sets it). A series too heavy for one project is one project per part, named as [Naming](#naming) says.

Tracks. A sequence's tracks are `sequenceScenes` (reached from the sequence mediaRef through `audio.trackSceneIds`), so `tree` and `comps` never show them. Names are `CAM`, `CAM GS`, `MIC`, `SCREEN`, in timeline order. `CAM GS` is the keyed (green-removed) twin, drawn as the body over text by 8 of the pack's cards.

`descript tracks <project>` ends on `tracks clean` or a fault per line; **pass 0 is done when it reads clean and `pnpm descript lint <project>` prints no naming warning**, and `run.py` takes both outputs as evidence. 3 gates:

- One live track and the rest muted: the mic if there is one, otherwise the camera. 2 unmuted captures of one room is comb filtering, invisible in a waveform and listed by `tracks`. A muted track keeps gain 1, so reading gain finds every track live.
- Only the live track in the script. `includeTranscript` is "Include in script"; a camera left in puts a second, worse transcript under every word. `track script <track> --off` on every non-mic track.
- `CAM GS` on CAM's clock within half a frame and the same media offset (`at` is read off the silent lead-in tau), or every Text card draws a body a frame off its face. Missing: `track add <seq> "CAM GS" --media <camera file>` with CAM's offsets (the key is the layer's `backgroundRemoval`, which `comp fill` stamps hidden).

| The app shows | The document holds |
| --- | --- |
| Track label | `sequenceScenes[].name` |
| Speaker icon | `sequenceScenes[].isMuted` |
| Studio Sound toggle / percent | `mediaRefs[].audio.speechEnhanceEnabled` / `studioSoundIntensity` (0 to 1) |

Studio Sound belongs to the media: on for one track means on in every track and composition using that recording (`studio <project> <track|media> --on --intensity 0.5` resolves a track to its media). A track name and its media name are separate fields: rename both, same word.

Which track transcribes: only the microphone. The same words on lav, camera mic and screen audio make 3 transcripts (cost, and a worse one beside the good one). `language` has no off setting (omitting it means auto-detect). The "script editing support is limited for languages" banner is the cloud reading another script (Cyrillic, kana, ă) in an English take: `align '*' --foreign` drops those words. Transcription has no CLI route, so for a bad alignment import the same audio again and move the new alignment across with `descript align` (a 16 kHz mono PCM copy aligns identically). With an external mic, upload camera and screen with audio stripped (`ffmpeg -i in -c:v copy -an out`, no `language`); with none, the camera is the audio, keep it. Check `tree` for an audio item matching the take's duration; align first ([dji-sync.md](dji-sync.md)). Strip after, and keep the original on disk.

Read the clock once with `layout cards <project> <comp>` at the top of pass 3, and take every `[mm-ss]` from it. A timecode from the raw take is meaningless because the line may be cut.

## Layouts

Run `layout sync` before choosing a card, every time: he edits the packs, `layout seed` reports `alreadyHeld` and keeps the stale copy, and the manifest says what a card is FOR. A layout is a stamp with no link back to the pack, and a ladder splits on commas, so a card whose NAME holds one goes in by id. A camera layout needs a SEQUENCE, declared as its own `add_media` entry `tracks: [{media: "<key>"}]`. Read layers back after any screen stamp and take one off with `layer rm`: a `sceneId` naming a scene nothing draws locks the project out of its editor. A CLI-stamped composition publishes (8 Sep 2026: 48 cards and 21 pins, 4K in 14 minutes); pull a finished job with `descript job <id> --download`, never re-render.
The pack list, the zoom ladder and the `--with` placeholder rule are on the layouts page in the studio.

The screen's size is set per video, never taken from the pack. The presenter frames one card of each layout (PiP, big head) in the app and copies it (Cmd+C); `layer paste <p> <comp>` puts that framing on every card of the layout, once per layout. Read the sizes back (25 Sep 2026: PiP 0.90x0.53, big head 0.72x0.39 at x 0.39).

Pass 4, the music, is the `music` skill's, and the `music-scout` agent runs it.

Handoff, pass 8, background first, after every layout and pin is placed: `descript background <p> <comp>` deletes every `Grid Dark` pin (by name or by file) and lays one fresh copy from 0:00 to the end, bottom of every card's stack, looped, in one commit. Camera cards need nothing: the full-frame camera sits above it. `--dry` prints `removed`, `cards` and `fill: loop`; `descript lint <p>` then reads blocking 0. By hand (measured; it doesn't loop, so the 24 s file freezes on its last frame): `pin rm <p> <comp> --media "Grid Dark"`, `layer rm <p> <comp> all "Grid Dark"` for strays, `pin <p> <comp> --media "Grid Dark.mov" --at 0:00 --cards <card count> --keep-cameras`, `layer set <p> <comp> all "Grid Dark" --to -1`, `lint`.

Then `descript settings` reads every audio and look setting against its standard ([checks.md](checks.md)). Pulling a render to disk is only on his ask, after his pass: `export local` is the better master, `publish` when the browser must stay free ([rendering.md](rendering.md)).

## Naming

Open before an import: the manifest key is the name and the folder both. `import` maps display path to a **bare local path string**; the MCP's `{content_type, file_size}` object dies on `path.split is not a function`.

```json
{ "CAM.MOV": "/path/to/take.MOV", "B-roll/1 [02-11] Printer Rage.mp4": "/path/to/clip.mp4" }
```

A name splits its parts with ` · ` (space, middle dot, space). Never ` - ` between parts, never `:` anywhere in a name.

### Projects, compositions, sequences

- A long-form project is `<code> · <Working Title>`, like `T14 · Claude Code Runs the Board`. The working title is 2 to 6 words in Title Case, the name the team says out loud. It isn't the YouTube title, which changes on every A/B test and lives in the publish step. Take it from the `SEQ <code> · <title>` already in the project, then the local folder slug, then a shortening of the YouTube title.
- The composition takes exactly the project name, and the sequence is `SEQ ` plus the project name. A one-composition project takes its composition's name, so a project renamed apart from its composition reverts minutes later.
- A series too heavy for one project splits into parts, `T25 · Claude Code for Beginners · Part 1 · Setup`. A range is `T41-T46 · ClickUp Mini Course`.
- A Short's code starts with `#`, because Shorts and long-form share the code letters and collide. The batch project is `BATCH <n> - MM-YY`, the suffix the month of the **recording**, never publishing (a batch crosses a month). A Short's composition in it is `<status emoji> #<code> · <Working Title>`, like `🟠 #A24 · ClickUp from Claude Code`.
- A copy never says `(Copy)`, `(backup)` or `(first take)`. The live one keeps the clean name; any other becomes `<code> · <Working Title> · backup YYYY-MM-DD` (its created date) and moves to the archive area. Nothing's deleted.
- An editor trial is `Trial · <handle> · <code or working title>`. Never an email address in a name: `sam.edits@example.com` becomes `sam.edits`.
- Other areas use the same separator: `<Client> · <Topic>`, `<Subject> · <Kind>` (`Seam · Ads`, `Testimonial · Dylan Camara`), a course `<Course> · <Version> · <Language>`.
- `Untitled Project`, or anything you can't name with confidence: leave the name and list it in the report.

Name it at creation, a long-form straight into its area's `In Production` (`pnpm descript project new "<name>" --folder "<area>/In Production"`): a rename leaves quoting docs stale, and re-importing duplicates media still wired into compositions.

### Inside a project: the Files panel

One skeleton for every project:

```
Sequences/        SEQ <code> · <Working Title>   (Descript's own folder)
CAM               the raw takes, at the root, nothing else there
MIC
SCREEN
Music/            the bed only, one file
SFX/              sound effects (whooshes, readouts)
Motion/           built here: clips, CTAs, brand backgrounds, figures, stills we made
B-roll/           footage and stills from someone else, always muted
Not in the cut/   anything placed nowhere: alt takes, unplaced clips, salvage
_descript/        what Descript drops by itself: fonts, AI voice, pasted images, recordings
```

- A raw take is `CAM`, `MIC` or `SCREEN` with no `RAW`, no `00` and no title. It takes a number only when there are several: `CAM 1`, `CAM 2`. The keyed twin is `CAM GS` (`CAM GS 1`, `CAM GS 2`). An iPad or phone screen recording is a `SCREEN` too.
- Descript's built-in `Stock Media` folder empties by kind (music to `Music`, sound to `SFX`, footage to `B-roll`), then `rmdir` it if the CLI allows.
- Old buckets fold in by kind: `_assets`, `_audio`, `_fonts` and `BG` go to `SFX`, `Motion` (grid backgrounds, CTAs, logos) or `_descript` (fonts, UUID-named AI audio and images).
- A single-video project has no slug folder: a `c52-clickup-pricing/` wrapper unwraps to the root skeleton.
- A Shorts batch has one folder per Short, `#<code> · <Working Title>`, holding that Short's `CAM`, `MIC`, `SCREEN` and its own `Motion/` and `B-roll/`. What the whole batch shares goes in the root skeleton.

Music, Motion and B-roll stay apart for licensing. `Motion` is ours: flat opaque `.mp4`, full frame or 960x1080, and alpha QuickTime Animation `qtrle` `.mov` (HEVC-alpha keys as a black rectangle here). `B-roll` is someone else's, and a borrowed shot can't ship in a paid lesson, client deliverable or ad; mixed in, an unshippable frame sits one drag from a paid build. `broll` keeps the rights ledger.

```
CAM.MOV
MIC.WAV
Music/   Bed · Understated Drive.mp3
Motion/  1 [00-28] Notes App.mp4
B-roll/  1 [02-11] Printer Rage.mp4
Not in the cut/  ALT 4K [salvage 1-05, 1-13, 3-41].MOV
```

**Clips are `N [MM-SS] Description.ext`:**
- One number series per folder. 1 digit up to 9, 2 digits from 10 (a long video otherwise sorts `1, 10, 11, 12, 2`); pick the width once. No letter prefix: `B1` is wrong.
- A letter suffix means alternatives for one beat (`2a`, `2b`); a single option has none.
- `-` not `:` (Finder shows `:` as `/`): `[04-19]` is 4:19. Zero-pad so `[00-09]` sorts first.
- No take yet: drop the bracket and don't guess one. With a composition, the real clock is `layout cards` or an SRT export.
- `[unplaced]` isn't a tag. A clip placed nowhere goes to `Not in the cut/` with no bracket.

### The drive

A top-level area is `NN Name`: 2 digits, a space, a plain name. No emoji, no brand prefix, no ` - ` after the number. A YouTube area holds exactly 2 folders, `In Production` and `Published`, filed by status and never by topic, because the code letter already says the topic and sorting by name groups the letters. A project moves once, from `In Production` to `Published`, the day the video goes live. Other areas keep plain-named subfolders, numbered only for a course module order. No project ever sits at the drive root.

`pnpm descript folders --lint` checks every area and project name against these rules; run it after a drive move.

### iPhone footage

`afcclient ls /DCIM/<NNNAPPLE>`, then `afcclient info <path>` (`st_size`, `st_mtime`, `st_birthtime` in ns; `birthtime -> mtime` is the recording span, which matches "the 46 minute one" without pulling). Always pass a subcommand: bare `afcclient` opens a shell that hangs the call. mtime alone misleads (a clip deleted in Photos sits in `/DCIM` until purged): confirm by duration. Frames that won't transfer are iCloud optimisation: Settings > Photos > Download and Keep Originals. Upload `import_media` URLs are presigned for 3 hours: `curl -T <file>`, never `--data-binary` (buffers the file in RAM, dies "out of memory" on multi-GB). The job is atomic: it sits at `waiting_for_uploads`, every file a placeholder with an audio icon until the last byte lands; re-uploading only makes a `-1` duplicate. A name already in the project makes `import_media` refuse: prefix a folder path (`"iPhone 19 Aug/IMG_7646.MOV"`).

- A `[mm-ss]` in a media name goes stale on every re-cut. To find where a clip plays, map `pinScenes[].id` through `compositions[].timeline.cards.components[].layers[].sourceSceneId` to its card and read `layout cards`. A clip whose sentence was cut loses its bracket and goes to `Not in the cut/` (one beat 11 was named `[19-50]` and played at 1:06).
- An iPhone take can report 3840x2160 with `side_data=rotation` -90, meaning portrait: read rotation, never raw width and height, before setting composition size. Different resolutions per angle don't mean different cameras.

## Done when

`tracks` and `settings` read clean; `pnpm descript lint <project>` prints no naming warning; every `[mm-ss]` came from `layout cards`; `tree` shows each file under its intended name; any composition touched was checked against `publishes`; any composition created carries the orientation the take was shot in.
