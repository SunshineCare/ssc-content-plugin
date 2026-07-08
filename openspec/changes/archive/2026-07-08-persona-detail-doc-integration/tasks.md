## 1. Writing skills — single-target detail-doc grounding

- [x] 1.1 `ssc-post-produce`: after Step 2 (brief + tags extraction) resolves the persona tag's `code`, add the derived `brand/persona-<slug>` path to the Step 3 `get_knowledge` paths list; use its vocabulary/objections/trigger sections when drafting variations in Step 4.
- [x] 1.2 `ssc-ads-writer`: after Step 1 resolves `idea.tags[]`'s persona tag, add the derived `brand/persona-<slug>` path to the KB load; ground Hook Formula Bank drafting in it.
- [x] 1.3 `ssc-ads-brief`: resolve the concept's persona tag, add the derived detail-doc path to its KB load, and ground `hook_direction`/`core_message`/`why_now`/`story_moment`/`cta` derivation in it.
- [x] 1.4 `ssc-video-script`: resolve the persona tag from `tags_by_kind`, add the derived detail-doc path alongside the existing `brand/personas`/`brand/journey-stages` reads, ground narration in it.

## 2. Ideation/tagging skills — all-four detail-doc load + de-hardcode

- [x] 2.1 `ssc-post-ideate`: replace the hardcoded `target_persona = 'Chị Lan' | 'Chị Hương' | 'Chị Mai'` enum and the "Chị Lan, Chị Hương, Chị Mai" wording in Steps 2/3/4 with a reference to whichever personas `brand/personas` currently lists; add all four `brand/persona-*` paths to the Step 2 KB load.
- [x] 2.2 `ssc-ads-ideate`: rewrite the "All 3 archetypes (Chị Lan, Chị Hương, Chị Mai) must appear in L1" check to read each persona's priority tier from `brand/personas` and apply tier-proportional balance instead of forced equal presence; de-hardcode the "three core audience archetypes" KB-doc description; add all four `brand/persona-*` paths to the KB load.
- [x] 2.3 `ssc-ads-blueprint`: rewrite `primary_persona: exactly ONE primary archetype (Chị Lan, Chị Hương, or Chị Mai)` to read the current persona set from `brand/personas` (still exactly one, but not a hardcoded three-value enum); keep the existing tier-aware archetype-balance check consistent with 2.2's wording.
- [x] 2.4 `ssc-youtube-ideate`: add all four `brand/persona-*` paths to the KB load alongside the existing (already-dynamic) `brand/personas` read.
- [x] 2.5 `ssc-ads-approaches`: add all four `brand/persona-*` paths to the KB load so the "creative triggers per persona" section can draw on each persona's ranked trigger points; confirm no hardcoded count needs fixing (existing wording says "2–3 of the archetypes," not a total count — verify only).
- [x] 2.6 `ssc-post-research` (discovered during 6.1 final validation — this Posts-pipeline sibling of `ssc-ads-approaches` was missed from the original scope): de-hardcode "the three core audience archetypes" in Step 2's KB load; add all four `brand/persona-*` paths; ground the "Seasonal Pain Points & Archetype Mapping" brief section in each featured persona's detail-doc trigger points rather than a generic mapping.

## 3. Strategy research skills — all-four detail-doc load + de-hardcode + Thảo research block

