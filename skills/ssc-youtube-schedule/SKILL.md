---
name: ssc-youtube-schedule
description: Builds the proposed publish schedule for a Cambridge Diet Vietnam monthly YouTube cycle — reads the plan's approved video ideas and assigns each a publish slot enforcing the channel cadence rules. Writes the schedule onto the plan via save_monthly_plan. Propose-only; the operator approves in the dashboard.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: youtube
  tools: [get_monthly_plan, list_ideas, save_monthly_plan]
---

# Monthly YouTube Schedule (`ssc-youtube-schedule`)

You assign each approved YouTube video idea a publish date for the plan month, enforcing the channel's cadence rules, and write the resulting schedule onto the monthly plan. You are propose-only: you write only via `save_monthly_plan` and stop immediately after. The operator reviews and approves the schedule in the dashboard. You NEVER call any `approve_*`, `publish_*`, or content-creation tool.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)
- `plan_id` — the monthly plan document to read from and write to

## Procedure

### Step 1: Read approved ideas

Call `list_ideas(plan_id, status='approved', channel='youtube')` to retrieve all YouTube video ideas the operator has approved for this month.

**Gate-check:** If the returned `ideas` array is empty, STOP immediately and tell the operator:

> No approved YouTube video ideas found for this plan. Please review and approve ideas in the dashboard (Ideas → <period> → YouTube) before running this skill.

Do not proceed past this gate under any circumstances. Only move to Step 2 when at least one approved YouTube idea is present.

Hold the full list of approved YouTube ideas — you will need each idea's `idea_id`, `pillar` (series), `format_decision.videoLength`, and `format_decision.series` for Steps 3 and 4.

### Step 2: Load cadence rules and key dates

**2a. Cadence rules**

Call `get_monthly_plan(plan_id)` to load the current plan. Extract and hold:

- `targets.youtube` — the briefing parameters (videoCount, stageMix, formatMix)
- `targets.keyDates` — key dates or campaign moments for the month
- `phase_status` — the full current phase_status object (must be merged in Step 4, not replaced)

Read the cadence constraints from `targets.youtube` and the channel rules embedded in the plan's briefing. The YouTube cadence for Cambridge Diet Vietnam is:

- **Long-form:** 1–2 long-form videos per week, published on a consistent day (e.g. Thursday or Friday — choose one and hold it for the month to build subscriber habit).
- **Shorts:** 1–2 Shorts per week, supplementing long-form (never replacing it). Publish Shorts on different days from long-form for spread.
- **Series alternation:** No two consecutive long-form videos should be from the same series (e.g. do not publish two `science-explained` videos back-to-back; alternate with `documentary`, `consultant-spotlight`, or `womens-conversation`).
- **Monthly documentary:** If a `documentary` series video is in the plan, publish it in the second or third week of the month (not week 1 or week 4) — it anchors the month's narrative and needs enough runway for viewers to find it.

**2b. Key dates**

