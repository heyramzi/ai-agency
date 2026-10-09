# Long-form (16:9)

Read this when `RUN.json` says `format: wide`. Descript is the main route: `editor-os new "<title>"
<link>` takes a Descript project, Descript stays the surface, and the studio is optional until a verb
writes `edit.json` or the notes. The trunk rules in `SKILL.md` still hold. This file only adds what a
long video does differently.

## Chapters

Pass 2 reorders, then chapters. The intro usually holds a second pain recorded after the promise, and
the outro usually asks twice with the price objection between: move them with `arrange.py` or
`descript move`. Then `descript marker` on each section's first line, the first at 0:00, because
publish turns the markers into YouTube chapters. A Short never does this.

## Layouts

The 16:9 set is the pack's Camera ladder (`Intro Zoom`, `Cam 100` to `Cam 130`), the Screen cards,
the Text and Speaker cards, `Motion Full Frame`, `CTA` and `End Card`. Pick by the `job` line under each card. Pace a stretch
with `layout pace` scoped to its register (intro, tour, outro), never the whole runtime, and let
`layout check` say when the changes bunch up or one card runs too long. A demo card with no `--screen`
shows the camera twice, so point it at the screen track.

## B-roll and screen recordings

Slots come from `sequence.py` in pass 3, and a clip with no slot wasn't needed. Drawn motion goes to the
`motion-designer`, one per chapter, and found footage to the `broll-scout`. A screen recording rides the
Screen cards. A sentence that names a structure with no digit takes a zoom, and
`visuals.py check --plan` gates the zoom share.

## Pace

Dead air is held by the gate in `cutting.md` on the rendered file, the layout rhythm by `layout check`, and the cut
by the coach pass, so don't hand-tune a number here. Re-derive the clock with `beatclock.py` after every
cut, or the beats drift out by minutes.
