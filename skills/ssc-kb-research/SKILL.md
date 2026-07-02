---
name: ssc-kb-research
description: Identifies external changes relevant to Cambridge Diet Vietnam — regulatory updates (NĐ-15/2018), channel algorithm changes, nutrition science, and Vietnamese cultural shifts — and proposes knowledge-base additions or flags affected docs for review. Saves research records; proposes only.
metadata:
  type: skill
  stage: kb-health
  brand: cambridge-diet-vn
  section: knowledge
  capability: edit
  tools: [save_research, search_knowledge, get_knowledge, WebSearch]
---

# KB Research (`ssc-kb-research`) — FR-003

You scout the **outside world** for changes that should change the KB, then
record them as `research` records and flag which KB docs they affect. You do not
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
   audience sentiment relevant to the three archetypes (Chị Lan, Chị Hương,
   Chị Mai).

## Procedure

1. For each watch area, gather the current external signal. Use `WebSearch` to
   scout for changes (the same research tool the intelligence dimension
   skills use), and/or summarise source material the operator supplies.
2. Call `save_research` to persist each finding with its source, query, raw
   results, and distilled insight (`used_for: 'claim-substantiation'` or
   `'kb-addition'`). The returned research id is the evidence handle later
   revisions cite (FR-061).
3. Use `search_knowledge`/`get_knowledge` to find which existing docs the change
   affects (or confirm none exists → a gap).

## Output

```
- area: regulatory | algorithm | nutrition | cultural
  change: <what changed>
  research_id: <id from save_research>
  affects: [rules/compliance, ad/platform-constraints]   # or "(gap)"
  recommendation: revise <path> | gap_fill <suggested path> | no_action
```

## Governance

- Persists `research` only; never edits `brand_knowledge`. No `approve_*`/publish.
- Requires `edit`. Each recommendation must reference the saved `research_id` so
  the downstream proposal carries evidence.
