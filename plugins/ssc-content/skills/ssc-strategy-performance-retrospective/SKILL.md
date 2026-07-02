---
name: ssc-strategy-performance-retrospective
description: Synthesises the prior cycle's performance for Cambridge Diet Vietnam by READING what's already been ingested into Brand OS — the digested per-month analysis (get_performance_analysis), the ingested per-post Facebook metrics (get_post_performance), and the ingested paid-ad metrics (get_ad_performance). Read-only synthesis — it never triggers ingestion (pull_*) and never writes. Only records "no prior performance data" when all three reads are empty. Saves findings via save_strategy_finding (dimension=performance_retrospective).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_performance_analysis, get_post_performance, get_ad_performance, save_strategy_finding]
---

# Performance Retrospective (`ssc-strategy-performance-retrospective`) — FR-018b

You synthesise the prior cycle's performance for Cambridge Diet Vietnam into
content- and ad-strategy learnings for the next cycle. You are **read-only
synthesis**: you READ whatever has been ingested into Brand OS and translate it
into findings. You never trigger ingestion and never write to performance tables.

> **These reads reflect *ingested* data, not the live platforms.** `get_*` returns
> only what has already been ingested into Brand OS — it does **not** fetch live
> from Facebook or the Marketing API. Ingestion is a **separate** concern
> (`pull_fb_performance` for the page, `pull_all_ad_performance` for ads) that hits
> the external APIs, requires connected accounts, and writes snapshots — **this
> skill never calls those.** If a read comes back empty, the data simply hasn't
> been ingested yet (for ads, commonly because **no ad account is connected**, i.e.
> `ad_accounts = 0`) — report that as no-data; do **not** attempt a pull.

You read from **three ingested sources** and combine whatever exists:

1. **The digest** — `get_performance_analysis(YYYY-MM)` reads `performance_analyses`,
   the per-month *structured* analysis (ad-campaign health, YouTube retention,
   conversion audit) written by the performance agent. **Frequently null.**
2. **Ingested organic metrics** — `get_post_performance` reads the per-post Facebook
   metrics already ingested into the `performance` table.
3. **Ingested paid-ad metrics** — `get_ad_performance` reads the per-ad / ad-set /
   campaign metrics already ingested into `ad_performance`. **Empty when no ad
   account is connected or nothing has been ingested.**

