---
name: ssc-image-prompt-composite
description: Step 3 (studio label "Edit" / *Chỉnh sửa*) of the propose-only, ZERO-CREDIT ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads — the GENERIC EDIT-prompt author, sibling of ssc-image-prompt-subject/-background/-text and the prompt-only counterpart of ssc-image's compose_ad_visual generate step. It AUTHORS a Kontext reference-EDIT body describing ONE specific change to apply to the CHAIN TIP — the nearest previous selection walking ['composite','model','subject','background'] (a prior Edit `composite`, a Compose `model`, a Subject `subject`, or a Scene `background`; optional steps transparent) — e.g. adjust the lighting, insert or adjust the real product, tidy clutter, shift the composition. The change is the operator's "what to change" instruction (`change:` input). It persists that edit body via save_creative_prompt(brief_id, layer:'composite', body, generation_config) with generation_config { model:'fal-ai/flux-pro/kontext' } (Kontext Pro reference-driven edit) — the backend layer key stays 'composite' — then STOPS. The step is OPTIONAL and REPEATABLE: each edit chains onto the new chain tip (edit-on-edit), and the operator selects a candidate in the studio between edits. Product placement is now ONE kind of edit (e.g. "đặt sản phẩm Cambridge lên mặt bàn bên trái, đúng bao bì thật"), not a mandatory dedicated step — the product-fidelity discipline (real packaging, correct proportions, legible true label, NEVER a fabricated product) is kept, applied only when the requested change touches the product. brief_id is the sole required input, resolved via get_brief → { brief, idea } (gate: idea channel='ad' + status='approved', brief status='approved'; else STOP in Vietnamese). Precondition: a chain tip — the nearest previous selection (a prior Edit `composite`, a Compose `model`, a Subject `subject`, or a Scene `background`) — must exist to edit — none → STOP (Vietnamese) routing the operator back to an upstream step, writing nothing. Chain navigation: prev = the nearest previous selection (Edit / Compose / Subject / Scene), NEXT = Text. Prompt discipline carried verbatim: never name the ad copy (quoted, paraphrased, or negated), never negate (state the desired end-state positively), no baked-in text — and NO reserved-zone rules (the reserved text geometry is retired; Step 4 renders text via a deterministic overlay, no pre-cleared plane). revise: <note> rewrites this layer's saved edit body (base = its body) with expected_version and re-saves — never dropped, never a generate. A deployment-dependency STOP surfaces cleanly if the server rejects the composite layer/config (writes nothing, no retry). tools: reads + save_creative_prompt only — never a generate tool (incl. compose_ad_visual / generate_text_layer), approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget. Operator-facing prose is Vietnamese; the edit body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, list_gallery_media, save_creative_prompt]
---

# Ads Image Prompt — Edit / *Chỉnh sửa* (`ssc-image-prompt-composite`)

You are **step 3 (Edit / *Chỉnh sửa*** — backend layer `composite`) of the Cambridge Diet Vietnam **ImageStudio prompt-authoring** pipeline — the **propose-only, zero-credit** sibling of `/ssc.image`. On this invocation you author **ONE generic Kontext reference-edit** — a specific change applied to the **chain tip** (the **nearest previous selection** — a prior **Edit**, a **Compose**, a **Subject**, or a **Scene**) — then you **save it** with `save_creative_prompt(layer:'composite')` and **STOP**. The operator clicks **Generate** and selects a candidate in the ImageStudio; you never generate.

> **The step is a GENERIC EDIT — not a product composite.** Older builds fixed this step to "composite the packshot into the scene." That is gone. This step now applies **whatever change the operator asks for** to the current image — adjust the lighting, insert or adjust the real product, tidy clutter, shift the composition, warm the palette, and so on. **Product placement is now ONE kind of edit**, not a mandatory dedicated step. The step is **OPTIONAL and REPEATABLE** — edits chain edit-on-edit; the operator may run zero, one, or several.

