# Traps that render clean

Read when a clip passes typecheck and exits 0 but a still or a contact sheet looks wrong, and before
signing a clip off. None of these fails a typecheck or an exit code. Building and the review loop: `craft.md`.

Code: `interpolate()` rejects a decreasing input range (screen Y falls as things rise). A `const at` inside a `.map`
shadows the imported `at()`. An SVG `<mask>` is luminance, so draw edge fades in white. Clamp and round a
spring-driven value before a CSS percentage or `color-mix()` (past 100% voids the declaration: black). Reveal paths
with `pathLength={1}`, `strokeDasharray={1}` and offset `1 - progress`; a dashed stroke can't reveal by offset. A
half-way `countTo` start skips rounding and shows "4.5" all hold. Re-anchor a projection by translation only (a
bigger size into `iso()` plus rescaled offsets applies it twice). A `translateY` on a layer with `scale` compounds.

Geometry: an orthogonal route whose ends share a coordinate collapses to a line. An arc ending at a station's centre
angle ends inside it. An outline ring with a night fill is a hole, so a delivered object needs a mark inside.
"Nothing here yet" is a dashed box, never a hairline. A leader under about 200px reads as a stub. A group reads as
one only when the gap inside is much smaller than beside it. Over footage, 12px+ strokes read as an object, 3px as a
scratch on the lens. A loop in 16:9 is an ellipse. Close a broken ring by growing its arcs, not with a joining
object (a seam reads as a spinner). A repeated small object is its silhouette plus one glyph (a banknote portrait
read as a sad emoji). Centre the composition as a whole, gutter included, measuring the figure's full extent (tiles,
labels, bracket, the bracket's label) vertically as well as across.

Light and motion: 2 lit strokes at one geometry double the glow, so cross-fade. Light the destination on arrival,
never before. A pulse ring on a tracked object's edge reads as a stray bubble: change the object. Spread a recycled
particle's period by about plus or minus 28%, or the band pulses in phase. A dashoffset chart reveal is a stencil
lift: multiply each point's height by a climb factor so the run rises as it extends. `SETTLE` is too slow for
landings under a second apart; a beat under 5 seconds can't afford a slow stagger. A last frame equal to the first
means nothing happened (an accumulation's point is drawn by ADDING), and resolving back to neutral argues against
the clip's own point. Bring an overlay's light up about a second before its clause and start it about 0.2s before
its first row. Nothing flashes or hard-cuts more than 3 times a second (photosensitivity; a beat-cut run or a fast
caret breaks it). Cut into a close-up while it's still building (offset its local frame so the cut lands on the
build's tail); a cut to a finished still reads as a slideshow. Fake motion blur from the frame alone: 2 or 3 copies
at earlier frames with falling opacity, or a `scaleX` stretch along the travel. An entrance never slices a glyph
(a vertical wipe through the U of a wordmark read as "the U is broken"): reveal whole letters, staggered or
rising from under the baseline, unless the build IS the concept, like "productize" assembled through masks. A
shadow sits on an unmasked wrapper outside the mask. A logo lands solid, by scale or position; one fading up from 0
"arrives too transparent".

Content: a label where a value belongs is an invented line item; a chart with no type invents no figure. A number
stands alone ("just keep 100k, 1 million, 10 million"), with no tag like "6 figures", and no frame mid-count shows a
label the value hasn't reached. A recognition beat is still wrong if it only re-names the subject. A depicted
interface keeps its own colours and only eases (overshoot, squash and blur are for shapes, cards and logos; the
clip's accent in product chrome reads as branding leaking in), but a terminal outcome line takes Sand, never Terra
(`8 passed, 0 failed` looked like a failure). No real customer's name or data on screen: fictional, or the client's
own with their OK. Photograph a live-screen page, never redraw it, and light the thing that is PLAYING. Size kinetic
type by ratio against the previous word (largest to smallest capped at about 6:1). Round a locked close-up's drift
to whole pixels and freeze the camera when the action ends, or every frame resamples and bills near raw.

Pipeline: `-shortest` without `apad` truncates the video to the audio. A render in another project starves this one
(`ps aux | grep chrome-headless` before waiting). A still answers a LOOK complaint, the full clip a MOTION one. A
template reserving a block must spend it (scale the whole geometry by one factor). Drop only `undefined` props,
never an empty string (a card once read "€36,000K"). A merged multi-path logo comes out a blob (a subpath's leading
`m` is absolute only at the start of its path); simple-icons lacks `openai` and `monday`
( covers gaps).
Nothing the camera scales carries `will-change`: Chrome rasterises the layer once, so scaled text goes soft. Strip it
from pasted `transitions-dev` CSS (`07-panel-reveal.css` and `16-tabs-sliding.css` both set it).
