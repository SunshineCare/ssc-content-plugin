> **Note (brief-first evolution):** the copy-first order described below — `ssc-ads-brief` gated on approved copy and dispatched via `/ssc.ads-produce <idea_id> creative_brief` — has been **superseded** by the brief-first design (`docs/superpowers/specs/2026-07-12-ads-brief-first-production-design.md`). `ssc-ads-brief` now runs FIRST via the new `/ssc.ads-brief <idea_id>` command (no copy gate), and `/ssc.ads-produce <ideaId> <briefId> [section]` produces copy from the chosen approved brief. Everything below is retained as design history; see `proposal.md` and §4 of `tasks.md`.

## Context

`ssc-ads-brief` is a work-unit skill in the `ssc-content` plugin. It synthesizes a
creative brief for ONE approved ad concept so the design / media-buying team has a
handoff reference. It was originally dispatched by `/ssc.ads-produce <idea_id> creative_brief` (now `/ssc.ads-brief <idea_id>` — see the brief-first note above).

Two facts force this change (both confirmed against the live BrandOS MCP schemas):

1. **The write path is dead.** `update_idea` now hard-rejects the five narrative
   fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`) and
   `theme`, each annotated *"NOT ACCEPTED — use save_brief / edit(entity='brief')"*.
   The fields moved from the `ideas` row into a `briefs` table.
2. **The operator wants 4-5 rated angle options**, not one recomputed brief.

The new write surface: `save_brief` (inserts a DRAFT brief; cannot mint an approved
one; carries `angle_label`, the five fields, `score`, `comment`), `list_briefs`
(read), `approve(entity='brief')` (operator-only promotion), `edit(entity='brief')`
(patch; a demoting patch needs the `approve` capability).

**Constraint — server "Change 2" has not shipped.** Per the schemas,
`save_brief.angle_label` is *"NULL this change"* and `list_briefs` returns
*"exactly one row per idea this change; N per angle once Change 2 lands"*. So today's
server keeps one brief per idea and nulls `angle_label`. Multi-brief + angle labels
is a future server change this client is written ahead of.

Full prior design: `docs/superpowers/specs/2026-07-12-ads-brief-angle-briefs-design.md`.

## Goals / Non-Goals

**Goals:**
- Replace the dead `update_idea` write with the `save_brief` draft-brief path.
- Produce 4-5 **distinct, rated, DRAFT** angle briefs, each with a mandatory
  Vietnamese `angle_label`, then STOP.
- Preserve the propose-only governance invariant (draft-only; never approve/demote/
  publish/gate-flip).
- Be forward-compatible with server Change 2 with no second edit needed later.
- Fix every downstream doc that still describes the retired model.

**Non-Goals:**
- Server-side Change 2 itself (not in this repo).
- Any revise/refresh-existing-briefs flow — explicitly rejected (produce-once).
- `approve(entity='brief')` wiring — an operator/dashboard action, never a skill.
- `ssc-post-ideate`'s `update_idea` usage — it passes only `title`/`score`/`comment`
  (still accepted), so it is unaffected and untouched.

## Decisions

- **Write via `save_brief` (draft), not `update_idea`.** `update_idea` rejects the
  narrative fields; `save_brief` is the server's replacement and mints only drafts,
  which keeps the skill propose-only. *Alternative:* `edit(entity='brief')` — that
  patches an existing brief, not creation, so it is not the producer's tool.

- **Produce-once, then stop.** If `list_briefs` returns ≥1 brief, STOP and route the
  operator to the dashboard; otherwise produce the set. *Alternatives rejected:*
  "refresh existing angles" (needs an ambiguous old→new angle mapping and risks
  overwriting an operator-approved brief) and "append a set each run" (briefs pile
  up; fights the one-brief server hardest). Produce-once mirrors `ssc-ads-writer`'s
  save-and-stop and needs no mapping.

- **Angle basis = distinct persona trigger / objection / myth.** Richest strategic
  differentiation, and the persona detail doc is already loaded. *Alternatives:*
  one-angle-per-approved-copy (count driven by copy, less strategic spread) and
  one-angle-per-hook-formula (formal, less grounded in real objections).

- **`angle_label` mandatory on every angle.** Forward-compatible: passing it is
  harmless today (server nulls it) and correct the moment Change 2 lands, so no
  second edit is needed when the server catches up.

- **Quality gate scored on brief-relevant criteria; no compliance scan.** Score on
  distinctiveness / grounding / strategic sharpness / authenticity (Kiều My voice);
  drop + regenerate ≤3 until all ≥4. A brief has no compliance gate and its angles
  derive from copy the writer already cleared and the operator already approved, so
  re-running a banned-words/compliance scan is redundant.

- **Frontmatter `tools:` = `[get_idea, get_channel_plan, list_post_content,
  get_knowledge, list_briefs, save_brief]`** — drop `update_idea`, add `list_briefs`
  + `save_brief`. No `edit`, no `approve` (both would violate propose-only or are
  unused under produce-once).

## Risks / Trade-offs

- **Multi-angle payoff is inert until Change 2** → Document it plainly in the skill
  body and spec (same pattern the video skills use for unshipped `generate_*`). The
  skill still runs correctly today; one brief persists.
- **Duplicate briefs once Change 2 allows N-per-idea, if the guard is skipped** →
  The produce-once `list_briefs` guard MUST run before any `save_brief`. It is the
  only thing preventing pile-up.
- **Operator manual edits overwritten** → Eliminated by produce-once: the skill
  refuses to re-run once briefs exist, so it never clobbers dashboard edits (the
  central caution of the old recompute-every-run model disappears).
- **Downstream doc drift** → `commands/ssc.ads-produce.md`, `ssc-ads-writer/SKILL.md`,
  and root `CLAUDE.md` still describe `update_idea`; fix all three in this change
  (dangling/stale refs are a called-out bug class in `CLAUDE.md`).

## Migration Plan

Markdown-only plugin change — no runtime/data migration. Operators pick it up via
the normal plugin dev loop (uninstall + reinstall, or version bump + marketplace/
plugin update, per `CLAUDE.md`). Rollback = `git revert` (docs-only, safe). The
governance hook is untouched.

## Open Questions

- None blocking. When Change 2 ships, revisit whether a "regenerate the whole set"
  affordance (discard-all-then-produce) belongs in the skill or stays dashboard-only.
  Deferred — produce-once is correct for both server states today.
