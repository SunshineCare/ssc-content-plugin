---
argument-hint: '<brief_id> [scene|subject|composition|edit|text] [setup: <n>|rewrite|image_content|revise: <note>]'
description: >-
  Authors the ImageStudio per-step image prompts and generation settings for one
  approved briefId, dispatching ssc-image-prompt-agent to work the next open step of
  Scene → Subject → Composition → Edit → Text — the Text step first writing the
  on-image copy fitted to the selected image, then the prompt that places it. The only
  image path Cowork has, and it is zero-credit — the operator clicks Generate in the
  ImageStudio dashboard, which is what spends fal credits.
metadata:
  dispatches: [ssc-image-prompt-agent]
  brand: cambridge-diet-vn
  section: image
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
  the angle briefs are produced first by `/ssc-ads-brief` and one is approved in
  the dashboard; a **post** idea has exactly **one** brief, created already
  approved.

Optional (passed through unchanged):

- **Step** — the step to target, given **either POSITIONALLY** as the second
  argument (`/ssc-image-prompt <brief_id> <step>` — the form the dashboard's
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
- **Rewrite marker** (a bare trailing `rewrite`) — `/ssc-image-prompt <brief_id>
  <step> rewrite`. The dashboard appends it when that step **already has a saved
  prompt**, and it means exactly what `revise:` means **minus the note**: rewrite
  the active step's saved prompt (re-saved with optimistic-concurrency
  versioning). It is a bare word, never `rewrite: <something>` — use
  `revise: <note>` when there is a correction to carry.
- **Fresh on-image copy marker** (a bare trailing `image_content`) —
  `/ssc-image-prompt <brief_id> text image_content`. **Text step only.** It forces
  the Text step's on-image copy phase to run and produce a **fresh batch of
  candidate `image_content` drafts**, whether an approved row already exists or
  unreviewed drafts are pending. It is non-destructive by construction — the write
  path only ever INSERTS, so nothing is approved, demoted or deleted. Like
  `rewrite`, it is a bare word, never `image_content: <something>`.
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
- **Setup** (`setup: <số | tiêu đề | mô tả>`) — **Scene step only** — the operator's
  answer to the Scene step's **five-setup menu**: a number (`setup: 3`), a setup
  title, or their own free-text scene direction. Supplied → Scene is the active step
  and it **skips the menu**, authoring that setup. Omit it and Scene proposes five
  setups and waits for the pick.

If `brief_id` is missing, ask the operator for it (one question) before
dispatching — **do not invent one**. There is no `date` selector and no `channel`
selector: a `brief_id` is concept-scoped and the channel rides on the brief, so
this command always takes an explicit `brief_id` as its first argument.

**Parsing the arguments.** The first token is always the `brief_id`. A **bare**
token that follows it is a **step** when it matches a step token (`scene` |
`subject` | `compose` | `composition` | `edit` | `text`), the **rewrite marker**
when it is `rewrite`, and the **fresh on-image copy marker** when it is
`image_content`; so the dashboard's `<brief_id> <step> rewrite` parses as step +
rewrite, and `<brief_id> text image_content` as step + fresh-batch marker.
Everything else arrives as a `key: value` pair (`stage:` / `change:` / `revise:` /
`product:` / `setup:`). Normalise `compose` → `composition` before dispatching, and
pass a bare `rewrite` or a bare `image_content` through unchanged. If a bare token
is none of those, **ask** rather than guessing — never silently drop it.

## What this is

`/ssc-image-prompt` is the **propose-only, ZERO-CREDIT** path to the ad and post
visual, and the **only** image path Cowork has. Authoring and generating are
separate acts, split across two surfaces:

- **This command** — it **authors the ImageStudio prompt + generation settings
  only** (plus, at the Text step, the on-image copy the prompt will place), for
  **both** the `ad` and `post` channels, and **spends no credits**. It saves, and
  stops.
- **The ImageStudio dashboard** — the human clicks **Generate**, which spends the
  fal credits, then **selects** a candidate "for next step". Both are operator
  actions; no Cowork command generates an image.

So use `/ssc-image-prompt` to draft and refine the per-step prompts +
model/control settings the studio Generate button will consume.

## What to do

