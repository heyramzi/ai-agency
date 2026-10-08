---
name: whiteboard
description: "Builds the whiteboard a video talks over: a tldraw board for YouTube, a compiled board for stills, or Excalidraw live on the iPad. Use when a video needs a board, a diagram from the terminal, or an .excalidraw file."
tags: [makes, video, design]
lane: visual
---

# Whiteboard

The wall a viewer reads while you talk over it. Pick the branch by how it reaches the screen:

| Reaches the screen by | Branch |
| --- | --- |
| Screen-shared in a YouTube video | laid out by [the video board](references/video-board.md) |
| Drawn live on the iPad, on camera, over Excalidraw's collaboration protocol | [Live iPad board](references/excalidraw-board.md) |


## Steps, every branch

1. Pick a shape per concept. Walk the script concept by concept and ask what shape it is; one
   shape for everything means nobody thought about the idea. Done when no 2 neighbouring concepts share a shape without a reason.
2. Lay out one canvas in the video's order. A video gets exactly one board, its chapters top to
   bottom or left to right, with air between them. A board per idea resets the viewer's
   bearings. A YouTube board follows the spine in [video-board.md](references/video-board.md).
3. Write the labels as first-party copy. Run the `humanizer` loop on every one, and keep internal
   vocabulary (points, slippage, IDs, production notes) off a board a viewer sees.
4. Look at it before you call it done. Shoot every frame and read the PNGs, since the source
   alone proves little. A YouTube board is done when the eval in `video-board.md` passes; the other
   branches carry their own check in their reference.

## Learned Patterns

The live-iPad branch's failure modes, newest first, in
[references/learned-patterns.md](references/learned-patterns.md): read before a run, append after one.
