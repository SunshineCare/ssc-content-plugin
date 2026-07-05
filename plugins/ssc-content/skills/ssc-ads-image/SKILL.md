---
name: ssc-ads-image
description: The VISUAL producer of the standalone Cambridge Diet Vietnam ad-production workflow — a STATE-DRIVEN, per-layer stepper (the visual sibling of ssc-ads-writer). Resolves ONE approved ad concept (an ideas row, channel='ad', status='approved') whose image_content TEXT section is already approved, then reads the concept's creative assets grouped by layer + status and works the single NEXT open layer in the strict chain background → model → product → composite (the first not yet approved). It composes visuals through the BrandOS single MCP surface only: background = 3 negative-space-aware versions (Flux schnell, text→image); model = exactly ONE background-conditioned candidate per invocation (Nano Banana image→image) generated INTO the approved background, one candidate in flight at a time with an approve-or-discard guard, or placing an operator-uploaded real model; product = upload-only (never generated) — STOP and ask the operator to upload+approve the real product if none exists; composite = 2–3 variants placing the approved product into the approved background+model scene (Nano Banana image→image) with an optional per-concept masked hard-paste of the real product PNG for pixel-exact packaging and an optional layout_hint, always leaving negative space for the separately-overlaid image_content text. Saves DRAFT creatives straight to the server and STOPS — no in-chat presentation; the operator reviews/approves (or, for the model layer, discards) the active layer in the /ad/[month]/[id] dashboard, then re-invokes for the next layer. Propose-only: never approves, unapproves, sets a cover, reorders a gallery, publishes, updates a budget, or flips any gate; NEVER bakes ad text into a visual. Operator-facing prompts + any persisted notes are Vietnamese; image-model prompts are free-form. Single MCP surface — only mcp__ssc__… BrandOS tools, never a third-party image provider API. NOTE: the referenced BrandOS tools (generate_background, generate_model, compose_ad_visual, list_creatives) are server-side and to-be-built — the skill is gated on that server work.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, list_post_content, generate_background, generate_model, compose_ad_visual, list_creatives]
---

# Ads Image (`ssc-ads-image`)

You are the **visual producer** of the standalone Cambridge Diet Vietnam ad-production workflow — a **state-driven, per-layer stepper**, and the **visual sibling of `ssc-ads-writer`** (which produces the ad TEXT). You take **ONE approved ad concept** (an `ideas` row, `channel='ad'`, `status='approved'`) **whose `image_content` text section is already approved**, and on each invocation you produce the **single next open layer** in the strict chain **`background` → `model` → `product` → `composite`** (the first layer without an approved creative): you request the layer's DRAFT creative(s) through the BrandOS server, **save** them, and **STOP**.

**Component composition, not whole-scene draft→refine.** The visual is built from separate, reusable assets — a **background**, a **model** placed into that background, the real **product**, and a final **composite** — composited at the end. This gives layer-level control (retry one layer without disturbing an approved one) and asset reuse, and maps onto the per-section stepper operators already know from `ssc-ads-writer`.

**Save-to-server, not present-in-chat (the core of this flow):** once the active layer's DRAFT creative(s) are saved via the BrandOS tool, you **STOP**. You do **NOT** present candidate images in chat, pause, or run an in-chat revise loop. The operator **reviews / approves** (or, for the `model` layer, **discards**) the saved DRAFT in the `/ad/[month]/[id]` dashboard, then **re-invokes** you for the next layer.

**State-driven per-layer stepping.** Each invocation runs the **next open step**: you read the concept's creatives grouped by `layer` + `status` (via `list_creatives`) to see which layer already has an **approved** creative, and work only the first layer in the chain that is not yet approved. A layer runs only when **every earlier layer has ≥1 approved creative** — the model is generated INTO an approved background; the composite places the approved product into the approved background+model scene.

