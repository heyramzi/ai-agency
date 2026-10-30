"""Tempo: BPM, beat and bar from the soundtrack."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from .frames import run

def cmd_tempo(path: str, lo: float = 60.0, hi: float = 190.0) -> float:
    """BPM by spectral-flux comb, then the bar -- the number beats.ts is built in multiples of."""
    wav = Path(path).with_suffix(".teardown.wav")
    run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1",
         "-acodec", "pcm_s16le", "-ar", "44100", str(wav), "-y"])
    import wave
    with wave.open(str(wav)) as w:
        sr = w.getframerate()
        d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    wav.unlink(missing_ok=True)

    hop, win = 256, 1024
    hann = np.hanning(win)
    n = (len(d) - win) // hop
    spec = np.empty((n, win // 2 + 1), dtype=np.float32)
    for i in range(n):
        spec[i] = np.abs(np.fft.rfft(d[i * hop: i * hop + win] * hann))
    flux = np.maximum(0, np.diff(spec, axis=0)).sum(1)
    flux = (flux - flux.mean()) / (flux.std() or 1)
    fps = sr / hop

    # Score on the middle of the track: intros and outros are often free-time and skew the comb.
    a, b = int(len(flux) * 0.25), int(len(flux) * 0.75)
    seg = flux[a:b] - flux[a:b].mean()

    # Normalised autocorrelation. WHY not a plain comb: a comb scored by mean() samples fewer
    # points at slow tempos, so its average rises as the tempo falls and it lands on 80 BPM for a
    # 133 BPM track. Autocorrelation normalised by overlap has no such bias, and the harmonic
    # term plus the log-normal prior around 120 BPM settle the octave the way ear does.
    ac = np.correlate(seg, seg, "full")[len(seg) - 1:]
    ac /= np.maximum(np.arange(len(ac), 0, -1), 1)
    ac /= (ac[0] or 1)

    def at(lag: int) -> float:
        return float(ac[lag]) if 0 < lag < len(ac) else 0.0

    best = (-1e9, 0.0)
    for bpm in np.arange(lo, hi, 0.1):
        lag = 60.0 / bpm * fps
        prior = np.exp(-0.5 * (np.log2(bpm / 120.0) / 0.9) ** 2)
        score = prior * (at(round(lag)) + 0.5 * at(round(2 * lag)) + 0.25 * at(round(4 * lag)))
        if score > best[0]:
            best = (score, float(bpm))

    # Refine to 0.02 BPM with a fixed-sample comb, so every candidate is scored on equal terms.
    coarse = best[1]
    best = (-1e9, coarse)
    for bpm in np.arange(coarse - 3, coarse + 3, 0.02):
        per = 60.0 / bpm * fps
        count = int((len(seg) - 1) / per)
        if count < 8:
            continue
        for phase in np.arange(0, per, per / 12):
            idx = np.round(phase + np.arange(count) * per).astype(int)
            score = seg[idx[idx < len(seg)]].mean()
            if score > best[0]:
                best = (score, float(bpm))

    bpm = best[1]
    beat = 60 / bpm
    print(f"BPM {bpm:.2f}")
    print(f"  beat        {beat:.4f}s")
    print(f"  bar (4/4)   {beat * 4:.4f}s   <- one typographic card")
    print(f"  2 bars      {beat * 8:.4f}s   <- a line that carries the argument")
    print(f"  8-bar phrase{beat * 32:.3f}s  <- an act")
    for fps_out in (30, 60):
        print(f"  at {fps_out}fps: bar = {beat * 4 * fps_out:.1f} frames")
    return bpm
