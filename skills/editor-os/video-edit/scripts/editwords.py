"""A Tella project's edit.json read as the blocks candidates.py and restate.py read from a doc.json.

Tella has no paragraphs, so a pause of PARAGRAPH seconds starts a block, the way Descript breaks
one. Each word keeps its clip and time, so a candidate comes back as the span `editor-os drop` takes.
"""
import json

PARAGRAPH = 1.0     # a pause this long starts a new block
LONG_PAUSE = 1.0    # a pause this long inside the kept words is listed for pass 1


def is_edit(doc):
    return isinstance(doc, dict) and "sources" in doc and "timeline" in doc


def read(path, live=False):
    """The script of an edit.json, or None for any other file."""
    if not path.endswith(".json"):
        return None
    doc = json.load(open(path))
    return script(doc, live) if is_edit(doc) else None


def _mid(w):
    return (w["start"] + w["end"]) / 2


def _words(doc, live):
    """Every word in clip order (raw), or only the kept ones in play order (live)."""
    clips = {sid: n for n, sid in enumerate(doc["sources"], 1)}
    ranges = doc["timeline"]["ranges"]

    def tagged(sid, w):
        kept = any(r["source"] == sid and r["kept"] and r["start"] <= _mid(w) < r["end"]
                   for r in ranges)
        return dict(w, source=sid, clip=clips[sid], dropped=not kept)

    if not live:
        return [tagged(sid, w) for sid, src in doc["sources"].items()
                for w in sorted(src["words"], key=lambda w: w["start"])]
    out = []
    for r in ranges:
        if r["kept"]:
            words = sorted(doc["sources"][r["source"]]["words"], key=lambda w: w["start"])
            out += [tagged(r["source"], w) for w in words if r["start"] <= _mid(w) < r["end"]]
    return out


def script(doc, live=False):
    """{"blocks": [str], "words": [[(char start, char end, word)]], "clips": n} for a doc."""
    blocks, words, prev = [], [], None
    for w in _words(doc, live):
        if (prev is None or w["source"] != prev["source"]
                or not 0 <= w["start"] - prev["end"] < PARAGRAPH):
            blocks.append("")
            words.append([])
        at = len(blocks[-1]) + (1 if blocks[-1] else 0)
        blocks[-1] = f"{blocks[-1]} {w['text']}" if blocks[-1] else w["text"]
        words[-1].append((at, at + len(w["text"]), w))
        prev = w
    return {"blocks": blocks, "words": words, "clips": len(doc["sources"])}


def _seconds(s):
    return f"{s:.3f}".rstrip("0").rstrip(".")


def _arg(group, clips):
    clip = "" if clips == 1 else f"{group[0]['clip']}="
    return f"{clip}{_seconds(group[0]['start'])}-{_seconds(group[-1]['end'])}"


def drop_args(script, slices):
    """The `editor-os drop` spans for (block, start, end) character slices: the words starting inside them.

    One span per run of words in one clip, so a slice over a seam or a clip change gives two.
    """
    picked = [w for bi, s, e in slices for at, _, w in script["words"][bi] if s <= at < e]
    groups = []
    for w in picked:
        last = groups[-1][-1] if groups else None
        if last and last["source"] == w["source"] and last["start"] < w["start"]:
            groups[-1].append(w)
        else:
            groups.append([w])
    return [_arg(g, script["clips"]) for g in groups]


def dropped_marks(script):
    """One mark per character the edit already drops, block by block, in the shape candidates.masks gives."""
    marks = [bytearray(len(b)) for b in script["blocks"]]
    for bi, words in enumerate(script["words"]):
        for s, e, w in words:
            if w["dropped"]:
                marks[bi][s:e] = b"\x01" * (e - s)
    return marks


def pauses(script):
    """Long pauses between kept words in one clip, each with the span that trims it."""
    out = []
    kept = [w for words in script["words"] for _, _, w in words if not w["dropped"]]
    for a, b in zip(kept, kept[1:]):
        if a["source"] == b["source"] and b["start"] - a["end"] >= LONG_PAUSE:
            clip = "" if script["clips"] == 1 else f"{a['clip']}="
            out.append((b["start"] - a["end"], a["text"], b["text"],
                        f"{clip}{_seconds(a['end'])}-{_seconds(b['start'])}"))
    return out
