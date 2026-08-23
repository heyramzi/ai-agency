# vibe-systems

Tools for keeping an agent setup honest, and the kits that run on top of them: SEO,
and YouTube video production.

Agent configuration rots in a specific way: it never fails loudly. A broken skill
is not reported, it is simply never offered. A duplicated name does not conflict,
one side just stops existing. Everything here exists to make that class of silent
failure visible, and to repair the parts of it that have exactly one correct
answer.

## Start here

Fork it. This repo is a base to build your own kit on, not a library to depend
on. Add your skills under `skills/`, keep the two that ship with it, and they
keep the rest honest as the registry grows.

```
/plugin marketplace add heyramzi/vibe-systems
/plugin install vibe-systems@vibe-systems
```

Or clone it and point Claude Code at the directory.

**Not in a terminal?** Claude Cowork and claude.ai take one skill at a time as a
zip. Every skill here is prebuilt as one in [`zips/`](zips): download the zip you
want, then go to Customize, Skills, the plus button, Create skill, Upload a
skill, and pick it. About a minute per skill, and it is the same skill either
way.

## The SEO kit

Fourteen skills that take a site from a blank keyword file to published pages
that rank, plus the read of the scoreboard afterwards. They are the ones behind
[The SEO Engine](https://www.skool.com/ai-agency-systems-3191), and the five
marked below are the whole workflow in order.

| Skill | Does |
| --- | --- |
| [**seo-keyword-research**](skills/seo-keyword-research) | ① Seeds to a saved keyword file with volume, difficulty and intent |
| [**seo-content-strategy**](skills/seo-content-strategy) | ② That file to an ordered plan, pillars and clusters |
| [**seo-competitor-alternatives**](skills/seo-competitor-alternatives) | ③ The vs and alternative pages, which are the ones that convert |
| [**seo-meta-tags-optimizer**](skills/seo-meta-tags-optimizer) | ④ Title, description and social cards, written in the repo |
| [**search-console**](skills/search-console) | ⑤ Real GSC data: page-two pages, dead click rates, pages competing with each other |
| [seo-audit](skills/seo-audit) · [seo-page-audit](skills/seo-page-audit) | Whole-site and single-page technical passes |
| [seo-site-architecture](skills/seo-site-architecture) · [seo-broken-links](skills/seo-broken-links) | Structure, internal linking, and what is 404ing |
| [seo-competitor-profiling](skills/seo-competitor-profiling) | The research that feeds the comparison pages |
| [seo-schema-markup](skills/seo-schema-markup) · [seo-analytics-tracking](skills/seo-analytics-tracking) | Structured data, and measuring what lands |
| [seo-ai-seo](skills/seo-ai-seo) | Getting cited by ChatGPT, Perplexity and AI Overviews |
| [programmatic-seo](skills/programmatic-seo) | The end-to-end pipeline, with Serper scripts for research and drafting |

Once a skill is installed you do not summon it with a magic phrase. Describe the
job and Claude picks it up:

> Do keyword research for Mac dictation apps. Save it to a file.

> Look at that keyword file and tell me the first ten articles to write, best intent first.

> Write the comparison page for us against VoiceInk. Here are my numbers.

Two of them want an API key. `seo-keyword-research` and `programmatic-seo` use
[serper.dev](https://serper.dev), free for 2,500 queries. `search-console` uses
your own Google account through `gcloud`, and reads only.

## The YouTube kit

Thirteen skills that take a video from the first line of the hook to the posts cut out of
it afterwards. They are the ones behind [The YouTube
Engine](https://www.skool.com/ai-agency-systems-3191), and they run in this order.

| Skill | Does |
| --- | --- |
| [**video-hooks**](skills/video-hooks) | ① The opening. Variants by named mechanism, each rated for drop-off risk |
| [**video-script**](skills/video-script) | ② The body. Eight blocks, a beat budget, and one commercial ask at the end |
| [**video-coach**](skills/video-coach) | ③ The take reviewed against its plan, before a single cut, returning one habit to change |
| [**descript-script-edit**](skills/descript-script-edit) | ④ The cut, made by rewriting Descript's rich clipboard rather than by dragging |
| [**youtube-thumbnail**](skills/youtube-thumbnail) | ⑤ The frame, designed off a measurement you run yourself |
| [descript-projects](skills/descript-projects) | Footage into Descript, named and foldered so the media browser is the shot list |
| [dji-sync](skills/dji-sync) | The lav take waveform-matched to the camera clip and swapped in losslessly |
| [motion-broll](skills/motion-broll) · [youtube-ctas](skills/youtube-ctas) | Motion graphics cut against the read, and the transparent overlays an edit is dressed with |
| [whiteboard](skills/whiteboard) | Concept boards written as code and drawn onto the tablet live, on camera |
| [ai-video-prompting](skills/ai-video-prompting) | Prompts for Veo, Kling, Seedance and the rest, and when a model should not render a beat at all |
| [shorts-production](skills/shorts-production) | A finished Short coded, filed and scheduled, with the rule that an export ships untouched |
| [generate-social](skills/generate-social) | The transcript turned back into LinkedIn and X posts |

Nothing in it is summoned with a magic phrase either. Describe the job:

> Write me three hooks for a video about why agency retainers stall. Rate each one.

> Here is the raw transcript of the take. Coach me before I cut it.

> Cut this Descript script. I copied it, it is on the clipboard.

Two of them need more than a terminal. `descript-script-edit` drives the macOS clipboard,
and `motion-broll` and `youtube-ctas` render through [Remotion](https://remotion.dev).

### The thumbnail, in more detail

[**youtube-thumbnail**](skills/youtube-thumbnail) treats a thumbnail as a
measurement problem before it treats it as a design problem.

Most thumbnail advice is a style opinion repeated until it sounded like a rule. The way
past that is banding: for every channel you learn from, build a winner band and a control
band from that same channel and period, so brand, photographer and budget are held
constant. **A trait present in both bands is house style, and copying house style buys
nothing.** Only a trait that separates the bands is a lever.

Run it on a real niche and the usual advice starts falling over. A face tends to appear in
both bands, so its presence is not a lever and a close-up filling the frame is often a
control marker. Somebody else's revenue is a control marker. Adjectives with no object are
control markers. What separates, reliably, is a bounded promise in two to four words.

The skill carries the method end to end: how to build the bands, how to choose between the
face and faceless variants, six copy formulas with the ban list, and the composite rules
for rendering with an image model. [`scripts/render.mjs`](skills/youtube-thumbnail/scripts/render.mjs)
is a dependency-free renderer that takes your own photographs as reference images, so the
model composites around a real face instead of inventing one. Bring a Gemini API key, or
point it at a gateway.

It ships without an evidence file on purpose. The bands are yours to build, on your own
niche, and the skill is the method for building them. The whole kit is written that way:
every measured claim in it names what produced the number, and every one of them is worth
re-running on your own channel before you trust it.

## The courses, run by the agent

The four classrooms in [AI Agency](https://www.skool.com/ai-agency-systems-3191) are free,
and each one ships a second copy of itself written for the agent instead of for you. The
course is the mental model you read. The command is the same system as instructions your
own Claude can execute, so the reading and the building happen at once.

| Command | Course | Runs |
| --- | --- | --- |
| `/start-here` | Start Here | Scores your agency out of twelve, then builds the intake end to end |
| `/seo-engine` | The SEO Copywriter | Your rows, your keyword file, one page shape, then the console queue |
| `/marketing-department` | The Media Buyer | The five files, built on your own calls and your own numbers |
| `/youtube-engine` | The Creative Director | The four numbers off your own channel, from the runtime table to the ledger |

Install the plugin and type the command. Each one runs a module a sitting, asks you the
decisions that are yours, stops at the checkpoint, and names the lesson you read next.
It does not replace the course and it will send you back to it.

**No terminal?** Every command is one markdown file. Paste this into any Claude and it
does the same thing:

> Read https://raw.githubusercontent.com/heyramzi/vibe-systems/main/commands/seo-engine.md and run it with me.

None of them touch a live account without showing you first, none of them invent a number
you have not measured, and every one of them stops when the module ends.

## The two failure modes

A skills registry decays in two directions at once, and the fixes pull against
each other. Keeping them as separate skills on separate cadences is the point.

| Skill | Direction | Cadence | Use when |
| --- | --- | --- | --- |
| [**skill-cleaner**](skills/skill-cleaner) | Subtractive | Scheduled | Duplicates and overlapping skills compete for the same task, a skill works some days and not others, skills are scattered across projects and home directories, or links are dead |
| [**skill-healer**](skills/skill-healer) | Additive | Per session | A session taught you something a file should have known, or a skill keeps repeating a mistake it already made |

**It accumulates.** Every skill you add competes with the others for the same
triggers. Past a certain size the model is not choosing the right skill, it is
choosing between four that all look right, and you cannot tell which one it
picked. `skill-cleaner` merges those down to one survivor each, behind a git
guard so a bad merge is one command to undo.

**It goes stale.** A file keeps giving an instruction that stopped being true,
and every session pays again for the same wrong turn. `skill-healer` writes the
lesson into the file that should have known it, in the session that learned it,
and deletes what the lesson contradicts.

Run them on the same cadence and they fight: one pass adding caveats while
another removes them. Heal continuously, clean on a schedule, and let the clean
pass fold in what the heal passes accumulated.

## Layout

```
.claude-plugin/
  marketplace.json      this repo as a marketplace
  plugin.json           this repo as a plugin
commands/
  <course>.md           one slash command per Skool course
skills/
  <skill-name>/
    SKILL.md            frontmatter and instructions
    references/         detail loaded only when needed
    scripts/            executables, committed, no install step
zips/
  <skill-name>.zip      one zip per skill, for Cowork and claude.ai
```

`zips/` is generated. After changing anything under `skills/`, run
`./scripts/build-zips.sh` and commit what it writes.

Each skill is self-contained, carries its own reference material, and ships a
dependency-free script so it works on a fresh clone. Node 20 or later, nothing
installed.

## Checking your own fork

Both tools run against this repo, and against each other. That is the intended
way to use them on your own:

```bash
node skills/skill-cleaner/scripts/skill-cleaner.cjs audit skills
node skills/skill-healer/scripts/skill-healer.cjs check skills
```

Both exit non-zero when something is wrong, so they drop into CI as-is.

MIT.
