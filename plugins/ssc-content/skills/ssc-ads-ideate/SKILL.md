---
name: ssc-ads-ideate
description: Generates the month's ad concept lineup for the standalone Cambridge Diet Vietnam Ads pipeline — reads the ad channel_plan's APPROVED ad sets (the ad_plan_slots rows with status='approved', each carrying its own creative_count) and the structural knowledge base, and produces one DRAFT concept per planned creative IN APPROVED AD SETS ONLY via save_idea (channel='ad', plan_id, slot_id) — one approved ad set at a time, across ALL layers (L1/L2/L3/YouTube); unapproved (proposed) ad sets are skipped. Captures structural dimensions only (layer/slot/value/entry/against/experience/frame/archetype/format) — no finished Vietnamese copy. Enforces structural diversity, archetype balance, and frame-integrity rules, then runs an honest-scoring quality-replacement loop. Gated on ≥1 approved ad set (ad sets are approved individually; the plan-level approved flag is retired for the ad flow). Propose-only; concepts are drafts a human curates and approves in the dashboard.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, search_knowledge, get_channel_plan, list_taxonomies, save_idea, delete_idea]
---

# Ads Ideate (`ssc-ads-ideate`)

You generate one structural concept per planned ad creative **in an approved ad set** for the standalone Cambridge Diet Vietnam Ads pipeline. You read the ad `channel_plan`'s **approved ad sets** — the `ad_plan_slots` rows whose `status === 'approved'` (each row is rated + approved individually now; the plan-level `approved` flag is retired for the ad flow). These are a subset of the unified ad-set list the Blueprint step produced (ONE row per ad set across ALL layers — L1 theme slots, L2 omnipresence ad sets, L3 warm/retarget, YouTube — each row carrying its own `status`, `score`, `comment`, `creative_count`, and `build_spec`). You **fill each APPROVED ad set and skip unapproved (proposed) ones**, load the structural knowledge base, and produce one concept per creative via `save_idea` (channel=`'ad'`, `plan_id`, `slot_id`). Each concept's `title` is its **main concept — ONE concise, natural Vietnamese line** naming the ad idea (e.g. `"Trấn an EU: 60 năm an toàn cho phụ nữ U50"`). The structural dimensions (layer, value, entry, against, experience, frame, archetype/persona, format) live in `terms` (resolved taxonomy ids) + `detail` — **never inside the title**. Do NOT bake a `L3 / value / persona / frame` structural string or a `(taxonomy_code)` into the title. NO finished Vietnamese ad copy either (no full headlines, hooks, painPoints, body, CTA — that is the deferred `ssc.ads-writer`'s job). You self-enforce structural diversity and archetype-balance rules, then run an honest-scoring quality-replacement loop, before finalising. You are propose-only: every concept is created as a DRAFT for a human to curate and approve in the dashboard. You NEVER call `approve_idea`, `approve_channel_plan`, or any publish tool, and you NEVER flip a gate.

This is **step 4 of the five-step Ads pipeline** (**Focus → Approaches → Blueprint → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the ad plan is self-contained. The Blueprint step (step 3) is the **operational authority**: it derived every ad set across all four layers as `ad_plan_slots` rows, each carrying its `creative_count`, and the operator then approves ad sets individually. You iterate the **approved subset** of that ad-set list and fill it — you never re-derive the ad-set set, the counts, or the budget split, and you never touch ad sets still at `status='proposed'`.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the Blueprint

Call:

```
Call: get_channel_plan
  channel: ad
  period: <period>
```

**Gate-check (≥1 approved ad set):** Ad sets are now rated and approved **individually** — each `ad_plan_slots` row carries its own `status` (`'proposed'` | `'approved'`, plus `score` / `comment`). The plan-level `approved` flag is **retired for the ad flow** and is NOT the Ideate gate. From the returned `{ plan }`, read `plan.ad_slots` and take the subset of rows whose `status === 'approved'`. If `plan` is null **or** that approved subset is EMPTY, STOP immediately and tell the operator:

> No approved ad sets yet — review and approve ad sets in the Blueprint step (each ad set is approved individually); approving ≥1 opens Ideate.

Do not proceed past this gate under any circumstances — do not load the KB or save any concept until at least one ad set is approved.

If the approved subset is non-empty, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_idea` as `plan_id`
- **the approved ad sets** — `plan.ad_slots` filtered to `status === 'approved'`. This is the unified ad-set list the Blueprint produced (ONE row per ad set across ALL layers — L1 theme slots, L2 omnipresence ad sets, L3 warm/retarget, YouTube), **narrowed to only the approved rows**. This is the operational authority — the exact set of ad sets you iterate and fill. **An ad set whose `status !== 'approved'` is not filled and not counted.** Each approved row carries:
  - `id` — the `slot_id` / `detail.slotId` you pass to `save_idea` for **every** concept in that ad set, regardless of layer
  - `slot_name` — the ad-set name (e.g. an L1 theme name, an L2 omnipresence ad-set name like `L2 — Kiều My (chân dung)` or `L2 — Test: bữa trưa văn phòng`, `Lớp 3 — Tái chuyển đổi`, `YouTube — Shorts`)
  - `layer` — the resolved campaign layer (L1 / L2 / L3 / YouTube)
  - `creative_count` — **the exact number of concepts to produce for THIS ad set** (the single source of count truth)
  - `build_spec` — the ad set's Meta build map (objective/audience/optimization/budget/cap/placements/KPI), for tonal/contextual weight
  - **L1 rows additionally:** `primary_persona`/`value`/`frame`/`tonal_register`/`peak_window`/`format_pref` (the creative-steering dimensions). **L2 rows carry their own `value` on the slot row** (the Blueprint set it per the v3.0 omnipresence model — a CORE person-led ad set leans social-proof / lived-proof; a TEST concept ad set carries that test's own value); read it from the row, never re-pick it. L3/YouTube rows carry a `value` only if one clearly applied. **An L2 row's `creative_count` is read from the row like every other layer** — never assume it is 1 (the row is the authority; fill exactly what it says).
- `plan.tactics` — the approved Focus (markdown), for tonal/strategic weight
- `plan.context` — the approved Approaches (markdown): the creative HOW per layer, audience triggers, differentiation, experiments — for tonal/strategic weight

**Per-slot creative_count is the count authority.** The number of concepts to produce per **approved** ad set is that ad set's own `creative_count`. Prefer it over everything else. (For a plan authored **before** this change, the `ad_slots` rows may have no `creative_count`; only in that pre-migration case fall back to `plan.detail.creative_count_config`. Never use `creative_count_config` when the rows carry `creative_count`.)

If no **approved** ad set carries a `creative_count` (and there is no `creative_count_config` fallback), STOP and tell the operator the Blueprint step has not produced fillable ad sets yet — they must run the Blueprint and approve ≥1 ad set before Ideate.

### Step 2: Load the structural knowledge base

Call `get_knowledge` for each of these nine verified paths:

- `brand/angles` — the full angle system: value dimensions (§1.1), entry dimensions (§1.2), against dimensions (§1.3), experience dimensions (§1.4), frame codes (§3), Frame × Layer table, and diversity rules (§5)
- `brand/personas` — the three core audience archetypes (Chị Lan, Chị Hương, Chị Mai) and their value priorities, pain points, and entry dimensions
- `ad/creative-guidelines` — minimum creative counts per layer (Andromeda penalty thresholds); creative count verification rules
- `ad/layer-tones` — tonal register guidance per layer and frame
- `ad/strategy` — the three-layer ad architecture, L1 creative allocation priorities (§2.2), default budget splits
- `rules/banned-words` — hard-banned words and phrases (zero tolerance — verify concept labels against this list)
- `programme/kieu-my-story` — Kiều My's REAL founder story: the authoritative **source** for every person-led / founder angle (see the Authenticity guardrail in Step 4). Person-led concepts are DERIVED from this doc at runtime — never from a hard-coded angle list in this skill.
- `voice/founder-voice` — Kiều My's founder voice (tone for the person-led lane)
- `ad/awareness-framework` — Market Awareness × Sophistication + Emotion Audit + angle-type lens; the awareness↔tier mapping that drives which angle/value/frame fits each ad set's audience (used in Step 4's Awareness diagnosis)

Read all nine documents carefully before generating any concept. Structural rules in Step 4 and self-checks in Step 5 are sourced from `brand/angles` (§3, §5), `ad/awareness-framework`, and `ad/strategy` — those documents are the source of truth.

### Step 3: Resolve every structural code → taxonomy id

The structural dimensions on an ad concept (value, entry, against, experience, frame, archetype/persona, campaign layer) are **taxonomy-governed**: `save_idea`'s `terms` array must carry the matching `taxonomies.id`, not the human code. Resolve them once, before any write:

Call `list_taxonomies` once per needed `kind` (`value`, `entry`, `against`, `experience`, `frame`, `persona`, `campaign_layer`), **or** call `list_taxonomies` with no `kind` to get all kinds in one call, and build a `code → id` map per kind from the returned rows (each row carries `code` and its `taxonomies.id`). You will pass the resolved **leaf-term `id`s** in `save_idea`'s `terms`. NEVER pass a code (e.g. a frame code, `L1`) as a `term` and NEVER invent an id.

The `ad_slots` rows from Step 1 already carry resolved persona/value/frame ids from the Blueprint step — reuse those where a concept inherits its ad set's dimensions (L1 persona/value/frame; the **`value` on each L2 row** — CORE person-led leans social-proof/lived-proof, TEST is the test concept's own value; the L3/YouTube value where one is present), and use the maps above for the per-creative dimensions you vary (entry, against, experience, and any concept-specific value/frame).

### Step 4: Generate one concept per planned creative

Iterate the **approved** ad-set subset from Step 1 (`plan.ad_slots` filtered to `status === 'approved'`) **one ad set at a time, across every layer** (L1 theme slots, L2 omnipresence ad sets, L3, YouTube). **Fill each APPROVED ad set; skip unapproved ones** — an ad set with `status !== 'approved'` is not filled and not counted. For each approved ad set, produce **exactly its row's `creative_count`** concepts — no more, no fewer. Every concept you create for an ad set carries that ad set's row `id` as `detail.slotId` — for **every** layer (today only L1 set a slotId; now L2/L3/YouTube concepts also carry their ad set's slotId). Group your work by layer and then by ad set.

**Authenticity guardrail — real people are real, never fabricated (read FIRST):**

Every concept belongs to ONE of three lanes. Choose the lane, then obey its rule. NEVER fabricate a story, quote, event, number, or lived experience and attribute it to a real named person.

1. **Real named person.** **Kiều My is the primary person-led engine** — DERIVE her angles from her documented real story: read `programme/kieu-my-story` + `voice/founder-voice` (loaded in Step 2) and angle *that* material. Do NOT invent anything beyond what those docs contain, and **do NOT hard-code a fixed Kiều My angle list** — re-derive from the live docs every run (her story and positions live there, not in this skill). Consultants / customers (e.g. Bác Đỗ Dung, Thắm): **reuse EXISTING consented assets only** — do NOT generate "new real-person story" concepts (the team cannot source fresh real material per concept). If a slot wants a real-person angle with no existing asset, convert it to lane 2 or 3.
2. **Persona-illustrative** — the archetypes (Chị Hương / Chị Mai / Chị Lan). Illustrative scenarios are fine, framed as *representative* ("nhiều chị ở tuổi 45…"), but **never dressed as a named real testimonial**.
3. **Non-person** — science/mechanism, product/flavor, 6-step, app, safety/EU. No person attribution; generate freely.

The structural concept only tags the lane + dimensions — it never writes a person's words. A person-led concept's `detail.notes` MUST name its real source (e.g. `nguồn: programme/kieu-my-story` or `reuse existing <name> asset`), never an invented story.

**Creative count extraction (do this before writing any concept):**

Walk the **approved** ad-set subset only and write out the count plan explicitly — **one line per approved ad-set row, taking each count from that row's `creative_count`** (do not invent or redistribute counts; the Blueprint already decided them). Unapproved ad sets are omitted entirely:
```
L1:  [slot-name]=<row.creative_count>, ...      subtotal=X
L2:  [<L2 ad-set name>]=<row.creative_count>, ...        subtotal=Y
L3:  [slot-name]=<n>, ...                        subtotal=W
YT:  [YouTube — Shorts]=<n>, [YouTube — In-stream]=<n>   subtotal=V
Total: Z  (= sum of every APPROVED row's creative_count)
```
The total must equal the sum of `creative_count` across the **approved** `ad_slots` rows only — an ad set with `status !== 'approved'` contributes nothing. If an approved row carries no `creative_count` (pre-migration plan only), use the matching `plan.detail.creative_count_config` figure for that ad set.

**Awareness diagnosis + emotion audit (per ad set — do FIRST, before picking angles):**

For each approved ad set, before choosing its concept dimensions, use `ad/awareness-framework`:
1. **Diagnose the awareness stage** from the ad set's tier + audience, then pick the value/frame/against + **angle type** (Problem / Solution / Comparison / Proof / Curiosity) the framework says fits that stage — e.g. a cold/problem-aware L1 audience takes a Problem/Curiosity angle; a warm/most-aware L3 audience takes Proof/Comparison/Solution-direct. Do NOT put a warm offer/proof angle on a cold problem-aware audience, or a cold pain angle on a warm most-aware one.
2. **Apply the sophistication stance** from the framework (Cambridge = stage 3–4 → lead with MECHANISM — independent science / 6-step — + IDENTIFICATION — Kiều My — not bare benefit claims).
3. Write a **one-line emotion audit** for the ad set and let the chosen value/frame serve that emotion, not just the function.

Read all stage→angle mappings + craft rules (market's language, specificity > cleverness) from `ad/awareness-framework` — do not restate or hard-code them here. Carry the result into the dimension choices below.

**Archetype pre-assignment (L1 only — do this before writing any concept):**

For each **approved** L1 slot, decide which archetype each creative targets. Different archetypes experience the same slot tension differently (life stage, pain points, entry dimensions — see `brand/personas`). Write out:
```
[slot]: Lan=N, Hương=N, Mai=N
L1 total: Lan=N, Hương=N, Mai=N
```
CHECK (per the `brand/angles §5` archetype rules): all 3 archetypes present in L1, and no slot has all its creatives on one archetype. Fix before proceeding. Follow allocation priorities from `ad/strategy §2.2`.

**Frame pre-assignment (do this before writing any concept):**

Pre-assign frames across all creatives per layer. Check every frame against the Frame × Layer table in `brand/angles §3` — only use frames marked ★ or ◆ for that layer. "-" = DO NOT USE. Then enforce the **frame-diversity floors in `brand/angles §5`** (per-layer and per-ad-set frame caps + the minimum-distinct-frames rule for multi-creative slots) — read the numbers from §5; do not hard-code them here.

**For each concept, call `save_idea` with the following field mapping.** Structural dimensions are passed as resolved taxonomy ids in `terms`; the ad-set link goes in `detail.slotId` (**always set — the row id of the ad set this concept fills, for every layer**); the format + structural shorthand live in `detail.notes`. The `title` carries ONLY the concept's main idea as one concise Vietnamese line — no structural codes. There is NO `format_decision` blob (that was the retired monthly-plan shape).

```
save_idea(
  channel  = 'ad',
  plan_id  = <plan.id>,
  source   = 'ai',
  status   = 'draft',
  score    = <your self-rating, 1–5 — see Field guidance>,
  comment  = <one-line rationale for the score, in Vietnamese — see Field guidance>,
  title    = <the ad's MAIN CONCEPT — ONE concise Vietnamese line, e.g. "Trấn an EU: 60 năm an toàn cho phụ nữ U50". NOTHING else: no layer/persona/frame/value codes, no slot path, no "/"-delimited structural string, no "(taxonomy_code)">,
  terms    = [
    <campaign_layer leaf id>,   // L1 / L2 / L3 / YouTube layer term
    <value leaf id>,            // exactly one value
    <frame leaf id>,            // exactly one frame, valid for the layer
    <persona leaf id>,          // the targeted archetype
    <entry leaf id>,            // optional, may be omitted
    <against leaf id>,          // optional, may be omitted
    <experience leaf id>        // optional, may be omitted (L1/L2 pools must stay separate)
  ],
  detail   = {
    slotId: <plan.ad_slots[].id of the ad set this concept fills — ALWAYS set, for EVERY layer (L1/L2/L3/YouTube)>,
    notes:  <structural shorthand for the operator — layer / ad-set name / format / dimensions; NOT ad copy>
  }
)
```

`save_idea` INSERTS a new DRAFT idea on the ad channel, tagged to the plan via `plan_id` and to its ad set via `detail.slotId`. Always pass `channel='ad'` and `plan_id=<plan.id>`. **`save_idea` is insert-only** — it takes no `id` and never updates an existing row; calling it again with corrected fields would create a duplicate. To correct a concept you already saved, `delete_idea(<id>)` the flawed draft and save the corrected concept as a fresh `save_idea` call (the same delete + re-save loop Step 6 prescribes). (The MCP layer runs a taxonomy backstop on `terms` — cardinality / applicability / required / min-count / layer-pool — so resolve ids correctly; an invalid term set is rejected.)

**Field guidance:**

- `title` — the ad concept's **main title: ONE short, natural Vietnamese line** capturing the core idea of THIS creative (e.g. `"Trấn an EU: 60 năm an toàn cho phụ nữ U50"` or `"Bữa trưa văn phòng nhẹ bụng, đủ chất"`). Put NOTHING else in it: no `L1/L2/L3` layer, no persona / frame / value codes, no `/`-delimited dimension string, no parenthetical taxonomy code like `(safety_eu)`, no slot name. The structural dimensions are carried by `terms` and shown to the operator as chips; the layer is the section header. Keep it a concept title — not finished multi-line ad copy (no hook / body / CTA).
- `terms` campaign_layer — exactly one layer term: `Layer 1`, `Layer 2`, `Layer 3`, or `YouTube`.
- `terms` value — exactly one value per concept. **For L2 and L3, read the value from the ad set's own slot row (`ad_slots[].value` / `value_term_id`)** — the Blueprint set it on the row (per the v3.0 omnipresence model: a CORE person-led L2 ad set leans social-proof / lived-proof, a TEST L2 ad set carries its test concept's own value), so reuse that exact value id; do NOT re-pick it from `brand/angles`. At most 1 L3 exception. For L1, the value is the slot's primary `value` from its row, but you vary it within the slot per the within-slot value-diversity rule (Step 5) — concept-specific values come from `brand/angles §1.1`. If an L3/YouTube row has a null value, pick a best-fit value from `brand/angles §1.1` for that ad set's KPI/audience.
- `terms` persona — the targeted archetype. For L1, choose the archetype whose pain points align with this slot's tension and this creative's assigned entry dimension (start from the row's `primary_persona`). For L2/L3/YouTube, pick the best-fit archetype for the ad set's row `value`.
- `terms` entry — optional entry code, from `brand/angles §1.2`. For L1, source from the slot's intended entry directions, varying across creatives within the slot.
- `terms` against — optional against code, from `brand/angles §1.3`. Follow the slot's against intent if present; for slots with no intent, actively choose underrepresented against codes.
- `terms` experience — optional experience code, from `brand/angles §1.4`. L1 and L2 must use SEPARATE experience pools:
  - **L1 ONLY:** `exp-family-life`, `exp-office-lunch`, `exp-energy-change`, `exp-dinner-out`
  - **L2 ONLY:** `exp-consultant-moment`, `exp-app-tracking`, `exp-flavor-taste`, `exp-weekly-progress`
  - **Shared (max 1 across both):** `exp-morning-routine` (may appear in L1 OR L2, not both)
  - **L3/YouTube: experience is L1/L2-pooled and does NOT apply here — OMIT experience** (or use only the shared `exp-morning-routine`). There is no L3/YouTube experience pool, and the `save_idea` backstop rejects any L1/L2-pool experience term on an L3/YouTube concept — do not attach one.
- `terms` frame — frame code from `brand/angles §3`. Must be marked ★ or ◆ for the creative's layer in the Frame × Layer table. "-" = forbidden for that layer.
- `detail.slotId` — **always set**: the `id` of the `ad_plan_slots` row (`plan.ad_slots[].id`) for the ad set this concept fills. The Blueprint models EVERY ad set (L1 theme slots, the L2 omnipresence ad sets, L3, YouTube) as its own row, so every concept — for every layer — carries its ad set's row id here. Never omit it.
- `detail.notes` — structural shorthand for the operator: layer / ad-set name / format / the chosen dimensions. NOT ad copy. The format intent (`reel` / `video` / `carousel` / `image` / `story`) lives here — YouTube Shorts must be `reel` or `video`; YouTube In-stream must be `video`.
- `score` — **self-rate every concept on a 1–5 scale** (rendered as stars for the operator to curate by strength). Judge how strongly the concept serves the month's approved tactics and its slot, the structural integrity (frame × layer validity, archetype fit, angle freshness within the slot). Rate honestly and **use the full range** — do not give everything 5. 5 = a standout you'd lead the month with; 3 = solid; 1–2 = weak/filler. Nothing auto-approves on it.
- `comment` — a **one-line rationale for the `score`, written in natural Vietnamese** (shown next to the stars for a Vietnamese operator): the single biggest reason the concept is strong or weak — e.g. "Frame confession khớp L1 Chị Hương, góc against sắc" or "Trùng value+frame với concept khác trong slot, thiếu khác biệt". Always Vietnamese (never English); keep it short and honest; it should justify the number you gave.

### Step 5: Self-check structural diversity and compliance

Before finalising (perform checks per batch and then across the full set), audit all concepts against these constraints. **Every check below is scoped to the approved ad-set subset** — "all concepts", "the full lineup", "the total lineup", every layer/slot/ad-set reference means the concepts you generated for `status === 'approved'` ad sets (unapproved ad sets have no concepts and are excluded from all counts and ratios). The definitive rules live in `brand/angles §3` and `§5` and `ad/strategy` — those documents are the source of truth.

**Mandatory checks (all must PASS before Step 6):**

0. **Authenticity (hard gate — check FIRST).** No concept attributes an invented story / quote / specific to a real named person. Every person-led concept is either (a) a Kiều My angle traceable to `programme/kieu-my-story` / `voice/founder-voice`, or (b) a reuse of an existing consented consultant/customer asset — and its `detail.notes` names that source. ZERO "new real-person story" concepts. Any violation → drop the concept or convert it to persona-illustrative / non-person before proceeding.

1. **Creative count per approved ad set (all layers)** — Count concepts per **approved** ad set and compare to **that ad set's row `creative_count`**. This covers EVERY layer among the approved subset — L1 theme slots, the L2 omnipresence ad sets, L3, and YouTube — by their own row count (for a pre-migration plan with no row `creative_count`, fall back to that ad set's `creative_count_config` figure). Every approved ad set's saved count must equal its row's `creative_count` exactly; an unapproved ad set must have **zero** concepts. Any deviation = fix before finalising.

2. **Archetype presence in L1** — All 3 archetypes (Chị Lan, Chị Hương, Chị Mai) must appear in L1 per the `brand/angles §5` archetype rule. If any is absent, reassign a concept now.

3. **Per-slot archetype balance** — Enforce the per-slot archetype-diversity rule in `brand/angles §5` (a multi-creative L1 slot must span enough distinct archetypes; no archetype may take a whole slot). Read the threshold from §5.

4. **Frame × Layer validity** — Every concept's frame must be marked ★ or ◆ for its layer in the Frame × Layer table in `brand/angles §3`. A frame marked "-" for that layer is forbidden. Check each concept individually.

5. **Per-layer frame cap** — Enforce the per-layer frame cap + minimum-distinct-frames-per-layer from `brand/angles §5`. Count per layer; fix violations by substituting valid alternative frames.

6. **Per-slot frame cap** — Enforce the per-slot frame cap + the minimum-distinct-frames rule for multi-creative slots, both from `brand/angles §5`.

7. **L2 diversity across ad sets** — An L2 ad set typically carries a single creative (its row's `creative_count`), so there is usually no within-ad-set frame pair to check; where an L2 row carries more than one, apply the per-ad-set frame rules from `brand/angles §5` to it too. Across ad sets, enforce the L2 cross-ad-set diversity rule in `brand/angles §5` (avoid two L2 ad sets sharing the same frame **and** value; the omnipresence roster should span distinct angles — person-led CORE variants + concept TESTs).

8. **L2 value source** — Every L2 concept must carry **its own ad set's `value` from the slot row** (`ad_slots[].value` / `value_term_id`, set by the Blueprint per the v3.0 model: CORE person-led leans social-proof / lived-proof, TEST carries the test concept's own value). Read it from the row; do not re-pick it from `brand/angles`.

9. **L3 value consistency** — All concepts in an L3 ad set use **that ad set's row `value`** (the Blueprint-declared L3 value). At most 1 exception per L3 ad set.

10. **Within-slot value diversity** — Enforce the per-slot value-diversity rule in `brand/angles §5` (a multi-creative L1 slot must not exceed the §5 primary-value cap; ≥1 creative carries a different value than the slot's primary).

11. **not-suffering coverage** — The `not-suffering` value must meet the lineup floor in `brand/angles §5`. If below it, assign it to L1 or L2 concepts where the angle is about self-acceptance or permission to care for oneself.

12. **Against distribution** — Enforce the against-distribution rule in `brand/angles §5` (per-code share cap across the lineup + the minimum distinct against codes across L1). Count per code and redistribute if a §5 threshold is exceeded.

13. **Within-slot experience diversity** — Enforce the per-slot experience-diversity rule in `brand/angles §5` for multi-creative L1 slots (do not copy one experience code across a whole slot; one creative may have null experience).

14. **L1-L2 experience pool separation** — Enforce the L1/L2 experience-pool separation in `brand/angles §5` (L1 concepts use only the L1 pool, L2 only the L2 pool; the shared code appears in one layer, not both). Zero exceptions.

15. **Valid format enum** — Every concept's `detail.notes` format must be one of: `reel`, `video`, `carousel`, `image`, `story`. YouTube creatives must use `reel` or `video` only. Any other value = fix immediately.

16. **Unique angle per slot** — Per `brand/angles §5`, no two concepts in the same slot may share the same `value + entry + against` triple. Fix by varying entry or against on the duplicate.

17. **Clean title + no banned words** — Each `title` must be a single concise Vietnamese concept line carrying NO structural codes: no `L1/L2/L3`, no persona / frame / value codes, no `/`-delimited dimension path, no parenthetical taxonomy code like `(safety_eu)`, no slot name. Any title that is a structural string = rewrite it as a real concept title. Then scan every `title` against `rules/banned-words`; any banned term = rewrite.

18. **Awareness fit (per `ad/awareness-framework`)** — Each concept's angle type / value / frame fits its ad set's diagnosed awareness stage (cold-tier audiences → problem/curiosity/solution-benefit; warm-tier → proof/comparison/direct), and the lineup honors the sophistication stance (mechanism + identification, not bare claims). Any mismatch = reframe before finalising.

**If any check fails:** Fix the violations by replacing the affected concept — `delete_idea(<id>)` the flawed draft, then save the corrected concept via a fresh `save_idea` call (`save_idea` is insert-only; re-calling it does not update the existing row). Do not finalise Step 6 until all 18 checks pass.

**Diversity summary (write before finalising):**

```
L1 archetypes: Lan=N, Hương=N, Mai=N — [PASS/FAIL]
Per-slot archetype balance: [list worst slot, e.g. "Slot X: Lan=4" → FAIL]
Frame usage per layer: [list frame→count for any frame with count>1]
not-suffering: appears on N concepts — [PASS/FAIL]
against codes: [list code→count, flag any >40%]
L1 against distinct codes: N — [PASS/FAIL]
L1-L2 experience pool separation: [PASS/FAIL]
within-slot experience diversity: [PASS/FAIL — list any slot with 0 variety]
Format enum: all valid — [PASS/FAIL]
Unique angle per slot: [PASS/FAIL]
Total concepts: N (target N) — [PASS/FAIL]
```

### Step 6: Quality replacement loop — remove weak concepts and replace them

Raise the floor on quality: **no saved concept may remain at 3 stars or below.** Using your own self-ratings from Step 4 (you know each concept's `id` from its `save_idea` result and the `score` you gave it):

1. Identify every saved concept rated **≤ 3** (3★ and below).
2. For each one:
   - Call `delete_idea(<id>)` to remove the weak draft — it never reaches the operator.
   - Generate a **fresh, stronger replacement for the SAME ad set / layer** (so that ad set's row `creative_count` stays exact), honouring every Step 5 rule (frame × layer validity, archetype balance, experience-pool separation, banned words) and the same `slot_id`. Save it via `save_idea` with an honest new `score`.
3. Re-rate the replacement. If it is still ≤ 3, repeat — but **bound the loop at 2 replacement attempts per slot position**. If after 2 attempts a position still can't reach ≥ 4★, keep the best attempt and note that slot position (and why) in the Step 7 summary.
4. Continue until **every saved concept for the plan is rated ≥ 4★** (or a position hits its bound).

Rate **honestly** — never inflate a weak concept to 4 just to exit the loop; the goal is genuinely stronger concepts, not gamed scores. Deleting + replacing keeps the per-ad-set counts constant, so re-run the Step 5 **creative-count-per-ad-set** check afterwards to confirm each ad set's distribution still matches its row `creative_count`. This loop is propose-only: it removes and replaces YOUR OWN drafts before the human curates — it never touches approved concepts and never flips a gate.

### Step 7: Output summary

After all concepts have been saved, all 17 self-checks pass, and the quality loop is complete, output:

```
## Ads Ideate — <period>

**Concepts saved:** <N> drafts (channel='ad', propose-only — awaiting human curation)

### Creative Count per Approved Ad Set
One row per **approved** `ad_plan_slots` ad set (only `status === 'approved'`) across all four layers; **Target = that ad set's row `creative_count`**. Unapproved ad sets are excluded from this table entirely.
| Layer / Ad set | Target | Saved | Status |
|----------------|--------|-------|--------|
| L1 / <slot> | <row.creative_count> | <N> | PASS / FAIL |
| L2 / <ad-set name> (CORE/TEST) | 1 | <N> | PASS / FAIL |
| L2 / <ad-set name> (CORE/TEST) | 1 | <N> | PASS / FAIL |
| … (one row per approved L2 ad set, each Target 1) | 1 | <N> | PASS / FAIL |
| L3 / <slot> | <row.creative_count> | <N> | PASS / FAIL |
| YouTube — Shorts | <row.creative_count> | <N> | PASS / FAIL |
| YouTube — In-stream | <row.creative_count> | <N> | PASS / FAIL |
| **Total** | **<sum of APPROVED row counts>** | **<N>** | PASS / FAIL |

(List only the approved ad sets; an ad set still at `status='proposed'` is not shown and contributes 0 to the total.)

### Structural Diversity Check
| Constraint | Threshold | Actual | Status |
|------------|-----------|--------|--------|
| L1 archetypes present (all 3) | 3 | <N> | PASS / FAIL |
| Worst-slot archetype imbalance | ≤all-one-archetype per 4-slot | <worst slot> | PASS / FAIL |
| not-suffering coverage | per §5 | <N> | PASS / FAIL |
| Against concentration (max per code) | per §5 | <worst code pct> | PASS / FAIL |
| L1 against distinct codes | per §5 | <N> | PASS / FAIL |
| Frame cap per layer (max per frame) | per §5 | <worst frame count> | PASS / FAIL |
| Frame cap per slot (max per frame) | per §5 | <worst slot frame count> | PASS / FAIL |
| L2 diversity across ad sets (no dup frame+value) | distinct across ad sets | <any violations> | PASS / FAIL |
| L1-L2 experience pool separation | no overlap | <any shared codes> | PASS / FAIL |
| Within-slot experience diversity | per §5 | <any violations> | PASS / FAIL |
| Unique angle per slot | no duplicate v+e+a | <any violations> | PASS / FAIL |
| Valid format enum | reel/video/carousel/image/story | <any violations> | PASS / FAIL |

### Quality scores
All saved concepts ≥ 4★: <yes / no — list any bounded positions>

---
Curate and approve ad concepts in the dashboard at: Ideas → <period> (filter channel = ad). Approving ≥1 concept opens the Ideas gate; then re-invoke the agent to run **Measure** (the final step — there is no Schedule step in the ad flow; the deployment blueprint already lives in the approved Blueprint).
```

## Output

- One draft concept per planned creative **in an approved ad set** saved via `save_idea(channel='ad', plan_id, source='ai', status='draft', terms, detail.slotId, …)` — all DRAFT status, tagged to the ad plan and to its approved ad set via `detail.slotId` (for EVERY layer). Unapproved ad sets are skipped — no concepts saved for them.
- No gate flipped — concepts are drafts awaiting human curation
- Summary table showing per-approved-ad-set count accuracy (against each approved row's `creative_count`) and structural diversity check results

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Propose-only.** `save_idea` creates DRAFT concepts only. NEVER calls `approve_idea`, `approve_channel_plan`, `publish_*`, or any scheduling tool, and NEVER flips a gate.
- **Title = the concept; dimensions = `terms`.** The `title` is the ad's main concept as ONE concise Vietnamese line — nothing else (no layer/persona/frame/value codes, no `/`-delimited structural string, no parenthetical taxonomy code, no slot name). The structural dimensions are carried ONLY by `terms` (resolved taxonomy ids), surfaced to the operator as chips; the format intent lives in `detail.notes`.
- **No finished copy.** Beyond the concept title, do NOT produce finished ad copy — no `vietnameseHeadline`, `hook`, `painPoint`, `messagingAngle`, body, or CTA. This skill stops at the concepts gate; finished copy is the deferred `ssc.ads-writer`'s job.
- **NEVER writes `phase_status`, `monthly_plans`, or `targets.ads`** — those belonged to the retired shared-head model. The skill writes only DRAFT ideas; it makes no plan-state write at all.
- **No auto-approval.** The human operator curates and approves concepts in the dashboard (the Ideas gate is per-concept `approve_idea` → `status='approved'`). After the Ideas gate, the agent proceeds to the ungated **Measure** step — there is no Schedule step in the ad flow.
- **Gate = ≥1 approved ad set** (Step 1) — read `plan.ad_slots` and keep only rows with `status === 'approved'`. The plan-level `approved` flag is retired for the ad flow and is NOT the gate. If the approved subset is empty, STOP — do not load the KB or save any concept.
- References only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- The structural rules in Step 5 are sourced from `brand/angles §3` and `§5` and `ad/strategy` — those documents are the source of truth; the numeric guidance above is informational only.
- **Reads its targets and ad sets from the unified `plan.ad_slots` list, filtered to the APPROVED subset (`status === 'approved'`) — only those ad sets are filled and counted, each approved row's own `creative_count` being the count authority** — never from `detail.creative_count_config` (a pre-migration fallback only) and never from `targets.ads`. An ad set still at `status='proposed'` is skipped. Ties every concept to its approved ad set via `detail.slotId` for EVERY layer.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the `get_channel_plan` and `get_knowledge` reads).
