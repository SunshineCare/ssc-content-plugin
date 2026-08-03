# Design — The mechanism bank: a standing KB supply instead of a monthly invention

## Context

This repo is the `ssc` Cowork plugin: prose skills, agents and commands plus one
Node governance hook. There is no compiled surface here, so every rule below is
enforced by what a skill's frontmatter declares it may call and by what its prose
forbids — not by a validator.

**Current state, as it actually is in the files.**

- `ssc-approaches-core` (`plugins/ssc/skills/ssc-approaches-core/SKILL.md`) is the
  shared, view-only sub-skill that both Approaches steps dispatch. Its **Step 4**
  authors the period's candidate-mechanism supply from scratch, grounded in the
  Step 3 voice-of-customer pass, and returns it in a fenced block of four
  per-candidate fields (`mechanism`, `explains`, `proof`, `indirectness`). It
  holds exactly `get_knowledge` + `search_knowledge` and reads no plan state.
- The two callers — `ssc-ads-approaches` (§Candidate mechanisms, Step 6 template)
  and `ssc-post-approaches` (§3 *Cơ chế đề xuất*) — compose that block into the
  Vietnamese document they persist to `channel_plans.context`. That persisted
  document is the **only** carrier that survives to Ideate.
- `ssc-post-ideate` round 3 enforces a **mechanism-spread tally**: no single
  mechanism on more than about a quarter of the batch, plus a near-duplicate
  pair check. `ssc-ads-ideate` has **no such tally** — it enforces plan-wide
  subject distinctiveness by meaning and gates approval-readiness on a mechanism
  existing at all.
- The mechanism lives on the **idea** and is inherited by every angle beneath it.
  `ssc-brief-core` states this as a hard rule ("never authors, restates or varies
  a mechanism"). `ssc-ads-brief` — which does **not** dispatch `ssc-brief-core`;
  it derives the five narrative fields inline — restates that same hard rule in
  roughly ten places, including a hard score cap at 2 for mechanism drift and an
  explicit "never pass a mechanism" instruction on `save_brief`.
- `ssc-ads-writer` resolves `idea.mechanism` off the **`get_brief` response**,
  which returns the brief *and* its owning idea in one call. It holds no
  `get_idea`.
- `ssc-kb-agent` orchestrates `[ssc-kb-review, ssc-kb-audit, ssc-kb-research,
  ssc-kb-revise, ssc-kb-gap-fill]`. `ssc-kb-revise` is the propose-only precedent:
  `capability: edit`, tools `[get_knowledge, propose_knowledge_revision]`, nothing
  that writes the live KB.

The approved brainstorm spec is
`docs/superpowers/specs/2026-08-03-mechanism-bank-design.md`; it settles WHAT and
its decisions are not re-opened here. The proposal is `proposal.md`. This document
settles HOW, file by file, so the task list falls out of it.

**One in-flight change shares these files.**
`openspec/changes/post-plan-sophistication-mechanism-supply` is implemented
(shipped as `2.55.0` / `2.56.0`) but **not archived**. Its `design.md` DL1 froze
`ssc-ads-approaches` Step 6's document template byte-for-byte *for that refactor*,
and its DL2 recorded the resulting duplication as **accepted residual**, with the
explicit resolution that "the next edit to either Approaches skill removes the
copy". This change is that next edit. Nothing here contradicts that design; D6
below is the first edit its DL2 licensed.

## Goals / Non-Goals

**Goals:**

- Give the brand a **standing, governed supply of mechanisms** that an operator
  can read as a set and a revision cycle can improve, so the craft half of
  Approaches stops being re-derived every month.
- Make the Approaches supply **bank-first with visible invention**: a candidate
  either names the bank entry it came from or is flagged as newly authored, so
  the two are never confused downstream.
- Correct the drift toward failure framing with a **valence vocabulary** and a
  usage cap enforced where usage happens.
- Give an angle brief a **bounded** permission to carry its own mechanism, so a
  persona × route the subject's mechanism does not serve stops being either a
  misfit drop or a silent contradiction.
- Give the bank a **propose-only growth path** through the existing KB revision
  review screen.
- Keep every existing invariant intact: propose-only, no hard-coded KB content,
  a failed KB read stops the run, Vietnamese persisted prose, and no MCP tool
  named that does not exist on the BrandOS surface.

**Non-Goals:**

- **No usage history, no last-used period, no retired flag** on a bank entry.
- **No JSON-bodied bank document and no bespoke dashboard editor** for it.
- **No mechanisms taxonomy and no first-class `mechanisms` table.**
- **No new persisted column beyond `briefs.mechanism`** — in particular no
  `bank_id` column, no `valence` column, no `in_bank` flag anywhere.
- **No new gate, no moved gate, no new approval-bearing field.** The governance
  hook and its matchers are untouched.
- **No back-fill.** No approved Approaches doc, idea, brief, content row or
  calendar is re-opened, re-scored or re-mechanised.
- **The bank's Vietnamese entries are not a repo artifact** — this change ships
  the document's structure and its §1/§2 rules; the operator seeds the entries in
  BrandOS.
- No change to the monthly head, the quarterly strategy skills, the image or
  video chains, or the post produce loop.

## Decisions

### D1 — The bank is a KB document, `craft/mechanism-bank`, in structured Markdown

Category `craft`, Vietnamese, read live by every consumer through `get_knowledge`.
Three sections:

- **§1 — What this doc is.** The standing supply. It **points at `craft/doctrine`
  §2** for the definition of a mechanism — what qualifies, what does not, and the
  mandatory beat it feeds — and **never restates it**. One rule, one home; a
  second copy of that definition is the exact drift this repo already refuses.
- **§2 — Valence, and the priority rule.** `positive` (why this works; what builds
  the result) is the default and the priority. `negative` (why past attempts fail;
  what quietly undoes progress) is a minority device, capped at **consumption**
  time (D5), never at authoring time.
- **§3 — The bank.** One `###` block per mechanism:

| field | what it holds |
|---|---|
| `id` | short stable slug, so a skill can name a mechanism without quoting it |
| `mechanism` | the one specific Vietnamese sentence |
| `valence` | `positive` \| `negative` |
| `fits` | which triggers, objections or myths it answers — **described, never persona-named**, so the persona roster stays open |
| `proof_family` | which `brand/proof-points` family its trace would lean on |
| `notes` | what it is *not*; where it has failed |

`fits` being described rather than persona-named is load-bearing, not stylistic:
a persona name inside the bank would be a KB document hard-coding a roster the
roster document owns, and would make a retired persona silently strand entries.

**`id` uniqueness and `valence` legality are conventions of the document, not
validated by anything.** That is the accepted cost of the format (see Risks).

**Why Markdown in the KB rather than the four alternatives.** All four were
considered and rejected — see *Rejected alternatives* below. The short reason: the
KB already **is** a governed, versioned, revision-reviewed document store with a
human approval screen, and the bank's content is prose (a sentence, what it fits,
where it failed) that no thinner structure holds. Everything else costs
`content`-repo work to rebuild what already exists.

