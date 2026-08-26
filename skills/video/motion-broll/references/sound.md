# Sound

The kit, and the rule that the picture is cut to it. Read before adding a voice to a clip.

The kit is `tools/motion/scripts/build-sfx.py` and it is generated, never hand-edited: twelve voices,
one chord (A major, low), one room, all sines and no noise anywhere except inside the reverb impulse.
Six are the CTA voices - things arriving and announcing themselves. Six are the b-roll voices -
things happening to objects under a sentence, mixed 5 to 10 dB quieter because they play under a
read rather than in a pause.

`enter` `exit` `tap` `shine` `sub` `dot` | `click` `tick` `sweep` `release` `snap` `settle`

Play one with `<Sfx name="click" from={LANDS} />` from `src/sfx.tsx`, placed in the markup directly
above the element it belongs to.

**`from` takes the same named constant the animation reads. Never a literal.** A sound whose frame
is written twice drifts the moment somebody nudges one of them, and a sound landing two frames off
its picture reads as cheap long before anyone can say why. This is the whole reason `<Sfx>` exists
as a component instead of an `<Audio>` written inline.

What follows from that: **the motion is cut to the sound, not scored afterwards.** If a beat has
three events, it has three voices and three named frames, and retiming the beat moves both. A clip
whose sounds were added at the end always has one voice on a frame that no longer matters.

Two mixing rules that are not taste:

- **One voice per event, never one per object.** Five bricks landing on five staggered frames get
  five `click`s because each is an event. Five cells lighting inside one sweep get one `sweep`,
  because that is one event with five parts. The second mistake sounds like a drum fill.
- **Nothing repeats more than four times in a clip.** A `tick` that fires nine times is a metronome
  under the read. Tick the first pass and let the eye carry the rest.

