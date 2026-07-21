---
name: ssc-ads-ideate
description: >-
  Generates the month's plan-level pool of persona-free, tier-free ad SUBJECTS for the standalone
  Cambridge Diet Vietnam Ads pipeline — one concrete tension / insight / myth / proof-territory per
  planned creative, sized to the TOTAL count in the approved Focus's persona × route coverage target
  (`creative_target`), never per ad set (the ad set / media buy no longer exists in the creative
  pipeline). Gated on the approved Approaches (`approaches_approved`), not on any ad-set approval.
  Saves each subject via `save_idea` (channel='ad', plan_id, source='ai', status='draft', title=<the
  subject, one concise Vietnamese line>, score, comment) — with NO persona, value, frame, layer, or
  any other structural term: the idea tags nothing, because persona × route is chosen later, by the
  Brief step, per subject. Distinctiveness is enforced plan-wide (no two subjects restate the same
  underlying tension/insight/myth/proof-territory, replacing the old per-ad-set "unique angle" rule),
  followed by an honest-scoring quality-replacement loop. Propose-only; subjects are drafts a human
  curates and approves in the dashboard.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, search_knowledge, get_channel_plan, save_idea, delete]
---

# Ads Ideate (`ssc-ads-ideate`)

You generate the month's **plan-level pool of SUBJECTS** for the standalone Cambridge Diet Vietnam Ads pipeline. A subject is one concrete **tension, insight, myth, or proof-territory** — persona-free and tier-free. It carries no persona, no value/frame/against tag, no layer, and no ad-set link: the ad set / media buy has left the creative pipeline entirely (a separate ops concern), and persona is no longer bound at this level — the next step, the Brief, is what fans one subject into angles across the personas it fits, each via a persuasion route. Your only job is to write a **plan-wide pool of distinct subjects**, sized to the month's approved coverage target, and save each as a DRAFT `idea` via `save_idea`. Each subject's `title` is **ONE concise Vietnamese line** naming the tension/insight/myth/proof-territory itself (e.g. `"Nhiều người tin giảm cân nhanh mới là giảm cân đúng"` or `"60 năm an toàn được EU công nhận"`) — never a persona, a framing device, a layer, or a structural code. You self-enforce **plan-wide distinctiveness** (no two subjects restate the same underlying tension/insight/myth/proof-territory) and run an honest-scoring quality-replacement loop before finalising. You are propose-only: every subject is created as a DRAFT for a human to curate and approve in the dashboard. You NEVER call `approve` (the ONLY gated promotion — for any entity, incl. `idea` and `channel_plan`; the approval hook denies it to agents) or any publish tool, you NEVER use `edit` to demote/unapprove a row, and you NEVER flip a gate.

This is **step 3 of the four-step Ads pipeline** (**Focus → Approaches → Ideate → Measure**), keyed on `channel_plans(channel='ad', period=YYYY-MM)`. There is no `/ssc.plan` dependency — the ad plan is self-contained. You run once the **Approaches** step is approved (`approaches_approved`) — this is a plan-level gate, not a per-ad-set one; there is no ad-set approval left to gate on. The month's **coverage/volume target** — `creative_target`, a `{persona, route, count}` array the Focus step set — is the sole source of "how much to make": you sum its counts for the total subject-pool size. You never re-derive that target, and you never touch persona or route yourself — that fan-out is the Brief step's job, run separately (`/ssc.ads-brief`) once subjects are approved here.

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

Do not proceed past this gate under any circumstances — do not load the KB or save any subject until the Approaches gate is cleared. There is no ad-set gate to check — the ad set no longer exists in the creative pipeline.

If `plan.approaches_approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_idea` as `plan_id`
- `plan.creative_target` — the month's persona × route coverage target set by Focus (an array of `{ persona, route, count }`). **This is the count authority.** Sum every row's `count` to get the total subject-pool size for this run. Never redistribute or invent a count — the Focus step already decided the total; you only size to it.
- `plan.tactics` — the approved Focus (markdown): the month's bets — which pillars/angles/themes to push. Ground subjects in these bets.
- `plan.context` — the approved Approaches (markdown): the creative HOW — route × persona differentiation guidance, month signals, experiments. Mine this for the underlying tension/trigger material (see Step 3) — never copy its persona/route framing onto a subject.

**Total subject-pool size:** `N = sum(plan.creative_target[].count)`. If `plan.creative_target` is absent, `null`, or an empty array, STOP and tell the operator:

> No coverage/volume target set — the Focus step's `creative_target` is empty. Review and set the coverage target in Focus before Ideate can size the subject pool.

Do not invent a total in its absence — there is no other count source left in the model (the old per-ad-set `creative_count` fallback no longer exists).

