---
name: youtube-thumbnail
description: "Use when a video needs a thumbnail or a cover, when click-through is low and a frame has to be redesigned, when two variants are needed for a YouTube A/B test, or when a brief has to be written that a designer or an image model can build without re-deciding anything. Also use before commissioning thumbnails, so the evidence pass happens first. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: Requires Node 20 or later for the renderer
---

# YouTube Thumbnail

A thumbnail gets one second on a five-inch screen, in a feed, beside nine other
frames. Most advice about that second is a style opinion repeated until it sounded
like a rule. This skill replaces the opinions with a measurement you run yourself,
then turns the result into a frame.

Two decisions run the whole thing and neither is a matter of taste:

1. **Face variant or faceless variant** (step 3). Decided by what the video is about.
2. **Designer handoff or programmatic render** (step 7). Decided by who executes.

Default deliverable: the build order in step 6, plus two A/B variants. Render only
after the build order is agreed.

## The one idea this skill runs on

Look at a channel's best thumbnails and you will find a hundred shared traits. Almost
all of them are that channel's house style, and copying house style buys nothing,
because the same traits are all over its worst thumbnails too.

**A trait is only a lever if it separates the winners from the controls inside the
same channel.** Same brand, same photographer, same budget, same period. Anything
present in both bands is noise wearing the costume of a finding.

Banding is the first step of the workflow and there is no shortcut past it. How to
build the two bands, how many frames you need, and how to read them without fooling
yourself: [`references/banding.md`](references/banding.md).

Three results that show up again and again once frames are banded properly, and that
contradict what most thumbnail advice says. Verify them in your own niche before you
trust them anywhere:

- **A face is often not a lever at all.** It tends to appear in both bands. Presence
  buys nothing; a face-forward close-up filling the frame is frequently a *control*
  marker. What separates is how big the person is and what job they are doing.
- **Somebody else's money is usually a control marker.** Client revenue, payment
  notifications, fans of cash. Your own zero-to-X ladder is the exception, because
  that is a transformation rather than a proof.
- **Adjectives with no object are control markers.** "INSANE", "UNLIMITED",
  "GAME CHANGER". Hype is what gets written when the specific thing has not been
  found yet.

## When to use

- "Make a thumbnail for my video about X"
- "My CTR is low, redesign this thumbnail"
- "Give me two variants to A/B"
- "Write the brief so a designer can build it"
- Any request mentioning thumbnail, cover, CTR, video frame

## Non-goals

- Channel banners, end screens, vertical Shorts covers. Different aspect, different rules.
- Ad creatives and posters.
- Long-form copy on the image.

## Workflow

### 1. Pull the brief

Three things, asked once and only for what context does not already give:

1. **Video title**, the exact words YouTube will show beside the frame
2. **The promise** in one sentence: what the viewer can do after watching
3. **Who is making it**: face available, brand, and the last three frames published

### 2. Band the niche

Build a winner band and a control band for every channel you are learning from, then
read both. A read of winners alone produces confident nonsense.

Full method, including the sampling rule and the replication bar:
[`references/banding.md`](references/banding.md).

Do this once per niche, write it down, and reuse it. It is the expensive step and it
is the one that makes everything after it cheap.

### 3. Name the one thing in the frame

Write one sentence: *"The eye lands on ___, and that tells the viewer ___."*

If you cannot fill both blanks there is no thumbnail yet. Winning frames carry one or
two elements. Losing frames carry five to eight. That gap is usually the single
biggest difference between a good wall and a bad one.

### 4. Pick the variant: face or faceless

Decided by the subject, not by whether a camera was available. Full decision table and
the composition rules for each: [`references/variants.md`](references/variants.md).

| | Take the **faceless** variant when | Take the **face** variant when |
| --- | --- | --- |
| Subject | A thing exists that can be photographed or captured: a board, a workflow, a document, a desk, a device | The subject is a decision, a position or a change of identity, with nothing to photograph |
| Rule | The artifact fills the frame. One label block. | One person, never two. Small in a real place, or holding one object. Never a head filling the frame. |

Both variants obey the same law: **one person maximum, and never a second face.**
A second person in frame is one of the most consistent control markers there is.

### 5. Write the words on the frame

This is where most of the click is won, and it is the step that gets treated as a
caption for a picture that was already decided. Six formulas, the ban list, and the
procedure for generating and cutting candidates:
[`references/copy.md`](references/copy.md).

The short version:

- **Two to four words.** Five is the ceiling and it has to be a sentence.
- **Make a claim, do not name a category.** "a CEO only has 3 jobs" beats "CEO Dashboard".
- **Bound it.** A count, a duration, a deadline, or the whole scope.
- **Say what the title does not.** The frame and the title are two sentences, not one.
- **No adjective without an object.**

