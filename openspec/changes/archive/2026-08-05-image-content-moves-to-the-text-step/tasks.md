# Tasks — image content is authored at the Text step

All tasks are **prose edits** to markdown skills, agents and commands. This repo has no
compiled code and no test harness for prose, so no task carries a TDD gate. The wording shape
and verified `file:line` anchors are in `design.md` **§D10**; the requirements they satisfy
are in `specs/on-image-copy-authoring/spec.md` and the three modified specs.

Group 1 is the new home and must land first — it is what groups 2–4 point at. Groups 2, 3 and
4 have disjoint write sets and may run in any order after it. Group 5 depends on all.

## 1. plugins/ssc/skills/ssc-image-prompt-text — the new home

- [x] 1.1 Frontmatter: rewrite `description` to state both phases (authors the on-image copy fitted to the chain tip, then the placement prompt); add `save_content`, `list_taxonomies`, `get_channel_plan`, `get_month_plan` to `tools:`. Per design §D1/§D8.
- [x] 1.2 Lead-in (l.20-24): state the two phases and their human gate; keep the zero-credit and propose-only framing, adding that `save_content` inserts drafts and approves nothing.
- [x] 1.3 New **Phase 1 — resolve the on-image copy** section, placed after Step 2 (chain tip) and before the present Step 3: the four ordered gates (channel/brief/idea → chain tip → ≥1 approved `copy` → no approved `image_content`), the unreviewed-drafts STOP, and the explicit `image_content` re-run marker. Per design §D5, spec *Phase 1 gates* + *saves drafts immediately*.
- [x] 1.4 Phase 1 — **fit the payload to the tip**: judge the tip from its authored prompt (`list_creative_prompts` for the tip's layer), optionally one `view_image` look; choose ONE density profile for the whole set; carry the Minimal / Standard / Text-dominant rubric as a fitting table, with no instruction to span profiles. Per design §D2, spec *fitted to the resolved chain tip*.
- [x] 1.5 Phase 1 — **the body contract and caps**, moved verbatim from `ssc-ads-writer` l.32-42 / l.442-450: the fixed `HEADLINE:` / `SUBHEADLINE:` / `BULLETS:` markers, the Vietnamese values, the omit-don't-empty rule, the hard word/character caps, and the note that these caps are the one thing the file states rather than reads. Per spec *body contract and its caps*.
- [x] 1.6 Phase 1 — **grounding**: resolve persona / route / awareness / layer (ad) or pillar (post) via `list_taxonomies` + the brief; resolve the period from the owning plan and read `proofInventory` + `offerState`; anchor each candidate to ONE approved `copy` and distil that copy's hook; carry the divergence rule (approved copy is the content authority, the brief the angle authority — flag it, never split the difference). KB reads listed as live paths with the failed-read STOP. Per design §D3/§D8, spec *hand-downs*.
- [x] 1.7 Phase 1 — **the channel branch**: the ad/post table from design §D6 (objective, hook bar, density steer, register, what a post may not carry), plus "density is not softness" on both. Per spec *channel selects register and steer*.
- [x] 1.8 Phase 1 — **judgement**: the floor (read live, REJECT not score), the opening-frame declaration, the set coverage verdict + ≥3-distinct proof bar, the mechanism read from `brief.mechanism` with the capping proof-backing criterion, the score + Vietnamese `comment`, and the axis-preserving regenerate loop bounded at 2 attempts per slot. Per design §D3, spec *full judgement travels* + modified `mechanism-proof-substantiation`.
- [x] 1.9 Phase 1 — **save + STOP**: one `save_content` insert per surviving candidate (`brief_id`, `section='image_content'`, `body`, `terms[]`, `coverage`, `score`, `comment`), then the Vietnamese STOP naming the Image Content stage and the re-run command. Per design §D4.
- [x] 1.10 Phase 2 (present Step 3, l.77-102): drop the density-menu selection prose; state the one-approved-row case, the most-recently-approved rule for several, and keep the "select a row whole, never assemble" rule and the too-heavy routing. Per design §D2, spec *Phase 2 renders the approved row*.
- [x] 1.11 Governance (l.222-233) + Output (l.234-238): the two-phase gate, the new mutation and what it is not, the persist rule, and the phase-1 vs phase-2 report shapes (phase 1 reports the profile chosen and the tip evidence for it, the floor/coverage verdict, and any slot dropped after 2 attempts).

## 2. plugins/ssc/skills/ssc-ads-writer

- [x] 2.1 Remove `image_content` from the section enum and the state machine: `description` l.5, lead-in l.20/22/24, `section` input l.52, `n_image_contents` l.59, the page-contract line l.30 and the on-image block spec l.32-42, and every row of the Step-2 table (l.211-230) — the "all three approved" STOP becomes the two derived sections.
- [x] 2.2 Add the routing STOP: an explicit `section: image_content` STOPs (Vietnamese) naming `/ssc-image-prompt <brief_id> text`, and is never silently redirected to another section. Per spec *producers refuse the section*.
- [x] 2.3 Step 4 (l.329-333): delete the `image_content` grounding bullet; leave `headline` and `description` untouched.
- [x] 2.4 Step 6 (l.442-468): delete the whole `image_content` authoring block including the density menu and its rationale.
- [x] 2.5 Step 7: delete the `image_content`-only checklist items (structure + caps, hook strength, the 50%-zoom mobile test) and the `image_content` clause of the format-sizing list (l.485); leave the shared items intact.
- [x] 2.6 Steps 8–9 and Governance: the `section` enum on save, the summary's section line, the next-action lines, and every Governance clause naming four sections.

## 3. plugins/ssc/skills/ssc-post-authority + ssc-post-produce + ssc-post-writer-agent

- [x] 3.1 `ssc-post-authority`: delete **Step 1b** (l.246-325) entirely and the two `image_content`-only KB paths (l.239-242).
- [x] 3.2 `ssc-post-authority`: collapse Step 0 (l.59-82) to the single `copy` section — the gate row, the auto-pick rows and the explicit-name rows; an explicit `image_content` STOPs naming `/ssc-image-prompt <brief_id> text`.
- [x] 3.3 `ssc-post-authority`: reduce the judging, regeneration, presentation and save prose to `copy` — the "who regenerates" split (l.504, l.516, l.573) collapses to the writer, the `image_content` judging list (l.484-486) goes, and the `section` stamp discussion (l.35, l.587, l.598-599) names `copy` alone (with `storyboard` still noted as a foreign row). Update `description` l.5 and Governance.
- [x] 3.4 `ssc-post-produce` l.426 and l.591: restate the ≥3-distinct proof bar for the one post section this skill writes.
- [x] 3.5 `ssc-post-writer-agent`: drop the `section` input and the `image_content` gate (l.6, l.66-70, l.78-79, l.163, l.169, l.180-181, l.197, l.224, l.301-308); the hand-off after an approved `copy` (l.237-246) points at `/ssc-image-prompt <brief_id>`.

## 4. Commands, the image-prompt agent, and the read-only cross-references

- [x] 4.1 `commands/ssc-ad.md` — `argument-hint` l.2, description l.5, the section list l.29, and the flow prose l.38/46/49/57.
- [x] 4.2 `commands/ssc-post.md` — `argument-hint` l.2, description l.6, the section list l.30, the section table l.42, the flow rows l.55-61 and the next-action lines l.75-76 (the on-image next action becomes `/ssc-image-prompt <brief_id>`).
- [x] 4.3 `commands/ssc-image-prompt.md` — state that the Text step authors the on-image copy before the placement prompt, and document the `image_content` re-run marker; update l.171-172.
- [x] 4.4 `agents/ssc-image-prompt-agent.md` — the Text precondition (l.366-372) no longer STOPs routing to `/ssc-ad` / `/ssc-post`; it dispatches the Text skill, which authors the content and stops for approval. Update the `list_content` state note (l.242), the Inputs parsing block for the bare `image_content` marker, and the Governance clauses naming Text's precondition. Per spec *Missing on-image copy is authored, not routed away*.
- [x] 4.5 `skills/ssc-video-script/SKILL.md` l.43-44, `skills/ssc-ads-publish/SKILL.md` l.33/153-154 — both only read the section; confirm the wording still holds and adjust any claim about which command produces it.
- [x] 4.6 `skills/ssc-image-prompt-{scene,subject,composition,edit}/SKILL.md` — confirm the D4 grounding lists still read correctly when no `image_content` row exists yet, and adjust the "if any exist" phrasing where it implies the section is always present.

## 5. plugins/ssc + release

- [x] 5.1 Cross-read the edited files against `specs/on-image-copy-authoring/spec.md`: `image_content` is authored in exactly one place, no skill instructs a density span, no floor item / proof point / formula is restated, and no skill gained `approve_*` / `unapprove_*` / `edit` / `delete` / a generate or publish tool.
- [x] 5.2 Run `node scripts/build-chatgpt-bundle.mjs` and confirm it exits 0 (validates `metadata.dispatches`, skill-dir/frontmatter-name match, `orchestrates` resolution); regenerates `chatgpt/workflows.json`.
- [x] 5.3 Grep the plugin for dangling references: no `/ssc-ad … image_content` or `/ssc-post … image_content` route survives outside the two routing STOPs.
- [x] 5.4 Bump `version` in `plugins/ssc/.claude-plugin/plugin.json` — same commit as the prose change, per repo CLAUDE.md.
- [x] 5.5 Ran `scripts/publish-chatgpt-bundle.sh` against the cluster `DATABASE_URL_BRANDOS` — KB citation gate passed (911 resolved) and the mirror was written to `content/mcp-server/lib/brandos/workflows/workflows.json`. Committing that mirror in the `content` repo and deploying brandos-express stay with the operator: `content` is a separate repository.
