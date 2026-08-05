## MODIFIED Requirements

### Requirement: Quality gate with drop-and-regenerate

The skill SHALL self-score each angle 1-5 with a Vietnamese comment of **at most 15 words**, on brief-relevant criteria (distinctiveness, grounding, strategic
sharpness, authenticity), and SHALL drop and regenerate any angle scored ≤3 until every
angle in the set is ≥4. Only angles scored ≥4 SHALL be saved.

The cap SHALL NOT soften the gate: an angle scored ≤3 is dropped and regenerated whatever
its reason costs to state, and the reason that does not fit belongs in the run report.

#### Scenario: A weak angle is regenerated before saving
- **WHEN** an angle self-scores ≤3
- **THEN** the skill drops and regenerates it, and only angles scored ≥4 are persisted via `save_brief`

#### Scenario: The comment stays within the cap
- **WHEN** an angle is saved with its self-score
- **THEN** its `comment` runs to at most 15 Vietnamese words naming the biggest reason
