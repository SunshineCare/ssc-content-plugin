# mechanism-bank

## Purpose

The `mechanisms` table and the skills that read and write it: a standing, governed
supply of mechanisms an operator can read as a set, so the craft half of the work is
drawn from rather than re-derived every month. The angle brief settles each mechanism
**bank-first**, matching approved entries against that period's attributed
voice-of-customer item before authoring anything, and reports which entry it drew or
that it authored one at the brief. A read returns approved entries only, so a draft is
not supply until a human approves it. `craft/mechanism-bank` is the document that holds
the bank's law — the valence vocabulary, the priority rule and the usage ceiling —
while the table holds the entries. `ssc-kb-mechanism-harvest` grows the bank with
drafts plus human approval, and sharpens a near-duplicate in place under bounds it
always reports.

## Requirements

### Requirement: Every bank entry carries six fields, and `fits` is described rather than persona-named

Each bank entry SHALL carry exactly these six **content** fields: `slug` (the short
stable key a step cites, so a mechanism can be named without quoting it), `mechanism`
(the one specific Vietnamese sentence), `valence` (`positive` or `negative`), `fits`
(which triggers, objections or myths it answers), `proof_family` (which
`brand/proof-points` family its trace would lean on), and `notes` (what it is not; where
it has failed). Alongside them the table SHALL carry the system fields `id` (the row id a
verb is targeted at), `status` (`draft` | `approved`) and `version`.

`fits` SHALL be written as a **description** of the trigger, objection or myth. It SHALL
NOT name a persona, and no entry SHALL be keyed to, scoped to, or filed under a persona.

The persona roster is open and is revised on its own cadence. An entry keyed to a
persona name would have to be rewritten whenever a persona is added or retired, and
would quietly become a second, unreviewed roster competing with `brand/personas`.
Describing the trigger instead lets any persona whose detail doc records that trigger
draw on the entry, which is what makes the bank a shared library rather than a set of
per-persona lists. Separating `slug` from `id` is what lets a report cite an entry in a
form that survives, while a verb still targets the row it has to target.

#### Scenario: An entry names a trigger, not a persona

- **WHEN** a bank entry's `fits` field is read
- **THEN** it describes the trigger, objection or myth the mechanism answers
- **AND** it names no persona

#### Scenario: A newly added persona needs no bank edit

- **WHEN** a persona is added to `brand/personas`
- **THEN** no bank entry requires a change for that persona to draw on it

#### Scenario: The system fields are present alongside the six

- **WHEN** an entry is read back
- **THEN** it carries `slug`, `mechanism`, `valence`, `fits`, `proof_family` and `notes`
- **AND** it also carries `id`, `status` and `version`

### Requirement: The bank is a static library and records no usage

The bank SHALL record no usage history, no last-used period, and no usage-derived retired
state. No skill SHALL write such a field onto an entry, and no skill SHALL rotate, expire
or retire an entry on the basis of when it was last drawn. An entry's `status` SHALL
change only by an **operator** action in the dashboard, and a soft `delete` SHALL be an
operator action likewise.

Rotation lives in the period mix that harvest reports, not in cross-period bookkeeping.
Bookkeeping written by a skill with nothing enforcing it would be stale within two periods
and would present itself as a fact, and the concentration failure it would address is
already bounded and already reported inside a single period.

#### Scenario: No usage field is written

- **WHEN** any skill interacts with the bank
- **THEN** it writes no usage count, no last-used period and no retired flag

#### Scenario: Rotation is a report, not a bank field

- **WHEN** one mechanism would repeat across a period
- **THEN** the correction surfaces as harvest's per-period concentration report
- **AND** the bank is not consulted for when the entry was last used

#### Scenario: Status changes are the operator's

- **WHEN** an entry moves from `draft` to `approved`, or is retired
- **THEN** an operator made that change in the dashboard
- **AND** no skill wrote it

### Requirement: The shared core reads the bank live, and a failed read stops the run

The shared core that reads the bank SHALL be `ssc-brief-core`, on every run, using
`list_mechanisms` and `get_mechanism`. `ssc-approaches-core` SHALL NOT read the bank at
all. The failed-read rule SHALL apply unchanged: retry once, and if the read still does
not resolve **STOP the run, produce no block, and name the bank read that failed**. No
skill SHALL proceed from a remembered bank, SHALL paraphrase the bank from its own file,
or SHALL restate any entry — no mechanism sentence, no `slug` and no valence example SHALL
appear in any skill file.

The read belongs to the step that actually chooses a mechanism. The bank is revised on its
own cadence by operators approving and sharpening rows, so a baked-in copy goes stale
silently and then overrides the live table it was meant to reflect. A stopped run is
recoverable in a way a silently-stale one is not.

