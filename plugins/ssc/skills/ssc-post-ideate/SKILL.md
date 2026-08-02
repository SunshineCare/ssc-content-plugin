---
name: ssc-post-ideate
description: >-
  Runs the IDEATE step of the Cambridge Diet Vietnam Posts channel in THREE ROUNDS, one per invocation, each ending at an operator checkpoint. Round 1 DISTRIBUTION proposes the month's pillar split with a suggested post count per pillar, writes it to the head via allocate_channel (propose-only, flips no gate, mints the channel row if absent) and STOPS; the operator accepts by saying so, by editing the numbers in the dashboard allocation panel, or simply by running the command again. Round 2 TITLES generates one titled draft idea per planned post via save_idea, sized exactly to the accepted distribution and audited for spread and diversity, then STOPS so the operator can prune before any deeper work is spent. Round 3 ANGLE enriches each surviving idea by dispatching ssc-brief-core for its HERO and its ONE angle — a post has exactly one angle, never a fan-out like ads — writes the hero via edit(entity='idea') and the five narrative fields onto the idea's single existing brief, and DECLARES that angle's awareness_stage on it — a post HAS an awareness stage (only the media layer is ads-only), read live from craft/awareness-framework's awareness-level ladder and never from a remembered copy, persisted on BOTH paths - passed on save_brief when the brief is minted here, and written as its own edit(entity='brief') patch when round 2 already minted it; an existing brief IS back-filled, and the stage is never left merely declared. Then STOPS for approval. State-driven: it reads the head's allocation and the plan's ideas and works whichever round is open, so re-invoking always advances rather than repeating. What governs an IDEA is read live and never restated here — craft/doctrine (the production chain an idea opens, and the mandatory mechanism a title must leave reachable) in round 2, and craft/awareness-framework (awareness staging, and the boundary that the brief declares the stage while the writer picks the lead) in round 3; the per-asset floor and the set-level coverage verdict are deliberately not read, because this step produces neither. Each post idea carries ONE named MECHANISM, stored on the idea (never on the brief) and inherited by the single brief beneath it, which is written TO it and never restates or contradicts it — the mechanism is a condition of PROPOSING an idea as ready for approval, never a condition of drafting one, so an idea without one is still titled, saved, kept and given its angle. The month's candidate-mechanism SUPPLY and its SOPHISTICATION constraint both arrive inside the approved Approaches already read in step 0 (plan.context) — no second strategy-brief call and no re-derivation: round 2 carries a matching supply candidate's mechanism exactly as the approved doc words it and omits the argument where none matches, round 3's mechanism pass prefers that same supply while permitting an off-supply mechanism provided the report names it as off-supply, and round 3's angle — with the awareness stage declared alongside it — must clear the sophistication read the doc carries, a bar that is inherited and never derived here, that constrains the ANGLE (rewritten until it clears) and never the draft, and that is simply absent, reported and unapplied where the doc states no read. Ideas approved before this requirement landed are grandfathered: never re-opened, never back-filled, their absent doctrinal inputs named in the run's report and none invented. A failed KB read STOPS the run, saves nothing, and names the document that could not be read. Gated on approaches_approved. Propose-only; every idea is a draft a human curates and approves, and the skill never flips a gate.
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
| **3 · Angle** | each surviving idea's HERO + its ONE angle, written onto its single brief | operator approves the ideas |

Rounds exist so effort follows commitment: no titles are written against a
distribution nobody accepted, and no hero or angle work is spent on a title the
operator was going to delete.

You are propose-only. Every idea is a DRAFT. You NEVER call `approve` (the ONLY
gated promotion; the approval hook denies it to agents), never publish, never use
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

**Two things you need later travel inside `plan.context` and nowhere else.** The
approved Approaches carries this month's **sophistication constraint**, stated
once in its **§1**, and the period's **candidate-mechanism supply**, in its
**§3**. Hold both off this read: round 2 draws on §3, round 3 applies §1's bar
and draws on §3 again. There is **no second fetch for either** — this skill calls
`get_strategy_brief` never, and re-derives neither the read nor a candidate. A
doc approved before those sections existed simply has no §1 constraint line and
no §3; that is a fact you report where each round says to, never a gap you fill.

```
Call: list_ideas
  channel: post
  plan: <channel plan id>
```

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

