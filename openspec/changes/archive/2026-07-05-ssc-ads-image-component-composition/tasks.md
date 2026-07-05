# Tasks — ssc-ads-image-component-composition

> This is a markdown-prose plugin repo: skills/agents/commands are markdown, and
> the only executable artifact is the governance hook (untouched here). There is
> no build/compile/test step, so no TDD gate applies. Tasks are doc authoring +
> wiring/governance validation. Design + spec:
> `openspec/changes/ssc-ads-image-component-composition/{design.md,specs/ads-image-visual/spec.md}`.

## 1. Command entry point

- [x] 1.1 Create `plugins/ssc-content/commands/ssc.ads-image.md` — a thin entry
  point (no orchestration). Frontmatter: `description` (concise, matching the
  spec) + `metadata.brand: cambridge-diet-vn` + `metadata.section: ads`, matching
  the shape of `commands/ssc.ads-produce.md`. Body: a `## User Input` block that
  parses the required `idea_id` (ask for it if missing; never invent one),
  dispatches the `ssc-ads-image` skill for that concept, and states the
  precondition (runs after the concept's `image_content` text is approved). Add a
  `## Governance` note (propose-only; saves DRAFT creatives, never approves) and an
  `## After it runs` note pointing the operator to the dashboard to approve the
  active layer, then re-run for the next layer.

## 2. Skill work unit

- [x] 2.1 Create the directory `plugins/ssc-content/skills/ssc-ads-image/` and the
  file `SKILL.md` inside it, with frontmatter `name: ssc-ads-image` (MUST match the
  directory name), a `description` covering the per-layer stepper + one-at-a-time
  model + optional hard-paste + propose-only, and `metadata` with
  `type: skill`, `stage: produce`, `brand: cambridge-diet-vn`, `section: ads`,
  `capability: edit`, and `tools: [get_idea, list_post_content, generate_background,
  generate_model, compose_ad_visual, <layer-aware creatives read>]`.
- [x] 2.2 Write the skill body: (a) resolve the concept via `get_idea` and gate on
  `channel='ad'` + `status='approved'`; (b) confirm `image_content` is approved via
  `list_post_content`; (c) the layer state machine `background → model → product →
  composite` with the first-match stepper rules from the spec (including the
  pending-draft STOP guards and the "all approved → complete" terminal), reading the
  concept's creative assets by `layer` + `status`.
- [x] 2.3 Write the per-layer procedures: `background` = 3 negative-space-aware
  versions via `generate_background`; `model` = ONE background-conditioned candidate
  via `generate_model` (or place an uploaded real model), one-at-a-time with the
  approve-or-discard guard and optional operator steering hint; `product` =
  upload-only STOP-and-ask when absent; `composite` = 2–3 variants via
  `compose_ad_visual` with the optional per-concept masked hard-paste + optional
  `layout_hint`, leaving negative space for the overlaid text.
- [x] 2.4 Write the `## Governance` / hard-rules section: propose-only (no
  `approve_*` / `unapprove_*` / `update_status` / `set_cover` / `reorder_gallery` /
  publish / `update_budget`); never bake text into a visual; operator-facing prose
  Vietnamese (image-model prompts free-form); single MCP surface (only
  `mcp__ssc__…`, never a third-party provider API). Note that the referenced
  BrandOS tools are server-side/to-be-built so the skill is gated on that work
  (avoid the dangling-tool bug class).

## 3. Wiring & governance validation

- [x] 3.1 Verify structural wiring: the skill directory name equals the frontmatter
  `name` (`ssc-ads-image`); the command dispatches the `ssc-ads-image` skill; and
  no cross-reference to a retired command (`ssc.plan` / `ssc.ads`) is introduced.
- [x] 3.2 Verify the propose-only invariant by grepping the new command + skill:
  none of `approve_`, `unapprove_`, `update_status`, `set_cover`, `reorder_gallery`,
  `update_budget`, or a publish tool appears as a tool the skill calls.
- [x] 3.3 Confirm no MCP-config change is needed (new tools live on the same `ssc`
  surface) — `plugin.json` and `.mcp.json` remain untouched and in sync; run the
  governance hook smoke check from `CLAUDE.md` to confirm the hook still denies a
  subagent `approve_*` (unchanged behavior).
