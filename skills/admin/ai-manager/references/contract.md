# The asset contract

**Every skill and agent is written through `ai-manager`**, including a small edit to an existing
body: editing a `SKILL.md` by hand is how 2 standards end up in one registry. This file covers
placement, naming and the reconcilers; the quality bar is [skill-floor.md](skill-floor.md).

## Search first

Before creating anything under `ai-doc/` or `.claude/`, check in order: `ai-doc/skills/` (by area,
grep descriptions), `ai-doc/agents/` (each with a `skills:` line; `agents/README.md` is the
table), `ai-doc/references/` and every skill's own `references/` (where an ownerless document and
a near-duplicate hide), then `.claude/` (the flattened runtime view). A new item needs all three:
no existing item covers it (70% coverage means extend), a one-line description with no overlap,
and one responsibility (skills wrap workflows, agents wrap personas, references wrap documents
nothing loads).

## A skill is the third-best fix

Work down this order and stop at the first level that ends the problem; each removes the failure
instead of describing it.

1. Architecture. Change the code or data so the mistake can't be expressed: shared types, one
   home for a value, a function that can't be called wrongly. Worth a second and third attempt.
2. A lint rule, test or CI gate. The agent hits it and fixes it before reporting back. A budget
   with a ceiling (bundle size, query count) catches a whole category.
3. A skill or rule, best on the process around the code (exposing a dev server, filing the PR,
   driving a third-party tool), worst as a list of don'ts inside the code.
4. A human in the loop. You shouldn't get here.

A new skill that prevents a recurring mistake says in one line why levels 1 and 2 can't hold it.
The tell is a rule you can write a regex for: then the regex is the fix and the paragraph is
the bug. Measured 2 to 3 Sep 2026: the corpus that bans em dashes held 2,208 of them across 248
files, written into 28 skills and checked in none; `slopGate` never looked at emoji or hashtags,
so 13 skills wrote that ban out as a checklist bullet; 15 files pointed at a `copy.md` deleted
months earlier, calling it auto-loaded; a thumbnail word cap in a doc comment drifted to the wrong
number. All 4 were level 3 answers to a level 2 problem.

## Importing an external skill set

Borrowing from an outside pack is a surgical merge, never a blanket rewrite: ours are already
tightened and a wholesale import regresses that. Map each external piece onto an existing skill
and skip duplicates, sort the rest into gaps, distinctive and overkill, prefer an additive edit to
an existing `SKILL.md` over a new skill, then sync.

A skill whose core came from someone else carries `author: "<name>"` (Matt Pocock, Emil
Kowalski, Anthropic), printed in the ai-library table's By column. No key means the author wrote it. A
borrowed reference inside our own skill gets credit in that file and leaves the key alone. A vendored skill
that tracks an upstream repo is copied verbatim and re-vendored, never edited; its `README.md`
holds the refresh procedure.

## Frontmatter

- Wrap every `description:` in double quotes. A plain scalar can't contain `": "`, and when a
  block fails to parse nothing warns: every field drops, the name falls back to the directory, the
  description to the first body line, and `tags:`, `model:` and `allowed-tools:` stop
  applying. 4 skills loaded nameless on 1 Sep 2026; `pnpm check:skills` now parses every block.
  The same goes for any value with a colon, `#`, or a leading `[`, `{`, `*` or `&`.
- The `` fences are body syntax, never
  inside the `---` block. A skill that varies its published wording writes one quoted
  `description:` (the public wording) and keeps the fences below. `boards:` can't be fenced either
  (the key becomes `<!--internal-->boards` and dies), so `publish-public.mjs` strips it by name.
- `tags: [<act>, <subject>...]`, one line, from `scripts/skill-tags.mjs` only: six acts
  (`writes`, `makes`, `drives`, `audits`, `plans`, `knows`) and 26 subjects. Exactly one act, at most
  3 subjects; a skill that reaches nothing outside itself carries none. `validate-architecture.mjs`
  gates this, so a new tag is an edit to that module.
