# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reporting Style

Extreme concision. Sacrifice grammar for brevity — drop articles, pronouns, filler verbs. Telegraphic fragments over full sentences. No preamble, no recap, no "I've now…". Report facts + file refs only. Applies to all summaries/status/answers back to the user (not to code, comments, spec docs, or Vietnamese operator-facing skill output).

## Codebase Access — use codebase-memory-mcp FIRST

**The codebase knowledge graph is the primary tool for any code exploration or navigation in this repo — reach for it before Grep/Glob/Read.** Reinforced by global codebase-memory-mcp hooks (SessionStart + SubagentStart reminders, and a PreToolUse discovery gate that augments search calls). (This repo is mostly prose skills/agents/commands — most work routes to Grep/Read; the graph still helps for the executable hook + any code.)

1. **Structural code queries → codebase-memory-mcp tools first** — pass `project=Users-thang-dev-ssc-ssc-content-plugin` explicitly on every call (nothing maps cwd→project for you) — or use the `/codebase-memory` skill:
   - `search_graph(name_pattern|label|qn_pattern)` — find functions / classes / routes
   - `trace_path(function_name, mode=calls|data_flow|cross_service)` — call chains, impact analysis
   - `get_code_snippet(qualified_name)` — exact symbol source (precise line ranges)
   - `query_graph(query)` — complex Cypher patterns
   - `get_architecture(aspects)` — project structure
   - `search_code(pattern)` — graph-augmented text search
2. **Grep / Glob / Read** — for text, configs, docs, and non-code files; always Read a file before editing it.
3. **`"project not found or not indexed"` = LRU eviction, not missing.** The server keeps only ~6 graphs resident across 7 indexed sub-repos, so this one gets evicted routinely. **Retry the same query** — the query tools lazy-load on demand. Do NOT run `index_repository` (it no-ops on an unchanged HEAD SHA; `delete_project` first only if you truly need a rebuild), and do NOT trust `list_projects` / `index_status` — they report the *resident* set, not the *indexed* set, and disagree with each other. Only genuinely new, never-indexed code needs `index_repository`.
4. **Dispatching subagents?** Paste the `project=` name from step 1 into the dispatch prompt along with the eviction rule — a subagent cannot derive it from cwd.

## What this repo is

This is the **`ssc` Cowork plugin** (marketplace `ssc-content-plugin`, so
`ssc@ssc-content-plugin`) — a Claude Code marketplace plugin
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
  commands/  (12 × ssc-*.md)      # thin slash-command entry points
  agents/    (9 × ssc-*-agent.md) # pipeline orchestrators
  skills/    (45 × <name>/SKILL.md)# the actual work units
  hooks/approval-gate.mjs         # PreToolUse governance hook (the only real code)
  hooks/approval-gate.test.mjs    # its test suite — node --test hooks/
  hooks/hooks.json                # wires the hook to the approve/unapprove verbs,
                                  #   the four money-moving Meta tools, and `edit`
