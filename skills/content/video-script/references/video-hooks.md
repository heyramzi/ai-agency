# The opening line

The opening decides whether people stay. It doesn't decide how many arrive. Across 27 transcripts (Matt Gray), then 627 transcripts across 13 channels (26 Aug 2026), opening length (107 vs 106 words) and first-number arrival (22.2s vs 23.9s) show zero correlation with views.

- The hook opens the loop and can't close it. [storytelling](~/Studio/vibe-kit/ai-doc/references/storytelling.md) owns what keeps people past the open.
- Low views is never a hook problem. Check the subject (`choosing-ideas.md`), rewrite the title and regenerate the thumbnail (`youtube-thumbnail`). `vibe-kit/ai-doc/references/competitor-evidence.md` has the 2 title levers that survived the control test. `scripts/teardown.py <url>` prints a reference video's first 30 seconds and its first-number moment.
- A dip right after an off-target spike is a cohort problem. The next videos get served to the borrowed audience and land flat, so leave a working format alone. Judge the spike on joins, not views:
 Hypothesis from a course newsletter, not control-tested.

Done when: you can say which of subject, title, thumbnail or hook is the failing part, and it isn't the hook unless people leave inside 5 seconds.

## Windows and their jobs

| Format | Window | Budget | Job |
| --- | --- | --- | --- |
| Shorts, Reels, TikTok | first 1 to 3 seconds | 8 to 15 words | Stop the swipe. One claim, no setup. |
| Long-form | first 30 seconds | 65 to 85 words | Earn the next minute: claim, credibility and promise. |

- The long budget is slower than the category on purpose. 20 long-form videos from 3 AI-agency channels (11 Aug 2026, 13.5 hours) ran 204 to 262 wpm, mean 232, so 30 seconds is about 115 words there. Holding 65 to 85 means speaking slower and saying less.
- Of those 20, 18 open on a claim and none says hello first. The 2 chatty ones sit at the bottom of their creator's views. 19 close on one formula (recap, free resource, paid step, next video, signoff), so the single-ask close is the differentiator.
- A counted promise is a contract. "3 things" owes 3 beats the viewer can count, each named on screen. Enumerate on delivery or promise without the number.
- Refusing the category's promise is the cheapest credibility. The strongest open measured says inside 30 seconds it won't promise a revenue figure in a week. Check that the niche does promise it before spending the sentence.
- Shorts metric: viewed versus swiped away. Above 75% is good; below 50% the hook is broken and the video is fine.
- A long open past 30 minutes has a fifth job: safe. BRENS is big, relatable, easy, new, safe. Name who's talking and what they walk away with in one sentence, and promise the topic and leave the tool out so nobody calculates whether their stack disqualifies them. Single source (Riley Brown), no control test.
- Borrow the shape and leave the subject. Condense a winning open into a beat-by-beat outline, pour in your own measured substance, then run `humanizer` against a real speech sample.

## Point at the viewer, and pick the lever

- Ultra specific, or it isn't a hook. The viewer runs the claim against their own week and answers yes or no. "Your business doesn't run without you" nobody answers; "if you run an agency and it stops the week you go on holiday, you are the system" names a week. Shape: `if you <situation with a number, a tool or a person>`, then stop.
- The situation sits one step downstream of the topic, and never reappears in the reveal. "3 clauses every landlord needs" identifies nobody; "you shouldn't be unblocking a toilet at 11pm" is the same video. List the moments the topic costs somebody and take the one with a clock and a physical object. `conversion` holds moments said on 367 calls, so harvest before inventing. Single source (@lacedmedia, 12 Sep 2026) and no control test.
- Don't answer the hook. Self-reference makes the sentence about the viewer; the missing main clause keeps it open (Zeigarnik, Loewenstein). "If your account manager spends 2 hours a day updating a sheet", then let the next line carry the verdict.
- Harvest the phrase. `conversion` has the viewer's words; `scripts/search-demand.py "<seed>"` reads TikTok autocomplete (a-z expansion, 3 to 6 word phrases, no login, about 2 minutes for 6 seeds). Read the `from` column: "ai agent" returns Valorant and estate agents. A phrase is demand evidence for `choosing-ideas.md`: file it as subject, then title, then hook. Method from Natia Kurdadze, 28 Aug 2026.
- The script points at the viewer, never at you. Autobiography hooks are out: "I made this in 2023", "When I started", a credential they already know, "so here's the thing", a table of contents ("Here are 6 terms"). A result you live today isn't autobiography: "I save 24 hours a month by talking instead of typing, and here's how you can do it too" turns to the viewer in the same breath, and it's the reframe the author made on camera 3 times on 5 Oct 2026 (`hook-library.md`, Part 0). The test: could a stranger hear this and feel something they own is broken? The same test runs on the close, where the author creeps back ("that's what I built"); hand the viewer something to do. `humanizer`'s evidence exception holds: a number you measured, a thing you did.
- Every body beat earns its place. Persuasion pieces load a consequence onto the fact; teaching pieces give a worked example or a recommendation. No threats in a teaching piece: someone who came to learn the words didn't come to be frightened. Close persuasion on a command, teaching on the offer of the artefact.
- Pick the lever first, then find the true material that carries it:

| Lever | The move | Must be true |
| --- | --- | --- |
| Shame-release | Blame the tool or system and spare the viewer | The system is the problem (usually the strongest, most underused) |
| Fear | Name what's already broken, load the consequence | It's broken and the consequence follows |
| Anxiety | A check they can run now and might fail | The check is real and can come back positive |
| FOMO | Shipped and dated, and they plausibly lack it | All three |
| Loss aversion | What they're losing now | Measured, ideally on your numbers first |
| Identity split | 2 kinds of people, let them pick | The split is real |
| Revenge arc | Failed by something, stopped tolerating it | You did it |
| Tribal callout | One group so precisely everyone else scrolls | You know them |
| Curiosity gap | The shape of what they don't know | The answer arrives |

Cialdini chooses the shape and is never named on camera: commitment ("open it", "count them"), scarcity, social proof where the claim is true, authority through diagnosis specificity.

## The 5 mechanisms

Name one before writing, because an unnamed hook is usually 2 fighting.

| Mechanism | Works by | Fails when |
| --- | --- | --- |
| Shock or contradiction | A claim conflicting with a belief | Not surprising, or indefensible |
| Problem agitation | Presses a pain they have | They haven't felt it; reads as an ad |
| Story open | Drops into the middle of a scene | It starts with setup |
| Curiosity gap | Shows the shape of what they don't know | The gap is all there is; bait |
| Social proof | A specific result or credential | Vague, rounded, unverifiable |

For a founder posting his own numbers, social proof and story open carry the most and are hardest to fake.

A gap needs 3 things. (1) The brain wants to close it; (2) the line signals the answer is useful ("worth knowing", not "want to know"; specificity carries that signal); (3) it's guessable, so the viewer can guess wrong and the reveal breaks a prediction. "Something happened on that call that changed everything" fails; "She said one thing in the first 30 minutes that killed the retainer" passes. The limit: enough to guess, not so much the answer is obvious.

7 open frames, each opening the gap in the last clause with the reward signal in the first: "If I had to start from zero, here's exactly what I'd do first"; "Nobody talks about..."; "I tested [method] for [duration], here's what happened"; "I stopped [action], here's what's happened since"; "I don't think we talk enough about..."; "I wish I'd known this sooner" (weakest: autobiography); "This might surprise you, but...". Frames 3 and 4 carry a real experiment, so the truth rule binds hardest; 2, 5 and 7 claim something about the field, and it has to be true. A frame isn't a hook until the method and duration are real.

The eighth uses second person and is the comparison they already make. "Why are people dumber than you making more money than you?" It fails the moment it flatters ("why smart people stay broke"), and the reveal must be a mechanism. Single source (@notdwd, 7 Sep 2026: 14,864 views on a 467-follower account), only the title measured.

## 3 surfaces carry one claim

Write the first frame, the on-screen title text and the spoken line. A viewer who sees one thing, reads a second and hears a third assembles nothing, and confusion reads as boredom on a retention chart. Title text is larger and unspoken, carrying context or the gap; dropping it costs a surface. Beyond that:

- State the common belief, then break it. "Most people think the hook decides how many people arrive. It decides whether they stay." The implied form makes the viewer reconstruct the belief first, and most won't. Use a belief people hold and skip the strawman.
- Confirm the click. The title and thumbnail made a promise; the first breath must show this is the video it came from, in the viewer's words ([storytelling](~/Studio/vibe-kit/ai-doc/references/storytelling.md) rung 0 bans restating the title). `youtube-thumbnail` records the claim the frame made.
- Show the number. The proof frame is the real artefact within 2 seconds of the claim. Strongest: 2 artefacts from one input and a verdict that splits the field ("this one won the format, that one the structure"). One run is one run, so say so. Single source (Nate Herk, 12 Aug 2026).

## Execution

1. Write the open in full and mark it `Say this line as written`. The body it feeds is bullets.
2. On long-form, write the open last and take it from the finished transcript. An open written first promises the planned video. Shorts are the exception: the hook is the plan.
3. Find the true number first. Nothing measured and screenshottable means say so and stop.
4. Write 3 variants on different mechanisms, each rated on mechanism, word count and drop-off risk, with a reason.
5. Read them aloud. One breath, or it isn't a hook.
6. Run `humanizer` with a real speech sample, then `npx heyramzi-slop <file> --fix` until it exits 0.

Done when all 6 ran and every number in the open traces to a source or a screen. Also confirm: first-person count across the script is zero or each survivor is a hedge on his own number, a lived result handed over with "here's how you can do it too", an assignment or a quote; the hook promises the answer and never gives it; a counted promise is paid by that many named beats; the item carrying the result sits last in a counted list; at most one negation pivot; and on a Short the stakes carry a character, something at risk and a clock.
