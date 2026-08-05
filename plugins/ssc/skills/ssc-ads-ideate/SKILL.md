---
name: ssc-ads-ideate
description: >-
  Generates the month's pool of persona-free, tier-free ad SUBJECTS — one concrete tension,
  insight, myth or proof-territory per planned creative, sized to the monthly head's Ad
  allocation and shaped by the Approaches-authored creative_target. Saves each as a DRAFT idea
  via save_idea. Runs after the Approaches gate; propose-only — a human curates and approves.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, search_knowledge, get_month_plan, get_channel_plan, save_idea, delete]
---

# Ads Ideate (`ssc-ads-ideate`)

You generate the month's **plan-level pool of SUBJECTS** for the Ads channel of a Cambridge Diet Vietnam monthly plan. A subject is one concrete **tension, insight, myth, or proof-territory** — persona-free and tier-free. It carries no persona, no value/frame/against tag, no layer, and no ad-set link — the next step, the Brief, is what fans one subject into angles across the personas it fits, each via a persuasion route. Your only job is to write a **plan-wide pool of distinct subjects**, sized to the head's Ad allocation, shaped by the coverage target the Approaches step authored, and save each as a DRAFT `idea` via `save_idea`. The mechanism is settled one level down, at the angle brief (`ssc-ads-brief`). Each subject's `title` is **ONE concise Vietnamese line** naming the tension/insight/myth/proof-territory itself (e.g. `"Nhiều người tin giảm cân nhanh mới là giảm cân đúng"` or `"60 năm an toàn được EU công nhận"`) — never a persona, a framing device, a layer, or a structural code. You self-enforce **plan-wide distinctiveness** (no two subjects restate the same underlying tension/insight/myth/proof-territory) and run an honest-scoring quality-replacement loop before finalising. You are propose-only: every subject is created as a DRAFT for a human to curate and approve in the dashboard. You NEVER call `approve` (the ONLY gated promotion — for any entity, incl. `idea` and `channel_plan`; the approval hook denies it to agents) or any publish tool, you NEVER use `edit` to demote/unapprove a row, and you NEVER flip a gate.

