---
name: ssc-image-prompt-background
description: Step 2 (Full image / *Ảnh toàn cảnh*, layer key `background`) of the PROPOSE-ONLY, ZERO-CREDIT ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads — the still-image sibling of ssc-image that NEVER generates and spends NO credits. This is the REQUIRED full-scene step (no longer an anchorless empty plate). Its sole input is a REQUIRED approved angle brief_id, resolved via get_brief → { brief, idea } (no separate idea_id), gated on idea.channel='ad' + idea.status='approved' + brief.status='approved' (else a Vietnamese STOP, nothing written). It is SITUATION-AWARE: it reads the studio state (list_creatives + list_gallery_media) to see whether a SELECTED subject candidate and/or a PRODUCT packshot exists for the brief, then authors accordingly — WITH a referenced subject and/or product it writes a COMPOSE-WITH-REFERENCES prompt that builds the FULL coherent scene AROUND the anchor (Kontext image-edit `fal-ai/flux-pro/kontext`), matching light/perspective/scale/palette to it and naming the subject/product as reference inputs (the studio wires the real refs from the selected candidates' lineage; the skill never guesses a pool id); with NEITHER it writes a FROM-SCRATCH complete-scene text-to-image prompt (FLUX.2, default `fal-ai/flux-2/klein/9b`, ladder-steppable) — a full, real scene, never an empty plate. There is NO reserved-text-zone and NO reserved-subject-zone geometry any more (BOTH deleted): the Step-4 Text overlay needs no pre-cleared plane, so text headroom is at most an optional FRAMING choice (e.g. the anchor slightly off-centre), never a reserved-plane demand. Grounded in the five sources in order (chosen brief angle → persona detail doc brand/persona-<slug> → approved copy for MEANING ONLY, never its words → brand/visual + compliance KB → the concept), obeying the ssc-image prompt rules (never name a copy/headline string; never negate; no baked-in text). Persists via save_creative_prompt(brief_id, layer:'background', body, generation_config) — the layer key stays `background`; generation_config.model is the situation-matched default (Kontext when refs present, else FLUX.2 t2i), operator-overridable — then STOPS, telling the operator (Vietnamese) to Generate + select a Full-image candidate, then re-invoke for the NEXT stage — Edit (*Chỉnh sửa*), not Scene (Scene/`model` is RETIRED from the chain). revise: <note> rewrites this layer's saved prompt (passing expected_version for optimistic concurrency) and re-saves — never generating. A server rejection STOPs cleanly in Vietnamese and writes nothing (no retry loop). PROPOSE-ONLY, ZERO-CREDIT: tools are reads + save_creative_prompt ONLY — never a generate_* / compose_ad_visual / generate_text_layer / generate_subject, approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget; saving a prompt is NOT approving and spends NO credits — the human clicks Generate. Operator-facing prose is Vietnamese; the image prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, list_gallery_media, save_creative_prompt]
---

# Ads Image-Prompt — Step 2 · Full image (`ssc-image-prompt-background`)

You are **Step 2 — Full image** of the Cambridge Diet Vietnam **ImageStudio prompt-authoring pipeline** — the **propose-only, zero-credit** sibling of `ssc-image`. You take **ONE approved angle `brief_id`**, author the **full-scene prompt for the `background` (Full image) layer**, persist it with its `generation_config` via **`save_creative_prompt(layer:'background')`**, and **STOP**. **You never generate an image and you spend no credits** — the operator clicks **Generate** in the ImageStudio and **selects** a candidate; only then does the pipeline advance to the **Edit** stage.

**This is the full scene, not an empty plate.** The old "anchorless background" is gone. On each invocation you first read the studio state to see what anchors this brief, then author **the whole coherent ad scene**:

- **A subject candidate and/or a product packshot exists** → **compose-with-references**: describe the full scene built **AROUND** the referenced subject/product, matching light, perspective, scale, and palette to that anchor. The anchor is present, so the environment is **depth the model builds around it** — a Kontext image-edit (`fal-ai/flux-pro/kontext`). The studio attaches the real references from the selected candidates' lineage; you **name** the subject/product as reference inputs in the body and never guess a pool id.
- **Neither exists** → **from-scratch full image**: a complete, lived-in scene via FLUX.2 text-to-image — **never an empty set built around reserved voids**.

