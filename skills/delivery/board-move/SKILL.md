---
name: board-move
description: Move a ClickUp task to a new status (todo, in-progress, in-review, done). Reads the project's .tasks/config.json for the list and status map; resolves the task by ID. Use when changing a board task's status by ID, when /board-move is invoked, or when a task needs moving without the full /board-start or /board-ship workflow.
argument-hint: <task-id> <status>
allowed-tools: Bash
---

# /board-move

Move a ClickUp task to a new status using the `cu` CLI. The task ID alone identifies the task. No project, board, or item-ID resolution is needed.

## Usage

```
/board-move <task-id> <status>
```

- `task-id`: ClickUp task ID, with or without the `CU-` / `#` prefix (e.g. `CU-86c98x5e6`, `#86c98x5e6`, or `86c98x5e6`).
- `status`: One of the friendly aliases `todo`, `ready`, `in-progress`, `in-review`, `done`, or any literal ClickUp status name.

If no arguments are provided, ask the user for them before proceeding.

## Prerequisites

The `cu` CLI (ClickUp CLI, alias `clickup`) must be installed and authenticated. It reads its token from `~/.config/clickup/config.json` or the `CU_API_TOKEN` / `CU_TEAM_ID` env vars. Verify with `cu status`. If missing or unauthenticated, stop and tell the user to run `cu init`. Do not guess a token.

## Steps

### 1. Parse arguments

Extract `<task-id>` and `<status>`. If either is missing, stop and ask.

Normalize the task ID: strip a leading `CU-` or `#` prefix. Normalize the status: lowercase, trim.

### 2. Resolve the status name from project config

Read `.tasks/config.json` at the repo root. Map the friendly alias to a literal ClickUp status via its `status_map` (the names are list-specific, so the config is authoritative):

```jsonc
// .tasks/config.json (example — Client Glance)
"status_map": { "todo": "Open", "ready": "ready", "in-progress": "in progress", "in-review": "review", "done": "Closed" }
```

If `.tasks/config.json` is absent or has no `status_map`, fall back to these generic defaults: `todo`→`to do`, `in-progress`→`in progress`, `in-review`→`in review`, `done`→`complete`.

Any value not found in the map is treated as a literal ClickUp status name and passed through unchanged.

### 3. Confirm the task exists

```bash
cu task get <TASK_ID> --json
```

`cu` prints the JSON object on the first line followed by a `help[]` footer. Parse only the JSON (e.g. `cu task get <id> --json | grep -m1 '^{'`). If it fails, report "Task `<task-id>` was not found." and stop. Note the current `.status` to report before/after.

### 4. Update the status

```bash
cu task update <TASK_ID> --status "<STATUS_NAME>" --json
```

Returns `{ id, name, status }` with the new status. If `cu` errors because the status does not exist in the task's list, surface the error and tell the user the name did not match any status in that list.

### 5. Report

Output: "Moved `<task-id>` (<task name>) to <new status>."

## Error handling

| Situation | Response |
|---|---|
| No arguments provided | Ask the user for task ID and status |
| CLI missing / unauthenticated | "The cu CLI is not authenticated. Run `cu init` or set `CU_API_TOKEN`." |
| Task not found | "Task `<task-id>` was not found." |
| Status not valid in the task's list | Surface the error; tell the user to use a status from `.tasks/config.json` status_map or the list's actual statuses |
| `cu` command fails otherwise | Surface the error output and stop |

## Notes

- ClickUp is the single source of truth for task status. GitHub board moves are not used, see `.tasks/config.json`.

## Related: closing the loop from GitHub automatically

To move a task to Done when its work merges on GitHub, you do not need this skill, ClickUp's GitHub integration handles it:

1. **Commit / PR message status tag** (no automation): include the task ID and target status with no space, `CU-86c98x5e6[Closed]`. ClickUp sets the status when it ingests the commit or PR.
2. **GitHub automation** (in ClickUp): trigger **GitHub → Pull Request Merged**, action **Change status → Closed**. Use **Branch Merged** if you merge without PRs. (There is no "Issue Closed" trigger.)

Both routes require the repo to be linked to the task's Space (App Center → GitHub → Settings → repo → Add Space), and accept any valid id format: `CU-{task_id}`, `#{task_id}`, or a custom task id.
