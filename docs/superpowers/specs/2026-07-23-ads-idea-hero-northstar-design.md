# Design — idea `hero`: a north-star anchor for ad-brief and ad-produce

- **Date:** 2026-07-23
- **Status:** approved (brainstorm), pending implementation-plan
- **Scope:** two repos.
  - `content` (server): `mcp-server/db/schema/creative.ts`, a new migration in
    `mcp-server/db/migrations/`, `mcp-server/lib/brandos/read/ideas.ts`,
    `mcp-server/lib/brandos/repo/idea.ts`, `mcp-server/lib/brandos/tools/idea_tools.ts`
  - `ssc-content-plugin` (this repo): `plugins/ssc/skills/ssc-ads-brief/SKILL.md`,
    `plugins/ssc/skills/ssc-ads-writer/SKILL.md`

## Problem / motivation

`ssc-ads-brief` fans one persona-free subject (`idea.title`) into several persona × route
angles; `ssc-ads-writer` then writes copy per approved angle. Nothing today names, in one
place, **the single concrete thing the idea is actually about** — a product, a feature, or a
pain point — that every angle and every copy variation should stay recognizably anchored to.
`core_message` is angle-scoped (one per brief, reworded per persona); there is no idea-level
anchor that persists across the whole fan-out and that both `ssc-ads-brief` and
`ssc-ads-writer` can read as the same shared "north star."

The operator asked for exactly that: **a `hero` of the idea**, decided by `ssc-ads-brief`
before it creates any angles, that both `ssc-ads-brief` and `ssc-ads-writer` write toward.

## Locked decisions (from brainstorming)

| # | Decision | Choice |
|---|---|---|
| D1 | Where hero lives | A new column on the **idea** (not the brief, not a separate table) — `ideas.hero`, nullable text. |
| D2 | Shape | A **single free Vietnamese sentence/phrase** — no type tagging (product vs. feature vs. pain-point vs. proof). Read as prose, same pattern as `idea.title`/`core_message`. |
| D3 | Grounding | Distilled from **`idea.title` alone** — no new KB dependency, no fabrication beyond what the title already supports. |
| D4 | When it's set | `ssc-ads-brief` defines it **once**, the first time it runs on an idea with `hero` empty, **before** any angle is created (new Step 1a). |
| D5 | Mutability | **Revisable via explicit operator request** (a `revise hero: <note>`-style instruction), not locked forever. |
| D6 | Revision fallout | Existing briefs/copy derived under an old hero are **left untouched** — never edited, re-scored, or blocked. `ssc-ads-brief`'s summary just names which existing briefs predate the current hero. |
| D7 | Binding in `ssc-ads-brief` | Every angle's narrative fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`) and `angle_label` must stay faithful to hero — folded into the existing Step 4 "must strictly follow the angle's decisions" rule and the Step 5 "Decision fidelity" scoring criterion as a fourth anchor (alongside persona/route/awareness_stage/layer). |
| D8 | Binding in `ssc-ads-writer` | **Direct check, defense-in-depth** — not just transitive through the brief's already-hero-bound fields. Mirrors the existing double-gated `Tránh` check (brief-direction gate + finished-sentence gate). New Step 7 hard-cap check, parallel to the layer-CTA check (a3) added in the previous revision. |
| D9 | `save_idea` (create) | **Untouched.** Hero is never set at ideate time — only `update_idea` (an existing, narrow, non-gating tool: title/score/comment only, no status/demotion exposure) gains a `hero` field. `ssc-ads-brief` gains `update_idea` in its `tools:` list. |
| D10 | Naming collision | `hero` already means something unrelated in this plugin — `ssc-image-prompt-*`'s "hero image / hero-mix" (an ImageStudio export/dashboard concept). Keeping the name anyway: the contexts (`idea.hero` prose field vs. "hero image" export action) are clearly disambiguated by where each appears, and it's the operator's own term. |

## Server changes (`content` repo)

All five touch points were verified against the current code (not guessed):

1. **`mcp-server/db/schema/creative.ts`** — add `hero: text('hero'),` to the `ideas` pgTable
   definition (alongside `title`/`comment`).
2. **New migration** `mcp-server/db/migrations/<date>-idea-hero.sql`:
   ```sql
   ALTER TABLE ideas ADD COLUMN hero text;
   ```
   (matches the existing hand-written, date-prefixed SQL migration convention in that
   directory — e.g. `2026-07-22-gallery-media-thumbnail.sql`).
3. **`mcp-server/lib/brandos/read/ideas.ts`**:
   - `IdeaDetailRow` interface — add `hero: string | null;`.
   - `getIdea`'s `select({...})` — add `hero: ideas.hero,`.
   - No change needed to `getBrief`: it already calls `getIdea(brief.idea_id)` internally
     (`read/ideas.ts:219`), so `get_brief`'s returned `idea` sub-object picks up `hero`
     automatically once `getIdea` does.
