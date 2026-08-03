All work in groups 1–7 is markdown prose in `plugins/ssc/` plus repo-root docs —
there is no runtime test harness for skills, so the gates are §7's bundle build,
hook suite and mirror check. Group 8 is a **different repository** and is gated on
the user's explicit approval before any file in it is touched.

Groups are ordered by dependency: the supply contract exists before its callers
render it, the rendered labels exist before Ideate reads them, and wiring lands
after every file it names.

**Never write a mechanism sentence, a bank `id`, a `valence` example, a `fits`
phrasing or a persona name into any skill file** (D11). Name the doc and its
section; read it live.

## 1. plugins/ssc/skills/ssc-approaches-core (bank-first supply)

- [x] 1.1 Add `craft/mechanism-bank` to Step 1's live-read list, under the existing failed-read STOP rule (check `missing`, retry once, then stop and name the document). State what the doc holds by pointing at it — never restate an entry (D3.1, D11).
- [x] 1.2 Rewrite Step 4's opening so the supply is built **bank-first**: match bank entries against Step 3's voice-of-customer items before authoring anything, and name the `bank_id` on every candidate drawn from the bank (D3.2).
- [x] 1.3 Add the gap-fill rule: where no bank entry fits a VOC item, author a new candidate and mark it `in_bank: false`. State that this is the only sanctioned invention at this step and that it must be visibly invented (D3.3).
- [x] 1.4 State D4 as a hard rule in Step 4: the bank saves the **authoring**, never the **grounding** — a bank entry still requires an attributed VOC quote from this period, and an entry with nothing this month to explain is **not supplied**.
- [x] 1.5 Restate, unchanged, the constraints a bank draw must not relax: proof route from this period's stated `head.proofInventory` only; a candidate whose only route `rules/compliance` refuses is **dropped, not softened**; indirectness judged against the **inherited** read with no bar derived where the quarter states none; both volume floors unchanged.
- [x] 1.6 Add `bank_id` (string or `null`) and `valence` to the `candidate_mechanisms` entry in the Step 5 return template — exactly two new fields, nothing renamed or dropped — and update the "do not rename a field, drop one, or add an eighth" sentence to match the new field count.
- [x] 1.7 Add the valence vocabulary reference to Step 4 and the Output section: `positive` | `negative` as **defined in the bank's §2**, read live and never restated here; the core reports the mix and **enforces no quota** (D3, D5).
- [x] 1.8 Update the Governance section: `tools` stays exactly `[get_knowledge, search_knowledge]`; the core does not write the bank, propose a revision, or approve anything; the bank read is **unconditional** and the `channel` conditional remains the only conditional, with the `post` firewall binding applying to a bank-drawn candidate exactly as to an authored one.
- [x] 1.9 Update the frontmatter `description` so it states the bank-first supply and the two new return fields, and re-read the whole file for any surviving sentence that implies the supply is authored fresh each period.

## 2. plugins/ssc/skills/ssc-ads-approaches (render the labels)

- [x] 2.1 Add `bank_id` (or `in_bank: false`) and `valence` to every candidate block in the §Candidate mechanisms document template, as **structural English labels inside the Vietnamese document** (D6.1). State that a label the caller drops is a label that does not exist downstream, because `plan.context` is what Ideate reads.
- [x] 2.2 Per D6's closing note, remove the residual restatement of the per-candidate construction that `ssc-approaches-core` now owns, and replace it with a pointer to the core. This is the edit the in-flight change's DL2 anticipated — say so in the change's design if the removal turns out to be larger than one block.
- [x] 2.3 Update the frontmatter `description` to mention that the composed document carries each candidate's bank provenance and valence.

## 3. plugins/ssc/skills/ssc-post-approaches (render the labels)

