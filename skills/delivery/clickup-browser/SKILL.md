---
name: clickup-browser
description: "Drives the parts of ClickUp the public API does not reach: workspace task templates, Task-created automations, dashboards, space statuses, Workload capacity and a view's pinned description. Use when a ClickUp job has no API, when templates or automations must be created or changed, or when the cu CLI has no command for what is asked. Everything else belongs to clickup-cli, clickup-ops or clickup-data-manager."
tags: [drives, clickup, browser]
---

# ClickUp in the browser

ClickUp's PUBLIC API covers tasks, lists, fields, docs and views and nothing
else. Templates, automations, agents, dashboards, statuses and Workload have no
public endpoint, and that is what this skill is for. It no longer means clicking:
most of them are now `cu` commands built on the private frontdoor API, and the
rest can be recorded and replayed. Reach for a click path last, because it breaks
on a redesign and an API call does not.

Announce at start: "I'm using the clickup-browser skill."

## Check the CLI before you open a browser

Nine surfaces the public API never reached are now plain `cu` commands, built on
ClickUp's private frontdoor API (list/get automations re-verified 1 Sep 2026):

    cu template center            # every saved template, by kind
    cu dashboards                 # every dashboard in the workspace
    cu statuses                   # every status defined anywhere
    cu agents                     # every Super Agent
    cu agents get <id>            # one agent, agent_config included
    cu automations --list|--folder|--space <id>   # rules on that level (--active ACTIVE|INACTIVE|ALL)
    cu automations get <uuid>     # one rule in full, every action's input included
    cu automations count <listId>
    cu automations catalog        # everything automations can trigger on and do

A space-level rule is invisible in the list-level listing, and no endpoint writes an action:
`PUT /automation/workflow/{uuid}` returns 200 and keeps the ones it had. `automations
catalog` settles "is X expressible as a ClickUp automation" without opening the builder.

These authenticate with a captured browser session, **not** the `pk_` API token,
which the frontdoor rejects. They need a live capture:

    cu net capture 'https://app.clickup.com/<teamId>/home'

The bearer is the ~48h frontdoor JWT, so this is a roughly-daily step. The
commands say so plainly when the session is missing or stale, rather than
returning a bare 401.

## Record the call once, script it forever

**When a flow is not yet a command, capture it rather than re-clicking it.**
`cu net capture <url>` learns a surface's read endpoints, `cu net record` learns a
write flow, and `cu net replay` re-issues either from the terminal. A replayed write
is a real mutation, so it needs `--allow-write`. The modes, the summarize/show/replay
vocabulary, the header set and the path vocabulary are in
`references/network-capture.md`.

## Before the first click

**`ego-browser` is the route. Claude in Chrome is the fallback.** The reason is
structural rather than marginal: one `Bash` heredoc carries a navigate, a
wait, three clicks and a capture, where Claude in Chrome spends one tool call and one
round-trip on each of those. A ClickUp path is a long chain of slow clicks, so the
per-call overhead is most of the wall clock.

The heredoc, the five mechanics that bite on the first run (`wait()` counts SECONDS, `click` takes
one array, `help()` lies about helpers that work, `drainEvents()` never carries a network event, and
the body is an ES module), and how to pick a browser on the fallback:
[`references/driving-the-browser.md`](references/driving-the-browser.md). Anything long-running goes
to `run_in_background`, because a foreground heredoc waiting on ClickUp outlives the 2 minute tool
timeout.

**A white-labelled workspace redirects.** `app.clickup.com/...` becomes the
workspace's own host and the page renders twice on the way. Navigate, wait 6
to 10 seconds, screenshot, and only then click. A click into the loading
skeleton is a click into nothing, and the first click after a load often only
takes focus, so the menu opens on the second.

**The UI language flips between French and English on its own**, mid session,
without anybody touching a setting. Never key a click path off a label you did
not just read on screen. Both labels are given below.

