# Machine-Readable Files for AI Agents

AI agents are becoming buyers. If pricing is in JS or behind a sales wall, agents skip you. Add machine-readable files to site root.

## `/pricing.md` or `/pricing.txt`

```markdown
# Pricing — [Your Product]

## Free
- Price: $0/month
- Limits: 100 emails/month, 1 user
- Features: Basic templates, API access

## Pro
- Price: $29/month (annual) | $35/month (monthly)
- Limits: 10,000 emails/month, 5 users
- Features: Custom domains, analytics, priority support

## Enterprise
- Price: Custom — contact sales@example.com
- Limits: Unlimited emails and users
- Features: SSO, SLA, dedicated account manager
```

**Why now:** agents compare programmatically before humans visit; opaque pricing gets filtered; markdown is trivially parseable; same principle as robots.txt, llms.txt, AGENTS.md.

**Best practices:** consistent units, specific limits not just features, what's included per tier, keep updated (stale > missing), link from sitemap and pricing page.

## `/llms.txt`

Context file ([llmstxt.org](https://llmstxt.org)) with what your product does, who it's for, and links to key pages (including pricing).

## Schema Markup

| Content Type | Schema |
| --- | --- |
| Articles/Blog | `Article`, `BlogPosting` |
| How-to | `HowTo` |
| FAQs | `FAQPage` |
| Products | `Product` |
| Comparisons | `ItemList` |
| Reviews | `Review`, `AggregateRating` |
| Organization | `Organization` |

Proper schema = 30-40% higher AI visibility. Use the **seo-schema-markup** skill for implementation.

## Princeton GEO Visibility Boosts

From KDD 2024 research with Perplexity:

| Method | Visibility Boost | How to Apply |
| --- | --- | --- |
| Cite sources | +40% | Authoritative references with links |
| Add statistics | +37% | Specific numbers with sources |
| Add quotations | +30% | Expert quotes with name and title |
| Authoritative tone | +25% | Demonstrated expertise |
| Improve clarity | +20% | Simplify complex concepts |
| Technical terms | +18% | Domain-specific terminology |
| Unique vocabulary | +15% | Word diversity |
| Fluency | +15-30% | Readability and flow |
| Keyword stuffing | -10% | Hurts AI visibility |

Best combo: Fluency + Statistics. Low-ranking sites benefit more (up to 115% with citations).
