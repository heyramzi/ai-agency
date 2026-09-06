---
name: programmatic-seo
description: "The SEO pipeline one person can run end to end: what page to write next, keyword research, the page itself, and the off-site mentions that decide whether an assistant names you. Use on 'SEO', 'AEO', 'GEO', 'rank on Google', keyword research, or local search visibility."
tags: [plans, seo]
---

# Programmatic SEO

One person, a keyword file and a loop. The pipeline below produced 28 English articles and 112
pages across four languages on `getseam.app`, running at 180,000 impressions and 3,400 clicks over
three months. The order matters more than any single step: harvest what the site already ranks for,
judge the cluster before entering it, write the three shapes that rank, then feed the result back.

## The split that reorders everything

**58.5% of Google searches now end without a click to anyone, and an AI Overview costs the
number-one page 58% of its clicks.** There is no rebound coming: Google answers on the page on
purpose, because the alternative is losing the user to an assistant. The numbers, the sources and
the HubSpot case that settles the traffic-versus-revenue argument:
[references/measurement.md](references/measurement.md).

So every target sorts into one of two jobs, on one question: **can an assistant fully satisfy this
searcher on the results page?** Answer it against a real SERP, never from the keyword's shape. That
is the AI filter, and it runs in Phase 1 and Phase 2 below.

- **No, so earn the click.** Anything the searcher has to *do* rather than know: tools and
  calculators, transactional and commercial queries, and everything local. Overviews appear on
  about 21% of keywords and 99.9% of the ones that trigger them are informational, so this lane is
  intact and traditional SEO works in it exactly as it always did.
- **Yes, so earn the mention.** Informational queries, question phrasings, long multi-clause asks.
  You will not get the click. You can be the brand named inside the answer, and that is won off
  your own site more than on it.

**AEO, GEO and LLMO are the same work under three labels, and traditional SEO is its foundation.**
76% of AI Overview citations started as top-ten rankings, ChatGPT runs on Bing's index, and
Google's own line is that generative responses need nothing special. Buying "AI SEO" as a separate
discipline with a separate budget is buying a rebrand. What changed is the weighting: off-site
mentions are now the strongest measured signal there is.

## Choosing the cluster before the pipeline runs

Phase 1 below judges a cluster you already have in mind. Deciding which clusters to own in the
first place, searchable against shareable, pillars and spokes, keyword research by buyer stage and
how to rank the ideas, is in [references/content-strategy.md](references/content-strategy.md).

**Rank the audience segments before you open a keyword tool.** Topic first and audience later
produces traffic that is not attached to revenue. Score each segment on search demand, ranking
difficulty and business value, then take the overlap. One financial-services program chose a
222,000-search segment over a 2.7M-search one, passed a full prior year of organic leads in six
months, and held total lead volume at 71% of pace. That gap is the point. A comparison or
alternatives keyword becomes a page shape rather than an article: see Phase 3.

## Prerequisites

Search Console access (`gcloud auth application-default login` with the webmasters scope, per the
`search-console` skill), and `SERPER_API_KEY` for the research scripts.
Keep one copy in your own env file and export it before the scripts run.
OpenSEO in Docker is free and optional; DataForSEO credits buy volume and difficulty and the
pipeline runs without them. Every tool, what each call costs, and the rule that the free lane runs
first: [references/tooling.md](references/tooling.md).

## Phase 0. Harvest the console

Skip this only when the site has no Search Console history. Everywhere else it beats keyword
research, because Google has already told you which queries it associates with the domain.

```bash
GSC="python3 <search-console-skill>/scripts/gsc.py"
$GSC orphans <site> --days 90      # queries you rank for with no page targeting them
$GSC cannibals <site> --days 90    # queries your own pages are splitting
```

One run on `getseam.app` surfaced a query split across three of its own pages at 20,448 impressions
and position 9.1, two competitors with no page on the site at all, and five variants of `best notch
app for mac` with no exact page. Each is a page that pays for itself before a tool is opened.

The read order for that output, why to fix a split before adding a page, and why these totals run
slightly above the same query pulled on its own:
[`search-console/references/workflows.md`](../search-console/references/workflows.md). Sort on the
tool's numbers, quote the single-dimension pull.

## Phase 1. Judge the cluster before you enter it

The step that saves the most work is the one that stops a cluster from being written at all. Four
tests, all of which must pass:

1. **Winnable volume, not total volume.** Filter to KD 25 or under, then again by intent.
   `getwavenote.com`'s notes cluster showed 153,320 total and 84,160 nominally winnable, which
   collapsed to roughly 4,000 once off-product queries came out, overstated twentyfold.
2. **Products rank in the top ten.** If every top-ten slot belongs to listicles, Reddit and app
   stores, a product page cannot enter. Indie products at positions 3 to 5 says the slot exists.
3. **A qualifier with volume behind it.** `speech to text mac` returns 1,600, `meeting notes app
   for mac` returns zero. The qualifier the cluster is built on has to be one people type.
4. **The AI filter.** Google the head terms. If the Overview finishes the job, this is a mention
   play, not a traffic play, and gets planned as one.

Then check the site serves HTML. `airtabletosheets.com` had a full strategy written against it
while every path, including `/robots.txt` and `/sitemap.xml`, returned the string `Hello world` as
`text/plain` with HTTP 200. No amount of keyword work survives that. Curl the homepage and the
sitemap before anything else.

## Phase 2. Keyword research

```bash
python scripts/keyword-research.py -s "your keyword" --depth 3 --brief -o keywords.json
```

`--depth` costs one call at 1 and about six at 2. Output is Google autocomplete, related searches
and People Also Ask, deduplicated. Supplement through WebSearch for `[keyword] reddit`,
`[keyword] alternative` and `how to [keyword]`.

Save it to a file, never a chat window. The `getseam.app` research file holds 197 keywords, cost 20
API credits, and is still what every article is planned against seven months later.

Vet each candidate on **business potential** (does ranking first change anything), **intent**
(Google it; if every top result is a product page, a blog post will not enter) and **difficulty**
(referring domains and DR of the incumbents), then apply the AI filter above. To find in bulk the
queries that survive it, filter for transactional intent and include modifiers naming an action:
`calculator`, `checker`, `generator`, `tool`, `template`, `finder`, `planner`, `maker`.

Write in the vocabulary of the forum threads, not of the category. Buyers type "sync" and
"automatically update"; competitor pages say "ETL" and "data integration", which is why they lose
the long tail.

## Phase 3. Intent, then shape

Order the four things a person can be doing, by how close they are to paying.

| Intent | Example | Read |
| --- | --- | --- |
| Deciding | `seam vs voiceink` | Low volume, highest intent there is |
| Shopping | `best mac transcription app` | Good volume, good intent |
| Escaping | `noisli alternative` | Underrated. They have already paid for something once |
| Learning | `how to make the macbook notch useful` | Where the volume is, and the disappointment |

The traffic leader on `getseam.app` is `free dynamic island for mac`, and it converts worst on the
site: the qualifier `free` filtered for people who will not pay, very efficiently. Choose the
intent before the volume.

Three shapes did the ranking across the 28 articles: 12 comparisons, 6 alternative pages, 10 guides
and roundups. **The same three are what assistants cite**, because a list hands the model a
ready-made consensus, the one place where the click lane and the mention lane want the identical
artefact.

- **Comparison, `You vs Them`.** Table in the first screen, real measured numbers in it, honest
  where you lose. One row, CPU during dictation at 12 per cent against 25.6, outperformed the
  page around it, because nobody else in the category measured anything.
- **Alternative, `Them alternative`.** Same reader, one step earlier and angrier.
- **Roundup, `Best X for Y`.** Has to list tools you do not own, or it reads as an advert.

One page per intent. Write only the shape you can support.

## Phase 4. Draft, illustrate, publish

```bash
python scripts/generate-article.py --keyword "your keyword" --title "Your Title" --word-count 2000
```

Drafts land in `web/content/blog/drafts/`. Structure and frontmatter:
[assets/article-template.md](assets/article-template.md); brief inputs and image guidance:
[references/article-template.md](references/article-template.md).

**The draft is the input, never the output.** A generated page agrees with everything already
ranking, which is exactly what a summariser replaces with one paragraph. The test is whether the
page is *informationally additive*: read the top three results, then name what this page carries
that none of them does, your measurement, your customer's words, your screenshot, your opinion.
Without that, do not publish. Nothing else here matters more; 96% of the web gets zero Google
traffic mostly for failing it.

