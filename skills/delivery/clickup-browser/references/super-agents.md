# Super Agents and their MCP servers

Connecting a server and building an agent are the longest click paths in this skill and the ones most likely to move under a redesign. Read them here rather than from memory.

## Connect an MCP server, and give its tools to a Super Agent

Shipped in release 4.07 on 18 Aug 2026. There is no API for it; the whole surface
is App Center.

From `/<teamId>/settings/apps`, click **App Center** in the left sidebar. The row
highlights on the first click and the modal opens on the second, and the modal
fades in over about four seconds, so a click aimed at it during the fade lands on
the page behind and dismisses it. Wait, screenshot, then click.

In the modal's left rail, under **AI**, pick **MCP Servers**. Two doors:

- **The catalogue**, eighteen apps on 20 and 21 Aug 2026 (Amplitude, Atlassian,
  Canny, Canva, Clay, Dropbox, GitHub, Hex, HubSpot, Intercom, Linear, Mixpanel,
  Notion, Sentry, Slack, Stripe, Supabase, ZoomInfo). Each is OAuth into that
  account, so connecting one puts whatever it holds in front of the agent. Never
  complete one on a live account for a recording.
- **Add Custom MCP Server**, which takes any URL.

**Which workspace am I in?** The rail carries a **Custom MCP** category only
where a custom server is connected, so that entry is the fastest proof. The
catalogue also holds ClickUp's own card, **MCP Servers**: its Personal tab with
nothing connected reads "Couldn't load tools", the empty state, not a fault.

The custom path is: permissions (**For all members** or **Just for me**) →
**Next** → Name, URL, Description, Authentication Method → **Next**. Auth offers
OAuth, **Authorization header** (a static token, pasted as `Bearer <token>`), or
**No Authentication**; the last two also take Custom Headers. On success ClickUp
calls the server's `tools/list` itself and shows the discovered tools, which is
the proof the connection works.

ClickUp's own help page calls the middle option "API key". The live UI says
**Authorization header** (re-read 21 Aug 2026). Trust the UI, and expect the doc
to lag the release.

**Pick the permission scope first, not last.** A personal connection has no
credentials when the person is not logged in, so a scheduled agent using one does
not error, it silently reports only what it could reach. Anything an agent runs on
a schedule needs the workspace connection.

**Giving an already-connected server's tools to an agent is a different screen,
and it has a trap.** In the agent's Skills panel, **Add tools** opens a modal whose
top right carries **Custom MCP Server**. That button is not a picker: it starts the
connect-a-new-server flow again, and following it all the way through would stand up
a second copy of a server that is already connected. Cancel out of it. The connected
servers are further down the same modal, under a **Custom MCP Servers** heading below
the eighteen catalogue apps: scroll to it, click the server, then **Add all** or pick
tools one by one.

**That modal paints late.** A click on it registers and the result appears four to
six seconds later, so a second click aimed at the same place lands on whatever has
since moved under the cursor. Click once, wait, screenshot.

**Searching it returns tool groups, not tools.** Typing `status` returns one row,
**Tasks and subtasks** (8 tools), and adding that group is how an agent gets the
ability to change a status. Individual tool names mostly do not match; search by the
thing you want done. A custom server's own tools do match by name.

Then give the tools to the agent through the form below, not through the builder
chat.

A **Finish Setup** banner naming the server in Skills as **Unavailable** paints
on some loads and clears on others while the tools still work. It settles
nothing either way: ask the agent the question and read the answer.

## Build a Super Agent from scratch

Verified 21 Aug 2026 in a demo workspace.

**Do not brief the builder chat.** The prompt box on `/<teamId>/ai/agents`
("Describe tasks or workflows that need automating") answered a 2.3k brief with
*Whoops! Looks like we stumbled upon a hiccup in the matrix*, and a 700-character
one by clearing the box and returning to the start page with no error at all.
Neither attempt created anything, so there is nothing to clean up, but neither
told the truth about that either. An earlier note here said the chat was more
reliable than the form; that is now wrong, and the form path below is what works.

**An agent id you find in a network call is probably not the one you just made.**
An open agent page polls `.../agents/<id>/summary` for whatever agent it is
showing, and a workspace usually holds several. Read the `name` in that response
before acting on the id: in one workspace `8cbypq9-109195` looked like a fresh draft
and was a long-standing **Client Profitability** agent. Confirm against
**AI → All Agents** in the left rail, which is the only place the full list lives;
`/ai/agents` is the create screen, not the list.

**Start from scratch**, top right, opens `/<teamId>/ai/agents/<agentViewId>` with
the full form on the right and the builder chat on the left. Fill the form. Every
field needs its own click to enter edit mode, and the clicks are not the same:

- **Name.** One click turns the title into an inline input. `cmd+a`, type, `Tab`
  to commit. The browser tab title changes to the new name, which is the cheapest
  proof it took.
