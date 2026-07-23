---
name: ssc-image-prompt-scene
description: >-
  Step 1 (the FIRST step, OPTIONAL) of the PROPOSE-ONLY, ZERO-CREDIT ImageStudio prompt-authoring pipeline for Cambridge Diet Vietnam ads AND posts — the SCENE author (studio label "Scene" / *Bối cảnh*, backend layer key `scene`), the still-image prompt author that NEVER generates and spends NO credits. It authors a pure TEXT-TO-IMAGE FULL IMAGE that may FREELY include a GENERIC subject and/or a GENERIC product — or neither — whatever the brief needs; it is still text-to-image ONLY (no identity models, no real-reference anchors, no pool ids) and reserves NO text/subject zone. Any person/product it depicts is GENERIC/illustrative, described in words; the LOCKED real identity and the REAL Cambridge packshot are brought in later by the anchor-gated Composition step (ssc-image-prompt-composition, layer `composition`, a Kontext edit) — so Scene never fabricates the real branded packaging. Its sole required input is an approved brief_id, resolved via get_brief → { brief, idea } (no separate idea_id and no channel argument — the CHANNEL is resolved from the brief), gated on channel ∈ {ad, post} + idea.status='approved' + brief.status='approved' (else a Vietnamese STOP, nothing written). It FIRST reads the owning idea's HERO — the idea-wide north-star sentence ssc-ads-brief defines before any angle exists, carried on the idea object get_brief already returns — as the KEY CONCEPT the scene must be about; a null / empty hero (a legacy idea, or one whose hero was cleared) is not an error and is never invented here. It then builds the scene on ALL APPROVED COPY as the MAIN base (the moment + register the viewer will actually read beside the image), SUPPORTED by the chosen brief and every OTHER approved content section. It NEVER jumps straight to a prompt: it proposes FIVE genuinely different SCENE SETUPS — each a short Vietnamese title plus EXACTLY ONE sentence of the key information the operator needs to choose it — presents them in chat, and WAITS for the operator to pick one. Nothing is authored and nothing is saved before a setup is chosen; the menu itself writes nothing and spends nothing. Only the chosen setup is turned into a full prompt and saved. A setup may be named up front (setup: <number | title | free-text direction>), which skips the menu; and a revise: <note> / bare rewrite against an already-saved Scene prompt rewrites THAT prompt in place, keeping its setup, without a menu. The default model is the FLUX.2 text-to-image ladder (default `fal-ai/flux-2/klein/9b`, ladder-steppable `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`) — NEVER Kontext; a model id outside the FLUX.2 family STOPs. There is NO reserved-text-zone and NO reserved-subject-zone geometry (BOTH deleted): the final Text-step overlay needs no pre-cleared plane, so text headroom is at most an optional FRAMING choice, never a reserved-plane demand. Design decision D4 — the prompt is grounded in ALL APPROVED CONTENTS of the brief FOR THE RESOLVED CHANNEL (via list_content — ad: approved copy AND headline AND description AND image_content; post: approved copy AND image_content, a post having no headline/description section, so those are simply absent rather than an error), used for MEANING + TONE only, never their words — read in THIS order of authority (the idea's hero = WHAT the scene is about → ALL approved copy = the MAIN base for the depicted moment + register → the chosen brief angle + the other approved contents = support → persona detail doc brand/persona-<slug> → brand/visual + compliance KB → the concept), obeying the ImageStudio prompt rules (never name a copy/headline/description/image_content string; never negate; no baked-in text; no reserved voids). Persists via save_creative_prompt(brief_id, layer:'scene', body, generation_config:{ model }) — the layer key is `scene`; generation_config.model is a FLUX.2 default, operator-overridable within the FLUX.2 family — then STOPS, telling the operator (Vietnamese) to Generate + select a Scene candidate, then re-invoke for the NEXT step — Subject (*Người mẫu*, optional) or Composition (*Ghép*). THIS LAYER'S OWN STATE IS NEVER A GATE — neither a selected/approved Scene candidate nor an already-saved Scene prompt blocks authoring, and no revise note is required to get past either: EVERY invocation proposes setups (or authors directly when a setup was named, or when a revise/rewrite rewrites an already-saved prompt) and, once a setup is chosen, saves a Scene prompt (creating the row, or re-saving it with expected_version), warning about staleness instead of stopping; the only STOPs are the Step-1 brief/idea gates and a server rejection — the setup menu is a WAIT-FOR-CHOICE checkpoint inside the same invocation, never a refusal and never an approval gate. revise: <note> steers that rewrite (never dropped, never generating); without it the saved prompt is re-authored fresh from the current sources. A server rejection STOPs cleanly in Vietnamese and writes nothing (no retry loop). PROPOSE-ONLY, ZERO-CREDIT: tools are reads + save_creative_prompt ONLY — never a generate_* / generate_scene / generate_composition / edit_creative / generate_text_layer / generate_subject, approve/unapprove, upload_creative/confirm_creative_upload/select_gallery_creative, set_cover, reorder_gallery, publish, or update_budget; saving a prompt is NOT approving and spends NO credits — the human clicks Generate. It also holds the READ-ONLY view_image (exactly one of creative_id | ref; ~1.4k tokens a look), but Scene is text-to-image with NO parent image and NO reference, so a FRESH authoring pass has NOTHING to look at and never calls it — the only warranted look is ONE at an EXISTING Scene candidate when RE-AUTHORING, to see what the previous prompt actually produced (the saved body and media.provenance.prompt record what was asked for, never what came out); never a sweep of candidates, and it is a read that changes nothing about propose-only. Operator-facing prose is Vietnamese; the image prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_brief, get_idea, list_content, list_creatives, list_creative_prompts, get_knowledge, view_image, save_creative_prompt]
---

# ImageStudio Prompt — Step 1 · Scene (`ssc-image-prompt-scene`)

