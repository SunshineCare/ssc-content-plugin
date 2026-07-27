---
name: ssc-plan-narrative
description: Runs the NARRATIVE step of the Cambridge Diet Vietnam monthly plan head — the LAST of the Plan stage's four steps (Review → Tactics → Research → Narrative) and the artifact carrying the month's ONLY approval. It does not add a fifth analysis; it makes the month APPROVABLE IN ONE READ. Per spec, approving the Narrative covers the WHOLE month — the Review reading, the themes, the research, AND all three channels' quantities — and releases every linked channel to author its Approaches, so this document must show what that approval actually covers. Synthesises the head's own artifacts (performance_review, tactics, research) plus the per-channel allocation state read via get_channel_plan into five short sections: what kind of month this is in one paragraph, the month's bets with each marked as a data-backed BET or an operator COMMITMENT (a commitment running against the evidence is named as such), a COVERAGE CHECKLIST showing which of the six approvable parts are present and which are missing, the risks and thin evidence that could make the plan wrong, and a plain statement of what approving releases. It NEVER blocks on a missing step — ordering is presentational, not a chain of locks — but it reports every gap prominently, because approving an incomplete month would release all three channels onto a half-built plan. Deliberately the SHORTEST of the four steps (300–500 words): this is the read-before-approving document, and a long one turns the gate into a rubber stamp. Asks the operator nothing — the decisions were made in the earlier steps. Writes Vietnamese markdown to month_plans.narrative via save_month_plan. PROPOSE-ONLY AND NEVER APPROVES: it authors the artifact a human approves, and the approval hook denies agents approve(entity='month_plan') on any gate, always.
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

## Step 2: Never block — but never hide a gap

**Ordering is presentational, not a chain of locks.** A missing Review, Research
or allocation does **not** stop you. Write the Narrative anyway.

**But an operator approving an incomplete month would release all three channels
onto a half-built plan.** So every gap goes in §3's checklist, plainly marked.
Silence here is the failure mode: a Narrative that reads complete over a month
that is not is worse than no Narrative at all.

If the month is substantially empty — no Review, no Tactics — say so in §1 as the
first thing the operator reads, not buried in the checklist.

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
```

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

**§3 — Toàn cảnh tháng.** The coverage checklist — what this approval covers and
what state each part is in:

| Phần | Trạng thái |
|---|---|
| Soát hiệu quả (Review) | … |
| Định hướng (Tactics) | … |
| Nghiên cứu (Research) | … |
| Phân bổ Post | … |
| Phân bổ Ad | … |
| Phân bổ YouTube | … |

Mark a missing part **`chưa có`** — never leave a row blank, and never omit a row
because it is empty. Six rows, always.

**§4 — Rủi ro & điều chưa chắc.** What could make this plan wrong: thin samples,
provisional data, unattributable volume, a commitment running against evidence, a
missing step. Brief and specific — an operator should be able to weigh each in a
sentence.

**§5 — Duyệt là duyệt những gì.** Plain statement: approving releases all three
channels to author their Approaches, covers everything in §3, and is the month's
only approval — there is no second gate anywhere.

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
2. **Which parts are missing**, if any. Lead with this when the month is
   incomplete; it is the thing that should stop an approval.
3. Any **commitment running against the evidence**.
4. Where to approve it: `/content/plan/<period>` — and that approving releases
   all three channels.

**Never imply the month is ready when §3 shows gaps.** Your report is the last
thing read before a gate that releases three pipelines.

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
