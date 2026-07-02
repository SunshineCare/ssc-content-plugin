---
name: ssc-youtube-briefing
description: Derives the YouTube briefing for a Cambridge Diet Vietnam monthly plan — turns the approved month context + targets into concrete YouTube parameters (video count, format mix by buyer stage, cadence, themes mapped to videos). Writes them onto the plan under targets.youtube. Propose-only; no human gate (flows into ideate).
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: youtube
  tools: [get_knowledge, get_monthly_plan, save_monthly_plan]
---

# Monthly YouTube Briefing (`ssc-youtube-briefing`)

You derive concrete YouTube video parameters from an approved month context and write them onto the monthly plan. You are propose-only: you write only via `save_monthly_plan` and stop immediately after. There is no human gate after this skill — outputs flow directly into the YouTube ideation phase. You NEVER call any `approve_*`, publish, or schedule tool.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)
- `plan_id` — the monthly plan document to read from and write to

## Procedure

### Step 1: Read the plan

Call `get_monthly_plan(plan_id)` to load the current plan.

**Gate-check:** If `contextApproved` is not `true`, STOP immediately and tell the operator:

> Context has not been approved yet. Please review and approve the month context in the dashboard before running this skill.

Do not proceed past this gate under any circumstances.

If `contextApproved` is `true`, extract and hold the following from the response for use in Steps 3 and 4:

- `targets` — the full current targets object (must be merged in Step 4, not replaced)
- `targets.priorityPillars` — the ranked pillar list set by the context phase
- `targets.themes` — the month themes set by the context phase
- `targets.keyDates` — key dates or campaign moments for the month
- `phase_status` — the full current phase_status object (must be merged in Step 4)

### Step 2: Load YouTube knowledge

Call `get_knowledge` for each of these three verified paths:

- `channels/youtube` — the YouTube channel strategy: content series, cadence rules (1–2 long-form/week + 1–2 Shorts/week), format catalogue, buyer-stage mapping, SEO priorities, and tone
- `brand/personas` — the three core audience archetypes (Chị Lan, Chị Hương, Chị Mai) and their value priorities
- `brand/journey-stages` — the 7 emotional journey stages and their content implications

Read these documents carefully. Use them to assign video counts per buyer stage and select formats appropriate to each stage and persona.

### Step 3: Derive YouTube parameters

Using the plan's `targets.priorityPillars`, `targets.themes`, and `targets.keyDates` from Step 1, and the knowledge loaded in Step 2, derive the following three parameters:

**A. Video count by buyer stage (`stageMix`)**

Assign video counts to the three buyer stages (awareness, consideration, decision) such that:

- The total across all stages represents the month's planned long-form video output — typically 4–8 long-form videos for the month (derived from the 1–2 per week cadence in `channels/youtube`).
- Awareness-stage videos dominate when the month themes target new audiences or brand-building; consideration-stage dominates when themes address trust and education; decision-stage videos are used sparingly (1–2) to support consultants closing.
- Priority content series from `channels/youtube` (Kiều My Documentary, Chị Em Chúng Mình, Khoa Học Giải Thích, Tâm Sự Phụ Nữ, Customer Stories) inform the stage assignment — e.g. documentary = awareness, science series = consideration, customer stories = decision.
- Also estimate Shorts count for the month (typically 4–8 Shorts at 1–2/week) — Shorts reuse Facebook Reels content and complement long-form; list them separately in the output.

**B. Format mix by buyer stage (`formatMix`)**

For each buyer stage, specify the recommended video format(s) from the `channels/youtube` catalogue. Rules:

- Use series names exactly as they appear in `channels/youtube`: e.g. `documentary`, `consultant-spotlight`, `science-explained`, `womens-conversation`, `customer-story`, `shorts`.
- Assign each planned video to its series. Derive from the content series descriptions in `channels/youtube` and the pillar distribution — education-heavy months lean toward `science-explained`; social-proof months lean toward `customer-story` and `consultant-spotlight`; brand-building months lean toward `documentary` and `womens-conversation`.
- No series should receive zero videos unless it is genuinely off-strategy for the month (explain briefly in the output table).

