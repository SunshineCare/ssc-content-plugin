---
name: ssc-kb-audit
description: Audits every claim in the rules/, ad/ and winners/ knowledge documents for Cambridge Diet Vietnam, verifying each traces to a substantiated evidence source. Flags unsubstantiated claims with a recommendation to either cite evidence or remove the claim. Propose-only.
metadata:
  type: skill
  stage: kb-health
  brand: cambridge-diet-vn
  section: knowledge
  capability: view
  tools: [get_knowledge, search_knowledge]
---

# KB Audit (`ssc-kb-audit`) — FR-002

You verify that **every factual or compliance-bearing claim** in the `rules/`,
`ad/` and `winners/` knowledge documents is **substantiated** — i.e. traceable to
a research record, a regulatory source (NĐ-15/2018), nutrition science, or a
documented brand fact. Unsubstantiated claims in these categories are the
highest-risk KB defect: they directly drive compliance verdicts and ad copy.
(`winners/` holds curated winning ad copy that is used verbatim in live ads, so
its efficacy/credibility claims — "60 năm", "chuẩn EU", "26 vitamin" — carry the
same compliance risk as `ad/` and must trace to evidence.)

You produce findings only. You NEVER edit or apply.

## Why rules/, ad/ and winners/ specifically

These categories govern what the brand is **legally allowed to say**, the
**angles ad copy may use**, and the **curated winning copy that ships in live
ads**. A wrong or unsourced claim here propagates into every ad and every
compliance check. (Other categories are reviewed by `ssc-kb-review`, not audited
for substantiation here. `losers/` is records of retired copy — not audited,
since it never ships.)

## KB Access Pattern

### Tier 1 — Load by category (always, deterministic)

Call `get_knowledge(categories=["rules", "ad", "winners"])` at the start of each run. This
returns ALL live docs in all three categories in one parallel call — new paths
added to any of them are automatically included. No separate `list_knowledge`
diff is needed.

### Tier 2 — Search for evidence

Use `search_knowledge` to find substantiating `research` records and KB evidence
for each claim being audited. Search is correct here because the evidence for any
given claim may be anywhere in the KB or in the research corpus.

## Procedure

1. Load all Tier 1 docs via `get_knowledge(categories=["rules", "ad", "winners"])`.
2. Extract each discrete claim (a statement asserting a fact, a permitted/banned
   action, an efficacy figure, a regulatory requirement).
3. For each claim, use `search_knowledge` (Tier 2) to find a substantiating
   `research` record or a citing source already in the KB.
4. Classify each claim:
   - **substantiated** — clear evidence found; record the source.
   - **unsubstantiated** — no traceable source, OR the link to a source is
     ambiguous.

   **Fail-closed rule:** When in doubt, classify as unsubstantiated. The cost of
   flagging a valid claim is a researcher spending time to verify it; the cost of
   passing an invalid claim is it propagating into every ad and every compliance
   check.

## Output (one block per unsubstantiated claim)

```
- path: rules/compliance
  claim: "<the exact claim text, quoted verbatim>"
  status: unsubstantiated
  recommendation: cite_evidence | remove_claim
  suggested_evidence: <research id / source to chase, if known>
```

End with: total claims checked, # substantiated, # unsubstantiated, per category.
A doc with all claims substantiated is reported as "clean — N claims checked,
all substantiated."

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either
  direction — never call `approve` (the ONLY gated promotion; the approval
  hook denies it to agents, any entity, any gate), and never publish. Demotion
  is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban
  lives here: never use `edit` to demote, unapprove, discard, or reject a row.
  Never edit or delete operator-curated or approved rows: the generic
  `edit`/`delete` verbs may target ONLY draft rows this skill itself created
  in the current run. Everything else belongs to the operator in the
  dashboard. This skill makes no writes at all.
  Requires `view`.
- Every downstream revision generated from your findings MUST carry an evidence
  citation (FR-061) — that is the whole point of this audit.
- Find problems only — do not praise substantiated claims.
