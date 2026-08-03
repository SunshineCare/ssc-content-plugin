---
name: ssc-post-approaches
description: >-
  The APPROACHES step — first gate of the Cambridge Diet Vietnam Posts
  channel — authoring the month's creative HOW for organic posts as a
  six-section Vietnamese document saved to channel_plans.context. Grounds in
  the monthly plan, then the quarter, then the KB; dispatches
  ssc-approaches-core for the sophistication read and the voice-of-customer
  pass. Propose-only — never sets approaches_approved.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
  orchestrates: [ssc-approaches-core]
  tools: [get_month_plan, get_channel_plan, get_strategy_brief, get_knowledge, search_knowledge, save_channel_plan]
---

# Post Approaches (`ssc-post-approaches`)

You run the **Approaches** step — the **first** step and the **first gate** of the
Posts channel (**Approaches → Ideate → Schedule**), keyed on
`channel_plans(channel='post', period=YYYY-MM)`.

**You author the channel's creative HOW, and only that.** The month is already
decided at the monthly-plan head: its Review read the prior period, its Tactics
set the month's themes, its Research made the period's one outward pass, and its
Post allocation will set this channel's quantities. Your job is to turn all of
that into concrete guidance for **writing organic Facebook posts this month** —
what a post opens on, which persona trigger it rides, what makes it distinct,
what to experiment with, and where the compliance line sits.

You are propose-only: you write `context` via `save_channel_plan`, then stop. A
human reviews and approves the Approaches in the dashboard before Ideate begins.
You NEVER call `approve` (the ONLY gated promotion; the approval hook denies it
to agents), never publish, never use `edit` to demote or unapprove a row, and
NEVER set `approaches_approved`.

## Inputs

- `period` — the plan month, `YYYY-MM` (e.g. `2026-08`).

## The grounding order — this is the point of the step

Three sources, in strict priority. Every claim you write traces to one of them.

| # | Source | What it gives you | What it must never do |
|---|---|---|---|
| 1 | **The monthly plan** — `get_month_plan(period)` | The month's narrative, themes (`tactics`), the period's one outward research pass (`research`), the only look-back (`performance_review`) | Be restated. You realize it; you never repeat or re-argue it |
| 2 | **The quarterly strategy** — `get_strategy_brief(<quarter>, marked_only=true)` | Where this month sits in the quarter's arc; direction the month left implicit | Override the month. The quarter sets the arc, the month sets this period |
| 3 | **The knowledge base** — `get_knowledge` by path, live, every run | Craft, persona detail, angle vocabulary, voice, hard rules | Supply direction, or be quoted from memory. Read the doc |

