# ssc-content

Cambridge Diet Vietnam — Cowork plugin for ads, posts, YouTube, KB and strategy workflows.

## Install

`install` takes a **plugin name**, not a git URL — add the marketplace first,
then install the plugin from it:

```bash
# 1. Add the marketplace (once)
claude plugin marketplace add https://github.com/SunshineCare/ssc-content-plugin

# 2. Install the plugin
claude plugin install ssc-content@ssc-content-plugin
```

## Update

Refresh the marketplace from git, then update the plugin using its **qualified
`plugin@marketplace` id** (plain `ssc-content` reports "not found"):

```bash
claude plugin marketplace update ssc-content-plugin
claude plugin update ssc-content@ssc-content-plugin
```

Restart Claude Code / Cowork to apply the update.

## Local development (test an unpushed working tree)

Point the marketplace at this local directory instead of git, so Claude Code
reads the plugin from your working tree — no push/PR round-trip:

```bash
# Swap the marketplace source from git to this local repo (same marketplace
# name, so this replaces the git source — no duplicate).
claude plugin marketplace add /absolute/path/to/ssc-content-plugin
```

The dev loop after editing plugin files (`plugins/ssc-content/**`):

```bash
# The plugin is copied into a versioned cache on install, and `plugin update`
# is a NO-OP at the same version — so force a fresh copy of the working tree:
claude plugin uninstall ssc-content@ssc-content-plugin
claude plugin install  ssc-content@ssc-content-plugin
# then restart Claude Code / Cowork to load the new copy
```

(Alternatively, bump `version` in `plugins/ssc-content/.claude-plugin/plugin.json`,
then `marketplace update` + `plugin update` — but uninstall/reinstall is
simplest for rapid iteration.)

To return to the published version, re-add the git marketplace and reinstall:

```bash
claude plugin marketplace add https://github.com/SunshineCare/ssc-content-plugin
claude plugin uninstall ssc-content@ssc-content-plugin
claude plugin install  ssc-content@ssc-content-plugin
```

## MCP Connection

This plugin connects to the BrandOS MCP server at `https://ssc.sunshinecare.vn/bos/mcp`
via OAuth. On first use, Cowork will prompt you to authenticate via the SSC portal.

## Commands

| Command | Purpose |
|---------|---------|
| `/ssc.post-plan` | Posts channel planning |
| `/ssc.ads-plan` | Ads channel planning |
| `/ssc.ads-produce` | Ads production |
| `/ssc.kb` | Knowledge base management |
| `/ssc.strategy` | Quarterly strategy |
| `/ssc.post-writer` | Post writing (production loop) |
| `/ssc.youtube` | YouTube channel |
