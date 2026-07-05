# Design: reverse `ssc-ads-writer` to copy-first section ordering

**Date:** 2026-07-05
**Status:** approved (design) — ready for implementation plan
**Scope:** `plugins/ssc-content/` — the ad TEXT production stepper (`/ssc.ads-produce` → `ssc-ads-writer`)

## Problem

The ad text producer (`ssc-ads-writer`) steps through four sections in a strict,
per-invocation, human-gated chain:

```
headline → copy → description → image_content   (current)
```

Each later section is grounded in the operator-approved earlier ones (copy builds
on the approved headline, etc.). This puts **headline first** — the writer must
guess a hook in a vacuum, before any copy exists.

That fights copywriting craft and the skill's own logic:

1. **The hook is discovered inside the copy, not before it.** Writing the full
   argument first surfaces the sharpest line; the headline is then a distillation
   of it.
2. **The skill already agrees — but only at the last step.** Step 4 for
   `image_content` distils the on-image HEADLINE from *the approved copy's hook*
   ("leverage the winning copy's proven hook, not merely a restated standalone
   headline"). So the design already treats the copy's hook as the real driver —
   just too late in the chain.
3. **On Meta, the copy's first line IS the primary hook.** The "headline" field
   is the secondary bold line by the CTA button; the scroll-stopper is the first
   line of primary text (the copy). Writing copy first surfaces the actual hook,
   and the headline becomes a supporting distillation.

There is thus an internal inconsistency: the flow says *headline drives copy*,
while its own `image_content` step says *copy's hook drives the headline*.

## Decision

Reverse the two leading sections so the chain is:

```
copy → headline → description → image_content   (new)
```

**Trade-off accepted.** Today the operator's first approval gate is a cheap
5-word headline; copy-first makes the first gate a set of full copies (a heavier
review unit). We accept this because a headline written in a vacuum is often
mediocre, forcing the operator to approve a "least-bad" hook that then constrains
the copy. Copy-first collapses two strategic decisions (which hook? does the copy
deliver?) into one (which argument wins — hook included), and the headline drops
out as a near-mechanical distillation plus a dashboard edit. This is a
simplification and is consistent with how `image_content` already works.

## The new chain and per-section input dependencies

| Section | Order | Gated on (must be approved) | Input it builds on | Behavior change |
|---|---|---|---|---|
| **copy** | 1st | *nothing* | concept brief + `build_spec` + KB + Hook Formula Bank | **Now the cold-start section.** Each copy leads with its own hook line — this is where the hook is *discovered*. (Removes today's "builds on an approved headline" input.) |
| **headline** | 2nd | ≥1 `copy` | approved **copy** bodies (pooled) | **New behavior:** distils a short standalone on-creative headline from the approved copies' hooks — the same discipline `image_content` already uses (distil the hook; an approved copy may sharpen wording, but do not merely restate). |
| **description** | 3rd | `copy` + `headline` | approved **copy** (and headline) | Essentially unchanged — it already compresses the approved copy's promise. |
| **image_content** | 4th | `copy` + `headline` + `description` | approved copy + headline + description | **Unchanged** — still last; still anchors each version to one approved copy and distils that copy's hook. |

### Headline anchoring (multi-copy case) — DECIDED

When several copies are approved, the headline step uses **free distillation
across all approved copies**: produce `n_headlines` variations drawing on the
**pooled** hooks of all approved copies, chosen for strength — **not** a 1:1
"one headline per copy" mapping, and with no guarantee every copy is represented.
(Contrast: `image_content` anchors each version to *one* copy; the headline step
does not.)

### Strict gate chain (Step 2 stepper), reordered

Apply the first matching rule; either set the active section or STOP:

1. not `approved(copy)` and `has_drafts(copy)` → STOP: approve ≥1 copy, re-invoke.
2. not `approved(copy)` → active = **copy**.
3. `approved(copy)`, not `approved(headline)`, `has_drafts(headline)` → STOP: approve ≥1 headline, re-invoke.
4. `approved(copy)`, not `approved(headline)` → active = **headline**.
5. `approved(copy)`+`approved(headline)`, not `approved(description)`, `has_drafts(description)` → STOP: approve ≥1 description, re-invoke.
6. `approved(copy)`+`approved(headline)`, not `approved(description)` → active = **description**.
7. `approved(copy)`+`approved(headline)`+`approved(description)`, not `approved(image_content)`, `has_drafts(image_content)` → STOP: approve ≥1 image-content set, re-invoke.
8. `approved(copy)`+`approved(headline)`+`approved(description)`, not `approved(image_content)` → active = **image_content**.
9. all four approved → STOP: production complete.

The chain stays strict: never produce `headline` before a copy is approved,
`description` before a headline is approved, or `image_content` before a
description is approved.

## Edit surface

### A. `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` (the core)

Only **two substantive logic changes**; everything else is reordering the chain
string and the input-dependency prose.

- **Step 6 `copy` instruction:** "a hook line that builds on an APPROVED headline"
  → "a hook line grounded in the concept brief + `build_spec` + Hook Formula Bank"
  (no earlier-section input; the copy owns the hook).
- **Step 6 `headline` instruction:** change from an independent hook written from
  the brief → distil a short standalone headline from the **pooled approved copy
  hooks** (free distillation across all approved copies), reusing the
  `image_content` distillation discipline.

Reordering / rewording passes (no behavior change beyond the two above):
- frontmatter `description` (chain string + "copy builds on approved headline…").
- body intro (chain string).
- **Step 2** stepper table + the "chain is strict" sentence → the reordered gate
  chain above.
- **Step 4** (read approved earlier-section input): `copy` now has *no* earlier
  input (cold start); `headline` reads pooled approved copy bodies; `description`
  reads approved copy (+ headline); `image_content` unchanged.
- **Step 5** (Hook Formula Bank): reframe so the Bank drives the **copy's opening
  hook first** (where hooks are born); the headline step distils that hook.
- **Step 9** summary "Built on approved input" line + the four next-action lines,
  reordered:
  - after **copy**: approve ≥1 copy → re-run to produce **headlines**.
  - after **headline**: approve ≥1 headline → re-run to produce **descriptions**.
  - after **description**: approve ≥1 description → re-run to produce **image content**.
  - after **image_content**: complete.
- **Output** + **Governance** ("Approved input carries forward") — reorder the
  dependency description.

**Explicitly unchanged in the writer:** the ≥3-proof-density rules (each `copy`
and each `image_content` version carries ≥3 distinct proof points; each
`headline`/`description` carries 1–2 with the section's set covering ≥3), the
Step 7 quality gate + honest scoring + replacement loop, banned-words /
compliance / food-placeholder / authenticity rails, the save-to-server (not
present-in-chat) behavior, and every propose-only invariant (never
approve/unapprove/update_status/publish, never edit or delete a row).

### B. `plugins/ssc-content/commands/ssc.ads-produce.md` (accuracy)

Update the chain strings and dependency prose: frontmatter `description`, §28,
§32, §34, §42. Thin entry point otherwise unchanged.

### C. `plugins/ssc-content/CLAUDE.md` (accuracy)

Pipeline table row (§61): `(headline → copy → description)` →
`(copy → headline → description)`.

### D. `ssc-ads-image` references (accuracy only — behavior untouched)

`skills/ssc-ads-image/SKILL.md` and `commands/ssc.ads-image.md` (line 24) carry
the parenthetical text-chain string `(headline → copy → description →
image_content)`. Update the string for accuracy. The visual pipeline still gates
on the concept's `image_content` section being approved, which remains **last**
in both orderings — so the image flow is functionally unaffected.

## Explicitly NOT changing (contract-preserving)

- **`save_post_content` section values** — still exactly
  `headline | copy | description | image_content`. Only the production *order*
  changes; no server/MCP-tool contract change, no new section value.
- **The `/ad/[id]` dashboard page** grouping by `content.section` — unchanged.
- **`plugin.json` / `.mcp.json` / `marketplace.json`** — no chain references; untouched.
- **The ideate/plan pipeline** (Focus → Approaches → Blueprint → Ideate) that
  produces the approved concept — untouched.

## Testing / verification

No compiled code — verification is prose-consistency and the governance hook:

1. **Chain-string sweep:** after edits, `grep` the repo for the old order
   (`headline → copy`, "builds on an approved headline", the pipeline-table row)
   and confirm no stale copy-first-contradicting strings remain outside the
   design/plan docs.
2. **Internal consistency:** the Step 2 gate table, Step 4 input rules, Step 6
   per-section instructions, and Step 9 next-action lines all agree on
   `copy → headline → description → image_content`.
3. **Invariant preservation:** propose-only rules, the four `section` values, and
   the ≥3-proof-density rules are byte-for-byte intact.
4. **Governance hook untouched** — `hooks/approval-gate.mjs` still denies
   subagent `approve_*`/`unapprove_*` (exercise per CLAUDE.md's echo-pipe test).

## Out of scope

- Any change to how many variations are produced (`n_copies` etc. stay default 5).
- The visual (`ssc-ads-image`) layer chain.
- Dashboard UI changes.
