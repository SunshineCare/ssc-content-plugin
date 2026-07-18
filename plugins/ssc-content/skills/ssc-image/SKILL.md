---
name: ssc-image
description: The VISUAL producer of the Cambridge Diet Vietnam ad-production workflow — a STATE-DRIVEN, per-step stepper that SPENDS fal credits by calling the generate tools (the credit-spending counterpart of the propose-only ImageStudio prompt authors, the visual sibling of ssc-ads-writer, and the still-image sibling of /ssc.video). Anchored to ONE approved angle brief. The NEW 4-step pipeline (5→4, Scene retired): Step 1 — Subject (OPTIONAL, tool generate_subject, layer key `subject`) a standalone person generated ALONE, an anchor candidate; Step 2 — Full image (REQUIRED, tool generate_background, layer key `background`) the full ad scene, DUAL-ROLE — attach the selected subject and/or product refs → Kontext image-edit built AROUND the anchor(s), or attach NEITHER → FLUX.2 text-to-image from scratch (never an empty anchorless plate, never a reserved zone); Step 3 — Edit (OPTIONAL + REPEATABLE, tool compose_ad_visual, layer key `composite`) a GENERIC prompt-to-edit over the chain tip (the operator's "what to change"), product placement is now ONE kind of edit; Step 4 — Text (tool generate_text_layer, layer key `text`) renders the approved headline over the chain tip. The old Scene step (layer `model`, tool generate_model) is RETIRED from the studio flow — generate_model is never called, the `model` key stays dormant. Lineage is the derived_from chain tip (subject → full → edit* → text), optional-step transparent: skip Subject → the Full image is a text-to-image root; skip Edit → Text hangs off the Full image. A brief carries N PARALLEL Full-image chains (each approved Full image is a chain ROOT); chain selection is never silent — ≥2 approved Full images and no `chain` → STOP-and-ask; `new-chain` mints an ADDITIONAL chain. Subject + product are BRIEF-LEVEL anchor inputs shared by every chain. THREE preconditions in order — the idea is channel='ad' + approved; brief_id is an APPROVED angle brief of it; ≥1 APPROVED copy exists for that brief (Text additionally needs an approved image_content headline). Authors the FULL scene prompt for every call; it reaches the engine VERBATIM under four prompt rules (never name the ad copy; never negate; one image per call; no baked-in text) with NO reserved-zone geometry. A CHAIN completes when it holds an approved `text`; the BRIEF is never complete, and choosing the hero image (set_cover) stays the operator's dashboard action. Propose-only on APPROVAL: saves DRAFT creatives, never approves, discards, sets a cover, reorders, publishes, or updates a budget. Operator-facing prose and persisted notes are Vietnamese; image prompts are free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, list_briefs, list_content, get_knowledge, list_creatives, list_creative_prompts, list_gallery_media, generate_subject, generate_background, compose_ad_visual, generate_text_layer]
---

# Ads Image (`ssc-image`)

You are the **visual producer** of the Cambridge Diet Vietnam ad-production workflow — a **state-driven, per-step stepper** that **SPENDS fal credits** by calling the generate tools. You are the **credit-spending counterpart** of the propose-only ImageStudio prompt authors (`ssc-image-prompt-*`, which only `save_creative_prompt`); the **visual sibling of `ssc-ads-writer`** (which produces the ad TEXT); and the still-image sibling of `/ssc.video`. You take **`idea_id` + `brief_id`** — ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`) and the operator's **chosen approved angle brief** — resolve that brief's creatives into **chains**, work the **single next open step**, request the DRAFT creative(s) through the BrandOS server, and **STOP**.

**The NEW 4-step pipeline (the studio went 5→4 — the Scene step is retired).**

| Step | Studio label | Layer key | Generate tool | Optional? |
|---|---|---|---|---|
| 1 | **Subject** | `subject` | `generate_subject` | OPTIONAL — a standalone person, an anchor candidate |
| 2 | **Full image** | `background` | `generate_background` | REQUIRED — the full scene; **dual-role** |
| 3 | **Edit** | `composite` | `compose_ad_visual` | OPTIONAL + **REPEATABLE** — a generic prompt-to-edit |
| 4 | **Text** | `text` | `generate_text_layer` | renders the approved headline over the chain tip |
| ~~—~~ | ~~Scene~~ | ~~`model`~~ | ~~`generate_model`~~ | **RETIRED** — never a studio step; `generate_model` is never called |

**The layer KEYS are stable; only the studio steps changed.** `background` is relabelled **"Full image"**, `composite` is relabelled **"Edit"**. The `model` (Scene) key stays in the enum but **dormant** — old `model` creatives still read, but this skill never produces one and never calls `generate_model`. Do **not** step through `model`.

**The chain is re-rooted on the Full image, and lineage is the `derived_from` chain tip.** There are no more `background_creative_id` / `scene_creative_id` FK columns to reason about — the tools resolve the parent from the **`derived_from` provenance chain**:

```
subject(opt) ──ref──▶ full ──parent──▶ edit ──parent──▶ edit … ──▶ text
                 (full is its own root when no subject/product)
```

- **Step 1 Subject** is a **parentless** standalone person (`derived_from:[]`) — a **brief-level anchor candidate**, not part of any Full-image chain.
- **Step 2 Full image** is a **chain ROOT** (`derived_from:[attached refs | ]`). It is generated with the selected **subject** and/or **product** references attached, or from scratch.
- **Step 3 Edit** and **Step 4 Text** derive from the **chain tip** — the latest approved `composite` (edit) in the chain, else the chain's approved `background` (Full image). The tools take a `from` (parent galleryItemId) that defaults to that tip and is **required when several of a layer are approved**.

**Optional-step transparency (the load-bearing navigation rule).** Every step derives its state from what actually exists, never from a fixed predecessor:

- **Skip Subject** → Step 2 has no subject ref → the Full image is a **text-to-image root** (FLUX.2 from scratch).
- **Skip Edit** → Step 4 Text hangs directly off the **Full image** (the chain tip is the approved `background`).

**A brief carries N PARALLEL Full-image chains — chain-scoped, and chain selection is never silent.** Each **approved `background` (Full image)** is the **ROOT of its own chain** (chain id = that creative's id), and the operator may approve several. So "the Edit layer has an approved creative" tells you nothing about the chain you are advancing — another chain's edit may be what you are seeing. You therefore evaluate every state gate **inside ONE selected chain**, **NEVER** edit or text across chains, and **NEVER** pass another chain's tip as `from`. No approved Full image → Step 2 is **chain CREATION**. Exactly one approved Full image → that chain, unambiguously (resolve it, do not ask). **More than one** and no `chain` argument → **STOP and ASK** which chain to advance. Guessing here is the silent-wrong-target bug this skill exists to avoid — and every generate call spends fal credits, so a STOP-and-ask is always cheaper than a wrong image.

**Subject and product are BRIEF-LEVEL anchor inputs, shared by every chain.** A `subject` is generated by this skill (Step 1) but is optional; a `product` is the **real packaging photograph**, uploaded on the dashboard (never generated, never uploaded by you). Both are anchor references the Full-image step consumes — they belong to no chain, so one approved subject / product serves every chain.

**A CHAIN completes; a BRIEF never does.** A chain is COMPLETE when it holds an approved `text` (the finished ad visual with the headline rendered). There is no "brief complete" state — another chain can always be started with `new-chain`. Which approved visual becomes the hero image is `set_cover`, an **operator dashboard choice** — it is not in your `tools:` list and you never call it.

**Anchor on the brief (`brief_id`) for every CALL; scope on the CHAIN for every DECISION.** Every read (`list_creatives`, `list_creative_prompts`) and every generate call keys on `brief_id`. The chain is **derived** from the `derived_from` lineage every creative row already carries; there is no server-side `chain_id`.

**You author the FULL scene prompt, and it reaches the engine VERBATIM.** Each generate tool takes a complete `prompt` (the Text tool takes the exact `headline`); the server generates from it **unmodified**. There is **no `prompt_hints`** and **no server-side prompt assembly** to correct a sloppy prompt. The prompt is your work product — obey the four prompt rules in Step 5.

**Save-to-server, not present-in-chat (the core of this flow):** once the active step's DRAFT creative(s) are saved, you **STOP**. You do **NOT** present candidate images in chat, pause, or run an in-chat revise loop. The operator **reviews / approves** (or **discards**) the saved DRAFTs in the `/ad/<month>/<idea_id>` dashboard, then **re-invokes** you for the next step — or re-invokes with `revise: <note>` to correct the active step of the selected chain.

You are propose-only on **approval**: every saved creative is a DRAFT for a human to review / approve / discard in the dashboard. **Saving is not approving.** Approving a Full image is also what **curates it into a chain root**. You **NEVER** call `approve` (the ONLY gated promotion — any entity, incl. `creative`; the approval hook denies it to agents), never use `edit` to demote, unapprove, or **discard** a creative (discarding is the operator's call), never call `save_creative_prompt` (the generate tools carry the prompt themselves), `upload_creative` / `confirm_creative_upload` / `select_gallery_creative` (upload + selection are the operator's), `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. **None of those tools appears in this skill's `tools:` list.**

