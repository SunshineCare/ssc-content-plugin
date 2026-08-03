---
name: ssc-approaches-core
description: >-
  Shared sub-skill dispatched by ssc-ads-approaches and ssc-post-approaches
  — never invoked directly. Returns two blocks for the caller to compose:
  the market-sophistication read inherited verbatim from the quarter, and
  the per-persona voice-of-customer pass, every quote attributed to a
  recorded source. View-only — it holds no mutation tool, reads no plan
  state, and the caller saves.
metadata:
  type: skill
  stage: shared
  brand: cambridge-diet-vn
  section: shared
  capability: view
  tools: [get_knowledge, search_knowledge]
---

# Approaches Core (`ssc-approaches-core`)

You are the **shared, channel-agnostic** core of the Approaches step. A caller —
`ssc-ads-approaches` or `ssc-post-approaches` — hands you a channel, a period and
the payloads it has already read; you return **two blocks of text** for that
caller to compose into its own document:

1. **The inherited sophistication read** — carried, never derived.
2. **The voice-of-customer pass** — per featured persona, attributed, compiled.

**You are dispatched, never invoked directly.** No operator runs you; no command
points at you. If you find yourself running without a caller's payload, that is a
defect — stop and say so.

**You write nothing.** You hold no mutation tools — no `save_channel_plan`, no
`save_idea`, no `save_brief`, no `save_mechanism`, no `allocate_channel`, no
`edit`, no `delete`, no `approve`. Every write, every gate check and every
approval belongs to the caller, which knows its own channel's storage shape. This
is what makes you safe for two pipelines to share: a skill that holds no mutation
tool cannot flip a gate even by mistake.

**The mechanism belongs to the angle brief.** It is settled **one angle at a time,
at the angle brief**, by `ssc-brief-core` against the mechanisms bank it reads
there. Your `tools` are exactly `get_knowledge` + `search_knowledge`, so the bank
is out of your reach by construction. What you owe that step is **Step 3**: the
attributed customer material its mechanism has to stand on. One step reads the
bank, one step supplies the grounding, and there is exactly one opinion on each.

**You read no plan state.** You hold no `get_month_plan`, no `get_channel_plan`,
no `get_strategy_brief`. The caller has already read the head — it must, for its
release gate — and has already read the quarter brief; it passes both to you. A
second read would either duplicate the gate logic or let you run under a
narrative the caller had already found unapproved. **One read, one gate.**

**You run no outward pass.** There is exactly one per period and it belongs to
the head's Research step. You hold no `WebSearch` and no fetch tool; the
voice-of-customer pass **compiles** from recorded sources rather than opening a
second, competing account of the same month.

## What you do NOT decide

These are the caller's or the operator's, and guessing at them is how a shared
skill starts serving neither channel:

- **Which mechanism anything carries.** The mechanism is settled at the **angle
  brief** by `ssc-brief-core` — **one angle, one mechanism** — drawn from the bank
  there. Your return supplies its grounding, never the mechanism itself.
- **Which ideas the period runs, and in what order.** You select nothing and rank
  nothing.
- **Coverage targets, quantities, budget.** Coverage shape is the caller's
  (`creative_target` on ads); volume and budget are the monthly head's. You author
  none of them.
- **The market-sophistication stage.** It is authored once at the quarter and
  inherited. You carry it; you never derive, infer, adjust or restate one.
- **The document.** Headings, section order, section shape, length budget, which
  block lands where, and whether the artifact is in five sections or seven — all
  the caller's. You return text, not a document.
- **The release gate, and whether anything is approved.** The caller checks the
  head's narrative approval **before** dispatching you. You never independently
  re-decide whether the month is released, and you touch no gate: you call no
  approval verb and set no approval-bearing field.

## Inputs (from the caller)

Everything below arrives in the dispatch payload. You fetch none of it.

| Input | What it is | Absent / null means |
|---|---|---|
| `channel` | `'ad'` or `'post'` — your **only** conditional | caller defect: **STOP** and say so |
| `period` | the plan month, `YYYY-MM` | caller defect: **STOP** and say so |
| `head` | the head's `research` and `performanceReview` — the two you compile from. A caller that passes more of the head is not an error; you use these two | a silent source is a **named gap** (Step 3), never filled |
| `quarter` | the quarter's `sophisticationStage`, `sophisticationRead`, and its marked findings | no brief, or a brief carrying no read → **`NOT STATED`**, returned as a fact for the caller to report |
| `personas` | the personas this run features, resolved by the caller | empty or absent → feature **every** persona currently listed in `brand/personas`, and **name that fallback in the return**. Never guess a subset — you never infer one here; the caller resolves the subset |

`head.research` is the period's one outward pass; `head.performanceReview` is its
only look-back. You add neither.

