## ADDED Requirements

### Requirement: Brief-keyed command entry point
The plugin SHALL provide a thin command `/ssc.image-prompt <brief_id>` that holds no
orchestration logic and dispatches `ssc-image-prompt-agent`. `brief_id` SHALL be the
sole required input; the owning idea SHALL be resolved from the brief via `get_brief`
(never passed in). The command SHALL accept optional `stage` and `revise:` arguments.

#### Scenario: Dispatch with a brief id
- **WHEN** an operator runs `/ssc.image-prompt <brief_id>`
- **THEN** the command dispatches `ssc-image-prompt-agent` with that `brief_id`, resolving the idea from the brief, and performs no content work itself

#### Scenario: Missing brief id
- **WHEN** an operator runs `/ssc.image-prompt` with no `brief_id`
- **THEN** the command asks the operator for the `brief_id` and invents nothing

### Requirement: Precondition gating
The agent SHALL resolve `get_brief(brief_id) → { brief, idea }` and gate before doing
any work: the idea MUST be `channel='ad'` and `status='approved'`, and the brief MUST
be `status='approved'`. On any failed gate the agent SHALL STOP with a Vietnamese
message routing the operator to the correct prior step and SHALL write nothing.

#### Scenario: Non-ad idea
- **WHEN** the resolved idea has `channel !== 'ad'`
- **THEN** the agent STOPs (Vietnamese) explaining the prompt flow currently runs only for ad concepts, and writes nothing

#### Scenario: Unapproved brief
- **WHEN** the resolved brief has `status !== 'approved'`
- **THEN** the agent STOPs (Vietnamese) asking the operator to approve an angle brief first, and writes nothing

### Requirement: Next-open-stage state machine
The agent SHALL be a state-driven stepper over the ordered stages
`[background, subject, model, composite, text]`. On each invocation it SHALL resolve
studio state from `list_creatives`, `list_creative_prompts`, and `list_content`, work
the single next-open stage (the first stage with no selected-for-next / `approved`
candidate), and STOP. It SHALL NOT advance more than one stage per invocation and
SHALL NOT generate.

#### Scenario: Author the first open stage
- **WHEN** the next-open stage has no saved prompt yet
- **THEN** the agent authors that stage's prompt + `generation_config`, saves it via `save_creative_prompt`, and STOPs telling the operator to Generate in the studio

#### Scenario: Wait at a human gate
- **WHEN** the next-open stage already has a saved prompt but no generated/selected candidate, and no `revise:` was given
- **THEN** the agent STOPs asking the operator to Generate + select a candidate in the ImageStudio, and writes nothing

#### Scenario: All stages complete
- **WHEN** every stage has a selected-for-next candidate
- **THEN** the agent STOPs reporting the pipeline is complete for the brief and defers hero/export choices to the operator's studio actions

### Requirement: Studio-layer mapping
The five stage-skills SHALL map to the ImageStudio layers exactly: `background`
skill → `layer:'background'`; `subject` skill → `layer:'subject'`; `scene` skill →
`layer:'model'`; `composite` skill → `layer:'composite'`; `text` skill →
`layer:'text'`. The `scene` skill (studio label "Scene") SHALL persist
`save_creative_prompt(layer:'model')`. No skill SHALL save a prompt with
`layer:'product'` — the product is an upload-only input, not a prompt stage.

#### Scenario: Scene persists the model layer
- **WHEN** the `scene` stage authors its composition prompt
- **THEN** it calls `save_creative_prompt` with `layer:'model'` (never `'scene'`)

#### Scenario: Product is never a prompt layer
- **WHEN** any stage runs
- **THEN** no stage calls `save_creative_prompt` with `layer:'product'`

### Requirement: Full generation_config authoring
Each stage SHALL author the scene `body` prompt PLUS a `generation_config` carrying
the chosen model id and only the capability inputs the chosen model's profile
declares (`controlType`, `controlSourceRef`, `identityRef`, `conditioningScales`,
`idWeight`). A reference id SHALL be named only when resolvable from
`list_gallery_media`; otherwise the stage SHALL author `body` + `model`, leave the
reference unset, and say so plainly.

#### Scenario: Capability-matched settings
- **WHEN** a stage selects a plain text-to-image model
- **THEN** its `generation_config` sets `model` and omits `controlType` / `identityRef` / control-only fields

#### Scenario: Unresolvable reference
- **WHEN** an identity/control reference cannot be resolved from the gallery pool
- **THEN** the stage saves `body` + `model` without that reference and notes to the operator to attach it in the studio

### Requirement: Subject stage generates the person alone, coherent with the background
The `subject` stage SHALL author a prompt for the persona's person generated ALONE on
a simple ground, with the person's face and pose locked at this stage — selecting an
identity model (`fal-ai/flux-pulid` or `fal-ai/flux-general`) with `identityRef` +
`idWeight` when a real-model photo is in the pool, else a text-to-image model with a
persona-described person. The person's outfit, wardrobe, styling, palette, and light
SHALL be made coherent with the selected `background` (read from its scene prompt) so
the Scene step composes as one photograph.

#### Scenario: Face locked with an identity reference
- **WHEN** a real-model photo is present in the gallery pool for the brief
- **THEN** the `subject` stage sets `model` to an identity model and names `identityRef` + `idWeight`

#### Scenario: Outfit suited to the background
- **WHEN** the `subject` stage authors its prompt and a background is already selected
- **THEN** the prompt's outfit / wardrobe / palette / light are described to match the selected background's scene