scripts/build-chatgpt-bundle.mjs  # commands+agents+skills → chatgpt/workflows.json
scripts/publish-chatgpt-bundle.sh # mirrors that bundle into content/mcp-server/
chatgpt/workflows.json            # GENERATED — never hand-edit
docs/chatgpt-connector.md         # operator setup for the ChatGPT connector
docs/superpowers/specs/           # design specs for in-flight work
```

Only `plugins/ssc/` ships when installed — the marketplace `source` is
`./plugins/ssc`. Repo-root files (README, docs, any future test
scaffolding) never install.

## Architecture: the three-layer dispatch model

The single most important thing to understand — it requires reading a command,
its agent, and a skill together:

1. **Commands** (`/ssc-*`) are **thin entry points that hold no orchestration
   logic.** They parse operator input and dispatch a single agent. Exception:
   `/ssc-ad`, `/ssc-ads-brief` and `/ssc-ads-publish` dispatch their skills
   (`ssc-ads-writer`, `ssc-ads-brief`, `ssc-ads-publish`) directly rather than
   through an agent — a command's `metadata.dispatches` names whichever it uses.
2. **Agents** (`ssc-*-agent`) are **orchestrators.** Frontmatter declares
   `orchestrates: [skills…]`, the read-only `tools:` they use to resolve state,
   a `capability` (`view`/`edit`), and `approval-gates: human`. Agents are
   **state-driven**: each invocation runs the next open step of the pipeline and
   stops at the next human gate. They never do the content work themselves.
3. **Skills** (`skills/<name>/SKILL.md`) are the **work units** — one pipeline
   step each. Frontmatter carries `metadata.section` (live values: `strategy`,
   `ads`, `post`, `knowledge`, `youtube`, `video`, `plan`, `shared`), `stage`,
   `capability`, and the `tools:` (BrandOS MCP tools) it calls. All four are
   required on every skill — nothing enforces that yet, so a missing one ships
   silently.

### Ads: the persona-late creative hierarchy

The Ads creative pipeline is three levels, each fanning out on an axis none of
the others own:

- **Idea = SUBJECT.** Persona-free, tier-free — one tension / insight / myth /
  proof-territory, written once at plan level (`ssc-ads-ideate`). Carries no
  persona, no route, no media-layer tag.
- **Angle/Brief = PERSONA × ROUTE.** `ssc-ads-brief` judges which personas
  (from the live persona roster) a subject genuinely fits, then fans it into
  one angle per fitting persona × persuasion route — each angle tags its own
  declared media home (`awareness_stage` + `target_layer_term_id`). One
  subject can carry several angles, across several personas.

  > **Coverage targets are set one stage earlier; FIT is still judged here.**
  > `ssc-ads-approaches` owns `creative_target` on the channel plan — which
  > personas × routes the period must cover, and in how many angles. That is
  > coverage *shape*, not a persona assignment: it says what the month owes,
  > while `ssc-ads-brief` remains the only step that decides whether a given
  > subject genuinely fits a given persona, and no persona/route/layer tag ever
  > reaches the idea. "Persona enters at the brief" is about the SUBJECT staying
  > persona-free — it does not forbid the plan step from setting coverage.
- **Copy = EXECUTION.** `ssc-ads-writer` tunes hook / structure / register /
  proof-phrasing to the one angle it's anchored to (that angle's declared
  persona/route/awareness_stage) — never to an ad-set steering spec.

The ad set / media buy is a **dashboard/ops concern outside the creative
pipeline** — no skill plans, tags, or references an ad set's budget / audience
/ placement setup; deployment (`create_ad`) is a human dashboard action.
`ssc-ads-blueprint` is retired — there is **no media-PLANNING step** in the
creative pipeline.

**The one place an ad set is named is Publish.** `/ssc-ads-publish` takes an
existing `ad_set_id` as an input and assembles the creative payload for it. That
is not a media step: it plans no ad set, sets no budget/audience/placement, and
calls none of `create_campaign` / `create_adset` / `create_ad` / `update_budget`
— it presents the payload and STOPS, and the commit is a human dashboard action.
Referencing an ad set the operator already made is allowed; authoring one is not.

### Pipelines (which skills each agent orchestrates)

| Pipeline | Command | Agent | Stages (skills) |
|---|---|---|---|
| Monthly plan (head) | `/ssc-plan` | `ssc-plan-agent` | Review → Tactics → Research → Narrative, keyed on `month_plans(period)` — the cross-channel head above the per-channel plans. **Review is the system's only look-back** and ranks taxonomy TERMS (each with `scale`/`maintain`/`drop`), never metrics. Tactics crosses the quarterly strategy brief with those terms into the month's themes. Research is the ONE outward signal pass per period. **Narrative is authored last and is the month's ONLY gate** — approving it releases every linked channel. Ordering is presentational, **not a chain of locks**: every step stays editable until the Narrative is approved, so an already-written step is re-authored on request, never refused. The head also allocates each channel's quantities (`allocate_channel`) |
| Posts (plan) | `/ssc-post-plan` | `ssc-post-agent` | Approaches → Ideate → Schedule — the **channel** steps only, hanging off `month_plans(period)` and released by the head's Narrative approval. The channel authors **no** themes, **no** market research, **no** look-back and **no** quantities *of its own*: those are the head's Tactics / Research / Review / allocation. (One nuance: `ssc-post-ideate` round 1 **proposes** the pillar split by calling `allocate_channel`, which writes the **head's** allocation, not a channel field. That is propose-only — it sets no status and flips no gate — and the operator edits it in the dashboard. The retired channel-side writes stay refused.) Every step grounds in the **monthly plan first, the quarterly strategy second, the KB third**, and says so when they conflict. Channel `tactics` / `retrospective` were dropped server-side and `plan_targets` / detail writes are refused (`retired_plan_field`) from `2026-08` onward — `ssc-post-focus`, `ssc-post-research` and `ssc-post-measure` are **retired** accordingly. Approaches dispatches the shared **`ssc-approaches-core`** sub-skill (the `ssc-brief-core` precedent — view-only, holds no mutation tool, reads no plan state) for the inherited sophistication read, the voice-of-customer pass and the candidate-mechanism supply |
| Posts (produce) | `/ssc-post` | `ssc-post-writer-agent` | produce ⇄ authority loop |
| Ads (plan) | `/ssc-ads-plan` | `ssc-ads-agent` | Approaches → Ideate — the **channel** steps only, on `channel_plans(channel='ad', period)` hanging off the head. **Focus and Measure are retired steps, not skipped ones**: `channel_plans.tactics` / `tactics_approved` / `retrospective` were dropped server-side, so the month's bets are `month_plans.tactics` and its only look-back is `month_plans.performance_review`. Released by the head's Narrative approval; the channel authors no bets, no research, no look-back and no quantities. Approaches owns `creative_target` — the period's persona × route coverage SHAPE (not volume, which is the head's) — and dispatches the same shared **`ssc-approaches-core`** sub-skill (the `ssc-brief-core` precedent) for the inherited sophistication read, the voice-of-customer pass and the candidate-mechanism supply |
| Ads (brief) | `/ssc-ads-brief <ideaId\|date>` | *(direct → ads-brief)* | Persona enters here — judges which personas (from the live persona roster) the persona-free concept fits, then fans it into distinct persona × route angle briefs via `save_brief`, each tagging its own declared media home (`awareness_stage` + `target_layer_term_id`). Append-only: re-running adds whichever distinct angles still remain (per persona) — no produce-once stop, no discard-and-regenerate. Operator approves each angle worth producing; every approved angle anchors its own independent production run |
| Ads (produce) | `/ssc-ad <briefId> [section]` | *(direct → ads-writer)* | Anchored to the operator's chosen approved angle brief — `briefId` is the sole input (the writer resolves the concept from it via `get_brief`, no `idea_id`). Text-only per-section stepper (copy first from the brief; then headline/description/image_content freed, each gated only on copy) tuned to the angle's declared persona/route/awareness_stage — never an ad-set steering spec; saves via `save_content` (content is brief-keyed — `brief_id` required for ads, no `idea_id`) |
| Image (prompt) | `/ssc-image-prompt <briefId> [step]` | `ssc-image-prompt-agent` | Scene → Subject → Composition → Edit → Text (all optional) — the **only** image path, and it is **zero-credit**: it authors each step's prompt + `generation_config` and saves via `save_creative_prompt`, then stops. **Cowork never generates** — the operator clicks Generate and selects a candidate in the ImageStudio dashboard, which is what spends fal credits. Anchored to ONE approved `briefId`; the owning idea **and the channel** resolve from the brief (`ad` and `post` both run; any other channel stops). **Scene asks before it writes**: grounded on the idea's `hero` + all approved copy, it proposes **five scene setups** (Vietnamese title + one sentence each) and waits for the operator's pick (`setup: <n|title|description>`) — nothing is saved until one is chosen. Prompts are grounded in the brief + that channel's approved contents + persona doc + brand KB and reach the engine verbatim. Product is upload-only. |
| Ads (publish) | `/ssc-ads-publish <briefId> <adSetId>` | *(direct → ads-publish)* | Assembles the creative payload for an ad set the operator already made, records the compliance assessment, **presents the payload and STOPS**. Holds no money-moving tool — `create_campaign` / `create_adset` / `create_ad` / `update_budget` are dashboard-only, and the hook denies all four to a subagent. Not a media-planning step: see the ad-set note above |
| YouTube | `/ssc-youtube` | `ssc-youtube-agent` | briefing → ideate → schedule, on `channel_plans(channel='youtube', period)` hanging off the head. Released by the head's Narrative approval — **not** by any channel flag (`tactics_approved` is gone). The channel authors no themes, no research and no quantities of its own: briefing writes the channel brief to `context` and proposes the month's cadence + distribution onto the HEAD via `allocate_channel`, since `save_plan_targets` and a `detail` payload are refused (`retired_plan_field`) from `2026-08` onward. `ssc-youtube-seo` exists but is orchestrated by `ssc-strategy-agent`, not here |
| Video | `/ssc-video <briefId>` | `ssc-video-agent` | Script → Storyboard → Keyframe → Clip, brief-keyed and per-scene. Later steps (Assemble / Package / Voice) need backend AI-generation tools that have not shipped — the agent reports that plainly and stops rather than working around it |
| Knowledge base | `/ssc-kb` | `ssc-kb-agent` | review → audit → research → revise / gap-fill. Research **persists nothing**: there is no `research` table and no `save_research` tool, so the report's own source lines are the provenance a revision's `evidence_note` carries |
| Strategy (quarterly) | `/ssc-strategy` | `ssc-strategy-agent` | directions → 8-dimension intelligence → KB review + revision proposals. **`ssc-strategy-eval` / `-develop` / `-audit` are NOT entry points of this agent** — they are standalone skills the operator invokes directly for one-off strategy work |

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
   input: from a **subagent → deny**, from the **main operator conversation →
   ask** (confirm). It governs three families: the `approve`/`unapprove` verbs
   (generic and legacy `approve_*` forms), the four money-moving Meta tools, and
   — because a **demotion has no verb of its own** — the generic `edit` when its
   patch carries an approval-bearing field (`status`, `approved`,
   `<gate>_approved`, `gate`). An `edit` without one is ordinary draft authoring
   and passes through untouched. `delete` is a known blind spot; see
   `hooks/README.md`.
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
- **Commands are named `/ssc-<name>` (hyphen, not dot).** The dot form
  (`/ssc.ad`, `/ssc.post`, …) was renamed repo-wide on 2026-07-27 — file names
  and every cross-reference. Do not reintroduce a `ssc.` command ref.
- **`/ssc-*` cross-references must resolve to a real command.** `ssc-ads` is
  **retired/renamed** and appears only in "no … dependency" negations — do not
  treat it as a live command or add new refs to it (dangling-ref hot-fixes:
  commits `14a60be`, `32014c1`).

  > **`/ssc-plan` was un-retired on 2026-07-26** and is a **live command again** —
  > the monthly-plan HEAD (`month_plans(period)`), not the retired shared-head
  > model the old name referred to. The two are different things that share a
  > name: the retired one was a cross-channel head over `monthly_plans` /
  > `targets.ads` / `phase_status`; the live one is the Plan stage of
  > `monthly-plan-owns-the-month`. Agent/skill prose still carrying "no
  > `/ssc-plan` precondition" negations refers to the RETIRED model — those
  > negations stay true of the channel pipelines' *legacy* independence, but the
  > channels now DO depend on the head's narrative gate, so re-read any such
  > line before trusting it.
- **Never hard-code KB content into a skill — reference the doc and read it
  live.** Skills must name the KB doc (and its section) they draw on, not
  restate its contents. This covers persona docs (trigger points, vocabulary,
  the per-persona `Tránh` prohibitions, search keywords), `craft/awareness-framework`
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
- **The hook has a test suite; the prose does not.** Run it with
  `node --test hooks/` from `plugins/ssc/` — `hooks/approval-gate.test.mjs` pins
  every matcher (both the `.mjs` regexes and the `hooks.json` entries, which must
  agree) and exercises the script end to end for each identity. Run it after any
  hook change. There is still **no lint/test harness for the skills, agents or
  commands**; a design for one is at
  `docs/superpowers/specs/2026-07-03-plugin-test-lint-harness-design.md`. The
  nearest thing that exists today is the bundle build (`node
  scripts/build-chatgpt-bundle.mjs`), which fails on a missing
  `metadata.dispatches`, a skill dir that does not match its frontmatter `name`,
  and an `orchestrates` entry with no such skill.
- **The version bump is part of the commit, not a follow-up.** Any change to a
  skill, agent, command, or hook requires bumping the version in
  `.claude-plugin/plugin.json` in the **same commit** — operators update by
  version, so an unbumped change never reaches them. A change is not "committed"
  until the version moved with it. Do not wait to be asked.
- **A prose change has TWO consumers now — republish the ChatGPT bundle.**
  Cowork loads the skills; **ChatGPT cannot**, because it has no slash commands,
  no subagents and no MCP prompts. It reads the same 11 workflows through three
  read tools on the BrandOS server (`list_workflows` / `get_workflow` /
  `get_workflow_step`), which serve a bundle generated from `plugins/ssc/**`:
  ```bash
  scripts/publish-chatgpt-bundle.sh          # rebuild + mirror into content/
  scripts/publish-chatgpt-bundle.sh --check  # exit 1 if the mirror is stale
  ```
  So any command/agent/skill edit means: bump the version **and** republish,
  then commit the refreshed mirror in the `content` repo and deploy
  brandos-express — otherwise ChatGPT keeps running the old prose. The mirror at
  `content/mcp-server/lib/brandos/workflows/workflows.json` is GENERATED; edit
  the skills, never it. Setup + limits: `docs/chatgpt-connector.md`.
- **A new command needs `metadata.dispatches: [<agent-or-skill>]`** in its
  frontmatter. It is what the bundle generator reads to know which agent (or,
  for `/ssc-ad` and `/ssc-ads-brief`, which skill) the command dispatches —
  a command without it fails the build rather than shipping a workflow with no
  entry point.

## Install / update (operators)

`claude plugin install` takes a **plugin name**, not a git URL, and `update`
needs the **qualified `plugin@marketplace` id** (a bare plugin name reports
"not found"). The marketplace name is `ssc-content-plugin`; the plugin name is
**`ssc`** (as declared in both manifests) — so the qualified id is
`ssc@ssc-content-plugin`.

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
require the **qualified `plugin@marketplace` id** — a bare plugin name reports
"not found".
