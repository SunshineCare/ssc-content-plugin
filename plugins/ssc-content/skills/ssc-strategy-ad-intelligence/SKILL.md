---
name: ssc-strategy-ad-intelligence
description: Diagnoses the Vietnamese meal-replacement / weight-loss ad market (awareness stage + sophistication) and assesses Cambridge Diet VN's own paid angles — grounded in our ACTUAL ingested ad-set performance (get_ad_performance: spend, CTR, cost-per-result) alongside the angle KB and a competitor scan. Flags fatigued/inefficient angles and winning ones. Saves findings via save_strategy_finding (dimension=ad_market).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, search_knowledge, get_ad_performance, save_strategy_finding, WebSearch]
---

# Ad Intelligence (`ssc-strategy-ad-intelligence`) — FR-017

You diagnose the Vietnamese weight-loss ad market (awareness level, sophistication,
dominant competitor angles) **and** assess Cambridge Diet Vietnam's own paid angles
against **real performance**. You save findings to the strategy brief. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

> **Two layers, two sources.** The *market* read (awareness / sophistication /
> competitor angles) is external and comes from `WebSearch` + the KB. The *our-account*
> read (which of our angles are winning vs fatiguing) comes from `get_ad_performance` —
> the **ingested** per-ad-set metrics for our own account. `get_ad_performance` reflects
> what's been ingested into Brand OS; it does **not** fetch live and you **never** trigger
> ingestion (`pull_all_ad_performance`). If it returns no rows, our ad data simply hasn't
> been ingested (commonly no connected ad account) — fall back to the winners/losers KB.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/angles` — the canonical ad+content angle library (single source of truth: the Dimensions → Angle → Frame model)
- `brand/personas` — each persona's prioritised ad approaches (`Góc tiếp cận ưu tiên`, #1–#9)
- `ad/strategy` — ad strategy guiding principles + persona × layer angle deployment (§2)
- `ad/layer-tones` — the L1/L2/L3 awareness-layer tone & CTA model
- `brand/proof-points` — credibility signals
- `winners/curated-index` — angles/copy proven to work
- `losers/index` — angles already retired as fatigued/failed (do NOT re-flag these)

### Step 2: Diagnose market awareness level

Using Eugene Schwartz's 5 Levels of Awareness, assess where the Vietnamese weight-loss /
meal-replacement market currently sits:

1. **Unaware** — audience doesn't know they have a problem
2. **Problem-aware** — know they struggle with weight but don't know solutions
3. **Solution-aware** — know diet programs exist but haven't evaluated Cambridge Diet
4. **Product-aware** — have heard of Cambridge Diet but haven't decided
5. **Most aware** — warm leads/existing users

Search signals (substitute `<years>` with the current and prior year from `period`, e.g. `2026-Q3` → `2026 2025`):
- `WebSearch("Facebook Ads giảm cân Việt Nam <years> phổ biến")`
- `WebSearch("quảng cáo thực phẩm chức năng giảm cân Facebook Việt Nam nội dung gì")`

Assess: are most FB ads problem-aware (hook on pain) or product-aware (hook on solution comparison)?

### Step 3: Assess market sophistication

Count how many direct competitors run similar angles. The higher the count, the higher the
sophistication — meaning **bold new angles are needed to cut through**.

### Step 4: Read OUR actual paid performance (`get_ad_performance`)

Read the ingested per-ad-set metrics for our own account — this is the ground truth of which
of our angles are working, not a guess:

```
get_ad_performance  level: adset   window_days: 90   limit: 50
```

Each group returns `name` (ad-set, which encodes the angle/layer — e.g. "L3 Retarget",
"BOFU", "5-10kg", "Message"), `status` (ACTIVE/PAUSED), `spend`, `impressions`, `ctr`,
`clicks`, `conversions`, `cost_per_conversion`, `purchases`, `cost_per_purchase`,
`messaging_conversations`, `cost_per_message`, `ads_counted`. Compute relative to the set
of ad-sets:

- **Winning paid angles** — low `cost_per_conversion` / `cost_per_purchase` / `cost_per_message` **and** healthy `ctr` vs the others. These are proven — `winners/<angle-slug>` candidates; protect/scale them.
- **Inefficient / fatiguing paid angles** — high `spend` with poor (high) cost-per-result and/or below-peer `ctr`. These are the **data-backed** fatigue signal.
- Note `status`: don't flag an already-`PAUSED` set as a live problem.

Map ad-set names back to `brand/angles` so findings name the **angle**, not just the ad-set.
If `get_ad_performance` returns **no rows**, our paid data isn't ingested (e.g. no connected
ad account) — say so and fall back to the winners/losers KB for the fatigue read below. Do
**not** call `pull_all_ad_performance` (ingestion is out of scope for this skill).

### Step 5: Identify angle fatigue

Combine the real performance (Step 4) with the angle library and competitor scan. Flag an
angle as fatigued when:
- **Performance says so (primary):** high spend + rising/poor cost-per-result + below-peer CTR in `get_ad_performance` (Step 4).
- It has been in active rotation >3 months (heuristic, secondary).
- It is used by 2+ competitors (undifferentiated).

Cross-check `losers/index` first — skip angles already retired there. A newly-confirmed
fatigued angle (ideally evidenced by its ad-set metrics) is a `losers/<angle-slug>`
candidate; note it in the finding so the operator can capture it (propose-only — this skill
does not write KB docs). When `get_ad_performance` was empty, judge fatigue from
`losers/index` + absence from `winners/curated-index` and say the read was KB-only.

### Step 6: Save findings

Self-rate each finding before saving: `score` — an integer 1–5 for how strong/actionable this signal is (evidence quality — real `get_ad_performance` metrics outrank KB-only inference — plus strategic relevance this cycle) — and a one-line Vietnamese `comment` explaining that score. This is a signal-strength rating for the operator's curation (Mark for brief vs dismiss) in the Strategy dashboard, not a pass/fail gate — every finding is saved regardless of score; nothing is dropped or regenerated for a low score.

For the market diagnosis:
```
dimension: ad_market
brief_id: <brief_id>
title: "Market awareness diagnosis — Level <N>: <label>"
detail: <2-3 sentence reasoning: why we assess this level, what ad patterns confirm it>
evidence: { awareness_level: <1-5>, sophistication: "high|medium|low", dominant_hook: "<pain|aspiration|social-proof|science>" }
track: proven
score: <1–5 self-rating>
comment: <one-line Vietnamese rationale for the score>
```

For each **winning paid angle** (from Step 4):
```
title: "Winning paid angle — <angle name>"
detail: <which ad-set, why it wins (cost-per-result + CTR vs peers), recommend protect/scale>
evidence: { source: "ad_performance", adset: "<name>", metric: "cost_per_purchase|cost_per_conversion|ctr", value: "<n>" }
track: proven
score: <1–5 self-rating>
comment: <one-line Vietnamese rationale for the score>
```

For each **fatigued angle**:
```
title: "Angle fatigue — <angle name>"
detail: <why it's fatigued (cite the ad-set metric when available), recommended action: retire / refresh / test new hook>
evidence: { source: "ad_performance", adset: "<name>", metric: "cost_per_result|ctr|spend", value: "<n>" }   # omit when KB-only
track: proven
score: <1–5 self-rating>
comment: <one-line Vietnamese rationale for the score>
```

For each gap or opportunity:
```
title: "Angle gap — <opportunity name>"
detail: <the angle no competitor is owning, why it fits CDV's positioning>
track: proven
score: <1–5 self-rating>
comment: <one-line Vietnamese rationale for the score>
```

If no new signals: `title: "Ad market — no new signals this cycle"` — omit `score`/`comment` (there is nothing to rate).

### Step 7: Output summary

```
## Ad Intelligence — <period>

