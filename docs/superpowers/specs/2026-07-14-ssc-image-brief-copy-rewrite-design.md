# `/ssc.image` — brief + copy anchored visual production (complete rewrite)

**Date:** 2026-07-14
**Status:** design approved, ready to implement
**Files rewritten:** `plugins/ssc-content/skills/ssc-image/SKILL.md`, `plugins/ssc-content/commands/ssc.image.md`
**Supersedes:** `2026-07-13-ssc-image-brief-anchored-visual-design.md`, `2026-07-05-ssc-ads-image-component-composition-design.md`, `2026-07-03-ssc-ads-image-skill-design.md`

---

## 1. Why

The shipped `ssc-image` skill anchors the whole creative chain on an approved **`image_content` variant** (`image_content_id`): it resolves that row from the brief, keys every generate/compose/read call on it, reads its body as a layout constraint, and folds it into the visual's grounding. It also passes `prompt_hints` — fragments the *server* merges into a prompt it assembles itself.

Both premises are now wrong.

- **`image_content` is the on-image overlay text.** It is applied at a *later* stage, by the dashboard, over the finished visual. It is not the source of the visual's meaning and must not gate or shape it. The visual's meaning comes from the **angle brief** (the chosen angle) and the **approved copy** (the story the ad actually tells).
- **The server no longer assembles prompts.** The BrandOS surface now takes a **full scene prompt, verbatim**, persists it as the layer's prompt row, and generates from that saved body. `prompt_hints` and server-side folding are gone. The prompt is the skill's work product, and it is authored in full.
- **The server has re-keyed the whole visual chain on `brief_id`.** `image_content_id` no longer exists anywhere on the creative surface.

This is a rewrite, not an edit: the anchor, the grounding, the prompt contract, the tool signatures, and the per-layer loop all change.

## 2. Scope

**In scope:** a complete rewrite of the `ssc-image` skill and the `/ssc.image` command.

**Out of scope:** `/ssc.ads-brief` and `/ssc.ads-produce` are unchanged. The `image_content` text section keeps being produced by `/ssc.ads-produce <idea_id> <brief_id> image_content` and overlaid by the dashboard — it simply has nothing to do with `/ssc.image` any more. No agent is involved (the command dispatches the skill directly, as today). Phase 1 stays **ad channel only**.

## 3. Anchor and preconditions

The creative chain hangs off the **approved angle brief**. `brief_id` is the key for every tool call.

**Inputs**

| Input | Required | Meaning |
|---|---|---|
| `idea_id` | yes | The approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`) |
| `brief_id` | yes | The operator's chosen **approved** angle brief for that concept |
| `revise` | no | A free-text revision note. Rewrites the active layer's prompt and generates one fresh candidate (§6) |
| `model` | no | A fal model id, passed through to the generate tools |
| `layout_hint` | no | Product-placement direction — **composite layer only** |
| `hard_paste` | no | Paste the product pixels unaltered instead of redrawing them — **composite layer only** |
| `period` | no | `YYYY-MM`, informational — used only when pointing the operator at `/ad/[month]/[id]` |

`uploaded_media_id` / `uploaded_media_ref` are **removed**. `generate_model` is generated-only; placing an operator-uploaded real model photo is a dashboard action.

**Preconditions** — checked in order, each stopping with the exact next action in Vietnamese:

1. The idea resolves, `channel='ad'`, `status='approved'`. A non-ad idea stops cleanly (post/youtube visual flows are a later phase).
2. `brief_id` is a brief of that idea and `status='approved'`.
3. **At least one approved `copy` row exists for that brief.** No approved copy → STOP and route the operator to `/ssc.ads-produce <idea_id> <brief_id> copy`, approve one, then re-run.

**`image_content` is not a precondition and is never read.** The skill does not call `list_post_content` looking for it, does not gate on it, and does not size anything from it.

## 4. Grounding — what the prompt is made of

The skill authors the scene from five sources, in this order of authority:

1. **The chosen angle brief** — `angle_label` + the five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`). This is *the* angle; the visual expresses this and nothing else. Read via `list_briefs(idea)`, filtered to the one `brief_id` (there is no `get_brief` tool).
2. **The persona detail doc** — `brand/persona-<slug>`, where `<slug>` is the idea's persona tag `code` with the leading `chi-` prefix removed (`chi-huong` → `brand/persona-huong`). Mechanical derivation, identical to the rule `ssc-ads-brief` uses. Gives the woman in the frame her age, life stage, home, and emotional register. No persona tag → structural tags only.
3. **The approved copy** for this brief — read via `list_post_content(idea_id)`, filtered to `section='copy'`, `status='approved'`, and (when the row carries one) `brief_id`. This is a **meaning** source: it tells you what moment the ad is about. Its words are never named in the prompt (§5).
4. **Brand KB** — `brand/visual-identity` (the visual identity guide), `ad/visual-direction-ref` (visual direction reference), `ad/creative-guidelines` (ad creative guidelines), plus `rules/compliance` and `rules/food-placeholder` as visual **constraints** (what imagery is not permitted). Read via `get_knowledge`.
5. **The concept** — `idea.title`, `idea.ad_notes`, and the structural tags (layer / value / frame / persona / against) from `get_idea`.

