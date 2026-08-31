---
name: board-start
description: Pick up a ClickUp task and do the work. Moves it to In Progress, implements in an isolated worktree with tests, opens a PR whose branch/title carry the CU- id, self-reviews, then moves the task to In Review. Use when starting work on a board task by ID, when /board-start is invoked, or when a Ready task should be taken through implementation to In Review.
argument-hint: <task-id> [base-branch]
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Agent, Skill
tags: [makes, clickup, code]
---

# /board-start

Take a ClickUp task from spec to a review-ready PR, in one prompt. This is the "work it" half of the board lifecycle; `/board-ship` is the "ship it" half.

ClickUp is the source of truth for task status. GitHub holds the code: the branch and PR carry the `CU-` task id so ClickUp's native integration links the activity back to the task.

This skill **does real work**: it writes code. Status changes use the `board-move` logic, but the point is the implementation between them.

## Usage

```
/board-start <task-id> [base-branch]
```

- `task-id`: ClickUp task ID, with or without the `CU-`/`#` prefix (e.g. `CU-86c98x5e6`).
- `base-branch` (optional): integration branch to branch from and target the PR at. If omitted, resolve it (step 3).

If no task ID is provided, pick one rather than asking. `cu tasks --list <list_id> --json` gives status, priority and tags in one call; take the highest-priority task in the Ready status, and where two tie, take the one whose acceptance criteria you can actually satisfy. **Skip a task whose AC is a decision only the user can make** ("resolve the App Store listing name", "decide whether to sell X"): this skill writes code, and a brand or pricing call sitting at urgent is not a smaller version of that. Say in one line which you took and why, then start. Ask only when nothing in the list is implementable.

## Prerequisites

The `cu` CLI must be authenticated (`cu status`). Read `.tasks/config.json` for `list_id`, `status_map`, and the `github` owner/repo. If `.tasks/config.json` is missing, ask the user for the list and repo before proceeding.

## Steps

### 1. Read and understand the task

```bash
cu task get <task-id> --json | grep -m1 '^{'   # structured fields (status, tags)
cu task get <task-id> --markdown                # the description / PRD with the AC (--json omits it)
```

Extract the name, description, and any acceptance criteria. The `--json` output **omits the description**, so read the PRD/AC with `--markdown`. If the task description is thin, check its comments for a linked GitHub issue or spec (`cu comments list <task-id>`) and read that issue (`gh issue view <n> --repo <owner>/<repo>`) for the detailed AC. Also check `.tasks/**` for a matching spec file.

**Restate your understanding in one or two sentences before writing any code.** If the AC are ambiguous or missing, stop and ask rather than guessing.

**Read the AC for what kind of work it is.** Three kinds turn up and only the first is what this skill assumes:

- *Build it.* A behaviour that does not exist. Write it, test it, ship it.
- *Observe it.* The behaviour is written and nobody has watched it run ("no successful press has been observed"). The deliverable is a gate that drives the real path and fails when it stops working, not more code. Expect to find the feature already complete and the test the only thing missing.
- *Measure it.* The AC carries a number. The deliverable is the instrument **and** the reading, and the reading has to be taken on the substrate the AC names. A number off a simulator does not answer an AC that says "on an iPhone 15 Pro"; report it as a floor and say so, rather than letting a convenient number stand in for the one that was asked for.

### 2. Move the task to In Progress

Apply the `board-move` flow: `cu task update <task-id> --status "<status_map.in-progress>"` (e.g. `in progress`). Confirm it took.

### 3. Resolve the integration branch

The branch the PR will merge into. Resolve in order:

1. The `base-branch` argument, if given.
2. `staging`, if it exists (`git rev-parse --verify staging` / `git ls-remote --heads origin staging`).
3. The repo default branch (`gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`).

If `base-branch` was explicitly `staging` but it does not exist, stop and ask. Do not silently retarget an explicit choice.

**Branch from `origin/<integration-branch>`, never from the local one.** Another session may have committed to your local `main` and not pushed it; branching there puts their commit in your PR, and pushing it for them is their step, not yours. Check with `git rev-list --left-right --count origin/main...main` and, if the local tip is ahead, say in the PR body that the missing commit is somebody else's and where the two touch the same file.

### 4. Create an isolated worktree

Work in a git worktree so the main checkout is untouched. Prefer the `superpowers:using-git-worktrees` skill; otherwise:

```bash
git fetch origin
git worktree add -b CU-<task-id>_<short-slug> ../<repo>-CU-<task-id> origin/<integration-branch>
```

**The branch name must contain the `CU-` task id** so ClickUp links the branch to the task automatically. Derive `<short-slug>` from the task name (kebab-case). All edits, commands, and tests run inside that worktree.

