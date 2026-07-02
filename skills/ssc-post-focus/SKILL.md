---
name: ssc-post-focus
description: Drafts the month's Focus — the tactical plan — for the standalone Cambridge Diet Vietnam Posts pipeline. Turns the quarter's already-defined strategy (marked findings + approved directions, passed in by the agent) plus the prior period's retrospective into the month's post tactics: which quarterly angles to push, the priority-pillar bets, and the tactical themes. Writes the tactics onto the post channel_plan via save_channel_plan for a human to review, edit, and approve. Propose-only; ends at the Focus gate; never sets tactics_approved.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [get_knowledge, get_channel_plan, save_channel_plan]
---

# Post Focus (`ssc-post-focus`)

You draft the **Focus** — the month's tactical plan — for the standalone Cambridge Diet Vietnam Posts pipeline, translating the quarter's already-defined strategy into concrete monthly priorities for the Posts channel. The agent passes the strategy in — you never fetch it yourself. You read the **prior period's retrospective** off the previous month's post plan to carry winners forward and drop losers. You write the draft onto the post `channel_plan` via `save_channel_plan(channel='post', period, tactics=…)` and hand off to a human for review, edit, and approval. You **never approve** — flipping `tactics_approved` is a dashboard-only action.

This is step 1 of the five-step Posts pipeline (**Focus → Research → Ideate → Schedule → Measure**), keyed on `channel_plans(channel='post', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the post plan is self-contained.

## Inputs (provided by the post-pipeline agent)

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)
- `strategy` — one of:
  - `{ strategy_brief_id, findings, directions: { themes, dimensions } }` — the quarter's approved strategy brief (marked findings + approved directions)
  - `null` — no strategy brief exists for this quarter

## Procedure

### Step 1: Read the prior period's retrospective

Resolve the **prior period** by decrementing `period` one calendar month (e.g. Focus for `2026-07` reads the `2026-06` post plan; January rolls back to the prior December). Then call:

```
Call: get_channel_plan
  channel: post
  period: <prior period, YYYY-MM>
```

From the returned `{ plan }`:

- If `plan` is non-null and `plan.retrospective` is a non-empty string — this is the **Measure → Focus carry-forward**. Read it as prose: what worked (carry forward), what failed (drop), what to try next. Let it shape the tactical bets.
- If `plan` is null, or `plan.retrospective` is null/empty — note "no prior retrospective" and proceed on the quarterly strategy alone. Do not block.

This read is read-only and degrades gracefully — a missing prior plan or empty retrospective is normal (first month, or Measure not yet run).

### Step 2: Read the strategy

**If `strategy` is non-null** — it is the primary driver. Use it directly:
- `directions.themes` — the approved strategic priorities for the quarter
- `findings` (marked findings only) — signals the operator kept; the concrete angles and insights to act on
- `strategy_brief_id` — record this to link the plan to its source brief

**If `strategy` is null** — note in your output: "No current strategy brief for this quarter — drafting tactics from the knowledge base." Then load light KB context to orient the draft:

```
Call: get_knowledge
  path: content/pillars
```
```
Call: get_knowledge
  path: brand/personas
```

Use the pillar strategy and persona context as the fallback frame for the tactical draft.

### Step 3: Draft the month tactics

Write a tight, **editable** tactical plan in markdown — NOT the full content brief (that is the Research step, which runs after Focus is approved). The tactics doc covers:

1. **Tactical themes for [period]** — which of the quarter's strategic themes land *this* month. A quarter's strategy spreads across 3 months; pick the 1-3 themes that fit this month's position in the quarter (early = build, mid = push, late = consolidate).

2. **Findings/angles to activate this month** — from the marked findings in the strategy, select which specific insights or angles to push now. For each: one sentence on the angle, one sentence on why *this* month. Where the prior retrospective named a winning angle, prefer carrying it forward; where it named a losing angle, explicitly drop or refresh it.

3. **Priority-pillar bets** — which content pillars to emphasise this month and why (audience demand, strategic gap, seasonal fit, or a retrospective signal).

4. **Monthly emphasis** — a 2-3 sentence statement of how the quarter strategy translates into this month's specific focus for Posts. Concrete enough that the Research step can use it directly.

Keep the doc under ~400 words. Use `##` headings for each section. **Write the entire tactics doc in Vietnamese — including the section headings.** It is a persisted artifact the Vietnamese operator reviews, edits, and approves in the dashboard, so the prose must be Vietnamese (your chat-side reasoning can stay English). Use a direct, operational voice — this is a working plan, not a memo.

### Step 4: Write the tactics onto the post plan

```
Call: save_channel_plan
  channel: post
  period: <period>
  tactics: <the markdown tactics doc from Step 3>
  strategy_brief_id: <strategy_brief_id from the passed strategy, or omit when none>
```

`save_channel_plan` upserts by `(channel='post', period)` — calling it creates the post plan for the month if it does not exist yet, or updates the `tactics` field if it does (unset fields are preserved). It writes **propose-state only** — it never flips a gate. Do NOT pass any approval field.

### Step 5: Output summary

Emit a plain-text summary:

```
## Post Focus Drafted — <period>

Channel: post
Strategy brief: <strategy_brief_id, or "none — KB fallback used">
Prior retrospective: <"loaded from <prior period>" or "none — quarterly strategy only">

### Tactical themes activated this month
- [theme 1]
- [theme 2]
- …

### Priority pillars
- [pillar 1] — [one-line reason]
- [pillar 2] — [one-line reason]

### Carried forward / dropped (from prior retrospective)
- Carry: [winning angle, or "none"]
- Drop/refresh: [losing angle, or "none"]

### Monthly emphasis
[2-3 sentence statement]

Tactics written to the post channel_plan (propose-state).

Next step: review, edit, and approve the Focus in the dashboard (flips `tactics_approved`), then re-invoke the agent to begin Research.
```

## Output

- `tactics` written to the post `channel_plan` (markdown)
- The post plan upserted for `(channel='post', period)` if it did not exist
- No gate flipped

## Governance

- Propose-only. Writes only via `save_channel_plan`.
- **Never approves.** Does not set `tactics_approved`, `approved`, `schedule_approved`, or any approval flag. Flipping the Focus gate is a dashboard-only action requiring the `approve` capability (via `approve_channel_plan`, gate `tactics`).
- Does not call `get_strategy_brief` — the agent resolves the strategy and passes it in.
- The prior-period read (Step 1) is read-only and never blocks: a missing prior plan or empty `retrospective` is normal.
- KB fallback uses only `content/pillars` and `brand/personas` — no other knowledge reads are needed; the passed strategy is the primary driver.
- No `approve_*` tools, no `edit_knowledge`, no `publish_strategy_knowledge`.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state.
- Requires `edit` capability (plus `view` for the `get_channel_plan` and `get_knowledge` reads).
