"""ffmpeg and ffprobe I/O: run a command, probe a file, decode frames to numpy."""

from __future__ import annotations

import subprocess
import sys

import numpy as np

def run(args: list[str]) -> bytes:
    p = subprocess.run(args, capture_output=True)
    if p.returncode != 0 and not p.stdout:
        sys.exit(f"ffmpeg failed: {p.stderr.decode()[-600:]}")
    return p.stdout


def probe(path: str) -> tuple[float, int, int, float]:
    """duration, width, height, fps"""
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
               "stream=width,height,r_frame_rate", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1", path]).decode()
    d = dict(line.split("=", 1) for line in out.strip().splitlines() if "=" in line)
    num, den = d["r_frame_rate"].split("/")
    return float(d["duration"]), int(d["width"]), int(d["height"]), float(num) / float(den)


def raw_gray(path: str, vf: str, w: int, h: int,
             ss: float | None = None, t: float | None = None) -> np.ndarray:
    """Decode a filtered stream straight to a (frames, h, w) uint8 array.

    `ss`/`t` trim before decoding, so a camera measurement over one 12-second sequence does not
    have to pull an eight-minute film through memory.
    """
    trim = ([] if ss is None else ["-ss", str(ss)]) + ([] if t is None else ["-t", str(t)])
    buf = run(["ffmpeg", "-v", "error", *trim, "-i", path, "-vf", vf,
               "-f", "rawvideo", "-pix_fmt", "gray", "-"])
    n = w * h
    frames = len(buf) // n
    return np.frombuffer(buf, dtype=np.uint8)[: frames * n].reshape(frames, h, w)