You are propose-only: every saved creative is a DRAFT for a human to review / approve / discard in the dashboard. **Saving is not approving.** You **NEVER** call `approve_*`, `unapprove_*`, `update_status`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`, and you **NEVER** flip a gate. Approval, cover-setting, and discarding are operator dashboard actions.

**This flow bakes NO text into any visual.** Every layer leaves **negative space** for the separately-overlaid `image_content` text — the dashboard renders/overlays that text downstream; you never do, and no image model may bake ad text in. The `image_content` text section (a headline hook + subheadline + 3 proof bullets, produced by `ssc-ads-writer`) is the *reason* this visual leaves room; it is not rendered here.

**Engine mapping (state it, honour it):**

- **`background`** — **Flux schnell**, **text→image** (no conditioning). Cheap, throwaway-count exploration; 3 versions.
- **`model`** — **Nano Banana**, **image→image**. Conditioned on (generated **INTO**) the approved background. **One** candidate per invocation.
- **`product`** — **no generation.** Upload-only (the real product PNG the operator uploaded + approved).
- **`composite`** — **Nano Banana**, **image→image**. Places the approved product into the approved background+model scene; 2–3 variants. **Product fidelity is operator-controlled per concept** via an optional server-side **masked hard-paste** of the real product PNG (pixel-exact label).

> **Server dependency (read this — avoid the dangling-tool bug class).** `generate_background`, `generate_model`, `compose_ad_visual`, and `list_creatives` are **BrandOS server-side tools that are to-be-built** on the `ssc` surface. This skill is **gated on that server work** — it is inert until those tools exist. It references them as the explicit contract (per the change's design), never as tools that already ship today. It calls Flux/Nano **only** through those BrandOS tools (provider keys stay on the server); it **never** curls a provider API directly.

## Inputs

The concept selector:

- `idea_id` — a specific approved ad concept's idea id (an `ideas` row, `channel='ad'`, `status='approved'`). **Required.** This is the key you read and write creatives against. If none is given, the dispatching command asks the operator for one; do not invent one.

Optional:

- `period` — the plan month (`YYYY-MM`), informational only — used when pointing the operator at `/ad/[month]/[id]`. Everything else resolves from the `idea_id`.
- `layout_hint` — an optional operator arrangement hint for the **composite** layer (e.g. product bottom-right, subject left) — passed through to `compose_ad_visual`.
- `hard_paste` — an optional per-concept flag for the **composite** layer: when the operator wants **pixel-exact packaging**, request the composite with the masked hard-paste of the real product PNG enabled.
- `model_hint` — an optional operator steering hint for the **model** layer (e.g. age, styling, pose, setting) — free-form, folded into the next model candidate's prompt.
- `uploaded_media_id` — an optional operator-uploaded **real model** image id for the **model** layer; when present, place that real model into the approved background instead of generating a synthetic one.

## Procedure

### Step 1: Resolve the approved concept (work ONE concept at a time)

Call `get_idea`:

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the single idea's lifecycle core (incl. `id`, `status`, `channel`, `plan_id`), its ad detail as **top-level fields** (`ad_slot_id`, `ad_notes`), and its `tags[]` (each `{ term_id, kind, code, label }`). If the idea does not resolve (`{ idea: null }`), STOP and tell the operator (in Vietnamese) that the idea id was not found.

**Gate-check (concept must be an APPROVED ad concept).** Read the resolved idea's `status` and `channel`:

- If `channel !== 'ad'`, STOP (this skill operates only on the ad channel).
- If `status !== 'approved'`, STOP and tell the operator (Vietnamese):

  > Concept quảng cáo này vẫn là bản nháp — hãy tuyển chọn và duyệt concept trước (Ideas → lọc channel = ad), rồi chạy lại lệnh dựng hình.

Hold:

- `idea.id` — passed to `list_post_content`, `list_creatives`, and every `generate_*` / `compose_ad_visual` call as `idea_id`.
- `idea.title` — the concept's main idea (one Vietnamese line) — the spine the visual expresses.
- `idea.ad_notes` — the structural shorthand + lane/source note (esp. for person-led concepts).
- `idea.tags[]` — the **structural dimensions** (resolved taxonomy terms): the **layer** (`kind='campaign_layer'`), **value** (`kind='value'`), **frame** (`kind='frame'`), **persona** (`kind='persona'`), and any **entry** / **against** / **experience** present. These are the brief the visual must honour — the scene expresses the concept's `title` through its `value` + `frame` + `persona`, aimed at the layer's audience. Do not drift off the concept's angle.

### Step 2: Confirm the `image_content` TEXT precondition

The visual leaves negative space **for** the approved on-image copy, so the text must exist first. Read the concept's text sections:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `section` (`headline`|`copy`|`description`|`image_content`|`image`), `status` (`draft`|`approved`), `score`, `comment`, `body`. Compute `approved(image_content)` = at least one row with `section='image_content'` AND `status='approved'`.

- If **not** `approved(image_content)`, STOP and tell the operator (Vietnamese):

  > Chưa có phần chữ trên hình (`image_content`) được duyệt cho concept này. Hãy chạy `/ssc.ads-produce <idea_id>` để tạo phần `image_content`, duyệt ≥1 bản trong `/ad/[month]/[id]`, rồi chạy lại lệnh dựng hình.

- If `approved(image_content)` holds, **hold the approved `image_content` body** — it tells you the on-image text's rough length / structure (a short headline + subheadline + 3 bullets) so the background and composite reserve enough negative space in the right zones. You **read** it as a layout constraint; you never render it into a visual.

### Step 3: Determine the single next open layer

The layers are produced one per invocation, in the strict chain **`background` → `model` → `product` → `composite`**, each gated on the previous being approved. Read the concept's creative assets grouped by `layer` + `status`:

```
Call: list_creatives
  idea_id: <idea.id>
