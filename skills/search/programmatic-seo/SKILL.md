---
name: programmatic-seo
description: "The keyword-to-published-page pipeline, run at volume by one person, from Search Console history or from Serper.dev where there is none. Use when deciding what page to write next, when researching keywords for a niche, when judging whether a content cluster is worth entering, when generating article drafts or briefs, or when setting up blog infrastructure on SvelteKit. Holds the data cost policy for every SEO skill."
tags: [plans, seo]
---

# Programmatic SEO

One person, a keyword file and a loop. The pipeline below produced 28 English articles and
112 pages across four languages on `getseam.app`, running at 180,000 impressions and 3,400
clicks over three months.

The order matters more than any single step. Harvest what the site already ranks for, judge
the cluster before entering it, write the three shapes that do the ranking, then read the
console and feed the result back in.

## Choosing the cluster before the pipeline runs

Phase 1 below judges a cluster you already have in mind. Deciding which clusters to own in the
first place, searchable against shareable, pillars and spokes, keyword research by buyer stage and
how to rank the ideas, belongs to [seo-content-strategy](../seo-content-strategy/SKILL.md).

A comparison or alternatives keyword becomes a page shape rather than an article, not a standalone
skill: see the three shapes in Phase 3 below.

## Prerequisites

| Need | Where |
| --- | --- |
| Search Console access | `gcloud auth application-default login` with the webmasters scope. See the `search-console` skill |
| OpenSEO MCP | Self-hosted in Docker, free. Gives the console, Analytics and a site crawler through one MCP endpoint. Setup below |
| `SERPER_API_KEY` | One copy in your own env file, exported before the scripts run. Free tier 2,500 queries at [serper.dev](https://serper.dev) |
| Volume and difficulty | DataForSEO credits, topped up in $50 increments. Optional, and the pipeline runs without it |

## Phase 0. Harvest the console

Skip this only when the site has no Search Console history. Everywhere else it beats keyword
research, because Google has already told you which queries it associates with the domain.

```bash
GSC="python3 <search-console-skill>/scripts/gsc.py"
$GSC orphans <site> --days 90      # queries you rank for with no page targeting them
$GSC cannibals <site> --days 90    # queries your own pages are splitting
```

A row in `orphans` is a query where the page collecting the impressions is about something
adjacent. That is the cheapest page you will ever write, because the ranking is half done
before the draft exists.

What one run found on `getseam.app`, 13 May to 11 August 2026:

| Finding | Number |
| --- | --- |
| `boring notch` split across three of its own pages | 20,448 impressions, 62 clicks, position 9.1 |
| `macnotch`, a competitor with no page on the site | 1,700 impressions, 6 clicks, position 8.8 |
| Atoll, a second competitor with no page, across nine phrasings | 1,102 impressions, 8 clicks |
| `best notch app for mac` and four variants, no exact page | 1,307 impressions |

Totals from `orphans` and `cannibals` run a little above the same query pulled on its own,
because Google aggregates differently once `page` joins the dimensions. Sort on the tool's
numbers, quote the single-dimension pull.

Fix the splits before adding pages. A new page on a query that already splits three ways makes
it split four ways.

## Phase 1. Judge the cluster before you enter it

The step that saves the most work is the one that stops a cluster from being written at all.
Score the candidate against a cluster whose results you have already measured, so the number
means something.

Three tests, all of which must pass:

1. **Winnable volume, not total volume.** Filter to KD 25 or under, then filter again by
   intent. On `getwavenote.com` the notes cluster showed 153,320 total volume and 84,160
   nominally winnable, which collapsed to roughly 4,000 once queries that did not match what
   the product sells were removed. The dictation cluster held 17,470 after the same filter.
   The raw total overstated the notes cluster by a factor of twenty.
2. **Products rank in the top ten.** If every top-ten slot on the head terms belongs to
   listicles, Reddit and app stores, a product page cannot enter. Indie products holding
   positions 3 to 5 is the signal that the slot exists.
3. **A qualifier with volume behind it.** `speech to text mac` returns 1,600. `meeting notes
   app for mac` returns zero. The qualifier the cluster is built on has to be one people type.

Then check the site serves HTML. `airtabletosheets.com` had a full strategy written against it
while every path, including `/robots.txt` and `/sitemap.xml`, returned the string `Hello world`
as `text/plain` with HTTP 200. No amount of keyword work survives that. Curl the homepage and
the sitemap before anything else.

## Phase 2. Keyword research

```bash
python scripts/keyword-research.py -s "your keyword"            # Basic (1 call)
python scripts/keyword-research.py -s "your keyword" --depth 2  # Deep (~6 calls)
python scripts/keyword-research.py -s "your keyword" --depth 3 --brief -o keywords.json
```

Output: Google autocomplete suggestions, related searches from the SERP, People Also Ask
questions, deduplicated. Supplement through WebSearch for `[keyword] reddit`,
`[keyword] alternative` and `how to [keyword]`.

Save it to a file, never a chat window. The `getseam.app` research file holds 197 keywords,
cost 20 API credits to build, and is still what every article is planned against seven months
later. Structure it in the four buckets that match the four intents below.

Write in the vocabulary of the forum threads, not of the category. Buyers type "sync" and
"automatically update". Competitor pages say "ETL", "connector" and "data integration", which
is why they lose the long tail.

## Phase 3. Intent, then shape

Order the four things a person can be doing, by how close they are to paying.

| Intent | Example | Read |
| --- | --- | --- |
| Deciding | `seam vs voiceink` | Low volume, highest intent there is |
| Shopping | `best mac transcription app` | Good volume, good intent |
| Escaping | `noisli alternative` | Underrated. They have already paid for something once |
| Learning | `how to make the macbook notch useful` | Where the volume is, and the disappointment |

The traffic leader on `getseam.app` is `free dynamic island for mac`, and it converts worst on
the site. The qualifier `free` filtered for people who will not pay, very efficiently. Choose
the intent before the volume.

Three shapes did the ranking across the 28 articles: 12 comparison pages, 6 alternative pages,
10 guides and category roundups.

- **Comparison, `You vs Them`.** Table in the first screen, real measured numbers in it, honest
  in the rows where you lose. One measured row, CPU during dictation at 12 per cent against
  25.6, outperformed the page around it, because nobody else in the category measured anything.
- **Alternative, `Them alternative`.** Same reader, one step earlier and angrier. Name the
  thing that makes people leave.
- **Roundup, `Best X for Y`.** Has to list tools you do not own, or it reads as an advert.

One page per intent. Write only the shape you can support.

## Phase 4. Draft, illustrate, publish

```bash
python scripts/generate-article.py --keyword "your keyword" --title "Your Title" --word-count 2000
```

See [references/article-template.md](references/article-template.md) for structure, frontmatter
and image guidance. Drafts land in `web/content/blog/drafts/`.

Pre-publish checklist:

- [ ] Title under 60 chars with the primary keyword
- [ ] Meta description 150-160 chars, written to be clicked rather than to be complete
- [ ] Primary keyword in H1, first paragraph and URL
- [ ] The answer in the first screen, before the scroll
- [ ] 3-5 internal links, target phrase as the link text
- [ ] 2-3 external links to authoritative sources
- [ ] Images with alt text describing the frame, not repeating the keyword
- [ ] CTA present

Translate last, and only what is working. Translation took 28 articles to 112 pages at close to
no cost, and it is also the fastest way to multiply a mistake.


## Phase 5. Feed the result back

Wait for indexing, filter the console to the new URL, record position and impressions. Run
Phase 0 again before the next batch so the cheapest opportunities enter the queue first.

Watch for long, machine-shaped queries at position 5 to 9 with exactly zero clicks. Those are
AI Overview fan-out queries, not a title failure. One pricing page in this workspace carries a
cluster of them, 719 impressions at position 5.3 with no clicks, and rewriting titles against
them buys nothing.
 Answer in the first screen, keep the facts in a liftable table, and
carry the matching schema. The `search-console` skill covers how to tell them apart.

## Tools and what they cost

Which tool answers which question, what each call costs, and the rule that the free lane runs first. See [`references/tooling.md`](references/tooling.md).

## Generative engine optimisation

For ChatGPT, Perplexity and AI Overviews: answer the question directly in the first paragraph,
carry FAQ schema, cite statistics with their sources, and build brand mentions off-site. The
pages that get lifted into an answer are the ones whose facts sit in a table with a source
next to them.

## Resources

- `scripts/keyword-research.py`. Serper.dev keyword research
- `scripts/generate-article.py`. article draft generator
- `references/article-template.md`. article structure and image guidance
- `references/blog-setup.md`. SvelteKit blog infrastructure
- `references/seo-checklist.md`. pre-publish checklist
- `assets/article-template.md`. markdown template
