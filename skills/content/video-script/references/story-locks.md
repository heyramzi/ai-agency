# Story locks, and measuring a script

6 sentence-level word swaps: walk a finished script once per lock and it tightens without a beat moving. They apply to a Short, a long-form body and a post. The structure is [storytelling](~/Studio/vibe-kit/ai-doc/references/storytelling.md)'s ([addiction-loop](~/Studio/vibe-kit/ai-doc/references/storytelling/addiction-loop.md)). Contrast is the engine under the other 5 (lock 6), so if only one pass is affordable, run that one. 2 locks collide with registry rules, and the registry wins: the hedge rule (2) and the banned phrase bank (5).

## 1. Term branding

Naming a concept makes it a thing (the labeling effect) and an unfamiliar name opens a small question. A name isn't a factual claim, but naming a method nobody has run is. Name a contrarian idea or a real framework, never a list step: 3 names per Short is a glossary. The name must be concrete enough to point at in the recap and carry the CTA.

## 2. Embedded truths

A hedge is a fork: "if you try this" hands the viewer a decision, and every `maybe`, `might`, `could`, `probably`, `some people` is an exit door.

| Hedged | Embedded |
| --- | --- |
| This might work because... | The reason this works is... |
| Some agencies could be making this mistake | The mistake most agencies make is this |
| It could be worth trying | Do this first |

> **Hedge the provenance of a claim. Never hedge the instruction.**

"This is one channel with no control band, so treat it as a hypothesis" is provenance and required, said once where the number lands. "This might help you a bit" is an instruction with the confidence removed.

## 3. Thought narration

Say what the viewer's thinking, in their words, before they act on it: "You're probably thinking this only works if you already have a team." They conclude you know the subject and now need your answer to their question. It's the strongest form of "every I is a you". Harvest the thought from `conversion` (367 calls); a guessed one that misses reads worse than none. After a major point or at a transition, a few times per video; every block makes it a tic. On a Short it's the objection sentence (`shorts-structures.md`, step 2b), once, right after the method is named.

## 4. Negative frames

People are about twice as motivated to avoid a loss (Kahneman and Tversky, 1979). Flip the point: "Here's how to grow on YouTube" becomes "This is what's killing your YouTube growth"; "Use this hook format" becomes "Stop writing your hooks like this". Softer: "you're making this harder than it has to be". A negative frame isn't a negation pivot (it warns of a real cost), and the mistake must cost something real. Otherwise the script is all warnings, a fear register `humanizer` rejects.

## 5. Loop openers

Attention runs out at every section boundary. A loop opener closes the block and opens the next question in one breath.

The source teaches one every 20 to 30 seconds on a Short and every 60 to 90 on long-form. Measured 29 Aug 2026 on 339 punctuated long-form transcripts, the niche median gap is 230 seconds (p10 85, p75 377). The house target is no stretch past 300 seconds, and the grader fails only past 831. On a Short the ~25-second flip stands, unmeasured.

The phrase bank collides with this lock. `here's the thing`, `it turns out`, `here's the problem`, `the truth is` are throat-clearing in `vibe-kit/packages/lint/data/slop-words.js`, and "here is what nobody talks about" is `the-part-nobody`. The ban catches the version of the move that carries no information.

> **Delete the transition. A question or fact still standing was a re-hook; if the sentence disappears, it was throat-clearing.**

"And this is where it gets crazy" fails. "That fixes the reporting, and it's also what broke the invoicing 2 weeks later" passes. Legal openers name the next question: "Which would have worked, except the client had already signed." The question opened here gets answered in the block that follows, so never leave it for the next video.

## 6. Contrast words

`but` is strongest; `actually` says the first belief was wrong, `instead` redirects, `except` carves out the case that breaks the rule, `yet` holds 2 things that shouldn't both be true. On the finished draft, **split each main-point sentence in half: lean one way, then turn.** Not "the team saves 4 hours a week" but "the team saves 4 hours a week, and the agency that installed it lost 6 to the training."

- Main points only; overused, `but` reads as friction.
- `it turns out` is banned by the slop list; the other 5 are ordinary English.
- "Not X, but Y" is still the negation pivot (cap in `video-hooks.md`), and this lock is the commonest way a draft grows a second one.
- Don't chase `contrastSentencePct` with one construction. 6 beats got "instead of" and `heyramzi-slop` flagged it as a review pivot 6 times (9 Sep 2026). Spread it across but, yet, although, whereas, except, and run the slop linter after the grader.

