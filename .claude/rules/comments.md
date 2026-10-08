---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs,svelte,swift,py,go,rs,sh,css,sql}"
---
<!-- vibekit:rule -->
<!-- Generated. Edited in the source this repo is projected from, never here. -->

# Comments

**In Swift, Python, shell, CSS and SQL a comment block caps at 30 words**, counted the way `@heyramzi/lint` already fails a push on it in TS, JS and Svelte: lines with no blank between them are one block.

Write one sentence naming the trap, then a path to the reference that holds the reasoning. Never a paragraph, never a numbered list of reasons, never a second "WHY" after the first.

**No gate keeps an allowlist.** Every linter is a hard limit, and a violation gets fixed, never recorded. Never add an allowlist, baseline, ignore marker or `--update` mode to get a push through.
