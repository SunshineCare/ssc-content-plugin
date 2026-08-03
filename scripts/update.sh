#!/usr/bin/env bash
# update.sh — refresh an installed `ssc` plugin from git.
#
# Both commands need the qualified `plugin@marketplace` id; a bare plugin name
# reports "not found". Restart Claude Code afterwards to load the new copy.
#
# NOTE: `plugin update` is a no-op when the version is unchanged ("already at
# the latest version"), so this does NOT pick up a same-version content edit.
# For local development against an unpushed working tree, uninstall + reinstall
# instead — see "Local development" in CLAUDE.md.
set -euo pipefail

claude plugin marketplace update ssc-content-plugin
claude plugin update ssc@ssc-content-plugin