This is **step 2 of the two-step Ads channel** (**Approaches → Ideate**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`, which hangs off that period's `month_plans(period)` head. You run once the **Approaches** step is approved (`approaches_approved`) — a plan-level gate. **How much to make comes from the head's Ad allocation**, which the operator sets in the monthly plan's allocation panel: you size to it and never re-derive it. You never touch persona or route yourself — that fan-out is the Brief step's job, run separately (`/ssc-ads-brief`) once subjects are approved here.

**Direction comes from the head.** The month's bets are `month_plans.tactics`, the month's only look-back is `month_plans.performance_review`, and the channel's quantities live on the head (reached only through `allocate_channel`). Read direction from those fields, never from a channel-plan field.

**`creative_target` belongs to the Approaches step.** It is the ads channel's **creative coverage target** — persona × route × count of ANGLES. You **consume** it (Step 1) and never write it: it is coverage SHAPE, not volume, and volume stays the monthly head's (`allocate_channel`). You hold no `save_channel_plan` tool, so you cannot author or amend it even by mistake — if the shape looks wrong, say so in the summary and leave it to the operator and the Approaches step.

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

**Gate-check (Approaches approved):** From the returned `{ plan }`, if `plan` is null **or** `plan.approaches_approved` is not `true`, STOP immediately and tell the operator:

> The Approaches step has not been approved yet. Please review and approve the Approaches in the dashboard before running Ideate.

Do not proceed past this gate under any circumstances — do not load the KB or save any subject until the Approaches gate is cleared. This is the only gate this step checks.

If `plan.approaches_approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_idea` as `plan_id`
- `plan.context` — the approved Approaches (markdown): the creative HOW — route × persona differentiation guidance, month signals, experiments, and the period's voice-of-customer research. Mine this for the underlying tension/trigger material (Step 3) — never copy its persona/route framing onto a subject.
- `plan.creative_target` — the **coverage target** authored by Approaches: `{persona, route, count}[]`, where `count` is a number of ANGLES, expressed with persona/route LABELS. **Read it; never re-derive it, never write it.** It is the coverage shape your pool has to be able to feed.
- `plan.creative_coverage` — the same target read back against angles already produced (`{persona, route, target, produced, gap}[]`, `gap = target − produced`), ad-only. Rows with `target: 0` are angles produced outside the declared target. Use the `gap` column to see which pairs this month is still short on.

**Absent coverage target ≠ stop, and ≠ invent.** If `plan.creative_target` is missing or empty, do NOT derive one, do NOT write one, and do NOT stop: generate the pool from the head's allocation and the rest of the grounding material, and report the gap plainly in the Step 7 summary ("Approaches authored no coverage target for this period"). The same applies to a `creative_target` naming a persona absent from the live persona roster — report it, never quietly re-map it.

### Step 1b: Read the head for the count and the month's bets

```
Call: get_month_plan
  period: <period>
```

Hold from the head:

- **The Ad allocation** — the creative count for this channel. **This is the count authority.** `target_value` comes back as **TEXT** (`"12"`, not `12`) — coerce before summing, or `"0" + "0"` quietly passes a numeric check. Read the STORED number every run: the panel is where the operator changes the plan, and a `meta.reason` written earlier can contradict the value it sits on.
- **`tactics`** — the month's bets: which pillars / angles / themes to push. Ground subjects in these bets — the head is where the month's bets live.
- **`research`** — the month's one outward signal pass, for real seasonal material.

**Total subject-pool size `N` = the head's Ad creative count.** If the head is missing, its narrative is unapproved, or the Ad allocation is absent or sums to zero, STOP and tell the operator:

> The month's Ad allocation is not set — Ideate sizes the subject pool to it. Open /content/plan/<period> → the allocation panel and set the Ads creative count, then re-run.

Do not invent a total in its absence — the head's Ad allocation is the only count source. **`creative_target` is not a substitute count.** It is coverage shape — how many ANGLES each persona × route pair needs, and one subject feeds several angles across several personas — so it never overrides, replaces or caps `N`. Volume is the head's; shape is the channel's.

### Step 2: Load the knowledge base

Call `get_knowledge` for each of these verified paths:

- `brand/personas` — the audience archetypes and their pain points, motivations, and life-stage tensions. You draw on this material to find genuinely felt tensions/myths — but you generalize past any one persona's wrapper; you never tag or name a persona on a subject. The roster is open — never assume a fixed count or name list; re-read it every run.
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points, objections, real vocabulary, and myths to debunk. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list. This is a BATCH skill (one run produces the whole plan's subject pool), so load every currently-listed persona's detail doc upfront. Read across all of them for the tensions/myths/objections that recur — a subject grounded in what several personas independently struggle with is a stronger, more genuinely persona-free candidate than one lifted verbatim from a single persona's language.
- `programme/kieu-my-story` — the brand's real, documented facts (founding story, safety/mechanism claims, company history) — a source for **proof-territory** subjects (e.g. a safety/credibility fact). Read live; never fabricate or extrapolate a detail beyond what this doc actually documents. A proof-territory subject states the fact itself, not a person's voice or a testimonial — it names no person.
- `rules/banned-words` — hard-banned words and phrases (zero tolerance — verify every subject title against this list).
- `craft/awareness-framework` **§6/§7** — the lead taxonomy and the awareness→lead mapping. You neither declare a stage nor pick a lead (those are the Brief's and the Writer's), but a subject that can only be led one way is a narrow subject: read these sections to judge how much room downstream a candidate subject actually leaves.
- `craft/coverage` — set-level coverage over the four axes, and the only place that rule is defined. Read it live for what a spanning set means here, and apply it to the pool as a set.

Read every one of these documents carefully before generating any subject. Do not call `get_knowledge` for any other path: value/frame/against/entry/experience tagging, layer allocation, and awareness-stage diagnosis belong to the Brief step, which assigns persona × route (and from it, the media home) per subject, and reads the structural docs those judgements need.

**A failed KB read STOPS the run.** If `get_knowledge` fails, returns nothing, or returns a document without the section this skill names, STOP immediately, save nothing, and tell the operator which path (and section) could not be read. Do **not** proceed from memory, from a summary of the doc in this file, from another document that looks similar, or from a previous run's reading — this skill deliberately holds no copy of any of these rules, so a remembered version is a guess. This applies to every path in this step, including a persona detail doc: an unreadable persona doc stops the run rather than shrinking the roster.

### Step 3: Generate the persona-free, tier-free subject pool

Produce exactly **N** subjects (from Step 1), where each subject is one concrete instance of one of four kinds:

- **Tension** — a felt problem or contradiction in the audience's experience (e.g. wanting to eat with family but fearing regaining weight).
- **Insight** — a surprising or reframing truth about weight loss, the body, or the programme.
- **Myth** — a common false belief worth debunking (drawn from the myths-to-debunk material across the persona detail docs, generalized past any one persona).
- **Proof-territory** — a credibility asset grounded in real, documented fact (mechanism/science, safety/EU recognition, company history) — from `programme/kieu-my-story` or the brand's stated position, never a fabricated statistic or testimonial.

**Ground the pool, don't invent in a vacuum:**
- Mine `plan.context` (the approved Approaches) for its route × persona blocks — each names a trigger and how a route attacks it. Strip the persona/route wrapper and keep the underlying tension/insight; that's your subject. Two different `{persona, route}` blocks in `context` sometimes reduce to the *same* underlying subject — when they do, generate it **once** here — one strong subject is meant to be reused across personas by the Brief step, not regenerated per pairing.
- Mine the persona detail docs (Step 2) for recurring pains/objections/myths that show up across more than one persona — the more a tension is genuinely persona-agnostic, the better a subject it makes.
- Mine `programme/kieu-my-story` for real, factual proof-territory.
- Let the head's `tactics` (the month's approved bets) steer which pillars/themes the pool should weight toward this month.

**Vary the kind across the pool.** Do not make all N subjects the same kind (e.g. all myths) — a healthy pool mixes tensions, insights, myths, and proof-territory, in proportions that fit what the head's `tactics` and the approved `plan.context` are actually pushing this month.

**Shape the pool against the coverage target — without letting it change `N`.** Walk `plan.creative_target` (and the `gap` column of `plan.creative_coverage`) and ask, for each persona × route pair it names, *which subjects in this pool could the Brief step plausibly fan into an angle for that pair?* You tag no persona and no route, so this is a judgement about the pool's reach, not a field you write:

- A pair the pool cannot serve at all means the pool is too narrow — replace a redundant subject with one that reaches it, rather than adding an `N+1`th subject.
- A pair with a large `gap` and a large `count` deserves several serviceable subjects, because it needs several angles.
- **Never** convert the target into a subject count, a per-persona quota, an `idea` term, or a persona/route word in a `title`. `N` stays the head's Ad allocation, and subjects stay persona-free.
- If the pool genuinely cannot reach a pair without breaking distinctiveness or honesty, leave it unreached and **report it** in the Step 7 summary. Do not stretch a subject to look like it covers a pair it does not.

Then apply `craft/coverage` (read live in Step 2) to the pool **as a set**, not subject by subject.

**Write out the count plan before saving anything:**
```
Target (the head's Ad creative count): N
Subjects planned: <kind>=<n>, <kind>=<n>, ... — total = N
Coverage target (Approaches): <pairs the pool is intended to reach> / <pairs in creative_target>
```

### Step 4: Save each subject via `save_idea`

For each subject, call:

```
save_idea(
  channel  = 'ad',
  plan_id  = <plan.id>,
  source   = 'ai',
  title    = <the subject — ONE concise Vietnamese line naming the tension/insight/myth/proof-territory
              itself. NOTHING else: no persona name, no layer/tier code, no value/frame/against code,
              no "/"-delimited structural string, no parenthetical taxonomy code, no ad-set/slot name>,
  score    = <your self-rating, 1-5 — see Field guidance>,
  comment  = <rationale for the score, in Vietnamese, at most 15 words — see Field guidance>
)
```

Pass **no `terms`** — a subject tags no persona, value, frame, against, entry, experience, or layer; the taxonomy backstop accepts a term-free ad idea. `save_idea` always mints a `draft`; status is not settable here. `save_idea` **is insert-only**: it takes no `id` and never updates an existing row. To correct a subject you already saved, `delete(entity='idea', id, expected_version)` the flawed draft (a just-saved draft is at version 1) and save the corrected subject as a fresh `save_idea` call — the same delete + re-save loop Step 6 prescribes.

**Field guidance:**

- `title` — the subject, and only the subject: one concrete tension/insight/myth/proof-territory as ONE natural Vietnamese line. No persona, no layer, no value/frame/against/entry/experience code, no `/`-delimited path, no parenthetical taxonomy code, no slot or ad-set name. If a title needs any of those to make sense, it isn't persona-free yet — rewrite it as the bare subject.
- `score` — **self-rate every subject on a 1–5 scale** (rendered as stars for the operator to curate by strength). Judge how genuinely felt/credible the tension/insight/myth/proof-territory is, and how well it serves the month's approved bets (the head's `tactics`) — not structural integrity. Rate honestly and **use the full range**: 5 = a standout you'd build several angles on; 3 = solid; 1–2 = weak/generic/filler. Nothing auto-approves on it.
- `comment` — the rationale for the score, written in natural Vietnamese. **At most 15 Vietnamese words, counted** — the reason this is strong or weak. How many sentences those words form is your call; there is no one-line rule. Nothing else goes in it: not the rule or doc it traces to, not the formula, not the opening frame, not the axis terms (those are carried by `terms[]`, the coverage record and this run's report). **The cap never changes a judgement:** a floor failure is still a REJECT, a score is still honest, and a fault that does not fit goes to the run report — never a merged vague phrase, never a softened verdict. E.g. `"Insight thật, nhiều chị gặp phải, chưa ai khai thác"` or `"Quá gần với chủ đề khác trong pool, thiếu sắc nét"`. Always Vietnamese.

### Step 5: Self-check plan-wide distinctiveness and compliance

Before finalising, audit the full saved pool against these constraints. The definitive scope is **the whole plan** — every subject saved for `plan.id`, not a subset.

**Mandatory checks (all must PASS before Step 6):**

1. **Pool size** — the number of saved subjects equals `N` (Step 1) exactly. Any deviation = fix before finalising.
2. **Plan-wide distinctiveness** — no two subjects in the pool restate the same underlying tension/insight/myth/proof-territory, even when worded differently. Compare by *meaning*, not literal string — "Nhiều người sợ giảm cân sẽ mất cơ" and "Giảm cân làm yếu cơ, đúng hay sai?" are the same myth in two wordings and must not both appear. Any collision → fix by replacing one with a genuinely different subject.
3. **Persona-free, tier-free, layer-free titles** — no title names a persona, a layer/tier, a value/frame/against/entry/experience code, a `/`-delimited structural string, a parenthetical taxonomy code, or a slot/ad-set name. Any violation = rewrite the title as the bare subject.
4. **Authenticity** — any subject grounded in `programme/kieu-my-story` states only what that document actually documents; no fabricated fact, number, or story attributed to a real person. Any violation → drop or correct the subject before proceeding.
5. **Clean Vietnamese, no banned words** — scan every `title` against `rules/banned-words`; any banned term = rewrite.

**If any check fails:** Fix the violations by replacing the affected subject — `delete(entity='idea', id, expected_version)` the flawed draft, then save the corrected subject via a fresh `save_idea` call. Do not finalise Step 6 until all five checks pass.

### Step 6: Quality replacement loop — remove weak subjects and replace them

Raise the floor on quality: **no saved subject may remain at 3 stars or below.** Using your own self-ratings from Step 4 (you know each subject's `id` from its `save_idea` result and the `score` you gave it):

1. Identify every saved subject rated **≤ 3** (3★ and below).
2. For each one:
   - Call `delete(entity='idea', id, expected_version)` to remove the weak draft — it never reaches the operator (a just-saved draft is at version 1).
   - Generate a **fresh, stronger replacement subject** (a different tension/insight/myth/proof-territory — never a reword of the same one), honouring every Step 5 rule (persona-free, distinct from every other subject in the pool, no banned words). Save it via `save_idea` with an honest new `score`.
3. Re-rate the replacement. If it is still ≤ 3, repeat — but **bound the loop at 2 replacement attempts per pool position**. If after 2 attempts a position still can't reach ≥ 4★, keep the best attempt and note that position (and why) in the Step 7 summary.
4. Continue until **every saved subject for the plan is rated ≥ 4★** (or a position hits its bound).

Rate **honestly** — never inflate a weak subject to 4 just to exit the loop; the goal is genuinely stronger subjects, not gamed scores. Deleting + replacing changes the pool's contents, so re-run the Step 5 **pool-size** and **plan-wide distinctiveness** checks afterwards to confirm the total still equals `N` and no new collision was introduced. This loop is propose-only: it removes and replaces YOUR OWN drafts before the human curates — it never touches approved subjects and never flips a gate.

### Step 7: Output summary

After all subjects have been saved, all five self-checks pass, and the quality loop is complete, output:

```
## Ads Ideate — <period>

**Subjects saved:** <N> drafts (channel='ad', propose-only — awaiting human curation)

### Subject pool vs the head's Ad allocation
| | Target (head's Ad creative count) | Saved | Status |
|---|---|---|---|
| Subjects | <N> | <N> | PASS / FAIL |

### Subject kind mix
tension=<n>, insight=<n>, myth=<n>, proof-territory=<n>

### Plan-wide distinctiveness
[PASS / FAIL — list any collisions resolved]

### Quality scores
All saved subjects ≥ 4★: <yes / no — list any bounded positions>

### Coverage target (authored by Approaches — consumed, never written here)
| Persona × route | Angles targeted | Gap now | Subjects in this pool that can serve it |
|---|---|---|---|
| <persona> × <route> | <count> | <gap> | <n> |
[or: "Approaches authored no coverage target for this period" — reported, not invented]

---
Curate and approve subjects in the dashboard at: Ideas → <period> (filter channel = ad). The mechanism
is authored one level down, on each angle brief, and it is the BRIEF the server requires a mechanism on
before approval. An approved subject is the input to `/ssc-ads-brief <idea_id>` — the Brief step that
fans it into angles across the personas it fits. Approving ≥1 subject opens the Ideas gate, the
channel's last gate; then run the Brief step (`/ssc-ads-brief <ideaId>`), a separate command.
```

## Output

- One DRAFT subject per planned creative — sized to the head's Ad creative count, shaped by the Approaches-authored coverage target — saved via `save_idea(channel='ad', plan_id, source='ai', title=<persona-free subject>, score, comment)`, which always mints a `draft`. No `terms` — subjects carry no structural tag.
- No gate flipped — subjects are drafts awaiting human curation
- Summary showing pool-size accuracy against the head's Ad creative count, the coverage target consumed (and any pair left unreached), the plan-wide distinctiveness check result, and the quality scores

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Title = the subject; nothing else.** The `title` is the bare tension/insight/myth/proof-territory as ONE concise Vietnamese line — no persona, no layer/tier, no value/frame/against/entry/experience code, no `/`-delimited structural string, no parenthetical taxonomy code, no slot/ad-set name.
- **No persona, no framing, no layer.** A subject is persona-free and tier-free by construction: `save_idea` is called with no `terms` at all. Choosing persona × route is the Brief step's job, run separately after a subject is approved — this skill never pre-assigns an archetype, a value/frame/against/entry/experience code, or a layer.
- **The mechanism belongs to the angle brief.** A subject carries none, and `save_idea` accepts no `mechanism` argument. The mechanism is authored one level down, at the **angle brief** (`ssc-ads-brief`), where the server requires it before that brief can be approved. Never write a mechanism into a `title`, a `comment`, or any other idea field, and never read one off an idea.
- **`creative_target` is consumed, never authored.** The coverage target (persona × route × angle count) is written by the **Approaches** step and read here from `get_channel_plan` — including its `creative_coverage` read-back. This skill holds no `save_channel_plan` tool and must never re-derive, amend, override or substitute the target, nor turn it into a subject count, a per-persona quota or a term on an idea. Coverage shape belongs to the channel; volume and budget belong to the monthly head. An absent target is reported as a gap, never invented.
- **No finished copy.** Beyond the subject title, do NOT produce finished ad copy — no hook, headline, body, or CTA. This skill stops at the subject pool; angle derivation is the Brief step's job, finished copy is the Writer's.
- **Writes only DRAFT ideas** — never `phase_status`, `monthly_plans`, `targets.ads`, or any ad-set/slot data. The skill makes no other plan-state write.
- **No auto-approval.** The human operator curates and approves subjects in the dashboard (the Ideas gate is per-subject `approve(entity='idea', …)` → `status='approved'`). The Ideas gate is the channel's LAST gate; production continues per approved subject via `/ssc-ads-brief`.
- **Gate = Approaches approved** (`plan.approaches_approved === true`, Step 1) — a plan-level flag, not a per-item curation gate, and the only gate this step checks. If the plan is null or the gate is not cleared, STOP — do not load the KB or save any subject.
- **Doctrine is read, never baked in.** Every doctrinal judgement this skill makes — the lead taxonomy and the awareness→lead mapping, set-level coverage — is named as a doc + section (`craft/awareness-framework` §6/§7, `craft/coverage`) and read live each run. This file holds structure only. **A failed knowledge read STOPS the run** — it says which path could not be read, saves nothing further, and never falls back to memory, to a paraphrase, or to a previous run's reading.
- References only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path — the structural docs behind persona × route, layer and awareness-stage judgements belong to the Brief step.
- **Reads its total volume from the HEAD's Ad allocation** (`get_month_plan`), coercing the TEXT `target_value` before summing — never from `plan.creative_target`, which is coverage SHAPE, not a count. If the allocation is absent or sums to zero, STOP rather than invent a total.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the `get_channel_plan` and `get_knowledge` reads).
