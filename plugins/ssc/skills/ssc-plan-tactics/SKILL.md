---
name: ssc-plan-tactics
description: "Runs the TACTICS step of the Cambridge Diet Vietnam monthly plan head — the only place the quarterly strategy brief and the prior period's Review meet. Crosses them into the month's 3–5 cross-channel themes, plus the period's proof inventory and offer state, written to month_plans.tactics. Asks the operator at most three questions, one at a time. Ungated and propose-only."
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: plan
  capability: edit
  tools: [get_month_plan, get_strategy_brief, get_channel_plan, get_content_gaps, list_taxonomies, get_knowledge, search_knowledge, save_month_plan]
---

# Monthly Plan — Tactics (`ssc-plan-tactics`)

You run the **Tactics** step of the Cambridge Diet Vietnam monthly plan head —
the **second** of the Plan stage's four steps (**Review → Tactics → Research →
Narrative**).

**Tactics is the ONLY place the two altitudes meet.** The quarterly strategy sets
direction across a quarter; the monthly Review ranks one period at term level.
Neither alone is a plan for the month. You cross them into the month's
**themes** and write them to `month_plans.tactics`.

**A channel SHALL NOT author its own themes.** What you write here applies to
every linked channel; the channels read it and decide their own Approaches.

**You also state the month's two HAND-DOWNS** — the period's **proof inventory**
and its **offer/promotion state** (Step 4). They are not themes and they are not
prose: each is written into its **own** field on the same save, because the ads
channel has to read the inventory as a *set* to span its proof-device axis, and a
promotion buried in a paragraph is a timeliness claim nobody can check. The
**market-sophistication read is NOT yours** — the quarter authors it once and the
month inherits it (`ssc-plan-research` surfaces it).

## Inputs

- `period` — the month being planned, `YYYY-MM` (e.g. `2026-08`).
- `version` — the head's current version, for the optimistic-concurrency guard.
  Never assume it; use what the agent read.

## Step 1: Read both altitudes

**The quarterly strategy** — resolve the quarter from `period`
(`2026-08` → `2026-Q3`):

```
Call: get_strategy_brief
  period: <quarter>
  marked_only: true
```

Use the **approved directions** (`directions.themes`, `directions.dimensions`)
and the **marked findings** only. An unmarked finding was not curated and is not
strategy. If `directionsApproved` is false, say so — you are then crossing
against a draft, and the themes inherit that uncertainty.

**Hold the brief's `id`.** You are the only step of the Plan stage that reads the
quarterly brief AND writes the head, so you are the only one that can record
which brief this month was planned from. Carry the id to Step 5. If no brief
exists for the quarter, carry nothing — you still write the month (see Step 5).

**The monthly Review** — `get_month_plan(period)` → `performanceReview`.

The same call also publishes **what the period already states** for the two
hand-downs — `proofInventory` and `offerState` (camelCase on the read surface),
with an explicit `null` when nothing has been recorded. Read both before Step 4:
you are either stating them for the first time or revising what is there.
**`null` is a fact, not a failed read** — it means nothing has been stated yet,
and it never means "all devices available" or "there is a promotion we forgot".

It is **markdown, not structured**, so read it as prose. Its **§6 handoff table**
was written to be directive and is your primary hook into it — each row names a
Plan-step consumer, and the rows addressed to **Tactics** are instructions to
you. Read §2 (the three lessons) and §4/§5 for the evidence behind them.