Approved `headline` / `description` rows, when they exist, may be read as extra tone/register signal. They never gate, and — like copy — their words are never named.

## 5. Prompt rules (hard — the prompt reaches the engine verbatim)

The `prompt` parameter is sent to the image engine **unmodified**. There is no server-side assembly to correct a sloppy prompt. Every prompt describes **only the scene**: setting, staging, subject placement, mood, light, palette, lens/composition.

**Rule 1 — never name the ad copy.** Not quoted, not paraphrased, not negated. Headline, subheadline, bullets, body — none of their strings appear in a prompt in any form. *Naming a string makes the model render it.*

**Rule 2 — never negate.** Everything you name gets drawn, including inside a negation. "No text", "no people", "without a logo" all push the model toward exactly that. Say what **is** there.

**Rule 3 — reserve space geometrically, in the positive.** The later text overlay and the not-yet-generated subject both need room. You buy that room by describing the area as what it positively **is**:

- Text zone: *"the upper third is a smooth, evenly-lit cream plaster wall"* — never *"leave room for the headline"*, never *"no text"*.
- Subject zone (background layer, before the model exists): *"the left third is an open, sunlit stretch of clean countertop and wall, calm and inviting"* — never *"no woman there"*.

Positive phrasings for emptiness: *an unoccupied room*, *bare surfaces*, *a blank plaster wall*, *an uncluttered countertop*.

> The reserved-space convention is a **standing composition rule** from the visual KB — it is no longer derived from the `image_content` body. The skill does not know, and does not need to know, how many lines of text will be overlaid.

**Rule 4 — one image per call.** There is no `n` parameter. Another candidate means another call, with an edited prompt or a different model.

**Rule 5 — no baked-in text, ever.** No layer may render words, letters, or logos into the image. That is achieved through rules 1–3 (clean-surface description), never by asking for their absence.

Prompt language is free-form (English is usually best for the engines) — image prompts are exempt from the Vietnamese rule that governs operator-facing prose and persisted content.

## 6. The chain and the state machine

`background → model → product → composite`. Order is enforced by the server; each layer gates on the previous layer being **approved**. Approval is a human act in the dashboard — the skill can never approve (agents are denied `approve`).

Each invocation: read `list_creatives(brief_id)`, compute `approved(L)` and `has_drafts(L)` per layer, work the **first layer without an approved creative**, then STOP.

| # | Condition | Action |
|---|---|---|
| 1 | not `approved(background)`, `has_drafts(background)`, no `revise` | STOP — backgrounds await review; approve one, then re-run |
| 2 | not `approved(background)` | **background** → 3 × `generate_background` |
| 3 | `approved(background)`, not `approved(model)`, `has_drafts(model)`, no `revise` | STOP — a model candidate is pending; approve or discard it, then re-run |
| 4 | `approved(background)`, not `approved(model)` | **model** → 1 × `generate_model` |
| 5 | `approved(background)` + `approved(model)`, not `approved(product)` | **product** → STOP and ask (upload-only) |
| 6 | all three, not `approved(composite)`, `has_drafts(composite)`, no `revise` | STOP — composite awaits review; approve it, then re-run |
| 7 | all three, not `approved(composite)` | **composite** → 1 × `compose_ad_visual` |
| 8 | all four approved | STOP — visual production **complete** for this angle |

### Layer `background` — 3 calls, 3 readings of the angle

Three separate `generate_background(brief_id, prompt, model?)` calls, each with a **distinct** scene prompt — three genuine readings of the same angle (different setting/time-of-day/staging), not three re-rolls of one prompt. Each returns one DRAFT creative plus the saved prompt row. Three DRAFTs → STOP; the operator approves one.

Each call versions the `(brief_id, background)` prompt row forward, so the *active* prompt row ends as the third. This is accepted: every creative carries its own `prompt_id` + `generation_prompt`, so per-candidate provenance is preserved on the creative row.

