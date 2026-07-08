---
name: ssc-ads-approaches
description: Runs the Approaches step of the standalone Cambridge Diet Vietnam Ads pipeline — the creative HOW. Gated on the approved Focus (tactics_approved). Reads the approved tactics (the bets), does a light WebSearch month pass plus KB synthesis, then writes the Approaches md to context via save_channel_plan — a structured Vietnamese template (Month signals · Layer approaches L1/L2/L3/YouTube · Audience & triggers · Differentiation · Experiments to test) that turns the bets into concrete creative approaches. Must NOT restate the Focus bets. Propose-only; ends at the Approaches gate; never sets approaches_approved.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, search_knowledge, WebSearch, get_channel_plan, save_channel_plan]
---

# Ads Approaches (`ssc-ads-approaches`)

You run the **Approaches** step of the standalone Cambridge Diet Vietnam Ads pipeline — the creative **HOW**. You read the approved Focus (the *bets* — which pillars/angles/themes to push in paid), run a **light** month research pass, and synthesise the **creative approaches** that realize those bets: how each ad layer (L1/L2/L3/YouTube) should attack the month, who to hit and on what trigger, how to be different from competitors, and what to experiment with. The output is a markdown brief (the Approaches doc) written to `context`. You are propose-only: you write `context` via `save_channel_plan`, then stop. A human reviews and approves the Approaches in the dashboard before the Blueprint step begins. You NEVER call any `approve_*`, publish, or scheduling tool, and you NEVER set `approaches_approved`.

**You add the creative "how" — you do NOT restate the Focus bets.** The Focus already names the priority pillars, angles to push, and tactical themes. The Approaches doc *assumes* those bets and supplies the creative realization of them. Do not re-list the pillar bets or re-justify the angle selection — that is the Focus's job and re-doing it makes the UI a fragmented duplicate. Reference the bets only enough to anchor an approach, never to re-argue them.