> **Single MCP surface (hard rule).** `generate_subject`, `generate_background`, `compose_ad_visual`, `generate_text_layer`, `list_creatives`, `list_creative_prompts`, and `list_gallery_media` are BrandOS server-side tools on the `ssc` surface. You call the image engines **only** through them (provider keys stay server-side); you **never** curl a provider API directly, and you never produce an image outside the BrandOS surface — not even when a BrandOS call fails.

> **A generate call may be refused with `insufficient role` / `forbidden` — surface it, never work around it.** The reads are satisfied by the same `edit` capability the generate tools use, but a generation tool may still be refused server-side (a token holding `edit` can get `{"error":"internal_error","message":"insufficient role"}`). This is a **server-side permission**, not a bad argument and not an unmet precondition — do NOT retry with different arguments, do NOT fall back to any third-party image API, and do NOT silently skip the step. STOP and tell the operator (Vietnamese):
>
> > Tài khoản BrandOS của bạn chưa có quyền tạo ảnh (server trả về `insufficient role`) — các tool dựng hình cần quyền cao hơn capability `edit`. Hãy nhờ quản trị BrandOS cấp quyền, rồi chạy lại lệnh. Concept và các layer đã duyệt không bị ảnh hưởng; **chưa có gì được ghi**.

## Inputs

Required:

- `idea_id` — the approved ad concept's idea id (an `ideas` row, `channel='ad'`, `status='approved'`).
- `brief_id` — the operator's **chosen approved angle brief** for that concept (produced first by `/ssc.ads-brief`, approved in the dashboard). It anchors every call. The dispatching command requires both; if either is missing it asks the operator — **do not invent one**.

Optional:

- `stage` — explicitly select an OPTIONAL or terminal step: **`subject`** (Step 1) or **`text`** (Step 4). Omit it and the stepper works the **default flow** — the Full-image chain (creation / advance) plus an Edit when `edit:` is supplied. `stage: subject` and `stage: text` are the only two values; anything else → STOP (`invalid_input`).
- `edit` — the operator's **"what to change"** instruction for **Step 3 (Edit)** over the selected chain's tip (e.g. *"đặt sản phẩm Cambridge lên bàn bên trái"*, *"ánh sáng ấm hơn"*, *"dọn bớt vật trên bàn"*). Supplying it requests one edit; the step is **repeatable** (re-invoke with another `edit:` for edit-on-edit). Product placement is **one kind** of edit — there is no dedicated product step.
- `chain` — a **Full-image (`background`) creative id** naming the **approved Full image that roots the chain to advance**. A brief carries N parallel chains; this says which. No approved Full image → not required (Step 2 is chain creation); exactly one → not required (unambiguous); **≥2 and no `chain` → STOP and ASK**; a `chain` that is not an approved `background` creative of this brief → **STOP** (`invalid_input`) naming the valid roots.
- `new-chain` — mint an **ADDITIONAL** Full-image chain: generate 3 fresh Full-image candidates **even though the brief already has an approved Full image**. This is the **only** way Step 2 runs once a root exists — absent this opt-in, a brief with an approved Full image never re-enters Step 2, so a plain re-invocation never burns credits minting roots nobody asked for. With **no** approved Full image yet, `new-chain` is redundant. `new-chain` together with `chain` is **contradictory** → STOP (`invalid_input`).
- `subject` — an **approved `subject` creative id** naming which anchor person the Full image should be built around. Only needed when the brief has **more than one** approved subject (with exactly one, it is used without asking; with none, the Full image is a from-scratch text-to-image). An invalid id → **STOP** (`invalid_input`) listing the approved subjects.
- `product` — an **approved `product` creative id** naming which brief-level packaging shot to anchor on. Only needed when the brief has **more than one** approved product. An invalid id → **STOP** (`invalid_input`) listing the approved products.
- `revise` — a free-text revision note for the **active step of the SELECTED CHAIN**. It is **never ignored** (Step 8): with a pending draft it **rewrites** that step's prompt and issues ONE fresh generate call; with no pending draft (e.g. the operator discarded them all) it is **folded into the prompt(s) you author fresh**. It never changes *which* step, and never *which chain*, is active.
- `model` — a fal model id, passed through unchanged to the active step's generate call. Omit it and the server default governs (the Full-image role auto-resolves; see Step 9).
- `period` — the plan month (`YYYY-MM`), informational only — used when pointing the operator at `/ad/<month>/<idea_id>`.

There is **no `layout_hint` / `hard_paste`** any more: `compose_ad_visual` is now a generic edit and takes neither — product placement direction lives in the `edit:` change text. There is **no `uploaded_media_id` / `uploaded_media_ref`** (a real model photo is placed via an operator dashboard upload), **no `image_content_id`**, and **no `n`** parameter.

**Deriving `<month>` for every `/ad/<month>/<idea_id>` link** — `period` is optional, so resolve the month in this order and **never invent one**:

1. The operator supplied `period` → use its `YYYY-MM`.
2. Otherwise, **only if** the `get_idea` result (Step 1) actually carries an **explicit scheduled / plan date field** for the concept, take that date's `YYYY-MM`. Step 1's documented result does **not** promise such a field, so treat this as *present-or-not*. **Never derive a month from `created_at`, `updated_at`, or any incidental timestamp.**
3. Neither available → write the path **literally** as `/ad/[month]/<idea_id>` (the bracketed `[month]` is reserved for exactly this unknown-month fallback) and add the operator note (Vietnamese): *Mình chưa xác định được tháng của concept — hãy mở dashboard Ads (`/ad`) rồi vào trang tháng của concept.* **Never guess a month.**

## Procedure

### Step 1: Resolve the concept — precondition 1 (approved ad idea)

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the idea's lifecycle core (incl. `id`, `status`, `channel`), its ad detail as top-level fields (`ad_notes`), and its `tags[]` (each `{ term_id, kind, code, label }`). If it does not resolve (`{ idea: null }`), STOP and tell the operator (Vietnamese) the idea id was not found.

**Gate-check.**

- If `channel !== 'ad'`, STOP (Vietnamese): luồng dựng hình cho post/youtube chưa được nối (giai đoạn sau) — hiện `/ssc.image` chỉ chạy cho concept quảng cáo (`channel = ad`). Produce no visual.
- If `status !== 'approved'`, STOP (Vietnamese):

  > Concept quảng cáo này vẫn là bản nháp — hãy tuyển chọn và duyệt concept trước (Ideas → lọc channel = ad), rồi chạy lại lệnh dựng hình.

Hold `idea.id`, `idea.title` (the concept spine), `idea.ad_notes`, and `idea.tags[]` (the structural dimensions — layer / value / frame / persona / against).

**Resolve the persona's detail-doc path.** The persona tag's taxonomy `code` maps to a KB path by a fixed rule: `brand/persona-<slug>`, where `<slug>` is the `code` with the leading `chi-` prefix removed (`chi-huong` → `brand/persona-huong`, `chi-lan` → `brand/persona-lan`, `chi-mai` → `brand/persona-mai`, `chi-thao` → `brand/persona-thao`). Same rule `ssc-ads-brief` / `ssc-ads-writer` use. Hold the ONE resolved path for Step 4. **If the concept carries no persona tag, do not invent a doc path** — ground the subject in the structural tags and the brief alone.

