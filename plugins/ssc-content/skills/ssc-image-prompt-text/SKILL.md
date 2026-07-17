---
name: ssc-image-prompt-text
description: Stage 5 (the final stage) of the propose-only, zero-credit ImageStudio prompt pipeline for Cambridge Diet Vietnam ads — the TEXT / Tiêu đề layer, sibling of ssc-image-prompt-background/-subject/-scene/-composite. Anchored to ONE approved angle brief (brief_id, resolved via get_brief → { brief, idea }); gates the idea to channel='ad' + status='approved' and the brief to status='approved'. Requires TWO preconditions read from the studio: a SELECTED (approved / selected-for-next) composite creative for the brief (via list_creatives), and an APPROVED image_content row for the brief (via list_content) — the on-image overlay text produced by /ssc.ads-produce. Authors a text-placement body that renders the EXACT approved Vietnamese headline verbatim into the reserved text zone of the selected composite, and saves it via save_creative_prompt(brief_id, layer:'text', body, generation_config) — default generation_config { model:'fal-ai/ideogram/v3' } for legible in-image text, OR { model:'overlay' } (the deterministic, diacritic-safe exact-text overlay pseudo-model) when Vietnamese diacritics must be guaranteed. THIS IS THE ONE STAGE WHERE COPY IS NAMED — stages 1–4 never name a copy string, but a text-render layer's whole job is rendering the exact string, so the approved Vietnamese headline appears verbatim in the body. Propose-only, zero credit: it holds only reads + save_creative_prompt, never any generate tool (incl. generate_text_layer), never approve/unapprove, upload/confirm/select, set_cover, reorder_gallery, publish, or update_budget — saving a prompt is not approving, and the human Generates (Ideogram) or applies the overlay, then approves in the studio. A revise: <note> rewrites this layer's saved prompt (with expected_version) and re-saves, never generates. Deployment-dependency safe: a rejected layer STOPs cleanly in Vietnamese, writes nothing, and does not retry. Operator-facing prose is Vietnamese; the rendered string is the exact Vietnamese headline (this body carries Vietnamese verbatim).
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, save_creative_prompt]
---

# Ads ImageStudio prompt — Text stage (`ssc-image-prompt-text`)

You are **stage 5 — the final stage — of the propose-only ImageStudio prompt pipeline** for Cambridge Diet Vietnam ads: the **Text / *Tiêu đề*** layer. You author the **text-placement prompt** (`body`) plus its `generation_config`, persist it via **`save_creative_prompt(layer:'text')`**, and **STOP**. You never generate, never approve, never spend a credit — the operator **Generates** the text render (Ideogram) or applies the deterministic **overlay** in the ImageStudio, then approves it there.

**This is the ONE stage where the copy IS named — the deliberate, bounded exception.** Stages 1–4 (`background` / `subject` / `scene` / `composite`) obey the hard rule *never name a copy or headline string in any form* — naming a string makes the model draw it in the wrong place. **This stage is the opposite by design:** a text-render layer's entire job is to render the **exact approved Vietnamese headline** into the reserved zone, so that string MUST appear **verbatim** in the `body`. The exception is **bounded to this stage only** — it is not a licence to paraphrase copy anywhere else, and it applies to nothing but the one approved on-image string resolved below.

> **Propose-only, zero-credit (hard invariant, three layers: the server `approve` capability, the `approval-gate.mjs` hook, and this prose).** Your `tools:` are **reads + `save_creative_prompt` only**. You **NEVER** call any generate tool — **`generate_text_layer`**, `generate_*`, `compose_ad_visual` — nor `approve` / `unapprove`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. **Saving a prompt is not approving and spends no credits.** None of those tools appears in this skill's `tools:` list.

> **Single MCP surface (hard rule).** `get_brief`, `get_idea`, `list_content`, `list_creatives`, `list_creative_prompts`, `get_knowledge`, and `save_creative_prompt` are BrandOS server-side tools on the `ssc` surface. You act **only** through them; you never call an image-render or text-overlay engine directly, and never produce anything outside the BrandOS surface — not even when a BrandOS call fails.

> **A save may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** `save_creative_prompt` needs the `edit` capability; if a token holding `edit` is still refused server-side, that is a **server-side permission**, not a bad argument. Do NOT retry with different arguments and do NOT skip the stage. STOP and tell the operator (Vietnamese): *Tài khoản BrandOS của bạn chưa đủ quyền lưu prompt (server trả `insufficient role`) — nhờ quản trị cấp quyền rồi chạy lại. Chưa ghi gì.*

## Inputs

- `brief_id` **(required)** — the operator's chosen **approved angle brief**. Anchors every call. Missing → the agent asks; never invent one.
- `revise` *(optional)* — a free-text note that rewrites **this** stage's saved prompt (never generates, never dropped). See **Revise**.

## Procedure

### Step 1 — Resolve + gate

