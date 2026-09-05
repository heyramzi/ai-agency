# The asset contract

**Every skill and every agent is written through the `skill-creator` skill.** Invoke it before writing or editing one, including a small edit to an existing body: it owns the three kinds, the description contract, `references/skill-floor.md` (the quality bar `skill-creator` and `ai-cleaner` also write against) and the review that gates the ship. Editing a `SKILL.md` by hand is how two standards end up in one registry. This file holds the placement, the naming and the reconcilers; it does not restate the floor.

Before creating any new skill, agent or reference under `ai-doc/` or `.claude/`, search for existing ones that cover the same ground. Extend what exists rather than duplicating.

## Check order

1. `ai-doc/skills/`: browse by business area (strategy, design, content, video, demand, search, sales, delivery, engineering, quality, finance, operations). Grep descriptions for the topic.
2. `ai-doc/agents/`: browse by the same twelve areas (strategy, design, content, video, demand, search, sales, delivery, engineering, quality, finance, operations). Each holds one `<area>-lead` that already lists every skill in its area, so read that lead first. Grep descriptions.
3. `ai-doc/references/`, and every skill's own `references/`: grep by topic. This is where a
   document with no owner ends up, so it is where a near-duplicate hides.
4. `.claude/skills/`, `.claude/agents/`: the flattened view used by Claude Code at runtime.

If a close match exists, extend it or note the overlap explicitly when proposing a new item.

## Creation criteria

New items must earn their place. A new skill, agent or reference is only justified when all of the following are true:

- No existing item covers the scope. Similar is not the same. If coverage is 70%+, extend.
- The topic is bounded and named. Write the one-line description first. If you cannot write a crisp description without overlap, the item is not ready.
- It fits a single responsibility. Skills wrap workflows and one-shot actions. Agents wrap personas. References wrap documents nothing loads. Do not mix.

## A skill is the third-best fix, so try the first two

Before writing a skill or a reference to stop a recurring agent mistake, work down this order
and stop at the first level that ends the problem. Each level is stronger than the one
below it, because each one removes the failure instead of describing it.

1. **Architecture.** Change the code or the data structure so the mistake cannot be
   expressed. Shared types across surfaces, one home for a value, a function that cannot
   be called wrongly. This is always worth a second and a third attempt before moving on.
2. **A lint rule, a test, or a CI gate.** The agent hits the failure and fixes it before
   it reports back, so the mistake never reaches a human. A budget with a ceiling (bundle
   size, query count, bytes on the wire) catches a whole category, not one instance.
3. **A skill or a rule.** Only now. These work best on the process around the code
   (how to expose a dev server, how to file the PR, how to drive a third-party tool) and
   worst as a list of things not to do inside the code, because the code is where levels
   1 and 2 belong.
4. **A human in the loop.** You should not get here.

Skip level 1 and the registry fills with workarounds for problems the code should have
made impossible. When a new skill is proposed to prevent a recurring mistake, say in one
line why levels 1 and 2 cannot hold it.

**Measured on this registry, 2 to 3 Sep 2026.** The corpus that bans em dashes held 2,208 of
them across 248 files, because the rule was written into 28 skills and checked in none.
`publishGate` never looked at emoji or hashtags at all, so 13 skills wrote that ban out again
as a checklist bullet to cover for a gate that reported the draft clean. 15 files pointed at
`copy.md`, deleted months earlier, and called it auto-loaded, which nothing has ever been. A
thumbnail word cap lived in a doc comment, so the skill drifted into reporting the wrong number
and told every reader to trust it over its own measured law. Every one of those is a level 3
answer to a level 2 problem. **The tell is a rule you can write a regex for.** If you can, the
regex is the fix and the paragraph is the bug.

## Importing an external skill set

Borrowing from an outside pack (TopRank, a vendored repo, a plugin) is a surgical merge,
never a blanket rewrite. Our skills are already tightened against the budgets above, and
a wholesale import regresses that work.

1. Map every external piece onto an existing skill first. Skip the duplicates.
2. Split what is left into gaps (nothing here covers it), distinctive (worth borrowing) and
   overkill (skip).
3. Prefer an additive edit to an existing `SKILL.md` section over a new skill.
4. Create a new skill only when nothing here can hold the pattern, and only after the
   creation criteria above pass.
