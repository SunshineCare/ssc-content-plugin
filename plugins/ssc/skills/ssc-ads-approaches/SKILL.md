---
name: ssc-ads-approaches
description: Runs the Approaches step of the standalone Cambridge Diet Vietnam Ads pipeline — the creative HOW. Gated on the approved Focus (tactics_approved). Reads the approved tactics (the bets) and the month's persona × route coverage target (creative_target), does a light WebSearch month pass plus KB synthesis, then writes the Approaches md to context via save_channel_plan — a structured Vietnamese template (Month signals · Route × persona approaches · Differentiation · Experiments to test) that turns the bets into concrete per-route/per-persona differentiation guidance for Ideate (subjects) and Brief (persona × route angles) to draw on. Must NOT restate the Focus bets and must NOT steer per ad set or per layer — the ad set / media buy sits outside the creative pipeline entirely. Propose-only; ends at the Approaches gate; never sets approaches_approved.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, search_knowledge, WebSearch, get_channel_plan, save_channel_plan]
---

# Ads Approaches (`ssc-ads-approaches`)

You run the **Approaches** step of the standalone Cambridge Diet Vietnam Ads pipeline — the creative **HOW**. You read the approved Focus (the *bets* — which pillars/angles/themes to push in paid — plus the month's persona × route **coverage target**, `creative_target`), run a **light** month research pass, and synthesise the **creative approaches** that realize those bets: which routes to emphasize for which personas, what trigger each rides, how to be different from competitors, and what to experiment with. The output is a markdown brief (the Approaches doc) written to `context`. You are propose-only: you write `context` via `save_channel_plan`, then stop. A human reviews and approves the Approaches in the dashboard before Ideate begins. You NEVER call `approve` (the ONLY gated promotion; the approval hook denies it to agents), publish, or any scheduling tool; you never use `edit` to demote/unapprove a row; and you NEVER set `approaches_approved`.

**You add the creative "how" — you do NOT restate the Focus bets.** The Focus already names the priority pillars, angles to push, and tactical themes. The Approaches doc *assumes* those bets and supplies the creative realization of them. Do not re-list the pillar bets or re-justify the angle selection — that is the Focus's job and re-doing it makes the UI a fragmented duplicate. Reference the bets only enough to anchor an approach, never to re-argue them.

This is step 2 of the four-step Ads pipeline (**Focus → Approaches → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the ad plan is self-contained.

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
- `plan.creative_target` — the month's persona × route **coverage target** (an array of `{ persona, route, count }`) set by Focus — the concrete pairs to realize this month, and how much of each. Ground the Route × persona section (Step 4) in these pairs. If it is absent or empty (a plan drafted before Focus began setting it), fall back to selecting representative pairs yourself in Step 4 and say so in the doc.
- `plan.id` — the plan id, for reference only. Approaches writes no `plan_targets` or slot data — there is no ad-set/media-buy step in the creative pipeline.

### Step 2: Load ad and brand knowledge

Call `get_knowledge` for each of these verified paths:

- `ad/awareness-framework` — Market Awareness × Sophistication + Emotion Audit + the persuasion-route lens (§4); shape each route's approach by the audience's awareness stage — read live for which routes serve which stage, never hardcode a route-to-stage mapping in this skill
- `brand/angles` — value dimensions (§1.1), entry dimensions (§1.2), against dimensions (§1.3), experience dimensions (§1.4), frame codes (§3)
- `brand/personas` — the audience archetypes and their pain points, motivations, and entry dimensions. The archetype names, the count, and their priority tiers all live in this document — never assume a fixed count or a fixed name list; re-read it every run.
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points with content guidance, objections, real vocabulary, myths to debunk, and tone guidance. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list, so a persona added later needs no procedural change here. This is a BATCH skill (one run features the pairs named in `creative_target`, or 2–3 personas if it is absent), so load every currently-listed persona's detail doc upfront — not just the ones you end up featuring — so the "Route × persona approaches" section can name each featured persona's actual seasonal trigger instead of a generic one.
- `content/pillars` — the content pillar strategy and pillar names
- `rules/banned-words` — hard-banned Vietnamese words/compounds — verify every Vietnamese string you write

Read these carefully. They are the authoritative source for *how* to differentiate by persona and route and *which* persona triggers to ride. Use the KB to translate the approved bets and coverage target into concrete per-route/persona creative approaches — it supplies the route/awareness lens, persona framing, and angle vocabulary; the strategic direction is already fixed by the approved `tactics` and `creative_target`.

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

## Route × persona approaches
<The heart of the doc — the creative HOW, expressed as per-route/per-persona differentiation
guidance, NEVER per ad set or per layer (the layer/ad-set is a media home the Brief step tags onto
an angle later; the actual media buy — budgets, audiences, ad-set setup — sits outside the creative
pipeline entirely and this doc never names it). Ground this in the month's persona × route coverage
target (`plan.creative_target`, Step 1) when it is set: for EACH `{persona, route}` pair in the
target, one short block —
- **Which trigger it rides** — the featured persona's concrete seasonal/entry trigger this month,
  drawn from her `brand/persona-<slug>` detail doc's ranked trigger-point list. Match this month's
  seasonal context (Step 3) to one of her stated triggers rather than inventing a generic one.
- **How the route attacks it** — per `ad/awareness-framework`'s persuasion-route lens, this
  persona's awareness/sophistication position, and Cambridge's stated position on that ladder (read
  live each run, never assumed): what this route opens on, which mechanism/proof/identification
  lever it pulls, and the tonal register that fits her.
- **The differentiation move** — the entry/value/against dimension (`brand/angles`) that makes this
  pairing distinct from the plan's other featured pairings, so two pairings never read as the same
  creative idea wearing a different persona label.

If `creative_target` is absent or empty (a plan drafted before Focus began setting it), select 2–3
persona × route pairings yourself from the approved `tactics` + the KB reads in Step 2 — grounded
the same way — and note in the doc that no coverage target was set this month.

This section is differentiation GUIDANCE for Ideate (which subjects/routes to generate against)
and the Brief step (which persona × route angle to derive per idea, and — from its awareness stage —
which layer/ad-set the angle later tags itself with) to draw on. It is never a per-ad-set or
per-layer creative assignment, and it names no ad set, layer, budget, or audience anywhere.>

## Differentiation
<How Cambridge Diet VN's paid creative should be visibly different this month — given the
competitor signals in Step 3 and the brand's against dimensions (brand/angles §1.3). 2–4 bullets:
what to contrast against (vs-self-dieting, vs-mlm, etc.), and the creative move that makes the
contrast land. This is the "why ours, not theirs" the creatives must carry.>

## Experiments to test
<Optional — 1–3 deliberately experimental creative approaches worth a small test this month
(a fresh frame for a route, an untried persona×route pairing outside this month's `creative_target`,
a new format experiment). Mark each as experimental and note what a win would look like. Omit the
section if there's genuinely nothing to test.>
```

`save_channel_plan` upserts by `(channel='ad', period)` and writes propose-state only — it never flips a gate.

**Vocabulary rule:** Check `rules/banned-words` for every Vietnamese word you write. Every banned term is PROHIBITED. For example: `"nhịp"` (ALL compounds: giữ nhịp, đứt nhịp, lệch nhịp, bắt nhịp) → use `"chế độ"`, `"lịch"`, `"kế hoạch"`, or `"thói quen"` instead.

### Step 5: Output summary

After saving, output:

```
## Ads Approaches — <period>

**Status:** Proposed (pending human review)

**Focus steering:** loaded — Approaches realizes the approved bets + coverage target (does not restate them)

### Route × persona approaches (summary)
- <persona> × <route>: <one line>
- <persona> × <route>: <one line>
- …

### Month signals
- Cultural calendar: <1-line summary>
- Seasonal triggers: <1-line summary>
- Competitor/platform signals: <1-line summary or "nothing significant observed">

### Differentiation
- <1-line summary of the month's "why ours, not theirs">

---
Approaches (`context`) saved to the ad channel_plan (propose-state). Approve the Approaches in the dashboard (flips `approaches_approved`), then re-invoke the agent to run Ideate.
```

## Output

- `context` written to the ad `channel_plan` (the Approaches markdown — the creative HOW)
- No `plan_targets`, ad-set, or media-buy data written — there is no ad-set/media-buy step in the creative pipeline; the layer/ad-set tag is the Brief step's job, and the actual media buy is a separate ops concern outside the plan entirely
- No gate flipped

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Writes only via `save_channel_plan` (`context`); no content-creation or scheduling tool.
- NEVER sets `approaches_approved` (the Approaches gate) or any approval flag. Flipping it is a dashboard-only action (`approve(entity='channel_plan', gate='approaches')`).
- Always gate-check `tactics_approved` first (Step 1). If the Focus is not approved, STOP — do not load the KB, run research, or write anything.
- **Does NOT restate the Focus bets or coverage target.** The Approaches doc adds the creative "how"; it assumes the bets named in the approved `tactics` and the pairs named in `creative_target`. Re-listing the pillar bets / re-justifying the angle selection / re-listing the coverage counts is forbidden — it makes the dashboard a fragmented duplicate.
- **Does NOT write budget split, layer/ad-set assignment, or media-buy data** — the layer/ad-set tag is decided later, per angle, by the Brief step; the actual media buy (budgets, audiences, ad-set setup) is a separate ops concern outside the creative pipeline entirely. Approaches carries only the creative differentiation direction (`context`); it never names an ad set, a layer, a budget, or an audience.
- Research (Step 3) is intentionally light — 3–5 queries maximum. Do not expand into a deep multi-source pass; that is the strategic review's job.
- **Design creative for each pairing's job, not a per-ad-set/per-layer steer.** A `{persona, route}` pairing's awareness stage (read live from `ad/awareness-framework` each run) determines whether its creative should cold-open (mechanism/curiosity) or warm-close (proof/reassurance/comparison) — never hardcode a route-to-stage mapping in this skill, and never frame guidance as "L1/L2/L3" or per-ad-set. This sets the creative intent only — performance grading lives in Measure.
- **Never use the acronym "RCT"** in any persisted prose — write **"nghiên cứu lâm sàng độc lập"**. All `context` prose is Vietnamese.
- Reference only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- All persisted prose is **Vietnamese** (including the section headings); only your chat-side reasoning stays English.
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. All output goes to the ad `channel_plan`.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads).
