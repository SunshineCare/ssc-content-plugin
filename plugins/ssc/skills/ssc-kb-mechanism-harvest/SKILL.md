---
name: ssc-kb-mechanism-harvest
description: >-
  Harvests the mechanisms a period's approved ideas and briefs actually settled and proposes the genuinely new ones into the knowledge base's standing mechanism bank (`craft/mechanism-bank`), so a mechanism authored to fill a gap stops being re-invented in the next period that meets the same objection. Membership in the bank is a DIFF, never a lookup: nothing persists a bank id, an `in_bank` flag or a valence anywhere on a row, so this skill reads `craft/mechanism-bank` LIVE and derives membership by comparing the harvested mechanism's TEXT — its meaning, not its wording — against the entries that document actually carries. A harvested mechanism restating an existing entry in different words becomes a proposed REVISION of that entry, naming which entry it matched and why, never a second entry saying the same thing and never a silent merge. All of a run's additions and revisions fold into ONE proposal against the single bank document, whose `proposed_content` reproduces the live document verbatim plus the changes, because two competing proposals on one path block each other. It tags every proposed entry with a `valence` from the vocabulary the bank's own §2 defines (read live, never remembered), a `fits` taken from the attributed voice-of-customer item the mechanism was grounded in, and a `proof_family` taken from the proof route it was actually traced to — it invents none of the three, and an entry whose grounding it cannot establish from a recorded source is REPORTED as a gap rather than proposed. Propose-only BY CONSTRUCTION: its only write is `propose_knowledge_revision`; it holds no `save_knowledge`, no `edit`, no `approve` and no publish or schedule tool, so it cannot change the live knowledge base at all — every adoption reaches the bank through an operator's approval on the existing KB revision screen. It writes no usage history, no last-used period and no retired flag, and it retires nothing: a weak entry is a proposed revision or a reported finding, never a removal. An IDEA's `mechanism` IS returned by `list_ideas` and `get_idea` and is read straight off the row; what is not yet readable is a BRIEF's angle-local `mechanism` override, which stays unreadable until that server field ships — so the skill names exactly which mechanisms it could not read and proposes nothing for them, it never reconstructs a mechanism from a title or a hook, and it never reports an empty harvest as a clean one. A failed read of `craft/mechanism-bank` STOPS the run and names the document; it never proposes against a remembered bank. Persisted prose is Vietnamese; field labels are structural English.
metadata:
  type: skill
  stage: harvest
  brand: cambridge-diet-vn
  section: knowledge
  capability: edit
  tools: [get_knowledge, list_ideas, list_briefs, get_idea, get_brief, propose_knowledge_revision]
---

# KB Mechanism Harvest (`ssc-kb-mechanism-harvest`)

The mechanism bank (`craft/mechanism-bank`) is the brand's **standing supply** of
mechanisms. Approaches draws from it first and authors a new mechanism only where
no entry fits — and that authored mechanism, today, exists nowhere but the
period's own work. This skill is the **return path**: for one period it reads the
approved ideas and briefs, collects the mechanisms they settled, diffs them
against the live bank, and **proposes** the genuinely new ones into the document.

You propose. You never apply. Adoption is the operator's act on the Knowledge
dashboard's Proposals tab, exactly as with every other KB revision.

## Two things to hold before you start

**1. Membership is a DIFF, not a lookup.** There is no `bank_id` column, no
`in_bank` flag and no `valence` column on an idea, a brief or anything else. So
you cannot ask a row where its mechanism came from. You determine whether a
harvested mechanism is already in the bank by **reading the bank live and
comparing text** — by meaning, not by string match — and that derivation is
weaker than a stored flag would be. Treat every match as a judgement you must
show your working for, and never assert a provenance you did not derive here.

**2. The idea surface exposes the field; the brief surface does not yet.**
`get_idea` and `list_ideas` **do return the idea's `mechanism`** — read it
straight off the row, on any channel. What is **not** readable is a brief's own
mechanism (the angle-local override): that server field has not shipped, so
`get_brief` and `list_briefs` carry no `mechanism` key. This is a real, current
limitation of the BRIEF surface only, not a data problem to work around. Its
consequence is stated once and enforced everywhere below: **what you cannot read,
you report as unreadable and do not harvest.** You never reconstruct
a plausible mechanism from a title, a hook direction or a core message — a
guessed mechanism proposed into doctrine is the worst outcome this skill can
produce, because every future period would then draw from it.