- [x] 3.1 Add `bank_id` (or `in_bank: false`) and `valence` to every candidate block in the §3 candidate template, matching group 2's wording exactly so the two channels' documents stay readable by one Ideate rule (D6.1).
- [x] 3.2 Update the frontmatter `description` to mention the carried bank provenance and valence.

## 4. plugins/ssc/skills/ssc-post-ideate (carry provenance, enforce the valence cap)

- [x] 4.1 In the round-2 supply-matching prose and the round-3 mechanism pass, carry the matched candidate's `bank_id` (or `in_bank: false`) **into the run report**. State explicitly that provenance is a report field, not a row field: nothing may stuff an id, bracket tag or valence marker into the Vietnamese `mechanism` sentence passed to `save_idea` (D6.2).
- [x] 4.2 Add the negative-valence cap to the round-3 spread audit: negative-valence mechanisms together carry **no more than one third of the period's assets**, read from the approved Approaches doc's per-candidate `valence` label.
- [x] 4.3 State the over-cap remedy: re-mechanise from the supply's **positive** candidates, never by inventing. A supply with too few positives to get under the cap is a **named gap** in the report whose fix is the next Approaches run, not a fabrication.
- [x] 4.4 State that the existing ~¼ per-mechanism concentration cap is **unchanged and independent** of the valence cap, and that both are computed over the same settled set.
- [x] 4.5 Update the frontmatter `description` for the valence cap and the carried provenance, without lengthening it beyond the existing style.

## 5. plugins/ssc/skills/ssc-ads-ideate (carry provenance, enforce the valence cap only)

- [x] 5.1 Carry the matched candidate's `bank_id` (or `in_bank: false`) into the run report, with the same "report field, not row field" rule as 4.1.
- [x] 5.2 Add the ⅓ negative-valence cap, worded as in 4.2/4.3.
- [x] 5.3 Add an explicit note that this skill has **no ~¼ per-mechanism spread tally and does not gain one here** — importing it would be a second, unapproved rule change (D5). Do not add a spread audit.
- [x] 5.4 Update the frontmatter `description` accordingly.

## 6. plugins/ssc/skills/ssc-brief-core (the channel-agnostic bounded rule)

- [x] 6.1 Replace the absolute "never authors, restates or varies a mechanism" hard rule with the **bounded** rule: the inherited mechanism is carried and never varied on the skill's own initiative, and an **angle-local override** is permitted only under D7's conditions. Keep the "writing *to* a mechanism is not reproducing it" distinction and the pointer to `craft/doctrine` §2.
- [x] 6.2 Write every bounding condition: bank-first; judged against `craft/doctrine` §2 read live; grounded in an **attributed VOC item from the approved Approaches document** (this skill runs no VOC pass of its own and opens no second outward account of the period); proof-routed from this period's stated inventory; **dropped, not softened or re-traced**, if `rules/compliance` refuses its only route.
- [x] 6.3 Write the angle-local blast radius: `idea.mechanism` is **never** written, patched or demoted; sibling angles are never re-opened, re-run or reported stale. Replace every "one subject, one mechanism" formulation with **one angle, one mechanism**.
- [x] 6.4 Add the override to the return block alongside the carried mechanism, with its `bank_id` or `in_bank: false`, and restate that this skill **holds no mutation tool — the caller persists**.
- [x] 6.5 State what still fails: an angle that can be written to neither the inherited mechanism nor a defensible override is a **misfit angle** — dropped, below bar, and said so. The override is not an escape hatch for a weak angle.
- [x] 6.6 Update the frontmatter `description` and the Governance bullets that currently assert the absolute rule.

## 7. plugins/ssc/skills/ssc-ads-brief (where the override is authored and persisted)

