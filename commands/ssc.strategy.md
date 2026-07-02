---
description: Launch the Cambridge Diet Vietnam quarterly Strategy cycle — the deep, once-a-quarter cycle that gathers 8-dimension market intelligence and then feeds the validated findings back into the knowledge base as propose-only revisions. State-driven across three human-gated phases.
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Cycle key** (`period`, format `YYYY-Q#` — the quarter the cycle covers, e.g. `2026-Q3`). Required. This is the technical key the brief is stored under; strategy runs on a quarterly cadence.
- **Brief ID** (optional) — pass when resuming an in-flight cycle.

If no cycle key is given, ask the operator for it (one question) before dispatching. Do not invent one.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-strategy-agent`**, passing the `period` (and `brief_id` if provided). The agent is **state-driven**: it reads the brief's current state and runs whichever of the three phases is next, then stops at the human gate:

| Phase | The agent does | Then the operator… |
|---|---|---|
| **1 — Directions** | Drafts research directions onto the brief | Edits + **approves** them in the **Strategy dashboard**, then re-runs this command |
| **2 — Dimensions** | Runs the 8 dimension skills → findings | **Curates** findings — **Mark for brief** (accept) / dismiss (decline) — in the **Strategy dashboard**, then re-runs this command |
| **3 — KB feedback** | Turns the curated findings (+ a KB review/audit) into **propose-only KB revisions** | **Approves** each revision in the **KB dashboard** |

Re-run this command (same `period` / `brief_id`) after each gate to advance to the next phase.

**Strategy is quarterly — there are no ad-hoc modes.** For a one-off strategy task *between* quarters (pressure-test a proposal, develop options for a problem, audit one focus area), the operator invokes the standalone skills directly — `ssc-strategy-eval`, `ssc-strategy-develop`, `ssc-strategy-audit` — not this command.

## Governance

Nothing auto-approves, auto-publishes, or auto-applies. Every phase ends at a human gate in a dashboard. Running the cycle and curating findings (**Mark for brief** / dismiss) require `edit`; approving directions and applying KB revisions require `approve`.

## After it runs

Point the operator to the dashboard for the phase that just ran (Strategy dashboard for Phases 1-2, KB dashboard → Proposals for Phase 3). Once Phase 3's KB revisions are approved, the refreshed knowledge base feeds the **Monthly Plan**.