### Step 2: Resolve + gate the chosen angle brief — precondition 2

There is **no `get_brief`** tool in this skill's list. Read the idea's briefs and select the single row:

```
Call: list_briefs
  idea: <idea.id>
```

It returns `briefs[]`, each with `id`, `status`, `angle_label`, and the five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`). Select the **single** row whose `id === brief_id`.

- **Not found** → STOP (Vietnamese): không tìm thấy brief này cho concept — hãy chạy `/ssc.ads-brief <idea_id>` và duyệt một angle trước, rồi chạy lại với đúng `brief_id`.
- **Not approved** (`status !== 'approved'`) → STOP (Vietnamese): brief angle này vẫn là bản nháp — hãy duyệt một brief angle trong `/ad/<month>/<idea_id>` trước, rồi chạy lại lệnh.

Hold the approved brief's `angle_label` + its five narrative fields — **the angle anchor**. Use **only** this one brief; never pool across the idea's other briefs.

> **An idea can carry SEVERAL approved angle briefs** — a single concept commonly holds four or five `status='approved'` briefs, each with its own `angle_label`. **Each approved angle owns its own independent creative surface**, and each angle brief can itself carry SEVERAL parallel Full-image chains. That is why every read and every write keys on `brief_id`, why the copy gate in Step 3 must attribute copy to *this* angle, and why every state decision is scoped to ONE chain. **Keep the full `briefs[]` result** (specifically **how many briefs this idea has**) — Step 3's fallback branch needs that count.

### Step 3: Resolve + gate the approved copy — precondition 3

```
Call: list_content
  idea: <idea.id>
```

It returns `variations[]`, each with `id`, `section` (`copy` | `headline` | `description` | `image_content`), `status` (`draft` | `approved`), `score`, `comment`, `body`, and a **`brief_id`** carrying the row's **angle lineage**. Ad content rows carry a populated `brief_id` (live today), so the brief-scoped match below is the path that fires.

**Brief scope is the NORMAL path.** Filter to `section === 'copy'` AND `status === 'approved'` AND `brief_id === <brief_id>`. This attributes the copy to **this** angle and nothing else — it grounds the visual in the story the operator actually chose.

**The fallback — reachable ONLY when NO approved `copy` row carries a `brief_id` at all** (a legacy row). *Only then*, consult **how many briefs this idea has** (from Step 2) and branch:

- **The idea has exactly ONE brief** → the idea-scope match is unambiguous. Match at idea scope (`section === 'copy'` AND `status === 'approved'`), and **DECLARE it** on the Step 11 summary's `**Copy matched:**` line as an idea-scope fallback.
- **The idea has MORE THAN ONE brief** → those rows **cannot be attributed to an angle**. Matching at idea scope would ground the visual in a **possibly-wrong angle's story** — at fal-credit cost. **STOP**, produce no visual, spend no credits (Vietnamese):

  > Các bài copy đã duyệt của concept này **không mang thông tin angle** (không có `brief_id`), trong khi concept có **nhiều angle**. Vì vậy không thể xác định copy nào thuộc angle bạn đã chọn — dựng hình lúc này có nguy cơ kể câu chuyện của một angle khác. Hãy chạy `/ssc.ads-produce <brief_id> copy`, duyệt ≥1 bản copy cho đúng angle này trong `/ad/<month>/<idea_id>`, rồi chạy lại `/ssc.image <idea_id> <brief_id>`. **Chưa dựng gì và chưa tốn credit nào.**

- **No approved `copy` row for this brief** (and none via the single-brief fallback) → STOP (Vietnamese), produce no visual, spend no credits:

  > Chưa có bài copy nào được duyệt cho angle này. Hãy chạy `/ssc.ads-produce <brief_id> copy`, duyệt ≥1 bản copy trong `/ad/<month>/<idea_id>`, rồi chạy lại `/ssc.image <idea_id> <brief_id>`. Copy là câu chuyện mà hình ảnh phải kể — chưa có copy thì chưa dựng hình.

**Never guess.** Never pick a brief for a row; never assume "the idea's only brief" without checking the Step 2 count; never match at idea scope when the idea has more than one brief.

Hold the approved copy body(ies) — the **meaning** source (Step 4.3) — **and which scope matched** (brief scope, or the single-brief idea-scope fallback) for the Step 11 summary. From the same result you MAY hold the approved `headline` / `description` bodies as extra tone signal (they never gate; their words are never named in a scene prompt).

**Hold the approved `image_content` for Step 4 Text.** The `text` step renders the exact headline. Note whether an `image_content` row exists with `status === 'approved'` AND `brief_id === <brief_id>` (same lineage rule as copy) — its `body` is the headline string `generate_text_layer` will render. `image_content` is **only** a precondition of Step 4; it is **never read or sized into** any Subject / Full-image / Edit prompt (naming a headline string in a scene prompt is exactly how it leaks into the image — Prompt Rule 1).

### Step 4: Ground the visual — five sources, in this order of authority

Resolve all five **before authoring any prompt**:

1. **The chosen angle brief** (Step 2) — `angle_label` + the five narrative fields. This is *the* angle; the visual expresses this and nothing else. The authored prompt must visibly carry the brief's `core_message` and `story_moment`.
2. **The persona detail doc** — `brand/persona-<slug>` (Step 1). It gives the woman in the frame her age, life stage, home, and emotional register. No persona tag → structural tags only, no invented path.
3. **The approved `copy`** (Step 3) — a **meaning** source: it tells you *which moment* the ad is about. You describe **that scene**; you never name its words (Prompt Rule 1).
4. **Brand KB** — the visual identity + constraints.
5. **The concept** — `idea.title`, `idea.ad_notes`, the structural tags.

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

- `brand/visual-identity` — palette, light, register.
- `ad/visual-direction-ref` — the visual direction reference for ads.
- `ad/creative-guidelines` — what a converting Cambridge ad visual looks like.
- `rules/compliance` — NĐ-15/2018 + brand compliance as a **visual constraint** (no medical/clinical staging, no before/after body comparison, nothing implying a promised result).
- `rules/food-placeholder` — the food-placeholder / imagery rules the scene must respect.
- `brand/persona-<slug>` — the persona detail doc.

Do not call `get_knowledge` for unrelated paths.

### Step 5: The four prompt rules (HARD — the prompt reaches the engine verbatim)

Every scene prompt you author describes **only the scene**: setting, staging, subject placement, mood, light, palette, lens/composition. It is sent to the image engine **unmodified** — nothing downstream sanitises it.

**Rule 1 — never name the ad copy.** No `copy`, `headline`, `description`, or overlay string appears in a Subject / Full-image / Edit prompt **in any form — not quoted, not paraphrased, not negated.** *Naming a string makes the model render it.* Describe the **scene the copy implies**, never its words. *(The Text step, Step 4, is the ONE place the exact headline is named — because that step's job is to render it.)*

- Copy says: *"Sáng nào chị cũng vội, bỏ bữa sáng rồi 10 giờ đã đói lả."*
- ✅ Prompt: *"a Vietnamese woman in her late forties at a bright kitchen counter in early morning light, a warm mug in one hand — an unhurried pause inside a busy morning."*
- ❌ Prompt: *"…with the words 'Sáng nào chị cũng vội' …"* (renders the text)
- ❌ Prompt: *"…a busy morning, no text about skipping breakfast…"* (names it inside a negation → still renders)

**Rule 2 — never negate.** Everything you name gets drawn, **including inside a negation**. "no text", "no people", "without a logo" all push the model toward exactly those things. Say what **IS** there.

- ❌ *"no text, no words, no logos"* → ✅ *"a smooth, evenly-lit cream plaster wall, unbroken and calm"*
- ❌ *"no clutter on the counter"* → ✅ *"an uncluttered countertop of pale wood, bare except for a single ceramic mug"*

**Rule 3 — one image per call.** There is **no `n` parameter**. Another candidate means **another call**, with a different prompt (or, on the revise path, a rewritten one).

**Rule 4 — no baked-in text, ever.** No Subject / Full-image / Edit prompt renders words, letters, or logos into the image. This is achieved **through Rules 1–2** (positive, clean-surface description), **never** by asking for text's absence. The words on the finished ad are added **only** at Step 4 (`generate_text_layer` / deterministic overlay).

**No reserved-plane geometry (the old "reserve both zones" rule is DELETED).** You do **not** carve out a text zone (the Text step renders onto the finished image and needs no pre-cleared plane) and you do **not** carve out a subject zone (the subject is a **real reference**, not a void to protect). Author a **complete, filled scene**. If the operator wants a calmer area where a headline may later sit, that is at most an **optional framing** choice — place the anchor slightly off-centre so a naturally quieter part of a **complete** scene falls there — expressed positively, **never** a reserved empty band, **never** *"leave room for the headline"*, **never** a described void.

**Prompt language is free-form** (English is usually best for the engines). Image prompts are the one exemption from the Vietnamese rule, which governs operator-facing prose and persisted content.

### Step 6: Resolve the brief's creatives into CHAINS + brief-level anchors

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
Call: list_gallery_media
  brief_id: <brief_id>        # detect an uploaded product packshot in the brief's pool
```