**The viewport resizes on its own too**, 1428x840 to 1456x822 to 1568x740 in one
session. Every coordinate here is a hint. Screenshot, read, then click where the
element actually is.

## Anything that will be filmed is invented, and it lives in its own list

Every ClickUp demo that goes on camera is built in a dedicated demo workspace,
never in the workspace that holds real work, and **every record in it is
invented**. Not blurred, not renamed on the day, not a real client's board with
the logo swapped. Invented clients, invented invoices, invented agreements,
invented brand kits.
**How to apply.** Before building a demo, make the list it will live in rather than
borrowing one that already holds work. Give the space a `3.0`-style demo name, name
the clients out of nothing, and keep every number self-consistent so the board
survives a viewer pausing on it. A real client's data never becomes the demo, even
temporarily, because the intermediate state is what ends up in a take.

**The blast radius is wider than the list you point at.** Whatever else sits in that
workspace can appear in a sidebar, an agent list, a search result or a breadcrumb. A
demo space that is clean but sits beside a space named after a real account is not
clean on camera. Sweep the surfaces the shot will cross, not only the one it lands on.

## Templates, automations and the pinned description

The three surfaces with no API at all. Click paths, both label languages, editing a rule's
actions (the first has no delete icon; Save sits a thumb from Cancel) and the body a "Call
webhook" POSTs: [`references/templates-and-automations.md`](references/templates-and-automations.md).

## Super Agents

Connecting an MCP server to the workspace and building an agent from scratch are in
[`references/super-agents.md`](references/super-agents.md).

## Getting off the clicks: what the UI calls

These are click paths because the public API has none. The app does, and
`read_network_requests` with `clear: true` around an action reveals it. The gateway
and REST hosts, the agents-service correction of 24 Aug 2026, and the rule that you
capture the session rather than reusing `app.clickup_jwts` are in
`references/network-capture.md`.

## An agent can put a picture on a task, and the API will tell you it did not

A Super Agent that writes `![alt](https://example.com/frame.jpg)` into a comment
produces a real inline image in ClickUp. It renders full width in the task's Activity
panel, from an ordinary public URL, with no upload and no attachment step. Verified
21 Aug 2026 with three renders served off a Cloudflare Worker.

Two things will make you think it failed.

- **`GET /v2/task/<id>/comment` returns those blocks with `"text": ""`.** The image
  lives in a sibling `{"type":"image","image":{"url":...,"uploaded":true}}` block that
  a text-only reader skips, so the comment reads as three blank lines. Read each
  block's `type` before concluding anything.
- **The Activity panel lazy-loads them.** A screenshot taken on arrival shows a tall
  empty gap where the images belong. Scroll the panel and they paint.

## The Super Agent Builder edits the prompt, never the Knowledge

The Edit tab is a chat that rewrites the agent in natural language. It cannot touch
the Knowledge section (`workspaceKnowledge`), which is set by hand in the profile.
Try the prompt first: a wrong reading order looks like missing access and usually
is not. Details and the 24 Aug 2026 run in `references/super-agents.md`.

## A view's cells paint lazily, so the first screenshot is empty

A freshly opened list view renders its column headers immediately and its cell values a
beat later. A capture on arrival comes back with Name filled and every custom-field column
blank, which reads as "the API writes did not land" when the values are in fact set. This
is the same lazy-render behaviour already recorded above for images in the Activity panel.

Scroll the view and scroll back before capturing. Any interaction that forces a repaint
works; opening **Customize view** does it too.

## Screenshots: the helper is 1x, CDP is not

**`captureScreenshot(path)` writes at CSS pixels and ignores `deviceScaleFactor`.** Anything going on
camera is captured over CDP instead, which honours it, and the exact calls are in
[`references/screenshots.md`](references/screenshots.md) along with the crop rules. Crop rather than
hide: cropping the left rail is what keeps a real client's space name out of a demo frame, which is
the blast-radius rule above.

## Verify with the API, never with the screenshot