#### Scenario: The bank is loaded every run of the brief step

- **WHEN** `ssc-brief-core` runs
- **THEN** it reads the bank live with `list_mechanisms`
- **AND** it does so regardless of what the caller says it already loaded

#### Scenario: Approaches does not read the bank

- **WHEN** `ssc-approaches-core` runs
- **THEN** it performs no bank read and holds no bank read tool

#### Scenario: An unreadable bank stops the run

- **WHEN** the bank read comes back unresolvable after one retry
- **THEN** the run stops and names that read
- **AND** no mechanism is settled from a remembered version

#### Scenario: No bank content is written into a skill file

- **WHEN** any skill file that touches mechanisms is read
- **THEN** it names the bank tools it calls
- **AND** it contains no mechanism sentence, no bank `slug` and no valence example

### Requirement: The bank saves the authoring, never the grounding

A bank entry SHALL still require an **attributed voice-of-customer quote from the
approved Approaches document for that period** before it may be settled onto an angle. A
bank entry with nothing that period to explain SHALL NOT be settled. The bank SHALL NOT
relax, substitute for, or stand in place of the grounding requirement, and a bank draw
SHALL be dropped on a compliance refusal on exactly the same terms as a mechanism authored
at the brief.

The bank removes the cost of writing the mechanism sentence again; it says nothing about
whether this period's readers are actually saying the thing that mechanism explains. A
mechanism drawn from the bank alone would be a standing list dressed as a reading of the
period, which is exactly the blandness the voice-of-customer pass exists to prevent.

#### Scenario: A bank entry with no live quote is not settled

- **WHEN** a bank entry fits nothing the period's approved Approaches document recorded
- **THEN** it is not settled onto the angle

#### Scenario: A drawn mechanism still carries its quote

- **WHEN** an angle's mechanism names a bank `slug`
- **THEN** it still carries the quoted, attributed voice-of-customer item it explains

### Requirement: The core still holds no mutation tool and enforces no quota

`ssc-approaches-core` SHALL remain `capability: view` with read tools only. It SHALL NOT
gain a write to the bank, SHALL NOT hold `propose_knowledge_revision`, `save_knowledge`,
`save_mechanism` or `edit`, and SHALL NOT approve anything. It SHALL NOT enforce the
valence quota and SHALL NOT count either ratio. Its voice-of-customer pass is the
sanctioned source of a brief's attributed quote, and its return carries the inherited
sophistication read and that pass — **the mechanism itself is settled at the angle
brief**.

Holding no mutation tool is precisely what makes a skill safe for two pipelines to share.
A quota is a rule about *usage*, and usage is visible only once the period's briefs are
settled — enforcing it in a planning step would mean counting a field that step does not
write. Approaches owns the half that genuinely changes month to month; settling a
mechanism belongs to the step that knows the persona and route and can query the bank.

#### Scenario: The tool list stays read-only and bank-free

- **WHEN** the core's frontmatter is read
- **THEN** its capability is `view`
- **AND** its tool list contains no knowledge-base write, no bank tool and no other
  mutation tool

#### Scenario: The voice-of-customer pass stays

- **WHEN** the core runs
- **THEN** it produces its voice-of-customer pass
- **AND** the approved Approaches document is the sanctioned source of a brief's
  attributed quote

#### Scenario: The return carries the read and the pass

- **WHEN** the core returns its block
- **THEN** it carries the inherited sophistication read and the voice-of-customer pass,
  and the mechanism is settled at the angle brief

### Requirement: A harvest skill proposes newly authored mechanisms into the bank

`ssc-kb-mechanism-harvest` SHALL be registered in `ssc-kb-agent`'s `orchestrates:` list
and SHALL, for a given period: read that period's **briefs** and collect the mechanisms
actually settled; diff them against the bank read live with `list_mechanisms` /
`get_mechanism`; and for each genuinely new mechanism call `save_mechanism`, which mints a
**draft**. Each drafted entry SHALL carry its `valence`, its `fits` taken from the
voice-of-customer item the mechanism was grounded in, and its `proof_family` taken from
the route it was traced to. The skill SHALL fold the whole run — drafts, in-place
sharpenings and the mix audit — into one report.

Without a return path the bank only ever holds what was seeded, and every mechanism
authored at a brief is re-invented in the next period that meets the same objection. The
harvest belongs to the knowledge-base pipeline because that is where an operator already
reviews what the brand knows, and the briefs are the only place a settled mechanism now
lives.

#### Scenario: A new mechanism reaches the bank as a draft

- **WHEN** a period's briefs carry a mechanism that matches no existing entry
- **THEN** the skill calls `save_mechanism` for it
- **AND** the entry carries `valence`, `fits` and `proof_family` and is minted `draft`

