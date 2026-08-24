# Task templates, Task-created automations, and the pinned description

The three surfaces ClickUp exposes no API for at all. Every click path below was walked on the live workspace; the labels are given in both languages because the UI flips between them mid-session, and every coordinate is a hint rather than a target.

## Save a task as a workspace task template

From `https://app.clickup.com/t/<TASK_ID>`, waited and loaded:

1. `...` in the task header top right, about (1329, 53) at 1428 wide. The Share
   button sits immediately left of it, so confirm on the screenshot that a menu
   opened with Favorite / Move to / Templates. If Share opened, close it without
   submitting and click further right.
2. **Templates** / **Modèles**, about (1187, 352).
3. **Save as template** / **Enregistrer en tant que modèle**, the second item in
   the submenu, about (1171, 533).
4. The properties dropdown reads **21 of 22 properties**. Open it and uncheck
   **Copy settings for Statuses** / **Copier les paramètres des statuts** so it
   reads 20. That option copies list status settings into wherever the template
   lands, which is not what a task template is for. Close the dropdown by
   clicking the **Template contents** label.
5. Name it, then **Save Template**.
6. ClickUp shows an interim "your template is being created" toast, then the real
   one: **Template created 🎉**. The save is asynchronous. Wait for the second
   toast, because the first one lies about being finished.

The dialog remembers the property choice within a session but resets to 21 on a
fresh page, so re-check it every time.

## Update a saved template in place

A template that is edited in place keeps its id, so every automation pointing at
it picks up the new content on its next run. Creating a second template with the
same name does not, and leaves the automation on the old one.

Same path as above, except step 3 is **Update existing template** / **Mettre à
jour le modèle existant**, the THIRD submenu item, about (1192, 556). Then pick
the template by name from the searchable picker. Templates made by these runs
show as "by <your workspace name>" with a recent timestamp, which is what tells them apart from
an older one with a similar name.

Then: edit the source task first, re-save over the template, and the loop is
closed. Content lives in its `.mjs` source, the builder writes the task, this
path publishes it.

## Task created → Apply template

1. Open the list, click the **lightning bolt** in the top right header row, about
   (1277, 53). A panel titled **AI Fields** opens.
2. **Manage automations** at the bottom of that panel, then **Add Automation**.
   The empty state has its own Add Automation button in the middle.
3. Trigger scope defaults to **Tasks or subtasks**. Change it to **Tasks**.
   Without this the rule fires on the subtasks the template itself creates.
4. Action defaults to Update status. Open it, type `template` (or `modèle`), pick
   **Apply template**.
5. A yellow note appears: the **Templates & duplicated tasks** trigger source has
   been turned off for this action, and the source count drops from 10 to 9.
   ClickUp does that on its own so an import cannot retrigger the rule. Leave it.
6. **Select a template** opens the Template Center. Search, then click the card
   whose title matches exactly, then **Use Template**.
7. Name the rule, add its one-line description, **Create**.

### Editing rules without reloading anything

The Manage panel has a list switcher at its top left with its own search box.
Switching lists there is much faster than navigating. Two traps:

- Results show the space row and the list row indented under it. Clicking the
  space silently scopes the panel to space level, where the list's rules are
  invisible and the panel reads "Let's create your first Automation". If a list
  you know has a rule looks empty, this is why.
- The dropdown stays open after the pick. Press Escape before clicking anything
  behind it, or the click lands back in the dropdown.

The rule's **name and description are inline editable** in the Manage list. Click
the title text, cmd+a, type. Click the grey "Enter description..." line, type.
Click empty space below to commit. Both save without a Save button.

Click the description line at its left edge. A click too far right or low lands
in the panel's Search box instead, where the typed sentence silently becomes a
filter and the list empties. Clear it with the x if that happens; nothing was
written to the rule.

Changing a rule's **action** needs the full form: hover the row, click the pencil,
edit, **Save**.

Deleting a rule: hover the row, red trash icon, then Delete in the confirm.

## Pin a list description

Not in the list settings menu, and not in List Info. It is a per view setting:
the **⚙ Customize view** in the view toolbar → **More options** → **Layout
options** → **Pin description**. The pin therefore has to be set on whichever
view somebody actually lands on, which for a list is `6-<listId>-1`.