4. **`mcp-server/lib/brandos/repo/idea.ts`**:
   - `UpdateIdeaFields` interface — add `hero?: string | null;`.
   - `EDITABLE_IDEA_COLUMNS` — add `'hero'`.
   - `REJECTED_BRIEF_KEYS` — **no change** (hero is not a brief-narrative key).
5. **`mcp-server/lib/brandos/tools/idea_tools.ts`** (`update_idea` tool):
   - `inputSchema` — add `hero: z.string().optional()`.
   - Handler's `fields` construction — add the `hero` passthrough.
   - Tool `description` — mention `hero` alongside `title`/`score`/`comment` as an accepted
     field.

**Explicitly out of scope:** `domain/idea.ts` (`Idea` interface / `validateIdea`) and
`save_idea.ts` (create path) — hero never flows through idea creation, only through
`update_idea`, so neither needs to change (D9).

## `ssc-ads-brief` changes (this repo)

- **Frontmatter:** add `update_idea` to `tools:`. Mention `hero` in the description.
- **Inputs:** new optional free-text trigger, e.g. `revise hero: <note>` — recognized as an
  instruction, not a rigid positional flag (mirrors the `revise:`/`rewrite` convention already
  used elsewhere in this plugin, e.g. `ssc-image-prompt-*`).
- **New Step 1a — "Resolve or define the idea's hero"** (right after Step 1, before Step 1b's
  plan-context resolution — hero needs only `idea.title`, no persona/plan dependency):
  1. Read `idea.hero` (already present on the Step 1 idea object once the server change ships).
  2. If a `revise hero:` instruction was given: derive a new hero (informed by the note),
     `update_idea(id, expected_version, hero=<new>)`, hold both old and new text for the Step 7
     disclosure.
  3. Else if `idea.hero` is empty: derive one now (distilled from `idea.title` alone — never
     invents beyond what the title supports), `update_idea(...)` to persist it before any angle
     is created, hold it for Step 7.
  4. Else: read-only, hold the existing value, no write.
  5. In every branch that just wrote a hero (2 or 3), also read this idea's existing briefs
     (the Step 2 `list_briefs` call already does this — reuse it) so Step 7 can name which
     existing briefs predate the current hero value. No brief is touched.
- **Step 4:** extend the existing "every field below must strictly follow the angle's own
  decisions" rule (persona/route/awareness_stage/layer) to include the idea's `hero` as a
  fourth, idea-wide anchor — every narrative field and `angle_label` must stay recognizably
  about the same hero, never drift to a different product/feature/pain-point.
- **Step 5:** extend the "Decision fidelity" scoring criterion (or add a sibling criterion) to
  check hero-alignment alongside route/stage/anchor alignment.
- **Step 7:** when Step 1a defined or revised hero this run, state the hero text (new, and old
  if revised) and list which existing briefs on this idea predate it — informational only,
  never a block.
- **Governance:** new hard-rule bullet(s): hero is idea-wide (not per-angle), grounded only in
  `idea.title` (never fabricated), defined once then read-only unless explicitly revised, and a
  revision never cascades to existing briefs/copy (only discloses).

## `ssc-ads-writer` changes (this repo)

- **Step 1 / Step 1c ("Confirm the angle anchor"):** hold `idea.hero` (already available on the
  `idea` object `get_brief` returns — no new call needed once the server change ships)
  alongside the brief's own five narrative fields as part of the angle anchor.
- **Step 6 (`copy`):** extend the existing "every variation's hook must trace to THIS brief's
  own `hook_direction`/`core_message`" rule to also require staying faithful to the idea's
  `hero` — same rewrite-not-negotiate framing already used for hook_direction/core_message.
- **Step 7:** new hard-cap check **(a4) Hero fidelity check**, parallel in structure to (a3)'s
  layer-CTA check — a variation that drifts to a different product/feature/pain-point than the
  idea's `hero` caps at ≤3, regardless of other merits. Defense-in-depth alongside the brief
  already being hero-bound (D8) — mirrors the existing double-gated `Tránh` pattern (brief
  direction + finished sentence).
- **Frontmatter description + Governance:** mention hero as a second, idea-level anchor
  alongside the brief, analogous to the existing layer→CTA/tone governance bullet added in the
  prior revision.

## Sequencing

Server-first: the `content` repo change (schema, migration, `update_idea`, `getIdea`) must ship
and be deployed before the `ssc-content-plugin` skill changes can be exercised for real — the
skills would otherwise call a `hero` field/tool that doesn't exist yet. The two skill files can
be edited and reviewed in parallel with the server work, but should not be treated as done
until verified against a live `update_idea(hero=...)` call and a `get_brief` read that actually
returns `idea.hero`.

## Explicitly out of scope

- `save_idea` / `ssc-ads-ideate` — hero is never proposed at idea-creation time.
- Any dashboard/UI surface for hero (display, edit) — not requested; this design only covers
  the two skills reading/writing it via MCP tools.
- A "superseded hero" flag on `briefs` — rejected in favor of the simpler disclose-only
  approach (D6).
