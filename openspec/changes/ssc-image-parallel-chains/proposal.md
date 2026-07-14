## Why

`/ssc.image`'s state machine assumes **ONE linear creative chain per approved angle brief**: it computes `approved(layer)` across the whole brief and advances the moment a layer holds ANY approved creative. That is wrong. A brief carries **N PARALLEL visual chains** — confirmed by the owner (2026-07-14) and by the BrandOS server's own tool docs, which say a creative belongs to "one of a brief's N parallel visual chains", that approving a creative CURATES it so a layer "may legitimately carry SEVERAL approved creatives at once (one per chain)", and that `set_cover` separately picks which approved composite is the hero image.

The consequence is a silent wrong-target bug at fal-credit cost: with two approved backgrounds the skill sees "background approved ✓", generates a model with no notion of *which* chain it is building, can compose one chain's scene with another chain's model, and — on its "all four layers approved → complete" rule — declares the brief finished when only one chain is. The lineage needed to fix this is **already on every creative row** (`background_creative_id`, `scene_creative_id`, `product_creative_id` — verified live via `list_creatives`), so the fix is entirely inside the plugin: no server change is required.

## What Changes

- **BREAKING — the state machine becomes CHAIN-SCOPED, not brief-scoped.** Every gate (`approved(L)`, `has_drafts(L)`, the active-layer decision, chain completion) is evaluated INSIDE one selected chain, never across the brief.
- **Chains are resolved from lineage already present on each creative row.** Every **approved `background`** creative is a chain ROOT (chain id = that background creative's id); a `model` belongs to the chain of its `background_creative_id`; a `composite` belongs to the chain of its `scene_creative_id`'s chain; `product` creatives are **brief-level** (uploaded per brief, no lineage parent) and shared across chains.
- **New optional input `chain: <background_creative_id>`** — the approved background rooting the chain to advance. No approved background → the active layer is `background` (chain CREATION). Exactly ONE approved background and no `chain` → that chain is the unambiguous target. **MORE THAN ONE approved background and no `chain` → STOP and ASK**, listing each chain (root background creative id + a one-line gist of its `generation_prompt` + how far it has got). A `chain` that is not an approved background of the brief → STOP, naming the valid chain roots. **Never pick a chain silently.**
- **New optional input `new-chain`** (equivalently an explicit `layer: background` selector) — generate 3 fresh background candidates for the brief **even though an approved background already exists**, i.e. start an additional chain. Without it, a brief that already has an approved background does NOT re-enter the background layer (otherwise every re-invocation would burn credits minting new roots).
- **New optional input `product: <creative_id>`** — names which approved product to compose, for the case where the brief has several. If several are approved and `product` is absent, the skill **STOPS and asks**; it MUST NOT guess.
- **`discarded` is a third status.** A row that is neither `draft` nor `approved` (the server's `discarded` state) is **not** a pending draft and never makes `has_drafts(L)` true — now stated per chain.
- **A CHAIN is complete when it has an approved composite. The BRIEF is never "complete"** — more chains can always be started. The old "all four layers approved → visual production complete for this brief" terminal rule is replaced.
- **The `revise` path stays but is chain-scoped**: it rewrites the prompt of the active layer OF THE SELECTED CHAIN and issues ONE fresh generate call for it. Because `list_creative_prompts(brief_id)` returns at most one active prompt row **per layer per brief** (brief-level, shared across chains), the authoritative revise base is the selected chain's own pending draft `generation_prompt`.
- **Output names the chain.** The summary states which chain was worked (its root background creative id) and how many chains the brief now has, so the operator always knows which track advanced.
- **`set_cover` remains the operator's.** Which approved composite is the hero image is a dashboard choice; the skill never calls `set_cover` and it stays out of its `tools:` list.
- **Unchanged:** the three preconditions (approved ad idea → approved angle brief → ≥1 approved `copy` for that brief, with its brief-scope/idea-scope rule); the five verbatim positive-only prompt rules; the brief + copy + persona + brand-KB grounding; propose-only governance; single MCP surface; save-to-server; model selection; the error surface; ad channel only (phase 1); Vietnamese operator prose.

## Capabilities

### New Capabilities

None. This change corrects an existing capability rather than introducing one.

### Modified Capabilities

- `ads-image-visual`: the per-layer stepper, the background / model / product / composite layer requirements, the revise path, and the `/ssc.image` command entry point all become chain-aware. New requirements cover chain resolution from creative lineage, chain selection with a STOP-and-ask on ambiguity, per-chain draft/approved/discarded accounting, and chain (not brief) completion.

## Impact

- **Rewritten:** `plugins/ssc-content/skills/ssc-image/SKILL.md` (the Inputs, the Step 6 state machine, Steps 7a–7d, the Step 8 revise path, the Step 11 output block, and the Governance section), `plugins/ssc-content/commands/ssc.image.md` (the three new optional inputs).
- **No server change required.** The chain lineage (`background_creative_id`, `scene_creative_id`, `product_creative_id`) is already returned by `list_creatives`; the fix is plugin-side reasoning over data that already exists.
- **No new MCP tools.** The `tools:` list is unchanged — in particular `set_cover` is NOT added: choosing the hero composite stays an operator dashboard action.
- **Unaffected:** `/ssc.ads-brief`, `/ssc.ads-produce`, and the copy/prompt/grounding/governance requirements of `ads-image-visual`.
- **No automated tests** exist in this repo (markdown skills + one Node hook). Verification is by review against the design's invariants plus a live end-to-end run on a brief that has two approved backgrounds.
