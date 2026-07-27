---
description: Run the Cambridge Diet Vietnam Posts channel of a monthly plan — Approaches → Ideate → Schedule — on channel_plans(channel='post', period), hanging off that period's monthly-plan head. Released by the head's narrative approval; the channel authors no themes, no research, and no quantities of its own. State-driven across three human gates; propose-only.
metadata:
  brand: cambridge-diet-vn
  section: post
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, format `YYYY-MM` — the month being planned, e.g. `2026-08`). Required. This is the key the post `channel_plan` is stored under, and the key of the monthly plan it hangs off.
- **Step** (`step`, optional — one of `approaches`, `ideate`, `schedule`) — names which of the three steps to work this invocation. The dashboard's per-step Cowork button emits it **positionally after the period** (`/ssc.post-plan <period> <step>`), so an operator standing on a given step copies a command that works THAT step. Omit it to run the next open step (plain state-driven pick).
- **Plan ID** (`plan_id`, optional) — pass when resuming an in-flight plan. The plan is canonically resolved by `(channel='post', period)`, so this is informational only.

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one. The token after the period (if any) is the `step`.

## What this command is

This is the **Posts channel** of the monthly plan — the three steps the channel itself owns, and nothing above them.

The month is decided at the **monthly-plan head** (`/ssc.plan <period>`), which authors the Review, the month's themes, the one outward research pass, and every channel's quantities, and carries the month's **single approval**. Approving the head's Narrative is what **releases** this channel. Until then, this command writes nothing.

| Step | Gate | The agent does | Then the operator… |
|---|---|---|---|
| **Approaches** | `approaches_approved` | The channel's creative **HOW** for organic Facebook posts, grounded in the head's themes / research / review first, the quarter's strategy second, and the KB third → written to `context` | Reviews + **approves** the Approaches in the dashboard, then re-runs this command |
| **Ideate** | ≥1 approved idea | **Three rounds, one per invocation** — see below. ① *Distribution* → the pillar split, written to the head (propose-only, no gate). ② *Titles* → one titled DRAFT idea per planned post, audited for spread and diversity. ③ *Angle* → each **approved** idea's hero + its **one** angle, patched onto its single brief | ① accept, edit the numbers in the panel, **or just re-run — re-running is acceptance**. ② prune the titles worth keeping. ③ approve the ideas to schedule |
| **Schedule** | `schedule_approved` | Assigns each approved idea a publish date, honouring the **allocated** cadence and the head research's calendar → written as `schedule_entries` | Reviews + **approves** the calendar in the dashboard, then re-runs this command |

The three human gates are **Approaches** (`approaches_approved`) → **Ideas** (≥1 approved idea) → **Calendar** (`schedule_approved`), all downstream of the month's single narrative approval.

Re-run this command (same `period` / `step`) after each gate to advance.

## Ideate runs in three rounds

`/ssc.post-plan <period> ideate` runs **one round per invocation** and stops. You type
the same command each time — **which round runs is read from the data, never
remembered from the last conversation**, so it always advances rather than repeating:

| What is stored | Round that runs |
|---|---|
| pillar counts all `0` | ① **Distribution** — proposes the split |
| counts set, no ideas yet | ② **Titles** |
| ideas exist and some are approved | ③ **Angle** — on the approved ones only |

Rounds exist so effort follows commitment: no titles are written against a
distribution nobody accepted, and no hero or angle work is spent on a title you were
going to delete.

**① Distribution** proposes a post count per pillar plus the cadence band and format
mix. Three ways to accept: say so, edit the numbers in the dashboard panel, or just
re-run the command. Whatever is **stored** is what round ② builds on — so editing the
panel is the way to change the plan, and the round re-reads it every time rather than
trusting its own earlier proposal.

**② Titles** creates one draft idea per planned post and stops for you to prune.
Scores are honest, not floored — a weak topic reads as weak, because pruning is the
point of the checkpoint.

**③ Angle** works **only ideas you approved**, so prune first. Each gets its hero and
its single angle (persuasion route + the five narrative fields) patched onto the brief
it already has. Routes are spread across the batch, honouring any route the month's
themes single out for expansion.

## What this command is NOT

- **It does not author the month's themes.** Those are the head's Tactics step (`month_plans.tactics`), authored once and applied to every channel. The channel realizes them; it never restates or re-decides them.
- **It does not run market research.** There is exactly **one** outward signal pass per period — the head's Research step. This channel reads it and never runs its own WebSearch.
- **It does not look back.** The system's only look-back is the head's Review, which ranks taxonomy terms across every channel. There is no per-channel Measure and no per-channel retrospective.
- **It does not set its own quantities behind the head's back.** Pillar counts, cadence and format mix live on the head, and a channel-side write (`save_plan_targets`, or a `detail` payload on `save_channel_plan`) is refused with `retired_plan_field`. They are reached only through `allocate_channel`, which is propose-only and flips no gate — used by the operator in the dashboard panel and by Ideate round 1, which proposes the split so the operator has numbers to accept rather than an empty table. Approving them is still the operator's act; writing a proposal is not accepting it.

## Grounding order — head, then quarter, then KB

Every step grounds itself in the same three sources, **in this priority order**:

1. **The monthly plan** (`get_month_plan(period)`) — the month's narrative, themes (`tactics`), outward research (`research`) and look-back (`performance_review`), plus the allocation the head set for this channel. This is the primary steering and it decides the month.
2. **The quarterly strategy brief** (`get_strategy_brief(<quarter>, marked_only=true)`) — direction across the quarter. Used to place the month inside the quarter and to fill in where the month is silent. It never overrides the month.
3. **The knowledge base** — read live, by path, every run. It supplies craft, vocabulary, persona detail and hard rules; it never supplies direction.

Where two sources disagree, the higher one wins — and the step says so in one line rather than quietly picking.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-post-agent`**, passing the `period` (and `plan_id` / `step` if provided). The agent is **state-driven**: it reads the head's release gate and the post plan's gate flags, then works whichever step is next and stops. When a `step` is given, the agent works **that** step — still obeying the gate machine: it will not skip an unapproved upstream nor overwrite approved work.

## Cutover

The monthly plan owns the month from **`2026-08` onward**. Periods at or before `2026-07` ran the retired five-step channel pipeline, keep `month_plan_id` NULL, render read-only in their legacy shape, and are **never** migrated or backfilled. If asked to run this command for a period ≤ `2026-07`, say plainly that the period predates the cutover and stop.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every gated step ends at a human gate in the dashboard — **the agent never flips a gate itself**. Propose-only (hard rule): never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is not a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows.

Running steps requires `edit`; approving the Approaches, the individual ideas, and the calendar requires `approve`.

## After it runs

Point the operator to the monthly-plan dashboard at `/content/plan/<period>?tab=post&step=<step>` for the step that just ran. The Posts channel runs independently of Ads and YouTube — they share only the monthly plan upstream.
