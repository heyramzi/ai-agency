# The checks: doctrine, strategy, the writing score, the export gate

## Contents

[Doctrine checks](#doctrine-checks), [Strategy checks](#strategy-checks),
[The writing score, out of 10](#the-writing-score-out-of-10), [The local cut checks](#the-local-cut-checks),
[The export gate](#the-export-gate)

A check returns `pass`, `fail` or `n/a`, and a `fail` names its source file. A check that can't name its source is an opinion and stays out of the report. Open this when coaching a take (the first 3 sections), after any local cut, and before any export (the last).

## Doctrine checks

Did the take obey the rules the script was written under? Source: `video-script` and a 3-run control read off one channel that shipped the same argument 3 ways.

- D1. One outbound ask, in the last 20 seconds. Outbound means buy, book, download, link, join (subscribe, like, comment don't count and may come early). Fail on more than one, on one before the final 2% of runtime, or on a close offering 2 actions (2 convert neither). The losing control run asked at 11% and lost 3 to 5x. It runs before the word count.
- D2. The failure told in full. The founder's own: the specific agency, the number and the night. Fail if it's one line, or only somebody else's, or the viewer can't see themselves in it (a credential or good week is the ego cut D9 removes). `n/a` with no failure block, worth a line under "Also seen".
- D3. No arithmetic on camera. Show the number and its artefact, never derive it (90 s of it only in the losing run). Fail on any figure computed aloud from others.
- D4. Every build block ends on a visible state change. Compare each delivered block against its planned `endsOn`; fail on a block ending on a summary with nothing changed on screen.
- D5. Camera language outside, mechanics inside (`video-script`, `~/Studio/vibe-kit/ai-doc/skills/content/video/video-script/references/writing-the-script.md`). Fail if a mechanic is named in the cold open, stakes or ask.
- D6. Every number has an artefact. Fail on a figure spoken with no proof named or shown; one invented figure costs the position.
- D7. Runtime and word budget. 3,600 to 4,200 words at 190 to 200 wpm is about 19 minutes (beat 29 in the control). Fail over 4,500 *delivered* words, after retakes are discounted; report raw and discounted separately, judge the discounted.
- D8. The hook is the planned hook. The first 30 seconds are `video-script`'s hook branch, wording load-bearing. Fail if the quoted cold-open lines were paraphrased; `n/a` if a different hook was kept (say which shipped).
- D9. First person at zero. Count I, I'm, I'll, I've, my, mine, me, we, our against you, your, yourself. 4 Shorts (20 Aug 2026) measured 12 against 63, and 2 had a literal zero. `take-stats.py` returns `firstPerson`, `secondPerson`, `firstPersonHits` (each with the sentence to rewrite) and `firstPersonInOpen`. Fail on first person outside 4 jobs (a hedge on his own number, the DM ask, an assignment, a line somebody else said, plus D2's failure block), and on any in the open (first 30 s long-form, first sentence of a Short). Quote the worst and write the "you" sentence. Source: `humanizer` "On camera, every I is a you"; 20 Aug 2026: "People don't care about me. Every I should be a you."
- D10. The story gate (computed, not read): `python3 .claude/skills/video-script/scripts/story_metrics.py transcript.txt --duration <seconds> --grade` returns 7 rules, each with the breaking sentence and its percentile over 627 videos. Fail on every FAIL row (banned throat-clearing, a re-hook with no fact across the seam, over 3 negation pivots, hedging above corpus p90, 831 s with no question reopened, contrast below p10). WARN goes under "Also seen". `n/a` when the transcript has no punctuation (yt-dlp captions; Descript exports are punctuated). Quote the printed sentence, never the count alone. Rules: `~/Studio/vibe-kit/ai-doc/skills/content/video/video-script/references/story-locks.md`; corpus.
. None of these axes separated a winner from a control, so a fail is a retention finding, never a reach one: say so in the report.

`take-stats.py`'s word lists and all of `story_metrics.py`'s pattern lists are English-only: on a French take they read false-zero passes (10 Sep 2026).

## Strategy checks

Source: the competitor dossiers, the findings that replicated across channels.

- S1. The title names a specific product, never a category word ("AI", "systems", "automation"). 6 channels agree. `jordan-ross.html` (1.93x vs 1.22x), `liam-ottley.html` (1.61x vs 0.90x, n=264), `chase-ai.html` (0.61x penalty for naming none).
- S2. The artefact is the subject of the frame: a face beside the tool is fine, but a face in place of it fails. Fail if the concept's thumbnail has no artefact. `ross-harkness.html` (24 videos, zero overlap between face and no-face bands), corrected by `liam-ottley.html`.
- S3. It teaches a build (the largest effect; separates a 7.7x asset from a long video). Fail if it explains running an agency and doesn't build the thing on screen. `liam-ottley.html` (938 views/day instructional vs 82, 53, 241), `michele-torti.html` (tool courses 1,487 vs agency-business 83).
- S4. No money-claim framing: 0.90x on Ottley, 1.29x on Abdaal who sells an aspirational life to a general audience; ours isn't that category. Fail if title or thumbnail leads on revenue.
- S5. A promise the viewer can picture reaching next quarter: $20,000 beat $100,000 by about 2x age-adjusted (Matt Gray: 11x on an age framing). Fail if it addresses the arrived. Source: the 3-run control dossier, one more channel.
- S6. Length isn't the variable. Never recommend "longer" or "shorter" alone (Ottley's 60-minute cliff is the annual flagship; 10 to 60 minutes sits within 15% of his median). Never fails a video; it stops the report inventing a length note.

**Deliberately not checked:** hook craft (5 channels, a 232x range on identical openings: hooks govern whether people stay, never how many arrive, so "your hook was weak" has no evidence), cadence (a floor, see `~/Studio/vibe-kit/ai-doc/skills/content/video/video-script/references/shorts-structures.md`), Shorts.

## The writing score, out of 10

One number on the front of the report so the ledger shows a line moving. **It scores the writing, never the delivery** (restarts, truncations, filler, pace are excluded: the edit removes them, so counting them punishes one fault twice). 10 lines at **1, 0.5 or 0** each, each naming its evidence (the sentence that earned or lost it; W7 to W9 the measurement or the absence). A line you can't evidence is unscored, and the total prints over the scored count. Print `x.x / 10` unrounded with the 10 lines (3.0 and 3.5 are different recordings).

| # | Line | 1 | 0.5 | 0 |
| --- | --- | --- | --- | --- |
| W1 | Own failure in full (D2) | specific agency, number, night, viewer living it | one line | absent or someone else's |
| W1b | First person at zero (D9) | zero, or survivors do the 4 jobs | one stray | opener, credential or process about the speaker |
| W2 | One outbound ask, last 20 s (D1) | one, in window, one action | drifted early | 2 asks or 2 actions |
| W3 | Every number has an artefact (D6) | all | one floats | only vague quantifiers |
| W4 | No arithmetic (D3) | none | one aside | sustained calculation |
| W5 | Blocks end on a state change (D4) | every one | over half | end on sentences |
| W6 | Camera outside, mechanics inside (D5) | clean | one leak | mechanics in stakes or ask |
| W7 | Word budget (D7) | 3,600-4,200 delivered | within 15% | outside |
| W8 | The proof block exists | artefact doing the thing, 2 configurations from one input | a screenshot | nothing |
| W9 | The honest limit exists | who this doesn't fit, said plainly | hedged | nothing |
| W10 | The story gate (D10) | zero FAIL | one FAIL or 3+ WARN | 2+ FAIL |

W1 to W7 read straight off the doctrine verdicts so the score can't disagree with the table. W1b shares W1's point (half failure, half count). W8 and W9 are structural and the 2 most often missing: a tour scoring 3 can reach 5 without changing a word it has, say so. W10 is computed (it was a judged "register" line 2 reviewers scored 2 ways); the denominator stays 10 so `writingScore` stays comparable, and `humanizer` audits register separately.

## The local cut checks

- `editor-os verify <name>` transcribes what the render plays and flags a repeated line, a long pause
  or a Short over length. Run it before you say a cut is clean. It's the only check word times can't fool.
- `editor-os cutcheck <name>` waits for the draft and the check the studio runs on it after every
  render: speech with no words, a pop, a cut inside a word, length, and loudness on a final. It also
  fails on what the shelf shows from edit.json alone (a layout and its overlay apart, a scene held past
  6s, a hook title on a layout that draws none or a Title scene under 1s), so a PASS means the shelf
  is clean. It blocks while the draft renders, up to 15 minutes, so don't poll it. Every run saves
  `.check/frames.png`, a frame at 0.5s and at each scene and overlay: open it every time. Each
  failing cut also gets a filmstrip PNG for a visual jump or a hidden caption, which no number
  catches. Fix, save once, and check again. After 3 tries that still fail, stop and tell the person
  which cuts and why, in plain words. They only polish, so they never see a draft that failed.

## The export gate

Before export, on every video:

```bash
pnpm descript settings <project> [composition]    # settings 1-13 below, then the faults; exits red while one is left
pnpm descript settings after.json                 # or a document saved by `doc --out`
```

**Audio** (Select All scenes, every time; per scene you fix it 4 times and miss the 5th): (1) Studio Sound on, 50% (60-70% only if muffled, above sounds like a phone call); (2) Lower other audio on, volume 10%; (3) word gaps over 0.7 s down to 0.3 s; (4) one live track, the microphone, every other muted AND out of the script (a muted track still in the script comes back at export).

**Face** (same numbers on CAM and CAM GS, on every card: Descript shows one layer's panel at a time, so the card before can carry a default nobody touched; the CRM cut had default Uplighting on four): (5) Uplighting strength 10%, foreground 50%, background 0%; (6) skin smoothing 10%; (7) blur speaker background one value everywhere; (8) color adjustments None (a grade belongs to the shoot); (9) green screen on for CAM GS, off for CAM.

**Green screen stack:** (10) CAM GS on top, text or shape under, CAM at the back (index 0 is nearest the viewer); (11) CAM GS in CAM's box: `pnpm descript layer copy <p> <comp> <card> <layer> --to all`, never eyeballed; (12) no leftover duplicate cameras (a restamp switches the old one off and leaves it: 3 restamps leave 3 hidden cameras). The twin must sit on CAM's clock to half a frame: `tracks` gates it, `track shift <project> "CAM GS" --to CAM` repairs it ([projects-and-media.md](projects-and-media.md)).

**Frame and finish:** (13) frame 1920x1080 or larger (and read `videoMetadata` before any export: a 1280x720 canvas threw away a 4K take); (14) smart transition in and out wherever the shot changes; (15) names spelled right (ClickUp); (16) watch the whole video once with sound. **Update the captions before EVERY export and before each platform render** (a cut moves every word; the caption layer keeps old text and timings; YouTube and TikTok are separate exports). A cut's length comes off `layout cards` or the last timecode, never the music bed's seconds (the bed is 181 s under a 2:21 cut).

| Setting | The value | In the document |
| --- | --- | --- |
| Studio Sound | on, **50%** | `mediaRefs[].audio.speechEnhanceEnabled` + `studioSoundIntensity` |
| Lower other audio | on, **10%** | `compositions[].duckingParameters.gainReductionAmount` |
| Shorten word gaps | applied, over 0.7 to 0.3 | `compositions[].features.shorten_word_gaps` |
| Uplighting | **10% / 50% / 0%** | `com.descript.uplighting`, first 3 numbers |
| Skin smoothing | **10%** | `com.descript.skinSmoothing[0]` |
| Blur speaker background | one reading on every card | `com.descript.backgroundBlur[0]` |
| Color adjustments | None | `com.descript.colorAdjustments`, 9 zeros |
| Green screen | on for `CAM GS`, off for `CAM` | `com.descript.backgroundRemoval` |
| Layer order | twin, graphic, camera | `cards[].layers[]`, 0 nearest |
| Frame | 1920x1080 or larger | `compositions[].videoMetadata` |

Studio sound sits near 50%, other audio stays low, and the green screen and the regular screen share the same uplighting and skin-smoothing settings.
A percentage is a number and never a taste: one b-roll clip at 70% is a fault, and cards differing on one look row read as "the face flickers", so the gate compares twins card by card. Shadow, Border and corner radius belong to the layout and are held to nothing.

The command can't see the key itself (a clean edge on a busy frame is a look), the captions, chapters and end card; the cut's checks are in [cutting.md](cutting.md). Repairs:

```bash
pnpm descript studio <p> <track|media> --on --intensity 0.5      # Studio Sound
pnpm descript gaps close <p> <comp> --over 0.7 --keep 0.3 --edges
pnpm descript layer effect <p> <comp> <card> <layer> uplighting --value "[0.1,0.5,0,0.05,-0.05,0]"
pnpm descript layer copy <p> <comp> <card> <layer> --to all      # one look onto every card
pnpm descript layer set <p> <comp> <card> <layer> --to 0         # stack position, 0 is top
pnpm descript layer sweep <p> <comp>                             # hidden duplicate cameras
pnpm descript resize <p> <comp> 1920x1080
pnpm descript track mute <p> <track>                             # leave one live track
```

Lower other audio has no verb: set it once per composition on All scenes in the app.

- The SRT is the timecode to trust. The markdown transcript with `timecodes.on_paragraphs` drifts late (0 s at the open, 58 s by 5:30 on a 24:57 cut); `layout cards` agrees with the SRT.
