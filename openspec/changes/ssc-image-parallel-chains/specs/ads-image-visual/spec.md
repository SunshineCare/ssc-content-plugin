## ADDED Requirements

### Requirement: Chain resolution from creative lineage

The skill SHALL resolve a brief's creative rows into **N parallel visual chains**
before deciding anything about state. From the `list_creatives(brief_id)` result it
SHALL group rows by the lineage each row already carries — no server-side `chain_id`
exists and none is needed:

1. Every **approved `background`** creative is a **chain ROOT**, and its creative id
   IS the chain id. A `background` row that is not approved is a **candidate root**
   inside no chain yet — approval is the act that curates it into one.
2. A `model` creative belongs to the chain named by its `background_creative_id`.
3. A `composite` creative belongs to the chain of its `scene_creative_id` — that
   scene is an approved `model`-layer creative, whose own `background_creative_id`
   names the root.
4. A `product` creative has **no lineage parent**: products are uploaded per BRIEF
   (`upload_product_creative(brief_id, …)`), so they are **brief-level** and shared
   by every chain. They belong to no chain.

The skill MUST NOT assume a brief has only one chain, MUST NOT compute
`approved(layer)` or `has_drafts(layer)` across the whole brief, and MUST NOT treat
"a layer has an approved creative" as "the chain has advanced". A creative whose
lineage parent is absent or does not resolve to a chain root is **unassignable**: the
skill SHALL report it and STOP rather than defaulting it into any chain.

#### Scenario: Two approved backgrounds resolve to two chains

- **WHEN** `list_creatives(brief_id)` returns two `background` creatives with `status='approved'`
- **THEN** the skill resolves TWO chains, each rooted at one of those background creative ids, and assigns every `model` row to the chain named by its `background_creative_id` and every `composite` row to the chain of its `scene_creative_id`

#### Scenario: A layer legitimately holds several approved creatives

- **WHEN** two chains of the same brief each hold an approved `model` creative
- **THEN** the skill treats that as normal (one approved creative per chain), and it does NOT conclude from "the `model` layer has an approved creative" that any particular chain has a model

#### Scenario: Products are brief-level, not chain members

- **WHEN** the skill groups the brief's creatives into chains
- **THEN** `product` creatives are held as brief-level assets belonging to no chain, and are not used to decide any chain's state

#### Scenario: Unassignable creative

- **WHEN** a `model` or `composite` creative's lineage parent is missing or names a creative that is not an approved chain root of this brief
- **THEN** the skill reports that row as unassignable and STOPS, and it does NOT default it into a chain

### Requirement: Chain selection and the ambiguity STOP

The skill SHALL accept an optional `chain: <background_creative_id>` input naming the
**approved background** that roots the chain to advance, and SHALL select the chain to
work by this rule:

1. **No approved `background` at all** → there is no chain yet; the active layer is
   `background` (chain CREATION), and `chain` is not required.
2. **Exactly ONE approved `background` and no `chain` argument** → that chain is the
   target. It is unambiguous; the skill SHALL resolve it and MUST NOT ask.
3. **MORE THAN ONE approved `background` and no `chain` argument** → the skill MUST
   **STOP and ASK**. It SHALL list every chain — the root `background` creative id, a
   one-line gist of that background's `generation_prompt`, and how far that chain has
   got (does it have a model? a composite?) — and ask the operator which chain to
   advance. It MUST NOT pick one silently, by recency or by any other heuristic, and
   it MUST generate nothing and spend no generation credits on that run.
4. **An explicit `chain` that is not an APPROVED `background` creative of this brief**
   → the skill MUST STOP with an `invalid_input`-style message naming the valid chain
   roots, and generate nothing.

Once selected, the chain is the scope of the entire run: every subsequent gate, layer
procedure, and revise action operates inside it.

#### Scenario: One chain — selected without asking

- **WHEN** the brief has exactly one approved `background` and the operator supplies no `chain`
- **THEN** the skill selects that chain silently (it is unambiguous) and works its next open layer

#### Scenario: Several chains and no chain argument — STOP and ask