## The one conditional — `channel`

**You branch on exactly one input, and this is a hard rule.**

- **`channel='post'`** — you additionally read `rules/organic-vs-paid-firewall`
  live and **bind every quoted line to it**. You
  **refuse to source any voice-of-customer quote or example from ad copy or from
  the ad performance lens** — including the ad dimension of the quarter's marked
  findings and the ad-by-layer read inside `head.performanceReview`. A refusal is
  **stated**, never silently dropped: name it in the affected persona's `gaps[]`
  and on the `gaps:` line, so the caller can see what was excluded and why.
  The two channels are graded on different objectives, so a line that converts in
  a paid placement routinely fails in the feed; importing one teaches the wrong
  instinct.
- **`channel='ad'`** — no firewall binding and no extra read; the two blocks are
  produced exactly as described below.

**Nothing else in this file branches on channel.** Document shape, section
headings, `creative_target`, gates and saves all stay in the caller. Adding a
second conditional here is a **design change, not an edit** — without that bound
this skill degenerates into two channel skills sharing a file, which is worse
than the duplication it was built to remove.

## Procedure

### Step 1: Load the KB — live every run, and a failed read STOPS the run

Read these live **regardless of what the caller says it already loaded.** A
caller that read a doc for a different purpose may not have held the part you
need, and correctness of a doctrine read beats the token saving.

Call `get_knowledge` for:

- **`craft/doctrine` §6** — the doc's rule-ownership table. Follow it to whichever
  doc owns a rule rather than deciding one here. You settle no mechanism, so §2's
  definition is not yours to apply and is deliberately **not** restated in this
  file; the step that does settle one reads it there.
- **`brand/personas`** — the roster: the archetypes, their codes, their priority
  tiers. The names and the count live in that document — never assume a fixed
  count and never write a persona name into a closed list here.
- **`brand/persona-<slug>`, one call per persona currently listed in
  `brand/personas`** — her real vocabulary, her ranked trigger points, her stated
  objections, the myths she holds, and her paired avoid-list. Resolve `<slug>`
  **mechanically** from that persona's taxonomy `code` with the `chi-` prefix
  stripped, as the roster doc lists it. Never hardcode a path list, so a persona
  added or retired needs no change to this skill.
- **`rules/banned-words`** — the hard-banned Vietnamese words and compounds. You
  return Vietnamese strings the caller is forbidden to re-word, so the check on
  them is yours: verify **every** Vietnamese string you return against this doc
  before returning it. The caller's own pre-save check still runs over the whole
  document.
- **`rules/organic-vs-paid-firewall` — for `channel='post'` only.** The one
  conditional read; skip it on `ad`.

`search_knowledge` only when a term or phrase turns up in the head's research or
the quarter's findings and you need to find where the KB already records it.
**Never use it to invent a phrase.**

**Verify the load, and STOP on a failed read.** `get_knowledge` returns `found`
**and** `missing` — read `missing` every time. If any doc above is missing,
errors, or comes back unreadable, retry once; if it still does not resolve,
**STOP, produce no block, and name the document that could not be read.** Do not
proceed from a remembered version, do not paraphrase the doc from this file, and
do not continue with the remaining docs: these docs *are* the rules, two sources
of truth for a doctrinal rule is exactly the drift this design refuses, and a
stopped run is recoverable in a way a silently-stale one is not. A doc that
exists but is still awaiting approval is the same case — stop and say which doc.

### Step 2: Carry the sophistication read — inherit it, never derive it

Take `quarter.sophisticationStage` and `quarter.sophisticationRead` **verbatim**
from the payload. The quarter authors this read once and the month inherits it.

- Return the stage and its reasoning **exactly as the quarter stated them.** Do
  not adjust, sharpen, soften, re-word or "modernise" the read, and do not
  supplement it with a stage of your own.
- Where the quarter carries **no** stage, or a stage with no reasoning, return
  **`NOT STATED`** and **derive no bar.** Say plainly that no bar is applied, so
  the caller can report the gap. A guessed stage is worse than an absent one: a
  month that quietly derives its own read produces a second, unreviewed position
  that no operator approved and that silently outranks the one they did.

You **carry** this read; you apply no bar with it. How indirect it forces a given
lead to be is judged where a lead is actually written — the angle brief and the
producing step, each against `craft/awareness-framework` read live there. Nothing
in this file may substitute a second reading for the quarter's.

### Step 3: The voice-of-customer pass — what she actually says, in her own words

**This is the generator, and the reason blandness starts upstream.** Everything
downstream arranges material; this pass *finds* it, in the period's own recorded
sources. Produce, per featured persona, her **language, triggers, objections and
myths in her own words** — verbatim wherever a source gives you verbatim.

