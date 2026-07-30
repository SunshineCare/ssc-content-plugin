# What strategy and the monthly plan owe the ads channel

Type: grilling
Status: resolved
Blocked by: 04, 05
Parent: ../map.md

## Question

Above the ads channel sit the quarterly strategy cycle and the monthly plan head
(Review → Tactics → Research → Narrative, releasing the channels on one narrative
approval). Under the chosen spine, what must those layers hand down for the ads channel
to produce doctrine-conformant work — and what are they currently handing down that is
noise?

Decide: does the month owe the ads channel a stated market-sophistication read, a
positioning claim, a proof inventory, an offer? Does the quarterly strategy own the
sophistication read instead, since it moves slowly? Does the ad channel plan's
"Approaches" step still make sense, or is it a duplicate of what the month already said?

Where the answer requires changing the `monthly-plan-owns-the-month` spec or the
`channel_plans` shape, state the change as a recommendation with its reason — this map
does not land it.

## Answer

Schema read live. The head (`save_month_plan`) carries `performance_review`, `tactics`,
`research`, `narrative` and a `strategy_brief_id`; the channel plan (`save_channel_plan`) carries
`context`, `creative_target`, `detail`, and links to both. Two facts decided most of this:

- **`detail` allocations are refused** from period 2026-08 (`retired_plan_field`) — volume and
  budget are the head's.
- **`creative_target` is still live and writable by the channel**, and is *consumed by ad Ideate
  to size its subject pool* — but the Focus step that used to write it is retired, so **nothing
  writes it today**. The tool's own description says its new home is an open decision.

### 1. `creative_target` is authored by the repurposed Approaches step

The operator's call. It looks at first like the channel authoring its own quantities, which the
monthly-plan design forbids — but the line is cleaner than that, and the server already draws it:

| Field | Owner | What it is |
|---|---|---|
| `detail` (posts/week, budget split, creative counts) | **Head** | Volume and budget allocation — refused from the channel |
| `creative_target` (persona × route × count) | **Channel / Approaches** | The *shape* of creative coverage — which personas and routes must be covered |

So the rule is **volume and budget belong to the head; creative coverage shape belongs to the
channel**. Approaches is the right home because it is now the step that gathers the period's
research and candidate mechanisms ([05](./05-stage-structure.md)) — it is the only step that can
see which persona × route territory the month's themes actually open up. No server change is
needed: `creative_target` already accepts a channel write.

This also repairs a live defect independent of this map: a field that Ideate consumes has had no
writer since Focus was retired.

### 2. Four things the layers above must hand down

**From the quarterly strategy — the market-sophistication read.** How saturated the category's
claims are, which sets **how indirect a lead must be** (the Schwartz axis the lead taxonomy hangs
off). It is a slow-moving judgement and re-deriving it monthly would produce churn, so the
quarterly cycle owns it and the month inherits it via `strategy_brief_id`. Practically: the
observed market — outcome numbers everywhere, obfuscated banned words, discount-led closes — is a
late-sophistication picture, and that is a quarterly finding, not a monthly one.

**From the month — the proof inventory.** Which proof devices are available *this period*: which
documents are in hand, what current endorser exposure looks like, whether any regulatory change
has landed. The ads channel then selects from a known-good set instead of re-litigating compliance
per ad. This matters because [12](./12-proof-problem.md) made proof device a required coverage
axis: a batch must span devices, so the channel needs to know which ones are live before it can
span them.

**From the month — the offer / promotion state.** Whether a real, dated promotion exists. Under
the implied-urgency rule ([10](./10-vietnamese-adaptation.md)) a genuine dated occasion is the
*only* legitimate ground for timeliness, and the writer cannot invent or verify one. If nothing is
stated, the answer is "none" and no timeliness appears — not a guess.

**Already handed down — the month's themes.** `tactics` carries them, authored once above the
channel. Nothing changes.

### 3. What the layers should stop handing down

Nothing new is added to the head's four steps, and **Review stays the system's only look-back**.
One change of emphasis: Review now ranks the new coverage-axis kinds
([17](./17-testing-loop.md)) alongside pillar/persona/route/angle — same step, more kinds, no new
tool. Doctrine amendment still waits for the quarterly cycle.

### 4. Recommendations for the `content` repo

- `month_plans`: somewhere to state the **proof inventory** and the **offer/promotion state** for
  the period. Both are read by every ads step and neither has a home; `tactics` is the wrong place
  (it is the themes, and conflating them would make the themes unreadable).
- `strategy_briefs`: somewhere to record the **market-sophistication read** so the month can
  inherit rather than re-derive it.
- `channel_plans.creative_target`: no schema change — but the retired-Focus orphan should be
  documented as now owned by Approaches, since the tool description currently says its home is
  undecided.

**No change is proposed to the `monthly-plan-owns-the-month` spec's step structure**, its gate, or
its channel-release model. The additions above are fields, not steps.
