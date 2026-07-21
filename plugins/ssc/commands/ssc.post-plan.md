---
description: Launch the standalone Cambridge Diet Vietnam Posts pipeline — Focus → Research → Ideate → Schedule → Measure — keyed on its own post channel_plan. State-driven across four human-gated steps; no /ssc.plan dependency.
metadata:
  brand: cambridge-diet-vn
  section: post
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, format `YYYY-MM` — the month being planned, e.g. `2026-07`). Required. This is the key the post `channel_plan` is stored under.
- **Stage** (`stage`, optional — one of `focus`, `research`, `ideate`, `schedule`, `measure`) — names which pipeline step to work this invocation. The dashboard's per-stage Cowork button emits it **positionally after the period** (`/ssc.post-plan <period> <stage>`), so an operator standing on a given stage copies a command that works THAT step. Omit it to run the next open step (plain state-driven pick).
- **Plan ID** (`plan_id`, optional) — pass when resuming an in-flight plan. The plan is canonically resolved by `(channel='post', period)`, so this is informational only.

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one. The token after the period (if any) is the `stage`.

This command is the **standalone entry point** for the Posts pipeline. It runs entirely on its own `channel_plan(channel='post', period)` — there is **no precondition** and no `/ssc.plan` dependency. The post plan carries its own tactics, context, targets, ideas, calendar, and retrospective, and runs independently of the Ads and YouTube channels.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-post-agent`**, passing the `period` (and `plan_id` / `stage` if provided). The agent is **state-driven**: it reads the post plan's current gate flags and runs whichever of the five steps is next, then stops at the next open human gate. When a `stage` is given, the agent instead works **that** step — still obeying the gate machine: it will not skip an unapproved upstream nor overwrite approved work (it reports what to approve first, or that the step is already approved), so the stage targets a step without ever walking a gate backward.

| Step | The agent does | Then the operator… |
|---|---|---|
| **Focus** | Resolves the quarter strategy + prior period's retrospective → drafts the month tactics (quarterly angles to push, priority-pillar bets, tactical themes) | Reviews + **approves** the Focus in the dashboard (flips `tactics_approved`), then re-runs this command |
| **Research** | Light WebSearch pass + KB synthesis → drafts the month brief, pillar distribution (~30), and format mix | Reviews + **approves** the Research in the dashboard (flips `approved`), then re-runs this command |
| **Ideate** | Generates ~30 DRAFT post ideas via `save_idea`, tagged to the plan | **Curates** the ideas — accepts or removes — in the dashboard → Ideas. Approving ≥1 idea opens the Ideas gate; then re-runs this command |
| **Schedule** | Proposes the publish calendar (dates, pillars, cadence, key-date build-up) as `schedule_entries` | Reviews + **approves** the calendar in the dashboard (flips `schedule_approved`), then re-runs this command |
| **Measure** | Reads this plan's post performance → writes the `retrospective` (carried into next month's Focus) | — (ungated; closes the loop) |

The four human gates are **Focus** (`tactics_approved`) → **Research** (`approved`) → **Ideas** (≥1 approved idea) → **Calendar** (`schedule_approved`). **Measure** is ungated.

Re-run this command (same `period` / `plan_id`) after each gate to advance to the next step.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every gated step ends at a human gate in the dashboard — **the agent never flips a gate itself**: it never changes approval or lifecycle state in either direction (never `approve` — the ONLY gated promotion, denied to agents by the approval hook; never publish; and never `edit` used to demote/unapprove a row, demotion being an `edit` now rather than a separate `unapprove_*` tool) and never edits or deletes operator-curated or approved rows. Running steps requires `edit`; approving the Focus, Research, ideas, and calendar requires `approve`.

## After it runs

Point the operator to the **Posts pipeline dashboard** for the step that just ran. The Posts pipeline runs independently of the Ads and YouTube channels — `/ssc.ads-plan` and `/ssc.youtube` proceed on their own.
