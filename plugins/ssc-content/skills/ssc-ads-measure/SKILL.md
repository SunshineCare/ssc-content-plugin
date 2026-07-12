---
name: ssc-ads-measure
description: Runs the Measure step of the standalone Cambridge Diet Vietnam Ads pipeline. Reads this plan's ACTUAL ingested ad performance (get_ad_performance) and grades each ad-set BY TIER on its locked KPI — cost-per-purchase for the conversion tiers L1 (cold) + L3 (warm/retarget), and reach/CPM/frequency for L2 omnipresence (never cost-per-purchase) — reading the live per-tier thresholds from ad/strategy + ad/campaign-architecture. Synthesises a retrospective (tier grades + winning vs fatigued angles — and, where the winning/losing ad-sets' content is identifiable via get_idea + list_post_content, winning vs fatigued proof points, copy lengths, and formats), writes it to channel_plans.retrospective via save_channel_plan, AND persists the paid-ads section (ad_campaign_health) plus its block of the shared per-period digest via save_performance_analysis, so the digest every later phase reads is no longer empty. Records "no prior ad performance this cycle" gracefully when none has been ingested. Propose-only; no gate. Next month's Focus reads this retrospective to carry winning angles forward and drop fatigued ones; the ad-production writer (ssc-ads-writer) reads it to lean on the proven proof points / lengths / formats and avoid fatigued ones.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_ad_performance, get_performance_analysis, get_knowledge, get_channel_plan, save_channel_plan, save_performance_analysis, get_idea, list_post_content]
---

# Ads Measure (`ssc-ads-measure`)

You run the **Measure** step of the standalone Cambridge Diet Vietnam Ads pipeline. You read the **actual ingested ad performance** from `get_ad_performance`, **grade each ad-set by its TIER on the tier's correct KPI** (a hard rule — see below), translate that into paid-angle learnings (which angles are winning vs fatiguing), and write a **retrospective** onto the ad `channel_plan` via `save_channel_plan(channel='ad', period, retrospective=…)`. The retrospective is markdown prose — which angles worked (carry forward), which fatigued or ran inefficiently (drop or refresh), and what to try next. You then persist the same findings into the **shared per-period digest** (`performance_analyses`) via `save_performance_analysis` — you own its `ad_campaign_health` section, and one named block of its `summary` — which is what `ssc-post-research`, `ssc-strategy-directions` and `ssc-strategy-performance-retrospective` actually read. You only read performance and write those two artifacts; you NEVER hand-author RAW performance rows, trigger ingestion (`pull_*`), call `approve` (any entity), use `edit` to demote/unapprove a row, or produce new content.

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
- **Winning vs fatigued proof points, copy lengths, and formats** — for the clearest 🟢 winners and 🔴 losers, map the ad-set → its slot → its concept(s) (via `detail.slotId`), then read those concepts' content with `get_idea` + `list_post_content` and note which **proof points** the converting copy leaned on, which **copy-length** band performed, and which **format** won vs fatigued. This is a *directional* signal — an ad-set can carry several creatives, so do not over-attribute; where the content isn't identifiable, stay at the angle level and say so. (This is what the ad-production writer, `ssc-ads-writer`, reads back from `retrospective` to lean on proven proof-points/lengths/formats and drop fatigued ones.)

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

### Winning proof points · lengths · formats (carry forward — the writer reads these)
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

Không có dữ liệu hiệu suất quảng cáo nào được nạp vào hệ thống trong kỳ này (chưa có tài khoản quảng cáo kết nối hoặc chưa nạp dữ liệu). Tháng sau, Focus nên tiếp tục dùng các góc quảng cáo đã được KB kiểm chứng (winners/losers), không có tín hiệu hồi cứu mới từ hiệu suất thực.
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
      L1: { grade: "green|yellow|red", kpi: "cost_per_purchase", value: <number>, note: "<Vietnamese>" }
      L2: { grade: "green|yellow|red", kpi: "reach_cpm_frequency", cpm: <number>, frequency: <number>, note: "<Vietnamese>" }
      L3: { grade: "green|yellow|red", kpi: "cost_per_purchase", value: <number>, note: "<Vietnamese>" }
    winning_angles: ["<angle>", …]
    fatigued_angles: ["<angle>", …]
    ltv_cac: <number or null when it cannot be derived from ingested data>
  summary: <the merged digest prose — see below>
