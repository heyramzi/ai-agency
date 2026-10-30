"""Hard-cut count."""

from __future__ import annotations

import re
import subprocess
import sys

def cmd_cuts(path: str, threshold: float = 0.06) -> int:
    """Hard cuts. A product film should return zero: every change is a move, never a cut.

    TWO THINGS HERE ARE LOAD-BEARING AND BOTH LOOK LIKE NOISE. `-fps_mode` rather than `-vsync`,
    because ffmpeg 9 removed `-vsync` and the whole command then exits before it decodes a frame;
    and `-v info` rather than the `-v error` every other call in this file uses, because `showinfo`
    logs at info and its lines are the only output this function reads.

    Either one wrong and ffmpeg prints nothing this regex matches, which lands in the `else` branch
    below and reports **"Continuous. Every transition is a camera move."** - a confident false
    negative on a film with visible cuts in it. Found on 28 Aug 2026 measuring a reference with five
    of them. A measurement script that cannot fail loudly is worse than no script, so the return
    code is checked now rather than trusted.
    """
    proc = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-vf",
                           f"select='gt(scene,{threshold})',showinfo", "-fps_mode", "vfr",
                           "-f", "null", "-"], capture_output=True)
    err = proc.stderr.decode()
    if proc.returncode != 0:
        sys.exit(f"ffmpeg failed, so the cut count would be a lie:\n{err[-600:]}")
    times = [float(m) for m in re.findall(r"pts_time:([\d.]+)", err)]
    # The first decoded frame always passes the scene filter. It is not a cut.
    times = times[1:]
    print(f"cuts above scene={threshold}: {len(times)}")
    if times:
        print("  at:", " ".join(f"{t:.2f}" for t in times[:40]))
        print("\n  A product film wants 0. Anything above that is a slideshow with good scenes.")
    else:
        print("  Continuous. Every transition is a camera move.")
    return len(times)
