# The copy application table

Type: grilling
Status: resolved
Blocked by: 04, 06
Parent: ../map.md

## Question

Produce the table the writer works from: for each copy section the pipeline produces
(`copy`, `headline`, `description`, `image_content`) crossed with the diagnostic's cells,
which structure applies, what the opening must do, what proof is obligatory, and what the
close asks for.

Settle the mechanics that the current prose leaves to taste: how long a piece runs and
what decides that; whether the hook is a fixed slot or a chosen mechanic; how the CTA is
selected; what a claim must be backed by before it may be written, given Vietnamese
health-claim constraints. Also settle how the writer self-scores — the current 1–5 rating
scores against brand fit, and doctrine conformance is a different question.

## Answer

The table below is what the writer works from. It composes decisions already made — the spine
([04](./04-framework-spine.md)), the ad's job per layer ([13](./13-what-the-ad-is-for.md),
[15](./15-layer-vs-spine.md)), the proof families ([12](./12-proof-problem.md)), the opening
rule ([14](./14-opening-beat-policy.md)), coverage ([08](./08-variation-mechanics.md)) and the
Vietnamese adaptation ([10](./10-vietnamese-adaptation.md)) — and adds only the per-section
sizing. Existing KB docs (`craft/copy-floor`, `ad/headline-formulas`,
`ad/creative-guidelines`, `ad/cta-catalog`, `rules/compliance`) keep their authority over the
concrete caps and formulas; nothing here restates or overrides them.

### The floor — every section, every ad, pass/fail

1. A **mechanism** beat is present or inherited (the brief's idea names it).
2. The **opening asserts nothing about the reader** — one of the four permitted frames.
3. Every claim **traces** to a live KB proof point or the paperwork, and names its trace.
4. The **close matches the layer's job** — L1 qualifies, L2 soft-engages only, L3 pre-sells.
5. No manufactured urgency **and no explicit anti-urgency**; urgency stays implied.
6. Mandatory footer where `rules/compliance` requires it; banned words and formats clear.

A failure is not a low score — it is a reject. Scores are for coverage, not for compliance.

### Per section

| Section | Structure | Proof load | Coverage axes it must span | Sizing |
|---|---|---|---|---|
| **`copy`** | Lead → mechanism → proof → close, per the layer's job | Carries the pre-sell: the mechanism plus proof sized to the layer (heaviest at L3, lightest at L2) | **All four** — lead type, proof device, register, length band | Operator-specified per run (see below) |
| **`headline`** | Hook only — no lead structure fits the character budget; write to a named formula in `ad/headline-formulas` and pass its competitor test | One concrete proof point at most; the *Urgent* and *ultra-specific* dimensions of the 4 U's are **not** available here (they manufacture non-compliant lines) | **Hook mechanic + proof device**; register where it fits | As today unless data says otherwise |
| **`description`** | One beat that complements the headline rather than echoing it | Lead with one concrete proof; vary which proof across the set | **Proof device + beat**; no CTA language | As today |
| **`image_content`** | On-image text under the existing hard word caps, spanning density profiles | Proof yields to brevity — density is met across the set, never crammed into one version | **Density profile + hook mechanic** | As today |

### The fold, per lead — not a template

The ~125-character truncation is a **diagnostic applied per lead type**, not a rule about what
must appear. The single check: **nothing essential may be stranded below the fold** — copy that
only makes sense once expanded fails. What "essential" means differs by lead (a Story lead's
first move is not an Offer lead's), which is exactly why no fixed prescription is imposed.

### Sizing is deliberately unresolved

*(Operator: "not have enough data to decide frequency.")* So the doctrine does **not** fix a
count or a cadence. It fixes only this: **whatever N is asked for, the set must span the axes for
that section** — N=2 spanning two leads is coherent; N=5 that all open the same way is a failure
regardless of how well each reads. Two facts constrain whoever sets N later: the binding limit is
**spend per creative**, not creative count, and **adding a creative to a live ad set resets
learning**, so a top-up is never free. `ad/creative-guidelines` §5's per-layer cadences are the
obvious anchor when there is data to confirm them — the doc itself flags them as team heuristic.

This is a real hole, and it is left open on purpose rather than filled with a number nobody can
defend. It closes when [the measurement loop](./17-testing-loop.md) produces something to set it
from.

### Coverage applies per section, to what the section can hold

Only `copy` has room for all four axes. A headline of ~27 characters cannot express a lead
structure, so requiring it would be enforcing fiction; it varies its hook mechanic and proof
device instead. Each section spans the axes it can physically carry — and it must, because Meta
permutes the sections independently: a single-flavour headline pool bottlenecks the whole
permutation no matter how well the copy pool spans.

### What the self-score becomes

Per item: the floor, pass/fail. Per set: does it span the axes this section can hold. The old
1–5 brand-fit judgement does not survive as the primary gate — it measured taste against a bar
the platform never reads, while letting a set of near-identical survivors through. Where a
human-readable quality signal is still wanted for the dashboard, it is **secondary** to the
coverage judgement and must never be the reason a set ships.
