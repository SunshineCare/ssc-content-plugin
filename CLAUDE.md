# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reporting Style

Extreme concision. Sacrifice grammar for brevity — drop articles, pronouns, filler verbs. Telegraphic fragments over full sentences. No preamble, no recap, no "I've now…". Report facts + file refs only. Applies to all summaries/status/answers back to the user (not to code, comments, spec docs, or Vietnamese operator-facing skill output).

## Codebase Access — use codebase-memory-mcp FIRST

**The codebase knowledge graph is the primary tool for any code exploration or navigation in this repo — reach for it before Grep/Glob/Read.** Reinforced by global codebase-memory-mcp hooks (SessionStart + SubagentStart reminders, and a PreToolUse discovery gate that augments search calls). (This repo is mostly prose skills/agents/commands — most work routes to Grep/Read; the graph still helps for the executable hook + any code.)

1. **Structural code queries → codebase-memory-mcp tools first** (or the `/codebase-memory` skill):
   - `search_graph(name_pattern|label|qn_pattern)` — find functions / classes / routes
   - `trace_path(function_name, mode=calls|data_flow|cross_service)` — call chains, impact analysis
   - `get_code_snippet(qualified_name)` — exact symbol source (precise line ranges)
   - `query_graph(query)` — complex Cypher patterns
   - `get_architecture(aspects)` — project structure
   - `search_code(pattern)` — graph-augmented text search
2. **Grep / Glob / Read** — for text, configs, docs, and non-code files; always Read a file before editing it.
3. **Project not indexed yet?** Run `index_repository` FIRST (use `index_status` / `detect_changes` to keep it fresh).

## What this repo is

This is the **`ssc-content` Cowork plugin** — a Claude Code marketplace plugin
for Cambridge Diet Vietnam (Sunshine Care) content operators. It defines the
ads, posts, YouTube, knowledge-base, and strategy workflows as **prose**
(markdown skills / agents / commands) plus one executable governance hook, and
connects to the remote **BrandOS MCP server** for all data reads and writes.

There is almost no compiled code here: the only executable artifact is the
Node.js PreToolUse hook. Everything else is markdown that instructs a running
Claude/Cowork session.

**Git workflow: no worktrees.** Work directly on `main` — do not create git worktrees for isolation. Commit selectively (stage specific files/hunks, not `git add -A`).

## Layout

```
.claude-plugin/marketplace.json   # marketplace manifest → points at plugins/ssc
plugins/ssc/
  .claude-plugin/plugin.json      # plugin manifest (version, MCP server config) — the ONLY MCP config
  commands/  (10 × ssc.*.md)      # thin slash-command entry points
  agents/    (8 × ssc-*-agent.md) # pipeline orchestrators
  skills/    (41 × <name>/SKILL.md)# the actual work units
  hooks/approval-gate.mjs         # PreToolUse governance hook (the only real code)
  hooks/hooks.json                # wires the hook to mcp__ssc__(approve|unapprove)_*
docs/superpowers/specs/           # design specs for in-flight work
```

Only `plugins/ssc/` ships when installed — the marketplace `source` is
`./plugins/ssc`. Repo-root files (README, docs, any future test
scaffolding) never install.

## Architecture: the three-layer dispatch model

The single most important thing to understand — it requires reading a command,
its agent, and a skill together:

1. **Commands** (`/ssc.*`) are **thin entry points that hold no orchestration
   logic.** They parse operator input and dispatch a single agent. Exception:
   `/ssc.ads-produce` and `/ssc.ads-brief` dispatch their production skills
   (`ssc-ads-writer`, `ssc-ads-brief`) directly rather than through an agent.
2. **Agents** (`ssc-*-agent`) are **orchestrators.** Frontmatter declares
   `orchestrates: [skills…]`, the read-only `tools:` they use to resolve state,
   a `capability` (`view`/`edit`), and `approval-gates: human`. Agents are
   **state-driven**: each invocation runs the next open step of the pipeline and
   stops at the next human gate. They never do the content work themselves.
3. **Skills** (`skills/<name>/SKILL.md`) are the **work units** — one pipeline
   step each. Frontmatter carries `metadata.section` (strategy/post/ads/youtube/kb),
   `stage`, `capability`, and the `tools:` (BrandOS MCP tools) it calls.

### Pipelines (which skills each agent orchestrates)

