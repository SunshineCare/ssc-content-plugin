---
name: ssc-ads-measure
description: Runs the Measure step of the standalone Cambridge Diet Vietnam Ads pipeline — the CONVERSION LENS. Covers the `paid_only` (dark post) and `boosted` classes only; `organic_only` content never appears here (that is ssc-post-measure's engagement lens). Reads this plan's ACTUAL ingested ad performance (get_ad_performance) — the source for paid_only metrics, since a dark post has no page row and get_post_performance's paid_only count is structurally always 0 — and grades each ad-set/campaign group BY TIER on its locked KPI — cost-per-purchase for the conversion tiers L1 (cold) + L3 (warm/retarget), and CPM + delivery volume/continuity for L2 omnipresence (never cost-per-purchase, and NEVER a frequency: the ad surface emits `reach_day_sum`, a day-sum of a non-additive metric, so frequency is DECLARED UNAVAILABLE rather than fabricated from it) — reading the live per-tier thresholds from ad/strategy + ad/campaign-architecture. Tier is the angle's declared `target_layer` (tagged once by the Brief step) — read authoritatively via get_brief when the group resolves to a specific brief, or off the ad-set/campaign's deployment-time name otherwise; there is no `ad_plan_slots` link (the ad-set/media buy left the creative pipeline — it's a dashboard/ops concern now). Synthesises a retrospective organized by ANGLE (persona × route) — tier grades + winning vs fatigued angles, and, where a group resolves to a specific brief, winning vs fatigued proof points, copy lengths, and formats via get_idea + list_content — writes it to channel_plans.retrospective via save_channel_plan, AND persists the paid-ads section (ad_campaign_health) plus its block of the shared per-period digest via save_performance_analysis, so the digest every later phase reads is no longer empty. Boosted ads are EXCLUDED from tier grading — `get_ad_performance` carries each group's `class` + `class_counts` + `by_class` (the same metrics split per class), so tier grades are computed on `by_class.paid_only` only and a boost's spend never rides inside a tier it never declared. Boosted page posts are graded as their OWN boost class on cost-per-result + engagement rate with NO tier assigned — a boost usually has no brief, so it has no declared target_layer and defaulting it to L2 would fabricate a declared value. Records "no prior ad performance this cycle" gracefully when none has been ingested, and reports the documented degraded states (unpopulated ad-story linkage, a boost placed outside Brand OS with no ad row) plainly rather than fabricating. Propose-only; no gate. Next month's Focus is this retrospective's sole reader — it carries winning persona × route angles forward into the coverage target and drops fatigued ones (the writer no longer reads it directly; its influence flows through Focus).
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_ad_performance, get_performance_range, get_post_performance, get_performance_analysis, get_knowledge, get_channel_plan, save_channel_plan, save_performance_analysis, get_idea, get_brief, list_content]
---

# Ads Measure (`ssc-ads-measure`)

You run the **Measure** step of the standalone Cambridge Diet Vietnam Ads pipeline. You read the **actual ingested ad performance** from `get_ad_performance`, **grade each ad-set/campaign group by its TIER on the tier's correct KPI** (a hard rule — see below), then translate that into learnings organized by **ANGLE — persona × route** (the unit the Brief step now fans out on), and write a **retrospective** onto the ad `channel_plan` via `save_channel_plan(channel='ad', period, retrospective=…)`. The retrospective is markdown prose — which angles worked (carry forward), which fatigued or ran inefficiently (drop or refresh), and what to try next. There is no `ad_plan_slots` link anymore: the ad-set / media buy left the creative pipeline entirely (it's a dashboard/ops concern), so **tier comes from the angle's declared `target_layer`** — read authoritatively off the brief (`get_brief`) when a group resolves to one, or off the group's own deployment-time name otherwise. You then persist the same findings into the **shared per-period digest** (`performance_analyses`) via `save_performance_analysis` — you own its `ad_campaign_health` section, and one named block of its `summary` — which is what `ssc-post-research`, `ssc-strategy-directions` and `ssc-strategy-performance-retrospective` actually read. **Next month's `ssc-ads-focus` is the retrospective's sole reader** — `ssc-ads-writer` does not read it directly; its influence flows through Focus's next coverage target (`creative_target`). You only read performance and write those two artifacts; you NEVER hand-author RAW performance rows, trigger ingestion (`pull_*`), call `approve` (any entity), use `edit` to demote/unapprove a row, or produce new content.

**KPI is TIER-SPECIFIC — never grade every ad-set on the same metric (hard rule, sourced from `ad/strategy` §"Hệ Thống KPI" + `ad/campaign-architecture`):**

- **Cost-per-Purchase (spend ÷ purchases) is the #1 business KPI — but it applies ONLY to the conversion tiers, L1 (cold) and L3 (warm/retarget).** Cost-per-message is an intermediate operational metric, NOT the verdict.
- **L2 (Awareness / Omnipresence) is graded on CPM + delivery volume and continuity + contribution to the warm pool — NEVER on cost-per-purchase.** An L2 set producing large delivery and ~0 purchases is the CORRECT role; grading L2 on cost-per-purchase "phạt oan" (wrongly penalises) and kills the funnel-nurture tier. This is the single most important rule of this step.
- **FREQUENCY IS NOT COMPUTABLE FROM THIS SURFACE AND MUST NEVER BE FABRICATED (hard rule).** The ad reads no longer emit `reach`; they emit **`reach_day_sum`**, the SUM of each day's unique reach across every delivering day. Unique reach is **not additive** — a person reached on ten days is counted ten times — so `impressions ÷ reach_day_sum` is not a frequency: it understates the real one by roughly the number of delivering days, turning a genuine 4.0 (audience being burned) into ≈1.2 (reads healthy). **Never divide by `reach_day_sum`, never present it as people reached, and never report a frequency number of any kind.** When the L2 rubric calls for a frequency, say plainly **"tần suất không khả dụng — dữ liệu chỉ có tổng tiếp cận cộng dồn theo ngày, không khử trùng lặp theo người"** and grade L2 on what IS measurable (CPM, delivery volume, delivery continuity). An explicit gap is the correct output; a plausible-looking wrong number is the defect this rule exists to prevent.

## The conversion lens — what it covers and how it grades (hard rules)

Objective is a property of the **lens**, not of the content. Ads exist to convert; posts exist to earn engagement. You own the **conversion lens** only. `ssc-post-measure` owns the separate **engagement lens**. Three rules bind you, on top of the tier-KPI rule above:

**1. Class scope — you cover `paid_only` + `boosted`, and NOTHING else.**

| Class | In the conversion lens? | Graded as |
|---|---|---|
| `paid_only` (dark post) | ✅ **yes** | Its declared **tier's** locked KPI — L1/L3 on cost-per-purchase, **L2 on CPM + delivery volume/continuity** with frequency declared unavailable (see the rule above). |
| `boosted` | ✅ **yes** | Its **own boost class** — cost-per-result + engagement rate. **NO tier is assigned.** |
| `organic_only` | ❌ **EXCLUDED** | Has no conversion job and no spend. It never appears in this lens — not as a grade, not as context. It belongs to `ssc-post-measure`. |
| `unknown` | ❌ not graded | Report as undetermined, cite the reason; never grade it as if its class were known. |

**`class` is the ONLY authority** for a page post's class. There is a legacy `is_boosted` column — it is always null, it is stale, and it can disagree with `class`. **Never read `is_boosted`.**

