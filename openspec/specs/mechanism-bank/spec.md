# mechanism-bank

## Purpose

The `craft/mechanism-bank` knowledge-base document and the skills that draw on it:
a standing, governed supply of mechanisms an operator can read as a set and a revision
cycle can improve, so the craft half of Approaches stops being re-derived every month.
`ssc-approaches-core` builds each period's candidate supply **bank-first** — matching
entries against that period's voice-of-customer pass before authoring anything — and
marks gap-fill invention `in_bank: false` so the two are never confused downstream.
Consumption is capped by valence, not authoring. `ssc-kb-mechanism-harvest` grows the
bank propose-only, through the existing KB revision review screen.

## Requirements

### Requirement: The bank is a knowledge-base document with a fixed three-section contract

The mechanism bank SHALL be a single knowledge-base document at `craft/mechanism-bank`,
category `craft`, written in Vietnamese as structured Markdown. It SHALL carry exactly
three sections: **§1** what the document is, **§2** the valence vocabulary and its
priority rule, and **§3** the bank itself. §1 SHALL point at `craft/doctrine` §2 for the
**definition** of a mechanism — what qualifies, what does not, and the mandatory
mechanism beat it feeds — and SHALL NOT restate any part of that definition. §2 SHALL
define exactly two valence values, `positive` (why this works; what builds the result)
and `negative` (why past attempts fail; what quietly undoes progress), and SHALL state
that `positive` is the default and the priority while `negative` is a minority device
capped at consumption time.

The document's Vietnamese entries are brand content seeded by the operator in BrandOS
and are not a repository artifact; this change ships the structure and the §1/§2 rules
only.

One rule, one home. The doctrine already owns what a mechanism *is*, and a second copy
of that definition inside the bank would diverge the day either is edited, with the
stale copy winning wherever it is read first. `id` uniqueness and valence legality are
conventions of the document, enforced by nothing — the accepted cost of keeping the bank
in Markdown that an operator can read and revise as a set.

#### Scenario: The definition is pointed at, not copied

- **WHEN** §1 of the bank is read
- **THEN** it names `craft/doctrine` §2 as the definition of a mechanism
- **AND** it restates no part of what qualifies, what does not, or the beat it feeds

#### Scenario: Valence has exactly two values and a stated priority

- **WHEN** §2 of the bank is read
- **THEN** the only valence values are `positive` and `negative`
- **AND** `positive` is stated as the default and the priority

### Requirement: Every bank entry carries six fields, and `fits` is described rather than persona-named

Each entry in §3 SHALL be one `###` block carrying exactly these fields: `id` (a short
stable slug, so a skill can name a mechanism without quoting it), `mechanism` (the one
specific Vietnamese sentence), `valence` (`positive` or `negative`), `fits` (which
triggers, objections or myths it answers), `proof_family` (which `brand/proof-points`
family its trace would lean on), and `notes` (what it is not; where it has failed).

`fits` SHALL be written as a **description** of the trigger, objection or myth. It SHALL
NOT name a persona, and no entry SHALL be keyed to, scoped to, or filed under a persona.

The persona roster is open and is revised on its own cadence. An entry keyed to a
persona name would have to be rewritten whenever a persona is added or retired, and
would quietly become a second, unreviewed roster competing with `brand/personas`.
Describing the trigger instead lets any persona whose detail doc records that trigger
draw on the entry, which is what makes the bank a shared library rather than a set of
per-persona lists.

#### Scenario: An entry names a trigger, not a persona

- **WHEN** a bank entry's `fits` field is read
- **THEN** it describes the trigger, objection or myth the mechanism answers
- **AND** it names no persona

#### Scenario: A newly added persona needs no bank edit

- **WHEN** a persona is added to `brand/personas`
- **THEN** no bank entry requires a change for that persona to draw on it

### Requirement: The bank is a static library and records no usage

