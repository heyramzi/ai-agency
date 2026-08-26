---
name: seo-broken-links
description: "Finds broken links on a site (404s and 5xx), checks redirect chains and audits internal and external link health, returning a prioritised list with source pages. Use when hunting broken or dead links or auditing redirects. Triggers on \"broken links,\" \"link checker,\" \"404 audit,\" \"check links,\" \"find dead links,\" \"redirect chain audit.\" For broader SEO diagnostics see seo-audit."
---

# SEO Broken Links

Crawl a site or page and report links returning 4xx or 5xx, plus suspicious redirect chains. Outputs a fix list grouped by severity.

## When to Use

- Pre-launch link audit
- Post-migration cleanup (after URL restructure)
- Quarterly SEO health check
- Page-specific check before sharing or promoting

## Setup

The script at `scripts/check-links.py` uses Python stdlib plus `requests` and `beautifulsoup4`:

```bash
pip install requests beautifulsoup4
LINKS="python3 <skill-dir>/scripts/check-links.py"
```

## Commands

| Command                                | Purpose                                      |
| -------------------------------------- | -------------------------------------------- |
| `$LINKS page <url>`                    | Check links on a single page                 |
| `$LINKS site <url> --max-pages 50`     | Crawl internally, check links across N pages |
| `$LINKS sitemap <sitemap-url>`         | Check every URL in a sitemap                 |

## Common Flags

| Flag              | Description                                      |
| ----------------- | ------------------------------------------------ |
| `--max-pages 50`  | Crawl cap for `site` mode (default 50)           |
| `--timeout 10`    | Per-request timeout in seconds (default 10)     |
| `--external-only` | Skip internal links                              |
| `--internal-only` | Skip external links                              |
| `--no-redirects`  | Treat 3xx as broken                              |
| `--csv <path>`    | Write results to CSV                             |

## Workflow

1. **Run a page or sitemap check** depending on scope.
2. **Read the output**, grouped into three buckets:
   - **Broken** (4xx, 5xx, connection errors): fix immediately.
   - **Redirect chains** (more than 1 hop): update the link to the final URL.
   - **Slow** (over 3s response): flag for performance review.
3. **Group fixes by source page**: one PR per page is faster than per-link.
4. **Re-run after deploy** to confirm clean.

## Interpreting Results

- **Internal 404**: dead link in your own content. Update or remove.
- **External 404**: third-party page gone. Replace with archive.org link, find alternative, or remove.
- **Redirect chain (2+ hops)**: passes less link equity, slows crawl. Update to final URL.
- **5xx**: server-side error on the target. Re-test later before assuming dead.
- **Connection timeout**: target down or blocking your IP. Re-test.

## Output Format

```
[BROKEN] 2 found
  https://example.com/old-page (404)
    sourced from: https://example.com/blog/post-1, https://example.com/about
  https://thirdparty.com/dead (404)
    sourced from: https://example.com/resources

[REDIRECT CHAIN] 1 found
  https://example.com/a -> /b -> /c (final: /c)
    sourced from: https://example.com/blog/post-2

Checked: 47 links across 12 pages
```

## Related Skills

- **seo-audit**: full SEO diagnostic; calls this skill for the technical-issues bucket.
- **seo-site-architecture**: for restructuring site after broken-link cleanup.
