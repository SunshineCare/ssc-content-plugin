# ads-image-visual

## Purpose

Propose-only, state-driven per-layer production of the ad visual (background → model-into-background → product upload → composite) for one approved Cambridge Diet Vietnam ad concept, via the `/ssc.ads-image` command and `ssc-ads-image` skill, built on the BrandOS image tool contract. The skill saves DRAFT creatives and stops for operator review; it never approves, publishes, sets a cover, or bakes text into a visual.

## Requirements

### Requirement: Command entry point `/ssc.ads-image`

The plugin SHALL provide a `/ssc.ads-image` command as a thin entry point that
holds no orchestration logic. It SHALL accept an approved ad concept's `idea_id`,
and dispatch the `ssc-ads-image` skill for that concept. If no `idea_id` is
provided it SHALL ask the operator for one and MUST NOT invent one.

#### Scenario: Dispatch with a valid idea id

- **WHEN** the operator runs `/ssc.ads-image <idea_id>` for an approved ad concept
- **THEN** the command dispatches the `ssc-ads-image` skill for that `idea_id` and performs no content work itself

#### Scenario: Missing idea id

- **WHEN** the operator runs `/ssc.ads-image` with no argument
- **THEN** the command asks the operator for an `idea_id` and does not dispatch until one is supplied

### Requirement: Concept and text-precondition gate

The `ssc-ads-image` skill SHALL only produce visuals for a concept whose `ideas`
row has `channel='ad'` AND `status='approved'`, and whose `image_content` text
section is approved. If either gate fails, the skill MUST STOP and tell the
operator the exact unmet precondition.

#### Scenario: Concept not approved

- **WHEN** the resolved concept's `status` is not `approved` (or `channel` is not `ad`)
- **THEN** the skill STOPS and tells the operator to curate/approve the concept first, and produces no visual

#### Scenario: image_content not yet approved

- **WHEN** the concept is approved but no `image_content` row is approved
- **THEN** the skill STOPS and tells the operator to approve the `image_content` text first

### Requirement: State-driven per-layer stepper

The skill SHALL run as a state-driven, per-layer stepper over the strict chain
`background → model → product → composite`, each layer gated on the previous
being approved. On each invocation it SHALL read the concept's creative assets
grouped by `layer` and `status`, work only the first not-yet-approved layer, save
DRAFT creative(s), and STOP. A layer SHALL run only when every earlier layer has
at least one approved creative.

#### Scenario: First run produces the background layer

- **WHEN** the concept has no approved creative in any layer
- **THEN** the skill works the `background` layer and STOPS after saving its drafts

#### Scenario: Advance to the next layer after approval

- **WHEN** the `background` layer has an approved creative and the `model` layer does not
- **THEN** the skill works the `model` layer (not `background`)

#### Scenario: Pending drafts block a second batch

- **WHEN** the active layer already has DRAFT creatives but none approved (for `background` or `composite`)
- **THEN** the skill STOPS and asks the operator to approve one in the dashboard, without producing a second batch

#### Scenario: All layers approved

- **WHEN** all four layers have an approved creative
- **THEN** the skill reports visual production complete for the concept and produces nothing further

### Requirement: Background layer generation

For the `background` layer the skill SHALL request 3 negative-space-aware
background versions via the BrandOS `generate_background` tool (Flux schnell,
text→image). The prompt SHALL reserve off-center subject space for the model and
space for the separately-overlaid text. The results SHALL be saved as DRAFT
creatives tagged `layer='background'`.

#### Scenario: Three negative-space backgrounds

- **WHEN** the `background` layer is active
- **THEN** the skill requests 3 background versions whose prompts reserve subject and text negative space, saved as DRAFT creatives tagged `layer='background'`

### Requirement: Model layer generated into the background, one at a time

For the `model` layer the skill SHALL generate exactly ONE model candidate per
invocation, conditioned on the approved background (BrandOS `generate_model`, Nano
Banana image→image), OR place an operator-uploaded real model into the approved
background. The candidate SHALL be saved as a single DRAFT creative tagged
`layer='model'`. If an unapproved model draft is still pending, the skill MUST
STOP and ask the operator to approve or discard it before generating the next
candidate (one candidate in flight at a time).

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

For the `composite` layer the skill SHALL request 2–3 composite variants via the
BrandOS `compose_ad_visual` tool (Nano Banana image→image), placing the approved
product into the approved background+model scene. It SHALL support an optional
per-concept masked hard-paste of the real product PNG for pixel-exact packaging,
and an optional `layout_hint`. Composites SHALL leave negative space for the
separately-overlaid text and be saved as DRAFT creatives tagged `layer='composite'`.

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
NOT call third-party image APIs directly. Every referenced tool
(`generate_background`, `generate_model`, `compose_ad_visual`, the `layer`-aware
creatives read, and any reused upload/read tools) MUST exist on the BrandOS
surface before the skill is used end-to-end.

#### Scenario: Only BrandOS tools referenced

- **WHEN** the skill invokes image generation or composition
- **THEN** it calls BrandOS MCP tools (`mcp__ssc__…`) and never a third-party provider API directly

### Requirement: Vietnamese operator-facing prose

Operator-facing prompts and any persisted notes the skill writes SHALL be
Vietnamese. Image-model prompts MAY be in whatever language renders best.

#### Scenario: Operator prompts in Vietnamese

- **WHEN** the skill asks the operator to approve, discard, or upload
- **THEN** the operator-facing message is in Vietnamese