**Market awareness: Level <N> — <label>**   ·   **Sophistication: <high|medium|low>**
**Our paid read:** <N ad-sets from get_ad_performance | KB-only (no ad data ingested)>

### Winning paid angles (protect / scale)
- <angle> — <ad-set>: <cost-per-result + CTR>

### Fatigued angles (retire / refresh)
- <angle>: <reason — cite metric when available>

### Untapped angle opportunities
- <opportunity>: <rationale>

### Recommended awareness layer for next cycle
L1 / L2 / L3 — <rationale>

Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title`, `detail`, and `comment` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no new signals" fallback. The structured `evidence` values (awareness_level, sophistication, dominant_hook, source, adset, metric, value, slugs) and the `dimension` / `track` enums stay as their literal codes; ad-set names and the Vietnamese WebSearch queries stay verbatim; your chat-side reasoning stays English.

## Governance

- Read + save only. Reads our ad performance via `get_ad_performance` (ingested data,
  read-only). **Never** call `pull_all_ad_performance` or any ingestion tool — that hits
  external APIs and needs connected accounts. No content writes.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- An empty `get_ad_performance` means *not ingested* (usually no connected ad account), not
  *no ad activity* — fall back to the winners/losers KB and say so.
- All findings use `dimension: 'ad_market'` and `track: 'proven'`.
- Each substantive finding carries a self-rating (`score` 1–5) + Vietnamese `comment` rationale — a signal-strength signal for the operator's curation, not a pass/fail gate; nothing is dropped for a low score.
- Requires `edit` capability.
