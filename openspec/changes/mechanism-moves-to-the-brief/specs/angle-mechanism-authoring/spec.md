## ADDED Requirements

### Requirement: The angle brief authors its own mechanism, and nothing is inherited

The mechanism SHALL be authored at the **angle brief** and SHALL live in
`briefs.mechanism` alone. There SHALL be no mechanism on the idea, no inheritance from
the subject down to its angles, no override of an inherited value, and no resolution
step anywhere in the system. `ideas.mechanism` no longer exists, `save_idea` accepts no
`mechanism`, and no skill SHALL read, write, patch or reconstruct one on an idea.

The persona-free subject stays persona-free. A mechanism explains why something works
for a **particular** objection held by a **particular** reader, so it cannot honestly be
settled one level above the place where persona and route are chosen. Once the mechanism
is authored where the persona enters, inheritance has nothing to inherit and an override
has nothing to override — both disappear rather than being bounded.

#### Scenario: The mechanism is settled where the persona enters

- **WHEN** an angle brief is authored for a subject
- **THEN** that brief settles its own mechanism
- **AND** it reads no mechanism from the idea and inherits nothing

#### Scenario: No idea field is written

- **WHEN** any skill in the ads or post pipeline runs
- **THEN** it writes no `mechanism` onto an idea and passes none to `save_idea`

#### Scenario: There is no resolution step

- **WHEN** a consumer needs the mechanism for an angle
- **THEN** it reads `brief.mechanism` directly
- **AND** it performs no brief-then-idea resolution and consults no override precedence

### Requirement: The mechanism is settled bank-first from the `mechanisms` table

The brief step SHALL settle its mechanism **bank-first**: it SHALL read the bank live
with `list_mechanisms` — narrowed by `valence` or the `q` substring — and resolve a
chosen entry with `get_mechanism` by `slug`, before authoring anything of its own. It
SHALL author a fresh mechanism **only** where no entry fits, and SHALL say so in the
run's report. It SHALL NOT proceed from a remembered bank and SHALL NOT restate a bank
entry from its own file.

The craft of *why* something works does not change month to month, and the operator has
already governed a seeded set of it. Re-inventing a mechanism the bank already holds
produces a second wording of the same idea that competes with the governed one, and the
next period's step then has to choose between near-identical entries with no basis for
the choice.

#### Scenario: A fitting entry is drawn rather than re-authored

- **WHEN** a bank entry fits this angle's persona × route and the voice-of-customer item
  it is grounded in
- **THEN** that entry supplies the angle's mechanism
- **AND** no new mechanism is authored for that angle

#### Scenario: Matching happens before authoring

- **WHEN** the brief step settles a mechanism
- **THEN** it reads and matches the bank first
- **AND** authors fresh only where the match found nothing

#### Scenario: An authored mechanism is reported as not-from-bank

- **WHEN** no bank entry fits
- **THEN** the mechanism is authored at the brief
- **AND** the run's report states that it was not drawn from the bank

### Requirement: The mechanism is grounded in an attributed voice-of-customer item from the approved Approaches document

Every mechanism a brief settles SHALL be grounded in an **attributed voice-of-customer
item taken from the approved Approaches document for that period**. The brief step SHALL
run **no voice-of-customer pass of its own**, SHALL open no second outward account of
the period, and SHALL hold no fetch or search tool for that purpose. A phrase it cannot
attribute to that document SHALL NOT support a mechanism, and the angle SHALL return
below bar rather than proceed on an unattributable phrase.

The period gets exactly one outward pass and one compiled reading of what customers are
actually saying, and an operator has already approved that reading. A brief that
gathered its own would produce a second, unreviewed account of the same month that
silently outranks the approved one — at the exact moment the mechanism is being chosen,
which is when it matters most that the evidence is one an operator has seen.

#### Scenario: An unattributable phrase supports no mechanism

- **WHEN** the justification for a mechanism cannot be traced to an item in the approved
  Approaches document for that period
- **THEN** no mechanism is settled from it
- **AND** the angle returns below bar

#### Scenario: No second outward pass at brief time

- **WHEN** the brief step settles a mechanism
- **THEN** it runs no voice-of-customer pass and performs no outward search

#### Scenario: A bank draw still carries its quote

- **WHEN** a mechanism is drawn from a bank entry
- **THEN** it still carries the quoted, attributed voice-of-customer item it explains
- **AND** the bank draw does not substitute for that grounding

### Requirement: The mechanism is proof-routed from the period's inventory and dropped when compliance refuses its only route

