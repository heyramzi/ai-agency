# Live iPad board

Boards live in `tool/` as TypeScript. A board is an array of elements built from the helpers in
`src/scene.ts` and registered in `src/boards.ts`. Run `pnpm install` in `tool/` once, and run every
command below from there.

```bash
pnpm build [<board>]                       # to out/
pnpm push <board> --room '<link>' --pace 700
```

`README.md` in that folder owns the protocol and why Excalidraw: **read it before changing `src/`.**

## The `.excalidraw` file is build output

**Change `src/boards/<board>.ts` and rebuild; never hand-edit the file, script over its JSON, or
look for a library.** A 175-line source builds to 47KB of elements carrying seeds, versions and
nonces, so a hand edit and the next `pnpm build` disagree and the iPad shows whichever ran last.
`@excalidraw/excalidraw` is a React component and `@excalidraw/utils` never left prerelease, so
neither reaches a file from a terminal. A file another tool wrote has one route, `pnpm push-file
<path>`.

## Vocabulary and look

`node(cx, cy, r, label)` (circle plus centred caption) is the workhorse; `circle`, `text`, `arrow`,
`underline`, `ring` are the rest; `shift(elements, dx, dy)` moves a group into its band. Coordinates
are top-left, y down, all absolute: name the x constants and hang items off them.

Colours are 2 constants in `src/scene.ts`, `INK` for strokes and labels and `HIGHLIGHT` for the
marker pass. Derive both from your brand tokens, and re-derive them if the palette moves.

**The look is hand-drawn, and it's a switch.** `LOOK` in `src/scene.ts` is `hand` since 10 Sep 2026
(rough.js strokes, Excalifont). The author, on a board built the other way: *"instead of choosing drawing
based designs and circles you chose very sharp shapes, I want to always in Excalidraw use this type of
shape, that's more like drawing."* `clean` is kept only for a figure inside a page. Change `LOOK` and
rebuild; setting roughness or `fontFamily` on an element makes boards drift apart. **Draw with
circles and open strokes**: a transparent circle with its caption beside it, an arrow with a word on
it, the terra ring for the one number that matters. A saturated fill behind a rounded box reads as a
UI component, the look he rejected. In Whimsical, pass `deco: "outline"` with the hue and keep notes
white or smoke (24 Aug 2026: *"I use outline and light color in designs in whimsical"*).

## Colour and layout

- **One hue per concept** from `HUES` (`indigo`, `amber`, `rose`, `green`, `teal`, `violet`; each is
  a stroke, a pale tint and a readable label): `node(cx, cy, r, name, size, HUES.amber)`. **Colour
  what differs, leave the rest `INK`**: four spaces or five stages sort by colour before a word is
  read; prose in six colours is decoration. Caption and outgoing arrow take the node's hue, and a
  second board on the same concepts keeps the assignment. One argument in three beats stays `INK`
  with `HIGHLIGHT`.
- **One column per beat.** Declare centres as constants (`const STACK = 380`). Two or three columns
  fill a frame; four is too wide on camera.
- **Captions beside a node, never on it.** Width is roughly `longest_line * fontSize * 0.52`
  (`textWidth()` runs about a fifth narrow on Excalifont, so leave more room right of a hand-look
  label); half-width plus radius sets the offset. The most common defect, and `check-layout.mjs` catches it.
- **Analogy with the real name under it, smaller.** "The stockroom", then "Supabase", then "a
  database, with logins". A table of analogies gets a "Means" column beside "Picture it". The author, 23 Sep
  2026: *"I love the analogies, but also make sure that you put what it actually is."* Mapping rules:
  the Analogies section of `motion-design`'s `references/registers.md`.
- **Rings and underlines are the emphasis budget**: one `ring` for the number the board is built
  around, `underline` for a title and a ruled-off total. Over two rings and none mean anything.
- **Show arithmetic as a sum**, parts then a rule then the result.
- **Talking points ride along as their own board at negative x**, built with `paragraph` (top-left
  anchor) and pushed separately. Bullets: the open and close are said as written and the middle live,
  so a written middle gets read aloud (`video-script`, `references/shorts-structures.md`).
- A notebook page traced position for position makes an ugly figure: keep every relation it draws,
  lay the positions out from scratch.

## One canvas, walked in order

Measured 24 Aug 2026 on Matis Clouet's `09a_B8KZURM`: 19:22, 5,011 words, 29k views on a channel
under 4k subscribers, the whole runtime one canvas on a shared screen walked node by node.

- **A video gets exactly one diagram**, beats as bands in the spoken order (`pieces` in
  `src/boards.ts`). 24 Aug 2026: *"You should never ever create multiple diagrams for one video."*
- **The diagram is the *what*, the tool is the *how***; a beat only a click can show belongs in a different video.
- **Screenshots are proof, not navigation**: a framed still that proves a claim, cut in and out.
- **Board 1 carries the idea every later board restates.**
- Don't copy his five-plus asks over a runtime that long: one outbound ask in the last twenty seconds.

A `piece` maps a name to the boards behind one video; commands take a piece, a board or `all`:
`pnpm push intro`, `pnpm copy skool`. Add a board to its piece in the same edit that registers it.

## Draft by talking

Dictate the argument for ten minutes (it carries the real order a written outline flattens, and
settles how many boards honestly). Expect the first pass at about 80% and budget half an hour to
edit: captions, hues and offsets are hand work. The boards then frame the recording, so a board added
after recording usually means a beat the argument didn't have.

## Deliver and verify

Take a route as the last step of every board, unprompted, and say what landed and where.

| Route | Command | When |
| --- | --- | --- |
| Push into the room | `pnpm push <board>` | Somebody is in the room; arrives composed |
| Clipboard | `pnpm copy <piece>` | Any open canvas, local file included |
| Files | `pnpm build <board>` | `out/<board>.excalidraw`: drag onto Excalidraw or open in ExcalidrawZ |
| Contact sheet | `pnpm render all --scale 1 && pnpm gallery` | Find a board by sight; rebuild in the session that changes one |

Pushing is optional. *"the skill does not need to push to the room. It can create locally and then I
can copy paste or drag and drop into Excalidraw."* (24 Aug 2026). Mechanics: [delivery.md](delivery.md).

```bash
pnpm typecheck && pnpm build <board>
node ../scripts/check-layout.mjs out/<board>.excalidraw
```

The gate reports text over text, over an off-centre shape and over an underline (concentric overlaps
are skipped by construction). **Not pushed until it prints `layout clean`**: the JSON is valid with a
caption on a circle, and the mistake shows only on the iPad in front of a camera.

- [ ] Typecheck clean, board rebuilt after the last edit, `layout clean`
- [ ] Delivered by a route and said which; a push verified with `pnpm inspect`
- [ ] Element order is the spoken order, and `elements * pace` fits the script
- [ ] One ring, around the number the board exists for
- [ ] No room link in any summary or committed file

## Learned Patterns

[learned-patterns.md](learned-patterns.md), newest first: read before a run, append after one.
