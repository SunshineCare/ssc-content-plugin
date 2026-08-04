## Context

The BrandOS server shipped `908dd48` / `1bff834` on 2026-08-03 and moved the
mechanism out from under the plugin. Verified live against the running server and
the live knowledge base, four things are now true that the plugin's prose still
denies:

1. **`ideas.mechanism` is dropped.** `save_idea` accepts no `mechanism` argument.
   A mechanism supplied at ideation rides `detail.mechanism` onto the brief that
   call mints — and a *non-blank* one mints that post brief `approved`, while a
   blank one mints `draft`.
2. **`briefs.mechanism` (nullable text) is the only home.** There is no second
   field to inherit from, so there is nothing to override and no resolution order
   to compute.
3. **The approval gate moved.** `approve(entity='brief')` refuses an `ad` or
   `post` brief whose mechanism is blank, reporting `field: 'mechanism'`. Idea
   approval carries no mechanism bar. `youtube` briefs are untouched. Rows
   approved before the gate are grandfathered.
4. **The bank is a table, not a document.** `mechanisms` is read with
   `list_mechanisms` (approved-only unless `status` is passed; `valence` / `q` /
   `limit` filters) and `get_mechanism` (by `slug`, returning `id` and
   `version`), and written with `save_mechanism` (mints `draft`, accepts no
   `status`). `edit` / `approve` / `delete` are the generic verbs; `delete` is
   soft. Entry fields are `slug`, `mechanism`, `valence` (`positive` |
   `negative`), `fits`, `proof_family`, `notes`, plus `status` / `id` /
   `version`. The operator has already seeded 10+ approved entries.

The plugin describes the opposite world. `openspec/specs/angle-mechanism-override`
specifies a bounded angle-local override of an inherited idea mechanism.
`openspec/specs/mechanism-bank` specifies a `craft/mechanism-bank` knowledge
document with a three-section contract, an `in_bank: false` gap-fill marker, a
`bank_id` carried through Ideate, and a harvest that grows the bank through
`propose_knowledge_revision`. Eighteen files under `plugins/ssc/` mention a
mechanism, and the heaviest — `ssc-post-ideate` (153 hits), `ssc-brief-core`
(88), `ssc-ads-brief` (87), `ssc-kb-mechanism-harvest` (71) — are built around
inheritance. Every run now cites doctrine that contradicts the server it is
calling.

Two constraints shape everything below. First, this repository is **prose**:
markdown skills, agents and commands plus one Node hook. There is no runtime test
harness for prose, so correctness is carried by explicit vocabulary, a structural
bundle build, a grep gate, and one real-path run. Second, the plugin's core
invariant is **propose-only**: a skill drafts and self-scores, a human approves.
The server's `approve` capability is the real gate; `hooks/approval-gate.mjs` is
a harness backstop; the prose is the third layer.

There is a live sibling: `openspec/changes/post-plan-sophistication-mechanism-supply`
is implemented (47 of 48 tasks done, only the bundle republish open) but **not
archived**, so its three added capabilities — `approaches-shared-core`,
`post-mechanism-supply`, `post-plan-sophistication-inherit` — exist only inside
that change folder and not in `openspec/specs/`. One of them,
`post-mechanism-supply`, is precisely the candidate-mechanism supply this change
withdraws.

## Goals / Non-Goals

**Goals:**

- Make every skill, agent and command describe the mechanism as **authored at the
  angle brief** — one angle, one mechanism — with no inheritance, no override and
  no resolution step anywhere in the pipeline.
- Move the bank from a knowledge document to the `mechanisms` table in every place
  the prose reads or writes it, including the approved-only read default and the
  draft-minting write.
- Keep a skill from ever flipping a governance gate, including the new indirect
  path the server opened: a non-blank `detail.mechanism` at mint would silently
  produce an `approved` post brief.
- Relocate the two usage caps (`~¼` single-mechanism concentration, `⅓`
  negative-valence share) to the one step that can actually see a whole period,
  as a **report**, not an enforcement.
- Bring the two governing knowledge documents — `craft/doctrine` and
  `craft/mechanism-bank` — into agreement with the server, by proposal.
- Retire the `angle-mechanism-override` capability rather than amend it, and
  restate the surviving guarantees under a new `angle-mechanism-authoring`
  capability.

**Non-Goals:**

- **No server or `content` source change.** The server work has shipped. The only
  `content` artifact this change touches is the generated ChatGPT bundle mirror
  `mcp-server/lib/brandos/workflows/workflows.json`.
