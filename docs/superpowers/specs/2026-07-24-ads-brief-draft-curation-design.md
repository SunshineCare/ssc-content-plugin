# ssc-ads-brief — draft-set curation (edit + delete for angles)

**Date:** 2026-07-24
**Scope:** `ssc-content-plugin` only. No `mcp-server`, backend, hook, or schema change.
**Status:** approved design, pre-implementation.

## Problem

`ssc-ads-brief` is **append-only**: it can only `save_brief` (mint DRAFT angles).
Its frontmatter `tools:` omits `edit`/`delete`, and its prose repeatedly asserts
existing briefs are "READ-ONLY input… never deleted, edited, re-written, re-scored,
or re-labelled." So when a run produces a weak hero angle plus two near-duplicate
drafts, the agent cannot fix them — it must tell the operator to revise/discard by
hand in the dashboard.

The operator wants the skill to **curate its own DRAFT set**: revise a weak draft
angle in place, re-score it, and discard a genuinely redundant one.

## Key finding — the backend already supports this

The MCP tool surface already exposes everything needed; the append-only limit is
purely a skill-level choice, not a tool gap.

- `edit(entity='brief', patch, expected_version)` patches all five narrative
  fields + `angle_label` + `score` + `comment` + `persona_term_id` /
  `route_term_id` / `target_layer_term_id`, and demote-to-`draft`
  (`mcp-server/lib/brandos/tools/mutation_registry.ts` `briefEntry`;
  `repo/brief.ts` `editBrief`).
- `delete(entity='brief', expected_version[, confirm])` is a **shipped**
  preview-then-confirm cascade: without `confirm` it returns the blast radius
  `{creatives, copy, prompts, media_purges}` and destroys nothing; with
  `confirm: true` it hard-deletes the brief + its draft creatives + copy +
  prompts. (The skill's current "This is changing… state the shipped behaviour"
  note describing a `brief_has_creatives` refusal is **stale** — the cascade
  landed.)
- `list_briefs` already returns every field curation needs — `id`, `version`,
  `status`, the five narrative fields, `score`, `comment`, and the persona/route/
  layer term ids (`mcp-server/lib/brandos/read/ideas.ts` `IdeaBrief`).

## Capability & safety model — what the server enforces vs what the skill must

Granting `edit`/`delete` is safe because the server, not prose, holds the
propose-only line for the destructive/promotion halves. The skill declares
`capability: edit`; the agent holds `edit`, never `approve`.

| Action on a brief | Required capability | Result for this (edit-only) agent | Enforced by |
|---|---|---|---|
| `edit` narrative fields / `score` / `comment` / terms on a **draft** | `edit` | **allowed** | server |
| `delete` a **draft with 0 creatives AND 0 copy** (prompts don't count) | `edit` (`del.capabilityFor`) | **allowed** (preview → confirm) | server |
| `delete` a brief with **any creatives or copy** | `approve` | **denied** | server (`del.capabilityFor`) |
| `delete` / demote an **approved** brief | `approve` | **denied** (`brief_approved` / needs approve) | server |
| un-approve via `edit {status:'draft'}` | `approve` | **denied** | server (`editCapabilityFor`) |
| `approve` (any entity) | `approve` | **denied** | `hooks/approval-gate.mjs` + server |
| `edit` **non-status** fields on an **approved** brief | `edit` | **would be allowed by server** | **SKILL prose only** |

The last row is the one load-bearing skill guardrail: the server would let an
edit-cap caller rewrite an *approved* brief's `core_message` (no `status` in the
patch → capability `edit`). Nothing server-side stops it. So **"never edit or
delete an approved brief" is a hard skill rule**, not a server invariant — it must
be stated as load-bearing, exactly as the propose-only rules are, and it rests on
the same principle: a human blessed that angle's exact wording; the agent never
silently rewrites what a human approved.

`edit`/`delete` are **generic verbs** — once in the allowlist they can target any
entity. The skill must use them **only with `entity='brief'`, and only on the
current subject's own DRAFT briefs.**

## New doctrine — curate the DRAFT set

On every invocation the skill does three things, not one:

1. **Append** new distinct angles — unchanged (cold start ≤5 spread across fitting
   personas; top-up whatever genuinely remains; never pad; honest empty result).
2. **Revise** a weak/off-target **draft** angle in place — `edit(brief, id,
   {…}, expected_version)`. "Weak" is the Step 5 rubric applied to an *existing*
   draft: it now scores ≤3, is mis-homed (stage/layer/route no longer matches its
   anchor under the live framework), has drifted from the idea's current `hero`,
   violates its persona's `Tránh` list, or its `angle_label` no longer names the
   anchor its fields express. Fixable → edit the offending fields + re-`score` +
   re-`comment`. Unfixable and no-cost → discard (below).
3. **Replace near-duplicate drafts** — when two **draft** angles collide (same
   persona, same anchor, near-identical five fields), keep the stronger and
   **discard the weaker** via preview-then-confirm delete — **only if it is
   no-cost** (0 creatives, 0 copy).

**Discard flow (no-cost drafts only):**
`delete(brief, id, expected_version)` with no `confirm` →
- returns `{confirmation_required:true, creatives:0, copy:0, …}` → re-call with
  `confirm:true` to execute;
