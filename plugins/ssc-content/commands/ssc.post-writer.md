---
description: Launch the standalone Cambridge Diet Vietnam post-writer production loop — resolve a scheduled post (by date or idea id) → produce N Vietnamese copy variations → self-score + drop/regenerate to brand → PRESENT the set in chat for the operator's review (revise loop) → save as idea-linked drafts only on the operator's go-ahead. Interactive: waits for the operator's review before saving; does not save autonomously. Runs after the planning pipeline's Schedule. Propose-only; no /ssc.plan or /ssc.post-plan dependency.
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

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-post-writer-agent`**, passing the resolved target (`date` or `idea_id`) and `n` (if provided). The loop is **interactive**: it runs in the operator's conversation and **pauses at an in-chat review checkpoint before saving** — it does NOT save-and-stop autonomously. Across sessions it is also **state-driven**: on each invocation it does the next open step for the resolved post and stops at the next checkpoint / human gate:

| Step | The agent does | Then the operator… |
|---|---|---|
| **Resolve** | Resolves a single scheduled post — by `date` via `get_content_by_date(channel='post')`, or by `idea_id` via `get_idea`. Works ONE post at a time (a date with several scheduled posts is handled one idea per run). | — |
| **Produce** | `ssc-post-produce` drafts N distinct Vietnamese Facebook copy variations — each a different angle/hook — **in-conversation, UNSAVED**, grounded in `voice/*` + `content/*` + `channels/facebook`. | — |
| **Authority (score + present)** | `ssc-post-authority` scores each variation 1–5 with a Vietnamese rationale comment against `rules/*` + `voice/*` + `content/quick-checklist`, drops + regenerates any rated ≤3 until N are ≥4, then **PRESENTS the candidate set in chat** (numbered body + score + comment) and **PAUSES** — nothing saved yet. | Reviews the set in chat and either **requests revisions** to named variation(s) **or** gives the **go-ahead to save** as drafts. |
| **Revise loop** (on request) | The writer regenerates the named variation(s) in-conversation, the authority re-scores (stays ≥4) and re-presents — still UNSAVED. Repeats until the operator says to save. | Keeps requesting revisions, or gives the go-ahead. |
| **Save (on go-ahead)** | `ssc-post-authority` persists the operator-approved set via `save_content` (one `content` draft per variation, idea-linked). Saving persists DRAFTS to curate — **not** a gate approval. | Opens the workspace → `/post/[month]/[id]` → **Copy** stage → reviews the saved variations and **SELECTS + approves ONE** (`draft → approved`) — the only approval. |

The **primary revision path is now pre-save, in chat**. Re-running the agent for the same post produces a **fresh** set of variations (the write path inserts new draft rows; existing drafts are untouched), so it is non-destructive. As a **secondary** path, to fix a single weak draft AFTER the save instead of regenerating the whole set, the authority can patch a row it created this run in place via `edit(entity='content', …)` or retire it via `delete(entity='content', …)`.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes, and **nothing is saved autonomously** — the authority presents the candidate set in chat and waits for the operator's go-ahead before persisting. Saving persists DRAFT `content` rows in `brand_os` to curate; it is **NOT** a gate approval — the operator still selects + approves ONE in the `/post/[month]/[id]` workspace. **The agent never flips a gate** — it never changes approval or lifecycle state in either direction (never `approve` — the ONLY gated promotion, and the approval hook denies it to agents; no publish/schedule tool; and never `edit` used to demote/unapprove a row, demotion being an `edit` now rather than a separate `unapprove_*` tool) and never edits or deletes operator-curated or approved rows. The child skills own all writes: `ssc-post-produce` drafts (and revises on request) unsaved; `ssc-post-authority` inserts the operator-approved set only on the go-ahead. All persisted prose (variation copy + rating comments) is in **Vietnamese**; the in-chat review dialogue may be in the operator's language. Producing requires `edit` (plus `view` for the resolve reads); approving a variation later requires `approve` in the workspace.

## After it runs

If the operator gave the go-ahead and the set was saved, point them to the **Posts workspace** → `/post/[month]/[id]` → **Copy** stage for the post that just ran, to review the saved variations and select + approve one. If the loop is still at the in-chat review checkpoint, it resumes on the operator's revise/save instruction (nothing saved yet). If the resolved date had more than one scheduled post, the remaining post(s) for that date still need their own pass — re-invoke this command per post.
