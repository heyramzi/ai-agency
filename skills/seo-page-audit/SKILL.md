---
name: seo-page-audit
argument-hint: "<URL of the page to analyze, e.g. https://example.com/blog/my-post>"
description: >
  Single-URL deep-dive SEO audit. Requires an explicit page URL as input. do NOT
  route here for domain-level or full-site requests, use seo-audit instead.
  Crawls the live HTML via WebFetch, scores the page across E-E-A-T, Helpful
  Content, search intent alignment, on-page factors, content depth, and
  technical signals, then produces a scored report with prioritized fixes.
  Optionally enriches with GSC data when the user has run the search-console
  skill first. Trigger on: "analyze this page", "audit this URL", "how is this
  page doing", "evaluate my blog post", "check this landing page", "page SEO",
  "content quality check", "is this page good enough", "review this page's
  SEO", "what's wrong with this page", "how can I improve this page", "page
  analysis", "single page audit", or "content audit for [URL]".
---

<!-- Adapted from github.com/nowork-studio/toprank (MIT). Copyright (c) 2026 Toprank Contributors. -->

# Single-Page SEO Analysis

## Step 0. Get the Target Page URL

The user should provide a specific page URL (not just a domain). If they provide
only a domain, ask which page they want analyzed:

> "Which specific page do you want me to analyze? (e.g., `https://example.com/blog/my-post`).
> For a full-site audit, use `seo-audit` instead."

Store the URL as `$PAGE_URL`.

---

## Phase 0. Optional GSC Enrichment

For performance enrichment (queries, CTR, position, indexing status), run `search-console` first to fetch GSC data for `$PAGE_URL`, then return here. Otherwise skip to Phase 1.

---

## Phase 1. Parallel Data Collection

**Launch all of these in a single turn using parallel tool calls:**

### 1a. Fetch the page (WebFetch)
Fetch `$PAGE_URL` to get the full HTML. This is the primary input. everything
else enriches it.

**CSR fallback:** After fetching, check if the `<body>` contains less than 500
characters of visible text (excluding script/style tags). If so, the page is
likely client-side rendered (React, Next.js CSR, Vue SPA). In that case, render
the page with JavaScript before continuing, using whichever headless browser
tool this setup provides. Do not analyze an empty shell. you will produce
garbage scores.

### 1a-2. SERP reality check (WebSearch)
Search for the page's likely primary keyword (infer from URL slug or title) to see
what actually ranks, before evaluating the page (see 3a for why this order matters).
Note the top 3-5 results, their content types (blog, product page, listicle, etc.),
and any SERP features (featured snippets, PAA, video carousels).

### 1b. Fetch robots.txt (WebFetch)
Fetch `{origin}/robots.txt` to check if the page is blocked.

### 1c. Indexing & GSC data (optional)
If the user provided GSC output from the `search-console` skill in Phase 0, parse
it for: ranking queries, position, clicks, impressions, CTR, indexing status.
Use loose URL matching. normalize trailing slashes and ignore protocol (http vs
https). If no GSC data is available, mark all GSC-derived sections as "No GSC
data" and continue.

### 1d. Business context (inference)
Infer what you can from the page content: what business, what audience, what
offering. This is a page-level skill, not a site onboarding. don't run a full
business context interview.

---

## Phase 2. Page Content Extraction

From the fetched HTML, extract:

1. **Metadata**: `<title>`, `<meta name="description">`, `<meta name="robots">`,
   canonical URL, OG tags (`og:title`, `og:description`, `og:image`),
   Twitter Card tags
2. **Headings**: full heading hierarchy (H1, H2, H3, H4)
3. **Content body**: main content text (strip nav, footer, sidebar)
4. **Word count**: total words in main content
5. **Internal links**: all internal links with anchor text
6. **External links**: all outbound links with anchor text and domains
7. **Images**: all images with alt text, src, dimensions if available
8. **Schema markup**: all `<script type="application/ld+json">` blocks
9. **Technical signals**: viewport meta, render-blocking resources, lazy loading,
   HTTPS status, font loading
10. **Publish/update date**: look for `<time>`, `datePublished`, `dateModified`,
    or visible dates on the page

---

## Phase 3. Content Quality Evaluation

Read `references/content-quality-framework.md` for the full scoring rubric.

### Indexability Gate (check FIRST)

Before scoring anything, check if the page is indexable:
- Is there a `<meta name="robots" content="noindex">` tag?
- Is robots.txt blocking the URL?
- Does URL Inspection show `NOT_INDEXED` or `CRAWLED_CURRENTLY_NOT_INDEXED`?
- Is the canonical pointing to a different URL?

If the page is NOT indexable, **stop scoring and lead the report with this.** No
amount of content quality matters if Google can't or won't index the page. Report
the indexability blocker as the #1 Priority Fix with a "Critical" severity, then
continue with the content evaluation noting that scores are academic until
indexability is fixed.

Evaluate the page across all six dimensions. Assign a score 0-10 with specific evidence. Follow the scoring rubric in the framework reference precisely.

### 3a. Search Intent Alignment (weight: 20%)