The bank SHALL record no usage history, no last-used period, and no retired state. No
skill SHALL write such a field onto an entry, and no skill SHALL rotate, expire or
retire an entry on the basis of when it was last drawn.

Rotation stays where it already lives and already works: the per-period concentration
cap at Ideate. Cross-period bookkeeping written in prose with nothing enforcing it would
be stale within two periods and would present itself as a fact, and the concentration
failure it would address is already bounded inside a single period.

#### Scenario: No usage field is written

- **WHEN** any skill in this change interacts with the bank
- **THEN** it writes no usage count, no last-used period and no retired flag

#### Scenario: Rotation stays at Ideate

- **WHEN** one mechanism would repeat across a period
- **THEN** the correction is Ideate's per-period concentration cap
- **AND** the bank is not consulted for when the entry was last used

### Requirement: The shared core reads the bank live, and a failed read stops the run

`ssc-approaches-core` SHALL add `craft/mechanism-bank` to the documents it reads live in
its knowledge-base load step, on every run. The existing failed-read rule SHALL apply to
it unchanged: check `missing`, retry once, and if it still does not resolve **STOP the
run, produce no block, and name the document that could not be read**. The core SHALL
NOT proceed from a remembered bank, SHALL NOT paraphrase the bank from its own file, and
SHALL restate no entry — no mechanism sentence, no `id`, and no valence example SHALL
appear in any skill file.

The bank is revised on its own cadence through the knowledge-base revision cycle, so a
baked-in copy goes stale silently and then overrides the live document it was meant to
reflect. A stopped run is recoverable in a way a silently-stale one is not.

#### Scenario: The bank is loaded every run

- **WHEN** the core runs
- **THEN** it reads `craft/mechanism-bank` live alongside the other doctrine documents
- **AND** it does so regardless of what the caller says it already loaded

#### Scenario: An unreadable bank stops the run

- **WHEN** `craft/mechanism-bank` comes back missing or unreadable after one retry
- **THEN** the run stops and names that document
- **AND** no candidate-mechanism supply is produced from a remembered version

#### Scenario: No bank content is written into a skill file

- **WHEN** any skill file changed by this capability is read
- **THEN** it names `craft/mechanism-bank` and its section
- **AND** it contains no mechanism sentence, no bank `id` and no valence example

### Requirement: The candidate supply is built bank-first, and every drawn candidate names its `bank_id`

The core SHALL build its candidate-mechanism supply by **matching bank entries against
the voice-of-customer items its own pass found for this period, before authoring
anything new**. Every candidate drawn from the bank SHALL name the `bank_id` it came
from.

Re-derivation is the expensive half of the Approaches step and the half that does not
need to be per-period. The voice-of-customer reading genuinely changes month to month;
the craft of why something works does not. Naming the `bank_id` is also what lets every
downstream reader — and the harvest path — tell a draw from an invention without
guessing.

#### Scenario: A fitting entry is drawn rather than re-authored

- **WHEN** a bank entry's `fits` matches a voice-of-customer item this period surfaced
- **THEN** that entry supplies the candidate
- **AND** the candidate names that entry's `bank_id`

#### Scenario: Matching happens before authoring

- **WHEN** the core builds the supply
- **THEN** it matches the bank against this period's voice-of-customer items first
- **AND** it authors a new candidate only where the match found nothing

### Requirement: Gap-fill is the only invention the core makes, and it is visibly marked

Where no bank entry fits a voice-of-customer item, the core SHALL author a new candidate
and SHALL mark it `in_bank: false`. That flag SHALL be carried on the returned candidate.
Gap-fill SHALL be the only place the core authors a mechanism that is not in the bank.

An invented mechanism must be visibly invented. The flag is what the harvest path later
acts on, and it is also what stops the bank's authority being quietly claimed by
something no operator has ever seen.

#### Scenario: A gap is filled and marked

- **WHEN** a voice-of-customer item is matched by no bank entry
- **THEN** the core authors a candidate for it
- **AND** returns that candidate with `in_bank: false`

