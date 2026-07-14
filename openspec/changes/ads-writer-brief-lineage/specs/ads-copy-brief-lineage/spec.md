## ADDED Requirements

### Requirement: Ad content rows record the angle brief they were written from

`ssc-ads-writer` SHALL pass `brief_id` to `save_post_content` on every save, for every section it produces (`copy`, `headline`, `description`, `image_content`). The value MUST be the `brief_id` the skill received as a required input and wrote that section from — the skill MUST NOT derive, infer, or guess a brief, and MUST NOT omit the argument on the assumption that the server will bind it (the server binds `brief_id` automatically only for `post` content, never for `ad` content).

#### Scenario: Copy saved with its brief

- **WHEN** `ssc-ads-writer` saves a passing `copy` variation for idea `I` written from approved brief `B`
- **THEN** the `save_post_content` call carries `brief_id = B`, and a subsequent `list_post_content(idea_id = I)` returns that row with `brief_id = B`

#### Scenario: Every section carries the lineage, not just copy

- **WHEN** `ssc-ads-writer` saves a `headline`, `description`, or `image_content` variation written from approved brief `B`
- **THEN** each saved row carries `brief_id = B` — the lineage is recorded for all four sections, not only the one that gates downstream work

#### Scenario: The brief is never inferred

- **WHEN** the skill is about to save a variation
- **THEN** it uses the `brief_id` it was invoked with and already resolved via `list_briefs`, and it MUST NOT select a brief by any other means (not "the idea's only brief", not the most recent, not the first approved)

### Requirement: Downstream consumers resolve copy by angle

With ad content rows carrying `brief_id`, a consumer that needs "the approved copy for *this* angle" SHALL be able to resolve it unambiguously by filtering `list_post_content` rows on `brief_id`. `/ssc.image`'s approved-copy gate SHALL take its preferred brief-scoped path for such rows.

#### Scenario: The image skill's copy gate matches at brief scope

- **WHEN** `/ssc.image` runs for idea `I` + brief `B` and the approved `copy` rows for `I` carry a `brief_id`
- **THEN** its gate matches only rows with `brief_id = B`, and its output summary declares that copy was matched at **brief scope** rather than announcing the idea-scope fallback

#### Scenario: Historical rows still match at idea scope

- **WHEN** `/ssc.image` runs for a concept whose approved `copy` rows were written before this change and therefore carry a null `brief_id`
- **THEN** the idea-scope fallback still applies and is still announced — this change MUST NOT remove the fallback, because it MUST NOT strand concepts whose copy predates it