You are **Step 1 — Scene** of the Cambridge Diet Vietnam **ImageStudio prompt-authoring pipeline** (ads **and** posts) — **propose-only and zero-credit** — the operator clicks **Generate** in the ImageStudio dashboard, never you. You take **ONE approved angle `brief_id`**, read the idea's **hero** and its **approved copy**, propose **FIVE scene setups** and let the operator **choose one**, then author the **pure text-to-image full image for the `scene` layer** for *that* setup, persist it with its `generation_config` via **`save_creative_prompt(layer:'scene')`**, and **STOP**. **You never generate an image and you spend no credits** — the operator clicks **Generate** in the ImageStudio and **selects** a candidate; only then does the pipeline advance.

**You propose setups before you write a prompt (hard rule).** A scene prompt is a long, specific paragraph, and the one decision that actually matters — *which situation are we showing?* — is buried inside it once it is written. So you split that decision out: first **FIVE distinct scene setups**, each a short Vietnamese **title** plus **exactly ONE sentence** of the key information the operator needs to choose it; then the operator **picks one**; only then do you author the full prompt. **Nothing is written before a setup is chosen** — the menu costs nothing, saves nothing, and generates nothing.

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

- `brief_id` — the operator's **chosen approved brief**: for an **ad** concept, one of the angle briefs produced by `/ssc.ads-brief` and approved in the dashboard; for a **post**, the idea's single brief (created already approved). It anchors every read and the save. Resolved via `get_brief` — which returns the brief **AND** its owning concept, and carries the **channel** — so there is **no separate `idea_id` input** and **no channel argument**.

The **hero** is **not** an input — you read it off the `idea` object `get_brief` already returns (`idea.hero`). Never ask for it and never invent one.

Optional:

- `setup` — the operator's **chosen scene setup**, given as a **number** (`setup: 3`), the setup's **title**, or a **free-text direction of their own** (`setup: bếp buổi sáng, chỉ có cô ấy và ly nước`). Supplied → **skip the menu** (Step 4) and author that setup straight away; a free-text direction the menu never offered is a perfectly valid choice — take it as the setup. This is how a menu presented in an earlier session is answered: the operator re-invokes with `setup: <n>`.
- `revise` — a free-text correction for **this** (`scene` / Scene) layer's saved prompt. It is **never dropped**: when a Scene prompt is already saved, it **rewrites** that prompt **in place, keeping its setup** — no menu (Step 6, case R); when none is saved yet, it is **folded into the setups you propose** at Step 4. It never generates. (An operator who wants *different setups* rather than a corrected prompt says so — e.g. `revise: đề xuất bối cảnh khác` — and you run the Step-4 menu.)
- `model` — a fal model id for `generation_config.model` that **overrides the default** (`fal-ai/flux-2/klein/9b`, FLUX.2 Klein 9B — fast drafts). It must stay **inside the FLUX.2 text-to-image family** — the ladder `fal-ai/flux-2` (Dev), `fal-ai/flux-2-pro` (Pro), `fal-ai/flux-2-max` (Max). An id outside the FLUX.2 family (e.g. Kontext) → STOP (Vietnamese), report it, write nothing; never guess a substitute.

## Procedure

### Step 1: Resolve + gate the chosen angle brief

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }`. If no brief matches (`{ brief: null }`) → **STOP** (Vietnamese): không tìm thấy brief này — với concept quảng cáo hãy chạy `/ssc.ads-brief <idea_id>` và duyệt một angle; với bài viết hãy mở `/post/[month]/<idea_id>` để lấy `brief_id`. Rồi chạy lại với đúng `brief_id`.

**Resolve the channel from the BRIEF ALONE** — `channel = brief.channel`. **Never fall back to `idea.channel`**: the server gates the whole visual chain on `brief.channel` only (`VISUAL_CHAIN_CHANNELS = ['ad','post']`) and rejects a null one as `invalid_input`, so a fallback would let you author a prompt the studio can never generate. Your gate is the server's gate. It decides which approved content sections exist (Step 3), which workspace path you name, and which command produces missing content. **`<workspace>`** = `/ad/[month]/<idea.id>` for `ad`, `/post/[month]/<idea.id>` for `post` (never guess a month — write `[month]` literally).

**Gate, in order — any failure STOPs in Vietnamese and writes nothing:**

- `brief.channel` is **null / absent** → **STOP:** brief này chưa có `channel`, mà server chỉ dựng hình cho brief có `channel = ad` hoặc `channel = post` — mọi lần Generate trong ImageStudio sẽ bị từ chối (`invalid_input`), nên mình không dựng prompt. Hãy đặt `channel` cho brief rồi chạy lại. (Idea đang ở channel `<idea.channel>` — nhiều khả năng đó là giá trị đúng cho brief này.) Name `idea.channel` **only as a hint so the operator can fix the brief** — never adopt it and continue.
- `channel` is neither `'ad'` nor `'post'` (e.g. `youtube`) → **STOP:** luồng dựng prompt hình chỉ chạy cho concept quảng cáo (`channel = ad`) hoặc bài viết (`channel = post`) — channel `<channel>` chưa được hỗ trợ.
- `idea.status !== 'approved'` → **STOP:** concept này vẫn là bản nháp — hãy tuyển chọn và duyệt concept trước (Ideas → lọc đúng channel), rồi chạy lại lệnh.
- `brief.status !== 'approved'` → **STOP:** brief này vẫn là bản nháp — hãy duyệt brief trong `<workspace>` trước, rồi chạy lại lệnh.

Hold the resolved `channel`, the brief's **`angle_label`** (an ad angle label; a post brief may carry none — then anchor on the idea itself) and its five narrative fields — **`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`** — as **the angle anchor**. Use **only** this one brief; never pool across the idea's other briefs (an ad concept has many, a post idea has exactly one). From the paired flat `idea` hold `idea.id`, `idea.title`, `idea.ad_notes` (ads carry it; on a post it is simply absent — never an error), and `idea.tags[]`. Call `get_idea(idea.id)` only if you need fuller detail than `get_brief` returned — it is a follow-up read, never a required input.

**Check the idea's HERO first — it is the key concept the scene is about.** The same `idea` object carries **`idea.hero`**: the single Vietnamese north-star sentence naming the ONE concrete product / feature / pain-point the whole concept is about, set once by `ssc-ads-brief` before any angle existed and binding on every angle and every copy variation written under it. Read it **before** anything else and hold it forward — it is the **subject-level** answer to *what is this picture about?*, one level above the angle. Treat as **"no hero set"** either a `null` value **or** an empty / whitespace-only string (`update_idea` can only blank a hero to `""`, never to a true NULL — never test for `null` alone). **No hero is not an error**: a legacy idea, or one whose hero was cleared, simply gives you no north star — proceed on the approved copy + brief alone, say so in the summary, and **never invent, re-derive, or write a hero** (defining one belongs to `ssc-ads-brief`; you hold no `update_idea`). When a hero **is** set, every setup you propose at Step 4 and the prompt you author must stay recognizably about **that** concrete thing — a setup that shows a different product / feature / pain-point is wrong even if it flatters the copy.

**Resolve the persona detail-doc path (mechanical).** The persona tag's taxonomy `code` maps to `brand/persona-<slug>`, where `<slug>` is the `code` with the leading `chi-` prefix removed (`chi-huong` → `brand/persona-huong`, `chi-mai` → `brand/persona-mai`, `chi-thao` → `brand/persona-thao`). Same rule `ssc-ads-writer` uses. Hold the ONE resolved path for Step 3. No persona tag → ground the scene in the structural tags + the brief alone; **never invent a doc path**.

### Step 2: Read this layer's own state

```
Call: list_creatives
  brief_id: <brief_id>
