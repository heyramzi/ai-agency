#!/usr/bin/env python3
"""Generate a b-roll clip with a hosted video model, and key it back to a real alpha channel.

WHY THIS EXISTS ALONGSIDE REMOTION, not instead of it. Remotion owns anything that has to stay
identical to a source file, land on an exact frame, or come out with true transparency. A model owns
what code cannot fake: rubber deforming, cloth settling, liquid, real motion blur. This script is
the second lane, and it exists because the first attempt at it burned an hour on account state.

SEEDANCE NOW GOES DIRECT. The BytePlus account was funded and its Seedance models activated on
2026-08-20, so this runner's Replicate default is stale for that one family: Ark is ~$0.15/s of
1080p against Replicate's ~$0.34/s. The Ark path is not written here yet, deliberately - it could
not be verified without spending credit. Write it on the next beat that routes to Seedance, per
the ai-video-prompting skill, which holds the request shape and the model ids
(`dreamina-seedance-2-0-260128`, not the Replicate slug). Everything below still applies to every
other family.

WHY REPLICATE AND NOT THE FIRST-PARTY APIS. It is not cheaper - it resells at a markup. It is the
only lane that works on the day you want it:
  - BytePlus Ark: the key authenticates and `GET /models` returns the whole catalogue, and every
    video model still answers `ModelNotOpen` until someone activates it by hand in the console. The
    catalogue listing a model is not access to it.
  - Google Gemini: Veo has no free tier. A key with working text quota answers 429 on
    `:predictLongRunning`, and so does the Cloudflare AI Gateway lane in front of it, because the
    gateway forwards the same key.
Replicate is one token against every model family. Once a model wins the comparison, move that one
to its direct API to drop the markup.

ALPHA. No hosted model outputs an alpha channel. Generate on flat chroma green instead: put the
subject on #00B140 in the first frame, tell the prompt to hold the background empty and unlit, then
`--matte` keys it to QuickTime Animation, which is the format Descript keys. Green spill on a dark
subject is the usual failure; `despill` is on by default.

  python3 genvideo.py bytedance/seedance-2.0 --image first.jpg --prompt-file p.txt --matte
  python3 genvideo.py --plate app/static/design/thumbnails-3d/claude-code-3d.png --prompt-file p.txt

Model ids come from `--list`, which reads Replicate's image-to-video collection newest first. Do not
hardcode one here: the leader changes every few weeks and a pinned default silently ships last
season's model.
"""
import argparse, base64, json, os, pathlib, subprocess, sys, time, urllib.error, urllib.request

# Cloudflare and Replicate both 403 the default urllib agent.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")
API = "https://api.replicate.com/v1"
GREEN = "#00B140"   # broadcast chroma green: far from every brand colour in tokens.ts
def token():
    """The token, from the environment or from the consumer project's own env file.

    WHY it walks up from the cwd rather than from `__file__`: this script is a symlink projected
    into a consumer project, so `__file__` resolves back to the skill source and any path built from
    it points at the wrong repo. The cwd is the project.
    """
    if os.environ.get("REPLICATE_API_TOKEN"):
        return os.environ["REPLICATE_API_TOKEN"]
    here = pathlib.Path.cwd().resolve()
    for base in [here, *here.parents]:
        for env in (base / ".env.local", base / "app" / ".env.local", base / ".env"):
            if env.is_file():
                for line in env.read_text().splitlines():
                    if line.startswith("REPLICATE_API_TOKEN="):
                        return line.split("=", 1)[1].strip().strip("\"'")
    sys.exit("No REPLICATE_API_TOKEN in the environment or in any .env.local above the cwd")


def call(url, payload=None):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode() if payload else None,
        headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json", "User-Agent": UA})
    return json.load(urllib.request.urlopen(req, timeout=120))


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"{cmd[0]} failed:\n{r.stderr[-1500:]}")


def plate_to_frame(plate, out, width, height, box):
    """Centre a transparent PNG on flat green at the delivery frame size."""
    run(["magick", "-size", f"{width}x{height}", f"xc:{GREEN}",
         "(", str(plate), "-resize", f"{box}x{box}", ")",
         "-gravity", "center", "-composite", "-depth", "8", "-quality", "92", str(out)])
    return out


