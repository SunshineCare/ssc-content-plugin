# Design — brief-first ads production (`/ssc.ads-produce <ideaId> <briefId> [section]`)

- **Date:** 2026-07-12
- **Status:** approved (brainstorm), pending implementation-plan
- **Supersedes:** `2026-07-12-ads-brief-angle-briefs-design.md` (briefs-*from*-copy) and the
  in-flight `openspec/changes/ads-brief-angle-briefs/` — both encode the copy-first
  order this design inverts. See **Supersession** below.
- **Scope:**
  - `plugins/ssc-content/commands/ssc.ads-produce.md` (rewrite — new signature, drop the `creative_brief` router)
  - `plugins/ssc-content/commands/ssc.ads-brief.md` (**new** — the brief-generation entry point)
  - `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` (rewrite — require + anchor to one brief)
  - `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` (rewrite — drop the copy-approval gate; derive angles from concept + persona)
  - root `CLAUDE.md` (pipelines table row for `ads-produce`)

## Problem / motivation

The operator asked to revise `/ssc.ads-produce` to take **`ideaId briefId [section]`** — i.e.
production is driven by a **chosen angle brief**, not by copy. Today the order is inverted:
`ssc-ads-writer` produces `copy` cold (no brief), the operator approves it, and only then does
`ssc-ads-brief` derive angle briefs *from* the approved copy. A required `briefId` on the
producer means the brief must exist **before** copy — the opposite order.

This is a real reorder (a **brief-first** pipeline), not a cosmetic argument change, and it forces
a cascade (see **The deadlock** below).

## Locked decisions (from brainstorming)

| # | Decision | Choice |
|---|---|---|
| D1 | Production flow | **Brief-first.** Angle briefs are generated first (from the concept + persona, before any copy). The operator approves ONE. Production is then anchored to that chosen angle brief. |
| D2 | Command surface | **Separate generation from production.** `/ssc.ads-produce` becomes a pure producer that always requires `ideaId` + `briefId`. Brief generation moves to a **new `/ssc.ads-brief <ideaId>`** command. `/ssc.ads-produce` loses its `creative_brief` route. |
| D3 | Copy grounding | `copy` is written from **only the single brief named by `briefId`** — never pooled across all of the idea's briefs. |
| D4 | Cascade (forced) | `ssc-ads-brief` **drops its copy-approval gate** and derives angles from `title`/`tags`/`ad_notes` + `build_spec` + the persona detail doc (not from approved copy). Required for coherence — see below. |
| D5 | Within-production order | `copy` stays the first sub-step of production (now seeded by the brief); `headline`/`description`/`image_content` build on the **approved copy + the same single brief**. |

### The deadlock (why D4 is mandatory, not optional)

