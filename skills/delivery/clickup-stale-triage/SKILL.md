---
name: clickup-stale-triage
description: "Finds ClickUp tasks that stopped moving and marks the dead ones with a delete tag for one human pass, holding the line between boards that can be triaged and registries that cannot. Use when a list is full of tasks nobody has touched in months, before a quarterly cleanup, or on 'clean up ClickUp', 'stale tasks', 'what can I delete', 'triage the workspace'. For planning the coming week from live tasks see clickup-ops."
tags: [drives, clickup]
---

# ClickUp Stale Triage

Age alone is not a verdict. A 600-day-old newsletter draft holds 20,000 characters of copy; a 600-day-old task called "Write article" holds nothing. One gets closed, the other gets deleted. This skill separates the two, and refuses to touch the lists where age means nothing at all.

Announce at start: "I'm using clickup-stale-triage."

Read `clickup-cli` for the `cu` command reference. This skill owns the ruling; the CLI owns the calls.

## Run it

```bash
S=.claude/skills/clickup-stale-triage/scripts       # from any repo that syncs vibe-kit
python3 $S/scan.py                                  # full report, read-only, ~75s
python3 $S/scan.py --space MARKETING                # one space
python3 $S/scan.py --verdict delete                 # one verdict
python3 $S/scan.py --json findings.json             # machine-readable
python3 $S/scan.py --apply delete                   # add 🗑️ delete to every delete verdict
python3 $S/scan.py --apply delete --min-confidence high
```

Run it from the repo root: the two ledgers default to paths under
one ledger directory outside the skill.

`--apply delete` creates the tag in each affected space, adds it, then reads every task back and prints how many actually carry it. Nothing in the script deletes a task.

## The verdicts

| Verdict | Rule | What to do |
|---|---|---|
| `delete` | Stale **and** empty: no description, no due date, no priority, no tags, no checklist, no dependency | Tag `🗑️ delete`. Nothing is lost. |
| `close` | Stale ≥180d, ≥400 chars of body, nobody owns it | The work happened or the record matters. Move to a terminal status, never delete. |
| `revive` | Stale but has an assignee **and** a due date | Somebody committed. It needs a new date, not a tag. |
| `review` | Stale, has something but not enough | The report names the one field that spared it. Decide per task. |
| `tagged` | Already carries `🗑️ delete` | Waiting on the human pass. Reported with its age recovered from the ledger. |
| `leave` | Parked list, carries content | Client is gone, history stays. |
| `unclassified` | List is not in `LIST_CLASS` | Classify the list first. Never tag inside it. |

`close` exists because of the Newsletter list: 13 sends of 13,000 to 21,000 characters each, still sitting `Open` 200 to 322 days after they went out. A rule that keyed on age and no assignee would have proposed deleting the entire 2025 newsletter archive.

## List classes, and the trap

Tags and staleness are meaningless in a list whose rows are records rather than work. `LIST_CLASS` in `scan.py` holds one class per list:

- **registry** — never triaged. GROWTH `👤 Contacts`, `🏢 Companies`, `🚀 Projects`; the three template libraries in OPERATIONS; ADMIN `Agent Prompts`; `📎 Source Documents`.
- **archive** — deliberately parked. Every list in the DELIVERY `Inactive` and `Audits` folders, plus `ClickUp Help team`. Only empty shells under a finished parent are ruled on; anything with content is left.
- **content** — ideas legitimately sit. Blog, Newsletter, Socials, YouTube, Image Gen. Stale threshold 180 days instead of 90.
- **board** — live work. Full triage at 90 days.

**The trap.** GROWTH is a CRM sharing the workspace. Its 570 contact and company rows are old by design and empty by nature: the row *is* the person. A staleness sweep that has not been told this flags 393 of them, which is 93% of everything it would find, and proposes deleting the pipeline. This is the single reason the skill classifies lists before it scores tasks.

A list absent from `LIST_CLASS` returns `unclassified` and is never tagged. When a new list appears, add its class to the table in the same session. That is the skill's self-healing surface.

## What counts as empty

Substance: description text, due date, priority, tag, checklist, dependency, linked task.

Not substance: **assignee**, time estimate, points, start date. A ClickUp task template stamps all four on every subtask it creates, so counting them splits identical siblings and hides the rest. Both failures were observed on the first run, and both are recorded in `is_empty`'s docstring so a future edit does not reintroduce them.

An assignee with no due date and no description after 90 days is a nomination, not ownership. Real ownership is caught by `revive`, which needs an assignee **and** a date. The assignee is still printed in the reason line, so a human sees whose name was on it.

## Status types

The right "live" filter is `status.type not in (closed, done)`, not `!= closed`. Custom statuses like `inactive`, `lost`, `no show`, `sent` and `complete` all carry type `done`. They are finished work, not stale work. In one workspace, filtering on `closed` alone dragged 302 finished tasks into the report.

## Permissions

Two tokens sit in `~/.config/clickup/config.json` and they see different things.

- `tokens[0]`, the member token, reads tasks fine but has no `manage_tags`. Creating a space tag with it returns `401 ACCESS_016 / INSUFFICIENT_ACCESS`. `scan.py --apply` reaches for the owner token, named in `write_token`, for every write.
- `GET /space/{id}` on the member token returns 401 for any space reaching it through folder sharing rather than through the hierarchy. `cu hierarchy` therefore showed 5 spaces where the workspace had 8, and missed 636 tasks. `GET /team/{id}/task` returns them all. Never scope a workspace-wide sweep off `cu hierarchy`.