Determine what search queries this page should rank for:
- **From GSC** (if available): use actual ranking queries from Phase 1c
- **From content**: infer the primary target keyword from the title, H1, and
  content focus
- **From URL**: the slug often reveals the target keyword

**Critical: avoid circular reasoning.** Do NOT infer the correct intent from the
page's own content. that would mean a mismatched page always appears "aligned."
Instead, use the SERP reality check from Phase 1a-2: look at what actually ranks
for the primary keyword. If the top 5 results are all comparison listicles and this
page is a product page, that's a mismatch. regardless of what the page says about
itself. The SERP is the ground truth for intent, not the page.

Classify the intent (informational, commercial, transactional, navigational) based
on the SERP results and the keyword signals, then evaluate whether this page's
format matches. A blog post for transactional intent is a mismatch. A thin product
page for informational intent is a mismatch.

Also check SERP feature alignment. is the content structured to win featured
snippets, People Also Ask, or other relevant SERP features visible in the actual
SERP for this keyword?

### 3b. E-E-A-T Evaluation (weight: 20%)

Score Experience, Expertise, Authoritativeness, Trustworthiness independently per the rubric in `references/content-quality-framework.md`. Apply the higher E-E-A-T bar for YMYL topics (health, finance, legal, safety) and flag it in the report.

### 3c. Content Quality & Depth (weight: 20%)

Evaluate:
- **Comprehensiveness**: does the page fully answer the query vs top competitors?
- **Original value**: what does this page offer that others don't?
- **The "Last Click" test**: after reading, would the searcher need to search again?
- **Helpful Content signals**: positive signals present, negative signals absent
- **Word count appropriateness**: not thin (for the topic), not padded
- **Freshness**: content currency, dated references, broken links

### 3d. On-Page SEO (weight: 15%)

Evaluate each on-page factor from the framework:
- Title tag (length, keyword, intent match, uniqueness, CTR appeal)
- Meta description (length, keyword, CTA, uniqueness)
- Headings (H1 presence, hierarchy, keywords, descriptiveness)
- Internal linking (count, anchor text quality, relevance)
- External linking (citations, source quality)
- Image optimization (alt text, format, sizing, lazy loading)
- URL structure (readable, keyword-rich, depth)

### 3e. Content Structure & UX (weight: 15%)

Evaluate:
- Readability (paragraph length, sentence variety, vocabulary level)
- Content UX (above-fold value, visual breaks, TOC, mobile-friendliness)
- Scanning ability (bold phrases, bullets, numbered lists)

### 3f. Technical SEO (weight: 10%)

Evaluate:
- Indexability (robots.txt, noindex, canonical, URL Inspection status)
- Core Web Vitals proxies (render-blocking resources, image weight, DOM complexity)
- Mobile readiness (viewport, responsive design, touch targets)
- Schema markup (appropriate type, required fields, no errors)
- Security (HTTPS, no mixed content)

---

## Phase 4. GSC Performance Context

**Skip this phase if GSC data was unavailable.**

Analyze the page's actual search performance:

### Ranking Queries
For each query this page ranks for (from GSC):
- Current position, clicks, impressions, CTR
- Expected CTR for that position (use standard CTR curves)
- Gap: is CTR above or below expected?
- Intent classification of the query

### CTR Benchmarks
See [references/ctr-benchmarks.md](references/ctr-benchmarks.md) for position-based CTR benchmarks by intent type. Use those numbers for the Gap column. do not invent your own.

### CTR Analysis
If CTR is below expected for the position:
- Is it a title tag problem? (title doesn't match query intent)
- Is it a meta description problem? (no compelling reason to click)
- Is it a SERP feature issue? (featured snippet, ads, or rich results pushing organic down)

### Trend
Is traffic to this page growing, stable, or declining? If declining:
- When did the decline start?
- Correlate with algorithm updates, content changes, or competitive entries

### Cannibalization Check
Are other pages on the same site competing for the same queries? If so:
- Which page is winning?
- Should this page be consolidated, differentiated, or canonicalized?

---

## Phase 5. Competitive Quick-Check

You already have SERP data from the Phase 1a-2 WebSearch. Now **WebFetch the top
2-3 competitor URLs** from those results to get their actual content. Do not try to
estimate word count or content depth from search snippets. snippets are ~160
characters and tell you nothing about page depth. You need the real HTML.

For each fetched competitor page:
- Count the actual word count in the main content
- Note the page type and content format (blog, product, guide, listicle, etc.)
- List the H2 headings to see what subtopics they cover
- Note any SERP features they hold (featured snippet, FAQ, etc.)
- Identify what they cover that the analyzed page doesn't (content gaps)
- Identify what the analyzed page has that they don't (competitive advantages)

This gives context for the depth and quality scores. "good enough" depends on
what the competition is doing. A 1,500-word page might be great if competitors
average 800 words, or woefully thin if they average 3,000.

---

## Phase 6. Report

Follow the format in [references/report-template.md](references/report-template.md).
It contains the full scoring table, all section templates, CTR benchmarks, skill handoffs, and report rules.
