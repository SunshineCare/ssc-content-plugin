# ssc-ads-image — component-composition ad-visual skill (design spec)

Status: DRAFT / for review — no skill file lands until this is approved.
Date: 2026-07-05
Supersedes: `2026-07-03-ssc-ads-image-skill-design.md` (whole-scene draft→refine approach)

## Goal

Add image production to the Cambridge Diet Vietnam ads pipeline. Today the ads
flow is **text-only** — `ssc-ads-writer` ends at `image_content` (the on-image
COPY as structured text). Nothing renders a picture. This skill produces the
**ad visual** to pair with that approved `image_content`, propose-only.

Unlike the superseded whole-scene approach (Flux schnell drafts one throwaway
full scene → Nano refines the whole thing), this design is **component-based**:
the background, the model, and the product are each their own reusable asset,
approved layer by layer, and only composited at the end.

## Why component-based (vs. the superseded whole-scene approach)

| | Superseded (whole-scene draft→refine) | This spec (component composition) |
|---|---|---|
| Step 1 | schnell drafts the **entire scene** (throwaway person/product pixels — only layout matters) | schnell generates the **background alone** (3 versions) |
| Step 2 | operator picks one whole-scene composition | model generated **into the approved background** (one at a time) |
| Step 3 | Nano refines the whole draft photoreal | operator uploads the **real product** |
| Step 4 | masked hard-paste of product PNG — **always** | Nano composites product into the bg+model scene; hard-paste **optional per concept** |
| Layout decided by | schnell, at draft time (locked before refine) | Nano, at compose time (mitigated below) |
| Asset reuse | none — regenerated per concept | background / model / product are **reusable named assets** |

**Chosen for:** reusability (a good synthetic model or product asset recombines
across concepts) and layer-level control (retry one layer without disturbing an
approved one) — which also maps cleanly onto the per-section stepper operators
already know from `ssc-ads-writer`. The one real risk — Nano decides the
arrangement because assets are made independently — is defused by generating the
model **into** the approved background (so the scene coheres two layers early)
plus the three mitigations below.

## Runs after

`image_content` is the LAST section in the ads-writer chain
(headline → copy → description → image_content). `ssc-ads-image` runs **after**
`image_content` is approved for a concept — it consumes the approved concept and
produces the paired visual. Dispatched directly via a new `/ssc.ads-image`
command (mirroring `/ssc.ads-produce` → `ssc-ads-writer`), not through a
planning agent.

## The layer state machine

A **state-driven, per-layer stepper** — the same pattern as `ssc-ads-writer`.
Strict chain, each layer gated on the previous being **approved** in the
dashboard:

```
background → model → product → composite
```

Each invocation reads the concept's creative assets grouped by `layer` +
`status`, works only the first not-yet-approved layer, saves DRAFT creative(s),
and STOPS. The operator picks/approves one in the dashboard and re-invokes.

| Active layer | What the skill does | Engine | Batch |
|---|---|---|---|
| `background` | Generate **3** versions with **negative-space-aware** prompts (reserve off-center subject space + space for the separately-overlaid text). Save 3 DRAFT creatives, STOP. | Flux schnell (text→image) | 3 at once |
| `model` | Generate **ONE** model candidate **into the approved background** (Nano image→image: approved background as base + model prompt). Upload branch: an uploaded real model is **placed into the approved background** by Nano. Save one DRAFT scene (bg+model), STOP. | Nano Banana (image→image) | one at a time |
| `product` | **Upload-only** — the skill never generates the product. If no approved product asset exists, STOP and ask the operator to upload + approve the real product image. | upload | n/a |
| `composite` | Take the approved bg+model scene + approved product → generate **2–3 composite variants** (product placed into the scene), optional masked hard-paste per concept. Save DRAFT creatives, STOP. | Nano Banana (image→image) | 2–3 variants |

### Stepper rules (mirror `ssc-ads-writer`, first match wins)

Let `approved(L)` = ≥1 creative with `layer = L` AND `status = approved`, and
`has_drafts(L)` = ≥1 with `layer = L` AND `status = draft`.

