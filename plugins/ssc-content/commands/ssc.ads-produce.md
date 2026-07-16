---
description: Produce ad TEXT for ONE approved ad concept, anchored to the operator's chosen approved angle brief — a thin entry point. Dispatches ssc-ads-writer with a required brief_id and an optional section. ssc-ads-writer resolves the chosen approved brief AND its owning concept via get_brief (brief_id → { brief, idea }, so no separate idea_id input), then produces copy first (mandatory cold start, grounded in ONLY that one brief's five narrative fields + angle_label); once copy is approved, headline, description, and image_content are each independently producible — gated only on copy, not on each other, and re-invocable any time for a fresh revision — chosen via the optional section argument or auto-picked among those not yet approved. It self-scores + saves the passing (≥4-rated) drafts straight to the server, and stops. The operator reviews/edits/approves at /ad/[month]/[id], then re-runs this command for any other freed section in any order; headline distils the approved copies, description compresses those copies (complementing an approved headline when one exists), image_content builds on those copies plus headlines/descriptions when they exist — all inside the one chosen angle. Brief generation is the separate FIRST step /ssc.ads-brief <idea_id> (angle briefs are produced before any copy; the operator approves one to get the brief_id). Propose-only; the writer saves drafts, never approves.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input — **required**:

- **Angle brief ID** (`brief_id`) — the id of the operator's **chosen approved angle brief** (produced first by `/ssc.ads-brief`, approved in the dashboard) — the **only key** this command needs. The writer resolves it via `get_brief(brief_id)`, which returns the brief **and its owning ad concept** (the `ideas` row, `channel='ad'`, `status='approved'`) in one call — so there is **no separate `idea_id` input**. Every section is anchored to this one brief.

If `brief_id` is missing, ask the operator for it (one question) before dispatching — do not invent one. There is **no `date` selector**: a `brief_id` names the concept and the angle at once.

Optional:

- **Section** (`section`) — one of `headline` | `description` | `image_content`. Names what to produce/revise this invocation. Omit to auto-pick the next open text section (`copy` first if not yet approved, else the first of `headline → description → image_content` without an approved row). `copy` is always produced first (the mandatory cold start) regardless of this argument.
- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The writer resolves everything from the `brief_id` (`get_brief` returns the owning idea).

This command is the **text-production half** of the Ads pipeline. It runs **after** `/ssc.ads-brief` has produced angle briefs and the operator has **approved one** (which yields the `brief_id`). It operates **per concept** and **per section**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is **no** `/ssc.ads-plan` precondition beyond an approved concept and an approved angle brief.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches **`ssc-ads-writer`** (`brief_id`, optional `section` passthrough) and stops. It no longer routes to `ssc-ads-brief` — brief generation is the separate `/ssc.ads-brief` command, run **first**, before any copy.

`ssc-ads-writer` is a **state-driven, per-section stepper anchored to the one chosen approved angle brief**: `copy` is the mandatory cold-start section, grounded in **only** that brief (its `hook_direction`/`core_message`/`why_now`/`story_moment`/`cta` + `angle_label`); once `copy` has ≥1 approved row, `headline`, `description`, and `image_content` are each **independently** producible — gated only on `copy` being approved, never on each other — and each may be **re-invoked after its own approval** for a fresh revision. On each invocation it works ONE target section (named via `section`, or auto-picked among those without an approved row) and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Resolves the ONE approved brief + its owning concept via `get_brief(brief_id)` as the angle anchor; reads `list_content(brief=brief_id)`. If `copy` isn't approved yet, produces it (cold start, from that brief). Otherwise resolves the target section (named, or auto-picked among headline/description/image_content without an approved row) and produces N Vietnamese variations for THAT section only, grounded in whichever of copy/headline/description is currently approved **plus the same brief** — pressing Cambridge proof points sized to format (each copy weaves in ≥3 distinct; a headline/description carries 1–2 and the section's set covers ≥3) from brand/positioning + brand/proof-points — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the passing (≥4-rated) drafts to the server** via `save_content` (`channel='ad'`, `brief_id`, `section` — content is brief-keyed, so `brief_id` is required and there is no `idea_id`) — **every saved row records the `brief_id` of the angle it was written from**, in all four sections — and **stops**. | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc.ads-produce <brief_id> [section]`** — for any other freed section, or the same one again for a fresh revision. |

**This flow renders no pictures** — the `image_content` step is the on-image COPY as structured text (headline hook + USP/proof subheadline + 3 USP/proof bullets), saved under `section='image_content'` for the dashboard to render. Each targeted section **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the target section already has unapproved drafts, the writer stops and asks the operator to approve/reject them first (it does not pile up a second batch).

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. The writer **saves DRAFTS** and stops: DRAFT `content` rows via `save_content`. The operator reviews / edits / approves `content` rows on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate and never touches an idea's `status`. Propose-only (hard rule): the writer never calls any tool that changes approval or lifecycle state in either direction — never `approve` (the ONLY gated promotion, denied to agents by the approval hook; any entity, any gate), never publish, and never `edit` used to demote/unapprove/discard a row (demotion is an `edit` now rather than a separate `unapprove_*` tool) — and it never edits or deletes a saved row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.

## After it runs

After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `brief_id`, naming any other freed section (`headline`/`description`/`image_content`, any order) or the same section again for a fresh revision. To work a **different** angle, approve a different brief in the dashboard and pass its `brief_id`. Angle briefs are produced **before** copy by `/ssc.ads-brief <idea_id>` — if you don't have a `brief_id` yet, run that first and approve one angle. Re-invoke per concept — it works ONE approved concept at a time.
