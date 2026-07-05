## Why

The Cambridge Diet Vietnam ads pipeline is text-only today — `ssc-ads-writer`
ends at `image_content` (on-image copy as structured text) and nothing renders a
picture, so every ad visual is produced by hand outside the pipeline. This change
adds a propose-only ad-visual producer that generates the paired visual for an
approved concept, keeping the operator's dashboard-driven, human-gated workflow.

## What Changes

- Add a new **`/ssc.ads-image`** command — a thin entry point that resolves an
  approved ad concept (`idea_id`) and dispatches the visual producer. Runs after
  the concept's `image_content` text is approved.
- Add a new **`ssc-ads-image`** skill — a state-driven, per-layer stepper
  (`background → model → product → composite`) mirroring the `ssc-ads-writer`
  pattern:
  - **background** — Flux schnell text→image, 3 negative-space-aware versions.
  - **model** — Nano Banana image→image, generated **into** the approved
    background, **one candidate at a time** until approved (or an uploaded real
    model placed into the background).
  - **product** — upload-only; the skill never generates the product.
  - **composite** — Nano Banana image→image, 2–3 variants, with an **optional
    per-concept masked hard-paste** of the real product PNG for pixel-exact
    packaging.
- Preserve the **propose-only invariant**: the skill saves DRAFT creatives and
  STOPS; it never approves, sets a cover, reorders a gallery, publishes, or flips
  a gate. No text is baked in by any model.
- The skill references BrandOS MCP tools (`generate_background`,
  `generate_model`, `compose_ad_visual`, and a `layer`-aware creatives read) that
  are **server-side, separate-repo** work — the skill must not ship until they
  exist on the `ssc` surface.

Not in scope for this change (tracked as external blockers): the BrandOS server
tools themselves and the three Go `resource`-domain gaps (public serving,
presigned-GET download for the hard-paste, server/system identity).

## Capabilities

### New Capabilities
- `ads-image-visual`: propose-only, state-driven per-layer production of the ad
  visual (background → model-into-background → product upload → composite) for one
  approved ad concept, via the `/ssc.ads-image` command and `ssc-ads-image` skill,
  built on the BrandOS image tool contract. Covers the layer state machine, the
  model one-at-a-time loop, the optional product hard-paste, and the propose-only
  governance rules.

### Modified Capabilities
<!-- none — no existing openspec spec whose requirements change -->

## Impact

- **New files (this repo):** `plugins/ssc-content/commands/ssc.ads-image.md`,
  `plugins/ssc-content/skills/ssc-ads-image/SKILL.md`.
- **No MCP-config change:** the new BrandOS tools live on the same `ssc` surface,
  so `plugin.json` / `.mcp.json` are unchanged.
- **External dependencies (separate repos, must land before the skill is usable):**
  BrandOS tools `generate_background` / `generate_model` / `compose_ad_visual` /
  `layer`-aware creatives read; Go `feature/core/resource` gaps (public full-res
  serving, presigned-GET download, server identity).
- **Docs:** superseded whole-scene spec already banner-marked; the approved design
  lives at `docs/superpowers/specs/2026-07-05-ssc-ads-image-component-composition-design.md`.