### D2 — The bank is a static library; rotation stays where it already lives

The bank records **no** usage history, **no** last-used period and **no** retired
state. Nothing writes back to it except a harvest proposal an operator approves.

Cross-period rotation bookkeeping written in prose, with no enforcement and no
validator, would be a field every consumer is trusted to update and no consumer is
checked on — the class of rule that is wrong within two months and then quietly
believed. The concentration failure it would address is **already bounded inside a
period** by `ssc-post-ideate`'s ~¼ mechanism-spread tally, which is enforced where
the tally is actually computable.

*Alternative rejected:* `last_used_period` + `retired: true` per entry. Revisit
only if the bank passes roughly 50 entries or starts changing monthly.

### D3 — `ssc-approaches-core` becomes bank-first, and invention stays visible

Three edits to the existing skill, and no change to what it is allowed to do.

1. **Step 1 gains one live read: `craft/mechanism-bank`.** It joins the existing
   doctrine loads under the existing hard rule — check `missing`, retry once, then
   **STOP the run and name the document**. Never proceed from a remembered bank.
   The bank is doctrine; a run that silently skipped it would produce a supply
   indistinguishable from today's while claiming to be bank-first.
2. **Step 4 matches before it authors.** The supply is built by matching bank
   entries against the voice-of-customer items Step 3 found. Every supplied
   candidate names the `bank_id` it came from.
3. **Gap-fill is the only sanctioned invention.** Where no bank entry fits a VOC
   item, the core authors a new candidate and marks it **`in_bank: false`**. An
   invented mechanism must be *visibly* invented — that flag is what the harvest
   skill (D9) later acts on, and what tells an operator reading the approved doc
   which lines are new craft rather than standing craft.

**The return shape gains exactly two fields per candidate** — `bank_id` (string
or `null`) and `valence` — and nothing is renamed or dropped:

```
candidate_mechanisms: [ { mechanism, bank_id | null, valence,
                          explains: { quote, source },
                          proof: { family, trace, verified | unverified_for_period },
                          indirectness } ]
```

**What does not change, and must be restated in the file so nobody relaxes it:**

- The core still **holds no mutation tool**. `tools` stays exactly
  `[get_knowledge, search_knowledge]`. It does not write the bank, does not
  propose a revision, and approves nothing. That is what makes it safe for two
  pipelines to share, and it is the reason harvesting is a KB-pipeline job (D9).
- The core **enforces no quota**. It reports the valence mix; a quota is a rule
  about *usage*, and usage happens at Ideate (D5).
- Both volume floors stand unchanged — one candidate per featured persona, and
  enough that no single candidate would have to carry more than about a quarter
  of the period's planned assets. **The bank makes reaching those floors cheaper;
  it does not lower them.**
- The one `channel` conditional stays the only conditional. The bank read is
  unconditional; the firewall binding on `channel='post'` applies to a bank-drawn
  candidate exactly as it applies to an authored one.

### D4 — The bank saves the AUTHORING, never the GROUNDING

A bank entry still requires an **attributed voice-of-customer quote from this
period** to be supplied. A bank entry with nothing this month to explain is **not
supplied**, however good it is.

This is the single most load-bearing bound on the whole change. Without it the
bank becomes a menu that lets a run skip the outward-facing half of Approaches and
still look complete — which is precisely the "supply is only as good as one run's
reading" failure inverted, and worse, because it would be invisible. Every other
Step 4 rule holds exactly as written today: the proof route is selected only from
this period's stated `head.proofInventory`; a candidate whose only proof route is
refused by `rules/compliance` is **dropped, not softened**; indirectness is judged
against the **inherited** sophistication read and no bar is derived where the
quarter states none.

### D5 — Valence is enforced at Ideate, and the ~¼ cap is untouched

Vocabulary: `positive` | `negative`, defined in the bank's §2 and nowhere else.

**The new rule.** Negative-valence mechanisms together carry **no more than one
third of the period's assets**. The existing per-mechanism cap (~one quarter)
is unchanged and independent of it. Over the line, ideas are **re-mechanised from
the supply's positive candidates** — never by inventing a mechanism to satisfy a
count, which is the failure the whole mechanism rule exists to stop. If the supply
holds too few positives to get under the cap, that is a **named gap** in the run's
report; the fix is the next Approaches run, not a fabrication.

*Why the cap lives at Ideate and not in the core:* the core does not know how many
assets the period runs, does not assign a candidate to an idea, and deliberately
over-supplies. A quota is a statement about the settled set, and the settled set
exists only at Ideate.

**The two Ideate skills are not symmetric, and the asymmetry is deliberate.**

| | `ssc-post-ideate` | `ssc-ads-ideate` |
|---|---|---|
| ~¼ per-mechanism spread tally | **exists today; unchanged** | **does not exist; not added here** |
| ⅓ negative-valence cap | **added** | **added** |
| `bank_id` carried into the report | **added** | **added** |
| off-supply mechanism permitted, named in the report | unchanged | unchanged |

`ssc-ads-ideate` gains the **valence tally only**. Importing the ~¼ per-mechanism
cap into it would be a second, unapproved rule change riding along on this one:
ads subjects are already held plan-wide distinct *by meaning*, the failure the ¼
cap was written for (2026-08: one mechanism on 8 of 31 posts) was observed in the
post batch, and no equivalent evidence exists for the ads pool. If it turns out to
be needed there, it is its own change with its own evidence.

Everything else about the mechanism rule is unchanged: it is a condition of
**proposing** an idea as ready for approval, never of drafting one; an idea
without a mechanism is still titled, saved, kept and given its angle; ideas
approved before a requirement landed are grandfathered per `craft/doctrine` §7.

### D6 — `bank_id` and `valence` are carried in PROSE; the approved Approaches doc is the carrier

There is no `bank_id` column and no `valence` column, and this change adds none.
Two consequences that an implementer must not solve some other way:

1. **The two Approaches caller skills compose the two labels into the persisted
   document.** `ssc-ads-approaches`'s §Candidate mechanisms template and
   `ssc-post-approaches`'s §3 candidate block each gain `bank_id` (or
   `in_bank: false`) and `valence` on every candidate block. This is the only
   channel by which valence reaches Ideate at all — `plan.context` is what Ideate
   reads, so a label the caller drops is a label that does not exist downstream.
   **The labels are structural English inside a Vietnamese document**, exactly as
   the rest of the plugin treats field labels; the mechanism sentence, `fits`
   phrasing and every quote stay Vietnamese.