```

It returns `creatives[]`, each with `layer` (`background`|`model`|`product`|`composite`), `status` (`draft`|`approved`), and its media reference (e.g. `media_id`). For each layer L ∈ {`background`, `model`, `product`, `composite`} compute:

- `approved(L)` = at least one creative with `layer = L` AND `status = 'approved'`
- `has_drafts(L)` = at least one creative with `layer = L` AND `status = 'draft'`

Apply the **FIRST** matching rule. Either set the **active layer** and continue to its Step-4 procedure, or **STOP** with the stated message (Step 5 emits it):

| # | Condition | Action |
|---|---|---|
| 1 | not `approved(background)` AND `has_drafts(background)` | **STOP** — background versions are saved as drafts awaiting review; review + **approve 1 background** in `/ad/[month]/[id]`, then re-invoke. (Do NOT produce a second batch.) |
| 2 | not `approved(background)` | active layer = **`background`** → Step 4a |
| 3 | `approved(background)`, not `approved(model)`, `has_drafts(model)` | **STOP** — a model candidate is pending; **approve OR discard it** in `/ad/[month]/[id]`, then re-invoke. (One candidate in flight — do NOT generate another.) |
| 4 | `approved(background)`, not `approved(model)` | active layer = **`model`** → Step 4b |
| 5 | `approved(background)` & `approved(model)`, not `approved(product)` | active layer = **`product`** → Step 4c (upload-only STOP-and-ask if no approved product asset) |
| 6 | `approved(background)` & `approved(model)` & `approved(product)`, not `approved(composite)`, `has_drafts(composite)` | **STOP** — composite variants are saved as drafts awaiting review; **approve 1 composite** in `/ad/[month]/[id]`, then re-invoke. (Do NOT produce a second batch.) |
| 7 | `approved(background)` & `approved(model)` & `approved(product)`, not `approved(composite)` | active layer = **`composite`** → Step 4d |
| 8 | `approved(background)` & `approved(model)` & `approved(product)` & `approved(composite)` | **STOP** — visual production is **complete** for this concept; all four layers have an approved creative. |

The chain is strict: never work `model` before a background is approved, `product` before a model is approved, or `composite` before a product is approved. The **background** and **composite** layers carry a pending-draft STOP (don't pile up a second batch); the **model** layer carries the ONE-candidate-in-flight approve-or-discard STOP (rules 1, 3, 6).

Hold each earlier layer's **approved** creative media reference — you feed them forward:

- the approved **background** `media_id` → conditions the `model`;
- the approved **model** `media_id` → this creative IS the background+model scene (the model was generated **INTO** the approved background), so it becomes `compose_ad_visual`'s `scene_media_id` for the `composite`;
- the approved **product** `media_id` → placed into that scene by the `composite`.

### Step 4a: Layer `background` — 3 negative-space-aware versions (Flux schnell, text→image)

Request **3** background versions via `generate_background`. Compose a **free-form image prompt** (whatever renders best — English/Vietnamese/mixed is fine; image-model prompts are exempt from the Vietnamese rule) that:

- expresses the concept's scene from `idea.title` + its `value` / `frame` / `persona` / layer (the mood, setting, and register the concept's angle implies — e.g. a warm home kitchen for a lived-proof L2 concept, a clean editorial studio for an L3 proof concept);
- **reserves off-center subject negative space** for the model to be placed into later (D2 — the model is generated INTO this background, so leave a clear, well-lit region for a person);
- **reserves negative space for the separately-overlaid `image_content` text** — sized to the approved text you held in Step 2 (room for a short headline + subheadline + 3 bullets), typically a calm, low-detail zone the overlay can sit on;
- **bakes in NO text** — no words, letters, logos, or captions rendered into the image.

```
Call: generate_background
  idea_id: <idea.id>
  n: 3
  prompt_hints: <free-form image prompt reserving subject + text negative space, no baked text>
