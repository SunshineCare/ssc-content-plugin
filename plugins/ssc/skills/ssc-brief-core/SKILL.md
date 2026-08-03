---
name: ssc-brief-core
description: >-
  The SHARED brief-authoring core for Cambridge Diet Vietnam — the channel-agnostic half of turning an approved idea into a production-ready brief. Called by ssc-post-ideate (round 3) and available to any channel that needs the same work: define the idea's HERO (its north star, one sentence), derive the FIVE narrative fields (hook_direction / core_message / why_now / story_moment / cta) against a named angle, self-score each candidate 1-5 with a Vietnamese comment, drop and regenerate anything at or below 3, and audit the resulting set for diversity against the briefs that already exist. It CARRIES the idea's MECHANISM — inherited from the idea, written TO, never restated, and never varied on its own initiative — with ONE bounded exception: an ANGLE-LOCAL OVERRIDE, opened only where the inherited mechanism does not serve that angle's persona x route, sourced bank-first from `craft/mechanism-bank`, judged against `craft/doctrine` §2 read live, grounded in an attributed voice-of-customer item from the approved Approaches document (it runs no outward pass of its own), proof-routed from this period's stated inventory and DROPPED — not softened, not re-traced — if `rules/compliance` refuses that route, never written onto the idea and never re-opening a sibling angle (one angle, one mechanism), and always reported naming its `bank_id` or `in_bank: false`. It persists none of it — it holds no mutation tool and the caller saves. It also carries the caller's declared AWARENESS STAGE through onto the fields — every channel that briefs declares one, posts included — plus the LAYER on a channel that has media layers (ads do; a post has no media home). It never declares a LEAD: the awareness-to-lead mapping is overlapping by design, and the lead is picked per asset by the writer, from the set the declared stage admits. `cta` is a DIRECTION only, never fixed wording, and is always subordinate to the declared layer's close job. It is deliberately IGNORANT of fan-out: the caller decides HOW MANY angles an idea gets (post = exactly one, ads = one per fitting persona x route) and passes that in as a parameter, so this skill never assumes a channel's shape. It also never decides WHICH angle — the caller supplies the angle spec (persona, route, anchor, the awareness stage, and — only where the channel has media layers — the layer); this skill turns a chosen angle into fields. Writes nothing on its own: it returns hero + scored field sets to the caller, which owns every save. Never hard-codes a knowledge-base rule: it names the doc and section and reads it live, and a failed read STOPS the run rather than falling back to a remembered version. Propose-only by construction; it holds no mutation tools at all.
metadata:
  type: skill
  stage: shared
  brand: cambridge-diet-vn
  section: shared
  capability: view
  tools: [get_knowledge, search_knowledge, get_idea, list_briefs]
---

# Brief Core (`ssc-brief-core`)

You are the **shared, channel-agnostic** half of brief authoring. A caller hands
you one idea and an angle spec; you return the idea's **hero** and a set of
**scored narrative field sets** ready for that caller to save.

**You write nothing.** You hold no mutation tools — no `save_brief`, no
`save_idea`, no `edit`. Every write belongs to the caller, which knows its
own channel's storage shape. This is what makes you safe to share.

## What you do NOT decide

Four things are the caller's, and guessing at them is how a shared skill starts
serving neither channel:

- **How many angles this idea gets.** The caller passes `angle_count`. A post is
  **exactly one** — one idea is one post, and its single brief is what production
  is keyed on. An ad fans out to one angle per fitting persona × route. You never
  infer this from the channel name.
- **Which angle.** The caller passes the angle spec — persona, route, the anchor
  that channel uses, the **awareness stage** (every channel that briefs declares
  one), and — only where the channel has media layers — the **layer**. You turn a
  chosen angle into fields; you do not choose it, and you never re-diagnose a
  stage or re-home a layer the caller declared. A caller that hands you no stage
  is a **legacy** caller: proceed on the rest of the spec and report the absence,
  never diagnose one in its place.
