## MODIFIED Requirements

### Requirement: The full judgement travels with the section

Phase 1 SHALL apply, reading every document live: the six-item floor owned by
`craft/copy-floor` as its own section table binds it to `image_content` (**a failure is a
REJECT, not a low score**); the set-level coverage verdict and the ≥3-distinct proof bar owned
by `craft/coverage` §4.2; the opening-frame rule of `rules/person-rule` §4, whose frame each
candidate declares and records; the bullets' provenance in `brand/proof-points`, in that
doc's own wording; the named formula, competitor test and hook-not-CTA rules of
`craft/headline-formulas`; and the mechanism read from `brief.mechanism` alone.

Each candidate SHALL carry a 1–5 brand-fit `score` and a Vietnamese `comment` of **at most 15
words**, with the score remaining a **secondary** signal that may never
be why a set ships. The formula and the opening frame SHALL be recorded rather than narrated
in that comment — the frame is an axis term the candidate already carries. A rejected
candidate SHALL be regenerated on its own axis position, bounded at **2 attempts per slot**;
a slot that still fails SHALL NOT be saved and SHALL be named in the report along with what
its absence does to the set's coverage.

No skill SHALL restate a floor item, a proof point, a formula or an opening frame in its own
prose.

#### Scenario: A floor failure rejects

- **WHEN** a candidate fails a floor item
- **THEN** it is rejected and regenerated on the same axis position, not scored down and saved

#### Scenario: The comment stays within the cap

- **WHEN** a candidate is saved
- **THEN** its `comment` runs to at most 15 Vietnamese words, and the formula and opening frame are recorded rather than narrated in it

#### Scenario: A failed read stops the run

- **WHEN** a required knowledge path comes back missing
- **THEN** the step STOPs naming the path, and does not proceed from a remembered version
