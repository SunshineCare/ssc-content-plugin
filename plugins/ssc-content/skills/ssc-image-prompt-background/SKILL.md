---
name: ssc-image-prompt-background
description: Stage 1 (Background / Nền) of the PROPOSE-ONLY, ZERO-CREDIT ImageStudio prompt-authoring pipeline — the still-image sibling of ssc-image, but it NEVER generates and spends NO credits. Its sole input is a REQUIRED approved angle brief_id, resolved via get_brief → { brief, idea } (no separate idea_id), gated on idea.channel='ad' + idea.status='approved' + brief.status='approved' (else a Vietnamese STOP, nothing written). As the FIRST stage it has no prior-candidate precondition; it AUTHORS the full fresh empty-scene body prompt — reserving, IN THE POSITIVE, BOTH the text zone AND the open subject zone the later stages fill — grounded in the five sources in this order of authority (chosen brief angle → persona detail doc brand/persona-<slug> → approved copy read for MEANING ONLY, never its words → brand/visual + compliance KB → the concept), obeying the ssc-image prompt rules (never negate; reserve space positively; never name a copy/headline string; no baked-in text), then PERSISTS it via save_creative_prompt(brief_id, layer:'background', body, generation_config:{ model:'fal-ai/flux/schnell' }) — a text-to-image profile, so generation_config sets only model (the operator may pick fal-ai/flux/dev or fal-ai/flux-2-pro) — and STOPS, telling the operator (Vietnamese) to click Generate + select a background candidate in the ImageStudio, then re-invoke for the next stage (subject). revise: <note> rewrites this layer's saved prompt (passing expected_version from the list_creative_prompts row for optimistic concurrency) and re-saves — never generating. A server rejection of the layer/config STOPs cleanly in Vietnamese and writes nothing (no retry loop). PROPOSE-ONLY, ZERO-CREDIT: tools are reads + save_creative_prompt ONLY — never a generate_* / compose_ad_visual / generate_text_layer, approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget; saving a prompt is NOT approving and spends NO credits — the human clicks Generate. Operator-facing prose is Vietnamese; the image prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, save_creative_prompt]
---

# Ads Image-Prompt — Stage 1 · Background (`ssc-image-prompt-background`)

You are **stage 1** of the Cambridge Diet Vietnam **ImageStudio prompt-authoring pipeline** — the **propose-only, zero-credit** sibling of `ssc-image`. You take **ONE approved angle `brief_id`**, author the **full scene prompt for the empty `background` (Nền) layer**, persist it with its `generation_config` via **`save_creative_prompt(layer:'background')`**, and **STOP**. **You never generate an image and you spend no credits** — the operator clicks **Generate** in the ImageStudio and **selects** a candidate; only then does the pipeline advance to `subject`.

**Propose-only, zero-credit (hard invariant).** Saving a prompt is **NOT** approving and **spends no credits**. Your `tools:` are **reads + `save_creative_prompt` only**. You **NEVER** reference or call any generation tool (`generate_background` / any `generate_*` / `compose_ad_visual` / `generate_text_layer`), `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. Generation, candidate selection, and hero/export are the operator's studio actions. **None of those tools appears in this skill's `tools:` list.**

> **Single MCP surface (hard rule).** `get_brief`, `get_idea`, `list_content`, `list_creatives`, `list_creative_prompts`, `get_knowledge`, and `save_creative_prompt` are BrandOS server-side tools on the `ssc` surface. You call **only** these; you never curl a provider API and never author a prompt anywhere but through `save_creative_prompt`.

> **A `save_creative_prompt` call may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** That is a **server-side permission**, not a bad argument and not an unmet precondition — do NOT retry with different arguments and do NOT silently skip. STOP and tell the operator (Vietnamese):
>
> > Tài khoản BrandOS của bạn chưa có quyền lưu prompt (server trả về `insufficient role`). Hãy nhờ quản trị BrandOS cấp quyền, rồi chạy lại lệnh. **Chưa có gì được ghi.**

## Inputs

Required:

- `brief_id` — the operator's **chosen approved angle brief** (produced first by `/ssc.ads-brief`, approved in the dashboard). It anchors every read and the save. Resolved via `get_brief` — which returns the brief **AND** its owning ad concept — so there is **no separate `idea_id` input**.

Optional:

- `revise` — a free-text correction for **this** (`background`) layer's saved prompt. It is **never dropped**: when a background prompt is already saved, it **rewrites** that prompt (Step 5, case R); when none is saved yet, it is **folded into the fresh prompt** you author. It never generates.
- `model` — a text-to-image fal model id for `generation_config.model`. The **default is `fal-ai/flux/schnell`**; the operator may instead pick `fal-ai/flux/dev` or `fal-ai/flux-2-pro`. All three are plain **text-to-image** profiles, so `generation_config` carries **only `model`** (never `controlType` / `identityRef` / other control fields — those belong to later layers). An id outside the text-to-image FLUX family → STOP (Vietnamese), report it, write nothing; never guess a substitute.

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

### Step 2: Read this layer's studio state (`background` only)

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
```

