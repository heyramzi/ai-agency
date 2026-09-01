# cu command reference

Every command the CLI exposes, with its flags and the shape it returns. `SKILL.md` holds setup, the output modes and the traps; this is the lookup table.

## Command Reference

### Profiles, and the shorthand for IDs

**No command needs an API key on the command line.** A profile bundles its
tokens with the workspace they point at; `-p <name>` picks one for a single run,
`CU_PROFILE` for a shell, `cu profile use` for good.

```bash
cu profiles                       # which exist, which is active
cu -p personal tasks --list 901   # one run against another account
cu profile add work --token pk_... --team <team-id> --also-token "me:pk_..."
```

`--also-token name:pk_...` builds the fallback chain: a 401 on the first token
retries with the next. That is what makes a shared team token and a personal one
cover each other, and `cu bulk *` walks the chain per task.

**Every ID argument takes four shorthands**, and they are profile-scoped:

| Form | Means |
| --- | --- |
| `3` | row 3 of the last task listing (`cu tasks`, `cu sprint`) |
| `this` or nothing | the active task from `cu start` |
| `@alias` | a favourite (`cu favorite add task <id> bug`) |
| `sprint:current` | the current sprint's list, wherever a list ID goes |

The `#` column and `--pick` only appear on a TTY. Piped or driven by an agent
the rows are identical minus the column, so parsers never see a moving field.

**Short IDs are rewritten by every listing.** `cu tasks --list A` then
`cu tasks --list B` then `cu done 3` closes the third task of B. Re-list before
trusting a number you did not just see.

### Sprints

`cu sprint` and `cu sprints` find the folder whose name carries "sprint",
"iteration", "cycle" or "scrum", then the list whose dates cover today. No
match: pin one with `cu favorite add sprint-folder <folderId> sprints`. Between
sprints it picks the next to start; after the last, the most recent to end.

### Bulk edits

```bash
cu bulk status review --tasks 1,2,5
cu bulk move --list sprint:current --tasks @bug,86cb9uff6
```

Each row reports `ok` or `failed: <reason>` and the batch always finishes; the
exit code is non-zero if any row failed. Never a silent partial write.

### Hierarchy Navigation

| Command                                                 | Purpose                  |
| ------------------------------------------------------- | ------------------------ |
| `cu workspaces [--json]`                           | List all workspaces      |
| `cu spaces [--json] [--team <id>]`                 | List spaces in workspace |
| `cu folders --space <id> [--json]`                 | List folders in a space  |
| `cu lists [--space <id>] [--folder <id>] [--json]` | List lists               |
| `cu hierarchy [--json] [--team <id>]`              | Full workspace tree      |
| `cu members [--json] [--team <id>]`                | List team members        |
| `cu folder move <id> (--space <id> \| --parent-folder <id>)` | Move or nest a folder |

**`folder move` is the only way to re-parent a folder.** `folder update` renames and
nothing else. `--parent-folder` nests the folder as a subfolder and wins over `--space`;
it needs Subfolders enabled for the workspace, and ClickUp rejects the call otherwise.
Add `--type-map-json '{"<srcTypeId>": destTypeId}'` when the destination lacks a task
type the folder uses, or the move 400s.

**`cu hierarchy` is not the workspace.** It walks only the spaces the token owns, so
a space reached through folder sharing is absent and `GET /space/{id}` on it 401s. On
17 Aug 2026 one workspace's `hierarchy` printed 5 of 8 spaces and missed 636 tasks,
the CRM space among them; `cu shared` names some of their lists but no spaces. Never scope a
workspace-wide sweep off it. `GET /team/{id}/task?page=N&subtasks=true` returns every
task the token can see, shared ones included, and is the only reliable sweep. It is a
paged search index though, so counts drift between calls: verify a write per task.

### Tasks

**List & Search**:

```bash
cu tasks [--list <id>] [--assignee <ids...>] [--status <statuses...>] [--closed] [--subtasks] [--page <n>] [--json]
```

