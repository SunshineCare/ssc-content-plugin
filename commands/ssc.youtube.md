---
description: Launch the Cambridge Diet Vietnam YouTube channel — briefing → ideate [approve ideas] → schedule [approve schedule]. Requires the month's context to be approved first (/ssc.plan).
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, `YYYY-MM`, e.g. `2026-07`). Required. Must match the period used in `/ssc.plan`.
- **Plan ID** (`plan_id`, optional).

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one.

## Precondition

Requires the month's **Context phase to be approved** first. If not yet approved, run `/ssc.plan` to complete Tactics → Context, then return here.

## What to do

This command is a thin entry point — no orchestration logic. Dispatch the
**`ssc-youtube-agent`**, passing `period` (and `plan_id` if provided). The agent
is state-driven: it reads the plan's `phase_status` and runs whichever YouTube
phase is next, then stops at the human gate.

| Phase | The agent does | Then the operator… |
|---|---|---|
| **Briefing** | Reads approved context + KB → drafts a YouTube briefing (formats × buyer-stage × cadence) | Reviews in the **Monthly Plan dashboard → YouTube tab**, re-runs this command |
| **Ideate** | Generates draft video ideas via `save_idea`, tagged to the plan | **Curates** the ideas in the **YouTube tab**, re-runs this command |
| **Schedule** | Proposes the publish schedule | **Approves** the schedule in the **YouTube tab** |

Re-run this command (same `period`/`plan_id`) after each gate.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every phase ends at a
human gate. Running requires `edit`; approving requires `approve`.

## After it runs

Point the operator to the **Monthly Plan dashboard → YouTube tab**. Posts, Ads,
and YouTube run independently after context is approved.