A screenshot proves a dialog closed. It does not prove the automation fires.
Every one of these paths is checked from the CLI afterwards:

    cu task create --list <listId> --name "ZZ QC <thing>"
    # wait ~20s, the automation is asynchronous
    cu task get <id> --fields     # description, BATCH, the template's fields
    cu tasks --list <listId> --subtasks   # the template's subtasks, if any
    cu task delete <id>           # deleting the parent cascades to its subtasks

Export `CU_TEAM_ID` for the workspace under test. Without it the CLI points at your default workspace,
which is production.

What a correct apply looks like: **the name the user typed survives**, the
description is the template's, custom fields are set, subtasks exist for a
process template, and the status is the list's own default rather than the
template's.

## What collides with what

**An AI agent automation on the same list beats a template.** DELIVERY 3.0 >
🎫 Client Tickets runs "Ticket created → AI clarifies the request", which
rewrites name and description on creation. With a template rule on the same
list, the template lands first and the agent overwrites it, so the QC task came
back renamed with the template's own text chewed up as input. A list whose name
and description are owned by an AI agent gets no template automation. Check the
lightning tooltip: it counts "1 automation + 1 agent automation" separately, and
the Manage list shows only the first kind by default.

**Two sessions in one workspace collide too.** A concurrent session renamed a
source task while these paths were running, which deleted the old task, created a
new one, and left the saved template and its automation pointing at something
that no longer existed. Before repointing anything, re-read the list from the
CLI. Fixing it is: save the new task as a new template, open the rule's full
form, x the dead template, pick the new one, Save.

## Photographing a view

Capturing a view without the extension is in
[`references/screenshots.md`](references/screenshots.md).

## Subagents

These paths parallelise badly. Each agent needs its own tab, and closing the
browser window kills the whole tab group at once, which stranded three agents
mid run in one session. If you delegate: give each agent one tabId, forbid
`select_browser`, `switch_browser` and `tabs_create_mcp`, and tell it to report
rather than improvise when its tab dies. Expect to finish the tail yourself.

Agents also report a step as failed when the click landed but the confirmation
was missed. Re-read the object before redoing the work, or you get duplicates.

## Workload

Mapped 26 Aug 2026, filling a space's Workload view for a screenshot. The view opens at
`https://app.clickup.com/<teamId>/v/wl/<viewId>`, and `cu views list --space <id>` gives
the id, so nothing has to be clicked to reach it.

**The unit and the grouping are two menus on the view bar.** `Points | Tasks | Time
Estimates | Time Estimates (% out of capacity)` sets what is summed, and `Daily
Scheduled | Daily Availability | Weekly Capacity | Weekly Availability` sets what the
cell says. Weekly Capacity is the one that prints a percentage and turns the cell red
past 100%, which is the mode any "we are over capacity" frame wants.

**A dropdown custom field is summed by its option label.** The unit called `Points` in
that menu is the space's own `🔢 Points` drop_down (options `1 | 2 | 3`), not the native
Sprint Points field, which sat greyed out. So `cu task field set <id> --field <points>
--value <optionId>` moves the bar, and a whole board can be loaded from the CLI with only
the capacity left to click.

**A row only exists once it has scheduled work.** People with nothing dated inside the
window are hidden behind a `Show N people without scheduled tasks in this period` line,
and a task lands in a week by its start-and-due span, so keep both ends inside the same
Monday-to-Friday or the points split across two cells.

Collapsing a row, setting a person's capacity (double-click the input, type, then Save: a click plus
`Meta+a` leaves the old value and saves nothing) and keeping the layout across a reload are three
click paths verified at 1900x861, with the selectors and the reason a synthetic `.click()` moves
nothing here: [`references/workload-view.md`](references/workload-view.md).

## Not mapped yet

Dashboards and cards, and space statuses, are also UI only and are not in here, because
no click path for them was verified. Map one the next time it comes up, then add it,
rather than guessing it now.
