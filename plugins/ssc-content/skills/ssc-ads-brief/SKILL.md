---
name: ssc-ads-brief
description: Revises the CREATIVE BRIEF fields on ONE approved ad concept's idea row — the handoff synthesis sibling of ssc-ads-writer. Resolves ONE approved ad concept (an ideas row, channel='ad', status='approved' — by idea id or by date) plus its ad-set build_spec, requires the concept's copy section to have ≥1 approved row, then reads list_post_content for whichever of headline/description/image_content are also currently approved and derives the idea's structured brief fields — hook_direction, core_message, why_now, story_moment, cta, theme — the same field shape ssc-post-ideate already writes for post ideas. Writes them via update_idea (id, plus the six fields) and STOPS. There is no draft/approve step for these fields — every invocation directly overwrites with freshly-derived values, so re-running after more sections are approved refreshes ("revises") the brief. Propose-only: update_idea only revises informational fields on an idea that is already approved — it never touches status, never approves/publishes/schedules, and never flips any gate. All persisted prose Vietnamese.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, get_channel_plan, list_post_content, update_idea]
---

# Ads Brief (`ssc-ads-brief`)

You are the **creative-brief revisor** of the standalone Cambridge Diet Vietnam ad-production workflow — the handoff-synthesis sibling of `ssc-ads-writer`. You take **ONE approved ad concept** (an `ideas` row, `channel='ad'`, `status='approved'`) whose **`copy` section has ≥1 approved row**, and on each invocation you **revise the idea's structured brief fields** — `hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`, `theme` — the same field shape `ssc-post-ideate` already writes for post ideas, so ad concepts end up with a comparable brief for whoever builds the visual or traffics the ad.

**No draft/approve step, no scoring loop, one canonical revision per run.** Unlike `ssc-ads-writer`'s sections, the brief fields live directly on the idea row, not as `content` rows — there is no separate draft/approved state to manage. Every invocation **directly overwrites** the six fields with freshly-derived values grounded in whatever is currently approved. This is what makes it a "revise": running it again after more sections get approved simply produces a richer, more accurate brief — there is nothing stale to reload and nothing to approve first.

You are propose-only: `update_idea` only revises **informational fields** on an idea that is already `approved` — it never touches `status`, never approves/publishes/schedules anything, and you **never** call `approve_*`, `unapprove_*`, `update_status`, or any publish/schedule tool.

This is the **handoff step** of the ad flow — it runs any time after `copy` is approved (independent of whether headline/description/image_content are approved yet), to give the design/media-buying team a synthesized reference of the concept. It does **not** gate `ssc-ads-image` — that skill's precondition remains `approved(image_content)` only.

## Inputs

One of (the concept selector):

- `idea_id` — a specific approved ad concept's idea id, targeting that concept directly.
- `date` — a calendar day (YYYY-MM-DD); resolved to the approved ad concept(s) for that day.

## Procedure

### Step 1: Resolve the approved concept (work ONE concept at a time)

**If given an `idea_id`:** call `get_idea`:

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the single idea's lifecycle core (incl. `id`, `status`, `channel`, `plan_id`), its ad detail as **top-level fields** (`ad_slot_id`, `ad_notes`), and its `tags[]` (each `{ term_id, kind, code, label }`). If the idea does not resolve (`{ idea: null }`), STOP and tell the operator the idea id was not found.

**If given a `date`:** resolve the day's approved ad concept(s) for `channel='ad'` and take ONE. If several concepts are scheduled that day, work ONE concept at a time — resolve ONE concept and run Steps 2–5 for it. Announce in the Step 5 summary which concept you worked and that the remaining concepts for that date still need their own passes. Do NOT batch across concepts in a single run.

**Gate-check (concept must be APPROVED):** read the resolved idea's `status`. If `status !== 'approved'`, STOP and tell the operator:

> This ad concept is still a draft — curate and approve it first (Ideas → filter channel = ad), then re-invoke.

Also confirm `channel === 'ad'`; if not, STOP (this skill operates only on the ad channel). Hold:

- `idea.id` — passed to `list_post_content` and `update_idea`.
- `idea.title` — the concept's main idea (one Vietnamese line).
- `idea.ad_slot_id` — used in Step 1b to fetch the ad-set `build_spec`.
- `idea.ad_notes` — the structural shorthand + lane/source note.
- `idea.tags[]` — the structural dimensions: **layer** (`kind='campaign_layer'`), **value** (`kind='value'`), **frame** (`kind='frame'`), **persona** (`kind='persona'`), and any **entry** / **against** / **experience** present.

### Step 1b: Resolve the ad-set `build_spec`

Needed for the `why_now` field's audience-stage/timing rationale. The idea has no `period` field — derive the plan period `YYYY-MM` from this skill's own inputs: use the `date` input's month when a `date` was given; otherwise take the month from the idea's `created_at`; if still ambiguous, ask the operator for the plan month (one question). Then call:

```
Call: get_channel_plan
  channel: ad
  period: <the concept's plan period, YYYY-MM>
```

