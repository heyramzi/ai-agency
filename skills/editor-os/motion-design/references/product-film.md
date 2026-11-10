# The product film

## Contents

[The 6 laws](#the-6-laws), [The score](#the-score), [The 6 moves, and no seventh](#the-6-moves-and-no-seventh),
[Overrides to the rest of the skill](#overrides-to-the-rest-of-the-skill),
[Build order](#build-order),
[A worked build: 39 seconds on one canvas](#a-worked-build-39-seconds-on-one-canvas)

A self-contained film: about 25 to 30 seconds for a launch, no voice-over, the product the only actor, scored
to one licensed bed. It isn't a clip cut into a read. The numbers come from 8 launch films measured on 2 Nov
2026 (iPhone 14 Pro Dynamic Island, Raycast Pro, Raycast 2026, Arc 1.0, Linear Releases, Notion Mail,
Cursor 2.0, Superhuman) and a 95.3s launch film for a table-based research product.
`uv run scripts/teardown.py all <film.mp4>` reproduces every number from any mp4 (`cuts`, `cards`,
`tempo <track>`, `palette`); run it on your own render before calling it done.

The rest of the skill takes its clock from the read and says a graphic must not repeat the sentence. Here
there's no sentence. The product makes the argument, the cards speak for it, and the music sets the clock.
With the clip-cut-to-a-read playbook, a session builds 15 independent scenes and cuts them together, which
is the failure this file prevents.

## The 6 laws

1. **One object owns the frame.** The iPhone's island sits centred for 20s; Linear is one graph for 21s;
   Seam's notch never leaves. Hook with that object by 2.5s, never with a claim. A change of subject is a
   move (push in, pull back, drift, rack focus) or the object changing state, never a cut to another world,
   because a cut tells the viewer the last shot is finished. Talking heads and slow typed intros
   (Superhuman, Cursor) felt slowest of the 8: none in a 30s film.
2. **Build slow, then cut fast, on the bar grid.** Single-feature beats run about 2.2s; the montage changes
   every 0.85 to 0.93s (at 128 BPM, a bar, then half a bar). Section changes land on bar downbeats. Cutting
   on every onset isn't what good films do: of the 8, only Raycast Pro beat chance. Compute every cue from
   the BPM (`Math.round(n * BAR)`), never from a typed frame.
3. **Cards carry 1 to 4 words and alternate with the UI, never sit on top of it.** Median 2 in Raycast Pro,
   3 to 4 in Notion. Plain speech, a question or a fact: "See that black bar?", "This used to be dead
   space.", "Claude waits up here.", "No notch? You get a pill.", "Seam for Mac". Slogans ("Your notch, put
   to work.") and triads ("Music, meetings, focus. All in the notch.") read as AI slop to the author and went.
   A card runs 0.3 in, a hold, 0.2 out and 0.2 empty; the empty frames read as a new thought, where a
   crossfade reads as one thought being edited.
4. **Tell one story, never a feature list.** The object carries 4 to 6 beats; each is a card, then the
   product doing exactly that (real UI at real size, a cursor driving it). Where the product takes input,
   the sentence typed or dictated into it IS the pitch, so those words are the user's and not a caption.
   Many features fold into the montage or a "works with" slot of real app icons, never a beat each: the
   Seam master ran 70s of 12 feature captions in a row, "no real storytelling" (2 Nov 2026).
5. **Show the expanded state, with real content.** An expanded view shows a feature; a compact one only
   hints at it. Render it from the app: Seam's Claude usage came from a snapshot test feeding a fixture to
   the view, since demo injection was debug-only. Now Playing plays the song the film is scored to, with its
   real artist and a clock reading the song's real position at that frame. Never a fictional band.
6. **The name lands on the loudest moment, and the ending is the music leaving.** Fade 40 dB over 4 to 8s,
   or drop to silence, and hold the end card 3 to 4.5s. One word per card may carry a highlight: a pale
   tinted rounded rectangle wiped on from the left in about 0.2s after the line settles. Never 2.

## The score

Pick the bed before the first frame, and pick the excerpt by its energy map. Print RMS per bar
(`ffmpeg astats` per bar window), find a quiet build into a drop, and lay the film on that grid: Seam ran
"I Do!" (Michael Ramir C., Mixkit) bars 50 to 63, two quiet bars, the drop at bar 54 under the montage, the
music cut out before the card. Start the excerpt on a phrase so downbeats stay on the grid. Never change
the track after `beats.ts` exists. Which licence and library: the `sound` skill.

Every contact (the snap, the press, the digit) still gets a click from `sound.md`, at half volume under the
bed. One sound per contact, not per element: 14 sounds across one camera move rattled in one
film, and a sound under another's ring (a `tick` 7 frames into `settle`) is
inaudible, so silence that cue. Check sync on a render with the bed muted: the bed's drums read as hits and
put every one 5 to 8 frames "off". Timing and the check: `sound.md#on-the-contact-frame`.

## The 6 moves, and no seventh

1. Push-in and pull-back, the workhorse: scale the canvas steadily (the best moment is a pull-back from
   a focused row to the full 247-row table).
2. The focus stack: the row at centre sharp, the rest falling off in blur, opacity and scale. It's a
   depth-of-field rig.
3. The gradient wipe: a blue silk mesh sweeps diagonally across the frame, covering and then uncovering it.
4. The type dissolve: characters leave non-sequentially ("Introducing" goes to "In rod ci"), at random per
   character, never as a reverse typewriter.
5. The parallax storm: 14 real logos drifting up at 4 depths. Use it once, at the loudest bar.
6. The cursor handoff: a rendered cursor with real easing travels to a cell, a popover opens, text streams
   in. It arrives 3 to 5 frames before what it triggers, or the UI looks self-driving.

**The gradient is punctuation.** It's dominant for 11.7s of the research film's 95, in 4 windows (title,
one wipe, act break, end card). It's the only saturated frame, so it works as a full stop; anywhere else it
means nothing. Build it as an animated mesh (mind the per-frame cost), never a static image with a scale on it.

Colour comes down to one hue and the product. Ground `#F9FAF5` falling to `#EAEAEC` in the corners, never pure
white. Ink `#1A1A1B`, never pure black. One hue. Everything else comes from the product UI (avatars, score
bars, real logos), so anything coloured on screen is the product: value before hue at its strictest.

The type is the voice. One weight, sentence case, one line, centred, about 4% of frame height, no tracking
tricks, no second size on screen. This contradicts `craft.md`'s labels-only rule, which protects a clip
against a talking head. It's correct for this register and wrong for the others.

The moves that made the Seam film, as SwiftUI `(response, dampingFraction)` converted exactly to Remotion
(stiffness (2π/response)², damping 4πζ/response, mass 1). Take the product's own springs for its own UI,
since people already know that feel: open 0.32/0.88 (the one overshoot), close 0.4/1.0, resize 0.3/0.95,
arrive 0.3/0.8, content 0.35/1.0 and 3 frames behind the shape, never bouncing. One black shape, in its
real outline (SKILL.md rule 3), morphs through every form the product takes, notch to floating pill
included ("we need to show that it can morph into a pill as well"); a cut between forms loses the object.
Anything alive inside it plays as a 30fps frame sequence from the app's own renderer (a snapshot test that
freezes time per frame). 2 stills crossfaded to fake the voice glow read as "the waveform does not look
photorealistic at all" (2 Nov 2026). Film-only curves: a press 0.22/0.55 (one visible rebound reads as a key), a
word rising into its line 0.42/0.78. The camera is a critically damped follower of each leg's target, with
scale followed in log space and a few degrees of tilt into a fast move, so a leg cut short never jumps.

## Overrides to the rest of the skill

The clock is the bed's bar grid and the SRT plays no part. Rung 1 is the film (the real screen is the
argument). Type is sentence case, set to be read. Cuts land on section downbeats and the end card. The
deliverable is one film whose direction is picked at the gate, with no 3 designs per beat. Unchanged: the
direction gate runs first, real logos and screens beat abstractions, one shared motion file, every decision
carries its WHY.

## Build order

0. Direction gate, one still per look.
1. Tear down the films in its class and write the beat sheet with the `video-reverse-engineer` skill,
   then copy the closest one's structure. Granola's 21s launch reads: keycaps with side walls and motion blur,
   a glowing pill over a real Claude chat box, the dictated text that is the instructions, a "works in any
   app" icon slot, a hard cut to the logo.
2. Choose the bed and its excerpt: `teardown.py tempo <track>` and RMS per bar. Everything is a multiple of
   that bar.
3. Plan the story in a text file before any code: the one object, then each beat's card beside its proof.
   If it doesn't read as a story there, no motion rescues it.
4. Lay the canvas out in space before animating, so the camera travels between screens. Check every
   render and fixture you'll reuse for placeholder geometry.
5. Camera path, then screens, then cards last.
6. Still every card's hold frame and every proof's resolve frame, and look at all of them. Frame 0 too:
   it's the thumbnail, so the object is already there and the first card's entrance starts about 0.5s
   before 0. A bare ground at frame 0 ships a blank thumbnail.
7. Watch the whole file once at speed with sound on: the only check that catches a bar that drags or a move
   that reads as a cut.

Outside packs hold patterns worth stealing: `github.com/vibe-motion/skills` (story-pattern beat tables,
asset authenticity), `github.com/heygen-com/hyperframes` (oversized cursor, typed prompt, motion doctrine),
and Remotion's `3d.md` for physical keycaps (vendored at `remotion/remotion-markup/3d.md`).

It fails 4 ways, and each has a check. A feature list: more than 6 beats or past 30s, so fold features into
the montage. A slideshow: `teardown.py cuts` finds cuts off the downbeats or away from the object. Slop
copy: a card past 5 words, a slogan or a triad. The cards outrun the product: product time runs about half
again the card time.

Done when: one object owns the frame from 2.5s, 4 to 6 beats, every cue on the bar grid, cards of 1 to 4
words between the UI, the name on the loudest bar, the music leaving at the end, and one watch at speed.

## A worked build: 39 seconds on one canvas

A screen-recorder app: 39.2s at 30fps, with 8 claims over 4 live screens and one bed.

- The bar is the clock. The bed measured 124.02 BPM, so a bar is 1.935s or 58.06 frames. Round once per
  bar with `Math.round(n * BAR)`; round per beat and a fractional bar summed 30 times drifts a frame a bar.
  The first guess borrowed the reference's 54-frame bar and the cards sat short of the music.
- Claims and proofs share one canvas, screens 3000 world pixels apart. During a claim the camera is between
  2 stations and neither phone is in frame, so the card gets a blank frame without a cut.
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
  between the last proof and the end card. Cutting it and starting the bed 8 bars in put the bed's lift on
  the last proof.
