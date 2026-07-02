---
name: ssc-youtube-briefing
description: Derives the YouTube briefing for a Cambridge Diet Vietnam monthly YouTube cycle — turns the approved month context + tactics on the youtube channel_plan into concrete YouTube parameters (long-form/Shorts cadence, video counts by buyer stage and series, themes mapped to videos). Writes the cadence onto the plan detail via save_channel_plan and the distribution via save_plan_targets. Gated on the approved Focus (tactics_approved). Propose-only; the operator approves the briefing (the plan gate) in the content workspace.
metadata:
  type: skill
  stage: youtube-pipeline
  brand: cambridge-diet-vn
  section: youtube
  capability: edit
  tools: [get_knowledge, get_channel_plan, save_channel_plan, save_plan_targets, list_taxonomies]
---

# Monthly YouTube Briefing (`ssc-youtube-briefing`)

You derive concrete YouTube video parameters from the approved month context + tactics on the youtube `channel_plan` and write them onto that plan. You write only via `save_channel_plan` (the youtube cadence detail) and `save_plan_targets` (the buyer-stage and series distribution), and stop immediately after. You are propose-only: the operator reviews the briefing in the content workspace (`/content/youtube`) and approves it there — approving flips the plan's `approved` gate (via `approve_channel_plan`, gate `plan`, a dashboard-only action), which opens Ideate.

This is step 1 of the YouTube pipeline (**Briefing → Ideate → Schedule**), keyed on `channel_plans(channel='youtube', period=YYYY-MM)`. There is no monthly-plan dependency — the youtube plan is self-contained.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the Focus

Call:

```
Call: get_channel_plan
  channel: youtube
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.tactics_approved` is not `true`, STOP immediately and tell the operator:

> The YouTube month context/tactics have not been approved yet. Please review and approve them in the content workspace (`/content/youtube`) before running the briefing.

Do not proceed past this gate under any circumstances.

If `plan.tactics_approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_plan_targets`
- `plan.context` — the approved month brief (markdown): priority pillars/themes, key dates, seasonal moments
- `plan.tactics` — the approved month tactics (markdown): the bets and emphasis that shape the video mix

### Step 2: Load YouTube knowledge

Call `get_knowledge` for each of these three verified paths:

- `channels/youtube` — the YouTube channel strategy: content series, cadence rules, format catalogue, buyer-stage mapping, SEO priorities, and tone
- `brand/personas` — the core audience archetypes and their value priorities (the archetype names and definitions live in this document — do not assume them)
- `brand/journey-stages` — the emotional journey stages and their content implications

Read these documents carefully. Use them to assign video counts per buyer stage and select series appropriate to each stage and persona. These documents are the source of truth for cadence, series, and personas — never substitute remembered values.

### Step 3: Derive YouTube parameters

Using `plan.context` + `plan.tactics` from Step 1 and the knowledge from Step 2, derive:

**A. Cadence (`longFormPerWeek`, `shortsPerWeek`)**

Read the channel's long-form and Shorts cadence from `channels/youtube` and adjust for the month's tactics (a push month may run the top of the cadence range; a consolidation month the bottom). Do NOT assume a fixed count — the cadence in the document plus the month's tactics decide it. From the chosen weekly cadence and the number of publish weeks in `period`, compute the month's total long-form count and total Shorts count.

**B. Video count by buyer stage (the `buyer_stage` distribution)**

Assign the month's long-form total across the buyer stages defined in the `buyer_stage` taxonomy (awareness / consideration / decision) such that:

- The split follows the month's themes and tactics: brand-building/new-audience months weight awareness; trust/education months weight consideration; decision-stage videos support consultants closing and are used per the guidance in `channels/youtube`.
- The series → stage affinities in `channels/youtube` (and the `youtube_series` taxonomy metadata) inform the assignment — e.g. the documentary series leans awareness, the science series leans consideration, customer stories lean decision.

**C. Video count by series (the `youtube_series` distribution)**

Assign each planned video (long-form + Shorts) to a series from the `youtube_series` taxonomy / `channels/youtube` catalogue. Derive from the series descriptions and the month's pillar/theme emphasis. No series should receive zero videos unless it is genuinely off-strategy for the month (explain briefly in the output table).