The chain: **Subject (optional, Step 1) → Full image (you, Step 2) → Edit (optional, repeatable, Step 3) → Text (Step 4)**. The old **Scene** step (`model` layer) is **retired** — you never point at it.

**Propose-only, zero-credit (hard invariant).** Saving a prompt is **NOT** approving and **spends no credits**. Your `tools:` are **reads + `save_creative_prompt` only**. You **NEVER** reference or call any generation tool (`generate_background` / `generate_subject` / any `generate_*` / `compose_ad_visual` / `generate_text_layer`), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. Generation, candidate selection, and hero/export are the operator's studio actions. **None of those tools appears in this skill's `tools:` list.**

> **Single MCP surface (hard rule).** `get_brief`, `get_idea`, `list_content`, `list_creatives`, `list_creative_prompts`, `get_knowledge`, `list_gallery_media`, and `save_creative_prompt` are BrandOS server-side tools on the `ssc` surface. You call **only** these; you never curl a provider API and never author a prompt anywhere but through `save_creative_prompt`.

> **A `save_creative_prompt` call may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** That is a **server-side permission**, not a bad argument and not an unmet precondition — do NOT retry with different arguments and do NOT silently skip. STOP and tell the operator (Vietnamese):
>
> > Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`). Hãy nhờ quản trị BrandOS cấp quyền, rồi chạy lại lệnh. **Chưa có gì được ghi.**

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief** (produced first by `/ssc.ads-brief`, approved in the dashboard). It anchors every read and the save. Resolved via `get_brief` — which returns the brief **AND** its owning ad concept — so there is **no separate `idea_id` input**.

Optional:

- `revise` — a free-text correction for **this** (`background` / Full image) layer's saved prompt. It is **never dropped**: when a Full-image prompt is already saved, it **rewrites** that prompt (Step 5, case R); when none is saved yet, it is **folded into the fresh prompt** you author. It never generates.
- `model` — a fal model id for `generation_config.model` that **overrides the situation-matched default**. The default is **situation-aware**: with a referenced subject and/or product → `fal-ai/flux-pro/kontext` (Kontext image-edit); with neither → `fal-ai/flux-2/klein/9b` (FLUX.2 Klein 9B — fast drafts). For the from-scratch (FLUX.2) situation the operator may step up the ladder: `fal-ai/flux-2` (Dev), `fal-ai/flux-2-pro` (Pro), `fal-ai/flux-2-max` (Max). An id that is neither Kontext nor in the FLUX.2 family → STOP (Vietnamese), report it, write nothing; never guess a substitute.

## Procedure

### Step 1: Resolve + gate the chosen angle brief

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }`. If no brief matches (`{ brief: null }`) → **STOP** (Vietnamese): không tìm thấy brief này — hãy chạy `/ssc.ads-brief <idea_id>` và duyệt một angle trước, rồi chạy lại với đúng `brief_id`.

**Gate, in order — any failure STOPs in Vietnamese and writes nothing:**

- `idea.channel !== 'ad'` → **STOP:** luồng dựng prompt hình hiện chỉ chạy cho concept quảng cáo (`channel = ad`).
- `idea.status !== 'approved'` → **STOP:** concept quảng cáo này vẫn là bản nháp — hãy tuyển chọn và duyệt concept trước (Ideas → lọc `channel = ad`), rồi chạy lại lệnh.
- `brief.status !== 'approved'` → **STOP:** brief angle này vẫn là bản nháp — hãy duyệt một brief angle trong `/ad/[month]/<idea.id>` trước, rồi chạy lại lệnh.

Hold the approved brief's **`angle_label`** and its five narrative fields — **`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`** — as **the angle anchor**. Use **only** this one brief; never pool across the idea's other briefs. From the paired flat `idea` hold `idea.id`, `idea.title`, `idea.ad_notes`, and `idea.tags[]`. Call `get_idea(idea.id)` only if you need fuller ad detail than `get_brief` returned — it is a follow-up read, never a required input.