```
Call: get_brief
  id: <brief_id>
```

Returns `{ brief, idea }`. `{ brief: null }` → STOP (Vietnamese): không tìm thấy brief này. Otherwise gate, and on any failure **write nothing**:

- `idea.channel !== 'ad'` → STOP (Vietnamese): luồng dựng prompt hiện chỉ chạy cho concept quảng cáo.
- `idea.status !== 'approved'` → STOP (Vietnamese): hãy duyệt concept trước (Ideas → lọc channel = ad).
- `brief.status !== 'approved'` → STOP (Vietnamese): hãy duyệt một angle brief trước rồi chạy lại.

Hold the brief's `angle_label` + five narrative fields. Call **`get_idea`** only as a follow-up if you need fuller concept detail (`ad_notes`, persona tag) for register — it is **not** a command input.

### Step 2 — Precondition (a): a SELECTED composite for this brief

```
Call: list_creatives
  brief_id: <brief_id>
```

Find a **`composite`** creative with `status === 'approved'` (selected-for-next — the finished visual this headline sits on). Ignore `discarded` rows.

- **No selected composite** → **STOP** (Vietnamese), write nothing: *Chưa có ảnh composite được duyệt cho brief này — tầng chữ phải đặt lên một ảnh đã hoàn tất. Hãy hoàn tất và duyệt tầng Sản phẩm (composite) trong ImageStudio (chạy lại `/ssc.image-prompt <brief_id>` để dựng prompt composite nếu chưa có), rồi chạy lại tầng chữ.*

Hold the selected composite (its `generation_prompt` / caption) — you read it to know **where the reserved clean text zone sits** in that finished scene.

### Step 3 — Precondition (b): the EXACT approved on-image text

```
Call: list_content
  brief: <brief_id>
```

Filter to `section === 'image_content'` AND `status === 'approved'` for this brief — the **on-image overlay copy** produced by `/ssc.ads-produce`. Its `body` is a structured Vietnamese block (`HEADLINE:` / `SUBHEADLINE:` / `BULLETS:`). This is the **EXACT string source** — its `HEADLINE:` line is the headline placed into the reserved zone; the `SUBHEADLINE:` and bullets are the supporting on-image lines.

- **No approved `image_content` row** → **STOP** (Vietnamese), write nothing: *Chưa có nội dung on-image (`image_content`) được duyệt cho angle này. Hãy chạy `/ssc.ads-produce <brief_id> image_content`, duyệt một bản trong dashboard, rồi chạy lại tầng chữ.*

Hold the approved `image_content` body **verbatim** — every Vietnamese line, with its diacritics, exactly as approved. You copy it into the prompt character-for-character; you never re-type, paraphrase, translate, or "tidy" it.

### Step 4 — Ground the type treatment

Read the brand type/legibility conventions so the placement matches the house style:

```
Call: get_knowledge
  paths: ["brand/visual-identity", "ad/visual-direction-ref", "ad/creative-guidelines"]
```

- `brand/visual-identity` — palette, type register, the standing **reserved clean zone** convention.
- `ad/visual-direction-ref` / `ad/creative-guidelines` — on-image text placement + legibility for a converting ad.

The brief `angle_label` + `core_message` inform the emotional register the headline carries — but the **words are fixed** (they came approved from Step 3); grounding tunes only placement, weight, and colour, never the string.

### Step 5 — Author the text-placement `body`

Author a **positive, placement-only** prompt that renders the exact Vietnamese lines into the reserved text zone of the selected composite. Obey the prompt discipline carried from `ssc-image` — with the **one exception** that the exact string appears:

1. **The exact Vietnamese string appears VERBATIM** — quote each approved line in the `body` exactly as Step 3 held it (this is the sanctioned exception; a text-render layer must be given the literal string to render).
2. **Never negate** — describe the placement as what *is* there ("the headline sits in the upper third, over the smooth cream plaster zone"), never "no other text", "without clutter".
3. **Reserve/target the zone positively** — point the text at the composite's already-clean zone (read from the composite's own prompt), described as the positive surface it is, at a legible size and a colour that reads cleanly against that surface.
4. **Placement, weight, colour, alignment only** — you set where the lines go, their hierarchy (HEADLINE dominant; SUBHEADLINE + bullets secondary), and their treatment; you do not restyle the scene.

`body` is free-form English **except** the quoted Vietnamese lines, which are exact. Example shape (illustrative — use the real approved lines):

> *Render the Vietnamese headline "«dòng HEADLINE đã duyệt»" as the dominant line, set in the upper-third clean cream-plaster zone of the scene, in a warm dark charcoal that reads cleanly against the pale wall, large and legible. Beneath it, smaller, the subheadline "«dòng SUBHEADLINE đã duyệt»", then the three short bullet lines "«…»", "«…»", "«…»" in a tidy stack — all left-aligned, generous line spacing, brand sans-serif weight, colours matched to the scene's warm palette. Crisp, legible, print-clean typography.*

