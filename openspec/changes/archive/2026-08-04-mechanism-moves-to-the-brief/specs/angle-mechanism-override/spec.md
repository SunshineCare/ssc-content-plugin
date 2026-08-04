## REMOVED Requirements

### Requirement: An angle brief may author an angle-local mechanism override

**Reason**: There is nothing left to override. The BrandOS server dropped
`ideas.mechanism`, `save_idea` accepts no `mechanism`, and the approval gate moved to
`approve(entity='brief')` — so a mechanism is never settled on the subject and never
inherited by an angle. A "bounded permission to depart from the inherited mechanism" has
no inherited mechanism to depart from, and the bound that made it safe (*only when the
inherited one does not serve this angle*) is a condition that can never be evaluated.

**Migration**: Replaced by the new capability `angle-mechanism-authoring`, whose first
requirement — "The angle brief authors its own mechanism, and nothing is inherited" —
makes at the angle what this requirement made an exception for. The permission becomes the
rule: every angle authors, none inherits, and the exception apparatus disappears rather
than being widened. `ssc-brief-core` still holds no mutation tool and still returns to a
caller that owns every save.

### Requirement: An override is bank-first and meets the doctrine's definition read live

**Reason**: The rule is sound and survives — but it can no longer be scoped to an
*override*, because every mechanism is now authored at the angle. Keeping it here would
leave the bank-first ordering stated only for an exceptional path that no longer exists,
so the ordinary path would be governed by nothing. The `in_bank: false` marker it depends
on is also retired with the Approaches supply, and `craft/mechanism-bank` §3 is no longer
a source of entries.

**Migration**: Re-stated for every mechanism in `angle-mechanism-authoring`: "The
mechanism is settled bank-first from the `mechanisms` table" (now `list_mechanisms` /
`get_mechanism` against the table, not a knowledge-base read) and "The mechanism is judged
against `craft/doctrine` §2 read live", which keeps the read-live rule, the no-restatement
rule and the failed-read stop unchanged. Provenance is reported as the drawn `slug` or as
not-in-the-bank; no `in_bank` field survives.

### Requirement: An override is grounded in an attributed voice-of-customer item from the approved Approaches document

**Reason**: Same reason: the grounding rule did not change, but its subject did. Scoped to
overrides it would govern an empty set while every ordinary mechanism went ungrounded.

**Migration**: Carried unchanged into `angle-mechanism-authoring`'s "The mechanism is
grounded in an attributed voice-of-customer item from the approved Approaches document",
which binds **every** mechanism a brief settles: no voice-of-customer pass of its own, no
second outward account of the period, no fetch or search tool for that purpose, and an
unattributable phrase supports nothing. `ssc-approaches-core` keeps that pass and becomes
explicitly the sanctioned source of the quote.

### Requirement: An override is proof-routed from this period's inventory and dropped when compliance refuses it

**Reason**: Scoped to overrides for the same reason as the two above, and its fallback
clause — "the angle falls back to the inherited mechanism or returns below bar" — names a
fallback that no longer exists.

**Migration**: Carried into `angle-mechanism-authoring`'s "The mechanism is proof-routed
from the period's inventory and dropped when compliance refuses its only route", with the
drop-not-soften-not-re-trace rule intact, the unverified-for-period marking where the
inventory is absent, and the bank-draw-is-not-pre-cleared rule stated explicitly. The
fallback collapses to one outcome: the angle returns below bar.

### Requirement: An override's blast radius is the one angle it was authored for

**Reason**: The blast radius the requirement bounded — a write reaching up to
`idea.mechanism` or sideways to a sibling angle — is unreachable. There is no
`idea.mechanism` to write, patch or demote, and no inheritance that would make a sibling
stale.

**Migration**: The half that still means something is preserved in
`angle-mechanism-authoring`'s "One angle, one mechanism — and sibling angles may
disagree": the guarantee is stated as *one angle, one mechanism* and never *one subject,
one mechanism*, and no brief step re-opens, re-runs, re-scores or reports stale a sibling
angle. What is **not** preserved is the implied coherence: sibling angles may now name
mechanisms that do not cohere, nothing checks it, and the new requirement states that as an
accepted cost rather than an oversight. The no-write-to-the-idea rule moves to the same
capability's first requirement.

