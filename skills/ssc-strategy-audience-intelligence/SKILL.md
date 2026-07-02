---
name: ssc-strategy-audience-intelligence
description: Maps the Cambridge Diet Vietnam audience across 3 persona archetypes and both channels (Facebook, YouTube), producing signals about evolving motivations, language shifts, and touchpoint preferences. Saves findings to the strategy brief via save_strategy_finding (dimension=audience).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, search_knowledge, save_strategy_finding, WebSearch]
---

# Audience Intelligence (`ssc-strategy-audience-intelligence`) — FR-013

You research the **Cambridge Diet Vietnam audience** across three persona archetypes, mapping motivations, language use, and channel behaviour for Facebook and YouTube. You save findings to the strategy brief and output a plain summary. You NEVER call any `approve_*` or publish tool.

## Inputs (provided by the research agent)

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `focus` — a specific persona (`chị-hương`, `chị-mai`, `chị-lan`) or channel

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/personas` — the 3 archetypes + their core motivations
- `brand/journey-stages` — touchpoint map across awareness/consideration/decision
- `channels/facebook` — current Facebook behavioural context
- `channels/youtube` — current YouTube behavioural context

### Step 2: Research current audience signals

For each of the 3 personas (defined in `brand/personas`), use these persona keywords in searches:
- **Chị Hương (Tiền mãn kinh, 45–55 — ưu tiên cao nhất)** — `giảm cân tiền mãn kinh`, `tăng cân tuổi 45 50`, `giảm cân khoa học`, `nội tiết tố tăng cân`
- **Chị Mai (Tìm lại bản thân, 50–60)** — `giảm cân an toàn tuổi 50`, `giảm cân phòng tiểu đường`, `sức khỏe phụ nữ sau 50`, `năng lượng tuổi trung niên`
- **Chị Lan (Mẹ bận rộn, 35–45)** — `lấy lại vóc dáng sau sinh`, `giảm cân cho mẹ bận rộn`, `giảm cân không cần nấu`, `chăm sóc bản thân sau sinh`

Then, for each persona:
1. Search for recent Vietnamese weight-loss and health-product discourse on Facebook groups, TikTok comment patterns (indicative), and YouTube comments using `WebSearch`:
   - Query: `site:facebook.com "Cambridge Diet" OR "giảm cân" <persona-keyword> <current-year> OR <prior-year>` — derive the two years from `period` (e.g. `2026-Q3` → `2026 OR 2025`) so the query never goes stale.
   - Look for: shifting language, new pain points, changed aspirations, new objections
2. Note any divergence from the existing persona doc (new language patterns, new concerns, new motivations).
3. Note which channel (FB vs YouTube) is producing the most engagement signal for this persona.

### Step 3: Map FB vs YouTube behaviour

For each persona, determine:
- **Facebook**: primary content format consuming (post, Reel, Story, comment threads)
- **YouTube**: primary content format consuming (long-form, Shorts, live)
- Any new behaviour (e.g. shifting from long-form to Reels; searching YouTube before FB)

### Step 4: Save findings

For each meaningful signal, call `save_strategy_finding`:
```
dimension: audience
brief_id: <brief_id>
title: <persona name> — <one-line signal>
detail: <2–3 sentence description of what changed and why it matters>
evidence: { source: "<url or search query>", signal: "<quote or observation>" }
track: proven
```

If this dimension yields no new signals, call `save_strategy_finding` once with `title: "Audience — no new signals this cycle"` and `detail: "No meaningful shift detected vs prior KB content."`.

### Step 5: Output summary

Emit a plain-text summary:
```
## Audience Intelligence — <period>

### Chị Hương (Tiền mãn kinh, 45–55)
- [finding 1]
- [finding 2]

### Chị Mai (Tìm lại bản thân, 50–60)
- [finding 1]

### Chị Lan (Mẹ bận rộn, 35–45)
- [finding 1]

FB vs YouTube engagement shift:
- [any notable channel behaviour change]

Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title` and `detail` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no new signals" fallback (translate the English template examples shown above). The structured `evidence` values (urls, quotes, signals) and the `dimension` / `track` enums stay as their literal codes; your chat-side reasoning stays English.

## Governance

- Saves findings only. No `approve_*`, no `edit_knowledge`, no `publish_strategy_knowledge`.
- Each `save_strategy_finding` call uses `dimension: 'audience'` and `track: 'proven'`.
- Requires `edit` capability.
