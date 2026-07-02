---
name: ssc-strategy-competitor-intelligence
description: Maps the Vietnamese meal-replacement and weight-loss competitor landscape — content angles, ad angles, format mix, and gaps Cambridge Diet Vietnam can exploit. Saves findings via save_strategy_finding (dimension=competitor).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, save_strategy_finding, WebSearch]
---

# Competitor Intelligence (`ssc-strategy-competitor-intelligence`) — FR-015

You map the Vietnamese weight-loss and meal-replacement competitor landscape: what they are publishing, which ad angles they run, what is working, and where the gaps are for Cambridge Diet Vietnam. You save findings to the strategy brief. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `focus` — `content` or `ads` to narrow scope

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/angles` — Cambridge Diet VN's canonical ad+content angle library (single source of truth, to detect overlap with competitors)
- `brand/positioning` — what we claim (to find whitespace)
- `content/pillars` — our content pillars (to find competitor coverage of same pillars)

### Step 2: Research competitors

Identify direct and adjacent competitors in the Vietnamese market. Substitute `<years>` with the current and prior year derived from `period` (e.g. `2026-Q3` → `2026 2025`) so queries stay current:

**Direct** (meal-replacement / VLCD programs):
- Search: `WebSearch("chương trình giảm cân thay bữa ăn Việt Nam <years> top")`
- Known competitors: scan Facebook Ads Library for any meal-replacement brands running ads

**Adjacent** (diet supplements, weight-management apps, gyms):
- Search: `WebSearch("thực phẩm bổ sung giảm cân Việt Nam hot <years>")`

### Step 3: Content angle gap map

For each identified competitor:

1. **Content inventory**: What content pillars do they cover? (testimonials, science, recipes, lifestyle, community)
2. **Dominant ad angle**: Fear-of-failure / aspiration / social-proof / science / bargain?
3. **Format mix**: Long post vs Reel vs video; Facebook vs YouTube emphasis
4. **Compliance posture**: Are they making claims that likely violate NĐ-15/2018? (signals a risk if we haven't flagged it)

Build a gap map:
```
Pillar / angle | Us | Competitor A | Competitor B | Gap?
```

### Step 4: Save findings

For each meaningful signal, call `save_strategy_finding`:
```
dimension: competitor
brief_id: <brief_id>
title: <competitor name> — <what they're doing that's notable>
detail: <description of content/ad angle, format, what's working, gap this creates for CDV>
evidence: { competitor: "<name>", platform: "<fb|yt>", observation: "<what you saw>", source: "<url>" }
track: proven
```

Also save one "gap opportunity" finding per identified whitespace:
```
title: "Gap opportunity — <topic/angle competitors are missing>"
detail: <why this is a gap and how CDV can own it>
```

If no meaningful competitor activity is found, save one finding: `title: "Competitor — no new signals this cycle"`.

### Step 5: Output summary

```
## Competitor Intelligence — <period>

### Active competitors
| Competitor | Dominant angle | Main format | NĐ-15 risk? |
|------------|---------------|------------|-------------|

### Gap opportunities for Cambridge Diet VN
1. <gap 1>
2. <gap 2>

### Overlap alert (angles we share — risk of undifferentiation)
- <angle>: also used by <competitor>

Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title` and `detail` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese — including the "gap opportunity" findings. This applies to **every** finding you save — including the "no new signals" fallback (translate the English template examples shown above). The structured `evidence` values (competitor, platform, observation, source) and the `dimension` / `track` enums stay as their literal codes; competitor names and URLs stay verbatim; your chat-side reasoning stays English.

## Governance

- Research + save only (`save_strategy_finding` is the only write); no content writes.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- All findings use `dimension: 'competitor'` and `track: 'proven'`.
- Requires `edit` capability.