- any capability-denial or typed refusal (`brief_approved`,
  `brief_has_approved_*`, or an approve-capability denial because the draft has
  creatives/copy) → **STOP that discard, do not escalate, report to the operator**
  that this draft has produced work / is approved and is theirs to remove. The
  agent never un-approves or deletes dependents to force a discard.

**Curate honestly — don't churn.** Editing costs nothing, which is exactly why the
skill must not touch a draft that is already fine. Only revise a *genuinely* weak
draft; only replace a *genuine* near-duplicate. The "never pad" discipline now
also means "never fiddle": a no-op curation pass is the normal outcome on a healthy
draft set. Bound revision at the same 2-attempt ceiling Step 5 already uses.

**Taken-set split.** Step 2's taken set now splits by status:
- **APPROVED** briefs — locked, immutable read-only input (their anchors stay
  permanently spent; never edited, never deleted).
- **DRAFT** briefs — curatable: their anchors are provisionally taken but may be
  revised or replaced this run.

**Concurrency.** Every `edit`/`delete` passes the `expected_version` from the row
just read via `list_briefs`. On `stale_version`, re-read once via `list_briefs`
and retry; otherwise report and move on. A brief edited earlier in the same run is
not re-touched.

## Procedure deltas (`SKILL.md`)

- **Frontmatter `tools:`** → `[get_idea, get_channel_plan, get_knowledge,
  list_taxonomies, list_briefs, save_brief, update_idea, edit, delete]`.
  `capability: edit` unchanged.
- **Frontmatter `description`** → replace the "ALWAYS APPENDS… no discard-and-
  regenerate path… an existing brief is never deleted, edited, re-written,
  re-scored, or re-labelled… never deletes or edits a brief" clauses with the
  curation model (append + revise/replace **drafts**; approved untouched).
- **Intro + "You ALWAYS APPEND" + "Existing briefs are READ-ONLY input"
  sections** → rewrite to the append-plus-curate model with the approved/draft
  split. Keep the append behaviour verbatim; add the curation behaviour.
- **New Step 6b — "Curate the existing DRAFT set."** After the append save
  (Step 6), walk the DRAFT briefs read in Step 2 (pre-existing ones only — freshly
  appended angles are already ≥4 and need no pass). For each: re-judge against the
  Step 5 rubric + current hero + live persona/framework docs; revise-in-place, or
  replace-via-discard (no-cost only), or leave-and-report (has produced work).
  Explicitly `entity='brief'`, this subject's drafts only, `expected_version`
  guarded. No-op when the draft set is healthy.
- **Step 2 & Step 7** → taken-set text splits approved(locked)/draft(curatable);
  summary gains a curation line (revised N, discarded M, could-not-discard K with
  reasons). Empty-append + curation-only runs are both ordinary successes.
- **"What discarding an angle costs" section + the stale "This is changing"
  block** → replace with: (a) the **shipped cascade** description, and (b) the
  agent's own no-cost-draft discard flow. Keep the honest cost framing for what the
  agent *cannot* do (approved / has-produced-work drafts → operator's act).
- **Governance bullets** → flip "Structurally append-only for briefs" and
  "Existing briefs are read-only input" to the new model; keep every propose-only
  rule (never approve/un-approve, never touch approved, never flip a gate, never
  touch the media buy, Vietnamese prose). Add the **approved-brief-immutability is
  skill-enforced** note and the **generic-verb scoping** note (`entity='brief'`,
  own drafts only).

## Procedure deltas (`ssc.ads-brief.md` command)

- **Frontmatter `description`** and **"What a bare `/ssc.ads-brief` does"** +
  **Governance** + **"After it runs"** → drop "append-only" / "no discard-and-
  regenerate path" / "nothing is deleted, edited, re-scored, or re-labelled" /
  "never `edit`/`delete`"; state the curation model (append + revise/replace own
  drafts; approved untouched; discard only no-cost drafts; operator still owns
  approved rows and any draft with produced work). Update the stale cascade
  paragraph to the shipped behaviour.

## Non-goals

- No `mcp-server` / backend / hook / schema change.
- No server-side guard added for editing approved-brief fields (kept skill-level,
  consistent with how every edit-cap entity behaves; noted as possible future
  hardening).
- No change to `ssc-ads-writer`, `ssc-image-prompt-*`, or `ssc-ads-agent` behaviour
  (the agent inherits the skill's tools; its "never flips a gate" contract is
  unchanged and still true).
- Cross-subject/plan taken-set widening remains aspirational (no plan-scoped
  `list_briefs`) — unchanged.

## Verification

- Doc coherence: no surviving "append-only / never edit / never delete / read-only
  input" contradictions; `tools:` lists `edit`,`delete`; the capability/safety
  table matches the shipped server behaviour.
- Live behaviour (Cowork, no unit-test surface for a markdown skill): on a subject
  with a weak draft angle and two no-cost near-duplicate drafts, confirm the skill
  `edit`s the weak draft (version bumps), previews + `confirm`s a delete of a
  no-cost draft, and leaves approved briefs and any draft-with-produced-work
  untouched, reporting the latter to the operator.
