# How the system measures what it ships and adjusts

Type: grilling
Status: resolved
Blocked by: 08
Parent: ../map.md

> Operator, 2026-07-29: *"This change is not spec'd by using past performance. But the whole
> system design should measure performance and adjust accordingly."* So this is not a
> nice-to-have downstream of the toolkit — measurement is a **design requirement of the whole
> pipeline**, and every layer owes it something. The doctrine is a hypothesis set; without a
> read-back it is only a preference.

## Question

[The spine](./04-framework-spine.md) deliberately declines to name a winning structure: the
tools get varied and real delivery decides. That is only true if something reads the result
back — otherwise the pipeline varies forever and learns nothing, which is the same blandness
by another route.

Decide what the loop is. What gets recorded on a variation at production time so a result can
later be attributed to a *choice* (lead type, structure, proof device, register, length) rather
than to an anonymous blob of copy? Who reads the results back, and at what cadence — the
monthly plan's Review step already ranks taxonomy terms and is the system's only look-back;
does the toolkit's evidence belong there, or in the quarterly cycle where doctrine changes are
slow enough to be safe? And what threshold makes a tool a keeper, a demotion, or a retirement,
given ~2% of creatives win and the binding constraint is spend per creative rather than
creative count?

Take it layer by layer, since every one of them makes a choice that a result could be
attributed to — and today almost none of them record it in a legible form:

