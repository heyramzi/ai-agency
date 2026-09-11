# Cleaning a registry

Load this for the clean path: a folder of Claude extensions that feels cluttered, a runtime
picking the wrong asset, a body past 250 lines, a log past 25 entries, an import that just
landed, or a quarter with no pass. Writing and repairing do not need it.

**The unit of waste is context, not files.** 250 assets at 400 characters of description each
spend about 25k tokens in every session before the user asks anything. That number is the
target, and every run ends with the registry smaller or equal.

**A registry grows in two directions and only one shows in an asset count.** It gets wider,
which merging and deleting fix. It also gets deeper: every skill accumulates a failure log
nothing prunes, a paragraph copied into its siblings, a table restating the filesystem, and
prose the base model already knows. Nothing is added and the read cost doubles. One registry
here held 689 KB of failure logs against 1.4 MB of bodies, and its largest skill was 59% log.
Both passes run every time; the second is [Simplification](#simplification-pass).

## Contents

- [Target folders](#target-folders)
- [Budgets](#budgets)
- [Execution flow](#execution-flow)
- [Simplification pass](#simplification-pass)
- [Memory stores](#memory-stores)
- [Skill merging](#skill-merging)
- [Agent triage](#agent-triage)
- [Common issues](#common-issues)
- [Verification](#verification)

## Target folders

| Folder      | Layout                     | Notes                                     |
| ----------- | -------------------------- | ----------------------------------------- |
| `.claude/`  | Flat                       | Runtime registry, projection of source    |
| `ai-doc/`   | Packaged (skills + agents) | Source of truth, projects into `.claude/` |
| `<plugin>/` | Plugin layout              | Has `.claude-plugin/plugin.json`          |
| `~/.claude/projects/*/memory/` | Flat `*.md` + `MEMORY.md` | Auto-memory store. See [Memory stores](#memory-stores) |

Auto-detect: `skills/<area>/<family>/<name>/SKILL.md` is the kit's own layout; anything
shallower is a stray to file into a family. Follow every symlink to its source and edit there.
A projection is a copy and the next sync overwrites it.

Names are lowercase kebab-case and match the parent directory. In `ai-doc/`, an agent's
filename equals its frontmatter `name:` (`video/video-editor.md` is `video-editor`), so the
two cannot drift; the runtime registers via `name:`.

**Verify sync before trusting anything below.** Read-only, per consumer:


## Budgets

Over budget makes the matching pass mandatory, not optional.

| Scope | Budget | Over budget action |
| --- | --- | --- |
| `description` per asset | 500 chars (1024 hard cap) | Cut to what plus when. See [context-budget.md](context-budget.md) |
| Registry metadata total | About 100 tokens per asset, so 400 chars average | Descriptions pass, widest first |
| Any `SKILL.md` or agent body | 250 lines | Split to `references/`, do not compress prose |
| References a body points at | About a dozen | Past that the body routes to nothing and the reader opens none. Merge or delete |
| Reference file | None on length, `## Contents` past 100 lines when it has 3+ sections | Add the contents list |
| Reference depth | 1 level from `SKILL.md` | Link the grandchild from `SKILL.md` too |
| Agents per category folder | 8 | Merge or delete down to budget |
| Agents total (`ai-doc/`) | 60 | Run the agent triage below |
| Skills per package | 12 | Merge near-duplicates, or sub-package |
| Learned Patterns log, in a body | 0 entries | It belongs in `references/learned-patterns.md`. Move it with `split_section.py` |
| Learned Patterns log, in `references/` | 25 entries | Compress each entry to its rule with `compress_log.py`; git holds the run |
| A block repeated across sibling files | 3 copies | Consolidate only into a file every reader already loads. See [Simplification](#simplification-pass) |
| CLAUDE.md | ~500 lines | Extract reference material to skills |
| `MEMORY.md` index | 60 lines | Group related memories onto one line, archive the dead |
| Any one memory file | 250 words | Cut to the fact, the why, the how to apply |

**A corpus is not a reference.** A file of measured evidence a skill reads from, such as a
transcript set or a scored sample, trips the reference-size warning and keeps its size: it is
data the body cites, not a router the reader follows. Say so in the pointer and move on.

## Execution flow

1. Receive the target folder, detect the layout.
2. **Measure.** `python3 scripts/context_cost.py <folder>` prints asset counts, total
   always-loaded metadata, the widest descriptions, the longest bodies, and every hard and
   soft violation. Every later step works from this list, not from reading files by eye.
3. Fix the hard violations: missing frontmatter, duplicate registered names, broken links,
   illegal names. Then `python3 scripts/dead_pointers.py <folder>`, which resolves the
   pointers prose makes by name ("belongs to `x`", "invoke `x`"). Nothing else checks those,
   so a deleted asset leaves every route to it intact and silent, and a session follows one
   into nothing.
4. **Descriptions pass, widest first.** The only edit that pays back in every session. Recipe
   in [context-budget.md](context-budget.md).
5. Triage agents per the rules below, and merge overlapping skills per
   [Skill merging](#skill-merging). Commands are triaged the same way as skills.
6. **Simplification pass**, on every skill the measurement named, whether or not anything
   merged. This is the half that keeps a registry from growing while the asset count holds
   still.
7. **Bodies pass.** For each body still over 250 lines, delete anything the base model already
   knows, then move whole sections out with
   `python3 scripts/split_section.py <SKILL.md> --sections "<heading>" --into references/<name>.md --title "<H1>" --pointer "<one line>"`.
   It lifts the sections verbatim, writes the Contents list, and leaves the pointer where they
   sat. Never re-derive line offsets by hand.
8. Relocate: docs that should be rules, hooks outside `settings.json`, agent files whose name
   has drifted from their `name:`.
9. Propose one plan as a table (file, action: keep / merge-into / convert / delete / trim,
   chars or lines saved, reason). Group merges so the user can approve per group or all at once.
10. Execute after the user confirms. Use `git mv` and `git rm` so history survives.
11. Re-run the script, verify against the checklist, and report the metadata figure before and
    after.

## Simplification pass

Merging asks whether a skill should exist. This asks what is inside the ones that should, and
it is the pass that gets skipped, because nothing about a bloated skill looks broken: the
frontmatter parses, the links resolve, and the asset count has not moved.

**The standard being restored is [skill-floor.md](skill-floor.md).** Read it before rewriting
any body, and run `review_skill.py` over the target tree: it flags the mechanical half so this
pass spends its attention on what a script cannot see. Rewriting a skill against a standard
invented for the occasion is how two bars end up in one registry.

Five classes, in the order they pay back. Every one is measured by `context_cost.py`, so work
from its output rather than by reading files by eye.

**1. A failure log that has become a second body.** A log is the only part of a registry with
no ceiling: every run may append and nothing ever takes anything out. Two rules. It never
lives in a `SKILL.md`, because a body is read in full on every invocation and a log is read on
almost none: move it with `split_section.py` and leave the pointer. And past 25 entries every
entry comes down to its rule:

```bash
python3 scripts/compress_log.py <skill-dir> --dry   # then drop --dry
```

The rule is one line: what the run taught, without the run. **The run goes, and git keeps it**,
one `git log -p` away on the same file, so commit before running this. A second markdown file
holding the evidence beside the rules is a body nobody opens: fifteen of them reached 5,296
lines and 67 rules had never been folded out into any log at all.

**2. A block copied into its siblings.** Consolidate only into a file every reader already
loads. Twenty-seven transition references each restated the same install note and the same
accessibility warning, 12 KB of it, while `SKILL.md` said both and is read first: deleting all
54 copies cost the reader nothing. The same shape in twelve `<area>-lead` agents is **not** the
same finding, because an agent is spawned alone and has no parent to hop to. Ask who reads the
file you would move it into, not how many copies there are.

**3. A hand-maintained table restating what is on disk.** A skill list inside a lead agent, a
Contents list above a log, a count in a README. It is a second registry nothing reconciles, so
it goes stale silently: one Contents list had drifted five entries behind the log below it.
Generate it or delete it, never repair it by hand.

**4. Prose the base model already knows.** An imported pack ships "Initial Assessment", "Best
Practices", "Common Mistakes" and a Success Metrics table it invented. Delete what a competent
model does when asked directly. What survives is what this workspace decided: a number, a path,
a name, a preference, a thing that went wrong once.

**5. An entry that says the rule now lives above.** A log line ending "this is now the section
above" is a second copy of the body competing with it at read time. That sentence is the signal
to delete the line, not to keep it as a signpost. Same for a memory pointing at the skill that
owns its fact.

The test that covers all five: **would a session that read the file behave differently without
this?** If not, it is not documentation, it is sediment.

## Memory stores

An auto-memory store is a registry nothing prunes: sessions write to it and never read back
what they wrote, so it fills with resolved incidents, facts that stopped being true, and copies
of what a skill already says. Only `MEMORY.md` is loaded every session, so the index is what
you cut and the bodies are what you correct.

1. **Measure.** `python3 scripts/memory_cost.py` profiles every store; pass a repo slug for the
   per-file table. It prints index cost per session and four buckets: `archive` (the
   description says RESOLVED, FIXED or DONE), `fold` (the body redirects to a skill), `trim`
   (over 250 words) and `orphan` (no `MEMORY.md` line, so never recalled). Add `--usage` to
   that slug and it walks the session transcripts next to the store and prints how many
   sessions wrote a memory against how many ever opened one, plus every file no session has
   opened. Start there: a file nothing has read is not a fact the store is holding for you, it
   is index rent. Triage the never-opened list first.
2. **Triage each flagged file** through the seven questions in
   [memory-triage.md](memory-triage.md), which decide between keep, fold, promote, merge and
   archive. Fold and promote both end in deletion, because a memory is a holding pen for a fact
   with no home; once it has one, the memory is the second copy.
3. **Move the content before removing the file.** Anything the memory holds that its owning
   skill, rule or CLAUDE.md does not gets written there first. That edit is the whole value of
   the pass; deleting alone loses the fact.
4. **Repair `[[links]]` last**, after archiving, or you repoint into files you are about to
   remove. One naming convention across the store, and never a `.md` suffix inside a link.
5. **Rebuild the index** so every surviving file has exactly one line and no line points at a
   missing file.

Archiving, never deleting: [memory-triage.md](memory-triage.md).

## Skill merging

Two skills that read alike are one skill written twice. **One tree with two branches beats two
trees that look almost like each other, when the trunk is the same:** the merged skill carries
one description, one body of shared judgment, and a named branch per input it takes, instead of
the same prose twice, drifting apart from the day it was written. Merging is the default
outcome for an overlapping pair, not the last resort.

Group candidates by topic across **all** packages before triaging, because topic trios
accumulate across category folders and are invisible folder by folder. Description overlap
under 40% is complementary, 40 to 70% is adjacent (merge unless a written reason survives),
over 70% is redundant. Read both bodies before merging on the number alone: two skills can read
70% identical and take different inputs, which is a disambiguation job rather than a merge, and
leaving two vague descriptions in place is not a third option.

Full method, including the shape of a merged skill and everything a deleted directory breaks:
[skill-merging.md](skill-merging.md).

## Agent triage

Agents are the most over-accumulated asset type. **Measure before scoring**, because the
registry's own usage is on disk:

```bash
grep -ho '"subagent_type": *"[^"]*"' ~/.claude/projects/*/*.jsonl | sort | uniq -c | sort -rn
```

That counts what was actually spawned. Counting name mentions instead is worthless: the agent
listing sits in every session's system prompt, so every agent scores in the hundreds.

Then score each one:

1. **Distinct persona?** If two agents would write near-identical system prompts (same domain,
   same deliverables), merge into one under the broader name. The merged body keeps the union
   of concrete, non-overlapping instructions and drops the rest.
2. **Cross-category duplicate?** Same registered `name:` or near-identical description in two
   categories: keep the canonical copy, delete the other. Compare basenames across categories,
   not only registered names. Platform-sharded agents (one per social network) are one
   strategist with per-platform sections: collapse the shards.
3. **Persona or just a skill?** An agent whose body is a procedure (steps, checklists, no
   judgment or voice) is a skill wearing a costume. Convert to a skill or fold into one, delete
   the agent. The reverse also happens: a skill whose body is persona text ("Expert X
   specializing in...") duplicates the same-named agent, and there the agent owns the persona
   and the skill is deleted.
4. **Generic-model shadow?** An agent that adds nothing beyond what the base model does when
   asked directly ("expert X who does X well") is dead weight. The test: would a prompt to the
   base model produce the same output? If yes, delete.
5. **Dormant?** No invocation you can find evidence for. Use `git log --follow` per file:
   created once, never touched. Flag as a prune candidate, delete on user confirmation. An
   imported pack also carries agents for stacks and markets this workspace never touches, so
   check each one's stack and market before keeping it.

## Common issues

| Symptom | Fix |
| --- | --- |
| Description over 500 chars | Cut mechanism, inventory and self-description. Keep what plus when |
| Body over 250 lines | Split to `references/`, one level deep |
| A body pointing at 20+ references | It routes to nothing. Merge the references, or the reader opens none |
| A standard stated in prose with no eval | Write the numbered binary checks. See `skill-floor.md` |
| A `## Learned Patterns` section with entries in it | Move the log to `references/`, leave the pointer |
| A log past 25 entries | `compress_log.py`: the rules stay, the run goes to git |
| A log that reads as empty and is not | The counter matches one date format. Count `- 26 Aug 2026` and `## 2026-08-26` too |
| A Contents list above a log | Generated from the entries, or deleted. Never hand-maintained |
| The same paragraph in 3+ sibling files | Delete it where a parent every reader loads already says it |
| "Initial Assessment", "Best Practices", "Common Mistakes" | Imported-pack filler. Keep only what this workspace decided |
| Reference over 100 lines with 3+ sections, no contents list | Add `## Contents` |
| A reference linking to a file `SKILL.md` does not link | Link it from `SKILL.md` too. Nested files get previewed, not read |
| Slash-command-only workflow with a loaded description | Add `disable-model-invocation: true` |
| Flat file in `skills/` | Convert to `skills/<name>/SKILL.md` |
| `name` not matching its directory, or with a leading, trailing or double hyphen | Rename. The standard rejects it |
| Agent missing `name` or `description` | Add the frontmatter |
| ai-doc agent filename not equal to its `name:` | Rename the file. The two must not drift |
| Two items registering the same `name:` | Keep one, delete the other |
| Command and skill with the same name | Skill wins. Commands are skills now, so the command file is a second copy |
| Command longer than its usage table | It is restating its skill. Cut to the invocation |
| Agent that is a procedure, not a persona | Convert to a skill, delete the agent |
| Agent indistinct from the base model | Delete |
| Standalone `hooks.json` | Move hooks into `settings.json` |
| A constraint in `steering/` or `docs/` | Move it into the skill that owns the topic, at `<skill>/references/`, or to `ai-doc/references/` when more than one skill needs it |

## Verification

- [ ] `context_cost.py` reports zero hard violations
- [ ] `dead_pointers.py` reports none, and every deletion this run made was swept for routes into it
- [ ] Metadata total reported before and after, and it went down
- [ ] Every count at or under budget, or an approved exception noted in the report
- [ ] All skills are directories with `SKILL.md`, names matching their directory
- [ ] No duplicate registered names across files
- [ ] Hooks in `settings.json`; every other document under the skill that owns it, or in `ai-doc/references/` when several do. There is no `rules/`
- [ ] In `ai-doc/`, every agent filename equals its frontmatter `name:`
- [ ] References one level deep, files past 100 lines carry a contents list
- [ ] No banned words, no em-dashes (see `ai-doc/skills/content/writing/humanizer/references/slop-list.md`)
- [ ] Every rewritten body answers the Verify list in [skill-floor.md](skill-floor.md), and `review_skill.py` reports no new findings against it
- [ ] No `SKILL.md` carries log entries in its body, and no log in `references/` is past 25 entries
- [ ] Every compressed log was committed first, and no `learned-patterns-archive.md` survives
- [ ] `duplicated blocks` in the report went down, or each survivor has a reader with no parent to hop to
- [ ] Registry smaller or equal to where the run started
- [ ] Consumers re-synced (`pnpm vibekit sync <dir>`) and no broken symlinks, pruning `*/worktrees/*`
- [ ] For memory stores: every file indexed once, no dead `[[link]]`, nothing deleted outside the archive, and each folded fact verified present in the file that now owns it
