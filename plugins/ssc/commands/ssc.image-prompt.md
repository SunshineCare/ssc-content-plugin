---
description: >-
  Author the ImageStudio per-step PROMPTS + generation settings for ONE approved concept's brief — a propose-only, ZERO-CREDIT, state-driven stepper anchored to a brief. The zero-credit sibling of /ssc.image (which generates images directly and spends fal credits); this command NEVER generates. Dispatches ssc-image-prompt-agent with a required brief_id (the owning concept AND the channel are resolved from the brief via get_brief — no idea_id, no channel argument; `ad` and `post` are both accepted, any other channel stops cleanly). The ImageStudio builds a visual through FIVE steps, ALL OPTIONAL — scene (Bối cảnh, backend layer 'scene' — a text-to-image full image that may FREELY include a GENERIC subject and/or product, NO real references, NO reserved zones) → subject (Người mẫu, backend layer 'subject' — the person generated ALONE with face + pose locked, an anchor candidate) → composition (Ghép, backend layer 'composition' — the anchor-gated compose-with-references step: needs ≥1 selected subject OR approved product; composes the anchor(s) onto a selected Scene, else builds around them; control-source defaults to the product) → edit (Chỉnh sửa, backend layer 'edit' — a generic, REPEATABLE "what to change" prompt-to-edit over the chain tip) → text (Tiêu đề, backend layer 'text' — renders the exact approved headline over the chain tip). On each invocation the agent resolves studio state (list_creatives / list_creative_prompts / list_content), works the SINGLE next-open step by dispatching that step's skill — which authors the full scene prompt + generation_config (model + capability-matched control/identity settings) and SAVES it via save_creative_prompt — then STOPS. The operator then clicks Generate and selects a candidate in the ImageStudio; re-invoking advances to the next step. Design decision D4 — every step grounds its prompt in ALL APPROVED CONTENTS of the brief FOR THE RESOLVED CHANNEL (ad: approved copy / headline / description / image_content; post: approved copy / image_content — a post has no headline and no description section, and an absent section is simply absent, never an error). Prompt discipline: never negate, reserve nothing, never name a content string in the Scene/Subject/Composition/Edit steps (text is the sole exception — it carries the exact approved Vietnamese headline). The Composition step (layer 'composition', generate_composition) is the anchor-gated compose-with-references step — its logic lives here, not folded into any other step. A step is targeted either POSITIONALLY (`/ssc.image-prompt <brief_id> <step>` — the form the dashboard's copy button emits on both workspaces, where `<step>` is `scene | subject | compose | composition | edit | text` and `compose` is an exact alias of `composition`) or as `stage: <name>`; a bare trailing `rewrite` marker rewrites that step's saved prompt, and `revise: <note>` does the same carrying a correction note. The channel is resolved from the brief and both `ad` and `post` run the full five-step chain; any other channel (e.g. `youtube`, or a brief with no channel) stops cleanly, writing nothing. Propose-only; the agent saves prompts, never generates, never approves, never uploads, never spends credits.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input:

- **Brief ID** (`brief_id`) — **REQUIRED, the sole input.** The owning concept (an
  approved `ideas` row) **and the channel** are resolved from the brief via
  `get_brief` — there is **no `idea_id`** and **no channel argument**. Both `ad`
  and `post` are accepted; any other channel stops cleanly. For an **ad** concept
  the angle briefs are produced first by `/ssc.ads-brief` and one is approved in
  the dashboard; a **post** idea has exactly **one** brief, created already
  approved.

Optional (passed through unchanged):

- **Step** — the step to target, given **either POSITIONALLY** as the second
  argument (`/ssc.image-prompt <brief_id> <step>` — the form the dashboard's
  ImageStudio copy button emits, on **both** the `/ad/…` and `/post/…`
  workspaces) **or** as `stage: <name>`. **The two forms are equivalent and both
  accept the same tokens**: `scene` (the Scene step, backend layer `scene`),
  `subject` (backend layer `subject`), **`compose` or `composition`** (the
  Composition step, backend layer `composition` — `compose` is the studio label
  the dashboard emits and is an **exact alias**; both are always accepted),
  `edit` (the Edit step, backend layer `edit`), or `text`. Omit it and the agent
  works the **next open step** (every step is optional — Scene, Subject,
  Composition and Edit run only when reached or explicitly targeted). `scene` =
  Scene (Bối cảnh); `compose`/`composition` = Composition (Ghép) — the
  anchor-gated compose-with-references step.
- **Rewrite marker** (a bare trailing `rewrite`) — `/ssc.image-prompt <brief_id>
  <step> rewrite`. The dashboard appends it when that step **already has a saved
  prompt**, and it means exactly what `revise:` means **minus the note**: rewrite
  the active step's saved prompt (re-saved with optimistic-concurrency
  versioning). It is a bare word, never `rewrite: <something>` — use
  `revise: <note>` when there is a correction to carry.
