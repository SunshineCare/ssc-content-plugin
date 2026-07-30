# Meta API probes — observed live, 2026-07-30

Account: `act_2474848802833161` ("ChildLife" — confirmed by the operator as **the Cambridge
account**; the ads promote page `519547008088094`, *Cambridge Diet: Giảm cân Thông minh từ Anh
quốc*). Graph **v24.0**, `FACEBOOK_SYSTEM_USER_ACCESS_TOKEN` from `content/.env`, system user
"Brand OS". All calls **read-only**. Window `last_90d` unless stated.

Not run, and why: **P2's write half** (put identical text in two new ads), **P5** (attempt an
ad-set create with `is_dynamic_creative=true`) and **P4** (run a live ad and watch referrals)
all require **creating ads or ad sets — real spend and outward-facing objects**. Not attempted
without explicit authorisation. P2 was answered instead from existing data as a natural
experiment; P6 needs Ads Manager UI. P4 remains open.

---

## P1 — Do messaging conversions survive an asset breakdown? **YES.**

This **overturns the documentation-derived verdict** in
[`meta-measurement.md`](./meta-measurement.md) / [ticket 18](../issues/18-meta-asset-reporting.md),
which concluded a text asset "can be counted but not attributed" and that the ad was the smallest
unit anything downstream could attach to.

Account-level, `level=ad`, `action_breakdowns=action_type`, over 90 days:

| Breakdown | Rows | Distinct asset ids | Rows carrying `messaging_conversation_started_7d` | Conversations attributed | `cost_per_action_type` returned |
|---|---|---|---|---|---|
| `body_asset` | 256 | 98 | 95 | **748** | yes |
| `title_asset` | 300 | 111 | 94 | 723 | yes |
| `description_asset` | 247 | 83 | 32 | 132 | yes |

Action types observed **per text asset** include the whole messaging funnel —
`onsite_conversion.messaging_conversation_started_7d`, `..._replied_7d`,
`messaging_first_reply`, `messaging_user_depth_2/3/5_message_send`,
`total_messaging_connection`, `messaging_welcome_message_view`, `messaging_block`,
`messaging_order_created_v2` — plus `onsite_conversion.lead`, `omni_purchase`, `link_click`,
`post_reaction` and video views.

**Why the docs read otherwise.** Meta's stated limit — asset breakdowns support only
`impressions`, `clicks`, `spend`, `reach`, `actions`, `action_values` — is *technically accurate
and practically misleading*: `actions` is on the permitted list, and with
`action_breakdowns=action_type` that single field carries every messaging conversion. What is
genuinely absent is only the *pre-computed* `results` / `cost_per_result` columns. And
`cost_per_action_type` **is** returned per asset, so cost per conversation started per copy line
is available directly, not merely derivable.

**Consequence**: copy-level outcome attribution is **available today**, at meaningful volume
(381,718 impressions across the sampled rows). The conditional in
[ticket 08](../issues/08-variation-mechanics.md) — "reopens partially if the probes find variant
identity" — has fired.

**What is still true and still limits it**: delivery is not randomised across assets (divergent
delivery), so these numbers are *observational, not causal*; and no breakdown combines two asset
breakdowns, so copy×headline interactions remain invisible. A batch remains coverage rather than
a controlled test — but its members can now be scored after the fact.

## P2 — Is `body_asset_id` stable for identical text? **NO — reconcile on text, not id.**

Answered from existing data rather than by creating ads. Over 90 days: **77 distinct body texts
→ 98 distinct asset ids**.

- **21 texts map to more than one id.** The same body string, run in different ads, is minted as
  different assets. So aggregating by id alone **splits one copy line across several rows** and
  understates it.
- **66 ids appear across more than one ad.** So an id is stable *within* the set of ads sharing
  a creative — it is not per-ad-unique.

**Practical rule for the loop**: aggregate by **exact text** (normalised), carrying the ids as
child keys. This confirms the reconciliation-by-text conclusion in ticket 18 and gives it a
measured reason rather than an inferred one.

## P3 — Are `adlabels` usable to tag an asset? **Not present; no evidence they are readable.**

The live `asset_feed_spec` on an active dynamic-creative ad exposes items with **`text` only**:

```
asset_feed_spec keys: [bodies, descriptions, titles, optimization_type]
bodies:       4 items, item keys: [text]
titles:       5 items, item keys: [text]
descriptions: 4 items, item keys: [text]
optimization_type: DEGREES_OF_FREEDOM
```

No `adlabels` on any item, and none surfaced on the read side. Setting one would require a write
(not attempted). Given P1 and P2, **the label path is unnecessary** — text is the join key and
the outcome metrics already arrive per asset.

## P4 — Does the referral webhook carry the DCO-selected variant? **STILL OPEN.**

Requires inspecting live `messaging_referrals` payloads, which needs webhook access and real
inbound conversations rather than an API read. **However, P1 makes it far less important**: it
was the highest-value probe only because asset-level outcomes were believed unavailable. They
are available, so per-conversation variant identity is now a refinement, not the thing the loop
depends on.

## P5 / P6 — Not attempted

`is_dynamic_creative=true` creatability (P5) needs an ad-set create; Flexible-format availability
(P6) needs Ads Manager. Neither blocks the loop: **dynamic creative is demonstrably running in
this account today** (multiple live ads carry `asset_feed_spec` with
`optimization_type: DEGREES_OF_FREEDOM`), which answers the practical form of P5 without a write.

---

## Two incidental observations worth carrying

**1. The account's best-delivering copy already uses the doctrine's permitted frames.** The two
highest-impression body assets (26,765 and 24,239 impressions) are:

> *"Mình đã giảm cân bằng nhiều cách rồi. Lần nào cũng thất bại. Lần này có khác gì không?"*

— first-person failed-journey, and

> *"Chồng hỏi 'cái này có đáng tin không?' - bạn cần câu trả lời, không cần thêm lời hứa."*

— reported third-party dialogue. Both assert nothing about the reader's body; both are already
inside [ticket 14](../issues/14-opening-beat-policy.md)'s four frames. The doctrine is codifying
something the account's own best copy already does, which is the easiest kind of doctrine to
adopt.

**2. One ad in the sampled set is `DISAPPROVED`.** Not investigated here, but it means platform
rejection is a live event in this account and the floor's compliance checks have a real cost to
prevent. Worth a look independent of this map.

**Data-quality note**: `spend` is in VND and the sampled rows include a 50-VND / 1-impression ad,
so per-asset cost figures are unusable at the low-volume tail. Any threshold in the loop needs a
minimum-volume floor before a cost-per figure is quoted — which is exactly what the honesty
fields in `get_term_performance` already model.
