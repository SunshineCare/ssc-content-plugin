---
description: Plan the Cambridge Diet Vietnam Ads channel — Focus → Approaches → Blueprint → Ideate → Measure — keyed on its own ad channel_plan. State-driven across four human-gated steps.
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
- **Plan ID** (`plan_id`, optional) — pass when resuming an in-flight plan. The plan is canonically resolved by `(channel='ad', period)`, so this is informational only.

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one.

This command is the **standalone entry point** for the Ads pipeline. It runs entirely on its own `channel_plan(channel='ad', period)` — there is **no precondition** and no `/ssc.plan` dependency. The ad plan carries its own tactics, approaches, budget split, layer %, the full ad-set build map, concepts, and retrospective, and runs independently of the Posts and YouTube channels.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-ads-agent`**, passing the `period` (and `plan_id` if provided). The agent is **state-driven**: it reads the ad plan's current gate flags and runs whichever of the five steps is next, then stops at the next open human gate:

| Step | Gate | The agent does | Then the operator… |
|---|---|---|---|
| **Focus** | `tactics_approved` | Resolves the quarter strategy + prior period's ad retrospective → drafts the month's bets (quarterly angles to push in paid, priority-pillar bets, tactical themes) | Reviews + **approves** the Focus in the dashboard (flips `tactics_approved`), then re-runs this command |
| **Approaches** | `approaches_approved` | Light WebSearch month pass + KB synthesis → drafts the creative *how* (per-layer L1/L2/L3/YouTube approaches, audience triggers, differentiation, experiments) to `context` | Reviews + **approves** the Approaches in the dashboard (flips `approaches_approved`), then re-runs this command |
| **Blueprint** | ≥1 approved ad set | Derives the full ad-set build map across all four layers → `ad_plan_slots`, **each ad set RATED 1–5 and proposed** (carrying its build_spec + creative count; per-ad-set budget lives in `build_spec.budgetShare`) | Reviews the ad sets and **approves the ones to build, individually** in the dashboard (each goes `proposed` → `approved`). Approving ≥1 ad set opens Ideate (which fills only the approved ad sets); then re-runs this command |
| **Ideate** | ≥1 approved concept | Generates one DRAFT structural concept per planned creative in the **approved ad sets only** via `save_idea(channel='ad', slot_id)`, tagged to the plan, across all layers they span | **Curates** the concepts — accepts or removes — in the dashboard → Ideas. Approving ≥1 concept opens the Ideas gate; then re-runs this command |
| **Measure** | ungated | Reads this plan's ingested ad performance → writes the `retrospective` (carried into next month's Focus) | — (ungated; closes the loop) |

The four human gates are **Focus** (`tactics_approved`) → **Approaches** (`approaches_approved`) → **Blueprint** (≥1 approved ad set) → **Ideas** (≥1 approved concept). **Measure** is ungated. Blueprint and Ideas are both per-item curation gates — the operator approves individual ad sets / concepts in the dashboard, not a plan-level flag.

Re-run this command (same `period` / `plan_id`) after each gate to advance to the next step.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every gated step ends at a human gate in the dashboard — **the agent never flips a gate itself**. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard. Running steps requires `edit`; approving the Focus, the Approaches, individual ad sets, and individual concepts requires `approve`.

## After it runs

Point the operator to the **Ads pipeline dashboard** for the step that just ran. The Ads pipeline runs independently of the Posts and YouTube channels — `/ssc.post-plan` and `/ssc.youtube` proceed on their own.
