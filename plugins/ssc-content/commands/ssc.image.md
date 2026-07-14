---
description: Produce the ad VISUAL for ONE approved ad concept's chosen angle — a state-driven, per-layer stepper anchored to a brief. Dispatches ssc-image with a required idea_id + brief_id. ssc-image reads the brief's creative chain and works the single next open layer of background → model → product → composite (the first without an approved creative), saving DRAFT creatives straight to the server, then stops. Three preconditions, in order — the idea is an approved ad concept; brief_id is an APPROVED angle brief of that idea; ≥1 APPROVED copy exists for that brief (image_content is NOT a gate and is never read — it is the on-image overlay text the dashboard applies over the finished visual at a later stage). The skill authors the full scene prompt, which reaches the image engine verbatim, grounded in the brief + the approved copy + the persona doc + the brand KB — never naming ad text, never negating, never baking text into a visual. background = 3 distinct readings of the angle; model = exactly ONE candidate generated INTO the approved background; product = upload-only (the operator uploads + approves the real packaging photo); composite = exactly ONE, placing the approved product into the approved scene. Re-run with revise:<note> to rewrite the active layer's prompt and get one fresh candidate. PHASE 1 wires only the ad channel (a non-ad idea stops cleanly). Propose-only; saves DRAFT creatives, never approves, discards, sets a cover, or publishes.
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
- **Angle brief ID** (`brief_id`) — the id of the operator's **chosen approved angle brief** for this concept (produced first by `/ssc.ads-brief`, approved in the dashboard). It **anchors the whole creative chain**: every read and every generate call keys on it.

If `idea_id` or `brief_id` is missing, ask the operator for it (one question) before dispatching — do not invent one. There is **no `date` selector**: a `brief_id` is idea-scoped, so the producer always takes an explicit `idea_id`.

Optional (passed through unchanged):

