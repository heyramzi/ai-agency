# Writing ClickUp Doc pages

## Never write markdown tables into a Doc page

ClickUp renders a markdown table as a real table block: fixed narrow columns,
every cell wrapping over three or four lines, a drag handle on each row. A
two-column term-and-definition table becomes unreadable, and the reader cannot
scan it on mobile at all.

Write the same content as a bulleted list with a bold lead-in instead:

```markdown
- **Workspace.** Your whole company. Keep exactly one, nothing moves between them.
- **Space.** A department or business entity. Marketing, Sales, Delivery.
```

Reserve tables for really tabular data with short cells (three or more
columns of values, no prose). When in doubt, use the list.
