#!/usr/bin/env bash
# Regenerates zips/<skill>.zip, one zip per skill folder.
#
# Claude Code installs skills from this repo as a plugin and never needs these.
# Claude Cowork and claude.ai take one zip per skill through Customize > Skills,
# so a non-technical member needs a file they can download and upload as-is.
#
# Run this after any change under skills/ and commit the result.

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

rm -rf zips
mkdir -p zips

for dir in skills/*/; do
  name="$(basename "$dir")"
  # node_modules and build output belong to the repo, not to the uploaded skill.
  (cd skills && zip -qr "../zips/$name.zip" "$name" \
    -x "$name/node_modules/*" "$name/dist/*" "$name/test/*" "*/.DS_Store")
  printf '%-32s %s\n' "$name.zip" "$(du -h "zips/$name.zip" | cut -f1)"
done