- **WHEN** the brief has two or more approved `background` creatives and the operator supplies no `chain`
- **THEN** the skill STOPS, lists each chain (root background creative id, a one-line gist of its `generation_prompt`, and whether it already has a model / a composite), asks the operator which chain to advance, and generates nothing — it MUST NOT pick the newest or any other default

#### Scenario: Invalid chain argument

- **WHEN** the operator supplies `chain: <id>` where `<id>` is not an approved `background` creative of this brief (a draft background, a creative of another layer, or an unknown id)
- **THEN** the skill STOPS, names the brief's valid chain roots, and generates nothing

#### Scenario: No chain exists yet

- **WHEN** the brief has no approved `background` creative
- **THEN** the skill does not ask for a `chain`, works the `background` layer as chain creation, and STOPS for approval

### Requirement: Per-chain creative status accounting

Within the selected chain the skill SHALL compute state from the three creative
statuses the server uses — `draft`, `approved`, and `discarded`:

- `approved(L)` — ≥1 creative in **this chain** with `layer=L` and `status='approved'`;
- `has_drafts(L)` — ≥1 creative in **this chain** with `layer=L` and `status='draft'`,
  **and nothing else**.

A `status='discarded'` row is **ignored entirely**: it is NOT a pending draft, it does
NOT make `has_drafts(L)` true, and it does NOT block a fresh candidate — otherwise a
layer whose candidates were all discarded would STOP for approval forever with no way
out. Both predicates SHALL be evaluated **inside the selected chain only**; a draft or
an approved creative belonging to a different chain SHALL NOT affect them.

#### Scenario: A discarded creative is not a pending draft

- **WHEN** the selected chain's `model` layer holds one creative and its status is `discarded`
- **THEN** `has_drafts(model)` is false for that chain, the layer is treated as having no pending candidate, and the skill authors a fresh candidate rather than STOPPING for approval

#### Scenario: Another chain's pending draft does not block this chain

- **WHEN** the selected chain's `model` layer has no draft, while a DIFFERENT chain of the same brief has a pending `model` draft
- **THEN** the skill works the selected chain's `model` layer and is NOT blocked by the other chain's pending draft

#### Scenario: Another chain's approved creative does not advance this chain

- **WHEN** a different chain holds an approved `model` creative and the selected chain does not
- **THEN** `approved(model)` is false for the selected chain, and the skill works the selected chain's `model` layer rather than advancing it to `composite`

### Requirement: Chain completion — a chain completes, a brief never does

The skill SHALL treat a **CHAIN** as COMPLETE when it holds an approved `composite`
creative, and it MUST NEVER report the **BRIEF** as "complete": more chains can always
be started (see the `new-chain` opt-in on the background layer). When the selected
chain is complete the skill SHALL STOP, state plainly that **this chain** is complete, report how many chains
the brief now has, and offer the two real next actions — start another chain with
`new-chain`, or choose the hero image in the dashboard. The skill MUST NOT call
`set_cover`: which approved composite is the hero image is the operator's dashboard
choice, and `set_cover` MUST NOT appear in the skill's `tools:` list.

#### Scenario: Selected chain is complete

- **WHEN** the selected chain holds an approved `composite`
- **THEN** the skill STOPS, reports that THIS chain (naming its root background creative id) is complete, states how many chains the brief has, and offers `new-chain` or the dashboard's cover choice — it does NOT report the brief complete and it does NOT call `set_cover`

#### Scenario: One chain complete, another still open

- **WHEN** one chain of the brief holds an approved `composite` while another chain has only an approved background
- **THEN** the brief is not reported complete; the skill works the layer that is open in whichever chain the operator selected

## MODIFIED Requirements

### Requirement: Command entry point `/ssc.image`

The plugin SHALL provide a `/ssc.image` command as a thin entry point that
holds no orchestration logic. It SHALL accept an approved ad concept's
`idea_id` **and** the chosen approved angle `brief_id` (both required), and
dispatch the `ssc-image` skill for that concept and brief. If either `idea_id`
or `brief_id` is missing it SHALL ask the operator for whichever is missing
and MUST NOT invent one.

