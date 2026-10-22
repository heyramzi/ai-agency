# The coach's 9 steps

The commands behind "Coach first" in [cutting.md](cutting.md).

A step is done when its output is in hand, and the coach is done when the page is open.

1. Find the plan. The take names its video by title only, so ask for the script or brief it was recorded from. No plan that matches the Descript project name: **stop and ask which one.** A review against the wrong plan is confident nonsense.
2. Read the plan: the script as the person has it, in `video-script`'s 8 blocks when it has them (`name`, `startsAt`, `onScreen`, `spoken`, `endsOn`, `ask`, `claimsToVerify`). A missing plan is a finding ("recorded with nothing written").
3. Read the raw take before anything is ignored: `pnpm descript comps <project>` gives the id and duration, then `pnpm descript script <project> <comp> --full` shows the script with its cuts. Already cut: say so and measure what survives; the habit numbers are then a floor.
4. Measure. `python3 scripts/take-stats.py transcript.txt --duration 1767 > stats.json` (words, pace against the 3,600 to 4,200 word budget, retakes and truncations with their seconds, filler density, the 5 paragraphs where restarts cluster) and `python3 .claude/skills/video-script/scripts/story_metrics.py transcript.txt --duration 1767 --grade` (the 7 story rules behind D10 and W10). **Every number in the report comes from these or the API, none estimated.**
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
