# Writing a new skill

Read this when creating a skill from scratch. It covers turning a run into reusable parts and the
two scripts. The quality bar for the file itself is `skill-floor.md`; the description is
`triggering.md`.

## Contents

- Step 1: Recover the run
- Step 2: Turn the run into reusable parts
- Step 3: Initialise
- Step 4: Write the parts, then the body
- Step 5: Package

## Step 1: Recover the run

The skill is being written because something was done twice. Recover that run before asking any
questions: the conversation usually holds the tools used, the order, the corrections the user
made, and the input and output shapes that actually occurred. Extract from there first and put the
gaps to the user, rather than interviewing from zero.

What is still missing, asked a couple of questions at a time:

1. What should this let a session do that it currently does badly or slowly?
2. What would a user type when they need it? Ask for the casual phrasing, not the formal one.
3. What does the finished output look like, exactly?
4. What went wrong the first time it was done by hand?

Question 4 is the one that produces the useful content. The correction, the trap and the wasted
hour are what the base model does not know; the happy path it can usually infer.

Stop when the shape is clear enough to name the kind (Procedure, Judgment, Interface, Context).

## Step 2: Turn the run into reusable parts

Walk each concrete example and ask what would have to be rewritten from scratch next time.

- Code rewritten every run is a **script**. Rotating a PDF, rebuilding an index, validating a
  payload. Deterministic, token-free at read time, and a script an agent can drive takes flags and
  prints its own `--help` rather than prompting on stdin.
- A schema, a table of IDs, a long format spec, a vendor's real error codes: a **reference**.
  Loaded only when the condition in its pointer is met.
- Boilerplate that ends up inside the output, a template, a font, a starter directory: an
  **asset**. Never loaded into context.

If nothing comes out of this step, the skill is a body and a description, which is a normal and
good outcome. Directories created empty are dead weight.

## Step 3: Initialise

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

It writes the directory, a `SKILL.md` template with placeholders, and example files under
`scripts/`, `references/` and `assets/`. Delete every example file that the skill does not need.

## Step 4: Write the parts, then the body

Write the scripts, references and assets first. They decide what the body has to say, and a body
written first ends up describing work the reference already carries.

The body is written for another session, not for a person reading documentation. Imperative,
verb first. Give the reason behind a rule in the same sentence as the rule. Then load
`skill-floor.md` and read the file back against it.

## Step 5: Package

Only for a skill leaving this workspace.

```bash
scripts/package_skill.py <path/to/skill-folder> [./dist]
```

It validates frontmatter, naming, structure and file organisation, and writes a zip named after
the skill. Validation failure stops the package.

## The four kinds, and how each fails

The kind names what the reader of the finished file is doing when they open it. It decides what
the body should contain, and each kind fails differently.

- **Procedure.** A workflow with steps that must happen in order and that can go wrong halfway:
  shipping a release, taking a board task through review, running a migration. The deliverable is
  the sequence, the gates between steps, and the recovery when one fails. Its failure mode is a
  step that quietly does the wrong thing.
- **Judgment.** A craft the model can already attempt and does badly by default: voice, layout,
  copy, hooks, thumbnails. The deliverable is a quality floor and a list of refusals, not steps.
  Its failure mode is a checklist that describes good work without producing any.
- **Interface.** A tool, API or CLI whose behavior cannot be guessed: an auth split, a base URL
  that silently rejects, a boolean that means the opposite of its name. The deliverable is exact
  invocations and the traps. Its failure mode is a copy of the vendor's documentation.
- **Context.** Facts about this workspace that no model can hold: object IDs, entity names, the
  decisions behind a product. The deliverable is the values and where they live. Its failure mode
  is going stale without anyone noticing.

Pick the kind from what the reader needs, not from the topic. A skill that names a CLI can still
be Judgment if the hard part is deciding what to run.

The short form is in `SKILL.md`.
