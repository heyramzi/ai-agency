---
name: youtube-thumbnail
description: "Designs YouTube thumbnails for the founder, systems and AI-tooling niche off 270 measured frames, from a template library that grows out of what has already shipped. Ships a build order a designer can execute or a finished render. Use when a video needs a thumbnail or cover, when CTR needs improving, when thumbnails come out inconsistent, or on 'thumbnail', 'YouTube cover', 'thumbnail A/B', 'thumbnail template'."
allowed-tools: Read, Write, Edit, Bash, WebFetch
tags: [makes, design, youtube]
---

# YouTube Thumbnail

Design thumbnails for high click-through on YouTube, for **this** niche: founders,
agency operators, systems and AI tooling. The job is one second of attention on a
5-inch screen, in a feed, against nine competitors whose frames have already been
measured.

Three decisions run the whole skill and none is a matter of taste:

1. **The angle** (step 1b). The claim the frame makes, the beat that proves it, and the
   title that claim wants. Decided before the picture, because it decides the video too.
2. **Face variant or faceless variant** (step 3). Decided by what the video is about.
3. **How it is executed** (step 7): designer handoff, real-pixel composite, or model
   generation. Decided by who executes and by whether a real person is in the frame.
   **A face variant is composited from real pixels, never generated.** The model draws a
   frame only when nothing real has to be preserved in it. See below.

**Pick the template before you write a word of the frame (step 5c).** Camera, ground, light,
palette, depth and type placement live in a named template, never invented per run: that is
why one set gave two good frames and four poor ones and the good ones taught the next set
nothing. `scripts/thumbnail-template.ts list`, then
[`references/templates.md`](references/templates.md). A concept naming none is unfinished.

**The render-mode gate is the template's `route`, and it is mechanical now.** On a face
frame the only routes are `photo`, `composite` and `edit-pass`. Never a plain
`render-thumbnail.ts` model run on a face frame: model mode hands the plate over as a
*reference* and the model redraws him, so the frame reads as AI and is not him. This is the
gate that gets skipped on a batch, which is why it is a field and a test now, not a paragraph.

Default deliverable: the build order in step 6, plus two A/B variants. Render only
after the build order is approved.

## The evidence this skill runs on

Everything below comes from 270 thumbnails, ten channels, each one split into a
winner band and a control band from the same channel and period, so house style and
production budget are held constant. **A trait that appears in both bands is that
channel's house style, and copying it buys nothing.** Only traits that separate the
bands are levers.

The findings, the counts and the per-channel table:
[`references/niche-evidence.md`](references/niche-evidence.md). Read it before
designing anything. It is the source of truth for this skill and it overrides any
general "viral thumbnail" advice you already believe.

The three that overturn common advice, so they are repeated here:

- **A face is not a lever.** It appears in both bands on eight of nine channels.
  Presence buys nothing; a face-forward close-up filling the frame is a control marker.
- **His face is never drawn.** A generated frame contains zero photographed pixels of
  him, and it reads as AI at a glance. A face variant is always composited from the real
  plate: `--photo` for a full-frame plate, or a real-pixel composite when the background is
  a real artifact worth keeping (see [`references/composites.md`](references/composites.md)).
  Handing the plate to the model as a reference is not compositing; it redraws him. See
  [`references/variants.md`](references/variants.md).
- **Somebody else's money is a control marker.** Client MRR, Stripe receipts, cash.
  Your own zero-to-X ladder is the one exception.
- **Hype adjectives are a control marker.** "INSANE", "UNLIMITED", "GAME CHANGER".

## Part of this skill runs in code

Where an app writes the concepts rather than a person, its instructions are a runtime copy of
the rules below, the compositions it picks from are a second file beside it, and the render path
is a third copy of the execution rules. **Change one and change the others in the same session.**

Drift here is expensive and it is silent, because a generated concept looks finished.
On 23 Aug 2026 the generator held the asset rules and the type rules and **none of the
composition evidence**, so it wrote a frame carrying a face plus five vendor marks:
six elements, which is the control-band shape this skill exists to avoid, arriving
through the skill's own pipeline. It also named a shelved product. Both rules were in
this file and neither was in the code.