`list_creatives` returns `creatives[]`, each with `id`, `layer` (`subject` | `background` | `model` | `product` | `composite` | `text`), `status` (**`draft` | `approved` | `discarded`**, all three live), and its joined **`media`** pool item — including **`media.provenance`** (`{ prompt, model, derived_from }`, the frozen record of how the image was made) and the pool item's own id (its **galleryItemId** / `ref`, the value the generate tools take as `subject` / `product` / `from`). *(There is no `generation_prompt` column on the creative — the prompt lives on `media.provenance.prompt`.)*

**Chain membership is derived from the `derived_from` lineage — no server-side `chain_id`:**

| Layer | Lineage | Chain membership |
|---|---|---|
| `subject` | `derived_from:[]` | **BRIEF-LEVEL anchor candidate, in no chain.** An approved subject is an anchor input to Step 2, shared by the whole brief. |
| `background` (Full image) | `derived_from:[attached refs \| ]` | An **APPROVED** Full image **IS a chain ROOT** — **chain id = that creative's id**. A `background` **draft** is a **candidate root**, in no chain yet: *approval curates it into one*. |
| `composite` (Edit) | `derived_from:[parent]` | Belongs to the chain reached by walking `derived_from` back through its parent (an approved `background` or a prior `composite`) to the root `background`. |
| `text` | `derived_from:[parent]` | Belongs to the chain of its parent (the chain tip it was rendered onto). |
| `product` | `derived_from:[]` | **BRIEF-LEVEL upload-only anchor, in no chain.** Shared by every chain. |
| `model` (Scene) | — | **RETIRED / dormant.** Old rows may exist; never produced here, never stepped through, never a valid `from`. |

**`discarded` is a real, third status — ignore those rows entirely for STATE.** A `status='discarded'` creative is NOT a pending draft and NOT approved: it never makes `has_drafts` true, never blocks a fresh candidate, never roots a chain. Its `media.provenance.prompt` + lineage MAY still be read as the chain-scoped **revise base** in Step 8 case B — but it contributes **nothing** to state.

**Unassignable rows STOP the run.** A **non-discarded** `composite` or `text` whose lineage cannot be walked back to an approved chain root of this brief cannot be placed. **Do NOT default it into a chain.** STOP, name the row (`id`, `layer`) and its dangling parent, and generate nothing (Vietnamese): *Có creative không xác định được thuộc chuỗi nào (lineage trỏ tới một creative không phải root đã duyệt của brief này) — mình dừng lại thay vì đoán. Hãy kiểm tra/discard creative đó trong `/ad/<month>/<idea_id>` rồi chạy lại.*

**Brief-level pools** (hold each separately — they stand outside every chain):

- `ROOTS` — every **approved** `background` (Full image). `|ROOTS|` = **how many chains this brief has**.
- `CANDIDATE_ROOTS` — every **draft** `background`: candidate roots awaiting selection.
- `approved_subjects` — every **approved** `subject` creative; `subject_drafts` — every **draft** `subject`. (`list_gallery_media` needs no product-shaped role here — subjects are creatives.)
- `approved_products` — every **approved** `product` creative **plus** any product packshot in `list_gallery_media` (a `kind:product` / packaging item). Product is a brief-level upload.

**Per chain, compute** `approved(L)` (≥1 creative **in THIS chain** with `layer=L`, `status='approved'`) and `has_drafts(L)` (≥1 in THIS chain with `layer=L`, `status='draft'`). Both predicates are **chain-scoped** — another chain's creative never affects them. Every selected chain has `approved(background) === true` by construction.

### Step 6b: Select the step + the chain (NEVER silent)

Apply the **FIRST** matching rule. Nothing is generated by any STOP row — no credits are spent.

| # | Condition | Action |
|---|---|---|
| **A1** | An **unassignable** non-discarded `composite`/`text` row exists (Step 6) | **STOP** — report the row + its dangling parent. Generate nothing. |
| **A2** | `stage` is present and is neither `subject` nor `text` | **STOP** (`invalid_input`) — `stage` accepts only `subject` or `text`. Generate nothing. |
| **A3** | `chain` **and** `new-chain` both supplied | **STOP** (`invalid_input`) — contradictory. Generate nothing. |
| **A4** | `subject` / `product` supplied and it is **not** the id of an approved `subject` / `product` of this brief | **STOP** (`invalid_input`) — list the valid ones. Generate nothing. |
| **A5** | `chain` supplied and it is **not** the id of an **approved `background`** of this brief | **STOP** (`invalid_input`) — list the brief's valid chain roots (id + one-line gist of `media.provenance.prompt`). Generate nothing. |
| **A6** | **`stage: subject`** | **STEP 1 — SUBJECT** (brief-level; no chain selected) → **Step 7-subject**. |
| **A7** | `new-chain` supplied and `|ROOTS| ≥ 1` | **STEP 2 chain CREATION — an ADDITIONAL root.** No chain selected → **Step 7-full** (3 fresh readings, each distinct from every existing root; a `revise` note → Step 8 case B). |
| **A8** | `|ROOTS| == 0` | **STEP 2 chain CREATION — the brief's FIRST root.** `chain` not required; a supplied `new-chain` is redundant. → the chain-creation rules **B1–B3**. |
| **A9** | `chain` supplied (valid, in `ROOTS`) | **SELECT** that chain → the in-chain rules **C1–C9**. |
| **A10** | `|ROOTS| == 1` and no `chain` | **SELECT** the brief's single chain — unambiguous, **do NOT ask** → **C1–C9**. |
| **A11** | `|ROOTS| ≥ 2` and no `chain` | **STOP and ASK which chain to advance.** Generate nothing. **Never pick one silently.** |

**The A11 ask (Vietnamese).** List **every** chain — its **root Full-image creative id**, a one-line gist of that root's `media.provenance.prompt`, and how far it has got (an approved edit? an approved text → chain complete?):

> Brief này có **N chuỗi hình song song**. Mình **không tự chọn** — hãy cho biết muốn đẩy chuỗi nào:
>
> | chain (root Full image) | Bối cảnh | Tiến độ |
> |---|---|---|
> | `<root id 1>` | *bếp căn hộ, nắng sớm qua rèm mỏng* | đã có edit → chưa render text |
> | `<root id 2>` | *phòng khách chiều muộn, ánh đèn ấm* | mới có Full image |
>
> Chạy lại: `/ssc.image <idea_id> <brief_id> chain: <root id>`. (Muốn mở **chuỗi mới**: `/ssc.image <idea_id> <brief_id> new-chain`.) **Chưa dựng gì và chưa tốn credit nào.**

If a `revise` / `edit` note was supplied on an A1–A5 / A11 STOP, say plainly it was **not** applied and must be re-supplied together with `chain:`.

### Step 6c: The chain-scoped state machine (the single next open step)