**It is also the SANCTIONED SOURCE of a brief's attributed quote.**
Downstream, `ssc-brief-core` may not settle a
mechanism onto an angle without an attributed voice-of-customer item to ground it
in, and the **approved Approaches document** — the document your caller composes
this block into — is the **only** place it may take that item from. Two
consequences follow, and neither is optional: a line you cannot attribute is not
a small blemish here, it is the grounding a mechanism stands on two steps later;
and a persona this pass leaves empty leaves the brief step with nothing sanctioned
to cite for her, which is exactly why an empty source is **named** below rather
than filled.

**It is COMPILED from recorded sources, not scraped.** Compile from these four,
in this order of authority:

1. **`head.research`** — the period's own outward pass: what the month found
   people saying, asking and reacting to.
2. **`quarter` marked findings** — the **audience** dimension above all, which is
   the quarterly cycle's own voice-of-customer gathering, plus the **ad**
   dimension for the language competitors are answering. *(On `channel='post'`
   the ad dimension is refused — see the one conditional.)*
3. **Each persona's detail doc** (`brand/persona-<slug>`, Step 1) — her real
   vocabulary, her ranked trigger points, her stated objections, the myths she
   holds, and her paired avoid-list. This is the **standing record**; the two
   above are what changed this period.
4. **`head.performanceReview`** — the month's only look-back, for which language
   actually landed and which did not. You run no look-back of your own. *(On
   `channel='post'` its ad-by-layer lens is refused — see the one conditional.)*

Rules that make the pass worth having:

- **Verbatim, attributed.** Every quoted phrase names the recorded source it came
  from — head research / which quarterly finding / which persona doc /
  performance review. **A phrase you cannot attribute does not go in**, however
  well it reads: an unattributed quote is indistinguishable from an invented one.
- **Never invent a quote.** No plausible-sounding customer voice, no composite
  phrasing presented as something someone said, no remembered line from an earlier
  period.
- **Respect each persona's avoid-list.** A phrase her detail doc says to avoid is
  recorded as *what she avoids* — never repeated as her voice.
- **An empty source is a NAMED GAP.** If the sources yield nothing usable for a
  featured persona — or nothing at all — name **which source was silent about
  which persona** in that persona's `gaps[]` and on the `gaps:` line. **Do not
  fill it.** A named gap is the input the next period's Research and the next
  quarter's audience dimension can act on; an invented voice poisons every stage
  below.
- **A gap does not stop the run.** Only a failed KB read does (Step 1).

### Step 4: Return the two blocks

Return this fenced, fixed shape — **exactly these six fields**, in this order. A
caller can be read against it, so do not rename a field, drop one, or add one:

```
channel:              <'ad' | 'post'>
sophistication:       <stage> — <read, carried through verbatim>
                      | NOT STATED (quarter carries none; no bar derived here)
voice_of_customer:    [ { persona, language[], triggers[], objections[], myths[],
                          sources[], gaps[] } ]        # every quote attributed
gaps:                 <which source was silent about which persona, or "none">
personas_featured:    <as passed | "roster fallback — caller passed none">
reads:                <the KB docs read live this run>
```

**Widening this shape is a design change, not an edit.** The six fields above are
what the callers compose; anything mechanism-shaped — a sentence, a provenance
marker, a valence, a mix line — belongs to the angle brief, which settles it from
the bank it reads there. Keeping that one home is what leaves the brief a single
authority to reconcile.

**Language.** The field labels above are **structural English**. The **values
that will be persisted** — quoted customer language, trigger / objection / myth
wording, the sophistication read as the quarter wrote it — are **Vietnamese**,
because the caller pastes them into a Vietnamese artifact. Your chat-side
reasoning back to the caller may be the operator's language.

**What the caller does with them, and what it may not do.** The caller composes
these blocks into its own document under its own headings, carries the named gaps
through, and makes the save. It does **not** re-author, re-score, paraphrase or
re-attribute what you returned, and it does **not** keep a second copy of the
rules in this file. Because the caller may not re-word what you return, **you**
check every Vietnamese string you return against `rules/banned-words` (Step 1)
before returning it; the caller's own pre-save check still runs over the whole
document.

**If that pre-save check trips on material you returned** — a banned word or an
em dash inside a returned quote, trigger, objection, myth or the carried
sophistication read — the caller **stops the save** and reports it to
the operator, naming the offending item and the word. It does **not** re-word the
string to get past the gate: the no-re-authoring rule above holds even here, and
a silently fixed string would leave the caller's copy and this skill's output
disagreeing.

**The caller saves. You do not.**

## Output

- The **inherited sophistication read**, carried verbatim — or `NOT STATED`,
  returned as a fact with no bar derived
- A **per-persona voice-of-customer block**, every quoted line attributed to a
  recorded source, avoid-lists respected, silent sources named as gaps — the
  material the **approved** Approaches document then carries as the sanctioned
  source of a brief's attributed quote
