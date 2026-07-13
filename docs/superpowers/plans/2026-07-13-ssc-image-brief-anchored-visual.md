# `/ssc.image` Brief-Anchored Ad Visual Producer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `/ssc.ads-image` → `/ssc.image` (skill `ssc-ads-image` → `ssc-image`), make it take `idea_id` + `brief_id`, reconcile it to the shipped `image_content_id`-anchored creative contract, and ground the visual in the brief + the variant's approved copy/headline/description/image_content.

**Architecture:** Markdown-only Cowork plugin — no compiled code, no test runner. The "unit" is a command (thin dispatcher) + a skill (the work unit). Verification is grep-based structural assertions + exercising the unchanged governance hook. The whole creative chain (`background → model → product → composite`) is driven through BrandOS MCP tools that anchor on an approved **image_content variant** (`image_content_id`), resolved from the chosen `brief_id`.

**Tech Stack:** Markdown skills/commands; BrandOS MCP tools on the `ssc` surface; `git mv` for renames; Node 20 governance hook (untouched).

## Global Constraints

- **Propose-only (hard rule):** the skill saves only DRAFT `creative` rows and STOPS. NEVER `approve` / `edit`-demote-discard / `set_cover` / `reorder_gallery` / publish / `update_budget`; NEVER bake ad text into a visual. Product is upload-only, operator-owned. None of the forbidden tools may appear in the skill's `tools:` list.
- **Every MCP tool a skill references MUST exist on the BrandOS `ssc` surface** (shipped-bug class, commit `8d4ded8`). The tools used here are confirmed on-surface: `get_idea`, `list_briefs`, `list_post_content`, `list_creatives`, `generate_background`, `generate_model`, `compose_ad_visual`.
- **Shipped tool signatures (use verbatim):**
  - `generate_background(image_content_id, n∈[1,4] default 3, prompt_hints?, model?)` — server prompt = variant text + negative-space + the idea's brief; `prompt_hints` merged last.
  - `generate_model(image_content_id, background_creative_id, prompt_hints?, model?)` **or** `generate_model(image_content_id, background_creative_id, uploaded_media_id, uploaded_media_ref)` (real-model path — both `uploaded_*` required). n=1.
  - `compose_ad_visual(image_content_id, n∈[2,3] default 3, layout_hint?, hard_paste?, prompt_hints?, model?)` — **no** `scene_media_id`/`product_media_id`; server resolves the approved scene + product.
  - `list_creatives(image_content_id | idea_id)` — one variant chain, or all variants; each creative has `id`, `layer`, `status`, media ref.
  - `list_briefs(idea=<idea_id>)` — **param is `idea`**; returns briefs with `id`, `status`, the five narrative fields, `angle_label`.
  - `list_post_content(idea_id)` — content rows with `id`, `section`, `status`, `body` (newest first).
  - `get_idea(id)` — `{ idea }` with lifecycle core, channel detail, `tags[]` grouped by kind; `{ idea: null }` when absent.
- **Persisted / operator-facing prose is Vietnamese.** Image-model prompts are exempt (free-form). Chat reasoning may be English.
- **No `plugin.json` / `.mcp.json` change** — all tools are on the existing `ssc` surface.
- **Git:** work on `main`, stage specific files (never `git add -A`), commit per task. No worktrees.
- **Do NOT touch** historical records: dated files under `docs/superpowers/specs/*` and `docs/superpowers/plans/*` (except this plan + the 2026-07-13 design), and anything under `openspec/changes/archive/*`.

**Spec:** `docs/superpowers/specs/2026-07-13-ssc-image-brief-anchored-visual-design.md`

---

### Task 1: Rename + rewrite the skill (`ssc-ads-image` → `ssc-image`)

**Files:**
- Rename (git mv): `plugins/ssc-content/skills/ssc-ads-image/` → `plugins/ssc-content/skills/ssc-image/`
- Modify: `plugins/ssc-content/skills/ssc-image/SKILL.md` (full rewrite)

**Interfaces:**
- Produces: a skill named `ssc-image` (frontmatter `name` matches dir), dispatched by `/ssc.image` (Task 2). Anchors the creative chain on `image_content_id` resolved from `brief_id`. Referenced tools: `get_idea`, `list_briefs`, `list_post_content`, `list_creatives`, `generate_background`, `generate_model`, `compose_ad_visual`.

