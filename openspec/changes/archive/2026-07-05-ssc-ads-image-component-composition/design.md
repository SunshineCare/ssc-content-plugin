## Context

The ads pipeline is text-only. `ssc-ads-writer` produces four text sections per
concept (`headline → copy → description → image_content`), where `image_content`
is the on-image COPY as structured text — no picture is rendered. Ad visuals are
made by hand today.

The full design is captured and approved at
`docs/superpowers/specs/2026-07-05-ssc-ads-image-component-composition-design.md`
(this artifact is its openspec projection). It **supersedes** the whole-scene
draft→refine approach in `docs/superpowers/specs/2026-07-03-ssc-ads-image-skill-design.md`.

Constraints that shape everything:
- **Single MCP surface.** The plugin talks only to the BrandOS MCP server. Skills
  never curl provider APIs; BrandOS calls Flux/Nano server-side (provider keys
  stay on the server).
- **Propose-only governance is the core invariant** (see root `CLAUDE.md`). No
  skill may approve, publish, set a cover, or flip a gate.
- **Three-layer dispatch model.** Commands are thin entry points; skills are the
  work units. `ssc-ads-image` is direct-dispatched by `/ssc.ads-image` (like
  `ssc-ads-writer` ← `/ssc.ads-produce`), NOT orchestrated by a planning agent —
  so no agent `orchestrates:` registration.
- **Persisted operator-facing prose is Vietnamese**; image-model prompts are
  free-form (whatever renders best).

## Goals / Non-Goals

**Goals:**
- Ship a propose-only `ssc-ads-image` skill + `/ssc.ads-image` command that
  produce the ad visual for one approved concept as a state-driven, per-layer
  stepper (`background → model → product → composite`).
- Generate the model **into** the approved background so the scene coheres before
  the product is added; iterate the model **one candidate at a time**.
- Let the operator control product packaging fidelity **per concept** (optional
  masked hard-paste).
- Leave negative space for the separately-overlaid `image_content` text — no
  model bakes in text.
- Define the exact BrandOS tool contract the skill depends on so the server team
  can build it (referencing a non-existent tool is a recurring shipped bug).

**Non-Goals:**
- Building the BrandOS server tools or the Go `resource`-domain changes (separate
  repos; tracked here only as blockers/contract).
- Rendering or overlaying the `image_content` text (a downstream/dashboard step).
- Reinstating the retired `image` (rendered-PNG `creativeUrl`) section of the text
  flow — distinct from this visual flow.
- Any budget/publish/approve automation.

## Decisions

**D1 — Component composition over whole-scene draft→refine.**
Generate background, model, and product as separate reusable assets and composite
at the end, rather than drafting one throwaway full scene and refining it.
*Why:* asset reuse (a good model / product recombines across concepts) and
layer-level control (retry one layer without disturbing an approved one), and it
maps onto the per-section stepper operators already know. *Alternative rejected:*
whole-scene draft→refine (the superseded spec) — tighter layout determinism but
no reuse and coarse control.

**D2 — Model generated INTO the approved background, one at a time.**
The `model` layer conditions on the approved background (Nano image→image) and
produces a single candidate per invocation. *Why:* conditioning on the background
is the primary mitigation for the component approach's one risk (Nano arranging
independently-made assets) — the scene coheres two layers early. One-at-a-time
because a background-conditioned Nano pass is a paid render and the model is the
taste-driven layer; iterating one candidate avoids burning three Nano passes.
*Alternative rejected:* batch of 3 models (like background) — wasteful for a paid,
iterative, taste-driven layer.

**D3 — Engine mapping matches the two chosen models 1:1.**
Text→image (background, no conditioning) → **Flux schnell** (~$0.003 ea). Image→image
(model-into-background, product-into-scene) → **Nano Banana** (~$0.039/pass).
*Why:* the operator's stated model choice; schnell is cheap for throwaway-count
background exploration, Nano handles the conditioned/photoreal work.

**D4 — Product fidelity is operator-controlled per concept.**
Nano composites the real product for lighting/position; the operator decides per
concept whether to apply a server-side **masked hard-paste** of the real product
PNG (pixel-exact label). *Why:* legibility matters for close-ups, is irrelevant
when the product is small/background — forcing hard-paste always (the superseded
rule) adds a blocked dependency (presigned-GET) to every concept.
*Alternative rejected:* always hard-paste (superseded); trust-Nano-always (risks
a drifted label on a paid ad).

