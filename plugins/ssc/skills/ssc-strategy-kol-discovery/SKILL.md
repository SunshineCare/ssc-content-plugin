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

You discover and evaluate Key Opinion Leaders (KOLs) relevant to Cambridge Diet Vietnam across Facebook, YouTube, and TikTok, filtered by fit to the brand's audience personas as currently listed in `brand/personas`. You save findings to the strategy brief. Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.

## Inputs

- `brief_id` — the strategy brief to save findings to
- `period` — current cycle, e.g. `2026-Q3`
- Optional `platform` — limit to `facebook`, `youtube`, or `tiktok`

## Procedure

### Step 1: Load brand context

Call `get_knowledge` for:
- `brand/personas` — the current audience personas (name, age range, priority tier) and their tone/value expectations. Treat this as the live source of truth for how many personas exist and what they're called — do not assume a fixed count.
- `brand/persona-<slug>` — one call per persona **currently listed in `brand/personas`**; resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`). **Never hardcode the path list** — this is a batch/research skill covering every persona in one run, so read the live roster and load whatever it lists, however many that is, so a persona added or retired needs no change here. Each carries real vocabulary to echo/avoid, channel and trust behaviour, and tone guidance specific to that persona — use this to judge whether a candidate KOL's actual audience, voice, and platform habits match a *specific* persona's documented language and channels, not just a name/age-bracket guess.
- `brand/positioning` — what Cambridge Diet Vietnam claims
- `brand/proof-points` — credibility signals the KOL should be able to reinforce

### Step 2: Discover KOLs by persona

For each persona currently listed in `brand/personas` (read the live list — however many there are), search for Vietnamese health/weight-loss influencers on each platform. Substitute `<year>` with the current year derived from `period` (e.g. `2026-Q3` → `2026`) so queries don't go stale:

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
| **Persona fit** | Which of the personas currently listed in `brand/personas` does their audience lean toward? Match on the age band and life stage each persona carries in that doc. |
| **Tone alignment** | Does their voice match Cambridge Diet VN's woman-to-woman tone? (not clinical; not pushy) |
| **Audience size** | Approximate follower/subscriber count |
| **Engagement quality** | Comments quality — real questions/testimonials vs generic |
| **Brand safety** | No medical claims that would violate NĐ-15/2018 |
| **Existing partnership conflicts** | Search for competing meal replacement brand deals |

### Step 4: Save findings

Self-rate each candidate finding before saving: `score` — an integer 1–5 for how strong/actionable this KOL candidate is (persona fit + tone alignment + audience quality) — and a one-line Vietnamese `comment` explaining that score.

**Quality gate — only score ≥4 is saved.** If a shortlisted KOL rates ≤3, drop it (never save it) and go back to Step 2 to discover a different KOL for that persona to replace it; re-score the replacement. Bound this at 2 replacement attempts per slot — if a replacement still can't clear ≥4, drop the slot entirely (save nothing for it) and note the drop in the Step 5 summary. Score honestly; never inflate a weak candidate to 4 just to pass the gate.

For each finding rated ≥4, call `save_strategy_finding`:
```
dimension: kol
brief_id: <brief_id>
title: <KOL name> — <platform> — <persona fit>
detail: <audience size, tone fit, key channel, why they match the persona>
evidence: { platform: "<fb|yt|tiktok>", url: "<profile link>", persona: "<the matching persona's label from brand/personas>", est_followers: "<N>" }
track: proven
score: <integer 4 or 5>
comment: <one-line Vietnamese rationale for the score>
```

If no KOL clears the gate this cycle, save one finding: `title: "KOL — no new discoveries this cycle"` — omit `score`/`comment` (there is nothing to rate).

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
Findings dropped (rated ≤3, no ≥4 replacement found): <N>
Findings saved: <N>
```

## Output language

**Write the finding prose in Vietnamese.** `title`, `detail`, and `comment` are persisted artifacts the Vietnamese operator reads and curates in the Strategy dashboard, so write them in Vietnamese. This applies to **every** finding you save — including the "no new discoveries" fallback (translate the English template examples shown above). The structured `evidence` values (platform, url, persona, est_followers) and the `dimension` / `track` enums stay as their literal codes; KOL names and profile URLs stay verbatim; your chat-side reasoning stays English.

## Governance

- Research + save only (`save_strategy_finding` is the only write); no content writes.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- All findings use `dimension: 'kol'` and `track: 'proven'`.
- Every candidate finding is self-rated before saving; only findings rated ≥4 are persisted via `save_strategy_finding`. A candidate rated ≤3 is dropped and replaced with a different KOL (bounded at 2 attempts per slot) — never saved, never inflated to pass.
- Requires `edit` capability.
