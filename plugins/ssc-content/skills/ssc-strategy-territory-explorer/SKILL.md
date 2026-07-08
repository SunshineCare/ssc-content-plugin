---
name: ssc-strategy-territory-explorer
description: Explores genuinely new content angles and territories for Cambridge Diet Vietnam — ideas not currently in the KB or recent content, tagged as experimental with confidence and cost_risk ratings. Saves findings via save_strategy_finding with dimension=new_territories and track=experimental.
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, search_knowledge, save_strategy_finding, WebSearch]
---

# Territory Explorer (`ssc-strategy-territory-explorer`) — FR-018c

You explore **genuinely new** content/ad angles for Cambridge Diet Vietnam — territories the brand hasn't yet occupied. Every finding you save is tagged `track: 'experimental'` with `confidence` and `cost_risk` ratings. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

## Critical constraint

**New-territories only.** Do NOT surface angles already in `brand/angles` (THE source of truth for the angle taxonomy), `content/pillars`, or the recent KB content — these are proven territory. Your job is to find what is NOT there yet.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `seed_themes` — specific themes to explore (otherwise self-direct)

## Procedure

### Step 1: Load brand context (for exclusion, not inspiration)

Call `get_knowledge` for:
- `brand/angles` — EXCLUDE every officially-defined angle (THE source of truth for the ad+content angle taxonomy)
- `content/pillars` — EXCLUDE these
- `brand/personas` — the current audience personas (name, age range, priority tier). Treat this as the live source of truth for how many personas exist and what they're called — do not assume a fixed count. Use these to evaluate whether a new territory could resonate.
- `brand/persona-huong`, `brand/persona-lan`, `brand/persona-mai`, `brand/persona-thao` — each persona's detail doc (a persona's `brand/persona-<slug>` path is its taxonomy `code` with the `chi-` prefix stripped, e.g. `chi-huong` → `brand/persona-huong`; this is a batch skill evaluating candidate territories against every persona in one run, so load all currently-documented detail docs). Each carries ranked trigger points, objections, and real vocabulary to echo/avoid — use this to judge whether a candidate territory would actually resonate with a *specific* persona's documented pain points/language, not just her name/age bracket.
- `brand/positioning` — use to filter for brand fit

Use `search_knowledge` to check if candidate new territories are already covered.

### Step 2: Generate candidate territories

Look for inspiration in adjacent markets, cultural moments, and emerging trends:

**Adjacent market signals** (substitute `<year>`/`<years>` with the current year and current+prior year derived from `period`, e.g. `2026-Q3` → `2026` / `2026 2025`):
- `WebSearch("xu hướng sức khỏe phụ nữ Việt Nam <year> mới nhất")`
- `WebSearch("mental health phụ nữ Việt Nam mạng xã hội <years>")`
- `WebSearch("wellness trend Vietnam <year> social media")`
- `WebSearch("gut health microbiome Vietnam trending <year>")`

**Cultural + seasonal moments not yet covered:**
- Vietnamese cultural calendar: upcoming holidays, milestones (Tết, Vu Lan, 8/3, school year)
- Life moments CDV hasn't tapped: post-pregnancy, menopause, return-to-work

**Format/angle experimentation:**
- Could a new angle work that blends our proof-points with a currently untapped emotion?
- Is there a "before/after" format competitor we haven't tried?

### Step 3: Evaluate each candidate territory

For each candidate:

| Dimension | Question |
|-----------|----------|
| **Brand fit** | Does it fit CDV's woman-to-woman tone and positioning? |
| **Audience resonance** | Which persona(s) currently listed in `brand/personas` (today: Chị Hương / Chị Lan / Chị Mai / Chị Thảo) would respond? |
| **Compliance risk** | Any NĐ-15/2018 concerns? (medical claims, testimonial rules) |
| **Production cost** | Easy (text post) / Medium (video) / Hard (events, partnerships) |
| **Confidence** | How strong is the evidence this would work? (high/medium/low) |
| **Cost risk** | What's the risk if it fails? (high/medium/low) |

Only proceed to saving if: brand fit ✅ AND audience resonance ✅ AND compliance clear ✅.

### Step 4: Save findings

Every finding from this skill MUST be tagged `track: 'experimental'`:
```
dimension: new_territories
brief_id: <brief_id>
title: "New territory — <angle/theme name>"
detail: <what the territory is, which persona it targets, why CDV hasn't explored it, how it would work as content or ad>
evidence: { persona: "<Chị Hương|Chị Lan|Chị Mai|Chị Thảo|all>", format_candidates: ["post", "reel", "youtube-short"], compliance_notes: "<any NĐ-15 considerations>" }
track: experimental
confidence: high | medium | low
cost_risk: high | medium | low
```

Aim for 3–7 genuinely new territories per cycle. If you cannot find territories that pass the evaluation, save: `title: "New territories — no qualifying candidates this cycle"` with `track: 'proven'` (not experimental).

### Step 5: Output summary

```
## Territory Explorer — <period>

### New experimental territories (ranked by confidence)

| Territory | Target persona | Confidence | Cost risk | Reason to try |
|-----------|-----------------|-----------|----------|---------------|
| …         | …               | High       | Low      | …             |

### Excluded (brand fit or compliance concerns)
- <territory>: <why excluded>

Findings saved: <N> (all experimental)
```

## Output language

**Write the finding prose in Vietnamese.** `title` and `detail` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including any "no new territories" fallback (translate the English template examples shown above). The structured `evidence` values (confidence, cost_risk, slugs) and the `dimension` / `track` enums (`new_territories`, `experimental`) stay as their literal codes; your chat-side reasoning stays English.

## Governance

- Research + save only (`save_strategy_finding` is the only write); no content writes.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- All substantive findings use `dimension: 'new_territories'` AND `track: 'experimental'` AND both `confidence` and `cost_risk` populated.
- No-candidate fallback uses `track: 'proven'` (it's a factual observation, not an experiment).
- Requires `edit` capability.
