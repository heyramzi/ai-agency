# Writing a new skill or agent

Read [skill-floor.md](skill-floor.md) for the quality bar, description contract included.

## Writing a skill

1. Recover the run. The skill exists because something was done twice. The conversation holds
the tools used, the order, the user's corrections and the real input and output shapes: extract
from there and put only the gaps to the user, a couple at a time. What should this let a session do
that it does badly now? What would a user type (the casual phrasing)? What does the output look
like exactly? What went wrong the first time by hand? The last gives the useful content: the
correction, the trap and the wasted hour are what the base model doesn't know. Once you can
name the kind (below), move on.

2. Turn the run into parts. For each example, ask what would be rewritten from scratch next
time. Code rewritten every run is a script (deterministic, token-free to read, takes flags and
prints its own `--help` rather than prompting on stdin). A schema, table of IDs, format spec or a
vendor's real error codes is a reference, loaded when its pointer's condition is met.
Boilerplate that ends up in the output (a template, font, starter directory) is an asset, never
loaded into context. If nothing comes out, the skill is a body and a description, a good outcome;
empty directories are dead weight.

3. Initialise: `scripts/init_skill.py <skill-name> --path <dir>` writes the directory, a
`SKILL.md` template and example files. Delete every example the skill doesn't need.

4. Parts first, body last. A body written first ends up describing work a reference already
carries. Write it for another session: imperative, verb first, the reason in the same sentence as
the rule. Then read it back against [skill-floor.md](skill-floor.md).

5. Package only for a skill leaving this workspace: `scripts/package_skill.py <skill-folder>
[./dist]` validates frontmatter, naming and structure and zips it; a failure stops the package.

Done when `review_skill.py` has no errors and the floor's checks have answers.

## The 4 kinds

The kind names what the reader is doing when they open the file, and decides what the body holds.
Pick it from what the reader needs and ignore the topic: a skill naming a CLI can still be Judgment if the
hard part is deciding what to run.

- Procedure: ordered steps that can go wrong halfway (shipping a release, a migration). The
  deliverable is the sequence, the gates and the recovery. Fails as a step that silently does the
  wrong thing.
- Judgment: a craft the model attempts and does badly by default (voice, layout, hooks,
  thumbnails). The deliverable is a quality floor and refusals. Fails as a checklist that describes
  good work without producing any.
- Interface: a tool, API or CLI whose behaviour can't be guessed (an auth split, a base URL
  that silently rejects, a boolean meaning the opposite of its name). The deliverable is exact
  invocations and traps. Fails as a copy of the vendor's docs.
- Context: facts about this workspace no model holds (object IDs, entity names, product
  decisions). The deliverable is the values and where they live. Fails by going stale unnoticed.

## Writing an agent

An agent is a persona spawned into its own context with its own tools and budget. It must pass all
3 tests, and most often the right answer is that the work is a skill.

1. Fresh eyes are the point: a reviewer of finished work, a researcher who reads a hundred
   files and returns four lines, a second opinion. If the parent could do it with the same context
   and get the same answer, the agent is overhead.
2. The body is judgment. Steps, gates and a fixed output shape make it a skill.
3. It's distinct from every other agent. Near-identical system prompts are one agent under the
   broader name.

```yaml
---
name: thing-reviewer                        # equals the filename, lowercase and hyphens
description: "..."                          # quoted; what it does and when to spawn it
skills: [refactor, diagnose]                # what it preloads: 1 to 3 core skills
model: sonnet                               # sonnet default, haiku for simple work, never opus
disallowedTools: Write, Edit, NotebookEdit  # a reviewer that can't edit
maxTurns: 30                                # a ceiling so a bad run ends
effort: high                                # only where depth is the deliverable
---
```

- The tool line is the strongest in the file: saying a reviewer can't edit is worth more than a
  paragraph asking it not to. Use `disallowedTools` and skip the `tools` allowlist: an allowlist replaces
  the inherited pool and silently drops every MCP tool and skill the agent leaned on, and one
  with nothing that resolves refuses to launch. `Skill` belongs in `skills`, not `tools`.
- `skills:` is what the agent preloads whole at spawn, so it holds only the 1 to 3 skills used on
  almost every run. Any other skill the body names, the agent calls through the Skill tool.
- Turn budgets held across 75 agents: 30 for a read-only reviewer, 40 for a builder, 50 for a
  pipeline coordinator. `effort` stays inherited unless depth is the deliverable (6 of 75).
- `claude plugin validate <dir>` parses a directory of agents and names any frontmatter that fails.
  Give it the real path; it doesn't follow symlinks.

The body holds: an input contract (what the parent passes, what's required, what to do when it's
missing, since a guess returns confident fiction); a turn ceiling and what to do about it, since
a run that ends before writing its output returns nothing ("treat reading as an allowance: take the
contract and primary files first, sample rather than walking the tree, and by roughly the tenth turn
stop reading and write; name what went unread in one line above the output"); the output shape
exactly, since the parent parses it, including what an empty result looks like; what it must
not do, one line each at the top (a reviewer edits nothing, a producer doesn't redesign, an
applier owns source edits only).

Give each agent a degraded path. Subagents aren't always available, so the spawning skill
says how to run the same passes inline, in a stated order, in the parent thread. Impeccable keeps a
mirror of each agent under `reference/degraded/`. An agent with no degraded path is a skill that
silently does nothing on half the machines it reaches.

Placement: [contract.md](contract.md). After adding, renaming or deleting one, run
`ai-doc/scripts/check-agent-readme.py --fix`, then `node scripts/validate-architecture.mjs`.
