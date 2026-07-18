---
name: ssc-image-prompt-text
description: Step 4 (the final step) of the propose-only, zero-credit ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads — the TEXT / Tiêu đề layer, sibling of ssc-image-prompt-subject/-background/-composite. Anchored to ONE approved angle brief (brief_id, resolved via get_brief → { brief, idea }); gates the idea to channel='ad' + status='approved' and the brief to status='approved'. It parents on the CHAIN TIP — the nearest previous selection walking ['composite','model','subject','background'] (a prior Edit `composite`, a Compose `model`, a Subject `subject`, or a Scene `background`; every upstream step is OPTIONAL and skip-transparent, so a Compose, a Subject, or a Scene alone is a valid parent — Text is NOT anchor-gated and never requires an Edit, and Text-on-Scene is allowed) — read via list_creatives, plus an APPROVED image_content row for the brief (via list_content) — the on-image overlay text produced by /ssc.ads-produce. Authors a text-placement body that renders the EXACT approved Vietnamese headline verbatim onto a naturally clean area of the finished chain-tip image, and saves it via save_creative_prompt(brief_id, layer:'text', body, generation_config) — default generation_config { model:'fal-ai/ideogram/v3' } for legible in-image text, OR { model:'overlay' } (the deterministic, diacritic-safe exact-text overlay pseudo-model) when Vietnamese diacritics must be guaranteed. THIS IS THE ONE STEP WHERE COPY IS NAMED — the upstream steps (Scene / Subject / Compose / Edit) never name a copy string, but a text-render layer's whole job is rendering the exact string, so the approved Vietnamese headline appears verbatim in the body. Propose-only, zero credit: it holds only reads + save_creative_prompt, never any generate tool (incl. generate_text_layer), never approve/unapprove, upload/confirm/select, set_cover, reorder_gallery, publish, or update_budget — saving a prompt is not approving, and the human Generates (Ideogram) or applies the overlay, then approves in the studio. A revise: <note> rewrites this layer's saved prompt (with expected_version) and re-saves, never generates. Deployment-dependency safe: a rejected layer STOPs cleanly in Vietnamese, writes nothing, and does not retry. Operator-facing prose is Vietnamese; the rendered string is the exact Vietnamese headline (this body carries Vietnamese verbatim).
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, save_creative_prompt]
---

# Ads ImageStudio prompt — Text stage (`ssc-image-prompt-text`)

You are **Step 4 — the final step — of the propose-only ImageStudio prompt-authoring pipeline** for Cambridge Diet Vietnam ads: the **Text / *Tiêu đề*** layer. You author the **text-placement prompt** (`body`) plus its `generation_config`, persist it via **`save_creative_prompt(layer:'text')`**, and **STOP**. You never generate, never approve, never spend a credit — the operator **Generates** the text render (Ideogram) or applies the deterministic **overlay** in the ImageStudio, then approves it there.

The chain: **Scene (optional backdrop) → Subject (optional) → Compose → Edit (optional, repeatable) → Text (you).** You **parent on the CHAIN TIP** — the **nearest previous selection**, walking `['composite','model','subject','background']` (a prior **Edit** `composite`, a **Compose** `model`, a **Subject** `subject`, or a **Scene** `background`; nearest-first, optional steps transparent). Every upstream step is optional, so a Compose, a Subject, or a Scene alone is a valid parent — Text is **NOT** anchor-gated and never requires an Edit (Text-on-Scene is allowed). The **Compose** step owns the `model` layer (`ssc-image-prompt-compose`).

**This is the ONE step where the copy IS named — the deliberate, bounded exception.** The upstream steps (`background` (Scene) / `subject` / `model` (Compose) / `composite` (Edit)) obey the hard rule *never name a copy or headline string in any form* — naming a string makes the model draw it in the wrong place. **This step is the opposite by design:** a text-render layer's entire job is to render the **exact approved Vietnamese headline** onto the finished image, so that string MUST appear **verbatim** in the `body`. The exception is **bounded to this step only** — it is not a licence to paraphrase copy anywhere else, and it applies to nothing but the one approved on-image string resolved below.

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