This is step 2 of the five-step Ads pipeline (**Focus → Approaches → Blueprint → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the ad plan is self-contained.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the Focus

Call:

```
Call: get_channel_plan
  channel: ad
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.tactics_approved` is not `true`, STOP immediately and tell the operator:

> The Focus (tactics) has not been approved yet. Please review and approve the Focus in the dashboard before running Approaches.

Do not proceed past this gate under any circumstances.

If `plan.tactics_approved` is `true`, extract and hold:

- `plan.tactics` — the approved tactical plan (markdown). These are the **bets** — the primary steering. You realize them; you do not repeat them.
- `plan.id` — the plan id, for reference (no targeted/slot writes happen here — those are the Blueprint step's).

### Step 2: Load ad and brand knowledge

Call `get_knowledge` for each of these verified paths:

- `ad/strategy` — the three-layer ad architecture (what L1/L2/L3/YouTube each do)
- `ad/campaign-architecture` — L1/L2/L3 campaign structure, ad set roles, audience definitions
- `ad/awareness-framework` — Market Awareness × Sophistication + Emotion Audit + angle-type lens; shape each layer's approach by the audience's awareness stage
- `brand/angles` — value dimensions (§1.1), entry dimensions (§1.2), against dimensions (§1.3), experience dimensions (§1.4), frame codes (§3) and Frame × Layer table
- `brand/personas` — the audience archetypes and their pain points, motivations, and entry dimensions. The archetype names, the count, and their priority tiers all live in this document — never assume a fixed count or a fixed name list; re-read it every run.
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points with content guidance, objections, real vocabulary, myths to debunk, and tone guidance. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list, so a persona added later needs no procedural change here. This is a BATCH skill (one run selects 2–3 personas to feature out of however many are currently listed), so load every currently-listed persona's detail doc upfront — not just the ones you end up featuring — so the "Audience & triggers" section can name each featured persona's actual seasonal trigger instead of a generic one.
- `content/pillars` — the content pillar strategy and pillar names
- `rules/banned-words` — hard-banned Vietnamese words/compounds — verify every Vietnamese string you write

Read these carefully. They are the authoritative source for *how* to attack each layer and *which* persona triggers to ride. Use the KB to translate the approved bets into concrete creative approaches — it supplies the ad architecture, persona framing, and angle vocabulary; the strategic direction is already fixed by the approved `tactics`.

### Step 3: Light month research

Run a **light** `WebSearch` pass — a few targeted queries only. This is NOT the depth of the strategic review; it is a quick calendar + signals scan to ground the approaches in the actual month for paid.

Search for:

1. **Vietnamese cultural calendar** — public holidays, observances, and significant dates in `period` (e.g. Tết Dương lịch, Women's Day, Vietnamese National Day, seasonal events) that warrant a creative surge.
2. **Seasonal weight-loss / health triggers** — common Vietnamese health behaviours, motivation patterns, or physical conditions associated with this time of year (e.g. post-Tết resets, pre-summer prep, rainy-season inactivity) that paid angles can ride.
3. **Competitor / platform signals** — a brief scan of what Cambridge Diet Vietnam competitors or health/nutrition brands are running on Facebook/Meta this month; any notable platform/ad feature or policy shift worth noting.

Keep this to 3–5 queries total. Orient the queries toward evidence that helps *realize* the approved bets (e.g. if a bet targets a specific persona trigger, search for that trigger's seasonal expression in paid). Note what you find and what is absent or unclear. `WebSearch` is permitted only for this real-time seasonal/competitive context; do not use it to fetch anything inferable from the loaded KB.

### Step 4: Write the Approaches doc (`context`)

Call `save_channel_plan` with `channel='ad'`, `period`, and `context` — a markdown document **written entirely in Vietnamese (including the section headings — translate the English template headings below)**. The Approaches doc is a persisted artifact the Vietnamese operator reviews and approves in the dashboard; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English). Structure:

```
## Month signals — <period>
<The month's paid-relevant context distilled from Step 3: the cultural/events dates that
warrant a creative surge, the seasonal pain points and motivation patterns paid can ride,
and the competitor/platform signals worth reacting to. Bullet form. If a signal isn't there,
say so rather than padding. This is the situational ground the approaches stand on — NOT a
re-listing of the Focus bets.>

## Layer approaches
<The heart of the doc — the creative HOW per ad layer. Each layer has a DIFFERENT creative job
(it is measured on a different KPI — see `ad/strategy`), so design its creative for that job, not
a generic "sell": L1/L3 creative drives PURCHASE (cost-per-purchase tiers); L2 creative drives
OMNIPRESENCE/reach (judged on reach/CPM/frequency, never purchases — so it nurtures, it does not
hard-sell). Per the account read in `ad/campaign-architecture`: person-led / real-story creative is
the cheap REACH engine (belongs at L2); heritage (60 năm/EU) and flavour are CONVERSION PROOF, not
awareness hooks (belong at L1/L3, not L2). Shape each layer by its audience's **awareness stage** (per `ad/awareness-framework`): L1 cold → Problem/Curiosity/Solution-benefit (lead with mechanism); L2 → recognition/curiosity/social-proof; L3 warm → Proof/Comparison/Solution-direct. Cambridge sits at sophistication 3–4 → win via mechanism (independent science) + identification (Kiều My), not bare benefit claims. For EACH layer, one short block:
- **L1 (theme / cold conversion)** — how the month's prospecting creatives should attack to drive
  purchase: which creative tensions/themes to open with, which personas and frames each leans on,
  the tonal register, and the seasonal hook. This is the directional brief the Blueprint turns
  into concrete theme slots — describe the approaches, do not yet name slot counts.
- **L2 (omnipresence / awareness)** — how the v3.0 omnipresence set (per `ad/campaign-architecture` v3.0:
  **person-led CORE** as the proven cheap-reach engine — Kiều My + consultants — plus **concept TEST**
  experiments, budget-capped and win-gated so winners promote into CORE) should be refreshed this month
  to sustain presence and feed the warm pool: which person-led proof/story leads the CORE, which new
  concepts to TEST, which experience moments and angle emphasis given the month signals. Judged on
  reach/CPM/frequency; do NOT design L2 as a hard conversion push. There are NO fixed pillar ad sets —
  the omnipresence count/ratio comes from `ad/campaign-architecture` v3.0, never a hardcoded list.
- **L3 (warm re-conversion)** — the re-conversion approach this month to drive purchase from the
  warm pool (the most efficient tier): the offer/urgency/reassurance framing and who it re-targets.
- **YouTube** — the YouTube approach this month: theme + value direction for shorts vs in-stream,
  and the watch context it rides (awareness support for L2, not direct conversion).>

## Audience & triggers
<Map the month's personas to their concrete creative triggers for paid. For 2–3 of the
archetypes from brand/personas (a selection out of however many personas are currently listed —
not a fixed total), name the seasonal trigger this month and the entry dimension / pain point a
creative should open on. Draw each featured persona's seasonal trigger from her
`brand/persona-<slug>` detail doc's ranked trigger-point list — match this month's seasonal
context (Step 3) to one of her stated triggers rather than inventing a generic one. Keep it
about the creative entry, not the bet selection.>

## Differentiation
<How Cambridge Diet VN's paid creative should be visibly different this month — given the
competitor signals in Step 3 and the brand's against dimensions (brand/angles §1.3). 2–4 bullets:
what to contrast against (vs-self-dieting, vs-mlm, etc.), and the creative move that makes the
contrast land. This is the "why ours, not theirs" the creatives must carry.>

## Experiments to test
<Optional — 1–3 deliberately experimental creative approaches worth a small test this month
(a fresh frame for a layer, an untried persona×trigger pairing, a new format experiment). Mark
each as experimental and note what a win would look like. Omit the section if there's genuinely
nothing to test.>
```

`save_channel_plan` upserts by `(channel='ad', period)` and writes propose-state only — it never flips a gate.

**Vocabulary rule:** Check `rules/banned-words` for every Vietnamese word you write. Every banned term is PROHIBITED. For example: `"nhịp"` (ALL compounds: giữ nhịp, đứt nhịp, lệch nhịp, bắt nhịp) → use `"chế độ"`, `"lịch"`, `"kế hoạch"`, or `"thói quen"` instead.

### Step 5: Output summary

After saving, output:

```
## Ads Approaches — <period>

**Status:** Proposed (pending human review)

**Focus steering:** loaded — Approaches realizes the approved bets (does not restate them)

### Layer approaches (summary)
- L1: <one line>
- L2: <one line>
- L3: <one line>
- YouTube: <one line>

### Month signals
- Cultural calendar: <1-line summary>
- Seasonal triggers: <1-line summary>
- Competitor/platform signals: <1-line summary or "nothing significant observed">

### Differentiation
- <1-line summary of the month's "why ours, not theirs">

---
Approaches (`context`) saved to the ad channel_plan (propose-state). Approve the Approaches in the dashboard (flips `approaches_approved`), then re-invoke the agent to run the Blueprint.
```

## Output

- `context` written to the ad `channel_plan` (the Approaches markdown — the creative HOW)
- No `detail`, `plan_targets`, or `ad_plan_slots` written — those are the Blueprint step's outputs
- No gate flipped

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Writes only via `save_channel_plan` (`context`); no content-creation or scheduling tool.
- NEVER sets `approaches_approved` (the Approaches gate) or any approval flag. Flipping it is a dashboard-only action (`approve_channel_plan`, gate `approaches`).
- Always gate-check `tactics_approved` first (Step 1). If the Focus is not approved, STOP — do not load the KB, run research, or write anything.
- **Does NOT restate the Focus bets.** The Approaches doc adds the creative "how"; it assumes the bets already named in the approved `tactics`. Re-listing the pillar bets / re-justifying the angle selection is forbidden — it makes the dashboard a fragmented duplicate.
- **Does NOT write budget split, layer %, the ad-set build map, or creative counts** — those are the Blueprint step's outputs (`detail` + `plan_targets` + `ad_plan_slots`). Approaches carries only the creative direction (`context`).
- Research (Step 3) is intentionally light — 3–5 queries maximum. Do not expand into a deep multi-source pass; that is the strategic review's job.
- **Design creative for each layer's job.** L1/L3 approaches drive purchase (cost-per-purchase tiers); L2 approaches drive omnipresence/reach (person-led story creative, never a hard conversion push); heritage/flavour are conversion proof (L1/L3), not awareness hooks (not L2). This sets the creative intent only — performance grading lives in Measure.
- **Never use the acronym "RCT"** in any persisted prose — write **"nghiên cứu lâm sàng độc lập"**. All `context` prose is Vietnamese.
- Reference only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- All persisted prose is **Vietnamese** (including the section headings); only your chat-side reasoning stays English.
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. All output goes to the ad `channel_plan`.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads).
