## ADDED Requirements

### Requirement: Concept, angle brief, and approved-copy gate

The `ssc-image` skill SHALL only produce visuals for a concept whose `ideas` row
has `channel='ad'` AND `status='approved'`, whose `brief_id` resolves to an
**approved** angle brief of that concept, and for which at least one **approved
`copy`** row exists. The three gates SHALL be checked in that order. If any gate
fails, the skill MUST STOP and tell the operator — in Vietnamese — the exact unmet
precondition and the exact next action, producing no visual and spending no
generation credits.

The approved-copy gate SHALL be **brief-scoped where the data allows it, and
idea-scoped otherwise**:

1. **Brief scope (preferred).** When the candidate `copy` rows carry a `brief_id`,
   the gate SHALL match only rows whose `brief_id` equals the chosen `brief_id`.
2. **Idea-scope fallback (today's ad rows).** When the rows carry **no** `brief_id`,
   the gate SHALL fall back to matching any approved `copy` row for the **idea**.
   This is the live path for ad content: `ssc-ads-writer` calls
   `save_post_content(channel='ad', idea_id, section, body, score, comment)` and
   never passes `brief_id`, and the server binds `brief_id` automatically **only
   for `post` content** — so every ad `copy` row's `brief_id` is null and the
   brief-scoped clause cannot fire.

The fallback is sound **only** while the server persists **one brief per idea**
(pre-"Change 2"). Once an idea can carry N approved briefs, copy approved for
angle A would satisfy this gate for angle B and the visual would be grounded in
the wrong angle's story, at generation-credit cost. Therefore the fallback MUST
be loud: whenever the gate matched at **idea scope**, the skill MUST **declare
that scope in its output summary** (the `Copy matched:` line), naming it as a
fallback and stating that it is only safe while one brief per idea holds. A
silent fallback is FORBIDDEN — the skill MUST NOT match at idea scope without
announcing it.

`image_content` SHALL NOT be a gate: the skill MUST NOT require an approved
`image_content` row, MUST NOT read one, and MUST NOT size or shape anything from
its body. `image_content` is the on-image overlay text the dashboard applies over
the finished visual at a later stage.

#### Scenario: Non-ad idea

- **WHEN** the resolved idea's `channel` is not `ad`
- **THEN** the skill STOPS and tells the operator the post/youtube image flow is not yet wired — phase 2 — and produces no visual

#### Scenario: Concept not approved

- **WHEN** the resolved concept's `status` is not `approved`
- **THEN** the skill STOPS and tells the operator to curate/approve the concept first, and produces no visual

#### Scenario: Brief missing or not approved

- **WHEN** no brief matches the given `brief_id` for the concept, or the matching brief's `status` is not `approved`
- **THEN** the skill STOPS and tells the operator to approve one angle brief for the concept in the dashboard first, and produces no visual

#### Scenario: Copy rows carry a brief_id — the gate is brief-scoped

- **WHEN** the concept and brief are approved and the idea's approved `copy` rows carry a `brief_id`
- **THEN** the gate matches only the rows whose `brief_id` equals the chosen `brief_id`, ignores copy belonging to any other angle, and the output summary declares that copy was matched **at brief scope**

#### Scenario: Ad copy rows carry no brief_id — the gate falls back to idea scope and says so

- **WHEN** the concept and brief are approved and the idea's approved `copy` rows carry no `brief_id` (every ad `copy` row today, because `ssc-ads-writer` never passes one and the server binds it only for `post` content)
- **THEN** the gate matches any approved `copy` row for the **idea**, the skill proceeds, and its output summary declares on the `Copy matched:` line that the match was the **idea-scope fallback** and that it is only safe while the server keeps one brief per idea

#### Scenario: The idea-scope fallback is never silent

- **WHEN** the gate has passed by matching copy at idea scope rather than brief scope
- **THEN** the skill MUST NOT omit the scope from its output summary, and it MUST NOT report the match as brief-scoped

#### Scenario: No approved copy at either scope

- **WHEN** the concept and the brief are approved but no `copy` row with `status='approved'` exists for that brief — nor, under the fallback, for the idea
- **THEN** the skill STOPS, tells the operator (in Vietnamese) to run `/ssc.ads-produce <idea_id> <brief_id> copy` and approve one copy, then re-run — and it produces no visual

#### Scenario: image_content is never consulted

- **WHEN** the concept, brief, and approved-copy gates all pass and no `image_content` row is approved for that brief
- **THEN** the skill proceeds to work the next open layer, having neither read nor gated on any `image_content` row

### Requirement: Verbatim, positive-only scene prompt authorship

The skill SHALL author the COMPLETE scene prompt for every generate/compose call
and pass it as the `prompt` parameter, which reaches the image engine
**unmodified** — there is no `prompt_hints` parameter and no server-side prompt
assembly. Every prompt SHALL describe only the scene (setting, staging, subject
placement, mood, light, palette, lens/composition) and SHALL obey these hard
rules:

1. **Never name the ad copy.** No copy, headline, description, or `image_content`
   string SHALL appear in a prompt — not quoted, not paraphrased, not negated.
   Naming a string makes the model render it.
2. **Never negate.** The prompt MUST use positive phrasing only; it MUST NOT
   contain constructions such as "no text", "no people", or "without a logo",
   because everything named gets drawn.
3. **Reserve space geometrically, in the positive.** Room for the later text
   overlay and for the not-yet-generated subject SHALL be bought by describing the
   area as what it positively is (e.g. "the upper third is a smooth, evenly-lit
   cream plaster wall"; "the left third is an open, sunlit stretch of clean
   countertop"), never by asking for an absence. The reserved-space convention is
   a **standing composition rule from the visual KB** and SHALL NOT be derived from
   any `image_content` body.
4. **One image per call.** There is no `n` parameter; another candidate means
   another call.
5. **No baked-in text, ever.** No layer SHALL render words, letters, or logos into
   the image, and this SHALL be achieved through rules 1–3, never by asking for
   text's absence.

Prompt language is free-form (image prompts are exempt from the Vietnamese prose
rule).

#### Scenario: Full prompt authored and sent verbatim

- **WHEN** the skill calls `generate_background`, `generate_model`, or `compose_ad_visual`
- **THEN** it passes a complete, self-contained scene `prompt` it authored itself, passes no `prompt_hints`, and relies on no server-side prompt assembly

#### Scenario: Ad copy strings never appear in a prompt

- **WHEN** the skill authors any layer's prompt from the approved copy, headline, or description
- **THEN** no string from those rows appears in the prompt in any form — quoted, paraphrased, or negated — and only the scene the copy implies is described

#### Scenario: Negation is never used

- **WHEN** the skill needs the image to be free of text, people, or props
- **THEN** the prompt states positively what occupies that area (e.g. a bare plaster wall, an uncluttered countertop) and contains no "no …" / "without …" construction

#### Scenario: Reserved space stated positively and not sized from image_content

- **WHEN** the skill reserves the text zone and (on the background layer) the subject zone
- **THEN** each zone is described as a positively-stated clean, evenly-toned surface per the standing visual-KB composition rule, with no reference to how many lines of overlay text will later be applied

#### Scenario: One image per call

- **WHEN** more than one candidate is wanted for a layer
- **THEN** the skill issues one generate call per candidate and passes no `n` parameter

### Requirement: Brief, copy, persona, and brand-KB grounding

Before authoring any prompt, the skill SHALL resolve and ground the visual in, in
this order of authority:

1. the chosen angle brief — `angle_label` plus `hook_direction`, `core_message`,
   `why_now`, `story_moment`, `cta` (read via `list_briefs`, filtered to that one
   `brief_id`; there is no `get_brief` tool);
2. the persona detail doc `brand/persona-<slug>`, where `<slug>` is the idea's
   persona tag `code` with the leading `chi-` prefix removed (`chi-huong` →
   `brand/persona-huong`), read via `get_knowledge`;
3. the approved `copy` for that brief — a **meaning** source only, whose words are
   never named in a prompt;
4. brand KB via `get_knowledge` — `brand/visual-identity`, `ad/visual-direction-ref`,
   `ad/creative-guidelines`, plus `rules/compliance` and `rules/food-placeholder`
   as visual constraints;
5. the concept — `idea.title`, `idea.ad_notes`, and the structural tags.

Approved `headline` / `description` rows MAY be read as extra tone signal; they
SHALL NOT gate, and their words SHALL NOT be named in a prompt.

#### Scenario: Grounding resolved before the first generate call

- **WHEN** the skill works any layer
- **THEN** it has read the one chosen brief, the persona detail doc, the approved copy, and the visual/compliance KB docs, and the authored prompt expresses that angle's `core_message` and `story_moment`

#### Scenario: Persona doc slug derivation

- **WHEN** the idea carries the persona tag `chi-huong`
- **THEN** the skill reads `brand/persona-huong` via `get_knowledge` and gives the woman in the frame that persona's age, life stage, home, and emotional register

#### Scenario: No persona tag on the concept

- **WHEN** the idea carries no persona tag
- **THEN** the skill grounds the subject in the structural tags and the brief alone, and does not invent a persona doc path

#### Scenario: Copy grounds meaning, never wording

- **WHEN** the approved copy names a concrete moment (e.g. a mother at breakfast before work)
- **THEN** the prompt describes that scene and contains none of the copy's words

### Requirement: Operator revise path

The skill SHALL accept an optional `revise: <note>` argument. A layer with
pending, unapproved drafts normally STOPs; with a revision note the skill SHALL
instead read the layer's active prompt via `list_creative_prompts(brief_id)` plus
the pending drafts' `generation_prompt`, **rewrite** that prompt applying the
operator's note (still obeying the prompt rules), and issue exactly ONE generate
call for that same layer with the rewritten prompt. The skill SHALL NOT re-issue
the unchanged prompt (a blind re-roll), and SHALL NOT call `save_creative_prompt`
— the generate tool persists the revised prompt row itself.

#### Scenario: Revise rewrites the prompt and generates one candidate

- **WHEN** the `background` layer has pending unapproved drafts and the operator re-invokes with `revise: ánh sáng ấm hơn, đặt trong bếp thay vì phòng khách`
- **THEN** the skill reads the active prompt and the pending drafts' `generation_prompt`, rewrites the prompt to a warm-lit kitchen scene, and issues exactly one `generate_background` call with the rewritten prompt

#### Scenario: Revise never re-rolls the same prompt

- **WHEN** the skill acts on a `revise` note
- **THEN** the prompt it sends differs from the layer's active prompt by the operator's correction, and it calls no `save_creative_prompt`

#### Scenario: No revise note leaves the STOP intact

- **WHEN** a layer has pending unapproved drafts and no `revise` note is supplied
- **THEN** the skill STOPS and asks the operator to approve or discard in the dashboard, generating nothing

#### Scenario: No prompt row to revise

- **WHEN** `list_creative_prompts` returns no prompt row for the active layer and a `revise` note was supplied
- **THEN** the skill STOPS with `prompt_not_found`, reports it in Vietnamese, and generates nothing

### Requirement: Model selection and unknown-model refusal

The skill SHALL omit the `model` parameter unless the operator supplies one,
letting the server defaults govern (text-to-image `fal-ai/flux/schnell`,
image-edit `fal-ai/nano-banana/edit`). An operator-supplied fal model id SHALL be
passed through unchanged. Known families are `fal-ai/flux*`, `fal-ai/nano-banana*`,
and `fal-ai/imagen4*`; a model outside them is refused by the server as
`invalid_input` **before any provider call**, so no credits are spent. On that
refusal the skill SHALL report it plainly and STOP, and MUST NOT guess a
substitute model.

#### Scenario: No model supplied

- **WHEN** the operator invokes `/ssc.image` without a `model`
- **THEN** the skill omits `model` from every generate call and the server default governs

#### Scenario: Operator-supplied model passed through

- **WHEN** the operator supplies `model: fal-ai/imagen4/preview`
- **THEN** the skill passes that id unchanged to the generate call for the active layer

#### Scenario: Unknown model refused before any spend

- **WHEN** the operator supplies a model id outside the known families and the server returns `invalid_input`
- **THEN** the skill STOPS, reports (in Vietnamese) that the model id is not accepted and that no credits were spent, and does not retry with a substituted model

### Requirement: Error surface — every server error stops with the next action

Every typed server error SHALL stop the run and be reported to the operator in
Vietnamese, naming the unmet condition and the exact next action. The skill MUST
NOT retry around an error with different arguments, MUST NOT fall back to a
third-party image API, and MUST NOT silently skip a layer. The handled errors are
`brief_not_found`, `brief_not_approved`, `idea_not_approved`,
`background_not_approved`, `stale_background_ref`, `scene_not_approved`,
`product_not_approved`, `prompt_not_found`, `stale_version`, `invalid_input`, and
`forbidden`. The single exception to "no retry" is `stale_background_ref`: the
skill SHALL re-read `list_creatives(brief_id)` **once** and retry with the fresh
approved background id; a second failure STOPs.

#### Scenario: Stale background reference is re-listed once

- **WHEN** `generate_model` returns `stale_background_ref`
- **THEN** the skill re-reads `list_creatives(brief_id)` once, retries with the currently-approved `background_creative_id`, and STOPS if that retry also fails

#### Scenario: Insufficient role on a generate tool

- **WHEN** a generate/compose call is refused with `forbidden` (or an `insufficient role` refusal)
- **THEN** the skill STOPS, tells the operator in Vietnamese that their BrandOS account cannot generate and that an admin must grant the role, reports that nothing was written, and does not retry or work around the refusal

#### Scenario: Never falls back to a third-party engine

- **WHEN** any BrandOS generate/compose call fails for any reason
- **THEN** the skill calls no third-party image-provider API and produces no image outside the BrandOS surface

#### Scenario: Concurrent prompt edit

- **WHEN** a generate call returns `stale_version` for the layer's prompt row
- **THEN** the skill STOPS and tells the operator to re-run, having re-read `list_creative_prompts`, and generates nothing

## MODIFIED Requirements

### Requirement: Command entry point `/ssc.image`

The plugin SHALL provide a `/ssc.image` command as a thin entry point that
holds no orchestration logic. It SHALL accept an approved ad concept's
`idea_id` **and** the chosen approved angle `brief_id` (both required), and
dispatch the `ssc-image` skill for that concept and brief. If either `idea_id`
or `brief_id` is missing it SHALL ask the operator for whichever is missing
and MUST NOT invent one.

The command SHALL additionally accept these optional arguments and pass them
through unchanged: `revise: <note>` (a free-text revision note for the active
layer), `model` (a fal model id), `layout_hint` and `hard_paste` (composite layer
only), and `period` (`YYYY-MM`, informational — used only when pointing the
operator at `/ad/[month]/[id]`). It SHALL NOT accept `uploaded_media_id` /
`uploaded_media_ref`, and SHALL NOT accept or resolve an `image_content_id`.

#### Scenario: Dispatch with a valid idea id and brief id

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id>` for an approved ad concept and its chosen approved angle brief
- **THEN** the command dispatches the `ssc-image` skill for that `idea_id` and `brief_id` and performs no content work itself

#### Scenario: Missing idea id or brief id

- **WHEN** the operator runs `/ssc.image` with `idea_id` or `brief_id` missing
- **THEN** the command asks the operator for whichever is missing and does not dispatch until both are supplied

#### Scenario: Optional arguments passed through

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id> revise: ánh sáng ấm hơn`
- **THEN** the command dispatches `ssc-image` with the revision note passed through unchanged and performs no content work itself

### Requirement: State-driven per-layer stepper

The skill SHALL run as a state-driven, per-layer stepper over the strict chain
`background → model → product → composite`, each layer gated on the previous
being approved. On each invocation it SHALL read the **brief's** creative assets
(`list_creatives(brief_id)`) grouped by `layer` and `status`, compute
`approved(L)` and `has_drafts(L)` per layer, work only the first layer without an
approved creative, save DRAFT creative(s), and STOP. A layer SHALL run only when
every earlier layer has at least one approved creative. The chain is anchored on
`brief_id` alone — the skill SHALL NOT resolve or key on any `image_content_id`.

#### Scenario: First run produces the background layer

- **WHEN** the brief has no approved creative in any layer
- **THEN** the skill works the `background` layer and STOPS after saving its drafts

#### Scenario: Advance to the next layer after approval

- **WHEN** the `background` layer has an approved creative and the `model` layer does not
- **THEN** the skill works the `model` layer (not `background`)

#### Scenario: Pending drafts block a second batch

- **WHEN** the active layer already has DRAFT creatives but none approved, and no `revise` note was supplied
- **THEN** the skill STOPS and asks the operator to approve one (or discard) in the dashboard, without producing a second batch

#### Scenario: All layers approved

- **WHEN** all four layers have an approved creative
- **THEN** the skill reports visual production complete for that angle brief and produces nothing further

### Requirement: Background layer generation

For the `background` layer the skill SHALL issue exactly **3 separate**
`generate_background(brief_id, prompt, model?)` calls, each carrying a **distinct**
full scene prompt — three genuine readings of the same angle (different setting /
time-of-day / staging), not three re-rolls of one prompt. There is no `n`
parameter and no `prompt_hints` parameter. Each call returns one DRAFT creative
tagged `layer='background'` plus its saved prompt row; after the third the skill
SHALL STOP so the operator can approve one. Each prompt SHALL reserve, in the
positive, both the later-overlaid text zone and the open subject zone the model
layer will occupy.

#### Scenario: Three distinct background readings

- **WHEN** the `background` layer is active
- **THEN** the skill makes three separate `generate_background(brief_id, prompt)` calls with three different scene prompts, saving three DRAFT creatives tagged `layer='background'`, and STOPS

#### Scenario: Subject and text zones reserved positively

- **WHEN** the skill authors a background prompt
- **THEN** the prompt describes the text zone and the subject zone as positively-stated clean, evenly-lit surfaces, and passes no `prompt_hints` and no `n`

### Requirement: Model layer generated into the background, one at a time

For the `model` layer the skill SHALL generate exactly ONE model candidate per
invocation via `generate_model(brief_id, prompt, background_creative_id, model?)`,
conditioned on the **currently-approved** background creative resolved from
`list_creatives(brief_id)`. `prompt` is required and the skill authors it in full:
it places the persona's woman into the open subject zone, matching the
background's light, perspective, and palette. The candidate SHALL be saved as a
single DRAFT creative tagged `layer='model'`. `generate_model` is
**generated-only** — the skill SHALL NOT pass `uploaded_media_id` /
`uploaded_media_ref` (placing a real model photo is a dashboard action). If an
unapproved model draft is still pending and no `revise` note was supplied, the
skill MUST STOP and ask the operator to approve or discard it before generating
the next candidate (one candidate in flight at a time).

#### Scenario: Single background-conditioned candidate

- **WHEN** the `model` layer is active and no model draft is pending
- **THEN** the skill makes exactly one `generate_model(brief_id, prompt, background_creative_id)` call using the currently-approved background creative id, and saves a single DRAFT creative tagged `layer='model'`

#### Scenario: Stale background id rejected

- **WHEN** `generate_model` is called with a `background_creative_id` that is not the current approved background and the server returns `stale_background_ref`
- **THEN** the skill re-reads `list_creatives(brief_id)` once and retries with the fresh id, STOPPING if the retry also fails

#### Scenario: No uploaded-real-model path

- **WHEN** the operator wants a real model photograph in the scene
- **THEN** the skill STOPS and tells the operator that placing an uploaded model photo is a dashboard action, and it never passes `uploaded_media_id` / `uploaded_media_ref` to `generate_model`

#### Scenario: Pending model candidate blocks a new one

- **WHEN** a model draft is still pending (not approved, not discarded), the operator re-invokes, and no `revise` note is supplied
- **THEN** the skill STOPS and asks the operator to approve or discard it first, generating no new candidate

### Requirement: Product layer is upload-only

For the `product` layer the skill SHALL NOT generate the product **and SHALL NOT
upload it** — `upload_product_creative` is deliberately absent from its declared
tools. The product must be the real packaging photograph. If no approved product
creative exists for the brief, the skill MUST STOP and ask the operator (in
Vietnamese) to upload the real product photo and approve it in `/ad/[month]/[id]`,
then re-run.

#### Scenario: No product asset uploaded

- **WHEN** the `product` layer is active and no approved product creative exists
- **THEN** the skill STOPS and asks the operator to upload and approve the real product image in the dashboard, generating no product image and brokering no upload itself

### Requirement: Composite layer with optional product hard-paste

For the `composite` layer the skill SHALL issue exactly **ONE**
`compose_ad_visual(brief_id, prompt, scene_creative_id, product_creative_id,
layout_hint?, hard_paste?, model?)` call. **Both creative ids are required and the
skill supplies them**, resolved from `list_creatives(brief_id)`:
`scene_creative_id` = the currently-approved `model`-layer creative;
`product_creative_id` = the approved `product` creative. `layout_hint` and
`hard_paste` are engine-request fields and SHALL NEVER be written into the prompt
body. The skill authors the full composite `prompt`; there is no `n` parameter and
no `prompt_hints`. The result SHALL be saved as a single DRAFT creative tagged
`layer='composite'`, leaving the standing reserved text zone intact, after which
the skill STOPS. An approved composite is the final visual.

#### Scenario: One composite naming both approved inputs

- **WHEN** the `composite` layer is active with approved background, model, and product
- **THEN** the skill makes exactly one `compose_ad_visual` call naming both the approved `scene_creative_id` and the approved `product_creative_id` resolved from `list_creatives`, and saves one DRAFT creative tagged `layer='composite'`

#### Scenario: Operator requests packaging hard-paste

- **WHEN** the operator requests pixel-exact packaging for the concept
- **THEN** the skill passes `hard_paste` as an engine-request field on the `compose_ad_visual` call, and the prompt body mentions neither `hard_paste` nor `layout_hint`

#### Scenario: Missing approved scene or product

- **WHEN** the composite is attempted and the server returns `scene_not_approved` or `product_not_approved`
- **THEN** the skill STOPS and tells the operator (in Vietnamese) which upstream layer still needs approval, generating no composite

### Requirement: Single MCP surface and tool existence

The skill SHALL reference only BrandOS MCP tools on the `ssc` surface and MUST
NOT call third-party image APIs directly. Its declared frontmatter `tools:` SHALL
be exactly `[get_idea, list_briefs, list_post_content, get_knowledge,
list_creatives, list_creative_prompts, generate_background, generate_model,
compose_ad_visual]` — every one of which exists on the BrandOS `ssc` surface, with
the creative reads (`list_creatives`, `list_creative_prompts`) and the three
generate/compose writes all keyed on `brief_id`. The list SHALL NOT contain
`save_creative_prompt` (the generate tools persist the prompt row themselves,
including on the revise path), `upload_product_creative` (a dashboard action),
`approve`, `edit`, `set_cover`, `reorder_gallery`, any publish tool, or
`update_budget`.

#### Scenario: Only BrandOS tools referenced

- **WHEN** the skill invokes image generation or composition
- **THEN** it calls BrandOS MCP tools (`mcp__ssc__…`) and never a third-party provider API directly

#### Scenario: Creative reads and writes are brief-keyed

- **WHEN** the skill reads chain state or issues a generate/compose call
- **THEN** every such call keys on `brief_id`, and no call passes an `image_content_id`

#### Scenario: Frontmatter tool surface

- **WHEN** the skill's frontmatter `tools:` list is inspected
- **THEN** it contains `list_creative_prompts`, `generate_background`, `generate_model`, and `compose_ad_visual`, and contains none of `save_creative_prompt`, `upload_product_creative`, `approve`, `edit`, `set_cover`, `reorder_gallery`, or `update_budget`

## REMOVED Requirements

### Requirement: Concept, angle brief, and variant gate

**Reason**: The gate required an approved `image_content` variant (the
`image_content_id` anchor) before any visual could be produced. `image_content` is
the on-image overlay text the dashboard applies over the *finished* visual at a
later stage — gating visual production on it inverts the pipeline, and the server
has removed `image_content_id` from the creative surface entirely (the chain is
now keyed on `brief_id`).

**Migration**: Replaced by the ADDED requirement "Concept, angle brief, and
approved-copy gate", which keeps the ad-channel, concept-approved, and
brief-approved gates verbatim and substitutes an **approved `copy` row for the
brief** for the removed `image_content` variant gate. Operators whose concept
previously stopped at "approve the image_content text first" now approve a `copy`
via `/ssc.ads-produce <idea_id> <brief_id> copy`; the `image_content` text section
continues to be produced by `/ssc.ads-produce` and overlaid by the dashboard,
independently of `/ssc.image`.
