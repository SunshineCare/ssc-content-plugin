---
name: ssc-post-schedule
description: >-
  Builds the proposed publish calendar for the Cambridge Diet Vietnam Posts
  channel — its third and last step. Assigns each approved post idea one
  publish date in the month from the head's key dates and allocation plus
  rules/scheduling, sorting indirect-first on each brief's own mechanism
  where the Approaches asks for it. Writes it as a set via
  save_schedule_entries. Propose-only.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  tools: [get_knowledge, get_month_plan, get_channel_plan, get_strategy_brief, list_ideas, list_briefs, save_schedule_entries]
---

# Post Schedule (`ssc-post-schedule`)

You assign each **approved** post idea one publish date inside the plan month and
write the resulting calendar onto the post `channel_plan` as `schedule_entries`.
You arrange work that already exists — you never create, retitle, retag or
re-score an idea.

This is step **3 of 3** on the Posts channel (**Approaches → Ideate → Schedule**),
keyed on `channel_plans(channel='post', period=YYYY-MM)`, which hangs off that
period's `month_plans(period)` head. The month's only look-back is the next
month's head Review.

Propose-only: you write once, via `save_schedule_entries`, and stop. The operator
reviews and approves the calendar in the dashboard. You NEVER call `approve` (the
ONLY gated promotion; the approval hook denies it to agents), never publish, never
use `edit` to demote or unapprove a row, and never flip a gate.

## Grounding order — head, then quarter, then KB

| Tier | Source | What it decides here |
|---|---|---|
| **1** | `get_month_plan(period)` — the HEAD | The month's **key dates** (research §Lịch & thời điểm, plus any date the tactics name), and the **allocation**: `detail.posts_per_week_min/max`, `detail.format_mix`, and the pillar `targets` |
| **2** | `get_strategy_brief(<quarter>, marked_only=true)` | Only a quarter-level window the month did not restate (a campaign period, a seasonal push spanning months). It never moves a date the head pinned |
| **3** | `rules/scheduling` (KB, read live) | The mechanics the head does not speak to: pillar adjacency, posts-per-day cap, and the build-up / main / follow-up phasing around a key date |

Where two tiers disagree, **the higher tier wins and you say so in one line** —
never quietly pick. The common case: the head allocates 6–8 posts/week while
`rules/scheduling` allows up to 9. The head's band governs; report the narrowing.

## Inputs

- `period` — the plan month, format `YYYY-MM` (e.g. `2026-08`)

## Procedure

### Step 1: Read the head and check the release gate

```
Call: get_month_plan
  period: <period>
```

If `plan` is null or `plan.narrativeApproved` is not `true`, **STOP** — the month
is not released and nothing may be written:

> The month is not released. The Posts channel is released by the monthly plan's
> Narrative approval. Open /content/plan/<period> → Plan stage. Nothing was written.

Hold from the head:

- **`research`** — the calendar table (dates × event × what it opens) and the
  compliance constraints. **This is where key dates live.** The Approaches doc has
  no key-date section; do not look for one there.
- **`tactics`** — any direction that constrains *placement* (an anniversary kept
  small, a route expanded, a date deliberately not boosted).

**The server gates on this exact flag.** `replaceScheduleEntries` requires the
head's `narrative_approved` for a plan linked to a head (or resolved by period
post-cutover) and **does not consult the channel plan's root `approved` field**.
So a plan reading `approved: false` with `approaches_approved: true` is perfectly
schedulable. Never read the root flag, never report it as a blocker, and
disregard any tool description that says the write "REJECTS if the plan is not
yet `approved`".

### Step 1b: Read the quarter — briefly, and only for a multi-month window

```
Call: get_strategy_brief
  period: <quarter>          # 2026-08 → 2026-Q3
  marked_only: true
```

