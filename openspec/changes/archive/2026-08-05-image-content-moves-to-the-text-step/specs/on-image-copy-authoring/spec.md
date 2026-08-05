## ADDED Requirements

### Requirement: On-image copy is authored by the Text step of the image-prompt pipeline

The `image_content` section SHALL be authored by `ssc-image-prompt-text`, as **phase 1** of
that step, and by no other skill. `ssc-ads-writer` SHALL produce `copy`, `headline` and
`description` only; `ssc-post-authority` SHALL produce `copy` only. Both SHALL STOP with a
routing message when an operator names `image_content` explicitly, and SHALL NOT silently
redirect the request to another section.

Phase 1 SHALL run only when the brief has **no approved `image_content` row**. When one
exists, the step SHALL proceed directly to phase 2 — authoring the text-placement prompt —
exactly as it does for an approved row today.

#### Scenario: The Text step authors the on-image copy

- **WHEN** `ssc-image-prompt-text` runs on an approved brief with a chain tip and no approved `image_content`
- **THEN** it drafts, judges and saves the on-image copy candidates as drafts, and STOPS for the operator to approve one

#### Scenario: An approved row routes straight to the prompt

- **WHEN** the brief already has an approved `image_content` row
- **THEN** phase 1 is skipped and the step authors the text-placement prompt

#### Scenario: The producers refuse the section

- **WHEN** an operator runs `/ssc-ad <brief_id> image_content` or `/ssc-post <brief_id> image_content`
- **THEN** the skill STOPs naming `/ssc-image-prompt <brief_id> text` as where on-image copy is authored, and writes nothing

### Requirement: Phase 1 gates on a chain tip and an approved copy

Phase 1 SHALL run only after the step's existing gates pass — the brief resolves, its own
`brief.channel` is `ad` or `post`, the idea is approved, the brief is approved, and a **chain
tip** exists (the nearest previous selection walking `edit → composition → subject → scene`).

Phase 1 SHALL additionally require **≥1 approved `copy` row** on the brief, because the
on-image headline is distilled from that copy's hook. With none it SHALL STOP (Vietnamese)
routing the operator to `/ssc-ad <brief_id> copy` or `/ssc-post <brief_id> copy` by channel,
and SHALL write nothing.

#### Scenario: No chain tip

- **WHEN** no candidate has been selected at any earlier step
- **THEN** the step STOPs routing the operator to Generate and select one, and authors no on-image copy

#### Scenario: No approved copy

- **WHEN** a chain tip exists but the brief has no approved `copy`
- **THEN** the step STOPs naming the channel's copy command, and writes nothing

### Requirement: The candidate set is fitted to the resolved chain tip, not spanned across densities

Phase 1 SHALL choose **one density profile for the whole set**, judged from the chain tip:
its authored prompt read via `list_creative_prompts` for the tip's layer, and optionally one
`view_image` look where the JSON cannot answer the question. A busy, detailed or
subject-dominant tip SHALL take a Minimal payload; a clear calm area admits a subheadline and
bullets; a plain high-contrast backdrop where type is the point admits the fullest payload.

The candidates SHALL differ on **hook, lead, register and proof device** — the coverage axes
— and SHALL NOT be spread across density profiles. No skill SHALL instruct a producer to span
at least two profiles or to include a Minimal version for the image stage to choose from.

The step SHALL report the profile it chose and the tip evidence that drove it.

#### Scenario: Fitted to a busy tip

- **WHEN** the chain tip's authored prompt describes a close portrait with no quiet area
- **THEN** every candidate in the set is Minimal, and the report names the tip evidence for that choice

#### Scenario: Variation is on the axes, not on density

- **WHEN** phase 1 emits N candidates
- **THEN** they occupy different lead / proof-device / register / length-band positions at one density profile

### Requirement: Phase 2 renders the approved row it is given

With the density fitted at authoring time, phase 2 SHALL NOT re-decide the payload against
the chain tip. Where exactly one `image_content` row is approved it SHALL render that row.
Where several are approved it SHALL take the **most recently approved** row, report its
content id, and state why.

Phase 2 SHALL take an approved row **whole** — never merging lines from two rows, never
dropping a subheadline or a bullet to make it fit, and never promoting a bullet. Editing
approved copy is not the step's to do.

#### Scenario: One approved row

- **WHEN** a single `image_content` row is approved
- **THEN** the placement prompt carries that row's lines verbatim

#### Scenario: Several approved rows

- **WHEN** more than one `image_content` row is approved
- **THEN** the step renders the most recently approved one and names its content id in the report

#### Scenario: A row is never assembled

- **WHEN** the approved row is heavier than the finished image comfortably carries
- **THEN** the step says so plainly and routes the operator to approve a lighter row or request a fresh batch, and does not trim the approved body

### Requirement: The full judgement travels with the section

Phase 1 SHALL apply, reading every document live: the six-item floor owned by
`craft/copy-floor` as its own section table binds it to `image_content` (**a failure is a
REJECT, not a low score**); the set-level coverage verdict and the ≥3-distinct proof bar owned
by `craft/coverage` §4.2; the opening-frame rule of `rules/person-rule` §4, whose frame each
candidate declares and records; the bullets' provenance in `brand/proof-points`, in that
doc's own wording; the named formula, competitor test and hook-not-CTA rules of
`craft/headline-formulas`; and the mechanism read from `brief.mechanism` alone.

