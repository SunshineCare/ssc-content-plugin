# Design: description must complement — not echo — the headline

**Date:** 2026-07-05
**Status:** proposed — awaiting operator review (author was away at the placement decision; **Approach A chosen as the reliable, self-contained default** — see Placement)
**Scope:** `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` only
**Builds on:** the copy-first reorder (`2026-07-05-ads-produce-copy-first-reorder-design.md`)

## Problem

After the copy-first reorder, both the `headline` and the `description` sections
are derived from the same approved copy:

- `headline` distils the copy's **hook** (Step 4 / Step 6).
- `description` "compresses an approved copy's **promise**" (Step 4 / Step 6).

Nothing forces the description onto a **different beat** than the headline. In
practice both get distilled as the same problem-hook, so the two Meta fields —
which the reader sees together (headline = bold line by the CTA; description =
link description) — say the same thing in other words. Real bug observed: a
headline and a description both surfaced as problem-hooks from one copy.

The existing guards do not catch this:

- Step 6 says the description is "distinct from **the others**" — "the others"
  means other *descriptions*, never the *headline*.
- Step 7's Direct-Response checklist has no headline-vs-description echo check.
- Step 7's set-coverage check only counts distinct proof points across the set;
  it does not check that a description differs from an approved headline.

## Decision

Add a **description-differentiation spec** — four rules — to the writer, encoded
both as a **drafting instruction** (Steps 4 & 6) and as a **hard quality-gate
check** (Step 7) so the honest-scoring loop drops + regenerates offenders.

### The four rules (verbatim intent)

1. **Complement, don't echo the headline.** Headline = the hook / problem;
   description = a **different beat** (the payoff, the proof, or the "so what").
   A description that restates the headline's idea in other words is a **FAIL**.
