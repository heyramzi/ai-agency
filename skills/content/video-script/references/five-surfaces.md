# The 5 surfaces of one video

A long-form video isn't finished when the script is. It's finished when someone who never read this conversation can open the board, find the video, read the brief, open the script and open the Descript project. All 5 are written in the same session as the script.

| Surface | Holds | Written by |
| --- | --- | --- |
| The concept, in the app | Brief, keyword evidence, packaging, the script | `POST /api/youtube/concepts`, then `PUT .../script` |
| The ClickUp task | Production state, dates, holder, batch | `POST /api/youtube/concepts/<id>/production-task` |
| The board fields | Publishing, Format, Socials, BATCH, Points, Descript | `cu task field set` |
| The Descript project | The take, once it exists | `pnpm descript project new` |
| The calendar | The calendar row | by hand |

- The script's home is the concept (`metadata.script`). A script in a repo file or a chat window doesn't exist.
- A hand-written script goes in with `PUT`, never regenerated. `POST` spends a model call. `PUT` validates against `videoScriptSchema` only. `beatCount` drives the runtime on the recording page, so it's the real bullet count including the cold open and the ask; `startsAt` on each block is cumulative beats times `BEAT_SECONDS`.
- A concept born outside the SEO flow passes `source`, and sends `"reportId": null` and `"seed": null` explicitly (a zod `.nullable().default(null)` still refuses an absent key here).

```bash
KEY=$(grep -E '^UPSYS_APP_API_KEY=' app/.env.local | cut -d= -f2- | tr -d '"')
API=http://localhost:3160          # prod refuses anything the last deploy doesn't carry

# 1. concept (brief and keyword evidence) -> id
curl -sS -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -X POST "$API/api/youtube/concepts" --data-binary @concept.json
# 2. the written script
curl -sS -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -X PUT "$API/api/youtube/concepts/<id>/script" --data-binary @script.json
# 3. board task (also writes the concept URL into `Link`) -> taskId
curl -sS -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -X POST "$API/api/youtube/concepts/<id>/production-task" -d '{}'
# 4. the name carries the code, the fields carry the schedule
cu task update <taskId> --name "EC52 - <title>" --description "$(cat brief.md)" --markdown \
  --due-date 2026-12-09
cu task field set <taskId> --field 663d0445-3420-4152-bacb-e11a8145d859 --value 2026-12-09 --all-day
cu task field set <taskId> --field d508e762-2df9-4d4d-9640-4e260b602a18 --value 6      # Format: Video
cu task field set <taskId> --field af2f2fb5-cc3f-4918-b4ca-9f5e31c16acc --value 3      # BATCH: Later
cu task field set <taskId> --field 43369afa-4a38-4c40-ba5a-9392fb5ea25f --value 1      # Points: 2
cu task field set <taskId> --field d8574a56-d8c0-4ab0-bb47-8343cc9dbf78 \
  --value '["bd92c09f-45eb-4d69-a6e7-8b6b0fe9b6a2"]' --json-value                      # Socials: YouTube
# 5. Descript project, before the shoot, so the field is never empty
cd ../vibe-kit/CLIs
pnpm descript project new "EC52 - <title>"
pnpm descript project mv <projectId> "01 - Youtube HeyRamzi/00 - In Production"
pnpm descript rename <projectId> <compId> "<title>"      # the composition is the title ALONE
cd -
cu task field set <taskId> --field 632095f8-6949-40f7-88dc-7737203ab5c0 \
  --value "https://web.descript.com/<projectId>"
# 6. relink, so productionTask.name matches the renamed board task
curl -sS -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -X POST "$API/api/youtube/concepts/<id>/production-task" -d '{"taskId":"<taskId>"}'
```

 ClickUp wins on any disagreement, so write the row after the board.

## Traps

- `cu task field set` on a `labels` field needs a JSON array of option ids, and `cu fields list` doesn't show them. Read `GET /list/<id>/field` on the ClickUp API with the token in `~/.config/clickup/`. A plain label answers `Value must be an array`.
- The dev server is the writer, never prod.
- One name across all 5 surfaces. Task and Descript project are `CODE - Title`; the Descript composition and the concept are the title alone. All 7 videos in flight on 26 Aug 2026 kept Descript's import name.
- Assign the code off the whole registry. `[Language][Pillar][NN]`, pillars SCALPM. List every code including closed tasks (`cu tasks --list 901507318169 --closed --json`) and take the next free number in that pillar. `NN` is an id, so never renumber a gap. 3 live collisions came from skipping this.
- Doctrine lives here, and the generator is a runtime copy.
- Course lesson files are the curriculum record and never a second script: module, surface, status, runtime, takeaways, recording notes. A lesson that's also a YouTube video keeps its spoken beats in one place and the other links to it.

Done when all 5 surfaces exist and the names match.
