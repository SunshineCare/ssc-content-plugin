## ADDED Requirements

### Requirement: The shared core writes nothing and holds no mutation tool

The shared Approaches core SHALL declare `capability: view` and SHALL declare only
read tools. It SHALL NOT hold `save_channel_plan`, `save_idea`, `save_brief`,
`allocate_channel`, `edit`, `delete`, `approve`, `unapprove`, or any other tool that
mutates BrandOS state. Every save, every gate check and every approval SHALL remain
the caller's.

A skill two pipelines dispatch is a skill two pipelines can be surprised by. Holding
no write tool is what makes the core safe to share on the same terms as the existing
brief core: the caller knows its own channel's storage shape and owns its gates, so
the core can never write the wrong row or trip a gate on the caller's behalf.

#### Scenario: The declared tool list is read-only

- **WHEN** the core skill's frontmatter is read
- **THEN** its capability is `view`
- **AND** its tool list contains no mutation tool

#### Scenario: The caller persists the result

- **WHEN** the core returns its blocks to a channel Approaches skill
- **THEN** the channel skill composes them into its own document and makes the save
- **AND** the core makes no save of its own

### Requirement: The core reads no plan state and takes its inputs from the caller

The core SHALL NOT call any plan-state read tool — it SHALL NOT fetch the monthly
head, the channel plan, or the quarterly strategy brief. It SHALL take `channel`,
`period`, the head hand-downs, the quarter brief payload, and the featured personas
as inputs supplied by the caller, and SHALL state in its prose that these arrive from
the caller.

The caller has already read the head — it must, for its release gate — and has
already read the quarter brief. A second read would either duplicate the gate logic
or let the core run under a narrative the caller had already found unapproved. One
read, one gate.

#### Scenario: No plan-state call is made

- **WHEN** the core runs
- **THEN** it issues no monthly-head, channel-plan or strategy-brief read
- **AND** it uses the payloads the caller passed in

#### Scenario: The gate stays with the caller

- **WHEN** the caller's release gate is not satisfied
- **THEN** the caller stops before dispatching the core
- **AND** the core never independently re-decides whether the month is released

### Requirement: The core returns three blocks and nothing else

The core SHALL return exactly three blocks of text for the caller to compose:
the **inherited sophistication read**, a **per-persona voice-of-customer pass**, and
a **candidate-mechanism supply**. It SHALL NOT return a persisted document, a section
layout, or a channel-specific heading set.

Returning text rather than a document is what keeps the two channels' artifacts
free to differ. The Ads document and the Posts document have different section
shapes and different length budgets; only the substance is shared.

#### Scenario: Three blocks come back

- **WHEN** the core completes a run
- **THEN** it returns the sophistication block, the voice-of-customer block and the
  candidate-mechanism block

#### Scenario: The document shape belongs to the caller

- **WHEN** the caller composes the returned blocks
- **THEN** the caller chooses the headings, the section order and the length budget
- **AND** the core prescribes none of them

### Requirement: The core inherits the sophistication read and never derives one

The core SHALL carry the quarter's sophistication stage and reasoning through
verbatim from the payload the caller passed in. It SHALL NOT derive, infer, adjust
or restate a stage of its own. Where the quarter carries none, it SHALL return the
absence as an explicit `NOT STATED` fact for the caller to report, and SHALL NOT
substitute a guessed stage.

The quarter authors the read once and the month inherits it. A month that quietly
derives its own read produces a second, unreviewed position that no operator
approved and that silently outranks the one they did.

#### Scenario: A stated read is passed through unchanged

- **WHEN** the quarter payload carries a stage and its reasoning
- **THEN** the core returns both as the quarter stated them

#### Scenario: An absent read is returned as a fact

- **WHEN** the quarter payload carries no stage, or a stage without reasoning
- **THEN** the core returns `NOT STATED`
- **AND** it produces no stage from memory or from its own prose

### Requirement: Every voice-of-customer line is attributed, and a dry source is a named gap

Each item in the voice-of-customer block SHALL name the recorded source it came from
— head research, a marked quarterly finding, the persona's own KB detail doc, or the
head's performance review. A phrase that cannot be attributed SHALL NOT be included.
A source that yields nothing SHALL be reported as a named gap and SHALL NOT be
filled; a gap SHALL NOT stop the run. The core SHALL run no outward search and SHALL
hold no fetch tool.

An unattributed quote is indistinguishable from an invented one, and inventing
customer language is exactly what this pass exists to replace. The period gets one
outward pass, and it belongs to the head — so this block compiles from what is
already recorded rather than opening a second one.

#### Scenario: An unsourceable phrase is dropped

- **WHEN** a candidate phrase cannot be traced to a recorded source
- **THEN** it is not included in the block

#### Scenario: An empty source is reported, not filled

- **WHEN** one of the named sources yields nothing for a featured persona
- **THEN** the gap is named in the returned block
- **AND** the run continues

#### Scenario: No second outward pass

- **WHEN** the core runs
- **THEN** it performs no web search and holds no fetch tool