2. **`bank_id` / `in_bank` are run-time report fields, not durable ones.** Ideate
   carries `bank_id` **through into its run report**, not onto a row: `save_idea`
   takes one free-text `mechanism` argument and no provenance argument. Nothing
   may stuff an id, a bracket tag or a valence marker into the Vietnamese
   mechanism sentence to smuggle provenance onto the row — that would corrupt the
   one string the writer must carry verbatim.

This is what makes D9's harvest a **diff**, not a lookup: harvest determines bank
membership by comparing a period's persisted mechanism text against the live bank,
because there is no stored flag to read. Deriving membership is slightly weaker
than reading it and is the accepted price of adding no column.

**This is the edit the in-flight change's DL2 anticipated.** That change froze
`ssc-ads-approaches` Step 6's template only to prove its refactor was
behaviour-preserving, and recorded the residual duplication with the resolution
"the next edit to either Approaches skill removes the copy". So this change may —
and does — edit both templates, and while it is in there it removes the residual
restatement of the per-candidate construction that the core now owns.

### D7 — The angle-local override lives in `ssc-ads-brief`, with the channel-agnostic rule in `ssc-brief-core`

The invariant changes from **one subject, one mechanism** to **one angle, one
mechanism**. An angle brief **may author an angle-local mechanism override** when
the inherited mechanism does not serve that angle's persona × route and a better
one exists.

**Where it lands is a design decision, because the two brief skills are not wired
the way the brainstorm's file list implies.** `ssc-ads-brief` does **not**
dispatch `ssc-brief-core`; it derives the five narrative fields inline and holds
`save_brief`. A post has exactly one angle, so in practice the override is an
ads-channel affordance. Therefore:

- **`ssc-ads-brief` is where the override is authored and persisted.** It owns
  persona × route, it is the only place that judges an angle against a subject,
  and it is the only holder of `save_brief`. Relaxing the rule only in
  `ssc-brief-core` would ship the permission as unreachable prose while
  `ssc-ads-brief`'s ten restatements of the absolute rule kept refusing it —
  including a hard score cap at 2 for "supplies a competing mechanism" and an
  explicit "never pass a mechanism" on the save call. **Every one of those
  restatements must be re-read and re-bounded in the same edit**; a missed one is
  a file that contradicts itself, which is worse than not making the change.
- **`ssc-brief-core` carries the same rule channel-agnostically**, because it is
  shared and because a channel that later fans out must inherit the bounded rule
  rather than the absolute one. Its return block gains the override alongside the
  carried mechanism, and — since it holds no mutation tool — **the caller
  persists**. It authors nothing on its own initiative and still never varies a
  mechanism it was not asked to override.

**The bounding conditions, all of which must hold:**

- **Bank-first**, exactly as Approaches is. A bank entry is preferred; a new
  mechanism is authored only where none fits, and is marked `in_bank: false`.
- **Judged against `craft/doctrine` §2, read live.** The override meets the same
  definition every other mechanism meets. The definition is not restated in any
  skill file.
- **Grounded in an attributed voice-of-customer item from the approved Approaches
  document.** The brief runs **no** voice-of-customer pass of its own and opens no
  second outward account of the period. A phrase it cannot attribute does not
  support an override.
- **Proof-routed from this period's stated inventory**, and **dropped — not
  softened, not re-traced** — if `rules/compliance` refuses its only route.
- **Angle-local, always.** `idea.mechanism` is **never** written, patched or
  demoted. Sibling angles are never re-opened, never re-run and never reported
  stale.
- **Always reported** as an override, naming its `bank_id` or `in_bank: false`, so
  a human reviewing the draft angle sees that it departed from its subject.

**What still fails.** An angle that can be written to neither the inherited
mechanism nor a defensible override is still a **misfit angle**: dropped, below
bar, and said so. The override is not an escape hatch for a weak angle; it is for
the case where the *angle* is right and the *inherited mechanism* is wrong for it.

*Alternative rejected:* letting the override write `idea.mechanism` when a
majority of angles disagree with it. That re-opens approved siblings, silently
changes what already-produced copy was written to, and turns a brief-level
judgement into a subject-level one no operator approved.

### D8 — `ssc-ads-writer` resolves brief-override-first, and is only half-blocked on the server

Resolution order: **the brief's override if present, otherwise the idea's.** The
writer still never restates or varies whichever one it resolved, and the six-item
copy floor's mechanism beat is satisfied from the resolved one.

