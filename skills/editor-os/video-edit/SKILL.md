---
name: video-edit
description: "Cuts a take in Descript, card to composition: DJI lav sync, project setup, coaching, the script cut, a Short. Use when a reel used a lav, footage must land in Descript, or a raw take needs cutting."
tags: [drives, descript, video]
lane: general
---

# Video Edit

A take becomes a rendered Descript composition in 9 passes, 0 to 8, each timed against the one before. Out of order, you build motion for a frame that's about to move or lay a bed before the cut ends where it will stay.

## Rules for every pass

- **Descript goes through `pnpm descript`.** The browser, the published API and Underlord write outside the CLI's commit gate and get reverted or corrupted.
The API once broke an edit that had to be re-uploaded by hand, and Underlord once littered a project with test sequences.
  No verb for it? Write the verb in `CLIs/descript/`. Credentials, the write model and renders: [descript-cli.md](references/descript-cli.md).
- **A production gets a ledger before pass 0.** `scripts/run.py` writes `RUN.md` and `RUN.json` beside the video's `plan.md` and mirrors the rows to its ClickUp task. `next` names the pass to do and what proves it; `start` refuses a pass whose predecessor isn't done or blocked; `done` needs the proof command in `--evidence` plus `--file` (saved output) or `--run` (run.py runs it and keeps the output in `proof/`).

```bash
R=.claude/skills/video-edit/scripts/run.py; D=tools/motion/src/<video-code>
python3 $R init $D --code C51 --project <id> --comp <id>          # once
python3 $R init $D --code A40 --route local --take <folder> --cut <folder>/cut.json
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
| 3 | rhythm, layouts | [sequencing.md](references/sequencing.md), [layouts.md](references/layouts.md) (`sequence.py`, then `layout pace` and `layout apply`) | `layout cards` shows a card per beat |
| 4 | music | `projects-and-media.md` (3 options from Descript Stock, he keeps one) | `music offer` answered, no bed laid |
| 5 | motion | `motion-design` | every clip rendered, watched, in Editor OS review |
| 6 | broll | `broll` | sourced, imported, in Editor OS review |
| 7 | review | `sequencing.md` (`editor-os transcript`, `plan`, `wait`) | he decided the open beats and the music; `edit.json` holds his choices |
| 8 | handoff | `projects-and-media.md` (`descript settings`) | settings clean, project left for his pass |

A Short earns five of these passes and never reorders or chapters; it runs its own tighter cut, dress and bed in place of passes 1 through 4, and hands off to encoding and scheduling where pass 7 would be.

Checks on a finished cut (doctrine, strategy, the export checklist): [checks.md](references/checks.md). Coach workflow and cut-list method: `cutting.md`. Clipboard mechanics: `descript-cli.md`.

## Learned Patterns

This skill appends new failure modes to its own pattern list after each run: [references/learned-patterns.md](references/learned-patterns.md). Read it before a run, because most entries are a call that reported success while doing something else. If a run surfaces a failure mode not listed, append it to Learned Patterns there, newest first, dated, as the rule alone. Git holds the story.
