---
name: search-console
description: Query Google Search Console data for SEO audits, keyword performance, content gaps, and ranking analysis. This skill should be used when the user wants to check search performance, analyze keyword rankings, find content opportunities, compare periods, or audit SEO health using real GSC data. Triggers on "search console", "GSC", "check rankings", "keyword performance", "search impressions", "content gaps", "what am I ranking for", "SEO audit", "search traffic".
---

# Google Search Console

Query GSC search analytics via the Search Console API using gcloud application-default credentials.

## Prerequisites

One-time auth setup (must include the `webmasters.readonly` scope):

```bash
gcloud auth application-default login \
    --scopes=openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/webmasters.readonly
```

If the script returns a 403 scope error, prompt the user to re-run the auth command interactively via `! gcloud auth application-default login ...`.

## CLI Reference

The script at `scripts/gsc.py` provides all GSC queries:

```bash
GSC="python3 <skill-dir>/scripts/gsc.py"
```

### Commands

| Command                   | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `$GSC sites`              | List verified sites                         |
| `$GSC top-queries <site>` | Top queries by clicks                       |
| `$GSC top-pages <site>`   | Top pages by clicks                         |
| `$GSC query <site>`       | Custom query with dimensions                |
| `$GSC compare <site>`     | Compare current vs previous period          |
| `$GSC gaps <site>`        | Find high-impression, low-CTR opportunities |

### Common Flags

| Flag                        | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `--days 28`                 | Lookback period (default: 28 days)             |
| `--limit 50`                | Max rows returned                              |
| `--query-filter "notch"`    | Filter queries containing string               |
| `--page-filter "/blog/"`    | Filter pages containing string                 |
| `--dimensions "query,page"` | Dimensions: query, page, country, device, date |
| `--start-date 2026-01-01`   | Custom start date                              |
| `--end-date 2026-01-31`     | Custom end date                                |

## Workflows

### Weekly Review

A 5-minute scan that surfaces what changed this week. Run every Monday.

```bash
# 1. Period-over-period delta
$GSC compare <site> --days 7 --limit 30

# 2. Quick wins: high-impression, low-CTR queries
$GSC gaps <site> --min-impressions 100 --max-ctr 0.03 --max-position 20 --limit 20

# 3. Top movers in the last week
$GSC top-queries <site> --days 7 --limit 50
```

Report back in three buckets:

1. **What's up**: pages and queries with the biggest click increase vs previous 7 days.
2. **What's down**: pages and queries with the biggest click drop. Diagnose: did position drop, did impressions drop, or did CTR drop?
3. **Quick wins**: gap rows sorted by potential clicks. Recommend a meta-rewrite sprint for the top 5.

### SEO Performance Audit

Run the full set for a complete search performance picture:

```bash
$GSC sites
$GSC top-queries <site> --limit 50 --days 28
$GSC top-pages <site> --limit 30 --days 28
$GSC compare <site> --days 28 --limit 30
$GSC gaps <site> --min-impressions 50 --max-ctr 0.03 --max-position 20
```

After collecting data, check: which queries are position 5-15 (close to page 1, worth optimizing), and whether keyword clusters exist with no dedicated page. See Content Gap Identification below for interpreting the gaps output.

### Keyword Analysis for a Specific Topic

To check performance for a keyword cluster:

```bash
# All queries containing "notch"
$GSC top-queries <site> --query-filter "notch" --limit 30

# Performance of a specific page
$GSC query <site> --page-filter "/blog/best-mac-notch-apps" --dimensions "query" --limit 30

# Queries by page to detect cannibalization
$GSC query <site> --query-filter "dynamic island" --dimensions "query,page" --limit 30
```

### Content Gap Identification

The `gaps` command finds queries where the site gets impressions but low click-through:

```bash
$GSC gaps <site> --min-impressions 100 --max-ctr 0.02 --max-position 15
```

Interpret results:

- **Position 1-3, low CTR**: Title/meta description needs improvement
- **Position 4-10**: On page 1 but below fold; content quality or on-page SEO needs work
- **Position 11-20**: Page 2; a better article could push to page 1
- **"Potential Clicks"** column estimates traffic if CTR matched the average for that position

### Blog Content Planning

To identify what content to write next:

```bash
# Check existing blog performance
$GSC top-pages <site> --page-filter "/blog/" --limit 30

# Find queries hitting the homepage (could have dedicated pages)
$GSC query <site> --page-filter "/" --dimensions "query" --limit 50

# Queries with no good page match (potential new articles)
$GSC gaps <site> --min-impressions 30 --max-ctr 0.01 --max-position 30 --limit 50
```

### Monitoring After Content Changes

After publishing or updating content, track impact:

```bash
# Compare 14-day windows for early impact
$GSC compare <site> --days 14 --limit 30

# Check a specific page
$GSC query <site> --page-filter "/blog/new-article" --dimensions "query,date" --limit 50 --days 14
```

## Troubleshooting

| Error                   | Fix                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------- |
| 403 insufficient scopes | Re-run `gcloud auth application-default login` with `--scopes` flag from Prerequisites |
| 403 forbidden           | Verify site ownership in Search Console                                                |
| No sites found          | Add and verify the site at search.google.com/search-console                            |
| Empty results           | Check date range (GSC data has a 3-day lag)                                            |
