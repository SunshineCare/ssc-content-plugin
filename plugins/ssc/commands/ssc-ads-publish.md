---
argument-hint: '<brief_id> <ad_set_id> [ad_account_id]'
description: >-
  Terminal ads stage: assembles the publish-ready creative payload for ONE approved angle
  brief into an ad set the operator already made (`<brief_id> <ad_set_id>`), records a
  compliance verdict per asset, then presents the payload and STOPS. It creates nothing —
  the operator commits with the dashboard's Publish click, and it never calls
  create_campaign, create_adset, create_ad or update_budget.
metadata:
  dispatches: [ssc-ads-publish]
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input — **required, both**:

- **Angle brief ID** (`brief_id`) — the id of ONE **approved** angle brief whose content has been
  produced by `/ssc-ad` and approved in the dashboard. The stage resolves it via `get_brief(brief_id)`,
  which returns the brief **and** its owning ad concept in one call — so there is **no separate
  `idea_id`** and **no `date` selector**.
- **Target ad set** (`ad_set`) — the ad set the ad will be created in. It is an **explicit operator
  input and is never inferred**: not from the brief, not from the concept, not from the layer, not
  from "the only ad set that showed up in a performance read". Guessing here would silently spend the
  **wrong budget**. If it is missing, the dispatched skill asks for it once and **stops** — it
  assembles nothing and produces no payload.

Optional:

- **Ad account** (`ad_account`) — the account the ad set must belong to. Omit it when one account is
  managed; supply it when several are.
- **Period** (`period`, `YYYY-MM`) — informational only, used when pointing the operator at
  `/ad/[month]/[id]`.

This command is the **fifth and last** step of the Ads pipeline. It runs **after** `/ssc-ads-brief`
produced angle briefs and one was approved, and **after** `/ssc-ad` produced that angle's copy (plus
whichever of headline/description apply) and the operator approved it. It reads **no** `channel_plan`
gate flags and has no `/ssc-ads-plan` precondition beyond an approved brief with approved content.

**Budget, audience and placement are not inputs.** This stage pushes creative into an ad set a human
already set up in Ads Manager; media buying sits outside the creative pipeline.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches
**`ssc-ads-publish`** (`brief_id`, `ad_set` [, `ad_account`]) and stops.

`ssc-ads-publish` **prepares a payload and STOPS**. In order: it requires the ad set before anything
else, resolves and gates the brief, resolves publishable state from the approved content set,
assembles the `asset_feed_spec` **verbatim**, re-runs the **compliance floor per asset** across exactly
the assets being published (recording each verdict — an unrecorded verdict is a failure at publish, not
a pass) and the **set-level coverage** judgement across exactly that set, resolves **both linkage
grains** onto the payload, then presents it and stops.

**What the `asset_feed_spec` carries.** N bodies from the approved `copy` rows, N titles
from `headline`, N descriptions from `description` — the text **VERBATIM**. A section
with **no approved rows is omitted** rather than emitted empty or invented, and
`image_content` and `storyboard` are **never** included.

**The compliance floor is re-run per asset**, across exactly the assets being published.
A row saved by `/ssc-ad` sits at `compliance_status='pending'`; the stage records each
verdict via `record_compliance`, and an **unrecorded verdict is treated as a FAILURE at
publish, never a pass**.

**Both linkage grains are resolved onto the payload** — **ad → brief**, and **ad asset →
content row**, matched on normalised exact text (a 4/5/4 set resolves 13 links). That is
what makes attribution unskippable by construction.

| The stage does | Then the operator… |
|---|---|
| Prepares and presents the payload — target ad set, assembled asset feed, floor verdict per asset, coverage verdict per section, and both linkage grains with the link count — and **creates nothing**. Or it **stops cleanly** with no payload: no ad set supplied; brief not approved; sections written but unapproved (named); no approved `copy` (it is required); no assets; a floor failure (asset + rule named); a coverage collapse (axis named); already published — an already-published brief is reported DONE and never mints a second payload. | Opens `/ad/[month]/[id]` and clicks **Publish**. The dashboard first **prepares** server-side (a read that creates nothing) and offers the button **only** for a `ready` payload; the commit then sends `{ brief, ad_set }` — **not** the payload — so the server re-resolves the stage and creates the ad from its **own** result. |

**The presented payload is a faithful preview, not the committed artifact.** The server's
re-resolution at commit time is authoritative — it is also where the already-published check and the
ad-set existence / account-membership validation are truly enforced. If the two ever disagree, the
server is right.

**Publish is deliberately NOT a writer section.** `/ssc-ad`'s stepper auto-picks the next open
section, so folding publishing into it would make publishing something the pipeline drifts into by
exhaustion of sections. The writer has exactly three sections (`copy`, `headline`, `description`) —
on-image copy is authored at the ImageStudio Text step (`/ssc-image-prompt <brief_id> text`) — knows
nothing about this stage, and stops when they are all approved rather than advancing into it.

## Governance

Nothing auto-publishes. The stage **prepares and stops**; the operator commits with the dashboard's
Publish click (`POST /api/ad-publish/commit`), which is **not an agent-callable tool**. Propose-only
(hard rule): `ssc-ads-publish` **never** calls `create_campaign`, `create_adset`, `create_ad` or
`update_budget` — not for a dry run, not to save a click — **never** calls `approve` (the ONLY gated
promotion, denied to agents by the approval hook; any entity, any gate), never un-approves, never uses
`edit` to demote a row, and never edits or deletes a content row. Its **only** write is
`record_compliance` — the floor verdict on each asset it just judged, which is a recorded assessment,
not an approval, and flips no gate. It creates or modifies **no** campaign and **no** ad set, and reads
or writes **no** budget field.

The `plugins/ssc/hooks/approval-gate.mjs` PreToolUse hook backs this at the harness layer: the four
money-moving tools are **denied from a subagent** and **asked in the main operator conversation**, the
same posture as approval. **Honest caveat:** `create_campaign`, `create_adset` and `create_ad` are
still registered as **agent-callable** MCP tools server-side (`update_budget` is not — it declares
`spendsCredits`, which makes it invisible to an agent and refused if reached anyway), so the hook is
**defence in depth, not server-side closure**. Do not describe the create surface as closed.

All persisted prose (the recorded compliance `reasons`) is **Vietnamese**. Preparing requires `edit`
(for `record_compliance`) plus `view` for the resolve reads; committing happens in the dashboard.

## After it runs

If the stage **presented a payload**: open `/ad/[month]/[id]`, check the payload the dashboard
re-resolves against the one you just read, and click **Publish** to commit. That single click creates
exactly one ad and its creative in the named ad set, records both linkage grains, and touches no
campaign, no ad set and no budget.

If the stage **stopped**: fix the named reason and re-run this command — approve the brief, approve
(or reject) the sections it named, run `/ssc-ad <brief_id> <section>` for a fresh variation when an
asset failed the floor or the set collapsed on an axis, or supply the ad set. A stop is an ordinary
outcome, and it is the point of the stage: it is the last moment a floor-failing or coverage-collapsed
set can be caught before it reaches the public.

If the stage reported the brief **already published**: there is nothing to do — re-entry never mints a
second ad.
