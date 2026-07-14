## ADDED Requirements

### Requirement: Ad content rows record the angle brief they were written from

`ssc-ads-writer` SHALL pass `brief_id` to `save_post_content` on every save, for every section it produces (`copy`, `headline`, `description`, `image_content`). The value MUST be the `brief_id` the skill received as a required input and wrote that section from — the skill MUST NOT derive, infer, or guess a brief (not "the idea's only brief", not the most recent, not the first approved).

The skill MUST NOT omit the argument on the assumption that the server will leave the field empty or bind it correctly. For `ad` content the server binds `brief_id` **by INFERENCE**, choosing one of the idea's approved briefs; an idea routinely carries several (server "Change 2" has shipped — N briefs per idea, each with a populated `angle_label`), so the inferred brief can be an angle the row was **not** written from. `save_post_content` documents that **an explicit value always wins**, so passing `brief_id` is what overrides the inference. The skill SHALL state this reason in prose, because an explicit stamp and an inferred one are indistinguishable in the stored row and a future editor would see no data-shape change on removing the argument.

#### Scenario: Copy saved with its brief

- **WHEN** `ssc-ads-writer` saves a passing `copy` variation for idea `I` written from approved brief `B`
- **THEN** the `save_post_content` call carries `brief_id = B`, and a subsequent `list_post_content(idea_id = I)` returns that row with `brief_id = B`

#### Scenario: Every section carries the lineage, not just copy

- **WHEN** `ssc-ads-writer` saves a `headline`, `description`, or `image_content` variation written from approved brief `B`
- **THEN** each saved row carries `brief_id = B` — the lineage is recorded for all four sections, not only the one that gates downstream work

#### Scenario: The brief is never inferred by the skill

- **WHEN** the skill is about to save a variation
- **THEN** it uses the `brief_id` it was invoked with and already resolved via `list_briefs`, and it MUST NOT select a brief by any other means (not "the idea's only brief", not the most recent, not the first approved)

#### Scenario: Omitting brief_id stamps an inferred angle, it does not leave a null

- **WHEN** an ad content row is saved without an explicit `brief_id` (as earlier versions of `ssc-ads-writer` did — live 2026-07-14, all 20 ad rows on five-brief idea `BGerzuw4JrrSz3Qd` came back stamped with a single inferred `brief_id`)
- **THEN** the server binds one of the idea's approved briefs by inference and the row is stamped with an angle the skill did not choose — which is why the argument is mandatory and MUST NOT be removed as redundant

### Requirement: Downstream consumers resolve copy by angle

With ad content rows carrying an explicitly-passed `brief_id`, a consumer that needs "the approved copy for *this* angle" SHALL be able to resolve it by filtering `list_post_content` rows on `brief_id`, and the stamp it filters on SHALL be the angle the row was written from. `/ssc.image`'s approved-copy gate SHALL take its brief-scoped path — the normal path — for such rows.

A stamp the server inferred is indistinguishable from one the writer supplied, so the lineage SHALL be treated as trustworthy only for rows written after this change. It MUST NOT be assumed correct for older rows, and a consumer MUST NOT rely on any downstream check to catch a wrong one — there is none.

#### Scenario: The image skill's copy gate matches at brief scope

- **WHEN** `/ssc.image` runs for idea `I` + brief `B` and the approved `copy` rows for `I` carry a `brief_id`
- **THEN** its gate matches only rows with `brief_id = B`, and its output summary declares that copy was matched at **brief scope** — the normal path

#### Scenario: A mis-inferred stamp is undetectable downstream

- **WHEN** an ad `copy` row was saved without an explicit `brief_id` and the server inferred a brief other than the one the copy was written from
- **THEN** `/ssc.image`'s brief-scoped filter still matches that row, no error is raised and no result looks empty, and the visual is grounded in another angle's story at generation-credit cost — the silent failure this change exists to prevent

#### Scenario: Rows with no lineage at all remain the fallback's business

- **WHEN** an idea's approved `copy` rows carry no `brief_id` at all (a legacy row written before the lineage was recorded)
- **THEN** `/ssc.image` applies its own narrowed fallback — idea scope only when the idea has exactly ONE brief, announced as a fallback; STOP when the idea has more than one — and this change neither removes, widens, nor otherwise alters that rule