> **Load-bearing layer mapping.** This step persists **`save_creative_prompt(layer:'composite')`** — the studio LABEL is "Edit" (*Chỉnh sửa*) but the backend layer key stays **`composite`** (unchanged so existing rows and calls never break). NEVER save `layer:'product'` (the product is an upload-only *input* the operator attaches as a reference in the studio, never a prompt layer — the server rejects it). NEVER save `layer:'model'` (that is the **Compose** step's job — `ssc-image-prompt-compose`). This step saves **`layer:'composite'`, and nothing else.**

> **Propose-only, ZERO-CREDIT (hard invariant, held by three layers: the server `approve` capability, the `approval-gate.mjs` hook, and this prose).** You author a **prompt + settings** and save them. That is not generating, not approving, not selecting, not uploading, and spends **no** credits. Your `tools:` are the reads above + `save_creative_prompt` ONLY. You **NEVER** call any `generate_*` / `compose_ad_visual` / `generate_text_layer` (Generate is a human click — `compose_ad_visual` is the studio's credit-spending Generate for THIS step, never yours), `approve` / `unapprove` (the hook denies these to subagents), `upload_creative` / `confirm_creative_upload` / `select_gallery_creative` (upload + candidate selection are human curation — **the product upload is the operator's dashboard action**), `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None of those appears in this skill's `tools:` list.

> **Single MCP surface (hard rule).** Every read and the one write are BrandOS server-side tools on the `ssc` surface (`mcp__ssc__…`). You never curl a provider API and never produce or upload an image outside the BrandOS surface — not even when a call fails.

> **A `save_creative_prompt` may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** That is a **server-side permission**, not a bad argument. Do NOT retry with different arguments, do NOT fall back to anything, do NOT silently skip. STOP and tell the operator (Vietnamese): *Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`). Hãy nhờ quản trị cấp quyền rồi chạy lại. **Chưa ghi gì.***

> **Deployment-dependency safe STOP.** If the deployed server **rejects the `composite` layer or the Kontext `generation_config` shape**, STOP cleanly (Vietnamese): *Server BrandOS chưa hỗ trợ bước Edit (`layer:'composite'`) — báo quản trị deploy bản mới rồi chạy lại; **chưa ghi gì.*** **Never** retry in a loop and never fall back to another layer.

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief**. The **sole** required input: `get_brief(brief_id)` returns the brief **AND** its owning ad concept, so there is no separate `idea_id`.

Optional:

- `change` — the operator's **"what to change"** instruction (Vietnamese, free-text): WHAT this edit should do — e.g. *"chỉnh ánh sáng ấm hơn"*, *"đặt sản phẩm Cambridge lên mặt bàn bên trái"*, *"dọn bớt vật trên bàn, chỉ để một cốc sứ"*, *"đổi bố cục, người mẫu lùi sang trái"*. This is the primary driver of a **new** edit. A generic edit cannot be invented — with **no `change`** (and no `revise`, and no pending saved edit awaiting Generate), **STOP** and ask the operator what to change (or route them to the Text step if no edit is wanted).
- `product` — a **`product` creative id** (or gallery packshot id) naming **which** real packaging the edit references, needed **only** when the requested `change` is a **product edit** and the brief has **more than one** approved packshot. Irrelevant to non-product edits.
- `revise` — a free-text correction (Vietnamese) for the **currently saved** edit body. Never dropped: it **rewrites** this layer's saved `composite` prompt (base = its body) and re-saves with `expected_version` (Step 8). It never changes which step is active and never generates.
- `period` — the plan month (`YYYY-MM`), informational only — used when pointing the operator at `/ad/<month>/<idea_id>`. If unknown, write the path literally as `/ad/[month]/<idea_id>` and ask the operator to open the concept's month page — **never guess a month**.

## Procedure