- **The idea's MECHANISM.** It lives on the idea, resolved once above you, and is
  handed to you. You write *to* it — never restate it, never vary it on your own
  initiative, never invent one when the caller has none. The **one** bounded
  exception is the **angle-local override** in Step 4: where the inherited
  mechanism does not serve this angle's persona × route, you may return an
  override **for that one angle**, under every condition Step 4 states. Even then
  the idea's own mechanism is still not yours — it is never written, patched or
  demoted, and the override is returned for the caller to persist, never saved
  here.
- **Where any of it is stored**, and whether anything is approved.

### The one thing NOBODY declares at brief time — the LEAD

A brief declares the **awareness stage** (and, where the channel has one, the
**layer**). It does **not** declare a **lead**, and neither do you: no field you
return may name one, imply one, or be written so that only one lead could cash it
out. The **writer** picks the lead per asset, from the set the declared stage
admits — read live from `craft/awareness-framework` §7 at writing time, never from a
list restated here.

The reason matters, because "just decide it earlier" looks tidier and is wrong:

- The awareness→lead mapping is **overlapping by design** — one stage admits
  two or three leads — and **that overlap is exactly where coverage lives**. Fix
  the lead at brief time and the overlap collapses to a point.
- It would cost an **operator approval per lead**. Spanning four leads on one
  angle would mean four briefs approved for **one creative decision** — the same
  persona, route, anchor, stage and layer, differing only in a choice nobody has
  made yet.
- It removes the **only axis that changes the first line**, which is precisely
  the part the ~125-character fold puts in front of the reader. Fixing it at
  brief time freezes the one variable worth varying.

So a `hook_direction` names the **route** and the **anchor** it works from, and
stops there. If you find yourself writing a hook that only one lead type could
open, you have written the writer's decision into the brief — rewrite it.

### The diversity boundary — who owns which half

Diversity has two halves and they live in different places. Getting this wrong
means either nobody checks or both do:

| | Owner | Scope |
|---|---|---|
| **Route / angle COVERAGE** | the **caller** | across the whole batch of ideas |
| **Field-level repetition** | **you** | within the sets you return for THIS idea |

**Coverage is structurally not yours.** Whether a month's thirty posts spread
across the persuasion routes is a property of the batch, and you only ever see one
idea. The caller keeps the running tally and passes each route in already decided.

What you DO owe on the angle you were handed is a **fit check**: the route must
suit this idea's own frame and journey stage. A `stage-0` idea whose reader does
not yet admit the problem cannot carry a `comparison` route; a founder-story idea
is `proof` far more naturally than `problem`. **If the route does not fit, say so
and return it as below bar** — do not quietly write fields for an angle that
cannot work. That is the one angle judgement you make, and it is about fit, never
about spread.

## Inputs (from the caller)

- `idea` — the idea row: at minimum `id`, `title`, `channel`, `version`, its
  `mechanism` (see below), and its taxonomy `tags` (pillar / persona / value /
  entry / frame / journey_stage).
- `idea.mechanism` — **why the thing works, or why past attempts fail**, resolved
  once on the idea above you and inherited by every angle beneath it. Carried,
  not authored — and departed from only through Step 4's bounded **angle-local
  override**, which is returned, never saved, and never written back onto the
  idea. If the idea is a legacy row that carries none, proceed and **report the
  absence** — never invent one to fill the gap, and never use the override
  permission to fill it (an override departs from a mechanism; it does not
  supply a missing one).
- `angle_count` — how many field sets to return. **1 for post.**
- `angles[]` — one spec per requested set:
  `{ persona, route, anchor, awareness_stage?, layer? }`, where `anchor` is the
  concrete thing this angle attacks (a belief, a trigger, an objection, a myth)
  named by the caller. `awareness_stage` is the caller's declared reading of what
  this reader already knows, and **every channel that authors a brief declares
  one — posts included**. `layer` is the caller's declared **media home**, and
  only a channel that has media layers has one (ads do; a post has none). You
  carry both, and you never derive or revise either. **No spec ever carries a
  lead type**;
  if one arrives, ignore it and say so — that decision is the writer's.
- `grounding` — the caller's already-loaded context: the month's guidance (a
  channel Approaches doc or equivalent), plus which KB docs it read. **This is an
  optimisation, not a substitute:** Step 1's list is read live regardless of what
  the caller says it already has, because a caller that read a doc for a different
  purpose may not have held the part you need. `grounding` only lets you skip
  re-reading the month's guidance itself. That **approved Approaches document is
  also the sole source** of the attributed voice-of-customer item an override
  must be grounded in (Step 4) — you run no voice-of-customer pass of your own
  and open no second outward account of the period.
