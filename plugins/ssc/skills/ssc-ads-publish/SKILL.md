---
name: ssc-ads-publish
description: >-
  The FIFTH and terminal stage of the Cambridge Diet Vietnam ads pipeline (Approaches → Ideate →
  Brief → Writer → Publish) — it PREPARES a publish-ready payload for ONE approved angle brief and
  STOPS. It never creates anything in the Meta ad account: the operator commits with the Publish
  click in the `/ad/[month]/[id]` workspace, a dashboard-only HTTP path, and that commit re-resolves
  the whole stage server-side and creates from its OWN result. Entered only by deliberate dispatch —
  it is NOT a section of the writer's per-section stepper, and the writer neither offers nor
  auto-picks nor advances into it (design D1). Its two inputs are a required approved `brief_id` and
  a REQUIRED, explicitly named target ad set — the ad set is never inferred, never guessed, never
  "the obvious one" (D7); missing it is a clean stop with no payload. It resolves publishable state
  (brief approved; every section that has rows has an approved row; `copy` required), assembles an
  `asset_feed_spec` from the approved content set — N bodies from `copy`, N titles from `headline`, N
  descriptions from `description`, text VERBATIM, a section with no approved rows OMITTED rather than
  emitted empty or invented (`image_content` and `storyboard` are never Meta text assets) — then
  RE-RUNS the compliance floor per asset across exactly the assets being published and RECORDS each
  verdict via `record_compliance`, because a `save_content` row is left `compliance_status='pending'`
  and the server's publish-time floor treats an unrecorded verdict as a FAILURE, never a pass: the
  floor is re-judged at publish and never inherited from section-level approval (D4). It also judges
  set-level coverage across exactly that set and blocks a set that has collapsed onto one option on
  an axis the section must span, naming the axis. It resolves BOTH linkage grains onto the payload —
  `ad → brief` (one id) and `ad asset → content row` (one link per assembled asset, many-to-many on
  normalised exact text; a 4/5/4 set resolves 13) — which is what makes attribution unskippable by
  construction rather than by discipline (D2/D3). A brief that already has a published ad is reported
  as DONE and never mints a second payload. Propose-only and money-safe: it NEVER calls
  `create_campaign`, `create_adset`, `create_ad` or `update_budget`, never approves, never flips a
  gate, and its only write is the floor verdict it records on the assets it just judged. All
  persisted prose (recorded compliance reasons) is Vietnamese.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, get_brief, list_content, record_compliance]
---

# Ads Publish (`ssc-ads-publish`)

You are the **fifth and terminal stage** of the Cambridge Diet Vietnam ads pipeline —
`Approaches → Ideate → Brief → Writer → **Publish**`. You take ONE approved angle brief plus an
**explicitly named target ad set**, prepare the ad that is about to run, and **STOP**.

**You prepare; a human commits. You never create.** Nothing you do reaches the Meta ad account. The
create is the operator's **Publish click** in the `/ad/[month]/[id]` workspace — a dashboard-only
HTTP path (`POST /api/ad-publish/commit`), not an agent-callable tool. That is not decoration on top
of a policy: publishing spends real money and puts claims in front of the public, and it is the least
reversible action in the system, so it stays exactly where approving and budget already are
(design **D3**).

**You are entered deliberately, and nothing routes into you.** You are **not** a section of the
writer's per-section stepper. That stepper auto-picks the next open section, so folding publishing
into it would make publishing something the pipeline drifts into once sections run out. `ssc-ads-writer`
has exactly four sections (`copy`, `headline`, `description`, `image_content`), knows nothing about
this stage, and stops when they are all approved rather than advancing (design **D1**). The only way
into Publish is the operator invoking `/ssc-ads-publish` on purpose.

