"""Ground vignette profile and accent clusters of one frame."""

from __future__ import annotations

import numpy as np

from .frames import probe, run

def cmd_ground(path: str, ss: float = 0.0) -> None:
    """The vignette profile and the accent clusters of one frame.

    A ground that samples flat is paper. A ground with a 70-level swing between its centre and its
    corners is a lit wall, which is what the long-take reference has and what makes its panels
    read as lit rather than as pasted on.
    """
    _, W, H, _ = probe(path)
    raw = run(["ffmpeg", "-v", "error", "-ss", str(ss), "-i", path, "-frames:v", "1",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    a = np.frombuffer(raw, dtype=np.uint8)[: W * H * 3].reshape(H, W, 3).astype(int)

    row, col = a[int(H * 0.04)], a[:, int(W * 0.016)]
    hprof = [int(row[x].mean()) for x in range(0, W, max(1, W // 8))]
    vprof = [int(col[y].mean()) for y in range(0, H, max(1, H // 8))]
    print("horizontal (top row, L->R): ", hprof)
    print("vertical   (left col, T->B):", vprof)

    # WHY the verdict reads the profile and not the frame's min/max: min/max spans the panels and
    # the type, so one white card and one black glyph score "lit wall" over a ground that is
    # perfectly flat. The question is what the *ground* does across the frame, which is the strip
    # sampled above, and the reference answers 111 to 187 across the width -- 76 levels.
    swing = max(hprof) - min(hprof)
    print(f"ground swing {swing} levels across the width"
          f"   ({'lit wall' if swing > 45 else 'FLAT -- reads as paper, not as a lit room'})"
          f"   [reference: 76]")

    sat = a.max(2) - a.min(2)
    ys, xs = np.where(sat > 55)
    if len(xs):
        from collections import Counter
        c = Counter(tuple((a[y, x] // 16 * 16)) for y, x in zip(ys, xs))
        print("accents:", ", ".join(f"#{r:02x}{g:02x}{b:02x}({n})" for (r, g, b), n in c.most_common(6)))
    else:
        print("accents: none above threshold -- the frame is neutral")