The command SHALL additionally accept these optional arguments and pass them
through unchanged:

- `chain: <background_creative_id>` — the approved background rooting the **chain** to
  advance (a brief carries N parallel chains);
- `new-chain` (equivalently an explicit `layer: background` selector) — mint an
  ADDITIONAL chain by generating fresh background candidates even though the brief
  already has an approved background;
- `product: <creative_id>` — which approved brief-level product to compose, for a brief
  that has several;
- `revise: <note>` — a free-text revision note for the active layer of the selected
  chain;
- `model` (a fal model id), `layout_hint` and `hard_paste` (composite layer only), and
  `period` (`YYYY-MM`, informational — used only when pointing the operator at
  `/ad/[month]/[id]`).

It SHALL NOT accept `uploaded_media_id` / `uploaded_media_ref`, and SHALL NOT accept or
resolve an `image_content_id`.

#### Scenario: Dispatch with a valid idea id and brief id

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id>` for an approved ad concept and its chosen approved angle brief
- **THEN** the command dispatches the `ssc-image` skill for that `idea_id` and `brief_id` and performs no content work itself

#### Scenario: Missing idea id or brief id

- **WHEN** the operator runs `/ssc.image` with `idea_id` or `brief_id` missing
- **THEN** the command asks the operator for whichever is missing and does not dispatch until both are supplied

#### Scenario: Optional arguments passed through

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id> revise: ánh sáng ấm hơn`
- **THEN** the command dispatches `ssc-image` with the revision note passed through unchanged and performs no content work itself