**C. Themes mapped to videos (`themes`)**

For each month theme from `targets.themes`, map it to the YouTube context:
- Which content series it primarily activates.
- Which buyer stage it targets (awareness / consideration / decision).
- Which persona archetype(s) it speaks to (from `brand/personas`).
- The most suitable format(s) for videos in that theme.

### Step 4: Write YouTube params onto the plan

Call `save_monthly_plan` with:

- `plan_id` — unchanged
- `period` — unchanged
- `targets` — the **full merged** targets object. Start from the `targets` object read in Step 1. Add a `youtube` key to it:

  ```json
  {
    "priorityPillars": "<carry through unchanged from Step 1>",
    "themes": "<carry through unchanged from Step 1>",
    "keyDates": "<carry through unchanged from Step 1>",
    "youtube": {
      "videoCount": {
        "longForm": <total long-form count for the month>,
        "shorts": <total Shorts count for the month>
      },
      "stageMix": {
        "awareness": <count>,
        "consideration": <count>,
        "decision": <count>
      },
      "formatMix": {
        "documentary": <count>,
        "consultant-spotlight": <count>,
        "science-explained": <count>,
        "womens-conversation": <count>,
        "customer-story": <count>,
        "shorts": <count>
      },
      "themes": [
        {
          "theme": "<theme text>",
          "series": ["<series-name>"],
          "buyerStage": "<awareness|consideration|decision>",
          "personas": ["<archetype-name>"],
          "formats": ["<series-name>"]
        }
      ]
    }
  }
  ```

  Do NOT drop any existing keys from `targets` (priorityPillars, themes, keyDates, etc.). `save_monthly_plan` replaces the entire `targets` field — you must send the full merged object.

- `phase_status` — the **full merged** phase_status object. Start from the `phase_status` read in Step 1. Set `youtube` to `'in_progress'`:

  ```json
  {
    "context": "<carry through unchanged>",
    "youtube": "in_progress"
  }
  ```

  Do NOT drop any existing keys from `phase_status`. `save_monthly_plan` replaces the entire `phase_status` field — you must send the full merged object.

### Step 5: Output the YouTube params table

After saving, output:

```
## YouTube Briefing — <period>

**Long-form videos:** <N> | **Shorts:** <N>

### Stage Mix
| Buyer Stage | Videos | Primary Series |
|-------------|--------|----------------|
| Awareness | <n> | <series> |
| Consideration | <n> | <series> |
| Decision | <n> | <series> |

### Format Mix by Series
| Series | Count | Notes |
|--------|-------|-------|
| documentary | <n> | priority / mid-tier / off-strategy |
| consultant-spotlight | <n> | |
| science-explained | <n> | |
| womens-conversation | <n> | |
| customer-story | <n> | |
| shorts | <n> | reuse from Facebook Reels |

### Themes → YouTube Mapping
| Theme | Series | Buyer Stage | Persona(s) |
|-------|--------|-------------|------------|

---
YouTube params saved to plan `<plan_id>`. Phase status: youtube = in_progress.
```

## Output

- `targets.youtube` written to the monthly plan with `videoCount`, `stageMix`, `formatMix`, and `themes`
- `phase_status.youtube` set to `'in_progress'`
- All other existing `targets` and `phase_status` keys preserved

## Governance

- Propose-only. Writes only via `save_monthly_plan`. NEVER calls `approve_*`, `publish_*`, or any content-creation or scheduling tool.
- NEVER sets `contextApproved` or any approval flag.
- References only the three knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- Series names must be exactly `documentary`, `consultant-spotlight`, `science-explained`, `womens-conversation`, `customer-story`, `shorts` — no other values.
- Valid `phase_status` values are: `pending`, `in_progress`, `proposed`, `done`, `approved`. Do not invent other values.
- Requires `edit` capability (plus `view` for the knowledge reads).
