# Brief-First Ads Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/ssc.ads-produce` take `<ideaId> <briefId> [section]` and produce ad text anchored to one operator-chosen angle brief, with brief generation moved to a new `/ssc.ads-brief` command that runs first (before any copy).

**Architecture:** Invert the ads-produce pipeline to brief-first. A new thin command `/ssc.ads-brief <ideaId>` dispatches `ssc-ads-brief` (rewritten to derive angles from the concept + persona, dropping its copy-approval gate). The operator approves one angle; `/ssc.ads-produce <ideaId> <briefId> [section]` dispatches `ssc-ads-writer` (rewritten to require `briefId`, read that one brief via `list_briefs` + `id` filter, and ground `copy` in only that brief). All markdown prose; propose-only invariant preserved.

**Tech Stack:** Claude Code plugin — markdown skills/commands + one Node ESM governance hook. No build/compile step; no test framework yet. Verification is `grep`-based assertions + exercising `hooks/approval-gate.mjs`.

## Global Constraints

- **Propose-only (hard invariant):** never add `approve_*`, `unapprove_*`, `update_status`, `approve`, `delete`, or any publish/schedule/`update_budget` tool to any skill or command `tools:` list or as a call. Producers save DRAFTs only.
- **Every referenced MCP tool must exist on the live BrandOS surface.** Allowed here: `get_idea`, `get_channel_plan`, `list_post_content`, `get_knowledge`, `list_briefs`, `save_brief`, `save_post_content`. **There is no `get_brief` tool** — read a single brief via `list_briefs(idea_id)` then filter to `id == briefId`.
- **All persisted prose is Vietnamese** (copy, brief narrative fields, `angle_label`, rating comments). Operator-facing chat may be the operator's language.
- **`/ssc.*` cross-references must resolve to a real command.** After this change the live ads commands are `/ssc.ads-plan`, `/ssc.ads-produce`, `/ssc.ads-image`, and the new `/ssc.ads-brief`. `ssc.plan` / `ssc.ads` are retired — never reference them except in "no … dependency" negations.
- **A new skill/command's file/dir name must match its frontmatter `name`.** `/ssc.ads-produce` and `/ssc.ads-brief` dispatch skills **directly** (no agent) — there is no agent `orchestrates:` list to update for the producers.
- **`plugin.json` / `.mcp.json` unchanged** — all tools are already on the `ssc` surface; the governance hook is untouched.
- **Change-2 caveat is documented, never hidden:** today's server keeps one brief per idea and nulls `angle_label`; the multi-angle choice is inert until Change 2. State it in the prose; the plumbing works today with the one persisted brief.

---

### Task 1: Rewrite `ssc-ads-brief` — drop the copy gate, derive angles from concept + persona

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md`

**Interfaces:**
- Produces: a rewritten skill that runs FIRST (no copy precondition). Its outputs (DRAFT briefs via `save_brief`) are consumed by the operator's approval, then by `ssc-ads-writer` (Task 3) via `briefId`.

- [ ] **Step 1: Edit the frontmatter `tools:` and `description`.**
  - `tools:` → `[get_idea, get_channel_plan, get_knowledge, list_briefs, save_brief]` — **remove `list_post_content`** (angles no longer derive from approved copy).
  - Rewrite the `description:` so it no longer says "requires the concept's copy section to have ≥1 approved row" or "realized through whichever approved copy best expresses it." New framing: "Resolves ONE approved ad concept + its ad-set `build_spec`, loads the persona detail doc as the PRIMARY angle source, and — with **no copy precondition** — selects up to five distinct angles from the persona's ranked trigger points / objections / myths (grounded in the concept `title`/`tags`/`ad_notes` + `build_spec`), derives the five narrative fields + a mandatory Vietnamese `angle_label` + score/comment per angle, runs the produce-once guard, saves DRAFT briefs via `save_brief`, and STOPS." Keep every propose-only / Change-2 sentence.

- [ ] **Step 2: Remove the copy-approval gate (body Step 2) and the copy-pool holds.**
  - Delete the whole `### Step 2: Gate — require an approved copy` section (lines describing `approved(copy)` STOP + holding approved copy/headline/description/image_content rows).
  - Renumber: the produce-once guard becomes the new Step 2; angle selection Step 3; field derivation Step 4; quality gate Step 5; save Step 6; summary Step 7. (Adjust all "Step N" cross-references in the body + summary accordingly.)