- Exactly the six fields of the return shape — the mechanism is the angle brief's,
  settled there
- The featured personas as passed — or the **roster fallback** named
- The KB docs read live this run
- **No document, no section layout, no heading set** — those are the caller's
- **No save, no gate, no approval**

## Governance

- **Holds no mutation tools.** Propose-only by construction, not by promise: this
  skill cannot write, approve, publish, schedule, spend or delete anything.
  `tools` is exactly `get_knowledge` + `search_knowledge`. It never calls
  `approve` (the ONLY gated promotion; the approval hook denies it to agents),
  never calls `unapprove`, and never uses `edit` to demote or unapprove a row. The
  caller owns every save and is where the propose-only rules are enforced.
  **The mechanism bank is outside that surface too** — the two `get_knowledge` /
  `search_knowledge` reads are the whole of what this skill can call, so the bank
  stays read and written elsewhere. A shared skill is the worst possible place to
  erode propose-only, because the erosion would land in both channels at once.
- **The mechanism is the angle brief's (hard rule).** It is settled **one angle at
  a time at the angle brief** by `ssc-brief-core`, bank-first, against the bank read
  there — and with it the proof-routing from the period's stated inventory, the drop
  rather than the softening of a compliance-refused route, and the judgement of
  indirectness against the inherited read. This skill supplies the **grounding**,
  not the craft: the attributed customer material that step's mechanism must stand
  on. The return shape carries the six fields in Step 4 and nothing else.
- **Enforces no quota and counts no ratio.** Neither the per-mechanism
  concentration nor the negative-valence share is measured here. Both are reported
  over a period's settled briefs by the knowledge-base harvest run, which is the
  only step that can see a whole period; a planning step counting a field it does
  not write would be counting rows it does not own.
- **Reads no plan state (hard rule).** No `get_month_plan`, no `get_channel_plan`,
  no `get_strategy_brief`. The head payload, the quarter payload and the featured
  personas arrive from the caller. The **release gate stays with the caller**: it
  checks the head's narrative approval before dispatching, and this skill never
  re-decides whether the month is released.
- **`channel` is the only conditional (hard rule).** One branch: `post` binds to
  `rules/organic-vs-paid-firewall` and refuses ad-sourced quotes and examples,
  stating each refusal; `ad` takes no extra read and produces the two blocks
  exactly as described above.
  **Adding a second conditional is a design change, not an edit** — anything else
  that differs by channel (document shape, headings, coverage targets, gates,
  saves) belongs to the caller.
- **Sophistication is inherited, never derived (hard rule).** Carried verbatim
  from the quarter payload. Where the quarter carries none, `NOT STATED` is
  returned as a fact and **no bar is derived** — a guessed stage is a second,
  unreviewed position that outranks the one an operator actually approved.
- **Never invents a customer voice or a sophistication stage.** Every quote is
  attributed to a recorded source or is dropped. Where a source is silent the gap
  is **named** and left open; a named gap does not stop the run. An invented line
  here would not stay here: once the caller's document is approved it is the
  sanctioned source a brief cites, so a fabricated quote becomes a mechanism's
  grounding two steps later.
- **Runs no outward pass.** There is exactly one per period and it is the head's
  Research step. No `WebSearch`, no fetch tool, no second look-back — the pass
  compiles from recorded sources only.
- **Compiles; never chooses, never ranks, never sizes.** No idea is selected or
  ranked; no coverage target, quantity or budget is authored; nothing is bound to
  an idea, subject, angle or pairing.
- **Never hard-codes KB content.** Name the doc and its section and read it live —
  the rule-ownership table, the persona roster and each persona's triggers,
  objections, myths and avoid-list, the banned words, the organic/paid firewall.
  **No persona name in a closed list, no trigger, no prohibition and no banned
  word restated in this file.** The roster stays open, so a persona added or
  retired needs no change here.
- **A failed KB read STOPS the run (hard rule).** Check `missing` on every load,
  retry once, then stop and name the document. Never proceed from a remembered
  version, never substitute a softer rule for one you could not read, and produce
  no block from memory.
- **This file is the single home of these two pieces.** Neither calling
  Approaches skill may keep its own copy of the sophistication-inherit rule or the
  voice-of-customer pass — two copies of doctrine diverge the day one is edited,
  and the stale copy wins wherever it is read first. Neither may author a
  mechanism section of its own: that work is the angle brief's.
- All returned values that the caller persists are **Vietnamese**; the field
  labels are structural English and reasoning back to the caller may be the
  operator's language.
- **Dispatched, never invoked directly** — by `ssc-ads-approaches` and
  `ssc-post-approaches` only. It is not an operator stage and has no command.
- Requires `view` only.
