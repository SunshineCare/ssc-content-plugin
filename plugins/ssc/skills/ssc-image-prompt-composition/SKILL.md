---
name: ssc-image-prompt-composition
description: >-
  Step 3 (studio label "Composition" / *Ghép*, backend layer key `composition`) of the PROPOSE-ONLY, ZERO-CREDIT ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads AND posts — the ANCHOR-GATED COMPOSITION author, sibling of ssc-image-prompt-subject/-scene/-edit/-text and the prompt-only counterpart of the dashboard's generate_composition step. This is where the compose-with-references logic lives — it brings the LOCKED real identity and the REAL Cambridge packshot into the image (Scene can only depict a GENERIC person/product; Composition composes the real anchors). Its sole required input is an approved brief_id, resolved via get_brief → { brief, idea } — the CHANNEL is resolved from the brief, never passed in (gate channel ∈ {ad, post} + idea.status='approved' + brief.status='approved'; any other channel, e.g. youtube or none, gives a Vietnamese STOP, nothing written). It reads the studio state (list_creatives + list_creative_prompts + list_gallery_media) to detect three anchors — a SELECTED Scene (`scene`, approved), a SELECTED subject (`subject`, approved), and an approved brief `product` packshot. ANCHOR GATE (hard): it requires ≥1 anchor = the selected subject OR the approved product; with NEITHER it STOPS and authors nothing — a selected Scene ALONE does NOT satisfy the gate. With a selected Scene it authors a Kontext image-EDIT that composes the anchor(s) ONTO that scene (scene = edit base); without a Scene it authors an image built AROUND the anchor(s). It always writes a Kontext image-edit body (`fal-ai/flux-pro/kontext`) OR — when structural control is wanted — a control-capable model (`fal-ai/flux-general`, control/depth-aware), naming only the fields that model's profile allows: controlType, controlSourceRef (DEFAULTS to the product's galleryItemId when a control model is used and the operator gives no override), identityRef + idWeight (to lock the selected subject's face), conditioningScales. A manually-picked control-pane source rides as an EXTRA reference. Design decision D4 — it grounds the composition in ALL APPROVED CONTENTS of the brief FOR THE RESOLVED CHANNEL (via list_content — ad: approved copy AND headline AND description AND image_content; post: approved copy AND image_content, a post having no headline/description section, so those are simply absent rather than an error), MEANING + TONE only, never their words. It persists via save_creative_prompt(brief_id, layer:'composition', body, generation_config) — then STOPS, routing the operator (Vietnamese) to the next stage: Edit (*Chỉnh sửa*, optional) or Text (*Tiêu đề*). Prompt discipline carried verbatim: never name the approved contents (quoted, paraphrased, or negated), never negate (state the desired end-state positively), no baked-in text — and NO reserved-zone rules. THIS LAYER'S OWN STATE IS NEVER A GATE — neither a selected/approved Composition candidate nor an already-saved Composition prompt blocks authoring, and no revise note is required to get past either: EVERY invocation authors and saves a Composition prompt (creating the row, or re-saving it with expected_version), warning about staleness instead of stopping. The ANCHOR GATE is a separate, still-binding UPSTREAM-INPUT requirement, not this layer's own state. revise: <note> steers that rewrite of this layer's saved composition body (base = its body) with expected_version and re-saves — never dropped, never a generate; without it the saved prompt is re-authored fresh from the current anchors + sources. A deployment-dependency / insufficient-role STOP surfaces cleanly (writes nothing, no retry). tools: reads + save_creative_prompt ONLY — never a generate tool (incl. generate_composition / edit_creative), approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget. It also holds the READ-ONLY view_image (exactly one of creative_id | ref; ~1.4k tokens a look at the default 1024px long edge, max_edge clamped at 2048), used DELIBERATELY — on the anchors it is actually composing, and on a previous Composition candidate when re-authoring, to answer the one question JSON cannot (did the subject's FACE and the REAL packshot survive the compose, since media.provenance.prompt records what was ASKED FOR, never what came out) — never as a routine sweep of every candidate; it is a read and changes nothing about propose-only. Operator-facing prose is Vietnamese; the composition body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, list_gallery_media, view_image, save_creative_prompt]
---

# ImageStudio Prompt — Composition / *Ghép* (`ssc-image-prompt-composition`)

You are **step 3 (Composition / *Ghép*** — backend layer `composition`) of the Cambridge Diet Vietnam **ImageStudio prompt-authoring** pipeline (ads **and** posts) — **propose-only and zero-credit** — the operator clicks **Generate** in the ImageStudio dashboard, never you. On this invocation you author **ONE anchor-gated composition prompt** — a Kontext image-edit that brings the brief's anchors (a selected **subject** and/or the approved **product**) into one coherent image — then you **save it** with `save_creative_prompt(layer:'composition')` and **STOP**. The operator clicks **Generate** and selects a candidate in the ImageStudio; you never generate.

