## MODIFIED Requirements

### Requirement: Every `copy` variation's mechanism beat is backed by a named row of the live `brand/proof-points`

A `copy` variation's mechanism beat SHALL lean on **at least one row of the live
`brand/proof-points` table**, and the variation's Vietnamese `comment` SHALL name the row it
leans on **as one compact trailing tag** — outside the comment's 15-word cap, with
the out-of-family marker where the row sits outside the mechanism's own proof family. The row
SHALL be one the table actually carries this run, named as that document names it and never
explained in the comment. Other proof points the variation presses SHALL remain free to
answer the hook's tension without routing through the mechanism — the requirement is one
backed mechanism, not that every proof point back it.

The run's summary SHALL state, for the section it produced, which proof row backs the
mechanism beat. `ssc-ads-writer` and `ssc-post-produce` SHALL carry this on the line that
already reports the mechanism, and `ssc-post-authority` SHALL carry it on the line that
already reports the mechanism it judged against.

#### Scenario: The backing row is named as a tag

- **WHEN** a `copy` variation's mechanism beat leans on a row of the live table
- **THEN** the comment's reason is followed by one compact tag naming that row
- **AND** the tag does not count against the comment's 15-word cap

#### Scenario: An out-of-family backing is marked

- **WHEN** the backing row sits outside the proof family the mechanism argues from
- **THEN** the tag carries the out-of-family marker, and the run summary names it as out-of-family

#### Scenario: No mechanism, no tag

- **WHEN** the brief carries no mechanism, so no mechanism beat is written
- **THEN** no tag is appended, and the absence is reported in the run summary rather than in the comment
