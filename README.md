<img src="assets/banner.png" alt="ai-agency" width="100%">

# ai-agency

Forty-one agent skills, five slash commands and one agent, for the three parts of an
agency that repeat every week: search, video production and client delivery. Plus the
two tools that keep a skills registry from rotting, because everything here has to
survive being added to.

Everything in it is the working version of something taught in **[AI Agency][skool]**,
a free Skool room where each classroom teaches one column of an agency. The course is
the mental model you read. The folder here is the same system your own Claude runs.

[**Join the room**][skool] — it is free, the five built classrooms are open, and the
commands below run their courses on your own business.

[skool]: https://go.upsys-consulting.com/skool

## Start here

Fork it. This repo is a base to build your own kit on, not a library to depend
on. Add your skills under `skills/`, keep the two that ship with it, and they
keep the rest honest as the registry grows.

```
/plugin marketplace add heyramzi/ai-agency
/plugin install ai-agency@ai-agency
```

Or clone it and point Claude Code at the directory.

**Working through an agent with no terminal?** One fetch answers what is here:

> Read https://raw.githubusercontent.com/heyramzi/ai-agency/main/index.json and tell me which skill fits.

[`index.json`](index.json) is generated beside the zips and carries every skill's
name, area and description with the raw URL of its `SKILL.md`, plus the five
commands and the agent. An agent cannot list a directory over HTTP and guessing raw
URLs off a README table is where a run goes wrong, so they are written out. Point any
Claude at a `skill_md` URL and it runs that skill without installing anything.

**Not in a terminal?** Claude Cowork and claude.ai take one skill at a time as a
zip. Every skill here is prebuilt as one in [`zips/`](zips): download the zip you
want, then go to Customize, Skills, the plus button, Create skill, Upload a
skill, and pick it. About a minute per skill, and it is the same skill either
way.

## One folder per role

