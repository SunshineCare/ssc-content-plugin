## ADDED Requirements

### Requirement: An angle brief may author an angle-local mechanism override

A brief step that authors an angle SHALL be permitted to author an **angle-local
mechanism override** when, and only when, the inherited mechanism does not serve that
angle's persona × route **and** a better one exists. The absolute rule in
`ssc-brief-core` — that it *never authors, restates or varies a mechanism* — SHALL
therefore become bounded rather than absolute. Where the inherited mechanism does serve the angle, it SHALL be
carried unchanged and the existing write-to-it-never-restate-it rule SHALL apply exactly
as today. An angle that can be written to the inherited mechanism SHALL NOT be
overridden merely because a different mechanism would also work.

The permission SHALL NOT extend to writing anything: the shared core SHALL remain
`capability: view` with no mutation tool, and the override SHALL be returned to the
caller, which owns every save.

An ads subject fans into several angle briefs across personas and routes, and a mechanism
that genuinely explains one persona's objection can be simply wrong for another's. Today
the only honest outcome for that case is to drop the angle as a misfit, which loses a
persona the subject genuinely fits. The absolute rule was protecting against one subject
sprouting contradictory mechanisms with nobody noticing — the bounded rule keeps that
protection by making every departure grounded, proof-routed and reported.

#### Scenario: A fitting inherited mechanism is carried, not overridden

- **WHEN** the idea's mechanism serves this angle's persona × route
- **THEN** the angle is written to it unchanged
- **AND** no override is authored

#### Scenario: A misfit with a better mechanism becomes an override

- **WHEN** the inherited mechanism does not serve this angle's persona × route and a
  better one exists
- **THEN** the angle carries its own mechanism as an override
- **AND** the angle is not dropped as a misfit for that reason alone

#### Scenario: The core still writes nothing

- **WHEN** an override is authored
- **THEN** the shared core returns it to the caller
- **AND** the core makes no save and holds no mutation tool

### Requirement: An override is bank-first and meets the doctrine's definition read live

An override SHALL be sourced **bank-first**, exactly as the Approaches supply is: a
fitting entry in `craft/mechanism-bank` SHALL be preferred, and a new mechanism SHALL be
authored only where no entry fits, in which case it SHALL be marked `in_bank: false`. The
override SHALL be judged against `craft/doctrine` §2 **read live**, and SHALL meet the
same definition every other mechanism meets. No skill file SHALL restate that definition,
a bank entry, or a bank `id`.

Two sourcing rules for one kind of object is how the two drift apart. Making the brief
bank-first also means an override that is genuinely reusable is already in the library
rather than being invented a second time next period, and a bank-sourced override needs
no harvest at all.

#### Scenario: A fitting bank entry supplies the override

- **WHEN** a bank entry fits the angle's persona × route better than the inherited
  mechanism
- **THEN** that entry supplies the override
- **AND** the override names its `bank_id`

#### Scenario: An authored override is marked as such

- **WHEN** no bank entry fits
- **THEN** the override is authored and marked `in_bank: false`

#### Scenario: The definition is read, never remembered

- **WHEN** an override is judged
- **THEN** `craft/doctrine` §2 is read live for the definition
- **AND** a failed read stops the run rather than falling back to a remembered version

### Requirement: An override is grounded in an attributed voice-of-customer item from the approved Approaches document

An override SHALL be grounded in an **attributed voice-of-customer item taken from the
approved Approaches document for this period**. The brief step SHALL run **no
voice-of-customer pass of its own**, SHALL open no second outward account of the period,
and SHALL hold no fetch or search tool for that purpose. A phrase it cannot attribute to
that document SHALL NOT support an override.

The period gets exactly one outward pass and one compiled reading of what customers are
saying, and an operator has already approved that reading. A brief that gathered its own
would produce a second, unreviewed account of the same month that silently outranks the
approved one at the exact moment a departure is being justified — which is the moment it
matters most that the evidence is one an operator has seen.

#### Scenario: An unattributable phrase supports no override

- **WHEN** the justification for an override cannot be traced to an item in the approved
  Approaches document
- **THEN** no override is authored
- **AND** the angle falls back to the inherited mechanism or returns below bar

#### Scenario: No second outward pass at brief time

