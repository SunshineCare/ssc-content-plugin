# What Meta actually reports at asset level under Advantage+ / dynamic creative

Type: research
Status: resolved
Parent: ../map.md

## Question

The account runs **Advantage+ / dynamic creative**: multiple copies, headlines, descriptions
and images are uploaded and Meta permutes them. Everything on this map that depends on
measurement — the variation axis, the read-back loop, whether the doctrine is a hypothesis set
at all — hangs on what Meta actually tells us afterwards.

Establish, from Meta's own first-party documentation and the Marketing API reference wherever
possible:

1. **Asset-level breakdown.** What per-asset reporting exists for dynamic creative and for
   Advantage+ campaigns — which metrics are available by asset, which are not, and where the
   documentation says the numbers cannot be compared (Meta has warned that asset breakdowns
   are not a valid A/B test because delivery is not randomised). Distinguish *text* assets
   (primary text, headline, description) from image/video assets — the text side is the one
   this map needs and is historically the thinner one.
2. **Identity.** Does a text asset carry a stable id we could store against a produced copy row,
   so a result can be traced back to the choice that produced it? Or is the only durable handle
   the ad, the ad set, or the creative?
3. **What the API exposes** — the fields, breakdowns and any limits (attribution windows,
   minimum volume, aggregation thresholds) that would decide whether a read-back loop is
   buildable at all.
4. **The sanctioned way to actually test** under Advantage+ — Meta's own A/B test product,
   split by ad set, holdouts — and what it costs in structure: what must be held constant, how
   many creatives per cell, what Meta says about spend per creative and learning phase.
5. **Whether Advantage+ is a deliberate choice or a default**, in the sense of what an
   advertiser gives up in measurability by running it — stated by Meta and by credible
   practitioners, with the disagreement reported rather than resolved.

Report the field; do not decide the doctrine. Where the first-party documentation is silent or
has changed recently, say so and mark the practitioner claim as such — the sweep on the canon
found several widely-repeated Meta "rules" that Meta had quietly withdrawn.

Write findings to `.scratch/ads-doctrine/research/meta-measurement.md`.

## Answer

Findings: [`research/meta-measurement.md`](../research/meta-measurement.md) — 882 lines, all
five areas, with 21 flagged silences/contradictions and a list of cheap API probes that would
close the rest.

**The load-bearing verdict: a text asset can be counted, but its outcome cannot be attributed.**

- **Numbers per text asset: yes, five of them.** `body_asset` / `title_asset` /
  `description_asset` breakdowns exist in Ads Insights, and Meta's own doc limits them
  verbatim to `impressions`, `clicks`, `spend`, `reach`, `actions`, `action_values`. There are
  no results or cost-per-result columns at asset level.
- **Outcome per text asset: no.** Our outcome lives inside a Messenger thread, and the
  `messaging_referrals` webhook carries `ad_id` plus an advertiser-set `ref` — **no asset
  identity at all**. So the **smallest unit anything downstream can be attributed to is the
  ad**, not the copy.
- **Neither is causal.** Delivery is not randomised across assets; the divergent-delivery
  problem is documented in a 2025 paper co-authored by two Meta research scientists, which
  finds the imbalance present even inside Meta's own A/B test. Meta declines to attach a
  confidence level to its own creative test.
- **Interactions are invisible** — no breakdown combines two asset breakdowns, or an asset
  breakdown with a demographic or placement cut. So "which headline works with which copy" is
  unanswerable by construction.
- **Nothing Meta sanctions randomises below the ad** — creative-test cells hold exactly one ad
  id.

**Identity is asymmetric, which is a schema problem.** At write time an `asset_feed_spec` body
carries `text`, `url_tags` and `adlabels` but **no id**; at read time Meta mints a
`body_asset_id`. A produced copy row therefore **cannot be pre-stamped** with the id it will
later be reported under — reconciliation has to happen on exact text (or possibly `adlabels`,
unverified: the label node reference 404s). `url_tags` are useless to us — there is no landing
page.

**Premises this corrects:**

- **"Advantage+ campaign" does not exist for messaging.** The `advantage_state` enum offers
  only SALES / APP / LEADS / DISABLED. What actually runs here is Advantage+ *audience*,
  *placements* and *creative* on an Engagement objective. The map's Notes are corrected.
- **Advantage+ is a default, not a choice** — opting out takes four screens, and placement
  exclusion leaks about 5% per placement.
- **"3–5 creatives per ad set" — confirmed to have no first-party number**, and Meta's own
  dated newsroom post (2025-12-16) argues against fixing one. The only first-party spend
  figure is the creative test's "no more than 20% of your existing budget".
- **Adding a creative to a live ad set resets learning** — so "just add another variation"
  has a real cost.
- **Lift and holdout tests are unavailable to this funnel** (holdouts withdrawn 2021-04-26;
  Conversion Lift requires pixel/CAPI/SDK/offline sources, and messaging conversations are not
  listed). The A/B test is the only sanctioned randomised instrument we have.
- CAPI for Business Messaging exists and changes what the *ad* optimises toward, but restores
  nothing at asset level.

**Unclosed, and cheap to close**: six API probes are listed in §9 of the findings. The highest
value one is whether `ads_context_data.ad_title` on the referral webhook carries the
DCO-selected variant — if it does, part of the attribution gap closes. Ticketed as
[Probe the Meta API for what the docs won't say](./19-meta-api-probes.md).

## Amendment — 2026-07-30, OVERTURNED IN PART by [the live probes](./19-meta-api-probes.md)

**"A text asset can be counted but its outcome cannot be attributed" is WRONG.** Run against the
live account, `body_asset` / `title_asset` / `description_asset` breakdowns with
`action_breakdowns=action_type` return the whole messaging funnel per text asset — 748
`messaging_conversation_started_7d` across 98 distinct body assets in 90 days — plus
`cost_per_action_type` per asset.

The documentation was read too literally: `actions` **is** one of the six permitted fields, and
with an action breakdown that one field carries every messaging conversion. Only the pre-computed
`results` / `cost_per_result` columns are genuinely missing.

What survives from this ticket unchanged: delivery is **not randomised** across assets, so the
numbers are observational and not causal; **interactions are invisible** (no breakdown combines
two asset breakdowns); the `messaging_referrals` webhook still carries no asset identity; adding a
creative to a live ad set still **resets learning**; lift/holdout tests are still unavailable;
"3–5 per ad set" still has no first-party basis. And the id-instability finding is now
**measured** rather than inferred: the same text can be minted as several asset ids, so aggregate
by exact text.