**`craft/doctrine` is what governs an IDEA here.** **§1** is the production chain
an idea is the first link of — a title is not a topic, it is the thing an angle,
a brief and then an asset are written down from — and **§2** defines the
**mandatory mechanism**: what a mechanism is (why the thing works, or why past
attempts fail) and what writing *to* one means. That is the doc `ssc-brief-core`
applies in round 3, so a title minted here has to leave a real mechanism
reachable rather than naming a subject and hoping one turns up. Read it live; §2
is deliberately not restated here. The per-asset floor (`craft/copy-floor`) and
the set-level coverage verdict (`craft/coverage`) are **not** read in this step —
this step produces neither an asset nor a set.

**A failed KB read STOPS the run.** Check `missing` on every call. If any document
named above is missing, STOP, save **no** idea, and tell the operator **which
document** could not be read. Do not proceed from prose in this file, from memory,
from a similar-looking doc, or from a previous run's reading; an unreadable
persona detail doc stops the run rather than silently shrinking the roster.

Load all of voice, never a subset. This skill previously named only `voice/tone`
and `voice/vietnamese-rules`, so `voice/pronouns` was never read and the 2026-08
titles addressed the reader as "chị" where the ruling says public posts use
"bạn". Loading by category also means a retired doc drops out on its own and a
new one arrives without touching this list.

### 2b. Generate to the accepted counts, exactly

For each pillar, produce exactly its `target_value` titles. Each idea:

```
save_idea(
  channel  = 'post',
  plan_id  = <channel plan id>,
  source   = 'ai',
  title    = <natural Vietnamese title, specific to this month>,
  mechanism = <this idea's ONE mechanism, in Vietnamese, one or two plain sentences —
               as `craft/doctrine` §2 defines and tests it. Where the title matches a
               candidate in the approved doc's §3, this is THAT candidate's mechanism,
               carried as the doc states it. Otherwise pass one ONLY when round 2's
               grounding already yields one. OMIT the argument entirely otherwise;
               never a placeholder, an empty string, or a restatement of the title>,
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
argument. An earlier version of this skill passed exactly those as top-level fields;
the schema does not declare them, so they were accepted and **silently discarded**,
and the ideas persisted with no pillar, persona or format at all. If a dimension is
not in `terms` as a leaf id, it did not save.

**Titles only this round.** Do not write `hero`, and do not write the narrative
fields — those are round 3, after the operator has pruned. A title carries enough
for the operator to judge whether the topic is worth keeping.

**`mechanism` is the one exception, and it is never required here.** It is an
idea-CORE field, not a narrative field, so it does not belong to round 3's brief
work — and `craft/doctrine` §2 (read live in 2a) puts the requirement at
**approval**, not at drafting, precisely because the drafting round is where a
mechanism gets found. So: carry one on `save_idea` when the grounding you have
already read genuinely yields one, and **omit the argument** when it does not.
Never delay, shrink or withhold a title for want of a mechanism, and never pass a
filler to clear a field — a fabricated mechanism is the single failure this whole
requirement exists to prevent. Whatever is still missing is settled in round 3's
mechanism pass, on the ideas that survived pruning.

**Look in the approved supply first — and CARRY what you find, never re-author
it.** The approved Approaches (`plan.context`, held in Step 0) carries the
period's candidate-mechanism supply in its **§3**. Before you decide a title has
no mechanism, check it against that supply. Where the title matches a candidate
there, pass **that candidate's mechanism, worded as the approved doc states it**
— this is a *carry*, not an authoring act, so do not paraphrase it, sharpen it,
soften it, shorten it, translate it into your own phrasing, or merge two
candidates into one sentence. The operator approved that wording; changing it
en route is how an approved supply quietly becomes an unapproved one.

**Where no candidate matches, omit the argument exactly as today.** Never bend a
title toward a candidate so it earns a mechanism, and never stretch a candidate
to cover a title it does not actually explain — either move is a fabrication
wearing an approved sentence. The supply is deliberately larger than the month's
post count, so candidates going unused is the supply working, not a coverage
failure; and a doc with no §3 (approved before the supply existed) simply means
every title takes the omit path, which is exactly today's behaviour. The rule
above is unchanged by any of this: **never delay, shrink or withhold a title for
want of a mechanism, and never pass filler to clear the field.**

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
- **MECHANISM SPREAD — count it, do not eyeball it.** Tally how many titles carry
  each §3 candidate. **No single mechanism may carry more than about a quarter of
  the batch**, and every §3 candidate that genuinely fits the month should appear
  at least once before any candidate is used a fourth time. Where the tally
  breaches the cap, first re-check whether the over-used candidate is really the
  best fit for each title carrying it (usually two or three are lazy matches);
  where the supply is simply too small to spread — fewer candidates than a quarter
  of the batch requires — **say so in the report as a supply gap, name the count,
  and do not invent mechanisms to pad the spread.** The fix for a thin supply is
  the next Approaches run, not fabricated mechanisms here. *(2026-08 shipped with
  one mechanism on 8 of 31 posts because nothing counted this.)*
- **No banned words** in any title. Zero tolerance, checked against
  `rules/banned-words`.

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

Xem và loại bớt tiêu đề ở dashboard → Ideate. Xong thì chạy lại lệnh để sang
vòng 3 (hero và góc tiếp cận cho những tiêu đề còn lại).
```

