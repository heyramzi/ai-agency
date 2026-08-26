---
name: whiteboard
description: "Lays out hand-drawn concept boards as code and draws them onto the iPad live over Excalidraw's collaboration protocol, so a diagram arrives already composed and still editable on camera. Use when a video needs a board behind it, when an idea has to become circles, arrows and highlighter rings, when a board needs re-laying out or re-pushing, or when anything needs drawing into an Excalidraw canvas from a laptop. Appends new failure modes to its own pattern list after each run."
license: MIT
compatibility: Node 20 or later, pnpm, and an Excalidraw collaboration room
---

# Whiteboard

**Boards are TypeScript, not drawings.** A board is an array of Excalidraw elements built from a
small helper library, registered by name, built to JSON, and then pushed into a live collaboration
room so it appears on the iPad already composed and still editable on camera.

The library is [`tool/`](tool) in this folder, and it is the whole engine: the scene helpers, the
collaboration client and one worked board, `old-way-new-way`, to read and copy. Install it once and
run everything from there.

```bash
cd tool && pnpm install         # once, for socket.io-client and tsx
pnpm build                      # every board to out/
pnpm build <board>              # just one
pnpm push <board> --room '<excalidraw collab link>' --pace 700
```

Everything below is written from `tool/`, so `src/boards.ts` means `tool/src/boards.ts`.

**Why Excalidraw and not Freeform or Miro.** Excalidraw's collaboration room is a websocket that
accepts a scene from any client, so a laptop can draw into a canvas an iPad has open. Nothing else in
the category exposes that. The fallback for boards that do not need to arrive live is writing the
`.excalidraw` file into a synced folder and opening it on the tablet.

This file owns how a board gets composed, checked and drawn.

## Composing a board

`node(cx, cy, r, label)` is a circle plus its centred caption and is the workhorse.
`circle`, `text`, `arrow`, `underline` and `ring` are the rest. Coordinates are a plain
top-left canvas, y grows downward, and every position is absolute, so a board is a set of
named x constants with items hung off them.

Two colour constants, `INK` and `HIGHLIGHT`, plus one hue per parallel concept. The
sketchy look is a single switch, never a per-element override.

The full vocabulary, the hue set, the spacing constraints and the layout gate:
[`references/composing.md`](references/composing.md).

## A piece of content, not a board

Boards are the unit of layout; a video is the unit of work. `pieces` in `src/boards.ts` maps one
name to the boards behind one piece of content, and every command takes a piece name, a board name,
or `all`:

```bash
pnpm push intro            # every board behind that video, into the room
pnpm copy skool            # the same set onto the clipboard
```

Add a board to a piece in the same edit that registers it, or the piece silently stops being the
whole video.

`copy` writes Excalidraw's own `excalidraw/clipboard` payload and normalises the set back to the
origin first, since boards are authored in bands of one tall shared canvas. It is the route into a
canvas that is not the pushed room: a local file, a different room, somebody else's screen.

## Draft the set by talking, then edit it down

The fastest way into a piece's board set is not a written brief. Dictate for ten minutes: the
argument, the beats, roughly how many boards it wants, and what each one is trying to show. Speech
carries the argument's real order, which is the part a written outline flattens, and dictating is
where the number of boards settles honestly rather than being padded to a round figure.

**Expect the first pass at about 80% and budget half an hour to edit it.** That is the deal, and it
is a good one against composing from a blank canvas. What comes back is the layout skeleton; the
captions, the hue assignment and the offsets in `Composition` above are hand work and stay hand
work. Do not push a dictated set without that pass.

**The set then frames the recording, not the other way round.** Once the boards exist, the video is
the boards said out loud in order, which is why `Element order is the talk track` below matters. A
board added after the recording usually means a beat the argument did not have.

## Deliver it, by whichever route is open

Building a board is not delivering one, and there are three routes that deliver. **Take one of them
as the last step of every board, without being asked**, then say what landed and where.

