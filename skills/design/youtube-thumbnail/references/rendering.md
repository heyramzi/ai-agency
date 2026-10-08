# Rendering and compositing

Step 7. The build order is the input; nothing here re-decides the concept. Assets, real-pixel composites and type: [`composites.md`](composites.md), read when the frame carries a logo, a card, a screenshot or overlay type.

## Don't draw his face

**A face variant is composited, not generated.** `--photo` conforms the face plate to 1280x720,
sets the words in Manrope 800 and passes them behind the real subject. No model runs, so the
likeness is perfect because it isn't one.

```bash
# composite the plate rather than calling a model at all
```

`cutSubject` lifts the subject off the RENDERED plate, so a generated frame holds zero photographed
pixels of him.
The verdict, 26 Aug 2026, on a frame built from `deadpan-wide-left-02`: "it doesn't look like me at
all. It looks AI generated way too much." No model choice fixes it.
Generate only what can't be photographed (an object, a figure, a room we don't have). When the
background must be a **real artifact** (screenshot, board, dashboard), composite his cut-out face
onto it.

## Which model

**Model, tier, price and ban live in** `vibe-kit/ai-doc/references/image-generation.md`. Ask
`@heyramzi/ai` for a tier, never type an id. `large` (Nano Banana Pro) is banned, so `--model=pro`
throws. `render-thumbnail.ts` draws on `medium` and takes `--model=<id>` for a test only.

**OpenAI re-rendered the person; Gemini keeps the photograph.** Tested twice. Editing a finished
frame, `gpt-image-2` returned a lookalike (narrower jaw, different beard) and `gpt-image-1` cropped
the type off. Building from the source plate it was far better but still idealised the face (beard
filled in, brow heavied). Gemini returns the photographed face unchanged in both cases.
**That ban is this skill's, it's about the face, and it holds:** a thumbnail carrying him goes to
`gemini-3.1-flash-image`, always. Objects and illustration with nobody in frame may go to
`gpt-image-2` where a call site names it. Seeds don't work: `generationConfig.seed` is accepted
and ignored (same seed twice, hashes differ, 19 Aug 2026), so the substitute is the edit pass. No
Gemini image model returns alpha: key the backdrop off with `logo3d/key.ts`.

## "This one, but ___": the edit pass

Don't re-render the brief (no seed means a different face, card and crop). **Hand the finished PNG
back as the first attached image and edit it.** The same pass builds a cinematic frame from a flat
plate: hand a flatly-lit `--photo` plate, tell it to keep face, hair, beard, expression, hand and
pose pixel for pixel, and transform the rest (a near-black defocused studio, warm rim, glowing
panels). Verified 26 Aug 2026 on the "hiring won't fix it" base: 4 samples, face held in all
4. Call `generateImage(router, { references: [{bytes, mediaType}], tier: "large" })`, then set the
type. Say "keep his facial detail, do not plasticise the skin."

```
Edit the FIRST attached image. It is a finished YouTube thumbnail and it is already correct.
Make exactly ONE change: <the change, with its geometry and its light>
Everything else is unchanged and reproduced pixel for pixel: his face, hair, beard, expression,
skin, clothing and hand; <every other element, with position and content>; the framing and crop.
Do not redraw the face. Do not restyle. Do not re-typeset the text. Do not change the crop.
```

Naming what must not change is the whole job: a model asked only to enlarge a logo will
re-typeset the overlay and re-crop. List the survivors, take 3 samples. The edit pass is the
one case still on Pro; nobody has re-run it on Nano Banana 2 since 25 Aug.

A concept with a `templateId` renders from [`templates.md`](templates.md) and ignores its prose fields
(`buildPrompt` hands off to `compileTemplatePrompt`). The template names the provider, so
`--provider=` is for a deliberate comparison only.

## The client and the key order

Put every image caller behind **one module**; don't build a provider by hand or add a key.
It walks 3 lanes in order and only changes lane when the lane failed: a quota answer (429, or a
403 naming `RESOURCE_EXHAUSTED`) or a rejected key (401, or a 400 naming the key). A malformed
request is returned as is, since retrying it just spends the next key.

1. `GOOGLE_GENERATIVE_AI_API_KEY`: direct to Google AI Studio, the priority lane.
2. `GOOGLE_GENERATIVE_AI_API_KEY_BACKUP`: a second direct key. Leave unset rather than set a dead one.
3. `CF_AIG_*`: the Cloudflare AI Gateway, holding its own Google key.

State, 26 Aug 2026: the direct key isn't in `app/.env.local`, so every image call lands on lane
3, the lane every verified render was drawn on. OpenAI has no gateway lane: a direct `fetch` on
`OPENAI_API_KEY`, billed by returned tokens at $30 per 1M image output (platform.openai.com/docs/pricing,
26 Aug 2026). That comes to about $0.008 low, $0.032 medium and $0.125 high at 1536x1024. No frame carrying him goes there.
Lock the lane order with a test and keep it identical in any second caller.

## Filing the result

**A rendered thumbnail is filed on its concept**, never a loose file or standalone HTML sheet:
`/youtube/concepts` is the wall frames are judged on.
File the frame against the video's concept record with the build orders merged into its metadata; a
stored set that fails the schema disappears silently, so read it back before you say it's done.

## Fixing a wrong render

| Symptom | Fix |
| --- | --- |
| Text misspelled | Shorten the string; 4 words is the reliable ceiling |
| Face distorted | You asked it to change an expression; go back to a composite |
| 5 things in frame | The prompt described a scene; name one subject and one accent |
| Washed out at 320px | 2 working colours, type on a solid plate instead of an outline |
| Looks like the reference | Change subject, type and palette; keep only structure |
| Quota error on every lane | All 3 lanes rate limited; wait, or add a second direct key |
