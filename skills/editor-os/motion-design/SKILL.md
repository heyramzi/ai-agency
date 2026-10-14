---
name: motion-design
description: "Motion graphics for video: a Remotion clip, figure, caption, 3D object or CTA, or a product film with no voice-over. Use when a video needs a clip that isn't the presenter's face, or on a Remotion or HyperFrames question."
tags: [makes, video, remotion]
lane: visual
vendored:
  - references/remotion
---

# Motion design

The clips live in a Remotion project at 30fps, rendered at 2 native frame sizes: **1080x1920** for anything cut into a Short, and
**1920x1080** for lessons and long-form YouTube. Keep each frame's size and safe band in its own constants
file, so a portrait clip can never pick up the landscape numbers. Landscape isn't portrait rotated
(`references/craft.md`).

We build 4 of the 5 registers here. The fifth is a found shot: a meme, a film beat or a piece of archive is
a shot somebody else made, and a borrowed frame can't ship where a drawn one can without a licence check. Keep
those clips in their own folder. This skill decides what a beat should show and draws it. In a Short, a
beat that names a tool, object, screen or place is `broll`'s, and motion goes on every beat that needs one.

This isn't a general video skill. Getting clips into the editor and placed at a phrase is `video-edit`, and writing the
read is `video-script`. The vendored Remotion references (`references/remotion/remotion-*/REFERENCE.md`, one
folder per job) are the engine and hold no taste: one that seems to contradict this file is describing a
default. To re-vendor, replace the `remotion/` folder whole from the published agent-skills package.

## 3 rules that outrank the rest

1. **A new set waits for the owner to pick a look; a comment he left doesn't.** Show 2 or 3 directions as a
   single still of the same beat, in a local `.html`, then stop and ask (`references/storytelling.md`). He
   called a 20-clip set made before he saw a frame "ugly and too complex". His comment is already the pick, so
   build it, and never ask ("stop asking questions, do it").
2. **A clip adds something the sentence didn't say.** That's a quantity made comparable, a consequence left
   implicit, a structure with no name yet, or a recognition. If none of those fits, his face goes there
   instead. A right clip on the wrong sentence is a wrong clip. A word he says, typed into the clip, adds
   nothing: the captions already carry it. Show what the word means happening: "GitHub can be scary" is a
   repo that turns out to be the folder they know, never "scary" struck out on a card.
3. **Draw the actual thing, and make the set one video.** "AI Skill System" shipped 8 neutral geometric
   marks, and nobody recognised their own stack in a hexagon. Show the artefact before its logo: a beat on
   Make gets the scenario running, a course gets the lesson page inside it (`broll` 2b). A logo is the
   real mark (simple-icons, else a logo API by domain, never an image search). A product that exists (Claude,
   ClickUp, Descript, a real app screen) is its real UI, never a brand-styled glass card. Brand cards are for ideas and claims. 15 correct clips that each open on an
   empty frame make a slideshow. Aim for a single world, a motif that changes and one motion language
   (`motion.ts`, `references/craft.md`). A motif that returns is one component with fixed node positions
   (one rail component did): centred on the count, a fourth node moved the first three.

## Which branch

- No read (no voice-over, no face, no transcript): a product film. The type is the only voice and the clock
  is the music; the reference films have zero cuts in 95 seconds. `references/product-film.md` replaces the
  clock, type and sound rules below.
- Which cell a line gets, or what to do when none fits: `references/placement.md`.
- A CTA, lower third or end card, evergreen and reused for years: `references/ctas.md` (someone else's channel
  or a CTA described in plain words: the `cta-creation` skill).
- Which renderer? Stay in Remotion for anything reusing your tokens, scenes or
  components; reach for HyperFrames (HeyGen's HTML renderer, installed on demand, never vendored) for a source
  that's already a web page or GSAP file, a throwaway, or a client-run deliverable (`references/render.md`).
- A diagram, analogy, list, words over his face or a 3D object: `references/registers.md`. A named recipe (long
  take, live screen, a client walkthrough, code walk, introduction, hand-drawn, paper board):
  `references/recipes.md`. Sound: `references/sound.md`.

## Steps

The `motion-designer` agent runs one beat; these steps run a whole set.

3. Run `editor-os motion place --line "<the line>"` and take its pick, or `editor-os motion --find "<the line>"` and pick the cell whose use-when line says what the beat
   needs (`editor-os motion rules` says when b-roll wins). A miss is a bespoke clip built from the kit's primitives and tokens, never a near miss, and your report names the job that's missing (`references/placement.md`).
4. Fill it with the beat's own words (`fill <Template> --prop=value`), taking the job's first cell, or its second only for the reason its tag gives.
5. A still per phase per clip, composited over a real frame of its second, and every frame of each reveal
   (`craft.md`, verify by looking). Look at every one: the brief's face box stays clear (one set put 6 of 18 on the face). Silent invisibility survives a clean render. Then render the mp4s and, for anything meant to key, the
   MOVs (`references/render.md`). Done when nothing is invisible, cut off or unreadable.
6. Watch every rendered file with `scripts/watch.py`, one review subagent per clip scoring 7 axes; fix the 3
   worst, re-render, score again. Done when every axis reads 8 or more (`references/craft.md`, verify by looking).
7. Hand the clips to your editor, named `N [mm-ss] Description.mp4` with a letter suffix for alternatives on
   one beat (`2a`, `2b`). Importing a clip isn't placing it: put each on the timeline at its phrase and check.
   Done when each clip sits on the timeline at its phrase.
8. Write down any failure mode this run surfaced, dated, and read it before the next run.

