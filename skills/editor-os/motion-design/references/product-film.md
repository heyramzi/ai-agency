# The product film

## Contents

[The 5 laws](#the-5-laws), [The 6 moves, and no seventh](#the-6-moves-and-no-seventh),
[Overrides to the rest of the skill](#overrides-to-the-rest-of-the-skill),
[Build order](#build-order),
[A worked build: 39 seconds and no cuts](#a-worked-build-39-seconds-and-no-cuts)

A self-contained film: 30 to 120 seconds, no voice-over, no cuts, one music bed, the product the only actor.
It isn't a clip cut into a read. We measured one reference, a launch film for a table-based research product,
95.3s at 60fps. `python3 scripts/teardown.py all <film.mp4>` reproduces every number here from any mp4
(`cuts`, `cards`, `tempo <track>`, `palette`); run it on a film before copying its look.

The rest of the skill takes its clock from the cut and says a graphic must not repeat the sentence. Here
there's no sentence to repeat. The graphic makes the argument and the type speaks for it, while the music sets
the clock. With the clip-cut-to-a-read playbook, a session builds 15 independent scenes and cuts them
together, which is the failure this file prevents. The reference has no cuts in 95 seconds.

## The 5 laws

1. Use one camera on one canvas, and no cuts. Scene detection finds none at a 0.06 threshold. A change of
   subject is always a move: push in, pull back, lateral drift, rack focus, gradient wipe. A scene that has to
   appear fades up inside the moving frame. A cut tells the viewer the last shot is finished, and a move says
   it's the same world.
2. The bar is the edit unit. 133.3 BPM, beat 0.450s, **bar 1.80s**; across 32 cards the line-to-line cycle
   clusters at 1.70 to 1.78s. One card gets one bar; the lines that carry the argument get two (3.47, 3.57,
   4.32s measured); nothing gets less than one. Cut to the bar's length and don't snap to the downbeat (phase
   scatters plus or minus 0.25 beat, and with no cuts there's nothing to snap). Rhythm is how long a thing
   stays. Pick the track first, then measure its bar and build `beats.ts` in multiples of it.
3. Inside a bar, the beats run 0.3 in, then a 1.0 hold, then 0.2 out and 0.2 empty. In fast, hold still, out
   faster than in (weight arrives, then leaves), then a real gap of blank frame (measured 0.08 to 0.55s,
   typically 0.20s). People cut the gap, and it's the part that matters. Crossfading A into B reads as one
   thought being edited. A gap reads as a new thought.
4. Run claim then proof, 7 times. A typographic claim takes one bar on a blank frame, with one centred line
   and no product visible. Then the product does exactly that (4 to 8s, real UI at real size, a cursor driving
   it). Claims may pair as setup and turn ("Don't call the main line." then "Directly."). The reference hits
   3 in a row twice, its ceiling, because past 3 the type has outrun the product and it's a manifesto. Run
   about 3 seconds of product per 2 of type. Write each claim so the next 5 seconds can falsify it. A tour
   without the claim line is a screen recording.
5. One word carries the highlight. Plain near-black type, except one word on a pale tinted rounded
   rectangle, wiped on from the left in about 0.2s after the line settles (`Directly.`, `already`, `CRM`,
   `LinkedIn`). Never 2. The highlighted word can swap in place while the line stays fixed ("Do all your
   `prospecting` in the product." to `lead research` to `lead generation` to `go-to-market`, 4
   positionings over 3 bars).

## The 6 moves, and no seventh

1. Push-in and pull-back, the workhorse: scale the canvas steadily (the best moment is a pull-back from
   a focused row to the full 247-row table).
2. The focus stack: the row at centre sharp, the rest falling off in blur, opacity and scale. It's a
   depth-of-field rig.
3. The gradient wipe: a blue silk mesh sweeps diagonally across the frame, covering and then uncovering it.
4. The type dissolve: characters leave non-sequentially ("Introducing" goes to "In rod ci"), at random per
   character, never as a reverse typewriter.
5. The parallax storm: 14 real logos drifting up at 4 depths, type pinned centre. Use it once, at the
   loudest bar (54 to 58s).
6. The cursor handoff: a rendered cursor with real easing travels to a cell, a popover opens, text streams
   in. It arrives 3 to 5 frames before what it triggers, or the UI looks self-driving.

**The gradient is punctuation.** It's dominant for 11.7s of 95, in 4 windows (2.4 to 5.0 title, 9.6 to 10.7 one
wipe, 62.3 to 66.6 act break, 91.5 to 95.2 endcard). It's the only saturated frame, so it works as a full stop;
anywhere else it means nothing. Build it as an animated mesh (mind the per-frame cost) and never as a static
image with a scale on it: the folds move independently, which stops it reading as a PNG.

Colour comes down to one hue and the product. Ground `#F9FAF5` falling to `#EAEAEC` in the corners, never pure
white. Ink `#1A1A1B`, never pure black. One hue, blue silk `#73AFCC` to white. Everything else comes from the
product UI (avatars, score bars, real logos), so anything coloured on screen is the product: value before hue
at its strictest.

The type is the voice. One weight, sentence case, one line, centred, about 4% of frame height, no tracking
tricks, no second size on screen. This contradicts `craft.md`'s labels-only rule, which protects a clip
against a talking head. It's correct for this register and wrong for the others.

The music is one bed with no stems, no drop and no silence. Loudness runs -20 to -13 dBFS in the first half
and -13 to -10 in the second; it builds and never breaks, because a drop demands a cut. There are 2 earned
lifts: 54 to 58s under the storm, and 81 to 94s under the closing proof and endcard. Use no sound effects.
One per element across an uninterrupted move is a rattle (14 across one camera move rattled in the first
cut). Cut the picture to the track, and choose the track before the first frame; never change it after
`beats.ts` exists. `sound.md` doesn't apply.

## Overrides to the rest of the skill

The clock is the track's bar grid and the SRT plays no part. Rung 1 is the film (the real screen is the
argument). Type is sentence case, set to be read. Sound is one bed. Cuts are zero. The deliverable is one film
whose direction is picked at the gate, with no 3 designs per beat. Unchanged: the direction gate runs first,
real logos and screens beat abstractions, one shared motion file, every decision carries its WHY.

## Build order

0. Direction gate, one still per look.
1. Choose the track, `teardown.py tempo <track>`; everything is a multiple of that bar.
2. Write all claim lines first as a flat list of 9 to 12, with the one highlight word marked. If it
   doesn't read as an argument in a text file, no motion rescues it.
3. Pair each claim with its proof on one page.
4. Lay the canvas out in space before animating, so the camera travels between screens uncut.
5. Camera path, then screens, then type last (pinned to the frame and independent of the canvas).
6. Still every claim's hold frame and every proof's resolve frame, and look at all of them.
7. Watch the whole file once at speed with sound on: the only check that catches a bar that drags or a move
   that reads as a cut.

It fails 3 ways, and each has a check. A slideshow: `teardown.py cuts` should read zero. The type outruns
the product: product time runs about half again the type time. The bars drift (one card at 1.4s, the next at
2.6s): `teardown.py cards` on your render should show a flat cycle column.

Done when: zero cuts, a flat cycle column, product time above type time, and one watch at speed.

## A worked build: 39 seconds and no cuts

A screen-recorder app: 39.2s at 30fps, with 8 claims over 4 live screens and one bed.

- The bar is the clock. The bed measured 124.02 BPM, so a bar is 1.935s or 58.06 frames. Round once per
  bar with `Math.round(n * BAR)`; round per beat and a fractional bar summed 30 times drifts a frame a bar.
  The first guess borrowed the reference's 54-frame bar and the cards sat short of the music. The 3 opening
  lines hold 0.75 bar (2 or 3 words read in 1.4s), later claims one bar, proofs 2 to 3, the dullest proof (a
  chat) at 1.5x.
- Claims and proofs share one canvas, screens 3000 world pixels apart. During a claim the camera is between
  2 stations and neither phone is in frame, so the claim gets a blank frame without a cut. It leaves 22
  frames before each claim lands.
- The proofs are live code. The first cut faded between PNGs in device mockups, so nothing on screen did
  what the type said. Port the product's own screens (an AI writing a script, a teleprompter following a
  voice, review striking retakes). People believe a claim when the next 5 seconds show it happening.
- One critically damped camera. A leg sets a target and a rate (natural frequency in 1/frames): 1/12
  to travel between stations, 1/40 to push in while a screen works and 1/80 to drift under a claim. Position and
  speed stay smooth through each change of target, so a leg the bar grid cuts short never jumps, and it never
  quite arrives, so the frame doesn't go dead. Scale follows in log space (0.93 to 2.0 feels even), plus 2
  slow sines of a few pixels.

  ```ts
  // per frame, 4 sub-steps, for x, y and log-scale alike
  v += (w * w * (target - pos) - 2 * w * v) * dt;
  pos += v * dt;
  ```
- Fit the film to the music by cutting shots. The first version ran 29.5 bars with a slow bar and a half
  between the last proof and the end card. Cutting it and starting the bed 8 bars in (a whole phrase, so
  downbeats stay on the grid) put the bed's lift on the last proof. Measure each bar's RMS with `ffmpeg
  astats` before picking the start.
