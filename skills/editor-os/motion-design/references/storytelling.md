# Storytelling, planning and the direction gate

Read it at plan time, and again before you write any clip's header. The value test judges one clip.
The rest of this file is what runs before a clip exists: the gate, the through-line, and how much goes
where.

## The direction gate (step zero)

Nothing is built until the owner has picked a look. A 20-clip operations set went all the way into the
editor before the owner saw one frame. Verdict, 25 Aug 2026: *"I don't like at all any of
the designs we have created sadly. They are all ugly and too complex. We need to go a little bit more
minimal. It looks amateur if you watch what you do. The skill should offer me one or two angles or three
angles in the beginning in an HTML."*

1. Pick 2 or 3 directions for the whole video, disagreeing on ink, subject or ground.
2. Render one still per direction, of the same beat (`remotion still` on a throwaway comp, or hand SVG).
3. Write them into a plain local `.html` (`scripts/directions.py` builds it from a small JSON manifest).
   Give each a name, its still, one sentence on what it commits to and one on what it gives up. Its `now`
   panel shows the current set at a third the width: a choice reads as academic without it.
4. Ask the owner, and wait. This is one of the few places a question beats a decision.

Showing one beat 3 ways doesn't satisfy the gate. A later video ran that board and built every clip in
a look the owner never saw: near-black, with a blue grid measuring nothing and a bloom on 4 objects. Verdict:
"extremely ugly", "the way we work right now has been beginner". The gate covers ground, ink and material.

Done when: the owner named a direction in writing.

### What "too complex" measured as

That board held about 50 marks. It had 25 blocks across 5 lanes, with 5 valves, wires and a 9-segment
ceiling, nearly all outlined bright on near-black and glowing: a sci-fi HUD. 4 countable rules fix it:

- One subject, and you can point at it. Cover everything but it; if the rest still does work, cut it.
- Seven marks at most. A repeated element counts once, and past about seven the eye scans.
- Glow is for one thing. One glow in 19 seconds, held for the beat the passage was built to reach.
- Value before hue. Most of the frame at one dim value, the subject brighter.

Draw fewer things bigger (3 blocks at 200px say what 25 at 118px tried), imply structure (2
rules and a gap say "rows"), cut the label before the shape. A beat that needs fifty marks gets his face.
This ranks above the value test: a clip that carries the idea and is unreadable at a glance failed first.

## The value test

Before building, answer in one line: **what does the viewer know after this clip that the sentence did not
tell them?** If the answer is "the same thing in shapes", put his face there. A graphic can add 4
things:

- A quantity made comparable. A fifth of a grid lit, wired to a bar at four fifths.
- A consequence the read leaves implicit. Draw the cost of putting the eighty down.
- A structure with no name yet. Speech is serial, a frame shows the parts at once.
- A recognition. The real logo, screen or word, the tool they have open in another tab.

A cutaway with a budget adds none of the four, and being on-palette, on-clock and well sprung doesn't
rescue it. The second question is what the clip changes, and what it hands to the clip after. A clip that
can only answer the first is correct and inert. Put both answers in the header comment on one line each, and add the clip's rung and the sentence it serves verbatim.

**A right clip on the wrong sentence is a wrong clip.** The viewer sees one thing, hears another and leaves:
a retention cliff that looks like boredom and gets "fixed" by cutting faster. The in-point belongs to the
clip's spec, and the editor doesn't get to pick it.