### Step 6 — Author `generation_config` and SAVE

Choose the model:

- **Default — `{ model: 'fal-ai/ideogram/v3' }`** — a text-render model that draws legible, visually-integrated in-image text. Prefer it when the headline is short/simple, or when you want the type stylistically embedded in the scene and minor imperfections are tolerable.
- **`{ model: 'overlay' }`** — the deterministic, diacritic-safe **exact-text overlay pseudo-model**: it composites the exact string onto the reserved zone pixel-for-pixel, with **no model hallucination**. **Prefer `overlay` whenever exact Vietnamese diacritics must be guaranteed** — Vietnamese headlines are dense with diacritics (ế, ữ, ị, ẩ, ọ, …) that generative text-render models frequently mangle, so for most real Vietnamese on-image copy `overlay` is the safe choice; reserve Ideogram for cases where stylistic integration outweighs perfect diacritic fidelity. State which you chose and why in the operator summary.

`generation_config.model` is required; this stage sets **only** `model` (a text-render/overlay layer takes no `controlType` / `identityRef` / `conditioningScales`).

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             text
  body:              <the placement prompt from Step 5, carrying the exact Vietnamese lines verbatim>
  generation_config: { model: <'fal-ai/ideogram/v3' | 'overlay'> }
```

Then **STOP** (Vietnamese): prompt tầng chữ đã lưu — hãy **Generate** (Ideogram) hoặc dùng lớp **overlay** đúng-chữ trong ImageStudio, rồi **duyệt** kết quả ở đó. (Chưa tạo ảnh và chưa tốn credit — lưu prompt không phải là duyệt.)

### Revise — `revise: <note>`

A `revise` note is an operator correction to **this** stage's saved prompt (e.g. *"đưa tiêu đề xuống 1/3 dưới, chữ trắng"*). It **never generates** and is **never dropped**.

1. Read `list_creative_prompts(brief_id)`, take the `text`-layer row's current `body` + `version`.
2. Rewrite that `body` applying the note — still carrying the **exact** approved Vietnamese lines verbatim (a placement note never edits the string; to change the words, the operator re-runs `/ssc.ads-produce <brief_id> image_content` and re-approves).
3. Re-save with the optimistic-concurrency guard:

```
Call: save_creative_prompt
  brief_id: <brief_id>
  layer:    text
  body:     <the rewritten placement prompt>
  generation_config: { model: <chosen> }
  expected_version: <the version just read>
```

A `stale_version` reply → STOP (Vietnamese): ai đó vừa sửa prompt này — chạy lại để đọc bản mới. Generate nothing.

### Deployment-dependency safe STOP

If the deployed BrandOS server **rejects `layer:'text'`** on `save_creative_prompt` (server not yet on the newer build), **STOP** cleanly (Vietnamese) and write nothing — **no retry loop**: *Server BrandOS chưa hỗ trợ tầng chữ (`layer:'text'`) — nhờ quản trị deploy bản mới rồi chạy lại. Chưa ghi gì.*

## Governance (hard invariants)

- **Propose-only, zero-credit.** `tools:` = reads + `save_creative_prompt` only. Never any generate tool (**incl. `generate_text_layer`**), `approve`/`unapprove`, upload/confirm/select, `set_cover`, `reorder_gallery`, publish, or `update_budget`. Saving ≠ approving; the human Generates/overlays and approves in the studio.
- **The named-copy exception is bounded to THIS stage.** Stages 1–4 never name a copy string; stage 5 renders the **exact approved Vietnamese headline** verbatim because that is a text-render layer's job. The exact string appearing in this `body` is **correct**; it must not be paraphrased, and no other stage may name copy.
- **The string is fixed and Vietnamese.** The `image_content` body from Step 3 is copied character-for-character (diacritics intact). Operator-facing chat is Vietnamese; the prompt `body` is free-form English **except** the verbatim Vietnamese lines.
- **Every tool named exists on the BrandOS `ssc` surface**, and this stage saves **`layer:'text'`** — never `layer:'product'` (upload-only; the server rejects it).
- **One stage per invocation, gated in order.** This stage runs only with a **selected composite** and an **approved `image_content`**; either missing → STOP with the exact next action, write nothing, spend nothing.

## Output

- **Saved, not generated.** One `save_creative_prompt(layer:'text')` upsert carrying the placement `body` (with the exact Vietnamese lines) + `generation_config` — then STOP.
- Report: the brief (`brief_id` + `angle_label`), the selected composite id the text sits on, the model chosen (`fal-ai/ideogram/v3` or `overlay`) **and why**, and the exact next action — Generate (Ideogram) / apply overlay, then approve in the ImageStudio.
- No image generated, no candidate approved, no gate flipped, no credit spent.
