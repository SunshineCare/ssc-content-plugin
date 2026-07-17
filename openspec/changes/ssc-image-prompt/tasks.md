# Tasks — ssc-image-prompt

All tasks are **prose** (markdown skills / agent / command) — non-code, no TDD gate.
Each new skill's directory name MUST equal its frontmatter `name`. Every `tools:`
list carries reads + `save_creative_prompt` ONLY. Load-bearing rule: the `-scene`
skill persists `save_creative_prompt(layer:'model')`; no skill saves `layer:'product'`.

## 1. Stage skills (the five work units)

- [x] 1.1 Create `plugins/ssc-content/skills/ssc-image-prompt-background/SKILL.md` — stage 1, persists `layer:'background'`. Fresh scene; reserves the subject zone + text zone in the positive; default model `fal-ai/flux/schnell`. Grounds in brief angle + persona doc + approved copy (meaning only) + brand/visual KB + concept. Propose-only (reads + `save_creative_prompt`).
- [x] 1.2 Create `plugins/ssc-content/skills/ssc-image-prompt-subject/SKILL.md` — stage 2, persists `layer:'subject'`. Person generated ALONE on a simple ground; **face + pose locked here** (identity model + `identityRef` + `idWeight` when a real-model photo is in the pool, else text-to-image + persona-described person); outfit/wardrobe/palette/light made coherent with the SELECTED background. Propose-only.
- [x] 1.3 Create `plugins/ssc-content/skills/ssc-image-prompt-scene/SKILL.md` — stage 3, **persists `layer:'model'`** (studio label "Scene"). Requires a selected background AND a selected subject; reference-edit (`fal-ai/flux-pro/kontext`) composing the subject into the background, naming both references. Document the `-scene → layer:'model'` mapping prominently. Propose-only.
- [x] 1.4 Create `plugins/ssc-content/skills/ssc-image-prompt-composite/SKILL.md` — stage 4, persists `layer:'composite'`. Requires a selected scene (`model`) + a product packshot in the pool (else STOP, ask upload — never save `layer:'product'`); places the product with correct perspective, names the packshot as control/reference, picks `controlType` + `conditioningScales`. Propose-only.
- [x] 1.5 Create `plugins/ssc-content/skills/ssc-image-prompt-text/SKILL.md` — stage 5, persists `layer:'text'`. Requires a selected composite + approved `image_content`/headline (else STOP → `/ssc.ads-produce <brief_id> image_content`); carries the EXACT approved Vietnamese headline (the one place copy is named); model `fal-ai/ideogram/v3` or `overlay`. Propose-only.

## 2. Agent

- [x] 2.1 Create `plugins/ssc-content/agents/ssc-image-prompt-agent.md` — state-driven next-open-stage stepper over `[background, subject, model, composite, text]`. Frontmatter: `capability: edit`, `approval-gates: human`, `orchestrates:` the five skills (1.1–1.5), read-only `tools:` to resolve state + `save_creative_prompt`. Resolves `get_brief(brief_id) → {brief, idea}`, gates (idea channel=ad + approved; brief approved), reads `list_creatives` / `list_creative_prompts` / `list_content`, works the single next-open stage, STOPs at each human gate. Handles `stage` + `revise:`. Deployment-dependency safe STOP if a layer is rejected.

## 3. Command

- [x] 3.1 Create `plugins/ssc-content/commands/ssc.image-prompt.md` — thin entry point (no orchestration) dispatching `ssc-image-prompt-agent`. `brief_id` sole required input (idea resolved from brief); optional `stage`, `revise:`. Frontmatter description states plainly it is the propose-only, zero-credit sibling of `/ssc.image`.

## 4. Validation

- [x] 4.1 Validate governance + wiring (no code): exercise `hooks/approval-gate.mjs` with `{"tool_name":"mcp__ssc__approve_creative","agent_id":"ssc-image-prompt-agent"}` → deny (subagent); confirm every MCP tool referenced in the new files exists on the BrandOS surface; confirm every `/ssc.*` cross-reference resolves to a real command (no `ssc.plan` / `ssc.ads`); confirm each skill's `layer` mapping (`-scene → 'model'`, no `'product'` save); confirm NO generate/approve/unapprove/upload/confirm_creative_upload/select_gallery_creative/set_cover/reorder_gallery/publish/update_budget tool appears in any new `tools:` list.
