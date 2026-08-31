---
name: clickup-field-merger
description: "Cleans up redundant ClickUp custom fields: inventories every field in a workspace with its locations, groups the near-twins that differ only by an emoji or a capital, merges each group into one field and carries the task values of the merged-away fields onto the kept one. Use on 'merge custom fields', 'clean up custom fields', 'we have four Department fields', field sprawl found by clickup-audit, or before an integration that needs one field ID per concept."
tags: [drives, clickup]
---

# ClickUp Custom Field Merger

Announce at start: "I'm using the clickup-field-merger skill to consolidate custom fields."

ClickUp does the data migration itself. The merge endpoint moves every task value from
the merged-away fields onto the kept one, so this skill is not a migration script: it is
the decision of what to keep, the count of what is lost, and the repair of what breaks.

## Before anything

```bash
cu net capture https://app.clickup.com/<teamId>/home   # the session JWT lives ~48h
cu status                                              # confirm the teamId matches
```

Every command here runs on the captured frontdoor session, because the public API cannot
list fields workspace-wide, cannot merge and cannot delete. A stale session is the normal
morning state; `cu` says so rather than 401ing at you. The workspace comes from the
config, not from the session: `CU_TEAM_ID=<teamId> cu fields all` reads a workspace the
session was not captured against, verified 26 Aug 2026. Capture against the workspace you
are about to write to anyway, because that is not verified and a half-applied merge is
not something to discover.

## The workflow

1. **Inventory.** `cu fields all --json` -- every field, its type, its level and every
   location it is applied to. Save it; it is the before state and the rollback notes.
2. **Group.** `cu fields duplicates` puts the survivor first in each group, ranked by
   workspace level, then by how many places it is applied, then by option count, then by
   age. `--loose` also pairs singular with plural, which finds real cases and some noise.
3. **Judge each group.** The ranking is a default, not a decision. Override it when the
   older field is the one automations and integrations already point at, or when the
   better-named field is the smaller one. Rename after merging, not before.
4. **Price the merge.** `cu fields merge --into <keep> --from <drop,drop> --dry-run` prints
   the option mapping and, per merged-away field, `values` / `moving` / `dropped`. Add
   `--add-missing` when the survivor is short an option the other field has: in a dry run
   it only prints `(added to <field>)` and writes nothing.
   `dropped` is the number of task values that die: where both fields carry a value the
   kept one wins. A group whose whole value count is `dropped` is a group where the two
   fields were filled in parallel, and merging it loses a column of data.
5. **Get a yes on the plan.** A merge cannot be undone. Show the groups, the survivor, the
   option mapping and the dropped count, and wait. This is the skill's only gate.
6. **Merge.** Same command without `--dry-run`, one group at a time.
7. **Repoint.** The merge rebuilds the kept field: new field ID, new option IDs. See below.
8. **Verify.** Re-run `cu fields duplicates` (the group is gone), and `cu fields all
   --name "<name>"` to read the new ID and its locations, which are now the union of what
   the merged fields covered.
9. **Sweep what is left.** Fields with `level: unused` in `cu fields all` are applied
   nowhere. `cu fields delete <id> --list|--folder|--space` removes one from one location.

## What the merge does, exactly

Measured on a live workspace, 26 Aug 2026:

- **Values move.** A task that carried a value only on a merged-away field carries it on
  the survivor afterwards, whatever list it lives in.
- **The kept value wins a collision.** Both fields filled means the merged-away value is
  dropped silently. Nothing reports it after the fact; the dry run is the only warning.
- **Locations union.** Two list-level fields on different lists become one field applied
  to both lists.
- **The survivor is rebuilt.** Its field ID and every option ID change, its
  `date_created` resets, and a `new_drop_down` dropdown comes back in the legacy shape,
  so its task values then read back as an option **orderindex** instead of an option ID.
- **Extras on the type_config do not survive.** An AI-filled dropdown loses its prompt.
  Read the old field's `type_config` out of the inventory from step 1 and put it back.

## Repointing after a merge

The new field ID breaks anything holding the old one. Check, in this order:

- **Views**: a custom field column is `cf_<fieldId>` and a filter holds the field ID.
  `cu views list` then `cu view get <id>`.
- **Automations**: `cu automations --list <listId>` per list the field touches.
- **Integrations**: Make scenarios (`make-cli`), n8n workflows, webhooks, and any script
  in this repo. Grep the old ID across the workspace before merging, so the list of
  places to repair exists before the ID is gone.
- **Dashboards** (`cu dashboards`) and saved filters.

## Refusals, and what each one means

| Message | Meaning |
| --- | --- |
| `Field types do not match.` | Only same-type merges exist. Different types means recreate and re-enter by hand. |
| `Not all source field options are specified.` | Every option of the merged-away field needs a target. `--map "old=new"` points one anywhere, `--add-missing` adds it to the survivor. |
| `Not all custom fields were found.` | Usually the same field twice: `POST /list/{id}/field` returns the EXISTING field when the name and type already exist, so two "creates" can be one field. |
| `FIELD_192 Parent must be included` | `fields delete` needs `--list`, `--folder` or `--space`. |
| `FIELD_209 Cannot remove a field directly from the workspace level` | Re-home it first (`PUT /customFields/v2/field/{id}` with `project_id`), then delete it from there. |
| `FIELD_262 Access denied for updating field api` | The public PATCH refuses a member token. `cu fields merge --add-missing` goes through the session instead; for `cu fields update`, switch to the owner profile. |
| `FIELD_214 Field already exists in parent` | The field is already applied there. Nothing to do. |

## Two things the numbers do not cover

The filtered task search behind the dry run does not see **archived** tasks, so a merge
can move a value the count never showed. And a `list_relationship` field points at a
specific list: two of them with the same name are only duplicates when they point at the
same list. Read `type_config` before grouping those.