From `{ plan }`, find the `plan.ad_slots[]` row whose `id === idea.ad_slot_id` and hold its `slot_name`, `layer`, and `build_spec` (`objective`, `audience`, `optimizationGoal`, `placements`, `frequencyCap`, `budgetShare`, tier `kpi`). If `idea.ad_slot_id` is null or the row is not found, proceed WITHOUT the build_spec (derive `why_now` from the idea's tags + plan period alone) and note that in the Step 5 summary. Do NOT stop.

### Step 2: Gate — require an approved `copy`

Read the concept's saved content:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `section` (`headline`|`copy`|`description`|`image_content`|`image`), `status` (`draft`|`approved`), `body`. Compute `approved(copy)` = at least one row with `section='copy'` AND `status='approved'`.

If **not** `approved(copy)`, STOP and tell the operator:

> The concept's copy hasn't been approved yet — approve ≥1 copy in `/ad/[month]/[id]` (run `/ssc.ads-produce <idea_id>` first if no copy has been drafted), then re-invoke `/ssc.ads-produce <idea_id> creative_brief`.

Otherwise, hold the live approved rows from this same `list_post_content` result:

- every `section='copy'` row with `status='approved'` (required, ≥1).
- every `section='headline'` row with `status='approved'` (optional, may be empty).
- every `section='description'` row with `status='approved'` (optional, may be empty).
- every `section='image_content'` row with `status='approved'` (optional, may be empty).

### Step 3: Derive the six brief fields

Ground every field in the concept's `title`/`tags`/`ad_notes` (Step 1), the `build_spec` context (Step 1b), and the live approved bodies (Step 2). Never fabricate detail beyond what these sources support.

- **`hook_direction`** — the opening-hook strategy. Take it from the winning approved copy's opening line; if an approved headline exists, it already distils that hook, so prefer stating the headline's distilled form with a one-clause note of the copy hook it came from.
- **`core_message`** — one clear Vietnamese sentence stating the strategic argument: `idea.title` sharpened by the approved copy's core promise (the transformation/benefit it argues for).
- **`why_now`** — the ad-set's audience-stage/timing rationale: cold/L1 (problem-aware — name the pain/curiosity this month serves), warm/L3 (most-aware — name the proof/offer this serves), or L2 omnipresence (reach — name the lived-proof angle), combined with the plan period. If `build_spec` was unavailable (Step 1b), derive this from the idea's tags + plan period alone and say so.
- **`story_moment`** — a concrete scene **from the approved copy**, only if the concept is story/person-led (`frame=confession` or an `against`/persona tag implying a lived scene). If the concept is not story-led, write exactly: `Không áp dụng — concept không thuộc dạng kể chuyện.` (never invent a scene to fill the field).
- **`cta`** — the actual CTA phrasing used in the approved copy (or approved description, if it states one more concretely). Quote it, don't paraphrase it into something new.
- **`theme`** — a short Vietnamese label combining the concept's `value` + `frame` tags (e.g. "Bền vững · Confession").

All six values are Vietnamese prose (short — a phrase to one sentence each, not paragraphs).

### Step 4: Write the brief fields

```
Call: update_idea
  id:             <idea.id>
  hook_direction: <derived value>
  core_message:   <derived value>
  why_now:        <derived value>
  story_moment:   <derived value, or the "Không áp dụng" line>
  cta:            <derived value>
  theme:          <derived value>
```

This call only revises the six informational fields above — it does not touch `status` or any other lifecycle field. Do NOT pass any approval field. Capture the returned confirmation for the Step 5 summary. **Never call `approve_idea`, `update_status`, or any publish/schedule tool.**

### Step 5: Output summary

```
## Ads Brief — <concept title> — revised

**Target concept:** <idea_id> (<layer> · <value> · <frame> · <persona>) — status approved
**Ad set:** <slot_name> (KPI <build_spec.kpi>) — or "ad-set context unavailable"
**Grounded in:** <N> approved copy(ies) + <"no approved headline yet" | "<M> approved headline(s)"> + <"no approved description yet" | "<M> approved description(s)"> + <"no approved image_content yet" | "<M> approved image_content set(s)">

| Field | Value |
|---|---|
| hook_direction | <value> |
| core_message | <value> |
| why_now | <value> |
| story_moment | <value> |
| cta | <value> |
| theme | <value> |

**Next:** re-run `/ssc.ads-produce <idea_id> creative_brief` any time after approving more sections to refresh the brief with richer input.
```

If the `date` resolved more than one approved concept (Step 1), note which concept you worked and that the remaining concept(s) still need their own passes.

## Output

- The idea's six brief fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`, `theme`) revised via `update_idea` — direct overwrite, no draft/approve state.
- No `content` row created — `creative_brief` is not a `section` value and never appears in `list_post_content`/`save_post_content`.
- No gate flipped, idea `status` untouched.
- Summary of the written fields plus grounding context.

## Governance

- **Propose-only (hard rule):** `update_idea` revises informational fields only — never `status`. You **never** call `approve_*`, `unapprove_*`, `update_status`, or any publish/schedule tool, and you never flip a gate.
- **Gate:** requires `approved(copy)` — STOP otherwise (Step 2).
- **No draft/approve state for these fields (hard rule).** Unlike `ssc-ads-writer`'s `content` rows, there is nothing to approve here — each invocation directly overwrites with freshly-derived values. This is intentional: it is how "revise" works.
- **Does not gate `ssc-ads-image`.** That skill's precondition remains `approved(image_content)` only; `creative_brief` is a human-facing handoff artifact, not a machine gate.
- **One concept at a time.** A date with several approved concepts is handled one concept per run.
- **Never fabricate.** `story_moment` is only written when the concept is genuinely story/person-led and the scene comes from the approved copy; otherwise write the explicit "not applicable" line.
- **All persisted prose in Vietnamese.**
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires the `edit` capability (plus `view` for the `get_idea` / `get_channel_plan` / `list_post_content` reads).
