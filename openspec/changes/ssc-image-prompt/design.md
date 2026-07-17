## Context

Brand OS builds an ad visual through the **ImageStudio**, a per-brief pipeline of
five layers each carrying a human-editable, versioned scene prompt +
`generation_config`. The mutation surface is propose-vs-generate split:
`save_creative_prompt` records a prompt + settings (propose-only), while `generate_*`
/ `compose_ad_visual` / `generate_text_layer` and candidate selection are **human**
studio actions. The five layers (content repo `image-control-pipeline` +
`image-subject-layer`, both complete) are:

| # | `layer` key | Studio label | Kind |
|---|---|---|---|
| 1 | `background` | Background / *Nền* | text-to-image |
| 2 | `subject` | Subject / *Người mẫu* | text-to-image / identity (face + pose locked) |
| 3 | `model` | **Scene / *Ghép người*** | reference edit (compose subject into background) |
| 4 | `composite` | Product / *Sản phẩm* | control edit |
| 5 | `text` | Text / *Tiêu đề* | text-render |

The full design rationale lives in the brainstorm spec
`docs/superpowers/specs/2026-07-17-ssc-image-prompt-design.md`; this document
records the decisions that shape the plugin artifacts.

## Goals / Non-Goals

**Goals:**
- A propose-only, zero-credit `/ssc.image-prompt <brief_id>` pipeline: a thin
  command → a state-driven `ssc-image-prompt-agent` → five stage-skills that author
  each layer's prompt + `generation_config` and STOP at each human gate.
- Author the FULL `generation_config` (model + capability-matched control/identity
  settings + named refs when resolvable), not just prose.
- Carry the existing prompt discipline verbatim (never negate; positive reservation;
  never name copy in stages 1–4; stage 5 renders the exact headline).

**Non-Goals:**
- No rewrite or removal of the existing credit-spending `/ssc.image` (kept alongside).
- No generate / approve / upload / select / cover / budget / publish from any new
  skill or agent.
- No backend, `plugin.json`, or `.mcp.json` change; no non-ad channels (phase 1).

## Decisions

**1. New command, kept alongside `/ssc.image` (not a rewrite).**
The operator explicitly chose to keep both. `/ssc.image` stays the credit-spending
direct generator; `/ssc.image-prompt` is the zero-credit studio-prompt author. Each
frontmatter description names which it is. *Alternative rejected:* rewrite `ssc.image`
per content-repo Phase E — declined so the working generator is not disturbed while
the studio UI settles. Accepted tension: two image commands, one credit-spending.

**2. Brief-keyed (`brief_id` only), idea resolved via `get_brief`.**
Matches the newer `/ssc.ads-produce <brief_id>` convention; `get_brief` returns
`{ brief, idea }` so no `idea_id` input is needed. *Alternative rejected:* the older
`<ideaId> <briefId>` two-arg form (redundant now).

**3. One agent + five stage-skills (one skill per stage).**
Idiomatic three-layer dispatch (command → agent → skills), mirroring
`ssc-ads-agent`'s one-skill-per-step orchestration, giving per-stage isolation for
the genuinely different prompt craft of each layer. *Alternative rejected:* a single
state-machine skill (fewer files but one large skill carrying all five stages).

**4. State-driven, next-open-stage stepper.**
Each invocation authors exactly one stage — the first with no selected-for-next
candidate — and STOPs. This is the only shape where stages 2–5 are grounded in the
*actual selected* prior output (subject matched to background; scene composing the
chosen subject; composite naming the real packshot; text rendering the approved
headline). *Alternative rejected:* one-shot author-all-five (ungrounded later stages).

**5. `-scene` skill persists `layer:'model'`; `product` is never a prompt layer.**
The backend layer key `model` *is* the Scene (composition) step; the person is
`subject`. The skill is named `-scene` for clarity but saves `layer:'model'`, and
documents the mapping prominently. `product` is an upload-only input to the composite
stage and `save_creative_prompt` rejects it. *This naming is load-bearing* — the
single easiest thing to get wrong.

**6. Face + pose locked at `subject`, coherent with the background.**
The identity models (PuLID / Dev General) live at `subject`, upstream of placement, so
identity and pose are decided there; Scene (`model`) is reference-edit only (Kontext
Pro). The subject is generated ALONE on a simple ground (clean cut-out) but its outfit,
wardrobe, palette, and light are authored to suit the *selected* background, so Scene
composes as one photograph. Strict stage order guarantees the background is selected
before `subject` is authored.

**7. Propose-only governance held by three layers.**
Server `approve` capability, the `approval-gate.mjs` hook (denies `approve_*` from any
subagent — the new agent id needs no hook change), and prose in every skill/agent.
The `tools:` lists carry reads + `save_creative_prompt` only.

## Risks / Trade-offs

- **[Layer not yet live on the deployed server]** → each skill STOPs cleanly in
  Vietnamese ("server chưa hỗ trợ layer này") and writes nothing; ship only after a
  live read-only probe confirms `save_creative_prompt(layer:'subject')` is accepted.
- **[`model`-key vs Scene-label confusion]** → mitigated by the `-scene` skill name +
  an explicit mapping note in every relevant skill and in the spec.
- **[Two image commands confuse operators]** → each command's frontmatter states its
  nature (credit-spending generator vs zero-credit prompt author); they share no state.
- **[Naming a copy string leaks it into the image]** → Rule 1 (never name copy) in
  stages 1–4, with stage 5 the single deliberate exception; carried verbatim from
  `ssc-image`.
- **[Unresolvable identity/product reference]** → author `body` + `model`, leave the
  ref unset, and tell the operator to attach it in the studio (never guess a pool id).

## Migration Plan

1. Confirm the backend `subject` / `model`-as-Scene layers + `save_creative_prompt`
   `generation_config` are **deployed** to the live BrandOS server (read-only probe).
2. Add the command, agent, and five skills; register the skills in the agent's
   `orchestrates:`. No change to `plugin.json` / `.mcp.json`.
3. Validate: exercise `approval-gate.mjs` with `agent_id: ssc-image-prompt-agent`
   (subagent → deny); confirm every referenced tool exists on the surface; confirm
   `/ssc.*` cross-refs resolve; confirm each skill's `layer` mapping.
4. Rollback: the pipeline is additive prose — removing the six new files (and the
   `orchestrates:` line) fully reverts it; `/ssc.image` is unaffected throughout.

## Open Questions

- Exact `list_gallery_media` filter/args to locate an identity photo (`kind:subject` /
  face facets) vs a product packshot (`kind:product`) so refs are named reliably.
- Whether `subject` defaults to an identity model whenever any face photo is in the
  pool, or only when one is clearly the intended model (default: only when clearly
  intended; else text-to-image + persona description).
- Whether pose control at `subject` (`flux-general` + `controlType:'pose'`) is authored
  proactively or left as an operator opt-in (default: opt-in).
