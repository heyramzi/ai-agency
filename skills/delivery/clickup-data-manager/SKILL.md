---
name: clickup-data-manager
description: "Manages ClickUp data programmatically: stale task and view cleanup, demo workspace enrichment, bulk task creation and updates, and doc page name standardisation to 'Company - Type - Date'. Use when running bulk updates, deleting views, or when doc pages have messy names. For interactive CLI work see clickup-cli, for a read-only audit clickup-audit."
tags: [drives, clickup]
---

# ClickUp Data Manager

Scripted workspace management: cleanup, enrichment, bulk operations. Uses the REST API directly via curl or Python, not the `cu` CLI (which is for interactive use).

## Auth

API tokens are in `.env.local` files, one per workspace:

```bash
grep "CLICKUP_API_TOKEN" .env.local
# CLICKUP_API_TOKEN_OWNER=pk_...   # the personal workspace
# CLICKUP_API_TOKEN_TEAM=pk_...    # the team workspace
```

**The token decides the workspace.** Using the team token against a personal
workspace 401s on objects that plainly exist, which reads as a permission bug
rather than as the wrong token.
## API patterns and IDs

Request patterns (curl and Python bulk-script), the endpoint map for hierarchy,
task and view CRUD and the columns update format are all in
[references/api-reference.md](references/api-reference.md). Read
it before writing any call.

**Deletable views**: only user-created views (IDs like `8cbypq9-XXXXX`). System
views (`4-SPACEID-28`, `5-FOLDERID-28`, `6-LISTID-8`) return errors on DELETE. Skip them.

## List descriptions and the pin

`PUT /list/{id}` takes **`markdown_content`**, not `content`. Plain `content` is
stored verbatim and rendered literally, so `**bold**` reaches the buyer with the
asterisks on screen. Both fields read back as the flattened `content`, so a
plain-looking readback is not evidence the markdown failed. Open the list.

The pin that makes a description show at the top of the board is
`settings.is_description_pinned` on the list's **required** List view,
`6-{listId}-1`. That view is created lazily:

- `GET /list/{id}/view` returns `required_views.list: null` and
  `GET /view/6-{id}-1` 404s until a view change is *saved* in the browser.
- Opening the list does not create it. Neither does `POST /list/{id}/view`. That adds a second, duplicate "List" tab which then has to be deleted.
- Once it exists, `PUT /view/6-{id}-1` with the full view body (`name`, `type`,
  `grouping`, `divide`, `sorting`, `filters`, `columns`, `team_sidebar`,
  `settings`) and `settings.is_description_pinned: true` works, and is how to
  pin or unpin in bulk afterwards.

So the first pin on any list is one manual toggle: open the list, click the
description icon beside the name in the breadcrumb, flip **Pin this description
for added visibility**, close the modal, then click **Save view**. Skipping Save
view leaves the pin as unsaved local state and the required view is never
created.

Driving that toggle in a browser over many lists: the breadcrumb renders
collapsed and expands to the full path on hover, moving the description icon 50
to 200px right, so an element rect measured before the expansion points at the
chevron. Navigate, wait ~16s, hover the breadcrumb, wait 5s, poll the icon's
`getBoundingClientRect()` until stable across five reads, then click that. Check
`document.querySelectorAll('[role=dialog]').length === 1` before touching the
toggle. Synthetic `.click()` and full PointerEvent sequences never open the
modal; only a real click does.

## Writing markdown that renders

**ClickUp treats a single newline as a hard break**, in list descriptions, task
descriptions and doc pages alike. Prose wrapped at 80 or 90 columns in a source
file therefore arrives on screen broken mid-sentence, and it looks like a bug in
the copy rather than in the writer. Either keep every paragraph on one long line
in the source, or unwrap it on the way out: join a block's continuation lines,
and leave blank lines, headings, `---` and lines opening with `-`, `*`, `N.` or
`>` where they are. Write it once as a `reflow()` helper the builder calls on every body.

Everything else renders: headings, bold, italics, bullets, inline code,
blockquotes and horizontal rules. Tables are the exception.

**Task statuses are UI-only, at both levels.** `PUT /space/{id}` with a
`statuses` array answers 200 and changes nothing, and there is no list-level
equivalent at all. A list gets its own set through **Use custom statuses** in its
right-click › Task statuses dialog, where a status is renamed by clicking its
name, and typing a name then Enter both saves it and opens the next row. The
dialog stages the change: it hands back to the parent settings modal, so the
statuses only exist once **Save changes** is clicked there too. Read them back
from `GET /list/{id}` (`override_statuses: true`) rather than from a screenshot.