### Requirement: The core refuses the decisions that belong to its caller and to the operator

The core SHALL NOT decide which mechanism a subject carries, SHALL NOT select or
rank the period's ideas, SHALL NOT set coverage targets, quantities or budget, and
SHALL NOT approve, unapprove or flip any gate. It SHALL propose candidates and
report gaps only.

Propose-only is the plugin's core invariant: a pipeline step drafts, a human
approves. A shared skill is the worst place to erode it, because the erosion lands
in every channel at once.

#### Scenario: Candidates are proposed, never chosen

- **WHEN** the core returns its candidate-mechanism supply
- **THEN** it proposes more candidates than the period can use
- **AND** it assigns none of them to a specific idea or subject

#### Scenario: No gate is touched

- **WHEN** the core runs to completion
- **THEN** it calls no approval verb and sets no approval-bearing field

### Requirement: `channel` is the core's only conditional

The core SHALL branch on exactly one input, `channel`. For `channel='post'` it SHALL
additionally bind every candidate mechanism and every quoted line to
`rules/organic-vs-paid-firewall`, read live, and SHALL refuse to source any
voice-of-customer quote or example from ad copy or from the ad performance lens. For
`channel='ad'` it SHALL behave as the Ads Approaches step behaves today. No other
input SHALL introduce a branch.

The two channels are graded on different objectives, so a line that converts in a
paid placement routinely fails in the feed; importing one teaches the wrong instinct.
Keeping the branch single and named is what stops the core drifting into two
channel-shaped skills wearing one file name.

#### Scenario: A post run refuses an ad-sourced line

- **WHEN** the core runs with `channel='post'` and a candidate quote or example
  originates in ad copy or in the ad performance lens
- **THEN** that line is not used
- **AND** the refusal is stated rather than silently dropped

#### Scenario: A post run binds to the firewall document

- **WHEN** the core runs with `channel='post'`
- **THEN** it reads `rules/organic-vs-paid-firewall` live and applies it to every
  candidate mechanism and every quoted line

#### Scenario: An ad run is unchanged

- **WHEN** the core runs with `channel='ad'`
- **THEN** it applies no firewall binding
- **AND** the blocks it returns match what the Ads Approaches step produced inline
  before the refactor

### Requirement: Both channel Approaches skills consume the core rather than restating it

The Ads Approaches skill and the Posts Approaches skill SHALL each dispatch the core
and SHALL NOT carry their own copy of the sophistication-inherit rule, the
voice-of-customer pass, or the candidate-mechanism construction. The Ads refactor
SHALL be behaviour-preserving: its persisted document SHALL keep its current section
shape and wording rules. Each consuming agent's `orchestrates:` list SHALL name the
core.

Two copies of doctrine that are meant to say the same thing diverge the day one is
edited, and the stale copy wins wherever it is read first. This repo already refuses
a second copy of a KB rule; the same reasoning applies to skill prose. The bundle
build is what proves the wiring, since it fails on an `orchestrates` entry with no
matching skill.

#### Scenario: Neither channel skill holds a second copy

- **WHEN** either channel Approaches skill is read
- **THEN** it dispatches the core for these three pieces of work
- **AND** it does not restate the sophistication-inherit rule, the voice-of-customer
  pass, or the candidate-mechanism construction

#### Scenario: The approved Ads artifact does not change

- **WHEN** the refactored Ads Approaches step persists its document
- **THEN** the document's section shape and wording rules are the same as before the
  refactor

#### Scenario: The core is declared on both agents

- **WHEN** the Posts agent and the Ads agent are read
- **THEN** each names the core in its `orchestrates:` list

### Requirement: Governing documents are named, read live, and a failed read stops the run

The core SHALL name every knowledge-base document it applies — the doctrine's
mechanism definition, the awareness framework, the proof-point families, the
compliance rules, the persona index and each currently-listed persona detail doc,
and for `channel='post'` the organic-versus-paid firewall — and SHALL read each live
at run time. It SHALL restate none of their contents: no persona name, trigger,
prohibition or ladder value SHALL appear in the skill file. A failed read SHALL stop
the run, SHALL name the document that could not be read, and SHALL NOT fall back to
a remembered version.

The knowledge base is revised on its own cadence, so a baked-in copy goes stale
silently and then overrides the live doc it was meant to reflect. Keeping the roster
open also means a persona added or retired needs no change to this skill.

#### Scenario: Documents are named, contents are not

- **WHEN** the core skill file is read
- **THEN** each governing document is named by path and section
- **AND** no persona name, trigger, prohibition or ladder value is restated in the file

#### Scenario: The persona roster is resolved live

- **WHEN** the core loads persona material
- **THEN** it resolves the detail docs from whatever the persona index currently lists
- **AND** it hardcodes no persona count and no persona enum

#### Scenario: A failed knowledge-base read stops the run

- **WHEN** one of the named documents cannot be read
- **THEN** the run stops and names that document
- **AND** no block is produced from a remembered version
