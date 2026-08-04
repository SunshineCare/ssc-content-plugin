## ADDED Requirements

### Requirement: Posts Approaches authors the period's candidate-mechanism supply

The Posts Approaches step SHALL persist a candidate-mechanism supply as a dedicated
section of its document, produced by the shared Approaches core, and SHALL propose
more candidates than the period's planned post count can use. It SHALL report the
number of candidates proposed in its final summary. It SHALL propose candidates only
— it SHALL NOT assign a candidate to an idea, and it SHALL NOT approve anything.

The doctrine makes a mechanism mandatory before an idea may be proposed as ready, but
nothing upstream of the Posts Ideate step supplied one, so that step had to find a
mechanism per surviving idea out of the same reading everyone else had already done.
The Ads channel does not have this problem because its Approaches step authors the
supply. Proposing a surplus is what makes every downstream pairing have something to
draw on rather than forcing a fabricated one.

#### Scenario: The supply is persisted as its own section

- **WHEN** the Posts Approaches step composes its document
- **THEN** the candidate-mechanism supply appears as its own section
- **AND** the summary states how many candidates were proposed

#### Scenario: The supply exceeds the period's need

- **WHEN** the supply is authored for a period
- **THEN** it proposes more candidates than the period's planned post count

#### Scenario: Nothing is assigned or approved

- **WHEN** the supply is authored
- **THEN** no candidate is bound to a specific idea
- **AND** no approval verb is called and no gate is set

### Requirement: Every candidate carries an attributed voice-of-customer item

Each candidate SHALL state the mechanism itself as one specific sentence, per the
doctrine's mechanism definition read live and restated nowhere in skill prose, and
SHALL quote the voice-of-customer item it explains together with the recorded source
that item came from. A candidate whose voice-of-customer item cannot be attributed
SHALL NOT be proposed.

A mechanism with no customer language behind it is an invented one, which is exactly
what the mandatory-mechanism rule exists to stop. The attribution is what lets an
operator check the claim without re-running the research.

#### Scenario: A candidate names its source

- **WHEN** a candidate is proposed
- **THEN** it quotes the voice-of-customer item it explains
- **AND** it names the recorded source that item came from

#### Scenario: An unattributable candidate is dropped

- **WHEN** the voice-of-customer item behind a candidate cannot be traced to a
  recorded source
- **THEN** the candidate is not proposed

#### Scenario: The mechanism definition is read live

- **WHEN** the supply is authored
- **THEN** the doctrine document is read live for what a mechanism is
- **AND** the skill file restates none of its contents

### Requirement: Every candidate carries a proof route drawn from the period's stated proof inventory

Each candidate SHALL name its proof route — the proof-point family from the brand's
proof-points document plus the specific trace — selected **only** from the proof
inventory the monthly head states for this period. Where the head states no inventory,
the route SHALL be marked unverified for the period rather than assumed.

The head's proof inventory is what the business can actually stand behind this month.
A route chosen outside it produces a mechanism that no post can substantiate, and the
gap surfaces at writing time when it is far more expensive to fix.

#### Scenario: The route comes from the stated inventory

- **WHEN** a candidate names its proof route
- **THEN** the route's family and trace are drawn from this period's stated proof
  inventory

#### Scenario: An absent inventory is marked, not assumed

- **WHEN** the head states no proof inventory for the period
- **THEN** each candidate's route is marked unverified for the period
- **AND** no route is assumed to hold

### Requirement: Each candidate states how indirect the lead must be

Each candidate SHALL state how indirect a lead built on it must be, judged against the
inherited sophistication read in that read's own terms. Where the read is not stated,
the candidate SHALL say so and SHALL make no indirectness claim.

The sophistication read is what decides whether a candidate is worth proposing at all;
carrying the judgement on the candidate itself is what lets the later steps use the
supply without re-deriving anything.

#### Scenario: Indirectness is judged against the read

