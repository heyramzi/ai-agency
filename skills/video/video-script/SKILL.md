---
name: video-script
description: "Writes the body of a long-form YouTube script: the teach blocks, the demo choreography, the retention beats and the one commercial ask. Holds the measured findings on runtime, the beat budget, ask placement and which promise number to use. Use when a recorded video needs a script, when a long-form script runs long or asks too early, or when a script has to sell a product without turning into a pitch. The opening 30 seconds belong to video-hooks, not here."
tags: [writes, video, youtube]
---

# Video Script

The body is everything after the hook has done its work. It decides whether the viewer is still
there at minute twelve, and whether the one ask at the end lands on somebody who has already decided.

**This skill does not write the opening.** The first 30 seconds, the hook variants and the drop-off
rating are `video-hooks`, and its measured finding stands: the hook governs whether people stay,
never how many arrive. Read it first, take the open from it, and come back for everything after 0:30.

**The body's structure is `storytelling`.** The five moves, the literalness ladder, one open loop
and the motif that returns changed. The finding it exists to prevent is the script that is accurate
all the way through and holds nobody: read the beats in pairs and say what changed between each one,
because "another point about the same thing" is a list, and a list is watched at the speed of the
scrub bar.

Voice is `voice-dna`. Do not restate it, do not soften it, and run `humanizer` over the finished
script before it is read on camera. **Count the first-person pronouns first: the target is zero.**

## Read what the feed rewards this month, before drafting

`social-engagement` derives it from competitor posts it collects itself, scored against each
account's own median so a 22,000-like account and a 21-like account contribute the same evidence:
`social-engagement`, `references/what-works.md`. It carries
its measurement date and a staleness ladder, because a feed re-ranks every month and a file does
not. Over 30 days old, collect the feed again before trusting the page.

It says what the feed rewards, never what is good. The bans in `@heyramzi/lint` and the voice in
`voice-dna` outrank every number on that page.

## Decide the subject on a number before writing a beat

`idea-mining` chooses what the piece is about. This is the measurement that says whether it is
worth a recording day, and it runs before the hook.

Two reads, both cheap, and the second is the one that decides.

- **Demand.** vidIQ `keyword_research`, mode `research`, on the head term. What matters is the
  estimated monthly searches next to the competition score, not the volume band on its own. The app
  has the same instrument at `POST /api/youtube/keyword-research`, which stores the report so a
  concept can point at it.
- **The SERP.** vidIQ `youtube_search` on the exact phrase a buyer types, 20 results. **Read the
  view counts, not the titles.** A first page of 2-to-5-minute clips under 150 views each is an
  unserved query whatever its volume says, and it is the only condition that justifies entering a
  keyword a bigger channel already has content on.

Worked example, 28 Aug 2026, EC52. `clickup pricing` returned 3,541 monthly searches at competition
21.3, a middling row, and the SERP returned 11, 7, 27, 118 and 16 views on its top five. The second
read is what made it a video. **The data cost policy is `programmatic-seo`'s and it binds here too**,
so do not spend a paid keyword call on a subject `idea-mining` has not already picked.

**A fallback that invents its own data is worse than an outage.** The app's keyword report answered
four different seeds with an identical estimated volume of 140 and seven templated ideas while
looking exactly like a measurement, and a title was chosen off it on 26 Aug 2026. Any keyword row
repeating across unrelated seeds is a fallback, not a reading.

## The runtime rules live in code

Where an app generates a script, the rules it enforces live in code. That file is the runtime
copy and this page is the evidence behind it. **Change one and change the other in the same
session**, because a rule that only exists here never reaches a generated script, and one that
only exists there has nothing to defend it.

## The three-run control is the spine of this skill

Runtime, beat budget and ask placement were each measured across three runs of the channel, and the numbers are what this skill enforces. Read [`references/three-run-control.md`](references/three-run-control.md) before writing the beat sheet, or when a script has come out long and the budget has to be argued with.

## The ask rule, where two sources of evidence disagree

The generic retention literature says never save the only CTA for the end, because
only 16% of viewers reach the final 10%. The three-run control says the two winners
held every outbound ask to the last 2% and the loser asked at 11% and lost by 3 to
5x. Both are right, because **they are counting different asks.**

- **An in-platform ask** (subscribe, like, comment) costs the viewer nothing and never breaks the
  teach. Place these where the retention data says: one around the one-minute mark after the first
  thing of value has landed, one more later, each paired with something on screen, because embedded
  beats spoken-only by a wide margin.
- **An outbound ask** (buy this, book a call, go to this page) spends the viewer's attention and
  their trust at once. There is exactly one, in the last twenty seconds. A second does not add a
  second conversion, it converts the video into an ad in the viewer's memory.

