## ADDED Requirements

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
`copy` (it SHALL NOT call `list_post_content`). Angles SHALL be derived from the
concept (`title`/`tags`/`ad_notes`) + `build_spec` + the persona detail doc — the
material the copy is later written from.

#### Scenario: Runs with no copy present
- **WHEN** the concept is approved and has no `copy` rows at all
- **THEN** the skill still produces the angle set from the concept + persona, calling neither `list_post_content` nor any copy gate

### Requirement: Produce-once guard

Before any write, the skill SHALL call `list_briefs` for the concept. If it returns
at least one brief, the skill SHALL STOP and direct the operator to curate / approve
/ discard angles in the dashboard, without appending or overwriting.

#### Scenario: Briefs already exist
- **WHEN** `list_briefs` returns ≥1 brief for the concept
- **THEN** the skill STOPS, routes the operator to the dashboard, and calls no `save_brief`

### Requirement: Propose-only governance

The skill SHALL be propose-only. It SHALL never call `approve` (any entity,
including `brief`), never use `edit` to demote/discard, never call `update_idea`
for the narrative fields, never call any publish/schedule tool, and never flip a
gate. Its declared frontmatter `tools:` SHALL be exactly `[get_idea,
get_channel_plan, get_knowledge, list_briefs, save_brief]` (no `list_post_content`
— brief-first needs no copy read) and SHALL NOT include `update_idea`.

#### Scenario: Only draft writes occur
- **WHEN** the skill runs to completion
- **THEN** the only write it performs is `save_brief` (creating DRAFT briefs), with no `approve`, `edit`-demotion, `update_idea`, or publish call

#### Scenario: Frontmatter tool surface
- **WHEN** the skill's frontmatter `tools:` list is inspected
- **THEN** it contains `list_briefs` and `save_brief`, and does not contain `update_idea` or `list_post_content`

### Requirement: Vietnamese persisted prose

The skill SHALL persist all brief prose in Vietnamese: the five narrative fields,
the `angle_label`, and the `comment`.

#### Scenario: Persisted fields are Vietnamese
- **WHEN** the skill saves an angle
- **THEN** the narrative fields, `angle_label`, and `comment` are Vietnamese

### Requirement: Forward compatibility with server Change 2

The skill SHALL set `angle_label` and emit up to five briefs even though today's
server nulls `angle_label` and keeps one brief per idea, and SHALL document this
"Change 2" dependency in its body so the inert multi-angle payoff is never a hidden
assumption.

#### Scenario: Runs correctly before Change 2 ships
- **WHEN** the server has not yet shipped Change 2
- **THEN** the skill still runs to completion (one brief persists, `angle_label` nulled by the server) and its body documents the dependency
