# strategy-read-authoring

## Purpose

Which artifact of the quarterly strategy pipeline derives the market-sophistication
read, and which one writes it. The read is the hand-down that decides how indirect
an ad's lead may be; the platform contract for it lives in the workspace root
(`strategy-sophistication-authoring`). What lives HERE is the three-layer dispatch
consequence of that contract: a **skill** derives and reports, the **agent** writes,
and the ladder itself is never copied into either.

Before this rule existed the ad-market dimension derived the position and buried it
in one finding's `evidence` as a coarse `high|medium|low` rating — a vocabulary no
consumer reads — while the agent's `save_strategy_brief` calls carried
`dimension_status` only. The read had storage and consumers but no author.

## Requirements

### Requirement: The deriving skill reports the read and never writes the brief row

A dimension skill that derives a sophistication position SHALL report it in its
final report block and record it in its finding's `evidence`, and SHALL NOT hold
`save_strategy_brief` or write the brief row itself.

The agent already owns every write to that row and sends the **whole**
`dimension_status` map on each call, so a second writer racing those incremental
writes can drop a dimension from the map. One writer, one row.

#### Scenario: The skill reports rather than writes

- **WHEN** a dimension skill establishes a sophistication position
- **THEN** it carries the position back in its report block and in its finding's evidence
- **AND** its declared tool list does not include the brief-writing tool

#### Scenario: The durable record is the finding's evidence

- **WHEN** the report block has been consumed by the agent
- **THEN** the position is still recoverable from the finding's evidence
- **AND** the report block is treated as ephemeral

### Requirement: The stage vocabulary is read live and never restated in skill prose

The stage label SHALL be named in the knowledge base's own saturation-ladder
vocabulary, read live at run time. The ladder SHALL NOT be restated in skill prose,
and no second, coarser vocabulary SHALL be emitted alongside it.

A baked-in copy of a KB doc goes stale silently *and* overrides the live doc it was
meant to reflect. The ladder is reviewed on the knowledge base's own cadence, so a
skill that remembers it will eventually contradict it.

#### Scenario: The stage uses the ladder's own labels

- **WHEN** the deriving skill reports a position
- **THEN** the stage is named as the knowledge base names it

#### Scenario: No parallel vocabulary survives

- **WHEN** the deriving skill records its evidence
- **THEN** it emits no coarse rating in place of, or in addition to, the stage

#### Scenario: A failed knowledge-base read stops the run

- **WHEN** the saturation ladder cannot be read
- **THEN** the run stops
- **AND** no stage is produced from memory or from skill prose

### Requirement: The agent stamps the read on the write it already makes

The agent SHALL persist the stage and its reasoning on the **existing** incremental
`save_strategy_brief` call that records the deriving dimension's status, and SHALL
NOT make an additional call for the read.

Riding the existing write makes the read crash-safe on the same terms as the status
map, and means the two can never disagree about which dimensions had run.

#### Scenario: Stamped with the dimension status

- **WHEN** the deriving dimension returns
- **THEN** the stage and reasoning are persisted on the same write that records that
  dimension's status
- **AND** no additional brief write is made for the read

### Requirement: An unestablished read is expressed as omitted parameters

Where the cycle establishes no position, the agent SHALL omit both parameters rather
than sending an empty or placeholder value. A stage without reasoning, or reasoning
without a stage, SHALL be treated as no read at all.

An omitted field keeps its previously-saved value, so an omission can only ever
preserve and never erase. Half a hand-down is worse than a reported gap, because the
consumer cannot tell it is half.

#### Scenario: Nothing established means nothing sent

- **WHEN** the deriving dimension establishes no position
- **THEN** neither parameter is sent
- **AND** the previously-saved values are preserved rather than blanked

#### Scenario: A partial read is not persisted

- **WHEN** a stage is derived with no reasoning, or reasoning with no stage
- **THEN** neither field is written
- **AND** the absence is reported

### Requirement: The phase report states what was persisted

The agent's phase report SHALL state the stage and reasoning it persisted, or name
the absence, and SHALL show the previous and the new value when a run replaces a
read the brief already carried.

A re-run overwrites whatever the brief held, including a value an operator edited by
hand, and no flag distinguishes the two. Disclosure is the mitigation: the operator
sees exactly what changed and can re-edit.

#### Scenario: The report names what was written

- **WHEN** the dimensions phase completes
- **THEN** the report states the persisted stage and reasoning, or names the absence

#### Scenario: A replaced read is disclosed

- **WHEN** a run persists a read onto a brief that already carried a different one
- **THEN** the report shows the previous value and the new value

### Requirement: The producing side states who owns the read

The quarterly cycle's own command and agent documentation SHALL state that the
quarter authors the read once and the month inherits it.

The consuming side already forbade a monthly artifact from authoring one; the
producing side never said whose it was, so the rule was only ever visible to
whoever read the consumer.

#### Scenario: Ownership is stated where it is produced

- **WHEN** the strategy cycle's command and agent documentation are read
- **THEN** they state that the quarter authors the read and the month inherits it