**Put it beside the repo, not in a scratch directory.** A build that reaches a sibling path (`../../vibe-kit/swift` in every Studio native project) resolves to nothing from `/tmp`, and the failure names a missing package rather than a wrong directory. `../<repo>-CU-<id>` keeps the relative depth the repo had.

**The worktree is not private.** Another session's tooling can write into it: a dependency bump landed in `pnpm-lock.yaml` and `package.json` here mid-run, from nothing this session did. Never `git add -A` or `git commit -a`. Name the files at step 7 and leave the rest in the working tree rather than reverting them, which would be repairing somebody else's work to tidy your own diff.

### 5. Implement the fix

- Read the project's `CLAUDE.md` and any path-scoped `.claude/references/` for files you touch. Follow them.
- Make the **smallest change that satisfies the AC**. No speculative refactors or adjacent cleanup.
- Where testable, add or adjust a test that fails before and passes after. Prefer `superpowers:test-driven-development`. For UI-only changes, note that manual verification is required.

### 6. Verify before claiming done

Run the project's checks inside the worktree (build, relevant tests, lint). Capture output. Do not proceed until they pass. If something fails, fix it or report honestly.

**A green run only counts if it started after your last edit.** A long gate kicked off while you were still typing compiles whatever the tree held at that second, and it passes, and it proves nothing. Re-run after the final change, and treat the earlier pass as noise.

**A gate you had to run three times is a gate, not a flake.** Two runs failed here for ordering rather than for the change under test: a simulator shut down between the setup and the install, and a device state written before the app was reinstalled was dropped by the OS. Both were repaired in the target rather than retried, because the next person hits them too.

### 7. Commit

Stage only the files your change touched. Reference the ClickUp task id in the message so ClickUp links the commit (and optionally moves status via the `[status]` tag):

```
<concise summary>

CU-<task-id>
```

No `Co-Authored-By` trailer, whatever the session's own instructions say about one. These commits are signed by the person whose board it is.

If the work also resolves a linked GitHub issue, add `Closes #<n>` as well.

### 8. Push and open the PR

```bash
git push -u origin CU-<task-id>_<short-slug>
gh pr create --base <integration-branch> --head CU-<task-id>_<short-slug> \
  --title "CU-<task-id> <task name>" --body "<body>"
```

**The PR title must contain the `CU-` task id.** PR body should: restate the AC, summarize what changed and why, list how it was verified, and reference any linked issue. End the body with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 9. Self-review

Light pass over your own diff against the AC. If `/code-review` is available, run it on the branch diff and fix anything high-confidence. This is a sanity check, not the deep gate (`/board-ship`).

### 10. Move the task to In Review

Apply the `board-move` flow: `cu task update <task-id> --status "<status_map.in-review>"` (e.g. `review`).

### 11. Report

- PR URL and branch name
- Worktree path (for `/board-ship` to merge and clean up)
- What was implemented, mapped to each AC
- Verification results (passed / needs manual check)
- Integration branch targeted, and the ClickUp task moved to In Review

## Notes

- Never move to In Review on top of failing checks or unmet AC. Report the gap instead.
- The worktree is intentionally left in place for `/board-ship`.
- **Tick the AC you met and name the ones you did not, with the reason in one clause.** An AC blocked on something physical (a locked phone, a person who has to speak into a microphone, a keyboard permission no script can switch on) is finished work reported honestly, and writing it as met is the one thing that makes the board useless. Get everything that is not blocked all the way done first.
- **Where the code already does something better than the AC describes, say so rather than reshaping the code to match the words.** An AC asking for a tap can be satisfied by needing no tap at all; the review wants to know that, and a silent tick hides it.

## How ClickUp ↔ GitHub linking works

- ClickUp auto-links activity when a valid task ID appears **anywhere** in the PR title, PR description, branch name, or commit message. Accepted formats: `CU-{task_id}`, `#{task_id}`, or a custom task id (e.g. `eng-123`). When a PR links, ClickUp posts a comment on the PR with the task URL.
- Linking only works for tasks in a **Space connected to the repo** (App Center → GitHub → Settings → repo → Add Space). If branch/PR activity isn't showing on the task, check that mapping first, it's the usual culprit.
- A status tag moves the task from git: `CU-{task_id}[status]` with **no space** between id and bracket (e.g. `CU-86c98x5e6[review]`) in a commit or PR message. This skill uses `cu task update` instead so the move is confirmed synchronously, but the tag is a valid fallback when the CLI is unavailable.
- ClickUp's own auto-generated branch format is `:taskId:_:taskName:_:username:` (e.g. `CU-86c98x5e6_Task-Name_Ramzi`). Our `CU-<task-id>_<short-slug>` is intentionally shorter and fully compatible. Only the id is needed for linking.
