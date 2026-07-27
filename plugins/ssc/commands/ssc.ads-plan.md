---
description: Run the Cambridge Diet Vietnam Ads channel of a monthly plan — Approaches → Ideate — on channel_plans(channel='ad', period), hanging off that period's monthly-plan head. Released by the head's narrative approval; the channel authors no bets, no research, no look-back, and no quantities. State-driven across two human gates; propose-only.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, format `YYYY-MM` — the month being planned, e.g. `2026-08`). Required. This is the key the ad `channel_plan` is stored under, and the key of the monthly plan it hangs off.
- **Stage** (`stage`, optional — one of `approaches`, `ideate`) — names which of the two steps to work this invocation. The dashboard's per-stage Cowork button emits it **positionally after the period** (`/ssc.ads-plan <period> <stage>`), so an operator standing on a given stage copies a command that works THAT step. Omit it to run the next open step (plain state-driven pick).
- **Plan ID** (`plan_id`, optional) — pass when resuming an in-flight plan. The plan is canonically resolved by `(channel='ad', period)`, so this is informational only.

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one. The token after the period (if any) is the `stage`.

## What this command is

This is the **Ads channel** of the monthly plan — the two steps the channel itself owns, and nothing above them.

The month is decided at the **monthly-plan head** (`/ssc.plan <period>`), which authors the Review, the month's bets, the one outward research pass, and every channel's quantities, and carries the month's **single approval**. Approving the head's Narrative is what **releases** this channel. Until then, this command writes nothing.

| Step | Gate | The agent does | Then the operator… |
|---|---|---|---|
| **Approaches** | `approaches_approved` | The channel's creative **HOW** for paid — which routes to emphasize for which personas, what trigger each rides, how to differentiate, what to experiment with — grounded in the head's bets / research / review first, the quarter's strategy second, and the KB third → written to `context` | Reviews + **approves** the Approaches in the dashboard, then re-runs this command |
| **Ideate** | ≥1 approved concept | Sizes the subject pool to the head's **Ad allocation** and proposes one DRAFT, **persona-free, tier-free** subject per planned creative via `save_idea(channel='ad', plan_id)` — no persona, no route, no awareness stage, no media-layer tag, no ad-set link | **Curates** the subjects — accepts or removes — in the dashboard → Ideas. Approving ≥1 subject opens the Ideas gate |

The two channel gates are **Approaches** (`approaches_approved`) → **Ideas** (≥1 approved concept), both downstream of the month's single narrative approval. Ideas is a per-item curation gate — the operator approves individual subjects, not a plan-level flag.

Re-run this command (same `period` / `stage`) after each gate to advance.

## Focus and Measure are retired

They are not skipped steps — they no longer exist, and the server is what retired them:

- **Focus.** `channel_plans.tactics` and `tactics_approved` were DROPPED from the schema, and `save_channel_plan` **moved** the narrative gate onto the Approaches `context` write, where the retired Focus write used to carry it. Approaches is now the channel's first authored step. The month's bets live at the head (`month_plans.tactics`).
- **Measure.** The system's only look-back is the head's Review (`month_plans.performance_review`), which already reads the ad lens **by layer** on each layer's own KPI (L2 on CPM + volume + continuity, never on cost-per-purchase; L1/L3 on cost per purchase, with cost per conversion demoted to diagnostic). `channel_plans.retrospective` was DROPPED, so there is no per-channel retrospective to write.

A `focus` or `measure` stage token from an old dashboard button is reported as retired and falls through to ordinary state detection rather than failing.

## What this command is NOT

- **It does not author the month's bets.** Those are the head's Tactics step, authored once and applied to every channel. The channel realizes them; it never restates or re-decides them.
- **It does not run market research.** There is exactly **one** outward signal pass per period — the head's Research step. This channel reads it and never runs its own WebSearch.
- **It does not look back.** See *Measure* above.
- **It does not set its own quantities.** Creative counts live on the head, and a channel-side write (`save_plan_targets`, or a `detail` payload on `save_channel_plan`) is refused with `retired_plan_field`. They are reached only through `allocate_channel`, used by the operator in the dashboard's allocation panel.
- **It does not touch the media buy.** The ad set / campaign / budget sits **outside** the creative pipeline entirely — a dashboard/ops concern. No step here plans, tags, or references an ad set's budget, audience, or placement, and `update_budget` (real Facebook spend) / `create_campaign` / `create_adset` / `create_ad` are never agent-callable.
- **It does not assign personas.** Subjects are persona-free by design. Persona enters at the Brief step (`/ssc.ads-brief <ideaId>`), which fans one subject into one angle per fitting persona × route.

## Grounding order — head, then quarter, then KB

Every step grounds itself in the same three sources, **in this priority order**:

1. **The monthly plan** (`get_month_plan(period)`) — the month's narrative, bets (`tactics`), outward research (`research`) and look-back (`performance_review`), plus the Ad allocation the head set for this channel. This is the primary steering and it decides the month.
2. **The quarterly strategy brief** (`get_strategy_brief(<quarter>, marked_only=true)`) — direction across the quarter. Used to place the month inside the quarter and to fill in where the month is silent. It never overrides the month.
3. **The knowledge base** — read live, by path, every run. It supplies craft, vocabulary, persona detail and hard rules; it never supplies direction.

Where two sources disagree, the higher one wins — and the step says so in one line rather than quietly picking.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-ads-agent`**, passing the `period` (and `plan_id` / `stage` if provided). The agent is **state-driven**: it reads the head's release gate and the ad plan's gate flags, then works whichever step is next and stops. When a `stage` is given, the agent works **that** step — still obeying the gate machine: it will not skip an unapproved upstream nor overwrite approved work.

## Cutover

The monthly plan owns the month from **`2026-08` onward**. Periods at or before `2026-07` ran the retired four-step channel pipeline (Focus → Approaches → Ideate → Measure), keep `month_plan_id` NULL, render read-only in their legacy shape, and are **never** migrated or backfilled. If asked to run this command for a period ≤ `2026-07`, say plainly that the period predates the cutover and stop.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every gated step ends at a human gate in the dashboard — **the agent never flips a gate itself**. Propose-only (hard rule): never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is not a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows the running skill itself created in the current run. Everything else belongs to the operator in the dashboard.

Running steps requires `edit`; approving the Approaches and the individual concepts requires `approve`.

## After it runs

Point the operator to the monthly-plan dashboard's Ads workspace for `<period>` and the step that just ran. The Ads channel runs independently of Posts and YouTube — they share only the monthly plan upstream. After the Ideas gate, production continues per approved subject: `/ssc.ads-brief <ideaId>` for its persona × route angles, then `/ssc.ads-produce <briefId>` per approved angle.