- **WHEN** the brief step authors an override
- **THEN** it runs no voice-of-customer pass and performs no outward search

### Requirement: An override is proof-routed from this period's inventory and dropped when compliance refuses it

An override SHALL carry a proof route selected only from **this period's stated proof
inventory**, on the same terms as an Approaches candidate. An override whose only proof
route is refused by `rules/compliance` SHALL be **dropped** — not softened, not re-traced
onto a family the compliance document did not clear — and the angle SHALL fall back to
the inherited mechanism or return below bar.

An override is a departure from the mechanism an operator approved on the subject, so it
must clear at least the bar the approved one cleared. Softening or re-tracing a refused
route would let a compliance refusal be routed around by moving the mechanism down one
level, which is the one direction this permission must not open.

#### Scenario: A refused route drops the override

- **WHEN** an override's only proof route is refused by `rules/compliance`
- **THEN** the override is dropped
- **AND** it is neither softened nor re-traced onto another family

#### Scenario: The route comes from this period's inventory

- **WHEN** an override is proposed
- **THEN** its proof route is selected from this period's stated proof inventory
- **AND** where that inventory is absent, the route is marked unverified for the period
  rather than assumed

### Requirement: An override's blast radius is the one angle it was authored for

An override SHALL be **angle-local, always**. `idea.mechanism` SHALL NEVER be written,
patched, or demoted by a brief step. Sibling angles on the same idea SHALL NEVER be
re-opened, re-run, re-scored, or reported as stale because another angle overrode. The
guarantee the system makes SHALL become **one angle, one mechanism** — it SHALL NO LONGER
be stated anywhere as *one subject, one mechanism*.

The subject-level mechanism is what an operator approved when they approved the idea, and
an angle written later has no standing to revise it. Keeping the write angle-local is
also what keeps an override cheap: nothing already approved has to be revisited, no
downstream run is invalidated, and an override that turns out to be wrong costs exactly
one angle.

#### Scenario: The idea's mechanism is untouched

- **WHEN** an angle authors an override
- **THEN** `idea.mechanism` is not written, patched or demoted
- **AND** the idea's own mechanism remains what the operator approved

#### Scenario: Sibling angles are unaffected

- **WHEN** one angle of an idea carries an override
- **THEN** the idea's other angles are not re-opened, re-run or reported stale

#### Scenario: The guarantee is restated correctly

- **WHEN** the system's mechanism guarantee is stated in prose
- **THEN** it reads *one angle, one mechanism*
- **AND** no file still claims *one subject, one mechanism*

### Requirement: Every override is reported, naming its provenance

An override SHALL always be reported in the run's output, naming the angle it applies to,
the inherited mechanism it departed from, the reason it did not serve that angle's
persona × route, and its provenance — either the `bank_id` it was drawn from or
`in_bank: false`.

A departure a human cannot see is indistinguishable from drift. The report is the only
place an operator learns that an approved subject's angle now argues a different
mechanism, and the provenance line is what tells them whether they are reading a draw
from a library they govern or something authored this run.

#### Scenario: The report names the departure and its provenance

- **WHEN** a run authors one or more overrides
- **THEN** the report names each angle, its inherited mechanism, the reason for the
  departure, and either the `bank_id` or `in_bank: false`

#### Scenario: A run with no override says so

- **WHEN** no angle in the run overrides
- **THEN** the report states that every angle carries its idea's mechanism

### Requirement: Downstream consumers resolve the brief's override first, then the idea's

`ssc-ads-writer` SHALL resolve the mechanism it writes to as **the brief's override if
present, otherwise the idea's**. It SHALL still never restate, vary, sharpen, soften or
contradict whichever one it resolved, and SHALL still never invent one. Its existing
legacy tolerance SHALL be unchanged: where neither the brief nor the idea carries a
mechanism, production proceeds, the absence is reported, and nothing is fabricated.

A resolution order stated once and applied everywhere is what stops two consumers of the
same brief writing to two different mechanisms. Writing to the override is the whole
point of authoring one; writing to the idea's instead would silently discard the
departure an operator was shown.

#### Scenario: The override wins where present

- **WHEN** a brief carries a mechanism override
- **THEN** the writer writes the mechanism beat to that override
- **AND** does not write to the idea's mechanism for that asset