- [ ] **Step 1: Rename the skill directory (preserves git history)**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git mv plugins/ssc-content/skills/ssc-ads-image plugins/ssc-content/skills/ssc-image
ls plugins/ssc-content/skills/ssc-image/SKILL.md
```
Expected: the path lists (file exists at the new location).

- [ ] **Step 2: Overwrite `SKILL.md` with the rewritten skill**

Write `plugins/ssc-content/skills/ssc-image/SKILL.md` with exactly this content:

````markdown
---
name: ssc-image
description: The VISUAL producer of the Cambridge Diet Vietnam ad-production workflow — a STATE-DRIVEN, per-layer stepper anchored to ONE chosen angle brief (the visual sibling of ssc-ads-writer, and the still-image sibling of the /ssc.video pipeline). Takes idea_id + brief_id, resolves the approved image_content VARIANT for that brief (its image_content_id), and on each invocation produces the single NEXT open layer of that variant's creative chain background → model → product → composite (the first not yet approved). Grounds the visual in the brief + the variant's approved copy/headline/description/image_content: the server folds the variant text + the idea's creative brief into the background prompt, and the skill enriches prompt_hints with the approved copy/headline/description so the visual expresses the full angle. Engines via the BrandOS single MCP surface only: background = up to 4 (default 3) negative-space-aware versions (generate_background, keyed on image_content_id); model = exactly ONE background-conditioned candidate (generate_model, keyed on image_content_id + the approved background_creative_id), or an operator-uploaded real model (uploaded_media_id + uploaded_media_ref); product = upload-only (never generated) — STOP and ask the operator to upload+approve the real product; composite = 2–3 variants (compose_ad_visual, keyed on image_content_id — the server resolves the approved scene + product), optional layout_hint + masked hard_paste, always leaving negative space for the separately-overlaid image_content text. Saves DRAFT creatives straight to the server and STOPS — no in-chat presentation; the operator reviews/approves (or, for the model layer, discards) the active layer in the /ad/[month]/[id] dashboard, then re-invokes for the next layer. PHASE 1 wires only the ad channel; a non-ad idea STOPS cleanly (post/youtube image flows are a later phase). Propose-only: never approves, unapproves, sets a cover, reorders a gallery, publishes, updates a budget, or flips any gate; NEVER bakes ad text into a visual. Operator-facing prompts + any persisted notes are Vietnamese; image-model prompts are free-form. Single MCP surface — only mcp__ssc__… BrandOS tools, never a third-party image provider API.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, list_briefs, list_post_content, list_creatives, generate_background, generate_model, compose_ad_visual]
---

# Ads Image (`ssc-image`)

You are the **visual producer** of the Cambridge Diet Vietnam ad-production workflow — a **state-driven, per-layer stepper**, the **visual sibling of `ssc-ads-writer`** (which produces the ad TEXT), and the still-image sibling of the `/ssc.video` pipeline. You take **`idea_id` + `brief_id`** — ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`) and the operator's **chosen approved angle brief** — resolve the **approved `image_content` variant for that brief** (its `image_content_id`), and on each invocation produce the **single next open layer** of that variant's creative chain **`background` → `model` → `product` → `composite`** (the first layer without an approved creative): you request the layer's DRAFT creative(s) through the BrandOS server, **save** them, and **STOP**.

**Anchor on the variant (`image_content_id`), not the idea.** The whole creative chain hangs off ONE approved `image_content` content row — the *variant*. You resolve that row from the chosen `brief_id`, and every generate/compose/read call keys on its `image_content_id`. An idea can carry several variants (one per chosen angle once the server ships N-briefs-per-idea); today it has one.

**Component composition, not whole-scene draft→refine.** The visual is built from separate, reusable assets — a **background**, a **model** placed into that background, the real **product**, and a final **composite** — composited at the end. This gives layer-level control (retry one layer without disturbing an approved one) and asset reuse, and maps onto the per-section stepper operators already know from `ssc-ads-writer`.

**Save-to-server, not present-in-chat (the core of this flow):** once the active layer's DRAFT creative(s) are saved via the BrandOS tool, you **STOP**. You do **NOT** present candidate images in chat, pause, or run an in-chat revise loop. The operator **reviews / approves** (or, for the `model` layer, **discards**) the saved DRAFT in the `/ad/[month]/[id]` dashboard, then **re-invokes** you for the next layer.

**State-driven per-layer stepping.** Each invocation runs the **next open step**: you read the variant's creatives grouped by `layer` + `status` (via `list_creatives(image_content_id)`) to see which layer already has an **approved** creative, and work only the first layer in the chain that is not yet approved. A layer runs only when **every earlier layer has ≥1 approved creative** — the model is generated INTO an approved background; the composite places the approved product into the approved background+model scene.

**Grounding — the brief + the variant's approved text.** The visual expresses the chosen angle and the approved on-image message. The **server** already folds the variant's `image_content` text + the idea's **creative brief** into the `generate_background` prompt; **you enrich `prompt_hints`** with the variant's **approved `copy` + `headline` + `description`** (whichever are approved — best-effort) so the scene, model, and composite reflect the full angle, not just the on-image text. You **read** the approved `image_content` body as a layout constraint (it tells you how much negative space to reserve); you never render it into a visual.

