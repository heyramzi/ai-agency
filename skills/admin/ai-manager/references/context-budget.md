# Context budget

## Contents

[Cost per level](#cost-per-level), [Plugins we don't own](#plugins-we-dont-own),
[MCP servers, connectors and the rest of the session](#mcp-servers-connectors-and-the-rest-of-the-session),
[Zero-use is the prune list](#zero-use-is-the-prune-list), [Cutting a description](#cutting-a-description),
[Cutting a body](#cutting-a-body), [Splitting to references](#splitting-to-references),
[Frontmatter levers](#frontmatter-levers), [Memory stores](#memory-stores)

## Cost per level

| Level | Loaded | Price | Budget |
| --- | --- | --- | --- |
| `name` + `description` | every session, before anything is asked | about 100 tokens per asset | 240 chars |
| `SKILL.md` body | when the skill fires, then stays for the session | under 5k tokens | 200 lines gated, aim 120 |
| `references/`, `scripts/` | when read or run | zero until touched; a script costs only its output | none |

Metadata is the only line item every session pays: cutting one description by 300 chars beats
cutting 100 lines from a body that fires twice a month. A body doesn't unload. Claude Code puts
the rendered `SKILL.md` in the conversation once and never re-reads it, so the fix for a long body
is to move material out.

## Plugins we don't own

A plugin's skills are metadata in every session too, and one can arrive uninstalled: an account
syncs org plugins into `~/.claude/plugins/synced/`, where `enabledPlugins` and `skillOverrides`
don't reach and an edit to `.meta.json` is rewritten at startup. `claude plugin list` shows
`<name>@synced`, `claude plugin details <name>@synced` prints the always-on cost, and `claude plugin
disable <name>@synced` is the one switch that works. Measured 18 Sep 2026: `sales@synced` carried 36
skills for about 3,286 always-on tokens with no use of any of them, more than the 19 skills
projected into sitehub (about 1,500). Check `~/.claude.json` `skillUsage` (a count per skill)
before turning anything off.

## MCP servers, connectors and the rest of the session

The registry is the smallest part of a full window. On 25 Sep 2026 `/context` read 83.6k used
before a word was typed and 223k more in deferred MCP schemas, from 10 claude.ai connectors. Make
alone is about 100 tools.

1. Measure calls, not config. `python3 scripts/mcp_usage.py 45` counts every MCP call, subagent
   and plugin skill over 45 days of transcripts and lists each configured server never called (that
   day 18 had zero; Gmail had 150, from 4 repos).
2. Interview on that evidence, a few questions per round with a recommended default: dead
   connectors, live ones scoped or replaced by a CLI, Claude in Chrome, local servers, agents,
   plugins, instruction-file overlap. Zero calls in Code can still be a daily tool on claude.ai web.
3. Pull the lever that owns the cost (all config, no click needed):

| Source | Lever |
| --- | --- |
| claude.ai connectors | `"ENABLE_CLAUDEAI_MCP_SERVERS": "false"` in `~/.claude/settings.json` `env`; a CLI covers each (`gws`, `cu`, `make`, `pnpm descript`). One session opts in with `ENABLE_CLAUDEAI_MCP_SERVERS=true claude` |
| Claude in Chrome | `claudeInChromeDefaultEnabled: false` in `~/.claude.json`, then `claude --chrome` per session |
| User and project servers | `mcpServers` in `~/.claude.json`, top level and under `projects[path]`; prune matching `disabledMcpServers` |
| Repo servers | every `.mcp.json`, nested `web/` and `vibe-kit/starters/*` too. A tracked one returns when a worktree is rebuilt, so delete it in the main checkout |
| Plugins | `~/.local/bin/claude plugin uninstall <name>@<marketplace>` (a plugin can ship a remote MCP server) |
| Agents | sync projects them into `.claude/agents/`, and the Agent tool spawns from there. Delete only a copy whose source is gone |
| Instruction files | one home per rule: the shared core for every repo, `Studio/AGENTS.md` for the workspace, nothing in `~/.claude/CLAUDE.md`. On 25 Sep the home file said "leave the other repo alone" while the core said "fix it in every repo" |

4. Reroute every caller. `grep -rnE "mcp__<server>|<Name> MCP"` over `ai-doc/` and every repo's
   `docs/`, and rewrite each hit to its CLI command: a skill calling a disabled tool fails
   silently. With no CLI (Make's module schema), name the one-session opt-in.
5. Re-run `mcp_usage.py`. The footer should read `connectors: off`, and nothing configured
   should show zero calls unless he chose to keep it.

## Zero-use is the prune list

`~/.claude.json` `skillUsage` has `usageCount` and `lastUsedAt` per skill across the machine. On
18 Sep 2026 the largest product repo projected 120 skills for about 9,500 always-on tokens (1%
of a 1M window), and 36 had never fired, about 2,800 tokens a session. Bodies cost nothing until
a skill fires. A hosted skills library (a Postgres service, an MCP `search_skills`, an LLM ranker)
would buy back under 1% and charge for it with a second source of truth outside git, a service that
must be up before a session has skills, and a search round trip per task. Rejected 18 Sep 2026: the
prune is the whole win, and it's free.

`disable-model-invocation: true` isn't free for a routed skill: it removes the description and
keeps `/name`, but a skill another skill dispatches into by name must stay model-invocable.
Unsubscribe it in that repo's `vibekit.json`, or delete it.

## Cutting a description

2 sentences: what it does in third person, then `Use when <trigger>...`. Claude Code truncates
`description` plus `when_to_use` at 1,536 chars, so the strongest trigger goes first. Cut in order:
the capability inventory (20 nouns that describe the body and miss the trigger); the mechanism
("through a hybrid SQLite-index plus AppleScript bridge"); the self-description ("self-healing,
appends failure modes" is true of most skills here and separates none); near-identical triggers
("when a post needs writing, content needs creating, copy needs drafting" is one trigger thrice).
Keep the words a user would type: product names, file types, verbs.

Before (819 chars): "Self-healing skill that manages a Descript project's media through the API and MCP, importing raw
takes and b-roll, naming them, and foldering them one folder per video, and reorganises an existing
library by driving the Project panel through Orca's browser... Covers the write-once naming
constraint, the per-call media cap, the one-job-at-a-time lock... Appends new failure modes to its
own pattern list after each run." After (196): "Imports, names and folders media in a Descript
project, and reorganises a messy media library. Use when footage or b-roll needs to land in
Descript, or when a Descript project's media browser is full of loose files."

## Cutting a body

Ask of each paragraph: does the model already know this? (what a PDF is, how HTTP works): delete
the explanation, keep the instruction. Fact or feeling? "Buffer accepts a 600-character tweet
and lets it die at send" changes behaviour; "be careful with character limits" doesn't. Is the
specificity earned? Match freedom to fragility: many valid routes get prose direction, a preferred
pattern with variation gets a template, a fragile or hard-to-undo sequence gets the exact command.
Over-specifying a creative task wastes tokens and worsens output; under-specifying a migration
corrupts data.

## Splitting to references

Move material out rather than compressing prose: tables of values, schemas and command inventories,
long examples, anything one branch uses (split by domain, so a sales task never loads finance), and
logs past 25 entries (fold the hardened ones first: `node heal.cjs fold <skill>`). `SKILL.md` keeps
the flow, decisions, budgets and one line per reference saying what it holds and when to open it.
No file is more than one hop from `SKILL.md` (a file at the end of a chain is previewed with `head`, so
its tail arrives truncated). A reference over 100 lines with 3+ sections opens with `## Contents`;
a flat file, dated log or glossary is exempt.

## Frontmatter levers

Claude Code's names; the Agent Skills standard has only `name`, `description`, `license`,
`compatibility`, `metadata` and `allowed-tools`, so a skill meant to travel survives on those.
`disable-model-invocation: true` drops the description from the prompt and keeps `/name`: right for
anything with side effects the user should time (deploys, publishes, sends), and a slash-only
workflow advertising 600 chars pays rent on a listing nobody matches. `user-invocable: false` keeps
the description and hides the `/` entry. `paths: ["src/**/*.svelte"]` auto-loads only for matching
files. `when_to_use` shares the 1,536 cap and buys nothing a second sentence doesn't.

Standard anti-patterns: one default per job (name the escape hatch in a clause); no dated
instructions (state the current way, put superseded ones under `## Old patterns`); one term per
concept; MCP tools fully qualified `Server:tool_name`; forward slashes; name the install step
before a tool is used; no magic constants in scripts; scripts handle their own errors; names
describe an activity (not `helper`, `utils`); `name` matches its directory, 64 chars at most, no
leading, trailing or double hyphen, no "claude" or "anthropic". A YAML block-scalar description can
hide a bulleted list that passes a length check and renders as raw markup in the prompt.

## Memory stores

Auto memory is off (`autoMemoryEnabled: false` in `~/.claude/settings.json`). The author, 6 Oct 2026:
"There shouldn't be memories and stale markdowns. Everything should be in the agents.md and
simple." A `~/.claude/projects/*/memory/` folder that shows up anyway gets deleted, after any
rule in it is folded into `agents-core.md` or the skill that owns it.
