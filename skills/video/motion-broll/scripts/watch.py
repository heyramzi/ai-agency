#!/usr/bin/env python3
"""Give the model eyes on a rendered video.

A render exits zero whether or not the graphic is on screen, inside the safe band, readable, or
gone before the cut. Only a picture settles that. This pulls frames out of any mp4, mov or webm,
burns the timecode and the source frame number into each one, and writes them where they can be
read back. The timecode is the point: a review that says "the label is clipped" costs a hunt, and
one that says "clipped at t=3.42s, f=103" is a one-line fix.

Selectors (pick one; --sheet is the default):
  --sheet          frames spread evenly across the clip, plus a contact sheet
  --fps F          sample at F frames per second
  --at T[,T...]    exact instants, seconds or mm:ss.ms
  --frames N[,N…]  exact source frame numbers
  --seams          detect the cuts and sample either side of each one
  --cuts T,T       same, from cut times you already know (the plan, beats.ts, the SRT)

Alpha clips (qtrle/argb, prores 4444, keyed webm) are matted over --bg first, because a
transparent PNG read straight back tells you nothing about what the viewer sees.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys

FONT = next(
    (f for f in ("/System/Library/Fonts/Supplemental/Arial.ttf",
                 "/System/Library/Fonts/Menlo.ttc",
                 "/Library/Fonts/Arial Unicode.ttf") if os.path.exists(f)),
    None,
)
ALPHA_FMTS = ("argb", "rgba", "abgr", "bgra", "yuva420p", "yuva422p", "yuva444p",
              "yuva444p10le", "yuva422p10le", "yuva420p10le")


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def probe(path):
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_streams",
               "-show_format", "-of", "json", path])
    if out.returncode:
        sys.exit(f"ffprobe failed on {path}:\n{out.stderr.strip()}")
    data = json.loads(out.stdout)
    st = data["streams"][0]
    num, den = (st.get("r_frame_rate") or "25/1").split("/")
    fps = float(num) / float(den or 1)
    dur = float(st.get("duration") or data["format"].get("duration") or 0)
    alpha = st.get("pix_fmt") in ALPHA_FMTS or st.get("tags", {}).get("alpha_mode") == "1"
    return {"fps": fps, "dur": dur, "w": int(st["width"]), "h": int(st["height"]),
            "alpha": alpha, "pix_fmt": st.get("pix_fmt"), "codec": st.get("codec_name")}


def parse_time(s):
    s = s.strip()
    if ":" in s:
        parts = [float(p) for p in s.split(":")]
        out = 0.0
        for p in parts:
            out = out * 60 + p
        return out
    return float(s)


def vf(meta, args, t):
    """Matte the alpha, scale, then burn in the instant this frame was taken at.

    Returns the ffmpeg flags, not just a string, because an alpha clip needs a generated background
    input and therefore -filter_complex, while an opaque one is a plain -vf chain.

    The label is written from the seek time, not the stream clock: seeking with -ss before -i
    restarts the output PTS near zero, so `%{pts}` reports the same 0.02s on every single frame.
    """
    chain = []
    if not args.full:
        chain.append(f"scale={args.width}:-2:flags=lanczos")
    if not args.no_label and FONT:
        size = max(14, int((args.width if not args.full else meta["w"]) / 42))
        pad = size // 3
        label = f"t={t:.3f}s  f={int(round(t * meta['fps']))}"
        chain.append(
            f"drawtext=fontfile='{FONT}':text='{label}':x={pad}:y={pad}:fontsize={size}"
            f":fontcolor=white:box=1:boxcolor=black@0.65:boxborderw={pad}"
        )
    tail = ",".join(chain) if chain else "null"

    if meta["alpha"] and args.bg != "none":
        # A transparent PNG read back tells you nothing about what the viewer sees, so the frame is
        # composited over a flat matte first. drawbox cannot do this: it paints into the frame and
        # leaves the alpha channel alone, so the result is still see-through.
        # setpts and shortest are both load-bearing: seeking leaves the frame's PTS around 1.25s
        # while the generated matte starts at 0, and without them overlay finds no match and hands
        # back a bare grey card that looks like a clip which rendered nothing.
        graph = (f"color=c={args.bg}:s={meta['w']}x{meta['h']}[bg];"
                 f"[0:v]format=rgba,setpts=PTS-STARTPTS[fg];"
                 f"[bg][fg]overlay=shortest=1:format=auto,{tail}[v]")
        return ["-filter_complex", graph, "-map", "[v]"]
    return ["-vf", tail]


def grab(src, times, outdir, meta, args, tag="f"):
    """One ffmpeg call per instant. An accurate seek beats a fast one when the frame is the point."""
    written = []
    for i, t in enumerate(times):
        dst = os.path.join(outdir, f"{tag}{i:03d}_t{t:07.3f}.png")
        r = run(["ffmpeg", "-v", "error", "-ss", f"{t:.4f}", "-i", src,
                 "-frames:v", "1", *vf(meta, args, t), "-y", dst])
        if r.returncode or not os.path.exists(dst):
            tail = r.stderr.strip().splitlines()
            print(f"  ! no frame at t={t:.3f}s: {tail[-1] if tail else 'past the end'}", file=sys.stderr)
            continue
        written.append((t, dst))
    return written


def cuts(src, threshold):
    r = run(["ffmpeg", "-v", "info", "-i", src, "-filter:v",
             f"select='gt(scene,{threshold})',metadata=print:file=-", "-f", "null", "-"])
    return [float(m) for m in re.findall(r"pts_time:([0-9.]+)", r.stdout + r.stderr)]


def sheet(frames, dst, cols, cell):
    """One image that shows the whole clip at a glance. Read this first; pull single frames after."""
    if not shutil.which("magick") or not frames:
        return None, "ImageMagick `magick` not found"
    cmd = ["magick", "montage"]
    if FONT:  # montage renders its labels through freetype and dies without a configured font
        cmd += ["-font", FONT]
    cmd += [p for _, p in frames]
    cmd += ["-tile", f"{cols}x", "-geometry", f"{cell}x+6+6", "-background", "#101010",
            "-depth", "8", "-quality", "88", dst]
    r = run(cmd)
    if r.returncode or not os.path.exists(dst):
        return None, (r.stderr.strip().splitlines() or ["montage failed"])[-1]
    return dst, None


def main():
    ap = argparse.ArgumentParser(description="Extract labelled frames from a render so they can be looked at.")
    ap.add_argument("video")
    ap.add_argument("--sheet", action="store_true", help="frames spread across the clip + a contact sheet")
    ap.add_argument("-n", "--count", type=int, default=20, help="frames for --sheet (default 20)")
    ap.add_argument("--fps", type=float, help="sample at this many frames per second")
    ap.add_argument("--at", help="exact instants, comma separated: 1.2,3,0:04.5")
    ap.add_argument("--frames", help="exact source frame numbers, comma separated")
    ap.add_argument("--seams", action="store_true", help="sample either side of every detected cut")
    ap.add_argument("--cuts", help="sample either side of these known cut times, comma separated")
    ap.add_argument("--scene", type=float, default=0.08,
                    help="cut detection threshold (default 0.08; our clips share one dark backdrop, "
                         "so a real cut between two of them scores far below ffmpeg's usual 0.3)")
    ap.add_argument("--range", help="restrict to A-B in seconds")
    ap.add_argument("--out", help="output directory (default <video>.watch/)")
    ap.add_argument("--width", type=int, default=960, help="scaled width (default 960)")
    ap.add_argument("--full", action="store_true", help="no downscale")
    ap.add_argument("--bg", default="0x6E6E6E", help="matte for alpha clips, or 'none' (default 0x6E6E6E)")
    ap.add_argument("--no-label", action="store_true", help="do not burn the timecode in")
    ap.add_argument("--cols", type=int, default=5, help="contact sheet columns (default 5)")
    ap.add_argument("--cell", type=int, default=360, help="contact sheet cell width (default 360)")
    args = ap.parse_args()

    if not os.path.exists(args.video):
        sys.exit(f"no such file: {args.video}")
    meta = probe(args.video)
    lo, hi = 0.0, meta["dur"]
    if args.range:
        a, _, b = args.range.partition("-")
        lo, hi = parse_time(a), parse_time(b)

    outdir = args.out or os.path.splitext(args.video)[0] + ".watch"
    os.makedirs(outdir, exist_ok=True)
    for old in os.listdir(outdir):
        if old.endswith((".png", ".jpg")):
            os.remove(os.path.join(outdir, old))

    print(f"{os.path.basename(args.video)}  {meta['w']}x{meta['h']}  {meta['fps']:.2f}fps  "
          f"{meta['dur']:.2f}s  {meta['codec']}/{meta['pix_fmt']}"
          f"{'  alpha, matted over ' + args.bg if meta['alpha'] and args.bg != 'none' else ''}")

    made_sheet = False
    if args.at:
        times = [parse_time(t) for t in args.at.split(",")]
    elif args.frames:
        times = [int(n) / meta["fps"] for n in args.frames.split(",")]
    elif args.fps:
        step = 1.0 / args.fps
        times, t = [], lo
        while t < hi:
            times.append(t)
            t += step
    elif args.seams or args.cuts:
        seams = ([parse_time(t) for t in args.cuts.split(",")] if args.cuts
                 else cuts(args.video, args.scene))
        seams = [t for t in seams if lo <= t <= hi]
        if not seams:
            print("no cuts over the threshold. Pass the known cut times with --cuts, or lower "
                  "--scene; an even spread follows.", file=sys.stderr)
            args.sheet = True
            times = []
        else:
            print(f"{len(seams)} cuts: " + ", ".join(f"{t:.2f}s" for t in seams))
            # Before, at, and after: the last element must have resolved by the outgoing frame, and
            # the incoming clip must already read on the frame after the cut.
            times = sorted({max(lo, t + d) for t in seams for d in (-0.10, 0.04, 0.40) if lo <= t + d <= hi})
    else:
        args.sheet = True
        times = []

    if args.sheet and not times:
        span = max(hi - lo, 0.001)
        n = max(1, args.count)
        times = [lo + span * (i + 0.5) / n for i in range(n)]
        made_sheet = True

    frames = grab(args.video, times, outdir, meta, args)
    for t, p in frames:
        print(f"  t={t:7.3f}s  f={int(round(t * meta['fps'])):5d}  {p}")

    if made_sheet:
        s, err = sheet(frames, os.path.join(outdir, "_sheet.jpg"), args.cols, args.cell)
        print(f"  contact sheet: {s}" if s else f"  contact sheet skipped: {err}")

    if not frames:
        sys.exit("no frames written")
    print(f"\n{len(frames)} frames in {outdir}. Read them, then name every fix with its t= and f=.")


if __name__ == "__main__":
    main()
