# Producing the frame

Steps 6 to 8. They run once variant, words and plate are settled, in order. Depth and light:
[`craft.md`](craft.md), read before writing a prompt or a designer spec. Render and composite
mechanics: [`rendering.md`](rendering.md).

## 6. The build order

Output exactly this before anything is drawn:

```
THUMBNAIL BUILD ORDER
Title:        <video title as published>
Promise:      <one sentence>
Variant:      face | faceless
The one thing:<what the eye lands on, and what it tells the viewer>
Frame:        <what is photographed or composited, framing, where the subject sits>
Depth:        <what is on each of the 3 planes: far / subject / floating>
Light:        <key direction, where the rim runs, what the floating object spills onto>
Words:        "<2-4 words>"  | placement | plate colour
Plate:        <background, the 2 working colours with hex>
Assets:       <exact files, by path, each marked owned or produced>
Not in frame: <what was deliberately left out and why>
Why it wins:  <which finding in evidence.md this bets on>
```

Then 2 variants, each changing **one** variable. Variant B rewrites the words and nothing else. Variant C flips
face to faceless (or back) under the same words.

**Produce assets** the build order names but the library lacks: anything that must be exactly right
is built and handed in (`composites.md`). A missing asset stops the run and names the file, on purpose.

## 7. Designer handoff

A designer given "make it pop, systems vibe, our purple" invents a composition; one given this sheet
executes. Deliver as one markdown file or a ClickUp task with the references attached.

```markdown
# Thumbnail: <video title>
Due: <date> · Variant: face | faceless · Canvas: 1280×720 px, sRGB, JPEG ≤ 2 MB

## The one thing
The eye lands on <X>, and that tells the viewer <Y>.

## Elements, in z-order
1. Background: <file or "photograph: brief">. Treatment: <blur radius, dim %>.
2. Subject: <file>. Scale: <% of frame height>. Position: <thirds intersection>.
3. Label: see Words.
4. Accent: <one arrow / one badge / none>.
Total elements: 2 or 3.

## Words
String exactly `THE 2 MINUTE HABIT` · Case · Font Manrope ExtraBold 800 (never Satoshi on a
thumbnail) · Cap height ≥ 90 px at 1280 wide · Fill `#FBF3EF` Parchment · Plate solid tab `#F0503D`
Terra Signal, 24 px padding, no radius · Placement top-left third · Second text block: none.

## Colour
Working 1 `#000515` Abyss Ink (background/plate) · Working 2 `#FBF3EF` Parchment (type) · Accent,
once only, `#414FD2` Command Indigo. The frame has to fight the white YouTube UI.

## Assets
Face plate from the face shelf, filed by expression · Product box from the owned-asset shelf · 3D tile
from the 3D shelf · Screen capture `<path>`, dim to 30%, must not be readable.

## Deliverables
`thumb-<slug>-a.jpg` (this sheet) · `-b.jpg` (words changed to `<string B>`) · `-c.jpg` (other
variant) · layered source file.
```

## 8. Critique the finished frame

- [ ] At 320x180 the one thing is unmistakable; 1 or 2 elements, not 5
- [ ] Exactly one person or none; words obey [`copy.md`](copy.md), make a claim, don't restate the title
- [ ] None of the faults below
- [ ] 2 working colours; the plate fights the white YouTube UI; bottom-right 15% clear
- [ ] A rim light runs down the subject; every floating object occludes, tilts, glows and casts
- [ ] **Hands and any real logo checked at full resolution**, cropped and counted, not on the
      thumbnail-sized preview where a plausible silhouette reads as correct; no mangled hands, eyes or glyphs
- [ ] Distinct from the last 3 published frames; every frame the run produced is filed on the concept

2 or more failures means rebuild, and skip the retouch. Send one consolidated list: 3 one-note rounds
and a designer stops reading. 2 questions settle most rounds: what does the eye land on first,
and how many elements compete.

## Faults (each a measured control marker)

A second person; a head filling the frame; somebody else's money; a numbered ramp of generic icons
(`PHASE 1..5`); a halo of eight or more unlabelled icons; an adjective with no object; a screenshot
the viewer must read; a category label where a claim belongs; 5 to 8 competing elements (our
house fault); series numbering as the promise; one **layout** for every upload (CTR decays, while
reusing the **treatment** builds the wall); copying a winner's composition without reading that
channel's control band. Craft faults: a subject with no rim light; an object beside the head at head
scale, square-on (a logo bug); everything on one plane, then deleting elements to fix the clutter.

**This list is enforced.** Every fault has an id in
one fault list the generator reads, and a frame on the concepts page is crossed off
against them, not deleted. Counts across the wall go to the concept generator on the next draw,
worst offender first. Add a fault in both files in the same session.