From `list_creatives`, compute — for the **`background`** layer only:

- `selected_background` = ≥1 `background` creative with `status='approved'` (a background candidate the operator has **selected-for-next**). `status='discarded'` rows are ignored entirely.

From `list_creative_prompts`, find the single **`background`** prompt row if one exists and hold its **`version`** (the `revise` optimistic-concurrency guard):

- `saved_bg_prompt` = a `background` prompt row exists.

Apply the **FIRST** matching rule:

| # | Condition | Action |
|---|---|---|
| 1 | `selected_background` | **STOP** — the background is already selected; this stage is done. A `revise` note has **no effect** here (to redo, discard the selected background in the studio first). Route the operator to the next stage: chạy `/ssc.image-prompt <brief_id>` để dựng prompt bước **Người mẫu (subject)**. **Staleness (warn, never block):** if any later stage (subject/scene/composite/text) already has a selected candidate, add — *đổi ảnh nền ở bước này sẽ khiến các bước sau (đã dựng trên nền hiện tại) bị lỗi thời, cần dựng lại.* |
| 2 | `saved_bg_prompt` **and** `revise` supplied | Author the **rewrite** → **Step 3 + 4**, then **Step 5 case R** (re-save with `expected_version`). |
| 3 | `saved_bg_prompt` **and no** `revise` | **STOP** — the background prompt is already saved but no candidate is selected yet. Do **not** re-author or overwrite. Tell the operator (Vietnamese) to **Generate + select** a background candidate in the ImageStudio (or re-run with `revise: <ghi chú>` to correct the prompt), then re-invoke. |
| 4 | no `saved_bg_prompt` | Author **fresh** → **Step 3 + 4**, then **Step 5 case N** (create). If `revise` was supplied, fold its correction into this fresh prompt. |

### Step 3: Ground the scene — five sources, in this order of authority

Resolve all five **before authoring any prompt**:

1. **The chosen angle brief** (Step 1) — `angle_label` + `hook_direction` / `core_message` / `why_now` / `story_moment` / `cta`. This is *the* angle; the scene expresses **this and nothing else**. The authored prompt must visibly carry the brief's `core_message` and `story_moment`.
2. **The persona detail doc** — `brand/persona-<slug>` (Step 1). It gives the woman's world her **age, life stage, home, light, and emotional register** — even though **no person is drawn at this layer**, her world sets the setting, palette, and mood.
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

- `brand/visual-identity` — palette, light, register, **and the standing composition convention** (the reserved clean zone).
- `ad/visual-direction-ref` — the visual direction reference for ads.
- `ad/creative-guidelines` — what a converting Cambridge ad visual looks like.
- `rules/compliance` — NĐ-15/2018 + brand compliance as a **visual constraint** (no medical/clinical staging, no before/after body comparison, nothing implying a promised result).
- `rules/food-placeholder` — the food-placeholder / imagery rules the scene must respect.
- `brand/persona-<slug>` — the persona detail doc.

Do not call `get_knowledge` for unrelated paths.

### Step 4: The prompt rules (HARD — the `body` reaches the engine verbatim)

The `body` you save is the layer's scene prompt; the operator's Generate sends it to the image engine **unmodified**. There is **no `prompt_hints`** and **no server-side assembly** to sanitise it.

**Rule 1 — never name the ad copy.** No `copy` / `headline` / `description` / overlay string appears in the prompt **in any form — not quoted, not paraphrased, not negated.** *Naming a string makes the model render it.* Describe the **scene the copy implies**, never its words.

**Rule 2 — never negate.** Everything you name gets drawn, **including inside a negation** — "no text", "no people", "without a logo" all push the model toward exactly those things. Say what **IS** there. (❌ *"no clutter"* → ✅ *"an uncluttered countertop of pale wood, bare except for a single ceramic mug"*.)

