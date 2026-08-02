---
name: ssc-plan-narrative
description: Runs the NARRATIVE step of the Cambridge Diet Vietnam monthly plan head — the LAST of the Plan stage's four steps (Review → Tactics → Research → Narrative) and the artifact carrying the month's ONLY approval. It does not add a fifth analysis; it makes the month APPROVABLE IN ONE READ. Per spec, approving the Narrative covers the WHOLE month — the Review reading, the themes, the research, AND all three channels' quantities — and releases every linked channel to author its Approaches, so this document must show what that approval actually covers. Synthesises the head's own artifacts (performance_review, tactics, research) plus the per-channel allocation state read via get_channel_plan into five short sections: what kind of month this is in one paragraph, the month's bets with each marked as a data-backed BET or an operator COMMITMENT (a commitment running against the evidence is named as such), a two-part COVERAGE VIEW separating what is ready to approve (Review / Tactics / Research) from what FOLLOWS approval (the three channel allocations, which run AFTER the Narrative and are never called a gap — approving is what releases them), the risks and thin evidence that could make the plan wrong, and a plain statement of what approving releases. It NEVER blocks on a missing step — ordering is presentational, not a chain of locks — but it reports a missing HEAD step (Review / Tactics / Research) prominently, while never mistaking the not-yet-run channel allocations for gaps: those come after, and telling the operator to fill them first inverts the pipeline. Deliberately the SHORTEST of the four steps (300–500 words): this is the read-before-approving document, and a long one turns the gate into a rubber stamp. Asks the operator nothing — the decisions were made in the earlier steps. Writes Vietnamese markdown to month_plans.narrative via save_month_plan. PROPOSE-ONLY AND NEVER APPROVES: it authors the artifact a human approves, and the approval hook denies agents approve(entity='month_plan') on any gate, always.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: plan
  capability: edit
  tools: [get_month_plan, get_channel_plan, get_strategy_brief, save_month_plan]
---

# Monthly Plan — Narrative (`ssc-plan-narrative`)

You run the **Narrative** step — the **last** of the Plan stage's four steps
(**Review → Tactics → Research → Narrative**) and the artifact that carries the
month's **only approval**.

**You are not writing a fifth analysis.** Review measured, Tactics decided,
Research scanned. Your job is to make the month **approvable in one read**.

## What approving this actually does

Per the governing spec, approving the Narrative:

- sets `narrative_approved = true` with `approved_at` / `approved_by`,
- **covers the whole month** — the Review reading, the themes, the research,
  **and all three channels' quantities**,
- **releases every linked channel** to author its Approaches step,
- and is the month's **only** approval. No other gate exists anywhere in the
  head.

That breadth is why this document exists. An operator is approving six things
with one click, so the document must show **what those six things currently
are** — including the ones that are missing.

## Inputs

- `period` — the month being planned, `YYYY-MM` (e.g. `2026-08`).
- `version` — the head's current version, for the optimistic-concurrency guard.
  Never assume it; use what the agent read.

## Step 1: Read everything the approval covers

**The head** — `get_month_plan(period)`:

- `performanceReview` — the Review (markdown)
- `tactics` — the month's themes (markdown)
- `research` — the outward scan (markdown)
- `narrative` — any existing draft you are replacing

**The channel allocations** — `get_channel_plan(period)` with **no channel
argument**, which fans out across every channel plan sharing the period. Returns
`{ plans: [...] }`, or an empty array when none exists yet.

You do **not** author allocations — the head's separate Post / Ad / YouTube
stages do. You **report** them, because approving covers them.

Optionally `get_strategy_brief(<quarter>, marked_only=true)` for the quarterly
frame, when the Narrative needs to place the month inside the quarter.

## Step 2: Channel allocation comes AFTER you — never call it a gap

**The three channel allocations run after the Narrative is approved, not before.**
This document is what **prepares and releases** them: approving it unlocks each
channel to set its quantities, and the spec has an allocation step **mint** its
`channel_plans` row when none exists. So an empty allocation state before approval
is the **expected** state, not a defect.

**Never present a missing allocation as a gap to close before approving**, and
never tell the operator to fill them first — that inverts the pipeline and stalls
the month on work that cannot correctly happen yet.

§3 therefore has **two parts**: what is ready to approve (Review / Tactics /
Research) and what follows from approval (Post / Ad / YouTube), the latter marked
as awaiting approval with a word on what each will set.

**A genuinely missing HEAD step is different.** No Review, no Tactics or no
Research *is* a gap — those precede you and the approval covers them. Mark such a
step `chưa có`, and when the month is substantially empty say so in §1 as the
first thing the operator reads.

**Ordering is presentational, not a chain of locks** — a missing head step never
stops you from writing the Narrative.

## Step 3: Separate BETS from COMMITMENTS

Tactics already tracks which themes rest on data and which on an operator
decision. **Carry that distinction through** — it is the single most useful thing
this document does for someone deciding whether to approve.

