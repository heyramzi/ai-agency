---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs,svelte,swift,py,go,rs,sh,css,sql}"
---
<!-- vibekit:rule -->
<!-- Generated. Edited in the source this repo is projected from, never here. -->

# Simplicity

Write the minimum that solves the problem asked, nothing speculative. If 200 lines could be 50, rewrite them.

- **No abstraction for a single use.** Inline a helper with one caller and a wrapper that only renames.
- **No option nobody passes**, and no config object for one setting.
- **No handling for a case the types rule out**: `if (!items) return` on `items: Item[]`, `?? []` on a value that's never undefined, a `try` around code that can't throw. Narrow `unknown` once, at the boundary.
- **No `as` or `!` without a comment saying why.** Fix the type first.