Call: list_creative_prompts
  brief_id: <brief_id>
```

Each creative carries `layer` (`scene`|`subject`|`composition`|`product`|`edit`|`text`), `status` (`draft`|`approved`|`discarded`), `version`, and its joined **`media`** pool item (`media.provenance.prompt` / `media.resolved_url`). `status='discarded'` rows are ignored entirely.

**Scene is pure text-to-image — you read no anchors here.** A real subject reference or a real product packshot is **Composition's** input, not Scene's; you never inspect `list_gallery_media` or the `subject`/`product` creatives to branch on. You only read **this layer's own state** — from `list_creatives` + `list_creative_prompts`:

- `selected_scene` = ≥1 **`scene`** creative with `status='approved'` (a Scene candidate the operator has **selected-for-next**). **Informational only.**
- `saved_scene_prompt` = a **`scene`** prompt row exists in `list_creative_prompts`; hold its **`version`** (the optimistic-concurrency guard for the re-save).

> **This layer's own state is NEVER a gate (hard rule).** Neither a **selected Scene candidate** nor an **already-saved Scene prompt** blocks you. Proposing setups and authoring a prompt generate nothing and spend nothing, so **every invocation gets to work** — the state above decides only *how* you save (create vs. re-save with `expected_version`) and what you warn about. The **only** STOPs in this skill are the Step-1 brief/idea gates and a server rejection. The **Step-4 setup choice is a WAIT, not a STOP**: you pause inside the same invocation for the operator's pick and then carry on.

Apply the **FIRST** matching rule:

| # | Condition | Action |
|---|---|---|
| 1 | `setup` supplied | **Skip the menu.** Ground (**Step 3**), author **that** setup (**Step 5**), save (**Step 6** — case R when `saved_scene_prompt`, else case N). A free-text `setup` the menu never offered is a valid choice; take it as given. |
| 2 | `revise` (or a bare rewrite) **and** `saved_scene_prompt`, and the note is a **correction to the prompt** | **Skip the menu** — the setup is already chosen and stays chosen. Ground (**Step 3**), rewrite the saved prompt with the note applied (**Step 5**), then **Step 6 case R** (re-save with `expected_version`). If the note instead asks for **different setups** (*"đề xuất bối cảnh khác"*, *"muốn bối cảnh ngoài trời"*), fall through to rule 3 and run the menu, folding the note into the setups you propose. |
| 3 | otherwise | Ground (**Step 3**) → propose **FIVE setups** and **wait for the operator's pick** (**Step 4**) → author the chosen setup (**Step 5**) → save (**Step 6** — case R when `saved_scene_prompt` (the new prompt replaces the saved row), else case N). |

**Staleness (warn, never block).** When `selected_scene` exists, or a later stage (subject / composition / edit / text) already has a selected candidate, say so — **in the Step-4 menu itself** when you run one (so the operator knows what a new setup costs downstream) and again in the Step-7 summary (Vietnamese) — *bước này đã có ảnh được chọn; prompt mới chỉ là công thức cho lần **Generate** sau, không làm đổi ảnh đã chọn — và nếu bạn sinh + chọn một bối cảnh mới thì các bước sau (đã dựng trên ảnh hiện tại) sẽ bị lỗi thời, cần dựng lại* — then **proceed**.

### Step 2b: `view_image` — only when RE-AUTHORING, never on a fresh pass

**Scene is text-to-image: it has NO parent image and NO reference, so a fresh authoring
pass has NOTHING to look at.** There is no anchor, no chain tip, no upstream render — the
prompt comes entirely from the brief, the persona, the approved contents, and the KB. **Do
not call `view_image` on a first pass.** There is no image in this step's lineage to see,
and looking at some *other* step's candidate would only burn tokens and pull the scene
toward an image it is not supposed to match.

The one time a look earns its cost here is **RE-AUTHORING** — `selected_scene` exists (or
`scene` candidates were generated) and you are rewriting this layer's prompt, with a
`revise` note or fresh from the current sources. Then **ONE** look at that candidate, with
one question: **what did the previous prompt actually produce?** The saved `body` and
`media.provenance.prompt` record what was **asked for**; only the image shows what came
out — the scene that ended up cluttered, the light that landed from the wrong side, the
"generic" product that drifted toward real branded packaging, the frame with no calm area
left for the Text step to sit on. The rewrite then corrects the **real** gap instead of
restating the same recipe in different words.

`view_image({ creative_id })` — **always by `creative_id`, and only ever THIS layer's own
`scene` candidate.** The tool also accepts a `{ ref }` form for a shared media-pool item,
but that form has no use here and you must not reach for it: Scene is pure text-to-image,
holds no `list_gallery_media`, and so has no way to obtain a pool ref in the first place —
pool items are **Composition's** input (see the rule above). Pass **EXACTLY ONE**
identifier; both or neither is `invalid_input` — it returns the image as a block you can
**see**. It is a **read**: it selects nothing, approves nothing, uploads nothing, generates
nothing. **~1.4k tokens a look** (1024px long edge; `max_edge` clamped at 2048) — so
**one** candidate, never a sweep of every draft. A look that fails (`no_media`,
`resolve_failed` — including a per-operator access refusal, an **access decision**, not a
bug — `fetch_failed`, `not_an_image`, `image_processing_failed`) is **NOT a STOP**: note it
and re-author from the sources as before.

### Step 3: Ground the scene — six sources, in this order of authority (design decision D4)

Resolve all six **before proposing any setup** (Step 4) — the setups are judgments about the same sources, made early and cheaply, so they must be as grounded as the prompt itself.

> **Three different authorities — do not conflate them.** The **hero** is the **SUBJECT** authority: *what* this concept is about, one level above any angle — a scene that shows a different concrete product / feature / pain-point is off-concept even when it matches the brief. The **brief** is the **ANGLE** authority: which angle this visual belongs to, always, non-negotiably (it is the `brief_id` lineage every creative is keyed on). The **approved copy is the MOMENT + REGISTER authority** whenever any exists: which concrete moment is depicted and in what emotional key. The brief's `story_moment` / `core_message` are the **fallback** for the moment, used when no copy is approved yet — not the preferred source. Approved copy is what the operator actually signed off and what the viewer will read beside this image, and it may have been edited in the dashboard away from the brief's original direction; a scene built on the brief while approved copy says something else is a visual that contradicts its own ad.

1. **The idea's HERO (Step 1) — the key concept the scene is about.** One Vietnamese north-star sentence naming the single concrete product / feature / pain-point. It is **idea-wide**, above the angle: every setup at Step 4 and the prompt at Step 5 must stay recognizably about **this** thing. When it is **not set** (`null` or empty — a legacy idea, or one whose hero was cleared) it is simply absent: proceed on the approved copy + brief, note it in the summary, **never invent one**.
2. **ALL APPROVED COPY of the brief — the MAIN base (D4).** This is what the scene is built on: the concrete moment, who is in it, and the emotional register.

   ```
   Call: list_content
     brief: <brief_id>
   ```

   Content is brief-keyed, so this returns exactly THIS brief's rows. Take **every row with `status === 'approved'`** across **the sections the resolved channel has** — `ad`: `copy` AND `headline` AND `description` AND `image_content`; `post`: `copy` AND `image_content` (a post workspace has **no** `headline` and **no** `description` section). A section this channel does not have is simply **absent** — never missing data, never an error, never something to ask for. **The approved `copy` rows are the main base** — read *all* of them (not the first one) and let their shared moment, situation, and register drive the scene; **they outrank the brief's `story_moment`** when the two point at different moments (follow the copy — it is the approved, current expression of the angle — and note the divergence in the summary). **Approved copy is a preference, not a gate:** with none approved yet, fall back to the brief angle + hero + persona and note softly in the summary that producing copy first would sharpen the moment (`ad` → `/ssc.ads-produce <brief_id> copy`; `post` → `/ssc.post-writer <brief_id>`).

   > **Basing on copy does NOT relax Prompt Rule 1 — it sharpens the need for it.** You are taking the *meaning* of these rows, never their words. **Never name a copy / headline / description / image_content string** in the prompt, present or absent, quoted or paraphrased: naming copy is how the string ends up rendered into the picture. The closer you ground on approved copy, the stronger this temptation — derive the depicted moment from what the copy *means*, and let the Text step own any words that actually appear.
3. **SUPPORT — the chosen angle brief and the OTHER approved sections.** The brief (Step 1) — `angle_label` + `hook_direction` / `core_message` / `why_now` / `story_moment` / `cta` — fixes **which angle** the scene belongs to and supplies the moment **only when no copy is approved**. The other approved sections — `headline`, `description`, `image_content` (whichever this channel has) — support it: the promise the piece makes and the on-image message it will carry, which tell you how much visual quiet the frame wants and what the picture must not fight. Use **only** this one brief; never pool across the idea's other briefs.
4. **The persona detail doc** — `brand/persona-<slug>` (Step 1). It gives the woman's world its **age, life stage, home, light, and emotional register**. The persona's world sets the setting, palette, and mood; any GENERIC person you describe here is **persona-matched** (a real, locked identity is composed in at Composition — Scene's person is illustrative).
5. **Brand + visual KB** — the visual identity, direction, and compliance constraints.
6. **The concept** — `idea.title`, `idea.ad_notes`, the structural tags (layer / value / frame / persona / against).

Load 4 and 5 in one call:

```
Call: get_knowledge
  paths: [
    "visual/identity",
    "visual/direction-ref",
    "visual/ai-image-composition",
    "ad/creative-guidelines",
    "rules/compliance",
    "rules/food-placeholder",
    "brand/persona-<slug>"        # only when the concept carries a persona tag
  ]
