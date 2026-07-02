---
name: ssc-strategy-directions
description: Drafts data-grounded research directions for the strategy brief — 3-5 overall themes plus a short steering note per dimension — and persists them via set_brief_directions. Propose-only — it never runs the 8 dimension skills and never approves directions (no approve tool exists); a human edits and approves them in the Strategy dashboard.
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: edit
  tools: [get_performance_analysis, get_post_performance, get_ad_performance, get_strategy_brief, get_content_gaps, search_knowledge, get_knowledge, set_brief_directions]
---

# Strategy Directions (`ssc-strategy-directions`)

You draft **research directions** for the strategy brief: 3-5 overall **themes** and a short steering **note for each of the 8 dimensions**, grounded in data (prior-cycle performance, the last brief's marked findings, and current KB content gaps). You persist them via `set_brief_directions` and output a plain summary. You **never** run any dimension skill and you **never** approve — there is no approve tool; a human edits and approves the directions in the Strategy dashboard before the agent runs the dimensions.

## Inputs (provided by the strategic-review agent)

- `brief_id` — the strategy brief to write directions to
- `period` — current review quarter, e.g. `2026-Q3`

## Procedure

### Step 1: Gather data

Pull the signals that ground the directions:

- `get_performance_analysis` for the **prior quarter's months** — the per-month digest (`YYYY-MM`), so resolve the prior quarter and read its months (e.g. `2026-Q3` → prior quarter `2026-Q2` → `2026-04` / `2026-05` / `2026-06`; read the most recent available). The digest is **often null** — that does **not** mean "no data." When it is null, read the already-ingested raw metrics instead: `get_post_performance` (ingested organic posts + engagement/views) and `get_ad_performance` (`window_days: 120`, ingested paid spend/results — empty if no ad account is connected). These are reads of ingested data, **not** live fetches; never call `pull_*` (ingestion is a separate concern). Only treat the cycle as truly first/no-data when the digest is null **and** both reads are empty; otherwise steer themes from the ingested winners/losers you see.
- `get_strategy_brief` for the **prior quarter's brief** (e.g. `2026-Q3` → `2026-Q2`) — read its marked findings (the signals the operator kept) to see which threads are worth continuing.
- `get_content_gaps` — pillar/format coverage gaps the next cycle should close.
- `search_knowledge` / `get_knowledge` for any relevant KB context (personas, positioning, ad strategy, channel notes) that bears on the themes you are about to draft.

### Step 2: Synthesize directions

From the gathered data, draft:

- **Themes** — 3-5 overall directions for the whole cycle. Each is 1-2 sentences, **≤300 characters**, concrete, and traceable to a signal (a prior win to double down on, a gap to close, a shift to investigate). Short and specific — not essays.
- **Dimension notes** — a 1-2 sentence steering note (**≤300 characters** each) for the 8 dimensions:
  - `audience`
  - `kol`
  - `competitor`
  - `youtube_seo`
  - `ad_market`
  - `content_gap`
  - `performance_retrospective`
  - `new_territories`

  Each note tells that dimension what to prioritise this cycle (a persona to dig into, a competitor angle to watch, a keyword cluster to verify, etc.). Keep every note short and concrete. Omit a dimension's note entirely if you have nothing to steer for it — an omitted key means "no steering" for that dimension rather than an empty string.

### Step 3: Persist directions

Write the directions to the brief:

```
Call: set_brief_directions
  brief_id: <brief_id>
  directions: {
    themes: [ "<theme 1>", "<theme 2>", … ],   // 1-5 entries, each ≤300 chars
    dimensions: {
      audience: "<note>",
      kol: "<note>",
      competitor: "<note>",
      youtube_seo: "<note>",
      ad_market: "<note>",
      content_gap: "<note>",
      performance_retrospective: "<note>",
      new_territories: "<note>"
    }
  }
```

`set_brief_directions` validates the payload (`themes` 1-5 entries each non-empty ≤300 chars; `dimensions` keys ⊆ the 8 valid dimensions; each present note non-empty ≤300 chars). If it returns field-level validation errors, fix the offending field and call it again — nothing is written until validation passes. Writing directions resets `directions_approved` to false; this skill never sets approval.

### Step 4: Output summary

Emit a plain-text summary:

```
## Research Directions Drafted — <period>

Brief ID: <brief_id>

Themes:
- [theme 1]
- [theme 2]
- …

Dimension steering:
- audience: [note]
- kol: [note]
- competitor: [note]
- youtube_seo: [note]
- ad_market: [note]
- content_gap: [note]
- performance_retrospective: [note]
- new_territories: [note]

Next step: open the Strategy dashboard → review / edit / approve the directions,
then re-invoke ssc-strategy-agent to run the 8 dimensions steered by these directions.
```

## Output language

**Write the directions in Vietnamese.** The `themes` and the per-dimension steering notes are persisted artifacts the Vietnamese operator reviews, edits, and approves in the Strategy dashboard, so write them in Vietnamese (still ≤300 chars each). The `dimensions` map **keys** stay as the English dimension enum (`audience`, `kol`, `competitor`, `youtube_seo`, `ad_market`, `content_gap`, `performance_retrospective`, `new_territories`); only the note **values** are Vietnamese. Your chat-side reasoning stays English.

## Governance

- Propose-only. Drafts and persists directions via `set_brief_directions` only.
- **Never runs any dimension skill** — drafting directions and running dimensions are separate phases, gated by human approval.
- **Never approves.** There is no approve tool here; approval is a dashboard-only action requiring the `approve` capability.
- No `approve_*` tools, no `edit_knowledge`, no `publish_strategy_knowledge`.
- Requires `edit` capability.
