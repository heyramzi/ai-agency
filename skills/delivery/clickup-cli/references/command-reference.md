# cu command reference

Every command the CLI exposes, with its flags and the shape it returns. `SKILL.md` holds setup, the output modes and the traps; this is the lookup table.

## Command Reference

### Hierarchy Navigation

| Command                                                 | Purpose                  |
| ------------------------------------------------------- | ------------------------ |
| `cu workspaces [--json]`                           | List all workspaces      |
| `cu spaces [--json] [--team <id>]`                 | List spaces in workspace |
| `cu folders --space <id> [--json]`                 | List folders in a space  |
| `cu lists [--space <id>] [--folder <id>] [--json]` | List lists               |
| `cu hierarchy [--json] [--team <id>]`              | Full workspace tree      |
| `cu members [--json] [--team <id>]`                | List team members        |

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
```

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
[`references/comment-authoring.md`](references/comment-authoring.md).

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
cu fields create --list <id> --name "X" --type drop_down --options-json '["A","B"]'
cu fields update <fieldId> --list <id> --name "New name"
cu fields update <fieldId> --list <id> --add-options "Q3 2026,Q4 2026"
cu fields update <fieldId> --list <id> --rename-options "Declaracao mensal=Declaração mensal"

cu task field set <taskId> --field <fieldId> --value <optionId|index>
cu task field unset <taskId> --field <fieldId>
```

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