**This read usually changes nothing, and that is the expected result.** A calendar
is decided by the month: the head's research pins the dates and the allocation sets
the cadence. The one thing the quarter can add is a **window the month did not
restate** — a campaign or seasonal push that spans months and whose start or end
falls inside this one. If a marked finding names such a window, respect it when
placing posts; if none does, say "quý không thêm ràng buộc lịch" in the report and
move on. `{ brief: null }` is not a blocker.

It never moves a date the head pinned, and it never overrides the allocated cadence.

### Step 2: Read the channel plan and its allocation

```
Call: get_channel_plan
  channel: post
  period: <period>
```

**Gate-check:** if `plan` is null or `approaches_approved` is not `true`, STOP and
send the operator back to the Approaches step. A month can be released while the
channel's own creative HOW is still unapproved.

Hold `plan.id` (the `plan_id` you write with), `plan.version`, and the allocation:

- **`detail.posts_per_week_min` / `posts_per_week_max`** — the cadence band. This
  governs; `rules/scheduling` fills in only what it does not say.
- **`detail.format_mix`** — informational here. Format is fixed on each idea at
  Ideate; you do not change it. Use it only to avoid clustering one format.
- **`targets`** — the pillar counts. **`target_value` comes back as TEXT** (`"10"`,
  not `10`) — coerce before summing, or `"0" + "0"` quietly passes a numeric check.

**Allocation guard.** If the pillar `target_value`s sum to zero, or the band is
absent, STOP without writing and send the operator to Ideate round 1 — you cannot
enforce a cadence that was never set.

**Read the STORED numbers, never a remembered proposal.** Editing the allocation
panel is how an operator accepts or changes the split, so these are exactly the
values most likely to have moved. `detail.total_target` and the sum of the pillar
values can disagree, and `meta.reason` prose can contradict the value it sits on —
**the pillar `target_value`s govern**; report a mismatch rather than reconciling it
silently.

**Also hold `plan.context` — the approved Approaches document — off this same
response.** It costs nothing: the gate-check above already fetched it. Make **no
second call**, add **no tool**, and open **no additional KB doc** for it — the "You
need no other KB doc" line in Step 4 stays true.

From that document read **one thing only: the sophistication line in §1 (`Điều
chung cho mọi bài`)** — the numbered rule stating how indirect this month's openings
must be. It is **inherited, never derived**: the quarter authored the read, the
Approaches step carried it down, and you carry it further. You never infer, adjust,
upgrade or default a stage of your own, and you name §1 as where it came from when
you apply it.

- Where §1 records `NOT STATED`, or carries no sophistication line at all, that
  is a **fact**: apply no bar, make no sequencing claim, and say so in the report.
- Read nothing else from the document here. Pillars, personas, differentiation and
  format rules were already spent at Ideate; re-reading them at Schedule invites you
  to re-judge work you are only arranging. Key dates in particular are **not** here
  — see the trap stated in Step 1.

### Step 3: Read the approved ideas — page correctly

```
Call: list_ideas
  channel: post
  status: approved
  limit: 50
```

Keep only rows whose `plan_id` equals `plan.id` — `list_ideas` filters by channel
and status but **not** by plan.

**Paging: the cursor parameter is `after`, and it takes an idea id.** Pass
`after: <next_cursor>` to get the following page. Passing it as `cursor` is
**silently ignored** — the server returns page ONE again, with the same
`next_cursor`, which looks like a stuck cursor and quietly truncates your set. Keep
paging until `next_cursor` is null, then **dedupe by `id`** before counting: a
mis-paged run yields the same page twice and a count that looks plausible.

**Gate-check:** zero approved ideas for this plan → STOP and send the operator to
approve ideas (Ideate round 3's checkpoint). Never schedule a draft idea.

**Pillar lives in `tags`, not on the row.** There is no top-level `pillar` field.
Read each idea's pillar as the `tags` entry with `kind: "pillar"` (likewise
`format`, `persona`, `journey_stage`). A missing pillar tag is a data problem to
report, not one to guess at.