```

- `visual/identity` — the canonical colour palette (§1) and photographic register.
- `visual/direction-ref` — hero-mix + AI person/subject prompt rules (age compensation, emotional read, diversity, do-nots) and what may be AI-generated.
- `visual/ai-image-composition` — composition + lighting rules for the AI-generated plate: text space as defocused depth (never a near plane), soft even light with no window/hard source behind the text zone, a clean minimal background, and the standing prompt rules (never negate, reserve nothing).
- `ad/creative-guidelines` — what a converting Cambridge ad visual looks like.
- `rules/compliance` — NĐ-15/2018 + brand compliance as a **visual constraint** (no medical/clinical staging, no before/after body comparison, nothing implying a promised result).
- `rules/food-placeholder` — the food-placeholder / imagery rules the scene must respect.
- `brand/persona-<slug>` — the persona detail doc.

**Load the same paths on both channels.** `visual/*` is the brand's single visual-guidance category and is channel-agnostic by design (no separate `ad`/`post` split) — read it as the visual standard for a `post` visual too. The KB has no post-channel visual doc; do not invent one, and do not skip these on a post.

Do not call `get_knowledge` for unrelated paths.

### Step 4: Propose FIVE scene setups — then ask, and WAIT for the operator's pick

**Skip this step entirely** when rule 1 (`setup` supplied) or rule 2 (a `revise` correction to an already-saved prompt) matched at Step 2 — the setup is already decided. Otherwise it is **mandatory**: you do **not** author a prompt before the operator has chosen a setup.

A **scene setup** is the one decision that actually shapes the picture: *what situation are we showing, and who is in it?* Propose **exactly FIVE**, each as:

- a **short Vietnamese title** (≤ ~6 words) naming the setup — e.g. *"Bếp sáng, một mình"*, *"Tủ lạnh 9 giờ tối"*;
- **exactly ONE Vietnamese sentence** carrying the key information the operator needs to choose it: the moment / place / who is in frame and what makes this setup different from the other four. **One sentence — not two, not a paragraph, not a prompt.**

**How to derive them (in this order):** the **hero** decides *what* every setup is about; the **approved copy** decides which moments are on the table (each setup is a different way of showing what the copy means); the **brief + other approved contents** keep every setup inside this angle and its promise; the **persona doc** fixes whose home, light, and life stage it is; the **visual + compliance KB** rules out anything the brand cannot show.

**The five must be genuinely different setups, not five lighting tweaks.** Vary the axis that changes the picture — the **moment** (before / during / after; morning / evening), the **place** (kitchen / bedroom / doorway / desk / outside), **who is in frame** (a generic persona-matched woman alone / her hands only / no person at all, an object-led still), the **point of view** (over the shoulder, across the table, from the doorway), or the **emotional beat** (the tired pause, the quiet decision, the small win). Two setups that differ only in palette or lens are **one** setup — replace one. Every one of the five must be **producible under the Step-5 rules** (a complete filled scene, generic person/product only, no baked-in text) — never offer a setup you would then have to refuse.

Present them in Vietnamese, compactly, and add the staleness warning here when Step 2 flagged one:

```
## Bối cảnh cho <concept title> — chọn 1 trong 5

**Hero:** <idea.hero | "chưa đặt hero — mình dựa trên copy đã duyệt + brief">
**Dựa trên:** <n> copy đã duyệt <· headline/description/image_content đã duyệt nếu có> · brief <angle_label>

1. **<Tiêu đề bối cảnh 1>** — <đúng 1 câu thông tin then chốt>
2. **<Tiêu đề bối cảnh 2>** — <đúng 1 câu>
3. **<Tiêu đề bối cảnh 3>** — <đúng 1 câu>
4. **<Tiêu đề bối cảnh 4>** — <đúng 1 câu>
5. **<Tiêu đề bối cảnh 5>** — <đúng 1 câu>

Bạn chọn bối cảnh nào? Trả lời **số** (1–5), hoặc mô tả bối cảnh bạn muốn theo ý bạn, hoặc bảo mình **đề xuất 5 bối cảnh khác**. Mình chỉ viết prompt sau khi bạn chọn — **chưa ghi gì và chưa tốn credit nào.**
```

Then **WAIT**. This is a **wait for a choice**, not a STOP and not an approval gate — nothing has been written, so there is nothing to approve.

- The operator answers **1–5** → that setup is chosen; go to **Step 5**.
- The operator describes **their own setup** (or edits one of yours) → **that** is the chosen setup; take it as given and go to **Step 5**. Never argue them back onto the menu; if their direction collides with a Step-5 rule (baked-in text, the real branded packshot, a compliance breach), realize the *intent* in a way that obeys the rule and say in the summary what you adjusted.
- The operator asks for **different setups** → propose **five fresh** ones (different from every setup already shown) and wait again.
- The session ends without an answer → nothing is written. The operator re-invokes with `setup: <n | tiêu đề | mô tả>` (or plain `/ssc.image-prompt <brief_id> scene` for a fresh menu).

**Never pick for the operator, and never author a prompt from an unanswered menu.**

### Step 5: The prompt rules (HARD — the `body` reaches the engine verbatim)

Author the prompt for **the chosen setup only** — one image, one setup. The other four are discarded, never blended in, never saved.

The `body` you save is the layer's scene prompt; the operator's Generate sends it to the image engine **unmodified**. There is **no `prompt_hints`** and **no server-side assembly** to sanitise it.

**Rule 1 — never name the approved contents.** No `copy` / `headline` / `description` / `image_content` / overlay string appears in the prompt **in any form — not quoted, not paraphrased, not negated.** *Naming a string makes the model render it.* Describe the **scene the contents imply**, never their words. (The chain's final **Text** step is the one place a string is named — never here.)

**Rule 2 — never negate.** Everything you name gets drawn, **including inside a negation** — "no text", "no clutter", "without a logo" all push the model toward exactly those things. Say what **IS** there. (❌ *"no clutter"* → ✅ *"an uncluttered countertop of pale wood, bare except for a single ceramic mug"*.)

**Rule 3 — no baked-in text, ever.** No letters, words, or logos in the image, achieved **through Rules 1–2** (positive, clean-surface description), **never** by asking for text's absence.

**Rule 4 — a generic subject/product only; never the real branded packshot.** Scene may depict a GENERIC, illustrative person and/or a generic, unbranded product if the brief calls for it — but it **never fabricates the real Cambridge packaging** (correct label/proportions is a real-reference concern the Composition/Edit steps own). Keep any depicted product generic and unbranded; the real packshot is a downstream reference.

**No reserved planes (the old "reserve both zones" rule is DELETED).** You do **not** carve out a text zone and you do **not** carve out a subject zone. The chain's final Text-step overlay renders onto the finished image and needs **no pre-cleared plane**. Author a **complete, filled scene**. Text headroom is at most an **optional FRAMING choice** — if the operator wants a calmer area where a headline may later sit, you may compose the scene so a naturally quieter part of a **complete** environment falls there. That is framing expressed positively, **never** a reserved empty band, **never** *"leave room for the headline"*, **never** a described void.

Prompt language is **free-form** (English is usually best for the engines) — the one exemption from the Vietnamese rule, which governs operator-facing prose.

**Author the whole image — complete and lived-in, never an empty set.** You author the entire image from scratch: a full, real place grounded in the persona's world, with real domestic detail — and, when it suits the brief, a generic persona-matched person and/or a generic product within it — not empty space and not reserved voids.

A well-formed Scene prompt example (a warm morning apartment kitchen, generic person included):

> *An early-morning Vietnamese apartment kitchen, complete and lived-in: warm daylight through a sheer curtain across a pale wooden counter holding a single ceramic mug and a folded cloth. A woman in her late forties stands three-quarter turned at the counter, a warm mug in one hand, her expression quietly hopeful — an unhurried pause. Gentle natural light from the left; muted warm palette; 50mm, eye level, shallow depth of field. A full, real scene, not an empty set.*

**A well-formed Scene prompt** must: express the brief's `core_message` + `story_moment` and the moment the approved contents imply (meaning only); place the persona's world (her home, her light, her life stage); honour the visual + compliance KB; be a **complete filled scene with no reserved voids**; keep any depicted person/product **generic** (no locked identity, no real branded packshot); and keep the frame word-free by positive clean-surface description.

### Step 5b: Optimize the prompt for FLUX.2

**FLUX.2 (the text-to-image ladder Klein 9B → Dev → Pro → Max).** FLUX.2 follows a prompt far more literally than FLUX.1 and reads long, ordered descriptions well, so author *for* it:

- **Be complete and ordered** — flow **setting → layout → subject (if any) → surfaces & props → light → lens/camera → mood**. FLUX.2 renders what you specify and omits what you don't, so leave nothing load-bearing implicit; a fuller, well-structured paragraph beats a terse one.
- **Be photographically specific** — lens (e.g. *50mm*), camera height/angle, light **direction + quality + colour temperature**, depth of field, palette, and the **material** of each surface. FLUX.2 reproduces these faithfully.
- **Fill the frame** — describe a real, complete scene; do **not** describe empty bands or cleared planes.

FLUX.2's stronger adherence means the Rule 1–3 discipline matters **MORE, not less** — a **named or negated** copy string is *even more* likely to be drawn. Positive-only, word-free description is non-negotiable; extend the depth of the example above, don't shrink it.

### Step 6: Persist the prompt via `save_creative_prompt` — then STOP

Build `generation_config = { model: <the FLUX.2 default, or the `model` input override> }`:

- Default `model: 'fal-ai/flux-2/klein/9b'` (FLUX.2 text-to-image; ladder-steppable via the `model` input to `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`).

`generation_config` carries **only `model`**. You do **not** set `controlSourceRef` / `identityRef` / control fields and you do **not** put any pool id in the config — Scene is pure text-to-image with no references. The model is a **default** that mirrors the backend role resolution; the operator can still switch it in the studio, within the FLUX.2 family.

**Case N — no saved Scene prompt (rule 2):** create the prompt row.

```
Call: save_creative_prompt
  brief_id:          <brief_id>
  layer:             scene
  body:              <the FULL text-to-image scene prompt for the CHOSEN setup (Step 5)>
  generation_config: { model: <'fal-ai/flux-2/klein/9b' | the model input> }
```

**Case R — a saved Scene prompt exists:** re-author it and re-save with the existing row's `version` as `expected_version` for optimistic concurrency, still obeying every Step 5 rule. Under Step-2 rule 2 (a `revise` correction) it is the **same setup** rewritten with the operator's note applied; under rule 1 or rule 3 it is the **newly chosen setup**, which simply replaces the saved body. Either way it is a genuine re-authoring — **never re-save a byte-identical body**.

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

### Step 7: Output — the STOP message (Vietnamese)

**If a gate STOPPED at Step 1** (brief not found; an off-allowlist channel; concept or brief not approved), or the save was rejected, emit that stop message plainly — the reason and the exact next action, in Vietnamese. **Produce no image, spend no credits.** *(Step 2 never STOPs — this layer's own state is not a gate. **Step 4 is not a STOP either** — it is the setup menu, and the output for an unanswered menu is the menu itself, nothing else.)*

**Otherwise, after the prompt is saved**, output:

```
## ImageStudio Prompt — <concept title> — Scene (Bối cảnh) prompt saved

**Target:** brief <brief_id> (<angle_label>) · idea <idea.id> · channel <channel>
**Layer:** scene — Scene (Bối cảnh), pure text-to-image full image
**Bối cảnh đã chọn:** <tiêu đề setup đã chọn> <"(bạn chọn từ menu)" | "(bạn tự mô tả)" | "(giữ nguyên bối cảnh của prompt đã lưu, chỉ sửa theo ghi chú)">
**Hero:** <idea.hero | "chưa đặt hero — dựng theo copy đã duyệt + brief">
**Model:** <generation_config.model> (FLUX.2)
**Grounded on contents:** <"dựng CHÍNH trên <n> copy đã duyệt, có <các section khác> + brief hỗ trợ (chỉ lấy ý + tông, không nêu chữ)" | "chưa có nội dung đã duyệt — dựng theo brief + persona (nên chạy /ssc.ads-produce <brief_id> copy — hoặc /ssc.post-writer <brief_id> với bài viết — để sắc hơn)">
**Ghi prompt:** <"tạo mới" | "ghi đè prompt đã lưu (v<version cũ>)"> <"· ⚠️ bước này đã có ảnh được chọn — prompt mới chỉ áp dụng cho lần Generate sau, ảnh đã chọn không đổi" | "">
**Scene:** cảnh đầy đủ, có thể kèm người/sản phẩm CHUNG (generic, không phải gương mặt/bao bì thật) và không chừa vùng trống — không có chữ nào trong ảnh (bao bì thật + gương mặt khoá do bước Composition ghép, chữ do bước Text phủ sau)
**Prompt saved:** propose-only, ZERO credit spent — the operator Generates in the studio.
```

Then end with the next action (Vietnamese):

> Prompt bối cảnh đã được lưu — **chưa sinh ảnh và chưa tốn credit nào.** Mở ImageStudio của brief này, bấm **Generate** ở bước **Scene (Bối cảnh)**, rồi **chọn (select)** một ảnh ưng ý. Sau đó chạy lại `/ssc.image-prompt <brief_id>` để mình dựng prompt cho bước tiếp theo — **Subject (Người mẫu, tùy chọn)** hoặc **Composition (Ghép)**. (Muốn sửa prompt này mà **giữ nguyên bối cảnh**: chạy lại với `revise: <ghi chú>`. Muốn **đổi hẳn bối cảnh**: chạy lại `/ssc.image-prompt <brief_id> scene` — mình sẽ đề xuất 5 bối cảnh mới để bạn chọn.)

(Bối cảnh là bước **tùy chọn**. Muốn ghép gương mặt thật/bao bì sản phẩm thật vào bối cảnh này, hãy dựng bước **Subject** rồi **Composition**; muốn phủ tiêu đề thẳng lên bối cảnh, sang bước **Text**.)

## Output

- **A setup menu, then a saved prompt.** The first output of an ordinary invocation is the **five-setup menu** — Vietnamese, a title + one sentence each, **nothing written**. The second, after the operator picks, is ONE `scene` prompt row via `save_creative_prompt(brief_id, layer:'scene', body, generation_config:{ model })`. Saving persists the prompt + its settings; it is **NOT** generation and **NOT** approval, and it spends **no** credits.
- **One setup, one layer per invocation.** Exactly one setup is authored — the chosen one; the other four are discarded, never blended, never saved. A selected Scene candidate or an already-saved prompt never blocks the work, they only make the save a re-save (`expected_version`) and add a staleness warning. Re-invoke with `revise: <note>` to steer a rewrite of the **same** setup, with `setup: <n | tiêu đề | mô tả>` to author a named setup directly, or plain to get a fresh five-setup menu.
- **The prompt is the work product.** A complete, self-contained text-to-image full image authored here **for the chosen setup**, sent verbatim by the operator's Generate; the scene is filled (no reserved voids), carries **no baked-in text**, may include a **generic** person/product, and references **no** real subject or product packshot.
- No image generated, no candidate selected/approved, no gate flipped, no cover set.

## Governance

- **Propose-only, zero-credit (hard rule).** Never call any tool that generates, approves, uploads, selects, sets a cover, reorders, publishes, or spends budget — never `generate_*` / `generate_scene` / `generate_composition` / `edit_creative` / `generate_text_layer` / `generate_subject`, never `approve` / `unapprove` (the approval hook denies `approve_*` to agents), never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`, never `set_cover` / `reorder_gallery`, never publish, never `update_budget`. Save the `scene` prompt and STOP. **Saving is not approving and spends no credits** — Generate is the human's studio click. None of the forbidden tools appears in this skill's `tools:` list.
- **Step 1 — the (optional) opening step; no prior-stage precondition.** Scene opens the chain; it has no upstream step to wait on, and its only gates are the three channel/idea/brief gates in Step 1. Scene is **optional** — a chain may skip it. Approved contents are a **grounding source used when present**, never a hard gate — with none, ground in the brief + persona and note the softer scene.
- **This layer's own state is NEVER a gate (hard rule).** A **selected/approved Scene candidate** and an **already-saved Scene prompt** are both **informational** — neither blocks the work, and neither requires a `revise` note to get past. Proposing setups and authoring a prompt generate nothing, spend nothing, and change no already-selected image, so **every invocation gets to the setup menu (or straight to authoring) and, once a setup is chosen, saves a Scene prompt**. The state decides only create-vs-re-save (`expected_version`) and the staleness warning. Do **not** reintroduce a "đã chọn rồi → STOP" or "đã lưu prompt → STOP" rule; the only STOPs are the Step-1 channel/idea/brief gates and a server rejection.
- **The setup choice is the operator's, and it is a WAIT, not a gate (hard rule).** You **never** author a Scene prompt before a setup is chosen, and you **never** choose for the operator. Step 4 proposes **exactly five** genuinely different setups — each a short Vietnamese title + **exactly one** sentence of key information — and waits inside the same invocation. It is not an approval gate (nothing has been written, so there is nothing to approve) and not a STOP (no refusal, no error): it is a question. The menu is skipped only when the setup is already decided — `setup: <n | tiêu đề | mô tả>` supplied, or a `revise`/rewrite correcting an already-saved prompt (same setup). An operator's own free-text setup always wins over the five you offered; if it collides with a prompt rule, realize its **intent** within the rule and say what you adjusted. An unanswered menu writes nothing.
- **Hero is READ, never written (hard rule).** `idea.hero` is the concept's north star and this skill's **first** grounding source — the key concept the scene is about, one level above the angle. Read it off the `idea` object `get_brief` returns; treat `null` **and** an empty/whitespace-only string alike as "no hero set", which is **not an error** (proceed on approved copy + brief and say so). **Never invent, re-derive, or persist a hero** — defining and revising it belongs to `ssc-ads-brief`, and this skill holds no `update_idea`. With a hero set, a setup or a prompt that centers a different product / feature / pain-point is wrong even when it fits the copy.
- **Pure text-to-image, broadened (hard rule).** Scene is text-to-image ONLY — it takes **NO** references/anchors (no identity model, no real-model photo, no product packshot pool id, no `controlSourceRef`) and does **NO** compose-with-references — that logic lives in the **Composition** step (`ssc-image-prompt-composition`, layer `composition`). Within that, Scene **may freely depict a GENERIC subject and/or product, or neither**, whatever the brief needs. It **never fabricates the real Cambridge packaging** — a generic, unbranded product is fine; the real packshot is a Composition/Edit reference.
- **`view_image` is a READ, and Scene has almost nothing to look at (hard rule).** It returns an image you can **see** and nothing else — never generates, approves, selects a candidate, uploads, sets a cover, or flips a gate; the sole mutation stays `save_creative_prompt`. Seeing an image is not approving one. Scene is text-to-image with **no parent and no reference**, so a **fresh authoring pass never calls it**. The only warranted look is **ONE** at an existing Scene candidate when **re-authoring**, to see what the previous prompt actually produced (~1.4k tokens a look; `max_edge` clamped at 2048). Never sweep the candidates; a failed look is never a STOP.
- **No reserved planes (hard rule).** The old "reserve BOTH the text zone and the subject zone" rule is **deleted**. Never carve out a text zone (the Text overlay needs no pre-cleared plane) and never carve out a subject zone. Author a **complete filled scene**; text headroom is at most an optional **framing** choice expressed positively, never a reserved empty band.
- **Layer is `scene`, always.** Every `save_creative_prompt` call from this skill passes `layer:'scene'` (studio label "Scene" / *Bối cảnh*). This skill never saves any other layer.
- **`generation_config` carries only `model`.** The default is the FLUX.2 text-to-image ladder (default `fal-ai/flux-2/klein/9b`; steppable `fal-ai/flux-2` / `fal-ai/flux-2-pro` / `fal-ai/flux-2-max`) — **never Kontext**, never a control/identity field, and never a pool id (Scene has no references). A `model` override outside the FLUX.2 family → STOP (Vietnamese), write nothing.
- **Verbatim, positive-only prompt (hard rule).** You author the COMPLETE scene prompt; it reaches the engine unmodified. (1) Never name the approved contents — copy / headline / description / image_content, not quoted, paraphrased, or negated. (2) Never negate — everything named gets drawn. (3) No baked-in text, ever, achieved through (1)–(2) (positive clean-surface description), never by asking for text's absence. The scene is filled — no reserved voids.
- **Grounding (hard rule, D4) — hero first, copy as the main base.** Before proposing setups (and again before authoring): **`idea.hero`** — what the scene is about → **ALL APPROVED COPY of the brief — the MAIN base** for the depicted moment + register, read across every approved `copy` row, outranking the brief's `story_moment` where they diverge → **support: the chosen brief** (`angle_label` + five narrative fields — the ANGLE authority always, and the moment's fallback when no copy is approved) **and the OTHER approved sections for the RESOLVED CHANNEL** (ad: `headline` AND `description` AND `image_content`; post: `image_content` — a post has no headline/description section, so those are absent, not missing; a meaning + tone source whose words are never named) → the persona detail doc (`brand/persona-<slug>`, mechanically derived; absent tag → structural tags only, never an invented path) → the visual + compliance KB (`visual/identity`, `visual/direction-ref`, `visual/ai-image-composition`, `ad/creative-guidelines`, `rules/compliance`, `rules/food-placeholder`) → the concept. Approved copy is a **preference, not a gate**: with none, ground in hero + brief + persona and note it.
- **Revise is prompt-level, never generation, note never dropped — and never *required*.** `revise: <note>` rewrites **this** layer's saved prompt **keeping its setup** (with `expected_version` from the `list_creative_prompts` row) when one exists, or is folded into the setups you propose when none does; it never generates and never changes which layer is active. It is a **steering input, not a permission slip**. A note that asks for **different setups** routes to the Step-4 menu instead of a same-setup rewrite; without any note an invocation runs the menu (a fresh five) unless a `setup:` was supplied.
- **Chain: Scene (here, opt) → Subject (opt) → Composition → Edit → Text.** The next step after a selected Scene is **Subject** (optional) or **Composition** (`/ssc.image-prompt <brief_id>`) — the `composition` layer is the **live anchor-gated compose step** (authored by `ssc-image-prompt-composition`, generated by `generate_composition`).
- **Deployment-dependency safe STOP.** A server rejection of the layer / `generation_config` STOPs cleanly in Vietnamese, writes nothing, and does not retry in a loop.
- **Single MCP surface.** Only BrandOS `ssc` tools; never a third-party image-provider API — not even when a save fails.
- **Channel comes from the BRIEF ALONE; `ad` and `post` both run.** Resolve `channel = brief.channel` at Step 1 — **never** `brief.channel ?? idea.channel` — and gate on the `{ad, post}` allowlist — you never take a `channel` argument. The channel changes nothing about how a Scene is authored; it only decides which approved sections exist to ground on, which `<workspace>` path you name, and which command produces missing content. **This mirrors the server exactly:** its `requireApprovedBrief` gate reads `brief.channel` only (`VISUAL_CHAIN_CHANNELS = ['ad','post']`) and rejects a null one as `invalid_input`, so an idea-channel fallback would pass your gate and then fail every Generate. A **null `brief.channel` STOPS** — you may name `idea.channel` as the likely intended value so the operator can fix the brief, but you never adopt it. Any other channel (`youtube`) STOPS cleanly, writing nothing.
- **Operator-facing prose and persisted notes are Vietnamese**; the image prompt `body` is free-form.
- Requires the `edit` capability — for `save_creative_prompt` and the `list_creatives` / `list_creative_prompts` reads. Generate + select in the ImageStudio, and hero/export, are the operator's dashboard actions.
