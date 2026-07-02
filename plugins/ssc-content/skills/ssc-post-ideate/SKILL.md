---
name: ssc-post-ideate
description: Generates the month's Facebook post ideas for the standalone Cambridge Diet Vietnam Posts pipeline — reads the approved post channel_plan (pillar distribution + format mix) and the creative knowledge base, and produces ~30 draft ideas via save_idea (channel='post', tagged to the plan), self-enforcing the brand's diversity, hook-variety, and banned-word rules. Gated on the approved Research plan. Propose-only; the ideas are drafts a human curates and approves in the dashboard.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [get_knowledge, search_knowledge, get_channel_plan, list_taxonomies, save_idea, delete_idea, update_idea_rating, get_idea]
---

# Post Ideate (`ssc-post-ideate`)

You generate ~30 draft Facebook post ideas for the standalone Cambridge Diet Vietnam Posts pipeline. You read the approved post `channel_plan` (the pillar distribution, format mix, and totals derived at the Research step), load the creative knowledge base, generate one idea per topic via `save_idea` (channel=`'post'`, tagged to the plan), and self-enforce diversity and banned-word rules before finalising. You are propose-only: every idea is created as a DRAFT for a human to curate and approve in the dashboard. You NEVER call `approve_idea`, `approve_channel_plan`, or any publish tool, and you NEVER flip a gate.

