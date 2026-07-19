---
name: ssc-strategy-performance-retrospective
description: Synthesises the prior cycle's performance for Cambridge Diet Vietnam by READING what's already been ingested into Brand OS — the digested per-month analysis (get_performance_analysis), the ingested per-post Facebook metrics (get_post_performance), and the ingested paid-ad metrics (get_ad_performance). It never triggers ingestion (pull_*) and never writes a raw performance row. Only records "no prior performance data" when all three reads are empty. Saves findings via save_strategy_finding (dimension=performance_retrospective) AND writes its cross-source cycle synthesis back into the shared per-period digest via save_performance_analysis (its own summary block, draft) — the write that stops the digest every later phase reads from being permanently empty.
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_performance_analysis, get_post_performance, get_ad_performance, save_strategy_finding, save_performance_analysis]
---

# Performance Retrospective (`ssc-strategy-performance-retrospective`) — FR-018b

You synthesise the prior cycle's performance for Cambridge Diet Vietnam into
content- and ad-strategy learnings for the next cycle. You READ whatever has been
ingested into Brand OS and translate it into findings — you never trigger ingestion
and never write a RAW performance row. You then write your synthesis back into the
**shared per-period digest** (`performance_analyses`) via `save_performance_analysis`:
you own one named block of its `summary`. That write matters — the digest had readers
(you, `ssc-post-research`, `ssc-strategy-directions`) and **no writer at all**, which
is exactly why your own Step-2 digest read is "frequently null".

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
   conversion audit) plus a shared `summary`. **Frequently null for older months** —
   it is written by `ssc-ads-measure` (`ad_campaign_health`), `ssc-post-measure`, and
   by you (Step 7b); months measured before those writers existed have no row at all.
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
(omit `score`/`comment` — there is nothing to rate)
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

Self-rate each candidate finding before saving: `score` — an integer 1–5 for how strong/actionable this learning is (real ingested metric outranks a digest-only inference; a clear signal outranks a marginal one) — and a one-line Vietnamese `comment` explaining that score.

**Quality gate — only score ≥4 is saved.** If a candidate learning rates ≤3, drop it (never save it) and go back to Step 6 for a different metric-grounded learning to replace it; re-score the replacement. Bound this at 2 replacement attempts per slot — if a replacement still can't clear ≥4, drop the slot entirely (save nothing for it) and note the drop in the Step 8 summary. Score honestly; never inflate a weak learning to 4 just to pass the gate.

For each finding rated ≥4 — ground every claim in a real ingested metric:
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
score: <integer 4 or 5>
comment: <one-line Vietnamese rationale for the score>
```

### Step 7b: Persist the cycle synthesis back into the digest

You are the one skill that reads **all three** sources and synthesises across them.
That synthesis has to land somewhere the next cycle can read it — and until now it
did not: `performance_analyses` had readers (this skill, `ssc-post-research`,
`ssc-strategy-directions`) and **no writer at all**, which is exactly why Step 2's
digest read is "frequently null". Close that loop by writing your synthesis back.

**Where:** the digest is keyed by **month** (`YYYY-MM`), your review is keyed by
**quarter**. Write to the **LAST month of the prior quarter** — the one downstream
consumers actually reach for (`ssc-strategy-directions` reads "the most recent
available" prior-quarter month; `ssc-post-research` reads the prior month). For
`2026-Q3` that is `2026-06`.

```
Call: save_performance_analysis
  period: <last month of the prior quarter, e.g. 2026-06>
  summary: <the merged digest prose — see below>
```

**The digest is SHARED — read-modify-write the `summary`, never clobber it.**
`save_performance_analysis` UPSERTS on `period` and applies **only the fields you
pass** (an omitted field keeps its previously-saved value), so several skills compose
one row for the cycle. `summary` is a single text field, though, so each writer owns
exactly ONE named block inside it:

| Block heading | Owner |
|---|---|
| `## Tổng hợp chu kỳ` | **you** (`ssc-strategy-performance-retrospective`) |
| `## Quảng cáo (Ads)` | `ssc-ads-measure` |
| `## Bài viết (Posts)` | `ssc-post-measure` |

