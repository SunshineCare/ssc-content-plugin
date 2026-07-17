# ssc.image-prompt — a propose-only, 5-stage ImageStudio prompt author

**Date:** 2026-07-17
**Status:** Design (approved for scaffolding)
**Change name:** `ssc-image-prompt`
**Repo:** `ssc-content-plugin` (plugin prose — command + agent + skills)

## Context

Brand OS builds an ad visual through the **ImageStudio** — a per-brief, multi-step
creative pipeline where each step carries a human-editable, versioned **scene
prompt** (`creative_prompts.body`) plus per-step **generation settings**
(`creative_prompts.generation_config` = the chosen model + capability inputs).
The studio's mutation ports are propose-vs-generate split: an agent may **save a
prompt + settings** (`save_creative_prompt`), but **Generate is a human click**
(`generate_*` / `compose_ad_visual` / `generate_text_layer`), and candidate
selection ("selected for next step") is a human curation act. This mirrors the
approved content-repo design `image-control-pipeline` (2026-07-16), **Phase E**,
whose backend Phase A+B are already live (`save_creative_prompt` carries
`generation_config`; the priced per-step model catalog + capability profiles
exist; `generate_text_layer` is a human-only tool).

The studio has since been re-shaped by the **`image-subject-layer`** change
(content repo, archived 2026-07-17): the old single "Subject" step split into
**generate-the-person-alone** (`subject`) and **compose-the-person-into-the-scene**
(`model`, labelled *Scene*). The **face/identity is now locked at `subject`**
(the identity models PuLID / Dev General moved there, upstream of placement), and
the Scene step is **reference-edit only** (Kontext Pro). The studio is now **five
steps**.

Today the plugin ships `/ssc.image` (`ssc-image` skill): an agent-driven, **credit-
spending** generator that calls `generate_background` / `generate_model` /
`compose_ad_visual` directly and saves DRAFT creatives. It stays. This change adds
a **separate, propose-only sibling** — `/ssc.image-prompt` — that authors the
studio's per-stage prompt + settings and **never generates** (zero credits); the
operator Generates in the ImageStudio. The operator chose to **keep both** (see
Coexistence).

### The five ImageStudio stages (ground truth)

Source: `content/app/src/lib/ai/image-model-registry.ts` (`ImageStudioStep`,
`IMAGE_MODEL_CATALOG`), `content/app/src/components/studio/image-studio/types.ts`
(`STUDIO_LAYER_ORDER`, `STUDIO_LAYER_LABELS`), and the `save_creative_prompt`
`LAYER_ENUM` in `content/mcp-server/lib/brandos/tools/creative_tools.ts`.

| # | `layer` key | Studio label | Kind | What it does |
|---|---|---|---|---|
| 1 | `background` | Background / *Nền* | text-to-image | generate the empty scene |
| 2 | `subject` | Subject / *Người mẫu* | text-to-image / identity | **generate the model/person ALONE** — face + pose locked here |
| 3 | `model` | **Scene / *Ghép người*** | reference edit | **compose the subject into the background** |
| 4 | `composite` | Product / *Sản phẩm* | control edit | place the product into the scene, correct perspective |
| 5 | `text` | Text / *Tiêu đề* | text-render | render the exact approved headline into the reserved zone |

`save_creative_prompt` accepts `['background','subject','model','composite','text']`.
`product` is **upload-only** (a real packshot the operator uploads) and is rejected
as a prompt layer — it is an *input* to stage 4, never a stage of this pipeline.

**Naming caution (load-bearing):** the backend layer key **`model` is the *Scene*
step** (compose subject into background), not "the subject/person". The person is
`subject`. The skill for the Scene step is named `-scene` for clarity but persists
`save_creative_prompt(layer:'model')`.

## Goals

- A new thin command **`/ssc.image-prompt <brief_id> [stage] [revise: <note>]`**
  that dispatches a state-driven agent. `brief_id` is the **sole required input**
  (brief-keyed, matching `/ssc.ads-produce`); the idea is resolved from the brief.
- A new **`ssc-image-prompt-agent`** — a next-open-stage stepper (parity with
  `ssc-ads-agent`) that authors exactly **one stage's** prompt + `generation_config`,
  saves it via `save_creative_prompt`, and **STOPS** at that stage's human gate.
- **Five stage-skills**, one pipeline step each, that author the full
  `generation_config` (chosen FLUX/Ideogram model + capability-matched control /
  identity settings + named reference pool ids when resolvable), grounded in the
  brief angle + persona doc + approved copy (meaning only) + brand/visual KB.
- **Propose-only, zero agent credit spend** — the hard plugin invariant preserved:
  the agent never generates, never approves, never uploads, never selects a
  candidate. Generation + selection are human studio acts.