Skills sit in `skills/<area>/<skill>/`, and the areas are the same twelve the
[AI Agency](https://go.upsys-consulting.com/skool) classroom is built from. Each
area is one column of an agency, and the course named beside it teaches a person to run
that column, so the shelf you read and the folder you install out of say the same thing.

| Folder | The role it adds up to | Skills |
| --- | --- | --- |
| [`skills/search`](skills/search) | The SEO Copywriter | 14 |
| [`skills/video`](skills/video) | The Video Producer | 11 |
| [`skills/delivery`](skills/delivery) | The Project Manager | 12 |
| [`skills/design`](skills/design) | The Art Director | 1 |
| [`skills/content`](skills/content) | The Ghostwriter | 1 |
| [`skills/quality`](skills/quality) | The QA Lead | 1 |
| [`skills/operations`](skills/operations) | The Chief of Staff | 1 |

The other five areas — strategy, demand, sales, engineering and finance — are rows on
the classroom shelf with no public skills yet, and they get a folder the day one lands.

**A kit is a workflow, not a folder.** The SEO kit is `skills/search` end to end, but the
YouTube kit crosses three: the thumbnail is art direction and the posts cut out of a video
are ghostwriting, so they file under `design` and `content` and still run in the video
order below. Where a skill lives answers "whose job is this", never "what did I use it
for last".

**A nested folder is not discovered on its own.** `.claude-plugin/plugin.json` names every
skill path, and `./scripts/build-zips.sh` regenerates that list, so adding a skill to a
fork is one folder plus one run of the script.

## The SEO kit

Fourteen skills that take a site from a blank keyword file to published pages
that rank, plus the read of the scoreboard afterwards. They are the ones behind
[The SEO Copywriter](https://go.upsys-consulting.com/skool), and the five
marked below are the whole workflow in order.

| Skill | Does |
| --- | --- |
| [**seo-keyword-research**](skills/search/seo-keyword-research) | ① Seeds to a saved keyword file with volume, difficulty and intent |
| [**seo-content-strategy**](skills/search/seo-content-strategy) | ② That file to an ordered plan, pillars and clusters |
| [**seo-competitor-alternatives**](skills/search/seo-competitor-alternatives) | ③ The vs and alternative pages, which are the ones that convert |
| [**seo-meta-tags-optimizer**](skills/search/seo-meta-tags-optimizer) | ④ Title, description and social cards, written in the repo |
| [**search-console**](skills/search/search-console) | ⑤ Real GSC data: page-two pages, dead click rates, pages competing with each other |
| [seo-audit](skills/search/seo-audit) · [seo-page-audit](skills/search/seo-page-audit) | Whole-site and single-page technical passes |
| [seo-site-architecture](skills/search/seo-site-architecture) · [seo-broken-links](skills/search/seo-broken-links) | Structure, internal linking, and what is 404ing |
| [seo-competitor-profiling](skills/search/seo-competitor-profiling) | The research that feeds the comparison pages |
| [seo-schema-markup](skills/search/seo-schema-markup) · [seo-analytics-tracking](skills/search/seo-analytics-tracking) | Structured data, and measuring what lands |
| [seo-ai-seo](skills/search/seo-ai-seo) | Getting cited by ChatGPT, Perplexity and AI Overviews |
| [programmatic-seo](skills/search/programmatic-seo) | The end-to-end pipeline, with Serper scripts for research and drafting |

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
it afterwards. They are the ones behind [The Video
Producer](https://go.upsys-consulting.com/skool), and they run in this order.

| Skill | Does |
| --- | --- |
| [**video-hooks**](skills/video/video-hooks) | ① The opening. Variants by named mechanism, each rated for drop-off risk |
| [**video-script**](skills/video/video-script) | ② The body. Eight blocks, a beat budget, and one commercial ask at the end |
| [**video-coach**](skills/video/video-coach) | ③ The take reviewed against its plan, before a single cut, returning one habit to change |
| [**descript-script-edit**](skills/video/descript-script-edit) | ④ The cut, made by rewriting Descript's rich clipboard rather than by dragging |
| [**youtube-thumbnail**](skills/design/youtube-thumbnail) | ⑤ The frame, designed off a measurement you run yourself |
| [descript-projects](skills/video/descript-projects) | Footage into Descript, named and foldered so the media browser is the shot list |
| [dji-sync](skills/video/dji-sync) | The lav take waveform-matched to the camera clip and swapped in losslessly |
| [motion-broll](skills/video/motion-broll) · [youtube-ctas](skills/video/youtube-ctas) | Motion graphics cut against the read, and the transparent overlays an edit is dressed with |
| [whiteboard](skills/video/whiteboard) | Concept boards written as code and drawn onto the tablet live, on camera. Ships the engine and one worked board |
| [ai-video-prompting](skills/video/ai-video-prompting) | Prompts for Veo, Kling, Seedance and the rest, and when a model should not render a beat at all |
| [shorts-production](skills/video/shorts-production) | A finished Short coded, filed and scheduled, with the rule that an export ships untouched |
| [generate-social](skills/content/generate-social) | The transcript turned back into LinkedIn and X posts |

Nothing in it is summoned with a magic phrase either. Describe the job:

> Write me three hooks for a video about why agency retainers stall. Rate each one.

> Here is the raw transcript of the take. Coach me before I cut it.

> Cut this Descript script. I copied it, it is on the clipboard.

Three of them need more than a terminal. `descript-script-edit` drives the macOS clipboard,
`motion-broll` and `youtube-ctas` render through [Remotion](https://remotion.dev), and `whiteboard`
ships a small TypeScript project in [`skills/video/whiteboard/tool`](skills/video/whiteboard/tool),
which is the one thing here with an install step: `cd tool && pnpm install`. It is the exception to
the dependency-free rule below, because speaking Excalidraw's collaboration protocol means speaking
socket.io.

### The thumbnail, in more detail

[**youtube-thumbnail**](skills/design/youtube-thumbnail) treats a thumbnail as a
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
for rendering with an image model. [`scripts/render.mjs`](skills/design/youtube-thumbnail/scripts/render.mjs)
is a dependency-free renderer that takes your own photographs as reference images, so the
model composites around a real face instead of inventing one. Bring a Gemini API key, or
point it at a gateway.

It ships without an evidence file on purpose. The bands are yours to build, on your own
niche, and the skill is the method for building them. The whole kit is written that way:
every measured claim in it names what produced the number, and every one of them is worth
re-running on your own channel before you trust it.

## The ClickUp kit

Twelve skills and one agent that run an agency's delivery on ClickUp: intake,
capacity, approvals and handover. They are the ones behind
[The Project Manager](https://go.upsys-consulting.com/skool), and they all
talk to the same `cu` command line rather than to the API by hand.

| Skill | Does |
| --- | --- |
| [**clickup-cli**](skills/delivery/clickup-cli) | ① Every read and write: tasks, lists, docs, views, fields, time |
| [**clickup-ops**](skills/delivery/clickup-ops) | ② The week: triage, a meeting turned into tasks, the ad-hoc pass |
| [**batch-workload**](skills/delivery/batch-workload) | ③ Points, a per-person cap, and a week that fits inside it |
| [**clickup-audit**](skills/delivery/clickup-audit) | ④ A workspace assessed before you agree to run anything in it |
| [**clickup-stale-triage**](skills/delivery/clickup-stale-triage) | ⑤ What stopped moving, ruled on one list at a time |
| [board-spec](skills/delivery/board-spec) · [board-start](skills/delivery/board-start) | A task specced into a brief, then built in its own worktree |
| [board-ship](skills/delivery/board-ship) · [board-move](skills/delivery/board-move) | The merge gate, and a status change on its own |
| [clickup-data-manager](skills/delivery/clickup-data-manager) | Bulk creation, bulk updates and cleanup at a scale nobody clicks through |
| [clickup-browser](skills/delivery/clickup-browser) | Templates, automations, dashboards and statuses, which have no public API |
| [clickup-super-agents](skills/delivery/clickup-super-agents) | Building and debugging ClickUp's own agents |

The agent on top is [**project-manager**](agents/delivery/project-manager.md). It reads the
board, names what is late, names who is over capacity, names what is waiting on a
client, and proposes one move per problem. It never presses the button itself.

> What is late on the delivery board, and who is over capacity this week?

> Turn yesterday's client call into tasks, then tell me what has to move to make room.

**These need the `cu` command line.** Its install line is handed out in The Project
Manager, lesson 2. The skills read as documentation without it, and run with it.

## The courses, run by the agent

The Classroom shelf in [AI Agency](https://go.upsys-consulting.com/skool) is thirteen
cards, one per column of an agency plus Start Here, and five of them are built. All five
are free, and each one ships a second copy of itself written for the agent instead of for
you. The course is the mental model you read. The command is the same system as
instructions your own Claude can execute, so the reading and the building happen at once.

| Command | Course | Runs |
| --- | --- | --- |
| `/start-here` | Start Here | Scores your agency out of twelve, then builds the intake end to end |
| `/clickup-foundations` | ClickUp Foundations | Your own ClickUp, from the five decisions to the template and the three automations |
| `/seo-engine` | The SEO Copywriter | Your rows, your keyword file, one page shape, then the console queue |
| `/marketing-department` | The Media Buyer | The five files, built on your own calls and your own numbers |
| `/youtube-engine` | The Video Producer | The four numbers off your own channel, from the runtime table to the ledger |
| `/the-project-manager` | The Project Manager | Your board, your capacity number, and the four gates the work passes |

Install the plugin and type the command. Each one runs a module a sitting, asks you the
decisions that are yours, stops at the checkpoint, and names the lesson you read next.
It does not replace the course and it will send you back to it.

Start Here opens the day you join. The other four sit on the room's level ladder and
open as you post and reply, which is a few days of turning up rather than a payment.
The eight unbuilt cards are locked above every rung anyone has reached, because an
empty course that opens is a worse promise than a padlock.

**No terminal?** Every command is one markdown file. Paste this into any Claude and it
does the same thing:

> Read https://raw.githubusercontent.com/heyramzi/ai-agency/main/commands/seo-engine.md and run it with me.

None of them touch a live account without showing you first, none of them invent a number
you have not measured, and every one of them stops when the module ends.

## The two failure modes

Agent configuration rots in a specific way: it never fails loudly. A broken skill
is not reported, it is simply never offered. A duplicated name does not conflict,
one side just stops existing. The two skills below exist to make that class of
silent failure visible, and to repair the parts of it that have exactly one
correct answer.

A registry decays in two directions at once, and the fixes pull against each
other. Keeping them as separate skills on separate cadences is the point.

| Skill | Direction | Cadence | Use when |
| --- | --- | --- | --- |
| [**skill-cleaner**](skills/quality/skill-cleaner) | Subtractive | Scheduled | Duplicates and overlapping skills compete for the same task, a skill works some days and not others, skills are scattered across projects and home directories, or links are dead |
| [**skill-healer**](skills/operations/skill-healer) | Additive | Per session | A session taught you something a file should have known, or a skill keeps repeating a mistake it already made |

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
agents/
  <area>/<agent>.md     one folder per area, same twelve as the skills
skills/
  <area>/
    <skill-name>/
      SKILL.md          frontmatter and instructions
      references/       detail loaded only when needed
      scripts/          executables, committed, no install step
zips/
  <skill-name>.zip      one zip per skill, for Cowork and claude.ai
assets/                 the banner above and the social card, generated
index.json              every skill, command and agent with its raw URL
```

`zips/`, `index.json` and the `skills` array in `plugin.json` are all generated. After changing
anything under `skills/`, run `./scripts/build-zips.sh` and commit what it writes. The
zip is flat inside, `<skill>/SKILL.md`, because the area is a fact about this repo and
not about the skill.

Each skill is self-contained, carries its own reference material, and ships a
dependency-free script so it works on a fresh clone. Node 20 or later, nothing
installed. `whiteboard` is the one exception and says so: its `tool/` wants
`pnpm install` once, because the collaboration protocol it speaks is socket.io.

## Checking your own fork

Both tools run against this repo, and against each other. That is the intended
way to use them on your own:

```bash
node skills/quality/skill-cleaner/scripts/skill-cleaner.cjs audit skills
node skills/operations/skill-healer/scripts/skill-healer.cjs check skills
```

Both exit non-zero when something is wrong, so they drop into CI as-is.

## Where the rest of it is

The classrooms these skills came out of, the builds run in a real workspace one a
week, and the room where you can ask about your own setup:

**[go.upsys-consulting.com/skool][skool]** — free, and every request is read by hand.

MIT.
