---
name: ssc-youtube-ideate
description: Generates the month's YouTube video ideas for a Cambridge Diet Vietnam monthly plan — reads the approved targets + YouTube briefing and the channel knowledge base, and produces draft video ideas via save_idea (channel='youtube', tagged to the plan), self-enforcing diversity, hook-variety, and banned-word rules. Propose-only; the ideas are drafts a human curates and approves in the dashboard.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: youtube
  tools: [get_knowledge, get_monthly_plan, save_idea, save_monthly_plan]
---

# Monthly YouTube Ideation (`ssc-youtube-ideate`)

You generate draft YouTube video ideas for a Cambridge Diet Vietnam monthly plan. You read the approved YouTube briefing (video count, stage mix, format mix, themes) from the plan, load the creative and channel knowledge base, generate one idea per planned video via `save_idea` with `channel='youtube'`, and self-enforce diversity and banned-word rules before finalising. You are propose-only: every idea is created as a DRAFT for a human to curate and approve in the dashboard. You NEVER call `approve_idea`, `update_status`, or any publish tool.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)
- `plan_id` — the monthly plan document to read from

## Procedure

### Step 1: Read the plan

Call `get_monthly_plan(plan_id)` to load the current plan.

Extract and hold:

- `targets.youtube.videoCount` — the long-form and Shorts counts set by the briefing phase
- `targets.youtube.stageMix` — the video count per buyer stage (awareness / consideration / decision)
- `targets.youtube.formatMix` — the series counts (documentary, consultant-spotlight, science-explained, womens-conversation, customer-story, shorts)
- `targets.youtube.themes` — themes with their series, buyer-stage, and persona mappings
- `targets.priorityPillars` — ranked pillar list (for tonal weight)
- `targets.themes` — the month's overarching themes
- `phase_status` — the full current phase_status object (must be merged in Step 5, not replaced)

**Gate-check:** If `targets.youtube` is absent or empty, STOP and tell the operator:

> YouTube briefing has not been written yet. Please run `ssc-youtube-briefing` first to derive the video count, stage mix, and format mix.

### Step 2: Load the creative knowledge base

Call `get_knowledge` for each of these eight verified paths:

- `channels/youtube` — the YouTube channel strategy: content series descriptions, cadence rules, SEO priorities, tone, Shorts approach, and the YouTube → Facebook repurposing workflow
- `voice/tone` — the brand tone and voice principles
- `voice/pronouns` — the pronoun system (Bạn + Mình/Chúng mình for YouTube; matches the channel's "Bạn" + "Mình" xưng hô)
- `voice/vocabulary` — approved vocabulary and preferred phrasings
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules
- `brand/personas` — the three core audience archetypes (Chị Lan, Chị Hương, Chị Mai) and their value priorities
- `brand/journey-stages` — the 7 emotional journey stages and their content implications
- `rules/banned-words` — hard-banned words and phrases (zero tolerance)

Read all eight documents carefully before generating any ideas.

### Step 3: Generate ideas

Generate exactly the number of ideas required by `targets.youtube.videoCount.longForm` plus `targets.youtube.videoCount.shorts`. Produce ideas grouped by series (matching `targets.youtube.formatMix` counts) to make series-count tracking easier.

For each idea, call `save_idea` with the following field mapping:

```
save_idea(
  plan_id        = <plan_id>,
  channel        = 'youtube',
  source         = 'ai',
  title          = <Vietnamese video title — specific, natural, search-intent aware>,
  hook_direction = <opening hook: the first 15 seconds — question, confession, or bold claim that earns the viewer's watch>,
  pillar         = <content series name, matching formatMix key exactly>,
  target_persona = <archetype name: 'Chị Lan' | 'Chị Hương' | 'Chị Mai'>,
  core_message   = <the strategic direction — one clear sentence: what the viewer learns or feels>,
  cta            = <call-to-action direction — soft, authentic: what we invite viewers to do next (comment / subscribe / consult)>,
  why_now        = <why this topic is timely for this month's context>,
  story_moment   = <the concrete scene or opening moment that anchors the video — specific, sensory>,
  format_decision = {
    series:       <series name from channels/youtube: 'documentary' | 'consultant-spotlight' | 'science-explained' | 'womens-conversation' | 'customer-story' | 'shorts'>,
    buyerStage:   <'awareness' | 'consideration' | 'decision'>,
    videoLength:  <estimated length: 'short (< 3 min)' | 'medium (3–10 min)' | 'long (10–20 min)' | 'documentary (20+ min)'>,
    journeyStage: <journey stage name from brand/journey-stages>,
    tonalRegister: <tonal register derived from voice/tone and channels/youtube tone guidance>,
    theme:        <theme this video belongs to, from targets.youtube.themes>,
    repurposable: <true | false — whether this video yields a 60–90s Facebook clip or Reel>,
    seoIntent:    <primary search intent: 'informational' | 'navigational' | 'transactional'>
  }
)
```

> **Note — experimental-track tagging deferred:** `save_idea` does not yet
> accept `track` or `confidence` fields — those args are silently stripped and
> every idea is created with the default `proven` track. Do NOT pass `track` or
> `confidence` to `save_idea`. (A later spine change can add these fields when
> the schema supports them.)

**Field guidance:**

- `title` — must be natural Vietnamese, search-intent aware. Use keywords from the SEO priority list in `channels/youtube` where relevant. Titles for long-form should be 50–70 characters; Shorts titles can be shorter.
- `hook_direction` — YouTube hook must earn the first 15 seconds: a specific question, a surprising claim, or a confession line. Must vary across the batch — avoid repeating the same hook type on consecutive ideas.
- `pillar` — use the exact series key from `targets.youtube.formatMix` (`documentary`, `consultant-spotlight`, `science-explained`, `womens-conversation`, `customer-story`, `shorts`).
- `target_persona` — pick from `brand/personas`. Choose the persona whose primary values align with this video's buyer stage and core message.
- `core_message` — the strategic direction (not a headline). One sentence stating what the viewer takes away — a belief, a reframe, or a transformation signal.
- `cta` — soft, authentic call-to-action for YouTube viewers. Options include: subscribe with a reason, leave a comment with a specific prompt, visit Facebook/Messenger for personal consultation. No pushy sales language.
- `why_now` — the month-specific context that makes this topic timely. No video should be purely evergreen.
- `story_moment` — the concrete opening scene: setting, character, emotion. E.g. "Chị Kiều My sits at her kitchen table at 6am, holding a 20-year-old photo."
- `format_decision.series` — must match the series name exactly from `channels/youtube`. Do not invent series names.
- `format_decision.buyerStage` — must be one of `awareness`, `consideration`, `decision`. Derive from `targets.youtube.stageMix` proportions and series suitability.
- `format_decision.videoLength` — derive from series type: documentaries and Kiều My stories run 20+ min; Khoa Học Giải Thích and Tâm Sự Phụ Nữ run 10–20 min; Chị Em Chúng Mình run 3–10 min; Shorts run < 3 min.
- `format_decision.repurposable` — mark `true` when the video naturally yields a 60–90s clip or moment for Facebook Reels (per the YouTube → Facebook workflow in `channels/youtube`). Most long-form videos should yield at least one repurposable clip.
- `format_decision.seoIntent` — awareness-stage videos are typically informational; decision-stage videos can be navigational (brand search) or transactional.

### Step 4: Self-check diversity and compliance

Before finalising, audit the full set of ideas against these constraints. The definitive rules live in `rules/banned-words` and `channels/youtube` — if those documents conflict with the guidance below, the documents win.

**Mandatory checks (all must PASS):**

1. **Series count accuracy**: Count ideas per series. Every series's count must match `targets.youtube.formatMix` exactly. Any deviation = fix before finalising.

2. **Stage mix accuracy**: Count ideas per buyer stage (`format_decision.buyerStage`). Totals must match `targets.youtube.stageMix`. Any deviation = fix before finalising.

3. **Archetype specificity**: Spot-check 3 ideas. Each must name month-specific pain points or aspirations for its target persona, not generic descriptions. Generic = rewrite.

4. **Journey stage alignment**: Spot-check 3 ideas. The `journeyStage` must match the content direction — a video at "Nhận ra" must not already propose a solution; a video at "Tiến triển" must not dwell on initial pain. Misaligned = rewrite.

5. **Month-specificity**: Count evergreen ideas (those without a month-specific hook or context in `why_now`). If >25% of ideas are purely evergreen, add month-specific context or replace the worst offenders.

6. **Hook-opener variety**: Across all video hook directions, no more than 30% may begin with the same opener type (question / confession / bold claim). At least one hook from each type must appear across the batch. Rewrite violating hooks to add variety.

7. **Repurposability coverage**: At least 60% of long-form ideas should have `repurposable: true`. If below threshold, revisit ideas that lack obvious Facebook clip moments.

8. **No banned words**: Scan every `title`, `hook_direction`, `core_message`, and `cta` for any word or phrase listed in `rules/banned-words`. Any match = rewrite that field. Zero tolerance.

9. **Pronoun consistency**: Every idea targeting `channels/youtube`'s xưng hô convention must use `Bạn` for viewer address and `Mình`/`Chúng mình` for brand self-reference in the `hook_direction` and `cta` fields. Violations = rewrite.

10. **No duplicate title+series within the month**: No two ideas may share the same series AND the same core message direction. If a series has duplicate core messages, vary the angle, persona, or journey stage on the excess ideas.

**If any check fails:** Fix the violations before finalising Step 5. Do not finalise Step 5 until all 10 checks pass.

### Step 5: Record phase status

After all ideas have been saved and all self-checks pass, call `save_monthly_plan` to record that the YouTube ideation phase is complete.

Read the current `phase_status` from the plan (loaded in Step 1). Merge by setting `youtube` to `'proposed'` while preserving all other keys:

```json
{
  "context": "<carry through unchanged from Step 1>",
  "youtube": "proposed"
}
```

Send the full merged `phase_status` object — do NOT drop any existing keys. `save_monthly_plan` replaces the entire `phase_status` field.

Do NOT modify `targets` in this call unless re-sending the full unchanged `targets` object. Safest pattern: only pass `plan_id`, `period`, and `phase_status` if the tool supports partial updates; otherwise include the full unchanged `targets`.

### Step 6: Output summary

After saving, output:

```
## YouTube Ideation — <period>

**Ideas saved:** <N> drafts (propose-only — awaiting human curation)
  Long-form: <n> | Shorts: <n>

### Series Distribution
| Series | Target | Saved | Status |
|--------|--------|-------|--------|
| documentary | <target> | <actual> | PASS / FAIL |
| consultant-spotlight | <target> | <actual> | PASS / FAIL |
| science-explained | <target> | <actual> | PASS / FAIL |
| womens-conversation | <target> | <actual> | PASS / FAIL |
| customer-story | <target> | <actual> | PASS / FAIL |
| shorts | <target> | <actual> | PASS / FAIL |

### Stage Mix
| Buyer Stage | Target | Saved | Status |
|-------------|--------|-------|--------|
| Awareness | <target> | <actual> | PASS / FAIL |
| Consideration | <target> | <actual> | PASS / FAIL |
| Decision | <target> | <actual> | PASS / FAIL |

### Diversity Check Results
| Constraint | Threshold | Actual | Status |
|------------|-----------|--------|--------|
| Hook opener variety (max same type) | ≤30% | <worst %> | PASS / FAIL |
| Repurposability coverage | ≥60% long-form | <count> | PASS / FAIL |
| Month-specificity (evergreen) | ≤25% | <count> | PASS / FAIL |
| Banned words | 0 | 0 | PASS |
| Duplicate title+series | 0 | <count> | PASS / FAIL |
| Pronoun consistency | 0 violations | <count> | PASS / FAIL |

Phase status: youtube = proposed

---
Curate and approve ideas in the dashboard at: Ideas → <period> → YouTube
```

## Output

- Draft ideas saved via `save_idea(plan_id, channel='youtube', source='ai', …)` — all DRAFT status
- `phase_status.youtube` set to `'proposed'` on the monthly plan
- All other existing `phase_status` and `targets` keys preserved
- Summary table showing series distribution accuracy and diversity check results

## Governance

- **Propose-only.** `save_idea` creates DRAFT ideas only. NEVER calls `approve_idea`, `update_status`, `publish_*`, or any scheduling tool.
- **No auto-approval.** The human operator curates and approves ideas in the dashboard.
- `channel` must always be set to `'youtube'` in every `save_idea` call. Never omit it.
- References only the eight knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- The diversity thresholds in Step 4 are sourced from `rules/banned-words` and `channels/youtube` — those documents are the source of truth; the numeric guidance above is informational only.
- Valid `phase_status` values are: `pending`, `in_progress`, `proposed`, `done`, `approved`. The value set here is `proposed`.
- Requires `edit` capability.
