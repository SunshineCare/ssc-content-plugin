# Design — ads layer responsibility: a persona-late, 3-level creative hierarchy

- **Date:** 2026-07-21
- **Status:** approved (brainstorm), pending implementation-plan
- **Scope (target surface — full list settled at planning time):**
  - `plugins/ssc/skills/ssc-ads-blueprint/SKILL.md` (**dissolved** — the media buy leaves the creative pipeline entirely)
  - `plugins/ssc/skills/ssc-ads-ideate/SKILL.md` (rewrite — persona-free subjects, plan-scoped)
  - `plugins/ssc/skills/ssc-ads-brief/SKILL.md` (rewrite — persona is chosen here, one idea → many personas; **also assigns each angle its layer + ad set**)
  - `plugins/ssc/skills/ssc-ads-writer/SKILL.md` (light — tunes to the angle, not to an ad-set `build_spec`)
  - `plugins/ssc/skills/ssc-ads-focus/SKILL.md` + `ssc-ads-approaches/SKILL.md` (stay — carry the plan-level coverage/volume target; Approaches reframed off "per ad set")
  - `plugins/ssc/agents/ssc-ads-agent.md` + `plugins/ssc/commands/ssc.ads-*.md` (pipeline reshape — drop the Blueprint step; keep Focus + Approaches)
  - **BrandOS MCP server** (`content/mcp-server`, separate repo): schema — cut the idea↔ad-set weld; move
    the layer + ad-set assignment onto the **angle/brief**; the media buy (budgets/audiences/ad-set setup)
    leaves the plan entirely. This is a **cross-repo** change.
  - `CLAUDE.md` (pipelines table + the three-layer dispatch description)

> **This is a substantial re-architecture**, not a skill tweak. It changes the pipeline shape, the
> server schema, and most of the ads skills. The spec captures the *target* design and the locked
> decisions; several reconciliation points are deliberately left open for the implementation plan
> (see **Open reconciliation points**).

## Problem / motivation

The operator reports pervasive **sameness** in ad output, at every level:

1. *"A lot of the same ideas are across different ad sets / ads."* — the same concept recurs in
   multiple ad sets.
2. *"It's deeper"* — even structurally-distinct concepts yield **same-feeling briefs and copy**.
3. *"Same angle, same copy across idea and ad set."* — repetition at the angle and finished-copy
   level, across ideas and across ad sets.

The unifying cause: **persona is bound too early, and the ad set drives creative creation.** Today
the ad set (`ssc-ads-blueprint`) fixes `primary_persona` + `value`/`frame`/`tonal_register`, and
`ssc-ads-ideate` re-fixes an archetype per concept. An idea is therefore welded to one persona at
birth. But a good idea is usually *persona-agnostic* — it resonates across several personas.
Early binding means each persona's ad set regenerates **its own copy of the same subject** (the
idea repeats), and a strong idea can never be *reused* across personas.

## Diagnosis — a level must fan out on its own axis

The pipeline is a tree; each level takes one parent and produces many children. A level earns its
place **only if its children differ on an axis no other level owns**. If two adjacent levels fan
out on the *same* axis, you get the same difference twice — which reads as repetition.

Today **Idea and Angle both fan out on "the creative angle"**: Ideate tags value/frame/against/persona
(a framing); Brief derives anchor + hook_direction + core_message (also a framing). The tree fans
out on *framing* twice and on *subject* never. That redundant fan-out **is** the sameness. The ad
set compounds it by injecting persona a third time, up front.

## Locked decisions (from brainstorming)

