# Design — `ssc-ads-brief` → 4-5 rated angle briefs

> **SUPERSEDED by `2026-07-12-ads-brief-first-production-design.md`.** This design put briefs *after* copy (copy-first, angles derived from approved copy) and reached `ssc-ads-brief` via a `creative_brief` router on `/ssc.ads-produce`. The successor inverts the order to **brief-first**: `ssc-ads-brief` runs FIRST (no copy gate; angles from concept + persona + build_spec) via the new `/ssc.ads-brief` command, and `/ssc.ads-produce <ideaId> <briefId> [section]` then produces copy anchored to the chosen approved brief. The tool facts (`save_brief`/`list_briefs`), produce-once, quality-loop, `angle_label`, and Change-2 material carry forward unchanged; only the order and the command routing are replaced.

- **Date:** 2026-07-12
- **Status:** superseded (see banner above)
- **Scope:** `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` (rewrite) + downstream references in `commands/ssc.ads-produce.md`, `skills/ssc-ads-writer/SKILL.md`, and root `CLAUDE.md`.

## Problem — two findings from the live server

While auditing the plugin's MCP tool references against the live BrandOS surface, an
in-production `ssc-ads-brief` run surfaced that the skill's write step is **broken**,
and the operator asked to change the skill's behaviour. The live tool schemas
(pulled via the connected `ssc` MCP server) confirm both:

1. **`update_idea` no longer accepts the narrative brief fields.** Its schema now
   annotates every one of `hook_direction` / `core_message` / `why_now` /
   `story_moment` / `cta` (and `theme`) as **"NOT ACCEPTED — use save_brief /
   edit(entity='brief')"**. `update_idea` accepts only `title` / `score` /
   `comment`. The five narrative fields **moved out of the `ideas` row into a
   `briefs` table**. The current skill's Step 4 (`update_idea` with the five
   fields) therefore fails on every call. This is a real shipped bug, not just
   stale prose.

2. **The skill should produce 4-5 rated angle briefs**, not one direct-overwrite
   brief. The operator wants the creative brief to explore several distinct angles,
   each self-rated, each carrying its own angle label — mirroring how
   `ssc-ads-writer` / the ideate skills produce N rated variations.

### The new write surface (ground truth from the schemas)

- **`save_brief`** — inserts a brief for an idea. Fields: `idea_id` (required),
  `channel`, `hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`,
  `angle_label` (ads), `score`, `comment`. **Always created as `draft`** — the tool
  cannot mint an approved brief and takes no `status` argument. Requires the `edit`
  capability. Narrative prose Vietnamese.
- **`list_briefs(idea)`** — read-only (`view`); lists an idea's briefs.
- **`approve(entity='brief')`** — the ONLY promotion; requires the `approve`
  capability; **operator-only, skill never calls it**.
- **`edit(entity='brief', …)`** — patches a brief; a demoting patch needs `approve`.
  Not used by this skill under the produce-once model.

## The Change-2 dependency (documented, not hidden)

Two schema annotations pin the current server state:

- `save_brief.angle_label`: *"Angle name (ads, **Change 2**); **NULL this change**"*
- `list_briefs`: *"exactly **one row per idea this change**; N per angle once
  **Change 2** lands"*

So **today's server keeps exactly one brief per idea and nulls `angle_label`.**
Per-idea multi-brief + persisted angle labels is a future server change
("Change 2") that has not shipped. This skill is written for the **target
(Change-2) model**: it produces 4-5 briefs and sets `angle_label` on each. Until
Change 2 lands, the server collapses the 4-5 `save_brief` calls to a single
persisted brief with a null `angle_label`, and the produce-once guard (below)
trips on the next run. The skill still runs correctly; the multi-angle payoff is
**inert until Change 2** — the same pattern the video skills use for the
not-yet-shipped `generate_*` tools. This is stated plainly in the skill body and
here, never assumed silently.

Setting `angle_label` on every angle is **forward-compatible**: passing it is
harmless today (the server nulls it) and correct the moment Change 2 lands, so the
skill never needs a second edit when the server catches up.

