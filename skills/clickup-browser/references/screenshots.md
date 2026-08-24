# Photographing a ClickUp view

What to do when the extension is unavailable and a view still has to be captured.

## Photograph a view, without the extension

A screenshot of a view for a deck or a report does not need Claude in Chrome, and
should not wait for it. Copy the signed-in Chrome profile, run a second Chrome
headless against the copy on a port of your own, and speak CDP to it. The
`presentations` skill holds the profile copy recipe and the two traps in it (the
zero-byte `Cookies` race, and `IndexedDB` carrying ClickUp's stale offline cache
into every screenshot). What matters here is what to point it at.

The whole capture is four CDP calls: `Page.enable`,
`Emulation.setDeviceMetricsOverride` with `deviceScaleFactor: 2`, `Page.navigate`,
then `Page.captureScreenshot` after 15 to 20 seconds. ClickUp renders correctly
headless. Then crop the content pane out of the frame rather than trying to hide
the chrome:

- **The title is the load check.** A wrong view code loads a page whose
  `document.title` is the bare string `ClickUp`. A loaded view reads
  `<view name> | <list name> | <workspace> (List)`. Assert on it before capturing.
- **Crop, do not hide.** `display:none` on the sidebar collapses ClickUp's
  virtualised rows to blank. Capture the whole 1700x1200 frame and cut the content
  pane out with PIL: the sidebar ends around x=660 at `deviceScaleFactor: 2`, the
  view tabs and the notification banner sit above y=445, and the row area runs to
  the horizontal scrollbar. Read the picture and adjust; those numbers move with
  the window.
- **Set the columns before you shoot.** `cu view create --list <id> --name X
  --type list --group-by priority --columns-json '{"fields":[...]}'` decides what
  the screenshot says. A `Recommendation` column at `"width":520` reads; at 420 it
  ellipses mid sentence.
- **Grouping that comes back all in one bucket is a ClickApp, not a view.** See
  the ClickApps note in `clickup-cli`: the API stores a priority on a space that
  has Priorities switched off, and the UI then draws every task under
  "No Priority".
- **The hover row is a different row.** Whatever the cursor sits on renders its
  action buttons. Park the mouse outside the table before every capture.

## The helper is 1x, CDP is not

`captureScreenshot(path)` writes at CSS pixels and **ignores
`Emulation.setDeviceMetricsOverride`'s `deviceScaleFactor`**: a 1600x950 viewport at factor
2 still came back 1600x950. Driving the protocol directly honours it, so for anything going
on camera:

    await cdp('Emulation.setDeviceMetricsOverride', { width:1600, height:950, deviceScaleFactor:2, mobile:false })
    const r = await cdp('Page.captureScreenshot', { format:'png', captureBeyondViewport:false })
    fs.writeFileSync(path, Buffer.from(r.data, 'base64'))

That returns 3200x1900. Note the helper takes a **plain string path**; passing `{ path }`
throws inside `writeFile`.

Then crop rather than hide, per `references/screenshots.md`. Cropping the left rail is also
what keeps a real client's space name out of a demo frame, which is the blast-radius rule
above: the demo workspace's own space name sits in the sidebar and lands in every
uncropped shot.

