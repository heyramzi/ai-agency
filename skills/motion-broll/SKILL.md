---
name: motion-broll
license: MIT
compatibility: Remotion (Node 20 or later) and ffmpeg
description: Self-healing skill that designs and builds motion graphics for video in Remotion, in three registers - a full-frame clip that replaces the picture, a text or glass caption keyed over the speaker's face on an alpha layer, and a figure (a box-and-arrow diagram or an analogy drawn as a mapping) - from reading the cut for its real clock through to clips that convey the idea rather than decorate it, and appends every new failure mode to its own pattern list after each run. Use when a Short, a lesson or a YouTube video needs b-roll, when a beat needs words or a list over the talking head, when a structure or an analogy needs drawing in the brand's design language, when a graphic is not landing, when picking between competing motion designs for one line, or when timing clips against a read.
---

# Motion B-roll

The b-roll lives in a Remotion project of your own at 30fps, in two frames: **1080x1920**
for anything cut into a Short, and **1920x1080** for course lessons and long-form YouTube, which is
now most of the work. One tokens file holds the Shorts frame; a per-project file holds the
landscape one and its safe band. They are separate constants on purpose, so a portrait clip can
never pick up the landscape numbers. A landscape clip is not a portrait clip rotated: see the frame
note in `diagrams.md`.

It is not a general video skill and it does not cover the neighbouring jobs:

- Getting clips into Descript, named and filed: `descript-projects`.
- Encoding, filing, scheduling: `shorts-production`.
- Writing the read itself: `video-hooks`.
- Evergreen 1920x1080 overlays that sit on top of a finished edit: `youtube-ctas`.
- Prompting a hosted video model, and when one should render a beat at all:
  `ai-video-prompting`. It holds the boundary between the two lanes,
  the green-screen route to a real alpha channel, and what a clip costs on each
  first-party API. `scripts/genvideo.py` here is its runner.
- Remotion API questions: `remotion-best-practices`, the vendored router. It holds nothing
  itself, it names the sub-skill to open (`remotion-markup` for springs, sequencing and fonts,
  `remotion-render` for flags and alpha, `remotion-interactivity` for Studio-editable markup).

Those skills had every design instruction stripped out of them on purpose. They are the engine
and they hold no taste. A Remotion sub-skill that appears to contradict this file is describing
a default, not a decision.

This skill is about whether the clip says the thing.

## The one failure this skill exists to prevent

A clip that is beautiful, on-palette, correctly timed, and conveys nothing.

It happens because abstraction is easy to justify and impossible to read. "AI Skill System" shipped
eight neutral geometric marks for eight tools, with a reasonable written argument that logos date a
clip and exclude anyone using none of them. The speaker said the clips were not conveying the idea, and the speaker
was right: nobody recognises their own stack in a hexagon. Recognition was the whole job and the
design had optimised it away.

**Draw the actual thing.** Real logos, real words, the real screen. Reach for an abstraction only
when the real thing really does not exist yet, and write down what you gave up.

Logos come from simple-icons where the brand is still in it and from `logo-dev` by domain where it
is not. Pull the set for a clip in one pass off the composition transcript rather than hunting them
mid-build, and never off an image search: wrong resolution, on a background, often a retired mark.

## The test every clip has to pass: what does it add

A clip that draws what the sentence already said is decoration. The words are already in the video,
spoken by someone whose face is more interesting than any rectangle. So before building anything,
answer in one line: **what does the viewer know after this clip that the sentence did not tell
them?** If the answer is "the same thing, but with shapes", do not build it - put the speaker's face there.

The four things a graphic can add that a sentence cannot:

- **A quantity made comparable.** "Twenty percent of the system drives eighty percent" is arithmetic
  a listener has to do. A fifth of a grid lit, wired to a bar at four fifths, is done for them.
- **A consequence the read leaves implicit.** The speaker says keep the twenty. The speaker does not say that putting
  the eighty down costs a fifth of the output. Draw the cost and the clip has told them something.
- **A structure that has no name yet.** Five spaces, three layers, a loop that closes. The read
  names the parts in sequence because speech is serial; a frame shows them at once.
- **A recognition.** The real logo, the real screen, the real word. The moment a viewer sees a tool
  they have open in another tab, the sentence stops being about agencies and starts being about them.

If a clip does none of the four, it is a cutaway with a budget. Being on-palette, on-clock and
beautifully sprung does not rescue it.

## Four registers, and the value test applies to all of them

The four things above decide *whether* to build. What to build is one of four, and the choice is
made by what the clip does to the picture rather than by what it looks like:

- **A clip that replaces the picture.** The original register: a full-frame graphic, cut in whole,
  standing on its own ground. Its words stay to uppercase labels, per `type.ts`.
