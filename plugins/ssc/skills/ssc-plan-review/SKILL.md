---
name: ssc-plan-review
description: Runs the REVIEW step of the Cambridge Diet Vietnam monthly plan head — the system's ONLY look-back, and the first of the Plan stage's four steps (Review → Tactics → Research → Narrative). Review learns WHICH TOPICS LAND, and POSTS are its primary evidence: the organic page is where a topic earns attention on its own merit, so the post lens ranks topic terms (pillar, entry, frame, journey_stage, persona, value, format, against) on ENGAGEMENT RATE, never on absolute counts. It reads THREE SEPARATE LENSES that are never blended into one score — (1) ORGANIC POSTS, the topic verdict; (2) BOOSTED POSTS, read as its own lesson about what money did to a topic's reach and resonance, never merged into the organic rate and never graded on an ad tier; (3) ADS, read BY LAYER first (L1/L2/L3, each on its OWN KPI — L2 on CPM + volume + continuity and NEVER on cost-per-purchase; L1/L3 on cost per PURCHASE, with cost per conversion demoted to diagnostic), then as a secondary signal on the narrow persona/route vocabulary the ad briefs carry. THE PERFORMANCE DATA IS THE AUTHORITY and content mapping only ENRICHES it: every lens is first read across its FULL population — ranking the rows themselves and reading the actual copy of the winners and losers — so a row that maps to no content is evidence without a label, never evidence to discard. It does NOT compare post performance against ad performance — they answer different questions on different denominators, and a blended per-term score is forbidden. Writes a McKinsey-style MARKDOWN report to month_plans.performance_review via save_month_plan — the column is markdown, NOT jsonb, so the report IS the column value with no structured envelope and nothing machine-readable. Answer-first and MECE across eight sections: §1 the conclusion before any evidence, §2 EXACTLY THREE lessons written as claims with confidence inline, §3–§5 the three lenses, §6 a directive handoff table whose consumers are the three PLAN STEPS ONLY (Tactics / Research / Narrative — channel pipelines read what Tactics decided, never this report), §7 coverage, and an appendix table of ranked terms carrying a PROPOSED scale | maintain | drop or an explicit em-dash when no post-lens evidence exists — the skill proposes a disposition and the OPERATOR decides it; a disposition is never presented as settled and never acts on itself. Ranks the five per-asset COVERAGE-AXIS kinds — lead type, opening frame, proof device, register, length band — in the SAME single ranking as the existing kinds (pillar, persona, route, angle, layer), read from `get_term_performance`'s one `terms[]` list, with no second read, no separate axis section and no per-term score or rank number. Reads that read's top-level `untagged[]` bucket — one row per kind, `pieces` beside `tagged_pieces` — and states the untagged volume beside every axis ranking: untagged work (assets produced before the axes were recorded) is EXCLUDED from the axis ranking, NEVER counted as zero and NEVER dropped from the denominator, so a period that is mostly legacy reads as mostly legacy rather than as a confident ranking over a handful of tagged assets. `untagged` is NOT `unattributed` — the two are different failures and both are reported. Every per-axis figure is OBSERVATIONAL, never causal: delivery is not randomised across assets and axis interactions are not observable, so an axis that appears to win may simply have been given the better briefs. Because nothing is machine-readable, §6 is the ONLY carrier — a lesson not written there reaches no later step — and every number a later step needs must appear in the text. A section that cannot be answered STAYS and states 'không đủ dữ liệu'; it is never dropped and never filled from another lens. Carries every coverage degradation into the artifact rather than smoothing it: an uncovered date is UNKNOWN and never zero, conversions at/after provisional_from are labelled provisional, a boundary-straddling or genesis page segment is reported whole and excluded and never apportioned, and an incomplete lens is marked as not a settled measurement. Attributes performance to terms by MATCHING CONTENT (the content_id FKs are empty in practice, and the copy corpus's exact-hash bridge reaches only a fraction of what normalised matching does) and reads terms from BOTH idea_terms (posts) and the brief's persona/route/layer columns (ads); consults the server's copy corpus via search_copy for metrics that arrive ALREADY JOINED (ad spend/cpa, post engagement_rate, content brief_id) and NEVER recomputes a figure the rollup already carries, because a second copy of the join rules is how spend starts disagreeing with itself; counts a piece of content ONCE even when both published and boosted; reports what it cannot attribute as noted-only free text that NEVER auto-mints a taxonomy term. Reads the prior period's performance_analyses digest when one exists and treats it as authoritative — but NEVER writes, upserts or replaces it (that stays owned by the quarterly retrospective). Records the absence gracefully when the prior period has no data. Propose-only; sets no gate — the month's only approval is the Narrative, a human dashboard action.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: plan
  capability: edit
  tools: [get_month_plan, get_performance_range, get_ad_performance, get_post_performance, get_performance_analysis, get_term_performance, get_content_gaps, search_copy, list_taxonomies, get_brief, get_idea, list_content, save_month_plan]
---

# Monthly Plan — Review (`ssc-plan-review`)

You run the **Review** step of the Cambridge Diet Vietnam monthly plan head — the
**first** of the Plan stage's four steps (**Review → Tactics → Research →
Narrative**), and the **system's only look-back**. No per-channel retrospective
exists anymore; every channel's Measure step was removed and folded into you.

## What Review is for

**Review exists to learn which TOPICS land — and posts are how you learn it.**

The organic page is the one place a topic has to earn attention **on its own
merit**, with no budget behind it. That makes posts the primary evidence about
subject matter: which entry point, which frame, which objection, which pillar
actually holds people. Write the ranked topic terms, each with a
**disposition**, to `month_plans.performance_review` via `save_month_plan`.

**You are NOT comparing posts against ads.** That comparison is meaningless and is
explicitly not this step's job: a post is trying to earn engagement, an ad is
trying to buy a conversion, and their metrics sit on different denominators. Never
put a post metric and an ad metric in the same ratio, the same ranking column, or
the same per-term score.

