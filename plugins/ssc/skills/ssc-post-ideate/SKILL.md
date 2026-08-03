---
name: ssc-post-ideate
description: >-
  Runs the IDEATE step of the Cambridge Diet Vietnam Posts channel in THREE ROUNDS, one per invocation, each ending at an operator checkpoint. Round 1 DISTRIBUTION proposes the month's pillar split with a suggested post count per pillar, writes it to the head via allocate_channel (propose-only, flips no gate, mints the channel row if absent) and STOPS; the operator accepts by saying so, by editing the numbers in the dashboard allocation panel, or simply by running the command again. Round 2 TITLES generates one titled draft idea per planned post via save_idea, sized exactly to the accepted distribution and audited for tag spread, diversity and near-duplicates, then STOPS so the operator can prune before any deeper work is spent. A title carries no mechanism: the mechanism is settled one step later, at the BRIEF. Round 2 also WITHHOLDS detail.mechanism from the save_idea call that mints the post's brief, deliberately and for a reason the skill states outright: a non-blank detail.mechanism mints that brief `approved` while a blank one mints it `draft`, and a skill must never self-approve a brief — the extra write in round 3 is the price of keeping every approval an operator action. Round 3 IS the post's BRIEF step: it enriches each surviving idea by dispatching ssc-brief-core for its HERO and its ONE angle — a post has exactly one angle, never a fan-out like ads — writes the hero via edit(entity='idea'), writes the five narrative fields onto the idea's single existing brief, DECLARES that angle's awareness_stage on it — a post HAS an awareness stage (only the media layer is ads-only), read live from craft/awareness-framework's awareness-level ladder and never from a remembered copy, persisted on BOTH paths (passed on save_brief when the brief is minted here, written as its own edit(entity='brief') patch when round 2 already minted it) — and writes the mechanism the core settled with edit(entity='brief', patch={ mechanism }), that Vietnamese sentence verbatim, as its own ordinary field patch carrying no status, no approved, no <gate>_approved and no gate. Then STOPS for approval. The guarantee is ONE ANGLE, ONE MECHANISM: the mechanism is settled at the angle brief and lives on briefs.mechanism, a real, writable field, which is where the writer and every later step read it. How it is settled — bank-first from the mechanisms table read live, grounded in an attributed voice-of-customer item from the approved Approaches doc, proof-routed from the period's stated inventory, dropped rather than softened when compliance refuses its only route — all lives in ssc-brief-core and is never restated here in a post-shaped copy. Sibling posts may settle mechanisms that do not cohere; nothing checks that. The mechanism is a condition of APPROVING an ad or post brief and never of drafting one — approve(entity='brief') refuses a blank one SERVER-SIDE, reporting field: 'mechanism' — and this skill neither enforces nor duplicates that bar: it holds no approval verb, and a brief whose angle came back below bar is still saved, kept and worked on, simply not put to the operator as ready. Provenance — the bank slug an angle drew from, or that it was authored at the brief — is REPORT-ONLY: no row holds it, so it stays in the run's report and never enters the Vietnamese mechanism sentence the brief and then the writer carry verbatim, a narrative field, or any idea field. The period's mechanism MIX — how concentrated a single mechanism is, and how much of the month argues from failure — is reported by ssc-kb-mechanism-harvest, measured over briefs. State-driven: it reads the head's allocation and the plan's ideas and works whichever round is open, so re-invoking always advances rather than repeating. What governs an IDEA is read live and never restated here — craft/doctrine §1 (the production chain an idea opens) in round 2, and craft/awareness-framework (awareness staging, and the boundary that the brief declares the stage while the writer picks the lead) in round 3; craft/doctrine §2 is read at the brief step by ssc-brief-core, and the per-asset floor and the set-level coverage verdict are deliberately not read, because this step produces neither. Round 3's angle — with the awareness stage declared alongside it — must clear the SOPHISTICATION read the approved Approaches doc carries once in its §1, a bar that is INHERITED and never derived here, that constrains the ANGLE (rewritten until it clears) and never the draft, and that is reported and unapplied where the doc states no read. An approved brief stays approved and usable: it is never re-opened, back-filled, re-approved or reported stale, and where one lacks a doctrinal input the run names it and invents nothing. A failed KB read STOPS the run, saves nothing, and names the document that could not be read. Gated on approaches_approved. Propose-only; every idea and every brief is a draft a human curates and approves, and the skill never flips a gate.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  orchestrates: [ssc-brief-core]
  tools: [get_month_plan, get_channel_plan, get_knowledge, search_knowledge, list_taxonomies, list_ideas, get_idea, list_briefs, allocate_channel, save_idea, save_brief, edit, delete]
---

# Post Ideate (`ssc-post-ideate`)

You run **Ideate** — step 2 of the Posts channel (**Approaches → Ideate →
Schedule**) — as **three rounds, one per invocation**, each ending at an operator
checkpoint:

| Round | Produces | Ends at |
|---|---|---|
| **1 · Distribution** | the month's pillar split, with a suggested post count per pillar | operator accepts, edits, or re-runs |
| **2 · Titles** | one titled DRAFT idea per planned post | operator prunes the list |
| **3 · Brief** | each surviving idea's HERO + its ONE angle + that angle's MECHANISM, written onto its single brief | operator approves the ideas and their briefs |

Rounds exist so effort follows commitment: no titles are written against a
distribution nobody accepted, and no hero, angle or mechanism work is spent on a
title the operator was going to delete.

You are propose-only. Every idea is a DRAFT, and so is the brief round 2 mints —
**deliberately** (see round 2). You NEVER call `approve` (the ONLY gated
promotion; the approval hook denies it to agents), never publish, never use
`edit` to demote or unapprove a row, and never flip a gate.

## Inputs

- `period` — the plan month, `YYYY-MM` (e.g. `2026-08`).

## Step 0: Read state and pick the round

Three reads, every invocation. Never assume a round from the conversation — a
fresh session has no memory of the last one, so the data decides.

```
Call: get_month_plan
  period: <period>
```

Hold `plan.id` (the head id) and **`plan.version`** — the version is your
`expected_version` for round 1's write, and a stale one writes nothing.

```
Call: get_channel_plan
  channel: post
  period: <period>
```

**Gate-check.** If `plan` is null **or** `plan.approaches_approved` is not
`true`, STOP and tell the operator:

> Approaches chưa được duyệt. Mở `/content/plan/<period>?tab=post&step=approaches`
> để duyệt Approaches trước khi chạy Ideate.

Then hold `plan.id` (the channel plan id), `plan.context` (the approved
Approaches — your primary steering), `plan.targets` and `plan.detail`.

**One thing you need later travels inside `plan.context` and nowhere else.** The
approved Approaches carries this month's **sophistication constraint**, stated
once in its **§1**. Hold it off this read: round 3 applies its bar. There is **no
second fetch** — this skill calls `get_strategy_brief` never and re-derives the
read never. Where the doc carries no §1 constraint line, there is no bar; that is
a fact you report where round 3 says to, never a gap you fill.

