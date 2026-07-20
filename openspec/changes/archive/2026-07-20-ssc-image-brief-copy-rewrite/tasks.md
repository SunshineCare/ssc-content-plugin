## 1. Skill rewrite

- [x] 1.1 Rewrite `plugins/ssc-content/skills/ssc-image/SKILL.md` end to end: frontmatter (name, rewritten `description`, `metadata.tools: [get_idea, list_briefs, list_post_content, get_knowledge, list_creatives, list_creative_prompts, generate_background, generate_model, compose_ad_visual]`), inputs (`idea_id`, `brief_id`, optional `revise` / `model` / `layout_hint` / `hard_paste` / `period`; no `uploaded_media_*`), the three preconditions (approved ad idea → approved brief → ≥1 approved `copy`), the five grounding sources, the five hard prompt rules with positive-phrasing examples, the state machine (8 rules), the four layer procedures (3 × `generate_background`; 1 × `generate_model` with the currently-approved `background_creative_id`; `product` upload-only STOP-and-ask; 1 × `compose_ad_visual` naming both `scene_creative_id` and `product_creative_id`), the `revise` path, model selection, the error table, the output block, and the governance section.
- [x] 1.2 Audit every prompt example written into the skill against the prompt rules: no ad-copy strings (quoted, paraphrased, or negated), no negation of any kind, reserved space phrased positively and geometrically. Fix any example that trips its own rule.

## 2. Command rewrite

- [x] 2.1 Rewrite `plugins/ssc-content/commands/ssc.image.md`: the frontmatter `description`, the expected inputs (both ids required; the optional passthroughs; explicitly no `date` selector and no `uploaded_media_*`), the preconditions prose (approved concept + approved angle brief + approved `copy` — `image_content` is not a precondition and is never read), the "What to do" dispatch table, the `revise` re-invocation, governance, and "After it runs". Keep it a thin entry point that dispatches `ssc-image` and holds no orchestration logic.

## 3. Consistency and registration

- [x] 3.1 Grep the rewritten skill + command for residue of the old contract — `image_content`, `image_content_id`, `prompt_hints`, an `n:` parameter, `uploaded_media_id`, `uploaded_media_ref` — and confirm each remaining hit is either absent or a deliberate, correct mention (e.g. explaining that the overlay text is a later dashboard stage).
- [x] 3.2 Verify every MCP tool named in the skill exists on the live BrandOS surface with the exact argument names used, and that no forbidden tool (`approve`, `edit`, `set_cover`, `reorder_gallery`, publish, `update_budget`, `save_creative_prompt`, `upload_product_creative`) appears in the `tools:` list or anywhere in the procedure.
- [x] 3.3 Verify every `/ssc.*` cross-reference in both files resolves to a live command (`/ssc.ads-brief`, `/ssc.ads-produce`) — no refs to the retired `/ssc.plan` or `/ssc.ads`.
- [x] 3.4 Update the `/ssc.image` row of the pipeline table in `plugins/../CLAUDE.md` (repo root `CLAUDE.md`, "Pipelines" section) — it still describes the `image_content`-anchored flow; it must describe the brief + copy anchored chain.

## 4. Verification

- [x] 4.1 Check the rewritten skill and command against the delta spec's requirements one by one: every scenario in `openspec/changes/ssc-image-brief-copy-rewrite/specs/ads-image-visual/spec.md` has corresponding prose in the skill (or command) that would produce that behaviour. Report any requirement with no implementation evidence.
- [x] 4.2 Confirm the governance invariants survive the rewrite: propose-only (saves DRAFT creatives, never approves/discards/publishes/sets a cover), single MCP surface (no third-party image API), save-to-server (no in-chat candidate presentation or revise loop), no baked-in text, ad channel only, Vietnamese operator-facing prose.
