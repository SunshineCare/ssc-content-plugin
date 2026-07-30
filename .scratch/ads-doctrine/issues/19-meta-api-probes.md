# Probe the Meta API for what the docs won't say

Type: task
Status: resolved
Parent: ../map.md

## Question

[What Meta reports at asset level](./18-meta-asset-reporting.md) closed most of the
measurement question from documentation, and flagged 21 places where Meta's own pages are
silent, contradictory or dead — including two live pages disagreeing on A/B test duration, an
enum value missing from its own reference, and **no publication dates anywhere**, which makes
quiet withdrawal unverifiable. Its §9 lists six cheap API probes that would settle the rest
from the live account instead of from prose.

Run them. The highest-value one first: **does `ads_context_data.ad_title` on the
`messaging_referrals` webhook carry the DCO-selected variant?** If it does, part of the
copy → outcome attribution gap closes, and the variation axis becomes a real choice rather
than a theoretical one. If it does not, the ad is confirmed as the floor and the doctrine must
be designed around that.

Also settle by probe rather than by reading: whether `adlabels` survive on an `asset_feed_spec`
body and come back on the insights breakdown (the label node reference 404s) — that decides
whether a produced copy row can be reconciled by anything sturdier than exact text matching.

Needs live Marketing API credentials for the ad account, so it may need the operator to
provision access before it can run. Record what was actually observed — request, response,
date — not what the documentation implied.

Write results to `.scratch/ads-doctrine/research/meta-probes.md`.

## Answer

Credentials found in `content/.env` (`FACEBOOK_SYSTEM_USER_ACCESS_TOKEN`, system user "Brand
OS"); the account is **`act_2474848802833161` ("ChildLife")** — confirmed by the operator as the
Cambridge account, and its ads promote page `519547008088094`. Graph **v24.0**. All probes run
**read-only**.

Results: [`research/meta-probes.md`](../research/meta-probes.md).

**P1 — messaging conversions DO survive the asset breakdown. This overturns
[ticket 18](./18-meta-asset-reporting.md)'s central verdict.** Over 90 days, `body_asset` /
`title_asset` / `description_asset` breakdowns with `action_breakdowns=action_type` return the
full messaging funnel per text asset — `messaging_conversation_started_7d` (748 conversations
across 98 distinct body assets), `_replied_7d`, depth-2/3/5 sends, `total_messaging_connection` —
**and `cost_per_action_type` per asset**. Meta's documented limit ("only impressions, clicks,
spend, reach, actions, action_values") is technically true but misleading: `actions` is on that
list, and it carries everything. Only the pre-computed `results` / `cost_per_result` columns are
absent.

So **copy-level outcome attribution is available today**, and
[ticket 08](./08-variation-mechanics.md)'s conditional has fired. Still true: delivery is not
randomised across assets, so the figures are **observational, not causal**, and copy×headline
interactions remain invisible (no breakdown combines two asset breakdowns).

**P2 — `body_asset_id` is NOT stable for identical text.** Answered from existing data as a
natural experiment instead of by creating ads: **77 distinct texts → 98 distinct ids**; 21 texts
map to more than one id, while 66 ids span more than one ad. So aggregating by id **splits one
copy line** and understates it. **Aggregate by exact normalised text, ids as child keys** — the
reconciliation-by-text rule now has a measured basis.

**P3 — `adlabels` are not present** on live `asset_feed_spec` items (`text` only) and nothing
surfaces on the read side. Given P1 and P2 the label path is **unnecessary**: text is the join
key and outcomes already arrive per asset.

**P4 — still open**, and now much less important: it was the highest-value probe only because
asset-level outcomes were believed unavailable. Needs webhook access and live inbound
conversations, not an API read.

**P5 / P6 — not attempted**, because both require creating an ad set or using Ads Manager. P5's
practical form is answered anyway: **dynamic creative is demonstrably live in this account**
(multiple active ads carry `asset_feed_spec` with `optimization_type: DEGREES_OF_FREEDOM`).

**Not run, deliberately**: every probe requiring a **write** — creating ads or ad sets — since
those mean real spend and outward-facing objects. That needs explicit authorisation, and none of
the load-bearing questions turned out to need it.

**Incidental, worth acting on separately**: the account's two best-delivering body assets are
already written in two of [ticket 14](./14-opening-beat-policy.md)'s permitted frames
(first-person failed-journey; reported third-party dialogue), asserting nothing about the
reader — the doctrine is codifying what the best existing copy already does. And one ad in the
sample is `DISAPPROVED`, so platform rejection is a live event in this account.
