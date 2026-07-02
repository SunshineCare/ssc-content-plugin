---
name: ssc-post-research
description: Runs the Research step of the standalone Cambridge Diet Vietnam Posts pipeline. Gated on the approved Focus (tactics_approved). Does a light WebSearch pass (Vietnamese cultural calendar, seasonal triggers, competitor/platform signals) plus KB synthesis, then derives the month's channel targets — the month brief (context), the pillar distribution (~30), and the format-mix/totals. Writes context via save_channel_plan, the pillar distribution via save_plan_targets, and the format mix + totals via the post detail path. Propose-only; ends at the Research gate; never sets approved.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [get_knowledge, search_knowledge, WebSearch, get_performance_analysis, get_channel_plan, list_taxonomies, save_channel_plan, save_plan_targets]
---

# Post Research (`ssc-post-research`)

You run the **Research** step of the standalone Cambridge Diet Vietnam Posts pipeline. You read the approved Focus (tactics), run a **light** month research pass, synthesise the month brief, and derive the channel targets for Posts: the **pillar distribution** (summing to ~30), the **format mix**, and the **totals/cadence**. The approved tactics are the **steering** for the month — the KB and month research supply the detail that *fulfils* them. You are propose-only: you write `context` (the brief) via `save_channel_plan`, the pillar distribution via `save_plan_targets`, and the format-mix/totals via the post `detail` payload, then stop. A human reviews and approves the Research in the dashboard before Ideate begins. You NEVER call any `approve_*`, publish, or schedule tool, and you NEVER set `approved`.

This step **absorbs the old `ssc-post-briefing`** — the channel-level params (pillar distribution, format mix) are produced here and reviewed at the single Research gate, not as a separate gateless step.

This is step 2 of the five-step Posts pipeline (**Focus → Research → Ideate → Schedule → Measure**), keyed on `channel_plans(channel='post', period=YYYY-MM)`.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the Focus

Call:

```
Call: get_channel_plan
  channel: post
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.tactics_approved` is not `true`, STOP immediately and tell the operator:

> The Focus (tactics) has not been approved yet. Please review and approve the Focus in the dashboard before running Research.

Do not proceed past this gate under any circumstances.

If `plan.tactics_approved` is `true`, extract and hold:

- `plan.tactics` — the approved tactical plan (markdown). This is the **primary steering** for everything that follows.
- `plan.id` — the plan id, for `save_plan_targets`.

### Step 2: Load brand context

Call `get_knowledge` for each of these verified paths:

- `brand/personas` — the three core audience archetypes (who we are writing for)
- `brand/journey-stages` — where personas sit in the weight-loss journey (awareness → commitment → maintenance)
- `brand/positioning` — Cambridge Diet Vietnam's brand promise and differentiation
- `content/pillars` — the content pillar strategy and the pillar names (what topics CDV should own)
- `channels/facebook` — Facebook content strategy (format mix, tone, posting rhythm)

Read these carefully. Use the KB to understand *how* to execute the approved tactics — it supplies voice, audience framing, pillar vocabulary, and channel constraints, not the strategic direction itself (that is the approved `tactics`).

### Step 3: Light month research

Run a **light** `WebSearch` pass — a few targeted queries only. This is NOT the depth of the strategic review; it is a quick calendar + signals scan to ground the brief in the actual month.

Search for:

