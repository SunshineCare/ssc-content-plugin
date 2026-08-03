# The mechanism bank: a standing KB supply instead of a monthly invention

**Date:** 2026-08-03
**Status:** design, approved for planning
**Touches (this repo):** `plugins/ssc/skills/ssc-approaches-core`,
`ssc-brief-core`, `ssc-post-ideate`, `ssc-ads-ideate`, `ssc-ads-writer`,
`plugins/ssc/skills/ssc-kb-mechanism-harvest` (new),
`plugins/ssc/agents/ssc-kb-agent.md`, `.claude-plugin/plugin.json`,
`chatgpt/workflows.json` (regenerated)
**Touches (`content` repo — separate approval required):** `briefs.mechanism`
column, `save_brief`, `edit(entity='brief')` allowlist, `get_brief` /
`list_briefs` / `get_idea` / `list_ideas` read shapes
**Seeded outside both repos:** the `craft/mechanism-bank` KB document itself,
authored by the operator in BrandOS

## The problem

Every month the system invents its mechanisms from scratch.

`ssc-approaches-core` Step 4 authors a candidate-mechanism supply per period,
grounded in that period's voice-of-customer pass. Nothing carries forward. A
mechanism that worked in June is re-derived in July, or — more often — is not
re-derived, and a near-identical one is written in slightly different words.
Three costs follow:

1. **Re-derivation is the expensive half of Approaches.** The VOC pass is
   genuinely per-period; the *craft* of "why this works, or why past attempts
   fail" is not. It is doctrine, and doctrine belongs in the knowledge base.
2. **The supply is only as good as one run's reading.** A mechanism the brand
   has already proven can be missed entirely because this month's reading did
   not surface it, and nothing notices.
3. **Nothing accumulates.** There is no place where the brand's mechanisms are
   written down, so no operator can look at them as a set, and no revision
   cycle can improve one.

Separately, the mechanisms the system produces skew toward failure framing —
"why past attempts fail" — because that framing is easier to write from a VOC
objection. Nothing states a preference, so nothing corrects the drift.

## What is being built

A standing, governed supply of mechanisms in the knowledge base, which the
Approaches step draws from before it authors anything new; a valence rule that
keeps the mix positive; a bounded angle-level override for the one place the
inherited mechanism genuinely does not fit; and a KB skill that feeds newly
authored mechanisms back into the bank.

## 1. `craft/mechanism-bank` — the doc

A new KB document, category `craft`, Vietnamese, **structured Markdown** (not
JSON, and no bespoke editor — see *Rejected alternatives*).

- **§1 — What this doc is.** The standing supply of mechanisms. It points at
  `craft/doctrine` §2 for the *definition* of a mechanism — what qualifies,
  what does not, and the mandatory mechanism beat it feeds — and **never
  restates it**. One rule, one home.
- **§2 — Valence, and the priority rule.**
  - `positive` — why this works; what builds the result.
  - `negative` — why past attempts fail; what quietly undoes progress.
  - Positive is the default and the priority. Negative is a minority device,
    capped at consumption time (§3 below).
- **§3 — The bank.** One `###` block per mechanism:

| field | what it holds |
|---|---|
| `id` | short stable slug, so a skill can name a mechanism without quoting it |
| `mechanism` | the one specific Vietnamese sentence |
| `valence` | `positive` \| `negative` |
| `fits` | which triggers, objections or myths it answers — **described, never persona-named**, so the persona roster stays open |
| `proof_family` | which `brand/proof-points` family its trace would lean on |
| `notes` | what it is *not*; where it has failed |

**The bank is a static library.** It records no usage history, no last-used
period, and no retired state. Rotation is not the bank's job: it stays where it
already lives, in Ideate's per-period concentration cap.

`id` uniqueness and `valence` legality are **conventions of the doc**, not
validated by anything. That is the accepted cost of the Markdown format.

**Seeding.** The operator authors the entries in BrandOS. This repo ships the
structure and the §1/§2 rules only — the Vietnamese entries are brand content,
not a repo artifact.

## 2. Supply — `ssc-approaches-core` Step 4 becomes bank-first

1. **Step 1 gains one live read:** `craft/mechanism-bank`. It joins the existing
   doctrine loads, and the existing hard rule applies unchanged — check
   `missing`, retry once, then **STOP the run and name the document**. Never
   proceed from a remembered bank.
2. **Step 4 matches before it authors.** The supply is built by matching bank
   entries against the voice-of-customer items Step 3 found. Every supplied
   candidate names the `bank_id` it came from.
3. **Gap-fill is the only sanctioned invention here.** Where no bank entry fits
   a VOC item, the core authors a new candidate and marks it `in_bank: false`.
   An invented mechanism must be visibly invented — that flag is what the
   harvest skill (§5) later acts on.