- **Bet** — backed by the Review or the quarterly strategy. Say what backs it.
- **Commitment** — an operator decision (an event, an obligation, a budget call).
  Say so.
- **A commitment running AGAINST the evidence must be named as such**, with the
  contrary evidence stated in one clause. That is not criticism of the decision;
  it is what makes the approval informed.

## Step 4: Write the report

```
Call: save_month_plan
  period: <period>
  narrative: "<the markdown document below>"
  expected_version: <the head's `version` from the get_month_plan read — OMIT when no head exists yet>
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

`narrative` is **markdown on the head**. It is the gated artifact, but **you do
not flip the gate** — see Governance.

### Report skeleton — Vietnamese, 300–500 words

**The shortest of the four steps.** This is what gets read immediately before an
approval; a long document turns the gate into a rubber stamp.

```markdown
# Câu Chuyện Tháng <period>

## 1. Tháng này là tháng gì
## 2. Chúng ta tin điều gì
## 3. Toàn cảnh tháng
## 4. Rủi ro & điều chưa chắc
## 5. Duyệt là duyệt những gì
```

**§1 — Tháng này là tháng gì.** One paragraph. If the operator reads only this,
they know what the month is for. **Characterise it, do not summarise the other
steps** — "a measurement-building month with a brand milestone deliberately kept
small" says more than a recap of three documents.

**§2 — Chúng ta tin điều gì.** The month's bets, one line each, each marked
**bet** or **commitment** with what backs it. Keep the order Tactics set; do not
re-rank.

**§3 — Toàn cảnh tháng.** Two tables, in this order.

**Ready to approve** — the head steps that precede you:

| Phần | Trạng thái |
|---|---|
| Soát hiệu quả (Review) | … |
| Định hướng (Tactics) | … |
| Nghiên cứu (Research) | … |

**Follows from approval** — never called a gap:

| Phần | Trạng thái |
|---|---|
| Phân bổ Post | Chờ duyệt — <what it will set> |
| Phân bổ Ad | Chờ duyệt — <what it will set> |
| Phân bổ YouTube | Chờ duyệt — <what it will set> |

Mark a missing **head** step `chưa có`; never leave a row blank and never omit a
row. Say in one line that the allocation steps are the plan's next work, which
approving this document opens.

**§4 — Rủi ro & điều chưa chắc.** What could make this plan wrong: thin samples,
provisional data, unattributable volume, a commitment running against evidence, a
missing step. Brief and specific — an operator should be able to weigh each in a
sentence.

**§5 — Duyệt là duyệt những gì.** Plain statement: approving fixes the month's
DIRECTION (the reading, the themes, the opportunities), releases all three
channels to set their quantities and then author their Approaches, and is the
month's only approval — there is no second gate anywhere. Because allocation
happens inside the direction just approved, approving is also approving in
advance the quantities that will be set under it.

### Validate the markdown before saving

The report **is** the column value, so a malformed table ships as the artifact.

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

## Operator questions

**Ask nothing.** Review measured, Tactics decided (with its own interview),
Research scanned. Narrative synthesises what already exists — a question here
re-opens a decision already made.

## Output

Report to the operator in their language:

1. What kind of month this is — §1, in a sentence.
2. **Which HEAD steps are missing**, if any — lead with this when the month is
   incomplete. Never list the channel allocations here; they follow approval.
3. Any **commitment running against the evidence**.
4. Where to approve it: `/content/plan/<period>` — and that approving releases
   all three channels.

**Never imply the month is ready when a HEAD step is missing** — your report is
the last thing read before a gate that releases three pipelines. Equally, never
imply the month is incomplete merely because allocation has not run: that is the
next step, not a defect.

## Governance

- **YOU NEVER APPROVE. This is the hardest rule in the step.** You author the
  artifact a human approves. **Never call `approve`** — the approval hook denies
  agents `approve(entity='month_plan')` on any gate, always, and attempting it is
  a governance violation, not a shortcut. Approval is a human action in the
  dashboard.
- **Writing the narrative is NOT approving it.** `save_month_plan` carries no
  status or approval field and can never mint or promote an approved head. The
  gate stays false until a human flips it.
- **Never use `edit` to demote or un-approve** either — demotion touches the
  approval field and needs the `approve` capability, which you do not hold.
- **Never write a `channel_plans` row.** You read allocations to report them; the
  head's Post / Ad / YouTube stages author them.
- **Never write `performance_review`, `tactics` or `research`** — those are the
  earlier steps' artifacts. You read them.
- **Write through `save_month_plan`, never around it.** The MCP tool is the only
  supported write path: it carries the capability check, the audit trail and the
  optimistic-concurrency guard. Never write the column by any other route, even
  when a tool schema looks stale or a document seems large — a write that skips
  those guards can look correct and still be unsafe. If the tool genuinely
  refuses, report that and stop rather than routing around it.
- **Never hard-code KB content.** Name the doc and its section and read it live.
- Persisted prose is **Vietnamese**. Operator-facing chat may be the operator's
  language.