Brief-first production requires an **approved brief before copy**. If brief generation still
required approved copy (today's `ssc-ads-brief` Step 4 gate), then: production needs a brief →
brief needs copy → copy needs a brief. Nothing can start. So `ssc-ads-brief` **must** invert to
derive angles from the concept + persona (D4). This is a consequence of D1, not a separate choice.

## New command surface

| Command | Signature | Dispatches | Purpose |
|---|---|---|---|
| `/ssc.ads-brief` *(new)* | `<ideaId>` | `ssc-ads-brief` | Generate 4-5 rated **DRAFT** angle briefs from the concept + persona + `build_spec` (no copy required). |
| `/ssc.ads-produce` *(rewrite)* | `<ideaId> <briefId> [section]` | `ssc-ads-writer` **only** | Produce ad text anchored to the operator's chosen **approved** angle brief. |

- `/ssc.ads-produce` **no longer routes on `section=='creative_brief'`** — that value is retired
  from this command. `ideaId` and `briefId` are both **required**; `section` is optional
  (`headline` | `description` | `image_content`, auto-picked among those without an approved row,
  exactly as today). If `briefId` is missing, the command asks for it (one question) — it never
  invents one.
- `/ssc.ads-brief` is a thin entry point (`ideaId` only, `date` optional to resolve the concept),
  mirroring the other thin commands.

## End-to-end flow

```
/ssc.ads-brief <ideaId>
   → ssc-ads-brief: 4-5 DRAFT angle briefs (concept + persona + build_spec; NO copy gate)
   → operator reviews + APPROVES ONE angle in /ad/[month]/[id]  → briefId

/ssc.ads-produce <ideaId> <briefId>
   → ssc-ads-writer: copy anchored to THAT brief (D3)  → operator approves ≥1 copy

/ssc.ads-produce <ideaId> <briefId> headline      → anchored to brief + approved copy
/ssc.ads-produce <ideaId> <briefId> description    → "
/ssc.ads-produce <ideaId> <briefId> image_content  → "
```

## `ssc-ads-writer` changes

- **Inputs:** **required `idea_id` + required `briefId`** (the operator's chosen approved angle),
  optional `section` + `n_*` counts. **Drop the `date` selector on the producer** — `briefId` is
  idea-scoped, so a `date` (which can resolve several concepts) is ambiguous here; the producer
  always takes an explicit `idea_id`. (`date` remains available on `/ssc.ads-brief` for generation.)
- **Read the brief (no `get_brief` tool exists):** call **`list_briefs(idea_id)`** and select the
  **single** row where `id == briefId`. Add `list_briefs` to the frontmatter `tools:`.
- **Gate (new, propose-only aligned):** the selected brief MUST exist for this `idea_id` and be
  **`status == 'approved'`**. If it is missing → STOP ("brief not found for this concept"); if it
  is still a draft → STOP ("approve one angle brief in `/ad/[month]/[id]` first, then re-invoke").
- **Grounding (D3/D5):**
  - `copy` — the cold-start section — is now grounded in the **single chosen brief's** five
    narrative fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`) +
    `angle_label`, together with `title`/`tags`/`ad_notes` + `build_spec` + KB. It is **no longer**
    "no earlier input," and it uses **only** that one brief (never all briefs).
  - `headline`/`description`/`image_content` still lead from the **live approved `copy`** (source
    of truth) and additionally hold the **same single brief** as the angle anchor, so every section
    expresses the one approved angle consistently.
- **Everything else unchanged:** state-driven per-section stepping, the Hook Formula Bank, the
  quality gate (Direct-Response + banned-words/compliance/authenticity), `save_post_content` DRAFT
  save-and-stop, propose-only.

## `ssc-ads-brief` changes

- **Drop the copy-approval gate** (today's Step 4 "require `approved(copy)`"). Briefs are now the
  **first** step and cannot depend on copy.
- **Angle source becomes the concept + persona, not approved copy:** derive the 4-5 distinct angles
  from `title` / `tags` / `ad_notes` + `build_spec` + the persona detail doc's ranked
  trigger points / objections / myths. Drop the "realized through whichever approved copy best
  expresses it" grounding (there is no copy yet).
- **Keep:** the produce-once guard (`list_briefs` before any write), the quality loop (score 1-5,
  drop + regenerate ≤3 until all ≥4), the mandatory Vietnamese `angle_label`, `save_brief` DRAFT
  save-and-stop, and propose-only.
- Frontmatter `tools:` — `list_post_content` is **no longer needed for the copy gate**; keep it
  only if the body still reads existing sections for context (decide during implementation; default
  is to remove it since angles no longer derive from copy).

## Root `CLAUDE.md`

Update the Ads (produce) pipeline row: `ads-produce` is now `ssc-ads-writer` only
(`<ideaId> <briefId> [section]`, brief-anchored); brief generation is the separate `/ssc.ads-brief`
→ `ssc-ads-brief` step that runs **first**.

## Tool reality & the Change-2 caveat (documented, not hidden)

- **No `get_brief`.** The writer reads its one brief via `list_briefs(idea_id)` + filter on `id`.
- **Change 2 not shipped.** The live server keeps **exactly one brief per idea** and **nulls
  `angle_label`** (`save_brief.angle_label` = "NULL this change"; `list_briefs` = "one row per idea
  this change"). So today: `ssc-ads-brief` collapses its 4-5 angles to a single persisted brief, and
  the writer's `briefId` filter resolves that one brief. The multi-angle *choice* is **inert until
  Change 2** — forward-compatible, same pattern the video skills use for not-yet-shipped tools. The
  brief-first plumbing itself works today (one brief exists → the writer anchors to it).

## Governance (invariant preserved)

Propose-only throughout. `ssc-ads-brief` mints only DRAFT briefs (`save_brief` takes no `status`);
`ssc-ads-writer` saves only DRAFT `content` rows. Neither skill nor command ever calls `approve`
(any entity, incl. `brief` — the ONLY gated promotion, denied to agents by the approval hook), never
uses `edit` to demote/discard, never publishes/schedules, never flips a gate, never edits/deletes a
row. Approving the chosen angle brief and every content row is the operator's dashboard action. All
persisted prose is Vietnamese.

## Supersession / reconciliation

- `2026-07-12-ads-brief-angle-briefs-design.md` (briefs-from-copy, produce-once via the
  `creative_brief` router) is **superseded** by this design. Its `save_brief`/`list_briefs` tool
  facts and the produce-once + quality-loop + Change-2 material remain valid and carry forward; only
  the **order** (copy-first → brief-first) and the **command routing** change.
- `openspec/changes/ads-brief-angle-briefs/` — reconcile: its "Rewrite `ssc-ads-brief`" and
  downstream-fix tasks are still needed, but the copy-approval-gate requirement is replaced by the
  concept+persona derivation, and the `commands/ssc.ads-produce.md` edit becomes a rewrite + the new
  `ssc.ads-brief.md` command. Decide during implementation whether to amend that change in place or
  fold it into a new one.

## Out of scope

- Server-side Change 2 (angle_label persistence, N-briefs-per-idea) — not in this repo.
- Any revise/refresh-existing-briefs flow — still explicitly rejected (produce-once).
- `approve(entity='brief')` wiring — operator/dashboard action, never in a skill.
- The Ads *planning* pipeline (`/ssc.ads-plan`: Focus → Approaches → Blueprint → Ideate) and
  `/ssc.ads-image` — untouched.

## Acceptance criteria

- `/ssc.ads-produce` takes `<ideaId> <briefId> [section]`, requires both ids, dispatches
  `ssc-ads-writer` only, and no longer mentions or routes a `creative_brief` section.
- A new `/ssc.ads-brief <ideaId>` command dispatches `ssc-ads-brief`.
- `ssc-ads-writer` requires `briefId`, reads exactly the one brief via `list_briefs` + `id` filter,
  STOPs unless it is an `approved` brief for the concept, and grounds `copy` in **only** that brief;
  `list_briefs` is in its `tools:`.
- `ssc-ads-brief` no longer gates on approved copy and derives angles from concept + persona +
  `build_spec`; produce-once guard, quality loop, `angle_label`, and `save_brief` are retained.
- Root `CLAUDE.md` pipelines table reflects brief-first (`/ssc.ads-brief` first, then
  `/ssc.ads-produce <ideaId> <briefId> [section]`).
- Every MCP tool referenced exists on the live BrandOS surface (`get_idea`, `get_channel_plan`,
  `list_post_content`, `get_knowledge`, `list_briefs`, `save_brief`, `save_post_content`).
- Propose-only invariant intact: no `approve` / `edit`-demote / publish / gate-flip anywhere.
- `2026-07-12-ads-brief-angle-briefs-design.md` marked superseded; the `ads-brief-angle-briefs`
  openspec change reconciled.