| # | Decision | Choice |
|---|---|---|
| D1 | Solution shape | **Redraw the layer responsibilities from first principles** — not a persisted "approach-map" artifact. (An approach-map / coverage-matrix was considered and set aside as premature; see **Alternatives**.) |
| D2 | Number of *creative* levels | **Three.** The "4 levels of detail" collapse to Idea → Angle → Copy. |
| D3 | The ad set | **Removed from the creation process.** It is a pure media/operations object, not a creative level. |
| D3a | Media operation | **Wholly removed from the ad plan + creative detail.** No Blueprint step; no budgets / audiences / ad-set setup anywhere in the creative pipeline. The media buy is a separate ops concern, run outside creation. |
| D4 | Idea | **Owns SUBJECT only, and is persona-free** *and tier-free*. One tension / insight / myth / proof-territory, generated at PLAN level, written once. It carries no persona, no value/frame/against, no layer, no ad-set link. |
| D5 | Angle | **Owns PERSONA × ROUTE.** The subject meets a persona via an anchor + angle-type. **Persona enters here** (Angle *chooses* the persona; it no longer inherits one). One idea → many angles across personas and routes. |
| D5a | Layer + ad-set placement | **Decided at the Angle/Brief level, per angle.** The angle owns persona × route → awareness-stage, so it *knows* its tier; the Brief tags each angle with its target **layer + ad set**. The angle carries its own media home. (The *decision* is the Brief's; the *media operation* — budgets/audiences and the actual `create_ad` — stays human/dashboard, D9.) |
| D6 | Copy | **Owns EXECUTION** (hook / structure / register / proof phrasing). Inherits subject + persona + route + the angle's layer/ad-set; tunes to the angle's declared persona/route/awareness-stage — **not** to an ad-set `build_spec`. |
| D7 | Persona timing | **As late as possible → at the Angle level.** Route selection needs the persona's anchors, so persona and route are chosen together. |
| D8 | Deployment | The angle already names its layer + ad set (D5a); at deployment a **human** executes `create_ad` in that ad set (dashboard-only, agent-excluded). No agent/skill performs the media operation. |
| D9 | Governance | **Propose-only is preserved unchanged.** Every creative level drafts + self-scores; humans approve. A skill *tagging* an angle's target layer/ad set is a proposal on a draft — it flips no gate and performs no media operation. |

## The target hierarchy

```
CREATION  (Cowork skills — no media operation anywhere)
  Idea    SUBJECT          one persona-free, tier-free tension / insight / myth / proof-territory
    │                      generated at PLAN level, written ONCE
  Angle   PERSONA × ROUTE  the subject meets a persona via an anchor + angle-type
    │      + LAYER/AD-SET   → awareness-stage ⇒ the Brief TAGS this angle's target layer + ad set
  Copy    WORDS            execution of one angle (inherits its layer/ad-set)

DEPLOYMENT  (dashboard, human)
  create_ad in the layer + ad set the angle already named (human executes; agent-excluded)

MEDIA BUY  (separate ops — outside the plan entirely)
  Ad sets  audience-config · objective · tier · budget · placement
           defined/funded by the media side, NOT by any creative step
```

Fan-out axes read **subject → (persona × route) → words**. Three independent axes; two finished
ads are identical only if they collide on *all three*. The **layer + ad set is a tag on the angle**,
not a level the creative fans out on — it is the media *home* the angle declares, derived from its
awareness-stage.

### Per-level responsibility matrix

| Level | Owns (its axis) | Siblings are distinct by | May **not** touch | Sheds (vs. today) |
|---|---|---|---|---|
| **Idea** | subject (persona-free, tier-free) | a different subject, **plan-wide** | persona, framing, route, layer, words | `ad_slot_id`, persona, value/frame/against, layer, archetype-balance machinery |
| **Angle** | persona × route (anchor + angle-type) **+ tags its target layer + ad set** | a different **(persona × route)** on that subject | the subject, finished words, the media *operation* | *inheriting* one persona (now **chooses** it); reading its tier from an ad set (now **declares** it) |
| **Copy** | execution (hook/structure/register) | a different execution of that angle | the subject, the angle | tuning to an ad-set `build_spec` — tunes to the angle instead |
| **Ad set** | media ops (defined by the media side) | (not a creative sibling) | any creative choice | leaves the plan/creative pipeline entirely |

### Anti-blur rules (the invariants that keep levels orthogonal)

- **No media operation in the plan.** No creative step reads or writes budgets, audiences, or ad-set
  setup. The media buy is defined outside the plan.
- **Idea names no persona, no framing, and no layer.** Its `title` is a persona-free, tier-free
  subject. If a subject genuinely only fits one persona, that is a property of the subject — the Idea
  still does not *tag* a persona or a layer; the Angle discovers the fit and assigns the layer.
- **Angle chooses the persona and declares the media home.** One persona-free idea fans into angles
  across the personas it fits, each via a distinct route; each angle *tags* the layer + ad set its
  awareness-stage implies. It declares the home; it does **not** perform the media operation.
- **Copy invents no subject or angle.** It executes the inherited angle (and inherits its layer/ad-set).

## Distinctiveness & coverage — how they now emerge

- **Distinctiveness** is structural, not enforced by a new artifact: three orthogonal axes multiply.
  - Idea: distinct **subjects**, deduped **plan-wide** (not per-ad-set, not per-slot).
  - Angle: distinct **(persona × route)** per idea, and spread plan-wide.
  - Copy: distinct **execution** per angle.
  A repeat now requires colliding on subject **and** persona **and** route **and** wording.
- **Coverage** is the space these axes tile: `subjects × personas × routes`. Ideas tile the subject
  space once; each idea's angles tile the persona×route space it supports. Breadth comes from
  **reusing** a strong idea across personas — not from regenerating it.
- **Volume** is a **plan-level creative target** ("cover these subjects × personas × routes, N
  total") — **not** a per-ad-set `creative_count`. Since the media buy leaves the plan, this target
  lives on the creative-strategy front-end (`Focus` + `Approaches`), not on an ad-set demand (see
  open point 1).

## Before → after, per skill

- **`ssc-ads-blueprint` → dissolved.** The step leaves the creative pipeline entirely. Its creative
  steering (`primary_persona`/`value`/`frame`/`tonal_register`/`against`/`peak_window`/`format_pref`)
  and per-ad-set `creative_count` are gone; the media buy (ad-set structure, budgets, audiences) moves
  to a **separate ops concern outside the plan**. The plan-level creative **volume/coverage target**
  moves to the creative-strategy side (Focus). No creative step passes through a media plan.
- **`ssc-ads-ideate` → persona-free subject generation.** Produces a plan-level pool of distinct
  subjects, deduped plan-wide. **Drops** the archetype pre-assignment, the persona/value/frame/against
  tagging, and the per-slot diversity checks that depended on them. Retains an honest-scoring
  quality loop and a *subject-distinctiveness* check scoped to the whole plan.
- **`ssc-ads-brief` → persona is chosen here, and the media home is tagged here.** Reads a
  persona-free idea; enumerates the personas the subject fits (from `brand/personas`); for each,
  derives an angle (persona × route) grounded in that persona's detail doc + `ad/awareness-framework`.
  One idea fans to several personas. The awareness stage is **declared by the angle** (not read from
  an ad set), and from it the Brief **tags the angle's target layer + ad set**. The "taken set"
  de-dup widens from *this idea's briefs* to *the plan's angles* (so the same (persona × route) is
  not re-spent across ideas where it would duplicate). Tagging a target ad set is a proposal on a
  draft — the Brief performs no media operation and creates no ad.
- **`ssc-ads-writer` → light change.** Still produces per-section Vietnamese variations anchored to
  one approved angle. It **stops** resolving an ad-set `build_spec`; it tunes register/length to the
  **angle's** declared persona / route / awareness-stage. Everything else (Hook Formula Bank, proof
  points, compliance gate, propose-only save) is unchanged.
- **Agent / commands** — the ads pipeline reshapes from `Focus → Approaches → Blueprint → Ideate →
  Measure` (creative welded to ad sets) into a **creative track** — `Focus → Approaches → Ideate
  (subjects) → Brief (angles + layer/ad-set tag) → Writer (copy) → Measure` — dropping **only
  Blueprint** (the media/ops step). `Focus` + `Approaches` stay: they are the creative-strategy
  front-end (the month's bets + the creative *how* / differentiation / experiments) and together carry
  the plan-level coverage/volume target the creative track fills. The **media buy** (ad sets) is a
  separate ops track outside the plan; the two meet only when a human runs `create_ad` in the
  layer/ad-set the angle already named.
- **`ssc-ads-approaches` → stays, reframed off "per ad set".** It remains the creative-strategy step
  (differentiation, audience triggers, experiments) but its guidance now steers **routes / personas /
  differentiation** for the Brief to choose among, rather than per-ad-set creative steering. Its
  "per layer" lens becomes per-awareness-stage guidance the angle's route consumes — never a weld of a
  subject to a tier.

## Server / schema implications (BrandOS, `content/mcp-server` — separate repo)

- **Cut the idea↔ad-set weld.** Remove `ad_slot_id` (and the ad-set-derived creative fields) from
  the idea. Ideas become plan-level, persona-free **and layer-free**.
- **Angle/brief carries persona + route + awareness-stage + target layer + target ad set** as
  first-class fields. Persona moves from the idea onto the brief; awareness-stage becomes an intrinsic
  angle field (not an ad-set read); the **layer + ad-set tag** is the angle's declared media home.
- **The media buy leaves the plan.** Ad-set definitions (audiences/budgets/tiers/placements) are owned
  by the media/ops side, not by any creative artifact. The angle's ad-set tag is a **reference** to
  one of those ad sets; whether ad sets pre-exist for the Brief to pick or the Brief declares an
  intent the media side realizes is an open point (see open point 2).
- **Deployment** — a human runs `create_ad` in the angle's tagged layer + ad set. No agent/skill
  performs the media operation (`create_ad`/`create_adset`/`update_budget` stay dashboard-only).
- **Taxonomy** — reconcile which axes are controlled vocabularies (persona, angle-type, register,
  proof-lead, **layer**) vs. open text (the subject, the specific anchor instance). Controlled axes
  drive distinctiveness/coverage checks; open axes are compared for similarity only.

## Open reconciliation points (settle in the implementation plan)

1. **Coverage-target shape + home.** What the plan-level creative volume/coverage target looks like
   (subjects × personas × routes × counts), how it splits across `Focus` (the bets) and `Approaches`
   (the creative *how*) now that the media plan is gone, and how Ideate/Brief read it.
2. **How the Brief references an ad set.** Whether ad sets **pre-exist** (defined on the media side)
   for the Brief to pick a `layer + ad_set` from, or the Brief declares an abstract `layer + audience
   intent` that the media side later realizes as a concrete ad set. Affects the schema of the angle's
   media-home tag and the deployment `create_ad` step. (For the L2 omnipresence model, where an ad set
   often carries a single creative, an angle may map ~1:1 to an ad set; for stable L1/L3 broad ad sets,
   many angles share one — the tag must express both.)
3. **Broad-vs-persona targeting reconciliation.** The current KB (`ad/campaign-architecture`,
   `ad/strategy`) assumes some persona-based ad-set audiences; a persona-late, broad/Advantage+
   creative-led model may require KB revisions. Flag as a KB proposal, not a silent skill change.
4. **Migration.** How existing welded ideas/briefs/content (with `ad_slot_id`) coexist with the new
   plan-level ideas during rollout; whether a one-time backfill or a clean cutover.
5. **Coverage measurement (deferred).** Whether a later phase adds an explicit, persisted coverage
   view over `subjects × personas × routes`. Deliberately **not** in this design (the orthogonal-axis
   hierarchy is expected to solve the reported problem without it); revisit only if it proves
   insufficient.

## Alternatives considered (and why not)

- **Persisted "approach map" / coverage matrix (nested per-layer claims, soft enforcement).**
  Explored in depth during brainstorming and set aside: it solves distinctiveness by *bookkeeping*
  over the existing (blurred) levels rather than by fixing the level responsibilities. Once the
  levels are orthogonal (this design), most of the map's value disappears. Kept as a possible
  future phase (open point 5), not the primary solution.
- **Keep 4 creative levels; only split Idea (subject) vs Angle (framing) without removing the ad
  set from creation.** Rejected in favor of D3: leaving the ad set in the creation chain keeps
  persona bound early (via the ad set) and preserves the repetition source.
- **Merge Idea + Angle into one Concept level (3 levels the other way).** Rejected: it kills "same
  angle across ideas" by removing the ability to fan one subject into many persona-angles — losing
  the reuse that gives breadth.

## Governance (unchanged)

Propose-only is preserved exactly. Every creative level (Ideate/Brief/Writer) drafts and
self-scores; a human approves in the dashboard. No skill or agent calls `approve`, publishes, or
schedules. The Brief **tagging** an angle's target layer + ad set is a proposal on a draft — it flips
no gate and performs no media operation; the actual ad creation and any budget/audience/ad-set setup
(`create_ad` / `create_adset` / `update_budget`) remain dashboard-only and agent-excluded. Persisted
creative prose stays Vietnamese; operator-facing chat may be the operator's language.