If the video exists to sell something, that is an argument for making the teach complete, not for
asking earlier. The winning run teaches for nineteen minutes and asks once with 21 seconds left.

**Two further sources corroborate the split and one of them bounds it**: Saraev's four-hour course
with its single closing pitch, the 627-transcript measurement that puts the median last outbound ask
at 92% of runtime and 77% of videos on one ask or none, and the reason that corpus cannot settle the
rule either way. All three, with the corrections they force on the mid-roll advice above, are in
[`references/three-run-control.md`](references/three-run-control.md).

## A native embed is not an ask, and it is the only free mention in the script

Third category, sitting under both rows above. A **native embed** is a real thing named inside the
teach because the argument arrived at it: the tool that solved the step being demonstrated, the
artefact the viewer would need to do this themselves, the community the worked example came from. It
sends the viewer nowhere and interrupts nothing, so it does not spend what an outbound ask spends
and the one-ask rule has never counted it.

**The distinction is whether the mention breaks the frame.** A viewer twelve minutes into a teach
has stopped noticing they are watching a video, and a break to a different scene, shirt or tone
wakes them up, at which point they remember they have work to do. A sentence that continues the
argument does not. So set up the block until the thing being named is the answer to the question it
just raised, and let it stay in the teach. Native embeds may appear early and may repeat; the
outbound ask may not, and is still exactly one, still in the last twenty seconds.

**Where a sponsor read cannot be made native**, it goes after the average view duration for the
channel, never before it, so the interruption lands on viewers who were leaving anyway. This is
the only placement rule in this skill that is not derived from the three-run control; it is
carried in from the Kallaway corpus and it is not control-tested. `attention-mechanics` records
the collision and why the one-ask rule survives it intact.

## Two hits before the first exit, and the eyes-closed test

Two audits, both run on the draft rather than on the analytics.

**Two usable things, early.** One non-obvious thing the viewer can go and change lands inside the
first block, a second before the average view duration. One hit and they may stay; two and they
stay, because the video has proved it holds more. A definition is not a hit: the test is whether they
can act on it today, rung 3 on `storytelling`'s literalness ladder.

**The eyes-closed test settles pacing, and nothing else does.** Play the cut with the picture off
and listen. Bored means the sentences are running long and the edit is not chopping; unable to keep
up means it is chopped past comprehension and needs breathing room put back. The page has no tempo,
so reading it finds neither. Run it on the first assembly, and the note goes to the editor as a note
about the audio.

**Reset your tolerance before you judge the cut.** After watching a take twenty times you are the
least qualified viewer it has: scroll a feed for five minutes, then watch it once through. What
reads as slow on the second pass is slow, and the correction usually lands in the first thirty
seconds. Single source, no control test: Mino, Feb 2026, `video-hooks`
`references/hook-teardown.md`, who reports cutting roughly half a finished video this way.

**One debatable question, written on purpose.** A block that leaves a genuinely contested question
open produces comment threads that argue with each other, and argument is the engagement platforms
pay for. Not a bait question addressed to the audience, which `generate-social` bans and X demotes:
a real fork in the subject that the video declines to close, said once, in the teach.

## The seam between two blocks is where they leave

A body loses people where a block finishes, because that is the moment nothing is unresolved and
the viewer remembers they have work to do. **So every seam carries a re-hook: the last beat of the
block closes it and opens the next question in the same breath**, the way a relay baton changes
hands while both runners are moving.

**The target is no stretch past 300 seconds with nothing reopened**, measured 29 Aug 2026 over 339
punctuated transcripts: the niche's median gap between loop openers is 230 seconds and its p10 is
85, so 300 is tighter than 90% of what ships. It replaces the 60-to-90-second cadence this page
carried for one day, which was one creator's unmeasured number.

**The test is to delete the transition words**: a fact or a question still standing means it was a
re-hook, and a sentence that disappears was throat-clearing. Those phrases (`here's the thing`,
`it turns out`, `the truth is`) are banned in `slop-words.js`, which 75% of the niche never uses.

The seam is the re-hook beat of `storytelling`, [`references/addiction-loop.md`](../../../content/writing/storytelling/references/addiction-loop.md),
which also carries what the block owes before it: stakes with a clock in them, and a big question
specific enough for the viewer to guess wrong at. **A body with no point where the viewer can guess
wrong is a correct list**, and a bullet outline is the cheapest place to fix that.

## Nothing here is judged by eye

