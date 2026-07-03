---
description: Produce ad TEXT for ONE approved ad concept — a state-driven, per-section stepper. Dispatches ssc-ads-writer, which produces the single next open section in the chain headline → copy → description (whichever is not yet approved), self-scores + saves the passing (≥4-rated) drafts straight to the server, and stops. The operator reviews/edits/approves that section at /ad/[month]/[id], then re-runs this command for the next section; copy builds on the approved headlines, description on the approved headlines + copies. Text only — no images. Propose-only; saves drafts, never approves.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). Required. This is the key `ssc-ads-writer` reads and writes against.

Optional:

- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The writer resolves everything from the `idea_id`.

If no `idea_id` is given, ask the operator for one (one question) before dispatching. Do not invent one.

This command is the **text-production half** of the Ads pipeline. It runs **after** the Ads pipeline's **Ideate** step — a concept is only worked once it has been ideated and **approved** in the dashboard. It operates **per concept** and **per section**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is **no** `/ssc.plan` or `/ssc.ads` precondition beyond an approved concept.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single text producer **`ssc-ads-writer`** for the resolved concept, then stops. `ssc-ads-writer` is a **state-driven, per-section stepper**: on each invocation it works the **single next open section** in the approval chain **`headline` → `copy` → `description`** and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Reads `list_post_content(idea_id)` to find the next section not yet approved (headline, then copy, then description). Produces N Vietnamese variations for THAT section only — pressing Cambridge proof points (≥3 distinct woven into each copy; a headline/description carries 1–2 and the section's set covers ≥3) — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the passing (≥4-rated) drafts to the server** via `save_post_content` (`channel='ad'`, `idea_id`, `section`) and **stops**. Later sections build on the operator's **approved** earlier sections (copy on the approved headlines; description on the approved headlines + copies). | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc.ads-produce <idea_id>`** — the writer detects the newly-approved section and produces the next one. |

**This flow is text-only — it produces no images.** The producer works **one section per run** and reads **no** channel_plan gates. It **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the next section already has unapproved drafts, the writer stops and asks the operator to approve them first (it does not pile up a second batch). Re-running for a section that is already approved simply advances to the next open section; when all three sections have an approved variation, the writer reports the text is complete.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-writer` **saves DRAFT `content` rows** to the server and stops; the operator reviews / edits / approves each section on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish — and never edits or deletes a row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.

## After it runs

After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `idea_id` to produce the next section (headline → copy → description). When all three sections have an approved variation, the writer reports the text is complete. Re-invoke per concept — it works ONE approved concept at a time.
