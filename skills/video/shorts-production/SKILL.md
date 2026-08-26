---
name: shorts-production
description: "Takes a finished short-form recording to a scheduled, coded, filed production record with the export in your media library. Covers reading a recording before deciding anything about it, the pillar code scheme, the rule that exports ship as they are and are never re-encoded, and the calendar write-back. Use when a Short has just been recorded, when a recording needs uploading, or when a Short needs coding and scheduling. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: ffmpeg and ffprobe; a local whisper build when a recording carries no subtitle track
---

# Shorts Production

This skill starts where the camera stops. It does not write scripts and it does not
write hooks.

- Hooks and Short structure: `video-hooks`.
- Turning long-form into posts: `generate-social`.
- Aligning a lav take with the camera first: `dji-sync`.

## Know what a Short is worth before making more of them

Shorts are a distribution surface, not an engine. On one measured positioning twin they
accounted for 7 per cent of lifetime views, and volume did not rescue the ratio. A Short
is a clip that feeds the surfaces that do work, so a batch of Shorts is not a growth plan
by itself, and hours are usually better spent on the long video and its title than on
Short number twenty-five.

Measure this on your own channel before deciding how many to make. Divide lifetime Shorts
views by lifetime views, and look at where the people who convert actually came from.

## Read the recording before deciding anything about it

Do not ask what the video is about, and do not guess from the filename. Filenames are
working titles and they carry codes that may not exist in the taxonomy.

**Captioned exports usually carry a subtitle track, which is a free transcript.**

```bash
ffprobe -v error -show_entries stream=index,codec_type,codec_name -of compact IN.mp4
ffmpeg -v error -i IN.mp4 -map 0:s:0 -c:s srt subs.srt   # if a subtitle stream exists
```

No subtitle track means transcribe: whisper on 16 kHz mono audio
(`-vn -ac 1 -ar 16000 -c:a pcm_s16le`).

Then look at the picture, because the transcript cannot tell you whether it is a talking
head, a split screen or a screen capture, and it cannot tell you whether captions are
burned in. One contact sheet answers all of it, with the timecode burned into every cell:

```bash
ffmpeg -i IN.mp4 -vf "fps=1/8,drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6,scale=320:-1,tile=4x3" -frames:v 1 sheet.png
```

**The same pass is the last check before the export ships.** A caption over the speaker's
face, a caption running off the bottom, a burned-in caption on a clip that also ships an
`.srt`, a black tail after the last word: all of them survive a clean export and none of
them survive a look. Re-cutting is the fix, never a re-encode.

## The pillar codes

`[Letter][NN]`. The letter is the pillar, the number is an ID inside it and **never a
running order**.

Pick six letters or fewer for your own content and hold them. The set below is one worked
example, not a prescription:

| Code | Pillar | What it sells |
| --- | --- | --- |
| **S** | Skill: a concrete tactic or tool the viewer can use today | The flagship, top of funnel |
| **C** | The tool you teach: configuration, delivery | The flagship |
| **A** | AI: agents, building software without being an engineer | The flagship |
| **L** | Lifestyle: the founder's week, getting out of delivery | Warm audience |
| **P** | Product: the things you build in public | Product downloads, and proof the software is real |
| **M** | Mindset: personal productivity, calendar, second brain | The community |

Long-form uses the same table with a language letter in front: `[Language][Pillar][NN]`,
so `EA19` is an English AI video. A Short keeps the bare `[Letter][NN]`, because a Short
has no language split.

Three rules that were paid for:

- **The number is an ID inside the pillar, never a running order**, which means it is
  **never renumbered to close a gap**. A gap is what proves nothing was reused.
- **Read the title, not the number, when re-coding a back catalogue.** Assigning a pillar
  from an old numeric family alone mis-files every video that happened to be coded in a
  neighbouring family.
- **A letter that gets reassigned takes its old videos with it.** Reusing a letter for a
  new meaning while leaving old clips on it produces codes that each mean two things.
  Rehouse them in the same pass or do not reassign.

Numbering: take the next free number inside the letter, and check the live list before
assuming a number is free, because any document lags the board.

## Two rules that reject work at this stage

Check both before scheduling, and say so out loud when one is breached.

1. **Dated content never goes to Shorts.** Shorts is the evergreen home; TikTok and
   Instagram take the timely material. A video that says "a new update" or "a find of
   today" is dated even when the underlying feature is durable. On news about a permanent
   feature this is a judgement call, so flag it rather than deciding silently.
2. **The congruence rule.** Every video is the same subject as the thing sold, one level
   shallower. A tool tip with no product tie is allowed, but it is a connection-tax post
   and should be named as one rather than counted as core content.

