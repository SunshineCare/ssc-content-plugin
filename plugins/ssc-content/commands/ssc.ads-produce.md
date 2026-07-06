---
description: Produce ad TEXT for ONE approved ad concept, or revise its creative brief — a thin router. Dispatches ssc-ads-brief when the optional section argument is 'creative_brief'; otherwise dispatches ssc-ads-writer. ssc-ads-writer produces copy first (mandatory cold start); once copy is approved, headline, description, and image_content are each independently producible — gated only on copy, not on each other, and re-invocable any time for a fresh revision — chosen via the optional section argument or auto-picked among those not yet approved. It self-scores + saves the passing (≥4-rated) drafts straight to the server, and stops. The operator reviews/edits/approves at /ad/[month]/[id], then re-runs this command for any other freed section in any order; headline distils the approved copies, description compresses those copies (complementing an approved headline when one exists), image_content builds on those copies plus headlines/descriptions when they exist. ssc-ads-brief revises the idea's own creative-brief fields (hook_direction/core_message/why_now/story_moment/cta/theme, the same shape post ideas use) any time after copy is approved, reflecting whichever sections are currently approved — no content row, no draft/approve step, direct overwrite each run. Propose-only; saves drafts or revises brief fields, never approves.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **one of**:

- **Date** (`date`, format `YYYY-MM-DD` — a calendar day, e.g. `2026-07-14`). Resolved to the approved ad concept(s) for that day. If several concepts are scheduled that day, the dispatched skill works ONE concept per invocation.
- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). This is the key the dispatched skill reads and writes against.

If neither `date` nor `idea_id` is given, ask the operator for one (one question) before dispatching. Do not invent one.

Optional:

- **Section** (`section`) — one of `headline` | `description` | `image_content` | `creative_brief`. Names what to produce/revise this invocation. Omit to auto-pick the next open text section (`copy` first if not yet approved, else the first of `headline → description → image_content` without an approved row). `creative_brief` is **never** auto-picked — request it explicitly once ready for the handoff brief.
- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The dispatched skill resolves everything from the `idea_id`/`date`.

This command is the **text-production half** of the Ads pipeline. It runs **after** the Ads pipeline's **Ideate** step — a concept is only worked once it has been ideated and **approved** in the dashboard. It operates **per concept** and **per section**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is **no** `/ssc.plan` or `/ssc.ads` precondition beyond an approved concept.

## What to do

This command is a thin entry point — it holds **no** orchestration logic beyond a plain string check on `section`. **If `section == 'creative_brief'`**, it dispatches **`ssc-ads-brief`** (`idea_id` [, `date`]) and stops. **Otherwise** it dispatches **`ssc-ads-writer`** (`idea_id` [, `date`], optional `section` passthrough) and stops.

`ssc-ads-writer` is a **state-driven stepper**: `copy` is the mandatory cold-start section (no earlier input); once `copy` has ≥1 approved row, `headline`, `description`, and `image_content` are each **independently** producible — gated only on `copy` being approved, never on each other — and each may be **re-invoked after its own approval** for a fresh revision. On each invocation it works ONE target section (named via `section`, or auto-picked among those without an approved row) and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Reads `list_post_content(idea_id)`. If `copy` isn't approved yet, produces it (cold start, no earlier input). Otherwise resolves the target section (named, or auto-picked among headline/description/image_content without an approved row) and produces N Vietnamese variations for THAT section only, grounded in whichever of copy/headline/description is currently approved — pressing Cambridge proof points (≥3 distinct woven into each copy; the image_content step's 3 bullets ARE ≥3 proof; a headline/description carries 1–2 and the section's set covers ≥3) — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the passing (≥4-rated) drafts to the server** via `save_post_content` (`channel='ad'`, `idea_id`, `section`) and **stops**. | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc.ads-produce <idea_id> [section]`** — for any other freed section, or the same one again for a fresh revision. |

`ssc-ads-brief` revises the idea's own creative-brief fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`/`theme`) — no `content` row, no draft/approve step. It requires `copy` to be approved and directly overwrites the six fields each run with values grounded in whatever is currently approved, so re-running it after more sections get approved refreshes the brief.

**This flow renders no pictures** — the `image_content` step is the on-image COPY as structured text (headline hook + USP/proof subheadline + 3 USP/proof bullets), saved under `section='image_content'` for the dashboard to render. Each targeted section **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the target section already has unapproved drafts, the writer stops and asks the operator to approve/reject them first (it does not pile up a second batch).

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-writer` **saves DRAFT `content` rows** to the server and stops; `ssc-ads-brief` **revises the idea's own brief fields directly** (no draft state) and stops. The operator reviews / edits / approves `content` rows on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate, and revising the idea's brief fields never touches its `status` either. Propose-only (hard rule): neither producer ever calls any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish — and `ssc-ads-writer` never edits or deletes a `content` row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments + brief fields) is **Vietnamese**. Producing/revising requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.

## After it runs

After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `idea_id`, naming any other freed section (`headline`/`description`/`image_content`, any order) or the same section again for a fresh revision. Run `/ssc.ads-produce <idea_id> creative_brief` any time after `copy` is approved to (re)generate the handoff brief. Re-invoke per concept — it works ONE approved concept at a time.