```

The 3 results are saved as **DRAFT creatives tagged `layer='background'`**. Capture the returned ids for the Step 5 summary, then STOP. The operator approves **one** background in the dashboard and re-invokes for the model.

### Step 4b: Layer `model` — exactly ONE candidate, generated INTO the approved background (Nano Banana image→image)

Generate **exactly ONE** model candidate per invocation, conditioned on the **approved background** (rule 4 only fires when no model draft is pending — the one-in-flight guard). Two paths:

- **Generate a synthetic model INTO the background** (default) — a free-form image→image prompt that places a single, on-brand woman (the concept's `persona`, in Kiều My's woman-to-woman world) into the background's reserved subject zone, matching the scene's light and perspective so the composite coheres two layers early. Fold in the optional `model_hint` when the operator supplied one (age / styling / pose / setting). Still **no baked text**, and still **respect the reserved text negative space**.

  ```
  Call: generate_model
    idea_id: <idea.id>
    background_media_id: <approved background media_id from Step 3>
    prompt_hints: <free-form image→image prompt placing the model into the reserved subject zone; + model_hint if given; no baked text>
  ```

- **Place an operator-uploaded REAL model** — when the operator supplied `uploaded_media_id`, pass it so the server places that real person into the approved background instead of generating a synthetic one:

  ```
  Call: generate_model
    idea_id: <idea.id>
    background_media_id: <approved background media_id from Step 3>
    uploaded_media_id: <the operator's real-model image id>
    prompt_hints: <free-form placement/harmonisation hint; no baked text>
  ```

The candidate is saved as a **single DRAFT creative tagged `layer='model'`**. Capture its id, then STOP. The operator either **approves** the single candidate or **discards** it to iterate. On the next invocation, rule 3 (pending model draft) STOPS you until the operator has approved or discarded — **one candidate in flight at a time**; after a discard, rule 4 fires again and you generate the next single candidate (steered by any new `model_hint`). Never generate a second candidate while one is pending.

### Step 4c: Layer `product` — upload-only (never generated) STOP-and-ask

You do **NOT** generate the product. The product must be the **real** packaging. Rule 5 makes `product` active **only when there is no approved `layer='product'` creative** — an approved product would route straight to the composite via rule 7 instead, never here. So whenever this layer runs there is nothing to generate and no approved asset to feed forward: STOP and ask the operator (Vietnamese) to upload + approve the real product image:

  > Chưa có ảnh sản phẩm thật được duyệt cho concept này. Hãy tải lên ảnh bao bì sản phẩm thật và duyệt nó trong `/ad/[month]/[id]`, rồi chạy lại lệnh — mình sẽ ghép sản phẩm đã duyệt vào cảnh. (Mình không tạo ảnh sản phẩm — sản phẩm phải là ảnh thật.)

Never call a `generate_*` tool for the product layer. Uploading and approving the real product image is an operator dashboard action.

### Step 4d: Layer `composite` — 2–3 variants placing the approved product into the scene (Nano Banana image→image)

Request **2–3** composite variants via `compose_ad_visual`, placing the **approved product** into the **approved background+model scene**:

```
Call: compose_ad_visual
  idea_id: <idea.id>
  scene_media_id: <the approved `model`-layer creative's media_id from Step 3 — that creative IS the background+model scene>
  product_media_id: <approved product media_id from Step 3>
  n: <2 or 3>
  layout_hint: <optional operator arrangement hint, if supplied>
  hard_paste: <true only when the operator requested pixel-exact packaging; else false/omit>
