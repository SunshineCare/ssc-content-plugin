## Why

The BrandOS server dropped `ideas.mechanism`, moved the approval gate to
`approve(entity='brief')` for `ad`/`post`, and promoted the mechanism bank out of the
`craft/mechanism-bank` document into a `mechanisms` table with its own three MCP
tools. The plugin's prose — and two of its own specs — still describe a mechanism
that is settled on the idea, inherited by every angle, and overridable under bounded
conditions, drawn from a bank read as a knowledge document. Every run now cites
doctrine that contradicts the server it is calling.

## What Changes

- **BREAKING**: The mechanism is **authored at the angle brief**, not settled on the
  idea. There is no inheritance and no override — so the *angle-local override*
  capability is removed outright rather than amended.
- **BREAKING**: The bank is the `mechanisms` table, read with `list_mechanisms` /
  `get_mechanism` and written with `save_mechanism` (mints `draft` only).
  `craft/mechanism-bank` §3 stops being a source of entries.
- `ssc-brief-core` becomes the mechanism's author: bank-first, grounded in an
  attributed voice-of-customer item from the approved Approaches document,
  proof-routed from the period's inventory, dropped on a compliance refusal. It
  gains the two bank reads and still holds no mutation tool.
- `ssc-ads-brief` passes `mechanism` on every `save_brief`; `ssc-post-ideate`
  round 3 writes it with `edit(entity='brief')`.
- Ideate stops touching mechanisms entirely — no supply match, no `¼`/`⅓` caps, no
  mechanism-keyed approvability verdict. Round 2 deliberately withholds
  `detail.mechanism` at mint, because a non-blank one mints the post brief
  `approved` and a skill must never self-approve.
- `ssc-approaches-core` (and both channel Approaches skills) drop the
  candidate-mechanism supply and the `in_bank` marker; the voice-of-customer pass
  stays and becomes the sanctioned source of a brief's attributed quote.
- Producers (`ssc-ads-writer`, `ssc-post-produce`, `ssc-post-authority`) delete the
  override-first resolution table and read `brief.mechanism` alone;
  `ssc-post-schedule` moves its sort key from `list_ideas` to `list_briefs`.
- `ssc-kb-mechanism-harvest` is rewritten against the table: `save_mechanism` drafts
  for genuinely new mechanisms, bounded in-place `edit(entity='mechanism')` for
  near-duplicates, and it absorbs the period mix audit (concentration + valence).
- Two KB documents are revised by proposal: `craft/doctrine` → 1.2 and
  `craft/mechanism-bank` → 1.2.

## Capabilities

### New Capabilities

- `angle-mechanism-authoring`: the angle brief authors its own mechanism bank-first
  and is not approvable without one; grounding, proof-routing, reporting, and the
  one-angle-one-mechanism guarantee restated without inheritance.

### Modified Capabilities

- `mechanism-bank`: the bank is a table with three tools and an approved-only read
  default, not a KB document section; the supply leaves Approaches; harvest writes
  drafts and bounded in-place edits instead of knowledge revisions, and owns the
  usage-mix audit that Ideate used to enforce.
- `angle-mechanism-override`: removed. Inheritance and the bounded override it
  qualified no longer exist, so every requirement in it is withdrawn rather than
  rewritten.

## Impact

- **This repo**: 12 skills, 3 agents, 2 commands, `.claude-plugin/plugin.json`
  version bump, regenerated `chatgpt/workflows.json`.
- **BrandOS data**: two `propose_knowledge_revision` submissions awaiting chị Kiều
  My's approval. No skill writes the live KB.
- **`content` repo**: one generated file — the ChatGPT bundle mirror
  `mcp-server/lib/brandos/workflows/workflows.json`. No source change; the server
  work has already shipped.
- **Governance**: the hook and its matchers are untouched — `briefs.mechanism` is an
  ordinary field. The one deliberate loosening is harvest's bounded in-place edit of
  an approved bank entry, which is the sole live-supply write a skill performs
  without a proposal.
- **Design source**: `docs/superpowers/specs/2026-08-03-mechanism-moves-to-the-brief-design.md`.
