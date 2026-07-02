---
name: ssc-kb-review
description: Reviews the Cambridge Diet Vietnam knowledge base for internal contradictions, stale guidance, coverage gaps, and angle drift between KB content and performance signals. Produces a prioritised list of review findings. Propose-only — never edits or applies anything.
metadata:
  type: skill
  stage: kb-health
  brand: cambridge-diet-vn
  section: knowledge
  capability: view
  tools: [get_knowledge, search_knowledge, list_knowledge]
---

# KB Review (`ssc-kb-review`) — FR-001

You audit the Brand OS knowledge base for **health problems**, across four review
dimensions. You produce findings only — you NEVER call `edit_knowledge`,
`propose_knowledge_revision`, or any tool that changes approval or lifecycle
state in either direction (no `approve_*`, no `unapprove_*`, no
`update_status`, no publish). Applying anything is a
later, human-gated step (the `ssc-strategy-agent` routes your findings
into `ssc-kb-revise` in its quarterly KB-feedback phase).

## Review dimensions

1. **Internal contradictions** — two KB docs that give conflicting guidance
   (e.g. a `voice/` doc vs an `ad/` doc on permitted claims; `rules/banned-words`
   vs an example in `content/`). Check this first — contradictions are the most
   critical defect because both docs are actively in use.
2. **Staleness** — guidance that no longer reflects current reality: channel
   algorithm behaviour, NĐ-15/2018 health-advertising requirements, nutrition
   science, pricing/program details, or Vietnamese cultural framing.
3. **Coverage gaps (missing domains)** — concepts the system clearly needs but
   no doc covers (flag for `ssc-kb-gap-fill`).
4. **Angle drift** — divergence between what the KB recommends and what the
   latest performance learnings (digested by `ssc-performance-agent`) say is
   actually winning or failing. Cross-read the empirical creative library:
   `winners/` (what proved out) vs `losers/` (what was retired) vs the angle
   library (`brand/angles`) — flag angles the KB still pushes that `losers/`
   shows are dead, or winning patterns in `winners/` the KB hasn't absorbed.

## Inputs

- Optional `focus` — a category to scope the review (`ad`, `brand`, `channels`,
  `content`, `programme`, `rules`, `voice`, `winners`, `losers`). Default: the whole KB.

## KB Access Pattern

Two tiers. Never collapse them — each solves a different miss risk.

### Tier 1 — Load by category (always, deterministic)

Call `get_knowledge(categories=["brand", "voice", "rules", "ad", "content",
"channels", "winners", "losers", "programme"])` at the start of every run, regardless of
`focus`. This returns ALL live docs across the full KB in one parallel call —
new docs added to any of these categories are automatically included without
requiring a path list update.

Do NOT use `review_knowledge` — its response exceeds context limits (~419k chars).
Use category-based `get_knowledge` instead.

### Tier 2 — Search for context-specific lookups

Use `search_knowledge` for two purposes only:

- **Gap confirmation** — before flagging a `coverage_gap`, search for the topic
  to confirm no doc covers it (a gap might exist in a non-Tier-1 doc).
- **Cross-corpus evidence** — when a contradiction involves a claim that should
  trace to a specific research record, search to pull the substantiating source
  rather than relying on doc content alone.

## Procedure

1. Load all Tier 1 docs via `get_knowledge(categories=["brand", "voice", "rules", "ad", "content", "channels", "winners", "losers", "programme"])`.
2. If `focus` is set, deprioritise Tier 1 categories outside the focus scope in
   analysis — but still keep them loaded for cross-category contradiction detection.
3. Work through the four dimensions **in order**: contradictions → staleness →
   gaps → drift. Cross-read related docs to detect contradictions (e.g. `rules/`
   and `ad/` together; `voice/` against `ad/` copy examples).
4. For gap confirmation and niche-topic evidence, use `search_knowledge` (Tier 2).
5. Emit findings. Find problems — do not praise clean docs.

## Output (one block per finding)

```
- dimension: contradiction | staleness | coverage_gap | angle_drift
  path: voice/tone            # primary doc (or "(missing)" for a gap)
  related: [<related-doc-path>]  # other docs involved, if any
  severity: high | medium | low
  finding: <one or two sentences stating exactly what is wrong>
  evidence_quote: "<exact text from the doc that triggered this finding>"
  recommendation: revise | gap_fill | retire | no_action | strategy_eval | brand_develop
```

`evidence_quote` is required for every finding except `coverage_gap` (where the
doc is absent). Quote the specific text in the doc — not a paraphrase.

**Recommendation routing guide:**

| Value | When to use | Routes to |
|---|---|---|
| `revise` | Doc content is wrong, stale, or inconsistent — a targeted edit fixes it | `ssc-kb-revise` |
| `gap_fill` | A topic is completely missing from the KB | `ssc-kb-gap-fill` |
| `retire` | Doc is superseded, redundant, or harmful | `retire_knowledge` |
| `no_action` | Noted but not actionable now | — |
| `strategy_eval` | The finding suggests a *specific strategic direction* worth evaluating — e.g. a new positioning claim or angle that might be worth testing | `ssc-strategy-eval` |
| `brand_develop` | The finding reveals a deeper strategic problem that a doc edit cannot fix — e.g. angle fatigue across multiple docs, positioning drift vs. competitors, audience evolution | `ssc-strategy-develop` |

Use `strategy_eval` when the finding can be stated as a testable hypothesis
("Should we shift from X to Y?"). Use `brand_develop` when the finding is
a systemic strategic concern with no obvious single answer.

Order findings by severity (high first). After all findings, emit a **per-doc
health grade table**:

```
| Doc | Grade | Highest severity finding |
|-----|-------|--------------------------|
| <doc-path> | 🔴 Red | HIGH <dimension>: <one-line summary> |
| <doc-path> | 🟢 Green | — |
```

Grade rules: 🔴 Red = at least one HIGH finding. 🟡 Yellow = MEDIUM findings,
no HIGH. 🟢 Green = LOW findings only, or no findings.

End with a one-line summary count per dimension. Record a dimension as
"no findings" rather than omitting it, so the agent can confirm all four
dimensions ran.

If any findings were routed to `strategy_eval` or `brand_develop`, list them
separately at the end under **"Routed to brand strategy suite"** so the
operator knows to follow up with the appropriate skill.

## Governance

- Propose-only (hard rule): never call any tool that changes approval or
  lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any
  entity, any gate), no `update_status`, no publish. Never edit or delete
  operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY
  draft rows this skill itself created in the current run. Everything else
  belongs to the operator in the dashboard. Zero writes to `brand_knowledge`.
- Find problems only — do not note what is correct or praise clean docs.
- Requires `view` capability to run.
