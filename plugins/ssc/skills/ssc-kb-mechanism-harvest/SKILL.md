---
name: ssc-kb-mechanism-harvest
description: >-
  Harvests the mechanisms a period's briefs settled and returns the genuinely new ones to the standing mechanism bank — the BrandOS `mechanisms` table — drafting new entries in, sharpening near-duplicates in place under bounds, and reporting the period's mechanism mix. Propose-only: a new entry is a draft, and is not supply until a human approves that row.
metadata:
  type: skill
  stage: harvest
  brand: cambridge-diet-vn
  section: knowledge
  capability: edit
  tools: [get_knowledge, list_ideas, list_briefs, get_brief, list_mechanisms, get_mechanism, save_mechanism, edit]
---

# KB Mechanism Harvest (`ssc-kb-mechanism-harvest`)

The mechanism bank is the brand's **standing supply** of mechanisms, and it is a
**table** — the BrandOS `mechanisms` rows, read with `list_mechanisms` and
`get_mechanism`. The brief step draws from it first and authors a mechanism only
where no entry fits; that authored mechanism exists on the one brief that settled
it. This skill is the **return path**: for one period it reads
the briefs, collects the mechanisms they settled, diffs them against the bank read
live, drafts the genuinely new ones back into the table, sharpens the entries a
near-duplicate improves, and reports the period's mix.

`craft/mechanism-bank` is the knowledge document **about** the bank — §1 points at
`craft/doctrine` §2 for what a mechanism is, §2 owns the valence vocabulary, §3
describes the table's fields, §4 says what to do when nothing fits. Read §2 for
valence; the entries themselves live in the table.

## Three things to hold before you start

**1. The diff is a SEMANTIC match, not a join.** There is no
`briefs.mechanism_slug`. A brief holds the Vietnamese sentence and nothing that
records where it came from, so you cannot ask a row which entry it drew from. You
determine membership by **reading the bank live and comparing meaning** — not
wording, and not a string match. That derivation is weaker than a stored key would
be. Treat every match as a judgement you must show your working for, and never
assert a provenance you did not derive here.

**2. A draft is not supply.** `save_mechanism` **always** mints a `draft` and
takes no `status` argument, and the bank's default read returns approved entries
only. So nothing you draft this run is readable as supply by any step until a
human approves it in the dashboard. That is precisely what makes drafting freely
safe — and why this skill holds no `approve` and no `unapprove`: it must not be
able to promote its own draft in the same run.

**3. The in-place edit is the one loosening, and the bounds are the price.**
Sharpening an existing entry with `edit(entity='mechanism')` is the only live-supply
write this plugin performs without a proposal an operator sees first. It is
deliberate. It stays acceptable only because all four bounds hold at once — content
fields only, never `status` and never `slug`, sharpening and never repurposing, and
every edit reported before/after. Drop any one of them and this becomes a skill
quietly rewriting doctrine. If you are unsure whether an edit is a sharpening or a
repurposing, it is a repurposing: draft a new entry instead.

## Inputs

- `period` — **required** (e.g. `2026-08`). The period whose briefs are harvested.
- `channel` — optional, `post` or `ad`. Those are the two channels a brief carries
  a mechanism on; a `youtube` brief carries none and is out of scope, including
  out of the mix denominator. With no channel given, harvest both.
- `plan_ids` — optional. `list_ideas` filters by channel and status but **not** by
  plan, so the period is scoped by matching each row's own `plan_id`. If the rows
  carry nothing that identifies the period and no `plan_ids` were supplied, **STOP
  and ask the operator for them** — never harvest the whole corpus and call it a
  period.
- **The period's approved Approaches document(s)** — optional in form,
  load-bearing in practice. This skill holds **no plan read tool**
  (`get_channel_plan` is deliberately not on its list — it is a KB-pipeline skill,
  not a channel one), and a mechanism's attributed voice-of-customer item and its
  proof route live in **that document's prose and the brief step's own report**,
  never on a row. They reach you only if the run supplies the document text (the
  operator pastes it, or the dispatching agent carries it in). Without it, most
  harvested mechanisms cannot be given a sourced `fits` and `proof_family` — and an
  entry missing either is **reported as a gap, not drafted** (Step 6).