**You rank TERMS, not metrics** — the judgement that survives is "this topic is
worth **scaling / maintaining / dropping** next month", with the evidence shown
**per lens**, never fused into one number.

**You PROPOSE the disposition; the operator DECIDES it.** Ranking is this step's
work, but `scale` / `maintain` / `drop` is a **proposal written into the
artifact for a human to act on**, never a decision the step makes and never
something that takes effect by being written. Nothing downstream is retired,
demoted or amended because a ranking said so — doctrine and taxonomy change only
at the quarterly cycle, by a human act. Write dispositions as what the evidence
supports; never as what has been settled.

**The figures are OBSERVATIONAL, never causal.** Delivery is **not randomised
across assets** and axis interactions are **not observable**, so every figure
here describes what was observed *beside* a term, never what a term *produced*.
A term that appears to win may simply have been given the better briefs, the
better budget or the better audience. Never write that a term, a lead, a frame,
a device, a register or a length *caused*, *drove*, *lifted* or *produced* a
result — write that it was observed alongside one. This qualification is
mandatory in the persisted report, not optional colour.

## The three lenses — read separately, never blended

| Lens | Question it answers | Ranked on | Weight |
|---|---|---|---|
| **1. Organic posts** | Does this topic land on its own merit? | **Engagement RATE** | **Primary — the topic verdict** |
| **2. Boosted posts** | What did money do to this topic? | Reach gained **vs** engagement rate lost | **Its own lesson** |
| **3. Ads** | Which persona/route converts? | Conversions / cost per result | **Secondary, narrow vocabulary** |

### Lens 1 — Organic posts: the topic verdict

This is the heart of the step. Rank on **engagement rate**, **never on absolute
counts** — a post that reached 20,000 people and a post that reached 200 are not
comparable on raw reactions, and ranking by totals just re-discovers which posts
got distribution.

Posts carry the **rich topic vocabulary** — `pillar`, `entry`, `frame`,
`journey_stage`, `persona`, `value`, `format`, `against`. This is what "good and
bad topics" is actually made of, and it exists on the post side only.

**The page-side rate caveat:** `engagement_rate` is engagement ÷ `post_media_view`,
and media views are **NOT deduplicated by person**. Write it as *interactions per N
media views* — never as "% of people who engaged".

### Lens 2 — Boosted posts: a lesson in its own right, never folded in

A boosted post is **not** an ad and **not** an organic post. It is the same topic
with money behind it, and the comparison between its reach and its engagement rate
is one of the most useful things this Review produces.

- **Report boosted separately from organic. NEVER average the two into one rate**
  for a term — that destroys the finding.
- Read **both halves**: what the budget *bought* (reach/views) and what it *did to
  resonance* (engagement rate vs the organic baseline).
- A boosted post whose engagement rate falls well below the organic baseline means
  **money bought reach, not interest** — the topic was pushed to people it does not
  speak to. Say that plainly; it is a signal about targeting, not about the topic.
- A boosted post that **holds** its engagement rate at much larger reach is the
  strongest possible evidence the topic is worth scaling.
- **NEVER assign a boosted post an ad tier (L1/L2/L3).** It has no declared
  `target_layer`; inventing one fabricates a declared value.
- Page metrics on a boosted post are the **unmodified totals inclusive of paid
  delivery** — no organic/paid split of them exists. Never subtract, never estimate
  an organic remainder.

### Lens 3 — Ads: secondary, and a much narrower vocabulary

Ads inform **only** the terms their briefs carry — `persona`, `route`,
`target_layer`. They say nothing about pillar, frame, entry point or journey
stage, because ad briefs do not tag those.

Use the ad lens to answer "which persona/route converts", and let the post lens
answer "which topic lands". **When the two disagree, that is a finding, not a
conflict to resolve** — a topic can earn engagement and not convert, or convert
without engaging. Report both readings and let the operator judge.

#### The ad lens is read BY LAYER first — L1 / L2 / L3

**Always group the ad side by campaign layer before anything else.** Each layer
has a different job and therefore a **different KPI**; a single ranking across all
ads compares work that was never trying to do the same thing.

Resolve the layer from the brief's `target_layer_term_id` where a brief maps, and
otherwise from the campaign/ad-set's deployment-time name (`L1` / `L2` / `L3`).
When neither resolves, report the group as **`chưa rõ lớp`** — never guess, and
never default it to a layer.

| Layer | Job | Graded on | NEVER graded on |
|---|---|---|---|
| **L1 — Chuyển đổi** (cold) | Qualified volume from cold audiences | Cost per conversion, CTR | — |
| **L2 — Awareness / Omnipresence** | Cheap continuous reach that feeds the warm pool | **CPM**, delivery volume, **continuity** (days delivered) | **Cost per purchase** |
| **L3 — Tái chuyển đổi** (warm/retarget) | Converting the warm pool | **Cost per purchase**, cost per conversion | — |

**The single most important rule of the ad lens: L2 is NEVER graded on
cost-per-purchase.** An L2 layer producing large cheap delivery and ~0 purchases
is performing its role correctly. Grading it on purchases "phạt oan" — wrongly
penalises it — and kills the layer that feeds every later conversion.

**Compare layers only on what they share** (spend share, delivery, continuity).
Never rank L1 against L2 against L3 on one metric, and never compute a blended
cost-per-purchase across layers.

**For L1 and L3 the VERDICT metric is COST PER PURCHASE — not cost per
conversion.** A conversion (message / form fill) is an intermediate operational
signal, never the verdict, and grading a conversion layer on it rewards ads that
generate cheap enquiries which never buy. In one measured period L1 produced
1,239 conversions and **2 purchases** (0.16%) while L3 produced 583 conversions
and **5 purchases** (0.86%) — a ranking on conversions would have inverted the
reading entirely.