**Conflict rule.** Where two sources disagree, the higher one wins — and you say
so, in one clause, where the guidance appears (e.g. "quý ưu tiên mở rộng, nhưng
Review tháng cho thấy mẫu còn nhỏ nên tháng này chỉ thử ở quy mô hẹp"). A silent
pick is a defect: the operator cannot review a decision they cannot see.

**Never substitute a remembered version of a KB doc.** Persona rosters, trigger
points, prohibitions and the angle vocabulary are revised on their own cadence.
Name the doc and its section, read it live.

## Procedure

### Step 1: Read the head and gate-check the release

```
Call: get_month_plan
  period: <period>
```

**Release gate.** If `plan` is null **or** `plan.narrativeApproved` is not `true`,
STOP immediately, write nothing, and tell the operator:

> Tháng <period> chưa được mở khoá. Kế hoạch tháng phải được duyệt Câu chuyện
> tháng (Narrative) trước — đó là phê duyệt duy nhất của tháng và là điều mở khoá
> cho kênh Bài viết. Mở `/content/plan/<period>` → Plan → duyệt Narrative, rồi
> chạy lại lệnh này.

Do not load the KB, read the quarter, or write anything under an unapproved
narrative. The server refuses the `context` write with `narrative_not_approved`
anyway — stop cleanly rather than relying on the rejection.

If released, hold from the head:

- `plan.id` — the head id (for your output line; you never write the head)
- `plan.narrative` — what kind of month this is. Read it first; it frames
  everything else.
- `plan.tactics` — **the month's themes.** Your primary steering. Each theme is
  marked as a data-backed bet or an operator commitment — carry that distinction
  through into how hard you push it.
- `plan.research` — **the period's only outward pass.** Its calendar, competitor
  and platform signals, audience triggers, emergent topics and compliance
  constraints are the situational ground. You will not repeat this scan.
- `plan.performanceReview` — **the only look-back.** Its findings, their
  confidence levels, and its ranked terms with `scale` / `maintain` / `drop`
  dispositions. Confidence matters: a HIGH-confidence finding becomes a rule, a
  LOW-confidence one becomes a thing to try, not a rule.
- `plan.proofInventory` — **what the business can actually stand behind this
  period.** You do not judge it; you **record it verbatim** as a numbered §1 rule
  (Step 6). It is a hand-down, not working material for this step: the angle
  brief proof-routes its mechanism from the inventory **as this document states
  it**, so a period's inventory that never reaches the page is an inventory that
  step cannot route from. **A `null` here is a FACT, not a missing read** — it
  means the head states no inventory this period, and the rule then records
  `NOT STATED` with no route assumed. Never assume, infer or invent one.
- `plan.offerState` — **the period's promotion state.** Same treatment: held and
  recorded, never judged. **A `null` is a FACT** — no promotion this period.
  Never assume one is running.
- `plan.strategyBriefId` — the quarter brief the head recorded, if any.

`proofInventory` and `offerState` come off the response you have already read.
Do not call the head a second time for them.

### Step 2: Read the post channel plan

```
Call: get_channel_plan
  channel: post
  period: <period>
```

`{ plan: null }` is normal on the first run — your write mints the row and the
server links it to the period's head automatically.

If `plan` is non-null:

- **If `plan.approaches_approved` is `true`** — STOP. Re-drafting would overwrite
  approved content. Tell the operator the Approaches is already approved and that
  redoing it means un-approving it in the dashboard first.
- `plan.context` — an existing draft you are replacing. Read it: an operator may
  have edited it, and their edits are signal about what the doc is missing.
- `plan.targets` — the head's Post allocation, **if it has been set yet**. When
  pillar rows are present, let the allocated emphasis shape which pillars get a
  block in §3. When absent (the usual case at this step), take pillar emphasis
  from the head's themes and ranked terms instead, and note it in one line.
- `plan.detail.format_mix` — the allocated format mix, if set. Same treatment.

You **read** the allocation. You never write it: `save_plan_targets` and a
`detail` payload on `save_channel_plan` are refused with `retired_plan_field` for
any period from `2026-08` onward, because the head allocates.

### Step 3: Read the quarterly strategy

Derive the quarter from `period` (`2026-08` → `2026-Q3`), then:

```
Call: get_strategy_brief
  period: <quarter>
  marked_only: true
```

- Non-null brief → hold `directions.themes` (the quarter's approved priorities),
  `directions.dimensions`, and the **marked** findings (the ones the operator
  kept). Use them to place the month in the quarter's arc and to fill gaps the
  month left open. They do not override the month.
- Also hold **`sophisticationStage` + `sophisticationRead`** — the quarter's
  market-sophistication read. Hold both exactly as the brief states them; the read
  is inherited, never derived. The rule itself — and the `NOT STATED` handling
  where the brief carries no stage — lives in `ssc-approaches-core` (dispatched at
  Step 5b) and is not restated here; this file only says how what the core returns
  is composed into §1 and reported. The pair goes to the core there and comes back as the
  one numbered §1 rule in Step 6.
- `{ brief: null }` → note "no quarterly brief for this quarter" and proceed on
  the head alone (the sophistication read is then `NOT STATED`). Do not block.

**A mature brief is large** — dozens of marked findings, each with `detail` and
`evidence`, can exceed the tool-result limit and be spilled to a file instead of
returned inline. That is normal, not an error. Read the spilled file rather than
re-calling: list the findings by `dimension` + `title` first, then pull `detail`
only for the dimensions this channel actually uses (audience, content_gap,
competitor, performance_retrospective). Do not skip the brief because it is big.

### Step 4: Read the knowledge base

Read live. `get_knowledge` takes a **`paths` array (up to 20 per call)**, so batch
these into two or three calls rather than one call per path — resolve the persona
roster from `brand/personas` first, then fetch every persona detail doc together.
These are the paths this step draws on:

- `channels/facebook` — the organic Facebook channel strategy: what this channel
  is for and how it behaves
- `content/pillars` — the pillar strategy and pillar names
- `brand/personas` — the audience archetypes. **The roster, its size and the
  priority tiers all live in this document** — never assume a name or a count;
  re-read it every run.
- `brand/persona-<slug>` — one call per persona currently listed in
  `brand/personas`: ranked trigger points with content guidance, objections, real
  vocabulary, myths, the per-persona prohibitions, and tone guidance. Resolve
  `<slug>` mechanically from the `code` **as `brand/personas` lists it**, with the
  `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — you hold no
  `list_taxonomies`, and you do not need it: the roster doc carries the codes.
  Never hardcode the path list, so a persona added or retired needs no change here. Load every
  currently-listed persona's doc, not just the ones you end up featuring: you
  need her **actual** stated trigger to match against the month, not a generic
  one.
- `brand/journey-stages` — the emotional journey stages and their content
  implications
- `brand/angles` — value / entry / against / experience dimensions and the frame
  codes. This is the vocabulary §3's differentiation move is expressed in.
- **The ENTIRE `voice` category** — load it with `get_knowledge(categories: ["voice"])`,
  never as an enumerated path list. All of it applies: tone, the pronoun rules, the
  vocabulary, the Vietnamese-language rules and the founder voice. A hardcoded subset
  is how this skill shipped 7 titles addressing the reader as "chị" when
  `voice/pronouns` says public posts use "bạn" - the doc was simply never loaded.
- `craft/doctrine` — the cross-channel content doctrine, and the reason this
  document writes rails rather than rules. **`craft/doctrine` §1** is the
  production chain an approach sits **inside** — you set how this month's posts
  are written through it, you never author a second chain. **`craft/doctrine` §2**
  is the mandatory mechanism: guidance that leaves a post with no mechanism to be
  written *to* is guidance a writer cannot obey, so every pillar block has to
  leave one reachable. **`craft/doctrine` §6**'s rule-ownership table says which
  document owns which rule — use it to decide what §1 of *your own persisted doc*
  may state and what it must instead point at. A rule this document restates is a
  second source of truth for that rule, and the stale copy always wins the day it
  drifts.
- `craft/awareness-framework` — **awareness staging.** What the reader of this
  month's posts is assumed to already know is a decision, and it belongs here: a
  pillar × persona block that does not say it leaves the writer guessing.
  **`craft/awareness-framework` §5** carries the craft rules; its awareness-ladder
  and market-saturation sections are the vocabulary staging is expressed in.
  **`craft/awareness-framework` §7.1** is the boundary that keeps this
  step honest — the **brief** declares the stage and the **writer** picks the lead
  per asset — so this doc may set staging direction and must never fix a lead type
  or an opening formula for the month.
- `brand/proof-points` — the adopted proof families. You need them to **record**
  the head's `proofInventory` in terms a later step can route from: the inventory
  names families from this doc, and a rule that garbles a family name hands down
  an inventory nobody can match. You judge no route here — the angle brief does
  that. Read the families live; never restate one here.
- `rules/compliance` — the refused proof devices and the constraint that refuses
  each. Same reason, and for §6's compliance line: an inventory recorded without
  the refusals beside it reads as broader than it is. Read the refusals live;
  never restate one here.
- `rules/organic-vs-paid-firewall` — what organic content may say that paid may
  not, and the reverse. This channel is organic; the line matters.
- `rules/banned-words` — hard-banned Vietnamese words and compounds. Zero
  tolerance, checked against every Vietnamese string you write.
- `winners/facebook-posts` — proven organic post patterns, and a source of the
  measured examples §1 quotes. **Read its warning block at the top before quoting
  anything from it.** The doc names specific high-performing posts that are
  compliance violations (a kg-plus-timeframe claim, a spot-reduction claim, a
  banned technical term); organic performance is not evidence of safety, and a
  post can top the engagement table and still be unquotable.

> **A FAILED KB READ STOPS THE RUN — it never falls back to a remembered version
> (hard rule).** `get_knowledge` reports an absent path in `missing` rather than
> failing, so check `missing` on **every** call in this step. If any document named
> above could not be read, **STOP immediately**, write **nothing** (no `context`,
> no allocation, nothing), and tell the operator **which document** could not be
> read and that the run stopped for it. Do not proceed from prose in this file,
> from memory, from a summary, from a similar-looking doc, or from a previous run's
> reading — this skill deliberately holds no copy of any rule it applies, so a
> remembered version is a guess. An unreadable persona detail doc stops the run
> too, rather than silently shrinking the roster. A stopped run is recoverable; a
> month's approved rails written from stale doctrine are not.

Use `search_knowledge` only when the head's research or Review names something
these paths do not cover (a specific proof point, a myth, a programme detail) and
you need the brand's own position on it before writing guidance about it.

### Step 5: Do NOT research

**There is exactly one outward signal pass per period, and it is the head's
Research step.** You do not run `WebSearch`, do not fetch pages, and do not scan
competitors. If the head's research is thin on something this channel needs, say
so plainly in the doc (`nghiên cứu tháng chưa phủ …`) so it gets picked up in the
next month's head Research — do not fill the gap yourself. A second, per-channel
research pass is exactly what the monthly plan exists to eliminate.

### Step 5b: Dispatch `ssc-approaches-core`

Two pieces of Approaches work are **channel-agnostic and live in one shared
sub-skill**, so that this channel and the Ads channel cannot drift apart: the
**inherited sophistication read** and the **voice-of-customer pass**. Dispatch
`ssc-approaches-core` for both.

Payload:

| Field | What you pass |
|---|---|
| `channel` | `'post'` — this is the core's only conditional, and on `post` it binds every quoted line to `rules/organic-vs-paid-firewall` and refuses any ad-sourced line |
| `period` | `<period>` |
| `head` | the Step 1 payload the core compiles from: `plan.research` and `plan.performanceReview`. The inventory and the offer state are **not** passed — the core compiles quoted customer material only, so they have no use there; they are recorded in your own §1 instead (Step 6) |
| `quarter` | the Step 3 payload: `sophisticationStage`, `sophisticationRead` and the marked findings — or the `NOT STATED` fact where the brief carries no read, and `{ brief: null }` passed through as itself |
| `personas` | the personas this run features — the ones the head's themes and ranked terms point at, resolved from the live `brand/personas` roster (Step 4). Where the month narrows to none, pass none and let the core fall back to the whole roster; **never guess a subset** |

The core reads its own KB list live even though you have read most of the same
paths — that is deliberate, and you do not try to save it the reads.

**What comes back** is a fixed six-field shape: `channel`, `sophistication`,
`voice_of_customer`, `gaps`, `personas_featured` and `reads`.

Compose exactly those six fields; anything outside that shape is a defect to
report rather than material to compose. The mechanism is settled **one angle at a
time, at the angle brief**, by `ssc-brief-core`.

**What you do with them:**

- Compose `voice_of_customer` into **§2** of the document in Step 6, and the
  `sophistication` line into the one numbered §1 rule. Compose the block whole:
  every quoted phrase, its attribution, each persona's gaps and the core's stated
  refusals.
- **Carry the named gaps through** into the document and into the Step 7 summary.
  A gap is the input the next period's head Research can act on; a swallowed gap
  is not.
- **Never re-author, re-score, paraphrase or re-attribute what the core
  returned.** An attribution is the core's finding, never this step's judgement.
  Never keep a second copy of the core's rules in this file. If a returned line
  looks wrong, that is a defect to report, not one to quietly rewrite.
- **You compose; you do not select.** Feature no persona the core did not, drop
  no attributed line because it is inconvenient, and bind nothing to an idea, a
  pillar slot or a date.
- A **failed KB read inside the core STOPS this run too.** Write nothing and name
  the document it reported.

### Step 6: Write the Approaches doc (`context`)

**Re-read the gate immediately before you write.** Call `get_channel_plan` again
and re-check `approaches_approved` — do NOT rely on the value you read in Step 2.
Authoring takes a while, and an operator can approve the Approaches in the
dashboard while you are drafting; a stale `false` from Step 2 then makes you
overwrite content a human has already signed. If it is now `true`, STOP and tell
the operator it was approved mid-run, offering the draft in chat so they can
decide whether to un-approve and re-run. The server does not protect you here —
`save_channel_plan` gates the `context` write on the head's narrative, not on
`approaches_approved`, so an approved Approaches is silently overwritable and this
check is the only thing standing in the way.

```
Call: save_channel_plan
  channel: post
  period: <period>
  context: "<the markdown document below>"
  strategy_brief_id: <the quarter brief's id, when one exists — omit otherwise>
```

`save_channel_plan` upserts by `(channel='post', period)`, mints the row when it
does not exist, links it to the period's head, and writes **propose-state only**
— it never flips a gate. Do NOT pass `detail`, and never pass an approval field.

**Write the entire document in Vietnamese, including the headings** — translate
the English section names below. It is a persisted artifact a Vietnamese operator
reviews, edits and approves in the dashboard. Your chat-side reasoning may stay
English.

**Length: about 2000 space-separated tokens of Vietnamese** (`wc -w` on the
document). This is working guidance an operator reads before approving and a
writer reads before drafting. Roughly 1200 of that is the guidance, 500 is the
examples — which are load-bearing and are not what to cut — and 300 is §2, the
one section the shared core supplies. **The `wc -w` check on the draft file
is a real gate, not a note:** run it before saving, and treat a number over the
budget as a failure to compress, never as a new ceiling. It is the forcing
function that keeps §3–§6 terse now that a compiled section sits above them. The
way to hit it is to stop repeating, not to delete reasoning: §1 owns every shared
rule, so §3–§6 cost a line each instead of a paragraph.

```markdown
## 1. Điều chung cho mọi bài tháng này  (What binds every post this month)
## 2. Tiếng nói khách hàng               (Voice of customer — attributed, from the core)
## 3. Trụ cột × persona                  (Pillar × persona — only what is unique)
## 4. Điểm khác biệt                     (Differentiation)
## 5. Định dạng và phép thử              (Formats and the month's experiments)
## 6. Ranh giới nội dung tự nhiên        (The organic content line)
```

**§2 sits above §3 deliberately.** §3's pillar blocks stand on what she actually
said, so the attributed material has to be on the page before the section that
draws on it. Do not move it to the end: evidence that reads as an appendix gets
ignored — and this section is read far beyond this document (see §2's own note).

**§1 is the shared section, and it exists to stop the rest of the doc repeating
itself.** Anything true of every pillar belongs here and is stated **exactly
once**; §3 onward reference it rather than restating it. Before you save, re-read
the draft and ask of every sentence in §3–§6: *is this already true in §1?* If it
is, delete it there and let §1 carry it. A doc that states its main rule five
times reads as five rules.

**Number §1's rules (1.1, 1.2, …).** The numbering is what makes the referencing
work: §5 says "chấm theo mức nền ở mục 1.5" and §6 says "ràng buộc ở mục 1.7"
instead of repeating the baselines and the compliance line. Without stable numbers
the later sections have nothing to point at and the repetition comes straight
back. It is also how the proof-inventory rule is cited downstream: an angle brief
proof-routes against a numbered rule, not a paragraph someone has to find.

**§1 — Điều chung cho mọi bài.** Turn the head's Review findings and the month's
themes into **concrete writing rules for a post**: what the first two lines do,
what they must not do, what the body is built around, what register fits. Derive
— do not restate: a Review finding is a measurement, and your job is the rule
that follows from it, at the level of a sentence a writer can obey. Mark each
rule with the confidence it inherits: a high-confidence repeated finding is a
**ràng buộc** (a constraint); a thin-sample one is a **hướng thử** (a direction
to try). Also park here, once each: the voice/register rule, the measurement
baselines every experiment in §5 will be scored against, the boundary with the
head's allocation (this doc says HOW, never how many), and a one-line compliance
statement pointing at §6. Close §1 with the **shared chain** every pillar block
then fills in, so §3 can be terse.

**The sophistication constraint is one numbered §1 rule, stated exactly once.**
Take the next free number in §1's sequence and write the read the core carried
back (Step 5b) as a writing rule: **how indirect this month's openings must be**,
in the read's own terms, with the stage and its reasoning as the quarter stated
them. It is **inherited, never derived** — do not sharpen it, do not supplement
it, and do not restate the saturation ladder here; it lives in
`craft/awareness-framework` and is read there. Where the core returned
`NOT STATED`, write the gap line instead — that the quarter states no
sophistication read and **no bar is applied this month** — and do not assume a
stage. §3 points at that rule's number; the anti-repetition rule above is
what keeps it from restating it.

**The period's stated proof inventory is one numbered §1 rule too, and it is a
HAND-DOWN.** Take the next free number and record `plan.proofInventory` (Step 1)
**as the head stated it** — which proof families the business can stand behind
this period, and the trace each one rests on. Record it; do not judge it, rank
it, extend it or route anything with it. Where the head carries none, write
`NOT STATED` as the fact it is: the period states no inventory, and **no route is
assumed to be verified** this month. Two things depend on this rule existing and
being numbered: §6's compliance line points at it rather than re-listing the
families, and the **angle brief proof-routes its mechanism from this period's
inventory as this document states it** — this doc is where that step reads it, so
an inventory left off the page is an inventory nobody downstream can route from.

### Every item in the document carries an example

Not just §1 — **every rule, every pillar block, every differentiation bullet,
every format, every compliance line.** A rule stated abstractly is not a rule a
writer can obey: "open on a belief" and "open on the product" are the same
sentence to someone staring at a blank page. An item without an example is an
item you have not finished writing.

Three kinds, and the document says which is which. **§2 is neither of the first
two** — its material comes from the core and is quoted, not composed:

- **§1 — measured ✅/❌ pairs.** Real lines that were actually published and
  actually scored. **Never invent these.** The head's Review names the openings
  that won and lost, `brand/angles`' organic retrospective names the ones that
  bottomed out, `winners/facebook-posts` holds the proven shapes, and `voice/tone`
  carries its own ✅/❌ table. Quote from those. **Attach the number when there is
  one** — a ❌ carrying its measured result is an argument; a bare ❌ is an opinion.
  Where no measured pair exists for a rule, compose one and do not dress it up as
  measured.
- **§3–§6 — composed illustrations.** A suggested opening line per pillar block, a
  suggested move per differentiation bullet, a concrete subject per format, a
  ✅/❌ per compliance line. These are written fresh to show the shape.
- **§2 — attributed quotes, never composed illustrations.** Every line in §2 is a
  real phrase a recorded source captured, carried through from the core with its
  attribution attached. **Never compose one to show the shape**, never smooth one
  into better Vietnamese, and never present a composite as something someone
  said: an invented customer voice is exactly the failure the core exists to
  stop, and it is indistinguishable from a real one once it is on the page. Where
  a source was silent, §2 carries the **named gap** and no example at all.

**Every example comes from POST content — organic page material only.** Never
source one from ad copy, the ad performance lens, or an `ad/*` doc. The two
channels are graded on different objectives (this channel earns conversation, ads
convert), so a line that works in an ad routinely fails in the feed, and importing
one teaches the wrong instinct. `rules/organic-vs-paid-firewall` is the boundary.

**Label each kind once, at the top of §1.** The measured ones are shapes to
RECOGNISE, not lines to reuse — they are last period's posts, and without that
line a writer pastes a winning opening verbatim and the month ships a repeat. The
composed ones are suggestions, not copy to approve. The §2 quotes are evidence,
not copy: they are what she said, not what to write back at her.

For a rule with two distinct failure modes, show a ❌ for each — one pair cannot
teach a boundary that bends in two directions.

**§2 — Tiếng nói khách hàng.** The core's `voice_of_customer` block, composed
under a Vietnamese heading, one short block per featured persona: her language,
her live triggers, her stated objections and the myths she holds — **in her own
words**. Every quoted phrase carries the recorded source it came from (the head's
research, which marked quarterly finding, which persona detail doc, the
performance review). **Carry it through; do not re-author it.** A phrase without
an attribution does not go in the document at all. Where the core named a **gap**
— which source was silent about which persona — write the gap in, one line, and
leave it open: it is what next period's head Research can act on. Include the
core's refusals too, where it declined an ad-sourced line under the firewall, so
the operator can see what was excluded and why. This section holds no rules of its
own and points at nothing in §1: it is the evidence §3's pillar blocks stand on.

**§2 is read far beyond this document, and that is why nothing in it may be
composed.** Once the Approaches is approved, this section is the **sanctioned
source** of the attributed customer quote an angle brief must cite before a
mechanism may be settled on it — the only place that step may take the quote
from. So an unattributed line here is not a blemish in a planning doc; it is the
grounding a mechanism stands on two steps later. A persona this section leaves
empty leaves the brief step with nothing sanctioned to cite for her, which is
exactly why the gap is **named** and left open rather than filled.

**The mechanism is settled one angle at a time, at the angle brief**, by
`ssc-brief-core`. What this document owes that step is **grounding, not craft**:
§2's attributed customer material, and §1's numbered record of the period's
stated proof inventory. Every section of this document stays on that side of the
line.

**§3 — Trụ cột × persona. Only what is unique to that pillar.** One short block
per priority pillar this month (the allocated pillars when `plan.targets` is set;
otherwise the pillars the head's themes and ranked terms point at). Each block
fills the blanks §1 left and adds nothing else:

- **Persona + her live trigger** — which persona this pillar speaks to this month,
  and the concrete trigger from **her own `brand/persona-<slug>` detail doc's
  ranked trigger list** that the month's research calendar or the season actually
  activates. Match a stated trigger to the month; never invent one, never
  paraphrase from memory.
- **The specific thing to unpick, and what unpicks it** — drawn from her detail
  doc, not from your own reading of her.
- **Its codes** — value / entry / frame from `brand/angles`, stage from
  `brand/journey-stages`.
- **The one differentiating move** that keeps this block distinct from the others,
  so two pillars never read as the same post wearing a different label.
- **Which §2 material this pillar stands on** — point at the attributed lines for
  that persona, and nothing more. It tells the writer where the evidence is, and
  stops there.

Do not restate §1's rules inside a block, and do not assign counts, dates, or
formats per block — those are the head's allocation and the Schedule step's job.

**§4 — Điểm khác biệt.** 2–4 bullets: what Cambridge Diet VN's organic posts
contrast against this month (the against dimensions in `brand/angles`, plus
whatever the head's research surfaced), and the creative move that makes each
contrast land on an organic feed rather than in an ad.

**§5 — Định dạng và phép thử.** Formats and experiments are one section because
they overlap: the month's experiments are usually format bets. For each format the
allocation calls for (or, when allocation is not set yet, each format the month's
themes imply): what it is **for** this month and what makes it work here — never
how many, that is the head's number. Then 1–3 deliberately experimental approaches
worth trying at small scale, each with what a win looks like, **scored against the
baselines named in §1** rather than repeating the numbers.

**§6 — Ranh giới nội dung tự nhiên.** Short. The compliance line for THIS month's
guidance, per `rules/organic-vs-paid-firewall` plus any constraint the head's
research flagged (a platform rule, a legal change, a claim that needs review
before use). State what this channel may say and what it must route through
review first, pointing at §1's proof-inventory rule by number rather than
re-listing the families. Never resolve a compliance question yourself — name it
and route it.

**Vocabulary rule.** Check every Vietnamese string you write against
`rules/banned-words`. Every banned term is prohibited, including compounds. Never
use the acronym "RCT" in persisted prose — write "nghiên cứu lâm sàng độc lập".

### Validate before saving — mechanically, not by eye

The document **is** the column value, so whatever is wrong with it ships as the
artifact. Write the draft to a scratch file first and run these as actual checks;
reading it over is not one of them.

- **Banned words: zero.** Grep the draft against `rules/banned-words` — the legal
  list, the brand-tone list (`chúng tôi`, `thất bại`, `lười biếng`, `giữ nhịp`,
  …), and the English technical terms. Include near-misses of medical verbs: a
  prohibition sentence still ships the word.
- **Em dashes: zero.** `rules/banned-words` bans the em dash outright in its
  structure table. Use a short dash or a comma. This one is easy to miss because
  it is punctuation, not vocabulary, and English-language drafting inserts them
  by habit.
- **Length within cap** — `wc -w` on the file, before saving, not after.
- Every table row has the same cell count as its header.
- No literal `\n`, `\t` or stray backslash sequences.
- A blank line before and after every heading and table.
- Compose the document in ONE piece — do not build it by string-replacing into an
  existing version through nested shells; that is where escaping breaks silently.
- After saving, re-read the stored value (`get_channel_plan`) and re-check it.
  Verify what was STORED, not what you sent.

### Step 7: Output summary

Report to the operator in their language:

```
## Post Approaches — <period>

**Trạng thái:** đề xuất (chờ duyệt)
**Nguồn:** kế hoạch tháng <head id> → chiến lược quý <quarter brief id, or "không có"> → KB (<N> tài liệu, đọc trực tiếp)
**Phân bổ:** <"đã có — <N> trụ cột" | "chưa có — lấy trọng tâm từ định hướng tháng">
**Mức độ bão hoà thị trường (kế thừa từ quý):** <stage> — <read, nguyên văn như quý đã viết; ghi ở mục 1.<n>> | "quý chưa nêu (NOT STATED) — tháng này không áp mức chặn"
**Kho bằng chứng tháng này (ghi lại từ kế hoạch tháng, mục 1.<n>):** <các nhóm bằng chứng đúng như kế hoạch tháng nêu> | "kế hoạch tháng chưa nêu (NOT STATED) — không mặc định tuyến bằng chứng nào"
**Tiếng nói khách hàng:** <N> persona có trích dẫn được ghi nguồn (mục 2) — nguồn để bước brief dẫn lại khi chốt cơ chế

### Điều chung cho mọi bài
- <rule> — <ràng buộc | hướng thử>

### Trụ cột × persona
- <pillar> × <persona>: <one line — the trigger and the opening>
- …

### Xung đột đã xử lý
- <one line per conflict resolved between month / quarter / KB, or "không có">

### Điều nghiên cứu tháng chưa phủ
- <one line per gap — kể cả nguồn im lặng về persona nào mà lõi đã nêu ở mục 2, hoặc "không có">

---
Approaches (`context`) đã lưu vào kế hoạch kênh Bài viết (trạng thái đề xuất).
Duyệt Approaches tại /content/plan/<period>?tab=post&step=approaches, đồng thời
đặt phân bổ cho kênh (số bài theo trụ cột, tần suất đăng, tỷ lệ định dạng) ở bước
Ideate, rồi chạy lại lệnh để sang Ideate.
```

## Output

- `context` written to the post `channel_plan` (the Approaches markdown — the
  channel's creative HOW, in **six** sections), in Vietnamese
- The inherited sophistication read carried as one numbered §1 rule — or the
  `NOT STATED` gap line, with no bar applied
- The period's stated proof inventory recorded verbatim as a second numbered §1
  rule — or `NOT STATED` as the fact it is — the hand-down the angle brief
  proof-routes from
- §2 the attributed voice-of-customer pass, composed from the shared core's
  return with its named gaps carried through; once approved it is the sanctioned
  source of the quote a brief cites
- The mechanism settled at the angle brief, one angle at a time
- The post plan row minted and linked to the period's head if it did not exist
- `strategy_brief_id` recorded as provenance when a quarter brief exists
- No gate flipped, no head field written, no allocation written

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle
  state in either direction — never call `approve` (the ONLY gated promotion; the
  approval hook denies it to agents, any entity, any gate), and never publish.
  Demotion is not a separate `unapprove_*` tool — it is an `edit`, so the ban
  lives here: never use `edit` to demote, unapprove, discard, or reject a row.
  Never edit or delete operator-curated or approved rows.
- **Never sets `approaches_approved`** or any approval flag. Flipping the
  Approaches gate is a dashboard-only human action
  (`approve(entity='channel_plan', gate='approaches')`).
- **Always gate-check the release first** (Step 1). Under an unapproved narrative:
  no KB reads, no strategy read, no write.
- **Never writes the head.** `save_month_plan` and `allocate_channel` are not
  THIS skill's tools — the Review, the themes, the research and the narrative
  belong to the monthly plan, and you only read them. The allocation is also not
  yours, but note it is not off-limits to the channel entirely: `ssc-post-ideate`
  round 1 proposes it via `allocate_channel` (propose-only, flips no gate). You
  read whatever it has set; you never write it.
- **Never writes quantities.** No `save_plan_targets`, no `detail` payload on
  `save_channel_plan` — both are refused with `retired_plan_field` from `2026-08`
  onward, and the refusal is correct: the head allocates.
- **Writes only `context`** on the post `channel_plan`. The month's bets and its
  look-back live on the head; this channel keeps neither of its own.
- **Never runs WebSearch or fetches a page.** The period has exactly one outward
  pass and it is the head's Research step. A gap is reported, never filled here.
- **Never restates the head.** The month's themes, its research findings and its
  Review numbers are already authored and already on the operator's screen.
  Reference one only far enough to anchor a piece of guidance.
- **Never hard-codes KB content.** Name the doc and its section and read it live —
  personas, their triggers and prohibitions, the angle vocabulary, the firewall,
  the banned words. No persona names in closed lists, no remembered trigger.
- **The doctrine is read, never restated.** `craft/doctrine` §1 (the production
  chain), `craft/doctrine` §2 (the mandatory mechanism) and `craft/doctrine` §6
  (the rule-ownership table), and `craft/awareness-framework` §5 +
  `craft/awareness-framework` §7.1 (awareness staging, and the brief-declares
  / writer-picks boundary) are named with their sections and read live every run.
  This document points at them; it never carries a copy of what they say. The
  per-asset floor (`craft/copy-floor`), the set-level coverage verdict
  (`craft/coverage`) and the close's wording rules (`craft/close-job`,
  `craft/cta`) are **not** read here — they govern an asset and a set, which this
  step never produces.
- **The shared core owns two rules; this skill keeps no copy of them.** The
  sophistication-inherit rule and the voice-of-customer pass live in
  `ssc-approaches-core` (Step 5b) and nowhere else. This skill dispatches it,
  composes what it returns into §1's numbered rule and §2, and **never re-authors,
  re-scores, paraphrases or re-attributes** any of it. Two copies of doctrine
  diverge the day one is edited, and the stale copy wins wherever it is read
  first — that drift is exactly what the shared core exists to prevent.
- **The mechanism is the angle brief's (hard rule).** It is settled **one angle at
  a time** by `ssc-brief-core`, and everything that qualifies one — proof-routing,
  dropping rather than softening a compliance-refused route, judging indirectness
  — lives with that step. Neither this skill's tool list nor the core's carries a
  mechanism tool. What this document owes that step is **grounding, not craft**.
- **Hands down the period's proof inventory; judges no route with it.**
  `plan.proofInventory` is recorded verbatim as a numbered §1 rule — `null`
  recorded as `NOT STATED`, never assumed, never inferred, never extended. The
  angle brief proof-routes **from this period's inventory as this document states
  it**, so an inventory left off the page is one nobody downstream can route from.
  This step routes nothing itself.
- **Sophistication is inherited, never derived** — Step 3 holds the quarter's read
  and passes it to the core; the rule lives in `ssc-approaches-core` (Step 5b).
- **A failed KB read STOPS the run** (Step 4): nothing is written, the failing
  **document is named**, and the run never falls back to prose, memory or a cached
  copy.
- All persisted prose is **Vietnamese**, headings included. Chat-side reasoning
  may be the operator's language.
- Operates only on the post channel (`channel='post'`); never reads or writes
  `ad`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads).
