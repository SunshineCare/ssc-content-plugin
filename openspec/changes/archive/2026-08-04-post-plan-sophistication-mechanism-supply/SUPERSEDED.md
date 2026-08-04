# Superseded — what of this change reached the main specs

`mechanism-moves-to-the-brief` (archived 2026-08-04) owns the mechanism. It is settled at
the **angle brief**, bank-first from the `mechanisms` table, and lives in
`briefs.mechanism` alone. Approaches supplies only the attributed voice-of-customer
material that mechanism must stand on; `ssc-approaches-core` holds no bank tool, returns
**two** blocks (six fixed fields), and `bank_id` / `in_bank` do not exist. The current law
is `openspec/specs/angle-mechanism-authoring/spec.md` and
`openspec/specs/mechanism-bank/spec.md`.

The delta specs under `specs/` are the historical record of what this change specified and
are left unchanged. This file records which of them were synced into `openspec/specs/`.

## `post-mechanism-supply` — NOT synced

All seven requirements describe candidate-mechanism supply authored at Posts Approaches and
settled at Ideate. Both are now the angle brief's. Syncing them would put a spec in the
main set that contradicts `angle-mechanism-authoring`.

| Requirement | Replaced by |
|---|---|
| Posts Approaches authors the period's candidate-mechanism supply | `angle-mechanism-authoring` — "The angle brief authors its own mechanism, and nothing is inherited" + "The mechanism is settled bank-first from the `mechanisms` table" |
| Every candidate carries an attributed voice-of-customer item | `angle-mechanism-authoring` — "The mechanism is grounded in an attributed voice-of-customer item from the approved Approaches document"; the doctrine read is §2 at the brief |
| Every candidate carries a proof route drawn from the period's stated proof inventory | `angle-mechanism-authoring` — "The mechanism is proof-routed from the period's inventory and dropped when compliance refuses its only route" |
| Each candidate states how indirect the lead must be | `angle-mechanism-authoring` — same proof-routing/judgement requirement; indirectness is judged at the brief against the inherited read |
| A candidate whose only proof route is refused by the compliance rules is not proposed | `angle-mechanism-authoring` — "…dropped when compliance refuses its only route" (drop, never soften or re-trace) |
| Ideate's title round carries a supply mechanism where one matches | `angle-mechanism-authoring` — "Ideate touches no mechanism at all" |
| Ideate's angle round settles the mechanism from the supply and names any off-supply choice | `angle-mechanism-authoring` — "Ideate touches no mechanism at all"; provenance is reported by "Every run reports the mechanism and its provenance, and provenance is report-only" |

## `approaches-shared-core` — synced, 8 of 9

Now at `openspec/specs/approaches-shared-core/spec.md`.

**Omitted:** "The core returns three blocks and nothing else" — the core returns two blocks
in a fixed six-field shape. The surviving block-shape rule is `mechanism-bank`'s "The core
still holds no mutation tool and enforces no quota".

**Corrected as copied:**

1. "The core refuses the decisions that belong to its caller and to the operator" — the
   trailing "It SHALL propose candidates and report gaps only." and the scenario
   *Candidates are proposed, never chosen* are dropped. Every other refusal stands.
2. "`channel` is the core's only conditional" — the `post` binding covers quoted lines
   only, not "every candidate mechanism and every quoted line".
3. "Governing documents are named, read live, and a failed read stops the run" — the named
   list is `craft/doctrine` §6 (explicitly not §2's mechanism definition), the persona
   index and each listed persona detail doc, the banned-words document, and
   `rules/organic-vs-paid-firewall` for `channel='post'` only. The proof-point families
   and the compliance document are dropped; those reads belong to the brief step.

## `post-plan-sophistication-inherit` — synced, all 5

Now at `openspec/specs/post-plan-sophistication-inherit/spec.md`.

**Corrected as copied:** "Schedule sequences the month against the read from the response
it already holds" — the blanket "It SHALL add no knowledge-base read and no new tool."
is narrowed to a knowledge-base read only, in the requirement body and in the *The read
comes off the existing fetch* scenario. `ssc-post-schedule` declares `list_briefs` and
calls it for the indirect-first sort key, per `angle-mechanism-authoring`'s "Producers read
`brief.mechanism` alone and invent nothing".