- **Copy**: which lead type, which structure, which proof device, which register, which
  length. Also what the writer's 1–5 self-score is even measuring, given
  [the ad's job](./13-what-the-ad-is-for.md) makes *qualification* the goal rather than volume
  — a score that predicts nothing measurable is decoration.
- **Brief/angle**: which persona, which route, which awareness stage, which mechanism.
- **Idea**: which subject territory.
- **Plan and strategy**: which themes and which terms were bet on, and whether the Review
  step's term ranking is the right instrument to catch the answer.

Then: what changes when a result comes back, and *who* is allowed to change it — a tool
demoted, a mapping revised, a term retired, a doctrine doc amended. Name the cadence and the
threshold, remembering ~2% of creatives win and the binding constraint is spend per creative,
not creative count. And say plainly what the pipeline cannot currently record, since that list
is a recommendation a later effort takes to the `content` repo.

**Scope note.** The map rules *mining our own historical performance data* out of scope as
evidence for choosing the frameworks now. This ticket is the forward-facing counterpart —
designing the loop that makes future results legible — and does not reopen that. If the answer
turns out to require reading history after all, say so plainly rather than doing it quietly.

## Answer

**The loop already exists; the axes just have to be legible to it.** `get_term_performance`
attributes both performance sides to **taxonomy terms** by `kind`, carries explicit honesty
fields, and deliberately emits no score, rank or disposition — the ranking and the
scale/maintain/drop call are the operator's act. It is already the monthly Review's input, and
Review is already the system's only look-back. So no new read surface is needed.

**1. The coverage axes are taxonomy KINDS, not columns and not a JSON blob.** This supersedes
the "structured columns" shape floated in [06](./06-brief-model.md). New kinds: **lead type**,
**opening frame**, **proof device**, **register**, **length band** — each produced asset tagged
with one term per applicable kind. Reasons, in the order that decided it:

- `get_term_performance` reads them **the day they are populated** — a JSON column is invisible
  to it, so choosing JSON means building the reader before anything can be learned.
- Term existence validates the write. In a JSON blob a mistyped axis persists silently and
  simply disappears from every aggregate — the worst failure mode for a measurement system,
  because it looks like data.
- Rosters stay **open**, which is the repo's standing rule: a seventh lead or a new proof device
  is a term insert, not a migration and not a skill edit.
- The writer already resolves term ids for persona, route and layer, so this is an existing
  pattern rather than a new one.

**2. Cadence is split: monthly reads, quarterly changes.** The monthly Review ranks the new
kinds alongside pillar/persona/route/angle — no new step, no new tool. But **doctrine changes
only at the quarterly cycle**: retiring a lead, demoting a proof device, or altering the floor
waits for a quarter's worth of evidence. The reason is in the measurement itself — ~2% of
creatives win, delivery is not randomised across assets, and the ad is the smallest attributable
unit ([18](./18-meta-asset-reporting.md)) — so a single month's ranking is mostly noise, and a
doctrine that rewrites itself monthly would chase it. Fast where it is cheap (ranking), slow
where it is expensive (rules).

**3. What each layer must record**, so a result attaches to a choice rather than to a blob of
text:

| Layer | Records |
|---|---|
| Copy | lead type, opening frame, proof device, register, length band (one term each) |
| Brief/angle | persona, route, awareness stage, layer — already recorded; plus the inherited mechanism |
| Idea | the mechanism itself ([06](./06-brief-model.md)) |
| Plan/strategy | which themes and terms were bet on — Review already does this |

**4. What the loop cannot do, stated rather than papered over.** The honesty fields are part of
the doctrine, not a caveat on it: `days_uncovered` marks dates no ingestion run spanned (unknown,
**not** zero), `provisional_from` marks figures Meta may still restate, `excluded[]` holds
segments that could not be attributed, and each side carries its own `complete` flag. **When
`complete` is false the degradation is stated, never presented as a measurement.** Two further
hard limits: the page and ads sides count different events on different denominators and may
**never** be merged into one number, and `reach_day_sum` is a sum of daily uniques and is **not**
reach — no frequency may be derived from it.

**5. The attribution precondition nobody owns yet.** Term attribution on the ads side depends on
the **ad → content linkage** being populated; `get_ad_performance` exposes a `classification`
block precisely to say whether it is. Ads are created by a human in the dashboard, so a produced
copy row only becomes measurable if whoever builds the ad preserves that link. **If the linkage
is absent, every axis tag is written and never read** — the loop silently does nothing. This is
an operational dependency outside the creative pipeline, and it belongs in the doctrine as a
stated precondition rather than an assumption.

**6. This closes the batch-size hole in [07](./07-copy-application-table.md) — later, not now.**
Sizing was left unset for want of data. Once the axes are populated and one quarter of Review
rankings exists, the cadence question can be answered from the account rather than from a
practitioner blog. Until then N stays operator-specified and the invariant stands: whatever N is,
the set spans that section's axes.

**7. Who may change what.** Ranking is monthly and mechanical. Disposition (scale/maintain/drop)
is the operator's, as it already is. **Doctrine amendment is a human act at the quarterly cycle**
— no skill, agent or projector may retire a term, demote a device or alter the floor, which is
the propose-only invariant applied to the doctrine itself.

## Amendment — 2026-07-30: the precondition is BROKEN TODAY, and it blocks implementation

§5 named the ad→content linkage as "a precondition nobody owns yet". A live read-only check shows
it is **not merely unowned — it is entirely unpopulated**.

`get_term_performance(2026-05-01 → 2026-07-29, kinds=[persona, route])` returns:

- **`terms: []`** — not one term attributed.
- `unattributed.ads`: **138 ads, 1,372,364 impressions, 144,436,085 VND spend, 882 messaging
  conversations**, all with `no_content_link: 138`.
- `unattributed.page`: 29 posts, `no_content_link: 29`.
- **`no_term: 0` on both sides** — nothing fails at term tagging; everything fails at the content
  link.
- `coverage.ads.complete: true`, 90/90 days covered — so this is **not** an ingestion gap. The
  performance data is present; the links are absent.

Note the shape of the failure: `get_ad_performance` reports `linkage_populated: true` with 561/570
ads carrying a story id, which is the **ad ↔ page-post** join (organic/paid classification). That
is a different join from **ad → BrandOS content row**, and the healthy-looking flag masks the broken
one. Anyone checking the first and concluding the loop works would be wrong.

**Consequence for implementation**: adding the five taxonomy kinds while this is broken produces
tags nothing can read — the exact silent failure this ticket warned about, except already in
progress. So establishing the ad→content link is promoted from "a risk with an owner" to **Step 0,
a hard prerequisite** of the sequence in [03](./03-doctrine-home.md). It is a `content`-repo
investigation: ads carry BrandOS-authored names, which suggests they were created through the
BrandOS path, so the link may be dropped at creation rather than never attempted.