| Condition | Action |
|---|---|
| not `approved(background)`, `has_drafts(background)` | **STOP** — approve ≥1 background in the dashboard, then re-invoke. (Don't pile up a second batch.) |
| not `approved(background)` | active = **background** → generate 3 |
| `approved(background)`, not `approved(model)`, `has_drafts(model)` | **STOP** — approve **or discard** the pending model candidate, then re-invoke. (One model candidate in flight at a time.) |
| `approved(background)`, not `approved(model)` | active = **model** → generate **one** background-conditioned candidate |
| `approved(background)`+`approved(model)`, not `approved(product)` | active = **product** → if an approved product asset exists advance; else **STOP** — ask the operator to upload + approve the real product |
| `approved(background)`+`approved(model)`+`approved(product)`, not `approved(composite)`, `has_drafts(composite)` | **STOP** — approve ≥1 composite in the dashboard, then re-invoke. |
| `approved(background)`+`approved(model)`+`approved(product)`, not `approved(composite)` | active = **composite** → generate 2–3 variants |
| all four approved | **STOP** — visual production complete for this concept |

**The `model` one-at-a-time loop** is the one departure from the batch pattern:
because a background-conditioned Nano pass is a paid render and the model is the
taste-driven layer, the skill produces a **single** candidate per run. The
operator approves it (→ advance) or **discards** it (optionally passing a
`prompt_hints` steering note) and re-invokes to get the **next single
candidate** — repeating until one is approved. The pending-draft guard keeps
only one unapproved model candidate in flight at a time (no piling up), and
respects governance: the operator owns discarding the row.

## Engine mapping

The two-model choice maps 1:1 onto the layers:

- **Text→image (background only — no image conditioning)** → **Flux schnell** (~$0.003 each; 3 drafts ≈ $0.009)
- **Image→image (model-into-background, product-into-scene)** → **Nano Banana** (Gemini 2.5 Flash Image, ~$0.039 per pass)

Cost per finished concept ≈ 3 schnell backgrounds + K model attempts (paid Nano,
one at a time) + 2–3 composite Nano variants ≈ **$0.10–0.20**, uncapped. The
`model` step is a paid Nano pass (not cheap schnell) because it is
background-conditioned rather than blind — the deliberate trade for a coherent
scene two layers early and an easy final compose.

## The three composition mitigations (baked in)

The component approach's only risk is that assets are generated independently and
arranged by Nano at the end. Defused by:

1. **Negative-space-aware backgrounds** — the background prompt explicitly
   reserves off-center subject space (for the model dropped in at the `model`
   layer) and space for the separately-overlaid `image_content` text.
2. **Compose emits 2–3 variants** — not one — so the operator still picks the
   best arrangement, but *after* refinement (restoring the whole-scene approach's
   "pick a composition" checkpoint at the end).
3. **Optional compose-time `layout_hint`** — e.g. "model left, product
   lower-right" — passed to `compose_ad_visual` to steer arrangement.

Generating the model **into** the approved background (rather than standalone)
is itself the primary mitigation: the scene coheres before the product is added.

## Hard rules (invariants)

1. **Product packaging fidelity is operator-controlled per concept.** Nano
   composites the real product into the scene for lighting/position; the operator
   decides per concept whether to apply the **masked hard-paste** of the real
   product PNG (pixel-exact label/logo) — required when packaging must be legible
   (close-up), skippable when the product is small/background. When requested,
   the hard-paste re-composites the **real product PNG** (masked) so the label is
   never a drifted re-render. (This relaxes the superseded spec's always-on
   hard-paste to an operator choice — see the Product-fidelity decision.)
2. **Text is never baked in by a model.** `image_content` is overlaid separately
   (existing workflow). The visual just leaves negative space for it.
3. **Propose-only.** The skill drafts visuals and STOPS for operator review at
   the dashboard. It never approves, sets a cover, reorders a gallery, publishes,
   or flips a gate. Never add `approve_*` / `set_cover` / `reorder_gallery` /
   `update_status` / `update_budget` / publish tools.
4. **Persisted operator-facing prose is Vietnamese** (prompts to the operator,
   any saved notes) — but image-model prompts are whatever the model renders
   best.

## Person branch (model layer)

- **Synthetic person** → generated by Nano **into the approved background**.
  (Accepts: no commercial indemnity on AI humans — a conscious trade vs Firefly.)
- **Real brand model** → the operator supplies the real photo; Nano **places it
  into the approved background**. Same fidelity discipline as the product — a real
  asset, not re-invented.

Either way the `model` layer's output is a **background + model scene** approved
as one asset before the product is added.

## Architecture: provider APIs live in BrandOS, exposed as MCP tools

Unchanged from the superseded spec — carried forward:

```
Plugin skill --MCP--> BrandOS  (generate: schnell background + Nano model/compose + optional masked paste)
                        |
                        +-ConnectRPC--> Go ResourceService (feature/core/resource, proto core/resource/v1)
                        |    PrepareMediaUpload -> (BrandOS PUTs bytes to presigned URL) -> RegisterMedia
                        |                             +-> R2 (prod) / MinIO (dev)
                        |
                        +- draft creative records hold the mediaId / resource reference (not the blob)
```

- **Plugin ↔ BrandOS: MCP** — keeps the single-server model (BrandOS is the only
  MCP the plugin connects to).
- **BrandOS ↔ Flux/Nano: direct REST API, server-side** — provider keys live on
  the server, never in operator Cowork config or a skill.
- **Storage/resource is the Go `resource` domain** (`ResourceService`, proto
  `core/resource/v1`): `PrepareMediaUpload` → presigned PUT → `RegisterMedia`;
  SHA-256 content-hash dedup on upload (free dedup). `cloud-storage` is only the
  presign adapter underneath (`StorageUploader.PresignUpload`).
- The masked hard-paste is **real pixel compositing** (mask a PNG onto Nano's
  output) — it MUST run server-side with an image lib (sharp/canvas), not in
  Cowork.

## New BrandOS tools required (server-side — separate repo)

Every referenced tool must exist on the `ssc` BrandOS surface before ship
(recurring shipped-bug class — commit `8d4ded8`). These are additional tools on
the **same** `ssc` surface, so **no** `plugin.json` / `.mcp.json` change is
needed; the skill just references `mcp__ssc__…`.

- `generate_background(idea_id, n, prompt_hints)` — Flux schnell text→image; saves
  `n` DRAFT creative records tagged `layer='background'`; returns the options.
- `generate_model(idea_id, background_media_id, prompt_hints, uploaded_media_id?)`
  — Nano image→image, conditioned on the **approved** background. Generates one
  synthetic-person candidate, OR (when `uploaded_media_id` is given) places the
  uploaded real model into the background. Saves **one** DRAFT creative tagged
  `layer='model'`.
- `compose_ad_visual(idea_id, scene_media_id, product_media_id, n, layout_hint, hard_paste)`
  — Nano image→image placing the real product into the approved bg+model
  `scene_media_id`; `hard_paste=true` runs the server-side masked paste of the
  real product PNG. Saves `n` (2–3) DRAFT creatives tagged `layer='composite'`.
- a **list/read** tool returning the concept's creative assets by `layer` +
  `status` (the state-machine input) — e.g. `list_creatives(idea_id)` or an
  extension of the existing gallery/creative read surface (CONFIRM the exact tool
  on the BrandOS surface).
- **Product & real-model upload** reuse the existing upload path
  (`upload_creative` / `attach_uploaded_file` → `PrepareMediaUpload`), tagged with
  the `layer`. (CONFIRM the tag/field carrying `layer` on the existing tools.)

## Go-side gaps carried forward (BLOCKERS — confirmed in `resource/api/service.go`)

1. **Public serving.** Originals are `private/…` keys; the only public path is the
   thumbnail slot. An ad creative needs a public full-res URL — decide: new
   ad-creative entity_type that publishes public, or use the thumbnail slot as the
   render. Needs a `MediaPolicy` entry.
2. **No download RPC.** No presigned-GET exists — fetching the product PNG bytes
   for the masked hard-paste needs a presign-download path (reads via Hasura
   metadata + a presign-GET to be added/located). **Blocks the hard-paste option
   only** (not the plain Nano composite).
3. **Server identity.** Write RPCs `RequireRole("member")` and prefix keys with
   `meta.MemberID`. BrandOS is a server, not a member — needs a system/service
   member identity or a dedicated non-member ad-creative entity_type.
   `MediaPolicy` knows `MEMBER_LIBRARY` / `ORGANIZATION_LIBRARY` — neither fits a
   system-generated ad creative.

## Command + skill (this repo — what actually ships)

### Command `/ssc.ads-image` (`commands/ssc.ads-image.md`)

Thin entry point, no orchestration. Parses an `idea_id` (required; ask if
missing, don't invent). Dispatches the `ssc-ads-image` skill and stops. Runs
after the concept's `image_content` is approved. Propose-only; saves drafts,
never approves.

### Skill `ssc-ads-image` (`skills/ssc-ads-image/SKILL.md`)

```yaml
name: ssc-ads-image
description: >-
  Produces the ad VISUAL for one approved Cambridge Diet Vietnam ad concept as a
  state-driven, per-layer stepper — background (Flux schnell, 3 versions) → model
  generated INTO the approved background (Nano Banana, one at a time until
  approved, or upload a real model) → real product upload → composite (Nano
  Banana, 2–3 variants, optional masked hard-paste of the real product PNG per
  concept). Leaves negative space for the separately-overlaid image_content text.
  Propose-only: drafts DRAFT creatives and STOPS for operator review; never
  approves, sets a cover, or publishes.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, list_post_content, generate_background, generate_model, compose_ad_visual, list_creatives]
```

- Direct-dispatched (like `ssc-ads-writer`) — **no** agent `orchestrates:`
  registration.
- Resolves the concept via `get_idea` (must be `channel='ad'`, `status='approved'`).
- Confirms `image_content` is approved via `list_post_content` before starting.
- Reads creative assets by `layer` + `status` to drive the stepper.
- Operator-facing prompts/notes Vietnamese; image-model prompts free-form.

## Governance (propose-only — the core invariant)

The skill generates/composites **DRAFT** creatives and **STOPS**. It **never**
approves, sets a cover, reorders a gallery, publishes, or flips a gate — no
`approve_*`, no `set_cover`, no `reorder_gallery`, no `update_status`, no
`update_budget`, no publish. The operator owns every pick/approval/discard in the
dashboard. **No text is baked in by any model** — the composite leaves negative
space; `image_content` text is overlaid separately downstream.

## Scope & validation

- **Ships in this repo:** the `ssc-ads-image` skill prose + the `/ssc.ads-image`
  command + the BrandOS tool contract it depends on.
- **Separate repos (tracked as blockers):** the new BrandOS tools
  (`generate_background`, `generate_model`, `compose_ad_visual`, the
  `layer`-tagged reads/uploads) and the three Go `resource` gaps. The skill must
  not ship referencing a tool that isn't yet on the `ssc` surface.
- No automated test suite in this repo yet. Validation: every referenced MCP tool
  exists on the BrandOS surface; command↔skill wiring resolves; frontmatter
  `name` matches the directory; no cross-reference to retired commands
  (`ssc.plan` / `ssc.ads`); propose-only invariant holds (no `approve_*` /
  `set_cover` / publish tool in the skill).

## Open questions

1. **`layer` field** — how does BrandOS tag a creative's layer
   (`background`/`model`/`product`/`composite`)? A new column/field, or reuse an
   existing gallery/section field? (CONFIRM before the skill references it.)
2. **List tool** — is there an existing creative/gallery read that returns
   `layer` + `status`, or is `list_creatives(idea_id)` new?
3. **Go blockers (1–3)** — public serving, presigned-GET (hard-paste only),
   server identity — are these scheduled with the BrandOS/Go team?
4. **Discard signal** — the model one-at-a-time loop depends on the operator
   discarding a rejected candidate; confirm the dashboard exposes a discard/remove
   for a DRAFT model creative (governance: operator-owned, not skill-callable).

## Resolved

- **Pipeline** → component composition (background → model-into-background →
  product upload → composite), superseding whole-scene draft→refine.
- **Model layer** → generated INTO the approved background, **one at a time** until
  approved (or upload a real model placed into the background).
- **Product fidelity** → operator decides per concept (masked hard-paste optional),
  not always-on.
- **Flow control** → state-driven per-layer stepper (like `ssc-ads-writer`).
- **Command surface** → new `/ssc.ads-image` command (not folded into
  `/ssc.ads-produce`).
- **Engine mapping** → Flux schnell = background (text→image); Nano Banana =
  model + composite (image→image).
- **Storage/resource** → Go `feature/core/resource` `ResourceService`
  (`PrepareMediaUpload` → presigned PUT → `RegisterMedia`); SHA-256 dedup.
- **MCP vs direct API** → BrandOS calls provider APIs server-side; plugin talks
  only to BrandOS MCP.