Take that month's `summary` as you already read it in **Step 2** (`{ analysis: null }`
⇒ treat it as an empty string). Replace your `## Tổng hợp chu kỳ` block if one exists,
or append it if it does not, and leave every other block **byte-for-byte unchanged**.
Pass the whole merged string as `summary`.

Your block is the cross-source synthesis behind the findings you just saved — **in
Vietnamese**, headings included (the persisted-prose convention; your chat-side
reasoning stays English):

```
## Tổng hợp chu kỳ (<period>)

**Nguồn dữ liệu:** <digest | organic | paid — những nguồn có dữ liệu, hoặc "không có">

**Giữ lại (tín hiệu thắng):** <…>
**Làm mới / bỏ (tín hiệu thua):** <…>
**Tín hiệu cho chu kỳ sau:** <1-2 câu>
```

**Pass NOTHING but `period` and `summary`.** Do **not** pass `ad_campaign_health` —
`ssc-ads-measure` owns that field and re-writing it from a 120-day lookback would
overwrite its tier-locked, per-month grading with a coarser one. Do **not** pass
`youtube_retention` or `conversion_audit` either: you have **no read** for YouTube or
conversion (Step 6 says so explicitly), so any value — including a `null` meaning "no
YouTube data" — would be a measurement you never took. Omitting a field preserves
whatever another writer stored.

The digest row is always written as a **`draft`** — the tool takes no `status` and
cannot mint a `final`. Saving it is not an approval, promotes nothing, and flips no
gate; it stays inside propose-only. In the Step-5 **no-data case**, skip this step
entirely: there is no synthesis to persist and an empty block is worse than none.

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

Findings dropped (rated ≤3, no ≥4 replacement found): <N>
Findings saved: <N>
Cycle synthesis saved to the digest: <YYYY-MM (block `## Tổng hợp chu kỳ`, draft) | skipped — no data>
```

## Output language

**Write the finding prose in Vietnamese.** `title`, `detail`, and `comment` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no prior performance data" and "no data this cycle" fallbacks. The structured `evidence` values (source, period, section, metric, value, permalink, level, name) and the `dimension` / `track` enums stay as their literal codes; post permalinks, ad-set/campaign names, and captions stay verbatim; your chat-side reasoning stays English.

## Governance

- **Read + synthesise only.** Never call ingestion tools (`pull_fb_performance`,
  `pull_all_ad_performance`) — those hit external APIs, need connected accounts, and
  write snapshots; they are out of scope. Never hand-author a RAW performance row
  (`performance` / `ad_performance` belong to ingestion), never write content. This
  skill makes exactly two writes: `save_strategy_finding` (the findings) and
  `save_performance_analysis` (your `## Tổng hợp chu kỳ` block of the digest).
- **Saving the digest is NOT an approval.** `save_performance_analysis` always writes
  `status='draft'` (the tool takes no `status` and cannot mint a `final`), so it
  promotes nothing and flips no gate — it stays inside propose-only.
- **The digest is shared — never clobber another skill's block.** Read the month's
  `summary` in Step 2, replace/append ONLY `## Tổng hợp chu kỳ`, and pass no field
  beyond `period` + `summary`: `ad_campaign_health` is `ssc-ads-measure`'s, and you
  have no YouTube or conversion read at all, so writing `youtube_retention` or
  `conversion_audit` — even as `null` — would assert a measurement you never took.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- A null digest is **not** "no data" — read the ingested organic and ad sources before
  concluding. An empty ingested read means *not ingested* (for ads, usually no connected
  account), not *no platform activity* — report it as no-data, don't pull.
- All findings use `dimension: 'performance_retrospective'` and `track: 'proven'`.
- Every candidate finding is self-rated before saving; only findings rated ≥4 are persisted via `save_strategy_finding`. A candidate rated ≤3 is dropped and replaced with a different metric-grounded learning (bounded at 2 attempts per slot) — never saved, never inflated to pass.
- Requires `edit` capability (for `save_strategy_finding` and `save_performance_analysis`).