- `taken` — the briefs that already exist for this idea. Empty by construction on a
  single-angle channel; see **Step 3**. Cross-idea repetition is NOT passed here and
  is not yours — see the diversity boundary.

## Procedure

### Step 1: Load only what the caller did not

The caller has already read the month's guidance and the personas. You need, and
should read live rather than assume:

- `craft/doctrine` — **§1 the chain** (what the spine actually is) and **§2 the
  mechanism** (what a mechanism is, and what writing *to* one means). This is the
  doc that governs Step 4's mechanism rule — the inherited mechanism you carry and
  any angle-local override you return are judged against the **same** §2
  definition; never restate it here.
- `craft/mechanism-bank` — the brand's standing supply of mechanisms. You read it
  so that an override can be **bank-first** (Step 4): a fitting entry is preferred
  to authoring one. Read it live and name entries by their `id` as the live
  document lists them — never an `id`, a mechanism sentence or a `fits` phrasing
  remembered from a previous run, and never one written into this file.
  **`craft/mechanism-bank` is scoped to override consideration, not to every run**:
  read it live whenever an angle-local override is being considered, and a failed
  read of it authorises **no** override this run — every angle falls back to the
  inherited mechanism or is dropped as a misfit, and the gap is named plainly
  rather than left silent — never a run halted, never a remembered bank, and never
  an override authored without a successful live read. A run that authors no
  override does not need it.
- `rules/compliance` — **read it whenever you propose an override**, because an
  override whose only proof route that doc refuses is **dropped**, not softened
  (Step 4). A run that authors no override does not need it.
- `ad/layer-tones` — the **per-layer close JOB**, and the source for `cta`'s
  demotion to direction only. **Read it whenever the angle spec declares a
  `layer`**; skip it only on a channel that has no layer at all.
- `brand/angles` — the value / entry / against / experience dimensions and the
  frame codes. This is the vocabulary the fields are expressed in.
- `brand/proof-points` — what the brand may actually claim, for `core_message`
  and any proof phrasing.
- `rules/banned-words` — checked against every Vietnamese string you return.
- **The ENTIRE `voice` category** — load it with `get_knowledge(categories: ["voice"])`,
  never as an enumerated path list. All of it applies: tone, the pronoun rules, the
  vocabulary, the Vietnamese-language rules and the founder voice. A hardcoded subset
  is how this skill shipped 7 titles addressing the reader as "chị" when
  `voice/pronouns` says public posts use "bạn" - the doc was simply never loaded.
- The angle's persona detail doc (`brand/persona-<slug>`) when the caller has not
  already supplied its trigger list. Resolve `<slug>` mechanically from the `code`
  **as `brand/personas` lists it**, with the `chi-` prefix stripped — you hold no
  `list_taxonomies` and do not need one, since the roster doc carries the codes.
  Never hardcode a path list, so a persona added or retired needs no change here.

`search_knowledge` only when an anchor names something these do not cover and you
need the brand's own position before writing a field about it.

**Verify the load, and STOP on a failed read.** `get_knowledge` returns `found`
**and** `missing` — read `missing` every time. If any doc above is missing, retry
once; if it still does not resolve, **STOP and say which doc could not be read.**
Do **not** proceed from a remembered version and do **not** fall back to a
softer rule: these docs *are* the rules, two sources of truth for a compliance
rule is the drift this repo has already been burned by, and a stopped run is
recoverable in a way a silently-stale one is not. Two docs above —
`craft/mechanism-bank` and `rules/compliance` — are scoped differently, and the
scoping is stated here so the blanket rule is never read as overriding them:

- **`craft/mechanism-bank` in `missing`** — retry once; if it still does not
  resolve, no standing supply means an override could not be **bank-first** and
  would be invented blind against a library you cannot see. **`craft/mechanism-bank`
  is scoped to override consideration, not to every run**: read it live whenever an
  angle-local override is being considered, and a failed read of it authorises
  **no** override this run — every angle falls back to the inherited mechanism or is
  dropped as a misfit, and the gap is named plainly rather than left silent — never
  a run halted, never a remembered bank, and never an override authored without a
  successful live read. Name the gap in what you return to the caller, and never
  treat "I recall no fitting entry" as evidence that none exists. A run that authors
  no override is otherwise unaffected by this doc.
