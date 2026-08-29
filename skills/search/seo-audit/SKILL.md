---
name: seo-audit
description: "Full-site SEO diagnosis and remediation, covering crawl, indexation, on-page and content quality, then keyword strategy, rewrites and topic clusters. Use on 'SEO audit', 'technical SEO', 'why am I not ranking', 'SEO health check', 'fix my SEO', 'keyword research'. For a single URL use seo-page-audit, for pages at scale programmatic-seo, for structured data seo-schema-markup, for 404s seo-broken-links."
metadata:
  version: "1.2.0"
---

# SEO Audit

Two phases: diagnose what is wrong, then fix it. Work through both unless the user asks for diagnosis only.

## What to establish about the site
If `.claude/product-marketing-context.md` exists, read first. Only ask for what's not covered.

1. **Site context**. type (SaaS, e-commerce, blog), primary SEO goal, priority keywords/topics
2. **Current state**. known issues, organic traffic level, recent changes/migrations
3. **Scope**. full site or specific pages, technical + on-page or one area, Search Console access

## Audit Framework. Priority Order

1. **Crawlability & Indexation** (can Google find/index?)
2. **Technical foundations** (fast and functional?)
3. **On-page optimization** (content optimized?)
4. **Content quality** (deserves to rank?)
5. **Authority & links** (credibility?)

## Technical SEO

### Crawlability

**Robots.txt**. no unintentional blocks, important pages allowed, sitemap reference.

**XML Sitemap**. exists and accessible, submitted to Search Console, only canonical indexable URLs, updated regularly.

**Site architecture**. important pages within 3 clicks of homepage, logical hierarchy, internal linking, no orphan pages.

**Crawl budget (large sites)**. parameterized URLs controlled, faceted navigation handled, infinite scroll with pagination fallback, no session IDs in URLs.

### Indexation

**Index status:** `site:domain.com` check, Search Console coverage report, compare indexed vs expected.

**Issues:** noindex on important pages, wrong-direction canonicals, redirect chains/loops, soft 404s, duplicate content without canonicals.

**Canonicalization:** every page has canonical, self-referencing on unique pages, HTTP → HTTPS, www consistency, trailing slash consistency.

### Speed & Core Web Vitals

**Targets:** LCP < 2.5s · INP < 200ms · CLS < 0.1.

**Factors:** TTFB, image optimization, JS execution, CSS delivery, caching headers, CDN, font loading.

**Tools:** PageSpeed Insights, WebPageTest, Chrome DevTools, Search Console CWV report.

### Mobile-Friendliness

Responsive (not separate m.), tap targets, viewport configured, no horizontal scroll, same content as desktop, mobile-first indexing ready.

### Security & HTTPS

HTTPS site-wide, valid SSL, no mixed content, HTTP → HTTPS redirects, HSTS (bonus).

### URL Structure

Readable/descriptive, natural keywords, consistent, no unnecessary parameters, lowercase hyphen-separated.

## International SEO & Localization

Check when the site serves multiple languages or regions. Misconfigurations can suppress entire locale variants or drag down site-wide quality signals. Full evidence in `references/international-seo.md`.

**Hreflang.** Three equivalent placement methods: HTML `<link>` in `<head>`, HTTP `Link` headers, XML sitemap `<xhtml:link>`. Conflicting signals across methods cause Google to drop the pair. For 10+ locales, prefer sitemap-based.

Check: self-referencing entry on every page (page must include itself), reciprocal links (A→B and B→A or both ignored), valid ISO 639-1 + ISO 3166-1 Alpha 2 codes (`en-GB` not `en-UK`), `x-default` pointing to fallback, all targets return 200 + indexable + match canonical.

Common errors: missing self-reference (all hreflang ignored), one-directional pair (dropped), invalid codes, target is non-canonical / 404 / blocked, HTML and sitemap annotations disagree.

At scale: `<xhtml:link>` children do not count toward the 50K URL sitemap limit, but the 50MB file size becomes the bottleneck (plan 2K-5K URLs per file). Focus hreflang on pages receiving wrong-language traffic. For Bing: supplement with `<html lang>` and `<meta http-equiv="content-language">`.

