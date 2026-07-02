---
name: ssc-post-schedule
description: Builds the proposed publish calendar for the standalone Cambridge Diet Vietnam Posts pipeline — reads the plan's approved post ideas and assigns each a publish date enforcing the cadence rules (no same pillar on consecutive days, 6–9 posts per week, posts on key dates with build-up). Writes the calendar as schedule_entries via save_schedule_entries. Gated on the approved Research plan. Propose-only; the operator approves the calendar in the dashboard.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [get_knowledge, get_channel_plan, list_ideas, save_schedule_entries]
---

# Post Schedule (`ssc-post-schedule`)

You assign each approved post idea a publish date for the plan month, enforcing the brand's cadence rules, and write the resulting calendar onto the post `channel_plan` as `schedule_entries`. You are propose-only: you write only via `save_schedule_entries` and stop immediately after. The operator reviews and approves the calendar in the dashboard. You NEVER call any `approve_*`, `publish_*`, or content-creation tool, and you NEVER flip a gate.

This is step 4 of the five-step Posts pipeline (**Focus → Research → Ideate → Schedule → Measure**), keyed on `channel_plans(channel='post', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the post plan is self-contained.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the Research plan

Call:

```
Call: get_channel_plan
  channel: post
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.approved` is not `true`, STOP immediately and tell the operator:

> The Research plan has not been approved yet. Please review and approve Research in the dashboard before running Schedule.

Do not proceed past this gate under any circumstances. `save_schedule_entries` itself rejects an unapproved plan (`plan_not_approved`) — but stop here cleanly rather than relying on that rejection.

If `plan.approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_schedule_entries` as `plan_id`
- `plan.context` — the approved month brief (markdown). Read the **Key Dates** section for the month's key dates (events, campaigns, or moments the plan targets). If no key dates are present, proceed without key-date pinning — the cadence rules alone govern placement.

### Step 2: Read approved ideas

Call:

```
Call: list_ideas
  channel: post
  status: approved
```

Then keep only the ideas whose `plan_id` equals `plan.id` from Step 1 — these are the ideas the operator has approved for *this* post plan. (`list_ideas` filters by channel + status; scope to the plan by matching `plan_id` on the returned rows. Page via `next_cursor` if more than one page is returned.)

**Gate-check:** If no approved post ideas for this plan remain after filtering, STOP immediately and tell the operator:

> No approved ideas found for this post plan. Please review and approve ideas in the dashboard (Ideas → <period>, filter channel = post) before running this skill.

Do not proceed past this gate under any circumstances. Only move to Step 3 when at least one approved idea for this plan is present.

Hold the full list of approved ideas — you will need each idea's `id`, `pillar`, and any available scheduling metadata for Steps 3 and 4.

### Step 3: Load cadence rules

Call `get_knowledge` for `rules/scheduling` — the single source of truth for Cambridge Diet Vietnam's publish cadence. Read this document carefully. All scheduling constraints applied in Step 4 are sourced from it; if this document conflicts with any inline guidance below, the document wins.

### Step 4: Assign publish dates

Assign exactly one publish date (within the plan month, format `YYYY-MM-DD`) to each approved idea. Every approved idea must be scheduled exactly once — no omissions, no duplicates.

Apply all of the following constraints. The exact thresholds are governed by `rules/scheduling` (Step 3); the descriptions below are informational guides:

**A. No same pillar on consecutive days**

Within any two consecutive calendar days, no two posts may share the same pillar. If a pillar assignment would violate this rule, shift one of the conflicting posts to the nearest available date (forward or backward) that respects the constraint.

**B. 6–9 posts per calendar week**

Count the posts falling in each calendar week (Monday–Sunday) of the plan month. Each week must contain between 6 and 9 posts inclusive. Redistribute posts across days within a week if the initial placement creates over- or under-loaded weeks.

**C. Key-date pinning**

For each key date read from `plan.context` (Step 1):
- Schedule exactly one post **on** that date. Choose the idea whose pillar and topic are most directly relevant to the key date.
- Schedule 1–2 build-up posts in the 3 calendar days immediately preceding the key date. Build-up posts should be from the same or adjacent pillar to create narrative momentum into the key date.

If two key dates are close enough that their 3-day build-up windows overlap, prioritise the earlier key date's build-up and consolidate shared build-up posts where possible.

**D. Every approved idea scheduled exactly once**

After assigning all key-date and build-up posts, place the remaining ideas across the available dates in the month. Do not schedule any idea more than once. Do not leave any approved idea unscheduled.

**Working approach:** Start with key-date pinning (constraint C), then verify weekly cadence (constraint B) and adjust, then check consecutive-pillar conflicts (constraint A) and resolve. Iterate until all constraints are satisfied simultaneously.

### Step 5: Write the calendar as schedule_entries

Call `save_schedule_entries` with:

- `plan_id` — `plan.id` from Step 1
- `entries` — the full proposed calendar as a SET, one entry per approved idea, in date order (earliest first). Each entry references the idea by `idea_id` and carries a `publish_at` ISO 8601 timestamp:

  ```
  Call: save_schedule_entries
    plan_id: <plan.id>
    entries: [
      { idea_id: "<idea id>", publish_at: "<YYYY-MM-DD>T09:00:00+07:00" },
      { idea_id: "<idea id>", publish_at: "<YYYY-MM-DD>T09:00:00+07:00" }
    ]
  ```

  Every approved idea from Step 2 must appear exactly once in this array. `publish_at` dates must fall within the plan month specified by `period`. Use a consistent publish time-of-day (e.g. `09:00:00+07:00`, Vietnam time) unless `rules/scheduling` specifies otherwise.

`save_schedule_entries` replaces the whole `schedule_entries` set (DELETE-then-INSERT) — send the **complete** calendar in one call. It **rejects** with `plan_not_approved` unless the plan's `approved` gate is true (the Research gate gates scheduling); the Step 1 gate-check ensures this passes. Entries are persisted with the default `status='scheduled'`; the skill never stamps a per-entry approval. It writes **propose-state only** — it never flips the Calendar gate.

### Step 6: Output the calendar

After saving, output the full proposed calendar in date order, then prompt the operator to approve:

```
## Proposed Publish Calendar — <period>

