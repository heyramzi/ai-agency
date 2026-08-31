# Handing a composition to a graphic designer

Step 7, execution route A. Use this when a person builds the frame in Photoshop, Figma
or Affinity rather than a model rendering it.

**The point of the sheet is that nothing is re-decided downstream.** A designer given
"make it pop, systems vibe, our purple" will invent a composition and then go hunting
for assets. A designer given the sheet below opens the named files and executes. Every
line is a decision already taken in steps 2 to 6.

Deliver it as a single markdown file or a ClickUp task description, with the reference
images attached, never as a paragraph in a chat message.

## The sheet

````markdown
# Thumbnail: <video title>
Due: <date> · Variant: face | faceless · Canvas: 1280×720 px, sRGB, JPEG ≤ 2 MB

## The one thing
The eye lands on <X>, and that tells the viewer <Y>.
Everything below serves that sentence. If a change makes that sentence weaker, do not
make the change.

## Layout

```
┌──────────────────────────────────────────┐
│                                          │
│   ┌────────────────┐                     │   ← label block, top-left third
│   │  THE 2 MINUTE  │                     │     colour tab, 2 lines max
│   │     HABIT      │                     │
│   └────────────────┘                     │
│                                          │
│              ███████████████             │   ← the artifact / the subject
│            ███████████████████           │     60 to 80% of frame, off-centre
│              ███████████████             │
│                                          │
│                              ░░░░░░░░░   │   ← keep clear: timestamp overlay
└──────────────────────────────────────────┘
     ↑ safe: bottom-left 10%       ↑ safe: bottom-right 15%
```

Replace the diagram with the real one. Rough ASCII is fine and is read more carefully
than a paragraph.

## Elements, in z-order

1. **Background**: <file path or "photograph: brief">. Treatment: <blur radius, dim %>.
2. **Subject**: <file path>. Scale: <% of frame height>. Position: <thirds intersection>.
3. **Label**: see Words below.
4. **Accent**: <one arrow / one badge / none>. Never more than one.

Total elements: **two or three.** Not five. A winner in this niche carries one or two;
our own control band carries five to eight, and that gap is the biggest single
difference between our wall and theirs.

## Words

| | |
| --- | --- |
| String, exactly | `THE 2 MINUTE HABIT` |
| Case | ALL CAPS / lowercase / Sentence |
| Font | Manrope ExtraBold 800 (display). Never Satoshi on a thumbnail. |
| Size | Cap height ≥ 90 px at 1280 wide, so it survives 320 px |
| Fill | `#FBF3EF` Parchment |
| Plate | Solid tab `#F0503D` Terra Signal, 24 px padding, no radius |
| Placement | Top-left third, baseline on the upper third line |
| Second text block | **None.** |

## Colour

| Role | Hex | Note |
| --- | --- | --- |
| Working colour 1 | `#000515` Abyss Ink | background / plate |
| Working colour 2 | `#FBF3EF` Parchment | type |
| Accent, once only | `#414FD2` Command Indigo | arrow, badge, one glyph |

Two colours doing work, a third once. The frame has to fight the white YouTube UI, not
blend into it.

## Assets

| Role | File |
| --- | --- |
| Face plate | the face shelf, filed by expression, e.g. `confident/confident-left-07.webp` |
| Product box | the owned-asset shelf |
| 3D tile | the 3D shelf |
| Screen capture | `<path>`: dim to 30%, must not be readable |

Copy-space in a face-plate filename names the **empty** side where the words go, so
`confident-left-07` has the subject on the right. The Faces tab copies the
picture itself to the clipboard, so a plate can be pasted straight into the ticket.

## Not in frame, deliberately

- No second person, in any role: 1 winner in 135 has one, against 12 controls in 108
- No client money, receipt or revenue curve
- No numbered ramp of icons
- No readable screenshot
- <anything else the designer would reasonably have added>

## Why it wins
<one sentence naming the finding in references/niche-evidence.md this bets on>

## Deliverables
- `thumb-<slug>-a.jpg`: this sheet
- `thumb-<slug>-b.jpg`: identical, words changed to `<string B>`
- `thumb-<slug>-c.jpg`: identical words, other variant (face ↔ faceless)
- Layered source file
````

## Review, when it comes back

Do not review at 100%. Export at 320×180, put the three side by side, and run the step 8
checklist in the skill. Send one consolidated list of changes; a designer who gets three
rounds of one note each stops reading the sheet.

Two questions settle most rounds:

1. At 320 px, what does the eye land on first? If the answer is not the thing named at
   the top of the sheet, the frame is wrong regardless of how it looks at full size.
2. How many elements are competing? If more than three, name the one to remove.

## When the designer pushes back

They will usually push on the same two things, and both are worth conceding on:

- **"It looks empty."** It is meant to. Negative space is what survives a feed. Show
  them `sheet-winner.jpg` for Systems Made Better against his `sheet-control.jpg`.
- **"The face should be bigger."** A face-forward close-up is a control marker on the
  one channel where it varies (1 winner, 3 controls) and neutral everywhere else. There
  is no evidence for a bigger head and there is some against it.

They are right, and worth listening to, on: type sitting on a busy part of the
photograph, an arrow that points at nothing, and a plate colour that vibrates against
the background. Those are craft calls and the sheet does not overrule them.