**Single Task**:

```bash
cu task get <taskId> [--json]           # Full task details
cu task create --list <id> --name "..." [options]
cu task update <taskId> [options]
cu open <taskId>                        # Open in browser
cu task estimate set <taskId> --estimate <userId>:<duration>   # per-assignee estimate
```

**`--time-estimate` and `task estimate set` are different fields.** `task update
--time-estimate 6h` writes the task's single total. `task estimate set --estimate
183:4h --estimate 204:2h` writes ClickUp's per-assignee estimates and merges into what
is already there; `--replace` drops every assignee you did not name. `unassigned` is a
valid user ID.

**The user must already be assigned to the task**, or ClickUp answers a bare
`400 Invalid Request` with no hint. Run `cu task update <id> --add-assignee <userId>`
first. The endpoint is Business plan and above, caps at 10 estimates per call, and
`unassigned` is the one exception to the assignment rule.

**Create options**: `--description <text>`, `--description-file <path>`, `--markdown`, `--status`, `--priority` (urgent/high/normal/low), `--assignee <ids...>`, `--tag <tags...>`, `--json`

**Update options**: `--name`, `--description <text>`, `--markdown`, `--status`, `--priority`, `--add-assignee <ids...>`, `--remove-assignee <ids...>`, `--json`

**`--markdown` is a boolean, not a value flag.** It only says "treat the
description as markdown"; the content always goes in `--description`. Writing
`--markdown "$(cat body.md)"` is accepted silently and creates the task with an
**empty** description, because the body is consumed as the flag's value.
`--description-file` exists on `create` only, not on `update`.

```bash
cu task create --list <id> --name "..." --markdown --description "$(cat body.md)"
cu task update <taskId> --markdown --description "$(cat body.md)"   # no --description-file here
```

**`task get --json` omits the description entirely** and the plain text output
**truncates** it with a `... (truncated)` marker, so editing from either silently
deletes everything past the cut. `--markdown` prints the full raw description and
nothing else, which is what an edit-in-place needs:

```bash
cu task get <taskId> --markdown > body.md      # full, untruncated
cu task update <taskId> --markdown --description "$(cat body.md)"
```

### Comments

| Command                                                          | Purpose            |
| ---------------------------------------------------------------- | ------------------ |
| `cu comments list <taskId> [--json]`                        | List task comments |
| `cu comments add <taskId> --text "..." [--notify] [--json]` | Add a plain-text comment |
| `cu comments add <taskId> --from <file.json>`               | Add a formatted comment |

**`--text` is plain text and ClickUp renders it verbatim.** No headings, no bold, no
lists, and every newline you typed becomes a hard break in the reader's width. Markdown
posted this way arrives with `##` and `**` sitting in it as literal characters, wrapped
mid-sentence on every line. Use `--text` for one short sentence and nothing else.

Anything with structure goes through `--from`, which takes a **Quill Delta** body:
inline formatting rides on the text op, line formatting rides on the trailing newline.
Never hard-wrap a paragraph. Full format, the op-builder helpers, how to delete a
comment you already posted, and the description `--markdown` trap:
[`references/comment-authoring.md`](comment-authoring.md).

### Time Tracking

```bash
cu time [--start-date <ms>] [--end-date <ms>] [--assignee <id>] [--json]
```

### Views

```bash
cu views list --space <id>             # Views on a space
cu views list --folder <id>            # Views on a folder
cu views list --list <id>              # Views on a list

cu view get <viewId>                   # Full details (columns, filters, grouping)
cu view create --list <id> --name "X" --type board
cu view update <viewId> --name "New Name"
cu view update <viewId> --columns-json '{"fields":[{"field":"assignee","hidden":false}]}'
cu view delete <viewId> [--yes]
```

System views (IDs like `4-SPACEID-28`) cannot be deleted. Only user-created views (IDs `8cbypq9-*`).