A settled mechanism SHALL carry a proof route selected only from **that period's stated
proof inventory**, and where that inventory is absent the route SHALL be marked
unverified for the period rather than assumed. A mechanism whose only proof route is
refused by `rules/compliance` SHALL be **dropped — not softened, and not re-traced onto
a family the compliance document did not clear**. This SHALL apply to a bank draw exactly
as it applies to a mechanism authored at the brief.

An entry's presence in the bank is evidence that the brand has articulated the mechanism,
not that it is provable from this period's inventory or clearable by this period's
compliance document. Treating a bank draw as pre-cleared is the one way a governed
library becomes a bypass; softening or re-tracing a refused route is how a compliance
refusal gets routed around instead of respected.

#### Scenario: A refused route drops the mechanism

- **WHEN** a candidate mechanism's only proof route is refused by `rules/compliance`
- **THEN** that mechanism is dropped
- **AND** it is neither softened nor re-traced onto another proof family

#### Scenario: A bank draw is not pre-cleared

- **WHEN** the dropped candidate came from the bank
- **THEN** it is dropped on the same terms as one authored at the brief

#### Scenario: An absent inventory is marked, not assumed

- **WHEN** the period states no proof inventory
- **THEN** the route is marked unverified for the period
- **AND** no route is assumed in order to keep the mechanism

### Requirement: The mechanism is judged against `craft/doctrine` §2 read live

Whatever the brief settles SHALL be judged against the definition of a mechanism in
`craft/doctrine` §2, **read live on every run**. No skill file SHALL restate that
definition, in whole or in part. A failed read of `craft/doctrine` SHALL stop that run
and name the document, rather than falling back to a remembered version.

One rule, one home. The doctrine is revised on its own cadence, so a copy baked into a
skill goes stale silently and then overrides the live document it was meant to reflect.
A stopped run is recoverable in a way a silently-stale one is not.

#### Scenario: The definition is read, never remembered

- **WHEN** a mechanism is judged
- **THEN** `craft/doctrine` §2 is read live for the definition

#### Scenario: An unreadable doctrine stops the run

- **WHEN** `craft/doctrine` comes back missing or unreadable
- **THEN** the run stops and names that document
- **AND** no mechanism is settled from a remembered definition

#### Scenario: No definition is written into a skill file

- **WHEN** any skill file that settles a mechanism is read
- **THEN** it names `craft/doctrine` §2
- **AND** it restates no part of what qualifies as a mechanism

### Requirement: One angle, one mechanism — and sibling angles may disagree

The guarantee the system makes SHALL be **one angle, one mechanism**. It SHALL NOT be
stated anywhere as *one subject, one mechanism*. Sibling angles of the same subject MAY
name mechanisms that do not cohere with one another; **nothing checks this**, and the
prose SHALL state it as an accepted cost of authoring at the angle rather than presenting
coherence as a guarantee. No brief step SHALL re-open, re-run, re-score or report as
stale a sibling angle because another angle settled a different mechanism.

An ads subject fans into several angles across personas and routes, and a mechanism that
genuinely explains one persona's objection can be simply wrong for another's. Forcing
coherence across siblings would either drop a persona the subject genuinely fits or push
a mechanism onto an angle it does not serve. The cost — two angles under one subject
arguing differently — is real, is visible in harvest's period mix report, and is
deliberately accepted rather than hidden.

#### Scenario: Each angle settles independently

- **WHEN** one subject fans into several angle briefs
- **THEN** each brief settles its own mechanism on its own grounding

#### Scenario: A divergence is not an error

- **WHEN** two angles of one subject name mechanisms that do not cohere
- **THEN** neither angle is re-opened, re-run or reported stale
- **AND** no check fails and no run stops on that basis

#### Scenario: The guarantee is stated correctly

- **WHEN** the mechanism guarantee is stated in prose
- **THEN** it reads *one angle, one mechanism*
- **AND** no file claims *one subject, one mechanism*

### Requirement: The shared brief core holds no mutation tool, and the caller saves

`ssc-brief-core` SHALL remain `capability: view`. It SHALL gain the two bank read tools
and SHALL hold **no mutation tool** — no `save_brief`, no `edit`, no knowledge write, and
no approval verb. It SHALL return the settled mechanism to its caller, and the **caller**
SHALL own the save: `ssc-ads-brief` SHALL pass `mechanism` on every `save_brief`, and
`ssc-post-ideate` round 3 SHALL write it with `edit(entity='brief', patch={ mechanism })`.

