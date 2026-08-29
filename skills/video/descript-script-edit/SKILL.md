---
name: descript-script-edit
description: "Cuts a Descript composition's script, the false starts, retakes, filler and digressions, by rewriting the rich clipboard the user copies and pastes back, then measures the rhythm of the cut and says where the shots belong. Use when a raw take is full of restarts, when an edit is cut but reads flat or has no b-roll, when a video needs its cut cadence and layouts decided, when Descript AI credits are exhausted, or when the project agent is unavailable. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: macOS for the clipboard bridge (osascript), Python 3.9+, and a Descript account
---

# Descript Script Edit

Cutting the **script** of an existing composition. Getting media into the project,
named and foldered, is `descript-projects`. Reviewing the take before you cut it is
`video-coach`, and it runs first.

## The one idea this skill runs on

**Descript's rich clipboard carries the edit, not the text.** Copy a script, and what
lands on the pasteboard is a JSON payload of timed audio segments with their words.
Rewrite that payload and paste it back, and one paste replaces forty guarded drags in
the editor. It spends no AI credits, needs no browser automation, and runs in whichever
Descript the user is already signed into.

That is the whole skill. Everything else is what to cut and how not to corrupt the
payload.

## The order: credits, then the clipboard

`prompt_project_agent` does this job server-side in one call. Use it whenever it works:

```
prompt_project_agent(project_id, composition_id,
  prompt: "delete every abandoned attempt, keep the last clean version")
```

It is metered on Descript AI credits and fails clean at zero, project untouched:
`{"status":"error","error_message":"Insufficient AI credits"}`.

**A top-up is the user's call, never yours.** Give them the `upgrade_url` from the error
and stop. Only when they decline, or want the edit now, does the clipboard path apply.

**It is also the only API write path, so do not go looking for a cheaper one.**
Descript's public REST API exposes seven endpoints and `/jobs/agent` is the single one
that mutates a script. There is no transcript-patch endpoint, the `.descript` format is
not documented, and `export_timeline` has no matching import. At zero credits the tree
has exactly two branches: a top-up, or the clipboard.

## The coaching pass runs first

`video-coach` reads the raw take against the script it was recorded from and returns one
habit to change on the next recording. It has to run **before** this skill, because the
evidence it needs (the restarts, the abandoned openings, the blocks that were talked out
of existence) is exactly what a cut removes. Once the ignores are in, the exported
transcript returns the surviving take and every recording-habit number reads as a floor
rather than a measurement.

## Cut it through the clipboard

`scripts/dscript.py` runs the whole loop. The user does the two ends, Cmd+A Cmd+C before
`grab` and Cmd+A Cmd+V after `apply`, and nothing in between needs credits or a browser.

```bash
D=scripts/dscript.py                    # ask: click into the script, Cmd+A, Cmd+C
python3 $D grab lesson-1                # decode + archive the clipboard, print the state
python3 $D words                        # indexed transcript, for writing the cut list against
# write cuts.json: [{"start": <word idx>, "end": <word idx>, "pass": 1, "reason": "...", "text": "..."}]
python3 $D apply cuts.json --typos scripts/typos.example.json \
                           --styles scripts/styles.example.json \
                           --markers markers.json
                                        # then tell them: Cmd+A, Cmd+V
python3 $D check                        # they pasted it back? prove it matches what you built
```

`grab` works on a **partial selection** too. The payload carries its own offsets, so a
paste replaces exactly the region that was selected.

Five things `apply` does without being asked:

1. Cuts as **Ignore** (`isBlocked: true`), struck through and reversible, never deleted.
   The text stays byte-identical and the speaker's pauses are kept.
2. Removes fillers and truncated fragments.
3. Repairs glued stutters and mangled product names.
4. Carries every scene boundary and marker onto the segment that still holds its text.
5. Refuses to write the clipboard unless the payload round-trips and every style range
   resolves inside its segment.

`--markers markers.json` names the sections:
`[{"phrase": "...", "text": "Why the move"}]`, matched against the surviving text so a
marker never lands on an ignored restart.

`--styles` paints the **cue legend** the editor reads: blue for b-roll, purple for a
diagram on a transparent layer, green for on-screen text, orange for a CTA. That is the
point of the whole exercise. One paste hands the editor a script already cut, de-filled,
spell-corrected and marked up with where every asset goes.

When something goes wrong, nothing is lost. Every payload seen or written is archived:

```bash
python3 $D history                                  # newest first
python3 $D restore 20260820-150802-grab-lesson-1    # that state back on the clipboard
```

Read [`references/pasteboard.md`](references/pasteboard.md) before the first run. Every
trap in it was paid for.

## What to cut

Two passes, and the second one is the one that gets skipped.

**Pass 1 removes the wreckage of speaking**: stutters, restarts, duplicate takes,
enumerated mechanically so it does not depend on an agent noticing things.

**Pass 2 removes complete, well-formed sentences that carry nothing**: announcements of
what the next sentence will say, a second utterance of one idea in new words, hedges,
digressions, and every sentence whose subject is the speaker.

A run that does only pass 1 leaves a script with no stutters in it that is still bloated.

```bash
python3 scripts/candidates.py blocks.json                       # pass 1 candidates
python3 scripts/candidates.py blocks.json --check needles.json  # uncovered, and the cut ratio
```