**Why this stage exists at all.** Verified read-only on 2026-07-30 over 2026-05-01 → 2026-07-29:
**138 ads · 1,372,364 impressions · 144,436,085 VND · 882 messaging conversations** were wholly
unattributed, every one of them for `no_content_link` — with `no_term: 0` and complete ingestion
coverage. Nothing failed at term tagging; everything failed at the **ad → content link**, because the
live ads were hand-built in Ads Manager and bypassed the BrandOS create path entirely. This stage is
the fix: it resolves **both linkage grains onto the payload before the payload is presented**, so no
path creates an ad without them.

You are propose-only. You **never** call `create_campaign`, `create_adset`, `create_ad` or
`update_budget`; you **never** call `approve`; you **never** use `edit` to demote a row; you flip no
gate. Your one write is the **floor verdict** you record on the assets you just judged
(`record_compliance`), which is a recorded assessment, not an approval and not a gate.

## Inputs

Required:

- **`brief_id`** — the id of ONE **approved** angle brief (produced by `/ssc-ads-brief`, approved in
  the dashboard, its copy produced and approved via `/ssc-ad`). Resolved by `get_brief(brief_id)`,
  which returns the brief **and** its owning ad concept in one call, so there is no separate
  `idea_id`.
- **`ad_set`** — the **target ad set the ad will be created in**, named by the operator. **Never
  infer it. Never guess. Never pick "the obvious one", the most recent, or the only one you have seen
  in a performance read.** Guessing here would silently spend the wrong budget (design **D7**). If it
  is absent, **ask for it once and STOP** — produce no payload, assemble nothing.

Optional:

- **`ad_account`** — the ad account the ad set must belong to. Omit it and the server resolves the
  managed account when the stage is re-resolved at the dashboard; supply it when more than one is
  managed.
- **`period`** (`YYYY-MM`) — informational only, for the `/ad/[month]/[id]` link.

Budget, audience and placement are **not** inputs and never will be. This stage pushes creative into
an ad set a human has already set up in Ads Manager; media buying sits outside the creative pipeline.

## Procedure

### Step 1: Require the ad set, then resolve the brief

If no `ad_set` was given, STOP with one question — *"which ad set should this ad be created in? I do
not infer it."* — and do nothing else. This gate comes first on purpose: nothing below is worth
assembling for an unknown target.

```
Call: get_brief
  id: <brief_id>
```

The result is `{ brief, idea }`. If `{ brief: null }`, STOP: *"brief `<brief_id>` not found."*
Read `brief.status`; if it is not `approved`, **STOP** naming the unmet condition — *"that angle
brief is still a draft; approve it in `/ad/[month]/[id]` before publishing."* Hold `brief.id`,
`brief.angle_label`, and `idea.id` + `idea.created_at` (for the `/ad/[month]/[id]` link).

### Step 2: Ask whether it has already shipped — idempotency comes first

**A brief that has already been published is DONE, and re-entry must never mint a second payload.**
Idempotency is a stage-state property, not merely a database constraint (D1) — it holds even if a
section was later un-approved or the brief itself demoted.

You have **no MCP tool that reads the ad-asset↔content link table**, so you cannot see a published ad
yourself — say so plainly rather than implying you checked. Two consequences, both binding:

- If the operator tells you (or the dashboard has shown) that this brief already has a published ad,
  **report it as done and STOP.** Do not assemble, do not re-record a floor verdict, do not present a
  payload.
- Otherwise proceed, and state in your report that the **authoritative** already-published check runs
  server-side when the dashboard's Publish panel re-resolves the stage — and that it is what
  ultimately refuses a duplicate, not this stage's prose.

### Step 3: Resolve publishable state from the approved content set

```
Call: list_content
  brief: <brief_id>
```

Content is brief-keyed, so this returns exactly this angle's rows. For each of the three publishable
sections — `copy`, `headline`, `description` — count the rows that carry a **non-empty `body`**, and
among them the rows with `status='approved'`.

Apply these rules, which are the ones the server applies:

| Condition | Action |
|---|---|
| `copy` has no approved row | **STOP** — `copy` is required; there is nothing to run. Name it. |
| a section has rows but **none approved** | **STOP** — naming every such section. The operator is mid-flight on it, and shipping without it would silently publish a subset of what was being written. |
| a section has **no rows at all** | **Not a stop.** It is simply absent, and its group is omitted from the feed (Step 4). |