- **`rules/compliance` in `missing`** — retry once; if it still does not resolve,
  **no angle-local override may be authored this run.** Every angle falls back to the
  inherited mechanism (or is dropped as a misfit), and the gap is named plainly in
  what you return to the caller rather than left silent. Never author an override you
  could not compliance-check, never proceed from a remembered version of the doc, and
  never soften or re-trace a route to get around the gap — an override whose only
  proof route that doc refuses is still **dropped**. Never a halted run: a run that
  authors no override is otherwise unaffected by this doc.

### Step 2: Resolve the HERO — once per idea, before any field

The hero is the idea's **core concept, stated at full strength in about five
Vietnamese words.** It is per **idea**, not per angle — several angles on one idea
share one hero.

**`ssc-ads-brief` Step 1a is the single definition; apply it unchanged.** Its three
tests, restated only so you can fail a hero without leaving this file:

- It is the **core concept** — not a detail, not a scene, not the situation the
  idea sits in.
- It is a **STRONGER version of the title, never an explanation of it.** It should
  read as something that could REPLACE the title and hit harder. The moment it
  describes what the title refers to, or supplies the reasoning behind it, it has
  become a `core_message` and is wrong.
- It is **short — around five words.** A sentence long enough to argue is long
  enough to explain.

Worked shape: title *"Vì sao ăn ít lại mà vòng 2 vẫn tăng sau tuổi 45"* → hero
**"Ăn ít không còn đủ."** A purpose statement like *"the reader recognises that her
stalled progress has a mechanism, not a discipline problem"* is NOT a hero — it is
the `core_message`, and a hero written that way fails all three tests at once.

- If `idea.hero` is already set, **read it and keep it.** Do not silently replace
  an operator's hero. If it plainly contradicts the angle spec, say so and let
  the caller decide.
- If it is empty, derive it from the idea's title and return it for the caller to
  write via `edit(entity='idea', id, patch = { hero }, expected_version)`.
- **On `stale_version` at that write, the caller must re-read and RE-DERIVE.** The
  hero derives from the title, so a moved version most likely means an operator
  just edited that title.

### Step 3: The taken set — read before proposing, not after

Call `list_briefs` for the idea and hold every existing brief **whatever its
status**, draft and approved alike. Compare on the **five narrative fields**, not
on labels: two briefs with different persona labels that open on the same line
and carry the same argument are the same brief.

**On a single-angle channel this set is empty by construction, and that is not a
pass.** A post idea has exactly one brief and it is the very row about to be
written — its five fields are all null, so comparing against it always succeeds and
tells you nothing. Do not report "taken set clear" as evidence of anything on a
post. The only repetition a post can have is **against its sibling ideas**, which
you never see; that check belongs to the caller and is listed in the diversity
boundary above.

So: this step does real work for **ads** (an idea accumulating angles across runs)
and is inert for **posts**. Say which case you were in when you report.

### Step 4: Derive the five fields per angle

For each requested angle, write, in Vietnamese:

- **`hook_direction`** — what the opening does. Not the finished line: the
  strategy for it. Must obey the month's guidance on openings, and must ride the
  angle's `anchor` rather than a generic pain. It names the **route** and the
  **anchor** — never a lead type, and never a strategy only one lead could open
  (see *The one thing NOBODY declares at brief time*).
- **`core_message`** — the single argument, one sentence. This is what the hero
  is cashed out as. If it does not serve the hero, the angle is wrong. It must
  be **compatible with this angle's resolved mechanism** — the inherited one, or
  the angle-local override where this angle carries one (see below) — and every
  lead the declared stage admits has to be able to reach it.
- **`why_now`** — why this month, tied to something real in the month's guidance
  (a date, a seasonal trigger, a signal). No evergreen filler; "always true" is a
  failed `why_now`.
- **`story_moment`** — one concrete, sensory scene that grounds it. A time of day,
  a room, an object, a specific action. Abstractions are not moments.