### Step 2: Load the knowledge base

Call `get_knowledge` for each of these verified paths:

- `brand/personas` — the audience archetypes and their pain points, motivations, and life-stage tensions. You draw on this material to find genuinely felt tensions/myths — but you generalize past any one persona's wrapper; you never tag or name a persona on a subject. The roster is open — never assume a fixed count or name list; re-read it every run.
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points, objections, real vocabulary, and myths to debunk. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list. This is a BATCH skill (one run produces the whole plan's subject pool), so load every currently-listed persona's detail doc upfront. Read across all of them for the tensions/myths/objections that recur — a subject grounded in what several personas independently struggle with is a stronger, more genuinely persona-free candidate than one lifted verbatim from a single persona's language.
- `programme/kieu-my-story` — the brand's real, documented facts (founding story, safety/mechanism claims, company history) — a source for **proof-territory** subjects (e.g. a safety/credibility fact). Read live; never fabricate or extrapolate a detail beyond what this doc actually documents. A proof-territory subject states the fact itself, not a person's voice or a testimonial — it names no person.
- `rules/banned-words` — hard-banned words and phrases (zero tolerance — verify every subject title against this list).

Read all four documents carefully before generating any subject. Do not call `get_knowledge` for any other path — the structural KB docs the old ad-set/archetype machinery used (`brand/angles`, `ad/creative-guidelines`, `ad/layer-tones`, `ad/strategy`, `ad/awareness-framework`, `voice/founder-voice`) are no longer this step's concern: value/frame/against/entry/experience tagging, layer allocation, and awareness-stage diagnosis all moved downstream to the Brief step, which assigns persona × route (and from it, the media home) per subject.

### Step 3: Generate the persona-free, tier-free subject pool

Produce exactly **N** subjects (from Step 1), where each subject is one concrete instance of one of four kinds:

- **Tension** — a felt problem or contradiction in the audience's experience (e.g. wanting to eat with family but fearing regaining weight).
- **Insight** — a surprising or reframing truth about weight loss, the body, or the programme.
- **Myth** — a common false belief worth debunking (drawn from the myths-to-debunk material across the persona detail docs, generalized past any one persona).
- **Proof-territory** — a credibility asset grounded in real, documented fact (mechanism/science, safety/EU recognition, company history) — from `programme/kieu-my-story` or the brand's stated position, never a fabricated statistic or testimonial.

**Ground the pool, don't invent in a vacuum:**
- Mine `plan.context` (the approved Approaches) for its route × persona blocks — each names a trigger and how a route attacks it. Strip the persona/route wrapper and keep the underlying tension/insight; that's your subject. Two different `{persona, route}` blocks in `context` sometimes reduce to the *same* underlying subject — when they do, generate it **once** here (that's the whole point of moving persona off the Idea: one strong subject is meant to be reused across personas by the Brief step, not regenerated per pairing).
- Mine the persona detail docs (Step 2) for recurring pains/objections/myths that show up across more than one persona — the more a tension is genuinely persona-agnostic, the better a subject it makes.
- Mine `programme/kieu-my-story` for real, factual proof-territory.
- Let `plan.tactics` (the approved Focus bets) steer which pillars/themes the pool should weight toward this month.

**Vary the kind across the pool.** Do not make all N subjects the same kind (e.g. all myths) — a healthy pool mixes tensions, insights, myths, and proof-territory, in proportions that fit what `plan.tactics` and `plan.context` are actually pushing this month.

**Write out the count plan before saving anything:**
```
Target (sum of creative_target counts): N
Subjects planned: <kind>=<n>, <kind>=<n>, ... — total = N
```

### Step 4: Save each subject via `save_idea`

For each subject, call:

```
save_idea(
  channel  = 'ad',
  plan_id  = <plan.id>,
  source   = 'ai',
  status   = 'draft',
  title    = <the subject — ONE concise Vietnamese line naming the tension/insight/myth/proof-territory
              itself. NOTHING else: no persona name, no layer/tier code, no value/frame/against code,
              no "/"-delimited structural string, no parenthetical taxonomy code, no ad-set/slot name>,
  score    = <your self-rating, 1-5 — see Field guidance>,
  comment  = <one-line rationale for the score, in Vietnamese — see Field guidance>
)
```

Pass **no `terms`** — a subject tags no persona, value, frame, against, entry, experience, or layer; the taxonomy backstop now accepts a term-free ad idea. `save_idea` **is insert-only**: it takes no `id` and never updates an existing row. To correct a subject you already saved, `delete(entity='idea', id, expected_version)` the flawed draft (a just-saved draft is at version 1) and save the corrected subject as a fresh `save_idea` call — the same delete + re-save loop Step 6 prescribes.

