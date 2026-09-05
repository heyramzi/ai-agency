# Triggering

Read this when writing a description, when a skill keeps getting picked for the wrong prompt, or
when one that should have fired stayed quiet.

The description is the only part of a skill preloaded into every session. It is the whole
selection mechanism and it is read against every other description in the registry at once, so it
is written against its siblings rather than in isolation.

## What the runtime actually does

A skill appears in the session with its name and description. The model consults it when the task
looks like work it would do worse alone. Two consequences drive everything below.

**Undertriggering is the common failure, not overtriggering.** A description that reads as a
neutral summary loses to the model's own confidence. Lean on the trigger half: name the contexts,
name the phrasings, and say plainly that the skill covers them.

**A one-step task will not trigger a skill however good the description is.** "Read this PDF" is
handled directly. This makes simple prompts worthless as tests, and it means a skill whose whole
job is one tool call has a shape problem the description cannot fix.

## The description contract

Two halves, both required, in the third person.

1. **What it does**, concretely enough to separate it from its siblings.
2. **When to reach for it**, in the words a user types. Include the casual phrasing, the tool or
   file names, and the moment in a workflow, rather than the formal name of the task alone.

A third part earns its place only sometimes: **what it is not for**, when a sibling is close enough
that a prompt could land on either. `impeccable` ends with "Not for backend-only or non-UI tasks",
and that clause does more separating work than another sentence of scope.

**Ceiling is 300 characters, and `check-descriptions.py` refuses the commit above it.** It was a
500-character budget behind a 1024 cap nothing could reach, so 135 of 186 assets sat over budget
and the registry spent 67,000 characters, about 17k tokens, before the user asked anything. The
rewrite order below takes almost every description under 300 without losing a trigger word.

Rewrite in this order when it is over: cut the mechanism (how it works belongs in the body), cut
the inventory (a list of what is inside), cut the self-description ("this skill provides"). Keep
what plus when.

## Trigger evals

Worth running when a skill sits next to close siblings, when it fires on the wrong prompts, or
before a skill ships to other people. Skip it for a skill nothing competes with.

**Write 20 queries, half of each kind, and make them realistic.** The queries must look like
something typed into a terminal at speed: file paths, real column names, a company name, some
backstory, lowercase, abbreviations, the occasional typo.

Bad: `"Format this data"`. It tests nothing.

Good: `"ok so the board wants the Q4 numbers as a deck by thursday, i've got the figures in
finance/2026/q4-summary.md and last quarter's deck is in proposals/acme/ somewhere"`.

- **8 to 10 should-trigger.** Different phrasings of the same intent, formal and casual. Include
  cases where the user never names the skill or the file type but clearly needs it. Include an
  uncommon use, and one where this skill competes with a sibling and should win.
- **8 to 10 should-not-trigger.** The valuable ones are near-misses: they share keywords with the
  skill and need something else. An obviously unrelated query proves nothing.

Store them as `evals/trigger.json`:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

**Run each query three times**, because a single run is noise. Score the description on the
should-not-trigger half first: a description that fires on everything is worse than one that fires
on nothing, since it displaces the correct skill in every neighbouring session.

**Split the set before optimising.** Tune the description against roughly 60% of the queries and
judge it on the held-out remainder, or the description will be rewritten to match the examples
instead of the intent.

## When a description will not separate

Two skills whose descriptions keep matching the same prompts are usually one skill with two
branches. Merging is the fix, and it belongs to `ai-cleaner`. Rewriting both descriptions to be
more specific about the same territory produces two narrower descriptions that still overlap.
