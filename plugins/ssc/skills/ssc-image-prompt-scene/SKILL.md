---
name: ssc-image-prompt-scene
description: >-
  Step 1 (the FIRST step, OPTIONAL) of the PROPOSE-ONLY, ZERO-CREDIT ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads — the SCENE author (studio label "Scene" / *Bối cảnh*, backend layer key `scene`), the still-image sibling of ssc-image that NEVER generates and spends NO credits. It authors a pure TEXT-TO-IMAGE FULL IMAGE that may FREELY include a GENERIC subject and/or a GENERIC product — or neither — whatever the brief needs; it is still text-to-image ONLY (no identity models, no real-reference anchors, no pool ids) and reserves NO text/subject zone. Any person/product it depicts is GENERIC/illustrative, described in words; the LOCKED real identity and the REAL Cambridge packshot are brought in later by the anchor-gated Composition step (ssc-image-prompt-composition, layer `composition`, a Kontext edit) — so Scene never fabricates the real branded packaging. Its sole input is a REQUIRED approved angle brief_id, resolved via get_brief → { brief, idea } (no separate idea_id), gated on idea.channel='ad' + idea.status='approved' + brief.status='approved' (else a Vietnamese STOP, nothing written). The default model is the FLUX.2 text-to-image ladder (default `fal-ai/flux-2/klein/9b`, ladder-steppable `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`) — NEVER Kontext; a model id outside the FLUX.2 family STOPs. There is NO reserved-text-zone and NO reserved-subject-zone geometry (BOTH deleted): the Step-5 Text overlay needs no pre-cleared plane, so text headroom is at most an optional FRAMING choice, never a reserved-plane demand. Design decision D4 — the prompt is grounded in ALL APPROVED CONTENTS of the brief (approved copy AND headline AND description AND image_content, via list_content), used for MEANING + TONE only, never their words — plus the five sources in order (chosen brief angle → persona detail doc brand/persona-<slug> → the approved contents → brand/visual + compliance KB → the concept), obeying the ssc-image prompt rules (never name a copy/headline/description/image_content string; never negate; no baked-in text; no reserved voids). Persists via save_creative_prompt(brief_id, layer:'scene', body, generation_config:{ model }) — the layer key is `scene`; generation_config.model is a FLUX.2 default, operator-overridable within the FLUX.2 family — then STOPS, telling the operator (Vietnamese) to Generate + select a Scene candidate, then re-invoke for the NEXT step — Subject (*Người mẫu*, optional) or Composition (*Ghép*). revise: <note> rewrites this layer's saved prompt (passing expected_version for optimistic concurrency) and re-saves — never generating. A server rejection STOPs cleanly in Vietnamese and writes nothing (no retry loop). PROPOSE-ONLY, ZERO-CREDIT: tools are reads + save_creative_prompt ONLY — never a generate_* / generate_scene / generate_composition / edit_creative / generate_text_layer / generate_subject, approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget; saving a prompt is NOT approving and spends NO credits — the human clicks Generate. Operator-facing prose is Vietnamese; the image prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, save_creative_prompt]
---

# Ads Image-Prompt — Step 1 · Scene (`ssc-image-prompt-scene`)

You are **Step 1 — Scene** of the Cambridge Diet Vietnam **ImageStudio prompt-authoring pipeline** — the **propose-only, zero-credit** sibling of `ssc-image`. You take **ONE approved angle `brief_id`**, author the **pure text-to-image full image for the `scene` layer**, persist it with its `generation_config` via **`save_creative_prompt(layer:'scene')`**, and **STOP**. **You never generate an image and you spend no credits** — the operator clicks **Generate** in the ImageStudio and **selects** a candidate; only then does the pipeline advance.

**Scene is a complete, full text-to-image image — and may freely include a GENERIC subject and/or product.** Scene is a **pure text-to-image** step: you author one whole coherent image — a real, lived-in place (a bright morning kitchen, a quiet living room) — and it **may freely include a GENERIC subject and/or a GENERIC product** described in words, **or neither**, whatever the brief needs. What Scene never does is take **references / anchors**: no identity model, no real-model photo, no product-packshot pool id, no `controlSourceRef`. Any person or product you describe here is **generic/illustrative** (invented for the frame), rendered by the text-to-image model from your words alone. It is still **text-to-image only** and reserves **NO** subject/text zone.