- Prompt discipline carried verbatim: **never negate; reserve space in the
  positive; never name a copy string in stages 1–4**, with the one deliberate
  exception that **stage 5 (text) renders the exact approved headline**.

## Non-goals

- **No rewrite/removal of the existing `/ssc.image`.** It stays as the credit-
  spending direct generator; this is a separate command (operator's explicit
  "keep both" choice).
- **No generation, approval, upload, cover-setting, budget, or publish** from any
  new skill/agent — none of those tools appears in a `tools:` list.
- **No new MCP server / no `plugin.json` / `.mcp.json` change** — same BrandOS
  surface (`https://ssc.sunshinecare.vn/bos/mcp`).
- **No non-ad channels** (phase 1 is ad only — briefs are ad angle briefs).
- **No backend work** — the `subject`/`model`-as-Scene layers + `save_creative_prompt`
  extension already shipped in `image-control-pipeline` + `image-subject-layer`.

## Architecture — files

```
plugins/ssc-content/
  commands/ssc.image-prompt.md                # thin entry point → dispatches the agent
  agents/ssc-image-prompt-agent.md            # state-driven orchestrator (5 skills)
  skills/ssc-image-prompt-background/SKILL.md # stage 1 — scene            → layer 'background'
  skills/ssc-image-prompt-subject/SKILL.md    # stage 2 — person ALONE     → layer 'subject'
  skills/ssc-image-prompt-scene/SKILL.md      # stage 3 — subject→background → layer 'model'
  skills/ssc-image-prompt-composite/SKILL.md  # stage 4 — product           → layer 'composite'
  skills/ssc-image-prompt-text/SKILL.md       # stage 5 — headline          → layer 'text'
```

- **Command** — thin; holds no orchestration. Parses `brief_id` (+ optional
  `stage`, `revise:`) and dispatches `ssc-image-prompt-agent`. Frontmatter
  description states plainly this is the **propose-only, zero-credit** sibling of
  `/ssc.image`.
- **Agent** — `capability: edit`, `approval-gates: human`,
  `orchestrates: [the 5 skills]`, read-only `tools:` to resolve state.
- **Skills** — `metadata.section: ads`, `stage: produce`, `capability: edit`; each
  directory name === frontmatter `name`; each registered in the agent's
  `orchestrates:`. Each carries only the tools it needs (reads + `save_creative_prompt`).
- No change to `plugin.json` / `.mcp.json`.

## Agent state machine (next-open-stage stepper)

On each invocation:

1. **Resolve + gate.** `get_brief(brief_id)` → `{ brief, idea }`.
   - `idea.channel !== 'ad'` → STOP (Vietnamese): luồng dựng prompt hiện chỉ chạy cho concept quảng cáo.
   - `idea.status !== 'approved'` → STOP: duyệt concept trước.
   - `brief.status !== 'approved'` → STOP: duyệt một angle brief trước.
   - `get_idea` may be called as a follow-up when fuller idea detail (ad_notes,
     tags) is needed — it is **not** a command input.
2. **Read progress.**
   - `list_creatives(brief_id)` — what's generated + **selected-for-next**
     (`approved`) per layer.
   - `list_creative_prompts(brief_id)` — which stages already have a saved prompt
     (+ its `version`, for the `revise:` optimistic-concurrency guard).
   - `list_content(idea)` — approved `copy` (grounding, meaning only) and approved
     `image_content` / headline (the exact string stage 5 renders).
   - `list_gallery_media(...)` — to find an identity photo (subject) or product
     packshot (composite) in the pool when naming a reference.
3. **Find the next-open stage** = first stage `L` in
   `[background, subject, model, composite, text]` with **no selected-for-next
   (`approved`) candidate**. Then:
   - **No saved prompt for `L`** → author `L`'s prompt + `generation_config`,
     `save_creative_prompt`, **STOP** ("prompt saved — Generate in the studio").
   - **Saved prompt, no candidate generated/selected** → **STOP** (human Generates
     + selects), **unless** `revise:` given → rewrite the prompt (with
     `expected_version`) + re-save → STOP.
   - Because `L` is the *first* not-done stage, every earlier stage is already
     done, so `L`'s prompt is grounded in the actual **selected** prior output.
4. **All five done** → STOP: pipeline complete for this brief; hero/export choices
   are the operator's studio actions.

`stage` targets a specific stage to (re)author. `revise:` always lands on the
active stage's prompt and is never dropped.

**Stage dependencies** (enforced by strict order):

