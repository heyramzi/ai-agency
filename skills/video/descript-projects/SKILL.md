---
name: descript-projects
description: "Imports, names and folders media in a Descript project, and reorganises a media library that has gone loose. Use when footage or b-roll needs to land in Descript, when a project's media browser is disorganised, or when planning an import so the names come out right the first time. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: Descript MCP connector or a Descript API token; Python 3.9+ and ffmpeg for the helper scripts
---

# Descript Projects

The edit workspace: getting media into a Descript project, named and filed so the
media browser *is* the shot list. It does not cover encoding, scheduling or
distribution.

- Cutting the script itself, the false starts, retakes and filler: `descript-script-edit`.
- Aligning a separate mic take with the camera before any of this: `dji-sync`.
- Writing the opening: `video-hooks`. The body: `video-script`.

## The one idea this skill runs on

**The media browser is the shot list, or it is a second document you have to keep
open while you cut.** Every rule below exists to make the browser carry the edit
order and the timecode, so nothing else has to.

That costs nothing at import and is expensive to retrofit, which is why the naming
is decided before the first call, not after.

## Folder by video, never by asset type

The import key **is** the display path, and a `/` in it creates a folder:

```json
{ "second-brain/00 RAW Second Brain.MOV": { "content_type": "video/quicktime", "file_size": 401830273, "language": "en" } }
```

One folder per video, holding that video's raw take **and** its b-roll together:

```
second-brain/
  00 RAW Second Brain.MOV
  01 Notes App.mp4
  02 Typing A To-Do List.mp4
creative-time-blocks/
  00 RAW Creative Time Blocks.MOV
  01 Phone Distraction At Work.mp4
```

Not `Raw/` plus `B-roll Second Brain/`. Splitting by asset type means opening two
folders to cut one video, and merging them afterwards is one move per file.

## Every name carries its number and its timecode

`NN [MM-SS] Description.ext`

```
terminology/
  00 RAW Terminology.MOV
  01 [00-00] Hierarchy Overview Diagram.jpg
  02 [00-09] Workspace.png
  04 [01-34] Folders.png
  11 [04-19] Custom Fields.png
```

The number sorts the browser into edit order. The timecode says where the clip
goes, so nobody has to hold a separate shot list open.

- **`-` not `:`.** macOS renders `:` in a filename as `/` in Finder. `[04-19]` means 4:19.
- **Zero-pad to mm-ss** so `[00-09]` sorts above `[01-34]`.
- **Timecode against the cut, not the raw**, whenever a composition already exists.
  Export the composition transcript as SRT for the real clock. A raw timecode on a
  cut take is not merely offset, it is meaningless: the line may have been cut.
- `00` is the raw take and carries no timecode.
- Several clips can share one timecode when they are alternatives for one beat.
  `12 [05-01]`, `13 [05-01]`, `14 [05-01]` reads as "three options for the 5:01 beat".
- On a salvage take kept for a few lines, put the salvage points in the name:
  `00b ALT 4K [salvage 1-05, 1-13, 3-41].MOV`.

**When there is no take yet, drop the bracket rather than inventing one.** B-roll
often arrives before the camera does. The project then holds no raw take, its
composition reports a duration of 0, and there is no clock at all. A guessed
`[01-20]` in that state is worse than no timecode, because the next reader takes it
as measured. Import as `NN Description.ext` and add the bracket after the cut.

## Only one track gets transcribed, and it is the microphone

Descript transcribes what you import. On a multi-angle shoot the same words exist on
three tracks (the lav, the camera's built-in mic, the screen recording's room audio),
and importing all three produces three transcripts of one performance. Two of them
are worse, and they sit in the browser next to the good one.

**`language` is not a switch.** The import API has no "do not transcribe" flag;
`language` only says which language to expect, and omitting it means auto-detect
rather than skip. The only thing under your control is what audio you upload.

- **An external mic track exists**: upload the camera and screen angles with their
  audio stripped, `ffmpeg -i in -c:v copy -an out`. Stream copy, so it costs seconds
  and no quality. Pass no `language` on the silent angles.
- **No external mic**: the camera track is the audio. Keep it and let it transcribe.
  Stripping here leaves the project with no script at all.

