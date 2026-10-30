"""1fps contact sheets."""

from __future__ import annotations

from pathlib import Path

from .frames import run

def cmd_sheet(path: str, out: str = "sheets") -> None:
    """1fps contact sheets. The fastest way to read a film's beat map by eye."""
    Path(out).mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-v", "error", "-i", path, "-vf", "fps=1,scale=320:-1,tile=8x6",
         f"{out}/sheet_%02d.png", "-y"])
    made = sorted(Path(out).glob("sheet_*.png"))
    print(f"{len(made)} sheet(s) in {out}/ -- open them and write the beat map:")
    for m in made:
        print(f"  {m}")
