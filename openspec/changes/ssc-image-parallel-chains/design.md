## Context

### The bug

`ssc-image` (rewritten hours ago by `ssc-image-brief-copy-rewrite`) steps a creative chain per approved angle brief: `background → model → product → composite`. Its Step 6 state machine reads `list_creatives(brief_id)` and, **for the whole brief**, computes

- `approved(L)` — ≥1 creative with `layer=L` and `status='approved'`;
- `has_drafts(L)` — ≥1 creative with `layer=L` and `status='draft'`;

then takes the first layer without an approved creative. Rule 11 declares "visual production **complete** for this angle brief" once all four layers hold an approved creative.

That model is a **linear, single-chain** model. It is wrong.

### What a brief actually holds

A brief carries **N parallel visual chains**. This is stated by the BrandOS server's own tool docs — a creative belongs to "one of a brief's N parallel visual chains"; approving a creative CURATES it and a layer "may legitimately carry SEVERAL approved creatives at once (one per chain)"; `set_cover` separately chooses which approved composite is the hero image — and it was confirmed by the owner on 2026-07-14.

Under the current (brief-scoped) state machine, a brief with **two approved backgrounds** breaks as follows:

1. `approved(background)` is true (it is true for *either* root), so the skill advances to `model` — with **no notion of which chain it is building**. It conditions `generate_model` on "the approved background", of which there are now two; whichever it picks is a silent choice the operator never made.
2. At `composite` it names `scene_creative_id` = "the approved model" and `product_creative_id` = "the approved product" — again picking from sets that may span chains. It can compose **one chain's scene with another chain's model**.
3. Once any composite is approved anywhere, rule 11 fires and the skill reports the **brief** complete — while the second chain has not been built at all.

This is precisely the silent wrong-target class of bug that the copy-gate work has been chasing all session, at fal-credit cost, with nothing downstream able to detect it.

### The lineage is already there

No server change is needed. Verified live via `list_creatives`, **every creative row already carries its lineage**:

| Layer | Lineage fields present | Meaning |
|---|---|---|
| `background` | *(none)* | No parent — an **approved background is the ROOT of a chain** |
| `model` | `background_creative_id` | Belongs to that background's chain |
| `composite` | `scene_creative_id`, `product_creative_id` | Belongs to the chain of its `scene_creative_id` (an approved `model`-layer creative = the scene); its product is brief-level |
| `product` | *(none)* | Uploaded per BRIEF (`upload_product_creative(brief_id, …)`) — **brief-level, shared across chains** |

So chain membership is **derivable** from data the skill already reads. The fix is entirely inside the plugin's reasoning.

### Constraints

- **Propose-only** is untouchable: the skill saves DRAFT creatives and STOPs. Approving (curating) a creative into a chain, discarding one, uploading the real product, and `set_cover` (choosing the hero composite) are all operator dashboard actions.
- **Every generate call spends fal credits.** A wrong or speculative call is not free; a STOP-and-ask is always cheaper than a wrong image.
- The skill's `tools:` list is fixed and MUST NOT grow (`set_cover` in particular stays out).
- Prompt rows are **brief-level per layer**: `list_creative_prompts(brief_id)` returns at most one active row per layer for the whole brief, so with N chains the "active" background prompt row is simply whichever chain generated last. Prompt rows are therefore **not** a reliable chain-scoped record.

## Goals / Non-Goals

**Goals:**

- Make every gate in the state machine **chain-scoped**: the active layer, `approved(L)`, `has_drafts(L)`, and completion are all computed inside ONE chain.
- Resolve chains from creative lineage alone, with no server change and no new tool.
- Make chain selection **explicit and safe**: unambiguous when there is one chain, an operator-facing STOP-and-ask when there is more than one, a STOP on an invalid chain id. Never a silent pick.
- Let the operator deliberately start an **additional** chain, without every re-invocation burning credits minting new roots.
- Keep the product brief-level, and make a multi-product brief STOP-and-ask rather than guess.
- Tell the operator, in every summary, **which chain advanced** and how many chains the brief now has.

**Non-Goals:**