- [x] 7.1 Enumerate every restatement of the absolute mechanism rule in this file first — the design counts roughly ten, including a hard score cap at 2 for "supplies a competing mechanism" and an explicit "never pass a mechanism" on the `save_brief` call. Record the list in the task notes before editing, so none is missed. **A missed restatement leaves the file contradicting itself, which is worse than not making the change** (D7).
- [x] 7.2 Re-bound each enumerated restatement to match group 6's rule: carried by default, override permitted only under the D7 conditions, never varied on the skill's own initiative.
- [x] 7.3 Rewrite the score-cap rule: supplying a *competing* mechanism is still capped, but a **declared, bounded, reported override** is not the same thing and is not penalised. Make the distinction explicit enough that a rater can apply it.
- [x] 7.4 Pass `mechanism` on `save_brief` when — and only when — an override was authored, and state that the field is **omitted** otherwise so the angle inherits the idea's. State the degraded state plainly: until the server field exists (group 8) the override is **reported and not persisted**, this is expected and not a bug, and **no other field may be repurposed to carry it**.
- [x] 7.5 Add the reporting obligation: every override is reported with its `bank_id` or `in_bank: false`, so a human reviewing the draft angle sees that it departed from its subject.
- [x] 7.6 Replace every "one subject, one mechanism" formulation with **one angle, one mechanism**, and update the frontmatter `description`.

## 8. plugins/ssc/skills/ssc-ads-writer (resolution order)

- [x] 8.1 State the resolution order: the brief's `mechanism` override if present, otherwise the idea's — resolved from the single `get_brief` response the skill already reads (it returns the brief **and** its owning idea). The writer still never restates or varies whichever one it resolved.
- [x] 8.2 Extend the legacy-tolerance rule to three cases: override present; no override, idea's mechanism present; neither — **reported, never invented**.
- [x] 8.3 Confirm in prose that the six-item copy floor's mechanism beat is satisfied from the **resolved** mechanism, and update the frontmatter `description`.

## 9. plugins/ssc/skills/ssc-kb-mechanism-harvest (new skill)

- [x] 9.1 Create `plugins/ssc/skills/ssc-kb-mechanism-harvest/SKILL.md` with the directory name equal to the frontmatter `name`, and metadata exactly `type: skill`, `stage: harvest`, `section: knowledge`, `capability: edit`, `tools: [get_knowledge, list_ideas, list_briefs, get_idea, get_brief, propose_knowledge_revision]` (D9).
- [x] 9.2 Write the procedure: for a given period, read the approved ideas and briefs, collect their mechanisms, and **diff them against `craft/mechanism-bank` read live** — membership is derived by comparing text, because there is no stored provenance flag (D6.2).
- [x] 9.3 Write the proposal rule: propose genuinely new mechanisms into the bank via `propose_knowledge_revision`, tagging `valence`, filling `fits` from the VOC item the mechanism was grounded in and `proof_family` from the route it was traced to.
- [x] 9.4 Write the near-duplicate rule: a mechanism restating an existing entry in different words becomes a **proposed revision of that entry**, naming which entry and why — never a second entry, and never a silent merge.
- [x] 9.5 Write the Governance section: propose-only by construction — no `save_knowledge`, no `edit(entity='knowledge')`, no `approve`; every adoption reaches the bank through an operator's approval on the existing KB revision screen. It writes no usage history and retires nothing (D2). A failed KB read STOPS the run and names the document. Persisted prose is Vietnamese.
- [x] 9.6 Write the frontmatter `description` in the house style — long, specific, and stating the propose-only construction and the diff-not-lookup membership test.

## 10. Wiring, docs and version

- [x] 10.1 Add `ssc-kb-mechanism-harvest` to `plugins/ssc/agents/ssc-kb-agent.md`'s `orchestrates:` list and to its stage prose.
- [x] 10.2 Add the harvest stage to `plugins/ssc/commands/ssc-kb.md` where it enumerates stages; the command stays a thin entry point and gains no orchestration logic.
- [x] 10.3 Update root `CLAUDE.md`: the Ads pipeline table's mechanism rule, the one-subject-one-mechanism statement (→ one angle, one mechanism), and the Knowledge-base row's stage list. Do **not** touch the parent workspace `/Users/thang/dev/ssc/CLAUDE.md` — different repo.
- [x] 10.4 Grep the whole repo for surviving "one subject, one mechanism" formulations and for any prose implying the supply is authored fresh each period; fix every hit found outside the files already edited.
- [x] 10.5 Bump `plugins/ssc/.claude-plugin/plugin.json` from `2.56.0` to `2.57.0` (minor — a new skill plus additive behaviour, no removal).

