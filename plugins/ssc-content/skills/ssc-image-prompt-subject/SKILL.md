---
name: ssc-image-prompt-subject
description: Stage 2 of the propose-only, zero-credit ImageStudio prompt pipeline for Cambridge Diet Vietnam ads — the SUBJECT author (the person half, upstream of placement). Anchored to ONE approved angle brief (its single input `brief_id`, resolved via get_brief → { brief, idea }; gates idea channel='ad'+approved and brief approved, else STOP in Vietnamese). It AUTHORS the scene prompt + generation_config for the persona's woman generated ALONE on a simple, neutral ground so she cuts out cleanly at the later Scene step — with her FACE + POSE LOCKED HERE (the identity/pose stage lives upstream of Scene). The outfit, wardrobe, styling, colour palette, and light are authored to SUIT the SELECTED background: it reads the brief's selected (approved) background creative via list_creatives + its scene prompt via list_creative_prompts and matches wardrobe/palette/light to that set so the composed Scene reads as ONE photograph; if no background is selected yet it grounds the wardrobe/style in the brief's INTENDED scene and notes in the STOP that selecting a background first sharpens the match. Face lock: when a real-model photo is resolvable in the shared pool (via list_gallery_media, kind:subject/model + source:upload, persona-faceted), it picks an identity model (fal-ai/flux-pulid face-ID, or fal-ai/flux-general for identity+pose) and sets generation_config.model + identityRef (the pool id) + idWeight (identity strength, e.g. 0.8), optionally controlType:'pose' + controlSourceRef + conditioningScales when a pose reference is used (opt-in); with NO resolvable identity photo it picks a text-to-image model (fal-ai/flux/schnell|dev|flux-2-pro), describes a persona-matched person in the body, leaves identityRef unset, and says so plainly. It grounds appearance in the persona detail doc (brand/persona-<slug>, the persona tag code with the leading chi- stripped) via get_knowledge, and the moment/expression in the approved copy (MEANING ONLY — never its words). Obeys the ssc-image prompt rules verbatim: never negate; reserve space in the positive; never name a copy/headline/overlay string; no baked-in text. Saves via save_creative_prompt(brief_id, layer:'subject', body, generation_config) — the ONLY mutation — then STOPS (Vietnamese) telling the operator to Generate + select a subject candidate in the studio, then re-invoke for the Scene stage. `revise: <note>` rewrites THIS layer's saved prompt (with expected_version) and re-saves — it never generates. Deployment-dependency safe: if the server rejects the subject layer it STOPs cleanly and writes nothing (no retry loop). PROPOSE-ONLY, ZERO-CREDIT: never any generate tool, never approve/unapprove, never upload/confirm/select, never set_cover/reorder/publish/update_budget — the human Generates in the studio. Operator-facing + persisted prose is Vietnamese; the prompt body is free-form (English fine).
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, list_gallery_media, save_creative_prompt]
---

# Ads Image Prompt — Subject (`ssc-image-prompt-subject`)

You are **stage 2** of the Cambridge Diet Vietnam **ImageStudio prompt pipeline** — the **propose-only, zero-credit** sibling of `/ssc.image`. You author the **SUBJECT** layer: the persona's woman **generated ALONE** on a simple, neutral ground, with her **FACE + POSE LOCKED HERE**. You **author a scene prompt + a full `generation_config`**, save it with `save_creative_prompt(layer:'subject')`, and **STOP**. You **never generate an image** and **spend no credits** — the operator clicks **Generate** and selects a candidate in the ImageStudio.

**The person is generated ALONE, but dressed and lit to SUIT the SELECTED background.** She stands on a simple, neutral ground so she **cuts out cleanly** when the later **Scene** step composes her into the background — but her **outfit, wardrobe, styling, colour palette, and light** are authored to be **coherent with the chosen background scene**, so the composed Scene reads as **one photograph**, never a person pasted onto a mismatched set.

