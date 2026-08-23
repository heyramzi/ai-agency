# Reorganising the media browser by hand

The route when there is no API path: driving the Descript web editor with a browser
automation tool. Every command below is described by what it does, not by which
driver runs it, because the selectors are what carry over.

Everything here runs in the **Project** panel, not the Media panel.
`sidebar-project-item` in the left rail opens it; `sidebar-media-item` opens the
stock/library pane, which lists nothing from the project and is the wrong surface.

Open the project on any composition, grow the viewport so the whole file list fits
(1600 x 1500 covers about 20 rows), and read the tree from
`[data-testid="sidebar-content"]`.

`sidebar-project-item` **toggles**. The panel is usually open already, so a first
click closes it and `sidebar-content` comes back null. Click again and read the tree
rather than concluding the panel failed to open.

Nine things this cost to learn:

- **There is no move command.** A media file's context menu offers Rename, New
  composition from file, Create sequence, Insert into script, Add as new layer,
  Re-transcribe, Identify speakers, Detect filler words, Detach audio, Replace, Set
  A/V sync offset, Repair audio drift, Add to media library, Download, Delete, Change
  visual role, and no move. Drag is the route.
- **The drop needs a slow drag.** Mouse down, pause, a few waypoints, then hover the
  target row a second before mouse up. A fast drag reports `Dragging was cancelled.`
  and changes nothing.
- **The tree announces every drop.** The last line of the panel's text is a live
  region reading `Item "<name>" was dropped in Group "<folder>"`. That is the cheap
  verification, and `get_project` confirms it server-side as a path change on the
  media key. **A stale announcement means the drop failed**, and it fails predictably:
  the drop that lands re-renders the tree, the target folder auto-expands, and the
  live-region line is itself a row, so the *next* drag is the one that misses. Read
  the announcement after every move and re-run any that names the previous file. Two
  of six moves needed exactly one retry each, and both landed on it.
- **"New folder" nests inside whatever is selected.** Right-clicking a folder and
  taking New folder puts the new folder *inside* it, and with a file selected the menu
  has no New folder at all. Clear the selection by left-clicking the empty area below
  the list, then right-click there for the root menu. There is no drop target for the
  root, so a folder created in the wrong place cannot be dragged out: move its files
  into a correct folder and delete the empty one.
- **Renaming: type straight over the pre-selected text.** `Meta+a` closes the field
  instead of selecting it, and the rename then commits unchanged. Enter commits.
- **A new folder opens straight into that rename field, and its row never settles.**
  The row keeps reading `Group` for as long as the field is open, so a wait loop
  watching for `Untitled Folder` in the tree text times out on a folder that was
  created perfectly. The settle signal is
  `document.activeElement.value === "Untitled Folder"`. Name it there, in the same
  breath as creating it. The right-click Rename pass is only for renaming later.
- **Assert `elementFromPoint` before every click.** A composition row sits under the
  sticky Files toolbar, so its rect is honest while the point belongs to the toolbar,
  and the right-click then opens nothing at all with no error anywhere.
  `el.scrollIntoView({block:'center'})`, re-read the rect, and check the point carries
  the row's own text.
- **Stray keys land in the Files search box and empty the tree.** `No results` under
  Files usually means a filter, not a missing file, so read the `search` input's value
  first. A click puts the caret mid-text, so clear it with the React native value
  setter plus an `input` event rather than with backspaces.
- **Stay off "Edit sequence".** Taking it from a sequence's context menu killed the
  browser page outright: no tabs left, session restarts. Nothing was lost, but the run
  starts again.

The `Add` button at the top of the panel (`add-composition-menu-trigger`) belongs to
**Compositions**, not Files. Its Folder item creates a composition group, and one
created that way has to be deleted from the composition list.

Whichever driver you use, two habits carry: focus the tab before typing or pressing a
key, and re-read an element's rect after every save, because the panel re-renders on
each write and a ref captured before it is stale after.
