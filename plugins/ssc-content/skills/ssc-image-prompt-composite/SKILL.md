---
name: ssc-image-prompt-composite
description: Stage 4 (studio label "Product") of the propose-only, ZERO-CREDIT ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads — the composite sibling of ssc-image-prompt-background/-subject/-scene, and the prompt-only counterpart of ssc-image's compose_ad_visual step. It AUTHORS the composite scene prompt that places the REAL PRODUCT into the already-approved Scene with correct perspective, scale, contact shadow, and matching light — then persists it via save_creative_prompt(brief_id, layer:'composite', body, generation_config) and STOPS. It NEVER generates and NEVER spends credits: Generate + candidate selection are the operator's ImageStudio clicks. The product itself is an UPLOAD-ONLY input (a real packshot the operator uploads) — it is NEVER a prompt layer, so this skill never saves layer:'product' (the server rejects it); it saves layer:'composite' only. brief_id is the sole required input, resolved via get_brief → { brief, idea } (gate: idea channel='ad' + status='approved', brief status='approved'; else STOP in Vietnamese). Two hard preconditions read from list_creatives: (a) a SELECTED/approved model (Scene) creative for the brief — missing → STOP routing to the Scene stage; (b) a real PRODUCT PACKSHOT present in the pool — a product-layer creative or a gallery packshot (list_creatives / list_gallery_media). No packshot → STOP (Vietnamese) asking the operator to UPLOAD the real packshot in the dashboard, writing nothing (you never upload, never generate the product). SEVERAL approved packshots and no product: selector → STOP and ASK which, never guess. The authored generation_config picks a control-edit model — fal-ai/flux-general (perspective + label lock) or fal-ai/flux-control-lora-depth (depth) with controlType ('depth'|'canny') + conditioningScales (number[]) + controlSourceRef = the packshot's pool id when resolvable (else left unset with a note), or fal-ai/flux-pro/kontext (plain reference edit, NO control fields). Prompt discipline carried verbatim: never name the ad copy (quoted, paraphrased, or negated), never negate, reserve the text zone in the positive, no baked-in text. revise: <note> rewrites this layer's saved composite prompt (base = its body) with expected_version and re-saves — never dropped, never a generate. A deployment-dependency STOP surfaces cleanly if the server rejects the composite layer (writes nothing, no retry). tools: reads + save_creative_prompt only — never a generate tool, approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget. Operator-facing prose is Vietnamese; the prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, list_gallery_media, save_creative_prompt]
---

# Ads Image Prompt — Composite / *Sản phẩm* (`ssc-image-prompt-composite`)

You are **stage 4** of the Cambridge Diet Vietnam **ImageStudio prompt-authoring** pipeline — the **propose-only, zero-credit** sibling of `/ssc.image`. On this invocation you author the **composite** scene prompt (studio label **"Product" / *Sản phẩm*** — layer `composite`): a prompt that places the **real product packshot** into the already-approved **Scene** with correct perspective, scale, contact shadow, and matching light — then you **save it** with `save_creative_prompt` and **STOP**. The operator clicks **Generate** and selects a candidate in the ImageStudio; you never generate.

> **Load-bearing layer mapping.** This stage persists **`save_creative_prompt(layer:'composite')`** — NOTHING else. The **product** is an **upload-only input** (a real packshot the operator uploads), **never a prompt layer**: `save_creative_prompt` **rejects `layer:'product'`**. You place the product; you never author a "product" prompt and never save `layer:'product'`.

