# Design: free the post-copy sections from strict chaining + add a `creative_brief` revise step

**Date:** 2026-07-06
**Status:** approved (design) — ready for implementation plan
**Scope:** `plugins/ssc-content/` — the ad TEXT production stepper (`/ssc.ads-produce` →
`ssc-ads-writer`), plus a new sibling skill `ssc-ads-brief`

## Problem

Since the 2026-07-05 copy-first reorder, `ssc-ads-writer` still runs its four sections
as a **strict linear chain**, each gated on the previous being approved:

```
copy → headline → description → image_content
```

Two problems with this, once `copy` (the source of truth) is approved:

1. **Headline, description, and image_content don't actually depend on each other** —
   each already leads from the approved **copy**; the design doc that introduced
   copy-first already demoted headline/description-as-input to "secondary reference."
   Forcing them into a strict sequence (approve headline before description can even
   start) adds a review bottleneck with no grounding benefit.
2. **There's no step that packages the finished text for handoff.** Once text
   production is done, whoever builds the visual (`ssc-ads-image`) or traffics the ad
   has to reconstruct the concept's story from four separate dashboard rows. Nothing
   synthesizes "here's the concept, here's what we're running, here's why" the way
   the Posts pipeline's per-idea brief fields (`hook_direction` / `core_message` /
   `why_now` / `story_moment` / `cta` / `theme`, written by `ssc-post-ideate`) already
   do for posts.

## Decision

**A. Free `headline`, `description`, and `image_content` from chaining each other.**
Each is gated **only** on `approved(copy)` — not on each other — and each is
**re-invocable at will** even after it already has an approved row (producing a
fresh batch grounded in whatever is currently live-approved). `copy` is unchanged:
still the mandatory cold-start section with no earlier input.

**B. Add a new step, `creative_brief`, via a new sibling skill `ssc-ads-brief`.**
Unlike the other three, it does not write a `content` row at all — it revises the
**idea's own structured brief fields** (the same fields `ssc-post-ideate` already
writes for posts: `hook_direction`, `core_message`, `why_now`, `story_moment`,
`cta`, `theme`) via a dedicated update tool, so ad concepts end up with the same
brief shape post ideas already have. It is gated only on `approved(copy)`, like the
other freed sections, and every invocation **recomputes from scratch** — there is no
draft/approved state to manage, so "revise" just means "run it again once more
approvals exist."

## New chain shape

```
copy   (mandatory, cold-start, unchanged)
  └─→  headline          ┐
       description       │  each gated ONLY on approved(copy),
       image_content     │  independent of each other,
       creative_brief    ┘  re-invocable at will
```

## A. `/ssc.ads-produce` routing (stays thin)

New optional second argument: `/ssc.ads-produce <idea_id> [section]`.

The command does a **pure string check** on `section` — no tool calls, so it stays a
thin dispatcher with no orchestration logic:

- `section == 'creative_brief'` → dispatch **`ssc-ads-brief`**
- anything else, or omitted → dispatch **`ssc-ads-writer`** with `idea_id` +
  optional `section` passthrough

`creative_brief` is **never auto-picked by default** — it's opt-in, a "sync the
handoff brief" action rather than part of the automatic stepper. With no `section`
argument, the default auto-pick still only considers `copy → headline →
description → image_content`.

## B. `ssc-ads-writer` changes

### Step 2 (gate), rewritten

1. not `approved(copy)` AND `has_drafts(copy)` → STOP (unchanged).
2. not `approved(copy)` → active = **`copy`** (unchanged; any `section` argument is
   ignored pre-copy — nothing else can run before it).
3. `approved(copy)` = true:
   - `target` = the requested `section` argument if it names `headline`,
     `description`, or `image_content`; otherwise **auto-pick**: the first of
     `[headline, description, image_content]` (in that nominal order) with no
     approved row yet.
   - If all three already have an approved row and no `section` was named → STOP:
     *"all text sections have an approved variation — name a section for a fresh
     revision, or run `/ssc.ads-produce <idea_id> creative_brief`."*
   - If `has_drafts(target)` (pending, unreviewed drafts for that section) → STOP:
     approve/reject those first (the existing pileup guard, now evaluated per
     target section instead of per chain-position).
   - Else → active = `target`, produce a fresh N-variation batch. This one rule
     covers both "first time producing this section" and "re-revision of an
     already-approved section" — there is no separate code path for the latter.