| Route | Command | When |
| --- | --- | --- |
| Push into the room | `pnpm push <board>` | Somebody is in the collaboration room. Fastest, and the board arrives already composed. |
| The clipboard | `pnpm copy <piece>` | Any canvas that is already open, including a local file. Normalises the set back to the origin. |
| The files | `pnpm build <board>` | `out/<board>.excalidraw` is a real file. Drag it onto Excalidraw, or open it in ExcalidrawZ. |

**The push is not required, and it never was.** The relay stores nothing, so a push only works while
a peer is connected, and building the delivery around that makes an empty room look like a failure
when the files were sitting in `out/` the whole time. Pick the route that fits, and name the `out/`
path when the answer is the files.

**A shared canvas is append-only.** The room holds work no repo knows about: another product's
screenshots, a morning of Pencil annotation. Read it first with `pnpm inspect`, which reports every
occupied band, then take a **free** band. Never clear, erase or reset a band to make room, and never
write a command that does. Clearing a band to "replace" a board takes somebody else's work off the
canvas whenever the band held two boards and only one was being replaced. No command can know what
somebody else put there. This holds for every shared surface, not just this one.

`WHITEBOARD_ROOM` in `tool/.env` is the room, quoted. **Quote the value**: Node's `.env` parser
reads an unquoted `#` as a comment and drops the fragment, which is the half carrying the room id
and the key. If it is missing, ask for the link once and pass it as `--room` for that run rather
than writing it to disk.

**Two boards pushed into one room need different coordinates.** Pushes carry absolute positions, so a
second board authored from the same origin lands on top of the first. Give each one its own band of
the canvas (`const TOP = 1750`, mapped over the elements on export). `pnpm build` checks every
board's bounding box against every other and exits non-zero on an overlap, whichever board was
built, so a band clash is a build failure rather than a mess on the canvas.

**A group of boards opens with a `banner` naming the video.** A recording session runs down the
canvas and the boards do not say which take they belong to, so each group carries a grey title and a
rule 300px above its first board: quiet, out of frame once a board is zoomed into, and unmissable
while scrolling. The banner is authored in the group's first board so its bounding box stays honest.

**Take the band next to the boards it ships with.** The allocation is mapped at the top of
`src/boards.ts`, and the sets that share a room are packed one after another rather than spread over
round numbers. A band reserved for a board that belongs on a different canvas is a hole in this one,
and a hole reads as a push that half arrived.

**A board another tool wrote goes up with `pnpm push-file <path.excalidraw>`.** Screenshots, an
export off the iPad, anything with an embedded `files` map: it uploads the images first, then
broadcasts the elements. `push` alone would draw empty frames, because the socket carries elements
and an image element only names a `fileId`. Image uploads cannot be taken back, so check the file
before sending it.

**`pnpm inspect` reads the canvas back.** `push` can only report what it sent. A collaborator answers
a new joiner by broadcasting its whole scene, so `inspect` joins, decrypts it and prints which boards
are actually there, complete or partial, and whether any element still sits at a superseded band. Run
it after a push, and run it first when somebody says a board is missing: a board can be on the canvas
and off the screen.

## Element order is the talk track

`push` broadcasts the scene cumulatively, one element at a time, so the array order is the order the
board draws itself. Write the elements in the order they are spoken and the push becomes the
animation. Set `--pace` so that `elements * pace` lands just under the length of the script: 53
elements at 700ms is about 37 seconds.

Reconciliation on the far side merges by element id, and ids are deterministic across builds, so
anything drawn with the Pencil during a push survives, and re-pushing a rebuilt board replaces its
own elements rather than duplicating them.

## Verify before pushing

The file is valid JSON whether or not a caption is sitting on a circle, and the mistake only shows
up once it is on the iPad in front of a camera.

```bash
pnpm typecheck && pnpm build <board>
node ../scripts/check-layout.mjs out/<board>.excalidraw
```

