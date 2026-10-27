# Rendering and downloading a Descript master

Open this before rendering a master, choosing a local export or a cloud publish, or pulling a render to disk. Credentials: [descript-cli.md](descript-cli.md).

## Rendering and downloading

```
descript publish <project> [composition] --resolution 4K --download ~/Downloads
descript jobs                        # a second publish answers "A publish job is already running"
descript job <id> --download <path>  # pull a finished render
descript assets <project> --kind video
descript pull <project> IMG_0015 --seconds 60   # the ORIGINAL take, never a render; --seconds stream-copies
```

- `assets` shows the ORIGINAL filename (`IMG_0015.mov`) and never the Files panel name (`CAM 1`); tell takes apart by duration (`get_project` seconds vs `assets --probe`). A slow first connection reads like a hang (iPhone `mdat`-first files): re-run before believing the route is broken; `error: fetch failed` off `media_assets` is the same. `pull --from` slices at the keyframe BEFORE the requested second (a phone-clip tail read 0.6 s early), so sync from windows of the full-take audio, never a copied slice.
- `--download` always goes to `~/Downloads`, as a folder. Pass the folder (`~/Downloads`) and never a filename: the file takes the composition's name and the served extension (before 2026-09-10 a master landed as an extensionless `remux`). Never into a repo (5 course videos are 2.1 GB).
- A publish replaces the composition's existing share URL, so naming the wrong composition overwrites the wrong link. `GET /v1/jobs` answers `{ data: [...] }` with no `download_url` (only the single-job GET has it); `progress.percent` sits at 15 all render. Poll `job_state: stopped` instead.
- Download is 8 ranged connections (the signed Google Storage URL throttles per connection and signs `host` only): 442 s cut 135 s at 7.8 MB/s, 1834 s cut 298 s at 6.7 MB/s, one stream ~45 min. `--connections 1` is the old stream. A download that dies about 30 s in (`error: terminated`, on a 2.6 GB master) resumes from the offset written; never re-render, since the job stays downloadable about 23 hours (`descript job <id> --download`).
- Cloud renders: a 442 s cut took 22 min, 1367 s about 22 min and 1834 s 17 min. Render time tracks runtime, bytes don't (8.6 Mbps on the 1834 s cut, 29.0 on the 1367 s one): quote no GB figure before it lands.

**4K comes off a local export first, the cloud second.** The lock is gone since 10 Sep 2026 (`descript_creator_v3`: both rows `aria-disabled="false"`).

```
pnpm descript export local <project> [composition] --resolution 4K --quality high
pnpm descript export local <project> --resolution 2K --scope scene --dry    # click nothing
pnpm descript export local <project> --via orca --page <id>                 # drive HIS browser
pnpm descript export local <project> --keep                                 # leave the window up
```

| | Local export | Cloud publish |
|---|---|---|
| Video | h264 High 3840x2160, 18.4 Mbps at Recommended | 29.7 Mbps or 7.8 Mbps, encoder picks |
| Colour | `bt709` throughout | `smpte170m`, or `iec61966-2-1` over full-range `yuvj420p` |
| Audio | AAC 48 kHz, plus a `mov_text` subtitle track unless Advanced drops it | AAC 44.1 kHz at 160 kbps |
| Cost | tab busy for the whole encode | nothing local held |

The cloud mints the share URL and is the fallback when local refuses a clip. `pnpm youtube:master` restamps bt709 either way. The colour tag isn't decidable from the render alone: `pull` the original, compare one frame's saturation; only if they diverge, retag (re-encodes nothing): `ffmpeg -i master.mp4 -c copy -color_primaries bt709 -color_trc bt709 -colorspace bt709 out.mp4`.

- Local export needs a real click and a living tab. A synthetic `element.click()` flips the button to `Loading` and writes no file; closing the tab or restarting the browser kills the encode silently. So it runs in a Chrome of its own by default (`--via chrome`: `/Applications/Google Chrome.app`, profile `~/.cache/descript-cli/chrome`, DevTools port 3348, signed in by writing the `stytch_session` cookie, driven over CDP). `--via orca` holds his front tab for the whole encode, and its confirm and editor buttons are both `Export`. **Not headless**: WebCodecs falls back to a software encoder.
- The driver closes its own tab. 3 leaked tabs made Descript refuse a fourth with `Project is taking longer than expected to initialize` for 11 minutes; `openChrome` clears tabs on that project's URL first. An expired cookie shows a sign-in screen (`pnpm descript auth capture`); a fresh profile takes 2 minutes the first run.
- The file sits at 0 bytes for the whole encode (1:05 at 4K: 5 minutes at 0, then 221 MB). Empty is progress; a `--timeout` shorter than the encode reports a failure over a good run. Never click Export again (the second never gets its own file; the command refuses it). Never run a local export and a cloud `publish --download` of one composition together: both write that name into `~/Downloads` (11 Sep).
- It can refuse a clip with a toast (`Couldn't process "<take>.mov" during export`, a 43-minute HEVC 4K take, though a 2-second scene exported fine): publish that cut in the cloud.
- Maximum everything. Video rows default to 4K and High; `export local` also opens Advanced and sets stereo, 48 kHz and the top audio bitrate (256 kbps; the app ships 128). Quality rows are bitrates scaling with resolution (4K: High 30, Recommended 20, Low 10 Mbps; 1080p: 21, 14, 7). `--quality` defaults to `high`.
- Check the sources before choosing 4K. One project's cameras were 1920x1080 and its screens 3840x2160 (4 Sep 2026), so 4K upscales the face. `assets --probe` for sources, `videoMetadata` in `descript doc` for the composition; at a real 1080p timeline `pnpm youtube:master` upscales (Lanczos, 3 minutes).
- YouTube needs 2160p either way. At 1080p it serves one rung (1920x1080 h264 at 1.35 Mbps, no VP9). At 2160p it serves up to 3840x2160 VP9 at 3.0 to 5.4 Mbps. `youtube` refuses an upload under 2160p.
- A dark plain background is a bitrate decision too. At 7.8 Mbps the encoder rations, and a bright wall of posters takes bits off the face (one video's background was 1.33 stops brighter than the subject).