### Step 4 (input grounding), generalized

Each of the three freed sections reads **whatever upstream is currently approved**,
opportunistically, instead of hard-requiring it:

- `headline` — live approved `copy` pool. Unchanged (copy is guaranteed approved by
  the gate).
- `description` — live approved `copy` (primary, leads the promise) **+** live
  approved `headline` **if any** (secondary complement-check per
  `ad/copy-checklist` Bước 2B). If no headline is approved yet, proceed on copy
  alone and note in the Step 9 summary that there was no headline to complement
  against yet.
- `image_content` — live approved `copy` (anchor) **+** live approved `headline` /
  `description` **if any**. Degrades gracefully to copy-only grounding when they're
  absent — the anchor copy alone is sufficient to derive the on-image
  HEADLINE/SUBHEADLINE/BULLETS.

### Step 7, conditional check

The "must complement every approved headline, never echo" rule for `description`
applies **only when at least one headline is currently approved**. With none
approved, that check is skipped (nothing to avoid echoing) — this is a relaxation
of an existing hard rule, not a new one.

### Step 9, next-action rewrite

Replace the fixed "next section in the chain" instruction with: any of
headline/description/image_content can be run in any order or re-run for a fresh
revision; run `/ssc.ads-produce <idea_id> creative_brief` once ready for the
handoff brief.

### Unaffected

The producer↔page contract (`section` ∈ `{headline, copy, description,
image_content}` exactly, all four TEXT sections rendered from `body`), the
quality gate (Step 7's Direct-Response checklist, banned-words/compliance scan,
authenticity guardrail, ≥3-proof-density rules), the save-to-server-not-in-chat
behavior, and every propose-only invariant are **byte-for-byte unchanged**.

## C. New skill: `ssc-ads-brief`

`skills/ssc-ads-brief/SKILL.md`, dispatched by `/ssc.ads-produce <idea_id>
creative_brief`.

- **Step 1 — resolve the concept.** Same resolution + gate pattern as
  `ssc-ads-writer`/`ssc-ads-image`'s own Step 1: `get_idea`, require `channel='ad'`
  AND `status='approved'`, hold `idea.id`/`title`/`ad_notes`/`tags[]`.
- **Step 1b — resolve `build_spec`.** Same as `ssc-ads-writer` Step 1b (via
  `get_channel_plan`) — needed for the `why_now` field's audience-stage/timing
  rationale.
- **Step 2 — gate.** Requires `approved(copy)` only (via `list_post_content`,
  same as the writer). Not approved → STOP with the standard "approve copy first"
  message. No `has_drafts` pileup guard applies here — there is no draft state for
  idea detail fields, so there is nothing pending to collide with.
- **Step 3 — read live approved content.** `list_post_content(idea_id)`: hold the
  live approved `copy` (required) and live approved `headline` / `description` /
  `image_content` if present (each optional).
- **Step 4 — derive the brief fields** and call the update tool:

  ```
  Call: update_idea
    id:             <idea.id>
    hook_direction: <...>
    core_message:   <...>
    why_now:        <...>
    story_moment:   <...>
    cta:            <...>
    theme:          <...>
  ```

  | Field | Derived from |
  |---|---|
  | `hook_direction` | The winning approved copy's opening hook (or the approved headline, which already distills it, if present) |
  | `core_message` | The concept's strategic argument — `idea.title` sharpened by the approved copy's core promise |
  | `why_now` | The ad-set's audience-stage/timing rationale from `build_spec` (cold/warm/L2) + the plan period |
  | `story_moment` | A concrete scene from the approved copy, if the concept is story/person-led (`frame=confession` etc.); otherwise explicitly noted as not applicable — never fabricated |
  | `cta` | The actual CTA phrasing used in the approved copy/description (from `ad/cta-catalog`) |
  | `theme` | The concept's `value`/`frame` tags, expressed as a short label |

  This only revises informational fields on an already-approved idea — it never
  touches `status`, so it stays inside the propose-only rule the same way
  `update_idea_rating` already revises rating fields without flipping lifecycle
  state.
