---
name: ssc-kb-revise
description: Generates precise, evidence-backed revision proposals for one or more Cambridge Diet Vietnam knowledge-base documents. Always propose-only via propose_knowledge_revision — it NEVER applies revisions. Every proposal carries a target path, the proposed change, a rationale, and an evidence citation.
metadata:
  type: skill
  stage: kb-health
  brand: cambridge-diet-vn
  section: knowledge
  capability: edit
  depends-on: ssc-kb-review, ssc-kb-audit
  tools: [get_knowledge, propose_knowledge_revision]
---

# KB Revise (`ssc-kb-revise`) — FR-004

Given one or more findings (from `ssc-kb-review`, `ssc-kb-audit`, or
`ssc-performance-agent`), you draft precise revisions and record them as
**pending proposals**. You never apply anything — applying is a separate,
`approve`-gated human action in the KB dashboard.

## Inputs

A list of one or more findings, each with:

- `path` — the target doc (e.g. `rules/compliance`).
- `finding` — what's wrong and why it should change.
- `evidence` — a `research_id` (preferred) and/or an evidence note (e.g. the
  performance signal or regulatory source). **Required** — a proposal without
  evidence is invalid (FR-061).
- `severity` *(optional)* — `high | medium | low` as emitted by `ssc-kb-review`
  or `ssc-kb-audit`. When absent, treated as unclassified.

## Procedure

1. **Route and sort.** First, split the input list:
   - Findings with `recommendation: gap_fill` are **not handled here** — they
     require a new doc to be created, which is `ssc-kb-gap-fill`'s job. Set
     them aside; they will be listed in the output under "Routed to gap-fill".
   - All other findings proceed. Sort by severity (high → medium → low →
     unclassified) so high-severity proposals are submitted first. Group findings
     that share the same `path` — they must be addressed in a single proposal,
     since the dashboard blocks two competing proposals on the same doc.
2. For each distinct path, call `get_knowledge` to read the current content (the
   "before"). Also load all docs in the governing category to check for
   consistency — e.g. if revising any `rules/` doc, call
   `get_knowledge(categories=["rules"])`; if revising any `ad/` doc, call
   `get_knowledge(categories=["ad"])`. Using the category parameter catches
   sibling docs added since any path list was last updated. Read all affected
   paths before drafting — do not interleave reads and writes.
3. For each path, produce the full proposed new content (the "after") — a
   complete replacement of the doc's content, not a patch fragment, so the diff
   is clean and the applied result is unambiguous. Keep edits **minimal and
   surgical**: change only what the findings require; preserve voice, structure,
   and unrelated text. When multiple findings target the same doc, fold all of
   them into one coherent "after".
4. Run the **pre-submission self-check** (below), then call
   `propose_knowledge_revision` for each path with:
   - `path`
   - `proposed_content` (the full "after")
   - `rationale` (one paragraph covering all findings for that path)
   - `evidence_research_id` and/or `evidence_note` (at least one per proposal)

   Proposals for independent paths may be submitted in parallel.

## Pre-submission self-check

Before calling `propose_knowledge_revision` for any proposal, verify every item:

- [ ] No two proposals share the same `path`
- [ ] Every proposal has at least one of `evidence_research_id` or `evidence_note`
- [ ] All `gap_fill` findings have been moved to the "Routed to gap-fill" list,
      not drafted as revisions
- [ ] The "after" content is a complete doc replacement, not a patch fragment
- [ ] Edits are minimal — only what the finding requires was changed; unrelated
      text is preserved verbatim

If any item fails, fix before submitting.

## Output

For each proposal, report the `proposal_id`, `path`, severity, findings
addressed, and confirm `status: pending`.

If any findings were routed away, list them under a **"Routed to ssc-kb-gap-fill"**
section with their path and finding — so the caller knows to follow up.

End with a summary: N findings received → P proposals submitted (X high /
Y medium / Z low) + G routed to gap-fill. State plainly: "Proposed — awaiting
approval in the KB dashboard. Nothing applied."

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either
  direction — never call `approve` (the ONLY gated promotion; the approval
  hook denies it to agents, any entity, any gate), and never publish. Demotion
  is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban
  lives here: never use `edit` to demote, unapprove, discard, or reject a row.
  Never edit or delete operator-curated or approved rows: the generic
  `edit`/`delete` verbs may target ONLY draft rows this skill itself created
  in the current run. Everything else belongs to the operator in the
  dashboard. `propose_knowledge_revision` is
  this skill's only write; NEVER call `approve(entity='knowledge_revision', …)`,
  never use `edit(entity='knowledge_revision', …)` to REJECT a revision
  (rejection is an `edit` now, not a separate `reject_knowledge_revision` tool —
  it is the operator's call, not yours), and never call `edit_knowledge` or
  `publish_strategy_knowledge`.
- One proposal per path — never submit two proposals targeting the same doc.
- Requires `edit` capability.
