---
description: Produce the ad VISUAL for ONE approved ad concept's chosen angle — a state-driven, per-layer stepper anchored to a brief. Dispatches ssc-image, which resolves the approved image_content VARIANT for the given brief_id (its image_content_id) and works the single next open layer in the chain background → model → product → composite (whichever is not yet approved), saving DRAFT creatives straight to the server, then stops. Grounds the visual in the brief + the variant's approved copy/headline/description/image_content. Runs AFTER the angle's image_content text section is approved. The operator reviews/approves the active layer in the dashboard, then re-runs this command for the next layer; the model is generated INTO the approved background, the product is upload-only, and the composite places the approved product into the approved scene. PHASE 1 wires only the ad channel (a non-ad idea stops cleanly). Propose-only; saves DRAFT creatives, never approves, sets a cover, or publishes.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **both required**:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`).
- **Angle brief ID** (`brief_id`) — the id of the operator's **chosen approved angle brief** for this concept (produced first by `/ssc.ads-brief`, approved in the dashboard). It selects the image_content variant and anchors the angle.

If `idea_id` or `brief_id` is missing, ask the operator for it (one question) before dispatching — do not invent one. There is **no `date` selector**: a `brief_id` is idea-scoped, so the producer always takes an explicit `idea_id`.

Optional:

- **Period** (`period`, `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`.
- **Layer hints** — `layout_hint` / `hard_paste` (composite), `model_hint` (model), `uploaded_media_id` + `uploaded_media_ref` (a real model, both together). Passed through to the matching layer.

This command is the **visual-production half** of the Ads pipeline. It runs once the angle's **`image_content` text section is approved** (`/ssc.ads-produce <idea_id> <brief_id> image_content` produces that text; the operator approves it). It operates **per concept**, **per angle (brief)**, and **per layer**, never on a whole plan: it reads **no** `channel_plan` gate flags. There is no `/ssc.ads-plan` precondition beyond an approved concept, an approved angle brief, and an approved `image_content` for that angle. **Phase 1 wires only the ad channel** — a non-ad idea stops cleanly (post/youtube image flows are a later phase).

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single visual producer **`ssc-image`** (`idea_id`, `brief_id`, optional hints passthrough) for the resolved concept, then stops. `ssc-image` is a **state-driven, per-layer stepper anchored to the chosen angle brief**: on each invocation it resolves the approved `image_content` variant for `brief_id` (its `image_content_id`), reads the variant's creatives grouped by `layer` + `status`, works the **single next open layer** in the chain **`background` → `model` → `product` → `composite`** (the first not yet approved), saves DRAFT creative(s) tagged with that layer, and **stops**.

| The skill does | Then the operator… |
|---|---|
| Confirms the concept is an approved ad idea, `brief_id` is an approved brief for it, AND that angle's `image_content` text is approved (stops with the exact unmet precondition otherwise). Resolves the `image_content_id`, reads the variant's creatives by `layer` + `status`, finds the first layer without an approved creative, and works only that one — grounding prompts in the brief + the variant's approved copy/headline/description/image_content: **background** (up to 4, default 3 negative-space-aware versions), **model** (exactly ONE candidate generated INTO the approved background, or a placed real model), **product** (upload-only — stops and asks the operator to upload + approve the real product), **composite** (2–3 variants placing the approved product into the approved background+model scene, optional `layout_hint`/`hard_paste`). Saves DRAFT creatives and **stops**. Each layer runs only when every earlier layer has an approved creative. | Opens `/ad/[month]/[id]`, **reviews / approves** (or, for the model layer, **discards**) the saved DRAFT creative for that layer, then **re-runs `/ssc.image <idea_id> <brief_id>`** — the skill detects the newly-approved layer and works the next one. |

**This flow bakes no text into any visual** — every layer leaves negative space for the separately-overlaid `image_content` text (the dashboard renders it; this command does not). The producer works **one layer per run**, reads **no** channel_plan gates, and **saves DRAFT creatives immediately** (no in-chat presentation). If the active layer already has an unapproved DRAFT (background/composite batch, or a pending model candidate), the skill stops and asks the operator to approve/discard it first — it does not pile up a second batch. When all four layers have an approved creative, visual production is complete for that angle.

## Governance

Nothing auto-approves, auto-applies, sets a cover, or auto-publishes. `ssc-image` **saves DRAFT `creative` rows** and stops; the operator reviews / approves / discards each layer on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls `approve` (the ONLY gated promotion, denied to agents by the approval hook), never `edit` used to demote/unapprove/**discard** a creative, no `set_cover`, no `reorder_gallery`, no publish, no `update_budget` — and never bakes ad text into a visual. The skill talks **only** to BrandOS MCP tools on the `ssc` surface — never a third-party image API. All operator-facing prompts and persisted notes are **Vietnamese** (image-model prompts may be whatever renders best). Producing requires `edit` (plus `view` for the resolve/precondition reads); approving a draft later requires `approve` on the page.

## After it runs

After the skill saves a layer's DRAFT creatives, point the operator to `/ad/[month]/[id]` for the concept to **review / approve** the active layer (background → model → product → composite) — for the model layer they either approve the single candidate or **discard** it to iterate — then **re-run this command** for the same `idea_id` + `brief_id` to work the next layer. When all four layers have an approved creative, visual production is complete for that angle. Re-invoke per angle/variant.