| Pipeline | Command | Agent | Stages (skills) |
|---|---|---|---|
| Posts (plan) | `/ssc.post-plan` | `ssc-post-agent` | Focus → Research → Ideate → Schedule → Measure |
| Posts (produce) | `/ssc.post-writer` | `ssc-post-writer-agent` | produce ⇄ authority loop |
| Ads (plan) | `/ssc.ads-plan` | `ssc-ads-agent` | Focus → Approaches → Blueprint → Ideate → Measure |
| Ads (brief) | `/ssc.ads-brief` | *(direct → ads-brief)* | Brief-first FIRST step — produces 4-5 rated DRAFT angle briefs via `save_brief` from concept + persona + build_spec (no copy needed; produce-once; operator approves ONE angle) |
| Ads (produce) | `/ssc.ads-produce <briefId> [section]` | *(direct → ads-writer)* | Anchored to the chosen approved angle brief — `briefId` is the sole input (the writer resolves the concept from it via `get_brief`). Text-only per-section stepper (copy first from the brief; then headline/description/image_content freed, each gated only on copy); saves via `save_content` (content is brief-keyed — `brief_id` required for ads, no `idea_id`) |
| Image (prompt) | `/ssc.image-prompt <briefId> [step]` | `ssc-image-prompt-agent` | Scene → Subject → Composition → Edit → Text (all optional) — the **only** image path, and it is **zero-credit**: it authors each step's prompt + `generation_config` and saves via `save_creative_prompt`, then stops. **Cowork never generates** — the operator clicks Generate and selects a candidate in the ImageStudio dashboard, which is what spends fal credits. Anchored to ONE approved `briefId`; the owning idea **and the channel** resolve from the brief (`ad` and `post` both run; any other channel stops). Prompts are grounded in the brief + that channel's approved contents + persona doc + brand KB and reach the engine verbatim. Product is upload-only. |
| YouTube | `/ssc.youtube` | `ssc-youtube-agent` | briefing → ideate → schedule (+ seo) |
| Knowledge base | `/ssc.kb` | `ssc-kb-agent` | review → audit → research → revise / gap-fill |
| Strategy (quarterly) | `/ssc.strategy` | `ssc-strategy-agent` | directions → 8-dimension intelligence → eval/develop/audit |

## Propose-only governance — the core invariant

**Every skill and agent is propose-only: it drafts and self-scores work; a human
approves it.** Approving/unapproving flips a real governance gate with downstream
consequences (spend, publishing), so it is an **operator action**, never
something a pipeline step does. This is held by three layers (authoritative
first):

1. **Server-side `approve` capability** in the BrandOS MCP server (not in this
   repo) — the real gate.
2. **`hooks/approval-gate.mjs`** (PreToolUse, wired in `hooks.json`) — a harness
   backstop that keys off the subagent-identity fields Claude Code adds to hook
   input: `approve_*`/`unapprove_*` from a **subagent → deny**; from the **main
   operator conversation → ask** (confirm). See `hooks/README.md`.
3. **Prose** in every skill/agent stating the propose-only hard rule.

When editing skills/agents, preserve this invariant: **never** add
`approve_*`, `unapprove_*`, `update_status`, or any publish/schedule tool to a
skill or agent. Consequential, hard-to-reverse actions (publishing, `update_budget`
= real Facebook ad spend) are dashboard-only and never agent-callable.

## Conventions that are easy to get wrong

- **Persisted prose is Vietnamese.** All content written to BrandOS (copy,
  rating comments, KB revisions) is Vietnamese. Operator-facing chat / system
  text (including hook reasons) may be the operator's language.
- **The MCP config lives in `plugin.json` ONLY — never add a `.mcp.json`.**
  The BrandOS server (`https://ssc.sunshinecare.vn/bos/mcp`, OAuth
  `clientId: ssc-content-plugin` + `scopes: bos:access`) is declared once, in
  `plugin.json`'s `mcpServers`. The `clientId` is **required** — it must match the
  client the BrandOS auth server (`content.sunshinecare.vn`) has registered;
  omitting it makes Claude Code fall back to a generic
  `claude.ai/oauth/claude-code-client-metadata` client_id, which the server
  rejects with `invalid_request`.

  > **Why the duplicate was removed (2026-07-19).** This repo used to carry the
  > same MCP block in **both** `plugin.json` and `.mcp.json`, "kept in sync".
  > That duplication is exactly what made **Cowork** fail every marketplace sync
  > with `REMOTE_SYNC_FAILED` ("Marketplace sync failed. Check the repository URL")
  > — Cowork rejects a plugin that declares the same MCP server twice, while
  > Claude Code silently tolerated it. Proven by bisect: a test plugin with
  > **either** file alone syncs fine; with **both** it always fails, `oauth`
  > present or not. **Do not reintroduce `.mcp.json`.**
- **Every MCP tool a skill references must exist on the BrandOS surface.** Tool
  names look like `save_content`, `get_idea`, `save_channel_plan` (verbs:
  save/get/list/approve/unapprove/update/delete/edit/check/propose/upload).
  Referencing a renamed/removed server tool is a recurring shipped-bug class
  (commit `8d4ded8`).
