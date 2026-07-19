---
name: ssc-ads-blueprint
description: >-
  Runs the Blueprint step of the standalone Cambridge Diet Vietnam Ads pipeline — composes the full per-ad-set Meta build map (the deployment blueprint) as RATED, proposed ad sets. Gated on the approved Approaches (approaches_approved). Reads the approved Approaches (context) + Focus, then derives EVERY ad set across all four layers (L1 theme slots, L2 omnipresence, L3 warm/retarget, YouTube) and realizes each one's build_spec (campaign / objective / audience / optimizationGoal / budgetMode / budgetShare / frequencyCap / placements / tier-KPI) plus a creative_count from ad/campaign-architecture + ad/strategy + ad/creative-guidelines. Scores each ad set 1–5 with a Vietnamese comment (symmetric with Ideate). Writes the complete ad-set set via save_ad_plan_slots (each row carrying score + comment + creative_count + build_spec), resolving all taxonomy codes → ids via list_taxonomies. Per-ad-set budget lives in each row's build_spec.budgetShare — no separate Meta-vs-YouTube split or layer-% roll-up. Propose-only: writes rated proposed ad sets, never approves any ad set, never flips a gate. The operator approves ad sets individually in the dashboard; approving ≥1 opens Ideate.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, search_knowledge, get_channel_plan, list_taxonomies, save_ad_plan_slots]
---

# Ads Blueprint (`ssc-ads-blueprint`)