- `background` — none.
- `subject` — the person is generated **alone** on a simple ground (so it cuts out
  cleanly at Scene), **but authored to suit the selected background**: outfit,
  wardrobe, styling, colour palette, and light are all made coherent with the
  chosen scene — read from the selected `background` creative's prompt — so the
  composed Scene reads as one photograph, not a person pasted onto a mismatched
  set. Face/pose are locked here. Strict order guarantees the background is already
  selected when `subject` is authored; if `subject` is explicitly targeted before a
  background is selected, ground the wardrobe/style in the brief's *intended* scene
  and note that selecting a background first sharpens the match.
- `model` (Scene) — needs **both** a selected `background` **and** a selected
  `subject` (it composes them). Strict order guarantees both are done first.
- `composite` — needs a selected `model` (Scene) **and** a product packshot in the
  pool (else STOP → ask the operator to upload the real packshot).
- `text` — needs a selected `composite` **and** an approved `image_content` /
  headline (else STOP → `/ssc.ads-produce <brief_id> image_content`).

## The five stage-skills

All five share the grounding sources — chosen **brief** angle (`angle_label` + the
five narrative fields) → **persona** detail doc (`brand/persona-<slug>`, derived
mechanically from the persona tag) → approved **copy** (*meaning only* for stages
1–4) → **brand/visual KB + compliance** → the **concept** — and obey the prompt
rules (Governance). Each stage authors `body` + a capability-matched
`generation_config`:

| Stage / skill | `layer` saved | Authors | Precondition beyond brief | Model default |
|---|---|---|---|---|
| **background** | `background` | Fresh scene; reserves the subject zone + text zone in the positive | none | `fal-ai/flux-2/klein/9b` (FLUX.2 ladder: Dev/Pro/Max selectable) |
| **subject** | `subject` | The persona's woman **generated ALONE** on a simple ground (clean cut-out for Scene), but with **outfit, wardrobe, styling, palette, and light made coherent with the selected background** (read from its scene prompt) so the Scene composes as one photograph; **face + pose locked here** — when a real-model photo is in the pool, picks `fal-ai/flux-pulid` (or `fal-ai/flux-general` for identity+pose) + `identityRef` + `idWeight` (+ `controlType:'pose'` + `conditioningScales` for a pose reference); else a text-to-image model + a persona-described person | selected `background` (for wardrobe/style coherence; person still generated standalone) | `fal-ai/flux-2/klein/9b` (FLUX.2), or `fal-ai/flux-pulid` when a face ref exists |
| **scene** | `model` | Reference-edit prompt composing the **selected subject into the selected background**, matching light/perspective; names both as reference images | selected `background` + selected `subject` | `fal-ai/flux-pro/kontext` (only catalog option) |
| **composite** | `composite` | Places the **product** into the scene with correct perspective; names the product packshot as the control/reference source; picks `controlType` (depth/canny) + `conditioningScales` | selected `model` (Scene) + a product packshot in the pool | `fal-ai/flux-general` (control) or `fal-ai/flux-pro/kontext` |
| **text** | `text` | Text-placement prompt carrying the **exact approved headline string**, targeting the reserved zone | selected `composite` + approved `image_content` / headline | `fal-ai/ideogram/v3`, or `overlay` (deterministic, diacritic-safe) |

`generation_config` shape (per `save_creative_prompt` schema): `{ model,
controlType?, controlSourceRef?, identityRef?, conditioningScales?, idWeight? }` —
only the fields the chosen model's capability profile declares are set (e.g. never
send `controlType` to a plain text-to-image model; `conditioningScales` is a number
array). A reference id (`identityRef` / `controlSourceRef`) is named **only when
resolvable** from `list_gallery_media`; otherwise the skill authors `body` + `model`
and leaves the reference for the operator to attach in the studio, saying so plainly.

## Governance & prompt rules

**Propose-only, zero-credit (hard invariant, held by three layers: server `approve`
capability, the `approval-gate.mjs` hook, and this prose).**

- Agent + skill `tools:` = **reads + `save_creative_prompt` only**: `get_brief`,
  `get_idea`, `list_briefs`, `list_content`, `list_creatives`,
  `list_creative_prompts`, `get_knowledge`, `list_gallery_media`,
  `save_creative_prompt`.
- **Never** present in any skill/agent: `generate_*` / `compose_ad_visual` /
  `generate_text_layer` (generation is a human click), `approve` / `unapprove`
  (denied to subagents by the hook), `upload_creative` / `confirm_creative_upload`
  / `select_gallery_creative` (upload + candidate selection are human curation),
  `set_cover`, `reorder_gallery`, publish, `update_budget`.
- Saving a prompt is **not** approving and spends **no** credits.

**Prompt rules (verbatim from `ssc-image` — the "avoid negatives" requirement):**