**What the approved Approaches owes the mechanism is its voice-of-customer
section** — the sanctioned source of the attributed customer quote every
mechanism is grounded in. That section is read by **`ssc-brief-core`**, out of
the `grounding` round 3 hands it — not by you, and not in rounds 1–2. The
mechanism itself is settled **one angle at a time, at the brief**: round 3, by
that core, against the `mechanisms` table read live there.

```
Call: list_ideas
  channel: post
```

`list_ideas` filters by `channel` / `status` / `track` only, so scope the result
to this plan yourself by keeping the rows whose `plan_id` matches the channel
plan id, and page with `after` (see 3a).

**Reading the allocation.** The head exposes it as `allocations[]` — one entry per
channel, each with `targets[]` (joined to taxonomy labels) and `detail`. The
per-channel `get_channel_plan` read returns the same `targets` / `detail` for this
channel alone. Either is fine; take the pillar rows from whichever you read, and
note that **`target_value` comes back as TEXT** — parse it before arithmetic.

**Round selection**, first match wins:

- **No pillar rows in `targets`** → **Round 1**.
- Pillar rows exist AND the plan's idea count is **below** the allocated total →
  **Round 2**.
- Idea count meets the total AND **≥1 idea lacks its angle** (no
  `core_message` / `hook_direction` on its brief) → **Round 3**.
- Every idea has its angle → nothing to do. Tell the operator Ideate is complete
  and to approve the ideas they want scheduled, then STOP.

A round is never skipped and never re-run once its output exists. If the operator
wants a round redone, they remove its output first (delete the drafts, or clear
the allocation in the panel) and re-invoke.

---

## Round 1 — Distribution

Propose **how many posts each pillar gets this month**, write it to the head, and
stop.

### 1a. Ground the split

Read, in this order — the same priority the whole channel runs on:

1. **The approved Approaches** (`plan.context`) — which pillars this month
   emphasises and why. This is the primary input; the split has to match the
   guidance the operator already approved.
2. **The head** — `tactics` for the month's themes and `performance_review` for
   the ranked terms with their `scale` / `maintain` / `drop` dispositions. A term
   marked `drop` does not get volume.
3. **The KB** — `content/pillars` for what each pillar is for, and
   `channels/facebook` for this channel's standing pillar ratio. The standing
   ratio is the default; the month's guidance is the reason to depart from it, and
   a departure gets a stated reason.

**A failed KB read STOPS the run.** `get_knowledge` reports an absent path in
`missing` rather than failing. If either document above comes back missing, STOP,
write **no** allocation, and tell the operator **which document** could not be
read. Never fall back to a remembered ratio, to prose in this file, or to a
previous run's reading — a remembered ratio is a guess, and it would ship as the
month's numbers.

### 1b. Resolve the pillar term ids

```
Call: list_taxonomies
  kind: pillar
```

**Pass leaf terms only.** The dimension has a **root row** — the one whose `code`
is null, carrying the dimension's own name — and it is not a pillar. Passing it is
a silent data defect: it creates a target against the dimension itself. Use only
the rows that carry a real `code`, and never hardcode an id.

### 1c. Size the month

Set a total that the cadence can actually carry — posts-per-week band × weeks in
the month — then distribute it across pillars per 1a. Every pillar the guidance
names gets a non-zero count; a pillar deliberately at zero is stated as such.

### 1d. Write it to the head

```
Call: allocate_channel
  month_plan_id: <head id>
  channel: post
  expected_version: <head version from Step 0>
  targets: [ { term_id: <leaf pillar id>, target_value: <count>, meta: { … } }, … ]
  detail: { postsPerWeekMin, postsPerWeekMax, totalTarget, formatMix }
```

Four properties of this call that decide whether it is safe:

- **`targets` is DELETE-then-INSERT.** Send the **complete** set every time. A
  term you leave out is **gone**, and a `meta` you leave off is **erased** — there
  is no partial update. Omitting `targets` entirely preserves the stored set;
  passing `[]` clears it.
- **`expected_version` guards the HEAD**, not the channel row. A stale value
  returns `stale_version` and writes nothing — re-read `get_month_plan` and retry
  once with the current version. The call **bumps the head version**, so if you
  ever allocate a second channel in one sitting, use the version this call
  returned.
- **It is propose-only** — sets no status, flips no gate, ever. Writing the
  allocation is not accepting it.
- It **mints** the `(post, period)` channel row as `draft` if absent.

`detail` keys are camelCase and post-specific. Do not send another channel's keys;
a mismatched payload is rejected whole.

### 1e. Stop for acceptance

```
## Ideate vòng 1 — Phân bổ trụ cột <period>

| Trụ cột | Số bài | Vì sao |
|---|---|---|
| <label> | <n> | <one line, traced to the Approaches or the head> |

**Tổng:** <N> bài · <min> đến <max> bài/tuần · định dạng: <mix>

Đã ghi vào kế hoạch tháng (trạng thái đề xuất, không mở cổng nào).

Ba cách để tiếp tục:
1. Nói "chấp nhận" rồi chạy lại lệnh.
2. Sửa số trong bảng phân bổ ở dashboard, rồi chạy lại lệnh.
3. Chạy lại lệnh luôn — chạy lại chính là chấp nhận.
```

Do **not** generate any idea in this invocation.

---

## Round 2 — Titles

Generate **one titled draft idea per planned post**, and nothing deeper.

### 2a. Load the creative KB

Read live, batching paths (`get_knowledge` takes a `paths` array of up to 20):
`content/pillars`, `brand/personas` plus **every** persona detail doc the roster
currently lists (resolve `<slug>` from each persona's taxonomy `code` with the
`chi-` prefix stripped — never a hardcoded list), `brand/angles`,
`brand/journey-stages`, `content/quick-checklist`, `rules/review-standards`,
`rules/banned-words`, `craft/doctrine` — **plus the ENTIRE `voice` category**,
loaded as `get_knowledge(categories: ["voice"])` rather than named paths.

**`craft/doctrine` §1 is what governs an IDEA here.** It is the production chain
an idea is the first link of — a title is not a topic, it is the thing an angle,
a brief and then an asset are written down from. Read it live; none of it is
restated here.

**§2 — the mechanism — is NOT this round's business.** It is read at the **brief**
step, in round 3, by `ssc-brief-core`, which is the only place a mechanism is
settled and the only place that judgement is made. A title carries no mechanism,
is checked against none, and is never delayed, shrunk, withheld or scored down
for want of one. The per-asset floor (`craft/copy-floor`) and the set-level
coverage verdict (`craft/coverage`) are **not** read in this step either — this
step produces neither an asset nor a set.

**A failed KB read STOPS the run.** Check `missing` on every call. If any document
named above is missing, STOP, save **no** idea, and tell the operator **which
document** could not be read. Do not proceed from prose in this file, from memory,
from a similar-looking doc, or from a previous run's reading; an unreadable
persona detail doc stops the run rather than silently shrinking the roster.

