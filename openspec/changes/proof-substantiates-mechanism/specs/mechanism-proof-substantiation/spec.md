## ADDED Requirements

### Requirement: Every `copy` variation's mechanism beat is backed by a named row of the live `brand/proof-points`

A `copy` variation's mechanism beat SHALL lean on **at least one row of the live
`brand/proof-points` table**, and the variation's Vietnamese `comment` SHALL name the row
it leans on. The row SHALL be one the table actually carries this run. Other proof points
the variation presses SHALL remain free to answer the hook's tension without routing
through the mechanism — the requirement is one backed mechanism, not that every proof
point back it.

The run's summary SHALL state, for the section it produced, which proof row backs the
mechanism beat. `ssc-ads-writer` and `ssc-post-produce` SHALL carry this on the line that
already reports the mechanism, and `ssc-post-authority` SHALL carry it on the line that
already reports the mechanism it judged against.

At the market-saturation position `craft/awareness-framework` §2 states for this category,
the mechanism is the sentence that persuades. Today the mechanism rail and the proof rail
never meet: the floor asks only that a mechanism beat exists and is faithful to
`brief.mechanism`, while the proof gates ask only that points are distinct,
family-spread, unswappable and hook-answering. A variation can clear all of them with its
load-bearing claim resting on nothing. Naming the row in the `comment` is what makes the
backing visible to the operator curating in the dashboard, where the reasoning is
otherwise invisible.

#### Scenario: The mechanism beat leans on a traced row

- **WHEN** a `copy` variation is composed for a brief that carries a mechanism
- **THEN** its mechanism beat leans on at least one row of the live `brand/proof-points`
- **AND** the variation's `comment` names that row

#### Scenario: Other proof points stay free

- **WHEN** a variation presses proof points beyond the one backing the mechanism
- **THEN** those points answer the hook's tension on their own terms
- **AND** they are not required to route through the mechanism

#### Scenario: The summary reports the backing

- **WHEN** a run finishes a `copy` set
- **THEN** its summary names the proof row backing the mechanism beat alongside the
  mechanism it wrote to

### Requirement: The search for a backing row SHALL start in the mechanism's own proof family and MAY reach beyond it

The search for a backing row SHALL start in **the proof family the mechanism's own claim
belongs to**, and MAY reach beyond it. The families are the four adopted families
`brand/proof-points` owns (§ Bốn Nhóm Bằng Chứng), read live. A mechanism explains why
something works, so it sits in one of those families by what it claims; which one it sits
in SHALL be judged by reading that section live against the mechanism sentence — never
from a remembered taxonomy, and never by a bank lookup, because provenance is report-only
and `briefs.mechanism` carries the sentence alone.

The starting point is not a fence. A variation MAY press a backing row from **beyond**
that family where a row outside it substantiates the mechanism better, and corroborating
rows from other families are legitimate. What the rule buys is that the *first* place
looked is the family the mechanism already argues from, so the obvious backing is not
skipped in favour of whichever row is easiest to phrase.

Where the backing row sits **outside** the mechanism's own family, the report SHALL say
so. This keeps a reach-beyond visible rather than silent: a mechanism whose backing has
quietly moved to another family is a **re-trace**, which `angle-mechanism-authoring`
forbids — a mechanism whose route is refused is dropped, never re-traced. A visible
out-of-family backing is a corroboration the operator can see and judge; an invisible one
is a re-trace nobody agreed to.

#### Scenario: The mechanism's own family is looked at first

- **WHEN** a variation's mechanism beat needs a backing row
- **THEN** the family the mechanism's claim belongs to is read live from
  `brand/proof-points` § Bốn Nhóm Bằng Chứng and searched first

#### Scenario: A better row outside the family is allowed

- **WHEN** a row beyond the mechanism's own family substantiates the mechanism better
- **THEN** that row may be pressed as the backing
- **AND** the report names it as sitting outside the mechanism's family

#### Scenario: The family is never resolved by a bank lookup

- **WHEN** a skill needs the mechanism's proof family
- **THEN** it reads it from the mechanism sentence against the live
  `brand/proof-points` families
- **AND** it does not look the mechanism up in the `mechanisms` bank, whose provenance is
  report-only and is not carried on the brief

### Requirement: A blank `brief.mechanism` makes the rule inert, and nothing is invented

