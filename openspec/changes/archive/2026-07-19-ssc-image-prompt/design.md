## Context

Brand OS builds an ad visual through the **ImageStudio**, a per-brief chain of steps
each carrying a human-editable, versioned scene prompt + `generation_config`. The
mutation surface is propose-vs-generate split: `save_creative_prompt` records a prompt
+ settings (propose-only), while the generate tools and candidate selection are
**human** studio actions.

**The pipeline was restructured mid-implementation.** The original design shipped a
five-stage chain (`background → subject → model/Scene → composite → text`) in which the
Background stage authored an *empty plate* reserving two voids (a text zone and a
subject zone). That was the core defect: nothing anchored the composition, so the model
treated the reserved planes as the subject and built architecture to satisfy them. The
restructure (a) inverted the emphasis so an anchored, complete image is generated rather
than an empty plate, and (b) deleted the reserved-zone geometry entirely. A subsequent
change unified the layer vocabulary so the skill name, the studio label, and the backend
`layer` key all agree.

### The shipped five-step chain (all steps OPTIONAL)

| # | Step | Skill | `layer` | Role |
|---|---|---|---|---|
| 1 | Scene / *Bối cảnh* | `ssc-image-prompt-scene` | `scene` | text-to-image full image; may depict a **generic** subject/product; **no real references** |
| 2 | Subject / *Người mẫu* | `ssc-image-prompt-subject` | `subject` | standalone person; face + pose locked here |
| 3 | Composition / *Ghép* | `ssc-image-prompt-composition` | `composition` | **anchor-gated** reference-edit bringing the real anchors in |
| 4 | Edit / *Chỉnh sửa* | `ssc-image-prompt-edit` | `edit` | generic, repeatable change over the chain tip |
| 5 | Text / *Tiêu đề* | `ssc-image-prompt-text` | `text` | renders the exact approved headline |

Lineage is the **chain tip** — the nearest previous selection walking
`['edit','composition','subject','scene']`, optional steps transparent. `product`
remains an upload-only input, never a prompt layer.

## Goals / Non-Goals

**Goals:**
- A propose-only, zero-credit `/ssc.image-prompt <brief_id>` pipeline: a thin command →
  a state-driven agent → five step-skills that author each layer's prompt +
  `generation_config` and STOP at each human gate.
- Author the FULL `generation_config` (model + capability-matched control/identity
  settings + named refs when resolvable), not just prose.
- Generate **anchored, complete images** — never empty plates built around voids.

**Non-Goals:**
- No rewrite or removal of the existing credit-spending `/ssc.image`.
- No generate / approve / upload / select / cover / budget / publish from any skill or agent.
- No backend, `plugin.json`, or `.mcp.json` change; no non-ad channels (phase 1).

## Decisions

**1. New command, kept alongside `/ssc.image`.** `/ssc.image` stays the credit-spending
direct generator; `/ssc.image-prompt` is the zero-credit prompt author. Accepted
tension: two image commands, one credit-spending.

**2. Brief-keyed (`brief_id` only).** `get_brief` returns `{ brief, idea }`, so no
`idea_id` input. Matches `/ssc.ads-produce`.

**3. One agent + five step-skills.** Idiomatic three-layer dispatch, mirroring
`ssc-ads-agent`, giving per-step isolation for genuinely different prompt craft.

**4. State-driven, next-open-step stepper; every step optional.** Each invocation
authors exactly one step and STOPs. Steps are skip-transparent, so the chain tolerates
a missing Scene, Subject, or Edit — downstream steps resolve their parent by walking
back to the nearest previous selection rather than assuming a fixed predecessor.

**5. Scene is a complete image, not an empty plate.** *(The core fix.)* Scene is
text-to-image only — it takes **no** anchors or identity models — but it MAY freely
depict a **generic** subject and/or product. Anchoring the frame with a described person
is what makes the composition coherent; the empty space becomes depth the model creates
rather than a plane it must clear. Scene never fabricates the real branded packaging.

**6. Reserved zones deleted end-to-end.** *(The second fix.)* The reserved text zone and
subject zone are gone. The Text step renders onto a naturally clean area of the finished
image via a deterministic, diacritic-safe overlay, which needs **no pre-cleared plane** —
so the text requirement no longer propagates backwards and dictates the room's walls.
Text headroom is at most an optional positive framing choice.

**7. Composition is anchor-gated.** It requires ≥1 anchor — a selected `subject` OR an
approved `product`. A selected Scene ALONE does not satisfy the gate (there is nothing
to compose). With a Scene it composes anchors onto it; without, it builds around them.
This is where the *real* identity and the *real* packshot enter the chain.

**8. Unified layer vocabulary.** Skill name == studio label == `layer` key
(`scene`/`subject`/`composition`/`edit`/`text`), removing the previous three-names-per-step
confusion. Paired with the backend rename; pre-rename rows still carry the old values.

**9. Propose-only governance held by three layers.** Server `approve` capability, the
`approval-gate.mjs` hook, and prose in every skill/agent. `tools:` carry reads +
`save_creative_prompt` only.

**10. Selected-image prompts read from provenance.** A step grounding on a selected
parent reads `media.provenance.prompt` (immutable per-image record), not any creative-row
field — the `generation_prompt` column no longer exists.

## Risks / Trade-offs

- **[Backend deployment lags the content repo]** → each skill STOPs cleanly in Vietnamese
  and writes nothing when a layer/config is rejected; ship only after verifying the live
  tool schemas.
- **[Two image commands confuse operators]** → each command's frontmatter states its
  nature; they share no state.
- **[Naming a copy string leaks it into the image]** → never-name-copy holds for every
  step, with Text the single bounded exception.
- **[Unresolvable identity/product reference]** → author without the ref and tell the
  operator to attach it in the studio; never guess a pool id.
- **[Changing an upstream selection strands downstream steps]** → a staleness warning is
  surfaced (warn, never block), since Generate/select happen in the studio regardless.

## Migration Plan

1. Verify the deployed BrandOS server accepts the unified layer enum
   (`scene`/`subject`/`composition`/`edit`/`text`) — confirmed live 2026-07-19.
2. Ship the command, agent, and five skills; register the skills in the agent's
   `orchestrates:`. No `plugin.json` / `.mcp.json` change.
3. Validate: exercise `approval-gate.mjs` with `agent_id: ssc-image-prompt-agent`;
   confirm every referenced tool exists; confirm `/ssc.*` cross-refs resolve; confirm
   each skill's `layer` mapping and that no skill saves `layer:'product'`.
4. Rollback: the pipeline is additive prose — removing the new files (and the
   `orchestrates:` line) fully reverts it; `/ssc.image` is unaffected throughout.

## Open Questions

- Exact `list_gallery_media` filters to locate an identity photo vs a product packshot
  reliably enough to name `identityRef` / `controlSourceRef` without guessing.
- Whether pose control at Subject is authored proactively or left an operator opt-in
  (current default: opt-in).
