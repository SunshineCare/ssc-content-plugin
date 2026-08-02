---
name: ssc-ads-approaches
description: Runs the Approaches step of the Ads channel of a Cambridge Diet Vietnam monthly plan — the creative HOW, the doctrine's generator, and the channel's FIRST authored step. For the channel-agnostic pieces of Approaches work — the inherited market-sophistication read, the per-persona VOICE-OF-CUSTOMER pass and the CANDIDATE-MECHANISM supply — it dispatches the shared sub-skill ssc-approaches-core with channel='ad', then composes the returned blocks into its own sections, carrying the named gaps through and never re-authoring, re-scoring, paraphrasing or re-attributing them. Released by the HEAD's narrative approval (the server gates the context write on it), not by any channel flag — Focus and its tactics_approved gate are retired. Grounds in the head first (its bets, its one outward research pass, its review, its Ad allocation, and its two hand-downs — proof inventory + offer/promotion state), the quarter's strategy second (its market-sophistication read and its marked audience/ad findings), the KB third; runs NO WebSearch of its own (the head's Research is the period's only outward pass). Writes the Approaches md to context via save_channel_plan — a structured Vietnamese template (Month signals · Voice of customer · Candidate mechanisms · Route × persona approaches · Differentiation · Experiments to test) — and AUTHORS creative_target on the same call, the period's creative COVERAGE SHAPE (persona × route × angle count), whose owner this step is. Coverage shape only: volume and budget belong to the monthly head's allocation and a channel-authored volume is refused server-side. Reads every doctrinal rule LIVE from the named KB docs and STOPS the run on a failed read rather than falling back to memory. Must NOT restate the head's bets and must NOT steer per ad set or per layer — the ad set / media buy sits outside the creative pipeline entirely. Propose-only; ends at the Approaches gate; never sets approaches_approved.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  orchestrates: [ssc-approaches-core]
  tools: [get_knowledge, search_knowledge, get_month_plan, get_channel_plan, get_strategy_brief, save_channel_plan]
---

# Ads Approaches (`ssc-ads-approaches`)

You run the **Approaches** step of the Ads channel of a Cambridge Diet Vietnam monthly plan — the creative **HOW**, and the channel's **first authored step**. You read the month's *bets* from the HEAD (`month_plans.tactics` — which pillars/angles/themes to push in paid) plus the head's one outward research pass, and synthesise the **creative approaches** that realize those bets: which routes to emphasize for which personas, what trigger each rides, how to be different from competitors, and what to experiment with.

**This step is the pipeline's GENERATOR.** The ads doctrine's front half lands here, and it is the reason this step exists at all: everything downstream arranges material, and only this step *finds* it. Three things are yours, and nothing below you can supply them:

1. **The period's voice-of-customer research** — what real customers actually say: their language, their triggers, their objections, the myths they hold, **in their own words**. Without it the pipeline invents topics. The shared core **returns** it (Step 4); this step **composes** it into the doc and **saves** it (Steps 5–6).
2. **Candidate mechanisms** — as `craft/doctrine` §2 defines a mechanism, read live (this file defines it nowhere). Ideate may not approve a subject without one, so this step is where the supply reaches the plan. Same division: the core **returns** the candidates (Step 4), this step **composes and saves** them (Steps 5–6). You propose candidates; you never pick the one a subject carries and you never approve anything.
3. **The creative coverage target** (Step 6b) — `creative_target` on the ad channel plan. **You own this field.** It is COVERAGE SHAPE — which personas and routes must be covered this period and in how many *angles* — never volume: the period's creative volume and budget belong to the monthly head's Ad allocation (`allocate_channel`), and a channel-authored volume is refused server-side.

The output is a markdown brief (the Approaches doc) written to `context`, plus the structured `creative_target`. You are propose-only: you write `context` + `creative_target` via `save_channel_plan`, then stop. A human reviews and approves the Approaches in the dashboard before Ideate begins. You NEVER call `approve` (the ONLY gated promotion; the approval hook denies it to agents), publish, schedule, or spend; you never use `edit` to demote/unapprove a row; and you NEVER set `approaches_approved`.