**No Review** (a quarter's first month, or the step has not run): proceed anyway.
The spec requires Tactics to run regardless. Say plainly in §3 that there is no
prior Review.

**Optional grounding, read live, never restated from memory:** `get_content_gaps`
for pillar balance, and the KB (`get_knowledge` / `search_knowledge`) for
personas, pillars and the awareness framework.

**`list_taxonomies` is NOT optional** when you state a proof inventory — it is the
only source of the `proof_device` roster and its term ids (Step 4a).

## Step 2: Ask the operator — AT MOST THREE questions

**One question at a time. Never batch them.**

Ask **only** what the data cannot answer. **Never ask** what is readable: the
quarterly directions, what the Review found, which pillars are underweight, how
terms ranked. Asking a readable question wastes the operator's time and signals
you did not read.

**Q1 — Business context. ALWAYS ask.**

> "Tháng <N> có sự kiện, mốc, hoặc ràng buộc kinh doanh nào cần đưa vào định
> hướng không? (VD: kỷ niệm thành lập, ra mắt sản phẩm, thay đổi ngân sách…)"

This is the highest-value question: nothing in Brand OS carries it, and it can
invalidate an otherwise well-derived theme. A dated event also shapes **when** in
the month things run, not only what.

**This answer is also the ONLY source of `offer_state` (Step 4b).** If it names a
promotion, capture its customer-facing **name** and its **start and end dates** in
the same exchange — that is a clarification of the answer, not a fourth question.
A promotion the operator cannot date is **not** recorded: record nothing rather
than a dateless one, and never upgrade a seasonal opening or a milestone into a
promotion.

**Q2 — Continuity vs correction. ONLY when the Review and the quarterly
direction genuinely conflict.** Skip it when they agree — do not manufacture a
fork to fill a question slot.

> "<Review nói X>. Tháng này nên <đổi theo Review>, hay <giữ hướng quý>?"

**Q3 — Carry-over commitments. ONLY if Q1 surfaced an event or constraint.**

> "Có chủ đề nào phải xuất hiện trong tháng bất kể số liệu không?"

An event usually implies committed content that must run whatever the ranking
says. Capture it explicitly so it is never dressed up as data-driven.

**"Nothing special" ⇒ proceed and record that. Never re-ask.** If the operator
does not answer, proceed on the two data altitudes and say the operator input
was not supplied.

## Step 3: Cross, do not summarise

For each candidate theme, establish its sources:

| Source | Means |
|---|---|
| **Quý** | an approved direction or marked finding it advances |
| **Tháng** | a ranked term, observed pattern, or §6 instruction it responds to |
| **Vận hành** | an operator answer (event, budget, commitment) |

- **Quarterly-only** ⇒ a strategy restatement. Legitimate only when the month has
  no signal yet — and then say so.
- **Monthly-only** ⇒ a monthly reaction with no strategic anchor. Check it is not
  chasing a one-period blip.
- **Both** ⇒ the point of this step.
- **Operator-sourced** ⇒ a commitment, not a bet. It must be **visibly** so.

**Never restate the quarterly brief.** If a theme adds nothing to what the
quarter already said, it is not a monthly theme.

**Compress.** Quarterly themes are long analytical paragraphs carrying their
evidence inline. Monthly themes are **short and directive** — an operator should
be able to act on one without re-reading the strategy. If your themes read like
the quarterly brief, you have written a second strategy doc, not a month's plan.

## Step 4: State the period's two hand-downs

Two facts the ads channel **cannot verify for itself**, and neither of which is a
theme: which **proof devices** are available this period, and whether a **real,
dated promotion** exists. Both ride the same `save_month_plan` call as `tactics`,
each in **its own field** — `proof_inventory` and `offer_state`.

**Never fold either into `tactics`.** That field carries themes and only themes,
and it stays readable as themes. A hand-down folded into prose is unreadable to
the channel that has to act on it.

### 4a — `proof_inventory`: which proof devices you can actually supply

Read the roster live first:

```
Call: list_taxonomies
```

Work from the terms the **`proof_device`** kind returns, whatever they are. **Never
enumerate the proof families in this file, and never list them from memory in the
report** — the roster is deliberately open (a new proof device must need no change
to this skill), and the families themselves are owned by `brand/proof-points`,
which is read live by whoever needs their contents.

For each term the roster returns, ask **one** question: *can we actually supply
this device for this period* — is there a real, current trace behind it (a study,
a document, a testimonial we hold, the product paperwork)? Include only the terms
whose answer is yes.

```
  proof_inventory:
    terms: [<the proof_device TERM IDS available this period>]
    notes: "<Vietnamese prose — caveats, what is NOT available and why>"
```

- **`terms` are leaf taxonomy term ids** from the `list_taxonomies` call you just
  made — never codes, never labels, never hand-typed, never reused from memory
  across runs.
- **`notes` is optional** free Vietnamese prose. Use it for what is missing this
  period and why; a named absence is what next month acts on.

**When nothing is stated, OMIT the whole field.** Absence is a **GAP** the ads
channel reports plainly — it is never a default meaning "every device is
available", and you never invent an inventory to avoid an empty field. Do **not**
write `terms: []` to mean "not decided": an empty array is a positive statement
that **no** device is available this period, which is a different and much
stronger claim.

**An omitted field preserves what was already stored** — it does not clear it. So
when the inventory changes, re-state it in full; do not expect omission to remove
a device that is no longer supportable.

### 4b — `offer_state`: only a real, dated promotion

```
  offer_state:
    promotion: true
    label:     "<the promotion's name as the customer sees it>"
    startsOn:  "<YYYY-MM-DD>"
    endsOn:    "<YYYY-MM-DD>"
    notes:     "<Vietnamese prose — terms, exclusions>"
```

**Record a promotion ONLY when it is real and dated** — it has a name the customer
sees and a start and an end. Its source is the operator's business-context answer
(Step 2, Q1/Q3); nothing in Brand OS carries it. **Never derive one** from a
theme, a seasonal opening, a competitor's campaign or a calendar date. An undated
"sale" is not an offer state.

**If there is no promotion, record nothing. ABSENCE MEANS NONE.** Omit the field
and the channel carries **no** timeliness claim and neither infers nor invents
one. Writing `{ promotion: false }` is permitted and is stored distinctly from
absence — use it only to record that the question was **asked and answered no**.
It grants nothing extra: both absence and an explicit `false` mean *no promotion*,
and neither ever licenses a timeliness claim.

A stated promotion may be stated **once, as information**, downstream — that is the
channel's call under the urgency rule, not yours. Your job is only to state the
fact accurately, with its dates.

## Step 5: Write the report

```
Call: save_month_plan
  period: <period>
  tactics: "<the markdown document below>"
  proof_inventory:   <Step 4a — OMIT ENTIRELY when nothing is stated>
  offer_state:       <Step 4b — OMIT ENTIRELY when there is no promotion>
  strategy_brief_id: <Step 1's brief id — OMIT ENTIRELY when the quarter has no brief>
  expected_version:  <the head's `version` from Step 1's get_month_plan — OMIT when no head exists yet>
```

**`expected_version` is the head's optimistic-concurrency guard, and it is not
optional.** This write is an UPSERT keyed on `period`, so the guard is asymmetric:

- the head **already exists** (`get_month_plan` returned one) → pass the `version`
  you just read. Omitting it is refused with `expected_version_required` and
  nothing is written;
- **no head yet** (`get_month_plan` returned null) → pass NOTHING. Presenting a
  version for a period with no head is refused too — it means you believe you are
  updating something that is not there.

**Never assume or reuse a version.** Read the head immediately before writing and
pass that value. If the write is refused as `stale_version`, someone else (another
step, or the dashboard) wrote the head after you read it: **re-read the head,
re-apply your section to the fresh row, and write again**. Never blind-retry the
same version, and never drop your write because it was refused.

Note the difference from the fields above it: `expected_version` being absent is
NOT the "omission preserves" rule. An omitted hand-down means *nothing stated*; an
omitted version on an existing head means *refused*.

**`strategy_brief_id` records which quarterly brief this month was planned from.**
It rides this call, never a second one — the provenance lands in the same write as
the work it describes, so the two cannot disagree. Same omission rule as the
hand-downs: **no brief for the quarter → omit the parameter entirely.** The tool
patches only the fields you provide, so an omission preserves whatever the head
already carried and can never blank it. Never default it, never infer it from a
neighbouring period, never write a placeholder — a null is a truthful record that
none was recorded, and a wrong id is worse than an honest absence.

**An absent brief does not stop the month.** You run every month including a
quarter's first, where the Review may be absent too — write the themes, omit the
field, and name the absence in the report.

**Do NOT back-fill a head that already carries a null.** A month authored before
its brief was recorded was planned against a brief state you cannot reconstruct;
stamping today's id on it asserts something false.

**This is provenance, not plumbing.** No channel resolves the quarter through this
field — each derives the quarter from `period` and reads the brief directly, and
that is unchanged. You are recording what happened, not re-routing how anything is
read. Recording it sets no flag and moves no lifecycle state: Tactics stays
ungated and the month's single approval is still the Narrative.

`tactics` is **markdown**, ungated, carried on `edit`. Nothing in *it* is
machine-readable, so every instruction a later step needs must be **in the text**.
The two hand-downs are the exception and the reason they are separate fields: they
are structured, and the channel reads them as data, not as prose.

**The hand-downs are NOT sections of this report.** Do not restate the inventory
or the promotion as a theme — the fields are their record. §4 may note the
*consequence* of an absent promotion (no timeliness this month) as a non-goal.

### Report skeleton — Vietnamese, 400–700 words

Shorter than the Review: this is decisions, not evidence.

```markdown
# Kế Hoạch Tháng <period>

## 1. Định hướng tháng này
## 2. Căn cứ — chiến lược quý và hiệu quả tháng trước
## 3. Điều chỉnh so với tháng trước
## 4. Không ưu tiên tháng này
## 5. Thước đo cho tháng sau
```

**§1 — Định hướng tháng này.** The deliverable: **3–5 cross-channel themes**,
each one actionable sentence. Themes, not pillars or personas. **Cap at 5** —
more than five monthly themes is not a plan, it is a wish list. Fewer is fine
when the month is genuinely focused.

**§2 — Căn cứ.** The traceable crossing, one row per theme:

| Định hướng | Quý (chiến lược) | Tháng (Review) | Vận hành |
|---|---|---|---|

**Leave an empty cell visible** — write `—` and, in the prose beneath, say why.
A theme carrying quarterly direction with no monthly signal yet is legitimate and
must be readable as such. Hiding a gap is how a restatement gets mistaken for a
finding.

**§3 — Điều chỉnh so với tháng trước.** What the Review's §6 handed over, and
what changed because of it. This is where a measured finding becomes an
instruction. **With no prior Review**, the section stays and states
`chưa có Review kỳ trước`.

**§4 — Không ưu tiên tháng này.** Explicit non-goals. The Review's
**prohibitions** must survive into the month or they get re-litigated by whoever
reads the numbers next. A theme list without non-goals silently permits
everything. Carry each prohibition with its reason, briefly.

**§5 — Thước đo cho tháng sau.** For each theme, how next month's Review will
judge it — the lens and the metric, in that lens's own terms. Without this,
Tactics and Review drift apart and themes become unfalsifiable. Name a measure
that lens can actually produce; do not invent one.

### Validate the markdown before saving

The report **is** the column value, so a malformed table ships as the artifact —
there is no schema to catch it.

- **Every table row has the same cell count as its header.** A row with too many
  cells is almost always two rows fused by a newline that did not survive
  escaping.
- **No literal `\n`, `\t` or stray backslash sequences.**
- **A blank line before and after every table and heading.**
- **Compose the document in ONE piece.** Do not build it by string-replacing into
  an existing version through nested shells — that is where escaping breaks
  silently.
- **Verify what was STORED, not what you sent** — re-read the saved value and
  re-check the cell counts. Re-read the hand-downs too: `get_month_plan(period)`
  publishes them back as `proofInventory` / `offerState`, with an explicit `null`
  when unrecorded. A `null` where you intended to state something is a failed
  write, not an absence — say so rather than reporting the field as stated.

## Output

Report to the operator in their language:

1. The **themes** — all of them, in one line each.
2. For each, **what it crosses** (quarterly / monthly / operator), naming any
   theme that rests on a single source.
3. The **non-goals** carried forward.
4. The **two hand-downs**, one line each and stated as facts, not as themes:
   - `Kho chứng minh: <n thiết bị đã nêu | CHƯA NÊU — kênh Ads sẽ báo thiếu>`
   - `Khuyến mãi: <tên + ngày bắt đầu–kết thúc | không có>`

   Say plainly when either is unstated, and say what that means: an unstated
   inventory is a gap the ads channel will report, and no promotion means the
   month's copy carries no timeliness claim at all.
5. The **strategy provenance**, one line, naming what you recorded:
   - `Chiến lược quý: <brief id> (<quarter>) — đã ghi vào kế hoạch tháng`
   - or `Chiến lược quý: KHÔNG CÓ brief cho <quarter> — không ghi xuất xứ`

   Provenance the operator cannot see at the moment it is claimed is provenance
   nobody audits until it is already wrong.
6. Where to review it: `/content/plan/<period>`.

Say plainly which operator answers shaped the themes, and which themes are
commitments rather than bets — that distinction is the one most easily lost
downstream.

## Governance

- **Propose-only (hard rule).** Never call `approve` (the ONLY gated promotion —
  the approval hook denies it to agents, any entity, any gate), and never
  publish. Demotion is not a separate `unapprove_*` tool — it is an `edit`, and
  the server gates any patch touching an approval field on the `approve`
  capability, which you do NOT hold: never use `edit` to demote, unapprove,
  discard or reject a row.
- **Tactics is UNGATED.** It sets no approval flag and is not a second gate. The
  month has exactly one approval — the **Narrative**, flipped by a human via
  `approve(entity='month_plan', gate='narrative')`. Approving it covers the whole
  month and releases every linked channel.
- **Never write a `channel_plans` row.** Themes live on `month_plans.tactics`
  only; no channel carries its own. Channel allocation is the head's separate
  Post / Ad / YouTube stages, not this step.
- **Never write `performance_review`** — that is the Review step's artifact. You
  read it.
- **Never author the market-sophistication read.** `sophistication_stage` /
  `sophistication_read` live on the **quarterly** strategy brief, authored once
  there and inherited by the month. You do not hold `save_strategy_brief`, you do
  not derive a stage, and you do not restate one in `tactics`. A quarter with no
  read recorded is a gap reported by whoever reads it — never filled in here.
- **Never fold a hand-down into `tactics`.** `proof_inventory` and `offer_state`
  have their own fields for a reason; the themes field stays themes.
- **Absence is never a default (hard rule).** An omitted proof inventory is a GAP
  the ads channel reports — it never means every device is available. An omitted
  offer state means NO promotion. Never state a proof device you cannot supply,
  and never state a promotion that is not real and dated.
- **Write through `save_month_plan`, never around it.** The MCP tool is the only
  supported write path: it carries the capability check, the audit trail and the
  optimistic-concurrency guard. Never write the column by any other route, even
  when a tool schema looks stale or a document seems large — a write that skips
  those guards can look correct and still be unsafe. If the tool genuinely
  refuses, report that and stop rather than routing around it.
- **Never hard-code KB content.** Name the doc and its section and read it live —
  personas, pillars, routes, the awareness framework, and the proof families in
  `brand/proof-points`. Rosters are open: a term added or retired — including a
  **new proof device** — must need no change to this skill, so the `proof_device`
  roster is read live from `list_taxonomies` and never enumerated in this file or
  in the report.
- **A FAILED READ STOPS THE RUN.** If a KB doc you named comes back missing,
  empty or unreadable, or if `list_taxonomies` fails while you are building the
  proof inventory, STOP, write NOTHING, and tell the operator:

  > Không đọc được `<tài liệu / danh mục>`. Tactics dừng lại — bước này không chạy
  > bằng bản ghi nhớ. Vui lòng kiểm tra rồi chạy lại. Chưa ghi gì cả.

  Never substitute a remembered version and never guess a term id: a mistyped id
  is rejected outright, and a remembered roster silently overrides the live one.
- Persisted prose is **Vietnamese**. Operator-facing chat may be the operator's
  language.
