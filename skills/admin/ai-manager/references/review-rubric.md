# Review rubric

The judgment half of a review. Run `scripts/review_skill.py <dir>` first; it settles frontmatter,
body size, dead links, unreachable references and script ergonomics. [skill-floor.md](skill-floor.md)
is the same bar as instructions for writing; this scores a finished skill. It's adapted from the
MIT-licensed rubric in `agentskill-sh/ags`, cut to what a script can't check, plus D6 to D8.

Score 1 to 5 each (3 is acceptable and isn't a failure; a registry of 5s nobody triggers is worth less
than a 3 that runs weekly). 33-40 ship. 25-32 fix the 3s and below, then ship. 17-24
rewrite the low ones before anyone runs it. Under 17 wrong shape: restart from the run that
produced it.

| Dimension | A 5 | A 3 | A 1 |
| --- | --- | --- | --- |
| D1 Triggering (checked against the family, not alone) | what and when, user's words, third person, separable from every sibling | what without when, or first person, or too generic to separate from a sibling | empty, one word or misleading |
| D2 Conciseness | only what the model doesn't know; each paragraph survives "would the base model get this wrong without it?" | explains what the model knows (what a CSV is) | more explanation than instruction |
| D3 Clarity | sequential, one term per concept, an example where format matters, edge cases named, no time-sensitive text | followable with interpretation, inconsistent terms | contradictory or incomplete |
| D4 Freedom | fragile steps get exact commands, creative steps criteria, one default per choice, the why beside a rigid rule | a menu where a default belongs, or a rigid script on a judgment task | every step treated alike |
| D5 Disclosure | body is overview plus navigation; each reference states its load condition | references exist but the body never says when to open them ("see references/" is 3 at best) | one long body, no references |
| D6 Placement | narrowest family that fits, nothing else covers 70%, one coherent unit | overlaps a sibling enough that a prompt could land on either | should be a paragraph in an existing skill |
| D7 Provenance | written from a real run: real names, numbers, errors | plausible but unrun | describes a capability a script already has |
| D8 Self-healing | `heal.cjs check` passes, log seeded with real entries | scaffold present, log empty (worse than none) | repeated a mistake and nothing records it |

Red flags for D2: defining common terms, restating the filesystem, "In this section we will", the
same instruction twice in different words. D6 at 3 or below across several skills is a `clean` job.
D8 is N/A for a skill with no failures to seed it; don't ship an empty section for the point.

## Improving by outcome

Read after a skill ran on real work and the output was wrong, thin or slower than doing it by hand,
and before shipping one that touches a client, payment, credentials or production.

The loop: run a real task, judge the output, say what was wrong, write the correction into the
file, then start a new session and run the task again. A retest in the session that wrote the
fix proves nothing: the model complies whether or not the file adds any weight.

How hard to hold the file. Creative and reversible work (copy, thumbnails, boards, drafts,
research): outcome only, correct what came out and move on. Anything touching a client, payment,
credentials, published output or production: read the file and give it a second pass before it
ships, because an instruction that does the wrong thing without a sound costs more than iteration speed.
Hand-tuning a thumbnail skill's wording is wasted effort; shipping an unread client-facing skill on
one good output is how a bad instruction reaches somebody else.

The baseline is the only evidence a skill helps. Run the same prompt twice in one turn, with
and without the skill (for a revision, against the previous file, snapshotted first). Read the
transcripts as well as the outputs: a skill that reaches the answer after 2 dead ends costs more
than it saves, and the fix is deleting the paragraph that opened the detour.

There are 4 ways to improve a file: generalise past the test cases (a fix that only satisfies the
examples in front of you is overfitting; reframe, don't narrow the rule); cut what isn't pulling
its weight (deletion is the commonest correct edit); say why, so the rule survives an edge case;
bundle into `scripts/` a helper 3 runs wrote independently.

Finish when the output is right without the correction in the conversation, the remaining
feedback is empty, or 2 iterations in a row moved nothing. Wording rules age out: advice that a
skill must be phrased a certain way is true of one model on one day, so re-run the cleared-session
test after a model change instead of carrying a style rule forward.
