# Design — proof substantiates the mechanism

## Context

This plugin is **prose**. There is no compiled code in the path this change touches, no
module boundary to move, and no test harness for skills. The only executable artifact in
the repo is `plugins/ssc/hooks/approval-gate.mjs`, which this change does not go near. So
every decision below is about **wording and where a rule lives** — which file, which step,
which of the three judgement levels a sentence binds at — not about data flow.

**Current state.** Proof and mechanism run as two independent rails in all three writing
skills:

- **The mechanism rail is read-only and judged alone.** `brief.mechanism` is read once
  (`ssc-ads-writer` Step 1, `ssc-post-produce` Step 2, handed to `ssc-post-authority` in
  its Inputs), a mechanism beat is written from it, and `craft/copy-floor` mục 1 is
  satisfied by the beat's *presence* and its *fidelity* to that field.
- **The proof rail is tied to the hook.** Each proof point must answer the pain the hook
  opened (`ssc-ads-writer` SKILL.md:437, `ssc-post-produce` SKILL.md:394-401), must
  survive the competitor-swap test (`ssc-ads-writer` SKILL.md:438, 562), and the SET must
  surface ≥3 distinct points spread across `proof_device` families (`craft/coverage` §4.2,
  read live).

Nothing joins them. A variation can clear the six-item floor, span its axes, and press
three concrete proof points that all answer the hook — while the mechanism sentence, the
one thing that persuades at the market-saturation position `craft/awareness-framework` §2
states for this category, rests on nothing.

**The constraint that shapes every decision below.** The repo's hard convention is *never
hard-code KB content into a skill — name the doc and read it live*. `brand/proof-points` is
revised on its own cadence and its rows have been corrected more than once. So this change
may add a **rule that points at** `brand/proof-points`; it may not add a proof row, a
figure, a family name, or an example line to any skill file.

**The second constraint.** `craft/copy-floor` owns the six-item floor and
`craft/doctrine` §2 owns the mandatory-mechanism rule. Neither is edited here (the proposal
puts both explicitly out of scope). That fixes the binding level available to this change
before any wording is written: whatever is added must sit **beside** the floor, never
inside it.

## Goals / Non-Goals

**Goals:**

- Bind the three links — hook → mechanism → proof — into one stated chain in the three
  skills that compose and judge `copy` and `image_content`.
- Make the mechanism beat **proof-backed**: it leans on at least one row of the live
  `brand/proof-points` table, and the row is named on the record the operator reads.
- Sharpen the existing hook↔proof rule from "answers the hook" to "**enhances** the hook".
- Move the competitor-swap failure from an after-the-fact score penalty to a
  **composition-time cut of the offending line**.
- Keep the three skills saying the same thing, so the authority never grades a post
  against a bar the writer was not given.
- Ship the whole thing without a KB revision, a new floor item, a new tool, or a server
  change.

**Non-Goals:**

- **No new floor item.** `craft/copy-floor` is untouched, so there is no `/ssc-kb` run and
  no KB revision in this change.
- **No change to `craft/coverage` §4.2** — the ≥3-distinct proof bar stays set-level, on
  every section, on both channels.
- **No change to the `proof_device` coverage axis** — which family each asset presses, and
  the requirement that the set spread across families, are untouched.
- **No REJECT and no regenerate-on-its-own-axis pass** is created by this change. An
  unbacked mechanism is not a floor failure.
- **No change to how a mechanism is settled.** `brief.mechanism` stays read-only in all
  three skills; none of them authors, back-fills, or re-opens a brief to add one.
- **No new MCP tool, no new field** on `briefs` or `contents`, no server change.
- **No change to the propose-only invariant** — no skill gains `approve_*`, `unapprove_*`,
  or any publish/schedule tool.
- **No change to the early-stage proof-free educational/curiosity `description` variant**
  (`craft/copy-floor`, mục ghi chú riêng cho section `description`).

## Decisions

### D1 — The chain is stated once, as three links, and every skill states the same three

```
HOOK       opens a specific tension
  ↓
MECHANISM  (brief.mechanism) explains why it resolves
  ↓
PROOF      ≥1 traced brand/proof-points row SUBSTANTIATES that mechanism
           — and every proof pressed must ENHANCE the hook, not sit beside it
```

Stating it as a chain rather than as three unrelated bullets is the point: the failure
being fixed is precisely that hook↔proof and mechanism→floor were each individually
satisfiable while the middle link went unchecked. Each skill states the chain at the place
it acts on it — composition for the writers, judgement for the authority — and none of
them restates the other's consequence.

> Rejected: adding the chain as a fourth "doctrinal" block near the top of each skill.
> Every skill in this repo deliberately keeps rules at the step that applies them, so a rule
> stated up front and applied 400 lines later is the shape that goes stale.

### D2 — Rule 1: the mechanism must be proof-backed, and the record names the row