4. **Valence: positive-first, and reported.** Every candidate carries its
   `valence`, and the return states the mix. The core **enforces no quota** — it
   proposes, and a quota is a rule about *usage*, which belongs where usage
   happens.
5. **Grounding is unchanged, and the bank does not relax it.** A bank entry
   still requires an **attributed voice-of-customer quote from this period** to
   be supplied. The bank saves the *authoring*; it never saves the *grounding*.
   A bank entry with nothing this month to explain is not supplied. Every other
   Step 4 rule holds exactly as written today: the proof route is selected only
   from this period's stated `head.proofInventory`; a candidate whose only proof
   route is refused by `rules/compliance` is dropped, not softened; indirectness
   is judged against the **inherited** sophistication read and no bar is derived
   where the quarter states none.
6. **Volume rules are unchanged.** Both existing floors stand — one candidate
   per featured persona, and enough that no single candidate would have to carry
   more than about a quarter of the period's planned assets. The bank makes
   reaching those floors cheaper; it does not lower them.
7. **The return shape gains exactly two fields per candidate** — `bank_id`
   (string or `null`) and `valence`. No field is renamed or dropped.

The core still **holds no mutation tool**. It does not write to the bank, does
not propose a revision, and does not approve anything. That invariant is what
makes it safe for two pipelines to share, and this change does not touch it.

## 3. Consumption — Ideate, and the valence quota

`ssc-post-ideate` (round 3) and `ssc-ads-ideate` change in two ways:

- **They carry `bank_id` through** onto the mechanism they settle, so every
  downstream reader — and the harvest skill — can tell a bank draw from an
  invention. The existing permission to settle an **off-supply** mechanism
  stands, and stays subject to the existing requirement that the report names it
  as off-supply.
- **They enforce the valence quota.** The existing cap is unchanged: no single
  mechanism carries more than about a quarter of the period's assets.
  **New: negative-valence mechanisms together carry no more than a third of the
  period's assets.** Over that line, ideas are re-mechanised from the supply's
  **positive** candidates — never by inventing a mechanism to satisfy the count,
  which is the failure the whole mechanism rule exists to stop. If the supply
  holds too few positives to get under the cap, that is a **named gap** in the
  run's report and the fix is the next Approaches run, not a fabrication.

Everything else about the mechanism rule is unchanged: it is a condition of
*proposing* an idea as ready for approval, never of drafting one; an idea
without a mechanism is still titled, saved, kept and given its angle; ideas
approved before a requirement landed are grandfathered.

## 4. The angle-local override — the invariant that changes

Today `ssc-brief-core` states a hard rule: it *never authors, restates or varies
a mechanism.* The mechanism is settled once at Ideate, stored on the idea, and
inherited by every angle beneath it.

That rule is now bounded rather than absolute. An ads subject fans into several
angle briefs (persona × route), and a mechanism that serves one persona × route
can be genuinely wrong for another.

**The new rule.** An angle brief **may author an angle-local mechanism override**
when the inherited mechanism does not serve that angle's persona × route and a
better one exists. It is bounded by all of the following:

- **Bank-first**, exactly as Approaches is. A bank entry is preferred; a new
  mechanism is authored only where none fits, and is marked `in_bank: false`.
- **Judged against `craft/doctrine` §2, read live.** The override meets the same
  definition every other mechanism meets.
- **Grounded in an attributed voice-of-customer item from the approved
  Approaches document.** The brief runs **no** voice-of-customer pass of its own
  and opens no second outward account of the period. A phrase it cannot
  attribute does not support an override.
- **Proof-routed from this period's stated inventory**, and dropped — not
  softened, not re-traced — if `rules/compliance` refuses its only route.
- **Angle-local, always.** `idea.mechanism` is **never** written, patched or
  demoted. Sibling angles are never re-opened, never re-run, and never reported
  stale. The guarantee the system now makes is **one angle, one mechanism** — not
  one subject, one mechanism.
- **Always reported** as an override, naming its `bank_id` or `in_bank: false`,
  so a human sees that this angle departed from its subject.

A post has exactly one angle, so in practice this is an ads-channel affordance;
the rule is written channel-agnostically because the brief core is shared.

`ssc-ads-writer` resolves the mechanism it writes to as: **the brief's override
if present, otherwise the idea's.** It still never restates or varies whichever
one it resolved.

### The server change this requires (`content` repo)

There is nowhere to persist an angle-local mechanism today. Verified live:
`save_brief` takes no `mechanism` argument, and `edit(entity='brief')`'s
allowlist is the narrative fields. Four items, all in the `content` repo:

1. `briefs.mechanism` — nullable text column.
2. `save_brief` accepts `mechanism`; `edit(entity='brief')`'s allowlist gains it.
   It is an **ordinary field, not approval-bearing**, so the governance hook is
   untouched and no new gate appears.
