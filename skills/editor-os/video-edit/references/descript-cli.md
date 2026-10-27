# The Descript CLI: credentials, writes, clipboard, lint, library, renders

## Contents

[Credentials](#credentials), [The write path](#the-write-path),
[Importing and publishing prechecks](#importing-and-publishing-prechecks),
[The document lint](#the-document-lint)

Open this before any write bigger than a rename, when the CLI says a credential is missing, and when a project won't open. The clipboard route: [clipboard.md](clipboard.md). Reorganising "My media": [drive-library.md](drive-library.md). Rendering a master: [rendering.md](rendering.md).

## Credentials

`pnpm descript` needs `DESCRIPT_STYTCH_SESSION` and `DESCRIPT_API_TOKEN`, and its package script loads both through `scripts/secrets.mjs`, so never export them by hand. Run it from the folder that holds the CLI's `package.json`.
 *"DESCRIPT_STYTCH_SESSION is not set"* means you ran it from the wrong folder. The session is fine. Run the whoami first:

```sh
pnpm -s descript            # whoami: the user and the drives
```

`STYTCH_SESSION` does everything inside a project. `API_TOKEN` is only for `project new` and `import`, the 2 things the app's API refuses (`Classic project creation no longer supported`, except `kind: rooms_recording`, which `room new` uses). `auth capture` refreshes an expired cookie from a `web.descript.com` tab in Orca (`--page` when several are open). Anyone else runs `pnpm descript connect`: it opens the walkthrough page, takes both values on the prompt and verifies them with a real call. Take no value as a flag, because a flag lands in shell history and the process list. The page names the 3 things only a person can do (sign in, copy the session, make a token) and shows a screenshot of the finished shelf: "nobody will do that by hand... explain them with actual screenshots." It ships with the product, so it isn't a playground page. The course deck on connecting Descript carries the same split, so edit both.

## The write path

The app writes `/v2/projects/{id}/collab/commits`: every edit is one commit with a jsondiffpatch delta. Media names are at `mediaLibrary.mediaRefs[].displayName`, folders at `rootMediaFileFolder` and `rootCompositionFolder`, tabs at `compositions[]`.

- A storyboard project (a layout pack, anything with `is_storyboard_enabled`) stores one JSON document per revision. The project record says which surface it keeps, never an empty `collab/commits`: a pack can hold a commit chain the app never reads (`Brand Layouts` carried 102 of them, 9 Sep 2026). `tree` prints `document: revision N` or `document: N commits`. Read it through `GET /v2/projects/{id}/asset_url?url=<unsigned content_url>` (signed 3 hours; the raw `content_url` answers S3 AccessDenied). Write it as a presigned PUT, then `POST /v2/projects/{id}/revisions?content_format_version=2`. `base_revision_id` is enforced with a 409, so an open browser tab beats you. Publishing a pack is its own route, `POST /v2/projects/{id}/templates/publish`; without it every rename stays invisible to other projects.
- The live-editor guard counts the CLI's own last commit for 5 minutes and refuses a second verb, quoting the first. Anything that moves the tip (a transcription landing, `verify` opening the tab) re-arms it. Pass `--anyway` once the app is known shut.
- Route discovery and undo stay out of a project that matters. `is_live_collab_enabled` is false, so 2 sessions race and the last save wins. Duplicate the project, check the collaborator avatars, make the smallest edit, delete exactly what you typed. `File > Version history` keeps every autosave. A refused write may need no `undo`: the open editor posts a `merged` commit 15 s later reverting it, so read `log --limit 2 --paths` before an `undo` doubles the damage. `undo` APPENDS a commit, so a second `undo` undoes the first and a bisect oscillates: count the commits back and go in one call, or diff against a `doc --out` of the last verified state. A project the client refuses can't be repaired in the app either, so keep the pristine original and `verify` after every replay step (one duplicate went unopenable; the original replayed from the cut files).
- A new composition is an audio one. The `new` template has 2 taus and 1 card boundary, plus `temp:vo-meta-track`, no `videoMetadata` and `isVideo` false: it renders audio-only and the layout picker offers nothing. Follow with `resize <comp> 2160x3840` and `comp type <comp> video` (18 Sep 2026). `dup` regenerates every owned id and keeps every `mediaRefId`. Composition folders: `mkdir --comps`, `mv`, `rmdir --comps`.
- A tidy-up is one batch: `pnpm descript batch <project> ops.json` takes `rename`, `mv`, `mkdir`, `rmdir`, `newcomp`, `dup`, `rm` ops, resolves each against the document the earlier ones left, writes one commit (`--dry` prints the plan). Most of the mess is Descript's own output (fonts, AI voice, pasted images, recordings, Stock pulls land at root with machine names: 70 of 109 items on one project). All of it goes in one `_descript/` folder, which sorts last. It comes back after each session in the app, and the tidy-up has to run again. The rest of the skeleton is in [projects-and-media.md](projects-and-media.md#inside-a-project-the-files-panel).

## Importing and publishing prechecks

`pnpm descript import <project> <manifest.json>` runs the job, the uploads and the poll. `file_size` must match exactly; signed URLs last 3 hours.

- The MCP takes 3 media per call (`Query count exceeded limit of 100` above); direct `POST /jobs/import/project_media` took nine. The CLI batches.
- One import job per project at a time; a second is rejected, not queued. Direct upload beats URL import, which rejects anything answering HTML. `/jobs/import/project_media` can answer `status: error` for every file for half an hour: prove the outage with a known-good file, then go round it with `descript adopt`, which is also the better verb for a file another project holds.
- Timeline export (EDL, AAF, FCPXML, Resolve XML), `list_folders`, `get_drive_info`, `import_drive_media` are MCP-only.
- A failed import leaves an asset with `artifacts: []`, enough of them make `publish` refuse: find with `GET .../media_assets?include_artifacts=true`, remove with `DELETE .../{guid}`.
- `have not finished uploading` means an unregistered asset. A clip adopted into the cut but never shared into the project fails the `media_assets` lookup (one video: 3 clips and 6 refused renders). Diagnose as a set difference against a project that renders, never off failed artifacts (a project that renders had 172). Repair: `descript adopt <media> --from <project that holds it>` answers `assetShared: true`. A local export hides the fault and can refuse the same clip. An adopted recording carries its `defaultVoiceId`, and a voice the target's roster lacks refuses the project (`Missing speaker object`): `adopt` maps or copies it, so check the roster after adopting.
- An agent doing it anyway (`prompt_project_agent`) does something adjacent and reports success (1 Aug 2026: it renamed tracks in a live composition). End every mutating prompt with "If you really cannot do X, do not do anything else as a substitute. State plainly which tool or capability is missing", and verify with `get_project`, never `agent_response`. It burns AI credits, and **a top-up is the user's call**. A composition with an entry in `publishes` is a live URL: renaming it changes what viewers see.

## The document lint

One dangling id makes Descript refuse the whole document ("Oh no! Something's not working", no route back in). On 2026-08-31, one project had 3 faults that locked the owner
 out of a finished 23:57 edit: 2 `sceneId`s pointing at pin tracks a restore had moved past, and one `roomtoneRefId` without its companion.

**3 invariants, and any one refuses the document:** every `*Id` resolves; every pin a card layer draws is **registered** in `timeline.pins.components` (listing it in `pinScenes` isn't enough, and "pinTrack" in the error means the registration); the cards and pins tracks are in **script order** (sorted in and never appended).

A count validates nothing. Cards 122, markers 48, pin scenes 71, words 6981 all matched the good state and the document still wouldn't load. A linter checking only invariant 1 passed a document refused for 46 unregistered pins.

`inspectDocument()` (`CLIs/descript/gate.ts`) runs inside `commit()` (`history.ts`) and throws before the push; `pnpm descript lint <project>` runs the same checks without writing (47 faults on one document, 0 on the repair). Run it before briefing any write: an app-openable project can carry faults that refuse every write (one project had 11). One paragraph holding a word its own seconds don't refuses the WHOLE project on load; lint's dry run prints it as `WOULD_BE_REFUSED`. Repair with `align --refit` (it only grows forward); a late paragraph split leaves 4 broken neighbours, and `align --resplit` repairs all 4. `DocumentInvalidError` names the JSON path of each dangling reference: ask for the browser console before reaching for a snapshot. Lint also warns on **media at the Files panel root that isn't a raw take**, **library media the folder tree never files** and **a name off the naming rules** in [projects-and-media.md](projects-and-media.md#naming). It only warns, because nothing breaks.

1. **`Components are in incorrect order` is ORDER, not duplicate slots.** A "Copy of" composition has 16 cards at `sortTiebreaker: 0`. In app-authored documents, array order agrees with tiebreaker order and script order.
2. A pin's `sortTiebreaker` derives from a card index (`index + 0.5`). Cutting a card invalidates every later pin, so `realign()` renumbers cards and re-derives pins at the end of every write touching either track.
3. A text layer names its font. `applyLayout` once left `textProperties.fontMediaRefId` pointing at the pack's id and the editor died on load; `rehomeFonts()` matches on `assetKey` and imports nothing.
4. When `DocumentInvalidError` names a path, add that path's last segment to `REFERENCE_FIELDS` before anything else (`fontMediaRefId` was missing, so the gate passed a crashing document).
5. **Test a candidate invariant against an app-authored document before blocking on it.** "Duplicate tiebreakers are the fault" and "a pin sits inside its card's gap" were each falsified in one command (a healthy document breaks the second 105 of 105).

Reading a document back verifies nothing. The API returned 8 placed clips twice and the editor discarded them on open. Prove it draws: `pnpm descript verify <project> --expect "the words the edit put on screen"`. A `verify` right after a repair can load the tab's cached broken copy and report the old refusal: read the document for the bad id, then `verify` again before you undo anything.

`merge()` on a re-seed: a new `Template` field needs its own line in the keep branch (a re-seed reported "renamed: 0, library: 100"), and `named()` once took a generated `Text/c5d195ba` for a real name. `layout seed` passes the `cardId -> Group/Name` map from `layouts(pack)` into `seedPack`.

**Files stages hand each other** are validated against one schema on write and read, so the same plan replays the same edit. A bad file stops the reader, naming file, field and expectation (`pins.json: [3].media must be a string`).

| File | Written by | Schema |
|---|---|---|
| `RUN.json` | `run.py` (the studio sets only `route`) | `run.schema.json` |
| `passes.json` | by hand, the pass order | `passes.schema.json` |
| `pins.json` | `sequence.py plan`, then an agent fills `FILL ME` | `pins.schema.json` |
| `*.phrases.json` | `sequence.py plan`, an agent (read by `resolve.py`) | `phrases.schema.json` |
| `needles.json` | an agent: the cut list as words | `needles.schema.json` |
| `briefs.json` | an agent, off `visuals.py brief` | `briefs.schema.json` |
| `cut.json`, `plan.json`, `plan.notes.json` | local cut builder, planner, `studio notes --done` | `cut/plan/plan-notes.schema.json` |

`scripts/schema.py` (Python, exits 2) and the studio's `schema.ts` (answers 400) read the same files; check one by hand with `python3 scripts/schema.py pins path/to/pins.json`. They know only `type required properties additionalProperties items prefixItems minItems maxItems enum const pattern minimum minLength anyOf`; any other keyword is refused, so add it to both validators first. Rules JSON Schema can't say live in code: one slot per `plan.json` id (`oneSlotPerId`); a `cell` pick needs `pick.props` its template takes (`scripts/templates.mjs`); `run.py done` needs `--file` (saved output) or `--run` (output kept under `proof/`, sha256 recorded).

- `batch` isn't idempotent (a `mkdir` name that's also an `mv` target dies `matches 2 items` on re-run; it rolls back safely). `track mv` and `track add` have no `--dry`: read a command's flags before running it on a project you keep.
- `pull` matches the ASSET name, and a renamed stock sound no longer carries it (`Woosh M` is `Fast Flying Whoosh 8 ...`): read `assetJson.default_display_name` from `doc` first. A project's Stock Media folder is what was auditioned, not used: count `pinScenes` per mediaRef.
- A CLI-created project hangs on "Opening project..." until it has a composition: `pnpm descript new <project> <name>` first. `rm comp:` refuses a project's only composition (make `new <project> TEMP`, remove the real one, import, remove TEMP). An import key `Sequences/<name>` creates a second `Sequences` folder beside the built-in one.
