# Cleaning a registry

For a cluttered folder, a runtime picking the wrong asset, a `.md` past 200 lines, a log past 25
entries, a fresh import or a quarter with no pass.

The unit of waste is context, not files: 250 assets at 400 chars spend about 25k tokens before
the user asks anything. Size picks where to look; it never decides what goes. A line is cut
because it matches a pattern in [consistency.md](consistency.md) (written for an older model,
against its gate, a copy of a fact with a home), and the cut follows the
[audit contract](~/Studio/vibe-kit/ai-doc/references/audit-contract.md). Cutting by length deletes
the reasons first, since they're the longest sentences. A registry also grows deeper, which an asset count hides (an unpruned
failure log, a copied paragraph). One registry held 689 KB of logs against 1.4 MB of bodies.

For a full window, measure the session first (MCP servers, connectors, plugins, duplicated
instruction files): [context-budget.md](context-budget.md#mcp-servers-connectors-and-the-rest-of-the-session).

## Targets

`.claude/` is the flat runtime projection, `ai-doc/` the packaged source (skills + agents),
`<plugin>/` has `.claude-plugin/plugin.json`, and `~/.claude/projects/*/memory/` is an auto-memory
store, which is off and gets deleted ([context-budget.md](context-budget.md#memory-stores)). `skills/<area>/<family>/<name>/SKILL.md`
is the kit's layout; anything shallower is a stray to file into a family. Follow every symlink with
`readlink -f` (`find -type f` hides them, `diff` and `wc` follow them).


## Budgets

Over budget makes the matching pass mandatory. A corpus a skill reads from (a transcript set) keeps
its size and trips the warning; say so in the pointer.

| Scope | Budget | Over budget |
| --- | --- | --- |
| `description` per asset | 240 chars (gated) | cut to what plus when |
| Registry metadata | about 100 tokens per asset | descriptions pass, widest first |
| Any `.md` in a skill, or an agent body | 200 lines (gated) | cut what the model knows, split by reader |
| `.md` files per skill | 25 (gated) | merge or delete; one file per topic beats one big read |
| Agents per category / total | 8 / 60 | merge or delete; agent triage |
| Skills per package | 12 | merge, or sub-package (distinct tools stay apart: Make, n8n and ClickUp) |
| Learned Patterns log | 0 in the body, 25 in `references/` | simplification, class 1 |
| A block repeated across siblings | 3 copies | simplification, class 2 |
| CLAUDE.md / any memory file | ~500 lines / 1 file | extract to skills; fold the memory's rule into its owner, then delete it |

## The flow

1. Measure the machine, then the folder. `pnpm --silent vibekit doctor` (from `CLIs/`) finds
   copies, orphans whose source was deleted, and dead worktrees, which a folder pass can't see.
   `python3 scripts/context_cost.py <folder>` prints counts, always-loaded metadata,
   the widest descriptions, the longest bodies and every violation. Work from that list.
2. Fix hard violations (missing frontmatter, duplicate names, broken links, illegal names),
   then `python3 scripts/dead_pointers.py <folder>`: a deleted asset leaves every prose route to it
   silent.
3. Descriptions pass, widest first, the one edit that pays in every session
   ([context-budget.md](context-budget.md#cutting-a-description)).
4. Triage agents and **merge overlapping skills** ([critique.md](critique.md#doing-the-merge)).
   Group by topic across all packages; overlap under 40% is complementary, 40 to 70% adjacent
   (merge unless a written reason survives), over 70% redundant, but read both bodies first. The
   tell is an identical opening paragraph or siblings that each say which other to use.
5. Simplification pass on every skill the measurement named, merged or not.
6. Bodies pass. For a file still over 200 lines, delete what the model knows, then move whole
   sections with `python3 scripts/split_section.py <SKILL.md> --sections "<heading>" --into
   references/<name>.md --title "<H1>" --pointer "<one line>"`. Judge it in bytes: a split or
   joined lines pass the gate and cut nothing. A worker once passed by joining wrapped lines
   (25 Sep 2026), so brief every trim with "re-wrap at 100 columns first, then cut or move".
7. Relocate docs that should be rules, hooks outside `settings.json`, agent files whose name
   drifted from `name:`.
8. Propose one plan as a table (file, action, chars or lines saved, reason) and group it
   so each group can be approved. Then execute with `git mv` and `git rm`.

## Simplification pass

This asks what's inside the skills that should exist; it gets skipped because a bloated skill
looks fine. Read [skill-floor.md](skill-floor.md) and run `review_skill.py` first. 5 classes, in payback order:

1. A failure log that became a second body. Never in `SKILL.md`: move with `split_section.py`.
   Past 25 entries compress each to its rule: `python3 scripts/compress_log.py <skill-dir> --dry`
   (drop `--dry` to apply), after committing, since git keeps the run.
2. A block copied into siblings. Consolidate into a file every reader already loads: 27
   transition references restated the same two notes (12 KB) that `SKILL.md` already said, so
   deleting all 54 copies cost nothing. Agents differ: an agent has no parent to hop to.
3. A hand-maintained table restating the disk (a skill list in an agent body). It drifts
   silently (one sat 5 entries behind). Generate it or delete it; never patch a row.
4. Prose the model knows (pack filler like "Common Mistakes").
5. An entry saying the rule now lives above, or a memory pointing at the skill that owns its fact. Delete it.

The test for all 5: would a session behave differently without this line? If not, it's sediment.

## Agent triage

Measure first: `grep -ho '"subagent_type": *"[^"]*"' ~/.claude/projects/*/*.jsonl | sort | uniq -c
| sort -rn` (name mentions are worthless: the listing sits in every system prompt). Zero spawns
isn't dormancy: transcripts reach back 2 weeks, and a skill only one agent names loses its owner
on the company page when that agent goes (5 Oct 2026). List those skills first. Then:

1. Distinct persona? Near-identical prompts merge under the broader name, keeping the union.
2. Cross-category duplicate? Same `name:` or description in two categories: keep one. Compare
   basenames. Platform-sharded agents are one strategist with per-platform sections.
3. Persona or a skill? A procedure body is a skill in a costume: fold in and delete. A skill
   whose body is persona text duplicates the agent, which owns it.
5. Dormant? `git log --follow` shows created once, never touched: prune on confirmation. A
   pack's agents for stacks and markets we never touch are dormant by default; grep the workspace
   for the tools they name first, and port real content into a skill before deleting (2 items from 7 paid-media agents weren't in a skill).

## Traps that cost time

- Deleting a directory breaks more than the directory: every `vibekit.json` entry (sync reports
  "not found" and it isn't a failure; rewrite manifests and re-sync), sibling descriptions routing by name,
  agents listing it, project Makefiles using `.claude/skills/<name>/scripts/`. Grep the whole
  machine for the old name, and sweep routes into anything deleted (`project-manager` listed 12
  skills, 4 gone). Deleting a command that duplicates a skill name: repoint 12 manifests first.
- A merge isn't done at the delete. Consumer manifests, `commands:` entries and orphans all
  need the rewrite. A product boundary can forbid a fold: `clickup-utils/scripts/skills.mjs` splits
  the free kit (`PUBLIC_SKILLS`) from the paid pack, so `batch-workload` can't fold into `clickup`.
- Match duplicates on description content, never name (`audit` and `ship` share names across
  packs); similarity scoring misses real ones. An identical opening paragraph is the tell, and a
  shared boilerplate sentence alone can score 0.45 to 0.68 (11 Agency OS skills): dedup the block,
  don't merge the members.
- A directory with a `SKILL.md` is never a repo. A vendored pack's `AGENTS.md`/`CLAUDE.md` got
  stamped with house rules forever (`color-expert`, 134 lines). A pack can be imported twice
  (Remotion: 12 registry slots, 2.8 MB, all 12 router links dead). A vendored tree can hide a third
  copy through a relative link, so resolve every link before deleting a duplicate.
- A skill restating another's rule drifts: `svelte-cleanup` swapped an order and `svelte-optimize`
  taught a rune that doesn't exist (`$derived.lazy`). Delete the copy, point at the source.
- A verifier that checks warnings and not names passes dead ids: 10 manifests named deleted
  skills; `verifySubscriptions()` resolves what a manifest names. A plugin-duplicated skill isn't an
  automatic delete: a project-scoped plugin leaves other consumers on the `ai-doc` copy.
- A one-line alias skill (`grill-me` calling `grilling`) costs a full slot; 16 manifests had
  subscribed to both. Fold its triggers into the real skill.
- Cross-repo copies drift in one direction: diff whole directories, not `SKILL.md`. Subscription
  count is no dormancy signal (folders are subscribed whole); use `git log --follow` and
  `skillUsage`.
- Ask what a directory is for. One `prebuild` step was publishing 64 operational runbooks,
  including a VPS origin IP and WAF rules, as public tarballs.
- Regenerable goes, recorded stays. Caches, logs, telemetry and build output go; transcripts,
  `history.jsonl` and `todos` never. A dirty tree isn't a backup: copy files to the scratchpad
  before a rewriting script touches them (`git checkout HEAD --` restored 8 logs but lost 47
  unsaved entries). Patch out uncommitted work before deleting a sandbox (`git add -A && git diff
  --cached --binary` to `~/.claude/workspace-archive/<date>/`).
- Check who reads build output before clearing it: `.svelte-kit` under a running dev server
  leaves a stale manifest. A projection directory that's no longer a sync target doesn't empty
  itself (`.agents/` stayed in 4 repos, one with 51 dangling symlinks). Sweep orphan worktrees,
  sandboxes, CI checkouts and plugin caches.
- Stage a consumer sync by path, never `git add .claude` whole: it swept 4 agent worktrees in
  as embedded repos (16 Sep 2026). Another session's commit sweeps your staged rename into its own,
  so stage and commit in one call (11 Sep).
- Shell traps: zsh doesn't word-split `$files` (`File name too long`; pipe to `xargs -0`), and
  the shell `grep` is ugrep where `-Z` means fuzzy, so use `/usr/bin/grep` for GNU-flag pipelines.
- Banned-word checks over bodies false-positive on domain terms (MECE's "collectively
  exhaustive", LayerChart's "continuous", `landscape`), and a dash-fixing `\s+` regex spans newlines
  and joins lines: anchor it inside one line.
- Scripts that walk the tree: walk down until a directory owns a `SKILL.md` (`check ai-doc/skills`
  once printed "No SKILL.md found" over 191 skills); a skip list built for writing isn't safe for
  cleaning (`__pycache__` dangling links survived); a reference inside `references/` links `x.md`
  not `references/x.md` (`split_section.py` made 29 dead links); a log that reads empty may use a
  second date format (`- 26 Aug 2026`, `## 2026-08-26`); resolve links from every `.md`, not just
  `SKILL.md`, since orphans hide real content.

## Verification

- [ ] `context_cost.py` shows no hard violations, and every agent filename equals its `name:`
- [ ] `dead_pointers.py` reports none
- [ ] Metadata reported before and after, and it went down; every count at budget or an approved exception
- [ ] No `SKILL.md` carries log entries, no log is past 25, no `learned-patterns-archive.md` survives, and every compressed log was committed first
- [ ] `duplicated blocks` went down, or each survivor has a reader with no parent to hop to
- [ ] No banned words (`packages/lint/data/slop-words.js`); `review_skill.py` has no new findings
- [ ] Consumers re-synced (`pnpm vibekit sync <dir>`), no broken symlinks