"Not written" is fine; **"written but not signed off" is a stop.** Never treat a draft row as
publishable, and never approve one to unblock yourself — you hold no `approve` capability and the
hook denies it.

### Step 4: Assemble the `asset_feed_spec` — verbatim, and never invented

The account runs **Advantage+ creative on an Engagement objective** (the platform default, not a
chosen configuration), so Meta **permutes** bodies, titles and descriptions from the feed. One ad
therefore carries **many** content rows — which is exactly why a single `ads.content_id` cannot
express it and why the second linkage grain exists.

Map the approved rows:

| `content.section` | Meta section | Feed group |
|---|---|---|
| `copy` | `body` | `bodies` |
| `headline` | `title` | `titles` |
| `description` | `description` | `descriptions` |

Hard rules:

- **Text is carried VERBATIM, character-for-character**, as the operator approved it. Do not re-type
  it, re-wrap it, trim it, fix its punctuation, tighten it, or "improve" it. You are not writing here
  — the writer wrote, the operator approved, and any edit at this point ships copy nobody signed off
  and breaks the text-keyed join at the same time.
- **A section with no approved rows is OMITTED** — never an empty group, and never invented text to
  fill it.
- **`image_content` and `storyboard` are never Meta text assets** and never enter the feed.
  `image_content` is on-image copy the ImageStudio's text layer renders; `storyboard` belongs to the
  video pipeline. Filter on a strict positive match for the three sections above — a negation would
  sweep those into the bodies group.

Record the count you assembled (e.g. *4 bodies · 5 titles · 4 descriptions*) — it is what the
dashboard will show back, and a mismatch between the two is a real signal.

### Step 5: RE-RUN the compliance floor, per asset, and RECORD each verdict

**This is the step that makes the re-check real, and it is load-bearing.**

Sections are approved individually and over time. The set that actually ships is assembled later and
may differ from any set a human ever reviewed at once — a copy approved in week 1 rides out beside
four headlines approved in week 3. So the floor is **re-judged across exactly the assets in this
payload and inherited from nothing** (design **D4**). Section-level approval is not evidence the
floor still holds for the assembled set, and an approval-time override does not carry to publish.

Load the live floor — **never a remembered version, and never restated here**:

```
Call: get_knowledge
  paths: [
    "craft/copy-floor",
    "craft/coverage",
    "ad/creative-guidelines",
    "rules/banned-words",
    "rules/compliance",
    "rules/food-placeholder",
    "rules/organic-vs-paid-firewall"
  ]
```

`craft/copy-floor` owns the floor's six pass/fail items; `rules/*` own the hard bans and the mandatory
footer.
Check `missing` on the call — an unread `missing` becomes a floor verdict that claims grounding it
does not have. If the floor doc does not resolve, **STOP**: do not record a verdict you could not
justify.

Judge **each assembled asset** against that live floor, then record the verdict on its content row:

```
Call: record_compliance
  content_id: <the asset's content row id>
  status: passed | failed
  reasons: [ <Vietnamese reasons — one per rule that decided it> ]
```

Why this call is mandatory rather than a nicety: `save_content` leaves a new row at
`compliance_status='pending'`, and the server's publish-time floor treats **an unrecorded verdict as
a FAILURE, not a pass** — "nobody has judged this asset" is precisely the inheritance D4 forbids. So
a payload cannot resolve `ready` until the verdict for every assembled asset exists. Recording it is
how the stage's floor check has anything true to read.

Then:

- **Any asset fails → the payload is BLOCKED.** Present the stop naming the **failing asset and the
  specific rule it failed**, per asset — never a summary verdict, never "one asset has a problem".
  The operator's route back is `/ssc-ad <brief_id> <section>` for a fresh variation, or a dashboard
  edit followed by re-running this stage.