Every `copy` variation's mechanism beat leans on **at least one row of the live
`brand/proof-points` table**, and the record the operator reads **names which row**.

Two consequences that must be explicit in the wording, because both have been got wrong
before in this pipeline:

1. **Other proof points stay free.** Only *one* row must back the mechanism. Every other
   proof the variation presses answers the hook's tension without routing through the
   mechanism. Rule 1 is a floor under the mechanism, not a funnel every proof passes
   through.
2. **A blank `brief.mechanism` makes the rule INERT.** There is nothing to back.
   Production proceeds, the absence is reported exactly as it is today (`ssc-ads-writer`
   Step 1b(iv) / SKILL.md:646, `ssc-post-produce` SKILL.md:139-140 / 514,
   `ssc-post-authority` SKILL.md:428-430 / 596), and **nothing is invented** to give the
   rule something to bind to. The rule never becomes a reason to author a mechanism.

**Where "names the row" is recorded, per skill** — this differs because the three skills
hold different write surfaces, and the design must say which each one uses:

| Skill | The record | Language |
|---|---|---|
| `ssc-ads-writer` | the variation's `comment` (persisted, Vietnamese) + the Step 9 summary line | Vietnamese in the `comment`; the summary line is operator-facing |
| `ssc-post-produce` | the per-variation hand-off line in Step 4/Step 5 (in-conversation, unsaved — it holds no `comment` and writes no score) | operator-facing chat |
| `ssc-post-authority` | the variation's `comment` (persisted, Vietnamese) + the Step 7 report line | Vietnamese in the `comment` |

### D2b — Rule 1's search starts in the mechanism's own proof family, and may reach beyond

A mechanism is not family-agnostic. `brand/proof-points` § Bốn Nhóm Bằng Chứng owns four
adopted proof families, and a mechanism — a claim about *why* something works — argues
from one of them by what it says. So the search for its backing row **starts there**, and
may then reach beyond it.

**Why start there.** Without a starting point, "find a row that backs the mechanism"
resolves to whichever row is easiest to phrase — and the row that most obviously
substantiates the claim gets skipped precisely because a weaker one was closer to hand.
Naming the family the mechanism already argues from makes the obvious backing the first
thing looked at, not the last.

**Why it is not a fence.** A row outside the family may substantiate the mechanism better,
and corroboration across families is legitimate — this is the one place the rule wants
breadth. So beyond-family rows are allowed outright, not permitted-with-justification.

**How the family is resolved — read, never looked up.** The writing skills see
`brief.mechanism`, a Vietnamese sentence, and nothing else. The `mechanisms` bank records
a `proof_family` per entry (`mechanism-bank` spec) and a settled mechanism carries a proof
route (`angle-mechanism-authoring`), but **provenance is report-only — there is no
`briefs.mechanism_slug`** (`angle-mechanism-authoring` spec), so the writer cannot resolve
a bank entry from the brief. The family is therefore read from the **mechanism sentence
against the live § Bốn Nhóm Bằng Chứng**. This adds no tool to any skill, needs no server
change, and avoids matching a sentence back to a slug by resemblance.

**The one guardrail: a reach-beyond must be visible.** `angle-mechanism-authoring`
requires that a mechanism whose only proof route is refused be **dropped — not softened,
and not re-traced onto a family the compliance document did not clear**. That governs the
brief, where the route is settled. At production time the analogous hazard is a backing
row drifting to another family silently, which reads downstream as a re-trace nobody
agreed to. The rule therefore requires the report to **say when the backing row sits
outside the mechanism's own family**. Visible corroboration is fine; invisible re-anchoring
is what the report line prevents. This is a report obligation only — it caps nothing extra
and rejects nothing.

### D3 — Rule 2: proof enhances the hook (a sharpening, not a new rule)

The existing rule — "every proof must answer the pain the hook opened" — is **kept and
sharpened**, not replaced. A proof earns its place by making the opening tension land
**harder**; a proof that is true, on-topic, and adds nothing to the tension the hook named
is not doing the hook's work. The existing "service brochure" / "unanswered-question proof"
language stays; the sharpening is added to it.

> Rejected: replacing "answers" with "enhances". The existing sentence carries a well-worn
> failure mode (the Cambridge section as a feature list) that the new phrasing does not
> convey on its own. Both are kept, in that order.

### D4 — Rule 3: the competitor-swap failure becomes a composition-time CUT of the line

A proof line that **survives** the competitor-swap test — swap "Cambridge" for another
wellness brand and the sentence still reads true — is **removed before emit**, at
composition, rather than scored down afterwards.

**It cuts the LINE, never the VARIATION.** This is what keeps Rule 3 out of the floor: it
is a composition rule, so it triggers no REJECT, no regenerate-on-its-own-axis pass, and it
changes nothing about the six-item floor or `craft/copy-floor`.