- **`cta`** — a **DIRECTION, not wording.** Name what the close should *do* for
  this angle in a few Vietnamese words; never hand down a finished call-to-action
  sentence for the writer to paste.

**Carry the mechanism; never restate it — and depart from it only through the
bounded override.** The mechanism is the idea's, resolved once above you
(`idea.mechanism`) and inherited by every angle beneath it. Your default, and the
outcome on the overwhelming majority of angles, is to write **to** it: your fields
must be consistent with the angle's resolved mechanism — the inherited one, or the
override where this angle carries one — and must leave the writer able to hit the
mechanism beat. They must **not** reproduce it as a field of their own, paraphrase
it into `core_message`, sharpen it or soften it.
**Writing *to* a mechanism is not reproducing it** — that distinction is
`craft/doctrine` §2's, read live; never restate the definition here.

**You never vary the inherited mechanism on your own initiative.** There is
exactly one exception, and it is not an initiative: the **angle-local override**
below, which opens only where the inherited mechanism genuinely **does not serve
this angle's persona × route**. An angle that *can* be written to the inherited
mechanism is never overridden merely because a different mechanism would also
work — that is drift wearing a permission's clothes.

**This rule does not branch on channel.** You are shared, so it is stated once and
applies wherever you are called: a channel whose idea gets exactly one angle simply
has one angle that could override, and a channel that fans out has several. Nothing
here reads the channel name, and no caller keeps a channel-shaped copy of this rule
— a copy diverges the day one side is edited, and the stale one wins wherever it is
read first.

**The angle-local override, and every condition that bounds it.** All of these
hold together; a candidate override that fails any one of them is **not
authored**.

- **Bank-first.** Source it from `craft/mechanism-bank`, read live: a fitting bank
  entry is preferred, and the override then names the `bank_id` it came from. Only
  where **no** entry fits do you author a new mechanism, and it is then marked
  **`in_bank: false`** so an invented mechanism is visibly invented. Never name a
  bank entry, an `id` or a sentence from memory.
- **Judged against `craft/doctrine` §2, read live.** An override meets the **same**
  definition every other mechanism meets — no weaker bar because it arrived late in
  the pipeline. The definition is not restated here, and a failed read of that doc
  **stops the run** and names it rather than falling back to a remembered version.
- **Grounded in an attributed voice-of-customer item from the approved Approaches
  document for this period.** You run **no** voice-of-customer pass of your own and
  open **no** second outward account of the period — you hold no tool for it and
  must not improvise one out of `search_knowledge`. A phrase you cannot attribute
  to that approved document supports **no** override; the angle falls back to the
  inherited mechanism or returns below bar.
- **Proof-routed from this period's stated proof inventory**, on exactly the terms
  an Approaches candidate is. Where the period states no inventory, the route is
  marked **unverified for the period** rather than assumed.
- **Dropped — not softened, not re-traced — if `rules/compliance` refuses its only
  route.** Never soften the claim and never re-trace it onto a family that document
  did not clear: routing around a refusal by moving the mechanism down one level is
  the one direction this permission must not open. The angle then falls back to the
  inherited mechanism, or returns below bar.
- **Angle-local, always.** `idea.mechanism` is **never** written, patched or
  demoted — you hold no tool that could, and you never ask the caller to do it for
  you. Sibling angles on the same idea are **never** re-opened, re-run, re-scored
  or reported stale because this angle overrode. The guarantee this system makes is
  **one angle, one mechanism** — never *one subject, one mechanism*.
- **Always reported.** Every override comes back naming the angle it applies to,
  the inherited mechanism it departed from, **why** that mechanism does not serve
  this angle's persona × route, and its provenance — the `bank_id`, or
  `in_bank: false`. A departure a human cannot see is indistinguishable from
  drift, so the report is not optional prose.

**You persist none of it.** You hold **no mutation tool**: the override is
*returned* to the caller, which owns every save. Where the caller cannot persist it
— `briefs.mechanism` not yet available on the server — the correct outcome is
**reported, not persisted**, said plainly in those terms so the absence is not read
as a dropped write. It is never smuggled into another field: not into a narrative
field, not into the angle label, and never onto the idea.

