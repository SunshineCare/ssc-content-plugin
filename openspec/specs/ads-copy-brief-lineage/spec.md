# ads-copy-brief-lineage

## Purpose

Every ad `content` row records the **angle brief it was written from**, so a consumer
that needs "the approved copy for *this* angle" can resolve it by `brief_id` and trust
the answer. `ssc-ads-writer` passes the `brief_id` it was invoked with on every save;
the server refuses an ad content save that omits one. Content is **brief-keyed** —
`brief_id` is the sole lineage link, and an ad content row carries no `idea_id` at all.

> Tool naming: `save_post_content` → **`save_content`** and `list_post_content` →
> **`list_content`** (renamed server-side). Requirements below use the live names.

## Requirements

### Requirement: Ad content rows record the angle brief they were written from

`ssc-ads-writer` SHALL pass `brief_id` to `save_content` on every save, for every section it produces (`copy`, `headline`, `description`, `image_content`). The value MUST be the `brief_id` the skill received as a required input and wrote that section from — the skill MUST NOT derive, infer, or guess a brief (not "the idea's only brief", not the most recent, not the first approved).

The skill MUST NOT omit the argument. For `ad` content `brief_id` is **REQUIRED**: the server refuses an omitted one (`brief_id_required`) and writes nothing. The skill SHALL state in prose why the argument is mandatory, because the historical hazard it prevents is invisible in the stored data: before the refusal shipped, the server bound `brief_id` for ad content **by INFERENCE**, choosing one of the idea's several approved briefs, so an omitted argument produced a row stamped with an angle the skill never chose — indistinguishable from a chosen stamp and undetectable downstream.

#### Scenario: Copy saved with its brief

- **WHEN** `ssc-ads-writer` saves a passing `copy` variation written from approved brief `B`
- **THEN** the `save_content` call carries `brief_id = B`, and a subsequent `list_content(brief = B)` returns that row

#### Scenario: Every section carries the lineage, not just copy

- **WHEN** `ssc-ads-writer` saves a `headline`, `description`, or `image_content` variation written from approved brief `B`
- **THEN** each saved row carries `brief_id = B` — the lineage is recorded for all four sections, not only the one that gates downstream work

#### Scenario: The brief is never inferred by the skill

- **WHEN** the skill is about to save a variation
- **THEN** it uses the `brief_id` it was invoked with and resolved via `get_brief`, and it MUST NOT select a brief by any other means (not "the idea's only brief", not the most recent, not the first approved)

#### Scenario: Omitting brief_id on ad content is refused

- **WHEN** an ad content save omits `brief_id`
- **THEN** the server refuses it (`brief_id_required`) and writes nothing — it does not infer a brief, and it does not leave a null

### Requirement: Downstream consumers resolve copy by angle

A consumer that needs "the approved copy for *this* angle" SHALL resolve it by filtering `list_content` on `brief_id`. `/ssc-image-prompt`'s approved-copy gate SHALL take its brief-scoped path — the normal path.

The lineage SHALL be treated as trustworthy only for rows written after the writer began passing `brief_id` explicitly. It MUST NOT be assumed correct for older rows, and a consumer MUST NOT rely on any downstream check to catch a wrong one — there is none.

#### Scenario: The image skill's copy gate matches at brief scope

- **WHEN** `/ssc-image-prompt` runs for brief `B` and the approved `copy` rows carry a `brief_id`
- **THEN** its gate matches only rows with `brief_id = B`, and its output summary declares that copy was matched at **brief scope** — the normal path

#### Scenario: A wrong stamp is undetectable downstream

- **WHEN** an ad `copy` row carries a `brief_id` other than the angle it was written from — whether server-inferred (pre-refusal) or supplied by an invocation against the wrong brief
- **THEN** the brief-scoped filter still matches that row, no error is raised and no result looks empty, and the visual is grounded in another angle's story at generation-credit cost — the silent failure this capability exists to reduce

#### Scenario: Rows with no lineage at all remain the fallback's business

- **WHEN** an idea's approved `copy` rows carry no `brief_id` at all (a legacy row written before the lineage was recorded)
- **THEN** `/ssc-image-prompt` applies its own narrowed fallback — idea scope only when the idea has exactly ONE brief, announced as a fallback; STOP when the idea has more than one — and this capability neither removes, widens, nor otherwise alters that rule

### Requirement: The server rejects ad content saved without a brief, and never infers one

**Server-side requirement (BrandOS MCP), not implementable in this repo. SHIPPED.** For `ad` content, `save_content` SHALL **reject** a call that omits `brief_id` (`brief_id_required`) and write nothing. It MUST NOT infer, guess, or otherwise bind a brief for `ad` content. For `post` content the existing behaviour is unchanged: the idea's single brief SHALL still resolve server-side when `brief_id` is omitted, and an explicit value SHALL still win on any channel.

