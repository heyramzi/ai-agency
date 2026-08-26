---
name: seo-competitor-alternatives
description: "Builds competitor comparison and alternative pages in four formats: singular alternative, plural alternatives, you vs competitor, and competitor vs competitor. Use on 'alternative page', 'vs page', 'competitor comparison', '[Product] vs [Product]', '[Product] alternative'. Run seo-competitor-profiling first for the upstream research."
metadata:
  version: "1.0.0"
---

# Competitor & Alternative Pages

Build pages that rank for competitive search terms, provide genuine value to evaluators, and position your product effectively.

## Initial Assessment

If `.claude/product-marketing-context.md` exists, read first.

1. **Your product**. core value prop, key differentiators, ICP, pricing, strengths and honest weaknesses
2. **Competitor set**. direct and indirect competitors, market positioning, search volume for competitor terms
3. **Goals**. SEO traffic, sales enablement, convert competitor users, brand positioning

## Core Principles

- **Honesty builds trust.** Acknowledge competitor strengths, be accurate about limitations, don't misrepresent features. Readers will verify.
- **Depth over surface.** Beyond feature checklists, explain _why_ differences matter, include use cases.
- **Help them decide.** Different tools fit different needs. Be clear about who you're best for AND who competitor is best for.
- **Modular content architecture.** Centralized competitor data, updates propagate, single source of truth.

## Page Formats

### Format 1: [Competitor] Alternative (Singular)

Intent: actively looking to switch. URL: `/alternatives/[competitor]` or `/[competitor]-alternative`. Keywords: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]".

Structure: why people look for alternatives, then you as alternative (summary), detailed comparison, who should switch (and shouldn't), migration path, switcher social proof, then CTA.

### Format 2: [Competitor] Alternatives (Plural)

Intent: researching options, earlier journey. URL: `/alternatives/[competitor]-alternatives`. Keywords: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]".

Structure: common pain points → criteria framework → list (you first, but include real options) → summary table → detailed breakdown of each → recommendations by use case → CTA.

Include 4-7 real alternatives. Being helpful builds trust and ranks better.

### Format 3: You vs [Competitor]

Intent: directly comparing you to specific competitor. URL: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`. Keywords: "[You] vs [Competitor]", "[Competitor] vs [You]".

Structure: TL;DR (key differences in 2-3 sentences) → at-a-glance table → detailed by category (Features, Pricing, Support, Ease, Integrations) → who [You] is best for → who [Competitor] is best for (honest) → switcher testimonials → migration support → CTA.

### Format 4: [Competitor A] vs [Competitor B]

Intent: comparing two competitors (not you directly). URL: `/compare/[competitor-a]-vs-[competitor-b]`.

Structure: overview of both → comparison by category → who each is best for → the third option (introduce yourself) → three-way table → CTA.

Captures competitor-term traffic, positions you as knowledgeable.

## Essential Sections

- **TL;DR summary**. scanners get key differences in 2-3 sentences
- **Paragraph comparisons**. beyond tables; for each dimension explain differences and when each matters
- **Feature comparison**. per category: how each handles it, strengths/limitations, bottom-line recommendation
- **Pricing comparison**. tier-by-tier, what's included, hidden costs, total cost for sample team size
- **Who it's for**. explicit about ideal customer for each option
- **Migration**. what transfers, what needs reconfiguration, support offered, switcher quotes

See [references/templates.md](references/templates.md).

## Content Architecture

**Centralized data per competitor:** positioning, target audience, all pricing tiers, feature ratings, strengths/weaknesses, best for / not ideal for, common review complaints, migration notes.

See [references/content-architecture.md](references/content-architecture.md).

## Research Process

**Deep per competitor:**
1. Product research. sign up, use it, document features/UX/limitations
2. Pricing. current tiers, what's included, hidden costs
3. Review mining. G2, Capterra, TrustRadius for praise/complaint themes
4. Customer feedback. talk to switchers (both directions)
5. Content research. positioning, their comparison pages, changelog

**Updates:** quarterly (pricing, major features) · when customers mention competitor changes · annual full refresh.

## SEO

| Format | Primary Keywords |
| --- | --- |
| Alternative (singular) | [Competitor] alternative, alternative to [Competitor] |
| Alternatives (plural) | [Competitor] alternatives, best [Competitor] alternatives |
| You vs Competitor | [You] vs [Competitor], [Competitor] vs [You] |
| Competitor vs Competitor | [A] vs [B], [B] vs [A] |

**Internal linking:** between related competitor pages · from feature pages to comparisons · hub page linking to all competitor content.

**Schema:** FAQ schema for "What is the best alternative to [Competitor]?"

## Output Format

**Competitor data file**. full profile in YAML for reuse across pages.

**Page content**. URL, meta tags, full copy organized by section, comparison tables, CTAs.

**Page set plan**. recommended pages with priority order by search volume.

## Diagnostic Questions

1. Common reasons people switch to you?
2. Customer quotes about switching?
3. Pricing vs competitors?
4. Migration support offered?

## Related Skills

- **programmatic-seo**. competitor pages at scale
- **seo-copywriting**. comparison copy
- **seo-audit**. optimize competitor pages
- **seo-schema-markup**. FAQ and comparison schema