def sound(src, dst, kit, hit, beats):
    """Cut the house kit onto a generated clip.

    WHY the kit and not the model's own audio: Seedance 2.0 and Kling 3.0 both generate sound, and
    it is generic sound. A video cuts these clips against CTAs and Remotion b-roll built from
    `sfx.tsx`, which is one chord in one room, and a generated whoosh next to that is audibly a
    different video. `--generate-audio` is there when the beat genuinely needs diegetic sound.

    WHY `apad` before `-shortest`: without it the mix ends when the last sample does and `-shortest`
    then truncates the *video* to the audio length. The first cut of this silently returned a 3.1
    second clip from a 5 second render, and nothing in the output said so.
    """
    ms = int(round(hit * 1000))
    parts, labels = [], []
    for i, (name, vol) in enumerate(beats, start=1):
        delay = f"adelay={ms}|{ms}," if name != "enter" else ""
        parts.append(f"[{i}:a]{delay}volume={vol}[a{i}]")
        labels.append(f"[a{i}]")
    graph = ";".join(parts) + ";" + "".join(labels) + \
        f"amix=inputs={len(beats)}:duration=longest:normalize=0,apad[mix]"
    cmd = ["ffmpeg", "-v", "error", "-i", str(src)]
    for name, _ in beats:
        cmd += ["-i", str(kit / f"{name}.wav")]
    acodec = "pcm_s16le" if str(dst).endswith(".mov") else "aac"
    cmd += ["-filter_complex", graph, "-map", "0:v", "-map", "[mix]",
            "-c:v", "copy", "-c:a", acodec, "-shortest", "-y", str(dst)]
    run(cmd)


def burst_frame(src):
    """The frame the picture changes most, which on a pop is the failure frame.

    A generated burst never lands where the prompt asked, so the sound has to be cut to the file
    rather than to the request.

    WHY the argmax and not the first frame over a threshold: a threshold assumes the burst is one
    hard cut. Veo's balloon pleats inward for half a second before it lets go, so no single frame
    clears 0.05 and a threshold search returns nothing at all - which is what it did. Scoring every
    frame and taking the largest jump has no tuning in it and works on both shapes.

    WHY `/dev/null` and not `-f null -`: the null muxer writes to stdout, which is where
    `metadata=print:file=-` is already writing. Together they return nothing, silently.
    """
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-vf",
                        "select='gte(scene,0)',metadata=print:file=-", "-an", "-f", "null", "/dev/null"],
                       capture_output=True, text=True)
    best, t = 0.0, None
    pending = None
    for line in r.stdout.splitlines():
        if "pts_time:" in line:
            pending = float(line.split("pts_time:")[1])
        elif "scene_score=" in line and pending is not None:
            score = float(line.split("scene_score=")[1])
            if score > best:
                best, t = score, pending
    return t


