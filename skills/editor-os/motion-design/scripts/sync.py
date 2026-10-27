#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "matplotlib"]
# ///
"""Checks that every sound in a render lands on the frame its motion makes contact.

    uv run scripts/sync.py out/film.mp4 --hits hits.json [--cut Id] [--tol 1] [--plot sync.png] [--width 960]

`hits.json` is the clip's intended hits, written from the same constants the animation reads:
a list of {"f": frame, "name": voice, "what": label, "roi": [x0, y0, x1, y1]?, "metric":
"outline"?}, or {"<cut>": {"hits": [...]}}. `roi` is the part of the frame that moves, as
fractions; `outline` measures a dark shape's box instead of its pixels (a morph whose content
blurs in after the outline lands). For each
hit the script measures two things off the RENDER, never off the code:

- the audio hit: the half-height point of a 5 ms envelope, rising out of the quiet before it
  (the same definition `publish-sfx.mjs` uses for a voice's SFX_HIT), as a fractional frame;
- the motion contact: after the biggest frame-to-frame change near the hit, the last frame
  whose change is still a quarter of it, which is the frame a spring arrives or a digit snaps.
  Run it on a render with the camera held still (same timeline, same sounds): a moving camera
  changes every pixel and the frame difference then measures the camera.

It prints one row per hit and exits 1 when any sound sits more than --tol frames from its
contact. --plot draws one panel per hit: envelope, motion, both marks.

WHY both and not just audio against the intended frame: that only checks the sound kit's
offsets. A contact frame computed wrong in the code (a spring's 96% point two frames after the
shape visibly stopped) passes it and still sounds late.
"""

import argparse
import json
import subprocess
import sys

import numpy as np

SR = 48000


def audio(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def frames_gray(path, width=320):
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    ).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1])
    num, den = probe[2].split("/")
    fps = float(num) / float(den)
    hh = int(round(h * width / w / 2) * 2)
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={width}:{hh}", "-f", "rawvideo",
         "-pix_fmt", "gray", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, hh, width), fps


def envelope(x, ms=5):
    n = max(1, int(SR * ms / 1000))
    c = np.cumsum(np.abs(x), dtype=np.float64)
    env = (c[n:] - c[:-n]) / n
    return np.concatenate([np.zeros(n), env])


def audio_hit(env, f, fps, before=8, after=10, span=8):
    """The audio hit nearest frame f, defined as publish-sfx.mjs defines a voice's SFX_HIT.

    Each event starts where the envelope climbs out of quiet (past 10% of the window's loudest);
    its hit is the first point at half of the event's own maximum over the next `span` frames.
    WHY the event's maximum and not the nearest crest: `sub` swells in 3 crests, and the half of
    a later crest put it a frame late against a sound that had already landed. WHY nearest f: a
    price that ticks every 6 frames puts 4 events in one window."""
    spf = SR / fps
    a = int(max(0, (f - before) * spf))
    b = int(min(len(env) - 1, (f + after) * spf))
    seg = env[a:b]
    if len(seg) < 10 or seg.max() < 1e-4:
        return None
    quiet = seg < 0.1 * seg.max()
    starts = np.flatnonzero(quiet[:-1] & ~quiet[1:]) + 1
    if not quiet[0]:
        starts = np.concatenate([[0], starts])
    best = None
    for i in starts:
        top = env[a + i:a + i + int(span * spf)].max()
        j = int(np.argmax(env[a + i:] >= 0.5 * top))
        # Centre of the 5 ms window, as publish-sfx.mjs measures it.
        t = (a + i + j - SR * 0.0025) / spf
        if best is None or abs(t - f) < abs(best - f):
            best = t
    return best