**Canonicalization.** Each locale page self-canonicals. Never cross-locale canonical (suppresses the non-canonical locale entirely). Canonical URL must appear in the hreflang set or all hreflang is ignored. Canonical overrides hreflang when they conflict. Protocol/domain consistent across canonical, hreflang, and sitemap. Paginated locale pages: self-referencing canonical per page.

**Sitemaps.** `xmlns:xhtml` namespace on `<urlset>`. Each `<url>` includes `<xhtml:link>` for all locales including itself. `x-default` alternate included. All URLs absolute. Split by content type, not by locale. Sitemap index in Search Console and robots.txt. **Next.js caveat:** `alternates.languages` does not auto-include a self-referencing link for the `<loc>` URL, add the current locale explicitly.

**Locale URL structure.** Recommended: subdirectories (`/en/`, `/ar/`). Acceptable: subdomains or ccTLDs. Not recommended: URL parameters (`?lang=en`). All locales prefixed (hiding locale prevents Google from distinguishing versions). Root URL handled as `x-default` with redirect or default-locale content. No IP / Accept-Language content negotiation (Googlebot uses US IPs and no Accept-Language header). Trailing slash and case consistent across locale paths, canonicals, hreflang, and sitemaps.

**Content quality across locales.** AI-translated content is not by itself spam (Google 2025), but scaled low-value translations trigger the scaled content abuse policy. Translate ALL content (title, description, headings, body), not just boilerplate. Helpful content system is site-wide, many thin locale pages can suppress rankings for strong pages too. Do not noindex thin locales (wastes crawl budget) or cross-locale canonical (conflicts with hreflang). Best approach: do not create locale pages you cannot make actually useful.

## On-Page SEO

### Title Tags

Check: unique per page, primary keyword near start, 50-60 chars, compelling, brand name at end.
Issues: duplicates, too long/short, keyword stuffing, missing.

### Meta Descriptions

Check: unique, 150-160 chars, primary keyword, clear value prop, CTA.
Issues: duplicates, auto-generated, bad length, no click incentive.

**CTR uplift estimate** for rewrite candidates: pull current CTR and average position from GSC, compare to the position-average CTR for that query type, and project clicks gained at the page's impression volume. Prioritize rewrites where impressions are high and CTR is below position average.

### Heading Structure

Check: one H1 per page, H1 contains primary keyword, logical H1 → H2 → H3, headings describe content.
Issues: multiple H1s, skipped levels, styling-only headings, missing H1.

### Content Optimization

**Primary content:** keyword in first 100 words, related keywords natural, sufficient depth, answers search intent, better than competitors.

**Thin content:** little unique content, valueless tag/category pages, doorway pages, near-duplicates.

### Images

Descriptive filenames, alt text on all images (describes image), compressed, modern formats (WebP), lazy loading, responsive.

### Internal Linking

Check: important pages well-linked, descriptive anchors, logical relationships, no broken links, reasonable count.
Issues: orphan pages, over-optimized anchors, buried important pages, excessive footer/sidebar links.

### Keyword Targeting

**Per page:** clear primary target, title/H1/URL aligned, content satisfies intent, no cannibalization.
**Site-wide:** keyword mapping document, no major gaps, no cannibalization, logical topical clusters.

## Content Quality

**E-E-A-T:**
- **Experience**. first-hand experience, original insights/data, real examples
- **Expertise**. visible author credentials, accurate info, sourced claims
- **Authoritativeness**. recognized in space, cited by others, industry credentials
- **Trustworthiness**. accurate info, transparent business, contact info, privacy policy, HTTPS

**Content depth**. thorough, answers follow-ups, better than top competitors, current.

**User engagement**. time on page, bounce rate in context, pages per session, return visits.

## Common Issues by Site Type

- **SaaS/Product**. thin product pages, blog not integrated with product, missing comparison/alternative pages, thin feature pages, no glossary
- **E-commerce**. thin category pages, duplicate product descriptions, missing product schema, faceted-nav duplicates, mishandled out-of-stock pages
- **Content/Blog**. outdated content, cannibalization, no topical clustering, poor internal linking, missing author pages
- **Multilingual / Multi-Regional**. hreflang errors, canonical conflicts, thin locale pages, IP-based redirects hiding content from Googlebot. see International SEO & Localization above
- **Local Business**. inconsistent NAP, missing local schema, unoptimized Google Business Profile, no location pages, no local content

## Fix