Two interactions the wording must handle, or the cut creates a new failure:

- **A cut line is replaced, not simply deleted.** The variation still presses the
  `proof_device` family its slot was assigned. Cutting a swappable line and shipping the
  variation proof-less would trip the existing "a variation leaning on nothing distinctive
  cannot score ≥4" item (`ssc-ads-writer` SKILL.md:555). The rule reads: cut the swappable
  phrasing and write the concrete form the live `brand/proof-points` row actually carries;
  if the assigned family has no usable concrete row this run, say so — never keep the
  generic paraphrase because it fills the slot.
- **The cut never moves the variation's axis position.** The assigned lead / proof device /
  register / length band are unchanged by a cut. This matters because `ssc-post-produce`'s
  replacement contract (SKILL.md:444-475) makes axis position the binding constraint, and a
  cut must not read as licence to redraw the slot.

The existing scored checklist items that penalised swappability
(`ssc-ads-writer` SKILL.md:562) are **reworded as backstops**, not deleted: the swappable
line should already have been cut at composition, so a variation reaching the checklist
with one still in it is a composition miss and still cannot score ≥4. Keeping the scored
backstop costs nothing and catches the case where the cut was skipped.

### D5 — Binding level: composition rule + scored gate, and nothing else

**An unbacked mechanism caps a variation's brand-fit score at ≤3.** It is:

- **not** a floor item — `craft/copy-floor` is untouched, so nothing is added to mục 1–6;
- **not** a REJECT — the variation is saved/presented with its honest rating;
- **not** a regenerate-on-its-own-axis trigger — no replacement round is opened.

Why this level and not the floor: the floor is `craft/copy-floor`'s, read live, and never
restated in a skill. A floor item added in skill prose alone would be a **second source of
truth for a compliance rule**, which is the exact drift this repo has been burned by. Doing
it properly would mean a KB revision to `craft/copy-floor` plus a `/ssc-kb` run — out of
scope, and a much larger blast radius for a rule that has never been enforced before. The
scored gate binds the behaviour today at a level the skills already own, and leaves the
floor promotion available as a later, deliberate KB change.

Why not "advisory only": a rule with no consequence is prose nobody applies. The cap gives
the operator a visible signal (a 3 with a Vietnamese comment naming the missing backing)
without ever blocking a ship.

### D6 — In `ssc-post-authority` the criterion CAPS; the page must say so out loud

This is the one place where the new rule collides with existing prose, and the collision is
the reason the criterion needs its own explicit sentence rather than a clause appended to
the mechanism criterion.

**The collision.** `ssc-post-authority`'s `copy` judgement criteria are **rejections** —
the mechanism criterion at SKILL.md:424-430 ends "a variation that only describes a benefit
or a result is **rejected**", and the surrounding criteria (close, urgency, person rule) all
reject too. Meanwhile the curation-signal block at SKILL.md:381-394 carries a hard rule:
"**Never lower a score in place of rejecting a variation, and never raise one to keep a
variation: rejection is a separate, binary act.**" — restated in Governance at SKILL.md:633.

An implementer who appends "…and if the mechanism beat is unbacked, cap at ≤3" to line 424
produces prose that appears to violate line 391-393.

**The resolution, which the wording must state on the page:** "never lower a score in place
of rejecting" forbids **substituting a low score for a rejection that was owed**. An
unbacked mechanism owes no rejection — it is not a floor item and not a channel rejection —
so there is nothing being substituted for. The cap is the criterion's *own* consequence,
not a softened reject.

Concretely, the wording shape:

- The **backing** requirement is written as a **separate, named sub-criterion**, visually
  and grammatically split from the reject that precedes it — not as a trailing clause on
  the mechanism rejection. It opens by declaring its own force, e.g. *"This one CAPS, it
  does not reject — the only criterion in this list that does."*
- It says what it is not: not a floor item, not a channel rejection, no replacement round,
  the variation is presented and persisted with its honest rating.
- It says why that does not contradict the curation-signal rule, in one sentence: no
  rejection is owed here, so no rejection is being replaced by a number.
- The **curation-signal block** (SKILL.md:381-394) gains the matching carve-out, so the
  hard rule and the criterion agree wherever a reader lands first.
- **Governance gains a clause** (SKILL.md:635, the mechanism hard rule). This is the fourth
  location in this skill and it is not optional: Governance at SKILL.md:630/633 states "the
  floor is pass/fail and a failure is a REJECTION" and "never lower a score in place of
  rejecting". A reader checking Governance alone would conclude the new cap is illegal.
  The clause makes Governance consistent with Step 2.

**`ssc-ads-writer` needs no such carve-out** — its Step 7(b) block already reads
"Read every 'cannot score ≥4' below as 'holds the BRAND-FIT rating down' — never as a
reject" (SKILL.md:542), which the new item satisfies as written. The asymmetry is
deliberate; do not add a carve-out to `ssc-ads-writer` Governance.

