# Delivering a live board

The routes and the rule to take one on every board are in [excalidraw-board.md](excalidraw-board.md).
The mechanics behind the room route are below.

## The room link is a secret

It carries the AES key in its fragment, so anyone who reads it off the screen can join. Keep it out
of frame, take it from the user each session instead of storing it, and leave it out of every summary.
`WHITEBOARD_ROOM` in `tool/.env` is the room, quoted. If it's missing, ask for the link
once and pass it as `--room` for that run rather than writing it to disk.

## Bands, banners, reading the canvas back

**2 boards pushed into one room need different coordinates.** Pushes carry absolute positions, so a
second board from the same origin lands on top of the first. Give each its own band (`const TOP =
1750`, mapped over the elements on export). `pnpm build` checks every board's bounding box against
every other and exits non-zero on an overlap, so a clash fails the build instead of messing up the
canvas. Take the band next to the boards it ships with: the allocation is mapped at the top of
`src/boards.ts` and sets that share a room are packed one after another. A band reserved for a board
on another canvas is a hole, and a hole reads as a push that half arrived.

**A group of boards opens with a `banner` naming the video**: a grey title and a rule 300px above its
first board, so a recording session knows which take it's in. Author it in the group's first board
so its bounding box stays honest.

**`pnpm push-file <path.excalidraw>`** sends a board another tool wrote (screenshots, an iPad export,
anything with an embedded `files` map): it uploads the images first, then broadcasts the elements.
`push` alone draws empty frames, because the socket carries elements and an image element only names
a `fileId`. Image uploads can't be taken back, so check the file first.

**`pnpm inspect` reads the canvas back.** `push` only reports what it sent. A collaborator answers a
new joiner by broadcasting its whole scene, so `inspect` joins, decrypts it and prints which boards
are there, complete or partial, and whether any element sits at a superseded band. Run it after a
push, and first when somebody says a board is missing: it can be on the canvas and off the screen.

## The canvas is append-only

The room holds work no repo knows about: other products' screenshots, a morning of Pencil
annotation. Clear, erase or reset nothing to make room, and write no command that does. Clearing a
band to "replace" a board took Wavenote's screenshots off the room on its first run, because the
band held two boards and one was being replaced.

## Element order is the talk track

`push` broadcasts cumulatively, one element at a time, so the array order is the order the board
draws itself: write elements in spoken order and the push is the animation. Set `--pace` so
`elements * pace` lands just under the script's length (53 elements at 700ms is about 37 seconds).
Far-side reconciliation merges by element id and ids are deterministic across builds, so Pencil
drawings made during a push survive and a re-push replaces a board's own elements instead of
duplicating them.

## The contact sheet

`src/gallery.ts` reads the registry, takes the PNG `pnpm render all --scale 1` left for each board
and writes them into
one local `.html` page
 as inlined WebP grouped by video. A tile crops to the top of the board, where its
title is, and the whole board is one click away. WebP holds 16,383 pixels an edge and a spoken column
is twelve times taller than wide, so cap both edges and never enlarge. The page inlines its pictures:
one pointing at `out/png/` draws empty frames the day that folder is cleaned.

## A figure to PNG, for an email or a page

`pnpm render <figure>` exports through Excalidraw's own `exportToBlob` in headless Chromium, cropped
to the elements plus `--padding` (default 32) at `--scale` (default 2), to `out/png/<name>.png`.
Figures are registered in `src/figures.ts`, sit at the origin of their own canvas, take no band, and
are reskinned with `handLook()` once per figure. Then, from `app/cli`:

`pnpm cli storage upload --file out/png/<name>.png --path email/lessons/<name>-v1.png --bucket brand-assets`

It serves at
`https://<your-app>/api/brand-assets/email/lessons/<name>-v1.png`
, immutable, so a change is a new `-v2` path. The 8 email figures: `src/figures/email-lessons.ts`.
Trap: `tsx` compiles functions with an esbuild `__name` helper, so a function passed to
`page.evaluate` dies with `__name is not defined`; define the exporter inside the page and call it by
a string expression.
