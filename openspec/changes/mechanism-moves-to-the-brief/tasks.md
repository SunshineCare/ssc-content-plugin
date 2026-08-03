## 1. plugins/ssc/skills

All prose. No TDD gate — the structural gate is `node scripts/build-chatgpt-bundle.mjs`
at task 7.2. Every task keeps the repo's live-read rule: name the KB doc and its
section, never restate its contents.

- [x] 1.1 `ssc-approaches-core/SKILL.md` — delete Step 4's candidate-mechanism supply, the
      `craft/mechanism-bank` read and the `in_bank` marker; drop `bank_id`/`valence` from the
      return shape. Keep the voice-of-customer pass and state that the approved Approaches
      document is the sanctioned source of a brief's attributed quote. The no-mutation-tool
      invariant stays. (design D5)
- [x] 1.2 `ssc-post-approaches/SKILL.md` — remove the supply-shaped instructions and every
      reference to the approved doc's §3 candidate supply; the VOC section stays. (D5)
- [x] 1.3 `ssc-ads-approaches/SKILL.md` — same removal; `creative_target` is untouched. (D5)
- [x] 1.4 `ssc-brief-core/SKILL.md` — delete the "never authors, restates or varies a
      mechanism" rule and the whole override apparatus. Add: settle THIS angle's mechanism
      bank-first (`list_mechanisms`, `get_mechanism`), grounded in an attributed VOC item
      from the approved Approaches document, proof-routed from the period's inventory,
      dropped — not softened — when `rules/compliance` refuses the only route, judged against
      `craft/doctrine` §2 read live; author fresh only where nothing in the bank fits and say
      so. Add the two read tools to frontmatter. Still holds no mutation tool — the caller
      saves. A failed bank read stops that run and names the document. (D1, D3)
- [x] 1.5 `ssc-ads-brief/SKILL.md` — pass `mechanism` on every `save_brief`; state that an
      `ad` brief with no mechanism cannot be approved (`field: 'mechanism'`), that each angle
      settles its own, and that siblings are never touched, re-opened or reported stale. (D1)
- [x] 1.6 `ssc-post-ideate/SKILL.md` — rounds 1–2 drop the mechanism entirely, with the
      `¼`/`⅓` caps, the supply match and the mechanism-keyed approvability verdict. Round 2
      WITHHOLDS `detail.mechanism` at mint, stating why: a non-blank one mints the post brief
      `approved` and a skill must never self-approve. Round 3 is the post's brief step — it
      dispatches `ssc-brief-core` and writes the settled mechanism with
      `edit(entity='brief', patch={ mechanism })`. (D4)
- [x] 1.7 `ssc-ads-ideate/SKILL.md` — remove the mechanism pass and both caps; subjects stay
      persona-free and mechanism-free. (D6)
- [x] 1.8 `ssc-ads-writer/SKILL.md` — delete the brief-override-first resolution table; the
      mechanism is `brief.mechanism` alone, still written *to* and never restated. Legacy
      collapses to one case: a brief approved before the gate carries none → named in the
      report, never invented. (D11)
- [x] 1.9 `ssc-post-produce/SKILL.md` — same deletion and same single legacy case. (D11)
- [x] 1.10 `ssc-post-authority/SKILL.md` — same; the mechanism beat is judged against
      `brief.mechanism`. (D11)
- [x] 1.11 `ssc-post-schedule/SKILL.md` — the indirect-first sort key moves from
      `list_ideas`' `mechanism` (no longer returned) to `list_briefs`' `mechanism`; the
      never-re-derive-a-mechanism-to-sort-by rule stands. (D11)
- [x] 1.12 `ssc-kb-mechanism-harvest/SKILL.md` — rewrite against the table: read the period's
      briefs, diff settled mechanisms against the bank read live, `save_mechanism` a draft for
      each genuinely new one, and `edit(entity='mechanism')` a near-duplicate in place under
      the four bounds (content fields only; never `status`/`slug`; sharpening not repurposing;
      before/after reported). Absorb the period mix audit — concentration over `~¼` and
      negative valence over `⅓`, measured across the period's briefs, report-only. Drop
      `propose_knowledge_revision` from the tool list; hold no `approve`/`unapprove`.
      (D6, D7, D8, D10)

## 2. plugins/ssc/agents

- [x] 2.1 `ssc-kb-agent.md` — re-point the harvest branch at the table, the draft-plus-approval
      growth path and the new mix audit; drop the KB-revision framing for bank entries.
- [x] 2.2 `ssc-ads-agent.md` — remove the "candidate-mechanism pass" from the Approaches
      description; re-point "a missing mechanism is not a gate" at the brief.
- [x] 2.3 `ssc-post-writer-agent.md` — drop the resolution/override language; the producers
      read `brief.mechanism`.

## 3. plugins/ssc/commands

- [x] 3.1 `ssc-kb.md` — describe the harvest branch as bank drafts + bounded sharpening +
      mix audit.
- [x] 3.2 `ssc-post-plan.md` — remove the supply/mechanism references that Approaches and
      Ideate no longer own.

## 4. BrandOS knowledge base (live data — no repo directory)

Propose-only. Each is one `propose_knowledge_revision`; chị Kiều My approves. Vietnamese.
These go up BEFORE the plugin commit is announced as live (D12).

- [x] 4.1 `craft/doctrine` → 1.2 — §1 chain table (mechanism moves to the brief step, the
      idea row loses its mechanism), §2 rule 1 (inheritance + bounded exception deleted;
      authored at the angle; siblings may differ, each on its own grounding), §2 rule 3 (the
      bar is brief approval for `ad`/`post`, enforced server-side, drafting never blocked),
      §2 supply paragraph (the bank is a table read live; Approaches supplies VOC), §6 (the
      mandatory bank read moves to Brief; failed read stops that run), §7 (not retroactive;
      the migration already carried idea mechanisms down onto their briefs). (D9)
- [x] 4.2 `craft/mechanism-bank` → 1.2 — §1 (bank-first relationship is with Brief), §2
      (valence + priority unchanged; the ceiling is measured over briefs and reported by
      harvest), §3 (field table corrected: `slug` is the citable key, `id` the row id,
      `status` added, approved-only default and never-returns-retired stated), §4 (replace the
      stale "bank is empty" with "when no entry fits"), footer (growth = `save_mechanism`
      drafts + human approval, plus the bounded in-place sharpening). (D9)

## 5. .claude-plugin

- [x] 5.1 Bump `version` in `plugin.json` in the same commit as the prose. (repo CLAUDE.md)

## 6. chatgpt

- [x] 6.1 Regenerate the bundle and refresh the mirror: `scripts/publish-chatgpt-bundle.sh`,
      then `--check` to confirm it is clean. The mirror lives in the `content` repo
      (`mcp-server/lib/brandos/workflows/workflows.json`) — the only file this change touches
      outside this repo; commit it there separately.

## 7. Verification

- [x] 7.1 Grep gate — no surviving reference to `idea.mechanism`, `in_bank`, "inherited
      mechanism", "angle-local override", or `craft/mechanism-bank` §3 as a source of
      mechanism entries, anywhere under `plugins/ssc/`. (D13)
- [x] 7.2 `node scripts/build-chatgpt-bundle.mjs` (structural gate: skill dir vs frontmatter
      `name`, `orchestrates` resolution, `metadata.dispatches`) and `node --test hooks/` from
      `plugins/ssc/` (regression only — no hook change). Report actual counts. (D13)
