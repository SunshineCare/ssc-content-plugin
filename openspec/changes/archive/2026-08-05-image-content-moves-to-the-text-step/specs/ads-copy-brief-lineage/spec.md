## MODIFIED Requirements

### Requirement: Ad content rows record the angle brief they were written from

`ssc-ads-writer` SHALL pass `brief_id` to `save_content` on every save, for every section it produces (`copy`, `headline`, `description`). `ssc-image-prompt-text` SHALL pass it under the same rule on every `image_content` row it saves. The value MUST be the `brief_id` the skill received as a required input and wrote that section from — neither skill MUST derive, infer, or guess a brief (not "the idea's only brief", not the most recent, not the first approved).

Neither skill MUST omit the argument. For `ad` content `brief_id` is **REQUIRED**: the server refuses an omitted one (`brief_id_required`) and writes nothing. The skill SHALL state in prose why the argument is mandatory, because the historical hazard it prevents is invisible in the stored data: before the refusal shipped, the server bound `brief_id` for ad content **by INFERENCE**, choosing one of the idea's several approved briefs, so an omitted argument produced a row stamped with an angle the skill never chose — indistinguishable from a chosen stamp and undetectable downstream.

#### Scenario: Copy saved with its brief

- **WHEN** `ssc-ads-writer` saves a passing `copy` variation written from approved brief `B`
- **THEN** the `save_content` call carries `brief_id = B`, and a subsequent `list_content(brief = B)` returns that row

#### Scenario: Every section carries the lineage, not just copy

- **WHEN** `ssc-ads-writer` saves a `headline` or `description` variation written from approved brief `B`
- **THEN** each saved row carries `brief_id = B` — the lineage is recorded for every section, not only the one that gates downstream work

#### Scenario: On-image copy carries the same lineage from its new author

- **WHEN** `ssc-image-prompt-text` saves an `image_content` candidate for approved brief `B`
- **THEN** the `save_content` call carries `brief_id = B`, the id the step was invoked with and resolved via `get_brief`

#### Scenario: The brief is never inferred by the skill

- **WHEN** the skill is about to save a variation
- **THEN** it uses the `brief_id` it was invoked with and resolved via `get_brief`, and it MUST NOT select a brief by any other means (not "the idea's only brief", not the most recent, not the first approved)

#### Scenario: Omitting brief_id on ad content is refused

- **WHEN** an ad content save omits `brief_id`
- **THEN** the server refuses it (`brief_id_required`) and writes nothing — it does not infer a brief, and it does not leave a null