Using `targets.keyDates` from Step 2a, for each key date:
- If a YouTube video is thematically tied to the key date (based on the idea's `theme` or `core_message`), pin it to publish 3–5 days before the key date (YouTube videos need lead time for discovery, unlike Facebook same-day posts).
- If a Shorts idea is tied to the key date, pin it to publish on the key date itself (Shorts are immediate-discovery content).

If `targets.keyDates` is absent or empty, proceed without key-date pinning — the cadence rules alone govern placement.

### Step 3: Assign publish dates

Assign exactly one publish date (format `YYYY-MM-DD`) to each approved YouTube idea. Every approved idea must be scheduled exactly once — no omissions, no duplicates.

Apply all of the following constraints:

**A. Long-form cadence (1–2 per week)**

Select a consistent long-form publish day for the month (e.g. `Thursday`). Place all long-form videos on that day. If the total long-form count exceeds 4 for the month (i.e. more than 1 per week), add a second publish day (e.g. `Monday`) and alternate.

**B. Shorts cadence (1–2 per week)**

Place Shorts on days that are not the long-form publish day. Distribute them evenly across the weeks of the month.

**C. Series alternation for long-form**

Within any two consecutive long-form publish dates, the two videos must not share the same series. If a collision occurs, swap the later video with the nearest same-week video from a different series.

**D. Documentary anchor**

If a `documentary` series video is in the plan, assign it to a publish date in week 2 or week 3 of the month. Do not assign it to week 1 (too early to anchor) or week 4 (too late to build momentum).

**E. Key-date alignment**

For each key date in `targets.keyDates`:
- Assign any thematically tied long-form video to publish 3–5 calendar days before the key date.
- Assign any thematically tied Shorts to publish on the key date itself.
- If no idea is tied to a key date, skip (unlike posts, YouTube does not require a video on every key date).

**F. Every approved idea scheduled exactly once**

After assigning key-date and anchor videos, place the remaining ideas across the available dates using the cadence rules. Do not schedule any idea more than once. Do not leave any approved idea unscheduled.

**Working approach:** Start with key-date and documentary anchor placements (constraints D + E), then fill the long-form cadence pattern (constraint A), then place Shorts (constraint B), then verify series alternation (constraint C) and adjust. Iterate until all constraints are satisfied simultaneously.

### Step 4: Write the schedule onto the plan

Call `save_monthly_plan` with:

- `plan_id` — unchanged
- `period` — unchanged
- `youtubeCalendar` — the full proposed schedule as an array of objects, one per approved idea, in date order (earliest first):

  ```json
  [
    {
      "idea_id": "<id>",
      "date": "YYYY-MM-DD",
      "series": "<series-name>",
      "videoLength": "<short | medium | long | documentary>",
      "notes": "<key-date-pin | anchor | — >"
    }
  ]
  ```

  Every approved YouTube idea from Step 1 must appear exactly once in this array. Dates must be within the plan month specified by `period`.

- `phase_status` — the **full merged** phase_status object. Start from the `phase_status` read in Step 2a. Set `youtubeSchedule` to `'proposed'` while preserving all other keys:

  ```json
  {
    "context": "<carry through unchanged>",
    "youtube": "<carry through unchanged>",
    "youtubeSchedule": "proposed"
  }
  ```

  Do NOT drop any existing keys from `phase_status`. `save_monthly_plan` replaces the entire `phase_status` field — you must send the full merged object including all existing phase keys (e.g. `context`, `youtube`, `posts`, `postsSchedule`) unchanged.

Do NOT modify `targets` in this call. Omit `targets` from the call entirely, or re-send the full unchanged `targets` object if the tool requires it.

### Step 5: Output the schedule

After saving, output the full proposed schedule in date order, then prompt the operator to approve:

```
## Proposed YouTube Schedule — <period>

**Videos scheduled:** <N> total (<n> long-form + <n> Shorts)
**Long-form publish day(s):** <day(s)>

| Date | Day | Series | Video Length | Title | Notes |
|------|-----|--------|--------------|-------|-------|
| YYYY-MM-DD | Thu | documentary | 20+ min | <title> | anchor |
| YYYY-MM-DD | Mon | shorts | < 3 min | <title> | — |

### Weekly Distribution
| Week | Dates | Long-form | Shorts | Total |
|------|-------|-----------|--------|-------|
| Wk 1 | DD–DD <month> | <n> | <n> | <n> |
| Wk 2 | DD–DD <month> | <n> | <n> | <n> |
| Wk 3 | DD–DD <month> | <n> | <n> | <n> |
| Wk 4 | DD–DD <month> | <n> | <n> | <n> |

### Cadence Check
| Constraint | Rule | Status |
|------------|------|--------|
| Long-form per week | 1–2 per week | PASS / FAIL |
| Shorts per week | 1–2 per week | PASS / FAIL |
| Series alternation (no consecutive same series) | 0 violations | PASS / FAIL |
| Documentary in week 2–3 | week 2 or 3 | PASS / FAIL |
| Key-date alignment | <N> of <N> | PASS / FAIL |
| All approved ideas scheduled | <N> of <N> | PASS / FAIL |

---
YouTube schedule saved to plan `<plan_id>`. Phase status: youtubeSchedule = proposed.

Approve the schedule in the dashboard to finalise the publish calendar.
```

## Output

- `youtubeCalendar` array written to the monthly plan via `save_monthly_plan`, one entry per approved idea with `idea_id`, `date` (`YYYY-MM-DD`), `series`, `videoLength`, and `notes`
- `phase_status.youtubeSchedule` set to `'proposed'`
- All other existing `phase_status` keys preserved (context, youtube, posts, postsSchedule, etc.)

## Governance

- **Propose-only.** Writes only via `save_monthly_plan`. NEVER calls `approve_*`, `publish_*`, `save_idea`, or any content-creation or social-scheduling tool.
- **No auto-approval.** The operator reviews and approves the schedule in the dashboard.
- Does not call `get_knowledge` — all cadence rules are derived from the plan's `targets.youtube` briefing and the constraints defined in this skill's Step 2. Do not make additional knowledge reads.
- All cadence constraints are listed in Step 3 — apply them strictly. YouTube's publish rhythm (weekly long-form + Shorts) is fundamentally different from Facebook's daily-post cadence; do not apply Facebook cadence rules here.
- Valid `phase_status` values are: `pending`, `in_progress`, `proposed`, `done`, `approved`. The value set here is `proposed`.
- Requires `edit` capability (plus `view` for the reads via `list_ideas` and `get_monthly_plan`).
