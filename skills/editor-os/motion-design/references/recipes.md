# Recipes: the long take, the live screen, the walkthrough and four more

Seven named recipes, each measured off a reference. Build one worked example of a recipe before using it.
The everyday registers (diagram, analogy, list, words over his face, a 3D object) are in
[registers.md](registers.md).

## Contents

[The long take](#the-long-take), [The live screen](#the-live-screen), [The walkthrough](#the-walkthrough),
[The code walk, the introduction, the hand-drawn and the paper board](#the-code-walk-the-introduction-the-hand-drawn-and-the-paper-board)

## The long take

Landscape, 10 to 15s, no cut: one unbroken canvas the camera travels, for an argument with more than one
step. Reference `youtube.com/watch?v=5-EFvUKqZmA` from 1:14, torn down with `ffmpeg` extraction and phase
correlation (`python3 scripts/teardown.py sheet|camera|ground src.mp4`, about 10 minutes; `camera` and
`ground` take `--ss`). Run it on your own render too: `SpecLongTake` measures 0 hard cuts, tau 0.46s and a
ground swing of 75 against the reference's 76.

1. The camera never rests: residual 0.10 to 0.31% of frame width per frame, about 0.2%. A frame that
   stops reads as a slide.
2. One settle constant, tau about 0.5s, shared by everything (dolly, counter, type). A dolly accelerates
   15 frames then decays; roughly 1 part acceleration to 4 settle (tau measured 0.28 to 0.76s).
3. 2 speeds: travel 4.0 to 4.2% per frame, drift 2.8%, residual 0.1 to 0.3% ("alive").
4. Mid-grey ground, `#6F6F6F` to `#C8C8C8`, 2 gradients multiplied; panels are the light thing.
5. Type is a live per-word flow: words land 100 to 170ms apart, each larger, lighter and blurred,
   travelling in as it darkens and shrinks. Sentence case is legal because it's the conclusion the read
   hasn't reached yet.
6. A counter starts at half the target, accelerates, decays on tau and lands exact ($5,006 to $10,000
   over 2.3s), so frame one is a plausible number.
7. A comparison is a visual rhyme: same card, position and connector twice, recoloured.
8. The UI is vector, so it can be lit, blurred and typed into.
9. A held comparison (second reference, 1:30 to 2:11) gains one label per phrase within about 0.2s of its
   word, the label the compressed noun ("40x more followers"), moves between objects as a fast blurred whip.
   At 12s against a 41s reference, the build lost the 2 return legs. The fix: 5 stations, a label every 50 frames. Use it when
   the read spends 30s or more on one comparison; use the travelling shape when the argument moves places.

Build (`src/specimens/LongTake.tsx`): `<Shot ground="daylight" cameraX cameraY>`, one `<Canvas>` per
sequence wider than the frame, elements at world coordinates, the camera a transform on the canvas. Nothing
has an entrance (a fade timed to the camera's arrival renders a grey wall with a line across it).
Primitives in `motion.ts`: `settle(frame, from, to, at)` at tau 0.45s, `countTo`, `wordFlow`. No hard cut.
Clock: establish 15%, build 45%, conclude 25%, pull back and hold 15%. The palette was Meta's because the
subject was: map the structure onto brand tokens, never copy the hex. One per video, on the beat that carries
the argument.

## The live screen

A real interface at poster scale filling the frame, where its own state change is the beat: no window, ground,
shadow or pointer. Reference `youtube.com/watch?v=SFRXddv7XfE` 2:29.67 to 2:45.70: visit one 295 frames (page
arrives empty, gets annotated, loads), a face beat of 32, visit 2 at 154 (pushed in, section swap, selection).

- Roughly 250% zoom with the window thrown away; the query's already typed and nobody operates anything.
- The annotation is a second voice and the only thing that glows: monospace mint `#2EE3BF`, a lead line
  one word every 6 frames, notes one character per frame (both about 22 chars/sec), the note starting before
  the line above finishes.
- It clears, then 17 frames of nothing before results arrive. Deleting the pause is the first cut a
  session makes and it breaks the beat.
- The page loads like a page: 3 rows 3 frames apart, the plate settling up about 5% of frame height,
  done 27 frames after the first row. Then 99 frames dead still, only a caret blinking at a 32-frame period.
- The section swaps by a 24-frame cross-dissolve, the old page still about 12% readable 18 frames later (the
  one cross-dissolve allowed: a page replacing itself). The selection band lands in 4 frames, never a drag,
  0.7s before the words naming it.
- Plate `#383A40` to `#2E3034`, a 2px scanline at 5 levels, untilted.
- The reference restates the read at 2:29, breaking redundancy: copy the device and skip the copy.

Build (`src/anchors/LiveScreen.tsx`; `design.ts` section C holds the numbers): 1920x1080, tokens
`screenCore/Edge/Panel/Ink/InkMuted/Scanline` untinted, `MONO_FONT` (a fixed advance makes per-character
reveal read as a machine writing), no alpha variant. Words are props; re-render, don't fork. The artefact
must be the real thing: real favicons, URLs, titles and answers, taken off a real search. It runs under a
voice that never stops; timed against silence it's 30% too slow. Tools: `teardown.py cuts|palette|sheet`.

## The walkthrough

A client's own flow, shown slowly for onboarding or an SOP: a window on a desk, an honest cursor, one speed.
Unlike the live screen, somebody operates it. The numbers come from Anthropic's Claude Motion review notes (Oct 2026)
and we haven't measured a film of our own yet, so build one worked example first.

- Story before code: per flow, 4 to 8 beats. A beat holds a region, the action on it and at most 1 caption. A beat you
  can't caption in 4 words is 2 beats. Chapter titles are verbs ("Share it").
- Build the window at real CSS pixels, about 1440x900 on the 1920 stage, so the camera has room. UI text
  reads at about 26px on screen or more, so 14px UI wants at least 1.9x. A beat zooms 1.6 to 2.4x, and
  the whole window never holds past about 1.2s.
- Camera moves 0.55 to 1.2s, then a 1.4 to 2.2s hold on each point of interest before anything else
  happens. The cursor travels 0.5 to 0.9s on an arc and settles 200 to 300ms before the click.
- A spotlight dims everything outside the region to about 55%, off while typing. A caption is a chip with a
  leader line, sitting in the dimmed area, 6 words at most, never "successfully", never repeating a tooltip.
- No speech bubbles over UI, no highlighter rectangles, no toast firing off-frame. A screen that isn't
  shipped yet gets a small grey `Concept mock · Month YYYY` on the closing card.
- Lift the UI, don't redraw it: build from the repo or the running page, and record what you took in
  `SOURCES.md` (component file:line, tokens, `getComputedStyle` sizes of the buttons the camera frames, and
  each value marked approx). `:hover` never fires in a render, so hover, selected and open states are
  `data-*` attributes switched by frame. Prefix each lifted screen's classes, since 2 screens sharing
  `.composer` silently restyle each other.

## The code walk, the introduction, the hand-drawn and the paper board

Code walk (30 Aug 2026): a file at poster scale, no window, no syntax colours. Use it when the proof is
code a viewer could check. The camera settles on one line, the rest drops to 30%, a margin note says why,
3 seconds still, then a second line that makes one argument with the first. The numbers come from `code-scroll`:
21 frames still, a 36-frame 196px symmetric-ease travel, a 14-frame dim starting 2 frames before the
travel ends (to about -14% luminance; started after the move it reads as 2 events), then 87 frames still.
2 stations, never 3. Silent.

Introduction (30 Aug 2026): nothing introduces itself. A question is typed into a composer on the pale
wall, the assistant thinks, the answer is the product, a claim somebody else made. Off
`blue-sweater-intro-video`, 288 frames at 24fps: line 2 to 12, composer 35 to 60, typing 104 to 132, hold
132 to 283 (6.3s, over half). A cut on the click makes it an ad. The question asks for the category, never the
product. Draw the wait (36 frames of one breathing dot). The field leaves before the card lands. A single
pointer and click (the one operated screen, because the cursor is the point). Generic composer skin; length
set through `askDuration`.

Hand-drawn (the default for a new clip; anything else needs an argument): paper, one marker colour per video, geometry a
machine didn't make. 3 pieces: a seeded wobble (so it doesn't boil) with rough primitives, an ink layer
(everything draws on; a fade-up reads as composited), a paper ground with no key light, vignette or glow.
Draw the analogy as the thing itself, with no symbol standing in ("why don't you simply use the actual metaphor of the lobster
restaurant"): the redundancy rule bars drawing the words but allows drawing the world. Logos stay real marks on a rough
tile. Draw a creature at its familiar angle: top-down, the lobster was a beetle at 45 degrees and a rabbit
at 20, and it cost 3 passes.

Paper board (vertical, from a 62.5s Reel, 1080x1920, 24fps; sources live in `sources.json`): a light
gridded ground, the speaker demoted to a card at the foot, one real screenshot as the subject, one karaoke
word between. Top to bottom, fixed for all 62s: a 2-line headline (the load-bearing half in accent red), the
artefact at about half the height, one karaoke word, the speaker in a rounded card at about 35% of frame width.
18 hard cuts, median gap 3.46s, alternating board and full-bleed face; karaoke changes every 0.35 to 0.40s,
one word, never a phrase; the headline builds grey, resolves black and red. 4 palette values. It needs a
light ground, a face plate built against real raw footage, a one-word-per-cue karaoke track and screenshots
(somebody else's screen, so the licence goes in the ledger). Nothing is drawn. The work is capture, layout and cadence.
