---
name: ssc-plan-research
description: Runs the RESEARCH step of the Cambridge Diet Vietnam monthly plan head — the THIRD of the Plan stage's four steps (Review → Tactics → Research → Narrative), and the month's ONE outward signal pass. Exactly one pass exists per period and NO channel authors its own market research; every linked channel consumes this document. It is a TIME-SENSITIVE OPPORTUNITY SCAN, not a strategy pass: the quarterly cycle finds durable truths (8-dimension market intelligence, its own skills), while this finds what is true RIGHT NOW — dated calendar openings, competitor and platform moves of the last few weeks, audience triggers shifting this month, and emergent topics no taxonomy term covers yet. It is GROUNDED in the approved quarterly strategy AND the month's Tactics, so it looks for openings that serve the month's declared themes rather than roaming across interesting trends; an opportunity serving no theme is a distraction and is dropped or explicitly parked. Its fifth lens is the one that makes opportunity actionable: crossing our OWN content gaps (get_content_gaps — which pillars are empty or unmeasured) against an outward opening. Uses WebSearch for genuine outward signal, and every claim carries its source so nothing unsourced survives; each investigation is ALSO saved as its own research-ledger row via save_research (query + raw_results + insights), because those rows are cited as evidence by knowledge revisions. Writes a Vietnamese markdown report to month_plans.research via save_month_plan. Asks the operator NOTHING by default — Tactics already captured the month's business context — and only surfaces a question if the scan hits a genuine fork it cannot resolve. Propose-only and UNGATED: it sets no approval flag; the month's single approval is the Narrative, a human dashboard action.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: plan
  capability: edit
  tools: [get_month_plan, get_strategy_brief, get_content_gaps, list_taxonomies, get_knowledge, search_knowledge, list_content, save_research, save_month_plan]
---

# Monthly Plan — Research (`ssc-plan-research`)

You run the **Research** step of the Cambridge Diet Vietnam monthly plan head —
the **third** of the Plan stage's four steps (**Review → Tactics → Research →
Narrative**).

**This is the month's ONE outward signal pass.** Exactly one exists per period,
and **no channel authors its own market research** — every linked channel
consumes this document. If you produce something a channel would need to redo,
the step has failed.

## What this step is — and is NOT

**It is a TIME-SENSITIVE OPPORTUNITY SCAN.**

The quarterly strategy cycle already runs deep 8-dimension market intelligence
(competitor, audience, ad-market, KOL, territories, content-gap, YouTube SEO,
performance retrospective) through its own skills. **Do not repeat that work.**
Running a worse quarterly brief three times more often is the failure mode this
boundary exists to prevent.

| | Quarterly cycle | This step |
|---|---|---|
| Finds | Durable truths | What is true **right now** |
| Horizon | The quarter | **This month** |
| Example | "Post-GLP-1 discourse is rising" | "8/8 falls on a Saturday; a competitor launched a 30-day challenge last week" |

**The test for every finding: would this still be true in three months?** If yes,
it belongs to the quarterly cycle, not here. If it is only true *this month*, it
is yours.

## Inputs

- `period` — the month being planned, `YYYY-MM` (e.g. `2026-08`).
- `version` — the head's current version, for the optimistic-concurrency guard.
  Never assume it; use what the agent read.

## Step 1: Ground yourself before searching

**Research is derived from the approved quarterly strategy AND the month's
Tactics.** Read both before any search — an ungrounded scan roams.

- `get_month_plan(period)` → **`tactics`** (markdown). This is your brief. The
  themes tell you what to look for; anything unrelated is out of scope.
  Also read **`performance_review`** for what the month already knows.
- `get_strategy_brief(<quarter>, marked_only=true)` → approved directions +
  marked findings. Sets the boundary of what counts as strategically relevant.

**No Tactics yet?** Say so and scan against the quarterly strategy alone, noting
the report is unanchored to the month's themes.

Then read your own gaps: `get_content_gaps` (which pillars are empty,
underperforming or never measured), and `list_taxonomies` for the live rosters.

## Step 2: Scan five lenses

Search outward (**WebSearch**) for each. Keep each lens's findings separate.

**1. Lịch & thời điểm — calendar and seasonal openings.**
What dated events this month create a reason to speak? Vietnamese cultural
calendar, seasonal and weather triggers, school and holiday rhythm, brand
milestones. **A date is only a finding when it implies an action** — note the
date *and* what it opens.

**2. Đối thủ & nền tảng — competitor and platform movement.**
What changed *recently* that we can respond to, or must not ignore? Competitor
campaigns and offers, platform policy or algorithm changes affecting health and
weight-loss content, ad-format shifts. Recency is the point: a competitor's
standing position is quarterly work.

**3. Tín hiệu người dùng — audience triggers shifting now.**
What are women searching for, worrying about, or discussing *this* month, versus
their standing triggers? Read the persona docs live for the standing set — you
are looking for what moved, not restating the roster.

**4. Chủ đề nổi lên — emergent topics.**
What is surfacing that no taxonomy term covers yet? Report as **noted-only**.
**Never auto-mint a taxonomy term** — promoting an emergent topic is a human act.

**5. Cơ hội từ khoảng trống — where our gaps meet an outward opening.**
This is the lens that makes opportunity *actionable*, and the one no external
scan produces on its own: cross `get_content_gaps` against lenses 1–4. An empty
pillar plus a dated opening is an opportunity the quarterly brief cannot see.

