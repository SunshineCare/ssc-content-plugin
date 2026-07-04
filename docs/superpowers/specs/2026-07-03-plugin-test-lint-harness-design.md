# Design: local test + lint harness for the ssc-content plugin

**Date:** 2026-07-03
**Status:** approved (design), pending implementation plan

## Problem

The `ssc-content` Cowork plugin (v1.1.0, marketplace-distributed) has **zero
automated verification**: no `package.json`, no test runner, no CI. The plugin
surface is 7 commands, 6 agents, 34 skills (all markdown), one executable hook
(`approval-gate.mjs`, Node.js), and three JSON manifests.

Git history shows three recurring bug classes that shipped and had to be
hot-fixed — each one a defect a mechanical check would have caught:

- `8d4ded8 fix: sync skills/agents/commands with the current MCP surface`
  → **MCP tool-reference drift** (skills cite server tools that were renamed/removed).
- `14a60be fix: update stale /ssc.ads ref to /ssc.ads-plan`
  → **dangling command cross-reference** to a renamed command.
- `32014c1 fix: remove dangling /ssc.plan refs`
  → **dangling command cross-reference** to a dissolved command.

The one piece of real executable code — the propose-only approval-gate hook —
is currently "verified" only by ad-hoc manual runs (per its own README), so a
regression could silently let a pipeline flip an approval gate.

## Goals

1. A **manually-run** local verification entry point (`npm test`). No CI
   service, no git hooks.
2. A real test suite for the **approval-gate hook** (its behavioral contract).
3. A **structural linter** that catches the three recurring bug classes above,
   expressed as test cases in the same runner.

## Non-goals

- No GitHub Actions / hosted CI.
- No git pre-commit/pre-push hook.
- No testing of skill/agent **prose behavior** (on-brand copy, scoring quality) —
  that is a runtime concern governed by the hook + server capability, not
  unit-testable here.

## Decisions (locked with the operator)

| Decision | Choice |
|---|---|
| How it runs | Manual command (`npm test`) — nothing automatic |
| Tooling | `package.json` + framework (vitest) + JSON-schema validator (ajv) |
| MCP tool allowlist | Committed `meta/mcp-tools.json`, seeded now from the ~38 tools extracted from the skills; operator maintains it when the server surface changes |
| Lint as tests | Structural checks live as vitest test cases, not a standalone script — one runner, one report |
| Scaffolding location | Repo root, **outside** `plugins/` so it never ships in the installed plugin |
| Tool-reference detection | Verb-prefix heuristic (see Component 2) rather than requiring backticked tool names |

## File layout

All test scaffolding lives at repo root, outside `plugins/`, because the
marketplace installs only `./plugins/ssc-content` — repo-root files never ship.

```
package.json              # vitest + ajv devDeps; "test": "vitest run"
meta/
  mcp-tools.json          # allowlist — seeded with the ~38 BrandOS tool names
  schemas/
    plugin.schema.json    # required shape of plugin.json
    marketplace.schema.json
test/
  hook.test.mjs           # approval-gate.mjs behavior
  structure.test.mjs      # manifests + frontmatter + cross-refs + tool allowlist
```

## Component 1 — Hook tests (`test/hook.test.mjs`)

Spawns the real `plugins/ssc-content/hooks/approval-gate.mjs` as a subprocess
(piped stdin → captured stdout + exit code), testing the actual shipped
artifact rather than a re-imported copy. Each case feeds a JSON PreToolUse
payload on stdin and asserts the emitted decision / exit behavior.

| Input | Expected |
|---|---|
| `approve_*` with `agent_id` set | `deny` |
| Same with each agent-field variant: `agentId`, `agent_type`, `agentType`, `subagent_type` | `deny` |
| `approve_*` / `unapprove_*` from main (no agent field) | `ask` |
| `agent_id: "main"` | `ask` (the `!== 'main'` guard, not deny) |
| non-gate tool (`mcp__ssc__get_idea`) | exit 0, no decision emitted (defer) |
| unparseable stdin | exit 0 (defer) |
| field-name variant `toolName` instead of `tool_name` | resolved correctly |

`deny`/`ask` assertions parse stdout JSON and check
`hookSpecificOutput.permissionDecision`.

## Component 2 — Structural lint (`test/structure.test.mjs`)

Deterministic checks, each a named test, reading files from
`plugins/ssc-content/`.

### 2a. Manifests
- `plugin.json`, `marketplace.json`, `.mcp.json` parse as JSON.
- `plugin.json` and `marketplace.json` validate against `meta/schemas/*` via ajv
  (required fields, correct types).
- `marketplace.json` `plugins[].source` path exists on disk.
- **MCP-config agreement**: the `mcpServers.ssc` block in `plugin.json` and
  `.mcp.json` are identical (same `url`, `oauth.clientId`, `oauth.callbackPort`) —
  a drift check between the two copies.

### 2b. Frontmatter
- Every `commands/*.md` has YAML frontmatter with a `description`.
- Every `agents/*.md` has frontmatter with `name` and `description`.
- Every `skills/*/SKILL.md` has frontmatter with `name` and `description`, and
  the skill **directory name matches** the frontmatter `name`.

### 2c. Cross-references
- Every agent's `orchestrates:` entry resolves to an existing `skills/<name>/`
  directory.
- Every `/ssc.<x>` reference anywhere in commands/agents/skills resolves to a
  real `commands/ssc.<x>.md` **or** is in an explicit `RETIRED_COMMANDS`
  allowlist (`ssc.plan`, `ssc.ads`) — the dissolved/renamed commands that appear
  only in "no … dependency" negations. A *new* stale ref fails; the intentional
  negations pass.

### 2d. Tool allowlist
- Extract every token matching the MCP verb pattern
  `\b(save|get|list|approve|unapprove|update|delete|edit|check|propose|upload)_[a-z_]+\b`
  across commands/agents/skills.
- Assert each extracted token is present in `meta/mcp-tools.json`.
- The verb-prefix restriction avoids false positives on prose snake_case such as
  `channel_plan`, `build_spec`, `food_placeholder` (none start with a tool verb).
- Catches `8d4ded8`-class drift: a skill referencing a renamed/removed server
  tool fails because the token is absent from the allowlist.
- An `IGNORE` set in the test absorbs any legitimate non-tool token that happens
  to match the verb pattern, should one ever appear.

## Seed data — `meta/mcp-tools.json`

Seeded from the tools extracted from the current skills:

```
approve_channel_plan, approve_content, approve_idea, approve_knowledge_revision,
check_compliance, delete_content, delete_idea, edit_content, edit_knowledge,
get_ad_performance, get_channel_plan, get_content_by_date, get_content_gaps,
get_idea, get_knowledge, get_performance_analysis, get_post_performance,
get_strategy_brief, list_ideas, list_knowledge, list_post_content,
list_taxonomies, propose_knowledge_revision, save_ad_plan_slots,
save_ad_schedule_weeks, save_channel_plan, save_idea, save_knowledge,
save_plan_targets, save_post_content, save_research, save_schedule_entries,
save_strategy_brief, save_strategy_finding, update_budget, update_idea_rating,
update_status, upload_creative
```

(Also add the read-side tools referenced by agents' frontmatter `tools:` lists
and any `get_approval_status`/`unapprove_*` names once confirmed against the
skills during implementation.)

## Testing this harness

The harness verifies itself by construction: running `npm test` against the
current repo must pass (the repo is known-good post the `8d4ded8`/`14a60be`/
`32014c1` fixes). During implementation, temporarily introducing a known defect
(a typo'd tool name, a dangling `/ssc.foo` ref) must turn the relevant test red —
confirming the checks actually bite.
