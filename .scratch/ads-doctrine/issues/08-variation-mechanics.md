# What makes N variations genuinely different

Type: grilling
Status: resolved
Blocked by: 04, 18
Parent: ../map.md

## Question

The blandness complaint is that a batch of variations reads as one ad rewritten. Decide
what a batch is *for* and what axis its members differ on: different hook mechanics
against one structure? different structures against one promise? different leads?
different proof types? — and how many, and who picks the axis.

Related: is a batch a test with a hypothesis, or a set of options for a human to pick
from? That answer changes what the pipeline must record alongside each variation, and
whether "produce N and drop the weak ones" is still the right loop at all.

**What [the canon sweep](./01-canon-sweep.md) established, which reframes this ticket:**

- The **3–5 per ad set** number has **no first-party evidence**. Meta's old "6 or fewer
  creatives per ad set" guidance was withdrawn; current guidance says "creative
  diversification" and ASC tests up to 150 combinations.
- The binding constraint is **spend per creative, not creative count** — so "how many" is
  the wrong question to lead with; the right one is how many a budget can actually teach us
  anything about.
- Meta's own line — first-party — is that swapping CTA or headline is **iteration, not
  diversification**. That is precisely the blandness complaint, stated by the platform.
- ~2% of creatives win, so a batch is a search, not a shortlist.
- The canon is almost entirely *structures* and very short on *generators*. Varying the
  structure across a batch may therefore not produce genuine difference at all — the
  variation axis probably has to be a generator (a different objection, a different
  mechanism, a different protagonist), not a different skeleton.

So decide the axis on the evidence that varying it counts as diversification rather than
iteration, and decide the count from what the ad set can afford to spend per creative.

## Session note — 2026-07-29 (attempted, parked, not resolved)

Two things came out of the attempt, and the second one blocked it.

**The operator declined to fix the axis yet**, on the grounds that the structure of copy,
headline and description can each change — so it is not yet clear what a "variation" even is.
That is a correct instinct, not indecision: the axis cannot be chosen before the unit that
gets measured is known.

**The account runs Advantage+ / dynamic creative — Meta permutes the assets.** This is the
fact that reshapes the whole ticket. Consequences to work through once
[What Meta reports at asset level](./18-meta-asset-reporting.md) comes back:

- A "variation" has **no stable identity in delivery**. Copy #2 is not an ad; it is one asset
  Meta may combine with any headline, description and image. So attributing a result to a copy
  choice is not obviously possible at all, and "one axis per batch" may be unachievable in
  principle rather than merely strict.
- If asset-level attribution is weak, the batch stops being a test and becomes **supply for the
  permutation engine** — and its job is coverage, not comparison: the set must span genuinely
  different options so the engine has something to choose between. Meta's own iteration-vs-
  diversification line then bites hard, since permuting near-identical copies teaches nothing.
- Real hypothesis testing would have to move **up a level** — separate ad sets or campaigns per
  hypothesis — which is a media-buying act, and the ad set is explicitly outside this creative
  pipeline. So the doctrine may be able to *propose* a test structure but not run one.
- Whatever survives here feeds
  [How the system measures what it ships](./17-testing-loop.md), which is blocked on this
  ticket.

## Answer

**A batch is coverage, not comparison.** Meta's measurement surface decided this before taste
did: the ad is the smallest attributable unit, asset breakdowns carry no outcome metric, and
delivery is not randomised across assets ([What Meta reports at asset
level](./18-meta-asset-reporting.md)). A produced copy line is therefore **not testable**, and
any doctrine that scores one against another is scoring noise.

**1. Dynamic creative stays; the ad is accepted as the floor.** The operator chose to keep the
permuted pool rather than hand-assemble fixed ads to buy attribution back. So the pipeline
stops pretending a copy variation is an experiment. Its job is to **supply the engine with
genuinely different options**, and learning happens at the ad and angle level, not per line.
No media-buying change follows from this map.

**2. A batch must span four axes.** Members differ on:

- **Lead type** — each copy opens differently, drawn from the leads that the reader's awareness
  stage admits (the mapping is overlapping by design, so two or three are legitimate at any
  stage). This is the spine's own variable, and it changes the first line — the part the
  ~125-character fold actually exposes.
- **Proof device** — one carries the mechanism explanation, another a client journey, another
  origin/certification. In a category whose trust is publicly broken, betting a whole batch on
  one proof type is the risk.
- **Emotional register** — candid, warm, clinical, matter-of-fact. The engine can only choose
  between things that genuinely read differently.
- **Length / density** — some assets short enough to survive the fold intact, others carrying
  the full pre-sell, so the engine can find the right depth per placement.

Whether all four must vary within a single batch or across the brief's whole output is a
sizing question for [the application table](./07-copy-application-table.md); what this ticket
fixes is that these are **the** axes, and that varying wording alone is not variation — it is
what Meta itself calls iteration, and it teaches the engine nothing.

**3. Scoring splits in two.** Per-item scoring becomes **pass/fail against the floor**: the
mechanism beat is present, the opening is compliant, proof is attached, the close qualifies.
The 1–5 judgement moves **up to the set** and asks whether it actually spans the axes. A weak
item is regenerated **on its own axis**, so the set can never collapse into three near-identical
survivors — which is exactly how the current "drop anything ≤3 and regenerate" loop produces
the blandness complaint it was meant to prevent.

**4. Count follows spend, not a number.** "3–5 per ad set" has no first-party basis and Meta
argues against fixing one; the binding constraint is spend per creative, and **adding a creative
to a live ad set resets learning**. So a batch is sized by what the ad set can afford to expose,
and topping up a running ad set is a real cost, not a free improvement.

**Conditional, left open deliberately.** If [the API probes](./19-meta-api-probes.md) show the
referral webhook carries the DCO-selected variant, copy-level outcome attribution partially
reopens and comparison becomes possible alongside coverage. Nothing here forecloses that: the
axes are recorded per asset either way, which is what
[the measurement loop](./17-testing-loop.md) needs.

## Amendment — 2026-07-30: the conditional has FIRED

[The live probes](./19-meta-api-probes.md) show messaging conversions and cost-per-action are
returned **per text asset**. So the closing paragraph's condition is met, and copy-level outcome
attribution is available today.

What changes: a batch is still **coverage** (delivery is not randomised, so it is not a
controlled test), but its members can now be **scored after the fact** — conversations started
and cost per conversation, per copy line, aggregated **by exact text** rather than by asset id
(the same text can carry several ids). Coverage remains the production-time rule; attribution
becomes a real read-back rather than a hoped-for one.

What does not change: no causal claim from asset comparisons; copy×headline interactions stay
invisible; and a minimum-volume floor is required before quoting any cost-per figure — the
sampled tail includes a 1-impression asset.
