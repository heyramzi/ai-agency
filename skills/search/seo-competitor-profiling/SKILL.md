---
name: seo-competitor-profiling
description: "Researches competitors from a list of URLs and writes structured competitor profile markdown files. Use on 'competitor research', 'competitor analysis', 'profile this competitor', 'competitive intelligence', 'competitor dossier', 'who are my competitors'. For comparison pages built from the profiles see seo-competitor-alternatives, for sales battle cards sales-enablement."
metadata:
  version: 1.0.0
tags: [plans, seo]
---

# Competitor Profiling

Take a list of competitor URLs and produce structured profile documents combining live site scraping with SEO and market data.

## What to confirm before profiling
If `.agents/product-marketing-context.md` or `.claude/product-marketing-context.md` exists, read first.

Before profiling, confirm:
1. Competitor URLs
2. Your product (if not in context)
3. Depth (quick scan or deep profile)
4. Focus areas (pricing, positioning, SEO, content)

If URLs and context are available, proceed without asking.

## Core Principles

- **Facts over opinions.** Every claim traces to a source (scraped page, review, SEO metric). Label inferences.
- **Structured and comparable.** All profiles follow the same template.
- **Current data.** Include generation date; flag stale content.
- **Honest assessment.** Don't exaggerate weaknesses or downplay strengths.

## Raw Data Storage

Persist raw data before synthesis so it can be re-read or audited without re-running API calls.

```
competitor-profiles/
├── raw/
│   └── <competitor-slug>/
│       └── <YYYY-MM-DD>/
│           ├── scrapes/    # one .md per page
│           ├── seo/        # one .json per DataForSEO call
│           └── reviews/    # one .md or .json per source
├── <competitor-slug>.md    # synthesized profile
└── _summary.md             # cross-competitor summary
```

Rules: lowercase hyphenated slug · YYYY-MM-DD date supports re-runs and diffs · Firecrawl scrapes save as raw markdown · DataForSEO saves as raw JSON · reviews saved as cleaned .md or raw .json · never overwrite a prior date.

Profile must reference raw data folder in `## Raw Data Sources`.

## Research Process

### Phase 1: Site Scraping (Firecrawl)

**Step 1, map site:** `firecrawl_map` on competitor URL to discover structure. Prioritize: homepage, pricing, features/product, about, blog, customers/case studies, integrations, changelog.

**Step 2, scrape pages:** `firecrawl_scrape` each key page URL. Save to `scrapes/<page-name>.md` before extracting.

| Page | Extract |
| --- | --- |
| Homepage | Headline, subhead, value prop, primary CTA, social proof, audience signals |
| Pricing | Tiers, prices, features per tier, billing options, trial/free, enterprise signals |
| Features | Categories, capabilities, descriptions, screenshots/demo signals |
| About | Founding story, team size, funding, mission, HQ |
| Customers | Named customers, logos, industries, case study themes |
| Integrations | Count, key integrations, categories |
| Changelog | Release velocity, focus areas, product direction |

**Step 3, reviews (optional, high-value):** Firecrawl for G2, Capterra, Product Hunt, TrustRadius. Save to `reviews/<source>.md`. Extract: rating, review count, praise themes, complaint themes, 3-5 representative quotes.

### Phase 2: SEO & Market Data (DataForSEO)

Save each raw response as JSON to `seo/<endpoint-name>.json`. Full MCP tool list: [references/tool-reference.md](references/tool-reference.md).

Key endpoints:
- **Domain & backlinks:** `backlinks_summary`, `backlinks_referring_domains`
- **Keywords & traffic:** `dataforseo_labs_google_ranked_keywords`, `dataforseo_labs_google_domain_rank_overview`, `dataforseo_labs_google_keywords_for_site`
- **Positioning:** `dataforseo_labs_google_competitors_domain`, `dataforseo_labs_google_relevant_pages`

### Phase 3: Synthesis

Cross-reference claims. If they claim "10,000 customers" but their traffic/backlinks don't support it, flag.

## Output Format

Profile saved to `competitor-profiles/[competitor-name].md`. Full templates: [references/templates.md](references/templates.md).

Required sections:
- **At a Glance** (URL, generated date, depth, tagline, founded, HQ, team, funding, domain rank, est. organic traffic, referring domains, organic keywords)
- **Positioning & Messaging** (primary value prop, target audience, positioning angle, key messaging themes with source page)
- **Product & Features** (core capabilities, differentiators, integrations count + top 5-10, product direction)
- **Pricing** (tier table, billing, free trial, pricing quirks)
- **Customers & Social Proof** (named customers, industries, case study themes, G2/Capterra ratings)
- **SEO & Content Strategy** (organic strength, top organic pages, content strategy signals, backlink profile)
- **Strengths & Weaknesses** (each with evidence source)
- **Competitive Implications for [Your Product]** (where they're strong vs us, where we're strong, opportunities, threats)
- **Raw Data Sources** (pages scraped, SEO data pulled, reviews pulled with dates)

### Summary Document

After all profiles, generate `_summary.md` with:
1. Competitor overview (one paragraph)
2. Comparison table (key metrics side-by-side)
3. Positioning map (simple↔complex, cheap↔premium)
4. 3-5 strategic takeaways
5. Gaps and opportunities

## Quick Scan vs Deep Profile

**Quick scan (faster):** scrape homepage + pricing only; domain rank overview + ranked keywords; skip reviews, tech stack, backlink detail; abbreviated profile.

**Deep profile:** all key pages + review sites; full backlink + keyword intelligence + competitor discovery; tech stack, content analysis, review mining; full template.

Default: quick scan unless user requests deep or ≤3 competitors.

## Multiple Competitors

1. Parallelize scraping (homepages together, then pricing, etc.)
2. Consistent metrics (same DataForSEO endpoints for all)
3. Build summary last
4. If 10+ competitors, profile top 5 first by relevance

## Updating Profiles

Snapshots only. When updating: check pricing (most volatile) · re-pull SEO metrics · scan changelog · update "Generated" date · add `## Change Log` section with what changed.

## Related Skills

- **seo-competitor-alternatives**. comparison/alternative pages from profiles
- **customer-research**. mining reviews and community sentiment
- **seo-content-strategy**. using competitor gaps
- **seo-audit**. your site vs competitors
- **sales-enablement**. battle cards from profiles
- **paid-media-manager**. competitor ad strategies
- **pricing-strategy**. deeper pricing analysis