**Every doctrinal rule is read LIVE from the KB (Step 2) and none of it is restated here.** Skills hold structure — stage order, contracts, tools, gates, propose-only; the knowledge base holds every revisable judgement. **A failed KB read STOPS the run** — you never proceed from a remembered version of a doc, and you never write anything after a failed read.

**You add the creative "how" — you do NOT restate the month's bets.** The head's Tactics step already names the priority pillars, angles to push, and tactical themes. The Approaches doc *assumes* those bets and supplies the creative realization of them. Do not re-list the pillar bets or re-justify the angle selection — that is the head's job and re-doing it makes the UI a fragmented duplicate. Reference the bets only enough to anchor an approach, never to re-argue them.

This is **step 1 of the two-step Ads channel** (**Approaches → Ideate**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`, which hangs off that period's `month_plans(period)` head. **Focus and Measure are retired steps, not skipped ones** — `channel_plans.tactics`, `tactics_approved` and `retrospective` were DROPPED from the schema, the month's bets are `month_plans.tactics`, and the month's only look-back is `month_plans.performance_review`.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the ad channel plan

Call:

```
Call: get_channel_plan
  channel: ad
  period: <period>
```

A null plan is normal — you MINT it when you write `context`, and the server links it to the period's head automatically.

Hold `plan.id` for reference only. Approaches writes no `plan_targets` and no `detail` payload — both are refused with `retired_plan_field` from `2026-08` onward, and there is no ad-set/media-buy step in the creative pipeline.

On a re-run the plan may already carry a `creative_target` this step wrote, read back as `creative_coverage` (target versus produced ad briefs, by persona/route label). Read it for what the period has already produced against the shape; you re-author the whole target in Step 6b, so this is context, not a delta base.

**There is no channel-side gate to check here.** `tactics` and `tactics_approved` were DROPPED from the schema, so the retired Focus gate cannot be read at all. What releases this step is the HEAD:

### Step 1b: Read the head — the release gate and the primary steering

```
Call: get_month_plan
  period: <period>
```

**Release gate:** if `plan` is null **or** `plan.narrativeApproved` is not `true`, STOP immediately and tell the operator:

> The month is not released. The Ads channel is released by the monthly plan's Narrative approval, which is the month's only gate. Open /content/plan/<period> → Plan stage, then re-run. Nothing was written.

Do not load the KB or write anything under an unapproved narrative. The server enforces the same rule — `save_channel_plan` refuses the `context` write with `narrative_not_approved` — but stop cleanly here rather than relying on the rejection. (That gate is a **move**, not a new one: it previously anchored to the retired Focus write.)

Hold from the head, in this priority order:

- **`tactics`** — the month's **bets**: which pillars / angles / themes to push in paid. These are the primary steering. You realize them; you never repeat or re-decide them.
- **`research`** — the month's ONE outward signal pass: the calendar, the seasonal triggers, the competitor/platform signals, the compliance constraints. This replaces the WebSearch this step used to run.
- **`performanceReview`** — the month's only look-back, including the ad lens read by layer. Use it for what to carry forward and what to drop.
- **The Ad allocation** — this channel's creative count. Read it for scale awareness only; **never restate a count in the doc** (this document says HOW to write, not how many), and never treat it as the shape of `creative_target`.

**The head's two hand-downs.** `get_month_plan` publishes both explicitly, and `null` is a *fact*, not a missing read:

- **`proofInventory`** — which proof devices are actually available this period (`{ terms, notes }`). The channel spans the proof-device axis ONLY from this set, so your candidate mechanisms (Step 5) may lean only on a device stated here. **`null` means NO stated inventory** — report the gap plainly in the doc and in the summary; never assume every device is available, and never invent an inventory.
- **`offerState`** — whether a REAL, dated promotion exists (`{ promotion, label, startsOn, endsOn, notes }`). **`null` means NO promotion**: the doc then carries no timeliness claim and you neither infer nor invent one. A stated promotion may be named ONCE, as information, subject to the urgency rule in `craft/cta` **§2**.

Then read the quarter's strategy as the SECOND tier — `get_strategy_brief(<quarter>, marked_only=true)` — to place the month inside the quarter and fill in where the month is silent. It never overrides the month. Where two tiers disagree, the higher one wins and you say so in one line. Hold from it:

- **`sophisticationStage` + `sophisticationRead`** — the quarter's **market-sophistication read**, authored ONCE at the quarter and inherited by the month.
- **The marked findings** — in particular the audience and ad dimensions. These are the quarterly cycle's own voice-of-customer and competitor gathering.

**These two, together with the head's `research`, `performanceReview` and the two hand-downs above, are passed to `ssc-approaches-core` in Step 4** — what the read constrains, and what the findings are worth as a source, are the core's to apply. You hold them, pass them through verbatim, and report back what the core returns (including a `NOT STATED` read) in the doc and in the Step 7 summary.

### Step 2: Load ad and brand knowledge — LIVE, and a failed read STOPS the run

Call `get_knowledge` for each of these verified paths:

- `craft/doctrine` — **the spine doc, and the first read of the run.** The chain (research + mechanism → awareness → lead type → the varied toolkit), the mandatory mechanism beat, what is fixed versus what is deliberately varied, the honest no-efficacy-evidence statement, and the compliance stance as a **chosen risk position**. **§6 is its rule-ownership table** — read it live to see which doc owns which rule, and follow it there rather than deciding from this skill. Nothing about the mechanism, the floor, the permitted openings or the refusals is restated in this file
- `craft/coverage` — set-level coverage over the four axes (the in-batch diversity rule and the coverage axes are ONE reconciled statement there, and that doc is the only place they are defined). Read it live for what a set must span; this step's job is only to leave downstream enough distinct material to span them
- `craft/awareness-framework` **§6/§7** — the lead taxonomy and the awareness→lead mapping (a stage admits two or three leads; the overlap is where coverage lives). Read live — you never fix a lead, and never restate the mapping here — plus Market Awareness × Sophistication + Emotion Audit + the persuasion-route lens (§4); shape each route's approach by the audience's awareness stage — read live for which routes serve which stage, never hardcode a route-to-stage mapping in this skill
- `brand/proof-points` — the adopted proof families a candidate mechanism's trace may lean on
- `rules/compliance` — the refused proof devices and the constraint that refuses each; never propose a mechanism whose only proof route is a refused device
- `brand/angles` — value dimensions (§1.1), entry dimensions (§1.2), against dimensions (§1.3), experience dimensions (§1.4), frame codes (§3)
- `brand/personas` — the audience archetypes and their pain points, motivations, and entry dimensions. The archetype names, the count, and their priority tiers all live in this document — never assume a fixed count or a fixed name list; re-read it every run.
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points with content guidance, objections, real vocabulary, myths to debunk, and tone guidance. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list, so a persona added later needs no procedural change here. This is a BATCH skill (one run features the pairs you select from the head's bets), so load every currently-listed persona's detail doc upfront — not just the ones you end up featuring — so the "Route × persona approaches" section can name each featured persona's actual seasonal trigger instead of a generic one.
- `content/pillars` — the content pillar strategy and pillar names
- `rules/banned-words` — hard-banned Vietnamese words/compounds — verify every Vietnamese string you write

Use `search_knowledge` only when the head's research or the quarter's findings name something these paths do not cover (a specific proof point, a myth, a programme detail) and you need the brand's own recorded position on it before writing guidance about it — never to invent a phrase.

Read these carefully. They are the authoritative source for *how* to differentiate by persona and route and *which* persona triggers to ride. Use the KB to translate the head's bets into concrete per-route/persona creative approaches — it supplies the route/awareness lens, persona framing, and angle vocabulary; the strategic direction is already fixed by the head's `tactics`, and the KB never supplies direction.

**A FAILED KB READ STOPS THE RUN.** If `get_knowledge` errors, returns nothing, or returns a document you cannot read for any path listed above, STOP immediately, write NOTHING (no `context`, no `creative_target`), and tell the operator:

> Không đọc được tài liệu KB `<path>`. Approaches dừng lại — bước này không chạy bằng bản ghi nhớ. Vui lòng kiểm tra tài liệu trong Knowledge dashboard rồi chạy lại. Chưa ghi gì cả.

Never substitute a remembered version, never paraphrase the doc from this file, and never continue with the remaining docs — two sources of truth for a doctrinal rule is exactly the drift this design refuses. A doc that exists but is still awaiting approval is the same case: stop and say which doc.

### Step 3: The month's signals come from the head — run NO research of your own

**There is exactly ONE outward signal pass per period, and it is the head's Research step.** This step used to run its own light `WebSearch`; it no longer does, and `WebSearch` is not in its tool list. A second scan would produce a second, competing account of the same month — and the head's is the one the operator approved.

Take from the head's `research` (Step 1b), and take it as given:

1. **The calendar** — the month's holidays, observances and significant dates, and what each one opens.
2. **The seasonal triggers** — the health behaviours, motivation patterns and physical conditions this time of year brings, that paid angles can ride.
3. **The competitor / platform signals** — what competitors are doing, plus any Meta policy or ad-feature shift, plus any compliance constraint the research flagged.

If the research is silent on something you need, **say so in the doc** rather than filling the gap from a search or from memory. A named gap is information the next month's Research can act on; an invented signal is not.

### Step 4: Dispatch `ssc-approaches-core` — the voice-of-customer pass and the candidate-mechanism supply

**The generator's channel-agnostic half is not authored here.** The
voice-of-customer pass and the candidate-mechanism supply are the **shared
core's**: `ssc-approaches-core` holds them ONCE for both Approaches channels, so
no second copy of that doctrine exists to drift. Every rule that governs them —
which sources the pass compiles from and in what order of authority, what must be
attributed, what an avoid-list does, what a candidate carries, how a proof route
is selected against this period's inventory, how indirectness is judged against
the inherited read — lives in that skill and is **deliberately not restated
here.** Do not re-derive them and do not keep a local copy.

Dispatch it with what you have already read. It reads **no plan state** of its
own (no `get_month_plan`, no `get_channel_plan`, no `get_strategy_brief`) and
holds **no mutation tool**, so the release gate you cleared in Step 1b and every
save in Steps 6 / 6b stay yours — one read, one gate:

```
Dispatch: ssc-approaches-core
  channel:  ad
  period:   <period>
  head:     { research, performanceReview, proofInventory, offerState }   ← Step 1b
  quarter:  { sophisticationStage, sophisticationRead, marked findings }  ← Step 1b
  personas: <the personas this run features>
```

| Payload key | What you pass | What rides with it |
|---|---|---|
| `channel` | `ad` — always | This skill dispatches the core on no other channel; `post` is `ssc-post-approaches`' dispatch |
| `period` | the plan month, `YYYY-MM` | The same period you read in Step 1 |
| `head` | `research`, `performanceReview`, `proofInventory`, `offerState`, exactly as `get_month_plan` returned them (Step 1b) | A `null` `proofInventory` and a `null` `offerState` are **facts** — pass the null. Never an assumed inventory, never an invented promotion |
| `quarter` | `sophisticationStage`, `sophisticationRead` and the marked findings from `get_strategy_brief` (Step 1b) | Pass them **verbatim**. A brief carrying no read comes back `NOT STATED`, which you report — never a stage you supplied |
| `personas` | the personas this run features, selected from the head's bets against the live `brand/personas` roster (Step 2) | Pass none and the core features the whole current roster and names that fallback; never hand-guess a subset |

It returns three blocks — the **inherited sophistication read**, the **per-persona
voice-of-customer pass**, and the **candidate-mechanism supply** — plus the named
gaps, the personas it featured, and the KB docs it read live. It writes nothing:
**Step 5 is what you do with them.**

The core runs no outward pass either, so Step 3's rule holds across the dispatch:
there is exactly one outward signal pass per period and it is the head's.

A **failed KB read inside the core STOPS this run too.** The core then returns no
block at all: write **nothing** (no `context`, no `creative_target`) and name the
document the core reported as unreadable, exactly as Step 2's rule does for your
own reads.

### Step 5: Compose the core's blocks into the doc — never re-author them

The voice-of-customer pass and the candidate mechanisms are already authored; the
core returned them in Step 4. This step is **composition**, and the material is
handled as returned:

- **Compose the doc's *Voice of customer* section** (Step 6's template) from the
  core's `voice_of_customer` block — per featured persona, with each quoted line
  keeping the attribution the core gave it.
- **Compose the doc's *Candidate mechanisms* section** (Step 6's template) from
  the core's `candidate_mechanisms` block — one short block per candidate, keeping
  its quoted voice-of-customer item, its proof route (`verified` /
  `unverified_for_period`) and its indirectness call exactly as returned.
- **Carry the named gaps through.** The core's `gaps:` line, and any gap inside a
  persona's block, goes into the doc's Voice-of-customer section AND the Step 7
  summary, saying which source was silent about which persona. Do not fill a gap
  and do not quietly drop one. A gap does **not** stop the run — only a failed KB
  read does (Step 2).
- **Carry the sophistication read through** as the core returned it, `NOT STATED`
  included — reported in the doc and in the Step 7 summary as a gap, never filled
  with a guessed stage.
- **Never re-author and never re-score.** Do not re-word a mechanism sentence,
  re-attribute or re-punctuate a quote, add a candidate the core did not return,
  drop one because it reads awkwardly, or re-judge a proof route or an
  indirectness call. Where a returned item looks wrong, say so to the operator
  instead of silently rewriting it: a caller-side edit of the core's material is a
  second copy of the doctrine with none of its rules attached.

**You propose; Ideate picks; a human approves.** This step's pipeline position is
unchanged: Ideate picks the one mechanism a subject carries (one per subject,
inherited by every angle brief beneath it) and a human approves the subject. You
choose none of them and approve none of them. Candidates the month does not use
are not wasted — they stay in the approved Approaches doc for the period and can
be picked up by any subject the month generates.

### Step 6: Write the Approaches doc (`context`)

Call `save_channel_plan` with `channel='ad'`, `period`, and `context` — a markdown document **written entirely in Vietnamese (including the section headings — translate the English template headings below)**. The Approaches doc is a persisted artifact the Vietnamese operator reviews and approves in the dashboard; the structure below is the guide, the prose and headings are Vietnamese (your chat-side reasoning can stay English). Structure:

```
## Month signals — <period>
<The month's paid-relevant context, taken from the head's research (Step 1b/3): the cultural/events dates that
warrant a creative surge, the seasonal pain points and motivation patterns paid can ride,
and the competitor/platform signals worth reacting to. Bullet form. If a signal isn't there,
say so rather than padding. This is the situational ground the approaches stand on — NOT a
re-listing of the head's bets.>

## Voice of customer — <period>
<Step 4's output: what real customers actually say, grouped per featured persona — her LANGUAGE
(verbatim phrases), her TRIGGERS, her OBJECTIONS, and the MYTHS she holds, in her own words.
Every quoted phrase names its source (head research / quarterly finding / her persona doc /
performance review). Never invent a quote. Where a source was silent, write the gap in the same
place — "<source> nói gì về <persona>: không có" — and do NOT fill it. This section is what stops
the pipeline inventing topics; a padded version is worse than a short honest one.>

## Candidate mechanisms
<Step 5's output: the period's supply of mechanisms, each a short block —
- **The mechanism** — why this works, or why past attempts fail. One specific sentence.
- **What it explains** — the quoted, attributed voice-of-customer item it answers.
- **Proof route** — which proof family (brand/proof-points) and the trace (live KB proof point or
  the paperwork), selected from THIS period's proof inventory. Where the head stated none, say so
  and mark the route unverified for the period.
- **How indirect the lead must be** — read against the quarter's inherited sophistication read;
  where there is none, say so.
These are CANDIDATES. Ideate picks the one mechanism a subject carries and a human approves it;
nothing here is chosen or approved by this step, and unused candidates stay available all period.>

## Route × persona approaches
<The heart of the doc — the creative HOW, expressed as per-route/per-persona differentiation
guidance, NEVER per ad set or per layer (the layer/ad-set is a media home the Brief step tags onto
an angle later; the actual media buy — budgets, audiences, ad-set setup — sits outside the creative
pipeline entirely and this doc never names it). Ground this in the head's bets (Step 1b): select the
`{persona, route}` pairs those bets actually call for, and give EACH one short block —
- **Which trigger it rides** — the featured persona's concrete seasonal/entry trigger this month,
  drawn from her `brand/persona-<slug>` detail doc's ranked trigger-point list. Match this month's
  seasonal context (Step 3) to one of her stated triggers rather than inventing a generic one.
- **How the route attacks it** — per `craft/awareness-framework` §4's persuasion-route lens, this
  persona's awareness/sophistication position, and Cambridge's stated position on that ladder (read
  live each run, never assumed): what this route opens on, which mechanism/proof/identification
  lever it pulls, and the tonal register that fits her.
- **The differentiation move** — the entry/value/against dimension (`brand/angles`) that makes this
  pairing distinct from the plan's other featured pairings, so two pairings never read as the same
  creative idea wearing a different persona label.
- **Which candidate mechanisms it can draw on** — name them from the Candidate mechanisms section
  above (by their one-sentence mechanism, not restated at length). Every featured pairing must have
  at least one, or Ideate cannot approve a subject for it.

Select the pairings from the head's `tactics` + the KB reads in Step 2. Cover the personas and
routes the month's bets name; where the bets leave a genuine choice, prefer a pairing the head's
review found under-served. **Name no volume** — no creative count, no budget, no ad-set quantity:
this document says HOW to write, and the period's volume lives on the head's Ad allocation. The one
quantity this step authors is the ANGLE count per pairing, and it lives in the structured
`creative_target` field (Step 6b), never in this prose.

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
(a fresh frame for a route, an untried persona × route pairing outside this month's bets,
a new format experiment). Mark each as experimental and note what a win would look like. Omit the
section if there's genuinely nothing to test.>
```

`save_channel_plan` upserts by `(channel='ad', period)` and writes propose-state only — it never flips a gate.

**Vocabulary rule:** Check `rules/banned-words` for every Vietnamese word you write. Every banned term is PROHIBITED. For example: `"nhịp"` (ALL compounds: giữ nhịp, đứt nhịp, lệch nhịp, bắt nhịp) → use `"chế độ"`, `"lịch"`, `"kế hoạch"`, or `"thói quen"` instead.

### Step 6b: Author `creative_target` — the period's creative COVERAGE SHAPE

**This step OWNS `creative_target`.** It is the ad channel plan's creative coverage target, it is consumed by Ideate to size its subject pool, and this step is its only writer — the retired Focus step is not its home and must not be inferred as one. Write it on the SAME `save_channel_plan` call as `context` (or a second call on the same `(channel='ad', period)` pair — the upsert preserves unset fields either way):

```
Call: save_channel_plan
  channel: ad
  period: <period>
  context: <the Approaches markdown from Step 6>
  creative_target:
    - persona: <live persona LABEL from brand/personas>
      route:   <live route LABEL>
      count:   <number of ANGLES to brief for this pairing>
    - …
```

The rules that keep it coverage shape and not volume:

- **It is COVERAGE SHAPE.** `creative_target` answers *which personas and routes must be covered this period, and in how many angles* — the shape of the creative surface. It never answers *how many creatives* or *how much budget*: **volume and budget belong to the monthly head** (`allocate_channel`), a channel-authored volume is refused server-side, and this step never calls `allocate_channel` and never writes `detail` (a `detail` allocation is refused with `retired_plan_field` from `2026-08` onward).
- **`count` is a count of ANGLES, and of nothing else.** One angle = one persona × route brief. It is not a creative count, not an ad count, not an ad-set count, not a spend figure. Never derive it by dividing the head's Ad allocation, and never let the two be read as the same number.
- **One entry per featured pairing**, and every entry must be a pairing the doc's *Route × persona approaches* section actually covers — the field is the machine-readable shape of that section, never a second, divergent plan. A pairing with no candidate mechanism (Step 5) does not belong in either.
- **Personas and routes are LIVE ROSTER LABELS**, resolved from `brand/personas` and the route vocabulary this run read — not term ids, and never a hardcoded list. A persona added or retired needs no change to this skill.
- **The shape is justified in the prose, the numbers live in the field.** The doc says why a pairing carries more weight than another (the head's bets, the review's under-served pairings, the candidate-mechanism supply); the field carries the angle counts. Do not restate the counts in the prose.

`get_channel_plan` reads it back as `creative_coverage` — target versus produced ad briefs, matched by persona/route label — which is how the operator sees the shape being met or missed. Re-running this step re-authors the whole target: state the full set every time, not a delta.

### Step 7: Output summary

After saving, output:

```
## Ads Approaches — <period>

**Status:** Proposed (pending human review)

**Head steering:** loaded — Approaches realizes the month's approved bets (does not restate them)

**Hand-downs:** proof inventory: <stated (n devices) | NOT STATED — gap reported> · offer/promotion: <label + dates | none stated> · sophistication read (quarter): <stage | NOT STATED — gap reported>

### Voice of customer
- <persona>: <n> phrases / <n> triggers / <n> objections / <n> myths — sources: <…>
- Gaps: <which source was silent about which persona, or "none">

### Candidate mechanisms
- <one-line mechanism> — explains: <VoC item> · proof: <family / unverified>
- …

### Creative target (coverage shape)
- <persona> × <route>: <n> angles
- …
(angle counts only — volume and budget stay on the head's Ad allocation)

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
Approaches (`context`) + `creative_target` saved to the ad channel_plan (propose-state). Approve the Approaches in the dashboard (flips `approaches_approved`), then re-invoke the agent to run Ideate.
```

## Output

- `context` written to the ad `channel_plan` (the Approaches markdown — the voice-of-customer pass, the candidate mechanisms, and the creative HOW)
- `creative_target` written on the same `channel_plan` — the period's creative COVERAGE SHAPE (persona × route × angle count). This step is its owner and its only writer; Ideate consumes it
- No `plan_targets`, `detail`, ad-set, or media-buy data written — volume and budget belong to the head's Ad allocation, there is no ad-set/media-buy step in the creative pipeline, the layer/ad-set tag is the Brief step's job, and the actual media buy is a separate ops concern outside the plan entirely
- No gate flipped

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Writes only via `save_channel_plan` (`context` + `creative_target`); no content-creation, scheduling, publishing or spending tool — never `create_campaign` / `create_adset` / `create_ad` / `update_budget`, and never `allocate_channel`.
- NEVER sets `approaches_approved` (the Approaches gate) or any approval flag. Flipping it is a dashboard-only action (`approve(entity='channel_plan', gate='approaches')`).
- Always check the HEAD's release gate first (Step 1b). If the narrative is not approved, STOP — do not load the KB or write anything. Never read `tactics_approved`: the column was DROPPED, and the gate moved to the head.
- **Does NOT restate the head's bets, and authors NO volume.** The Approaches doc adds the creative "how"; it assumes the bets named in the head's `tactics`. Re-listing the pillar bets / re-justifying the angle selection / naming a creative count is forbidden — it makes the dashboard a fragmented duplicate, and volume belongs to the head's allocation. The single quantity this step authors is the **angle count per persona × route pairing** in `creative_target` — coverage shape, machine-readable, never in the prose and never a creative/budget/ad-set figure.
- **OWNS `creative_target`** — its only writer. Coverage shape only (persona × route × angle count), always the full set, always live roster labels. Never `detail` (refused with `retired_plan_field` from `2026-08`), never `plan_targets`, never `allocate_channel`.
- **Does NOT write budget split, layer/ad-set assignment, or media-buy data** — the layer/ad-set tag is decided later, per angle, by the Brief step; the actual media buy (budgets, audiences, ad-set setup) is a separate ops concern outside the creative pipeline entirely. Approaches carries only the creative differentiation direction (`context`) and the coverage shape (`creative_target`); it never names an ad set, a layer, a budget, or an audience.
- **The voice-of-customer pass and the candidate-mechanism supply are the SHARED CORE's** — `ssc-approaches-core`, dispatched in Step 4 with `channel='ad'`. This skill **composes** what the core returns into the Approaches doc and **saves** it (Steps 5–6); it never re-authors, re-scores, re-attributes or paraphrases it, and it keeps **no** second copy of the sophistication-inherit rule, the voice-of-customer pass or the candidate-mechanism construction — two copies of doctrine diverge the day one is edited, and the stale copy wins wherever it is read first. The core reads no plan state and holds no mutation tool: the release gate (Step 1b) and every save (Steps 6/6b) stay here.
- **Runs NO outward research** (Step 3): there is exactly one outward signal pass per period and it is the head's Research step. `WebSearch` is not in the tool list, and the shared core holds none either — the voice-of-customer pass (Step 4) COMPILES from the recorded sources this step passes it, and quotes only what a source actually says.
- **Never invents a customer voice, a mechanism's evidence, a proof device, a promotion, or a sophistication stage.** Where a source is silent the gap is NAMED in the doc and in the summary and left open. Only a failed KB read stops the run; a named gap does not.
- **Proposes mechanisms; never chooses or approves one.** Ideate picks the mechanism a subject carries (one per subject, inherited by its briefs) and a human approves the subject.
- **Design creative for each pairing's job, not a per-ad-set/per-layer steer.** A `{persona, route}` pairing's awareness stage (read live from `craft/awareness-framework` each run) determines whether its creative should cold-open (mechanism/curiosity) or warm-close (proof/reassurance/comparison) — never hardcode a route-to-stage mapping in this skill, and never frame guidance as "L1/L2/L3" or per-ad-set. This sets the creative intent only — the look-back that grades performance is the head's Review, not this step.
- **Holds structure, never doctrine.** Every revisable rule — the mechanism's definition and the mandatory beat, the permitted openings, the floor, the proof families and refusals, the lead taxonomy and the awareness→lead mapping, the coverage axes — is read LIVE from the doc named in Step 2 and is never restated, paraphrased or summarised in this file. `craft/doctrine` §6 is the rule-ownership table; follow it to whichever doc owns the rule.
- **A failed KB read STOPS the run** (Step 2): nothing is written, the failing path is named, and the run never falls back to a remembered version of a doc.
- **Never use the acronym "RCT"** in any persisted prose — write **"nghiên cứu lâm sàng độc lập"**. All `context` prose is Vietnamese.
- Reference only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path.
- All persisted prose is **Vietnamese** (including the section headings); only your chat-side reasoning stays English.
- **NEVER writes `monthly_plans`, `targets.ads`, or `phase_status`** — those belonged to the retired shared-head model. All output goes to the ad `channel_plan`.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads).