#### Scenario: The bank is diffed live, not from memory

- **WHEN** the skill diffs harvested mechanisms against the bank
- **THEN** it reads the bank live with `list_mechanisms` for that diff

#### Scenario: The period's mechanisms come from the briefs

- **WHEN** the skill collects what a period settled
- **THEN** it reads the period's briefs
- **AND** it reads no mechanism off an idea

### Requirement: The bank is a `mechanisms` table read and written through its own tools

The mechanism bank SHALL be the BrandOS `mechanisms` table, not a knowledge-base
document. It SHALL be read with `list_mechanisms` — which returns **approved entries
only** unless a `status` is asked for, and which narrows by `valence`, `status`, the `q`
substring and `limit` — and with `get_mechanism`, which resolves one entry by `slug` and
returns its `id` and `version`. It SHALL be written with `save_mechanism`, which **mints
a `draft` and takes no `status` argument**. `edit`, `approve` and `delete` on
`entity='mechanism'` SHALL be the generic verbs, and `delete` SHALL be soft. A retired
entry SHALL never be returned by the approved-only read.

Markdown that an operator reads as a set cannot also be a queryable supply: matching a
period's voice-of-customer items against it meant loading the whole document and
re-parsing entries whose `id` uniqueness and valence legality nothing enforced. A table
gives the step that actually chooses a mechanism a narrowed query, gives an entry a real
`status` so a machine-written draft is not silently treated as governed supply, and makes
approval an operator action on a row rather than a merge into prose.

#### Scenario: The default read returns only approved entries

- **WHEN** `list_mechanisms` is called without a `status`
- **THEN** it returns approved entries only
- **AND** it returns no draft and no retired entry

#### Scenario: A save mints a draft

- **WHEN** `save_mechanism` writes a new entry
- **THEN** that entry's status is `draft`
- **AND** no `status` argument is passed and none is accepted

#### Scenario: An entry is cited by slug and targeted by id

- **WHEN** a step names one bank entry
- **THEN** it cites the entry's `slug`
- **AND** it resolves `id` through `get_mechanism` when it needs to target a verb at that
  row

### Requirement: The `craft/mechanism-bank` document describes the bank it no longer stores

`craft/mechanism-bank` SHALL remain a knowledge-base document but SHALL NOT be a source
of mechanism entries. §1 SHALL state the bank-first relationship with the **Brief** step
and SHALL keep pointing at `craft/doctrine` §2 for the definition of a mechanism without
restating any part of it. §2 SHALL keep the valence vocabulary — exactly `positive` (why
this works; what builds the result) and `negative` (why past attempts fail; what quietly
undoes progress) — and the rule that `positive` is the default and the priority, with the
ceiling sentence retargeted to a ratio measured over a period's **briefs** and reported by
the KB harvest run. §3 SHALL describe the table's fields rather than hold entries. §4
SHALL state **what to do when no entry fits** — author at the brief, report it as
not-from-bank, and let harvest propose it in. No skill SHALL read `craft/mechanism-bank`
§3 as a source of mechanisms.

The valence vocabulary and the positive-priority rule are brand craft, not schema, and
they belong where the operator reviews craft. The entries themselves belong where they
can be queried and governed row by row. Keeping the document as a describing doc rather
than deleting it preserves the one thing it uniquely holds while removing the second copy
of the supply that would otherwise diverge from the table.

#### Scenario: The document is not read for entries

- **WHEN** a step needs a mechanism from the bank
- **THEN** it calls `list_mechanisms` or `get_mechanism`
- **AND** it does not read `craft/mechanism-bank` §3 for entries

#### Scenario: Valence stays in the document

- **WHEN** §2 of the document is read
- **THEN** the only valence values are `positive` and `negative`
- **AND** `positive` is stated as the default and the priority

#### Scenario: The definition is still pointed at, not copied

- **WHEN** §1 of the document is read
- **THEN** it names `craft/doctrine` §2 as the definition of a mechanism
- **AND** it restates no part of what qualifies, what does not, or the beat it feeds

### Requirement: The period's mechanism mix is audited at harvest and reported, never enforced

`ssc-kb-mechanism-harvest` SHALL report a period's mechanism mix, measured over that
period's **briefs**: per-mechanism **concentration** — one mechanism carried by more than
about **one quarter** of the period's assets — and **negative valence** — negative-valence
mechanisms carrying more than **one third** of them. Each breach SHALL be **named**. The
audit SHALL be **report-only**: harvest SHALL propose no re-mechanising, SHALL re-open
nothing, and SHALL change no brief. The correction SHALL be the operator's, on
not-yet-approved briefs. No other skill SHALL enforce either ratio.