> **Propose-only, ZERO-CREDIT (hard invariant, held by three layers: the server `approve` capability, the `approval-gate.mjs` hook, and this prose).** You author a **prompt + settings** and save them. That is not generating, not approving, not selecting, not uploading, and spends **no** credits. Your `tools:` are the reads above + `save_creative_prompt` ONLY. You **NEVER** call any `generate_*` / `compose_ad_visual` / `generate_text_layer` (Generate is a human click), `approve` / `unapprove` (the hook denies these to subagents), `upload_creative` / `confirm_creative_upload` / `select_gallery_creative` (upload + candidate selection are human curation — **the product upload is the operator's dashboard action**), `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None of those appears in this skill's `tools:` list.

> **Single MCP surface (hard rule).** Every read and the one write are BrandOS server-side tools on the `ssc` surface (`mcp__ssc__…`). You never curl a provider API and never produce or upload an image outside the BrandOS surface — not even when a call fails.

> **A `save_creative_prompt` may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** That is a **server-side permission**, not a bad argument. Do NOT retry with different arguments, do NOT fall back to anything, do NOT silently skip. STOP and tell the operator (Vietnamese): *Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`). Hãy nhờ quản trị cấp quyền rồi chạy lại. **Chưa ghi gì.***

> **Deployment-dependency safe STOP.** If the deployed server **rejects the `composite` layer** (an older server not yet carrying the studio layer enum), STOP cleanly (Vietnamese): *Server BrandOS chưa hỗ trợ layer `composite` — báo quản trị deploy bản mới rồi chạy lại; **chưa ghi gì.*** **Never** retry in a loop and never fall back to another layer.

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief**. The **sole** input: `get_brief(brief_id)` returns the brief **AND** its owning ad concept, so there is no separate `idea_id`.

Optional:

- `product` — a **`product` creative id** (or gallery packshot id) naming **which** approved packshot the composite should use. Needed **only** when the brief has **more than one** approved packshot (with exactly one, it is resolved without asking). A `product` that is not an approved packshot for this brief → **STOP** naming the valid ones.
- `revise` — a free-text correction (Vietnamese) for the **composite** prompt. Never dropped: it **rewrites** this layer's saved composite prompt and re-saves (Step 8). It never changes which stage is active and never generates.
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

### Step 2: Precondition (a) — a SELECTED Scene (`model`) creative exists

```
Call: list_creatives
  brief_id: <brief_id>
```

It returns `creatives[]`, each with `id`, `layer`, `status`, and its joined **`media`** pool item — `media.resolved_url` and **`media.provenance`** (`{ prompt, model, control?, idWeight?, derived_from }`, the frozen record of how the image was made). *(There is no `generation_prompt` column on the creative — the prompt lives on `media.provenance.prompt`.)* Find a **`model`**-layer creative with `status='approved'` (i.e. **selected-for-next** — the composed Scene the operator picked).

- **No selected `model` creative** → **STOP** (Vietnamese), write nothing: *Chưa có cảnh (Scene) nào được chọn cho brief này — hãy dựng và chọn một candidate ở bước Scene trước (`/ssc.image-prompt <brief_id>` sẽ dừng ở bước đó), rồi chạy lại để ghép sản phẩm vào cảnh đã chọn.*

Hold the selected Scene creative's **`id`** (its `media.resolved_url` + `media.provenance.prompt` describe the scene you place the product into — its light, perspective, palette, and the reserved clean text zone you must keep intact).

### Step 3: Precondition (b) — a real PRODUCT PACKSHOT is in the pool (upload-only)

The product must be the **real packaging photograph**. You **never generate it** and **never broker its upload** — `upload_creative` / `confirm_creative_upload` are deliberately absent from your `tools:`. Find it in the brief's pool — a **`product`-layer creative** (from Step 2's `list_creatives`) OR a gallery packshot:

```
Call: list_gallery_media
  brief_id: <brief_id>       # look for product-packshot items (kind:product / a packaging shot)
```

Resolve the set of **approved product packshots** for the brief (`product`-layer creatives with `status='approved'`, plus any product-packshot gallery items). Branch:

- **No packshot at all** → **STOP** (Vietnamese), write nothing: *Chưa có ảnh sản phẩm thật nào trong kho cho brief này. Hãy **tải lên ảnh bao bì sản phẩm thật** và duyệt nó trong `/ad/<month>/<idea_id>`, rồi chạy lại — mình sẽ dựng prompt ghép sản phẩm đã duyệt vào cảnh. (Mình không tạo và không tải ảnh sản phẩm — đó là thao tác của bạn trên dashboard; sản phẩm phải là ảnh thật.)*
  - If a **pending (unapproved) draft** packshot exists, say so and ask the operator to **approve the pending photo** (or discard + upload another) rather than upload a new one.
- **Exactly ONE approved packshot** → that is the product. Use it **without asking**. Hold its **pool id** for `controlSourceRef` (Step 7).
- **SEVERAL approved packshots and no `product:` input** → **STOP and ASK which** (Vietnamese), write nothing — **never guess** by recency or any heuristic:

  > Brief này có **nhiều ảnh sản phẩm đã duyệt** — mình **không tự chọn**. Hãy cho biết dùng ảnh nào:
  >
  > | packshot | Mô tả |
  > |---|---|
  > | `<id 1>` | *hộp Cambridge, nền trắng, chính diện* |
  > | `<id 2>` | *hộp Cambridge, cầm trên tay, nền bếp* |
  >
  > Chạy lại: `/ssc.image-prompt <brief_id> product: <id>`. **Chưa ghi gì.**

- **`product:` supplied** → validate it is an approved packshot of this brief; if not → **STOP** listing the valid ones. Hold its **pool id** for `controlSourceRef`.

### Step 4: Ground the composite — five sources, in this order of authority

Resolve all five **before authoring the prompt**: (1) the chosen **angle brief** — `angle_label` + the five narrative fields (the visual expresses this angle, its `core_message` + `story_moment`); (2) the **persona detail doc** (`brand/persona-<slug>`, Step 1); (3) the approved **`copy`** — a **meaning** source only, never its words (read via `list_content(brief: <brief_id>)`, `section='copy'`, `status='approved'` — content is brief-keyed, like every sibling stage); (4) **brand/visual KB + compliance**; (5) the **concept** (`idea.title`, `ad_notes`, tags) — **plus the selected Scene's own `media.provenance.prompt`** (Step 2), which tells you the exact light, perspective, palette, and reserved text zone the product must sit inside.

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

### Step 5: The prompt rules (HARD — the prompt reaches the engine verbatim)

The composite `body` describes **only the scene**: how the real product sits in the approved Scene — its surface, scale, contact shadow, and the light/palette it must match — while the reserved clean text zone stays intact. Obey, verbatim from `ssc-image`:

1. **Never name the ad copy** — no `copy`/`headline`/overlay string, **quoted, paraphrased, or negated** (naming a string makes the model render it). Describe the scene the copy implies.
2. **Never negate** — everything named gets drawn, including inside a negation. Say what **IS** there (✅ *"a smooth, evenly-lit cream plaster wall, unbroken and calm"* — not *"no text"*).
3. **Reserve the text zone in the positive** — describe the clean band as what it positively **IS** (✅ *"the upper third stays a smooth, evenly-lit cream plaster wall"*), never *"leave room for the headline"* / *"no text"*. This is the **standing composition rule from the visual KB**, not derived from any overlay body.
4. **No baked-in text, ever** — achieved through clean-surface description, never by asking for text's absence.

The prompt `body` is **free-form** (English is usually best for the engines); only operator-facing prose stays Vietnamese.

### Step 6: Author the composite `body`

Write one complete scene prompt that **places the real product into the selected Scene**:

- the product package rests on a plausible surface in the Scene at **natural, correct scale**, **grounded by a soft contact shadow**;
- the light on the product matches the Scene's **direction, softness, and colour temperature** (read them from the selected Scene's `media.provenance.prompt`);
- **the product's own perspective and label read true** — same camera angle / lens as the Scene, the packaging face legible and undistorted;
- the palette matches the Scene throughout;
- the **reserved clean text zone stays intact, stated in the positive**.

Example:

> *The Cambridge product package rests on the pale wooden counter to the woman's right, at natural arm's-length scale, its base grounded by a soft contact shadow. Warm morning light from the window lands on it from the same direction as on her, matching softness and colour temperature; the packaging face is turned slightly toward the lens, legible and true to its real proportions. The upper third stays a smooth, evenly-lit cream plaster wall, unbroken and calm. Same 50mm eye-level perspective; muted warm palette throughout.*

### Step 7: Author `generation_config` — pick a control-edit model

Choose the model to the capability the composite needs — locking the product's **perspective + label** while it is inserted into the Scene — and set **only** the fields that model's profile declares:

- **`fal-ai/flux-general`** — perspective + label lock (identity-control profile). Set `controlType` (`'depth'` for volume/placement, `'canny'` for edge/label fidelity), `conditioningScales` (a **number array**, e.g. `[0.7]`), and `controlSourceRef` = the **packshot's pool id** (Step 3) when resolvable.
- **`fal-ai/flux-control-lora-depth`** — depth control. Set `controlType: 'depth'` + `conditioningScales` + `controlSourceRef`.
- **`fal-ai/flux-pro/kontext`** — a plain **reference edit**. Set `model` only — **do NOT** set `controlType` / `conditioningScales` / `controlSourceRef` (a reference-edit profile declares no control fields).

**Reference resolution.** Name `controlSourceRef` (the packshot's pool id) **only when resolvable** from Step 3. If it cannot be resolved cleanly, author `body` + `model` (+ `controlType`/`conditioningScales` for a control model), **leave `controlSourceRef` unset**, and say plainly in the STOP that the operator should attach the real packshot as the control/reference in the studio. **Never guess a pool id.**

```
generation_config (example — control model):
  { "model": "fal-ai/flux-general", "controlType": "depth", "conditioningScales": [0.7], "controlSourceRef": "<packshot pool id>" }

generation_config (example — plain reference edit):
  { "model": "fal-ai/flux-pro/kontext" }
```

Set no `identityRef` / `idWeight` here — those are the `subject` stage's fields, not the composite's.

### Step 8: Save the composite prompt — then STOP

Persist the layer's prompt + settings, then STOP. On a fresh author (no saved composite prompt yet):

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composite            # NEVER 'product'
  body:              <the full composite scene prompt from Step 6 — reaches the engine verbatim>
  generation_config: <the object from Step 7>
```

**Staleness (warn, never block).** If this composite already has a selected candidate **and** the text stage also has one, first tell the operator (Vietnamese) — *đổi ảnh composite ở bước này sẽ khiến bước chữ (đã dựng trên ảnh hiện tại) bị lỗi thời, cần dựng lại* — then proceed. Editing the recipe does not change the already-selected composite image; it never blocks the work.

**`revise: <note>` path.** Read `list_creative_prompts(brief_id)` for the **composite** row and its `version`. Rewrite that row's `body` applying the operator's note (still obeying every Step 5 rule — never name the copy, never negate, reserve the text zone in the positive), keep/adjust `generation_config`, and re-save with **`expected_version`** = that version for optimistic concurrency:

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composite
  body:              <the REWRITTEN composite prompt — differs from the base by the operator's correction>
  generation_config: <the object from Step 7>
  expected_version:  <the composite row's current version>
```

If the composite row does not exist yet, a `revise:` note is simply **folded into the fresh prompt** you author (no `expected_version`). A `stale_version` reject → **STOP** (Vietnamese): ai đó vừa sửa prompt này — hãy chạy lại; **chưa ghi gì** (you re-read `list_creative_prompts` next run). **Never** call any generate tool on the revise path.

### Step 9: Output summary

**If any step STOPPED** (non-ad idea; concept/brief not approved; no selected Scene; no packshot; several packshots and no `product:`; an invalid `product:`; a server reject), emit that stop message plainly — **the reason and the exact next action**, in Vietnamese. Write nothing.

**Otherwise, after the composite prompt is saved**, output:

```
## Ads Image Prompt — <concept title> — Composite (layer 'composite') saved

**Target:** brief <brief_id> (<angle_label>) · concept <idea_id>
**Built on:** scene đã chọn (model <id>) + ảnh sản phẩm <"đã duyệt (<packshot id>)" | "chưa gắn được — cần gắn control ref trong studio">
**Model:** <the generation_config model id>
**Control:** <"controlType=<depth|canny>, conditioningScales=<[…]>, controlSourceRef=<id>" | "reference edit (Kontext) — không control field" | "controlSourceRef chưa gắn — gắn packshot trong studio">
**Saved:** layer='composite', propose-only (chưa generate, chưa tốn credit)
```

End with the NEXT action (Vietnamese): *Mở ImageStudio của brief này → **Generate** ở bước Product rồi **chọn** một candidate composite. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để dựng prompt bước **Text** (tiêu đề).* If `controlSourceRef` was left unset, add: *Nhớ gắn ảnh sản phẩm thật làm control/reference trong studio trước khi Generate.*

## Governance

- **Propose-only, ZERO-CREDIT (hard rule).** You author a **prompt + settings** and `save_creative_prompt`, then STOP. **Saving is not generating, approving, selecting, or uploading, and spends no credits.** Never call any `generate_*` / `compose_ad_visual` / `generate_text_layer`, `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None appears in the `tools:` list. Generate + candidate selection are the operator's ImageStudio actions.
- **This stage saves `layer:'composite'` — NEVER `layer:'product'` (hard rule).** The product is an **upload-only input**, not a prompt layer; `save_creative_prompt` rejects `layer:'product'`. You place the product into the Scene; you never author or save a "product" prompt.
- **Product is real, and the upload is the operator's.** The product is never generated **and never uploaded by you** — `upload_creative` / `confirm_creative_upload` are not in the `tools:` list. No packshot → **STOP and ask** for the upload + approval. Exactly one approved packshot → use it without asking. Several + no `product:` → **STOP and ask which** — never guess.
- **Preconditions checked in order (hard rule).** (1) idea `channel='ad'` + `status='approved'`; (2) `brief_id` is an **approved** angle brief of that idea; (3) a **selected `model` (Scene)** creative exists — else STOP routing to the Scene stage; (4) a **real product packshot** is in the pool — else STOP asking for the upload. Any failure → STOP with the exact unmet condition and next action, in Vietnamese, writing nothing.
- **Grounding + prompt discipline (hard rule).** Ground in the chosen brief → persona doc → approved `copy` (**meaning only — its words are never named**) → visual + compliance KB → the concept + the selected Scene's own prompt. The authored `body` reaches the engine **verbatim**: never name the copy (quoted, paraphrased, or negated), never negate, reserve the text zone **in the positive**, no baked-in text.
- **`generation_config` is capability-matched.** Set only the fields the chosen model's profile declares — a control model (`fal-ai/flux-general` / `fal-ai/flux-control-lora-depth`) carries `controlType` + `conditioningScales` (a number array) + `controlSourceRef` (the packshot pool id, only when resolvable); a plain reference edit (`fal-ai/flux-pro/kontext`) carries `model` only. Never set `identityRef` / `idWeight` here. A reference is named only when resolvable — else leave it unset and tell the operator to attach it in the studio; never guess a pool id.
- **Revise is prompt-level, never a generate, and the note is never dropped.** `revise: <note>` rewrites the saved composite prompt (base = its `body`, from `list_creative_prompts`) with `expected_version`, still obeying every prompt rule. Never re-issue an unchanged prompt; never call a generate tool.
- **Deployment-dependency + permission STOPs are clean.** A server that rejects the `composite` layer, or an `insufficient role` / `forbidden` refusal, → STOP in Vietnamese, write nothing, **no retry loop**, no fallback.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party provider API.
- **Phase 1 = ad channel only.** A non-ad idea STOPS cleanly.
- **Operator-facing prose and persisted notes are Vietnamese**; the image-prompt `body` is free-form.
- Requires the `edit` capability (for `list_creatives` / `list_creative_prompts` / `list_gallery_media` reads and the `save_creative_prompt` write); the brief/idea/copy/knowledge reads (`get_brief` / `get_idea` / `list_content` / `get_knowledge`) are satisfied by `view`.
