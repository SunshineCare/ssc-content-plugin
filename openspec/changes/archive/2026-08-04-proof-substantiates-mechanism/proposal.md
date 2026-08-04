## Why

Proof and mechanism are two independent rails in every writing skill. The mechanism
rail is read-only and judged alone — `brief.mechanism` is read once, a mechanism beat is
written from it, and `craft/copy-floor` mục 1 is satisfied by the beat's presence and
its fidelity to that field. The proof rail is tied to the **hook** — each proof point
must answer the pain the hook opened, survive the competitor-swap test, and the set must
surface ≥3 distinct points (`craft/coverage` §4.2) spread across `proof_device` families.

The two never meet. A variation can clear every gate while its proof stack answers the
hook and leaves the mechanism claim unbacked. At the market-saturation position
`craft/awareness-framework` §2 states for this category, mechanism is what persuades — so
an unbacked mechanism is the load-bearing sentence of the ad resting on nothing.

## What Changes

- **The mechanism must be proof-backed.** Every `copy` variation's mechanism beat leans
  on at least one row of the live `brand/proof-points` table, and the variation's
  `comment` names which row. Where `brief.mechanism` is blank the rule is **inert** —
  production proceeds and the absence is reported exactly as today; nothing is invented
  to give the rule something to bind to.
- **Proof enhances the hook.** The existing "every proof must answer the pain the hook
  opened" rule is kept and sharpened: a proof earns its place by making the opening
  tension land *harder*, not by being topically adjacent to it.
- **Concreteness becomes a cut, not a score cap.** A proof line that survives the
  competitor-swap test — paraphrases into a generic wellness claim — is removed at
  composition rather than scored down after the fact. This cuts the *line*, never the
  *variation*.
- **Binding level: composition rule + scored gate.** An unbacked mechanism caps a
  variation's brand-fit score at ≤3. It is **not** a floor item, so it triggers no
  REJECT and no regenerate-on-its-own-axis pass.
- **Three skills move together:** `ssc-ads-writer`, `ssc-post-produce` (both compose and
  score) and `ssc-post-authority` (judges the post set). Authority grades what produce
  writes; shipping one without the other makes authority judge posts against a bar the
  writer was never given.
- No **BREAKING** changes: no tool, field, or server contract moves.

## Capabilities

### New Capabilities

- `mechanism-proof-substantiation`: the hook → mechanism → proof chain in the writing
  skills — what backs a mechanism beat, how proof relates to the hook, where the rule
  binds and at what force, and how a blank mechanism is handled.

### Modified Capabilities

*(none — `angle-mechanism-authoring` governs where a mechanism is settled and is
untouched; this change governs only what the writing skills must do with the one they
are handed.)*

## Impact

**Files (prose only — no code):**

- `plugins/ssc/skills/ssc-ads-writer/SKILL.md` — Step 6 composition rules, Step 7(b)
  scored checklist, Step 9 summary line.
- `plugins/ssc/skills/ssc-post-produce/SKILL.md` — the proof block, Step 7 checklist,
  presentation summary line.
- `plugins/ssc/skills/ssc-post-authority/SKILL.md` — `copy` and `image_content`
  judgement criteria, report line.
- `plugins/ssc/.claude-plugin/plugin.json` — version bump, same commit.
- `chatgpt/workflows.json` + the `content/` mirror — regenerated via
  `scripts/publish-chatgpt-bundle.sh`.

**Explicitly untouched:**

- `craft/copy-floor` — no new floor item, so **no KB revision and no `/ssc-kb` run**.
- `craft/coverage` §4.2 set-level ≥3-distinct bar; the `proof_device` family axis; the
  early-stage proof-free educational `description` variant.
- No new MCP tool, no new field on `briefs` or `contents`, no server change.
- The mechanism stays read-only from `brief.mechanism` — no skill authors, back-fills,
  or re-opens a brief to add one.
- The propose-only invariant — no skill gains `approve_*`, `unapprove_*`, or any
  publish/schedule tool.

**Known tension, accepted.** `craft/doctrine` §2 owns the mandatory-mechanism rule and
`craft/copy-floor` mục 1 enforces it. Stating "mechanism must be proof-backed" in skill
prose alone means three skills carry a doctrine rule the doctrine doc does not state.
Accepted here because the chosen binding level keeps the rule out of the floor, so no KB
doc is contradicted — only under-specified. A follow-up `/ssc-kb` revision folding it
into `craft/doctrine` §2 would let the skills reference it instead; not part of this
change.
