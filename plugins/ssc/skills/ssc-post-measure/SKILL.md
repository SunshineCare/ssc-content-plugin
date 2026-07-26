---
name: ssc-post-measure
description: Runs the Measure step of the standalone Cambridge Diet Vietnam Posts pipeline — the ENGAGEMENT LENS. Refreshes the LIVE Facebook page (pull_fb_performance — the ONLY ingestion it owns; the ad story-id linkage is the scheduled worker's sync and is read as found, never force-fixed) then reads the ACTUAL per-post page performance (get_post_performance) — what was really posted, NOT the DB plan — where every row now carries its organic/paid `class` (organic_only | paid_only | boosted | unknown). The engagement lens covers `organic_only` + `boosted` ONLY, ranks them on engagement RATE (engagement ÷ post_media_view) and never on absolute counts, badges every boosted row because its page numbers include paid delivery, and excludes `paid_only` entirely (that is ssc-ads-measure's conversion lens). Reports the documented degraded states — unpopulated linkage, boost placed outside Brand OS, no content — plainly, never asserting all-organic. Writes a retrospective to channel_plans.retrospective via save_channel_plan AND persists its block into the shared per-period digest via save_performance_analysis. Propose-only; the digest is always saved as a draft and no gate is flipped. Next month's Focus reads this retrospective to carry rate-ranked winners forward and drop losers.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [pull_fb_performance, get_post_performance, get_performance_analysis, get_channel_plan, save_channel_plan, save_performance_analysis]
---

# Post Measure (`ssc-post-measure`)

You run the **Measure** step of the standalone Cambridge Diet Vietnam Posts pipeline — and you are the **engagement lens**. You measure **what was actually posted on the Facebook page**, NOT what the database planned — the page content is vastly different from the DB plan (manual posts, manual edits, schedule drift), so the DB is never your source for performance. You (1) refresh from the **live page** via `pull_fb_performance` — the only ingestion you own; the ad story-id linkage is synced by the scheduled ingestion worker, not by you — then (2) read the **actual per-post page performance** via `get_post_performance` — the raw rows keyed by the real FB post id / permalink, with the DB `content_id` link optional (null for page content with no plan row). You translate those real-page metrics into content-strategy learnings and write a **retrospective** onto the post `channel_plan` via `save_channel_plan(channel='post', period, retrospective=…)`. The retrospective is markdown prose — what worked (carry forward), what failed (drop or refresh), and what to try next. You only trigger the governed `pull_fb_performance` page sync and write the retrospective; you NEVER trigger any other ingestion (`pull_fb_ad_hierarchy`, `pull_all_ad_performance` — neither is yours), hand-author performance rows, call `approve` (any entity), use `edit` to demote/unapprove a row, or produce new content.

This is step 5 — the final step — of the Posts pipeline (**Focus → Research → Ideate → Schedule → Measure**), keyed on `channel_plans(channel='post', period=YYYY-MM)`. **There is no gate** — the retrospective is propose-state output. It closes the loop: **next month's Focus reads this `retrospective`** to carry winners forward and drop losers.

## The engagement lens — what it covers and how it ranks (hard rules)

Objective is a property of the **lens**, not of the content. Posts exist to earn engagement; ads exist to convert. You own the **engagement lens** only. `ssc-ads-measure` owns the separate **conversion lens**. Four rules bind you:

**1. Class scope — you cover `organic_only` + `boosted`, and NOTHING else.**
Every facebook row from `get_post_performance` now carries a `class`:

| `class` | In the engagement lens? | Handling |
|---|---|---|
| `organic_only` | ✅ **ranked** | The clean case — page numbers are organic delivery. |
| `boosted` | ✅ **ranked, and BADGED** | Ranked alongside organic, but its page numbers **include paid delivery** — say so on every mention. |
| `paid_only` | ❌ **EXCLUDED** | Dark posts. They have no engagement job. They belong to `ssc-ads-measure`'s conversion lens — never report one here, not even as context. |
| `unknown` | ❌ **not ranked** — listed separately | The join could not be resolved with confidence. Report as **undetermined**, NEVER as organic. Cite its `class_reason`. |