You are propose-only: every saved creative is a DRAFT for a human to review / approve / discard in the dashboard. **Saving is not approving.** You **NEVER** call `approve` (the ONLY gated promotion — any entity, incl. `creative`; the approval hook denies it to agents), `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`; you **never** use `edit` to demote, unapprove, or **discard** a creative (discarding is an `edit`, the operator's call, not yours); and you **NEVER** flip a gate. Approval, cover-setting, and discarding are operator dashboard actions.

**This flow bakes NO text into any visual.** Every layer leaves **negative space** for the separately-overlaid `image_content` text — the dashboard renders/overlays that text downstream; you never do, and no image model may bake ad text in.

**Engine mapping (state it, honour it):**

- **`background`** — **text→image**, keyed on `image_content_id`. Cheap, throwaway-count exploration; up to 4 (default 3) versions.
- **`model`** — **image→image**, keyed on `image_content_id` + the variant's **approved `background` creative id**. **One** candidate per invocation.
- **`product`** — **no generation.** Upload-only (the real product PNG the operator uploaded + approved).
- **`composite`** — **image→image**, keyed on `image_content_id`; the server resolves the approved scene (the `model`-layer creative) + the approved product. 2–3 variants; optional masked `hard_paste` for pixel-exact packaging.

> **Single MCP surface (hard rule).** `generate_background`, `generate_model`, `compose_ad_visual`, and `list_creatives` are BrandOS server-side tools on the `ssc` surface. You call the image engines **only** through them (provider keys stay server-side); you **never** curl a provider API directly. Runtime generation behaviour (which fal model, exact prompt assembly) is the server's; you pass the anchor + hints.

## Inputs

Required:

- `idea_id` — the approved ad concept's idea id (an `ideas` row, `channel='ad'`, `status='approved'`). The concept whose variant you produce visuals for.
- `brief_id` — the operator's **chosen approved angle brief** for this concept (produced first by `/ssc.ads-brief`, approved in the dashboard). It selects the variant and anchors the angle. The dispatching command requires both; if either is missing it asks the operator — do not invent one.

Optional:

- `period` — the plan month (`YYYY-MM`), informational only — used when pointing the operator at `/ad/[month]/[id]`.
- `layout_hint` — an operator arrangement hint for the **composite** layer (e.g. product bottom-right, subject left) — passed to `compose_ad_visual`.
- `hard_paste` — a per-concept flag for the **composite** layer: when the operator wants **pixel-exact packaging**, request the composite with the masked hard-paste of the real product PNG enabled.
- `model_hint` — an operator steering hint for the **model** layer (age / styling / pose / setting) — free-form, folded into the model candidate's `prompt_hints`.
- `uploaded_media_id` + `uploaded_media_ref` — an operator-uploaded **real model** image (both required together) for the **model** layer; when present, place that real model into the approved background instead of generating a synthetic one.

## Procedure

### Step 1: Resolve the approved concept (work ONE concept at a time)

Call `get_idea`:

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the idea's lifecycle core (incl. `id`, `status`, `channel`), its ad detail as top-level fields (`ad_notes`), and its `tags[]` (each `{ term_id, kind, code, label }`). If it does not resolve (`{ idea: null }`), STOP and tell the operator (Vietnamese) the idea id was not found.

**Gate-check.**

- If `channel !== 'ad'`, STOP and tell the operator (Vietnamese): luồng dựng hình cho post/youtube chưa được nối (giai đoạn sau) — hiện `/ssc.image` chỉ chạy cho concept quảng cáo (`channel = ad`).
- If `status !== 'approved'`, STOP and tell the operator (Vietnamese):

  > Concept quảng cáo này vẫn là bản nháp — hãy tuyển chọn và duyệt concept trước (Ideas → lọc channel = ad), rồi chạy lại lệnh dựng hình.

Hold `idea.id`, `idea.title` (the concept spine), `idea.ad_notes`, and `idea.tags[]` (the structural dimensions — layer / value / frame / persona) that the visual must honour.

### Step 1b: Resolve + gate the chosen angle brief

Read the concept's briefs and hold the ONE the operator chose:

```
Call: list_briefs
  idea: <idea.id>
```

It returns `briefs[]`, each with `id`, `status`, the five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`), and `angle_label`. Select the row where `id == brief_id`.

- If no such row, STOP (Vietnamese): không tìm thấy brief này cho concept — hãy chọn đúng brief_id.
- If it exists but `status !== 'approved'`, STOP (Vietnamese): hãy duyệt một brief angle trong `/ad/[month]/[id]` trước, rồi chạy lại lệnh.

Hold the approved brief's five narrative fields + `angle_label` — the angle anchor. (The server also feeds the brief into `generate_background`; you hold it for `prompt_hints` composition and messaging.)

### Step 2: Resolve the variant (`image_content_id`) + hold the grounding text

The creative chain anchors on an approved `image_content` **variant**. Read the concept's text sections:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `id`, `section` (`headline`|`copy`|`description`|`image_content`), `status` (`draft`|`approved`), `score`, `comment`, `body`.

- Find the **approved `image_content`** row for this brief (`section='image_content'` AND `status='approved'`). Its `id` is the **`image_content_id`** you anchor every creative call on. Today (one brief per idea) the single approved `image_content` row is the variant; once the server ships N-briefs-per-idea, match the row to `brief_id`.
- If there is no approved `image_content` row, STOP (Vietnamese):

  > Chưa có phần chữ trên hình (`image_content`) được duyệt cho angle này. Hãy chạy `/ssc.ads-produce <idea_id> <brief_id> image_content`, duyệt ≥1 bản trong `/ad/[month]/[id]`, rồi chạy lại lệnh dựng hình.

- Hold the approved `image_content` `body` (the reserved-space constraint), and hold the variant's **approved** `copy`, `headline`, `description` bodies **when present** — these are the best-effort grounding you fold into `prompt_hints`. Absent (still-draft) sections are simply omitted; they never gate.

### Step 3: Determine the single next open layer

Read the variant's creatives grouped by `layer` + `status`:

```
Call: list_creatives
  image_content_id: <image_content_id>
```

It returns `creatives[]`, each with `id`, `layer` (`background`|`model`|`product`|`composite`), `status` (`draft`|`approved`), and its media reference. For each layer L compute `approved(L)` (≥1 creative with `layer=L`, `status='approved'`) and `has_drafts(L)`. Apply the **FIRST** matching rule:

| # | Condition | Action |
|---|---|---|
| 1 | not `approved(background)` AND `has_drafts(background)` | **STOP** — background versions await review; approve 1 in `/ad/[month]/[id]`, then re-invoke. (No second batch.) |
| 2 | not `approved(background)` | active layer = **`background`** → Step 4a |
| 3 | `approved(background)`, not `approved(model)`, `has_drafts(model)` | **STOP** — a model candidate is pending; **approve OR discard** it, then re-invoke. (One in flight.) |
| 4 | `approved(background)`, not `approved(model)` | active layer = **`model`** → Step 4b |
| 5 | `approved(background)` & `approved(model)`, not `approved(product)` | active layer = **`product`** → Step 4c (upload-only STOP-and-ask) |
| 6 | `approved(background)` & `approved(model)` & `approved(product)`, not `approved(composite)`, `has_drafts(composite)` | **STOP** — composite variants await review; approve 1, then re-invoke. (No second batch.) |
| 7 | `approved(background)` & `approved(model)` & `approved(product)`, not `approved(composite)` | active layer = **`composite`** → Step 4d |
| 8 | all four `approved` | **STOP** — visual production **complete** for this variant. |

Hold the approved **`background`** creative `id` (→ conditions the model) and note that the approved **`model`** creative IS the background+model scene (the server uses it as the composite's scene).

### Step 4a: Layer `background` — up to 4 (default 3) negative-space-aware versions

Request 3 background versions. Compose a **free-form image `prompt_hints`** (English/Vietnamese/mixed — image prompts are exempt from the Vietnamese rule) that:

- expresses the concept's scene from `idea.title` + `value`/`frame`/`persona`/layer and the **approved `copy`/`headline`/`description`** you held in Step 2 (the mood, message, and register of the chosen angle);
- **reserves off-center subject negative space** for the model to be placed into later;
- **reserves negative space for the separately-overlaid `image_content` text** — sized to the approved `image_content` body (short headline + subheadline + 3 bullets);
- **bakes in NO text.**

```
Call: generate_background
  image_content_id: <image_content_id>
  n: 3
  prompt_hints: <free-form; copy/headline/description grounding; reserve subject + text negative space; no baked text>
```

(The server adds the variant text + the idea's brief; your `prompt_hints` merge last.) Results save as DRAFT creatives `layer='background'`. Capture ids for Step 5, then STOP.

### Step 4b: Layer `model` — exactly ONE candidate, into the approved background

Generate **exactly ONE** candidate (rule 4 only fires with no pending model draft). Two paths:

- **Synthetic model INTO the background** (default):

  ```
  Call: generate_model
    image_content_id: <image_content_id>
    background_creative_id: <approved background creative id from Step 3>
    prompt_hints: <place the concept's persona woman into the reserved subject zone, matching scene light/perspective; + model_hint if given; no baked text>
  ```

- **Operator-uploaded REAL model** (when the operator supplied both `uploaded_media_id` and `uploaded_media_ref`):

  ```
  Call: generate_model
    image_content_id: <image_content_id>
    background_creative_id: <approved background creative id from Step 3>
    uploaded_media_id: <the operator's real-model media id>
    uploaded_media_ref: <the operator's real-model media ref (orig:...)>
  ```

The candidate saves as a single DRAFT creative `layer='model'`. Capture its id, then STOP. The operator approves or discards; rule 3 blocks a second candidate while one is pending — one in flight.

### Step 4c: Layer `product` — upload-only (never generated) STOP-and-ask

You do **NOT** generate the product. Rule 5 makes `product` active only when there is no approved product creative, so there is nothing to feed forward: STOP and ask the operator (Vietnamese):

  > Chưa có ảnh sản phẩm thật được duyệt cho concept này. Hãy tải lên ảnh bao bì sản phẩm thật và duyệt nó trong `/ad/[month]/[id]`, rồi chạy lại lệnh — mình sẽ ghép sản phẩm đã duyệt vào cảnh. (Mình không tạo ảnh sản phẩm — sản phẩm phải là ảnh thật.)

Never call a `generate_*`/upload tool for the product layer — uploading + approving the real product is an operator dashboard action.

### Step 4d: Layer `composite` — 2–3 variants placing the approved product into the scene

Request 2–3 composite variants. The server resolves the approved scene (the `model`-layer creative) + the approved product from the variant — you pass only the anchor + hints:

```
Call: compose_ad_visual
  image_content_id: <image_content_id>
  n: <2 or 3>
  layout_hint: <optional operator arrangement hint, if supplied>
  hard_paste: <true only when the operator requested pixel-exact packaging; else omit>
  prompt_hints: <optional angle grounding from copy/headline/description; reserve text negative space; no baked text>
```

Every variant must **leave negative space for the separately-overlaid `image_content` text** and **bake in NO text**. Results save as DRAFT creatives `layer='composite'`. Capture ids, then STOP. Approving one composite completes the fourth and final layer.

### Step 5: Output summary

**If Step 1/1b/2/3 stopped** (non-ad idea; brief missing/unapproved; no approved `image_content`; a pending draft/candidate; missing product; or all four layers approved), emit that stop message plainly — name the reason and the exact next action. Operator-facing text in Vietnamese.

**Otherwise, after saving the active layer's DRAFT creative(s)**, output:

```
## Ads Image — <concept title> — <ACTIVE LAYER> saved

**Target variant:** idea <idea_id> · brief <brief_id> (<angle_label>) · image_content <image_content_id>
**Layer produced:** <background | model | product | composite>
**Built on approved input:** <"— (background is the first layer)" | "approved background" | "approved background + model" | "approved background + model + product">
**Drafts saved:** <count> (layer='<active>', status='draft', propose-only)

| # | creative id | Notes |
|---|-------------|-------|
| 1 | <id> | <one-line: what this version is / arrangement> |
```

End with the correct NEXT action (Vietnamese):
- after **background**: `Next: mở /ad/<month>/<idea_id> → duyệt 1 background, rồi chạy lại /ssc.image <idea_id> <brief_id> để dựng model.`
- after **model**: `Next: trong /ad/<month>/<idea_id> → duyệt candidate model (hoặc discard để lặp lại), rồi chạy lại /ssc.image <idea_id> <brief_id>.`
- after **composite**: `Next: duyệt 1 composite trong /ad/<month>/<idea_id>. Đó là layer thứ tư — dựng hình hoàn tất cho angle này.`

## Output

- **Saved, not presented.** DRAFT `creative` rows via the BrandOS tool (`generate_background` → up to 4 `layer='background'`; `generate_model` → 1 `layer='model'`; `compose_ad_visual` → 2–3 `layer='composite'`; `product` is upload-only). Saved immediately; no in-chat presentation or revise loop. Saving persists drafts; it is NOT approval/selection.
- **One layer per invocation.** The operator approves (or, for the model, discards) in the dashboard and re-invokes for the next layer.
- **No baked-in text.** Every saved visual leaves negative space for the separately-overlaid `image_content` text.
- **No gate flipped, no cover set, no row approved/discarded.**
- Summary of saved creative ids + the next-layer instruction (Vietnamese).

## Governance

- **Propose-only (hard rule):** never call any tool that changes approval or lifecycle state — never `approve` (the ONLY gated promotion; the hook denies it to agents), never use `edit` to demote/unapprove/discard a creative, no `set_cover`, no `reorder_gallery`, no publish, no `update_budget`. Save DRAFT `creative` rows and STOP. None of the forbidden tools appears in this skill's `tools:` list.
- **Never bake text into a visual (hard rule).** Every background and composite leaves negative space for the separately-overlaid `image_content` text; the dashboard overlays it downstream.
- **Save-to-server, not present-in-chat (hard rule).** After a layer's DRAFT creative(s) are saved, STOP. No in-chat candidate presentation or revise loop.
- **Variant-anchored, state-driven stepping (hard rule).** Each invocation resolves the `image_content_id` from `brief_id`, reads `list_creatives(image_content_id)`, and works the single next unapproved layer in `background → model → product → composite`. A layer runs only when every earlier layer has ≥1 approved creative. Pending drafts (background/composite) or a pending model candidate → STOP; no second batch/candidate.
- **Grounding.** The server grounds the background in the variant text + the idea's brief; you enrich `prompt_hints` with the variant's approved `copy`/`headline`/`description` (best-effort). Never gate on copy/headline/description — only the approved `image_content` variant gates.
- **Product is upload-only.** Never generate the product; no approved product asset → STOP and ask.
- **Phase 1 = ad channel only.** `channel='ad'` concepts only; a non-ad idea STOPS cleanly (post/youtube visual flows are a later phase).
- **Concept + brief + variant gate.** An approved ad concept AND an approved `brief_id` for it AND an approved `image_content` variant — else STOP and name the exact unmet precondition.
- **Single MCP surface (hard rule).** Only BrandOS MCP tools on the `ssc` surface (`mcp__ssc__…`); never a third-party image-provider API.
- **Operator-facing prose Vietnamese; image-model prompts free-form.**
- **One concept/variant at a time.** Re-invoke per variant.
- Requires the `edit` capability (plus `view` for the resolve reads); approving a saved draft later requires `approve` on the dashboard page.
````

- [ ] **Step 3: Verify the skill name matches its directory and references only on-surface tools**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -m1 '^name:' plugins/ssc-content/skills/ssc-image/SKILL.md
grep -n 'idea_id=' plugins/ssc-content/skills/ssc-image/SKILL.md   # must be EMPTY (no idea_id-keyed generate calls)
grep -n 'scene_media_id\|product_media_id' plugins/ssc-content/skills/ssc-image/SKILL.md  # must be EMPTY (compose has no such args)
```
Expected: first line prints `name: ssc-image`; the two greps print nothing (exit 1).

- [ ] **Step 4: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/skills/ssc-image/SKILL.md
git commit -m "feat(ssc-image): rename ssc-ads-image → ssc-image; brief_id input, image_content_id-anchored chain, brief+copy grounding

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Rename + rewrite the command (`/ssc.ads-image` → `/ssc.image`)

**Files:**
- Rename (git mv): `plugins/ssc-content/commands/ssc.ads-image.md` → `plugins/ssc-content/commands/ssc.image.md`
- Modify: `plugins/ssc-content/commands/ssc.image.md` (full rewrite)

**Interfaces:**
- Consumes: the `ssc-image` skill (Task 1).
- Produces: the `/ssc.image` command taking `<idea_id> <brief_id>`.

- [ ] **Step 1: Rename the command file**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git mv plugins/ssc-content/commands/ssc.ads-image.md plugins/ssc-content/commands/ssc.image.md
```
Expected: no output (success).

- [ ] **Step 2: Overwrite `ssc.image.md` with the rewritten command**

Write `plugins/ssc-content/commands/ssc.image.md` with exactly this content:

````markdown
---
description: Produce the ad VISUAL for ONE approved ad concept's chosen angle — a state-driven, per-layer stepper anchored to a brief. Dispatches ssc-image, which resolves the approved image_content VARIANT for the given brief_id (its image_content_id) and works the single next open layer in the chain background → model → product → composite (whichever is not yet approved), saving DRAFT creatives straight to the server, then stops. Grounds the visual in the brief + the variant's approved copy/headline/description/image_content. Runs AFTER the angle's image_content text section is approved. The operator reviews/approves the active layer in the dashboard, then re-runs this command for the next layer; the model is generated INTO the approved background, the product is upload-only, and the composite places the approved product into the approved scene. PHASE 1 wires only the ad channel (a non-ad idea stops cleanly). Propose-only; saves DRAFT creatives, never approves, sets a cover, or publishes.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **both required**:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`).
- **Angle brief ID** (`brief_id`) — the id of the operator's **chosen approved angle brief** for this concept (produced first by `/ssc.ads-brief`, approved in the dashboard). It selects the image_content variant and anchors the angle.

