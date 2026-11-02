"""Timecoded contact sheets, a frame every 0.5s."""

from __future__ import annotations

from pathlib import Path

from .frames import run

# Every tile carries its own timestamp, so the beat table's times are read off the sheet,
# never counted from a tile's position. 0.5s, because a 1fps sheet skipped whole beats of a
# 21s launch film (2 Nov 2026).
STAMP = ("drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=white"
         ":box=1:boxcolor=black@0.6:boxborderw=4")


def cmd_sheet(path: str, out: str = "sheets") -> None:
    """Contact sheets at 2fps with a timecode on each tile, to write the beat table by eye."""
    Path(out).mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps=2,scale=320:-1,{STAMP},tile=6x5",
         f"{out}/sheet_%02d.png", "-y"])
    made = sorted(Path(out).glob("sheet_*.png"))
    print(f"{len(made)} sheet(s) of 15s each in {out}/ -- open them and write the beat table:")
    for m in made:
        print(f"  {m}")