### Layer `model` — exactly 1 call, into the approved background

`generate_model(brief_id, prompt, background_creative_id, model?)`. `background_creative_id` is the **currently-approved** background creative id from `list_creatives` — a stale or mismatched id is rejected (`stale_background_ref`); on that error, re-list once and retry with the fresh id. The prompt places the persona's woman into the open subject zone, matching the background's light, perspective, and palette. One DRAFT → STOP. State-machine rule 3 blocks a second candidate while one is pending — one in flight.

### Layer `product` — upload-only, never generated

The product must be the **real** packaging photo. The skill never generates it and never brokers the upload. When `product` is the active layer, STOP and ask the operator (Vietnamese) to upload the real product photo and approve it in `/ad/[month]/[id]`, then re-run.

### Layer `composite` — exactly 1 call, naming both approved inputs

`compose_ad_visual(brief_id, prompt, scene_creative_id, product_creative_id, layout_hint?, hard_paste?, model?)`. **Both ids are required and the skill supplies them**: `scene_creative_id` = the currently-approved `model`-layer creative; `product_creative_id` = the approved `product` creative. Both come from `list_creatives(brief_id)`. `layout_hint` and `hard_paste` are engine-request fields — they are **never** written into the prompt body. One DRAFT → STOP. An approved composite is the **final visual**.

### The revise path

A layer with pending, unapproved drafts normally STOPs (rules 1/3/6). When the operator re-invokes with `revise: <note>` ("warmer light, kitchen not living room"), the skill instead:

1. reads the layer's active prompt via `list_creative_prompts(brief_id)` and the pending drafts' `generation_prompt`;
2. **rewrites** the prompt applying the operator's note (still obeying §5);
3. issues **one** generate call for that same layer with the new prompt.

Iteration is therefore prompt-level, not a blind re-roll — the operator's correction is carried in the text that actually reaches the engine. The generate tool persists the revised prompt row itself; the skill does not call `save_creative_prompt` on this path.

### Model selection

The skill omits `model` unless the operator supplied one, letting the server default govern (text-to-image `fal-ai/flux/schnell`, image-edit `fal-ai/nano-banana/edit`). A supplied model is passed through unchanged. Known families: `fal-ai/flux*`, `fal-ai/nano-banana*`, `fal-ai/imagen4*`. A model outside them is refused as `invalid_input` **before any provider call**, so nothing is spent — the skill surfaces that plainly rather than guessing a substitute.

## 7. Error handling

Every server error stops the run and is reported to the operator in Vietnamese, naming the unmet condition and the exact next action. The skill never retries around an error with different arguments, never falls back to a third-party image API, and never silently skips a layer.

| Error | Meaning | Skill behaviour |
|---|---|---|
| `brief_not_found` / `brief_not_approved` | The anchoring brief is missing or still a draft | STOP — approve an angle brief in `/ad/[month]/[id]` first |
| `idea_not_approved` | The concept is not an approved ad idea | STOP — approve the concept first |
| `background_not_approved` | Model layer attempted with no approved background | STOP — approve a background |
| `stale_background_ref` | The named background is not the current approved one | Re-list `list_creatives` **once**, retry with the fresh id; a second failure STOPs |
| `scene_not_approved` / `product_not_approved` | Composite attempted with no approved model-scene / product | STOP — approve the missing layer (product is upload-only) |
| `prompt_not_found` | No prompt row for the layer | STOP — report; the revise path needs an existing prompt |
| `stale_version` | Concurrent edit of the same prompt row | STOP — re-read `list_creative_prompts` and re-run |
| `invalid_input` | Bad params or an unknown model | STOP — report; no credits were spent |
| `forbidden` | Missing `edit` capability / memberId, or an insufficient server role | STOP — tell the operator their BrandOS account cannot generate; ask an admin to grant the role. Nothing was written |

The `insufficient role` refusal observed live on 2026-07-13 surfaces here. The tool docs now say generation requires only `edit`; if an `edit`-holding operator is still refused, that is a **server bug** (§9), not something the skill works around.

## 8. Output

After a layer's DRAFT creative(s) are saved, the skill emits a short summary and STOPS. It does **not** present candidate images in chat and does **not** run an in-chat revise loop — the operator reviews in the dashboard.

```
## Ads Image — <concept title> — <LAYER> saved

**Target:** idea <idea_id> · brief <brief_id> (<angle_label>)
**Layer produced:** <background | model | composite>
**Built on:** <"— (first layer)" | "approved background" | "approved scene + product">
**Model:** <fal model used, or "server default">
**Drafts saved:** <count> (status='draft', propose-only)

| # | creative id | Scene |
|---|-------------|-------|
| 1 | <id> | <one line: which reading of the angle this is> |
```