def motion_contact(diff, f, before=10, after=6):
    """The frame the motion arrives: after the biggest step near f, the last frame whose step is
    still at least a quarter of it. The same rule the film's `contact()` uses on its springs."""
    a, b = max(1, f - before), min(len(diff) - 1, f + after)
    pk = a + int(np.argmax(diff[a:min(b, f + 3)]))
    if diff[pk] <= 0:
        return None  # nothing moved in the region: the region is wrong, or the motion is missing
    k = pk
    while k + 1 < len(diff) and diff[k + 1] >= diff[pk] / 4:
        k += 1
    return k


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--hits", required=True)
    ap.add_argument("--cut")
    ap.add_argument("--tol", type=float, default=1.0)
    ap.add_argument("--plot")
    ap.add_argument("--audio-only", action="store_true",
                    help="compare the audio with the intended frames only: the check on a delivered "
                         "file, after the encode and any gain, whose camera moves")
    ap.add_argument("--width", type=int, default=960,
                    help="decode width; under about 900 a small outline move rounds into the next frame")
    a = ap.parse_args()

    data = json.load(open(a.hits))
    hits = data if isinstance(data, list) else data[a.cut or next(iter(data))]["hits"]
    env = envelope(audio(a.video))
    if a.audio_only:
        fps = 30.0
        offs = []
        for h in hits:
            au = audio_hit(env, int(h["f"]), fps)
            off = None if au is None else au - int(h["f"])
            offs.append(off)
            flag = "" if off is not None and abs(off) <= a.tol else "  <-- OFF"
            print(f"{int(h['f']):>6} {'none' if au is None else f'{au:7.2f}'} {'' if off is None else f'{off:+6.2f}'}  {h['name']:<7} {h.get('what', '')}{flag}")
        good = [abs(o) for o in offs if o is not None]
        bad = sum(1 for o in offs if o is None or abs(o) > a.tol)
        print(f"\n{len(offs)} hits against intended frames, {bad} more than {a.tol} off; max {max(good):.2f} frames")
        sys.exit(1 if bad else 0)
    fr, fps = frames_gray(a.video, a.width)
    n, H, W = fr.shape
    diffs = {}

    def outline_for(roi):
        """How far the dark shape's box moved each frame, inside a region.

        WHY a box and not pixels: when an island opens, its content blurs in for 4 frames after
        the outline has landed, so the pixel change peaks late and says the click is early. The
        box of the black pixels moves only with the outline. Needs a flat, light ground under
        the shape: render the check with the camera held still and the ground flat."""
        key = ("outline", tuple(roi) if roi else None)
        if key not in diffs:
            x0, y0, x1, y1 = roi or (0, 0, 1, 1)
            sub = fr[:, int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] < 40
            boxes = []
            for m in sub:
                ys, xs = np.nonzero(m)
                boxes.append((xs.min(), xs.max(), ys.max()) if len(xs) else (0, 0, 0))
            b = np.array(boxes, dtype=np.float64)
            d = np.abs(np.diff(b, axis=0)).sum(axis=1)
            diffs[key] = np.concatenate([[0.0], d])
        return diffs[key]

    def measure(h):
        return outline_for(h.get("roi")) if h.get("metric") == "outline" else diff_for(h.get("roi"))

    def diff_for(roi):
        """Frame-to-frame change inside a region, given as fractions of the frame.

        WHY a region: a line of type landing under the island moves more pixels than a button
        press, and the global difference then measures the type."""
        key = tuple(roi) if roi else None
        if key not in diffs:
            x0, y0, x1, y1 = roi or (0, 0, 1, 1)
            sub = fr[:, int(y0 * H):max(int(y1 * H), int(y0 * H) + 1), int(x0 * W):max(int(x1 * W), int(x0 * W) + 1)]
            d = np.abs(np.diff(sub.astype(np.int16), axis=0))
            # WHY changes under 6 grey levels are dropped: an h264 keyframe re-quantises a flat
            # ground, and in a small region with nothing moving that read as a motion spike 2
            # frames after a digit snapped (the Seam film's timer, 27 Oct 2026).
            d = np.where(d < 6, 0, d).mean(axis=(1, 2))
            diffs[key] = np.concatenate([[0.0], d])
        return diffs[key]

    # One measurement per frame: two voices on one contact (a click and its sub) are one event.
    rows, seen = [], {}
    for h in hits:
        f = int(h["f"])
        if f not in seen:
            seen[f] = (audio_hit(env, f, fps), motion_contact(measure(h), f), h)
        au, mo, _ = seen[f]
        off = None if au is None or mo is None else au - mo
        rows.append((h, f, au, mo, off))

    bad = 0
    print(f"{'frame':>6} {'audio':>7} {'motion':>6} {'off':>6}  sound / what")
    for h, f, au, mo, off in rows:
        flag = "" if off is not None and abs(off) <= a.tol else "  <-- OFF"
        if flag:
            bad += 1
        aus = "  none" if au is None else f"{au:7.2f}"
        offs = "   n/a" if off is None else f"{off:+6.2f}"
        mos = "  none" if mo is None else f"{mo:>6}"
        print(f"{f:>6} {aus} {mos} {offs}  {h['name']:<7} {h.get('what', '')}{flag}")
    offs = [abs(r[4]) for r in rows if r[4] is not None]
    print(f"\n{len(rows)} hits, {bad} more than {a.tol} frame off; median |off| "
          f"{np.median(offs):.2f}, max {max(offs):.2f} frames ({max(offs) / fps * 1000:.0f} ms)")

    if a.plot:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        uniq = sorted(seen)
        cols = 6
        rws = (len(uniq) + cols - 1) // cols
        fig, axs = plt.subplots(rws, cols, figsize=(cols * 2.6, rws * 1.9), squeeze=False)
        spf = SR / fps
        for ax, f in zip(axs.flat, uniq):
            au, mo, first = seen[f]
            diff = measure(first)
            t0, t1 = f - 10, f + 8
            s = np.arange(int(t0 * spf), int(t1 * spf))
            s = s[(s >= 0) & (s < len(env))]
            e = env[s] / (env[s].max() + 1e-9)
            ax.plot(s / spf, e, color="#ff9230", lw=1)
            k = np.arange(max(0, t0), min(len(diff), t1))
            d = diff[k] / (diff[k].max() + 1e-9)
            ax.step(k, d, where="mid", color="#4a90d9", lw=1)
            if mo is not None:
                ax.axvline(mo, color="#4a90d9", ls="--", lw=1)
            if au is not None:
                ax.axvline(au, color="#ff9230", ls="--", lw=1)
            names = ", ".join(sorted({h["name"] for h, ff, *_ in rows if ff == f}))
            ax.set_title(f"f{f} {names}", fontsize=7)
            ax.tick_params(labelsize=6)
            ax.set_yticks([])
        for ax in list(axs.flat)[len(uniq):]:
            ax.axis("off")
        fig.suptitle("orange: audio envelope and hit   blue: frame difference and contact", fontsize=8)
        fig.tight_layout()
        fig.savefig(a.plot, dpi=110)
        print(f"plot: {a.plot}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
