---
description: Launch the standalone Cambridge Diet Vietnam post-writer production loop — resolve a scheduled post (by date or idea id) → produce N Vietnamese copy variations → self-score + drop/regenerate to brand → save the passers as idea-linked drafts. Runs after the planning pipeline's Schedule. Propose-only; no /ssc.plan or /ssc.post-plan dependency.
metadata:
  brand: cambridge-diet-vn
  section: post
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **one of**:

- **Date** (`date`, format `YYYY-MM-DD` — a calendar day, e.g. `2026-07-14`). Resolved to the scheduled post idea(s) for that day on the post channel.
- **Idea ID** (`idea_id`) — a specific idea id, targeting that idea directly.

Optional:

- **N** (`n`) — the number of copy variations to produce. **Default 4.** Passed through to the writer and authority unchanged.

If neither `date` nor `idea_id` is given, ask the operator for one (one question) before dispatching. Do not invent one.

This command is the **production half** of the Posts pipeline. It runs **after** the planning pipeline's **Schedule** step — a post idea is only worked once it has been ideated, curated/approved, and placed on the calendar. It operates **per post idea**, never on a whole plan: it reads **no** `channel_plan`, no gate flags, and no `ads`/`youtube` state. There is **no** `/ssc.plan` or `/ssc.post-plan` precondition.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-post-writer-agent`**, passing the resolved target (`date` or `idea_id`) and `n` (if provided). The agent is **state-driven**: on each invocation it does the next open step for the resolved post and stops at the human gate:

| Step | The agent does | Then the operator… |
|---|---|---|
| **Resolve** | Resolves a single scheduled post — by `date` via `get_content_by_date(channel='post')`, or by `idea_id` via `get_idea`. Works ONE post at a time (a date with several scheduled posts is handled one idea per run). | — |
| **Produce** | `ssc-post-produce` drafts N distinct Vietnamese Facebook copy variations — each a different angle/hook — **in-conversation, UNSAVED**, grounded in `voice/*` + `content/*` + `channels/facebook`. | — |
| **Authority** | `ssc-post-authority` scores each variation 1–5 with a Vietnamese rationale comment against `rules/*` + `voice/*` + `content/quick-checklist`, drops + regenerates any rated ≤3 until N are ≥4, then **persists ONLY the passers** via `save_post_content` (one `content` draft per passer, idea-linked). | Opens the workspace → `/post/[month]/[id]` → **Copy** stage → reviews the variations and **SELECTS + approves ONE** (`draft → approved`) — the only approval. |

Re-running the agent for the same post produces a **fresh** set of variations (the write path inserts new draft rows; existing drafts are untouched), so it is non-destructive.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. The variations are DRAFT `content` rows in `brand_os`; the operator selects + approves ONE in the `/post/[month]/[id]` workspace. **The agent never flips a gate** — it never selects/approves a variation, never sets `status`/`approved`, and never calls `update_status`, any `approve_*`, or any publish/schedule tool. The child skills own all writes: `ssc-post-produce` drafts unsaved; `ssc-post-authority` inserts only the passers. All persisted prose (variation copy + rating comments) is in **Vietnamese**. Producing requires `edit` (plus `view` for the resolve reads); approving a variation later requires `approve` in the workspace.

## After it runs

Point the operator to the **Posts workspace** → `/post/[month]/[id]` → **Copy** stage for the post that just ran, to review the saved variations and select + approve one. If the resolved date had more than one scheduled post, the remaining post(s) for that date still need their own pass — re-invoke this command per post.
