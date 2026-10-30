"""Palette: ground, ink and the saturated windows."""

from __future__ import annotations

import numpy as np

from .frames import probe, run

def cmd_palette(path: str) -> None:
    """Ground, ink, and where the film lets itself be saturated."""
    dur, W, H, fps = probe(path)
    sw, sh = 160, 90
    buf = run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps=10,scale={sw}:{sh}",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    n = sw * sh * 3
    f = len(buf) // n
    a = np.frombuffer(buf, dtype=np.uint8)[: f * n].reshape(f, sh * sw, 3).astype(int)

    flat = a.reshape(-1, 3)
    hexof = lambda v: "#%02x%02x%02x" % tuple(int(x) for x in v)

    # The ground is the film's MOST COMMON colour, not its brightest.
    #
    # This used to read `flat[flat.sum(1) > 690]` and call that the ground, which is only true of a
    # film with a light ground - the daylight and paper-board registers this script was first
    # written against. Point it at the live-screen register, whose whole frame is a dark screen,
    # and the bright group is empty: numpy warns "Mean of empty slice", `hexof` is handed nan and
    # the command dies with a traceback. Found 28 Aug 2026. A mode works on either register and
    # needs no threshold at all.
    bins = (flat // 16).astype(np.int64)
    key = bins[:, 0] * 289 + bins[:, 1] * 17 + bins[:, 2]
    ground_key = np.bincount(key).argmax()
    ground = flat[key == ground_key]
    print(f"ground  {hexof(ground.mean(0))}   ({len(ground) * 100 // len(flat)}% of pixels)")

    # Ink is whatever sits furthest from the ground in luminance, in whichever direction the film
    # actually goes. On a light ground that is the dark type; on a dark one it is the light type.
    lum = flat @ np.array([0.2126, 0.7152, 0.0722])
    ground_lum = float(ground.mean(0) @ np.array([0.2126, 0.7152, 0.0722]))
    far = flat[np.abs(lum - ground_lum) > 90]
    if len(far):
        print(f"ink     {hexof(far.mean(0))}   ({len(far) * 100 // len(flat)}% of pixels)")
    else:
        print("ink     none: nothing in the film is 90 levels off the ground")

    sat = a.max(2) - a.min(2)
    strong = (sat > 25).mean(1) * 100
    segs, start = [], None
    for i in range(f):
        on = strong[i] > 45
        if on and start is None:
            start = i
        if not on and start is not None:
            if i - start > 5:
                segs.append((start / 10, (i - 1) / 10))
            start = None
    if start is not None:
        segs.append((start / 10, (f - 1) / 10))
    total = sum(b - s for s, b in segs)
    print(f"\nsaturated windows ({total:.1f}s of {dur:.1f}s, {total / dur * 100:.0f}%):")
    for s, b in segs:
        print(f"  {s:6.1f} -> {b:6.1f}   ({b - s:.1f}s)")
    print("\n  Few windows means the colour is punctuation. Many means it is wallpaper.")
