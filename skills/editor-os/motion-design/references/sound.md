# Sound

## Contents

[The kit](#the-kit), [On the contact frame](#on-the-contact-frame), [Produced marks, the census shelf and the keystroke](#produced-marks-the-census-shelf-and-the-keystroke)

A clip cut into a read carries its own audio track. A product film under a bed mutes this whole file; one
scored by its contacts lives on it (`product-film.md`).
This file is the clip's own voices. Which sound a moment on screen takes, the mix levels, density and
licence are the `sound` skill's.

## The kit

Keep one roster of every sound file with an id and a job per entry, and cut your motion kit's voices from it,
so the sound a clip names is the same sound every time. The kit this was measured on is 11 effect voices
cut from 12 sounds 2 finished edits used, plus 2 sine marks: `tick` `dot` `click` | `enter` `exit`
`sweep` `climb` `release` | `sub` | `shine` `settle` | `stamp` `bloom`.

The oscillators went on 8 Sep 2026. The kit was 17 sine voices on one chord: *"I don't like the
sounds used in the motion design. These are not classical YouTube video editing sounds."* It's checkable: a
human edit puts almost nothing in 600 to 4000Hz (where a voice carries intelligibility) and splits events into
air above and weight below, while the sine kit sat at 20% presence with zero energy above 2.5kHz and read as UI.

The kit follows 6 rules. Nothing sits in 600 to 4000Hz (the exception is `climb`, a riser). The split is by
family: an arrival or a landing is air, a move is weight. Noise is the instrument and pitch the exception (the
chimes, 4 to 14kHz). There's no synthesised room. A voice joins the kit when a finished cut used its source
(membership is a census). A name maps to a single instrument, so a quieter or shorter version is `volume` on
`<Sfx>` and never a new name. A
voice at zero calls in `src/` is the next to go: the kit went from 18 names to 13 (`tap` measured
53% inside 600 to 4000Hz so it became `dot`; `pop` measured 77% under 160Hz so it became `sub`), after the
census kit beat 2 Mixkit-pool kits (*"I think the ones of today are actually good"*, then *"but maybe we
have a little bit too many"*).

Match the voice's contour to the graphic's shape.
A trend chart under `sweep` doesn't convey growth, so the shape's motion has to follow the sound.
Grows, climbs or fills: `climb` (cut to *end* on the beat). Passes or scans laterally:
`sweep`. Lands: `click` (plus `sub` for weight). One small repeated event: `tick`. Leaves or empties:
`release` or `exit`. Resolves or holds: `settle`. A shape no voice matches gets a recorded source added to
the roster, never a new oscillator.

`<Sfx name="click" from={LANDS} />`, one `<Sfx>` per project. `from` takes the named constant the animation
reads and never a literal, or the sound drifts when somebody nudges a frame. Cut the motion to the sound and
don't score it afterwards. One voice per event, not per object (5 staggered bricks are 5 `click`s; one sweep lighting
5 cells is one `sweep`). Nothing repeats more than 4 times in a clip. Check every tail fits before the
clip ends (`shine` runs 54 frames; a truncated reverb is more wrong than none).

## On the contact frame

A sound's hit sits on the frame the motion makes contact, never on the cue that starts it. Contact is
the last frame whose step is still a quarter of the move's biggest step: the frame the shape arrives, after
which it only settles. "Within 4% of the target" is wrong for near-critical springs, since the last 4% crawls
and put clicks 2 to 3 frames after the shape stopped on the Seam film. So `from` is the cue plus the
spring's computed contact (`contact(config)` in the Seam film's `physics.ts`), never a
typed frame. A move that must stop dead on its hit (a counter digit, a file dropping) is an ease-in
`slam`, not a spring, because a rebound keeps the picture moving past the click. A cue whose outline keeps
its size makes no contact and gets no sound; a click on a content fade reads early.

The tolerance is 1 frame. The Seam film measured 56 hits at median 0.24 and max 0.45 frames (15 ms), so
anything past 1 is a bug, not taste. Check it off the render, never the code: render once with the camera
held (a moving camera changes every pixel, and the frame difference then measures the camera), write the
intended hits from the same constants as JSON, and run
`uv run scripts/sync.py <render.mp4> --hits hits.json --plot sync.png`. It measures each audio onset and each
motion contact off the file and exits 1 on any sound more than `--tol` frames out. Give a morph whose
content blurs in after its outline `"metric": "outline"`.