## Do not re-encode. Ship the export

**The file the editor exports is the file that ships.**

This skill used to carry a re-encode recipe: transcode every master to CRF 19 behind an
SSIM gate at 0.99. The gate is what killed it. Of six masters run through it, four scored
a literal `1.000000`, meaning the transcode was measurably pointless, and the two that
failed at 0.9810 and 0.9875 failed because the transcode had degraded them. **The gate was
catching damage the gate itself caused.** A step whose best case is no change and whose
worst case is loss is not a quality step.

So: upload the export. Keep the filename discipline
(`S01-gsc-social-master.mp4`, code and topic, never the working title) by copying or
renaming, not by transcoding.

**What this costs is disk, and only disk.** Exports run 150 to 420 MB where a transcode
landed at 24 to 62 MB. If an upload path has a size ceiling, change the path rather than
the file. Re-encoding for size is not a permitted workaround.

## Two destinations, every time

**The library** holds the master and its `.srt`. Upload the subtitle file alongside the
video: it costs nothing and it is what a re-cut or a translation starts from.

**The production record** holds a preview, never the master. Most task trackers time out
or reject a 150 MB attachment, and the error usually reads as a server fault rather than a
size limit. Build the preview off the master and keep the master in the library:

```bash
ffmpeg -i OUT-master.mp4 -map 0:v:0 -map 0:a:0 -vf scale=720:1280 \
  -c:v libx264 -crf 26 -preset veryfast -c:a aac -b:a 96k -movflags +faststart OUT-preview.mp4
```

This is not the no-re-encode rule being broken. The preview is a second artefact for a
human to glance at, and the master still ships untouched.

**Verify an attachment byte-for-byte against the local file.** An upload that reports a
500 has sometimes completed, and an upload that reports success has sometimes truncated.

## The calendar is one field, and it is not the due date

Whatever your board renders its calendar from, that field is the publish date. A task
whose due date moved and whose publish field did not stays exactly where it was on the
board, and nobody notices until two pieces land on the same day.

Set both, set them to the same day, and stamp midday rather than midnight so no timezone
rolls the date back.

**Where the board and the publishing queue disagree, the queue wins and the board gets
corrected.** The queue is what actually publishes. One Short carried a board date three
days before the date it was queued for, which put two pieces on one day and left the other
empty.

Posting days are a decision, not a default. Fix them, keep one day for the long-form, and
give the weekend slots to unscripted and personal material so the scripted batch stays at
a size you can hold.

## What goes in the production record

Someone opening it three weeks later should not need the video to know what it is.

Topic line with pillar, format, length and record date. Status, plainly: what is shot,
what is left. The hook, verbatim. A beat table with seconds. The full transcript as a
blockquote. An asset list with the library links and where the untouched source sits. Any
rule breach, named, with the decision left open if it is not yours to make. Any follow-up
the video promises on camera, because a promised part two is a scheduled post.

## The script library drifts from the production record

Wherever scripts are written and wherever production is tracked, the two drift, because a
Short can be shot without anyone opening the note. The folder contract, the triage
procedure, the rebalance rules and the note shape are in
[`references/script-library.md`](references/script-library.md). **Read it before moving any
note**, and re-triage whenever a batch is recorded.

## Verification checklist

- [ ] Content was read from the subtitle track or a transcript, not inferred from the filename
- [ ] A contact sheet was read: the format is known, captions sit clear of the face and inside the frame, and there is no black tail
- [ ] The pillar letter matches the current table, and the number was checked free against the live list
- [ ] The dated-content rule and the congruence rule were both checked, and any breach was named out loud
- [ ] The uploaded file is the export itself, not a transcode of it
- [ ] The master and the `.srt` are both in the library
- [ ] The production record exists, tagged, dated on a posting day, with a preview attached
- [ ] Attachment size was verified byte-for-byte against the local file
- [ ] The calendar document was updated to match the board, after the board
- [ ] Any new failure mode was appended to Learned Patterns

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one that is not already listed, append it to Learned Patterns before finishing. If this run
surfaced one not already listed, append it to Learned Patterns before finishing.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- A quality gate can be the thing causing the damage it reports. Before trusting one,
  check what the passing scores look like: four perfect `1.000000` results mean the step
  under the gate is doing nothing at all.
- A clean export is not a clean video. Every fault worth catching at this stage is visual
  and survives every automated check: a caption over the face, a caption off the bottom
  edge, a black tail. Look at frames.
- The calendar reads one field and it is rarely the one you set. Find out which before
  scheduling a batch, or the board and the queue drift silently.
- A filename is a working title. Codes inside it may name a taxonomy that no longer
  exists, so read the recording rather than the name.