- **No `briefs.mechanism_slug` column.** Persisted provenance would be a
  cross-repo contract change; it is not proposed here.
- **No retroactive rework.** Briefs approved before the gate are never re-opened,
  re-mechanised or reported stale.
- **No coherence check across sibling angles.** Two angles of one subject may name
  mechanisms that do not cohere. Nothing will check it; the harvest mix report is
  the only place it surfaces.
- **No hook change.** `briefs.mechanism` is an ordinary field, so no matcher in
  `hooks.json` or `approval-gate.mjs` moves.
- **No change to `youtube` briefs**, to `creative_target` on the ads side, or to
  `ssc-video-keyframe` (whose single "mechanism" hit is copy guidance, unrelated).

## Decisions

### D1 — The mechanism's only home is `briefs.mechanism`, and the guarantee is *one angle, one mechanism*

Every skill reads and writes exactly one field. The persona-free subject carries
no mechanism at all; each angle settles its own.

*Alternative considered: keep the mechanism on the idea and treat
`briefs.mechanism` as an override.* This is what the superseded design
(`docs/superpowers/specs/2026-08-03-mechanism-bank-design.md`) specified, and it
would have been a smaller prose diff. Rejected because it no longer describes
reality — `ideas.mechanism` is gone and `save_idea` takes no mechanism — so prose
written to an override model would contradict the server on every single run, in
the one direction (a resolution order over a field that does not exist) that
fails silently rather than loudly.

### D2 — `angle-mechanism-override` is removed as a capability, not rewritten

Its ten requirements all qualify an exception to an inheritance default. With the
default gone there is nothing to except, and its central vocabulary — "inherited",
"override", "blast radius", "resolve the brief's override first, then the idea's"
— is exactly what must stop appearing. A new capability,
`angle-mechanism-authoring`, restates what survives: bank-first drawing, the
doctrine judgement, voice-of-customer grounding, proof-routing, drop-not-soften on
a compliance refusal, the reporting duty, and the one-angle-one-mechanism
guarantee stated without reference to a subject-level mechanism.

*Alternative considered: rename and amend the capability in place.* Rejected
because a `MODIFIED` delta preserves every requirement it does not touch, and the
requirements here are not individually wrong so much as collectively about a thing
that no longer exists. Withdrawing them outright is the only way the grep gate in
D12 can be absolute.

### D3 — `ssc-brief-core` becomes the mechanism's author and still holds no mutation tool

The shared brief core gains the two read tools (`list_mechanisms`,
`get_mechanism`) and a five-step settling procedure: read the bank live, match
against an attributed voice-of-customer item from the approved Approaches document
of that period, proof-route from the period's stated inventory, author fresh only
where nothing in the bank fits and say so, and judge whatever it settles against
`craft/doctrine` §2 read live. It loses its absolute rule that it *never authors,
restates or varies a mechanism*. A failed bank read stops that run and names the
document.

It still holds **no mutation tool** — `ssc-ads-brief` passes the returned
`mechanism` on each `save_brief`, and `ssc-post-ideate` round 3 patches it with
`edit(entity='brief')`. That separation is what makes the core safe for two
pipelines to share, and it is the same seam `ssc-approaches-core` already uses.

*Alternative considered: put the bank read in each channel brief skill.*
Rejected — two copies of a five-step procedure diverge the day either is edited,
and the stale one wins wherever it is read first. The core already exists as the
shared seam; putting the procedure anywhere else duplicates it for no gain.

### D4 — `ssc-post-ideate` round 2 deliberately withholds `detail.mechanism` at mint

Round 2 mints the post brief with a blank mechanism, so it mints `draft`. Round 3
— which *is* the post's brief step, one angle and therefore one mechanism — writes
the mechanism with `edit(entity='brief', patch={ mechanism })`. The prose states
the reason, because a future editor who does not know it will "fix" the extra call.

*Alternative considered: pass `detail.mechanism` at round 2's mint.* Fewer calls,
and the mechanism lands at the moment it is known. Rejected: a non-blank
`detail.mechanism` mints the post brief **`approved`**, so a skill would
self-approve a brief — the exact thing propose-only exists to prevent. Worse, it
is invisible to every backstop: the hook governs `approve` / `unapprove` verbs,
the money-moving Meta tools, and an `edit` whose patch carries an approval-bearing
field, and a `save_idea` whose side effect is an approval matches none of them.
The extra `edit` call is the price of keeping the invariant enforceable.

### D5 — The candidate-mechanism supply leaves Approaches; the voice-of-customer pass stays

