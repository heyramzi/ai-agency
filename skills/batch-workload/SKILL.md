---
name: batch-workload
description: The BATCH planning method for ClickUp. Reschedule, assign, and point a workspace into clean one-week batches with a per-person capacity cap. Use when a board looks overloaded or messy, when tasks are overdue or unassigned, when someone asks to "rebalance the workload", "clean up the batch", "plan this week", or "spread the team's tasks", or when setting up the BATCH/Points fields on a new space.
---

# BATCH Workload Planning

The BATCH method turns a pile of ClickUp tasks into a readable weekly plan. Every scheduled task belongs to a one-week batch, carries a point value, and is owned by one person. A clean board is one where each person's week sits at or under capacity and nothing is silently overdue or unassigned.

Announce at start: "I'm using the batch-workload skill."

## The Method

### BATCH field (dropdown)

Each task gets exactly one batch. Options, in order:

| Batch | Meaning | Dates written on the task |
|-------|---------|---------------------------|
| Previous | Done or past work, kept for history | left as-is |
| This Week | Committed for the current week | start = Monday, due = Friday of this week |
| Next Week | Committed for next week | start = Monday, due = Friday of next week |
| Later | The week after, soft commitment | start = Monday, due = Friday two weeks out |
| Maybe / Someday | Backlog, no week assigned | dates cleared |

The last bucket is named `Maybe` on some spaces and `Someday` on others. Read the field options before writing, do not assume the label.

### Batch to dates rule

Every task in a batch shares the same start and due dates. A batch is one week of work, Monday through Friday. Set dates date-only (`start_date_time: false`, `due_date_time: false`). This keeps the deadline as the single source of truth and the batch derived from it. The in-app version of this derivation lives in `app/src/components/features/tasks/batch.ts` (`deadlineForBatch`, `batchForDeadline`).

### Points field (dropdown)

Effort, not hours. Stored as a dropdown with options `1`, `2`, `3` (orderindex 0/1/2). Rough guide:

- 1 point: quick task, review, plan, gather, finalize, export, short clip or cut
- 2 points: standard deliverable, demo, testimonial, tour, commercial
- 3 points: large or multi-part deliverable, keynote, conference recap, highlight reel, full edit

### Capacity rule

Target per person per week is **15 points**. Fill This Week and Next Week up to 15 points each, then overflow into Later, then the backlog bucket.

Never bump in-progress work. Tasks already `in progress` stay in This Week even if that pushes the person over 15. A week's in-progress load can exceed 15, flag it, do not force-move started work. When a week is over capacity from not-started tasks, move the largest not-started tasks down a batch first.

## Rebalance procedure

1. **Scope.** Identify the space and its lists. Pull every task across the lists (include closed and subtasks). `cu lists --space <id>`, then `cu tasks --list <id>` or the v2 `GET /list/{id}/task` endpoint with `subtasks=true&include_closed=true`.
2. **Discover the fields.** `GET /list/{id}/field` returns the `BATCH` and `Points` field IDs and their option IDs for that workspace. Field IDs differ per workspace, always discover them, never hardcode across workspaces.
3. **Confirm the team.** List who is real via `cu list members <listId>`. Stray bot or automation accounts (for example "Invoice follow up AI", template placeholder users) get reassigned to real people.
4. **Plan, then show it.** Compute points, assignee, batch, and dates for every task. Print a person x batch table (count and points) and confirm it reads clean before writing anything. This is a bulk, hard-to-undo operation, so a dry run first is mandatory.
5. **Apply.** Set the BATCH option, the Points option, the dates, and the assignee per task. Closed tasks get BATCH = Previous only, leave their dates and owner alone. Throttle to stay under the ClickUp rate limit (100 requests per minute per token) and retry on 429.
6. **Verify.** Re-pull and confirm no active task is unassigned, unpointed, or undated, and that each person's This Week and Next Week sit at or near capacity.

`scripts/rebalance.mjs` is a ready script for steps 4 and 5. It reads a fetched task list, computes the plan, prints the table on a dry run, and applies on `APPLY=1`. Edit the list IDs, field/option IDs, and team map at the top for the target workspace.

## Assignment logic

- Tasks in a review status (`client review`, `internal review`, `review`) route to the reviewer or owner.
- Planning tasks (plan, script, gather, storyboard, brief) route to the producer.
- Production and editing tasks spread across the editors by least-loaded greedy assignment.
- `in progress` tasks keep their current real owner; reassign only if the current owner is a bot or non-member.

## Known field references

Read the two field ids per workspace before the first write, and record them where
the script can find them. They are not the same object in two workspaces even when
they carry the same name.

A worked example, from a workspace where the two fields sit at different levels:
BATCH was workspace level and the only field `GET /team/{id}/field` returned, while
Points was **space level**, so it differed per space and had to come from
`GET /space/{id}/field`. Read both, per workspace, and never copy an id between them.

## Three things that make a correct write look broken

- **A dropdown value reads back as the option ORDERINDEX, a number, not the uuid.** BATCH is
  0 Previous, 1 This Week, 2 Next Week, 3 Later, 4 Maybe, and Points is 0/1/2 for 1/2/3. Previous is
  0, which is falsy, so `f.value ? ... : null` reports every Previous task as unbatched and every
  batched task as needing a batch. Writes still take the option uuid.
- **A date-only write comes back shifted.** ClickUp normalises it to midnight in the *workspace*
  timezone, so a UTC-midnight write reads back a few hours off. Compare on the calendar day
  (±12 hours), or a re-run rewrites every task and the script is never idempotent.
- **`GET /list/{id}/field` serves phantom field records.** Two lists reported their
  points on `df0c5226…` and `480ae8a3…`, neither of which the space serves; the same values were on
  the real space field the whole time. `GET /team/{id}/field` and `GET /space/{id}/field` are the
  authority. Do not migrate values off a phantom, there is nothing there to migrate.

## Views

A `list`, `board` or `table` view with `grouping.field` of `none` renders as one undifferentiated
column. Group it on `status`, or on the BATCH field for a batch view. `form`, `calendar`, `embed`,
`conversation`, `dashboard` and `location_overview` views have no grouping by design; leave them.
`PUT /view/{id}` **replaces** rather than merges, so send name, type, divide, sorting, filters,
columns and settings back with the change or the rest of the config is wiped.

## Related

- The AI Project Manager (Make scenario 6005663) applies this same method to a single task on the `ai triage` tag: it reads the company memory Team Directory and sets assignee, batch, points, and dates. This skill is the manual, workspace-wide counterpart.
- `agency-ops` skill (`references/team.md`, `references/processes.md`) holds the async-first team operating context this method sits inside.
- `clickup-cli` skill and the `cu` binary for the read and write commands.
