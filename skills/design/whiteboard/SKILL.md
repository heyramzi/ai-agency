---
name: whiteboard
description: "Builds the whiteboard a video talks over: a compiled app board, or Excalidraw drawn live on the iPad. Use when a video needs a board, a diagram from the terminal, or an .excalidraw file to write, change or read."
tags: [makes, video, design]
lane: visual
---

# Whiteboard

The wall a viewer reads while you talk over it. Pick the branch by how it reaches the screen:

| Reaches the screen by | Branch |
| --- | --- |
| Drawn live on the iPad, on camera, over Excalidraw's collaboration protocol | [Live iPad board](references/excalidraw-board.md) |

A still image with no live camera on it belongs to a different pipeline. Excalidraw's job here is the
board drawn live, on camera.

## Steps, either branch

1. **Pick a shape per concept.** Walk the script concept by concept and ask what shape it is; one
   shape for everything means nobody thought about the idea. Done when no 2 neighbouring concepts share a shape without a reason. The
   vocabulary for each branch is in its reference.
2. **Lay out one canvas in the video's order.** A video gets exactly one diagram, its chapters or
   bands top to bottom (or left to right), with air between them. A board per idea resets the viewer's
   bearings. Done when every beat of the script has a place and nothing is cramped.
3. **Write the labels as first-party copy.** Run the `humanizer` loop on every one, and keep internal
   vocabulary (points, slippage, IDs, production notes) off a board a viewer sees. Done when the
   gate in the branch's reference exits 0.
4. **Look at it, or push it, before you call it done.** The loop and checklist for each branch are in its
   reference. Done when you've seen the rendered board, since the source alone proves little.

## Live iPad board

Hand-drawn Excalidraw elements written as TypeScript and pushed live to the iPad, so a diagram
arrives composed and editable on camera. Vocabulary (`node`, `circle`, `arrow`, `underline`, `ring`),
the `LOOK` switch, colour, the three delivery routes and the layout gate:
[references/excalidraw-board.md](references/excalidraw-board.md). Room, bands and PNG export:
[references/delivery.md](references/delivery.md), read when pushing into a room or exporting a figure.

## Learned Patterns

The live-iPad branch's failure modes, newest first, in
[references/learned-patterns.md](references/learned-patterns.md): read before a run, append after one.