### Requirement: Every override is reported, naming its provenance

**Reason**: There are no overrides to report, and two of the four facts the report was
required to name — the inherited mechanism it departed from, and the reason it did not
serve that angle's persona × route — do not exist. The `bank_id` / `in_bank: false`
provenance pair is retired with the Approaches supply.

**Migration**: Replaced by `angle-mechanism-authoring`'s "Every run reports the mechanism
and its provenance, and provenance is report-only", which reports every mechanism — not
only a departure — naming the angle and either the bank `slug` drawn from or that it is
not in the bank. That requirement also states plainly that provenance is **report-only**:
there is no `briefs.mechanism_slug` column, and no skill may smuggle provenance into
another field.

### Requirement: Downstream consumers resolve the brief's override first, then the idea's

**Reason**: There is no resolution order, because there is only one field. `get_idea` and
`list_ideas` return no mechanism, so a consumer that fell through to "otherwise the
idea's" would resolve nothing while appearing to have a fallback.

**Migration**: Replaced by `angle-mechanism-authoring`'s "Producers read `brief.mechanism`
alone and invent nothing", which deletes the resolution table from `ssc-ads-writer`,
`ssc-post-produce` and `ssc-post-authority`, keeps the never-restate / never-vary /
never-invent rule verbatim, keeps `ssc-post-authority`'s floor judged against the
mechanism it reads, and collapses the legacy tolerance from three cases to one: a brief
approved before the gate carries no mechanism, production proceeds, the absence is named,
and nothing is fabricated. `ssc-post-schedule`'s sort key moves from `list_ideas` to
`list_briefs`.

### Requirement: The rule is written channel-agnostically even though it is in practice an ads affordance

**Reason**: The requirement exists to keep one exception rule from being copied into two
files that then diverge — but the rule it governed is gone, and the mechanism rule is no
longer an ads affordance at all. It binds both channels equally: an ad angle and a post's
single angle each author their own mechanism, and each is refused approval without one.

**Migration**: The shared-core discipline survives in `angle-mechanism-authoring`'s "The
shared brief core holds no mutation tool, and the caller saves", which keeps the rule in
`ssc-brief-core` and names each caller's save — `ssc-ads-brief` passing `mechanism` on
`save_brief`, `ssc-post-ideate` round 3 patching with `edit(entity='brief')`. No skill
branches the mechanism rule on channel name; the only channel branch that remains is the
server-side approval bar, which binds `ad` and `post` and leaves `youtube` untouched.

### Requirement: The persistence contract the `content` repository must provide

**Reason**: The contract has shipped, and shipped differently. `briefs.mechanism` is
deployed and is the mechanism's only home; `save_brief` accepts it and
`edit(entity='brief')` allows it; `get_brief` and `list_briefs` return it. The parts of
the contract that were about the *idea* — `get_idea` / `list_ideas` returning `mechanism`
— are void, because `ideas.mechanism` was dropped rather than exposed. A requirement that
describes an undeployed contract and carries a retracted clause has nothing left to
assert.

**Migration**: The one clause still worth stating is preserved as
`angle-mechanism-authoring`'s "`briefs.mechanism` is an ordinary field and adds no
governance gate": the hook and its matchers stay untouched, an `edit` patch carrying
`mechanism` is ordinary draft authoring, and no skill gains `approve`, `unapprove`,
`update_status` or any publish or schedule tool. The approval bar lives on the server's
`approve(entity='brief')` verb, specified in the same capability's "A mechanism-less `ad`
or `post` brief cannot be approved" requirement.

### Requirement: Until the server fields exist, an override is reported and not persisted

**Reason**: The degraded state this requirement described is over. `briefs.mechanism` is
deployed, so a mechanism settled at the brief is persisted on the row that owns it, and
there is no gap to report around.

**Migration**: The no-repurposing rule it protected is preserved — and re-aimed at the one
thing that is still unpersisted — in `angle-mechanism-authoring`'s "Every run reports the
mechanism and its provenance, and provenance is report-only": the mechanism itself is
saved, its provenance is not, and no skill may write that provenance into another brief
field or onto any idea field.