If `idea_id` or `brief_id` is missing, ask the operator for it (one question) before dispatching — do not invent one. There is **no `date` selector**: a `brief_id` is idea-scoped, so the producer always takes an explicit `idea_id`.

Optional:

- **Period** (`period`, `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`.
- **Layer hints** — `layout_hint` / `hard_paste` (composite), `model_hint` (model), `uploaded_media_id` + `uploaded_media_ref` (a real model, both together). Passed through to the matching layer.

This command is the **visual-production half** of the Ads pipeline. It runs once the angle's **`image_content` text section is approved** (`/ssc.ads-produce <idea_id> <brief_id> image_content` produces that text; the operator approves it). It operates **per concept**, **per angle (brief)**, and **per layer**, never on a whole plan: it reads **no** `channel_plan` gate flags. There is no `/ssc.ads-plan` precondition beyond an approved concept, an approved angle brief, and an approved `image_content` for that angle. **Phase 1 wires only the ad channel** — a non-ad idea stops cleanly (post/youtube image flows are a later phase).

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single visual producer **`ssc-image`** (`idea_id`, `brief_id`, optional hints passthrough) for the resolved concept, then stops. `ssc-image` is a **state-driven, per-layer stepper anchored to the chosen angle brief**: on each invocation it resolves the approved `image_content` variant for `brief_id` (its `image_content_id`), reads the variant's creatives grouped by `layer` + `status`, works the **single next open layer** in the chain **`background` → `model` → `product` → `composite`** (the first not yet approved), saves DRAFT creative(s) tagged with that layer, and **stops**.

| The skill does | Then the operator… |
|---|---|
| Confirms the concept is an approved ad idea, `brief_id` is an approved brief for it, AND that angle's `image_content` text is approved (stops with the exact unmet precondition otherwise). Resolves the `image_content_id`, reads the variant's creatives by `layer` + `status`, finds the first layer without an approved creative, and works only that one — grounding prompts in the brief + the variant's approved copy/headline/description/image_content: **background** (up to 4, default 3 negative-space-aware versions), **model** (exactly ONE candidate generated INTO the approved background, or a placed real model), **product** (upload-only — stops and asks the operator to upload + approve the real product), **composite** (2–3 variants placing the approved product into the approved background+model scene, optional `layout_hint`/`hard_paste`). Saves DRAFT creatives and **stops**. Each layer runs only when every earlier layer has an approved creative. | Opens `/ad/[month]/[id]`, **reviews / approves** (or, for the model layer, **discards**) the saved DRAFT creative for that layer, then **re-runs `/ssc.image <idea_id> <brief_id>`** — the skill detects the newly-approved layer and works the next one. |

**This flow bakes no text into any visual** — every layer leaves negative space for the separately-overlaid `image_content` text (the dashboard renders it; this command does not). The producer works **one layer per run**, reads **no** channel_plan gates, and **saves DRAFT creatives immediately** (no in-chat presentation). If the active layer already has an unapproved DRAFT (background/composite batch, or a pending model candidate), the skill stops and asks the operator to approve/discard it first — it does not pile up a second batch. When all four layers have an approved creative, visual production is complete for that angle.

## Governance

Nothing auto-approves, auto-applies, sets a cover, or auto-publishes. `ssc-image` **saves DRAFT `creative` rows** and stops; the operator reviews / approves / discards each layer on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls `approve` (the ONLY gated promotion, denied to agents by the approval hook), never `edit` used to demote/unapprove/**discard** a creative, no `set_cover`, no `reorder_gallery`, no publish, no `update_budget` — and never bakes ad text into a visual. The skill talks **only** to BrandOS MCP tools on the `ssc` surface — never a third-party image API. All operator-facing prompts and persisted notes are **Vietnamese** (image-model prompts may be whatever renders best). Producing requires `edit` (plus `view` for the resolve/precondition reads); approving a draft later requires `approve` on the page.

## After it runs

After the skill saves a layer's DRAFT creatives, point the operator to `/ad/[month]/[id]` for the concept to **review / approve** the active layer (background → model → product → composite) — for the model layer they either approve the single candidate or **discard** it to iterate — then **re-run this command** for the same `idea_id` + `brief_id` to work the next layer. When all four layers have an approved creative, visual production is complete for that angle. Re-invoke per angle/variant.
````

- [ ] **Step 3: Verify the command dispatches `ssc-image` and requires both ids**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
test -f plugins/ssc-content/commands/ssc.image.md && echo "FILE_OK"
test ! -f plugins/ssc-content/commands/ssc.ads-image.md && echo "OLD_GONE"
grep -c 'ssc-image' plugins/ssc-content/commands/ssc.image.md   # ≥1
grep -c 'brief_id' plugins/ssc-content/commands/ssc.image.md    # ≥1
```
Expected: prints `FILE_OK`, `OLD_GONE`, then two counts ≥ 1.

- [ ] **Step 4: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/commands/ssc.image.md
git commit -m "feat(commands): rename /ssc.ads-image → /ssc.image; take <idea_id> <brief_id>, dispatch ssc-image

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Update the plugin `CLAUDE.md` (dispatch exception + pipelines row)

**Files:**
- Modify: `plugins/../CLAUDE.md` (repo-root plugin doc) — the three-layer dispatch exception sentence + the Pipelines table.

Exact path: `/Users/thang/dev/ssc/ssc-content-plugin/CLAUDE.md`.

**Interfaces:**
- Consumes: the `/ssc.image` command name (Task 2), the `ssc-image` skill name (Task 1).

- [ ] **Step 1: Add `/ssc.image` to the direct-dispatch exception**

In `CLAUDE.md`, replace this sentence (currently ~lines 44-46):

```
   logic.** They parse operator input and dispatch a single agent. Exception:
   `/ssc.ads-produce` and `/ssc.ads-brief` dispatch their production skills
   (`ssc-ads-writer` and `ssc-ads-brief`) directly rather than through an agent.
```

with:

```
   logic.** They parse operator input and dispatch a single agent. Exception:
   `/ssc.ads-produce`, `/ssc.ads-brief`, and `/ssc.image` dispatch their production
   skills (`ssc-ads-writer`, `ssc-ads-brief`, and `ssc-image`) directly rather than
   through an agent.
```

- [ ] **Step 2: Add an "Ads (image)" row to the Pipelines table**

In the Pipelines table, insert a new row immediately **after** the `Ads (produce)` row (currently ~line 64):

```
| Ads (image) | `/ssc.image <ideaId> <briefId>` | *(direct → ssc-image)* | Visual half — resolves the approved image_content variant for the chosen brief and steps the creative chain background → model → product → composite (one layer per run), grounded in the brief + approved copy/headline/description/image_content. Ad channel only (phase 1). |
```

- [ ] **Step 3: Verify**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -c '/ssc.image' CLAUDE.md          # ≥2 (exception sentence + pipelines row)
grep -c 'ssc-ads-image' CLAUDE.md       # 0
```
Expected: first count ≥ 2; second count `0`.

- [ ] **Step 4: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add CLAUDE.md
git commit -m "docs(CLAUDE): /ssc.image direct-dispatch exception + Ads (image) pipeline row

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Retarget live cross-references (`ssc-video-agent`, `ssc-ads-brief`)

**Files:**
- Modify: `plugins/ssc-content/agents/ssc-video-agent.md` (2 mentions)
- Modify: `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` (3 mentions)

**Interfaces:**
- Consumes: the `ssc-image` skill name (Task 1). These are the only *live* (installed-surface) files besides the openspec spec that name the old skill.

- [ ] **Step 1: `ssc-video-agent.md` — line ~21 mention**

Locate it:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n 'ssc-ads-image' plugins/ssc-content/agents/ssc-video-agent.md
```
On line ~21 the text reads *"…same situation as the sibling `ssc-ads-image` skill, which documents itself as 'gated on server work… inert until those tools exist.'"* Replace the phrase so it (a) retargets the name and (b) drops the now-false "inert" claim for the ads image tools. Change `the sibling ssc-ads-image skill, which documents itself as "gated on server work... inert until those tools exist."` → `the sibling ssc-image skill (whose ad image tools have since shipped; the video AI tools below have not).`

- [ ] **Step 2: `ssc-video-agent.md` — lines ~128-130 mention**

The block reads:
```
situation as the sibling ssc-ads-image skill, which is documented as inert
until its server-side tools ship.
```
Replace with:
```
situation the sibling ssc-image skill was in before its ad image tools shipped —
the video AI-generation tools here have not shipped yet.
```

- [ ] **Step 3: `ssc-ads-brief/SKILL.md` — the 3 mentions**

Locate them:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n 'ssc-ads-image' plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
```
- Line ~25: `the same pattern the video / `ssc-ads-image` skills use for not-yet-shipped server capabilities.` → `the same pattern the video skills use for not-yet-shipped server capabilities.` (drop `ssc-ads-image` — its tools shipped; the analogy no longer holds for it).
- Line ~27: `It does **not** gate `ssc-ads-image` — that skill's precondition remains `approved(image_content)` only.` → `It does **not** gate `ssc-image` — that skill's precondition remains an approved `image_content` variant only.`
- Lines ~229-230 (Governance): the two mentions `the same pattern the video / `ssc-ads-image` skills use…` and `Does not gate `ssc-ads-image`.` → drop `ssc-ads-image` from the first (leave `the video skills`) and retarget the second to ``ssc-image``.

- [ ] **Step 4: Verify no live `ssc-ads-image` reference remains in `plugins/`**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rn 'ssc-ads-image\|ssc.ads-image' plugins/
```
Expected: no output (exit 1) — every installed-surface reference now says `ssc-image` / `/ssc.image`.

- [ ] **Step 5: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/agents/ssc-video-agent.md plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
git commit -m "docs(skills): retarget ssc-ads-image → ssc-image refs; drop stale 'inert' analogy

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Update the live openspec spec (`ads-image-visual`)

**Files:**
- Modify: `openspec/specs/ads-image-visual/spec.md` — command/skill names, the `idea_id`→`image_content_id` anchor + `brief_id` input, and the "tools must exist before use" future-tense.

**Interfaces:**
- Consumes: the `/ssc.image` + `ssc-image` names and the `image_content_id`/`brief_id` model.

- [ ] **Step 1: Purpose + command-entry requirement**

Replace the `## Purpose` paragraph and the `### Requirement: Command entry point` block so that:
- "via the `/ssc.ads-image` command and `ssc-ads-image` skill" → "via the `/ssc.image` command and `ssc-image` skill";
- the command "SHALL accept an approved ad concept's `idea_id`" → "SHALL accept an approved ad concept's `idea_id` **and** the chosen approved angle `brief_id` (both required)";
- the two scenarios: `/ssc.ads-image <idea_id>` → `/ssc.image <idea_id> <brief_id>`; the missing-arg scenario asks for whichever of `idea_id`/`brief_id` is missing.

- [ ] **Step 2: Gate requirement → variant-anchored**

Replace the `### Requirement: Concept and text-precondition gate` block so the skill gates on: `channel='ad'` AND `status='approved'` AND an **approved `brief_id`** for the concept AND an **approved `image_content` variant** for that brief; each failure STOPs with the exact unmet precondition. Add a scenario: a **non-ad** idea STOPs ("post/youtube image flow not yet wired — phase 2").

- [ ] **Step 3: Per-layer stepper → keyed on `image_content_id`**

In `### Requirement: State-driven per-layer stepper` and the layer requirements, change "read the concept's creative assets grouped by `layer`" → "read the **variant's** creative assets (`list_creatives(image_content_id)`) grouped by `layer`", and in the background/model/composite requirements reference the shipped signatures (`generate_background(image_content_id, …)`, `generate_model(image_content_id, background_creative_id, …)`, `compose_ad_visual(image_content_id, …)` — the server resolves the approved scene + product; the model real-model path uses `uploaded_media_id` + `uploaded_media_ref`).

- [ ] **Step 4: Tool-existence requirement → present tense**

In `### Requirement: Single MCP surface and tool existence`, drop the "MUST exist … before the skill is used end-to-end" future-tense — the tools are on the `ssc` surface now. Keep the "only BrandOS tools, never third-party" rule.

- [ ] **Step 5: Verify**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rn 'ssc-ads-image\|/ssc.ads-image' openspec/specs/
grep -c 'image_content_id' openspec/specs/ads-image-visual/spec.md   # ≥1
grep -c 'brief_id' openspec/specs/ads-image-visual/spec.md           # ≥1
```
Expected: first grep prints nothing (exit 1); both counts ≥ 1.

- [ ] **Step 6: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add openspec/specs/ads-image-visual/spec.md
git commit -m "docs(openspec): ads-image-visual → /ssc.image, image_content_id-anchored, brief_id-gated

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Final verification + governance-hook smoke

**Files:**
- None modified — verification only.

- [ ] **Step 1: No dangling live references anywhere on the installed surface**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rn 'ssc-ads-image\|ssc.ads-image' plugins/ CLAUDE.md openspec/specs/
```
Expected: no output (exit 1). (Dated `docs/superpowers/**` and `openspec/changes/archive/**` are historical records and MAY still contain the old names — that is fine and out of scope.)

- [ ] **Step 2: Skill name ↔ directory match (plugin convention)**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -m1 '^name:' plugins/ssc-content/skills/ssc-image/SKILL.md
test -d plugins/ssc-content/skills/ssc-image && echo "DIR_OK"
test ! -e plugins/ssc-content/skills/ssc-ads-image && echo "OLD_DIR_GONE"
```
Expected: `name: ssc-image`, `DIR_OK`, `OLD_DIR_GONE`.

- [ ] **Step 3: Every tool the skill references exists on the `ssc` surface**

Confirm the skill's `tools:` list contains only these (all verified on-surface): `get_idea`, `list_briefs`, `list_post_content`, `list_creatives`, `generate_background`, `generate_model`, `compose_ad_visual`. And confirm **no forbidden tool** appears:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n 'approve\|set_cover\|reorder_gallery\|update_budget\|unapprove' plugins/ssc-content/skills/ssc-image/SKILL.md
```
Expected: matches appear ONLY inside prose that *forbids* them (the Governance section), never in the `tools:` frontmatter list or as a `Call:` block. Eyeball each hit to confirm it is a negation.

- [ ] **Step 4: Governance hook still denies subagent approvals / asks in main conversation (unchanged)**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
echo '{"tool_name":"mcp__ssc__approve","agent_id":"ssc-image"}' | node plugins/ssc-content/hooks/approval-gate.mjs
echo '{"tool_name":"mcp__ssc__approve"}' | node plugins/ssc-content/hooks/approval-gate.mjs
```
Expected: first emits a **deny** decision (subagent), second emits an **ask** decision (main conversation). (The hook is unchanged by this plan; this only confirms nothing regressed.)

- [ ] **Step 5: (Optional) reinstall smoke in a live Claude Code session**

Per `CLAUDE.md` "Local development": a same-version content edit needs a fresh copy.
```bash
claude plugin uninstall ssc-content@ssc-content-plugin
claude plugin install  ssc-content@ssc-content-plugin
# restart Claude Code, then confirm /ssc.image appears and /ssc.ads-image does not
```
Expected: `/ssc.image` is listed; `/ssc.ads-image` is gone.

---

## Self-Review (author's check against the spec)

- **Spec coverage:** D1 rename → Tasks 1-2; D2 phased/ad-only + non-ad STOP → Task 1 Step 1 gate + Task 5 Step 2; D3 inputs → Task 2; D4 `image_content_id` anchor → Task 1 Steps 2-4; D5 grounding → Task 1 Steps 2/4a; D6 gate → Task 1 Steps 1/1b/2; D7 real signatures + drop "inert" → Task 1 body, Task 4, Task 5 Step 4; D8 governance → Global Constraints + Task 1 Governance + Task 6 Steps 3-4. Cross-ref updates → Tasks 3-5. All acceptance criteria map to a task.
- **Placeholder scan:** no TBD/TODO; every edited file has its full target content or exact before/after strings.
- **Type/name consistency:** `ssc-image` (skill), `/ssc.image` (command), `image_content_id` (anchor), `brief_id`/`idea_id` (inputs), `background_creative_id`, `uploaded_media_id`+`uploaded_media_ref` — used identically across tasks and matching the shipped tool schemas.
- **Known runtime dependency (documented, not a blocker):** `list_post_content` must return per-row `id` (used as `image_content_id`) and `section`/`status` to select the approved `image_content` variant. Today's one-brief-per-idea model makes the single approved `image_content` row the variant; `brief_id`-matching becomes load-bearing only once the server ships N-briefs-per-idea. Verify the actual return shape at Task 1 Step 2 during implementation; if `id` is absent from `list_post_content`, surface it rather than working around it.