1. **Never negate** — everything named gets drawn; say what *is* there.
2. **Reserve space in the positive** — the text zone and (on `background`) the
   subject zone, described as what they positively are, never "leave room for…"
   / "no text".
3. **Stages 1–4 never name a copy / headline string** — describe the scene the
   copy *implies*, never its words.
4. **Stage 5 (text) is the deliberate exception** — it carries the **exact
   approved headline** (verbatim Vietnamese) as the text-render input.
5. **No baked-in text in stages 1–4**, achieved through clean-surface description,
   never by asking for text's absence.

Prompt `body` is free-form (English usually best for the engines) **except** the
stage-5 headline string (exact Vietnamese). All operator-facing chat and persisted
Vietnamese notes stay Vietnamese, per plugin convention.

## Coexistence with `/ssc.image`

The operator chose to **keep both**. They are cleanly delineated:

| | `/ssc.image` (existing) | `/ssc.image-prompt` (new) |
|---|---|---|
| Input | `<ideaId> <briefId>` | `<briefId>` |
| Acts | **generates** (spends fal credits), saves draft creatives | authors **prompt + settings only** (zero credits) |
| Tools | `generate_*`, `compose_ad_visual` | reads + `save_creative_prompt` |
| Human step | approve/select in dashboard | **Generate** + select in ImageStudio |
| Stages | background → model → product → composite (old vocab) | background → subject → scene → composite → text (5-step studio) |

Each command's frontmatter description names which it is, so operators pick
deliberately. They share no state; both read/write the same brief-keyed creative
surface without conflict.

**Known, accepted tension:** two image commands, one credit-spending — this
contradicts the redesign's "zero-credit, human-generates" governance in the
abstract, but is the operator's explicit transitional choice while the studio UI
(content-repo Phase C/D) settles. Recorded here as accepted, not a defect.

## Deployment dependency (ordering)

1. The backend `subject` / `model`-as-Scene layers + the `save_creative_prompt`
   layer enum (`image-control-pipeline` Phase A/B + `image-subject-layer`) must be
   **deployed to the live BrandOS server** first. (Both changes are complete in the
   content repo; confirm the deployed server actually accepts
   `save_creative_prompt(layer:'subject')` before shipping — per the "verify BrandOS
   behavior live" rule, a read-only probe against the live surface is the check.)
2. Then this plugin pipeline ships.
3. **Guard:** a `save_creative_prompt(layer:'subject')` rejected by a not-yet-
   deployed server must surface cleanly — a Vietnamese STOP ("server BrandOS chưa
   hỗ trợ layer này — báo quản trị deploy bản mới rồi chạy lại; chưa ghi gì") —
   never a silent skip or retry loop.

## MCP / tool surface

- **Reads:** `get_brief`, `get_idea`, `list_briefs`, `list_content`,
  `list_creatives`, `list_creative_prompts`, `get_knowledge`, `list_gallery_media`.
- **Write:** `save_creative_prompt` (with `generation_config`) — the only mutation.
- Every referenced tool exists on the live BrandOS `ssc` surface (guarding against
  the renamed/removed-tool bug class); `save_creative_prompt`'s `layer` enum
  includes `subject` / `model` / `text`, rejects `product`.

## Testing / validation

- No automated plugin test suite yet (a harness design exists at
  `docs/superpowers/specs/2026-07-03-plugin-test-lint-harness-design.md`).
- Manual validation this change must pass:
  - The governance hook still denies `approve_*` from a subagent for this agent id
    (exercise `approval-gate.mjs` with an `agent_id` of `ssc-image-prompt-agent`).
  - Every tool named in a skill/agent frontmatter resolves on the BrandOS surface.
  - Every `/ssc.*` cross-reference resolves to a real command (no `ssc.plan` /
    `ssc.ads` refs).
  - Each skill's `layer` mapping matches the table above — especially
    `-scene → layer:'model'` and no `layer:'product'` save.
  - A live read-only probe confirms the deployed server accepts the `subject`
    layer before shipping.

## Open questions (resolve during implementation)

- Exact `list_gallery_media` filter/args to locate an identity photo vs a product
  packshot in the pool (kind/facet tags: `kind:subject` / face facets vs
  `kind:product`), so the skill names `identityRef` / `controlSourceRef` reliably.
- Whether `subject` should default to an identity model whenever *any* face photo
  is in the pool, or only when the operator has tagged one as the intended model
  (default: only when a clearly-intended identity ref is resolvable; else
  text-to-image + persona description, and note the option to the operator).
- Whether pose control at `subject` (`flux-general` + `controlType:'pose'`) is authored
  proactively when a pose reference is present, or left as an operator opt-in
  (default: opt-in — author identity first, mention pose control as available).
