---
name: video-script
description: "Picks what to film and writes the words: long-form body, hook, or a Short filed in CutKit. Use on 'what should I make next', 'script this', 'write a hook', 'create a short' or a script that runs long."
tags: [writes, video, youtube]
lane: judgment
---

# Video Script

The skill has 4 branches on one trunk. What to make next (the 6 pipes, the 4 gates, remix and the share test) is `references/choosing-ideas.md`, and the topic needs a seed before any branch starts. A hook (a Short's 1-3s window, long-form's 30s open) is `references/video-hooks.md`, with the shape bank and hook diagnosis in `references/hook-library.md`. A whole Short, scripted, filed into CutKit and handed over with its on-screen visuals built, is `references/shorts-script.md`. The long-form body is the rest of this file. Nothing ships until every fact under it is true, the feed evidence is fresh and the voice pass has run.

## The trunk

**1. Anchor.** The author, 4 Oct 2026: "I need to stay humble and copy before I become good." Pick one competitor video on the subject that beat its own channel (`scripts/top-band.mjs` for a Short, `references/choosing-ideas.md` pipes 1 to 3 for long-form) and put its transcript beside the draft. Match its moves beat for beat (where it names the tool, where it counts, how long a step runs, where it asks) and swap in his substance and proof, never its words. The Sofiane batch had 40,000 words of rules behind 130-word scripts and no anchor, and came out unreadable.
Done when the brief names the anchor with its breakout and URL.

**2. Feed evidence.** Read `community`'s `references/engagement-what-works.md` before drafting. It scores competitor posts against each account's own median and carries its measurement date. It says what the feed rewards, never what's good; the bans in `@heyramzi/lint` and `humanizer` outrank every number on it.
Over 30 days old, collect the feed again before trusting the page.
Done when the page is under 30 days old or was refreshed.

**3. True before written.** Go as hard as you like on the mechanism, but a number nobody measured, a story that didn't happen or a stake that doesn't exist isn't available on any branch. Invented drama also reads generic, since a model reaching for stakes reaches for the average ones. Proof frame: `references/video-hooks.md`.

**4. 6 story locks** over the finished bullets, one pass each, no beat moving: `references/story-locks.md`. On a body, 3 land hardest: thought narration, embedded truths and contrast words. They buy retention, not reach (the best held in 9 of 13 channels, a coin). Cap the negation pivot ("it's not a project, it's a wish") at one per script, short and concrete; several in 90 seconds is the loudest sign a machine wrote it.

**5. Cold read.** Give the finished script to a fresh Haiku subagent with no context, as a stranger hearing it once. It names the action with its tools, says whether it could do it tonight and who it'd send it to, and quotes its hardest sentence. Rewrite whatever it can't name. It reads and never writes. On 4 Oct it rated old S12 3/5 and quoted the sentence the author had flagged (CutKit gave B-), and the rewrite 5/5. It tests whether people understand you, not reach (a 66x breakout got 2/5 because it shows its code on screen), so the anchor decides structure. Done when it names the action and a re-read passes.

**6. Voice.** `humanizer` runs over the finished script before anyone reads it on camera, after opening `voice-measured.md`. Count first-person pronouns first: zero on a hook; `references/writing-the-script.md` says where a few are allowed in a body. Done when `npx heyramzi-slop <file>` exits 0.

## The long-form body

**Opens on why.** The author, 19 Sep 2026: "We always should start with why when we record a video." The first block after the cold open is the why: what's still true for them in a year if they skip this. The fear has to be already true, the viewer is the hero and you're the mentor, and emotion is spent only in the why, the stakes and the close of the proof. `reviewScript` fails a body that opens on anything else, and any block where first-person pronouns outnumber second-person. Beat sheet, structure, teach-block rules and the argument-video variant: `references/writing-the-script.md`, read before the beat sheet.

**Decide the subject on a number.** The SERP decides if a subject is worth a recording day, alone. 2 lanes open: the unserved query and the stale head. Commands, thresholds and the quarantined keyword report: `references/three-run-control.md`, last section. Never take the runtime off the SERP.

**Runtime, beats and asks are measured.** 158 to 185 beats (about 19 minutes), one outbound ask in the last 20 seconds and the viewer's own failure told in full. Evidence and the 3 ask categories: `references/three-run-control.md`, read when a script runs long or an ask placement is argued.

**Series buy reach once.** Episode one is the reach event, later ones convert the audience it captured. 6 ran 17,874, 11,425, 4,144, 5,209, 960 and 2,258. Front-load accordingly.

## Storing the script

A video has exactly one script and it lives on its record. Saving it runs the arithmetic half of this page: beats against floor and ceiling, a word cap per beat, a why block first, second person outnumbering first in every block, one action in the ask, no throat-clearing transition, a visible state change ending each block. Change one and change the other in the same session. Slop and an off-register take are refused on save.
 A script failing the arithmetic still stores, because 300 words over is easier to trim than to lose.

A build video carries its prompts. A block's `prompts` is a list of `{ step, prompt }` pairs in the order pasted into Claude, each adding one thing to what the last built.

A take too long for one sitting is recorded in parts. Set `part` (1, 2, 3) on each block, and each part ships as its own upload. The author, 24 Sep 2026, on the Claude Code course: 3 parts, "because it would be super long otherwise."

The description is stored with the script, before the take. Write the composer's plan (asks, contents line, chapters from `startsAt`, `durationSeconds`, plus `part` and `title` for a split video) and store `{"description": [...]}` through `concepts set <id> --metadata-file`. The rules are in `youtube`'s `references/description-block.md`, and `heyramzi-slop` runs over it.

`overlays` names only this script's CTA clips: one for the outbound ask, plus subscribe, like or comment only where a block makes that ask on camera. Check each name against the CTA shelf at `/design` before storing, because a name not on it is dropped silently.

The other 4 surfaces (ClickUp task, board fields, Descript project, calendar row) are in `references/five-surfaces.md`, read once the video goes into production.

Done when the save returns no `problems` and the overlay names exist on the shelf.

## Before it ships

- Beats inside 158 to 185, with the runtime stated at the top and no bullet past 25 words unless quoted.
- `python3 .claude/skills/video-script/scripts/story_metrics.py <script.json|take.txt> --duration <s> --grade` shows zero fails; every warn fixed or answered in a line. Thresholds and what `teardown.py` prints: `references/story-locks.md`.
- The 4 draft audits ran (2 usable things early, eyes-closed pass, tolerance reset and one debatable question) and the 6 locks too.
- The failure told in full, every number traced to something measured, and no arithmetic on camera.
- One portable idea named in the mechanism and pointed at as each build lands; an abstraction drawn on screen; a failure shown uncut in each build.
- One chapter per block, named for a state (78% of the corpus publish chapters, median 7, titled in 4 words, the first ending at 4.7% of runtime).
- `pnpm jev loop short` and `pnpm jev score opening` are hints only: the opening model failed its held-out test and the Shorts grader didn't track breakout on 20 competitor Shorts (rank correlation -0.06). The loop: `vibe-kit/ai-doc/references/content-grade.md`.

Done when `humanizer` ran over the whole thing and `concepts script` stored it.

## Learned Patterns

Failure modes live in `references/learned-patterns.md`, newest first. Correct a stale finding here in the same session,