#### Scenario: An invention is never presented as a draw

- **WHEN** the core returns an authored candidate
- **THEN** its `bank_id` is `null` and `in_bank: false` is stated
- **AND** no bank `id` is attached to it

### Requirement: The bank saves the authoring, never the grounding

A bank entry SHALL still require an **attributed voice-of-customer quote from this
period** before it may be supplied as a candidate. A bank entry with nothing this period
to explain SHALL NOT be supplied. The bank SHALL NOT relax, substitute for, or stand in
place of the grounding requirement.

The bank removes the cost of writing the mechanism sentence again; it says nothing about
whether this month's readers are actually saying the thing that mechanism explains. A
supply drawn from the bank alone would be a standing list dressed as a reading of the
period, which is exactly the blandness the voice-of-customer pass exists to prevent.

#### Scenario: A bank entry with no live quote is not supplied

- **WHEN** a bank entry fits nothing this period's voice-of-customer pass recorded
- **THEN** it is not included in the supply

#### Scenario: A drawn candidate still carries its quote

- **WHEN** a candidate names a `bank_id`
- **THEN** it still carries the quoted, attributed voice-of-customer item it explains

### Requirement: Every other supply constraint is unchanged by the bank

The bank SHALL NOT change any other rule governing the candidate supply. A candidate's
proof route SHALL be selected only from this period's stated `head.proofInventory`, and
where that inventory is absent every candidate's route SHALL be marked
`unverified_for_period` rather than assumed. A candidate whose only proof route is
refused by `rules/compliance` SHALL be **dropped, not softened and not re-traced** onto a
family the compliance document did not clear — this applies to a bank draw exactly as it
applies to an invention. Indirectness SHALL be judged against the **inherited**
sophistication read, and where the quarter states none, no bar SHALL be derived. Both
existing volume floors SHALL stand unchanged: one candidate per featured persona, and
enough candidates that no single one would have to carry more than about a quarter of the
period's planned assets.

An entry's presence in the bank is evidence that the brand has articulated the
mechanism, not that it is compliant this period, provable from this period's inventory,
or indirect enough for the read the quarter set. Treating a bank draw as pre-cleared is
the one way a governed library becomes a bypass. The bank makes the floors cheaper to
reach; it does not lower them.

#### Scenario: A compliance-refused bank draw is dropped

- **WHEN** a candidate drawn from the bank has only one proof route and `rules/compliance`
  refuses it
- **THEN** the candidate is dropped from the supply
- **AND** it is neither softened nor re-traced onto another family

#### Scenario: The volume floors are unchanged

- **WHEN** the core sizes the supply for a period
- **THEN** it applies the per-persona floor and the quarter-of-planned-assets floor as
  before
- **AND** the availability of bank entries does not reduce either floor

#### Scenario: No bar is derived where the quarter states none

- **WHEN** the inherited sophistication read is `NOT STATED`
- **THEN** indirectness is reported as unjudged and no bar is applied
- **AND** no stage is assumed in order to judge a bank draw

### Requirement: The return shape gains exactly two fields and loses none

