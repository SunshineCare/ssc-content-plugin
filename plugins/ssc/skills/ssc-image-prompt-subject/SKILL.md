---
name: ssc-image-prompt-subject
description: >-
  The OPTIONAL Subject step of the propose-only, zero-credit ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads (chain Scene → Subject → Composition → Edit → Text) — the SUBJECT author: the persona's standalone person, the ANCHOR the whole scene is later built around. Anchored to ONE approved angle brief (its single input `brief_id`, resolved via get_brief → { brief, idea }; gates idea channel='ad'+approved and brief approved, else STOP in Vietnamese). It has NO required prior stage — Subject waits on nothing upstream (a Scene backdrop is optional; the Composition step comes AFTER). It AUTHORS the scene prompt + generation_config for the persona's woman generated ALONE on a simple, neutral ground so she cuts out cleanly when the Composition step (ssc-image-prompt-composition, layer 'composition') composes her into a full scene — with her FACE + POSE LOCKED HERE. The outfit, wardrobe, styling, colour palette, and light are grounded in the brief's INTENDED scene (its story_moment + the persona's world), because there is no scene image yet to match; the downstream Composition step builds the scene AROUND her and matches its light/palette/perspective to her, so the combined image reads as ONE photograph. Face lock: when a real-model photo is resolvable in the shared pool (via list_gallery_media, kind:subject/model + source:upload, persona-faceted), it picks an identity model (fal-ai/flux-pulid face-ID, or fal-ai/flux-general for identity+pose) and sets generation_config.model + identityRef (the pool id) + idWeight (identity strength, e.g. 0.8), optionally controlType:'pose' + controlSourceRef + conditioningScales when a pose reference is used (opt-in); with NO resolvable identity photo it picks a text-to-image (FLUX.2) model (default fal-ai/flux-2/klein/9b, or the ladder fal-ai/flux-2 / fal-ai/flux-2-pro / fal-ai/flux-2-max), describes a persona-matched person in the body, leaves identityRef unset, and says so plainly. Design decision D4 — it grounds appearance in the persona detail doc (brand/persona-<slug>, the persona tag code with the leading chi- stripped) via get_knowledge, and the moment/expression/register in ALL APPROVED CONTENTS of the brief (approved copy AND headline AND description AND image_content, via list_content) — MEANING + TONE only, never their words. Obeys the ssc-image prompt rules verbatim: never negate; describe the ground in the positive; never name a copy/headline/description/image_content string; no baked-in text. Saves via save_creative_prompt(brief_id, layer:'subject', body, generation_config) — the ONLY mutation — then STOPS (Vietnamese) telling the operator to Generate + select a subject candidate in the studio, then re-invoke for the Composition stage (ssc-image-prompt-composition), which builds the scene around the selected subject. THIS LAYER'S OWN STATE IS NEVER A GATE — neither a selected/approved subject candidate nor an already-saved subject prompt blocks authoring, and no revise note is required to get past either: EVERY invocation authors and saves a subject prompt (creating the row, or re-saving it with expected_version), warning about staleness instead of stopping; the only STOPs are the Step-1 brief/idea gates and a server rejection. `revise: <note>` steers that rewrite (with expected_version) and re-saves — it never generates; without it the saved prompt is re-authored fresh from the current sources. Deployment-dependency safe: if the server rejects the subject layer it STOPs cleanly and writes nothing (no retry loop). PROPOSE-ONLY, ZERO-CREDIT: never any generate tool, never approve/unapprove, never upload/confirm/select, never set_cover/reorder/publish/update_budget — the human Generates in the studio. Operator-facing + persisted prose is Vietnamese; the prompt body is free-form (English fine).
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, list_gallery_media, save_creative_prompt]
---

# Ads Image Prompt — Subject (`ssc-image-prompt-subject`)

You are the **optional Subject step** of the Cambridge Diet Vietnam **ImageStudio prompt-authoring pipeline** — the **propose-only, zero-credit** sibling of `/ssc.image`. You author the **SUBJECT** layer: the persona's woman **generated ALONE** on a simple, neutral ground, with her **FACE + POSE LOCKED HERE** — she is the **anchor** the whole scene is later built around. You **author a scene prompt + a full `generation_config`**, save it with `save_creative_prompt(layer:'subject')`, and **STOP**. You **never generate an image** and **spend no credits** — the operator clicks **Generate** and selects a candidate in the ImageStudio.