## 11. Gates

- [x] 11.1 Run `node scripts/build-chatgpt-bundle.mjs` from the repo root and report the actual output. This is the real gate on the new skill: it fails on a skill directory not matching its frontmatter `name`, a missing `metadata.dispatches`, and an `orchestrates` entry with no such skill.
- [x] 11.2 Run `node --test hooks/` from `plugins/ssc/` and report actual counts. Regression only — nothing in `hooks/` changes in this change (D11).
- [~] 11.3 **DEFERRED — ChatGPT surface only, does not gate Cowork.** Run `scripts/publish-chatgpt-bundle.sh` and commit the regenerated `chatgpt/workflows.json` here; then `scripts/publish-chatgpt-bundle.sh --check` and confirm exit 0. The mirror commit in `content/` and the brandos-express deploy are **operator actions**, named here and not performed by this change.
- [x] 11.4 Run `openspec validate mechanism-bank --strict` and report the final line.

## 12. `content` repo — server persistence (SEPARATE REPOSITORY, GATED)

**Do not touch any file in the `content` repo until the user has explicitly
approved this group.** Per the workspace cross-repo rule, the list below is the
approval list. Groups 1–11 ship without it; the override degrades to
reported-not-persisted, which group 7.4 states in prose.

- [ ] 12.1 Get the user's explicit approval for this group's four items before editing anything in `content/`.
- [ ] 12.2 Add a nullable `mechanism` text column to the `briefs` table, with the migration applied DB-before-code per the workspace's Postgres rule.
- [ ] 12.3 `save_brief` accepts `mechanism`; `edit(entity='brief')`'s allowlist gains it as an **ordinary, non-approval-bearing** field — the governance hook, its `hooks.json` matchers and the approval-field rule stay untouched, and no new gate appears.
- [ ] 12.4 `get_brief` and `list_briefs` return `mechanism`.
- [ ] 12.5 `get_idea` and `list_ideas` return `mechanism` — verified live that they do **not** today. Harvest cannot see a period's mechanisms without this.
- [ ] 12.6 Deploy brandos-express and confirm the live tool schemas carry the new field before reporting the group done — a session caches tool schemas at start, so check the pod's startTime against the commit rather than trusting the tool list.

## 13. Corrective — scope the bank read in the brief skills

Raised during implementation. `ssc-brief-core` and `ssc-ads-brief` both made
`craft/mechanism-bank` an **unconditional** live read whose failure STOPS the run.
That is right for `ssc-approaches-core`, whose whole supply is bank-first — but in
the brief skills the bank is needed only when an override is being considered,
which is the exception. As written, every `/ssc-ads-brief` run halts until the
operator seeds the document, blocking the pipeline for a permission almost no
angle exercises.

- [x] 13.1 In `plugins/ssc/skills/ssc-brief-core/SKILL.md`, scope the `craft/mechanism-bank` read to override consideration — read it live **whenever an override is being considered**, exactly as `rules/compliance` is scoped there; a failed read then means **no override may be authored this run** (stated, not silent), never a halted run and never a fallback to a remembered bank.
- [x] 13.2 Apply the identical scoping in `plugins/ssc/skills/ssc-ads-brief/SKILL.md`, including its Step 1c load list and its STOP bullets, so the two files agree.
- [x] 13.3 Confirm `ssc-approaches-core`'s bank read stays **unconditional** — its supply is bank-first, so a missing bank there genuinely is a stopped run.
