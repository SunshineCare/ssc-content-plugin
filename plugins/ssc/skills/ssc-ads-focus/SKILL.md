---
name: ssc-ads-focus
description: >-
  Drafts the month's Focus — the tactical plan — for the standalone Cambridge Diet Vietnam Ads pipeline. Turns the quarter's already-defined strategy (marked findings + approved directions, passed in by the agent) plus the prior period's ad retrospective into the month's ad tactics: which quarterly angles to push in paid, the priority-pillar bets, and the tactical themes. Writes the tactics onto the ad channel_plan via save_channel_plan for a human to review, edit, and approve. Propose-only; ends at the Focus gate; never sets tactics_approved.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, get_channel_plan, save_channel_plan]
---

# Ads Focus (`ssc-ads-focus`)

You draft the **Focus** — the month's *bets* — for the standalone Cambridge Diet Vietnam Ads pipeline, translating the quarter's already-defined strategy into concrete monthly priorities for the paid (Ads) channel. The agent passes the strategy in — you never fetch it yourself. You read the **prior period's ad retrospective** off the previous month's ad plan to carry winning angles forward and drop fatigued ones. You write the draft onto the ad `channel_plan` via `save_channel_plan(channel='ad', period, tactics=…)` and hand off to a human for review, edit, and approval. You **never approve** — flipping `tactics_approved` is a dashboard-only action.

The Focus is **the bets only** — which pillars/angles/themes to push in paid this month and why. It is NOT the creative "how" (which themes to attack each layer with, persona triggers, differentiation moves) — that is the **Approaches** step, which runs after Focus is approved. Keep this doc at the level of strategic intent; do not describe the creative realization.

This is step 1 of the five-step Ads pipeline (**Focus → Approaches → Blueprint → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the ad plan is self-contained.

## Inputs (provided by the ads-pipeline agent)

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)
- `strategy` — one of:
  - `{ strategy_brief_id, findings, directions: { themes, dimensions } }` — the quarter's approved strategy brief (marked findings + approved directions)
  - `null` — no strategy brief exists for this quarter

## Procedure

### Step 1: Read the prior period's ad retrospective

Resolve the **prior period** by decrementing `period` one calendar month (e.g. Focus for `2026-07` reads the `2026-06` ad plan; January rolls back to the prior December). Then call:

```
Call: get_channel_plan
  channel: ad
  period: <prior period, YYYY-MM>
```

From the returned `{ plan }`:

- If `plan` is non-null and `plan.retrospective` is a non-empty string — this is the **Measure → Focus carry-forward**. Read it as prose: which ad angles were winning (carry forward), which were fatigued/inefficient (drop or refresh), and what to try next. Let it shape the tactical bets — paid creative fatigues fast, so the retrospective's winning/fatigued split is the single strongest signal for this month's angle bets. **The retrospective grades each angle by its TIER on the tier's own KPI — read those grades tier-correctly (do not collapse them onto one metric):**
  - **L1 (cold) & L3 (warm)** are graded on **cost-per-purchase**. L3 winners are the money tier — bias toward carrying + leaning into them. L1 runs ~1.8–2× warm cost by design — that is funnel-intake, NOT a reason to drop an L1 angle.
  - **L2 (awareness / omnipresence)** is graded on **reach / CPM / frequency**, never cost-per-purchase. A winning L2 angle has large reach + low CPM (and ~0 purchases is correct) — never drop an omnipresence angle for "low purchases." An L2 angle is "fatigued" only on frequency >3.5 / rising CPM.
- If `plan` is null, or `plan.retrospective` is null/empty — note "no prior ad retrospective" and proceed on the quarterly strategy alone. Do not block.

This read is read-only and degrades gracefully — a missing prior plan or empty retrospective is normal (first month, or Measure not yet run).

### Step 2: Read the strategy

**If `strategy` is non-null** — it is the primary driver. Use it directly:
- `directions.themes` — the approved strategic priorities for the quarter
- `findings` (marked findings only) — signals the operator kept; the concrete angles and insights to act on. Prefer findings carrying an `ad_market` dimension when present — those are the paid-angle signals most directly relevant to the Ads channel.
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

Write a tight, **editable** plan of the month's bets in markdown — NOT the creative how, and NOT the execution numbers. The Approaches step (which runs after Focus is approved) turns the bets into concrete creative approaches per layer; the Blueprint step (after Approaches) derives the budget split, layer %, creative counts, and the full ad-set build map. Keep the Focus at the level of *which bets and why*. The tactics doc covers:

1. **Tactical themes for [period]** — which of the quarter's strategic themes land *this* month in paid. A quarter's strategy spreads across 3 months; pick the 1-3 themes that fit this month's position in the quarter (early = build awareness, mid = push consideration, late = consolidate/re-convert).