This is step 3 of the five-step Posts pipeline (**Focus → Research → Ideate → Schedule → Measure**), keyed on `channel_plans(channel='post', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the post plan is self-contained.

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

> The Research plan has not been approved yet. Please review and approve Research in the dashboard before running Ideate.

Do not proceed past this gate under any circumstances — do not load the KB or save any idea until the plan is approved.

If `plan.approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_idea` as `plan_id`
- `plan.targets` — the pillar distribution as a SET of rows, each `{ term_id, term_kind, term_code, term_label, target_value }`. The pillar rows (`term_kind = 'pillar'`) and their `target_value` integers give the **exact topic count per pillar** (summing to ~30). Use `term_label` (or `term_code`) as the pillar name.
- `plan.detail.format_mix` — the format percentage mix (image, carousel, video, reel) derived at Research
- `plan.detail.total_target` — the total post target (~30)
- `plan.tactics` — the approved Focus (markdown), for tonal/strategic weight
- `plan.context` — the approved month brief (markdown): priority pillars, key dates, seasonal pain points, themes

The pillar distribution and format mix come from the plan aggregate (`targets` + `detail`) — there is no separate briefing step. If `plan.targets` has no pillar rows, STOP and tell the operator the Research step has not produced a pillar distribution yet.

### Step 2: Load the creative knowledge base

Call `get_knowledge` for each of these ten verified paths:

- `brand/angles` — the 3-tier angle system (dimensions: value, entry, against, experience; frames; diversity rules)
- `voice/tone` — the brand tone and voice principles
- `voice/pronouns` — the pronoun system (Mình / Bạn / Chị)
- `voice/vocabulary` — approved vocabulary and preferred phrasings
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules
- `brand/personas` — the three core audience archetypes (Chị Lan, Chị Hương, Chị Mai) and their value priorities
- `brand/journey-stages` — the 7 emotional journey stages and their content implications
- `content/quick-checklist` — what to avoid and quality requirements
- `rules/banned-words` — hard-banned words and phrases (zero tolerance)
- `rules/review-standards` — the 7 mandatory review criteria and diversity thresholds

Read all ten documents carefully before generating any ideas. The diversity thresholds in Step 4 are sourced from `rules/review-standards` and `brand/angles` — always defer to those documents as the source of truth.

### Step 3: Generate ~30 ideas

Generate exactly the number of ideas required by the pillar distribution in `plan.targets` (summing to ~30). Produce ideas in pillar-grouped batches to make pillar-count tracking easier.

**Resolve every strategic-dimension code → taxonomy id (do this once, before any `save_idea` write).** The codes you work with from `brand/angles`/`content/pillars` (pillar `P1`–`P4`, and the `value`/`entry`/`against`/`experience`/`frame` angle codes, plus any other strategic dimension) are human codes — `save_idea`'s `terms` must carry the matching `taxonomies.id`, not the code. Call `list_taxonomies` once per needed `kind` (e.g. `list_taxonomies(kind='pillar')`, `list_taxonomies(kind='value')`, `list_taxonomies(kind='frame')`, …), **or** call `list_taxonomies` with no `kind` to get all kinds in one call, and build a `code → id` map per kind from the returned rows. Then pass the resolved **leaf-term `id`s** in `save_idea`'s `terms`. NEVER pass a code (e.g. `P2`, a frame code) as a `term` and NEVER invent an id.

For each idea, call `save_idea` with the following field mapping (the `terms` carry the resolved taxonomy `id`s from the maps above):

```
save_idea(
  channel       = 'post',
  plan_id       = <plan.id>,
  source        = 'ai',
  status        = 'draft',
  score         = <your self-rating, 1–5 — see Field guidance>,
  comment       = <one-line rationale for the score, in Vietnamese — see Field guidance>,
  title         = <Vietnamese post title — specific, natural, not translated>,
  hook_direction = <opening hook strategy or first-line direction>,
  pillar        = <pillar name, matching a plan.targets pillar term exactly>,
  target_persona = <archetype name: 'Chị Lan' | 'Chị Hương' | 'Chị Mai'>,
  core_message  = <the strategic direction — one clear sentence>,
  cta           = <call-to-action direction, soft and authentic>,
  why_now       = <why this topic is timely for this month>,
  story_moment  = <concrete scene or moment that anchors the post>,
  format_decision = {
    angles: {
      value:      <value code from brand/angles — required, exactly one>,
      entry:      <entry code from brand/angles — recommended, may be null>,
      against:    <against code from brand/angles — optional, may be null>,
      experience: <experience code from brand/angles — optional, may be null>,
      frame:      <frame code from brand/angles — required>
    },
    journeyStage:    <journey stage name from brand/journey-stages>,
    tonalRegister:   <tonal register derived from voice/tone>,
    format:          <'image' | 'carousel' | 'video' | 'reel'>,
    theme:           <theme this post belongs to, from plan.context>
  }
)
```

`save_idea` **INSERTS a new DRAFT idea every call** — there is no `id` argument and no upsert; the server always mints a fresh id. Always pass `channel='post'` and `plan_id=<plan.id>` so the idea is scoped to this post plan. To correct an already-saved draft: for **content/field corrections**, call `delete_idea(<id>)` on the flawed draft and save ONE corrected replacement via `save_idea` (never re-call `save_idea` hoping to "update" — that creates a duplicate). For **score/comment-only corrections**, call `update_idea_rating(id, rating, comment?, expected_version)` — it changes only the rating fields, never the lifecycle status; a freshly-saved draft is at version 1, and a `stale_version` error means re-read the row via `get_idea` and retry once with the current version.

**Field guidance:**

- `score` — **self-rate every idea on a 1–5 scale** (rendered as stars in the dashboard for the operator to curate by strength). Judge how strongly the idea serves the month's approved tactics and its pillar, the freshness/strength of its hook, and brand-voice fit. Rate honestly and **use the full range** — do not give everything 5. 5 = a standout you'd lead the month with; 3 = solid; 1–2 = weak/filler. The rating is yours; nothing auto-approves on it.
- `comment` — a **one-line rationale for the `score`, written in natural Vietnamese** (shown next to the stars in the dashboard for a Vietnamese operator): the single biggest reason the idea is strong or weak, so they understand the rating at a glance — e.g. "Hook post-Tết mạnh, persona Chị Hương rõ" or "Góc hơi chung, thiếu khoảnh khắc cụ thể". Always Vietnamese (never English); keep it short and honest; it should justify the number you gave.
- `title` — must be natural Vietnamese, not a translated phrase. Specific to the month's context (not evergreen), per `rules/review-standards` criterion 4.
- `hook_direction` — the opening strategy: what question, confession line, or statement opens the post. Must vary across the batch (see hook-opener diversity in Step 4).
- `pillar` — use the exact pillar name from a `plan.targets` pillar term (`term_label`/`term_code`).
- `target_persona` — pick from `brand/personas`. Choose the persona whose primary values align with this idea's `angles.value`. Every idea must clearly address Chị Lan, Chị Hương, or Chị Mai, with specific month-context pain points (per `rules/review-standards` criterion 2).
- `core_message` — the strategic direction (not a headline). One sentence stating the argument or transformation this post carries.
- `cta` — soft, authentic call-to-action. No pushy sales language (per `rules/review-standards` criterion 7).
- `why_now` — the month-specific context that makes this idea timely. No idea should be purely evergreen (per `rules/review-standards` criterion 4: >20% evergreen = FAIL).
- `story_moment` — a concrete, sensory scene that grounds the idea (e.g. "7am, blending the chocolate shake before leaving for work").
- `format_decision.angles.value` — exactly one value code per idea, from `brand/angles` section 1.1. Must match the persona's priority values (per `brand/personas`).
- `format_decision.angles.entry` — recommended. Entry codes from `brand/angles` section 1.2. Include on ≥28 of 30 ideas (per `brand/angles` diversity guidance — see `rules/review-standards` for thresholds).
- `format_decision.angles.against` — optional. Against codes from `brand/angles` section 1.3. Use ≥3 distinct codes across the batch; no single against code on >8 ideas.
- `format_decision.angles.experience` — optional but strongly recommended. Experience codes from `brand/angles` section 1.4. Include on ≥22 of 30 ideas.
- `format_decision.angles.frame` — required. Frame codes from `brand/angles` section 3. Each frame must not appear more than 5 times across the full batch (≤5× per frame). Select the frame after fixing the angle, following the Frame × Layer guidance in `brand/angles`.
- `format_decision.journeyStage` — stage names from `brand/journey-stages`. Must match the idea's content (per `rules/review-standards` criterion 3: wrong stage assignment = FAIL).
- `format_decision.format` — must be one of `image`, `carousel`, `video`, `reel`. Derive from `plan.detail.format_mix` proportions and pillar suitability (per `rules/review-standards` criterion 6).

### Step 4: Self-check diversity and compliance

Before finalising (or as you save each batch), audit the full set of ~30 ideas against these constraints. The definitive thresholds live in `rules/review-standards` and `brand/angles` — if those documents conflict with the guidance below, the documents win.

**Mandatory checks (all must PASS):**

1. **Pillar count accuracy** (per `rules/review-standards` criterion 1): Count ideas per pillar. Every pillar's count must match the pillar distribution in `plan.targets` exactly. Any deviation = fix before finalising.

2. **Archetype specificity** (per `rules/review-standards` criterion 2): Spot-check 3 ideas. Each must name month-specific pain points for its target persona (Chị Lan, Chị Hương, Chị Mai), not generic descriptions. Generic = rewrite.

3. **Journey stage alignment** (per `rules/review-standards` criterion 3): Spot-check 3 ideas. The `journeyStage` must match the content direction — an idea in stage "Nhận ra" must not already propose a solution; an idea in stage "Tiến triển" must not dwell on initial pain. Misaligned = rewrite.

4. **Month-specificity** (per `rules/review-standards` criterion 4): Count evergreen ideas (those without a month-specific hook, event, or context in `why_now`). If >20% of ~30 ideas are evergreen, add month-specific context or replace the worst offenders.

5. **Frame variety** (per `brand/angles` section 5): No single frame code may appear more than 5 times across all ~30 ideas. Count by frame code and fix violations by substituting appropriate frames from `brand/angles` section 3.

6. **Against diversity** (per `brand/angles` section 5): If `against` is used, at least 3 distinct against codes must appear across the batch. No single against code may appear on more than 8 ideas. Fix by redistributing against assignments.

7. **Experience coverage** (per `brand/angles` section 1.4 and diversity guidance): `experience` must be non-null on at least 22 of the ~30 ideas. If below threshold, add experience codes to ideas that lack them.

8. **Entry coverage** (per `brand/angles` section 1.2 and diversity guidance): `entry` must be non-null on at least 28 of the ~30 ideas. If below threshold, add appropriate entry codes.

9. **Hook-opener variety**: Across all 30 hook directions, no more than 10 may begin with "Mình" (first-person opener). At least 5 hook directions must open with a question. Rewrite violating hooks to add variety.

10. **No banned words** (per `rules/banned-words`, hard ban): Scan every `title`, `hook_direction`, `core_message`, and `cta` for any word or phrase listed in `rules/banned-words`. Any match = rewrite that field. Zero tolerance.

11. **No duplicate value+frame within a pillar** (per `brand/angles` section 2): Within each pillar group, no more than 2 ideas may share the same `value` AND the same `frame`. If a pillar has >2 ideas with identical value+frame, vary the frame or value on the excess ideas.

**If any check fails:** Fix the violations before saving the affected idea. For an idea already saved this run, `save_idea` cannot update it (every call INSERTS a new row) — instead call `delete_idea(<id>)` on the flawed draft and save ONE corrected replacement via `save_idea`. If only the score/comment needs correcting, use `update_idea_rating(id, rating, comment?, expected_version)` instead (status unchanged; version 1 for a just-saved draft). Only ever fix drafts YOU created in this run. Do not finalise until all 11 checks pass.

### Step 5: Quality replacement loop — remove weak ideas and replace them

Raise the floor on quality: **no saved idea may remain at 3 stars or below.** Using your own self-ratings from Step 3 (you know each idea's `id` from its `save_idea` result and the `score` you gave it):

1. Identify every saved idea rated **≤ 3** (3★ and below).
2. For each one:
   - Call `delete_idea(<id>)` to remove the weak draft — it never reaches the operator.
   - Generate a **fresh, stronger replacement for the SAME pillar** (so the `plan.targets` pillar distribution stays exact), honouring every Step 4 rule (diversity, hook variety, banned words) and the format mix. Save it via `save_idea` with an honest new `score`.
3. Re-rate the replacement. If it is still ≤ 3, repeat — but **bound the loop at 2 replacement attempts per slot**. If after 2 attempts a slot still can't reach ≥ 4★, keep the best attempt and note that pillar slot (and why) in the Step 6 summary.
4. Continue until **every saved idea for the plan is rated ≥ 4★** (or a slot hits its bound).

Rate **honestly** — never inflate a weak idea to 4 just to exit the loop; the goal is genuinely stronger ideas, not gamed scores. Deleting + replacing keeps the pillar counts constant, so re-run the Step 4 **pillar-count** check afterwards to confirm the distribution still matches `plan.targets`. This loop is propose-only: it removes and replaces YOUR OWN drafts before the human curates — it never touches approved ideas and never flips a gate.

### Step 6: Output summary

After all ~30 ideas have been saved and all self-checks pass, output:

```
## Post Ideate — <period>