**Real anchors and the real packshot are Composition's job.** The **LOCKED real identity** (a specific face pinned by an identity model) and the **REAL Cambridge product packaging** are brought in by the **Composition step** (`ssc-image-prompt-composition`, layer `composition`), an anchor-gated Kontext edit. So in Scene you **never fabricate the real branded packaging** — a generic, unbranded product silhouette is fine, but the real Cambridge packshot is a Composition/Edit reference, never invented here. Scene depicts freely; Composition composes the real anchors.

The chain: **Scene (you — Step 1, optional) → Subject (Step 2, optional) → Composition (Step 3) → Edit (Step 4, optional, repeatable) → Text (Step 5)**. After a selected Scene the next step is **Subject** (optional) or **Composition** — the `composition` layer is the **live anchor-gated compose step**, authored by `ssc-image-prompt-composition`.

**Propose-only, zero-credit (hard invariant).** Saving a prompt is **NOT** approving and **spends no credits**. Your `tools:` are **reads + `save_creative_prompt` only**. You **NEVER** reference or call any generation tool (`generate_scene` / `generate_subject` / `generate_composition` / any `generate_*` / `edit_creative` / `generate_text_layer`), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. Generation, candidate selection, and hero/export are the operator's studio actions. **None of those tools appears in this skill's `tools:` list.**

> **Single MCP surface (hard rule).** `get_brief`, `get_idea`, `list_content`, `list_creatives`, `list_creative_prompts`, `get_knowledge`, and `save_creative_prompt` are BrandOS server-side tools on the `ssc` surface. You call **only** these; you never curl a provider API and never author a prompt anywhere but through `save_creative_prompt`.

> **A `save_creative_prompt` call may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** That is a **server-side permission**, not a bad argument and not an unmet precondition — do NOT retry with different arguments and do NOT silently skip. STOP and tell the operator (Vietnamese):
>
> > Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`). Hãy nhờ quản trị BrandOS cấp quyền, rồi chạy lại lệnh. **Chưa có gì được ghi.**

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief** (produced first by `/ssc.ads-brief`, approved in the dashboard). It anchors every read and the save. Resolved via `get_brief` — which returns the brief **AND** its owning ad concept — so there is **no separate `idea_id` input**.

Optional:

- `revise` — a free-text correction for **this** (`scene` / Scene) layer's saved prompt. It is **never dropped**: when a Scene prompt is already saved, it **rewrites** that prompt (Step 5, case R); when none is saved yet, it is **folded into the fresh prompt** you author. It never generates.
- `model` — a fal model id for `generation_config.model` that **overrides the default** (`fal-ai/flux-2/klein/9b`, FLUX.2 Klein 9B — fast drafts). It must stay **inside the FLUX.2 text-to-image family** — the ladder `fal-ai/flux-2` (Dev), `fal-ai/flux-2-pro` (Pro), `fal-ai/flux-2-max` (Max). An id outside the FLUX.2 family (e.g. Kontext) → STOP (Vietnamese), report it, write nothing; never guess a substitute.

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

### Step 2: Read this layer's own state

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
```

Each creative carries `layer` (`scene`|`subject`|`composition`|`product`|`edit`|`text`), `status` (`draft`|`approved`|`discarded`), `version`, and its joined **`media`** pool item (`media.provenance.prompt` / `media.resolved_url`). `status='discarded'` rows are ignored entirely.

**Scene is pure text-to-image — you read no anchors here.** A real subject reference or a real product packshot is **Composition's** input, not Scene's; you never inspect `list_gallery_media` or the `subject`/`product` creatives to branch on. You only compute **this layer's own state** — from `list_creatives` + `list_creative_prompts`:

- `selected_scene` = ≥1 **`scene`** creative with `status='approved'` (a Scene candidate the operator has **selected-for-next**).
- `saved_scene_prompt` = a **`scene`** prompt row exists in `list_creative_prompts`; hold its **`version`** (the `revise` optimistic-concurrency guard).

Apply the **FIRST** matching rule:

| # | Condition | Action |
|---|---|---|
| 1 | `selected_scene` | **STOP** — the Scene is already selected; this step is done. A `revise` note has **no effect** here (to redo, discard the selected Scene in the studio first). Route the operator to the next step: chạy `/ssc.image-prompt <brief_id>` để dựng prompt bước **Subject (Người mẫu, tùy chọn)** hoặc **Composition (Ghép)**. **Staleness (warn, never block):** if a later stage (subject/composition/edit/text) already has a selected candidate, add — *đổi bối cảnh ở bước này sẽ khiến các bước sau (đã dựng trên ảnh hiện tại) bị lỗi thời, cần dựng lại.* |
| 2 | `saved_scene_prompt` **and** `revise` supplied | Author the **rewrite** → **Step 3 + 4**, then **Step 5 case R** (re-save with `expected_version`). |
| 3 | `saved_scene_prompt` **and no** `revise` | **STOP** — the Scene prompt is already saved but no candidate is selected yet. Do **not** re-author or overwrite. Tell the operator (Vietnamese) to **Generate + select** a Scene candidate in the ImageStudio (or re-run with `revise: <ghi chú>` to correct the prompt), then re-invoke. |
| 4 | no `saved_scene_prompt` | Author **fresh** → **Step 3 + 4**, then **Step 5 case N** (create). If `revise` was supplied, fold its correction into this fresh prompt. |

### Step 3: Ground the scene — five sources, in this order of authority (design decision D4)

Resolve all five **before authoring any prompt**:

1. **The chosen angle brief** (Step 1) — `angle_label` + `hook_direction` / `core_message` / `why_now` / `story_moment` / `cta`. This is *the* angle; the scene expresses **this and nothing else**. The authored prompt must visibly carry the brief's `core_message` and `story_moment`.
2. **The persona detail doc** — `brand/persona-<slug>` (Step 1). It gives the woman's world its **age, life stage, home, light, and emotional register**. The persona's world sets the setting, palette, and mood; any GENERIC person you describe here is **persona-matched** (a real, locked identity is composed in at Composition — Scene's person is illustrative).
3. **ALL APPROVED CONTENTS of the brief — the MEANING + TONE sources (D4).** Ground the scene in **every** approved content section of this angle, not just the brief/idea fields:

   ```
   Call: list_content
     brief: <brief_id>
   ```

   Content is brief-keyed, so this returns exactly THIS angle's rows. Take **every row with `status === 'approved'`** across **`copy` AND `headline` AND `description` AND `image_content`** — the concrete moment, the promise, and the on-image message the ad carries. Use them together to fix **which moment** the scene depicts and its emotional register. **Approved contents are a grounding source, not a gate here:** if none exists yet, ground the scene in the brief angle + persona and note softly in the summary that producing copy first (`/ssc.ads-produce <brief_id> copy`) would sharpen the moment. **Never name a copy / headline / description / image_content string** in the prompt, present or absent — they are meaning/tone only (Prompt Rule 1).
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

**Rule 1 — never name the ad contents.** No `copy` / `headline` / `description` / `image_content` / overlay string appears in the prompt **in any form — not quoted, not paraphrased, not negated.** *Naming a string makes the model render it.* Describe the **scene the contents imply**, never their words. (The Text step, Step 5, is the one place a string is named — never here.)

**Rule 2 — never negate.** Everything you name gets drawn, **including inside a negation** — "no text", "no clutter", "without a logo" all push the model toward exactly those things. Say what **IS** there. (❌ *"no clutter"* → ✅ *"an uncluttered countertop of pale wood, bare except for a single ceramic mug"*.)

**Rule 3 — no baked-in text, ever.** No letters, words, or logos in the image, achieved **through Rules 1–2** (positive, clean-surface description), **never** by asking for text's absence.

**Rule 4 — a generic subject/product only; never the real branded packshot.** Scene may depict a GENERIC, illustrative person and/or a generic, unbranded product if the brief calls for it — but it **never fabricates the real Cambridge packaging** (correct label/proportions is a real-reference concern the Composition/Edit steps own). Keep any depicted product generic and unbranded; the real packshot is a downstream reference.

**No reserved planes (the old "reserve both zones" rule is DELETED).** You do **not** carve out a text zone and you do **not** carve out a subject zone. The Step-5 Text overlay renders onto the finished image and needs **no pre-cleared plane**. Author a **complete, filled scene**. Text headroom is at most an **optional FRAMING choice** — if the operator wants a calmer area where a headline may later sit, you may compose the scene so a naturally quieter part of a **complete** environment falls there. That is framing expressed positively, **never** a reserved empty band, **never** *"leave room for the headline"*, **never** a described void.

Prompt language is **free-form** (English is usually best for the engines) — the one exemption from the Vietnamese rule, which governs operator-facing prose.

**Author the whole image — complete and lived-in, never an empty set.** You author the entire image from scratch: a full, real place grounded in the persona's world, with real domestic detail — and, when it suits the brief, a generic persona-matched person and/or a generic product within it — not empty space and not reserved voids.

A well-formed Scene prompt example (a warm morning apartment kitchen, generic person included):

> *An early-morning Vietnamese apartment kitchen, complete and lived-in: warm daylight through a sheer curtain across a pale wooden counter holding a single ceramic mug and a folded cloth. A woman in her late forties stands three-quarter turned at the counter, a warm mug in one hand, her expression quietly hopeful — an unhurried pause. Gentle natural light from the left; muted warm palette; 50mm, eye level, shallow depth of field. A full, real scene, not an empty set.*

**A well-formed Scene prompt** must: express the brief's `core_message` + `story_moment` and the moment the approved contents imply (meaning only); place the persona's world (her home, her light, her life stage); honour the visual + compliance KB; be a **complete filled scene with no reserved voids**; keep any depicted person/product **generic** (no locked identity, no real branded packshot); and keep the frame word-free by positive clean-surface description.

### Step 4b: Optimize the prompt for FLUX.2

**FLUX.2 (the text-to-image ladder Klein 9B → Dev → Pro → Max).** FLUX.2 follows a prompt far more literally than FLUX.1 and reads long, ordered descriptions well, so author *for* it:

- **Be complete and ordered** — flow **setting → layout → subject (if any) → surfaces & props → light → lens/camera → mood**. FLUX.2 renders what you specify and omits what you don't, so leave nothing load-bearing implicit; a fuller, well-structured paragraph beats a terse one.
- **Be photographically specific** — lens (e.g. *50mm*), camera height/angle, light **direction + quality + colour temperature**, depth of field, palette, and the **material** of each surface. FLUX.2 reproduces these faithfully.
- **Fill the frame** — describe a real, complete scene; do **not** describe empty bands or cleared planes.

FLUX.2's stronger adherence means the Rule 1–3 discipline matters **MORE, not less** — a **named or negated** copy string is *even more* likely to be drawn. Positive-only, word-free description is non-negotiable; extend the depth of the example above, don't shrink it.

### Step 5: Persist the prompt via `save_creative_prompt` — then STOP

Build `generation_config = { model: <the FLUX.2 default, or the `model` input override> }`:

- Default `model: 'fal-ai/flux-2/klein/9b'` (FLUX.2 text-to-image; ladder-steppable via the `model` input to `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`).

`generation_config` carries **only `model`**. You do **not** set `controlSourceRef` / `identityRef` / control fields and you do **not** put any pool id in the config — Scene is pure text-to-image with no references. The model is a **default** that mirrors the backend role resolution; the operator can still switch it in the studio, within the FLUX.2 family.

**Case N — no saved Scene prompt (rule 4):** create the prompt row.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             scene
  body:              <the FULL text-to-image scene prompt (Step 4)>
  generation_config: { model: <'fal-ai/flux-2/klein/9b' | the model input> }
```

**Case R — a saved Scene prompt exists and `revise` was supplied (rule 2):** rewrite it, carrying the operator's note (still obeying every Step 4 rule), and re-save with the existing row's `version` as `expected_version` for optimistic concurrency. **Never re-save an unchanged body** — the new `body` MUST differ by the operator's correction.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             scene
  body:              <the REWRITTEN scene prompt, note applied>
  generation_config: { model: <'fal-ai/flux-2/klein/9b' | the model input> }
  expected_version:  <the version held from the list_creative_prompts scene row>
```

- On a `stale_version` reject → **STOP** (Vietnamese): prompt vừa bị chỉnh ở nơi khác — hãy chạy lại lệnh (mình sẽ đọc lại phiên bản mới nhất). Chưa ghi gì. Do **not** retry blindly.
- **Deployment-dependency safe STOP:** if `save_creative_prompt` is rejected because the deployed server does not support this `layer` / `generation_config` shape → **STOP**, write nothing, do **not** retry in a loop (Vietnamese): server BrandOS chưa hỗ trợ bước này — báo quản trị deploy bản mới rồi chạy lại; **chưa ghi gì**.

Capture the saved prompt's returned id/version. Then **STOP** — you are done for this invocation.

### Step 6: Output — the STOP message (Vietnamese)

**If a state rule STOPPED at Step 2** (Scene already selected → route to Subject/Composition; prompt already saved with no candidate → Generate + select), or a gate STOPPED at Step 1, or the save was rejected, emit that stop message plainly — the reason and the exact next action, in Vietnamese. **Produce no image, spend no credits.**

**Otherwise, after the prompt is saved**, output:

```
## Ads Image-Prompt — <concept title> — Scene (Bối cảnh) prompt saved

**Target:** brief <brief_id> (<angle_label>) · idea <idea.id>
**Layer:** scene — Scene (Bối cảnh), pure text-to-image full image
**Model:** <generation_config.model> (FLUX.2)
**Grounded on contents:** <"đã dùng nội dung đã duyệt (copy/headline/description/image_content — chỉ lấy ý + tông, không nêu chữ)" | "chưa có nội dung đã duyệt — dựng theo brief + persona (nên chạy /ssc.ads-produce <brief_id> copy để sắc hơn)">
**Scene:** cảnh đầy đủ, có thể kèm người/sản phẩm CHUNG (generic, không phải gương mặt/bao bì thật) và không chừa vùng trống — không có chữ nào trong ảnh (bao bì thật + gương mặt khoá do bước Composition ghép, chữ do bước Text phủ sau)
**Prompt saved:** propose-only, ZERO credit spent — the operator Generates in the studio.
```

Then end with the next action (Vietnamese):

> Prompt bối cảnh đã được lưu — **chưa sinh ảnh và chưa tốn credit nào.** Mở ImageStudio của brief này, bấm **Generate** ở bước **Scene (Bối cảnh)**, rồi **chọn (select)** một ảnh ưng ý. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để mình dựng prompt cho bước tiếp theo — **Subject (Người mẫu, tùy chọn)** hoặc **Composition (Ghép)**. (Muốn sửa prompt này: chạy lại với `revise: <ghi chú>`.)

(Bối cảnh là bước **tùy chọn**. Muốn ghép gương mặt thật/bao bì sản phẩm thật vào bối cảnh này, hãy dựng bước **Subject** rồi **Composition**; muốn phủ tiêu đề thẳng lên bối cảnh, sang bước **Text**.)

## Output

- **Saved, not generated.** ONE `scene` prompt row via `save_creative_prompt(brief_id, layer:'scene', body, generation_config:{ model })`. Saving persists the prompt + its settings; it is **NOT** generation and **NOT** approval, and it spends **no** credits.
- **One layer per invocation.** The operator Generates + selects a Scene candidate in the ImageStudio, then re-invokes for the next step (**Subject** or **Composition**) — or re-invokes with `revise: <note>` to rewrite this layer's prompt.
- **The prompt is the work product.** A complete, self-contained text-to-image full image authored here, sent verbatim by the operator's Generate; the scene is filled (no reserved voids), carries **no baked-in text**, may include a **generic** person/product, and references **no** real subject or product packshot.
- No image generated, no candidate selected/approved, no gate flipped, no cover set.

## Governance

- **Propose-only, zero-credit (hard rule).** Never call any tool that generates, approves, uploads, selects, sets a cover, reorders, publishes, or spends budget — never `generate_*` / `generate_scene` / `generate_composition` / `edit_creative` / `generate_text_layer` / `generate_subject`, never `approve` / `unapprove` (the approval hook denies `approve_*` to agents), never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover` / `reorder_gallery`, never publish, never `update_budget`. Save the `scene` prompt and STOP. **Saving is not approving and spends no credits** — Generate is the human's studio click. None of the forbidden tools appears in this skill's `tools:` list.
- **Step 1 — the (optional) opening step; no prior-stage precondition.** Scene opens the chain; it has no upstream step to wait on, and its only gates are the three brief/idea gates in Step 1. Scene is **optional** — a chain may skip it. Approved contents are a **grounding source used when present**, never a hard gate — with none, ground in the brief + persona and note the softer scene.
- **Pure text-to-image, broadened (hard rule).** Scene is text-to-image ONLY — it takes **NO** references/anchors (no identity model, no real-model photo, no product packshot pool id, no `controlSourceRef`) and does **NO** compose-with-references — that logic lives in the **Composition** step (`ssc-image-prompt-composition`, layer `composition`). Within that, Scene **may freely depict a GENERIC subject and/or product, or neither**, whatever the brief needs. It **never fabricates the real Cambridge packaging** — a generic, unbranded product is fine; the real packshot is a Composition/Edit reference.
- **No reserved planes (hard rule).** The old "reserve BOTH the text zone and the subject zone" rule is **deleted**. Never carve out a text zone (the Text overlay needs no pre-cleared plane) and never carve out a subject zone. Author a **complete filled scene**; text headroom is at most an optional **framing** choice expressed positively, never a reserved empty band.
- **Layer is `scene`, always.** Every `save_creative_prompt` call from this skill passes `layer:'scene'` (studio label "Scene" / *Bối cảnh*). This skill never saves any other layer.
- **`generation_config` carries only `model`.** The default is the FLUX.2 text-to-image ladder (default `fal-ai/flux-2/klein/9b`; steppable `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`) — **never Kontext**, never a control/identity field, and never a pool id (Scene has no references). A `model` override outside the FLUX.2 family → STOP (Vietnamese), write nothing.
- **Verbatim, positive-only prompt (hard rule).** You author the COMPLETE scene prompt; it reaches the engine unmodified. (1) Never name the ad contents — copy / headline / description / image_content, not quoted, paraphrased, or negated. (2) Never negate — everything named gets drawn. (3) No baked-in text, ever, achieved through (1)–(2) (positive clean-surface description), never by asking for text's absence. The scene is filled — no reserved voids.
- **Grounding (hard rule, D4).** Before authoring: the chosen brief (`angle_label` + five narrative fields) → the persona detail doc (`brand/persona-<slug>`, mechanically derived; absent tag → structural tags only, never an invented path) → **ALL APPROVED CONTENTS of the brief (copy AND headline AND description AND image_content — a meaning + tone source; their words are never named)** → the visual + compliance KB (`brand/visual-identity`, `ad/visual-direction-ref`, `ad/creative-guidelines`, `rules/compliance`, `rules/food-placeholder`) → the concept.
- **Revise is prompt-level, never generation, note never dropped.** `revise: <note>` rewrites **this** layer's saved prompt (with `expected_version` from the `list_creative_prompts` row) when one exists, or is folded into the fresh prompt when none does; it never generates and never changes which layer is active.
- **Chain: Scene (here, opt) → Subject (opt) → Composition → Edit → Text.** The next step after a selected Scene is **Subject** (optional) or **Composition** (`/ssc.image-prompt <brief_id>`) — the `composition` layer is the **live anchor-gated compose step** (authored by `ssc-image-prompt-composition`, generated by `generate_composition`).
- **Deployment-dependency safe STOP.** A server rejection of the layer / `generation_config` STOPs cleanly in Vietnamese, writes nothing, and does not retry in a loop.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party image-provider API — not even when a save fails.
- **Phase 1 = ad channel only.** `channel='ad'` concepts only; a non-ad idea STOPS cleanly.
- **Operator-facing prose and persisted notes are Vietnamese**; the image prompt `body` is free-form.
- Requires the `edit` capability — for `save_creative_prompt` and the `list_creatives` / `list_creative_prompts` reads. Generate + select in the ImageStudio, and hero/export, are the operator's dashboard actions.