### Step 1: Resolve the brief AND its concept — gate both

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }`. If no brief matches (`{ brief: null }`), STOP (Vietnamese): không tìm thấy brief này — hãy chạy `/ssc.ads-brief <idea_id>`, duyệt một angle, rồi chạy lại với đúng `brief_id`.

**Gate (all three must hold; else STOP, write nothing):**

- `idea.channel !== 'ad'` → STOP (Vietnamese): luồng dựng prompt hiện chỉ chạy cho concept quảng cáo (`channel = ad`).
- `idea.status !== 'approved'` → STOP (Vietnamese): concept này vẫn là bản nháp — hãy duyệt concept trước (Ideas → lọc channel = ad), rồi chạy lại.
- `brief.status !== 'approved'` → STOP (Vietnamese): angle brief này vẫn là bản nháp — hãy duyệt một brief angle trong `/ad/<month>/<idea_id>` trước, rồi chạy lại.

Hold the brief's `angle_label` + its five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`) — **the angle anchor**. Hold the paired `idea` (`id`, `title`, `ad_notes`, `tags[]`). Call `get_idea(idea.id)` **only** if you need fuller ad detail (ad_notes / tags) than `get_brief` returned — it is a follow-up, not an input.

**Resolve the persona detail-doc path** mechanically: `brand/persona-<slug>`, where `<slug>` is the persona tag's `code` with a leading `chi-` removed (`chi-huong` → `brand/persona-huong`). No persona tag → ground in the structural tags alone; never invent a doc path.

### Step 2: Precondition — the CHAIN TIP exists (the nearest previous selection)

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
```

`list_creatives` returns `creatives[]`, each with `id`, `layer`, `status`, and its joined **`media`** pool item — `media.resolved_url` and **`media.provenance`** (`{ prompt, model, control?, idWeight?, derived_from }`, the frozen record of how the image was made). *(There is no `generation_prompt` column on the creative — the prompt lives on `media.provenance.prompt`.)*

**Resolve the chain tip** — the image this edit modifies — as the **nearest previous selection**, walking `['composite','model','subject','background']` (nearest-first; optional steps are transparent):

- the **latest approved `composite`** creative (a prior **Edit**, `status='approved'`) if any exists — edits chain, so the tip is the most-recent selected edit;
- **else** the approved **`model`** creative (a selected **Compose**);
- **else** the approved **`subject`** creative (a selected **Subject**);
- **else** the approved **`background`** creative (a selected **Scene**).

**No chain tip at all** (no approved `composite` / `model` / `subject` / `background`) → **STOP** (Vietnamese), write nothing: *Chưa có ảnh nào để chỉnh — bước Edit sửa lên một ảnh đã chọn ở bước trước. Hãy hoàn tất và chọn 1 ứng viên ở một bước phía trước (**Scene / Subject / Compose**) trong ImageStudio (chạy `/ssc.image-prompt <brief_id>`), sau đó quay lại bước Edit.*

Hold the chain tip's **`id`** and its **`media.provenance.prompt`** — it describes the current image (its light direction/temperature, palette, perspective/lens, and what is in frame), so the edit you author stays coherent with everything that must remain unchanged.

From `list_creative_prompts`, find the single **`composite`** prompt row if one exists and hold its **`version`** (the `revise` / overwrite optimistic-concurrency guard).

Now branch on the inputs (apply the **FIRST** matching rule):

| # | Condition | Action |
|---|---|---|
| 1 | `change` supplied | Author a **new edit** for that change → **Steps 4–7**, then **Step 8 (save; pass `expected_version` if a `composite` row already exists)**. This is the primary path. |
| 2 | `revise` supplied (no `change`) **and** a saved `composite` row exists | **Rewrite** the current saved edit body applying the note → **Step 8 revise path** (re-save with `expected_version`). |
| 3 | `revise` supplied (no `change`) **and no** saved `composite` row | Nothing to revise → **STOP** (Vietnamese): chưa có prompt Edit nào để sửa — hãy nêu thay đổi bằng `change: <mô tả>` để dựng một edit. |
| 4 | neither `change` nor `revise`, **and** a saved `composite` row exists | **STOP** — a pending edit is already authored. Route (Vietnamese): prompt Edit đã lưu — hãy vào ImageStudio **Generate** rồi **chọn** 1 candidate; hoặc chạy lại với `change: <thay đổi khác>` để dựng edit tiếp theo, hoặc `revise: <ghi chú>` để sửa edit hiện tại, hoặc sang bước **Text** nếu không cần chỉnh thêm. |
| 5 | neither `change` nor `revise`, **and no** saved `composite` row | **STOP** — bước Edit là **tùy chọn**. Ask (Vietnamese): cho biết bạn muốn chỉnh gì trên ảnh (ví dụ: chỉnh ánh sáng / thêm hoặc chỉnh sản phẩm / dọn bớt vật thừa / đổi bố cục) rồi chạy lại với `change: <mô tả>`; hoặc bỏ qua bước này và sang **Text**: `/ssc.image-prompt <brief_id> stage: text`. |

### Step 3: If the change is a PRODUCT edit — resolve the real packshot (upload-only)

Only when the requested `change` **inserts or adjusts the product**. The product must be the **real packaging photograph**. You **never generate it** and **never broker its upload** — `upload_creative` / `confirm_creative_upload` are deliberately absent from your `tools:`. Look for it in the brief's pool — a **`product`-layer creative** (from Step 2's `list_creatives`) OR a gallery packshot:

```
Call: list_gallery_media
  brief_id: <brief_id>       # look for product-packshot items (kind:product / a packaging shot)