**Count drift is expected and is not an error.** The approved set is what the
operator curated; the allocation is what was planned. Schedule **what is approved**
and report the per-pillar delta in one line (e.g. `P1 5 approved vs 6 allocated`).
Never pad, drop, or duplicate an idea to make the numbers match.

### Step 3b: Read each idea's brief — the sort key, and only when §1 asks for one

The sequencing preference in Step 5 sorts on a **mechanism**, and a mechanism lives
on `briefs.mechanism`. The sort key is read off the brief.

**Skip this step entirely where §1 recorded `NOT STATED` or carried no
sophistication line.** With no read there is no ordering preference to apply (Step
5.3), so there is nothing to sort by and these calls buy nothing.

Otherwise, per approved idea:

```
Call: list_briefs
  idea: <idea id>
```

**`list_briefs` is scoped to ONE idea** — there is no plan-scoped brief listing — so
this is one call per approved idea and only that. A post idea has exactly one brief;
where a row somehow carries more than one, take none of them as that idea's
mechanism, report it, and let the other signals decide its place.

Each row carries the angle's own `mechanism` — the one Vietnamese sentence it argues
from — or `null`, plus the brief's `hook_direction`, `core_message` and
`awareness_stage`. Hold those four per idea and read nothing else here: you are
collecting a sort key, not re-judging a brief. You never write to a brief — no
`save_brief`, no `edit(entity='brief', …)` — and you never author, restate or
sharpen a mechanism; that is the brief step's work, already done.

**`mechanism: null` is an ordinary state, not an error.** An angle may not have
settled one yet. Such a brief is never re-opened, re-mechanised or reported stale — the absence
simply means that idea is placed on the other signals (Step 5.3), and the count of
such ideas is named once in the report.

### Step 4: Load the scheduling rules

```
Call: get_knowledge
  paths: ["rules/scheduling"]
```

Read it live every run; never work from a remembered version. It is the source of
truth for pillar adjacency, the per-day cap, week distribution, and the key-date
phase table. Where it conflicts with the head's allocation, the head wins (see the
grounding order).

You need no other KB doc. This step writes **no** brand prose — only dates and
short Vietnamese notes — so the voice and banned-word docs do not apply here.

### Step 5: Build the calendar

Assign exactly one date per approved idea, `YYYY-MM-DD` inside the plan month.
Every approved idea appears exactly once: no omissions, no duplicates.

**Order of work.** Pin first, then spread, then repair:

1. **Pin the key dates** from the head's research calendar. For each: one post
   **on** the date — the idea whose pillar and subject actually belong there, not
   the nearest one free — plus the build-up and follow-up posts in the windows
   `rules/scheduling` specifies. When two key-date windows overlap, the earlier
   date's build-up takes precedence.
2. **Honour a date's own constraint.** A national holiday the head says not to sell
   into takes a mechanism or story post, not a product/tools one. A date the head
   keeps deliberately small stays one post.
3. **Spread the remainder** across every day of the month including weekends —
   `rules/scheduling` prefers one post per day over clustering.

   **Sequencing preference (inside this step only).** Where §1's rule requires
   indirect openings this month, let the mechanism-led, more **indirect** posts take
   the earlier free days and let the more direct ones land later in the month. This decides only *which*
   remaining idea fills a free day.

   It is **subordinate to everything harder**: it never moves a post pinned to a key
   date, never displaces a build-up or follow-up post from its window (steps 1–2),
   and never survives a conflict with the adjacency repair (step 4) — those encode
   real constraints, this is a preference. When it collides with any of them, the
   preference loses, silently and without comment.

   Where §1 records `NOT STATED`, or carries no sophistication line, apply **no**
   ordering preference at all and assume no stage.

   **What you sort on — the BRIEF's own `mechanism`, never a derived one.** The
   mechanism lives on `briefs.mechanism`, so the value is the one Step 3b read off
   `list_briefs`. Sort on it where the
   idea's brief carries one: a mechanism-led idea is the more indirect one and takes
   the earlier free day. Where the brief's `mechanism` is `null`, judge how indirect
   the idea is from the other signals actually readable — the idea's `tags`
   (`journey_stage`, `frame`, `entry`) and the brief's `hook_direction`,
   `core_message` and `awareness_stage` — and never back-fill the gap by re-deriving
   a mechanism for it.
   **Never re-derive a mechanism to sort by.** A guessed mechanism used as a sort key is a silent,
   invisible error — nothing downstream can see it, and the resulting order reads as
   deliberate. If those signals do not separate two ideas, leave their order as the
   spread produced it and say nothing.
