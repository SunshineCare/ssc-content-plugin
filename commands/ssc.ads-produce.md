---
description: Produce ad creative for ONE approved ad concept — run ssc-ads-writer (headline/copy/description) then ssc-ads-creative (images) for the concept id; propose-only drafts the operator curates at /ad/[month]/[id].
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

This command is a thin entry point — it holds **no** orchestration logic. It sequences the two existing ad-production skills for the resolved concept, in order, both **propose-only**:

| Step | The skill does | Then the operator… |
|---|---|---|
| **Writer** | Run **`ssc-ads-writer`** for the concept — drafts N Vietnamese text variations per section (headline / copy / description), self-scores each 1–5 with a Vietnamese comment, and saves the passers as DRAFT `content` rows via `save_post_content` (`channel='ad'`, `idea_id`, `section` ∈ `headline\|copy\|description`, carrying `body` + `score` + `comment`). | — |
| **Creative** | Run **`ssc-ads-creative`** for the concept — builds the brand-adapted HTML creatives, screenshots each to a PNG, and saves them as DRAFT `content` rows via `save_post_content` (`channel='ad'`, `idea_id`, `section='image'`, `creativeUrl`), self-scoring each 1–5 with a Vietnamese comment. | Opens `/ad/[month]/[id]` → curates the drafts (select = approve / unselect = draft) per section. |

Both skills are **per concept** and read **no** channel_plan gates. Run the writer first (the creative can reuse already-curated headline rows when present, else derives its own headline), then the creative. Re-running this command for the same concept produces a **fresh** set of drafts (the write path inserts new draft rows; existing drafts are untouched), so it is non-destructive.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. The variations are DRAFT `content` rows in `brand_os`; the operator selects (approve) / unselects (draft) each on the `/ad/[month]/[id]` production page. **The producers never flip a gate** — they only INSERT DRAFT rows via `save_post_content`, and never call `approve_*`, `update_status`, or any publish tool. All persisted prose (variation copy + rating comments) is in **Vietnamese**. Producing requires `edit` (plus `view` for the resolve reads); approving a draft later requires `approve` on the page.

## After it runs

Point the operator to the **ad-production page** → `/ad/[month]/[id]` for the concept that just ran, to review the saved headline / copy / description / image drafts and curate (select/unselect) each section. Re-invoke this command per concept — it works ONE approved concept at a time.