## Locked decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Quality control | Score each angle 1-5 + one-line Vietnamese comment; drop + regenerate any ≤3 until the set is all ≥4 (mirrors `ssc-ads-writer`). |
| Re-run semantics | **Produce-once, then stop.** No briefs exist → produce the rated set. Briefs already exist → STOP; operator curates/approves/discards in the dashboard. Never append, never silently overwrite. |
| Angle basis | Each angle anchors to a **distinct** ranked trigger point / stated objection / myth from the persona detail doc, realized through whichever approved copy best expresses it. Count 4-5, capped by how many distinct angles the concept genuinely supports (never pad). |
| Angle label | **Mandatory on every angle** — a short, distinct Vietnamese `angle_label` naming that angle's trigger/objection/myth. Always passed to `save_brief`. |

## New skill design

### Identity
From **"creative-brief revisor"** (recompute one idea-row brief per run via
`update_idea`, direct overwrite, no draft/approve state) → **"creative-brief angle
generator"**: produce **4-5 distinct, rated, draft angle briefs once**, then stop.
Save-and-stop shape identical to `ssc-ads-writer`.

### Frontmatter `tools:`
`[get_idea, get_channel_plan, list_post_content, get_knowledge, list_briefs, save_brief]`
— **drop** `update_idea`; **add** `list_briefs` + `save_brief`. No `edit`, no `approve`.

### Procedure
1. **Resolve the approved concept** (`get_idea`) — gate `status='approved'` and
   `channel='ad'`; resolve the persona detail-doc path (`brand/persona-<slug>`).
   *Drop the `idea.version` hold* — no longer needed without `update_idea`.
2. **Resolve the ad-set `build_spec`** (`get_channel_plan`, ad, period) — for each
   angle's `why_now` audience-stage/timing rationale. Proceed without it if the
   slot is unresolved (note in summary). Unchanged from today.
3. **Load the persona detail doc** (`get_knowledge`) — now the *primary* angle
   source: its ranked trigger points, objections, and myths. If no persona tag,
   derive without persona grounding and note it.
4. **Gate — require `approved(copy)`** (`list_post_content`) — STOP otherwise
   (existing copy-approval message). Hold every approved `copy` (≥1),
   `headline`, `description`, `image_content` row. Unchanged from today.
5. **Produce-once guard** (NEW) — `list_briefs(idea)`. If it returns ≥1 brief,
   **STOP** and tell the operator briefs already exist: curate / approve / discard
   angles in `/ad/[month]/[id]`; to regenerate, discard all first, then re-invoke.
   Never append.
6. **Select 4-5 distinct angles** — each anchored to a *different* trigger /
   objection / myth from the persona doc (Step 3), realized through whichever
   approved copy (Step 4) best expresses it. Cap at the number of angles the
   concept genuinely supports — if only N < 4 are real, produce N and say so
   (never fabricate a padding angle).
7. **Per angle, derive:**
   - the five narrative fields — `hook_direction`, `core_message`, `why_now`,
     `story_moment`, `cta` — angled to that angle's trigger, grounded in
     `title`/`tags`/`ad_notes` + `build_spec` + persona doc + live approved bodies
     (same derivation rules as the current Step 3, applied per angle);
     `story_moment` = the exact line `Không áp dụng — concept không thuộc dạng kể
     chuyện.` when that angle is not story-led;
   - a **mandatory** `angle_label` — short, distinct Vietnamese name for the angle;
   - a `score` (1-5) + one-line Vietnamese `comment`.
8. **Quality gate** (the drop/regen loop of `ssc-ads-writer`, scored on
   brief-relevant criteria) — self-score each angle 1-5 on **distinctiveness**
   (genuinely different trigger/objection/myth from the other angles),
   **grounding** (traceable to the persona doc + approved copy, nothing
   fabricated), **strategic sharpness**, and **authenticity** (Kiều My's
   woman-to-woman voice); drop + regenerate any ≤3 until the set (4-5, or the
   capped count) is all ≥4. No separate banned-words/compliance tool scan: a brief
   is an internal handoff artifact with no compliance gate, and every angle is
   realized through copy the writer already cleared and the operator already
   approved — compliance is inherited, not re-litigated here.
