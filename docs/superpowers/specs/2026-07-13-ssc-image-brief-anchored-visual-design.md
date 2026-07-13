# Design — `/ssc.image`: brief-anchored, variant-keyed ad visual producer

- **Date:** 2026-07-13
- **Status:** approved (brainstorm), pending implementation-plan
- **Supersedes / reconciles:** the `idea_id`-keyed model in
  `docs/superpowers/specs/2026-07-05-ssc-ads-image-component-composition-design.md`
  and the live `openspec/specs/ads-image-visual/spec.md` — both encode the
  `idea_id`-anchored chain this design corrects to the shipped
  `image_content_id`-anchored contract. Those docs' component-composition model
  (background → model → product → composite, propose-only, save-and-stop) carries
  forward unchanged; only the **anchor key**, the **inputs**, the **grounding**,
  and the **tool signatures** change.
- **Scope (files):**
  - `plugins/ssc-content/commands/ssc.ads-image.md` → **rename** to
    `plugins/ssc-content/commands/ssc.image.md` (rewrite — new name, `brief_id`
    input, cross-channel positioning + ad-only phase-1 behavior).
  - `plugins/ssc-content/skills/ssc-ads-image/` → **rename** to
    `plugins/ssc-content/skills/ssc-image/` (dir + frontmatter `name: ssc-image`;
    rewrite body — variant anchoring, brief input, grounding, real signatures).
  - `plugins/ssc-content/agents/ssc-video-agent.md` — 2 "sibling `ssc-ads-image`"
    references → `ssc-image`.
  - `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` — 3 "does not gate
    `ssc-ads-image`" references → `ssc-image`.
  - `openspec/specs/ads-image-visual/spec.md` — live spec: command entry point
    `/ssc.ads-image` → `/ssc.image`, skill `ssc-ads-image` → `ssc-image`, and the
    `idea_id`-keyed requirement text → `image_content_id`-keyed + `brief_id` input.
  - Plugin `CLAUDE.md` — add an Ads (image) pipeline row if the pipelines table is
    updated (today it omits the image step); at minimum ensure no stale
    `ssc.ads-image` reference remains.

## Problem / motivation

The operator asked to (1) rename `/ssc.ads-image` → `/ssc.image`, (2) have it
**take a `brief_id`** as input, and (3) **build the visual from the brief and its
copy, headline, description, and image_content**.

Reviewing the **shipped BrandOS tool schemas** (not the plugin prose) revealed the
current skill is already out of step with the contract, so this is a reconciliation
+ reground, not a cosmetic rename:

- **The creative chain is anchored on `image_content_id`, not `idea_id`.** Every
  shipped tool keys on an approved image_content **variant**:
  `generate_background(image_content_id)`,
  `generate_model(image_content_id, background_creative_id)`,
  `upload_product_creative(image_content_id)`,
  `compose_ad_visual(image_content_id)`;
  `list_creatives` reads by `image_content_id` (one variant's chain) **or**
  `idea_id` (all variants). The current skill keys the whole chain on `idea_id`
  and passes `generate_background(idea_id=…)` — a signature that does not exist.
- **The server already grounds the background in the brief.**
  `generate_background` *"builds the two-tier default prompt (variant text with
  negative-space instructions + the idea's creative brief), merges optional
  `prompt_hints` last."* So brief-grounding of the background is server-side; the
  skill's job is to enrich `prompt_hints` with the rest of the approved text.
- **Briefs are any-channel, and content carries `brief_id`.** `save_brief` =
  *"a creative brief for an idea (any channel)"* with `channel: post|ad|youtube`
  (`angle_label` ads-only, NULL for post/youtube). `save_post_content` documents
  *"brief → content lineage; first-class-briefs."* So brief → text → variant →
  creative chain is a real lineage, and `brief_id` is a legitimate cross-channel
  anchor.
- **`compose_ad_visual` no longer takes `scene_media_id`/`product_media_id`.** It
  takes just `image_content_id` (+ `layout_hint`/`hard_paste`/`prompt_hints`) and
  the server resolves the variant's approved scene (the model-layer creative) and
  approved product. The current skill's explicit scene/product media ids are wrong.

## Locked decisions (from brainstorming)

| # | Decision | Choice |
|---|---|---|
| D1 | Command + skill name | Rename `/ssc.ads-image` → **`/ssc.image`**; skill `ssc-ads-image` → **`ssc-image`** (dir + frontmatter `name`). Positioned as the cross-channel image command — the still-image **sibling of `/ssc.video`**. |
| D2 | Cross-channel rollout | **Phased.** This change wires only the **ad** flow (the layer-chain tools `generate_background`/`generate_model`/`compose_ad_visual` are ad-scoped — *"an approved ad concept"*). `brief_id` is accepted as a cross-channel anchor (briefs are any-channel), but a **non-ad** idea → STOP cleanly ("post/youtube image flow not yet wired"). Post/youtube visual flows are separate follow-up changes. |
| D3 | Inputs | **`idea_id` + `brief_id`** required. Optional: `layout_hint`, `hard_paste` (composite), `model_hint` (model), `uploaded_media_id` **+** `uploaded_media_ref` (real-model path — both or neither), `period` (informational). **No `section`** — the image steps by *layer*, auto-detected, not by a named text section. |
| D4 | Anchor key | Anchor the chain on the shipped **`image_content_id`** model. From `brief_id`, resolve the approved image_content **variant for that brief** → its `image_content_id` → drive `generate_background`/`generate_model`/`upload_product_creative`/`compose_ad_visual`/`list_creatives` on that id. |
| D5 | Grounding | **brief + copy + headline + description + image_content.** The server folds variant-text + brief into the background prompt; the skill **enriches `prompt_hints`** with the variant's **approved copy + headline + description** so the visual expresses the full angle. `image_content` still defines the reserved negative-space zones. Grounding on copy/headline/description is **best-effort** (used when approved — see D6). |
| D6 | Gate | Concept is an **approved ad** idea **AND** `brief_id` is an **approved** brief for it **AND** the target variant's **`image_content` is approved** (the anchor + the text-space reserver). copy/headline/description are grounded **when approved**, never gating. This matches the freed-sections design where `image_content` only needs approved `copy`. |
| D7 | Tool reality | **Drop the stale "to-be-built / inert until tools ship" framing** — `generate_background`/`generate_model`/`compose_ad_visual`/`list_creatives`/`upload_product_creative` are on the BrandOS `ssc` surface now. Reference them with their **real signatures** (esp. `compose_ad_visual(image_content_id, …)` — no explicit scene/product ids; `generate_model(image_content_id, background_creative_id, …)`; real-model path needs `uploaded_media_id` **+** `uploaded_media_ref`; `list_briefs(idea)` — param is `idea`, not `idea_id`). |
| D8 | Governance | Unchanged. Propose-only: saves **DRAFT** `creative` rows and STOPS; never `approve` / `edit`-demote-discard / `set_cover` / `reorder_gallery` / publish / `update_budget`; never bakes text into a visual. Product stays **upload-only, operator-owned** (STOP-and-ask). No `plugin.json` / `.mcp.json` change (all tools on the existing `ssc` surface). |

## New command surface

| Command | Signature | Dispatches | Purpose |
|---|---|---|---|
| `/ssc.image` *(rename of `/ssc.ads-image`)* | `<idea_id> <brief_id>` (+ optional layer hints, `period`) | `ssc-image` | Produce the ad VISUAL for the chosen angle's approved image_content variant — state-driven per-layer stepper (`background → model → product → composite`), brief-anchored, grounded in the variant's approved text. |

- Both `idea_id` and `brief_id` are **required**. If either is missing, the command
  asks (one question) — never invents one. No `date` selector (a `brief_id` is
  idea-scoped, so the producer always takes an explicit `idea_id`, mirroring
  `/ssc.ads-produce`).
- Thin entry point — no orchestration; dispatches `ssc-image` and stops.

## End-to-end flow (ad, phase 1)

```
(prereq) /ssc.ads-brief <idea_id>          → angle briefs; operator approves ONE → brief_id
(prereq) /ssc.ads-produce <idea_id> <brief_id> [image_content]
                                           → copy → … → image_content; operator approves image_content

/ssc.image <idea_id> <brief_id>
   → ssc-image resolves the approved image_content VARIANT for brief_id → image_content_id
   → works the single next open LAYER of that variant's chain:
       background → model → product → composite
   → grounds prompts in brief + approved copy/headline/description (best-effort) + image_content
   → saves DRAFT creative(s), STOPS
   → operator approves/discards the layer in /ad/[month]/[id], re-runs /ssc.image <idea_id> <brief_id>
```

Non-ad idea (`channel != 'ad'`): STOP — "post/youtube image flow not yet wired
(phase 2)"; write nothing.

## `ssc-image` skill changes (rewrite of `ssc-ads-image`)

- **Frontmatter:** `name: ssc-image`; `tools:` = `get_idea`, `list_briefs`,
  `list_post_content`, `list_creatives`, `generate_background`, `generate_model`,
  `compose_ad_visual` (product is upload-only → `upload_product_creative` is an
  operator dashboard action, not skill-driven; do **not** add it). `section: ads`
  stays (phase-1 behavior is ad-only). `capability: edit`.
- **Step 1 — resolve concept:** `get_idea(id=idea_id)`; require `channel='ad'`
  (else STOP: post/youtube not wired) and `status='approved'`. Hold `title`,
  `ad_notes`, `tags[]`.
- **Step 1b — resolve + gate the brief:** `list_briefs(idea=idea_id)`; select the
  row where `id == brief_id`; require it exists and is `status='approved'` (else
  STOP: brief not found / approve one angle first). Hold its five narrative fields
  + `angle_label` as the angle anchor. (The server also feeds the brief into
  `generate_background` server-side; the skill holds it for its own `prompt_hints`
  composition and messaging.)
- **Step 2 — resolve the variant + grounding text:** `list_post_content(idea_id)`.
  Find the **approved `image_content`** row for this brief → its `id` is the
  **`image_content_id`** (the variant anchor). If none → STOP ("approve the
  `image_content` for this angle via `/ssc.ads-produce <idea_id> <brief_id>
  image_content` first"). Also hold the variant's **approved** `copy`, `headline`,
  `description` bodies when present — these become the `prompt_hints` grounding
  (best-effort; absent ones are simply omitted).
  - **Resolution dependency to verify in the plan:** `list_post_content` must
    expose per-row `id` (used as `image_content_id`) and enough to match the
    variant to `brief_id` (`section` + `status`, and `brief_id` once Change-2
    lands N variants). Today (one brief per idea) the single approved
    `image_content` row **is** the variant — `brief_id` filtering is
    forward-compatible.
- **Step 3 — determine the next open layer:** `list_creatives(image_content_id)`;
  compute `approved(L)` / `has_drafts(L)` per layer; apply the same first-match
  rule table as today (`background → model → product → composite`, pending-draft
  STOPs on background/composite, one-candidate-in-flight STOP on model, product
  upload-only STOP-and-ask, all-approved = complete).
- **Step 4 — produce the active layer** with the **real signatures**:
  - `background`: `generate_background(image_content_id, n=3, prompt_hints=<copy +
    headline + description grounding; reserve subject + text negative space; no
    baked text>)`. (Server adds variant text + brief; skill adds the rest.)
  - `model`: `generate_model(image_content_id, background_creative_id=<the
    variant's currently-approved background creative id>, prompt_hints=<persona +
    model_hint>)`; **or** the real-model path `generate_model(image_content_id,
    background_creative_id, uploaded_media_id, uploaded_media_ref)` (both required).
    n=1, one candidate in flight.
  - `product`: **upload-only STOP-and-ask** — never generate; the operator uploads
    + approves the real product (`upload_product_creative` is the operator/dashboard
    path). No approved product → STOP and ask (Vietnamese).
  - `composite`: `compose_ad_visual(image_content_id, n=2..3, layout_hint?,
    hard_paste?, prompt_hints=<grounding>)` — **no `scene_media_id`/`product_media_id`**
    (server resolves the approved scene + product from the variant).
- **Step 5 — output summary:** unchanged shape (layer saved, drafts, next action in
  Vietnamese), plus name the anchoring `image_content_id` / angle.
- **Remove** the "Server dependency (to-be-built / inert)" callouts — the tools
  exist; keep a one-line note that runtime generation behavior is the server's.

## Cross-reference updates (live surface only)

- `agents/ssc-video-agent.md` — the 2 "sibling `ssc-ads-image` … inert until tools
  exist" mentions: retarget to `ssc-image`, and correct the "inert" claim for the
  **ads** image tools (they exist now); the video US3/US6 tools are still the
  not-yet-built ones for the video pipeline.
- `skills/ssc-ads-brief/SKILL.md` — the 3 "does not gate `ssc-ads-image`" / "same
  pattern the … `ssc-ads-image` skill uses" mentions: retarget to `ssc-image`; the
  "not-yet-shipped server capability" analogy for `ssc-image` is now stale (drop or
  reword — its tools shipped).
- `openspec/specs/ads-image-visual/spec.md` — update the command/skill names and the
  `idea_id`-keyed requirement to the `image_content_id`-anchored + `brief_id` model.
- **Untouched:** dated `docs/superpowers/specs/*` and `docs/superpowers/plans/*`
  design records, and everything under `openspec/changes/archive/*` — historical.

## Tool reality (as shipped — the contract this design targets)

| Tool | Key | Notes |
|---|---|---|
| `save_brief` | `idea_id` | any channel (`post\|ad\|youtube`); `angle_label` ads-only (NULL else); always draft. |
| `list_briefs` | **`idea`** | one row/idea today; N once Change-2 lands. Returns `status` (used for the approved gate). |
| `list_creatives` | `image_content_id` **or** `idea_id` | one variant chain, or all variants. |
| `generate_background` | `image_content_id` | n∈[1,4] default 3; prompt = variant text + brief, `prompt_hints` merged last. |
| `generate_model` | `image_content_id` + `background_creative_id` | n=1 edit into approved background; real-model = `uploaded_media_id` **+** `uploaded_media_ref`. |
| `upload_product_creative` | `image_content_id` | two-phase ticket, gated on variant approved — **operator path**, not skill-driven. |
| `compose_ad_visual` | `image_content_id` | n∈[2,3]; server resolves approved scene + product; `layout_hint`/`hard_paste`/`prompt_hints`. |
| `save_post_content` | `idea_id` (+ `brief_id` lineage) | referenced only for context; not written by this skill. |
| `list_post_content` | `idea_id` | source for the approved `image_content` variant (→ `image_content_id`) + grounding text. |

## Governance (invariant preserved)

Propose-only throughout. `ssc-image` saves only DRAFT `creative` rows and STOPS;
never calls `approve` (any entity — the ONLY gated promotion, denied to agents by
the approval hook), never uses `edit` to demote/discard, never `set_cover` /
`reorder_gallery` / publish / `update_budget`, never bakes ad text into a visual.
Product is upload-only and operator-owned. All operator-facing prose is Vietnamese;
image-model prompts are free-form. Single MCP surface (`mcp__ssc__…`) — never a
third-party image API. No `plugin.json` / `.mcp.json` change.

## Out of scope

- Post/youtube image flows (phase 2 — they need their own gate + layer design and,
  likely, `attach_ai_image` rather than the ad layer-chain tools).
- Server-side Change 2 (N briefs / N image_content variants per idea) — the design
  is forward-compatible but the multi-variant *choice* is inert until it ships.
- Any change to `save_post_content`'s contract, the `/ad/[month]/[id]` dashboard,
  `approve(entity='brief'|'creative')` wiring, the ads *planning* pipeline, or
  `hooks/approval-gate.mjs`.
- Renaming/rewriting historical dated design docs or archived openspec changes.

## Acceptance criteria

- `/ssc.image` exists (renamed from `/ssc.ads-image`); takes `<idea_id> <brief_id>`
  (both required), dispatches `ssc-image` only, holds no orchestration.
- The `ssc-image` skill (renamed dir + `name: ssc-image`) anchors the chain on
  `image_content_id` resolved from the approved `image_content` variant for
  `brief_id`, gates on approved ad concept + approved brief + approved
  `image_content`, and grounds prompts on brief + approved copy/headline/description
  (best-effort) + image_content.
- Every referenced tool matches its **shipped signature** (esp.
  `compose_ad_visual(image_content_id, …)` with no scene/product ids;
  `generate_model(image_content_id, background_creative_id, …)`;
  `list_briefs(idea)`); the stale "to-be-built / inert" framing is removed.
- A non-ad idea stops cleanly ("post/youtube not yet wired"); nothing written.
- Live cross-refs (`ssc-video-agent.md`, `ssc-ads-brief/SKILL.md`,
  `openspec/specs/ads-image-visual/spec.md`) point at `ssc-image` / `/ssc.image`
  and the `image_content_id` model; no dangling `/ssc.ads-image` or `ssc-ads-image`
  reference on the live surface.
- Propose-only invariant intact — no `approve` / `edit`-demote / `set_cover` /
  publish / gate-flip anywhere; product stays upload-only; no `plugin.json` /
  `.mcp.json` change.
