---
name: ssc-approaches-core
description: >-
  Shared sub-skill, dispatched by the two Approaches skills, never invoked directly by an operator — the SHARED, channel-agnostic core of the Approaches step of a Cambridge Diet Vietnam monthly plan, dispatched by ssc-ads-approaches and ssc-post-approaches. It returns THREE blocks of text for the caller to compose into its own document: the INHERITED market-sophistication read (carried through verbatim from the quarter the caller passed in, never derived — `NOT STATED` is returned as a fact, never filled with a guessed stage); the per-persona VOICE-OF-CUSTOMER pass (her language, triggers, objections and myths in her own words, COMPILED from four ranked recorded sources, every quote attributed, never invented, each persona's avoid-list respected, and a silent source named as a gap that does not stop the run); and the BANK-FIRST CANDIDATE-MECHANISM supply (matched against craft/mechanism-bank read live BEFORE anything is authored, so every candidate drawn from it names its `bank_id`, while gap-fill — the ONLY invention this skill makes — is authored against a voice-of-customer item no entry fits and marked `in_bank: false`; the bank saves the AUTHORING and never the GROUNDING, so an entry with nothing this period to explain is NOT supplied, and a draw relaxes nothing else — proof route from THIS period's stated inventory only, a compliance-refused sole route dropped rather than softened, indirectness judged against the inherited read, both volume floors unchanged; each candidate also carries its `valence` per the bank's §2 read live, with the mix reported and NO quota enforced here). The returned candidate shape gains exactly TWO fields, `bank_id` (or `null`) and `valence`, and loses none. It has exactly ONE conditional, `channel` — the bank read is unconditional — on `post` it binds every candidate and every quoted line to rules/organic-vs-paid-firewall and refuses any ad-sourced line; on `ad` it behaves as the Ads Approaches step behaved inline. It writes nothing, holds no mutation tool, reads NO plan state (the head, the quarter brief and the featured personas all arrive from the caller, which owns the release gate and every save), runs no outward pass, and never hard-codes a knowledge-base rule — it names the doc and its section and reads it live, and a failed read STOPS the run rather than falling back to a remembered version. Propose-only by construction.
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
the payloads it has already read; you return **three blocks of text** for that
caller to compose into its own document:

1. **The inherited sophistication read** — carried, never derived.
2. **The voice-of-customer pass** — per featured persona, attributed, compiled.
3. **The candidate-mechanism supply** — drawn **bank-first** from
   `craft/mechanism-bank`, grounded in that pass, proof-routed, and deliberately
   larger than the period can use.

**You are dispatched, never invoked directly.** No operator runs you; no command
points at you. If you find yourself running without a caller's payload, that is a
defect — stop and say so.

**You write nothing.** You hold no mutation tools — no `save_channel_plan`, no
`save_idea`, no `save_brief`, no `allocate_channel`, no `edit`, no `delete`, no
`approve`. Every write, every gate check and every approval belongs to the
caller, which knows its own channel's storage shape. This is what makes you safe
for two pipelines to share: a skill that holds no mutation tool cannot flip a
gate even by mistake.

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

- **Which mechanism a subject carries.** You propose candidates. Ideate picks the
  one a subject carries (settled once on the subject and inherited by every angle
  beneath it, which may carry a bounded angle-local override — **one angle, one
  mechanism**)
  and a human approves the subject. You assign no candidate to any idea, subject
  or pairing.
- **Which ideas the period runs, and in what order.** You select nothing and rank
  nothing.
- **Coverage targets, quantities, budget.** Coverage shape is the caller's
  (`creative_target` on ads); volume and budget are the monthly head's. You author
  none of them and you never trim your candidate set to a pairing count you were
  not given — **the caller trims.**
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
| `head` | the head's `research`, `performanceReview`, `proofInventory`, `offerState` | a **null `proofInventory` is a FACT** — no stated inventory this period; a **null `offerState` is a FACT** — no promotion. Neither is ever assumed, inferred or invented |
| `quarter` | the quarter's `sophisticationStage`, `sophisticationRead`, and its marked findings | no brief, or a brief carrying no read → **`NOT STATED`**, returned as a fact for the caller to report |
| `personas` | the personas this run features, resolved by the caller | empty or absent → feature **every** persona currently listed in `brand/personas`, and **name that fallback in the return**. Never guess a subset — you never infer one here; the caller resolves the subset |

`head.research` is the period's one outward pass; `head.performanceReview` is its
only look-back. You add neither.

## The one conditional — `channel`

**You branch on exactly one input, and this is a hard rule.**

- **`channel='post'`** — you additionally read `rules/organic-vs-paid-firewall`
  live and **bind every candidate mechanism and every quoted line to it**. You
  **refuse to source any voice-of-customer quote or example from ad copy or from
  the ad performance lens** — including the ad dimension of the quarter's marked
  findings and the ad-by-layer read inside `head.performanceReview`. A refusal is
  **stated**, never silently dropped: name it in the affected persona's `gaps[]`
  and on the `gaps:` line, so the caller can see what was excluded and why.
  The two channels are graded on different objectives, so a line that converts in
  a paid placement routinely fails in the feed; importing one teaches the wrong
  instinct.
- **`channel='ad'`** — no firewall binding, and the blocks you return are exactly
  what the Ads Approaches step produced inline before this core existed.

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

- **`craft/doctrine` §2** — what a mechanism is, what qualifies and what does
  not, and the mandatory mechanism beat it feeds. This governs Step 4 and is
  **defined nowhere in this file**. (§6 is the doc's rule-ownership table — follow
  it to whichever doc owns a rule rather than deciding one here.)
- **`craft/mechanism-bank`** — the brand's standing supply of mechanisms, and the
  document Step 4 matches against **before it authors anything**. §1 says what the
  document is and points at `craft/doctrine` §2 for the definition; §2 holds the
  valence vocabulary and its priority rule; §3 holds the entries, each with its
  own `id`. **Read live, every run, on both channels — this read is
  unconditional.** Restate **no** part of it here: no mechanism sentence, no
  entry `id`, no valence example, no `fits` phrasing. The bank is revised on its
  own cadence through the KB revision cycle, so a baked-in copy goes stale
  silently and then outranks the live document it was meant to reflect, and a run
  that proceeded from a remembered bank would produce a supply indistinguishable
  from an invented one while claiming to be bank-first.
- **`craft/awareness-framework`** — the Market Awareness × Sophistication ladders
  and the brand's stated position on them, the persuasion-route lens (§4), and the
  lead taxonomy plus the awareness→lead mapping (§6/§7). Read live for how
  indirect a given read forces a lead to be; never restate a rung, a mapping or a
  route-to-stage pairing here.
- **`brand/proof-points`** — the adopted proof families a candidate's trace may
  lean on.
- **`rules/compliance`** — the refused proof devices and the constraint that
  refuses each.
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
  author the Vietnamese strings the caller is forbidden to re-word, so the check
  on them is yours: verify **every** Vietnamese string you return against this doc
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
**`craft/mechanism-bank` is this same case, with no softer fallback**: an
unreadable bank stops the run and is named, and the supply is **not** authored
fresh instead — a run that silently degraded to authoring everything would look
exactly like a bank-first run to everyone downstream.

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

This read is what Step 4's `indirectness` field is judged against, and nothing
else in this file may substitute for it.

### Step 3: The voice-of-customer pass — what she actually says, in her own words

**This is the generator's first half, and the reason blandness starts upstream.**
Everything downstream arranges material; this pass and Step 4 *find* it — this
pass in the period's own recorded sources, Step 4 in the standing bank first and
only then in new craft. **This half is never saved by the bank**: what the brand
has already articulated says nothing about what people are saying this month, so
this pass runs in full whatever the bank holds. Produce, per featured persona,
her **language, triggers, objections and myths in her own words** — verbatim
wherever a source gives you verbatim.

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

### Step 4: Candidate mechanisms — the supply the caller's channel draws on

Read what a mechanism must be — what qualifies, what does not, and the mandatory
beat it feeds — **live from `craft/doctrine` §2** (Step 1). It is deliberately
**not** defined in this file: a second copy of that definition here is the drift
this design refuses, and a remembered version of it is a guess.

**Ground every candidate in Step 3's material — drawn or authored, no
exception.** A mechanism with no observed failure or belief behind it is exactly
the invented topic this design exists to stop.

**Build the supply BANK-FIRST: match before you author.** Take Step 3's
voice-of-customer items and match `craft/mechanism-bank` §3 against them — each
entry's `fits` against each item — **before you author a single new mechanism.**
Where an entry fits an item, **that entry supplies the candidate**, and the
candidate **names that entry's `bank_id`**. Re-derivation is the expensive half
of this step and the half that does not need to be per-period: the reading of
what people are actually saying genuinely changes month to month; the craft of
why something works does not. Naming the `bank_id` is also what lets every
reader downstream tell a draw from an invention without guessing.

**Gap-fill is the ONLY invention you make here, and it must be visible.** Where
no bank entry fits a voice-of-customer item, author a new candidate for that item
and mark it **`in_bank: false`**, with `bank_id: null`. That is the only place in
this step you author a mechanism the bank does not hold, and you **never** attach
an entry's `id` to something you wrote. An invented mechanism must be *visibly*
invented: that flag is what the harvest path later acts on, and what tells an
operator reading the approved document which lines are new craft rather than
standing craft.

**The bank saves the AUTHORING, never the GROUNDING (hard rule).** A bank entry
still requires an **attributed voice-of-customer quote from this period** (Step
3) before it may be supplied. **A bank entry with nothing this month to explain
is NOT supplied**, however good it is. The bank removes the cost of writing the
sentence again; it says nothing about whether this month's readers are actually
saying the thing that mechanism explains. A supply drawn from the bank alone
would be a standing list dressed as a reading of the period — the failure Step 3
exists to prevent, inverted and worse, because nothing about it would look wrong.

**A bank draw relaxes NOTHING else (hard rule).** An entry's presence in the bank
is evidence that the brand has articulated the mechanism — not that it is
compliant this period, provable from this period's inventory, or indirect enough
for the read the quarter set. Every rule below binds a drawn candidate exactly as
it binds one you authored: the proof route is selected **only** from this
period's stated `head.proofInventory`; a candidate whose only route
`rules/compliance` refuses is **dropped, not softened and not re-traced**;
indirectness is judged against the **inherited** read, with **no bar derived
where the quarter states none**; and both volume floors stand unchanged. Treating
a bank draw as pre-cleared is the one way a governed library becomes a bypass.

Each candidate carries, in one short block:

- **The mechanism itself** — **one specific Vietnamese sentence**, meeting
  `craft/doctrine` §2's definition read live. A drawn candidate carries the bank
  entry's sentence; a gap-filled one is written here.
- **Where it came from** — the **`bank_id`** of the entry it was drawn from, or
  **`bank_id: null` and `in_bank: false`** where you gap-filled it.
- **Its valence** — `positive` or `negative`, **as defined in the bank's §2**,
  read live (Step 1). The two values, what each means and which one the brand
  prioritises live in that document and are **never restated here**. A drawn
  candidate carries its entry's valence; a gap-filled one is judged against §2.
  **You report the mix; you enforce no quota** — a quota is a rule about *usage*,
  and usage happens at Ideate, which knows how many assets the period actually
  runs. You never drop, trim or re-word a candidate to move the mix.
- **What it explains** — the voice-of-customer item it answers, **quoted and
  attributed** (Step 3). **No candidate without one — including a bank draw.**
- **Its proof route** — which proof family from `brand/proof-points` it would
  lean on, and the **trace** (a live KB proof point, or the product paperwork).
  **Select only from this period's stated `head.proofInventory`**; where that
  inventory is `null`, say so and mark every candidate's route
  **`unverified_for_period`** rather than assuming the device is available.
  **A candidate whose only proof route is refused by `rules/compliance` is not
  proposed at all** — it is dropped, not softened and not re-traced onto a family
  the compliance doc did not clear.
- **How indirect it forces the lead to be** — read against the **inherited**
  sophistication (Step 2), using `craft/awareness-framework` live. Where the read
  is `NOT STATED`, say so and apply no bar; never assume a stage to judge against.

**Volume: size the supply against the period's PLANNED VOLUME, not against the
persona count.** Return everything that can be attributed and grounded, and take
the floor from whichever is larger:

- **one candidate per featured persona**, and
- **enough that no single candidate would have to carry more than about a quarter
  of the period's planned assets.** The caller's channel knows that number — the
  post channel's allocation totals it, the ads channel's `creative_target` does —
  so where the caller passed a volume, divide by four and round up; where it
  passed none, say in the return that the supply was sized on the persona floor
  alone and name the risk.

**Draws and gap-fills count the same toward both floors, and the floors are
unchanged.** The bank makes them **cheaper to reach; it does not lower them** —
a thin bank is a reason to gap-fill more, never a reason to return a smaller
supply.

**Why the second floor exists.** The per-persona floor alone is how a 31-post
month got 7 candidates and one mechanism ended up on 8 posts (2026-08). A supply
smaller than the month forces repetition downstream no matter how carefully the
caller trims — the concentration is created here, not at Ideate.

**The caller trims.** You never trim to a pairing count, an angle count or an idea
count you were not given, and unused candidates are not wasted: they stay in the
caller's approved doc for the whole period.

**You propose; you never choose and never approve.** Assign no candidate to a
subject, an idea or a pairing. Ideate picks the one mechanism a subject carries
and a human approves the subject.

**On `channel='post'`**, bind each candidate to `rules/organic-vs-paid-firewall`
before proposing it, and drop — with the refusal stated — any candidate that can
only be argued the way paid creative argues it. **This binds a bank-drawn
candidate exactly as it binds one you authored**: the bank is channel-agnostic
and clears nothing, so a drawn entry that only survives as paid argument is
dropped and the refusal is stated, naming its `bank_id`.

### Step 5: Return the three blocks

Return this fenced, fixed shape. A caller can be read against it, so do not
rename a field, drop one, or add a **ninth** — and inside a candidate, do not add
a **seventh**:

```
channel:              <'ad' | 'post'>
sophistication:       <stage> — <read, carried through verbatim>
                      | NOT STATED (quarter carries none; no bar derived here)
voice_of_customer:    [ { persona, language[], triggers[], objections[], myths[],
                          sources[], gaps[] } ]        # every quote attributed
candidate_mechanisms: [ { mechanism, bank_id | null, valence,
                          explains: { quote, source },
                          proof: { family, trace, verified | unverified_for_period },
                          indirectness } ]
valence_mix:          <how the candidates split across the two values in the
                       bank's §2 — reported, never capped here>
gaps:                 <which source was silent about which persona, or "none">
personas_featured:    <as passed | "roster fallback — caller passed none">
reads:                <the KB docs read live this run>
```

`bank_id` and `valence` are the **two** fields this shape gained; nothing was
renamed, dropped or re-ordered to make room for them. **`bank_id: null` IS the
statement `in_bank: false`** — say it that way where a caller's document names
the flag; it is not a third field on the return, and nothing else on the
candidate encodes provenance.

**Language.** The field labels above are **structural English**, and so are the
values that are labels rather than prose — `bank_id`, `in_bank`, and the two
valence values as the bank's §2 spells them. The **values that will be
persisted** — mechanism sentences, quoted customer language, trigger / objection
/ myth wording, the sophistication read as the quarter wrote it — are
**Vietnamese**, because the caller pastes them into a Vietnamese artifact. Your
chat-side reasoning back to the caller may be the operator's language.

**What the caller does with them, and what it may not do.** The caller composes
these blocks into its own document under its own headings, carries the named gaps
through, and makes the save. It does **not** re-author, re-score, paraphrase or
re-attribute what you returned, and it does **not** keep a second copy of the
rules in this file. Because the caller may not re-word what you return, **you**
check every Vietnamese string you return against `rules/banned-words` (Step 1)
before returning it; the caller's own pre-save check still runs over the whole
document.

**If that pre-save check trips on material you returned** — a banned word or an
em dash inside a returned mechanism sentence, quote, trigger, objection, myth or
the carried sophistication read — the caller **stops the save** and reports it to
the operator, naming the offending item and the word. It does **not** re-word the
string to get past the gate: the no-re-authoring rule above holds even here, and
a silently fixed string would leave the caller's copy and this skill's output
disagreeing.

**The caller saves. You do not.**

## Output

- The **inherited sophistication read**, carried verbatim — or `NOT STATED`,
  returned as a fact with no bar derived
- A **per-persona voice-of-customer block**, every quoted line attributed to a
  recorded source, avoid-lists respected, silent sources named as gaps
- A **candidate-mechanism supply, built bank-first**: at minimum one per featured
  persona and more than the period can use, each naming the **`bank_id`** it was
  drawn from — or stated `in_bank: false` where it was gap-filled — each carrying
  its **`valence`** per the bank's §2 read live, its quoted VOC item, its proof
  route (`verified` or `unverified_for_period`) and its indirectness against the
  inherited read
- The period's **valence mix**, reported as a fact — **no quota applied, no
  candidate removed to move it**; the cap on usage is Ideate's
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
  **This holds over the bank too: it reads the bank and never writes it** — no
  `save_knowledge`, no `propose_knowledge_revision`, no `edit`, and nothing
  approved. A gap-filled candidate reaches the bank only through the KB
  pipeline's propose-only path and an operator's approval, never from here. A
  shared skill is the worst possible place to erode propose-only, because the
  erosion would land in both channels at once.
- **Bank-first, with invention visible (hard rule).** The supply is built by
  matching `craft/mechanism-bank` against this period's voice-of-customer items
  **before** anything is authored; a drawn candidate names its `bank_id`, and
  gap-fill — the only invention this skill makes — is marked `in_bank: false`.
  **The bank saves the authoring, never the grounding**: an entry with no
  attributed quote from this period is not supplied. **The bank clears nothing
  else** — proof route from this period's stated inventory only, a
  compliance-refused sole route is dropped rather than softened, indirectness
  judged against the inherited read with no bar derived where the quarter states
  none, and both volume floors unchanged. **The mix of valences is reported and
  no quota is enforced** — a quota is about usage, and usage happens at Ideate.
- **Reads no plan state (hard rule).** No `get_month_plan`, no `get_channel_plan`,
  no `get_strategy_brief`. The head payload, the quarter payload and the featured
  personas arrive from the caller. The **release gate stays with the caller**: it
  checks the head's narrative approval before dispatching, and this skill never
  re-decides whether the month is released.
- **`channel` is the only conditional (hard rule).** One branch: `post` binds to
  `rules/organic-vs-paid-firewall` and refuses ad-sourced quotes and examples,
  stating each refusal; `ad` behaves as the Ads Approaches step did inline.
  **Adding a second conditional is a design change, not an edit** — anything else
  that differs by channel (document shape, headings, coverage targets, gates,
  saves) belongs to the caller. **The bank read is unconditional** — it loads on
  every run on both channels, and the `post` firewall binding applies to a
  bank-drawn candidate exactly as it applies to an authored one.
- **Sophistication is inherited, never derived (hard rule).** Carried verbatim
  from the quarter payload. Where the quarter carries none, `NOT STATED` is
  returned as a fact and **no bar is derived** — a guessed stage is a second,
  unreviewed position that outranks the one an operator actually approved.
- **Never invents a customer voice, a mechanism's evidence, a proof device, a
  promotion, or a sophistication stage.** Every quote is attributed to a recorded
  source or is dropped; a `null` proof inventory and a `null` offer state are
  **facts**, not missing reads. Where a source is silent the gap is **named** and
  left open; a named gap does not stop the run.
- **Runs no outward pass.** There is exactly one per period and it is the head's
  Research step. No `WebSearch`, no fetch tool, no second look-back — the pass
  compiles from recorded sources only.
- **Proposes; never chooses, never ranks, never sizes.** No candidate is assigned
  to an idea, subject or pairing; no idea is selected or ranked; no coverage
  target, quantity or budget is authored. The caller trims the supply.
- **Never hard-codes KB content.** Name the doc and its section and read it live —
  the mechanism definition, the awareness and sophistication ladders and the
  awareness→lead mapping, the proof families, the compliance refusals, the persona
  roster and each persona's triggers, objections, myths and avoid-list, the
  organic/paid firewall, and **the mechanism bank and its valence vocabulary**.
  **No persona name in a closed list, no trigger, no prohibition, no ladder rung,
  no proof family — and no mechanism sentence, no bank `id`, no valence example
  and no `fits` phrasing — restated in this file.** The roster stays open, so a
  persona added or retired needs no change here; the bank is revised on its own
  cadence, so an entry added, sharpened or dropped needs none either.
- **A failed KB read STOPS the run (hard rule).** Check `missing` on every load,
  retry once, then stop and name the document. Never proceed from a remembered
  version, never substitute a softer rule for one you could not read, and produce
  no block from memory.
- **This file is the single home of these three pieces.** Neither calling
  Approaches skill may keep its own copy of the sophistication-inherit rule, the
  voice-of-customer pass or the candidate-mechanism construction — two copies of
  doctrine diverge the day one is edited, and the stale copy wins wherever it is
  read first.
- All returned values that the caller persists are **Vietnamese**; the field
  labels are structural English and reasoning back to the caller may be the
  operator's language.
- **Dispatched, never invoked directly** — by `ssc-ads-approaches` and
  `ssc-post-approaches` only. It is not an operator stage and has no command.
- Requires `view` only.
