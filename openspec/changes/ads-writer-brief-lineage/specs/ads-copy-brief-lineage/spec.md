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

### Requirement: The server rejects ad content saved without a brief, and never infers one

**Server-side requirement (BrandOS MCP), not implementable in this repo.** For `ad` content, `save_post_content` SHALL **reject** a call that omits `brief_id` — an `invalid_input`-class refusal — and it MUST write nothing on that call. It MUST NOT infer, guess, or otherwise bind a brief for `ad` content. For `post` content the existing behaviour is unchanged: the idea's single brief SHALL still be resolved server-side when `brief_id` is omitted, and an explicit value SHALL still win on any channel.

Inference is defensible for `post` content, where the idea's single brief resolves unambiguously, and indefensible for `ad` content, where the idea carries N approved angles and the inferred brief is a pick out of several — a stamped angle the caller never chose, indistinguishable from a chosen one, and undetectable downstream. The caller always knows the angle it wrote from (`ssc-ads-writer` takes `brief_id` as a required input), so a server guess adds no information and can only ever be wrong. Refusing converts an invisible wrong answer into a visible error at the only moment a caller can still fix it.

#### Scenario: An ad content save without brief_id is refused and writes nothing

- **WHEN** `save_post_content` is called with `channel='ad'` and no `brief_id`
- **THEN** the call is refused with an `invalid_input`-class error, no `content` row is created or updated, and no brief is inferred or stamped

#### Scenario: A post content save without brief_id still resolves server-side

- **WHEN** `save_post_content` is called with `channel='post'` and no `brief_id`
- **THEN** the server resolves the idea's single brief as it does today — the rejection applies to `ad` content only, and an explicit `brief_id` continues to win on any channel

#### Scenario: An explicit brief_id is still honoured on ad content

- **WHEN** `ssc-ads-writer` calls `save_post_content` with `channel='ad'` and the `brief_id` it wrote the section from
- **THEN** the call succeeds and the row is stamped with exactly that `brief_id` — the plugin fix needs no server change and does not wait on this requirement

### Requirement: Content rows with a NULL brief_id are purged

**Server-side requirement (BrandOS MCP), not implementable in this repo.** Existing `content` rows whose `brief_id` **IS NULL** SHALL be **deleted**. Such a row cannot be attributed to any angle, MUST NOT be consumed by any downstream step, and cannot be repaired by the plugin — which has no record of which angle each historical row was written from. It is exactly the row that makes `/ssc.image` STOP rather than risk grounding a visual in the wrong angle's story. These rows are unusable, not merely untidy.

The purge SHALL be a **one-time** cleanup, because a NULL `brief_id` on ad content becomes unreachable once two changes land: this capability's rejection requirement closes the write path (no ad content row can be created without a `brief_id`), and the sibling change `ads-angle-set-curation` closes the other path by replacing `content.brief_id ON DELETE SET NULL` with a cascade that hard-deletes an angle's copy along with the angle. The purge SHOULD therefore be run after both, or it will have to be run again.

#### Scenario: Lineage-less content rows are deleted

- **WHEN** the server sweeps `content` rows and finds rows whose `brief_id` IS NULL
- **THEN** those rows are deleted, because a content row with no angle can never be safely consumed and cannot be repaired by the plugin

#### Scenario: A NULL brief_id on ad content is unreachable after both changes

- **WHEN** both the ad-content rejection requirement and `ads-angle-set-curation`'s delete cascade have landed
- **THEN** no ad `content` row can acquire a NULL `brief_id` from any direction — a save without one is refused, and deleting a brief hard-deletes its content instead of unbinding it — which is what makes the purge a one-time cleanup rather than a recurring chore

#### Scenario: The purge does not touch wrongly-stamped rows

- **WHEN** an ad content row carries a **wrong** (server-inferred) `brief_id` — populated, but not the angle it was written from
- **THEN** the purge leaves it untouched, since it is not null and is indistinguishable from a correct row; whether such rows get audited remains an open question (see design.md), for which the row's Vietnamese `comment` — which usually names the brief it was written from — is the cheapest available signal