5. Sync when you are done, per [Syncing what you changed](#syncing-what-you-changed).

A vendored skill that tracks an upstream repo is a third case: it is copied verbatim and
re-vendored, not edited. Record the refresh procedure in the skill's own `README.md`.

## A copy in a consumer's `.claude/skills/` is invisible rot

`vibekit sync` projects symlinks, and `--prune-legacy` only sweeps inside the directories a
manifest subscribes to. A pack copied in by hand therefore sits in a repo forever: nothing
updates it, nothing prunes it, and the model is offered it beside the live copy. It went
unnoticed until a skills browser listed the whole machine and `adapt` appeared nine times.

**`pnpm vibekit doctor` is the check**, run from `CLIs/`. It scans every repo beside vibe-kit
for real (non-symlink) skill directories and names three shapes:

- `plugin-shadow` — an installed plugin already provides it, and the descriptions agree.
- `cross-repo-copy` — one skill copied into 3+ repos with no vibe-kit source. It compares
  descriptions, not names, because every app has its own `ship` and they release different
  products.
- `double-projection` — the same skill in `.claude` and a second projection folder. Only the
  secondary copy is listed; `.claude` is the primary.

`--fix` deletes, and refuses to run without `--only <kind>` or `--name <list>`, because
clearing every shape at once would take packs that have no other source. Deleted files are
git-tracked, so `git checkout` brings them back.

The first run cleared 145 directories: 139 impeccable **v2.1.1** sub-skills across 9 repos,
still on disk while the installed plugin had reached 4.1.2 and merged all 19 into one skill,
plus 6 copies of impeccable 4.0.4 shadowing it.

**`.agents/` is dead.** `syncClaude` projects into `.claude` and `.opencode` only; the
directory survived in 4 repos as a frozen snapshot, one of them with 51 dangling symlinks.
Do not recreate it.

## Impeccable comes from the plugin, not from here

`design/ui/impeccable` was dropped from `ai-doc/` in vibe-kit commit `4789a6d8` in favour of
the installed plugin at `~/.claude/plugins/cache/impeccable/impeccable/<version>/`. **Do not
put it back in a project's `vibekit.json`.** Adding it on 2026-08-06 and running
`pnpm vibekit sync` re-created the vendored duplication that commit had just removed.

Its scripts also exit silently when reached through a symlink. Every version from 4.0.1
guards its entrypoint with `resolve(process.argv[1]) === fileURLToPath(import.meta.url)`;
`import.meta.url` resolves through symlinks and `argv[1]` does not, so a script reached
through a vibekit projection never matches, prints nothing and exits 0. It reads as a broken
script rather than a skipped main. Run them at their real plugin path. The guard is upstream,
so do not patch the plugin cache; an update overwrites it. `concept-seed.mjs` additionally
resolves `PRODUCT.md` from the working directory, so run it where that file lives.

**Impeccable defaults to React and Next.js, and every Studio project is SvelteKit.** Its skills
(distill, harden, arrange, clarify, polish) will create `page-client.tsx` and React shadcn/ui
components unless told otherwise, because the skill text never mentions Svelte. A subagent spawned
for impeccable work must be told, in its prompt: this is SvelteKit not React, the file is `.svelte`
using Svelte 5 runes, use shadcn-svelte, and here is the exact path to edit.

**A subagent doing impeccable work invokes the impeccable skill, it does not edit directly.** The
skills carry the design principles, the checklists and the anti-pattern detection that a raw edit
skips, so the prompt says "use the Skill tool to invoke `impeccable:<command>` before making
changes".

## There is no command kind. A one-shot action is a skill

Claude Code merged custom commands into skills. `.claude/skills/deploy/SKILL.md` and
`.claude/commands/deploy.md` both produce `/deploy` and run the same way, and where
both exist the skill wins and the command file never runs — so a command file could
only ever be a skill that was harder to find.

`ai-doc/commands/` holds no shape you should author. Eleven wrapper commands were deleted on 17 Aug 2026,
each duplicating a skill that already owned its `/command`, and five of them printed
the *skill's* name in their own usage block, so the file could never be reached by
the name it told you to type. The seven that carried real instructions became skills
in their business area on 23 Aug 2026, and the kind was removed from the manifest
schema, the sync and the library. What survives in that folder is five `agency-os` files
that `plugins/agency-os/build.sh` copies into the plugin, because a command file is the
shipping format of a distributed plugin. Nothing there is projected into a `.claude/`,
nothing new belongs there, and the routing rule carries no command row.

**A skill's command comes from its directory name**, not its frontmatter `name`. The
way to type `/refactor` is to name the directory `refactor`.

A skill also does what a command cannot: a directory for supporting files, `paths` to
scope when it auto-loads, `disable-model-invocation` for a manual-only workflow, and
`allowed-tools` to pre-approve the tools it needs.

## Commands invoke. They never restate

A command names the skill to run, the arguments it takes, and nothing else. It does
not summarise the workflow, list the quality gates, repeat a banned-word list, or
describe the output shape. Every one of those already has an owner, and a command
that copies them is a second copy that nobody updates.

**This is not a style preference, it is measured.** `/publisher:social` carried a
149-line copy of the `generate-social` workflow. By 8 Aug 2026 every drifted line
had inverted the skill it was supposed to invoke: it asked for a question CTA where
the skill bans engagement bait and cites X's ranking signals for the reason, for
800-1200 characters against a measured target of 1000-1500, and it checked five
banned words against a list of 156. `/publisher:linkedin` instructed 2-4 hashtags
against an absolute no-hashtag rule. Both ran green for months, because a command
that contradicts a skill produces confident output and no error.

So the test for a command is length. **If it is longer than its own usage table, it
is holding something that belongs somewhere else.** Skills route onward to the
skills they depend on, which is why the command does not need to: naming
`generate-social` reaches `humanizer` and `idea-mining` for free.

## Self-healing requirement

Every instruction file updates itself when a session teaches it something. The protocol (the
four-part failure log, the entry format, the delete-first loop, the SSOT rules) lives in the
`skill-creator` skill; `ai-doc/references/self-healing.md` holds what is specific to this workspace.

A new skill ships the scaffold only when it already has real failures to seed the log with. An empty
`## Learned Patterns` is worse than none.

## Quote the description, because a broken frontmatter block fails silently

A plain YAML scalar cannot contain `": "`, and a description is the one field long enough to hit
it by accident: `patterns: backward-compat`, `in Remotion: subscribe`, `with Remotion: creating`.
When the block fails to parse **nothing warns at normal verbosity and every field is dropped** —
the name falls back to the directory name, the description to the first line of the body, and
`tags:`, `model:` and `allowed-tools:` quietly stop applying. So the skill stays in the listing,
matched against arbitrary prose, and looks fine.

**Wrap every `description:` in double quotes.** It costs two characters and removes the whole class.
The same goes for any value carrying a colon, a `#`, or a leading `[`, `{`, `*` or `&`.

The `` fences are **body syntax and never go
inside the `---` block**: YAML has no comment of that shape, so a skill that varies its published
wording writes one quoted `description:` (the public wording) and keeps the fences below the
frontmatter. `boards:` cannot be fenced either, and gluing the fence to the key gives you a key
named `` blocks removed, optionally carrying a
`<!--public …-->` sentence the public copy gets instead. A whole file stays home with
`<!--internal-only-->` on its first line, or a `<name>.internal.<ext>` filename where a data file
carries no comment. Editing the copy in `ai-agency` is lost on the next publish, and the two
checkers below are what say so before a push.

| Script | What it reconciles | Fails on |
| --- | --- | --- |
| `ai-doc/scripts/check-lead-tables.py [--fix]` | Each `<area>-lead` agent's skill and specialist tables, their counts, and the master table in `agents/README.md`, against the filesystem | drift in membership **or in row text** |
| `ai-doc/scripts/check-descriptions.py [--files ...]` | Every skill and agent description against the contract above: a `Use when` trigger, the 300-char ceiling, no em dash, no banned word or phrase from `packages/lint/data/slop-words.js`, and an explicit non-Opus `model:` on an agent | a description the registry cannot route on |
| `scripts/check-prose.mjs [--all] [--fix]` | The corpus against the punctuation rule it teaches: em and en dashes, invisible characters. Staged runs judge added lines only, so a file is cleaned the next time somebody edits it | a dash or an invisible character on a line you wrote |
| `ai-doc/scripts/publish-public.mjs [--check]` | The 17 skills this registry publishes into the public `heyramzi/ai-agency` repo, written there scrubbed | a public copy that is stale, a file in the public tree with no source here, or a name, id, private path or monorepo-only command surviving the scrub |
| `clickup-utils/scripts/skills.mjs check` | The ClickUp and board skills, which `clickup-utils` owns and publishes itself, plus the symlinks that give vibe-kit one copy of each | a broken link, or the same leak list, which lives there and both publishers read |
| `skills/content/social/linkedin-content/scripts/copy-score.py --check --corpus <posts.json>` | The copy scorer against the corpus it was built from | the score no longer separating each creator's best posts from their worst |

The description contract is gated twice, at write time and at sync time:
`ai-doc/hooks/extensions/description-gate.sh` runs as a `PostToolUse` hook on `Write|Edit`
and refuses a skill or agent file whose description breaks the contract, and a copy under a
consumer's `.claude/` that shadows an asset vibe-kit already owns. It was added on 30 Aug
2026 after the contract, written in three files and checked in none, was found broken by 37
descriptions. That is the ladder above applied to the registry itself: the rule moved from
level 3, where it only held when a session read it, to level 2, where the session hits it
and fixes it before reporting back.

The row-text half of the first one was added on 26 Aug 2026 after it reported "in sync" while eight
leads restated descriptions that had changed months earlier. A reconciler that compares only names
is a reconciler that is wrong in the one way nobody checks.

The public twins are **supposed to differ**: the private copy names `humanizer`, the cost policy and
real paths, the public one is generalised for a stranger. What is not supposed to happen is a rule
learned once and written into only one of them. Read the line count gap before assuming the split is
still deliberate.

## Three kit skills, one floor

| Skill | Owns | Reach for it when |
| --- | --- | --- |
| `skill-creator` | The floor, the four kinds, the description contract, the review | Anything is about to be written or edited |
| `skill-creator` | The failure log, and the delete-first edit that lands a learning | A session taught something a file should have known |
| `ai-cleaner` | Registry budgets, merging, deleting, splitting a body | The registry is wide, deep, or picking the wrong asset |

They share `skill-floor.md`, which `skill-creator` owns. A quality bar restated in three files is three bars by the end of the quarter.

## Remediation

When redundancy is found, run the `ai-cleaner` skill against the target folder (`.claude/`, `ai-doc/`, or any plugin folder). It enforces registry budgets, merges duplicates, prunes dead weight, and tightens bodies against the fluff list (repeated content, filler, vague phrasings).
