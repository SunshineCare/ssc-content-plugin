---
name: ssc-post-measure
description: Runs the Measure step of the standalone Cambridge Diet Vietnam Posts pipeline. Refreshes the LIVE Facebook page (pull_fb_performance) then reads the ACTUAL per-post page performance (get_post_performance) — what was really posted, NOT the DB plan — synthesises a retrospective (what worked, what failed, what to carry forward) and writes it to channel_plans.retrospective via save_channel_plan AND persists its organic block into the shared per-period digest via save_performance_analysis, so the digest every later phase reads is no longer empty. Records "no posts on the page this cycle" gracefully when the page has none. Propose-only; the digest is always saved as a draft and no gate is flipped. Next month's Focus reads this retrospective to carry winners forward and drop losers.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [pull_fb_performance, get_post_performance, get_performance_analysis, get_channel_plan, save_channel_plan, save_performance_analysis]
---

# Post Measure (`ssc-post-measure`)

You run the **Measure** step of the standalone Cambridge Diet Vietnam Posts pipeline. You measure **what was actually posted on the Facebook page**, NOT what the database planned — the page content is vastly different from the DB plan (manual posts, manual edits, schedule drift), so the DB is never your source for performance. You (1) refresh from the **live page** via `pull_fb_performance`, then (2) read the **actual per-post page performance** via `get_post_performance` — the raw rows keyed by the real FB post id / permalink, with the DB `content_id` link optional (null for page content with no plan row). You translate those real-page metrics into content-strategy learnings and write a **retrospective** onto the post `channel_plan` via `save_channel_plan(channel='post', period, retrospective=…)`. The retrospective is markdown prose — what worked (carry forward), what failed (drop or refresh), and what to try next. You only trigger the governed `pull_fb_performance` sync and write the retrospective; you NEVER hand-author performance rows, call `approve` (any entity), use `edit` to demote/unapprove a row, or produce new content.

This is step 5 — the final step — of the Posts pipeline (**Focus → Research → Ideate → Schedule → Measure**), keyed on `channel_plans(channel='post', period=YYYY-MM)`. **There is no gate** — the retrospective is propose-state output. It closes the loop: **next month's Focus reads this `retrospective`** to carry winners forward and drop losers.

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

### Step 1: Read the ACTUAL per-post page performance (primary source)

This is your real source of truth — the posts that are genuinely on the page:

```
Call: get_post_performance
  platform: facebook
```

Returns the raw rows synced from the live page in Step 0: a `posts[]` array (each with `external_id`, `permalink_url`, `message` (the caption — the actual content), `media_type`, `engagement`, `impressions`, `recorded_at`; `impressions` = `post_media_view`, i.e. post views — the metric Meta shipped when it removed the old reach metric on 2025-11-15; `content_id` is usually null — that just means the post has no DB plan link, which is expected) plus a `summary` (count, engagement total/avg, `views_total`/`views_avg`, `posts_with_views`) and a `note`.

**If `count === 0`** (no posts on the page): this is the no-data case. Skip to Step 4 and write the graceful "no posts on the page this cycle" retrospective.

**Read the `note`.** If `posts_with_views: 0` (views came back empty for every post), do NOT block: synthesise from the engagement counts you DO have (reactions + comments + shares per post), and flag in the retrospective that view metrics were unavailable this cycle.

### Step 1b (optional): Read the per-period digest for extra signal

The digest is supplementary, NEVER required — it does not reflect the live page, so a null here is not a no-data condition:

```
Call: get_performance_analysis
  period: <period>
```

If `analysis` is present, it may add cross-channel context (`adCampaignHealth`, `youtubeRetention`, `conversionAudit`). If it returns `{ analysis: null }`, ignore it and proceed on the live-page posts from Step 1.

### Step 2: Extract post-relevant learnings from the live posts

Rank the `posts[]` by engagement (and by views/`impressions` where `posts_with_views > 0`) and read the spread. **For the top and bottom posts, READ each one's `message` (caption) + `media_type`** — the rank tells you which posts won; the caption tells you WHY (what pillar/topic/hook/format they were). Classify each winner/loser into a content **pillar/topic** from its caption (e.g. science/education, customer testimonial, product recipe, brand/community) so the retrospective names *what kind of content* worked, not just post ids.

- **What worked** — the top posts by engagement/views. From their captions, name the **pillar/topic** that over-performed (e.g. "sleep↔weight science posts", "customer testimonials"), the hook, and the format (`media_type`). Cite actual numbers + permalink. These are the pillars/topics to carry forward.
- **What failed** — the bottom posts. From their captions, name the pillar/topic/format that under-performed. These are the losers to drop or refresh.
- **Cross-channel** — fold in any digest signal from Step 1b (conversion gaps, fatigue) only if present.

