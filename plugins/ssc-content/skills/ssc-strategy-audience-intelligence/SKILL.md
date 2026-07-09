---
name: ssc-strategy-audience-intelligence
description: Maps the Cambridge Diet Vietnam audience across the current persona archetypes and both channels (Facebook, YouTube), producing signals about evolving motivations, language shifts, and touchpoint preferences. Saves findings to the strategy brief via save_strategy_finding (dimension=audience).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, search_knowledge, save_strategy_finding, WebSearch]
---

# Audience Intelligence (`ssc-strategy-audience-intelligence`) — FR-013

You research the **Cambridge Diet Vietnam audience** across the current persona archetypes (as listed in `brand/personas`), mapping motivations, language use, and channel behaviour for Facebook and YouTube. You save findings to the strategy brief and output a plain summary. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

## Inputs (provided by the research agent)

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `focus` — one of the current persona codes listed in `brand/personas` (e.g. `chị-hương`, `chị-lan`, `chị-mai`, `chị-thảo`) or a channel

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/personas` — the current persona archetypes + their core motivations
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`; today's four are `brand/persona-huong`, `brand/persona-lan`, `brand/persona-mai`, `brand/persona-thao`) — each persona's own detail doc (ranked trigger points, real Vietnamese vocabulary, objections). Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list, so a persona added later needs no procedural change here. Grounds each persona's search-keyword block in Step 2 in her actual documented language rather than invented keywords
- `brand/journey-stages` — touchpoint map across awareness/consideration/decision
- `channels/facebook` — current Facebook behavioural context
- `channels/youtube` — current YouTube behavioural context

### Step 2: Research current audience signals

For each of the personas currently listed in `brand/personas`, use these persona keywords in searches:
- **Chị Hương (Tiền mãn kinh, 45–55 — ưu tiên cao nhất)** — `giảm cân tiền mãn kinh`, `tăng cân tuổi 45 50`, `giảm cân khoa học`, `nội tiết tố tăng cân`
- **Chị Mai (Tìm lại bản thân, 50–60)** — `giảm cân an toàn tuổi 50`, `giảm cân phòng tiểu đường`, `sức khỏe phụ nữ sau 50`, `năng lượng tuổi trung niên`
- **Chị Lan (Mẹ bận rộn, 35–45)** — `lấy lại vóc dáng sau sinh`, `giảm cân cho mẹ bận rộn`, `giảm cân không cần nấu`, `chăm sóc bản thân sau sinh`
- **Chị Thảo (Mẹ trở lại công sở, 30–40)** — `lấy lại vóc dáng sau sinh đi làm`, `giảm mỡ bụng sau sinh`, `quay lại công sở sau nghỉ thai sản`, `giảm cân sau cai sữa`

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

Self-rate each finding before saving: `score` — an integer 1–5 for how strong/actionable this signal is (evidence quality + strategic relevance to the persona this cycle) — and a one-line Vietnamese `comment` explaining that score. This is a signal-strength rating for the operator's curation (Mark for brief vs dismiss) in the Strategy dashboard, not a pass/fail gate — every finding is saved regardless of score; nothing is dropped or regenerated for a low score.

For each meaningful signal, call `save_strategy_finding`:
```
dimension: audience
brief_id: <brief_id>
title: <persona name> — <one-line signal>
detail: <2–3 sentence description of what changed and why it matters>
evidence: { source: "<url or search query>", signal: "<quote or observation>" }
track: proven
score: <1–5 self-rating>
comment: <one-line Vietnamese rationale for the score>
```

If this dimension yields no new signals, call `save_strategy_finding` once with `title: "Audience — no new signals this cycle"` and `detail: "No meaningful shift detected vs prior KB content."` — omit `score`/`comment` (there is nothing to rate).

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

### Chị Thảo (Mẹ trở lại công sở, 30–40)
- [finding 1]

FB vs YouTube engagement shift:
- [any notable channel behaviour change]

Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title`, `detail`, and `comment` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no new signals" fallback (translate the English template examples shown above). The structured `evidence` values (urls, quotes, signals) and the `dimension` / `track` enums stay as their literal codes; your chat-side reasoning stays English.

## Governance

- Saves findings only; no `edit_knowledge`, no `publish_strategy_knowledge`.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Each `save_strategy_finding` call uses `dimension: 'audience'` and `track: 'proven'`.
- Each substantive finding carries a self-rating (`score` 1–5) + Vietnamese `comment` rationale — a signal-strength signal for the operator's curation, not a pass/fail gate; nothing is dropped for a low score.
- Requires `edit` capability.