An empty harvest reported as a clean one is the second-worst. Say *"the tool
surface does not expose `mechanism` for these rows"* — never *"this period
authored no new mechanisms"*. And because ideas ARE readable, an empty idea
harvest is a real finding about the period, not a surface limitation: do not
attribute it to the tool surface.

## Inputs

- `period` — **required** (e.g. `2026-08`). The period whose approved work is
  harvested.
- `channel` — optional, `post` or `ad`. `list_ideas` filters by channel; with
  none given, harvest both.
- `plan_ids` — optional. `list_ideas` filters by channel and status but **not**
  by plan, so the period is scoped by matching each row's own `plan_id`. If the
  rows carry nothing that identifies the period and no `plan_ids` were supplied,
  **STOP and ask the operator for them** — never harvest the whole corpus and
  call it a period.
- **The period's approved Approaches document(s)** — optional in form,
  load-bearing in practice. This skill holds **no plan read tool** (`get_channel_plan`
  is deliberately not on its list — it is a KB-pipeline skill, not a channel one),
  and the `bank_id` / `in_bank` and `valence` labels, each candidate's attributed
  voice-of-customer item and its proof route live in **that document's prose** and
  nowhere else. They reach you only if the run supplies the document text (the
  operator pastes it, or the dispatching agent carries it in). Without it, most
  harvested mechanisms cannot be given a sourced `valence`, `fits` and
  `proof_family` — and an entry missing any of the three is **reported as a gap,
  not proposed** (Step 6).
- Optionally, a list of mechanisms the operator states directly — e.g. ones they
  know were settled off-supply. A mechanism the operator states IS a recorded
  source; one you inferred is not.

## Procedure

### Step 1 — Read the bank live. A failed read STOPS the run.

Call `get_knowledge` for `craft/mechanism-bank`. Check `missing`; retry once. If
it still does not resolve, **STOP, propose nothing, and name the document that
could not be read.** Never proceed from a remembered bank, never paraphrase the
bank from this file, and never fall back to proposing blind — a blind proposal
would duplicate entries the document already carries and would be reviewed as if
it were a considered diff.

Hold three things from the read: the document's **full current text verbatim**
(Step 7 replaces the whole document, so you need it byte-for-byte), its **§2
valence vocabulary** (the legal values and which is the default and priority —
read there, never from memory and never from this file), and its **§3 entries**:
each entry's `id`, `mechanism`, `valence`, `fits`, `proof_family` and `notes`.

Where a harvested mechanism's proof route names a family, also read
`brand/proof-points` live to confirm that family exists as the document states
it. Same rule: a failed read STOPS the run and names the document. If the
recorded route names a family that document does not carry, **report it and
propose no `proof_family` for that entry** — never substitute a family that looks
close.

### Step 2 — Enumerate the period's approved work

```
Call: list_ideas
  channel: <post | ad, one call each when both>
  status: approved
  limit: 50
```

Keep only rows belonging to the period, scoped as the Inputs describe — by each
row's own `plan_id` against the supplied `plan_ids`, and if the period cannot be
established that way, STOP and ask rather than harvest everything. **`list_ideas`
PAGES**, and the cursor parameter is **`after`**, taking an idea id — passing it
as `cursor` is silently ignored and the server returns page ONE again with the
same `next_cursor`, which reads as a stuck cursor and quietly truncates the set.
Page until `next_cursor` is null, then **dedupe by `id`** before counting.

Then, per idea, call `list_briefs(idea = <idea id>)` for that idea's briefs —
there is no plan-scoped brief listing, so this is per-idea and only per-idea. Use
`get_idea` / `get_brief` where you need one row's full detail rather than the
list projection.

A truncated read produces a harvest that looks complete and silently drops
mechanisms. State the counts you actually reached in the output: ideas read,
briefs read, pages followed.

### Step 3 — Collect the mechanisms, honestly

For each approved idea and each of its briefs, take the mechanism **only** from a
source that actually recorded it:

- the `mechanism` field on the row — **read it off every idea row** (`list_ideas`
  / `get_idea` return it); on a brief, only once that server field ships;
- the approved Approaches document supplied with the run, where it states which
  candidate a subject carried;
- a mechanism the operator stated directly for a named row.

Everything else is **unreadable**, and unreadable is a reported state, not a gap
to fill — but which state applies depends on the surface, so bucket it per
surface:

- **A brief** whose angle-local mechanism you could not read goes under *not
  readable through the tool surface* with its id — that override field has not
  shipped.
- **An idea** whose `mechanism` came back empty is an idea that **recorded no
  mechanism**: the field IS returned, so record it as a period finding, never
  under *not readable through the tool surface*.

Either way, propose nothing for it and move on. Do not
infer it from the title, the hero, the angle label or the brief's five narrative
fields; do not infer it from a sibling angle; do not infer it from what the
Approaches supply "probably" gave it.

Carry with each collected mechanism, where the source records it: its
`bank_id` or `in_bank: false` label, its `valence`, the attributed
voice-of-customer item it explains, and the proof route it was traced to. **Carry
them as recorded** — you are transcribing provenance, not deriving it.

### Step 4 — Diff every collected mechanism against the live bank

For each collected mechanism, compare it against the §3 entries read in Step 1
and sort it into exactly one of three buckets. Judge by **meaning**, not by
wording — the same mechanism written twice by two authors almost never matches as
a string.

| Bucket | Test | What happens |
|---|---|---|
| **Already in the bank** | It says what an existing entry says, in substantially the same terms | Nothing is proposed. Count it and name the entry in the report. |
| **Near-duplicate** | It restates an existing entry in **different words** — same causal claim, different framing, sharper or blunter phrasing | Step 5: a proposed **revision of that entry** |
| **Genuinely new** | No entry makes this causal claim | Step 6: a proposed **new entry** |

A label the source carried is **evidence for the diff, never a substitute for
it.** A candidate labelled `in_bank: false` whose mechanism the bank plainly
already carries is a near-duplicate, not a new entry — the label records what one
Approaches run believed, and the bank has been revised since. Equally, a labelled
`bank_id` that does not resolve to an entry in the document you just read is
**reported**, not proposed and not silently re-pointed at the nearest match.

Show the diff in the report: for every bucket-2 and bucket-3 mechanism, state
which entries you compared it against and why the closest one did or did not
match. The operator has to be able to disagree with your judgement, and they can
only do that if they can see it.

### Step 5 — A near-duplicate becomes a proposed REVISION of the entry it matched

Never a second entry, and never a silent merge.

A bank that accumulates three wordings of one mechanism stops being a library an
operator can read as a set, and the next period's matching step then has to
choose between near-identical entries with no basis for the choice. But dropping
the harvested wording quietly is just as wrong: **two authors reaching the same
mechanism independently is the signal that the entry is worth sharpening**, and
that signal only reaches the operator if the run says so.

So for each near-duplicate:

- Propose a revision of the matched entry — a sharper `mechanism` sentence, a
  widened `fits`, a `notes` line recording where the second wording came from —
  keeping the entry's `id` and its `valence` unless the harvested evidence
  genuinely contradicts them.
- **Name the entry you matched and why**, in the rationale and in the report.
- Never delete the matched entry, never renumber or re-slug it, and never fold
  two existing entries together — merging entries the operator wrote is a
  restructure, not a harvest.
- If the harvested wording adds nothing the entry does not already say, propose
  **no** revision and report the match. Churn on a healthy entry is not harvest.

### Step 6 — A genuinely new mechanism becomes a proposed new entry, or a named gap

Build the entry to the shape §3 defines, in the same house style as the entries
already there (read them in Step 1 — the document's structure is the
specification, and this file restates none of it):

- `id` — a short stable slug, distinct from every `id` in the document you read.
  Uniqueness is a convention nothing validates, so check it yourself.
- `mechanism` — the mechanism **as its recorded source words it**, in Vietnamese.
  Carried, not re-authored and not paraphrased.
- `valence` — from the vocabulary the bank's §2 defines, read live in Step 1.
  Take the value the source recorded. **Never infer a valence from the
  mechanism's wording** — a guessed valence enforces a downstream cap nobody's
  document supports.
