# The 3-run control, the ask rule and the SERP

Length, asks and subject choice each have a measured rule for a long-form script.

## The 3-run control

Tom Youngs re-ran one title construction 3 times: same channel, same offer, same shape, one variable changed per run.
 It's the cleanest natural experiment in the corpus.

| | Nov 2024 | May 2025 | Nov 2025 |
| --- | --- | --- | --- |
| Views | 89,117 | 52,513 | 17,873 |
| Runtime | 19:19 | 29:54 | 28:27 |
| Words | 3,843 | 5,573 | 5,496 |
| Pace | 199 wpm | 186 wpm | 193 wpm |
| Promise in the title | $20,000 | $20,000 | $100,000 |
| First ask that leaves the video | 98% of runtime | 99% | 11% |
| Arithmetic on screen | none | one aside | 90 seconds |
| His own failure, told | in full | one line | one line |

Older videos had longer to accumulate. Once adjusted to equal age, the $20,000 runs sit around 34,000 to 40,000, so the smaller promise wins by about 2x and not 5x. Say the adjustment whenever this table is cited.

1. 19 minutes beat 29, and the danger is the other end. Write 3,600 to 4,200 words at 190 to 200 wpm, budgeted in beats. Past 4,500 words isn't more thorough, it's the losing run. Measured 26 Aug 2026 on 3,556 long-form videos across 13 channels, era-adjusted: 13 to 18 minutes runs 1.09x its own channel (8 of 12 channels), 18 to 25 runs 1.07x (9 of 13), 25 to 35 runs 1.04x (8 of 12), and under 13 punishes at 0.88x (3 of 12). So the band is right and the failure to fear is a thin script. The control says 29 minutes of the same material loses. It doesn't say 25 minutes of more material does. This governs guide and offer videos, which is every video the channel makes. A packaged course is different (Saraev's 4-hour course: 2,314,591 views on 502k subs, 23 Aug 2026), and what transfers from a course is register, never runtime.
2. One commercial ask, in the last 20 seconds.
3. Tell your own failure in full, in the viewer's words. Only the winner tells the origin story properly (the agency that nearly broke him, the margins and crying on Zoom), and the losers give it one line. It's the one thing about the writer allowed on camera, because the viewer is living it. Test: can they see themselves inside the sentence? A credential, a process or a good week can't pass.
 (`humanizer`, "On camera, every I is a you".)
   With no failure of his on the topic, the block is the viewer's week in second person, and nothing is invented. EC51 (24 Aug 2026), client follow-up: the first client the viewer landed and the 6 months of silence after the project shipped. Putting Tom's margins and Zoom call in the speaker's mouth is the invented material this skill bans. The second permitted "I" is 2 words and joins the viewer's mistake: "Everyone was building their second brain in Notion. Me included." Anything longer is the author again.
4. Never compute on screen. 90 seconds of arithmetic appears only in the losing run. Show the number and its artefact.
5. The promise number is one they can picture reaching next quarter. $100,000 addresses the arrived and $20,000 the aspirant, who outnumber them. Matt Gray found the same: "your 20s or 30s" beat "your 30s or 40s" by 11x.

## The ask rule, 3 categories

The generic literature says never save the only CTA for the end; the control says winners held every outbound ask to the last 2%. Both are right, because they count different asks.

- In-platform asks (subscribe, like, comment) are free and never break the teach. Make one around the one-minute mark after the first thing of value and one later, each paired with something on screen.
- Outbound asks (buy, book, go to a page) get exactly one, in the last 20 seconds. A second doesn't add a conversion, it turns the video into an ad in memory.
- A native embed isn't counted. It's a real thing named inside the teach because the argument arrived at it (the tool that solved the step, the artefact they need, the community the example came from). The test is whether the mention breaks the frame. 12 minutes in, a cut to another scene, shirt or tone wakes them; a sentence continuing the argument doesn't. Embeds may come early and repeat; the outbound ask may not.

A sponsor read that can't be made native goes after the channel's average view duration (Kallaway corpus, not control-tested). [storytelling](~/Studio/vibe-kit/ai-doc/references/storytelling.md) records the collision and why one-ask survives.

The niche already agrees (26 Aug 2026: 627 transcripts across 13 channels). 77% carry one outbound ask or none, half carry none, and the median last outbound ask lands at 92% of runtime. That corrects an older claim that 19 of 20 competitors stack asks; the real figure is 23%. Subscribe asks are an outro at a median 98%, only 7% inside the first fifth, so the one-minute subscribe is borrowed from general retention writing. Saraev's course has no subscribe or like ask, and its one pitch at 04:10:11 is "that's my last and only pitch". Winners carry slightly more outbound asks than their own controls and "fewer asks" holds on 1 of 13 channels. That's the instrument unable to see what the rule protects (what the viewer remembers), not evidence against it.

## Reading the SERP before the subject is chosen

`choosing-ideas.md` picks the subject; the SERP decides if it's worth a recording day. `yt-dlp` gives no volume and the app's `POST /api/youtube/keyword-research` is quarantined: it answered 4 different seeds with an identical volume of 140 and 7 templated ideas, and a title was chosen off it on 26 Aug 2026. A row repeating across unrelated seeds is a fallback. Decide on the SERP and say in one line that volume wasn't measured.

```bash
yt-dlp --flat-playlist --skip-download "ytsearch20:<phrase>" --print "%(id)s" > ids.txt
yt-dlp --skip-download --no-warnings -a ids.txt \
  --print "%(view_count)s|%(duration)s|%(upload_date)s|%(channel)s|%(title)s"
```

`--flat-playlist` returns `NA` for counts, hence 2 passes. Read all 4 columns: who holds the lane, how old, how the last 12 months did against them.

- Unserved query: a first page of 2-to-5-minute clips under 150 views each.
- Stale head, the commoner case: 2 or 3 videos well clear of the rest, all a year or more old, every entrant since under a thousand. Measured 9 Sep 2026 on `airtable to google sheets`: 28,804 views on a 2:37 clip from Oct 2025 and 27,757 on a 12:06 tutorial from Dec 2022, then a tail of 927, 768, 740 down to 26.
- Don't take the runtime off the SERP. The thin clips crowding a commercial phrase are the ones losing. Use the band above, satisfy the intent inside 2 minutes, then earn the rest.
- A product demo reads 2 SERPs. The product's Search Console rows (`seo` skill) say whether a ranking video is worth a day; name the page that owns the phrase before writing a title that fights it.
- Worked example, EC52, 28 Aug 2026: `clickup pricing` looked middling on volume, and the SERP returned 11, 7, 27, 118 and 16 views on the top five. The SERP read made it a video.

Done when the runtime sits in the band, the one outbound ask is in the last 20 seconds, and the subject has a SERP reading with its date.