2. **Lead with one concrete proof point, not a vague benefit.** Prefer
   "26 vi chất chuẩn EU / 60 năm nghiên cứu / tiêu chuẩn châu Âu" over soft
   lines like "cơn thèm dễ kiểm soát hơn." Across the set, **vary which proof**
   (don't run three phrasings of "đủ chất").
3. **Layer-aware caveat.** At **L2** (awareness) use one proof tied to the
   topic, **not** a full USP stack (heritage / EU are conversion-tier proof per
   `ad/strategy`), and keep **at least one non-proof educational variant** for
   contrast. At **L1 / L3** the description can lean harder on proof /
   CTA-adjacent benefit.
4. **Diversity rule.** No description may repeat an approved headline's angle;
   the description set spans **distinct proofs / beats**.

## Placement — Approach A (skill-only), and why

The operator suggested the spec "ideally in `ad/copy-checklist`." Finding:
**`ad/copy-checklist` is not referenced anywhere in the skill** — the writer
loads `ad/creative-guidelines`, `ad/headline-formulas`, `ad/cta-catalog`, and
`content/quick-checklist`, but no copy-checklist. The writer only obeys prose it
actually **loads and enforces**, so KB content alone would not change output
unless the skill both loads the doc and applies it.

Three options were considered:

- **A — Skill-only (CHOSEN).** Encode the four rules directly in
  `ssc-ads-writer/SKILL.md` as a drafting rule (Steps 4 & 6) AND a Step 7
  quality-gate check. Self-contained in this repo; ships immediately; no server
  dependency. All four rules key off data the skill **already holds** — the
  approved headlines (Step 4) and the layer/tier (`build_spec`, Step 1b) — so
  even the layer-aware caveat needs **no new KB path**. Trade-off: tuning the
  spec later means a plugin release, not a dashboard edit.
- **B — KB doc + skill wiring.** Author `ad/copy-checklist` on the BrandOS
  server (propose-only) and add the path to Step 3 + an enforcement hook.
  Durable/editable without a release, but depends on a server doc that cannot be
  authored or verified from this repo, and can't be tested end-to-end until the
  doc exists + is approved.
- **C — Both.** Inline hard rule (floor) + KB doc (tunable depth).

**A is chosen** because it is the only option that fully and reliably fixes the
bug within this repo, and it is the exact floor of C — a later `ad/copy-checklist`
doc (B) is a clean additive follow-up, not a redo.

## Design — the three edits (all in `ssc-ads-writer/SKILL.md`)

### 1. Step 4 — description input (reframe why the headlines are read)

Today the `description` bullet reads the approved headline as "a secondary
reference, not the anchor." Reframe: the approved headlines are read
**specifically so the description can complement them** — the description must
land a **different beat** than every approved headline (the headline carries the
hook / problem; the description carries the payoff, the proof, or the "so what").
Reading the approved headlines is what lets the writer avoid echoing them.
(`copy` is still the primary input for the promise; the headlines are read for
contrast, not as the anchor.)

### 2. Step 6 — description bullet (the four rules as drafting guidance)

Replace the current one-line `description` bullet:

> Each a tight **link-description** line (one benefit + a soft CTA) that
> **compresses an APPROVED copy's promise** (from Step 4), distinct from the
> others.

with a version that folds in all four rules:

- **Complement, don't echo** — each description lands a **different beat** than
  every approved headline (payoff / proof / "so what"), built on the approved
  copy's promise. Restating a headline's hook / problem in other words is a FAIL.
- **Lead with one concrete proof** from `brand/proof-points`
  (e.g. "26 vi chất chuẩn EU", "60 năm nghiên cứu", "tiêu chuẩn châu Âu"), not a
  vague benefit ("cơn thèm dễ kiểm soát hơn"); **vary which proof across the
  set** (never three phrasings of the same "đủ chất").
- **Layer-aware** (read the layer / tier from the `build_spec` held in Step 1b):
  at **L2** omnipresence / awareness use **one** proof tied to the concept's
  topic (not a full USP stack — heritage / EU are conversion-tier proof) and keep
  **≥1 non-proof educational variant** in the set for contrast; at **L1 / L3**
  the description can lean harder on proof + a CTA-adjacent benefit.
- **Diversity** — no description repeats an approved headline's angle; the set
  spans distinct proofs / beats (still one benefit + a soft CTA from
  `ad/cta-catalog` each, still distinct from the other descriptions).

### 3. Step 7 — quality gate (where it actually bites)

Add a **description-only** check so the honest-scoring drop-and-regenerate loop
enforces the rules (a rule that only lives in drafting guidance is a suggestion;
a rule in the scoring gate is enforced):

- New Direct-Response checklist line, scoped to `description`:
  **Complements, doesn't echo (description only)** — the description lands a
  **different beat** than every approved headline (payoff / proof / "so what"),
  **leads with one concrete proof** (not a vague benefit), and does not repeat
  another description's proof / beat. A description that restates an approved
  headline's angle, or leads with a vague benefit / no concrete proof, **cannot
  score ≥4** (→ dropped + regenerated).
- Extend the existing **set-coverage check** (currently: the
  `headline`/`description` set collectively references ≥3 distinct proof points)
  with the **L2 reconciliation**: the *set* still covers ≥3 distinct proofs, but
  at **L2** an educational variant carrying **0** proofs is allowed as long as
  the remaining variants cover ≥3 — the set-coverage check must not force **every**
  L2 description to carry a proof (which would delete the required educational
  variant).

## Explicitly NOT changing

- **`image_content`** — its on-image HEADLINE is *meant* to carry the copy's
  hook, so the "don't echo the headline" rule does not apply to it; unchanged.
- **`headline`** and **`copy`** drafting — unchanged.
- **The chain / order, the four `section` values, the ≥3-proof-density rule for
  `copy` and `image_content`, honest 1–5 scoring, compliance / authenticity
  rails, propose-only, save-to-server, Vietnamese-persisted-prose** — all intact.
- **Frontmatter description, the `/ssc.ads-produce` command, the agent, CLAUDE.md**
  — no change; this refines *how* a description is written, not the chain. (The
  frontmatter's "description compresses those copies" stays true.)
- **No new KB path** loaded in Step 3 (layer info comes from `build_spec`).

## Testing / verification

Prose consistency (no test runner):

1. **Presence:** Step 6's `description` bullet carries all four rules; Step 7
   carries the description-only "complements, doesn't echo" check and the L2
   set-coverage reconciliation.
2. **Consistency:** Step 4, Step 6, and Step 7 agree — the description
   complements the headline (different beat) and leads with a concrete proof.
3. **Invariants intact:** grep-confirm the ≥3-proof rule, honest scoring,
   propose-only, and Vietnamese rules are unchanged elsewhere.
4. **Governance hook** untouched — still `deny` (subagent) / `ask` (main).

## Out of scope

- Authoring the `ad/copy-checklist` KB doc (Approach B/C) — a clean later
  follow-up if the operator wants dashboard-tunable guidance.
- Any change to variation counts (`n_descriptions` stays default 5).