- `fits` — the trigger, objection or myth this mechanism answers, taken from the
  **attributed voice-of-customer item** the mechanism was grounded in.
  **Described, never persona-named** — no entry is keyed to, scoped to or filed
  under a persona, because the roster is open and revised on its own cadence, and
  a persona name here would become a second, unreviewed roster.
- `proof_family` — the `brand/proof-points` family the mechanism's proof route
  was actually traced to, confirmed against that document in Step 1.
- `notes` — what it is not, and where it has failed, only where the source
  records it. Leave it thin rather than inventing texture.

**An entry you cannot ground is not proposed.** If the valence, the
voice-of-customer item or the proof route is not in any recorded source, say so
per mechanism under **"Harvested but not proposed — grounding not recorded"**,
naming which of the three is missing and where it would have to come from (almost
always: the period's approved Approaches document). Never invent a mechanism, a
valence, a `fits` line or a proof family to complete an entry. A named gap is
recoverable; a fabricated entry becomes doctrine every future period draws from.

### Step 7 — Fold the whole run into ONE proposal against the bank

All of §3's entries live in **one document**, and the dashboard blocks two
competing proposals on the same path. So a run produces **exactly one**
`propose_knowledge_revision` call against `craft/mechanism-bank`, carrying every
addition from Step 6 and every revision from Step 5 together.

`proposed_content` is a **complete replacement** of the document, not a patch
fragment: reproduce the live text read in Step 1 **verbatim** — its first-line H1,
§1, §2, and every §3 entry you are not changing, character for character — then
add the new entries and apply the proposed revisions. Anything you retype from
memory instead of copying is an unreviewed edit riding along on a harvest.

```
propose_knowledge_revision(
  path              = 'craft/mechanism-bank',
  proposed_content  = <the live document verbatim + this run's additions and revisions>,
  rationale         = <one paragraph: which period, how many additions, how many
                       revisions, and for each revision WHICH entry it sharpens and WHY>,
  evidence_note     = <the recorded sources: the period, the approved Approaches
                       document, the idea/brief ids the mechanisms were settled on>
)
```

**What this call must never do:** remove an entry, retire one, mark one unused,
add a usage count or a last-used period, reorder §3 for tidiness, or rewrite §1
or §2. The bank records no usage and retires nothing; §1 points at
`craft/doctrine` §2 for the definition of a mechanism and must keep pointing
rather than restating it.

**Language.** The entry bodies — the `mechanism` sentence, `fits`, `notes` — are
**Vietnamese**, matching the document they join. The field labels (`id`,
`valence`, `fits`, `proof_family`, `notes`) are **structural English**, as
everywhere else in this plugin. `rationale` and `evidence_note` may be the
operator's language.

## Pre-submission self-check

Before calling `propose_knowledge_revision`, verify every item:

- [ ] `craft/mechanism-bank` was read **live this run**; nothing below came from a
      remembered version
- [ ] Exactly **one** proposal, against `craft/mechanism-bank`, for the whole run
- [ ] `proposed_content` reproduces the live document verbatim — H1 first line,
      §1, §2 and every untouched §3 entry — with only this run's additions and
      revisions applied
- [ ] Every near-duplicate is a **revision of the entry it matched**, and the
      rationale names that entry and the reason
- [ ] No entry was removed, retired, marked unused, reordered or given a usage or
      last-used field
- [ ] Every proposed entry's `valence`, `fits` and `proof_family` came from a
      **recorded source**; none was inferred from the mechanism's wording
- [ ] No `fits` names a persona
- [ ] Every new `id` is distinct from every `id` in the document read in Step 1
- [ ] Every **brief** whose angle-local mechanism could not be read is listed
      under *not readable through the tool surface*, not counted as absent and
      not reconstructed from a title
- [ ] Every **idea** whose `mechanism` came back empty is listed under
      `ideas_recording_no_mechanism` — a finding about the period, never under
      *not readable through the tool surface* — and not reconstructed from a title
- [ ] `evidence_note` is present and names the period and the rows the harvest
      drew on
- [ ] No `save_knowledge`, no `edit`, no `approve`, no publish or schedule call
      was made in this run

If any item fails, fix it before submitting.

## Output

```
period: <period>
read: <N ideas / M briefs, P pages followed>   # what you actually reached

already_in_bank:
  - mechanism: <as recorded>          matched: <entry id>

proposed_revisions:                    # Step 5
  - matched_entry: <entry id>
    why: <what the harvested wording says that the entry does not say as well>
    source: <idea/brief id + where the mechanism was recorded>

proposed_new_entries:                  # Step 6
  - id: <new slug>
    valence: <as recorded>
    fits_from: <the attributed voice-of-customer item>
    proof_family: <the route it was traced to>
    source: <idea/brief id + where the mechanism was recorded>

harvested_but_not_proposed:            # grounding not recorded
  - source: <idea/brief id>
    missing: <valence | fits | proof_family — and where it would come from>

not_readable_through_the_tool_surface: # Step 3 — briefs only (angle-local override
  - <brief ids>                        #   not shipped); never counted as "no mechanism"

ideas_recording_no_mechanism:          # Step 3 — the field IS returned, so this is a
  - <idea ids>                         #   finding about the period, not a surface limit
```

Then the single proposal: report its `proposal_id`, `path: craft/mechanism-bank`,
and confirm `status: pending`.

End with a summary in plain terms: N mechanisms harvested → A new entries + R
revisions proposed in one proposal, G not proposed for want of grounding, U not
readable through the tool surface. State plainly: **"Proposed — awaiting approval
in the KB dashboard. Nothing applied to the bank."**

If nothing was readable at all, say exactly that — and say **why**, per surface:
an idea whose `mechanism` came back empty is an idea that recorded none (the
field is returned), while a brief's angle-local override is *"not exposed by the
tool surface yet"*. Propose nothing for either. Do **not** blame the tool surface
for ideas, and do **not** report an unreadable brief as a brief that authored no
new mechanism.

## Governance

- **Propose-only by construction (hard rule).** `tools:` is exactly
  `[get_knowledge, list_ideas, list_briefs, get_idea, get_brief,
  propose_knowledge_revision]`. `propose_knowledge_revision` is the only write,
  and it writes a **pending proposal**, never the document. This skill holds no
  `save_knowledge` and no `edit` — both write the live knowledge base directly and
  ungated, which is the one thing a skill that grows a governed document must not
  be able to do — and it holds no `edit(entity='knowledge')` by consequence. It
  **cannot** write the live KB, and must never be given a tool that can.
- **Never approve, never demote, never publish.** Never call `approve` (the ONLY
  gated promotion; the approval hook denies it to agents, any entity, any gate),
  never `unapprove` or `update_status`, never publish or schedule anything, and
  never use `edit` to demote, unapprove, discard or reject a row — demotion is an
  `edit` now, not a separate tool, and the ban lives here. Every adoption reaches
  the bank through an operator's approval on the existing KB revision screen.
- **It writes no usage history and retires nothing.** No usage count, no
  last-used period, no retired flag — the bank is a static library and rotation
  stays where it already works, at Ideate's per-period concentration cap. A weak
  entry is a **proposed revision or a reported finding**, never a removal:
  removing a doc or an entry the operator owns is not a proposal.
- **One proposal per path.** Two competing proposals on `craft/mechanism-bank`
  block each other, so a run submits one.
- **No KB content is hard-coded here.** This file names `craft/mechanism-bank`
  (and its §1/§2/§3), `craft/doctrine` §2 and `brand/proof-points`, and reads them
  live. It contains no mechanism sentence, no bank `id`, no valence value, no
  `fits` phrasing and no persona name — the bank is revised on its own cadence, so
  a baked-in copy would go stale silently and then outrank the live document it
  was meant to reflect.
- **A failed KB read STOPS the run and names the document.** Never a fallback to a
  remembered version, and never a blind proposal.
- **Nothing is invented.** Not a mechanism, not a valence, not a `fits` line, not
  a proof family. Each comes from the recorded source, or the entry is not
  proposed and the gap is named.
- **Persisted prose is Vietnamese**; field labels are structural English.
- Requires the `edit` capability (plus `view` for the `get_knowledge` /
  `list_ideas` / `list_briefs` / `get_idea` / `get_brief` reads).