**D5 — State-driven per-layer stepper, gated on dashboard approval.**
Each invocation reads the concept's creative assets by `layer` + `status`, works
the first not-yet-approved layer, saves DRAFT creative(s), STOPS. Operator
approves one and re-invokes. *Why:* identical mental model to `ssc-ads-writer`;
keeps every consequential pick a human dashboard action. *Alternative rejected:*
one-shot in-chat with inline checkpoints (long session, unlike the
dashboard-driven pattern) and generate-all-then-compose (no early stop).

**D6 — New `/ssc.ads-image` command, not folded into `/ssc.ads-produce`.**
*Why:* keeps text production (Claude-written) and visual production
(server-generated) cleanly separated; mirrors the existing direct-dispatch shape.

**D7 — Provider APIs live in BrandOS; storage in the Go `resource` domain.**
Plugin ↔ BrandOS is MCP; BrandOS ↔ Flux/Nano is server-side REST; BrandOS ↔ Go
`ResourceService` (`PrepareMediaUpload` → presigned PUT → `RegisterMedia`, SHA-256
dedup) for durable media. The masked hard-paste is real pixel compositing
(sharp/canvas) and must run server-side, not in Cowork.

**D8 — Skill references (to-be-built) BrandOS tools on the same `ssc` surface.**
`generate_background(idea_id, n, prompt_hints)`,
`generate_model(idea_id, background_media_id, prompt_hints, uploaded_media_id?)`,
`compose_ad_visual(idea_id, scene_media_id, product_media_id, n, layout_hint, hard_paste)`,
plus a `layer`-aware creatives read. New tools on the existing surface ⇒ **no**
`plugin.json` / `.mcp.json` change. Because the tools don't exist yet, the skill
ships behind that server work (see Risks).

## Risks / Trade-offs

- **Referencing not-yet-built BrandOS tools** → the skill file names tools the
  server must implement; shipping the skill before they exist is the recurring
  bug class (commit `8d4ded8`). *Mitigation:* this design is the explicit contract;
  Open Questions flag the confirms; the plugin change may land the skill text while
  keeping it clearly gated on the server tools (documented in the skill + tasks).
- **Composition arranged by Nano** (independently-made assets) → a background may
  not leave room for the model. *Mitigation:* (1) negative-space-aware background
  prompts, (2) compose emits 2–3 variants so the operator picks the arrangement
  after refinement, (3) optional `layout_hint`, and (4) model generated *into* the
  background (D2).
- **Product label drift** on a paid ad → *Mitigation:* the per-concept masked
  hard-paste option (D4) re-composites the real PNG.
- **Hard-paste depends on a Go presigned-GET** that doesn't exist → *Mitigation:*
  the plain Nano composite works without it; hard-paste is opt-in, so the blocker
  gates only that option, not the whole skill.
- **Synthetic-person indemnity** → no commercial indemnity on AI humans (vs
  Firefly). *Mitigation:* accepted trade; operators may upload a real model instead.
- **Model one-at-a-time loop depends on an operator discard** of a rejected
  candidate → *Mitigation:* pending-draft guard keeps one candidate in flight;
  confirm the dashboard exposes discard for a DRAFT model creative (Open Q).

## Migration Plan

Additive — no existing behavior changes. Sequence:
1. Land this plugin change (command + skill + contract docs). The skill is inert
   until the BrandOS tools exist.
2. BrandOS server team implements `generate_background` / `generate_model` /
   `compose_ad_visual` / the `layer`-aware read on the `ssc` surface.
3. Go team closes the three `resource` gaps (public serving, presigned-GET for
   hard-paste, server identity).
4. Enable end-to-end; operators run `/ssc.ads-image <idea_id>` after `image_content`
   approval.
Rollback: remove/disable the command + skill; nothing else depends on them.

## Open Questions

1. **`layer` tagging** — how does BrandOS tag a creative's layer
   (`background`/`model`/`product`/`composite`)? New field, or reuse a
   gallery/section field?
2. **Creatives read tool** — does an existing creative/gallery read return `layer`
   + `status`, or is `list_creatives(idea_id)` new?
3. **Go blockers (public serving / presigned-GET / server identity)** — scheduled
   with the BrandOS/Go team?
4. **Model discard signal** — does the dashboard expose discard/remove for a DRAFT
   model creative (operator-owned, not skill-callable)?
