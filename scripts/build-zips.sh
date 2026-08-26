#!/usr/bin/env bash
# Regenerates zips/<skill>.zip, one zip per skill folder, and rewrites the
# `skills` array in .claude-plugin/plugin.json.
#
# Skills live one folder per area, `skills/<area>/<skill>/`, and a nested folder
# is not discovered on its own: the plugin manifest has to name every one. A
# hand-kept list of forty is a list that goes stale in silence, which is the exact
# failure this repo exists to make visible, so it is generated here instead.
#
# The zips are for Claude Cowork and claude.ai, which take one skill at a time
# through Customize > Skills. Claude Code installs the plugin and never needs them.
# The zip is flat inside, `<skill>/SKILL.md`, because the area is a fact about this
# repo and not about the skill.
#
# Run this after any change under skills/ and commit the result.

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

rm -rf zips
mkdir -p zips

paths=()
for dir in skills/*/*/; do
  [[ -f "$dir/SKILL.md" ]] || continue
  name="$(basename "$dir")"
  area="$(basename "$(dirname "$dir")")"
  paths+=("./skills/$area/$name")
  # node_modules and build output belong to the repo, not to the uploaded skill.
  (cd "skills/$area" && zip -qr "../../zips/$name.zip" "$name" \
    -x "$name/*/node_modules/*" "$name/node_modules/*" "$name/*/out/*" \
    "$name/dist/*" "$name/test/*" "*/.DS_Store")
  printf '%-32s %-12s %s\n' "$name.zip" "$area" "$(du -h "zips/$name.zip" | cut -f1)"
done

python3 - "${paths[@]}" <<'PY'
import json, sys
path = ".claude-plugin/plugin.json"
m = json.load(open(path))
m["skills"] = sys.argv[1:]
json.dump(m, open(path, "w"), indent=2, ensure_ascii=False)
open(path, "a").write("\n")
print(f"\n{len(sys.argv) - 1} skills declared in {path}")
PY