`ssc-approaches-core` and both channel Approaches skills delete step 4's
candidate-mechanism supply, the bank read, and the `in_bank` marker. The section
is removed rather than emptied, together with every downstream reference to "the
approved doc's candidate supply". The voice-of-customer pass stays and is promoted
in role: the approved Approaches document becomes the **only** sanctioned source
of the attributed customer quote a brief must cite. The core's
no-mutation-tool / no-plan-state construction is untouched, and `creative_target`
on the ads side is unaffected.

*Alternative considered: keep a per-period shortlist of bank slugs per
voice-of-customer item.* Rejected — the bank is now queryable by the step that
actually chooses, so a shortlist is a second opinion the brief has to reconcile
against the bank it is already reading. When the two disagree, nothing says which
wins, and the reconciliation would have to be specified for no benefit.

### D6 — The `¼` and `⅓` caps become a report-only period audit inside harvest

`ssc-kb-mechanism-harvest` reports the period's mix — one mechanism over roughly a
quarter of the assets, negative valence over a third — naming each breach. It
proposes no re-mechanising and re-opens nothing; the fix is the operator's, on
briefs that are not yet approved.

*Alternatives considered.* Keeping the caps at **Ideate** was rejected: Ideate no
longer settles mechanisms, so it would be counting a field it does not write, on
rows it does not own. Enforcing them at the **brief** was rejected on a harder
ground: a brief sees one angle and cannot see a period, and even if it could,
enforcement would block drafting — which the doctrine explicitly permits (a brief
with no mechanism is saved, kept and worked on; it merely cannot be approved).
Harvest already reads the period's settled mechanisms for its diff, so the audit
is free there and lands where a human is already looking.

### D7 — Harvest may `edit(entity='mechanism')` an approved entry in place, under four bounds

When a period's mechanism is a near-duplicate of an existing bank entry, harvest
sharpens **that** entry rather than minting a near-twin. The permission is bounded
by all four of: content fields only (`mechanism`, `fits`, `proof_family`,
`notes`); **never** `status` and **never** `slug`; sharpening only, never
repurposing an entry to a different meaning; and every edit reported with its
before and after.

This is a deliberate governance loosening and the design records it as one. Every
other live-KB write in this plugin goes through a proposal. It does not breach the
propose-only invariant in the sense the invariant protects — no gate flips,
`status` is untouched, no approval-bearing field appears in the patch, and the
hook stays out of it — but it is the one place a skill edits live supply without a
human seeing a diff first.

*Alternative considered: have harvest only report near-duplicates.* Safer and
consistent with every other KB write. Rejected by the operator in favour of
bounded in-place sharpening; the four bounds and the before/after report are the
compensation. Harvest holds no `approve` and no `unapprove`, so a sharpened entry
cannot be promoted by the same run.

### D8 — Genuinely new mechanisms enter the bank as drafts, and a draft is not supply

`save_mechanism` mints `draft` and accepts no `status`; `list_mechanisms` returns
approved entries unless `status` is passed. A harvested mechanism therefore sits
outside the supply until a human approves it in the dashboard. This is what makes
D7's write permission bounded at all: harvest can propose into the bank freely
because nothing it mints is readable as supply. The `propose_knowledge_revision`
path for bank entries is gone, and the tool drops from the harvest skill.

### D9 — The two knowledge documents are revised by proposal, one submission each

`craft/doctrine` → 1.2 and `craft/mechanism-bank` → 1.2, both via
`propose_knowledge_revision`, both in Vietnamese, neither restating a rule the
other owns.

`craft/doctrine`: the chain table's `CƠ CHẾ` row moves to the brief step and the
idea row loses its one-mechanism obligation; §2 rule 1 deletes the inheritance
default and the entire bounded-exception apparatus, keeping only that sibling
angles may name different mechanisms, each standing on its own grounding,
declared and never a silent contradiction; §2 rule 3 names the **brief**
(`ad` / `post`) as the approval-time bar and says it is enforced server-side while
drafting stays unblocked; the supply paragraph points at the table and reassigns
Approaches to voice-of-customer only; §6 makes the bank read mandatory at **Brief**
and removes it from Approaches; §7 states the move is not retroactive.

