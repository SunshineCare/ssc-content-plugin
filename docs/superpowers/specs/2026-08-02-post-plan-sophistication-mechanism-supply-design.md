# Post channel: inherit the sophistication read, and supply the mechanisms

**Date:** 2026-08-02
**Status:** design, approved for planning
**Touches:** `plugins/ssc/skills/ssc-approaches-core` (new), `ssc-ads-approaches`,
`ssc-post-approaches`, `ssc-post-ideate`, `ssc-post-schedule`,
`plugins/ssc/agents/ssc-post-agent.md`, `plugins/ssc/agents/ssc-ads-agent.md`,
`plugins/ssc/commands/ssc-post-plan.md`, root `CLAUDE.md`, `plugin.json`,
`chatgpt/workflows.json` (regenerated)

## The problem

Two things landed in the system that the Posts channel never picked up.

**1. The market-sophistication read.** The quarterly strategy brief now carries
`sophisticationStage` + `sophisticationRead`, authored once at the quarter by
`ssc-strategy-ad-intelligence`. The monthly head carries it down
(`ssc-plan-research` §0, and `ssc-plan-tactics` refuses to author its own), and
`ssc-ads-approaches` inherits it as the constraint on how indirect a lead may be.
The Posts channel reads the same strategy brief and never holds either field. So
the month's organic guidance is written with no view of what the market has
already heard, and a post can open on a bare benefit claim at a saturated stage
with nothing in the pipeline noticing.

**2. The mechanism system.** `craft/doctrine` §2 makes a mechanism mandatory
before an idea may be *proposed* as ready. `ssc-post-ideate` enforces that at
round 3 — but nothing upstream supplies one. Round 2 may omit `mechanism`
entirely (correctly: fabricating one is the failure the rule exists to stop), and
round 3 then has to find one per surviving idea out of the same reading everyone
else already did. The Ads channel does not have this problem, because
`ssc-ads-approaches` Step 5 authors a **candidate-mechanism supply** for the
period, grounded in a **voice-of-customer pass** (Step 4), that Ideate picks
from. Posts has neither step.

The two are one change because they meet in the same place: the sophistication
read is what decides whether a candidate mechanism is worth proposing at all.

## What is being built

A shared sub-skill that owns the three pieces of Approaches work that are
genuinely channel-agnostic, plus the revisions to the three Posts steps that
consume it and the refactor of the Ads step that already does this work inline.

### 1. `ssc-approaches-core` — the new shared skill

`plugins/ssc/skills/ssc-approaches-core/SKILL.md`

Frontmatter: `type: skill`, `stage: shared`, `section: shared`,
`capability: view`, `tools: [get_knowledge, search_knowledge]`.

It **writes nothing** and holds no mutation tool — the same construction that
makes `ssc-brief-core` safe to share. Every save belongs to the caller, which
knows its own channel's storage shape and owns its gate checks.

**It also reads no plan state.** The caller has already read the head (it must,
for the release gate) and the quarter brief, so passing those payloads in is
strictly cheaper than a second read and keeps every gate decision in one place.

**Inputs from the caller:**

| Input | What it is |
|---|---|
| `channel` | `'ad'` or `'post'` — the only conditional in the skill |
| `period` | `YYYY-MM` |
| `head` | the head's `research`, `performanceReview`, `proofInventory`, `offerState` |
| `quarter` | `sophisticationStage`, `sophisticationRead`, and the marked findings |
| `personas` | the personas this run features, resolved by the caller from the head's steering |

**Outputs to the caller** — three blocks, returned as text for the caller to
compose into its own document:

- **Sophistication inherit.** The stage and the read, carried through verbatim.
  It never derives a read of its own. Where the brief carries none, it returns
  `NOT STATED` as a fact for the caller to report in the doc and in the summary —
  never a guessed stage.
- **Voice-of-customer.** Per featured persona: her language (verbatim where a
  source gives verbatim), triggers, objections and myths. Every quote names the
  source it came from — head research, a marked quarterly finding, her
  `brand/persona-<slug>` detail doc, or the performance review. A phrase that
  cannot be attributed does not go in. A source that yields nothing is a **named
  gap**, reported and not filled. A gap does not stop the run.
- **Candidate mechanisms.** More than the period can use, so every pairing
  downstream has something to draw on. Each carries: the mechanism itself (one
  specific sentence, per `craft/doctrine` §2 read live — never restated here);
  the quoted, attributed voice-of-customer item it explains; its **proof route**
  (the family from `brand/proof-points` plus the trace, selected only from this
  period's stated `proofInventory` — where that is `null`, the route is marked
  unverified for the period rather than assumed); and how indirect the lead must
  be, read against the inherited sophistication. A candidate whose only proof
  route is refused by `rules/compliance` is not proposed at all.