## The workspace map is a file, not a constant

`scan.py` reads its team id, its space names, the class of every list and both
ledger paths from `workspace.json` beside it, or from `CU_TRIAGE_WORKSPACE`.
Copy `scripts/workspace.example.json`, fill in your own ids, and classify every
list before the first run. A list nobody classified lands in `unclassified` and
is reported rather than tagged, which is the safe default and not a finished
setup.

## Tagging destroys the evidence, so there are two ledgers

ClickUp bumps `date_updated` on a tag write. Marking a 220-day-old shell makes it
read as touched today, so a second run finds nothing and the report shows a clean
workspace while dozens of tagged tasks sit there untriaged.

Two things handle this:

- The `tagged` verdict is checked **before** the age gate, so a marked task never
  falls out of the report.
- `--apply` appends every target to `stale-triage-ledger.jsonl` in that directory
  **before** it writes the tag, recording the real age and the reason. The `tagged`
  lines read their age back from there. Override the path with `--ledger`.

The same reset happens on any bulk edit by anyone. A bulk tag applied in the UI while
a scan was running erased the staleness of 56 tasks mid-session on 17 Aug 2026, and
the `close` bucket silently fell from 23 to 2.

The second ledger handles that. Every run appends its findings to
`stale-triage-seen.jsonl` (id, age, body length, status).
On a later run, if a task now reads younger but its body length and status are
unchanged, the older age is carried forward and the reason says so. Real work on the
task changes the body or the status, which drops the carry-over and lets the clock
start again. Override with `--seen`.

One gap remains by design: a task bulk-edited before it ever crossed the stale
threshold has no recorded age to carry, so its clock genuinely restarts.

A run filtered by `--space` or `--verdict` does not write to the seen file, so a
partial view cannot overwrite the full record.

## The tag

`🗑️ delete`, white on `#e74c3c`, matching the existing emoji-prefixed lifecycle tags (`⏰ late`, `⏸️ on hold`, `📛 urgent`, `📆 meeting`). Tags are space-scoped, so it has to exist in each space before it can be applied; `--apply` creates it on demand.

**One name only.** A second tag meaning the same thing splits the review queue and
hides half of it. A plain `delete` tag appeared mid-session on 17 Aug 2026 and was
removed from all five spaces it had reached; `🗑️ delete` is the convention. If a
rival ever appears again, record the tasks carrying it before removing the tag,
because `cu tag delete` strips it from every task in the space at once.

```bash
cu tag create --space <spaceId> --name "🗑️ delete" --fg "#ffffff" --bg "#e74c3c"
cu task tag add <taskId> "🗑️ delete"
cu task tag remove <taskId> "🗑️ delete"
```

## Applying the other verdicts

`close` and `revive` are proposals, presented as a list, applied only after a person picks. Terminal status differs per space, so read it before writing:

```bash
cu tasks --list <listId> --json | head -1        # see the statuses this list uses
cu task update <taskId> --status "Closed"
cu task update <taskId> --due-date $MS --due-date-time false
```

Dates are epoch milliseconds. A `YYYY-MM-DD` is accepted and lands on the wrong day.

## Never

- Delete a task. The tag is the deliverable; removal is a person's call in the UI.
- Tag anything in a `registry` or `unclassified` list.
- Tag a task carrying a description, a checklist or a dependency, however old.
- Treat a done-type status (`inactive`, `lost 😭`, `sent`, `no show`) as stale.
- Scope the sweep off `cu hierarchy`.
- Apply without showing the report first. The report is the point; the tag is the footnote.

## Learned patterns

- **17 Aug 2026 — the CRM nearly got tagged.** An age-and-emptiness rule over the whole workspace returned 429 candidates, 393 of them contact and company rows in the CRM space. Fixed by classifying lists before scoring tasks. Any future threshold change gets re-checked against the per-list breakdown, not the total.
- **17 Aug 2026 — template defaults split siblings.** Three of four onboarding shells on one client were flagged; the fourth was spared by a 3h `time_estimate` the template had stamped on it. Thirty Blog shells hid in `review` for the same reason with `assignees`. Neither field counts as substance now.
- **17 Aug 2026 — `manage_tags` is not on `tokens[0]`.** `cu tag create` 401s under the default token. Writes use the owner token.
- **17 Aug 2026 — the tag write erased the ages it was marking.** All 42 tagged tasks
  read as 0 days still on the next run and vanished from the report. Fixed with the
  `tagged` verdict plus the ledger, both described above.
- **17 Aug 2026 — `GET /team/{id}/task` under-reports on a re-count.** A tag census
  over that endpoint returned 43 tasks, then 41 two minutes later, while a per-task
  `GET /task/{id}` confirmed all 43 still carried the tag. It is a paged search index,
  fine for finding candidates, not authoritative for verifying a write. Read back per
  task, which is what `--apply` does.
- **17 Aug 2026 — `cu hierarchy` is not the workspace.** It showed 5 of 8 spaces. GROWTH (624 tasks) and ACADEMY (9) were invisible until the sweep moved to `GET /team/{id}/task`.
