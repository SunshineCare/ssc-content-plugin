# Design: stepped, approval-gated, text-only ad production (`ssc.ads-produce`)

**Date:** 2026-07-03
**Status:** approved (design), pending implementation plan
**Builds on:** 2026-07-03-ads-produce-usp-foregrounding-design.md (the USP/proof foregrounding in `ssc-ads-writer` is carried forward here, not dropped)

## Problem

`/ssc.ads-produce` today produces ALL text sections (headline + copy + description) **and** images in one pass, each producer presenting a candidate set in chat and saving on an in-chat go-ahead. The operator wants a different workflow:

1. Produce **text only** — headline, then copies, then descriptions. No images.
2. **Save each section to the BrandOS MCP server** instead of presenting it in chat.
3. Run **one section at a time**; the operator reviews / edits / **approves** that section **in the dashboard**.
4. Run the **next** section only after the previous one is approved, and **use the approved output of previous sections as input** to the next.

This reverses the current "human checkpoint BEFORE persistence (never autosave)" hard rule — the new model persists drafts first, and the human review/edit/approve happens in the dashboard.

Separately (operator note during design): the current *installed* writer "still does not create USP and proof points." That is expected — the USP foregrounding lives on an unmerged branch and the installed plugin is the old writer (`plugin update` is a no-op on a same-version edit). This redesign makes USP/proof foregrounding an explicit requirement of the rewritten writer, and the rollout section requires a reinstall to observe it.

## Goals

1. `/ssc.ads-produce <idea_id>` becomes **text-only** and dispatches only the revised `ssc-ads-writer`.
2. The writer is **state-driven**: each invocation runs the single **next open section-step** for the resolved concept and stops.
3. Section ordering is a strict **approval chain**: `headline → copy → description`; a section runs only when all earlier sections have ≥1 **approved** row.
4. Each step **saves drafts to the server** (`save_post_content`) and stops — **no in-chat present/pause/revise loop**.
5. Later steps **read the approved earlier-section bodies** (via `list_post_content`) and use them as input, alongside the concept brief + `build_spec` + KB.
6. The self-scoring quality loop is **kept** (score 1–5 + Vietnamese comment, drop/regenerate ≤3, save only ≥4).
7. **USP + proof foregrounding is preserved** in every section (load `brand/positioning` + `brand/proof-points`; press ≥1 concrete advantage; the "Presses a real advantage" gate line).
8. `ssc-ads-creative` is **removed entirely** with zero dangling references.
9. All existing invariants hold: **propose-only** (never `approve_*`/`unapprove_*`/`update_status`/publish), Vietnamese persisted prose, one concept per run.

## Non-goals

- **No images.** No image production, no Playwright, no `upload_creative`, no `section='image'` from this flow.
- **No in-chat review/revise loop.** Editing a draft is a dashboard action; the skill never revises in chat and (per the tool change below) no longer edits/deletes rows in place.
- **No auto-regenerate** when a section already has unapproved drafts (see §"Re-invocation rule").
- **No orchestrator agent.** Sequencing lives in the revised `ssc-ads-writer` skill; `/ssc.ads-produce` dispatches it directly (the documented direct-dispatch exception).
- **No new server tools.** Uses only the existing BrandOS surface.

## Design

### Control flow — the section state machine

On each run the writer resolves the approved concept (by `idea_id`, or by `date` → one concept), then calls `list_post_content(idea_id)` once and derives per-section approval (`approved` = ≥1 row with that `section` and `status='approved'`; `has_drafts` = ≥1 row with that `section` at `status='draft'`). It then executes the **first** matching rule and STOPS:

| Condition | Action |
|---|---|
| concept `status !== 'approved'` | STOP — tell operator to approve the concept first |
| `headline` not approved AND `headline` has drafts | STOP — "headlines saved as drafts; review/edit/approve ≥1 in the dashboard, then re-run" |
| `headline` not approved AND no headline drafts | produce **headlines** → save → STOP |
| `headline` approved, `copy` not approved, `copy` has drafts | STOP — "approve ≥1 copy, then re-run" |
| `headline` approved, `copy` not approved, no copy drafts | produce **copies** (input: approved headlines) → save → STOP |
| `headline`+`copy` approved, `description` not approved, `description` has drafts | STOP — "approve ≥1 description, then re-run" |
| `headline`+`copy` approved, `description` not approved, no description drafts | produce **descriptions** (input: approved headlines + copies) → save → STOP |
| all three approved | STOP — "production complete for this concept" |

This is state-driven **re-invocation**: the operator re-runs `/ssc.ads-produce <idea_id>` after approving each section in the dashboard.

### Re-invocation rule (unapproved drafts present)

When the next section already has draft rows but none approved, the writer STOPS and asks the operator to approve/edit in the dashboard — it does **not** produce a second batch. (Rejected alternatives: append a fresh batch each run → drafts pile up; delete-own-drafts-and-regenerate → needs a delete tool and risks clobbering operator edits. If a fresh batch is ever wanted, the operator clears the drafts in the dashboard and re-runs.)

### Input chaining

- **Headlines:** grounded in the concept brief (title, `value`/`frame`/`persona`/layer, `against`), `build_spec`, and KB.
- **Copies:** additionally read the **approved** `headline` bodies (via `list_post_content`, filtered `section='headline'`, `status='approved'`) — the live approved rows, so any dashboard edits are reflected — and lead with / complement those winning hooks.
- **Descriptions:** additionally read the approved `headline` **and** `copy` bodies.

