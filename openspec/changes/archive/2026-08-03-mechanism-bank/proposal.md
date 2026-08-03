## Why

Every month the system invents its mechanisms from scratch. `ssc-approaches-core`
Step 4 authors a candidate-mechanism supply per period and nothing carries
forward, so a mechanism proven in June is either re-derived in July or missed
entirely and replaced by a near-identical one in different words. The
voice-of-customer pass is genuinely per-period; the craft of *why this works, or
why past attempts fail* is doctrine, and doctrine belongs in the knowledge base
where an operator can see it as a set and a revision cycle can improve it.

Separately, the mechanisms the system produces skew toward failure framing,
because that framing is the easiest thing to write from a VOC objection. Nothing
states a preference, so nothing corrects the drift.

## What Changes

- **New KB document `craft/mechanism-bank`** — a standing, governed supply of
  mechanisms in structured Markdown. This change ships the document's structure
  and its §1/§2 rules; the Vietnamese entries are seeded by the operator in
  BrandOS and are not a repo artifact.
- **`ssc-approaches-core` becomes bank-first.** It reads the bank live (a failed
  read STOPS the run, like every other doctrine doc), matches bank entries
  against this period's voice-of-customer items, and authors a new candidate
  only where none fits — marking it `in_bank: false`. Its return gains exactly
  two fields per candidate: `bank_id` and `valence`. It still holds no mutation
  tool and enforces no quota.
- **Valence enters the vocabulary.** `positive` (why this works / what builds the
  result) is the default and the priority; `negative` (why past attempts fail /
  what quietly undoes progress) is a minority device.
- **Ideate enforces the valence quota.** `ssc-post-ideate` and `ssc-ads-ideate`
  carry `bank_id` through and hold negative-valence mechanisms to no more than a
  third of the period's assets. Over the cap, ideas are re-mechanised from the
  supply's positives — never by inventing. `ssc-post-ideate`'s existing
  per-mechanism concentration cap (~¼ of the period) is unchanged;
  `ssc-ads-ideate` has no such tally today and does not gain one here —
  importing it would be a second, unapproved rule change.
- **BREAKING (prose invariant): the angle brief may author an angle-local
  mechanism override.** `ssc-brief-core` today states it *never authors,
  restates or varies a mechanism*. That becomes bounded rather than absolute: an
  angle may override when the inherited mechanism does not serve its persona ×
  route, bank-first, grounded in an attributed VOC item from the approved
  Approaches doc, proof-routed from this period's inventory, always reported.
  The idea's mechanism is never written and sibling angles are never re-opened.
  The guarantee changes from *one subject, one mechanism* to **one angle, one
  mechanism**. The channel-agnostic rule lands in `ssc-brief-core`, but
  `ssc-ads-brief` does **not** dispatch that core — it derives its narrative
  fields inline, holds `save_brief`, and restates the absolute rule in its own
  prose — so the override must land there too or it ships as unreachable text.
- **`ssc-ads-writer`** resolves the mechanism it writes to as the brief's
  override if present, otherwise the idea's.
- **New skill `ssc-kb-mechanism-harvest`**, orchestrated by `ssc-kb-agent`. For a
  period it collects mechanisms marked `in_bank: false`, diffs them against the
  bank, and **proposes** the genuinely new ones via
  `propose_knowledge_revision`; a near-duplicate becomes a proposed revision of
  the existing entry, not a new one. Propose-only — no `save_knowledge`, no
  `edit(entity='knowledge')`, no `approve`.
- **Server change in the `content` repo (second repository, separately
  approved).** There is nowhere to persist an angle-local mechanism today —
  verified live: `save_brief` takes no `mechanism` argument and
  `edit(entity='brief')`'s allowlist is the narrative fields. Four items:
  `briefs.mechanism` column; `save_brief` + `edit(brief)` accept it as an
  **ordinary, non-approval-bearing** field; `get_brief` / `list_briefs` return
  it; `get_idea` / `list_ideas` return `mechanism`, which they do not today.
  Until those land, the override is **reported and not persisted** — degraded
  but coherent.

Explicitly **not** in this change: usage history, last-used period, or a retired
flag on bank entries; a JSON-bodied bank document; a dashboard editor for the
bank; mechanisms as a taxonomy or a first-class table. Each is recorded with its
rejection reason in the design.

## Capabilities

### New Capabilities

- `mechanism-bank`: the `craft/mechanism-bank` document contract (entry fields,
  valence vocabulary, static-library rule), bank-first sourcing at
  `ssc-approaches-core`, the visible `in_bank: false` gap-fill, the
  negative-valence usage cap at Ideate, and the propose-only harvest path that
  grows the bank.
- `angle-mechanism-override`: the bounded permission for an angle brief to carry
  its own mechanism — its preconditions, its angle-local blast radius, its
  reporting obligation, the resolution order downstream consumers use, and the
  persistence contract the `content` repo must provide.

### Modified Capabilities

<!-- None. The two new capabilities fully cover the behaviour that changes;
     adding a delta to ads-brief-angles for the same rule would duplicate it. -->

## Impact

**This repository (`ssc-content-plugin`)**

- New: `plugins/ssc/skills/ssc-kb-mechanism-harvest/SKILL.md`
- Modified: `plugins/ssc/skills/ssc-approaches-core/SKILL.md`,
  `ssc-brief-core/SKILL.md`, `ssc-ads-brief/SKILL.md`,
  `ssc-post-ideate/SKILL.md`, `ssc-ads-ideate/SKILL.md`,
  `ssc-ads-writer/SKILL.md`
- Modified: `plugins/ssc/skills/ssc-ads-approaches/SKILL.md`,
  `ssc-post-approaches/SKILL.md` — the composed Approaches document is the only
  carrier that reaches Ideate (`bank_id` and `valence` have no column), so both
  callers' section templates must render the two new labels
- Modified: `plugins/ssc/agents/ssc-kb-agent.md` (`orchestrates` gains the new
  skill), `plugins/ssc/commands/ssc-kb.md` if it enumerates stages
- Modified: `.claude-plugin/plugin.json` (version bump, same commit)
- Regenerated: `chatgpt/workflows.json` via
  `scripts/publish-chatgpt-bundle.sh`; the mirror commit in the `content` repo
  and the brandos-express deploy are operator actions, not part of this change
- Modified: `CLAUDE.md` (the Ads pipeline table's mechanism rule, and the
  one-subject-one-mechanism statement)

**`content` repo (separate approval, tracked as its own task group)**

- `briefs.mechanism` column + migration
- `save_brief`, `edit(entity='brief')` allowlist, `get_brief`, `list_briefs`
- `get_idea` / `list_ideas` read shapes gain `mechanism`

**Outside both repos**

- The `craft/mechanism-bank` document is seeded by the operator in BrandOS.

**Governance surface: unchanged.** No skill gains `approve`, `unapprove`,
`update_status`, or a publish/schedule tool. `brief.mechanism` is an ordinary
field, so `hooks/approval-gate.mjs` and its matchers are untouched.
