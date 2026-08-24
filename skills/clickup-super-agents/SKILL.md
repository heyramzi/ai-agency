---
name: ClickUp Super Agents
description: Builds, edits and verifies ClickUp Super Agents, including the MCP tools they call and the Docs they read as knowledge. Use when an agent has to be created, re-scoped, given tools, pointed at a doc, or debugged for answering from the wrong place. The click paths for App Center and the builder form live in clickup-browser; this skill is what to put in the form and why.
---

# ClickUp Super Agents

There is **no API**. Everything here is the browser, and `clickup-browser` holds the
clicks. This skill holds the design: what a good agent is made of, which of the four
panels actually constrains it, and how to tell a working one from one that is lying.

Announce at start: "I'm using the clickup-super-agents skill."

## An agent is four panels, and only two of them constrain anything

**Instructions** are the real scope. **Skills** (tools) are the real permissions.
**Knowledge** barely narrows anything and **Triggers** decide when it runs.

- **Knowledge cannot be narrowed.** The Workspace Access toggle is forced on:
  turning it off shows *Public Workspace knowledge is required for Agents*
  (verified 21 Aug 2026). **Add from ClickUp** adds emphasis, never a boundary.
  So an agent can always read the whole workspace, and the only thing stopping it
  answering from the wrong space is a sentence in its instructions. Write that
  sentence: name the space it owns and say to ignore the others out loud.
- **Skills are the only hard limit.** A tool it does not have is a thing it cannot
  do. A tool it has, it will eventually use.

## Give it the smallest set of tools that answers its question

A new agent arrives with **14 default ClickUp tools** already on: Create schedule,
Edit self, Execute code, Generate image, Load assets and objects, Load Custom Fields,
Post reply, Retrieve Chat messages, Retrieve task list, Search activity, Search users
and teams, Search Workspace, Transcribe media, Write a to-do list. **Creating a task
is not among them**, so an agent told to open a ticket will say it did and will not
have.

The rule that has held up: **read-only on systems of record, write only on the object
somebody handed it.** Money, agreements and rate cards get read tools and nothing
else. An agent that produces work (a render, a draft) may comment on and move *the
task it was assigned*, and nothing else. Reading is reversible; writing is not.

**One agent, one question, no schedule unless it must be unattended.** One agent with
twenty tools picks the wrong tool more often, ignores the middle of its own
instructions, and cannot be debugged, because you cannot tell which half of the job
misfired.

## The Add tools modal, which is where the time goes

Full click path in `clickup-browser`. Two things decide whether this is thirty
seconds or ten minutes:

- **Search returns tool GROUPS, not tools.** Typing `status` returns one row,
  **Tasks and subtasks** (8 tools). Search by the thing you want done, not by a tool
  name you imagine. A custom MCP server's own tools do match by name.
- **The `Custom MCP Server` button top right is not a picker.** It starts a fresh
  connection flow and will stand up a duplicate of a server you already connected.
  Connected servers sit under **Custom MCP Servers** further down the same list,
  with an **Add all** shortcut.

## Docs are the agent's memory, and they beat the instruction field

A Super Agent reads ClickUp Docs, so **anything long, per-client, or likely to change
belongs in a Doc, not in Instructions**. Add it under Knowledge → Add from ClickUp →
Docs, then have the instructions name the doc and say it wins over everything else.

That split is what makes the agent maintainable: the instructions are the method and
almost never change; the doc is the facts and changes weekly, edited by whoever knows,
without touching the agent. Adding a private doc raises an *Agent will use private
data* confirm, which is expected and has to be accepted.

Verified 21 Aug 2026: an agent given one `Client Memory` doc answered "who approves
packaging artwork", cited the doc **and the section**, and correctly separated who
sets the deadline from who approves.

## Writing instructions that do not produce confident nonsense

- **Hand over the join key, never let it match names.** When an agent reads two
  systems, one of them must publish the field that links them, and the instruction
  must say "this field is how you join A to B". Matching names is where a model gets
  it wrong silently.
- **An example becomes a fact.** A source-citation format written with real values
  got that value stamped onto answers that had no date. Write shapes with
  placeholders, and add the negative rule beside it.
- **Give ambiguity somewhere to go.** A verdict field needs a third value (Unclear,
  Not in our records yet) and an explicit ban on folding it into the decisive one.
  Without it the agent picks the answer that makes the story bigger.
- **Fix ambiguity in the data, not the prompt.** An agent asked to judge tasks against
  a list of signed deliverables returned "unclear" and one wrong "in scope". Adding an
  **excludes** list to the source made all three correct. When a judgement keeps
  coming out soft, the source is usually underspecified, and prompting harder against
  a vague source only buys confident guesses.
- **Ban the unsourced number.** "Never state a number you did not read from a tool. If
  a tool returns nothing, say so rather than estimating."

## Verify by asking, never by reading the form

A saved form proves nothing. The check is a DM, and then the object.

- A multi-tool answer takes **40 to 70 seconds**. A thread showing a card and
  "No replies" is still working.
- **Read the artefact from the CLI**, not the agent's own claim:
  `cu task get <id>`, `cu comments list <id> --blocks`. The `--blocks` flag matters:
  a comment full of images has an empty `comment_text` and reads as blank lines
  without it.
- A **Finish Setup** banner naming a server as *Unavailable* paints on some loads and
  clears on others while the tools work. It settles nothing. Ask the question.

## Before it goes on camera

Demo agents follow the anonymisation rule in `clickup-browser`: invented clients,
invented records, its own list. An agent's **description is visible in the agents
list**, so a name or a client in that one sentence is on screen even when the shot
never opens the agent.

## Related

`clickup-browser` for every click path and the MCP connection flow. `clickup-cli` for
reading the result back.