**Ideas saved:** <N> drafts (channel='post', propose-only — awaiting human curation)

### Pillar Distribution
| Pillar | Target | Saved | Status |
|--------|--------|-------|--------|
| <pillar> | <target count> | <actual count> | PASS / FAIL |

### Diversity Check Results
| Constraint | Threshold | Actual | Status |
|------------|-----------|--------|--------|
| Frame variety (max per frame) | ≤5× | <worst frame count> | PASS / FAIL |
| Against diversity (distinct codes) | ≥3 | <count> | PASS / FAIL |
| Against concentration (max per code) | ≤8 | <worst code count> | PASS / FAIL |
| Experience coverage | ≥22/30 | <count> | PASS / FAIL |
| Entry coverage | ≥28/30 | <count> | PASS / FAIL |
| Hook openers starting "Mình" | ≤10 | <count> | PASS / FAIL |
| Hook questions | ≥5 | <count> | PASS / FAIL |
| Banned words | 0 | 0 | PASS |
| Duplicate value+frame per pillar | ≤2 | <worst count> | PASS / FAIL |

---
Curate and approve ideas in the dashboard at: Ideas → <period> (filter channel = post). Approving ≥1 idea opens the Ideas gate; then re-invoke the agent to begin Schedule.
```

## Output

- ~30 draft ideas saved via `save_idea(channel='post', plan_id, source='ai', status='draft', …)` — all DRAFT status, tagged to the post plan
- No gate flipped — ideas are drafts awaiting human curation
- Summary table showing pillar distribution accuracy and diversity check results

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **No auto-approval.** The human operator curates and approves ideas in the dashboard (the Ideas gate is per-idea `approve_idea` → `status='approved'`).
- Always gate-check `approved` first (Step 1). If the Research plan is not approved, STOP — do not load the KB or save any idea.
- References only the ten knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- The diversity thresholds in Step 4 are sourced from `rules/review-standards` and `brand/angles` — those documents are the source of truth; the numeric guidance above is informational only.
- Operates only on the post channel (`channel='post'`); never reads or writes `ads`/`youtube` state.
- Requires `edit` capability (plus `view` for the `get_channel_plan` and `get_knowledge` reads).
