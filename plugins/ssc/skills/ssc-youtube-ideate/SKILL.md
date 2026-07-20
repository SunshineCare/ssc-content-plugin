---
name: ssc-youtube-ideate
description: Generates the month's YouTube video ideas for a Cambridge Diet Vietnam monthly YouTube cycle — reads the approved youtube channel_plan (the briefing's buyer-stage + series distribution and cadence detail) and the channel knowledge base, and produces draft video ideas via save_idea (channel='youtube', tagged to the plan), self-enforcing diversity, hook-variety, and banned-word rules. Gated on the approved briefing (the plan gate). Propose-only; the ideas are drafts a human curates and approves in the content workspace.
metadata:
  type: skill
  stage: youtube-pipeline
  brand: cambridge-diet-vn
  section: youtube
  capability: edit
  tools: [get_knowledge, get_channel_plan, list_taxonomies, save_idea]
---

# Monthly YouTube Ideation (`ssc-youtube-ideate`)

You generate draft YouTube video ideas for a Cambridge Diet Vietnam monthly YouTube cycle. You read the approved youtube `channel_plan` (the briefing's cadence detail + buyer-stage/series distribution), load the creative and channel knowledge base, generate one idea per planned video via `save_idea` with `channel='youtube'`, and self-enforce diversity and banned-word rules before finalising. You are propose-only: every idea is created as a DRAFT for a human to curate and approve in the content workspace (`/content/youtube`).

This is step 2 of the YouTube pipeline (**Briefing → Ideate → Schedule**), keyed on `channel_plans(channel='youtube', period=YYYY-MM)`. There is no monthly-plan dependency — the youtube plan is self-contained.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the briefing

Call:

```
Call: get_channel_plan
  channel: youtube
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.approved` is not `true`, STOP immediately and tell the operator:

> The YouTube briefing has not been approved yet. Please review and approve the briefing in the content workspace (`/content/youtube`) before running Ideate.

Do not proceed past this gate under any circumstances — do not load the KB or save any idea until the plan is approved.

If `plan.approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_idea` as `plan_id`
- `plan.targets` — the briefing distribution as a SET of rows, each `{ term_id, term_kind, term_code, term_label, target_value, meta }`. The `term_kind = 'buyer_stage'` rows give the **video count per buyer stage**; the `term_kind = 'youtube_series'` rows give the **video count per series** (their `meta` may carry theme/persona mappings). Hold each row's `term_id` — you re-tag ideas with these exact ids.
- `plan.detail.long_form_per_week` / `plan.detail.shorts_per_week` — the approved cadence
- `plan.tactics` — the approved month tactics (markdown), for tonal/strategic weight
- `plan.context` — the approved month brief (markdown): themes, key dates, seasonal pain points

**Gate-check:** If `plan.targets` has no `youtube_series` rows, STOP and tell the operator the briefing has not produced a series distribution yet (run `ssc-youtube-briefing` first).

### Step 2: Load the creative knowledge base

Call `get_knowledge` for each of these twelve verified paths:

- `channels/youtube` — the YouTube channel strategy: content series descriptions, cadence rules, SEO priorities, tone, Shorts approach, and the YouTube → Facebook repurposing workflow
- `voice/tone` — the brand tone and voice principles
- `voice/pronouns` — the pronoun system (Bạn + Mình/Chúng mình for YouTube; matches the channel's "Bạn" + "Mình" xưng hô)
- `voice/vocabulary` — approved vocabulary and preferred phrasings
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules
- `brand/personas` — the core audience archetypes and their value priorities (the archetype names and definitions live in this document — do not assume them)
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points with content guidance, objections + how to dismantle them, real vocabulary to echo/avoid, and myths to debunk. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list, so a persona added later needs no procedural change here. This is a **batch** run spanning ideas across every persona and series in one pass, so load every currently-listed persona's detail doc upfront — not just one — to ground each video's pain points and aspirations in that persona's actual trigger points and vocabulary rather than the summary-only view in `brand/personas`.
- `brand/journey-stages` — the emotional journey stages and their content implications
- `rules/banned-words` — hard-banned words and phrases (zero tolerance)

Read all twelve documents carefully before generating any ideas (`brand/personas` plus every currently-listed `brand/persona-<slug>` detail doc together form the full persona-grounding set — load the summary AND every detail doc, not the summary alone).

### Step 3: Generate ideas

Generate exactly the number of ideas required by the briefing distribution: the sum of the `youtube_series` target counts (long-form + Shorts). Produce ideas grouped by series (matching each series row's `target_value`) to make series-count tracking easier.

**Resolve every strategic-dimension code → taxonomy id (do this once, before any `save_idea` write).** Call `list_taxonomies` once per needed `kind` — `youtube_series`, `buyer_stage`, `persona`, `journey_stage`, `value`, `format` (the dimensions that apply to the youtube channel) — **or** one unfiltered `list_taxonomies` call, and build a `code → id` map per kind. `save_idea`'s `terms` must carry the matching `taxonomies.id`, never a code, and never an invented id. (For `youtube_series` and `buyer_stage` you can reuse the `term_id`s already present on `plan.targets`.)

**Persona taxonomy can lag `brand/personas` (do not invent an id for the gap):** `brand/personas` is the live KB index of personas; the `persona` taxonomy (the `kind='persona'` map built above) is a SEPARATE list maintained independently, and it can lag behind the KB doc — a persona can be documented in `brand/personas` before her taxonomy term is added. After building the code → id maps, check every persona currently listed in `brand/personas` against the resolved `kind='persona'` map. If a listed persona has NO corresponding entry there, do NOT invent an id for her and do NOT tag any idea's `persona` term to her this run — carry her forward as untaggable, and report her by name in the Step 5 summary so the operator knows to add her taxonomy term rather than assuming full persona coverage was achieved.

For each idea, call `save_idea` with the following field mapping. Narrative fields go in `detail` (the `youtube_idea_details` columns); structural dimensions go in `terms` (resolved taxonomy leaf ids). There is NO `format_decision` blob and NO top-level `pillar`/`target_persona`/`hook_direction` args — any key outside this schema is rejected or lost.

```
save_idea(
  channel   = 'youtube',
  plan_id   = <plan.id>,
  source    = 'ai',
  status    = 'draft',
  score     = <your self-rating, 1–5 — see Field guidance>,
  comment   = <one-line rationale for the score, in Vietnamese — see Field guidance>,
  title     = <Vietnamese video title — specific, natural, search-intent aware>,
  terms     = [
    <youtube_series term id — the series this video belongs to>,
    <buyer_stage term id — awareness | consideration | decision>,
    <persona term id — the archetype from brand/personas this video speaks to>,
    <journey_stage term id — the journey stage from brand/journey-stages>,
    <value term id — the primary brand value angle>,
    <format term id — video (long-form) or reel (Shorts)>
  ],
  detail    = {
    hookDirection: <opening hook: the first 15 seconds — question, confession, or bold claim that earns the viewer's watch — Vietnamese>,
    coreMessage:   <the strategic direction — one clear Vietnamese sentence: what the viewer learns or feels>,
    whyNow:        <why this topic is timely for this month's context — Vietnamese>,
    storyMoment:   <the concrete scene or opening moment that anchors the video — specific, sensory — Vietnamese>,
    cta:           <call-to-action direction — soft, authentic: what we invite viewers to do next (comment / subscribe / consult) — Vietnamese>,
    theme:         <the month theme this video belongs to, from plan.context / the series row's meta — Vietnamese>,
    videoLength:   <'short' | 'medium' | 'long' | 'documentary'>,
    repurposable:  <true | false — whether this video yields a 60–90s Facebook clip or Reel>,
    seoIntent:     <'informational' | 'navigational' | 'transactional'>
  }
)
```

**Experimental track:** `save_idea` supports `track` (`proven` | `experimental`, defaults to `proven`) and `confidence` (`high`/`medium`/`low`, required when experimental). When an idea activates an experimental strategy finding, pass `track='experimental'` with its `confidence`; otherwise omit both and the default `proven` applies.

**Language rule (hard): every persisted prose field MUST be Vietnamese** — `title`, `comment`, and the `detail` fields `hookDirection`, `coreMessage`, `whyNow`, `storyMoment`, `cta`, `theme`. These are persisted artifacts the Vietnamese operator curates in the content workspace. Never save English prose in them; your chat-side reasoning stays English. The enum-valued fields (`videoLength`, `seoIntent`) and the taxonomy ids stay as their literal codes.

**Field guidance:**

- `score` — **self-rate every idea on a 1–5 scale** (rendered as stars for the operator to curate by strength). Judge how strongly the idea serves the month's approved tactics and its series/stage slot, the freshness of its hook, and brand-voice fit. Rate honestly and use the full range — do not give everything 5.
- `comment` — a **one-line rationale for the `score`, written in natural Vietnamese** (never English): the single biggest reason the idea is strong or weak — e.g. "Hook mở đầu mạnh, khớp giai đoạn Do dự của <persona>" or "Góc hơi chung, thiếu khoảnh khắc cụ thể".
- `title` — natural Vietnamese, search-intent aware. Use keywords from the SEO priority list in `channels/youtube` where relevant. Follow the title-length guidance in `channels/youtube` for long-form vs Shorts.
- `detail.hookDirection` — the YouTube hook must earn the first 15 seconds: a specific question, a surprising claim, or a confession line. Must vary across the batch — avoid repeating the same hook type on consecutive ideas.
- `terms` youtube_series — the exact series term from the `youtube_series` taxonomy matching a `plan.targets` series row. Do not invent series.
- `terms` buyer_stage — derive from the briefing's `buyer_stage` distribution and the series' stage affinity.
- `terms` persona — pick the archetype from `brand/personas` whose primary values align with this video's buyer stage and core message; tag its `persona` taxonomy term. The valid archetypes are whatever `brand/personas` currently defines — do not assume a fixed list.
- `detail.coreMessage` — the strategic direction (not a headline). One sentence stating what the viewer takes away — a belief, a reframe, or a transformation signal.
- `detail.cta` — soft, authentic call-to-action for YouTube viewers: subscribe with a reason, comment on a specific prompt, or visit Facebook/Messenger for personal consultation. No pushy sales language.
- `detail.whyNow` — the month-specific context that makes this topic timely. No video should be purely evergreen.
- `detail.storyMoment` — the concrete opening scene: setting, character, emotion, in Vietnamese. E.g. "Chị Kiều My ngồi bên bàn bếp lúc 6 giờ sáng, tay cầm tấm ảnh chụp 20 năm trước."
- `detail.videoLength` — one of `short`, `medium`, `long`, `documentary`. Derive from the series' format/length metadata in `channels/youtube` (and the `youtube_series` taxonomy) — documentary series run documentary-length; Shorts are `short`.
- `detail.repurposable` — `true` when the video naturally yields a 60–90s clip or moment for Facebook Reels (per the YouTube → Facebook workflow in `channels/youtube`). Most long-form videos should yield at least one repurposable clip.
- `detail.seoIntent` — awareness-stage videos are typically `informational`; decision-stage videos can be `navigational` (brand search) or `transactional`.

### Step 4: Self-check diversity and compliance

Before finalising, audit the full set of ideas against these constraints. The definitive rules live in `rules/banned-words` and `channels/youtube` — if those documents conflict with the guidance below, the documents win.

**Mandatory checks (all must PASS):**

1. **Series count accuracy**: Count ideas per `youtube_series` term. Every series' count must match its `plan.targets` row's `target_value` exactly. Any deviation = fix before finalising.

2. **Stage mix accuracy**: Count ideas per `buyer_stage` term. Totals must match the briefing's `buyer_stage` target rows. Any deviation = fix before finalising.

3. **Archetype specificity**: Spot-check 3 ideas. Each must name month-specific pain points or aspirations for its tagged persona (per `brand/personas`), drawn from that persona's detail-doc trigger-point section (Step 2) rather than invented generically — not generic descriptions. Generic = rewrite.

4. **Journey stage alignment**: Spot-check 3 ideas. The tagged `journey_stage` must match the content direction — a video at "Nhận ra" must not already propose a solution; a video at "Tiến triển" must not dwell on initial pain. Misaligned = rewrite.

5. **Month-specificity**: Count evergreen ideas (those without a month-specific hook or context in `detail.whyNow`). If >25% of ideas are purely evergreen, add month-specific context or replace the worst offenders.

6. **Hook-opener variety**: Across all `hookDirection`s, no more than 30% may begin with the same opener type (question / confession / bold claim). At least one hook from each type must appear across the batch. Rewrite violating hooks to add variety.

7. **Repurposability coverage**: At least 60% of long-form ideas should have `repurposable: true`. If below threshold, revisit ideas that lack obvious Facebook clip moments.

8. **No banned words**: Scan every `title`, `hookDirection`, `coreMessage`, and `cta` for any word or phrase listed in `rules/banned-words`. Any match = rewrite that field. Zero tolerance.

9. **Pronoun consistency**: Every idea must follow `channels/youtube`'s xưng hô convention — `Bạn` for viewer address and `Mình`/`Chúng mình` for brand self-reference in `hookDirection` and `cta`. Violations = rewrite.

10. **No duplicate series+message within the month**: No two ideas may share the same series AND the same core-message direction. If a series has duplicate core messages, vary the angle, persona, or journey stage on the excess ideas.

**If any check fails:** Fix the violations before finalising Step 5. Do not finalise until all 10 checks pass.

### Step 5: Output summary

The ideas are already tagged to the plan via `plan_id` — no plan write is needed after saving them (there is no phase bookkeeping to record; the plan's gates are the only state, and this skill never touches them). Output:

```
## YouTube Ideation — <period>

**Ideas saved:** <N> drafts (channel='youtube', propose-only — awaiting human curation)
  Long-form: <n> | Shorts: <n>

### Series Distribution
| Series | Target | Saved | Status |
|--------|--------|-------|--------|
| <series term_label> | <target> | <actual> | PASS / FAIL |

### Stage Mix
| Buyer Stage | Target | Saved | Status |
|-------------|--------|-------|--------|

### Diversity Check Results
| Constraint | Threshold | Actual | Status |
|------------|-----------|--------|--------|
| Hook opener variety (max same type) | ≤30% | <worst %> | PASS / FAIL |
| Repurposability coverage | ≥60% long-form | <count> | PASS / FAIL |
| Month-specificity (evergreen) | ≤25% | <count> | PASS / FAIL |
| Banned words | 0 | 0 | PASS |
| Duplicate series+message | 0 | <count> | PASS / FAIL |
| Pronoun consistency | 0 violations | <count> | PASS / FAIL |

### Persona taxonomy coverage
Personas listed in `brand/personas` with no corresponding `persona` taxonomy term (untaggable this run — add their taxonomy term before assuming full persona coverage): <none / list of persona names>

---
Curate and approve the video ideas in the content workspace (/content/youtube). Approving ≥1 idea opens Schedule; then re-invoke the agent.
```

## Output

- Draft ideas saved via `save_idea(channel='youtube', plan_id, source='ai', status='draft', …)` — narrative fields in `detail`, structural dimensions in `terms`, all DRAFT status, tagged to the youtube plan
- No gate flipped — ideas are drafts awaiting human curation
- Summary table showing series/stage distribution accuracy and diversity check results

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Always gate-check `plan.approved` first (Step 1). If the briefing is not approved, STOP — do not load the KB or save any idea.
- **Every persisted prose field is Vietnamese** (title, comment, hookDirection, coreMessage, whyNow, storyMoment, cta, theme) — hard rule, never English.
- `channel` must always be `'youtube'` and `plan_id` must always be set in every `save_idea` call.
- `terms` carry resolved taxonomy **ids** (via `list_taxonomies` / the plan's target rows) — never codes, never invented ids. Series, stages, personas, and values come from the taxonomies and KB docs, not from remembered lists.
- References only the twelve knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- The diversity thresholds in Step 4 are sourced from `rules/banned-words` and `channels/youtube` — those documents are the source of truth; the numeric guidance above is informational only.
- Operates only on the youtube channel (`channel='youtube'`); never reads or writes `post`/`ad` state.
- Requires `edit` capability (plus `view` for the reads).