**The v3 docs endpoints 500 intermittently** on a page that writes fine on the
next attempt. Retry 5xx two or three times with a short backoff instead of
letting one page kill a whole build.

## Demo Workspace Cleanup Workflow

When asked to clean a workspace for demos:

1. **Fetch all tasks** per list with `include_closed=true`
2. **Identify stale** by pattern:
   - Single-char names (`d`, `e`, `ss`)
   - Generic tests (`TEST`, `hello`, `Hello`)
   - Celebrity names (Angelina Jolie, Brad Pitt, Britney Spears)
   - Obvious placeholders (`New Employee`, `John Smith` as only candidate)
   - Duplicate task names in same list
3. **Delete** stale tasks in bulk
4. **Enrich remaining** tasks with realistic descriptions
5. **Add new tasks** to lists with fewer than 5 tasks (especially Onboarding, Templates)
6. **Scan all views** across spaces/folders/lists
7. **Delete junk views**: unnamed, duplicate types on same parent, empty/broken
8. **Update column configs** on key views to show the most relevant fields

## Data Quality Standards for Demos

### Task names
- Position: `Job Title` (no prefix, title case)
- Time-Off: `Type — Employee Name` or `Type — Context`
- Expenses: `Item — Context` with amounts where relevant
- Employees/Talents: `First Last` (real-sounding, diverse names)

### Descriptions
Every task should have a description. 1-3 sentences covering:
- What it is / what the person does
- Key context (tech stack, scope, timeline)
- Any notable detail (budget, status reason, coverage plan)

### Dates
- Past dates (done/validated tasks): OK to keep realistic past dates
- Active tasks: use near-future dates (2-8 weeks out)
- Never leave `null` on tasks that logically need a due date

### Statuses
Match the list's status schema. Don't leave tasks in "to-do" if context implies they should be "in progress" or "validated".

---

## Doc Page Naming Cleanup

Standardizes ClickUp doc pages with inconsistent naming (emoji prefixes, auto-generated meeting names, mixed formats) to a scannable format.

Announce at start: "I'm using the clickup-data-manager skill, doc page naming mode."

### Naming convention

Format: `Company Name - Type - MM/DD/YYYY`

| Type      | Keywords to Detect                            | Example Output                       |
| --------- | --------------------------------------------- | ------------------------------------ |
| Discovery | `discovery`, `appel decouverte`, `decouverte` | `Acme Corp - Discovery - 11/15/2025` |
| Proposal  | `proposal`, `proposition`, `accompagnement`   | `Acme Corp - Proposal - 11/18/2025`  |
| Kickoff   | `kickoff`, `demarrage`, `startup`             | `Acme Corp - Kickoff - 11/20/2025`   |
| Demo      | `demo`, `presentation`                        | `Acme Corp - Demo - 11/22/2025`      |
| Clarity   | `clarity`, `session`, `follow-up`             | `Acme Corp - Clarity - 11/25/2025`   |

Fallback: If type cannot be determined, use `Meeting`. If no date found, omit date: `Company Name - Type`.

### Client/company name extraction

Fetch content via `clickup_get_document_pages` with `content_format: text/md`. Search in priority order:

1. Attendees section, Overview section, Transcript, filename in attachments
2. `{Company} x {your agency}` pattern in the title
3. Company name before the `-` separator
4. Contact name as fallback

Remove from names: emojis, `ClickUp` references, your own agency's name and any
`x {agency}` suffix, special chars (period, hyphen, times), extra whitespace.
Normalize to Title Case.

Date extraction: look for dates at end of name in `MM/DD/YYYY`, `DD/MM/YYYY`, or `YYYY-MM-DD` format.

### Execution flow

1. Fetch structure via `clickup_list_document_pages` (document_id + workspace_id from URL).
2. Identify pages: with `parent_page_id`, process direct children + sub-pages. Without, process all.
3. Read content via `clickup_get_document_pages` in batches of 8.
4. Analyze: detect meeting type from title keywords; extract company from content (preferred) or title; extract date.
5. Create rename plan listing before/after per page.
6. Execute via `clickup_update_document_page` in batches of 8; report progress.
7. Summary: count by type and report totals.

Edge cases: proposal sub-pages (children of discovery) keep their type. Multiple calls same client: date differentiates. Missing date: use `Type - Client`; never invent dates.

### Red flags

- Don't rename pages you didn't understand -- skip and note it.
- Don't change meeting types incorrectly (a proposal is not a discovery).
- Don't process root/container pages -- only rename actual meeting pages.

MCP tools used: `clickup_list_document_pages`, `clickup_get_document_pages`, `clickup_update_document_page`.
