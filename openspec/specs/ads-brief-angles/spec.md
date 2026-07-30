# ads-brief-angles

## Purpose

The `ssc-ads-brief` skill's contract: for ONE approved ad concept (subject), produce
distinct, rated, DRAFT creative-brief ANGLES — the FIRST step of brief-first ad
production, run BEFORE any copy exists. Each angle is anchored to a distinct
persona trigger / objection / myth from that persona's live KB detail doc, carries
the five narrative fields plus a mandatory Vietnamese `angle_label`, and persists as
its own DRAFT `brief` row via `save_brief`. Propose-only: a human approves the
angles worth producing, and each approved angle anchors its own production run.

## Requirements

### Requirement: Produce rated draft angle briefs

The skill SHALL, for ONE approved ad concept (no copy precondition — it runs before
any copy), produce up to five distinct creative-brief angles and persist each as
a DRAFT brief via `save_brief` (`channel='ad'`, `idea_id`, the five narrative fields,
`angle_label`, `score`, `comment`), then STOP. It SHALL never mint an approved brief.

#### Scenario: Successful production of a rated angle set
- **WHEN** the concept is `status='approved'`, `channel='ad'`, and no briefs exist yet
- **THEN** the skill saves 4-5 distinct angles as DRAFT briefs via `save_brief` and stops without approving anything

#### Scenario: Fewer distinct angles than four
- **WHEN** the concept genuinely supports fewer than four distinct angles
- **THEN** the skill produces only as many angles as are genuine, never fabricating a padding angle, and reports the reduced count in its summary

### Requirement: Mandatory distinct angle label

Every angle SHALL carry a short Vietnamese `angle_label` naming that angle's
persona trigger / objection / myth, and every `angle_label` in a run SHALL be
distinct from the others. The label SHALL always be passed to `save_brief`.

#### Scenario: Each saved angle carries a distinct label
- **WHEN** the skill saves the angle set
- **THEN** each `save_brief` call includes a non-empty Vietnamese `angle_label`, and no two angles in the set share the same label

### Requirement: Persona-anchored angle differentiation

Each angle SHALL anchor to a DISTINCT ranked trigger point, stated objection, or
myth drawn from the persona detail doc, expressed through the concept
(`title`/`tags`/`ad_notes` + `build_spec`) — not through approved copy (there is
none yet). No two angles in a run SHALL share the same trigger/objection/myth.

#### Scenario: Two angles never share an anchor
- **WHEN** the skill selects the angle set from the persona detail doc
- **THEN** each angle is anchored to a different trigger/objection/myth than every other angle in the set

### Requirement: Quality gate with drop-and-regenerate

The skill SHALL self-score each angle 1-5 with a one-line Vietnamese comment on
brief-relevant criteria (distinctiveness, grounding, strategic sharpness,
authenticity), and SHALL drop and regenerate any angle scored ≤3 until every angle
in the set is ≥4. Only angles scored ≥4 SHALL be saved.

#### Scenario: A weak angle is regenerated before saving
- **WHEN** an angle self-scores ≤3
- **THEN** the skill drops and regenerates it, and only angles scored ≥4 are persisted via `save_brief`

### Requirement: No copy precondition (brief-first)

The skill SHALL run BEFORE any copy exists and SHALL NOT require or read approved
`copy`. Angles SHALL be derived from the concept (`title`/`tags`/`ad_notes`) +
`build_spec` + the persona detail doc — the material the copy is later written from.

#### Scenario: Runs with no copy present
- **WHEN** the concept is approved and has no `copy` rows at all
- **THEN** the skill still produces the angle set from the concept + persona, calling no copy-listing tool and no copy gate

### Requirement: Existing-brief read before any write

Before any write, the skill SHALL call `list_briefs` for the concept and treat every
returned brief — any status — as the taken set, so no newly produced angle duplicates
an angle already on the concept.

#### Scenario: Briefs already exist
- **WHEN** `list_briefs` returns ≥1 brief for the concept
- **THEN** the skill produces only the angles that genuinely remain available, and an empty result is an ordinary successful outcome

### Requirement: Propose-only governance

The skill SHALL be propose-only. It SHALL never call `approve` (any entity,
including `brief`), never un-approve, never touch an APPROVED brief, never write the
narrative fields onto the `ideas` row (they live on `briefs`), never call any
publish/schedule tool, and never flip a gate.

#### Scenario: Only draft writes occur
- **WHEN** the skill runs to completion
- **THEN** its writes reach only DRAFT briefs (plus the idea's own `hero` north-star field), with no `approve`, no approved-brief mutation, and no publish call

#### Scenario: Frontmatter tool surface
- **WHEN** the skill's frontmatter `tools:` list is inspected
- **THEN** it is exactly `[get_idea, get_channel_plan, get_knowledge, list_taxonomies, list_briefs, save_brief, edit, delete]` — containing `list_briefs` and `save_brief`, no copy-listing tool, and no per-entity idea-patch tool (idea patches go through the generic `edit`)

### Requirement: Vietnamese persisted prose

The skill SHALL persist all brief prose in Vietnamese: the five narrative fields,
the `angle_label`, and the `comment`.

#### Scenario: Persisted fields are Vietnamese
- **WHEN** the skill saves an angle
- **THEN** the narrative fields, `angle_label`, and `comment` are Vietnamese

### Requirement: One brief row per angle

Each produced angle SHALL persist as its own separately-addressable `brief` row with
its own `angle_label`, so a concept can carry several angle briefs and several
approved ones, each anchoring an independent production run
(`/ssc-ad <brief_id>`, `/ssc-image-prompt <brief_id>`).

#### Scenario: Multi-angle set persists as multiple rows
- **WHEN** the skill saves N passing angles
- **THEN** N distinct brief rows exist for the concept, each with its own `brief_id` and `angle_label`
