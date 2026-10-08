# Cutting a take: coach, cut, reorder, close the air

## Contents

[Coach first, long-form only](#coach-first-long-form-only), [The CLI cuts](#the-cli-cuts),
[The cut list](#the-cut-list), [Reorder](#reorder), [Close the air, last](#close-the-air-last),
[Done when](#done-when), [The coach's 9 steps](#the-coachs-9-steps)

Open this for passes 1 to 3: before the cut (coaching), the cut itself, reordering, and the gaps. Dressing the cut (shots, layouts) is [sequencing.md](sequencing.md) and [layouts.md](layouts.md).

## Coach first, long-form only

The raw take is the only moment the evidence of how the speaker records still exists (restarts, abandoned openings, a block he talked himself out of). Cut first and it's gone. A Short skips this: it's one argument.

It answers one question: **what should be different in the next recording?** It doesn't grade fidelity to the script (a take that leaves the page is often the strongest), and it isn't a cut list. Drift counts only when it cost something measurable: a promise never paid, an ask moved out of the last 20 seconds, a number with no artefact, a block that ended on a sentence while the board stayed the same.

- The report leads with exactly one habit, with the seconds it cost here and where it last appeared. 8 notes get read once and change nothing; one habit is checkable on the next video. The rest goes under "Also seen", unranked.
- Listen with the picture off, once. Bored means long sentences and flat delivery (next take: shorter sentences, energy on the verbs). Can't keep up means he compresses past comprehension (leave air after each number and term). Watching hides both.
- Workflow: find the concept, read the plan, read the raw take, measure, align plan to take, run the checks, score the writing, write the ledger row, render the page, open it. Commands: "The coach's 9 steps" below. Never `POST` the plan endpoint; no number in the report is estimated.
- Page order: last time's habit and whether it's fixed; writing score x.x/10 with 10 lines and quotes; the one thing; the take in numbers; plan against take (planned, delivered, verdict); what the drift cost ("nothing" is a good result); strategy checks with sources; also seen. Checks and score: [checks.md](checks.md).
- A dropped block isn't a fault (half were dropped for a better route; ask what depended on it). **Restarts are a cost in seconds and say nothing about quality** (40 restarts and a clean argument beats 4 and a muddle); they only become the one thing when they cluster on one block across 2 recordings, which is preparation. Then prescribe a recovery move, never "prepare more": open on the one-sentence line `video-script` asks for and come back to it. First run: 74 spans, 19:46 of 56:38 (34.9%) off a plan 1,100 words under its floor. Source: Joseph Tsar, `How To Never Ramble When You Speak`, 31 Aug 2026, unmeasured.
- Score from the table, never beside it (7 of 10 lines are doctrine checks), and check the ask placement before the word count: the ask rule beat it 3 to 5x.

## The CLI cuts

The CLI needs no AI credits, clipboard or browser.

```bash
cd <the CLI directory>
pnpm descript script <project> <comp>                 # script with cuts, speeds, cards, markers
pnpm descript cut <project> <comp> --from "<words>" [--to "<words>"] [--in "<paragraph>"] [--nth N] --dry
pnpm descript restore <project> <comp> "<cut words>"
pnpm descript speed <project> <comp> 1.1 --from "<words>"
pnpm descript verify <project>                        # open it and prove it still draws
pnpm descript undo <project> [steps]
```

A cut splits the paragraph; the removed half carries `isBlocked: true` (struck through, reversible), snapped to word boundaries off the alignment. `--dry` prints seconds and words and is a word-level clock the SRT lacks (use it for a clip's landings, never character interpolation).

- The needle matches case-insensitively as a SUBSTRING (`--from "So"` lands inside `also`): the `text:` each step prints is the only proof. A repeating needle is refused (`euh` in 14 paragraphs needs `--in`); `--in` narrows and stops, so `--nth` picks which (without it a filler loop converges at ~60% and looks finished). A needle can't cross a paragraph break (put `\n` where one sits), can't start with `, ` (the gate refuses "holds 1 word(s) its seconds do not": start at the space before the word), and can't cut a stub glued to its word (`G-it's`: leave it). A whole-paragraph cut needs the tau's full text, newlines included.
- ANY editor tab open merges its copy back over your writes, and the reverted document reads healthy (42 cuts read back right and were all live on the next dump). Ask for the project closed, then prove it on a FRESH dump: `pnpm descript doc <project> --out after.json; python3 scripts/prove_cuts.py after.json needles.json` (exits 1 while a needle is live). After any `--anyway` write, recount the struck spans.
- Repair the alignment before the cut, or the cut is fiction. A transcript can carry right words over wrong times (FC38: 4,334 of 7,014 words under 11 ms). Pass 1 there reported 0.05 to 0.2 s for 30-character spans; repaired, 100 needles read a median 5.6 s, 668 s total. A cut whose seconds don't match its words is the alarm. A duration drop much larger than the characters cut means missing content.
- After `gaps close`, a needle can't cross the tau splits it made: write a second batch as per-tau pieces with `in` on any needle under 60 characters. **Cutting after stamping strands every card whose anchor tau the cut blocks** (25, both CTAs; `layout cards` prints `-`; only `--split` places a new live card). Cut first.
- No verb for it? The clipboard carries the edit and ships Ignores: [descript-cli.md](descript-cli.md). A pass the CLI can't do is a verb to write.

## The cut list

The author, 8 Sep 2026: "a 1st pass with a Python script that's deterministic and a 2nd pass with AI that's a little bit more interpretative. Kind of like the real editing workflow." Both run on every take, whoever cut pass 1: a take with only pass 1 done isn't part-done, the expensive half hasn't started.

### Pass 1: the wreckage (mechanical)

```bash
python3 scripts/candidates.py doc.json --comp "<name>"       # every candidate
python3 scripts/candidates.py doc.json --check needles.json  # what the list doesn't cover
```

Reports **repeat runs** (any 3-word run twice within 400 characters) and **truncation marks** (`--`, `...`, stumps of 1 to 3 letters).

- The last attempt is the keep, always. The author, 11 Sep 2026: "it never takes the last retake ... always use the last retake." Span runs from the first attempt to the START of the last; a stump isn't an attempt, so the span stops at the last COMPLETE one. **Never splice one attempt's head onto another's tail** (FC38 shipped attempt 2's head on attempt 4's tail, 3 paragraphs cut, sentence still wrong).
- Search the JOINED script, never block by block: Descript breaks at the pause before a restart, so the restart sits in the next paragraph (FC38's 41k characters: 99 repeat runs vs 40, 37 crossing a break). A span over 3 paragraphs is 3 needles; `--check` subtracts every needle from each block and prints what's live.
- Every candidate is a needle or a one-word dismissal. On M0 L1 the shipped list left 16 uncovered, and 10 of those were real (a 4-attempt opening, `This is not a sales pitch` 6 times). Dismiss anaphora and deliberate emphasis. Dismiss lists that share an opener too. Leave small stutters (`s- `, `add-- `) whose clean needle is ambiguous.
- A candidate list handed over as needles cuts lists as retakes (187 of 317 joins broke). Claude reads it and writes a `cutspec.py` spec (`--help` has the method), then `seams.py` reads every join. **Merge candidate SPANS before writing needles**: a truncation's `at` is the mark, its text starts ~60 characters earlier, so overlapping candidates have distinct `at`s and the second needle dies on "No live script match".
- A sweep that cuts a false start can take the connector the good take needed ("s'adapter modèle le plus optimisé"): `restore`, then a second `cut` inside the restored words.
- Glossary: `--typos` (`scripts/typos.example.json`; the internal list is `typos.internal.json`) fixes product names (`Hyper Frame` to `HyperFrames` and `Cloud Code` to `Claude Code`). **A key that's an ordinary word rewrites correct speech** (`"ski": "skill"`, `"School": "Skool"`, both pulled the day written): test new keys on ordinary prose.

### Pass 2: the meaning (read, dispatched)

Delete the sentence, read its 2 neighbours, name what the viewer lost; nothing lost is a cut. A digression is well-formed, so no score finds it. Dispatch one Sonnet subagent over the WHOLE live script (a callback over a split is invisible), reporting **50 paragraphs at a time** so each chunk is applied while it reads on (The author, 23 Sep 2026, after 18 silent minutes on 308 paragraphs: "its job should be recursive").

What goes: **announcements** ("If you see yourself in one of these bullet points..."; not when it cues a visual), **second utterances of one idea** (keep the strongest), **hedges and disclaimers** (once is positioning), **digressions** (rationale that justifies a choice stays), and **the speaker** (every sentence whose subject is the person on camera: write the viewer sentence carrying the same information; none exists, cut it). `restate.py` is the backstop that runs after the pass (`python3 scripts/restate.py doc.json --check needles.json`; the author, 8 Sep 2026: "Here I've repeated myself twice"). A flag points at a paragraph and gives no verdict on a sentence: read it down to the clause (one steering way is the teaching, two is padding, the simile padding on the padding). List every pass-2 cut in the run report.

**The brief, verbatim.** Write live paragraphs to a text file, one per line prefixed `[<index>] `, newlines inside shown as ` ⏎ ` (`restate.py` shares the loader). Put this above the block: *Read the whole file first, then for each 50 paragraphs append ONE line holding that chunk's JSON array to `<dir>/proposal.jsonl` and print `CHUNK <n>`. Print `DONE` after the last.* Then:

```text
Read `<path>`. It's the surviving script of a finished video, one paragraph per line, each prefixed with its index in square brackets; ` ⏎ ` marks a newline inside a paragraph. Your job is the CLAUSE-level digression pass: earlier passes removed stutters, restarts, filler and restated sentences; what's left is clean prose with dead weight inside sentences. THE TEST, per clause: delete it, read what remains, name what the viewer lost; nothing lost is a cut.

Remove: (1) a second example of one idea ("by mentioning in a comment or just chatting with the agent as if you're chatting with a human": one way is the teaching, the simile is padding on padding; find every sibling); (2) a simile or restatement tacked onto a complete clause ("exactly like your company members", "think of it as..."); (3) trailing vagueness ("and stuff", "or whatever", "and so on"); (4) a hedge inside a sentence ("obviously", "pretty much", "basically", "kind of", "I think", "maybe") ONLY where removing it changes nothing ("a little bit better organized" after a comparison carries meaning); (5) a doubled adjective or clause; (6) a self-justifying aside ("for reference", "FYI", "by the way", "don't worry").

Don't cut: anything cueing what's on screen ("here we're in the Delivery space"), a concrete number, product or client name, rationale for a choice, the one commercial or community ask, or a clause whose removal leaves a full stop before a lowercase word.

OUTPUT: a JSON array only, elements `[<paragraph index as string>, "<exact text to remove>"]`. The text must be a VERBATIM substring of that paragraph, character for character, including the comma that belongs to the cut and the trailing space between 2 words; never ` ⏎ ` in a needle (split across the newline); never a needle appearing twice in its paragraph; 15 to 30 entries per 200 paragraphs. A marginal cut is a wrong cut.
```

**Judging what comes back:** resolve every needle against the live document; drop (never guess-repair) one resolving to zero or 2 paragraphs; read each against the don't-cut list (a clause may cue a shot 3 paragraphs later). Strip a leading `, `. A chunk is one `pnpm descript edits` batch applied back to front, with `--dry` first.

### The ratio says whether the list is long enough

Characters removed over characters in the block dump. Below these numbers the list is short, and the take isn't clean.

| | first-take lesson | tight short |
|---|---|---|
| pass 1 | 14-20% | 20-35% |
| pass 1 and 2 | 22-30% | 30-45% |

Pass-2 speaker cuts run far past it (4 Shorts on 20 Aug 2026 kept 25-43% of the raw take). `scripts/needles.example.json` is a finished list. A 72-minute live-demo take is 46% silence (673 s closed by `gaps close --edges`): retakes first, then gaps, then measure.

**Read the finished transcript for what you never listed.** Glued words mean a needle took both boundary spaces (`[a-z][.,][A-Za-z]`); a surviving restart means a short list. Run `candidates.py` on the finished export; a miss is a one-line `fix.json` through the same driver.

## Reorder

`descript move <p> <comp> "<first>" --to "<last>" --before "<phrase>"` lifts one block in one commit. When every block moves, `scripts/arrange.py` takes an **order**: token spans that tile the script exactly once.

```bash
echo '[[0,166],[461,641],[287,320],[166,287],[320,461],[641,5970]]' > order.json
python3 scripts/arrange.py cuts.json order.json --typos t.json --markers m.json \
                          --styles s.json --pins p.json --write
```

A TAU keeps its own `audioSegment`, so non-monotonic offsets are legal; cuts ship as Ignore and a moved span carries its ignored attempts. Refusals: an order that doesn't tile `[0, n)`, a span edge inside a segment, segments that don't rebuild the source text. Durations are computed in **spoken** order before the reorder. Look first for a **second pain recorded after the promise**: hook, pain, pain, the bet, promise, close (40:11 to 29:48 on a CRM build, 24 Aug 2026), then a block delivered after the sign-off. `--styles` paints the cue legend ([descript-cli.md](descript-cli.md)). All payloads are archived: `python3 scripts/dscript.py history` / `restore <id>`. Read the clipboard section of [descript-cli.md](descript-cli.md) before the first run.

## Close the air, last

The author's rule: every word gap over 0.8 s comes down to 0.8 s, which is `--over 0.81 --keep 0.4` (the CLI needs `over` above twice `keep`). It's the LAST step of the cut pass and runs again after any later `cut`. **`--edges` is required on a finished cut**: a pause that `borders a cut` is skipped otherwise, and those are the longest (FC38: 21.0 s and 14.4 s; plain `close` recovered 5.5 s and reported success, `--over 0.7 --keep 0.3 --edges` took 20 pauses to none, 89.3 s off 25 minutes). Read the `kept` column before believing `saved`; `unmatched word` stays protected; a later `restore` comes back beside a hole.

```bash
pnpm descript gaps close <project> <comp> --over 0.81 --keep 0.4 --edges
pnpm descript gaps <project> <comp> --over 0.81                         # proof: nothing left
python3 scripts/silences.py calibrate <export.mp4> doc.json "<comp>"   # the room's threshold, not -32 dB
python3 scripts/silences.py deadair <export.mp4> doc.json "<comp>" --keep 0.35   # per-tau cut list
python3 scripts/beatclock.py doc.json --beat "first words" "last words"
```

The gate is 5% of runtime, measured on the rendered file and regardless of the character ratio. Measured 27 Aug 2026: competitors 2.2% (597 s VSL) and 2.6% (533 s); ours 9.9% (`00-intro`, 171 s) and 7.5% (`01-day-1`, 1110 s; 83 s of waiting). Ignore takes pauses with its words, so needles lower the ratio only where they landed; what survives is the pause inside a kept sentence. `calibrate` refuses on duration first, so a stale render is never measured. A beat's clock comes off the document, never an SRT (203.8 s wrong once). The short's tighter numbers: [shorts-edit.md](shorts-edit.md).

- Never rebuild the tau list from scratch: fresh offset/duration segments with empty text make Descript re-derive the script and drop every flag. Set `isBlocked: true` on the existing taus; to cut inside one, duplicate it with a new id and slice the text.

## Done when

- [ ] `prove_cuts.py` and `seams.py` pass on a FRESH dump, `descript lint` clean, cut ratio measured, pass 2 ran
- [ ] `gaps close ... --edges` ran after the LAST cut and `gaps --over 0.81` reads back empty; deadair under 5%

## The coach's 9 steps

A step is done when its output is in hand, and the coach is done when the page is open.

1. Find the concept. The take names its video by title only, so search from the title. The dev server talks to the production database, so this reads the real concept; it has to be up (ask, never start it). No match to the Descript project name: **stop and ask which one.** A review against the wrong plan is confident nonsense.

```bash
KEY=$(grep '^UPSYS_APP_API_KEY=' app/.env.local | cut -d= -f2-)
curl -s -H "Authorization: Bearer $KEY" http://localhost:3160/api/youtube/concepts \
  | jq '.data.concepts[] | select(.title | test("Agency Master"; "i"))'
```

2. Read the plan: `GET http://localhost:3160/api/youtube/concepts/<id>/script`. `POST` regenerates it, and a review that rewrites its own baseline measures nothing, so `GET` only. A 404 is a finding ("recorded with nothing written"). The script arrives as `video-script`'s 8 blocks: `name`, `startsAt`, `onScreen`, `spoken`, `endsOn`, `ask`, `claimsToVerify`.
3. Read the raw take before anything is ignored: `pnpm descript comps <project>` gives the id and duration, then `pnpm descript script <project> <comp> --full` shows the script with its cuts. Already cut: say so and measure what survives; the habit numbers are then a floor.
4. Measure. `python3 scripts/take-stats.py transcript.txt --duration 1767 > stats.json` (words, pace against the 3,600 to 4,200 word budget, retakes and truncations with their seconds, filler density, the 5 paragraphs where restarts cluster) and `python3 ~/Studio/vibe-kit/ai-doc/skills/content/video/video-script/scripts/story_metrics.py transcript.txt --duration 1767 --grade` (the 7 story rules behind D10 and W10). **Every number in the report comes from these or the API, none estimated.**
5. Align plan to take. Mark each planned block `delivered`, `dropped`, `added`, `reordered` or `thinned`, matching on the beats in `spoken`, not wording. An added block isn't a fault; a dropped one is only if something depended on it. **Count first**: over half dropped or reordered means plan and take aren't the same video, and 9 "dropped" rows are one finding wearing 9 hats. Say it once at the top, keep the table as a record, and check the plan (under the 3,600-word floor is why the take improvised, a fault in the plan).
6. Run the checks in [checks.md](checks.md).
7. Score the writing: 10 lines worth 1 point apiece, taken straight off the checks so the total can't disagree with the table ([checks.md](checks.md), "The writing score, out of 10").
8. Write the ledger row (one per recording) and append it to a ledger file outside the skill
:

```json
{"date":"2026-08-19","title":"...","conceptId":"...","compositionId":"...",
 "writingScore":3.0,"priorWritingScore":null,
 "oneThing":"...","priorOneThing":"...","priorFixed":true,"stats":{...}}
```

   `priorFixed` is the point: read the previous row and test its `oneThing` against **this** take's stats. The report opens with that verdict, the only claim in it already tested.
9. Render and open a self-contained page, never an Artifact or a terminal dump (the block table is unreadable there):

```bash
python3 scripts/report.py findings.json -o ~/Desktop/reviews/video-coach-<slug>.html
open "file://$HOME/Desktop/reviews/video-coach-<slug>.html"
```
