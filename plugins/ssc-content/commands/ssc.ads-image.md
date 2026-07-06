---
description: Produce the ad VISUAL for ONE approved ad concept — a state-driven, per-layer stepper. Dispatches ssc-ads-image, which works the single next open layer in the chain background → model → product → composite (whichever is not yet approved), saves DRAFT creatives straight to the server, and stops. Runs AFTER the concept's image_content text section is approved. The operator reviews/approves the active layer in the dashboard, then re-runs this command for the next layer; the model is generated INTO the approved background, the product is upload-only, and the composite places the approved product into the approved scene. Propose-only; saves DRAFT creatives, never approves, sets a cover, or publishes.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). Required. This is the key `ssc-ads-image` reads and writes creatives against.

Optional:

- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The skill resolves everything from the `idea_id`.

If no `idea_id` is given, ask the operator for one (one question) before dispatching. Do not invent one.

This command is the **visual-production half** of the Ads pipeline. It runs once the concept's **`image_content` text section is approved** in the dashboard (`/ssc.ads-produce` produces that text; the operator approves it) — `image_content` only requires the concept's `copy` to be approved (not the full text set), so this can run before headline/description are approved. It operates **per concept** and **per layer**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is no `/ssc.ads-plan` precondition beyond an approved concept with approved `image_content`.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single visual producer **`ssc-ads-image`** for the resolved concept, then stops. `ssc-ads-image` is a **state-driven, per-layer stepper**: on each invocation it reads the concept's creative assets grouped by `layer` + `status`, works the **single next open layer** in the chain **`background` → `model` → `product` → `composite`** (the first not yet approved), saves DRAFT creative(s) tagged with that layer, and **stops**.

| The skill does | Then the operator… |
|---|---|
| Confirms the concept is approved AND its `image_content` text is approved (stops with the exact unmet precondition otherwise). Reads the concept's creatives by `layer` + `status`, finds the first layer without an approved creative, and works only that one: **background** — requests 3 negative-space-aware versions (Flux schnell, text→image), leaving room for the model and the separately-overlaid text; **model** — generates exactly ONE candidate INTO the approved background (Nano Banana image→image), or places an operator-uploaded real model, one candidate in flight at a time; **product** — upload-only, never generated (stops and asks the operator to upload + approve the real product if none exists); **composite** — requests 2–3 variants placing the approved product into the approved background+model scene, with an optional per-concept masked hard-paste and `layout_hint`. Saves DRAFT creatives via the BrandOS tools and **stops**. Each layer runs only when every earlier layer has an approved creative. | Opens `/ad/[month]/[id]`, **reviews / approves** (or, for the model layer, **discards**) the saved DRAFT creative for that layer, then **re-runs `/ssc.ads-image <idea_id>`** — the skill detects the newly-approved layer and works the next one. |

**This flow bakes no text into any visual** — every layer leaves negative space for the separately-overlaid `image_content` text (which the dashboard renders; this command does not render or overlay it). The producer works **one layer per run** and reads **no** channel_plan gates. It **saves DRAFT creatives immediately** (no in-chat presentation); all review / approval / cover-setting / discarding happens in the dashboard. If the active layer already has an unapproved DRAFT (background/composite batch, or a pending model candidate), the skill stops and asks the operator to approve/discard it first — it does not pile up a second batch. Re-running for a layer that is already approved simply advances to the next open layer; when all four layers have an approved creative, visual production is complete.

## Governance

Nothing auto-approves, auto-applies, sets a cover, or auto-publishes. `ssc-ads-image` **saves DRAFT `creative` rows** to the server and stops; the operator reviews / approves / discards each layer on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no set_cover, no reorder_gallery, no publish, no update_budget — and never bakes ad text into a visual. The operator owns every creative, cover, and discard in the dashboard. All operator-facing prompts and any persisted notes are **Vietnamese** (image-model prompts may be whatever renders best). The skill talks **only** to BrandOS MCP tools on the `ssc` surface — never a third-party image API directly. Producing requires `edit` (plus `view` for the resolve/precondition reads); approving a draft later requires `approve` on the page.

## After it runs

After the skill saves a layer's DRAFT creatives, point the operator to `/ad/[month]/[id]` for the concept to **review / approve** the active layer (background → model → product → composite) — for the model layer they either approve the single candidate or **discard** it to iterate — then **re-run this command** for the same `idea_id` to work the next layer. When all four layers have an approved creative, visual production is complete. Re-invoke per concept — it works ONE approved concept at a time.