Load all of voice, never a subset — `voice/pronouns` is as load-bearing as
`voice/tone`, since it is what keeps a title from addressing the reader as "chị"
where the ruling says public posts use "bạn". Loading by category also means a
retired doc drops out on its own and a new one arrives without touching this list.

### 2b. Generate to the accepted counts, exactly

For each pillar, produce exactly its `target_value` titles. Each idea:

```
save_idea(
  channel  = 'post',
  plan_id  = <channel plan id>,
  source   = 'ai',
  title    = <natural Vietnamese title, specific to this month>,
  score    = <1-5, honest>,
  comment  = <one-line Vietnamese rationale for the score>,
  terms    = [ <pillar leaf id>, <persona>, <value>, <entry>, <frame>,
               <journey_stage>, <format> ]
)
```

Resolve every code → taxonomy id via `list_taxonomies` **once, up front**, and
build a `code → id` map per kind. `terms` carries **ids**, never codes. `save_idea`
always **INSERTS** — there is no upsert and no `id` argument — and always mints a
`draft`; status is not settable here.

**`track` needs `confidence`.** When you pass `track='experimental'` you must also
pass `confidence` (e.g. `medium`) — the tool schema does not say so and the write is
**rejected** without it. Mark the Approaches doc's named experiments experimental;
everything else is `proven`.

**The strategic dimensions live ONLY in `terms`.** `save_idea` takes no
`pillar`, `target_persona`, `hook_direction`, `core_message` or `format_decision`
argument — the schema does not declare them, so passing them is accepted and
**silently discarded**, leaving the idea with no pillar, persona or format at all.
If a dimension is not in `terms` as a leaf id, it did not save.

**Titles only this round.** Do not write `hero`, and do not write the narrative
fields — those are round 3, after the operator has pruned. A title carries enough
for the operator to judge whether the topic is worth keeping.

**A TITLE CARRIES NO MECHANISM.** The mechanism is settled one step later, at the
**brief**: round 3, by `ssc-brief-core`, against the `mechanisms` table read live
there. Never bend a title toward a mechanism, never score one down for lacking
one, and never delay, shrink or withhold a title on that ground.

**WITHHOLD `detail.mechanism` FROM THIS CALL — deliberately.** This is the rule in
round 2 a later editor is most likely to "optimise" away as a redundant round
trip, so the reason is stated here rather than left implicit. `save_idea` mints
the post's single brief as part of this call, and it reads `detail.mechanism`
while doing so:

- a **non-blank** `detail.mechanism` mints that brief **`approved`**;
- a **blank** one — the argument simply never passed — mints it **`draft`**.

Passing a mechanism here would therefore make this skill **self-approve a brief**,
which is the exact thing the plugin's propose-only invariant exists to prevent.
Worse, it would be invisible to every backstop: the approval hook governs the
`approve` / `unapprove` verbs, the four money-moving Meta tools, and an `edit`
whose patch carries an approval-bearing field — and a `save_idea` whose *side
effect* is an approval matches none of them. So round 2 passes **no `detail`
mechanism at all**, the brief mints `draft`, round 3 writes the mechanism with
`edit(entity='brief', patch={ mechanism })`, and a **human** approves the brief in
the dashboard. The extra call is the price of keeping every approval an operator
action; it is not a redundancy to collapse.

> **If `save_idea` rejects a title-only idea on validation**, add the minimum its
> validator demands and note in your summary which fields you were forced to fill
> early, so round 3 knows to deepen rather than assume them thin. Report the
> rejection rather than working around it silently.

### 2c. Audit spread and diversity

The thresholds live in `rules/review-standards` and `brand/angles`; those docs
win over anything inline here.

- **Pillar counts match the allocation exactly.** Any deviation is fixed before
  finishing.
- **Persona spread** follows the priority order in `brand/personas` /
  `brand/journey-stages` — weighted, not evenly split, and no persona the roster
  lists as selective gets volume it should not.
- **Frame variety**, **entry / value coverage**, and **journey-stage spread** per
  `brand/angles` and `rules/review-standards`.
- **Opening variety** — no single opening shape dominates the batch. The approved
  Approaches names this month's rule; the batch obeys it without every title
  reading identically.
- **Month-specificity** — each title is tied to this month; evergreen filler above
  the `rules/review-standards` threshold is replaced.
- **NEAR-DUPLICATE CHECK — compare the batch to ITSELF, not just to the axes.**
  Every audit above counts tag spread, and a straight duplicate passes all of
  them: two titles can sit in different pillars, carry different personas and
  different frames, and still be the same post. So read the titles against each
  other and ask of **every** pair: **would these two open on the same scene?**
  Same subject, same moment, same person doing the same thing at the same hour is
  ONE idea wearing two pillar labels — replace one with a different subject, do
  not keep both and hope the writer differentiates them. Titles carry no
  mechanism, so read **every** pair on its subject and its scene.
  *(2026-08 shipped "Người nhìn vào dữ liệu mỗi sáng" in P1 and "Chuyên viên mở
  dữ liệu ra xem trước khi nhắn" in P4 — the same 7am scene, a near-identical
  story moment, and every tag-spread check passed them.)*
- **No banned words** in any title. Zero tolerance, checked against
  `rules/banned-words`.

**The period's mechanism mix is reported by `ssc-kb-mechanism-harvest`**, measured
over the period's briefs, where a human is already looking at a whole period.
This round audits spread and diversity over titles, and reports no mechanism.

To fix an idea you saved **this run**: `delete(entity='idea', id, expected_version)`
then save one corrected replacement — never re-call `save_idea` hoping to update,
which creates a duplicate. Score-only fixes use
`edit(entity='idea', id, patch = { score, comment }, expected_version)`. A freshly
saved draft is at version 1. Only ever touch drafts **you** created in this run.

### 2d. Quality floor, then stop

No saved idea may stay at **≤ 3**. For each, delete it and generate a stronger
replacement **for the same pillar** so the counts hold; bound at **two attempts
per slot**, and if a slot still cannot reach 4, keep the best attempt and name it
in the summary. Never inflate a score to exit the loop.

```
## Ideate vòng 2 — Tiêu đề <period>

**Đã lưu:** <N> ý tưởng nháp, khớp phân bổ

| Trụ cột | Phân bổ | Đã lưu | Đạt |
|---|---|---|---|
| <label> | <n> | <n> | ✓ |

### Đa dạng
| Tiêu chí | Ngưỡng | Thực tế | Đạt |
|---|---|---|---|

### Cơ chế
Vòng này không chốt cơ chế nào — tiêu đề không mang cơ chế. Cơ chế được chốt ở
vòng 3, trên brief của từng ý tưởng. Brief của mỗi ý tưởng vừa được tạo ở trạng
thái **nháp** (`draft`) — đúng như thiết kế: kỹ năng này không tự duyệt brief bao
giờ.

Xem và loại bớt tiêu đề ở dashboard → Ideate. Xong thì chạy lại lệnh để sang
vòng 3 (hero, góc tiếp cận và cơ chế cho những tiêu đề còn lại).
```

Do **not** run round 3 in this invocation — its whole point is to run *after*
pruning.