def matte(src, dst, similarity, blend, despill):
    """Green to alpha, then QuickTime Animation.

    WHY two filters and not one `colorkey`: `chromakey` works in YUV so it tolerates the lighting
    variation a generated frame always has, where an RGB distance key leaves a hard rim.
    `despill` pulls the green cast back out of the subject's edge - without it a dark object on
    green comes out with a lime outline that no amount of key tuning removes.
    WHY qtrle rather than ProRes 4444: qtrle stores ARGB directly, so it is lossless with no
    RGB-to-YUV step, and it is the one alpha format Descript actually keys.
    """
    chain = f"chromakey={GREEN}:{similarity}:{blend}"
    if despill:
        chain += ",despill=type=green:mix=0.5:expand=0"
    run(["ffmpeg", "-v", "error", "-i", str(src), "-an", "-vf", chain,
         "-c:v", "qtrle", "-pix_fmt", "argb", "-y", str(dst)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model", nargs="?", help="e.g. bytedance/seedance-2.0")
    ap.add_argument("--list", action="store_true", help="show the image-to-video collection, newest first")
    ap.add_argument("--image", help="first frame, already on green")
    ap.add_argument("--plate", help="transparent PNG to centre on green instead of --image")
    ap.add_argument("--box", type=int, default=620, help="plate size in px inside the frame")
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--prompt-file")
    ap.add_argument("--prompt")
    ap.add_argument("--duration", type=int, default=5)
    ap.add_argument("--resolution", default="1080p")
    ap.add_argument("--out", default="out/genvideo")
    ap.add_argument("--name")
    ap.add_argument("--matte", action="store_true", help="also write a keyed .mov with alpha")
    ap.add_argument("--similarity", type=float, default=0.18, help="chromakey tolerance; raise if green survives")
    ap.add_argument("--blend", type=float, default=0.06, help="chromakey edge softness")
    ap.add_argument("--no-despill", action="store_true")
    ap.add_argument("--extra", default="{}", help="JSON merged into the model input, for per-model fields")
    ap.add_argument("--sfx", action="store_true", help="cut the house kit onto the result")
    ap.add_argument("--hit", type=float, help="seconds of the transient; detected from the picture when omitted")
    ap.add_argument("--kit", default="tools/motion/public/sfx", help="where the wavs live")
    ap.add_argument("--generate-audio", action="store_true", help="keep the model's own audio instead")
    ap.add_argument("--negative", help="negative prompt, on the models that take one")
    a = ap.parse_args()

    if a.list:
        for m in call(f"{API}/collections/image-to-video").get("models", []):
            print(f"{m['owner']}/{m['name']:<28} {(m.get('description') or '')[:70]}")
        return

    if not a.model:
        sys.exit("Pass a model id, or --list to see them.")
    out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    name = a.name or a.model.split("/")[-1]

    frame = pathlib.Path(a.image) if a.image else plate_to_frame(
        pathlib.Path(a.plate), out / f"{name}-first-frame.jpg", a.width, a.height, a.box)
    prompt = a.prompt or pathlib.Path(a.prompt_file).read_text().strip()

    payload = {
        "image": "data:image/jpeg;base64," + base64.b64encode(frame.read_bytes()).decode(),
        "prompt": prompt,
        "duration": a.duration,
        "resolution": a.resolution,
        # Their audio is not our kit. b-roll sound is cut from sfx.tsx to the same frame constants.
        "generate_audio": a.generate_audio,
        "negative_prompt": a.negative or "",
    }
    payload.update(json.loads(a.extra))

    # Drop anything this model does not declare.
    #
    # WHY: every family names its fields differently - Wan takes `first_frame` where Seedance takes
    # `image`, Kling takes `start_image` and has no `resolution` at all. Sending a field a model
    # does not know is a 422 that costs a round trip and reads like an auth problem. The schema is
    # already on the model object, so ask it rather than maintaining a table per family here.
    model = call(f"{API}/models/{a.model}")
    allowed = model["latest_version"]["openapi_schema"]["components"]["schemas"]["Input"]["properties"]
    dropped = sorted(set(payload) - set(allowed))
    payload = {k: v for k, v in payload.items() if k in allowed and v not in (None, "")}
    if dropped:
        print(f"dropped (not in {a.model} schema): {', '.join(dropped)}")
    missing_image = [k for k in ("image", "first_frame", "start_image") if k in allowed]
    if "image" not in allowed and missing_image:
        payload[missing_image[0]] = "data:image/jpeg;base64," + base64.b64encode(frame.read_bytes()).decode()
        print(f"first frame sent as `{missing_image[0]}`")

    try:
        p = call(f"{API}/models/{a.model}/predictions", {"input": payload})
    except urllib.error.HTTPError as e:
        sys.exit(f"submit failed {e.code}: {e.read().decode()[:700]}")

    print(f"prediction {p['id']}", flush=True)
    for _ in range(120):
        time.sleep(8)
        s = call(p["urls"]["get"])
        if s["status"] in ("starting", "processing"):
            print(".", end="", flush=True); continue
        print()
        if s["status"] != "succeeded":
            sys.exit(json.dumps(s.get("error") or s)[:800])
        uri = s["output"] if isinstance(s["output"], str) else s["output"][0]
        mp4 = out / f"{name}.mp4"
        mp4.write_bytes(urllib.request.urlopen(
            urllib.request.Request(uri, headers={"User-Agent": UA}), timeout=600).read())
        print(f"SAVED {mp4}  {mp4.stat().st_size/1e6:.1f} MB")
        print(f"METRICS {json.dumps(s.get('metrics', {}))}")
        targets = [mp4]
        if a.matte:
            mov = out / f"{name}-alpha.mov"
            matte(mp4, mov, a.similarity, a.blend, not a.no_despill)
            print(f"KEYED {mov}  {mov.stat().st_size/1e6:.1f} MB")
            targets.append(mov)
        if a.sfx:
            hit = a.hit if a.hit is not None else burst_frame(mp4)
            if hit is None:
                print("SFX SKIPPED: no transient found, pass --hit")
            else:
                beats = [("enter", 0.5), ("pop", 1.0), ("sub", 0.45)]
                for t in targets:
                    dst = t.with_name(f"{t.stem}-sound{t.suffix}")
                    sound(t, dst, pathlib.Path(a.kit), hit, beats)
                    print(f"SOUND {dst}  hit at {hit:.3f}s")
        return
    sys.exit("timed out")


if __name__ == "__main__":
    main()
