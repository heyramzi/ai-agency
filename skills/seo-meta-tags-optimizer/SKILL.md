---
name: seo-meta-tags-optimizer
argument-hint: "<URL or page title to optimize>"
description: >
  Rewrite a page's title tag, meta description, Open Graph and Twitter card
  markup directly in the repo, tuned to SvelteKit sites and wired
  into the seo-audit family. Use when editing meta tags in website or app
  code, when a page's SERP snippet or social preview needs fixing at the
  source, or as the remediation step after seo-audit or seo-page-audit flags
  weak titles and descriptions.
---

<!-- Adapted from github.com/nowork-studio/toprank (MIT). Copyright (c) 2026 Toprank Contributors. -->

# Meta Tags Optimizer

## Data Sources

**With Search Console + an SEO tool (Ahrefs, Semrush, etc.) connected:** automatically pull current meta tags, CTR data by query, competitor title/description patterns, SERP preview data, and impression/click metrics.

**With manual data only,** ask for: current title and meta description (if optimizing existing), target primary keyword and 2-3 secondary keywords, page URL and main content/value proposition, competitor URLs or well-performing SERP titles.

Note in the output which metrics are from automated collection vs. user-provided data.

## Instructions

1. **Gather Page Information.** Page URL, page type (blog/product/landing/service/homepage), primary and secondary keywords, target audience, primary CTA, unique value prop.

2. **Create Optimized Title Tag**

   **Requirements:** 50-60 characters (displays fully in SERP) · primary keyword near the front · compelling and click-worthy · matches search intent · brand name at the end if appropriate.

   **Formula options:**
   1. Keyword | Benefit | Brand: "[Primary Keyword]: [Benefit] | [Brand Name]"
   2. Number + Keyword + Promise: "[Number] [Keyword] That [Promise/Result]"
   3. How-to: "How to [Keyword]: [Benefit/Result]"
   4. Question: "What is [Keyword]? [Brief Answer/Hook]"
   5. Year + Keyword: "[Keyword] in [Year]: [Hook/Update]"

   Generate 2-3 title options against these formulas, note length/power words/keyword position for each, recommend one with reasoning, and output:
   ```html
   <title>[Selected Title]</title>
   ```

3. **Write Meta Description**

   **Requirements:** 150-160 characters (displays fully in SERP) · primary keyword included naturally · clear CTA · matches page content accurately · urgency or curiosity · no duplicate descriptions.

   **Formula:** [What the page offers] + [Benefit to user] + [Call-to-action]

   **Power elements:** numbers/statistics, current year, emotional triggers, action verbs, unique value proposition.

   Generate 2-3 description options, note length/CTA/emotional trigger for each, recommend one with reasoning, and output:
   ```html
   <meta name="description" content="[Selected Description]">
   ```

4. **Create Open Graph, Twitter Card, and Additional Meta Tags.** Generate OG tags (og:type, og:url, og:title, og:description, og:image), Twitter Card tags, canonical URL, robots, viewport, author, and article-specific tags, then combine into a complete meta tag block. See [references/meta-tag-code-templates.md](references/meta-tag-code-templates.md) for OG type selection, Twitter card type selection, and the full HTML templates.

5. **CORE-EEAT Alignment Check.** Verify against the CORE-EEAT benchmark:

   | Check | Status | Notes |
   |-------|--------|-------|
   | **C01 Intent Alignment**: title promise matches actual content delivery | ✅/⚠️/❌ | Does the title accurately represent what the page delivers? |
   | **C02 Direct Answer**: meta description reflects the core answer available in first 150 words | ✅/⚠️/❌ | Does the description preview the direct answer? |

   If C01 fails, the title is misleading: rewrite to match actual content. If C02 fails, restructure content to front-load the answer, or bring the description in line with what's actually there.

6. **Provide CTR Optimization Tips**

   List power words used and the emotion/action each creates.

   | Element | Impact |
   |---------|--------|
   | Numbers | +20-30% CTR |
   | Current Year | +15-20% CTR |
   | Power Words | +10-15% CTR |
   | Question | +10-15% CTR |
   | Brackets | +10% CTR |

   Propose an A/B test: Version A (current title/description) vs. Version B (alternative title/description) with a one-line hypothesis for why B might outperform.

## Validation Checkpoints

### Input Validation
- [ ] Primary keyword confirmed and matches page content
- [ ] Page type identified (blog/product/landing/service/homepage)
- [ ] Target audience and search intent clearly defined
- [ ] Unique value proposition articulated

### Output Validation
- [ ] Title 50-60 characters, description 150-160 characters
- [ ] Primary keyword appears in both title and description
- [ ] Open Graph image specified (1200x630px recommended)
- [ ] All HTML syntax valid (no unclosed quotes or tags)
- [ ] Source of each data point clearly stated (Search Console CTR data, SEO tool competitor data, user-provided, or estimated)

## Example

**User**: "Create meta tags for a blog post about 'how to start a podcast in [current year]'"

**Output**:

```markdown
## Meta Tags: How to Start a Podcast ([current year])

### Title Tag
<title>How to Start a Podcast in [current year]: Complete Beginner's Guide</title>
Length: ~55 characters. Keyword "how to start a podcast" at front. Power words: "Complete", "Beginner's".

### Meta Description
<meta name="description" content="Learn how to start a podcast in [current year] with our step-by-step guide. Covers equipment, hosting, recording, and launching your first episode. Start podcasting today!">
Length: ~163 characters. Keyword included naturally. CTA: "Start podcasting today!"

Complete meta tag block (OG, Twitter, Article tags) generated from references/meta-tag-code-templates.md.

### A/B Test Variations
Title B: "Start a Podcast in [current year]: Step-by-Step Guide (+ Free Checklist)"
Title C: "How to Start a Podcast: [current year] Guide [Equipment + Software + Tips]"
Description B: "Want to start a podcast in [current year]? This guide covers everything: equipment ($100 budget option), best hosting platforms, recording tips, and how to get your first 1,000 listeners."
```

## Reference Materials

- [Meta Tag Formulas](references/meta-tag-formulas.md). Proven title and description formulas
- [CTR and Social Reference](references/ctr-and-social-reference.md). Page-type templates, CTR data, OG best practices