This is cheaper than it looks: `get_brief` already returns the brief **and its
owning idea** in one call, and the writer already reads `idea.mechanism` off that
response. So the writer needs only server item 3 (`get_brief` returns
`mechanism`); it does not need item 4 (`get_idea` / `list_ideas` returning
`mechanism`), which is what harvest needs. Until item 3 lands, `brief.mechanism`
simply reads as absent and the writer resolves the idea's, which is exactly
today's behaviour — the degraded state is the current state.

The legacy-tolerance rule is unchanged and now covers three cases rather than two:
no override and no `idea.mechanism` is still **reported, never invented**.

### D9 — `ssc-kb-mechanism-harvest` — a new propose-only skill under `ssc-kb-agent`

**File:** `plugins/ssc/skills/ssc-kb-mechanism-harvest/SKILL.md` — the directory
name must equal the frontmatter `name`, which the bundle build enforces.

```yaml
metadata:
  type: skill
  stage: harvest
  section: knowledge
  capability: edit
  tools: [get_knowledge, list_ideas, list_briefs, get_idea, get_brief,
          propose_knowledge_revision]
```

Registered in `ssc-kb-agent`'s `orchestrates:` list, and in `commands/ssc-kb.md`
where that file enumerates stages.

**What it does.** For a given period it reads the approved ideas and briefs,
collects the mechanisms with no match in the bank (plus any off-supply mechanism
Ideate settled), diffs them against `craft/mechanism-bank` **read live**, and
**proposes** the genuinely new ones into the document — tagging `valence`, filling
`fits` from the voice-of-customer item the mechanism was grounded in and
`proof_family` from the route it was traced to.

**Near-duplicates become proposed REVISIONS of the existing entry**, naming which
entry and why — never a second entry saying the same thing in different words.
Silent merging is the alternative and it is refused: the operator must see that
two authors reached the same mechanism, because that is the signal the entry is
worth sharpening.

**Propose-only, by construction.** It holds no `save_knowledge` and no
`edit(entity='knowledge')` — both write the live KB directly and ungated — and no
`approve`. Every adoption reaches the bank through `propose_knowledge_revision`
and an operator's approval on the existing KB revision screen. This mirrors
`ssc-kb-revise` exactly, which is why the KB pipeline is the right home.

*Alternative rejected:* letting `ssc-approaches-core` propose into the bank as it
gap-fills. Rejected on principle — the core holds no mutation tool, and that is
precisely what makes it safe for two pipelines to share. A shared skill is the
worst possible place to erode propose-only, because the erosion lands in every
channel at once.

**It writes no usage history and retires nothing** (D2).

### D10 — The `content`-repo server change is real, required, and staged

Four items, all in the `content` repo, verified live rather than assumed:

1. `briefs.mechanism` — nullable text column.
2. `save_brief` accepts `mechanism`; `edit(entity='brief')`'s allowlist gains it.
   It is an **ordinary field, not approval-bearing** — so the governance hook, its
   `hooks.json` matchers and the `edit`-carrying-an-approval-field rule are all
   untouched, and no new gate appears.
3. `get_brief` / `list_briefs` return it.
4. `get_idea` / `list_ideas` return `mechanism`. **They do not today** —
   `ssc-post-ideate` states this explicitly and works around it by declining to
   reconstruct a mechanism from a title. An override rule is unsound while the
   brief cannot read what it is overriding, and harvest cannot see a period's
   mechanisms at all, so this item is not optional.

**This is a second repository**, so per the workspace cross-repo rule the list is
presented for approval before any file in `content` is touched, and it is tracked
as its own task group. The plugin side does **not** assume it has landed — see the
Migration Plan for exactly what degrades and how it is reported.

### D11 — Governance: what this change must not touch

- **Propose-only holds everywhere.** No skill or agent gains `approve`,
  `unapprove`, `update_status`, or any publish/schedule tool. No `edit` patch in
  this change carries `status`, `approved`, `<gate>_approved` or `gate`.
- **`plugins/ssc/hooks/approval-gate.mjs`, `hooks.json` and
  `approval-gate.test.mjs` are not modified.** `brief.mechanism` is an ordinary
  field; the hook's three matcher families are unchanged. `node --test hooks/` is
  run as a **regression** check, not because anything there changed.