**Check purchase COUNT before ranking anything on cost-per-purchase.** Purchases
are rare; a per-ad figure resting on 1–2 purchases measures that ad's spend, not
its creative. When most ads have zero purchases:

- **Do NOT rank hooks/creatives on cost-per-purchase.** Say plainly there are too
  few purchases to rank, and list the ads that produced one as *"ads that
  produced a purchase"* — never as a ranking.
- **Prefer the conversion→purchase RATE at layer level**, which rests on the far
  larger conversion base and is the sturdier comparison between layers.
- **Cost per conversion drops to DIAGNOSTIC only** — usable to spot within-layer
  spread and hook-to-layer mismatch, never to issue a verdict. Label it as such.
- **Check how many purchases are provisional** (`provisional_from`). A ratio
  resting on 1 settled purchase is directional at best; say so.

**Cost per conversion / per purchase is a WITHIN-LAYER metric. Never pool it.**
This binds every ad ranking you produce, not just the layer table:

- **Never rank hooks, creatives, personas or routes on a cost figure pooled
  across layers.** L1 buys from a cold audience, L3 from a warm one, L2 is not
  buying conversions at all — a pooled ranking silently rewards whatever ran in
  the easiest layer, and reads as a creative finding when it is a layer artifact.
- **Rank inside each layer separately**, and report the **spread within each
  layer** (best ÷ worst). The spread is itself a finding: a wide spread means
  creative choice is a real lever in that layer; a narrow one means it is not.
- **The same copy can invert between layers.** Check any copy that ran in more
  than one layer and report the swing, because "which hook is best" has **no
  layer-independent answer**. A brand-credential hook may be the worst in L1 and
  perfectly fine in L3 — that is a **hook-to-layer matching** finding, never
  "this hook is bad".
- When a cost figure must be quoted outside its layer, **name the layer beside
  it**, every time.

**Frequency stays unavailable.** The ad reads emit `reach_day_sum`, a day-sum of a
non-additive metric — never divide by it. When the L2 rubric calls for frequency,
say **"tần suất không khả dụng"** and grade L2 on CPM, volume and continuity.

Grade tiers on `by_class.paid_only` only — boosted ads belong to the boost class
and carry no declared layer.

## Inputs

- `period` — the month being planned, `YYYY-MM` (e.g. `2026-08`). You measure the
  **prior** period.
- `version` — the head's current version, for the optimistic-concurrency guard.
  Never assume it; use what the agent read.

## The two hard rules

### Rule 1 — The lenses never merge

`get_performance_range` returns an **`ads`** side and a **`page`** side. They
count **different events on different denominators**: the ad side counts delivery
impressions; the page side counts media views, **not deduplicated by person**.

- **Never** compute, persist, or display any figure that sums across the two
  sides. There is no cross-side total, and none may be inferred.
- **Never** derive one side by subtracting the other. There is no "organic
  remainder" — Meta removed the post-level organic/paid split on 2025-11-15, so
  page metrics are the **unmodified totals inclusive of any paid delivery**.
  Subtracting the ad side from them produces a fabricated number.
