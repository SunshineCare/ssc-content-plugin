# Image content is authored at the Text step

## Why

On-image copy is written today by the two text producers — `ssc-ads-writer` on an `ad`
brief, `ssc-post-authority` on a `post` brief — and both write it **blind**. Neither can
see the visual the block will sit on, because the ImageStudio chain runs later. Both
compensate the same way: they emit a **density menu** (a Minimal version, a Standard one,
a Text-dominant one) so that `ssc-image-prompt-text` — the one step that *can* resolve the
finished image — has something to choose from. The choice is then made a second time,
downstream, by a step reading a prompt to guess what the picture looks like.

That is one decision split across two places, and the split exists only because the
authoring runs at the wrong moment. The Text step already resolves the chain tip before it
does anything else. Authoring the on-image copy **there**, after the tip is known, replaces
the menu-then-pick dance with a single fitted set: every candidate is sized to the image
that actually exists.

The blind menu also costs work the operator throws away. A five-version density menu is
five judged, saved, curated candidates of which the image stage keeps one shape — and if
the finished visual turns out busy, every Standard and Text-dominant version in it was
never a real option.

## What Changes

- **`ssc-image-prompt-text` gains a phase 1.** After the Step-1 channel/brief gates and the
  Step-2 chain-tip resolution, and **only when the brief has no approved `image_content`
  row**, the Text step authors the on-image copy itself: it drafts N Vietnamese candidates
  **fitted to the resolved chain tip**, judges them, saves the passing ones as **drafts**
  via `save_content(section='image_content')`, and **STOPS** for the operator to approve one
  in the workspace's Image Content stage. The next invocation finds an approved row and
  authors the text-placement prompt exactly as it does today.
- **The density menu is retired.** The tip is known at authoring time, so one density
  profile is chosen **from the tip** and the whole set is written to it; the candidates
  differ on hook, lead and register, not on density. Phase 2's "pick the approved row whose
  density fits the tip" judgement disappears with it — with the fit decided at authoring
  time, phase 2 renders the approved row it is given.
- **The judgement travels whole.** The six-item floor (`craft/copy-floor`), the set-level
  coverage verdict and the ≥3-distinct proof bar (`craft/coverage` §4.2), persona / route /
  awareness / mechanism grounding, the opening-frame check (`rules/person-rule`), the 1–5
  brand-fit score with its Vietnamese `comment`, and the bounded reject-and-regenerate loop
  (≤2 attempts per slot) all apply to the phase-1 set unchanged. Nothing about the quality
  bar changes — only where it runs.
- **The producers lose the section.** `ssc-ads-writer` produces `copy`, `headline` and
  `description`; `ssc-post-authority` produces `copy`. Both STOP with a routing message when
  an operator names `image_content` explicitly. `ssc-post-authority` loses its self-drafting
  branch (Step 1b) entirely and becomes a judge of the writer's copy alone.
- **Persist behaviour is the ads pattern on both channels.** Phase 1 saves the
  floor-passing candidates as drafts immediately and stops — it does not present a set in
  chat and wait for a go-ahead, as `ssc-post-authority` does for `copy` today.
- **Propose-only is untouched.** Phase 1's only mutation is `save_content`, which inserts
  drafts. Nothing approves, nothing generates, no credit is spent.

## Capabilities

### New Capabilities

- `on-image-copy-authoring`: where the on-image copy block is authored, what it is fitted
  to, what gates it, how it is judged, and how it is persisted.

### Modified Capabilities

- `ads-image-prompt-authoring`: the Text step's precondition — it no longer STOPs routing an
  operator to the channel's text command when `image_content` is missing; it authors the
  content itself and stops for approval.
- `ads-copy-brief-lineage`: `ssc-ads-writer` records `brief_id` on the three sections it
  still produces; the `image_content` row's brief lineage is now written by the Text step,
  under the same rule.
- `mechanism-proof-substantiation`: the `image_content` proof-backing criterion moves from
  `ssc-post-authority` to `ssc-image-prompt-text` and applies on both channels.

## Impact

**Files (prose only — no code):**

- `plugins/ssc/skills/ssc-image-prompt-text/SKILL.md` — the new phase 1 and its gates;
  phase 2's row-selection rule; `tools:` grows by `save_content`, `list_taxonomies`,
  `get_channel_plan`, `get_month_plan`.
- `plugins/ssc/skills/ssc-ads-writer/SKILL.md` — the `image_content` section removed from
  the section enum, the Step-2 state table, Step 4's grounding, Step 6's authoring block,
  Step 7's `image_content`-only checklist items, Step 8/9 and Governance.
- `plugins/ssc/skills/ssc-post-authority/SKILL.md` — Step 1b deleted; Step 0's section
  resolution, the judging criteria, presentation, save and Governance reduced to `copy`.
- `plugins/ssc/skills/ssc-post-produce/SKILL.md` — the two `image_content` cross-references.
- `plugins/ssc/agents/ssc-post-writer-agent.md` — the `section` input, the two-section
  routing and the hand-off become `copy`-only, with the on-image hand-off pointing at
  `/ssc-image-prompt <brief_id> text`.
- `plugins/ssc/agents/ssc-image-prompt-agent.md` — the Text precondition and its dispatch.
- `plugins/ssc/commands/ssc-ad.md`, `ssc-post.md`, `ssc-image-prompt.md` — argument hints
  and section lists.
- `plugins/ssc/skills/ssc-image-prompt-{scene,subject,composition,edit}/SKILL.md` — the D4
  grounding lists that name `image_content` as an approved section (wording only: on a fresh
  brief it is now absent until the Text step writes it).
- `plugins/ssc/skills/ssc-ads-publish/SKILL.md`, `ssc-ads-brief/SKILL.md`,
  `ssc-video-script/SKILL.md` — cross-references naming the producing command.
- `plugins/ssc/.claude-plugin/plugin.json` — version bump, same commit.
- `chatgpt/workflows.json` + the `content/` mirror — regenerated via
  `scripts/publish-chatgpt-bundle.sh`.

**Explicitly untouched:**

- The BrandOS server. `save_content(section='image_content')`, the `content` table, the
  workspace's Image Content stage and `list_content(brief=…)` are unchanged — the same row,
  written by a different skill.
- The on-image body contract: the `HEADLINE:` / `SUBHEADLINE:` / `BULLETS:` markers and the
  hard word/character caps travel verbatim.
- `craft/copy-floor`, `craft/coverage`, `brand/proof-points`, `rules/person-rule` — no KB
  revision, no `/ssc-kb` run. The rules are read live from their new caller.
- The propose-only invariant — no skill gains `approve_*`, `unapprove_*`, `edit`, `delete`
  or any publish/generate tool.
- The five-step chain, its layers, the anchor gate and the zero-credit rule.

**Accepted cost.** Producing the on-image copy now requires a selected image, so an operator
who wants the block written before any visual exists no longer has a path to it. That is the
point of the change — the blind path is what produced the menu — but it does reverse the
current order for anyone used to approving all four ad sections before opening the studio.
