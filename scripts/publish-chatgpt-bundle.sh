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
#
# ---------------------------------------------------------------------------
# KB CITATION GATE — no bypass, and deliberately SCOPED. Do not "fix" it wider.
# ---------------------------------------------------------------------------
# Before anything is built or copied, this script runs
# `content/mcp-server/scripts/lint-kb-citations.ts --scope=plugin-skills` and
# refuses to publish if the bundle's SOURCE prose cites a knowledge-base path or
# anchor that does not resolve against the LIVE KB. The ChatGPT surface has no
# failed-read stop rule at all, so a stale citation shipped there is read
# silently and forever.
#
# There is NO bypass. No flag, env var or argument here skips the gate, and
# `--report` (the linter's exit-zero mode) is NOT reachable from this script:
# the linter refuses `--scope=plugin-skills --report` as a usage error, so a
# scoped run cannot be downgraded to report-only even by editing the call.
#
# WHY THE GATE IS SCOPED to the plugin skills and not the whole linter run —
# two reasons, both of which killed an earlier whole-run version of this gate:
#
#   1. A whole-run gate blocks publishing FOREVER. The live KB currently carries
#      18 unresolved citations inside its own DOCUMENT BODIES that this repo
#      does not own and cannot repair. Gating on them means the bundle can never
#      be republished, which is strictly worse than the stale citations the gate
#      exists to prevent.
#   2. Gating on the MIRROR is incoherent. The generated
#      `content/mcp-server/lib/brandos/workflows/workflows.json` holds ~36
#      unresolved citations that THIS REPUBLISH IS WHAT FIXES — it would lint
#      the artifact it is about to overwrite and fail on its own input.
#
# `plugins/ssc` is the sole input to the built bundle, so its prose is exactly
# and only what this publish can be held responsible for. Widening the scope
# does not make the gate stricter; it makes it unsatisfiable.
#
# The linter resolves against `DATABASE_URL_BRANDOS`. Supply it (and `PLUGIN_REPO`
# is set for you) the same way every other authoritative run does — note that
# `content/.env` and `content/mcp-server/.env.local` point at a STALE LOCAL
# `brand_os`, so a run without an explicit cluster URL reports false positives.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
content="${CONTENT_REPO:-$(cd "$repo/.." && pwd)/content}"
dest="$content/mcp-server/lib/brandos/workflows/workflows.json"
src="$repo/chatgpt/workflows.json"

if [[ ! -d "$content/mcp-server" ]]; then
  echo "publish-chatgpt-bundle: content repo not found at $content (set CONTENT_REPO)" >&2
  exit 2
fi

# Runs BEFORE the build and BEFORE the copy, so a failure means the mirror is
# never written. See the header for why this is --scope=plugin-skills.
gate_kb_citations() {
  if ! (cd "$content/mcp-server" && PLUGIN_REPO="$repo" npx tsx scripts/lint-kb-citations.ts --scope=plugin-skills); then
    echo "publish-chatgpt-bundle: KB citation gate FAILED — nothing built, mirror NOT written." >&2
    echo "publish-chatgpt-bundle: repair the citations above in $repo/plugins/ssc. There is no bypass." >&2
    exit 1
  fi
}

if [[ "${1:-}" == "--check" ]]; then
  gate_kb_citations
  node "$repo/scripts/build-chatgpt-bundle.mjs" --check
  if ! diff -q "$src" "$dest" >/dev/null 2>&1; then
    echo "STALE: $dest differs from $src. Run: scripts/publish-chatgpt-bundle.sh" >&2
    exit 1
  fi
  echo "OK: mirror is current — $dest"
  exit 0
fi

gate_kb_citations
node "$repo/scripts/build-chatgpt-bundle.mjs"
mkdir -p "$(dirname "$dest")"
cp "$src" "$dest"
echo "published $(du -h "$dest" | cut -f1) → $dest"
