---
name: ssc-plan-tactics
description: Runs the TACTICS step of the Cambridge Diet Vietnam monthly plan head — the SECOND of the Plan stage's four steps (Review → Tactics → Research → Narrative), and the ONLY place the quarterly strategy and the monthly Review meet. Crosses the approved quarterly strategy brief (its approved directions + marked findings, read via get_strategy_brief) with the prior period's Review (month_plans.performance_review, markdown) to produce the month's THEMES — 3–5 cross-channel, directive one-liners — written as a Vietnamese markdown report to month_plans.tactics via save_month_plan. A theme with only a quarterly source is a strategy restatement; with only a monthly source it is a monthly reaction; BOTH is the point of the step, and an empty source column is left visible rather than hidden. Asks the operator AT MOST THREE questions, one at a time and never batched, and only about what no data can answer: Q1 business context (always — events, milestones, budget or staffing constraints, e.g. an anniversary), Q2 continuity-vs-correction (ONLY when the Review and the quarterly direction genuinely conflict), Q3 carry-over commitments (ONLY if Q1 surfaced an event). It NEVER asks what is readable — quarterly directions, what the Review found, which pillars are underweight. Operator answers become a THIRD traceable source column so a commitment-driven theme is visibly not a data finding. Themes are cross-channel and no channel_plans row carries its own; channels read this and decide their own Approaches. Also carries the month's explicit NON-GOALS (the Review's prohibitions must survive or they get re-litigated) and the measures next month's Review will judge each theme by, so themes stay falsifiable. Runs every month including a quarter's first, where the Review may be absent — the section stays and says so. Propose-only and UNGATED: it sets no approval flag; the month's single approval is the Narrative, a human dashboard action.
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

**The monthly Review** — `get_month_plan(period)` → `performanceReview`.

It is **markdown, not structured**, so read it as prose. Its **§6 handoff table**
was written to be directive and is your primary hook into it — each row names a
Plan-step consumer, and the rows addressed to **Tactics** are instructions to
you. Read §2 (the three lessons) and §4/§5 for the evidence behind them.

**No Review** (a quarter's first month, or the step has not run): proceed anyway.
The spec requires Tactics to run regardless. Say plainly in §3 that there is no
prior Review.

**Optional grounding, read live, never restated from memory:** `get_content_gaps`
for pillar balance, `list_taxonomies` for the live term rosters, and the KB
(`get_knowledge` / `search_knowledge`) for personas, pillars and the awareness
framework.

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

## Step 4: Write the report

```
Call: save_month_plan
  period: <period>
  tactics: "<the markdown document below>"
```

`tactics` is **markdown**, ungated, carried on `edit`. Nothing here is
machine-readable, so every instruction a later step needs must be **in the text**.

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
  re-check the cell counts.

## Output

Report to the operator in their language:

1. The **themes** — all of them, in one line each.
2. For each, **what it crosses** (quarterly / monthly / operator), naming any
   theme that rests on a single source.
3. The **non-goals** carried forward.
4. Where to review it: `/content/plan/<period>`.

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
- **Never hard-code KB content.** Name the doc and its section and read it live —
  personas, pillars, routes, the awareness framework. Rosters are open: a term
  added or retired must need no change to this skill.
- Persisted prose is **Vietnamese**. Operator-facing chat may be the operator's
  language.