- [ ] **Step 3: Rewrite angle selection to derive from persona + concept, not approved copy.**
  - In the (renumbered) angle-selection step, replace the "Realized through the approved copy" hard rule with: "**Realized through the concept.** Each angle is expressed through `idea.title` + its `value`/`frame`/`persona`/`against` tags + `ad_notes` + `build_spec` — the concept material the copy will later be written from. There is no approved copy to draw on (brief-first)."
  - Keep "Distinct anchor per angle" and "Never pad."

- [ ] **Step 4: Rewrite the five-field derivation to remove approved-copy sourcing.**
  - `hook_direction` — from this angle's persona trigger/objection it answers + the concept's frame; not "from the anchoring approved copy's opening line."
  - `core_message` — `idea.title` sharpened to this angle's trigger/objection/myth.
  - `why_now` — unchanged (build_spec audience-stage + plan period).
  - `story_moment` — a concrete scene **only if** the angle is story/person-led, grounded in the persona doc's buying-behaviour + (for founder angles) `programme/kieu-my-story`; else the exact line `Không áp dụng — concept không thuộc dạng kể chuyện.` (Add `programme/kieu-my-story` to the Step's `get_knowledge` load only if a founder/story angle is in play.)
  - `cta` — a soft compliant CTA appropriate to the layer (there is no approved copy to quote); reference `ad/cta-catalog` conceptually (do not add a tool — `get_knowledge` already loads paths). If loading `ad/cta-catalog` is desired, add it to the persona-doc `get_knowledge` paths.

- [ ] **Step 5: Update the copy-approval references in Inputs / Governance / summary.**
  - Remove the "Copy-approval gate" governance bullet and Step-2 stop-message. Remove the "Grounded in: N approved copy(ies)…" summary line (replace with "Angle source: persona detail doc + concept tags + build_spec").
  - Keep the produce-once guard governance bullet, the Change-2 bullet, propose-only, never-theme, one-concept-at-a-time.

- [ ] **Step 6: Verify propose-only + tool existence + no copy-gate remain.**

Run:
```bash
cd plugins/ssc-content/skills/ssc-ads-brief
grep -n "approved(copy)\|require.*approved.*copy\|list_post_content" SKILL.md   # expect: no matches (gate + tool gone)
grep -n "approve\b\|unapprove\|update_status\|publish\|schedule\b" SKILL.md      # expect: only inside propose-only NEGATIONS
grep -n "tools:" SKILL.md                                                        # expect: [get_idea, get_channel_plan, get_knowledge, list_briefs, save_brief]
```
Expected: the copy gate and `list_post_content` are gone; no forbidden tool appears except in "never …" negations.

- [ ] **Step 7: Commit.**
```bash
git add plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
git commit -m "feat(ssc-ads-brief): derive angles from concept+persona; drop the copy-approval gate (brief-first)"
```

---

### Task 2: Create the `/ssc.ads-brief` command

**Files:**
- Create: `plugins/ssc-content/commands/ssc.ads-brief.md`

**Interfaces:**
- Consumes: the rewritten `ssc-ads-brief` skill (Task 1).
- Produces: `/ssc.ads-brief <ideaId>` (optional `date`) — the brief-generation entry point that runs first in the pipeline.