---

## Round 3 — Hero, the one angle, and its mechanism

**This round IS the post's BRIEF step.** It is the post-channel equivalent of
`/ssc-ads-brief`: the place where the angle is settled, where the mechanism is
settled with it, and where both land on the idea's single brief.

Enrich each surviving idea. **A post has exactly ONE angle.** This is the
structural difference from ads: an ad subject fans out to one angle per fitting
persona × route because you run many creatives against it, while a post is one
post. Its single brief is what production is keyed on
(`/ssc-post <brief_id>`), so a second brief would mean a second post from
one topic and would break the distribution round 1 just set. **One angle
therefore means one mechanism** — the guarantee is *one angle, one mechanism*,
and this round settles that one mechanism and writes it to the angle's brief.

### 3a. Per idea, dispatch `ssc-brief-core`

**First, read the plan's WHOLE idea set completely — drafts and approved ideas
alike — because `list_ideas` PAGES.** It filters by channel and status but not by
plan, so scope by matching `plan_id`, sweep **every** status rather than the
approved one, **and follow `next_cursor` until it is null.** Round 3 runs
*before* approval, so an approved-only read would return the very rows this round
enriches least and miss the drafts it exists to enrich; the same full read is
what 3d's cross-idea repetition checks compare over. A single page silently
under-reports: on the 2026-08 run page one held 14 of the plan's ideas and page
two held the other 17, so stopping at page one would have left 17 posts with no
angle and reported the batch complete.

**The cursor parameter is `after`, and it takes an idea id.** Passing it as
`cursor` is **silently ignored** — the server returns page ONE again, with the
same `next_cursor`, which reads as a stuck cursor rather than as a rejected
argument. Hit live on the 2026-08 Schedule run. So **dedupe by `id` before
counting**: a mis-paged run yields the same page twice and a total that looks
plausible.

**Read `craft/awareness-framework` live before you choose an angle.** The angle
has to declare **what the reader already knows** — that is the awareness stage,
and its ladder and market-saturation sections are the vocabulary it is expressed
in. **§7.1** is the boundary this round works to: the **brief declares the stage**
and the **writer picks the lead** per asset, from the overlapping set §7's mapping
admits. The stage is expressed in that doc's own awareness-level ladder — its
**first section** (*Mức Nhận Thức*) — read there, never from a remembered rung
order. So declare a stage here — a real field 3c writes onto the brief, not a
note that lives only in this conversation — and **never** name a lead type, an
opening formula, or a hook shape for the writer — the overlap is where the writer's set
gets its variety, and fixing it here would freeze the one axis that changes the
first line. Same failed-read rule as round 2: if the doc comes back in `missing`,
**STOP**, write nothing, and name it.

**The mechanism is SETTLED BY `ssc-brief-core`, and its whole procedure lives
there.** How it is drawn — bank-first from the `mechanisms` table read live,
grounded in an attributed voice-of-customer item from the approved Approaches doc,
proof-routed from the period's stated inventory, dropped rather than softened when
`rules/compliance` refuses its only route, authored fresh only where nothing in
the bank fits and said so — is that skill's, together with the `craft/doctrine` §2
judgement it applies. **None of it is restated here in a post-shaped copy**, and
this round runs none of it itself: it holds no `list_mechanisms`, no
`get_mechanism`, and no voice-of-customer pass. Three structural facts you *do*
hold, because they decide which call you make and where the value lands:

- **One angle, one mechanism.** A post has exactly one angle, so it settles
  exactly one mechanism.
- **`briefs.mechanism` is its home, and it is a real, writable field.** **You**
  write it, in 3c, with `edit(entity='brief', patch={ mechanism })`; the core
  holds no mutation tool.
- **The requirement bites at APPROVAL, never at drafting.**
  `approve(entity='brief')` refuses an `ad` or `post` brief whose `mechanism` is
  blank, reporting `field: 'mechanism'`. That is enforced **server-side**; you
  neither enforce nor duplicate it, and you hold no approval verb. A brief whose
  angle came back below bar is still saved, kept and worked on.

**Sibling posts may settle mechanisms that do not cohere, and nothing checks it.**
Each brief settles on its own grounding. Never re-open, re-run, re-score or report
as stale one idea's brief because another settled something different.

**The angle clears the inherited sophistication bar — read it, never derive it.**
The approved Approaches (`plan.context`, held in Step 0) states this month's
sophistication constraint **once, in its §1**: the stage the quarter read, and
how indirect that read says this month's openings must be. That statement is the
bar. Take it from there and **nowhere else** — no `get_strategy_brief` call (this
skill holds none), no re-reading the quarter, no stage of your own. The quarter
authors the read, the head and the Approaches carry it down, and a stage derived
here would be a second position no operator ever approved. Judge the angle **and
the awareness stage you declare with it** against that read **in the read's own
terms**: §1 says what it demands, and this file restates no rung, no stage label
and no saturation ladder.

**The bar constrains the ANGLE, never the DRAFT.** An angle that does not clear
it is **rewritten until it does** — a different anchor, a different persona, a
different awareness stage, an opening that argues the mechanism rather than
asserting the benefit — and then the idea proceeds exactly like any other. Never
hold back, delay, shrink, drop or withhold an idea because of the bar, and never
leave an angle standing below it while putting the idea to the operator as ready.
Whichever bar you applied is stated in the 3d report.

**Where §1 says the read is not stated** — an explicit `NOT STATED`, or a doc
that carries no sophistication line at all — **say so and apply no bar.** Do not
assume a stage, do not infer one from the month's tactics or from last month's
posts, and do not read
the absence as licence to open as directly as you like. Report it on the 3d bar
line; filling that gap is the quarter's job, not this round's.

Work ideas one at a time. For each, choose the angle first — persona, route, the
concrete **anchor** it attacks (a belief, a trigger, an objection, a myth), and
the **awareness stage** the angle assumes — grounded in the approved Approaches,
in that persona's own detail doc, and in `craft/awareness-framework`, then
dispatch:

```
Dispatch: ssc-brief-core
  idea:        <the idea row, incl. tags and version>
  angle_count: 1
  angles:      [ { persona, route, anchor, awareness_stage } ]
  grounding:   <the approved Approaches + the KB docs already read>
  taken:       <this idea's briefs, plus its siblings' for cross-idea repetition>
```

It returns the **hero**, one scored field set, and a **`mechanisms` block** — one
entry for this idea's single angle, carrying the settled `mechanism` (the
Vietnamese sentence), its `provenance` (*drawn from `<slug>`*, or *authored at
the brief*), the attributed `voc` item it is grounded in, and its
`proof` route. **That block is never omitted and never partial**: an angle for
which no defensible mechanism could be settled appears in it as **below bar, with
the reason**, so "no mechanism settled" and "mechanism not reported" can never
read the same.

**You own the save; the core wrote nothing.** In 3c you write that sentence
**verbatim** with `edit(entity='brief', patch={ mechanism })`, as its **own**
ordinary field patch: no `status`, no `approved`, no `<gate>_approved` and no
`gate` ever travels with it. Patching this field is ordinary draft authoring — it
flips no gate and promotes nothing.

