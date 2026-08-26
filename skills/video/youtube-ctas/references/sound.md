## Sound

Every CTA carries its own audio track, generated rather than sampled. `scripts/build-sfx.py`
synthesises the kit into `public/sfx/`, `src/youtube-ctas/sfx.tsx` pairs a voice with a frame, and
`<Sfx name="tap" from={8} />` sits directly above the `interpolate(frame, [8, 24], ...)` it lands
on, so the two move together.

Four rules are what make it read as 2026 rather than 2015:

- **No noise in any voice.** Filtered noise with a moving cutoff is the whoosh, and the whoosh is
  what dates a kit. Every voice is sine oscillators only. Noise appears once, inside the reverb
  impulse, where it is what a room is made of and is never heard alone.
- **A tail is most of what "cinematic" means.** A dry blip reads as a web app, a tail reads as a
  film. It costs one FFT convolution against a synthesised impulse, lowpassed to about 2.2kHz
  because a bright tail sounds like a plugin preset and a dark one sounds like a space.
- **One chord, and the middle left empty.** A major, A2 to A5. Everything sits below 250Hz or above
  550Hz, so a voiceover keeps its range and no CTA has to be ducked in the edit.
- **The width is in the room, not the note.** The dry sine is centred and the two channels are wet
  into impulses built from different seeds, so a clip folds down to mono for about 1dB.

Six voices: `enter` and `exit` (a pill arriving and leaving, written as a rising and falling
interval rather than as air), `tap` (an icon), `shine` (the hero, the chord arpeggiated over 75ms
then left to ring for 1.7s), `sub` (a landing, with an octave up so a phone speaker hears it),
`dot` (a comment dot, a link line, a handle).

Generated rather than bought because a library whoosh is cut to somebody else's clock, while a
generated file is exactly as long as the beat under it. If a pack is ever wanted anyway: Epidemic
Sound paid and cleared for YouTube, Pixabay free, `romainsimon/uisfx` for CC0 cues. Skip the sfxr
family, it makes arcade blips.

Levels land at -9 to -19 dBFS and nothing needs a compressor in the edit. Check every tail fits
before the clip ends: `shine` runs 54 frames, and a truncated reverb is more obviously wrong than
no reverb at all.

Verify by measuring, not by listening once:

```bash
ffmpeg -v error -i out.mov -f s16le -ac 2 -ar 48000 -y /tmp/a.raw
# Peak per frame: 1600 samples is one frame at 30fps. Onsets must land on the frames the component
# names, and the last frame must read silent, which is how you know no tail was truncated.
```