#### Scenario: Chain selector passed through

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id> chain: <background_creative_id>`
- **THEN** the command dispatches `ssc-image` with the `chain` argument passed through unchanged, and does not itself resolve chains or pick one

#### Scenario: New-chain and product selectors passed through

- **WHEN** the operator runs `/ssc.image <idea_id> <brief_id> new-chain` or `/ssc.image <idea_id> <brief_id> chain: <id> product: <creative_id>`
- **THEN** the command passes `new-chain` / `product` through unchanged to `ssc-image` and performs no content work itself

### Requirement: State-driven per-layer stepper

The skill SHALL run as a state-driven, per-layer stepper over the strict chain
`background → model → product → composite`, each layer gated on the previous
being approved **within the selected chain**. On each invocation it SHALL read the
brief's creative assets (`list_creatives(brief_id)`), resolve them into chains by
lineage, select ONE chain to work, compute `approved(L)` and `has_drafts(L)` **inside
that chain**, work only the first layer of that chain without an approved creative,
save DRAFT creative(s), and STOP. A layer SHALL run only when every earlier layer **of
that same chain** has at least one approved creative.

The skill SHALL work **exactly one layer of exactly one chain per invocation**; it MUST
NOT fan out across chains and MUST NOT advance a chain on the strength of another
chain's approved creative. The chain is anchored on `brief_id` for every tool call —
the skill SHALL NOT resolve or key on any `image_content_id` — while the STATE it
reasons over is chain-scoped.

The output summary SHALL name the chain it worked (its root background creative id) and
how many chains the brief now has, so the operator always knows which track advanced.

#### Scenario: First run produces the background layer

- **WHEN** the brief has no approved `background` creative — hence no chain
- **THEN** the skill works the `background` layer as chain creation and STOPS after saving its drafts

#### Scenario: Advance to the next layer after approval

- **WHEN** the selected chain's root `background` is approved and that chain has no approved `model`
- **THEN** the skill works that chain's `model` layer (not `background`, and not another chain's layer)

#### Scenario: Pending drafts block a second batch within the chain

- **WHEN** the active layer of the selected chain already has DRAFT creatives but none approved, and no `revise` note was supplied
- **THEN** the skill STOPS and asks the operator to approve one (or discard) in the dashboard, without producing a second batch

#### Scenario: One layer of one chain per invocation

- **WHEN** the brief has several chains with open layers
- **THEN** the skill advances only the selected chain, by exactly one layer, and reports which chain it advanced — it does not touch any other chain

#### Scenario: The summary names the chain

- **WHEN** the skill saves any layer's DRAFT creative(s)
- **THEN** its output summary names the chain worked (its root background creative id) and states how many chains the brief now has

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

**The `background` layer is CHAIN CREATION.** An **approved** background is the ROOT of
a chain, so this layer runs in exactly two situations:

1. **The brief has NO approved `background`** — there is no chain yet; the skill works
   this layer by default.
2. **The operator explicitly asks for an ADDITIONAL chain** via `new-chain` (or an
   explicit `layer: background` selector) — the skill generates 3 fresh background
   candidates for the brief **even though an approved background already exists**,
   minting a candidate root for a new parallel chain.

Absent that explicit opt-in, a brief that already has an approved `background` SHALL
NOT re-enter the `background` layer: every re-invocation would otherwise burn generation
credits minting new chain roots the operator never asked for.

#### Scenario: Three distinct background readings

- **WHEN** the `background` layer is active
- **THEN** the skill makes three separate `generate_background(brief_id, prompt)` calls with three different scene prompts, saving three DRAFT creatives tagged `layer='background'`, and STOPS

#### Scenario: Subject and text zones reserved positively

- **WHEN** the skill authors a background prompt
- **THEN** the prompt describes the text zone and the subject zone as positively-stated clean, evenly-lit surfaces, and passes no `prompt_hints` and no `n`

#### Scenario: An approved background does not re-enter the background layer

- **WHEN** the brief already has an approved `background` and the operator supplies no `new-chain` (and no explicit `layer: background`)
- **THEN** the skill does NOT generate more backgrounds; it advances the selected chain's next open layer instead, spending no credits on new chain roots

#### Scenario: Operator starts an additional chain

- **WHEN** the brief already has an approved `background` and the operator re-invokes with `new-chain`
- **THEN** the skill generates 3 fresh background candidates for the brief and STOPS for approval — approving one mints the root of an additional parallel chain

### Requirement: Model layer generated into the background, one at a time

For the `model` layer the skill SHALL generate exactly ONE model candidate per
invocation via `generate_model(brief_id, prompt, background_creative_id, model?)`,
conditioned on **the selected chain's ROOT background creative** —
`background_creative_id` = the approved background that roots the chain being worked,
resolved from `list_creatives(brief_id)`. The layer is gated on **that chain's** root
being approved, never on "some approved background of the brief". `prompt` is required
and the skill authors it in full: it places the persona's woman into the open subject
zone, matching **that background's** light, perspective, and palette. The candidate
SHALL be saved as a single DRAFT creative tagged `layer='model'`, and it belongs to the
selected chain by virtue of its `background_creative_id`. `generate_model` is
**generated-only** — the skill SHALL NOT pass `uploaded_media_id` /
`uploaded_media_ref` (placing a real model photo is a dashboard action). If an
unapproved model draft **of this chain** is still pending and no `revise` note was
supplied, the skill MUST STOP and ask the operator to approve or discard it before
generating the next candidate (one candidate in flight **per chain**); a pending model
draft of a DIFFERENT chain SHALL NOT block it.

#### Scenario: Single candidate conditioned on the chain's own root

- **WHEN** the selected chain's `model` layer is active and no model draft is pending in that chain
- **THEN** the skill makes exactly one `generate_model(brief_id, prompt, background_creative_id)` call whose `background_creative_id` is that chain's ROOT background creative id, and saves a single DRAFT creative tagged `layer='model'`

#### Scenario: The wrong chain's background is never used

- **WHEN** the brief has two approved backgrounds and the operator selected the chain rooted at the first
- **THEN** the skill conditions `generate_model` on the FIRST background's creative id, and never on the second — a "background approved somewhere in the brief" is not grounds to build a model

#### Scenario: Stale background id rejected

- **WHEN** `generate_model` is called with a `background_creative_id` the server rejects with `stale_background_ref`
- **THEN** the skill re-reads `list_creatives(brief_id)` once, re-resolves the selected chain's root, retries with that id, and STOPS if the retry also fails

#### Scenario: No uploaded-real-model path

- **WHEN** the operator wants a real model photograph in the scene
- **THEN** the skill STOPS and tells the operator that placing an uploaded model photo is a dashboard action, and it never passes `uploaded_media_id` / `uploaded_media_ref` to `generate_model`

#### Scenario: Pending model candidate blocks a new one in the same chain only

- **WHEN** a model draft of the selected chain is still pending (not approved, not discarded), the operator re-invokes, and no `revise` note is supplied
- **THEN** the skill STOPS and asks the operator to approve or discard it first, generating no new candidate — while a pending model draft belonging to a different chain would not have blocked this chain

### Requirement: Product layer is upload-only

For the `product` layer the skill SHALL NOT generate the product **and SHALL NOT
upload it** — `upload_product_creative` is deliberately absent from its declared
tools. The product must be the real packaging photograph.

The product is **BRIEF-LEVEL, not chain-scoped**: product creatives are uploaded per
brief (`upload_product_creative(brief_id, …)`), carry no lineage parent, and are shared
by every chain of the brief. The layer resolves as follows:

1. **No approved product creative for the brief** → the skill MUST STOP and ask the
   operator (in Vietnamese) to upload the real product photo and approve it in
   `/ad/[month]/[id]`, then re-run. It generates nothing and spends no credits.
2. **Exactly ONE approved product creative** → that is the product; the skill uses it
   without asking.
3. **SEVERAL approved product creatives** → the skill MUST NOT guess which packaging
   shot to compose. It SHALL accept an optional `product: <creative_id>` input naming
   the one to use; when `product` is absent and more than one product is approved, the
   skill MUST **STOP and ask which**, listing the approved products, and generate
   nothing.

A `revise` note cannot apply to this layer (the product is never generated) — the skill
SHALL say so plainly in the STOP.

#### Scenario: No product asset uploaded

- **WHEN** the `product` layer is active and no approved product creative exists for the brief
- **THEN** the skill STOPS and asks the operator to upload and approve the real product image in the dashboard, generating no product image and brokering no upload itself

#### Scenario: One approved product is used without asking

- **WHEN** the brief has exactly one approved `product` creative
- **THEN** the skill uses it as the composite's `product_creative_id` for every chain, without asking the operator to choose

#### Scenario: Several approved products and no product argument — STOP and ask

- **WHEN** the brief has more than one approved `product` creative and the operator supplied no `product: <creative_id>`
- **THEN** the skill STOPS, lists the approved products, asks the operator which to use, and generates nothing — it MUST NOT guess by recency or by any other heuristic

#### Scenario: Explicit product selector honoured

- **WHEN** the brief has several approved products and the operator supplies `product: <creative_id>` naming one of them
- **THEN** the skill composes with that product creative id, for the selected chain

### Requirement: Composite layer with optional product hard-paste

For the `composite` layer the skill SHALL issue exactly **ONE**
`compose_ad_visual(brief_id, prompt, scene_creative_id, product_creative_id,
layout_hint?, hard_paste?, model?)` call. **Both creative ids are required and the
skill supplies them**, resolved from `list_creatives(brief_id)` **within the selected
chain**:

- `scene_creative_id` = **the selected chain's** approved `model`-layer creative (that
  IS the background+model scene of this chain, and its `background_creative_id` is this
  chain's root);
- `product_creative_id` = the approved brief-level `product` creative (the single
  approved one, or the one named by the `product` input).

The skill MUST NOT compose a scene from one chain with a model or a scene from another
chain: the `scene_creative_id` SHALL always belong to the chain being worked.
`layout_hint` and `hard_paste` are engine-request fields and SHALL NEVER be written
into the prompt body. The skill authors the full composite `prompt`; there is no `n`
parameter and no `prompt_hints`. The result SHALL be saved as a single DRAFT creative
tagged `layer='composite'`, leaving the standing reserved text zone intact, after which
the skill STOPS. An approved composite **completes that chain** — it does not complete
the brief, and it does not make that composite the hero image (`set_cover` is the
operator's dashboard choice, and the skill never calls it). A pending composite draft
**of this chain** with no `revise` note STOPs; a pending composite of a different chain
does not block this one.

#### Scenario: One composite naming this chain's scene and the approved product

- **WHEN** the selected chain's `composite` layer is active with that chain's background and model approved and one approved brief-level product
- **THEN** the skill makes exactly one `compose_ad_visual` call whose `scene_creative_id` is THAT chain's approved `model` creative and whose `product_creative_id` is the approved product, and saves one DRAFT creative tagged `layer='composite'`

#### Scenario: Never composes across chains

- **WHEN** the brief has two chains, each with an approved `model` creative
- **THEN** the skill passes only the selected chain's approved model as `scene_creative_id`, and never the other chain's model

#### Scenario: Operator requests packaging hard-paste

- **WHEN** the operator requests pixel-exact packaging for the concept
- **THEN** the skill passes `hard_paste` as an engine-request field on the `compose_ad_visual` call, and the prompt body mentions neither `hard_paste` nor `layout_hint`

#### Scenario: Missing approved scene or product

- **WHEN** the composite is attempted and the server returns `scene_not_approved` or `product_not_approved`
- **THEN** the skill STOPS and tells the operator (in Vietnamese) which upstream layer still needs approval, generating no composite — it does not retry with another chain's creative

#### Scenario: An approved composite completes the chain, not the brief

- **WHEN** the composite of the selected chain is approved
- **THEN** the skill reports THAT chain complete, reports how many chains the brief has, and never calls `set_cover`

### Requirement: Operator revise path

The skill SHALL accept an optional `revise: <note>` argument. It always applies to the
**active layer of the SELECTED CHAIN** and never changes which layer or which chain is
active. A layer of the selected chain with pending, unapproved drafts normally STOPs;
with a revision note the skill SHALL instead take that chain's pending drafts'
`generation_prompt` (from `list_creatives`, which is per-row and carries the lineage
that identifies the chain) as the authoritative base, **rewrite** it applying the
operator's note (still obeying the prompt rules), and issue exactly ONE generate call
for that same layer of that same chain with the rewritten prompt — never a fresh batch,
even on `background`. The skill SHALL NOT re-issue the unchanged prompt (a blind
re-roll), and SHALL NOT call `save_creative_prompt` — the generate tool persists the
revised prompt row itself.

`list_creative_prompts(brief_id)` MAY be read as supporting context, but it returns at
most one active prompt row **per layer for the whole brief** — it is brief-level and
shared across chains, so on a multi-chain brief it may hold another chain's prompt. It
SHALL NOT be used as the rewrite base when it does not correspond to the selected
chain's pending draft.

#### Scenario: Revise rewrites the selected chain's prompt and generates one candidate

- **WHEN** the selected chain's `background` layer has pending unapproved drafts and the operator re-invokes with `chain: <id> revise: ánh sáng ấm hơn, đặt trong bếp thay vì phòng khách`
- **THEN** the skill takes that chain's pending drafts' `generation_prompt` as the base, rewrites it to a warm-lit kitchen scene, and issues exactly one `generate_background` call with the rewritten prompt

#### Scenario: Revise never re-rolls the same prompt

- **WHEN** the skill acts on a `revise` note
- **THEN** the prompt it sends differs from the base prompt by the operator's correction, and it calls no `save_creative_prompt`

#### Scenario: Revise never crosses chains

- **WHEN** the brief has several chains and the brief-level prompt row for the active layer belongs to a chain other than the selected one
- **THEN** the skill bases the rewrite on the SELECTED chain's pending draft `generation_prompt`, not on that prompt row, and the fresh candidate it generates belongs to the selected chain

#### Scenario: No revise note leaves the STOP intact

- **WHEN** the selected chain's active layer has pending unapproved drafts and no `revise` note is supplied
- **THEN** the skill STOPS and asks the operator to approve or discard in the dashboard, generating nothing

#### Scenario: No prompt to revise

- **WHEN** a `revise` note was supplied, the selected chain's active layer has pending drafts, and no prompt is recoverable for them (neither a draft `generation_prompt` nor a corresponding prompt row)
- **THEN** the skill STOPS with `prompt_not_found`, reports it in Vietnamese, and generates nothing