**2. `paid_only` metrics come from the AD side — never from a page-post count.**
A dark post has **no page row** (ads this system builds use `object_story_spec`, so the post never appears on the page's posts edge — 272 of 315 live story ids are exactly this). Consequently `get_post_performance`'s `classification.counts.paid_only` is **structurally always 0**, and that zero is meaningless: it does not mean there were no dark posts. **Your source for `paid_only` is `get_ad_performance`** — the ingested per-ad-set/campaign paid metrics in Step 1. Never source a paid_only figure from the page-post read, and never report "no paid-only content" off that structural 0.

**3. A boost gets NO tier — it is its own class.**
Tier comes from the angle's declared `target_layer`, resolved via `get_brief`. **A boost usually has no brief at all** — it starts as a page post someone put money behind, often straight from the page or Ads Manager: no `angle_label`, no persona × route, frequently an ad-set name encoding nothing. So:

- Grade a boost on **cost-per-result** (cost-per-purchase where purchases exist, else cost-per-message / cost-per-conversion — name which one you used) **plus its engagement rate** from the page side.
- **NEVER default a boost to L2, or to any tier.** Asserting a tier the operator never declared fabricates a declared value. A boost with no brief is reported as **boost class, tier not declared** — say so explicitly rather than filling the gap.
- Do not leave boosts ungraded either. Inferring a tier from the ad-set name and otherwise dropping the boost from the report loses exactly the signal this lens exists to surface. Boost class is the grade.
- If a boost genuinely *does* resolve to a brief with a declared `target_layer`, you may cite that tier as declared context — but the grade stays the boost-class grade, not a tier grade.

**4. Boosted ads are EXCLUDED from tier grading — on the ad read too, not just the page read.**
Brand OS imports every ad in the account, so a boost's ads sit **inside** ordinary ad-set/campaign groups on `get_ad_performance`. If you grade a group on its blended totals, a boost's spend lands inside a tier grade it never declared **and** is graded again as boost class — the same money counted twice, and a tier fabricated (rule 3). So:

- **Tier grades are computed on `by_class.paid_only` only.** A group whose `class` is `paid_only` may be graded on its top-level totals (they are identical). A `mixed` group is graded on `by_class.paid_only`, and you say so. A group whose `class` is `boosted` is **never tier-graded at all** — it is not an L2 set that happens to hold a boost, it is boost spend inside a set with a tier-ish name.
- **The boost-class grade is computed ONCE, from TWO sources, and the boost unit is the POST — not the ad set.** The page read (Step 1d) identifies the boost and supplies its **engagement** half (`engagement_rate`) and its `ad_ids`. The **money** half comes from the cycle-bounded per-ad read (Step 1e), joined on those `ad_ids`. **`ad_metrics` on the page read contributes NO number to the grade** — it is now a SUM over every day its ads ever delivered (`get_post_performance` has no date-range input), so using it as a per-cycle cost-per-result numerator would charge a year of spend against one cycle. Cite it, if at all, as labelled lifetime context. `by_class.boosted` on the ad-set read exists so you can see and exclude that spend from the tier grade — never add it to a boost's grade, and never grade the same boost twice.
- **Boost spend whose post is NOT in the page read is graded from the AD read too, and the split is done PER AD.** The page read is capped at 100 rows ordered by publish time, while the ad read's classifier sees **every** page post, so a boost still spending on a post published long before the newest 100 never appears in Step 1d — inside a `boosted` **or** a `mixed` group. Such spend must not fall through both lenses. Step 1e's `level: 'ad'` read covers both cases from one source: an ad whose id appears in some Step-1d boosted row's `ad_ids` has an **engagement half** as well, and one that does not is **out of window** — graded on **cost-per-result only**, with the **engagement half declared unavailable** ("post ngoài phạm vi 100 bài mới nhất — không có tỷ lệ tương tác để chấm"). Because every boost's money comes from that one per-ad read, no boost can be counted twice and none can be missed. The group-level `by_class.boosted` block is an **upper bound**, not the grade: one ad-set group can span several boosted posts, so grading it wholesale double-counts. Use `by_class.boosted` as the figure only when the per-ad read is unavailable **and** none of that group's boosted ads appear in the page read. This applies to a `mixed` group exactly as to a `boosted` one — its `paid_only` half is still tier-graded on `by_class.paid_only`, and its `boosted` half is graded here, as boost class. It is still **never** a tier grade.
- **`organic_only` / `unknown` inside a group** — never tier-graded either. `organic_only` is **structurally impossible on this read** (organic-only content has no ad, so `class_counts.organic_only` is always 0) — never report that zero as a finding about organic content. `unknown` is undetermined coverage: report it as such, never as a tier.
- If `classification.authoritative` is `false`, read `classification.note` — it has **two different branches**, and they do not carry the same instruction:
  - **`linkage_populated` is `false`** (no ad carries a story id) ⇒ boosts cannot be told apart from dark posts and every group reports `paid_only`. Grade tiers as usual, but say the tier grades **may include undetected boost spend** this cycle — never present them as clean.
  - **linkage IS populated but `FACEBOOK_PAGE_ID` is unset** ⇒ story-id-carrying ads classify **`unknown`**, not `paid_only`. `unknown` is never tier-graded (see the row below), so those groups are reported as **undetermined coverage** — do NOT "grade tiers as usual" on them. Say plainly that classification was not authoritative this cycle because the page id was not configured.

**Engagement-rate caveat when you cite it on a boost.** The page-side rate is `engagement ÷ post_media_view`, and `post_media_view` is a **media-view count, NOT deduplicated by person**. Write it as interactions per N media views — never as "% of people who engaged" or a share of people reached. The boost's page metrics are the **unmodified page totals inclusive of paid delivery**; no organic/paid split of them exists (`impressions_organic` / `engagement_rate_organic` are permanently null), so never subtract, never estimate an organic remainder.

This is step 4 — the final step — of the Ads pipeline (**Focus → Approaches → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. **There is no gate** — the retrospective is propose-state output. It closes the loop: **next month's Focus reads this `retrospective`** to carry winning persona × route angles forward and drop fatigued ones. This is the retrospective's *only* consumer — `ssc-ads-writer` does not read it directly (by design): its influence flows through Focus's next `creative_target`, not a direct read.

## Inputs

- `period` — the plan month being measured, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the ingested ad performance (primary source)

This is your real source of truth — the ingested per-ad-set paid metrics for our own account:

```
Call: get_ad_performance
  level: adset
  window_days: 30
```

Returns aggregated paid performance grouped at the requested level (default `campaign`; use `adset` to read per-ad-set winners/losers, which map most directly to the L1/L2/L3 tiers — the angle's declared `target_layer`). Each group returns: `id` + `name` (the Brand OS ad-set/campaign/ad — a real Facebook object, not an `ad_plan_slots` row), `spend`, `impressions`, **`reach_day_sum`**, `clicks`, `ctr`, `conversions`, `purchases`, **`cost_per_purchase`** (server-computed = spend ÷ purchases — the locked KPI for L1/L3), `messaging_conversations`, `cost_per_message` (operational only), **`days_counted`** and **`date_range` (`{from, to}`, `YYYY-MM-DD` calendar days)**. The group's `name` is Step 2's tier/angle-attribution signal when no brief resolves directly — hold it. The tool reflects what has been **ingested** into Brand OS — it does NOT fetch live, and you never trigger ingestion (`pull_all_ad_performance`).

**Each stored row is ONE AD ON ONE DAY**, and the group figures are a SUM across the days in the window. Two consequences you must carry into every number you quote:

- **`reach_day_sum` is NOT `reach`.** It is the sum of each day's unique reach — the same person reached on several days counted once per day. Read it only as an **upper bound on people reached**, and label it that way whenever you cite it (Vietnamese: **"tổng tiếp cận cộng dồn theo ngày — KHÔNG khử trùng lặp theo người"**). **It is NEVER a denominator.**
- **`days_counted` + `date_range` are the group's real delivery coverage** — how many distinct days actually carried delivery, and the first/last of them. A shortfall against the window means those days had no delivery **or** were never ingested; Step 1a is what tells the two apart. This is the L2 **continuity** signal, and it is a genuinely new one — a day-keyed store is what makes "did this set actually run every day" answerable at all.

**Derive only what the sums support:**

- ✅ **`CPM = spend ÷ impressions × 1000`.** Both are genuinely additive across days, so the CPM of a range is a real CPM. This is L2's primary computable KPI.
- ✅ **`CTR`** is returned server-computed (`clicks ÷ impressions`), also additive-safe.
- ❌ **NEVER `frequency = impressions ÷ reach_day_sum`, or any other frequency.** See the hard rule above: the divisor is a day-sum, so the quotient is not a frequency and reads healthy precisely when the audience is most burned. There is **no field on this surface** (or on `get_performance_range`, or on `get_post_performance.ad_metrics`) from which a period frequency can be computed — per-day reach is stored server-side but no read exposes it per day. So the honest output is **"tần suất không khả dụng"**, every cycle, until a read that exposes it exists. Do not approximate it from a one-day window either: a single day's frequency is not the cycle frequency the KB's bands are calibrated on, and grading a daily figure against monthly bands is the same fabrication wearing a different denominator.

**Every group also carries its `class` — read it before you grade anything.** Brand OS imports **every** ad in the account, boosts included, so an ad-set group is not automatically `paid_only`:

- `class` — `paid_only` | `boosted` | `organic_only` | `unknown` | `mixed` (the group spans more than one class).
- `class_counts` — how many contributing ads fell in each class.
- `by_class` — the **same metric set, split per class** (`by_class.paid_only`, `by_class.boosted`, …), each with its own `spend` / `impressions` / `reach_day_sum` / `cost_per_purchase` / `cost_per_message` / `days_counted` / `date_range` recomputed off that class's ads alone. `reach_day_sum` carries the same meaning and the same prohibition here as at group level.
- `classification` (top level) — `linkage_populated` / `authoritative` / `note`, the degraded-state indicator (same meaning as on `get_post_performance`; see Step 1d(a)).

The group-level totals (`spend`, `cost_per_purchase`, …) are the **blended** figures across all classes. **Never tier-grade on the blended totals of a group that is `boosted` or `mixed`** — use `by_class.paid_only`. Rule 4 below is the binding form of this.

**If it returns no rows / empty groups** (no ad performance ingested — commonly no connected ad account, or none yet ingested for this cycle): this is the no-data case. Skip to Step 4 and write the graceful "no prior ad performance this cycle" retrospective.

Adjust `window_days` toward the plan month if the default 30-day window does not align with `period`; the goal is to read the spend that ran during this cycle. **`window_days` counts calendar days ending TODAY** — it cannot be aimed at a past month. When `period` is not the current or immediately-preceding month, the window necessarily overshoots or misses it; say so in the retrospective's data-status line rather than presenting the grouped figures as if they were bounded to `period`.

### Step 1a: Bound the cycle and check its coverage (do this before quoting any total)

`get_ad_performance` is grouped but anchored to today. `get_performance_range` is the opposite — it takes the **exact** date range and reports how much of it was actually measured — so run it on the plan month to establish what the cycle's numbers are worth:

```
Call: get_performance_range
  since: <first day of period, e.g. 2026-07-01>
  until: <last day of period, or today when the cycle is still running>
```

Returns two named sides (`ads`, `page`) with **no merged total** — never add one to the other; they count different events on different denominators (ad delivery impressions vs page media views), and the tool adds no field spanning both. **Only the `ads` side is yours** — the `page` side is the engagement lens's (`ssc-post-measure`); do not report it, rank it, or subtract it. From the `ads` side, hold four fields and use them as the honesty gate on everything you report:

- **`days_uncovered[]`** — dates no successful ingestion run spanned. These are **unknown**, NOT zero-spend days. Any date listed here means the cycle's totals are an under-count of unknown size.
- **`complete`** — false whenever `days_uncovered` is non-empty. When it is false, **state the degradation in the retrospective** instead of presenting the totals as a measurement.
- **`provisional_from`** — the date at/after which Meta may still restate `conversions` / `purchases`. Cost-per-purchase computed over dates at or after it is **provisional**; `spend` / `impressions` / `clicks` for a closed day are settled regardless. Grade L1/L3 accordingly and say when a grade rests on provisional conversions.
- **`totals.reach_day_sum`** — the same day-sum, with the same prohibition. Not a denominator, not people reached.

`days_uncovered` is also what makes the L2 **continuity** signal honest: a group whose `days_counted` falls short of the cycle is only a delivery gap when those dates were actually covered. A shortfall on an uncovered date is a measurement gap, not a fatigued set — never grade a set down for a night the ingestion missed.

If this call fails, note it and continue on Step 1's grouped read alone — but say in the retrospective that cycle coverage could not be verified, and never claim the totals are complete.

### Step 1b (optional): Read the per-period digest for extra signal

The digest is supplementary, NEVER required — a null here is not a no-data condition:

```
Call: get_performance_analysis
  period: <period>
```

If `analysis` is present, it may add cross-channel context (`adCampaignHealth`, `youtubeRetention`, `conversionAudit`). If it returns `{ analysis: null }`, ignore it and proceed on the ingested ad-set rows from Step 1.

### Step 1c: Read the live per-tier KPI thresholds from the KB

The per-tier KPIs and the current numeric thresholds (cost-per-purchase bands, frequency caps, CPM benchmarks) are first-party data that updates each cycle — read them live rather than hardcoding:

```
Call: get_knowledge
  paths: ["ad/strategy", "ad/campaign-architecture"]
```

From these, hold the per-tier grading inputs: the **cost-per-purchase** bands for L1 (cold, expected ~1.8–2× warm) and L3 (warm/retarget, the money tier), and the **L2 omnipresence** thresholds (the CPM benchmarks — e.g. person-led reach CPM <10k as the winner bar). The KB documents win over any number written inline here. A failed read is non-fatal — fall back to the inline rubric in Step 2.

**The KB's L2 frequency caps (e.g. 1.5–2.5 good, >3.5 refresh) are NOT gradable this cycle and you do not grade against them.** They are a real, live part of the strategy — the KB is right to carry them — but the ad read exposes no frequency and no per-day reach to build one from (Step 1). Reading a cap you cannot measure against is exactly where a fabricated number gets invented to fill the slot. So: record the cap as **declared but unmeasured**, grade L2 on the CPM band + delivery volume/continuity, and write **"tần suất không khả dụng — không chấm theo ngưỡng tần suất kỳ này"** wherever the frequency band would have gone. Never substitute a proxy for it and never leave the reader to assume it was checked.

These are the same three tiers the Brief step tags on each angle as `target_layer_term_id` (L1/L2/L3) when it approves a brief. Measure never reads `ad_plan_slots` for this (retired) — it reads which tier a specific ad-set/campaign/ad ran either off the brief itself (`get_brief`, Step 2, when the group resolves to one) or off the group's own name (fallback). **Tiers apply to `paid_only` content only — a `boosted` post is graded as boost class with no tier (rule 3 above).**

### Step 1d: Read the boosted page posts (the boost-class population)

Boosts are page posts with ad money behind them, so their engagement side lives on the page read, not the ad read:

```
Call: get_post_performance
  platform: facebook
```

**Keep only rows whose `class` is `boosted`** — these are your boost class. Ignore `organic_only` entirely (it is `ssc-post-measure`'s), and remember `paid_only` cannot appear here at all (rule 2). **This read is capped at the ~100 most recently published posts**, so it is not the full boost population: a boost still spending on an older post appears only on the ad read and is graded from there per rule 4. **You cannot make that comparison at ad-set level** — an ad-set group carries no story id and no post id, and this page read exposes only `ad_ids`, so the two reads share no key at `level: adset`; the split is done per ad in Step 1e. **Hold the union of every boosted row's `ad_ids` as the HAS-AN-ENGAGEMENT-HALF set** — these are the ads whose post is in this read, so a page-side `engagement_rate` exists for them. (It is no longer an "already graded" set: since `ad_metrics` became an all-time sum, the **cost-per-result half of every boost's grade comes from Step 1e**, in-page and out-of-page alike. This read supplies the engagement half and the post's identity; Step 1e supplies the per-cycle money.) Each boosted row gives you:

- `ad_ids` + `ad_metrics` — the **ALL-TIME** sum of its linked ads' daily rows (`ads_counted`, `impressions`, `reach_day_sum`, `clicks`, `spend`, `conversions`, `purchases`, `messaging_conversations`, `date_range` as `{from, to}` in `YYYY-MM-DD`, `days_counted`). `ad_metrics` is `null` on non-boosted rows, and null means "no paid delivery to report", not zero spend.

  > **`ad_metrics` IS NOT A PER-CYCLE FIGURE — this changed, and it changes what you may do with it.** It used to be the newest window snapshot per ad; now that `ad_performance` is keyed on `(ad_id, date)`, it is a SUM over **every day that ad has ever delivered**, and `get_post_performance` takes **no date-range input** at all, so there is no way to bound it to `period`. A boost that ran for a year contributes a year of spend. **Do not use `ad_metrics.spend` as the numerator of a per-cycle cost-per-result** — against one cycle's page engagement it inflates the cost by however long the ad has been running, and the result would look like a measurement. Read `date_range` + `days_counted` to see the span it actually covers, and cite it as **lifetime paid context** ("chi tiêu quảng cáo trọn đời của bài này, từ `<from>` đến `<to>`"), never as this cycle's spend. **The per-cycle paid figures come from Step 1e's window-bounded per-ad read** — that is the only per-ad source with a date bound. `ad_metrics.reach_day_sum` carries the same day-sum prohibition as everywhere else.
- `engagement_rate` (= engagement ÷ `post_media_view`) — the **engagement** half of the boost's grade, in media-view terms (see the caveat in rule 3). Unaffected by the ad-side re-key.

**Read the `classification` block for the degraded states**, and handle each as an ordinary reportable outcome — never a failure, never smoothed into a clean finding:

- **(a) Linkage not populated.** `classification.linkage_populated` is `false` (or `authoritative` is `false`) ⇒ **no boost can be detected this cycle**. Report that plainly: boost detection was unavailable, so there is no boost class to grade — **never** report "no boosted content" as a measured finding, and never assert the page was all organic. Vietnamese: **"Không phát hiện được bài boost trong kỳ này vì liên kết quảng cáo chưa được đồng bộ — KHÔNG kết luận là không có bài nào chạy quảng cáo."** Grade `paid_only` on the ad side as normal; it is unaffected.
- **(b) A boost placed outside Brand OS has no ad row.** The ingestion loop only tracks ads that exist in Brand OS, so a boost placed straight from the page or Ads Manager has page data and **no** ad data — it classifies `organic_only` and never reaches this lens at all. Note the gap honestly when you report boost-class coverage: absence of paid data is **absence of data**, not evidence the post was clean organic. Vietnamese: **"Boost đặt ngoài Brand OS không có dữ liệu quảng cáo và không xuất hiện trong lăng kính này — thiếu dữ liệu, không phải bằng chứng là không chạy quảng cáo."**
- **(c) No content at all.** `count === 0` on this read **and** no ingested ad rows in Step 1 ⇒ the full no-data case. Record it gracefully (Step 4) and fabricate nothing — no grades, no spend, no cost-per-result.

If this call fails entirely, note it and continue on the ad-side data alone: report the boost class as **not measurable this cycle**, never as empty.

### Step 1e: Get every boost's PER-CYCLE paid figures, PER AD

This is now the **only** per-ad source with a date bound, so it is where **every** boost's cost-per-result comes from — not just the out-of-window ones. `get_post_performance.ad_metrics` is an all-time sum with no range input (Step 1d), so it cannot answer "what did this boost cost *this cycle*"; this read can, because `window_days` bounds it.

Run this whenever **either** Step 1d returned at least one `boosted` row **or** Step 1's adset read shows `class_counts.boosted > 0`. Skip it only when neither holds — there is then no boost spend at all to attribute.

```
Call: get_ad_performance
  level: ad
  window_days: <the same window you used in Step 1>
  limit: 500
```

**Pass `limit: 500` — the schema maximum — and never omit it.** The default is 50, sorted by spend descending, and the out-of-window boosts this step exists to catch are by nature **low-spend**, so a spend-desc default would drop exactly the rows this read must find and grade them in neither lens. Never exceed 500 (the schema rejects it). **If the read genuinely returns 500 rows, say so plainly** — report that the ad read was truncated at the maximum and that out-of-window boost coverage may be incomplete this cycle; never silently grade the subset as if it were the whole population.

At `level: ad` each returned group **is one ad**, and its `id` is the Brand OS ad id — the **same namespace** as the page read's `ad_ids`. That shared key is the only way to tell in-page boost spend from out-of-page boost spend; the ad-set groups of Step 1 carry no post/story id and cannot be split this way.

- Keep only the rows whose `class` is `boosted`.
- An ad whose `id` **is** in Step 1d's has-an-engagement-half set belongs to a boost whose post is in the page read. Its **per-cycle spend/results are these figures**; its **engagement rate is the page read's**. Grade that boost on both halves — one grade, two sources, no double count (Step 1d's `ad_metrics` is lifetime context and contributes no number to the grade).
- An ad whose `id` is **NOT** in that set is an **out-of-window boost**: its post is older than the newest-100 page window. Sum the metrics of these ads and grade them in Step 2 as **boost class, cost-per-result only, engagement half unavailable** (rule 4). This read returns no ad-set field, so report them together as out-of-window boost spend (cite each ad's `name` where it is descriptive) rather than attributing them to a named ad set.
- Sum **per ad**, never per ad-set group — that is exactly what keeps one group's several boosts, in-window and out, from being counted as one.
- **A boost with an engagement half but no row here has no spend inside the window** — say "không có chi tiêu trong kỳ này" and grade the engagement half alone. That is a real finding (the money stopped), not a missing figure, and it is only true when Step 1a showed the cycle's dates covered; on an uncovered date it is unknown, not zero.
- Every group here carries `days_counted` + `date_range` too — cite them when a boost's spend is concentrated in a few days rather than sustained.

If this call fails, say so plainly. Fall back to the group-level `by_class.boosted` **only** when Step 1d returned no boosted rows at all (nothing can be double-counted then); otherwise report the boost spend as **not attributable this cycle** rather than grading it twice, grading it off the all-time `ad_metrics`, or dropping it silently.

### Step 2: Grade each ad-set BY TIER (the locked-KPI rubric)

**First, filter the groups by `class` — before any tier mapping (rule 4):**

| Group `class` | Tier-graded? | What you use |
|---|---|---|
| `paid_only` | ✅ yes | the group's own totals (identical to `by_class.paid_only`) |
| `mixed` | ✅ yes, on the **paid_only half only** | `by_class.paid_only` — and name the **actual other class(es)** present, read off `class_counts` (`mixed` means only ">1 class present": a `paid_only` + `unknown` group carried NO boost spend, and saying it did is a false claim). When `class_counts.boosted > 0`, the group's **boost half is not dropped**: it is graded as boost class, from the page read where its post appears and from Step 1e's per-ad figures where it does not — never as part of the tier grade |
| `boosted` | ❌ **never** | drop it from tier grading entirely; its grade is the boost-class one from Step 1d — or, for its ads whose post is absent from that page read, the Step-1e per-ad figures with the engagement half declared unavailable (rule 4) |
| `unknown` | ❌ no | report as undetermined coverage; never grade as a tier |
| `organic_only` | ❌ **cannot occur** | structurally impossible on this read (organic-only content has no ad). If you ever see it, report it as a data anomaly — never as an organic finding |

A group with **no** `by_class.paid_only` block has no tier-gradable spend — leave it out of the tier table rather than grading its blended totals.

Then map each remaining group to its tier (L1 cold / L2 awareness / L3 warm). There is no `ad_plan_slots` link anymore — the ad-set/media buy left the creative pipeline entirely — so resolve tier from whichever of these is available, in order:

1. **The brief, when the group resolves to one.** If the group is identifiable as a specific angle's deployment — its name echoes a known subject/idea title or a brief's `angle_label`, or the operator names it directly — resolve the underlying brief: `get_idea(id)` for the subject + `list_content(idea=…)` for its content (each row carries `brief_id`) when only the idea is identifiable, or straight to `list_content(brief=…)` when the `angle_label` itself is what's recognizable; either way, `get_brief(id=<brief_id>)` reads the angle authoritatively. The brief's `target_layer_label` is the tier (tagged once at Brief time, never re-homed); its `persona_label` + `route_label` + `angle_label` name the angle.
2. **The group's own name, otherwise.** Deployment realizes the angle's declared `target_layer` into the ad set it places the ad in, so a descriptively-named ad-set/campaign usually still signals its tier even when the exact brief can't be resolved. Read it as a judgment call, not a guess dressed as fact.

Where neither signal is available, leave the group **ungraded** rather than forcing a tier. Then grade EACH group 🔴/🟡/🟢 on **its tier's KPI** — never a single cross-tier metric:

| Tier | KPI (locked) | 🟢 Green (carry / scale) | 🟡 Yellow (hold) | 🔴 Red (cut / refresh) |
|------|--------------|--------------------------|------------------|------------------------|
| **L1 cold** (conversion) | **cost-per-purchase** | ≤ target & stable — cold runs above warm by the KB's expected multiple (NORMAL, not failure) | inside band, or below the significance gate | above the KB red threshold (the per-tier multiple in `ad/strategy` / `ad/campaign-architecture`) with significant spend |
| **L3 warm** (re-conversion) | **cost-per-purchase** | ≤ target → **the money tier: protect + scale** | early / borderline | above the KB red threshold |
| **L2 awareness** (omnipresence) | **CPM + delivery volume & continuity + warm-pool growth** — **frequency unavailable, never graded** | CPM inside the KB green band (person-led = the cheap-reach engine) **and** delivery sustained across the cycle's covered days (`days_counted` ≈ the covered span) | CPM drifting toward the KB's watch band, or delivery bunched into a few days of an otherwise-covered cycle — ready a refresh | CPM above the KB band with real spend → budget trim + refresh creative; a CPM in the KB's "conversion/heritage hook mis-placed at awareness" band = move it down to L3, NOT an L2 winner |

**The L2 row above has no frequency column on purpose.** Every green/yellow/red call in it must be reachable from CPM, spend, impressions, `days_counted` and `date_range` alone. Whenever the KB's frequency cap would have decided the grade, write **"tần suất không khả dụng"** beside the grade and let the CPM + delivery evidence carry it — a grade with a stated gap is honest; a grade resting on `impressions ÷ reach_day_sum` is not a grade at all.

**These three tiers grade `paid_only` content.** The boost class is graded separately and is **not** a fourth tier:

| Class | KPI | 🟢 Green (carry / scale) | 🟡 Yellow (hold) | 🔴 Red (cut / refresh) |
|---|---|---|---|---|
| **Boost class** (`boosted` — **NO tier**) | **cost-per-result + engagement rate** | cost-per-result at/below the comparable KB band **and** a strong engagement rate — the money bought delivery to content that resonated | one side strong, the other weak, or below the significance gate | weak on both — the spend bought delivery to content that did not resonate |

Grade every boost this way, **once**. The Step 1d page read is the source whenever the boosted post appears in it — never grade it a second time from an ad-set group it happens to sit in (`by_class.boosted` is there to be excluded from the tier grade, not to be graded again). When the post does **not** appear in the page read (it is older than that read's newest-100 window), grade the boost from **Step 1e's per-ad figures** instead — cost-per-result only, engagement half declared unavailable, and say the figure came from the ad read. This holds for a boost sitting in a `mixed` group exactly as for one in a `boosted` group: the group's paid_only half is tier-graded and its boost half is graded here. Every boost gets exactly one grade; none gets zero. **Never assign it L1, L2, or L3** — a boost with no brief has no declared `target_layer`, and inventing one fabricates a declared value; an ad set named "L2 - omnipresence" that turns out to hold a boost is boost spend in a tier-ish name, not a declared L2. Report it as **"boost class — tier not declared"** (Vietnamese: **"nhóm boost — không có tầng khai báo"**). Name which cost-per-result you used (purchase / message / conversion), and state the engagement rate in media-view terms.

**Discipline (do NOT grade on noise):**

- **Significance gate** — leave the 7-day learning phase untouched; an ad-set below the KB's significance threshold (meaningful purchase-event volume per `ad/strategy` / `ad/campaign-architecture`) is **Yellow, not a verdict**. Do not declare a winner or a loser on a single thin week.
- **Provisional conversions are not a verdict either** — a cost-per-purchase resting on dates at or after Step 1a's `provisional_from` may still be restated by Meta. Grade it, but say the grade is provisional; never present a restatable number as settled.
- **Uncovered dates are not a fatigue signal** — a group's short `days_counted` means fatigue only when Step 1a shows those dates were covered. On an uncovered date the delivery is unknown, and grading a set down for it invents a finding out of an ingestion gap.
- **Tier-specific fatigue signals** — L1/L3: **rising cost-per-purchase** or falling CTR week-over-week. L2: **rising CPM** with flat-or-falling CTR, or delivery collapsing to a handful of the cycle's covered days. **L2 fatigue is NOT read off a frequency** — none is available (Step 1) — so name the CPM/CTR/continuity signal you actually saw, and state that the frequency cap could not be checked. Name the signal, not just "fatigued", and never dress a proxy up as the frequency it stands in for.
- **Do NOT fast-kill L1** as "fatigue" — it is the funnel intake; cold runs above warm cost by the KB's expected multiple, and that is expected. Let L3 carry conversion.
- **Lead-form is a LOSER, not a tier** — `0` purchases + very high cost/conversion → retire it, never re-propose (per `losers/index`).

Now extract the angle learnings from the grades — organized by **ANGLE (persona × route)**, not by ad-set/layer:

- **Winning angles** (🟢) — for each 🟢 group resolved to a specific brief (path 1 above), name it **`<persona_label> × <route_label>`** (cite `angle_label` too when it adds clarity) plus its tier, and cite the tier's KPI number (cost-per-purchase for L1/L3; CPM + delivery volume/continuity for L2, with "tần suất không khả dụng" stated). For a 🟢 group graded on its name alone (path 2), report the grade at the **tier level only**, honestly labelled as such — never invent a persona/route it didn't earn. These carry forward.
- **Fatigued / inefficient angles** (🔴) — same resolution discipline; name the tier-specific fatigue signal (rising cost-per-purchase for L1/L3; rising CPM / falling CTR / collapsed delivery continuity for L2 — never a frequency, which is unavailable). These drop or refresh.
- **Cross-channel** — fold in any digest signal from Step 1b (`adCampaignHealth`, conversion gaps) only if present.
- **Winning vs fatigued proof points, copy lengths, and formats** — for the clearest 🟢/🔴 groups you resolved to a specific brief, read that brief's content (already fetched via `list_content` above) and note which **proof points** the converting copy leaned on, which **copy-length** band performed, and which **format** won vs fatigued. This is a *directional* signal — an ad-set can carry several creatives, so do not over-attribute; where a group didn't resolve to a specific brief, there is no content-level read to make — say so and stay at the tier level.

Ground every grade in an actual ingested metric from `get_ad_performance` (and, for the boost class, Step 1e's cycle-bounded per-ad figures plus `get_post_performance`'s `engagement_rate`) — do not fabricate numbers, and do not compute a number the surface cannot support. Where a group can't be resolved to a specific persona × route, report the tier-level grade honestly rather than inventing an angle to fill the gap; where a metric is unavailable (frequency, always; the engagement half of an out-of-window boost; an uncovered date), **say it is unavailable** rather than substituting the nearest thing that divides.

### Step 2b: One boosted post, TWO verdicts — yours is the conversion one

A `boosted` post genuinely has both jobs, so it is measured **twice**, once per lens, and the two verdicts are independent:

| Lens | Owner | Verdict on a boosted post |
|---|---|---|
| **Engagement** | `ssc-post-measure` | Its **rate rank** among organic + boosted page content — did it resonate? |
| **Conversion** | **you** (`ssc-ads-measure`) | Its **boost-class** grade on cost-per-result + engagement rate, **no tier** — did the money work? |

**Never present one as the other, and never present yours as the whole story.** A boost can grade 🔴 on cost-per-result while ranking top on engagement in the post retrospective, or the reverse — both are true at once, because they answer different questions. Give the conversion verdict, note that its engagement verdict lives in the post retrospective for the same period, and do **not** produce a rate *ranking* of page content here (that is the engagement lens's ordering, not yours — you cite a boost's rate as a grading input, you do not rank organic content by it).

### Step 3: Synthesise the retrospective

Write a tight markdown retrospective (under ~400 words), structured so next month's Focus can consume it as prose. **Write it entirely in Vietnamese — including the section headings (translate the English template headings below).** The retrospective is a persisted artifact the Vietnamese operator reads in the dashboard and next month's Focus consumes; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English). **Never use the acronym "RCT" — write "nghiên cứu lâm sàng độc lập".**

```
## Ad Retrospective — <period>

### Data status / classification
<one line: whether the ad-story linkage was populated (degraded state (a) — if not, say boost
detection was unavailable and do NOT report "no boosted content" as a finding), plus the caveat
that a boost placed outside Brand OS has no ad row and never reaches this lens.>
<one line on CYCLE COVERAGE from Step 1a: how many of the period's days were covered by a
successful ingestion run, naming the uncovered dates when `complete` is false — "chưa đo được
<n> ngày (<dates>): tổng số của kỳ là số tối thiểu, không phải số đo đầy đủ" — plus whether any
conversion figure is still provisional (`provisional_from`).>
<one line: "Tần suất (frequency) không khả dụng — dữ liệu quảng cáo chỉ có tổng tiếp cận cộng dồn
theo ngày (`reach_day_sum`), KHÔNG khử trùng lặp theo người, nên không tính được tần suất. Không
chấm L2 theo ngưỡng tần suất kỳ này.">

### Tier grades — `paid_only` content only (each tier on ITS KPI; boost spend excluded)
- **L1 cold** (cost-per-purchase) — <🟢/🟡/🔴 + number, e.g. "🟢 ~1,6tr/đơn, ổn định, đúng kỳ vọng cold ~2× warm">
- **L3 warm** (cost-per-purchase) — <grade + number — the money tier>
- **L2 awareness** (CPM + độ phủ/độ liên tục) — <grade + CPM + impressions + số ngày có phân phối
  trên tổng số ngày đã đo; ~0 purchase is correct, do NOT score on cost-per-purchase; append
  "tần suất không khả dụng". Cite `reach_day_sum` only if useful, and only as "tổng tiếp cận cộng
  dồn theo ngày — KHÔNG khử trùng lặp theo người", never as người tiếp cận and never as a divisor.>

### Boost class — `boosted` content (KHÔNG có tầng khai báo)
- <grade + cost-per-result **computed on the cycle-bounded per-ad figures from Step 1e** (name
  which: /đơn, /tin nhắn, /chuyển đổi) + engagement rate written as interactions per N media
  views> — "nhóm boost — không có tầng khai báo". Never L1/L2/L3. When you also cite the post's
  lifetime paid figures from `ad_metrics`, label them "chi tiêu trọn đời (từ <from> đến <to>)" —
  never as this cycle's spend.
- <for a boost graded off the ad read because its post is outside the newest-100 page read:
  grade + cost-per-result only> — "chấm từ dữ liệu quảng cáo; post ngoài phạm vi 100 bài mới nhất
  — không có tỷ lệ tương tác để chấm". Still "nhóm boost — không có tầng khai báo".
- or "Không phát hiện được bài boost trong kỳ này vì liên kết quảng cáo chưa được đồng bộ — KHÔNG
  kết luận là không có bài nào chạy quảng cáo." (degraded state (a))

### Winning angles (carry forward)
- <persona> × <route> (<tier>) — <tier KPI evidence: cost-per-purchase for L1/L3; CPM + độ phủ/độ liên tục for L2>, or "<tier> — <evidence>, góc cụ thể chưa xác định được kỳ này" when the group didn't resolve to a specific brief

### Fatigued / inefficient angles (drop or refresh)
- <persona> × <route> (<tier>) — <named fatigue signal: rising cost-per-purchase (L1/L3); rising CPM / falling CTR / delivery collapsed to a few covered days (L2) — NEVER a frequency>, or the tier-level equivalent when the angle isn't identifiable

### Winning proof points · lengths · formats (carry forward — Focus reads these into next month's bets)
- <e.g. "proof '60 năm + chuẩn EU / 26 vi chất' converted on L3"; "copy dài kể-chuyện thắng ở L2"; "format carousel thắng cold L1"> — or "no content-level signal this cycle"

### Fatigued proof points · lengths · formats (drop / refresh)
- <e.g. "hook 1 dòng chung chung mỏi"; "format ảnh tĩnh mỏi ở L2"> — or "none observed"

### Budget / efficiency fixes for next month
- <reallocation or angle-refresh action, or "none observed">

### Carry-forward note for Focus
<2-3 sentences: the single clearest signal next month's Focus should act on — which angle to lead with, which to retire. Keep tier-correct: protect/scale L3 winners, keep L1 at funnel-intake, never judge L2 on cost-per-purchase.>
```

Ground every "winning"/"fatigued" claim in an actual ingested metric from `get_ad_performance` — not opinion. This is the prose next month's `ssc-ads-focus` reads in its prior-retrospective step.

### Step 4: Write the retrospective onto the plan

Call:

```
Call: save_channel_plan
  channel: ad
  period: <period>
  retrospective: <the markdown retrospective from Step 3, OR the no-data note below>
```

**No-data case** — when Step 1's `get_ad_performance` returned no rows (no ad performance ingested), write the placeholder in Vietnamese:

```
## Hồi cứu quảng cáo — <period>

Không có dữ liệu hiệu suất quảng cáo nào được nạp vào hệ thống trong kỳ này (chưa có tài khoản quảng cáo kết nối hoặc chưa nạp dữ liệu). Không chấm điểm tầng nào và không suy diễn bất kỳ chi phí/kết quả nào. Tháng sau, Focus nên tiếp tục dùng các góc quảng cáo đã được KB kiểm chứng (winners/losers), không có tín hiệu hồi cứu mới từ hiệu suất thực.
```

`save_channel_plan` upserts by `(channel='ad', period)` and threads `retrospective` through as a core field. It writes **propose-state only** — it never flips a gate. Do NOT pass any approval field.

> The ad plan for `period` already exists by the time Measure runs (Focus created it, and the pipeline cleared the Ideas gate). If you want to confirm before writing, an optional `get_channel_plan(channel='ad', period)` read is harmless — but it is not required.

### Step 4b: Persist your block of the shared per-period digest

The `channel_plan` retrospective from Step 4 is the **ad pipeline's** copy. The
**digest** (`performance_analyses`, one row per `period`) is the **cross-channel**
copy — the one `ssc-post-research`, `ssc-strategy-directions` and
`ssc-strategy-performance-retrospective` read via `get_performance_analysis`. Until
now nothing ever wrote it, so every one of those reads came back empty. Close that
loop: after Step 4, ALSO save your findings into the digest.

**You are the sole owner of `ad_campaign_health`** — the digest's paid-ads section
(Red/Yellow/Green + fatigue + LTV:CAC). No other skill writes it. Send the tier
grades you already computed in Step 3, as structured data:

```
Call: save_performance_analysis
  period: <period>
  ad_campaign_health:
    tiers:
      L1: { grade: "green|yellow|red", kpi: "cost_per_purchase", value: <number>, provisional: <true|false>, note: "<Vietnamese>" }
      L2: { grade: "green|yellow|red", kpi: "cpm_delivery_continuity", cpm: <number>, impressions: <number>, days_counted: <number>, frequency_unavailable: "tần suất không khả dụng — chỉ có tổng tiếp cận cộng dồn theo ngày (reach_day_sum), không khử trùng lặp theo người", note: "<Vietnamese>" }
      L3: { grade: "green|yellow|red", kpi: "cost_per_purchase", value: <number>, provisional: <true|false>, note: "<Vietnamese>" }
    boost_class: { grade: "green|yellow|red", kpi: "cost_per_result_and_engagement_rate", cost_per_result: <number>, cost_per_result_basis: "purchase|message|conversion", cost_per_result_scope: "cycle", engagement_rate: <number>, tier: null, note: "<Vietnamese>" }
    coverage: { days_requested: <number>, days_uncovered: [<dates>], complete: <true|false>, provisional_from: "<YYYY-MM-DD>" }
    winning_angles: ["<angle>", …]
    fatigued_angles: ["<angle>", …]
    ltv_cac: <number or null when it cannot be derived from ingested data>
  summary: <the merged digest prose — see below>
```

Include a tier only if you actually graded it; set `ltv_cac: null` rather than
estimating one. Keep the KPI tier-locked exactly as in Step 3 — L2 is **never**
graded on cost-per-purchase, in the digest as in the retrospective.

**L2 carries NO `frequency` key, and no numeric stand-in for one.** The key is
absent rather than null or zero for the same reason the server renamed `reach` to
`reach_day_sum`: an absent key cannot be read as a measurement, while a `0` or a
plausible float can. `frequency_unavailable` states the gap in words so a
downstream reader (`ssc-strategy-performance-retrospective`, `ssc-strategy-directions`)
sees WHY there is no number instead of assuming nobody looked. **Never add a
`frequency` key back, and never derive one from `reach_day_sum`.** Likewise
`boost_class.cost_per_result_scope: "cycle"` records that the figure came from the
window-bounded per-ad read (Step 1e) and not from the all-time `ad_metrics` —
omit the whole `boost_class` block rather than pass a lifetime number under it.
The `coverage` block carries Step 1a's honesty fields forward so a later reader
can tell an under-measured cycle from a quiet one. **`boost_class`
is separate from `tiers` and its `tier` is always `null`** — never fold a boost into
`tiers.L2` (or any tier) to make it fit the shape. Omit `boost_class` entirely when
no boost was detected or when the linkage was unpopulated (degraded state (a)) —
omitting it is honest, inventing an all-red boost grade is not. Phrase each
`winning_angles`/`fatigued_angles` entry the same way Step 3 does — `"<persona> ×
<route> (<tier>)"` when a group resolved to a specific brief, or the tier alone when
it didn't — never a slot/layer label (`ad_plan_slots` is retired).

**The `summary` is SHARED — read-modify-write it, never clobber it.**
`save_performance_analysis` UPSERTS on `period` and applies **only the fields you
pass** (an omitted field keeps its previously-saved value), so several skills compose
one row for the cycle. `summary` is a single text field, though, so each writer owns
exactly ONE named block inside it:

| Block heading | Owner |
|---|---|
| `## Quảng cáo (Ads)` | **you** (`ssc-ads-measure`) |
| `## Bài viết (Posts)` | `ssc-post-measure` |
| `## Tổng hợp chu kỳ` | `ssc-strategy-performance-retrospective` |

Take the `summary` you already read in **Step 1b** (`{ analysis: null }` ⇒ treat it
as an empty string). Replace your `## Quảng cáo (Ads)` block if one exists, or append
it if it does not, and leave every other block **byte-for-byte unchanged**. Pass the
whole merged string as `summary`.

Your block is the Step-3 retrospective condensed to its carry-forward signal — **in
Vietnamese**, headings included (the persisted-prose convention: everything stored is
Vietnamese; only your chat-side reasoning is English):

```
## Quảng cáo (Ads)

**Trạng thái dữ liệu:** <đầy đủ | một phần | chưa nạp dữ liệu quảng cáo trong kỳ này>
**Phân loại:** <đã phát hiện được bài boost | chưa phát hiện được vì liên kết quảng cáo chưa đồng
bộ — KHÔNG kết luận là không có bài nào chạy quảng cáo>. Boost đặt ngoài Brand OS không có dữ
liệu quảng cáo nên không xuất hiện trong lăng kính này.

**Độ phủ dữ liệu kỳ này:** <đã đo đủ <n>/<n> ngày | chưa đo được <n> ngày (<dates>) — tổng số là
số tối thiểu>. **Tần suất không khả dụng** — chỉ có tổng tiếp cận cộng dồn theo ngày
(`reach_day_sum`), KHÔNG khử trùng lặp theo người; không chấm L2 theo ngưỡng tần suất.

**Điểm theo tầng (nội dung chỉ chạy quảng cáo):** L1 <🟢/🟡/🔴 + số> · L2 <grade + CPM + hiển thị +
số ngày có phân phối/số ngày đã đo> · L3 <grade + số>
**Nhóm boost (không có tầng khai báo):** <grade + chi phí/kết quả TRONG KỲ (ghi rõ /đơn hay /tin
nhắn hay /chuyển đổi) + tỷ lệ tương tác trên lượt xem — lượt xem KHÔNG khử trùng lặp theo người>,
hoặc "không phát hiện được trong kỳ này"
**Góc thắng (giữ lại):** <…>
**Góc mỏi / kém hiệu quả (bỏ hoặc làm mới):** <…>
**Tín hiệu cho tháng sau:** <1-2 câu>
```

Your block is the **conversion lens only**. It never carries an organic-content ranking — that belongs to `ssc-post-measure`'s `## Bài viết (Posts)` block, which you must leave byte-for-byte unchanged.

**Pass nothing else.** Do **not** pass `youtube_retention` or `conversion_audit` — no
skill produces either today, and passing a value you did not measure would fabricate
data. Omitting them preserves whatever another writer stored.

The digest row is always written as a **`draft`** — the tool takes no `status` and
cannot mint a `final`. Saving it is not an approval and flips no gate.

In the **no-data case** (Step 1 returned no ingested ad rows), still save, with the
absence recorded honestly — omit `ad_campaign_health` entirely (do not invent an
all-red grading) and write only:

```
## Quảng cáo (Ads)

**Trạng thái dữ liệu:** chưa có dữ liệu hiệu suất quảng cáo nào được nạp trong kỳ này. Không có tín hiệu hồi cứu mới từ hiệu suất thực.
```

### Step 5: Output summary

```
## Ads Measure — <period> (conversion lens)

**Data status:** <full | partial (some sections missing) | no data this cycle>
**Cycle coverage:** <all N days covered | N days uncovered (<dates>) — totals are a floor, not a measurement> · conversions provisional from <date>
**Frequency:** UNAVAILABLE — the ad reads emit `reach_day_sum` (a day-sum of a non-additive metric), not reach; no frequency was computed or reported, and L2 was not graded against the KB's frequency cap.
**Boost detection:** <available | UNAVAILABLE this cycle — linkage not populated, so no boost class could be graded (NOT "no boosts")>
**Lens scope:** paid_only + boosted. organic_only excluded (see the post retrospective).

### Tier grades — paid_only
- L1 cold (cost-per-purchase): <🟢/🟡/🔴> · L3 warm (cost-per-purchase): <grade> · L2 awareness (CPM + delivery volume/continuity, frequency unavailable): <grade>

### Boost class — boosted (no tier)
- <grade + cost-per-result (basis named) + engagement rate in media-view terms>, or "not detected this cycle"

### Winning angles (carry forward)
- <signal>

### Fatigued / inefficient angles (drop or refresh)
- <signal>

### Carry-forward note for next month's Focus
<2-3 sentence statement>

---
Retrospective written to the ad channel_plan (propose-state, no gate). Next month's Focus (`ssc-ads-focus`) will read it as the prior period's ad retrospective.
```

## Output

- `retrospective` written to the ad `channel_plan` (markdown) — the **conversion lens**: `paid_only` graded on its declared tier's locked KPI and `boosted` graded as boost class with no tier; `organic_only` excluded — or the graceful no-data note when no ad performance has been ingested
- `ad_campaign_health` (tier grades + the separate `boost_class` block + winning/fatigued angles + LTV:CAC) and the `## Quảng cáo (Ads)` summary block written into the shared per-period digest (`performance_analyses`, `status='draft'`) via `save_performance_analysis` — merged into the existing `summary`, never clobbering another skill's block
- No gate flipped (Measure is ungated)

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Synthesis + save only: writes via `save_channel_plan` (the `retrospective` field) and `save_performance_analysis` (the digest's `ad_campaign_health` + your `## Quảng cáo (Ads)` summary block) — no writes to the RAW performance tables (`ad_performance` is ingestion's, not yours), no content writes, no idea/schedule writes.
- **No gate.** Measure is the one ungated step; `retrospective` is propose-state output, never an approval. The skill never sets `tactics_approved`, `approaches_approved`, or `approved`.
- **Saving the digest is NOT an approval.** `save_performance_analysis` always writes `status='draft'` (the tool takes no `status` and cannot mint a `final`), so it flips no gate and stays inside propose-only.
- **The digest is shared — never clobber another skill's block.** Read `summary` in Step 1b, replace/append ONLY `## Quảng cáo (Ads)`, and pass no field beyond `ad_campaign_health` (which you alone own): `youtube_retention` / `conversion_audit` have no producer, and passing either would fabricate a measurement you did not take.
- Reads the **ingested** ad performance via `get_ad_performance`, the cycle's bounded totals + coverage via `get_performance_range`, and the boosted page posts via `get_post_performance` (all read-only, `view` only); **never triggers ingestion (`pull_*` — not `pull_all_ad_performance`, not `pull_fb_ad_hierarchy`, not `pull_fb_performance`)** and never fabricates metrics. The `get_performance_analysis` digest is optional cross-channel context on the READ side — a null there is NOT a no-data condition — and, on the WRITE side, the row you are contributing `ad_campaign_health` + your summary block to.
- Records "no prior ad performance this cycle" gracefully only when `get_ad_performance` returns no rows — never invents spend/CTR/cost-per-result.
- Every "winning"/"fatigued" claim is grounded in an actual ingested metric from `get_ad_performance`.
- **You are the CONVERSION LENS — scope is a hard rule.** Cover `paid_only` + `boosted` only. **`organic_only` never appears in this lens**, not as a grade and not as context; it belongs to `ssc-post-measure`. `unknown` is reported as undetermined, never graded as if its class were known. **`class` from `get_post_performance` is the sole authority — never read the stale, always-null `is_boosted` column**, which can disagree with it.
- **`paid_only` metrics come from `get_ad_performance`, never from a page-post count.** A dark post has no page row, so `get_post_performance`'s `classification.counts.paid_only` is structurally always 0 — that zero is never evidence that no dark posts exist, and is never a source for a paid_only figure.
- **Boosted ads are excluded from tier grading on BOTH reads.** `get_ad_performance` carries each group's `class` + `class_counts` + `by_class`; tier grades are computed on `by_class.paid_only` only, a `boosted` group is never tier-graded, and a `mixed` group is graded on its paid_only half with the **actual other class(es) named from `class_counts`** (`mixed` means ">1 class present", not "boost spend present"). The boost-class grade is computed exactly once: from `get_post_performance`'s per-post `ad_metrics` when the post is in that read — never added to, or re-graded from, `by_class.boosted` — and from the supplementary `get_ad_performance level: 'ad'` read's per-ad figures (engagement half declared unavailable) when the post falls outside that read's newest-100 window, so no boost's spend is measured in neither lens. A `mixed` group's boost half is covered by exactly the same rule as a `boosted` group's — it is never dropped for being mixed. The in-page/out-of-page split is done **per ad** (the `level: 'ad'` group `id` shares the page read's `ad_ids` namespace), never per ad-set group, which carries no post id and can span both. Grading a group's blended totals counts a boost's spend inside a tier it never declared AND again as boost class.
- **A boost gets NO tier, ever.** `boosted` content is graded as its own **boost class** on cost-per-result + engagement rate. Defaulting a boost to L2 — or any tier — fabricates a declared value the operator never set, since a boost usually has no brief and therefore no declared `target_layer`. Report it as "boost class, tier not declared"; keep `boost_class` separate from `tiers` in the digest with `tier: null`. Equally, never drop boosts from the report for lacking a tier — the boost-class grade is the point.
- **Two lenses, two verdicts, no crossover.** A boosted post gets a boost-class conversion verdict here and a separate rate-rank engagement verdict in `ssc-post-measure`; neither is presented as the other. This skill produces no engagement *ranking* of page content — it cites a boost's engagement rate only as a grading input.
- **The engagement rate is a media-view ratio, NEVER a share of people.** `post_media_view` is not deduplicated by person. Write it as interactions per N media views; never as "% of people who engaged" or a share of people reached. A boost's page metrics are the **unmodified page totals inclusive of paid delivery** — no organic/paid split exists (`impressions_organic` / `engagement_rate_organic` are permanently null), so never subtract `ad_metrics` from them and never estimate an organic remainder.
- **The documented degraded states are reported, never failed and never fabricated.** (a) `linkage_populated`/`authoritative` false ⇒ say boost detection was unavailable — never report "no boosted content" as a measured finding and never assert the page was all organic; omit `boost_class` rather than invent a grade. (b) A boost placed outside Brand OS has no ad row, classifies `organic_only`, and never reaches this lens ⇒ report the absence of paid data as missing data, not as proof the post was clean organic. (c) No page posts and no ingested ad rows ⇒ record the no-data outcome gracefully and fabricate no grades, spend, or cost-per-result.
- **NEVER derive a frequency, and never divide by `reach_day_sum` (hard rule).** The ad reads emit `reach_day_sum` — the SUM of each day's unique reach — and unique reach is not additive, so `impressions ÷ reach_day_sum` is not a frequency: it understates the real one by roughly the number of delivering days and makes a burned audience read healthy. No field on `get_ad_performance`, `get_performance_range`, or `get_post_performance.ad_metrics` exposes per-day reach, so **a period frequency is not computable from this surface at all.** State **"tần suất không khả dụng"** in the retrospective, the digest, and the chat summary; grade L2 on what IS measurable; never emit a `frequency` key or number anywhere, including a one-day-window approximation. `reach_day_sum` is cited only as a labelled upper bound on people reached ("tổng tiếp cận cộng dồn theo ngày — KHÔNG khử trùng lặp theo người"), never as people reached and never as a denominator.
- **`get_post_performance.ad_metrics` is an ALL-TIME sum, not a per-cycle figure.** `ad_performance` is keyed on `(ad_id, date)` and that tool takes no date-range input, so `ad_metrics` sums every day the ad ever delivered. It is lifetime paid context only — labelled with its `date_range` — and is **never** the numerator of a per-cycle cost-per-result. The cycle-bounded per-ad figures come from the `get_ad_performance level: 'ad'` read (Step 1e); the digest records that provenance as `boost_class.cost_per_result_scope: "cycle"`.
- **Cycle coverage is read and reported, never assumed.** `get_performance_range(since, until)` bounds the exact period and returns `days_uncovered` / `complete` / `provisional_from`; an uncovered date is **unknown, not a zero-spend day**, and a group's short `days_counted` is a fatigue signal only when those dates were actually covered. When `complete` is false, the degradation is stated and the totals are presented as a floor — never as a measurement. A cost-per-purchase resting at or after `provisional_from` is labelled provisional.
- **KPI is tier-locked.** Cost-per-purchase grades ONLY the conversion tiers (L1, L3); L2 omnipresence is graded on CPM + delivery volume/continuity + warm-pool contribution — NEVER on cost-per-purchase (grading L2 on cost-per-purchase mis-kills the funnel-nurture tier) and never on a frequency (unavailable — see above; the KB's frequency cap is recorded as declared-but-unmeasured, not silently treated as checked). Per-tier thresholds are read live from `ad/strategy` + `ad/campaign-architecture` (KB wins over any inline number). **Tier itself is the angle's declared `target_layer`** — read authoritatively via `get_brief` when a group resolves to one, or off the group's own name otherwise; there is no `ad_plan_slots` link (retired — the ad-set/media buy is a dashboard/ops concern outside the creative pipeline). A group whose tier can't be read either way is left ungraded, never guessed.
- **Measured by ANGLE (persona × route), never by ad-set/layer/slot.** `ad_plan_slots`, `detail.slotId`, `build_spec`, and per-ad-set `creative_count` are retired — Measure never reads or references them. Winning/fatigued learnings name the angle as `<persona> × <route>` (from the brief, via `get_brief`) plus its tier; where a group can't be resolved to a specific brief, the learning stays at the tier level and says so.
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. Output goes only to the ad `channel_plan`'s `retrospective`.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state, and never writes to a different period's plan.
- Reads winning/losing ad-sets' content via `get_idea` + `get_brief` + `list_content` **only to name the angle (persona × route) and the proof points / lengths / formats it used** — read-only, no content writes, and a directional signal (an ad-set may carry several creatives; do not over-attribute). Resolution is name/convention-based (there is no ads→brief lookup tool) — never a guaranteed join.
- **The retrospective's sole reader is next month's `ssc-ads-focus`.** `ssc-ads-writer` does not read it directly — its influence flows through Focus's next `creative_target`, not a retrospective read.
- Requires `edit` capability (for `save_channel_plan` and `save_performance_analysis`), plus `view` for the `get_ad_performance` / `get_performance_range` / `get_post_performance` / `get_performance_analysis` / `get_channel_plan` / `get_idea` / `get_brief` / `list_content` reads.
