## MODIFIED Requirements

### Requirement: Text renders the exact approved headline

The Text step SHALL require a chain tip and SHALL author a placement prompt carrying the
EXACT approved Vietnamese string verbatim, selecting the legible in-image text model or the
deterministic diacritic-safe overlay.

With **no approved `image_content`** the step SHALL NOT route the operator to another
command: it SHALL author the on-image copy itself as phase 1 — a set of candidates fitted to
the resolved chain tip — save them as drafts via `save_content(section='image_content')`, and
STOP for the operator to approve one in the workspace's Image Content stage. The placement
prompt is authored on the next invocation, once a row is approved.

#### Scenario: Exact headline carried

- **WHEN** the Text step runs with an approved `image_content` row
- **THEN** its prompt carries the verbatim Vietnamese string as the text-render input

#### Scenario: Missing on-image copy is authored, not routed away

- **WHEN** the Text step runs on a brief with a chain tip and no approved `image_content`
- **THEN** it drafts, judges and saves the on-image copy candidates and STOPs for approval, and it names no other command as the place to write them

#### Scenario: Overlay preferred for diacritics

- **WHEN** correct Vietnamese diacritics must be guaranteed
- **THEN** the step selects the deterministic overlay pseudo-model instead of the in-image text model