- **A clip that sits on the picture.** An overlay keyed over the speaker's face, so the speaker stays on screen and the
  words on top are the list the speaker is reciting. Sentence case, brand type, read as text.
  → **[references/overlays.md](references/overlays.md)**
- **A figure.** Boxes and arrows for a structure, or a two-column bridge for an analogy. Both are
  full-frame, both have their own way of failing, and both are worth building only when the
  arrangement says something the sentence did not.
  → **[references/diagrams.md](references/diagrams.md)**, **[references/analogies.md](references/analogies.md)**
- **A rendered object.** Real 3D, keyed over the speaker, for a beat where the viewer has to believe it is an
  object rather than a diagram of one. Costs several times a flat frame; two or three per video.
  → **[references/three-d.md](references/three-d.md)**

`src/specimens/` holds one rendered example of each. Look at those before building in one.

**Whatever the register, a landscape clip ships in two frames.** 1920x1080 to replace the picture and
960x1080 to sit beside the speaker's face, each opaque and alpha, which is four files per clip. The narrow one
is the figure stood on end rather than the wide one shrunk, because a 32px label at 45 percent is
14px. The frame constants, the `Layout` pattern that keeps the two from drifting, and the hash check
that proves the wide render did not move are in [craft.md](references/craft.md).

## Read the cut, not the script

The clock comes from the Descript composition transcript. Never from the written script.

```
list_projects → find the project holding "00 RAW <Subject>.MOV"   # by raw take, never by name
get_project   → compositions[].duration vs the raw media duration
export_transcript(composition_id, format: "srt")
```

**The connector is often not attached to the session, and that is not a blocker.** The same three
calls are three REST endpoints and the token is already in the repo. `descript-projects` holds the
route, the auth shape and the one gotcha that costs an hour; read it there rather than guessing.

- Equal durations mean the take has not been cut and there is no clock yet. Build for the beats you
  can name, and say which ones are waiting.
- Different durations mean a cut exists. Its SRT is the only clock. The written script is a draft of
  what someone intended to say, and what got said is usually longer, differently ordered, and full
  of asides that want a face rather than a graphic.
- the speaker recuts while clips render. Diff the line timings immediately before committing filenames,
  because those names are write-once. See `descript-projects`.

Derive per beat: start timecode, end timecode, and the sentence. The clip is as long as the sentence
it serves, minus any mid-beat aside that wants the speaker's face back.

## Plan the whole video before building one clip

The job is never "the line the speaker pasted". A pasted line is where the speaker is looking; the deliverable is the
b-roll for a video. So the first artefact of any run is a **coverage plan**: every sentence in the
SRT, with a verdict.

Three verdicts, and only three:

- **B-roll.** The sentence passes the value test above. Name the register with it - *replaces*,
  *overlay* or *figure* - because that decides whether the beat also needs the speaker on camera, and a plan
  that leaves it open gets answered by whoever builds the clip.
- **The speaker's face.** Anything personal, any claim whose proof is that the speaker is the one saying it, any joke,
  any turn. A lesson that never returns to a face is a slideshow with narration.
- **The speaker's screen.** Anything the speaker is demonstrating. A graphic over a real product view is a graphic
  arguing with the evidence behind it.

Write the plan to `<lesson>/plan.md` next to `beats.ts` before writing a clip.

**Coverage is an outcome, never a target.** How much, where, the placement limits and the worked
example are in **[references/planning.md](references/planning.md)**, and it is required reading
before a plan: a number decided first turns the plan into a quota, and a quota gets filled with
exactly the clips this skill exists to prevent.

## One beat, one clip, three designs

- **One clip serves one sentence.** A payoff line folded into the tail of the previous clip is a
  payoff nobody sees. If the read has a "here is why this matters" clause, it gets its own shot.
- **Ship three competing designs per beat**, at identical frame counts, so they drop into the
  timeline interchangeably. Different lengths mean the longest one silently wins.
- **Let them disagree.** Two designs may take opposite sides of a real question, and the header
  comment of each argues its own case. That is the deliverable: the speaker cuts them against the read and
  picks. A single "correct" option is a guess presented as an answer.

## Timing

Put the shared clock in one `beats.ts` per video, keyed by beat, derived from the SRT. Clips import
from it. Retiming the whole set is then one edit, not fifteen.

Inside a clip:

- Every schedule constant is a named frame number at the top of the file, never inline.
- The resolve has to happen before the cut. Work out when the last element lands and leave hold
  frames after it. A ripple that starts four frames before the end is a ripple nobody sees.
- Phases that reference each other's final geometry must not overlap. Lines written against a box's
  end position while the box is still travelling get drawn outside it.

## One motion language, or the set has no continuity

Continuity between clips is not a shared palette, it is shared physics. The eye reads acceleration
before it reads colour, so three clips that each picked their own spring inline are visibly by three
different hands no matter how well they match on hue.

`motion.ts` is the one home for the vocabulary. Use the named config:

