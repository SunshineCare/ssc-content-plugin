---
name: ssc-strategy-content-gap
description: Identifies content gaps across Cambridge Diet Vietnam's content pillars and formats by calling get_content_gaps, then cross-referencing against audience intelligence and competitor coverage. Saves findings via save_strategy_finding (dimension=content_gap).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, get_content_gaps, get_strategy_brief, save_strategy_finding]
---

# Content Gap Analysis (`ssc-strategy-content-gap`) — FR-018

You identify content coverage gaps for Cambridge Diet Vietnam by analysing what has been produced vs what is needed, using `get_content_gaps`. You save findings to the strategy brief. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `channel` — limit to `facebook` or `youtube`

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `content/pillars` — the content pillar strategy (what topics CDV should be covering)
- `content/formats` — expected format mix per channel
- `channels/facebook` — Facebook content strategy
- `channels/youtube` — YouTube content strategy

### Step 2: Call get_content_gaps

Call `get_content_gaps` to retrieve per-pillar coverage metrics. **This tool is pillar-level only** — for each pillar it returns `pieces_30d`, `pieces_total`, `scored_pieces`, `avg_score`, `share_of_recent_output`, and a per-pillar `gaps: string[]` list. It returns NO format, channel, or buyer-stage breakdown.

Parse the response into:
- **Pillar gaps** — pillars with low or no recent coverage (low `pieces_30d` / low `share_of_recent_output` / `avg_score` well below `overall_avg_score`, plus any entries in the per-pillar `gaps[]` list).

Format, channel, and buyer-stage gaps are NOT available from `get_content_gaps`. Derive those only from the Step 1 knowledge docs (`content/formats`, `channels/facebook`, `channels/youtube`) and this cycle's brief findings (Step 3) — never attribute them to `get_content_gaps`.

### Step 3: Cross-reference with this cycle's audience and competitor findings

This-cycle findings live on the **strategy brief**, not in `brand_knowledge` — so read them from the brief, not via `search_knowledge` (which only searches the published KB and will not return them). Call `get_strategy_brief` with `brief_id` and `marked_only: false` to get all findings saved so far, then filter:
- `dimension: audience` — do audience findings reveal unmet topic needs?
- `dimension: competitor` — is a competitor owning a pillar we're ignoring (gap opportunities)?

Content-gap runs 6th of 8, so audience (1st) and competitor (3rd) findings are already on the brief.

### Step 4: Prioritise gaps

Rank the **pillar gaps** (the real `get_content_gaps` output) by:
1. **Audience demand** (confirmed by audience-intelligence signals from Step 3)
2. **Competitor exposure** (a pillar a competitor is winning while we're absent)
3. **Strategic fit** (aligns with ad-intelligence's awareness-level diagnosis)
4. **Ease of production** (can be addressed with a single post vs a long-form video)

Channel and buyer-stage are **secondary qualifiers** on each pillar gap, sourced from Step 1 docs and Step 3 findings — not from `get_content_gaps`.

### Step 5: Save findings

Self-rate each candidate finding before saving: `score` — an integer 1–5 for how strong/actionable this gap is (evidence quality from `get_content_gaps` + strategic relevance this cycle) — and a one-line Vietnamese `comment` explaining that score. `score` is distinct from `evidence.priority`: `priority` ranks urgency among the gaps found, `score` rates how strong the evidence for this particular gap is.

**Quality gate — only score ≥4 is saved.** If a candidate gap rates ≤3, drop it (never save it) and move to the next-ranked pillar gap from Step 4's prioritisation to replace it; re-score the replacement. Bound this at 2 replacement attempts per slot — if a replacement still can't clear ≥4, drop the slot entirely (save nothing for it) and note the drop in the Step 6 summary. Score honestly; never inflate a weak gap to 4 just to pass the gate.

For each finding rated ≥4:
```
dimension: content_gap
brief_id: <brief_id>
title: "<pillar or format> gap — <channel>"
detail: <what's missing, why it matters, recommended content type to fill it>
evidence: { pillar: "<name>", channel: "<fb|youtube>", stage: "<awareness|consideration|decision>", priority: "<high|medium|low>" }
track: proven
score: <integer 4 or 5>
comment: <one-line Vietnamese rationale for the score>
```

If no gap clears the gate: `title: "Content gap — no significant gaps identified this cycle"` — omit `score`/`comment` (there is nothing to rate).

### Step 6: Output summary

```
## Content Gap Analysis — <period>

### Priority gaps
| Gap type | Pillar/Format | Channel | Stage | Priority |
|----------|--------------|---------|-------|----------|

### Recommended content to fill top gaps (for ssc-content-brief)
1. <format> on <pillar> for <stage> — <channel>

Findings dropped (rated ≤3, no ≥4 replacement found): <N>
Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title`, `detail`, and `comment` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no significant gaps" fallback (translate the English template examples shown above). The structured `evidence` values (pillar, channel, stage, priority) and the `dimension` / `track` enums stay as their literal codes; your chat-side reasoning stays English.

## Governance

- Research + save only (`save_strategy_finding` is the only write); no content writes.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- All findings use `dimension: 'content_gap'` and `track: 'proven'`.
- Every candidate finding is self-rated before saving; only findings rated ≥4 are persisted via `save_strategy_finding`. A candidate rated ≤3 is dropped and replaced with the next-ranked gap (bounded at 2 attempts per slot) — never saved, never inflated to pass.
- Requires `edit` capability.
