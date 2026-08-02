---
argument-hint: '<YYYY-Q#> [brief_id] [rerun]'
description: Launch the Cambridge Diet Vietnam quarterly Strategy cycle — the deep, once-a-quarter cycle that gathers 8-dimension market intelligence and then feeds the validated findings back into the knowledge base as propose-only revisions. State-driven across three human-gated phases.
metadata:
  dispatches: [ssc-strategy-agent]
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Cycle key** (`period`, format `YYYY-Q#` — the quarter the cycle covers, e.g. `2026-Q3`). Required. This is the technical key the brief is stored under; strategy runs on a quarterly cadence.
- **Brief ID** (optional) — pass when resuming an in-flight cycle.
- **`rerun` marker** (optional, bare trailing token — `/ssc-strategy 2026-Q3 rerun`) — the explicit instruction to re-run a quarter whose dimensions are already complete. Absent by default; never infer it from anything else the operator says. Pass it through to the agent verbatim.

If no cycle key is given, ask the operator for it (one question) before dispatching. Do not invent one.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-strategy-agent`**, passing the `period` (and `brief_id` if provided). The agent is **state-driven**: it reads the brief's current state and runs whichever of the three phases is next, then stops at the human gate:

| Phase | The agent does | Then the operator… |
|---|---|---|
| **1 — Directions** | Drafts research directions onto the brief | Edits + **approves** them in the **Strategy dashboard**, then re-runs this command |
| **2 — Dimensions** | Runs the 8 dimension skills → findings; each dimension self-rates 1–5 and drops+replaces any candidate ≤3 before saving (bounded at 2 attempts), so only findings ≥4 reach the brief | **Curates** findings — **Mark for brief** (accept) / dismiss (decline), using the self-rating as a prioritization cue — in the **Strategy dashboard**, then re-runs this command |
| **3 — KB feedback** | Turns the curated findings (+ a KB review/audit) into **propose-only KB revisions** | **Approves** each revision in the **KB dashboard** |

Re-run this command (same `period` / `brief_id`) after each gate to advance to the next phase.

**Re-running a completed quarter — the `rerun` marker.** Once all 8 dimensions are recorded, re-invoking normally advances to Phase 3; the trailing `rerun` marker instead forces **Phase 2 as a full re-run** — all **8** dimensions again, ignoring the recorded `dimension_status` and rebuilding it as the run proceeds. It is **not** a new brief: same `period`, same `brief_id`, same approved directions — no new brief, no re-drafted directions. Findings are **appended**; nothing existing is deleted, edited, dismissed or un-marked, so the brief carries both vintages and re-curation is the operator's in the Strategy dashboard. And `rerun` **does not bypass the directions gate**: with the marker but directions unapproved, the agent still refuses and points the operator at the Strategy dashboard. The marker forces the *phase*, never the gate.

**The quarter authors the market-sophistication read once.** The ad-market dimension derives it and the agent stamps it onto the quarterly brief; every monthly plan linked to that brief **inherits** it. No monthly artifact authors a read of its own.

**Strategy is quarterly — there are no ad-hoc modes.** For a one-off strategy task *between* quarters (pressure-test a proposal, develop options for a problem, audit one focus area), the operator invokes the standalone skills directly — `ssc-strategy-eval`, `ssc-strategy-develop`, `ssc-strategy-audit` — not this command.

## Governance

Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Every phase ends at a human gate in a dashboard. Running the cycle and curating findings (**Mark for brief** / dismiss) require `edit`; approving directions and applying KB revisions require `approve`.

## After it runs

Point the operator to the dashboard for the phase that just ran (Strategy dashboard for Phases 1-2, KB dashboard → Proposals for Phase 3). Once Phase 3's KB revisions are approved, the refreshed knowledge base feeds the **Monthly Plan**.
