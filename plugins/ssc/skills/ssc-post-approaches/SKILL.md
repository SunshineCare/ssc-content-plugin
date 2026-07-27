---
name: ssc-post-approaches
description: >-
  Runs the APPROACHES step — the first step and first gate of the Cambridge Diet Vietnam Posts channel, on channel_plans(channel='post', period), hanging off that period's monthly-plan head. It authors the channel's creative HOW for organic Facebook posts and nothing above it. Grounding is strictly ordered: the MONTHLY PLAN first (its narrative, themes, one outward research pass and only look-back), the QUARTERLY strategy brief second (to place the month in the quarter and fill in where the month is silent), the KNOWLEDGE BASE third (craft, persona detail, hard rules — read live by path, never remembered). Where two sources disagree the higher one wins and the doc says so in one line. It NEVER restates the head, NEVER runs WebSearch (the head's Research is the period's only outward pass), NEVER writes plan_targets or the detail row (the head allocates; a channel-side write is refused with retired_plan_field), and NEVER touches the head. Blocked until the month is released by the head's narrative approval. Writes Vietnamese markdown to channel_plans.context via save_channel_plan, minting the post plan row if none exists. Propose-only; ends at the Approaches gate; never sets approaches_approved.
metadata:
  type: skill
  stage: post-pipeline
  brand: cambridge-diet-vn
  section: post
  capability: edit
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
- `plan.strategyBriefId` — the quarter brief the head recorded, if any.

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
  block in §2. When absent (the usual case at this step), take pillar emphasis
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
- `{ brief: null }` → note "no quarterly brief for this quarter" and proceed on
  the head alone. Do not block.

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
  `<slug>` mechanically from that persona's taxonomy `code` with the `chi-`
  prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the
  path list, so a persona added or retired needs no change here. Load every
  currently-listed persona's doc, not just the ones you end up featuring: you
  need her **actual** stated trigger to match against the month, not a generic
  one.
- `brand/journey-stages` — the emotional journey stages and their content
  implications
- `brand/angles` — value / entry / against / experience dimensions and the frame
  codes. This is the vocabulary §2's differentiation move is expressed in.
- `voice/tone` — the brand's voice characteristics
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

**Length: about 1700 space-separated tokens of Vietnamese** (`wc -w` on the
document). This is working guidance an operator reads before approving and a
writer reads before drafting. Roughly 1200 of that is the guidance and 500 is the
examples, which are load-bearing and are not what to cut. The way to hit it is to
stop repeating, not to delete reasoning: §1 owns every shared rule, so §2-§5 cost
a line each instead of a paragraph.

```markdown
## 1. Điều chung cho mọi bài tháng này  (What binds every post this month)
## 2. Trụ cột × persona                  (Pillar × persona — only what is unique)
## 3. Điểm khác biệt                     (Differentiation)
## 4. Định dạng và phép thử              (Formats and the month's experiments)
## 5. Ranh giới nội dung tự nhiên        (The organic content line)
```

**§1 is the shared section, and it exists to stop the rest of the doc repeating
itself.** Anything true of every pillar belongs here and is stated **exactly
once**; §2 onward reference it rather than restating it. Before you save, re-read
the draft and ask of every sentence in §2–§5: *is this already true in §1?* If it
is, delete it there and let §1 carry it. A doc that states its main rule five
times reads as five rules.

**Number §1's rules (1.1, 1.2, …).** The numbering is what makes the referencing
work: §4 says "chấm theo mức nền ở mục 1.5" and §5 says "ràng buộc ở mục 1.7"
instead of repeating the baselines and the compliance line. Without stable numbers
the later sections have nothing to point at and the repetition comes straight
back.

**§1 — Điều chung cho mọi bài.** Turn the head's Review findings and the month's
themes into **concrete writing rules for a post**: what the first two lines do,
what they must not do, what the body is built around, what register fits. Derive
— do not restate: a Review finding is a measurement, and your job is the rule
that follows from it, at the level of a sentence a writer can obey. Mark each
rule with the confidence it inherits: a high-confidence repeated finding is a
**ràng buộc** (a constraint); a thin-sample one is a **hướng thử** (a direction
to try). Also park here, once each: the voice/register rule, the measurement
baselines every experiment in §4 will be scored against, the boundary with the
head's allocation (this doc says HOW, never how many), and a one-line compliance
statement pointing at §5. Close §1 with the **shared chain** every pillar block
then fills in, so §2 can be terse.

### Every item in the document carries an example

Not just §1 — **every rule, every pillar block, every differentiation bullet,
every format, every compliance line.** A rule stated abstractly is not a rule a
writer can obey: "open on a belief" and "open on the product" are the same
sentence to someone staring at a blank page. An item without an example is an
item you have not finished writing.

Two kinds, and the document says which is which:

- **§1 — measured ✅/❌ pairs.** Real lines that were actually published and
  actually scored. **Never invent these.** The head's Review names the openings
  that won and lost, `brand/angles`' organic retrospective names the ones that
  bottomed out, `winners/facebook-posts` holds the proven shapes, and `voice/tone`
  carries its own ✅/❌ table. Quote from those. **Attach the number when there is
  one** — a ❌ carrying its measured result is an argument; a bare ❌ is an opinion.
  Where no measured pair exists for a rule, compose one and do not dress it up as
  measured.
- **§2–§5 — composed illustrations.** A suggested opening line per pillar block, a
  suggested move per differentiation bullet, a concrete subject per format, a
  ✅/❌ per compliance line. These are written fresh to show the shape.

**Every example comes from POST content — organic page material only.** Never
source one from ad copy, the ad performance lens, or an `ad/*` doc. The two
channels are graded on different objectives (this channel earns conversation, ads
convert), so a line that works in an ad routinely fails in the feed, and importing
one teaches the wrong instinct. `rules/organic-vs-paid-firewall` is the boundary.

**Label both kinds once, at the top of §1.** The measured ones are shapes to
RECOGNISE, not lines to reuse — they are last period's posts, and without that
line a writer pastes a winning opening verbatim and the month ships a repeat. The
composed ones are suggestions, not copy to approve.

For a rule with two distinct failure modes, show a ❌ for each — one pair cannot
teach a boundary that bends in two directions.

**§2 — Trụ cột × persona. Only what is unique to that pillar.** One short block
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

Do not restate §1's rules inside a block, and do not assign counts, dates, or
formats per block — those are the head's allocation and the Schedule step's job.

**§3 — Điểm khác biệt.** 2–4 bullets: what Cambridge Diet VN's organic posts
contrast against this month (the against dimensions in `brand/angles`, plus
whatever the head's research surfaced), and the creative move that makes each
contrast land on an organic feed rather than in an ad.

**§4 — Định dạng và phép thử.** Formats and experiments are one section because
they overlap: the month's experiments are usually format bets. For each format the
allocation calls for (or, when allocation is not set yet, each format the month's
themes imply): what it is **for** this month and what makes it work here — never
how many, that is the head's number. Then 1–3 deliberately experimental approaches
worth trying at small scale, each with what a win looks like, **scored against the
baselines named in §1** rather than repeating the numbers.

**§5 — Ranh giới nội dung tự nhiên.** Short. The compliance line for THIS month's
guidance, per `rules/organic-vs-paid-firewall` plus any constraint the head's
research flagged (a platform rule, a legal change, a claim that needs review
before use). State what this channel may say and what it must route through
review first. Never resolve a compliance question yourself — name it and route it.

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

### Điều chung cho mọi bài
- <rule> — <ràng buộc | hướng thử>

### Trụ cột × persona
- <pillar> × <persona>: <one line — the trigger and the opening>
- …

### Xung đột đã xử lý
- <one line per conflict resolved between month / quarter / KB, or "không có">

### Điều nghiên cứu tháng chưa phủ
- <one line per gap, or "không có">

---
Approaches (`context`) đã lưu vào kế hoạch kênh Bài viết (trạng thái đề xuất).
Duyệt Approaches tại /content/plan/<period>?tab=post&step=approaches, đồng thời
đặt phân bổ cho kênh (số bài theo trụ cột, tần suất đăng, tỷ lệ định dạng) ở bước
Ideate, rồi chạy lại lệnh để sang Ideate.
```

## Output

- `context` written to the post `channel_plan` (the Approaches markdown — the
  channel's creative HOW), in Vietnamese
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
- **Never writes the head.** `save_month_plan` and `allocate_channel` are not this
  skill's tools. The Review, the themes, the research, the narrative and the
  allocation belong to the monthly plan.
- **Never writes quantities.** No `save_plan_targets`, no `detail` payload on
  `save_channel_plan` — both are refused with `retired_plan_field` from `2026-08`
  onward, and the refusal is correct: the head allocates.
- **Never writes retired fields.** `tactics`, `tactics_approved` and
  `retrospective` no longer exist on `channel_plans`.
- **Never runs WebSearch or fetches a page.** The period has exactly one outward
  pass and it is the head's Research step. A gap is reported, never filled here.
- **Never restates the head.** The month's themes, its research findings and its
  Review numbers are already authored and already on the operator's screen.
  Reference one only far enough to anchor a piece of guidance.
- **Never hard-codes KB content.** Name the doc and its section and read it live —
  personas, their triggers and prohibitions, the angle vocabulary, the firewall,
  the banned words. No persona names in closed lists, no remembered trigger.
- All persisted prose is **Vietnamese**, headings included. Chat-side reasoning
  may be the operator's language.
- Operates only on the post channel (`channel='post'`); never reads or writes
  `ad`/`youtube` state.
- Requires `edit` capability (plus `view` for the reads).