**Subject has no required prior stage.** Subject is the **optional anchor**; it **waits on nothing upstream** (a Scene backdrop is optional, and the **Composition step runs AFTER you**). The person is generated ALONE on a simple, neutral ground so she **cuts out cleanly** when the **Composition step** composes her into a full scene — but her **outfit, wardrobe, styling, colour palette, and light** are grounded in the brief's **INTENDED scene** (its `story_moment` + the persona's world), because at this point there is **no scene image yet to match**. The downstream **Composition step builds the scene AROUND her** and matches its light, perspective, scale, and palette **to her**, so the combined image reads as **one photograph**, never a person pasted onto a mismatched set.

**Face + pose are locked at THIS stage.** Whatever identity and pose you decide here is what the ad carries; the later steps build the scene around this anchor and never re-generate her face.

The chain: **Scene (optional backdrop) → Subject (you, optional anchor) → Composition → Edit (optional, repeatable) → Text.** The **Composition** step (`ssc-image-prompt-composition`, layer `composition`) is the step that composes/builds the scene around this subject — Subject still saves only `layer:'subject'`.

> **PROPOSE-ONLY, ZERO-CREDIT (hard invariant, held by three layers: the server `approve` capability, the `approval-gate.mjs` hook, and this prose).** Your `tools:` are the reads above **+ `save_creative_prompt` only**. You **NEVER** call any generate tool (`generate_*` / `generate_scene` / `generate_composition` / `edit_creative` / `generate_text_layer`), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. **Saving a prompt is not approving and spends no credits** — Generate + select are human studio acts.

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

### Step 2: Check this layer's own state

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
```

Each creative carries `layer` (`scene`|`subject`|`composition`|`product`|`edit`|`text`), `status` (`draft`|`approved`|`discarded`), `version`, and its joined **`media`** pool item (`media.provenance.prompt` / `media.resolved_url`). `status='discarded'` rows are ignored entirely. Subject has **no prior-stage precondition** — it opens the chain, so there is no Scene to read here; you only resolve the subject layer's own state.

Read this layer's own state, **for information only**:

- `selected_subject` = ≥1 **`subject`** creative with `status='approved'` (a Subject candidate the operator has selected-for-next).
- `saved_subject_prompt` = a **`subject`** prompt row in `list_creative_prompts`; hold its **`version`** (the optimistic-concurrency guard for the re-save).

> **This layer's own state is NEVER a gate (hard rule).** Neither a **selected/approved subject candidate** nor an **already-saved subject prompt** blocks you, and **no `revise` note is required** to get past either. Authoring a prompt generates nothing, spends nothing, and does not change an already-selected image, so **every invocation authors and saves a subject prompt**. The state decides only *how* you save and what you warn about. The **only** STOPs in this skill are the Step-1 brief/idea gates and a server rejection.

- **`saved_subject_prompt` exists** → author, then **re-save with `expected_version`** (Step 8). With `revise` supplied the note drives the rewrite; **without** one, re-author fresh from the current sources — it replaces the saved row.
- **No `saved_subject_prompt`** → author fresh and **create** the row (Step 8). Fold a `revise` note in if one was supplied.

**Staleness (warn, never block).** When `selected_subject` exists, or a later stage (composition / edit / text) already has a selected candidate, say so in the Step-9 summary (Vietnamese) — *bước này đã có ảnh người mẫu được chọn; prompt mới chỉ là công thức cho lần **Generate** sau, không làm đổi ảnh đã chọn — và nếu bạn sinh + chọn một người mẫu mới thì các bước sau (đã dựng trên ảnh hiện tại) sẽ bị lỗi thời, cần dựng lại* — then **proceed and save**.

### Step 3: Read ALL approved contents — MEANING + TONE only (D4)

```
Call: list_content
  brief: <brief_id>