Where `brief.mechanism` is blank there is no mechanism to back, and this rule SHALL be
**inert**. Production SHALL proceed, the absence SHALL be reported exactly as it already
is, and the run SHALL invent **nothing** to give the rule something to bind to — no
mechanism reconstructed from the brief's prose, the `angle_label`, the idea's `title` or
`hero`, or a sibling angle, and no proof row nominated as backing a mechanism that does
not exist. The variation SHALL NOT be capped, rejected or regenerated on this basis, and
the brief SHALL NOT be re-opened, re-mechanised or reported stale.

Where a run reports the backing, a blank mechanism SHALL be reported as such — the
`NONE — brief carries no mechanism` form — and never as a missing proof row.

A rule that fires on an absent input is how absences get filled. The plugin's standing
position is that an absence is reported and never invented, and a proof-backing rule is
exactly the kind of rule that would tempt a run to manufacture a mechanism so it has
something to satisfy — producing a fabricated doctrinal input dressed as completeness,
which is the worst failure this pipeline can ship. The absence is already handled
correctly today; this change must not disturb that path.

#### Scenario: Production proceeds on a blank mechanism

- **WHEN** a `copy` set is produced from a brief whose `mechanism` is blank
- **THEN** the run proceeds and produces the set
- **AND** no mechanism and no backing proof row is invented

#### Scenario: The blank case triggers no cap and no rejection

- **WHEN** a variation is scored on a brief whose `mechanism` is blank
- **THEN** the proof-backing rule contributes no cap, no rejection and no regeneration
- **AND** the variation is scored on its other merits alone

#### Scenario: The absence is reported as an absence

- **WHEN** a run reports the mechanism backing for a brief with a blank `mechanism`
- **THEN** it reports that the brief carries no mechanism
- **AND** it does not report a missing or unbacked proof row

### Requirement: Proof enhances the hook rather than sitting beside it

The existing rule that every proof must answer the pain the hook opened SHALL be **kept**
and sharpened: a proof point SHALL earn its place by making the tension the hook opened
land **harder**, not by being topically adjacent to it. A proof point that is true,
on-topic, and adds nothing to the named tension SHALL NOT be treated as doing the hook's
work, and SHALL be tied back explicitly or cut.

The current wording admits a proof stack that is topically related to the hook and
persuasively inert — a service brochure whose claims all touch the subject and none of
which sharpen the opening. Requiring enhancement rather than adjacency is what
distinguishes a proof that builds belief from one that only adds length before the CTA.
This sharpens an existing rule; it does not replace it, and the "answers the pain the
hook opened" bar stays in force in its own right.

#### Scenario: An adjacent-but-inert proof does not qualify

- **WHEN** a proof point is true and on the hook's topic but adds nothing to the tension
  the hook named
- **THEN** it is not counted as answering the hook
- **AND** it is either tied back explicitly or cut

#### Scenario: The existing hook rule is not replaced

- **WHEN** the composition rules are read
- **THEN** the requirement that every proof answers the pain the hook opened is still
  stated
- **AND** the enhancement bar is stated as a sharpening of it, not a substitute

### Requirement: A proof line that fails the competitor-swap test is cut at composition, never scored down

A proof line SHALL be **removed before emit**, at composition time, when it **survives**
the competitor-swap test — that is, when swapping "Cambridge" for another wellness brand
leaves the sentence still reading true. It SHALL NOT be emitted and then scored down after
the fact.

The cut SHALL take the **line**, never the **variation**: it is a composition rule, not a
floor item, so it triggers no REJECT, no regenerate-on-its-own-axis pass, and no change to
the six-item floor. The concrete form of a proof always outranks its generic paraphrase,
and the concrete form is whatever the live `brand/proof-points` row actually says.

A swappable proof line is not weak proof, it is not proof at all — scoring it down leaves
filler in the emitted body and asks the operator to curate around it. Removing it at
composition costs the variation one line and leaves the rest of a working asset intact,
which is why the cut is scoped to the line: rejecting the whole variation over one
swappable sentence would throw away a lead, register and length-band slot that was
otherwise sound.

#### Scenario: A swappable line is removed before emit

- **WHEN** a drafted proof sentence still reads true with another wellness brand's name
  in place of Cambridge
- **THEN** that line is cut during composition and never emitted

#### Scenario: The cut does not take the variation with it

- **WHEN** a line is cut for failing the competitor-swap test
- **THEN** the variation itself is still emitted, scored and saved on its remaining merits
- **AND** no floor item fails, no REJECT is raised and no axis-preserving regeneration runs

### Requirement: The rule binds as a composition rule and a scored cap — never as a floor item

