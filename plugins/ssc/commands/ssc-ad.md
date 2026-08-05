---
argument-hint: '<brief_id> [copy|headline|description]'
description: >-
  Produces ad TEXT for ONE approved angle brief (`<brief_id> [section]`) — copy first,
  then headline and description, each gated only on approved copy. `brief_id` is the
  sole input: the writer resolves the owning concept from it via get_brief, and every
  saved row is brief-keyed. It self-scores, saves the passing drafts, and stops.
  Propose-only — it never approves.
metadata:
  dispatches: [ssc-ads-writer]
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input — **required**:

- **Angle brief ID** (`brief_id`) — the id of the operator's **chosen approved angle brief** (produced first by `/ssc-ads-brief`, approved in the dashboard) — the **only key** this command needs. The writer resolves it via `get_brief(brief_id)`, which returns the brief **and its owning ad concept** (the `ideas` row, `channel='ad'`, `status='approved'`) in one call — so there is **no separate `idea_id` input**. Every section is anchored to this one brief.

If `brief_id` is missing, ask the operator for it (one question) before dispatching — do not invent one. There is **no `date` selector**: a `brief_id` names the concept and the angle at once.

Optional:

- **Section** (`section`) — one of `copy` | `headline` | `description` (`/ssc-ad <brief_id> copy`, `… headline`, …). Names what to produce/revise this invocation. **All three are valid explicit values and an explicit name always wins over the auto-pick** — naming **`copy`** targets `copy` **including when a copy is already approved**, which is how you get a fresh batch of copy variations after the first approval (non-destructive: the write path only INSERTS drafts). Omit to auto-pick the next open text section (`copy` first if not yet approved, else the first of `headline → description` without an approved row). `copy` remains the mandatory **cold start** — before it is approved, no other section can be produced whatever this argument says.
- **`image_content` is a routing STOP, never a silent redirect.** Named explicitly as the section, it STOPs (Vietnamese) naming **`/ssc-image-prompt <brief_id> text`** — the ImageStudio's Text step authors the on-image copy, fitted to the visual it will sit on. The writer produces no other section in its place and writes nothing.
- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The writer resolves everything from the `brief_id` (`get_brief` returns the owning idea).

This command is the **text-production half** of the Ads pipeline. It runs **after** `/ssc-ads-brief` has produced angle briefs and the operator has **approved one** (which yields the `brief_id`). It operates **per concept** and **per section**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`). There is **no** `/ssc-ads-plan` precondition beyond an approved concept and an approved angle brief.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches **`ssc-ads-writer`** (`brief_id`, optional `section` passthrough) and stops. Brief generation is the separate `/ssc-ads-brief` command, run **first**, before any copy.

`ssc-ads-writer` is a **state-driven, per-section stepper anchored to the one chosen approved angle brief**: `copy` is the mandatory cold-start section, grounded in **only** that brief (its `hook_direction`/`core_message`/`why_now`/`story_moment`/`cta` + `angle_label`) and held to the owning concept's **hero** when one is set — the idea-wide north-star sentence `/ssc-ads-brief` defines before any angle exists, which `get_brief` returns alongside the brief; a copy variation that centers a different product/feature/pain-point than the hero names is capped ≤3 and rewritten. A concept with no hero (a legacy one, or one whose hero was cleared) is not an error — the writer proceeds on the brief's own fields and never invents one; once `copy` has ≥1 approved row, `headline` and `description` are each **independently** producible — gated only on `copy` being approved, never on each other — and each may be **re-invoked after its own approval** for a fresh revision. On each invocation it works ONE target section (named via `section`, or auto-picked among those without an approved row) and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Resolves the ONE approved brief + its owning concept via `get_brief(brief_id)` as the angle anchor; reads `list_content(brief=brief_id)`. If `copy` isn't approved yet, produces it (cold start, from that brief). Otherwise resolves the target section (named, or auto-picked among headline/description without an approved row) and produces N Vietnamese variations for THAT section only, grounded in whichever of copy/headline/description is currently approved **plus the same brief** — pressing Cambridge proof points sized to format (each copy weaves in ≥3 distinct; a headline/description carries 1–2 and the section's set covers ≥3) from brand/positioning + brand/proof-points — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the passing (≥4-rated) drafts to the server** via `save_content` (`channel='ad'`, `brief_id`, `section` — content is brief-keyed, so `brief_id` is required and there is no `idea_id`) — **every saved row records the `brief_id` of the angle it was written from**, in all three sections — and **stops**. | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc-ad <brief_id> [section]`** — for any other freed section, or the same one again for a fresh revision. |

**Each freed section derives from the approved copy — all inside the one chosen angle.**
`headline` distils the approved copies; `description` compresses those same copies,
complementing an approved headline when one exists.

**This flow renders no pictures and holds no image step** — it produces the ad's TEXT sections only; the visual chain and the copy that sits on the image are the ImageStudio's, authored by `/ssc-image-prompt <brief_id>`. Each targeted section **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the target section already has unapproved drafts, the writer stops and asks the operator to approve/reject them first (it does not pile up a second batch).

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. The writer **saves DRAFTS** and stops: DRAFT `content` rows via `save_content`. The operator reviews / edits / approves `content` rows on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate and never touches an idea's `status`. Propose-only (hard rule): the writer never calls any tool that changes approval or lifecycle state in either direction — never `approve` (the ONLY gated promotion, denied to agents by the approval hook; any entity, any gate), never publish, and never `edit` used to demote/unapprove/discard a row (demotion is an `edit` now rather than a separate `unapprove_*` tool) — and it never edits or deletes a saved row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.

## After it runs

After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `brief_id`, naming any other freed section (`headline`/`description`, any order) or the same section again for a fresh revision. Once a copy is approved, the on-image copy and the visual are authored in the ImageStudio — `/ssc-image-prompt <brief_id>`. To work a **different** angle, approve a different brief in the dashboard and pass its `brief_id`. Angle briefs are produced **before** copy by `/ssc-ads-brief <idea_id>` — if you don't have a `brief_id` yet, run that first and approve one angle. Re-invoke per concept — it works ONE approved concept at a time.