- **No KB content is hard-coded.** Every skill names `craft/mechanism-bank` (and
  `craft/doctrine` §2) and reads it live. **No mechanism sentence, no bank `id`,
  no `valence` example, no `fits` phrasing and no persona name is written into any
  skill file.** The bank is revised on its own cadence; a baked-in copy would go
  stale silently and then outrank the live document it was meant to reflect.
- **A failed KB read STOPS the run and names the document** — in the core, in the
  brief skills, and in harvest. Never a fallback to a remembered version.
- **Persisted prose is Vietnamese** — bank entries, mechanism sentences, override
  sentences, harvest proposal bodies. Field labels (`bank_id`, `valence`,
  `in_bank`) are structural English.
- **Every MCP tool named already exists on the BrandOS surface.** This change
  introduces no new plugin-side tool; the only new *server* surface is D10's
  `mechanism` field on existing tools.

### D12 — Wiring and the gates that actually exist

- `plugins/ssc/agents/ssc-kb-agent.md` — `orchestrates:` gains
  `ssc-kb-mechanism-harvest`; `plugins/ssc/commands/ssc-kb.md` gains the stage
  where it enumerates them. The command stays a thin entry point.
- Root `CLAUDE.md` — the Ads pipeline table's mechanism rule and the
  one-subject-one-mechanism statement become one-angle-one-mechanism, and the
  Knowledge-base row gains the harvest stage. (The parent workspace
  `/Users/thang/dev/ssc/CLAUDE.md` is a different repo and is **not** touched.)
- `plugins/ssc/.claude-plugin/plugin.json` — version bump from `2.56.0` to
  **`2.57.0`** (minor: a new skill plus additive behaviour, no removal), **in the
  same commit** as the prose. Operators update by version; an unbumped change
  never reaches them.
- `chatgpt/workflows.json` — regenerated via `scripts/publish-chatgpt-bundle.sh`
  and committed here. The mirror commit in `content/` and the brandos-express
  deploy are **operator actions**, named but not performed by this change.

**There is no test harness for prose.** The gates that exist, all of which must
pass with reported output:

1. `node scripts/build-chatgpt-bundle.mjs` — the real gate on the new skill. It
   fails on a skill directory that does not match its frontmatter `name`, on a
   missing `metadata.dispatches`, and on an `orchestrates` entry with no such
   skill. This is what proves `ssc-kb-mechanism-harvest` is wired.
2. `node --test hooks/` from `plugins/ssc/` — regression only; report actual
   counts.
3. `scripts/publish-chatgpt-bundle.sh --check` — exits 1 if the mirror is stale.
4. **Real-path check**, since nothing else exercises prose: run `/ssc-ads-plan`
   for a period against a seeded bank and confirm the returned supply names
   `bank_id` on the entries it drew and `in_bank: false` on the ones it authored,
   and that the persisted Approaches doc carries both labels per candidate.

### Rejected alternatives

Recorded so none is re-proposed as an obvious improvement.

**Bank as a BrandOS taxonomy** — mechanisms as taxonomy terms with a valence
attribute, tagged onto ideas. Buys exact dedup and a future per-mechanism
performance rollup. **Rejected:** substantial `content`-repo work, and taxonomy
terms are thin — the mechanism sentence, its `fits` and its proof route still need
a prose home, so both stores would have to be maintained in step.

**Bank as a first-class `mechanisms` table** with FKs from ideas and briefs.
Strongest guarantees and the most server work. **Rejected:** it duplicates what
the KB already is — a governed, versioned, revision-reviewed document store with a
human approval screen — and would need a new review UI to match what the KB
already has.

**JSON-bodied document, or a bespoke bank editor in the dashboard.** Fenced-JSON
entries would make id lookup and dedup machine-exact; an editor would make the doc
pleasant to maintain. **Rejected/deferred:** the bank is edited rarely — seeded
once, then grown by harvest proposals that already pass through the KB revision
review screen — and an editor is a **third** repo scope on top of the server
change. Revisit if the bank passes roughly 50 entries or starts changing monthly;
Markdown forecloses neither.

**Letting `ssc-approaches-core` propose into the bank directly** — see D9.

**Tracking last-used period and a retired flag per entry** — see D2.

**Persisting `bank_id` / `valence` as columns on `ideas` and `briefs`** — would
make harvest a lookup instead of a diff and make the valence tally exact.
**Rejected:** it doubles the approved server-change surface for a reporting
nicety, and the diff-against-the-live-bank path works with the single column D10
already requires. The settled server list is exactly four items.

**Giving harvest `save_knowledge` so an obvious new entry lands without a click.**
**Rejected outright:** it writes the live KB ungated and would put an
agent-authored mechanism into doctrine that every future period draws from. This
is the propose-only invariant at its most consequential.

