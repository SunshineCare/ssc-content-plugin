# Proof substantiates the mechanism

**Date:** 2026-08-04
**Scope:** `ssc-ads-writer`, `ssc-post-produce`, `ssc-post-authority`
**Status:** design approved, not yet implemented

## Problem

Proof and mechanism are two independent rails in every writing skill. Nothing
requires a proof point to back the mechanism claim.

The mechanism rail is read-only and judged alone: `brief.mechanism` is read once
(`ssc-ads-writer` Step 1, `ssc-post-produce` Step 2), a mechanism beat is written
from it, and `craft/copy-floor` mục 1 is satisfied by the beat's presence and its
fidelity to that field.

The proof rail is sourced, spread, and tied to the **hook**: each proof point must
answer the pain the hook opened (`ssc-ads-writer` Step 6, `ssc-post-produce`'s
proof block), must survive the competitor-swap test, and the set must surface ≥3
distinct points across its members (`craft/coverage` §4.2) spread over
`proof_device` families.

The two never meet. A variation can clear every gate while its proof stack answers
the hook and leaves the mechanism claim unbacked — the floor asks only that a
mechanism beat *exists* and matches `brief.mechanism`; the proof gates ask only
that points are distinct, family-spread, unswappable, and hook-answering.

An unbacked mechanism is a claim, not a mechanism. At the market-saturation
position `craft/awareness-framework` §2 states for this category, mechanism is
what persuades — so an unbacked one is the load-bearing sentence of the ad resting
on nothing.

## The chain

One three-link chain binds every `copy` variation:

```
HOOK       opens a specific tension
  ↓
MECHANISM  (brief.mechanism) explains why it resolves
  ↓
PROOF      ≥1 traced brand/proof-points row SUBSTANTIATES that mechanism
           — and every proof pressed must ENHANCE the hook, not sit beside it
```

Two rules fall out of it, and one existing rule is tightened.

### Rule 1 — the mechanism must be proof-backed

The mechanism beat leans on **at least one row of the live `brand/proof-points`
table**, and the variation's `comment` names which row. Other proof points the
variation presses stay free to answer the hook's tension without routing through
the mechanism.

Where `brief.mechanism` is **blank**, the rule is **inert**: there is no mechanism
to back, production proceeds, and the absence is reported exactly as it is today.
Nothing is invented to give the rule something to bind to.

### Rule 2 — proof enhances the hook

The existing rule ("every proof must answer the pain the hook opened") is kept and
sharpened: a proof earns its place by making the opening tension land **harder**,
not by being topically adjacent to it. A proof that is true, on-topic, and adds
nothing to the tension the hook named is not doing the hook's work.

### Rule 3 — concreteness is a cut, not a score cap

The competitor-swap test becomes a **composition-time cut**. A proof line that
survives paraphrase into a generic wellness claim — swap "Cambridge" for another
brand and it still reads true — is **removed before emit**, rather than scored
down after the fact.

This cuts the *line*, never the *variation*: it is a composition rule, not a floor
REJECT, so it changes nothing about the six-item floor and requires no KB change.

## Where it binds

**Binding level: composition rule + scored gate.** Not a floor item. An unbacked
mechanism caps a variation's brand-fit score at ≤3; it does not reject it and does
not trigger a regenerate-on-its-own-axis pass.

### `ssc-ads-writer`

| Location | Change |
|---|---|
| Step 6, the `copy` bullet block (the "Every proof must answer the pain the hook opened" / "Make the proof unswappable" pair) | Add Rule 1 and Rule 2 alongside the existing rules; rewrite the unswappable bullet to Rule 3's cut form |
| Step 7(b) scored checklist | New item: **Mechanism is proof-backed (`copy` only)** — a variation whose mechanism beat names no traced proof row **caps at ≤3**. Existing "Proof survives the competitor test" item reworded to the cut rule |
| Step 9 summary | The `Mechanism (this angle's):` line gains `· backed by: <proof row \| NONE — brief carries no mechanism>` |

### `ssc-post-produce`

| Location | Change |
|---|---|
| The proof block ("Proof points — the ≥3-distinct bar is the SET's" and the "In practice" paragraph) | Add Rule 1 and Rule 2; apply Rule 3's cut form to the concreteness sentence |
| Step 7 checklist | Same **Mechanism is proof-backed** item, capping at ≤3 |
| The presentation summary block | `Mechanism written to:` line gains the same `· backed by: <…>` suffix |

### `ssc-post-authority`

| Location | Change |
|---|---|
| The `copy` judgement criteria (the mechanism-beat criterion) | New criterion: the mechanism beat is backed by a named proof row. **Capping, not rejecting** — matches what produce was told to write |
| The `image_content` judgement criteria | Where the bullets carry the mechanism's proof, the same criterion applies; where the density profile emits no bullets, it is inert, not a miss |
| The report block | `Mechanism judged against:` line gains `· backed by: <…>` |

`ssc-post-authority` moves with `ssc-post-produce` in the same commit. Authority
grades what produce writes; shipping one without the other makes authority judge
posts against a bar the writer was never given.

## Out of scope — unchanged deliberately

- **No new floor item.** `craft/copy-floor` is untouched, so this needs **no KB
  revision and no `/ssc-kb` run**.
- `craft/coverage` §4.2's ≥3-distinct set-level proof bar — unchanged, still
  set-level, still "no variation required to carry three, none may cram three".
- The `proof_device` coverage axis (families spread across the set) — unchanged.
- The early-stage proof-free educational/curiosity `description` variant
  (`craft/copy-floor`, mục ghi chú riêng cho section `description`) — still kept as
  written, never regenerated to force a proof into it.
- No new MCP tool, no new field on `briefs` or `contents`, no server change.
- The mechanism stays **read-only** from `brief.mechanism`. No skill authors one,
  back-fills one, or re-opens a brief to add one.
- The propose-only invariant: no skill gains `approve_*`, `unapprove_*`, or any
  publish/schedule tool.

## Known tension, accepted

`craft/doctrine` §2 is the declared owner of the mandatory-mechanism rule and
`craft/copy-floor` mục 1 is the floor item that enforces it. Putting
"mechanism must be proof-backed" in skill prose alone means three skills carry a
doctrine rule the doctrine doc does not state — the staleness the repo's
"never hard-code KB content" convention exists to prevent.

This is accepted for this change: the binding level chosen keeps it in prose and
out of the floor, so no KB doc is contradicted — only under-specified. A follow-up
`/ssc-kb` revision folding the rule into `craft/doctrine` §2 would let the three
skills reference it instead of stating it. Not part of this change.

## Verification

There is no lint/test harness for prose. The gates that exist:

1. `node scripts/build-chatgpt-bundle.mjs` — passes (validates `metadata.dispatches`,
   skill-dir/name match, `orchestrates` resolution). No skill is added or renamed
   here, so this is a regression check only.
2. Manual read-through of the three diffs against this spec.

## Ship

1. Bump `version` in `plugins/ssc/.claude-plugin/plugin.json` **in the same commit**
   as the prose change.
2. `scripts/publish-chatgpt-bundle.sh` — rebuild and mirror into `content/`.
3. Commit the refreshed mirror in the `content` repo and deploy brandos-express,
   otherwise ChatGPT keeps running the old prose.