Do **not** run round 3 in this invocation — its whole point is to run *after*
pruning.

---

## Round 3 — Hero and the one angle

Enrich each surviving idea. **A post has exactly ONE angle.** This is the
structural difference from ads: an ad subject fans out to one angle per fitting
persona × route because you run many creatives against it, while a post is one
post. Its single brief is what production is keyed on
(`/ssc-post <brief_id>`), so a second brief would mean a second post from
one topic and would break the distribution round 1 just set.

### 3a. Per idea, dispatch `ssc-brief-core`

**First, read the approved set completely — `list_ideas` PAGES.** It filters by
channel and status but not by plan, so scope by matching `plan_id` **and follow
`next_cursor` until it is null.** A single page silently under-reports: on the
2026-08 run page one held 14 of the plan's approved ideas and page two held the
other 17, so stopping at page one would have left 17 posts with no angle and
reported the batch complete.

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

**Read `craft/doctrine` §2 live in this round too** — round 2 read it to keep a
mechanism reachable; this round is where one is actually settled, and where the
brief is written to it. Judge every mechanism against §2 as read live, never
against a remembered version: what qualifies, what does not, and how it is stated
all live there and are deliberately not restated in this file. Four structural
facts you *do* hold, because they decide which call you make and where the value
lands: **one idea, one mechanism**; it is stored **on the idea**, never on a
brief (`save_brief` / `edit(entity='brief')` carry no such field, by design); the
idea's single brief **inherits** it rather than authoring its own; and the
requirement bites at **approval**, not at drafting. Same failed-read rule — if
`craft/doctrine` comes back in `missing`, **STOP**, write nothing, and name it.

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
carrying no sophistication line at all because it was approved before the
constraint existed — **say so and apply no bar.** Do not assume a stage, do not
infer one from the month's tactics or from last month's posts, and do not read
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

It returns the **hero** and one scored field set. It writes nothing — every save
below is yours.

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

### 3c. Write the angle onto the idea's ONE brief

`save_idea` already created a single brief per post idea. **Patch that brief; do
not create a second one.**

```
Call: list_briefs
  idea_id: <idea id>
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
patch={awareness_stage})` returned success and bumped the row each time.

> **This paragraph used to say the opposite** — that the allowlist excluded
> `awareness_stage`, that a patch carrying it was refused whole, and that the
> normal round-3 path could therefore only *declare* the stage and leave it
> unpersisted. That was wrong, it was stated with false precision, and a whole
> month of briefs shipped with an empty stage because this file was believed over
> the server. **Never re-derive that claim from memory; the branch above is what
> the surface actually does.**

Never delete-and-replace the brief to force the field (the auto-created brief
refuses `delete` anyway — see *Facts that bite*), and never mint a second brief
to carry it: a post gets exactly one.

**The brief is written TO the idea's mechanism, and inherits it.** When the idea
carries one, every field you set has to be consistent with it — `core_message`
above all — and none of them may restate, paraphrase, sharpen, soften, replace or
contradict it. Writing *to* a mechanism is not reproducing it; `craft/doctrine`
§2 is where that distinction lives, read live in 3a. **Never write a mechanism
onto the brief** — there is no such field on a brief, and adding a sixth
narrative field that paraphrases it is exactly how one idea ends up arguing two
things. One idea, one mechanism, on the idea. An angle that only works by
supplying a *different* mechanism is the wrong angle for this idea: choose
another angle rather than re-mechanising the idea.