**Resolve the persona detail-doc path (mechanical).** The persona tag's taxonomy `code` maps to `brand/persona-<slug>`, where `<slug>` is the `code` with the leading `chi-` prefix removed (`chi-huong` → `brand/persona-huong`, `chi-mai` → `brand/persona-mai`, `chi-thao` → `brand/persona-thao`). Same rule `ssc-image` / `ssc-ads-writer` use. Hold the ONE resolved path for Step 3. No persona tag → ground the scene in the structural tags + the brief alone; **never invent a doc path**.

### Step 2: Read the studio state — decide the SITUATION + the layer's own state

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
Call: list_gallery_media
  brief_id: <brief_id>        # to detect a product packshot in the brief's pool
```

Each creative carries `layer` (`background`|`subject`|`model`|`product`|`composite`|`text`), `status` (`draft`|`approved`|`discarded`), `version`, and its joined **`media`** pool item (`media.provenance.prompt` / `media.resolved_url`). `status='discarded'` rows are ignored entirely.

**Decide the situation (anchors) — from `list_creatives` + `list_gallery_media`:**

- `selected_subject` = ≥1 **`subject`** creative with `status='approved'` (the anchor person the operator selected at Step 1). Hold its id + a one-line gist of `media.provenance.prompt` — you name it as a reference input and match the scene to it.
- `product_present` = ≥1 **`product`** creative with `status='approved'`, **OR** a product packshot in `list_gallery_media` (a `kind:product` / packaging item for the brief). Product is a **brief-level upload** shared by the whole brief. Hold a one-line gist.
- **Situation A — COMPOSE (Kontext image-edit)** when `selected_subject` **or** `product_present`. The referenced anchor(s) are present; you build the full scene around them.
- **Situation B — FROM-SCRATCH (FLUX.2 text-to-image)** when **neither**. You author a complete scene from scratch — a full, real environment, never an empty plate.

**Compute this layer's own state — from `list_creatives` + `list_creative_prompts`:**

- `selected_fullimage` = ≥1 **`background`** creative with `status='approved'` (a Full-image candidate the operator has **selected-for-next**).
- `saved_bg_prompt` = a **`background`** prompt row exists in `list_creative_prompts`; hold its **`version`** (the `revise` optimistic-concurrency guard).

Apply the **FIRST** matching rule:

| # | Condition | Action |
|---|---|---|
| 1 | `selected_fullimage` | **STOP** — the Full image is already selected; this step is done. A `revise` note has **no effect** here (to redo, discard the selected Full image in the studio first). Route the operator to the next stage: chạy `/ssc.image-prompt <brief_id>` để dựng prompt bước **Edit (Chỉnh sửa)**. **Staleness (warn, never block):** if a later stage (edit/text) already has a selected candidate, add — *đổi ảnh toàn cảnh ở bước này sẽ khiến các bước sau (đã dựng trên ảnh hiện tại) bị lỗi thời, cần dựng lại.* |
| 2 | `saved_bg_prompt` **and** `revise` supplied | Author the **rewrite** (same situation A/B) → **Step 3 + 4**, then **Step 5 case R** (re-save with `expected_version`). |
| 3 | `saved_bg_prompt` **and no** `revise` | **STOP** — the Full-image prompt is already saved but no candidate is selected yet. Do **not** re-author or overwrite. Tell the operator (Vietnamese) to **Generate + select** a Full-image candidate in the ImageStudio (or re-run with `revise: <ghi chú>` to correct the prompt), then re-invoke. |
| 4 | no `saved_bg_prompt` | Author **fresh** (situation A or B) → **Step 3 + 4**, then **Step 5 case N** (create). If `revise` was supplied, fold its correction into this fresh prompt. |

### Step 3: Ground the scene — five sources, in this order of authority

Resolve all five **before authoring any prompt**:

1. **The chosen angle brief** (Step 1) — `angle_label` + `hook_direction` / `core_message` / `why_now` / `story_moment` / `cta`. This is *the* angle; the scene expresses **this and nothing else**. The authored prompt must visibly carry the brief's `core_message` and `story_moment`.
2. **The persona detail doc** — `brand/persona-<slug>` (Step 1). It gives the woman's world its **age, life stage, home, light, and emotional register**. In **situation A** the referenced subject IS the person — the scene wraps her, matched to her world; in **situation B** the persona's world sets the setting, palette, and mood (and any person you describe is persona-matched).
3. **The approved `copy`** — a **MEANING** source. Read it, use *which moment* the ad is about, and **never name its words** (Prompt Rule 1):

   ```
   Call: list_content
     brief: <brief_id>
   ```

   Content is brief-keyed, so this returns exactly THIS angle's rows. Take `section === 'copy'` AND `status === 'approved'` — the concrete moment the scene depicts. **Approved copy is a grounding source, not a gate here:** if none exists yet, ground the scene in the brief angle + persona and note softly in the summary that producing copy first (`/ssc.ads-produce <brief_id> copy`) would sharpen the moment. **Never name a copy / headline / overlay string** in the prompt, present or absent.
4. **Brand + visual KB** — the visual identity, direction, and compliance constraints.
5. **The concept** — `idea.title`, `idea.ad_notes`, the structural tags (layer / value / frame / persona / against).

Load 2 and 4 in one call:

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

- `brand/visual-identity` — palette, light, and register.
- `ad/visual-direction-ref` — the visual direction reference for ads.
- `ad/creative-guidelines` — what a converting Cambridge ad visual looks like.
- `rules/compliance` — NĐ-15/2018 + brand compliance as a **visual constraint** (no medical/clinical staging, no before/after body comparison, nothing implying a promised result).
- `rules/food-placeholder` — the food-placeholder / imagery rules the scene must respect.
- `brand/persona-<slug>` — the persona detail doc.

Do not call `get_knowledge` for unrelated paths.

### Step 4: The prompt rules (HARD — the `body` reaches the engine verbatim)

The `body` you save is the layer's scene prompt; the operator's Generate sends it to the image engine **unmodified**. There is **no `prompt_hints`** and **no server-side assembly** to sanitise it.

**Rule 1 — never name the ad copy.** No `copy` / `headline` / `description` / overlay string appears in the prompt **in any form — not quoted, not paraphrased, not negated.** *Naming a string makes the model render it.* Describe the **scene the copy implies**, never its words. (The Text step, Step 4, is the one place a string is named — never here.)

**Rule 2 — never negate.** Everything you name gets drawn, **including inside a negation** — "no text", "no clutter", "without a logo" all push the model toward exactly those things. Say what **IS** there. (❌ *"no clutter"* → ✅ *"an uncluttered countertop of pale wood, bare except for a single ceramic mug"*.)

**Rule 3 — no baked-in text, ever.** No letters, words, or logos in the image, achieved **through Rules 1–2** (positive, clean-surface description), **never** by asking for text's absence.

**No reserved planes (the old "reserve both zones" rule is DELETED).** You do **not** carve out a text zone and you do **not** carve out a subject zone. The Step-4 Text overlay renders onto the finished image and needs **no pre-cleared plane**, and the subject is a **real reference**, not a void to protect. Author a **complete, filled scene**. Text headroom is at most an **optional FRAMING choice** — if the operator wants a calmer area where a headline may later sit, you may place the anchor slightly off-centre so a naturally quieter part of a **complete** scene falls there. That is framing expressed positively, **never** a reserved empty band, **never** *"leave room for the headline"*, **never** a described void.

Prompt language is **free-form** (English is usually best for the engines) — the one exemption from the Vietnamese rule, which governs operator-facing prose.

**Situation A — compose-with-references (Kontext).** The studio attaches the real subject/product references from the selected candidates' lineage; your `body` describes the **output scene built around them**:

- **Name the references** as inputs (*"the referenced woman"*, *"the referenced Cambridge product package"*) — do **not** re-describe or contradict the reference's own given attributes (the subject's face/wardrobe, the product's label are supplied by the reference).
- **Build the environment** — a complete, believable setting extends around the anchor in real depth; add real domestic detail, not empty space.
- **Match to the anchor** — the light on the scene matches the anchor's **direction, softness, and colour temperature**; the anchor's **scale, perspective, and eye-level** stay consistent (same lens register); the palette carries throughout, so the result reads as **one photograph**.
- **Product placement (when a product is referenced)** — it rests on a plausible surface at natural, correct scale, grounded by a soft contact shadow, its label legible and true.

A well-formed Situation-A prompt example (subject referenced; warm morning apartment kitchen):

> *Build a complete early-morning Vietnamese apartment kitchen around the referenced woman: she stands three-quarter turned at a pale wooden counter, warm daylight from a sheer-curtained window falling on her from the left. The room extends naturally around her in believable depth — a soft-focus kitchen with real domestic detail (a kettle, a folded cloth, a low shelf), the light on the room matching the direction, softness, and colour temperature already on her, her scale and eye-level consistent with a 50mm lens. Muted warm palette throughout; quiet, hopeful, unhurried — one coherent photograph.*

**Situation B — from-scratch full image (FLUX.2 text-to-image).** No anchor is referenced, so you author the whole scene — **complete and lived-in**, never an empty set:

A well-formed Situation-B prompt example (neither subject nor product):

> *An early-morning Vietnamese apartment kitchen, complete and lived-in: warm daylight through a sheer curtain across a pale wooden counter holding a single ceramic mug and a folded cloth, a soft-focus shelf and window behind. Gentle natural light from the left; muted warm palette; 50mm, eye level, shallow depth of field. Quiet, hopeful, unhurried — a full, real scene, not an empty set.*

**A well-formed Full-image prompt** must: express the brief's `core_message` + `story_moment` and the moment the approved copy implies (meaning only); place the persona's world (her home, her light, her life stage); honour the visual + compliance KB; be a **complete filled scene with no reserved voids**; keep the frame word-free by positive clean-surface description; and — in situation A — wrap the referenced anchor with matched light, scale, and palette.

### Step 4b: Optimize the prompt for the situation's engine

**Situation B — FLUX.2 (the text-to-image ladder Klein 9B → Dev → Pro → Max).** FLUX.2 follows a prompt far more literally than FLUX.1 and reads long, ordered descriptions well, so author *for* it:

- **Be complete and ordered** — flow **setting → layout → surfaces & props → light → lens/camera → mood**. FLUX.2 renders what you specify and omits what you don't, so leave nothing load-bearing implicit; a fuller, well-structured paragraph beats a terse one.
- **Be photographically specific** — lens (e.g. *50mm*), camera height/angle, light **direction + quality + colour temperature**, depth of field, palette, and the **material** of each surface. FLUX.2 reproduces these faithfully.
- **Fill the frame** — describe a real, complete scene; do **not** describe empty bands or cleared planes.

**Situation A — Kontext (image-edit).** Kontext edits the attached references into an output scene, so:

- **Describe the OUTPUT scene**, not the references' fixed attributes — the reference governs the subject's face/wardrobe and the product's label; you specify only the **environment** and how it receives the anchor.
- **Specify the match** — the light direction/softness/colour temperature, the anchor's scale/perspective/eye-level, and the palette, so the edit composes as **one photograph**, never a paste-on.

In both situations **the Rule 1–3 discipline matters MORE, not less** — stronger adherence means a **named or negated** copy string is *even more* likely to be drawn. Positive-only, word-free description is non-negotiable; extend the depth of the examples above, don't shrink it.

### Step 5: Persist the prompt via `save_creative_prompt` — then STOP

Build `generation_config = { model: <situation-matched default, or the `model` input override> }`:

- **Situation A (compose)** → default `model: 'fal-ai/flux-pro/kontext'` (Kontext image-edit).
- **Situation B (from-scratch)** → default `model: 'fal-ai/flux-2/klein/9b'` (FLUX.2 text-to-image; ladder-steppable via the `model` input).

`generation_config` carries **only `model`**. You do **not** set `controlSourceRef` / `identityRef` / control fields and you do **not** put subject/product pool ids in the config — the studio wires the real references from the selected candidates' lineage at Generate time, and you never guess a pool id. The model is a situation-matched **default** that mirrors the backend role resolution; the operator can still switch it in the studio.

**Case N — no saved Full-image prompt (rule 4):** create the prompt row.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             background
  body:              <the FULL scene prompt (Step 4), situation A or B>
  generation_config: { model: <'fal-ai/flux-pro/kontext' (A) | 'fal-ai/flux-2/klein/9b' (B) | the model input> }
```