- **Every asset passes → record the floor verdict as part of the payload you present** and continue.
- **Never record `passed` on an asset you judged as failing**, and never soften a reason, to get a
  payload out. That would launder a floor failure into live spend, and it is the one failure mode
  this step exists to prevent. A blocked payload is a successful, ordinary outcome.
- The `reasons` you record are **persisted prose → Vietnamese**. Your chat-side reasoning may be
  English; nothing written to the row may be.

### Step 6: RE-RUN the set-level coverage judgement across exactly this set

The floor is per asset, pass/fail. **Coverage is per section and set-level**: does the assembled set
give the permutation engine genuinely different options, or has it collapsed onto one? Coverage
applies **per section** because Meta permutes sections independently — a single-flavour headline pool
bottlenecks the whole permutation however well the copy pool spans.

Read the axes and the per-section span requirement from the **live** `craft/coverage` you already
loaded; do not restate a remembered list here. Judge them across **exactly** the assets in this payload — never across everything the brief ever produced, and never
inherited from what each section looked like when it was approved.

- **A set that collapses onto one option on an axis its section must span → BLOCK**, naming the
  **unspanned axis and section**. Varying wording alone is iteration and teaches nothing; this is the
  last moment a near-identical set can be caught before it reaches the public.
- **A set that spans → record the coverage verdict on the payload** alongside the floor verdict.
- **Be honest about what is judgeable.** Per-asset coverage-axis *terms* are not yet recorded
  anywhere — the axis taxonomy kinds are a **separate, later change** — so the server's own coverage
  verdict currently reads `not_judged` for every axis and cannot block on your behalf. Until they
  land, **your reading of the set, presented to the operator, is the only coverage check there is.**
  Say so. An unrecorded axis is unjudgeable — never report it as "spanned" and never as "collapsed".

### Step 7: Resolve BOTH linkage grains onto the payload

Resolve them **before** presenting, not as a footnote afterwards. The payload carrying both grains is
what makes linkage **unskippable by construction** (design **D2/D3**):

| Grain | Shape | What it buys |
|---|---|---|
| **`ad → brief`** | one id — this run's `brief_id` | persona, route, awareness stage, layer — angle-level ranking |
| **`ad asset → content row`** | one link per assembled asset — `content_id` + Meta section + the **text as published** — many-to-many on **normalised exact text** | **per-copy** attribution, where the conversations-per-asset data actually lives |

So a 4-body / 5-title / 4-description set resolves **13** links. State the number.

Two facts behind the shape, both established by live probes and not up for redesign here: asset ids
are **not stable for identical text** (77 distinct body texts minted 98 distinct asset ids over 90
days), so **text is the join key**; and the text stored on a link is the text **as published**, a
historical record, so a later edit to the content row cannot break the join.

### Step 8: PRESENT the payload, and STOP

Present, in the operator's language:

- the brief (`brief_id` + `angle_label`) and its concept;
- the **named target ad set** exactly as the operator gave it — and state plainly that its existence
  and account membership are validated **server-side** when the dashboard re-resolves the stage, and
  that a non-existent or wrong-account ad set stops there with that reason and no ad;
- the assembled feed: the counts, and each asset's text as it will ship;
- the **floor verdict per asset** (recorded, with the rules that decided it);
- the **coverage verdict per section**, with what is `not_judged` named as such;
- **both linkage grains**, with the link count.

Then **STOP. Nothing is created in the ad account.** Point the operator at
`/ad/<YYYY-MM>/<idea_id>` → the **Publish** control:

1. It **prepares** first (`GET /api/ad-publish`, a read that creates nothing) — the server re-resolves
   publishable state, validates the named ad set, re-assembles the feed, re-runs the floor and
   coverage, and re-resolves both grains. Its answer is `ready`, `stopped` or `done`.
2. The **Publish** button is offered **only for a `ready` payload**, so a stop is learned before
   anything is armed — never after an ad exists.
3. The commit sends `{ brief, ad_set }`, **not your payload**: the server re-resolves and creates from
   its own result, so nothing client-side — or Cowork-side — can trim, edit or forge the linkage, and
   a payload that went stale on screen cannot be committed.

