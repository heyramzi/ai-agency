# Vendored references

Source: https://github.com/AgriciDaniel/claude-youtube (MIT, Daniel Agrici), vendored 2026-07-29.

Only three files were taken, not the whole skill. `claude-youtube` also covers channel audits, SEO,
thumbnails, analytics and monetization, all of which overlap `generate-social`, `youtube-thumbnail`
and the `seo-*` package already in this hub. The hook writer and its two reference guides are the
part that had no equivalent here.

The upstream files in `references/` are unmodified: `hook-variants-upstream.md`,
`emotional-angles-upstream.md`, `retention-scripting-guide.md`.

**One upstream line is overridden and the file is left alone so it stays diffable.**
`emotional-angles-upstream.md`, Quality Checklist: "Hook is specific and first-person."
**It is not.** A hook's subject is the viewer, and the first-person count on camera starts
at zero, from 20 Aug 2026. `SKILL.md`'s own checklist is the one that binds, and
"On camera, every I is a you" holds the measurement. The other reference files
(`shorts-playbook.md`, `shorts-structures.md`) are written for this kit and not from this vendor.
`SKILL.md` is written for this kit, because the upstream hook
writer targets a 30-second long-form opening at roughly 75 words and the gap in this hub was the
1-to-3-second Shorts hook. The upstream 30-second version is kept in
`references/hook-variants-upstream.md` and is still the right tool for long-form.
