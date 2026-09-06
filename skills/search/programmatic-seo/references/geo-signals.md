# What actually earns an AI citation, measured

The evidence file for the AI-search half of `SKILL.md`. Every number here is somebody's published
study, attributed, because the field is full of confident claims with nothing under them. Where two
studies disagree, both are here and the disagreement is the finding.

Sources: Ahrefs' AEO research (75,000 brands, 174,000 cited pages, 140M robots.txt files),
Princeton's GEO paper (KDD 2024, run against Perplexity), SE Ranking, ZipTie (400,000 pages),
Seer Interactive with Nectaf, SparkToro with Datos.

## How the machine assembles an answer

**One prompt becomes many searches.** The assistant does not look up what the buyer typed. It fans
the prompt out into sub-queries and runs them at once: 9 to 11 on average (Seer/Nectaf), as high as
28, and ChatGPT's deep research mode was measured at 420 searches for one shopping prompt.

Three consequences, and they are the whole strategy:

1. **Topic coverage beats keyword targeting.** A page that answers one query in a fan-out loses to
   a page that answers most of it. One page, one target keyword is a losing shape.
2. **Fan-out queries are not a keyword list.** Over 95% carry zero search volume, they are
   generated in the moment, and the same prompt fans out differently on the next run. Read them as
   a brief, never as targets. Harvesting them from a real session: [fan-out.md](fan-out.md).
3. **Citation is probabilistic, not a ranking.** Ask the same question five times and you may be
   named three times. There is no position to hold, so the metric is share of voice across many
   runs, never a rank.

## The strongest signal is a mention on somebody else's page

In the 75,000-brand study, **branded web mentions correlate with AI Overview visibility at 0.664,
above backlinks, referring domains and domain rating.** Mentions on heavily linked pages reach
0.70. A German link-building agency puts the same finding the blunt way: about **85% of what an LLM
knows about a brand sits on third-party sites, not on the brand's own domain.**

So the off-site half of the work is now the larger half. Three tiers, in order of value:

- **Editorial third parties.** Industry publications, review sites, listicles and comparison posts
  on authoritative blogs. Hardest to earn, and exactly the page shape assistants cite.
- **User-generated.** Reddit, Quora, niche forums. Reddit is among ChatGPT's most-cited domains and
  a foundational training source. Answer threads your product genuinely fits; a brand-name drop
  backfires. One analysis of B2B SaaS SERPs found Reddit outranking every vendor on 50-66% of
  shared keywords, and 77% of the search volume it won came from plain category terms rather than
  "best" or "review" phrasings; buyers form the opinion in the thread before they reach any vendor.
- **Your own other properties.** YouTube, podcast, LinkedIn. All crawled, all quotable.

**YouTube is the outlier and deserves its own budget line.** It is the most-cited domain in Google
AI Overviews (~5.6% of citations), and YouTube mentions correlate with ChatGPT visibility at
**0.737, the strongest single factor Ahrefs measured**, because GPT-4 trained on over a million
hours of transcripts. Target search hits, not viral hits: a video ranking in Google for an evergreen
query keeps earning citations, and a spike does not. Put the keyword in the title, in the first two
lines of the description, and **say it out loud in the video**: Google parses the audio.

## What the cited page looks like

| Finding | Number | What it means |
| --- | --- | --- |
| Word count vs citation | r = 0.04 across 174,000 pages | Length is not a lever. **53.4% of cited pages are under 1,000 words** |
| Freshness | AI-cited pages are 25.7% fresher than pages ranking organically | For ChatGPT's top-cited pages, 89.7% were updated within the year and 76% within 30 days |
| Format | 43.8% of ChatGPT-cited pages are listicles | Best-X, top-X, versus and review pages. They hand the model a ready-made consensus |
| Churn | Over 45% of AI Overview citations change on refresh, roughly every two days | A citation audit is a standing job, not a project |

Four writing rules follow from how the text is chunked before it is read. They are the same four
that make a page skimmable for a person, which is the tell that this is not a separate craft:

- **Answer first.** Open every section with the conclusion, then the support. Both readers and
  models weight the start and end of a passage over the middle.
- **Atomic sections.** Take any H2 and read it with nothing around it. If it needs three earlier
  paragraphs to make sense, rewrite it: you do not control where the chunk boundary falls.
- **Name the entities.** "This tool finds low-difficulty keywords" carries nothing. "Ahrefs
  Keywords Explorer finds keywords with low difficulty and high traffic potential" carries a
  product, a capability and two attributes.
- **One idea per sentence.** If a sentence needs two reads, it is too long for the chunker and for
  the reader.

**Label your own frameworks with your brand name**, or the model absorbs the idea as general
knowledge and credits nobody. "The <brand> content scoring matrix", defined explicitly, repeated
across the blog, the social posts and the podcast, survives; "a content scoring matrix" does not.

## The platforms do not overlap, so pick two

Of the top 50 most-cited domains across AI Overviews, ChatGPT and Perplexity, **only seven appear on
all three.** Google's own AI Overviews and AI mode share just 13.7% of their citations while giving
86% semantically similar answers.

