## Why

`/ssc.image` anchors the whole creative chain on an approved `image_content` variant — but `image_content` is the **on-image overlay text**, applied by the dashboard over the *finished* visual at a later stage. It is not the source of the visual's meaning and must not gate or shape it. Meanwhile the BrandOS server has moved out from under the skill: the visual chain is now keyed on `brief_id` (no `image_content_id` anywhere on the surface), the three generation tools take a **full scene prompt sent to the engine verbatim**, and `prompt_hints` / server-side prompt assembly are gone.

## What Changes

- **BREAKING — the anchor moves from `image_content_id` to `brief_id`.** Every tool call (`generate_background`, `generate_model`, `compose_ad_visual`, `list_creatives`, `list_creative_prompts`) keys on the approved angle brief. `image_content` is removed from the command entirely — not an anchor, not a precondition, not a grounding source, never read.
- **BREAKING — approved `copy` becomes a hard precondition.** No approved copy for the brief → STOP and route the operator to `/ssc.ads-produce <idea_id> <brief_id> copy`. (Previously an approved `image_content` variant was the gate; copy was best-effort.)
- **The skill authors the full scene prompt, verbatim.** `prompt_hints` and the server's prompt assembly are replaced by a complete prompt the skill writes and the engine receives unmodified. Two hard rules follow from that: never name the ad copy (naming a string makes the model render it) and never negate (everything named gets drawn) — space is reserved geometrically, in the positive.
- **Grounding becomes brief + copy + persona + brand KB**: the brief's `angle_label` + five narrative fields, the persona detail doc (`brand/persona-<slug>`), the approved copy (meaning only), and the visual KB (`brand/visual-identity`, `ad/visual-direction-ref`, `ad/creative-guidelines`, `rules/compliance`, `rules/food-placeholder`).
- **New `revise: <note>` path.** Re-invoking a layer that has pending drafts normally STOPs; with a revision note the skill reads the layer's active prompt (`list_creative_prompts`) plus the drafts' `generation_prompt`, **rewrites** the prompt applying the note, and generates one fresh candidate. Iteration is prompt-level, not a blind re-roll.
- **Tool-signature realignment.** `compose_ad_visual` now requires `scene_creative_id` **and** `product_creative_id` (the skill resolves both from `list_creatives`); `generate_model` is generated-only with a required `prompt`, so `uploaded_media_id` / `uploaded_media_ref` are **removed** from the skill's inputs (placing a real model photo is a dashboard action). There is no `n` parameter: three backgrounds means three calls; model and composite are exactly one each. Optional `model` (fal model id) is passed through; an unknown model is refused as `invalid_input` before any provider call.
- **Error surface updated** to the brief-keyed codes: `brief_not_found`, `brief_not_approved`, `idea_not_approved`, `background_not_approved`, `stale_background_ref` (re-list once and retry), `scene_not_approved`, `product_not_approved`, `prompt_not_found`, `stale_version`, `invalid_input`, `forbidden`.
- **Unchanged:** the four-layer chain `background → model → product → composite` with per-layer human approval; product is upload-only; propose-only governance; single MCP surface; save-to-server (never present-in-chat); no baked-in text; ad channel only (phase 1); Vietnamese operator prose.

## Capabilities

### New Capabilities

None. This change rewrites an existing capability rather than introducing one.

### Modified Capabilities

- `ads-image-visual`: the anchor, preconditions, grounding, prompt contract, tool signatures, and per-layer loop all change. Specifically — the "Concept, angle brief, and variant gate" requirement loses its `image_content` variant scenario and gains an approved-copy gate; "Background layer generation" and "Composite layer" drop `n`/`prompt_hints` and adopt verbatim prompts (composite: exactly one variant, naming both approved input creatives); "Model layer" drops the uploaded-real-model path; new requirements cover verbatim positive-only prompt authorship, brief+copy+persona+KB grounding, and the operator revise path.

## Impact

- **Rewritten:** `plugins/ssc-content/skills/ssc-image/SKILL.md`, `plugins/ssc-content/commands/ssc.image.md`.
- **Unaffected:** `/ssc.ads-brief` and `/ssc.ads-produce` (the `image_content` text section keeps being produced and overlaid by the dashboard — it simply no longer touches `/ssc.image`). No agent is involved; the command dispatches the skill directly.
- **Depends on the BrandOS server**, which has already shipped the brief-keyed chain, the three generate tools, verbatim prompts, and service-side prompt persistence. Two server requirements remain open: (1) *Change 2* — N briefs per idea with `angle_label` persisted (today one brief per idea, so the multi-angle payoff is inert though the skill is forward-compatible); (2) an `edit`-holding operator must actually be able to generate — the `insufficient role` refusal observed live 2026-07-13 must be removed or made grantable, and surfaced as a typed `forbidden`.
- **Prerequisite for *Change 2* (separate plugin change, not this one):** `ssc-ads-writer` must pass `brief_id` to `save_post_content` — today it never does and the server binds `brief_id` only for `post` content, so every ad `copy` row's `brief_id` is null and `/ssc.image`'s approved-copy gate degrades to idea scope (loudly announced by the skill; see design.md's Drift Log). That lineage fix MUST land before or with Change 2, or copy approved for one angle will silently satisfy the gate for another.
- **No automated tests** exist in this repo (markdown skills + one Node hook). Verification is by review against the design's invariants plus a live end-to-end run.