- **`reach_day_sum` is NOT reach.** It is the SUM of each day's unique reach — a
  person reached on ten days counted ten times. Quote it only as a labelled upper
  bound (Vietnamese: **"tổng tiếp cận cộng dồn theo ngày — KHÔNG khử trùng lặp
  theo người"**), **never** as people reached, and **never as a denominator**.
- **Never report a frequency.** `impressions ÷ reach_day_sum` is not one — it
  understates the real figure by roughly the number of delivering days, so it
  reads healthiest exactly when the audience is most burned. No read on this
  surface exposes period reach, so the honest output is **"tần suất không khả
  dụng"**. An explicit gap is correct; a plausible wrong number is the defect.

Each ranked term therefore carries **per-lens figures** — `organic`, `boosted`,
`ads` — never one scalar. A term measured on only one lens says so, and a term
measured on **no** post lens is explicitly marked as having **no topic verdict**
(the ad lens alone cannot supply one).

**Specifically forbidden:**

- Averaging organic and boosted engagement rates into one rate for a term.
- Any ratio, column, or score putting a post metric and an ad metric together.
- Ranking topics by absolute engagement, reach, or views instead of by rate.
- Presenting an ad-lens-only term as if its topic had been validated.

### Rule 2 — State degradation, never smooth it

Read the coverage signals **before** quoting any total, and carry them into the
artifact:

| Signal | What it means | How you report it |
|---|---|---|
| `ads.days_uncovered[]` | Dates no successful ingestion run spanned | **UNKNOWN — never zero.** Any date here means the totals under-count by an unknown amount. |
| `ads.provisional_from` | Date at/after which Meta may still restate conversions/purchases | Label those conversion and purchase figures **provisional**. Spend/impressions/clicks for a closed day are settled. |
| `page.excluded[]` | Segments not attributable to the range — boundary-straddling spans, and each post's `genesis` snapshot | Report **whole**, with the reason. **Never divide** a straddling span between periods. |
| `complete` (per side) | Whether that side is a settled measurement | When false, **state the degradation** beside the figure. Never present it as measurement. |
| `coverage.last_step_success_at` | Per-step ingestion success | A healthy page snapshot never vouches for a failed ad pull. Read them separately. |

**Never trigger ingestion to improve a reading.** `pull_fb_performance`,
`pull_all_ad_performance` and `pull_fb_ad_hierarchy` are operator/worker actions.
You report what has been ingested.

## Procedure

### Step 1: Bound the prior period and read its coverage

Compute the prior period by decrementing `period` one calendar month
(`2026-08` → `2026-07`), then read the explicit range:

```
Call: get_performance_range
  since: <first day of prior period>
  until: <last day of prior period, or the last ingested day when the month is still running>
```

Hold `ads.days_uncovered`, `ads.provisional_from`, both `complete` flags,
`page.excluded[]` and `coverage.last_step_success_at`. **These gate everything
you report.** If the range's tail is uncovered because the month has not finished
ingesting, say so and name the actual measured span rather than implying the
whole month was read.

**No data at all on either side** → the prior period is unmeasured. Skip to
Step 6 and write the graceful no-data Review. This is a normal first-period
state, not an error.

### Step 2: Read the prior period's digest — read only

```
Call: get_performance_analysis
  period: <prior period>
```

When an analysis exists, treat it as the period's **authoritative summary** and
ground your `summary` in it, adding the term ranking it does not carry.

**You NEVER write it.** `save_performance_analysis` is not yours — the digest is
owned by the quarterly retrospective phase. Creating or updating it here would
have two owners writing one row. When none exists, proceed from the reads alone
and **record in the artifact that no digest existed**.

### Step 3: Read the three lenses — POSTS FIRST

**Read the post side first. It is the primary evidence, not a supplement.**

**Step 3a — the page read (lenses 1 and 2)** —
`get_post_performance(limit=100, platform='facebook')`. Each row carries its
`class` (`organic_only` | `paid_only` | `boosted` | `unknown`) and, when boosted,
its linked `ad_ids` and lifetime `ad_metrics`.

**Split the rows by `class` immediately and keep them apart for the whole step:**

- `organic_only` → **lens 1**, the topic verdict. Rank on `engagement_rate`.
- `boosted` → **lens 2**, its own lesson. Never merged into lens 1's rate.
- `paid_only` → not on this read at all (see below).
- `unknown` → report as undetermined; never grade it as if its class were known.

**Establish the organic baseline engagement rate first** — the median (or mean,
stated) `engagement_rate` across `organic_only` rows. Lens 2 is read **against**
this baseline: a boosted post's rate is only meaningful next to what the same page
earns without money. Without the baseline there is no boost lesson, only a number.

**Step 3b — the ad read (lens 3, secondary)** —
`get_ad_performance(level='adset', window_days=<span>)`. Each group carries
`class`, `class_counts` and `by_class` (the same metrics split per class). Read
`classification.linkage_populated` and `classification.authoritative` first:
**treat organic/paid classes as authoritative only when both are true**, and when
they are not, say plainly that classification was not authoritative this period
rather than presenting the splits as clean.

Grade tiers on `by_class.paid_only` only — a boosted ad belongs to the boost class
and has no declared tier. **L2 is never graded on cost-per-purchase.**

Notes that bind the page read:

- **`class` is the ONLY authority** for a page post's class. The legacy
  `is_boosted` column is always null and can disagree — **never read it**.
- `paid_only` is **structurally always 0** on the page read: a dark post has no
  page row. That zero is meaningless and is **never** evidence that no dark posts
  ran. Dark-post metrics live on the ad side.
- `ad_metrics` on a page row is a **lifetime** sum (this read takes no date
  range). Never use it as a per-period figure; cite it, if at all, as labelled
  lifetime context.

### Step 3c: Read each lens ON ITS OWN — the performance data is the authority

**This step runs BEFORE attribution and does not depend on it.** Performance rows
are the source of truth about what happened. Mapping to content **enriches** a row
with taxonomy labels; it is **not** the licence to learn from it.

A row that maps to no content is **not unattributable evidence — it is evidence
without a label.** It still carries its own text, its own metrics, its own format
and placement, and those alone answer most of what Review needs.

**Never let unmapped volume fall into a bucket that teaches nothing.** In practice
the mapped share is the minority (one measured period: 6 of 55 posts, 11% of ad
spend), so a Review gated on mapping discards most of the month.

For **every** lens, read the full population and derive the patterns directly:

- **Rank the rows themselves** — best and worst by rate (posts) or by cost per
  result (ads), with a volume floor so a 3-view row cannot top the list.
- **Read the actual copy of the winners and losers.** The opening line, the hook
  type, the promise, the register. This is where the real lesson usually is, and
  it needs no taxonomy at all: "posts opening with the reader's own failure beat
  posts opening with product instruction" is a finding you can act on.
- **Compare like with like** — same lens only. Format vs format, placement vs
  placement, hook vs hook.
- **Note when the SAME copy performs differently** across ad sets or placements.
  That is a targeting/delivery finding no content mapping could ever surface.

**Then, where a row does map, attach its terms (Step 4) to sharpen the pattern —
never to replace it.** A term ranking built on a handful of mapped rows is a
weaker claim than a copy pattern read off the whole population; report both and
say which rests on more evidence.

**Ordering rule:** the observed pattern comes first in the report, the term
ranking second. If they disagree, the population-level pattern wins, because it
rests on more rows.

#### `search_copy` — read the rollups, never recompute them

The server keeps a **copy corpus** (`copy_index`) keyed on the text itself, and
`search_copy {query, kind?, channel?, since?, min_spend?, limit, full_text}`
returns each hit with its metrics **already joined**:

| Rollup | Carries |
|---|---|
| `ad` | spend, results, **cpa**, impressions, campaigns, first/last run |
| `post` | views, engagement, **engagement_rate**, permalink |
| `content` | **brief_id**, channel, section, status |

**Where a hit exists, read these figures rather than deriving your own.** The
server owns the join rules; a second copy of them is how `spend` starts
disagreeing with itself between two reports. If a rollup contradicts a figure you
computed, the rollup wins — and say so rather than quietly preferring yours.

**`min_spend` answers "which copy carried real money"** directly, without
re-deriving the ad join.

**Use `pending_count` to state coverage.** It reports corpus entries not yet
embedded — that is your honest denominator, not a number you count yourself.

**It does NOT replace the text matching in Step 4.** The corpus links a piece of
copy to content by **exact text**, so any whitespace or formatting drift between
the deployed ad and the authored content breaks the link. Measured on one period:
the exact-hash bridge reached **12 ads / 1.4M₫**, while normalised prefix matching
reached **38 ads / 6.3M₫** — 3× more. Keep the matching; use the corpus for its
metrics and its `brief_id`.

**Payload discipline:** hits return a 400-char `snippet` by default and `limit` is
capped at 25. Ask for `full_text` only when you genuinely need the whole copy —
ad bodies run to ~3.5k chars and a routine sweep will flood the report with text
you will not quote.

**If `search_copy` is unavailable**, proceed on the direct reads and say the
corpus was not consulted. Never fabricate a rollup.

### Step 4: Enrich with taxonomy terms (where mapping exists)

**Do NOT assume the `content_id` foreign keys carry the attribution.** Both
`performance.content_id` (page side) and `ads.content_id` (ad side) are nullable
and are, in practice, **unpopulated** — they were null on every row when this
skill was written. A Review that walks only the FK reports an empty ranking on a
month that is in fact rankable. **Match on the CONTENT ITSELF.**

Attribution has **two paths, and you use both**, in this order:

**Path A — the FK chain, when it is actually populated.**

```
performance / ads → content_id → content.brief_id → briefs.idea_id → idea_terms → taxonomy
```

Cheapest and most exact. Check whether it yields anything before relying on it.

**Path B — match on the content's text, when the FK is null.** This is the normal
case, not the fallback of last resort.

- **Ad side:** `ads.body` / `ads.headline` hold the deployed ad copy;
  `content.body` holds the copy we authored. Match the ad to its content on that
  text (normalise whitespace; prefer an exact body match, then a headline match).
  From the matched `content`, walk `content.brief_id → briefs`.
- **Page side:** match the page post's message text to `content.body` the same
  way. A page post with no matching content is genuinely unattributable.

**Then read the terms off the BRIEF, not only off `idea_terms`.** This is the
second half of the same mistake: **ad content carries no `idea_terms` rows at
all** — its terms live as columns on the brief:

| Source | Terms it carries |
|---|---|
| `briefs.persona_term_id` | persona |
| `briefs.route_term_id` | route |
| `briefs.target_layer_term_id` | campaign layer (L1/L2/L3) |
| `briefs.awareness_stage` | awareness stage |
| `idea_terms` → `taxonomies` | pillar and every other kind (posts) |

A Review that reads only `idea_terms` sees **zero** ad terms even after matching
correctly. Read both, and resolve every id through `list_taxonomies`.

`get_content_gaps` is a useful cross-check for the pillar kind, but it is
**pillar-only, organic-reach scored, and reports against the FK** — so it will
report "no linked performance data" for a month that Path B can rank. Never treat
it as the whole ranking, and never take its gap message as proof the month is
unrankable.

Four binding rules:

1. **Count a piece of content ONCE per term.** Content both published and boosted
   appears on both sides; its terms receive its contribution **once**, never once
   per lens. Two ads running one piece of content are **one piece**. Report the
   two sides separately under that single term.
2. **Rank leaf terms only** — the idea-level kinds (pillar, persona, route,
   angle, layer) **and** the five per-asset coverage-axis kinds (see below), in
   **one** ranking. Never invent a term, and never promote an emergent topic to
   one: that is a human action.
3. **A text match is evidence, not proof.** Say which path attributed each term
   and how much volume each path carried. A body match is strong; a headline-only
   or fuzzy match is weaker — label it, and never present a matched attribution as
   if it came from a hard FK.
4. **Unattributable performance is surfaced, never dropped.** Volume neither path
   reaches is reported as **noted-only prose beside the ranking** — the share of
   the month the ranking does not explain, stated as a proportion of spend so its
   size is legible. It **never** auto-mints a taxonomy term.

#### The coverage-axis kinds rank in the SAME list — `get_term_performance`

Beyond the idea-level kinds, each produced asset now records its own **coverage
axes**: **lead type**, **opening frame**, **proof device**, **register** and
**length band**. They are ordinary taxonomy kinds, not a separate surface.

```
Call: get_term_performance
  since: <first day of prior period>
  until: <last ingested day of prior period>
  kinds: <the idea-level kinds AND the five axis kinds, in ONE call>
```

- **One `terms[]` list, one ranking.** Axis term rows are structurally identical
  to a pillar row — `term_id`, `kind`, `code`, `label`, `pieces`,
  `content_ids`, a `page` side and an `ads` side. Rank them **alongside** the
  existing kinds; there is **no second call**, no separate axis step and no
  separate appendix table.
- **Never enumerate the axis rosters.** Which lead types, frames, devices,
  registers and length bands exist is the taxonomy's business — resolve every
  term through `list_taxonomies` and the live KB doc. A new proof device or a
  seventh lead must need **no change to this skill**.
- **Every honesty rule above binds these kinds unchanged.** No merged total
  across kinds; **no per-term score and no rank number** (any single scalar
  would have to weigh page views against ad impressions); an **uncovered term is
  uncovered, not zero**; figures at/after `provisional_from` stay labelled
  provisional; and **no frequency** derived from `reach_day_sum`.
- **Read the rollups, never recompute them** — the same rule as `search_copy`.

##### `untagged[]` — legacy volume is reported, never zeroed

The read carries a **top-level `untagged[]` bucket, one row per kind**:
`kind`, `pieces`, `tagged_pieces`, a `page` side (`posts`, `totals`) and an
`ads` side (`ads`, `metrics`).

Assets produced before the axes were recorded carry **no axis term at all**.
They are **excluded from the axis ranking** and reported here instead:

- **Untagged is NEVER zero.** Those assets recorded no choice; a zero would
  measure a decision nobody made. Never give them a term row, and never let one
  appear in the ranking as a poorly-performing value.
- **Untagged is NEVER dropped from the denominator.** State `pieces` and
  `tagged_pieces` **side by side, unsummed** — the server deliberately does not
  pre-sum them into a coverage score, and neither do you.
- **Quote it whenever `pieces` dwarfs `tagged_pieces`.** A `lead_type` ranking
  over three tagged assets out of a hundred and twenty is **not** a ranking of
  the period, and must not read like one. **A period that is mostly legacy must
  read as mostly legacy** — say so in §1 and §7, not only in the appendix.
- **`untagged` is NOT `unattributed`.** They are two different failures and both
  are reported, separately, never merged:

  | Bucket | What it means |
  |---|---|
  | `untagged[]` | The piece **is** linked and **is** ranked — under some *other* kind — but carries no term of **this** kind. Chiefly work produced before that axis existed. |
  | `unattributed` | The volume the ranking does not explain **at all** — a page post with no content link, an ad with no content link, or content carrying no term of any requested kind. |

  A piece approved before the axes existed still carries its pillar: it ranks
  under `pillar` and is **untagged** under `lead_type`. Never describe one bucket
  with the other's words, and never add their figures together.

**The observational rule binds every axis figure.** Delivery is not randomised
across assets and axis interactions are invisible, so an axis value that appears
to win may simply have been given the better briefs. Report the axis ranking as
**an observation**, and pair it with the untagged share so its weight is legible.

**Report the ranking's coverage honestly.** State what share of the period's spend
and page volume the ranking actually explains — a ranking covering 11% of spend is
useful but must not read as the whole month.

**A thin term ranking is NOT a thin Review.** Step 3c already read every lens on
its own, so the month still taught whatever the population showed. Lead the report
with those observed patterns and note plainly how few rows carried labels.

Do **not** promote ad-set names, campaign names, or tiers into **taxonomy terms** —
they are not terms, and a term ranking built from them is fabricated. But **do**
read those same names and their copy as ordinary observations in Step 3c: "the two
cheapest ad sets both led with a safety objection" is a legitimate finding, stated
as an observation rather than as a term.

### Step 5: Propose each term's disposition — the operator decides it

For every attributable term, propose exactly one:

| Disposition | Means |
|---|---|
| `scale` | Earned more next month — evidence supports increasing its share. |
| `maintain` | Holding its role; keep roughly as-is. |
| `drop` | Not earning its place — reduce or stop. |

**A disposition is a PROPOSAL, not a decision, and least of all an action.**
Writing `drop` beside a term retires nothing, demotes nothing and amends
nothing — it tells the operator what the evidence supports so they can decide.
Write it in that voice ("bằng chứng ủng hộ giảm…"), never as a settled verdict
("đã loại…"). This binds the coverage-axis kinds especially: **one month's
ranking never changes doctrine.** A lead type, frame, device, register or length
band that ranks poorly is **not** retired here, and the floor is not altered
here — doctrine amendment happens only at the **quarterly** cycle and only by a
human act. If a period genuinely suggests a doctrinal change, **propose it in §6
and stop there.**

**And propose it observationally.** The evidence supports a disposition; it never
proves a cause. Delivery is not randomised across assets and axis interactions
are invisible, so a `scale` on an axis term means "this value was observed
alongside the better results", never "this value produced them".

**The organic post lens carries the disposition.** It is the only lens that says
whether a *topic* works, because it is the only one where attention was earned
rather than bought. Lens 2 (boosted) and lens 3 (ads) **inform** the judgement;
they do not override it.

Resolve the lenses in this order:

1. **Organic rate vs the baseline** → the provisional disposition.
2. **Boosted behaviour** → does budget extend this topic, or just buy reach?
   A topic holding its rate under boost strengthens `scale`; one collapsing under
   boost is a targeting finding, not automatically a `drop` of the topic.
3. **Ad conversion** (persona/route/layer only) → context. A topic that engages
   but does not convert is **not** thereby a `drop`; say both readings.

**A term with no post-lens evidence gets NO topic disposition.** Mark it
explicitly — ad conversion data alone cannot tell you whether a topic lands, and
assigning a disposition off it would be the exact blend this step forbids.

Ground each in the **evidence you actually read, per lens**, and write the
`evidence` string in Vietnamese naming which lens it came from. A term whose
evidence is provisional or sits on an incomplete lens is labelled as such — a
disposition resting on unsettled data must say so rather than reading as
confident. **A single post is a signal, not a verdict**: state the sample size and
never let one row carry a `scale`/`drop` on its own.

**Judge on role, not on one number.** A term carrying awareness work is not
failing because it produced no purchases, any more than a conversion term is
failing on impressions. Read the KB live for the role each pillar/layer/route is
meant to play — never restate a remembered version.

### Step 6: Write the Review as a McKinsey-style markdown report

`performance_review` is **markdown, not jsonb**. The report IS the column value —
no structured envelope, no `ranked_terms[]` array, no parallel fields.

```
Call: save_month_plan
  period: <period>            # the month being PLANNED, not the one measured
  performance_review: "<the markdown document below>"
```

Two things this makes load-bearing:

- **§6 is the only carrier.** Nothing here is machine-readable, so a lesson not
  written into §6's handoff table **does not reach Tactics, Research or Narrative
  at all**. §6 is an interface, not a summary.
- **Every number a later step needs must be IN THE TEXT.** Prose is all that
  survives.

#### Report skeleton — all Vietnamese, 600–900 words for §§1–6

```markdown
# Soát Hiệu Quả — <period đo> → Kế Hoạch <period>

## 1. Kết luận điều hành
## 2. Ba điều rút ra
## 3. Chủ đề nào hiệu quả
## 4. Ngân sách mua được gì
## 5. Quảng cáo: theo lớp, rồi persona/route
## 6. Mang gì sang bước sau
## 7. Độ tin cậy của số liệu
## Phụ lục — Bảng thuật ngữ xếp hạng
```

**§1 — Kết luận điều hành.** ~150 words. The answer **before** any evidence: what
the period taught, what it could not teach, what should change. **A caveat that
changes the conclusion belongs HERE, not §7** — burying one that inverts the
answer is the single thing this report may never do. **A period whose coverage
axes are mostly untagged is exactly such a caveat**: say in §1 that the axis
reading rests on a small tagged minority, rather than letting the appendix imply
the period was ranked.

**§2 — Ba điều rút ra.** **EXACTLY THREE.** Each is a **claim**, not a topic label
("Chủ đề mệt mỏi giữ được tương tác khi tăng ngân sách", never "Chủ đề mệt mỏi").
Each carries its evidence in one clause and its **confidence inline** — sample
size and degradation travel *with* the claim, never as a footnote, because the
claim gets quoted onward. MECE: no overlap, nothing material left outside all
three. **A lesson may legitimately be an inability** when it names a fixable cause.

**§3 — Chủ đề nào hiệu quả** (lens 1, the verdict). Ranked on engagement **RATE**.
States the organic baseline and its post count.

**Lead with the pattern read off ALL posts** (Step 3c) — best vs worst by rate,
with the copy of each quoted so the pattern is visible ("bài mở đầu bằng thất bại
của người đọc thắng bài mở đầu bằng hướng dẫn sản phẩm"). **Then** the term
ranking for the subset that mapped, labelled with its sample size. The population
pattern rests on more rows, so it leads; if the two disagree, the pattern wins.

**When nothing maps, the section still stands on the population pattern** — it is
never empty merely because attribution was thin, and never filled from §4 or §5.

**§4 — Ngân sách mua được gì** (lens 2). Always read **against §3's baseline**.
Rate holds at scale → scale the topic. Rate collapses → money bought reach, a
**targeting** finding, not a topic failure. Never averaged into §3, never given a
tier.

**§5 — Quảng cáo: theo lớp, rồi persona/route** (lens 3, secondary).

**Open with the LAYER table — L1 / L2 / L3 / `chưa rõ lớp`** — covering the whole
ad population, since layer resolves from campaign names even when no brief maps:

| Lớp | Chi | Hiển thị | CPM | Chuyển đổi | Chi/chuyển đổi | Đơn | Chi/đơn | Số ngày chạy |

Grade each layer on **its own** KPI (L2 on CPM + volume + continuity, **never
cost-per-purchase**; L1/L3 on cost per conversion and purchase). Never rank the
layers against each other on one metric. Frequency: **không khả dụng**.

Then, **within each layer separately**, the cheapest and most expensive hooks,
with that layer's **spread** (best ÷ worst) stated — the spread says whether
creative choice is a lever there at all. **Never one pooled hook ranking across
layers.** Finish with any copy that ran in more than one layer and inverted,
reported as a hook-to-layer matching finding.

Then persona/route where briefs map, with its spend coverage stated. **Never
compared against §3 or §4.** §3/§5 disagreement is a **finding**, reported, not
resolved.

**§6 — Mang gì sang bước sau.** A directive table. Consumers are the **three Plan
steps ONLY** — channel pipelines read what Tactics decided, never this report:

| Bài học | Mang sang | Hành động cụ thể |
|---|---|---|
| <claim from §2> | **Tactics** | <what to do crossing quarterly strategy with this> |
| <claim from §2> | **Research** | <what to investigate / what NOT to conclude> |
| <claim from §2> | **Narrative** | <what the month's story must acknowledge> |

**Every §2 lesson appears here** — a lesson that carries nowhere is not a lesson.
Actions are **directive and specific**, never a restatement of the finding. A
**prohibition is a valid action** ("không kết luận gì từ phần này") and is often
the honest one.

**§7 — Độ tin cậy của số liệu.** Measured span; uncovered dates (**UNKNOWN, never
zero**); provisional cutoff; excluded page segments **whole** with reason; per-lens
completeness; attribution method and its coverage share; **the untagged share
per coverage-axis kind** (`tagged_pieces` beside `pieces`, unsummed, with the
legacy cause named — an untagged asset is unknown on that axis, **never a
zero**, and is **not** the same thing as the unattributed volume reported
beside it); **the statement that every per-axis figure is observational rather
than causal**, because delivery is not randomised across assets and axis
interactions are not observable; whether a digest existed;
and, when the copy corpus was consulted, its `pending_count` — entries not yet
embedded are corpus coverage you did not have, and saying so is cheaper than a
reader assuming the sweep was complete.

**Phụ lục** — one row per ranked term:

| Thuật ngữ | Loại | Kết luận | Organic (tỷ lệ / số bài) | Boosted (tỷ lệ / lượt xem) | Ads (chi / chuyển đổi) | Cỡ mẫu | Cách quy chiếu |

- **Kết luận** is `scale` / `maintain` / `drop`, or **`—` (chưa có kết luận)** when
  there is no post-lens evidence. **The dash is meaningful — never fill it from the
  ad lens.**
- The three lens columns stay **separate** — no fused score, no column mixing a
  post metric with an ad metric.
- An unmeasured lens renders **`không đo được`**, never `0`.
- **The coverage-axis kinds are ROWS IN THIS SAME TABLE**, distinguished only by
  their `Loại` cell — no second appendix, no separate axis ranking, no score or
  rank number anywhere.
- **Every axis kind is followed by its untagged line**, stated in the two halves
  the read gives and never summed:
  `<loại>: <tagged_pieces> nội dung có gắn thẻ / <pieces> nội dung KHÔNG gắn thẻ trục này (chủ yếu là nội dung sản xuất trước khi trục này được ghi nhận — KHÔNG phải bằng 0, và không bị loại khỏi mẫu số)`.
  When the untagged half dwarfs the tagged half, the line says the ranking does
  not describe the period.
- **The table carries the observational caveat once, above it** — in Vietnamese,
  stating that phân phối không được ngẫu nhiên hoá giữa các nội dung and that
  tương tác giữa các trục không quan sát được, so the figures are quan sát, chứ
  không phải nhân quả.
- Rows must be **self-contained**: one that only makes sense beside a number in §3
  is broken, because nothing links them anymore.

#### Validate the markdown before you save it

The report **is** the column value, so a malformed table ships as the artifact —
there is no schema to catch it. Before writing, check:

- **Every table row has the same cell count as its header.** A row with too many
  cells is almost always two rows fused by a newline that did not survive
  escaping. This has shipped before: a `\n` written as a literal backslash-n
  merged two `§6` rows into one 7-cell row.
- **No literal `\n`, `\t` or stray backslash sequences** anywhere in the text.
- **A blank line before and after every table and heading.**
- **Compose the document in ONE piece.** Do not build it by string-replacing into
  an existing version through nested shells — that is where escaping breaks
  silently. Re-author the whole report and write it once.
- **Verify what was STORED, not what you sent** — re-read the saved value and
  re-check the cell counts. A write that returns success can still hold a broken
  table.

#### Three rules binding every section

1. **Every section ends with a "So what" line.** A section that cannot state one
   should not exist.
2. **Numbers appear only as evidence for a claim.** Metric tables without a verdict
   belong in the appendix.
3. **Thin evidence is stated in the claim itself.**

The report is written on the head for **`period`** while describing the **prior**
period — §7 always names the span actually read.

`save_month_plan` writes propose-state only — no status or approval field; it can
never mint or promote an approved head.

### No-data path

When the prior period has no performance at all, still write the report. It keeps
every section; the sections simply say what is missing:

- **§1** — states plainly that the period is unmeasured and why (no prior period;
  ingestion not run; no connected account).
- **§2** — the three lessons become what the absence teaches, at least one naming
  the fixable cause.
- **§3–§5** — each **stays** and states `không đủ dữ liệu` with its reason.
- **§6** — carries the prohibition forward: what the later steps must **not**
  conclude from an unmeasured period.
- **Phụ lục** — the table renders with no rows, under a line saying why.

Record the absence gracefully; **never fail**, and never leave the later steps
unauthorable.

## Output

Report to the operator in their language:

1. The **measured span** and what it was worth — uncovered dates, provisional
   cutoff, which lenses were complete.
2. The **organic baseline** engagement rate and how many posts it rests on.
3. The **topic verdict** — ranked terms with **proposed** dispositions, evidence
   per lens. Lead with the post lens; it is the answer to "which topics land".
   Say plainly that the dispositions are proposals for the operator to decide,
   not decisions the step has made.
4. The **coverage-axis reading** — the five axis kinds ranked in the same list,
   each with **how much of the period was untagged on it** (tagged beside
   untagged, unsummed). State that these figures are **observational, not
   causal**, and that one month's ranking changes no doctrine.
5. The **boost lesson** — what budget bought (reach) versus what it cost
   (engagement rate), stated against the organic baseline.
6. The **ad reading** as secondary context on persona/route only, explicitly not
   compared against the post figures.
7. What could **not** be attributed, and why — keeping **untagged** (no term of
   that kind) distinct from **unattributed** (no link, no term of any kind).
8. Where to review it: `/content/plan/<period>` — the report is markdown, so the
   operator edits the document itself.

Lead with the degradation when there is any. An operator who reads your summary
and believes the month was cleanly measured when it was not is the outcome this
step is built to prevent.

**Say plainly what §6 committed.** It is the only thing later steps can read, so
name the three handoffs in your report-back rather than leaving them inside the
document.

## Governance

- **Propose-only (hard rule).** Never call `approve` (the ONLY gated promotion —
  the approval hook denies it to agents, any entity, any gate), and never publish.
  Demotion is not a separate `unapprove_*` tool — it is an `edit`, and the server
  gates any patch touching an approval field on the `approve` capability, which
  you do NOT hold: never use `edit` to demote, unapprove, discard or reject a row.
- **Review sets no gate.** The month has exactly one approval — the **Narrative**,
  flipped by a human in the dashboard via `approve(entity='month_plan',
  gate='narrative')`. Approving it covers the whole month and releases every
  linked channel.
- **Never write `performance_analyses`.** Read-only here; owned by the quarterly
  retrospective.
- **Never trigger ingestion** (`pull_*`) and never hand-author raw performance
  rows.
- **Write through `save_month_plan`, never around it.** The MCP tool is the only
  supported write path: it carries the capability check, the audit trail and the
  optimistic-concurrency guard. Never write the column by any other route, even
  when a tool schema looks stale or a document seems large — a write that skips
  those guards can look correct and still be unsafe. If the tool genuinely
  refuses, report that and stop rather than routing around it.
- **Never hard-code KB content.** Name the doc and section and read it live —
  personas, pillars, routes, the awareness framework, tier roles, and the
  doctrine doc governing the coverage axes. Rosters are open: a term added or
  retired — including a new proof device or an additional lead type — must need
  **no change to this skill**. **A failed KB read STOPS the run**: report which
  doc could not be read and stop, rather than proceeding on a remembered version.
- **The disposition is a proposal; the operator decides.** Review ranks terms and
  writes a proposed `scale`/`maintain`/`drop` beside each; it never decides one,
  never presents one as settled, and writing one takes no effect on anything.
- **Never amend doctrine or taxonomy.** One month's ranking retires no term,
  demotes no proof device and alters no rule — about 2% of creatives win and
  delivery is not randomised, so a month's ranking is mostly noise. Doctrine
  changes only at the **quarterly** cycle, by a human act. Propose in §6; never
  apply.
- **Never present a per-axis figure causally.** Delivery is not randomised across
  assets and axis interactions are not observable — the figures are
  observational. No wording may imply an axis value caused a result.
- **Never conflate `untagged` with `unattributed`**, never report untagged volume
  as zero, and never drop it from the denominator.
- **The persisted report is entirely Vietnamese** — every section, every table
  cell, every heading. Operator-facing chat may be the operator's language.
- **Never fabricate to fill the structure.** Three lessons is a discipline, not a
  quota: when the period genuinely taught less, a lesson may be an inability
  ("chưa thể kết luận …, vì …"). Inventing a fourth finding, or dressing an
  unmeasured section as measured, defeats the whole report.