Then the correct next action, in Vietnamese:

- after **background**: approve one background in `/ad/<month>/<idea_id>`, then re-run `/ssc.image <idea_id> <brief_id>` for the model layer.
- after **model**: approve (or discard) the candidate, then re-run.
- after **composite**: approve the composite — that is the final visual; production is complete for this angle.

Every STOP condition (unmet precondition, pending drafts, missing product, complete chain, server error) is reported the same way: the reason and the exact next action, plainly, in Vietnamese.

## 9. Server requirements (BrandOS)

The MCP surface has already shipped the brief-keyed chain, the three generate tools, verbatim prompts, and service-side prompt persistence. Two requirements remain.

**S1 — Change 2: N briefs per idea, `angle_label` persisted.**
`save_brief` today documents *"angle_label: NULL this change"* and the server persists one brief per idea. Until Change 2 lands, an idea has a single brief, so the multi-angle payoff (a separate creative chain per approved angle) is inert. The skill is forward-compatible — it takes an explicit `brief_id` and works identically once N briefs exist — but the value of a brief-keyed chain is not realised until this ships. Content rows must also carry `brief_id` (`save_post_content` already accepts it) so that "the approved copy for *this* angle" resolves unambiguously once an idea has several.

**S2 — an `edit`-holding operator must be able to generate.**
On 2026-07-13, `generate_background` / `generate_model` / `compose_ad_visual` returned `{"error":"internal_error","message":"insufficient role"}` to a token that held `edit` (every save and `list_creatives` succeeded). The current tool documentation states generation requires only the `edit` capability. Either the role gate is removed so `edit` is sufficient, or the extra role is documented and grantable to operator tokens — and the refusal must surface as a typed `forbidden`, not an `internal_error`.

## 10. Governance (unchanged, non-negotiable)

- **Propose-only.** The skill saves DRAFT creatives and stops. It never calls `approve` (the only gated promotion — the approval hook denies it to agents), never uses `edit` to demote / unapprove / **discard** a creative, and never calls `set_cover`, `reorder_gallery`, any publish tool, or `update_budget`. None of those tools appears in its `tools:` list. Saving is not approving.
- **Single MCP surface.** Only `mcp__ssc__…` BrandOS tools. Never a third-party image-provider API — provider keys stay server-side.
- **Save-to-server, not present-in-chat.** No in-chat candidate presentation, no in-chat approval loop.
- **No baked-in text.** Achieved through positive clean-surface description (§5), never through negation.
- **Product is real.** Never generated, never uploaded by the skill.
- **Ad channel only** (phase 1). A non-ad idea stops cleanly.
- **One concept + one angle per invocation.** Re-invoke per brief.
- **Operator-facing prose and persisted notes are Vietnamese**; image prompts are free-form.
- Requires the `edit` capability (plus `view` for the resolve reads). Approving a saved draft is the operator's dashboard action.

## 11. Skill frontmatter

```yaml
tools: [get_idea, list_briefs, list_post_content, get_knowledge,
        list_creatives, list_creative_prompts,
        generate_background, generate_model, compose_ad_visual]
```

`save_creative_prompt` is deliberately **absent**: the generate tools persist the prompt row themselves, including on the revise path, so the skill never needs to write one directly. `upload_product_creative` is absent because the product upload is a dashboard action. No `approve`, no `edit`, no `set_cover`, no publish tool.

## 12. Verification

There is no automated test suite in this repo yet (a harness design exists at `docs/superpowers/specs/2026-07-03-plugin-test-lint-harness-design.md`). Verification for this change is therefore by review against these invariants:

1. Every MCP tool named in the skill exists on the BrandOS surface with the argument names used (checked against the live schemas on 2026-07-14).
2. No forbidden tool (`approve`, `edit`, `set_cover`, `reorder_gallery`, publish, `update_budget`, `save_creative_prompt`, `upload_product_creative`) appears in the skill's `tools:` list or procedure.
3. `image_content` appears nowhere as an anchor, precondition, or grounding source.
4. Every `/ssc.*` cross-reference resolves to a live command (`/ssc.ads-brief`, `/ssc.ads-produce`).
5. Every prompt example in the skill obeys §5 — no negation, no copy strings.
6. A live end-to-end run on one approved concept + brief: background (3 drafts) → approve → model (1 draft) → approve → product STOP → composite (1 draft).
