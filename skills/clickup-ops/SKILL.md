---
name: clickup-ops
description: "Runs day-to-day ClickUp operations for your own workspace through the cu CLI. Use when planning the week, when turning a meeting or call into tasks, when triaging the board, when running batch updates, or on 'plan the week', 'operationalize this meeting', 'team workload'. For client workspace assessment see clickup-audit, for scripted bulk CRUD clickup-data-manager."
---

# ClickUp Ops

Three modes: **plan** (weekly triage), **orchestrate** (meeting to tasks), **ops** (ad-hoc updates and cleanup).

All operations go through the `cu` CLI. See `clickup-cli` skill for the full command reference.

Announce at start: "I'm using the clickup-ops skill -- [plan/orchestrate/ops] mode."

## The workspace map

Every mode below reads a table you keep here: the people, the lists and their ids.
Write it once and re-read it when the board changes, because a list id in a skill
goes stale the week somebody archives a folder.

| What | How to read it | Keep |
| --- | --- | --- |
| People | `cu members --json` | Name, id, role, what they own |
| Spaces and lists | `cu hierarchy --json` | The lists you actually plan from |
| Shared lists | `cu shared --json` | Anything reaching you through a folder share |

Skip 0-task lists when planning unless you are asked for them.

---

## Mode 1: Plan

Weekly triage and batch planning. Use at start of week, mid-week check-in, or before a team meeting.

Pull open tasks from all active lists via `cu tasks --list <id> --json`. Parse the first JSON line only (ignore trailing `help[...]` lines).

Classify each task:

| Bucket       | Rule                                                         |
|--------------|--------------------------------------------------------------|
| Overdue      | Due date in past, still open/in-progress                     |
| Stale        | In-progress, due >2 weeks past, or open with no due date     |
| Dead         | Untouched 90d+ -- out of scope here, hand to `clickup-stale-triage` |
| This week    | Due date falls Mon-Fri of current week                       |
| Unassigned   | No assignees                                                 |
| Blocked      | Status contains "blocked" or "waiting"                       |
| In progress  | Status "in progress", not overdue                            |

For large lists (Marketing Blog and Newsletter each carry 70-110 non-closed tasks):
filter to open + assigned or open + high/urgent priority.

Weekly planning looks at the coming week. Tasks nobody has touched in 90 days or
more are not a planning problem and do not belong in this report: run
`clickup-stale-triage`, which rules on them and marks the dead ones.

Produce triage report:

```markdown
## Weekly Triage -- Week of [date]

### Overdue ([count])
| Task | List | Assignee | Due | Days late |

### Stale -- needs decision ([count])
| Task | List | Status | Last due |
Recommendation per task: close, reschedule, or reassign.

### Unassigned ([count])
| Task | List | Priority |

### In Progress ([count])
| Task | Assignee | Due |

### This Week's Plan
#### [Person]
- [ ] Task (list) -- due [date]

### Proposed Actions
1. Close: [task] -- reason
2. Reschedule: [task] to [new date] -- reason
3. Assign: [task] to [person] -- reason
4. Create: [new task] in [list] -- reason
```

Capacity guideline: 3-5 tasks per person per week. Present report, wait for approval, incorporate edits. Then apply approved changes:

```bash
cu task update <id> --due-date YYYY-MM-DD
cu task update <id> --add-assignee <userId>
cu task update <id> --status "in progress"
cu task update <id> --status "Closed"
cu task create --list <id> --name "..." --assignee <userId> --due-date YYYY-MM-DD --priority normal
```

Summary line: `X rescheduled, X assigned, X closed, X created, Y unchanged`.

---

## Mode 2: Orchestrate

Convert a meeting, call, transcript, or conversation into ClickUp tasks.

Before creating anything, confirm three coordinates: the project list (run `cu hierarchy` if unsure), whether a parent task exists (`cu tasks --list <id> --closed --subtasks`), and the source URL (doc, transcript, recording, or thread -- every task links to it).

For each candidate task, extract: action verb (imperative, French or English matching the project language), owner (named person or "to assign"), trigger (what decision produced this), acceptance (what "done" looks like), and anchor date.

Drop if: no clear owner AND no acceptance criteria, duplicates existing open task, or pure context with no action.

Structure rules:

| Sub-task of existing parent? | One owner? | Result |
|------------------------------|------------|--------|
| Yes                          | Yes        | Sub-task |
| No                           | Yes        | Root task |
| Either                       | No (multi-owner) | Split into sub-tasks per owner |

Date anchors: pre-meeting deliverables = working day before meeting; sender actions = same-day or next-day; receiver actions = 2-3 working days after sender, priority low, comment "blocked on [name]"; multi-step = intermediate milestones, never one blob.

```bash
cu task create \
  --list <listId> \
  [--parent <parentTaskId>] \
  --name "<imperative action>" \
  --description "<markdown body>" \
  --markdown \
  --assignee <userId> \
  --due-date YYYY-MM-DD \
  --priority high|normal|low|urgent
```

Description template:

```markdown
**Contexte :** [one line]

## A faire
- [step 1]

## Critere de done
[verifiable condition]

**Source :** [link]
```

Report: one line per task: `<taskId> -- <name> (<assignee>, due <date>) -- <url>`. List deferred candidates with reasons.

---

## Mode 3: Ops

Ad-hoc workspace operations: status updates, cleanup, reassignment.

Heuristics: sub-task if parent exists in same list, root task + dependency link if cross-parent. Priority defaults to normal; high = blocking teammate/meeting; urgent = "today or visible breakage". Assign to person named in conversation; technical work goes to technical lead.

```bash
cu task update <id> --status "in progress"
cu task update <id> --remove-assignee <old> --add-assignee <new>
cu comments add <id> --text "Decision: ..." --notify
cu task field set <id> --field <fieldId> --value <v>
cu fields list --list <id>
```

---

## Anti-patterns

- Empty-shell tasks: "Follow up with X" without context/criteria/date.
- Floating due dates: `today + 7d` with no real anchor.
- Multi-assigned tasks: split instead.
- Bulk create without preview: list candidates first if >3 tasks.
- Inventing metadata: don't create new tags, statuses, fields, or naming patterns.
- Auto-close/assign without approval: triage proposes, user decides.
- Ignoring large lists: filter Marketing Blog and Newsletter, don't dump 100 tasks.
- Planning without scanning: always pull fresh data first.
- Triaging a registry list: GROWTH's Contacts, Companies and Projects are CRM
  records, and the OPERATIONS template libraries are templates. None of them are
  work. `clickup-stale-triage` holds the full list classification.