- **Change** (`change: <what to change>`) — **Edit step only** — the operator's
  "what to change" instruction that drives a generic Kontext edit over the chain
  tip (e.g. *"đặt sản phẩm lên bàn bên trái"*, *"chỉnh ánh sáng ấm hơn"*). The Edit
  step is optional and repeatable; without a `change` (and no pending edit) it
  stops and asks what to change, or routes you on to Text.
- **Revision note** (`revise: <note>`) — a free-text correction for the **active
  step's** saved prompt. The active step's skill **rewrites** that prompt (with
  optimistic-concurrency versioning) and re-saves it. It never generates. The
  bare `rewrite` marker above is the **note-less** form of this same behaviour.
- **Product** (`product: <creative_id>`) — which approved brief-level product
  packshot the reference-driven steps should use, when the brief has more than one
  (with several and no selector, the step **stops and asks** which). Product enters
  primarily as a **Composition** reference (Composition defaults its control-source
  to the product); further product tweaks go through a **Step-4 Edit**.

If `brief_id` is missing, ask the operator for it (one question) before
dispatching — **do not invent one**. There is no `date` selector and no `channel`
selector: a `brief_id` is concept-scoped and the channel rides on the brief, so
this command always takes an explicit `brief_id` as its first argument.

**Parsing the arguments.** The first token is always the `brief_id`. A **bare**
token that follows it is a **step** when it matches a step token (`scene` |
`subject` | `compose` | `composition` | `edit` | `text`) and the **rewrite
marker** when it is `rewrite`; so the dashboard's `<brief_id> <step> rewrite`
parses as step + rewrite. Everything else arrives as a `key: value` pair
(`stage:` / `change:` / `revise:` / `product:`). Normalise `compose` →
`composition` before dispatching, and pass a bare `rewrite` through as the
note-less rewrite instruction. If a bare token is neither a step token nor
`rewrite`, **ask** rather than guessing — never silently drop it.

## What this is

`/ssc.image-prompt` is the **propose-only, ZERO-CREDIT sibling** of `/ssc.image`.
The two coexist and are cleanly delineated:

- **`/ssc.image`** — the existing **direct generator**, **ad channel only**: it
  calls the image engines and **spends fal credits**, saving DRAFT creatives. On a
  **post** brief it stops — this command is the only prompt path that serves both
  channels.
- **`/ssc.image-prompt`** — this command: it **authors the ImageStudio prompt +
  generation settings only** and **spends no credits**. The human clicks
  **Generate** and selects a candidate in the ImageStudio.

Pick deliberately: use `/ssc.image-prompt` to draft and refine the per-step
prompts + model/control settings the studio Generate button will consume.

## What to do

This command is a **thin entry point — it holds no orchestration logic.** It
dispatches the single orchestrator **`ssc-image-prompt-agent`** (`brief_id`, plus
the optional step — positional or `stage:`, with `compose` normalised to
`composition` — and the optional `rewrite` marker / `change:` / `revise:` /
`product:` passthrough) and stops. It
does **not** resolve the concept, pick a step, or choose models itself — that is
the agent's and skills' job.

`ssc-image-prompt-agent` is a **state-driven, next-open-step stepper**: on each
invocation it resolves `get_brief(brief_id) → { brief, idea }`, gates (the channel
resolved from the brief is `ad` or `post`; the idea is an approved concept; the
brief is approved), reads the brief's studio
state, works the **single next-open step** across the five-step chain —
**`scene` (text-to-image base) → `subject` (anchor candidate) → `composition`
(anchor-gated) → `edit` (optional + repeatable) → `text`** — by dispatching that
step's skill, which authors the full scene prompt + `generation_config` and **saves
it via `save_creative_prompt`** — then **STOPS** at the human Generate/select gate.
Re-invoke to advance; re-invoke with a bare `rewrite` (or `revise: <note>` to carry
a correction) to rewrite the active step's prompt, or with `change:` to author
another Edit. Every step is optional: skip Scene →
Composition builds around the anchors from scratch; skip Subject and Composition →
an Edit or Text hangs off the Scene.

**Propose-only:** the agent and its skills **never** generate an image, approve,
upload, select a candidate, set a cover, publish, or spend credits. Generation and
selection are the operator's **ImageStudio** actions. Each step's author holds only
reads + `save_creative_prompt` for its own layer — the Composition author saves
`layer:'composition'`, no generate tool.

**Channel:** resolved from the brief, never passed in. **`ad` and `post` both run
the full chain**; the only difference is which approved content sections exist to
ground on (ad: copy / headline / description / image_content; post: copy /
image_content) and which workspace the hand-off points at (`/ad/[month]/<idea_id>`
vs `/post/[month]/<idea_id>`). Any other channel — `youtube`, or a brief with no
channel — **stops cleanly** at the gate, writing nothing.