**`provenance` is REPORT-ONLY.** There is no `briefs.mechanism_slug` column: the
brief holds the Vietnamese sentence and nothing else. So the slug lives in the 3d
report and nowhere else — never inside the mechanism sentence (the brief and then
the writer carry that string verbatim), never in a narrative field, never in
`angle_label`, and never onto any idea field. A value no consumer resolves is
worse than a value that was only reported.

**An angle the core returned below bar for is not filled in by you.** You author
no mechanism of your own, ever — not from the title, not from the grounding, not
as a placeholder. Write the brief's other fields, leave `mechanism` unwritten,
and name the angle in 3d as **not yet approvable — no mechanism settled**, with
the core's reason. The server will refuse `approve` on it, which is the bar
working.

### 3b. Write the hero

```
edit(entity = 'idea', id = <idea id>, patch = { hero: <hero> },
     expected_version = <idea version>)
```

Only when the hero is new or the core reported it changed. **Never overwrite an
operator's existing hero.** `edit` is a partial patch — put only `hero` in
`patch`, and never `status` (a `status` patch is a demotion and needs the
`approve` capability this skill does not hold) or any channel/lineage field. A
`stale_version` means re-read via `get_idea` and retry once.

### 3c. Write the angle and its mechanism onto the idea's ONE brief

`save_idea` already created a single brief per post idea. **Patch that brief; do
not create a second one.**

```
Call: list_briefs
  idea: <idea id>
```

- **Exactly one brief (the normal case)** → patch it with the five fields via
  `edit(entity='brief', id, expected_version, …)`.
- **No brief** → create one with `save_brief(idea_id, channel='post', …)`.
- **More than one** → do not add another and do not delete anything. Report it and
  let the operator resolve which is canonical; multiple briefs on a post idea
  means multiple production runs, which is the state this round exists to avoid.

Set the five narrative fields plus `persona_term_id` and `route_term_id` from the
angle. **Leave `angle_label` unset** — it is an ads field and is null for posts.
Pass a `score` and a Vietnamese `comment`. Never pass a status: promotion is
`approve`, which you do not hold.

**DECLARE THE ANGLE'S `awareness_stage` ON THE BRIEF — a post has one.** The
stage you chose in 3a is a **declared brief field on this channel**, not an
ads-only one: what an organic reader already knows is exactly as decidable as
what an ad's reader knows, and the writer cannot pick a lead from the
overlapping set without it. What a post has no analogue of is the media
**`layer`** — an organic post has no media home to declare — so
`target_layer_term_id` stays unset, exactly as `angle_label` does. Never let the
two travel together in your head: the stage is the post's, the layer is not.

**Take the value from the live ladder, never from memory.** The permitted stages
and what each one means are owned by `craft/awareness-framework` — the
awareness-level ladder is its **first section** (*Mức Nhận Thức*), already in
front of you from 3a's read. Match the angle to the rung that names what this
reader already knows, and send the spelling `save_brief`'s own `awareness_stage`
enum lists. **Never carry the ladder in from memory or from a copy of it kept
somewhere else**: a transcription of this exact ladder in another document was
numbered **backwards**, and silently inverted every value recorded against it. If
`craft/awareness-framework` came back in `missing` in 3a you have already
STOPped — there is no remembered fallback for a stage, and a guessed rung is
worse than an absent one.

**Where the value lands — both branches persist it.** `awareness_stage` is a
real, writable brief field on **either** path:

- **The `save_brief` branch** (the idea carries no brief) — pass
  `awareness_stage` on the call together with the five fields.
- **The `edit` branch** (the normal case — round 2's `save_idea` already minted
  the brief) — `edit(entity='brief')` **accepts `awareness_stage`**. Send it as
  its **own patch**, after the narrative patch and against the version that patch
  returned. Two calls, not one: the narrative fields and the stage are both
  ordinary fields, but keeping them separate means a rejection on either one
  cannot take the other down with it.

Verified live on 2026-08-02 across 30 briefs: `edit(entity='brief',
patch={awareness_stage})` returned success and bumped the row each time. Trust
the surface, not a remembered claim about what its allowlist accepts — a run that
only *declares* the stage and leaves it unpersisted ships a month of briefs with
an empty stage.

Never delete-and-replace the brief to force the field — a post brief is patched,
never discarded and regenerated (see *Facts that bite*) — and never mint a second
brief to carry it: a post gets exactly one.

**WRITE THE SETTLED MECHANISM — its own patch, the sentence verbatim.** The
`mechanisms` block the core returned in 3a carries this angle's one mechanism.
Write it:

```
edit(entity = 'brief', id = <brief id>, patch = { mechanism: <the sentence> },
     expected_version = <version the previous patch returned>)
```

Four things decide whether this call is safe:

- **Its own patch, after the narrative one and after the stage one**, against the
  version the previous patch returned. Three ordinary field patches, never one
  merged call: a rejection on any of them must not take the others down with it.
- **Only `mechanism` in `patch`.** Never `status`, never `approved`, never
  `<gate>_approved`, never `gate` — a patch carrying one of those is a governance
  action, and this skill holds no approval capability. Patching `mechanism` alone
  is ordinary draft authoring: it flips no gate and promotes nothing.
- **Verbatim.** Copy the core's Vietnamese sentence exactly. Do not paraphrase,
  sharpen, soften, shorten, re-translate or merge it — the brief and then the
  writer carry that one string, and it is the thing `core_message` is cashed out
  against.
- **`stale_version`** → re-read via `list_briefs` and retry once.

**This is the ONLY path a post's mechanism is written by, and the mint never
carries one.** Round 2 withheld `detail.mechanism` on purpose (see round 2), and
the same reason binds the fallback branch here: where 3c has to **create** the
brief with `save_brief`, create it **without** `mechanism` and then patch it with
the `edit` above. One write path, always an `edit`, always after the row exists —
so nothing this skill calls can mint an approved brief as a side effect.

**The brief is written TO that mechanism, and never restates it.** Every field you
set has to be consistent with it — `core_message` above all — and none of them may
restate, paraphrase, sharpen, soften, replace or contradict it. Writing *to* a
mechanism is not reproducing it; `craft/doctrine` §2 is where that distinction
lives, and `ssc-brief-core` reads it live — this file restates none of it. Never
add a sixth narrative field that paraphrases the mechanism: that is exactly how
one idea ends up arguing two things. The guarantee is **one angle, one
mechanism**.

**The mechanism goes on the brief and nowhere else.** Never into an idea field,
never into `core_message`, `comment` or `angle_label`, and never as provenance
smuggled into the sentence. The brief holds the sentence and nothing else — the
`slug` lives in the 3d report.

**Where the core returned the angle below bar**, leave `mechanism` unwritten. Do
not author one, do not reconstruct a plausible one from the title, and do not put
a placeholder in to clear the field. Write the brief's other fields, then name the
idea in 3d under **not yet approvable — no mechanism settled**, with the core's
reason. `approve(entity='brief')` will refuse it server-side with
`field: 'mechanism'`, which is the bar working, not a failure of this run.