Each candidate in the core's returned `candidate_mechanisms` block SHALL gain exactly two
fields: `bank_id` (the entry's slug, or `null`) and `valence`. No existing field SHALL be
renamed, dropped or re-ordered, and no further field SHALL be added. The return SHALL
also state the period's valence mix.

The return shape is a contract two channel Approaches skills are read against. Widening
it by exactly the two facts a consumer cannot recover on its own — where the candidate
came from, and which way it argues — keeps both callers readable without either having
to re-derive anything.

#### Scenario: Two fields, and only two

- **WHEN** the core returns a candidate
- **THEN** it carries `bank_id` and `valence` in addition to its existing fields
- **AND** no existing field has been renamed or dropped

#### Scenario: The mix is reported

- **WHEN** the core returns its supply
- **THEN** the return states how the candidates split across `positive` and `negative`

### Requirement: The core still holds no mutation tool and enforces no quota

`ssc-approaches-core` SHALL remain `capability: view` with read tools only. It SHALL NOT
gain a write to the bank, SHALL NOT hold `propose_knowledge_revision`, `save_knowledge`
or `edit`, and SHALL NOT approve anything. It SHALL NOT enforce the valence quota — it
proposes candidates and reports the mix.

Holding no mutation tool is precisely what makes a skill safe for two pipelines to share,
and this change does not touch it. A quota is a rule about *usage*, and usage happens at
Ideate: enforcing it in the supply would silently trim candidates a caller might
legitimately have used, from a skill that cannot see how many assets the period will
actually carry.

#### Scenario: The tool list stays read-only

- **WHEN** the core's frontmatter is read
- **THEN** its capability is `view`
- **AND** its tool list contains no knowledge-base write and no other mutation tool

#### Scenario: The core reports the mix but does not cap it

- **WHEN** the supply is skewed toward negative-valence candidates
- **THEN** the core reports the mix
- **AND** it removes no candidate and enforces no cap

### Requirement: Ideate carries `bank_id` through onto the mechanism it settles

`ssc-post-ideate` and `ssc-ads-ideate` SHALL carry the supplying candidate's `bank_id`
through onto the mechanism they settle on an idea, so a bank draw is distinguishable from
an invention downstream. The existing permission to settle an **off-supply** mechanism
SHALL stand, and SHALL remain subject to the existing requirement that the run's report
names it as off-supply.

Everything else about the mechanism rule SHALL be unchanged: it is a condition of
*proposing* an idea as ready for approval and never of drafting one; an idea without a
mechanism is still titled, saved, kept and given its angle; and ideas approved before a
requirement landed are grandfathered.

Provenance that is not carried is provenance that has to be guessed at, and a guessed
provenance is what the harvest path would then act on.

#### Scenario: A supply-drawn mechanism keeps its provenance

- **WHEN** Ideate settles a mechanism taken from a supply candidate that named a `bank_id`
- **THEN** that `bank_id` is carried through onto the idea's mechanism

#### Scenario: An off-supply mechanism is still permitted and still named

- **WHEN** Ideate settles a mechanism no supply candidate offered
- **THEN** the mechanism is settled
- **AND** the run's report names it as off-supply

#### Scenario: Drafting is still never blocked

- **WHEN** an idea has no mechanism yet
- **THEN** it is still titled, saved and kept
- **AND** it is simply not proposed as ready for approval

### Requirement: Negative-valence mechanisms carry no more than a third of the period's assets

`ssc-post-ideate` and `ssc-ads-ideate` SHALL hold negative-valence mechanisms, taken
together, to no more than **one third** of the period's assets. The existing
per-mechanism concentration cap — no single mechanism on more than about a quarter of the
period's assets — SHALL be unchanged and SHALL apply alongside it. Where the negative
share exceeds the cap, ideas SHALL be re-mechanised **from the supply's positive
candidates**, and a mechanism SHALL NOT be invented in order to satisfy the count. Where
the supply holds too few positives to get under the cap, that SHALL be reported as a
**named gap** in the run's report, and the fix SHALL be the next Approaches run.

Failure framing is the easiest thing to write from a voice-of-customer objection, so the
mix drifts negative unless something states a preference. Inventing a positive mechanism
to hit the ratio would be the exact fabrication the whole mechanism rule exists to stop —
a quota satisfied by a fabricated mechanism is worse than an honestly reported skew,
because the skew is visible and the fabrication is not.

#### Scenario: The negative share is counted, not eyeballed

- **WHEN** Ideate finishes settling the period's mechanisms
- **THEN** it tallies how many assets carry a negative-valence mechanism
- **AND** compares that tally against a third of the period's assets

#### Scenario: Over the cap, ideas are re-mechanised from positives

- **WHEN** negative-valence mechanisms exceed a third of the period's assets
- **THEN** ideas are re-mechanised from the supply's positive candidates

#### Scenario: A thin positive supply is a named gap, not a fabrication

- **WHEN** the supply holds too few positive candidates to bring the share under the cap
- **THEN** the run reports the shortfall as a named gap
- **AND** no mechanism is invented to satisfy the count

### Requirement: A harvest skill proposes newly authored mechanisms into the bank

A new skill `ssc-kb-mechanism-harvest` SHALL be created, registered in
`ssc-kb-agent`'s `orchestrates:` list, and SHALL for a given period read that period's
approved ideas and briefs, collect every mechanism marked `in_bank: false` together with
any off-supply mechanism Ideate settled, diff them against `craft/mechanism-bank` read
live, and **propose** the genuinely new ones into the document via
`propose_knowledge_revision`. Each proposed entry SHALL carry its `valence`, its `fits`
taken from the voice-of-customer item the mechanism was grounded in, and its
`proof_family` taken from the route it was traced to.

Without a return path the bank only ever holds what was seeded, and every gap-fill is
re-invented in the next period that meets the same objection. The harvest belongs to the
knowledge-base pipeline because that is where a proposal already meets an operator's
review screen.

#### Scenario: An invented mechanism reaches the bank as a proposal

- **WHEN** a period's approved work carries a mechanism marked `in_bank: false` that
  matches no existing entry
- **THEN** the skill proposes it as a new entry via `propose_knowledge_revision`
- **AND** the proposal carries `valence`, `fits` and `proof_family`

#### Scenario: The bank is diffed live, not from memory

- **WHEN** the skill diffs harvested mechanisms against the bank
- **THEN** it reads `craft/mechanism-bank` live for that diff

### Requirement: A near-duplicate is proposed as a revision of the existing entry

The harvest skill SHALL propose a **revision of an existing bank entry**, rather than a
new entry, wherever a harvested mechanism restates that entry in different words, and
SHALL name which entry it matched and why.

A bank that accumulates three wordings of the same mechanism stops being a library an
operator can read as a set, and the next period's matching step then has to choose
between near-identical entries with no basis for the choice. Naming the matched entry is
what lets the operator disagree with the merge instead of silently inheriting it.

#### Scenario: A restatement becomes a revision

- **WHEN** a harvested mechanism restates an existing entry in different words
- **THEN** the skill proposes a revision of that entry
- **AND** names the entry it matched and the reason

#### Scenario: Merges are visible, never silent

- **WHEN** the skill treats a harvested mechanism as a near-duplicate
- **THEN** the run's report states the match rather than dropping the mechanism quietly

### Requirement: The harvest skill is propose-only and retires nothing

`ssc-kb-mechanism-harvest` SHALL hold only `get_knowledge`, `list_ideas`, `list_briefs`,
`get_idea`, `get_brief` and `propose_knowledge_revision`. It SHALL NOT hold
`save_knowledge`, SHALL NOT use `edit(entity='knowledge')`, and SHALL NOT call `approve`,
`unapprove` or any publish or schedule tool. It SHALL write no usage history onto an
entry and SHALL retire nothing.

Every adoption reaches the bank through a proposal and an operator's approval on the
existing knowledge revision screen. `save_knowledge` and `edit(entity='knowledge')` both
write the live knowledge base directly and ungated, which is the one thing a skill that
grows a governed document must not be able to do.

#### Scenario: The declared tool list holds no direct knowledge write

- **WHEN** the skill's frontmatter is read
- **THEN** its tool list contains `propose_knowledge_revision`
- **AND** it contains neither `save_knowledge` nor `edit`, and no approval verb

#### Scenario: A weak entry is reported, not retired

- **WHEN** the skill finds an existing entry it judges weak
- **THEN** it proposes a revision or reports it as a finding
- **AND** it neither retires the entry nor marks it as unused
