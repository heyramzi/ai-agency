---
name: clickup-audit
description: "Audits a client ClickUp workspace: hierarchy, views, custom fields, permissions, workflows, automations, integration mapping and custom field schema. Use on 'audit this workspace', 'ClickUp audit', 'review workspace', 'workspace health check'. For internal day-to-day work see clickup-ops, for scripted bulk CRUD clickup-data-manager."
---

# ClickUp Audit

Client workspace assessment: hierarchy, views, fields, workflows, permissions, automations, integrations.

Findings without recommendations are useless. Screenshots without context are noise.

Announce at start: "I'm using the clickup-audit skill to run a systematic workspace audit."

## When to Use

New client engagement, health-check request, prep for optimization/restructuring, onboarding to an existing workspace, custom field analysis for integrations, or integration mapping (Make.com, Shopify, etc.).

## Audit Checklist

### Hierarchy
Too many spaces (>10 for small teams), Space Overload, Excessive Private Spaces, Empty Projects, Complex Hierarchy (>2 folders deep), Inconsistent Naming, Disorganized Structure, Docs in hierarchy (not Doc locations), Whiteboards in hierarchy, Underutilized Lists, Excessive Lists, Low Task Density (1-2 tasks/list).

### Views
Excessive Views, Duplicate Views, Cluttered Views, Underutilized Views, Overcomplicated Views, Unprotected Views, Improper Placement (wrong level), Excessive Public Views, Underutilized Grouping.

### Custom Fields
Field Overload (>15 in a location), Unclear Fields, Unnecessary Fields (duplicate native features), Redundant Information.

### Task Management
Unassigned Tasks, Overdue Tasks, Missing Time Estimates, Missing Dates, Hidden Time Estimates, Unassigned+Unestimated, High Unassigned Rate, Duplication, Unclear Names, Missing Descriptions, Information Overload, Consolidation Needed, Inconsistent Tagging, Type Confusion, Multi-User Assignment, Multi-Assignee Overuse, Suboptimal Subtasks, Overuse of Subtasks, Cycle time increasing.

### Workflow & Status
Inconsistent Workflow, Status Overload, Inconsistent Statuses, Inconsistent Task Management.

### Collaboration
Lack of Guidelines, Underused Team Feature, Members need login, Workload Visibility Issues, Complex Management.

### Reporting
Missing Performance Metrics, Underutilized Reporting, Ineffective Reports, Lack of Sharing, Unused Insights.

### Security, Notifications, Automations
Access Control Issues, Unprotected Views, Notification Overload, Unused Automations, Complex Automations, Missing Integrations, Outdated Automations.

## Process

1. **Setup**: get workspace ID, verify consultant seat. Create audit list from template `t-REDACTED/REDACTED` in Audits folder `REDACTED`, named `Audit {Client Name}`. Gather baseline via `cu hierarchy`, `cu members`.

2. **Systematic review**: for each issue: task name matching checklist, description with context/examples, one screenshot per issue, specific recommendation (effort vs impact), set topic + priority.

3. **Delete non-applicable** template tasks; add new issues not in template.

4. **Prioritize**: Urgent (security, data loss, blocking) / High (cost control, many users) / Normal (best practice) / Low (cosmetic).

## Custom Field Analysis

Critical for integration work. Dropdown fields return **orderindex** (0, 1, 2…), NOT option names or IDs.

- `custom_fields` = simplified key:value map (convenient for reading)
- `custom_fields_original` = full array with field IDs, types, option details, metadata
- Always use **option IDs** for reliable matching in automations and integrations

### Workflow

1. Map hierarchy: `cu hierarchy`
2. Pull task samples from key lists to inspect custom field schemas
3. Compare `custom_fields_original` across lists for inconsistencies
4. Audit status workflows per list (statuses are list-level)

### Integration Mapping (Make.com)

- Document field IDs and option ID mappings. Make uses raw IDs
- Webhook payloads use `fields[]` array with `field_id` and `value`
- Make.com URLs must use **eu1** region
- Dropdown updates via API: send orderindex as value (not name or ID)
- Relationship/dependency fields: value is array of task IDs

## Creating Audit Tasks

```bash
cu task create --list <auditListId> \
  --name "[Issue name from checklist]" \
  --description "..." --markdown \
  --priority high|urgent|normal|low
```

Set custom fields for topic and recommendation:

| Field          | ID                                     |
|----------------|----------------------------------------|
| ClickUp topic  | `4d4c1302-0f26-4bbe-91b7-bce24765144a` |
| Screenshot     | `9ec35982-c1f4-4cdf-8294-fd728d687d75` |
| Recommendation | `03bf9d17-427e-4972-bbdd-762737461118` |
| BATCH          | `af2f2fb5-cc3f-4918-b4ca-9f5e31c16acc` |
| Points         | `43369afa-4a38-4c40-ba5a-9392fb5ea25f` |

### Topic Index

| Index | Category               |
|-------|------------------------|
| 0     | Hierarchy              |
| 1     | Views                  |
| 2     | Custom fields          |
| 3     | Security & Permissions |
| 4     | Task Management        |
| 5     | Workflow               |
| 6     | Settings               |
| 7     | Documents              |
| 8     | Best practices         |
| 9     | Collaboration          |
| 10    | Import & Export        |
| 11    | Notifications          |
| 12    | Reporting              |
| 13    | Automations            |

## Output

```markdown
## Audit Summary: [Client Name]

**Workspace ID:** [ID]
**Audit Date:** [Date]

### Findings by Category
- Hierarchy: X issues
- Views: X issues
...

### Priority Breakdown
- Urgent: X / High: X / Normal: X / Low: X

### Top 3 Recommendations
1. [Most impactful]
2. [Second]
3. [Third]

### Audit List
[ClickUp link]
```

## Deliverables

- **Workspace audit report**: hierarchy map, field inventory, issues
- **Field ID reference**: table of names, IDs, types, option mappings per list
- **Automation spec**: triggers, field updates, status transitions with exact IDs
- **Integration mapping**: ClickUp → external system field mapping

## Red Flags. STOP

- Don't create issues without screenshots
- Don't use vague recommendations ("Fix this")
- Don't skip categories
- Don't change client data (audit is read-only)
- Don't create tasks in the client workspace (findings go in your own list)
- Don't keep non-applicable template items

## Integration

Template: `https://app.clickup.com/template/subcategory/t-REDACTED/REDACTED`
Keep the audit template as a list in your own workspace and copy it per engagement.