**The channel conditional, and it is the only one.** For `channel='post'` the
core additionally binds every candidate mechanism and every quoted line to
`rules/organic-vs-paid-firewall`, and refuses to source any voice-of-customer
quote or example from ad copy or the ad performance lens. The two channels are
graded on different objectives, so a line that converts in an ad routinely fails
in the feed, and importing one teaches the wrong instinct. For `channel='ad'` the
behaviour is exactly what `ssc-ads-approaches` does today.

**KB reads, live and named:** `craft/doctrine` §2, `craft/awareness-framework`,
`brand/proof-points`, `rules/compliance`, `brand/personas` + every currently
listed `brand/persona-<slug>`, and — for `channel='post'` —
`rules/organic-vs-paid-firewall`. A failed read STOPS the run and names the
document; the skill holds no copy of any rule it applies, so a remembered version
is a guess.

### 2. `ssc-ads-approaches` — refactor, no behaviour change

Its Step 1b sophistication hold, Step 4 voice-of-customer pass and Step 5
candidate mechanisms collapse into one dispatch to the core. The persisted
document keeps exactly its current section shape and wording rules, so the
artifact an operator approves does not change. This is what stops the new prose
existing in two places and drifting apart the day one is edited.

### 3. `ssc-post-approaches` — inherit, supply, and grow the doc

- Dispatches the core with `channel='post'`, passing the head payload it already
  read in Step 1 and the quarter brief from Step 3.
- Adds `brand/proof-points` and `rules/compliance` to its own KB read list (the
  core reads them too; the caller needs them to judge what it composes).
- The persisted doc goes from five sections to seven:

  | § | Heading (Vietnamese in the artifact) | Source |
  |---|---|---|
  | 1 | Điều chung cho mọi bài | unchanged — plus the sophistication constraint, once |
  | 2 | Tiếng nói khách hàng | **new** — the core's VOC block |
  | 3 | Cơ chế đề xuất | **new** — the core's candidate mechanisms |
  | 4 | Trụ cột × persona | was §2 |
  | 5 | Điểm khác biệt | was §3 |
  | 6 | Định dạng và phép thử | was §4 |
  | 7 | Ranh giới nội dung tự nhiên | was §5 |

  §1's numbered cross-references (1.1, 1.2, …) are unchanged in form; the
  pointers in the later sections are renumbered to the new section numbers.
- §1 carries the sophistication constraint **once** — how indirect this month's
  openings must be — or the `NOT STATED` gap line. Later sections point at it
  rather than restating it, per the existing anti-repetition rule.
- Length budget: **~1700 → ~2400** space-separated Vietnamese tokens, re-split as
  roughly 1200 guidance + 500 examples + 700 for the two new sections. The cap
  stays a real check (`wc -w` on the draft file before saving), because it is the
  forcing function that keeps §4–§7 terse.
- The Step 7 summary gains two lines: the inherited sophistication (or the gap),
  and the count of candidate mechanisms proposed.

### 4. `ssc-post-ideate` — pick from the supply, and clear the bar

The supply arrives through `plan.context`, which round 2 and round 3 already
read. No second `get_strategy_brief` call, no re-derivation of anything.

- **Round 2 (Titles):** where a title matches a candidate in the approved supply,
  it carries that mechanism on `save_idea`. Where none matches, the argument is
  omitted exactly as today — the existing rule stands unchanged: never delay,
  shrink or withhold a title for want of a mechanism, and never pass filler.
- **Round 3 (Angle):** settles the mechanism for each surviving idea, preferring
  the approved supply. A mechanism **not** in the supply is permitted — the
  operator approved rails, not an exhaustive list — but it is **named as
  off-supply in the run report**, so the operator sees which ideas went outside
  the doc they approved and can feed that back into next month's Approaches.
- **Round 3 sophistication bar:** the awareness stage the round declares, and the
  angle written under it, must clear the sophistication read carried in the
  approved doc. At a saturated stage a bare benefit claim does not clear it. Where
  the doc says `NOT STATED`, the round says so and applies no bar — it never
  assumes a stage.

### 5. `ssc-post-schedule` — sequence against the read

