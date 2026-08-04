---
name: ssc-kb-revise
description: Generates precise, evidence-backed revision proposals for one or more Cambridge Diet Vietnam knowledge-base documents. Reads the current document, edits that exact text, and proposes the WHOLE revised document — never a patch. Always propose-only via propose_knowledge_revision — it NEVER applies revisions. Every proposal carries a target path, the full proposed content, a rationale, and an evidence citation.
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

## Hard rule — read the doc, edit it, propose the whole doc

Every proposal follows the same three moves, in this order, for every path:

1. **READ the current document live** with `get_knowledge` in this run. The
   document you edit is the text that call returned — never a remembered
   version, never a copy carried in from a finding, another skill, or an earlier
   session. The KB is revised on its own cadence; anything not read this run is
   assumed stale.
2. **MAKE the change on that exact text.** Edit in place: change only what the
   findings require and keep every other byte verbatim — voice, structure,
   heading depth, ordering, whitespace, the H1 title line.
3. **PROPOSE the WHOLE document** as `proposed_content` — the complete "after",
   top to bottom, ready to replace the doc as-is.

**Never propose a patch.** `proposed_content` is a full replacement: the server
stores it verbatim and approval overwrites the doc with it, so anything short of
the whole document silently destroys the rest of it. Specifically, `proposed_content`
must NEVER be a diff or unified-diff hunk, a changed section or paragraph on its
own, an instruction describing the edit ("thay đoạn 2 bằng…"), or a document
abridged with an elision marker (`…`, `[giữ nguyên]`, "unchanged"). If a doc is
long, the "after" is long — write it out in full.

Read all affected paths before drafting anything; do not interleave reads and
writes.

## Inputs

A list of one or more findings, each with:

- `path` — the target doc (e.g. `rules/compliance`).
- `finding` — what's wrong and why it should change.
- `evidence` — a free-text evidence note naming the substantiating source or
  signal (the publisher/domain, the query, the date accessed, or the performance
  signal). **Required** — a proposal without evidence is invalid (FR-061).
  There is no research ledger and no `research_id`: the `research` table and
  `save_research` were removed, so the note IS the provenance.
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
   "before") — the READ of the hard rule above. A path that comes back in
   `missing` has no document to revise: report it as a finding for
   `ssc-kb-gap-fill` and propose nothing against it. Also load all docs in the
   governing category to check for consistency — e.g. if revising any `rules/`
   doc, call `get_knowledge(categories=["rules"])`; if revising any `ad/` doc,
   call `get_knowledge(categories=["ad"])`. Using the category parameter catches
   sibling docs added since any path list was last updated. Read all affected
   paths before drafting — do not interleave reads and writes.
3. For each path, take that "before" text and apply the findings to it, then
   produce the **whole revised document** as the "after" — every section the
   "before" had, in its original order, with only the findings' changes made.
   Keep edits **minimal and surgical**: change only what the findings require;
   preserve voice, structure, headings, and unrelated text verbatim. When
   multiple findings target the same doc, fold all of them into one coherent
   "after". Before moving on, re-read your "after" against the "before" and
   confirm nothing was dropped, truncated, summarised, or elided.
4. Run the **pre-submission self-check** (below), then call
   `propose_knowledge_revision` for each path with:
   - `path`
   - `proposed_content` (the full "after")
   - `rationale` (one paragraph covering all findings for that path)
   - `evidence_note` (required in practice — the tool's only evidence field;
     there is no `evidence_research_id`)

   Proposals for independent paths may be submitted in parallel.

## Pre-submission self-check

Before calling `propose_knowledge_revision` for any proposal, verify every item:

- [ ] No two proposals share the same `path`
- [ ] Every proposal carries an `evidence_note` naming a real source
- [ ] All `gap_fill` findings have been moved to the "Routed to gap-fill" list,
      not drafted as revisions
- [ ] The current doc was read with `get_knowledge` **in this run** — the "after"
      was built on that text, not on a remembered or inherited copy
- [ ] `proposed_content` is the WHOLE document — no diff, no lone section, no
      instruction describing the edit, no `…` / "giữ nguyên" / "unchanged" elision
- [ ] Every heading and section present in the "before" is present in the "after"
      (unless a finding explicitly removes it), in the same order, and the H1
      title line is intact
- [ ] Edits are minimal — only what the finding requires was changed; unrelated
      text is preserved verbatim

If any item fails, fix before submitting.

## Output

For each proposal, report the `proposal_id`, `path`, severity, findings
addressed, and confirm `status: pending` — and state that the proposal carried
the **full revised document**, naming what changed inside it (which sections)
rather than shipping those sections as the content.

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