**`class` is the ONLY authority.** There is a legacy `is_boosted` column — it is always null, it is stale, and it can disagree with `class`. **Never read `is_boosted`.**

**2. Rank on RATE, never on absolute counts.**
The ranking key is `engagement_rate` = `engagement ÷ post_media_view`, returned on the row (a decimal string — parse it; when it is null, compute the same ratio from `engagement` ÷ `impressions`, and where `impressions` is 0/null the post is **unrankable**, not zero-rated).

Why: paid delivery inflates the numerator (interactions) and the denominator (views) roughly together, so the **ratio** survives contamination in a way a **count** does not. Boosting buys reach; it does not buy the proportion of viewers who cared. Consequence you must honour: **a boosted post with big absolute engagement and a weak rate ranks BELOW an organic-only post with smaller absolute engagement and a stronger rate.** Ranking on counts is the exact defect this lens exists to remove — it let budget masquerade as resonance and Focus carried boosted posts forward as organic winners.

Absolute counts (`engagement`, `impressions`) still appear — as **context beside the rate**, never as the ordering key.

**3. Describe the rate in MEDIA-VIEW terms — never as a share of people.**
`post_media_view` is a **media-view count and is NOT deduplicated by person**: one person can generate several views. The rate is therefore a sound **relative comparator** across posts — which is all ranking needs — but it is **NOT** "% of people who engaged" and **NOT** a share of the people reached.

- ✅ Write it as: "tương tác trên mỗi 1.000 lượt xem" (interactions per 1,000 media views), or "tỷ lệ tương tác trên lượt xem".
- ❌ NEVER write: "X% người xem đã tương tác", "X% người tiếp cận", "X out of every 100 people engaged", or any phrasing making the denominator a count of *people*.

For the same reason, treat `views` / `reach` / `impressions` on the page side as **one and the same number** — all three columns hold the single `post_media_view` value. Page-side `reach` is **not** true unique reach; never present it as one.

**Do not confuse the page-side `reach` with the ad side's `reach_day_sum`.** They are different numbers on different rows and neither is unique reach: page `reach` is the post's `post_media_view` (identical to `views`/`impressions`), while `ad_metrics.reach_day_sum` is a SUM of per-day unique reach across every delivering day. Never divide by either, never add them, and never present either as people reached.

**4. No organic/paid SPLIT of a boosted post's page numbers exists — do not imply one.**
Meta removed the post-level split, so `impressions_organic`, `impressions_paid`, `engagement_organic_est` and `engagement_rate_organic` are **permanently null**. A boosted post's page metrics are the **unmodified page totals, inclusive of paid delivery**. Never subtract `ad_metrics` from them, never estimate an organic remainder, never invent a derived organic figure. Label the number for what it is.

## Inputs

- `period` — the plan month being measured, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 0: Pull fresh performance from the live Facebook page