### Step 2 — Precondition (a): the CHAIN TIP for this brief (the nearest previous selection)

```
Call: list_creatives
  brief_id: <brief_id>
```

Resolve the **chain tip** — the finished visual this headline sits on — as the **nearest previous selection**, walking `['composite','model','subject','background']` (nearest-first; optional steps transparent). Ignore `discarded` rows.

- the **latest approved `composite`** creative (a selected **Edit**, `status === 'approved'`) if any exists — Edit is optional and repeatable, so when edits exist the tip is the most-recent selected one;
- **else** the approved **`model`** creative (a selected **Compose**);
- **else** the approved **`subject`** creative (a selected **Subject**);
- **else** the approved **`background`** creative (a selected **Scene**).

Every upstream step is optional and **skip-transparent**, so a Compose, a Subject, or a Scene alone is a valid parent — Text is **not** anchor-gated and does **not** require an Edit (Text-on-Scene is allowed).

- **No chain tip at all** (no approved `composite` / `model` / `subject` / `background`) → **STOP** (Vietnamese), write nothing: *Chưa có ảnh nào đã chọn cho brief này — tầng chữ phải đặt lên một ảnh đã hoàn tất và được chọn ở một bước phía trước. Hãy hoàn tất và chọn 1 ứng viên ở một bước bất kỳ phía trước (**Scene / Subject / Compose / Edit**) trong ImageStudio (chạy lại `/ssc.image-prompt <brief_id>`), rồi chạy lại tầng chữ.*

Hold the chain tip (its `media.provenance.prompt` / `media.caption`) — you read it to know **where a naturally clean, quiet area sits** in that finished scene for the text (there is no pre-reserved text plane — the overlay renders onto the finished image).

### Step 3 — Precondition (b): the EXACT approved on-image text

```
Call: list_content
  brief: <brief_id>
```

Filter to `section === 'image_content'` AND `status === 'approved'` for this brief — the **on-image overlay copy** produced by `/ssc.ads-produce`. Its `body` is a structured Vietnamese block (`HEADLINE:` / `SUBHEADLINE:` / `BULLETS:`). This is the **EXACT string source** — its `HEADLINE:` line is the headline placed onto the finished image (its naturally clean area); the `SUBHEADLINE:` and bullets are the supporting on-image lines.

- **No approved `image_content` row** → **STOP** (Vietnamese), write nothing: *Chưa có nội dung on-image (`image_content`) được duyệt cho angle này. Hãy chạy `/ssc.ads-produce <brief_id> image_content`, duyệt một bản trong dashboard, rồi chạy lại tầng chữ.*

Hold the approved `image_content` body **verbatim** — every Vietnamese line, with its diacritics, exactly as approved. You copy it into the prompt character-for-character; you never re-type, paraphrase, translate, or "tidy" it.

### Step 4 — Ground the type treatment

Read the brand type/legibility conventions so the placement matches the house style:

```
Call: get_knowledge
  paths: ["brand/visual-identity", "ad/visual-direction-ref", "ad/creative-guidelines"]
```

- `brand/visual-identity` — palette, type register, and how on-image type sits in the house style.
- `ad/visual-direction-ref` / `ad/creative-guidelines` — on-image text placement + legibility for a converting ad.

The brief `angle_label` + `core_message` inform the emotional register the headline carries — but the **words are fixed** (they came approved from Step 3); grounding tunes only placement, weight, and colour, never the string.

### Step 5 — Author the text-placement `body`

Author a **positive, placement-only** prompt that renders the exact Vietnamese lines onto a naturally clean, quiet area of the finished chain-tip image. Obey the prompt discipline carried from `ssc-image` — with the **one exception** that the exact string appears:

1. **The exact Vietnamese string appears VERBATIM** — quote each approved line in the `body` exactly as Step 3 held it (this is the sanctioned exception; a text-render layer must be given the literal string to render).
2. **Never negate** — describe the placement as what *is* there ("the headline sits in the upper third, over the smooth cream plaster area"), never "no other text", "without clutter".
3. **Target a naturally clean area positively** — point the text at a quiet, uncluttered part of the finished image (read from the chain tip's own `media.provenance.prompt`), described as the positive surface it is, at a legible size and a colour that reads cleanly against that surface. There is **no pre-reserved text plane** — the overlay renders onto whatever the finished scene shows.
4. **Placement, weight, colour, alignment only** — you set where the lines go, their hierarchy (HEADLINE dominant; SUBHEADLINE + bullets secondary), and their treatment; you do not restyle the scene.

`body` is free-form English **except** the quoted Vietnamese lines, which are exact. Example shape (illustrative — use the real approved lines):

> *Render the Vietnamese headline "«dòng HEADLINE đã duyệt»" as the dominant line, set in the upper-third clean cream-plaster zone of the scene, in a warm dark charcoal that reads cleanly against the pale wall, large and legible. Beneath it, smaller, the subheadline "«dòng SUBHEADLINE đã duyệt»", then the three short bullet lines "«…»", "«…»", "«…»" in a tidy stack — all left-aligned, generous line spacing, brand sans-serif weight, colours matched to the scene's warm palette. Crisp, legible, print-clean typography.*

### Step 6 — Author `generation_config` and SAVE

Choose the model:

- **Default — `{ model: 'fal-ai/ideogram/v3' }`** — a text-render model that draws legible, visually-integrated in-image text. Prefer it when the headline is short/simple, or when you want the type stylistically embedded in the scene and minor imperfections are tolerable.
- **`{ model: 'overlay' }`** — the deterministic, diacritic-safe **exact-text overlay pseudo-model**: it composites the exact string onto the finished image (the target clean area) pixel-for-pixel, with **no model hallucination**. **Prefer `overlay` whenever exact Vietnamese diacritics must be guaranteed** — Vietnamese headlines are dense with diacritics (ế, ữ, ị, ẩ, ọ, …) that generative text-render models frequently mangle, so for most real Vietnamese on-image copy `overlay` is the safe choice; reserve Ideogram for cases where stylistic integration outweighs perfect diacritic fidelity. State which you chose and why in the operator summary.

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

**Staleness (warn, never block).** Text is the final step — nothing downstream depends on it. But if this step already has a selected candidate, note to the operator (Vietnamese) that *sửa prompt không đổi ảnh chữ đã chọn (ảnh đã cố định) — nó chỉ là công thức cho lần Generate mới* — then proceed. Never block.

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
- **The named-copy exception is bounded to THIS step.** The upstream steps (Scene / Subject / Compose / Edit) never name a copy string; the Text step renders the **exact approved Vietnamese headline** verbatim because that is a text-render layer's job. The exact string appearing in this `body` is **correct**; it must not be paraphrased, and no other step may name copy.
- **The string is fixed and Vietnamese.** The `image_content` body from Step 3 is copied character-for-character (diacritics intact). Operator-facing chat is Vietnamese; the prompt `body` is free-form English **except** the verbatim Vietnamese lines.
- **Every tool named exists on the BrandOS `ssc` surface**, and this step saves **`layer:'text'`** — never `layer:'product'` (upload-only; the server rejects it), never `layer:'model'` (that is the **Compose** step's job — `ssc-image-prompt-compose`).
- **One step per invocation, gated in order.** This step runs only with a **chain tip** (the **nearest previous selection** — a prior Edit `composite`, a Compose `model`, a Subject `subject`, or a Scene `background`) and an **approved `image_content`**; either missing → STOP with the exact next action, write nothing, spend nothing. Every upstream step is optional/skip-transparent — a Compose, a Subject, or a Scene alone satisfies the chain-tip precondition (Text-on-Scene is allowed).

## Output

- **Saved, not generated.** One `save_creative_prompt(layer:'text')` upsert carrying the placement `body` (with the exact Vietnamese lines) + `generation_config` — then STOP.
- Report: the brief (`brief_id` + `angle_label`), the chain-tip id the text sits on (the nearest previous selection — a prior Edit `composite`, a Compose `model`, a Subject `subject`, or a Scene `background`), the model chosen (`fal-ai/ideogram/v3` or `overlay`) **and why**, and the exact next action — Generate (Ideogram) / apply overlay, then approve in the ImageStudio.
- No image generated, no candidate approved, no gate flipped, no credit spent.