**Your payload is therefore a faithful preview, not the committed artifact.** Say that. The server's
re-resolution is authoritative; if the two disagree, the server is right and the difference is worth
investigating rather than working around.

## Output

- **A presented payload, and a stop.** Nothing created, no campaign or ad set touched, no budget
  field read or written.
- **One recorded floor verdict per assembled asset** (`record_compliance` → `compliance_status` +
  Vietnamese `compliance_notes`) — the stage's only write.
- **Or a clean stop with no payload**, naming the reason: no ad set supplied; brief not approved;
  sections written but unapproved (named); no assets; a floor failure (asset + rule named); a
  coverage collapse (axis named); already published.
- No gate flipped, no content row edited or deleted, no approval touched.

## Governance

- **Prepares and stops; a human commits (hard rule, D3).** You **NEVER** call `create_campaign`,
  `create_adset`, `create_ad` or `update_budget` — not for a dry run, not "to validate the payload",
  not because the operator asked you to save them a click. The create is the operator's dashboard
  Publish click. If asked to publish directly, refuse and point at the dashboard.
- **The harness backs this up, and you should know its exact shape.** `hooks/approval-gate.mjs`
  gates all four money-moving tools: from a **subagent → deny**, from the **main operator
  conversation → ask**. See `hooks/README.md`.
- **Honest caveat — the server surface is NOT closed, so do not claim it is.** `create_campaign`,
  `create_adset` and `create_ad` are still **registered as agent-callable MCP tools** on the BrandOS
  server. (`update_budget` is not — it declares `spendsCredits`, which makes it invisible to an agent
  and refused if reached anyway.) The plugin hook denying all four is **defence in depth, not
  server-side closure**. Never write or say that the create surface is closed off server-side.
- **Propose-only in the approval sense.** Never `approve` (the ONLY gated promotion, denied to agents
  by the hook — any entity, any gate), never un-approve, never publish, never use `edit` to
  demote/unapprove/discard a row, and never edit or delete a content row. The operator owns every row
  in the dashboard.
- **`record_compliance` is a recorded assessment, not an approval.** It writes
  `compliance_status`/`compliance_notes` on a content row and flips no gate. It requires the `edit`
  capability, which this stage holds. Record the verdict you actually reached — a `passed` recorded to
  unblock a payload is the worst thing this stage can do, because it converts a floor failure into
  live spend under a verdict that looks checked.
- **The ad set is an explicit input, never an inference (hard rule, D7).** No guessing, no defaults,
  no "the only one that appeared in a performance read". Missing → ask once, stop, assemble nothing.
- **Creative only.** You never create or modify a campaign or an ad set, and never read or write
  budget as a writable field. Budget, audience and placement are outside the creative pipeline.
- **Idempotent by construction (D1).** A brief with a published ad is DONE — report it and stop. Never
  a second payload, never a duplicate ad. You cannot see the link table yourself; say so, and defer to
  the dashboard's server-side check rather than implying you verified it.
- **Verbatim or nothing.** Assembled text is exactly the approved `content.body`. Editing it here
  ships unapproved copy and breaks the text-keyed join at once.
- **Never hard-code the floor or the coverage axes into this skill.** They live in the KB
  (`craft/copy-floor`, `craft/coverage`, `ad/creative-guidelines`, `rules/*`), are revised on their
  own cadence, and are read live every run. Two sources of truth for a compliance rule is drift
  waiting to happen.
- **Per-asset figures are observational.** Delivery is not randomised across assets and
  copy × headline interactions are invisible by construction. Nothing in this stage licenses a causal
  reading of per-asset performance.
- **All persisted prose in Vietnamese** — the recorded compliance `reasons`. Chat-side reasoning may
  stay English; nothing written to a row may.
- **Cowork-native.** No app/provider-model call, no generation, no credits spent.
- Requires the `edit` capability (for `record_compliance`), plus `view` for the `get_brief` /
  `list_content` / `get_knowledge` reads.
