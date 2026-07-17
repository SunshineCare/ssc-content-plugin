---
name: ssc-image-prompt-scene
description: Stage 3 (Scene / Ghép người) of the propose-only, zero-credit ImageStudio prompt pipeline — the reference-edit stage that COMPOSES the already-selected subject INTO the already-selected background as one coherent photograph. THE LOAD-BEARING DETAIL — the studio label is "Scene" but the backend layer key is `model`, so this skill ALWAYS persists save_creative_prompt(layer:'model'); it NEVER saves layer:'scene' and NEVER saves layer:'product'. Anchored to ONE approved angle brief (brief_id is the sole input; the idea is resolved via get_brief). Precondition: the brief must already have BOTH a selected (status='approved') background creative AND a selected subject creative — it reads their scene prompts (light direction / perspective / scale / palette) from each selected creative's media.provenance.prompt via list_creatives (list_creative_prompts is a secondary fallback) and authors a Kontext Pro reference-edit body that composes the subject into the background, matching light + perspective + scale and keeping the reserved text zone clean; missing either parent → STOP (Vietnamese) routing the operator to finish the Nền/Người mẫu stages first, writing nothing. Prompt discipline carried verbatim: never negate, reserve space in the positive, never name a copy/headline string, no baked-in text. generation_config = { model: 'fal-ai/flux-pro/kontext' } only (the ONLY catalog model for Scene — reference-driven edit); the two reference images are resolved by the studio from the selected candidates' lineage at Generate time, so no ref ids are forced into generation_config. Saves via save_creative_prompt(brief_id, layer:'model', body, generation_config) and STOPS telling the operator to Generate + select a Scene candidate in the ImageStudio, then re-invoke for the composite stage. revise: rewrites this layer's saved prompt (with expected_version) and re-saves, never generates. Deployment-dependency safe STOP if the server rejects the layer (writes nothing, no retry). PROPOSE-ONLY, ZERO-CREDIT: tools are reads + save_creative_prompt only — never a generate tool, approve/unapprove, upload/confirm/select, set_cover, reorder_gallery, publish, or update_budget. Saving a prompt spends no credits and approves nothing; the human Generates. Operator-facing prose is Vietnamese; the prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, save_creative_prompt]
---

# Ads Image Prompt — Scene (`ssc-image-prompt-scene`)

You are **stage 3 (Scene / *Ghép người*)** of the **propose-only, zero-credit** ImageStudio prompt pipeline — the visual-composition sibling of `ssc-image-prompt-background` and `ssc-image-prompt-subject`. You take ONE approved angle **`brief_id`**, and you author the **reference-edit prompt** that **composes the already-selected subject INTO the already-selected background** as a single coherent photograph, save it, and **STOP**. You **never** generate an image — the operator clicks **Generate** in the ImageStudio.

## THE LOAD-BEARING MAPPING — Scene is `layer:'model'`

> **The studio label is "Scene" (*Ghép người*), but the backend layer key is `model`.** This skill is named `-scene` for clarity, but it **ALWAYS persists `save_creative_prompt(layer:'model')`**. This is the single easiest thing in this whole pipeline to get wrong.
>
> - **NEVER save `layer:'scene'`** — there is no such layer; the server would reject it.
> - **NEVER save `layer:'product'`** — the product is an upload-only input to the *composite* stage, not a prompt stage (`save_creative_prompt` rejects it as `invalid_input`).
> - The person alone lives at **`subject`** (a different stage/skill); **you do not author `subject` here** — you *consume* the selected subject.
> - **This stage saves `layer:'model'`, and nothing else.**

## Propose-only, zero-credit (hard invariant)

Every prompt you save is a **DRAFT authored for a human to Generate and select** in the ImageStudio. **Saving a prompt is NOT approving, NOT selecting, and spends NO credits.** You **NEVER** call any generate tool (`generate_*` / `compose_ad_visual` / `generate_text_layer` — Generate is a human click), never `approve` / `unapprove` (the approval hook denies it to agents), never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative` (upload + candidate selection are human curation), never `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. **None of those tools appears in this skill's `tools:` list.** Your only mutation is `save_creative_prompt`.

