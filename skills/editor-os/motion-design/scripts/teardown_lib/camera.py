"""Camera velocity, settle tau and residual drift."""

from __future__ import annotations

import sys

import numpy as np

from .frames import probe, raw_gray

def _shift(a: np.ndarray, b: np.ndarray) -> tuple[int, int]:
    """Whole-pixel translation from b to a, by phase correlation.

    WHY phase correlation rather than block matching: it uses the whole frame, so a slow dolly
    over a near-empty pale ground -- where there is nothing a feature tracker would call a
    feature -- still resolves to the pixel. The Hann window kills the wrap-around edge response
    that otherwise pins every answer to (0, 0).
    """
    win = np.hanning(a.shape[0])[:, None] * np.hanning(a.shape[1])[None, :]
    fa = np.fft.fft2((a - a.mean()) * win)
    fb = np.fft.fft2((b - b.mean()) * win)
    r = fa * np.conj(fb)
    r /= np.abs(r) + 1e-9
    peak = np.fft.ifft2(r).real
    dy, dx = np.unravel_index(int(np.argmax(peak)), peak.shape)
    if dy > a.shape[0] // 2:
        dy -= a.shape[0]
    if dx > a.shape[1] // 2:
        dx -= a.shape[1]
    return int(dx), int(dy)


def cmd_camera(path: str, ss: float = 0.0, t: float = 12.0) -> None:
    """Per-frame camera velocity, the peak, the fitted settle constant and the residual drift.

    This is what settles whether a reference's motion is "smooth": it is a number, and the two
    that matter are the exponential time constant of the decay and whether the velocity ever
    reaches zero. In the long-take reference both are house constants -- tau near 0.45s, and a
    residual that never stops. See references/recipes.md.
    """
    _, _, _, fps = probe(path)
    # WHY 960 and not 480: the correlation resolves whole pixels, so a proxy that halves the frame
    # also halves the sensitivity. At 480 the reference film's residual drift quantises to zero and
    # the tool reports "comes to rest" on a shot that is visibly still moving.
    W, H = 960, 540
    g = raw_gray(path, f"scale={W}:{H},format=gray", W, H, ss=ss, t=t).astype(float)
    if len(g) < 4:
        sys.exit("not enough frames in that window")

    vx = [_shift(g[i], g[i - 1])[0] for i in range(1, len(g))]
    vy = [_shift(g[i], g[i - 1])[1] for i in range(1, len(g))]
    # Magnitude, not |dx|+|dy|: a diagonal drift is one move, and the taxicab sum overstates it
    # by up to 41%, which is enough to put a correct film over the "too fast" line.
    speed = [float(np.hypot(x, y)) for x, y in zip(vx, vy)]

    # A single-frame spike of tens of pixels is a hard cut, not a camera move. Drop it from the
    # fit or one cut poisons every figure below.
    cuts = [i for i, s_ in enumerate(speed) if s_ > W * 0.12]
    clean = [(i, s_) for i, s_ in enumerate(speed) if i not in cuts]
    peak_i, peak_v = max(clean, key=lambda p: p[1]) if clean else (0, 0)

    print(f"window {ss:.2f}s +{t:.2f}s at {fps:.2f}fps, {len(g)} frames, proxy {W}x{H}")
    print(f"hard cuts at frame(s): {cuts if cuts else 'none'}")
    print(f"peak speed  {peak_v:.1f}px/frame = {peak_v / W * 100:.2f}% of frame width per frame")

    # The residual floor first, because tau is meaningless without it. A long take decays from its
    # peak towards a floor it never reaches, so fitting the raw tail measures mostly the floor and
    # returns a tau several times too long: 2.9s on a film whose real settle is under half a second.
    late = [s_ for i, s_ in clean if i > peak_i + int(fps * 1.5)]
    floor = float(np.median(late)) if late else 0.0

    # Smoothed before the fit: whole-pixel correlation is quantised, so one noisy frame that dips
    # into the floor would end the tail three frames after the peak and report "never decays".
    sm = np.convolve(np.array(speed), np.ones(3) / 3, mode="same")
    tail = []
    for i, _ in clean:
        if i <= peak_i:
            continue
        excess = float(sm[i]) - floor
        if excess <= max(0.15 * (peak_v - floor), 0.5):
            break                      # decayed into the floor; everything after is drift
        tail.append(excess)
    if len(tail) > 6:
        k = np.polyfit(np.arange(len(tail)), np.log(np.array(tail)), 1)[0]
        tau = (-1.0 / k) / fps if k < 0 else float("inf")
        print(f"settle tau  {tau:.2f}s  (fit over {len(tail)} frames, peak down to the floor)")
    else:
        print("settle tau  -- the move never decays inside this window")

    if late:
        # Phase correlation sees translation only. A slow push, or elements building inside a
        # locked-off frame, both correlate to (0, 0) while the picture is plainly still changing,
        # so the verdict has to consult the raw frame difference before calling anything a slide.
        churn = float(np.mean(np.abs(np.diff(g[peak_i + int(fps * 1.5):], axis=0)))) if len(
            g) > peak_i + int(fps * 1.5) + 2 else 0.0
        verdict = ("never rests" if floor >= 0.5
                   else "not translating, but the frame is still changing (a push, or a build)"
                   if churn > 0.6
                   else "COMES TO REST -- reads as a slide")
        print(f"residual    {floor:.2f}px/frame = {floor / W * 100:.2f}% of frame width per frame"
              f"  ({verdict})")

    print("\nframe  speed  dx   dy")
    for i, (x, y) in enumerate(zip(vx, vy)):
        print(f"{i + 1:5d}  {speed[i]:5.1f}  {x:3d}  {y:3d}")