You run the **Blueprint** step of the standalone Cambridge Diet Vietnam Ads pipeline — you compose the **full per-ad-set deployment blueprint**: the complete Meta build map of campaigns → ad sets, where **every ad set across all four layers** (L1 theme slots, L2 omnipresence, L3 warm/retarget, YouTube) carries its own `build_spec` (objective, audience, optimization goal, budget mode/share, frequency cap, placements, and the tier KPI it is judged on) plus a `creative_count`. You read the approved Approaches (the creative *how*, written to `context`) and the approved Focus (the *bets*, in `tactics`), then realize the build spec for each ad set **from the KB** — the per-ad-set architecture (objectives, audiences, optimization, budget mode) is fixed by `ad/campaign-architecture` v3.0 + `ad/strategy`; the month-decisions are the L1 slots, the **L2 omnipresence ad-set set** (the person-led CORE roster + however many concept TEST ad sets the month's `tactics`/`context` call for — the TEST count is tactics-driven, never hard-coded), the per-ad-set budget shares, and the creative counts. The Approaches and the bets are the **steering**; the KB supplies the architecture, angle vocabulary, and creative-count floors.

The Blueprint is **symmetric with Ideate**: each ad set is a **rated card** the operator approves individually. You score every ad set 1–5 with a one-line Vietnamese rationale — exactly as `ssc-ads-ideate` scores concepts — so the operator can review and approve the ad sets they want.

You are propose-only: you write the **complete ad-set set** via `save_ad_plan_slots` (each row carrying `score` + `comment` + `creative_count` + `build_spec`), then stop. You do **not** produce a separate Meta-vs-YouTube budget split or a layer-% roll-up — per-ad-set budget lives only in each ad set's `build_spec.budgetShare`. Each ad set's `status` defaults to `'proposed'` (you do NOT set it). The operator then **approves ad sets individually** in the dashboard, and approving ≥1 ad set opens Ideate. You write **rated proposed ad sets, never approve any ad set, and never flip a gate**. You NEVER call `approve` (the ONLY gated promotion; the approval hook denies it to agents), `create_*`, `publish_*`, `save_ad_schedule_weeks`, or any scheduling tool, and never use `edit` to demote/unapprove a row.

The unified `ad_plan_slots` set you write here is the **operational authority** — `ssc-ads-ideate` iterates this exact ad-set list and reads each row's `creative_count` to decide how many concepts to produce per ad set, tying every concept to its ad set via `detail.slotId`. It STOPS if the slots are absent. Get the ad-set set, the build specs, the scores, and the counts right.

This is **step 3 of the five-step Ads pipeline** (**Focus → Approaches → Blueprint → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the ad plan is self-contained. There is **no separate Schedule step** and no `schedule_approved` gate in the ad flow — the deployment blueprint lives here, at step 3, and produces rated proposed ad sets the operator approves one by one.

**CRITICAL PROHIBITION — NO AD-SET FLIGHT DATES.** Ad sets run continuously and indefinitely; Facebook needs uninterrupted data to exit the learning phase. A `build_spec` specifies HOW each ad set is built (objective, audience, budget, cap, placements) — **never** a start date, end date, launch date, or pause date. The L1 `peak_window` is a *relevance window for rotating creative in/out*, not an ad-set flight schedule. If you catch yourself writing "launch in week 2" or "pause after week 3" in any build_spec or note, stop and rewrite.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the Approaches

Call:

```
Call: get_channel_plan
  channel: ad
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.approaches_approved` is not `true`, STOP immediately and tell the operator:

> The Approaches have not been approved yet. Please review and approve the Approaches in the dashboard before running the Blueprint.

Do not proceed past this gate under any circumstances — do not load the KB, derive ad sets, or write anything.

If `plan.approaches_approved` is `true`, extract and hold:

- `plan.context` — the approved Approaches (markdown): the creative HOW per layer, audience triggers, differentiation, experiments. This is the **primary steering** for sizing budget and instantiating the L1 slots.
- `plan.tactics` — the approved Focus (markdown): the bets — priority pillars/angles. Secondary steering.
- `plan.id` — the plan id, for `save_ad_plan_slots`.
- `plan.retrospective` — if present, the prior cycle's tier grades (carry winners forward when sizing per-ad-set `budgetShare`; honour them tier-correctly).

### Step 2: Load the architecture and brand knowledge

Call `get_knowledge` for each of these verified paths:

- `ad/campaign-architecture` — **the build-spec architecture source** (currently **v3.0**): the three-layer campaign structure, per-layer objective / buying type / optimization goal / budget mode, the **v3.0 L2 omnipresence model** (a set of always-on ad sets, each carrying exactly ONE creative, split person-led CORE / concept-test TEST per the doc's range + ratio — NOT four fixed pillar ad sets), audience definitions, and the budget-split defaults. This is the source of truth for every `build_spec` field, every per-tier ad-set count, and the L2 range/ratio — read them here, never hard-code them in this skill.
- `ad/strategy` — **the build-spec architecture source**: the three-layer ad strategy, the per-tier KPI system (Hệ Thống KPI), L1 creative allocation priorities (§2.2), the L2 omnipresence model, and the default budget splits (§3).
- `ad/creative-guidelines` — minimum creative counts per ad set (the Andromeda floor) — the source for every `creative_count`; read the floor here, do not hard-code it.
- `ad/campaign-l3` — Lớp 3 setup: the **consolidated** warm/retarget audience (ONE ad set, differentiated by angle/creative — never sub-segmented) + the L3 creative approach.
- `ad/campaign-tracking` — custom-audience definitions (e.g. `L2_Engagers_75pct_21d`) the L3 consolidated audience is built from.
- `ad/layer-tones` — tonal register guidance per layer/frame (the source for each L1 `tonal_register`).
- `brand/angles` — value dimensions (§1.1), entry dimensions (§1.2), against dimensions (§1.3), experience dimensions (§1.4), frame codes (§3) and the Frame × Layer table.
- `brand/personas` — the core audience archetypes and their pain points / entry dimensions / priority tiers (e.g. "cao nhất" / "cao" / "trung bình" / "chọn lọc"). The names, the count, and the tiers all live in this document — do not assume them; re-read it every run.
- `content/pillars` — the content pillar strategy and pillar names (used as a *creative* angle vocabulary; an L2 ad set is NOT one pillar — see the v3.0 omnipresence model below).
- `programme/kieu-my-story` — Kiều My's REAL founder story: the source for the person-led L2 CORE angles (the proven cheap-reach person engine). Person-led concepts are DERIVED from this doc, never fabricated.
- `rules/banned-words` — hard-banned Vietnamese words/compounds — verify every slot name and every Vietnamese string in a build_spec.

Read these carefully. They are the authoritative source for all structural decisions. **Where a document conflicts with any inline guidance in this skill, the document wins.** In particular, realize the L2 ad-set set from `ad/campaign-architecture` (the real omnipresence model), not from any hardcoded count below.

### Step 3: Derive EVERY ad set across all four layers

**Principle — derive, never hard-code.** Every ad-set count, audience, theme, and test across all tiers comes from the approved **Focus (`tactics`) + Approaches (`context`)** applied to the **KB** (`ad/campaign-architecture`, `ad/strategy`, `ad/creative-guidelines`, `brand/angles`). This skill carries NO fixed counts or models — if a number isn't traceable to the month's tactics or the KB, you're hard-coding; stop and read it from the source. The whole point of Focus/Approaches is that the strategist's monthly choices change the plan and the system self-improves as the KB evolves — honor them.

Derive the complete ad-set list. There is **one campaign per layer** (L1, L2, L3) plus a **YouTube campaign**, and each campaign contains its ad sets. Every ad set — L1, L2, L3, and YouTube — becomes one `ad_plan_slots` row carrying a `build_spec` + a `creative_count` + a `score` + a `comment`. For L1 ad sets you additionally set the creative-steering dimensions (persona/value/frame/tonal-register/peak-window/format).

**Rate each ad set (symmetric with Ideate).** As you derive each ad set, assign an honest `score` — an integer **1–5** — and a one-line **Vietnamese** `comment` rationale, exactly as `ssc-ads-ideate` scores concepts. Use the **full range**: `5` = a standout ad set you'd lead with, `3` = solid, `1–2` = weak. Rate honestly — do **not** inflate; not every ad set is a 5. The score reflects how strong this ad set is as a bet given the Approaches, the persona/value/frame fit, and the tier's role; the comment states the one-line *why* in Vietnamese. You carry `score` + `comment` on each `ad_plan_slots` entry in the single `save_ad_plan_slots` call (Step 4). `status` is left to default to `'proposed'` — you never set it.

For **each** ad set, realize a `build_spec` object from the KB with keys **exactly**:

```
campaign, objective, audience, optimizationGoal, budgetMode, budgetShare, frequencyCap, placements, kpi
```

Derive every value from `ad/campaign-architecture` + `ad/strategy` — **do not invent numbers**. Strings are Vietnamese (see the Vietnamese rule). The `budgetShare` is a share/level (a % of the layer or an ABO daily level), **never a flight schedule**.

**Per-tier KPI correctness is MANDATORY** (sourced from `ad/strategy` "Hệ Thống KPI" + §3 and `ad/campaign-architecture`):
- **L1 (cold) = cost-per-purchase** (funnel intake; expected ~1.8–2× warm by design — fund it to feed the funnel).
- **L3 (warm / retarget) = cost-per-purchase** (the money tier — best cost-per-purchase, highest order volume; protect/scale).
- **L2 (awareness / omnipresence) = reach / CPM / frequency — NEVER cost-per-purchase.** Its ~0-purchase output is correct; never size or grade it on purchases.
- **YouTube = CPV** (ThruPlay/views; awareness support for L2, not direct Messenger conversion).

#### A. L1 — cold / conversion campaign

Derive the cold theme/audience ad sets **the approved Approaches (`context`) + Focus (`tactics`) call for** — **one ad set per cold theme/audience the month's tactics define.** The count is **tactics-driven, never hard-coded**: instantiate as many as the tactics name, consolidating further only where a split would fragment cold learning below what `ad/campaign-architecture` / `ad/strategy` advise. Each L1 theme slot is one ad set. For each:

- **Steering dimensions** (L1 only):
  - `slot_name`: a concise, natural Vietnamese ad-set name — the concept/theme ONLY, with **NO layer prefix** (never `"Lớp 1/2/3 —"`, `"L1/L2/L3 —"`, or `"YouTube —"`; the layer is carried by `layer_term_id` + the section header, so a prefix is redundant clutter). Use the EXACT name consistently everywhere (Ideate matches concepts to slots by `slot_id`; the name must read cleanly for the operator). This no-layer-prefix rule applies to L1/L2/L3/YouTube alike.
  - `peak_window`: the peak relevance window, e.g. `"đỉnh điểm tuần 1-2"` — a window for rotating creative, **NOT** a start/stop flight date.
  - `primary_persona`: exactly ONE persona, chosen from whichever personas `brand/personas` currently lists — not two.
  - `value`: the primary value dimension from `brand/angles §1.1` (e.g. `emotional-permission`, `science-based-program`).
  - `frame`: the recommended frame code from `brand/angles §3` — must be marked ★ or ◆ for L1 in the Frame × Layer table.
  - `against` *(slot-level intent)*: the against dimension from `brand/angles §1.3` this slot contrasts with (e.g. `vs-self-dieting`, `vs-mlm`) — or none if genuinely absent. **At least 2** of the L1 slots should carry an against intent (Ideate distributes against codes per-creative). Honour the differentiation direction from the Approaches.
  - `format_pref`: preferred format(s), e.g. `"video/carousel"`.
  - `tonal_register`: the Kiều My register for this slot — must be one of `confessor`, `educator`, or `friend`.
- **`build_spec`** (realize from `ad/campaign-architecture` L1 row + `ad/campaign-l1`/`ad/strategy`):
  - `campaign`: the L1 campaign name (e.g. `"Lớp 1 — Chuyển đổi"`).
  - `objective`: `"Messages"` hoặc `"Purchase"` (A/B per KB).
  - `audience`: cold/broad targeting summary for this slot's persona (e.g. broad / interest / lookalike per the slot persona).
  - `optimizationGoal`: `"Conversations"` / `"Purchase"` per KB.
  - `budgetMode`: `"Daily budget"` (per KB — L1 daily budget).
  - `budgetShare`: this slot's share of the L1 split (a level/%, not a date).
  - `frequencyCap`: `"n/a"` for the conversion tier (no omnipresence cap).
  - `placements`: per KB (e.g. Advantage+ / manual placements).
  - `kpi`: `"cost-per-purchase"`.
- **`creative_count`**: the **Andromeda creative floor for a conversion ad set as defined in `ad/creative-guidelines`** — enough distinct creatives to clear the near-duplicate penalty. Read the floor from the KB; do not hard-code the number here.

**Programme grounding:** For product-focused L1 slots, name the specific programme step or product being featured, not just "chương trình Cambridge."

#### B. L2 — omnipresence / awareness campaign (the v3.0 omnipresence model)

Realize the L2 ad-set set from `ad/campaign-architecture` **v3.0**. The core principle: **an ad set = an AUDIENCE/OBJECTIVE; a creative = an ANGLE.** L2 ad sets are **NOT** split by content pillar. The old v2.0 "4 fixed pillar ad sets" (`L2_Empathy` / `L2_Science` / `L2_Solution` / `L2_SocialProof`, each mapped 1:1 to a pillar) is **RETIRED and WRONG** — it conflated a creative angle with an ad-set unit. Do not enumerate it.

**v3.0 L2 = a set of omnipresence ad sets, each carrying the L2 creative count defined by `ad/campaign-architecture` v3.0 — currently exactly ONE creative per L2 ad set** (the KB-derived L2 count, v3.0: 1; if the KB bumps it, follow the KB). The **omnipresence ad-set range and the CORE/TEST ratio also live in `ad/campaign-architecture` v3.0 — read them from the KB; do not restate fixed numbers in this skill.** Both counts flow from the month's `tactics`/`context` applied to the KB's range + ratio; neither is hard-coded:

- **CORE = person-led (~60%).** The proven cheap-reach person winners + real-person portrait/story variants — Kiều My, Bác Đỗ Dung, Thắm + variants (derive Kiều My angles from `programme/kieu-my-story`; reuse only EXISTING consented real-person assets, never fabricate). This is the **reach engine** — person/story creative gets CPM < 10k. Each CORE ad set's `value` leans **social-proof / lived-proof** (e.g. `lived-proof`, `social-proof`). The CORE count **fills the remainder** to keep the ~60/40 split and the 7–10 total.
- **TEST = concept experiments DERIVED FROM THE MONTH'S TACTICS (~40%).** However many strategically-different concept tests the approved Focus `tactics` + Approaches `context` call for — **do NOT hard-code the test count; read it from the month's tactics**. Each TEST ad set is **non-person-led** (a new angle / format / hook), placed on the **generic L2 leaf**, carries a **budget cap + a win gate** (promote to CORE if it beats the person-led < 10k CPM benchmark; else kill + rotate), and its `value` is chosen **per-test from that test's concept** (not fixed).

Resolve every `value` to an actual code present in `brand/angles §1.1`.

For each L2 ad set (CORE and TEST alike):
- `slot_name`: a concise Vietnamese ad-set name identifying its audience/concept, **no layer prefix** (e.g. `"Kiều My (chân dung)"`, `"Bác Đỗ Dung"`, `"Test: bữa trưa văn phòng"`). Use the EXACT name consistently everywhere.
- `value`: CORE → a person-led social-proof / lived-proof value; TEST → the test concept's own value. Carried on the row as `value_term_id`.
- `peak_window`, `primary_persona`, `frame`, `tonal_register`: leave null — Ideate fills the single concept; the value source is the row.
- **`build_spec`** (realize from `ad/campaign-architecture` v3.0 L2 + `ad/strategy`):
  - `campaign`: `"Lớp 2 — Awareness (Omnipresence)"`.
  - `objective`: `"Awareness"`.
  - `optimizationGoal`: `"Reach"`.
  - `audience`: warm — L1 non-converters / engagement custom audiences, **warm audience ≤ 50k** (note the ceiling).
  - `budgetMode`: `"ABO"` (low budget per ad set).
  - `budgetShare`: this ad set's share of the L2 split (a level — not a date). For a TEST ad set, note its budget **cap**.
  - `frequencyCap`: the omnipresence cap **= (total # L2 ad sets ÷ cap-days)** so the total stays ~2–3 impressions/person/day — the cap **adapts to the actual L2 total**, NOT to the core/test ratio (e.g. 7 ad sets → ~1 lần/3 ngày; 10 ad sets → ~1 lần/4 ngày). State it per-ad-set in Vietnamese, e.g. `"~1 lần/3 ngày mỗi ad set (tổng ~2–3 lần/người/ngày)"`.
  - `placements`: **manual placements** per KB (ưu tiên Feed/Reels).
  - `kpi`: `"reach/CPM/frequency"` — **NEVER cost-per-purchase**.
  - For a TEST ad set, append a `build_spec.note` flagging `"test: budget cap + win gate (vượt benchmark person-led <10k CPM thì promote lên CORE, không thì kill + rotate)"`.
- **`creative_count`**: the **KB-derived L2 count (v3.0: 1)** for every L2 ad set — per `ad/campaign-architecture` v3.0; if the KB bumps it, follow the KB.

Heritage (60 năm / EU) + flavour are **conversion proof → L3**, never L2 awareness hooks — do not assign them as an L2 ad set's angle.

#### C. L3 — warm / retarget campaign

Derive the L3 ad set(s) from **`ad/campaign-l3` + `ad/campaign-tracking`**, which define the **single consolidated warm/retarget audience** (e.g. L2 video-engagers ≥75%/21d, with existing-customer + recent-messenger exclusions). **Use that ONE consolidated warm audience as a single L3 ad set, and differentiate L3 by CONCEPT/ANGLE via multiple creatives within it — do NOT fragment the small warm pool into per-sub-segment ad sets** (sub-segmenting a small warm audience makes each ad set learning-limited and overlapping warm segments self-compete in the auction, inflating frequency). Add a second L3 ad set ONLY if `ad/campaign-l3` defines a genuinely distinct, sizeable warm audience that won't overlap. The L3 ad set's `creative_count` = the number of distinct angles to run against that audience (safety-EU lead + the other warm angles the tactics call for). For each L3 ad set:
- `slot_name`: the L3 ad-set name, **no layer prefix** (e.g. `"Tái chuyển đổi (warm hợp nhất)"`).
- `value`: a value dimension if one clearly applies (e.g. a reassurance/urgency value); otherwise leave null. Leave `primary_persona`/`frame`/`tonal_register` null unless one applies.
- **`build_spec`** (realize from `ad/campaign-l3` + `ad/campaign-architecture` L3 row):
  - `campaign`: `"Lớp 3 — Tái chuyển đổi"`.
  - `objective`: `"Messages"` hoặc `"Purchase"` (A/B per KB).
  - `audience`: warm/hot retarget — engagers, video viewers, page/site visitors; safety-EU leads per KB.
  - `optimizationGoal`: `"Conversations"` / `"Purchase"` per KB.
  - `budgetMode`: `"Daily budget"`.
  - `budgetShare`: the L3 share (the money tier — bias the split here when the warm pool is large enough).
  - `frequencyCap`: `"n/a"` (conversion tier).
  - `placements`: per KB.
  - `kpi`: `"cost-per-purchase"`.
- **`creative_count`**: the Andromeda creative floor for a conversion ad set per `ad/creative-guidelines` (read it from the KB; do not hard-code the number).

#### D. YouTube campaign

Derive the YouTube ad set(s) — e.g. a **Shorts** ad set and an **In-stream** ad set, grounded in the Approaches' YouTube approach. For each:
- `slot_name`: the ad-set name, **no layer prefix** (e.g. `"Shorts"`, `"In-stream"`).
- `value`: a value/theme direction if one applies; persona/frame/register may be null.
- **`build_spec`** (realize from `ad/campaign-tracking` §YouTube + `ad/strategy` §3):
  - `campaign`: `"YouTube"`.
  - `objective`: awareness/views (the YouTube objective per KB).
  - `audience`: the YouTube targeting summary (awareness support for L2; CTA to Fanpage per KB).
  - `optimizationGoal`: views/ThruPlay per KB.
  - `budgetMode`: per KB.
  - `budgetShare`: the YouTube share of total (≈ the Meta-vs-YouTube split's YouTube side).
  - `frequencyCap`: per KB (or `"n/a"`).
  - `placements`: Shorts / In-stream as applicable.
  - `kpi`: `"CPV"`.
- **`creative_count`**: the YouTube count (shorts / in-stream) per the guidelines.

**Vocabulary rule:** Check `rules/banned-words` for every Vietnamese word in slot names and build-spec strings. Every banned term is PROHIBITED. For example: `"nhịp"` (ALL compounds: giữ nhịp, đứt nhịp, lệch nhịp, bắt nhịp) → use `"chế độ"`, `"lịch"`, `"kế hoạch"`, or `"thói quen"` instead.

#### E. Per-ad-set budget shares

Budget lives **only** in each ad set's `build_spec.budgetShare` — there is no separate Meta-vs-YouTube split and no layer-% roll-up artifact. Size each ad set's `budgetShare` tier-correctly, grounded in the `ad/strategy` §3 defaults:

- **L1** (cost-per-purchase, funnel intake) — ~1.8–2× warm by design; keep funded so it feeds the funnel.
- **L3** (cost-per-purchase, the money tier) — protect/scale when the warm pool is large enough (the standing Q3 guidance).
- **L2** (reach/CPM/frequency, omnipresence ~2–3 impressions/person/day across all L2 ad sets) — never sized or cut on cost-per-purchase; the L2 budget is divided across the CORE + TEST ad sets, with each TEST ad set on a budget **cap** and CORE person-led ad sets (the proven < 10k CPM reach engine) carrying the bulk.
- **YouTube** (CPV, awareness support) — sized to the YouTube share per the §3 defaults.

If `plan.retrospective` carries tier grades, honour them tier-correctly when setting shares (scale L3 winners; keep L1 at intake; never down-weight L2 on cost-per-purchase). Each `budgetShare` is a level/% (a share of its layer or an ABO daily level), **never a flight schedule**.

**SELF-CHECK before writing Step 4 (fix before saving) — the blueprint check:**

1. **Slot-name consistency + no layer prefix:** Every `slot_name` is byte-for-byte identical wherever it appears (the ad-set row, any build_spec note referencing it, and the output table), and carries **NO layer prefix** (`"Lớp N —"` / `"L1/L2/L3 —"` / `"YouTube —"` are forbidden — strip them). The build_spec `campaign` is the SEPARATE per-layer campaign name (e.g. `"Lớp 1 — Chuyển đổi"`) — that's the campaign, not the slot_name. Do not paraphrase or rename a slot between sections.
2. **Value coverage:** Count distinct value codes used across ALL ad sets (L1 steering values + the L2 CORE/TEST values on each L2 row + any L3/YouTube value). At least 5 of 8 values from `brand/angles §1.1` must appear. If fewer, reassign an underrepresented value to a slot where it fits.
3. **not-suffering check:** Verify `not-suffering` (the convenience / "không phải ăn kiêng khổ sở" angle) appears at least once across all ad sets — a person-led CORE or a concept TEST L2 ad set is a natural home. If missing, ASSIGN it now. Do NOT defer.
4. **Archetype balance:** List the primary archetype per L1 slot. If a persona with a higher allocation priority (per `ad/strategy §2.2`) is completely absent from L1 while a lower-priority persona appears on multiple slots, reassign one slot.
5. **Against coverage:** Count L1 slots with an against intent. At least 2 should have one.
6. **Tonal-register validity:** Every L1 register must be one of `confessor`, `educator`, `friend`. No other values. (L2/L3/YouTube leave register null.)
7. **L2 omnipresence model (v3.0) correctness:** L2 is the v3.0 omnipresence set — the **ad-set range + CORE/TEST ratio per `ad/campaign-architecture` v3.0** (read from the KB, not restated here), with the CORE and TEST counts **derived from the month's `tactics`/`context`** (NOT hard-coded), **each L2 ad set carrying the KB-derived L2 count (v3.0: 1)**, each Awareness / Reach / ABO / warm ≤50k / manual placements, freq-cap = (total L2 ad sets ÷ cap-days). CORE rows lean a person-led social-proof / lived-proof value; TEST rows sit on the generic L2 leaf with the test concept's value + a `build_spec.note` flagging "test: budget cap + win gate (beat person-led <10k CPM)". The retired v2.0 "4 fixed pillar ad sets" (`L2_Empathy`/`L2_Science`/`L2_Solution`/`L2_SocialProof`) must NOT appear.
8. **Tier-KPI correctness (mandatory):** Every `build_spec.kpi` is tier-correct — L1 = cost-per-purchase, L3 = cost-per-purchase, L2 = reach/CPM/frequency (NEVER cost-per-purchase), YouTube = CPV. Scan every ad set; fix any mismatch before saving.
9. **No flight dates:** No `build_spec` (or `peak_window`, or any note) carries an ad-set start/stop/launch/pause date. Ad sets run continuously.
10. **Creative-count arithmetic:** Write scratch addition summing each ad set's `creative_count`: "L1: sum across the L1 ad sets = X. L2: (KB-derived L2 count, v3.0: 1) × (# L2 ad sets) = Y. L3: sum across the L3 ad sets = H. YouTube: sum = Z. Total = X+Y+H+Z." Confirm each conversion ad set (L1/L3) clears the `ad/creative-guidelines` Andromeda floor, every L2 ad set carries the KB-derived L2 count (v3.0: 1), and the total is what you intend. Fix any shortfall before saving.
11. **Budget-share tier-correctness:** The per-ad-set `build_spec.budgetShare` values are sized tier-correctly (L1 funnel-intake ~1.8–2× warm; L3 the money tier; L2 divided across the CORE+TEST ad sets with each TEST on a budget cap and CORE person-led carrying the bulk, never sized on cost-per-purchase; YouTube per §3). Each is a level/% — not a flight date.
12. **Scoring:** Scored every ad set 1–5 with a Vietnamese `comment`; used the full range (not all 5s). Every `score` is an integer 1–5 and every `comment` is in Vietnamese.
13. **Banned-words scan:** Re-read every Vietnamese word in slot names, build-spec strings, and score comments. If any banned term from `rules/banned-words` appears, replace it before proceeding.
14. **Quality floor — no ad set scored ≤3 (symmetric with Ideate's quality loop):** Re-read your scores. For every ad set scored **3 or below**, do NOT save it as-is — **strengthen it into an honest ≥4**: rework its audience / value / angle / concept (for an L1 theme or an L2 TEST, swap to a stronger theme/test the month's `tactics`/`context` support; for L3/YouTube, sharpen the audience or angle) and re-score honestly. If an ad set genuinely cannot reach ≥4 **and** is not required for tier/audience coverage, drop it and redistribute its `budgetShare` — but NEVER drop coverage a tier's tactics/KB call for. Iterate until every ad set you write scores **≥4**. Rate honestly — never inflate a weak ad set to 4 just to exit the loop; the goal is genuinely stronger ad sets.

### Step 4: Write the rated ad-set set via `save_ad_plan_slots`

The entire Blueprint is **one write**: the complete rated ad-set set via `save_ad_plan_slots`. There is no separate budget-split or layer-% write.

Every ad set from Step 3 (L1 slots + the L2 omnipresence ad sets + L3 + YouTube) becomes one `ad_plan_slots` row carrying `score` + `comment` + `creative_count` + `build_spec`. Send the **COMPLETE set in ONE call** — `save_ad_plan_slots` upserts the `ad_plan_slots` set by `slot_name` (per plan): already-**approved** ad sets are LOCKED and preserved untouched (ids stay stable, so curated concepts stay linked), proposed ad sets are updated in place or inserted, and any proposed ad set you omit is deleted. A re-run therefore never wipes an operator's ad-set approvals — but the single call must still hold every ad set you intend across all four layers (use stable, unique `slot_name`s so the upsert matches; omitting a proposed ad set removes it).

**Resolve all taxonomy codes → ids (do this before writing).** Call `list_taxonomies` (with no `kind` to get all kinds in one call, or per-kind: `persona`, `value`, `frame`, `tonal_register`, `layer`/`campaign_layer`). Build a `code → id` map from the returned rows (each row carries `code` and its `taxonomies.id`). Map each row's `layer`, and each L1 row's `primary_persona`/`value`/`frame`/`tonal_register`, and each L2 row's fixed `value`, to its leaf taxonomy `id`. **NEVER pass a code, and NEVER invent an id** — a wrong `term_id` fails the FK or mis-attaches the ad set to the wrong layer.

Each entry passes:
- **Every layer:** `layer_term_id` (the resolved campaign_layer id for L1/L2/L3/YouTube), `slot_name` (the ad-set name), `score` (integer 1–5), `comment` (one-line Vietnamese rationale), `creative_count` (integer), `build_spec` (the 9-key object). **Do NOT set `status`** — it defaults to `'proposed'`.
- **L1 entries additionally:** `primary_persona_term_id`, `value_term_id`, `frame_term_id`, `tonal_register_term_id`, `peak_window`, `format_pref`.
- **L2 entries:** `value_term_id` (CORE = a person-led social-proof/lived-proof value id; TEST = the test concept's value id) and `creative_count` = the KB-derived L2 count (v3.0: 1); leave persona/frame/register null. TEST rows carry a `build_spec.note` flagging the budget cap + win gate.
- **L3 / YouTube entries:** may leave `primary_persona_term_id`/`frame_term_id`/`tonal_register_term_id` null (set `value_term_id` only if a value clearly applies).

```
Call: save_ad_plan_slots
  plan_id: <plan.id from Step 1>
  slots: [
    // ----- L1 theme slots (one per slot) -----
    {
      layer_term_id:            "<L1 campaign_layer leaf id>",
      slot_name:                "<exact L1 ad-set name>",
      primary_persona_term_id:  "<persona leaf id>",
      value_term_id:            "<value leaf id>",
      frame_term_id:            "<frame leaf id>",
      tonal_register_term_id:   "<tonal-register leaf id>",
      peak_window:              "<e.g. đỉnh điểm tuần 1-2>",
      format_pref:              "<video/carousel>",
      score:                    <1-5>,
      comment:                  "<một câu lý do bằng tiếng Việt>",
      creative_count:           <the ad/creative-guidelines Andromeda floor for a conversion ad set>,
      build_spec: {
        campaign: "Lớp 1 — Chuyển đổi", objective: "Messages | Purchase",
        audience: "<cold/broad summary, VN>", optimizationGoal: "Conversations | Purchase",
        budgetMode: "Daily budget", budgetShare: "<% of L1 budget>",
        frequencyCap: "n/a", placements: "<per KB, VN>", kpi: "cost-per-purchase"
      }
    },
    // ----- L2 omnipresence (v3.0): CORE/TEST counts derived from tactics × the KB range+ratio, each creative_count = KB-derived L2 count (v3.0: 1) -----
    {
      // CORE — person-led (the < 10k CPM reach engine)
      layer_term_id: "<L2 campaign_layer leaf id>", slot_name: "Kiều My (chân dung)",
      value_term_id: "<lived-proof / social-proof value leaf id>",
      score: <1-5>, comment: "<một câu lý do bằng tiếng Việt>",
      creative_count: <KB-derived L2 count, v3.0: 1>,
      build_spec: {
        campaign: "Lớp 2 — Awareness (Omnipresence)", objective: "Awareness",
        audience: "<warm — L1 non-converters / engagement audiences, ≤50k, VN>", optimizationGoal: "Reach",
        budgetMode: "ABO", budgetShare: "<L2 share, level>",
        frequencyCap: "~1 lần/3 ngày mỗi ad set (tổng ~2–3 lần/người/ngày)",
        placements: "<manual placements; ưu tiên Feed/Reels, VN>", kpi: "reach/CPM/frequency"
      }
    },
    {
      // TEST — concept experiment derived from the month's tactics (generic L2 leaf, budget cap + win gate)
      layer_term_id: "<L2 campaign_layer leaf id>", slot_name: "Test: <khái niệm theo tactics>",
      value_term_id: "<the test concept's own value leaf id>",
      score: <1-5>, comment: "<một câu lý do bằng tiếng Việt>",
      creative_count: <KB-derived L2 count, v3.0: 1>,
      build_spec: {
        campaign: "Lớp 2 — Awareness (Omnipresence)", objective: "Awareness",
        audience: "<warm, ≤50k, VN>", optimizationGoal: "Reach",
        budgetMode: "ABO", budgetShare: "<capped test level>",
        frequencyCap: "~1 lần/3 ngày mỗi ad set (tổng ~2–3 lần/người/ngày)",
        placements: "<manual placements, VN>", kpi: "reach/CPM/frequency",
        note: "test: budget cap + win gate (vượt benchmark person-led <10k CPM thì promote lên CORE, không thì kill + rotate)"
      }
    },
    // ... more CORE person-led rows (Bác Đỗ Dung, Thắm, variants) + more TEST rows as the month's tactics call for,
    // ... to the L2 omnipresence total (CORE/TEST per KB range+ratio, tactics-driven); freq cap = (total L2 ad sets ÷ cap-days) ...
    // ----- L3 warm/retarget -----
    {
      layer_term_id: "<L3 campaign_layer leaf id>", slot_name: "Tái chuyển đổi (warm hợp nhất)",
      score: <1-5>, comment: "<một câu lý do bằng tiếng Việt>",
      creative_count: <the ad/creative-guidelines Andromeda floor for a conversion ad set>,
      build_spec: {
        campaign: "Lớp 3 — Tái chuyển đổi", objective: "Messages | Purchase",
        audience: "<warm/hot retarget — engagers/viewers/visitors, VN>", optimizationGoal: "Conversations | Purchase",
        budgetMode: "Daily budget", budgetShare: "<% of L3 budget>",
        frequencyCap: "n/a", placements: "<per KB, VN>", kpi: "cost-per-purchase"
      }
    },
    // ----- YouTube -----
    {
      layer_term_id: "<YouTube campaign_layer leaf id>", slot_name: "Shorts",
      score: <1-5>, comment: "<một câu lý do bằng tiếng Việt>",
      creative_count: <n>,
      build_spec: {
        campaign: "YouTube", objective: "<awareness/views per KB>",
        audience: "<YouTube targeting summary, VN>", optimizationGoal: "<views/ThruPlay>",
        budgetMode: "<per KB>", budgetShare: "<YouTube share>",
        frequencyCap: "<per KB or n/a>", placements: "Shorts", kpi: "CPV"
      }
    }
    // ... YouTube — In-stream, same shape ...
  ]
```

`save_ad_plan_slots` writes propose-state only — each row's `status` defaults to `'proposed'` and it never flips a gate. The operator approves ad sets individually in the dashboard. Ideate ties each concept to its ad set via `save_idea(channel='ad', plan_id, slot_id)`, where `slot_id` is the id of one of these rows — for **every** layer, not just L1.

> **Note — `save_ad_plan_slots` now accepts `score` + `comment` + `creative_count` + `build_spec`.** The backend has been extended (additive); each row stores all four, and `status` defaults to `'proposed'`. There is **no separate `creativeCountConfig`** — the per-slot `creative_count` is the single source of count truth. There is **no separate budget-split or layer-% artifact** — per-ad-set budget lives in `build_spec.budgetShare`.

### Step 5: Output the build-map table and stop

After saving, output the campaign → ad-set build map (group ad sets by campaign), then the blueprint check, then stop:

```
## Ads Blueprint — <period>

**Status:** Proposed (pending human review)

**Steering:** loaded — the blueprint realizes the approved Approaches + Focus; per-ad-set build specs come from ad/campaign-architecture + ad/strategy

### Lớp 1 — Chuyển đổi · KPI cost-per-purchase
| Ad set | Score | Persona | Value | Against | Frame | Register | Audience | Budget | Freq cap | Placements | Creatives |
|--------|-------|---------|-------|---------|-------|----------|----------|--------|----------|------------|-----------|
| <slot> | <1-5> | <persona> | <value> | <against> | <frame> | <register> | <audience> | <share> | n/a | <placements> | <n> |

### Lớp 2 — Awareness (Omnipresence) · KPI reach/CPM/frequency · omnipresence set (CORE/TEST per KB, tactics-driven) · mỗi ad set 1 creative
| Ad set | Type | Score | Value | Audience | Budget | Freq cap | Placements | Creatives |
|--------|------|-------|-------|----------|--------|----------|------------|-----------|
| Kiều My (chân dung) | CORE | <1-5> | lived-proof | <warm ≤50k> | <share> | <total ÷ cap-days> | <manual> | 1 |
| Bác Đỗ Dung | CORE | <1-5> | social-proof | <warm ≤50k> | <share> | <total ÷ cap-days> | <manual> | 1 |
| Test: <khái niệm> | TEST | <1-5> | <test value> | <warm ≤50k> | <capped> | <total ÷ cap-days> | <manual> | 1 |
| … | … | … | … | … | … | … | … | 1 |

### Lớp 3 — Tái chuyển đổi · KPI cost-per-purchase
| Ad set | Score | Audience | Budget | Freq cap | Placements | Creatives |
|--------|-------|----------|--------|----------|------------|-----------|
| <slot> | <1-5> | <retarget> | <share> | n/a | <placements> | <n> |

### YouTube · KPI CPV
| Ad set | Score | Audience | Budget | Placements | Creatives |
|--------|-------|----------|--------|------------|-----------|
| YouTube — Shorts | <1-5> | <audience> | <share> | Shorts | <n> |
| YouTube — In-stream | <1-5> | <audience> | <share> | In-stream | <n> |

**Total creatives:** <Z> across <N> ad sets in 4 campaigns

### Blueprint Check
| Constraint | Status |
|------------|--------|
| Slot names consistent everywhere | PASS/FAIL |
| ≥5 of 8 values covered; not-suffering present | PASS/FAIL |
| L1 archetype balance + ≥2 against intents | PASS/FAIL |
| L2 = v3.0 omnipresence per `ad/campaign-architecture` (ad-set range + CORE/TEST ratio from KB, counts tactics-driven, each creative_count 1, Awareness/Reach/ABO/warm ≤50k/manual/freq-cap by total) | PASS/FAIL |
| KPI tier-correct (L1/L3 CPP; L2 reach/CPM; YT CPV) | PASS/FAIL |
| Each conversion ad set clears the `ad/creative-guidelines` Andromeda floor | PASS/FAIL |
| Budget shares tier-correct (per-ad-set build_spec.budgetShare) | PASS/FAIL |
| Every ad set scored 1–5 + Vietnamese comment; full range used | PASS/FAIL |
| No flight dates anywhere | PASS/FAIL |
| Vietnamese prose + banned-words clean | PASS/FAIL |

---
Blueprint saved: the complete rated ad-set set with per-ad-set score + comment + creative_count + build_spec (`ad_plan_slots`); per-ad-set budget lives in each row's build_spec.budgetShare. The ad sets are proposed — review and approve the ad sets you want in the dashboard; approving ≥1 opens Ideate.
```

Stop after this output.

## Output

- `ad_plan_slots` set to the **complete rated ad-set set across all four layers** (one row per ad set), each carrying `score` (1–5) + `comment` (Vietnamese) + `creative_count` + `build_spec` (incl. per-ad-set `budgetShare`); L1 rows additionally carrying persona/value/frame/tonal-register/peak-window/format. Each row's `status` defaults to `'proposed'`.
- No separate Meta-vs-YouTube split and no layer-% roll-up — per-ad-set budget lives only in `build_spec.budgetShare`
- `context` left untouched (owned by the approved Approaches)
- No ad set approved; no gate flipped

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Writes only via `save_ad_plan_slots` (never `create_*` — `create_campaign`/`create_adset`/`create_ad` — `publish_*`, `update_budget`, `pause_*`/`resume_*`/`duplicate_ad`, `save_ad_schedule_weeks`, `save_idea`, or any content-creation/scheduling tool). Writes **rated proposed ad sets, never approves any ad set, and never flips a gate** — this step plans the deployment; it does not deploy and does not schedule.
- **Rates every ad set.** Each ad set carries an honest `score` (1–5) + a one-line Vietnamese `comment`, exactly as `ssc-ads-ideate` scores concepts — full range, no inflation. Symmetric with Ideate: each ad set is a rated card the operator approves individually.
- **Never approves an ad set; never sets `status`.** Each row's `status` defaults to `'proposed'`. The operator approves ad sets one by one in the dashboard; approving ≥1 ad set opens Ideate. There is no plan-level `approved` gate for the ad flow — approval is per-ad-set.
- Always gate-check `approaches_approved` first (Step 1). If the Approaches are not approved, STOP — do not load the KB, derive ad sets, or write anything.
- **No ad-set flight dates.** A `build_spec` specifies how each ad set is built (objective/audience/budget/cap/placements), never when it starts or stops. Ad sets run continuously. The L1 `peak_window` is a creative-rotation window, not an ad-set flight schedule.
- **Does NOT write `context`** — the approved Approaches own it. Blueprint writes only the rated ad-set set (`ad_plan_slots`).
- **No separate budget-split or layer-% artifact.** Per-ad-set budget lives only in each row's `build_spec.budgetShare`; the Blueprint does NOT write a Meta-vs-YouTube split (`detail.budgetMetaVsYoutube`) or a layer-% roll-up (`plan_targets`). It also does NOT write `detail.creativeCountConfig` — the per-slot `creative_count` is the single source of count truth.
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. All output goes to the ad `channel_plan`'s `ad_plan_slots` rows.
- **Tier-KPI correctness is mandatory:** L1 (cold) & L3 (warm) judged on cost-per-purchase; L2 omnipresence on reach/CPM/frequency (never cost-per-purchase); YouTube on CPV. Honour any tier grades in the prior `retrospective` when sizing per-ad-set `budgetShare`.
- **Architecture from KB.** All objective / audience / optimization-goal / budget-mode / frequency-cap / placement / KPI values, the **v3.0 L2 omnipresence model** (ad-set range + CORE/TEST ratio per the KB, the CORE/TEST counts read from the month's tactics, each ad set 1 creative — NOT the retired v2.0 four-fixed-pillar set), and the creative-count floors come from `ad/campaign-architecture` + `ad/strategy` + `ad/creative-guidelines` (Step 2) — those are the source of truth; inline guidance is informational and the KB wins on conflict. Reference only the 11 knowledge paths listed in Step 2; do not call `get_knowledge` for any other path.
- **Resolve every taxonomy code → id** via `list_taxonomies` before writing (persona/value/frame/tonal_register/campaign_layer). NEVER pass a code; NEVER invent an id.
- Tonal registers (L1 only) must be exactly `confessor`, `educator`, or `friend` — no other values.
- Slot names must be byte-for-byte identical wherever they appear (ad-set row, build_spec, output table) — the slot-name-consistency rule (self-check #1).
- All persisted prose (slot names, build-spec strings, score `comment`s, notes) is **Vietnamese**; only your chat-side reasoning stays English.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` plan state.
- Requires `edit` capability (plus `view` for the reads).