- No `color:` key on an agent. opencode accepts only `#RRGGBB` or seven semantic names, so an
  imported `color: blue` stopped it loading (14 Sep 2026, 22 files); Claude Code picks one itself.

## Naming and placement

- Skills: `ai-doc/skills/<area>/<family>/<kebab-name>/SKILL.md`. The areas are fixed
  (`ls ai-doc/skills`); a family is a shelf of 2 to 8 related skills (`growth/search`, `apple/swift`),
  and **a skill never sits loose under its area**. The directory name is the command. **Every `.md`
  stays under 200 lines, a skill holds at most 10, and no path climbs with `../`** (a consumer's
  `SKILL.md` is a symlink, so `../` resolves against the consumer repo; write `~/Studio/...`).
  `scripts/check-skill-length.mjs` gates all three. A skill's command comes from its directory and ignores its `name:`.
- Agents: `ai-doc/agents/<category>/<kebab-name>.md`, the filename equal to `name:`
  (`design/frontend-designer.md` is `frontend-designer`), lowercase and hyphens, no colon. Eight
  per category.
- References: `ai-doc/references/<name>.md` when more than one skill needs it,
  `<skill>/references/<name>.md` when one owns it. Owner count is the decision, and the default is
  the skill, since a document read with its work can't drift from it. **Nothing loads a
  reference**: it reaches a session only because a skill, agent or `AGENTS.md` names its path, so
  write the pointer in the same change. A standard that must be in hand whenever a kind of file is
  touched is a rule, `ai-doc/rules/<name>.md` (mechanics: `ai-doc/references/registry.md`): a few
  lines naming the mistake and the skill that owns the depth.
- There is no command kind. A one-shot action is a skill: `.claude/skills/deploy/SKILL.md` and
  `.claude/commands/deploy.md` both make `/deploy`, the skill wins, and a command file could only be
  a skill that was harder to find. `ai-doc/commands/` holds only five `agency-os` files that
  `plugins/agency-os/build.sh` copies into the plugin; nothing new belongs there. A command that
  restates a skill drifts: `/publisher:social` carried a 149-line copy of a workflow, and by 8 Aug
  2026 every drifted line inverted the skill (a question CTA where it bans engagement bait, 800-1200
  characters against a measured 1000-1500, five banned words against a list of 156). **A command
  longer than its own usage table holds something that belongs elsewhere.**

## A copy in a consumer's `.claude/skills/` is invisible rot

`vibekit sync` projects symlinks and `--prune-legacy` sweeps only the folders a manifest
subscribes to, so a hand-copied pack sits forever beside the live one (`adapt` appeared nine
times). **`pnpm vibekit doctor`**, from `CLIs/`, finds real skill directories in every repo:
`plugin-shadow`, `cross-repo-copy` (3+ repos, no vibe-kit source) and `double-projection`. `--fix`
needs `--only <kind>` or `--name <list>`; deleted files are git-tracked. The first run cleared 145
directories, among them 139 impeccable **v2.1.1** sub-skills across 9 repos while the plugin was at
4.1.2. `.agents/skills/` is the cross-runtime projection (Codex, Gemini CLI, Antigravity, OpenCode);
other directories under `.agents/` are dead.

**Impeccable comes from the plugin**, `~/.claude/plugins/cache/impeccable/impeccable/<version>/`,
never a `vibekit.json` entry: `claude plugin install impeccable@impeccable --scope project` (the
`claude` wrapper passes `--setting-sources project,local`, so a user install never loads). Its
scripts exit silently through a symlink (an `import.meta.url` guard), so run them at the real
plugin path and don't patch the cache. `concept-seed.mjs` resolves `PRODUCT.md` from the working
directory. It defaults to React and Next.js, and every Studio project is SvelteKit: tell a
subagent "this is SvelteKit, `.svelte` with Svelte 5 runes, shadcn-svelte, edit this exact path",
and to invoke `impeccable:<command>` through the Skill tool before changing anything.

## Syncing what you changed

