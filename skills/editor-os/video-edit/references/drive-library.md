# The Descript drive media library

Open this before reorganising "My media", importing to the shelf, or deleting a drive asset. Credentials and the write path: [descript-cli.md](descript-cli.md).

## The drive media library

```bash
pnpm descript library                                  # the tree, with paths and ids
pnpm descript library mkdir "Backgrounds"              # --parent nests it
pnpm descript library rename "brand-grid-3840x2160.mov" "Brand Grid Dark.mov"
pnpm descript library mv "Brand Grid Dark.mov,Brand Grid Light.mov" Backgrounds
pnpm descript library rm "ZZ probe"                    # a folder takes its contents with it
pnpm descript library import sounds.json --folder "Sound Signature"
```

- `/v2/drives/{id}/assets` is the wrong place to read a name: `metadata.default_display_name` is the upload name, forever. Read `library`.
- `library import` (`POST /jobs/import/drive_media`) is the only byte upload, takes no `drive_id`, answers a bare 500 above 3 files while uploading none (the command batches in threes). `--folder` files it, else `Folder/Name.wav` creates the folder. Nothing adopts an existing asset onto the shelf: import from the local originals.
- The shelf is 8 folders: `B-roll/` (own footage by subject), `Backgrounds/`, `CTAs/` (one movie per ask), `Motion/`, `Overlays/` (alpha over the face), `Placeholders/`, `Products/` (per product or vendor), `Sounds/`. A 9th is one of these under a private name. It mirrors the layout project folder for folder.
- Only what a layout plays, read off the document: a card's sound sits on `pinScenes[].timeline.superTau.taus[0].audioSegment.mediaRefId` and never shows in `usage` (8 wavs sat unused for 2 days). Nothing derived: no sequences, fonts or per-project `Roomtone - ...`.
- Names say what the file is. `02_broll_run-park_4k.mov` is 2160x3840 (vertical): read size off `assetJson.quality.original.video` and rename at the source too.
- `Sounds/` uses the kit vocabulary: `whoosh`, `whoosh-hi`, `whoosh-mid`, `whoosh-deep`, `swish`, `zoom`, `riser`, `readout`, `shuffle`, `ui`, `chime`, `chime-soft`, `mouse` (the one voice only the pack plays). The pack carries 11 of them (everything except `zoom` and `chime`); see the layouts page in the studio.
 The names are the sound library's JSON
, also the app's Descript kit shelf: one name from census to timeline (it held `Chime Light` and `Whip Low Whoosh` until 8 Sep 2026). `Sound Signature` became `Sounds` on 9 Sep 2026 to match the project.
- A flat panel of upload names means the client couldn't load the document, and the project isn't messy. On 9 Sep 2026 the drive media endpoint answered 503 (`suppressing local load failure`) and the panel fell back to`brand-testimonials-highlight.mp4`
 while the document said `Products/Brand/Testimonials Highlight.mp4`. Run `pnpm descript tree` before calling a project disorganised.
- Deleting an asset breaks every project that adopted it. `Extra Fast Multimedia Whoosh 3` was uploaded into the layouts project (`lookup_key` names its `projectId`) but adopted by a video project; deleting it from the pack on 8 Sep 2026 left a media reference whose `assetGuid` resolved to nothing (a spinning Files row). Repair touches no card:

```bash
pnpm descript pull <video> "Multimedia Whoosh" --out /tmp     # the artifact usually survives
pnpm descript import <video> fix.json                          # a fresh copy, under a temp name
pnpm descript media swap <video> "Extra Fast Multimedia Whoosh 3" "whoosh-fix-donor.wav"
```

  `media swap` puts the new asset under the id the cards reference, so pins keep place and gain, and it consumes the donor. A reference with no `assetJson` isn't proof of breakage (drive-library adoptions carry none, like both CTA movs there); the test is whether its `assetGuid` appears in `assets <project>`.
