## Watch the render, then fix, then render again

A render exits zero whether or not the graphic is on screen. The loop that closes that gap is the
one a human editor runs: render, watch it back, list what looks wrong, fix, render again, until a
pass returns nothing. Nothing else catches a graphic that is late, clipped, unreadable at size, or
still moving when the cut lands.

`scripts/watch.py` is the eyes. It pulls frames out of any mp4, mov or webm, mattes an alpha clip
over a flat grey first, and burns `t=` and `f=` into every frame, so a review names the instant and
the fix is a one-line change to a frame constant instead of a hunt.

```bash
W=.claude/skills/motion-broll/scripts/watch.py

python3 $W out/CompId.mp4 --sheet                 # the whole clip at a glance, plus _sheet.jpg
python3 $W out/CompId.mp4 --fps 4 --range 1.5-3   # the stretch a review flagged, in detail
python3 $W out/CompId.mp4 --cuts 5.0,10.0         # either side of a known cut in a joined edit
python3 $W out/cta.mov --sheet --bg 0x101820      # alpha, matted over the colour it will key onto
```

Read `_sheet.jpg` first, then pull single frames where the sheet looks wrong. Reviewing costs
tokens, so **run each clip's review in a subagent**: it opens the frames, and hands back a list of
fixes with a `t=` and `f=` on each one. The building session never loads the images.

What a review pass is looking for, in this order:

1. **Present.** Every element the code draws is on screen at the frame it should be.
2. **Inside the frame.** Nothing clipped, nothing below y=1650, nothing under the caption band.
3. **Readable at size.** The type holds up in the sheet cell. If it fails there it fails on a phone.
4. **Resolved before the cut.** The last element settles, then holds. Anything still travelling on
   the outgoing frame reads as a mistake.
5. **The idea, not the decoration.** The frame says what the line says.

The loop ends when a pass returns nothing, not when the fix list gets short. Every correction the speaker
makes at final review goes into the Learned Patterns section of `SKILL.md`
before the clip is closed out, so the same note is never given twice.