Holding no mutation tool is precisely what makes a shared core safe for two pipelines to
share — the core reasons, the caller commits, and a caller can be read on its own to see
every write it performs. Splitting the save across the core would give one file the power
to write into two pipelines' rows with neither caller showing it.

#### Scenario: The core's tool list stays read-only

- **WHEN** `ssc-brief-core`'s frontmatter is read
- **THEN** its capability is `view`
- **AND** its tool list contains the bank reads and no mutation tool

#### Scenario: The ads caller saves the mechanism inline

- **WHEN** `ssc-ads-brief` saves an angle
- **THEN** it passes `mechanism` on that `save_brief` call

#### Scenario: The post caller patches the minted brief

- **WHEN** `ssc-post-ideate` round 3 settles the post's mechanism
- **THEN** it writes it with `edit(entity='brief', patch={ mechanism })`

### Requirement: Round 2 withholds `detail.mechanism` at mint so the brief mints `draft`

`ssc-post-ideate` round 2 SHALL **deliberately withhold** `detail.mechanism` from the
`save_idea` call that mints the post's brief, and the skill SHALL state why. A non-blank
`detail.mechanism` mints that brief `approved`; a blank one mints it `draft`. Round 2
SHALL therefore mint `draft` and leave the mechanism to round 3's `edit`, so that a human
approves the brief.

Passing the mechanism at mint would be fewer calls and would land the value at the moment
it is known — and it would let a skill self-approve a brief, which is the exact thing the
plugin's propose-only invariant exists to prevent. An extra `edit` call is a cheap price
for keeping every approval an operator action.

#### Scenario: The mint is deliberately mechanism-free

- **WHEN** round 2 calls `save_idea` for a post
- **THEN** it passes no `detail.mechanism`
- **AND** the minted brief's status is `draft`

#### Scenario: The reason is stated, not implicit

- **WHEN** `ssc-post-ideate` round 2 is read
- **THEN** it states that a non-blank `detail.mechanism` would mint the brief `approved`
- **AND** names self-approval as the reason it is withheld

### Requirement: A mechanism-less `ad` or `post` brief cannot be approved, and drafting is never blocked

The mechanism SHALL be a condition of **approving** an angle brief and never a condition
of drafting one. `approve(entity='brief')` refuses an `ad` or `post` brief whose
`mechanism` is blank, reporting `field: 'mechanism'`; this is enforced **server-side**
and no skill enforces or duplicates it. `youtube` briefs SHALL be untouched by this bar.
A brief with no mechanism SHALL still be saved, kept and worked on. Briefs approved
before the gate landed SHALL be grandfathered — never re-opened, never re-approved, and
never reported stale.

Blocking drafting would stop the work at the point where the mechanism is still being
reasoned about, which is exactly where a half-formed brief is useful. Blocking approval
puts the bar at the one moment a human is already looking, and putting the enforcement on
the server means a skill cannot be talked out of it.

#### Scenario: Approval refuses a blank mechanism

- **WHEN** an `ad` or `post` brief with a blank `mechanism` is submitted for approval
- **THEN** the server refuses it, naming `field: 'mechanism'`

#### Scenario: Drafting is never blocked

- **WHEN** an angle brief has no mechanism yet
- **THEN** it is still saved and kept
- **AND** it is simply not proposed as ready for approval

#### Scenario: YouTube is untouched

- **WHEN** a `youtube` brief is approved
- **THEN** no mechanism bar applies to it

#### Scenario: Pre-gate approvals are grandfathered

- **WHEN** a brief was approved before the gate landed and carries no mechanism
- **THEN** it keeps its status
- **AND** it is not re-opened and not reported stale

### Requirement: Ideate touches no mechanism at all

`ssc-post-ideate` rounds 1–2 and `ssc-ads-ideate` SHALL touch **no** mechanism. Titles
SHALL carry none. There SHALL be no supply-matching pass, no per-mechanism concentration
cap, no negative-valence cap, and no approvability verdict keyed on a mechanism at these
rounds. A missing mechanism on a drafted subject SHALL NOT be a gate at ideation, and the
prose stating that SHALL point at the brief.

Ideate no longer settles mechanisms, so a cap enforced there would be counting a field it
does not write, on rows it does not own. The subject stays persona-free and therefore
cannot honestly judge whether a mechanism fits a reader it has not chosen yet.

#### Scenario: A title carries no mechanism

- **WHEN** Ideate proposes a subject
- **THEN** the title and the saved idea carry no mechanism

