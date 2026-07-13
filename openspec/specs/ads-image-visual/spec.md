# ads-image-visual

## Purpose

Propose-only, state-driven per-layer production of the ad visual (background → model-into-background → product upload → composite) for one approved Cambridge Diet Vietnam ad concept, via the `/ssc.image` command and `ssc-image` skill, built on the BrandOS image tool contract. The skill saves DRAFT creatives and stops for operator review; it never approves, publishes, sets a cover, or bakes text into a visual.

## Requirements

### Requirement: Command entry point `/ssc.image`

The plugin SHALL provide a `/ssc.image` command as a thin entry point that
holds no orchestration logic. It SHALL accept an approved ad concept's
`idea_id` **and** the chosen approved angle `brief_id` (both required), and
dispatch the `ssc-image` skill for that concept and brief. If either `idea_id`
or `brief_id` is missing it SHALL ask the operator for whichever is missing
and MUST NOT invent one.

#### Scenario: Dispatch with a valid idea id and brief id

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id>` for an approved ad concept and its chosen approved angle brief
- **THEN** the command dispatches the `ssc-image` skill for that `idea_id` and `brief_id` and performs no content work itself

#### Scenario: Missing idea id or brief id

- **WHEN** the operator runs `/ssc.image` with `idea_id` or `brief_id` missing
- **THEN** the command asks the operator for whichever is missing and does not dispatch until both are supplied

### Requirement: Concept, angle brief, and variant gate

The `ssc-image` skill SHALL only produce visuals for a concept whose `ideas`
row has `channel='ad'` AND `status='approved'`, whose `brief_id` resolves to
an **approved** angle brief for that concept, and whose approved brief has an
**approved `image_content`** variant (the `image_content_id` anchor). If any
gate fails, the skill MUST STOP and tell the operator the exact unmet
precondition.

#### Scenario: Non-ad idea

- **WHEN** the resolved idea's `channel` is not `ad`
- **THEN** the skill STOPS and tells the operator the post/youtube image flow is not yet wired — phase 2 — and produces no visual

#### Scenario: Concept not approved

- **WHEN** the resolved concept's `status` is not `approved`
- **THEN** the skill STOPS and tells the operator to curate/approve the concept first, and produces no visual

#### Scenario: Brief missing or not approved

- **WHEN** no brief matches the given `brief_id` for the concept, or the matching brief's `status` is not `approved`
- **THEN** the skill STOPS and tells the operator to approve one angle brief for the concept in the dashboard first, and produces no visual

#### Scenario: image_content variant not yet approved

- **WHEN** the concept and brief are approved but no `image_content` row is approved for that brief
- **THEN** the skill STOPS and tells the operator to approve the `image_content` text for that angle first, and produces no visual

### Requirement: State-driven per-layer stepper

The skill SHALL run as a state-driven, per-layer stepper over the strict chain
`background → model → product → composite`, each layer gated on the previous
being approved. On each invocation it SHALL resolve the approved `image_content`
variant for the chosen `brief_id` (its `image_content_id`) and read the
**variant's** creative assets (`list_creatives(image_content_id)`) grouped by
`layer` and `status`, work only the first not-yet-approved layer, save DRAFT
creative(s), and STOP. A layer SHALL run only when every earlier layer has at
least one approved creative.

#### Scenario: First run produces the background layer

- **WHEN** the resolved variant has no approved creative in any layer
- **THEN** the skill works the `background` layer and STOPS after saving its drafts

#### Scenario: Advance to the next layer after approval

- **WHEN** the `background` layer has an approved creative and the `model` layer does not
- **THEN** the skill works the `model` layer (not `background`)

#### Scenario: Pending drafts block a second batch

- **WHEN** the active layer already has DRAFT creatives but none approved (for `background` or `composite`)
- **THEN** the skill STOPS and asks the operator to approve one in the dashboard, without producing a second batch

#### Scenario: All layers approved

- **WHEN** all four layers have an approved creative
- **THEN** the skill reports visual production complete for that variant and produces nothing further

### Requirement: Background layer generation

For the `background` layer the skill SHALL request 3 negative-space-aware
background versions via `generate_background(image_content_id, n, prompt_hints?)`
(Flux schnell, text→image), keyed on the resolved `image_content_id`. The
`prompt_hints` SHALL reserve off-center subject space for the model and space
for the separately-overlaid text; they merge after the server's own
variant-text + brief prompt. The results SHALL be saved as DRAFT creatives
tagged `layer='background'`.

#### Scenario: Three negative-space backgrounds

- **WHEN** the `background` layer is active
- **THEN** the skill requests 3 background versions whose prompts reserve subject and text negative space, saved as DRAFT creatives tagged `layer='background'`

### Requirement: Model layer generated into the background, one at a time

For the `model` layer the skill SHALL generate exactly ONE model candidate per
invocation via `generate_model(image_content_id, background_creative_id,
prompt_hints?)` (Nano Banana, image→image), conditioned on the approved
background creative, OR place an operator-uploaded real model into the
approved background via `generate_model(image_content_id,
background_creative_id, uploaded_media_id, uploaded_media_ref)` (both
`uploaded_media_id` and `uploaded_media_ref` required together). The candidate
SHALL be saved as a single DRAFT creative tagged `layer='model'`. If an
unapproved model draft is still pending, the skill MUST STOP and ask the
operator to approve or discard it before generating the next candidate (one
candidate in flight at a time).

#### Scenario: Single background-conditioned candidate

- **WHEN** the `model` layer is active and no model draft is pending
- **THEN** the skill generates exactly one model candidate into the approved background and saves it as a single DRAFT creative tagged `layer='model'`

#### Scenario: Iterate after a discard

- **WHEN** the operator discards the pending model candidate and re-invokes
- **THEN** the skill generates the next single model candidate (optionally steered by an operator hint)

#### Scenario: Pending model candidate blocks a new one

- **WHEN** a model draft is still pending (not approved, not discarded) and the operator re-invokes
- **THEN** the skill STOPS and asks the operator to approve or discard it first, generating no new candidate

### Requirement: Product layer is upload-only

For the `product` layer the skill SHALL NOT generate the product. If no approved
product asset exists for the concept, the skill MUST STOP and ask the operator to
upload and approve the real product image.

#### Scenario: No product asset uploaded

- **WHEN** the `product` layer is active and no approved product asset exists
- **THEN** the skill STOPS and asks the operator to upload and approve the real product image, generating no product image itself

### Requirement: Composite layer with optional product hard-paste

For the `composite` layer the skill SHALL request 2–3 composite variants via
`compose_ad_visual(image_content_id, n, layout_hint?, hard_paste?,
prompt_hints?)` (Nano Banana, image→image) — the server resolves the approved
background+model scene and the approved product for the variant; the skill
passes no `scene_media_id`/`product_media_id`. It SHALL support an optional
per-concept masked hard-paste of the real product PNG for pixel-exact
packaging via `hard_paste`, and an optional `layout_hint`. Composites SHALL
leave negative space for the separately-overlaid text and be saved as DRAFT
creatives tagged `layer='composite'`.

#### Scenario: Two-to-three composite variants

- **WHEN** the `composite` layer is active with approved background, model, and product
- **THEN** the skill requests 2–3 composite variants placing the product into the scene, saved as DRAFT creatives tagged `layer='composite'`

#### Scenario: Operator requests packaging hard-paste

- **WHEN** the operator requests pixel-exact packaging for the concept
- **THEN** the skill requests the composite with the masked hard-paste of the real product PNG enabled

### Requirement: Propose-only governance

The skill SHALL be propose-only: it saves DRAFT creatives and STOPS. It MUST NOT
call any tool that changes approval or lifecycle state in either direction — no
`approve_*`, no `unapprove_*`, no `update_status`, no `set_cover`, no
`reorder_gallery`, no publish, no `update_budget` — and MUST NOT bake any text
into a visual. All approval, cover-setting, and discarding are operator dashboard
actions.

#### Scenario: No gate is flipped

- **WHEN** the skill finishes any layer
- **THEN** it has only saved DRAFT creatives and called no approval, cover, publish, or budget tool

#### Scenario: No baked-in text

- **WHEN** any visual is produced
- **THEN** it contains no model-rendered ad text and leaves negative space for the separately-overlaid `image_content`

### Requirement: Single MCP surface and tool existence

The skill SHALL reference only BrandOS MCP tools on the `ssc` surface and MUST
NOT call third-party image APIs directly. Every referenced tool —
`generate_background`, `generate_model`, `compose_ad_visual`, the
`image_content_id`-keyed creatives read (`list_creatives`), and any reused
upload/read tools (`get_idea`, `list_briefs`, `list_post_content`) — is
present on the BrandOS `ssc` surface.

#### Scenario: Only BrandOS tools referenced

- **WHEN** the skill invokes image generation or composition
- **THEN** it calls BrandOS MCP tools (`mcp__ssc__…`) and never a third-party provider API directly

### Requirement: Vietnamese operator-facing prose

Operator-facing prompts and any persisted notes the skill writes SHALL be
Vietnamese. Image-model prompts MAY be in whatever language renders best.

#### Scenario: Operator prompts in Vietnamese

- **WHEN** the skill asks the operator to approve, discard, or upload
- **THEN** the operator-facing message is in Vietnamese