3. `get_brief` / `list_briefs` return it.
4. `get_idea` / `list_ideas` return `mechanism`. **They do not today** —
   `ssc-post-ideate` states this explicitly and works around it by declining to
   reconstruct the mechanism from the title. An override rule is unsound while
   the brief cannot read what it is overriding, so this item is not optional.

**This is a second repository.** Per the workspace rule on cross-repo changes,
the list above is presented for approval before any file in `content` is
touched, and the plugin-side work does not assume it has landed: until the
server fields exist, the override is **reported and not persisted**, which is a
degraded but coherent state.

## 5. `ssc-kb-mechanism-harvest` — how the bank grows

A new skill orchestrated by `ssc-kb-agent`.

- Frontmatter: `type: skill`, `section: knowledge`, `stage: harvest`,
  `capability: edit`.
- Tools: `get_knowledge`, `list_ideas`, `list_briefs`, `get_idea`, `get_brief`,
  `propose_knowledge_revision`.
- **What it does.** For a given period, it reads the approved ideas and briefs,
  collects every mechanism marked `in_bank: false` (plus any off-supply
  mechanism Ideate settled), diffs them against `craft/mechanism-bank` read
  live, and **proposes** the genuinely new ones into the doc — tagging `valence`,
  filling `fits` from the voice-of-customer item the mechanism was grounded in
  and `proof_family` from the route it was traced to.
- **Near-duplicates are reported, not merged.** Where a harvested mechanism
  restates an existing entry in different words, it proposes a **revision of the
  existing entry** rather than a new one, and says which entry and why.
- **Propose-only.** It holds no `save_knowledge` and no `edit(entity='knowledge')`
  — both write the live KB directly and ungated — and no `approve`. Every
  adoption reaches the bank through `propose_knowledge_revision` and an
  operator's approval on the existing KB revision screen.
- It writes no usage history and retires nothing: the bank is static (§1).

## Rejected alternatives

**Bank as a BrandOS taxonomy.** Mechanisms as taxonomy terms with a valence
attribute, tagged onto ideas. Buys exact dedup and a future per-mechanism
performance rollup. Rejected: substantial `content`-repo work, and taxonomy
terms are thin — the mechanism sentence, its `fits` and its proof route still
need a prose home, so both would have to be maintained.

**Bank as a first-class `mechanisms` table** with FKs from ideas and briefs.
Strongest guarantees, most server work, and it duplicates what the KB already
is: a governed, versioned, revision-reviewed document store.

**JSON-bodied doc, or a bespoke bank editor in the dashboard.** A fenced-JSON
entry format would make id lookup and dedup machine-exact; a dedicated editor
would make the doc pleasant to maintain. Both were considered and deferred: the
bank is edited rarely — seeded once, then grown by harvest proposals that
already pass through the KB revision review screen — and the editor is a
**third** repo scope on top of the server change. Revisit if the bank passes
roughly 50 entries or starts changing monthly; the Markdown format does not
foreclose either.

**Letting `ssc-approaches-core` propose into the bank directly.** Rejected on
principle: the core holds no mutation tool, and that is precisely what makes it
safe for two pipelines to share. Harvesting belongs to the KB pipeline.

**Tracking last-used period and a retired flag on each entry.** Would let
Approaches rotate across periods and let harvest retire weak entries. Rejected
for now as cross-period bookkeeping in prose with no enforcement; the
concentration failure it would address is already bounded within a period by
Ideate's quarter cap.

## Governance — what does not change

- **Propose-only holds everywhere.** No skill in this design gains `approve`,
  `unapprove`, `update_status`, or a publish/schedule tool. `brief.mechanism` is
  an ordinary field, so `hooks/approval-gate.mjs` needs no change and the
  `edit`-carrying-an-approval-field matcher is untouched.
- **No KB content is hard-coded.** Every skill names `craft/mechanism-bank` and
  reads it live. No mechanism sentence, no `id`, no valence example, and no
  persona name is written into a skill file. A failed read stops the run.
- **Persisted prose is Vietnamese** — the bank's entries, and every mechanism a
  skill returns or persists.

## Verification

- `node scripts/build-chatgpt-bundle.mjs` — the real gate on the new skill: it
  fails on a skill directory that does not match its frontmatter `name` and on
  an `orchestrates` entry with no such skill.
- `node --test hooks/` from `plugins/ssc/` — regression only; no hook change.
- `.claude-plugin/plugin.json` version bump **in the same commit**.
- `scripts/publish-chatgpt-bundle.sh` re-run, and the refreshed mirror committed
  in the `content` repo, or ChatGPT keeps running the old prose.
- Real-path check, since there is no test harness for prose: run
  `/ssc-ads-plan` for a period against a seeded bank and confirm the returned
  supply names `bank_id` on the entries it drew and `in_bank: false` on the ones
  it authored.