- `ENTER` (16/130) something arrives and takes its place, the default for a subject in an empty frame
- `ARRIVE` (13/190) something lands on a surface, shorter and snappier
- `SETTLE` (damping 200) no overshoot at all, for opacity and light: overshoot on a fade is a flicker
- `DEPART` (22/90) weight leaving, heavier than it arrived
- `TRAVEL` (inOut cubic) for journeys between two known positions. **Journeys interpolate, arrivals
  spring.** A spring at every waypoint turns a route into a series of arrivals.
- `ANTICIPATE` (4 frames) the load before a big move. An object starting from dead rest reads as
  dragged; one that gathers first reads as choosing to go. The cheapest lift available.
- `HOLD` (18 frames) the floor for the tail after the last element resolves. Below half a second the
  editor has no handle and the payoff lands under the next word.

If a beat needs a curve that is not there, add it there with its own WHY. Inlining one starts the
drift again.

## The craft is next door

SKILL.md is about whether the clip says the thing. How it is built is next door, and the two below
are required reading before the first line of any new clip:

- **[references/planning.md](references/planning.md)** — coverage, placement, and the paste trap.
- **[references/craft.md](references/craft.md)** — the three finishing passes that make a frame look
  photographed rather than composited; `Plate` and `Landing`, which exist because hand-rolling
  either one failed silently; the 1080x1920 and 1920x1080 frames and their safe bands; the two
  grounds (`grid` and the indigo `bloom`) and what an `alpha` render has to give up; type, which is
  labels only and only when the read names something searchable; and the constants-versus-Studio
  call, which is decided by what the clip is for and never by preference.
- **[references/sound.md](references/sound.md)** — twelve voices on one chord, six for CTAs and six
  for b-roll, and the rule that `<Sfx from={...}>` takes the same named constant the animation reads
  so the motion is cut to the sound rather than scored after it.


## Comments carry the reasoning

Every clip opens with the line it serves in quotes, its timecode, and a `WHY` paragraph per real
design decision. Not what the code does. Why this reading of the sentence beat the alternative.

This is what makes the option set usable and what makes a wrong call reviewable later. When the speaker
overrules one, the comment gets rewritten to record the reversal and its reason, not deleted.

## Verify by looking

Typecheck proves nothing about whether a graphic appears. Render a still at the frame where each
phase resolves and open it.

```bash
npx remotion still src/index.ts <CompId> out/stills/<CompId>-<frame>.png --frame=<frame> --log=error
pnpm typecheck
```

Check every phase, not just the last: things that are supposed to be lit, connections that are
supposed to be drawn, anything sitting off the edge of the frame. Silent invisibility is the common
failure and it survives a clean render, a clean typecheck and a clean exit code.

A still is the source at one frame. It cannot show the encode, the alpha, the audio, or what
happens across a cut, so the rendered file gets watched too.

The render-watch-fix loop is in [references/render-loop.md](references/render-loop.md).

## Execution flow

1. Find the Descript project by its `00 RAW` take. Read `compositions[].duration` against the raw.
2. Export the SRT. Write down each beat's start, end and sentence.
3. **Write `plan.md`** per [planning.md](references/planning.md), before any clip exists.
4. Write or update `beats.ts` from those measurements, for the beats being built this session.
5. Build three designs per beat. Real logos, real words. Each one answers the value test in its
   header. WHY comments as you go.
6. Cut the sound in the same pass, from the same frame constants.
7. Render a still per phase per clip and look at every one. Fix what is invisible, cut off, or
   unreadable.
8. `pnpm typecheck`, then render the mp4s, and the MOVs for anything meant to key.
9. Watch every rendered file with `scripts/watch.py`, one review subagent per clip. Fix the list,
   re-render, watch again. Repeat until a pass returns nothing.
10. Hand off to `descript-projects` for naming and import. Re-check the composition duration first.
11. If this run surfaced a failure mode not already listed, append it to Learned Patterns with
    today's date.

The verification checklist is in [references/verification.md](references/verification.md).

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one
not already listed, append it to Learned Patterns before finishing.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- A clip built from logos dates the video and excludes everyone using a different stack. Nobody
  recognises their own setup in somebody else's hexagon, and recognition was the whole job.
- The line pasted out of an editor is not the line that is spoken. It is where the speaker is
  looking, and the deliverable is the beat around it. Read the surrounding scene before designing.
- The speaker recuts while clips render, so line timings drift under you. Diff them immediately
  before committing filenames, not at the start of the batch.
- A figure that arrives whole is a slide the viewer parses alone while the speaker keeps talking.
  Nodes land in the order they are named; edges draw once both their boxes exist.
- Two accents is zero accents. Exactly one node carries the accent, or the figure has no "you are
  here".
- The review loop ends when a pass returns nothing, not when the fix list gets short.
