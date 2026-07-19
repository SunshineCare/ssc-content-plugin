---
name: ssc-youtube-schedule
description: Builds the proposed publish schedule for a Cambridge Diet Vietnam monthly YouTube cycle — reads the plan's approved video ideas and assigns each a publish slot enforcing the channel cadence rules. Writes the schedule as schedule_entries via save_schedule_entries. Propose-only; the operator approves in the dashboard.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: youtube
  tools: [get_knowledge, get_channel_plan, list_ideas, save_schedule_entries]
---

# Monthly YouTube Schedule (`ssc-youtube-schedule`)

You assign each approved YouTube video idea a publish date for the plan month, enforcing the channel's cadence rules, and write the resulting calendar onto the YouTube `channel_plan` as `schedule_entries`. You are propose-only: you write only via `save_schedule_entries` and stop immediately after. The operator reviews and approves the schedule in the dashboard. You NEVER call `approve` (the ONLY gated promotion; the approval hook denies it to agents), `publish_*`, or any content-creation tool; you never use `edit` to demote/unapprove a row; and you NEVER flip a gate.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Load the plan and gate-check

Call `get_channel_plan(channel='youtube', period=<period>)` to load the YouTube channel plan. Hold `plan.id` — you pass it to `save_schedule_entries` as `plan_id`.

**Gate-check:** `save_schedule_entries` rejects with `plan_not_approved` unless the plan's `approved` gate is true (a plan must be approved before its ideas may be scheduled). If `plan.approved` is not true, STOP and tell the operator:

> The YouTube plan for <period> is not approved yet. Approve it in the dashboard before scheduling.

Then read the approved ideas: call `list_ideas(plan_id=<plan.id>, status='approved', channel='youtube')`.

**Ideas gate-check:** If the returned `ideas` array is empty, STOP immediately and tell the operator:

> No approved YouTube video ideas found for this plan. Please review and approve ideas in the dashboard (Ideas → <period> → YouTube) before running this skill.

Do not proceed past either gate under any circumstances. Only move to Step 2 when the plan is approved and at least one approved YouTube idea is present.

Hold the full list of approved YouTube ideas — you will need each idea's `id`, its series term (from the idea's `terms`), `video_length`, and `theme`/`core_message` for Steps 3 and 4.

### Step 2: Load cadence rules and key dates

**2a. Cadence rules (from the KB + the plan briefing)**

Call `get_knowledge` for `channels/youtube` and `rules/scheduling`, and read the plan's briefing parameters from `plan.tactics`/`plan.context` and `plan.targets` (video count, stage mix, format mix, any key dates). **The KB documents are the source of truth for cadence — if they conflict with any inline guidance below, the document wins.** Derive the month's cadence (long-form-per-week, Shorts-per-week, the consistent publish day, series-alternation rule, documentary anchor window) from the KB applied to the month's briefing; do not freeze counts into this skill.

As a fallback only when the KB is silent, the baseline Cambridge Diet Vietnam YouTube cadence is: 1–2 long-form/week on one consistent day held for the month; 1–2 Shorts/week on other days; no two consecutive long-form videos from the same series; and a monthly `documentary` anchored in week 2 or 3. Treat these as defaults the KB overrides.

**2b. Key dates**