Ground every claim in an actual per-post metric + caption from `get_post_performance`. Where views are missing, say so and lean on engagement counts — do not fabricate metrics. Where a caption is empty, fall back to `media_type` + permalink and say the topic was unclear.

### Step 3: Synthesise the retrospective

Write a tight markdown retrospective (under ~400 words), structured so next month's Focus can consume it as prose. **Write it entirely in Vietnamese — including the section headings (translate the English template headings below).** The retrospective is a persisted artifact the Vietnamese operator reads in the dashboard and next month's Focus consumes; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English).

```
## Post Retrospective — <period>

### What worked (carry forward)
- <winning pillar/format/angle> — <one-line evidence: the metric observation>

### What failed (drop or refresh)
- <losing pillar/format/angle> — <one-line evidence>

### Conversion / content fixes for next month
- <failing step a post can address, or "none observed">

### Carry-forward note for Focus
<2-3 sentences: the single clearest signal next month's Focus should act on.>
```

Ground every "worked"/"failed" claim in an actual per-post metric from `get_post_performance` (engagement, and reach where available) — not opinion. This is the prose next month's `ssc-post-focus` reads in its prior-retrospective step.

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

Không có bài đăng nào trên trang Facebook trong kỳ này (đồng bộ trang trực tiếp không trả về dữ liệu). Tháng sau, Focus nên tiếp tục dùng các góc nội dung đã được KB kiểm chứng, không có tín hiệu hồi cứu mới.
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

**Hiệu quả (giữ lại):** <trụ cột/chủ đề/định dạng thắng — kèm số liệu thật>
**Kém hiệu quả (bỏ hoặc làm mới):** <trụ cột/chủ đề/định dạng thua — kèm số liệu thật>
**Tín hiệu cho tháng sau:** <1-2 câu>
```

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

**Trạng thái dữ liệu:** không có bài đăng nào trên trang Facebook trong kỳ này. Không có tín hiệu hồi cứu mới.
```

### Step 5: Output summary

```
## Post Measure — <period>

**Data status:** <full | partial (some sections missing) | no data this cycle>

### What worked (carry forward)
- <signal>

### What failed (drop or refresh)
- <signal>

### Carry-forward note for next month's Focus
<2-3 sentence statement>

---
Retrospective written to the post channel_plan (propose-state, no gate). Next month's Focus (`ssc-post-focus`) will read it as the prior period's retrospective.
Digest block `## Bài viết (Posts)` saved to performance_analyses (draft, period <period>) — `get_performance_analysis` now returns it.
```

## Output

- `retrospective` written to the post `channel_plan` (markdown) — or the graceful no-data note when no analysis exists
- the `## Bài viết (Posts)` block written into the shared per-period digest (`performance_analyses`, `status='draft'`) via `save_performance_analysis` — merged into the existing `summary`, never clobbering another skill's block
- No gate flipped (Measure is ungated)

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Synthesis + save only.** Writes via `save_channel_plan` (the `retrospective` field) and `save_performance_analysis` (your `## Bài viết (Posts)` block of the shared per-period digest). No writes to the raw performance tables (`performance` / `post_performance` / `ad_performance` are ingestion's, not yours), no `approve` (any entity), no `edit` used to demote/unapprove a row, no content writes, no idea/schedule writes.
- **Saving the digest is NOT an approval.** `save_performance_analysis` always writes `status='draft'` (the tool takes no `status` and cannot mint a `final`), so it flips no gate and stays inside propose-only. It is a write of what you measured, nothing more.
- **The digest is shared — never clobber another skill's block.** Read `summary` in Step 1b, replace/append ONLY `## Bài viết (Posts)`, and pass no other field: `ad_campaign_health` belongs to `ssc-ads-measure`, and `youtube_retention` / `conversion_audit` have no producer — passing either would fabricate a measurement you did not take.
- Measures the **live page** via `get_post_performance` (after `pull_fb_performance`), never the DB plan. The `get_performance_analysis` digest is optional cross-channel context on the READ side — a null there is NOT a no-data condition — and, on the WRITE side, the row you are contributing your block to.
- Records "no posts on the page this cycle" gracefully only when `get_post_performance` returns `count === 0` — never fabricates metrics, and never invents reach when the sync returned engagement only.
- Every "worked"/"failed" claim is grounded in an actual per-post metric from `get_post_performance`.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state, and never writes to a different period's plan.
- Requires `edit` capability (for `save_channel_plan` and `save_performance_analysis`), plus `view` for the `get_post_performance` / `get_performance_analysis` / `get_channel_plan` reads.