```bash
python3 .claude/skills/video-script/scripts/story_metrics.py <script.json|take.txt> --duration <s> --grade
python3 .claude/skills/video-script/scripts/teardown.py <url>          # a reference video, same axes
```

`story_metrics.py --grade` returns seven rules in two tiers: **FAIL** is a banned construction or a
number outside what the niche tolerates, **WARN** is inside the niche and short of the house target.
Every threshold prints its source, three being percentiles of 627 measured videos and four doctrine.
59% of that corpus passes clean and each rule fires on 5 to 20%, which is what makes a fail mean
something, and it refuses to grade the sentence-shaped rules on an unpunctuated transcript rather
than inventing a number. What each rule is, what `teardown.py` prints, and the norms behind both:
[`references/measuring.md`](references/measuring.md).

**Then run the six story locks over the finished bullets**, one pass each: term branding, embedded
truths, thought narration, negative frames, loop openers, contrast words, in `video-hooks`,
[`references/story-locks.md`](../video-hooks/references/story-locks.md). Three land hardest on a
body. **Thought narration**: say the thought the viewer is having, in their words, from
`customer-voice` rather than guessed. **Embedded truths**: hedge the provenance, never the
instruction. **Contrast words**: split the sentences carrying the main points and turn the viewer
inside them, which is the zigzag at sentence scale.

## The script names the overlays, and only its own

The CTA shelf at `/design` carries one clip per sellable product plus the on-camera asks. Which of
them an edit needs is decided by the ask this script writes, so the script returns them by file name
in `overlays` and the concept page shows those files alone. Handing the editor the whole shelf hands
them somebody else's product, and the right clip is then missed among fifteen wrong ones.

One clip for the outbound ask, the one that names what the ask names. A subscribe, like or comment
clip only where a block actually makes that ask on camera. A name that is not on the shelf is dropped
rather than shown, because a tile that leads nowhere is a download the editor chases.

## What a series buys

One breakout, plus episodes that hold the people already captured. Six ran 17,874, 11,425, 4,144,
5,209, 960, 2,258, and episode five landed below the channel median. Front-load accordingly: episode
one is the reach event, everything after is conversion work on an audience you already have.

## The script is one of five surfaces

A recorded video is cut into five surfaces and the long-form script is only the first. What each surface takes from it and what it must not repeat: [`references/five-surfaces.md`](references/five-surfaces.md), read once the script is written and the video goes into production.

## Writing it

The bullet rule, the beat budget, the structure, the teach block that is 53% of the script, the camera-language line and the register: [`references/writing-the-script.md`](references/writing-the-script.md).

The same file holds **the argument video**, the format where there is no build to teach: the dated
chain whose every link ends on the lack that forces the next, the motif that comes back as the
answer, the caveat spent on the number in place, the fenced prediction and the close that gives
permission before the ask. Read it whenever the body is a claim about the world rather than a screen
with a click in it. Single unmeasured reference, so it is candidate craft sitting under everything
the three-run control decided.

## Before it ships

- Beat count inside 158-185, and the runtime that implies stated at the top.
- No bullet past 14 words unless the whole line is a quotation.
- Exactly one outbound ask, inside the final twenty seconds. Native embeds are not counted, and any non-native sponsor read sits after the channel's average view duration.
- Two things the viewer can act on today, the first inside the opening block and the second before the average view duration.
- The eyes-closed pass was run on the first assembly and the pacing note went to the editor.
- `story_metrics.py --grade` run, with zero fails and every warn either fixed or answered in a line.
- One point where the viewer forms a prediction and one where it breaks, with the clues already on
  screen. The six locks were run, and every hedge left in is provenance rather than instruction.
- The failure told in full, not summarised.
- Every number traced to something measured, with the artefact named for the edit.
- No arithmetic performed on camera.
- One portable idea, named in the mechanism and pointed at as each build lands, and every build
  block opening on its own one-sentence claim at a third to a half of the block.
- An argument video ran the essay checks: every history link ends on the lack that forces the next,
  any prediction block is fenced out loud, and the close gives permission before the ask.
- At least one abstraction drawn on screen rather than described.
- Every term defined the first time it is said, in objects the viewer already owns.
- One thing shown failing inside each build block, uncut.
- The dating answer present wherever the subject is a tool that ships weekly.
- One chapter per block, named for a state rather than a feature. The corpus: 78% publish chapters,
  median 7 and 3.9 per ten minutes, titled in 4 words, the first ending at 4.7% of runtime.
- `humanizer` run over the whole thing.

## Self-Healing

This skill appends new failure modes to `references/learned-patterns.md` after each
run, newest last. A finding that turns out to be stale gets corrected here in the
same session, along with the generator's own copy of the rule if it enforces one.