- Optionally, a list of mechanisms or groundings the operator states directly. A
  mechanism the operator states IS a recorded source; one you inferred is not.

## Procedure

### Step 1 — Read the bank live. A failed read STOPS the run.

```
Call: list_mechanisms
  status: all        # both approved entries and pending drafts — see below
  limit: 200
```

Page by narrowing (`valence`, or a `q` substring over the sentence and `fits`) if
200 is not enough; `q` is a case-insensitive **substring**, not a semantic search,
so it narrows and never decides. Use `get_mechanism(slug)` wherever you suspect a
specific entry and need its whole row.

**Why `status: all` here, and only here.** The default read returns approved
entries only, which is right for every step that *chooses* a mechanism — a draft
must not be mistaken for supply. But a harvest that cannot see last period's
pending drafts re-mints them: `save_mechanism` refuses a `slug` a live entry
already holds (`duplicate_slug`), and a differently-slugged near-twin is worse
still. So diff against **all** entries and keep the two apart in the report: an
entry matched to a pending **draft** is *awaiting approval*, never *already
supply*.

Hold from the read, per entry: `slug`, `id`, `version`, `mechanism`, `valence`,
`fits`, `proof_family`, `notes`, `status`. `slug` is what a report cites; `id` +
`version` is what an `edit` targets. Retired entries are never returned under any
status, so an entry you cannot find may have been retired — report that, never
re-create it.

Also read live, with `get_knowledge`:

- `craft/mechanism-bank` — for **§2's valence vocabulary**: the two values the
  `valence` enum accepts and what each one *means*. That meaning is the document's,
  read live and never restated in this file or remembered from a past run. Do not
  read §3 for entries; it describes the table's fields, and the table is the bank.
- `craft/doctrine` — for **§2's definition of what a mechanism is**. That is the
  test Step 6 applies before anything is drafted, and it is the document's to
  state: read it live, never restate it here and never work from a remembered
  version.
- `brand/proof-points` — to confirm that a proof family a recorded route names
  actually exists as that document states it.

Check `missing` on every read; retry once. If a read still does not resolve,
**STOP, write nothing, and name the read that failed** — the bank query or the
document path. Never proceed from a remembered bank, never paraphrase it from this
file, and never write blind: a blind draft duplicates entries the table already
carries and would be reviewed as if it were a considered diff.

### Step 2 — Enumerate the period's briefs

Briefs are listed per idea, so ideas are the **enumeration scaffolding** and
nothing more — the mechanism lives on the brief, and that is where every one of
them is read from.

```
Call: list_ideas
  channel: <post | ad, one call each when both>
  status: approved
  limit: 50
```

Keep only rows belonging to the period, scoped as the Inputs describe — by each
row's own `plan_id` against the supplied `plan_ids`, and if the period cannot be
established that way, STOP and ask rather than harvest everything. **`list_ideas`
PAGES**, and the cursor parameter is **`after`**, taking an idea id — passing it as
`cursor` is silently ignored and the server returns page ONE again with the same
`next_cursor`, which reads as a stuck cursor and quietly truncates the set. Page
until `next_cursor` is null, then **dedupe by `id`** before counting.

Then, per idea, call `list_briefs(idea = <idea id>)` — there is no plan-scoped
brief listing, so this is per-idea and only per-idea. Every row carries the angle's
own `mechanism`, or `null` where that angle has not settled one. Use
`get_brief(id)` where you need one brief's full detail rather than the list
projection.

A truncated read produces a harvest that looks complete and silently drops
mechanisms. State the counts you actually reached in the output: ideas paged,
briefs read, pages followed.

### Step 3 — Collect the mechanisms, honestly