- **`/ssc.*` cross-references must resolve to a real command.** `ssc.plan` and
  `ssc.ads` are **retired/renamed** and appear only in "no … dependency"
  negations — do not treat them as live commands or add new refs to them
  (dangling-ref hot-fixes: commits `14a60be`, `32014c1`).
- **Never hard-code KB content into a skill — reference the doc and read it
  live.** Skills must name the KB doc (and its section) they draw on, not
  restate its contents. This covers persona docs (trigger points, vocabulary,
  the per-persona `Tránh` prohibitions, search keywords), `ad/awareness-framework`
  (the awareness/sophistication ladders, Cambridge's stated position, the
  emotion cluster), `brand/angles`, `ad/cta-catalog` — all of it. Two reasons:
  the KB is revised on its own cadence (persona docs and the framework are
  reviewed quarterly), so a baked-in copy goes stale silently *and* overrides
  the live doc it was meant to reflect; and rosters are open — a persona added
  or retired must need **no** change to any skill. Concretely: no persona names
  in closed enums (`persona: "<A|B|C>"` → `"<label from brand/personas>"`), no
  per-persona keyword/section blocks, no quoted persona hooks or prohibitions,
  no "today: X / Y / Z" rosters. **Section names are fine** — they're structural
  and shared across docs; it's the *contents* that must stay in the KB. Say
  "read the live doc; never substitute a remembered version." Swept
  2026-07-20 across `ssc-ads-brief`, `ssc-strategy-audience-intelligence`,
  `ssc-strategy-kol-discovery`, `ssc-strategy-territory-explorer`, and the
  `comment` examples in the ideate/authority skills.
- Adding a skill: create `skills/<name>/SKILL.md` where the directory name
  **matches** the frontmatter `name`; then register it in the owning agent's
  `orchestrates:` list.

## Working in this repo

- **No build/compile step.** Skills/agents/commands are markdown; the hook is a
  standalone Node 20 ESM script with no dependencies.
- **Exercise the governance hook directly** (it reads a PreToolUse JSON payload
  on stdin and emits a decision):
  ```bash
  echo '{"tool_name":"mcp__ssc__approve_idea","agent_id":"ssc-post-agent"}' \
    | node plugins/ssc/hooks/approval-gate.mjs   # → deny (subagent)
  echo '{"tool_name":"mcp__ssc__approve_idea"}' \
    | node plugins/ssc/hooks/approval-gate.mjs   # → ask (main conversation)
  ```
- There is **no automated test suite yet**; a design for a local test + lint
  harness is at `docs/superpowers/specs/2026-07-03-plugin-test-lint-harness-design.md`.

## Install / update (operators)

`claude plugin install` takes a **plugin name**, not a git URL, and `update`
needs the **qualified `plugin@marketplace` id** (plain `ssc-content` reports
"not found"). The marketplace name is `ssc-content-plugin`; the plugin name is
`ssc-content`.

```bash
# Install: add the marketplace once, then install by name
claude plugin marketplace add github.com/SunshineCare/ssc-content-plugin.git
claude plugin install ssc@ssc-content-plugin

# Update: refresh the marketplace from git, then update the plugin (restart to apply)
claude plugin marketplace update ssc-content-plugin
claude plugin update ssc@ssc-content-plugin
```

First use prompts an OAuth login to the BrandOS server via the SSC portal.

## Local development (testing an unpushed working tree)

Point the marketplace at this local directory so Claude Code reads the plugin
from the working tree instead of git:

```bash
# Re-adding with the same marketplace name swaps the source (git → Directory);
# it does NOT create a duplicate.
claude plugin marketplace add /absolute/path/to/ssc-content-plugin
```

Mechanics that matter for the dev loop: the marketplace is referenced in place
(`installLocation` = the repo), **but the plugin is copied into a versioned
cache** at `~/.claude/plugins/cache/ssc-content-plugin/ssc-content/<version>/`
on install. `claude plugin update` is a **no-op when the version is unchanged**
("already at the latest version") — so a same-version content edit is NOT
picked up by an update. Force a fresh copy of the working tree with
uninstall + reinstall:

```bash
# after editing plugins/ssc/**:
claude plugin uninstall ssc@ssc-content-plugin
claude plugin install  ssc@ssc-content-plugin
# then restart Claude Code to load the new copy
```

(Bumping `version` in `plugin.json` then `marketplace update` + `plugin update`
also works; reinstall is simpler for iteration.) Both `update` and `uninstall`
require the **qualified `plugin@marketplace` id** — plain `ssc-content` reports
"not found".