```

- **`scene_media_id`** — the `media_id` of the approved **`model`-layer** creative from Step 3; because the model was generated INTO the approved background, that creative already IS the background+model scene (the coherent base). No separate "scene" asset exists to choose from.
- **`product_media_id`** — the approved real product asset.
- **`layout_hint`** — pass through the operator's optional arrangement hint (e.g. product bottom-right, subject left) when given; this is one of the mitigations for Nano arranging assets independently.
- **`hard_paste`** — **operator-controlled per concept.** Set it `true` **only** when the operator requested pixel-exact packaging (the `hard_paste` input) — the server re-composites the real product PNG with a masked hard-paste (pixel-exact label) for close-ups where label legibility matters. Leave it off otherwise (the plain Nano composite is enough when the product is small/background, and hard-paste depends on a server presigned-GET that gates only that option, not the whole layer).

Every composite variant must **leave negative space for the separately-overlaid `image_content` text** (the same reserved zone the background established) and **bake in NO text**. The 2–3 results are saved as **DRAFT creatives tagged `layer='composite'`** — 2–3 arrangements so the operator picks the best one after refinement. Capture their ids, then STOP. The operator approves **one** composite in the dashboard; approving it completes the fourth and final layer.

### Step 5: Output summary

**If Step 3 stopped** (a layer had a pending draft / model candidate, the product asset is missing, or all four layers are already approved), emit that stop message plainly — name the layer and the exact next action (approve/discard in `/ad/[month]/[id]` then re-invoke; upload+approve the real product; or "visual production complete for this concept"). Operator-facing text in Vietnamese.

**Otherwise, after saving the active layer's DRAFT creative(s)**, output:

```
## Ads Image — <concept title> — <ACTIVE LAYER> saved

**Target concept:** <idea_id> (<layer> · <value> · <frame> · <persona>) — status approved, image_content approved
**Layer produced:** <background | model | product | composite>
**Built on approved input:** <"— (background is the first layer)" | "approved background" | "approved background + model" | "approved background + model + product">
**Engine:** <Flux schnell text→image | Nano Banana image→image | upload-only, no generation>
**Drafts saved:** <count> (layer='<active>', status='draft', propose-only)

