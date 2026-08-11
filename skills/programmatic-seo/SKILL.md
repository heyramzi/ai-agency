---
name: programmatic-seo
description: |
  Programmatic SEO tools for keyword research and blog article generation. Use when:
  - Researching keywords for any niche/product
  - Generating SEO-optimized blog article drafts
  - Setting up or extending blog infrastructure on Svelte/SvelteKit websites
  - Analyzing competitor content and search trends
  - Creating content briefs for programmatic publishing

  Uses Serper.dev API for real Google data (autocomplete, related searches, PAA).
---

# Programmatic SEO

Generate ranking blog content through automated keyword research and article generation using Serper.dev API.

## Prerequisites

`SERPER_API_KEY` env var. Get a free key at [serper.dev](https://serper.dev): 2,500 queries, no credit card. Keep one copy of it in your own env file and export it before running the scripts.

## Quick Start

```bash
export SERPER_API_KEY=your_key

# Basic research
python scripts/keyword-research.py -s "your keyword" --depth 2

# Generate content brief
python scripts/keyword-research.py -s "your keyword" --brief
```

## Workflow

### Phase 1: Keyword Research

**1.1 Seed keywords**. start with 5-10 for your niche:
- Product category: "mac notch app", "project management tool"
- Problem-based: "hide macbook notch", "organize tasks"
- Comparison: "notion vs obsidian", "best productivity apps"

**1.2 Expand via Serper.dev:**
```bash
python scripts/keyword-research.py -s "your keyword"            # Basic (1 call)
python scripts/keyword-research.py -s "your keyword" --depth 2  # Deep (~6 calls)
python scripts/keyword-research.py -s "your keyword" --depth 3 --brief -o keywords.json  # Full + brief (~10 calls)
```

Output: Google Autocomplete suggestions (high intent), related searches from SERP, People Also Ask questions (FAQ content), deduplicated list.

**1.3 Supplement via WebSearch:** "[keyword] 2026 best", "[keyword] reddit", "[keyword] alternative", "how to [keyword]".

**1.4 Document**. save to `content/research/keywords.json`:
```json
{
  "primaryKeywords": [
    { "keyword": "your keyword", "volume": "estimated", "difficulty": "low/medium/high", "intent": "transactional/informational" }
  ],
  "secondaryKeywords": [],
  "longTailKeywords": [],
  "questions": []
}
```

### Phase 2: Content Planning

**Topic clusters:**
```
Pillar: "Complete Guide to [Topic]"
├── Cluster: "Best [Topic] Tools 2026"
├── Cluster: "How to [Topic]"
├── Cluster: "[Topic] Alternatives"
└── Cluster: "[Topic] vs [Competitor]"
```

**Prioritize by:** search volume + low competition · transactional intent (buyers) · informational (awareness).

### Phase 3: Article Generation

**Content brief:** target keyword, 3-5 secondary keywords, search intent, word count (1500-2500), competitors to beat, unique angle.

```bash
python scripts/generate-article.py --keyword "your keyword" --title "Your Article Title" --word-count 2000
```

See [references/article-template.md](references/article-template.md) for the article structure, frontmatter, and image guidance.

### Phase 4: Publishing

**Draft location:** `web/content/blog/drafts/`.

**Checklist:**
- [ ] Title <60 chars with primary keyword
- [ ] Meta description 150-160 chars
- [ ] Primary keyword in H1, first paragraph, URL
- [ ] 3-5 internal links
- [ ] 2-3 external links (authoritative)
- [ ] Images optimized with alt text
- [ ] Mobile-friendly formatting
- [ ] CTA present

## GEO (Generative Engine Optimization)

For ChatGPT, Perplexity, Google AI Overviews: answer questions directly in first paragraph · structured data (FAQ schema) · statistics and citations · authoritative factual content · build brand mentions across the web.

## Tools Reference

### Primary: Serper.dev API

| Endpoint | Cost | Use Case |
| --- | --- | --- |
| `/autocomplete` | 1 credit | Keyword suggestions |
| `/search` | 1 credit | Related searches, PAA |
| `/images` | 1 credit | Image search |
| `/news` | 1 credit | News results |

Free: 2,500 queries. Paid: $50 for 50k ($0.001/query).

### Alternatives

| Tool | Install | Use Case |
| --- | --- | --- |
| seoq | `npx seoq` | Site audit, competitor analysis |
| Answer Socrates | [answersocrates.com](https://answersocrates.com) | Free PAA research |
| Ahrefs Free | [ahrefs.com/keyword-generator](https://ahrefs.com/keyword-generator) | Quick ideas |

### Optional: seo-mcp (Ahrefs data)

```json
// .claude/mcp.json
{
  "mcpServers": {
    "seo-mcp": {
      "command": "uvx",
      "args": ["--python", "3.10", "seo-mcp"],
      "env": { "CAPSOLVER_API_KEY": "CAP-xxx" }
    }
  }
}
```

## API Credit Usage

| Action | Depth 1 | Depth 2 | Depth 3 |
| --- | --- | --- | --- |
| Keyword research | ~2 | ~8 | ~12 |
| With brief | ~2 | ~8 | ~12 |

At 2,500 free credits: ~300-1,200 keywords depending on depth.

## Resources

- `scripts/keyword-research.py`. Serper.dev keyword research
- `scripts/generate-article.py`. article draft generator
- `references/article-template.md`. article structure and image guidance
- `references/blog-setup.md`. SvelteKit blog infrastructure
- `references/seo-checklist.md`. pre-publish checklist
- `assets/article-template.md`. markdown template