Failure framing is the easiest thing to write from a voice-of-customer objection, so the
mix drifts negative unless something states a preference — but the caps can no longer sit
at Ideate, which neither writes the field nor owns the rows. Harvest already reads the
period's settled mechanisms, so it is the one place the ratio can be computed from what
was actually settled rather than from what was planned. Making it a report rather than an
enforcement keeps the skew visible without letting a skill re-mechanise approved work to
satisfy a count — a quota met by a fabricated mechanism is worse than an honestly reported
skew, because the skew is visible and the fabrication is not.

#### Scenario: The mix is counted over the period's briefs

- **WHEN** harvest runs for a period
- **THEN** it tallies each mechanism's share and the negative-valence share over that
  period's briefs

#### Scenario: A breach is named, not corrected

- **WHEN** one mechanism exceeds about a quarter of the period's assets, or negative
  valence exceeds a third
- **THEN** the run names the breach
- **AND** it re-mechanises nothing, re-opens nothing and edits no brief

#### Scenario: No skill enforces the ratio

- **WHEN** any pipeline skill other than harvest runs
- **THEN** it counts neither ratio and blocks nothing on either

### Requirement: A near-duplicate is sharpened in place, bounded to content fields and always reported

`ssc-kb-mechanism-harvest` SHALL sharpen an existing bank entry in place with
`edit(entity='mechanism')`, rather than minting a second one, wherever a harvested
mechanism restates **that** entry in different words. The edit SHALL be bounded by
**all** of: content fields only — `mechanism`, `fits`, `proof_family`, `notes` — and
**never** `status` and **never** `slug`; **sharpening only**, never repurposing an entry
to a different meaning; and **every edit reported with its before and after**, naming
which entry was matched and why.

A bank that accumulates three wordings of the same mechanism stops being a library an
operator can read as a set, and the next period's matching step then has to choose between
near-identical entries with no basis for the choice. This is the plugin's one live-supply
write that does not go through a proposal, and it is deliberate: the operator chose
in-place sharpening over report-only, and the three bounds are the compensation. Barring
`status` keeps a skill from promoting its own draft; barring `slug` keeps every citation
in every past report resolvable; the before/after report is what lets the operator
disagree with a merge instead of silently inheriting it.

#### Scenario: A restatement sharpens the matched entry

- **WHEN** a harvested mechanism restates an existing entry in different words
- **THEN** harvest edits that entry in place
- **AND** names the entry it matched and the reason

#### Scenario: The edit touches content fields only

- **WHEN** harvest edits a bank entry
- **THEN** the patch carries only `mechanism`, `fits`, `proof_family` or `notes`
- **AND** it carries neither `status` nor `slug`

#### Scenario: Every edit shows its before and after

- **WHEN** a run edits one or more entries
- **THEN** the report states each entry's prior and new content
- **AND** no near-duplicate is dropped quietly

#### Scenario: Sharpening never repurposes

- **WHEN** the harvested mechanism means something different from the matched entry
- **THEN** it is not merged into that entry
- **AND** it is drafted as a new entry instead

### Requirement: The harvest skill holds no approval verb, mints only drafts, and retires nothing

`ssc-kb-mechanism-harvest` SHALL hold the bank reads (`list_mechanisms`, `get_mechanism`),
the brief reads (`list_briefs`, `get_brief`), `save_mechanism` and `edit`. It SHALL NOT
hold `approve` or `unapprove` in any form, SHALL NOT hold `propose_knowledge_revision`
for bank entries, SHALL NOT hold `save_knowledge`, and SHALL NOT call any publish or
schedule tool. It SHALL write no usage history onto an entry and SHALL retire nothing —
it SHALL neither `delete` an entry nor mark one unused. A weak entry SHALL be reported as
a finding.

`save_mechanism` mints a draft and cannot mint anything else, and `edit` is bounded to
content fields, so the only two writes harvest can perform both stop short of the
governance line: a draft is not supply until a human approves it in the dashboard, and a
sharpened entry says the same thing more precisely. Holding an approval verb would let the
skill promote its own draft in one run, which is the exact loop propose-only exists to
break.

#### Scenario: The declared tool list holds no approval verb

- **WHEN** the skill's frontmatter is read
- **THEN** its tool list contains `save_mechanism` and `edit`
- **AND** it contains no `approve`, no `unapprove`, no `propose_knowledge_revision` and no
  `save_knowledge`

#### Scenario: A drafted entry is not supply

- **WHEN** harvest mints a draft
- **THEN** the next period's approved-only bank read does not return it
- **AND** it becomes supply only after a human approves it in the dashboard

#### Scenario: A weak entry is reported, not retired

- **WHEN** harvest finds an existing entry it judges weak
- **THEN** it reports it as a finding
- **AND** it neither deletes the entry nor marks it as unused