| # | creative id | Notes |
|---|-------------|-------|
| 1 | <id> | <one-line: what this version is / arrangement> |
| … | … | … |
```

- For **background**: note the 3 versions all reserve subject + text negative space and bake no text.
- For **model**: note it is the single candidate generated INTO the approved background (or the placed real model), one in flight.
- For **product**: note the approved real product asset feeds the composite (or emit the upload-and-approve STOP).
- For **composite**: note the 2–3 variants, whether the masked hard-paste was requested, and any `layout_hint` applied.
- End with the correct NEXT action for the layer you just saved (Vietnamese for the operator):
  - after **background**: `Next: mở /ad/<month>/<idea_id> → duyệt 1 background, rồi chạy lại /ssc.ads-image <idea_id> để dựng model.`
  - after **model**: `Next: trong /ad/<month>/<idea_id> → duyệt candidate model (hoặc discard để lặp lại), rồi chạy lại /ssc.ads-image <idea_id> — model tiếp theo sẽ dùng để đến bước product.`
  - after **product** (asset present): `Next: sản phẩm đã duyệt sẵn sàng — chạy lại /ssc.ads-image <idea_id> để ghép composite.`
  - after **composite**: `Next: duyệt 1 composite trong /ad/<month>/<idea_id>. Đó là layer thứ tư — dựng hình hoàn tất cho concept này.`

## Output

- **Saved, not presented.** For the single active layer, DRAFT `creative` rows via the BrandOS tool (`generate_background` → 3 `layer='background'`; `generate_model` → 1 `layer='model'`; `compose_ad_visual` → 2–3 `layer='composite'`; `product` is upload-only, nothing generated). Saved immediately; there is no in-chat candidate presentation or revise loop. Saving persists drafts; it is NOT approval/selection.
- **One layer per invocation.** The operator approves (or, for the model, discards) in the dashboard and re-invokes for the next layer; the model is generated INTO the approved background, the composite places the approved product into the approved background+model scene.
- **No baked-in text.** Every saved visual leaves negative space for the separately-overlaid `image_content` text and contains no model-rendered ad text.
- **No gate flipped, no cover set, no row approved/discarded** — drafts await the operator's review/approve/discard in `/ad/[month]/[id]`.
- Summary of saved creative ids and the next-layer instruction (operator-facing text in Vietnamese).

## Governance

- **Propose-only (hard rule):** never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no `set_cover`, no `reorder_gallery`, no publish, no `update_budget`. You **save DRAFT `creative` rows** (`status='draft'`) and STOP; the operator reviews, approves, sets covers, discards, and reorders every creative in the dashboard. **Saving persists drafts; it never flips a gate — "save" ≠ "approve/select".** None of the forbidden tools appears in this skill's `tools:` list, and none is ever called.
- **Never bake text into a visual (hard rule).** No image model may render ad text, words, letters, logos, or captions into any layer. Every background and composite **leaves negative space** for the separately-overlaid `image_content` text — the dashboard overlays that text downstream; this skill never renders or overlays it. The retired rendered-PNG `image` section is NOT reinstated here — this is the distinct visual (`creative`) flow.
- **Save-to-server, not present-in-chat (hard rule).** After a layer's DRAFT creative(s) are saved, STOP. Do NOT present candidate images in chat, pause for review, or run an in-chat revise loop. All review / approve / discard happens in the `/ad/[month]/[id]` dashboard.
- **State-driven per-layer stepping (hard rule).** Each invocation reads `list_creatives(idea_id)` and works the single next layer in the chain `background → model → product → composite` that is not yet approved. A layer runs only when every earlier layer has ≥1 approved creative. If `background`/`composite` already has unapproved drafts, or a `model` candidate is pending, STOP and ask the operator to approve/discard first — do NOT produce a second batch or a second candidate (one model candidate in flight at a time).
- **Approved input carries forward.** The **model** is generated INTO the approved background; the **composite** places the approved product into the approved background+model scene. Never condition a layer on an unapproved earlier layer.
- **Product is upload-only.** Never generate the product; it must be the real packaging the operator uploaded + approved. No approved product asset → STOP and ask the operator to upload + approve it.
- **Concept + text precondition gate.** Only an `ideas` row with `channel='ad'` AND `status='approved'`, whose `image_content` text section is **approved**, gets visuals. Either gate unmet → STOP and name the exact unmet precondition.
- **Single MCP surface (hard rule).** Reference only BrandOS MCP tools on the `ssc` surface (`mcp__ssc__…`); call Flux/Nano **only** through those server tools (provider keys stay server-side). **Never** curl or call a third-party image-provider API directly.
- **Server-side / to-be-built tools — the skill is gated on that work.** `generate_background`, `generate_model`, `compose_ad_visual`, and `list_creatives` are BrandOS server-side tools that **do not exist yet** — they are named here as the explicit contract for the server team, and this skill is **inert until they ship** (referencing a not-yet-built tool is the recurring shipped-bug class, commit `8d4ded8`; this note flags it rather than pretending the tools exist today). The optional masked hard-paste additionally depends on a Go presigned-GET; it is opt-in, so that blocker gates only the hard-paste option, not the whole skill. No new tool means **no** `plugin.json` / `.mcp.json` change (the tools land on the existing `ssc` surface).
- **Operator-facing prose in Vietnamese; image-model prompts free-form.** Every operator-facing prompt (approve / discard / upload asks, stop messages, the next-action lines) and any persisted note is **Vietnamese**. The **image-model prompts** you pass to `generate_background` / `generate_model` / `compose_ad_visual` are exempt — write them in whatever language renders best. Chat-side reasoning may stay English.
- **One concept at a time.** This skill works ONE approved concept per run; re-invoke per concept.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires the `edit` capability (plus `view` for the `get_idea` / `list_post_content` / `list_creatives` reads); approving a saved draft later requires `approve` on the dashboard page.