- Choosing the hero image. `set_cover` stays the operator's dashboard action and stays out of the skill's `tools:` list.
- Advancing more than one chain (or more than one layer) per invocation.
- Any change to the copy gate, the five prompt rules, the grounding sources, the propose-only governance, the model-selection rule, or the error surface.
- Any server-side change (a `chain_id` column, chain-coherence enforcement, chain-scoped products).
- Post / YouTube visual chains (still phase 2).

## Decisions

### D1 — Chain identity is the ROOT BACKGROUND creative's id

A chain is identified by the id of the **approved `background`** creative that roots it. `model` rows name it directly (`background_creative_id`); `composite` rows reach it through their `scene_creative_id` (the approved model whose `background_creative_id` is the root). Drafts sit inside the chain their lineage names; a `background` draft is a **candidate root**, not yet a chain (only an *approved* background roots a chain — approval is what curates it).

*Alternative considered — a server-side `chain_id` column.* Rejected: it requires a server change and a migration, and it is redundant — the lineage on every row **already determines** the partition. Deriving is free, ships today, and stays correct even if the server later adds an explicit id.

*Alternative considered — treat every background (draft or approved) as a root.* Rejected: three background drafts would present as three chains before the operator has curated anything. Approval is exactly the act that promotes a candidate to a chain root, which matches the server's "approving CURATES it" semantics.

### D2 — Explicit `chain: <background_creative_id>` input, with a STOP-and-ask on ambiguity

- 0 approved backgrounds → the active layer is `background` (chain CREATION): 3 candidates, then STOP for approval.
- Exactly 1 approved background, no `chain` argument → that chain is the target (unambiguous — resolve it, do not ask).
- ≥2 approved backgrounds, no `chain` argument → **STOP and ask.** List each chain: its root background creative id, a one-line gist of that background's `generation_prompt`, and how far it has got (has a model? a composite?). The operator answers with `chain: <id>`.
- An explicit `chain` that is not an approved `background` of *this* brief → **STOP** (`invalid_input`-style), naming the valid chain roots.

*Alternative considered — silently pick the newest approved background.* Rejected outright: that is exactly the class of silent wrong-target bug this change exists to kill. The operator approved *both* backgrounds on purpose; the skill has no basis to prefer one, and the cost of guessing is a fully-billed image telling the wrong track's story.

*Alternative considered — advance every chain in one invocation.* Rejected: it multiplies credit spend per run and breaks the one-artifact-per-gate rhythm the operator already knows from `ssc-ads-writer`.

### D3 — `new-chain` is an explicit opt-in for minting an additional root

Once a brief has an approved background, the `background` layer is **not** re-entered by default — otherwise every re-invocation of a completed-or-in-flight chain would generate 3 more backgrounds and bill for them. Starting another chain is a deliberate operator act: `new-chain` (equivalently an explicit `layer: background` selector) generates 3 fresh background candidates for the brief even though an approved background exists. The candidates enter the normal background flow (STOP for approval); approving one mints a new root.

*Alternative considered — always offer more backgrounds when a chain is complete.* Rejected: it burns credits on every re-invocation and makes "I just wanted to check state" an expensive command.

### D4 — Product stays BRIEF-level; ambiguity STOPs

`upload_product_creative(brief_id, …)` is brief-scoped and product rows carry no lineage parent, so the real packaging photo is **shared by every chain of the brief**. The skill keeps its hands off it entirely (never generates it, never uploads it — `upload_product_creative` is not in its `tools:`). Two failure modes:

- **No approved product** → STOP and ask the operator to upload + approve the real photo.
- **SEVERAL approved products** → the skill MUST NOT guess which packaging shot the composite should use. New optional input `product: <creative_id>`; absent it, **STOP and ask which**.

*Alternative considered — make the product chain-scoped.* Rejected: the server's upload tool takes `brief_id`, not a chain, and the row has no parent field. Inventing a chain binding the server does not model would be a fiction the dashboard cannot show.

*Alternative considered — pick the most recently uploaded product.* Rejected for the same reason as D2: recency is not intent.

### D5 — The revise base is the selected chain's own pending draft, not the brief-level prompt row

`revise: <note>` stays, and still lands on the **active layer** — but of the **selected chain**. It rewrites that layer's prompt and issues exactly ONE fresh generate call for it (never a fresh batch, never a blind re-roll).