9. **Save each passing angle as a DRAFT brief**:
   `save_brief(idea_id, channel='ad', angle_label, hook_direction, core_message,
   why_now, story_moment, cta, score, comment)`. **STOP.** No `approve`, no
   `edit`-demote, no `update_idea`, no publish/schedule.
10. **Output summary** — a table of the N angles (`angle_label` · `score` · a
    one-line digest of each field), the grounding context, and the next step:
    the operator reviews and **approves one** (or curates) in `/ad/[month]/[id]`.

### Governance (invariant preserved)
Propose-only. `save_brief` mints only DRAFT briefs (cannot create an approved one,
takes no `status`). The skill **never** calls `approve` (any entity, incl. `brief`
— the ONLY gated promotion, denied to agents by the approval hook), never uses
`edit` to demote/discard, never calls `update_idea` for the narrative fields (the
server rejects them anyway), never publishes/schedules, never flips a gate. The
copy-approval gate (Step 4) and the produce-once guard (Step 5) live entirely in
this skill. `theme` is gone from the schema entirely — never derived or passed.
All persisted prose Vietnamese.

## Downstream fixes (same change)
- **`commands/ssc.ads-produce.md`** — the `description` frontmatter, plus the body
  paragraphs at ~L38 and ~L44, describe the retired model ("revises the idea's own
  five creative-brief fields … no draft/approve step, direct overwrite each run via
  the generic `update_idea` tool"). Rewrite to: "produces **4-5 rated draft angle
  briefs** via `save_brief`; the operator approves one in the dashboard." Keep the
  router logic (`section=='creative_brief'` → `ssc-ads-brief`) and the propose-only
  language, but correct the write mechanics.
- **`skills/ssc-ads-writer/SKILL.md`** — align any sibling mention of what
  `ssc-ads-brief` does (verify and correct if it repeats the `update_idea` story).
- **Root `CLAUDE.md`** — the pipelines table row for `ads-produce` describes
  `ssc-ads-brief` as revising "the idea's creative-brief fields … direct overwrite";
  update that one-liner to the multi-angle draft-brief model.

## Out of scope
- Server-side Change 2 itself (angle_label persistence, N-briefs-per-idea) — not in
  this repo; this change is the client written ahead of it.
- Any revise/refresh-existing-briefs flow (explicitly rejected — produce-once).
- `approve(entity='brief')` wiring — operator/dashboard action, never in a skill.
- `ssc-post-ideate`'s `update_idea` usage — it passes only `title`/`score`/`comment`
  (still accepted), so it is unaffected; do not touch it.

## Risks / notes
- **Inert-until-Change-2:** on today's server the skill's visible payoff is one
  brief, not 4-5. Accepted and documented; the operator opted to ship the client
  ahead of the server.
- **Duplicate briefs if the guard is skipped:** the produce-once guard is the only
  thing preventing brief pile-up once Change 2 allows N-per-idea. It must run before
  any `save_brief`.

## Acceptance criteria
- `ssc-ads-brief` no longer references `update_idea` anywhere (frontmatter or body).
- Frontmatter `tools:` = `[get_idea, get_channel_plan, list_post_content,
  get_knowledge, list_briefs, save_brief]`.
- The skill produces up to 5 rated angles, each with a mandatory `angle_label`,
  saved as draft briefs via `save_brief`, then stops.
- The produce-once guard (`list_briefs`) precedes any write.
- No `approve` / `edit`-demote / publish / gate-flip anywhere in the skill.
- `commands/ssc.ads-produce.md` and `CLAUDE.md` no longer describe the
  `update_idea` / direct-overwrite / no-draft-approve model.
- Every MCP tool the rewritten skill references exists on the live BrandOS surface.
