---
name: clickup-cli
description: "Use when interacting with ClickUp: reading tasks, updating statuses, managing docs, browsing hierarchy, or any ClickUp API operation via the CLI. Triggers on any ClickUp task or doc work."
---

# ClickUp CLI

Command-line tool for managing ClickUp tasks, docs, hierarchy, and time tracking.

## Setup

It is one global binary:

```bash
cu <command> [args]
```

There is no `clickup` alias; that name returns "command not found".
The install line for `cu` is handed out in **The Project Manager**, lesson 2, at
[skool.com/ai-agency-systems-3191](https://www.skool.com/ai-agency-systems-3191).
Every command below assumes it is on your PATH.

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
is one, so every tag write needs the override above (`cu tag create` returns
`401 ACCESS_016` in every space without it).

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

These authenticate with a captured browser session rather than the `pk_` token,
which the frontdoor rejects, so they need `cu net capture` to have run recently:
the session bearer is a ~48h JWT. Anything not yet wrapped can be recorded and
replayed with the rest of the `cu net` family. Workflow and guard rails live in
the `clickup-browser` skill.

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
OWNER=$(python3 -c "import json;print(json.load(open('$HOME/.config/clickup/config.json'))['tokens'][1]['token'])")
curl -s -X POST "https://api.clickup.com/api/v2/list/<listId>/field" \
  -H "Authorization: $OWNER" -H 'Content-Type: application/json' \
  -d '{"name":"Brief","type":"url"}'
```

**Merging two custom fields that grew up in different spaces is a real ClickUp feature and it is
plan-gated.** The Custom Field Manager carries a Merge action, available on **Business Plus and
Enterprise only**, and the public API has no equivalent at any plan. The constraints are: both
fields must be the **same type**, at most **three** fields per merge, and a **25,000 task** ceiling.
After the merge ClickUp rewrites the filters, sorting, grouping, column settings and Form views
that referenced either field, which is the part a hand-rolled copy-and-delete would silently lose.
So the merge belongs in `clickup-browser` against the Field Manager, never in a script that copies
values across and deletes the loser. Check the plan before promising it.
