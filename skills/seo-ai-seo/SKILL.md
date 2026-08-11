---
name: seo-ai-seo
description: "When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' or 'optimize for Claude/Gemini.' Use this whenever someone wants their content to be cited or surfaced by AI assistants and AI search engines. For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see seo-schema-markup."
metadata:
  version: 1.2.0
---

# AI SEO

Make content discoverable, extractable, and citable by AI systems (Google AI Overviews, ChatGPT, Perplexity, Claude, Gemini, Copilot). Goal: get cited as a source in AI-generated answers.

## Before Starting

If `.agents/product-marketing-context.md` or `.claude/product-marketing-context.md` exists, read first. Only ask for what's not covered.

Gather: current AI visibility (tested across platforms?), content and domain authority, goals (cited as source / appear in AI Overviews / compete with specific brands / optimize existing vs new), competitor set.

## How AI Search Works

| Platform | Source Selection |
| --- | --- |
| Google AI Overviews | Summarizes top-ranking pages; correlates with traditional rankings |
| ChatGPT (with search) | Web search; wider range than top-ranked |
| Perplexity | Always cites; favors authoritative, recent, well-structured |
| Gemini | Google index + Knowledge Graph |
| Copilot | Bing index + authoritative sources |
| Claude | Brave Search (when enabled); training data |

See [references/platform-ranking-factors.md](references/platform-ranking-factors.md) for per-platform details.

**Key difference:** Traditional SEO gets you ranked. AI SEO gets you cited. A well-structured page can get cited even from page 2 or 3.

**Stats:** AI Overviews appear in ~45% of Google searches · reduce clicks up to 58% · brands cited 6.5x more via third-party than own domains · optimized content cited 3x more · stats/citations boost visibility 40%+.

## AI Visibility Audit

**Step 1. Check AI answers for key queries.** Test 10-20 priority queries across platforms:

| Query | Google AI Overview | ChatGPT | Perplexity | You Cited? | Competitors |
| --- | --- | --- | --- | --- | --- |

Query types: "What is [category]?" · "Best [category] for [use case]" · "[Your brand] vs [competitor]" · "How to [problem]" · "[Category] pricing".

**Step 2. Analyze citation patterns.** When competitors are cited: more extractable structure? more authority signals (citations, stats, quotes)? more recent updates? schema you're missing? third-party presence (Wikipedia, Reddit, review sites)?

**Step 3. Extractability check:** clear definition in first paragraph? self-contained answer blocks? stats with sources? comparison tables? FAQ with natural-language questions? schema markup? expert attribution? updated within 6 months? headings match query patterns? AI bots allowed in robots.txt?

**Step 4. AI bot access.** Each platform has its own bot:
- **GPTBot, ChatGPT-User**. OpenAI
- **PerplexityBot**. Perplexity
- **ClaudeBot, anthropic-ai**. Anthropic
- **Google-Extended**. Gemini and AI Overviews
- **Bingbot**. Copilot

Check robots.txt for Disallow rules. Middle ground: block training-only crawlers (**CCBot** from Common Crawl) while allowing search bots.

## Optimization: Three Pillars

### Pillar 1: Structure. Extractability

AI extracts passages, not pages. Every key claim should work standalone.

**Block patterns:** definition blocks (What is X?) · step-by-step (How to X) · comparison tables (X vs Y) · pros/cons · FAQ · statistic blocks with sources.

See [references/content-patterns.md](references/content-patterns.md).

**Rules:** lead every section with the answer · key passages 40-60 words (optimal for snippet extraction) · H2/H3 match query phrasing · tables beat prose for comparisons · numbered lists beat paragraphs for processes · one idea per paragraph.

### Pillar 2: Authority. Citability

Princeton GEO research shows citations +40%, stats +37%, quotes +30%, authoritative tone +25%. See [references/agent-files.md](references/agent-files.md) for the full table.

**Stats (+37-40%):** specific numbers with sources, cite original research, date all stats, original beats aggregated.