**Transcription costs retention** (Mayer's redundancy principle): when narration and on-screen words carry
the same content, comprehension drops because reading wins the one channel. Keywords beside speech test
better than the sentence. Type leads only for a list or a name; an idea gets a picture.

## The literalness ladder
| Rung | The frame | Verdict |
| --- | --- | --- |
| 0. Transcription | His words in type | Don't |
| 1. Illustration | Draws the noun he said | Only for recognition |
| 2. Structure | Draws the arrangement speech said serially | The floor for a real clip |
| 3. Consequence | Draws what the sentence left implicit | Where the good clips are |
| 4. Meaning carried | Uses the video's own motif | Decided in the plan, never per clip |

Rung 1 is legal when the real logo, screen or word is the whole payload, and legal isn't right: a docs-app
screenshot under "your source of truth for your templates" named the thing twice and never showed what it
does. **A count is transcription with the type removed.** A line about pillars gets drawn as that many columns, which puts
the count word in rectangles. Draw the topology and the number is usually wrong (sales and delivery were
the two ends of one loop, and the third thing sat underneath holding what the loop wrote). Same for a line
about steps. Aim for a median of 2 to 3 with 2 or 3 beats at 4; a median of 1 is a set of illustrations, and
rung 4 on every beat is a video that won't say anything plainly.

## The through-line
It goes at the top of `plan.md`, before any clip. The video is the unit of work. A set of clips that
each open on an empty frame, draw a small world and resolve is a slideshow of correct diagrams.

- One world, the domain every figure comes from (the kitchen, the machine, the queue). Beat 9 can reuse
  a shape beat 3 set up. Extend the world before opening a new one.
- One motif that appears in the first minute, changes across the video and returns at the end. If it
  doesn't change it's a watermark. A rack fills or a queue drains, or a wall gets a door.
- Change is the unit of attention. Per clip, ask what state the last one left, what this one changes and what it
  hands on. Never redraw an established structure from zero. A scale word ("more projects") widens the
  same loop.
- One open loop, like a missing box or a link going nowhere. Open it on the frame where he opens it, then
  pay it off with the same composition completed where he answers.
- A story role per beat: state (one early beat), break (the cost, often his face), complication (why the
  obvious fix fails), mechanism (where most clips live), resolution (the motif, changed). All "explain" goes flat.
- A passage that won't draw means the copy is wrong. A line about pillars, then "all of it is kept by a
  system", gave the container and its part the same name. Send the sentence back.

Skip it for a recognition beat, a screen demo (a graphic over evidence argues with it) and a quantity.

## Devices that tie clips together

A video needs one continuity device, so don't use 5. Cheapest first:
1. Carry-over state: the next clip opens where the last resolved, via a shared constant. Where a passage
   shares one figure, build it as one clip.
2. The return frame: one composition back at each boundary with one more thing in it (`ReturnMark`, a
   higher `at` per section).
3. The match cut: the last shape of one clip is the first of the next, meaning something else.
4. Running position: the client always enters left, the system always sits right.
5. The 3D carousel: core models sit on a curved plane while the camera tracks across and the rest fall into depth blur.

3 spatial frames anchor an idea before anyone explains the detail: the dichotomy fork (blur his plate about
25px, two paths side by side, zoom into the chosen one), the bullseye (5 concentric rings, for audience
or scope) and 3D pillars with real social-proof cards docked under each.

Where a graphic lands against the word (measured on a 19-minute reference, 29 Aug 2026): it arrives
10 to 15 frames before the word it serves and completes on it, since a graphic landing ON the word is a
caption. It leaves 6 to 10 frames before the last syllable, which hands focus back to the face. `HOLD` is the
tail floor that moves earlier.

The clock those sit inside is **a visible change every 1.7 to 2.5s**: 41 in the first 60 seconds, no static
stretch over 5s, about 7 micro-changes per hard cut. Micro-beats every 1.5 to 2.5s (tool pills, `20%`
callouts, 1.15x punch-ins, a spotlight dimming all but the active field), meso every 5 to 8s (connector
travel, prompt-then-output reveals), macro every 15 to 45s (an architecture map, a full workflow). 3
mechanisms fill it:

- Show every row of a list from frame one with one lit. Inactive rows sit at about 35% with no border, and
  the active one snaps to full white on the cue. A row that hasn't arrived can't be anticipated. A staggered
  reveal is only for a list whose order is the argument.
- Nothing is shown finished. Charts, fills and connectors draw over 1 to 1.5s (a one-second floor) behind
  a leading point; the mark lands before the fill reaches it.
- In live demos, split the focus: a pill tracks the tool being invoked, so the screen is never dead.

## Planning a video's set

`plan.md` covers every sentence in the cut, states the coverage percentage and gives each beat a register and
a story role. Build in plan order; if only some beats are built this session, say which.

There are 5 registers, chosen by what the clip does to the picture. One replaces it (full frame, its own
ground, uppercase labels per `type.ts`); one sits on it (keyed over his face, sentence case, brand type);
a figure (boxes and arrows, or an analogy bridge, only when the arrangement says something new); a rendered
object (real 3D keyed over him, 2 or 3 per video); a borrowed shot (found footage, 3 to 6s, muted, licence
in a ledger, shipped from `B-roll`). The first four ship from `Motion`.
Wide clips ship in a wide and a narrow frame (`craft.md`).

Take the clock from the cut's SRT, and ignore the written script. Export it and compare the cut's duration to
the raw take. Equal durations mean no cut yet: build the beats you can name and say which are waiting.
Different means the SRT is the only clock; what got said runs longer, reordered, full of asides that want a
face. Diff line timings right before committing filenames, since the names are write-once.


A film with no read takes its clock from the track's bar (`product-film.md`). Search what exists before you design.
Open every clip with a header comment that quotes the line it serves and argues its design. That makes your
own clip library searchable: grep it for the line you're about to build for before you design from zero.

- Coverage: under about 40% on a talking-head explainer, look again; over about 60% the presenter has
  vanished behind his graphics, so cut the weakest. A tour that's mostly screen states its band against the
  other minutes.
- Balance: no stretch over 45s without b-roll, none over 25s without his face, and no 2 clips back to
  back with no face between them (unless the second lands the point). Don't front-load.
- Story checks: the through-line sits atop the plan; the motif returns changed (name both beats); the loop
  opens and closes on the same frame; no structure is drawn twice; rungs are counted; 6 figures in a row is
  wallpaper; a single borrowed shot is a punchline and 4 make a compilation, and none ships in a paid product
  unchecked; words on a background past a third of the plan means the video is subtitling itself.
- Give one beat one clip with 3 designs at identical frame counts. A second design is a second reading on
  another rung, and a second layout doesn't count.
- Timing: one `beats.ts` per video keyed by beat from the SRT, and clips import from it. Make every schedule
  constant a named frame number at the top. Resolve before the cut and leave hold frames. Phases that
  reference each other's final geometry must not overlap.

The line he pastes can differ from the line he speaks. A scene copied out of the editor carries the
struck-through words absent from the export (M0 L1 lost a sentence and a whole beat to it). Check
`getComputedStyle(...).textDecorationLine` per text node before building.

Done when: the plan has the through-line, a rung and a role per beat, and the checks above pass.