Today this step reads the channel plan for its `approaches_approved` gate check
but never holds `plan.context`. It starts holding it from that **same** response —
no new call, no new tool — and reads the sophistication line out of the approved
Approaches doc. It uses that to sequence the month: where the read says the market is saturated,
mechanism-led and indirect posts land ahead of direct ones. The summary states
the rule it applied in one line. Where the read is `NOT STATED`, it makes no
sequencing claim and says so. It adds no KB read and no new tool.

### 6. Wiring and release

- `orchestrates:` gains `ssc-approaches-core` in `ssc-post-agent.md` and
  `ssc-ads-agent.md`.
- `/ssc-post-plan`'s step table and its "Grounding order" section name the
  inherited sophistication read and the candidate-mechanism supply.
- Root `CLAUDE.md`: the Posts (plan) and Ads (plan) pipeline rows mention the
  shared core, alongside the existing `ssc-brief-core` precedent.
- `plugin.json` version bump **in the same commit** as the prose change.
- `scripts/publish-chatgpt-bundle.sh` re-run and the mirror committed in the
  `content` repo. The bundle build is the nearest thing to a test here: it fails
  on a skill directory that does not match its frontmatter `name` and on an
  `orchestrates` entry with no such skill, so it is the gate that proves the new
  skill is wired.

## Why this shape

**Why a shared core rather than targeted edits.** Duplicating the sophistication
inherit, the VOC pass and the mechanism supply into the Posts skills would give
two copies of doctrine that are supposed to say the same thing. The rule this
repo already follows — never carry a second copy of a rule, because the stale one
wins the day it drifts — applies to skill prose as much as to KB content.
`ssc-brief-core` is the working precedent: channel-agnostic work, view-only, the
caller owns every write and every channel-shaped decision.

**Why the core reads no plan state.** The caller must read the head anyway for
its release gate. A core that re-read it would either duplicate the gate logic or
run under an unapproved narrative. Passing the payload in keeps one gate, one
read.

**Why off-supply mechanisms are allowed.** The operator approves creative rails,
not a closed list of mechanisms. Refusing an off-supply mechanism would stall a
good idea behind an Approaches re-run. Reporting it gives the operator the same
information without the stall.

**Why sophistication reaches all three steps.** It constrains three different
decisions: which mechanisms are worth proposing (Approaches), whether an angle at
a declared stage clears the bar (Ideate), and what order the month reads in
(Schedule). Applying it once at the top would leave the last two unable to act on
it.

## Invariants preserved

- **Propose-only.** The core holds no mutation tool at all. No step calls
  `approve`, flips a gate, or uses `edit` to demote.
- **No hard-coded KB content.** Every doc is named with its section and read
  live; no persona name, trigger, prohibition or ladder value is restated in any
  skill file. The persona roster stays open.
- **A failed KB read stops the run**, names the document, and never falls back to
  a remembered version.
- **One outward pass per period.** The core runs no `WebSearch` and holds no
  fetch tool; the VOC pass is compiled from recorded sources only.
- **The channel authors no themes, no research, no look-back, no quantities.**
  Nothing here writes the head, `plan_targets`, or a `detail` payload.
- **Persisted prose is Vietnamese**, headings included.

## Out of scope

- The head (`ssc-plan-*`) and the quarterly strategy skills. They already author
  and carry down the sophistication read correctly; this change only consumes it.
- The Posts produce loop (`ssc-post-produce` / `ssc-post-authority`). The lead is
  picked per asset at writing time from the stage the brief declares — that
  boundary is unchanged.
- YouTube. It can adopt the core later; nothing here blocks that, and nothing
  here changes it.
- Any server-side change. Every field this design reads
  (`sophisticationStage`, `sophisticationRead`, `proofInventory`, `offerState`)
  already exists on the BrandOS surface and is already read by the Ads and head
  skills.

## Verification

No test harness exists for skill prose. The checks that do exist, all of which
must pass before the change is reported done:

1. `node scripts/build-chatgpt-bundle.mjs` — validates `metadata.dispatches`, the
   skill-dir/`name` match, and every `orchestrates` entry.
2. `node --test hooks/` from `plugins/ssc/` — unchanged by this design, run to
   confirm nothing regressed.
3. `scripts/publish-chatgpt-bundle.sh --check` — the mirror is not stale.
4. A read-through of the two new Approaches sections against the live BrandOS
   surface: confirm `get_strategy_brief` returns the two sophistication fields
   and `get_month_plan` returns `proofInventory` / `offerState` for a real
   period, rather than trusting this document's account of them.