Then structure it so it survives being chunked: answer first in every section, sections that read
correctly out of context, named entities rather than "this tool", one idea per sentence. **Length
follows the answer**: word count does not correlate with citation and half of cited pages run
under 1,000 words. Reasoning and numbers: [references/geo-signals.md](references/geo-signals.md).

Run [references/seo-checklist.md](references/seo-checklist.md) before anything goes live, and ramp
the cadence; a hundred pages in a day is a spike Google reads as one. Translate last, and only what
is working, translation took 28 articles to 112 pages at close to no cost, and it is also the
fastest way to multiply a mistake.


## Phase 5. The off-site half, which is now the larger half

**Branded mentions on other people's pages correlate with AI visibility above backlinks, referring
domains and domain rating**, and most of what a model knows about a brand sits off the brand's own
domain. A page nobody else talks about is invisible to the mention lane however good it is.

Three tiers in order of value, editorial third parties, then Reddit and forums, then your own
other properties, with YouTube as the strongest single factor anyone has measured. The
correlations, how to work each tier, and the platform-by-platform citation differences that decide
which two to prioritise: [references/geo-signals.md](references/geo-signals.md).

Before it writes, an assistant runs searches of its own. Those fan-out queries brief the page that
wins, and the pages it retrieved and *did not* cite are the sharper half. Read them from a
logged-in conversation, never from the paid API, which scored an incumbent at zero in a category it
appears in nine times of 24: [references/fan-out.md](references/fan-out.md).

Link building has not changed and has not stopped mattering: be the source worth citing, answer
journalist queries, build a linkable tool. **Buying links in volume is still the fastest way to
lose a site**: white-hat and black-hat practitioners agree on that one.

## Phase 6. Feed the result back

Wait for indexing, filter the console to the new URL, record position and impressions, and run
Phase 0 again before the next batch so the cheapest opportunities enter the queue first.

Rank tracking alone no longer describes the outcome. What replaces it, the three trackable AI
signals, the four-layer correlation report, and the quarterly share-of-voice audit that sorts gaps
into six kinds, is [references/measurement.md](references/measurement.md).

**When the target is local, the playbook diverges completely** and the zero-click argument above
does not apply: [references/local.md](references/local.md).

## Boundaries

Structured data mechanics: `seo-schema-markup`. Console queries and index state: `search-console`.
App stores: `aso`. Page copy: `seo-copywriting`, with `humanizer` for the voice. Auditing an
existing brand's citation gaps prompt by prompt is the `ai-citation-strategist` agent, this skill
builds and places pages, that agent diagnoses why a competitor is named instead. Tool costs:
[references/tooling.md](references/tooling.md). SvelteKit blog infrastructure:
[references/blog-setup.md](references/blog-setup.md).

This skill appends new failure modes to its own pattern list after each run. When a run surfaces
one that is not already listed, append it to Learned Patterns with today's date before finishing.

## Verification

- [ ] Every target sorted into the click lane or the mention lane, with the AI filter run against a
      real SERP rather than guessed from the keyword's shape
- [ ] The page carries something the top three results do not
- [ ] `seo-checklist.md` passed, and no AI crawler is blocked in `robots.txt`
- [ ] Off-site mention targets named, not just on-site work
- [ ] New failure modes from this run appended below

## Learned Patterns

- 2026-09-06: This skill's own checklist carried "minimum 1,500 words for competitive keywords" as inherited doctrine; word count correlates with AI citation at r=0.04 across 174,000 pages and 53.4% of cited pages are under 1,000. Length follows the answer. [ask: consolidate SEO learnings into one skill]
- 2026-09-06: `geo-signals.md` stated SE Ranking's 30-40% schema lift as settled while Ahrefs finds no confirmed link. Where two studies disagree, carry both and say so; a contested number quoted flat becomes a client promise. [ask: consolidate SEO learnings into one skill]
- 2026-09-01: DataForSEO's fan-out endpoint reported an incumbent as absent from a category it appears in 9 times of 24. Read fan-out from a logged-in ChatGPT session; the API is a proxy for subject, not for standing. [ask: fan-out research for a client's category]
- 2026-08-11: A full keyword strategy was written against `airtabletosheets.com` while every path returned `Hello world` as `text/plain`. Curl the homepage and the sitemap before any research. [ask: build an SEO strategy for this domain]
