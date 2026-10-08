# Winner bands against control bands

Read 19 August 2026 over 270 thumbnails from 10 channels. The 15 winners and 12 controls per channel come from the
same format and period. 9 competitors (135 / 108) plus
the channel being worked on (15 / 12).
Banding holds budget, photographer and palette constant, so a trait in both bands is house style
and copying it buys nothing. A finding below applies only if it holds on 5 or more channels, or is
flagged single-channel. Rebuild any sheet:

```bash
npx tsx scripts/competitor-intel/thumbnails.ts <slug>
```

Slugs: `matt-gray`, `ali-abdaal`, `chase-ai`, `liam-ottley`, `systems-made-better`,
`nick-puru`, `ross-harkness`, `michele-torti`, `jordan-ross`, and your own. The same findings sit in `vibe-kit/ai-doc/references/competitor-evidence.md`, which `video-script` and `social` (`references/shorts-production.md`, `references/writing-posts.md`) also read.

**Single-channel lever, type in the top half.**
Our own channel only,
 re-read 28 Aug 2026: winners set words across the top (`ADVANCED TUTORIAL`,
`TUTO COMPLET 2025`, `CLICKUP CRM MADE EASY`, `LEARN IN 30 MINUTES`); controls hang them low over a
screenshot (`CLICKUP FEATURES FOR REMOTE TEAMS`, `ContentFlow`, `La meilleure méthode de travail`).
TV shows only the top until the viewer presses down: the 50% test in `craft.md`.

## 6 findings that replicate on 5 or more channels

1. **A second person is a control marker.** 1 winner in 135 and 12 controls in 108, and never the other
   way on any channel (Matt Gray 0/5, Jordan Ross 1/3, Liam Ottley 0/2, Nick Puru 0/1, Ross Harkness
   0/1). No guest, client, team shot or testimonial face beside yours.
2. **Somebody else's money as a receipt is a control marker.** Client MRR, Stripe or PayPal
   notifications, revenue curves, cash (Liam Ottley 2/5, Jordan Ross 2/5, Nick Puru 0/4, Michele
   Torti 1/2). Jordan Ross: `"ADDED $60,000 IN 8 MONTHS"`, `"WE WENT FROM $30K MRR TO $250K MRR"`.
   Exact exception: your own zero-to-X ladder wins (Ali Abdaal `$0 -> $1M`, Matt Gray `$0 | $10K |
   $1M` as one man in 3 rooms): a transformation, which proves nothing about anyone else.