- [ ] **Step 1: Write the command file.** Model it on the *thin entry point* shape of `ssc.ads-produce.md` (frontmatter `description` + `metadata: {brand, section: ads}`, a `## User Input` `$ARGUMENTS` block, `## What to do`, `## Governance`, `## After it runs`). Content:
  - **Input:** `idea_id` (an approved ad concept, `channel='ad'`, `status='approved'`) OR `date` (resolves the day's approved ad concept(s), one per invocation). If neither given, ask once. No `section`, no `briefId`.
  - **What to do:** thin dispatch of `ssc-ads-brief` (`idea_id` [, `date`]) and stop. State that it runs FIRST — before copy — and needs no approved copy.
  - **Governance:** propose-only — `ssc-ads-brief` saves DRAFT briefs via `save_brief`; the operator approves one angle at `/ad/[month]/[id]`; the command/skill never `approve`s or flips a gate.
  - **After it runs:** point the operator to `/ad/[month]/[id]` to approve ONE angle, then run `/ssc.ads-produce <idea_id> <briefId>` to produce copy anchored to it.

- [ ] **Step 2: Verify the command references only real skills/commands/tools.**

Run:
```bash
cd plugins/ssc-content
grep -n "ssc-ads-brief\|/ssc.ads-produce\|creative_brief" commands/ssc.ads-brief.md  # dispatches ssc-ads-brief; forward-refs /ssc.ads-produce; NO creative_brief
grep -rn "ssc.plan\|/ssc.ads\b" commands/ssc.ads-brief.md                            # expect: no matches (no retired refs)
test -f commands/ssc.ads-brief.md && echo "file present"
```
Expected: file present, dispatches `ssc-ads-brief`, no `creative_brief`, no retired command refs.

- [ ] **Step 3: Commit.**
```bash
git add plugins/ssc-content/commands/ssc.ads-brief.md
git commit -m "feat(commands): add /ssc.ads-brief — brief-first angle generation entry point"
```

---

### Task 3: Rewrite `ssc-ads-writer` — require `briefId`, anchor copy to that one brief

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`

**Interfaces:**
- Consumes: an operator-approved brief id (`briefId`) produced by Task 1/2 and approved in the dashboard.
- Produces: the production work unit `/ssc.ads-produce` (Task 4) dispatches.

- [ ] **Step 1: Frontmatter `tools:` + `description`.**
  - `tools:` → add `list_briefs`: `[get_knowledge, get_idea, get_channel_plan, list_post_content, list_briefs, save_post_content]`.
  - `description:` — add that it now takes a **required `briefId`**, reads that one approved brief via `list_briefs` + `id` filter, and grounds `copy` in only that brief (not "no earlier input").

- [ ] **Step 2: Inputs section — require `idea_id` + `briefId`, drop `date`.**
  - Replace the "one of (idea_id, or date)" concept selector with: **required `idea_id`** + **required `briefId`**. Remove the `date` selector (a `briefId` is idea-scoped, so `date` — which can resolve several concepts — is ambiguous on the producer). Keep the optional `section` and `n_*` counts.

- [ ] **Step 3: New Step 1c — resolve + gate the chosen brief.** Insert after the concept-resolve step (Step 1) / build_spec step (1b):
  - Call `list_briefs(idea_id)`; select the single row where `id == briefId`.
  - If no such row → STOP ("brief `<briefId>` not found for this concept — run `/ssc.ads-brief <idea_id>` and approve one angle first").
  - If the row's `status != 'approved'` → STOP ("that angle brief is still a draft — approve it in `/ad/[month]/[id]`, then re-invoke").
  - Hold the brief's `angle_label` + five narrative fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`) as **the angle anchor** for every section this run.

- [ ] **Step 4: Copy grounding (the D3 change).** In the section that today says `copy` has "NO earlier-section input":
  - Rewrite so `copy` is grounded in the **single chosen brief** (its five narrative fields + `angle_label`) + `idea.title`/`tags`/`ad_notes` + `build_spec` + KB + the Hook Formula Bank. State explicitly: use **only** the brief named by `briefId`, never all of the idea's briefs.
  - `headline`/`description`/`image_content` continue to lead from the live approved `copy` (source of truth) AND hold the same single brief as the angle anchor for consistency.

- [ ] **Step 5: Sweep the retired `creative_brief` router language + `date` mentions.**
  - Replace every `Run /ssc.ads-produce <idea_id> creative_brief …` next-step line (Step 9 output + "After it runs") with the brief-first phrasing: brief generation is now `/ssc.ads-brief`, and re-invocations are `/ssc.ads-produce <idea_id> <briefId> [section]`.
  - Remove the "If given a `date`" resolve branch (Step 1) and multi-concept-per-date handling (the producer takes an explicit `idea_id`).

