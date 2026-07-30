# What a brief must carry for a framework to execute

Type: grilling
Status: resolved
Blocked by: 05
Parent: ../map.md

## Question

A brief today carries five narrative fields, an angle label, a persona, a route, an
awareness stage and a declared media layer. Under the chosen spine, what must a brief
carry so the writer can execute a framework rather than improvise one?

Work out which fields are doctrine-bearing (lead type, promise, proof obligation,
objection being answered, the mechanism claimed, the register) versus decorative, what
becomes required, what gets dropped, and what constrains the writer versus what merely
informs it. Say plainly which of these the current BrandOS `save_brief` shape cannot
express — that list is the recommendation a later effort takes to the `content` repo.

## Answer

Schema checked live rather than assumed. `save_brief` today carries `hook_direction`,
`core_message`, `why_now`, `story_moment`, `cta`, `angle_label`, `persona_term_id`,
`route_term_id`, `target_layer_term_id`, `awareness_stage`, `score`, `comment`. `save_content`
carries `body`, `score`, `comment`, `section`, `format`, `brief_id`. **Two things the doctrine
needs have nowhere to go**: the mechanism, and the per-asset record of which coverage choices
an asset made.

**Doctrine-bearing vs decorative.** A field is doctrine-bearing if a downstream stage is
*constrained* by it, not merely informed:

| Field | Verdict |
|---|---|
| `persona_term_id`, `route_term_id` | Bearing — decide hook and body |
| `awareness_stage` | Bearing — decides which **lead types** are admissible |
| `target_layer_term_id` | Bearing — decides the close's job, the tone, and the KPI ([15](./15-layer-vs-spine.md)) |
| **mechanism** | Bearing, and **missing** — the mandatory beat has no home |
| `hook_direction`, `core_message` | Bearing — the angle's substance |
| `cta` | Demoted to *direction only* — the layer's rule already governs what the close may ask for, so `cta` must never contradict it |
| `story_moment`, `why_now` | Informing, not constraining — keep, but nothing may be gated on them |
| `angle_label` | Bearing as identity — it is how a human recognises the angle |

**1. The mechanism lives on the IDEA, and the brief references it.** One mechanism per subject,
stored once, inherited by every angle brief beneath it. This matches
[05](./05-stage-structure.md)'s ownership (Ideate may not approve a subject without one) and
prevents the same subject sprouting contradictory mechanisms across personas. A brief does not
restate it; it writes *to* it.

**2. The coverage axes are recorded as structured fields on content, not prose.** The operator
chose structured fields over a comment convention, which makes a `content`-repo schema change a
**precondition of the rewrite**, not a follow-up. Each produced asset must record: **lead type**,
**opening frame** (the four permitted frames from [14](./14-opening-beat-policy.md)), **proof
device** (the four families from [12](./12-proof-problem.md)), **register**, and **length band**.
Without these, [the measurement loop](./17-testing-loop.md) has nothing to read and the coverage
score at set level cannot be checked mechanically.

**3. Scoring changes shape too.** [08](./08-variation-mechanics.md) split scoring into per-item
floor compliance and a set-level coverage judgement. `save_content.score` is a single per-item
number, so the set-level score has nowhere to live either. Either a set-level record appears, or
coverage is asserted in the writer's summary and never persisted — the latter fails the
measurement requirement.

## Recommendations for the `content` repo (this map does not land them)

Stated as recommendations with reasons, per the map's scope:

- **`ideas`**: a required-for-ads `mechanism` field (Vietnamese prose). Required at approval
  time, not at draft time, so drafting is not blocked.
- **`content`**: `lead_type`, `opening_frame`, `proof_device`, `register`, `length_band`.
  **SUPERSEDED by [17](./17-testing-loop.md): these land as new taxonomy KINDS, not columns** —
  `get_term_performance` attributes by kind and would read them the day they are populated,
  whereas columns (or a JSON blob) need new aggregation code first. Kept here only to record
  that the fields are required; the shape is 17's.
- **`content` or a sibling**: somewhere to record the **set-level coverage judgement**, since
  per-item `score` cannot express it.
- **`briefs`**: no new field — but `cta` should be documented as *direction only*, subordinate
  to the layer's rule, so the two can never be read as peers.

Whether these land as columns, taxonomy terms, or a JSON detail blob is the `content` repo's
call; the doctrine only requires that they be **queryable**, because an unqueryable record
cannot close the measurement loop.
