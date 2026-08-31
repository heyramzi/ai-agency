---
name: clickup-cli
description: "Use when interacting with ClickUp: reading tasks, updating statuses, managing docs, browsing hierarchy, or any ClickUp API operation via the CLI. Triggers on any ClickUp task or doc work."
tags: [drives, clickup]
---

# ClickUp CLI

Command-line tool for managing ClickUp tasks, docs, hierarchy, and time tracking.

## Setup

It is one global binary:

```bash
cu <command> [args]
```

There is no `clickup` alias; that name returns "command not found".
Install it with `npm i -g heyramzi/clickup-cli`, then `cu init`. It is a public
repository, so there is no token and nothing to ask anybody for. The course that
teaches it is **ClickUp Foundations** at
[skool.com/ai-agency-systems-3191](https://www.skool.com/ai-agency-systems-3191).
Every command below assumes `cu` is on your PATH.

### Configuration

Stored at `~/.config/clickup/config.json`. Supports multiple API tokens with priority-based fallback. Override with env vars: `CU_API_TOKEN`, `CU_TEAM_ID`.

**"Priority-based fallback" applies to picking the token, not to retrying a
failed call.** Every command runs on `tokens[0]` and stops there, so a `401
ACCESS_081` / `INSUFFICIENT_PARENT_ACCESS` is not proof the operation is
forbidden. The other token may own the object. It is per-task, not per-list:
one token updated, attached to and deleted tasks in a list all session, then 401'd
on deleting one task in that same list that the owner's token deleted immediately.
There is no `--token` flag; switch with the env override for the one call:

```bash
export CU_API_TOKEN=$(python3 -c "import json;d=json.load(open('$HOME/.config/clickup/config.json'));print([t['token'] for t in d['tokens'] if t['name']=='owner'][0])")
cu task delete <taskId>
```

Whole scopes are missing from a member token, not just single objects: `manage_tags`
is one, so **every** tag write needs the override above, in every space. The two halves
answer with different codes, which is why this reads as two separate problems until you
line them up: `cu tag create` returns `401 ACCESS_081`, and `cu tag delete` returns
`401 ACCESS_016` carrying `invalid_permissions: ["delete_tags"]`. Neither is a missing
capability and neither is worth working around. Deleting the 41 tags in the STUDIO space
on 26 Aug 2026 failed 41 times on the team token and succeeded 41 times on the owner's,
with no other change.

The profile holding the write scope is not always called `owner`: read `cu profiles` and
`cu status` for the real names before copying the snippet above.
```bash
cu init     # Interactive setup wizard
cu status   # Show auth status and token priority
```

## Command reference

Every command, its flags and the shape it returns are in
[`references/command-reference.md`](references/command-reference.md). Run `cu --help` when the
table and the binary disagree: the binary is right and this file is what needs healing.

## Where the public API stops

Templates, automations, agents, dashboards and workspace statuses have no public
endpoint. They are still `cu` commands, built on ClickUp's private frontdoor API
(added 24 Aug 2026):

    cu template center     cu dashboards     cu statuses
    cu agents              cu agents get <id>
    cu automations --list <id>     cu automations count <listId>     cu automations catalog
    cu fields all          cu fields duplicates     cu fields merge     cu fields delete

These authenticate with a captured browser session rather than the `pk_` token,
which the frontdoor rejects, so they need `cu net capture` to have run recently:
the session bearer is a ~48h JWT. Anything not yet wrapped can be recorded and
replayed with the rest of the `cu net` family. Workflow and guard rails live in
the `clickup-browser` skill.

## Changing a member's role works below Enterprise

`cu user update <userId> --admin` (and `--admin=false`) is the one write where
the documented endpoint is a dead end on most plans: `PUT /api/v2/team/{team}/user/{user}`
answers `TEAM_110: Team must be on enterprise plan`, so on Free through Business
the public API cannot change a role at all. The command falls through to the call
the web app's own role picker makes, `PUT /team/v1/team/{teamId}` on the frontdoor
with `{"edit":[{"id":<userId>,"role":<n>}]}` where the roles are
**1 owner, 2 admin, 3 member, 4 guest**. Captured and round-tripped
member → admin → member on a live Business workspace, 31 Aug 2026.

**The session has to be an owner or an admin of that workspace.** A member gets
`401 ACCESS_009` naming `can_add_team_admins`, which is the same refusal the UI
shows as a toast, and no CLI can talk its way past it: a role is granted by
somebody who already has the right, never by the account that wants it. The
browser is usually signed in as the day-to-day account, which is often a plain
member, so set **`CLICKUP_FRONTDOOR_JWT`** to an owner's frontdoor token and the
command uses that instead of the captured session. Setting it also turns the
private route on by itself, without waiting for the Enterprise refusal.

## Output Modes

An interactive terminal gets coloured tables, a pipe or `--json` gets structured
JSON, and `NO_COLOR=1` drops the ANSI codes. Always use `--json` when parsing.

Always use `--json` when parsing output programmatically or piping to other tools.

Three things `--json` does not give you:

- **`task get --json` drops the custom fields.** Use `--markdown` to read a task by
  eye, and `GET /api/v2/task/{id}` directly when you need the field values.
- **The output is JSON followed by a `help[...]` block**, so `json.load` on the whole
  stream raises "Extra data". Parse with `json.JSONDecoder().raw_decode(text)[0]`, or
  `json.loads(out.splitlines()[0])`, or call the API directly when a script depends on it.
- **`cu tasks --json` returns `{count, items}`, not `{tasks}`**, and it hides Closed
  tasks unless `--closed` is passed, so an empty `items` is not proof the list is empty.

## `description` does not render markdown, `markdown_content` does

Measured 24 Aug 2026 building demo b-roll. `POST /api/v2/list/{id}/task` and
`PUT /api/v2/task/{id}` both accept `description`, and both store it as **plain text**: a body full
of `**bold**`, `---` and a `| table |` renders on screen as literal asterisks, three hyphens and a
row of pipes. There is no error and the call returns 200. The field that renders is
**`markdown_content`**, same endpoints, same shape:

```bash
curl -s -X PUT "https://api.clickup.com/api/v2/task/<taskId>" \
  -H "Authorization: $TOK" -H 'Content-Type: application/json' \
  -d '{"markdown_content":"### Heading\n\n| a | b |\n| --- | --- |\n| 1 | 2 |"}'
```

It matters most for anything that will be screenshotted or read by a person rather than a script,
which is exactly when nobody thinks to check. Create with `description` if the body is one
paragraph; use `markdown_content` the moment it has a heading, a list or a table in it.

## Two writes that fail on their first honest attempt

Both verified 24 Aug 2026 while building a demo list.

**A dropdown value is an option index or a uuid, never the label.** `cu task field set <id>
--field <fieldId> --value "Email sent"` returns
`400 {"err":"Value must be an option index or uuid","ECODE":"FIELD_011"}`. Pass the
zero-based position instead, so the third option is `--value 2`. Reading the ids back is
harder than it should be: `cu fields list --json` flattens `type_config.options` to a
display string (`"Queued | Email sent | Replied"`), so the ids are not in the CLI's output
at all. Count the positions off that string, or call `GET /api/v2/list/{id}/field` when a
script needs the uuids.

**`--columns-json` must not list `name`.** ClickUp always renders the Name column, so
including `{"field":"name"}` creates a second one. The view then draws a duplicate empty
Name header and **every later header is offset by one column**, which reads as the custom
fields having no values when the values are simply sitting under the wrong labels. List
only the fields after Name:

    cu view create --list <id> --name Nurture --type list \
      --group-by "cf_<fieldId>" \
      --columns-json '{"fields":[{"field":"cf_<dateFieldId>","width":200,"hidden":false},{"field":"assignee","width":140,"hidden":false}]}'

**`cu view delete` prompts and is not idempotent in a pipeline.** It asks
`Delete <id>? (y/N)` on stdin; a script that does not answer leaves the view alive while
the next command in the same line still runs, which is how one run ended up with two views
of the same name. Pipe `yes |` into it, and re-read the list afterwards.

**A `403 FIELD_220` on `cu fields create` is the wrong token, not a missing capability.**
Measured 24 Aug 2026 creating a `url` field on a marketing list: the default priority-1
team token answers
`403 {"err":"User does not have permission to create fields in this location","ECODE":"FIELD_220"}`,
and the same request on the priority-2 owner token answers `200` with the new field. The
message reads as a plan limit or a UI-only surface and sent one run off to the browser skill
for nothing. **Custom-field writes go on the owner token**; `cu` has no flag to pick one, so
read it out of `~/.config/clickup/config.json` (`tokens[1].token`) and call the REST endpoint
directly:

```bash
OWNER=$(python3 -c "import json;d=json.load(open('$HOME/.config/clickup/config.json'));p=d['profiles'][d['defaultProfile']];print(p['tokens'][-1]['token'])")
curl -s -X POST "https://api.clickup.com/api/v2/list/<listId>/field" \
  -H "Authorization: $OWNER" -H 'Content-Type: application/json' \
  -d '{"name":"Brief","type":"url"}'
```

The config is **profile-shaped**: `{"defaultProfile": "...", "profiles": {"<name>": {"tokens": [...]}}}`.
A path reading `d['tokens']` raises `KeyError: 'tokens'`, which reads as a broken config rather than
as a wrong path.

**A field created on a list lives on that list only. `POST /v2/space/{spaceId}/field` creates it
once for the whole space**, which is what you want whenever more than one list has to carry the same
field and be read by one automation. It is undocumented and returns the normal `{"field": {...}}`
body; measured 26 Aug 2026 building a per-client billing space, where a per-list field would have
meant a different uuid per client and an automation that could not address them.

```bash
curl -s -X POST "https://api.clickup.com/api/v2/space/<spaceId>/field" \
  -H "Authorization: $OWNER" -H 'Content-Type: application/json' \
  -d '{"name":"Heures à facturer","type":"number"}'
```

The same endpoint takes a `drop_down` with `type_config.options` (`name`, `color`, `orderindex`) and
a `currency` with `type_config.currency_type`.

**Merging two custom fields that grew up in different spaces is a real ClickUp feature and it is
plan-gated.** The Custom Field Manager carries a Merge action, available on **Business Plus and
Enterprise only**, and the public API has no equivalent at any plan. The constraints are: both
fields must be the **same type**, at most **three** fields per merge, and a **25,000 task** ceiling.
After the merge ClickUp rewrites the filters, sorting, grouping, column settings and Form views
that referenced either field, which is the part a hand-rolled copy-and-delete would silently lose.
So the merge belongs in `clickup-browser` against the Field Manager, never in a script that copies
values across and deletes the loser. Check the plan before promising it.

**Assigning a guest to a task they cannot see returns `200` and assigns nobody.** Measured
26 Aug 2026 loading a demo workspace: `cu task update <id> --add-assignee <guestId>` answered
success on all 135 tasks, and the guest came out assigned only on the one list they had been
shared into. The rest stayed unassigned, which showed up two steps later as a Workload row at
3 points instead of 25 and an `Unassigned` row holding the difference. A member sees every list
in the workspace and never hits this; a guest sees only what was shared. Grant the access first,
then assign:

    cu list members <listId>                                   # who can actually be assigned
    cu guest share <guestId> --folder <folderId> --permission edit

**Read the assignment back through the thing that consumes it**, not through the exit code. The
write is silently partial, so `cu tasks --list <id>` with an empty assignee column is the only
proof.

**`cu task members` answers who can SEE a task. `cu task assignees` answers who is on it.**
The two read alike and one run built its `--remove-assignee` list from the first, so the
previous owner survived on 15 of 157 tasks while the new one was added on top, and the
Workload view went on counting people who had been taken off the board. `cu task assignees
<id>` (2.6.0, added 26 Aug 2026 for exactly this) returns the real list with ids.

**An AI agent assignee carries a NEGATIVE user id.** `Jony - Invoice follow up AI` is
`-40578317`. A parser that tests `line[0].isdigit()` to find id rows
drops it in silence, so the agent stays assigned and the task keeps two owners.
