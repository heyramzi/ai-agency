---
name: generate-social
description: "Writes LinkedIn and X posts from YouTube transcripts, ideas or client stories, holding the structural targets for length and block count and the ban on bait endings. Use when a transcript needs repurposing, when an idea, insight or client story should become posts, or on 'create posts', 'write content'. Appends new failure modes to its own pattern list after each run."
license: MIT
---

# Generate Social Content

One idea, many formats. This skill stops at the draft. It never names a scheduler,
because that stack changes and a name written here goes stale in place.

## The one idea this skill runs on

**The gap between a post that works and one that does not is usually structural, not
tonal.** A voice profile can be broadly right for months while the posts underperform,
because what is wrong is length, block count, whether the post opens on a scene, and
whether it ends on the idea. Structure is the part you can check before publishing.

So every target below is a count, and every count gets measured rather than estimated.

## Where the idea comes from, when nothing was handed to you

This skill starts from a source: a transcript, a story, a note. **When there is no source
and the ask is "write something", that is not a writing job yet.** Find a subject first.
Writing from a blank page is the lowest-yield source there is, and no amount of voice work
rescues a subject nobody wanted.

## Workflow

### Phase 1: Load the voice

Read your own voice profile before drafting, not from memory, and make sure it carries
**counted targets** and not only adjectives: median length, block count, how often a post
ends on a question, which sentence shapes never appear.

If you do not have one yet, build it from your own twenty best posts: count characters,
count blocks, count question endings, and write down the three tics that show up in all
twenty. That file is the thing this skill defers to on any conflict.

Then read [references/templates.md](references/templates.md) for the post shapes and a
worked input-to-output example.

### Phase 2: Extract the core value

From the source, identify:

1. **Pain point.** What problem does this solve?
2. **Story.** A client example or a personal experience.
3. **Framework.** The three-part shape of the solution.
4. **Insight.** The non-obvious takeaway.

### Phase 3: Generate

Always provide all three:

```markdown
## LinkedIn Post

[2000-2500 characters, 35-50 short paragraph blocks, story shape]

**Image:** <path to the photograph it ships with>
[one line saying which scene in the post the frame matches]

---

## X Value Tweet

[200-280 characters, one tactical insight]

---

## X Promotional Tweet

[200-280 characters, drives to the video with a link placeholder]
```

**A LinkedIn post opens on a scene**: people, a place, a time, and one specific odd
detail. A stack of aphorisms measured to the right length is still the wrong post.

**When the subject is something you built** (a skill, a script, a repo, a template), the X
post uses the tool-post shape in `references/templates.md` instead: hook, three numbered
steps, the outcome for the reader, then a direct link to the thing itself rather than to
the repository holding it. The build story goes in the research, never in the post.

**When the source carries five or more named things that stand on their own** (five
patterns, five failure modes, five levers), it is a long-form article, not a LinkedIn post,
and the three outputs above still ship alongside it. Use the long-form shape in that file:
5 to 7 sections of 113 to 149 words, each headed `N: Named Thing`, each closing on a
measured claim. Do not force one into existence; a source with three points is a LinkedIn
post that would be padded to reach seven.

## Quality checklist

- [ ] LinkedIn post is 2000-2500 characters, broken into 35-50 short blocks, measured
- [ ] It opens on a scene with people, a place and a time, carries one specific odd detail, and is not a stack of aphorisms
- [ ] It names its photograph, picked against the opening scene. A LinkedIn post with no image is not finished
- [ ] X posts are under 280 characters, counting any URL as 23 whatever its length. The best ones are one declarative sentence under 200 with no link in the body
- [ ] Opens on pain or story, never a generic intro
- [ ] Contains specific numbers, at least one in the first two lines
- [ ] One idea, load-bearing lines only
- [ ] Ends **on the idea**, not on a question or a booking link
- [ ] No hashtags, no emojis
- [ ] No banned words, phrases or sentence shapes, against your own list

**Why the bait ban is a rule and not a preference.** X ranks on predicted replies,
reposts and dwell, and pushes down posts people mute or mark "not interested", which is
exactly what bait earns (`github.com/xai-org/x-algorithm`). Add a closing ask only when
the post earned one specific invitation.

## Closing a run

Ask which version the author prefers, and when a post performs well later, put the lesson
in the voice profile rather than in a second file. Two addresses for one profile is how
the copies drift.

This skill appends new failure modes to its own pattern list after each run. If this run surfaced one not already listed, append it to Learned Patterns before finishing.

## Verification checklist

- [ ] The voice profile was read before drafting, not recalled
- [ ] The subject came from a real source, never from a blank page
- [ ] Character counts and block counts were measured, not estimated
- [ ] Any new failure mode was appended to Learned Patterns

## Learned Patterns

Appended when a run surfaces something this skill did not already know. Newest first.

- **A length written in a prompt is not the length being used.** A generator carried a
  2000-2500 target and produced 1200-character posts, because a second, operator-editable
  style guide said "aim 900 to 1300" and the prompt handed that block to the model as
  authoritative. When generated copy measures wrong, read the editable guide before
  touching the prompt. The same prompts carried a ceiling with no floor, so the trim pass
  cut to 1500 with nothing telling it that short is a failure.
- Thirteen posts measured inside target and every one was killed. Two faults, both
  structural: they were aphorism stacks with no scene, no person and no place, and all
  thirteen shipped with no image, because nothing in the instructions asked for either.
  A count is necessary and not sufficient.
- A command or wrapper that restates this workflow will drift from it, and every drifted
  line contradicts this file. Commands invoke skills, they never restate them. Check for
  a wrapper before trusting that a rule written here is the one being followed.
- The 280-character cap bites at send, not at scheduling. A scheduler will hold an
  over-cap post reading perfectly `scheduled` until it dies, and any URL counts as 23
  whatever its length.
- A post about something you built, written in the standard value-tweet shape, buries the
  thing itself. Take the tool-post shape instead and link the artefact directly.
