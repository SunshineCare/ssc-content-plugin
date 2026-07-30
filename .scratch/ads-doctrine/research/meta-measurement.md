# What Meta actually reports at asset level under Advantage+ / dynamic creative

Research ticket: `../issues/18-meta-asset-reporting.md` · Map: `../map.md`
Date of research: **2026-07-29**. Reporting only — no doctrine recommended.

---

## 0. Evidence quality — read this first

Five source classes are used, and every claim below is tagged:

- **[META-DOC]** — first-party Meta documentation reached and read directly
  (`developers.facebook.com` Marketing API reference, Meta developer blog).
  Highest trust.
- **[META-HELP]** — first-party Meta Business Help Center / Meta for Business wording,
  read through a headless browser and quoted verbatim. Meta's own words, but see the
  dating limitation below.
- **[META-SNIPPET]** — Help Center wording recovered only as a **search-engine snippet**,
  not read in context.
- **[PRACTITIONER]** — agencies, media buyers, trade press (Jon Loomer, ppc.land,
  Supermetrics, Funnel, MagicBrief, …). Useful for what advertisers actually observe;
  **not** authoritative on what Meta guarantees.
- **[ACADEMIC]** — peer-reviewed / preprint research, including one paper co-authored by
  Meta research scientists. Treated as strong evidence about the *mechanism*, not as a
  Meta product commitment.

**Access note.** `facebook.com/business/help/*` is client-rendered and returns a title-only
document to plain fetching (tried `www.`, `web.`, `en-gb.`, `?locale=en_US`, browser
user-agent, `curl`). Those pages were recovered by a headless browser and are quoted
verbatim so future drift is detectable. The Marketing API reference on
`developers.facebook.com` fetches normally and is the backbone of §§1–3.

**Dating limitation — this is a real problem for this ticket.** Meta's Marketing API doc
pages carry a Graph API version (currently `v25.0`) but **no publication or last-updated
date**. **Help Center pages carry no date at all** — not in the page, not in metadata. So
"current per Meta" below means "as retrieved 2026-07-29" and nothing stronger, and the
ticket's concern about quietly-withdrawn rules **cannot be settled from Meta's own pages**;
it can only be settled by quoting them verbatim and re-checking later. Every dated claim
below takes its date from trade press, a Meta *newsroom* post, a changelog, or a versioned
artifact (paper, code commit), and says which.

---

## 1. THE VERDICT — can a result be attributed to an individual text asset?

**Short answer: partially, and not in a way that survives the Messenger funnel.**

Split into the two halves the ticket needs:

### 1a. Can a *delivery* result be attributed to one text asset? — YES, but only five metrics