**D. Themes mapped to videos**

For each month theme in `plan.context`/`plan.tactics`, map it to: the series it primarily activates, the buyer stage it targets, the persona archetype(s) it speaks to (from `brand/personas`), and the video length class. This mapping is presented in the Step 5 output for the operator and recorded in the targets rows' `meta` (below).

### Step 4: Write the briefing onto the plan (only the fields you own)

The per-channel save tools have patch semantics — `save_channel_plan` updates only the fields you pass (unset fields are preserved), so send ONLY what this skill owns. Do NOT re-send `context`, `tactics`, `status`, or any field another step wrote.

**4a. Cadence detail:**

```
Call: save_channel_plan
  channel: youtube
  period: <period>
  detail: { longFormPerWeek: <n>, shortsPerWeek: <n> }
```

**4b. Distribution targets.** First resolve term ids: call `list_taxonomies` (e.g. `list_taxonomies(kind='buyer_stage')` and `list_taxonomies(kind='youtube_series')`, or one unfiltered call) and build `code → id` maps. Then write the distribution as a SET — one row per leaf term with its count:

```
Call: save_plan_targets
  plan_id: <plan.id>
  targets: [
    { term_id: <buyer_stage:awareness id>,     target_value: <n> },
    { term_id: <buyer_stage:consideration id>, target_value: <n> },
    { term_id: <buyer_stage:decision id>,      target_value: <n> },
    { term_id: <youtube_series:… id>,          target_value: <n>,
      meta: { themes: ["<theme>"], personas: ["<persona code>"] } },
    …one row per series…
  ]
```

Pass resolved taxonomy **ids** in `term_id`, never codes. `save_plan_targets` replaces the plan's whole `plan_targets` set (DELETE-then-INSERT) — send the complete distribution (all buyer-stage rows + all series rows) in one call. This skill owns the youtube plan's `plan_targets`, so replacing the set is correct here.

### Step 5: Output the YouTube briefing table

After saving, output:

```
## YouTube Briefing — <period>

**Cadence:** <n> long-form/week + <n> Shorts/week (from channels/youtube + month tactics)
**Month totals:** <N> long-form | <N> Shorts

### Stage Mix
| Buyer Stage | Videos | Primary Series |
|-------------|--------|----------------|

### Series Mix
| Series | Count | Notes |
|--------|-------|-------|

### Themes → YouTube Mapping
| Theme | Series | Buyer Stage | Persona(s) |
|-------|--------|-------------|------------|

---
Briefing written to the youtube channel_plan (propose-state): detail {longFormPerWeek, shortsPerWeek} + plan_targets (buyer_stage + youtube_series distribution).

Next step: review the briefing in the content workspace (/content/youtube) and approve it (flips the plan's `approved` gate), then re-invoke the agent to begin Ideate.
```

## Output

- `detail.longFormPerWeek` / `detail.shortsPerWeek` written to the youtube `channel_plan`
- `plan_targets` written as a SET: one row per `buyer_stage` term and per `youtube_series` term with `target_value` counts (+ theme/persona `meta` on series rows)
- No gate flipped — the briefing is a proposal awaiting the operator's plan-gate approval

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Always gate-check `tactics_approved` first (Step 1). If the Focus is not approved, STOP — do not load the KB or write anything.
- Write only the fields you own: `detail` via `save_channel_plan` and the `plan_targets` set. Never pass `context`, `tactics`, `status`, or `retrospective` — the save tools patch only provided fields, so omitting them preserves other steps' writes.
- Derive counts and cadence from `channels/youtube` + the month's tactics/context — never from remembered defaults. Persona archetypes come from `brand/personas` — do not inline persona names.
- References only the three knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- Series and buyer-stage vocabularies are the `youtube_series` and `buyer_stage` taxonomies (via `list_taxonomies`) — never invent codes or ids.
- Operates only on the youtube channel (`channel='youtube'`); never reads or writes `post`/`ad` state.
- Requires `edit` capability (plus `view` for the reads).
