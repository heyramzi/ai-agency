# The template library

Everything unrelated to this video lives in the template. That means the camera, ground and light, the palette and depth rules, type placement and the bans. A concept fills the slots (`claim`, `payoff`, `words`). Same template plus
same slots gives the same prompt. Without it every run re-decided the camera and light, and a
shipped frame and a rejected one were written by the same instructions on the same day.

Stated 26 Aug 2026: *"we need some sort of thumbnail system or thumbnail template because otherwise
we will never get consistently great results and we need the skill to learn its template."*

Keep the library, schema and compiler in one file, locked by a test. A template lists its slots,
negatives and shipped frames; the compiler turns template plus slots into the renderer's prompt.

## The five

| id | variant | route | carries |
| --- | --- | --- | --- |
| `cinematic-world` | face | edit-pass, google | a position or a change of mind |
| `real-artifact-hold` | face | edit-pass, google | here is the thing, and I vouch for it |
| `artifact-fills-frame` | faceless | composite, no model | the thing itself is the argument |
| `object-in-daylight` | faceless | generate, google | one concrete thing stands for the idea |
| `held-object` | face | photo, no model | I made this, and here it is in my hand |

3 have shipped a frame. **A template with an empty `shipped` list is a proposal.** Never bet all
3 concepts of a set on proposals, and use 3 different templates where 3 fit.

**The route is the render-mode gate.** `photo` and `composite` call no model. `edit-pass` hands the
model a real plate to keep the face and rebuild the world. `generate` draws from nothing real and
never carries a person. 2 tests hold it: no `face` template may name `openai` (it resamples the
canvas and returns a lookalike where Gemini keeps the photograph), and **no template may name a
provider this workspace has no key for**, since it fails at render time with assets already built.
All 5 run on the Gemini lane:
no `OPENAI_API_KEY` here, the key pasted 26 Aug 2026 came back 401 `invalid_api_key` and was dropped.
`object-in-daylight` moved from OpenAI to google the same day at no cost.

**Slots can overrule the template, silently.** 26 Aug 2026, `object-in-daylight` bans a second
object, yet the slot "a notebook **beside a cold cup of coffee**" returned both, because a specific
instruction beats a general ban. **Read the template's `negatives` while filling slots, not after
the render.**

## Promoting a template

A template is promoted, never invented:

1. A frame ships and is kept.
2. Write down what produced it: route, camera, ground, light, depth, and which decisions were by hand.
3. If an existing template produced it, append to its `shipped` list: date, frame, and **the one
   thing this run taught that the template didn't say**. "Rendered fine" teaches nothing; "keep a
   zone clear in the edit pass and composite the real capture into it" is why the template exists.
4. If none did, add a sixth with `shipped` holding that frame.

**A rejected frame edits a template, it doesn't add one.** The fault goes in that template's
`negatives`, or in `STANDING_NEGATIVES` when any composition could make it. Both writes go to
`thumbnail-templates.ts` before the turn ends.

`thumbnail-concepts.ts` prints the whole library into the generator's prompt (each slot's `asks`
and `example`) and its schema **requires** `templateId` and `templateSlots` on a fresh set. Stored
sets keep both optional: sets before 26 Aug 2026 predate the library, and
`parseThumbnailConceptSet` treats a set that fails the schema as absent. **Change the library and
the generator's reading of it in the same session**; the drift is silent.