Meta's Ads Insights API exposes per-asset breakdowns for dynamic-creative ads —
`body_asset` (primary text), `title_asset` (headline), `description_asset`,
plus `image_asset`, `video_asset`, `call_to_action_asset`, `link_url_asset`,
`ad_format_asset` **[META-DOC]**
([Breakdowns, Marketing API](https://developers.facebook.com/docs/marketing-api/insights/breakdowns/)).

But the doc states, verbatim:

> "All Dynamic Creative asset breakdowns only support a limited set of metrics:
> `impressions`, `clicks`, `spend`, `reach`, `actions`, `action_values`."
> — [Breakdowns, Marketing API](https://developers.facebook.com/docs/marketing-api/insights/breakdowns/) **[META-DOC]**

and

> "By design, `image_asset` and `video_asset` breakdowns are not available at the ad
> account level for assets used in Dynamic Creative."
> — same page **[META-DOC]**

So a **produced copy row can be joined to impressions / clicks / spend / reach / actions**
for the period it ran. That is real, it is API-accessible, and it is enough to build a
read-back loop *on those five metrics*.

### 1b. Can that result be *causally* read as "this copy worked"? — NO, and Meta's own researchers say why

Delivery under dynamic creative is **not randomised**. Meta's system chooses which
permutation to show which person, so a body asset's apparent CTR confounds the copy with
the audience the algorithm decided to give it. This is **divergent delivery**, and it is
documented in a paper co-authored by two Meta research scientists (Robert Moakler, Poppy
Zhang) with three academics:

> "Lift tests show no meaningful audience imbalance, confirming their causal validity,
> while A/B tests show clear imbalance, as expected."
> — Burtch, Moakler, Gordon, Zhang, Hill, *Characterizing and Minimizing Divergent
> Delivery in Meta Advertising Experiments*, arXiv **2508.21251**, submitted
> **2025-08-28** ([arxiv.org/abs/2508.21251](https://arxiv.org/abs/2508.21251)) **[ACADEMIC]**

The paper further states that "no configuration guarantees eliminating divergent delivery
entirely" **[ACADEMIC]**. Note the strength of this: the imbalance is present **even in
Meta's own A/B test product**, which is the sanctioned test. An *asset breakdown*, which
is not even nominally randomised, is strictly weaker than that.

The underlying result is Braun & Schwartz, *Where A/B Testing Goes Wrong: How Divergent
Delivery Affects What Online Experiments Cannot (and Can) Tell You About How Customers
Respond to Advertising*, **Journal of Marketing, 2025**
([SAGE](https://journals.sagepub.com/doi/10.1177/00222429241275886)) **[ACADEMIC]** —
platforms "deliver different ads to distinct and undetectably optimized mixes of users",
so estimated comparisons "confound the effect of ad content with the effect of algorithmic
targeting."

Meta and MSI ran a joint webinar on exactly this, **2026-05-05**, with Meta's Moakler and
Zhang on the panel: the framing given is that "observed performance differences may reflect
both creative effectiveness and who saw the ads"
([MSI event page](https://www.msi.org/events/meta-ad-testing-demystified-divergent-delivery-and-what-it-means-for-your-results/))
**[ACADEMIC / Meta-adjacent]**.

**On the ticket's premise that "Meta has warned that asset breakdowns are not a valid A/B
test": partially confirmed, at one level up.** I found **no** Meta sentence saying it about
*asset* breakdowns specifically. But Meta says it flatly about un-randomised comparison in
general — this is the sharpest first-party quote in the whole sweep:

> "Why can't I use two campaigns or ad sets with different strategies to determine the best
> strategy? **This isn't true experimentation.** When multiple campaigns or ad sets run
> simultaneously in Ads Manager without the A/B testing tool, the system does not evenly
> split them, but instead treats them in combination, **skewing delivery and budget
> distribution. This overlap can contaminate strategies and result in inaccurate
> comparisons.**"
> — [Meta for Business, A/B testing](https://www.facebook.com/business/measurement/ab-testing) **[META-HELP, undated]**

and, in the Help Center: "We do not recommend testing informally, such as by turning ad sets
or campaigns on and off manually. This can lead to inefficient ad delivery and unreliable
test results" ([About A/B testing](https://www.facebook.com/business/help/1738164643098669))
**[META-HELP, undated]**.

Assets inside one dynamic-creative ad are *less* randomised than two ad sets, so the
argument applies a fortiori — but that is an inference, not Meta's sentence. Treat "Meta
warned about asset breakdowns specifically" as **not found**.

**A second first-party admission, this one directly on point.** Meta's own in-campaign
creative test — its sanctioned way to compare creatives — reports **without inference**:

> "The results identify top-performing test ads against your comparison metric…
> **A confidence level is not included.**"
> — [Creative test in Ads Manager](https://www.facebook.com/business/help/1423851372208214) **[META-HELP, undated]**

If Meta declines to attach a confidence level to its *own* creative test, an asset
breakdown carries strictly less inferential weight than that.

### 1c. What is the smallest unit a result can be attributed to?

Two different answers depending on which metric you mean:

| Metric family | Smallest attributable unit | Source |
|---|---|---|
| `impressions`, `clicks`, `spend`, `reach`, `actions`, `action_values` | **one text asset** (one body / title / description string) within one ad, per day | [Breakdowns](https://developers.facebook.com/docs/marketing-api/insights/breakdowns/) **[META-DOC]** |
| Any metric **not** in that list (results, cost per result, video metrics, unique metrics, most conversion columns) | **the ad** | same, by exclusion **[META-DOC]** |
| One asset **in combination** with another (which body ran with which headline) | **not available at all** — no breakdown permutation combines two asset breakdowns (§3c) | [Breakdowns](https://developers.facebook.com/docs/marketing-api/insights/breakdowns/) **[META-DOC]** |
| Anything arriving **through the Messenger conversation** (a qualified lead, a consult booked, a *liệu trình* sold) | **the ad** (`ad_id` on the referral webhook) — asset identity is not carried into the thread | [messaging_referrals webhook](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_referrals/) **[META-DOC]**, §4 |
| Anything under **Advantage+ creative enhancements** (as opposed to dynamic creative) | **the ad** — Meta states there is no breakdown by variation | §5 **[META-SNIPPET]** |
| Anything inside **Meta's own sanctioned creative test** (`SPLIT_TEST_V2`) | **the ad** — each test cell holds "exactly one ad ID" | [Split testing guide](https://developers.facebook.com/docs/marketing-api/guides/split-testing/) **[META-DOC]**, §6a |

**The load-bearing sentence for this map:** for a business whose only real outcome lives
downstream of a Messenger conversation, the finest unit any *outcome* can be attributed to
is **the ad**. The text asset is measurable only on delivery-side proxies (impressions,
clicks, and whatever `actions` Meta returns), and only correlationally.

---

## 2. Identity — does a text asset have a stable handle?

This is the question that decides whether a produced copy row can be joined to a number.

### 2a. At write time, a text asset has NO id and NO advertiser-set key — only text (+ optional labels)

`asset_feed_spec` is the Marketing API construct that carries dynamic creative's assets.
Its body entries are shaped `{"text": "...", "url_tags": "..."}` — you supply strings, not
identified objects **[META-DOC]**
([Asset Feed Spec](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/),
[Asset Feed Options](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/options/)).

The Graph API node reference confirms the field set exactly. `AdAssetFeedSpecBody` has
**three** fields and no `id`:

> | Field | Description |
> |---|---|
> | `adlabels` | list<AdAssetFeedSpecAssetLabel> — Ad Label spec of the asset used for your ad |
> | `text` | string — Text used as body for your ad |
> | `url_tags` | string — URL tags spec of the asset used for your ad |
>
> — [Ad Asset Feed Spec Body](https://developers.facebook.com/docs/marketing-api/reference/ad-asset-feed-spec-body/) **[META-DOC]**

So at creation the advertiser controls exactly three possible join keys:

1. **The literal text string.** Always available. Fragile: any edit to the copy (a
   typo fix, a diacritic change) creates a different asset.
2. **`adlabels`** — an `AdAssetFeedSpecAssetLabel` attached per asset. This is the only
   *advertiser-chosen*, text-independent handle in the structure. **Caveat: I could not
   read the `AdAssetFeedSpecAssetLabel` node reference** (404 on every URL form I tried),
   so I cannot confirm its fields, nor — critically — **whether asset labels are returned
   by or usable as an Insights breakdown**. Treat "label the asset and report by label" as
   **plausible but unverified**; it needs a live API probe before anything is built on it.
3. **`url_tags`** (UTM-style). **Useless for this advertiser** — url_tags decorate a
   destination URL, and a click-to-Messenger ad has no destination URL to decorate. No
   landing page, no UTM, no downstream join. (Reasoned from the field's definition
   **[META-DOC]** — Meta does not state this exclusion explicitly.)

### 2b. At read time, the breakdown DOES return an id

The reporting side returns an identified object per asset — the breakdowns page describes
these breakdowns as "The ID of the [asset type] involved in impression, click, or action"
**[META-DOC]**. Independent corroboration from a production connector: Airbyte's Facebook
Marketing source maps each asset breakdown to an id field used as part of the record's
primary key:

```python
object_breakdowns = {
    "body_asset": "body_asset_id",
    "call_to_action_asset": "call_to_action_asset_id",
    "description_asset": "description_asset_id",
    "image_asset": "image_asset_id",
    "link_url_asset": "link_url_asset_id",
    "title_asset": "title_asset_id",
    "video_asset": "video_asset_id",
}
```
— [airbytehq/airbyte, `base_insight_streams.py`](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-facebook-marketing/source_facebook_marketing/streams/base_insight_streams.py)
(read 2026-07-29, `master`) **[PRACTITIONER — but it is working code against the live API]**

**The asymmetry is the finding.** Meta *assigns* an id and gives it back in reporting; the
advertiser cannot *supply* or predict it at creation. So a produced-copy row cannot be
stamped with the id it will later be reported under — the id has to be **discovered on the
first read-back and then reconciled**, and the only thing available to reconcile on is the
text string (or, if it works, an adlabel).

**Not established:** whether `body_asset_id` is stable for the same text across different
ads, ad sets, or time. I found no first-party statement and no reliable practitioner
report either way. This is a **direct, cheap experiment**: put the same body string in two
ads and compare the returned ids. It should be run before any schema commits to the id as
a key.

---

## 3. What the API actually exposes, and its limits

### 3a. Breakdown values (asset family)

`body_asset`, `title_asset`, `description_asset`, `image_asset`, `video_asset`,
`call_to_action_asset`, `link_url_asset`, `ad_format_asset` **[META-DOC]**
([Breakdowns](https://developers.facebook.com/docs/marketing-api/insights/breakdowns/)).

Note the shape of the text side: **primary text, headline and description each have their
own breakdown.** The text side is *not* thinner than the image side here — if anything the
opposite, since `image_asset`/`video_asset` are the two Meta explicitly withholds at
account level.

### 3b. Metrics — the hard ceiling

`impressions`, `clicks`, `spend`, `reach`, `actions`, `action_values`. Nothing else
**[META-DOC]**.

What this excludes, by exclusion from that list: the `results` / `cost per result` columns,
all unique metrics, all video-engagement metrics, frequency (except in Reach & Frequency
reports, see below), CTR/CPC/CPM as *fields* (they are derivable from the five, so this is
not a real loss).

`actions` is the interesting one for this advertiser: **messaging conversions are action
types**, e.g. `onsite_conversion.messaging_conversation_started_7d` and
`onsite_conversion.messaging_first_reply` **[META-DOC — action type names appear in the
Insights API surface]**. Since `actions` is a supported metric under asset breakdowns, a
per-asset count of *conversations started* should be retrievable. **I could not find a
first-party sentence confirming that messaging action types specifically survive an asset
breakdown** — it follows from the two documented facts, but it is an inference, and
practitioner sources warn that "certain conversion metrics are not available for the 'by
Dynamic Creative Asset' breakdowns"
([Funnel KB, updated 2026-03-18](https://help.funnel.io/en/articles/3371273-facebook-ads-troubleshooting))
**[PRACTITIONER]**. **Verify with one live API call before designing on it.**

Also from Funnel **[PRACTITIONER]**: in a **Reach and Frequency** report these breakdowns
support only Reach and Frequency; and if the account mixes dynamic and non-dynamic ads,
applying an asset breakdown silently returns partial data (non-dynamic ads are simply
absent). Supermetrics says the same: "Only dynamic creative ads are included in the data"
([Supermetrics docs, updated 2026-05-06](https://docs.supermetrics.com/docs/good-to-know-about-facebook-ads))
**[PRACTITIONER]**.

### 3c. Combination limits — you cannot see the winning *combination*

The Breakdowns page's "combining breakdowns" permutation table **contains no asset
breakdown at all** **[META-DOC]** — no permutation pairs two asset breakdowns, and none
pairs an asset breakdown with age/gender/publisher_platform. Practically: one asset
dimension at a time, and no demographic or placement cut of it.

Consequence for a doctrine that wants to learn: **the interaction is invisible.** You can
learn that body B outperformed body A on clicks; you cannot learn that body B only
outperformed when it ran with headline Y, or only on Reels, or only for women over 45.
Since the whole premise of dynamic creative is that the algorithm exploits exactly those
interactions, the reporting surface is structurally unable to show you what the system is
doing. (This mirrors the common practitioner complaint that you can't see the winning
combination — [Jon Loomer](https://www.jonloomer.com/qvt/goal-of-dynamic-creative-flexible-ad-format/)
**[PRACTITIONER]**, snippet only; his site is Cloudflare-protected and could not be
fetched in full.)

### 3d. Other API limits that bear on a read-back loop

- **Retention: ~37 months.** "Facebook stores metrics maximum of 37 months old. Any time
  range that older than 37 months from current date would result in 400 Bad request"
  — Airbyte connector comment citing the ad-account insights reference
  ([source](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-facebook-marketing/source_facebook_marketing/streams/base_insight_streams.py))
  **[PRACTITIONER quoting META-DOC]**.
- **Attribution windows.** Available action attribution windows are `1d_click`, `7d_click`,
  `28d_click`, `1d_view` (same source) **[PRACTITIONER quoting META-DOC]**. The Breakdowns
  page adds: metrics "will not be available … When there is an attempted aggregation across
  multiple attribution settings" **[META-DOC]** — i.e. if the ad sets in scope have
  different attribution settings, the query returns nothing rather than a blended number.
  A read-back loop must pin one attribution setting.
- **Filtering:** "Filtering `app_id` and `skan_conversion_id` using the `filtering` field is
  currently not supported" **[META-DOC]**.
- **Asset count caps** (creation side): "Total number of bodies: <= 5", "Total number of
  titles: <= 5", "Total number of descriptions: <= 5", "Maximum of 30 total assets"
  — [Asset Feed Options](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/options/) **[META-DOC]**.
  This is a *hard* first-party number and it is worth contrasting with the "3–5 variations
  per ad set" folklore the canon sweep already found unsourced: Meta's real constraint is
  **≤5 per text field per ad**, and it is a structural cap, not a recommendation.
- **No aggregation threshold documented.** I found no first-party minimum-volume or
  privacy-suppression threshold applied to asset breakdowns. Absence of evidence only —
  Meta does apply thresholds elsewhere (e.g. demographic breakdowns) and the docs are
  silent here.

### 3e. Dynamic creative is still creatable via the API, and it supports the objective this advertiser uses

First-party, current (`v25.0`) **[META-DOC]**
([Dynamic Creative](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/dynamic-creative/)):

- Purpose: "Dynamic Creative allows you to automatically deliver different combinations of
  an ad's creative to your users" and "helps you find the best creative combination per
  impression".
- Compatible objectives listed: `OUTCOME_SALES`, **`OUTCOME_ENGAGEMENT`**, `OUTCOME_LEADS`,
  `OUTCOME_AWARENESS`, `OUTCOME_TRAFFIC`, `OUTCOME_APP_PROMOTION`. `OUTCOME_ENGAGEMENT` and
  `OUTCOME_LEADS` are the objectives click-to-Messenger ads run under, so **dynamic creative
  is documented as available for this advertiser's campaign shape.**
- Structural constraints: ad set `is_dynamic_creative = true`; "Your ad set **must be
  empty**" at creation; "You can only create one ad per ad set"; the ad cannot be deleted or
  archived (you delete the ad set).
- Caveat in the same doc: "For most objectives, set `optimization_goal` to
  `OFFSITE_CONVERSIONS`" — which is *not* the messaging optimization goal, and the doc does
  not spell out the messaging case. **Gap.**
- Deprecated: "`asset_feed_id` is only supported in Marketing API v3.1 and earlier. You
  should use `asset_feed_spec` instead."

The "one ad per ad set" rule is significant for §5: it means dynamic creative *cannot* be
combined with running several distinct ads in one ad set.

---

## 4. The Messenger funnel — where asset identity dies

This is the part that is specific to this advertiser and it changes the answer.

When someone clicks a click-to-Messenger ad, Meta fires a `messaging_referrals` webhook to
the Page. The referral object's documented fields are **[META-DOC]**
([messaging_referrals](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_referrals/)):

- `ref` — "The optional `ref` attribute set in the referrer. Only alphanumeric characters
  as well as `-`, `_`, and `=` are supported." *(advertiser-settable)*
- `source` — `"ADS"` or `"SHORTLINK"`
- `type` — `"OPEN_THREAD"`
- **`ad_id`** — the ID of the ad
- `ads_context_data` — `ad_title`, `photo_url`, `video_url`, `post_id`, `product_id`

**There is no asset id, no body text, and no permutation identifier in that payload.**
The finest handle the conversation receives is **`ad_id`** — plus whatever the advertiser
chose to encode in `ref`, which is set per ad, not per asset.

Two consequences:

1. **Every outcome that only becomes visible inside the conversation** — the consultant's
   read on lead quality, a booked consult, a *liệu trình* sold — can be attributed to the
   **ad**, and no finer. This is exactly the "good = a better-qualified conversation"
   outcome that issue 13 identified as the real objective, and it is **structurally
   un-attributable to a copy row** under dynamic creative.
2. **`ads_context_data` is a lead worth chasing.** It carries `ad_title` and `photo_url` —
   i.e. what the ad *showed*. If under dynamic creative those reflect the **actual
   permutation the clicker saw**, that would be a per-conversation, per-variant signal that
   the Insights API does not offer. **Meta's docs do not say whether it does.** This is
   **undocumented and untested**, and it is the single highest-value probe on this page:
   run one dynamic-creative click-to-Messenger ad with distinguishable headlines and read
   the webhook.

Note also that `ads_context_data` carries `ad_title` (the **headline**) but not the body —
so even in the best case this route would identify the headline asset, not the primary
text asset.

**Sending outcomes back to Meta.** Meta does provide a first-party route for pushing
conversation outcomes back: the **Conversions API for Business Messaging**, supporting
Messenger, WhatsApp and Instagram Direct, with 14 event types including `LeadSubmitted`,
`QualifiedLead` and `Purchase`, keyed on the Page-Scoped ID (Messenger), `ctwa_clid`
(WhatsApp) or IGSID (Instagram)
([CAPI for Business Messaging](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging/), examples on Graph API v16.0)
**[META-DOC]**. This makes "the consultant judged this lead qualified" a signal Meta can
optimise on — but it is delivered against a *person/thread* identifier, and once inside
Meta it aggregates to the ad. **It does not restore asset-level attribution.**

---

## 5. Advantage+ creative vs dynamic creative — different reporting surfaces

The two must not be conflated; they report differently.

- **Dynamic creative** (`is_dynamic_creative`, `asset_feed_spec`): asset breakdowns exist,
  as documented above **[META-DOC]**.
- **Advantage+ creative / "standard enhancements"** (Meta transforming or generating
  variants of your creative): Meta's Help Center states that with standard enhancements you
  see "aggregate performance metrics of all the delivered variations in Ads Manager, but
  there will not be a breakdown by format or ad creative variation" **[META-SNIPPET]**
  (surfaced from `facebook.com/business/help/297506218282224`, *About Creative
  Enhancements*; page body unreadable, see §0). **If that is current, enabling Advantage+
  creative enhancements removes variation-level reporting entirely.**
- **Creative breakdown / ad creative breakdown** (a newer Ads Manager surface): reported as
  launched **2025-07-11**, covering **Flexible format** ads and AI-generated image ads
  ([ppc.land, 2025-07-12](https://ppc.land/meta-unveils-creative-breakdown-for-flexible-formats-and-ai-generated-image-ads/)) **[PRACTITIONER]**.
  Meta's own page confirms the exclusion in its own words: **"Ad creative-level data
  currently does not include results for dynamic creative ads"**, plus "We are gradually
  introducing this experience so it may not be available to you yet", data from 2017-07-01
  ([help/243916866413404](https://www.facebook.com/business/help/243916866413404)) **[META-HELP]**.
  **The newer creative reporting and dynamic creative are mutually exclusive.**
  Practitioner reporting says Flexible format was
  limited to Sales and App Promotion campaigns, i.e. **not** available for messaging /
  engagement
  ([Relevant Audience](https://www.relevantaudience.com/facebook-ads/metas-new-creative-breakdown-feature-what-you-need-to-know/))
  **[PRACTITIONER]**, and that flexible format was itself removed from ad setup from
  **March 2026** ([Campaign Builder](https://www.campaignbuilder.io/blogs/meta-flexible-ads-removed-2026))
  **[PRACTITIONER — unverified against any Meta source]**.
- **Multiple text optimization** (up to 5 variations each of primary text, headline,
  description on a single image) is the Ads Manager surface that produces the text assets
  this map cares about; Meta's stated review path is the "By dynamic creative element"
  breakdown ([Meta Business Help Center 2579898108796785](https://www.facebook.com/business/help/2579898108796785))
  **[META-SNIPPET]**.

**Reported instability worth flagging.** Practitioners report the dynamic-creative-element
breakdowns have been buggy since Meta signalled dynamic creative was going away — "Nothing
happens when selecting the breakdowns by Image, Video, and Slideshow"
([Jon Loomer](https://www.jonloomer.com/qvt/breakdowns-in-ads-manager-not-working/))
**[PRACTITIONER, snippet only]**. Dynamic creative was reportedly discontinued for Sales
and App Promotion objectives in June 2024 in favour of Flexible Ad Format
([madgicx](https://madgicx.com/blog/flexible-ads-are-replacing-dynamic-creatives))
**[PRACTITIONER]** — note it remains documented as available for `OUTCOME_ENGAGEMENT`
in the current API reference (§3e), which is the objective that matters here, but the
direction of travel is away from this construct. **Any read-back loop built on
`body_asset` is being built on a surface Meta is visibly deprecating.**

---

## 6. The sanctioned way to actually test — and its unit is the AD

### 6a. The product: A/B testing (formerly "split test"), object `AdStudy`

"A/B testing" is the current name; "split test" survives only in the Marketing API and one
Advantage+ app article **[META-HELP]**. Creation surfaces: the A/B test button in the Ads
Manager toolbar, the **Experiments** tool, campaign creation, duplication, and prompts.
"All A/B tests use the same underlying technology… All of your test results will be
available in Experiments once the test has finished"
([help/1159714227408868](https://www.facebook.com/business/help/1159714227408868)) **[META-HELP]**.

**Testable variables (canonical list): Creative, Audience, Placements, Custom.** Creative =
"different ad images, text or creative types… managed at the ad level"
([en-GB help/1597318281091985](https://en-gb.facebook.com/business/help/1597318281091985)) **[META-HELP]**.
Note the en-US id for this page (`help/1962159924052051`) **404s to the help home** — the
canonical variable list is reachable only via the en-GB id. Note also that **delivery
optimization is not in that list**, though older API-guide prose includes it.

**Marketing API.** The object is `AdStudy`, created at `POST /{user_id}/ad_studies` or
`POST /{business_id}/ad_studies`. `type` enum: `LIFT, SPLIT_TEST, CONTINUOUS_LIFT_CONFIG,
GEO_LIFT, BACKEND_AB_TESTING, CREATIVE_SPEND_ENFORCEMENT, PORTFOLIO_OPTIMIZER,
VERSION_CONTROL`. Edges `cells` and `objectives` are **read-only**. Each cell must have at
least one `adaccounts` / `campaigns` / `adsets` object; `treatment_percentage` ≥ 10 per
cell, sum ≤ 100 ([AdStudy reference, v25.0](https://developers.facebook.com/docs/marketing-api/reference/ad-study/)) **[META-DOC, verified first-hand]**.

There is also a creative-specific **`SPLIT_TEST_V2`** in the split-testing guide, requiring
`creative_test_config` (`daily_budget` or `lifetime_budget_percentage`), `cooldown_start_time`,
`observation_end_time`, and **2–5 cells with exactly one `ads` id per cell**
([Split testing guide](https://developers.facebook.com/docs/marketing-api/guides/split-testing/)) **[META-DOC, verified first-hand]**.
Limits: 100 concurrent studies per advertiser, 150 cells per study, 100 ad entities per cell.

> ⚠️ **`SPLIT_TEST_V2` does not appear in the `AdStudy.type` enum** on the reference page.
> The guide and the reference contradict each other. Also, the **`AdStudyObjective` and
> `AdStudyCell` node reference pages 404** (all URL forms tried), so those node schemas are
> effectively undocumented today even though the live edges return them.

**This is the load-bearing structural fact for the map:** a creative test cell holds
**exactly one ad id**. Meta's own sanctioned creative test has **the ad as its unit** —
there is no cell type that holds a text asset. Combined with §1, that closes the question:
**nothing in Meta's sanctioned testing apparatus can randomise at the level of a produced
copy row.**

### 6b. What must be held constant, and how the split is made

- Held constant: "You'll have more conclusive results… if your ad sets are **identical
  except for the variable that you're testing**." The test audience "shouldn't be used for
  any other campaign… Overlapping audiences may result in delivery problems and contaminate
  test results" ([help/290009911394576](https://www.facebook.com/business/help/290009911394576)) **[META-HELP]**.
- **The split is person-based, not impression-based:** "your audience is **randomised and
  split into separate groups so that nobody sees more than one version**"; methodology
  described as "random, non-overlapping groups"
  ([help/1915029282150425](https://www.facebook.com/business/help/1915029282150425)) **[META-HELP]**.
  Also "We show each version to a segment of your audience and **ensure that nobody sees
  both**" ([help/1738164643098669](https://www.facebook.com/business/help/1738164643098669)) **[META-HELP]**.
- **Duration — two conflicting first-party numbers, both live.** Help Center: "we recommend
  a **minimum of 7-day tests**. A/B tests can only be run for a **maximum of 30 days**"
  ([help/290009911394576](https://www.facebook.com/business/help/290009911394576)). Meta for
  Business: "All ad versions should run for the full test duration (**at least two weeks**)
  or until a winner is declared" ([measurement/ab-testing](https://www.facebook.com/business/measurement/ab-testing)).
  **[META-HELP — flagged conflict]**
- **Budget: no number.** "Your A/B test should have a budget that will produce enough
  results to confidently determine a winning strategy"; "We recommend using the **same
  budget for both versions**" **[META-HELP]**.
- **Power and confidence thresholds are stated, and they are low for A/B:**
  "We typically suggest that tests have an **estimated power of 80 per cent or higher**";
  "For lift tests, a **90 per cent or higher** confidence percentage represents a
  statistically reliable result. **For A/B tests, a 65 per cent or higher confidence
  percentage represents a winning result**"
  ([help/239549606692303](https://www.facebook.com/business/help/239549606692303)) **[META-HELP]**.
  Winner mechanics: "Meta **simulates possible outcomes tens of thousands of times**"
  ([help/166313650471318](https://www.facebook.com/business/help/166313650471318)) — note that
  page's title: *how winning campaigns are determined in A/B tests **without a holdout***.
  Comparison basis is **cost per result**; up to **five versions**.
- Experiments restriction: "You **can't use any campaigns that are already in another test**
  or any campaigns using the **reservation buying type**"
  ([help/3506622486044209](https://www.facebook.com/business/help/3506622486044209)) **[META-HELP]**.

### 6c. Learning phase — and why adding a creative is not free

- "ad sets exit the learning phase as soon as they can deliver stably. This usually occurs
  after **about 50 results in the week after the ad set's last significant edit**"
  ([help/112167992830700](https://www.facebook.com/business/help/112167992830700)) **[META-HELP]**.
  Note Meta says **"results"**, not "conversions" — for a messaging ad set the result is the
  messaging optimization event, so the 50 threshold reads as ~50 conversations started per
  ad set per week.
- Same page, best practices: "**Avoid high ad volumes. When you create many ads and ad sets,
  the delivery system learns less about each ad and ad set.**" **[META-HELP]**
- Learning-limited: an ad set is learning limited when "unlikely to receive about 50
  optimisation events in the week after your last significant edit"; listed causes include
  "**running too many ads at the same time**"
  ([help/269269737396981](https://www.facebook.com/business/help/269269737396981)) **[META-HELP]**.
- **Significant edits that reset learning** include: any targeting change; **any change to
  ad creative**; any change to the optimization event; **adding a new ad to the ad set**;
  pausing ≥7 days; changing bid strategy. Budget changes are magnitude-dependent
  ("USD 100 → USD 101" no; "USD 100 → USD 1,000" likely yes)
  ([help/316478108955072](https://www.facebook.com/business/help/316478108955072)) **[META-HELP]**.

**The interaction this map needs:** *adding a creative to a live ad set is itself a learning
reset.* So an iterate-and-add read-back loop pays a delivery cost every cycle. Meta's own
escape hatch is the in-campaign creative test, explicitly designed so "high-performing ads
can continue to run after the test **with delivery system learnings retained**"
([help/1423851372208214](https://www.facebook.com/business/help/1423851372208214)) **[META-HELP]**.

### 6d. Creatives per ad set / spend per creative — the "3–5" rule is confirmed absent

**There is no first-party "3–5 creatives per ad set" number.** Meta states no number
anywhere found, and in one dated newsroom post argues explicitly against fixing one. This
independently reconfirms the canon sweep's finding.

What Meta *does* say:

- Directional, not numeric: "**Decrease ads per ad set, but maintain diverse creative assets
  per ad set. One ad can contain multiple (up to ten) creative assets.**"
  ([help/2720085414702598](https://www.facebook.com/business/help/2720085414702598)) **[META-HELP]**.
  ⚠️ That same page still advises "If testing multiple creative variants, use dynamic
  creative" while carrying its own banner that dynamic creative was withdrawn for sales/app
  objectives from June 2024 — **a live page contradicting itself**.
- Explicit anti-number, and **dated**: "**instead of producing a fixed volume of ad creatives
  per campaign and refining them**, consider building a broad portfolio of assets…"
  — [Demystifying creative diversification, Meta newsroom, **2025-12-16**](https://www.facebook.com/business/news/demystifying-creative-diversification) **[META-HELP, dated]**.
  Same post: Meta's system "**groups together ads that share key visual and thematic
  attributes… learnings and delivery optimizations are shared at the creative level – not
  just the individual ad level**", and draws a hard line between *creative iteration*
  ("manual A/B testing to refine assets… should not replace true creative diversification")
  and *creative diversification* (distinct assets per persona/use case). **This is Meta's own
  version of the iteration-vs-diversification distinction the canon sweep already recorded.**
- The only hard ceilings are **per Page, not per ad set**: 250 / 1,000 / 5,000 / 20,000
  active-or-in-review ads by spend tier
  ([help/766697140509126](https://www.facebook.com/business/help/766697140509126)) **[META-HELP]**.
- **Spend per creative:** the single first-party number is the creative-test budget cap —
  "We suggest using **no more than 20% of your existing budget**… We'll aim to spend that
  amount per day on test ads"; make **2 to 5 copies**; not supported on bid-cap campaigns
  ([help/1423851372208214](https://www.facebook.com/business/help/1423851372208214)) **[META-HELP]**.
  Nothing else.
- ⚠️ **[PRACTITIONER]** Every "3–5 creatives per ad set" and "$X per creative before judging
  it" figure encountered came from agency/tool SEO blogs (cometly, lseo, benly, adlibrary,
  modernmarketinginstitute — all 2026-dated). The nearest number in Meta's own channel is an
  **advertiser testimonial**, not guidance: "ramping from 3-4 new creatives a week to almost
  50 on average" — Ben Paster, Dribbleup, in
  [The creative advantage / Andromeda, **2025-04-22**](https://www.facebook.com/business/news/the-creative-advantage-unlocking-the-power-of-diversification-with-meta-andromeda) **[META-HELP, dated, but it is a customer quote]**.

### 6e. Messaging specifically — A/B test yes, incrementality no

- **A/B testing is not objective-gated on paper:** "A/B testing is **available to all Meta
  advertisers globally**" **[META-HELP]**. The winner is decided on **cost per result** for
  the chosen key metric, and for a click-to-Messenger ad set that metric is **"Cost per
  messaging conversation started"** ([help/200322347047101](https://www.facebook.com/business/help/200322347047101)) **[META-HELP]**.
  So a messaging A/B test is mechanically well-defined.
- ⚠️ **Meta's docs are SILENT on messaging eligibility.** No Help Center article enumerates
  which objectives are eligible for A/B tests. This is **absence of a prohibition, not a
  stated permission.**
- **Advantage+ is a legitimate A/B test *cell*, not an exclusion.** "This could include
  testing one different setting… such as **using an Advantage+ shopping campaign versus a
  manual campaign**" ([measurement/ab-testing](https://www.facebook.com/business/measurement/ab-testing));
  "we suggest **first setting up a split test** to properly A/B test a constrained setup and
  Advantage+ on" ([help/711378409718185](https://www.facebook.com/business/help/711378409718185));
  "Meta recommends **A/B testing with Advantage+ audience for almost all campaign types,
  except retargeting campaigns**" ([help/273363992030035](https://www.facebook.com/business/help/273363992030035)) **[META-HELP]**.
  **No first-party statement was found saying Advantage+ campaigns cannot be split-tested.**
- **Holdouts and lift tests: this advertiser does not qualify.**
  - **Withdrawn:** "**Holdout tests in the Experiments tool are no longer permitted as of 26
    April 2021**" ([help/2053923394930992](https://www.facebook.com/business/help/2053923394930992)) **[META-HELP, dated]**.
    The separate "About holdout tests in Test and Learn" page now redirects to the help home
    — dead.
  - **Conversion Lift** requires a campaign in the past year with **≥ USD 5,000 spend** and
    **≥ 500 conversions**, plus a supported conversion source: **Meta pixel, Conversions API,
    mobile app events via SDK, offline uploads**
    ([help/221353413010930](https://www.facebook.com/business/help/221353413010930)) **[META-HELP]**.
    **Messaging conversations started is not among them.** The API guide agrees — the only
    lift objective type is `CONVERSIONS`, and eligible events are all `fb_pixel_*` /
    `fb_mobile_*` ([lift studies guide](https://developers.facebook.com/docs/marketing-api/guides/lift-studies)) **[META-DOC]**.
  - **Brand Lift** requires "a minimum of **USD 120,000** in ad spend in the last 90 days"
    ([help/1915029282150425](https://www.facebook.com/business/help/1915029282150425)) **[META-HELP]**.

  **Net: for a Messenger-conversation advertiser, the A/B test is the only Meta-sanctioned
  randomised instrument available.** The incrementality products are gated behind conversion
  signal types this funnel does not produce. (Whether CAPI for Business Messaging events
  — §4, §7e — would satisfy Conversion Lift's source requirement is **not stated anywhere
  first-party**; the eligible-source list does not include them. Open question.)

### 6f. Other creative-reporting surfaces Meta offers

- **Ad creative breakdown in Ads Reporting** — breakdown by ad creative with results, reach,
  impressions, cost per result, spend, combinable with other breakdowns. Two caveats in
  Meta's own words: "We are gradually introducing this experience so it may not be available
  to you yet", and — decisive here — **"Ad creative-level data currently does not include
  results for dynamic creative ads"**; data only from 1 July 2017
  ([help/243916866413404](https://www.facebook.com/business/help/243916866413404)) **[META-HELP]**.
  **So the newer, richer creative reporting and dynamic creative are mutually exclusive.**
- **Creative insights** — real but still in test: "We're **beginning to test creative
  insights**… to help diagnose and address both creative fatigue and similarity… exploring
  nearly **150 different themes**"
  ([Demystifying creative diversification, 2025-12-16](https://www.facebook.com/business/news/demystifying-creative-diversification)) **[META-HELP, dated]**.
- **Creative fatigue / creative limited statuses** — `Creative limited` when cost per result
  exceeds past ads but is under 2×; `Creative fatigue` at ≥2×. "This feature is **only
  available for ad sets with one creative**", excluding Advantage+ catalogue, dynamic
  creative, and Advantage+ app campaigns
  ([help/1346816142327858](https://www.facebook.com/business/help/1346816142327858)) **[META-HELP]**.
  Another surface dynamic creative is excluded from.

## 7. Advantage+ — a default, not a choice; and it is the wrong name for what this account runs

### 7a. "Advantage+ campaign" is now a computed state, and messaging is not in it

The single most consequential correction on this page. In the current Marketing API,
Advantage+ is **not a campaign type you select** — it is a read-only field
`advantage_state` on the campaign, derived from three levers (Advantage+ budget, Advantage+
audience, Advantage+ placements). With all three enabled the state becomes
`ADVANTAGE_PLUS_SALES`, `ADVANTAGE_PLUS_APP`, or `ADVANTAGE_PLUS_LEADS`; otherwise
`DISABLED` ([Advantage+ campaigns, Marketing API](https://developers.facebook.com/docs/marketing-api/advantage-campaigns), undated page describing v25/v26) **[META-DOC]**.

**There is no `ADVANTAGE_PLUS_ENGAGEMENT` and no `ADVANTAGE_PLUS_MESSAGES`.**
`OUTCOME_ENGAGEMENT` — the objective click-to-Messenger campaigns normally run under —
has no Advantage+ state at all. Evidence by omission from a first-party enum, but the
omission is unambiguous.

So the framing "this account runs Advantage+" is imprecise. It cannot be running an
Advantage+ *campaign*. It is running **Advantage+ audience + Advantage+ placements +
Advantage+ creative** on an Engagement (or Leads) campaign. Those component features do
apply to messaging campaigns; the campaign-level product does not.

The legacy standalone products were sunset on a dated first-party schedule: from
**v24.0 (2025-10-08)**, "creation, duplication, and updates to Advantage+ shopping campaigns
and Advantage+ app campaigns will no longer be allowed"
([Graph API v24.0 changelog](https://developers.facebook.com/docs/graph-api/changelog/version24.0/)) **[META-DOC]**.
The **2025-02-06** rename of Advantage+ shopping → **Advantage+ sales**, the addition of
Advantage+ **leads**, and the "Advantage+ on" label are well corroborated by trade press
([Social Media Today, 2025-02-06](https://www.socialmediatoday.com/news/meta-advantage-plus-ad-updates-february-2025/739472/),
[Search Engine Land, 2025-02-07](https://searchengineland.com/meta-advantage-campaign-setup-leads-campaigns-451713))
**[PRACTITIONER/press — Meta's own newsroom post was not reachable]**.

### 7b. Default-on, with a four-screen opt-out — and the placement opt-out is leaky

**[META-SNIPPET]**, from Help Center pages read via extraction proxy:

- *About Advantage+ audience*: "For new campaigns, Advantage+ audience is automatically
  applied if it's available." Opt-out is "Switch to original audience options."
  ([help/273363992030035](https://www.facebook.com/business/help/273363992030035))
- *Choose audience settings*: for sales/app/leads "Advantage+ on" is the default and
  "most settings are suggestions"; manual control is the "Further limit the reach of your
  ads" checkbox ([help/25941857932125812](https://www.facebook.com/business/help/25941857932125812)).
- *What turns Advantage+ on and off*: it turns **off** if you run multiple ad sets on
  ad-set budgets, further limit reach outside the suggestion box, or exclude placements
  ([help/906206294602874](https://www.facebook.com/business/help/906206294602874)).

Turning Advantage+ off therefore takes four separate deliberate acts (audience,
placements, budget level, per-feature creative toggles — the master creative toggle was
removed in Marketing API **v22.0, launched 2025-01-21**, replaced by
`degrees_of_freedom_spec` → `creative_features_spec` with individual features
`image_template`, `image_touchups`, `text_optimizations`, `inline_comment`,
`video_auto_crop` **[META-DOC]**).

**And the placement opt-out is deliberately incomplete.** Meta auto-enrols eligible
advertisers into "limited spend on excluded placements" — roughly 5% of budget **per
excluded placement** — framed as a 7.7% cost-per-result improvement, with **Engagement
listed among the eligible objectives**
([help/1462437878221374](https://www.facebook.com/business/help/1462437878221374)) **[META-SNIPPET]**.
The only hard block reported is account-level Advertising Settings → Placement Controls
([TheOptimizer, 2026-06-06](https://theoptimizer.io/blog/meta-ads-placement-control-in-2026-how-to-actually-block-placements-its-not-as-simple-anymore)) **[PRACTITIONER]**.

**Verdict on the ticket's question:** Advantage+ is a **default**. Not running it is the
deliberate act.

### 7c. What is given up in measurability — Meta's side and the practitioners' side

**Meta never states that Advantage+ costs you reporting granularity.** There is no
"limitations" page. Meta's framing is uniformly upside (14.8% / 9.7% / 7.2% lower cost per
result by objective family for Advantage+ audience; 7.7% for limited spend) **[META-SNIPPET]**.
The nearest things to a concession are: "most settings are suggestions"; the existence of a
*What turns Advantage+ off* page at all; the excluded-placement 5%; and the Creative
breakdown's explicit exclusion of dynamic creative ads.

**What is concretely unavailable to this account:**

- **No audience-segment attribution of any kind.** The new-vs-existing-customer
  ("Audience Segments") breakdown is **Sales-objective only**; non-Sales campaigns report
  "Uncategorized" ([Jon Loomer, *A Guide to Audience Segments*, pub. 2024-08-05, screenshots updated Jan 2025](https://www.jonloomer.com/audience-segments/)) **[PRACTITIONER]**.
  A click-to-Messenger campaign is not a Sales campaign. The one Advantage+ transparency
  feature most often cited does not exist here.
- **No reporting dimension at all for which expanded audience Advantage+ audience found.**
  Meta's docs are **silent** — not restrictive; the dimension simply does not exist.
- **Per-placement breakdown survives** (Ad set → Breakdown → By Delivery → Placement);
  Advantage+ placements does not remove it **[PRACTITIONER, no Meta page found withdrawing it]**.

**The practitioner critique, reported not resolved.** Agencies have argued since ASC that
Advantage+ returns "next to no data or insights" on which creative elements performed and
on audience composition ([AdExchanger, 2022-12-19](https://www.adexchanger.com/commerce/more-performance-less-transparency-inside-metas-advantage-shopping-black-box/)) **[PRACTITIONER — and pre-consolidation, so partly stale]**.
The most careful practitioner source is **not** an Advantage+ critic: Jon Loomer
([2025-06-23](https://www.jonloomer.com/advantage-plus-campaign/)) documents that the
controls all still exist and recommends treating Advantage+ *dis*engagement as exceptional,
justified only by concrete segment-level evidence of algorithmic weakness — which is
circular, since segment-level evidence is exactly what Advantage+ reporting lacks. He also
records that the July-2025 Creative breakdown "did not" solve the individual-creative-data
complaint ([83 Changes to Meta Advertising in 2025](https://www.jonloomer.com/meta-advertising-changes-2025/)) **[PRACTITIONER]**.

The disagreement is genuinely open: Meta's claim is that the opt-outs exist and the
efficiency is measured; the practitioners do not mostly dispute the efficiency, they
dispute that an advertiser can **verify** it from the platform, because the diagnostic
dimensions are absent.

### 7d. Withdrawn rules found in this sweep — do not repeat them

- **The existing-customer budget cap is gone** (removed Feb 2025). Guides still telling you
  to cap existing customers at 10–25% are stale
  ([Jon Loomer, 83 Changes in 2025](https://www.jonloomer.com/meta-advertising-changes-2025/)) **[PRACTITIONER]**.
- **"Meta consolidated all attribution to 1-day click" is probably false.** The
  better-corroborated account is that **7-day view and 28-day view** were removed
  **2026-01-12** and **7-day click remains**, with a March 2026 change narrowing
  click-through to actual link clicks
  ([jetfuel.agency](https://jetfuel.agency/meta-ads-attribution-settings-2026/),
  [dataslayer](https://www.dataslayer.ai/blog/meta-ads-attribution-window-removed-january-2026)) **[PRACTITIONER, no first-party page retrieved — treat as unresolved]**.
- **"Dynamic creative no longer exists"** is true of Ads Manager and **false of the API**
  (§3e). The in-product message "Dynamic creative is no longer available. Instead, you can
  select the Flexible ad format during ad creation" was captured
  [2024-06-11](https://www.jonloomer.com/qvt/dynamic-creative-is-going-away/) **[PRACTITIONER]**;
  the API reference still documents `is_dynamic_creative` with no deprecation notice
  **[META-DOC]**.
- **"Flexible format removed March 2026, folded into Advantage+ creative as a Flexible
  media toggle"** rests on a single undated practitioner page
  ([prooflytics](https://prooflytics.io/blog/meta-ads-flexible-format-deprecated-2026)) **[PRACTITIONER — weakly sourced, verify in the account]**.

### 7e. The measurement failure mode specific to a consultant funnel

Optimizing on "messaging conversations started" means the delivery system scales
**conversation volume**, not conversation **quality** — Meta natively cannot see which
conversations became customers, so campaigns producing many low-intent conversations
outcompete campaigns producing fewer high-intent ones
([respond.io](https://respond.io/blog/facebook-messenger-marketing),
[TheOptimizer](https://theoptimizer.io/blog/how-meta-ads-attribution-actually-works-in-2026)) **[PRACTITIONER]**.
Advantage+ audience amplifies this because it expands reach against that same signal.

This is not an Advantage+ defect; it is an **optimization-event** defect. And the
first-party fix exists: **Conversions API for Business Messaging** (§4), live for
Messenger and WhatsApp since **June 2024** **[META-DOC for the API surface; June-2024 launch date is [PRACTITIONER/partner-blog sourced](https://whatsappbusiness.com/blog/conversions-api-messaging/)]**.
Feeding `QualifiedLead` / `Purchase` back is what would move optimization from "people who
message" to "people who enrol" — but note again (§4) that it **still does not restore
asset-level attribution**; it improves what the *ad* is optimised toward.


---

## 8. Where Meta is silent, stale, or contradicting itself

Listed because the ticket asks for it explicitly, and because each one is a place a
confident-sounding "Meta rule" could be folklore.

**Silences (no first-party statement exists either way):**

1. **No dates anywhere.** Zero publication or last-updated stamps on any Help Center page
   or Marketing API reference page. Nothing on this page can be checked for quiet withdrawal
   except by re-reading it later.
2. **No objective-eligibility list for A/B tests.** Messaging is neither blessed nor barred.
3. **No number for creatives per ad set**, and no spend-per-creative threshold outside the
   creative test's 20%-of-budget cap.
4. **No statement that messaging action types survive an asset breakdown** (§3b). Follows
   from two documented facts; not itself documented.
5. **No statement about whether `body_asset_id` is stable** for the same text across ads or
   over time.
6. **No confirmation that `adlabels` on an asset are reportable** — the
   `AdAssetFeedSpecAssetLabel` node reference 404s.
7. **No documented aggregation / minimum-volume / privacy threshold** on asset breakdowns.
8. **No page enumerating what Advantage+ reporting withholds.** There is no limitations doc.
9. **No reporting dimension at all** for which expanded audience Advantage+ audience found
   (outside the Sales-only Audience Type split).
10. **No first-party page addressing Advantage+ and messaging destinations together.**
11. **Nothing** on how long a creative must run before it can be judged, or how the
    creative-level learning-sharing described in the Dec-2025 Andromeda post interacts with
    per-ad reporting.
12. **Not stated** whether CAPI-for-Business-Messaging events satisfy Conversion Lift's
    eligible-source requirement.

**Contradictions between two live Meta pages:**

13. **A/B test duration:** "minimum 7-day tests… maximum 30 days" (Help Center) vs "at least
    two weeks" (Meta for Business measurement page).
14. **`SPLIT_TEST_V2`** appears in the split-testing guide but **not** in the `AdStudy.type`
    enum on the reference page.
15. **Dynamic creative** is withdrawn in Ads Manager but fully documented, with no
    deprecation notice, in the current Marketing API reference (§3e, §7d).
16. The ad-volume Help Center page advises using dynamic creative while carrying its own
    banner saying dynamic creative was withdrawn for sales/app objectives in June 2024.

**Dead or withdrawn first-party pages found:**

17. `AdStudyObjective` and `AdStudyCell` node references — **404** (all URL forms).
18. en-US "Selecting a variable" (`help/1962159924052051`) — **404 → help home**; only the
    en-GB id resolves.
19. "About holdout tests in Test and Learn" — **redirects to help home**.
20. **Holdout tests in the Experiments tool: banned since 2021-04-26** (first-party, dated).
21. **Existing-customer budget cap: removed** (Feb 2025) — still repeated in 2026-dated
    guides.

---

## 9. Cheap probes that would close the remaining gaps

None of these are recommendations about doctrine; they are the specific unknowns above that
one live API call each would settle.

| # | Question | Probe |
|---|---|---|
| P1 | Do messaging action types survive an asset breakdown? | One Insights call: `breakdowns=body_asset&fields=actions&action_breakdowns=action_type` on a live click-to-Messenger dynamic-creative ad. Look for `onsite_conversion.messaging_conversation_started_*`. |
| P2 | Is `body_asset_id` stable for identical text? | Put the same body string in two different ads; compare returned ids. Repeat a week later for time-stability. |
| P3 | Are `adlabels` on an asset reportable? | Set `adlabels` on a body in `asset_feed_spec`; check whether the label surfaces in any breakdown or on the returned asset object. |
| P4 | Does the Messenger referral webhook carry the DCO-selected variant? | Run one dynamic-creative click-to-Messenger ad with visibly distinct headlines; inspect `ads_context_data.ad_title` across several referrals. **Highest value probe on this page** — if it varies, it is a per-conversation variant signal Meta's reporting does not otherwise offer. |
| P5 | Is dynamic creative still creatable for `OUTCOME_ENGAGEMENT` in this account today? | Attempt an ad-set create with `is_dynamic_creative=true` under the messaging setup; the API reference says yes (§3e), the UI has withdrawn the toggle. |
| P6 | Is Flexible format / Flexible media actually available for messaging in this account? | Check Ads Manager directly. The March-2026 removal claim rests on one undated practitioner page. |

---

## 10. Verdict, restated in one place

1. **A produced text asset CAN be joined to numbers** — `impressions`, `clicks`, `spend`,
   `reach`, `actions`, `action_values`, via `body_asset` / `title_asset` /
   `description_asset` breakdowns on the Ads Insights API **[META-DOC]**. A read-back loop
   on those five metrics is buildable.
2. **The join key is awkward.** No id exists at write time; Meta mints one at read time.
   Reconciliation must run on the exact text string, or possibly on `adlabels` (unverified).
   `url_tags` are useless because there is no landing page.
3. **The numbers are not causal.** Delivery is deliberately non-random; divergent delivery
   is documented by Meta's own research scientists, and is present even in Meta's sanctioned
   A/B test **[ACADEMIC]**. Meta declines to attach a confidence level to its own creative
   test **[META-HELP]**.
4. **Interactions are invisible.** No breakdown permutation combines two asset breakdowns,
   or an asset breakdown with any demographic or placement cut **[META-DOC]** — so the thing
   dynamic creative exists to exploit is the thing you cannot see.
5. **Nothing in Meta's sanctioned testing apparatus randomises below the ad.** Creative test
   cells hold "exactly one ad ID" **[META-DOC]**; A/B test variables are Creative / Audience /
   Placements / Custom, with Creative "managed at the ad level" **[META-HELP]**.
6. **For the outcome that actually matters here — a qualified Messenger conversation — the
   smallest attributable unit is THE AD.** The `messaging_referrals` webhook carries
   `ad_id` and an advertiser-set `ref`, and no asset identity **[META-DOC]**.
7. **Advantage+ is a default, not a choice** — and for a messaging advertiser "Advantage+
   campaign" does not exist at all (`advantage_state` has no engagement value)
   **[META-DOC, verified first-hand]**. What is running is Advantage+ audience / placements /
   creative on an Engagement campaign.
8. **The lever with the largest measurement effect is not Advantage+ on/off** — it is the
   optimization event. Optimizing on "conversations started" scales conversation volume;
   CAPI for Business Messaging exists to feed qualified/enrolled events back **[META-DOC]**.
   That changes what the *ad* is optimised toward. It does not restore asset-level
   attribution, and nothing does.
