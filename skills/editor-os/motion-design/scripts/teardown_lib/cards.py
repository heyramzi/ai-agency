"""Centred-text cards: length, gap and cycle."""

from __future__ import annotations

import numpy as np

from .frames import probe, raw_gray

# The centred-text band, as a fraction of the frame. A claim line sits on the middle third and
# nothing else in a product film does, so cropping to it separates type from product UI.
BAND_TOP, BAND_HEIGHT = 0.45, 0.10
BAND_LEFT, BAND_WIDTH = 0.15, 0.70


def cmd_cards(path: str) -> None:
    """Every centred-text card, with its length, the empty gap after it, and the cycle.

    The cycle column is the one that matters: in a film cut to music it is flat and equal to
    the bar. Cards timed by eye scatter, and the scatter is what makes a film feel amateur.
    """
    dur, W, H, fps = probe(path)
    cw, chh = int(W * BAND_WIDTH), int(H * BAND_HEIGHT)
    sw, sh = 240, 20
    vf = (f"crop={cw}:{chh}:{int(W * BAND_LEFT)}:{int(H * BAND_TOP)},"
          f"scale={sw}:{sh},format=gray")
    d = raw_gray(path, vf, sw, sh)
    ink = (d < 150).sum(axis=(1, 2))
    present = ink > 25

    segs, start = [], None
    for i, on in enumerate(present):
        if on and start is None:
            start = i
        if not on and start is not None:
            if i - start > 12:  # under 0.2s is a flicker, not a card
                segs.append((start / fps, (i - 1) / fps, int(ink[start:i].max())))
            start = None
    if start is not None:
        segs.append((start / fps, (len(present) - 1) / fps, int(ink[start:].max())))

    print(f"{len(segs)} text cards in {dur:.1f}s\n")
    print(f"{'start':>7} {'end':>7} {'len':>6} {'gap':>6} {'cycle':>6}   ink")
    cycles, prev = [], None
    for s, e, peak in segs:
        gap = "" if prev is None else f"{s - prev[1]:6.2f}"
        cyc = ""
        if prev is not None:
            cycles.append(s - prev[0])
            cyc = f"{s - prev[0]:6.2f}"
        print(f"{s:7.2f} {e:7.2f} {e - s:6.2f} {gap:>6} {cyc:>6}   {peak}")
        prev = (s, e)
    if cycles:
        c = np.array(cycles)
        tight = c[c < np.median(c) * 1.6]  # drop the long product stretches between claims
        print(f"\nmedian cycle {np.median(tight):.2f}s   spread {tight.std():.2f}s")
        print("  Flat and near the bar means it is cut to the track. Scattered means cut by eye.")