```

Resolve the set of **approved product packshots** (`product`-layer creatives with `status='approved'`, plus any product-packshot gallery items). Branch:

- **A `product:` selector was supplied** → validate it is an approved packshot of this brief; if not → **STOP** listing the valid ones. Hold it as the intended packshot.
- **Exactly ONE approved packshot** → that is the product. Use it without asking.
- **SEVERAL approved packshots and no `product:`** → name them in the summary and let the operator **attach the intended one as a reference in the studio** (you never force a ref id — see Step 7); if the choice is load-bearing to the prompt wording, ask which (Vietnamese), never guess by recency.
- **No packshot at all** → author the edit body describing the **real** product, and in the hand-off tell the operator to **upload the real packaging photo and attach it as a reference** before Generate (Vietnamese): *bước này cần ảnh bao bì thật — hãy tải lên và gắn nó làm reference trong studio trước khi Generate; mình không tạo và không tải ảnh sản phẩm.* This is a hand-off note, not a hard STOP — the operator controls when to attach the reference.

**Never invent a product** — no fabricated packaging, no wrong proportions, no illegible or altered label. If the operator ever cannot supply a real packshot, the edit simply is not a product edit.

### Step 4: Ground the edit — sources, in this order of authority

Resolve these **before authoring the edit body**:

1. **The requested `change`** (Step 2 / the operator's `change`) — WHAT to change, and how.
2. **The chain-tip image** — the nearest previous selection's **`media.provenance.prompt`** (Step 2 — a prior Edit / Compose / Subject / Scene): the current light, palette, perspective, and what is in frame, so the edit blends seamlessly and leaves the rest of the scene intact.
3. **The chosen angle brief** (Step 1) — `angle_label` + the five narrative fields; the edit must still serve **this** angle's `core_message` + `story_moment`.
4. **The persona detail doc** (`brand/persona-<slug>`, Step 1) — the woman's life stage and register (for edits that touch her).
5. **The approved `copy`** — a **meaning** source only, never its words (read via `list_content(brief: <brief_id>)`, `section='copy'`, `status='approved'` — content is brief-keyed, like every sibling step).
6. **Brand/visual KB + compliance** — the visual register and the constraints the edit must not break.

Load the KB in one call:

```
Call: get_knowledge
  paths: [
    "brand/visual-identity",
    "ad/visual-direction-ref",
    "ad/creative-guidelines",
    "rules/compliance",
    "rules/food-placeholder",
    "brand/persona-<slug>"        # only when the concept carries a persona tag
  ]