- **WHEN** a candidate is proposed and the quarter states a sophistication read
- **THEN** the candidate states how indirect a lead built on it must be, in the read's
  own terms

#### Scenario: No read means no indirectness claim

- **WHEN** the quarter states no sophistication read
- **THEN** the candidate says so and makes no indirectness claim

### Requirement: A candidate whose only proof route is refused by the compliance rules is not proposed

A candidate SHALL NOT be proposed at all where every proof route available to it is
refused by the brand's compliance rules, read live. It SHALL NOT be
proposed with a caveat, and it SHALL NOT be left for a downstream step to reject. For
the Posts channel, the organic-versus-paid firewall SHALL apply in the same way, so a
candidate or quote sourced from paid material is likewise not proposed.

A candidate that cannot lawfully be proven is not a candidate; carrying it forward
with a warning just moves the refusal to a step with less context and more sunk cost.

#### Scenario: An unprovable candidate is withheld

- **WHEN** every proof route open to a candidate is refused by the compliance rules
- **THEN** the candidate is not proposed
- **AND** it is not proposed with a caveat instead

#### Scenario: A candidate with a surviving route is kept

- **WHEN** one of a candidate's proof routes is refused but another is permitted
- **THEN** the candidate is proposed carrying the permitted route

#### Scenario: The compliance rules are read live

- **WHEN** proof routes are judged
- **THEN** the compliance document is read live
- **AND** its contents are restated nowhere in skill prose

### Requirement: Ideate's title round carries a supply mechanism where one matches

A generated title SHALL carry a candidate's mechanism when the idea is saved, where
that title matches a candidate in the approved supply, at the round where the Posts
Ideate step generates titles. Where no candidate matches, the mechanism SHALL be
omitted exactly as it is
today. The round SHALL NOT delay, shrink or withhold a title for want of a mechanism,
and SHALL NOT pass filler in place of one.

The mechanism is a condition of proposing an idea as ready, never a condition of
drafting one. Making the title round wait on a mechanism would trade the supply's
benefit for a stall, and fabricating one is the failure the rule exists to prevent.

#### Scenario: A matching candidate is carried

- **WHEN** a generated title matches a candidate in the approved supply
- **THEN** that candidate's mechanism is carried when the idea is saved

#### Scenario: No match means an omitted field

- **WHEN** no candidate in the supply matches a generated title
- **THEN** the mechanism is omitted
- **AND** the title is still generated, saved and kept

#### Scenario: The round is never held up

- **WHEN** the supply covers fewer titles than the round generates
- **THEN** the round still produces the full planned count
- **AND** no filler mechanism is passed

### Requirement: Ideate's angle round settles the mechanism from the supply and names any off-supply choice

At the round where the Posts Ideate step settles each surviving idea's angle, it SHALL
settle that idea's mechanism, preferring a candidate from the approved supply. A
mechanism outside the supply SHALL be permitted, and SHALL be named as off-supply in
the run report. The round SHALL take the supply from the plan context it already
reads and SHALL make no additional strategy-brief call.

The operator approves creative rails, not a closed list of mechanisms — refusing an
off-supply mechanism would stall a good idea behind an Approaches re-run. Reporting it
gives the operator the same information without the stall, and feeds next month's
Approaches with what the supply missed.

#### Scenario: A supply candidate is preferred

- **WHEN** the round settles a surviving idea's mechanism and a suitable candidate
  exists in the approved supply
- **THEN** that candidate is used

#### Scenario: An off-supply mechanism is allowed and named

- **WHEN** the round settles a mechanism that is not in the approved supply
- **THEN** the idea is not blocked
- **AND** the run report names that mechanism as off-supply

#### Scenario: The supply arrives through the plan context

- **WHEN** the round needs the approved supply
- **THEN** it reads it from the plan context it already fetches
- **AND** it makes no additional strategy-brief call and re-derives no candidate
