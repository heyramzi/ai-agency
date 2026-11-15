# Tella features

Open this before you add a Tella feature to `editor-os`, or when a Tella pass needs something `place` doesn't send. One row per feature of Tella's editor, what the public API reaches, and what we do with it. The cards `place` sends today are in [layouts.md](layouts.md#the-tella-route).

Sources, read 15 Nov 2026: the spec at `https://www.tella.com/docs/openapi.json` (never `docs.tella.tv`, its certificate has expired), `tellahq/skills` on GitHub, and every panel of the live editor clicked through read-only. Every endpoint below is `https://api.tella.com/v1/...` with the `TELLA_API_KEY` bearer. Clip times are ms on the clip's playback clock (cuts applied); `cuts` are raw recording ms; chapters are whole seconds on the final video.

**Read this before you build.** Most timeline adds also go through `POST /videos/{id}/edits`, up to 200 ops checked whole before any lands: `add_|update_|remove_` plus `layout`, `zoom`, `text_overlay`, `media_overlay`, `shape_overlay`, `sound_effect`, `blur`, `highlight`. Use the batch, never a loop of single adds. Anything that needs a file (b-roll, a music bed, our own sounds, a thumbnail) starts with `POST /sources`, a PUT of the bytes to its `uploadUrl`, then `GET /sources/{sourceId}` until it's processed. Tella's MCP (`https://api.tella.com/mcp`) takes the same API key as a bearer and has tools REST doesn't, such as `list_saved_layouts` and `apply_saved_layout`.

`CLI` below is what `editor-os` sends today (`packages/cut/src/backends/tella.ts`, `tella-sections.ts`, `tella-subtitles.ts`, `tella-chapters.ts`): pull clips and transcript, PATCH cuts, PATCH `dimensions`, layout sections in one `edits` batch, a split per Chapter Card, clip names, the Brand house subtitle preset with names respelled, chapters, and a 1080p export with subtitles burned in. Nothing else.

## The map

| Feature | What it does | Public API | CLI today | Descript equivalent | What we should do |
| --- | --- | --- | --- | --- | --- |
| **Setup** Title, description | Name and description on the share page | `PATCH /videos/{id}` `name`, `description` | `new` reads the name | none, YouTube metadata is the `youtube` skill's | Leave it. YouTube is where the title matters |
| Setup: Viewer settings | Playback speed, downloads, subtitles on by default, comments, transcript, docs, creator, date, view count, indexing | `PATCH /videos/{id}` (`defaultPlaybackRate`, `downloadsEnabled`, `captionsDefaultEnabled`, `commentsEnabled`, ...). Reactions and the Copy link button have no field | nothing | none | Leave it. The share page isn't the audience |
| Setup: Chapters | Chapter markers on the player | `GET`/`PUT /videos/{id}/chapters`, the whole list, max 100 | `place` writes one per titled clip (each Chapter Card, plus clip 1's title at 0:00), at the clip's playback start in whole seconds, and skips a list Tella already has | a marker per section (pass 2) | Keep |
| Setup: Size, Ratio bar | Canvas: Auto, 16:9, 16:10, 4:3, 1:1, 4:5, 9:16 | `PATCH /videos/{id}` `dimensions` (max 1920 a side), `autoRatio` | sets 1920x1080 or 1080x1920 first | the project's size | Keep |
| Setup: Transcript language | Which language Tella transcribes | no endpoint | nothing | Descript's transcription language | By hand, only for a take that isn't in English |
| Setup: Clip transitions | Smooth or hard cut between clips | `PATCH /videos/{id}` `defaultClipTransition`; one clip's `transition` on `PATCH .../clips/{clipId}` | nothing | the card's `videoFades` | Set it with the house style. Ranked 9 |
| **Layout** Presets | Side-by-Side, TV Presenter, Camera Bubble, Cut out, Camera-only (with Punch-in), Screen-only, Media | `POST`/`PATCH .../clips/{clipId}/layouts`, batch `add_layout`; kinds `side-by-side`, `tv-presenter`, `camera-bubble`, `cut-out`, `camera-only`, `screen-only`, `fullscreen`, `middle`, `custom` | 7 cards as `camera-only`, `camera-bubble`, `side-by-side` | the `Brand Layouts` pack cards | Keep. Map a card to `tv-presenter` or `cut-out` only when a beat needs it |
| Layout: Favorites ("Brand house") | A saved layout, one click | REST: none. MCP: `list_saved_layouts`, `apply_saved_layout` (not inside a batch) | nothing | the pack itself | Read its geometry once and send it as a `custom` layout from `tella-sections.ts`. Ranked 10 |
| Layout: Camera style, pop-out | Circle, square, portrait, cutout, blob; presenter pops out of the frame | layout `cameraStyle`, `popOut` | `square`, `portrait` | the card's camera layer | Keep. A new section doesn't inherit them, so send both every time |
| Layout: Customization, Adjust | Free geometry per slot, a clip's own transition | layout `kind: custom`; clip `transition` | nothing | `layer set` | Through Favorites above |
| Layout: Media | B-roll inside a layout, screen slot or full frame | layout `media` (`image`, `video`, `recording`, `motion`) with a `sourceId` | refuses media cards | b-roll pins on media cards | Ranked 4 |
| Layout: Auto Layouts | AI picks layouts for a clip | no REST verb; `POST /agent-chats` or the MCP skill `tella-auto-layouts` | our plan's sections replace it | none | Don't. The plan picks layouts and Auto Layouts would throw them away |
| Layout: animation style | How layout changes ease, gentlest to snappiest | `PATCH /videos/{id}` `layoutAnimationStyle` | nothing | `videoFades` curves | Set once with the house style |
| **Cut** Mistakes | Finds retakes and false starts to review or cut | no REST verb; the agent's Remove Mistakes, or `POST .../cut-by-transcript` with our own word indices | our cut pass finds them, then PATCH `cuts` | `candidates.py`, clipboard `apply` | Keep ours. It reads the brief, Tella's doesn't |
| Cut: Buffers | Trims dead air at clip ends | no endpoint | our ranges | `gaps close --edges` | Leave it. Our cut already covers it |
| Cut: Silences | Cuts pauses over 800, 500 or 300 ms | `GET .../silences`, `POST .../remove-silences` `mode`, merged with existing cuts | our ranges | `silences.py`, `gaps close` | Keep ours. A Tella pass after ours would cut pauses we chose to keep |
| Cut: Filler words | Cuts um, uh | `POST .../remove-fillers` | our ranges | clipboard `apply` | Keep ours |
| Cut: Trim, cuts | Ranges taken out of the raw take | `PATCH .../clips/{clipId}` `cuts`, `POST .../cut`, `.../cut-by-transcript` | PATCH `cuts`, saves `cuts.before.json` | Ignore ranges | Keep |
| **Effect** Zooms | Manual or cursor-tracking zoom on the screen slot; Generate from clicks | `POST .../zooms` (`manualZoom` with `focusPoint`, `trackingZoom`, `scale` 1 to 3.5), `POST .../zooms/auto` (`intensity`), batch `add_zoom`; video `zoomAnimationStyle`, `shrinkCameraDuringZooms` | nothing (camera punch-in only) | `--zoom 1.12` and the Cam 110 to 130 ladder | Ranked 3. It never zooms the camera, so the ladder stays `punchIn` |
| Effect: Cursor | Animated cursor: size, smoothing, tilt, click spring and ripple, hide when idle | `PATCH /videos/{id}` `cursor`; clip `animatedCursor` | nothing | none | Set once with the house style |
| Effect: Keystrokes | On-screen HUD of keys pressed | `PATCH /videos/{id}` `keystrokes`; data only from the Mac app or Auto Capture | nothing | none | Turn it on for a shortcut-heavy demo recorded in the Mac app |
| Effect: Blur and highlight | Hide or spotlight a region of the screen | `POST .../blurs`, `.../highlights`, batch `add_blur`, `add_highlight` | nothing | by hand | Ranked 12 |
| Effect: Motion blur | Blur on fast zooms and cursor moves | `PATCH /videos/{id}` `motionBlur`, `motionBlurAmount` | nothing | none | Leave the default |
| **Overlay** Text | Title, Caption, Label, Highlight, Serif, Handwritten, Headline, Subtitle and 22 more | `POST .../text-overlays` (`presetId`, font, size, `point`, `animation`, `transition`), batch `add_text_overlay`; `GET`/`POST`/`DELETE /text-presets` | refuses text cards | the Text family cards, title pins | Ranked 2 |
| Overlay: Shapes | Square, circle, star, arrow, path | `POST .../shape-overlays`, batch `add_shape_overlay` | nothing | shape pins | With Ranked 12, an arrow on a click |
| Overlay: Media | Image or video floating over the clip | `POST .../overlays` (`sourceId` or `motionDocumentId`), batch `add_media_overlay` | nothing | b-roll, logo and gif pins | Ranked 4 |
| Overlay: External media | Pinterest, Are.na, mymind saves | `POST /library` `from` | nothing | none | Leave it |
| Overlay: Stickers | Animated stickers | no endpoint | nothing | gif pins | By hand when a beat wants one |
| Overlay: Sounds | Catalog sound effects (Button Click, UI Reveal, Notification Chime...) | `POST .../sound-effects` (`presetId` or our `sourceId`, `volume`), batch `add_sound_effect`; catalog `GET /library?scope=default&type=sound-effect` | nothing | the pack's 31 sound pins, `SFX_GAIN = 0.4` | Ranked 6 |
| Overlay: Vintage videos | Public-domain film shots | `GET /library?scope=vintage`, `POST /library` `from: vintage` | nothing | the B-roll folder | Leave it |
| Overlay: Tella Motion | Motion graphics as clips, overlays or b-roll | `/motion/*`, `POST /motion/clips`, overlay `motionDocumentId` | nothing | our Remotion clips (`motion-design`) | Keep Remotion. Upload the render as a media overlay (Ranked 4) |
| **Style** Background | Image, animated, colour, gradient, shader behind the frames | `PATCH .../clips/{clipId}` `background`; catalog `GET /backgrounds` | nothing | the card's background layer | Ranked 9 |
| Style: Border, shape | Shadow, glass, snake...; square, regular, squircle corners | clip `borderStyle`, `corners` | nothing | the card's corner radius | Ranked 9 |
| Style: Filters | None, Warm, Cool, Crisp, Fade, Mono, sliders, a LUT | `PATCH .../clips/{clipId}/filters` (camera, screen or both) | nothing | `colorAdjustments`, `STANDARD.uplighting` | Ranked 9 |
| Style: Camera background | Original, Blur or Color behind the presenter | no endpoint | nothing | the keyed `CAM GS` track | By hand |
| Style: Logo on video | A logo watermark | no endpoint | nothing | the logo layer on pack cards | By hand, once per video |
| **Subs** Subtitles and styles | Burned-in captions; our saved styles Brand house, A, B, C plus 27 of Tella's | `GET /subtitle-presets`, `PUT /videos/{id}/subtitle-preset`, `POST /subtitle-presets`; `PATCH /videos/{id}` `captionStyle`, `captionFontFamily`, `captionSize`, `captionGrouping`, `captionPosition`, `subtitlesEnabled`; export `subtitles: true` burns them | `place` applies Brand house (Tella's Backdrop when it's missing, and says so) and turns `subtitlesEnabled` on; the export sends `subtitles: true` | the caption layer, updated before every export | Keep |
| Subs: Transcript words | Fix a misheard word, hide one from captions | `PATCH .../clips/{clipId}/transcript/words` (`text` or `hidden`, 100 per call) | `place` sends the edit's own spellings (`respell`, `retime --respell`, matched by time) and the caption library's pairs, so a pull keeps them; a cut word can't be edited | `editor-os transcript --learn`, the caption library | Keep |
| Subs: Caption files, translations | SRT or VTT, a translated track | `GET /videos/{id}/captions?format=srt&lang=`; adding a language has no endpoint | nothing | the SRT export | Pull the SRT for the YouTube upload. Ranked 11 |
| **Audio** Background music | A looping bed: curated presets or an upload, one volume | `PUT`/`DELETE /videos/{id}/background-music` (`presetId` or `sourceId`, `volume` 0 to 1, default 0.2); `GET .../background-music/beats` | nothing | the `music` skill's bed | Ranked 5 |
| Audio: Studio Voice | AI voice clean-up, off, low or high | `PATCH /videos/{id}` `studioSound`, `studioSoundLevel`; clip `studioSound` opts out | nothing | Studio Sound at 50% | Ranked 7 |
| Audio: Effects | Clear voice, Warm, Broadcast, Phone, Room, Hall | no endpoint | nothing | none | By hand, if ever |
| Audio: Levels | Master, mic and system audio, per video or per clip | `PATCH /videos/{id}` `microphoneVolume`, `systemAudioVolume`; same on a clip | nothing | one live mic track, other audio at 10% | Ranked 7 |
| Audio: Eye contact | AI moves the gaze to the lens | `PATCH /videos/{id}` `eyeContact` | nothing | none in our pipeline | The author's call per video, so the CLI only takes a flag |
| **Redo** Re-record | Deletes a clip's recording and edits, records it again | no replace verb; `POST /videos/{id}/recording-link` only adds a new clip at the end | nothing | a pickup take | By hand. The sidebar's Redo opens this confirm, so never click it on a live video |
| **Media** Library, upload, generate | Add, upload, browse, AI-generate images, video and sounds | `POST /sources`, `POST`/`GET /library`, `POST /library/imports` (a URL), `POST /library/generations` | nothing | the drive library, `B-roll/` | The upload helper under Ranked 4, 5 and 6 |
| **Agent** Chat and skills | Plan a Video, Auto Cut, Auto Layouts, Remove Mistakes; Claude or GPT models; spends AI credits | `POST`/`GET /agent-chats` (`prompt`, `model`, `effort`) | nothing | none | Don't drive it. Our plan is the edit, and it would redo cuts and layouts |
| **Clip menu** Rename | Names a clip | clip `name` | `place` names each clip after its row's chapter title ([layouts.md](layouts.md#the-tella-route)) | none | Keep |
| Clip: Trim | Edits the clip's cuts | clip `cuts` | yes | Ignore ranges | Keep |
| Clip: Mute audio | Silences a clip | clip `microphoneVolume: 0`, `systemAudioVolume: 0` | nothing | a muted track | When a beat needs it |
| Clip: Split at current time | Two clips from one | `POST .../clips/{clipId}/split` `atMs` | per Chapter Card | a marker | Keep |
| Clip: Duplicate | Copy after the source | `POST .../clips/{clipId}/duplicate` | nothing | none | Leave it |
| Clip: Copy to existing or new video | Moves a clip between videos | no endpoint (`POST /videos/{id}/duplicate` copies a whole video) | nothing | none | By hand |
| Clip: Download | One file per clip | `POST /videos/{id}/exports` `granularity: clips`, `tracks` or `raw` (every clip) | whole video only | none | Leave it |
| Clip: Add clip, camera or screen source to media library | Reuse a take | `GET .../clips/{clipId}/sources`, then `POST /library` with that `sourceId` | nothing | none | Leave it |
| Clip: Delete, reorder, add | | `DELETE .../clips/{clipId}`, `POST .../reorder`, `POST /videos/{id}/clips` | nothing | none | Leave it |
| **Canvas bar** Crop | Adjust camera or screen framing | clip `cameraCrop`, `cameraFocusPoint`, `keepCameraFaceCentered`, `mirrorCamera`; layout `crop`; `POST .../auto-crop` | nothing | `layer set` box | Auto-crop screen clips with the house style |
| Canvas bar: Editing quality | Low-res, Hi-res, Source preview | none, preview only | n/a | n/a | n/a |
| **Download** Export | MP4, M4A audio, clips zip, JPG/WebP/GIF thumbnail, SRT/VTT, TXT; subtitles burned, SRT or none; HD or 4K; 30 or 60 fps; speed | `POST /videos/{id}/exports` (`granularity`, `resolution`, `fps`, `speed`, `subtitles`), `GET .../exports/{exportId}`; audio-only has no `granularity` | `video`, `1080p`, `subtitles: true` | Descript export | Ranked 11 |
| Thumbnail | Share-page thumbnail from a frame or an image | `GET`/`PUT`/`DELETE /videos/{id}/thumbnail` (`sourceId` or `inpointMs`) | nothing | `youtube-thumbnail` makes YouTube's | Ranked 13 |
| Top menu: CTA | Buttons on the share page | `PATCH /videos/{id}` `callToAction`, `secondaryCallToAction` | nothing | CTA cards | Leave it. The CTA is a card in the video |
| Top menu: Theme | Share-page look | no endpoint | nothing | none | By hand |
| Analytics | Plays, watch time, retention | `GET /videos/{id}/analytics`, `/views`, `/analytics` | nothing | YouTube Studio | Leave it |
| Playlists, tags | Workspace organisation | `/playlists`, `/playlist-groups`, `/tags` | nothing | none | Leave it |
| Publish | Posts to YouTube, LinkedIn, X, Instagram, Facebook | `POST /videos/{id}/publish` | nothing | the `youtube` skill ships | Leave it. It posts under the author's name |
| Live preview | A player link that shows each saved edit | `POST /videos/{id}/live-preview` (24 h, token in the fragment) | nothing | none | Print it after `place`, for the author only |
| Frames, storyboard | Stills and strips for checking | `GET /videos/{id}/storyboard`, `.../thumbnail`, `.../clips/{clipId}/storyboard` | nothing | `pnpm descript pull` frames | Use it in the checks pass |
| Documents, webhooks | Write-ups from the transcript; `export.ready` events | `POST /videos/{id}/documents`; `/webhooks/endpoints` | nothing (export is polled) | none | Leave it |

## What to add next

Ranked by what lifts an Brand tutorial the most. Size is engineering time with tests: S is under a day, M is 2 or 3 days, L is a week.

1. **Subtitles in the house style, with names spelled right.** Done 15 Nov 2026: `place` sends all of it (A17). S. `PUT /videos/{id}/subtitle-preset` with Brand house's `presetId` (find it in `GET /subtitle-presets`, `scope: personal`), `PATCH /videos/{id}` `subtitlesEnabled: true`, and `subtitles: true` on the export, which today burns nothing. Before that, `PATCH .../transcript/words` with the caption library's pairs, so "ClickUp" isn't "click up" on screen.
2. **Text cards as text overlays.** M. Each approved Text card (19 in EC49, 14 in EA20) becomes `add_text_overlay` ops in the same `edits` batch as the sections, its `Text 1..N` lines from `layout lines`, a saved text preset per card, the section under it `camera-only`. Then `place` stops refusing them. The 2 to 3 days go on placing 8 card shapes by `point` and `dimensions`.
3. **Zooms on screen demos.** S to M. `POST .../zooms/auto` on each screen clip (`intensity: subtle`) is S; a manual `add_zoom` per demo beat, on the word the beat names, is M. Set `zoomAnimationStyle` with it.
4. **B-roll and media overlays.** L. The upload helper (`POST /sources`, PUT the bytes, poll `GET /sources/{sourceId}`, then `POST /library` `scope: video`) plus the mapping: a media card's pin becomes layout `media`, a floating pin becomes `add_media_overlay`, and our Remotion renders ride the same path. It's L because Descript pins carry no Tella geometry, so every pin family needs a rule.
5. **The music bed.** S once 4's upload helper exists, M without it. Upload the `music` skill's pick as `kind: audio`, then `PUT /videos/{id}/background-music` at `volume` 0.1 to 0.2. Tella loops it over the whole video, so a bed shorter than the cut repeats; check its seconds first.
6. **Sound effects.** M. Upload the kit's 9 sounds once to the workspace library and keep their `sourceId`s, then send each pack sound pin as `add_sound_effect` at `volume: 0.4` on its card's start. The catalog's `presetId`s are a fallback, not our names.
7. **Studio Sound and levels.** S. `PATCH /videos/{id}` `studioSoundLevel: low` (our 50% sits between Tella's low and high, so listen to both once), and `systemAudioVolume` to 0.1 on a voice-led clip.
8. **Chapters.** Done 15 Nov 2026: `place` sends them, clip 1's title included at 0:00 (A17). S. After the splits, `PUT /videos/{id}/chapters` with one entry per Chapter Card: seconds on the final timeline, and the same title `place` already gives the clip.
9. **The house style.** S. Read Brand house's background, `borderStyle`, `corners` and filters off a styled clip once (the clips of `vid_cmvtt7txv00vc02mrhn72fa65` say `glass`, `regular` and an image background), store them, and write them on every clip, plus `defaultClipTransition`, `layoutAnimationStyle` and `cursor`.
10. **The Brand house favorite as a custom layout.** M. REST can't apply a Favorite, so either call the MCP's `apply_saved_layout` per section (not batchable), or send its geometry as `layout: {kind: "custom"}` in the batch. The custom route keeps one batch, so take it.
11. **Export options.** S. `--4k` (`resolution: 4k`, paid plan), `fps: 60`, `subtitles`, and `GET /videos/{id}/captions?format=srt` saved beside `cut.mp4` for the YouTube upload.
12. **Blurs and callouts on demos.** M. `add_blur` over an email, key or client name the checks pass flags; `add_highlight` plus a label on the click a step names.
13. **The thumbnail.** S. `PUT /videos/{id}/thumbnail` with the `youtube-thumbnail` render, so the share page matches YouTube.

## By hand, the API can't reach it

Transcript language and added subtitle languages, voice Effects (Clear voice, Warm, Broadcast, Phone, Room, Hall), Camera background (Blur or Color), Logo on video, Stickers, the Theme, Reactions and Copy link button toggles, Copy to existing or new video, Re-record in place, Buffers, the Mistakes and Auto Layouts buttons (only through the agent chat), the M4A audio-only export, and a Favorite through REST (the MCP reaches it).
