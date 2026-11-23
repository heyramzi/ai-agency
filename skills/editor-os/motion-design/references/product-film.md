# The product film

## Contents

[Story first](#story-first), [The 10 defaults](#the-10-defaults),
[Owner rules, where they meet the reference](#owner-rules-where-they-meet-the-reference),
[Springs and camera](#springs-and-camera), [Sound](#sound),
[Overrides to the rest of the skill](#overrides-to-the-rest-of-the-skill), [Build order](#build-order)

A self-contained film: 15 to 25 seconds for a launch, no voice-over, the product the only actor, with the
sound laid on the locked picture. It isn't a clip cut into a read. The numbers come from the Spotify spec ad
in Rourke's "Claude Opus 5.5: How To Make Motion Graphics" (YouTube `cDb-wPq0Iyk`, 2:09 to 2:29), with the
Candy Crush and AirPods spots from the same video, torn down on 23 Nov 2026 (TSK-3427), and from 8 launch
films measured on 2 Nov 2026. `uv run scripts/teardown.py gate <render.mp4>` holds the measurable ones and
exits 1 on a fail: it's the done check, never a look at the file.

The rest of the skill takes its clock from the read. Here there's no read: the product makes the argument
and its own transforms set the clock. With the clip-cut-to-a-read playbook, a session builds 15 scenes and
cuts them together, which is the failure this file prevents.

## Story first

The Airtable to Sheets launch film took 4 rounds (TSK-3326), and each round failed the story before the
craft. v1 was a 64 s slideshow of wide shots with tiny text. v2 gave a read-only switch its own beat and a
settings montage another: "too many details... shorter, focus on the storytelling of the essential it does".
v3 drew its attachments as SVGs: "the images are fake images, it should be real ones". v3 then measured 28%
still frames and 31% of its runtime as cards on a blank ground.

- **One core loop, 15 to 25 s.** Name the one thing the product does and show it happening. For a sync
  product that's a change crossing each way. WHY: every beat that isn't the loop is a beat the viewer has to
  file, and 20 s holds one idea.
- **Secondary features and settings never get a beat.** A plan, a toggle, a filter or a schedule folds into
  the content cycle (default 5) or stays off screen. WHY: v2's read-only beat and settings montage were what
  the author cut first.
- **Every image, avatar and attachment is a real licensed photo**, never a drawn placeholder: Unsplash or a
  library whose licence covers the launch, saved into the project with its source. WHY: a drawn picture is
  the one thing in a photoreal UI that reads as fake, and the eye goes to it.
- **Plan it as text first:** the loop, the one object, each beat's transform into the next and the slot
  its claim lives in. Where the product takes input, the sentence typed into it is the pitch, in the user's
  words. If it doesn't read as a story there, no motion rescues it.

## The 10 defaults

Each is the reference's measured practice. Ours, where measured, is the Airtable v3 render.

1. **Every shot transforms into the next: 0 hard cuts at scene 0.3.** Spotify ran 20.1 s with none: the disc
   morphs to a squircle to a square (about 0.5 s a stage), the square becomes album art and opens into a
   player, the player becomes a playlist card, the cards a wall, the wall turns edge-on into a phone, the
   dock pushes in to the icon, the icon grows its wordmark. No cross-dissolves. The one allowed cut is a
   match cut on the object's own outline (AirPods, twice in 9.2 s: run the gate with `--max-cuts`).
   WHY: a cut tells the viewer the last shot is finished; a transform keeps one object alive.
2. **Nothing is still: under 2% still frames, no still run over 0.2 s before the end card.** Spotify: 1%
   and 0.16 s. Ours: 28% of the file, its longest 2.84 s on the end card. Every hold is a slow drift, a float or a few degrees of rotation.
   WHY: a still frame reads as a slide, and the video's tip 5 says it outright: "there should at least be
   some camera motion or something moving in the frame".
3. **One subject, dead centre, 40 to 75% of frame height.** The disc sits at (50.0%, 50.0%) and 39.6% H,
   the phone 59.4% H, the player 74% H. Never 2 whole windows side by side, which is what put our Status
   cell off centre at under 5% H. WHY: the eye never hunts; the world moves around a fixed point.
4. **The claim lives in the product's own text slot, or beside it.** "Millions of songs." is the player's
   track title, rolled in like the 4 titles before it, at 7.0% H. AirPods sets "2x" and "30 hours" beside
   the case. Mid-film cards on a blank ground: 0 across the 3 no-voice ads; ours spent 31% of its runtime
   on them. A claim is 1 to 4 words, plain speech, a question or a fact; slogans ("Your notch, put to
   work.") and triads read as slop. WHY: a card on bare ground stops the film to talk about it.
5. **Breadth is a fast content cycle.** 4 album covers in 1.0 s, 0.25 s each, the glow re-tinting to each
   cover, then a wall of about 30 tiles yawing past says "millions" with no number. WHY: it shows "any
   base, any table" in a second, where a feature list takes a beat each.
6. **Real UI turns in as a 3D object.** The iPhone enters edge-on and spins to face in about 0.32 s, stands
   59.4% H tilted about 5°, and real screenshots slide across its screen in about 0.3 s. A desktop product
   gets its real window as a floating object with perspective and a soft shadow, turning in the same way.
   WHY: a flat 1:1 window reads as a screen recording; a turned object reads as filmed.
7. **Shallow depth of field on every shot.** Centre 3 to 20 times sharper than the edges (Candy 3.1x, the
   player about 13x, the phone about 20x). A 2-plane rack focus isn't it. WHY: "it gives that look that it
   was shot on an actual camera" (tip 7).
8. **A dark ground lit by a glow in the product's or content's colour.** Corners at luminance 4 to 9, the
   glow behind the subject at 37 to 170, in its hue (Spotify's green, then each cover's). No flat fills,
   no white ground. WHY: the subject is the only lit thing in frame, and the film already sits on the
   dark ground it has to end on.
9. **Type slides up word by word, at about 7% of frame height.** Cap height 7.0 to 7.7% H; each word rises
   from a mask in 0.2 s, the next 0.32 s later, no fade, no bounce, no per-letter effect. One weight,
   sentence case, a silver-to-grey gradient on a dark ground. The end card's name is about 13% H.
   WHY: it reads at phone width, and letters fading in are the template look tip 9 bans.
10. **Sound laid to the picture: a hit on every transform, the name on the loudest moment, a 2 s close.**
    Spotify runs 3.0 onsets a second and 6 of its 11 transforms sit within 120 ms of a hit (about 19% by
    chance). Its loudest half-second is the wordmark, and the end card holds 2.0 s (Candy 2 s too) on the
    object the film opened with. WHY: the video's own side-by-side, silent against scored, is the
    difference ("Massive difference, right?").

## Owner rules, where they meet the reference

- **Photorealism and the real screen (SKILL.md rules 4 and 5) carry the proof.** The device's screens are
  real screenshots of the product as on the recording day. A drawn shape may carry a transition only when
  it's built from the product's own shapes (its icon, its card, its cell) and resolves into the real screen.
- **Self-explanatory beats the claim.** The mute test still runs with every word hidden: the loop has to
  read from what happens on screen, and the claim in its slot only names it.
- **Real logos, real photos.** The logo is the real mark (SKILL.md rule 5); every picture in the UI is a
  licensed photo (Story first).
- **The dark ending.** One glow behind the one subject, never a flood and never a second glow
  (`storytelling.md`: the near-black set called "extremely ugly" had a grid and blooms on 4 objects).
  End on the dark ground, never on a full gradient.
- **The direction gate still runs first**: one still per look before a new set (SKILL.md rule 1). These
  defaults are what each look is built in, not a reason to skip showing it.

## Springs and camera

Take the product's own springs for its own UI, since people already know that feel. SwiftUI's
`(response, dampingFraction)` converts exactly to Remotion: stiffness (2π/response)², damping
4πζ/response, mass 1. Seam's were open 0.32/0.88 (the one overshoot), close 0.4/1.0, resize 0.3/0.95,
arrive 0.3/0.8, content 0.35/1.0 and 3 frames behind the shape, never bouncing. Film-only curves: a
press 0.22/0.55 (one rebound reads as a key), a word rising into its line 0.42/0.78. Anything alive in
the product (a waveform, a meter) plays as a frame sequence from the app's own renderer: 2 stills
crossfaded read as "the waveform does not look photorealistic at all" (2 Nov 2026).

Interaction is the UI changing state (a title rolls, a screen slides, a value lands); none of the 4 ads
shows a cursor. Where a person driving it is the point, a rendered cursor arrives 3 to 5 frames before
what it triggers, or the UI looks self-driving.

The camera is one critically damped follower. A leg sets a target and a rate (natural frequency in
1/frames): 1/12 to travel, 1/40 to push in while a screen works, 1/80 to drift. Position and speed stay
smooth through each change of target, so a leg cut short never jumps. It never quite arrives either, so the
frame never goes still. Scale follows in log space (0.93 to 2.0 feels even), with a few degrees of tilt
into a fast move.

```ts
// per frame, 4 sub-steps, for x, y and log-scale alike
v += (w * w * (target - pos) - 2 * w * v) * dt;
pos += v * dt;
```

## Sound

Visuals first, sound last (tip 6): lock the picture, then lay the sound on its transforms. Never cut the
picture to a bed's bar grid: the Spotify transforms sit 0.16 to 2.6 bars apart, off any grid.

- A whoosh or impact on every transform, from a pro library whose licence covers the launch (the `sound`
  skill), and every contact (a snap, a press, a value landing) its click from `sound.md`, at the contact
  frame. One sound per contact, not per element: 14 sounds across one camera move rattled in one
  film, and a sound under another's ring is inaudible, so silence that cue.
- A bed under the effects. Pick its excerpt by RMS per 0.5 s so its loudest moment falls on the name, or
  generate one to the film's exact length. `teardown.py tempo <track>` gives its bar.
- The music leaves over the 2 s close: Spotify falls to -17 dB on its last half-second.
- Check sync on a render with the bed muted, since its drums read as hits 5 to 8 frames off:
  `sound.md#on-the-contact-frame`.

## Overrides to the rest of the skill

The clock is the film's own transforms, and the SRT plays no part. Rung 1 is the film (the real screen is
the argument). Type is the word-by-word slide-up above. The deliverable is one film whose direction is
picked at the gate, with no 3 designs per beat. Unchanged: real logos and screens beat abstractions, one
shared motion file, every decision carries its WHY.

## Build order

0. Direction gate, one still per look, each built in the 10 defaults.
1. Tear down the films in its class with the `video-reverse-engineer` skill and copy the closest one's
   structure.
2. The story as text (Story first): the loop, the one object, each beat's transform, each claim's slot.
   Source and license every photo now.
3. Lay the world out in space so the camera travels between states, and check every render and fixture
   you'll reuse for placeholder geometry (SKILL.md rule 5).
4. Camera path, then screens, then the words in their slots.
5. Still every transform's midpoint and resolve, and frame 0: it's the thumbnail, so it shows the product
   close and already moving. A bare ground at frame 0 ships a blank thumbnail.
6. Render, then `uv run scripts/teardown.py gate out/film.mp4`. It measures length, still frames, the
   longest still run, hard cuts at 0.3, the subject's centre and the share of cards or bare ground, and
   prints the seconds of each fail. `--end` sets the end card's length (default 2 s, exempt from the still,
   centre and card checks). Fix the named seconds and re-run until it exits 0.
7. Lay the sound on the locked picture; `scripts/sync.py` puts every hit within 1 frame.
8. Watch the whole file once at speed with sound on: the only check that catches a transform that drags.

The gate was set on 23 Nov 2026: the Spotify ad passes it (1.1% still, 0.16 s run, 0 cuts, 1% card, 88%
centred) and Airtable v3 fails 4 of its 6 checks (21% still, 0.87 s runs, 12% card, 39% centred). Depth of
field, the glow and type size aren't in it yet, so step 5's stills check them by eye against the numbers
above.

Outside packs hold patterns worth stealing: `github.com/vibe-motion/skills` (story-pattern beat tables,
asset authenticity), `github.com/heygen-com/hyperframes` (typed prompt, motion doctrine), and Remotion's
`3d.md` for a device or keycaps in 3D (vendored at `remotion/remotion-markup/3d.md`).

Done when: the gate exits 0, the film is one core loop in 15 to 25 s, every photo is real and licensed,
every transform has its hit, the name sits on the loudest moment, and one watch at speed found no drag.