**What still fails.** An angle that can be written to **neither** the inherited
mechanism **nor** a defensible override is a **misfit angle**: return it below bar
and say so. The override is not an escape hatch for a weak angle — it is for the
case where the *angle* is right and the *inherited mechanism* is wrong for it. And
if the idea carries no mechanism at all (a legacy row), proceed and **name the
absence in the return** rather than authoring one here: an override departs from a
mechanism, it does not supply a missing one.

**`cta` is subordinate to the layer's close job — the layer rule always wins.**
Where the angle spec declares a `layer`, the close is governed by the per-layer
close **job** in `ad/layer-tones`, read live: what the layer's close is *for* —
qualifying, doing neither, or pre-selling. That doc's CTA phrasings are
**non-exhaustive illustration**, not a menu to pick from and not a wording
contract. So:

- Your `cta` is a direction that **serves** that layer's job; it never overrides,
  narrows or contradicts it.
- Where the two disagree — including on a brief written before the layer's job
  changed — **the layer rule governs and your `cta` yields.** Downstream, the
  writer treats the layer as authoritative and corrects a mismatched `cta`; a
  `cta` that fixes wording only guarantees that correction happens silently.
- A `cta` that names a specific close sentence, or that would push a layer to do
  a job that is not its own, is **wrong even if it reads well** — cut it back to
  a direction.

Every field traces to the hero or to the angle's anchor, is consistent with the
angle's **resolved** mechanism (the inherited one, or its override), and — where a
layer is declared — leaves that layer's close job intact. A field that traces to none of those is decoration — cut it.

### Step 5: Score, drop, regenerate

Self-score each field set **1–5** with a **one-line Vietnamese comment** stating
the single biggest reason for the number.

**Caps that override any other merit** — a set carrying any of these cannot score
above 3:

- a banned word or compound from `rules/banned-words`
- a claim `brand/proof-points` does not support
- a `why_now` that would be true in any month
- a `story_moment` that is not a concrete scene
- a field that contradicts the hero
- duplication of an existing brief in the taken set on the five fields
- **a field that declares, names, or forces a lead type** — including a
  `hook_direction` only one lead could open
- **a field that restates, sharpens, softens or contradicts the angle's resolved
  mechanism** instead of writing to it — and any field that varies the inherited
  mechanism **without a declared, reported override**, which is drift, not an
  override
- **an override that fails any one of Step 4's bounding conditions** — not
  bank-first, not judged against `craft/doctrine` §2 read live, not grounded in an
  attributed voice-of-customer item from the approved Approaches document, not
  proof-routed from this period's inventory, softened or re-traced after a
  compliance refusal, touching `idea.mechanism` or a sibling angle, or not reported
  with its `bank_id` / `in_bank: false`. A set whose override fails a condition is
  capped **and** the override is withdrawn — the angle falls back to the inherited
  mechanism or returns below bar
- **an override authored where the inherited mechanism does serve this angle's
  persona × route** — the override is for a misfit, never a preference
- **a `cta` that fixes wording rather than a direction, or that pulls against the
  declared layer's close job** in `ad/layer-tones`

Anything **≤ 3 is dropped and regenerated**, bounded at **two attempts per
angle**. If a slot still cannot reach 4 after two attempts, return the best
attempt **flagged as below bar with the reason** — do not inflate the score to
exit the loop, and do not silently return a weak set as if it passed.

Use the full range. Everything scoring 5 means the scoring is not working.

### Step 6: Audit the set, then return

Audit **only what you produced for this idea, plus a non-empty taken set** — the
scope in the diversity boundary above. With `angle_count: 1` the first three checks
have nothing to compare and are reported as not applicable, not as passed.

- No two sets share the same opening strategy. *(≥2 sets only)*
- No two sets share the same `story_moment` shape. *(≥2 sets only)*
- `why_now` reasons are distinct, not one seasonal fact restated. *(≥2 sets only)*
- Every set's fields are mutually consistent — hook, message and cta argue the
  same thing. *(always)*
- The route FITS this idea's frame and journey stage. *(always — see the fit check
  in the diversity boundary; a misfit returns below bar)*
- **No set declares or forces a lead**, and every set stays open to every lead its
  declared stage admits. *(always)*
