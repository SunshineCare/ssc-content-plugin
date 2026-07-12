> **Evolved to brief-first.** This change originally rewrote `ssc-ads-brief` to produce angle briefs *from approved copy* and reached it via a `creative_brief` router on `/ssc.ads-produce`. It now tracks the brief-first design (`docs/superpowers/specs/2026-07-12-ads-brief-first-production-design.md`): `ssc-ads-brief` runs FIRST with no copy gate (angles from concept + persona + build_spec) via a new `/ssc.ads-brief` command, and `/ssc.ads-produce <ideaId> <briefId> [section]` produces copy anchored to the chosen approved brief. The `save_brief`/`list_briefs`/produce-once/quality-loop/Change-2 facts below still hold; the "copy-approval gate" and "realized through approved copy" requirements are replaced. See the "Brief-first evolution" section in `tasks.md`.

## Why

The `ssc-ads-brief` skill's write step is broken against the live BrandOS server:
`update_idea` now **hard-rejects** the five narrative brief fields
(`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`) and `theme` —
they moved out of the `ideas` row into a `briefs` table — so every run fails.
The same skill should also stop producing one direct-overwrite brief and instead
give the operator **4-5 distinct, rated angle options** to choose from. This
change fixes the dead write path and reshapes the skill to produce rated draft
angle briefs.

## What Changes

- Rewrite `ssc-ads-brief` from "recompute one brief per run via `update_idea`
  (direct overwrite, no draft/approve state)" to **producing 4-5 distinct, rated
  DRAFT angle briefs via `save_brief`**, then stopping.
- Each angle anchors to a **distinct** persona trigger / objection / myth, carries
  a **mandatory** short Vietnamese `angle_label`, the five narrative fields, and a
  1-5 `score` + one-line Vietnamese `comment`.
- Quality gate: self-score each angle 1-5; **drop + regenerate any ≤3 until all
  ≥4** (mirrors `ssc-ads-writer`), scored on brief-relevant criteria
  (distinctiveness / grounding / strategic sharpness / authenticity) — no separate
  compliance scan (a brief has no compliance gate; angles derive from
  already-approved copy).
- **Produce-once guard**: `list_briefs` before any write; if briefs already exist,
  **STOP** and tell the operator to curate/approve/discard in the dashboard. Never
  append, never silently overwrite.
- **BREAKING (skill contract)**: frontmatter `tools:` change — **remove**
  `update_idea`; **add** `list_briefs` + `save_brief`.
- Remove the "revise / direct-overwrite / no draft-approve" model. Briefs are now
  DRAFT rows an operator promotes via `approve(entity='brief')` — never the skill.
- Fix downstream stale references that still describe the `update_idea` model:
  `commands/ssc.ads-produce.md`, `skills/ssc-ads-writer/SKILL.md`, root `CLAUDE.md`
  pipeline table.
- Document the server **"Change 2"** dependency (per-idea multi-brief +
  `angle_label` persistence). Today's server nulls `angle_label` and keeps one
  brief per idea, so the multi-angle payoff is **inert until Change 2 ships**;
  setting `angle_label` anyway is forward-compatible. Same pattern the video skills
  use for the not-yet-shipped `generate_*` tools.

## Capabilities

### New Capabilities

- `ads-brief-angles`: Given ONE approved ad concept whose `copy` is approved,
  produce 4-5 rated, distinct, DRAFT creative-brief angles (each a `save_brief`
  row with a mandatory `angle_label`), propose-only, produce-once, Vietnamese
  prose, forward-compatible with server Change 2.

### Modified Capabilities

<!-- none — there is no existing ads-brief capability spec. The existing specs
     (ads-image-visual, persona-context-grounding) are unrelated; their
     requirements do not change. -->

## Impact

- **Rewrite**: `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` (frontmatter +
  body).
- **Edit (stale refs)**: `plugins/ssc-content/commands/ssc.ads-produce.md`
  (description + brief-path paragraphs), `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`
  (sibling mention), root `CLAUDE.md` (pipelines table row for `ads-produce`).
- **MCP tools consumed**: `get_idea`, `get_channel_plan`, `list_post_content`,
  `get_knowledge`, `list_briefs`, `save_brief` (removed: `update_idea`). All exist
  on the live BrandOS surface.
- **Runtime dependency**: server "Change 2" for the full multi-angle payoff —
  documented, non-blocking (the skill runs correctly today with one persisted
  brief).
- **No code / build / test impact**: markdown-only plugin change; the governance
  hook is untouched.