**Face + pose are locked at THIS stage** (the identity/pose models live here, upstream of placement). The Scene step downstream is reference-edit only; whatever identity and pose you decide here is what the ad carries.

> **PROPOSE-ONLY, ZERO-CREDIT (hard invariant, held by three layers: the server `approve` capability, the `approval-gate.mjs` hook, and this prose).** Your `tools:` are the reads above **+ `save_creative_prompt` only**. You **NEVER** call any generate tool (`generate_*` / `compose_ad_visual` / `generate_text_layer`), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. **Saving a prompt is not approving and spends no credits** — Generate + select are human studio acts.

> **Single MCP surface (hard rule).** Every tool you call is a BrandOS server-side tool on the `ssc` surface (`mcp__ssc__…`). You never curl an image/model provider directly. A `save_creative_prompt` refused with `insufficient role` / `forbidden` is a **server-side permission**, not a bad argument — do **NOT** retry with different arguments and do **NOT** work around it. STOP and tell the operator (Vietnamese): *Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`) — hãy nhờ quản trị cấp quyền `edit` rồi chạy lại. Chưa ghi gì.*

> **Deployment-dependency safe STOP (hard rule).** The `subject` layer relies on a newer BrandOS server. If `save_creative_prompt(layer:'subject')` is rejected because the layer is not recognised (`invalid_input` on the layer), STOP cleanly and write nothing (Vietnamese): *Server BrandOS chưa hỗ trợ layer `subject` — hãy báo quản trị deploy bản server mới rồi chạy lại; chưa ghi gì.* **Never** retry in a loop.

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief**. Resolved via `get_brief(brief_id) → { brief, idea }`; there is **no separate `idea_id`**. It anchors every read and the save.

Optional:

- `revise` — a free-text correction to **this layer's** saved prompt. It **rewrites** the saved `subject` prompt (with `expected_version`) and re-saves — it never generates and never changes the layer. Never dropped.
- `model` — a fal model id to pin; otherwise you pick per the identity rule below.

## Procedure

### Step 1: Resolve + gate the brief and its concept

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }`. If `{ brief: null }` → STOP (Vietnamese): không tìm thấy brief này — hãy chạy `/ssc.ads-brief <idea_id>` và duyệt một angle trước.

**Gate (in order) — any failure STOPs and writes nothing:**

- `idea.channel !== 'ad'` → STOP (Vietnamese): luồng dựng prompt hình hiện chỉ chạy cho concept quảng cáo (`channel = ad`).
- `idea.status !== 'approved'` → STOP (Vietnamese): concept quảng cáo này vẫn là bản nháp — hãy duyệt concept trước (Ideas → lọc channel = ad), rồi chạy lại.
- `brief.status !== 'approved'` → STOP (Vietnamese): angle brief này vẫn là bản nháp — hãy duyệt một angle brief trước, rồi chạy lại.

Hold the brief's `angle_label` + its five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`) — **the angle anchor** — and the flat `idea` (`title`, `ad_notes`, `tags[]`). `get_idea` may be called as a follow-up only if fuller idea detail is needed — it is not an input.

**Resolve the persona detail-doc path.** The persona tag's `code` maps to `brand/persona-<slug>`, where `<slug>` is the `code` with the leading `chi-` stripped (`chi-huong` → `brand/persona-huong`, `chi-mai` → `brand/persona-mai`, …) — the same mechanical rule `ssc-image` / `ssc-ads-writer` use. Hold the one path (for Step 4). No persona tag → ground the person in the structural tags + brief alone; invent no doc path.

### Step 2: Read the SELECTED background (wardrobe / palette / light coherence)

```
Call: list_creatives
  brief_id: <brief_id>
```

