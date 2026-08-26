# The script library

The note side of production: how the folders are contracted, how a batch is triaged
against the production record, and what shape a note has to be in. Whatever app holds
your scripts, these rules are about the drift between it and the board.

## Triage the script library

The note app is the script store; the board is the production record. They drift, because
a Short can be shot without anyone opening the note. Re-triage whenever a batch is
recorded.

**Folder contract.** Everything lives under one parent folder, `Shorts`. Inside it:

- `Batch N` folders hold written scripts waiting to be shot.
- `Unscripted pool` holds ideas with a title and no script. They are **not batchable** and
  must be left out of any rebalance.
- `Shot` holds anything recorded, whether or not it has published.
- `Archive` holds the dead.

There is no `Done` folder, because `Shot` is the recorded folder. Read the live folder
list before writing rather than trusting a name from this file.

**The batch numbers roll, they are not a fixed set of three.** When a batch is recorded
its folder empties and a new one is created at the far end, so the live set walks 1/2/3 to
2/3/4 and on. Read which folders exist and which are empty before planning; the
lowest-numbered non-empty folder is the one being recorded now. Leave the emptied folder
in place rather than deleting it.

**Step 1, find what is already recorded.** Cross-reference the codes in note titles
against the video posts that actually exist, in the publishing queue and on the board.
Anything with a scheduled or published post is recorded and moves to `Shot`. Do not trust
the date in a note title: those are planned dates and they go stale immediately.

**Step 2, expect scripts that do not exist, and do not read anything into it.** Improvising
to camera is a normal mode, not an exception. On one board, 20 of 40 coded tasks had no
note at all. That is not a missing file to hunt for and **it is not a kill signal**. The
task is the record: write `Script: none (improvised to camera)` on it and move on. Never
ask the presenter to account for a note that never existed, and never invent one.

**Step 3, rebalance the batches by pillar, moving as few notes as possible.** A recording
session should yield a varied publishing week, so aim for one of each pillar per batch
rather than equal totals.

**Every move bumps the note's modification date, and most note apps sort by it, so a full
reshuffle destroys the author's ordering.** Compute the target assignment first, then move
only the notes whose batch actually changes. One clean pass was 12 moves out of 23 for an
A:2 C:2 L:2 M:1 P:1 split across three batches.

**Verify a move by reading the folder back, not by asking the note where it lives.** Note
APIs commonly answer that question wrongly straight after a move, including for notes
nothing touched. Folder counts plus a folder listing are the honest check.

**Step 3b, a note that moves batch drags two lines on the board with it.** Every coded task
opens with a scheduled date and a path to its script. Neither is maintained by anything, so
both go stale on almost every task and the path names folder trees that no longer exist.
Rewrite both lines on every task whose note moved or whose date changed.

**Step 3c, decide which way the calendar and the batches point, and say so.** They drift
apart, and the two repairs are opposite: either sort the scripts into batches by their
existing publish dates, or keep the batches and re-flow the publish dates to follow the
recording order. The second is usually right once the calendar is already slipping, but it
moves work by weeks, so it is the owner's call and not a default. Whichever way it goes,
publish dates land only on posting days, and slots already held by recorded or in-progress
material are not reused.

**Step 4, report the collisions rather than fixing them silently.** Two codes on one topic,
a code used by both a recorded piece and an unrecorded one, leftover idea fragments in a
batch whose topic already shipped. Re-coding or killing those belongs to the owner.

## The note shape: written at the ends, bullets in the middle

Every script note runs `INTRO`, `MEAT`, `OUTRO` with timings on each.

**The MEAT is bullets and never full prose.** The presenter reads the first and last lines
as written and says the middle their own way, so a scripted middle gets read out rather
than spoken, and that flattens the register. Bullets keep the beats and let the sentences
happen on camera.

The two ends are written out for a reason, and each has its own. The opening carries the
conditional that qualifies the audience and the one cited number. The closing line is
usually shared word for word with the pinned post and the first DM, so rewording it on
camera breaks the surfaces that were deliberately saying one thing.

Under the timings, a note also carries a one-line metadata row, where the piece will live,
the word count against the target pace, the tags, and a `RE-CHECK BEFORE SHOOTING` block
holding whatever would go wrong if it were said differently. Read the newest note in the
live batch before writing a new one, because that block is where corrections accumulate.
