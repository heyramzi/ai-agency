# Shorts script

One reference for the whole job, because the job used to be spread over four. The structure sat in
`video-hooks`, the corpus of hooks that actually ran sat in `social`'s `references/tiktok.md`, and
the note shape sat in `social`'s `references/shorts-production.md`.
 So
this file holds the pieces specific to a whole Short, and it's the one to load when somebody says
"create a short". The truth rule and the voice pass are the trunk's, in `SKILL.md`, and outrank
everything here.

## What you're making

A script he can shoot straight off his phone and that sounds like him talking, not reading. That
means **the ends are written out and the middle is bullets.** He says the first and last lines word
for word and the middle his own way, so a fully scripted middle comes out read aloud and flat. Say
every written line out loud before filing it. If you run out of breath or it sounds like a slide,
rewrite it.

## The order of work

1. **Find the true thing first.** A number you measured, a screen you can show, a line from a doc
   you've actually read. The truth rule is the trunk's, and it outranks everything here. Every
   "I did" in the script is true today, or the re-check block says what to do before shooting.
1b. **Read the top band before you write.** `node scripts/top-band.mjs <niche words> --n 8` prints the
   best-ranked competitor Shorts on the subject. Copy their moves, never their words: they name the
   tool in its own sentence, count out loud and show each step working.
2. **Pick an opening shape by number** from [hook-library.md](hook-library.md),
   the 30 shapes reverse-engineered from 475 banded openings plus our own posts. Then write 3
   variants on different mechanisms and rate each one for drop-off, per [video-hooks.md](video-hooks.md).
   Write the 2nd beat too: the doubt the viewer already has, said out loud.
3. **Build the body on the skeleton** in [shorts-structures.md](shorts-structures.md):
   outcome hook, named method, 2 or 3 steps each carrying an example, a flip at about 25 seconds
   that still leaves a fact standing when you delete it, then a reply-trigger CTA whose artefact
   exists before the post goes out.
4. **Shape the note** per [note-shape.md](note-shape.md): title
   `CODE · name`, `CLEAN READ` on top, then `---`, the metadata row, `INTRO` / `MEAT` / `OUTRO`
   with timings, the text hook, the first frame, `RE-CHECK BEFORE SHOOTING`, the TikTok cut,
   description, first comment, hashtags. Read the newest note in the live batch first, because
   its re-check block is where corrections pile up.
5. **Run the gate**: `npx heyramzi-slop <file> --register=shorts` has to exit 0 on the clean read.
   It checks the hook shape, the counted steps and the reply CTA too. The only hit allowed is a
   quoted specimen. Fix a rate by rewriting the sentence, never by gluing 2 together with "and".
   Then the `humanizer` read by eye, since the gate only covers half the patterns.
6. **Take the code** off `social`'s `scripts/ledger.json` plus the closed Socials tasks,
   never off memory. Then file it:
   `python3 .claude/skills/notes/scripts/notes.py create --folder "Batch N" --title "CODE · name" --body-file <file>`
   in the live batch under Shorts. An `update` takes its title from the body's first line, so keep
   the title there. Open a `to do` task on the Socials list whose description says
   `Script: Apple Notes > Shorts > Batch N > CODE`.
7. **The reasoning goes in the batch brief**:
   variants, ratings, surfaces. The spoken text never goes there. It lives in the note.

Once it's recorded, everything else (the coding, the edit, scheduling) is `social`'s `references/shorts-production.md`.

## What each reference holds

| File | Read it when |
| --- | --- |
| [hook-library.md](hook-library.md) | Picking the opening, the 2nd beat, the flip or the text hook |
| [shorts-structures.md](shorts-structures.md) | Building the body, and for the skeleton's template |
| [note-shape.md](note-shape.md) | Writing the note, before it's filed |
| [shorts-playbook.md](shorts-playbook.md) | Platform specs, the algorithm, what counts as a view |

## Checklist

- [ ] The opening names a shape from the hook library, and 3 rated variants sit in the brief
- [ ] The 3 surfaces (frame, burned text, spoken line) make one claim
- [ ] The clean read works out loud, the middle is bullets, and the ends are written word for word
- [ ] The gate exits 0 on `--register=shorts`
- [ ] The CTA's artefact exists, or the re-check block says it gets made before publishing
- [ ] The note is in Apple Notes under the live batch, and the Socials task points at it
