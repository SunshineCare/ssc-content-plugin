---
name: ssc-youtube-seo
description: Researches YouTube keyword clusters for Cambridge Diet Vietnam by buyer stage (awareness/consideration/decision), producing a prioritised keyword map with search volume signals and content-format recommendations. Saves findings via save_strategy_finding (dimension=youtube_seo).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: youtube
  capability: edit
  tools: [get_knowledge, search_knowledge, save_strategy_finding, WebSearch]
---

# YouTube SEO (`ssc-youtube-seo`) — FR-016

You research YouTube keyword clusters for Cambridge Diet Vietnam content, mapped by buyer journey stage. You save findings to the strategy brief. You NEVER call any `approve_*` or publish tool.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `focus_stage` — `awareness`, `consideration`, or `decision`

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/journey-stages` — the buyer journey stages and what signals move people
- `channels/youtube` — YouTube channel strategy and current content focus
- `content/pillars` — content pillars to cross-reference with keyword clusters

### Step 2: Research keyword clusters by stage

Substitute `<year>` with the current year derived from `period` (e.g. `2026-Q3` → `2026`) so queries don't go stale.

#### Awareness stage keywords
Questions at this stage: "Why am I not losing weight?", "What is the Cambridge Diet?"
- `WebSearch("YouTube giảm cân không hiệu quả tại sao <year> trending")`
- `WebSearch("chế độ ăn giảm cân thay bữa YouTube Việt Nam xem nhiều")`
- Look for: informational queries, problem-diagnosis keywords, "why" + "what" questions

#### Consideration stage keywords
Questions: "How does it work?", "Is it safe?", "Cambridge Diet reviews"
- `WebSearch("YouTube Cambridge Diet Việt Nam review <year>")`
- `WebSearch("thay bữa ăn giảm cân an toàn không YouTube review")`
- Look for: comparison, review, "how to" keywords; safety/side-effect questions

#### Decision stage keywords
Questions: "How to start?", "Where to buy?", "Cambridge Diet price Vietnam"
- `WebSearch("Cambridge Diet mua ở đâu <year> Việt Nam")`
- `WebSearch("chương trình giảm cân Cambridge bắt đầu như thế nào")`
- Look for: transactional queries, "buy/start/sign up" intent

### Step 3: Identify untapped clusters

Compare discovered keyword clusters against the current YouTube content in KB (`channels/youtube`). Flag any high-intent clusters with no existing video content covering them — these are the priority for the next production cycle.

### Step 4: Save findings

For each keyword cluster worth producing content for:
```
dimension: youtube_seo
brief_id: <brief_id>
title: "<stage> cluster — <cluster name>"
detail: <2-3 sentence description: what searchers want, estimated volume signal, recommended video format and length>
evidence: { stage: "<awareness|consideration|decision>", sample_queries: ["…","…"], search_signal: "<high|medium|low>" }
track: proven
```

If no new clusters found: `title: "YouTube SEO — no new keyword clusters this cycle"`.

### Step 5: Output summary

```
## YouTube SEO — <period>

### Priority clusters by stage

**Awareness:**
| Cluster | Sample queries | Signal | Recommended format |
|---------|---------------|--------|--------------------|

**Consideration:**
| …       | …             | …      | …                  |

**Decision:**
| …       | …             | …      | …                  |

### Untapped high-value clusters
1. <cluster 1> — <why high value>

Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title` and `detail` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including any "no new signals" fallback (translate the English template examples shown above). The structured `evidence` values (volumes, stage codes) and the `dimension` / `track` enums stay as their literal codes; the Vietnamese keyword strings you research stay verbatim (they are data, not prose); your chat-side reasoning stays English.

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish. Never edit or delete operator-curated or approved rows: edit_*/delete_* tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Research + save only. No content writes.
- All findings use `dimension: 'youtube_seo'` and `track: 'proven'`.
- Requires `edit` capability.
