---
name: ssc-post-measure
description: Runs the Measure step of the standalone Cambridge Diet Vietnam Posts pipeline. Refreshes the LIVE Facebook page (pull_fb_performance) then reads the ACTUAL per-post page performance (get_post_performance) — what was really posted, NOT the DB plan — synthesises a retrospective (what worked, what failed, what to carry forward) and writes it to channel_plans.retrospective via save_channel_plan. Records "no posts on the page this cycle" gracefully when the page has none. Propose-only; no gate. Next month's Focus reads this retrospective to carry winners forward and drop losers.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [pull_fb_performance, get_post_performance, get_performance_analysis, get_channel_plan, save_channel_plan]
---

# Post Measure (`ssc-post-measure`)

You run the **Measure** step of the standalone Cambridge Diet Vietnam Posts pipeline. You measure **what was actually posted on the Facebook page**, NOT what the database planned — the page content is vastly different from the DB plan (manual posts, manual edits, schedule drift), so the DB is never your source for performance. You (1) refresh from the **live page** via `pull_fb_performance`, then (2) read the **actual per-post page performance** via `get_post_performance` — the raw rows keyed by the real FB post id / permalink, with the DB `content_id` link optional (null for page content with no plan row). You translate those real-page metrics into content-strategy learnings and write a **retrospective** onto the post `channel_plan` via `save_channel_plan(channel='post', period, retrospective=…)`. The retrospective is markdown prose — what worked (carry forward), what failed (drop or refresh), and what to try next. You only trigger the governed `pull_fb_performance` sync and write the retrospective; you NEVER hand-author performance rows, call `approve_*`, or produce new content.

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
```

## Output

- `retrospective` written to the post `channel_plan` (markdown) — or the graceful no-data note when no analysis exists
- No gate flipped (Measure is ungated)

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Synthesis + save only.** Writes only via `save_channel_plan` (the `retrospective` field). No writes to performance tables, no `approve_*`, no content writes, no idea/schedule writes.
- **No gate.** Measure is the one ungated step; `retrospective` is propose-state output, never an approval.
- Measures the **live page** via `get_post_performance` (after `pull_fb_performance`), never the DB plan. The `get_performance_analysis` digest is optional cross-channel context only — a null there is NOT a no-data condition.
- Records "no posts on the page this cycle" gracefully only when `get_post_performance` returns `count === 0` — never fabricates metrics, and never invents reach when the sync returned engagement only.
- Every "worked"/"failed" claim is grounded in an actual per-post metric from `get_post_performance`.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state, and never writes to a different period's plan.
- Requires `edit` capability (plus `view` for the `get_post_performance` / `get_performance_analysis` / `get_channel_plan` reads).
