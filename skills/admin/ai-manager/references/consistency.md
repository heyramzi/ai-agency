# The consistency pass

Read for `critique`, or whenever 2 files might be ruling on the same thing. It finds where the
shelf disagrees with itself, with its gates or with the disk. The rules every finding follows,
the report shape and the eval are in
[audit-contract.md](~/Studio/vibe-kit/ai-doc/references/audit-contract.md); this file holds the
shelf's own patterns and keep list.

Why it works: a pattern with a grep finds what reading misses. One pass on 8 Oct 2026 found 3
contradictions inside this skill that every earlier read had passed (rows 1 to 3 below).

## Inventory

Audit the source, never a projection: `ai-doc/skills/`, `ai-doc/agents/`, `ai-doc/references/`,
`ai-doc/rules/`, `agents-core.md`, every Studio `AGENTS.md`, `CLAUDE.md` and
`CODING_STANDARDS.md`, and the gates that hold them (`scripts/check-*.mjs`,
`scripts/validate-architecture.mjs`, `ai-doc/scripts/check-*.py`). A consumer's
`.claude/skills/` is a copy: `readlink -f` it back to its source.

## The catalog

| Pattern | Signal | Wrong when | Fix |
| --- | --- | --- | --- |
| Prose against its gate | `numbers`, then the gate's constant | A number in prose differs from what the gate enforces: `contract.md` and `skill-floor.md` said a skill holds at most 10 `.md` files while `check-skill-length.mjs` sets `MAX_FILES = 25` | `rewrite` the prose to the gate. The gate runs; the sentence doesn't |
| Two rulings on one point | `rg -n "<the command or noun>" ai-doc ~/Studio/*/AGENTS.md` | Two files say opposite things: `contract.md` said `pnpm vibekit sync <dir>` drops the path, 4 other places said to use it, and `pnpm --silent vibekit verify <dir>` read the path fine | `rewrite` the side the repo contradicts, else the older side by `git blame`, else `flag` |
| Dead fact | `python3 scripts/dead_pointers.py` for asset names; file-manager's `tree_scan.py <dir> --only=refs --also=<sibling repo>` for paths | Prose names a script, path or asset that's gone: `cleaning.md` sent you to `check-lead-tables.py` (deleted 9 Sep 2026) for twelve `-lead` agents that no longer exist | `rewrite` to what replaced it, or `remove` the line |
| Trigger overlap | sort the names, read neighbours, compare descriptions | Two descriptions both half-match one prompt | `merge` or disambiguate: [critique.md](critique.md#merge-or-disambiguate) |
| Rule a regex could hold | a ban written as a list of literal strings | Prose bans a string no gate checks | `move` it into `packages/lint`, then `remove` the prose ([contract.md](contract.md#a-skill-is-the-third-best-fix)) |
| A copy of a fact with a home | identical opening paragraphs; one table header in 2 files; a list restating a directory or a `--help` | A copy restates a CLI, the disk or another skill's step | `remove` the copy and point at the home |
| Pressure with no reason | `caps` | Capitals stand in for a reason in a body | `rewrite` at normal volume with the because |
| History standing in for a rule | `history` | The sentence tells the change, not the current rule | `rewrite` as the current rule only ([skill-floor.md](skill-floor.md#refuse)) |
| Method where a goal belongs | `STEP [0-9]`, "it's usually best to" in a judgment skill | A script walks the model through a call it makes better alone | `rewrite` as the outcome plus a done-when |
| Written for an older model | `old-model` | A line patches a failure the current model doesn't have: "think step by step", "be thorough, don't stop early", an old model name, a numeric word cap | `remove` it and retest in a cleared session; if behaviour slips, re-add it in its shortest form |
| Recency trap | read Learned Patterns | A rule fixes one session's pothole that can't recur | `remove` it, or fold the general rule into the body |

The named signals, from `~/Studio/vibe-kit`:

```bash
rg -n "at most [0-9]+|[0-9]+ (lines|chars|characters|entries|files)" ai-doc   # numbers
rg -nw "MUST|NEVER|ALWAYS|CRITICAL|IMPORTANT" ai-doc --glob '*.md'            # caps
rg -n "no longer|used to|until then|was merged|now lives" ai-doc              # history
rg -ni "step by step|scratchpad|don't be lazy|be thorough|stop early|at most [0-9]+ words|claude-[23]|sonnet-4|opus-4" ai-doc   # old-model
```

**The question for every line**: could the model already know this? Keep what only this
workspace knows (the audience, a path, a trap, a ruling, the reason behind a rule). Cut what
restates a trained default. A line is a constraint to test or context to keep, and context is
never cruft.

**Cruft is relative to the model.** Audit against the model that reads the file: the session
default, or the `model:` an agent pins. When that default changes, run `critique` again, since
a line that held on the last model can be the bug on the next.

**Confidence for a copy** follows the contract: High when the copies disagree, Medium when one
restates the disk or a CLI (it will drift), Low when 2 copies agree and load in different
sessions.

## The keep list

1. **One dated, real example beside a rule.** That's the house's provenance rule. It's a
   finding only when the story replaces the rule instead of backing it.
2. **Urgency in a description.** Trigger text routes, and skills under-trigger. Flag shouting
   in bodies only.
3. **Exact commands on fragile steps**: deploys, deletes, auth, sync.
4. **A narrower scope overriding a wider one.** A nested `AGENTS.md`, a path-scoped rule or a
   skill's own branch that says it differs is an override, not a conflict.
5. **Product boundaries.** The free kit and the paid pack (`clickup-utils/scripts/skills.mjs`),
   vendored packs, the `agency-os` runtime registry. Edit the description and nothing else.
6. **An agent restating its skill's one-line rule.** An agent has no parent to hop to.
7. **Public and private twins.** `<!--internal-->` fences make them differ on purpose. A rule
   in only one twin is the finding, the fence isn't.
8. **Anything outside vibe-kit** (`~/.claude/`, another repo's own skills): `flag` it.

## Running it

1. Inventory, then every signal above over it. Paste the hits into a scratch file; read after.
2. Judge each hit against its row and the keep list. For two rulings, the repo decides first
   (run the read-only command, read the gate's constant), then `git blame`.
3. Report in the contract's shape, worst first, and run the contract's eval.
4. Apply the High and Medium findings: this skill executes its verdicts. Each edit goes through
   the repair loop in `SKILL.md`, so a contradiction gets its losing side deleted, not a third
   sentence added.
5. `review_skill.py`, `audit` and the sync, as for any edit.