**A ClickApp that is off eats the value in silence.** `POST /task` accepts
`priority` on a space where the Priorities ClickApp is disabled, stores it, and
returns it on every read, so the CLI and the API both look correct. The web app
shows no flag and a view grouped on it puts every task under "No Priority", which
reads like the grouping is broken rather than the space. The same holds for Points,
Sprints and Milestones. Read the switches before you blame the view:

```bash
curl -s -H "Authorization: $TOKEN" "https://api.clickup.com/api/v2/space/<id>" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['features'].keys())"
```

A missing key means the ClickApp is off, not that it defaults to on. Turn it on and
the values that were already stored appear at once, with no re-write of the tasks:

```bash
curl -s -X PUT -H "Authorization: $TOKEN" -H "Content-Type: application/json" \
  -d '{"features":{"priorities":{"enabled":true}}}' \
  "https://api.clickup.com/api/v2/space/<id>"
```

A custom field column needs its ID prefixed `cf_` (matching `groupBy`'s format), e.g. `{"field":"cf_d3ae6727-a428-42f8-8361-94a2d448e818","hidden":false}`. The bare field ID 404s with `"View Not Found"`, which reads like the view itself is missing rather than a field-reference format error. Built-in fields (`assignee`, `status`, `priority`, `dueDate`, ...) take no prefix.

### Custom Fields

```bash
cu fields list --list <id>                          # Fields + their dropdown options
cu fields list --list <id> --task-types             # + the task types each field is scoped to
cu fields folder|space <id> --task-types            # same at the folder / space level
cu fields workspace --task-types
cu fields create --list <id> --name "X" --type drop_down --options-json '["A","B"]'
cu fields update <fieldId> --list <id> --name "New name"
cu fields update <fieldId> --list <id> --add-options "Q3 2026,Q4 2026"
cu fields update <fieldId> --list <id> --rename-options "Declaracao mensal=Declaração mensal"

cu task field set <taskId> --field <fieldId> --value <optionId|index>
cu task field unset <taskId> --field <fieldId>
```

Reading, deduplicating and deleting fields across a whole workspace is four more
commands, on the private API (`cu net capture` first):

```bash
cu fields all [--type drop_down] [--level workspace|space|folder|list]
cu fields duplicates [--loose]                      # groups near-twins, survivor first
cu fields merge --into <keepId> --from <id,id> --dry-run
cu fields delete <fieldId> --list <id>              # or --folder / --space
```

The merge moves every task value onto the kept field server-side and cannot be
undone. Workflow, refusal codes and what a merge breaks: the
`clickup-field-merger` skill.

Fields ARE editable: `PATCH /api/v2/field/{id}` is the only verb the route
allows (`PUT`/`POST` return 405, which reads like "not supported" and is why
this was long assumed UI-only). The endpoint **replaces** `type_config` instead
of merging it. A drop_down sent without its options is rejected (`FIELD_022`),
and one sent with a subset silently deletes the rest along with every task value
pointing at them. `fields update` exists so you never hand-roll that: it reads
the current options, carries each surviving option's `id` through, and sends the
full array. Reach for raw curl only if you really want options destroyed.

Running out of dropdown options is the usual cause of a half-empty field. Check
the option list before concluding the values were never filled in.

**A field can be scoped to specific custom task types, and then it is invisible
on every other type.** `--task-types` asks for the field's `applied_objects` and
names the types; a field every type carries prints `all`. A scoped field is
missing from `cu task get <id> --fields` on a task of another type, and
`task field set` answers 400 rather than saying the field does not apply. So a
value that will not stick is a task-type mismatch as often as a bad option id:
read the scope first, and change the type with
`cu task update <id> --custom-item <typeId>` (`cu workspace task-types` lists
them) if that is the real fix.

**`fields list` prints option labels, not option ids, and `task field set` will not
accept a label.** A dropdown takes an option id or its orderindex; a `labels` field
takes option **ids only** (`FIELD_158` on anything else, including an index). Read the
ids straight off the API, then set:

```bash
TOKEN=$(python3 -c "import json;c=json.load(open('$HOME/.config/clickup/config.json'));t=c['tokens'];print(t[0]['token'])")
curl -s -H "Authorization: $TOKEN" "https://api.clickup.com/api/v2/list/<listId>/field" \
  | jq -r '.fields[] | select(.name=="Socials") | .type_config.options[] | "\(.orderindex) \(.id) \(.name // .label)"'
cu task field set <taskId> --field <fieldId> --json-value --value '{"add":["<optId>","<optId>"]}'
```

Watch the orderindex when a dropdown's labels are numbers: `🔢 Points` options read
`1 | 2 | 3`, so `--value 1` sets **2 points**, not 1.

**Dates want epoch milliseconds everywhere, including `task create`/`task update`.** A
`--start-date 2026-09-14` is accepted without error and lands on the wrong day (it came
back as start Sep 7 / due Sep 11 on 2026-08-08). Date custom fields reject the string
outright (`FIELD_017`). Compute the epoch first, and pair it with
`--start-date-time false` / `--due-date-time false` (or `--all-day` on a custom field)
for a date-only value:

```bash
MS=$(python3 -c "import datetime;print(int(datetime.datetime(2026,9,14,tzinfo=datetime.timezone.utc).timestamp()*1000))")
cu task update <taskId> --start-date $MS --start-date-time false --due-date $MS --due-date-time false
```

Read the dates back after writing them. That is how the wrong-day bug above surfaced.

### Tags

Tags are space-scoped: a tag must exist in the space before a task there can carry
it, and every tag verb takes the **name**, never an id.

```bash
cu tags --space <id> [--json]                  # list a space's tags
cu tag create --space <id> --name "🗑️ delete" --fg "#ffffff" --bg "#e74c3c"
cu tag update "old name" --space <id> --name "new name" --fg "#ffffff" --bg "#e74c3c"
cu tag delete "tag name" --space <id>          # strips it from every task in the space
cu task tag add <taskId> "🗑️ delete"
cu task tag remove <taskId> "🗑️ delete"
```

`tag update`'s `--fg`/`--bg` carry defaults, so a rename that omits them repaints the
tag black. Pass the existing colours through. A tag write also bumps the task's
`date_updated`, which erases any staleness you were measuring.

Every tag write needs the owner-token override; a member token has no `manage_tags`.

### Docs (ClickUp Docs v3 API)

| Command                                                | Purpose                            |
| ------------------------------------------------------ | ---------------------------------- |
| `cu docs list [--json] [--workspace <id>]`        | List docs in workspace             |
| `cu docs info <docId> [--json]`                   | Doc metadata (parent, visibility)  |
| `cu docs pages <docId> [--json]`                  | List pages in a doc (with nesting) |
| `cu docs get <url\|pageId> [--doc <id>] [--json]` | Get page content                   |
| `cu docs create <docId> --name "..." [options]`   | Create new page                    |
| `cu docs update <url\|pageId> [options]`          | Update page content                |

**Doc create/update options**: `--content <text>`, `--file <path>`, `--name <title>`, `--mode replace|append|prepend`, `--parent <pageId>`, `--workspace <id>`, `--json`

Supports stdin piping:

```bash
cat file.md | cu docs update <pageId> --doc <docId>
```

Accepts full ClickUp URLs or page IDs for `get` and `update` commands.

**A Doc IS a view, and that is how you rename or delete one.** The docs API has no
rename and no delete: `PUT`/`DELETE` on `/v3/workspaces/{ws}/docs/{docId}` both answer
`405 method not allowed`, and pointing a page write at the doc id answers `403`. The doc
id is also a view id (`cu view get <docId>` returns `"type": "doc"`), so the v2 view
endpoints do both jobs (verified 25 Aug 2026):

```bash
cu view update <docId> --name "New Doc Title"   # rename a Doc
cu view delete <docId> --yes                    # delete a Doc
```

The doc TITLE lives there; page titles stay on `cu docs update <pageId> --name`.

**Never write a markdown table into a Doc page.** ClickUp renders it as a real table
block that is unreadable on mobile; use a bulleted list with a bold lead-in.
See `references/doc-authoring.md`.

### Beyond the public API (private frontdoor)

Needs a session from `cu net capture`; the `pk_` token does not work here.

| Command                                          | Purpose                                     |
| ------------------------------------------------ | ------------------------------------------- |
| `cu template center [--kind <k>]`           | Every saved template, by kind               |
| `cu dashboards`                             | Every dashboard in the workspace            |
| `cu statuses [--grep <p>]`                  | Every status defined anywhere               |
| `cu agents`                                 | Every Super Agent                           |
| `cu agents get <agentViewId>`               | One agent, `agent_config` included          |
| `cu automations --list <id> [--active <a>]` | Automations on a list                       |
| `cu automations count <listId>`             | Active and inactive counts                  |
| `cu automations catalog [--grep <p>]`       | Every automation trigger and action         |

Template kinds use ClickUp's internal names: `task`, `subcategory` (list),
`project` (folder), `doc`. `--active` takes `ACTIVE`, `INACTIVE` or `ALL`.

### Private API capture (`cu net`)

The public API has no templates, automations, dashboards, space statuses or
Workload capacity. These commands record the calls ClickUp's own web app makes to
its private frontdoor API, then replay them without a browser. Full workflow and
guard rails: the `clickup-browser` skill.

| Command                                              | Purpose                                        |
| ---------------------------------------------------- | ---------------------------------------------- |
| `cu net capture <url> [--boot N]`                | Reload and record the whole boot sequence      |
| `cu net record [url] [--seconds N] [--settle N]` | Open a URL, inject the recorder, log while you click |
| `cu net drain [--out <file>]`                    | Append everything captured since the last drain |
| `cu net summarize <log> [--method M] [--grep P]` | Fold the log into distinct endpoints           |
| `cu net show <log> --index N [--secrets]`        | One call in full: headers and both bodies       |
| `cu net auth [--from <log>]`                     | Show the stored session headers and their expiry |
| `cu net replay <log> --index N [--allow-write]`  | Re-issue a recorded call from the terminal      |

**Recording only captures what happens while it runs.** The page must be clicked
through during the window, or the log comes back empty.

**`net replay` refuses writes by default.** POST, PUT, PATCH and DELETE need
`--allow-write`, because a replay is a real mutation on a live workspace. Read the
body with `net show` first.

**The captured bearer is the ~48h frontdoor JWT.** `net auth` prints its true `exp`
and `net replay` stops once it passes. Re-record to refresh; nothing auto-renews.

## Sharing a private object with a member

The v2 API cannot do it: there is no `POST /list/{id}/member`, and the guest endpoint needs
Enterprise. The **v3 ACL endpoint** can, with an ordinary personal `pk_` token, and it is wrapped:

```bash
cu acl set <objectId> --team <wsId> --object-type list --user <id> --permission edit
```

Underneath: `PATCH /api/v3/workspaces/{ws}/{object_type}/{object_id}/acls` with
`{"entries":[{"kind":"user","id":"<userId>","permission_level":4}]}`.

- **`kind` is required** (`"user"` or `"group"`). Omitting it returns the misleading
  `ACL_029 "Invalid group or user ID"`.
- `id` is a string. `permission_level` is 1 read, 3 comment, 4 edit, 5 create, and **null removes
  access**.
- `object_type` covers `list`, `folder`, `space`, `doc`, `view`, `task`, `dashboard` and more.
- PATCH **merges** entries rather than replacing them. Assigning a user to a task requires that they
  already have list access, or v2 answers `ITEM_087`.

**Making a list `private: true` drops workspace admins' implicit access**, the owner included, and
each one has to be re-granted explicitly. Read effective viewers with v2 `GET /list/{id}/member`;
the v3 `/acls` path is PATCH-only and GETs 405. A list showing nearly every workspace member is not
private.

Two shell notes for zsh: `UID` is read-only, and an unquoted `$VAR` does not word-split, so use
`${=VAR}`.

**Recurring tasks are UI-only.** The API exposes no `recurring` field on a task, and there is no
bulk-recurrence UI either.

## Reading a task back without being lied to

- **`cu task get <id>` truncates the description** in pretty mode, ending in `... (truncated)`.
  `--markdown` gives the full raw body, and it is the only reliable way to verify a description
  write.
- **ClickUp strips literal `#` and `###` heading markers on markdown ingest**, so grepping a
  readback for `### Acceptance criteria` gives a false negative. Verify by `--markdown` round-trip
  and length, not by header grep.
- **Pipe auto-detection is unreliable**: a piped `task get` or `tasks` still prints the pretty
  table. Pass `--json` or `--markdown` explicitly when scripting.
- **`--json` omits `checklists`, subtasks and some relations.** Read those from
  `GET /api/v2/task/{id}` directly, where `checklists[].resolved` and `.unresolved` are integer
  counts and the items are in `checklists[].items[]`.
- Bulk-create a checklist with
  `cu task checklist create <id> --name "..." --items-json "$(... | jq -R -s 'split("\n")|map(select(length>0))')"`.

## Editing a view's filters

`PUT /api/v2/view/{id}` must echo back `name`, `type`, `grouping`, `divide`, `sorting`, `filters`,
`columns` and `settings`, or the omitted fields reset.

A filter entry takes the exact shape
`{"field":"assignee","op":"ANY","determinor":null,"idx":0,"values":[<userId int>]}`. **`values` must
be integers**: string values are silently dropped and the `fields` array comes back empty.
`determinor` and `idx` are required keys. Scalar props like `show_closed` persist fine; only
`fields` is picky.

**`GET /api/v2/view/{id}/task` does not reliably honour multiple AND'ed filter fields.** One
assignee filter works and returns the correct reduced count, but adding a second field makes the
endpoint ignore the first and return nearly everything. Apply one filter through the API and add the
rest in the UI. The endpoint paginates 30 per page, so loop until `last_page: true`.

The v3 view endpoints (`/api/v3/workspaces/{ws}/views/{id}`) return 404 and do not exist.

## The AI Notetaker's call docs are invisible to `cu`

Each call transcript is written as a **standalone doc named after the calendar event**, not as a
page appended to the curated calls doc. Those docs are owned by and private to the account that
sat in the meeting, while `cu` authenticates as the workspace's shared token and has no
`--token` or env override, so `cu docs list` and `cu docs pages` return a clean "not there" for
every fresh transcript. **Do not conclude a transcript is missing from a `cu` result.**

```bash
TOK=$(jq -r '.tokens[1].token' ~/.config/clickup/config.json)
curl -s -H "Authorization: $TOK" \
  "https://api.clickup.com/api/v3/workspaces/<team-id>/docs?limit=100" \
  | jq -r '.docs[] | "\((.date_created/1000|floor|strftime("%Y-%m-%d %H:%M")))  \(.id)  \(.name)"' | sort | tail
curl -s -H "Authorization: $TOK" \
  "https://api.clickup.com/api/v3/workspaces/<team-id>/docs/<docId>/pages" \
  | jq -r '.[] | "\(.name)\n\(.content)"'
```

Two shapes that produce false negatives: `date_created` is already a number and `strftime` needs an
integer, so `(.date_created/1000|floor)`; and the pages endpoint returns a **bare array**, not
`{pages: [...]}`.

The doc body carries Attendees, Overview, Key Takeaways, Next Steps and Key Topics, plus an `.mp4`
recording link. The attendees listed there are the real participants and can exceed the calendar
guest list.

