---
name: ssc-ads-measure
description: Runs the Measure step of the standalone Cambridge Diet Vietnam Ads pipeline. Reads this plan's ACTUAL ingested ad performance (get_ad_performance) and grades each ad-set BY TIER on its locked KPI — cost-per-purchase for the conversion tiers L1 (cold) + L3 (warm/retarget), and reach/CPM/frequency for L2 omnipresence (never cost-per-purchase) — reading the live per-tier thresholds from ad/strategy + ad/campaign-architecture. Synthesises a retrospective (tier grades + winning vs fatigued angles, what to carry forward) and writes it to channel_plans.retrospective via save_channel_plan. Records "no prior ad performance this cycle" gracefully when none has been ingested. Propose-only; no gate. Next month's Focus reads this retrospective to carry winning angles forward and drop fatigued ones.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_ad_performance, get_performance_analysis, get_knowledge, get_channel_plan, save_channel_plan]
---

# Ads Measure (`ssc-ads-measure`)

You run the **Measure** step of the standalone Cambridge Diet Vietnam Ads pipeline. You read the **actual ingested ad performance** from `get_ad_performance`, **grade each ad-set by its TIER on the tier's correct KPI** (a hard rule — see below), translate that into paid-angle learnings (which angles are winning vs fatiguing), and write a **retrospective** onto the ad `channel_plan` via `save_channel_plan(channel='ad', period, retrospective=…)`. The retrospective is markdown prose — which angles worked (carry forward), which fatigued or ran inefficiently (drop or refresh), and what to try next. You only read performance and write the retrospective; you NEVER hand-author performance rows, trigger ingestion (`pull_*`), call `approve_*`, or produce new content.

**KPI is TIER-SPECIFIC — never grade every ad-set on the same metric (hard rule, sourced from `ad/strategy` §"Hệ Thống KPI" + `ad/campaign-architecture`):**

- **Cost-per-Purchase (spend ÷ purchases) is the #1 business KPI — but it applies ONLY to the conversion tiers, L1 (cold) and L3 (warm/retarget).** Cost-per-message is an intermediate operational metric, NOT the verdict.
- **L2 (Awareness / Omnipresence) is graded on reach / CPM / ThruPlay + contribution to the warm pool — NEVER on cost-per-purchase.** L2 sets producing large reach and ~0 purchases is the CORRECT role; grading L2 on cost-per-purchase "phạt oan" (wrongly penalises) and kills the funnel-nurture tier. This is the single most important rule of this step.

This is step 5 — the final step — of the Ads pipeline (**Focus → Approaches → Blueprint → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. **There is no gate** — the retrospective is propose-state output. It closes the loop: **next month's Focus reads this `retrospective`** to carry winning angles forward and drop fatigued ones.

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

Returns aggregated paid performance grouped at the requested level (default `campaign`; use `adset` to read per-ad-set winners/losers, which map most directly to the L1/L2/L3 slots). Each group returns: `spend`, `impressions`, `reach`, `clicks`, `ctr`, `conversions`, `purchases`, **`cost_per_purchase`** (server-computed = spend ÷ purchases — the locked KPI for L1/L3), `messaging_conversations`, `cost_per_message` (operational only). **Derive the L2 omnipresence signals the tool doesn't name directly: `CPM = spend ÷ impressions × 1000` and `frequency = impressions ÷ reach`** (both `impressions` and `reach` are returned). The tool reflects what has been **ingested** into Brand OS — it does NOT fetch live, and you never trigger ingestion (`pull_all_ad_performance`).

**If it returns no rows / empty groups** (no ad performance ingested — commonly no connected ad account, or none yet ingested for this cycle): this is the no-data case. Skip to Step 4 and write the graceful "no prior ad performance this cycle" retrospective.

Adjust `window_days` toward the plan month if the default 30-day window does not align with `period`; the goal is to read the spend that ran during this cycle.

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

From these, hold the per-tier grading inputs: the **cost-per-purchase** bands for L1 (cold, expected ~1.8–2× warm) and L3 (warm/retarget, the money tier), and the **L2 omnipresence** thresholds (frequency caps — e.g. 1.5–2.5 good, >3.5 refresh; person-led reach CPM <10k as the winner bar). The KB documents win over any number written inline here. A failed read is non-fatal — fall back to the inline rubric in Step 2.

### Step 2: Grade each ad-set BY TIER (the locked-KPI rubric)

First map each ad-set to its tier (L1 cold / L2 awareness / L3 warm) via `detail.slotId` on the approved concepts (or the ad-set name / layer where the slot is unknown). Then grade EACH ad-set 🔴/🟡/🟢 on **its tier's KPI** — never a single cross-tier metric:

| Tier | KPI (locked) | 🟢 Green (carry / scale) | 🟡 Yellow (hold) | 🔴 Red (cut / refresh) |
|------|--------------|--------------------------|------------------|------------------------|
| **L1 cold** (conversion) | **cost-per-purchase** | ≤ target & stable — cold runs above warm by the KB's expected multiple (NORMAL, not failure) | inside band, or below the significance gate | above the KB red threshold (the per-tier multiple in `ad/strategy` / `ad/campaign-architecture`) with significant spend |
| **L3 warm** (re-conversion) | **cost-per-purchase** | ≤ target → **the money tier: protect + scale** | early / borderline | above the KB red threshold |
| **L2 awareness** (omnipresence) | **reach / CPM / ThruPlay + warm-pool growth** | CPM, frequency & warm-pool feed inside the KB green band (person-led = the cheap-reach engine) | frequency in the KB watch band — ready a refresh | frequency above the KB cap → budget trim + refresh creative; a CPM in the KB's "conversion/heritage hook mis-placed at awareness" band = move it down to L3, NOT an L2 winner |

**Discipline (do NOT grade on noise):**

- **Significance gate** — leave the 7-day learning phase untouched; an ad-set below the KB's significance threshold (meaningful purchase-event volume per `ad/strategy` / `ad/campaign-architecture`) is **Yellow, not a verdict**. Do not declare a winner or a loser on a single thin week.
- **Tier-specific fatigue signals** — L2: frequency above the KB cap. L1/L3: **rising cost-per-purchase** or falling CTR week-over-week. Name the signal, not just "fatigued."
- **Do NOT fast-kill L1** as "fatigue" — it is the funnel intake; cold runs above warm cost by the KB's expected multiple, and that is expected. Let L3 carry conversion.
- **Lead-form is a LOSER, not a tier** — `0` purchases + very high cost/conversion → retire it, never re-propose (per `losers/index`).

Now extract the angle learnings from the grades:

- **Winning angles** (🟢) — map each back to its layer/slot and the angle it carried (value / against / frame); cite the tier's KPI number (cost-per-purchase for L1/L3; reach/CPM/frequency for L2). These carry forward.
- **Fatigued / inefficient angles** (🔴) — map each back to its layer/slot/angle and name the tier-specific fatigue signal. These drop or refresh.
- **Cross-channel** — fold in any digest signal from Step 1b (`adCampaignHealth`, conversion gaps) only if present.

Ground every grade in an actual ingested metric from `get_ad_performance` — do not fabricate numbers. Where you cannot map an ad set back to a known slot/angle, say so and lean on the layer-level read.

### Step 3: Synthesise the retrospective

Write a tight markdown retrospective (under ~400 words), structured so next month's Focus can consume it as prose. **Write it entirely in Vietnamese — including the section headings (translate the English template headings below).** The retrospective is a persisted artifact the Vietnamese operator reads in the dashboard and next month's Focus consumes; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English). **Never use the acronym "RCT" — write "nghiên cứu lâm sàng độc lập".**