- **Description.** Needs **two** clicks. The first only highlights the row and
  leaves focus outside, and a `cmd+a` there selects the whole page instead of the
  field, so the next paste lands nowhere.
- **Instructions.** One click inside the grey box gives a caret. **Type, do not
  paste.** Two pastes in this session put the wrong content in the field, once a
  stale clipboard, once nothing at all, and a paste that fails looks exactly like
  a click that missed. Typing the paragraphs one by one with `Return` between
  them is slower and it is the only version that landed. Avoid line-leading `1.`
  or `-`, which the editor turns into lists, and avoid `/` and `@`, which open the
  tool and mention pickers mid sentence.

**Editing an agent that already has instructions is a different job from filling an
empty one, and it works.** Open the field full screen with the ⤢ icon beside
**Instructions**, click anywhere in the body, `cmd+Down` to reach the very end. If
the last thing in the document is a bullet, press `Return` twice: the first makes a
new bullet, the second exits the list so a plain paragraph follows. Then type the new
sections, one `type` call per paragraph with a `Return` between them. Verified 21 Aug
2026 appending six sections to Client Profitability, all of which landed intact.
Close with the modal's **X**; the **Save changes** banner is waiting behind it and
still has to be clicked.

**Re-screenshot before every click in this form.** Saving is a banner, not a
button: the moment a field changes, a **Save changes** bar appears between the
header and Instructions and pushes everything below it down by about 65px. A
coordinate read before the bar appeared now lands one row too high. `Save` gives
the toast **Agent saved successfully**.

**Skills is not what you think it is.** A new agent has one skill, ClickUp
**Default tools**, and hovering the `14 tools` chip lists them: Create schedule,
Edit self, Execute code, Generate image, Load assets and objects, Load Custom
Fields, Post reply, Retrieve Chat messages, Retrieve task list, Search activity,
Search users and teams, Search Workspace, Transcribe media, Write a to-do list.
**Creating a task is not among them.** An agent told to open a task will say it
did and will not have. Add it: **Add tools** → Popular tools → **Create task**,
which flips to *Added*, then close the modal and Save.

**Knowledge** is three things. **Workspace Access** is a single toggle for the
whole workspace and it is on by default. **Add from ClickUp** narrows it, with
Spaces & Lists / Tasks / Docs / Chats behind it. **External Search** carries Web
Search, ClickUp Help Center and GitHub, all off. Narrow to the space when the
workspace holds more than one client's data, or the agent will happily answer
about the wrong one.

**Triggers** default to three manual jobs, all on: Mention, Direct Message, Assign
task. **Scheduled** is added separately.

**An example in the instructions becomes a fact in the answer.** The Client Brain
agent was told to cite its source "in this shape: Source: Client Memory Vaqueros
Tex-Mex, standing preference dated 14 Aug 2026". It then stamped *14 Aug 2026* on
answers taken from sections that carry no date at all, which is exactly the
fabrication the agent existed to prevent. Write the shape with placeholders and
no real values, and add the negative rule beside it: add a date only when that
exact line carries one, never reuse a date from another line. Re-testing after
that edit produced clean citations naming two sections and no date.

`Activate Super Agent` turns `Run` on. `Run` offers **Send DM** and a preview of
the scheduled run. The DM is the fastest end-to-end check, and its reply lands in
a thread, so open the thread rather than expecting it in the main pane. A DM that
makes the agent create something takes **50 to 60 seconds**, and the task card
paints in the thread before the sentence does, so a thread showing a card and "No
replies" is still working, not stuck.

**Then verify from the CLI.** The card in the chat is the agent's own claim.
`CU_TEAM_ID=<teamId> cu tasks --list <listId>` is the proof, and the same command
deletes the test artefacts before a live demo.

## The Super Agent Builder edits the prompt, never the Knowledge

The Edit tab on a Super Agent is a chat with a "Super Agent Builder" that rewrites the
agent in natural language. It will happily restructure the instructions, and it says so:
asked on 24 Aug 2026 to give 🧠 Client Brain access to a second space, it answered that it
could handle the instructions but **"there's a platform limitation: I can't directly edit
the Knowledge section (workspaceKnowledge) from here."** That section is set by hand in the
agent profile.

In practice the instruction rewrite was enough. The agent had been scoped to DELIVERY 3.0
and refused a question about a company in SALES 3.0, naming the record it had found and
ignored. After the builder inserted the Companies list into its read order, the same
question came back answered and sourced. **So try the prompt first and re-ask the question
before going near the profile**, because the Knowledge section is access control rather
than the agent's reading order, and the reading order is usually what is actually wrong.

The builder asks a clarifying question before it writes, and waits. A run that fires the
instruction and screenshots twenty seconds later catches the question, not the change.
