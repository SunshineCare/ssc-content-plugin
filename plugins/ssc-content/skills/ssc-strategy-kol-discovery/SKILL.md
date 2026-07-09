---
name: ssc-strategy-kol-discovery
description: Discovers and evaluates Key Opinion Leaders (KOLs) on Facebook, YouTube, and TikTok by fit to the Cambridge Diet Vietnam audience personas (per brand/personas). Produces ranked shortlists with audience overlap, tone alignment, and estimated collaboration value. Saves findings via save_strategy_finding (dimension=kol).
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_knowledge, search_knowledge, save_strategy_finding, WebSearch]
---

# KOL Discovery (`ssc-strategy-kol-discovery`) — FR-014

You discover and evaluate Key Opinion Leaders (KOLs) relevant to Cambridge Diet Vietnam across Facebook, YouTube, and TikTok, filtered by fit to the brand's audience personas as currently listed in `brand/personas`. You save findings to the strategy brief. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `platform` — limit to `facebook`, `youtube`, or `tiktok`

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/personas` — the current audience personas (name, age range, priority tier) and their tone/value expectations. Treat this as the live source of truth for how many personas exist and what they're called — do not assume a fixed count.
- `brand/persona-huong`, `brand/persona-lan`, `brand/persona-mai`, `brand/persona-thao` — each persona's detail doc (a persona's `brand/persona-<slug>` path is its taxonomy `code` with the `chi-` prefix stripped, e.g. `chi-huong` → `brand/persona-huong`; this is a batch/research skill covering every persona in one run, so load all currently-documented detail docs). Each carries real vocabulary to echo/avoid, channel and trust behaviour, and tone guidance specific to that persona — use this to judge whether a candidate KOL's actual audience, voice, and platform habits match a *specific* persona's documented language and channels, not just a name/age-bracket guess.
- `brand/positioning` — what Cambridge Diet Vietnam claims
- `brand/proof-points` — credibility signals the KOL should be able to reinforce

### Step 2: Discover KOLs by persona

For each persona currently listed in `brand/personas` (today: Chị Hương / Chị Lan / Chị Mai / Chị Thảo), search for Vietnamese health/weight-loss influencers on each platform. Substitute `<year>` with the current year derived from `period` (e.g. `2026-Q3` → `2026`) so queries don't go stale:

**Facebook:**
- Search: `WebSearch("KOL giảm cân Facebook Việt Nam <year> uy tín")`
- Search: `WebSearch("influencer sức khỏe phụ nữ Vietnam Facebook page lớn")`

**YouTube:**
- Search: `WebSearch("kênh YouTube giảm cân Việt Nam <year> nhiều subscribers")`
- Search: `WebSearch("bác sĩ dinh dưỡng YouTube Vietnam")`

**TikTok** — the brand publishes only on Facebook and YouTube, but TikTok KOLs are in scope because they routinely cross-post to FB/YouTube and signal emerging archetype language. Evaluate them for cross-platform reach, not as a TikTok publishing play:
- Search: `WebSearch("TikTok giảm cân Việt Nam <year> followers nhiều")`

### Step 3: Evaluate KOL fit

For each discovered KOL, assess:

| Criterion | What to evaluate |
|-----------|-----------------|
| **Persona fit** | Which of the personas currently listed in `brand/personas` (today: Chị Hương 45–55 / Chị Lan 35–44 / Chị Mai 50–60 / Chị Thảo 30–40) does their audience lean toward? |
| **Tone alignment** | Does their voice match Cambridge Diet VN's woman-to-woman tone? (not clinical; not pushy) |
| **Audience size** | Approximate follower/subscriber count |
| **Engagement quality** | Comments quality — real questions/testimonials vs generic |
| **Brand safety** | No medical claims that would violate NĐ-15/2018 |
| **Existing partnership conflicts** | Search for competing meal replacement brand deals |

### Step 4: Save findings

Self-rate each finding before saving: `score` — an integer 1–5 for how strong/actionable this KOL candidate is (persona fit + tone alignment + audience quality) — and a one-line Vietnamese `comment` explaining that score. This is a signal-strength rating for the operator's curation (Mark for brief vs dismiss) in the Strategy dashboard, not a pass/fail gate — every finding is saved regardless of score; nothing is dropped or regenerated for a low score.

For each KOL worth shortlisting, call `save_strategy_finding`:
```
dimension: kol
brief_id: <brief_id>
title: <KOL name> — <platform> — <persona fit>
detail: <audience size, tone fit, key channel, why they match the persona>
evidence: { platform: "<fb|yt|tiktok>", url: "<profile link>", persona: "<Chị Hương|Chị Lan|Chị Mai|Chị Thảo>", est_followers: "<N>" }
track: proven
score: <1–5 self-rating>
comment: <one-line Vietnamese rationale for the score>
```

If no relevant new KOLs are found this cycle, save one finding: `title: "KOL — no new discoveries this cycle"` — omit `score`/`comment` (there is nothing to rate).

### Step 5: Output summary

```
## KOL Discovery — <period>

### Facebook shortlist
| Name | Persona fit | Est. audience | Tone match |
|------|--------------|--------------|------------|
| …    | …            | …            | …          |

### YouTube shortlist
| …    | …            | …            | …          |

### TikTok shortlist
| …    | …            | …            | …          |

Recommended for outreach this cycle: <names>
Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title`, `detail`, and `comment` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no new discoveries" fallback (translate the English template examples shown above). The structured `evidence` values (platform, url, persona, est_followers) and the `dimension` / `track` enums stay as their literal codes; KOL names and profile URLs stay verbatim; your chat-side reasoning stays English.

## Governance

- Research + save only (`save_strategy_finding` is the only write); no content writes.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- All findings use `dimension: 'kol'` and `track: 'proven'`.
- Each substantive finding carries a self-rating (`score` 1–5) + Vietnamese `comment` rationale — a signal-strength signal for the operator's curation, not a pass/fail gate; nothing is dropped for a low score.
- Requires `edit` capability.