- [ ] **Step 6: Verify signature, brief read, tool existence, propose-only.**

Run:
```bash
cd plugins/ssc-content/skills/ssc-ads-writer
grep -n "briefId\|list_briefs" SKILL.md                                 # expect: required briefId + list_briefs read/gate present
grep -n "get_brief" SKILL.md                                            # expect: NO matches (tool doesn't exist)
grep -n "creative_brief" SKILL.md                                       # expect: NO matches (router retired)
grep -n "approve\b\|unapprove\|update_status\|publish" SKILL.md         # expect: only inside propose-only NEGATIONS
grep -n "tools:" SKILL.md                                               # expect: list includes list_briefs, save_post_content; no approve/publish
```
Expected: required `briefId` + `list_briefs` gate present; no `get_brief`, no `creative_brief`, no forbidden tools outside negations.

- [ ] **Step 7: Commit.**
```bash
git add plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
git commit -m "feat(ssc-ads-writer): require briefId; ground copy in the one chosen approved brief (brief-first)"
```

---

### Task 4: Rewrite `/ssc.ads-produce` — new signature, drop the `creative_brief` router

**Files:**
- Modify: `plugins/ssc-content/commands/ssc.ads-produce.md`

**Interfaces:**
- Consumes: `ssc-ads-writer` (Task 3).
- Produces: `/ssc.ads-produce <ideaId> <briefId> [section]` — the pure producer.

- [ ] **Step 1: `description` frontmatter.** Rewrite to: a thin entry point that dispatches **`ssc-ads-writer` only** with a required `idea_id` + `briefId` and optional `section`; produces ad text anchored to the operator's chosen approved angle brief; brief generation is the separate `/ssc.ads-brief`. Remove all `ssc-ads-brief` / `creative_brief` / router language from the description.

- [ ] **Step 2: `## User Input` — new required inputs.** Replace the "one of date | idea_id" block with: **required `idea_id`** + **required `briefId`**; optional `section` ∈ `headline | description | image_content` (auto-picks among those without an approved row; `copy` is still the mandatory first section, produced when nothing is approved yet). Remove `creative_brief` from the section enum and remove the `date`/`period` selectors (producer is idea-scoped via `idea_id`/`briefId`). If `briefId` is missing, ask once; never invent one.

- [ ] **Step 3: `## What to do` — drop the router, single dispatch.** Replace the "if section=='creative_brief' → ssc-ads-brief; else → ssc-ads-writer" logic with a single dispatch: it always dispatches **`ssc-ads-writer`** (`idea_id`, `briefId`, optional `section` passthrough) and stops. Remove the entire `ssc-ads-brief` produce-once paragraph. Keep the writer state-machine summary table (copy cold-start → headline/description/image_content freed after copy), updated so re-runs read `/ssc.ads-produce <idea_id> <briefId> [section]`.

- [ ] **Step 4: `## Governance` + `## After it runs`.** Keep propose-only. Update every next-step string to `/ssc.ads-produce <idea_id> <briefId> [section]` and route brief generation to `/ssc.ads-brief <idea_id>`. Remove the "run `/ssc.ads-produce <idea_id> creative_brief`" lines.

- [ ] **Step 5: Verify signature + no router + no dangling refs.**

Run:
```bash
cd plugins/ssc-content
grep -n "creative_brief\|ssc-ads-brief" commands/ssc.ads-produce.md     # expect: NO matches (router + sibling gone)
grep -n "briefId\|ssc-ads-writer" commands/ssc.ads-produce.md           # expect: required briefId; dispatches ssc-ads-writer
grep -rn "ssc.plan\|/ssc.ads\b" commands/ssc.ads-produce.md             # expect: no retired-command refs
grep -n "/ssc.ads-brief" commands/ssc.ads-produce.md                    # expect: routes brief generation to the new command
```
Expected: no `creative_brief`/`ssc-ads-brief`, required `briefId`, dispatches only `ssc-ads-writer`, points at `/ssc.ads-brief`.