Using the key dates from the plan briefing/targets, for each key date:
- If a YouTube video is thematically tied to the key date (based on the idea's `theme` or `core_message`), pin it to publish 3–5 days before the key date (YouTube videos need lead time for discovery, unlike Facebook same-day posts).
- If a Shorts idea is tied to the key date, pin it to publish on the key date itself (Shorts are immediate-discovery content).

If no key dates are present, proceed without key-date pinning — the cadence rules alone govern placement.

### Step 3: Assign publish dates

Assign exactly one publish date (format `YYYY-MM-DD`) to each approved YouTube idea. Every approved idea must be scheduled exactly once — no omissions, no duplicates.

Apply all of the following constraints (parameters come from the KB/briefing per Step 2, not from fixed numbers here):

**A. Long-form cadence** — Select a consistent long-form publish day for the month and place all long-form videos on that day. If the month's long-form count exceeds one per week, add a second publish day and alternate.

**B. Shorts cadence** — Place Shorts on days that are not the long-form publish day. Distribute them evenly across the weeks of the month.

**C. Series alternation for long-form** — Within any two consecutive long-form publish dates, the two videos must not share the same series. If a collision occurs, swap the later video with the nearest same-week video from a different series.

**D. Documentary anchor** — If a `documentary` series video is in the plan, assign it to the KB's anchor window (baseline: week 2 or 3). Do not assign it to week 1 (too early to anchor) or week 4 (too late to build momentum).

**E. Key-date alignment** — For each key date: assign any thematically tied long-form video to publish 3–5 calendar days before it; assign any thematically tied Shorts to publish on the key date itself. If no idea is tied to a key date, skip (unlike posts, YouTube does not require a video on every key date).

**F. Every approved idea scheduled exactly once** — After key-date and anchor placements, place the remaining ideas across the available dates using the cadence rules. Do not schedule any idea more than once. Do not leave any approved idea unscheduled.

**Working approach:** Start with key-date and documentary anchor placements (D + E), then fill the long-form cadence pattern (A), then place Shorts (B), then verify series alternation (C) and adjust. Iterate until all constraints are satisfied simultaneously.

### Step 4: Write the calendar as schedule_entries

Call `save_schedule_entries` with:

- `plan_id` — `plan.id` from Step 1
- `entries` — the full proposed calendar as an array, one object per approved idea, in date order (earliest first):

  ```json
  [
    { "idea_id": "<id>", "publish_at": "YYYY-MM-DDT09:00:00+07:00", "notes": "<key-date-pin | anchor | — >" }
  ]
  ```

  Every approved YouTube idea from Step 1 must appear exactly once. `publish_at` is an ISO 8601 timestamp within the plan month. Do not pass `status` — entries persist with the default `status='scheduled'`.

`save_schedule_entries` replaces the whole `schedule_entries` set (DELETE-then-INSERT) — send the **complete** calendar in one call. It writes propose-state only (`status='scheduled'`); it never flips the Calendar gate. The series and video length are attributes of each idea (read back via the idea aggregate), not fields on the schedule entry — do not try to store them here.

### Step 5: Output the schedule

After saving, output the full proposed schedule in date order, then prompt the operator to approve:

```
## Proposed YouTube Schedule — <period>

**Videos scheduled:** <N> total (<n> long-form + <n> Shorts)
**Long-form publish day(s):** <day(s)>

| Date | Day | Series | Video Length | Title | Notes |
|------|-----|--------|--------------|-------|-------|
| YYYY-MM-DD | Thu | documentary | long | <title> | anchor |

### Weekly Distribution
| Week | Dates | Long-form | Shorts | Total |
|------|-------|-----------|--------|-------|
| Wk 1 | DD–DD <month> | <n> | <n> | <n> |

### Cadence Check
| Constraint | Rule (from KB/briefing) | Status |
|------------|------|--------|
| Long-form per week | per KB | PASS / FAIL |
| Shorts per week | per KB | PASS / FAIL |
| Series alternation (no consecutive same series) | 0 violations | PASS / FAIL |
| Documentary in anchor window | per KB | PASS / FAIL |
| Key-date alignment | <N> of <N> | PASS / FAIL |
| All approved ideas scheduled | <N> of <N> | PASS / FAIL |

---
YouTube calendar written to the YouTube channel_plan as schedule_entries (propose-state, status='scheduled').

Approve the schedule in the dashboard to finalise the publish calendar.
```

## Output

- `schedule_entries` written to the YouTube `channel_plan` via `save_schedule_entries` (whole-set replace), one entry per approved idea with `idea_id`, `publish_at`, and `notes`; entries persist at `status='scheduled'`.

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **No auto-approval.** The operator reviews and approves the schedule in the dashboard.
- Cadence constraints come from `channels/youtube` + `rules/scheduling` (the KB) applied to the month's briefing — the KB wins on any conflict. YouTube's publish rhythm (weekly long-form + Shorts) is fundamentally different from Facebook's daily-post cadence; do not apply Facebook cadence rules here.
- Requires `edit` capability (plus `view` for the reads via `get_channel_plan` and `list_ideas`).