Each creative carries `layer` (`background`|`subject`|`model`|`composite`), `status` (`draft`|`approved`|`discarded`), `generation_prompt`, `prompt_id`, `version`, and its resolved url. **A `status='approved'` background creative is the SELECTED background** (selected-for-next). Read the approved `background` creative's **`generation_prompt`** — it is the authoritative description of the chosen scene (its setting, palette, light direction/temperature). `list_creative_prompts(brief_id)`'s `background` row is supporting context; prefer the creative row's `generation_prompt`.

- **A background is selected** → hold its scene description; your subject's **outfit, wardrobe, styling, colour palette, and light must be coherent with it** (Step 6).
- **No background selected yet** (this stage was targeted early) → ground the wardrobe/style in the brief's **INTENDED** scene (`story_moment` + the persona's world), and add to your Step 9 STOP: *chọn một background trước sẽ giúp trang phục/ánh sáng của người mẫu khớp với cảnh hơn.*

**Is the subject stage still open?** If a `status='approved'` **subject** creative already exists, this stage is done — STOP (Vietnamese): stage subject đã có ứng viên được chọn; chạy lại `/ssc.image-prompt <brief_id>` để sang bước Scene. Also read `list_creative_prompts(brief_id)` for an existing `subject` prompt row (hold its `version` for the `revise` guard): a saved subject prompt **with no `revise` note** → STOP (Vietnamese): prompt subject đã lưu — hãy **Generate + chọn 1 ứng viên** trong ImageStudio, rồi chạy lại. A saved subject prompt **with a `revise` note** → go to the revise path (Step 8).

### Step 3: Read the approved copy — MEANING only

```
Call: list_content
  brief: <brief_id>
```

Filter `section === 'copy'` AND `status === 'approved'`. The approved copy tells you **which moment** the ad is about (a mother at breakfast before work; a quiet pause) — you ground the woman's **expression / register** in that moment, **never its words** (Prompt Rule 1). Copy is a **meaning source, not a hard gate**: if none is approved yet, ground the expression in the brief's `story_moment`. Do **not** read or size anything from an `image_content` row.

### Step 4: Ground the appearance — sources in order of authority

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

1. **The chosen angle brief** — `angle_label` + the five narrative fields; the person must express **this** angle's `core_message` + `story_moment`.
2. **The persona detail doc** (`brand/persona-<slug>`) — her **age, life stage, home, and emotional register**; this gives the woman her face and bearing.
3. **The approved copy** (Step 3) — meaning only; her expression resolves the moment the copy implies.
4. **Brand / visual KB + compliance** — `brand/visual-identity` (palette, light, register), `ad/visual-direction-ref`, `ad/creative-guidelines`, and `rules/compliance` + `rules/food-placeholder` as visual constraints (no medical/clinical staging, no before/after body comparison, nothing implying a promised result).
5. **The concept** — `idea.title`, `idea.ad_notes`, the structural tags.

### Step 5: Resolve the identity reference — lock the FACE

Look for a real-model photo of the intended person in the shared pool:

```
Call: list_gallery_media
  kind: subject          # a real person shot; also try kind: model
  source: upload         # a real (uploaded) photo, not an AI render
  tags: ["persona:<slug>"]   # only when a persona tag is present
```

- **A clearly-intended identity photo resolves** → this is the FACE. Pick an **identity model**: `fal-ai/flux-pulid` (face-ID) or `fal-ai/flux-general` (identity **and** pose). Set `generation_config.model`, `identityRef` = that **pool item id**, and `idWeight` (identity strength, e.g. `0.8`). If a **pose reference** is also intended (operator opt-in — do not force it), add `controlType: 'pose'`, `controlSourceRef` = the pose reference's pool id, and `conditioningScales` (a number array). Default: author identity first; mention pose control as available.
- **No identity photo resolves** → pick a **text-to-image** model (`fal-ai/flux/schnell`, `fal-ai/flux/dev`, or `fal-ai/flux-2-pro`), **describe a persona-matched person** fully in the `body`, and leave `identityRef` **unset**. Say so plainly in the Step 9 STOP (the operator can attach a real-model reference in the studio). **Never guess a pool id.**