**Every mechanical candidate is a needle or a named dismissal, and every sentence faces
one test: delete it, read its two neighbours together, name what the viewer lost.**
Nothing lost is a cut.

The ratio is the second gate. A first-take lesson gives up 14 to 20 per cent of its
characters to pass 1 and 22 to 30 per cent to both. Below that is under-listed, not a
clean take.

**Read [`references/what-to-cut.md`](references/what-to-cut.md) before writing the cut
list**: both passes worked through, the dismissals that look like repeats and are not,
and the full ratio table.

Expect the composition to shorten by more than the characters predict. Ignore takes the
pause attached to the words with it: one lesson lost 1,895 characters and 252 seconds,
because the abandoned takes each sat in their own silence.

## Read the finished transcript for what you never listed

A run reporting every needle landed says nothing about the needles you failed to write.
One composition closed at 31 of 31 with a clean seam scan, and its second paragraph still
read `You are going to create the products that we've been talking I talked to you in one
of the previous lessons about...`, a textbook abandoned attempt that simply never made it
into the cut list.

So the final read is for two different faults, and only one of them is about seams. Glued
words mean a needle took both boundary spaces; a surviving restart means the cut list was
short. Grepping for `[a-z][.,][A-Za-z]` finds the first and finds nothing about the
second, which needs the transcript read as prose.

Run `candidates.py` on the finished export too. Anything beyond the dismissals you already
named is a needle that never landed.

A single missed needle is a one-line `cuts.json` through the same loop, so there is no
reason to hand one back.

## Where the shots go: the rhythm decides, not the eye

A cut script is half an edit. The other half is the frame, and a frame that does not
change is what makes a good script feel long. That half is measurable off the same
payload, so it does not have to be guessed at by watching the video back.

```bash
python3 scripts/sequence.py audit ~/.descript-clip/current.json
python3 scripts/sequence.py plan  ~/.descript-clip/current.json --out shots.json
```

`audit` exits 1 and names the timecodes when the edit misses any of three: **a state
change every 7s** median, **20 to 50 per cent of runtime under a full-frame overlay**,
and **no stretch over 12s where nothing changes**. Measured on two finished edits by the
same editor: one changes what is on screen every 5.4 seconds and hides the speaker 24 per
cent of the time, the other holds a single screen recording for nineteen unbroken
minutes. Both were cut correctly. Only one of them moves.

**A jump cut is not a state change.** Removing a restart makes the speaker jump and the
frame two words later is the same frame, which is how an edit reaches 123 cuts and still
sits still.

`plan` reads six triggers off the surviving script - a run of short clauses, "this is
what it looks like", a count, the call to action, and a frame that has sat still, which
prefers a **jump cut** over a zoom whenever the stretch holds an announcement worth
ignoring - and prints a shot list: the timecode, the trigger, the line, and the clip if one matched by
name. A clip named `07 [06-41] Each Video Builds A Space.mp4` binds to the slot within 25
seconds of its own bracket. Everything else prints as `OPEN`, which is a brief for the
clip that does not exist yet, not a hole to fill with whatever is nearest.

**Read [`references/sequencing.md`](references/sequencing.md) before the shot pass**: the
two measured edits in full, the trigger table, the zoom ladder and what the gate refuses
to decide for you.

## Verify with the API, not the screen

The in-page duration readout is hard to scrape reliably; there are many `M:SS.s` nodes and
most are ruler ticks or the playhead. Read the truth from outside:

```
get_project → compositions[].duration
```

Descript autosaves, so the server value reflects the edit within seconds and is the number
to report. **With ignores present it is not the render length**, because an ignored region
still occupies the timeline. For that, sum the unblocked segment durations, which is what
`dscript apply` prints as `plays`.

## Verification checklist

- [ ] `video-coach` ran on the raw take before any cut
- [ ] Every mechanical candidate is a needle or a named dismissal
- [ ] Pass 2 ran, and its cuts are whole sentences
- [ ] The cut ratio landed in range for a first take
- [ ] `dscript check` confirms the pasted payload matches what was built
- [ ] The finished transcript was read as prose, not only grepped for seams
- [ ] `sequence.py audit` passes, or every stretch it names is explained

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one that is not already listed, append it to Learned Patterns before finishing.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- A cut ratio in range says nothing about the frame. One edit hit every cutting target
  and still held a single screen recording for nineteen unbroken minutes at 9 per cent
  coverage. Measure the rhythm as well as the words, on the same payload.
- A clean seam scan is not a clean cut. Seams prove the needles you wrote landed
  correctly; they say nothing about the abandoned attempt nobody listed. Read the
  surviving transcript as prose before calling a run finished.
- Cutting in Delete mode strands the punctuation that bracketed a filler:
  "pre-edited, uh, timeline" becomes "pre-edited, timeline". Ignore mode never has this
  problem, which is one more reason to prefer it.
- Only one class of typo is safe to fix. Where the transcriber was wrong and the audio is
  right, correcting the text makes them agree. Where the **speaker** misspoke, correcting
  the text makes the captions disagree with what is heard. Leave those unless asked.
- The pasteboard must be read through a UTF-8 temp file, never through stdin. `osascript`
  decodes piped bytes as MacRoman, so the raw-type brackets arrive mangled and the
  coercion fails with -1700.
- A paragraph break lives in the text as `\n`, never in a segment boundary. A segment
  split to drop a filler must not start a paragraph, or the pasted script re-flows.
