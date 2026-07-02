---
description: Produce ad creative for ONE approved ad concept — run ssc-ads-writer (headline/copy/description) then ssc-ads-creative (images) for the concept id. Each producer PRESENTS its candidate set in chat, waits for the operator to review/revise, and saves drafts only on the operator's go-ahead; propose-only drafts the operator then curates at /ad/[month]/[id].
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). Required. This is the key both producers read and write against.

Optional:

- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The producers resolve everything from the `idea_id`.

If no `idea_id` is given, ask the operator for one (one question) before dispatching. Do not invent one.

This command is the **production half** of the Ads pipeline. It runs **after** the Ads pipeline's **Ideate** step — a concept is only worked once it has been ideated and **approved** in the dashboard. It operates **per concept**, never on a whole plan: it reads **no** `channel_plan`, no gate flags, and no `tactics_approved`/`approaches_approved`/Blueprint state. There is **no** `/ssc.plan` or `/ssc.ads` precondition beyond an approved concept.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It sequences the two existing ad-production skills for the resolved concept, in order, both **propose-only**. **Production is an INTERACTIVE step in the operator's conversation:** each producer presents its candidate set and WAITS for the operator to review/revise before it saves anything — it does not autonomously save then walk away.

| Step | The skill does | Then the operator… |
|---|---|---|
| **Writer** | Run **`ssc-ads-writer`** for the concept — drafts N Vietnamese text variations per section (headline / copy / description), self-scores each 1–5 with a Vietnamese comment, then **PRESENTS the candidate set in chat and pauses**: the operator requests rewrites (regenerate → re-score → re-present, in a loop) or approves the set, and **only on the go-ahead** does the writer save the passers as DRAFT `content` rows via `save_post_content` (`channel='ad'`, `idea_id`, `section` ∈ `headline\|copy\|description`, carrying `body` + `score` + `comment`). | Reviews/revises the text variations in chat, then says **save** to persist the drafts. |
| **Creative** | Run **`ssc-ads-creative`** for the concept — builds the brand-adapted HTML creatives, screenshots each to a PNG, self-scores each 1–5 with a Vietnamese comment, then **PRESENTS each style as a viewable preview in chat (local screenshot / render, and/or an R2 preview link) and pauses**: the operator requests re-renders (rebuild → re-screenshot → re-score → re-present) or approves the set, and **only on the go-ahead** does the creative save them as DRAFT `content` rows via `save_post_content` (`channel='ad'`, `idea_id`, `section='image'`) + `upload_creative` (→ `creativeUrl`). The DB draft row is deferred to the go-ahead — no orphan rows for rejected creatives. | Reviews/revises the creatives in chat, then says **save**; then opens `/ad/[month]/[id]` → curates the drafts (select = approve / unselect = draft) per section. |

Both skills are **per concept** and read **no** channel_plan gates. Run the writer first (the creative can reuse already-curated headline rows when present, else derives its own headline), then the creative. **"Save" persists drafts; it is NOT approval/selection** — the operator still curates the winners on the page. Re-running this command for the same concept produces a **fresh** set of drafts (the write path inserts new draft rows; existing drafts are untouched), so it is non-destructive. The main revise flow happens in chat BEFORE saving; a weak draft caught **after** save does **not** need a full re-run: the producer patches it in place via `edit_content` or retires it via `delete_content` — but only ever on a draft it created itself this run, never on an operator-curated or approved row. Full re-runs are for genuinely new sets, not for fixing one row.

## Governance

Nothing auto-saves, auto-approves, auto-applies, or auto-publishes. Each producer PRESENTS its candidate set in chat and waits for the operator's go-ahead before it saves anything — the review/revise loop runs entirely in conversation and writes no draft rows until the operator approves the set. On go-ahead the variations become DRAFT `content` rows in `brand_os`; the operator then selects (approve) / unselects (draft) each on the `/ad/[month]/[id]` production page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producers never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run (the secondary post-save path). Everything else belongs to the operator in the dashboard. All persisted prose (variation copy + rating comments) is in **Vietnamese**. Producing requires `edit` (plus `view` for the resolve reads); approving a draft later requires `approve` on the page.

## After it runs

Only after the operator has reviewed each producer's set in chat and given the go-ahead to save, point them to the **ad-production page** → `/ad/[month]/[id]` for the concept that just ran, to curate (select/unselect) the saved headline / copy / description / image drafts per section. (If the operator is still mid-review in chat, finish the revise loop and save first.) Re-invoke this command per concept — it works ONE approved concept at a time.