## The measured results

All 6, over 627 videos on 13 channels, winner band against control inside each channel (29 Aug 2026). A sign test clears at 10 of 13. Term branding held in 7 of 13, embedded truths 9 of 13 (nearest, and it points at less hedging in winners), thought narration 6 of 13, negative frames 5 of 12, loop openers 7 of 13, contrast words 6 of 10. **None is a reach lever**, so they buy retention only. 4 of 6 are unused in the niche (the median video has zero term brands, thought narration and negative frames), and 75% of the niche never uses a banned throat-clearing transition.
 A fixed phrase list has bounded recall, so every count is a floor.

Source: Kallaway, "Say This in Your Videos, It'll Improve Your Storytelling by 10x", `https://www.youtube.com/watch?v=pcnrzBwoVUk`. One practitioner, no control band, his register rejected by `humanizer` even where the mechanic is kept.

## Measuring a script: `story_metrics.py`

```bash
python3 .claude/skills/video-script/scripts/story_metrics.py <script.json|take.txt> --duration <s> --grade
python3 .claude/skills/video-script/scripts/teardown.py <url> [--cuts] [--json]   # a reference video, same axes
```

It reads a transcript, a stored competitor `.json` with `fullText`, or a script `.json` with `blocks`. **FAIL** is a banned construction or a number outside the niche; **WARN** is inside the niche and short of the house target. 59% of the corpus passes clean and each rule fires on 5 to 20%, so a fail means something. A single-tier gate on house targets alone failed 90% of 627 videos, which says nothing.

| Rule | Warn | Fail | Source |
| --- | --- | --- | --- |
| `throatClearing` | > 0 | > 0 | house; niche p75 is 0 |
| `emptyRehooks` | > 0 | > 1 | house |
| `negationPivots` | > 1 | > 3 | house; niche p75 0.18 per 1k words |
| `hedgesOnInstructionPer1k` | > 3.23 | > 5.74 | corpus p75 / p90 |
| `longestGapSeconds` | > 300 | > 831 | house / corpus p75 |
| `contrastSentencePct` | < 10.8 | < 8.8 | corpus p25 / p10 |
| `triadComplete` | false | never | house; niche p90 is 0 |

- A re-hook is a construction: `REHOOK` matches phrases like *which means the*, *watch what happens*, *the moment you*, *but here's*, and the contraction is load-bearing (*but here is* scores nothing). Put a digit or capitalised noun in the sentence so `carries_fact` passes. Re-grade after every edit; the gap, contrast and triad rules each move the other two.
- It prints `n/a` on an unpunctuated transcript (288 of 627 come back from yt-dlp with no punctuation), and withholds ask counts outside English. It can't tell a hedge from a quoted hedge: read a WARN as "look here". Norms are in `scripts/story-norms.json`, regenerated by the corpus pass; it falls back to house numbers without the file.
- `teardown.py` prints words, runtime, wpm, the first 30 seconds, where the first number lands, every ask with position, chapters, and cuts per minute. It shows what somebody got away with, never what works. Steal one move and take the governing number from `SKILL.md`.

## 4 audits on the draft

Give the viewer 2 usable things early: one thing they can change tonight in the first block, and a second before the average view duration. A definition isn't one.

Run the eyes-closed test for pacing. Play the cut with the picture off. Bored means sentences run long and the edit isn't chopping; can't keep up means it's chopped past comprehension. Run it on the first assembly and send the note to the editor.

Reset your tolerance before judging a cut. After 20 watches you're its worst viewer, so scroll a feed for 5 minutes and watch once. A cut that reads slow then is slow (Mino, Feb 2026).

Ask one debatable question on purpose. It's a real fork that the video declines to close, said once in the teach. It isn't bait, which X demotes (see `social` and `references/writing-posts.md`).

The seam between blocks is where they leave. The re-hook is lock 5; what the block owes first is [storytelling](~/Studio/vibe-kit/ai-doc/references/storytelling.md)'s: stakes with a clock and a big question specific enough to guess wrong at. A body where the viewer can't guess wrong is a correct list. On a counted list the last seam is a demotion, paid for in the outline.

Done when each lock ran once, `story_metrics.py --grade` shows zero fails, and every remaining warn is fixed or answered in one line.
