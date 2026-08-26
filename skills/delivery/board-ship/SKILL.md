---
name: board-ship
description: Review and ship a ClickUp task's PR in one prompt. Verifies it against the task's acceptance criteria, runs a thermonuclear (clean / DRY / elegant-integration) review, merges into the integration branch, moves the task to Done, and cleans up. Use when a board task's PR is ready to review and merge, when /board-ship is invoked, or when an In Review task should be verified and closed out.
argument-hint: <task-id | PR-number> [integration-branch]
allowed-tools: Bash, Read, Grep, Glob, Agent, Skill
---

# /board-ship

The quality gate between "In Review" and "Done", the "ship it" half of `/board-start`.

ClickUp is the source of truth for status. **Done means merged and verified**: never move a task to Done without a real merge and a passing review. A status flip is not shipping.

## Usage

```
/board-ship <task-id | PR-number> [integration-branch]
```

- The first argument may be a ClickUp task id (`CU-...`) or a GitHub PR number. Resolve whichever is given to the matching PR (step 1).
- `integration-branch` (optional): the branch to merge into. If omitted, resolve as `/board-start` does (explicit → `staging` if it exists → repo default).

If no argument is provided, ask. Alternatively, with no argument you may discover all tasks in **In Review** (`cu tasks --list <list_id> --status "<status_map.in-review>" --json`) and ask which to ship.

## Prerequisites

`cu status` must be authenticated. Read `.tasks/config.json` for `list_id`, `status_map`, and the `github` owner/repo.

## Steps

### 1. Resolve the task ↔ PR pair

- If given a ClickUp task id: find its PR via the branch/PR carrying the `CU-` id, `gh pr list --search "CU-<task-id> in:title" --state all` (also try `in:body` and the branch name `CU-<task-id>`). If the task's GitHub activity is linked, `cu task get <id>` comments may name the PR.
- If given a PR number: read the PR (`gh pr view <n>`) and extract the `CU-` id from its title/body/branch.

If no PR is found, stop. There is nothing to ship. Suggest `/board-start <task-id>` first.

Capture: PR number, head branch, base branch, ClickUp task id, repo.

### 2. Read the acceptance criteria

```bash
cu task get <task-id> --markdown   # the description / PRD where the AC live
gh pr diff <pr-number>
```

Extract every acceptance criterion from the task description (and any linked GitHub issue, `cu comments list <task-id>` then `gh issue view <n>`). These are the pass/fail bar. Note: this CLI's `--json` output **does not include the description**, so read the AC with `--markdown`.

### 3. Verify acceptance criteria (the AC gate)

For each criterion, prove it from the diff and the current code (borrow the `board-reviewer` agent's discipline):
- "query no longer returns field X" → grep to confirm it's gone.
- "page is paginated" → check the server logic for offset/limit/total.
- "test exists" → find it and run it.
- "renders correctly" → flag as needing manual verification.

Run the relevant tests and the build inside a checkout of the PR branch. Capture output. Record any unmet or untestable criterion.

### 4. Thermonuclear review (the quality gate)

Prove the change is **clean, DRY, and integrates elegantly**. If `/code-review` is available, run it at `high` (or `ultra` for large/risky changes) on the PR diff and fold in findings. Otherwise, or in addition, review:

- **Correctness**: logic bugs, edge cases, error handling, race conditions.
- **DRY / reuse**: does this duplicate existing utilities/components/patterns (check `@heyramzi/*` and local helpers)?
- **Clean**: no dead code, leftover debug output, commented-out blocks, or unused imports/vars introduced by the change.
- **Elegant integration**: fits the surrounding style and the integration branch's current state; pull the latest integration branch and check for conflicts/duplication.
- **Project rules**: path-scoped `.claude/rules/`, design system, type-safety, lint (slop words, no em-dash, section order).
- **Regression risk**: does anything on the integration branch break?

### 5. Verdict

- **PASS**: all AC met and the review is clean (or only trivial nits you fixed on the branch and re-verified). Proceed to merge.
- **CLEANUP-THEN-PASS**: minor safe fixes needed. Apply them on the PR branch, push, re-verify, then proceed.
- **FAIL**: AC unmet, real bugs, or too large to safely clean up here. **Do not merge.** Report what's missing, comment it on the PR, and stop. Optionally move the task back to In Progress (`cu task update <id> --status "<status_map.in-progress>"`).

When in doubt, FAIL rather than ship.

### 6. Make the merge clean

Make sure the PR branch is current with the integration branch so the merge is conflict-free:

```bash
git fetch origin
# rebase the PR branch onto the latest integration branch (or merge it in), resolve conflicts, re-verify, push
```

### 7. Merge into the integration branch

Squash-merge so the integration branch gets one clean commit. Put the `CU-` id (with the done-status tag) in the commit so ClickUp links the merge and can auto-close:

```bash
gh pr merge <pr-number> --squash --delete-branch \
  --subject "<concise summary>" --body "CU-<task-id>[<status_map.done>]"
```

Confirm the merge (`gh pr view <pr-number> --json state,mergedAt`). If the PR also `Closes #<n>`, that GitHub issue closes too.

### 8. Move the task to Done

Apply the `board-move` flow as the authoritative status change (do not rely solely on the commit tag): `cu task update <task-id> --status "<status_map.done>"` (e.g. `Closed`). Post a short comment on the task (`cu comments add <task-id> --text "..."`): what shipped, which AC were verified, what the review covered, and any manual-verification items.

### 9. Clean up

Remove the worktree left by `/board-start` (`git worktree remove <path>`) and confirm the remote branch was deleted by the squash-merge. Leave the repo clean.

### 10. Report

Output: the verdict, what the review covered, the merge result (commit on the integration branch), the ClickUp task moved to Done, and any manual follow-ups.

## Notes

- This is a code-quality gate, not just an AC checker. That is the difference from the `board-reviewer` agent, which it complements.
- **Watch for duplicate tickets.** If resolving the PR reveals another open ticket covering the same work (a DAW-PRD restatement, a sub-scope, an accidental clone), close it as a duplicate with a comment pointing at this one rather than leaving the board with two live tickets for one change.
- Never merge with failing checks, unmet AC, or unresolved review findings. Honesty over a green status.
- The ClickUp task is the source of truth; the squash commit carries the `CU-` id so GitHub activity links back. Default merge strategy is squash unless the project documents otherwise.
- ClickUp can also close the loop from git directly: a status tag in the squash-commit message, `CU-{task_id}[done]`, no space before the bracket, moves the task when ClickUp ingests the commit. This skill uses `cu task update` so the move is confirmed synchronously, but the tag is a valid fallback when the CLI is unavailable. Requires the repo to be linked to the task's Space (App Center → GitHub → Settings).