The proof-backed mechanism rule SHALL bind at exactly two points: as a **composition
rule** at drafting time, and as a **scored gate** on the brand-fit checklist. A `copy`
variation whose mechanism beat names no traced proof row SHALL **cap at ≤3** on the 1–5
brand-fit signal.

It SHALL NOT be a floor item — it SHALL NOT appear in or extend `craft/copy-floor`'s six
items. It SHALL NOT trigger a REJECT: an unbacked variation is saved with its honest,
capped rating rather than dropped. It SHALL NOT trigger a regenerate-on-its-own-axis pass,
because that path exists for floor failures and refusals, and this is neither.

A floor item is a REJECT, and a REJECT drops a variation and redraws it on the same axis
position — machinery for compliance failures and hard refusals. An unbacked mechanism is a
persuasion weakness an operator can see and judge, not a compliance breach, and it comes
with an inherent judgement call about whether a given row genuinely backs a given claim.
Binding it at floor level would let that judgement call silently destroy otherwise
shippable assets and would require a `craft/copy-floor` revision the change deliberately
does not make. The cap keeps the signal visible where the operator curates while leaving
the floor's meaning intact.

#### Scenario: An unbacked mechanism caps the rating

- **WHEN** a `copy` variation carries a mechanism beat that names no traced proof row
- **THEN** its brand-fit score is capped at 3 or below
- **AND** the reason is stated in its Vietnamese `comment`

#### Scenario: The capped variation is still saved

- **WHEN** a variation is capped for an unbacked mechanism and clears the floor and the
  set's coverage
- **THEN** it is saved as a draft with its capped score
- **AND** it is not dropped, not redrawn, and not held back from the operator

#### Scenario: No floor item is added

- **WHEN** the floor is applied to a variation
- **THEN** it is the six items `craft/copy-floor` states, read live
- **AND** proof-backing of the mechanism is not among them and does not extend `mục 1`

#### Scenario: No regeneration is triggered on this axis

- **WHEN** the only fault found on a variation is an unbacked mechanism
- **THEN** no axis-preserving regeneration pass runs for it
- **AND** no replacement slot is opened in the set

### Requirement: The writer, the producer and the authority carry the same chain, and the authority caps rather than rejects

`ssc-ads-writer`, `ssc-post-produce` and `ssc-post-authority` SHALL all carry the
hook → mechanism → proof chain, and SHALL ship together. `ssc-ads-writer` SHALL
**compose** to it and **score** it. `ssc-post-produce` SHALL **compose** to it and
**record** it, and SHALL score nothing: on the post channel the entire scored gate lives
in `ssc-post-authority`, which SHALL **judge** it — and its criterion SHALL **cap** the
candidate's rating rather than reject it, unlike the other criteria on its `copy`
judgement list, which are rejections.

For `image_content`, the criterion SHALL apply only where the version's bullets carry the
mechanism's proof. Where the version's **density profile emits no bullets**, the criterion
SHALL be **inert** — not a miss, not a cap, and not a reason to push the version toward a
denser profile.

The authority grades what the producer writes. Shipping one without the other makes the
authority judge posts against a bar the writer was never given — a guaranteed stream of
findings on work that was composed correctly under the rules it actually had. The
capping-not-rejecting exception exists for the same reason it exists on the producer side:
the authority's rejections are compliance and hard-refusal machinery, and a persuasion
weakness routed through it would drop sound candidates over a judgement call. A version
whose profile carries no bullets has no place to put the proof, so a criterion that fired
there would push every set toward Standard density and destroy the density menu the image
stage depends on.

#### Scenario: All three skills state the rule

- **WHEN** the change's diff is read
- **THEN** `ssc-ads-writer`, `ssc-post-produce` and `ssc-post-authority` each state the
  proof-backed mechanism rule
- **AND** none of the three ships without the others

#### Scenario: The authority caps an unbacked candidate

- **WHEN** `ssc-post-authority` judges a `copy` candidate whose mechanism beat names no
  traced proof row
- **THEN** the candidate's rating is capped at 3 or below and the reason is named
- **AND** the candidate is **not** rejected, not sent back to the rejection loop, and not
  removed from the set

#### Scenario: A bullet-less image_content version is not faulted

- **WHEN** an `image_content` version's density profile emits no bullets
- **THEN** the proof-backing criterion is inert for that version
- **AND** it is recorded as neither a miss nor a cap, and the version is not pushed to a
  denser profile

#### Scenario: The authority's other criteria are unchanged