**Field guidance:**

- `title` — the subject, and only the subject: one concrete tension/insight/myth/proof-territory as ONE natural Vietnamese line. No persona, no layer, no value/frame/against/entry/experience code, no `/`-delimited path, no parenthetical taxonomy code, no slot or ad-set name. If a title needs any of those to make sense, it isn't persona-free yet — rewrite it as the bare subject.
- `score` — **self-rate every subject on a 1–5 scale** (rendered as stars for the operator to curate by strength). Judge how genuinely felt/credible the tension/insight/myth/proof-territory is, and how well it serves the month's approved bets (`plan.tactics`) — not structural integrity (there is no structure left to check). Rate honestly and **use the full range**: 5 = a standout you'd build several angles on; 3 = solid; 1–2 = weak/generic/filler. Nothing auto-approves on it.
- `comment` — a **one-line rationale for the score, written in natural Vietnamese**: the single biggest reason the subject is strong or weak — e.g. `"Insight thật, nhiều chị gặp phải, chưa ai khai thác"` or `"Quá gần với chủ đề khác trong pool, thiếu sắc nét"`. Always Vietnamese; keep it short and honest.

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

### Subject pool vs coverage target
| | Target (creative_target total) | Saved | Status |
|---|---|---|---|
| Subjects | <N> | <N> | PASS / FAIL |

### Subject kind mix
tension=<n>, insight=<n>, myth=<n>, proof-territory=<n>

### Plan-wide distinctiveness
[PASS / FAIL — list any collisions resolved]

### Quality scores
All saved subjects ≥ 4★: <yes / no — list any bounded positions>

---
Curate and approve subjects in the dashboard at: Ideas → <period> (filter channel = ad). An approved
subject is the input to `/ssc.ads-brief <idea_id>` — the Brief step that fans it into angles across
the personas it fits. Approving ≥1 subject opens the Ideas gate; then re-invoke the agent to run
**Measure** (the final planning step — there is no Schedule step in the ad flow).
```

## Output

- One DRAFT subject per planned creative — sized to the plan's `creative_target` total — saved via `save_idea(channel='ad', plan_id, source='ai', status='draft', title=<persona-free subject>, score, comment)`. No `terms`, no ad-set link — subjects carry no structural tag.
- No gate flipped — subjects are drafts awaiting human curation
- Summary showing pool-size accuracy against `creative_target` and the plan-wide distinctiveness check result

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- **Title = the subject; nothing else.** The `title` is the bare tension/insight/myth/proof-territory as ONE concise Vietnamese line — no persona, no layer/tier, no value/frame/against/entry/experience code, no `/`-delimited structural string, no parenthetical taxonomy code, no slot/ad-set name.
- **No persona, no framing, no layer.** A subject is persona-free and tier-free by construction: `save_idea` is called with no `terms` at all. Choosing persona × route is the Brief step's job, run separately after a subject is approved — this skill never pre-assigns an archetype, a value/frame/against/entry/experience code, or a layer.
- **No finished copy.** Beyond the subject title, do NOT produce finished ad copy — no hook, headline, body, or CTA. This skill stops at the subject pool; angle derivation is the Brief step's job, finished copy is the Writer's.
- **NEVER writes `phase_status`, `monthly_plans`, `targets.ads`, or any ad-set/slot data** — those belonged to the retired shared-head and ad-set models. The skill writes only DRAFT ideas; it makes no other plan-state write.
- **No auto-approval.** The human operator curates and approves subjects in the dashboard (the Ideas gate is per-subject `approve(entity='idea', …)` → `status='approved'`). After the Ideas gate, the agent proceeds to the ungated **Measure** step — there is no Schedule step in the ad flow.
- **Gate = Approaches approved** (`plan.approaches_approved === true`, Step 1) — a plan-level flag, not a per-item curation gate. There is no ad-set gate left to check. If the plan is null or the gate is not cleared, STOP — do not load the KB or save any subject.
- References only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path — the structural docs the old ad-set/archetype machinery read (`brand/angles`, `ad/creative-guidelines`, `ad/layer-tones`, `ad/strategy`, `ad/awareness-framework`, `voice/founder-voice`) belong to the Brief step now, not Ideate.
- **Reads its total volume from `plan.creative_target`** — the persona × route coverage target Focus set — summing every row's `count`. Never from `ad_plan_slots`, `detail.creative_count_config`, or any per-ad-set count; that model is gone. If `creative_target` is absent or empty, STOP rather than invent a total.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires `edit` capability (plus `view` for the `get_channel_plan` and `get_knowledge` reads).
