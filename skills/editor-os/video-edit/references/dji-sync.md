# DJI Sync

Starts when the recording stops and owns the card until it's empty. It swaps one audio track and gets out: no edit, trim, grade or re-encode.

## 2 paths off one card

| | Reel take | Solo take |
| --- | --- | --- |
| Script | `dji_sync.py` | `dji_note.py` |
| Needs | an iPhone clip to pair with | nothing but the take |
| Output | `NAME-dji.MOV`, video bit-identical | speech-only `.opus` + a vault voicenote |
| Rule | the video is the timeline | the transcript is the deliverable |

Ask which one it is. The author says it in plain words ("that's a voice memo", "pair this with the reel") and that wins; a wrong guess burns 20 minutes or destroys a reel's audio half. Without it: no clip in `~/Downloads` near the take's timestamp means solo; a take VAD reports as mostly silence means solo; a take within seconds of a clip's length means reel. When unsure, `dji_note.py --dry-run` decides and writes nothing.

## Reel path

The video is the timeline. Its duration, frame timing and metadata are the truth; the take bends to it, with a trim at the front, a shift in time and padding where it runs short, so output duration equals input duration or the run failed.

Never match on timestamps. The transmitter and phone clocks disagree and drift: a filename stamped `190732` against a clip at `19:07:49` implied 17 s, the true offset was 16.004 s, and a second take sat 90 s from its stamp. Stamps only order takes; the waveform decides.

**The match rule.** One global GCC-PHAT alignment, then the offset re-measured in every 2-second window. A real match holds one offset everywhere, a false one wanders. A confirmed true/false pair gave these numbers:

| Signal | True | False | Verdict |
| --- | --- | --- | --- |
| Envelope correlation | r ~ 0.00 | r ~ 0.00 | useless (chest lav and room mic share no envelope) |
| Peak height (PSR) | median 15.1 | median 7.1 (max 23.1) | overlaps |
| Offset spread across windows | **0.15 ms** | **5.9 ms** | the discriminator |

Accept needs all of: at least 80% of windows within 1.0 ms of the median, each with peak-to-sidelobe 5 or more; a 15-point margin over the runner-up take; 2 or more usable windows. Miss one and it refuses and writes nothing. Pass the take yourself and leave the thresholds alone: `dji_sync.py clip.MOV --take /path/to/TX00_MIC005.wav`.

Alignment is sub-sample (parabolic peak interpolation, agreeing windows averaged, the fraction applied as an FFT phase ramp; verified 0.000 ms spread). Clock drift beats the initial offset on long takes: -13.9 ppm is 0.5 ms over 36 s but about 8 ms over 10 minutes. A slope is fitted free from the windows and the take is resampled only past 10 ms projected drift.

When the take runs short (first real pair: 20.29 s of a 35.84 s clip), uncovered stretches fill from the phone's audio, RMS-matched, with a 40 ms crossfade. The run prints `WARNING` with the head and tail gap; `--silence-gaps` leaves them silent. Read the coverage line: 57% is a usable rescue and never a clean take.

No loss. `-c:v copy`, and the burn is rejected unless the output's video MD5 equals the source's. Audio is ALAC `s32p` (round-trip residual -143.3 dBFS, float32's own epsilon). The only changes to the lav are the shift and the seam crossfade. `--codec pcm` for old NLEs, `--codec aac` for a small upload copy. Metadata (`-map_metadata 0 -movflags use_metadata_tags`, `exiftool` restoring Apple keys, mtime and creation date reset) keeps rotation, `CreationDate` with timezone, GPS, `Make`/`Model`/`Software` and the four `mebx` tracks. ffprobe then calls their `codec_tag_string` `stts`: cosmetic; drop those tracks if a tool chokes.

## Solo path

Silence goes before whisper sees it. Fed 20m17s of a walk (233.7 MB), whisper gave 249 words and none of the content, 38 of 42 lines one repeated sentence; the same take VAD-cut to 1m00s gave 130 words and all of it (233.7 MB down to 168 KB: 1393x smaller, 24 kbps mono Opus). Silero VAD decides. A dB gate swings 10x over 15 dB (`silenceremove` at -50/-45/-40/-35 kept 488/230/113/50 s, VAD said 49.8 s); use it only as a cross-check. Defaults: a 0.25 s pad and a 10 ms join fade, and silences under 400 ms are kept.

The loop guard is the safety net. If one normalised sentence is 6 or more lines and 40% of the transcript, it's whisper looping: no note, no wipe, card untouched, retry with a lower `--vad-threshold`. It tripped at 38 of 42 lines; the real take passed at 1 of 11.

The note lands at `📥 Raw/Voicenotes/YYYY-MM-DD <Title>.md` with the take id, both durations and the audio path. Raw is immutable and the wiki is a separate act: summarise the take back and ask what to emphasise before writing a wiki page, and don't rewrite the North Star from a walk. Pass `--title` after reading it, or it's filed as `DJI note HHMM` and renamed at ingest.

The wipe is destructive here. The reel path archives every take in full; the solo path archives only the Opus and deletes the source wav. `--keep-original` archives the full wav through the checksummed path.

## Running it

```bash
D=<skill-dir>/scripts
python3 "$D/dji_sync.py"                     # newest clip in ~/Downloads, detect card, burn, wipe
python3 "$D/dji_sync.py" --dry-run           # decide and report, touch nothing
python3 "$D/dji_sync.py" clip1.MOV clip2.MOV # several clips, each take used once
python3 "$D/dji_note.py" --dry-run --no-note # cut, transcribe, print, write nothing
python3 "$D/dji_note.py" --title "..."       # file the note, then wipe the card
```

`--no-clean` keeps the card on either path. Reel flags: `--take`, `--keep-scratch` (phone audio as a second track), `--silence-gaps`, `--codec`, `--archive DIR`, `--card PATH`, `--output PATH`. Note flags: `--title`, `--vad-threshold` (0.5), `--min-silence-ms` (400), `--pad` (0.25), `--bitrate` (24k), `--lang` (auto), `--keep-original`, `--no-note`, `--vault DIR`. Reel output lands beside the source as `NAME-dji.MOV`; the original is never modified.

Needs `ffmpeg`, `ffprobe`, numpy; the solo path also `whisper-cli` and `whisper-vad-speech-segments` (`brew install whisper-cpp`) plus 2 models borrowed from VoiceInk: `~/Library/Application Support/com.prakashjoshipax.VoiceInk/WhisperModels/ggml-large-v3-turbo-q5_0.bin` and `/Applications/VoiceInk.app/Contents/Resources/ggml-silero-v5.1.2.bin`. If VoiceInk goes, copy both somewhere stable and set `--model` and `--vad-model`. Local and free; a 20-minute take is about 26 seconds on the M4 Pro.

## The card wipe

Order is fixed: **burn, verify, archive, checksum, delete.** Every take is copied to `~/Movies/dji-archive/YYYY-MM-DD/` and each SHA-256 compared before anything is removed. A mismatched take stays on the card; if any clip fails to verify, the card is left alone. **Trashing takes on a removable volume never frees space**: they sit in a hidden `.Trashes` on the card (31.5 MB the first run). The wipe clears `.Trashes` explicitly.
