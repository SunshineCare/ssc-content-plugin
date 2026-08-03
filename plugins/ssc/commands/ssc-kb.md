---
argument-hint: '[focus] [review|audit|revise|harvest] [period]'
description: Launch the Cambridge Diet Vietnam Knowledge-base health cycle — review → audit → research → revise/gap-fill, plus harvest (grow the standing mechanism bank — the BrandOS `mechanisms` table — from the mechanisms a period's BRIEFS settled, drafting the genuinely new ones in, sharpening near-duplicates in place under bounds, and reporting the period's mechanism mix). Knowledge-document revisions stay propose-only and a harvested bank entry is a DRAFT, not supply; nothing is approved, promoted or published automatically.
metadata:
  dispatches: [ssc-kb-agent]
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs:

- **Focus** (`focus`, optional) — a KB area to concentrate on (e.g. `rules`, `ad`, `voice`).
- **Mode** (`mode`, optional) — `review` (default), `audit`, `revise`, or `harvest`.
- **Period** (`period`, optional) — only for `mode: harvest`, e.g. `2026-08`.
- **The period's approved Approaches document** (`mode: harvest` only) — **required for anything to be drafted into the bank.** A new entry's `fits` comes from the attributed voice-of-customer item the mechanism was grounded in, and its `proof_family` from the proof route it was traced to; both live in that document's prose, and no tool in the harvest path can fetch it — so paste it (or its voice-of-customer section) alongside the `period`. Without it the run **names the gap and drafts nothing** for those mechanisms; it never invents a `fits` or a `proof_family`.

If no input is given, run a full-surface `review` pass.

## What to do

This command is a thin entry point — it holds **no** orchestration logic.
Dispatch the **`ssc-kb-agent`**, passing `focus`/`mode`/`period` if provided. The agent
runs the knowledge-base health cycle and stops at the human gate.

| Mode | The agent does | Then the operator… |
|---|---|---|
| **review** | Scans the KB for contradictions, stale guidance, gaps, angle drift | Reviews findings in the **Knowledge dashboard** |
| **audit** | Verifies each claim in `rules/`/`ad/`/`winners/` traces to evidence | Reviews flagged claims, decides cite-or-remove |
| **revise** | Drafts propose-only revisions + gap-fill candidates | **Approves** revisions in the **Knowledge dashboard → Proposals** tab |
| **harvest** | Standalone branch. Reads a `period`'s **briefs**, diffs the mechanisms they settled against the mechanism bank (the `mechanisms` table) read live, **drafts** each genuinely new one in with `save_mechanism`, **sharpens** a near-duplicate in place — bounded to content fields, never `status`, never `slug`, sharpening never repurposing, every edit reported before/after — and **reports the period's mechanism mix** (per-mechanism concentration, negative-valence share). Needs the period's **approved Approaches document** supplied, or it names the gap and drafts nothing | **Approves** each drafted bank entry in the **Knowledge dashboard** — a draft is not supply until then — and reverts any in-place sharpening they disagree with, from the run's before/after report. Mix breaches are the operator's to correct, on briefs **not yet approved** |

## Governance

Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either
direction — never call `approve` (the ONLY gated promotion; the approval
hook denies it to agents, any entity, any gate), and never publish. Demotion
is an `edit`, so the ban lives here: never use `edit` to demote, unapprove,
discard, or reject a row.
Never edit or delete operator-curated or approved rows: the generic
`edit`/`delete` verbs may target ONLY draft rows this skill itself created
in the current run. Everything else belongs to the operator in the
dashboard. Every revision ends at a human gate
in the Knowledge dashboard. Running requires `edit`; approving a revision
requires `approve`.

Harvest is the **one bounded exception** to that last rule, and it is deliberate: it may
sharpen an **approved bank entry** in place with `edit(entity='mechanism')` — content
fields only, never `status`, never `slug`, sharpening never repurposing, and every edit
reported with its before and after. It still flips no gate. Its other write,
`save_mechanism`, can only mint a `draft` (it takes no `status`), and the bank's supply
read returns approved entries only — so nothing a run drafts is readable as supply until a
human approves that row. Harvest holds no `approve` and no `unapprove`, so it cannot
promote its own draft; its only writes are `save_mechanism` and
`edit(entity='mechanism')` on the `mechanisms` table; it writes no usage history and
retires nothing — a weak entry is a reported finding. The mix audit is **report-only**: it
names breaches, re-mechanises nothing, re-opens nothing and edits no brief.

## After it runs

Point the operator to the **Knowledge dashboard → Proposals** tab for the revision
proposals. After a `harvest`, point them instead at the **mechanism bank** in the Knowledge
dashboard — the drafted entries waiting on their approval — plus the run's before/after
list for every entry sharpened in place, and its period mix report.
