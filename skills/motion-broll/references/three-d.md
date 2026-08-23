# 3D

The fourth register: a real rendered object, keyed over the speaker. `src/three.tsx`, on `@remotion/three`.

## When it earns its cost

A WebGL frame is several times a DOM frame, so this is not a nicer way to draw something a flat clip
already says. Reach for it when **the object is the point**, which in practice means one thing: the
read is about a hierarchy, a volume or a physical thing, and the viewer has to believe it is an
object rather than a diagram of one.

The tell is reflection. A gradient on a trapezoid is a trapezoid with a gradient on it, and it stays
that no matter how well the gradient is tuned. What makes the reference read as an object beside the speaker's
hand is that light genuinely travels across a curved surface and the highlight moves as it turns.
Only a renderer does that.

Two or three per video. A video where every graphic is rendered has stopped being the speaker's video.

## The one thing that decides whether it looks bought or made

**Not the geometry. The environment.**

A `meshPhysicalMaterial` with high metalness has nothing to reflect until you give it something, and
with no environment it renders as flat plastic however many lights are added. Adding lights is the
trap: more lights make it brighter, never more reflective, and past three it reads as a cheap 3D
logo from 2008. Three lights, then stop: a key that models the form, a rim that separates the object
from whatever it is keyed over, a low fill so the underside is not black.

`RoomEnvironment` ships inside `three` and is generated in memory, so there is no file to vendor and
no network fetch in the middle of three hundred headless Chrome frames. An HDRI is richer and is the
upgrade path; it goes in `public/` behind `delayRender`, never on a CDN, for the same reason the
webfont is self-hosted.

The material is two layers, not one: a coloured metal body under a clear coat. One layer gives you a
mirror or a plastic and the reference is neither.

## Two wiring bugs that both look like a taste failure

Both produce the same picture: a dark, matte object with no reflections, which reads as "3D was the
wrong call" rather than as a bug. Neither errors, and both survive a clean typecheck.

- **A module-level handle on the renderer is not reactive.** Stashing `gl` from `onCreated` into a
  module variable and reading it from a plain function means the environment gets built once against
  `null`. Use `useThree`.
- **An effect runs after Remotion has captured the frame.** Assigning `scene.environment` inside
  `useEffect` misses the capture, and the rendered PNG comes back **byte-identical** to one that
  never had an environment. That byte-identical result is the diagnostic: if a change to the scene
  produces the same file size, it never reached the frame. `PMREMGenerator.fromScene` is synchronous,
  so assign during the render pass and skip `delayRender` entirely.

Anything genuinely async in a 3D scene — a loaded model, an HDRI, a texture — does need
`delayRender`, for the same reason the font loader does.

## Alpha

`gl={{ alpha: true }}` and no `scene.background`. That is the whole trick, and it composites into the
same ProRes-to-qtrle MOV every other overlay ships as.

Do not put the brand grain over it. `<Shot alpha>` already drops the grain for the reason in its own
note, and a rendered surface carries its own specular detail.

Verify it the way every overlay is verified: matte the still over a bright card. A WebGL edge that
looks clean on ink can carry a dark fringe that only shows over a light wall.

## The camera

Long glass, not wide. The default 75-degree field of view gives a small object aggressive
perspective, and an object floating beside a person should share the lens the person was shot on. A
phone at that distance is nearer 25 degrees, which is what `Stage` defaults to.
