#!/usr/bin/env python3
"""Prove candidates.py and restate.py read a Tella project's edit.json. usage: test_editwords.py

TSK-1444: on Tella there is no doc.json, only the words `editor-os new` pulled into edit.json. The
words below are the recorded test clip's (29 Oct 2026), on the cut clock. Its three attempts at
"between newsletters, client emails" are the repeat pass 1 has to find, as a span `drop` takes.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import candidates
import editwords
import restate

CLIP = "cl_cmvtt7u3d00ve02mr7jum8w6y"
SAID = (
    "I'm 20.099 20.219|sure 20.219 20.439|your 20.439 20.619|clients 20.619 21.129|"
    "email 21.169 21.479|you 21.479 21.679|at 21.679 21.929|any 21.999 22.179|"
    "time 22.179 22.429|of 22.429 22.519|the 22.519 22.589|day, 22.589 23.099|"
    "and 23.169 23.779|you 23.919 23.989|might 23.989 24.239|be 24.239 24.339|"
    "lost 24.339 24.679|between 24.679 25.139|all 25.179 25.319|the 25.319 25.409|"
    "emails 25.409 25.799|you're 25.799 25.909|getting 25.909 26.389|in 26.389 26.519|"
    "your 26.519 26.659|inbox. 26.689 27.199|"
    "Between 27.873 28.173|newsletters, 28.173 29.013|client 29.013 29.463|"
    "emails, 29.513 30.173|it's 30.657 30.817|hard 30.857 31.397|to 31.477 31.517|"
    "know. 31.517 31.917|"
    "Between 33.525 33.825|newsletter- 33.825 34.475|between 34.605 34.955|"
    "newsletters, 34.955 35.725|client 35.725 36.185|emails, 36.185 36.785|"
    "meeting 37.269 37.619|changes, 37.619 38.419|"
    "between 39.245 39.395|newsletters, 39.395 40.125|client 40.125 40.505|"
    "emails, 40.505 41.055|meeting 41.055 41.555|reschedulings, 41.555 42.495|"
    "it's 42.985 43.065|hard 43.065 43.445|to 43.445 43.485|know 43.485 43.935|"
    "when 44.165 44.355|something 44.355 45.025|is 45.215 45.515|an 45.515 45.585|"
    "actual 45.585 46.235|task. 46.295 46.805"
)
WORDS = [{"text": t, "start": float(a), "end": float(b)}
         for t, a, b in (w.split(" ") for w in SAID.split("|"))]


def edit(ranges):
    return {"version": 1, "backend": "tella",
            "sources": {CLIP: {"duration": 60, "words": WORDS}},
            "timeline": {"fps": 30, "ranges": [dict(source=CLIP, start=a, end=b, kept=k)
                                                for a, b, k in ranges]}}


def main():
    fails = []

    # Pass 1 on the raw words: one repeat, from the first attempt to the start of the last.
    raw = editwords.script(edit([(0, 60, True)]))
    got = [c for c in candidates.find(raw["blocks"]) if c["kind"] == "repeat"]
    if len(got) != 1:
        fails.append("expected one repeat over the three attempts, got %d" % len(got))
    else:
        args = editwords.drop_args(raw, got[0]["slices"])
        if args != ["27.873-38.419"]:
            fails.append("the repeat's drop span is %s, wanted ['27.873-38.419']" % args)
        if not candidates.live(got[0], raw["blocks"], editwords.dropped_marks(raw)):
            fails.append("an edit that drops nothing read the repeat as covered")
        # What `editor-os drop <name> 27.873-38.419` saves: 120 ms of air left either side.
        cut = editwords.script(edit([(0, 27.319, True), (27.319, 39.125, False), (39.125, 60, True)]))
        if candidates.live(got[0], cut["blocks"], editwords.dropped_marks(cut)):
            fails.append("the drop's ranges left the repeat uncovered")

    # Two clips: a span names its clip.
    two = edit([(0, 60, True)])
    two["sources"]["cl_second"] = {"duration": 5, "words": []}
    if editwords.drop_args(editwords.script(two), got[0]["slices"] if got else []) != ["1=27.873-38.419"]:
        fails.append("a video of two clips doesn't name clip 1 in the span")

    # Pass 2 on the live words: the speaker sentence, as one span, and the dropped words gone.
    live = editwords.script(edit([(0, 27.319, True), (27.319, 39.125, False), (39.125, 60, True)]),
                            live=True)
    if "newsletter-" in " ".join(live["blocks"]):
        fails.append("the live script still holds a dropped word")
    said = [c for c in restate.find(live["blocks"]) if c["kind"] == "speaker"]
    if not said or not said[0]["t"].startswith("I'm sure your clients"):
        fails.append("no speaker sentence in %r" % [c["t"][:40] for c in said])
    else:
        c = said[0]
        span = editwords.drop_args(live, [(c["b"], c["at"], c["at"] + len(c["t"]))])
        if span != ["20.099-27.199"]:
            fails.append("the speaker sentence's span is %s, wanted ['20.099-27.199']" % span)

    # The 1.6 s after "know." is listed with the span that trims it.
    if editwords.pauses(raw)[:1] != [(33.525 - 31.917, "know.", "Between", "31.917-33.525")]:
        fails.append("the long pause is %r" % editwords.pauses(raw)[:1])

    if fails:
        print("FAIL test_editwords\n     - %s" % "\n     - ".join(fails))
        return 1
    print("PASS test_editwords  edit.json read raw and live, spans ready for editor-os drop")
    return 0


if __name__ == "__main__":
    sys.exit(main())
