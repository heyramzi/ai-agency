# The Descript clipboard: cuts, Ignores and styles as a paste

Open this before cutting or styling through the clipboard (`dscript.py`, `dclip.py`), when no CLI verb does the edit. Credentials and the write path: [descript-cli.md](descript-cli.md).

## The clipboard is a write path

Descript's rich clipboard carries the edit: the `«class HTML»` flavor holds `<span data-descript-pasteboard="<base64 JSON>">` (851 KB for 325 characters): `copiedTaus[]` (`text.string`, `audioSegment {mediaRefId, offset, duration}`), word alignment (`startTime`/`endTime`), `sequenceTracks[]`, `copiedComponents[]`, `projectId`, `sourceTrack.id`. A cut is a rewrite of `copiedTaus`: each surviving run becomes its own TAU slicing the same media, then select all and paste (1036.95s to 270.15s, predicted 278.2s). `scripts/dclip.py` reads and writes it; `recut2.py` rebuilds from **token** indices (`dscript words`), not alignment indices, which drift apart without erroring.

**Ignore, not delete.** Ignore is `isBlocked: true` on the TAU: text and `audioSegment` stay, contiguous with neighbours. Same 12 cuts: delete gave 2:22, ignore 2:46 (24 s of the speaker's pauses eaten). Ignore is reversible, keeps text byte-identical and strands no commas; delete butt-splices, needs recapitalising. `build_ignore()` splits each TAU where the flag changes, with `duration` running to the next segment's first word and a text-equality assertion. With ignores, `composition.duration` overstates the render length (279.4s vs 261.8s): sum the TAUs where `isBlocked` is false.

**What `apply` does unasked:** cuts as Ignore, keeps every existing Ignore, removes fillers and truncated fragments, repairs glued stutters and product names (`--typos`, glossary in [cutting.md](cutting.md)), carries every scene boundary and marker onto the TAU still holding its text, and refuses to write unless the payload round-trips and every style range lands inside its TAU. A second pass is safe (an empty cut list is an exact no-op). `candidates.py` finds 3 harder classes: **digression markers** (a phrase like "you could potentially" is often a digression to cut; proposed, never enumerated, `--check` exits 1 while uncovered), **`phrase_cuts()`** (announcing phrases, 24 generated members, longest match first; "make sure we cut this off every time I say this"), and **`opener_cuts()`** ("you always forget to remove 'now' and 'so'": filler only when it opens a sentence (29% of one video's sentences). `so that` and `now that` keep it, with 0 false positives in 300). Where the transcriber was wrong and the audio is right, fix the text; where the speaker misspoke, leave it unless asked.

**Write the cut list in words.** `scripts/resolve.py` turns a phrase into a token range with 5 words of context each side, and refuses a phrase that matches nothing, matches twice without `nth`, or overlaps another (`pre`/`post` disambiguate). `grab` works on a partial selection.

**4 things that bite.**
- Plain text pasted does nothing: no `audioSegment`, so it lands as typed text. `osascript -e` dies on a real payload (`Argument list too long`): pipe to `osascript -`.
- Map words to the alignment by time, never `difflib`. With a sentence spoken 12 times, `SequenceMatcher` pairs tokens with the wrong take at identical counts, and the take you meant to cut stays in the video. Check word agreement, not count.
- Paragraph breaks live in the text, never in TAU boundaries (68 TAUs holding 55 paragraphs). Slice the separator from the source, capitalise only after a newline.
- TAUs don't tile the media (36 gaps, 186.04 s): a rebuilt payload drops them free, so runtime falls further than words (56.8% of words, 74% of runtime).

**Housekeeping:** a `uuid4` per new TAU; remap `copiedComponents[].tauAnchor.tauId` to the segment holding its character position (`reanchor()`; pointing all at `new[0]` once piled 11 boundaries at the top); markers are `markerComponent` with `text`, `--markers markers.json` `[{"phrase","text"}]` matched against surviving text; capitalise the first TAU after cutting a connector; keep the pre-edit payload to restore, and tell the user not to copy anything meanwhile.

**Formatting rides along:** `attributes` `{"name":"bold"|"highlight","value"}` with `range {location,length}` in characters inside that TAU's own string (a straddling phrase is styled once per TAU); every highlight id is registered in `highlighters` (alpha 64, 13 ids in `PALETTE`). A highlight is a cue to the editor (`CUES`):

| colour | means | executes it |
|---|---|---|
| blue | B-ROLL, full-frame clip | `motion-design` (full-frame) |
| purple | FIGURE, diagram or analogy | `motion-design` (figure, alpha layer) |
| green | ON-SCREEN TEXT | `motion-design` (caption) |
| orange | CTA overlay | `motion-design` (YouTube CTA kit) |
| coral | BRAND ASSET | Design Assets shelf |
| yellow | EMPHASIS, punch in | editor |
| red | PROBLEM, retake or fix before publish | the speaker |

`styles.example.json`: `[{"phrase","highlight","bold"}]`. Read each attribute back and slice the TAU with its range; a wrong style is silent. Run it through `scripts/dscript.py` (`grab` `words` `apply` `check` `history` `restore`): it archives every payload to `~/.descript-clip/history`, the only undo that survives the clipboard being overwritten (Raycast's history is encrypted).

The order is fixed. The clipboard replaces the script region from an older grab; `pnpm descript layout` writes server-side. Cut, markers and pins go first as pastes, every `layout` command after, or the paste silently discards every stamp. The CLI's `edits` pass avoids this: one commit, no order to get wrong.