`craft/mechanism-bank`: §1 re-points the bank-first relationship at the Brief step
and keeps citing `craft/doctrine` §2 for the definition rather than restating it;
§2 keeps valence and the positive-priority rule but retargets the ceiling sentence
to a ratio measured over a period's **briefs** and reported by harvest; §3
corrects the field table against the table that now backs it (`slug` as the cited
key, `id` as the verb target, `status` added, approved-only default and
never-returns-retired stated); §4 replaces the stale "the bank is empty" section
with **when no entry fits** — author at the brief, report it as not-from-bank, let
harvest propose it in; the footer describes growth as `save_mechanism` drafts plus
human approval, plus D7's bounded sharpening.

*Alternative considered: skip the document revisions and rely on the server's
enforcement.* Rejected on the same ground as D12's sequencing: skills read these
documents **live** and cite them in their own reports, so a run would quote
doctrine contradicting the behaviour it just performed.

### D10 — Provenance is report-only, and harvest's diff is a semantic match rather than a join

There is no `briefs.mechanism_slug`; a brief holds the Vietnamese sentence and
nothing else. "Drawn from `<slug>`" versus "not in the bank" survives only in a run
report. Harvest therefore cannot join a period's briefs to bank rows — it matches
by meaning against the bank read live, which is why D7's "sharpening only, never
repurposing" bound and the before/after report exist: they are what makes a wrong
match recoverable.

*Alternative considered: propose the column.* It would make provenance durable and
harvest's diff exact. Deferred — it is a cross-repo contract change against a
server that has just shipped, and this change is a prose realignment. Named in
Open Questions.

### D11 — Producers read one field; `ssc-post-schedule` moves its sort key to `list_briefs`

`ssc-ads-writer`, `ssc-post-produce` and `ssc-post-authority` delete the
override-first resolution table. The mechanism is `brief.mechanism`, full stop.
Each producer still writes *to* it and never restates, paraphrases, sharpens or
contradicts it, and authors none. Legacy collapses from three cases to one: a
brief approved before the gate carries no mechanism, so production proceeds, the
absence is **named** in the report, and nothing is invented.

`ssc-post-schedule` sorts indirect-first on a mechanism and reads it off
`list_ideas`, which no longer returns one. The sort key moves to `list_briefs`'
`mechanism`; the existing rule stands unchanged — never re-derive a mechanism in
order to sort by it. *Alternative considered: drop the indirect-first sort.*
Rejected — the sequencing rule is sound and independently specified; only its
source moved.

### D12 — Sequencing: the two KB proposals go up first, the plugin commit lands in parallel

Skills read the documents live, so plugin prose saying "authored at the angle"
against a `craft/doctrine` still saying "inherited from the idea" leaves a run's
own citation contradicting itself. Both proposals are submitted in one pass and
wait on chị Kiều My. The plugin commit does not wait, because the server enforces
the new shape either way and the window where prose is ahead of doctrine is
strictly better than the window where it is behind.

### D13 — Verification is a bundle build, a grep gate and one real-path run

There is no test harness for prose, so the gates are named explicitly rather than
assumed:

- `node scripts/build-chatgpt-bundle.mjs` — the real structural gate: skill
  directory versus frontmatter `name`, `orchestrates` resolution, and
  `metadata.dispatches` on every command.
- `node --test hooks/` from `plugins/ssc/` — regression only; no matcher moves.
- **Grep gate** — no surviving reference to `idea.mechanism`, `in_bank`,
  `bank_id`, "inherited mechanism", "angle-local override", or
  `craft/mechanism-bank` §3 as a source of entries.
- `.claude-plugin/plugin.json` version bumped **in the same commit**, and
  `scripts/publish-chatgpt-bundle.sh` re-run so ChatGPT does not keep serving the
  old prose.
- **Real path**, the only behavioural proof: run `/ssc-ads-brief` on a subject for
  a live period and confirm the angle brief carries a mechanism drawn by slug from
  the bank; confirm `approve` refuses a mechanism-less angle with
  `field: 'mechanism'`; run `/ssc-kb` harvest and confirm it reports the period's
  concentration and valence mix and mints **drafts**, not approved entries.

## Risks / Trade-offs

- **Sibling angles of one subject may name mechanisms that do not cohere, and
  nothing checks it.** → Accepted, and stated in the doctrine rather than papered
  over: the guarantee is one *angle*, one mechanism. Each angle's mechanism stands
  on its own grounding and is declared. Harvest's mix report is the only place
  incoherence becomes visible, and it names breaches without proposing fixes.

- **Harvest's in-place edit of an approved bank entry is a governance loosening.**
  → Bounded by D7's four constraints, every edit reported with before/after, and
  harvest holds neither `approve` nor `unapprove`, so nothing it sharpens can be
  promoted in the same run. It remains the single exception and is deliberate.