- **Every set is written to its resolved mechanism** — the idea's inherited one, or
  the angle-local override this angle declared — and none restates it or varies the
  inherited one without a declared override. *(always; on a legacy idea with no
  mechanism, report the absence instead)*
- **Every override clears all of Step 4's bounds and is reported** with the angle,
  the mechanism it departed from, the reason it does not serve that angle's
  persona × route, and its `bank_id` or `in_bank: false`. `idea.mechanism` is
  untouched and no sibling angle was re-opened, re-run or reported stale.
  *(whenever any set overrides)*
- **Every `cta` is a direction, not wording, and serves its declared layer's close
  job.** *(whenever a layer is declared)*

**Never report a batch-level verdict.** You cannot see the batch. Cross-idea
repetition and route coverage are the caller's audit, and claiming them here would
be a pass nobody actually ran.

Then return to the caller:

```
hero:            <one sentence, or "unchanged">
mechanism:       <the idea's mechanism, carried through verbatim — or
                  "absent (legacy idea); not authored here">
sets:            [ { angle, hook_direction, core_message, why_now,
                     story_moment, cta, score, comment, below_bar?,
                     mechanism_override? } ]
overrides:       [ { angle,
                     mechanism,          # Vietnamese, the override sentence
                     bank_id | in_bank: false,
                     departed_from,      # the inherited mechanism, verbatim
                     reason,             # why it does not serve this
                                         #   angle's persona × route
                     voc,                # the attributed item from the
                                         #   approved Approaches document
                     proof: { family, trace,
                              verified | unverified_for_period },
                     persistence } ]     # "caller persists" — or
                                         #   "reported, not persisted:
                                         #    briefs.mechanism not available"
                 # or: "none — every angle carries the idea's mechanism"
taken_compared:  <N briefs>
audit:           <PASS, or the specific violations you could not resolve>
declared:        <awareness stage as the caller declared it, echoed back
                  unchanged — or "absent (legacy caller); not diagnosed here" —
                  plus the layer, or "no layer (channel has no media home)">
lead:            not declared — the writer picks it per asset, from the set the
                  declared stage admits
```

`mechanism` is echoed so the caller can see it was carried, not re-authored;
`declared` is echoed so a caller can see its stage/layer arrived intact. The
`lead` line is a constant, not a value you compute — it is there so a reader of
the return can never mistake its absence for an omission. **`overrides` is never
omitted**: a run in which no angle overrode says so in that line, because "no
overrides" and "overrides not reported" must never look the same to a reader.

The caller saves. You do not — **you hold no mutation tool**, so an override is a
returned value, never a write. If the caller cannot persist it, that is stated as
*reported, not persisted*; it is never written into another field and never onto
`idea.mechanism`.

## Output

- One hero per idea (new, or reported unchanged)
- The idea's mechanism, carried through — or its absence reported, never filled in
- Every **angle-local mechanism override**, each naming the angle, the mechanism it
  departed from, why that mechanism does not serve the angle's persona × route, its
  `bank_id` or `in_bank: false`, and whether the caller can persist it — or an
  explicit "none: every angle carries the idea's mechanism". Never a write: this
  skill holds no mutation tool and the caller persists
- `angle_count` scored field sets, each with its Vietnamese comment
- The caller's declared awareness stage + layer, echoed back unchanged
- **No lead type, ever** — that decision belongs to the writer
- Any set still below bar, flagged with why
- A diversity audit result

## Governance

- **Holds no mutation tools.** Propose-only by construction, not by promise: this
  skill cannot write, approve, publish, or delete anything. The caller owns every
  save and is where the propose-only rules are enforced.
- Never calls `approve` (the ONLY gated promotion; the approval hook denies it to
  agents), never publishes, never uses `edit` to demote or unapprove.
- **Never assumes a channel's fan-out.** `angle_count` comes from the caller. A
  post gets exactly one; nothing here may quietly produce more.
- **Never overwrites an operator's hero** — read it, keep it, and escalate a
  genuine contradiction instead of resolving it.