### D7 — Scope: three skills, one commit — and `ssc-post-produce` holds no score

All three move together. `ssc-post-authority` grades what `ssc-post-produce` writes;
shipping one without the other makes the authority judge posts against a bar the writer was
never given.

**A correction to the input specs, load-bearing for the task list.** Both the proposal
("`ssc-post-produce` (both compose and score)") and the brainstorm spec ("`ssc-post-produce`
| Step 7 checklist | Same **Mechanism is proof-backed** item, capping at ≤3") place a scored
checklist in `ssc-post-produce`. **There is none.** The live file runs Steps 1, 2, 2b, 3, 4,
5 and stops; it states "you NEVER score or comment on your own drafts" (SKILL.md:21) and
"leave `score`, `comment`, and saving to the authority" (SKILL.md:23). There is no Step 6
and no Step 7.

Therefore:

- `ssc-post-produce` receives the **composition rule only** (Rules 1–3) plus the **records**
  that carry the backing forward — its per-variation hand-off line and its Step 5 summary.
  It gets **no scored item**.
- The **entire scored gate for the post channel lives in `ssc-post-authority`**. This makes
  the one-commit requirement stronger than the proposal argued: on this channel the compose
  half and the score half are in *different files by design*, so splitting the commit would
  ship a bar with no writer or a writer with no bar.
- `ssc-ads-writer` is the only skill that both composes and scores, so it is the only one
  taking both a composition rule and a checklist item.

### D8 — Naming the row without baking the KB in

The rule **names the document and reads it live**; it names **no row**.

Wording shape, used identically in all three skills:

- Point at `brand/proof-points` and, where the surrounding prose already does so, at its own
  section names as the live doc writes them — **`§ Bảng Proof Points`** for the individual
  rows (each naming the competitor it beats) and **`§ Bốn Nhóm Bằng Chứng`** for the four
  adopted families. Both already appear in `ssc-ads-writer` SKILL.md:304, 479, so the new
  rule reuses that vocabulary rather than inventing a pointer.
- Say the row is named **as the live doc names it, read this run** — never from memory,
  never a remembered figure, never a row reproduced in the skill file.
- Add **no example**. At the length of a `comment` line an example *is* the deliverable and
  would be copied instead of the doc being read — the reasoning `ssc-post-authority`
  SKILL.md:284 already gives for the bullets.
- Where a placeholder is needed in a summary template, use a field description, never a
  value: `<proof row named as brand/proof-points names it | NONE — brief carries no
  mechanism>`.

Vietnamese fragments the new prose may use are limited to ones already live in these files
and in the KB: `mục 1` (`craft/copy-floor`), `§ Bảng Proof Points`, `§ Bốn Nhóm Bằng Chứng`.
Persisted prose — the `comment` — stays Vietnamese; the skill instructions themselves stay
English.

### D9 — Insertion points, with the wording shape for each

All line numbers are against the current files, verified by reading them. Line counts:
`ssc-ads-writer` 718, `ssc-post-produce` 567, `ssc-post-authority` 646.

#### `plugins/ssc/skills/ssc-ads-writer/SKILL.md`

| Location | `file:line` | Change |
|---|---|---|
| Step 6, the `copy` bullet block | **429-438** | See below — Rules 1 and 2 added, bullet 438 rewritten to the cut form, and the stale lead-in count fixed |
| Step 7(b) scored checklist | after **561**, and reword **562** | New capping item; the existing competitor-test item becomes a backstop |
| Step 9 summary template | **646**, supported at **664** | The `Mechanism (this angle's):` line gains the backing suffix |

**Step 6, lines 429-438 — three edits in one block.**

1. **Line 429 lead-in is already stale and must not be compounded.** It reads "Four things
   bind every `copy` variation. They are here, at the point of composition, because a copy
   that reads well can still fail all four:" — and then lists **seven** bullets (431, 432,
   433, 434, 435, 437, 438). Adding a bullet makes a wrong count wronger. Replace the count
   with a countless form ("These bind every `copy` variation… because a copy that reads well
   can still fail every one of them:"). This is a drive-by correction inside the block being
   edited, not scope creep.
2. **Rule 2 sharpens line 437**, the existing "Every proof must answer the pain the hook
   opened" bullet. Keep the whole bullet — the service-brochure framing, the "pick the row
   of the live `brand/proof-points` table that answers *this* hook's tension", the
   "no proof line is written into this file" guard. **Append** the sharpening: answering is
   the bar to clear, **enhancing** is what earns the place — a proof that is true, on-topic,
   and leaves the tension exactly where the hook left it is not doing the hook's work, and
   is cut like any other unconnected proof.
3. **Rule 3 rewrites line 438**, "Make the proof unswappable". The bullet keeps its
   pointer to `craft/headline-formulas`' competitor test applied to the copy body, and keeps
   "the concrete form is whatever the live `brand/proof-points` row actually says". What
   changes is the **consequence**: a line that survives the swap is **cut here, at
   composition, before emit** — not carried into Step 7 to be scored down. State plainly
   that this cuts the **line, not the variation**: no REJECT, no regeneration pass, the
   variation's assigned axis position is unchanged, and the cut line is replaced by the
   concrete form the live row carries rather than leaving the variation with nothing
   distinctive to press.
4. **Rule 1 is a NEW bullet, appended after 438**, closing the `copy` block before line 439
   turns to the `headline` branch. Shape: the variation's **mechanism beat** (written from
   `brief.mechanism`, Step 1) must lean on **at least one row of the live
   `brand/proof-points` table** — the row that substantiates *why the mechanism works*, not
   merely a row that is true. Name that row in the variation's Vietnamese `comment`, as the
   live doc names it. Every *other* proof the variation presses stays free to answer the
   hook without routing through the mechanism. **Where `brief.mechanism` is blank this rule
   is inert** — there is no mechanism to back, no beat is written (Step 1b(iv) already rules
   this), the absence is reported in Step 9, and **nothing is invented** to give the rule
   something to bind to.

