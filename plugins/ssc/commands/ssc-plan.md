---
argument-hint: '<YYYY-MM> [review|tactics|research|narrative]'
description: Author the Cambridge Diet Vietnam MONTHLY PLAN HEAD — the cross-channel month that sits above the per-channel plans. Four steps — Review → Tactics → Research → Narrative — keyed on month_plans(period). Review is the system's only look-back and ranks taxonomy terms, not metrics. Narrative is the month's ONLY gate; approving it releases every channel. State-driven; propose-only.
metadata:
  brand: cambridge-diet-vn
  section: plan
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, format `YYYY-MM` — the month being planned, e.g. `2026-08`). Required. This is the key the `month_plans` head is stored under.
- **Step** (`step`, optional — one of `review`, `tactics`, `research`, `narrative`) — names which of the Plan stage's four steps to work this invocation. The dashboard's per-step Cowork button emits it **positionally after the period** (`/ssc-plan <period> <step>`), so an operator standing on a given step copies a command that works THAT step. Omit it to run the next open step (plain state-driven pick).

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one. The token after the period (if any) is the `step`.

## What this command is

This is the **head of the monthly system** — the plan that owns everything above the channel. It runs on `month_plans(period)`, the single cross-channel row, and it is where the month is actually decided.

The monthly plan is authored in **four stages — Plan → Post → Ad → YouTube**. This command drives the **Plan** stage, which holds **four ordered steps**:

| Step | Writes | What it does |
|---|---|---|
| **Review** | `month_plans.performance_review` | The system's **only** look-back. Reads the **prior** period's page-side and ad-side performance and ranks **taxonomy terms** (pillar, persona, route, angle), each with a `scale` / `maintain` / `drop` disposition. Ranks terms, never metrics — per-channel metrics are not comparable across channels. |
| **Tactics** | `month_plans.tactics` | Crosses the approved **quarterly strategy brief** with Review's ranked terms into the month's **cross-channel themes**. The only place the two altitudes meet. |
| **Research** | `month_plans.research_id` | **One** outward signal pass per period — seasonal/cultural calendar, competitor and platform signals, audience triggers, emergent topics. No channel authors its own market research. |
| **Narrative** | `month_plans.narrative` | Written **last**, and the month's **ONLY** gate. Approving it releases every linked channel. |

**Ordering is presentational and semantic, not a chain of locks.** Every step stays freely editable until the Narrative is approved; no step must be complete before a later one is authored.

The Plan stage precedes the three channel stages because approving its Narrative is the single gate that releases them — the gate precedes what it gates.

## What this command is NOT

- **It does not allocate channel quantities.** The head's **Post / Ad / YouTube** stages set each channel's numbers in that channel's own vocabulary; they are separate stages, not steps of this one.
- **It is not a channel pipeline.** Each channel runs **Approaches → Ideate → Schedule** (ad has no Schedule) via `/ssc-post-plan`, `/ssc-ads-plan`, `/ssc-youtube`. Channel **Focus**, channel **Research** and channel **Measure** no longer exist — the head owns all three.
- **It does not write the period digest.** `performance_analyses` stays owned by the quarterly retrospective. Review **reads** it and never writes it.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-plan-agent`**, passing the `period` (and `step` if provided). The agent is **state-driven**: it reads the head's current field state and works whichever of the four steps is next, then stops. When a `step` is given, the agent works **that** step.

Because only the Narrative is gated, the first three steps never block each other — the agent will re-author an already-written step when asked rather than refusing, since authoring costs nothing and nothing downstream is locked until approval.

Re-run this command (same `period`) to advance to the next step.

## Cutover

A monthly plan head is **required for periods from `2026-08` onward**. Periods at or before `2026-07` keep `month_plan_id` NULL, render read-only in their legacy shape with their historical `tactics` / `context` / `retrospective` intact, and are **never** migrated or backfilled. If asked to run this command for a period ≤ `2026-07`, say plainly that the period predates the cutover and stop.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. **The agent never flips a gate.** Propose-only (hard rule): never call `approve` (the ONLY gated promotion — the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is not a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows.

The month's single approval is **`approve(entity='month_plan', gate='narrative')`** — a human action in the dashboard. Running the steps requires `edit`.

## After it runs

Point the operator to the **monthly plan dashboard** at `/content/plan/<period>` for the step that just ran. Once the Narrative is approved, all three channel pipelines are released — `/ssc-post-plan`, `/ssc-ads-plan` and `/ssc-youtube` can each run their Approaches step.