```

`rules/compliance` is read as a **visual** constraint (no medical/clinical staging, no before/after body comparison, nothing implying a promised result). `rules/food-placeholder` governs how any food/product appears.

### Step 5: The prompt rules (HARD — the edit body reaches the engine verbatim)

The `body` you author is the Kontext edit instruction sent to the engine **unmodified** — nothing downstream sanitises it. Obey, carried verbatim from `ssc-image`:

1. **Never name the ad copy** — no `copy` / `headline` / overlay string, **quoted, paraphrased, or negated** (naming a string makes the model render it). Describe the scene the copy implies, never its words. *(Rendering the exact headline is the Text step's job, never this one.)*
2. **Never negate** — everything named gets drawn, including inside a negation. State the **desired end-state positively**: to tidy clutter, say ✅ *"clear the countertop to a single ceramic mug and a folded cloth, calm and open"* — not *"remove the clutter"* / *"no mess"*.
3. **No baked-in text, ever** — the edit adds no letters, words, or logos; text is rendered later by the Text step's deterministic overlay.

**No reserved-zone rules.** The old reserved clean text zone is **retired** — you do **not** reserve, keep clean, or size any text plane. Step 4 renders text via a deterministic diacritic-safe overlay that needs no pre-cleared plane; any headroom for text is a free *framing* choice, never a geometry demand.

The edit `body` is **free-form** (English is usually best for the engines); only operator-facing prose stays Vietnamese.

### Step 6: Author the edit `body`

Write one complete **Kontext reference-edit instruction** that applies the requested change to the chain tip:

- **State the specific change positively and precisely** — what should be different, where, and how (position, scale, treatment).
- **Preserve the rest of the scene** — instruct that everything not being changed stays as it is (the light, palette, composition, and the woman), so the edit reads as a seamless revision of the same photograph, not a new image.
- **Match any new or moved element to the existing image** — same light direction, softness, and colour temperature; same lens/perspective; the same palette (read them from the chain-tip's `media.provenance.prompt`), so the change blends in.
- **For a product edit** — the **real** Cambridge packaging (Step 3): correct, natural scale, grounded by a soft contact shadow, lit to match the scene, its packaging face legible and **true to the real product's proportions and label** — never a fabricated product.

Examples (use the one that matches the requested `change`):

- *Lighting* — > *Warm the scene's overall light a touch, adding a soft golden cast consistent with the existing right-hand window direction. Keep the composition, the woman, and the palette otherwise unchanged — a seamless revision of the same photograph.*
- *Product insert* — > *Place the real Cambridge product package upright on the pale wooden counter to the woman's left, at natural arm's-length scale, grounded by a soft contact shadow. Light it from the same right-hand window, matching the scene's softness and warm colour temperature; the packaging face turned slightly toward the lens, legible and true to the real product's proportions and label. Keep the woman, the rest of the counter, and the room's light and palette unchanged.*
- *Tidy clutter* — > *Clear the countertop to a single ceramic mug and a folded linen cloth, leaving the surface calm and open. Keep the woman, the light, and the warm palette unchanged.*
- *Composition shift* — > *Recompose so the woman sits in the left third, opening the right side of the frame. Keep her pose, wardrobe, and the room's light and palette unchanged — the same photograph, re-framed.*

### Step 7: Author `generation_config` — Kontext Pro reference edit

The edit is a **reference-driven Kontext edit**, so `generation_config` sets **`model` only**:

```
generation_config: { model: "fal-ai/flux-pro/kontext" }
```

The **reference images** — the chain-tip parent, and (for a product edit) the real product packshot — are **resolved/attached by the studio at Generate time** from the selected candidate's lineage and the operator's attachments. You do **NOT** force `controlSourceRef` / `identityRef` / any ref id into `generation_config` here (mirroring the reference-edit profile). Set no `controlType` / `conditioningScales` / `idWeight` — those are other steps' fields, not this one's. A per-call `model` override the operator supplies still wins, but the default and only step model is Kontext Pro.

### Step 8: Save the edit prompt — then STOP

Persist the edit body + settings under **`layer:'composite'`**, then STOP.

**Fresh author (no saved `composite` row yet):**

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composite            # studio label "Edit"; NEVER 'product', NEVER 'model'
  body:              <the full edit instruction from Step 6 — reaches the engine verbatim>
  generation_config: { model: "fal-ai/flux-pro/kontext" }
```

