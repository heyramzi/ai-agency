# Templates and Examples

## Contents

- X Tweet Formats
- Long-form article
- Style Guide Quick Reference
- Example Input/Output

## X Tweet Formats

### Value Tweet

One insight, punchy. Arrow notation for steps.

```
[Bold statement]

[How it works]:
→ Step 1
→ Step 2
→ Step 3

[Result]
```

### Promotional Tweet

Drive to content. Include [VIDEO LINK] placeholder.

```
[Problem statement]
[What the video shows]

Watch the full breakdown: [VIDEO LINK]
```

### Tool post

For anything you built and want people to use: a skill, a script, a repo, a template.
Four parts, and the order is the template.

```
[Hook: the reader's pain, in the words they would use for it]

[name]:
1. [what it does first]
2. [what it finds]
3. [what it does about it]

[The outcome for the reader, one line]

[Direct link to the thing itself]
```

Worked example, 279 characters weighted:

```
You keep installing skills. They overlap, they fill context, and Claude stops knowing which one to use.

skill-cleaner:
1. finds every skill on your machine
2. scores which ones overlap
3. flags duplicates and clears dead links

One clear skill per job.

github.com/<you>/<your-repo>/tree/main/skills/<skill>
```

Five rules, each from a rejected draft on 2026-08-05:

**The hook is the reader's pain, not the tool's most interesting fact.** The draft above
went through two wrong hooks before the right one. First the discovery story: the command
that failed, "on my machine", "so I scanned", "folders I deleted months ago". Then a
technically better one that was still about the tool, "your skills fail silently, a broken
one stops being offered", which is true and describes a problem nobody feels. What people
feel is the behaviour that got them here: they install a new skill every week, the
descriptions pile up, they overlap, and the agent picks the wrong one. Start where the
reader already is, then let the tool answer it.

**The discovery story is research, not copy.** How you found the problem reads as a report
of what you did, and the reader has to translate every line into their own situation before
it helps them. Write the finding as *their* problem from the first word.

**Numbered steps, not prose.** Three numbered lines carry what the thing does faster than a
paragraph, and they survive being skimmed. Keep each one a verb and an object, under about
50 characters, and make step 3 the one that changes something.

**The outcome line is the payment.** Steps are what it does; one line after them says what
the reader ends up with. Without it the post is a changelog. It is the last thing before the
link, so it is the sentence that has to be worth the click.

**Link to the thing, not to its container.** A repo root makes the reader hunt for the item
you just described. The deep link lands them on it. This overrides the instinct to promote
the collection: the collection is discovered from the item, never the other way around.
Verify the URL returns 200 before scheduling, because a moved directory breaks it silently.

### Counting characters for X

The cap is 280 and it is enforced at send, not at schedule time. **Any URL counts as 23
characters** however long it is, because X wraps everything in `t.co`, so the real budget is
`length(text without the URL) + 23`. A 63-character deep link costs the same as a bare
domain and there is no reason to shorten it.

Schedulers do not check this. Buffer accepted a 600-character tweet through its API with no
error and it sat in the calendar reading `scheduled`; it would have died at send and taken
the slot with it. Measure before scheduling, every time.

## Long-form article

For an X article, a LinkedIn article or a newsletter issue. This is the surface that
gets bookmarked rather than liked, and the shape is what earns the save.

The spec is counted off a reference piece that did 1.27M views and 10,769 bookmarks
against 3,944 likes. Count the same things on your own reference piece before trusting
these numbers.

```
[Opening: the reader's day in concrete nouns. 3 to 5 fragments, 3 to 6 words each]

[The belief most people hold, stated plainly]

[The reversal. Two or three words on their own line]

[The thesis: what the piece hands over, one line]

N: [Named Thing]

[The wrong default: "Most people..." or "The biggest mistake..."]
[The turn, one short sentence]

For example:

[Case 1, real objects and real numbers]
[Case 2, same syntactic frame]
[Case 3, same frame]

[Close: one sentence carrying a measured claim]

...repeated, 5 to 7 times

[Takeaway: the thing to do, addressed to the reader, declarative]
```

Counted targets, all from the reference piece:

| Target | Value |
| --- | --- |
| Sections | 5 to 7, each `N: Named Thing`, two or three words after the colon |
| Words per section | 113 to 149, and the band stays that tight all the way down |
| Blocks per section | 7 to 12 |
| Whole piece | roughly 1,000 words, 6,300 characters, 76 blocks |
| Block density | one block per 80 characters, the same white space as a long LinkedIn post |
| Sentence length | mean 8.5 words, median 8, and 42% at 6 words or shorter |
| Person | second person throughout, 48 `you` against 3 `I` |
| Close | declarative, never a question, even where questions run inside the body |

**The named unit is what gets saved.** Seven models with names is seven things a reader
can carry away and one thing they can file. A piece of the same length with no names is
read once. The author already owns two named systems and under-uses both as the unit of
a piece, which `measured.md` records as a standing gap.

**Three slots decide whether it sounds like everyone else.** The architecture above is
free to take. These are the parts where the reference piece does what our rules ban, so
fill them from our own material instead:

- **The example slot.** The reference runs hypotheticals: the founder who later becomes
  your biggest client. We have 367 recorded calls and the client installs. Use a real
  case with the real number.
- **The close slot.** The reference closes each section on a moral aphorism with an
  abstract subject. Anti-voice 14 bans that shape, measured at 0 occurrences in 56,568
  words of his own writing. Close on something measured.
- **The turn.** The reference gets its reversals from negation pivots, 11 of them in
  1,005 words. The banned-shape list rules it out in written copy. Get the turn from
  what actually happened instead of from "it is not X, it is Y".

## Style Guide Quick Reference

### Voice, hooks, closers, banned language

**Not here.** Your own voice profile is the single home for all of it: register, sentence
shapes, signature tics, hook mechanisms, closers, and the anti-voice, with counted targets
rather than adjectives. Read it before drafting and audit the draft against it before
shipping. Keep the generic banned-word list in exactly one file on top of that.

What stays below is post *shape*: the structural templates specific to this skill.

### Structure (LinkedIn)

1. Pain hook (1 sentence)
2. Client story (2-3 sentences)
3. Framework intro
4. Three numbered points
5. Takeaway (1 sentence), land the idea

(Structure is a default, not a mold. One sharp idea beats a forced framework.)

## Example Input/Output

### Input

```
YouTube video about setting up ClickUp notifications properly.
Key points: Turn off first 4 notification settings, use guests vs members wisely, disable unused ClickApps.
```

### Output

LinkedIn Post:

Your ClickUp notifications are a mess for a reason.

Every new user gets bombarded with alerts they don't need. You become a "watcher" on tasks automatically. Your inbox fills with noise.

I tell every client the same thing on day one:

1. Turn off the first four notification settings
2. Disable every ClickApp you're not using
3. Use guests (free) instead of members when possible

One client reduced their daily notification volume by 80% in five minutes. They went from drowning in alerts to actually seeing what matters.

The tool isn't slow. It's bloated with features you enabled by default.

You don't have a software problem. You have a defaults problem.

X Value Tweet:

Your ClickUp feels slow because you have too much turned on.

Go to ClickApps → disable everything → only turn on what you actually use.

Workspace instantly feels faster. (89 chars)

X Promotional Tweet:

New to ClickUp? Before you touch anything else:
→ Turn off 4 notification settings
→ Disable unused ClickApps
→ Learn guests vs members

Full setup guide: [VIDEO LINK] (187 chars)
