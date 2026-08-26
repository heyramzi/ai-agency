# Page SEO Report Template

Output the report in this exact format.

---

# Page SEO Analysis — [page URL]
*[date] · [GSC data: date range, or "No GSC data"]*

## Overall Score: [X.X]/10

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Search Intent Alignment | X/10 | 20% | X.X |
| E-E-A-T Signals | X/10 | 20% | X.X |
| Content Quality & Depth | X/10 | 20% | X.X |
| On-Page SEO | X/10 | 15% | X.X |
| Content Structure & UX | X/10 | 15% | X.X |
| Technical SEO | X/10 | 10% | X.X |
| **Overall** | | | **X.X** |

---

## Top Priority Fixes

3-5 specific, actionable fixes ordered by expected impact. Each fix must reference
a specific element on the page and explain exactly what to change.

**#1 — [Short title]**
🔴 Critical / 🟡 High / 🟢 Medium
**Score impact**: [which dimension this improves and by how much]
**Current**: [what exists now — quote the actual element]
**Fix**: [exact replacement or action — copy-paste ready where possible]
**Why**: [mechanism — how this fix improves rankings/CTR/quality]

*(Repeat for each fix)*

---

## E-E-A-T Breakdown

| Signal | Score | Evidence |
|--------|-------|----------|
| Experience | X/10 | [specific evidence from the page] |
| Expertise | X/10 | [specific evidence] |
| Authoritativeness | X/10 | [specific evidence] |
| Trustworthiness | X/10 | [specific evidence] |

[YMYL flag if applicable]

### E-E-A-T Gaps to Close
- [Specific gap #1 with fix]
- [Specific gap #2 with fix]

---

## Search Intent Analysis

**Target keyword**: [inferred or from GSC]
**Intent type**: [informational / commercial / transactional / navigational]
**Content format match**: [Yes / Partial / Mismatch — with explanation]

### SERP Feature Opportunities
| Feature | Optimized? | Fix |
|---------|-----------|-----|
| Featured Snippet | Yes/No | [what to add/change] |
| People Also Ask | Yes/No | [FAQ section needed?] |
| Rich Results | Yes/No | [schema needed?] |

---

## On-Page SEO Audit

### Metadata
| Element | Current | Status | Recommendation |
|---------|---------|--------|----------------|
| Title tag | "[actual title]" ([N] chars) | OK / Too long / Missing keyword | [fix] |
| Meta description | "[actual]" ([N] chars) | OK / Missing / Too short | [fix] |
| H1 | "[actual]" | OK / Missing / Duplicate | [fix] |
| Canonical | [URL] | OK / Missing / Wrong | [fix] |
| OG tags | Present / Missing | OK / Incomplete | [fix] |

### Heading Structure
```
H1: [actual]
  H2: [actual]
    H3: [actual]
  H2: [actual]
  ...
```
[Assessment: logical hierarchy? Keywords in headings? Descriptive?]

### Internal Links
Found [N] internal links. [Assessment of quality, anchor text, relevance]

| Anchor Text | Target | Quality |
|-------------|--------|---------|
| [text] | [URL] | Good / Generic / Missing |

### Images
Found [N] images.
| Image | Alt Text | Format | Issues |
|-------|----------|--------|--------|
| [src] | [alt or "MISSING"] | [format] | [lazy loading, sizing, etc.] |

---

## Content Quality Assessment

### Helpful Content Signals
| Signal | Present? | Evidence |
|--------|----------|----------|
| Clear target audience | Yes/No | [evidence] |
| Answers query completely | Yes/No | [evidence] |
| Original value added | Yes/No | [evidence] |
| Passes "Last Click" test | Yes/No | [evidence] |
| Appropriate depth | Yes/No | [word count: N] |
| First-hand knowledge | Yes/No | [evidence] |

### Content Gaps vs Competitors
| Topic/Subtopic | This Page | Competitors | Action |
|----------------|-----------|-------------|--------|
| [subtopic] | Missing / Covered | Covered by [N] of [M] | Add section |

---

## Technical SEO

| Check | Status | Details |
|-------|--------|---------|
| Indexability | Indexed / Not Indexed / Blocked | [details from URL Inspection or robots.txt] |
| Mobile Ready | Yes / Issues | [viewport, responsive, touch targets] |
| Schema Markup | [types found] / None | [appropriate? errors?] |
| Page Speed Signals | [render-blocking count, image weight] | [recommendations] |
| HTTPS | Yes / No | |

---

## GSC Performance Summary
*(Skip if no GSC data)*

| Metric | Value |
|--------|-------|
| Clicks (90d) | X |
| Impressions (90d) | X |
| Avg CTR | X% |
| Avg Position | X |
| Trend | Growing / Stable / Declining |

### Top Ranking Queries
| Query | Position | Clicks | Impressions | CTR | Expected CTR | Gap |
|-------|----------|--------|-------------|-----|-------------|-----|
| [query] | X | X | X | X% | X% | +/-X% |

---

## What to Improve Next

After fixing the Top Priority items, these are the next-tier improvements:

1. [Lower-priority improvement #1]
2. [Lower-priority improvement #2]
3. [Lower-priority improvement #3]

---

## Skill Handoffs

Based on findings, offer relevant next steps:

- If metadata issues found: "Run `seo-meta-tags-optimizer [page URL]` for optimized title and meta description variants with A/B test suggestions."
- If schema gaps found: "Run `seo-schema-markup [page URL]` for correct JSON-LD markup."
- If content needs rewriting: "Run `seo-copywriting` with the target keyword and this analysis as context."
- If deeper keyword analysis needed: "Run `seo-keyword-research` to find additional keywords this page could target."
- If full site audit needed: "Run `seo-audit` for a complete site-wide audit including all pages."

---

## Report Rules

1. **Every score needs evidence.** Don't assign a 7/10 without citing what earned the 7 and what prevented an 8. Quote actual content from the page.
2. **Fixes must be specific.** "Improve the title tag" is useless. "Change the title from 'Services' to 'Dog Grooming Services in Portland — Same-Day Appointments | PawsVIP' (58 chars)" is actionable.
3. **Use GSC data to ground recommendations.** If you know the page ranks #7 for "dog grooming portland" with 1,200 impressions and 2.1% CTR, say that — and estimate the click gain from moving to #3.
4. **Compare to competitors.** A "good" page can still be below the bar if every competitor is better. Context matters.
5. **Flag the single biggest unlock.** If one change would have outsized impact (e.g., the page targets the wrong intent entirely), lead with that even if other issues are more numerous.