After diagnosis, move into execution. Use the prioritized finding list from the audit to sequence this work.

### Keyword Research and Mapping

**Selection:** target search intent first (informational, navigational, transactional, commercial), then balance volume against competition. Long-tail terms yield faster wins.

**Process:** seed keywords from business objectives, expand via GSC/Ahrefs/Semrush, group by topic clusters, map each cluster to a content type, then rank by expected ROI.

**Per-page:** primary keyword in title, H1, first 100 words, URL, and meta description. Use semantic variations in the body. Aim for natural density, not a target percentage.

**Cannibalization check:** before creating new content, verify no existing page targets the same query. If two pages compete, consolidate or differentiate.

### Topic Clusters and Pillar Pages

```
Pillar: "Complete Guide to [Topic]"
  ├── Cluster: "[Subtopic A]"
  ├── Cluster: "[Subtopic B]"
  └── Cluster: "[Subtopic C]"
```

Pillar pages: 3,000+ words. Cluster pages: 8-12 per pillar. Bidirectional internal links between pillar and clusters.

### Featured Snippets

Direct answers placed under H2 questions. Numbered lists for step-by-step processes. Comparison tables with clear headers.

### Pre-Publish Checklist

Use before publishing new or rewritten pages:

- [ ] Primary keyword in title (under 60 chars)
- [ ] Meta description 150-160 chars with CTA
- [ ] Single H1 with primary keyword
- [ ] URL slug readable and keyword-relevant
- [ ] Images compressed, WebP format, alt text set
- [ ] 3-5 internal links with descriptive anchors
- [ ] External links to authoritative sources
- [ ] Schema markup added (Article, Product, FAQ, etc.)
- [ ] Mobile rendering verified
- [ ] Page speed under 3s
- [ ] No broken links
- [ ] Canonical tag set
- [ ] Open Graph and Twitter Card tags present

### Content Length Targets

Blog posts: 1,500-2,500 words. Product pages: 300-500 words minimum. Category pages: 500-1,000 words. Homepage: 500+ words. Adjust based on what top-ranking competitors are publishing for the same query.

## Output Format

**Executive summary**: overall health and top 3-5 priorities.

**Three-bucket findings.** Group every issue under one of these:

1. **Quick wins** (ship in under a week): meta rewrites for high-impression low-CTR pages, missing alt text, broken internal links, schema additions, image compression.
2. **Traffic drops** (pages or queries declining vs previous period): diagnose cause first (algorithm update, indexation regression, competitor move, content decay), then recommend a fix.
3. **Technical issues** (block ranking regardless of content): crawl, indexation, Core Web Vitals, hreflang, security.

**Per-finding fields:**
- **Issue**: what is wrong
- **Impact**: High / Medium / Low
- **Evidence**: how you found it (GSC report, crawl tool, manual check)
- **Fix**: specific recommendation
- **Priority**: 1-5

**30-day action plan**, week by week. Front-load quick wins in week 1 to show momentum. Tackle technical blockers in weeks 2-3. Content and authority work in week 4 and beyond.

## References

- [AI Writing Detection](references/ai-writing-detection.md)
- [AEO & GEO Patterns](references/aeo-geo-patterns.md)
- [International SEO](references/international-seo.md). evidence and sources for hreflang, canonical + i18n, sitemaps, URL structure, and content quality across locales

## Tools

**Free:** Google Search Console, PageSpeed Insights, Bing Webmaster Tools, Rich Results Test, Mobile-Friendly Test, Schema Validator.
**Free full-site crawl:** OpenSEO self-hosted (`github.com/every-app/open-seo`, MIT, `docker compose up -d`). Its MCP `run_site_audit` with `runLighthouse: false` crawls robots.txt and the sitemap and returns typed issues with severity and fix, using no paid data. Its keyword, SERP, backlink and rank tools bill DataForSEO per call, so keep those for questions first-party data cannot answer.
**Paid:** Screaming Frog, Ahrefs/Semrush, Sitebulb, ContentKing.

## Related Skills

- **seo-page-audit**. detailed analysis of a single URL (requires an explicit URL)
- **programmatic-seo**. pages at scale
- **seo-schema-markup**. structured data only
- **landing-page-cro**. page conversion (not ranking)
- **seo-analytics-tracking**. measuring SEO performance