2. **Angles to activate this month** — from the marked findings in the strategy, select which specific paid angles to push now. For each: one sentence on the angle, one sentence on why *this* month. Where the prior ad retrospective named a winning angle, prefer carrying it forward; where it named a fatigued/inefficient angle, explicitly drop or refresh it — but **honour the tier each grade came from** (Step 1): protect/lean into L3 cost-per-purchase winners, keep proven L1 intake angles even at ~2× warm cost, and carry winning L2 omnipresence angles on their reach/CPM merit (never drop them for low purchases). Name the angle as a *bet* (the strategic direction to push) — the creative realization (per-layer attack, persona triggers, frames, slot instantiation) is the Approaches and Blueprint steps' job, not the Focus's.

3. **Priority-pillar bets** — which content pillars to emphasise in paid this month and why (audience demand, strategic gap, seasonal fit, or a retrospective signal).

4. **Monthly emphasis** — a 2-3 sentence statement of how the quarter strategy translates into this month's specific bets for Ads. Concrete enough that the Approaches step can build creative approaches on it and the Blueprint step can size the budget and derive the ad-set build map.

Keep the doc under ~400 words. Use `##` headings for each section. **Write the entire tactics doc in Vietnamese — including the section headings.** It is a persisted artifact the Vietnamese operator reviews, edits, and approves in the dashboard, so the prose must be Vietnamese (your chat-side reasoning can stay English). Use a direct, operational voice — this is a working plan, not a memo. **Never use the acronym "RCT" — write "nghiên cứu lâm sàng độc lập".**

### Step 4: Write the tactics onto the ad plan

```
Call: save_channel_plan
  channel: ad
  period: <period>
  tactics: <the markdown tactics doc from Step 3>
  strategy_brief_id: <strategy_brief_id from the passed strategy, or omit when none>
```

`save_channel_plan` upserts by `(channel='ad', period)` — calling it creates the ad plan for the month if it does not exist yet, or updates the `tactics` field if it does (unset fields are preserved). It writes **propose-state only** — it never flips a gate. Do NOT pass any approval field.

### Step 5: Output summary

Emit a plain-text summary:

```
## Ads Focus Drafted — <period>

Channel: ad
Strategy brief: <strategy_brief_id, or "none — KB fallback used">
Prior ad retrospective: <"loaded from <prior period>" or "none — quarterly strategy only">

### Tactical themes activated this month
- [theme 1]
- [theme 2]
- …

### Priority pillars
- [pillar 1] — [one-line reason]
- [pillar 2] — [one-line reason]

### Carried forward / dropped (from prior ad retrospective — tier-correct)
- Carry: [winning angle + its tier, e.g. "safety-EU (L3 cost-per-purchase winner)", or "none"]
- Drop/refresh: [fatigued angle + tier signal, e.g. "X (L2 frequency >3.5)", or "none"]

### Monthly emphasis
[2-3 sentence statement]

Tactics written to the ad channel_plan (propose-state).

Next step: review, edit, and approve the Focus in the dashboard (flips `tactics_approved`), then re-invoke the agent to begin Approaches.
```

## Output

- `tactics` written to the ad `channel_plan` (markdown)
- The ad plan upserted for `(channel='ad', period)` if it did not exist
- No gate flipped

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Writes only via `save_channel_plan`.
- **Never approves.** Does not set `tactics_approved`, `approved`, or any approval flag. Flipping the Focus gate is a dashboard-only action requiring the `approve` capability (via `approve(entity='channel_plan', gate='tactics')`).
- Does not call `get_strategy_brief` — the agent resolves the strategy and passes it in.
- The prior-period read (Step 1) is read-only and never blocks: a missing prior plan or empty `retrospective` is normal.
- **Tier-correct carry-forward.** When the retrospective carries tier grades, honour each grade's tier: cost-per-purchase judges only L1/L3 (protect/scale L3, keep L1 at funnel-intake); L2 omnipresence is judged on reach/CPM/frequency and is never dropped for low purchases.
- KB fallback uses only `content/pillars` and `brand/personas` — no other knowledge reads are needed; the passed strategy is the primary driver.
- No `approve` verb (the ONLY gated promotion), no `edit` used to demote/unapprove a row, no `edit_knowledge`, no `publish_strategy_knowledge`.
- Does NOT write the creative "how" (per-layer approaches, persona triggers, differentiation) — that is the Approaches step's output (`context`). Does NOT write budget split, layer %, the ad-set build map, or creative counts — those are the Blueprint step's outputs. Focus carries only the bets / tactical intent (`tactics`).
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the `get_channel_plan` and `get_knowledge` reads).