### What a brief with no mechanism means

Run this over the enriched set once every surviving idea has its angle, and before
the 3d audit; 3d reports its result. It changes nothing that has been drafted or
written — it decides only what you tell the operator each idea is ready for.

**The rule, stated exactly:**

> A brief with no mechanism is drafted, saved, kept and given its hero, its angle
> and its awareness stage exactly like any other. What it is **not** is put to the
> operator as ready to approve. Nothing in drafting bends for a missing mechanism;
> approval-readiness is the only thing it gates — and that bar is held by the
> **server**, not by you.

Sort every idea you enriched this run into one of two lists, on what the run
actually settled:

- **READY TO APPROVE** — its brief carries the mechanism the core settled, written
  in 3c.
- **NOT YET APPROVABLE — no mechanism settled** — the core returned the angle
  below bar. Name, per idea, the reason it gave.

There is no third move. You do **not** go looking for a mechanism the core could
not settle, and you do **not** author one: the settling procedure, its bank read
and its `craft/doctrine` §2 judgement all live in `ssc-brief-core`, and a
mechanism authored here would have run none of them. If an angle can be improved,
the fix is to **rewrite the angle** and dispatch the core again — never to fill in
its output.

**Never invent a mechanism to move an idea into the first list.** An idea held
back honestly is this pass working; a fabricated mechanism defeats the requirement
outright, and a brief whose mechanism is invented cannot produce a post that
carries one.

**Two boundaries this pass does not cross:**

- **You do not approve, and you do not ask anyone to skip the gate.** Approval is
  the operator's act in the dashboard — on the idea, and on its brief. The
  server refuses `approve(entity='brief')` on an `ad` or `post` brief with a blank
  `mechanism`, reporting `field: 'mechanism'`; you neither enforce nor duplicate
  that, and you hold no approval verb.
- **An approved brief is left alone** (`craft/doctrine` §7, read live). It stays
  approved and usable, and is never re-opened, demoted, deleted, re-approved,
  back-filled or reported as stale — never list one as NOT YET APPROVABLE. Where
  one carries a blank `mechanism` or another absent doctrinal input, the 3d report
  **names** that input and the run invents nothing to fill it. This pass covers
  only rows that are not yet approved.

### 3d. Audit across the month, then stop

Before finishing, audit the enriched set as a whole — this is the last point where
cross-idea repetition is cheap to fix:

- No two ideas share an opening strategy.
- **No two share a `story_moment` — check it PAIRWISE, and start with the pairs
  whose briefs settled the same mechanism.** "No two share a shape" is not a
  thing you can see by reading down a list: the 2026-08 batch put the same 7am
  scene (an app screen still lit, a message not yet sent) on two ideas in
  different pillars, and the repetition was invisible until someone read the two
  arguments side by side. So for every mechanism two or more of this run's briefs
  settled — the run's own provenance lines show which drew from the same bank
  entry — read those ideas' `story_moment` and `hook_direction` **against each
  other** and rewrite one of any pair that opens on the same moment, the same
  person, the same hour. **This is a repetition check**: it compares openings, and
  counts nothing.
- `why_now` reasons are genuinely distinct.
- Persona × route spread matches the Approaches, and no pairing is over-used.
- Every idea's hero, fields and tags argue the same thing.
- Every idea's **declared awareness stage** is named AND landed on its brief.
  The stage is writable on both paths, so an idea finishing this round without
  one is a defect to fix here, not a gap to report.
- Every angle — and the stage declared with it — **clears the §1 sophistication
  bar**, or §1 stated no read and no bar was applied. An angle still sitting
  below the bar is rewritten now, not reported as an exception.
- **Every mechanism this run settled is landed AND reported.** Landed: written
  onto that idea's brief by 3c's `edit(entity='brief', patch={ mechanism })`,
  the core's sentence verbatim. Reported: named with its idea and its
  **provenance** — the bank `slug` it was drawn from, or that it was authored at
  the brief. An angle the core returned below bar has no mechanism to land and is
  reported with the core's reason instead.

**The period's mechanism MIX is `ssc-kb-mechanism-harvest`'s report**, measured
over the period's briefs, where a human is already looking at a whole period and
where an unapproved brief can still be changed. This round judges one angle at a
time and counts nothing across the period — never re-mechanise a brief to balance
a count.

Any set the core flagged **below bar** is reported with its reason, never
presented as passing.

```
## Ideate vòng 3 — Hero, góc tiếp cận và cơ chế <period>

**Đã làm giàu:** <N> ý tưởng · mỗi ý tưởng một góc, mỗi góc một cơ chế

| Tiêu đề | Persona × route | Hero (rút gọn) | Điểm |
|---|---|---|---|

### Đa dạng toàn tháng
- <one line per criterion>

### Bậc nhận thức đã khai (mỗi brief một bậc)
| Ý tưởng | Bậc nhận thức | Đã ghi vào brief? |
|---|---|---|
| <title> | <stage> | có (`save_brief`) / có (`edit(entity='brief')`) |
(Bậc nhận thức đọc sống từ `craft/awareness-framework`; không bậc nào được đoán.
Post không có `layer` — đó là trường của kênh quảng cáo.)

### Mức chặn độ tinh vi thị trường (thừa hưởng từ Approaches §1)
**Mức chặn đã áp:** <the §1 constraint, in the approved doc's own words> — mọi
góc tiếp cận trong lượt này đều đã vượt mức đó.
[hoặc: **Không có mức chặn:** Approaches §1 ghi `NOT STATED` (hoặc không có dòng
nào về độ tinh vi) — không áp mức chặn nào, không đoán bậc nào. Cần nêu ở bản
brief chiến lược quý.]
(Mức này thừa hưởng, không tự suy ra ở bước này; kỹ năng này không gọi
`get_strategy_brief`.)

### Cơ chế — đã chốt và đã ghi (mỗi góc một cơ chế)
| Ý tưởng | Cơ chế (đã ghi vào `briefs.mechanism`) | Nguồn gốc |
|---|---|---|
| <title> | <the sentence, verbatim as the core settled it> | rút từ ngân hàng: `<slug>` / soạn tại brief |
(Nguồn gốc chỉ tồn tại ở báo cáo này — không có cột nào lưu nó, nên không bao giờ
chèn `slug`, id hay nhãn vào câu cơ chế tiếng Việt, vào trường tự sự, vào
`angle_label`, hay lên bất kỳ trường nào của ý tưởng.)

**Sẵn sàng duyệt:** <n> / <N>
**Chưa duyệt được — chưa chốt được cơ chế:** <n>
| Ý tưởng | Lý do `ssc-brief-core` trả về dưới chuẩn |
|---|---|
| <title> | <the core's reason> |
(Không brief nào bị chặn ở khâu soạn thảo vì thiếu cơ chế — tất cả đều đã lưu, đã
có góc tiếp cận và bậc nhận thức. Cổng chặn nằm ở phía máy chủ:
`approve(entity='brief')` từ chối brief `ad`/`post` có cơ chế trống, báo
`field: 'mechanism'`. Kỹ năng này không duyệt gì cả, cũng không tự áp lại cổng đó.)

**Tỷ lệ cơ chế toàn kỳ (tập trung / sắc thái):** do `ssc-kb-mechanism-harvest`
báo cáo, tính trên toàn bộ brief của kỳ.

### Đầu vào học thuyết còn thiếu (dòng đã duyệt)
- <idea / brief> — <named absent input; nothing invented to fill it>
[hoặc: "không có"]

### Dưới chuẩn (nếu có)
- <idea> — <reason>

Duyệt các ý tưởng muốn lên lịch ở dashboard → Ideate, **và duyệt brief của chúng**
— brief được tạo ở trạng thái nháp là cố ý, để việc duyệt luôn là quyết định của
người vận hành. Duyệt ≥1 ý tưởng là mở cổng Ideas; sau đó chạy
`/ssc-post-plan <period>` để sang Schedule.
```

