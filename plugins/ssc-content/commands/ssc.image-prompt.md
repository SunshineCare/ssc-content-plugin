---
description: Author the ImageStudio per-stage PROMPTS + generation settings for ONE approved ad concept's chosen angle — a propose-only, ZERO-CREDIT, state-driven stepper anchored to a brief. The zero-credit sibling of /ssc.image (which generates images directly and spends fal credits); this command NEVER generates. Dispatches ssc-image-prompt-agent with a required brief_id (the owning ad concept is resolved from the brief via get_brief — no idea_id). The ImageStudio builds a visual through FIVE stages — background (Nền) → subject (Người mẫu, the person generated ALONE with face + pose locked, styled to suit the selected background) → scene (Ghép người, composes the subject into the background; persists layer 'model') → composite (Sản phẩm, places the real product) → text (Tiêu đề, renders the exact approved headline). On each invocation the agent resolves studio state (list_creatives / list_creative_prompts / list_content), works the SINGLE next-open stage by dispatching that stage's skill — which authors the full scene prompt + generation_config (model + capability-matched control/identity settings) and SAVES it via save_creative_prompt — then STOPS. The operator then clicks Generate and selects a candidate in the ImageStudio; re-invoking advances to the next stage. Prompt discipline: never negate, reserve space in the positive, never name a copy string in stages 1–4 (stage 5/text is the sole exception — it carries the exact approved Vietnamese headline). `stage: <name>` targets a specific stage; `revise: <note>` rewrites the active stage's saved prompt. PHASE 1 wires only the ad channel (a non-ad idea stops cleanly). Propose-only; the agent saves prompts, never generates, never approves, never uploads, never spends credits.
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

- **Stage** (`stage: <name>`) — one of `background`, `subject`, `scene`,
  `composite`, `text` to target a specific stage. Omit it and the agent works the
  **next open stage** (the first stage with no selected-for-next candidate).
- **Revision note** (`revise: <note>`) — a free-text correction for the **active
  stage's** saved prompt. The active stage's skill **rewrites** that prompt (with
  optimistic-concurrency versioning) and re-saves it. It never generates.
- **Product** (`product: <creative_id>`) — **composite stage only** — which approved
  brief-level product packshot the composite should use, when the brief has more than
  one (with several and no selector, the composite skill **stops and asks** which).

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

Pick deliberately: use `/ssc.image-prompt` to draft and refine the per-stage
prompts + model/control settings the studio Generate button will consume.

## What to do

This command is a **thin entry point — it holds no orchestration logic.** It
dispatches the single orchestrator **`ssc-image-prompt-agent`** (`brief_id`, plus
optional `stage` / `revise:` passthrough) and stops. It does **not** resolve the
concept, pick a stage, or choose models itself — that is the agent's and skills'
job.

`ssc-image-prompt-agent` is a **state-driven, next-open-stage stepper**: on each
invocation it resolves `get_brief(brief_id) → { brief, idea }`, gates (the idea is
an approved ad concept; the brief is an approved angle), reads the brief's studio
state, works the **single next-open stage** across
**`background` → `subject` → `scene` (persists `model`) → `composite` → `text`** by
dispatching that stage's skill — which authors the full scene prompt +
`generation_config` and **saves it via `save_creative_prompt`** — then **STOPS** at
the human Generate/select gate. Re-invoke to advance; re-invoke with `revise:` to
correct the active stage's prompt.

**Propose-only:** the agent and its skills **never** generate an image, approve,
upload, select a candidate, set a cover, publish, or spend credits. Generation and
selection are the operator's **ImageStudio** actions. **Phase 1 wires only the ad
channel** — a non-ad idea stops cleanly.
