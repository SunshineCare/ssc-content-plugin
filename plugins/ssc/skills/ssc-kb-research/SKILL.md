---
name: ssc-kb-research
description: Identifies external changes relevant to Cambridge Diet Vietnam — regulatory updates (NĐ-15/2018), channel algorithm changes, nutrition science, and Vietnamese cultural shifts — and proposes knowledge-base additions or flags affected docs for review. Carries provenance in the report itself; proposes only.
metadata:
  type: skill
  stage: kb-health
  brand: cambridge-diet-vn
  section: knowledge
  capability: view
  tools: [search_knowledge, get_knowledge, WebSearch]
---

# KB Research (`ssc-kb-research`) — FR-003

You scout the **outside world** for changes that should change the KB, then
report them with their provenance and flag which KB docs they affect. You do not
edit the KB — you give `ssc-kb-revise`/`ssc-kb-gap-fill` substantiated raw
material to work from.

## Watch areas

1. **Regulatory** — NĐ-15/2018 and related Vietnamese health-advertising /
   food-supplement rules; Meta Ads policy changes affecting health claims.
2. **Channel algorithms** — Facebook Reels/Feed ranking, YouTube Shorts and
   long-form ranking, distribution changes that shift format strategy.
3. **Nutrition science** — new evidence relevant to meal-replacement / weight
   management that strengthens or undermines an existing claim.
4. **Vietnamese cultural shifts** — language, trends, seasonal/holiday framing,
   audience sentiment relevant to the personas currently listed in
   `brand/personas` (do not assume a fixed count or name list).

## Procedure

1. For each watch area, gather the current external signal. Use `WebSearch` to
   scout for changes (the same research tool the intelligence dimension
   skills use), and/or summarise source material the operator supplies.
2. Carry the provenance in the report itself — see **Provenance** below. There
   is no research ledger to write to.
3. Use `search_knowledge`/`get_knowledge` to find which existing docs the change
   affects (or confirm none exists → a gap).

## Provenance — the report is the only record

**There is no `research` table.** The table, the `save_research` tool and
`knowledge_versions.evidence_research_id` were all removed when the head moved to
a markdown `research` column. **Never call `save_research`** — it does not exist,
and referencing a removed server tool is a recurring shipped-bug class in this
repo. `ssc-plan-research` carries the same rule.

So the report is the only thing standing between a sourced finding and a bare
assertion. For every search you run, hold the **query** you actually issued, the
**source** (publisher/domain, not just "the web"), the **date accessed**, and
**what that search established** — one clause. A finding whose source is not
listed is a defect: remove the finding or add the source.

## Output

```
- area: regulatory | algorithm | nutrition | cultural
  change: <what changed>
  source: <publisher/domain> — <query issued> — accessed <YYYY-MM-DD>
  established: <one clause: what this search actually showed>
  affects: [rules/compliance, ad/platform-constraints]   # or "(gap)"
  recommendation: revise <path> | gap_fill <suggested path> | no_action
```

## Governance

- Writes nothing at all — this skill reads and reports. It never edits
  `brand_knowledge` and holds no write verb. Propose-only (hard rule): never
  call any tool that changes approval or lifecycle state in either direction —
  never call `approve` (the ONLY gated promotion; the approval hook denies it to
  agents, any entity, any gate), and never publish. Demotion is no longer a
  separate `unapprove_*` tool — it is an `edit`, and this skill holds neither
  `edit` nor `delete`. Everything that changes a row belongs to the operator in
  the dashboard.
- Requires `view` only. Each recommendation must carry its own source line so the
  downstream proposal inherits the evidence.