Check before stripping rather than assuming, and check sync first: waveform alignment
needs the camera audio, so align (`dji-sync`) and strip after. Keep the un-stripped
original on disk either way.

## Import mechanics

Two surfaces, and they are not equal.

**The MCP connector** carries `import_media`, `get_project`, `export_transcript`,
`export_timeline`, `publish_project` and `prompt_project_agent`.

**The REST API** is `https://descriptapi.com/v1` with a personal token, and
`https://docs.descriptapi.com/openapi.yaml` is the live endpoint list. `GET /projects`,
`GET /projects/{id}`, `POST /jobs/import/project_media` and `GET /jobs/{job_id}` cover
an import end to end.

**The MCP is not a pure wrapper, so the fallback is not equal.** Four of its tools
answer to no endpoint in the spec at all: `export_timeline`, `list_folders`,
`get_drive_info`, `import_drive_media`. Timeline export to EDL, AAF, FCPXML or Resolve
XML is MCP-only. Lose the connector and you lose those, whatever the token can do.

`scripts/import_media.py <project_id> <manifest.json>` drives the REST path. Dry run
first: `upload_urls` maps each display name to an **object** holding the URL, and a run
that reads it as a string creates the job, uploads nothing, and burns every name in the
manifest. Cancelling the job does not give the names back.

**Cap: 3 media per call through the MCP, not through the API.** The MCP returns
`Query count exceeded limit of 100` above three. A direct
`POST /jobs/import/project_media` took nine direct-upload items in one call and reported
all nine `success`. Batch in threes through the MCP; through the API, send the set.

**One job at a time per project.** A second import while one is running returns
`A job is already running for this project`, and the whole batch is rejected rather than
queued. Wait between batches.

**Prefer direct upload to URL import.** URL import validates server-side and rejects
anything that answers with HTML, including CDNs that serve the file perfectly to `curl`.
Direct upload is two steps and never has this problem:

```bash
# 1. import_media with content_type + file_size returns upload_urls
# 2. PUT the bytes
curl -sS -X PUT -H "Content-Type: application/octet-stream" \
  --upload-file FILE "$UPLOAD_URL" -w "HTTP %{http_code}\n"
```

The declared `file_size` must match the file exactly. Signed URLs last 3 hours.

## Names are not write-once, but the published API cannot fix them

The published API has no write path for media names: no PATCH, no PUT, nowhere. The
conclusion usually drawn from that (re-import to fix a name) is wrong, because
re-importing duplicates the media and the original stays wired into every composition
using it.

The Descript app does not use that API. It writes
`https://web.descript.com/v2/projects/{id}/collab/commits`, where a project is a
trimerge-sync document and every edit is one commit carrying a jsondiffpatch delta. The
media name lives at `mediaLibrary.mediaRefs[].displayName` and the folder tree at
`rootMediaFileFolder`; a composition's name is `compositions[].name`. Rename, move,
mkdir and rmdir are one commit each against that document.

That route is undocumented and unsupported. If you build a client for it, three rules
that were learned expensively:

- **Never do route discovery inside a project that matters**, and never press undo in
  an editor whose undo stack is not yours. `is_live_collab_enabled` is false on these
  projects, so two open sessions race and the last save wins. Duplicate the project and
  drive the copy.
- **Batch into one commit.** Every write replays the whole commit graph, so twenty-six
  renames one at a time is twenty-six replays.
- **A storyboard project is not writable this way at all.** Anything with
  `is_storyboard_enabled` keeps no collab document; the real document is an S3 bundle
  written one revision per edit.

Otherwise: get the name right at import. It is one call instead of two.

## Never let the agent substitute

`prompt_project_agent` will do *something* adjacent when it cannot do what was asked, and
report success. Asked to rename media library items, it renamed tracks inside
compositions instead, including one composition already published to a live
`share.descript.com` URL.

Every agent prompt that mutates anything ends with an explicit refusal clause:

> If you really cannot do X, do not do anything else as a substitute. State plainly which
> tool or capability is missing.

Then verify with `get_project` rather than trusting `agent_response`. It is also metered
on AI credits and returns `Insufficient AI credits` when they run out, so it is the wrong
tool for anything mechanical.