The mechanism block is reported in full every run, including when every angle
settled one — a silent pass reads the same as a pass that was never run. **The
sophistication-bar line obeys the same principle**, including when the bar was
`NOT STATED`: a missing bar line cannot be told apart from a bar that was never
applied. State `0` and state the absence rather than dropping either. **The
provenance column obeys it hardest** — provenance exists nowhere but this report,
so a column that is dropped is a fact that is gone.

Ideas listed as not yet approvable are **saved drafts with their angle and stage
written**; nothing about them is withheld, and the operator remains free to work
on them. Their briefs simply cannot be approved until a mechanism is settled —
that refusal is the server's.

## Facts that bite

Each of these cost a wrong write or a wasted round on the 2026-08 run.

- **The status the auto-created brief arrives at is decided by `detail.mechanism`
  on the `save_idea` that minted it.** A **non-blank** one mints the brief
  **`approved`**; a **blank** one mints it **`draft`**. Round 2 passes none, on
  purpose, so the normal state of a freshly minted post brief is **`draft`** and a
  human approves it. `delete(idea)` refuses with `idea_has_briefs`
  either way, because every post idea has a brief. A post brief is **patched**,
  never delete-and-replaced — a post gets exactly one — so do not plan a
  discard-and-regenerate loop in round 3. Patching narrative fields, the awareness
  stage or the mechanism is neither promotion nor demotion, so plain `edit`
  capability suffices.
- **`awareness_stage` is writable on BOTH paths — `save_brief` and `edit`.**
  `edit(entity='brief', patch={awareness_stage})` is accepted and persists
  (verified live 2026-08-02 across 30 briefs). Send it as its **own** patch after
  the narrative one, against the version that patch returned, so neither can take
  the other down. Round 3 therefore **declares AND persists** the stage; it never
  reports one as unpersisted.
- **`briefs.mechanism` is the mechanism's home** — a real, writable field, written
  here by `edit(entity='brief', patch={ mechanism })`, the core's Vietnamese
  sentence verbatim. Read it there and write it there; a brief carrying a blank
  `mechanism` is reported as such and the value is never reconstructed from
  anywhere else.
- **`detail.total_target` can disagree with the sum of the pillar values.** A panel
  edit moves one pillar without touching the total — seen live at 30 vs 31. The
  **pillar counts govern**, since they are what ideas are generated against. Report
  the mismatch; never silently reconcile it.
- **Score against ENGAGEMENT, not conversion.** This channel is graded on replies,
  saves and shares. A frame carrying no *paid* evidence can still be right here — an
  invitation the reader can act on alone is a strong organic shape precisely because
  replies are the metric. Marking such an idea down for lacking conversion data is a
  real error made on this run, and it came from reading a note about paid
  performance as if it bound organic.
- **Write literal Vietnamese, never `\uXXXX` escapes.** Hand-written escapes shipped
  two diacritic typos into operator-facing prose (`thứ` for `thử`, `Cẩn thọn` for
  `Cẩn thận`). A wrong diacritic is usually still a real word, so no banned-word or
  spell scan catches it.
- **The reader is `bạn`, never `chị`.** `voice/pronouns` carries a dated 06/2026
  ruling that public posts and paid ads both use `bạn`, with `chị` reserved for 1:1
  conversation and quoted testimonial. Its own quick-reference table still says
  "bạn / chị" for fanpage posts and is **stale** — the ruling wins. Titles written
  with `chị` as the address form had to be corrected by hand on this run.

## Output

- **Round 1** — the pillar distribution + post detail written to the head via
  `allocate_channel` (propose-only); the `(post, period)` row minted if absent
- **Round 2** — one titled DRAFT idea per planned post, tagged to the plan, each
  minting its single brief as a **`draft`** because `detail.mechanism` is
  deliberately withheld. A title carries no mechanism
- **Round 3** — a hero per idea; the five narrative fields on each idea's single
  brief; that angle's **declared awareness stage** (passed on `save_brief` where
  the brief is created here, otherwise written as its own `edit` patch); and
  **that angle's one settled mechanism**, returned by `ssc-brief-core` and written
  by this skill with `edit(entity='brief', patch={ mechanism })`, the sentence
  verbatim. Plus the split between briefs ready to approve and briefs whose angle
  came back below bar with the core's reason; each settled mechanism's
  **provenance** (the bank `slug`, or authored at the brief) — **report-only**,
  since no row carries it; the inherited sophistication bar the angles were judged
  against (or the stated absence of one); and any doctrinal input absent on an
  already-approved row, named and never invented
- No gate flipped in any round, and nothing approved — an unsettled mechanism
  costs a brief its place on the ready-to-approve list, never its draft
- The period's mechanism mix is `ssc-kb-mechanism-harvest`'s report

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle
  state in either direction — never call `approve` (the ONLY gated promotion; the
  approval hook denies it to agents, any entity, any gate), and never publish.
  Demotion is an `edit`, so the ban lives here: never use `edit` to demote,
  unapprove, discard, or reject a row. The generic `edit` / `delete` verbs may
  target ONLY draft rows this skill created in
  the current run, plus the idea's own single brief in round 3.
- **No auto-approval, and no approval as a SIDE EFFECT.** The Ideas gate is
  per-idea `approve(entity='idea', …)` and the brief gate is
  `approve(entity='brief', …)`; both are human dashboard actions. The side-effect
  path is the one to watch: `save_idea` mints the post's brief, and a non-blank
  `detail.mechanism` on that call mints it **`approved`**. Round 2 therefore
  passes none — see the withheld-mint rule below.
- **Always gate-check `approaches_approved` first.** Unapproved: no KB reads, no
  allocation write, no idea.
- **`allocate_channel` is propose-only and writes the head's allocation, not the
  channel's.** It sets no status and flips no gate. Round 1 uses it because the
  head is where the numbers live; writing them is not accepting them, and the
  operator remains free to edit them in the dashboard panel.