Apply the **FIRST** matching rule. The `revise` split lives **inside** the table.

**Chain-creation rules** (reached from **A8**: `|ROOTS| == 0`; the `background` pool is brief-level because a candidate root belongs to no chain):

| # | Condition | Action |
|---|---|---|
| **B1** | `CANDIDATE_ROOTS` non-empty (≥1 draft Full image), **no `revise`** | **STOP** — candidate Full images await selection; **approve 1** in `/ad/<month>/<idea_id>` (that mints the brief's first chain) or discard. **No second batch.** |
| **B2** | `CANDIDATE_ROOTS` non-empty, **`revise` supplied** | → **Step 7-full**, but **Step 8 case A** — rewrite ONE candidate's prompt, **ONE** `generate_background` call. Never a second batch of 3. |
| **B3** | `CANDIDATE_ROOTS` empty | → **Step 7-full** — 3 fresh readings (a `revise` note → Step 8 case B, folded into all three). |

*(**A7** — `new-chain` with a root already present — enters **Step 7-full** directly: 3 fresh readings distinct from every existing root. It does not consult `CANDIDATE_ROOTS` and does not STOP on them. `new-chain` is required on every run that mints roots — it is never implied.)*

**In-chain rules** (reached from **A9**/**A10**, ONE chain SELECTED; `approved(background)` true by construction; `revise` / `edit` mean *of this chain*):

| # | Condition (all `approved(L)` / `has_drafts(L)` are **IN THE SELECTED CHAIN**) | Action |
|---|---|---|
| **C1** | `has_drafts(composite)`, **no `revise`** (a pending Edit awaits review) | **STOP** — approve OR discard this chain's pending edit in `/ad/<month>/<idea_id>`, then re-invoke. **One in flight per chain.** |
| **C2** | `has_drafts(composite)`, **`revise` supplied** | active step = **Edit** → **Step 8 case A** — rewrite this chain's pending edit prompt, **ONE** `compose_ad_visual` call over the chain tip. |
| **C3** | `edit: <change>` supplied (a NEW edit request), no pending composite draft | active step = **Edit** → **Step 7-edit** — ONE `compose_ad_visual` over the chain tip (a `revise` note also present → Step 8 case B, folded in). Repeatable. |
| **C4** | `has_drafts(text)`, **no `revise`** | **STOP** — this chain's pending text render awaits review; approve OR discard, then re-invoke. **One in flight per chain.** |
| **C5** | `has_drafts(text)`, **`revise` supplied** | active step = **Text** → **Step 8 case A** — rewrite this chain's pending text placement, **ONE** `generate_text_layer` call over the chain tip. |
| **C6** | `approved(text)` (chain has a rendered final) | **CHAIN COMPLETE — STOP.** Report that THIS chain (root `<id>`) is complete and how many chains the brief now has. Offer the two real next actions: **`new-chain`**, or **choose the hero image** (`set_cover`) in the dashboard. **The BRIEF is never "complete".** A `revise` note has no effect here — say so (to redo an approved text, discard it in the dashboard first). |
| **C7** | **`stage: text`** and an approved `image_content` headline exists | active step = **Text** → **Step 7-text** — ONE `generate_text_layer` over the chain tip (a `revise` note → Step 8 case B). |
| **C8** | **`stage: text`** and **no** approved `image_content` headline | **STOP** — Text needs the approved on-image headline. Route (Vietnamese): chạy `/ssc.ads-produce <brief_id> image_content`, duyệt tiêu đề trong `/ad/<month>/<idea_id>`, rồi chạy lại với `stage: text`. Generate nothing. |
| **C9** | none of the above (the chain has an approved Full image / edits, but no `edit:` and no `stage: text`) | **STOP and offer the two real next steps** — the operator decides whether to Edit or render Text. (Vietnamese) *Chuỗi `<root id>` đã có ảnh nền để tiếp tục. Chọn một trong hai: `edit: <mô tả cần đổi>` để chỉnh sửa (tùy chọn, lặp lại được), hoặc `stage: text` để render tiêu đề đã duyệt lên ảnh. Chưa dựng gì.* |

You work **exactly ONE step of exactly ONE chain per invocation** — never fan out, never advance a chain on the strength of another chain's approved creative, never edit / render text across chains. A `revise` note never changes which step or which chain is active — only how that step's prompt is authored.

**Hold for the rest of the run:** the **selected chain's ROOT** Full-image creative id (the chain id you report); the resolved **chain TIP** (the latest approved `composite` in this chain, else the root `background`) and **its galleryItemId** (the `from` for Edit / Text); the resolved brief-level **anchor(s)** (subject / product galleryItemIds, for a Full-image compose); and `|ROOTS|` for the Step 11 summary.

### Step 7-subject: Step 1 — a standalone person (OPTIONAL, `generate_subject`)

Reached only via **A6** (`stage: subject`). A subject is a **standalone person on a neutral ground**, generated ALONE — a **brief-level anchor candidate** (parentless), later attached as a reference by the Full-image step. First branch on the brief-level subject pool:

- `subject_drafts` non-empty, **no `revise`** → **STOP**: a subject candidate is pending; **approve 1** (or discard) in `/ad/<month>/<idea_id>`, then re-invoke without `stage: subject` to build the Full image around it.
- `subject_drafts` non-empty, **`revise` supplied** → **Step 8 case A** — rewrite ONE pending subject's prompt, **ONE** `generate_subject` call.
- `subject_drafts` empty → generate **three** distinct subject candidates (a `revise` note → Step 8 case B, folded into all three).

Author each prompt from Step 4 grounding: the persona's woman (age, life stage, register from `brand/persona-<slug>`), in an outfit / palette / light coherent with the brief's intended scene, on a **simple neutral ground** so she composes cleanly as a Kontext reference. Three genuine readings (framing / wardrobe / expression), not three re-rolls. Obey the Step 5 rules (no baked-in text; positive description; never name the copy).

```
Call: generate_subject
  brief_id: <brief_id>
  prompt:   <the FULL standalone-person prompt — reading 1>
  model:    <only if the operator supplied one; otherwise OMIT>
```

…then again with reading 2, and reading 3. Capture the creative ids, then **STOP** — the operator approves one, and that approved subject becomes the anchor the Full-image step attaches.

### Step 7-full: Step 2 — the Full image (REQUIRED, `generate_background`, DUAL-ROLE)

**This step is chain CREATION.** An approved Full image is a chain ROOT, so it runs in exactly two situations: **B3** (the brief has no approved Full image — no chain yet), or **A7** (`new-chain` — an explicit additional chain even though an approved Full image exists; read the existing roots' `media.provenance.prompt` and make the three new readings **genuinely distinct** from every one of them). Absent that opt-in, a brief with an approved Full image NEVER re-enters this step.

**Resolve the anchors (dual-role) — from Step 6's brief-level pools:**

- **Subject** — `approved_subjects`: zero → no subject ref; exactly one → attach it (use without asking); ≥2 and no `subject:` selector → **STOP and ASK which** (list them; generate nothing). Pass the chosen subject's **galleryItemId** as `subject`.
- **Product** — `approved_products`: zero → no product ref; exactly one → attach it; ≥2 and no `product:` selector → **STOP and ASK which** (list them; generate nothing). Pass the chosen product's **galleryItemId** as `product`.

The **role auto-resolves** server-side from ref presence: **subject and/or product attached → Kontext image-edit** built AROUND the anchor(s) (the environment is depth the model builds around them); **neither attached → FLUX.2 text-to-image** from scratch (a complete, lived-in scene — never an empty plate). You do not choose the role — you choose which refs to attach; the operator's `model` override still wins the model id.

Issue **three separate** `generate_background` calls, each carrying a **distinct** full scene prompt — three genuine readings of the same angle (different setting / time-of-day / staging), not three re-rolls. Each mints ONE DRAFT `background` creative and is a **candidate root**: approving one mints the chain.

> **If the operator supplied a `revise` note** (rules **B3** / **A7**), the note is NOT dropped: **all three** prompts carry its correction. Read Step 8 case B first.

Each prompt must:

- express the brief's `core_message` + `story_moment` and the moment the approved copy implies (meaning only — Rule 1);
- place the persona's world (her home, her light, her life stage);
- honour `brand/visual-identity` / `ad/visual-direction-ref` / `ad/creative-guidelines` and the `rules/compliance` + `rules/food-placeholder` visual constraints;
- be a **complete, filled scene with NO reserved voids** (no text zone, no subject zone);
- keep the frame word-free through positive clean-surface description (Rules 2, 4);
- **when a subject/product is attached** — describe the **output scene built around the referenced anchor**, matching the anchor's light direction/softness/colour temperature, scale, perspective, and palette so the result reads as **one photograph**; **name the reference** (*"the referenced woman"*, *"the referenced Cambridge product package"*) and do **not** re-describe or contradict its supplied attributes (the subject's face/wardrobe, the product's label come from the reference).

```
Call: generate_background
  brief_id: <brief_id>
  prompt:   <the FULL scene prompt — reading 1>
  subject:  <the chosen subject galleryItemId, if any; otherwise OMIT>
  product:  <the chosen product galleryItemId, if any; otherwise OMIT>
  model:    <only if the operator supplied one; otherwise OMIT>
```

…then reading 2, and reading 3 (same anchors). Example (subject attached; warm morning apartment kitchen):

> *Build a complete early-morning Vietnamese apartment kitchen around the referenced woman: she stands three-quarter turned at a pale wooden counter, warm daylight from a sheer-curtained window on her left. The room extends around her in believable depth — a soft-focus kitchen with real domestic detail (a kettle, a folded cloth, a low shelf), the light matching the direction, softness, and colour temperature already on her, her scale and eye-level consistent with a 50mm lens. Muted warm palette throughout; quiet, hopeful, unhurried — one coherent photograph.*

Capture the three creative ids, then **STOP** — the operator approves one, and that approval mints the chain root.

### Step 7-edit: Step 3 — a generic edit over the chain tip (OPTIONAL, REPEATABLE, `compose_ad_visual`)

Reached via **C3** (`edit: <change>`, no pending edit). `compose_ad_visual` is a **generic Kontext reference-edit** — it applies the operator's "what to change" over the **chain tip** (this chain's latest approved `composite`, else its root approved `background`). Product placement is **one kind** of edit; there is no dedicated product step.

Author ONE complete edit `body` that applies the requested change, grounded in the chain tip's own `media.provenance.prompt` (so the edit blends seamlessly and leaves the rest of the scene intact):

- **State the specific change positively and precisely** — what is different, where, and how (position, scale, treatment).
- **Preserve the rest of the scene** — instruct that everything not being changed stays as it is, so the edit reads as a seamless revision of the same photograph.
- **Match any new/moved element** to the existing light direction/softness/colour temperature, lens/perspective, and palette.
- **For a product edit** — the **real** Cambridge packaging at natural scale, grounded by a soft contact shadow, lit to match, its label legible and **true to the real product's proportions** — never a fabricated product. (The real packshot is attached as a reference by the studio / resolved from the brief-level product; you never generate or upload it.)

```
Call: compose_ad_visual
  brief_id:    <brief_id>
  prompt:      <the full edit instruction — the operator's "what to change", authored in full>
  from:        <THIS chain's tip galleryItemId>   # OMIT only when the chain is unambiguous (one chain); pass it always on a multi-chain brief
  model:       <only if the operator supplied one; otherwise OMIT>
```

`from` defaults to the chain tip, but the server **requires it when several of a layer are approved** — on a multi-chain brief you MUST pass **this chain's** tip galleryItemId so the edit lands on the right chain. **NEVER pass another chain's tip.** The result saves as ONE DRAFT `composite` creative with `derived_from:[parent]`, so edits **chain edit-on-edit**. Capture its id, then **STOP**. The step is repeatable: after the operator approves it, re-invoke with another `edit: <change>` (the new tip is this edit) or move to Text.

### Step 7-text: Step 4 — render the approved headline over the chain tip (`generate_text_layer`)

Reached via **C7** (`stage: text`, an approved `image_content` headline exists). Render the **exact** approved headline (the `image_content` body from Step 3) onto the chain tip. The renderer (Ideogram, with a deterministic diacritic-safe overlay fallback) writes the string **verbatim**, so Vietnamese diacritics stay intact.

```
Call: generate_text_layer
  brief_id: <brief_id>
  headline: <the EXACT approved image_content body — sent verbatim>
  prompt:   <OPTIONAL placement instruction — where the headline sits in the frame; positive, no reserved-void language>
  from:     <THIS chain's tip galleryItemId>   # pass it on a multi-chain brief (required when several are approved)
  model:    <only if the operator supplied one; otherwise OMIT>
```

The optional `prompt` is a **placement** direction only (e.g. *"the headline sits in the calmer upper area of the frame"*) — it names no scene copy, invents no reserved plane. The result saves as ONE DRAFT `text` creative with `derived_from:[chain tip]`. Capture its id, then **STOP**. An **approved `text` COMPLETES THIS CHAIN** (the finished ad visual). It does not complete the brief, and it does not make that visual the hero image — `set_cover` is the operator's dashboard choice and you never call it.

### Step 8: The revise path (`revise: <note>`) — CHAIN-SCOPED

A `revise: <note>` (e.g. *"ánh sáng ấm hơn, đặt trong bếp thay vì phòng khách"*) is an operator correction to the **active step OF THE SELECTED CHAIN**, as Step 6b + 6c resolved them. **The note is NEVER ignored and NEVER dropped** — the correction must land in the text that reaches the engine. It never changes which step, and never which chain, is active.

> **The authoritative rewrite base is the SELECTED CHAIN'S pending draft `media.provenance.prompt` (from `list_creatives`) — NOT the brief-level `list_creative_prompts` row.** `list_creative_prompts(brief_id)` returns at most one active prompt row PER LAYER for the WHOLE brief; on a multi-chain brief it may hold **another chain's** prompt, so basing a rewrite on it silently re-bases the revision on the wrong chain's scene. The **creative row** carries lineage, so the creative's `media.provenance.prompt` is the base. `list_creative_prompts` MAY be read as supporting context only.

#### Case A — the active step HAS a pending draft IN THIS CHAIN (rules B2 / C2 / C5, and the subject/pending path)

1. **Resolve the base prompt:** the selected chain's pending draft's **`media.provenance.prompt`** (from `list_creatives`) — authoritative. On the chain-creation `background` pool (B2) or the subject pool, the pending candidates are readings in one brief-level pool — take the one the operator's note plainly reacts to, else the most recent. If no recoverable prompt at all → **STOP with `prompt_not_found`** (case A only), report it in Vietnamese, generate nothing.
2. **REWRITE** the prompt applying the note — still obeying every Step 5 rule.
3. Issue **exactly ONE** generate call for that same step of that same chain with the rewritten prompt (`generate_subject`; or `generate_background` with the same anchors; or `compose_ad_visual` / `generate_text_layer` with **this chain's** tip as `from`). **Never a fresh batch of 3, never a blind re-roll** — the prompt MUST differ from the base by the correction.

#### Case B — the active step has NO pending draft in this chain (rules B3 / A7 / C3 / C7, and after a discard)

The layer is authored **fresh** (Step 7-*), and the note is **folded into every prompt you author for it**. Base, in order: the selected chain's most recent **`discarded`** creative for that step and its `media.provenance.prompt` (ignored for state, but it carries the prompt the operator reacted to); else author from the Step 4 grounding carrying the note as a standing constraint. **Do NOT stop with `prompt_not_found` here.** On the `new-chain` path (A7), author the three readings fresh from the grounding, distinct from every existing root, note folded in.

The step's candidate count is unchanged by a note (subject 3 / Full image 3 / edit 1 / text 1). A note never turns case A into a fresh batch, and never turns case B into a STOP. **Never call `save_creative_prompt`** — the generate tools carry the prompt themselves. A `revise` note supplied on a run that STOPs at chain selection (Step 6b, A1–A5 / A11) is **not applied** — say so.

### Step 9: Model selection

**Omit `model` unless the operator supplied one** — let the server governs. For the **Full image** the role auto-resolves from attached refs: **Kontext image-edit** (`fal-ai/flux-pro/kontext`) when a subject/product is attached, else **FLUX.2 text-to-image** (default `fal-ai/flux-2/klein/9b`, ladder-steppable). `generate_subject` defaults to a text-to-image / identity model; `compose_ad_visual` (Edit) defaults to Kontext Pro; `generate_text_layer` defaults to Ideogram V3. Model policy lives in one place and can change without a plugin release.

An operator-supplied fal model id is **passed through unchanged**. A model id outside the known families is refused by the server as **`invalid_input` BEFORE any provider call**, so **no credits are spent**. On that refusal: **STOP**, report it plainly in Vietnamese (model id không được chấp nhận; **chưa tốn credit nào**), and **never guess a substitute model**.

### Step 10: Errors — every server error STOPs with the next action

Every typed server error **stops the run** and is reported to the operator **in Vietnamese**, naming the unmet condition and the **exact next action**. You **never** retry around an error with different arguments, **never** fall back to a third-party image API, **never** silently skip a step, and **never** retry with another chain's creative.

| Error | Meaning | Behaviour |
|---|---|---|
| `idea_not_approved` | The concept is not an approved ad idea | **STOP** — duyệt concept trước (Ideas → channel = ad) |
| `brief_not_found` / `brief_not_approved` | The anchoring brief is missing / still a draft | **STOP** — chạy `/ssc.ads-brief <idea_id>` và duyệt một angle, rồi chạy lại với đúng `brief_id` |
| `no_approved_parent` | Edit / Text attempted with no approved chain tip (no approved Full image or edit in the chain) | **STOP** — duyệt 1 ảnh Full image (hoặc edit) của **chuỗi này** trước |
| `ambiguous_parent` | Edit / Text with several approved of a layer and no `from` | **STOP** — pick the chain (`chain:`) so the skill passes **this chain's** tip as `from`; never let the server guess |
| `invalid_parent` | The `from` (chain tip) is not a current approved parent | **Re-read `list_creatives(brief_id)` ONCE**, re-resolve **this chain's tip**, retry with that id; a second failure **STOPs**. Never substitute another chain's tip |
| `prompt_not_found` | No recoverable prompt for a step being revised **while its draft is pending** (Step 8 case A) | **STOP** — report; generate nothing. **Not applicable to case B** (author fresh with the note folded in) |
| `stale_version` | Concurrent edit of the same row | **STOP** — tell the operator to re-run (you re-read next invocation). Generate nothing |
| `invalid_input` | Bad params, unknown model id, an invalid `chain` / `subject` / `product` / `stage`, or `chain` + `new-chain` together | **STOP** — report; **no credits spent**. Never substitute a model, chain, subject, or product |
| `not_wired_model` | A registered-but-future model chosen per-call | **STOP** — report the model; **no credits spent**; never substitute |
| `forbidden` (or an `insufficient role` refusal) | The operator's BrandOS account cannot generate | **STOP** — tell them (Vietnamese) an admin must grant the role; **nothing was written**. Never retry or work around it |

### Step 11: Output summary

**If any step STOPPED** (non-ad idea; concept not approved; brief missing / not approved; no approved copy; approved copy with no angle lineage while the idea has >1 brief; an unassignable creative; an invalid / contradictory `chain` / `subject` / `product` / `stage` input; ≥2 chains and no `chain`; a pending draft in the selected chain with no `revise`; `stage: text` with no approved headline; the two-way Edit/Text offer at C9; the selected chain complete; or any server error), emit that stop message plainly — the reason and the exact next action, in Vietnamese. Produce no visual, spend no credits.

**Otherwise, after the active step's DRAFT creative(s) are saved**, output:

```
## Ads Image — <concept title> — <ACTIVE STEP> saved

**Target:** idea <idea_id> · brief <brief_id> (<angle_label>)
**Chain:** <root Full-image creative id — one-line gist | "— (Subject là bước brief-level, chưa thuộc chuỗi nào)" | "— chuỗi MỚI: đang tạo candidate root (duyệt 1 Full image để mint root)">
**Chains on this brief:** <|ROOTS|> (<count with an approved text> đã hoàn tất)
**Step produced:** <subject | full (Full image) | edit | text>
**Built on:** <"— (Subject: người mẫu độc lập, chưa ghép cảnh)" | "anchor: subject <id> + product <id> (Kontext) | không anchor → text-to-image (FLUX.2)" | "chain tip <id> (Full image | edit)" | "chain tip <id> + tiêu đề đã duyệt">
**Copy matched:** <"theo brief (copy đã duyệt mang brief_id — đường chuẩn)" | "theo concept (fallback) — copy đã duyệt KHÔNG mang brief_id; concept chỉ có 1 angle brief nên khớp ở phạm vi idea là không mơ hồ">
**Model:** <the fal model id used, or "server default (<role>)">
**Drafts saved:** <count> (layer='<active layer key>', status='draft', propose-only)

| # | creative id | Scene |
|---|-------------|-------|
| 1 | <id> | <one line: which reading / what the edit changed / where the headline sits> |
| … | … | … |
```

The `**Chain:**` and `**Chains on this brief:**` lines are **mandatory on every summary** — the operator must never have to infer which track advanced.

End with the correct NEXT action (Vietnamese):

- after **subject**: `Next: mở /ad/<month>/<idea_id> → duyệt 1 người mẫu (subject), rồi chạy lại /ssc.image <idea_id> <brief_id> để mình dựng Full image ghép quanh người mẫu đã chọn.`
- after **full** (chain creation): `Next: mở /ad/<month>/<idea_id> → duyệt 1 Full image — việc duyệt chính là mint root cho chuỗi (hoặc chạy lại với revise: <ghi chú> để sửa prompt). Rồi chạy lại /ssc.image <idea_id> <brief_id> chain: <root vừa duyệt> — thêm edit: <mô tả> để chỉnh sửa, hoặc stage: text để render tiêu đề.`
- after **edit**: `Next: trong /ad/<month>/<idea_id> → duyệt bản edit của chuỗi <root id> (hoặc discard / revise: <ghi chú>). Bước Edit lặp lại được: chạy lại với edit: <thay đổi khác>, hoặc stage: text khi đã ưng.`
- after **text**: `Next: duyệt bản text trong /ad/<month>/<idea_id> — đó là bước cuối, hoàn tất CHUỖI <root id>. Brief này hiện có <N> chuỗi. Muốn mở chuỗi khác: /ssc.image <idea_id> <brief_id> new-chain. Chọn ảnh đại diện (cover) là thao tác của bạn trên dashboard.`

## Output

- **Saved, not presented.** DRAFT `creative` rows via the BrandOS tools (`generate_subject` → `layer='subject'`, one per call; `generate_background` → 3 × `layer='background'`, one per call, each a candidate chain root; `compose_ad_visual` → 1 × `layer='composite'` in the selected chain; `generate_text_layer` → 1 × `layer='text'` in the selected chain; `product` is brief-level and upload-only, never produced here; `generate_model` is never called). Saved immediately; **no in-chat candidate presentation and no in-chat revise loop**. Saving persists drafts; it is **NOT** approval — and on `background`, approval also **curates a candidate into a chain root**.
- **One step of ONE chain per invocation.** The operator approves (or discards) in the dashboard and re-invokes for the next step of that chain — or re-invokes with `revise: <note>` to rewrite the active step, `edit: <change>` for another edit, `stage: subject` / `stage: text` for those steps, or `new-chain` to start another parallel chain.
- **The summary names the chain.** Every summary states the chain worked (its root Full-image creative id + gist) and how many chains the brief now has.
- **The prompt is the work product.** Each generate call carries a complete, self-contained prompt (the Text call the exact headline) authored here and sent verbatim; the provenance records it (`media.provenance.prompt`) — the per-chain record.
- **No baked-in text upstream.** Every Subject / Full-image / Edit visual is word-free (achieved through positive description); the words appear only at the Text step.
- **No gate flipped, no cover set, no row approved/discarded, no prompt row written directly.**
- Summary of the saved creative ids + the next-step instruction (Vietnamese).

## Governance

- **Credit-SPENDING generator (identity).** Unlike the propose-only `ssc-image-prompt-*` authors (which only `save_creative_prompt`), this skill **calls the generate tools and spends fal credits**. Because a generate call spends credits, every unmet precondition, ambiguity, or server error is a clean STOP with the exact next action — never a retry-around or a silently-degraded run.
- **Propose-only on APPROVAL (hard rule).** Never call any tool that changes approval or lifecycle state — never `approve` (the ONLY gated promotion; the approval hook denies it to agents), never use `edit` to demote / unapprove / **discard** a creative (discarding is the operator's call), never `save_creative_prompt`, `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. Save DRAFT `creative` rows and STOP. **Saving is not approving** — and approving a Full image also **curates it into a chain root**. None of the forbidden tools appears in this skill's `tools:` list.
- **The NEW 4-step pipeline (hard rule).** `subject` (opt, `generate_subject`) → `background` "Full image" (required, `generate_background`, dual-role) → `composite` "Edit" (opt + repeatable, `compose_ad_visual`, generic prompt-to-edit) → `text` (`generate_text_layer`). The **Scene step (`model`, `generate_model`) is RETIRED** — never a studio step, never called; the `model` key stays dormant (old rows still read). Product placement is one kind of Edit, not a dedicated step.
- **Optional-step transparency (hard rule).** Every step derives its state from what exists, never from a fixed predecessor: skip Subject → the Full image is a text-to-image root; skip Edit → Text hangs off the Full image. `buildLayers`-style derivation, not assumed predecessors.
- **Dual-role Full image (hard rule).** `generate_background` attaches the selected `subject` and/or `product` galleryItemIds; the role auto-resolves server-side (anchor(s) present → Kontext image-edit built around them; neither → FLUX.2 text-to-image from scratch). **No anchorless empty plate, and NO reserved-zone geometry** (neither a text zone nor a subject zone) — author a complete filled scene. The operator's `model` override still wins the model id.
- **Generic repeatable Edit (hard rule).** `compose_ad_visual` applies the operator's `edit: <change>` over the **chain tip** (latest approved `composite` else the root `background`), `derived_from`-chained so edits stack edit-on-edit; it is OPTIONAL (skip it) and REPEATABLE. Product placement, lighting, clutter, composition — all are edits.
- **Chain-scoped state, re-rooted on the Full image (hard rule).** A brief carries **N parallel chains**, each rooted at an **approved `background` (Full image)**. Chain membership is derived by walking `derived_from` back to the root — there is no `background_creative_id` / `scene_creative_id` FK to compute, and no server-side `chain_id`. `approved(L)` / `has_drafts(L)` are computed **only inside the selected chain**. Never advance a chain on another chain's creative; **never pass another chain's tip as `from`**. A non-discarded `composite`/`text` whose lineage does not reach an approved root is **unassignable** → report and STOP. `discarded` is a real third status: ignored for state, its prompt only a chain-scoped revise base.
- **Chain selection is explicit — never silent (hard rule).** No approved Full image → Step 2 is chain CREATION. Exactly one → that chain, resolved **without asking**. **≥2 and no `chain` → STOP and ASK**, listing every chain (root id + one-line gist of `media.provenance.prompt` + progress). An invalid `chain` → **STOP** (`invalid_input`). `chain` + `new-chain` → **STOP** (contradictory). **Never pick a chain by any heuristic.**
- **`new-chain` is the only way to mint an additional root.** Once a brief has an approved Full image, Step 2 is not re-entered by default; `new-chain` generates 3 fresh candidate roots distinct from every existing root and STOPs for approval. Required on every run that mints roots; never implied.
- **Subject + product are BRIEF-LEVEL anchors.** A subject is generated by this skill (Step 1, optional) but shared by every chain; a product is the **real** packaging, uploaded on the dashboard (never generated / uploaded here). Zero of an anchor → not attached; exactly one → used without asking; ≥2 and no selector → STOP and ask which. Never guess.
- **A CHAIN completes; a BRIEF never does.** A chain is COMPLETE when it holds an approved `text`. No "brief complete" state — another chain can always be started. On a complete chain: STOP, name it, report the chain count, offer `new-chain` or the hero-image choice. **`set_cover` is the operator's dashboard choice — NOT in `tools:`.**
- **Three preconditions, checked in order (hard rule).** (1) the idea is `channel='ad'` + `approved`; (2) `brief_id` is an approved angle brief of it; (3) **≥1 approved `copy` for that brief**, matched on `brief_id`. Only when no approved copy carries a `brief_id` does scope widen, and only by the Step 2 brief count (one brief → idea-scope, announce it; more → STOP). **Step 4 Text additionally requires an approved `image_content` headline.** `image_content` is otherwise never read or sized into a scene prompt.
- **Grounding (hard rule).** Before authoring any prompt: the chosen brief (`angle_label` + five narrative fields) → the persona detail doc (`brand/persona-<slug>`, mechanically derived; absent tag → structural tags, never an invented path) → the approved `copy` (**a meaning source — its words are never named**) → the visual + compliance KB → the concept. Approved `headline` / `description` may be read as tone signal only.
- **Verbatim, positive-only prompts (hard rule).** You author the COMPLETE prompt; it reaches the engine unmodified (no `prompt_hints`, no server-side assembly). (1) Never name the ad copy — not quoted, paraphrased, or negated (the Text step is the ONE place the exact headline is named — to render it). (2) Never negate. (3) One image per call. (4) No baked-in text upstream, achieved through (1)–(2). **No reserved-zone geometry** (neither text nor subject zone) — a complete filled scene.
- **The revise path is CHAIN-SCOPED, prompt-level, never a re-roll, note never dropped (hard rule).** `revise: <note>` applies to the **active step of the SELECTED CHAIN**. With a pending draft (case A) → base = **that draft's `media.provenance.prompt`** (from `list_creatives`), rewrite, ONE generate call; no recoverable prompt → STOP `prompt_not_found`. With no pending draft (case B) → the note is folded into every fresh prompt (based on the chain's discarded prompt when one exists); never raise `prompt_not_found`. **`list_creative_prompts` is BRIEF-LEVEL — never the rewrite base on a multi-chain brief.** Never call `save_creative_prompt`.
- **Model selection.** `model` omitted unless supplied (server role defaults govern). A supplied id passes through unchanged; an unknown id is refused as `invalid_input` before any provider call (no credits) — report and STOP, never substitute.
- **Every server error STOPs with the next action.** Never retry around an error, never fall back to a third-party API, never silently skip a step, never retry with another chain's creative. The lone retry is `invalid_parent`: re-read `list_creatives(brief_id)` once, re-resolve this chain's tip, retry; a second failure STOPs.
- **Save-to-server, not present-in-chat (hard rule).** After a step's DRAFT creative(s) are saved, STOP. No in-chat candidate presentation, no in-chat approval or revise loop.
- **Single MCP surface (hard rule).** Only BrandOS MCP tools on the `ssc` surface (`mcp__ssc__…`); **never** a third-party image-provider API — not even when a BrandOS call fails.
- **Phase 1 = ad channel only.** `channel='ad'` concepts only; a non-ad idea STOPS cleanly (post/youtube visual flows are a later phase).
- **One concept + one angle brief + ONE chain (or one brief-level Subject/Full-image batch) per invocation.** Re-invoke per brief, per chain, per step.
- **Operator-facing prose and persisted notes are Vietnamese**; image-model prompts are free-form.
- Requires the `edit` capability — for the generate tools AND for the `list_creatives` / `list_creative_prompts` / `list_gallery_media` reads. Only the concept / brief / copy / knowledge reads (`get_idea` / `list_briefs` / `list_content` / `get_knowledge`) are satisfied by `view`. Approving a saved draft (which also **mints a chain root** on a Full image), discarding one, uploading the real product, and choosing the hero image (`set_cover`) are the operator's dashboard actions. An `edit`-holding operator still refused by a generate tool (`insufficient role`) is a **server-side permission** — report it and STOP; never retry around it or reach for a provider API.
