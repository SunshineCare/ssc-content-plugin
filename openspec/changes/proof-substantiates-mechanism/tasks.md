# Tasks — proof substantiates the mechanism

All tasks are **prose edits** to markdown skills. This repo has no compiled code and no
test harness for prose, so no task carries a TDD gate. The exact wording shape and
verified `file:line` anchors for every edit are in `design.md` **§D9**; the requirements
they satisfy are in `specs/mechanism-proof-substantiation/spec.md`.

The three skill files have **disjoint write sets** — groups 1, 2 and 3 may run in
parallel. Group 4 depends on all three.

## 1. plugins/ssc/skills/ssc-ads-writer

- [x] 1.1 Step 6, the `copy` bullet block (lines 429-438): replace the stale "Four things bind every `copy` variation" lead-in at 429 with a countless form (the block lists seven bullets, and this change adds an eighth); append the **Rule 2** sharpening to the existing "Every proof must answer the pain the hook opened" bullet at 437 — answering is the bar, enhancing is what earns the place; rewrite the "Make the proof unswappable" bullet at 438 to **Rule 3**'s cut form — a line surviving the competitor swap is cut at composition before emit and replaced by the concrete form the live row carries, cutting the **line, not the variation** (no REJECT, no regeneration, axis position unchanged). Per design.md §D9.
- [x] 1.2 Step 6: append the **Rule 1** bullet after 438, closing the `copy` block before the `headline` branch at 439 — the mechanism beat (written from `brief.mechanism`, Step 1) must lean on ≥1 row of the live `brand/proof-points` table, the row that substantiates *why the mechanism works*; name that row in the Vietnamese `comment`; other proofs stay free to answer the hook; **inert where `brief.mechanism` is blank** — nothing invented, absence reported in Step 9. Per design.md §D9.
- [x] 1.3 Step 7(b): insert the new capping checklist item **Mechanism is proof-backed (`copy` only)** directly after the existing "Every proof answers the hook (`copy` only)" item at 561, so the hook/mechanism/proof items read as one group — caps at ≤3, inert on a blank mechanism. Then reword the "Proof survives the competitor test" item at 562 from a primary penalty into a **backstop** (the cut should already have happened in Step 6). Per design.md §D9.
- [x] 1.4 Step 9: add the `· backed by: <proof row | NONE — brief carries no mechanism>` suffix to the `**Mechanism (this angle's):**` template line at 646, and extend the supporting bullet at 664 to require reporting the backing row alongside the mechanism — a blank mechanism reads NONE *for that reason*, not as a missing proof. Per design.md §D9.

## 2. plugins/ssc/skills/ssc-post-produce

- [x] 2.1 The "In practice:" paragraph (394-401): sharpen the opening sentence with **Rule 2**; add **Rule 1** as its own sentence — one pressed point must substantiate the mechanism beat written from `brief.mechanism` (Step 2), traced to a live `brand/proof-points` row, inert on a blank mechanism; extend the concreteness sentence at 397-399 with **Rule 3**'s cut. Leave the "≥3-distinct bar is the SET's" paragraph at 387-392 **untouched** — it is `craft/coverage` §4.2 and out of scope. Per design.md §D9.
- [x] 2.2 Step 4 hand-off list (486-496): insert a new bullet after the axis-positions bullet (494-495) and before the `brief_id` bullet (496) naming the **proof row backing this variation's mechanism beat**, or the explicit "— brief carries no mechanism". This skill writes no `comment` and no score, so the hand-off is the only channel by which `ssc-post-authority` can judge Rule 1 without re-deriving it. Per design.md §D9.
- [x] 2.3 Step 5: add `· *mechanism backing:* <proof row | — brief carries no mechanism>` to the italic per-variation axis line (524, 528, and the `### … (through Variation N)` pattern at 531), and the `· backed by: <…>` suffix to the `**Mechanism written to:**` summary line at 514. Leave the Governance block untouched. Per design.md §D9.