**Rule 3 — reserve BOTH zones geometrically, in the positive.** This is the empty scene the later layers fill, so two zones need room and you buy it by describing each as **what it positively IS**:

- **Text zone** (the dashboard overlays text there later): ✅ *"the upper third is a smooth, evenly-lit cream plaster wall"* — ❌ never *"leave room for the headline"*, ❌ never *"no text"*.
- **Subject zone** (the `subject` / Scene layer places the person there): ✅ *"the left third is an open, sunlit stretch of clean countertop and wall, calm and inviting"* — ❌ never *"no woman there"*, ❌ never *"space for a person"*.

The reserved-space convention is a **standing composition rule from the visual KB**, not derived from any overlay-text body — you never read the overlay text and never size anything from it; you simply always leave clean, evenly-toned zones.

**Rule 4 — no baked-in text, ever.** No letters, words, or logos in the image, achieved **through Rules 1–3** (clean-surface description), **never** by asking for text's absence.

Prompt language is **free-form** (English is usually best for the engines) — the one exemption from the Vietnamese rule, which governs operator-facing prose.

**A well-formed background prompt** must: express the brief's `core_message` + `story_moment` and the moment the approved copy implies (meaning only); place the persona's world (her home, her light, her life stage); honour the visual + compliance KB; **reserve both the text zone and the open subject zone in the positive**; and keep the frame word-free by clean-surface description. Example:

> *Early-morning Vietnamese apartment kitchen, warm daylight through a sheer curtain. The upper third of the frame is a smooth, evenly-lit cream plaster wall, unbroken. Below it, across the lower two-thirds: the right half holds a pale wooden counter with a single ceramic mug and a folded cloth, softly lit, while the left third of that lower band is an open, sunlit stretch of clean countertop and wall — calm and inviting. Gentle, natural light; muted warm palette; 50mm, eye level, shallow depth of field. Quiet, hopeful, unhurried.*

### Step 5: Persist the prompt via `save_creative_prompt` — then STOP

Build `generation_config = { model: <the model input, or 'fal-ai/flux/schnell'> }` — **only `model`** (text-to-image profile).

**Case N — no saved background prompt (rule 4):** create the prompt row.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             background
  body:              <the FULL background scene prompt (Step 4)>
  generation_config: { model: <'fal-ai/flux/schnell' | the model input> }
```

**Case R — a saved background prompt exists and `revise` was supplied (rule 2):** rewrite it, carrying the operator's note (still obeying every Step 4 rule), and re-save with the existing row's `version` as `expected_version` for optimistic concurrency. **Never re-save an unchanged body** — the new `body` MUST differ by the operator's correction.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             background
  body:              <the REWRITTEN background scene prompt, note applied>
  generation_config: { model: <'fal-ai/flux/schnell' | the model input> }
  expected_version:  <the version held from the list_creative_prompts background row>
```

- On a `stale_version` reject → **STOP** (Vietnamese): prompt vừa bị chỉnh ở nơi khác — hãy chạy lại lệnh (mình sẽ đọc lại phiên bản mới nhất). Chưa ghi gì. Do **not** retry blindly.
- **Deployment-dependency safe STOP:** if `save_creative_prompt` is rejected because the deployed server does not support this `layer` / `generation_config` shape → **STOP**, write nothing, do **not** retry in a loop (Vietnamese): server BrandOS chưa hỗ trợ bước này — báo quản trị deploy bản mới rồi chạy lại; **chưa ghi gì**.

Capture the saved prompt's returned id/version. Then **STOP** — you are done for this invocation.

### Step 6: Output — the STOP message (Vietnamese)

**If a state rule STOPPED at Step 2** (background already selected → route to `subject`; prompt already saved with no candidate → Generate + select), or a gate STOPPED at Step 1, or the save was rejected, emit that stop message plainly — the reason and the exact next action, in Vietnamese. **Produce no image, spend no credits.**

**Otherwise, after the prompt is saved**, output:

```
## Ads Image-Prompt — <concept title> — Background (Nền) prompt saved

**Target:** brief <brief_id> (<angle_label>) · idea <idea.id>
**Layer:** background — text-to-image
**Model:** <generation_config.model>
**Grounded on copy:** <"đã dùng ≥1 copy đã duyệt (chỉ lấy ý, không nêu chữ)" | "chưa có copy đã duyệt — dựng theo brief + persona (nên chạy /ssc.ads-produce <brief_id> copy để sắc hơn)">
**Reserved zones:** text zone (upper) + open subject zone (positive) — no baked-in text
**Prompt saved:** propose-only, ZERO credit spent — the operator Generates in the studio.
```

