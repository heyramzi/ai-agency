---
name: seo-keyword-research
argument-hint: "<topic, niche, or seed keyword>"
description: >
  Discover, analyze, and prioritize keywords for SEO and GEO content strategies.
  Identifies high-value opportunities based on search volume, competition,
  intent, and business relevance. Generates topic clusters and content calendars.
  Use when asked to "find keywords", "keyword research", "what should I write
  about", "keyword analysis", "find me topics to write", "search volume",
  "keyword difficulty", "content ideas", or any keyword discovery task.
---

<!-- Adapted from github.com/nowork-studio/toprank (MIT). Copyright (c) 2026 Toprank Contributors. -->

# Keyword Research

## Data Sources

All integrations are optional; this skill works without any API keys.

**With Search Console + an SEO tool (Ahrefs, Semrush, etc.) connected:** automatically pull historical search volume, keyword difficulty scores, SERP analysis, current Search Console rankings, and competitor keyword overlap.

**Without tools connected:** ask the clarifying questions in step 1 below and proceed on the answers.

Note in the output which metrics are from automated collection vs. user-provided data.

## Instructions

1. **Understand the Context.** Ask what's not already known:
   - Product/service/topic, target audience, geographic location and preferred language
   - Business goal (traffic, leads, sales)
   - Current domain authority (if known) or site age
   - Any known keyword performance data or search volume estimates

2. **Generate Seed Keywords.** Start with: core product/service terms, problem-focused ("what issues do you solve?"), solution-focused ("how do you help?"), audience-specific terms, industry terminology.

3. **Expand Keyword List.** For each seed keyword, generate variations:

   **Modifiers:** best [keyword] · top [keyword] · [keyword] for [audience] · [keyword] near me · [keyword] [year] · how to [keyword] · what is [keyword] · [keyword] vs [alternative] · [keyword] examples · [keyword] tools

   **Long-tail:** [keyword] for beginners · [keyword] for small business · free [keyword] · [keyword] software/tool/service · [keyword] template · [keyword] checklist · [keyword] guide

4. **Classify Search Intent.** Categorize each keyword:

   | Intent | Signals | Example | Content Type |
   |--------|---------|---------|--------------|
   | Informational | what, how, why, guide, learn | "what is SEO" | Blog posts, guides |
   | Navigational | brand names, specific sites | "google analytics login" | Homepage, product pages |
   | Commercial | best, review, vs, compare | "best SEO tools [current year]" | Comparison posts, reviews |
   | Transactional | buy, price, discount, order | "buy SEO software" | Product pages, pricing |

5. **Assess Keyword Difficulty.** Score each keyword 1-100:

   | Range | Signals |
   |-------|---------|
   | High (70-100) | Major brands ranking, high-DA competitors, established content (1000+ backlinks), paid ads dominating SERP |
   | Medium (40-69) | Mix of authority and niche sites, moderate backlink requirements, some room for quality content |
   | Low (1-39) | Few authoritative competitors, thin or outdated content ranking, long-tail variations, new/emerging topics |

6. **Calculate Opportunity Score.** Formula: `Opportunity = (Volume × Intent Value) / Difficulty`

   **Intent Value:** Informational = 1 · Navigational = 1 · Commercial = 2 · Transactional = 3

   | Scenario | Volume | Difficulty | Intent | Priority |
   |----------|--------|------------|--------|----------|
   | Quick Win | Low-Med | Low | High | ⭐⭐⭐⭐⭐ |
   | Growth | High | Medium | High | ⭐⭐⭐⭐ |
   | Long-term | High | High | High | ⭐⭐⭐ |
   | Research | Low | Low | Low | ⭐⭐ |

7. **Identify GEO Opportunities.** Keywords likely to trigger AI responses:

   **High GEO potential:** question formats ("What is...", "How does...", "Why is...") · definition queries ([term] meaning/definition) · comparison queries ([A] vs [B], difference between...) · list queries (best [category], top [number] [items]) · how-to queries.

   **AI answer indicators:** query is factual/definitional, answer can be summarized concisely, topic is well-documented online, low commercial intent.

8. **Create Topic Clusters.** Group keywords into pillar + cluster structure:

   ```markdown
   ## Topic Cluster: [Main Topic]

   **Pillar Content**: [Primary keyword]
   - Search volume: [X] | Difficulty: [X] | Content type: Comprehensive guide

   **Cluster Content**:
   ### Sub-topic 1: [Secondary keyword]
   - Volume: [X] | Difficulty: [X] | Links to: Pillar | Content type: [Blog post/Tutorial/etc.]

   [Repeat for each cluster keyword; later sub-topics also link back to earlier ones where relevant.]
   ```

9. **Generate Output Report.** Produce: Executive Summary, Top Keyword Opportunities (Quick Wins, Growth, GEO), Topic Clusters, Content Calendar, Next Steps. See [references/example-report.md](references/example-report.md) for the full template.

## Validation Checkpoints

### Input Validation
- [ ] Seed keywords/topic, audience, goals, geo/language, and domain authority all confirmed or explicitly marked unknown

### Output Validation
- [ ] Every recommendation cites specific data points, not generic advice
- [ ] Volume and difficulty scored for each keyword, grouped by intent and content type
- [ ] Topic clusters show clear pillar-to-cluster relationships
- [ ] Source of each data point stated (SEO tool, Search Console, user-provided, or estimated)

## Example

See [references/example-report.md](references/example-report.md) for a complete example report for "project management software for small businesses".

### Advanced Usage

- **Intent Mapping**: `Map all keywords for [topic] by search intent and funnel stage`
- **Seasonal Analysis**: `Identify seasonal keyword trends for [industry]`
- **Competitor Gap**: `What keywords do [competitor 1], [competitor 2] rank for that I'm missing?`
- **Local Keywords**: `Research local keywords for [business type] in [city/region]`

## Reference Materials

- [Keyword Intent Taxonomy](references/keyword-intent-taxonomy.md). Complete intent classification with signal words and content strategies
- [Topic Cluster Templates](references/topic-cluster-templates.md). Hub-and-spoke architecture templates for pillar and cluster content
- [Keyword Prioritization Framework](references/keyword-prioritization-framework.md). Priority scoring matrix, categories, and seasonal keyword patterns
- [Example Report](references/example-report.md). Complete example keyword research report for project management software

## Next Best Skill

- **Strategy**: [seo-content-strategy](../seo-content-strategy/SKILL.md). sequence the prioritized keywords into a content calendar.
- **Pages**: [seo-competitor-alternatives](../seo-competitor-alternatives/SKILL.md). turn the comparison and alternative keywords into the pages that convert.
- **Meta**: [seo-meta-tags-optimizer](../seo-meta-tags-optimizer/SKILL.md). write the title and description each target keyword earns.
