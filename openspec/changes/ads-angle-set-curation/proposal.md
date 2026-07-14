## Why

An idea's set of angle briefs is now **durable production spine**, and nothing in the plugin can grow it or safely prune it.

Two facts, both verified live on **2026-07-14**:

1. **Server "Change 2" has shipped.** An idea carries **N approved angle briefs**, each with its own `angle_label`, each anchoring its **own** copy (`content.brief_id`) and its **own** creative chain (`creatives.brief_id`). Idea `BGerzuw4JrrSz3Qd` carries five.
2. **`ssc-ads-brief` still has a PRODUCE-ONCE guard.** `list_briefs` runs before any write; if it returns ≥1 brief the skill STOPS, writes nothing, and tells the operator that to regenerate they must *"discard ALL briefs in the dashboard first"*.

That guard was harmless when a brief was a throwaway handoff note produced once and consumed once. It is now wrong twice over:

- **There is no way to add a sixth angle**, or to replace angles the operator deliberately discarded. The operator's only path to *any* new angle is to destroy every existing one. That is a real, currently-blocked operator need — a concept that produced five angles in March cannot be given a fresh one in July without razing the March set.
- **"Discard all to regenerate" is the wrong tool, and it understates what deletion costs.** A brief is the anchor of its copy and its creatives. The skill's own remediation instruction points the operator at the single most destructive action available on the surface, while describing it as a routine reset.

Meanwhile the server's `delete(entity='brief')` semantics have not caught up with what a brief now *is*. Live today: a brief with creatives is **refused** (`brief_has_creatives`) — so the operator is told to delete each visual layer by hand first — and the brief's `content` rows are **unbound** (`content.brief_id ON DELETE SET NULL`), not removed. An orphaned copy row that can never be attributed to an angle is precisely the input that produces wrong-angle grounding downstream (the hazard the sibling change `ads-writer-brief-lineage` exists to prevent).

## What Changes

**Plugin — `/ssc.ads-brief` always APPENDS.**

- **BREAKING (behaviour):** the produce-once guard is **removed**. Every invocation proposes **NEW** angles; the skill no longer refuses to run because briefs exist.
- On invocation the skill reads **ALL** existing briefs for the idea (`list_briefs`, any status) and treats their angles — each `angle_label` plus its five narrative fields — as the **taken set**.
- It proposes only angles genuinely **DISTINCT** from every existing brief **and** from each other, extending across the existing set the same distinctiveness rule it already applies within one batch (each angle anchors a different persona trigger point / objection / myth, expressed through the concept).
- It **never pads**: if the concept + persona doc genuinely support no further distinct angle, it says so plainly and **writes nothing** rather than inventing a near-duplicate.
- It **never touches an existing brief** — no delete, no edit, no re-write, no re-score. Existing briefs (approved or draft) are read-only input. `delete` and `edit` MUST NOT appear in its `tools:` list.
- Cold start (no briefs yet) is **unchanged**: up to five angles, self-scored, dropped/regenerated until all ≥4, saved as DRAFT briefs. Propose-only is unchanged: `save_brief` mints DRAFTs; the skill never approves.
- The **"discard ALL briefs to regenerate" remediation is deleted outright** — regenerating angles is now what APPEND does. In its place the skill states, accurately, what deleting an angle costs, so an operator who *does* want to discard one knows the blast radius.

**Server — `delete(entity='brief')` semantics** (requirements for the BrandOS team; **this repo cannot implement them**):

- **Gate on approval (unchanged, keep it):** deleting an APPROVED brief is REFUSED (`brief_approved`) — un-approve it first. Un-approving requires the `approve` capability, so an agent (which holds only `edit`) can never reach the destructive path.
- **Otherwise allow, and CASCADE.** The current `brief_has_creatives` refusal is **REPLACED** by a cascade: the brief's `creatives` are HARD-deleted (each purging its media on the Go asset service — irreversible, cross-service), and its `content` rows (copy / headline / description / image_content) are **HARD-deleted**. This **REPLACES** today's `content.brief_id ON DELETE SET NULL` unbind. One transaction, individually audited, refusing atomically.
- **Capability escalates with blast radius:** a brief with **no** dependents may be deleted with `edit`; a brief **with** dependents requires **`approve`**. An `edit`-only caller attempting a cascading delete is refused (`forbidden`), writing nothing — which is what keeps a propose-only agent structurally unable to destroy produced work.
- **Refuse when the work is live:** if any of the brief's content rows is referenced by a live schedule entry, the whole delete is REFUSED and nothing is written.
- **Preflight:** the delete must be able to report what it WOULD destroy (counts of creatives, images, content rows) so the dashboard can show the operator the blast radius before an irreversible act.

## Capabilities

### New Capabilities

- `ads-angle-set-curation`: how an idea's **set** of angle briefs is **grown** (append — `/ssc.ads-brief` proposes only angles distinct from the taken set, never pads, never mutates an existing brief) and **pruned** (delete + cascade — approval-gated, capability-escalating, schedule-refusing, preflightable).

### Modified Capabilities

None. `ads-image-visual` is not touched: its brief-scoped copy gate, its single-brief announced fallback, and its multi-brief-no-lineage STOP all keep working unchanged — and the server cascade only makes them *more* reliable by removing the orphaned-row case rather than stranding it.

## Impact

- **Modified (plugin):** `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` — the produce-once guard (Step 2) becomes a taken-set read; Step 3's distinctiveness rule extends across existing briefs; the frontmatter `description`, Output, and Governance sections drop "produce-once" and gain "append-only, never mutates an existing brief"; the "discard all to regenerate" remediation is replaced with an accurate statement of what deletion costs.
- **Modified (plugin):** `plugins/ssc-content/commands/ssc.ads-brief.md` — the command's description and "After it runs" section restate the append semantics and drop the discard-to-regenerate instruction.
- **Not modified:** `ssc-ads-writer`, `ssc-image`, and every other skill. Nothing downstream changes shape: the writer still takes ONE `brief_id`, the image skill still anchors on ONE `brief_id`.
- **Requires a server change (BrandOS, out of this repo):** the `delete(entity='brief')` cascade + capability escalation + schedule refusal + preflight. Until it ships, the plugin's new prose describes the *current* server behaviour honestly; the delta spec's server requirements are the handoff contract.
- **Governance invariant preserved:** the skill remains propose-only. It gains no destructive tool — appending is the *only* way it changes an idea's angle set, and the operator remains the sole actor who can approve or destroy one.
- **No automated tests** exist in this repo; verification is by review plus a live `list_briefs` read before/after an append confirming the existing rows are untouched and the new rows are distinct.