```
## Ad Retrospective — <period>

### Tier grades (each tier on ITS KPI)
- **L1 cold** (cost-per-purchase) — <🟢/🟡/🔴 + number, e.g. "🟢 ~1,6tr/đơn, ổn định, đúng kỳ vọng cold ~2× warm">
- **L3 warm** (cost-per-purchase) — <grade + number — the money tier>
- **L2 awareness** (reach/CPM/frequency) — <grade + reach/CPM/freq; ~0 purchase is correct, do NOT score on cost-per-purchase>

### Winning angles (carry forward)
- <winning slot/layer/angle> — <tier KPI evidence: cost-per-purchase for L1/L3; reach/CPM/freq for L2>

### Fatigued / inefficient angles (drop or refresh)
- <fatigued slot/layer/angle> — <named fatigue signal: rising cost-per-purchase (L1/L3) or frequency >3.5 (L2)>

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

Không có dữ liệu hiệu suất quảng cáo nào được nạp vào hệ thống trong kỳ này (chưa có tài khoản quảng cáo kết nối hoặc chưa nạp dữ liệu). Tháng sau, Focus nên tiếp tục dùng các góc quảng cáo đã được KB kiểm chứng (winners/losers), không có tín hiệu hồi cứu mới từ hiệu suất thực.
```

`save_channel_plan` upserts by `(channel='ad', period)` and threads `retrospective` through as a core field. It writes **propose-state only** — it never flips a gate. Do NOT pass any approval field.

> The ad plan for `period` already exists by the time Measure runs (Focus created it, and the pipeline cleared the Ideas gate). If you want to confirm before writing, an optional `get_channel_plan(channel='ad', period)` read is harmless — but it is not required.

### Step 5: Output summary

```
## Ads Measure — <period>

**Data status:** <full | partial (some sections missing) | no data this cycle>

### Tier grades
- L1 cold (cost-per-purchase): <🟢/🟡/🔴> · L3 warm (cost-per-purchase): <grade> · L2 awareness (reach/CPM/freq): <grade>

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

- `retrospective` written to the ad `channel_plan` (markdown) — or the graceful no-data note when no ad performance has been ingested
- No gate flipped (Measure is ungated)

## Governance

- **Synthesis + save only.** Writes only via `save_channel_plan` (the `retrospective` field). No writes to performance tables, no `approve_*`, no content writes, no idea/schedule writes.
- **No gate.** Measure is the one ungated step; `retrospective` is propose-state output, never an approval. The skill never sets `tactics_approved`, `approaches_approved`, or `approved`.
- Reads the **ingested** ad performance via `get_ad_performance`; never triggers ingestion (`pull_*`) and never fabricates metrics. The `get_performance_analysis` digest is optional cross-channel context only — a null there is NOT a no-data condition.
- Records "no prior ad performance this cycle" gracefully only when `get_ad_performance` returns no rows — never invents spend/CTR/cost-per-result.
- Every "winning"/"fatigued" claim is grounded in an actual ingested metric from `get_ad_performance`.
- **KPI is tier-locked.** Cost-per-purchase grades ONLY the conversion tiers (L1, L3); L2 omnipresence is graded on reach/CPM/ThruPlay/frequency and warm-pool contribution — NEVER on cost-per-purchase (grading L2 on cost-per-purchase mis-kills the funnel-nurture tier). Per-tier thresholds are read live from `ad/strategy` + `ad/campaign-architecture` (KB wins over any inline number).
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. Output goes only to the ad `channel_plan`'s `retrospective`.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state, and never writes to a different period's plan.
- Requires `edit` capability (plus `view` for the `get_ad_performance` / `get_performance_analysis` / `get_channel_plan` reads).
