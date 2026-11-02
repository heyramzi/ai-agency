#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["numpy"]
# ///
"""Measure a motion film instead of arguing about it.

Reverse-engineers the numbers that decide whether a product film works: how many cuts it has,
what the music's bar is, how long each typographic card stays on screen, and what the palette
actually is. Every figure in references/product-film.md came out of this script.

Run it on a reference before copying its look, and on your own render before calling it done.

    uv run teardown.py all      <file.mp4>       # everything below, in one pass
    uv run teardown.py cuts     <file.mp4>       # hard-cut count; a product film wants 0
    uv run teardown.py tempo    <file.mp4|.wav>  # BPM, beat, bar -- the unit beats.ts is built in
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
from teardown_lib.ground import cmd_ground  # noqa: E402
from teardown_lib.palette import cmd_palette  # noqa: E402
from teardown_lib.sheet import cmd_sheet  # noqa: E402
from teardown_lib.tempo import cmd_tempo  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("command",
                    choices=["all", "cuts", "tempo", "cards", "palette", "sheet",
                             "camera", "ground"])
    ap.add_argument("file")
    ap.add_argument("--ss", type=float, default=0.0, help="start of the window, seconds")
    ap.add_argument("--t", type=float, default=12.0, help="length of the window, seconds")
    args = ap.parse_args()

    if not Path(args.file).exists():
        sys.exit(f"no such file: {args.file}")

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