- [x] 3.1 `ssc-strategy-audience-intelligence`: add a fourth per-persona research block for Chị Thảo (own Vietnamese search keywords sourced from `brand/persona-thao`'s vocabulary section, mirroring the existing 3 blocks); de-hardcode "3 persona archetypes" in the description and Step 1/2 headers; add the `focus` input's persona-code list; add all four `brand/persona-*` paths to the Step 1 KB load.
- [x] 3.2 `ssc-strategy-kol-discovery`: add a Chị Thảo block to the Step 2 per-persona discovery loop; de-hardcode the "3 archetypes" persona-fit table and evidence enum; add all four `brand/persona-*` paths to the KB load.
- [x] 3.3 `ssc-strategy-territory-explorer`: add Chị Thảo to the audience-resonance table/evidence enum; de-hardcode "Chị Hương / Chị Mai / Chị Lan" list; add all four `brand/persona-*` paths to the KB load.

## 4. Generic de-hardcode sweep (no detail-doc load needed)

- [x] 4.1 `ssc-strategy-ad-intelligence`: verify "each persona's prioritised ad approaches" wording already defers to `brand/personas` dynamically — no hardcoded count found; confirm and leave as-is or adjust wording only if a fixed list is found on closer read. **Verified: already generic, no change needed.**
- [x] 4.2 `ssc-strategy-audit`: verify "Do the documented personas still reflect the real audience?" already has no hardcoded count — confirm, no change expected. **Verified: already generic, no change needed.**
- [x] 4.3 `ssc-kb-research`: replace "the three archetypes (Chị Lan, Chị Hương, Chị Mai)" with a reference to whichever personas `brand/personas` currently lists. **Fixed.**
- [x] 4.4 `ssc-strategy-develop`: verify the "Chị Lan" example mention is illustrative only (not an exhaustive/count-bearing list) — leave as an example or generalize the wording if it reads as exhaustive. **Verified: single illustrative search-query example ("Chị Lan conversion"), not an enumeration — left as-is.**
- [x] 4.5 `ssc-strategy-eval`: verify the `categories=["brand", "programme"]` mention ("brand covers personas") has no hardcoded count — confirm, no change expected. **Verified: already generic, no change needed.**
- [x] 4.6 `ssc-strategy-directions`: verify the generic "personas, positioning, ad strategy" mention has no hardcoded count — confirm, no change expected. **Verified: already generic, no change needed.**
- [x] 4.7 `ssc-post-focus`: verify the `brand/personas` fallback-frame mention has no hardcoded count — confirm, no change expected. **Verified: already generic, no change needed.**
- [x] 4.8 `ssc-ads-focus`: verify the `brand/personas` fallback-frame mention has no hardcoded count — confirm, no change expected. **Verified: already generic, no change needed.**
- [x] 4.9 `ssc-ads-image`: verify persona-tag usage (scene direction from `idea.tags[]`) makes no count/name assumption — confirm, no change expected. **Verified: reads the persona tag generically off `idea.tags[]`, no hardcoded name/count anywhere.**

## 5. Verify-only pass (already-correct reference pattern)

- [x] 5.1 `ssc-youtube-briefing`: re-read against the new convention; confirm its existing "do not assume a fixed list — read from brand/personas" wording already satisfies the de-hardcode requirement with no edits needed. **Verified: already correct, this is the reference pattern the rest of the sweep followed.**

## 6. Final validation

- [x] 6.1 Grep the full `plugins/ssc-content/` tree for any remaining hardcoded persona triads (`Chị Lan.*Chị Hương.*Chị Mai` and permutations) or "3 archetypes"/"three archetypes" phrasing; confirm zero remain outside this tasks list's intentionally-illustrative mentions (4.4). **Done — found and fixed 2 gaps this sweep caught: `ssc-ads-writer`/`ssc-post-produce`'s authenticity-guardrail lane 3 (hardcoded 4-name list → de-hardcoded), and `ssc-post-research` (missed from original scope entirely — added as task 2.6 and fixed). Zero hardcoded triads/counts remain after re-running the sweep.**
- [x] 6.2 Grep for `brand/persona-huong|lan|mai|thao` across all touched skills to confirm every Group 1–3 file's KB load was actually updated (not just described in prose elsewhere). **Done — confirmed present in all Group 1–3 files; `ssc-ads-blueprint` correctly shows zero (de-hardcode-only task, no detail-doc grounding was ever scoped for it).**
- [x] 6.3 Confirm no persona-specific hardcoded compliance branch (e.g. an `if persona == 'chi-thao'` special case) was introduced anywhere in this sweep — persona-specific rules like Chị Thảo's breastfeeding-eligibility gate are explicitly out of scope (see design.md Decision 4, superseded). **Done — zero compliance/eligibility branches found; the one Chị Thảo + "cai sữa" hit is a legitimate in-scope research-keyword example (task 3.1), not a compliance check.**
- [x] 6.4 Confirm no skill's `tools:` frontmatter gains a tool it doesn't call: most skills only add KB paths to an existing `get_knowledge` call (no frontmatter change); `ssc-ads-brief` is a known, legitimate exception — it had no KB read before this change, so it gained a `get_knowledge` entry alongside its new Step 1c call. No other new tool entries should appear anywhere. **Done — confirmed only `ssc-ads-brief` gained a tool entry; no other file's `tools:` frontmatter changed.**