**Ideas scheduled:** <N>

| Date | Day | Pillar | Idea Title | Notes |
|------|-----|--------|------------|-------|
| YYYY-MM-DD | Mon | <pillar> | <title> | key date / build-up / — |

### Weekly Distribution
| Week | Dates | Posts |
|------|-------|-------|
| Wk 1 | DD–DD <month> | <n> |
| Wk 2 | DD–DD <month> | <n> |
| Wk 3 | DD–DD <month> | <n> |
| Wk 4 | DD–DD <month> | <n> |

### Cadence Check
| Constraint | Threshold | Status |
|------------|-----------|--------|
| Same pillar on consecutive days | 0 violations | PASS / FAIL |
| Posts per week (all weeks) | 6–9 | PASS / FAIL |
| Key dates with post on date | <N> of <N> | PASS / FAIL |
| Key dates with 1–2 build-up posts | <N> of <N> | PASS / FAIL |
| All approved ideas scheduled | <N> of <N> | PASS / FAIL |

---
Calendar written to the post channel_plan as schedule_entries (propose-state, status='scheduled').

Approve the calendar in the dashboard to finalise the publish schedule (flips `schedule_approved`), then re-invoke the agent to begin Measure.
```

## Output

- `schedule_entries` written to the post `channel_plan` via `save_schedule_entries`, one entry per approved idea with `idea_id` and a `publish_at` (`YYYY-MM-DD`Thh:mm:ss±tz) within the plan month
- All entries persisted with the default `status='scheduled'`
- No gate flipped — the Calendar gate (`schedule_approved`) is a dashboard-only human action

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Propose-only.** Writes only via `save_schedule_entries`. NEVER calls `approve_*`, `approve_channel_plan`, `publish_*`, `save_idea`, or any content-creation or social-scheduling tool, and NEVER flips a gate.
- **No auto-approval.** The operator reviews and approves the calendar in the dashboard. Flipping the Calendar gate (`schedule_approved`) is a dashboard-only action requiring the `approve` capability (via `approve_channel_plan`, gate `schedule`).
- Always gate-check `approved` first (Step 1). If the Research plan is not approved, STOP — do not read ideas or write anything.
- References only `rules/scheduling` as the knowledge source (Step 3). Do not call `get_knowledge` for any other path.
- All cadence thresholds are sourced from `rules/scheduling` — that document is the source of truth; inline numeric guidance above is informational only.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads via `get_channel_plan` and `list_ideas`).