- **Step 5 — output summary.** Report which fields were written, which upstream
  sections were available vs. still unapproved (so the operator knows the brief
  will read richer once more sections are approved), and the next action:
  *"re-run any time after approving more sections to refresh the brief."*

**No draft/approve dance, no scoring loop, no N variations** — every invocation
directly overwrites with freshly-derived values. This is what makes it a "revise":
each re-run recomputes from whatever is currently approved, so there's nothing
stale to reload.

**Server-dependency note (flagged explicitly in the SKILL.md, same pattern
`ssc-ads-image` uses for its to-be-built tools):** this design assumes a
dedicated `update_idea` tool (distinct from `save_idea`'s insert-only and
`update_idea_rating`'s rating-only scope) exists on the BrandOS surface, taking
`id` plus the six detail fields above. Verify the exact tool/field names against
the live surface before or during implementation.

**Explicitly does not gate `ssc-ads-image`.** That skill's precondition stays
`approved(image_content)` only — `creative_brief` is a human-facing handoff
artifact, not a machine gate for the visual pipeline.

## Doc touch-ups

- `plugins/ssc-content/CLAUDE.md` — Ads (produce) pipeline row: reflect the new
  chain shape (copy mandatory; headline/description/image_content/creative_brief
  freed).
- `commands/ssc.ads-produce.md` — frontmatter `description` + body rewritten for
  the two-skill routing and freed-gating behavior; document the optional `section`
  argument.
- `skills/ssc-ads-writer/SKILL.md` — frontmatter `description` + Steps 2, 4, 7, 9 +
  Governance section per section B above.
- `skills/ssc-ads-brief/SKILL.md` — new file per section C above.
- **No BrandOS-facing spec doc needed** (unlike `image_content`'s rollout) — the
  brief fields already exist on the post side and, per confirmation, the
  equivalent ad-side structure and update path are already in place.

## Explicitly NOT changing (contract-preserving)

- **`save_post_content` section values** — still exactly `headline | copy |
  description | image_content`. `creative_brief` is not a `content` section and
  never appears there.
- **The `/ad/[id]` dashboard's content grouping** — unchanged; it never sees a
  `creative_brief` row.
- **`ssc-ads-image`'s gate** — still `approved(image_content)` only.
- **The plan pipeline** (Focus → Approaches → Blueprint → Ideate) — untouched.
- **The quality gate, proof-density rules, and every propose-only invariant** in
  `ssc-ads-writer` — untouched.

## Testing / verification

No compiled code — verification is prose-consistency and the governance hook:

1. **Chain-string sweep:** after edits, `grep` the repo for the old strict-chain
   framing ("gated on the previous being approved" applied to
   headline/description/image_content, "the chain is strict: never produce X
   before Y is approved") and confirm no stale strict-chain language remains
   outside this design doc.
2. **Internal consistency:** the Step 2 gate table, Step 4 input rules, and Step 9
   next-action lines in `ssc-ads-writer` all agree that only `copy` gates the other
   three, and that each is independently re-invocable.
3. **Invariant preservation:** propose-only rules, the four `section` values, and
   the ≥3-proof-density rules are byte-for-byte intact in `ssc-ads-writer`.
4. **`ssc-ads-brief` never calls an approval/lifecycle tool** — only `get_idea`,
   `get_channel_plan`, `list_post_content`, and the brief-field update tool.
5. **Governance hook untouched** — `hooks/approval-gate.mjs` still denies subagent
   `approve_*`/`unapprove_*` (exercise per CLAUDE.md's echo-pipe test).

## Out of scope

- Any change to how many variations are produced for headline/description/
  image_content (`n_headlines` etc. stay default 5).
- `creative_brief` producing N variations — explicitly one canonical revision per
  run.
- The visual (`ssc-ads-image`) layer chain and its gating.
- Dashboard UI changes.