Compositions with an entry in `publishes` are live URLs. Renaming one changes what
viewers see. Leave them alone unless asked.

## The mess is not the imports

**The API only controls names for media it imports. Everything Descript generates itself
lands at the project root with a machine name and no folder**: fonts, AI voice clips,
pasted images, screen recordings, stock media. On one project, 70 of 109 media items were
loose at root while all seven video folders were clean. An import session also tends to
leave loose root items, sometimes one per file, so the only honest number is a
`get_project` diff around your own call.

So do not sell a tidy-up as a fix. Hand over instead:

- **Four bucket folders, underscore-prefixed** so they sort above the video folders:
  `_fonts`, `_ai-audio`, `_stills`, `_recordings`. A wrong bucket name costs nothing.
- **Sort the media browser by Type first**, which makes each bucket one contiguous run
  and the job four shift-click drags rather than seventy.
- **Say plainly that it recurs.** The cheap moment to sweep is when a batch closes, not
  when it has grown to seventy.

The hand route, which panel does what, why a fast drag is cancelled and how the tree
announces a drop: [`references/browser-fallback.md`](references/browser-fallback.md).

## Pairing a camera take with its screen recording

Loose recording pairs carry no clue in their names. Do not pair them by nearest duration,
which is wrong as often as it is right. Pair them through the **sequence** durations in
`get_project`: a sequence's duration is its longer member, so a sequence that matches a
camera take exactly owns that take, and its screen partner is the longest screen file
still under that number.

`RPReplay_Final<n>.MP4` names are unix timestamps of the **end** of the recording, not the
start: subtract the duration and the takes chain in order with no overlap. That gives the
recording order of a session, which orders the pairs but does not name them. Only the
person who recorded them knows which lesson each one is. Ask rather than infer; a misfiled
source take is worse than a loose one.

The file name never says the device. Probe the file itself: an iPad screen recording comes
back 1640x2360 at 60, a 4K camera take 3840x2160 at 30. `RPReplay_Final*.MP4` is an iOS
screen recording, `IMG_*.MOV` is the camera roll, and a Descript-recorded take carries
`source: web-recorder` and is named after the speaker.

## Name a sequence from the source of truth, never from the composition

A composition name is typed by a human and drifts. On one course project, 8 of 13 carried
the wrong module and lesson number, so copying them onto the sequences would have burned
the error into names the API cannot fix.

Find the file that owns the naming scheme and join on something machine-generated: a course
manifest storing each lesson's `share.descript.com` URL matches `publishes[].share_url`
exactly, giving composition-to-lesson with no inference.

Confirm the last hop with `export_transcript` and `include_speaker_labels:
"every_paragraph"`. Paragraphs come back prefixed with the **source track name**, so the
edit tells you which media it was cut from. It also answers the multi-take question
durations cannot: a 400s take that looked like an abandoned first attempt turned out to
supply 15 paragraphs of the published cut.

## Verification checklist

- [ ] Every import key carries its folder path, its sort prefix and its `[mm-ss]` timecode
- [ ] Raw take and b-roll for one video sit in the same folder
- [ ] No import call carries more than 3 media entries
- [ ] Any composition created carries the orientation the take was actually shot in
- [ ] The job finished before the next batch started
- [ ] `get_project` confirms every file landed, with the intended name
- [ ] Any composition touched was checked against `publishes` first

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one that is not already listed, append it to Learned Patterns before finishing.

A capability limit stated in this file gets re-verified against the live tool list and
`docs.descriptapi.com` before it is repeated to anyone. The endpoint count has moved once
already.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- An import manifest is spent on first use. A run that misreads `upload_urls` creates the
  job, uploads nothing, and the display names are gone; cancelling the job does not return
  them. Dry-run the manifest against a scratch project before the real one.
- The app's own delete has no confirmation. A composition's right-click menu ends in
  Delete and goes straight through, which makes `New composition from file` then
  `export_transcript` then Delete a safe way to read the transcript of media that has no
  cut, and an unsafe way to do anything else.
- Two browser sessions on one Descript project fight, and the loser is whichever saved
  first. Check the collaborator avatars in the top bar before touching anything.
- Version history is what makes a bad write recoverable. Its restore dialog names the
  version number, so note the number before an experiment rather than after.
