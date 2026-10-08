# The Descript CLI: credentials, writes, clipboard, lint, library, renders

## Contents

[Credentials](#credentials), [The write path](#the-write-path),
[Importing and publishing prechecks](#importing-and-publishing-prechecks),
[The document lint](#the-document-lint),
[The clipboard is a write path](#the-clipboard-is-a-write-path),
[The drive media library](#the-drive-media-library),
[Rendering and downloading](#rendering-and-downloading)

Open this before any write bigger than a rename, when the CLI says a credential is missing, when a project won't open, before reorganising "My media", and before rendering a master.

## Credentials

`pnpm descript` needs `DESCRIPT_STYTCH_SESSION` and `DESCRIPT_API_TOKEN`, and its package script loads both through `scripts/secrets.mjs`, so never export them by hand. Run it from the folder that holds the CLI's `package.json`.
 *"DESCRIPT_STYTCH_SESSION is not set"* means you ran it from the wrong folder. The session is fine. Run the whoami first:

```sh
pnpm -s descript            # whoami: the user and the drives
```

`STYTCH_SESSION` does everything inside a project. `API_TOKEN` is only for `project new` and `import`, the 2 things the app's API refuses (`Classic project creation no longer supported`, except `kind: rooms_recording`, which `room new` uses). `auth capture` refreshes an expired cookie from a `web.descript.com` tab in Orca (`--page` when several are open). Anyone else runs `pnpm descript connect`: it opens the walkthrough page, takes both values on the prompt and verifies them with a real call. Take no value as a flag, because a flag lands in shell history and the process list. The page names the 3 things only a person can do (sign in, copy the session, make a token) and shows a screenshot of the finished shelf: "nobody will do that by hand... explain them with actual screenshots." It ships with the product, so it isn't a playground page. The course deck on connecting Descript carries the same split, so edit both.

## The write path

The app writes `/v2/projects/{id}/collab/commits`: every edit is one commit with a jsondiffpatch delta. Media names are at `mediaLibrary.mediaRefs[].displayName`, folders at `rootMediaFileFolder` and `rootCompositionFolder`, tabs at `compositions[]`.

- A storyboard project (a layout pack, anything with `is_storyboard_enabled`) stores one JSON document per revision. The project record says which surface it keeps, never an empty `collab/commits`: a pack can hold a commit chain the app never reads (`Brand Layouts` carried 102 of them, 9 Sep 2026). `tree` prints `document: revision N` or `document: N commits`. Read it through `GET /v2/projects/{id}/asset_url?url=<unsigned content_url>` (signed 3 hours; the raw `content_url` answers S3 AccessDenied). Write it as a presigned PUT, then `POST /v2/projects/{id}/revisions?content_format_version=2`. `base_revision_id` is enforced with a 409, so an open browser tab beats you. Publishing a pack is its own route, `POST /v2/projects/{id}/templates/publish`; without it every rename stays invisible to other projects.
- The live-editor guard counts the CLI's own last commit for 5 minutes and refuses a second verb, quoting the first. Anything that moves the tip (a transcription landing, `verify` opening the tab) re-arms it. Pass `--anyway` once the app is known shut.
- Route discovery and undo stay out of a project that matters. `is_live_collab_enabled` is false, so 2 sessions race and the last save wins. Duplicate the project, check the collaborator avatars, make the smallest edit, delete exactly what you typed. `File > Version history` keeps every autosave.
- A new composition is an audio one. The `new` template has 2 taus and 1 card boundary, plus `temp:vo-meta-track`, no `videoMetadata` and `isVideo` false: it renders audio-only and the layout picker offers nothing. Follow with `resize <comp> 2160x3840` and `comp type <comp> video` (A19, 18 Sep 2026). `dup` regenerates every owned id and keeps every `mediaRefId`. Composition folders: `mkdir --comps`, `mv`, `rmdir --comps`.
- A tidy-up is one batch: `pnpm descript batch <project> ops.json` takes `rename`, `mv`, `mkdir`, `rmdir`, `newcomp`, `dup`, `rm` ops, resolves each against the document the earlier ones left, writes one commit (`--dry` prints the plan). Most of the mess is Descript's own output (fonts, AI voice, pasted images, recordings, Stock pulls land at root with machine names: 70 of 109 items on one project). Hand over 4 buckets, `_fonts`, `_ai-audio`, `_stills`, `_recordings`, say that sorting by Type makes each one run contiguous, and say it recurs.

## Importing and publishing prechecks

`pnpm descript import <project> <manifest.json>` runs the job, the uploads and the poll. `file_size` must match exactly; signed URLs last 3 hours.

- The MCP takes 3 media per call (`Query count exceeded limit of 100` above); direct `POST /jobs/import/project_media` took nine. The CLI batches.
- One import job per project at a time; a second is rejected, not queued. Direct upload beats URL import, which rejects anything answering HTML.
- Timeline export (EDL, AAF, FCPXML, Resolve XML), `list_folders`, `get_drive_info`, `import_drive_media` are MCP-only.
- A failed import leaves an asset with `artifacts: []`, enough of them make `publish` refuse: find with `GET .../media_assets?include_artifacts=true`, remove with `DELETE .../{guid}`.
- `have not finished uploading` means an unregistered asset. A clip adopted into the cut but never shared into the project fails the `media_assets` lookup (EA20: 3 clips and 6 refused renders). Diagnose as a set difference against a project that renders, never off failed artifacts (EC51 renders with 172). Repair: `descript adopt <media> --from <project that holds it>` answers `assetShared: true`. A local export hides the fault and can refuse the same clip.
- An agent doing it anyway (`prompt_project_agent`) does something adjacent and reports success (1 Aug 2026: it renamed tracks in a live composition). End every mutating prompt with "If you really cannot do X, do not do anything else as a substitute. State plainly which tool or capability is missing", and verify with `get_project`, never `agent_response`. It burns AI credits, and **a top-up is the user's call**. A composition with an entry in `publishes` is a live URL: renaming it changes what viewers see.

## The document lint

One dangling id makes Descript refuse the whole document ("Oh no! Something's not working", no route back in). On 2026-08-31, EC49 had 3 faults that locked the owner
 out of a finished 23:57 edit: 2 `sceneId`s pointing at pin tracks a restore had moved past, and one `roomtoneRefId` without its companion.

**3 invariants, and any one refuses the document:** every `*Id` resolves; every pin a card layer draws is **registered** in `timeline.pins.components` (listing it in `pinScenes` isn't enough, and "pinTrack" in the error means the registration); the cards and pins tracks are in **script order** (sorted in and never appended).

A count validates nothing. Cards 122, markers 48, pin scenes 71, words 6981 all matched the good state and the document still wouldn't load. A linter checking only invariant 1 passed a document refused for 46 unregistered pins.

`inspectDocument()` (`CLIs/descript/gate.ts`) runs inside `commit()` (`history.ts`) and throws before the push; `pnpm descript lint <project>` runs the same checks without writing (47 faults on the EC49 document, 0 on the repair). `DocumentInvalidError` names the JSON path of each dangling reference: ask for the browser console before reaching for a snapshot. Lint also warns on **media at the Files panel root** and **library media the folder tree never files** (The author, 9 Sep 2026: "files at root, which is a bug that the cli should lint"). It only warns, because nothing breaks.

1. **`Components are in incorrect order` is ORDER, not duplicate slots.** A "Copy of" composition has 16 cards at `sortTiebreaker: 0`. In app-authored documents, array order agrees with tiebreaker order and script order.
2. A pin's `sortTiebreaker` derives from a card index (`index + 0.5`). Cutting a card invalidates every later pin, so `realign()` renumbers cards and re-derives pins at the end of every write touching either track.
3. A text layer names its font. `applyLayout` once left `textProperties.fontMediaRefId` pointing at the pack's id and the editor died on load; `rehomeFonts()` matches on `assetKey` and imports nothing.
4. When `DocumentInvalidError` names a path, add that path's last segment to `REFERENCE_FIELDS` before anything else (`fontMediaRefId` was missing, so the gate passed a crashing document).
5. **Test a candidate invariant against an app-authored document before blocking on it.** "Duplicate tiebreakers are the fault" and "a pin sits inside its card's gap" were each falsified in one command (a healthy document breaks the second 105 of 105).

Reading a document back verifies nothing. The API returned 8 placed clips twice and the editor discarded them on open. Prove it draws: `pnpm descript verify <project> --expect "the words the edit put on screen"`.

`merge()` on a re-seed: a new `Template` field needs its own line in the keep branch (a re-seed reported "renamed: 0, library: 100"), and `named()` once took a generated `Text/c5d195ba` for a real name. `layout seed` passes the `cardId -> Group/Name` map from `layouts(pack)` into `seedPack`.

**Files stages hand each other** are validated against one schema on write and read, so the same plan replays the same edit. A bad file stops the reader, naming file, field and expectation (`pins.json: [3].media must be a string`).

| File | Written by | Schema |
|---|---|---|
| `RUN.json` | `run.py` (the studio sets only `route`) | `run.schema.json` |
| `passes.json` | by hand, the pass order | `passes.schema.json` |
| `pins.json` | `sequence.py plan`, then an agent fills `FILL ME` | `pins.schema.json` |
| `*.phrases.json` | `sequence.py plan`, an agent (read by `resolve.py`) | `phrases.schema.json` |
| `needles.json` | an agent: the cut list as words | `needles.schema.json` |
| `briefs.json` | an agent, off `visuals.py brief` | `briefs.schema.json` |
| `cut.json`, `plan.json`, `plan.notes.json` | local cut builder, planner, `studio notes --done` | `cut/plan/plan-notes.schema.json` |

`scripts/schema.py` (Python, exits 2) and the studio's `schema.ts` (answers 400) read the same files; check one by hand with `python3 scripts/schema.py pins path/to/pins.json`. They know only `type required properties additionalProperties items prefixItems minItems maxItems enum const pattern minimum minLength anyOf`; any other keyword is refused, so add it to both validators first. Rules JSON Schema can't say live in code: one slot per `plan.json` id (`oneSlotPerId`); a `cell` pick needs `pick.props` its template takes (`scripts/templates.mjs`); `run.py done` needs `--file` (saved output) or `--run` (output kept under `proof/`, sha256 recorded).

- `batch` isn't idempotent (a `mkdir` name that's also an `mv` target dies `matches 2 items` on re-run; it rolls back safely). `track mv` and `track add` have no `--dry`: read a command's flags before running it on a project you keep.
- `pull` matches the ASSET name, and a renamed stock sound no longer carries it (`Woosh M` is `Fast Flying Whoosh 8 ...`): read `assetJson.default_display_name` from `doc` first. A project's Stock Media folder is what was auditioned, not used: count `pinScenes` per mediaRef.
- A CLI-created project hangs on "Opening project..." until it has a composition: `pnpm descript new <project> <name>` first. `rm comp:` refuses a project's only composition (make `new <project> TEMP`, remove the real one, import, remove TEMP). An import key `Sequences/<name>` creates a second `Sequences` folder beside the built-in one.

## The clipboard is a write path

Descript's rich clipboard carries the edit: the `«class HTML»` flavor holds `<span data-descript-pasteboard="<base64 JSON>">` (851 KB for 325 characters): `copiedTaus[]` (`text.string`, `audioSegment {mediaRefId, offset, duration}`), word alignment (`startTime`/`endTime`), `sequenceTracks[]`, `copiedComponents[]`, `projectId`, `sourceTrack.id`. A cut is a rewrite of `copiedTaus`: each surviving run becomes its own TAU slicing the same media, then select all and paste (1036.95s to 270.15s, predicted 278.2s). `scripts/dclip.py` reads and writes it; `recut2.py` rebuilds from **token** indices (`dscript words`), not alignment indices, which drift apart without erroring.

**Ignore, not delete.** Ignore is `isBlocked: true` on the TAU: text and `audioSegment` stay, contiguous with neighbours. Same 12 cuts: delete gave 2:22, ignore 2:46 (24 s of the speaker's pauses eaten). Ignore is reversible, keeps text byte-identical and strands no commas; delete butt-splices, needs recapitalising. `build_ignore()` splits each TAU where the flag changes, with `duration` running to the next segment's first word and a text-equality assertion. With ignores, `composition.duration` overstates the render length (279.4s vs 261.8s): sum the TAUs where `isBlocked` is false.

**What `apply` does unasked:** cuts as Ignore, keeps every existing Ignore, removes fillers and truncated fragments, repairs glued stutters and product names (`--typos`, glossary in [cutting.md](cutting.md)), carries every scene boundary and marker onto the TAU still holding its text, and refuses to write unless the payload round-trips and every style range lands inside its TAU. A second pass is safe (an empty cut list is an exact no-op). `candidates.py` finds 3 harder classes: **digression markers** (The author, 2 Sep 2026: "when I say 'you could potentially' it's often the digression, this needs to be cut"; proposed, never enumerated, `--check` exits 1 while uncovered), **`phrase_cuts()`** (announcing phrases, 24 generated members, longest match first; "make sure we cut this off every time I say this"), and **`opener_cuts()`** ("you always forget to remove 'now' and 'so'": filler only when it opens a sentence (29% of EC49's sentences). `so that` and `now that` keep it, with 0 false positives in 300). Where the transcriber was wrong and the audio is right, fix the text; where the speaker misspoke, leave it unless asked.

**Write the cut list in words.** `scripts/resolve.py` turns a phrase into a token range with 5 words of context each side, and refuses a phrase that matches nothing, matches twice without `nth`, or overlaps another (`pre`/`post` disambiguate). `grab` works on a partial selection.

**4 things that bite.**
- Plain text pasted does nothing: no `audioSegment`, so it lands as typed text. `osascript -e` dies on a real payload (`Argument list too long`): pipe to `osascript -`.
- Map words to the alignment by time, never `difflib`. With a sentence spoken 12 times, `SequenceMatcher` pairs tokens with the wrong take at identical counts, and the take you meant to cut stays in the video. Check word agreement, not count.
- Paragraph breaks live in the text, never in TAU boundaries (68 TAUs holding 55 paragraphs). Slice the separator from the source, capitalise only after a newline.
- TAUs don't tile the media (36 gaps, 186.04 s): a rebuilt payload drops them free, so runtime falls further than words (56.8% of words, 74% of runtime).

**Housekeeping:** a `uuid4` per new TAU; remap `copiedComponents[].tauAnchor.tauId` to the segment holding its character position (`reanchor()`; pointing all at `new[0]` once piled 11 boundaries at the top); markers are `markerComponent` with `text`, `--markers markers.json` `[{"phrase","text"}]` matched against surviving text; capitalise the first TAU after cutting a connector; keep the pre-edit payload to restore, and tell the user not to copy anything meanwhile.

**Formatting rides along:** `attributes` `{"name":"bold"|"highlight","value"}` with `range {location,length}` in characters inside that TAU's own string (a straddling phrase is styled once per TAU); every highlight id is registered in `highlighters` (alpha 64, 13 ids in `PALETTE`). A highlight is a cue to the editor (`CUES`):

| colour | means | executes it |
|---|---|---|
| blue | B-ROLL, full-frame clip | `motion-design` (full-frame) |
| purple | FIGURE, diagram or analogy | `motion-design` (figure, alpha layer) |
| green | ON-SCREEN TEXT | `motion-design` (caption) |
| orange | CTA overlay | `motion-design` (YouTube CTA kit) |
| coral | BRAND ASSET | Design Assets shelf |
| yellow | EMPHASIS, punch in | editor |
| red | PROBLEM, retake or fix before publish | the speaker |

`styles.example.json`: `[{"phrase","highlight","bold"}]`. Read each attribute back and slice the TAU with its range; a wrong style is silent. Run it through `scripts/dscript.py` (`grab` `words` `apply` `check` `history` `restore`): it archives every payload to `~/.descript-clip/history`, the only undo that survives the clipboard being overwritten (Raycast's history is encrypted).

The order is fixed. The clipboard replaces the script region from an older grab; `pnpm descript layout` writes server-side. Cut, markers and pins go first as pastes, every `layout` command after, or the paste silently discards every stamp. The CLI's `edits` pass avoids this: one commit, no order to get wrong.

## The drive media library

```bash
pnpm descript library                                  # the tree, with paths and ids
pnpm descript library mkdir "Backgrounds"              # --parent nests it
pnpm descript library rename "brand-grid-3840x2160.mov" "Brand Grid Dark.mov"
pnpm descript library mv "Brand Grid Dark.mov,Brand Grid Light.mov" Backgrounds
pnpm descript library rm "ZZ probe"                    # a folder takes its contents with it
pnpm descript library import sounds.json --folder "Sound Signature"
```

- `/v2/drives/{id}/assets` is the wrong place to read a name: `metadata.default_display_name` is the upload name, forever. Read `library`.
- `library import` (`POST /jobs/import/drive_media`) is the only byte upload, takes no `drive_id`, answers a bare 500 above 3 files while uploading none (the command batches in threes). `--folder` files it, else `Folder/Name.wav` creates the folder. Nothing adopts an existing asset onto the shelf: import from the local originals.
- The shelf is 8 folders: `B-roll/` (own footage by subject), `Backgrounds/`, `CTAs/` (one movie per ask), `Motion/`, `Overlays/` (alpha over the face), `Placeholders/`, `Products/` (per product or vendor), `Sounds/`. A 9th is one of these under a private name. It mirrors the layout project folder for folder.
- Only what a layout plays, read off the document: a card's sound sits on `pinScenes[].timeline.superTau.taus[0].audioSegment.mediaRefId` and never shows in `usage` (8 wavs sat unused for 2 days). Nothing derived: no sequences, fonts or per-project `Roomtone - ...`.
- Names say what the file is. `02_broll_run-park_4k.mov` is 2160x3840 (vertical): read size off `assetJson.quality.original.video` and rename at the source too.
- `Sounds/` uses the kit vocabulary: `whoosh`, `whoosh-hi`, `whoosh-mid`, `whoosh-deep`, `swish`, `zoom`, `riser`, `readout`, `shuffle`, `ui`, `chime`, `chime-soft`, `mouse` (the one voice only the pack plays). The pack carries 11 of them (everything except `zoom` and `chime`); see [layouts.md](layouts.md). The names are the sound library's JSON
, also the app's Descript kit shelf: one name from census to timeline (it held `Chime Light` and `Whip Low Whoosh` until 8 Sep 2026). `Sound Signature` became `Sounds` on 9 Sep 2026 to match the project.
- A flat panel of upload names means the client couldn't load the document, and the project isn't messy. On 9 Sep 2026 the drive media endpoint answered 503 (`suppressing local load failure`) and the panel fell back to`brand-testimonials-highlight.mp4`
 while the document said `Products/Brand/Testimonials Highlight.mp4`. Run `pnpm descript tree` before calling a project disorganised.
- Deleting an asset breaks every project that adopted it. `Extra Fast Multimedia Whoosh 3` was uploaded into `Brand Layouts` (`lookup_key` names `projectId=9765b037`) but adopted by `ClickUp Super Agents Just Got MCP`; deleting it from the pack on 8 Sep 2026 left a media reference whose `assetGuid` resolved to nothing (a spinning Files row). Repair touches no card:

```bash
pnpm descript pull <video> "Multimedia Whoosh" --out /tmp     # the artifact usually survives
pnpm descript import <video> fix.json                          # a fresh copy, under a temp name
pnpm descript media swap <video> "Extra Fast Multimedia Whoosh 3" "whoosh-fix-donor.wav"
```

  `media swap` puts the new asset under the id the cards reference, so pins keep place and gain, and it consumes the donor. A reference with no `assetJson` isn't proof of breakage (drive-library adoptions carry none, like both CTA movs there); the test is whether its `assetGuid` appears in `assets <project>`.

## Rendering and downloading

```
descript publish <project> [composition] --resolution 4K --download ~/Downloads
descript jobs                        # a second publish answers "A publish job is already running"
descript job <id> --download <path>  # pull a finished render
descript assets <project> --kind video
descript pull <project> IMG_0015 --seconds 60   # the ORIGINAL take, never a render; --seconds stream-copies
```

- `assets` shows the ORIGINAL filename (`IMG_0015.mov`) and never the Files panel name (`RAW CAM 1`); tell takes apart by duration (`get_project` seconds vs `assets --probe`). A slow first connection reads like a hang (iPhone `mdat`-first files): re-run before believing the route is broken; `error: fetch failed` off `media_assets` is the same.
- `--download` always goes to `~/Downloads`, as a folder. The author, 4 Sep 2026: "always download in downloads folder". Pass the folder (`~/Downloads`) and never a filename: the file takes the composition's name and the served extension (before 2026-09-10 FC38's master landed as an extensionless `remux`). Never into a repo (5 course videos are 2.1 GB).
- A publish replaces the composition's existing share URL, so naming the wrong composition overwrites the wrong link. `GET /v1/jobs` answers `{ data: [...] }` with no `download_url` (only the single-job GET has it); `progress.percent` sits at 15 all render. Poll `job_state: stopped` instead.
- Download is 8 ranged connections (the signed Google Storage URL throttles per connection and signs `host` only): 442 s cut 135 s at 7.8 MB/s, 1834 s cut 298 s at 6.7 MB/s, one stream ~45 min. `--connections 1` is the old stream.
- Cloud renders: a 442 s cut took 22 min, 1367 s about 22 min and 1834 s 17 min. Render time tracks runtime, bytes don't (8.6 Mbps on the 1834 s cut, 29.0 on the 1367 s one): quote no GB figure before it lands.

**4K comes off a local export first, the cloud second.** The lock is gone since 10 Sep 2026 (`descript_creator_v3`: both rows `aria-disabled="false"`).

```
pnpm descript export local <project> [composition] --resolution 4K --quality high
pnpm descript export local <project> --resolution 2K --scope scene --dry    # click nothing
pnpm descript export local <project> --via orca --page <id>                 # drive HIS browser
pnpm descript export local <project> --keep                                 # leave the window up
```

| | Local export | Cloud publish |
|---|---|---|
| Video | h264 High 3840x2160, 18.4 Mbps at Recommended | 29.7 Mbps (C18), 7.8 Mbps (EC51), encoder picks |
| Colour | `bt709` throughout | `smpte170m` (EC51), or `iec61966-2-1` over full-range `yuvj420p` (C18) |
| Audio | AAC 48 kHz, plus a `mov_text` subtitle track unless Advanced drops it | AAC 44.1 kHz at 160 kbps |
| Cost | tab busy for the whole encode | nothing local held |

The cloud mints the share URL and is the fallback when local refuses a clip. `pnpm youtube:master` restamps bt709 either way. The colour tag isn't decidable from the render alone: `pull` the original, compare one frame's saturation; only if they diverge, retag (re-encodes nothing): `ffmpeg -i master.mp4 -c copy -color_primaries bt709 -color_trc bt709 -colorspace bt709 out.mp4`.

- Local export needs a real click and a living tab. A synthetic `element.click()` flips the button to `Loading` and writes no file; closing the tab or restarting the browser kills the encode silently. So it runs in a Chrome of its own by default (`--via chrome`: `/Applications/Google Chrome.app`, profile `~/.cache/descript-cli/chrome`, DevTools port 3348, signed in by writing the `stytch_session` cookie, driven over CDP). `--via orca` holds his front tab for the whole encode, and its confirm and editor buttons are both `Export`. **Not headless**: WebCodecs falls back to a software encoder.
- The driver closes its own tab. 3 leaked tabs made Descript refuse a fourth with `Project is taking longer than expected to initialize` for 11 minutes; `openChrome` clears tabs on that project's URL first. An expired cookie shows a sign-in screen (`pnpm descript auth capture`); a fresh profile takes 2 minutes the first run.
- The file sits at 0 bytes for the whole encode (1:05 at 4K: 5 minutes at 0, then 221 MB). Empty is progress; a `--timeout` shorter than the encode reports a failure over a good run. Never click Export again (the second never gets its own file; the command refuses it). Never run a local export and a cloud `publish --download` of one composition together: both write that name into `~/Downloads` (11 Sep).
- It can refuse a clip with a toast (FC38: `Couldn't process "00 RAW CAM Tarifs ClickUp.mov" during export`, a 43-minute HEVC 4K take, though a 2-second scene exported fine): publish that cut in the cloud.
- Maximum everything (The author, 11 Sep 2026). Video rows default to 4K and High; `export local` also opens Advanced and sets stereo, 48 kHz and the top audio bitrate (256 kbps; the app ships 128). Quality rows are bitrates scaling with resolution (4K: High 30, Recommended 20, Low 10 Mbps; 1080p: 21, 14, 7). `--quality` defaults to `high`.
- Check the sources before choosing 4K. EP33's cameras are 1920x1080 and its screens 3840x2160 (4 Sep 2026), so 4K upscales the face. `assets --probe` for sources, `videoMetadata` in `descript doc` for the composition; at a real 1080p timeline `pnpm youtube:master` upscales (Lanczos, 3 minutes).
- YouTube needs 2160p either way. At 1080p it serves one rung (1920x1080 h264 at 1.35 Mbps, no VP9). At 2160p it serves up to 3840x2160 VP9 at 3.0 to 5.4 Mbps. `youtube` refuses an upload under 2160p.
- A dark plain background is a bitrate decision too. At 7.8 Mbps the encoder rations, and a bright wall of posters takes bits off the face (EC51: background 1.33 stops brighter than the subject).