**Expert attribution (+25-30%):** named authors with credentials, expert quotes with title/org, "According to [Source]" framing, author bios with expertise.

**Freshness:** "Last updated: [date]" prominent, quarterly refresh for competitive topics, current year references, remove outdated info.

**E-E-A-T:** first-hand experience, specific detail, transparent sourcing, clear author expertise.

### Pillar 3: Presence. Be Where AI Looks

**Third-party often matters more than your own site:** Wikipedia (7.8% of ChatGPT citations) · Reddit (1.8%) · industry publications · review sites (G2, Capterra, TrustRadius) · YouTube · Quora.

**Actions:** accurate Wikipedia page · authentic Reddit participation · industry roundups · updated review platform profiles · YouTube for how-to queries · Quora answers with depth.

### Machine-Readable Files & Schema

AI agents are becoming buyers. Add `/pricing.md`, `/llms.txt`, and proper schema markup. See [references/agent-files.md](references/agent-files.md) for templates and schema mapping.

## Content Types by Citation Share

| Type | Share | Why AI Cites |
| --- | --- | --- |
| Comparison articles | ~33% | Structured, balanced, high-intent |
| Definitive guides | ~15% | Authoritative |
| Original research/data | ~12% | Unique, citable stats |
| Best-of/listicles | ~10% | Clear structure, entity-rich |
| Product pages | ~10% | Specific extractable detail |
| How-to guides | ~8% | Step-by-step |
| Opinion/analysis | ~10% | Expert perspective |

**Underperformers:** generic blog posts without structure, thin product pages, gated content, undated/no-author content, PDF-only.

## Monitoring

| Metric | Measure | Check |
| --- | --- | --- |
| AI Overview presence | Appear for your queries? | Manual or Semrush/Ahrefs |
| Brand citation rate | How often cited | AI visibility tools |
| Share of AI voice | Yours vs competitors | Peec AI, Otterly, ZipTie |
| Citation sentiment | How AI describes you | Manual + monitoring |
| Source attribution | Which pages get cited | Referral traffic from AI |

**Tools:** Otterly AI · Peec AI · ZipTie · LLMrefs.

**DIY monthly check:** pick top 20 queries → run through ChatGPT, Perplexity, Google → record citations + competitors → track month-over-month.

## By Content Type

**SaaS product pages**. clear description first paragraph, comparison tables, specific metrics, customer count with numbers, transparent pricing (+ `/pricing.md`), FAQ for buyer questions.

**Blog**. one clear target query per post, definition first paragraph, original data/research/quotes, "Last updated" visible, credentialed author bio, internal links.

**Comparison/alternative pages**. structured tables, fair/balanced (AI penalizes bias), specific criteria with ratings, updated pricing/features. See **seo-competitor-alternatives**.

**Documentation**. numbered steps, code examples, HowTo schema, screenshots with alt text, prerequisites and outcomes.

## Common Mistakes

- Ignoring AI search (see AI Overview prevalence above)
- Treating AI SEO as separate from SEO (good SEO is the foundation)
- Writing for AI, not humans
- No freshness signals
- Gating all content
- Ignoring third-party presence (Wikipedia mention beats own blog)
- No structured data
- Keyword stuffing (-10%)
- Hiding pricing behind "contact sales" or JS rendering
- Blocking AI bots in robots.txt
- Generic content without data
- Not monitoring (check monthly minimum)

## Tool Integrations

`semrush` (AI Overview tracking), `ahrefs` (backlinks, content explorer), `gsc` (query tracking), `ga4` (AI source referral).

## Diagnostic Questions

1. Top 10-20 queries?
2. AI answers exist for those today?
3. Schema markup on site?
4. Content types (blog, docs, comparisons)?
5. Competitors cited where you're not?
6. Wikipedia / review-site presence?

## Related Skills

- **seo-audit**. traditional SEO audits
- **seo-schema-markup**. implementing structured data
- **seo-content-strategy**. what content to create
- **seo-competitor-alternatives**. comparison pages
- **programmatic-seo**. SEO at scale
- **seo-copywriting**. human + AI-extractable content