## Risks / Trade-offs

- **`id` uniqueness and `valence` legality are unvalidated conventions** → A
  duplicate `id` or a bogus valence value ships silently, and a consumer that
  matches on `id` could bind to the wrong entry. Mitigation: harvest's
  near-duplicate pass is the only routine writer and it proposes a **revision of
  the existing entry** rather than a new one; the bank's §2 states the two legal
  valence values; the KB revision review screen is a human read of every change.
  Accepted, explicitly, as the price of Markdown (D1).
- **Relaxing the brief's absolute hard rule widens the surface where a mechanism
  can be invented** → The six bounding conditions in D7 *are* the mitigation, and
  they only work if all six are written into `ssc-ads-brief` and `ssc-brief-core`
  together. The reporting obligation is the backstop: an override a human never
  sees is the failure mode, so "always reported, naming `bank_id` or
  `in_bank: false`" is not optional prose.
- **`ssc-ads-brief` restates the absolute rule in ~10 places** → A partial edit
  leaves the file contradicting itself, and the *strictest* statement usually wins
  wherever it is read first. Mitigation: grep the file for `mechanism` /
  `cơ chế` after the edit and confirm every hit is either the bounded rule or a
  correct consequence of it — in particular the Step 5 hard score cap and the
  "never pass a mechanism" instruction on `save_brief`.
- **The degraded pre-server state reads as a bug** → Between the plugin release
  and the server change, an override is **reported and not persisted**. That looks
  identical to a dropped write. Mitigation: the skills state the degradation in
  the run report in the operator's own terms ("override authored, not persisted —
  server field not yet available"), and the Migration Plan below makes it a named
  phase rather than an accident.
- **Harvest is inert until server item 4 lands** → `list_ideas` / `get_idea` do
  not return `mechanism` today, so a harvest run before that ships can see almost
  nothing. Mitigation: the skill reports "no readable mechanisms for this period —
  the tool surface does not expose the field" rather than reporting an empty
  harvest as a clean one. An empty result that looks successful is the worse
  failure.
- **Valence cannot be tallied against an Approaches doc approved before this
  change** → Those documents carry no `valence` labels. Mitigation: Ideate reports
  "valence not stated in the approved supply — cap not applied" and applies no cap.
  It never infers a valence from the mechanism's wording; a guessed valence would
  enforce a cap nobody's document supports.
- **Bank-first homogenises the output over time** — every month draws the same
  strong entries → Mitigation is the existing ~¼ per-mechanism spread cap within a
  period, plus gap-fill continuing to author against *this* period's VOC items
  (D4). Cross-period rotation is deliberately not solved here (D2); if
  homogenisation shows up in a look-back, that is the evidence D2 said would
  justify revisiting.
- **The ⅓ negative cap forces a re-mechanise that fits worse than the original** →
  Mitigation: re-mechanise **from the supply's positives** only, and where the
  supply holds too few positives, report the gap and leave the cap breached rather
  than inventing. A named breach is recoverable; a fabricated mechanism is not.
- **The in-flight change is not archived, so both changes touch the same files** →
  `ssc-approaches-core`, both Approaches callers, both Ideate skills and
  `ssc-brief-core` are shared. Mitigation: this design was written against the
  files as they stand *after* that change shipped (2.56.0), and D6 is explicitly
  the edit its DL2 licensed. Nothing here re-freezes or re-opens a DL1/DL2
  resolution. Archive order does not matter; edit order does — do not implement
  this change against a pre-2.55.0 working tree.
- **The bundle build only checks wiring, not content** → It cannot catch a missing
  `valence` label in a doc template or a persona name smuggled into the bank
  section of a skill. Mitigation: gate 4 in D12 (the real-path `/ssc-ads-plan`
  run) is the only check that sees composed output, so it is a required gate, not
  a nice-to-have.

## Migration Plan

No data migration on the plugin side: no schema, no back-fill, no re-opened row.
Three stages, each coherent on its own.

**Stage 0 — the operator seeds `craft/mechanism-bank` in BrandOS.** The document's
structure and its §1/§2 rules ship with this change as specification; the
Vietnamese entries are brand content authored in the KB. Until the document
exists, `ssc-approaches-core` **stops** on its Step 1 read and names it — which is
the correct behaviour for a missing doctrine document and is why seeding is
stage 0, not stage 3. It is a one-line operator prerequisite, and the plugin
release should not precede it.

