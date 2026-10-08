# Shorts script

One reference for the whole job: the structure, the corpus of hooks that ran, and the note shape.
 So
the pieces specific to a whole Short live here, and this is the one to load when somebody says
"create a short". The truth rule and the voice pass are the trunk's, in `SKILL.md`, and outrank
everything here.

## The job

A script he can shoot straight off his phone and that sounds like him talking, not reading. That
means **the ends are written out and the middle is bullets.** He says the first and last lines word
for word and the middle his own way, so a fully scripted middle comes out read aloud and flat. Say
each written line out loud before filing it. If you run out of breath or it sounds like a slide,
rewrite it.

## The order of work

1. **Mine the raw transcript for an action, never the wiki note for an insight.** The nugget is
   something a viewer can do tonight with tools named out loud: a site, a command or a line to paste.
   "Install shadcn, then add one line to CLAUDE.md", never "a component library plus a rule". A
   summary note has already turned his words into categories, so the names are gone before the
   script starts. Try 3 tests: could a stranger do it from the Short alone, repeat it to a friend
   in one sentence, and want to send it to someone (`choosing-ideas.md`, the share test)?
   Weigh the topic before the first line too, with `scripts/topic-demand.mjs`:
   a weak topic gets archived, never rewritten.
   Keep the analogy he reached for live, because that's usually the angle nobody else has. Then the truth rule, which is the trunk's and outranks everything here: every
   name, command and "I did" is checked today, or the re-check block says what to do before shooting.
1b. **Pick the anchor before you write** (`SKILL.md`, the trunk). `node scripts/top-band.mjs <niche words> --n 8`
   prints the best-ranked competitor Shorts on the subject. Choose one and write beside it, beat
   for beat. Copy its moves, never its words: they name the tool in its own sentence, count out
   loud and show each step working.
2. **Pick an opening shape by number** from [hook-library.md](hook-library.md),
   the 30 shapes reverse-engineered from 475 banded openings plus our own posts. Then write 3
   variants on different mechanisms and rate each one for drop-off, per [video-hooks.md](video-hooks.md).
   Write the 2nd beat too: the doubt the viewer already has, said out loud. Then run the 7 moves
   in the library's Part 0, the fixes he made live on 5 Oct 2026 when the written hooks didn't hold.
3. **Build the body on the anchor's structure**, using [shorts-structures.md](shorts-structures.md):
   outcome hook, named method (only a name you'd say anyway, like "money first": "I call my fix
   the one library rule" is a label made up for a checker), 2 or 3 steps each carrying an example, a flip at about 25 seconds
   that still leaves a fact standing when you delete it, then a reply-trigger CTA whose artefact
   exists before the post goes out. When the beats depend on each other, use its optional
   promise-and-payoff variant and review every opened question against its answer in the brief.
4. **Shape the note** per the note shape in [shorts-structures.md](shorts-structures.md): title
   `CODE · name`, `CLEAN READ` on top, then `---`, the metadata row, `INTRO` / `MEAT` / `OUTRO`
   with timings, the text hook, the first frame, `RE-CHECK BEFORE SHOOTING`, the TikTok cut,
   description, first comment and hashtags. Read the newest note in the live batch first, because
   its re-check block is where corrections pile up.
5. **Run the gate.** `npx heyramzi-slop <file> --register=shorts` on the clean read, then the
   `humanizer` read by eye. Fix a rate by rewriting the sentence, never by gluing 2 together with
   "and". 2 hits stay when you'd defend them out loud, because the top band runs on both: a
   "here's how" opener and a 2-beat slogan ("one library, one rule"). Count steps the way the
   top band does, "step 1, step 2, step 3" out loud. Then CutKit's `check_script`: nothing is
   filed under a B (B- fails). The author, 6 Oct 2026, on a batch that sat at F: "don't stop until
   they all have at least B or A." The grade is the floor, not the test. It doesn't track
   breakout (rank correlation -0.06 on 20 competitor Shorts) and gave S12 a B- when the author called it unreadable, so
   the truth rule still outranks it and the last test is yours: read it out loud to someone
   who's never heard of the subject. A batch fanned out to subagents goes to `video-producer`, never general-purpose.
6. **Take the code** off `social`'s `scripts/ledger.json` plus the closed Socials tasks,
   never off memory. Then file it in CutKit, never Apple Notes. The script library is CutKit,
   so it's on his phone's teleprompter:
   `node ~/Studio/cutkit/ios/cli/cutkit-scripts.mjs push <clean-read-file> --title "CODE · name" --label "<pillar>"`
   The body is the clean read only, because the phone reads the whole body out loud. Everything
   below the `---` in the note shape (metadata row, re-check block, TikTok cut, description, first
   comment, hashtags) goes in the Socials task description instead. The pillar label comes from
   the code's letter: `S` Skills, `C` ClickUp, `A` AI and agents, `L` Lifestyle, `P` Product, `M`
   Mindset. A push with a title that exists updates that script, never adds a copy. Open a `to do`
   task on the Socials list whose description says `Script: CutKit > CODE`.
6b. **Build what's on screen before the take.** The author, 4 Oct 2026: whoever writes the Short
   also makes the visuals, the dashboards and screens he shows as b-roll, inserts or a screen share.
   A re-check line that says "have a dashboard on screen" hands him the build. So give every line that
   shows something one of 3 sources. A real screen is a product he owns or a demo workspace, never a
   redraw and never a client's data, with its UI in the language the Short is spoken in. A drawn
   clip is an idea with no screen, like a keep or drop list. The third is his face. Write that shot list into the Socials task under `ON SCREEN`, each row
   with its line, its source URL and what it adds. Then spawn one `motion-designer` with the list:
   it captures the real plates and renders the inserts at 1080x1920. A screen he records himself gets
   its page set up, signed in and on demo data, with the URL in the task.
7. **The reasoning goes in the batch brief**:
   variants, ratings and surfaces. The spoken text never goes there. It lives in the CutKit script.

After the take, the coding, the edit and the scheduling are `social`'s `references/shorts-production.md`.

## The 2 references

| File | Read it when |
| --- | --- |
| [hook-library.md](hook-library.md) | Picking the opening, the 2nd beat, the flip or the text hook, or diagnosing a hook that fails |
| [shorts-structures.md](shorts-structures.md) | Building the body, the skeleton's template, the note shape, platform specs and the algorithm |

## Checklist

- [ ] The opening names a shape from the hook library, and 3 rated variants sit in the brief
- [ ] The 3 surfaces (frame, burned text and spoken line) make one claim
- [ ] The clean read works out loud, the middle is bullets, and the ends are written word for word
- [ ] The anchor Short is named in the brief, with its breakout and URL
- [ ] The cold read named the action with its tools, and its hardest sentence got rewritten
- [ ] The gate ran on `--register=shorts`, and every hit left in is one you'd defend out loud
- [ ] The CTA's artefact exists, or the re-check block says it gets made before publishing
- [ ] Every line that shows something has its real screen, drawn clip or face in the task's `ON SCREEN` list, and the inserts are rendered or briefed to `motion-designer`
- [ ] The clean read is in CutKit under its pillar label, the rest is on the Socials task, and the task says `Script: CutKit > CODE`