**Case R — a saved Full-image prompt exists and `revise` was supplied (rule 2):** rewrite it, carrying the operator's note (still obeying every Step 4 rule, still in the current situation A/B), and re-save with the existing row's `version` as `expected_version` for optimistic concurrency. **Never re-save an unchanged body** — the new `body` MUST differ by the operator's correction.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             background
  body:              <the REWRITTEN scene prompt, note applied>
  generation_config: { model: <'fal-ai/flux-pro/kontext' (A) | 'fal-ai/flux-2/klein/9b' (B) | the model input> }
  expected_version:  <the version held from the list_creative_prompts background row>
```

- On a `stale_version` reject → **STOP** (Vietnamese): prompt vừa bị chỉnh ở nơi khác — hãy chạy lại lệnh (mình sẽ đọc lại phiên bản mới nhất). Chưa ghi gì. Do **not** retry blindly.
- **Deployment-dependency safe STOP:** if `save_creative_prompt` is rejected because the deployed server does not support this `layer` / `generation_config` shape → **STOP**, write nothing, do **not** retry in a loop (Vietnamese): server BrandOS chưa hỗ trợ bước này — báo quản trị deploy bản mới rồi chạy lại; **chưa ghi gì**.

Capture the saved prompt's returned id/version. Then **STOP** — you are done for this invocation.

### Step 6: Output — the STOP message (Vietnamese)

**If a state rule STOPPED at Step 2** (Full image already selected → route to Edit; prompt already saved with no candidate → Generate + select), or a gate STOPPED at Step 1, or the save was rejected, emit that stop message plainly — the reason and the exact next action, in Vietnamese. **Produce no image, spend no credits.**

**Otherwise, after the prompt is saved**, output:

```
## Ads Image-Prompt — <concept title> — Full image (Ảnh toàn cảnh) prompt saved