## 3. plugins/ssc/skills/ssc-post-authority

- [x] 3.1 The `copy` mechanism criterion (424-430): leave the existing bullet fully intact (including the rejection for benefit/result-only beats and the blank-mechanism path at 428-430) and add the **separate adjacent sub-criterion** whose first clause declares its own force — "this one CAPS at ≤3; it does not reject" — naming the live `brand/proof-points` row requirement, the ≤3 cap, that it is not a floor item and opens no replacement round, and that it is inert on a blank mechanism. Per design.md §D6 and §D9.
- [x] 3.2 The curation-signal block (391-393): add the bounded carve-out to "Never lower a score in place of rejecting a variation" — it forbids substituting a number for a rejection that was **owed**, not a criterion whose own stated consequence is a cap, of which there is **exactly one**. Naming the count keeps it from reading as a general licence. Without this the file self-contradicts once 3.1 lands. Per design.md §D6.
- [x] 3.3 The `image_content` proof criterion (455): apply the same backing requirement where the bullets carry the mechanism's proof; **inert — not a miss** where the density profile emits no bullets, and inert on a blank mechanism. Rule 3's cut applies here too. Per design.md §D9.
- [x] 3.4 Step 7 report block (596): add the `· backed by: <…>` suffix to the `**Mechanism judged against:**` line. Governance (635): add the clause stating the backing requirement **caps brand fit at ≤3 and never rejects**, leaving the pass/fail rule at 630 and the never-lower-a-score rule at 633 untouched. Per design.md §D9.

## 4. Family-first amendment (all three skills)

Rule 1 as landed in groups 1–3 says "≥1 row of the live `brand/proof-points`" with no
starting point. Design **§D2b** and the spec requirement *"The search for a backing row
SHALL start in the mechanism's own proof family and MAY reach beyond it"* add one. Each
task amends the Rule 1 wording already in its file — it does not re-write it.

- [x] 4.1 `plugins/ssc/skills/ssc-ads-writer/SKILL.md` — amend the Rule 1 bullet in Step 6 and the Step 7(b) capping item: the search **starts in the proof family the mechanism's own claim argues from**, read live from `brand/proof-points` § Bốn Nhóm Bằng Chứng against the mechanism sentence (never a bank lookup — provenance is report-only and the brief carries the sentence alone), and **may reach beyond it** where an out-of-family row substantiates better. Extend the Step 9 `· backed by:` line so a backing row **outside** the mechanism's family is named as such. Per design.md §D2b.
- [x] 4.2 `plugins/ssc/skills/ssc-post-produce/SKILL.md` — same amendment to the Rule 1 sentence in the "In practice:" paragraph, and the out-of-family marker on the Step 4 hand-off bullet and both Step 5 record lines (`· backed by:` and `· *mechanism backing:*`). Per design.md §D2b.
- [x] 4.3 `plugins/ssc/skills/ssc-post-authority/SKILL.md` — same amendment to the capping sub-criterion and the `image_content` criterion, and the out-of-family marker on the Step 7 `· backed by:` report line. The force is unchanged: still caps at ≤3, still never rejects; the family rule adds a **report** obligation only. Per design.md §D2b.

## 5. plugins/ssc + release

- [x] 5.1 Cross-read the three edited skills against `specs/mechanism-proof-substantiation/spec.md`: the chain is stated the same three ways, `brand/proof-points` is named and read live with **no** proof row / number / wording baked in anywhere, and no skill gained an `approve_*` / `unapprove_*` / publish tool.
- [x] 5.2 Bump `version` in `plugins/ssc/.claude-plugin/plugin.json` — same commit as the prose change, per repo CLAUDE.md.
- [x] 5.3 Run `node scripts/build-chatgpt-bundle.mjs` and confirm it exits 0 (the only automated gate: validates `metadata.dispatches`, skill-dir/frontmatter-name match, and `orchestrates` resolution). Regenerates `chatgpt/workflows.json`.
