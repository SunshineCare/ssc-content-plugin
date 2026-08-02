## Why

The quarterly strategy brief now carries a market-sophistication read
(`sophisticationStage` + `sophisticationRead`), and the head carries it down — but
the Posts channel, alone among the channels, never holds either field, so a
month's organic guidance is written with no view of what the market has already
heard. In the same place, `craft/doctrine` §2 makes a mechanism mandatory before
an idea may be proposed, yet nothing upstream of `ssc-post-ideate` supplies one:
the Ads channel gets its supply from `ssc-ads-approaches` (a voice-of-customer
pass feeding a candidate-mechanism list), and Posts has no equivalent step. The
two are one change because the sophistication read is what decides whether a
candidate mechanism is worth proposing at all.

## What Changes

- **New shared skill `ssc-approaches-core`** — view-only, holds no mutation tool,
  reads no plan state. Callers pass the head hand-downs and the quarter brief
  they already read; it returns three blocks: the inherited sophistication read
  (or `NOT STATED`, never derived), a per-persona voice-of-customer pass with
  every quote attributed, and a candidate-mechanism supply where each candidate
  carries its proof route and how indirect it forces the lead to be.
- **`ssc-ads-approaches` refactored onto the core** — its inline sophistication
  hold, voice-of-customer pass and candidate-mechanism step become one dispatch.
  Behaviour-preserving: the persisted document keeps its current shape.
- **`ssc-post-approaches` consumes the core** with `channel='post'`, which binds
  candidates and quotes to `rules/organic-vs-paid-firewall` and refuses any
  ad-sourced line. Its persisted doc grows from five sections to seven, and the
  length budget rises from ~1700 to ~2400 Vietnamese tokens.
- **`ssc-post-ideate` draws on the supply** — round 2 carries a supply mechanism
  where a title matches one, round 3 settles the rest and reports any off-supply
  mechanism as off-supply; round 3's declared awareness stage must clear the
  inherited sophistication bar.
- **`ssc-post-schedule` sequences against the read**, taking it from the
  `plan.context` it already fetches for its gate check.
- **Wiring**: `orchestrates:` updated on `ssc-post-agent` and `ssc-ads-agent`,
  `/ssc-post-plan` and root `CLAUDE.md` updated, `plugin.json` version bumped in
  the same commit, ChatGPT bundle republished.
- No server change: every field read already exists on the BrandOS surface.
- No breaking change: no command renamed, no gate added or moved, no tool
  retired.

## Capabilities

### New Capabilities

- `approaches-shared-core`: the shared, channel-agnostic Approaches core — what
  it returns, what it refuses to decide, its propose-only and no-plan-state
  construction, the single channel conditional, and the rule that both channel
  Approaches skills consume it rather than carrying a second copy of the prose.
- `post-plan-sophistication-inherit`: the market-sophistication read threaded
  through the three Posts steps — inherited never derived, applied once in the
  Approaches doc, enforced as a bar on the declared awareness stage at Ideate,
  used to sequence the month at Schedule, and reported as a gap (with no bar and
  no sequencing claim) when the quarter states none.
- `post-mechanism-supply`: the candidate-mechanism supply for the Posts channel —
  where a candidate comes from, what it must carry (attributed voice-of-customer
  item, proof route, indirectness), what disqualifies it, and how Ideate draws on
  it, including that an off-supply mechanism is allowed but named as off-supply.

### Modified Capabilities

None. `persona-context-grounding` already governs the persona detail-doc reads
the new core performs, and its requirements are unchanged by this work. The
`ads-*` specs govern brief, copy and image authoring, not the Approaches step, so
the Ads refactor changes no existing requirement. `strategy-read-authoring` owns
who authors the sophistication read; this change only consumes it.

## Impact

- `plugins/ssc/skills/ssc-approaches-core/SKILL.md` (new)
- `plugins/ssc/skills/ssc-ads-approaches/SKILL.md` (refactor, behaviour-preserving)
- `plugins/ssc/skills/ssc-post-approaches/SKILL.md`
- `plugins/ssc/skills/ssc-post-ideate/SKILL.md`
- `plugins/ssc/skills/ssc-post-schedule/SKILL.md`
- `plugins/ssc/agents/ssc-post-agent.md`, `plugins/ssc/agents/ssc-ads-agent.md`
- `plugins/ssc/commands/ssc-post-plan.md`, root `CLAUDE.md`
- `plugins/ssc/.claude-plugin/plugin.json` (version bump, same commit)
- `chatgpt/workflows.json` (regenerated) and its mirror in the `content` repo —
  a separate repo, so the mirror commit and the brandos-express deploy are
  operator actions this change only names
- No BrandOS server change, no schema change, no new MCP tool