4. **Repair adjacency last.** No two consecutive days share a pillar; the last
   pillar of day N differs from the first of day N+1.

**Counting weeks: pro-rate the boundary weeks.** The per-week minimum applies to
**whole** Mon–Sun weeks inside the month. A month that opens on a Saturday leaves a
2-day first week, which cannot reach six and is not a violation — judge a partial
week by its daily rate, and say so explicitly in the cadence check instead of
reporting a FAIL you then explain away.

**What you must not touch.** Titles, tags, formats, scores and heroes are the
ideas' own. In particular `rules/scheduling` forbids embedding a literal date in a
title — if an approved title carries one, report it; do not edit the idea.

### Step 6: Re-read the gate, then write

**Immediately before writing**, re-read `get_month_plan(period)` and confirm
`narrativeApproved` is still `true`. Minutes pass between a read and a write, and
an operator acting in the dashboard in between is the normal case, not the
exception.

```
Call: save_schedule_entries
  plan_id: <plan.id>
  entries: [
    { idea_id: "<id>", publish_at: "<YYYY-MM-DD>T09:00:00+07:00",
      notes: "<ghi chú ngắn: ngày trọng điểm / dẫn vào / tiếp nối>" },
    …
  ]
```

- `publish_at` — ISO 8601 with the Vietnam offset. Use one consistent time of day
  (`09:00:00+07:00`) unless `rules/scheduling` says otherwise.
- `notes` — optional, **Vietnamese**, one short phrase. Use it only where the date
  carries a reason (key date, build-up, follow-up, holiday constraint). Leave it
  off ordinary days rather than writing filler.
- `status` — omit; the server defaults each row to `scheduled`.

**It is a SET (DELETE-then-INSERT).** Send the COMPLETE calendar in one call —
every approved idea, every time. A partial call silently deletes the entries you
left out. There is no per-entry patch.

The server validates neither idea membership nor that the dates fall inside the
month. Both are yours: verify before writing, because a wrong `idea_id` or an
out-of-month date is accepted and persisted.

### Step 7: Report

```
## Lịch đăng đề xuất — <period>

Bài đã xếp: <N> · nhịp <min>–<max> bài/tuần · <one line on any drift or conflict>

Thứ tự theo mức bão hòa: <mức bão hòa kế thừa từ mục 1 của tài liệu Hướng tiếp cận>
  — <quy tắc đã áp dụng, một dòng: bài thiên về cơ chế / gián tiếp xếp trước, bài
  trực diện xếp sau; xếp sau ngày trọng điểm và luật kề trụ cột>
  — cơ chế đọc từ brief của từng bài; <n>/<N> brief chưa có cơ chế, xếp theo tín
  hiệu khác

| Ngày | Thứ | Trụ cột | Định dạng | Tiêu đề | Ghi chú |
|---|---|---|---|---|---|

### Phân bổ tuần
| Tuần | Ngày | Số bài |   ← mark a boundary week as partial, with its daily rate

### Kiểm tra nhịp
| Ràng buộc | Ngưỡng | Kết quả |
| Cùng trụ cột 2 ngày liên tiếp | 0 | PASS/FAIL |
| Bài/tuần (tuần trọn) | <min>–<max> | PASS/FAIL |
| Ngày trọng điểm có bài | <n>/<n> | PASS/FAIL |
| Bài dẫn vào / tiếp nối | theo rules/scheduling | PASS/FAIL |
| Mọi bài đã duyệt được xếp đúng một lần | <N>/<N> | PASS/FAIL |
```