**Stage 1 — this repo, a single commit.**

1. New skill `ssc-kb-mechanism-harvest`; edits to `ssc-approaches-core`,
   `ssc-ads-approaches`, `ssc-post-approaches`, `ssc-post-ideate`,
   `ssc-ads-ideate`, `ssc-brief-core`, `ssc-ads-brief`, `ssc-ads-writer`.
2. Wiring: `ssc-kb-agent`, `commands/ssc-kb.md`, root `CLAUDE.md`.
3. `plugin.json` `2.56.0` → `2.57.0` — same commit, non-negotiable.
4. `node scripts/build-chatgpt-bundle.mjs`, then
   `scripts/publish-chatgpt-bundle.sh`; commit the regenerated
   `chatgpt/workflows.json` in the same commit.
5. Operator actions, named but not performed here: commit the refreshed mirror in
   `content/`, deploy brandos-express. Until that lands ChatGPT runs the old
   prose; Cowork gets the change immediately.

**Degraded behaviour during Stage 1 — all of it reported, none of it silent:**

| Consumer | Without the server change |
|---|---|
| `ssc-ads-brief` | authors the override, **reports it, does not persist it** — `save_brief` takes no `mechanism` |
| `ssc-ads-writer` | resolves `idea.mechanism` as today; `brief.mechanism` reads absent |
| `ssc-kb-mechanism-harvest` | reports that mechanisms are not readable through the tool surface for the period; proposes nothing |
| everything else (bank read, bank-first supply, `in_bank` flag, valence cap) | **fully functional** — none of it depends on the server change |

**Stage 2 — the `content` repo**, as its own approved task group: `briefs.mechanism`
column + migration; `save_brief` and `edit(entity='brief')` allowlist;
`get_brief` / `list_briefs` return it; `get_idea` / `list_ideas` return
`mechanism`. No plugin change is needed when it lands — the skills already read
the field and treat its absence as absence, so Stage 1's prose is
forward-compatible by construction.

**Rollback.** Stage 1 reverts as a single commit plus a bundle republish; nothing
persisted changes shape, so there is nothing to unwind. Stage 2's column is
nullable and additive — reverting the tool allowlist strands written values
harmlessly and returns the system to Stage 1's degraded-but-coherent state. The
bank document itself is never deleted by a rollback: an unread KB document costs
nothing, and deleting it would destroy operator-authored brand content.

## Open Questions

None blocking. Two items are tracked as coordination, not as unresolved design:

- **The `content`-repo change list (D10) needs the user's explicit approval before
  any file in that repo is touched**, per the workspace cross-repo rule. The
  plugin work does not wait on it and does not assume it.
- **Revisit the format when the bank passes roughly 50 entries or starts changing
  monthly** (D1/D2). That is a stated trigger with a stated answer — fenced JSON
  or a dashboard editor — not an open question about this change.

## Drift Log

### DL1 — Harvest cannot fetch the Approaches document, so the operator supplies it

**Decision affected:** D9. Each proposed bank entry carries its `valence`, its `fits`
taken from the voice-of-customer item it was grounded in, and its `proof_family` taken
from the route it was traced to — with the skill's tools fixed at
`[get_knowledge, list_ideas, list_briefs, get_idea, get_brief, propose_knowledge_revision]`.

**What implementation found:** all three of those values live **only** in the period's
approved Approaches document (`channel_plans.context`), and neither the skill nor
`ssc-kb-agent` holds a plan-read tool. D9 fixes the tool list, so the skill cannot fetch
what it needs to fill a proposal.

**Resolution — the input moves to the operator, the tool list does not move.** The
period's approved Approaches document is now a **documented required input** to
`mode: harvest`, in both `commands/ssc-kb.md` and `ssc-kb-agent.md`. Where it is not
supplied, the run **reports the gap and proposes nothing** rather than inventing a
`valence`, a `fits` or a `proof_family`.

**Why not widen the tool list.** Adding a plan read to a KB-pipeline skill is a design
change, not a fix: it gives the knowledge pipeline a dependency on channel plan state
that D9 deliberately kept out, and the propose-only construction is easier to defend
when the tool list is small and fixed. The cost is one more thing the operator must hand
in; the benefit is that the skill still cannot reach anything it does not need.

**Second inert path, recorded.** Combined with `get_idea` / `list_ideas` not returning
`mechanism` until D10 lands (Migration Stage 2), harvest has **two** independent reasons
to propose nothing. Both are reported, neither is silent, and neither is worked around.