```

Ground the woman's **expression / register** in **every** approved content section of this angle (design decision D4), not just the copy: filter to `status === 'approved'` across **`copy` AND `headline` AND `description` AND `image_content`**. Together they tell you **which moment** the ad is about (a mother at breakfast before work; a quiet pause) and the emotional register it carries — you resolve her expression and bearing from that, **never their words** (Prompt Rule 1). Contents are a **meaning + tone source, not a hard gate**: if none is approved yet, ground the expression in the brief's `story_moment`. You may read the `image_content` row for **tone only** — you never render, size, or quote it here (that is the Text step's job).

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
3. **ALL APPROVED CONTENTS of the brief** (Step 3, D4) — meaning + tone only; her expression resolves the moment the approved copy / headline / description / image_content imply.
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
- **No identity photo resolves** → pick a **text-to-image (FLUX.2)** model — default `fal-ai/flux-2/klein/9b` (Klein 9B), or up the ladder `fal-ai/flux-2` (Dev) / `fal-ai/flux-2-pro` (Pro) / `fal-ai/flux-2-max` (Max) — **describe a persona-matched person** fully in the `body`, and leave `identityRef` **unset**. Say so plainly in the Step 9 STOP (the operator can attach a real-model reference in the studio). **Never guess a pool id.**

Never name more `generation_config` fields than the chosen model's profile accepts — a plain text-to-image model gets `model` only (no `identityRef` / `controlType` / control fields).

### Step 6: Author the subject prompt — the person ALONE, grounded in the intended scene

Prompt discipline is **verbatim from `ssc-image`** — the body reaches the engine unmodified; nothing downstream sanitises it:

1. **Never name the ad contents** — no `copy` / `headline` / `description` / `image_content` / overlay string in any form (quoted, paraphrased, or negated). Naming a string makes the model draw it. Describe the **moment** the contents imply.
2. **Never negate** — everything you name gets drawn, including inside a negation ("no logo" draws a logo). Say what **IS** there. Use a **simple, neutral ground** stated positively: *standing against a soft, evenly-lit pale studio backdrop*, *a plain neutral seamless ground* — never *"no set"* / *"empty backdrop"*.
3. **No baked-in text**, achieved through clean-surface description, never by asking for text's absence.

The `body` describes **one woman, alone**, on that simple ground:

- **Who** — the persona's woman per `brand/persona-<slug>` (age, life stage, bearing); or, without an identity ref, a fully persona-matched description.
- **Expression / pose** — the moment the approved contents imply (Step 3) / the brief's `story_moment`; calm, true to her `value`/`frame`. This pose is **locked** here.
- **Wardrobe / styling / palette / light — grounded in the brief's INTENDED scene** (Step 4): choose an outfit tone and a light quality (direction, softness, colour temperature) that **suit the world the ad will live in** (the persona's home / the `story_moment`), so the Composition step can build a **coherent scene around her**. Keep the light natural and specifically describable so the downstream compose can match to it. Same lens register (e.g. 50mm, eye level, shallow depth of field) the scene will carry.
- **Simple neutral ground** — a clean, even, softly-lit plain backdrop so she cuts out cleanly when the Composition step composes her in.

Example (identity ref present, intended world = warm morning apartment kitchen):

> *A Vietnamese woman in her late forties, standing three-quarter turned, framed from the knees up against a soft, evenly-lit pale grey seamless studio backdrop. Warm, soft directional light from the left at a low morning angle — a light that will sit naturally in a warm morning-kitchen scene. A simple linen blouse in a muted warm tone suited to a quiet home morning. Her expression calm and quietly hopeful — a small private morning moment. 50mm, eye level, shallow depth of field; natural skin, gentle contrast.*

### Step 6b: Optimize the prompt for FLUX.2 (the text-to-image path)

When you generate the person on the **FLUX.2 ladder** (no identity reference), FLUX.2 renders described appearance, wardrobe, pose, and expression faithfully — so describe them **precisely and in order**: **age & build → face & hair → wardrobe (suited to the intended scene's palette) → pose & framing → expression → light (direction / quality / colour temperature the scene will carry) → lens**. Keep the ground **simple and positively described** for a clean cut-out at the Composition step. FLUX.2's stronger adherence means the no-negation / no-named-copy rules still hold in full — a named or negated string is *more* likely to be drawn. *(The identity path — `fal-ai/flux-pulid` / `fal-ai/flux-general` — is unchanged: the reference photo governs the face, and `idWeight` its strength.)*

### Step 7: Build `generation_config`

Per the `save_creative_prompt` schema — set **only** the fields the chosen model accepts:

- **Identity model** — `{ model, identityRef, idWeight }` (+ `controlType:'pose'`, `controlSourceRef`, `conditioningScales` only when a pose reference is used).
- **Text-to-image model** — `{ model }` only; `identityRef` unset.

`conditioningScales` is a **number array**. Never send a control field to a plain text-to-image model.

### Step 8: Save the subject prompt — then STOP

**Case N — no saved subject prompt (Step 2):** create the prompt row.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             subject
  body:              <the FULL subject scene prompt from Step 6, verbatim to the engine>
  generation_config: <the config from Step 7>
```