Take each brief's mechanism **off `briefs.mechanism`** and nowhere else. One angle,
one mechanism: two briefs under one idea may carry different sentences, and both
are harvested independently. Take it from the brief row itself, and never
reconstruct one from a title, a hero, an angle label, a hook direction or a
sibling angle. A guessed mechanism drafted into the bank is the worst outcome
this skill can produce, because every future period would then draw from it.

A brief whose `mechanism` is `null` is a **finding about the period**, not a tool
limitation, and which finding depends on the row:

- an **unapproved** brief with no mechanism is simply not finished — it cannot be
  approved until it settles one, and that is the operator's next move, not yours;
- an **approved** brief with no mechanism is settled work: it is never re-opened,
  never re-mechanised and never reported as stale. Name it once, in the
  denominator note, and move on.

Say *"these briefs carry no mechanism"* — never *"this period authored no new
mechanisms"*. The field IS returned, so an empty harvest is a real finding about
the period, stated as such.

Carry with each collected mechanism, where a **recorded** source states it: the
attributed voice-of-customer item it explains, and the proof route it was traced
to. Carry them as recorded — you are transcribing grounding, not deriving it.

### Step 4 — Diff every collected mechanism against the bank

For each collected mechanism, compare it against the entries read in Step 1 and
sort it into exactly one of three buckets. Judge by **meaning**, not by wording —
the same mechanism written twice by two authors almost never matches as a string.

| Bucket | Test | What happens |
|---|---|---|
| **Already in the bank** | It says what an existing entry says, in substantially the same terms, and adds nothing | Nothing is written. Count it and cite the entry's `slug` in the report — noting whether that entry is approved or a pending draft. |
| **Near-duplicate** | It restates an existing entry in **different words** — same causal claim, different framing, sharper or blunter phrasing | Step 5: an in-place `edit` of **that** entry |
| **Genuinely new** | No entry makes this causal claim | Step 6: a `save_mechanism` draft, or a named gap |

