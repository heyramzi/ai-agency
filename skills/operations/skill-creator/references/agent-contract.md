# Writing an agent

Read this when the thing being created is an agent, or when deciding whether it should be one.

## Is it an agent at all

An agent is a persona spawned into its own context with its own tools and its own budget. Three
tests, and it has to pass all three.

1. **Fresh eyes are the point.** The value comes from a reader outside the parent thread's
   attention gravity: a reviewer of finished work, a researcher who reads a hundred files and
   returns four lines, a second opinion. If the parent could do the same work with the same
   context and get the same answer, the agent is overhead.
2. **The body is judgment, not a checklist.** Steps, gates and a fixed output shape are a skill.
   An agent that lists a procedure is a skill wearing a costume, and the registry already carries
   several.
3. **It is distinct from every other agent.** If two agents would write near-identical system
   prompts, they are one agent under the broader name.

The commonest correct answer is that the work is a skill. The second commonest is that it is a
skill the parent invokes, and the agent's only job is to be told to invoke it.

## The frontmatter is a budget

```yaml
---
name: thing-reviewer                        # equals the filename, lowercase and hyphens only
description: ...                            # what it does and when to spawn it, third person
model: sonnet                               # sonnet by default, haiku for simple work, never opus
disallowedTools: Write, Edit, NotebookEdit  # a reviewer that cannot edit
maxTurns: 30                                # a ceiling, so a bad run ends instead of grinding
effort: high                                # only where depth is the whole deliverable
---
```

The tool line is the strongest in the file. An agent that reviews should not be able to edit, and
saying so in the frontmatter is worth more than a paragraph asking it not to.

**Reach for `disallowedTools` rather than a `tools` allowlist.** An allowlist replaces the
inherited pool, so it silently drops every MCP tool and every skill the agent already leaned on,
and the failure appears as an agent that quietly stops doing half its job. A denylist removes
exactly the capability that has to go and leaves the rest. Write a `tools` allowlist only for an
agent built around a named handful of tools from the start. Two entries need care either way: an
allowlist with nothing that resolves refuses to launch, and `Skill` belongs in the `skills` field
rather than in `tools`.

Budgets that held across the 75 agents here: 20 turns for a lead that only routes, 30 for a
read-only reviewer, 40 for a builder, 50 for a coordinator running a multi-step pipeline. `effort`
is left inherited unless depth is the deliverable, which came to six agents out of 75.

`claude plugin validate <dir>` parses a whole directory of agents and names any frontmatter that
does not load. Point it at the real path: it does not follow symlinks, so a projected
`.claude/agents` reports every entry as unread.

## The body

**An input contract, named as one.** What the parent passes, what is required, and what the agent
does when a required input is missing. An agent that guesses at a missing input returns confident
fiction.

**A stated turn ceiling and what to do about it.** A ceiling ends a run without warning, and a run
that ends before it wrote its output has returned nothing. Say so, and say when to stop reading and
start writing:

> A hard turn ceiling ends the run without warning. Treat reading as an allowance: take the
> contract, the captures and the primary files first, sample rather than walking the tree, and by
> roughly the tenth turn stop reading and write. Name whatever went unread in one line above the
> output.

**The output shape, exactly.** The parent parses this. Name the sections, name the order, and say
what an empty result looks like.

**What it must not do.** A reviewer edits nothing. A producer does not redesign. An applier owns
source edits and nothing else. One line each, at the top, because these are the failures that cost
a whole run.

## Every agent needs a degraded path

Subagents are not always available or permitted. The skill that spawns the agent says what to do
when it cannot: run the same passes inline, in a stated order, in the parent thread. Impeccable
keeps a mirror of every agent under `reference/degraded/` for exactly this, and its inline
instruction reads "when a sub-agent tool is available and permitted, run these independently;
otherwise run them yourself in this order".

An agent with no degraded path is a skill that silently does nothing on half the machines it
reaches.

## Placement

`ai-doc/agents/<area>/<kebab-name>.md`, and the filename equals the frontmatter `name` so the two
cannot drift. Eight agents per area is the ceiling. The area's `<area>-lead` lists every agent and
skill it owns, and `ai-doc/scripts/check-lead-tables.py --fix` reconciles that list against the
filesystem, so run it after adding, renaming or deleting one.