**When the mechanism is not in front of you, say so — do not reconstruct it.**
No read tool returns `mechanism` today (`get_idea` and `list_ideas` do not carry
the field on any channel), so you hold it only when you authored it in this run
or the operator stated it. Without it, write the angle on the rest of the
grounding, run every other check, and record in the 3d report that the
inheritance check could not be run for that idea and why. Never re-derive a
plausible mechanism from the title to check the brief against — a guessed
mechanism that the brief then agrees with is worse than an unchecked brief.

### The mechanism pass — what you may propose as ready for approval

Run this on the enriched set once every surviving idea has its angle, and before
the 3d audit; 3d reports its result. It changes nothing about what has already
been drafted or written — it decides only what you tell the operator each idea is
ready for.

**The rule, stated exactly:**

> An idea with no mechanism is titled, saved, kept, given its hero and given its
> angle exactly like any other. What it is **not** is put to the operator as
> ready to approve. Nothing in drafting bends for a missing mechanism;
> approval-readiness is the only thing it gates.

Walk every idea you enriched this run and sort it into one of two lists, judging
the mechanism against `craft/doctrine` §2 as read live in 3a:

- **READY TO APPROVE** — carries a mechanism §2 accepts, traceable to the
  approved Approaches or to a KB doc already read this run.
- **NOT YET APPROVABLE — mechanism missing** — none, or one §2 does not accept.
  Name, per idea, what is missing.

For each idea in the second list, do **one** of these, in this order:

1. **Find the mechanism — the approved supply FIRST.** Look in the approved
   Approaches doc's **§3**, the period's candidate-mechanism supply
   (`plan.context`, held in Step 0), before you look anywhere else. Where a
   candidate genuinely fits the idea, carry **that candidate's mechanism as the
   doc states it** — carried, not re-authored and not paraphrased, same rule as
   round 2. Where none fits, go back to the rest of the approved Approaches and
   the docs already read this run.

   **A mechanism outside the supply is PERMITTED.** The operator approved
   creative rails, not a closed list, and refusing an off-supply mechanism would
   stall a good idea behind an Approaches re-run. What it is not is silent:
   **every off-supply mechanism is named in the 3d report** — the idea, the
   mechanism, and why no §3 candidate fitted — so the operator can see which
   ideas went outside the doc they approved and feed that back into next month's
   Approaches. Never stretch a candidate to look like a match in order to stay
   "on supply"; a forced fit is the same fabrication as an invented mechanism,
   only harder to spot. If you find one §2 accepts, write it onto the idea:

   ```
   edit(entity = 'idea', id = <idea id>, patch = { mechanism: <the mechanism> },
        expected_version = <idea version>)
   ```

   Same call shape as 3b's hero write, and the same rules: partial patch, only
   `mechanism` in `patch`, never `status`, `stale_version` → re-read via
   `get_idea` and retry once. This is the correction path for a post idea —
   delete-and-replace is **not** available here, because every post idea has a
   brief and `delete(idea)` refuses with `idea_has_briefs` (see *Facts that
   bite*). Patching `mechanism` touches no approval field and promotes nothing.
   Do this **only** on an idea you created in this run and know carries none —
   the value is not readable back (see the third boundary below), so a patch on
   any other row is a blind overwrite.
2. **Leave it without one** and list it under NOT YET APPROVABLE, saying what
   would have to be established for it to become approvable.

**Never invent a mechanism to move an idea into the first list.** An idea held
back honestly is this pass working; a fabricated mechanism defeats the
requirement outright, and an idea whose mechanism is invented cannot produce a
post that carries one.

**Three boundaries this pass does not cross:**

- **You do not approve, and you do not ask anyone to skip the gate.** Approval is
  the operator's act in the dashboard, on ideas in both lists. Unlike the ad
  channel, the server applies **no** mechanism refusal to a post idea — so this
  pass and the operator are the only places the bar is held. That makes an honest
  list more important here, not less.