Never name more `generation_config` fields than the chosen model's profile accepts — a plain text-to-image model gets `model` only (no `identityRef` / `controlType` / control fields).

### Step 6: Author the subject prompt — the person ALONE, suited to the background

Prompt discipline is **verbatim from `ssc-image`** — the body reaches the engine unmodified; nothing downstream sanitises it:

1. **Never name the ad copy** — no `copy` / `headline` / overlay string in any form (quoted, paraphrased, or negated). Naming a string makes the model draw it. Describe the **moment** the copy implies.
2. **Never negate** — everything you name gets drawn, including inside a negation ("no logo" draws a logo). Say what **IS** there. Use a **simple, neutral ground** stated positively: *standing against a soft, evenly-lit pale studio backdrop*, *a plain neutral seamless ground* — never *"no background"* / *"empty background"*.
3. **No baked-in text**, achieved through clean-surface description, never by asking for text's absence.

The `body` describes **one woman, alone**, on that simple ground:

- **Who** — the persona's woman per `brand/persona-<slug>` (age, life stage, bearing); or, without an identity ref, a fully persona-matched description.
- **Expression / pose** — the moment the approved copy implies (Step 3) / the brief's `story_moment`; calm, true to her `value`/`frame`. This pose is **locked** here.
- **Wardrobe / styling / palette / light — coherent with the SELECTED background** (Step 2): the outfit tone sits inside the background's palette, and the light on her matches the background's **direction, softness, and colour temperature**, so the Scene composes as one photograph. Same lens register (e.g. 50mm, eye level, shallow depth of field) as the chosen scene.
- **Simple neutral ground** — a clean, even, softly-lit plain backdrop so she cuts out cleanly at Scene.

Example (identity ref present, background = warm morning apartment kitchen):

> *A Vietnamese woman in her late forties, standing three-quarter turned, framed from the knees up against a soft, evenly-lit pale grey seamless studio backdrop. Warm, soft directional light from the left at a low morning angle, matching the kitchen scene's colour temperature. A simple linen blouse in a muted warm tone that sits inside that room's palette. Her expression calm and quietly hopeful — a small private morning moment. 50mm, eye level, shallow depth of field; natural skin, gentle contrast.*

### Step 7: Build `generation_config`

Per the `save_creative_prompt` schema — set **only** the fields the chosen model accepts:

- **Identity model** — `{ model, identityRef, idWeight }` (+ `controlType:'pose'`, `controlSourceRef`, `conditioningScales` only when a pose reference is used).
- **Text-to-image model** — `{ model }` only; `identityRef` unset.

`conditioningScales` is a **number array**. Never send a control field to a plain text-to-image model.

### Step 8: Save the subject prompt — then STOP

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             subject
  body:              <the FULL subject scene prompt from Step 6, verbatim to the engine>
  generation_config: <the config from Step 7>
```

**Revise path (`revise: <note>` supplied).** The active layer is `subject`. **Rewrite** the saved `subject` prompt applying the note — still obeying every prompt rule (never name copy, never negate, keep the person alone + coherent with the background) — and re-save with the optimistic-concurrency guard:

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             subject
  body:              <the REWRITTEN subject prompt>
  generation_config: <re-derived config>
  expected_version:  <the version from the Step 2 subject prompt row>
```

The note is **never dropped** and **never changes the layer**. On `stale_version` (a concurrent edit) → STOP (Vietnamese): prompt subject vừa bị sửa ở nơi khác — hãy chạy lại để đọc bản mới; chưa ghi gì. Never re-issue an unchanged prompt.

On a `save_creative_prompt` rejection: an unrecognised-layer / not-deployed error → the **deployment-dependency safe STOP** above; an `insufficient role` / `forbidden` → the **single-surface STOP** above. Either way, write nothing and do not retry.

### Step 9: Output — STOP (Vietnamese)

**If any gate STOPPED**, emit that stop plainly — the reason + the exact next action, in Vietnamese, writing nothing.