Counts unchanged: **4** headlines, **3** copies, **3** descriptions — each a set informed by *all* approved prior-section bodies (not one variation per approved headline).

### Save-to-server, not present-in-chat

After the quality loop leaves N variations rated ≥4 for the active section, the writer **immediately** inserts each via `save_post_content(channel='ad', idea_id, section, body, score, comment)` and stops. There is no in-chat candidate presentation, pause, or revise loop. Review / edit / **approve** is entirely a dashboard action at `/ad/[month]/[id]`. This **replaces** the prior "human checkpoint before persistence" rule while remaining **propose-only**: the writer saves `status='draft'` rows, reads approval status to gate, and never calls any approval/lifecycle/publish tool.

### USP + proof foregrounding (carried forward)

The rewritten writer keeps the foregrounding from the USP spec: Step 2 loads `brand/positioning` + `brand/proof-points`; drafting presses ≥1 concrete Cambridge advantage and, when the concept carries an `against` tag, lands that match-up; the Step 5 Direct-Response checklist keeps the "Presses a real advantage" line (a flat variation cannot score ≥4). This applies to whichever section is being produced.

### Tool surface change (`ssc-ads-writer` frontmatter `tools:`)

- **Add** `list_post_content` — read approvals + prior-section bodies (read-only, `view`).
- **Remove** `edit_content`, `delete_content` — the new flow never revises/deletes in place; the operator edits in the dashboard.
- **Keep** `get_knowledge`, `get_idea`, `get_channel_plan`, `save_post_content`.

Net: strictly tighter write surface (two write tools dropped, one read tool added). Every listed tool exists on the BrandOS surface.

### Removing `ssc-ads-creative` (blast radius)

- **Delete** `plugins/ssc-content/skills/ssc-ads-creative/` (whole directory).
- **`commands/ssc.ads-produce.md`** — rewrite to the text-only stepped flow: drop the description's `ssc-ads-creative (images)` mention (L2), the entire **Creative** step (L33), the "run the writer then the creative" + `edit_content`/`delete_content` prose (L35), and the image/curate wording (L43).
- **`skills/ssc-ads-writer/SKILL.md`** — the two dangling refs (L273 "that's `ssc-ads-creative`"; L316 "Then run `ssc-ads-creative`…") are removed by the rewrite.
- **`CLAUDE.md`** (plugin) — L44 (`ssc-ads-creative` direct-dispatch mention), the pipeline table L61 (`ads-writer (text) + ads-creative (images)` → text-only stepped), and the skill count L26 (`34 ×` → `33 ×`).
- **Manifests** — no change (skills are directory-discovered; no `creative` reference in `plugin.json`/`.mcp.json`/marketplace).

### Files touched

| File | Change |
|---|---|
| `skills/ssc-ads-writer/SKILL.md` | Rewrite: state-driven section stepper, save-to-server, input chaining, keep quality loop + USP foregrounding, `tools:` change, remove creative refs |
| `commands/ssc.ads-produce.md` | Rewrite → text-only single-dispatch stepped flow |
| `skills/ssc-ads-creative/**` | Delete |
| `CLAUDE.md` | Skill count 34→33, pipeline table, L44 mention |

The `docs/superpowers/**` files from the USP work are the historical record and are left untouched.

## Coordination note (concurrent working tree)

During this session the operator committed `09aad90 "add reference"` onto the branch and **staged** several files (`CLAUDE.md`, `README.md`, `plugin.json`, `.mcp.json`, a harness spec). `CLAUDE.md` is one of the files this redesign edits and is currently staged by the operator. Implementation must commit **path-scoped** (`git commit -- <path>`), and the `CLAUDE.md` edit will layer on top of the operator's staged content — surface this in the plan so the operator can confirm the combined `CLAUDE.md` at review.

## Verification (no automated suite in this repo)

Structural, per the harness-less repo:

1. **State machine present** — the writer's procedure enumerates the section chain and the "unapproved drafts → stop" rule; `list_post_content` is called to derive approval state.
2. **Tool surface** — `list_post_content` added; `edit_content` + `delete_content` removed; no `approve_*`/`unapprove_*`/`update_status`/publish anywhere (`grep` guard).
3. **USP preserved** — `brand/positioning` + `brand/proof-points` still in the Step 2 load list; "Presses a real advantage" gate line present.
4. **Images gone** — no `image`/`upload_creative`/`playwright`/`screenshot` in the produce command or writer; `ssc-ads-creative` directory absent; **zero** `ads-creative` references remain in live files (`grep` = 0).
5. **Doc counts** — `CLAUDE.md` skill count reads 33; pipeline table shows the text-only stepped flow.
6. **Rollout** — reinstall (uninstall + reinstall) and restart Claude Code; then run `/ssc.ads-produce <idea_id>` and confirm it produces headlines, saves drafts, and stops.

## Open questions

None. The four architecture decisions (re-invoke per step; logic in the writer skill; keep the quality loop; remove `ads-creative` entirely) and the two micro-decisions (stop-on-unapproved-drafts; drop edit/delete tools) were resolved during brainstorming.
