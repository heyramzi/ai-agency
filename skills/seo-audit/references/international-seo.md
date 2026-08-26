# International SEO: Evidence & Sources

## Contents

- Hreflang
- Canonicalization & i18n
- International Sitemaps
- URL Structure
- Content Quality Across Locales

Backs the International SEO & Localization section of seo-audit. Organized by topic with source URLs and key quotes.

---

## Hreflang

### Placement Methods

Google supports three equivalent methods: HTML `<link>` in `<head>`, HTTP `Link` headers, and XML sitemap `<xhtml:link>` elements. No method is prioritized.

Google combines signals from both HTML and sitemaps. If the same language-region pair points to different URLs across methods, Google drops that pair rather than guessing.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [SEJ: Google Combines Hreflang Signals](https://www.searchenginejournal.com/google-combines-hreflang-signals-from-html-sitemaps/389219/)

### Reciprocal Requirement

Google: "If page X links to page Y, page Y must link back to page X. If not, those annotations may be ignored or not interpreted correctly."

Every page must include itself (self-referencing) in the hreflang set. Missing self-reference is the #1 error found by Semrush audits. A study of 374,756 domains found 67% of hreflang implementations had issues.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Semrush: 9 Common Hreflang Errors](https://www.semrush.com/blog/hreflang-errors/)
- [SE Land: 31% of International Websites Contain Hreflang Errors](https://searchengineland.com/study-31-of-international-websites-contain-hreflang-errors-395161)

### x-default

Introduced April 2013. Designates the fallback page for users whose language/region matches no declared variant. Can point to the same URL as one of the language-specific alternates. Must be included in the complete annotation set on every variant page.

- [Google Blog: x-default hreflang](https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages)
- [Google Blog: How x-default can help you (2023)](https://developers.google.com/search/blog/2023/05/x-default)

### Language & Region Codes

Language: ISO 639-1 (2-letter). Region: ISO 3166-1 Alpha 2 (2-letter). Format: `language[-script][-region]`.

Cannot specify a region code alone. Common mistakes: `en-UK` (use `en-GB`), `es-419` (not ISO 3166-1). 8.9% of sites using hreflang contain invalid language codes.

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

### Hreflang at Scale (20+ locales)

With 20 locales, HTML `<head>` hreflang adds ~1.5KB per page for zero user benefit. Sitemap-based hreflang has zero runtime cost. `<xhtml:link>` child elements do NOT count toward the 50,000 URL sitemap limit (only `<loc>` elements count).

John Mueller recommends focusing hreflang on pages receiving wrong-language traffic, not every page: "I wouldn't do it for any of the other pages of the site because it's so complex & hard to manage."

- [SERoundtable: Child Elements Don't Count](https://www.seroundtable.com/google-child-elements-dont-count-towards-sitemap-url-limit-34377.html)
- [SERoundtable: Where To Focus Hreflang](https://www.seroundtable.com/using-hreflang-34127.html)

### Google vs Bing

Bing treats hreflang as a "weak signal." Bing relies on `content-language` meta tag, HTML `lang` attribute, ccTLDs, and server location. Yandex supports hreflang like Google.

For both engines: implement hreflang (Google/Yandex) plus `<html lang="...">` and `<meta http-equiv="content-language">` (Bing).

- [Yoast: hreflang Ultimate Guide](https://yoast.com/hreflang-ultimate-guide/)

---

## Canonicalization & i18n

### Self-Referencing Canonicals

Each locale page must canonical to itself. John Mueller: "Don't use a rel=canonical across languages/countries, only use it on a per-country/language basis."

Google's docs: "Specify a canonical page in the same language, or the best possible substitute language if a canonical doesn't exist for the same language."

- [John Mueller: hreflang canonical](https://johnmu.com/hreflang-canonical/)
- [Google: Consolidate Duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

### Canonical Overrides Hreflang

Mueller: "If your canonical is pointing somewhere else, Google will follow that and ignore your hreflang annotation." The canonical URL must be one of the URLs in the hreflang set, or all hreflang markup is ignored.

When signals align, hreflang strengthens canonical selection: "Google prefers URLs that are part of hreflang clusters for canonicalization."

- [John Mueller: hreflang canonical](https://johnmu.com/hreflang-canonical/)
- [SEJ: Hreflang Tags Are Hints](https://www.searchenginejournal.com/google-reminds-that-hreflang-tags-are-hints-not-directives/546428/)

### Near-Duplicate Regional Variants

Mueller (2023 Office Hours): "If the content is completely the same, and we can't tell any difference, then for simplicity and user experience we may just show one version, even if hreflang is present."

Google's duplicate detection runs BEFORE hreflang evaluation. To keep both versions indexed, you need substantive content differences beyond currency symbols.

- [Google: Managing Multi-Regional Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### Pagination Across Locales

Google: "Don't use the first page of a paginated sequence as the canonical page. Instead, give each page its own canonical URL." Each paginated page in each locale gets self-referencing canonical. `rel="next/prev"` deprecated March 2019.

- [Google: Pagination Best Practices](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)

---

## International Sitemaps

### Structure

Each `<url>` entry includes `<xhtml:link>` alternates for every locale. Requires `xmlns:xhtml="http://www.w3.org/1999/xhtml"` namespace.

Split sitemaps by content type, not by locale. Splitting by locale creates maintenance problems because every locale sitemap must reference every other locale (reciprocal requirement).

- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

### Size Limits

50,000 URLs / 50MB uncompressed per sitemap. Only `<loc>` elements count toward the 50K limit. With 20 hreflang alternates per entry, the 50MB file size limit becomes the bottleneck. Plan 2,000-5,000 URLs per sitemap when using full hreflang.

- [Google: Build and Submit a Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

### Submission

Submit the sitemap index in Search Console AND reference it in robots.txt. Individual child sitemaps can be submitted separately for per-sitemap reporting.

### Next.js Caveat

`alternates.languages` does NOT automatically include a self-referencing `<xhtml:link>` for the `<loc>` URL. You must explicitly include the `<loc>` URL's own language in the `languages` object.

- [Next.js Docs: sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)

---

## URL Structure

### Strategies Compared

Google treats subdirectories and subdomains equivalently. Mueller: "From our point of view, subdomains and subdirectories are essentially equivalent."

URL parameters (`?lang=en`) are explicitly "Not recommended" per Google docs.

### Default Language

Mueller recommends: set `/` as x-default, put each language in its own prefix. Without marking `/` as x-default, "to Google it can look like '/' is a separate page from the others."

- [Google Blog: x-default](https://developers.google.com/search/blog/2023/05/x-default)

### Content Negotiation / IP Redirects

Google strongly advises against locale-adaptive pages. Googlebot crawls from US IPs and does not send Accept-Language headers. Separate URLs plus hreflang are required.

- [Google: Locale-Adaptive Pages](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)

### Trailing Slash Consistency

Mueller: trailing slash is "a significant part of the URL and will change the URL if it's there or not." Pick one format for all locale paths, internal links, canonicals, hreflang, and sitemaps.

Mueller (2025): "Consistency is the biggest technical SEO factor."

- [SERoundtable: Consistency Is The Biggest Technical SEO Factor](https://www.seroundtable.com/google-consistency-seo-40427.html)

### Search Console Geotargeting

The International Targeting report is deprecated. Google now relies on hreflang, content language analysis, and linking patterns. You can add subdirectory properties for per-locale reporting.

### Framework Locale Modes

Use `localePrefix: 'always'` (next-intl) or equivalent. Never hide locale from URLs, Google needs unique URLs per language. `'never'` mode disables alternate links entirely.

- [next-intl: Routing Configuration](https://next-intl.dev/docs/routing/configuration)

---

## Content Quality Across Locales

### Auto-Translated Content (2025 Stance)

Google removed longstanding guidance against auto-translated content in mid-2025. Current stance: "Our policies do not strictly define content that has been translated by AI as spam." The scaled content abuse policy mentions translation as a possible vector but does not ban it.

Reddit scaled AI translations to 35+ languages with Google's knowledge. The distinction is intent and quality, not method.

- [Google Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [SE Land: Reddit AI Translations](https://searchengineland.com/google-comments-on-reddits-use-of-ai-to-translate-its-pages-456908)

### Thin Locale Pages

Google: "Localized versions of a page are only considered duplicates if the main content of the page remains untranslated." Pages with only translated boilerplate get clustered as duplicates.

Do NOT noindex unwanted locale pages (wastes crawl budget). Do NOT canonical cross-locale (conflicts with hreflang). Best approach: do not create locale pages you cannot make genuinely useful.

- [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

### Helpful Content System Impact

Merged into core ranking March 2024. Site-wide signal: "any content, not just unhelpful content, on sites determined to have relatively high amounts of unhelpful content overall is less likely to perform well in Search."

Low-quality translated pages can drag down the entire site. The strongest argument against creating locale pages that are not genuinely useful.

- [Google Blog: Helpful Content Update](https://developers.google.com/search/blog/2022/08/helpful-content-update)

### Partial Translation

Google: "Translating only the boilerplate text of your pages while keeping the bulk of your content in a single language can create a bad user experience." Google uses visible content (not lang attribute) to determine page language.

Translate ALL content on a page if you create a locale version. Untranslated metadata (title, description) in the wrong language reduces CTR.

### Crawl Budget

Only a concern at 1M+ pages or 10K+ pages changing daily. Alternate URLs (hreflang targets) consume crawl budget. Broken hreflang links waste budget AND invalidate signals.

### Locale-Specific Signals

Google identifies audience via: "local addresses and phone numbers on the pages, the use of local language and currency, links from other local sites, or signals from your Business Profile."
