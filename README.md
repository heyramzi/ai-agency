# vibe-systems

Tools for keeping an agent setup honest.

Agent configuration rots in a specific way: it never fails loudly. A broken skill
is not reported, it is simply never offered. A duplicated name does not conflict,
one side just stops existing. Everything here exists to make that class of
silent failure visible, and to repair the parts of it that have exactly one
correct answer.

| Tool | What it does |
| --- | --- |
| [**skill-cleaner**](skill-cleaner) | Audits, consolidates and cleans up Agent Skills across every place they hide. Finds the ones a plain `find` cannot see, the names registered twice, and the skills that only exist on one laptop. |

More to come. Each tool is self-contained in its own directory with its own
README and its own tests.

MIT.
