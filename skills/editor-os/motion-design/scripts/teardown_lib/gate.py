"""The product-film gate: our render against the reference's numbers, pass or fail.

Every threshold below is a measured number from a film that worked, so a fail names the
rule it broke and the reference figure beside ours. The reference is the Spotify spec ad in
Rourke's "Claude Opus 5.5: How To Make Motion Graphics" (YouTube cDb-wPq0Iyk, 2:09 to 2:29),
torn down 23 Nov 2026 for TSK-3427. Our Airtable to Sheets v3 failed it on still frames and
cards, which is what took 4 rounds of notes.
"""

from __future__ import annotations

import numpy as np

from .cuts import cut_times
from .frames import probe, raw_gray

# Mean absolute grey difference (0 to 255) between consecutive frames at 192x108, under which a
# frame reads as still. The reference measured 1% still frames on this scale; ours 28%.
STILL_DIFF = 0.25
# Layout is read at 5 fps on a 480x270 proxy, in 15 px cells (32 x 18). Area scaling averages
# grain away, so a grained ground doesn't read as ink.
LW, LH, CELL, LFPS = 480, 270, 15, 5
# A cell is ink when its mean Laplacian clears this: edges, type, a UI's lines. A bloom, a blur
# and a gradient don't, which is the point: depth of field and the glow are ground, not subject.
INK = 6.0
# The claim band: a mid-film card is ink in this band of rows and none outside it.
BAND = (0.36, 0.64)


def _still(path: str, fps: float, end_s: float) -> tuple[float, float, list[tuple[float, float]]]:
    g = raw_gray(path, "scale=192:108:flags=area,format=gray", 192, 108).astype(np.float32)
    d = np.abs(np.diff(g, axis=0)).mean((1, 2))
    body = d[: max(1, len(d) - int(round(end_s * fps)))]
    still = body < STILL_DIFF
    runs, start = [], None
    for i, s in enumerate(still):
        if s and start is None:
            start = i
        if not s and start is not None:
            runs.append((start / fps, (i - start) / fps))
            start = None
    if start is not None:
        runs.append((start / fps, (len(still) - start) / fps))
    longest = max((r[1] for r in runs), default=0.0)
    return float(still.mean() * 100), longest, sorted(runs, key=lambda r: -r[1])[:3]


def _cells(path: str) -> np.ndarray:
    """(frames, 18, 32) mean Laplacian per cell, sampled at LFPS."""
    g = raw_gray(path, f"fps={LFPS},scale={LW}:{LH}:flags=area,format=gray", LW, LH)
    a = g.astype(np.float32)
    lap = np.zeros_like(a)
    lap[:, 1:-1, 1:-1] = np.abs(4 * a[:, 1:-1, 1:-1] - a[:, :-2, 1:-1] - a[:, 2:, 1:-1]
                                - a[:, 1:-1, :-2] - a[:, 1:-1, 2:])
    n, rows, cols = len(a), LH // CELL, LW // CELL
    return lap[:, : rows * CELL, : cols * CELL].reshape(n, rows, CELL, cols, CELL).mean((2, 4))


def _layout(e: np.ndarray) -> dict:
    """Per frame: is it a card or bare ground, and where is the subject's centre."""
    rows, cols = e.shape[1:]
    ink = e > INK
    b0, b1 = int(rows * BAND[0]), int(np.ceil(rows * BAND[1]))
    outside = np.concatenate([ink[:, :b0], ink[:, b1:]], axis=1).mean((1, 2))
    # A card is a line of type alone on the ground: nothing outside the claim band, and the ink a
    # wide, short strip. WHY the aspect test: the reference's logo disc sits alone in that band for
    # 1.4 s and is the product, not a card; a shape is about as wide as it's tall, a line of words
    # is 2.5 or more times wider. A frame with no ink at all is bare ground and counts the same.
    any_ink = ink.any((1, 2))
    r_any, c_any = ink.any(2), ink.any(1)
    span = lambda m: (np.where(m)[0].max() - np.where(m)[0].min() + 1) if m.any() else 0
    aspect = np.array([span(c) / max(span(r), 1) for r, c in zip(r_any, c_any)])
    card = (outside < 0.01) & (~any_ink | (aspect >= 2.5))
    w = np.maximum(e - INK, 0)
    tot = w.sum((1, 2)) + 1e-9
    ys = (np.arange(rows) + 0.5) / rows
    xs = (np.arange(cols) + 0.5) / cols
    cy = (w.sum(2) * ys).sum(1) / tot
    cx = (w.sum(1) * xs).sum(1) / tot
    return {"card": card, "cx": cx, "cy": cy}