### Requirement: Scene stage composition dependency
The `scene` stage (`layer:'model'`) SHALL require both a selected `background` and a
selected `subject` before it authors its reference-edit prompt, and SHALL name both as
reference inputs. It SHALL use the reference-edit model (`fal-ai/flux-pro/kontext`).

#### Scenario: Both parents selected
- **WHEN** a background and a subject are both selected-for-next
- **THEN** the `scene` stage authors a Kontext reference-edit prompt composing the subject into the background and names both references

### Requirement: Composite stage requires a product packshot
The `composite` stage SHALL require a selected `model` (Scene) candidate and a product
packshot present in the gallery pool. With no product packshot it SHALL STOP and ask
the operator to upload the real packshot, writing nothing.

#### Scenario: No product packshot
- **WHEN** the `composite` stage runs and no product packshot is in the pool
- **THEN** the agent STOPs (Vietnamese) asking the operator to upload the real product packshot, and writes nothing

### Requirement: Text stage renders the exact approved headline
The `text` stage SHALL require a selected `composite` candidate and an approved
`image_content` / headline. It SHALL author a text-placement prompt carrying the EXACT
approved Vietnamese headline string targeting the reserved zone, selecting
`fal-ai/ideogram/v3` or the deterministic `overlay` pseudo-model. With no approved
headline it SHALL STOP and route the operator to `/ssc.ads-produce <brief_id> image_content`.

#### Scenario: Exact headline carried
- **WHEN** the `text` stage runs with an approved headline available
- **THEN** its prompt carries the verbatim Vietnamese headline string as the text-render input

#### Scenario: No approved headline
- **WHEN** the `text` stage runs and no approved `image_content` / headline exists
- **THEN** the agent STOPs routing the operator to `/ssc.ads-produce <brief_id> image_content`, and writes nothing

### Requirement: Propose-only, zero-credit governance
The agent and every stage-skill SHALL hold only read tools plus `save_creative_prompt`.
They SHALL NOT hold or call any generate tool (`generate_*`, `compose_ad_visual`,
`generate_text_layer`), `approve` / `unapprove`, `upload_creative` /
`confirm_creative_upload` / `select_gallery_creative`, `set_cover`, `reorder_gallery`,
any publish tool, or `update_budget`. Saving a prompt SHALL NOT approve anything and
SHALL spend no credits.

#### Scenario: No generation tool present
- **WHEN** the agent or a stage-skill frontmatter `tools:` list is read
- **THEN** it contains reads + `save_creative_prompt` only and no generate/approve/upload/select/cover/budget/publish tool

#### Scenario: Generation stays human
- **WHEN** a stage's prompt is saved
- **THEN** no image is generated and no candidate is approved by the agent — generation and selection remain human studio actions

### Requirement: Prompt discipline (no negatives, positive reservation)
Every authored prompt for stages 1–4 SHALL describe only the scene and SHALL NOT name
any copy / headline / overlay string in any form (quoted, paraphrased, or negated).
Prompts SHALL NOT use negation to exclude elements; reserved space (text zone, and on
`background` the subject zone) SHALL be described as what it positively is. Stages 1–4
SHALL bake in no text. Stage 5 (text) is the sole exception and carries the exact
headline string.

#### Scenario: Positive space reservation
- **WHEN** a background prompt reserves the text or subject zone
- **THEN** it describes the zone as a positive surface (e.g. "a smooth, evenly-lit cream plaster wall") and never as "no text" or "leave room for the headline"

#### Scenario: Copy never named in stages 1–4
- **WHEN** any of the background / subject / scene / composite stages authors a prompt
- **THEN** the prompt describes the scene the copy implies and names no copy, headline, or overlay string

### Requirement: Revise handling
When `revise: <note>` is supplied, the agent SHALL apply it to the active stage's
prompt — rewriting the saved prompt (with `expected_version` for optimistic
concurrency) and re-saving — and SHALL never drop the note, never change which stage
is active, and never generate.

#### Scenario: Revise the active stage
- **WHEN** `revise:` is supplied and the active stage has a saved prompt
- **THEN** the agent rewrites that stage's prompt, saves it with `expected_version`, and STOPs without generating

### Requirement: Coexistence with the existing ssc.image command
This pipeline SHALL be added alongside the existing `/ssc.image` command and SHALL NOT
modify or remove it. The new command's frontmatter description SHALL state that it is
the propose-only, zero-credit sibling so operators can pick deliberately.

#### Scenario: Existing command untouched
- **WHEN** this change is applied
- **THEN** `/ssc.image` and the `ssc-image` skill remain unchanged and the new command declares itself the propose-only sibling

### Requirement: Deployment-dependency safe stop
The skill SHALL STOP cleanly with a Vietnamese message and write nothing when the
deployed BrandOS server rejects a `save_creative_prompt` layer it relies on (e.g.
`subject` not yet live), asking an admin to deploy the newer server, and SHALL NOT
retry in a loop.

#### Scenario: Layer not yet deployed
- **WHEN** `save_creative_prompt(layer:'subject')` is rejected by the deployed server
- **THEN** the skill STOPs (Vietnamese) explaining the server does not yet support the layer, writes nothing, and does not retry

### Requirement: Vietnamese operator-facing prose
All operator-facing chat and persisted Vietnamese notes SHALL be Vietnamese. Image
prompt `body` values are free-form (English is acceptable for the engines) EXCEPT the
stage-5 headline string, which SHALL be the exact Vietnamese approved headline.

#### Scenario: Vietnamese stop messages
- **WHEN** any skill or the agent STOPs and addresses the operator
- **THEN** the message is in Vietnamese