The gate reports text over text, text over an off-centre shape, and text over an underline, then
prints the element count and the bounds. Concentric overlaps are skipped, because a label inside a
node and a ring around a figure are both concentric by construction. Fix the coordinates, rebuild,
run it again. **A board is not pushed until this prints `layout clean`.**

## The room link is a secret

It carries the AES key in its fragment, so anyone who reads it off the screen can join the board.
Keep it out of frame while recording, take it from the user each session rather than storing it, and
never print it back into a summary.

## The words on a board are first-party copy

A board is on camera under the presenter's name, so the copy rules apply to every label: no slop
vocabulary, no engagement-bait close, no em dashes. **Internal mechanics vocabulary is banned on
camera**, which is a separate and easier rule to break. The named parts of your own system never
appear in transcripts of anyone talking, and a number on a board invites the question it stands for.
Write what the mechanism does for the viewer and keep the machinery out of the frame.

## Verification checklist

- [ ] `pnpm typecheck` clean and the board rebuilt after the last source edit
- [ ] `check-layout.mjs` prints `layout clean`
- [ ] Delivered by one of the three routes, and said which; a push verified with `pnpm inspect`
- [ ] Element order matches the spoken order, and `elements * pace` fits the script
- [ ] One ring, and it is around the number the board exists for
- [ ] Every label read against the voice profile, with no internal mechanics vocabulary
- [ ] The room link was not written into any summary or committed file
- [ ] Any new failure mode appended to Learned Patterns

## Closing a run

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one
not already listed, append it to Learned Patterns before finishing.

## Learned Patterns

Appended when a run surfaces something this skill did not already know. One line per entry, newest
first: what the run taught, without the run. **Read this list before a run.**

- 2026-08-24: The skill demanded a push and treated every other route as a fallback, and the demand
  was wrong. Deliver by whatever route is open, and say which one
- 2026-08-24: Renaming a board changes every element id, so a re-push adds a second copy instead of
  replacing the first. A rename or a split means clearing the canvas before pushing, not re-pushing
- 2026-08-24: A board's `+` and `=` signs turned two lists into a calculation, which is the one thing
  the losing version did. Before drawing any sum, check whether the board could show the count instead
- 2026-08-24: `line()` and `arrow()` store `x` at the start point and `width` as an absolute, so a
  right-to-left stroke reports a bounding box extending the wrong way
- 2026-08-14: Ten boards arrived and the canvas looked like three, because the bands they were given
  left a ten thousand pixel hole through the middle. Allocate a band next to the boards it is pushed
  with, not at the next round number
- 2026-08-14: `push` can only report what it sent, so `pnpm inspect` is what reads the canvas back
- 2026-08-14: Two boards were authored into the same band and nothing checked it
- 2026-08-14: Ids are `<board>-<index>`, assigned in `boards.ts` after the registry is assembled
- 2026-08-13: A board pushed into the canvas of a different piece is invisible even though the push
  worked. For a different canvas, `pnpm copy` is the route
- 2026-08-13: A push with a live peer still drew nothing, twice, and reported success both times.
  `peers` in `join()` already excludes self
- 2026-08-13: "The room is empty" can mean the viewport is somewhere else
- 2026-08-12: Every uppercase label shipped clipped, because Excalidraw never re-measures a text
  element it did not see edited
- 2026-08-12: The relay stores nothing, so a push into an empty room is lost and still reports success
- 2026-08-12: A ring around a stack of lines has to circle one text element, not several
- 2026-08-11: Node's `.env` parser cut the room link in half, silently
- 2026-08-11: `flags.indexOf('--room')` returns -1, and `flags[-1 + 1]` is `flags[0]`
- 2026-08-11: A script column went out as prose and had to be rebuilt as bullets
- 2026-08-11: A board shipped carrying internal mechanics vocabulary, which never appears on camera
- 2026-08-11: A dictated set of boards is a talk track, not a layout. Run the layout check before
  delivering, or the board arrives correct in content and unreadable in composition
- 2026-08-11: Never set roughness or a font family on a single element to work around the house look.
  Change the one look switch and rebuild, or every board drifts apart from every other