Inference is defensible for `post` content, where the idea's single brief resolves unambiguously, and indefensible for `ad` content, where the idea carries N approved angles and the inferred brief is a pick out of several — a stamped angle the caller never chose. The caller always knows the angle it wrote from, so a server guess adds no information and can only ever be wrong. Refusing converts an invisible wrong answer into a visible error at the only moment a caller can still fix it.

#### Scenario: An ad content save without brief_id is refused and writes nothing

- **WHEN** `save_content` is called with `channel='ad'` and no `brief_id`
- **THEN** the call is refused with `brief_id_required`, no `content` row is created or updated, and no brief is inferred or stamped

#### Scenario: A post content save without brief_id still resolves server-side

- **WHEN** `save_content` is called with `channel='post'` and no `brief_id`
- **THEN** the server resolves the idea's single brief as it does today — the rejection applies to `ad` content only, and an explicit `brief_id` continues to win on any channel

#### Scenario: An explicit brief_id is authoritative on ad content

- **WHEN** `ssc-ads-writer` calls `save_content` with `channel='ad'` and the `brief_id` it wrote the section from
- **THEN** the call succeeds, the row is stamped with exactly that `brief_id`, and the server derives the owning idea and channel from it

### Requirement: Content rows with a NULL brief_id are purged

**Server-side requirement (BrandOS MCP), not implementable in this repo.** `content` rows whose `brief_id` **IS NULL** SHALL be **deleted**. Such a row cannot be attributed to any angle, MUST NOT be consumed by any downstream step, and cannot be repaired by the plugin — which has no record of which angle each historical row was written from. It is exactly the row that makes `/ssc-image-prompt` STOP rather than risk grounding a visual in the wrong angle's story. These rows are unusable, not merely untidy.

The purge SHALL be a **one-time** cleanup, because a NULL `brief_id` on ad content is unreachable once two rules hold: this capability's rejection requirement closes the write path, and `ads-angle-set-curation` replaces `content.brief_id ON DELETE SET NULL` with a cascade that hard-deletes an angle's copy along with the angle. Verified 2026-07-30 against live prod: with both deployed, `content` held 336 rows and **zero** with a NULL `brief_id` — the cleanup had no cohort to remove.

#### Scenario: Lineage-less content rows are deleted

- **WHEN** the server sweeps `content` rows and finds rows whose `brief_id` IS NULL
- **THEN** those rows are deleted, because a content row with no angle can never be safely consumed and cannot be repaired by the plugin

#### Scenario: A NULL brief_id on ad content is unreachable once both rules hold

- **WHEN** both the ad-content rejection requirement and the brief-delete cascade are in force
- **THEN** no ad `content` row can acquire a NULL `brief_id` from any direction — a save without one is refused, and deleting a brief hard-deletes its content instead of unbinding it

#### Scenario: The purge does not touch wrongly-stamped rows

- **WHEN** an ad content row carries a **wrong** `brief_id` — populated, but not the angle it was written from
- **THEN** the purge leaves it untouched, since it is not null and is indistinguishable from a correct row

### Requirement: Wrong-stamp attribution is a caller defect, not a server one

A populated-but-wrong `brief_id` SHALL NOT be assumed to be an artifact of the retired server inference. An audit of 46 rows on one four-brief idea (2026-07-30) found mis-homed rows in the **post-refusal** cohort too, where the writer did pass an explicit `brief_id` — so the residual cause is the **caller being invoked against the wrong brief**, which no server-side rule can catch.

Consequently the lineage caution in the `ssc-image-prompt-*` skills SHALL remain in force even though the rejection requirement has shipped: the stamp is good enough to gate on and strictly better than guessing, but it is not infallible, and a visual telling the wrong angle's story SHALL be diagnosed by checking the row's `brief_id` first.

#### Scenario: An explicit stamp can still be the wrong angle

- **WHEN** an ad content row was saved with an explicit `brief_id` supplied by the writer
- **THEN** the row is well-formed and passes every server rule, yet may still name an angle other than the one the section was written from, because the writer was anchored to the wrong brief at invocation

#### Scenario: Auditing a stamp compares against hook_direction, not angle_label

- **WHEN** a row's stored Vietnamese `comment` is used as the signal for recovering which angle it was written from
- **THEN** the comparison is made against each candidate brief's `hook_direction`, not its `angle_label` or `core_message` — sibling angles on one idea routinely share a `core_message` opener, so that field discriminates nothing, and proof-led sections (`headline`, `description`, `image_content`) reuse the same proof points across every angle, leaving many rows indeterminate by this method