def cmd_gate(path: str, end_s: float = 2.0, length: tuple[float, float] = (15.0, 25.0),
             max_still: float = 2.0, max_run: float = 0.2, max_cuts: int = 0,
             cut_threshold: float = 0.3, min_centred: float = 80.0,
             max_card: float = 3.0, timeline: bool = False) -> int:
    """Measure a product-film render against the reference's numbers; exit 1 on any fail.

    The last `end_s` seconds are the end card and are exempt from the still, centring and card
    checks, since an end card holds a name on purpose. Everything before it is the film.
    """
    dur, W, H, fps = probe(path)
    rows: list[tuple[str, bool, str, str]] = []

    lo, hi = length
    rows.append(("length", lo <= dur <= hi, f"{dur:.1f} s", f"{lo:.0f} to {hi:.0f} s (one core loop)"))

    pct, longest, worst = _still(path, fps, end_s)
    rows.append(("still frames", pct < max_still, f"{pct:.1f}%", f"under {max_still:g}% (ref 1%)"))
    where = ", ".join(f"{len_:.2f} s at {at:.2f}" for at, len_ in worst if len_ > max_run)
    rows.append(("longest still run", longest <= max_run, f"{longest:.2f} s" + (f" ({where})" if where else ""),
                 f"{max_run:g} s at most before the end card (ref 0.16 s)"))

    cuts = cut_times(path, cut_threshold)
    rows.append((f"hard cuts at {cut_threshold:g}", len(cuts) <= max_cuts,
                 f"{len(cuts)}" + (f" at {' '.join(f'{t:.2f}' for t in cuts[:12])}" if cuts else ""),
                 f"{max_cuts} (every shot is the last one transformed)"))

    e = _cells(path)
    body = max(1, len(e) - int(round(end_s * LFPS)))
    lay = {k: v[:body] for k, v in _layout(e).items()}
    card = lay["card"]
    card_pct = float(card.mean() * 100)
    spans, start = [], None
    for i, c in enumerate(list(card) + [False]):
        if c and start is None:
            start = i
        if not c and start is not None:
            if i - start >= 2:
                spans.append(f"{start / LFPS:.1f}-{i / LFPS:.1f}")
            start = None
    rows.append(("card or bare ground", card_pct <= max_card,
                 f"{card_pct:.0f}% of the film" + (f" ({', '.join(spans[:6])} s)" if spans else ""),
                 f"{max_card:g}% at most (ref 0%: the claim lives in the product)"))

    live = ~card
    # Centred: the ink's weighted centre within 6% of the width and 15% of the height of the
    # middle. WHY looser vertically: a centred player card carries its title and controls low, so
    # its ink sits under the middle while the card itself is dead centre (the reference reads cy
    # 0.55 to 0.69 there). Sideways there's no excuse: the reference never leaves 0.45 to 0.55.
    ok = (np.abs(lay["cx"] - 0.5) <= 0.06) & (np.abs(lay["cy"] - 0.5) <= 0.15)
    centred = float(ok[live].mean() * 100) if live.any() else 0.0
    rows.append(("subject dead centre", centred >= min_centred, f"{centred:.0f}% of frames",
                 f"{min_centred:g}% or more (ref 88%)"))

    print(f"gate  {path}\n      {dur:.1f} s, {W}x{H}, {fps:g} fps, last {end_s:g} s treated as the end card\n")
    for name, passed, ours, want in rows:
        print(f"  {'PASS' if passed else 'FAIL'}  {name:<22} {ours:<44} want {want}")
    if timeline:
        print("\n  t      card  cx    cy")
        for i in range(body):
            print(f"  {i / LFPS:5.1f}  {'yes ' if card[i] else '    '}  {lay['cx'][i]:.2f}  {lay['cy'][i]:.2f}")
    fails = [r[0] for r in rows if not r[1]]
    print(f"\n{'PASS' if not fails else 'FAIL: ' + ', '.join(fails)}")
    return 1 if fails else 0
