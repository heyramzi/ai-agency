---
name: youtube-thumbnail
description: "Designs YouTube thumbnails: a build order or a render, for the founder, systems and AI-tooling niche. Use when a video needs a thumbnail, CTR is low, or on 'thumbnail', 'YouTube cover', 'thumbnail A/B'."
allowed-tools: Read, Write, Edit, Bash, WebFetch
tags: [makes, design, youtube]
lane: visual
---

# YouTube Thumbnail

You get one second of attention on a 5-inch screen, against 9 competitors whose frames are already
measured. Default deliverable: the build order (step 6) plus 2 A/B variants. The author approves the build order before anything renders. Not for banners, end screens, Shorts covers (other aspect) or ad
posters (`conversion`).

**Evidence first.** The set is 270 frames from 10 channels, each split into a winner band and a control band
from the same channel and period. A trait in both bands is house style, so it moves nothing. Read
[`references/evidence.md`](references/evidence.md) before designing: it overrides general "viral
thumbnail" advice.

**His face is never drawn.** A generated frame holds zero photographed pixels of him and reads as
AI at a glance. A face frame is composited from the real plate (`photo`, `composite` or
`edit-pass`), never a plain model run. The template's `route` field is this gate. Details in
[`references/rendering.md`](references/rendering.md).

Concepts are written against the rules below and stored on the video's record; the templates and
the render path copy the execution rules. **Change one, change the others in the same session.**

## Workflow

1. Pull the brief. Ask once, batched, only for what context lacks: the exact title, the promise
   in one sentence, who is in frame and the last 3 thumbnails published. Don't request
   reference thumbnails, because they're on disk, banded, one contact sheet per channel (read both bands).
   Slugs and the read: `evidence.md`. Done when you've read a winner and a control sheet.
2. Contest the angle before any script: the claim, the proof line quoted from the video, and the
   title the claim wants. Shapeless concept or a set repeating the last one: sourcing section of
   [`references/angle.md`](references/angle.md). Done when each of the 3 concepts makes a
   different claim about a different beat, and each proof line is a quote.
3. Name the one thing. Write "The eye lands on ___, and that tells the viewer ___." Winners
   carry 1 or 2 elements; our own control band carries 5 to 8. Done when both blanks
   are filled.
4. Pick face or faceless by the subject: a thing you can photograph or capture means faceless;
   a decision or position means a small face. One person maximum, never a second face. Table and
   shapes: `evidence.md`.
5. Write the words, 5 wordings, formulas and ban list in
   [`references/copy.md`](references/copy.md). The frame opens the loop; the title is read second
   or not at all. Done when the 2 survivors each make a claim and neither restates the title.
6. Set the plate and fill a template. Canvas 1280x720, judged at 320x180. Pick the template
   before writing a word of the frame: `tsx scripts/thumbnail-template.ts list` from `app/`, then
   [`references/templates.md`](references/templates.md). A concept naming none is unfinished.
   Depth, light and the plate tests: [`references/craft.md`](references/craft.md).
7. Write the build order, produce assets, execute, critique. Template and checklist in
   [`references/production.md`](references/production.md); render and composite mechanics in
   `rendering.md` and `composites.md` (when the frame carries a logo, card, screenshot or overlay type). Done when every critique line passes on the finished frame, at full resolution.

Before delivery, and before any repackage goes live, title and frame together grade 8 or more on
`pnpm jev loop packaging title.txt --thumb frame.jpg` (loop: `vibe-kit/ai-doc/references/content-grade.md`).

## After it ships

"My CTR is low" runs on the video's rank in the channel's last ten by views: 1 to 3 leave it, 4 to
6 check the subject first, 7 to 10 repackage title and frame together and say the guess out loud
first. Bands, A/B margin and the revive rule: repackage section of `angle.md`. Repair order is
subject, title, thumbnail, hook; `video-script` owns the subject.

**A frame that shipped edits a template; a rejected one edits its `negatives`.** Write both into
`thumbnail-templates.ts` before the turn ends, with the date and the one thing the run taught,
and the generator reads the templates, never the pattern list.

## Learned Patterns

New failure modes go in [`references/learned-patterns.md`](references/learned-patterns.md), newest
first. Read it before a run and append after one when a run surfaces something new.
