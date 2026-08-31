# Search Console workflows

## Contents

- Rebuild the index coverage report
- Harvest before you write
- Weekly Review
- SEO Performance Audit
- Keyword Analysis for a Specific Topic
- Content Gap Identification
- Long queries at 0 per cent CTR are not a CTR failure
- Blog Content Planning
- Monitoring After Content Changes

### Rebuild the index coverage report

**The coverage report's per-reason URL lists are UI-only.** The API will not hand them over,
and no amount of parameter guessing changes that. URL Inspection will, one URL at a time,
which is enough to rebuild the whole report if you bring your own list.

```bash
# 1. Build the URL universe: the sitemap plus everything Google has ever shown.
curl -s https://<site>/sitemap.xml | grep -o '<loc>[^<]*' | cut -c6- > urls.txt
$GSC query <site> --dimensions page --days 480 --limit 5000 | ... >> urls.txt

# 2. Ask Google what it thinks of each one. 2000/day per property, 600/minute.
$GSC inspect <site> urls.txt --out inspect.json --workers 8

# 3. Read the URL list behind any bucket.
$GSC inspect <site> urls.txt --out inspect.json --state "Soft 404"
```

**Read `lastCrawlTime` before you fix anything.** A "Not found (404)" whose last crawl
predates the repair is a stale record, not a live bug: the report keeps showing it until
Google recrawls, and a URL with no traffic can wait months for that. Check the URL live
before writing code against it. The lever for the stale ones is **Validate Fix** in the
coverage report, which is UI-only.

**Removals are not an indexing fix**, and the tool has three traps worth knowing:
a bare-host prefix (`https://sub.example.com/`) triggers a "Remove entire site?" dialog,
so scope removals to a path; a URL that is unknown to Google is accepted by the form and
then silently never appears in the list; and the New Request dialog stops opening after a
handful of submissions in one sitting, which reads like a broken page but is throttling.

### Harvest before you write

This is the highest-yield run in the skill, and it comes before any keyword research. Google
has already told you which queries it associates with the domain. Some of those queries have
no page behind them.

```bash
$GSC orphans <site> --days 90            # queries ranking with no page that targets them
$GSC cannibals <site> --days 90          # queries your own pages are splitting
```

`orphans` tokenises each query, tokenises the URL of the page collecting its impressions, and
reports the share of query tokens the URL covers. A low coverage row means Google is showing a
page that is about something adjacent, which is the exact signal that the query deserves a page
of its own.

Read the output in this order:

1. **Coverage 0 per cent with a competitor's name in the query.** The strongest row there is.
   You rank on a brand you have never written about. One alternative page, and the query has
   somewhere to land.
2. **Coverage under 50 per cent on a category phrase.** The page ranking is close but not
   exact. Decide between a new page and reshaping the existing one. Never both.
3. **Anything the `cannibals` run also lists.** Fix the split first. A new page added on top of
   a query that already splits three ways makes it split four ways.

The `Potential` column prices the row at the average CTR for position 3, so it is the ceiling
rather than a forecast. Use it to sort, not to promise.

Then validate before writing. A gap is not an opportunity until three things hold: the query
has real monthly volume, the intent matches what you sell, and no page you own already answers
it. Skip any row that fails one of the three.

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

After collecting data, check: which queries are position 5-15 (close to page 1, worth tuning), and whether keyword clusters exist with no dedicated page. See Content Gap Identification below for interpreting the gaps output.

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

`gaps` finds pages that are shown and not clicked. `orphans` finds queries with no page at all.
They are different jobs and the fixes do not overlap: one is a title rewrite, the other is a new
page.

### Long queries at 0 per cent CTR are not a CTR failure

A cluster of long, machine-shaped queries sitting at position 5 to 9 with zero clicks is not a
title problem. Those are AI Overview and AI Mode fan-out queries, where one user question is
expanded into a dozen sub-queries that never produce a click. Rewriting titles against them
wastes the sprint.

Tell them apart by shape. `clickup unlimited price per user per month billed annually 2026` is
nobody's typing. `clickup pricing` is. The synthetic ones cluster around one page, run long, and
sit at exactly zero clicks rather than a low number.

The right response is to be the page the answer is built from: put the direct answer in the
first screen, keep the facts in a table a machine can lift, and carry the matching schema. Treat
those rows as citation opportunities, and drop them out of the CTR queue.

Search Console's generative AI report is UI-only. The v3 API rejects `aiMode`, `aiOverview` and
`generativeAi` as search types (verified 14 Aug 2026), so `--search-type` stays on web, image,
video and news, and AI impressions arrive folded into the web totals.

### Blog Content Planning

To identify what content to write next:

```bash
# Check existing blog performance
$GSC top-pages <site> --page-filter "/blog/" --limit 30

# Find queries hitting the homepage (could have dedicated pages)
$GSC query <site> --page-filter "/" --dimensions "query" --limit 50

# Queries with no page behind them, which is the article queue
$GSC orphans <site> --days 90 --min-impressions 50 --limit 50
```

### Monitoring After Content Changes

After publishing or updating content, track impact:

```bash
# Compare 14-day windows for early impact
$GSC compare <site> --days 14 --limit 30

# Check a specific page
$GSC query <site> --page-filter "/blog/new-article" --dimensions "query,date" --limit 50 --days 14
```
