#!/usr/bin/env bash
# publish-chatgpt-bundle.sh — mirror the ChatGPT workflow bundle into the
# BrandOS MCP server repo.
#
# The bundle is generated HERE (this repo owns the prose) and CONSUMED THERE
# (the server is the only thing ChatGPT can talk to). `content/` is an
# independent git repo, so the artifact has to be vendored rather than
# imported — the same mirror arrangement the parent workspace uses for
# `docs/contracts/`.
#
#   scripts/publish-chatgpt-bundle.sh           # rebuild + copy
#   scripts/publish-chatgpt-bundle.sh --check   # exit 1 if the mirror is stale
#
# Edit the SKILLS, never the mirror. Commit the mirror in `content/` itself.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
content="${CONTENT_REPO:-$(cd "$repo/.." && pwd)/content}"
dest="$content/mcp-server/lib/brandos/workflows/workflows.json"
src="$repo/chatgpt/workflows.json"

if [[ ! -d "$content/mcp-server" ]]; then
  echo "publish-chatgpt-bundle: content repo not found at $content (set CONTENT_REPO)" >&2
  exit 2
fi

if [[ "${1:-}" == "--check" ]]; then
  node "$repo/scripts/build-chatgpt-bundle.mjs" --check
  if ! diff -q "$src" "$dest" >/dev/null 2>&1; then
    echo "STALE: $dest differs from $src. Run: scripts/publish-chatgpt-bundle.sh" >&2
    exit 1
  fi
  echo "OK: mirror is current — $dest"
  exit 0
fi

node "$repo/scripts/build-chatgpt-bundle.mjs"
mkdir -p "$(dirname "$dest")"
cp "$src" "$dest"
echo "published $(du -h "$dest" | cut -f1) → $dest"