1. **Vietnamese cultural calendar** — public holidays, observances, and significant dates in `period` (e.g. Tết Dương lịch, Women's Day, Vietnamese National Day, seasonal events).
2. **Seasonal weight-loss / health triggers** — common Vietnamese health behaviours, motivation patterns, or physical conditions associated with this time of year (e.g. post-Tết resets, pre-summer prep, rainy-season inactivity).
3. **Competitor / platform signals** — a brief scan of what Cambridge Diet Vietnam competitors or health/nutrition brands are doing on Facebook this month; any notable platform feature or algorithm shift worth noting.

Keep this to 3–5 queries total. Orient the queries toward evidence that helps fulfil the approved tactics (e.g. if a tactic targets a specific persona trigger, search for that trigger's seasonal expression). Note what you find and what is absent or unclear.

### Step 4: Ground in performance (optional)

Call `get_performance_analysis` for the prior month (subtract one month from `period`, e.g. if `period` is `2026-07` call for `2026-06`). If it returns `{ analysis: null }`, note "no prior performance data available" and proceed.

Use any returned data to prioritise which pillars best serve the tactics and to flag any engagement/reach signals that suggest a topic or format shift. Do not block on missing data — this is supplementary grounding, not a requirement.

### Step 5: Write the month brief (`context`)

Call `save_channel_plan` with `channel='post'`, `period`, and `context` — a markdown document **written entirely in Vietnamese (including the section headings — translate the English template headings below)**. The brief is a persisted artifact the Vietnamese operator reviews and approves in the dashboard; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English). Structure:

```
## Approved Focus — <period>
<Restate the approved tactics verbatim or as a concise summary so the brief is self-contained.>

## Cultural & Events Calendar — <period>
<Bullet list of holidays, observances, and significant dates for the month. Flag which dates are most relevant to executing the approved tactics.>

## Seasonal Pain Points & Archetype Mapping
<3–5 seasonal health/weight-loss pain points, each mapped to the most relevant persona archetype(s) from brand/personas. Prioritise pain points that align with or amplify the approved tactics. Name the archetype, describe the seasonal trigger, and explain why it matters this month.>

## Competitor & Platform Watch
<Brief notes (2–4 bullets) on competitor activity or platform signals observed in Step 3. If nothing significant was found, state that clearly rather than padding.>

## Priority Pillars This Month
<Rank the top 2–3 content pillars for the month by how well they serve the approved tactics, supplemented by seasonal context and performance signals from Step 4. One-sentence rationale for each.>

## Key Dates
<Dates with meaningful content opportunity (cultural dates, campaign moments, platform events) and a brief content hook for each; omit dates with no clear hook.>

## Team Context Template
<A short block the team can fill in with internal constraints or opportunities for the month — e.g. upcoming product launches, consultant capacity, campaign budgets, or creative assets in production. Leave as a template with placeholder prompts; do not fabricate specifics.>
```

`save_channel_plan` upserts by `(channel='post', period)` and writes propose-state only — it never flips a gate.

### Step 6: Derive and write the channel targets

Using the approved tactics, the priority pillars from Step 5, and `content/pillars` + `channels/facebook` from Step 2, derive the Posts channel parameters.

**A. Pillar distribution → `save_plan_targets`**

Assign topic counts across the content pillars so that the total sums to **approximately 30 posts**:

- Priority pillars (those ranked first in the brief) receive the highest counts — typically 7–10 each for the top two, then 4–6 for mid-tier, then 1–3 for low-priority.
- The distribution must be a round integer per pillar; no pillar receives zero unless it is genuinely off-strategy for the month (note it in the output).

**Resolve pillar codes → ids (do this before writing).** Call `list_taxonomies(kind='pillar')`, then build a `code → id` map from the returned rows (each row carries `code` like `P1`–`P4` and its `taxonomies.id`). Use those `id`s as the `term_id` in `save_plan_targets` — NEVER pass a pillar code (e.g. `P2`) and NEVER invent an id. A wrong `term_id` fails the FK or mis-attaches the distribution to the wrong pillar.

Write the distribution as a SET of `plan_targets` rows, one per pillar. Each row pairs the pillar's resolved **leaf taxonomy `term_id`** (from the `code → id` map above) with the integer count as `target_value`:

```
Call: save_plan_targets
  plan_id: <plan.id from Step 1>
  targets: [
    { term_id: "<pillar leaf term id>", target_value: <count> },
    { term_id: "<pillar leaf term id>", target_value: <count> }
  ]
```

`save_plan_targets` replaces the whole `plan_targets` set (DELETE-then-INSERT) — send the **complete** pillar distribution in one call.

**B. Format mix + totals → the post `detail` path**

Call `save_channel_plan` again (same `channel='post'`, `period`) with a `detail` payload carrying the post channel knobs:

```
Call: save_channel_plan
  channel: post
  period: <period>
  detail: {
    totalTarget: 30,
    postsPerWeekMin: <min, e.g. 6>,
    postsPerWeekMax: <max, e.g. 9>,
    formatMix: { image: <pct>, carousel: <pct>, video: <pct>, reel: <pct> }
  }
```

Rules for `formatMix`:

- Use only these four format names exactly: `image`, `carousel`, `video`, `reel`.
- Percentages must sum to 100.
- Derive the mix from `channels/facebook` and the pillar distribution — education-heavy pillars lean carousel; social proof and transformation lean image and reel; tutorial content leans video.

`totalTarget` should equal the pillar-distribution total (~30). `postsPerWeekMin/Max` express the cadence band that the later Schedule step enforces.

> **Note — `detail` must match the post channel.** Only post keys (`totalTarget`, `postsPerWeekMin`, `postsPerWeekMax`, `formatMix`) are valid here; the repo rejects ad/youtube keys for a post plan.

### Step 7: Output summary

After saving, output:

```
## Post Research — <period>

**Status:** Proposed (pending human review)

**Tactics steering:** loaded — Research derives from the approved Focus

### Pillar Distribution (~30)
| Pillar | Posts | Notes |
|--------|-------|-------|
| <pillar> | <n> | priority / mid-tier / low |

### Format Mix
| Format | % |
|--------|---|
| image | <n>% |
| carousel | <n>% |
| video | <n>% |
| reel | <n>% |

**Totals:** totalTarget ~30, postsPerWeek <min>–<max>

**Research notes:**
- Cultural calendar: <1-line summary>
- Seasonal triggers: <1-line summary>
- Competitor/platform signals: <1-line summary or "nothing significant observed">
- Prior performance data: <"loaded" or "not available">

---
Brief (`context`), pillar distribution (`plan_targets`), and format mix/totals (post detail) saved to the post channel_plan. Approve the Research in the dashboard (flips `approved`), then re-invoke the agent to begin Ideate.
```

## Output

- `context` written to the post `channel_plan` (markdown brief)
- `plan_targets` set to the pillar distribution (one row per pillar, `term_id` + `target_value`)
- post `detail` set to `totalTarget`, `postsPerWeekMin/Max`, `formatMix`
- No gate flipped

## Governance

- Propose-only. Writes only via `save_channel_plan` and `save_plan_targets`. NEVER calls `approve_*`, `publish_*`, or any content-creation or scheduling tool.
- NEVER sets `approved` (the Research gate) or any approval flag. Flipping it is a dashboard-only action (`approve_channel_plan`, gate `plan`).
- Always gate-check `tactics_approved` first (Step 1). If the Focus is not approved, STOP — do not load the KB, run research, or write anything.
- Research (Step 3) is intentionally light — 3–5 queries maximum. Do not expand into a deep multi-source pass; that is the strategic review's job.
- Reference only the 5 knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- Format names must be exactly `image`, `carousel`, `video`, `reel` — no other values.
- `detail` must carry only post-channel keys; the repo rejects ad/youtube keys for a post plan.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads).