**New edit when a `composite` row already exists (edit-on-edit).** The `(brief, 'composite')` prompt row always holds the **CURRENT pending edit**, so a new `change` **overwrites** it — pass `expected_version` = the row's current version (Step 2) for optimistic concurrency. This is deliberate: after the operator Generates + selects the prior edit's candidate, that edit is baked into the new chain tip, and the row is freed to carry the next edit.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composite
  body:              <the new edit instruction (Step 6)>
  generation_config: { model: "fal-ai/flux-pro/kontext" }
  expected_version:  <the composite row's current version>
```

**`revise: <note>` path (Step 2 rule 2).** Read the `composite` row's `body` + `version` from `list_creative_prompts`, rewrite that `body` applying the operator's note (still obeying every Step 5 rule — never name the copy, never negate, no baked-in text), keep/adjust `generation_config`, and re-save with **`expected_version`** = that version.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composite
  body:              <the REWRITTEN edit instruction — differs from the base by the operator's correction>
  generation_config: { model: "fal-ai/flux-pro/kontext" }
  expected_version:  <the composite row's current version>
```

A `stale_version` reject → **STOP** (Vietnamese): ai đó vừa sửa prompt này — hãy chạy lại; **chưa ghi gì** (you re-read `list_creative_prompts` next run). Never re-issue an unchanged body. **Never** call any generate tool on the revise path.

**Staleness (warn, never block).** If the Text step already has a selected candidate built on the current chain tip, first tell the operator (Vietnamese) — *thêm/đổi một edit ở bước này sẽ khiến bước chữ (đã dựng trên ảnh hiện tại) bị lỗi thời, cần dựng lại* — then proceed. Editing the recipe does not change the already-selected image; it never blocks the work.

### Step 9: Output summary

**If any step STOPPED** (non-ad idea; concept/brief not approved; no chain tip; nothing to revise; no `change` supplied; an invalid `product:`; a server reject), emit that stop message plainly — **the reason and the exact next action**, in Vietnamese. Write nothing.

**Otherwise, after the edit prompt is saved**, output:

```
## Ads Image Prompt — <concept title> — Edit (layer 'composite') saved

**Target:** brief <brief_id> (<angle_label>) · concept <idea_id>
**Editing:** chain tip <chain-tip id> (<"prior edit (composite)" | "Compose (model)" | "Subject (subject)" | "Scene (background)">)
**Change:** <one-line Vietnamese gist of the requested change>
**Product:** <"ảnh sản phẩm thật (<packshot id>) — gắn làm reference trong studio" | "không phải edit sản phẩm">
**Model:** fal-ai/flux-pro/kontext (reference edit)
**Saved:** layer='composite', propose-only (chưa generate, chưa tốn credit)
```

End with the NEXT action (Vietnamese): *Mở ImageStudio của brief này → **Generate** ở bước **Edit** rồi **chọn** một candidate. Bước Edit là **tùy chọn và lặp lại được** — chạy lại `/ssc.image-prompt <brief_id>` với `change: <thay đổi khác>` để dựng edit tiếp theo (edit-on-edit), hoặc sang bước **Text** (tiêu đề): `/ssc.image-prompt <brief_id> stage: text`.* For a product edit with no attached packshot, add: *Nhớ tải lên và gắn ảnh sản phẩm thật làm reference trong studio trước khi Generate.*

