---
name: board-spec
description: Turn a raw Open ClickUp task into a build-ready PRD. Investigates the codebase, writes problem/goals/acceptance criteria into the task description, then moves it to Ready for /board-start. Use when an Open board task lacks a spec, when /board-spec is invoked, or when a task needs acceptance criteria written before implementation starts.
argument-hint: <task-id>
allowed-tools: Bash, Read, Grep, Glob, Agent
tags: [writes, clickup, code]
---

# /board-spec

Write the PRD before anyone writes code. This is the "spec it" first third of the board lifecycle: `/board-spec` → `/board-start` → `/board-ship`. The Open column holds raw ideas; Ready holds tasks that `/board-start` (or any engineer) can pick up cold and implement without guessing.

ClickUp is the source of truth: the PRD lives in the task description, because that is exactly what `/board-start` reads for acceptance criteria.

This skill **does not write code**. It reads the codebase to ground the spec in reality, then writes the document.

## Usage

```
/board-spec <task-id>
```

- `task-id`: ClickUp task ID, with or without the `CU-`/`#` prefix.

If no task ID is provided, list the board's Open tasks (`cu tasks --list <id> --status Open`) and ask which to spec.

## Prerequisites

The `cu` CLI must be authenticated (`cu status`). Read `.tasks/config.json` for `list_id` and `status_map` if present.

## Steps

### 1. Read the raw idea

```bash
cu task get <task-id> --json | grep -m1 '^{'   # structured fields: status, tags, assignees
cu task get <task-id> --markdown                # the DESCRIPTION / existing PRD body
cu comments list <task-id>
```

The `--json` output of this CLI **omits the description field**: use `--markdown` to read the task body (the raw idea or an existing PRD). Capture the original idea text verbatim. It is preserved at the bottom of the PRD, never overwritten silently.

### 2. Investigate the codebase, and check for prior art

Ground every claim in actual files. Find the surfaces the task touches (routes, modules, schemas, tests), measure the current state (file counts, line counts, duplication), and cite real paths. A PRD that says "the 14 cloned page-servers" must name them. Use subagents for broad sweeps when the surface is large.

Before writing a single line of PRD, rule out duplication. Wasted specs are worse than no spec:

- **Search the board across every status**, not just Open: `cu tasks --list <id> --json` and `cu tasks --list <id> --closed --json`. A near-identical title in Review or Closed means this is a duplicate, link/merge instead of writing a new PRD. Watch for the same idea split across two tickets (a parent concept + a sub-scope of it); fold the child into the parent.
- **Check whether the code already implements it.** Production can run ahead of the board, features ship from a branch and the ticket never moves to Done. If a codebase sweep shows the feature already exists, do **not** write a build PRD: report it as already-implemented and recommend moving the ticket to In Review/Done (`board-move`) instead.

### 3. Draft the PRD

Use this structure. Every section, nothing speculative:

```markdown
## Problem
What hurts today, with code evidence (paths, counts, examples).

## Goals
What done looks like, in outcome terms. 2-4 bullets.

## Non-goals
What this task deliberately does not touch. Prevents scope creep in /board-start.

## Acceptance Criteria
- [ ] Verifiable, checkable statements. Each one testable by command or inspection.
- [ ] Include the verification command where one exists (test file, check script).

## Technical sketch
The seam/module/approach, named files to create or change. A sketch, not a design doc — /board-start makes the final call.

## Risks & open questions
Anything ambiguous, plus decisions deferred to implementation.

---
*Original idea:* <verbatim original description, if any>
```

### 4. Resolve ambiguities

If an open question **blocks** implementation (two incompatible interpretations, missing business decision), ask the user before writing. Otherwise record it under Risks & open questions and proceed.

### 5. Write the PRD into the task

```bash
cu task update <task-id> --description "$(cat <prd-file>)" --markdown
```

### 6. Move the task to Ready

Apply the `board-move` flow: `cu task update <task-id> --status "<status_map.ready>"` (e.g. `ready`). Confirm it took.

### 7. Report

- Task ID and name, moved Open → Ready
- One-paragraph PRD summary
- Open questions the implementer should know about

## Notes

- Spec the task, not the epic. If investigation reveals the idea is really 3+ independent tasks, say so and offer to split (`cu task create`) instead of writing one bloated PRD.
- **Tags: reuse, never invent.** When creating tasks (splits or new gap tickets), apply only tags already in use on the board. Discover them first, e.g. `cu task get <id> --json | jq -r .tags` across existing tasks, then pass the closest fits via `--tag "<a>,<b>"`. A new tag fragments the board's taxonomy; pick the nearest existing one instead.
- **`task update` and `task create` do not take the same flags.** `--description-file` and `--tag` exist on `create` only; on `update` both are rejected outright with "Unknown flag". For a long PRD on an existing task, pass the file through the shell: `cu task update <id> --description "$(cat <path>)" --markdown`. To tag an existing task, either set the tags at `create` time or go through the API directly (`POST /api/v2/task/<id>/tag/<tag_name>`), which is also the call that needs the owner token rather than the team one.
- Never invent acceptance criteria the idea doesn't imply. Thin idea → short PRD with sharp open questions beats padded fiction.
- If the task already has a real PRD, diff your findings against it and update only what the codebase contradicts.