Each candidate SHALL carry a 1–5 brand-fit `score` and a one-line Vietnamese `comment`, with
the score remaining a **secondary** signal that may never be why a set ships. A rejected
candidate SHALL be regenerated on its own axis position, bounded at **2 attempts per slot**;
a slot that still fails SHALL NOT be saved and SHALL be named in the report along with what
its absence does to the set's coverage.

No skill SHALL restate a floor item, a proof point, a formula or an opening frame in its own
prose.

#### Scenario: A floor failure rejects

- **WHEN** a candidate fails a floor item
- **THEN** it is rejected and regenerated on the same axis position, not scored down and saved

#### Scenario: A failed read stops the run

- **WHEN** a required knowledge path comes back missing
- **THEN** the step STOPs naming the path, and does not proceed from a remembered version

### Requirement: The on-image body contract and its caps are unchanged

Every saved `image_content` body SHALL use the fixed ASCII markers `HEADLINE:`,
`SUBHEADLINE:` and `BULLETS:` with Vietnamese values, emitting only the elements the chosen
density profile carries and omitting an unused marker entirely rather than emitting it empty.

The caps SHALL bind as hard gates, counted rather than eyeballed: HEADLINE ≤6 Vietnamese
words / ≤40 characters (prefer ≤27, at most 2 rendered lines); SUBHEADLINE ≤8 Vietnamese
words; each BULLET ≤5 Vietnamese words, 0–3 per profile. One element over cap SHALL reject
the version.

These caps are the one thing the skill states rather than reads, because no knowledge-base
document carries an on-image brevity spec. If one is ever added, the caps SHALL move there
and the skill SHALL reference it.

#### Scenario: An over-cap element rejects the version

- **WHEN** a candidate's HEADLINE runs to 7 Vietnamese words
- **THEN** the version is rejected and recut, and it is not saved with a lowered score

### Requirement: Phase 1 saves drafts immediately and stops

Phase 1 SHALL insert each surviving candidate as a **draft** `content` row via
`save_content`, carrying `brief_id`, `section='image_content'`, `body`, the resolved axis
`terms[]`, the set's `coverage` verdict, `score` and `comment` — then STOP. It SHALL NOT
present the set in chat and wait for a go-ahead, and SHALL run no in-chat revise loop. This
holds on both channels.

Saving SHALL NOT approve. The step SHALL hold no `approve`, `unapprove`, `edit`, `delete`,
publish or generate tool, and SHALL spend no credits. The operator reviews and approves a row
in the workspace's **Image Content** stage.

#### Scenario: Drafts are saved and the step stops

- **WHEN** the judgement loop leaves the set floor-passing
- **THEN** each surviving candidate is inserted as a draft row and the step STOPs telling the operator to approve one in the Image Content stage

#### Scenario: Unreviewed drafts are not duplicated

- **WHEN** the brief already has `image_content` drafts and none is approved
- **THEN** the step STOPs asking the operator to approve or reject them, and does not produce a second batch

#### Scenario: A fresh batch is requested explicitly

- **WHEN** the operator runs `/ssc-image-prompt <brief_id> text image_content` with an approved row present
- **THEN** phase 1 runs again and inserts a fresh set of drafts, approving and demoting nothing

### Requirement: The channel selects register and steer, never structure

Both channels SHALL run the identical phase-1 procedure. The channel resolved from
`brief.channel` SHALL select only: the objective (an `ad` converts, a `post` earns
conversation), the hook bar (a **converting** hook on `ad`, an **engaging** hook on `post`),
the density steer (`awareness_stage` + route + declared layer on `ad`; the idea's `pillar`
read live from `content/pillars` plus the nature of the anchor copy on `post`), and the
register mapped from `voice/founder-voice`.

A `post` candidate SHALL NOT carry ad register — no offer framing, no urgency, no
proof-stacking pitch, no Messenger CTA push. On neither channel SHALL a lower density be
treated as licence for a weaker hook.

#### Scenario: A post is not written as an ad

- **WHEN** phase 1 runs on a `post` brief
- **THEN** its candidates are judged on recognition, conversation and shareability, and carry no offer or urgency framing

#### Scenario: An ad headline converts at every density

- **WHEN** phase 1 chooses a Minimal profile on an `ad` brief
- **THEN** the single headline is still a converting hook — specific, brand-proof, mechanism- or identification-led

### Requirement: Timeliness and proof-device spread come from the period's hand-downs

Phase 1 SHALL resolve the period from the owning plan and read that period's `proofInventory`
and `offerState` from the monthly plan head. The proof-device axis SHALL be spanned across the
period's stated inventory alone. With no stated promotion — `offerState` `null` or an explicit
`{ promotion: false }` — no candidate SHALL carry a timeliness claim, and none SHALL be
inferred from the calendar, the season or the brief's `why_now`.

A `null` hand-down SHALL be recorded as a fact and reported, never read as "everything is
available" and never replaced by the full roster. An unresolvable period SHALL be reported and
both hand-downs treated as unstated; the run SHALL proceed.

#### Scenario: No stated promotion

- **WHEN** the period's `offerState` is null
- **THEN** no candidate carries a timeliness claim and the report says no promotion was stated

#### Scenario: No stated inventory

- **WHEN** the period's `proofInventory` is null
- **THEN** the gap is reported, the spread is judged over the devices the candidates' own traced proof points support, and no inventory is invented
