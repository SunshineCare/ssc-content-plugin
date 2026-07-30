# Does the four-stage pipeline survive?

Type: grilling
Status: resolved
Blocked by: 04
Parent: ../map.md

## Question

Today the ads pipeline is Approaches → Ideate → Brief → Writer, with a deliberate
"persona-late" split: the idea is a persona-free subject, persona and route enter at the
brief, and copy executes one angle. Does the chosen spine keep that split, move the
boundaries, or replace the stages entirely?

Concretely: which stage owns the awareness/sophistication diagnosis? Where does the
framework choice get made — at brief time, so copy merely executes it, or at copy time?
Does "one brief = one persona × route" still hold once leads and structures are in play,
or does a brief now fan on a third axis? Are any stages redundant, and is a stage missing?

Name the stages the doctrine wants, what each consumes and emits, and where the human
gates sit.

## Answer

**The four stages survive, and none is added — but two of them get different jobs.** The
persona-late split holds: ideas stay persona-free, persona and route still enter at the brief,
copy still executes one angle.

**Approaches → the research and mechanism pass.** It stops being a place where the channel
restates the month's themes (which it is forbidden to author anyway) and becomes where the
period's **voice-of-customer research and candidate mechanisms** are gathered for the ads
channel: what readers actually say and believe, and why past attempts fail. This is RMBC's
front half given a home that already existed — the generator work the canon sweep found the
whole field short of, landing at period level where it can serve many ideas.

**Ideate → a subject is not approvable without a mechanism.** An idea stops being a topic. It
carries the subject *and* its mechanism — why this fails, why this works — drawn from what
Approaches gathered. The existing `hero` field already gestures at this discipline; the
mechanism makes it a requirement. This is deliberately the point where blandness is attacked:
the pipeline currently invents topics here, and a topic with no mechanism cannot produce copy
with one.

**Brief → unchanged in shape, with one addition.** Still one brief = one persona × route angle.
It declares persona, route, **awareness stage** and now carries the mechanism forward from its
idea. It does **not** declare a lead type.

**Writer → owns the lead.** The brief fixes the stage; the writer spreads its batch across the
**leads that stage admits** — the awareness→lead mapping is overlapping by design, so two or
three are legitimate at any stage, and that overlap is exactly where the coverage axis lives
([What makes N variations different](./08-variation-mechanics.md)). Each asset **records which
lead it used**, which is what makes the axis auditable and what
[the measurement loop](./17-testing-loop.md) needs. Keeping the lead out of the brief also
avoids multiplying operator approvals: spanning four leads would otherwise mean approving four
briefs for one angle.

**So the stage that owns each doctrinal element:**

| Element | Stage |
|---|---|
| Voice-of-customer research, candidate mechanisms | Approaches |
| Subject + its mechanism | Ideate |
| Persona, route, awareness diagnosis | Brief |
| Lead type, opening frame, proof device, register, length | Writer |
| Coverage across the four axes | Writer (scored at set level) |

**Human gates stay where they are** — an approved idea, an approved brief, an approved section
of copy. Nothing here adds a gate, and the propose-only invariant is untouched: every stage
still drafts and a human still approves.

**Left to downstream tickets**: what the brief must physically carry to express this
([What a brief must carry](./06-brief-model.md)), and whether the layer taxonomy survives
alongside it ([Is the layer taxonomy redundant?](./15-layer-vs-spine.md)).

## Amendment — 2026-07-30: Publish becomes the FIFTH stage

*(Operator: "Publish is a new step (last step) in the ad write steps.")* This supersedes the
answer above on stage count: the ads pipeline is now **Approaches → Ideate → Brief → Writer
(sections) → Publish**, and deployment is no longer outside the creative pipeline.

**Publish is a SEPARATE STAGE, not a step in the writer's section stepper.** *(Operator, revising
the first framing: "publish as separate stage.")* The writer still ends where it ended — at drafted
sections a human approves — and it neither auto-picks Publish as a next section nor knows about it.
Publish is a fifth stage with its own entry point, its own state resolution and its own gate,
dispatched deliberately once a brief's sections are approved.

Why the distinction matters: the writer's stepper auto-picks the next open section, so folding
Publish into it would make publishing something the pipeline *drifts into* by exhaustion of
sections. As a separate stage it can only be entered on purpose.

**What the stage does.** It:

1. Assembles the **`asset_feed_spec`** from the approved set — N bodies, N titles, N descriptions —
   which is the natural shape for this account, since it runs dynamic creative and Meta permutes
   the assets ([08](./08-variation-mechanics.md)).
2. Re-runs the **floor** ([07](./07-copy-application-table.md)) and the **set-level coverage**
   judgement across the assets actually being published — the last point at which a
   near-identical set can be caught.
3. Resolves **both linkage grains** ([17](./17-testing-loop.md), and the 2026-07-30 linkage check):
   **ad → brief** as a single FK, and **ad asset → content row** many-to-many on exact normalised
   text. This is what makes the measurement loop work by construction rather than by discipline.
4. Presents a publish-ready payload and **STOPS**.

Its state is resolvable, like every other stage: an approved brief whose sections are approved and
which has no published ad is *publishable*; one already published is *done* and re-entering reports
that rather than duplicating an ad.

**The push is a human action.** The operator clicks Publish in the dashboard. The agent never
calls `create_campaign` / `create_adset` / `create_ad` / `update_budget` — publishing spends real
money and puts claims in front of the public, so it stays exactly where approving and budget
already are. The propose-only invariant is unchanged: the step *prepares*, a human *commits*.

**Why linkage still holds by construction.** The payload the human commits carries both grains
already resolved, so there is no path where an ad is created without them — which was the entire
failure mode found on 2026-07-30 (138 ads, 144.4M VND, nothing attributable).

**Open, for the feature spec, not for this map**: whether Publish creates the whole campaign →
ad-set → ad hierarchy or only pushes creative into an ad set a human has already set up. The map
holds that the ad set (budget, audience, placement) is a media-buying concern outside the creative
pipeline, which argues for the narrower option — but it is a feature-design decision.

**Governance gap this exposes, independent of the map**: `create_campaign`, `create_adset`,
`create_ad` and `update_budget` are money-moving and **currently agent-callable** on the MCP
surface, while `hooks/approval-gate.mjs` guards only `approve_*` / `unapprove_*`. Making Publish
first-class raises the stakes, so the hook should be extended to deny those four from a subagent
and ask in the main conversation.
