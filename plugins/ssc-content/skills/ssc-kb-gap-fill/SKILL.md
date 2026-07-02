---
name: ssc-kb-gap-fill
description: Identifies Cambridge Diet Vietnam knowledge-base domains with no coverage and drafts candidate documents for those gaps. Every draft is presented for human review before any addition — propose-only, nothing is added to the live KB automatically.
metadata:
  type: skill
  stage: kb-health
  brand: cambridge-diet-vn
  section: knowledge
  capability: edit
  depends-on: ssc-kb-review
  tools: [list_knowledge, search_knowledge, get_knowledge, propose_knowledge_revision]
---

# KB Gap Fill (`ssc-kb-gap-fill`) — FR-005

You find **missing domains** — concepts the marketing system needs but no KB doc
covers — and draft candidate documents to fill them. Drafts are proposals only;
a human reviews and approves before anything enters the live KB.

Typically invoked with `coverage_gap` findings from `ssc-kb-review`, but can
also be run independently as a full gap sweep.

## What counts as a gap

A gap is a topic that downstream skills (research, creative, production,
performance) will need but cannot find in the KB. Examples: a channel format
constraint with no `ad/` or `channels/` doc; a new awareness stage with no angle
guidance; a Vietnamese seasonal moment with no `content/` treatment; a compliance
sub-rule with no `rules/` coverage.

## Procedure

1. Call `list_knowledge` to map current coverage across categories (`ad/`,
   `brand/`, `content/`, `research/`, `rules/`, `voice/`, `channels/`, `programme/`, `winners/`, `losers/`).
2. Compare against the set of domains the marketing stack relies on. Use
   `search_knowledge` to confirm a suspected gap returns nothing relevant.
3. For each real gap, draft a candidate doc: a proposed `path` and full draft
   content written in the established house style (concise, atomic, one concept
   per doc). **The draft content MUST begin with a single H1 (`# Tiêu đề`) on the
   first line** — `propose_knowledge_revision` carries no separate title field, so
   the doc's title is derived from this H1 when the proposal is approved. A draft
   with no H1 first line creates a titleless doc. Load the full same-category set for style calibration using
   the `categories` parameter — this ensures you match the most recent house
   style including any docs added since a path list was last updated:
   - `ad/` gaps → `get_knowledge(categories=["ad"])`
   - `rules/` gaps → `get_knowledge(categories=["rules"])`
   - `voice/` gaps → `get_knowledge(categories=["voice"])`
   - `brand/` gaps → `get_knowledge(categories=["brand"])`
   - `content/` gaps → `get_knowledge(categories=["content"])`
   - `channels/` gaps → `get_knowledge(categories=["channels"])`
4. Run the **pre-submission self-check** (below), then record each confirmed
   draft as a proposal via `propose_knowledge_revision` against the new `path`,
   with a rationale stating why the domain is needed and an evidence note.
   (The doc is created on approval, not now.)

## Pre-submission self-check

Before calling `propose_knowledge_revision` for any draft, verify every item:

- [ ] `path` does not exist in the current KB inventory (confirmed in step 1)
- [ ] Draft content's **first line is a single H1 (`# Tiêu đề`)** — this becomes the doc title on approval (no H1 ⇒ titleless doc)
- [ ] Draft content is atomic — one concept, not a merge of multiple topics
- [ ] `evidence_note` is present and explains why the gap exists (required, FR-061)
- [ ] Draft style matches neighbouring docs in the same category (tone, structure,
      heading depth)
- [ ] No `save_knowledge`, `edit_knowledge`, `approve_*`, `unapprove_*`,
      `update_status`, or publish calls in this run; no `edit_*`/`delete_*`
      call targeting anything other than a draft row this skill itself created
      in the current run

If any item fails, fix before submitting.

## Output

```
- gap: <missing domain>
  proposed_path: content/<new-doc>
  proposal_id: <id>
  rationale: <why this is needed + evidence>
```

End with a count of gaps found and drafts proposed.

## Governance

- Propose-only (hard rule): never call any tool that changes approval or
  lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any
  entity, any gate), no `update_status`, no publish. Never edit or delete
  operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY
  draft rows this skill itself created in the current run. Everything else
  belongs to the operator in the dashboard. NEVER add to the live KB; never
  call `save_knowledge` or `publish_strategy_knowledge`.
- Keep drafts atomic — one concept per doc — to match the KB taxonomy. Do not
  restructure existing docs (out of scope).
- Requires `edit` capability.