## When to use

- "Make a thumbnail for my video about X", "my CTR is low, redesign this thumbnail"
- "Give me 3 thumbnail variants to A/B", "write the brief so a designer can build it"
- Any request mentioning thumbnail, cover, CTR, video frame

## Non-goals

- Channel banners, end screens, Shorts vertical covers (different aspect, different rules)
- Ad creatives and posters (use `ad-copywriter`)
- Long-form copy on the image

## Workflow

### 1. Pull the brief

Get three things. Ask once, batched, and only for what context does not already give:

1. **Video title**, the exact words YouTube will show beside the frame
2. **The promise** in one sentence: what the viewer can do after watching
3. **Who is making it**: face available, brand, and the last three thumbnails published

The title is what the pipeline currently holds, not what has to ship. Step 1b decides
whether it stays.

**Do not ask for reference thumbnails.** They exist on disk, already banded:

```bash
# build one contact sheet per channel: its 15 winners, its 12 controls
```

Ten channels are banded: `matt-gray`, `ali-abdaal`, `chase-ai`, `liam-ottley`,
`systems-made-better`, `nick-puru`, `ross-harkness`, `michele-torti`, `jordan-ross`,
and your own. Each writes `sheet-winner.jpg` and `sheet-control.jpg`. **Read both.** The
read is already written up in `references/niche-evidence.md`; re-run the script only
when the catalogues have been refreshed.

**When the sheets leave the concept shapeless, or a set starts repeating the last set**, read
[`references/sourcing.md`](references/sourcing.md): the five reference sources beyond these nine
channels, and how to take a reference's mechanism instead of its picture.

### 1b. Contest the angle

The claim, the beat that proves it, and the title it wants. Full doctrine, and why it is
a step: [`references/angle.md`](references/angle.md).

- **The claim** is what a viewer believes the second the frame is read, in their words.
- **The payoff** is the beat that proves it, **quoted** from the script or the take. A
  claim nothing pays off is bait, and bait costs more than a weak frame: the click lands
  and the watch time does not.
- **The title** is held to the same law as the words on the frame. `copy.md` bans a
  category name and a sentiment on four words and used to wave them through on the sixty
  characters beside them.

This step runs **before** the script, which is the reason it is here and not at render
time. A claim the video cannot pay off is either cut, or it is a beat the video gains
while a beat still costs one bullet. The three concepts make three different claims about
three different beats; three compositions of one claim is one concept drawn three times.

Where a take or a script exists, lift the claim out of it verbatim. A line he already
says is a promise already paid.

**The pick is recorded.** `Run with this angle` on the thumbnails stage writes `chosen`
onto the concept, and the script generator reads it as the debt the script has to settle
in its first block.

### 2. Name the one thing in the frame

Write one sentence: *"The eye lands on ___, and that tells the viewer ___."*

If you cannot fill both blanks, there is no thumbnail yet. Winners in this niche
carry one or two elements. Our own control band carries five to eight. That gap is
the single biggest difference between our wall and theirs.

### 3. Pick the variant: face or faceless

Decided by the subject, not by preference. Full decision table and the composition
rules for each: [`references/variants.md`](references/variants.md).

| | Take the **faceless** variant when | Take the **face** variant when |
| --- | --- | --- |
| Subject | A thing exists that can be photographed or screenshotted: a board, a workflow, a document, a desk, a device | The subject is a decision, a position or a change of identity, with nothing to photograph |
| Evidence | Systems Made Better: 12 of 15 winners have no person at all | Matt Gray, Ali Abdaal: the person is present but small, or holding the artifact |
| Rule | The artifact fills the frame. One label block. | One person, never two. Small in a real place, or holding one object. Never a head filling the frame. |

Both variants obey the same law: **one person maximum, and never a second face.**
1 winner in 135 has a second person; 12 of 108 controls do.

### 4. Write the words on the frame

Most of the CTR in this niche is won here, and it is the step that gets treated as a caption.
**Two to four words**, naming the job rather than the feature, bounded by a count or a duration,
and saying what the title does not. No adjective without an object.