Show the diff in the report: for every bucket-2 and bucket-3 mechanism, state which
entries you compared it against and why the closest one did or did not match. The
operator has to be able to disagree with your judgement, and they can only do that
if they can see it. Because the diff is a semantic match and not a join (hold #1),
that working is the only thing standing between a wrong match and a silently
rewritten entry.

### Step 5 — A near-duplicate SHARPENS the entry it matched, in place

Never a second entry, and never a silent merge.

A bank that accumulates three wordings of one mechanism stops being a library an
operator can read as a set, and the next period's brief step then has to choose
between near-identical entries with no basis for the choice. But dropping the
harvested wording quietly is just as wrong: **two authors reaching the same
mechanism independently is the signal that the entry is worth sharpening**, and
that signal only reaches the operator if the run says so.

Resolve the entry's `id` and `version` — from the Step 1 row, or `get_mechanism(slug)`
— then:

```
edit(
  entity           = 'mechanism',
  id               = <the matched entry's id>,
  expected_version = <its version>,
  patch            = { mechanism?, fits?, proof_family?, notes? }
)
```

**The four bounds, all of which hold at once:**

1. **Content fields only** — `mechanism`, `fits`, `proof_family`, `notes`. Nothing
   else appears in the patch. `valence` is not among them: a wording that implies a
   different valence is not a sharper version of the entry, it is a different
   claim, so it goes to Step 6 as a new draft.
2. **Never `status`, never `slug`.** `status` is not patchable here at all —
   promotion is impossible by construction, and that is a guarantee to preserve,
   not a limit to work around. `slug` stays fixed so every citation in every past
   report keeps resolving.
3. **Sharpening, never repurposing.** The entry must still mean what it meant, said
   more precisely or with a wider `fits`. The moment the meaning moves, stop: draft
   a new entry instead.
4. **Every edit reported with its BEFORE and AFTER** — the prior field values and
   the new ones, the entry's `slug`, which harvested mechanism matched it, and why.
   An operator who disagrees reverts from that report alone.

Also: never fold two existing entries together — merging entries the operator wrote
is a restructure, not a harvest. Never delete or retire the matched entry. And if
the harvested wording adds nothing the entry does not already say, write **no**
edit and report the match; churn on a healthy entry is not harvest.

`edit` is version-guarded: `stale_version` means someone changed the row while you
were working. Re-read it with `get_mechanism`, re-judge the match against what it
now says, and retry once. Never re-issue the same patch blind.

### Step 6 — A genuinely new mechanism becomes a DRAFT, or a named gap

```
save_mechanism(
  slug         = <short, stable, distinct from every slug read in Step 1>,
  mechanism    = <the sentence as the brief settled it, Vietnamese>,
  valence      = <per §2's vocabulary, read live in Step 1>,
  fits         = <the trigger / objection / myth, described>,
  proof_family = <the family the route was traced to>,
  notes        = <what it is not; where it has failed — only if recorded>
)
```

- `slug` — short and stable, because steps cite it. `save_mechanism` **refuses** a
  slug a live entry already holds (`duplicate_slug`) rather than merging into it,
  so check yours against everything Step 1 returned, drafts included. On a refusal,
  read that entry with `get_mechanism` and re-judge: same meaning ⇒ it was a
  near-duplicate, go to Step 5; different meaning ⇒ pick a different slug.
- `mechanism` — the sentence **as the brief settled it**, in Vietnamese. Carried,
  not re-authored and not paraphrased. Tightening a wording is the brief step's
  business or Step 5's, never a silent rewrite on the way in.
- `valence` — read off **the sentence's own framing**, against the vocabulary §2
  defines, read live in Step 1. This is a structural reading of the sentence, not an
  invention: the sentence either explains why the thing works or why past attempts
  fail, and §2 says which value that is. If it genuinely reads as neither — or as
  both — **do not draft it**: report it, because a sentence whose framing cannot be
  placed is probably not yet a mechanism, and that is a judgement for the operator.
- `fits` — the trigger, objection or myth this mechanism answers, taken from the
  **attributed voice-of-customer item** it was grounded in. **Described, never
  persona-named** — no entry is keyed to, scoped to or filed under a persona,
  because the roster is open and revised on its own cadence, and a persona name here
  would become a second, unreviewed roster.
- `proof_family` — the `brand/proof-points` family the proof route was actually
  traced to, confirmed against that document in Step 1. If the recorded route names
  a family that document does not carry, **report it and pass no `proof_family`** —
  never substitute a family that looks close.
- `notes` — only where a source records it. Leave it thin rather than inventing
  texture.

**An entry you cannot ground is not drafted.** If the voice-of-customer item or the
proof route is in no recorded source, say so per mechanism under **"Harvested but
not drafted — grounding not recorded"**, naming which is missing and where it would
have to come from (almost always: the period's approved Approaches document). Never
invent a mechanism, a `fits` line or a proof family to complete an entry. A named
gap is recoverable; a fabricated entry becomes supply every future period draws
from.

Every entry this step writes is a **draft**. Say so in the report, plainly: it is
not supply until a human approves it in the dashboard, and this run cannot approve
it.

### Step 7 — Report the period's mechanism MIX. Report-only.

The mix is measured over **the period's briefs** — where a settled mechanism
lives — and it is a **report**, not an enforcement. Two ratios:

- **Concentration** — one mechanism carried by more than roughly **a quarter** of
  the period's assets.
- **Negative valence** — `negative` mechanisms carrying more than **a third** of
  them.

Count it like this, and state the counting:

- **Denominator.** Briefs read for the period, on `post` and `ad`, that carry a
  mechanism. State both numbers — briefs read, and briefs carrying a mechanism —
  and name the ones carrying none (Step 3) so the operator can see what the ratio
  is and is not measured over. **State the enumeration scope too:** Step 2 lists
  ideas at `status: approved`, so the denominator covers briefs hanging off the
  period's approved ideas only — briefs under still-draft ideas sit outside it.
  Where most briefs carry no mechanism, say the mix is **weakly evidenced** rather
  than reporting a percentage as if it were the period.
- **Grouping.** Two briefs carrying the same mechanism by meaning count as one
  mechanism, on the Step 4 judgement — not on string equality.
- **Valence.** From the matched bank entry where there is one; otherwise from the
  sentence's own framing per §2. Where it can be placed as neither, count it as
  **unknown**, name it, and state the negative share as a range over the unknowns
  rather than picking one.
- **Where a ratio cannot be computed at all** — no briefs, no mechanisms, an
  unresolvable period — say so. Never emit a number you did not count.

**Name every breach**, with the mechanism and the share. Then stop. This audit
proposes no re-mechanising, re-opens nothing, edits no brief and blocks nothing.
The correction is the operator's, on briefs that are **not yet approved** — approved
work is never re-opened for a ratio. And a quota met by a fabricated mechanism is
worse than an honestly reported skew, because the skew is visible and the
fabrication is not.

## Pre-submission self-check

Before you write anything, and again before you report, verify every item:

- [ ] The bank was read **live this run** with `list_mechanisms`; nothing below came
      from a remembered version
- [ ] Every mechanism came off a **brief's** `mechanism` field, a recorded source
      the run supplied, or the operator directly — none off an idea, none
      reconstructed from a title, hook or sibling angle
- [ ] Every near-duplicate is an **in-place `edit` of the entry it matched**, and the
      report names that entry's `slug`, the reason, and its **before and after**
- [ ] No patch carries `status`, `slug` or `valence` — content fields only
- [ ] No edit **repurposes** an entry to a different meaning; every unsure case was
      drafted as a new entry instead
- [ ] Every new entry went through `save_mechanism` and is a **draft**; no `status`
      was passed and none could be
- [ ] Every new `slug` is distinct from every slug read in Step 1, drafts included
- [ ] Every drafted entry's `valence`, `fits` and `proof_family` is sourced as Step 6
      requires; anything ungroundable is a **named gap**, not a draft
- [ ] No `fits` names a persona
- [ ] No entry was removed, retired, marked unused, or given a usage count or a
      last-used period
- [ ] The mix audit states its denominator and its exclusions, names every breach,
      and proposes no correction to any brief
- [ ] Approved briefs carrying no mechanism are named once and are **not** reported
      as stale or re-opened
- [ ] No `approve`, no `unapprove`, no `propose_knowledge_revision`, no
      `save_knowledge`, no publish or schedule call was made in this run

If any item fails, fix it before reporting.

## Output

```
period: <period>
read: <N ideas paged / M briefs read / P pages followed>
      <B briefs carrying a mechanism, C carrying none>

already_in_the_bank:
  - mechanism: <as settled>     matched: <slug>   entry_status: <approved | draft>

sharpened_in_place:                    # Step 5 — the in-place edits
  - slug: <matched entry>
    matched_because: <why this harvested wording is the same claim>
    before: <the prior values of the fields you changed>
    after:  <the new values>
    source: <brief id>

drafted:                               # Step 6 — new entries, all draft
  - slug: <new slug>
    valence: <as read off the sentence per §2>
    fits_from: <the attributed voice-of-customer item>
    proof_family: <the route it was traced to>
    source: <brief id>

harvested_but_not_drafted:             # grounding not recorded, or framing unplaceable
  - source: <brief id>
    missing: <fits | proof_family | valence framing — and where it would come from>

briefs_with_no_mechanism:              # Step 3 — a finding about the period
  unapproved: <brief ids>              #   not finished; the operator settles one
  approved: <brief ids>                #   settled work; never re-opened, never stale

mix:                                   # Step 7 — report-only
  measured_over: <B briefs carrying a mechanism, of M read>
  concentration:
    - mechanism: <as settled>   share: <k/B>   breach: <yes | no>
  negative_valence: <n/B>   breach: <yes | no>   unknown_valence: <u>
  notes: <what could not be counted, and why>
```

End with a summary in plain terms: N mechanisms harvested → D drafted + S entries
sharpened in place, A already in the bank, G not drafted for want of grounding, C
briefs carrying no mechanism. State plainly: **"Drafted — not supply. Each new
entry becomes supply only when a human approves it in the Knowledge dashboard.
Nothing was approved, promoted or retired by this run."** Where any entry was
sharpened, add: **"S existing entries were edited in place; their before/after is
above — revert any you disagree with."**

If nothing was harvestable at all, say exactly that and say **why**: briefs carrying
no mechanism are a finding about the period, an unresolvable period scope is a stop,
and a failed bank read is a stop that already ended the run. Never report an empty
harvest as a clean one.

## Governance

- **No approval verb, in any form (hard rule).** Never call `approve` (the ONLY
  gated promotion; the approval hook denies it to agents, any entity, any gate),
  never `unapprove` or `update_status`, never publish or schedule anything, and
  never use `edit` to demote, unapprove, discard or reject a row — demotion is an
  `edit`, not a separate tool, and the ban lives here. A drafted entry becomes
  supply through an operator's approval in the Knowledge dashboard, never through
  this run.
- **Two writes, both stopping short of the governance line.** `save_mechanism` can
  only mint a `draft` — it takes no `status` and cannot mint an approved entry — and
  `edit(entity='mechanism')` is bounded to content fields, so neither flips a gate
  and neither is anything the approval hook needs to catch. The in-place edit is
  still the one live-supply write in this plugin that no operator sees as a diff
  first; the four bounds in Step 5 and the before/after report are why it is
  allowed, and none of them is optional.
- **No `propose_knowledge_revision` and no `save_knowledge`.** Bank entries are
  table rows, not document sections, so nothing about the bank travels the KB
  revision path; and `save_knowledge` / `edit(entity='knowledge')` write
  the live knowledge base directly and ungated, which is the one thing a skill that
  grows a governed library must not be able to do. Neither is on this skill's list
  and neither may be added.
- **It writes no usage history and retires nothing.** No usage count, no last-used
  period, no retired flag — the bank is a static library, and rotation is the
  per-period mix report in Step 7, not cross-period bookkeeping. A weak entry is a
  **reported finding**, never a removal: `delete` is not on this list, and retiring
  an entry the operator owns is an operator act in the dashboard.
- **The diff is semantic, so the working is the safeguard.** No `briefs.mechanism_slug`
  exists, so provenance survives in this run's report and nowhere else. Show which
  entries you compared against and why the closest one did or did not match — that
  report is what makes a wrong match recoverable.
- **No KB or bank content is hard-coded here.** This file names the bank tools it
  calls, `craft/mechanism-bank` (§1/§2/§4), `craft/doctrine` §2 and
  `brand/proof-points`, and reads them live. It contains no mechanism sentence, no
  bank `slug`, no example entry and no persona name — the bank is revised on its own
  cadence by operators approving and sharpening rows, so a baked-in copy would go
  stale silently and then outrank the live table it was meant to reflect.
- **A failed bank or KB read STOPS the run and names what failed.** Never a fallback
  to a remembered version, and never a blind write.
- **Nothing is invented.** Not a mechanism, not a `fits` line, not a proof family,
  not a count. Each comes from a recorded source or from a stated reading of the
  sentence itself, or the entry is not drafted and the gap is named.
- **The mix audit never corrects.** It names breaches and stops; approved briefs are
  never re-opened, and no mechanism is invented or swapped to satisfy a ratio.
- **Persisted prose is Vietnamese** — the `mechanism` sentence, `fits` and `notes`
  — matching the entries already in the table. Field labels are structural English.
- Requires the `edit` capability (plus `view` for the `list_mechanisms` /
  `get_mechanism` / `get_knowledge` / `list_ideas` / `list_briefs` / `get_brief`
  reads).