**Step 7(b), after line 561.** New scored item, in the checkbox style of its neighbours:

> - [ ] **Mechanism is proof-backed (`copy` only)** — the mechanism beat leans on at least
>   one row of the live `brand/proof-points` table, and the `comment` names which row. A
>   variation whose mechanism beat names no traced row **caps at ≤3**. **Inert where
>   `brief.mechanism` is blank** — there is no mechanism to back, so this item is not
>   applied and the absence is reported in Step 9 (never scored as a miss, never invented).

Place it directly after the existing "Every proof answers the hook (`copy` only)" item
(561) so the three hook/mechanism/proof items read as one group. Then **reword 562**
("Proof survives the competitor test") from a primary penalty into a **backstop**: the
swappable line should already have been cut in Step 6, so a variation arriving here with one
still in it is a composition miss — same "cannot score ≥4", now stated as the check that the
cut happened.

**Step 9, line 646.** The `**Mechanism (this angle's):**` line gains a backing suffix:

> `**Mechanism (this angle's):** <brief.mechanism, one line, verbatim — or "ABSENT — …"> · backed by: <proof row named as brand/proof-points names it | NONE — brief carries no mechanism>`

And the supporting bullet at **664** ("Always report this angle's mechanism") gains one
sentence: report the **row that backs it** alongside it; where the brief carries no
mechanism the backing reads NONE for that reason and not as a missing proof.

#### `plugins/ssc/skills/ssc-post-produce/SKILL.md`

| Location | `file:line` | Change |
|---|---|---|
| The proof block | **387-401** | Rules 1 and 2 added; Rule 3's cut form applied to the concreteness sentence |
| Step 4 hand-off list | after **494-495** | New bullet: the variation names the row backing its mechanism |
| Step 5 per-variation line | **524, 528** (and the `… through Variation N` pattern) | The axis line gains a mechanism-backing field |
| Step 5 summary block | **514** | The `Mechanism written to:` line gains the backing suffix |

**Lines 387-392** — the "Proof points — the ≥3-distinct bar is the SET's" paragraph — are
**not touched**. That paragraph is entirely about `craft/coverage` §4.2, which is out of
scope, and it already says "read it there, not from this line."

**Lines 394-401** — the "In practice:" paragraph — is where all three rules land, because
it is the only per-variation proof guidance in the file:

- **Rule 2** sharpens the opening sentence ("give each variation the proof point(s) that
  actually answer the tension **its own** hook opened"). Keep it; add that answering is the
  bar and **enhancing** is what earns the place.
- **Rule 1** is added as its own sentence after it: one of the points a variation presses
  must **substantiate its mechanism beat** — the beat written from `brief.mechanism`
  (Step 2) — traced to a row of the live `brand/proof-points`. The other points stay free to
  answer the hook. **Inert on a blank `brief.mechanism`**, whose absence Step 2 and the
  Step 5 summary already report.
- **Rule 3** applies to the concreteness sentence at 397-399 ("Keep them concrete, not
  slogans, and inside the compliance rails"). Extend it with the cut: a proof line that
  survives the competitor swap — swap "Cambridge" for another wellness brand and it still
  reads true — is **cut here, while drafting**, and replaced by the concrete form the live
  row carries. It cuts the **line, not the variation**: the variation keeps its planned axis
  position and is not withdrawn from the hand-off.

**Step 4 hand-off list (486-496).** Insert a new bullet **after** the axis-positions bullet
(494-495) and **before** the `brief_id` bullet (496): the **proof row backing this
variation's mechanism beat**, named as `brand/proof-points` names it, or the explicit
"— brief carries no mechanism". Rationale: `ssc-post-produce` writes no `comment` and no
score, so the hand-off line is the *only* channel by which the authority can judge Rule 1
without re-deriving it from the prose — which is exactly the failure the axis-position line
(444-464) exists to prevent for the axes.

**Step 5 per-variation lines (524, 528, and the `### … (through Variation N)` pattern at
531).** The italic axis line gains one field, in the existing `·`-separated style:

> `*opening_frame:* <frame> · *lead:* <…> · *proof device:* <…> · *register:* <…> · *length band:* <…> · *mechanism backing:* <proof row | — brief carries no mechanism>`

**Step 5 summary line 514.** `**Mechanism written to:**` gains the same suffix as
`ssc-ads-writer`'s: `· backed by: <proof row | NONE — brief carries no mechanism>`.

`ssc-post-produce`'s Governance block is **not** touched. Its proof hard rule (SKILL.md:553)
is entirely about `craft/coverage` §4.2's set-level bar, which is out of scope, and this
skill's other governance rules do not contradict the new composition rule.

#### `plugins/ssc/skills/ssc-post-authority/SKILL.md`

| Location | `file:line` | Change |
|---|---|---|
| `copy` mechanism criterion | **424-430** | New capping sub-criterion, split out from the reject |
| Curation signal `score` | **391-393** | Carve-out reconciling the cap with "never lower a score in place of rejecting" |
| `image_content` proof criterion | **455** | Same criterion, inert where the density profile emits no bullets |
| Step 7 report block | **596** | The `Mechanism judged against:` line gains the backing suffix |
| Governance mechanism rule | **635** | Clause stating the backing requirement caps and never rejects |

**The `copy` mechanism criterion (424-430).** Leave the existing bullet intact — the beat
is judged against `brief.mechanism`, "a variation that only describes a benefit or a result
is **rejected**", and the blank-mechanism path at 428-430 all stay exactly as written. Add a
**separate, adjacent sub-criterion** whose first clause declares its own force, per D6:

> **Is the beat proof-backed? — this one CAPS at ≤3; it does not reject.** The mechanism
> beat must lean on at least one row of the live `brand/proof-points` (`§ Bảng Proof
> Points`), and the variation's Vietnamese `comment` names which row. A beat backed by no
> traced row **caps the brand-fit score at ≤3** — it is **not** a floor item, **not** a
> channel rejection, and opens **no** replacement round: the variation is presented and
> persisted with its honest rating. This does not breach the curation-signal rule below: no
> rejection is owed here, so no rejection is being replaced by a number. **Inert where
> `brief.mechanism` is blank** — nothing to back, the absence is named in the presentation
> and the report exactly as the bullet above requires, and nothing is invented.

**The curation-signal block (391-393).** The hard rule "Never lower a score in place of
rejecting a variation" gains a bounded carve-out in the same breath: it forbids substituting
a number for a rejection that was **owed**; it does not forbid a criterion whose own stated
consequence is a cap, of which there is exactly one — the unbacked mechanism at Step 2.
Naming the count ("exactly one") keeps the carve-out from being read as a general licence.

**The `image_content` proof criterion (455).** The same backing requirement applies **where
the bullets carry the mechanism's proof**. Where the density profile emits **no bullets** (a
Minimal version is HEADLINE-only, or HEADLINE + SUBHEADLINE), it is **inert — not a miss**:
the format has nowhere to put a proof row, and the existing "Proof … YIELDS to brevity" rule
at 455 already ranks the caps above proof density. Also inert on a blank `brief.mechanism`.
Rule 3's cut applies here too: a bullet that survives the competitor swap is cut rather than
scored down — legal, because 0 bullets is a valid density profile.

**The Step 7 report block (596).** The `**Mechanism judged against:**` line gains the same
suffix used in the other two skills:

> `**Mechanism judged against:** <brief.mechanism, verbatim … | "NONE on the brief — reported, not invented"> · backed by: <proof row named as brand/proof-points names it | NONE — brief carries no mechanism>`

**Governance (635).** The mechanism hard rule gains one clause, per D6: the beat must be
**backed by a named row of the live `brand/proof-points`**; an unbacked beat **caps brand fit
at ≤3 and is never rejected** — it is not a floor item, so the pass/fail rule at 630 and the
never-lower-a-score rule at 633 are both untouched by it.

## Alternatives considered and rejected

| Alternative | Why it lost |
|---|---|
| **Make it a seventh floor item** in `craft/copy-floor` | Correct in principle, wrong in blast radius. The floor is a KB document, read live and never restated in a skill; adding an item means a KB revision and a `/ssc-kb` run, and until that lands the skills would carry a floor item the floor does not have — two sources of truth for a compliance rule, which is the drift this repo has already been burned by. The scored gate binds the behaviour now at a level the skills already own, and leaves the floor promotion available as a deliberate later change. |
| **Revise `craft/doctrine` §2** to state the rule, and have the skills reference it | The right long-term home (see Risks), and explicitly a follow-up. It loses *here* because the proposal fixes the KB as out of scope: a KB revision is a `/ssc-kb` run with its own propose-and-approve gate, on a different cadence, owned by the operator — it cannot ride in this commit. Doing the skills first is safe precisely because the chosen binding level contradicts no KB doc; it only under-specifies one. |
| **Every proof must route through the mechanism** (not just ≥1) | Over-binds and would break a rule that is working. Proof points legitimately answer the hook directly — that is Rule 2, and the whole existing hook↔proof rail. Forcing every proof through the mechanism would make `proof_device` spread across a set nearly impossible to satisfy and would turn every variation into one argument repeated. ≥1 is what the failure being fixed actually requires: the mechanism must not rest on nothing. |
| **Set-level only** — the SET must contain a proof-backed mechanism somewhere | Mismatched to the unit of failure. The mechanism is written **per variation**, and `craft/coverage` §4.2's set-level bar exists for *distinctness*, which is a property of the set. Substantiation is a property of the individual claim: a set where one variation's mechanism is backed says nothing about the other three, each of which ships as its own ad. |
| **Score cap for the competitor-swap failure** (leave Rule 3 as it is today) | Leaves the bad line in the shipped draft. The current behaviour scores a variation down *and saves it* with the swappable filler intact — the operator then approves a variation whose proof sentence would read true for any wellness brand. Cutting at composition removes the line and costs nothing, since the concrete form is available in the same live row. |
| **A REJECT for an unbacked mechanism** | Creates a regenerate-on-its-own-axis pass for a rule no KB doc states, on a bar that has never been enforced. The rejection machinery in both channels is reserved for the floor and for the named channel refusals; adding a rejection outside them makes the floor/coverage split (which `craft/doctrine` §3.2 owns) ambiguous. |
| **Add the rule to `ssc-ads-writer` first, post skills later** | The proposal's own argument, restated harder by D7: on the post channel the compose half and the score half live in *different files*, so a split commit ships either a bar with no writer or a writer with no bar. |

## Risks / Trade-offs

**[Doctrine under-specification — three skills carry a rule the doctrine doc does not
state]** → Accepted, with the escape hatch kept open. `craft/doctrine` §2 owns the
mandatory-mechanism rule and `craft/copy-floor` mục 1 enforces it; neither says the beat
must be substantiated. This is the staleness the "never hard-code KB content" convention
exists to prevent. **Mitigation:** the chosen binding level keeps the rule out of the floor,
so **no KB doc is contradicted — only under-specified**; a skill reading `craft/copy-floor`
live still gets a correct floor. The prose in all three skills is written so that it points
at `brand/proof-points` for the *content* and states only the *requirement*, so a later
`/ssc-kb` revision folding the rule into `craft/doctrine` §2 can replace three statements
with three references without any other rewording.

**[Prose drift between the three skills]** → Mitigated by one commit and one wording
source. Three files stating the same rule in three voices is how the ads/post pair has
diverged before. **Mitigation:** the wording shapes in D9 are written to be near-identical
across the three files — same trigger ("leans on at least one row of the live
`brand/proof-points`"), same consequence phrase ("caps at ≤3"), same inert clause ("where
`brief.mechanism` is blank"), same summary suffix (`· backed by: <…>`). Divergence in any of
those four is the thing to look for in the manual read-through. Residual risk stays: nothing
mechanically enforces it.

**[The cap collides with `ssc-post-authority`'s "never lower a score in place of rejecting"]**
→ Mitigated by D6, and this is the highest-risk edit in the change. If the criterion is
appended as a clause to the mechanism rejection at 424-430 without the explicit
caps-not-rejects declaration, the carve-out at 391-393, and the Governance clause at 635,
the file contradicts itself and a run will resolve the contradiction unpredictably —
plausibly by rejecting. All four edits ship together or none does.

**[Cutting a swappable line leaves a variation with no proof]** → Mitigated in the Rule 3
wording (D4): the cut is a *replace with the concrete form*, not a delete, and the
variation's assigned `proof_device` slot is unchanged. Without that clause the cut would
trip the existing "leaning on nothing distinctive cannot score ≥4" item and turn a fix into
a score penalty.

**[Operators read `· backed by:` as a new required field]** → Low, accepted. It is a summary
line in operator-facing chat, not a persisted field; no `contents` column moves and
`save_content`'s arguments are unchanged. The NONE branch is written to distinguish "brief
carries no mechanism" from "mechanism present but unbacked", so the two are never conflated
in a report.

**[The ChatGPT connector keeps running the old prose]** → Real and repeat-offending. The
bundle is a separate artifact in a separate repo; a prose edit that is not republished ships
to Cowork only. See Ship, below.

## Verification

There is no lint or test harness for prose in this repo, and this change adds no code, so
the gates are:

1. **`node scripts/build-chatgpt-bundle.mjs`** — the only automated gate. It validates
   `metadata.dispatches` on commands, that a skill directory matches its frontmatter `name`,
   and that every `orchestrates` entry resolves. **No skill is added, removed or renamed
   here and no frontmatter changes**, so this is a **regression check** — it proves the edits
   did not break the bundle, not that the rules are right.
2. **`node --test hooks/` from `plugins/ssc/`** — unchanged by this work (no hook edit), run
   only to confirm the commit did not disturb the one executable artifact.
3. **Manual diff read-through against this design**, checking specifically:
   - the four wording invariants of D9 are identical across the three files (trigger,
     "caps at ≤3", the inert clause, the `· backed by:` suffix);
   - `ssc-post-authority`'s four edits (criterion, curation carve-out, `image_content`,
     Governance) all landed — a partial application is worse than none (see Risks);
   - **no proof row, figure, family name, or example line** entered any skill file;
   - `craft/copy-floor`, `craft/coverage` §4.2, the `proof_device` axis, and the
     `description` proof-free variant are untouched in prose and in reference;
   - no `approve_*` / `unapprove_*` / publish tool appeared in any frontmatter `tools:`;
   - the `ssc-ads-writer` line-429 lead-in no longer states a bullet count.

## Ship

1. Apply the three skill edits in **one commit**.
2. Bump `version` in `plugins/ssc/.claude-plugin/plugin.json` (currently `2.59.2`) **in the
   same commit** — operators update by version, so an unbumped prose change never reaches
   them.
3. `scripts/publish-chatgpt-bundle.sh` — rebuild `chatgpt/workflows.json` and mirror it into
   `content/`. Verify with `scripts/publish-chatgpt-bundle.sh --check`.
4. Commit the refreshed mirror in the **`content` repo** and deploy brandos-express;
   otherwise ChatGPT keeps serving the old prose through `get_workflow_step` while Cowork
   serves the new.

**Rollback** is a prose revert plus a version bump plus a republish — the same three steps.
Nothing is persisted by this change, no server contract moves, and no already-saved row
becomes invalid, so a revert needs no data repair.

## Open Questions

None blocking. Two things deliberately deferred, both named in the proposal:

- **Folding the rule into `craft/doctrine` §2** (and letting the three skills reference it
  instead of stating it) — a follow-up `/ssc-kb` revision, on the KB's own cadence.
- **Promoting the cap to a floor item** in `craft/copy-floor` — only worth doing after the
  rule has been observed in real runs; it would then also need a REJECT path and a
  regenerate-on-its-own-axis pass, neither of which this change creates.

## Drift Log

**1. `image_content`'s competitor-swap cut preserves the density profile.**
§D9 justified the cut on `image_content` as "legal, because 0 bullets is a valid density
profile". The prose does not rely on that: the cut takes the bullet's swappable phrasing
and replaces it with the concrete form the live row carries, and **the version keeps the
density profile it was assigned**. §D9's justification contradicted §D4, which settles
that a cut line is *replaced*, not deleted, and never moves the variation's axis position.
Deleting to zero bullets would also have let a Standard version silently stop being
Standard, collapsing the set's profile-span requirement. §D4 governs; §D9's aside is
superseded.

**2. The backing report field carries four branches, not two.**
§D9's templates specified `<proof row | NONE — brief carries no mechanism>`. Two states
this change itself creates are unrepresentable in that pair: **mechanism present but no
traced row** (precisely the state the ≤3 cap exists to mark) and **the rule inert for this
section or density profile** (an ads `headline`/`description`, a bullet-less
`image_content` version). With only two branches a run must either report "brief carries
no mechanism" about a brief that carries one, or name a loosely-related row to fill the
field — fabricating the backing and silently defeating the cap. The templates therefore
carry an unbacked branch and a not-applicable branch alongside the two §D9 named. The
Risks section's requirement that "brief carries no mechanism" never be conflated with
"mechanism present but unbacked" is what the correction serves.

**3. `ssc-post-produce`'s description of the authority's regeneration trigger was corrected.**
§D9 lists four insertion points in that file and says the rest is untouched. Two further
lines were edited (`SKILL.md:23` and the Governance loop description): they described the
authority as dropping and regenerating "any rated ≤3". Left as they were, the new ≤3 cap
would have fed that sentence and created exactly the regenerate-on-its-own-axis pass the
spec forbids ("No regeneration is triggered on this axis"). Both now key the loop on the
floor and the channel rejections, with a rating on its own never dropping a variation —
which is what `ssc-post-authority` Step 3a already does. The edit is inside this change's
blast radius even though §D9 did not anticipate it.