The wrinkle: `list_creative_prompts(brief_id)` returns at most one active prompt row **per layer for the whole brief** — it is brief-level, so with N chains the row for `background` is whichever chain generated last. It is therefore **not** a chain-scoped record. The authoritative base for a rewrite is the **selected chain's pending draft `generation_prompt`** (from `list_creatives`, which is per-row and carries lineage); the brief-level prompt row is a supporting read only, and MUST NOT be used as the base when it belongs to a different chain.

*Alternative considered — keep reading the prompt row as the base.* Rejected: on a multi-chain brief it silently re-bases the revision on another chain's prompt — the same bug in a new place.

### D6 — Completion is a property of a CHAIN, never of a brief

A chain is COMPLETE when it holds an approved `composite`. There is no "brief complete" state: more chains can always be started (D3). The old rule-11 terminal ("all four layers approved → visual production complete for this angle brief") is replaced by: *this chain is complete; the brief has N chains; start another with `new-chain`, or choose the hero composite with `set_cover` in the dashboard.*

### D7 — The output names the chain

Every summary states the chain worked (its root background creative id, plus its one-line gist) and how many chains the brief now has. The operator must never have to infer which track advanced.

## Risks / Trade-offs

- **[A brief with many chains multiplies credit spend]** → Mitigation: **one layer of one chain per invocation**, and the chain is operator-selected (D2) — never fanned out. Additional roots are minted only under the explicit `new-chain` opt-in (D3), so the default cost of a re-invocation stays at most one layer.
- **[The server may enforce constraints the plugin cannot see]** — e.g. whether `compose_ad_visual` accepts a `scene_creative_id` and a `product_creative_id` that the server considers to belong to different chains, or whether it silently re-resolves them. → Mitigation: the skill **names both ids explicitly** on every call (it already does) and **surfaces any server refusal verbatim** (`scene_not_approved`, `product_not_approved`, `invalid_input`, …) rather than retrying around it or working out a substitute. A server that is stricter than the plugin is safe; a server that is looser is exactly what the chain-scoped selection protects against.
- **[Chain resolution is inference, not a declared column]** — if the server ever stops populating `background_creative_id` / `scene_creative_id`, chain resolution degrades. → Mitigation: a creative whose lineage parent is missing or does not resolve to a chain root is **unassignable**; the skill reports it and STOPs rather than defaulting it into a chain.
- **[Prompt rows are brief-level while chains are not]** (D5) → Mitigation: the pending draft's `generation_prompt` is the revise base; the prompt row is supporting context only.
- **[More operator prompts]** — the ambiguity STOPs (multi-chain, multi-product) add turns the old skill did not have. Accepted trade-off: an extra question costs one message, a wrong-chain image costs credits and trust.
- **[Existing briefs built under the old, brief-scoped machine]** may contain a composite whose scene and product came from different chains. → Mitigation: nothing is rewritten or deleted; the operator discards what they do not want in the dashboard. The new state machine simply stops producing such rows.

## Migration Plan

1. Rewrite `plugins/ssc-content/skills/ssc-image/SKILL.md`: Inputs (`chain`, `product`, `new-chain`), a new chain-resolution step before the state machine, a chain-scoped state machine, chain-scoped layer procedures, a chain-scoped revise path, and a chain-naming output block.
2. Rewrite `plugins/ssc-content/commands/ssc.image.md` to accept and pass through the three new optional inputs.
3. No server deploy, no data migration, no tool-surface change. The change is prose-only and takes effect on the next plugin reinstall (`claude plugin uninstall` + `install`, per the repo's local-dev loop).
4. Rollback = revert the two markdown files; no state is written by this change.

## Open Questions

- **May a product ever be chain-specific?** Today it is brief-level and unlinked (no lineage parent, uploaded with `brief_id`). If a chain ever needs its own packaging shot (different pack, different angle), the server would need a chain-scoped product; until then the `product: <creative_id>` selector is the whole answer.
- **Does the server enforce chain coherence on `compose_ad_visual`?** I.e. does it reject a `scene_creative_id` and `product_creative_id` combination it considers cross-chain, or does it accept anything approved? The plugin behaves correctly either way (it names both ids and surfaces refusals), but the answer determines whether the plugin is the *only* guard or a second one.
- **Should `set_cover` ambiguity be surfaced?** When a brief ends with several approved composites (one per chain), the operator must pick the hero in the dashboard. The skill could *remind* them; it must never do it.