#### Scenario: No cap is counted at Ideate

- **WHEN** Ideate finishes a period's subjects
- **THEN** it counts no concentration ratio and no valence ratio

#### Scenario: A missing mechanism is not an ideation gate

- **WHEN** a drafted subject has no mechanism
- **THEN** ideation does not stop
- **AND** the prose naming the gate points at the brief step

### Requirement: Every run reports the mechanism and its provenance, and provenance is report-only

Every run that settles a mechanism SHALL report it, naming the angle it applies to and
its provenance — either the bank `slug` it was drawn from, or that it is not in the bank.
Provenance SHALL be **report-only**: there is no `briefs.mechanism_slug` column, the
brief holds the Vietnamese sentence and nothing else, and no skill SHALL work around that
by writing the provenance into another field — not the brief's `angle_label`, not a
narrative field, and not onto any idea field.

A departure a human cannot see is indistinguishable from drift, and the provenance line is
what tells an operator whether they are reading a draw from a library they govern or
something authored this run. Smuggling it into another field would produce a value no
consumer resolves and a brief whose stored fields disagree with the reasoning that
produced them.

#### Scenario: The report names the provenance

- **WHEN** a run settles one or more mechanisms
- **THEN** the report names each angle and either the bank `slug` it drew from or that it
  is not in the bank

#### Scenario: No field is repurposed to hold provenance

- **WHEN** a mechanism's provenance cannot be persisted
- **THEN** it appears in the report only
- **AND** it is written into no other brief field and onto no idea field

### Requirement: Producers read `brief.mechanism` alone and invent nothing

`ssc-ads-writer`, `ssc-post-produce` and `ssc-post-authority` SHALL read the mechanism
from `brief.mechanism` and from nowhere else. The brief-override-first resolution table
SHALL be deleted from all three. Each producer SHALL still write **to** the mechanism and
SHALL NEVER restate, paraphrase, vary, sharpen, soften or contradict it, and SHALL author
none of its own. `ssc-post-authority` SHALL judge its mechanism floor against
`brief.mechanism`. Where a brief approved before the gate carries no mechanism,
production SHALL proceed, the absence SHALL be **named** in the run's report, and nothing
SHALL be invented. `ssc-post-schedule` SHALL take its indirect-first sort key from
`list_briefs`' `mechanism` rather than `list_ideas`, and SHALL NEVER re-derive a
mechanism in order to sort by it.

One field read the same way everywhere is what stops two consumers of the same brief
writing to two different mechanisms. `list_ideas` no longer returns a mechanism, so a
sort key still reading it would silently degrade to no ordering at all rather than fail
visibly — moving the key to the field that actually holds the value is the only fix that
does not involve re-deriving one.

#### Scenario: The producer writes to the brief's mechanism

- **WHEN** a producer writes the mandatory mechanism beat
- **THEN** it writes to `brief.mechanism`
- **AND** it consults no idea mechanism and no override precedence

#### Scenario: A legacy absence is named, not filled

- **WHEN** an approved brief carries no mechanism
- **THEN** production proceeds, the absence is named in the summary, and no mechanism is
  invented

#### Scenario: The sort key moves to the briefs

- **WHEN** `ssc-post-schedule` orders indirect-first
- **THEN** it takes `mechanism` from `list_briefs`
- **AND** it re-derives no mechanism to sort by

### Requirement: `briefs.mechanism` is an ordinary field and adds no governance gate

`briefs.mechanism` SHALL be an **ordinary, non-approval-bearing field**.
`hooks/approval-gate.mjs` and its matchers SHALL be untouched by this capability, and
`edit(entity='brief', patch={ mechanism })` SHALL pass through as ordinary draft
authoring. The plugin's propose-only invariant SHALL be unchanged: no skill gains
`approve`, `unapprove`, `update_status`, or any publish or schedule tool.

The approval bar lives on the server's `approve(entity='brief')` verb, which the hook
already governs. Making the field itself approval-bearing would invent a second gate on a
value that carries no spend and no publish consequence, and would drag the governance
hook into a change with no governance content.

#### Scenario: The hook is unchanged

- **WHEN** the change's diff is read
- **THEN** `hooks/approval-gate.mjs` and `hooks/hooks.json` are unmodified

#### Scenario: Patching the field is ordinary authoring

- **WHEN** `edit(entity='brief', patch={ mechanism })` is called
- **THEN** it is treated as ordinary draft authoring and no approval gate fires