Before reading any analysis, refresh the performance store from the ACTUAL page so the retrospective reflects what was really posted (the database's planned/scheduled posts can differ):

```
Call: pull_fb_performance
  (no args)
```

This runs the page-post insights sync against the live Graph API — it upserts performance rows keyed by the real FB post id (`external_id` / permalink; the DB `content_id` link is optional, so genuinely-posted content is captured even when it doesn't match a planned DB row) and re-scores winners. If it errors (no page credentials, API down, rate limit), note the failure and proceed to Step 1 on whatever analysis already exists — do not block the retrospective on the sync.

### Step 0b: The ad story-id linkage is NOT yours to sync — read it as it is

Classification joins `ads.effective_object_story_id` → `performance.external_id`, and that story id is captured by the **ad-hierarchy sync, which is the scheduled ingestion worker's job** — it runs every cycle on its own. **You do not trigger it.** The only ingestion you own is the governed page sync of Step 0 (`pull_fb_performance`); the ad-hierarchy sync walks the whole ad account and writes campaign/ad-set/ad rows, which is ingestion well beyond your scope.

So there is no call here. Go straight to Step 1 and read the linkage **as you find it**. When it is unpopulated, Step 1's `classification.linkage_populated` / `authoritative` come back `false` — that is a **reported degraded state, not something you force-fix**: handle it exactly as Step 1a(a) describes (say boost detection was unavailable this cycle; never assert the content is organic), and name the re-sync as an operator/worker follow-up in the chat summary only.

### Step 1: Read the ACTUAL per-post page performance (primary source)

This is your real source of truth — the posts that are genuinely on the page:

```
Call: get_post_performance
  platform: facebook
```

Returns the raw rows synced from the live page in Step 0: a `posts[]` array (each with `external_id`, `permalink_url`, `message` (the caption — the actual content), `media_type`, `engagement`, `impressions`, `engagement_rate`, `recorded_at`; `impressions` = `post_media_view`, i.e. post media views — the metric Meta shipped when it removed the old reach metric on 2025-11-15; `content_id` is usually null — that just means the post has no DB plan link, which is expected) plus a `summary` (count, engagement total/avg, `views_total`/`views_avg`, `posts_with_views`), a `classification` block, and a `note`.

**Every facebook post also carries its classification**, which is what makes this the engagement lens:

- **`class`** — `organic_only` | `paid_only` | `boosted` | `unknown`. Your scope filter (see the four hard rules above). **Authoritative — never read the stale `is_boosted` column.**
- **`ad_ids`** — the linked ad ids (empty for organic rows).
- **`ad_metrics`** — for a boosted row, the **ALL-TIME** sum of its linked ads' daily rows (`ads_counted`, `impressions`, **`reach_day_sum`**, `clicks`, `spend`, `conversions`, `purchases`, `messaging_conversations`, `date_range` as `{from, to}` in `YYYY-MM-DD`, `days_counted`). **`null` for organic rows** — null means "no paid delivery to report", NOT zero spend. This is the separate paid lens on the same post, never a subtrahend from the page numbers.

  Two things about this block changed and both bind what you may say about it:

  - **It is no longer a per-period figure.** It used to be the ad's newest window snapshot; `ad_performance` is now keyed on `(ad_id, date)` and `get_post_performance` takes **no date-range input**, so this sums **every day the ad has ever delivered**. A boost running for a year carries a year of spend here. You only ever cite it as **badge context** ("có chạy quảng cáo — chi tiêu trọn đời <from>–<to>"), never as this cycle's spend, and never as any per-period figure. Read `date_range` + `days_counted` to see the span it actually covers before quoting it at all. (Grading spend efficiency is `ssc-ads-measure`'s job either way — see "One post, two verdicts".)
  - **`reach` is gone; the field is `reach_day_sum`** — the SUM of each day's unique reach, so the same person reached on several days is counted once per day. It is an **upper bound on people reached**, never a deduplicated count. **Never divide by it** (`impressions ÷ reach_day_sum` is not a frequency) and never present it as people reached. This is the AD side; it is a different number from the page-side `reach` column below, which is unchanged.
- **`class_reason`** — present ONLY when `class` is `unknown`. Quote it when you report that post.

**Read the `classification` block before you rank anything.** It carries `page_id`, `ads_total`, `ads_with_story_id`, `linkage_populated`, `authoritative`, `counts`, `counts_scope`, `linked_story_ids_not_on_page`, and a `note`.

> **`counts.paid_only` is STRUCTURALLY always 0 here, and that zero means nothing.** A dark post has no page row by definition, so a page-post read can never enumerate one — `linked_story_ids_not_on_page` is where that population actually shows up (272 of 315 live story ids were exactly this case). **Never** report "no paid-only content this cycle" off that 0. Paid-only is `ssc-ads-measure`'s lens; you neither count it nor claim it is absent.

### Step 1a: The three degraded states — report plainly, never fabricate

These are documented, ordinary outcomes. Each is **reported**, never treated as a failure and never smoothed over into a clean finding.

**(a) Linkage not populated → boost detection is unavailable this cycle.**
When `classification.linkage_populated` is `false` (or `authoritative` is `false`), no ad carries a story id, so **every** post falls to `organic_only` for lack of a join — output indistinguishable from a page with genuinely no paid delivery.

- Still rank on rate and still write the retrospective — the rate ranking is unaffected.
- But you **MUST NOT** assert the content is organic. State plainly, in the retrospective and the digest block: boost detection was unavailable this cycle, so the organic/paid split could not be determined and every post is *unclassified*, not *confirmed organic*.
- Vietnamese phrasing for the persisted prose: **"Chưa xác định được bài nào có chạy quảng cáo trong kỳ này (liên kết quảng cáo chưa được đồng bộ) — KHÔNG kết luận toàn bộ là tự nhiên."**
- Name the fix in the operator-facing chat summary — the ad-hierarchy sync (the scheduled ingestion worker's job) has not populated the story ids yet — as a follow-up for the operator, never as a metric and never as something you run yourself.

**(b) A boost placed outside Brand OS has no ad row.**
The ingestion loop only tracks ads that exist in Brand OS, so a boost placed straight from the page or Ads Manager can have full page data and **no** ad row — it classifies `organic_only` despite being genuinely paid. You cannot detect it, and you must not paper over it.

- Carry a standing caveat in the retrospective whenever you report organic winners: `organic_only` means **no linked ad was found in Brand OS**, which is not the same as **confirmed unpaid**.
- Vietnamese phrasing: **"`organic_only` = không tìm thấy quảng cáo liên kết trong Brand OS; boost đặt ngoài Brand OS sẽ không bị phát hiện."**
- Never upgrade an `organic_only` post to "clean organic", "purely organic", or "100% tự nhiên".

**(c) No content in the period.**
**If `count === 0`** (no posts on the page): this is the no-data case. Skip to Step 4 and write the graceful "no posts on the page this cycle" retrospective. Fabricate nothing — no metrics, no classes, no winners. If, additionally, the ad side has nothing either, that absence belongs to `ssc-ads-measure`; do not speak for it.

**Partial-data case (not a degraded state, but handled the same way).** **Read the `note`.** If `posts_with_views: 0` (views came back empty for every post), the rate's denominator is missing, so **rate ranking is not possible this cycle**. Do NOT block and do NOT silently fall back to count-ranking as if it were the same thing: synthesise from the engagement counts you DO have, and state explicitly in the retrospective that the rate could not be computed and the ordering is therefore an absolute-count fallback to be read with caution.

### Step 1b (optional): Read the per-period digest for extra signal

The digest is supplementary, NEVER required — it does not reflect the live page, so a null here is not a no-data condition:

```
Call: get_performance_analysis
  period: <period>
```

If `analysis` is present, it may add cross-channel context (`adCampaignHealth`, `youtubeRetention`, `conversionAudit`). If it returns `{ analysis: null }`, ignore it and proceed on the live-page posts from Step 1.

### Step 2: Rank the engagement lens on RATE and extract the learnings

**First, filter to your lens.** Keep only rows whose `class` is `organic_only` or `boosted`. **Drop every `paid_only` row** — it does not appear in this lens at all. Set the `unknown` rows aside into their own short "undetermined" list; they are reported, never ranked.

**Then rank the kept rows by `engagement_rate`, descending** — highest interactions-per-media-view first. This single ordering is the lens. Do **not** re-sort by `engagement`, by `impressions`, or by any absolute count, and do not rank organic and boosted into separate tables — they compete in **one** rate ranking, which is the whole point (a boosted post cannot buy its way to the top of a ratio).

**Badge every boosted row on every mention** — in the ranking, in the retrospective, in the digest block. The badge says its page numbers include paid delivery, so its rate is not a clean organic read. Where useful, cite its `ad_metrics.spend` + `ad_metrics.ads_counted` as *context for the badge* — **labelled as the ad's LIFETIME spend with its `date_range`**, since `ad_metrics` sums every day the ad ever delivered and is not this period's figure — never as a subtraction from the page numbers, never as this cycle's spend, and never as an engagement verdict (the conversion verdict on the same post is `ssc-ads-measure`'s to give; see "One post, two verdicts" below).

Vietnamese badge for the persisted prose: **"(có chạy quảng cáo — số liệu trang đã bao gồm phân phối trả phí)"**.

**Then read the spread.** **For the top and bottom posts, READ each one's `message` (caption) + `media_type`** — the rank tells you which posts won; the caption tells you WHY (what pillar/topic/hook/format they were). Classify each winner/loser into a content **pillar/topic** from its caption (e.g. science/education, customer testimonial, product recipe, brand/community) so the retrospective names *what kind of content* worked, not just post ids.

- **What worked** — the **highest-rate** posts. From their captions, name the **pillar/topic** that over-performed (e.g. "sleep↔weight science posts", "customer testimonials"), the hook, and the format (`media_type`). Cite the **rate first** (in media-view terms), with the absolute counts + permalink as supporting context. Badge any boosted entry. These are the pillars/topics to carry forward.
- **What failed** — the **lowest-rate** posts. Same discipline: rate first, counts as context. From their captions, name the pillar/topic/format that under-performed. These are the losers to drop or refresh.
- **Undetermined** — the `unknown` rows, listed with their `class_reason`, explicitly outside the ranking. Say "chưa xác định được phân loại", never imply organic.
- **Cross-channel** — fold in any digest signal from Step 1b (conversion gaps, fatigue) only if present.

**A high absolute count on a low-rate boosted post is NOT a win — say so when it comes up.** That inversion is exactly what this lens exists to catch, and next month's Focus is the reader that would otherwise carry it forward as an organic winner.

Ground every claim in an actual per-post metric + caption from `get_post_performance`. Where views are missing, say so and lean on engagement counts — do not fabricate metrics. Where a caption is empty, fall back to `media_type` + permalink and say the topic was unclear. Never restate the rate as a percentage of people (rule 3 above).

### Step 2b: One boosted post, TWO verdicts — yours is the engagement one

A `boosted` post genuinely has both jobs, so it is measured **twice**, once per lens, and the two verdicts are independent:

| Lens | Owner | Verdict on a boosted post |
|---|---|---|
| **Engagement** | **you** (`ssc-post-measure`) | Its rate rank among organic + boosted content — did it resonate? |
| **Conversion** | `ssc-ads-measure` | Its **boost-class** grade on cost-per-result + engagement rate — did the money work? **No tier is assigned.** |

**Never present one as the other, and never present yours as the whole story.** A boosted post can rank top on engagement while its boost graded poorly on cost-per-result, or the reverse — both are true at once, because they answer different questions. Give the engagement verdict, note that the boost's conversion verdict lives in the ad retrospective for the same period, and do **not** grade its spend efficiency yourself, do **not** assign it a tier (L1/L2/L3), and do **not** compute a cost-per-result. Those are the conversion lens's, and duplicating them here would produce a second, conflicting verdict on the same post.

### Step 3: Synthesise the retrospective

Write a tight markdown retrospective (under ~400 words), structured so next month's Focus can consume it as prose. **Write it entirely in Vietnamese — including the section headings (translate the English template headings below).** The retrospective is a persisted artifact the Vietnamese operator reads in the dashboard and next month's Focus consumes; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English).

```
## Post Retrospective — <period>

### Data status / classification
<one line: whether boost detection was available this cycle (degraded state (a)), plus the
standing caveat that `organic_only` = no linked ad found in Brand OS, not confirmed unpaid
(degraded state (b)). Say plainly when the split could not be determined.>

### What worked (carry forward) — ranked by engagement RATE
- <winning pillar/format/angle> — <rate, in media-view terms: "N tương tác / 1.000 lượt xem">,
  <absolute counts as context>, <badge "(có chạy quảng cáo — số liệu trang đã bao gồm phân phối
  trả phí)" when the row is boosted>

### What failed (drop or refresh) — lowest engagement RATE
- <losing pillar/format/angle> — <rate first, counts as context, badge when boosted>

### Undetermined classification (not ranked)
- <post + its class_reason>, or "không có"

### Conversion / content fixes for next month
- <failing step a post can address, or "none observed">

### Carry-forward note for Focus
<2-3 sentences: the single clearest signal next month's Focus should act on. Winners named here
are RATE winners, not count winners.>
```

Ground every "worked"/"failed" claim in an actual per-post metric from `get_post_performance` — the **rate** is the verdict, the counts are context; not opinion. This is the prose next month's `ssc-post-focus` reads in its prior-retrospective step, so the carry-forward signal it consumes must be the rate-ranked one.

**Language check before you save (all of this is persisted Vietnamese prose):** the rate is written in media-view terms and never as a share of people; every boosted row carries its badge; no `paid_only` post appears; no derived organic figure appears; no tier (L1/L2/L3) or cost-per-result appears.

### Step 4: Write the retrospective onto the plan

Call:

```
Call: save_channel_plan
  channel: post
  period: <period>
  retrospective: <the markdown retrospective from Step 3, OR the no-data note below>
```

**No-data case** — when Step 1's `get_post_performance` returned `count === 0` (no posts on the page), write the placeholder in Vietnamese:

```
## Hồi cứu bài đăng — <period>

Không có bài đăng nào trên trang Facebook trong kỳ này (đồng bộ trang trực tiếp không trả về dữ liệu). Không có số liệu nào để xếp hạng và không suy diễn thêm bất kỳ chỉ số nào. Tháng sau, Focus nên tiếp tục dùng các góc nội dung đã được KB kiểm chứng, không có tín hiệu hồi cứu mới.
```

`save_channel_plan` upserts by `(channel='post', period)` and threads `retrospective` through as a core field. It writes **propose-state only** — it never flips a gate. Do NOT pass any approval field.

> The post plan for `period` already exists by the time Measure runs (Focus created it, and the pipeline reached the Calendar gate). If you want to confirm before writing, an optional `get_channel_plan(channel='post', period)` read is harmless — but it is not required.

### Step 4b: Persist your block of the shared per-period digest

The `channel_plan` retrospective from Step 4 is the **post pipeline's** copy. The
**digest** (`performance_analyses`, one row per `period`) is the **cross-channel**
copy — the one `ssc-post-research`, `ssc-strategy-directions` and
`ssc-strategy-performance-retrospective` read via `get_performance_analysis`. Until
now nothing ever wrote it, so every one of those reads came back empty. Close that
loop: after Step 4, ALSO save your findings into the digest.

```
Call: save_performance_analysis
  period: <period>
  summary: <the merged digest prose — see below>
```

**The digest is SHARED — read-modify-write the `summary`, never clobber it.**
`save_performance_analysis` UPSERTS on `period` and applies **only the fields you
pass** (an omitted field keeps its previously-saved value), so several skills
compose one row for the cycle. `summary` is a single text field, though, so each
writer owns exactly ONE named block inside it:

| Block heading | Owner |
|---|---|
| `## Bài viết (Posts)` | **you** (`ssc-post-measure`) |
| `## Quảng cáo (Ads)` | `ssc-ads-measure` |
| `## Tổng hợp chu kỳ` | `ssc-strategy-performance-retrospective` |

Take the `summary` you already read in **Step 1b** (`{ analysis: null }` ⇒ treat it
as an empty string). Replace your `## Bài viết (Posts)` block if one exists, or
append it if it does not, and leave every other block **byte-for-byte unchanged**.
Pass the whole merged string as `summary`.

Your block is the Step-3 retrospective condensed to its carry-forward signal — **in
Vietnamese**, headings included (the persisted-prose convention: everything stored
is Vietnamese; only your chat-side reasoning is English):

```
## Bài viết (Posts)

**Trạng thái dữ liệu:** <đầy đủ | một phần | không có bài đăng nào trong kỳ này>
**Phân loại nội dung:** <đã xác định được bài có chạy quảng cáo | chưa xác định được (liên kết
quảng cáo chưa đồng bộ) — KHÔNG kết luận toàn bộ là tự nhiên>. `organic_only` = không tìm thấy
quảng cáo liên kết trong Brand OS, không đồng nghĩa với chắc chắn không chạy quảng cáo.

**Xếp hạng theo tỷ lệ tương tác trên lượt xem** (không xếp theo số tuyệt đối; lượt xem là lượt
xem nội dung, KHÔNG khử trùng lặp theo người).

**Hiệu quả (giữ lại):** <trụ cột/chủ đề/định dạng thắng — tỷ lệ thật trước, số tuyệt đối làm bối
cảnh; gắn nhãn "(có chạy quảng cáo — số liệu trang đã bao gồm phân phối trả phí)" nếu là bài
boosted>
**Kém hiệu quả (bỏ hoặc làm mới):** <trụ cột/chủ đề/định dạng thua — tỷ lệ thật trước>
**Tín hiệu cho tháng sau:** <1-2 câu>
```

Your block is the **engagement lens only**. It never carries a tier grade, a cost-per-result, or any `paid_only` content — those belong to `ssc-ads-measure`'s `## Quảng cáo (Ads)` block, which you must leave byte-for-byte unchanged.

**Pass NOTHING else.** Do **not** pass `ad_campaign_health` (that is
`ssc-ads-measure`'s field), and do **not** pass `youtube_retention` or
`conversion_audit` — organic post performance says nothing about either, no skill
produces them today, and passing a value you did not measure would fabricate data.
Omitting them preserves whatever another writer stored.

The digest row is always written as a **`draft`** — the tool takes no `status` and
cannot mint a `final`. Saving it is not an approval and flips no gate.

In the **no-data case** (Step 1 returned `count === 0`), still save, with the block
recording the absence honestly:

```
## Bài viết (Posts)

**Trạng thái dữ liệu:** không có bài đăng nào trên trang Facebook trong kỳ này. Không có tín hiệu hồi cứu mới, không có chỉ số nào được suy diễn.
```

### Step 5: Output summary

```
## Post Measure — <period> (engagement lens)

**Data status:** <full | partial (some sections missing) | no data this cycle>
**Boost detection:** <available | UNAVAILABLE this cycle — linkage not populated, so classes are undetermined, not organic>
**Lens scope:** organic_only + boosted, ranked on engagement rate. paid_only excluded (see the ad retrospective).

### What worked (carry forward) — by engagement rate
- <signal — rate first, counts as context, boosted rows badged>

### What failed (drop or refresh) — by engagement rate
- <signal>

### Undetermined classification
- <post + class_reason>, or "none"

### Carry-forward note for next month's Focus
<2-3 sentence statement — rate winners, not count winners>

---
Retrospective written to the post channel_plan (propose-state, no gate). Next month's Focus (`ssc-post-focus`) will read it as the prior period's retrospective.
Digest block `## Bài viết (Posts)` saved to performance_analyses (draft, period <period>) — `get_performance_analysis` now returns it.
```

## Output

- `retrospective` written to the post `channel_plan` (markdown) — the **engagement lens**: `organic_only` + `boosted` ranked on engagement rate, boosted rows badged, `paid_only` excluded — or the graceful no-data note when no analysis exists
- the `## Bài viết (Posts)` block written into the shared per-period digest (`performance_analyses`, `status='draft'`) via `save_performance_analysis` — merged into the existing `summary`, never clobbering another skill's block
- No gate flipped (Measure is ungated)

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Synthesis + save only.** Writes via `save_channel_plan` (the `retrospective` field) and `save_performance_analysis` (your `## Bài viết (Posts)` block of the shared per-period digest). No writes to the raw performance tables (`performance` / `post_performance` / `ad_performance` are ingestion's, not yours), no `approve` (any entity), no `edit` used to demote/unapprove a row, no content writes, no idea/schedule writes. The only ingestion you trigger is the governed page sync this skill already owns (`pull_fb_performance`) — **nothing beyond it**: never `pull_fb_ad_hierarchy` (the ad story-id linkage is the scheduled ingestion worker's sync — it walks the whole ad account and writes campaign/ad-set/ad rows, which is ingestion beyond this skill's scope; an unpopulated linkage is **reported** as degraded state (a), never force-fixed) and never `pull_all_ad_performance` (that is the ad pipeline's).
- **You are the ENGAGEMENT LENS — scope is a hard rule.** Cover `organic_only` + `boosted` only. **`paid_only` never appears in this lens**, not as a ranking entry and not as context; it belongs to `ssc-ads-measure`. `unknown` is reported as undetermined, never as organic. **`class` from `get_post_performance` is the sole authority — never read the stale, always-null `is_boosted` column**, which can disagree with it.
- **Rank on RATE, never on absolute counts.** The ordering key is `engagement_rate` (= engagement ÷ `post_media_view`). Counts are context only. A boosted post with high absolute engagement and a low rate ranks below an organic post with lower counts and a higher rate — ranking on counts is the defect this lens removes.
- **The rate is a media-view ratio, NEVER a share of people.** `post_media_view` is not deduplicated by person. Report it as interactions per N media views; never as "% of people who engaged" or a share of people reached. Likewise, page-side `views`/`reach`/`impressions` all hold the same single `post_media_view` value — page `reach` is not true unique reach and must never be presented as one.
- **Boosted rows are badged, every mention.** Their page metrics are the **unmodified page totals, inclusive of paid delivery**. No organic/paid split of them exists — `impressions_organic`, `impressions_paid`, `engagement_organic_est`, `engagement_rate_organic` are permanently null. Never subtract `ad_metrics` from the page numbers, never estimate an organic remainder, never invent a derived organic metric.
- **`ad_metrics` is an ALL-TIME sum and is badge context only.** `ad_performance` is keyed on `(ad_id, date)` and `get_post_performance` takes no date-range input, so `ad_metrics` sums **every day the ad ever delivered** — not this period. Cite it only with its `date_range` and the word "trọn đời"; never present it as this cycle's spend, and never derive a per-period figure from it. Its `reach` field is gone — it is **`reach_day_sum`**, the SUM of per-day unique reach, so it is an upper bound on people reached, is **never** a denominator (`impressions ÷ reach_day_sum` is not a frequency), and is a different number from the page-side `reach` column, which is unchanged.
- **Two lenses, two verdicts, no crossover.** A boosted post gets an engagement verdict here and a separate boost-class conversion verdict in `ssc-ads-measure`; neither is presented as the other. This skill never assigns a tier (L1/L2/L3), never computes cost-per-result or cost-per-purchase, and never grades spend efficiency.
- **The documented degraded states are reported, never failed and never fabricated.** (a) `linkage_populated`/`authoritative` false ⇒ say boost detection was unavailable and the classes are undetermined — never assert all-organic. (b) A boost placed outside Brand OS has no ad row and classifies `organic_only` ⇒ carry the standing caveat that `organic_only` means "no linked ad found in Brand OS", not "confirmed unpaid". (c) `count === 0` ⇒ record the absence gracefully and fabricate nothing. `counts.paid_only` is structurally 0 in this read and is never evidence that no dark posts exist.
- **Saving the digest is NOT an approval.** `save_performance_analysis` always writes `status='draft'` (the tool takes no `status` and cannot mint a `final`), so it flips no gate and stays inside propose-only. It is a write of what you measured, nothing more.
- **The digest is shared — never clobber another skill's block.** Read `summary` in Step 1b, replace/append ONLY `## Bài viết (Posts)`, and pass no other field: `ad_campaign_health` belongs to `ssc-ads-measure`, and `youtube_retention` / `conversion_audit` have no producer — passing either would fabricate a measurement you did not take.
- Measures the **live page** via `get_post_performance` (after `pull_fb_performance`), never the DB plan. The `get_performance_analysis` digest is optional cross-channel context on the READ side — a null there is NOT a no-data condition — and, on the WRITE side, the row you are contributing your block to.
- Records "no posts on the page this cycle" gracefully only when `get_post_performance` returns `count === 0` — never fabricates metrics, and never invents reach when the sync returned engagement only.
- Every "worked"/"failed" claim is grounded in an actual per-post metric from `get_post_performance`.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state, and never writes to a different period's plan.
- Requires `edit` capability (for `save_channel_plan` and `save_performance_analysis`), plus `view` for the `get_post_performance` / `get_performance_analysis` / `get_channel_plan` reads.
