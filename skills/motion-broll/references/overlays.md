# Overlays: words over the speaker's face

Every clip in this project used to be one thing: a full-frame graphic that replaces the picture for
a few seconds. An overlay is the other thing. It keys over the speaker, the speaker stays on screen, and the graphic
is on top of the shot rather than instead of it.

That is a different deliverable, and most of what SKILL.md and `craft.md` say about type does not
apply to it. This file holds what does.

## Which register a beat wants

Ask what the beat needs the viewer to be looking at.

- **The speaker's face, plus a list the speaker is reciting** → an overlay. The speaker is the proof and the words are the
  index. Taking the speaker off screen to show the list costs the proof.
- **A structure, a quantity, a mechanism** → a full-frame clip. It needs the whole frame and the
  viewer needs to stop watching a face to read it.
- **A screen the speaker is demonstrating** → neither. Use the screen recording. A graphic over real evidence
  argues with it.

An overlay is also the cheaper of the two to be wrong about. A full-frame clip that misses costs
four seconds of the video; an overlay that misses is just some words nobody needed.

## The two registers, and the rule that separates them

`caption.tsx` holds both.

**`GlassCaption`** puts the words on a frosted pane. Reach for it when the list is long enough to
need holding together, when it is a set rather than a statement, or when the plate behind it is
bright or busy. This is the reference: a slab left of frame, checked list on it, the speaker's face in the
right two thirds.

**`PlainCaption`** puts the words on nothing. One statement, two lines, three at the outside. It is
harder to land and better when it does, because nothing about it reads as a graphic.

Neither is the default. A video that only ever uses the pane has a lower third; a video that only
ever uses bare type has subtitles.

## Sentence case here, uppercase labels everywhere else

`type.ts` bans sentences, and it is right for what it covers. A full-frame clip's words compete with
the read, so they stay to six-letter uppercase labels: a caption on a diagram, not a headline.

An overlay is the case where the sentence is the point. The speaker is saying the list out loud and the words
are what the speaker is saying. Set them in sentence case, in the brand font, at weight 500, to be read.

Which rule applies is decided by **what the clip replaces**, never by preference:

| The clip | The type |
|---|---|
| **is** the picture | `type.ts`. Uppercase, tracked out, labels only. |
| **sits on** the picture | `caption.tsx`. Sentence case, brand font, read as text. |

Mixing them inside one video is what makes a set look like two hands. A tracked-out uppercase list
over footage reads as a warning label; a sentence-case paragraph inside a diagram reads as a slide.

## Rows land one at a time, on the speaker's words

A list that arrives complete has told the viewer the last item while the speaker is still saying the first,
and the rest of the sentence is spent catching up to a graphic that got there first.

Cut the stagger from the read: count the frames between the first and the last thing the speaker names and
divide by the number of rows. Never pick a number because it looks even.

## Three things that only fail over footage

These all render clean, typecheck clean and exit zero. Only a still composited over a bright card
catches them, which is why the verification step exists.

**Cream text on a bright wall disappears, and a soft shadow does not save it.** A wide blur darkens
the *field* behind the glyph, never its edge, so cream on cream stays a value collision. `legible()`
is three shadows: a zero-offset tight one that acts as an outline, a contact shadow, and the field.
The outline is the load-bearing layer. Even then, a caption over a blown-out wall is a shot problem
before it is a type problem: move the words, or use the pane.

**The key light behind bare type is a grey disc on the speaker's wall.** `<Shot alpha>` keeps a third-strength
key because it is what makes a *graphic* look like it is in the same room. Words are not an object
in the room. Pass `lightStrength={0}` on any overlay whose whole content is type.

**`backdrop-filter` cannot make the glass.** It samples what is painted behind the element in the
same document, and an alpha render has nothing behind it, so it returns the blur of nothing and
ships a flat tint. Descript keys the file over the footage long after this render finishes. `Glass`
in `src/glass.tsx` is the whole answer: seven layers that rebuild what a blurred pane looks like out
of parts that survive an alpha channel. Read its header before changing any of them.

## The file it has to come out as

Same route as the CTAs, and for the same reason: **Descript only keys the MOVs.**

Register the alpha version as its own composition with `defaultProps={{ alpha: true }}` and
`calculateMetadata={alphaPreviewWebm}`, then render ProRes 4444 through `remotion.prores.config.ts`
and convert to `qtrle` with ffmpeg. Remotion cannot write QuickTime Animation directly. A Studio
export silently inherits h264 from the b-roll config and arrives as a video with a black rectangle
where the transparency should be.

The `render:*-mov` scripts in `tools/motion/package.json` are the pattern. Copy one.

## Verify it against a bright card, not against the ground

A still of an alpha composition opens as transparent, which tells you nothing about whether the type
survives. Composite it over the worst case:

```bash
npx remotion still src/index.ts <CompId>Alpha out/x.png --frame=<n> --image-format=png --log=error
ffmpeg -f lavfi -i color=c=0xd8d3c8:s=1920x1080 -i out/x.png -filter_complex "[0][1]overlay" \
  -frames:v 1 -y out/x-on-light.png
```

`#d8d3c8` is about the value of the wall and sofa behind the speaker. If it reads there, it reads anywhere
in that room.
