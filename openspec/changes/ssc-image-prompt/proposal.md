## Why

Brand OS's **ImageStudio** builds an ad visual through five per-brief stages
(`background → subject → model/Scene → composite → text`), each carrying a
human-editable, versioned **scene prompt + generation settings**
(`creative_prompts.body` + `generation_config`). Generation is a human click and
candidate selection is a human curation act — but there is **no propose-only agent
that authors those per-stage prompts + model/control settings**. Operators
hand-write every stage's prompt and pick models/controls themselves. This change
adds an agent that drafts them (zero fal credits), so operators review, Generate,
and select in the studio.

## What Changes

- **New thin command `/ssc.image-prompt <brief_id>`** (brief-keyed; the idea is
  resolved from the brief via `get_brief`). Optional `stage` and `revise:` args.
- **New `ssc-image-prompt-agent`** — a state-driven, next-open-stage stepper
  (parity with `ssc-ads-agent`): authors exactly one stage's prompt +
  `generation_config`, saves it via `save_creative_prompt`, and **STOPS** at that
  stage's human Generate/select gate.
- **Five new stage-skills**, one pipeline step each, mapped to the real studio
  layers: `background`, `subject` (person alone — face + pose locked, outfit/style
  suited to the selected background), `scene` (persists `layer:'model'` — composes
  subject into background), `composite` (product), `text` (exact headline).
- **Propose-only, zero-credit** — the agent/skills hold reads + `save_creative_prompt`
  only; **no** generate / approve / upload / select / cover / budget / publish tool.
- **Kept ALONGSIDE the existing `/ssc.image`** (the credit-spending direct
  generator) — this is a separate command, **not** a replacement (operator's
  explicit "keep both" choice).
- Prompt discipline carried verbatim: **never negate; reserve space in the
  positive; never name a copy string in stages 1–4**, with the deliberate exception
  that **stage 5 (text) renders the exact approved headline**.

## Capabilities

### New Capabilities
- `ads-image-prompt-authoring`: the propose-only, 5-stage ImageStudio
  prompt-and-settings authoring pipeline — the command, the state-driven agent, and
  the five stage-skills, including the next-open-stage state machine, per-stage
  grounding + model/control selection, the layer-key mapping (`-scene → 'model'`,
  `product` never a prompt layer), and the zero-credit / never-name-copy invariants.

### Modified Capabilities
<!-- None. The existing `ads-image-visual` capability (the credit-spending
     /ssc.image generator) is intentionally untouched — both commands coexist, so
     no spec-level requirement of ads-image-visual changes. -->

## Impact

- **New plugin prose files** under `plugins/ssc-content/`: 1 command, 1 agent, 5
  skill directories (`SKILL.md` each). No existing file is modified except the new
  agent's `orchestrates:` wiring.
- **No `plugin.json` / `.mcp.json` change** — same BrandOS MCP surface
  (`https://ssc.sunshinecare.vn/bos/mcp`); no new server.
- **MCP tools used** (all must exist on the live `ssc` surface): reads —
  `get_brief`, `get_idea`, `list_briefs`, `list_content`, `list_creatives`,
  `list_creative_prompts`, `get_knowledge`, `list_gallery_media`; write —
  `save_creative_prompt` (with `generation_config`).
- **Deployment dependency:** the backend `subject` / `model`-as-Scene layers and
  the `save_creative_prompt` `generation_config` extension (content-repo
  `image-control-pipeline` + `image-subject-layer`, both complete) must be **live on
  the deployed BrandOS server** before this ships; the skills STOP cleanly if the
  server rejects a layer.
- **Governance hook** (`hooks/approval-gate.mjs`) already denies `approve_*` from any
  subagent — the new agent id is covered with **no hook change**.