This command is a **thin entry point — it holds no orchestration logic.** It
dispatches the single orchestrator **`ssc-image-prompt-agent`** (`brief_id`, plus
the optional step — positional or `stage:`, with `compose` normalised to
`composition` — and the optional `rewrite` / `image_content` markers / `change:` /
`revise:` / `product:` passthrough) and stops. It
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
a correction) to rewrite the active step's prompt, with `change:` to author another
Edit, or with a bare `image_content` on the Text step for a fresh batch of on-image
copy candidates.

**Text writes the words before it places them.** The Text step runs in **two
phases, separated by an approval in the workspace**. With no approved
`image_content` row on the brief, it **authors the on-image copy itself** — Vietnamese
candidates **fitted to the image that was actually selected** (the chain tip), judged
and saved as **drafts** — then stops and asks the operator to approve one in the
**Image Content** stage. Re-invoked with a row approved, it authors the placement
prompt that renders that exact Vietnamese string onto the finished image. Both phases
save drafts/prompts only: nothing is approved and no credit is spent. A bare
`image_content` marker (`/ssc-image-prompt <brief_id> text image_content`) asks for a
fresh batch of candidates at any point.

**Scene asks before it writes.** The Scene step reads the concept's **hero** (the
idea-wide north-star sentence) and **all approved copy**, then proposes **five
different scene setups** — a short Vietnamese title plus one sentence each — and
**waits for you to pick one**; only the chosen setup becomes a prompt, and **nothing
is saved until you choose**. Answer in chat, or re-invoke with `setup: <số | tiêu đề
| mô tả của bạn>`. Your own free-text setup is always a valid answer. A `revise:` /
`rewrite` on Scene rewrites the saved prompt while **keeping its setup** (no menu);
a plain `/ssc-image-prompt <brief_id> scene` proposes a fresh five.

**The five steps.**

- **`scene`** (Bối cảnh, backend layer `scene`) — a **text-to-image full image** that
  may **freely include a GENERIC subject and/or product**, takes **no real
  references**, and reserves **no** zones.
- **`subject`** (Người mẫu, backend layer `subject`) — the person generated **alone**,
  with **face + pose locked**; an anchor candidate.
- **`composition`** (Ghép, backend layer `composition`, generated by
  `generate_composition`) — the **anchor-gated compose-with-references** step, and the
  only step that brings in the real locked identity and the real packshot. It needs
  **≥1 anchor = a selected subject OR an approved product** (a selected Scene alone
  does **not** satisfy it) and composes the anchor(s) **onto** a selected Scene, else
  **builds around** them. This logic lives here — never folded into another step.
- **`edit`** (Chỉnh sửa, backend layer `edit`) — a generic, **repeatable** "what to
  change" prompt-to-edit over the chain tip.
- **`text`** (Tiêu đề, backend layer `text`) — **authors the on-image copy** fitted to
  the chain tip and saves it as `image_content` drafts for approval, then renders that
  **exact approved Vietnamese headline** over the chain tip.

**Grounding + prompt discipline.** Every step grounds its prompt in **all approved
contents of the brief for the resolved channel** (meaning + tone only). Never negate,
reserve nothing, and **never name a content string** in the Scene / Subject /
Composition / Edit steps — **`text` is the sole exception**, carrying the exact
approved Vietnamese headline.

Every step is optional: skip Scene →
Composition builds around the anchors from scratch; skip Subject and Composition →
an Edit or Text hangs off the Scene.

**Propose-only:** the agent and its skills **never** generate an image, approve,
upload, select a candidate, set a cover, publish, or spend credits. Generation,
selection and every approval are the operator's **ImageStudio** / workspace actions.
Each step's author holds only reads + `save_creative_prompt` for its own layer — the
Composition author saves `layer:'composition'`, no generate tool — and the Text author
additionally holds `save_content`, which **INSERTS DRAFT rows and approves nothing**.

**Channel:** resolved from the brief, never passed in. **`ad` and `post` both run
the full chain**; the only difference is which approved content sections exist to
ground on (ad: copy / headline / description; post: copy — plus, on either channel,
the `image_content` once the Text step has written one and the operator has approved
it) and which workspace the hand-off points at (`/ad/[month]/<idea_id>`
vs `/post/[month]/<idea_id>`). Any other channel — `youtube`, or a brief with no
channel — **stops cleanly** at the gate, writing nothing.