```

Include a tier only if you actually graded it; set `ltv_cac: null` rather than
estimating one. Keep the KPI tier-locked exactly as in Step 3 — L2 is **never**
graded on cost-per-purchase, in the digest as in the retrospective.

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

**Điểm theo tầng:** L1 <🟢/🟡/🔴 + số> · L2 <grade + reach/CPM/freq> · L3 <grade + số>
**Góc thắng (giữ lại):** <…>
**Góc mỏi / kém hiệu quả (bỏ hoặc làm mới):** <…>
**Tín hiệu cho tháng sau:** <1-2 câu>
```

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
- `ad_campaign_health` (tier grades + winning/fatigued angles + LTV:CAC) and the `## Quảng cáo (Ads)` summary block written into the shared per-period digest (`performance_analyses`, `status='draft'`) via `save_performance_analysis` — merged into the existing `summary`, never clobbering another skill's block
- No gate flipped (Measure is ungated)

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Synthesis + save only: writes via `save_channel_plan` (the `retrospective` field) and `save_performance_analysis` (the digest's `ad_campaign_health` + your `## Quảng cáo (Ads)` summary block) — no writes to the RAW performance tables (`ad_performance` is ingestion's, not yours), no content writes, no idea/schedule writes.
- **No gate.** Measure is the one ungated step; `retrospective` is propose-state output, never an approval. The skill never sets `tactics_approved`, `approaches_approved`, or `approved`.
- **Saving the digest is NOT an approval.** `save_performance_analysis` always writes `status='draft'` (the tool takes no `status` and cannot mint a `final`), so it flips no gate and stays inside propose-only.
- **The digest is shared — never clobber another skill's block.** Read `summary` in Step 1b, replace/append ONLY `## Quảng cáo (Ads)`, and pass no field beyond `ad_campaign_health` (which you alone own): `youtube_retention` / `conversion_audit` have no producer, and passing either would fabricate a measurement you did not take.
- Reads the **ingested** ad performance via `get_ad_performance`; never triggers ingestion (`pull_*`) and never fabricates metrics. The `get_performance_analysis` digest is optional cross-channel context on the READ side — a null there is NOT a no-data condition — and, on the WRITE side, the row you are contributing `ad_campaign_health` + your summary block to.
- Records "no prior ad performance this cycle" gracefully only when `get_ad_performance` returns no rows — never invents spend/CTR/cost-per-result.
- Every "winning"/"fatigued" claim is grounded in an actual ingested metric from `get_ad_performance`.
- **KPI is tier-locked.** Cost-per-purchase grades ONLY the conversion tiers (L1, L3); L2 omnipresence is graded on reach/CPM/ThruPlay/frequency and warm-pool contribution — NEVER on cost-per-purchase (grading L2 on cost-per-purchase mis-kills the funnel-nurture tier). Per-tier thresholds are read live from `ad/strategy` + `ad/campaign-architecture` (KB wins over any inline number).
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. Output goes only to the ad `channel_plan`'s `retrospective`.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state, and never writes to a different period's plan.
- Reads winning/losing ad-sets' content via `get_idea` + `list_post_content` **only to name the proof points / lengths / formats they used** — read-only, no content writes, and a directional signal (an ad-set may carry several creatives; do not over-attribute).
- Requires `edit` capability (for `save_channel_plan` and `save_performance_analysis`), plus `view` for the `get_ad_performance` / `get_performance_analysis` / `get_channel_plan` / `get_idea` / `list_post_content` reads.