- [ ] **Step 6: Commit.**
```bash
git add plugins/ssc-content/commands/ssc.ads-produce.md
git commit -m "feat(commands): /ssc.ads-produce takes <ideaId> <briefId> [section]; drop the creative_brief router"
```

---

### Task 5: Update root `CLAUDE.md` pipelines table + dispatch note

**Files:**
- Modify: `CLAUDE.md` (the Ads (produce) pipeline row ~line 61; the `/ssc.ads-produce` dispatch note ~line 43)

**Interfaces:**
- Consumes: the finished command/skill surface (Tasks 1-4).

- [ ] **Step 1: Rewrite the Ads (produce) row.** Replace line 61's row with a brief-first description: `/ssc.ads-produce <ideaId> <briefId> [section]` dispatches `ssc-ads-writer` only (copy anchored to the chosen approved brief, then headline/description/image_content freed after copy). Add (or adjust the Pipelines table to include) a row/note for the new **`/ssc.ads-brief`** → `ssc-ads-brief` step that runs FIRST (angle generation from concept + persona, produce-once, operator approves one).

- [ ] **Step 2: Fix the dispatch-note prose (~line 43).** Update the "Exception: `/ssc.ads-produce` dispatches the `ssc-ads-writer` production skill directly" note to reflect that both `/ssc.ads-produce` (→ `ssc-ads-writer`) and `/ssc.ads-brief` (→ `ssc-ads-brief`) are direct-dispatch commands, and that ads is now brief-first.

- [ ] **Step 3: Verify.**
```bash
grep -n "ads-produce\|ads-brief\|briefId\|creative_brief" CLAUDE.md
```
Expected: the row shows `<ideaId> <briefId>` + a `/ssc.ads-brief` entry; no stale "creative_brief" router description remains.

- [ ] **Step 4: Commit.**
```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE): brief-first ads pipeline — /ssc.ads-brief then /ssc.ads-produce <ideaId> <briefId>"
```

---

### Task 6: Supersede the old design spec + reconcile the openspec change

**Files:**
- Modify: `docs/superpowers/specs/2026-07-12-ads-brief-angle-briefs-design.md` (add superseded banner)
- Modify: `openspec/changes/ads-brief-angle-briefs/` (proposal.md / tasks.md / design.md / specs/ads-brief-angles/spec.md — reconcile)

- [ ] **Step 1: Mark the old design spec superseded.** Add a top banner to `2026-07-12-ads-brief-angle-briefs-design.md`: `> **SUPERSEDED (2026-07-12) by 2026-07-12-ads-brief-first-production-design.md.** The tool facts (save_brief/list_briefs), produce-once, quality-loop, and Change-2 material carry forward; the copy-first order and the creative_brief router described here are replaced by the brief-first design.` Change its `Status:` line to `superseded`.

- [ ] **Step 2: Reconcile the openspec change.** In `openspec/changes/ads-brief-angle-briefs/`, update `proposal.md` + `tasks.md` + `specs/ads-brief-angles/spec.md` so the `ads-brief-angles` capability reflects brief-first: (a) `ssc-ads-brief` derives angles from concept + persona (no `approved(copy)` requirement, no `list_post_content`); (b) the downstream fixes list the new `/ssc.ads-brief` command + the `<ideaId> <briefId> [section]` producer signature rather than a `creative_brief` router edit. Keep produce-once + `save_brief` + Change-2. (If cleaner, note in `proposal.md` that this change now tracks the brief-first design and cross-link the new spec.)

- [ ] **Step 3: Verify no spec/openspec still describes the retired model.**
```bash
grep -rn "creative_brief\|approved(copy)\|update_idea" openspec/changes/ads-brief-angle-briefs docs/superpowers/specs/2026-07-12-ads-brief-angle-briefs-design.md
```
Expected: remaining matches only appear inside "superseded / retired" explanatory context, never as a live requirement.

- [ ] **Step 4: Commit.**
```bash
git add docs/superpowers/specs/2026-07-12-ads-brief-angle-briefs-design.md openspec/changes/ads-brief-angle-briefs
git commit -m "docs(spec): supersede briefs-from-copy design; reconcile ads-brief-angle-briefs to brief-first"
```

