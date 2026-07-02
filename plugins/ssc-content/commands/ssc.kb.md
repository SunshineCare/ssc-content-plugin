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

Nothing auto-approves, auto-applies, or auto-publishes. Every revision ends at a
human gate in the Knowledge dashboard. Running requires `edit`; approving a
revision requires `approve`.

## After it runs

Point the operator to the **Knowledge dashboard → Proposals** tab.