- **Ideas approved before this requirement are grandfathered** (`craft/doctrine`
  §7, read live). One carrying no mechanism stays approved, stays usable, and is
  never re-opened, demoted, deleted, re-approved, back-filled or reported as
  invalid — never list it as NOT YET APPROVABLE. If the run touches one, it says
  plainly in the 3d report that the idea predates the requirement and which
  doctrinal input is therefore absent, and it invents nothing to fill the gap.
  This pass covers only ideas that are not yet approved.
- **`mechanism` is WRITE-ONLY on today's tool surface — sort on what you wrote,
  never on an absence you cannot see.** `save_idea` and `edit(entity='idea')`
  both accept it and it is persisted, but **no read tool returns it**:
  `get_idea` and `list_ideas` carry `hero`, the tags and the brief fields, and no
  `mechanism` key at all, on any channel. So this pass is authoritative **only
  for the ideas whose mechanism you authored in this run** — those you know. For
  an idea enriched in an earlier run, you cannot tell a missing mechanism from an
  unreadable one: put it in **neither** list, report it as *not readable through
  the tool surface* and let the operator check the row. Never call it missing,
  and never `edit` a `mechanism` onto it — a blind write overwrites whatever is
  already there, including the operator's own. See *Facts that bite*.

  **The off-supply list inherits this boundary; it does not get a second one.**
  Reporting a mechanism as off-supply means comparing it against the approved
  §3 — which you can only do for a mechanism you can actually see. So the
  off-supply list is authoritative **only for the mechanisms you authored in
  this run**. An idea enriched in an earlier run appears in **neither** the
  off-supply list nor any on-supply count, for exactly the reason it appears in
  neither approval list: you cannot read its mechanism, so you cannot tell an
  off-supply one from an on-supply one from an absent one. It is reported under
  the same *not readable through the tool surface* line, and nothing about the
  supply is inferred for it.

### 3d. Audit across the month, then stop

Before finishing, audit the enriched set as a whole — this is the last point where
cross-idea repetition is cheap to fix:

- No two ideas share an opening strategy.
- No two share a `story_moment` shape.
- `why_now` reasons are genuinely distinct.
- Persona × route spread matches the Approaches, and no pairing is over-used.
- Every idea's hero, fields and tags argue the same thing.
- Every idea's **declared awareness stage** is named, together with whether it
  actually landed on the brief. A stage that could not be persisted is reported,
  never quietly dropped and never re-declared as if it had been saved.
- Every angle — and the stage declared with it — **clears the §1 sophistication
  bar**, or §1 stated no read and no bar was applied. An angle still sitting
  below the bar is rewritten now, not reported as an exception.
- Every mechanism **authored this run** is either traced to a §3 candidate or
  listed as off-supply. Ideas from earlier runs are in neither list (third
  boundary above).

Any set the core flagged **below bar** is reported with its reason, never
presented as passing.

```
## Ideate vòng 3 — Hero và góc tiếp cận <period>

**Đã làm giàu:** <N> ý tưởng · mỗi ý tưởng một góc

| Tiêu đề | Persona × route | Hero (rút gọn) | Điểm |
|---|---|---|---|

### Đa dạng toàn tháng
- <one line per criterion>

### Bậc nhận thức đã khai (mỗi brief một bậc)
| Ý tưởng | Bậc nhận thức | Đã ghi vào brief? |
|---|---|---|
| <title> | <stage> | có (`save_brief`) / chưa — `edit(entity='brief')` không nhận trường này, nhờ người vận hành đặt giúp |
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

### Cơ chế — sẵn sàng để duyệt
**Sẵn sàng duyệt:** <n> / <N>
**Chưa duyệt được — thiếu cơ chế:** <n>
| Ý tưởng | Còn thiếu gì |
|---|---|
| <title> | <what would have to be established> |
**Cơ chế ngoài danh sách đã duyệt:** <n>
| Ý tưởng | Cơ chế | Vì sao không ứng viên nào ở §3 phù hợp |
|---|---|---|
| <title> | <the mechanism, as written onto the idea> | <why no supply candidate fitted> |
(Ngoài danh sách là được phép — người vận hành duyệt định hướng, không duyệt một
danh sách đóng. Nêu ra đây để tháng sau bổ sung vào §3. Danh sách này chỉ đúng
với cơ chế viết trong lượt chạy NÀY: `mechanism` không đọc lại được qua tool, nên
ý tưởng từ lượt chạy trước không nằm ở danh sách nào.)
**Không đọc được cơ chế qua tool (ý tưởng từ lượt chạy trước):** <n> — <list>
(Không ý tưởng nào bị chặn ở khâu soạn thảo vì thiếu cơ chế; tất cả đều đã lưu và
đã có góc tiếp cận. Kỹ năng này không duyệt gì cả — duyệt là việc của người vận
hành trên dashboard.)

### Đầu vào học thuyết còn thiếu (ý tưởng đã duyệt trước khi có yêu cầu này)
- <idea> — <named absent input; nothing invented to fill it>
[hoặc: "không có"]

### Dưới chuẩn (nếu có)
- <idea> — <reason>

Duyệt các ý tưởng muốn lên lịch ở dashboard → Ideate. Duyệt ≥1 ý tưởng là mở cổng
Ideas; sau đó chạy `/ssc-post-plan <period>` để sang Schedule.
```