- **Never declares a lead (hard rule).** A brief declares the **awareness stage**
  — on every channel that briefs, posts included — and, where the channel has a
  media home, the **layer** — never a lead type. No returned
  field may name one or admit only one. The **writer** picks the lead per asset
  from the set the declared stage admits, read live from
  `craft/awareness-framework` §7. The mapping is **overlapping by design** and that
  overlap is where coverage lives: fixing the lead here would cost one operator
  approval per lead for a single creative decision, and would freeze the one axis
  that changes the first line — the part the ~125-character fold exposes.
- **Never restates a mechanism, and never varies one on its own initiative (hard
  rule).** The mechanism lives on the **idea**, is inherited by every angle beneath
  it, and is written **to**, never reproduced — writing *to* a mechanism is not
  reproducing it, per `craft/doctrine` §2 read live. An idea that carries none has
  its absence **reported**, never filled in.
- **The angle-local override is the ONE bounded exception, and every bound is a
  hard rule.** It opens only where the inherited mechanism does not serve **this
  angle's persona × route** — never because another mechanism would also work — and
  only when **all** of the following hold: sourced **bank-first** from
  `craft/mechanism-bank` read live (naming its `bank_id`, or marked
  **`in_bank: false`** where nothing fits); judged against **`craft/doctrine` §2
  read live**, the same definition every other mechanism meets; **grounded in an
  attributed voice-of-customer item from the approved Approaches document** for
  this period, this skill running **no** voice-of-customer pass and opening no
  second outward account of it; **proof-routed from this period's stated
  inventory**; and **dropped — not softened, not re-traced —** where
  `rules/compliance` refuses its only route. Fail any one and no override is
  authored: the angle falls back to the inherited mechanism or returns below bar.
- **An override's blast radius is one angle (hard rule).** `idea.mechanism` is
  **never** written, patched or demoted, and sibling angles are **never** re-opened,
  re-run, re-scored or reported stale. The guarantee is **one angle, one
  mechanism** — never *one subject, one mechanism*.
- **Every override is reported (hard rule).** Naming the angle, the mechanism it
  departed from, the reason, and its `bank_id` or `in_bank: false`. A run with no
  override says so. An override a human never sees is drift.
- **The override persists nothing here.** This skill holds no mutation tool, so an
  override is returned for the **caller** to save. Where the caller cannot save it,
  the outcome is **reported, not persisted**, stated in those words — never
  smuggled into a narrative field, an angle label, or `idea.mechanism`.
- **An override is never an escape hatch for a weak angle (hard rule).** An angle
  that can be written to neither the inherited mechanism nor a defensible override
  is a **misfit angle**: returned below bar, and said so.
- **`cta` is a direction only, and the layer rule always wins (hard rule).** No
  returned `cta` fixes wording. Where a layer is declared, the per-layer close
  **job** in `ad/layer-tones` governs — that doc's CTA phrasings are
  non-exhaustive illustration — and a `cta` that pulls against it yields to it.
- **Never hard-codes KB content.** Name the doc and its section and read it live —
  the doctrine and its mechanism, the mechanism bank, the compliance rules, the
  per-layer close job, the lead taxonomy and its awareness mapping, personas and
  their triggers, the angle vocabulary, the proof points, the banned words. No
  persona names in closed lists, no lead roster written out here, no remembered
  trigger — and **no mechanism sentence, no bank `id` and no `fits` phrasing
  written into this file**, because the bank is revised on its own cadence and a
  baked-in copy would outrank the live document it was meant to reflect.
- **A failed KB read STOPS the run (hard rule).** Check `missing` on every load,
  retry once, then stop and name the doc. Never proceed from a remembered
  version and never substitute a softer rule for one you could not read.
  **`craft/mechanism-bank` and `rules/compliance` are scoped differently, not
  softer** — each is load-bearing only for an angle-local override.
  **`craft/mechanism-bank` is scoped to override consideration, not to every run**:
  read it live whenever an angle-local override is being considered, and a failed
  read of it authorises **no** override this run — every angle falls back to the
  inherited mechanism or is dropped as a misfit, and the gap is named plainly
  rather than left silent — never a run halted, never a remembered bank, and never
  an override authored without a successful live read.
- All returned prose is **Vietnamese**; reasoning back to the caller may be the
  operator's language.
- Requires `view` only.
