---
description: Plan the Cambridge Diet Vietnam Ads channel — Focus → Approaches → Ideate → Measure — keyed on its own ad channel_plan. State-driven across three human-gated steps.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, format `YYYY-MM` — the month being planned, e.g. `2026-07`). Required. This is the key the ad `channel_plan` is stored under.
- **Stage** (`stage`, optional — one of `focus`, `approaches`, `ideate`, `measure`) — names which pipeline step to work this invocation. The dashboard's per-stage Cowork button emits it **positionally after the period** (`/ssc.ads-plan <period> <stage>`), so an operator standing on a given stage copies a command that works THAT step. Omit it to run the next open step (plain state-driven pick).
- **Plan ID** (`plan_id`, optional) — pass when resuming an in-flight plan. The plan is canonically resolved by `(channel='ad', period)`, so this is informational only.

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one. The token after the period (if any) is the `stage`.

This command is the **standalone entry point** for the Ads pipeline. It runs entirely on its own `channel_plan(channel='ad', period)` — there is **no precondition** and no `/ssc.plan` dependency. The ad plan carries its own tactics, its persona × route coverage/volume target, the approaches, the subject pool (DRAFT ad concepts), and the retrospective, and runs independently of the Posts and YouTube channels. The ad set / media buy has left the creative pipeline entirely — it is a dashboard/ops concern this pipeline never touches.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-ads-agent`**, passing the `period` (and `plan_id` / `stage` if provided). The agent is **state-driven**: it reads the ad plan's current gate flags and runs whichever of the four steps is next, then stops at the next open human gate. When a `stage` is given, the agent instead works **that** step — still obeying the gate machine: it will not skip an unapproved upstream nor overwrite approved work (it reports what to approve first, or that the step is already approved), so the stage targets a step without ever walking a gate backward.

| Step | Gate | The agent does | Then the operator… |
|---|---|---|---|
| **Focus** | `tactics_approved` | Resolves the quarter strategy + prior period's ad retrospective → drafts the month's bets (quarterly angles to push in paid, priority-pillar bets, tactical themes) plus the month's persona × route coverage/volume target (`creative_target`) | Reviews + **approves** the Focus in the dashboard (flips `tactics_approved`), then re-runs this command |
| **Approaches** | `approaches_approved` | Light WebSearch month pass + KB synthesis → drafts the creative *how* (per-route/persona approaches, audience triggers, differentiation, experiments) to `context` | Reviews + **approves** the Approaches in the dashboard (flips `approaches_approved`), then re-runs this command |
| **Ideate** | ≥1 approved concept | Sizes the month's subject pool to the Focus's `creative_target` total and generates one DRAFT, persona-free, tier-free subject per planned creative via `save_idea(channel='ad', plan_id)` — no ad-set/slot link, no persona/layer tag | **Curates** the subjects — accepts or removes — in the dashboard → Ideas. Approving ≥1 subject opens the Ideas gate; then re-runs this command |
| **Measure** | ungated | Reads this plan's ingested ad performance → writes the `retrospective` (carried into next month's Focus) | — (ungated; closes the loop) |

The three human gates are **Focus** (`tactics_approved`) → **Approaches** (`approaches_approved`) → **Ideas** (≥1 approved concept). **Measure** is ungated. Ideas is a per-item curation gate — the operator approves individual subjects/concepts in the dashboard, not a plan-level flag.

Re-run this command (same `period` / `plan_id`) after each gate to advance to the next step.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every gated step ends at a human gate in the dashboard — **the agent never flips a gate itself**. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Running steps requires `edit`; approving the Focus, the Approaches, and individual concepts requires `approve`.

## After it runs

Point the operator to the **Ads pipeline dashboard** for the step that just ran. The Ads pipeline runs independently of the Posts and YouTube channels — `/ssc.post-plan` and `/ssc.youtube` proceed on their own.
