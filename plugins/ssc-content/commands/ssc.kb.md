---
description: Launch the Cambridge Diet Vietnam Knowledge-base health cycle — review → audit → research → revise/gap-fill. Produces propose-only KB revisions; nothing is applied automatically.
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Focus** (`focus`, optional) — a KB area to concentrate on (e.g. `rules`, `ad`, `voice`).
- **Mode** (`mode`, optional) — `review` (default), `audit`, or `revise`.

If no input is given, run a full-surface `review` pass.

## What to do

This command is a thin entry point — it holds **no** orchestration logic.
Dispatch the **`ssc-kb-agent`**, passing `focus`/`mode` if provided. The agent
runs the knowledge-base health cycle and stops at the human gate.

| Mode | The agent does | Then the operator… |
|---|---|---|
| **review** | Scans the KB for contradictions, stale guidance, gaps, angle drift | Reviews findings in the **Knowledge dashboard** |
| **audit** | Verifies each claim in `rules/`/`ad/`/`winners/` traces to evidence | Reviews flagged claims, decides cite-or-remove |
| **revise** | Drafts propose-only revisions + gap-fill candidates | **Approves** revisions in the **Knowledge dashboard → Proposals** tab |

## Governance

Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either
direction — never call `approve` (the ONLY gated promotion; the approval
hook denies it to agents, any entity, any gate), and never publish. Demotion
is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban
lives here: never use `edit` to demote, unapprove, discard, or reject a row.
Never edit or delete operator-curated or approved rows: the generic
`edit`/`delete` verbs may target ONLY draft rows this skill itself created
in the current run. Everything else belongs to the operator in the
dashboard. Every revision ends at a human gate
in the Knowledge dashboard. Running requires `edit`; approving a revision
requires `approve`.

## After it runs

Point the operator to the **Knowledge dashboard → Proposals** tab.
