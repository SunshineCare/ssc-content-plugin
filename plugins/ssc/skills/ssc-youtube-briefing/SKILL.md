---
name: ssc-youtube-briefing
description: Derives the YouTube briefing for a Cambridge Diet Vietnam monthly YouTube cycle — turns the approved month context + tactics on the youtube channel_plan into concrete YouTube parameters (long-form/Shorts cadence, video counts by buyer stage and series, themes mapped to videos). Writes the cadence onto the plan detail via save_channel_plan and the distribution via save_plan_targets. Reads the compliance rails live — rules/compliance, brand/proof-points, rules/food-placeholder, rules/person-rule — at the step where the briefing fixes scope, so a non-compliant premise is refused before any idea is generated against it; a failed knowledge read stops the run and names the document. Gated on the approved Focus (tactics_approved). Propose-only; the operator approves the briefing (the plan gate) in the content workspace.
metadata:
  type: skill
  stage: youtube-pipeline
  brand: cambridge-diet-vn
  section: youtube
  capability: edit
  tools: [get_knowledge, get_channel_plan, save_channel_plan, save_plan_targets, list_taxonomies]
---

# Monthly YouTube Briefing (`ssc-youtube-briefing`)

You derive concrete YouTube video parameters from the approved month context + tactics on the youtube `channel_plan` and write them onto that plan. You write only via `save_channel_plan` (the youtube cadence detail) and `save_plan_targets` (the buyer-stage and series distribution), and stop immediately after. You are propose-only: the operator reviews the briefing in the content workspace (`/content/youtube`) and approves it there — approving flips the plan's `approved` gate (via `approve(entity='channel_plan', gate='plan')`, a dashboard-only action), which opens Ideate.

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

### Step 2: Load YouTube knowledge and the compliance rails

Call `get_knowledge` for each of these seven verified paths.

**Channel and audience:**

- `channels/youtube` — the YouTube channel strategy: content series, cadence rules, format catalogue, buyer-stage mapping, SEO priorities, and tone
- `brand/personas` — the core audience archetypes and their value priorities (the archetype names and definitions live in this document — do not assume them)
- `brand/journey-stages` — the emotional journey stages and their content implications

**The compliance rails** — the same four the ads family reads, loaded *here* because this is the step where the briefing **fixes scope**. A premise that has no compliant execution must be refused before Ideate generates videos against it (Step 3 E):

- `rules/compliance` — the advertising rules that decide whether a premise may run at all: the NĐ 15/2018 refusals with the stated basis of each, the mandatory footer, the Meta policy limits, the chosen risk stance, and the doc's own pre-publish checklist (*Checklist trước khi xuất bản*). Several of this doc's headings carry parentheticals, so it is cited path-only and its sections are named here in prose — read the live doc for every verdict.
- `brand/proof-points` — the live proof families and the proof-point table. Whether the proof a premise leans on exists in a permitted family is decided by this doc, never by the briefing.
- `rules/food-placeholder` § Quy Tắc Chung — what may appear on screen as food, drink and vessel; the doc's Cambridge product-catalogue section names the products themselves.
- `rules/person-rule` §4 — the four permitted opening frames, with §2 its three-question test. The rule is grammatical, so `rules/banned-words` structurally cannot express it and never covers it.

Read all seven documents carefully. Use them to assign video counts per buyer stage, to select series appropriate to each stage and persona, and to screen every premise (Step 3 E). These documents are the source of truth for cadence, series, personas **and compliance** — never substitute remembered values, and never restate a rule from any of them in this file or in the briefing output.

**Failed read = STOP.** `get_knowledge` reports an absent path in `missing` rather than failing, so check `missing` on the call. If **any** of the seven paths comes back missing, STOP the run immediately, save nothing, and tell the operator **which document could not be read**:

> Could not read `<path>` from the knowledge base. The briefing is derived from it, so the run stops here — re-run once the document is readable.

There is no fallback and no default. Never brief from prose in this skill, from memory, from a similar-looking document, or from a cached copy: this file deliberately holds no copy of any cadence, persona or compliance rule, so a remembered version is a guess — and a premise written into `plan_targets` is indistinguishable from a compliant one once Ideate reads it back and produces against it.

### Step 3: Derive YouTube parameters

Using `plan.context` + `plan.tactics` from Step 1 and the knowledge from Step 2, derive the following. Every doc named below is one Step 2 already loaded — **if any of them could not be read, the run has already STOPPED in Step 2**, so nothing here is ever derived from a remembered document.

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

**E. Compliance screen — a non-compliant premise is refused HERE, before any idea exists**

Screen every premise this briefing is about to fix — each theme mapping from D, and each series/stage slot that mapping implies — against the four rails loaded in Step 2, **read live**. Ask each rail its own question; the answer is always the live doc's, never this file's:

- **Proof** — does the proof the premise leans on exist in a permitted family, per `brand/proof-points`? A premise whose whole point is a proof device the doc does not carry has no compliant execution, however it is filmed.
- **Claim and stance** — does the premise survive `rules/compliance` (its NĐ 15/2018 basis, the Meta policy limits, the chosen risk stance, and the doc's pre-publish checklist)? Take the verdict from the doc; do not reason it out from anything written here.
- **What is shown** — does the premise require food, drink, vessel or product on screen in a way `rules/food-placeholder` § Quy Tắc Chung does not permit?
- **Who speaks and how it opens** — does the premise's framing force an opening or an on-screen identity outside `rules/person-rule` §4's permitted frames? This one is grammatical, so no word scan reaches it.

**A premise that fails any rail is REFUSED, not softened.** Drop it from the theme→video mapping, create no series or stage slot for it, and name it in the Step 5 output together with **the document (and section) that refused it** — never a bare "non-compliant". If refusing leaves a series or stage short of the month's derived count, re-derive B and C across the remaining compliant themes rather than holding the slot open for the refused premise.

**Why the screen sits here and not at Ideate.** `ssc-youtube-ideate` screens each idea it generates; this step screens the premise those ideas would be generated *against*. Refusing here costs one row in a table. The same refusal downstream costs every idea, script, shot and edit derived from the premise — and it may not come at all, because the sanction this channel cannot survive is suspension of the product's công bố, with the promoter personally liable under the amended Advertising Law in force 2026-01-01. A banned-word scan plus "no pushy sales language" is not this channel's compliance surface: it operates on wording and structurally cannot reach a premise.

**The rails are read, never restated.** Every question above names a doc and a section and is answered from the live document. This file holds the question and never the answer — a second copy of a compliance rule is drift this repo has already been burned by, and a briefing that passed a *remembered* rule is worse than a run that stopped, because it looks approved.

### Step 4: Write the briefing onto the plan (only the fields you own)

The per-channel save tools have patch semantics — `save_channel_plan` updates only the fields you pass (unset fields are preserved), so send ONLY what this skill owns. Do NOT re-send `context`, `tactics`, `status`, or any field another step wrote.

**Only compliant premises are written.** A premise refused in Step 3 E must not appear in `detail`, in any `plan_targets` row, or in any row's `meta.themes` — the refusal is reported to the operator (Step 5) and nowhere else. Writing it and flagging it in prose is not a refusal: Ideate reads the targets, not the chat.

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

### Refused Premises (compliance screen, Step 3 E)
| Premise / Theme | Refused by (document + section) | What it would have needed |
|-----------------|----------------------------------|---------------------------|

Always print this section. An empty table means nothing was refused this month; omitting it is
indistinguishable from not having screened.

---
Briefing written to the youtube channel_plan (propose-state): detail {longFormPerWeek, shortsPerWeek} + plan_targets (buyer_stage + youtube_series distribution).

Next step: review the briefing in the content workspace (/content/youtube) and approve it (flips the plan's `approved` gate), then re-invoke the agent to begin Ideate.
```

## Output

- `detail.longFormPerWeek` / `detail.shortsPerWeek` written to the youtube `channel_plan`
- `plan_targets` written as a SET: one row per `buyer_stage` term and per `youtube_series` term with `target_value` counts (+ theme/persona `meta` on series rows)
- No gate flipped — the briefing is a proposal awaiting the operator's plan-gate approval

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Always gate-check `tactics_approved` first (Step 1). If the Focus is not approved, STOP — do not load the KB or write anything.
- Write only the fields you own: `detail` via `save_channel_plan` and the `plan_targets` set. Never pass `context`, `tactics`, `status`, or `retrospective` — the save tools patch only provided fields, so omitting them preserves other steps' writes.
- Derive counts and cadence from `channels/youtube` + the month's tactics/context — never from remembered defaults. Persona archetypes come from `brand/personas` — do not inline persona names.
- **Compliance is a briefing-time gate, not a word scan.** A premise that fails `rules/compliance`, `brand/proof-points`, `rules/food-placeholder` § Quy Tắc Chung or `rules/person-rule` §4 is refused in Step 3 E and never reaches `detail` or `plan_targets`. The verdict is always the live document's: name the doc and section, read it live, and never restate, summarise or hard-code a compliance rule in this file — a second copy goes stale silently and overrides the doc it was meant to mirror.
- **A failed KB read STOPS the run** (Step 2): it names the document that could not be read, saves nothing, and never proceeds from prose in this file, from memory, from a similar document or from a cached copy. Every later step leans on the Step 2 load, so there is no second place to fall back from — by design.
- References only the seven knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- Series and buyer-stage vocabularies are the `youtube_series` and `buyer_stage` taxonomies (via `list_taxonomies`) — never invent codes or ids.
- Operates only on the youtube channel (`channel='youtube'`); never reads or writes `post`/`ad` state.
- Requires `edit` capability (plus `view` for the reads).