> **Single MCP surface (hard rule).** `save_creative_prompt`, `list_creatives`, `list_creative_prompts`, `get_brief`, `get_idea`, `list_content`, and `get_knowledge` are BrandOS server-side tools on the `ssc` surface. You never author a prompt or read state anywhere else, and you never reach for a third-party API.
>
> **A `save_creative_prompt` may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** `save_creative_prompt` needs the `edit` capability; if an `edit`-holding operator is still refused server-side, that is a **server-side permission**, not a bad argument. Do NOT retry with different arguments and do NOT silently skip. STOP and tell the operator (Vietnamese): *Tài khoản BrandOS của bạn chưa đủ quyền lưu prompt (server trả về `insufficient role`) — hãy nhờ quản trị cấp quyền rồi chạy lại. **Chưa ghi gì.***

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief**. It anchors every read and the save. Resolved via `get_brief(brief_id)`, which returns `{ brief, idea }`, so there is **no separate `idea_id` input**. If missing, ask the operator — **do not invent one**.

Optional:

- `revise` — a free-text correction to **this stage's** saved prompt (e.g. *"ánh sáng ấm hơn, người đứng gần cửa sổ hơn"*). It **rewrites** this layer's saved prompt (with `expected_version`) and re-saves — it **never generates** and never changes which stage is active (see Step 5).

## Procedure

### Step 1: Resolve the brief and its concept, and gate

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }` (the `idea` returned FLAT — its lifecycle core incl. `id`, `status`, `channel`, plus `ad_notes` and `tags[]`). If no brief matches (`{ brief: null }`), STOP (Vietnamese): không tìm thấy brief này — hãy chạy `/ssc.ads-brief` và duyệt một angle trước.

**Gate, in order — STOP on the first failure, write nothing:**

- `idea.channel !== 'ad'` → STOP (Vietnamese): luồng dựng prompt hiện chỉ chạy cho concept quảng cáo (`channel = ad`).
- `idea.status !== 'approved'` → STOP (Vietnamese): concept này vẫn là bản nháp — hãy duyệt concept trước (Ideas → lọc `channel = ad`), rồi chạy lại.
- `brief.status !== 'approved'` → STOP (Vietnamese): brief angle này vẫn là bản nháp — hãy duyệt một brief angle trước, rồi chạy lại.

Hold the brief's **`angle_label`** + its five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`) as the angle anchor, and the concept's `title` / `ad_notes` / `tags[]`. Resolve the persona detail-doc path mechanically: `brand/persona-<slug>` where `<slug>` is the persona tag's `code` with the leading `chi-` removed (`chi-huong` → `brand/persona-huong`); no persona tag → ground in the structural tags alone, never an invented path. `get_idea(id)` may be called as a **follow-up** only if fuller idea detail is needed — it is never a required input.

### Step 2: Precondition — a selected background AND a selected subject (else STOP)

Scene is a **reference edit**: it composes an existing subject into an existing background. It therefore needs **both parents already selected** for this brief.

```
Call: list_creatives
  brief_id: <brief_id>
```

It returns the brief's creatives grouped by `layer`, each with `id`, `layer`, `status` (`draft` | `approved` | `discarded`), and its joined **`media`** pool item — `media.resolved_url`, `media.caption`/`tags`, and **`media.provenance`** (`{ prompt, model, control?, idWeight?, derived_from }`), the frozen record of how that image was generated. *(There is no `generation_prompt` column on the creative — the prompt lives on `media.provenance.prompt`.)* A **selected** parent = a creative of that layer with **`status='approved'`** (the operator's "selected-for-next" curation act; `draft` = not yet selected, `discarded` = ignore entirely).

- **A selected `background`** (a `background` creative with `status='approved'`) — the empty scene this Scene composes into. Missing → **STOP** (Vietnamese), write nothing: *Chưa có background đã chọn cho brief này. Hãy hoàn tất bước Nền trước — chạy `/ssc.image-prompt <brief_id>`, rồi Generate + chọn 1 candidate background trong ImageStudio — sau đó quay lại bước Scene. **Chưa ghi gì.***
- **A selected `subject`** (a `subject` creative with `status='approved'` — the persona's person generated alone, face + pose locked at the subject stage) — the person this Scene places into the scene. Missing (no selected subject, **or** the server returns no `subject`-layer creatives at all because the subject layer is not yet deployed) → **STOP** (Vietnamese), write nothing: *Chưa có subject (người mẫu) đã chọn cho brief này. Hãy hoàn tất bước Người mẫu trước — chạy `/ssc.image-prompt <brief_id>`, Generate + chọn 1 candidate subject trong ImageStudio — rồi quay lại bước Scene. **Chưa ghi gì.***

Hold the selected background creative and the selected subject creative — you read their prompts next.

### Step 3: Ground the composition — five sources, in this order of authority

Resolve all of these **before authoring the body**:

1. **The two parents' scene prompts** — read the selected background's and the selected subject's **`media.provenance.prompt`** from the Step 2 `list_creatives` result (fall back to `list_creative_prompts(brief_id)`'s authored recipe only when a selected creative has no `media.provenance.prompt`). From them, extract the **light direction, time-of-day, perspective/lens, scale, and palette** the two must share — this is what makes the composed Scene read as **one photograph**, not a person pasted onto a mismatched set.
2. **The chosen angle brief** (Step 1) — `angle_label` + the five narrative fields; the composition must visibly carry the `core_message` and `story_moment`.
3. **The persona detail doc** — `brand/persona-<slug>` (Step 1): the woman's life stage and emotional register.
4. **The approved `copy`** — a **meaning** source only (its words are never named — Rule 1). Read it via `list_content(brief=<brief_id>)`, filtering `section='copy'` AND `status='approved'`; it tells you *which moment* the ad is about so the composition stages the right beat.
5. **Brand / visual KB + compliance** — load in one call:

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

