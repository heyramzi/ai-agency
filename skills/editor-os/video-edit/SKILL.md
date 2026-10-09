---
name: video-edit
description: "Runs the passes of a video edit: ledger, cuts, layouts, clips, checks, DJI lav sync, Shorts or long-form, local or Descript. Use when a raw take needs cutting, a worker gets edit passes, or a reel used a lav."
tags: [drives, descript, video]
lane: general
---

# Video Edit

A take becomes a finished cut in 9 passes, 0 to 8, each timed against the one before. Out of order, you build motion for a frame that's about to move or lay a bed before the cut ends where it will stay.

Read `RUN.json` first. Its `format` picks the format file: [shorts.md](references/shorts.md) for `vertical`, [long-form.md](references/long-form.md) for `wide`. Its `route` is `local` (the take on disk, every Short today) or `descript`. On the local route, close each pass on the proof `next` names (the take folder, `cut short`, `cut check`, `check.txt`, `music offer`, `pick` plus the alpha check, `plan`, `cut final`), never a Descript command or `--anyway`. Its verbs: `retime`, `keep` and `tighten` in [cutting.md](references/cutting.md#the-local-route-cuts), `verify` and `cutcheck` in [checks.md](references/checks.md#the-local-cut-checks), `pick`, `overlay` and `layout` in [sequencing.md](references/sequencing.md#clips-and-layouts-on-the-local-route).

## Rules for every pass

- **Descript goes through `pnpm descript`.** The browser, the published API and Underlord write outside the CLI's commit gate and get reverted or corrupted.
The API once broke an edit that had to be re-uploaded by hand, and Underlord once littered a project with test sequences.
  No verb for it? Write the verb in `CLIs/descript/`. Credentials, the write model and renders: [descript-cli.md](references/descript-cli.md).
- **Every change goes through a CLI verb.** That's `editor-os <verb>` or `cut <verb>` on a local project, `pnpm descript` on a Descript one. Only the studio writes `edit.json` and `edit.notes.json`, so a hand edit races it and loses. A missing verb gets added to the CLI with a test, never worked round with a script. A render, matte or transcript that prints "Waiting for a render slot" is queued behind the Mac's 2 slots: let it wait, never kill it or start a second one.
- **A production gets a ledger before pass 0.** `scripts/run.py` writes `RUN.md` and `RUN.json` beside the video's `plan.md` and mirrors the rows to its ClickUp task. `next` names the pass to do and what proves it; `start` refuses a pass whose predecessor isn't done or blocked; `done` needs the proof command in `--evidence` plus `--file` (saved output) or `--run` (run.py runs it and keeps the output in `proof/`).

```bash
R=.claude/skills/video-edit/scripts/run.py; D=tools/motion/src/<video-code>
python3 $R init $D --code <code> --project <id> --comp <id>          # once
python3 $R init $D --code <code> --route local --take <folder> --cut <folder>/cut.json
python3 $R board $D --task <ClickUp task id>                      # mirror to the task's checklist
python3 $R next $D                                                # the ONE pass to do now
python3 $R start $D <n>
python3 $R done $D <n> --evidence "<what the command's output said>" --file <its saved output>   # or --run "<command>"
python3 $R block $D <n> --why "<the one-action unblock>"
```

- **A name carries its number and timecode**, `N [MM-SS] Description.ext`, and every `[mm-ss]` quoted downstream comes from `layout cards`, never the raw take (a cut moved every second). Rules: [projects-and-media.md](references/projects-and-media.md).
- **Export only after his human pass.**
The editor always does a human pass before anything is exported.
  Read the state back from outside the tool that wrote it after every pass: a tool reporting success isn't evidence. The project stays his to watch.

Siblings: `social` (`references/shorts-production.md` for encoding, Drive, ClickUp and calendar; captions), `video-script` (the script), `broll` (a shot that exists), `motion-design` (a clip that's built).

## The passes

`schemas/passes.json`, which `run.py` reads, is the one home of the order. A pass is done when its last column is true.

| # | Pass | Detail | Done when |
|---|---|---|---|
| pre | DJI lav sync, when a reel used one | [dji-sync.md](references/dji-sync.md) | card burned, verified, archived |
| 0 | organise | [projects-and-media.md](references/projects-and-media.md) | `descript tracks` prints `tracks clean` |
| 1 | coach, then cut | [cutting.md](references/cutting.md) (coach runs first, so the raw take still exists) | script reads with no retake or false start left |
| 2 | reorder, chapters | `cutting.md` (`arrange.py`, then a marker per section) | markers land, chapters read right |
| 3 | rhythm, layouts | [sequencing.md](references/sequencing.md), the layouts page in the studio (`sequence.py`, then `layout pace` and `layout apply`) | `layout cards` shows a card per beat |
| 4 | music | `projects-and-media.md` (3 options from Descript Stock, he keeps one) | `music offer` answered, no bed laid |
| 5 | motion | `motion-design` | every clip rendered, watched, in Editor OS review |
| 6 | broll | `broll` | sourced, imported, in Editor OS review |
| 7 | review | `sequencing.md` (`editor-os transcript`, `plan`, `wait`) | he decided the open beats and the music; `edit.json` holds his choices |
| 8 | handoff | `projects-and-media.md` (`descript settings`) | settings clean, project left for his pass |

A Short never coaches, reorders or chapters.

Checks on a finished cut (doctrine, strategy, the export checklist): [checks.md](references/checks.md). Coach workflow and cut-list method: `cutting.md`. Clipboard mechanics: `descript-cli.md`.

