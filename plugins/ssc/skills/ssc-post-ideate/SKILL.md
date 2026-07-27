---
name: ssc-post-ideate
description: >-
  Runs the IDEATE step of the Cambridge Diet Vietnam Posts channel in THREE ROUNDS, one per invocation, each ending at an operator checkpoint. Round 1 DISTRIBUTION proposes the month's pillar split with a suggested post count per pillar, writes it to the head via allocate_channel (propose-only, flips no gate, mints the channel row if absent) and STOPS; the operator accepts by saying so, by editing the numbers in the dashboard allocation panel, or simply by running the command again. Round 2 TITLES generates one titled draft idea per planned post via save_idea, sized exactly to the accepted distribution and audited for spread and diversity, then STOPS so the operator can prune before any deeper work is spent. Round 3 ANGLE enriches each surviving idea by dispatching ssc-brief-core for its HERO and its ONE angle — a post has exactly one angle, never a fan-out like ads — writes the hero via update_idea and the five narrative fields onto the idea's single existing brief, then STOPS for approval. State-driven: it reads the head's allocation and the plan's ideas and works whichever round is open, so re-invoking always advances rather than repeating. Gated on approaches_approved. Propose-only; every idea is a draft a human curates and approves, and the skill never flips a gate.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  orchestrates: [ssc-brief-core]
  tools: [get_month_plan, get_channel_plan, get_knowledge, search_knowledge, list_taxonomies, list_ideas, get_idea, list_briefs, allocate_channel, save_idea, update_idea, save_brief, edit, delete]
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
`brand/journey-stages`, `voice/tone`, `voice/vietnamese-rules`,
`content/quick-checklist`, `rules/review-standards`, `rules/banned-words`.

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
argument. An earlier version of this skill passed exactly those as top-level fields;
the schema does not declare them, so they were accepted and **silently discarded**,
and the ideas persisted with no pillar, persona or format at all. If a dimension is
not in `terms` as a leaf id, it did not save.

**Titles only this round.** Do not write `hero`, and do not write the narrative
fields — those are round 3, after the operator has pruned. A title carries enough
for the operator to judge whether the topic is worth keeping.

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
- **No banned words** in any title. Zero tolerance, checked against
  `rules/banned-words`.

To fix an idea you saved **this run**: `delete(entity='idea', id, expected_version)`
then save one corrected replacement — never re-call `save_idea` hoping to update,
which creates a duplicate. Score-only fixes use
`update_idea(id, score, comment, expected_version)`. A freshly saved draft is at
version 1. Only ever touch drafts **you** created in this run.

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
(`/ssc.post-writer <brief_id>`), so a second brief would mean a second post from
one topic and would break the distribution round 1 just set.

### 3a. Per idea, dispatch `ssc-brief-core`

**First, read the approved set completely — `list_ideas` PAGES.** It filters by
channel and status but not by plan, so scope by matching `plan_id` **and follow
`next_cursor` until it is null.** A single page silently under-reports: on the
2026-08 run page one held 14 of the plan's approved ideas and page two held the
other 17, so stopping at page one would have left 17 posts with no angle and
reported the batch complete.

Work ideas one at a time. For each, choose the angle first — persona, route, and
the concrete **anchor** it attacks (a belief, a trigger, an objection, a myth) —
grounded in the approved Approaches and in that persona's own detail doc, then
dispatch:

```
Dispatch: ssc-brief-core
  idea:        <the idea row, incl. tags and version>
  angle_count: 1
  angles:      [ { persona, route, anchor } ]
  grounding:   <the approved Approaches + the KB docs already read>
  taken:       <this idea's briefs, plus its siblings' for cross-idea repetition>
```

It returns the **hero** and one scored field set. It writes nothing — every save
below is yours.

### 3b. Write the hero

```
update_idea(id = <idea id>, hero = <hero>, expected_version = <idea version>)
```

Only when the hero is new or the core reported it changed. **Never overwrite an
operator's existing hero.** `update_idea` is a partial patch — pass only `hero`,
and never a status or channel. A `stale_version` means re-read via `get_idea` and
retry once.

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

### 3d. Audit across the month, then stop

Before finishing, audit the enriched set as a whole — this is the last point where
cross-idea repetition is cheap to fix:

- No two ideas share an opening strategy.
- No two share a `story_moment` shape.
- `why_now` reasons are genuinely distinct.
- Persona × route spread matches the Approaches, and no pairing is over-used.
- Every idea's hero, fields and tags argue the same thing.

Any set the core flagged **below bar** is reported with its reason, never
presented as passing.

```
## Ideate vòng 3 — Hero và góc tiếp cận <period>

**Đã làm giàu:** <N> ý tưởng · mỗi ý tưởng một góc

| Tiêu đề | Persona × route | Hero (rút gọn) | Điểm |
|---|---|---|---|

### Đa dạng toàn tháng
- <one line per criterion>

### Dưới chuẩn (nếu có)
- <idea> — <reason>

Duyệt các ý tưởng muốn lên lịch ở dashboard → Ideate. Duyệt ≥1 ý tưởng là mở cổng
Ideas; sau đó chạy `/ssc.post-plan <period>` để sang Schedule.
```

## Facts that bite

Each of these cost a wrong write or a wasted round on the 2026-08 run.

- **The auto-created brief arrives `status: "approved"` with `approved_by: null`** —
  approved by the repo at idea-creation, not by any human act. So `delete(brief)`
  **refuses** on it, and `delete(idea)` refuses too (`idea_has_briefs`) because every
  post idea has one. A post brief can only ever be **patched**, never
  delete-and-replaced, so do not plan a discard-and-regenerate loop in round 3.
  Patching narrative fields is neither promotion nor demotion, so plain `edit`
  capability suffices.
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
  single brief
- No gate flipped in any round

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
- **Never hard-code KB content.** Name the doc and its section and read it live —
  the persona roster and each persona's triggers and prohibitions, the angle
  vocabulary, the review thresholds, the banned words. No persona names in closed
  lists, no remembered trigger, no baked-in pillar ratio.
- **Never pass a dimension root as a term id** — only rows carrying a real `code`.
- Persisted prose is **Vietnamese**; operator-facing chat may be their language.
- Operates only on the post channel; never reads or writes `ad` / `youtube` state.
- Requires `edit` (plus `view` for the reads).