### 6. Set the plate: contrast, type, safe area

- Canvas 1280x720. Judge everything at 320x180, because that is the render that decides it.
- One label block, one weight, one size. Heavy sans. A solid colour tab behind the words
  survives a feed card far better than an outline.
- Two colours doing work, not five. A third only as a single accent.
- Keep the bottom-right ~15% clear of the timestamp overlay and the bottom-left ~10%
  clear of the watched-progress bar.
- **Squint test.** Blur it until the words are gone. If the one thing from step 3 still
  reads, it passes.

### 7. Write the build order

Output exactly this, before anything is drawn or rendered:

```
THUMBNAIL BUILD ORDER
Title:        <video title as published>
Promise:      <one sentence>
Variant:      face | faceless
The one thing:<what the eye lands on, and what it tells the viewer>
Frame:        <what is photographed or composited, framing, where the subject sits>
Words:        "<2-4 words>"  | placement | plate colour
Plate:        <background, the two working colours with hex>
Assets:       <exact files, by path>
Not in frame: <what was deliberately left out and why>
Why it wins:  <which banded finding this bets on>
```

Then two variants, changing **one** variable each, so an A/B test gives a clean signal:
variant B changes the words only, variant C flips face <-> faceless with the same words.

### 8. Execute

Both routes start from the same build order.

**Designer handoff.** The build order becomes a one-page spec: layout diagram, exact
strings, hexes, fonts, asset paths. Nothing left to interpret, nothing re-decided later.

**Programmatic render.** An image model, with your own photographs and objects handed in
as reference images so identity is photographic rather than invented. The renderer, the
prompt template, the composite rule and the failure table:
[`references/rendering.md`](references/rendering.md). A working script ships in
[`scripts/render.mjs`](scripts/render.mjs).

### 9. Critique before delivery

Run this on the finished frame, not on the plan:

- [ ] At 320x180 the one thing from step 3 is unmistakable
- [ ] One or two elements, not five
- [ ] Exactly one person, or none. No second face anywhere
- [ ] **Open the hands at full size and count the fingers.** Then the eyes, then every glyph
- [ ] Words are 2-4, make a claim, and are not a restatement of the title
- [ ] No hype adjective, no borrowed money, no numbered ramp of generic icons
- [ ] Nothing readable is asked of the viewer: no legible dashboard, chart or spreadsheet
- [ ] Two working colours; the plate fights the white YouTube UI
- [ ] Bottom-right 15% clear
- [ ] Distinct from the last three frames published
- [ ] New failure modes appended to Learned Patterns

Two or more failures means rebuild, not retouch.

## Anti-patterns

- A second person in the frame
- A head filling the frame
- Somebody else's money: client revenue, a payment notification, a revenue curve, cash
- A numbered ramp of generic icons: "PHASE 1..5", "STEP 1..4"
- A halo of eight or more unlabelled icons around a head
- An adjective with no object
- A screenshot the viewer is asked to read
- A category label where a claim belongs
- Five to eight elements competing
- Series numbering as the promise: "MINI COURSE DAY 1"
- One template reused for every upload; click-through decays from pattern fatigue
- Copying a winner's composition without reading that channel's control band first

## Reference

- [`references/banding.md`](references/banding.md) - build the two bands, and read them honestly
- [`references/copy.md`](references/copy.md) - the words on the frame
- [`references/variants.md`](references/variants.md) - face and faceless composition rules
- [`references/rendering.md`](references/rendering.md) - the renderer, the prompt template, the failure table

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run
surfaced one that is not already listed, append it to Learned Patterns with today's date
before finishing. A learning that stays in the conversation is lost when the conversation
ends.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- Hands are the failure the reviewer misses, because the eye reads a plausible silhouette
  as correct. A composite pass fused four fingers into one blade and added a whole second
  hand, and both survived a checklist that said "no mangled hands". **Open the crop at
  full size and count.** Better still, pick a source frame with no hands in it: a model
  cannot mangle what the photograph never had.
- General viral-thumbnail advice will override measured evidence if it is written higher
  up the file, because it is familiar and the measurement is not. Put the banded findings
  first and demote the general playbook to background.
- Asking a model to change the expression on a real photograph distorts the face, and the
  distortion lands worst on the feature the eye checks first. Keep the real photo, let the
  model build everything around it.
- An instruction to blur text is followed about half the time; the other half comes back
  with confident fake words. Re-render rather than accept it, and say "no letters, no
  words, no readable characters" rather than "blurred".
