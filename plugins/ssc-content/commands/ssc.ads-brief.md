---
description: Generate 4-5 rated DRAFT creative-brief ANGLES for ONE approved ad concept — the FIRST step of brief-first ad production, run before any copy. A thin entry point that dispatches ssc-ads-brief. ssc-ads-brief resolves ONE approved ad concept (an ideas row, channel='ad', status='approved' — by idea id or date) plus its ad-set build_spec, loads the persona detail doc as the PRIMARY angle source, and — with NO copy precondition — selects up to five distinct angles (each anchored to a different persona trigger/objection/myth, expressed through the concept's title/tags/ad_notes + build_spec), derives per angle the five narrative fields (hook_direction/core_message/why_now/story_moment/cta — ad ideas never carry theme) plus a MANDATORY short Vietnamese angle_label and a 1-5 score + comment, self-scores and drops/regenerates any angle ≤3 until all are ≥4, then saves each as a DRAFT brief via save_brief (which mints DRAFT briefs only) and stops (a produce-once guard stops it instead if briefs already exist). The operator reviews and APPROVES ONE angle at /ad/[month]/[id], then writes copy anchored to it via /ssc.ads-produce <idea_id> <brief_id> [section]. Propose-only; save_brief saves drafts, never approves. NOTE the server "Change 2" dependency — today's server persists one brief per idea and nulls angle_label, so the multi-angle payoff is inert until Change 2 ships (forward-compatible).
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **one of**:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). This is the key the dispatched skill reads and writes against.
- **Date** (`date`, format `YYYY-MM-DD` — a calendar day, e.g. `2026-07-14`). Resolved to the approved ad concept(s) for that day. If several concepts are scheduled that day, the dispatched skill works ONE concept per invocation.

If neither `idea_id` nor `date` is given, ask the operator for one (one question) before dispatching. Do not invent one. There is **no** `section` and **no** `brief_id` here — this command only **generates** the angle set; producing text from a chosen angle is `/ssc.ads-produce`.

Optional:

- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The dispatched skill resolves everything from the `idea_id`/`date`.

This command is the **first step** of the brief-first Ads production flow. It runs **after** the Ads pipeline's **Ideate** step — a concept is only worked once it has been ideated and **approved** in the dashboard — and **before** any copy. It reads **no** `channel_plan` gate flags and requires **no** approved copy. There is **no** `/ssc.ads-plan` precondition beyond an approved concept.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches **`ssc-ads-brief`** (`idea_id` [, `date`]) and stops.

`ssc-ads-brief` is a **produce-once angle generator that runs first**: with **no copy precondition**, it derives **4-5 distinct, rated DRAFT creative-brief angle briefs** from the concept (`title`/`tags`/`ad_notes`) + the ad-set `build_spec` + the persona detail doc — each anchored to a *different* persona trigger point / objection / myth, each carrying a mandatory short Vietnamese `angle_label`, the five narrative fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta` — never `theme`, which ad ideas don't carry), and a 1–5 score + Vietnamese comment. It self-scores each angle, drops + regenerates any rated ≤3 until the whole set is ≥4, then **saves each as a DRAFT `brief`** via `save_brief` (which mints DRAFT briefs only) and **stops**. It runs a **produce-once guard** first: if the concept already has briefs it stops and routes the operator to curate / approve / discard them in the dashboard rather than appending or overwriting. Briefs live in a `briefs` table (not on the idea row, not a `content` row); the operator reviews and **approves one** angle brief in the dashboard.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-brief` **saves DRAFTS** and stops: DRAFT `brief` rows (up to five rated angles) via `save_brief`. The operator reviews / curates and **approves one** `brief` angle on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate and never touches an idea's `status`. Propose-only (hard rule): the skill never calls any tool that changes approval or lifecycle state in either direction — never `approve` (the ONLY gated promotion, denied to agents by the approval hook; any entity incl. `brief`, any gate), never publish, and never `edit` used to demote/unapprove/discard a row (the operator owns every row in the dashboard). All persisted prose (the brief angle fields, labels, and comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve reads); approving a draft brief later requires `approve` on the page.

## After it runs

After `ssc-ads-brief` saves the angle set, point the operator to `/ad/[month]/[id]` for the concept to **review the angles and approve ONE** to produce from (or curate / discard). Once an angle brief is approved, produce the ad text anchored to it with **`/ssc.ads-produce <idea_id> <brief_id>`** (copy first, then `headline`/`description`/`image_content`). This command produces the angle set **once**: if briefs already exist it stops and routes you to curate / approve / discard them in the dashboard (discard all there first to regenerate, then re-run `/ssc.ads-brief <idea_id>`). Re-invoke per concept — it works ONE approved concept at a time.
