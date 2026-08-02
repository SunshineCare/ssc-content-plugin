---
argument-hint: '<YYYY-MM>'
description: Launch the Cambridge Diet Vietnam YouTube channel — briefing → ideate [approve ideas] → schedule [approve schedule]. Released by the monthly plan head's Narrative approval; the channel authors no themes, no research and no quantities of its own.
metadata:
  dispatches: [ssc-youtube-agent]
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Period** (`period`, `YYYY-MM`, e.g. `2026-07`). Required.

If no period is given, ask the operator for it (one question) before dispatching. Do not invent one.

## Precondition

Requires the month's **Narrative on the monthly-plan head to be approved** first — that single approval is what releases every channel. If not yet approved, author and approve it via `/ssc-plan`, then return here.

## What to do

This command is a thin entry point — no orchestration logic. Dispatch the
**`ssc-youtube-agent`**, passing `period`. The agent is state-driven: it reads
the head's `narrative_approved` plus the YouTube `channel_plan`'s gate booleans
(`approved`, `schedule_approved`) and runs whichever YouTube step is next, then
stops at the human gate.

| Phase | The agent does | Then the operator… |
|---|---|---|
| **Briefing** | Reads the head's approved themes + KB → drafts a YouTube briefing (formats × buyer-stage × cadence) and proposes the month's cadence/distribution onto the head | Reviews + approves the briefing in `/content/youtube` (opens Ideate), re-runs this command |
| **Ideate** | Generates draft video ideas via `save_idea`, tagged to the plan | **Curates** the ideas in `/content/youtube`, re-runs this command |
| **Schedule** | Proposes the publish calendar as `schedule_entries` | **Approves** the calendar in `/content/youtube` |

Re-run this command (same `period`) after each gate.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. Every phase ends at a
human gate. The agent is propose-only — it never changes approval or lifecycle
state in either direction (never `approve` — the ONLY gated promotion, denied to
agents by the approval hook; never publish; and never `edit` used to demote or
unapprove a row, demotion being an `edit` now rather than a separate
`unapprove_*` tool) and never edits or deletes operator-curated rows. Running requires `edit`; approving requires
`approve` (operator, in the workspace).

## After it runs

Point the operator to the content workspace (`/content/youtube`). Posts, Ads,
and YouTube run independently of each other once the month's Narrative is
approved — that one head gate releases all three.