The mechanism block is reported in full every run, including when every idea is
ready — a silent pass reads the same as a pass that was never run. **The
sophistication-bar line and the off-supply block are reported every run on the
same principle**, including when the bar was `NOT STATED` and when no mechanism
went off-supply: a missing bar line cannot be told apart from a bar that was
never applied, and an absent off-supply block cannot be told apart from one
nobody checked. State `0` and state the absence rather than dropping either.

Ideas listed as not yet approvable are **saved drafts with their angle written**; nothing about
them is withheld, and the operator remains free to approve any of them.

## Facts that bite

Each of these cost a wrong write or a wasted round on the 2026-08 run.

- **The auto-created brief arrives `status: "approved"` with `approved_by: null`** —
  approved by the repo at idea-creation, not by any human act. So `delete(brief)`
  **refuses** on it, and `delete(idea)` refuses too (`idea_has_briefs`) because every
  post idea has one. A post brief can only ever be **patched**, never
  delete-and-replaced, so do not plan a discard-and-regenerate loop in round 3.
  Patching narrative fields is neither promotion nor demotion, so plain `edit`
  capability suffices.
- **`awareness_stage` is writable on BOTH paths — `save_brief` and `edit`.**
  `edit(entity='brief', patch={awareness_stage})` is accepted and persists
  (verified live 2026-08-02 across 30 briefs). Send it as its **own** patch after
  the narrative one, against the version that patch returned, so neither can take
  the other down. Round 3 therefore **declares AND persists** the stage; it never
  reports one as unpersisted. An earlier version of this file claimed the
  allowlist excluded the field and that any patch carrying it wrote nothing —
  that was false and cost a month of briefs their stage.
- **`mechanism` can be written but not read back.** `save_idea` accepts it on any
  channel and `edit(entity='idea', patch={ mechanism })` patches it, but no read
  tool returns it — `get_idea` and `list_ideas` expose `hero`, the tags and the
  brief fields and carry no `mechanism` key at all. So a mechanism written in one
  invocation is invisible to the next one, on this channel and on ads alike. Two
  consequences bind every round: never report an idea as mechanism-less on the
  strength of a read (you did not see an absence, you saw nothing), and never
  patch a `mechanism` onto a row you did not just create — the patch is a blind
  overwrite of a value you cannot inspect.
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
- **Round 2** — one titled DRAFT idea per planned post, tagged to the plan
- **Round 3** — a hero per idea and the five narrative fields on each idea's
  single brief, plus that angle's **declared awareness stage** (persisted when
  the brief is created here, otherwise written as its own `edit` patch),
  written to the idea's one mechanism; the mechanism pass's split
  between ideas ready to approve and ideas held back for a missing mechanism,
  plus any doctrinal input absent on a pre-existing approved idea, named and
  never invented; the inherited sophistication bar the angles were judged
  against (or the stated absence of one), and every mechanism authored this run
  that sits outside the approved supply, named with the reason no §3 candidate
  fitted
- No gate flipped in any round, and no idea approved — a missing mechanism costs
  an idea its place on the ready-to-approve list, never its draft

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle
  state in either direction — never call `approve` (the ONLY gated promotion; the
  approval hook denies it to agents, any entity, any gate), and never publish.
  Demotion is not a separate `unapprove_*` tool — it is an `edit`, so the ban
  lives here: never use `edit` to demote, unapprove, discard, or reject a row. The
  generic `edit` / `delete` verbs may target ONLY draft rows this skill created in
  the current run, plus the idea's own single brief in round 3.