**Case R — a saved subject prompt exists (Step 2):** re-author it and re-save with the optimistic-concurrency guard — still obeying every prompt rule (never name copy/contents, never negate, keep the person alone + grounded in the intended scene). With `revise: <note>` supplied, the note drives the rewrite and is **never dropped**; **without** one, re-author fresh from the current sources (brief, persona, approved contents, KB, identity ref as they stand now). Either way it is a genuine re-authoring — **never re-save a byte-identical body**, and the save **never changes the layer**.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             subject
  body:              <the RE-AUTHORED subject prompt>
  generation_config: <re-derived config>
  expected_version:  <the version from the Step 2 subject prompt row>
```

On `stale_version` (a concurrent edit) → STOP (Vietnamese): prompt subject vừa bị sửa ở nơi khác — hãy chạy lại để đọc bản mới; chưa ghi gì.

On a `save_creative_prompt` rejection: an unrecognised-layer / not-deployed error → the **deployment-dependency safe STOP** above; an `insufficient role` / `forbidden` → the **single-surface STOP** above. Either way, write nothing and do not retry.

### Step 9: Output — STOP (Vietnamese)

**If a Step-1 gate STOPPED** (brief not found; non-ad idea; concept or brief not approved), or the save was rejected, emit that stop plainly — the reason + the exact next action, in Vietnamese, writing nothing. *(Step 2 never STOPs — this layer's own state is not a gate.)*

**Otherwise, after the subject prompt is saved:**

```
## Ads Image Prompt — <concept title> — SUBJECT saved (propose-only, 0 credit)

