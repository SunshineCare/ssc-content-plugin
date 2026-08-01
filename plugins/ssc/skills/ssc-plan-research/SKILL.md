---
name: ssc-plan-research
description: Runs the RESEARCH step of the Cambridge Diet Vietnam monthly plan head — the THIRD of the Plan stage's four steps (Review → Tactics → Research → Narrative), and the month's ONE outward signal pass. Exactly one pass exists per period and NO channel authors its own market research; every linked channel consumes this document. It is a TIME-SENSITIVE OPPORTUNITY SCAN, not a strategy pass: the quarterly cycle finds durable truths (8-dimension market intelligence, its own skills), while this finds what is true RIGHT NOW — dated calendar openings, competitor and platform moves of the last few weeks, audience triggers shifting this month, and emergent topics no taxonomy term covers yet. It is GROUNDED in the approved quarterly strategy AND the month's Tactics, so it looks for openings that serve the month's declared themes rather than roaming across interesting trends; an opportunity serving no theme is a distraction and is dropped or explicitly parked. Its fifth lens is the one that makes opportunity actionable: crossing our OWN content gaps (get_content_gaps — which pillars are empty or unmeasured) against an outward opening. Uses WebSearch for genuine outward signal, and every claim carries its source so nothing unsourced survives — there is NO research ledger (the research table, save_research and knowledge_versions.evidence_research_id were all removed when the head moved to a markdown research column), so the report's source section IS the provenance and an unsourced claim is a defect. ALSO SURFACES THE INHERITED MARKET-SOPHISTICATION READ — sophisticationStage + sophisticationRead, read off the linked quarterly strategy brief via get_strategy_brief and carried into the report VERBATIM as §0, the one section that is not a finding of this scan. The month INHERITS this read and NEVER authors one: the skill holds no save_strategy_brief, derives no stage, and re-derives nothing monthly (that would churn the very thing the quarter stabilises). An absent read is an explicit null on the read surface and is reported plainly as a gap — never guessed, never defaulted, never inferred from the scan's own findings — and the scan continues regardless. Writes a Vietnamese markdown report to month_plans.research via save_month_plan. Asks the operator NOTHING by default — Tactics already captured the month's business context — and only surfaces a question if the scan hits a genuine fork it cannot resolve. Propose-only and UNGATED: it sets no approval flag; the month's single approval is the Narrative, a human dashboard action.
metadata:
  type: skill
  stage: monthly-plan
  brand: cambridge-diet-vn
  section: plan
  capability: edit
  tools: [get_month_plan, get_strategy_brief, get_content_gaps, list_taxonomies, get_knowledge, search_knowledge, list_content, save_month_plan]
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

### Step 1b: Carry down the quarter's market-sophistication read

The same `get_strategy_brief` call returns, on the `brief`, the quarter's
**market-sophistication read**:

- **`sophisticationStage`** — the stage as a label, free text. **There is no fixed
  vocabulary**, so take whatever label the quarter wrote and carry it **verbatim**.
  Never normalise it, never map it onto a ladder of your own, never abbreviate it.
- **`sophisticationRead`** — the reasoning: what the market has already heard, and
  therefore **how indirect a lead now has to be**.

**The month INHERITS this; it does not author it.** The read is written once, on
the quarterly brief, precisely so it does not churn month to month. You hold no
`save_strategy_brief`, you never derive a stage, and you never "update" the read
from what this month's scan happened to turn up. If your scan genuinely
contradicts the quarter's read, that is a **finding for the quarterly cycle** —
report it as such in §3 and leave §0 exactly as the quarter wrote it.

**An absent read is a GAP, reported plainly.** Both fields come back as an
explicit `null` when the quarter recorded none — that is a readable fact, not a
failed read. Then §0 says so in one line, the summary says so, and the scan
**continues**. Never guess a stage, never carry one over from a previous quarter,
never infer one from a competitor's positioning, and never leave the section out
(an omitted section is indistinguishable from an unread one).

**Who consumes it.** The ads channel reads this to judge **how indirect a lead
must be** — it is the reason a bare benefit claim can be dead on arrival in a
claim-saturated market. Carrying it here is what lets the channel read one
inherited read rather than deriving four conflicting ones.

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

**Search the INTERNATIONAL brand name, not only the local one.** The programme
trades internationally as **"The 1:1 Diet by Cambridge Weight Plan"**; the local
"Cambridge Diet" returns almost nothing usable. Searching the international name
opens the clinical literature — the DROPLET trial, cost-effectiveness analyses,
NHS/NICE total-diet-replacement (TDR) reviews — and the published competitor
comparisons. A scan that reports "no comparison material exists" after searching
only the local name has found a **naming** gap, not a market one. **Always try
both names**, and name which one produced each finding.

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

## Step 3: Carry provenance in the report itself

**There is no research ledger.** The `research` table, the `save_research` tool
and `knowledge_versions.evidence_research_id` were all removed when the head
moved to a markdown `research` column — verified against the deployed server.
**Never call `save_research`.** It does not exist, and referencing a removed
server tool is a recurring shipped-bug class in this repo.

So **the report is the only record of where a claim came from.** §6 is not a
courtesy — it is the provenance that used to live in its own table, and it is the
only thing standing between a sourced finding and an assertion.

For every search you run, hold:

- the **query** you actually issued,
- the **source** (publisher/domain, not just "the web"),
- the **date accessed**,
- and **what that search established** — one clause.

Carry all of it into §6. A claim in §§1–5 whose source is not in §6 is a defect:
remove the claim or add the source.

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

## 0. Kế thừa từ quý — mức độ tinh vi thị trường
## 1. Cơ hội tháng này
## 2. Lịch & thời điểm
## 3. Đối thủ & nền tảng
## 4. Tín hiệu người dùng
## 5. Chủ đề nổi lên
## 6. Nguồn
```

**§0 — Kế thừa từ quý.** The quarter's market-sophistication read, carried down
**verbatim** (Step 1b): the stage label as written, then the read itself. **It is
numbered 0 because it is not a finding of this scan** — nothing here was
discovered this month, and nothing in §§1–5 may revise it.

- Name the quarter it came from (`<quarter>`), so a reader can tell a fresh read
  from one inherited across a quarter boundary.
- **Recorded read:** one line for the stage, then the read's own words.
- **No read recorded:** the section stays and says exactly that —
  `Quý <quarter> chưa ghi nhận mức độ tinh vi thị trường. Không suy đoán. Kênh Ads
  sẽ báo thiếu khi chọn lead type.` Then continue. **Never fill it in.**
- Add **one line** on what it constrains — how indirect a lead must be — in the
  quarter's terms, not in a mapping you invent.
- Source it in §6 like anything else, as a **Brand OS read**: name the tool
  (`get_strategy_brief(<quarter>)`), not a web source. Record the row whether the
  read was present or `null` — "we looked and the quarter had none" is provenance.

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

**§6 — Nguồn.** **This is the only provenance that exists** — there is no ledger
behind it. A table, one row per claim group:

| Nội dung | Nguồn | Ngày truy cập |
|---|---|---|

Name the **publisher or domain**, never just "web search". Where a claim came
from a Brand OS read rather than the web, say which tool. An unsourced claim in
§§1–5 is a defect, not a shortcut.

**Close §6 with what the scan did NOT find.** A lens that returned nothing is a
finding about the month — say "no competitor moves found in the last 30 days"
rather than omitting the lens, so a reader can tell an empty lens from an unrun
one.

**Dates and weekdays are claims too.** A festival date or which weekday a
milestone falls on changes what can be scheduled — verify it rather than
recalling it, and source it like anything else.

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

1. The **inherited sophistication read**, first and in one line —
   `Mức độ tinh vi (kế thừa từ <quarter>): <stage đúng như quý đã ghi>` or
   `CHƯA CÓ — quý <quarter> không ghi nhận; không suy đoán`. Say plainly that it
   is inherited, not authored here, so nobody reads it as a finding of this scan.
2. The **opportunities**, ranked, one line each, with the theme each serves.
3. Any **constraint** found (platform policy, competitor move) that limits what
   the month can run.
4. What the scan **did not find** — a thin month said plainly beats a padded one.
5. Where to review it: `/content/plan/<period>`.

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
- **Never write the hand-downs.** `proof_inventory` and `offer_state` are the
  Tactics step's artifacts. You may read them off `get_month_plan`
  (`proofInventory` / `offerState`, explicit `null` when unstated) for context,
  and you never state, extend or "correct" either — in particular, an opening you
  found is **not** a promotion, and only a real dated promotion recorded by
  Tactics is one.
- **Never author the market-sophistication read (hard rule).** It is the
  **quarter's**, authored once on the strategy brief and **inherited** here. You
  hold no `save_strategy_brief`, you never derive or normalise a stage, and you
  never revise the read from this month's findings. A `null` read is reported as a
  gap and the scan continues — the gap is never filled, and no stage is ever
  invented, carried over from a prior quarter, or inferred from the scan.
- **Never auto-mint a taxonomy term.** Emergent topics are noted-only; promotion
  is a human act.
- **Write through `save_month_plan`, never around it.** The MCP tool is the only
  supported write path: it carries the capability check, the audit trail and the
  optimistic-concurrency guard. Never write the column by any other route, even
  when a tool schema looks stale or a document seems large — a write that skips
  those guards can look correct and still be unsafe. If the tool genuinely
  refuses, report that and stop rather than routing around it.
- **Never call a tool that is not on the live surface.** `save_research` was
  removed with the research table; referencing a renamed or deleted server tool
  is a recurring shipped-bug class here. When a tool you expect is missing,
  verify against the deployed server before assuming it is a transient gap.
- **Never hard-code KB content.** Name the doc and its section and read it live —
  personas, pillars, routes, the awareness framework. Rosters are open: a term
  added or retired, including a new proof device, needs no change to this skill,
  so no roster is ever enumerated in this file or in the report.
- **A FAILED KB READ STOPS THE RUN.** If a KB doc you named comes back missing,
  empty or unreadable, STOP, write NOTHING, and tell the operator:

  > Không đọc được tài liệu KB `<path>`. Research dừng lại — bước này không chạy
  > bằng bản ghi nhớ. Vui lòng kiểm tra tài liệu trong Knowledge dashboard rồi
  > chạy lại. Chưa ghi gì cả.

  Never substitute a remembered version. A `null` sophistication read is **not**
  this case — it is a recorded absence, reported as a gap while the scan continues.
- Persisted prose is **Vietnamese**. Operator-facing chat may be the operator's
  language.
