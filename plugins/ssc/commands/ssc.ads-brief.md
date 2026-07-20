---
description: >-
  Generate rated DRAFT creative-brief ANGLES for ONE approved ad concept — the FIRST step of brief-first ad production, run before any copy. A thin entry point that dispatches ssc-ads-brief. It ALWAYS APPENDS: run it on a fresh concept and you get up to five distinct angles; run it again on a concept that already has briefs and it adds whichever distinct angles still remain, leaving every existing brief (draft AND approved) untouched. Re-invoking is how an idea's angle set grows — there is no produce-once stop and no discard-and-regenerate path. ssc-ads-brief resolves ONE approved ad concept (an ideas row, channel='ad', status='approved' — by idea id or date) plus its ad-set build_spec, loads the persona detail doc as the PRIMARY angle source, reads ALL existing briefs via list_briefs as the TAKEN SET (comparing their five narrative fields, not just their labels), and — with NO copy precondition — proposes only angles genuinely distinct from every existing brief AND from each other (each anchored to a different persona trigger/objection/myth, expressed through the concept's title/tags/ad_notes + build_spec). Per angle it derives the five narrative fields (hook_direction/core_message/why_now/story_moment/cta — ad ideas never carry theme) plus a MANDATORY short Vietnamese angle_label and a 1-5 score + comment, drops/regenerates any angle ≤3 until all are ≥4, then saves each as a DRAFT brief via save_brief (which mints DRAFT briefs only) and stops. It NEVER pads: if the concept supports no further distinct angle it says so plainly in Vietnamese and writes nothing — an ordinary, successful outcome. Each angle persists as its own brief row with its own angle_label — an idea carries SEVERAL angle briefs. The operator reviews and APPROVES the angle(s) worth producing at /ad/[month]/[id]; each approved angle then anchors its own independent production run — its own copy (/ssc.ads-produce <brief_id> [section]) and its own creative chain (/ssc.image-prompt <brief_id>), one brief_id per run. Propose-only; save_brief saves drafts, never approves, and the skill never deletes or edits a brief.
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

`ssc-ads-brief` is an **append-only angle generator that runs first**: with **no copy precondition**, it derives **distinct, rated DRAFT creative-brief angle briefs** from the concept (`title`/`tags`/`ad_notes`) + the ad-set `build_spec` + the persona detail doc — each anchored to a *different* persona trigger point / objection / myth, each carrying a mandatory short Vietnamese `angle_label`, the five narrative fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta` — never `theme`, which ad ideas don't carry), and a 1–5 score + Vietnamese comment. It self-scores each angle, drops + regenerates any rated ≤3 until every saved angle is ≥4, then **saves each as a DRAFT `brief`** via `save_brief` (which mints DRAFT briefs only) and **stops**. Briefs live in a `briefs` table (not on the idea row, not a `content` row) — **each angle is its own brief row with its own `angle_label` and `brief_id`**, so an idea genuinely carries several angle briefs. The operator reviews and **approves the angle(s) worth producing**; each approved angle then anchors its own independent production run.

### What a bare `/ssc.ads-brief <idea_id>` does — every time

**It appends.** There is no produce-once stop and no "regenerate" mode:

- **On a concept with no briefs yet (cold start)** — you get **up to five** distinct rated angles, saved as DRAFT briefs.
- **On a concept that ALREADY has briefs** — it does **not** stop. It reads **all** of them (**any status** — approved *and* draft alike) as the **taken set**, compares against their five narrative fields (not just their labels), and **appends only the angles that genuinely remain** — however many that honestly is. Every existing brief is left exactly as it was: **nothing is deleted, edited, re-scored, or re-labelled**, and the copy and creatives already anchored to those briefs are untouched.
- **When no distinct angle remains** — it writes **nothing** and says so plainly, in Vietnamese, naming the reason (the concept's distinct angles are exhausted) and suggesting you sharpen the concept (`title` / `tags` / `ad_notes`) if you genuinely want more. **An empty run is an ordinary, successful outcome**, not an error — the skill will never pad the set with a near-duplicate angle, because a duplicate angle is a wasted production track (its own copy run, its own creative chain) and makes the set impossible to curate at a glance.

**So: want another angle? Just re-run this command.** That is the whole procedure — no brief is discarded, no brief is edited.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-brief` **saves DRAFTS** and stops: NEW DRAFT `brief` rows (one row per rated angle) via `save_brief`, **appended alongside** whatever the concept already carries. The operator reviews / curates and **approves the angle(s) worth producing** on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate and never touches an idea's `status`. Propose-only (hard rule): the skill never calls any tool that changes approval or lifecycle state in either direction — never `approve` (the ONLY gated promotion, denied to agents by the approval hook; any entity incl. `brief`, any gate), never publish, and never `edit`/`delete` used to demote, discard, re-score, or re-label a row (the operator owns every row in the dashboard). **Append-only, structurally:** `save_brief` is the skill's only write — it holds neither `delete` nor `edit`, so destroying or mutating an existing brief is not merely forbidden, it is unreachable. All persisted prose (the brief angle fields, labels, and comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve reads); approving a draft brief later requires `approve` on the page.

**Discarding an angle is an operator act with real consequences — and it is never how you get new angles.** Re-running this command is. If you *do* want to discard an angle in the dashboard, know what happens **today**: a brief is **HARD-deleted** (no tombstone — the angle is gone for good, unrecoverable); an **approved** brief cannot be deleted until you **un-approve** it first (an `approve`-capability act, yours alone — no skill or agent can do it); a brief that already has **creatives** cannot be deleted until you delete those visual layers first (each irreversibly purges its image); and the **copy written from that angle survives, unbound** (`content.brief_id` is set to NULL) — copy that no longer belongs to any angle, which is what makes `/ssc.image-prompt` stop on a multi-angle concept rather than risk the wrong angle's story. The agreed target replaces that with a true cascade (see the `ads-angle-set-curation` change); until it ships, the behaviour above is what you get.

## After it runs

After `ssc-ads-brief` appends the new angle(s), point the operator to `/ad/[month]/[id]` for the concept to **review them and approve the one(s) worth producing**. An angle you don't want is simply an angle you never approve — it costs nothing to leave it sitting as a draft. Each approved angle is an **independent production track**, anchored to its own `brief_id`: produce that angle's ad text with **`/ssc.ads-produce <brief_id>`** (copy first, then `headline`/`description`/`image_content`), and its visual with **`/ssc.image-prompt <brief_id>`** — one `brief_id` per run, and the approved angles can be produced in any order or left unproduced.

**Want more angles later? Re-run `/ssc.ads-brief <idea_id>`.** It appends whatever distinct angles still remain — including a sixth angle on a concept that already carries five approved briefs — without discarding, editing, or re-scoring anything already there, and without disturbing the copy or creatives anchored to the existing angles. If nothing distinct remains, it writes nothing and tells you so (see "What a bare `/ssc.ads-brief <idea_id>` does"). If the run comes back empty and you genuinely want more angles, sharpen the concept (`title` / `tags` / `ad_notes`) and re-run — **do not** discard briefs to "reset" it; that destroys the discarded angle's copy and creatives and gains you nothing (see Governance).

Re-invoke per concept — it works ONE approved concept at a time.