## Governance

- **Propose-only, ZERO-CREDIT (hard rule).** You author a **prompt + settings** and `save_creative_prompt`, then STOP. **Saving is not generating, approving, selecting, or uploading, and spends no credits.** Never call any `generate_*` / `compose_ad_visual` / `generate_text_layer` (`compose_ad_visual` is the studio's credit-spending Generate for this step — a human click, never yours), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None appears in the `tools:` list.
- **This step saves `layer:'composite'` — NEVER `layer:'product'`, NEVER `layer:'model'` (hard rule).** The studio labels it "Edit"; the backend key stays `composite`. The product is an **upload-only input** attached as a reference in the studio, not a prompt layer; the `model` layer is the **Compose** step's job (`ssc-image-prompt-compose`).
- **Generic edit, not a product composite (hard rule).** The body applies whatever change the operator asks for (`change:`) to the chain tip. Product placement is **one kind** of edit — its real-packaging fidelity discipline (real proportions, legible true label, never fabricated) is kept, applied only when the change touches the product.
- **OPTIONAL and REPEATABLE.** The step may run zero, one, or many times; each edit chains onto the new chain tip (edit-on-edit). The `(brief,'composite')` prompt row always carries the CURRENT pending edit; a new `change` overwrites it (with `expected_version`). No `change`/`revise` and no pending edit → STOP (the step is optional), routing to a `change:` or to Text.
- **Chain-tip precondition (hard rule).** A **chain tip** — the **nearest previous selection**, walking `['composite','model','subject','background']` (a prior **Edit** `composite`, a **Compose** `model`, a **Subject** `subject`, or a **Scene** `background`; optional steps transparent) — must exist before this step authors anything. Prev = the nearest previous selection; NEXT = Text (the Text step hangs off the chain tip, so skipping Edit is transparent). No chain tip → STOP (Vietnamese) routing back to an upstream step, writing nothing.
- **Grounding + prompt discipline (hard rule).** Ground in the requested change → the chain-tip image's own prompt → the chosen brief → persona doc → approved `copy` (**meaning only — its words are never named**) → visual + compliance KB. The authored `body` reaches the engine **verbatim**: never name the copy (quoted, paraphrased, or negated), never negate (state the desired end-state positively), no baked-in text. **No reserved-zone rules** — the reserved text geometry is retired.
- **`generation_config` is Kontext-only.** `{ model: 'fal-ai/flux-pro/kontext' }` — a reference-driven edit. Never set `controlType` / `conditioningScales` / `identityRef` / `idWeight`, and never force a ref id: the chain-tip parent and any product packshot are resolved/attached by the studio at Generate time. A per-call `model` override wins.
- **Revise is prompt-level, never a generate, and the note is never dropped.** `revise: <note>` rewrites the saved edit body (base = its `body`, from `list_creative_prompts`) with `expected_version`, still obeying every prompt rule. Never re-issue an unchanged prompt; never call a generate tool.
- **Deployment-dependency + permission STOPs are clean.** A server that rejects the `composite` layer/config, or an `insufficient role` / `forbidden` refusal, → STOP in Vietnamese, write nothing, **no retry loop**, no fallback.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party provider API.
- **Phase 1 = ad channel only.** A non-ad idea STOPS cleanly.
- **Operator-facing prose and persisted notes are Vietnamese**; the edit `body` is free-form.
- Requires the `edit` capability (for `list_creatives` / `list_creative_prompts` / `list_gallery_media` reads and the `save_creative_prompt` write); the brief/idea/copy/knowledge reads (`get_brief` / `get_idea` / `list_content` / `get_knowledge`) are satisfied by `view`.
