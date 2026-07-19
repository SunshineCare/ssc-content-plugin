---
description: Author the ImageStudio per-step PROMPTS + generation settings for ONE approved ad concept's chosen angle — a propose-only, ZERO-CREDIT, state-driven stepper anchored to a brief. The zero-credit sibling of /ssc.image (which generates images directly and spends fal credits); this command NEVER generates. Dispatches ssc-image-prompt-agent with a required brief_id (the owning ad concept is resolved from the brief via get_brief — no idea_id). The ImageStudio builds a visual through FIVE steps, ALL OPTIONAL — scene (Bối cảnh, backend layer 'scene' — a text-to-image full image that may FREELY include a GENERIC subject and/or product, NO real references, NO reserved zones) → subject (Người mẫu, backend layer 'subject' — the person generated ALONE with face + pose locked, an anchor candidate) → composition (Ghép, backend layer 'composition' — the anchor-gated compose-with-references step: needs ≥1 selected subject OR approved product; composes the anchor(s) onto a selected Scene, else builds around them; control-source defaults to the product) → edit (Chỉnh sửa, backend layer 'edit' — a generic, REPEATABLE "what to change" prompt-to-edit over the chain tip) → text (Tiêu đề, backend layer 'text' — renders the exact approved headline over the chain tip). On each invocation the agent resolves studio state (list_creatives / list_creative_prompts / list_content), works the SINGLE next-open step by dispatching that step's skill — which authors the full scene prompt + generation_config (model + capability-matched control/identity settings) and SAVES it via save_creative_prompt — then STOPS. The operator then clicks Generate and selects a candidate in the ImageStudio; re-invoking advances to the next step. Design decision D4 — every step grounds its prompt in ALL APPROVED CONTENTS of the brief (approved copy / headline / description / image_content). Prompt discipline: never negate, reserve nothing, never name a content string in the Scene/Subject/Composition/Edit steps (text is the sole exception — it carries the exact approved Vietnamese headline). The Composition step (layer 'composition', generate_composition) is the anchor-gated compose-with-references step — its logic lives here, not folded into any other step. `stage: <name>` targets a specific step; `revise: <note>` rewrites the active step's saved prompt. PHASE 1 wires only the ad channel (a non-ad idea stops cleanly). Propose-only; the agent saves prompts, never generates, never approves, never uploads, never spends credits.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input:

- **Angle brief ID** (`brief_id`) — **REQUIRED, the sole input.** The owning ad
  concept (an `ideas` row, `channel='ad'`, `status='approved'`) is resolved from
  the brief via `get_brief` — there is **no `idea_id`**. The brief is produced
  first by `/ssc.ads-brief` and approved in the dashboard.

Optional (passed through unchanged):

- **Step** (`stage: <name>`) — one of `scene` (the Scene step, backend layer
  `scene`), `subject` (backend layer `subject`), `composition` (the Composition
  step, backend layer `composition`), `edit` (the Edit step, backend layer
  `edit`), or `text` to target a specific step. Omit it and the agent works the
  **next open step** (every step is optional — Scene, Subject, Composition and
  Edit run only when reached or explicitly targeted). `scene` = Scene (Bối cảnh);
  `composition` = Composition (Ghép) — the anchor-gated compose-with-references
  step.
- **Change** (`change: <what to change>`) — **Edit step only** — the operator's
  "what to change" instruction that drives a generic Kontext edit over the chain
  tip (e.g. *"đặt sản phẩm lên bàn bên trái"*, *"chỉnh ánh sáng ấm hơn"*). The Edit
  step is optional and repeatable; without a `change` (and no pending edit) it
  stops and asks what to change, or routes you on to Text.
- **Revision note** (`revise: <note>`) — a free-text correction for the **active
  step's** saved prompt. The active step's skill **rewrites** that prompt (with
  optimistic-concurrency versioning) and re-saves it. It never generates.
- **Product** (`product: <creative_id>`) — which approved brief-level product
  packshot the reference-driven steps should use, when the brief has more than one
  (with several and no selector, the step **stops and asks** which). Product enters
  primarily as a **Composition** reference (Composition defaults its control-source
  to the product); further product tweaks go through a **Step-4 Edit**.

If `brief_id` is missing, ask the operator for it (one question) before
dispatching — **do not invent one**. There is no `date` selector: a `brief_id` is
concept-scoped, so this command always takes an explicit `brief_id`.

## What this is

`/ssc.image-prompt` is the **propose-only, ZERO-CREDIT sibling** of `/ssc.image`.
The two coexist and are cleanly delineated:

- **`/ssc.image`** — the existing **direct generator**: it calls the image engines
  and **spends fal credits**, saving DRAFT creatives.
- **`/ssc.image-prompt`** — this command: it **authors the ImageStudio prompt +
  generation settings only** and **spends no credits**. The human clicks
  **Generate** and selects a candidate in the ImageStudio.

Pick deliberately: use `/ssc.image-prompt` to draft and refine the per-step
prompts + model/control settings the studio Generate button will consume.

## What to do

This command is a **thin entry point — it holds no orchestration logic.** It
dispatches the single orchestrator **`ssc-image-prompt-agent`** (`brief_id`, plus
optional `stage` / `change:` / `revise:` / `product:` passthrough) and stops. It
does **not** resolve the concept, pick a step, or choose models itself — that is
the agent's and skills' job.

`ssc-image-prompt-agent` is a **state-driven, next-open-step stepper**: on each
invocation it resolves `get_brief(brief_id) → { brief, idea }`, gates (the idea is
an approved ad concept; the brief is an approved angle), reads the brief's studio
state, works the **single next-open step** across the five-step chain —
**`scene` (text-to-image base) → `subject` (anchor candidate) → `composition`
(anchor-gated) → `edit` (optional + repeatable) → `text`** — by dispatching that
step's skill, which authors the full scene prompt + `generation_config` and **saves
it via `save_creative_prompt`** — then **STOPS** at the human Generate/select gate.
Re-invoke to advance; re-invoke with `revise:` to correct the active step's prompt,
or with `change:` to author another Edit. Every step is optional: skip Scene →
Composition builds around the anchors from scratch; skip Subject and Composition →
an Edit or Text hangs off the Scene.

**Propose-only:** the agent and its skills **never** generate an image, approve,
upload, select a candidate, set a cover, publish, or spend credits. Generation and
selection are the operator's **ImageStudio** actions. Each step's author holds only
reads + `save_creative_prompt` for its own layer — the Composition author saves
`layer:'composition'`, no generate tool. **Phase 1 wires only the ad channel** — a
non-ad idea stops cleanly.