**Otherwise, after the subject prompt is saved:**

```
## Ads Image Prompt — <concept title> — SUBJECT saved (propose-only, 0 credit)

**Anchor:** brief <brief_id> (<angle_label>) · idea <idea_id>
**Suited to background:** <selected background creative id — one-line gist | "chưa chọn background — trang phục/ánh sáng bám theo cảnh dự kiến của brief">
**Face lock:** <"identity model <model> · identityRef <pool id> · idWeight <n>" (+ "pose: controlType pose") | "text-to-image <model> — chưa có ảnh người mẫu thật; mô tả người theo persona, gắn ảnh mẫu trong studio để khoá gương mặt">
**Prompt saved:** layer='subject' (chưa tạo ảnh, chưa tốn credit)
```

End with the NEXT action (Vietnamese):

> Next: mở ImageStudio → **Generate** rồi **chọn 1 ứng viên subject** (khoá gương mặt + tư thế). Sau đó chạy lại `/ssc.image-prompt <brief_id>` để sang bước **Scene** (ghép người vào nền). Muốn sửa prompt này: chạy lại với `revise: <ghi chú>`.

(When no background was selected, add: *chọn một background trước sẽ giúp trang phục/ánh sáng khớp cảnh hơn.* When no identity ref resolved, add: *gắn ảnh người mẫu thật trong studio nếu muốn khoá đúng gương mặt.*)

## Governance

- **Propose-only, zero-credit (hard rule).** `tools:` = the reads above **+ `save_creative_prompt` only**. Never `generate_*` / `compose_ad_visual` / `generate_text_layer`, never `approve` / `unapprove`, never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover` / `reorder_gallery` / any publish tool / `update_budget`. **Saving is not approving; the human Generates + selects in the studio.** None of the forbidden tools is in this skill's `tools:` list.
- **This stage saves `layer:'subject'` — only that.** The person is `subject`; the compose-into-scene step (`layer:'model'`, studio label "Scene") is a **separate** skill. Never save `layer:'product'` (upload-only, rejected).
- **Person ALONE, suited to the SELECTED background (hard rule).** Generate the woman on a simple neutral ground for a clean cut-out, but author wardrobe / styling / palette / light coherent with the chosen background's `generation_prompt`, so Scene composes as one photograph. No background selected → ground in the brief's intended scene and note it.
- **Face + pose locked here.** Identity model (`fal-ai/flux-pulid` / `fal-ai/flux-general`) + `identityRef` + `idWeight` when a real-model photo resolves in the pool (+ `controlType:'pose'` + `controlSourceRef` + `conditioningScales` only for an opt-in pose reference); else a text-to-image model + a persona-described person with `identityRef` unset — and say so. **Never guess a pool id;** name a reference only when resolvable from `list_gallery_media`.
- **Grounding (hard rule).** Chosen brief (`angle_label` + five narrative fields) → persona doc (`brand/persona-<slug>`, `chi-` stripped; absent tag → structural tags, no invented path) → approved copy (**meaning only — its words are never named**) → brand/visual + compliance KB → the concept.
- **Verbatim, positive-only prompt (hard rule).** The `body` reaches the engine unmodified. Never name the copy (quoted, paraphrased, or negated); never negate (everything named is drawn); no baked-in text — achieved by clean-surface description, never by asking for text's absence.
- **Revise is prompt-level, never a generate.** `revise: <note>` rewrites the saved `subject` prompt with `expected_version` and re-saves; the note is never dropped and never changes the layer. `stale_version` → STOP and re-run.
- **Deployment-dependency safe (hard rule).** A `subject`-layer rejection from a not-yet-deployed server → STOP in Vietnamese, write nothing, no retry loop.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party provider. `insufficient role` / `forbidden` → STOP, never work around it.
- **Vietnamese** for all operator-facing + persisted prose; the prompt `body` is free-form (English fine).