| Platform | Pulls from | Traditional-SEO overlap |
| --- | --- | --- |
| Google AI Overviews | YouTube, Reddit, Quora, encyclopedic and Google-owned properties | Was 76% of citations from Google's top 10; a later study puts it near 38% and falling |
| Google AI mode | YouTube by a wide margin, then Google and Wikipedia; cites Quora 3.5x more than AI Overviews, and pulls from Facebook and Instagram | Low |
| ChatGPT | Publishers and media: Reddit, Wikipedia, Amazon, Forbes. Median domain rating of its top-cited pages is 90 | 8-10%. Runs on Bing's index, so Bing visibility is the gate |
| Perplexity | Niche and regional sites, FAQ-schema pages, ungated PDFs | 28.6%, the most Google-aligned of the four, so the fastest win if you already rank |
| Claude | Brave Search when web search is on | Low and selective; factual density tips it |

**Being mentioned and being linked are different outcomes.** Only about 28% of AI mentions carry a
link: Perplexity 51.6%, AI mode 36.8%, ChatGPT 26.9%, AI Overviews 10.7%. The unlinked seven in ten
still work: each one is another training example binding the brand to the topic. But they will
never appear in analytics. This is why [measurement.md](measurement.md) exists.

## The Princeton technique table, still the best per-edit guide

Percentage visibility lift per rewrite technique, measured against Perplexity:

| Technique | Lift |
| --- | --- |
| Cite sources | +40% |
| Add statistics | +37% |
| Add quotations, named and titled | +30% |
| Authoritative tone | +25% |
| Improve clarity | +20% |
| Explained technical terms | +18% |
| Keyword stuffing | **-10%** |

Best measured pair: fluency plus statistics. A low-ranking site gains more than a high-ranking one,
up to 115% with citations, because it has more headroom. SE Ranking's separate AI Overviews numbers
put cited sources at +132% and authoritative tone at +89%.

## Misinformation is the risk nobody budgets for

Ahrefs planted three contradicting sources about an invented luxury brand across a blog, Reddit and
Medium. **Gemini and Perplexity repeated the fiction in 37-39% of their answers**, citing invented
founders and pricing as fact. ChatGPT stayed under 7% and cited the brand's official FAQ in 84%.

Seer Interactive found a single negative review theme resurfacing **67 times** across branded AI
outputs. Publishing real data that contradicted it displaced the theme after two citations, and it
crept back when the data was not refreshed.

The defence is specificity, because when a model chooses between a vague truth and a specific
fiction it takes the specific one. Fill every information gap about the brand with dated, numbered,
official content, and re-publish it on a schedule rather than once.

## Technical: what actually blocks a citation

- **Check `yourdomain.com/robots.txt` for `GPTBot`, `OAI-SearchBot`, `ClaudeBot` and
  `Google-Extended` before anything else.** 5.9% of 140 million sites block GPTBot, almost none of
  them on purpose. **Cloudflare's "manage AI bot traffic with robots.txt" is on by default** and
  writes the block for you. `CCBot` is training-only and safe to block; every other bot above mixes
  training and citation, so blocking it forfeits the citation too.
- **ChatGPT's crawler does not render JavaScript.** Gemini and Copilot do. A client-rendered page
  is an empty shell to the largest assistant, so server-render or statically generate. Test by
  disabling JS and loading your own page.
- **Speed matters more here than for ranking.** Retrieval fetches, parses and chunks in real time,
  and a slow page is dropped before it is ever scored.
- **`llms.txt` is not supported by any major provider.** Not OpenAI, not Google; Anthropic publishes
  one without confirming its crawlers read it. Harmless, not a priority.
- **Schema's effect on AI citation is contested.** SE Ranking measured a 30-40% AI Overviews lift
  for pages carrying Article, FAQPage, HowTo or Product markup; Ahrefs found no confirmed link and
  recommends it only as general hygiene. Both readings agree it does not hurt and that rich-result
  eligibility justifies it on its own, so implement it for that and do not sell it as an AI play.
  Mechanics belong to the `seo-schema-markup` skill.
- **Redirect the URLs the assistants invent.** They send visitors to 404s **2.87 times more often
  than Google does**, ChatGPT worst at about 1% of its clicked URLs. Any hallucinated path taking
  repeat traffic gets a redirect to the nearest real page.

## Google's own position, and why it is not the last word

John Mueller's line is that there is nothing special to do for generative responses beyond ordinary
SEO. Take it as a floor rather than a ceiling: it is consistent with 76% of AI Overview citations
starting as top-10 rankings, and it says nothing about the off-site mention work above, which is
where the measured correlation actually sits. Bing's public stance differs.

**AI-written content is not itself a ranking liability.** Google's documented position permits
automation and judges the output. The strongest available evidence is the image case: SynthID has
marked Google's generated images since 2023, free detectors identify them in seconds, and it has
never been what decides whether a page ranks. Do not strip a text watermark to be safe, the
character-swap method substitutes homoglyphs from other alphabets, which breaks the entity
resolution the page depends on, and mixed-script text is a spam signal Google has run for years.
The rule that survives is the same one as ever: generic output loses because it is generic, not
because a machine typed it.