- **Never write `save_plan_targets` or a `detail` payload on `save_channel_plan`**
  — both are refused with `retired_plan_field` from `2026-08` onward. The
  allocation is reached through `allocate_channel` only.
- **A post gets exactly one angle.** Never fan out, never create a second brief on
  a post idea.
- **A TITLE CARRIES NO MECHANISM (hard rule).** Rounds 1–2 produce the
  distribution and the titles; the mechanism is settled at the **brief**, in round
  3. Never bend, delay, shrink, withhold or score down a title over a mechanism.
- **ROUND 2 WITHHOLDS `detail.mechanism` AT MINT, and the reason is stated in the
  round (hard rule).** `save_idea` mints the post's brief, and a **non-blank**
  `detail.mechanism` mints it **`approved`** while a **blank** one mints it
  **`draft`**. Passing one would make this skill **self-approve a brief** — the
  exact thing propose-only exists to prevent, and invisible to every backstop,
  since the approval hook governs the `approve` / `unapprove` verbs, the
  money-moving Meta tools and an `edit` carrying an approval-bearing field, and a
  `save_idea` whose *side effect* is an approval matches none of them. So round 2
  passes none, the brief mints `draft`, round 3 writes the mechanism with `edit`,
  and a **human** approves. Never "optimise" the extra call away.
- **The mechanism's home is `briefs.mechanism`; the guarantee is ONE ANGLE, ONE
  MECHANISM.** It is settled at the angle brief: `ssc-brief-core` settles it, one
  per angle, and **this skill writes it** with `edit(entity='brief', patch={ mechanism })`, the
  Vietnamese sentence verbatim, as its own ordinary field patch carrying no
  `status`, no `approved`, no `<gate>_approved` and no `gate`. That patch flips no
  gate and promotes nothing. The brief is written **to** that mechanism and never
  restates, paraphrases, sharpens, softens or contradicts it. Sibling posts may
  settle mechanisms that do not cohere; **nothing checks that**, and no brief is
  ever re-opened, re-run, re-scored or reported stale on that basis.
- **This skill authors NO mechanism of its own (hard rule).** The settling
  procedure — the live bank read, the voice-of-customer grounding, the
  proof-routing, the compliance drop, the `craft/doctrine` §2 judgement — lives in
  `ssc-brief-core` and is **never restated here in a post-shaped copy**. This
  skill holds no `list_mechanisms` and no `get_mechanism`. Where the core returns
  an angle below bar, `mechanism` is left unwritten and the reason is reported —
  never filled in, never reconstructed from the title, never a placeholder.
- **The mechanism gates APPROVAL, never DRAFTING, and the SERVER holds the gate.**
  `approve(entity='brief')` refuses an `ad` or `post` brief with a blank
  `mechanism`, reporting `field: 'mechanism'`; `youtube` is untouched. This skill
  neither enforces nor duplicates that bar and holds no approval verb. A brief
  with no mechanism is still saved, kept, given its hero, its angle and its
  awareness stage, and worked on — it is simply not put to the operator as ready.
  Never withhold, delay, shrink or refuse a draft for a missing mechanism, and
  never invent one to make a brief look ready.
- **Provenance is REPORT-ONLY (hard rule).** The brief holds the Vietnamese
  sentence and nothing else, so "drawn from `<slug>`" versus "authored at the
  brief" lives in the 3d report and nowhere else, and is **never** stuffed into
  the mechanism sentence, a narrative field, `angle_label`, or onto any idea
  field. A value no consumer resolves is worse than a value that was only
  reported.
- **The period's mechanism MIX is `ssc-kb-mechanism-harvest`'s report**, measured
  over the period's briefs. This skill judges one angle at a time and counts
  nothing across the period.
- **The sophistication bar is INHERITED, never derived.** It arrives in
  `plan.context` — the approved Approaches this skill already reads in Step 0 —
  stated once in its **§1**, and costs no second call: this skill never invokes
  `get_strategy_brief`. It bounds the **angle** and the awareness stage declared
  with it — an angle below it is rewritten, never a draft delayed, shrunk or
  withheld — and where §1 states no read, the round says so and applies no bar
  rather than assuming a stage. Neither the read nor the ladder behind it is
  restated in this file; both are read from the approved doc, live.
- **What the approved Approaches supplies the mechanism is its voice-of-customer
  section** — the sanctioned source of the attributed customer quote a mechanism
  is grounded in — read by `ssc-brief-core`, out of the `grounding` round 3
  passes it.
- **An approved row is left alone** (`craft/doctrine` §7, read live). An approved
  brief stays approved and usable, is never re-opened, demoted, deleted,
  re-approved, back-filled or reported as stale, and is never listed as not yet
  approvable. Work continues on it; where it carries a blank `mechanism` or
  another absent doctrinal input, the run's report **names** that input and
  **invents none**. Every new approval is held to the current bar.
- **Never hard-code KB content.** Name the doc and its section and read it live —
  the persona roster and each persona's triggers and prohibitions, the angle
  vocabulary, the review thresholds, the banned words. No persona names in closed
  lists, no remembered trigger, no baked-in pillar ratio.
- **The doctrine is read, never restated.** `craft/doctrine` **§1** (the production
  chain an idea opens) in round 2, and **§7** (non-retroactivity) plus
  `craft/awareness-framework` §7 + §7.1 (the awareness→lead mapping and the
  brief-declares / writer-picks boundary) in round 3, are named with their
  sections and read live. **§2 — the mechanism — is read at the BRIEF step by
  `ssc-brief-core`**, which is where a mechanism is settled and judged; this file
  restates none of it and this skill re-reads it for no purpose of its own. The
  per-asset floor (`craft/copy-floor`), the set-level coverage verdict
  (`craft/coverage`) and the close's wording rules (`craft/close-job`,
  `craft/cta`) are deliberately **not** read here — this step produces neither an
  asset nor a set, and an unused read only makes the load-bearing ones easier to
  skip.
- **Never declares a lead.** An angle declares the awareness stage; the writer
  picks the lead per asset (`craft/awareness-framework` §7.1). No round writes a
  lead type, an opening formula or a hook shape onto a brief.
- **A post brief DECLARES an awareness stage; it declares no layer.** The stage
  is chosen in 3a against the live ladder in `craft/awareness-framework`'s first
  section and declared in 3c — this channel is not exempt from it, and an absent
  stage is not this channel's normal state. `target_layer_term_id` is the
  ads-only half and stays unset: an organic post has no media home. A brief this
  run did not enrich keeps whatever stage it carries — a blank one stays valid, is
  never re-opened, and its absence is reported by whoever meets it, never repaired
  here.
- **A failed KB read STOPS the run** — in every round that names a document.
  Check `missing`, stop, save nothing, and **name the document** that could not be
  read. Never proceed from prose in this file, from memory, or from a cached or
  previous run's copy.
- **Never pass a dimension root as a term id** — only rows carrying a real `code`.
- Persisted prose is **Vietnamese**; operator-facing chat may be their language.
- Operates only on the post channel; never reads or writes `ad` / `youtube` state.
- Requires `edit` (plus `view` for the reads).