**The frame opens the loop on its own and the title is read second or not at all**, so ask what
the viewer should wonder and what they should feel before asking what the frame should show.
**Write five wordings, not one**: the words are set in post from the concept's `type` block, so a
rewording costs a screenshot rather than a generation.

The formulas, the winner and control verbatims they came from, the ban list and the full
reasoning: [`references/copy.md`](references/copy.md).

### 5. Set the plate: contrast, type, safe area

Canvas 1280x720, judged at 320x180. One label block in one heavy condensed weight, two colours
doing work, the bottom-right 15% clear of the timestamp and the bottom-left 10% clear of the
progress bar. Two tests decide it: **the 50% test** (cover the bottom half, because that is all a
TV row shows until the viewer presses down) and **the squint test**. The measurements and the
Analytics check behind the first: [`references/craft.md`](references/craft.md).

### 5c. Fill the template

The frame is a template plus its slots, never a fresh composition. The five, and the rule
that keeps the library honest (an empty `shipped` list means a proposal, not a template):
[`references/templates.md`](references/templates.md).

### 5b to 8. Build, produce, execute, critique

The depth-and-light plate, the assets the frame is composited from, the designer handoff or the
programmatic render, and the critique that runs before delivery are in
[`references/production.md`](references/production.md).

## After it is published: the repackage loop

The title and the frame are the only two things a shipped video can still change, so this is the
procedure for "my CTR is low". It runs on the video's rank in the channel's last ten by views, not
on CTR: 1 to 3 leave it, 4 to 6 check the subject before blaming the frame, 7 to 10 repackage title
and frame together and **say the guess out loud first**. The bands, the A/B margin that means
anything, and why reviving a dead video means deleting it first:
[`references/repackage.md`](references/repackage.md).

The repair order across the whole video is subject, then title, then thumbnail, then hook.
`idea-mining` owns the first, and it is the one that moves the number.

## Reference

- [`references/angle.md`](references/angle.md) - the claim, the payoff and the title, decided before the picture
- [`references/niche-evidence.md`](references/niche-evidence.md) - what separates the bands, per channel and across channels
- [`references/sourcing.md`](references/sourcing.md) - the five reference sources, and taking a mechanism rather than a look
- [`references/craft.md`](references/craft.md) - depth, light and the floating object: why two frames holding the same things look different
- [`references/templates.md`](references/templates.md) - the five templates, the slots they ask for, and how the library learns from a frame that shipped
- [`references/composites.md`](references/composites.md) - producing the 3D tiles and artwork a frame is built from, and why prose never pins them
- [`references/anti-patterns.md`](references/anti-patterns.md) - every measured control marker in one list, plus the three craft faults. Read it at step 8
- [`references/copy.md`](references/copy.md) - the words on the frame
- [`references/repackage.md`](references/repackage.md) - the bands, the A/B margin, and reviving a dead video
- [`references/variants.md`](references/variants.md) - face and faceless composition rules
- [`references/designer-handoff.md`](references/designer-handoff.md) - the spec a designer builds from
- [`references/rendering.md`](references/rendering.md) - Nano Banana 2, models, keys, reference images
- [`references/archetypes.md`](references/archetypes.md) - the seven general archetypes, and where this niche departs from them, plus [`references/viral-thumbnail-playbook.md`](references/viral-thumbnail-playbook.md) for the general-YouTube background

## Closing a run

**A frame that shipped edits a template; a rejected one edits its `negatives`.** Both go
into `thumbnail-templates.ts` before the turn ends, with the date and the one thing the run
taught. A fault recorded only in the pattern list is one the next generation makes again,
because the generator reads the templates and not that file. Protocol:
[`references/templates.md`](references/templates.md).

## Learned Patterns

This skill appends new failure modes to its own pattern list after each run. They live in
[`references/learned-patterns.md`](references/learned-patterns.md), newest first. **Read that file
before a run**, and append to it after one whenever a run surfaces something not already there. A
learning that stays in the conversation is lost when the conversation ends.

The run each line came from, with its quotes and numbers, is in [`references/learned-patterns-archive.md`](references/learned-patterns-archive.md).