- **No auto-approval.** The Ideas gate is per-idea `approve(entity='idea', …)`, a
  human dashboard action.
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
- **The mechanism gates APPROVAL-READINESS, never DRAFTING.** An idea with no
  mechanism is titled, saved, kept and given its hero and angle; it is simply not
  put to the operator as ready to approve (round 3's mechanism pass). Never
  withhold, delay, shrink or refuse a draft for a missing mechanism, and never
  invent one to make an idea look ready. What a mechanism *is* lives in
  `craft/doctrine` §2, read live; this file holds none of it.
- **The mechanism lives on the IDEA — one per idea, inherited by its brief.** It
  is written with `save_idea`'s `mechanism` argument, or patched with
  `edit(entity='idea', patch={ mechanism })`, which touches no approval field and
  promotes nothing. It is never written onto a brief and never varied per angle;
  the brief is written **to** it and never restates or contradicts it.
- **The supply is a source to PREFER, never a closed list; the sophistication
  bar is INHERITED, never derived.** Both arrive in `plan.context` — the approved
  Approaches this skill already reads in Step 0 — and neither costs a second
  call: this skill never invokes `get_strategy_brief` and re-derives neither.
  **§3** is the period's candidate-mechanism supply: round 2 and round 3's
  mechanism pass look there first and **carry** a fitting candidate's wording as
  the doc states it, never re-authoring or paraphrasing it; a mechanism outside
  §3 is permitted and is named as off-supply in the 3d report, and no candidate
  is ever stretched to force a match. **§1** carries this month's sophistication
  constraint: it bounds the **angle** and the awareness stage declared with it —
  an angle below it is rewritten, never a draft delayed, shrunk or withheld —
  and where §1 states no read, the round says so and applies no bar rather than
  assuming a stage. Neither the read nor the ladder behind it is restated in
  this file; both are read from the approved doc, live.
- **Ideas approved before this requirement are grandfathered** (`craft/doctrine`
  §7, read live). One carrying no mechanism stays approved and usable, is never
  re-opened, demoted, deleted, re-approved, back-filled or reported as invalid,
  and is never listed as not yet approvable. Work continues on it; the run's
  report **names** whichever doctrinal input is absent and **invents none**. New
  approvals are held to the new bar.
- **Approval-readiness is proposed here, never enforced here.** This skill cannot
  approve anything, and the server applies no mechanism refusal to a post idea —
  the bar is held by an honest list and by the operator's decision in the
  dashboard.
- **Never hard-code KB content.** Name the doc and its section and read it live —
  the persona roster and each persona's triggers and prohibitions, the angle
  vocabulary, the review thresholds, the banned words. No persona names in closed
  lists, no remembered trigger, no baked-in pillar ratio.
- **The doctrine is read, never restated.** `craft/doctrine` §1 (the production
  chain an idea opens) and §2 (the mandatory mechanism) in round 2, and in round 3
  `craft/doctrine` §2 again (the mechanism a brief inherits and is written to) and
  §7 (non-retroactivity) plus `craft/awareness-framework` §7 + §7.1 (the
  awareness→lead mapping and the brief-declares / writer-picks boundary), are
  named with their sections and read live. The per-asset floor (`craft/copy-floor`), the set-level coverage
  verdict (`craft/coverage`) and the close's wording rules (`craft/close-job`,
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
  ads-only half and stays unset: an organic post has no media home. Existing
  briefs are **not** back-filled — a legacy row carrying no stage stays valid, is
  never re-opened, and its absence is reported by whoever meets it, never
  repaired here.
- **A failed KB read STOPS the run** — in every round that names a document.
  Check `missing`, stop, save nothing, and **name the document** that could not be
  read. Never proceed from prose in this file, from memory, or from a cached or
  previous run's copy.
- **Never pass a dimension root as a term id** — only rows carrying a real `code`.
- Persisted prose is **Vietnamese**; operator-facing chat may be their language.
- Operates only on the post channel; never reads or writes `ad` / `youtube` state.
- Requires `edit` (plus `view` for the reads).
