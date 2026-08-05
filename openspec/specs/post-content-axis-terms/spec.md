# post-content-axis-terms Specification

## Purpose
TBD - created by archiving change rating-comment-word-cap. Update Purpose after archive.
## Requirements
### Requirement: A post `content` row persists its coverage axis terms

`ssc-post-authority` SHALL pass `terms[]` on every `save_content` insert, carrying the leaf
taxonomy term ids for the axes the saved asset occupies — including the `opening_frame` term
the candidate declared. It SHALL resolve those ids live via `list_taxonomies` and SHALL NOT
pass a code, a label, or a hand-typed string.

The post channel judges set-level coverage over these axes on every run. Persisting the
per-row terms is what makes that judgement auditable after the run, and it is what carries
the declared opening frame on the row now that the comment carries only its reason.

#### Scenario: Axis terms are saved with the row

- **WHEN** `ssc-post-authority` persists a floor-passing `copy` candidate
- **THEN** the `save_content` call carries `terms[]` with the leaf term ids for that candidate's axis positions, including its declared `opening_frame`

#### Scenario: Ids are resolved live, never guessed

- **WHEN** the skill needs a term id
- **THEN** it reads the roster via `list_taxonomies` this run and uses the id that roster returns

#### Scenario: An empty roster records nothing rather than a guess

- **WHEN** a roster comes back empty for an axis
- **THEN** no term is recorded for that axis, the write still succeeds, and the gap is named in the run summary

### Requirement: The strict write refusal is stated, not discovered

The skill SHALL state that the server validates `terms[]` before writing: an unknown term
id, or two terms of a single-cardinality axis, refuses the **whole** write and persists
nothing. On such a refusal the skill SHALL surface it plainly and SHALL NOT retry with the
term dropped or with a guessed id.

#### Scenario: A bad term id refuses the write

- **WHEN** a `terms[]` entry matches no taxonomy term
- **THEN** the server refuses the write, nothing is persisted, and the skill reports it rather than retrying with a guess