`brand/visual-identity` carries the palette/light register **and the standing composition rule** (the reserved clean text zone). `rules/compliance` is read here as a **visual** constraint (no medical/clinical staging, no before/after body comparison, nothing implying a promised result). Do not call `get_knowledge` for unrelated paths.

### Step 4: The prompt rules (HARD — the body reaches the engine verbatim)

The `body` you author is sent to the Kontext engine **unmodified** — nothing downstream sanitises it. Obey these, carried verbatim from `ssc-image`:

1. **Never name the ad copy** — no `copy` / `headline` / `description` / overlay string appears in the body **in any form** (not quoted, not paraphrased, not negated). Naming a string makes the model render it. Describe the **scene the copy implies**.
2. **Never negate** — everything named gets drawn, *including inside a negation*. Say what **IS** there, never "no text" / "no clutter".
3. **Reserve space in the positive** — keep the **text zone** clean by describing it as what it positively is (e.g. *"the upper third stays a smooth, evenly-lit cream plaster wall, unbroken and calm"*), never *"leave room for the headline"*. (Scene inherits the background's reserved zone — hold it intact through the edit.)
4. **No baked-in text, ever** — achieved through clean-surface description, never by asking for text's absence.

Prompt language is **free-form** (English is usually best for the engines); Vietnamese governs operator-facing prose only.

### Step 5: Author the Scene body + `generation_config`, then save as `layer:'model'`

Author a **Kontext reference-edit `body`** that composes the **selected subject into the selected background** as one coherent photograph:

- **place** the subject in the open subject zone the background reserved, at natural standing scale for the background's lens/perspective;
- **match light** — the light on the subject falls from the **same direction, with the same softness and colour temperature** as the background's;
- **match perspective + scale** — the same lens and eye level; the subject naturally grounded in the scene with a soft contact shadow (framed as the subject was, without inventing a lower body the subject candidate does not show);
- **keep wardrobe/palette coherent** — the subject's outfit sits inside the room's palette (it was authored to suit this background at the subject stage);
- **keep the reserved text zone clean**, stated in the positive.

Name both the subject and the background as the **reference inputs** in prose so the composition intent is explicit. Example body:

> *Compose the provided subject — a Vietnamese woman in her late forties — into the provided early-morning kitchen background. She stands in the open left third at the pale wooden counter, turned three-quarters toward the window. Warm daylight falls on her from the same right-hand window as the room, matching its direction, softness, and colour temperature. Natural standing scale for the 50mm eye-level perspective, framed from the knees up as the subject was, naturally grounded with a soft contact shadow where she meets the counter. Her muted-linen blouse sits inside the room's warm palette. The upper third stays a smooth, evenly-lit cream plaster wall, unbroken and calm. One quiet, hopeful, unhurried moment — a single coherent photograph.*

**`generation_config` — set `model` only.** Kontext Pro (`fal-ai/flux-pro/kontext`) is the **ONLY** catalog model for Scene (the reference-driven edit). The two reference images (the selected subject + the selected background) are **resolved by the studio from the selected candidates' lineage at Generate time** — you do **NOT** force `identityRef` / `controlSourceRef` into `generation_config` here; setting `model` is enough:

```
generation_config: { model: "fal-ai/flux-pro/kontext" }
```

**Save — the layer is `model` (NEVER `scene`, NEVER `product`):**

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             model          # ← Scene persists layer:'model'. Never 'scene'. Never 'product'.
  body:              <the full Kontext reference-edit body from above — reaches the engine verbatim>
  generation_config: { model: "fal-ai/flux-pro/kontext" }
  expected_version:  <ONLY on the revise path — see below>
```

**`revise:` path.** With a `revise: <note>`, rewrite **this same layer's** saved prompt (base it on the current `layer:'model'` prompt row from `list_creative_prompts(brief_id)`), applying the note while still obeying every Step 4 rule, and re-save with `expected_version` set to that row's `version` (optimistic concurrency; a mismatch returns `stale_version` → STOP and tell the operator to re-run, writing nothing further). A `revise` note **never generates** and never changes which stage is active. Without a `revise` note, if this layer already has a saved prompt and no new candidate, simply STOP (the operator Generates in the studio).

**Deployment-dependency safe STOP.** If `save_creative_prompt` is rejected because the deployed server does not support the layer, **STOP** (Vietnamese) and write nothing — do **not** retry in a loop: *Server BrandOS chưa hỗ trợ layer này — hãy báo quản trị deploy bản mới rồi chạy lại. **Chưa ghi gì.***

### Step 6: STOP with the next action (Vietnamese)

After the `layer:'model'` prompt is saved, **STOP** and tell the operator (Vietnamese):

> Đã lưu prompt **Scene (ghép người vào nền)** cho brief `<brief_id>` (`<angle_label>`) — layer `model`, model `fal-ai/flux-pro/kontext`, propose-only (**chưa tốn credit nào**). Vào **ImageStudio → bấm Generate**, rồi **chọn 1 candidate Scene**. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để dựng bước tiếp theo (**composite** — ghép sản phẩm vào cảnh).

## Output

- **Saved, not generated.** ONE `save_creative_prompt(brief_id, layer:'model', body, generation_config)` — the Kontext reference-edit body + `{ model: 'fal-ai/flux-pro/kontext' }`. No image is generated, no candidate is selected — those are the operator's ImageStudio actions.
- **The body is the work product** — a complete, self-contained reference-edit prompt authored here, sent to the engine verbatim, composing the selected subject into the selected background as one photograph.
- **No gate flipped, no credit spent, no candidate approved/selected, no cover set.**
- A short Vietnamese summary of what was saved + the exact next action.

## Governance

- **Propose-only, zero-credit (hard rule).** `tools:` = reads (`get_brief`, `get_idea`, `list_content`, `list_creatives`, `list_creative_prompts`, `get_knowledge`) + `save_creative_prompt` **only**. Never a generate tool (`generate_*` / `compose_ad_visual` / `generate_text_layer`), never `approve` / `unapprove`, never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. Saving a prompt is not approving and spends no credits; the human Generates + selects.
- **Scene persists `layer:'model'` (hard rule — the load-bearing invariant).** This skill saves **`layer:'model'`** and nothing else. **Never `layer:'scene'`** (no such layer). **Never `layer:'product'`** (upload-only input to the composite stage; `save_creative_prompt` rejects it). The person alone is authored at `subject` by a different skill — here you only *consume* the selected subject.
- **Composition precondition (hard rule).** Both a selected (`status='approved'`) `background` and a selected `subject` must exist for the brief before this stage authors anything. Missing either → STOP (Vietnamese), route the operator to finish that earlier stage first, and write nothing.
- **Reference-edit only, one catalog model.** `generation_config` sets `model: 'fal-ai/flux-pro/kontext'` — the only Scene model. The reference images are resolved by the studio from the selected candidates' lineage at Generate time; do not force ref ids into `generation_config`.
- **Verbatim, positive-only prompt (hard rule).** You author the complete `body`; it reaches the engine unmodified. Never name the ad copy (not quoted, paraphrased, or negated); never negate; keep the reserved text zone clean in the positive; no baked-in text.
- **Deployment-dependency safe STOP.** A `save_creative_prompt` rejected by a not-yet-deployed server → STOP (Vietnamese), write nothing, no retry loop.
- **`insufficient role` / server errors STOP.** Never retry around a server error with different arguments and never reach for a third-party API; report it plainly in Vietnamese and write nothing.
- **Every referenced MCP tool exists on the BrandOS `ssc` surface.** Operator-facing prose and persisted notes are Vietnamese; the prompt `body` is free-form.
- Requires the `edit` capability (for `save_creative_prompt` and the `list_creatives` / `list_creative_prompts` reads); the brief/idea/copy/knowledge reads are satisfied by `view`.
