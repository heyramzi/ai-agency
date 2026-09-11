# Context Budget

## Contents

- What each level costs
- Cutting a description
- Cutting a body
- Splitting to references
- Frontmatter levers that remove cost
- Fluff to cut
- Anti-patterns from the standard

## What each level costs

Three loading levels, three different prices.

| Level | Loaded | Price | Budget |
| --- | --- | --- | --- |
| `name` + `description` | Every session, before anything is asked | About 100 tokens per asset | 500 chars, 1024 hard cap |
| `SKILL.md` body | When the skill fires | Under 5k tokens, and it stays in the conversation for the rest of the session | 250 lines |
| `references/`, `scripts/` | When read or run | Zero until touched. A script that runs costs only its output | None |

Two consequences drive every decision in this skill.

**Metadata is the only line item that every session pays.** A registry of 250 assets at 400 chars each spends 25k tokens before the user types a word. Cutting one description by 300 chars saves more real context than cutting 100 lines from a body that fires twice a month.

**A body does not unload.** Claude Code puts the rendered `SKILL.md` into the conversation as one message and never re-reads the file, so a 400-line body sits in context until the session ends. This is why the fix for a long body is to move material out, not to keep it and read it faster.

## Cutting a description

Target shape, two sentences: what it does in third person, then `Use when <trigger>, when <trigger>, when <trigger>.`

Claude Code truncates `description` plus `when_to_use` at 1,536 chars in the skill listing, so anything past that is dropped silently. Put the strongest trigger first.

The cuts, in the order they pay:

1. **Delete the capability inventory.** Twenty comma-separated nouns describe the body, not the trigger. Keep the triggers.
2. **Delete the mechanism.** How the skill works is the body's job. "through a hybrid SQLite-index plus AppleScript bridge" never helped anyone pick it.
3. **Delete self-description.** "Self-healing", "appends new failure modes to its own pattern list after each run" is true of most skills here and separates none of them. It belongs in the body.
4. **Collapse near-identical triggers.** "when a post needs writing, when content needs creating, when copy needs drafting" is one trigger written three times.
5. **Keep the words a user would type.** Product names, file types, verbs. These carry the match.

Before (819 chars):

> Self-healing skill that manages a Descript project's media through the API and MCP, importing raw takes and b-roll, naming them, and foldering them one folder per video, and reorganises an existing library by driving the Project panel through Orca's browser, which is the only surface that can move media between folders. Covers the write-once naming constraint, the per-call media cap, the one-job-at-a-time lock, when direct upload beats URL import, the slow drag a drop needs, and how to pair a camera take with its screen recording. Appends new failure modes to its own pattern list after each run.

After (196 chars):

> Imports, names and folders media in a Descript project, and reorganises a messy media library. Use when footage or b-roll needs to land in Descript, or when a Descript project's media browser is full of loose files.

Everything cut is still in the body, where it is read only by the session that opened the skill.

## Cutting a body

The first question for every paragraph: **does the model already know this?** The base model knows what a PDF is, what a pivot table is, how HTTP works, what git does. Text that explains a general concept before giving the instruction is pure cost. Delete the explanation, keep the instruction.

The second question: **is this a fact or a feeling?** "Buffer accepts a 600-character tweet and lets it die at send" changes behaviour. "Be careful with character limits" does not.

The third: **is the specificity earned?** Match freedom to fragility.

| The task | Write it as |
| --- | --- |
| Many valid routes, context decides | Prose direction. Trust the model to route |
| A preferred pattern with variation | A template with parameters |
| Fragile, sequence matters, hard to undo | The exact command, with a line saying not to vary it |

An over-specified creative task wastes tokens and produces worse output. An under-specified migration corrupts data.

## Splitting to references

When a body is over 250 lines, move material out rather than compressing prose. What moves:

- Tables of values, schemas, API surfaces, command inventories
- Long examples and before/after pairs
- Anything used by one branch of the work and not the others. Split by domain so a task about sales never loads the finance file
- Learned Patterns logs past 25 entries. Fold the hardened ones into the body first (`node heal.cjs fold <skill>`), then delete the lines

What stays in `SKILL.md`: the flow, the decisions, the budgets, and one line per reference saying what is in it and when to open it.

Two rules from the standard govern the result:

- **One level deep.** Every file must be reachable from `SKILL.md` in one hop. Claude previews a file found only at the end of a chain with `head` instead of reading it, so the tail arrives truncated or not at all. Two references pointing at each other are fine as long as `SKILL.md` links both.
- **A reference over 100 lines with three or more sections opens with a `## Contents` list.** A partial read then still shows the full scope. A flat file, a dated log or a glossary has nothing to index and is exempt.

## Frontmatter levers that remove cost

Field names below are Claude Code's. The Agent Skills standard carries `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools` only, so a skill meant to travel outside Claude Code has to survive on those.

| Field | What it does to context |
| --- | --- |
| `disable-model-invocation: true` | Drops the description out of the system prompt. The skill still runs as `/name`. Correct for anything with side effects that the user should time: deploys, publishes, sends |
| `user-invocable: false` | Keeps the description loaded and hides the skill from the `/` menu. For background knowledge with no meaningful command form |
| `paths: ["src/**/*.svelte"]` | Auto-loads only when the work touches matching files |
| `when_to_use` | Appended to the description and counted against the same 1,536-char cap. It buys nothing that a second sentence in the description does not |

A slash-command-only workflow that still advertises a 600-char description is paying rent on a listing nobody matches against. `disable-model-invocation: true` is the fix.

## Fluff to cut

Duplicate content

- The same instruction in two sections.
- The frontmatter description restated in the opening paragraph.
- A numbered list followed by the same items as prose.
- The same 200-word block in two skills. Extract to a shared reference.
- A command that restates the skill it invokes. See `skills/operations/kit/skill-manager/references/contract.md`.

Filler language

- Puff words. Full list: `ai-doc/skills/content/writing/humanizer/references/slop-list.md`.
- Hedges on absolute rules: *generally, typically, usually*.
- Throat-clearing: *"This skill is designed to..."*, *"The purpose of this document is..."*.
- Meta-commentary: *"as mentioned above"*, *"it's important to note"*.
- Persona padding in agents: years of experience, invented credentials, "world-class". A persona is its instructions, not its resume.

Structural waste

- A heading with a one-sentence body. Fold into the parent.
- A list of one or two items. Inline as prose.
- Decorative separators, emojis as section markers.
- Recaps: *"In summary..."*, *"Key takeaways..."*.

## Anti-patterns from the standard

| Anti-pattern | Fix |
| --- | --- |
| Several options offered for one job | Give one default. Name the escape hatch in one clause |
| Dated instructions ("before August 2025, use...") | State the current way. Put superseded ways in an `## Old patterns` section |
| Terms drifting inside one file (field, box, element) | Pick one term, use it everywhere |
| Bare MCP tool names | Fully qualify as `Server:tool_name`, or the lookup fails when several servers are connected |
| Backslash paths | Forward slashes everywhere |
| A tool assumed present | Name the install step before the usage |
| Magic constants in a bundled script | Say what the number is for, or delete it |
| A script that fails and leaves the model to work it out | Handle the error in the script |
| Vague names: `helper`, `utils`, `tools` | Name the activity |
| `name` not matching its directory, leading or trailing hyphen, double hyphen, over 64 chars, or containing "claude" or "anthropic" | Rename. The standard rejects all of these |