**The sophistication line is reported every run — one line, never omitted.** Where
§1 carried a read, name the read and the rule you applied. Where it recorded
`NOT STATED` or carried no such line, make **no** sequencing claim and say exactly
that:

> Thứ tự theo mức bão hòa: tài liệu Hướng tiếp cận không nêu mức bão hòa —
> không áp thứ tự theo cơ chế.

A run that says nothing here reads the same as a run where the rule was applied, so
silence is the one thing this line may not be.

Then tell the operator plainly: review and approve the calendar at
`/content/plan/<period>?tab=post&step=schedule`, which flips `schedule_approved`;
production then runs per post via `/ssc-post <brief_id>`.

Report a FAIL as a FAIL with the reason. A calendar that cannot satisfy every
constraint at once is a real finding the operator needs — never soften it, and
never move an idea outside the month to make a check pass.

## Output

- `schedule_entries` replaced as a SET on the post `channel_plan`, one row per
  approved idea, each with `idea_id`, an in-month `publish_at`, and `status`
  defaulting to `scheduled`
- The calendar, weekly distribution and cadence check, reported to the operator
- No gate flipped — `schedule_approved` is a dashboard-only human action

## Governance

- **Propose-only (hard rule).** The single write is `save_schedule_entries`. Never
  call `approve` (the ONLY gated promotion; the approval hook denies it to agents,
  any entity, any gate), never publish, never use `edit` to demote, unapprove,
  discard or reject a row, and never flip a gate. `schedule_approved` is the
  operator's act in the dashboard (`approve(entity='channel_plan', gate='schedule')`).
- **Never write anything but the calendar.** No `save_idea`, and no
  `edit(entity='idea', …)` (titles, tags, formats, heroes and scores belong to
  Ideate and to the operator), no `save_brief` and no `edit(entity='brief', …)` —
  the brief is read for its mechanism and never touched, and the mechanism itself is
  never authored, restated, sharpened or contradicted here — no
  `save_channel_plan`, no `save_month_plan`, no `allocate_channel`. The allocation
  is read here and written only by Ideate round 1.
- **Never write these fields.** `save_plan_targets` and a `detail` payload on
  `save_channel_plan` are refused with `retired_plan_field` from `2026-08` onward,
  and `channel_plans` carries no `tactics`, `tactics_approved` or `retrospective`.
- **Never read the channel plan's root `approved` flag**, and never gate on it. Release is
  the head's `narrative_approved`; the channel's own precondition is
  `approaches_approved` plus ≥1 approved idea.
- **Never derive a sophistication read, and never re-derive a mechanism to sort
  by.** The read is inherited from §1 of the approved Approaches doc, held off the
  `get_channel_plan` response Step 2 already fetches — no extra call, no extra tool,
  no extra KB doc. The **mechanism** is a different value with a different source: it
  lives on `briefs.mechanism` and is read per approved idea via `list_briefs`
  (parameter `idea`, Step 3b) — never off a remembered value, never invented. The
  sequencing judgement uses that brief's mechanism where it
  carries one and the other readable signals (the idea's `tags`, the brief's
  `hook_direction`, `core_message`, `awareness_stage`) where it does not; a guessed
  mechanism as a sort key is a silent error. No read stated → no bar, no ordering
  claim, no brief read at all, and the report says so.
- **The sequencing preference never outranks a constraint.** Key-date pins and the
  adjacency repair govern; the preference only picks which idea fills an already-free
  day, and it never moves a pinned post.
- **Never hard-code KB content.** Name the doc and read it live — the cadence
  thresholds, the adjacency rule and the key-date phase table are all
  `rules/scheduling`'s, and inline numbers here are illustrative only.
- Persisted `notes` are **Vietnamese**; the report to the operator may be their
  language.
- Operates only on `channel='post'`; never reads or writes `ad`/`youtube` state.
- Requires `edit` (plus `view` for the reads).
