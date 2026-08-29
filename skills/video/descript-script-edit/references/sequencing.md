# The sequence: how often to cut, and what to cut to

Read this whenever an edit is cut, correct, and still reads flat. Cutting the script
removes what should not be there. It does nothing about the frame, and a frame that does
not change is what makes a good script feel long.

`scripts/sequence.py` implements every number below. The file is the reasoning, the
script is the answer.

## The two measured edits

Both read with `sequence.py audit`, off the clipboard payload `dscript grab` already
wrote, on the speed-adjusted play clock.

| | the standard | the edit before it |
|---|---|---|
| runtime | 7:34 | 22:54 |
| jump cuts | 70, one every 6.5s | 123, one every 11.2s |
| state changes | 69, median gap 5.4s | 23, median gap 10.0s |
| full-frame overlays | 20, median 4.7s | 2, median 64.2s |
| coverage | 24% of runtime | 9% of runtime |
| stretches over 12s with a still frame | 6 | 4, one of them 18:47 long |

The difference between the two columns is not taste. The right-hand edit holds one
screen recording for nineteen unbroken minutes, which is a screen share with a voice over
it. The left-hand one changes what is on screen every 5.4 seconds and hides the speaker a
quarter of the time. Both were cut by the same person from the same kind of take.

**A jump cut is not a state change.** Removing a restart makes the speaker jump, and the
frame two words later is the same frame. Only a layout change or a clip arriving counts,
which is why an edit can have 123 cuts and still sit still.

## The gate

`sequence.py audit` exits 1 on any of three, and prints the stretches by timecode:

- **A state change every 7s or better**, median.
- **20% to 50% of runtime under a full-frame overlay.** Under 20% the video is a face
  talking. Over 50% the viewer stops believing anybody is there.
- **No stretch over 12s where nothing changes at all.**

The standard above fails the third with six stretches, the worst 29 seconds, and those
six are exactly where that edit could still improve. A gate the reference passes clean is
a gate measuring nothing.

Run it on the finished cut, before the shot pass, and again after.

## What fires a shot, and which one

`sequence.py plan` detects these off the surviving script. The trigger is the evidence;
the shot is the answer to something the sentence cannot say on its own.

| trigger | what fires it | the shot |
|---|---|---|
| `list` | three or more clauses in a row, each under 2.6s, each ending in a comma | one clip per clause, 1.0-1.5s each, full frame |
| `screen` | "this is what it looks like", "an example of", "let me show you" | the screen recording beside the speaker, and a zoom in at the detail |
| `motion` | a quantity or a count in the line: "50 plus clients", "three pillars", "tens of" | a graphic full frame, camera in the corner |
| `cta` | "the link is in the description", "book a call", "it's your decision" | the call-to-action card |
| `jumpcut` | a dead stretch holds an announcement of what the next sentence will say, under 3.5s | ignore it. The frame breaks and the video shortens at once |
| `zoom` | a dead stretch with nothing in it worth cutting | the next step of the ladder, on a sentence start |

The `list` trigger is the one nobody writes by hand. Three short parallel clauses read as
one sentence and edit as three shots: one measured edit spends four seconds on four of
them, a clip a clause, and it is the fastest-moving four seconds in the video.

**A dead stretch prefers a jump cut to a zoom.** A zoom breaks the still frame. Ignoring an
announcement breaks it and takes the words out at the same time, which is the cheaper fix twice
over. The worst stretch in the measured edit is 29 seconds, and `plan` splits it by ignoring
"And one last thing," at 6:43 - the same needle a person writes by hand against the same stretch.
Jump cuts land in a `.phrases.json` beside the shot list, because they belong to the cut rather
than to the frame.

**The zoom ladder returns to 100 between steps**: `110, 100, 120, 100, 130, 100`. A zoom
holds until the next card changes it, so two steps in a row read as a slow drift rather
than as a cut.

## Name a clip for the beat it was made for

A clip named `07 [06-41] Each Video Builds A Space.mp4` carries the timecode it was made
for in its own name. `plan` binds a clip to a slot within 25 seconds of that bracket and
prints the binding, so a set of graphics made against a script lands on that script
without anybody retyping a time.

The bracket is a seed and never the anchor: the cut moves everything after it, so a clip
named for 1:28 is correctly sitting at 1:33 in the finished edit. What holds the shot in
place is the phrase it opens on, not a time.

## The run

```bash
python3 scripts/sequence.py audit ~/.descript-clip/current.json
python3 scripts/sequence.py plan  ~/.descript-clip/current.json --out shots.json
```

The table it prints is the shot list: the timecode, the trigger that fired, the line, and
the clip if one matched. Place them in Descript, copy the script again, and re-run `audit`
to see the gate move.

An `OPEN` slot is a clip that does not exist yet, and the row is its brief. Do not fill
one with a clip that argues something else to make a number go green: coverage bought
with a shot that says nothing is worse than the still frame it replaced.