- **Harvest can sharpen the wrong entry, because its diff matches by meaning and
  not by slug (D10).** → The "sharpening only, never repurposing to a different
  meaning" bound plus the before/after report make a bad match visible and
  reversible by the operator. Provenance in the run report is what stands in for
  the missing column.

- **Legacy briefs approved before the gate carry no mechanism.** → Never
  re-opened, never reported stale; the absence is named in every producer's report
  and nothing is invented to fill it. The server's migration already carried
  pre-existing idea mechanisms down onto their briefs, so the population is small.

- **Prose has no tests, so a missed file ships silently.** → The bundle build
  catches structural drift only. The grep gate in D13 is the actual enforcement for
  retired vocabulary, and it is written as an explicit token list so it can be run
  verbatim rather than reconstructed from memory.

- **The ChatGPT bundle is a second consumer that can go stale.** → The version bump
  and `scripts/publish-chatgpt-bundle.sh` are part of the same commit;
  `--check` exits 1 on a stale mirror. Without them ChatGPT keeps executing
  inheritance prose against a server that dropped the field.

- **The unarchived sibling change re-introduces what this one withdraws.** →
  `post-plan-sophistication-mechanism-supply` adds `post-mechanism-supply` and
  `approaches-shared-core` as *new* capabilities that are not yet in
  `openspec/specs/`. Archiving it **after** this change would write the deleted
  candidate-mechanism supply back into the main specs. Mitigation is ordering, in
  the migration plan below.

- **The prose gets ahead of the live doctrine during proposal review (D12).** →
  Accepted and bounded: the server enforces the brief-level gate regardless, so the
  worst case is a run citing a document that is one revision behind — the opposite
  and strictly worse case being a run citing a document that contradicts the
  server outright, which is today's state.

## Migration Plan

1. **Archive the sibling first.** `post-plan-sophistication-mechanism-supply` is
   implemented; close its one open task (bundle republish) and archive it, so
   `approaches-shared-core`, `post-mechanism-supply` and
   `post-plan-sophistication-inherit` land in `openspec/specs/`. Only then can this
   change's deltas `MODIFY` / `REMOVE` them — a delta cannot remove a requirement
   that has never been in the main specs.
2. **Submit the two `propose_knowledge_revision` payloads** (D9). They wait on the
   operator; nothing downstream blocks on the approval.
3. **Land the plugin prose in dependency order**, so no file references a section
   that has not been written yet: Group A (supply leaves `ssc-approaches-core`,
   `ssc-ads-approaches`, `ssc-post-approaches`) → Group B (`ssc-brief-core`
   becomes the author, then `ssc-ads-brief` and `ssc-post-ideate` round 3 as its
   callers) → Group C (`ssc-post-ideate` rounds 1–2, `ssc-ads-ideate`,
   `ssc-ads-agent` stop touching mechanisms) → Group D (`ssc-ads-writer`,
   `ssc-post-produce`, `ssc-post-authority`, `ssc-post-schedule` read one field) →
   Group E (`ssc-kb-mechanism-harvest`, `ssc-kb-agent`, `commands/ssc-kb.md`,
   `commands/ssc-post-plan.md`).
4. **Run the D13 gates**, bump `.claude-plugin/plugin.json` and regenerate
   `chatgpt/workflows.json` in the same commit.
5. **Republish the mirror**: `scripts/publish-chatgpt-bundle.sh`, then commit the
   refreshed `mcp-server/lib/brandos/workflows/workflows.json` in the `content`
   repo and deploy brandos-express. Both are operator actions in a separate
   repository and are named, not performed, by this change.

**Rollback.** The plugin side is a single markdown commit and reverts cleanly; the
previous version stays installable by version. There is nothing to roll back on
the server — it already enforces the new shape, which is why a revert restores
contradictory prose rather than a working older state. The KB revisions are
proposals: declining them in the dashboard is the rollback. A harvest in-place
bank edit is reverted from its own before/after report; `delete(entity='mechanism')`
is soft, so a wrongly minted draft is recoverable too.

## Open Questions

None blocking. Two items are deliberately parked:

- **Persisted provenance (`briefs.mechanism_slug`).** Would make "which bank entry
  did this angle draw from" durable and turn harvest's semantic diff into an exact
  join. It is a cross-repo contract change and is out of scope here (D10); the run
  report carries provenance until someone proposes it.
- **Approval of the two KB revisions** rests with chị Kiều My. The plugin commit
  does not wait on it (D12), and neither the bundle build nor the real-path run
  depends on it.