Then end with the next action (Vietnamese):

> Prompt nền đã được lưu — **chưa sinh ảnh và chưa tốn credit nào.** Mở ImageStudio của brief này, bấm **Generate** ở bước **Background (Nền)**, rồi **chọn (select)** một ảnh nền ưng ý. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để mình dựng prompt cho bước tiếp theo — **Người mẫu (subject)**. (Muốn sửa prompt nền: chạy lại với `revise: <ghi chú>`.)

## Output

- **Saved, not generated.** ONE `background` prompt row via `save_creative_prompt(brief_id, layer:'background', body, generation_config:{ model })`. Saving persists the prompt + its settings; it is **NOT** generation and **NOT** approval, and it spends **no** credits.
- **One layer per invocation.** The operator Generates + selects a background candidate in the ImageStudio, then re-invokes for the next stage (`subject`) — or re-invokes with `revise: <note>` to rewrite this layer's prompt.
- **The prompt is the work product.** A complete, self-contained scene prompt authored here, sent verbatim by the operator's Generate; both the text zone and the open subject zone are reserved **in the positive**, and the frame carries **no baked-in text**.
- No image generated, no candidate selected/approved, no gate flipped, no cover set.

## Governance

- **Propose-only, zero-credit (hard rule).** Never call any tool that generates, approves, uploads, selects, sets a cover, reorders, publishes, or spends budget — never `generate_*` / `compose_ad_visual` / `generate_text_layer`, never `approve` / `unapprove` (the approval hook denies `approve_*` to agents), never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover` / `reorder_gallery`, never publish, never `update_budget`. Save the `background` prompt and STOP. **Saving is not approving and spends no credits** — Generate is the human's studio click. None of the forbidden tools appears in this skill's `tools:` list.
- **First stage, no prior-candidate precondition.** `background` opens the pipeline; it needs no earlier layer. Its only gates are the three brief/idea gates in Step 1. Approved `copy` is a **grounding source used when present**, never a hard gate — with none, ground in the brief + persona and note the softer scene.
- **Layer is `background`, always.** Every `save_creative_prompt` call from this skill passes `layer:'background'`. This skill never saves any other layer, and never `layer:'product'` (product is an upload-only input to a later stage, not a prompt layer).
- **Text-to-image `generation_config`.** `generation_config` carries **only `model`** (default `fal-ai/flux/schnell`; `fal-ai/flux/dev` / `fal-ai/flux-2-pro` selectable) — never a control/identity field; those belong to later layers.
- **Verbatim, positive-only prompt (hard rule).** You author the COMPLETE scene prompt; it reaches the engine unmodified. (1) Never name the ad copy — not quoted, paraphrased, or negated. (2) Never negate — everything named gets drawn. (3) Reserve the text zone AND the open subject zone **geometrically, in the positive**, per the standing composition rule from the visual KB. (4) No baked-in text, ever, achieved through (1)–(3), never by asking for text's absence.
- **Grounding (hard rule).** Before authoring: the chosen brief (`angle_label` + five narrative fields) → the persona detail doc (`brand/persona-<slug>`, mechanically derived; absent tag → structural tags only, never an invented path) → the approved `copy` (**a meaning source — its words are never named**) → the visual + compliance KB (`brand/visual-identity`, `ad/visual-direction-ref`, `ad/creative-guidelines`, `rules/compliance`, `rules/food-placeholder`) → the concept.
- **Revise is prompt-level, never generation, note never dropped.** `revise: <note>` rewrites **this** layer's saved prompt (with `expected_version` from the `list_creative_prompts` row) when one exists, or is folded into the fresh prompt when none does; it never generates and never changes which layer is active.
- **Deployment-dependency safe STOP.** A server rejection of the layer / `generation_config` STOPs cleanly in Vietnamese, writes nothing, and does not retry in a loop.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party image-provider API — not even when a save fails.
- **Phase 1 = ad channel only.** `channel='ad'` concepts only; a non-ad idea STOPS cleanly.
- **Operator-facing prose and persisted notes are Vietnamese**; the image prompt `body` is free-form.
- Requires the `edit` capability — for `save_creative_prompt` and the `list_creatives` / `list_creative_prompts` reads. Generate + select in the ImageStudio, and hero/export, are the operator's dashboard actions.
