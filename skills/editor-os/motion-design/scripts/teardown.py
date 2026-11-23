#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["numpy"]
# ///
"""Measure a motion film instead of arguing about it.

Reverse-engineers the numbers that decide whether a product film works: how many cuts it has,
how much of it stands still, whether the subject holds the centre, how long a card sits on bare
ground, the music's bar and the palette. The gate's figures in references/product-film.md came
out of this script.

Run it on a reference before copying its look, and `gate` on your own render before calling it
done: it exits 1 on any fail.

    uv run teardown.py gate     <file.mp4>       # pass/fail against the reference's numbers
    uv run teardown.py all      <file.mp4>       # everything below, in one pass
    uv run teardown.py cuts     <file.mp4>       # cut-like changes at 0.06, fast motion included
    uv run teardown.py tempo    <file.mp4|.wav>  # BPM, beat, bar, for laying the bed on the locked picture
    uv run teardown.py cards    <file.mp4>       # every centred-text card: length, gap, cycle
    uv run teardown.py palette  <file.mp4>       # ground, ink and the saturated windows
    uv run teardown.py sheet    <file.mp4>       # a timecoded frame every 0.5s, to write the beat table
    uv run teardown.py camera   <file.mp4> --ss 174 --t 12   # camera velocity, settle tau, residual
    uv run teardown.py ground   <file.mp4> --ss 181          # vignette profile and accent clusters

Needs ffmpeg, ffprobe and uv; uv brings numpy from the header above.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# `uv run --script` runs this file from wherever the caller stands, so the package beside it has
# to be on the path by this file's location, not the cwd.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from teardown_lib.camera import cmd_camera  # noqa: E402
from teardown_lib.cards import cmd_cards  # noqa: E402
from teardown_lib.cuts import cmd_cuts  # noqa: E402
from teardown_lib.gate import cmd_gate  # noqa: E402
from teardown_lib.ground import cmd_ground  # noqa: E402
from teardown_lib.palette import cmd_palette  # noqa: E402
from teardown_lib.sheet import cmd_sheet  # noqa: E402
from teardown_lib.tempo import cmd_tempo  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("command",
                    choices=["gate", "all", "cuts", "tempo", "cards", "palette", "sheet",
                             "camera", "ground"])
    ap.add_argument("file")
    ap.add_argument("--ss", type=float, default=0.0, help="start of the window, seconds")
    ap.add_argument("--t", type=float, default=12.0, help="length of the window, seconds")
    ap.add_argument("--end", type=float, default=2.0,
                    help="gate: seconds of end card at the tail, exempt from still/centre/card checks")
    ap.add_argument("--length", default="15-25", help="gate: allowed film length, seconds, lo-hi")
    ap.add_argument("--max-cuts", type=int, default=0,
                    help="gate: hard cuts allowed at 0.3 (a match cut on the object's own outline)")
    ap.add_argument("--timeline", action="store_true", help="gate: print card, centre and height per 0.2 s")
    args = ap.parse_args()

    if not Path(args.file).exists():
        sys.exit(f"no such file: {args.file}")

    if args.command == "gate":
        lo, hi = (float(x) for x in args.length.split("-"))
        sys.exit(cmd_gate(args.file, end_s=args.end, length=(lo, hi), max_cuts=args.max_cuts,
                          timeline=args.timeline))
    if args.command == "all":
        for name, fn in (("CUTS", cmd_cuts), ("TEMPO", cmd_tempo),
                         ("CARDS", cmd_cards), ("PALETTE", cmd_palette)):
            print(f"\n=== {name} " + "=" * (60 - len(name)))
            fn(args.file)
    elif args.command == "camera":
        cmd_camera(args.file, ss=args.ss, t=args.t)
    elif args.command == "ground":
        cmd_ground(args.file, ss=args.ss)
    else:
        {"cuts": cmd_cuts, "tempo": cmd_tempo, "cards": cmd_cards,
         "palette": cmd_palette, "sheet": cmd_sheet}[args.command](args.file)


if __name__ == "__main__":
    main()
