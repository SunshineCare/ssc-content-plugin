All work is markdown prose in `plugins/ssc/` plus repo-root docs — there is no
runtime test harness for skills, so the gates are §7's bundle build, hook suite
and mirror check. Groups are ordered by dependency: the core exists before either
caller dispatches it, and wiring lands after every file it names.

## 1. plugins/ssc/skills/ssc-approaches-core (the new shared core)

- [x] 1.1 Create `plugins/ssc/skills/ssc-approaches-core/SKILL.md` with frontmatter per design D1 — directory name matching `name: ssc-approaches-core`, `type: skill`, `stage: shared`, `section: shared`, `capability: view`, `tools: [get_knowledge, search_knowledge]` and nothing else. Open the `description` with "shared sub-skill, dispatched by the two Approaches skills, never invoked directly" (D8).
- [x] 1.2 Write the "what you do NOT decide" and "you write nothing / hold no mutation tool / read no plan state" sections, modelled on `ssc-brief-core`'s equivalents.
- [x] 1.3 Write the caller-input contract: `channel`, `period`, the head payload (`research`, `performanceReview`, `proofInventory`, `offerState`), the quarter payload (`sophisticationStage`, `sophisticationRead`, marked findings), and `personas` — including the empty-`personas` fallback (whole live roster, fallback named in the return; never a guessed subset).
- [x] 1.4 Write the **sophistication inherit** return block: carried verbatim, never derived, `NOT STATED` returned as a fact for the caller to report.
- [x] 1.5 Write the **voice-of-customer** return block: the four ranked sources, per-persona language/triggers/objections/myths, mandatory attribution, never invent a quote, respect each persona's avoid-list, an empty source is a named gap that does not stop the run.
- [x] 1.6 Write the **candidate-mechanisms** return block: the mechanism per `craft/doctrine` §2 read live, the quoted attributed VOC item it explains, the proof route (family from `brand/proof-points` + trace, selected from this period's `proofInventory`, unverified when that is null), indirectness against the inherited read, and the rule that a candidate whose only route is refused by `rules/compliance` is not proposed at all.
- [x] 1.7 Write the single `channel` conditional (D2): `post` binds every candidate and quote to `rules/organic-vs-paid-firewall` and refuses any ad-sourced line; `ad` behaves exactly as `ssc-ads-approaches` does today. No other conditional anywhere in the file.
- [x] 1.8 Write the KB read list (named docs + sections, read live every run per D4) and the failed-read STOP that names the document and never falls back to a remembered version.
- [x] 1.9 Write the return-shape template the callers compose from, and the governance section (propose-only, no mutation tool, no WebSearch/fetch, Vietnamese persisted prose, no hard-coded KB content).

## 2. plugins/ssc/skills/ssc-ads-approaches (behaviour-preserving refactor)

- [x] 2.1 Add `orchestrates: [ssc-approaches-core]` to the frontmatter; leave `tools` unchanged.
- [x] 2.2 Step 1b: keep every read; delete only the paragraph explaining how the sophistication read constrains which mechanisms are worth proposing, replaced by one line saying these fields are passed to the core in Step 4.
- [x] 2.3 Replace the **Step 4** body with the core dispatch (`channel='ad'`) plus the payload table. Every deleted VOC rule must now exist in the core exactly once — confirm none was dropped.
- [x] 2.4 Replace the **Step 5** body with what the caller does with the returned blocks: compose the two doc sections from them, carry named gaps through, never re-author or re-score. Keep the "you propose, Ideate picks, a human approves" rule here.
- [x] 2.5 Add the governance bullet: the VOC pass and the mechanism supply are the shared core's; this skill composes and saves them and never re-authors them.
- [x] 2.6 Verify the refactor is behaviour-preserving: `git diff` shows Step 6's persisted-doc template and Step 6b's `creative_target` rules **unchanged**, and no "Step N" cross-reference in the file or its governance section is broken.

## 3. plugins/ssc/skills/ssc-post-approaches (inherit + supply + renumber)

- [x] 3.1 Frontmatter: add `orchestrates: [ssc-approaches-core]`, extend the `description` with the inherited sophistication read and the candidate-mechanism supply. Tools unchanged.
- [x] 3.2 Step 1: hold `plan.proofInventory` and `plan.offerState` off the head response already read, each with the "null is a FACT" rule.
- [x] 3.3 Step 3: hold `sophisticationStage` + `sophisticationRead` from the quarter brief — inherited, never derived.
- [x] 3.4 Step 4: add `brand/proof-points` and `rules/compliance` to the KB list (the existing failed-read STOP covers them).
- [x] 3.5 Add **Step 5b — dispatch `ssc-approaches-core`** with `channel='post'`, `period`, the Step 1 head payload, the Step 3 quarter payload and the featured personas. Numbered 5b so Steps 6 and 7 do not move.
- [x] 3.6 Restructure the persisted doc from five sections to seven: insert §2 Tiếng nói khách hàng and §3 Cơ chế đề xuất above the former §2, which becomes §4; former §3/§4/§5 become §5/§6/§7. Write the two new section bodies.
- [x] 3.7 Add the sophistication constraint as one new numbered §1 rule (next free number), stated exactly once, or the `NOT STATED` gap line.
- [x] 3.8 Work the renumbering checklist in design D5 top to bottom — Step 2 allocation note, Step 4 `brand/angles` entry, Step 6 length / §1-is-shared / numbering / §1-description / examples paragraphs, and the four section bodies. Confirm every `§N` reference in the file resolves to the section it means.
- [x] 3.9 Raise the length budget from ~1700 to ~2400 Vietnamese tokens, keeping the `wc -w`-on-the-draft-file check a real gate, and restate the split (≈1200 guidance / 500 examples / 700 for §2–§3).
- [x] 3.10 Step 7 summary: add the inherited-sophistication line (or the gap) and the candidate-mechanism count.
- [x] 3.11 Examples rule: §2 carries attributed quotes, never composed illustrations; §3 carries one worked candidate block. State it where the two example kinds are labelled.

## 4. plugins/ssc/skills/ssc-post-ideate (draw on the supply, clear the bar)

- [x] 4.1 Round 2 (2b): where a title matches a candidate in the approved doc's §3, carry that candidate's mechanism on `save_idea` as the approved doc states it — carried, never re-authored or paraphrased. Where none matches, omit the argument exactly as today, with the existing never-delay/never-filler rule restated unchanged.
- [x] 4.2 Round 3 mechanism pass: prefer the approved supply; an off-supply mechanism is permitted and is named as off-supply in the 3d report.
- [x] 4.3 State the off-supply reporting boundary: `mechanism` is write-only on today's tool surface, so the list is authoritative only for mechanisms authored in this run — reuse the skill's existing third boundary rather than inventing a second one.
- [x] 4.4 Round 3 (3a): add the sophistication bar — the angle and the awareness stage declared with it must clear the read carried in the approved doc's §1; the bar constrains the **angle** (rewrite it), never the draft; `NOT STATED` means say so and apply no bar.
- [x] 4.5 3d report: add the bar line and the `**Cơ chế ngoài danh sách đã duyệt:** <n>` block (idea × mechanism × why no candidate fitted), both Vietnamese, both reported every run.
- [x] 4.6 Governance: add the bullet tying the two together — the supply is a source to prefer, never a closed list; the sophistication bar is inherited, never derived here. `orchestrates` stays `[ssc-brief-core]`; the core is not dispatched from this skill.

## 5. plugins/ssc/skills/ssc-post-schedule (sequence against the read)

- [x] 5.1 Step 2: hold `plan.context` off the `get_channel_plan` call the gate check already makes — no new call, no new tool, and the "You need no other KB doc" line stays true.
- [x] 5.2 Read only the sophistication line from §1 of the approved doc; preserve verbatim the existing trap that the Approaches doc has no key-date section.
- [x] 5.3 Step 5: add the sequencing preference inside *spread the remainder* — subordinate to the key-date pins and the adjacency repair, never able to move a pinned post.
- [x] 5.4 State what it sorts on, since `mechanism` is not returned by `list_ideas`: the idea's `tags` (`journey_stage`, `frame`, `entry`) and brief fields (`hook_direction`, `core_message`, `awareness_stage` where persisted) — and that it never re-derives a mechanism to sort by.
- [x] 5.5 Step 7 report: one line naming the rule applied, or an explicit no-sequencing-claim line when the read is `NOT STATED`.

## 6. Wiring (agents, command, docs, version)

- [x] 6.1 `plugins/ssc/agents/ssc-post-agent.md` — add `ssc-approaches-core` last in `orchestrates:` with the inline shared-sub-skill comment, matching the existing `ssc-brief-core` convention.
- [x] 6.2 `plugins/ssc/agents/ssc-ads-agent.md` — same addition, same placement and comment.
- [x] 6.3 `plugins/ssc/commands/ssc-post-plan.md` — the step table's Approaches row and the Grounding-order section name the inherited sophistication read and the candidate-mechanism supply. No orchestration logic added; it stays a thin entry point.
- [x] 6.4 This repo's root `CLAUDE.md` — Posts (plan) and Ads (plan) pipeline rows mention the shared core alongside the `ssc-brief-core` precedent. Do **not** touch the parent workspace `/Users/thang/dev/ssc/CLAUDE.md`.
- [x] 6.5 `plugins/ssc/.claude-plugin/plugin.json` — version `2.53.0` → `2.54.0`, in the same commit as the prose change.

## 7. Verification gates

- [x] 7.1 `node scripts/build-chatgpt-bundle.mjs` passes — it validates `metadata.dispatches`, the skill-dir/`name` match and every `orchestrates` entry, so this is the gate that proves the new skill is wired. Report the exit code.
- [x] 7.2 `node --test hooks/` from `plugins/ssc/` — unchanged by this work; run it to confirm nothing regressed and report actual counts.
- [x] 7.3 `scripts/publish-chatgpt-bundle.sh` run and `chatgpt/workflows.json` committed here; `scripts/publish-chatgpt-bundle.sh --check` exits 0. The mirror commit in the `content` repo and the brandos-express deploy are named as operator actions and are **not** performed by this change.
- [x] 7.4 `openspec validate post-plan-sophistication-mechanism-supply` passes.
- [x] 7.5 Invariant sweep across every file touched (design D9): no `approve` / `unapprove` / publish / schedule tool added anywhere, no `edit`-to-demote, no gate added or moved, no hard-coded KB content or persona name in a closed list, no `WebSearch` on the core, every MCP tool named exists on the BrandOS surface, and all persisted prose is Vietnamese including headings.
- [x] 7.6 Confirm against a live BrandOS read that `get_strategy_brief` returns the two sophistication fields and `get_month_plan` returns `proofInventory` / `offerState` for a real period — rather than trusting the design's account of them.