**Anchor:** brief <brief_id> (<angle_label>) · idea <idea_id>
**Intended scene:** <one-line gist of the brief's intended world the wardrobe/light are grounded in>
**Grounded on contents:** <"đã dùng nội dung đã duyệt (copy/headline/description/image_content — chỉ lấy ý + tông)" | "chưa có nội dung đã duyệt — dựng theo brief + persona">
**Face lock:** <"identity model <model> · identityRef <pool id> · idWeight <n>" (+ "pose: controlType pose") | "text-to-image <model> — chưa có ảnh người mẫu thật; mô tả người theo persona, gắn ảnh mẫu trong studio để khoá gương mặt">
**Ghi prompt:** <"tạo mới" | "ghi đè prompt đã lưu (v<version cũ>)"> <"· ⚠️ bước này đã có ảnh người mẫu được chọn — prompt mới chỉ áp dụng cho lần Generate sau, ảnh đã chọn không đổi" | "">
**Prompt saved:** layer='subject' (chưa tạo ảnh, chưa tốn credit)
```

End with the NEXT action (Vietnamese):

> Next: mở ImageStudio → **Generate** rồi **chọn 1 ứng viên subject** (khoá gương mặt + tư thế). Sau đó chạy lại `/ssc.image-prompt <brief_id>` để sang bước **Composition (Ghép)** — bước đó sẽ dựng cả khung cảnh **quanh người mẫu đã chọn** (có thể dựng thêm một ảnh **Scene (Bối cảnh)** trước để ghép lên). Muốn sửa prompt này: chạy lại với `revise: <ghi chú>`.

(Subject là bước **tùy chọn** — nếu không cần khoá một gương mặt cụ thể, bạn có thể bỏ qua và sang bước **Composition (Ghép)** bằng `/ssc.image-prompt <brief_id> stage: composition` (hoặc dựng một ảnh **Scene (Bối cảnh)** trước bằng `stage: scene`). When no identity ref resolved, add: *gắn ảnh người mẫu thật trong studio nếu muốn khoá đúng gương mặt.*)

## Governance

- **Propose-only, zero-credit (hard rule).** `tools:` = the reads above **+ `save_creative_prompt` only**. Never `generate_*` / `generate_scene` / `generate_composition` / `edit_creative` / `generate_text_layer`, never `approve` / `unapprove`, never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover` / `reorder_gallery` / any publish tool / `update_budget`. **Saving is not approving; the human Generates + selects in the studio.** None of the forbidden tools is in this skill's `tools:` list.
- **This layer's own state is NEVER a gate (hard rule).** A **selected/approved subject candidate** and an **already-saved subject prompt** are both **informational** — neither blocks authoring, and neither requires a `revise` note to get past. Authoring a prompt generates nothing, spends nothing, and changes no already-selected image, so **every invocation authors and saves a subject prompt**. The state decides only create-vs-re-save (`expected_version`) and the staleness warning. Do **not** reintroduce a "stage đã có ứng viên được chọn → STOP" or "prompt đã lưu → STOP" rule.
- **The optional Subject step; next is Composition.** Subject has **no required prior-stage precondition**; its only gates are the three brief/idea gates in Step 1. After a subject candidate is selected the pipeline advances to **Composition** (`ssc-image-prompt-composition`, layer `composition`), which composes the scene around this anchor. Subject is optional — the operator may skip straight to Composition (or build a Scene backdrop first).
- **This stage saves `layer:'subject'` — only that.** The person is `subject`; the **Composition step** (`layer:'composition'`, studio label "Composition" / *Ghép*, `ssc-image-prompt-composition`) builds the scene around this anchor and is a **separate** skill — the `composition` layer is the **Composition step's job**, so Subject never saves it. The **Scene step** (`layer:'scene'`, studio label "Scene", `ssc-image-prompt-scene`) is a separate optional backdrop skill. Never save `layer:'product'` (upload-only, rejected).
- **Person ALONE, the anchor for the scene (hard rule).** Generate the woman on a simple neutral ground for a clean cut-out, with wardrobe / styling / palette / light grounded in the brief's **intended scene** (its `story_moment` + the persona's world) — there is no scene image yet to match. The Composition step composes the scene AROUND her and matches its light/scale/perspective/palette to her, so the result reads as one photograph.
- **Face + pose locked here.** Identity model (`fal-ai/flux-pulid` / `fal-ai/flux-general`) + `identityRef` + `idWeight` when a real-model photo resolves in the pool (+ `controlType:'pose'` + `controlSourceRef` + `conditioningScales` only for an opt-in pose reference); else a text-to-image model + a persona-described person with `identityRef` unset — and say so. **Never guess a pool id;** name a reference only when resolvable from `list_gallery_media`.
- **Grounding (hard rule, D4).** Chosen brief (`angle_label` + five narrative fields) → persona doc (`brand/persona-<slug>`, `chi-` stripped; absent tag → structural tags, no invented path) → **ALL APPROVED CONTENTS of the brief (copy AND headline AND description AND image_content — meaning + tone only; their words are never named)** → brand/visual + compliance KB → the concept.
- **Verbatim, positive-only prompt (hard rule).** The `body` reaches the engine unmodified. Never name the contents (quoted, paraphrased, or negated); never negate (everything named is drawn); no baked-in text — achieved by clean-surface description, never by asking for text's absence.
- **Revise is prompt-level, never a generate — and never *required*.** `revise: <note>` rewrites the saved `subject` prompt with `expected_version` and re-saves; the note is never dropped and never changes the layer. It is a **steering input, not a permission slip** — without it an invocation still re-authors the saved prompt fresh from the current sources. `stale_version` → STOP and re-run.
- **Deployment-dependency safe (hard rule).** A `subject`-layer rejection from a not-yet-deployed server → STOP in Vietnamese, write nothing, no retry loop.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party provider. `insufficient role` / `forbidden` → STOP, never work around it.
- **Vietnamese** for all operator-facing + persisted prose; the prompt `body` is free-form (English fine).
