# Design: foreground Cambridge USPs in ad production (`ssc.ads-produce`)

**Date:** 2026-07-03
**Status:** approved (design), pending implementation plan

## Problem

Ads produced by `/ssc.ads-produce` do not capitalize on Cambridge Diet
Vietnam's unique selling points / competitive advantages. Operators see copy and
creative that state a generic benefit instead of pressing the brand's real,
defensible edge (heritage + clinical/EU safety, the structured 6-step programme +
1:1 consultant, sustainable-not-crash, the product range + app).

**Root cause — the production step is blind to the differentiation material.**
The two production skills are *instructed* to ground in the brand's proof and
positioning, but they never load the documents that hold it:

- `ssc-ads-writer/SKILL.md` Step 3 (headline quality #3, "Specific") tells the
  writer to ground headlines in `brand/proof-points` — but its Step 2
  `get_knowledge` call (paths list) **never fetches `brand/proof-points`**, and
  fetches neither `brand/positioning`. So the model is told to use proof it does
  not have in context.
- `ssc-ads-creative/SKILL.md` Step 3 ("branded" style) wants "a real proof line
  (from `brand/proof-points`)" — but its Step 2 load list **does not fetch it**
  either, nor `brand/positioning`.

The KB source material is already strong (verified live against BrandOS on
2026-07-03):

- **`brand/positioning`** (v4, "Định Vị Cạnh Tranh") — the "Cỗ Máy Bền Vững"
  (consultant + app, the uncopyable maintenance-phase moat) and explicit
  head-to-head "chúng mình hơn ở đâu" (where we win) against all eight competitor
  categories: MLM, KOC/PT, eat-clean, self-dieting, doing-nothing, gym,
  weight-loss drugs, and the `post-glp1` entry.
- **`brand/proof-points`** (v6) — a credibility lookup table (60 năm Cambridge,
  Dr Alan Howard, DiRECT/DROPLET RCTs, EU 2016/1413, 26 vi chất, 10 hương vị,
  chương trình 6 bước, chuyên viên 1:1, đồng hành trọn đời, the app, Kiều My từ
  2004), each row mapped to the competitor it beats.

The upstream pipeline already supplies a differentiation hook: `ssc-ads-ideate`
tags concepts with an `against` dimension (`brand/angles` §1.3:
`vs-self-dieting`, `vs-eat-clean`, `vs-mlm`, `vs-koc-pt`, `vs-doing-nothing`,
`vs-gym`, `vs-medicine`, `post-glp1`), and §1.3 points at `brand/positioning` for
"why Cambridge wins each match-up." The concept arrives at production carrying
the head-to-head cue; the producer simply has no access to the reasoning or the
proof to act on it — so it writes a generic ad.

## Goals

1. Both ad producers **load** `brand/positioning` + `brand/proof-points` at
   knowledge time.
2. Both producers **foreground** a concrete Cambridge advantage in every drafted
   variation, and — when the concept carries an `against` tag — press that
   specific competitor match-up, grounded in the two docs.
3. The embedded quality gate **catches** a flat, undifferentiated variation and
   routes it into the existing drop-and-regenerate loop.
4. All existing invariants hold: propose-only, no new tools, KB as the single
   source of truth, Vietnamese persisted prose, one concept per run.

## Non-goals

- **No upstream changes** to `ssc-ads-ideate` / Focus / Approaches / Blueprint.
  The `against` dimension already carries differentiation into production, and
  it is *deliberately optional* in the KB ("không phải ad nào cũng cần so
  sánh") — forcing more comparison ads is out of scope (this was Approach B,
  rejected).
- **No hardcoded USP list** baked into the skill prose. The advantages and their
  proof stay in the live KB docs so compliance rails and the
  "concrete-not-slogan" guardrail travel with them and stay maintainable in one
  place.
- **No new MCP tools, no governance change.** `get_knowledge` is already in both
  skills' `tools:` lists; nothing that flips a gate is added.
- No change to `commands/ssc.ads-produce.md` (thin dispatcher; enumerates no KB
  paths).

## Design

Two files change: `skills/ssc-ads-writer/SKILL.md` and
`skills/ssc-ads-creative/SKILL.md`. Both new paths are confirmed-live KB docs.

### `skills/ssc-ads-writer/SKILL.md`

1. **Step 2 load list** (the `get_knowledge` `paths` array, ~L96–L114) — add
   `"brand/positioning"` and `"brand/proof-points"`, and add their one-line
   entries to the "These paths are:" bullet list:
   - `brand/positioning` — the competitive positioning: the "Cỗ Máy Bền Vững"
     (consultant + app) and the "where we win" reasoning for each competitor —
     so the copy can press the concept's `against` match-up.
   - `brand/proof-points` — the credibility lookup table (real, compliant proof
     signals) the copy leans on; each row names the competitor it beats.
2. **Step 4 (draft N variations)** — add a short **"Differentiation & proof"**
   requirement, sitting alongside the existing authenticity guardrail: every
   variation must press **≥1 concrete Cambridge advantage** from
   `brand/proof-points`; when the concept carries an `against` tag, it must land
   *that specific* match-up using `brand/positioning`'s "chúng mình hơn ở đâu" +
   a substantiating proof point. Concrete, not slogan (per the KB's own guardrail
   that abstract content underperforms). This does not add a section or change
   counts — it constrains how each existing variation is written.
3. **Step 5 quality gate (a), the Direct-Response checklist** — add one line:
   *"Presses a real Cambridge USP / proof point (not a generic benefit); if the
   concept has an `against` tag, it lands that specific match-up."* A variation
   that leans on nothing distinctive scores lower and drops into the existing
   ≤3 regenerate loop. The compliance scan in gate (b) already enforces the
   proof rails (no fabricated number, spell out "nghiên cứu lâm sàng độc lập"
   never "RCT", "26" not 25, no commercial drug-brand names, no income/MLM
   claim) — foregrounding proof does not relax them.
4. **Governance** (bottom, ~L327) — extend the "References only the knowledge
   paths in Step 2 (…)" allow-list to include `brand/positioning` +
   `brand/proof-points`, so the enumeration stays consistent with Step 2.

### `skills/ssc-ads-creative/SKILL.md`

1. **Step 2 load list** (~L92–L106) — add `"brand/positioning"` and
   `"brand/proof-points"` with one-line entries, and add both to the
   "when running right after `ssc-ads-writer`, most of these are already in
   context — fetch only what's missing" note so a standalone run fetches them
   and a chained run reuses them.
2. **Step 3 (build the 5 styles)** — add the differentiation instruction: the
   creative presses a concrete advantage, and when the concept carries an
   `against` tag the layout expresses that contrast — most naturally the
   **branded** style (a real proof line, already asked for) and the **meme**
   style (old-way → Cambridge-way contrast). Authenticity guardrail + on-image
   banned-words/compliance/food-placeholder rails unchanged.
3. **Step 5 quality gate (a), the Direct-Response checklist** — add the same
   line as the writer.
4. **Governance** (bottom, ~L313) **and the `description:` frontmatter path
   enumeration** — extend both to include the two new paths, keeping the
   description, Step 2, and Governance mutually consistent.

## Invariants preserved

- **Propose-only (hard rule).** No `approve_*` / `unapprove_*` / `update_status`
  / publish tool added; the only new capability use is read-only `get_knowledge`
  on two more paths. Neither `tools:` list changes.
- **KB is the single source of truth.** USPs and proof are read from the live
  docs, not copied into the skill — so compliance and the concrete-not-slogan
  guardrail stay with them and maintenance stays in one place.
- **MCP tool-reference integrity.** No new tool names introduced; both added
  paths are live KB docs (verified `brand/positioning` v4, `brand/proof-points`
  v6). No dangling `/ssc.*` refs touched.
- **Per-concept, one-at-a-time, Vietnamese persisted prose** — all unchanged.

## Verification (no automated suite in this repo)

There is no test runner yet (see the sibling harness design). Verification is
manual and structural:

1. **KB paths resolve** — confirmed live on 2026-07-03 (`brand/positioning` v4,
   `brand/proof-points` v6) via `get_knowledge`.
2. **Internal consistency, per file** — after the edit, the Step 2 `paths`
   array, the "These paths are:" bullets, the Governance allow-list, and (for
   the creative) the `description:` enumeration all list the same knowledge
   paths. No step references a path Step 2 does not load.
3. **No executable surface touched** — `hooks/approval-gate.mjs` and all JSON
   manifests are unchanged; the governance hook's behavior is unaffected.
4. **Propose-only re-read** — neither edited skill gains a tool or an
   instruction that could flip a gate.

## Open questions

None. Scope (Approach A, producers-only) and KB adequacy (docs already solid)
were both resolved during brainstorming.
