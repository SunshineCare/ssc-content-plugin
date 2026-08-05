# rating-comment-shape Specification

## Purpose
TBD - created by archiving change rating-comment-word-cap. Update Purpose after archive.
## Requirements
### Requirement: A persisted rating comment is capped at 15 Vietnamese words

Every skill that persists a `comment` SHALL write **at most 15 Vietnamese words**, counted
rather than eyeballed. How many sentences those words form is the skill's own call — the
word count is the bound, and no skill SHALL impose a one-line or one-sentence shape on top
of it. The comment SHALL carry the reason the item is strong or weak, and nothing else.

The cap SHALL be stated as a hard bar, not a target, and SHALL be stated in the same terms
in every skill that writes a comment.

#### Scenario: A comment fits the cap

- **WHEN** a skill saves a draft row with a rating
- **THEN** the `comment` runs to at most 15 Vietnamese words and names the reason

#### Scenario: Two short sentences are fine

- **WHEN** the reason reads better as two short clauses than as one
- **THEN** the comment may use them, provided the whole comment stays within 15 words

#### Scenario: An over-cap comment is cut, not saved

- **WHEN** a drafted comment runs past 15 words
- **THEN** it is cut to the biggest reason before the row is saved

### Requirement: Only a proof-provenance tag may follow the comment

A comment SHALL carry at most **one** trailing tag, and that tag SHALL carry the proof
provenance the skill's own rules require to persist — nothing else qualifies. On the skills
that write a mechanism beat that is the row of the live `brand/proof-points` backing it,
named as that document names it, with the out-of-family marker appended where the row sits
outside the mechanism's own proof family. On a skill whose own checks require a claim's
backing proof family to be recorded, that family is the tag. The tag SHALL sit outside the
15-word count and SHALL itself be compact — the provenance is named, never explained.

A skill SHALL NOT carry two tags. Where its rules would require both, the mechanism's
backing row is the one that persists.

Where the variation carries **no mechanism beat** — a blank `brief.mechanism`, or a section
that writes none — the tag SHALL be **absent**. It SHALL NOT be written empty, as `NONE`, or
as a note about the absence; the absence is reported in the run summary.

No other tag SHALL be appended to a comment.

#### Scenario: A backed mechanism names its row

- **WHEN** a `copy` variation's mechanism beat leans on a proof row
- **THEN** the comment carries its reason plus one compact tag naming that row, with the out-of-family marker where it applies

#### Scenario: No mechanism, no tag

- **WHEN** the brief carries no mechanism
- **THEN** the comment is the reason alone, and the absence is reported in the run summary rather than in the comment

### Requirement: Naming the rule, the formula, the frame and the axes is no longer the comment's job

A comment SHALL NOT be required to name the rule or voice document a variation traces to,
the headline formula it was written to, its opening frame, or its axis terms. Those SHALL be
carried by `terms[]`, the `coverage` record, and the run's own report.

Removing them from the comment SHALL NOT remove them from the judgement: the variation is
still judged against the live floor, still records its axis terms, and still declares its
opening frame.

#### Scenario: Axis terms are persisted, not narrated

- **WHEN** a variation occupies a lead, proof-device, register and length-band position
- **THEN** those terms are saved in `terms[]` and the comment does not restate them

#### Scenario: The judgement is unchanged

- **WHEN** a variation is judged against the floor and its opening frame is checked
- **THEN** both still happen and both still carry their consequences, whatever the comment says

### Requirement: The set-level coverage `notes` carries the same cap

The Vietnamese `notes` on a `coverage` verdict SHALL run to at most 15 Vietnamese words —
what the set is missing, or why it passes — under the same counted bound and with the same
freedom of shape. The `axes_missing` list carries the detail.

#### Scenario: A coverage note is capped too

- **WHEN** a set-level coverage verdict is recorded
- **THEN** its `notes` runs to at most 15 Vietnamese words, and the unspanned axes are carried structurally in `axes_missing`

### Requirement: The cap never changes a judgement

The cap SHALL NOT be a reason to soften, withhold, or downgrade any judgement. Where an
item's faults exceed what 15 words can hold, the comment SHALL name the biggest fault and
the rest SHALL go to the run report, which has no cap.

Specifically, no skill SHALL: withhold or soften a floor REJECT because the reason would not
fit; adjust a score so its reason gets shorter; merge two distinct findings into one vague
phrase; or drop the substance of a coverage verdict.

#### Scenario: A floor failure still rejects

- **WHEN** a candidate fails a floor item and its full explanation exceeds 15 words
- **THEN** the candidate is still rejected and regenerated, and the comment names the biggest reason

#### Scenario: Two faults, one comment

- **WHEN** a variation carries two independent faults that do not both fit
- **THEN** the comment names the larger one and the run report carries both — the two are not merged into a vague phrase

### Requirement: The cap is a prose discipline, not a server gate

Nothing validates comment length server-side: `comment` is free text. Each skill SHALL state
the cap as its own discipline rather than implying a gate enforces it.

#### Scenario: No validator is claimed

- **WHEN** a skill states the cap
- **THEN** it does not claim the server refuses an over-cap comment