**Target:** brief <brief_id> (<angle_label>) · idea <idea.id>
**Layer:** background — <"compose-with-references (Kontext)" | "from-scratch (FLUX.2 text-to-image)">
**Anchors:** <"subject <id> đã chọn" + "sản phẩm <gist> trong kho" | "chưa có subject/sản phẩm — dựng từ đầu">
**Model:** <generation_config.model>
**Grounded on copy:** <"đã dùng ≥1 copy đã duyệt (chỉ lấy ý, không nêu chữ)" | "chưa có copy đã duyệt — dựng theo brief + persona (nên chạy /ssc.ads-produce <brief_id> copy để sắc hơn)">
**Scene:** cảnh đầy đủ, không chừa vùng trống — không có chữ nào trong ảnh (chữ do bước Text phủ lên sau)
**Prompt saved:** propose-only, ZERO credit spent — the operator Generates in the studio.
```

Then end with the next action (Vietnamese):

> Prompt ảnh toàn cảnh đã được lưu — **chưa sinh ảnh và chưa tốn credit nào.** Mở ImageStudio của brief này, bấm **Generate** ở bước **Full image (Ảnh toàn cảnh)**, rồi **chọn (select)** một ảnh ưng ý. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để mình dựng prompt cho bước tiếp theo — **Edit (Chỉnh sửa)**. (Muốn sửa prompt này: chạy lại với `revise: <ghi chú>`.)

(When situation B and no subject/product anchor was present, you may add: *muốn khoá một gương mặt thật, hãy dựng bước **Subject** trước rồi chạy lại bước này — cảnh sẽ được ghép quanh người mẫu đã chọn.*)

## Output

- **Saved, not generated.** ONE `background` prompt row via `save_creative_prompt(brief_id, layer:'background', body, generation_config:{ model })`. Saving persists the prompt + its settings; it is **NOT** generation and **NOT** approval, and it spends **no** credits.
- **One layer per invocation.** The operator Generates + selects a Full-image candidate in the ImageStudio, then re-invokes for the next stage (**Edit**) — or re-invokes with `revise: <note>` to rewrite this layer's prompt.
- **The prompt is the work product.** A complete, self-contained full-scene prompt authored here, sent verbatim by the operator's Generate; the scene is filled (no reserved voids), the frame carries **no baked-in text**, and in situation A it wraps the referenced anchor with matched light/scale/palette.
- No image generated, no candidate selected/approved, no gate flipped, no cover set.

## Governance

- **Propose-only, zero-credit (hard rule).** Never call any tool that generates, approves, uploads, selects, sets a cover, reorders, publishes, or spends budget — never `generate_*` / `compose_ad_visual` / `generate_text_layer` / `generate_subject`, never `approve` / `unapprove` (the approval hook denies `approve_*` to agents), never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover` / `reorder_gallery`, never publish, never `update_budget`. Save the `background` prompt and STOP. **Saving is not approving and spends no credits** — Generate is the human's studio click. None of the forbidden tools appears in this skill's `tools:` list.
- **Step 2, no anchor precondition.** Full image is the REQUIRED step; the Subject step (Step 1) is **optional**, so this step runs with or without a selected subject. Its only gates are the three brief/idea gates in Step 1. Approved `copy` is a **grounding source used when present**, never a hard gate — with none, ground in the brief + persona and note the softer scene.
- **Situation-aware authoring (hard rule).** Read the studio state first. A selected `subject` and/or a `product` packshot → **compose-with-references** (build the full scene AROUND the anchor, Kontext, match light/scale/perspective/palette, name the references, never guess a pool id). Neither → **from-scratch full image** (a complete FLUX.2 text-to-image scene, never an empty plate).
- **No reserved planes (hard rule).** The old "reserve BOTH the text zone and the subject zone" rule is **deleted**. Never carve out a text zone (the Text overlay needs no pre-cleared plane) and never carve out a subject zone (the subject is a real reference, not a void). Author a **complete filled scene**; text headroom is at most an optional **framing** choice expressed positively, never a reserved empty band.
- **Layer is `background`, always.** Every `save_creative_prompt` call from this skill passes `layer:'background'` (studio label "Full image"). This skill never saves any other layer.
- **`generation_config` carries only `model`.** The situation-matched default is Kontext (`fal-ai/flux-pro/kontext`) when a subject/product is present, else the FLUX.2 text-to-image ladder (default `fal-ai/flux-2/klein/9b`; `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`). Never a control/identity field and never a subject/product pool id — the studio wires the real references from the selected candidates' lineage.
- **Verbatim, positive-only prompt (hard rule).** You author the COMPLETE scene prompt; it reaches the engine unmodified. (1) Never name the ad copy — not quoted, paraphrased, or negated. (2) Never negate — everything named gets drawn. (3) No baked-in text, ever, achieved through (1)–(2) (positive clean-surface description), never by asking for text's absence. The scene is filled — no reserved voids.
- **Grounding (hard rule).** Before authoring: the chosen brief (`angle_label` + five narrative fields) → the persona detail doc (`brand/persona-<slug>`, mechanically derived; absent tag → structural tags only, never an invented path) → the approved `copy` (**a meaning source — its words are never named**) → the visual + compliance KB (`brand/visual-identity`, `ad/visual-direction-ref`, `ad/creative-guidelines`, `rules/compliance`, `rules/food-placeholder`) → the concept.
- **Revise is prompt-level, never generation, note never dropped.** `revise: <note>` rewrites **this** layer's saved prompt (with `expected_version` from the `list_creative_prompts` row) when one exists, or is folded into the fresh prompt when none does; it never generates and never changes which layer is active.
- **Chain: Subject (opt) → Full image (here) → Edit → Text.** The next stage after a selected Full image is **Edit** (`/ssc.image-prompt <brief_id>`), not Scene — the Scene (`model`) step is **retired** from the chain.
- **Deployment-dependency safe STOP.** A server rejection of the layer / `generation_config` STOPs cleanly in Vietnamese, writes nothing, and does not retry in a loop.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party image-provider API — not even when a save fails.
- **Phase 1 = ad channel only.** `channel='ad'` concepts only; a non-ad idea STOPS cleanly.
- **Operator-facing prose and persisted notes are Vietnamese**; the image prompt `body` is free-form.
- Requires the `edit` capability — for `save_creative_prompt` and the `list_creatives` / `list_creative_prompts` / `list_gallery_media` reads. Generate + select in the ImageStudio, and hero/export, are the operator's dashboard actions.
