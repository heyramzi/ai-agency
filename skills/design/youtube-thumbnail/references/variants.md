# The two variants: faceless and face

Step 4 of the workflow. The choice is made by what the video is about, not by whether a
camera was available.

The background, in one line: **once frames are banded, a face usually appears in both
bands, so presence is not a lever.** What separates is how big the person is and what
job they are doing.

## The decision

Ask one question: **is there a thing that can be photographed or captured?** A board, a
workflow canvas, a document, an inbox, a desk, a device, a printed page.

- **Yes** -> faceless variant. The thing is the subject.
- **No**, the subject is a decision, a position, a change in how someone works ->
  face variant, person small.

Two tie-breakers:

- If the promise is *"you can copy this"*, always faceless. The viewer has to see the
  thing they would copy.
- If the promise is *"you should stop doing this"*, face variant works, because a
  position needs somebody holding it.

---

## Faceless variant

Often the strongest single result in a banding pass, and reliably so on channels whose
subject is a system or a tool rather than a person.

### Composition

- **The artifact fills 60 to 80% of the frame.** Not floating in a corner, not shrunk to
  make room for type. If it is worth a thumbnail it is worth the frame.
- **Photograph it in a real place.** A desk with a mug, a laptop at an angle, a printed
  page. A flat screenshot on a coloured plate is the control version of this frame.
- **One label block**, on the emptiest third, never over the part of the artifact that
  carries the idea.
- **One arrow, at most**, pointing at the single thing that matters.
- **Dim what must not be read.** If a screenshot is in frame, blur or darken it to about
  30% behind the words. A readable dashboard is a control marker almost everywhere.

### What kills it

- A screenshot the viewer is asked to read
- Two artifacts competing, a board and a phone
- A brand logo larger than about 8% of the frame, unless the brand *is* the subject
- A flat plate colour with nothing photographic in it

---

## Face variant

One person. Never two. A second person in frame is one of the most consistent control
markers there is, and it never runs the other way. No guest, no client, no team, no
testimonial face beside yours.

Three shapes work. Pick one.

### Small in a real place

The person occupies 15 to 30% of the frame height, inside a room, a landscape or a studio
that is doing the talking. This is the shape that replaces the close-up.

- Environment first: it has to be somewhere, not a backdrop
- Two to four lowercase white words, no plate
- The person is the scale reference and the proof a human is in it

### Holding the artifact

Mid-shot, the person holding up something they made: a filled notebook, a framework drawn
on card, a printed page, a book.

- The hands prove the artifact is real, which is the whole job
- The artifact must be legible as an object, even when its content is not readable
- Eyes to camera is fine here; the artifact still owns the frame

**Cost warning.** This shape is the highest-risk composite there is, because it puts hands
at the centre of the frame and an image model will fuse fingers, add a second hand, or
both. If you are rendering rather than photographing, either shoot the hold for real or
pick a different shape. See [`rendering.md`](rendering.md).

### The two-icon equation

Not a portrait at all, but it is the face-variant slot on tooling videos: two app icons
and a plus sign on a solid house colour, with a two-word benefit in caps. Three or more
logos drops it to control.

- Exactly two icons, large, with real drop shadow
- Two words
- The person, if present, is a small cut-out at the edge, not the subject

### What kills it

- A head filling the frame
- A second person, in any role
- A halo of eight or more unlabelled icons around the head
- A pointing gesture at a floating app window
- An exaggerated shock face. Check your own bands: it is common in controls and rare in
  winners in a lot of niches, and a max-saturation palette goes with it.

---

## Building a reusable plate set

If you appear on your own thumbnails, shoot a **set** of plates once rather than pulling
a frame from each video.

- Real camera, not a webcam. The sensor difference is visible at 320px.
- One expression per take, several frames each, so blinks do not cost you the expression.
- Name them `<expression>-<copy-space>-<nn>` where **copy-space names the EMPTY side**, so
  `confident-left-07` has the subject on the right and the left clear for type.
- Shoot deliberate **hands-free** frames, cropped at mid-chest. These are the safest
  possible base for a composite, and you will reach for them constantly.
- Shoot desk and workspace frames in the same session. They are better raw material for
  the faceless variant than a face plate is for the face variant.
- Export faithfully: colour-convert, crop, sharpen lightly, and stop. Gamma, CLAHE and
  saturation passes make skin look wrong and cannot be undone downstream.

**Open every candidate plate and look at it before it enters a build order.** The filename
encodes the expression and the copy space; it does not encode whether the eyes are open.

## A/B pairing

The two variants make the cleanest possible A/B pair when the words are held constant.
That is the recommended variant C in the build order: same title, same words, one frame
built each way. Note when handing over that YouTube picks on watch-time share rather than
raw click-through.
