# Projects and media: organise, name, tracks, the bed

Open this for pass 0 (organise), pass 4 (music), pass 8 (handoff), before an import, and before touching Studio Sound. `pnpm descript --help` lists the verbs; this holds what it can't say. Credentials and the write model: [descript-cli.md](descript-cli.md).

## Verbs with a trap

- Every editor move the app's history holds has a verb (84 action types, 2026-09-08), except cloud tasks (Correct, Regenerate, Overdub, filler detection, room tone, Underlord). Separate sequences become one with `sequence join`, an empty composition plays it with `comp fill`. `get_project` is `comps` plus `assets`; `export_transcript` is the export's own subtitle track (`ffmpeg -map 0:s:0`).
- `comp:` and `media:` say which panel. One name is often a composition and a mediaRef (Descript names a sequence after its composition); unprefixed, the pair is refused, not guessed.
- Every write replays the whole commit graph, so 26 single renames is 26 replays: reorganise with one `batch` (key is `item`; a wrong key dies on op 1 as `undefined`).
- `rm` refuses a live publish; `assets prune <project> --kind audio` is read only; `realign <project> <comp>` repairs "sortTiebreaker already used"; `card merge <pack> Camera <id>` deletes a card (its span joins the one before); `share <email> <id>,<id>` gives an editor Can edit with no drive seat; `room new "<title>" --start <ISO+offset> --end <ISO+offset>` schedules a Rooms recording and prints the join link (each run makes a new Room, and a calendar event isn't synced to it).
- `comments <p> --todo` lists his open notes; `comment reply <p> <id> "..." --done` says it's placed. Never `comment resolve`: he ticks after checking.
- `track shift "CAM GS" --to CAM` puts the keyed twin on CAM's clock (the gate demands it); `track add <p> <seq> CAM --segments pieces.json` (`[{at, offset, seconds, media?}]`) lets one track span the takes of a joined sequence; `sequence new <p> "SEQ <code> · <Title>" --media <mic> --frame <screen>` gives a take with no sequence one; `gaps <p> <comp>` lists pauses longest first (`gaps close --over 1`); `cue` writes the keyframe behind Smart Zoom; `card copy`, `layer copy`, `layer paste` copy framing between cards.
- `stock music search` prints only id, title and length (no mood or genre), so the query filters. `stock music pull <p> <id-or-title> [--as "Music/<name>"]` files a WAV under `Music/<title>` (a title 2 tracks share is refused: pass the id), puts nothing on a card (`music set --use "<title>"` does), and is a no-op on a track the project holds. It fetches 25 MB server side: allow 30 s. `--dry` prints the name.

## Pass 0: organise

**The pack's camera cards bind to a track named `CAM`**, so a sequence still wearing recorder names refuses every `layout pace` and `layout apply` ("has no CAM track for that layer", 8 Sep 2026). That's why organise is a pass: it reads ASSETS and ALIGNMENT too. One camera was uploaded and never joined, its transcript carried right words over wrong times, and `tracks` printed clean through both.

**A project is one sequence with 4 layers.** However many takes, `sequence join` them in order, then `comp fill`. Takes all carry `CAM`, `CAM GS`, `MIC` and `SCREEN`. Sync each camera from the audio, head and tail, never by eye (2 cameras dropped at 0 by hand sat 1.04 s and 6.5 s off). An intro recorded in the web recorder has no separate mic, so that file is `MIC` and `CAM`/`CAM GS` play an untranscribed copy of its mediaRef; the same transcribed file on a muted track makes the app drop its words. A series too heavy for one project is one project per part: `<Title> - Part N · <Topic>` (project and composition), `SEQ <same>`, raw `RAW CAM|MIC|SCREEN <Take>`.

Tracks. A sequence's tracks are `sequenceScenes` (reached from the sequence mediaRef through `audio.trackSceneIds`), so `tree` and `comps` never show them. Names are `CAM`, `CAM GS`, `MIC`, `SCREEN`, in timeline order. `CAM GS` is the keyed (green-removed) twin, drawn as the body over text by 8 of the pack's cards.

`descript tracks <project>` ends on `tracks clean` or a fault per line; **pass 0 is done when it reads clean** and `run.py` takes that output as evidence. 3 gates:

- One live track and the rest muted: the mic if there is one, otherwise the camera. 2 unmuted captures of one room is comb filtering, invisible in a waveform and listed by `tracks`. A muted track keeps gain 1, so reading gain finds every track live.
- Only the live track in the script. `includeTranscript` is "Include in script"; a camera left in puts a second, worse transcript under every word. `track script <track> --off` on every non-mic track.
- `CAM GS` on CAM's clock within half a frame and the same media offset (`at` is read off the silent lead-in tau), or every Text card draws a body a frame off its face. Missing: `track add <seq> "CAM GS" --media <camera file>` with CAM's offsets (the key is the layer's `backgroundRemoval`, which `comp fill` stamps hidden).

| The app shows | The document holds |
| --- | --- |
| Track label | `sequenceScenes[].name` |
| Speaker icon | `sequenceScenes[].isMuted` |
| Studio Sound toggle / percent | `mediaRefs[].audio.speechEnhanceEnabled` / `studioSoundIntensity` (0 to 1) |

Studio Sound belongs to the media: on for one track means on in every track and composition using that recording (`studio <project> <track|media> --on --intensity 0.5` resolves a track to its media). A track name and its media name are separate fields: rename both, same word.

Which track transcribes: only the microphone. The same words on lav, camera mic and screen audio make 3 transcripts (cost, and a worse one beside the good one). `language` has no off setting (omitting it means auto-detect). With an external mic, upload camera and screen with audio stripped (`ffmpeg -i in -c:v copy -an out`, no `language`); with none, the camera is the audio, keep it. Check `tree` for an audio item matching the take's duration; align first ([dji-sync.md](dji-sync.md)). Strip after, and keep the original on disk.

Read the clock once with `layout cards <project> <comp>` at the top of pass 3, and take every `[mm-ss]` from it. A timecode from the raw take is meaningless because the line may be cut.

## Layouts and the bed (pass 4)

Run `layout sync` before choosing a card, every time: he edits the packs, `layout seed` reports `alreadyHeld` and keeps the stale copy, and the manifest says what a card is FOR. A layout is a stamp with no link back to the pack, and a ladder splits on commas, so a card whose NAME holds one goes in by id. A camera layout needs a SEQUENCE, declared as its own `add_media` entry `tracks: [{media: "<key>"}]`. Read layers back after any screen stamp and take one off with `layer rm`: a `sceneId` naming a scene nothing draws locks the project out of its editor. A CLI-stamped composition publishes (8 Sep 2026: 48 cards and 21 pins, 4K in 14 minutes); pull a finished job with `descript job <id> --download`, never re-render.
The pack list, the zoom ladder and the `--with` placeholder rule are on the layouts page in the studio.

The screen's size is set per video, never taken from the pack. The presenter frames one card of each layout (PiP, big head) in the app and copies it (Cmd+C); `layer paste <p> <comp>` puts that framing on every card of the layout, once per layout. Read the sizes back (25 Sep 2026: PiP 0.90x0.53, big head 0.72x0.39 at x 0.39).

One bed per channel, and pass 4 never lays it. The brand's music style answers it; a track a sibling project already uses wins a tie. `music set` writes **0.211, ducking on, `fillBehavior: loop`** (a 121 s bed under a 22-minute cut goes silent at 2:01 otherwise, 8 Sep 2026), the scene's own gain stays 1. A guard checking only `media &&` counts an empty `Placeholder` pin or a bare PNG as a bed; never clear one with `music rm` (it lifts the card's own pin).

Pass 4 offers 3 options and moves on. `editor-os music` prints their answer to "what should your videos sound like?" and its search terms. Style `none` means no card: mark done with that as evidence. No answer yet: don't ask, offer one track from each of 3 fitting styles, and save no style they didn't say.

1. `stock music search "<term>" --json --full` per term, best first (`--full` keeps the `preview` link).
2. Pick 3: at least 20 s (the loop covers the rest), a mood read from its title (no vocal, no jingle), each different from the others.
3. `stock music pull` each into `Music/`, then `editor-os music offer <project> '[{"id","title","seconds","mood","preview"}]'` (mood in 1 or 2 words). Mark pass 4 done with the 3 titles, go to pass 5.
4. Skip `music set`: `place` lays the one he keeps and nothing on a skip, and refuses until he decides. On `music.more` from `editor-os wait`, search the next terms and offer a new set (`asked` counts).

Handoff, pass 8: `descript settings` reads every audio and look setting against its standard ([checks.md](checks.md)). Pulling a render to disk is only on his ask, after his pass: `export local` is the better master, `publish` when the browser must stay free ([descript-cli.md](descript-cli.md)).

## Naming

Open before an import: the manifest key is the name and the folder both. `import` maps display path to a **bare local path string**; the MCP's `{content_type, file_size}` object dies on `path.split is not a function`.

```json
{ "clickup-terminology/RAW CAM ClickUp Terminology.MOV": "/path/to/take.MOV" }
```

**`N [MM-SS] Description.ext`:**
- 1 digit up to 9, 2 digits from 10 (a long video otherwise sorts `1, 10, 11, 12, 2`); pick the width once.
- A letter suffix means alternatives for one beat (`2a`, `2b`); a single option has none.
- `-` not `:` (Finder shows `:` as `/`): `[04-19]` is 4:19. Zero-pad so `[00-09]` sorts first.
- No take yet: drop the bracket and don't guess one. With a composition, the real clock is `layout cards` or an SRT export.
- A raw take is `RAW <CAM|MIC|SCREEN|IPAD> <Take>` with no number or timecode. A salvage take carries `ALT 4K [salvage 1-05, 1-13, 3-41].MOV`.

3 clip folders, apart for licensing: `Music` (the bed only, one file, no beat number), `Motion` (built here: flat opaque `.mp4`, full frame or 960x1080, and alpha QuickTime Animation `qtrle` `.mov`; HEVC-alpha keys as a black rectangle here), `B-roll` (real footage, usually someone else's, always muted). A borrowed shot can't ship in a paid lesson, client deliverable or ad; mixed in, an unshippable frame sits one drag from a paid build. `broll` keeps the rights ledger. `Music` sorts first, the order the passes run.

One folder per video holds its raw take and its 3 folders, a second video gets its own folder (never `Raw/` plus `B-roll <Video>/`); a single-video project keeps the three at root:

```
second-brain/
  RAW CAM Second Brain.MOV
  Music/  Bed · Understated Drive.mp3
  Motion/ 1 [00-28] Notes App.mp4
  B-roll/ 1 [02-11] Printer Rage.mp4
```

A session folder is slug-cased with raw files `RAW CAM|IPAD|MIC <Title>.<ext>`; sequences are `SEQ <code> · <Title>`. A shorts batch is `BATCH <week> - MM-YY` in `60-Shorts`, the suffix the month of the **recording**, never publishing (a batch crosses a month). The number comes from the Apple Notes queue (`Projects › Shorts › Batch N`), is never re-derived or renumbered, and only the suffix is computed. Name it at creation (`pnpm descript project new "BATCH 5 - 09-26" --folder 60-Shorts`): a rename leaves quoting docs stale, and re-importing duplicates media still wired into compositions.

iPhone footage. `afcclient ls /DCIM/<NNNAPPLE>`, then `afcclient info <path>` (`st_size`, `st_mtime`, `st_birthtime` in ns; `birthtime -> mtime` is the recording span, which matches "the 46 minute one" without pulling). Always pass a subcommand: bare `afcclient` opens a shell that hangs the call. mtime alone misleads (a clip deleted in Photos sits in `/DCIM` until purged): confirm by duration. Frames that won't transfer are iCloud optimisation: Settings > Photos > Download and Keep Originals. Upload `import_media` URLs are presigned for 3 hours: `curl -T <file>`, never `--data-binary` (buffers the file in RAM, dies "out of memory" on multi-GB). The job is atomic: it sits at `waiting_for_uploads`, every file a placeholder with an audio icon until the last byte lands; re-uploading only makes a `-1` duplicate. A name already in the project makes `import_media` refuse: prefix a folder path (`"iPhone 19 Aug/IMG_7646.MOV"`).

- A `[mm-ss]` in a media name goes stale on every re-cut. To find where a clip plays, map `pinScenes[].id` through `compositions[].timeline.cards.components[].layers[].sourceSceneId` to its card and read `layout cards`. A clip whose sentence was cut loses its bracket and goes to `Not in the cut/` (one beat 11 was named `[19-50]` and played at 1:06).
- An iPhone take can report 3840x2160 with `side_data=rotation` -90, meaning portrait: read rotation, never raw width and height, before setting composition size. Different resolutions per angle don't mean different cameras.

## Done when

`tracks` and `settings` read clean; every `[mm-ss]` came from `layout cards`; `tree` shows each file under its intended name; one bed and `music <project>` reports it ducking; any composition touched was checked against `publishes`; any composition created carries the orientation the take was shot in.