- **Revision note** (`revise: <note>`) — a free-text correction for the **active layer**. It makes the skill **rewrite** that layer's prompt and generate ONE fresh candidate (see below). Without it, a layer with pending drafts simply stops.
- **Model** (`model`) — a fal model id. Omit it and the server default governs.
- **Composite hints** — `layout_hint` (product-placement direction) and `hard_paste` (paste the real packaging's pixels unaltered). **Composite layer only.**
- **Period** (`period`, `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`.

**Removed inputs** — if the operator supplies them, say so and drop them: `uploaded_media_id` / `uploaded_media_ref` no longer exist. `generate_model` is **generated-only**; placing a real model photograph in the scene is a **dashboard** action. There is likewise **no `image_content_id`** and **no `n`**.

This command is the **visual-production half** of the Ads pipeline. Its **three preconditions**, checked in order, are: an **approved ad concept**, an **approved angle brief** for it, and **≥1 approved `copy`** for that brief (`/ssc.ads-produce <idea_id> <brief_id> copy` produces the copy; the operator approves it). **`image_content` is NOT a precondition and is never read** — it is the **on-image overlay text** the dashboard applies **over the finished visual at a later stage**, produced separately by `/ssc.ads-produce <idea_id> <brief_id> image_content`. It has nothing to do with this command. The producer operates **per concept**, **per angle (brief)**, and **per layer**, never on a whole plan: it reads **no** `channel_plan` gate flags, and there is no `/ssc.ads-plan` precondition beyond those three. **Phase 1 wires only the ad channel** — a non-ad idea stops cleanly (post/youtube visual flows are a later phase).

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single visual producer **`ssc-image`** (`idea_id`, `brief_id`, optional `revise` / `model` / `layout_hint` / `hard_paste` / `period` passthrough) for the resolved concept, then stops. `ssc-image` is a **state-driven, per-layer stepper anchored to the chosen angle brief**: on each invocation it reads that **brief's** creatives grouped by `layer` + `status`, works the **single next open layer** of the chain **`background` → `model` → `product` → `composite`** (the first without an approved creative), saves DRAFT creative(s) tagged with that layer, and **stops**.

| The skill does | Then the operator… |
|---|---|
| Checks the three preconditions in order — approved ad concept → `brief_id` is an **approved** angle brief of it → **≥1 approved `copy`** for that brief (stopping with the exact unmet precondition and next action otherwise; it never reads `image_content`). Reads the brief's creatives by `layer` + `status`, finds the first layer without an approved creative, and works only that one — **authoring the full scene prompt itself** (it reaches the image engine verbatim), grounded in the brief's angle + the approved copy (a **meaning** source — its words are never named in a prompt) + the persona detail doc + the brand/visual + compliance KB: **background** (3 calls, 3 **distinct readings** of the angle — different setting / time-of-day / staging), **model** (exactly ONE candidate generated **INTO** the approved background), **product** (**upload-only** — stops and asks the operator to upload + approve the real packaging photo; the skill never generates it and never uploads it), **composite** (exactly ONE, placing the approved product into the approved scene, with optional `layout_hint` / `hard_paste` as engine-request fields). Saves DRAFT creatives and **stops**. Each layer runs only when every earlier layer has an approved creative. | Opens `/ad/[month]/[id]`, **reviews / approves** (or **discards**) the saved DRAFT creative(s) for that layer, then **re-runs `/ssc.image <idea_id> <brief_id>`** — the skill detects the newly-approved layer and works the next one. If a pending draft misses the mark, re-runs with **`revise: <note>`** instead. |

**Don't like a pending draft? Re-run with `revise: <note>`.** The skill then **rewrites that layer's prompt** applying the note and issues ONE fresh generate call — never a blind re-roll of the same prompt.

**This flow bakes no text into any visual** — every prompt keeps a clean, evenly-toned reserved zone by describing it **positively** (per the standing composition rule in the visual KB), never by asking for text's absence, and never by naming the ad copy. The producer works **one layer per run**, reads **no** channel_plan gates, and **saves DRAFT creatives immediately** (no in-chat candidate presentation, no in-chat revise loop). If the active layer already has an unapproved DRAFT and no `revise` note was given, the skill stops and asks the operator to approve/discard it first — no second batch, no second candidate in flight. When all four layers have an approved creative, visual production is **complete** for that angle.

## Governance

Nothing auto-approves, auto-applies, auto-discards, sets a cover, or auto-publishes. `ssc-image` **saves DRAFT `creative` rows** and stops; the operator reviews / approves / discards each layer on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls `approve` (the ONLY gated promotion, denied to agents by the approval hook), never uses `edit` to demote / unapprove / **discard** a creative (discarding is the operator's call), no `set_cover`, no `reorder_gallery`, no publish, no `update_budget` — it never uploads the product, never writes a prompt row directly, and never bakes ad text into a visual. The skill talks **only** to BrandOS MCP tools on the `ssc` surface — **never** a third-party image API, not even when a BrandOS call fails. **Each generate call spends fal credits**, so every unmet precondition or server error is a clean STOP with the exact next action, never a retry-around or a silently-degraded run. All operator-facing prose and persisted notes are **Vietnamese** (image-model prompts are free-form — usually English renders best). Producing requires `edit` (plus `view` for the resolve/precondition reads); approving a draft later requires `approve` on the page.

## After it runs

After the skill saves a layer's DRAFT creative(s), point the operator to `/ad/[month]/[id]` for the concept to **review / approve** the active layer (`background` → `model` → `product` → `composite`) — or **discard** it, or re-run with `revise: <note>` for a re-authored prompt — then **re-run this command** for the same `idea_id` + `brief_id` to work the next layer. The `product` layer is the operator's own: they upload the **real** packaging photo and approve it in the dashboard, then re-run. When all four layers have an approved creative, visual production is **complete** for that angle — an approved composite is the final visual. Re-invoke per angle/brief: to work a **different** angle, approve a different brief (`/ssc.ads-brief <idea_id>`), get an approved `copy` for it via `/ssc.ads-produce <idea_id> <brief_id> copy`, and pass that `brief_id`.