> A null digest is **not** "no performance data" — the ingested organic and ad
> reads usually still have rows. Only report "no data" when the digest is null
> **and** `get_post_performance` is empty **and** `get_ad_performance` is empty.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — the **current** review quarter, e.g. `2026-Q3` (you look up the PRIOR quarter's months: `2026-04` / `2026-05` / `2026-06`)

## Procedure

### Step 1: Determine the prior quarter's months

The digest is keyed by **month** (`get_performance_analysis` takes `YYYY-MM`), while
this review is keyed by **quarter**. Resolve the review's `period` to the **prior
quarter's three months**:
- `2026-Q3` (Jul–Sep) → prior quarter `2026-Q2` → months `2026-04`, `2026-05`, `2026-06`
- `2026-Q1` (Jan–Mar) → prior quarter `2025-Q4` → months `2025-10`, `2025-11`, `2025-12`

Quarter → months: Q1 = 01/02/03, Q2 = 04/05/06, Q3 = 07/08/09, Q4 = 10/11/12.

### Step 2: Read the digest (per prior-quarter month)

Call `get_performance_analysis` once for **each** of the three prior-quarter months.
Keep whichever analyses exist. A month returning `{ analysis: null }` just has no
digest — **note it and move on; do NOT stop here.** The ingested raw reads
(Steps 3–4) are read regardless of what the digest returns.

### Step 3: Read the ingested ORGANIC metrics

Call `get_post_performance` (`platform: facebook`, `limit: 100`) — the per-post rows
already ingested into `performance`. Each carries `message` (caption), `media_type`,
`impressions` (= views), `engagement`, reactions/comments/shares, `permalink_url`;
the `summary` gives `engagement_total/avg`, `views_total/avg`.

It returns the **most recent ingested** posts (not month-filtered) — treat it as the
recent organic performance. If `count === 0`, no organic data has been ingested —
note it; **do not** call `pull_fb_performance` (that is ingestion, not this skill's job).

### Step 4: Read the ingested PAID-AD metrics

Call `get_ad_performance` (`level: adset`, `window_days: 120`, `limit: 50`) — the
aggregated spend / impressions / reach / clicks / conversions / purchases /
messaging_conversations per ad-set already ingested into `ad_performance`, sorted by
spend. (Use `level: 'ad'` to drill into the worst/best ad-sets, `level: 'campaign'`
for the top view.)

`get_ad_performance` is a **lookback over ingested snapshots** (`window_days: 120`
spans the prior quarter with margin) — **not** a live fetch. If it returns **no rows**,
there is no ingested ad data — commonly because **no ad account is connected**
(`ad_accounts = 0`) so nothing has ever been ingested. In that case note "no ad data
this cycle" and rely on the digest + organic sources. **Do not** call
`pull_all_ad_performance` to "fix" an empty read — that is an external ingestion step
(requires a connected account + credentials) outside this skill's scope.

### Step 5: Decide the data status

Report "no prior performance data" **only** when ALL of:
- the digest is null for every prior-quarter month, AND
- `get_post_performance.count === 0`, AND
- `get_ad_performance` returns no rows.

In that case save the single finding
`title: "Hồi cứu hiệu suất — chưa có dữ liệu hiệu suất kỳ trước"`,
`detail: "Không có digest, không có dữ liệu bài đăng đã nạp, và không có snapshot quảng cáo nào đã nạp (có thể chưa kết nối tài khoản quảng cáo). Tiếp tục dùng các góc nội dung đã được KB kiểm chứng, không có tín hiệu hồi cứu mới."`
and skip to Step 8. Otherwise synthesise from whichever ingested sources returned data
— **a null digest is never on its own a reason to report "no data."**

### Step 6: Extract learnings

**Ad / paid signal** — prefer the digest's `ad_campaign_health` when present (per ad-set
Red/Yellow/Green, fatigue, LTV:CAC, the 20% LTV:CAC threshold — FR-051). When it is null
but ingested ad rows exist, compute the equivalent from `get_ad_performance`:
- **Winning ad-sets** — lowest cost-per-result (spend ÷ purchases/conversions/messaging) and healthy CTR (clicks ÷ impressions) → double down; `winners/<angle-slug>` candidate.
- **Failing ad-sets** — high spend, few/no results, low CTR → retire or urgent refresh; `losers/<angle-slug>` candidate.
- Respect `adSetStatus` — don't re-flag an already-paused set as "failing".

**Organic signal** — from ingested `get_post_performance.posts` (+ `summary`):
- **Top performers** — highest `engagement` / `impressions` (views), above the summary averages; read `message` + `media_type` to infer the winning angle/format → `winners/` candidate.
- **Underperformers** — well below the averages → `losers/` candidate.
- **Format signal** — which `media_type` (photo / video / reel) wins.

**YouTube + conversion signal** — from the digest only (`youtube_retention`, `conversion_audit`).
There is no ingested-read fallback for these, so if the digest is null, note "no YouTube /
conversion data this cycle" rather than inferring.

### Step 7: Save findings

For each meaningful learning — ground every claim in a real ingested metric:
```
dimension: performance_retrospective
brief_id: <brief_id>
title: "<what signal> — <keep/refresh/fix>"
detail: <metric observation + what it means for next cycle's content or ad strategy>
evidence: <one of:>
  digest:    { source: "digest",    period: "<month>", section: "ad_campaign_health|youtube_retention|conversion_audit", metric: "<name>", value: "<value>" }
  organic:   { source: "post_performance", permalink: "<post url>", metric: "engagement|views", value: "<n>" }
  paid:      { source: "ad_performance",   level: "adset|ad|campaign", name: "<ad-set/campaign>", metric: "spend|cost_per_result|ctr|purchases", value: "<n>" }
track: proven
```

### Step 8: Output summary

```
## Performance Retrospective — <period>

**Data sources used:** <digest | organic | paid — list those that returned data, or "none">
**Digest months with data:** <e.g. 2026-05, 2026-06 | none>
**Organic posts read:** <N>   ·   **Ad-sets read:** <N (or "0 — no ad data ingested")>

### Keep doing (winning signals)
- <finding — cite digest section / post permalink / ad-set name>

### Refresh or retire (failing signals)
- <finding>

### Conversion fixes for content strategy
- <finding>

Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title` and `detail` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no prior performance data" and "no data this cycle" fallbacks. The structured `evidence` values (source, period, section, metric, value, permalink, level, name) and the `dimension` / `track` enums stay as their literal codes; post permalinks, ad-set/campaign names, and captions stay verbatim; your chat-side reasoning stays English.

## Governance

- **Read + synthesise only.** Never call ingestion tools (`pull_fb_performance`,
  `pull_all_ad_performance`) — those hit external APIs, need connected accounts, and
  write snapshots; they are out of scope. Never author analysis rows, never write
  content. The only write this skill makes is `save_strategy_finding`.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- A null digest is **not** "no data" — read the ingested organic and ad sources before
  concluding. An empty ingested read means *not ingested* (for ads, usually no connected
  account), not *no platform activity* — report it as no-data, don't pull.
- All findings use `dimension: 'performance_retrospective'` and `track: 'proven'`.
- Requires `edit` capability.
