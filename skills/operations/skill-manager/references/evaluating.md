# Improving a skill by outcome

Read this after a skill has run on real work and the output was wrong, thin, or slower than doing
it by hand. Also read it before shipping a skill that touches a client, a payment, credentials or
production.

## The loop

Run a real task, judge the output, say what was wrong, write the correction into the file, then
**start a new session and run the task again.**

The last step is the whole test and it is the one that gets skipped. A retest inside the session
that wrote the fix proves nothing: the correction is already in the conversation and the model
will comply with it whether or not the file carries any weight. Only a cleared context reads the
file the way the next session will. Judge on the output of that second run.

## How hard to hold the file

| Risk | Loop |
| --- | --- |
| Creative and reversible: copy, thumbnails, boards, drafts, research | Outcome only. Let it run, correct what came out, keep moving. The file is a means. |
| Anything touching a client, a payment, credentials, published output or production | Read the file, and give it a second pass before it ships. An instruction that quietly does the wrong thing costs more than any amount of iteration speed. |

Getting this backwards is expensive in both directions. Hand-tuning the wording of a thumbnail
skill is wasted effort, and shipping an unread client-facing skill on the strength of one good
output is how a bad instruction reaches somebody else.

## The baseline is the only evidence that a skill helps

A skill that produces a good result has not been shown to do anything, because the model might
have produced the same result alone. Run the same prompt twice in the same turn: once with the
skill, once without it. For a revision, the baseline is the previous version of the file, snapshot
it before editing.

Read the transcripts, never only the outputs. A skill that reaches the right answer after sending
the model down two dead ends is costing more than it saves, and the fix is deleting the paragraph
that opened the detour.

## Four ways to improve a file

1. **Generalise past the test cases.** A skill is written once and read on prompts nobody
   imagined. A fix that only satisfies the three examples in front of you is overfitting; when an
   issue is stubborn, try a different framing or a different working pattern rather than a
   narrower rule.
2. **Cut what is not pulling its weight.** Deletion is the commonest correct edit. If the
   transcript shows time spent on something unproductive, remove the lines that asked for it and
   run again.
3. **Say why.** A rule with its reason attached survives an edge case the rule did not foresee. A
   shouted rule with no reason fails silently at the first case outside it.
4. **Bundle the script three runs wrote independently.** If every test run produced its own
   version of the same helper, that helper belongs in `scripts/` and the skill should name it.
   Same for a multi-step approach every run rediscovered.

## Stop when

The output is right without the correction being in the conversation, the remaining feedback is
empty, or two iterations in a row have not moved anything. A skill polished past that point is
spending tokens on a file, not on work.

## Wording rules age out

Advice that a skill must be phrased a particular way to perform is true of one model on one day.
Write for the reader, hold the outcome, and re-run the cleared-session test after a model change
rather than carrying a style rule forward on faith.
