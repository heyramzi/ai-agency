# Sound

## Contents

[The kit](#the-kit), [Mix numbers from 4 creator uploads](#mix-numbers-from-4-creator-uploads),
[Produced marks, the census shelf and the keystroke](#produced-marks-the-census-shelf-and-the-keystroke)

A clip cut into a read carries its own audio track. A product film mutes this whole file (`product-film.md`).

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

Match the voice's contour to the graphic's shape. On 28 Aug 2026 the author said this about a trend chart under `sweep`:
*"the sounds you added don't convey the right thing ... it's not conveying growth. The shape motion should
follow the sound."* Grows, climbs or fills: `climb` (cut to *end* on the beat). Passes or scans laterally:
`sweep`. Lands: `click` (plus `sub` for weight). One small repeated event: `tick`. Leaves or empties:
`release` or `exit`. Resolves or holds: `settle`. A shape no voice matches gets a recorded source added to
the roster, never a new oscillator.

`<Sfx name="click" from={LANDS} />`, one `<Sfx>` per project. `from` takes the named constant the animation
reads and never a literal, or the sound drifts when somebody nudges a frame. Cut the motion to the sound and
don't score it afterwards. One voice per event, not per object (5 staggered bricks are 5 `click`s; one sweep lighting
5 cells is one `sweep`). Nothing repeats more than 4 times in a clip. Check every tail fits before the
clip ends (`shine` runs 54 frames; a truncated reverb is more wrong than none).

Licence: a pack cleared for monetised YouTube may need on-screen credit and rarely covers a client
delivery. Neither a free nor a creator tier covers a client deliverable or a paid ad, because a rendered clip
carries its sound inside the file. A paid stock plan or a commercial-use free library fixes it.

## Mix numbers from 4 creator uploads

The uploads were 3 openers of 20s and 2 bodies of 2 minutes.

| | measured | deliver |
| --- | --- | --- |
| Integrated loudness | -13.1 to -14.4 LUFS | -14 LUFS (YouTube's target; it turns loud uploads down and never turns quiet ones up) |
| Loudness range | LRA 1.1 to 1.6 | under 2.0 |
| True peak | -0.41 to -0.72 dBTP | -1.0 on the master, -1.5 on assets that will be re-encoded |
| Voice | median -20 dBFS per 43ms frame, p90 -17 | the anchor everything is set against |

LRA 1.4 is the finding: nothing in the mix is allowed to be quiet. 8 dB of range sounds amateur at the
same LUFS, since each dip drops into inaudible on a phone in a room.

There's no music bed in the body. Gaps between sentences measure -38 and -51 dBFS; a bed would put a floor
15 to 20dB higher. Music is a device that arrives for a section and leaves. A bed also forces every effect
louder to be heard, and louder effects are what over-edited means.

Density: a designed low hit every 3 to 4s and an air move every 4s (median 0.17s long) in the first 20s;
then every 7.5s and every 7.5 to 11s in the body. That's about 4 times the density in the opener, and a 12-minute body carries
60 to 90 designed sounds, well short of 500. To tell design from speech, look for energy below 60Hz (sub share above 0.22
over -34 dBFS) and air-dominated frames past 160ms.

| The edit does this | Play | Note |
| --- | --- | --- |
| graphic arrives, jump cut, scene change | `whoosh` | on the frame, never one early |
| menu, selection, state change | `ui` | 7 frames, a punctuation mark |
| number, result, point landing | `chime` | no sub, so it can play over a word |
| click on a screen recording | `click` | dry; reverb on a click is a stairwell |
| typing on a screen recording | `type-2s` / `type-4s` | cut to length, never loop |
| video start, end card | `braam` or `hype` | the 2 places a trailer sound is right |

The mix follows 6 rules. One element per beat (air or weight, not both, except `mark`). Never 2 cuts in a row
(body gaps run 7 to 11s). Land on the frame, never before it. Silence is the loudest device (cut everything for
a beat before the biggest claim). Leave 250Hz to 3.5kHz to the voice, so nothing needs ducking. Levels
are baked in, so drop files in at unity (transition -4 dBTP, chime -3, mouse -5, typing -7). The kit has no
channel mark: `mark`, `open` and `cut` were written and cut on 27 Aug 2026, and the reference channel uses none.

Source a sound in this order. Start with the kit: a struck bell, a switch or a mouse is exact to the frame.
Next comes a local model, for texture no oscillator writes (a room, a crowd, a machine, weather). Then a
library, for a real object in a real room. All transitions go here: the written whoosh measured right and
still lost to a bought one, because the room is the part no oscillator writes. A recording beats all 3 when
the object is on the desk, and it's free (a phone at 20cm and 30 seconds of typing).