> **This is where compose-with-references lives.** The **Scene** step (`ssc-image-prompt-scene`) is text-to-image — it may only depict a **generic** person/product from words, with **no real references**. **Composition is the step that brings in the REAL anchors** — the **locked real identity** (a selected subject reference) and the **REAL Cambridge packshot** — and builds around / composes them. The `composition` layer is generated by `generate_composition` in the ImageStudio dashboard.

> **ANCHOR GATE (hard rule).** Composition requires **≥1 anchor = a SELECTED `subject` OR an approved brief `product`.** With **NEITHER**, you author nothing and **STOP** (Vietnamese) — a selected Scene (`scene`) **ALONE does NOT satisfy the gate**, because there is no person or product to compose. The Scene is only the *base* an anchor is composed ONTO.

> **Load-bearing layer mapping.** This step persists **`save_creative_prompt(layer:'composition')`** — studio label "Composition" (*Ghép*), backend layer key **`composition`**. NEVER save `layer:'scene'` (that is the Scene step) and NEVER save `layer:'edit'` (that is the generic Edit step). This step saves **`layer:'composition'`, and nothing else.**

> **Propose-only, ZERO-CREDIT (hard invariant, held by three layers: the server `approve` capability, the `approval-gate.mjs` hook, and this prose).** You author a **prompt + settings** and save them. That is not generating, not approving, not selecting, not uploading, and spends **no** credits. Your `tools:` are the reads above + `save_creative_prompt` ONLY. You **NEVER** call any `generate_*` / `generate_composition` / `edit_creative` / `generate_text_layer` (Generate is a human click — `generate_composition` is the studio's credit-spending Generate for THIS step, never yours), `approve` / `unapprove` (the hook denies these to subagents), `upload_creative` / `confirm_creative_upload` / `select_gallery_creative` (upload + candidate selection are human curation), `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None of those appears in this skill's `tools:` list.

> **Single MCP surface (hard rule).** Every read and the one write are BrandOS server-side tools on the `ssc` surface (`mcp__ssc__…`). You never curl a provider API and never produce or upload an image outside the BrandOS surface — not even when a call fails.

> **A `save_creative_prompt` may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** That is a **server-side permission**, not a bad argument. Do NOT retry with different arguments, do NOT fall back to anything, do NOT silently skip. STOP and tell the operator (Vietnamese): *Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`). Hãy nhờ quản trị cấp quyền `edit` rồi chạy lại. **Chưa ghi gì.***

> **Deployment-dependency safe STOP.** If the deployed server **rejects the `composition` layer or the `generation_config` shape**, STOP cleanly (Vietnamese): *Server BrandOS chưa hỗ trợ bước Composition (`layer:'composition'`) — báo quản trị deploy bản mới rồi chạy lại; **chưa ghi gì.*** **Never** retry in a loop and never fall back to another layer.

## Inputs

Required:

- `brief_id` — the operator's **chosen approved brief** (an ad concept's chosen angle, or a post's single brief). The **sole** required input: `get_brief(brief_id)` returns the brief **AND** its owning concept, and carries the **channel** — so there is no separate `idea_id` and no channel argument.

Optional:

- `control` — opt in to **structural control** (Vietnamese/free-text, truthy). When set, you choose a **control-capable model** (`fal-ai/flux-general`, control/depth-aware) instead of plain Kontext, so the composition follows a structural reference. Off by default (plain Kontext image-edit).
- `control_source` — a **pool id** for a manually-picked control-pane source. When supplied it rides as an **extra reference** (`controlSourceRef`), overriding the product default. When absent and a control model is used, `controlSourceRef` **defaults to the product's galleryItemId**.
- `product` — a **`product` creative id** (or gallery packshot id) naming **which** approved packshot to use when the brief has **more than one**. Irrelevant when the brief has exactly one, or none.
- `revise` — a free-text correction (Vietnamese) for the **currently saved** composition body. Never dropped: it **rewrites** this layer's saved `composition` prompt (base = its body) and re-saves with `expected_version` (Step 7). It never changes which step is active and never generates.
- `model` — a fal model id override for `generation_config.model`. It must be a Kontext image-edit or a control-capable model; any other family → STOP (Vietnamese), write nothing, never guess a substitute.

## Procedure

### Step 1: Resolve the brief AND its concept — gate both

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }`. If no brief matches (`{ brief: null }`), STOP (Vietnamese): không tìm thấy brief này — với concept quảng cáo hãy chạy `/ssc.ads-brief <idea_id>` rồi duyệt một angle; với bài viết hãy mở `/post/[month]/<idea_id>` để lấy `brief_id`. Rồi chạy lại với đúng `brief_id`.

**Resolve the channel from the BRIEF ALONE** — `channel = brief.channel`. **Never fall back to `idea.channel`**: the server gates the whole visual chain on `brief.channel` only (`VISUAL_CHAIN_CHANNELS = ['ad','post']`) and rejects a null one as `invalid_input`, so a fallback would let you author a prompt the studio can never generate. Your gate is the server's gate. It decides which approved content sections exist (Step 3) and which `<workspace>` path you name: `/ad/[month]/<idea.id>` for `ad`, `/post/[month]/<idea.id>` for `post` (never guess a month — write `[month]` literally).

**Gate (ALL must hold; else STOP, write nothing):**

- `brief.channel` is **null / absent** → STOP (Vietnamese): brief này chưa có `channel`, mà server chỉ dựng hình cho brief có `channel = ad` hoặc `channel = post` — mọi lần Generate trong ImageStudio sẽ bị từ chối (`invalid_input`), nên mình không dựng prompt. Hãy đặt `channel` cho brief rồi chạy lại. (Idea đang ở channel `<idea.channel>` — nhiều khả năng đó là giá trị đúng cho brief này.) Name `idea.channel` **only as a hint so the operator can fix the brief** — never adopt it and continue.
- `channel` is neither `'ad'` nor `'post'` (e.g. `youtube`) → STOP (Vietnamese): luồng dựng prompt hình chỉ chạy cho concept quảng cáo (`channel = ad`) hoặc bài viết (`channel = post`) — channel `<channel>` chưa được hỗ trợ.
- `idea.status !== 'approved'` → STOP (Vietnamese): concept này vẫn là bản nháp — hãy duyệt concept trước (Ideas → lọc đúng channel), rồi chạy lại.
- `brief.status !== 'approved'` → STOP (Vietnamese): brief này vẫn là bản nháp — hãy duyệt brief trong `<workspace>` trước, rồi chạy lại.

Hold the resolved `channel`, the brief's `angle_label` (an ad angle label; a post brief may carry none — then anchor on the idea itself) + its five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`) — **the angle anchor**. Hold the paired `idea` (`id`, `title`, `ad_notes` — ads carry it, on a post it is simply absent, `tags[]`). Call `get_idea(idea.id)` **only** if you need fuller detail than `get_brief` returned — it is a follow-up read, never an input.

**Resolve the persona detail-doc path** mechanically: `brand/persona-<slug>`, where `<slug>` is the persona tag's `code` with a leading `chi-` removed (`chi-huong` → `brand/persona-huong`). No persona tag → ground in the structural tags alone; never invent a doc path.

### Step 2: Read the studio state — detect the ANCHORS + this layer's own state

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
Call: list_gallery_media
  brief_id: <brief_id>        # to detect a product packshot + resolve its galleryItemId
```

Each creative carries `layer` (`scene`|`subject`|`composition`|`product`|`edit`|`text`), `status` (`draft`|`approved`|`discarded`), `version`, and its joined **`media`** pool item (`media.provenance.prompt` / `media.resolved_url`). `status='discarded'` rows are ignored entirely.

**Detect the three anchors** (Composition combines them directly — it does NOT use the nearest-selection lineage walk that Edit/Text use):

- `selected_subject` = ≥1 **`subject`** creative with `status='approved'` (the anchor person the operator selected at Step 1). Hold its id + a one-line gist of `media.provenance.prompt` — you name it as a reference and, for a control model, may lock its face via `identityRef`.
- `product_present` = ≥1 **`product`** creative with `status='approved'`, **OR** a product packshot in `list_gallery_media` (a `kind:product` / packaging item for the brief). Product is a **brief-level upload** shared by the whole brief. Hold a one-line gist **and its galleryItemId** (the control-source default). If several approved packshots exist and no `product:` selector was supplied, name them in the summary and let the operator attach the intended one in the studio; never guess by recency.
- `selected_scene` = ≥1 **`scene`** creative with `status='approved'` (a Scene candidate the operator selected). Hold its id + its `media.provenance.prompt` — this is the **edit base** you compose the anchor(s) ONTO, and you match the anchor to its light/scale/perspective/palette.

**ANCHOR GATE (hard).** Require `selected_subject` **OR** `product_present`. With **NEITHER** → **STOP** (Vietnamese), write nothing: *Bước Composition cần ít nhất một "neo" để ghép — một **người mẫu (subject) đã chọn** hoặc một **ảnh sản phẩm** đã duyệt của brief. Hiện chưa có neo nào (một ảnh Scene/nền được chọn KHÔNG tính, vì chưa có người/sản phẩm để ghép vào). Hãy dựng bước **Người mẫu** (`/ssc.image-prompt <brief_id> stage: subject`) rồi chọn 1 ứng viên, hoặc tải lên và duyệt ảnh sản phẩm, sau đó quay lại bước Composition.*

**Read this layer's own state, for information only** — from `list_creatives` + `list_creative_prompts`:

- `selected_composition` = ≥1 **`composition`** creative with `status='approved'` (a Composition candidate the operator has selected-for-next).
- `saved_composition_prompt` = a **`composition`** prompt row exists in `list_creative_prompts`; hold its **`version`** (the optimistic-concurrency guard for the re-save).

> **This layer's own state is NEVER a gate (hard rule).** Neither a **selected/approved Composition candidate** nor an **already-saved Composition prompt** blocks you, and **no `revise` note is required** to get past either. Authoring a prompt generates nothing, spends nothing, and does not change an already-selected image, so **every invocation authors and saves a Composition prompt**. The state decides only *how* you save and what you warn about. *(The **ANCHOR GATE** above is a different thing entirely — it is an **upstream-input** requirement, not this layer's own state, and it still binds: you never author a composition body without a subject or product anchor.)*

Apply the **FIRST** matching rule:

| # | Condition | Action |
|---|---|---|
| 1 | `saved_composition_prompt` | Author → **Steps 3–6**, then **Step 7 case R** (re-save with `expected_version`). With `revise` supplied the note drives the rewrite; **without** one, re-author fresh from the current anchors + sources — it replaces the saved row. |
| 2 | no `saved_composition_prompt` | Author **fresh** → **Steps 3–6**, then **Step 7 case N** (create). If `revise` was supplied, fold its correction into this fresh prompt. |

**Staleness (warn, never block).** When `selected_composition` exists, or a later stage (edit / text) already has a selected candidate, say so in the Step-8 summary (Vietnamese) — *bước này đã có ảnh được chọn; prompt mới chỉ là công thức cho lần **Generate** sau, không làm đổi ảnh đã chọn — và nếu bạn sinh + chọn một bản ghép mới thì các bước sau (đã dựng trên ảnh hiện tại) sẽ bị lỗi thời, cần dựng lại* — then **proceed and save**.

### Step 2b: Look at what you are composing — `view_image`, when it earns its cost

`view_image({ creative_id })` — or `view_image({ ref })` for a pool item / product upload
— returns that image as a block you can actually **see**. **EXACTLY ONE** of the two: both,
or neither, is `invalid_input`; the tool never guesses. It is a **read** — it selects
nothing, approves nothing, uploads nothing, generates nothing. **Each look costs ~1.4k
tokens** (downscaled to a 1024px long edge; `max_edge` is clamped at 2048), so look with a
**question**, and **never sweep the pool** — `list_creatives` already tells you what exists.

Composition is the step where looking most changes what you write, because
**`media.provenance.prompt` records what was ASKED FOR, never what came out.**

**Worth a look — at most one each, and only for anchors you are actually composing:**

- **The selected subject**, when the composition's wording depends on her real pose,
  framing, or which way she faces: you are placing her into a frame, and *"three-quarter
  turned"* in her recipe is not proof of what the render produced.
- **The approved product packshot**, when the composition places or features it — the real
  packaging's true proportions, its label, and which face of the pack you are asking to be
  turned toward the lens.
- **The selected Scene**, when you must match the anchor to its **light direction**,
  eye-level, and palette, or place the anchor in a specific part of that frame.
- **A previous Composition candidate — the highest-value look in this pipeline —
  whenever you are RE-AUTHORING this layer** (a `revise`, or a re-run after the operator
  Generated). It answers one question: **did the anchors survive the compose?** Is she
  still the *referenced* woman — the same face — or did the compose quietly re-invent
  her? Is the packaging still the **real** pack, label legible and proportions true, or
  has it drifted into a fabricated look-alike? Both failures are invisible in JSON, and
  both are exactly what the rewrite has to correct.

**Not worth a look:** a fresh first authoring pass with no `composition` candidate yet
(there is nothing to check); draft candidates the operator has not selected; an anchor
whose `media.provenance.prompt` already answers your question; the same image twice in
one run; anything you are not composing.

A look that fails — `no_media`, `resolve_failed` (including a per-operator access refusal,
which is an **access decision**, not a bug), `fetch_failed`, `not_an_image`,
`image_processing_failed` — is **NOT a STOP**: note it in the Step-8 summary and author
from the provenance prompts as before. The ANCHOR GATE is unaffected either way.

### Step 3: Ground the composition — sources, in this order of authority (design decision D4)

Resolve these **before authoring the composition body**:

1. **The anchors** (Step 2) — the selected subject and/or the approved product are WHAT you compose. When a `selected_scene` exists, its **`media.provenance.prompt`** is the base you compose them ONTO (the current light, palette, perspective, and what is in frame).
2. **The chosen angle brief** (Step 1) — `angle_label` + the five narrative fields; the composed image must express **this** angle. The brief is the **ANGLE** authority (always); where approved contents exist they are the **MOMENT** authority and outrank the brief's `story_moment` — see 3.
3. **ALL APPROVED CONTENTS of the brief** — the **moment + register** the composition depicts, **in preference to the brief's `story_moment`** whenever any row is approved (the brief's is the fallback for when none is). Approved copy is what the operator signed off and what runs beside this image; where the two point at different moments, follow the contents and note it. **Meaning + tone only, never their words** (D4 / Prompt Rule 1) — grounding closer to copy makes naming it more tempting, and naming it is how the string gets drawn in. Read via `list_content(brief: <brief_id>)`, taking every `status='approved'` row across the sections the resolved channel has.
4. **The persona detail doc** (`brand/persona-<slug>`, Step 1) — the woman's life stage and register; in the ON-SCENE / AROUND-ANCHOR situations she IS the referenced subject, and the world wraps her.
   Sections by channel — `ad`: **`copy` AND `headline` AND `description` AND `image_content`**; `post`: **`copy` AND `image_content`** (a post workspace has **no** `headline` and **no** `description` section, so those are simply **absent**, never missing data and never an error). Content is brief-keyed, like every sibling step. None approved yet → fall back to the brief's `story_moment` and note softly that producing copy first would sharpen the moment (`ad` → `/ssc.ads-produce <brief_id> copy`; `post` → `/ssc.post-writer <brief_id>`).
5. **Brand/visual KB + compliance** — the visual register and the constraints the composition must not break.

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

`rules/compliance` is read as a **visual** constraint (no medical/clinical staging, no before/after body comparison, nothing implying a promised result). `rules/food-placeholder` governs how any food/product appears. **Load the same paths on both channels** — the two `ad/` docs are the brand's only visual-direction references, so read them as the visual standard for a `post` visual too; the KB has no post-channel visual doc, so never invent one and never skip them on a post.

### Step 4: The prompt rules (HARD — the composition body reaches the engine verbatim)

The `body` you author is the Kontext / control instruction sent to the engine **unmodified** — nothing downstream sanitises it. Obey:

1. **Never name the approved contents** — no `copy` / `headline` / `description` / `image_content` / overlay string, **quoted, paraphrased, or negated** (naming a string makes the model render it). Describe the scene the contents imply, never their words. *(Rendering the exact headline is the Text step's job, never this one.)*
2. **Never negate** — everything named gets drawn, including inside a negation. State the **desired end-state positively** (✅ *"an uncluttered pale-wood counter bare but for a single ceramic mug"*, not *"no clutter"*).
3. **No baked-in text, ever** — the composition adds no letters, words, or logos; text is rendered later by the Text step.

**No reserved-zone rules.** The old reserved text/subject zones are **retired** — you do **not** carve out or keep clean any plane. Author a **complete, filled image**; any headroom for text is a free *framing* choice expressed positively, never a geometry demand.

The composition `body` is **free-form** (English is usually best for the engines); only operator-facing prose stays Vietnamese.

### Step 5: Author the composition `body`

Write one complete **Kontext image-edit / control instruction** that composes the anchors into a single coherent photograph. Branch on whether a Scene exists:

**Situation ON-SCENE — a `selected_scene` (`scene`) exists** → the Scene is the **edit base**; you compose the anchor(s) **ONTO** it:

- **Name the references** — *"the referenced Scene"*, *"the referenced woman"*, *"the referenced Cambridge product package"* — and do **not** re-describe or contradict each reference's own given attributes (the subject's face/wardrobe, the product's label, the scene's own layout are supplied by the references).
- **Place the anchor into the scene** — where in frame, at what scale, in what pose/orientation, so it belongs in that room.
- **Match to the scene** — the anchor takes the scene's **light direction, softness, and colour temperature**, its **perspective and eye-level**, and its palette (read them from the scene's `media.provenance.prompt`), so the result reads as **one photograph**, never a paste-on. Keep the rest of the scene as it is.

Example (subject composed onto a selected morning-kitchen Scene):

> *Compose the referenced woman into the referenced Scene: place her three-quarter turned at the pale wooden counter on the left, framed from the knees up, at natural human scale. Light her from the same window direction already in the scene — soft, warm, low-morning — matching its softness and colour temperature and the room's 50mm eye-level perspective, grounded by a soft contact shadow. Keep the rest of the kitchen, its light, and its warm palette exactly as they are — one coherent photograph.*

**Situation AROUND-ANCHOR — NO `selected_scene`** → you build a new coherent image **AROUND** the anchor(s):

- **Name the references** the same way, then **build a complete, believable environment** around them in real depth (real domestic detail, not empty space), grounded in the persona's world (Step 3).
- **Match the environment to the anchor** — the room's light matches the anchor's own light direction/softness/temperature; the anchor's scale, perspective, and eye-level stay consistent; the palette carries throughout.
- **Product placement (when a product is composed)** — the **real** Cambridge packaging rests on a plausible surface at natural, correct scale, grounded by a soft contact shadow, its label legible and true — never a fabricated product.

Example (product composed around, no scene):

> *Build a warm early-morning Vietnamese apartment kitchen around the referenced Cambridge product package: it rests upright on a pale wooden counter at natural arm's-length scale, grounded by a soft contact shadow, its packaging face turned slightly toward the lens, legible and true to the real product. Soft daylight from the left; the room extends naturally in believable depth — a kettle, a folded cloth, a low shelf. Muted warm palette; 50mm, eye level, shallow depth of field — one full, real scene.*

A well-formed Composition body must: express the brief's `core_message` + `story_moment`; place the persona's world; honour the visual + compliance KB; name (not re-invent) each reference; match the composed anchor to the scene/environment light, scale, and palette; keep the frame word-free by positive description; and never fabricate a product.

### Step 6: Author `generation_config` — Kontext edit, or a control-capable model

Build `generation_config` for the chosen model. The **studio wires the anchor references** (the Scene base, the subject, the product) from the selected candidates' lineage + the operator's attachments at Generate time — so for a **plain Kontext edit** you set **`model` only** and force no ref ids:

**Default — plain Kontext image-edit** (`control` NOT requested):

```
generation_config: { model: "fal-ai/flux-pro/kontext" }
```

**When structural control IS wanted** (`control` requested, or the operator overrides `model` to a control-capable id) — pick `fal-ai/flux-general` (control/depth-aware) and name **only the fields that model's profile allows**:

- `controlType` — the structural mode (e.g. `'depth'` for a depth-guided compose, `'pose'` for a pose-guided one).
- `controlSourceRef` — the control-pane source **pool id**. **Default to the product's galleryItemId** (Step 2) when a control model is used and the operator gave no override; a supplied `control_source` **overrides** it and rides as an extra reference.
- `conditioningScales` — a **number array**, the control strength(s).
- `identityRef` + `idWeight` — set **only** to lock the selected subject's face (the subject's identity pool id + a strength like `0.8`); omit when no face lock is wanted.

```
generation_config: {
  model:             "fal-ai/flux-general",
  controlType:       "depth",
  controlSourceRef:  "<product galleryItemId (default) | control_source override>",
  conditioningScales: [0.6],
  identityRef:       "<selected subject identity pool id>",   # only to lock the face
  idWeight:          0.8                                       # only with identityRef
}
```

Never send a control/identity field to a plain Kontext model, and never name a pool id you cannot resolve from `list_creatives` / `list_gallery_media`. A per-call `model` override that is neither a Kontext nor a control-capable model → STOP (Vietnamese), write nothing.

### Step 7: Save the composition prompt — then STOP

Persist the composition body + settings under **`layer:'composition'`**, then STOP.

**Case N — no saved Composition prompt (rule 2):** create the prompt row.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composition            # studio label "Composition"; NEVER 'scene', NEVER 'edit'
  body:              <the composition instruction from Step 5 — reaches the engine verbatim>
  generation_config: <the config from Step 6>
```

**Case R — a saved Composition prompt exists (rule 1):** re-author it and re-save with the existing row's `version` as `expected_version` for optimistic concurrency, still obeying every Step 4 rule and still respecting the anchors + scene situation. With `revise` supplied, carry the operator's note; **without** one, re-author fresh from the current anchors and sources. Either way it is a genuine re-authoring — **never re-save a byte-identical body.**

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             composition
  body:              <the REWRITTEN composition instruction, note applied>
  generation_config: <re-derived config>
  expected_version:  <the version held from the list_creative_prompts composition row>
```

- On a `stale_version` reject → **STOP** (Vietnamese): prompt vừa bị chỉnh ở nơi khác — hãy chạy lại lệnh (mình sẽ đọc lại phiên bản mới nhất). **Chưa ghi gì.** Do **not** retry blindly.
- On a `composition`-layer / `generation_config` rejection → the **deployment-dependency safe STOP** above; on `insufficient role` / `forbidden` → the **single-surface STOP** above. Either way, write nothing and do not retry.

Capture the saved prompt's returned id/version. Then **STOP** — you are done for this invocation.

### Step 8: Output — the STOP message (Vietnamese)

**If the ANCHOR GATE failed at Step 2**, or a gate STOPPED at Step 1, or the save was rejected, emit that stop message plainly — the reason and the exact next action, in Vietnamese. **Produce no image, spend no credits.** *(This layer's own state never STOPs — only the missing-anchor gate does.)*

**Otherwise, after the composition prompt is saved**, output:

```
## ImageStudio Prompt — <concept title> — Composition (Ghép, layer 'composition') saved

**Target:** brief <brief_id> (<angle_label>) · idea <idea.id> · channel <channel>
**Anchors:** <"người mẫu <id> đã chọn" | ""> + <"sản phẩm <gist>" | ""> <"(ghép LÊN Scene <id> đã chọn)" | "(dựng cảnh QUANH neo — chưa có Scene)">
**Model:** <generation_config.model> <"· control <controlType> · source <controlSourceRef>" | ""> <"· khoá gương mặt (identityRef)" | "">
**Grounded on contents:** <"đã dùng nội dung đã duyệt (<các section có của channel này> — chỉ lấy ý + tông, không nêu chữ)" | "chưa có nội dung đã duyệt — dựng theo brief + persona">
**Ghi prompt:** <"tạo mới" | "ghi đè prompt đã lưu (v<version cũ>)"> <"· ⚠️ bước này đã có ảnh được chọn — prompt mới chỉ áp dụng cho lần Generate sau, ảnh đã chọn không đổi" | "">
**Saved:** layer='composition', propose-only (chưa generate, chưa tốn credit)
```

Then end with the next action (Vietnamese):

> Prompt Composition đã được lưu — **chưa sinh ảnh và chưa tốn credit nào.** Mở ImageStudio của brief này, bấm **Generate** ở bước **Composition (Ghép)**, rồi **chọn (select)** một ảnh ưng ý. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để sang bước tiếp theo — **Edit (Chỉnh sửa, tùy chọn)** hoặc **Text (Tiêu đề)**. (Muốn sửa prompt này: chạy lại với `revise: <ghi chú>`.)

## Output

- **Saved, not generated.** ONE `composition` prompt row via `save_creative_prompt(brief_id, layer:'composition', body, generation_config)`. Saving persists the prompt + its settings; it is **NOT** generation and **NOT** approval, and it spends **no** credits.
- **One layer per invocation.** The operator Generates + selects a Composition candidate in the ImageStudio, then re-invokes for the next stage (**Edit** or **Text**) — or re-invokes with `revise: <note>` to rewrite this layer's prompt.
- **The prompt is the work product.** A complete, self-contained composition instruction that names the anchor references, matches them to the scene/environment light/scale/palette, carries **no baked-in text**, and never fabricates a product.
- No image generated, no candidate selected/approved, no gate flipped, no cover set.

## Governance

- **Propose-only, ZERO-CREDIT (hard rule).** You author a **prompt + settings** and `save_creative_prompt`, then STOP. **Saving is not generating, approving, selecting, or uploading, and spends no credits.** Never call any `generate_*` / `generate_composition` / `edit_creative` / `generate_text_layer` (`generate_composition` is the studio's credit-spending Generate for this step — a human click, never yours), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None appears in the `tools:` list.
- **This step saves `layer:'composition'` — NEVER `layer:'scene'`, NEVER `layer:'edit'` (hard rule).** The studio labels it "Composition" (*Ghép*); the backend key is `composition`. It is the anchor-gated compose step. Never save `layer:'product'` (upload-only, rejected).
- **This layer's own state is NEVER a gate (hard rule).** A **selected/approved Composition candidate** and an **already-saved Composition prompt** are both **informational** — neither blocks authoring, and neither requires a `revise` note to get past. Authoring a prompt generates nothing, spends nothing, and changes no already-selected image, so **every invocation authors and saves a Composition prompt**. The state decides only create-vs-re-save (`expected_version`) and the staleness warning. Do **not** reintroduce a "đã chọn rồi → STOP" or "đã lưu prompt → STOP" rule. *(This is distinct from the ANCHOR GATE below, which is an upstream-input requirement and still binds.)*
- **ANCHOR GATE (hard rule).** Composition requires **≥1 anchor = a selected `subject` OR an approved `product`**. With neither → STOP, author nothing — a selected Scene (`scene`) alone does NOT satisfy the gate. This is an **upstream-input** gate (there is nothing to compose without an anchor), **not** this layer's own state — it survives the rule above and binds every authoring path. Composition combines the selected Scene + selected subject + approved product **directly**; it does **not** use the nearest-selection lineage walk (that is Edit/Text's rule).
- **`view_image` is a READ; it adds no power (hard rule).** It returns an image you can **see** and nothing else — it never generates, approves, selects a candidate, uploads, sets a cover, or flips a gate, and this skill's sole mutation is still `save_creative_prompt`. Seeing an image is not approving one. Use it **deliberately** (~1.4k tokens a look; `max_edge` clamped at 2048): on the anchors you are **actually composing**, and on a previous Composition candidate when **re-authoring** — *did the subject's face and the real packshot survive the compose* — never as a routine pass over every candidate. A failed look is never a STOP, and never satisfies or defeats the ANCHOR GATE.
- **Situation-aware composition (hard rule).** With a selected Scene → compose the anchor(s) ONTO it (scene = edit base, match light/scale/perspective/palette, keep the rest unchanged). Without a Scene → build a coherent image AROUND the anchor(s). Name each reference; never re-invent it; never guess a pool id.
- **`generation_config` — Kontext by default, control-capable on request.** Plain Kontext (`fal-ai/flux-pro/kontext`) → `model` only, refs wired by the studio. Control model (`fal-ai/flux-general`, when `control` is wanted) → name only the profile-allowed fields: `controlType`, `controlSourceRef` (**defaults to the product's galleryItemId**; a `control_source` override rides as an extra reference), `conditioningScales`, and `identityRef` + `idWeight` only to lock the subject's face. A `model` override outside the Kontext / control family → STOP.
- **Grounding + prompt discipline (hard rule, D4).** Ground in the anchors → the scene base's own prompt (when present) → the chosen brief → persona doc → **ALL APPROVED CONTENTS of the brief for the RESOLVED CHANNEL (ad: copy AND headline AND description AND image_content; post: copy AND image_content — a post has no headline/description section, so those are absent, not missing; meaning + tone only, their words never named)** → visual + compliance KB. The authored `body` reaches the engine **verbatim**: never name the contents (quoted, paraphrased, or negated), never negate (state the desired end-state positively), no baked-in text. **No reserved-zone rules.** Never fabricate a product — real packaging, correct proportions, legible true label.
- **Revise is prompt-level, never a generate, the note is never dropped — and it is never *required*.** `revise: <note>` rewrites the saved composition body (base = its `body`, from `list_creative_prompts`) with `expected_version`, still obeying every prompt rule. It is a **steering input, not a permission slip** — without it an invocation still re-authors the saved prompt fresh from the current anchors + sources. Never re-issue a byte-identical prompt; never call a generate tool.
- **Chain: Scene (opt) → Subject (opt) → Composition (here) → Edit (opt, repeatable) → Text.** The next stage after a selected Composition is **Edit** (optional) or **Text** (`/ssc.image-prompt <brief_id>`).
- **Deployment-dependency + permission STOPs are clean.** A server that rejects the `composition` layer/config, or an `insufficient role` / `forbidden` refusal → STOP in Vietnamese, write nothing, **no retry loop**, no fallback.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party provider API.
- **Channel comes from the BRIEF ALONE; `ad` and `post` both run.** Resolve `channel = brief.channel` at Step 1 — **never** `brief.channel ?? idea.channel` — and gate on the `{ad, post}` allowlist — never take a `channel` argument. The channel changes nothing about the anchor gate or how a Composition is authored; it only decides which approved sections exist to ground on and which `<workspace>` path you name. **This mirrors the server exactly:** its `requireApprovedBrief` gate reads `brief.channel` only (`VISUAL_CHAIN_CHANNELS = ['ad','post']`) and rejects a null one as `invalid_input`, so an idea-channel fallback would pass your gate and then fail every Generate. A **null `brief.channel` STOPS** — you may name `idea.channel` as the likely intended value so the operator can fix the brief, but you never adopt it. Any other channel (`youtube`) STOPS cleanly, writing nothing.
- **Operator-facing prose and persisted notes are Vietnamese**; the composition `body` is free-form.
- Requires the `edit` capability (for `list_creatives` / `list_creative_prompts` / `list_gallery_media` reads and the `save_creative_prompt` write); the brief/idea/copy/knowledge reads (`get_brief` / `get_idea` / `list_content` / `get_knowledge`) and `view_image` are satisfied by `view`.
