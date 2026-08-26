# Analogies

An analogy is the cheapest explanation available and the easiest to draw badly. This file is mostly
about choosing one, because the drawing is twenty lines and the choice is the whole job.

## Draw the mapping, not the picture

The reference for this register is the API-as-a-restaurant frame: a customer, a waiter and a
kitchen, drawn as stock illustrations on black. It works, and it is not what we build.

The craft reason is that the look belongs to an illustrator. Remotion cannot make it, and attempting
it with shapes produces the flat-vector house style every SaaS landing page has, which is the exact
generic register this project spends its whole budget avoiding.

The stronger reason holds even with an illustrator on the payroll. **An analogy is not a picture of
the familiar thing. It is a claim that two structures are the same shape.** The restaurant drawing
shows a waiter. What it does not show is the mapping - that the waiter *is* the API, that the
kitchen *is* the server - and so the mapping stays in the voiceover, where it already was. The
drawing decorated a sentence the read had finished saying, which is the decoration failure the value
test in SKILL.md exists to catch.

So: familiar on the left, real on the right, one line per pair, pairs landing as the speaker names them. The
viewer watches "recipe" become "template" rather than hearing it. `AnalogyBridge` in
`src/analogy.tsx` is the shape.

Two details in it are load-bearing:

- **The line arrives before the word it buys.** Familiar box, then the line, then the real word. All
  three at once is three facts and no argument.
- **The accent is an edge, not a fill.** A diagram has one focal box among five, so terra fills it.
  An analogy accents a whole column, and three solid terra slabs stop reading as "this one" and
  start reading as a colour scheme. The first render proved it.

## The four tests

An analogy that fails any of these costs more attention than it saves.

1. **The familiar side has to be genuinely familiar.** Not "familiar to someone technical". Kitchens,
   keys, rent, hiring, traffic. If half the audience has to be told what the left column is, the
   analogy has added a second thing to explain.
2. **The structures have to match on at least three points.** Two is a simile and it collapses the
   moment anyone pushes on it. Three pairs that all hold is what makes it feel like a discovery
   rather than a turn of phrase.
3. **It has to break somewhere, and you have to know where.** Every analogy is wrong eventually.
   Knowing the point it breaks is what stops the video making a claim it cannot support two minutes
   later. Write it in the clip's header comment, next to the line it serves.
4. **It cannot already be the read's own words.** If the speaker says "it is like a recipe", drawing a recipe
   is decoration. The graphic's job is the mapping the speaker did not say, or the fourth pair the speaker skipped.

## Reuse the one the speaker already has

A video that invents a fresh analogy per section teaches nothing, because each one costs the viewer
a fresh setup and none of them compound.

Find the one domain the speaker already reaches for, in their own words, and extend it. One worked
example: a presenter who cooks already has recipes, the pass, the rack and the same burger, and that
single domain carries a whole delivery argument across a series. Before opening a new domain, check
which clips already exist in it; a fourth clip that contradicts the geometry of the first three is
worse than no clip.

Where the kitchen breaks, for the record: a restaurant's recipes are fixed and its customers order
off a menu, while an agency's client asks for something that is not on it. It carries delivery and
says nothing useful about sales. Stop it at the pass.

## When not to use one at all

An analogy buys understanding of a *structure*. It buys nothing for a quantity, a consequence, or a
recognition, and those are three of the four things a graphic can add. If the beat is "twenty
percent drives eighty", draw the twenty percent. Reaching for a metaphor there adds a domain the
viewer then has to translate back out of.
