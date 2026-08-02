# strategy-cycle-phases

## Purpose

How the quarterly strategy agent decides which phase to run, and how a completed
cycle is re-run. The agent is **state-driven**: each invocation reads the brief and
runs the next open phase, then stops at the next human gate. That works until every
phase is complete — at which point a brief with all dimensions recorded and at least
one marked finding routes silently to the knowledge-feedback phase, and asking for a
re-run produces feedback instead. The platform contract is in the workspace root
(`strategy-cycle-rerun`); what lives HERE is the agent's own routing.

## Requirements

### Requirement: Phase detection routes on brief state and is unchanged by default

Phase detection SHALL route on the brief's state alone — whether directions exist,
whether they are approved, whether every dimension is recorded, whether any finding
is marked — and SHALL behave exactly as it did before the re-run marker existed when
no marker is supplied.

A re-run is an escape hatch, not a new default. Every existing invocation must keep
resolving to the phase it already resolved to.

#### Scenario: Default routing is untouched

- **WHEN** the cycle is invoked without a re-run marker
- **THEN** phase detection resolves exactly as it did before the marker existed

#### Scenario: A completed cycle still routes to knowledge feedback

- **WHEN** every dimension is recorded, at least one finding is marked, and no marker
  is supplied
- **THEN** the knowledge-feedback phase runs, as before

### Requirement: An explicit marker forces a full re-run of the dimensions

An explicit trailing marker on the invocation SHALL force the dimensions phase to run
over **every** dimension, ignoring what the brief already records, rebuilding that
record as it proceeds.

The marker is a bare positional token, matching the convention other agents in this
plugin already use for a note-less re-author. It is absent by default, so it cannot
fire by accident and re-spend a whole research pass.

#### Scenario: The marker re-runs every dimension

- **WHEN** the cycle is invoked with the marker on a brief whose dimensions are complete
- **THEN** every dimension runs
- **AND** the recorded status map is rebuilt as the run proceeds

#### Scenario: The re-run announces itself before doing work

- **WHEN** a full re-run begins
- **THEN** it states plainly that a re-run is starting and how many findings the brief
  already carries

### Requirement: The marker does not bypass the directions gate

The re-run marker SHALL NOT bypass the approval gate on the directions, SHALL NOT
create a new brief, and SHALL NOT re-open the directions.

A re-run re-runs the dimension work and nothing above it: same period, same brief,
same approved directions.

#### Scenario: Unapproved directions still stop the run

- **WHEN** the marker is supplied but the directions are not approved
- **THEN** the run stops at the directions gate exactly as it would without the marker

#### Scenario: A re-run is not a new brief

- **WHEN** a re-run completes
- **THEN** it targeted the same brief and the same period
- **AND** the approved directions are unchanged

### Requirement: Skip-what-is-recorded applies to a resume, not a re-run

The rule that a dimension already recorded in the status map is skipped SHALL apply
to a **resume** — an interrupted run continuing — and SHALL NOT apply to a re-run.

The dimension skills are deliberately not idempotent: re-running one appends
findings. Skipping recorded dimensions is what makes a crashed run resumable, and it
is exactly what a re-run must override.

#### Scenario: A resume skips what is already recorded

- **WHEN** an interrupted run continues without the marker
- **THEN** dimensions already recorded are skipped

#### Scenario: A re-run ignores the record

- **WHEN** the marker is supplied
- **THEN** no dimension is skipped on account of already being recorded

### Requirement: Appended findings never double a knowledge-base proposal

Findings SHALL append, and no agent SHALL delete or un-mark a curated finding. The
knowledge-feedback phase SHALL act on the **currently marked** set and SHALL group
marked findings that would produce the same revision into one proposal citing all of
them, reporting each marked finding's creation time.

A re-run brief carries the previous curated set beside the new one, so acting on the
marked set naively proposes the same revision twice. This is deduplication at the
proposal step; nothing is deleted, and dismissing a superseded finding stays an
operator act.

#### Scenario: Two equivalent marked findings produce one proposal

- **WHEN** the knowledge-feedback phase finds two marked findings that would revise the
  same document in the same way
- **THEN** one proposal is made, citing both

#### Scenario: Nothing curated is destroyed

- **WHEN** a re-run appends a second set of findings
- **THEN** the previously marked findings remain present and remain marked
- **AND** no agent deletes or un-marks any of them

#### Scenario: Each marked finding is reported with its vintage

- **WHEN** the knowledge-feedback phase reports the marked set it acted on
- **THEN** each marked finding is reported with its creation time