3. **A numbered ramp of generic icons is a control marker** (`PHASE 1..5`, `STEP 1..4`): control on
   Ali Abdaal, Liam Ottley, Nick Puru, Jordan Ross, Michele Torti, zero winners. A numbered strip
   where every cell is a different real thing wins (Matt Gray's `1 LEVEL ... 7 LEVEL` is 7
   different people; Chase's is 7 screenshots).
4. **A bounded promise is a winner marker.** `full guide`, `FULL COURSE 4 HOURS`, `LEARN IN 30
   MINUTES`, `2 MINUTES A DAY`, `ONLY 1 PROMPT`, `A CEO ONLY HAS 3 JOBS`, `2026 FULL TOUR`. Winners on
   Liam Ottley, Michele Torti, Ross Harkness, Matt Gray and. Formulas: [`copy.md`](copy.md).
5. **An adjective with no object is a control marker.** `INSANE AGENTS`, `GAMECHANGER`, `ADAPT OR
   DIE`, `Thank Me Later`, `AIR TIME?` and `it does everything` (Michele Torti, Nick Puru, Ross
   Harkness, Jordan Ross and Matt Gray).
6. **A readable screenshot as the subject is a control marker** (Chase, Systems Made Better, Michele
   Torti, Jordan Ross, Liam Ottley). Winners use the same screenshots as texture: blurred,
   cropped hard, or dimmed to 30% behind 3 big words. No text survives at 320px.

## Faces: size and role, not presence

A face is in both bands on 8 of 9 channels, so presence is no lever. Systems Made Better is
the faceless case (12 of 15 winners no person, a real desk, one white label; 10 of 12 controls are
his face beside a floating app screenshot). Matt Gray is the small-figure case (the close-up has 1
winner and 3 controls; winners put him small in a real room, lake or desert). Ali Abdaal is the
holding case (mid-sized, holding a notebook, poster or book; hands prove it's real).

7 general archetypes against the bands: reaction face refuted (no shocked face in any
winner band, no max-saturation palette); juxtaposition holds as negation; single hero object
holds, strongest (the faceless variant); before/after holds (`OLD -> NEW`, `SLOP ->
FIXED`); numbered stakes split (finding 3); mystery/question and forbidden/danger unobserved.
Pick exactly one and name it in the build order: blending 2 says nothing.

## Per-channel lever (median long-form views)

| Channel | Median | What separates its winners |
| --- | --- | --- |
| Ali Abdaal | 312,027 | An artifact he made and holds: notebook, framework poster, book; or his `$0 -> $1M` ladder with a green arrow. Controls: UI cards, reviews of others' products |
| Liam Ottley | 43,716 | Completeness promise on a flat white or yellow plate with a named row of tool logos. Controls: money screenshots, lifestyle, 5-phase ramps |
| Systems Made Better | 23,054 | No person. A real desk or device, one white label, statement copy ending in a full stop. Controls: his face pointing at an app screenshot |
| Chase (AI) | 16,960 | 2 app icons and a plus sign on terracotta, 2-word benefit (`GOD MODE`, `INFINITE MEMORY`). Three or more logos, a versus or a chart is control |
| Matt Gray | 15,600 | One small person in a real place, 2 to 4 lowercase white words, a number as an object, one hand-drawn arrow |
| Michele Torti | 5,186 | Curriculum scope, a countable set (10 node icons), effort collapse, `OLD` crossed into `NEW`. Controls: adjective hype, icon halos |
| Nick Puru | 3,742 | Crossed-out options and one survivor (`THEY ALL LOST`, `Stop Paying For APIs`). Controls: money receipts, 12-logo grids, a robot mascot |
| Ross Harkness | 4,059 | Same overhead notebook in both bands, so the label is the lever: a quantity and a timeframe |
| Jordan Ross | 405 | A named copyable artifact (SOP, client portal, 5-line automation list). Controls: client income, guest faces |
| Ours | 715 | Completeness promises win the little we win. Series numbering, scolding and category labels are control |

What our own wall says: 27 frames share 3 faults on both bands, so it's house style and no accident, and what holds the median at 715: 5 to 8 elements where a winner carries 1 or 2; a
cut-out face at constant size and saturation on every frame; copy naming a category where a winner
makes a claim (`CLICKUP CRM`, `DOCS`, `MINI COURSE DAY 1`). Fixes in order: one focal element,
bounded claims, the faceless variant whenever a board, workflow or document can be the subject.

Method: bands come from `scripts/competitor-intel/sample.ts` (views against that channel's median
for the format; Shorts scored apart). 15 against 12 is small, 5-channel replication compensates.
9 of 10 channels are English; our French uploads sit inside our 27, untested for a language split.

## Face or faceless

Is there a thing that can be photographed or captured? (a board, canvas, document, inbox, desk,
device, printed page.) Yes: faceless. No (a decision, a position, a change in how someone works):
face, small. Tie-breakers: "you can copy this" is always faceless; "you should stop doing this"
works with a face, since a position needs somebody holding it.

**Faceless.** The artifact fills 60 to 80% of the frame, photographed in a real place (a flat
screenshot on a coloured plate is the control version). One label block on the emptiest third, never
over the idea. One arrow at most (4 of Matt Gray's 15 winners carry exactly one). Dim any
screenshot to ~30% behind the words. Kills it: a readable screenshot, 2 competing artifacts, a
logo over ~8% of the frame, a flat plate with nothing photographic. Assets:
product boxes, 3D tiles and marks on the design shelf (`thumbnail-3d`, `product-boxes`,
`product-marks`).

**Face.** One person, in one of 3 measured shapes:

- **Small in a real place (Matt Gray).** 15 to 30% of frame height inside a room or outdoor scene that
  does the talking; 2 to 4 lowercase white words, no plate; replaces the close-up.
- **Holding the artifact (Ali Abdaal).** Mid-shot holding something made: notebook, card, page,
  book. The artifact must read as an object. Never render an empty hand: a hand holding a card
  comes back with 5 digits, an empty upturned palm fuses into one blade; crop the hand out if
  nothing is held. If the words name a count, count the objects in the render (6 bands under
  "5 spaces" is a contradiction the viewer checks first).
- **Holding the artifact, product behind (our strongest).** Add one 3D tile floating behind the
  shoulder, 30 to 60% of frame height, tilted 10 to 15 degrees, edge hidden behind head or shoulder,
  colour spilling on the shoulder. Occlusion is what licenses the size, whatever the percentage. Hold a
  supplied asset near its handed-in angle: degradation tracks angular distance, not scale (62% at
  12 degrees survived, 55% on a hard desk rotation fell apart).
- **2-icon equation (Chase)**, the tooling slot: 2 large icons with real shadow and a plus sign
  on a house colour and 2 caps words; the person, if any, a small cut-out at the edge.

Kills it: a head filling the frame, a second person, a halo of 8 or more unlabelled icons, a
pointing gesture at a floating app window (control on 4 channels), an exaggerated shock face.

The plates are the iPhone set, browsable at `/design/shelves/faces`,
served from `youtube/{faces,broll,portrait}/<expression>/`.
 86 plates across 26 expressions, plus 15 desk b-roll frames and 10 seated portraits. The
older `~/Pictures/thumbnails-2026-08-19/` set is superseded. Naming is `<expression>-<copy-space>-<nn>`,
copy-space being the empty side for words (`confident-left-07` has the subject on the right).
Prefer `confident`, `smile-confident`, `deadpan`, `thinking`, `explaining`, `arms-crossed`,
`offer-smile`; the loud plates (`mindblown`, `gasp`, `shock-arms`, `angry-shout`, `shout`,
`facepalm`) have no support in the evidence. Desk b-roll is better faceless material than a plate.

**A/B pairing.** Same title and words, one frame built each way (variant C in the build order).
YouTube picks on watch-time share, not raw CTR; say so when handing over.