- **WHEN** `ssc-post-authority` applies its other `copy` criteria — mechanism presence,
  opening frame, close job, urgency, fabricated real-person material
- **THEN** each still carries the consequence it carries today
- **AND** only the proof-backing criterion caps instead of rejecting

### Requirement: The proof table is read live and never restated in a skill

The rule SHALL name **`brand/proof-points`** and SHALL require reading it live on every
run. No skill SHALL bake a proof row, a figure, a competitor match-up, or a proof line's
wording into its own file as part of this rule, and no run SHALL nominate a backing row
from a remembered version of the table. Where the doc cannot be read, the existing
failed-KB-read behaviour SHALL apply unchanged — the run stops and names the path rather
than proceeding from memory.

`brand/proof-points` is revised on its own cadence and flags its own already-corrected
figures; a copy baked into a skill goes stale silently and then overrides the live doc it
was meant to mirror. A rule that requires naming a specific row is precisely where the
temptation to inline "an example row" is strongest, and an example at this granularity
would be copied instead of the doc being read.

#### Scenario: The backing row comes from the live table

- **WHEN** a run nominates the proof row backing a mechanism beat
- **THEN** it names a row from the `brand/proof-points` content read this run
- **AND** it uses no remembered row, figure or wording

#### Scenario: No proof content enters a skill file

- **WHEN** any of the three skills is read
- **THEN** it names `brand/proof-points` as the source of the backing row
- **AND** it reproduces no proof row, figure, competitor match-up or specimen proof line

#### Scenario: An unreadable proof doc stops the run as it already does

- **WHEN** `brand/proof-points` comes back missing on a run
- **THEN** the run stops and names that path, exactly as it does today
- **AND** no backing row is nominated from memory

### Requirement: The change adds no floor item, moves no coverage bar, and gains no tool

The following SHALL remain unchanged, and no skill SHALL be edited to alter them under
this rule:

- **`craft/copy-floor` gains no item.** The floor stays six items, so this change requires
  no KB revision and no `/ssc-kb` run.
- **`craft/coverage` §4.2's set-level ≥3-distinct proof bar is unchanged** — still
  set-level on every section, still "no variation is required to carry three, and none may
  cram three". A backing row nominated for the mechanism SHALL NOT be counted as, or
  against, that set-level bar.
- **The `proof_device` family axis is unchanged.** The spread stays bounded by the
  period's stated `proofInventory`, and backing the mechanism SHALL NOT reassign, widen or
  override a slot's planned proof family.
- **The early-stage proof-free educational/curiosity `description` variant is kept as
  written** and SHALL NEVER be regenerated to force a proof into it.
- **The mechanism stays read-only from `brief.mechanism`.** No skill SHALL author,
  back-fill, patch or re-open a brief to add one, and none SHALL gain a tool that could.
- **The propose-only invariant is unchanged.** No skill SHALL gain `approve`, `unapprove`,
  `update_status`, or any publish or schedule tool. No new MCP tool, no new field on
  `briefs` or `contents`, and no server change is introduced.

Each item on this list is a rule an implementer could plausibly move while making the
mechanism proof-backed: adding the floor item is the obvious way to enforce it, counting
the backing row toward `§4.2` is the obvious way to reconcile the two proof rules, and
forcing a proof into every `description` is the obvious way to make the rule apply
uniformly. Each of those would change a governed bar in service of a rule that binds
below it, so they are stated as refusals rather than left implicit.

#### Scenario: The floor and the coverage bar hold

- **WHEN** the change's diff is read
- **THEN** `craft/copy-floor`'s six items and `craft/coverage` §4.2's set-level bar are
  quoted, referenced and applied exactly as before
- **AND** no KB revision is proposed and no `/ssc-kb` run is required

#### Scenario: The backing row is not counted toward the set bar

- **WHEN** a set's ≥3-distinct proof coverage is judged
- **THEN** the count is made under `craft/coverage` §4.2 as it stands
- **AND** the mechanism's backing row is neither exempted from nor credited to that count
  by virtue of backing the mechanism

#### Scenario: The proof-free description variant survives

- **WHEN** an early-stage `description` set keeps its non-proof educational/curiosity
  variant
- **THEN** that variant is kept as written
- **AND** it is not regenerated, capped or faulted for carrying no proof

#### Scenario: No tool and no field is added

- **WHEN** the three skills' frontmatter and tool lists are read
- **THEN** none holds `approve`, `unapprove`, `update_status`, or a publish or schedule
  tool
- **AND** no new MCP tool, `briefs` field or `contents` field is introduced by this change