---

### Task 7: Final cross-surface consistency sweep

**Files:** (read-only verification across the plugin)

- [ ] **Step 1: No dangling `creative_brief` / retired-command / `get_brief` references anywhere in the shipped plugin.**
```bash
cd plugins/ssc-content
grep -rn "creative_brief" . && echo "FAIL: creative_brief still referenced" || echo "OK: no creative_brief"
grep -rn "get_brief\b" . && echo "FAIL: get_brief (nonexistent tool)" || echo "OK: no get_brief"
grep -rn "ssc.plan\b\|/ssc\.ads\b" . && echo "CHECK: ensure only in negations" || echo "OK: no retired-command refs"
```
Expected: `OK` on `creative_brief` and `get_brief`; any `ssc.plan`/`/ssc.ads` hit is only a "no … dependency" negation.

- [ ] **Step 2: Governance hook still behaves (unchanged, sanity check).**
```bash
echo '{"tool_name":"mcp__ssc__approve_idea","agent_id":"ssc-ads-writer"}' | node plugins/ssc-content/hooks/approval-gate.mjs   # → deny (subagent)
echo '{"tool_name":"mcp__ssc__approve_idea"}' | node plugins/ssc-content/hooks/approval-gate.mjs                                # → ask (main conversation)
```
Expected: `deny` then `ask` — the propose-only backstop is intact.

- [ ] **Step 3: Every tool referenced by the two skills exists on the allowed surface.**
```bash
cd plugins/ssc-content/skills
grep -h "tools:" ssc-ads-writer/SKILL.md ssc-ads-brief/SKILL.md
# Manually confirm each is one of: get_idea, get_channel_plan, list_post_content, get_knowledge, list_briefs, save_brief, save_post_content
```
Expected: no tool outside the allowed set; no `get_brief`, no `update_idea`, no `approve*`.

- [ ] **Step 4: (Optional) Local runtime smoke.** Reinstall the working tree and confirm both commands load:
```bash
claude plugin uninstall ssc-content@ssc-content-plugin
claude plugin install  ssc-content@ssc-content-plugin
# restart Claude Code; confirm /ssc.ads-brief and /ssc.ads-produce appear with the new descriptions
```
Expected: both commands present; `/ssc.ads-produce` shows the `<ideaId> <briefId> [section]` description.

- [ ] **Step 5: Commit any sweep fixes** (only if Steps 1-3 surfaced a stray reference).
```bash
git add -A && git commit -m "fix(ads): clean up stray brief-first cross-references"
```

## Self-Review

**Spec coverage:**
- D1 brief-first → Tasks 1-4 (end-to-end reorder). ✓
- D2 separate generation command → Task 2 (`/ssc.ads-brief`) + Task 4 (produce loses the router). ✓
- D3 copy from the single `briefId` only → Task 3 Steps 3-4. ✓
- D4 forced cascade (ads-brief drops copy gate) → Task 1. ✓
- D5 copy-first-within-production → Task 3 Step 4 (headline/description/image_content still lead from approved copy + the same brief). ✓
- New command surface, tool reality (`list_briefs`, no `get_brief`), Change-2 caveat, propose-only, CLAUDE.md, supersession/openspec → Tasks 2, 3, 5, 6. ✓
- Acceptance criteria in the spec map to the per-task `grep` verifications + Task 7 sweep. ✓

**Placeholder scan:** No "TBD/TODO"; each task names exact files, exact edits, and exact verification commands. The prose rewrites are specified by their required content + before/after anchors rather than pasted in full (this is a prose plugin, not code) — acceptable and non-blocking.

**Type/name consistency:** `briefId` (producer input) ↔ `list_briefs(idea_id)` row `id` filter (Task 3) — consistent. `tools:` lists consistent across Tasks 1/3 and verified in Task 7. Command names `/ssc.ads-brief` and `/ssc.ads-produce` consistent across Tasks 2/4/5. No `get_brief` anywhere (Global Constraints + Task 3/7 checks).