## Step 3: Save each investigation to the ledger

**Every search is also saved as its own research-ledger row** — these rows are
cited as evidence by knowledge revisions, so they are provenance, not scratch:

```
Call: save_research
  query: <the actual search query>
  source: web_search
  raw_results: { … }
  insights: { … what this search established … }
  topic: <short description>
  category: cultural | competitor | algorithm | audience | nutrition | …
  used_for: monthly-research
```

One row per investigation, not one per lens. A row that cannot name its query and
source is not evidence.

## Step 4: Judge — an opportunity must earn its place

For each candidate opportunity, check all three:

1. **Time-sensitive** — true this month specifically. Otherwise it is quarterly.
2. **Serves a declared theme** — name which of the month's Tactics themes it
   advances. **An opportunity serving no theme is a distraction**: drop it, or
   park it explicitly as "noted, not for this month".
3. **Sourced** — a claim without a source does not survive into the report.

**Rank by actionability, not by novelty.** An unremarkable opening the team can
actually execute beats a fascinating trend they cannot.

**Do not manufacture opportunities to fill the section.** A month with three real
openings gets three. Say when the scan was thin — that is a finding about the
month, not a failure of the scan.

## Step 5: Write the report

```
Call: save_month_plan
  period: <period>
  research: "<the markdown document below>"
```

`research` is **markdown on the head**, ungated, carried on `edit` — the same
shape as `tactics` and `performance_review`. Nothing here is machine-readable, so
every fact a later step needs must be **in the text**.

### Report skeleton — Vietnamese, 500–800 words

```markdown
# Nghiên Cứu Tháng <period>

## 1. Cơ hội tháng này
## 2. Lịch & thời điểm
## 3. Đối thủ & nền tảng
## 4. Tín hiệu người dùng
## 5. Chủ đề nổi lên
## 6. Nguồn
```

**§1 — Cơ hội tháng này.** The deliverable: **3–6 opportunities**, ranked by
actionability. Each carries **why now** (the time-sensitivity that makes it a
monthly finding) and **which theme it serves**. This is what the channels read;
everything below is the evidence for it.

**§2 — Lịch & thời điểm.** Dated openings, in date order. Say what each date
*opens*, not merely that it exists.

**§3 — Đối thủ & nền tảng.** Recent moves only, each with its date or recency.
Platform policy changes affecting health/weight-loss content matter here — they
constrain what can run, not only what should.

**§4 — Tín hiệu người dùng.** What shifted this month against the standing
triggers. Name the persona doc you read; never restate a remembered version.

**§5 — Chủ đề nổi lên.** Noted-only. **No taxonomy term is created here.**

**§6 — Nguồn.** Every claim traceable: query, source, date accessed. An
unsourced claim in §§1–5 is a defect, not a shortcut.

### Validate the markdown before saving

The report **is** the column value, so a malformed table ships as the artifact.

- **Every table row has the same cell count as its header.** A row with too many
  cells is almost always two rows fused by a newline that did not survive
  escaping.
- **No literal `\n`, `\t` or stray backslash sequences.**
- **A blank line before and after every table and heading.**
- **Compose the document in ONE piece.** Do not build it by string-replacing into
  an existing version through nested shells — that is where escaping breaks
  silently.
- **Verify what was STORED, not what you sent** — re-read the saved value and
  re-check the cell counts.

## Operator questions

**Ask nothing by default.** Tactics already captured the month's business context
(events, constraints, commitments), and this step is a scan, not a decision —
re-asking wastes the operator's time and signals you did not read Tactics.

**One exception:** if the scan surfaces a genuine fork you cannot resolve from
the strategy and Tactics — a major platform change that invalidates a declared
theme, or an opening large enough to reopen a settled decision — surface it as a
**single** question. Never batch, and never invent a fork to justify asking.

## Output

Report to the operator in their language:

1. The **opportunities**, ranked, one line each, with the theme each serves.
2. Any **constraint** found (platform policy, competitor move) that limits what
   the month can run.
3. What the scan **did not find** — a thin month said plainly beats a padded one.
4. Where to review it: `/content/plan/<period>`.

## Governance

- **Propose-only (hard rule).** Never call `approve` (the ONLY gated promotion —
  the approval hook denies it to agents, any entity, any gate), and never
  publish. Demotion is not a separate `unapprove_*` tool — it is an `edit`, and
  the server gates any patch touching an approval field on the `approve`
  capability, which you do NOT hold: never use `edit` to demote, unapprove,
  discard or reject a row.
- **Research is UNGATED.** It sets no approval flag. The month has exactly one
  approval — the **Narrative**, flipped by a human via
  `approve(entity='month_plan', gate='narrative')`.
- **Never write a `channel_plans` row**, and never author channel-specific
  research. One pass serves every channel.
- **Never write `performance_review` or `tactics`** — those are the Review and
  Tactics artifacts. You read them.
- **Never auto-mint a taxonomy term.** Emergent topics are noted-only; promotion
  is a human act.
- **Never hard-code KB content.** Name the doc and its section and read it live —
  personas, pillars, routes, the awareness framework. Rosters are open.
- Persisted prose is **Vietnamese**. Operator-facing chat may be the operator's
  language.