`ai-doc/` is the source; a project's `.claude/` is a projection. **Find the source with
`readlink -f .claude/skills/<name>/SKILL.md`**, never by guessing the path (skills sit inside a
family; four sessions each spent 3 to 5 calls on this).

- Inside vibe-kit: `bash ai-doc/scripts/ai-docs-sync.sh`.
- A commit touching `ai-doc/` syncs every consumer through vibe-kit's `post-commit` hook
  (`bash scripts/install-hooks.sh` installs it; log `~/.cache/vibekit-sync.log`). By hand:
  `cd ../vibe-kit/CLIs && npx tsx vibekit/cli.ts sync <project-dir>`, not `pnpm vibekit sync <dir>`,
  whose secrets wrapper drops the path (`No vibekit.json found at .../CLIs`, 2 Oct 2026). A folder
  subscription (`"marketing"`) pulls it recursively.
- The shared core in every `AGENTS.md`/`CLAUDE.md`: edit `ai-doc/references/agents-core.md`, then
  `node ai-doc/scripts/sync-agents-core.cjs`.
- Call `claude <subcommand>` as `env -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u
  CLAUDE_CODE_CHILD_SESSION claude plugin install <name>@<marketplace> --scope user`: `CLAUDECODE=1`
  forces `--print` and swallows the subcommand. A new plugin isn't visible until restart.
- `/design-sync` is for React design systems and every UI project here is Svelte (`@heyramzi/ui`
  ships `.svelte` source and `.d.ts` only). Don't re-derive this.

## The reconcilers, none optional

Run after moving, renaming or retiring anything, and before a push that touches the public repo.
Public copies are generated, never edited (`<!--internal-->` blocks removed, optionally a
`<!--public ...-->` sentence instead; `<!--internal-only-->` on line 1, or `<name>.internal.<ext>`,
keeps a file home). The private and public twins are supposed to differ; a rule learned once and
written into only one is the bug, so read a line-count gap before assuming the split is deliberate.

| Script | Reconciles | Fails on |
| --- | --- | --- |
| `scripts/validate-architecture.mjs [--files ...]` | every frontmatter block against the sync's YAML parser, each agent's `skills:` against the skills that exist and the cap of 3 preloads, every Studio `vibekit.json` id | a block the sync can't read, or an agent that preloads a missing skill or more than 3 |
| `ai-doc/scripts/check-agent-readme.py [--fix]` | the table and count in `agents/README.md` | drift in membership or row text |
| `ai-doc/scripts/check-descriptions.py [--files ...]` | descriptions: a `Use when` trigger, the 240-char ceiling, no em dash or banned word from `packages/lint/data/slop-words.js`, an explicit non-Opus `model:` on an agent | a description the registry can't route on |
| `scripts/check-slop.mjs [--all] [--fix]` | em and en dashes, invisible characters in `ai-doc` markdown. Run by hand; no hook runs it, because internal markdown may carry slop (The author, 6 Oct 2026) | a dash on a line you wrote |
| `ai-doc/scripts/publish-public.mjs [--check]` | the manifest's skills into public `heyramzi/ai-agency`, plus the `FROZEN` set | a stale copy, a public skill with no source, a name, id, private path or monorepo-only command surviving the scrub |
| `clickup-utils/scripts/skills.mjs check` | the ClickUp and board skills `clickup-utils` publishes itself, and the symlinks giving vibe-kit one copy | a broken link or the leak list |
| `skills/content/social/social/scripts/linkedin-scripts/copy-score.py --check --corpus <posts.json>` | the copy scorer against its corpus | the score no longer separating each creator's best posts from worst |

The description contract is also gated at write time: `ai-doc/hooks/extensions/description-gate.sh`
runs on `Write|Edit` and refuses a skill or agent whose description breaks it, or a consumer copy
shadowing an asset vibe-kit owns. It was added on 30 Aug 2026 after 37 descriptions had broken a
contract written in three files and checked in none. The row-text half of the readme check came
after it reported "in sync" while eight leads restated months-old descriptions: a reconciler that
compares only names is wrong in the one way nobody checks.