#### Scenario: The idea's mechanism is used where no override exists

- **WHEN** a brief carries no override
- **THEN** the writer writes to the idea's mechanism, exactly as before this change

#### Scenario: Neither present is still not an error

- **WHEN** neither the brief nor the idea carries a mechanism
- **THEN** production proceeds, the absence is named in the summary, and no mechanism is
  invented

### Requirement: The rule is written channel-agnostically even though it is in practice an ads affordance

The override rule SHALL be written channel-agnostically in the shared brief core, because
that core is shared. A post has **exactly one angle**, so a post's single brief has no
sibling angle a mechanism could serve differently and the permission is in practice an
ads-channel affordance. No skill SHALL branch this rule on channel name, and no skill
SHALL restate the rule in a channel-shaped copy of its own.

Channel-shaped copies of a shared rule diverge the day one is edited and the stale copy
wins wherever it is read first — the same reasoning that put the sophistication read, the
voice-of-customer pass and the mechanism supply in one shared file.

#### Scenario: A post brief may still override in principle

- **WHEN** a post's single angle cannot be written to the idea's mechanism and a better
  one is available
- **THEN** the same bounded permission and the same preconditions apply

#### Scenario: No channel branch on this rule

- **WHEN** the brief core is read
- **THEN** the override rule is stated once and does not branch on channel

### Requirement: The persistence contract the `content` repository must provide

For an override to be persisted, the BrandOS server SHALL provide all of the following:
a nullable text column `briefs.mechanism`; acceptance of `mechanism` by `save_brief` and
its addition to `edit(entity='brief')`'s allowlist as an **ordinary, non-approval-bearing
field**; return of `mechanism` by `get_brief` and `list_briefs`; and return of
`mechanism` by `get_idea` and `list_ideas`, which do **not** return it today.

Because `brief.mechanism` is an ordinary field, `hooks/approval-gate.mjs` and its matchers
SHALL be untouched and no new approval gate SHALL appear. The plugin's propose-only
invariant SHALL be unchanged: no skill gains `approve`, `unapprove`, `update_status`, or
any publish or schedule tool.

The last item is not optional. An override rule is unsound while the brief cannot read
what it is overriding — `ssc-post-ideate` already documents that a mechanism can be
written but not read back, and works around it by declining to reconstruct one from the
title. Making `mechanism` approval-bearing, by contrast, would invent a second gate on a
field that carries no spend and no publish consequence, and would drag the governance
hook into a change that has no governance content.

#### Scenario: The override round-trips

- **WHEN** a brief with an override is saved and read back
- **THEN** `get_brief` and `list_briefs` return its `mechanism`

#### Scenario: The inherited mechanism is readable at brief time

- **WHEN** the brief step resolves the idea it is briefing
- **THEN** `get_idea` returns the idea's `mechanism`
- **AND** the brief step does not reconstruct a mechanism from the title

#### Scenario: No new gate appears

- **WHEN** `edit(entity='brief', patch={ mechanism })` is called
- **THEN** it is treated as ordinary draft authoring
- **AND** `hooks/approval-gate.mjs` and its matchers are unchanged

### Requirement: Until the server fields exist, an override is reported and not persisted

Until the persistence contract above has landed, an authored override SHALL be
**reported and not persisted**, and the run SHALL say so explicitly, so the absence
cannot be mistaken for a bug. No skill SHALL work around the gap by writing the override
into another field — not into a narrative field, not into the brief's `angle_label`, and
not onto `idea.mechanism`.

The plugin side and the server side are separate repositories on separate approvals, so
the plugin work must not assume the server work has landed. Reported-but-unpersisted is a
degraded state that is still coherent: the operator sees the departure and its reasoning,
and nothing downstream reads a mechanism from a field that was never meant to hold one.
Smuggling it into another field would produce a value no consumer resolves and a brief
whose stored fields disagree with the reasoning that produced them.

#### Scenario: The degraded state is stated, not silent

- **WHEN** an override is authored and `briefs.mechanism` is not yet available
- **THEN** the run reports the override and states that it was not persisted

#### Scenario: No field is repurposed to hold it

- **WHEN** an override cannot be persisted
- **THEN** it is written into no other brief field and onto no idea field
