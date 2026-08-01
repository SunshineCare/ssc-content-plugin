# Cambridge Diet Vietnam — Ads Doctrine

**Decision record. Prepared 2026-07-30. Status: complete, pending implementation.**
Source of record: 19 resolved decision tickets in [`issues/`](./issues/), five evidence files in
[`research/`](./research/). This document synthesises them; where the two differ, the ticket wins.

---

## 1. Executive summary

### The governing thought

> **The ads pipeline produces bland, underperforming copy because it has no generator and no
> memory: it invents topics instead of finding mechanisms, and it varies wording instead of
> varying anything a delivery engine can distinguish or a report can attribute. Fix those two and
> the structure follows — no new framework library required.**

### Five messages

**1. Blandness is a generator shortage, not a structure shortage.** The published direct-response
canon is almost entirely *structures* — skeletons for arranging material you already have. Genuine
*generators* are scarce. Adding PAS, AIDA, PASTOR and the rest to the skills would therefore have
changed nothing. The doctrine instead makes **research and a named mechanism mandatory upstream**,
so every ad has something specific to say before anyone chooses how to say it.

**2. The mechanism beat is the single highest-leverage change, and it is unoccupied ground.** Of
~45 live Vietnamese weight-loss ads observed, **none** explains why previous attempts failed or
why the body responds as it does. They list what a product does. A mechanism persuades while
asserting nothing about the reader and promising no outcome — which is also the only way past
Meta's Personal Attributes policy *and* Vietnam's công-bố ceiling simultaneously. It is
differentiation and compliance in one move.

**3. Awareness routes to a *lead type*, not to a copy formula.** The popular
awareness→AIDA/PAS/FAB-BAB/PASTOR mapping traces only to low-tier SEO blogs, with a competing blog
mapping against it. The one awareness→X mapping with a primary source (Masterson & Forde, *Great
Leads*, 2011) routes to the **opening**, and its stages admit two or three leads each. That overlap
is where variation legitimately lives.

**4. A batch of variations is coverage, not comparison — but it can now be scored.** Delivery runs
dynamic creative, so Meta permutes assets and no variation is an experiment. Its job is to give the
engine genuinely different options. Live API probes then overturned the documented position: text
assets **do** report messaging conversions and cost-per-action, so copy-level outcomes are readable
today. Coverage is the production rule; attribution is the read-back.

**5. The doctrine is a hypothesis set, and says so.** No independent efficacy evidence exists for
any framework in this field; the only third-party-auditable evidence (Ehrenberg-Bass, Binet &
Field) disputes direct-response premises outright. The spine is therefore chosen for **what it
forces the pipeline to do** — research, name a mechanism, declare a lead, attach traceable proof,
close by qualifying — not because it is proven to convert. Measurement is built in so it can be
revised on evidence rather than on taste.

### What changes, in one line each

| # | Change | Where |
|---|---|---|
| 1 | Research + candidate mechanisms become a required period pass | Approaches |
| 2 | No subject approvable without a mechanism | Ideate |
| 3 | Brief declares awareness stage + layer; carries the mechanism; does **not** pick the lead | Brief |
| 4 | Writer picks the lead and spans four coverage axes, recording each | Writer |
| 5 | Per-item scoring becomes pass/fail on a six-item floor; the 1–5 judgement moves to the set | Writer |
| 6 | Coverage axes become taxonomy kinds, so the existing monthly Review reads them | Server + Review |
| 7 | Proof, opening frames, urgency and refusals restated as checkable rules | KB |

---

## 2. Situation

Cambridge Diet Vietnam sells a consultation-led *liệu trình* to women 35–60 through paid social.
Ads exist to earn a Messenger conversation with a human specialist — never a checkout. The creative
pipeline is five staged, propose-only steps: **Approaches → Ideate → Brief → Writer → Publish**
(Publish added 2026-07-30), with a human
approving at each gate.

The brand's position is unusually strong for the category. It holds independent third-party
university trials, a founder who is a genuine obesity-research figure, EU-standard compliance,
20+ years of lawful circulation in Vietnam, and a founder who has used the product since 2004.

Three drivers prompted this review: **ads do not perform**; the skills **invent their own
structure** rather than standing on established doctrine; and the copy comes out **bland and
same-shaped**.

---

## 3. Complication

Six constraints, each verified rather than assumed, and each of which invalidates an obvious fix.

**3.1 The canon cannot supply what was missing.** It is structures, not generators. A structure
library does not produce a distinctive argument; it arranges one. *(→ [T01](./issues/01-canon-sweep.md))*

**3.2 The law removes the category's proof devices.** `NĐ 15/2018` requires pre-clearance and
forbids advertising beyond the registered công bố; **khoản 2 Điều 27 makes doctor, pharmacist and
health-worker imagery, names and patient letters illegal** for a food product. `NĐ 38/2021`
penalties reach 40–60tr for an organisation **plus 3–5 months' suspension of the product's công
bố** — the deterrent that matters. The amended Luật Quảng cáo (in force 1 Jan 2026) makes endorsers
personally liable and requires them to have used the product. Meta separately bans before/after
imagery and second-person assertions about a reader's body. Between them, the category's four
default proof devices — before/after, white coats, celebrity assertion, guarantees — are gone.
*(→ [T02](./issues/02-market-teardown.md), [T12](./issues/12-proof-problem.md))*

**3.3 The category's own doctrine is folk practice, and its compliance posture is evasion.**
Observed live: banned words broken with punctuation (`G.iảm C.ân`, `m.ỡ`, `in.sulin`), outcome
claims everywhere (*"BAY NGAY 5KG"*, *"72 xuống 64cm"*), second-person body assertions in
high-impression active ads. No named framework appears anywhere. Enforcement is evidently weak —
which means our compliance rules are a **chosen risk position**, not a level playing field.
*(→ [T11](./issues/11-observe-real-ads.md))*

**3.4 The close cannot be a close.** The funnel is ad → Messenger → consult, sold as a course of
treatment. Every canon structure terminates in *Action*, *Push*, *Response* or *Purchase*; none of
those is available. *(→ [T13](./issues/13-what-the-ad-is-for.md))*

**3.5 Variation as practised is invisible to the platform.** The account runs Advantage+
audience/placements/creative on an Engagement objective — the platform default, not a choice — so
Meta permutes bodies, headlines, descriptions and images. Meta's own guidance calls swapping a CTA
or headline **iteration, not diversification**. "3–5 creatives per ad set" has no first-party
basis; the binding constraint is **spend per creative**, and adding a creative to a live ad set
**resets learning**. *(→ [T08](./issues/08-variation-mechanics.md), [T18](./issues/18-meta-asset-reporting.md))*

**3.6 Urgency is unavailable in both directions.** Manufactured pressure is barred by law, platform
policy and brand voice. But explicitly disclaiming it — telling her she needn't decide today —
raises the pressure in order to deny it, spends scarce characters on a non-message, and reads as a
sales move about not selling. *(→ [T10](./issues/10-vietnamese-adaptation.md))*

---

## 4. Resolution — the spine

### 4.1 A chain, not a menu

```
        ┌──────────────────────────────────────────────────────────────┐
        │  RMBC INTAKE          research + named mechanism (generator) │  Approaches
        └──────────────────────────────────────────────────────────────┘
                                     ↓
        ┌──────────────────────────────────────────────────────────────┐
        │  SCHWARTZ             awareness × sophistication (diagnostic)│  Brief
        └──────────────────────────────────────────────────────────────┘
                                     ↓
        ┌──────────────────────────────────────────────────────────────┐
        │  LEAD TYPE            Masterson & Forde — the six leads      │  Writer
        │                       overlapping by stage → room to vary    │
        └──────────────────────────────────────────────────────────────┘
                                     ↓
        ┌──────────────────────────────────────────────────────────────┐
        │  HOUSE BEATS          lead → mechanism → proof → qualified   │  Writer
        │                       invitation, tuned per layer            │
        └──────────────────────────────────────────────────────────────┘
```

### 4.2 What is fixed, and what is deliberately not

The distinction is the doctrine's core design choice, and it came from the operator: *in ads you
cannot know in advance which approach will succeed, so hold a set of tools and vary them rather
than declaring a winner now.*

| Fixed — because law, policy or the funnel fixes it | Varied — because only delivery can decide |
|---|---|
| The RMBC intake (research + mechanism) | Which lead type opens |
| Awareness → lead-type routing | Which body structure carries it |
| The mandatory mechanism beat | Which proof device is pressed |
| A compliant, non-assertive opening | Which register speaks |
| A close matching the layer's job | How long the piece runs |

PAS, BAB, the 4 P's, PASTOR, QUEST, AIDA and the rest are retained as **admitted tools**, each
carrying its own beat count, proof-asset requirement and length. A tool whose requirements the
available proof cannot meet is simply unavailable for that ad — a fit rule, not a ranking. **SLAP
is excluded** (its letters name funnel events, not writing beats). **The 4 U's** are not adopted as
a headline generator: *Urgent* and *ultra-specific* manufacture non-compliant lines here.

### 4.3 Attribution corrections to carry into the docs

The six leads are **Masterson & Forde (2011)**, not Makepeace. The 12-step VSL is
**DigitalMarketer's** (Edwards' own has ten). ACCA is **Colley/DAGMAR (1961)**.
Star–Story–Solution is not Collier. FABV's V is **Value**, not Verification.

---

## 5. Resolution — the pipeline

### 5.1 Ownership, unambiguous

| Element | Owner | Note |
|---|---|---|
| Voice-of-customer research, candidate mechanisms | **Approaches** | RMBC's front half, in a stage that already existed |
| Creative coverage target (persona × route × count) | **Approaches** | Repairs a live orphan: Ideate consumes `creative_target`, nothing has written it since Focus was retired |
| Subject **+ its mechanism** | **Ideate** | A subject without a mechanism is not approvable |
| Persona, route, awareness stage, layer | **Brief** | One brief = one persona × route angle |
| Lead type, opening frame, proof device, register, length | **Writer** | Recorded per asset |
| Set-level coverage judgement | **Writer** | New; has no home in the current schema |
| Asset-feed assembly, final floor + coverage re-check, both linkage grains | **Publish** | Separate fifth stage with its own entry point; prepares the payload and stops |
| Volume and budget allocation | **Head** | `detail` is refused from the channel |
| Market-sophistication read | **Quarterly strategy** | Slow-moving; the month inherits it |
| Proof inventory; offer / promotion state | **Month** | Neither is verifiable by the writer |

Stage count, gates and the propose-only invariant are unchanged. **No skill, agent or projector
ever approves anything.**

### 5.2 Publish — the terminal stage

Deployment used to sit outside the creative pipeline. It is now its **fifth stage**, and it is what
makes the measurement loop hold by construction rather than by discipline.

The step assembles the **`asset_feed_spec`** from the approved set — N bodies, N titles, N
descriptions, the natural shape for an account that runs dynamic creative — re-runs the **floor**
and the **set-level coverage** judgement across exactly the assets being published (the last point
at which a near-identical set can be caught), resolves **both linkage grains**, and stops.

| Grain | Join | What it buys |
|---|---|---|
| **ad → brief** | Single FK, known at publish | Persona, route, awareness stage, layer — angle-level ranking |
| **ad asset → content row** | Many-to-many, on exact normalised text | **Per-copy** attribution — where the conversations-per-asset data lives |

A single `content_id` cannot express a dynamic-creative ad: one ad carries N content rows, so a
one-to-one FK would force an arbitrary pick. And because asset ids are not stable for identical
text, **text is the join key** — the same conclusion the probes reached from the other direction.

**The push is a human action.** The operator clicks Publish in the dashboard; the agent never calls
`create_campaign`, `create_adset`, `create_ad` or `update_budget`. Publishing spends real money and
puts claims in front of the public, so it stays where approving and budget already are. The step
*prepares*; a human *commits*. The propose-only invariant is unchanged.

**Governance gap to close alongside it**: those four tools are money-moving and currently
agent-callable, while the approval-gate hook guards only the approve verbs. Extend the hook to deny
them from a subagent and ask in the main conversation.

### 5.3 Why the lead sits with the writer, not the brief

The awareness→lead mapping is overlapping by design: a stage admits two or three leads. Fixing the
lead at brief time would mean approving four briefs to span four leads for one angle, multiplying
operator work while removing the only axis that changes the first line — the part the ~125-character
fold actually exposes.

---

## 6. Resolution — the application table

### 6.1 The floor: six checks, pass/fail, every section

A failure is a **reject, not a low score**.

1. A **mechanism** beat is present or inherited.
2. The **opening asserts nothing about the reader** — one of the four permitted frames.
3. Every claim **traces** to a live KB proof point or to the paperwork, and names its trace.
4. The **close matches the layer's job**.
5. **No manufactured urgency and no explicit anti-urgency** — urgency stays implied.
6. Footer where required; banned words and formats clear.

### 6.2 Per section

| Section | Structure | Proof load | Axes it must span |
|---|---|---|---|
| **`copy`** | Lead → mechanism → proof → close, per layer | Carries the pre-sell; heaviest at L3, lightest at L2 | All four |
| **`headline`** | Hook only, written to a named formula, passing its competitor test | One concrete proof at most | Hook mechanic + proof device |
| **`description`** | One beat complementing the headline, never echoing it | Lead with one concrete proof, varied across the set | Proof device + beat |
| **`image_content`** | On-image text under existing caps, spanning density profiles | Proof yields to brevity; density met across the set | Density + hook mechanic |

Coverage applies **per section** because Meta permutes sections independently: a single-flavour
headline pool bottlenecks the whole permutation however well the copy pool spans.

### 6.3 The opening: a grammatical rule, four permitted frames

> **Address her — *chị* stays, it is the brand's register. Never assert a personal attribute.** A
> second-person sentence whose predicate is a body, health or failure state fails, however gently
> phrased.

This is checkable by shape rather than by word list, which is why `rules/banned-words` cannot
express it. Permitted frames: **third-person story** (the compliant form of the category's
pain-mirror), **first-person** (founder or specialist about herself), **situation not body**,
**mechanism-first**.

*Validation from the account itself*: the two highest-impression body assets in the last 90 days
are a first-person failed-journey line and a reported third-party dialogue — both already inside
these frames. The doctrine codifies what the best existing copy already does.

### 6.4 The fold is a per-lead diagnostic, not a template

Meta gives primary text 50–150 characters and headlines 27, truncating around 125 behind "See
more". An Offer lead and a Story lead do not share a first move, so no fixed prescription applies.
The single check: **nothing essential may be stranded below the fold.** Observed practice supports
this — the category writes long past the fold and lets interested readers expand.

### 6.5 Per-layer close

| Layer | Role & KPI | Close |
|---|---|---|
| **L1** | Qualifier; cost-per-purchase, ~2× warm | Qualify hard, pre-sell lightly |
| **L2** | Feeder; reach / CPM / ThruPlay — **never orders** | Neither: soft engagement only |
| **L3** | Closer; cheapest orders, strongest proof | Pre-sell hard, qualify gently |

Layer and awareness stage are **not redundant**: layer says where the ad sits and how it is judged;
awareness says what she knows. A cold L1 audience still contains product-aware readers.

---

## 7. Resolution — proof

Four adopted families. They are also the pool the proof-device coverage axis draws from, so **a
batch must not lean on one family twice**.

| Family | Rule | Why it survives |
|---|---|---|
| **Mechanism** | Mandatory floor, every ad | Asserts nothing, promises nothing; unoccupied in the category |
| **Institutional / clinical** | Existence and institution only — **never the numbers** | Independent third-party trials are our real differentiator; a kg or disease figure exceeds the công bố |
| **Human** | Founder's 20+ years as *continuity*; specialist spotlights; client journeys **in words** | No body imagery, no outcome figures; the founder satisfies the 2026 endorser law by construction |
| **Documentation** | Real công-bố / licence numbers **in the paperwork's own wording** | Answers the category's top fear; structurally uncopyable by unregistered competitors |

**Refused, with the constraint that refuses each**: before/after imagery (Meta policy; documented
as faked here) · doctors, pharmacists, health workers, patient letters (**illegal** — NĐ 15/2018
khoản 2 Điều 27) · celebrity/KOL assertion (discredited by the Kera and Super Detox X3
prosecutions; personally liable from 1 Jan 2026) · guarantees and refunds (platform policy) ·
anything exceeding the công bố · **character obfuscation** (`G.iảm C.ân`) — the category's standard
evasion, and absurd beside a brand whose differentiator is documentation.

**The attachment rule**: no claim may be written that does not trace to a live KB proof point or to
the paperwork, and the writer names the trace so a reviewer checks it rather than re-arguing the
sentence.

**Scope correction from observation**: supplement brands in this market *do* cite studies (patents,
the PDR, Pubmed-indexed research with asterisked footnotes). The unfilled gap is narrower and
sharper — **independent third-party university trials** — and that is the claim to make.

---

## 8. Resolution — variation and measurement

### 8.1 Coverage, on four axes

A batch's job is to give the permutation engine genuinely different options. Members differ on:

1. **Lead type** — changes the first line, the part the fold exposes.
2. **Proof device** — never bet a batch on one, in a category whose trust is publicly broken.
3. **Register** — using the brand's existing Confessor / Educator / Friend vocabulary. The doctrine
   invents no parallel register scheme.
4. **Length / density** — so the engine can find the right depth per placement.

**Varying wording alone is iteration and teaches nothing.** Constrained by the counterweight in
§8.4: coverage varies the *argument*, never the brand's identifiers.

### 8.2 Scoring, split in two

Per item: the floor, pass/fail. Per set: does it span the axes this section can hold. A weak item
is regenerated **on its own axis**, so a set can never collapse into near-identical survivors —
which is precisely how the current "drop anything ≤3 and regenerate" loop manufactures the
sameness it was meant to prevent. The old 1–5 brand-fit number survives only as a secondary
dashboard signal and may never be the reason a set ships.

### 8.3 Batch size: deliberately unset

There is no defensible number yet. "3–5 per ad set" has no first-party basis and Meta argues
against fixing one. The invariant instead: **whatever N is asked for, the set must span that
section's axes.** Two facts bound whoever sets N later — spend per creative binds, not count; and
topping up a live ad set resets learning. This closes once a quarter of ranked data exists.

### 8.4 The counterweight: distinctive-asset consistency

The evidence-based tradition earns three checkable rules, not a philosophy or a spend split:

1. **The brand's identifiers recur** — the founder, the specialist-on-Zalo motif, the visual
   signature. Coverage varies the argument, never the identifiers. Without this, "genuinely
   different options" licences the churn that destroys recognition.
2. **Never score a feeder by conversion.** An L2 set with no orders looks like failure, is not, and
   killing it makes L3 expensive.
3. **Reach breadth over narrow targeting.** Persona lives in the creative, not the audience — which
   matters more once briefs are explicitly persona-tagged, because a tagged brief invites a
   persona-narrowed audience, and that is wrong under Advantage+ broad.

Not adopted: the 60/40 long/short spend split (FMCG-derived), and no anti-persuasion claim.

### 8.5 Measurement: the loop already exists

`get_term_performance` attributes performance to **taxonomy terms by kind** and is already the
monthly Review's input. So the coverage axes land as **new taxonomy kinds**, not columns and not a
JSON blob:

| Option | Readable by the existing tool | Typo protection | Open roster |
|---|---|---|---|
| **Taxonomy kinds** | **Yes, the day they populate** | Term must exist | Yes |
| JSON column | No — build the reader first | **None; a typo vanishes silently** | Yes, by having no schema |
| Typed columns | No | Enum rejects | No — migration per value |

**Cadence splits: monthly Review ranks; doctrine changes only quarterly.** ~2% of creatives win and
delivery is not randomised, so a single month's ranking is mostly noise. Doctrine amendment is a
human act — the propose-only invariant applied to the doctrine itself.

### 8.6 What the probes changed

Read-only probes against the live account overturned the documentation-derived verdict:

| Question | Documented position | Observed |
|---|---|---|
| Outcomes per text asset? | Not available; ad is the floor | **Available** — 748 conversations started across 98 body assets in 90 days, plus `cost_per_action_type` per asset |
| Asset id stable for identical text? | Unknown | **No** — 77 texts minted 98 ids ⇒ **aggregate by exact text** |
| `adlabels` as a join key? | Unverified | Absent, and **unnecessary** |

Still true: delivery is not randomised, so asset figures are **observational, not causal**;
copy×headline interactions are invisible; a minimum-volume floor is required before quoting any
cost-per figure.

### 8.7 The precondition — checked, and broken today

Term attribution on the ads side depends on the **ad → content linkage** being populated. It is
not. Verified read-only on 2026-07-30 over 2026-05-01 → 2026-07-29:

| Signal | Value |
|---|---|
| Terms attributed | **none — `terms: []`** |
| Unattributed ads | **138** ads · **1,372,364** impressions · **144,436,085 VND** · **882** messaging conversations |
| Reason | `no_content_link` on all 138; **`no_term: 0`** |
| Unattributed page posts | 29, same reason |
| Ingestion coverage | `complete: true`, 90/90 days |

Nothing fails at term *tagging*; everything fails at the **content link**, and it is not an
ingestion gap — the performance data is present.

**A healthy-looking flag masks it.** `get_ad_performance` reports `linkage_populated: true` with
561/570 ads carrying a story id — but that is the **ad ↔ page-post** join used for organic/paid
classification, a different join from **ad → content row**. Checking the first and concluding the
loop works would be wrong.

**So this is Step 0 of implementation, not a risk to monitor.** Adding the five taxonomy kinds while
this is broken produces tags nothing can read — the silent failure this doctrine warned about,
already in progress. **Cause established**: the live ads were **hand-built in Ads Manager**, bypassing the BrandOS
create path entirely — the link was never attempted rather than dropped. `ads.content_id` already
exists as an FK but is optional. The fix is therefore the new **Publish stage** (§5.2), which makes
the linkage a precondition of publishing, plus a text-match backfill for the legacy assets that can
be reconciled.

---

## 9. Where the doctrine lives

**Skills hold structure. The KB holds all judgement.** Skill prose keeps stage order and contracts,
tools, gates, propose-only, and the instruction to read named docs live. Every revisable rule lives
in the KB, because a baked-in copy goes stale silently *and* overrides the live doc it mirrors.

The floor is deliberately **not** duplicated into skill prose as an outage fallback: two sources of
truth for a compliance rule is the drift this repo has already been burned by. A failed KB read
**stops the run**.

| Element | Home |
|---|---|
| Spine, rationale, the no-efficacy-evidence statement, the mechanism | **New doc** — nothing owns this ground |
| Lead taxonomy + awareness mapping | `craft/awareness-framework` — already holds the grid |
| The six-item floor | `craft/copy-floor` |
| Opening frames + the person rule | `rules/` — a compliance constraint, not craft |
| Coverage axes | `ad/creative-guidelines` §4.3, **reconciled** with its existing diversity rule |
| Proof families / refusals | `brand/proof-points` + `rules/compliance` |
| Per-layer close job | `ad/layer-tones` |
| Register values | `voice/founder-voice` — **unchanged** |

---

## 10. Implementation sequence

Each step depends on the one before it. Step 1 is in another repo.

| # | Step | Repo | Gate |
|---|---|---|---|
| **0** | **Build the Publish stage** — dashboard publish action carrying both linkage grains, plus a text-match backfill of legacy assets. The link was never attempted, not dropped: the live ads were hand-built in Ads Manager, and `ads.content_id` already exists but is optional | `content` | `get_term_performance` returns non-empty `terms[]` for a period containing a published ad |
| 1 | Taxonomy kinds for the five axes; mechanism on `ideas`; set-level coverage record; proof-inventory + offer-state on `month_plans`; sophistication read on `strategy_briefs` | `content` | Schema applied |
| 2 | KB doc edits **proposed and approved** in the Knowledge dashboard | BrandOS | Human approval — propose-only |
| 3 | Skill / agent rewrite against the approved docs | `ssc-content-plugin` | Version bump in the same commit |
| 4 | Republish the ChatGPT bundle | both | `publish-chatgpt-bundle.sh --check` clean |

**Step 2 cannot be skipped or reordered.** If the skills change first, they will read live KB docs
that contradict them.

**Step 0 gates the value of steps 1 and 3, not their mechanics.** The rewrite would function
without it — but its measurement half would silently record nothing, so the doctrine would become
unfalsifiable exactly where it promises to be testable. Fix the link first.

---

## 11. Risks and open questions

| Risk | Assessment |
|---|---|
| **We handicap ourselves against non-compliant competitors.** Personal Attributes and the outcome-claim ban are demonstrably unenforced here. | Accepted deliberately. The rules cost us the category's crudest hooks and buy a position no prosecuted competitor can hold. **State it as a choice in the doctrine**, or the first person to open the Ad Library will quietly stop following it. |
| **Companionship is already occupied.** Coached gyms sell a 1:1 personalised route in our exact vocabulary. | Real. Differentiation must rest on mechanism, documentation and independent evidence — not on *đồng hành* language alone. |
| **The mechanism requirement slows Ideate.** | Intended. A topic without a mechanism cannot produce copy with one. |
| **The measurement loop is dead now.** The ad→content linkage is **entirely unpopulated** — 138 ads and 144.4M VND over 90 days attributable to nothing. | **Confirmed, blocking.** Promoted to Step 0. Until it is fixed, every axis tag written is a tag nothing reads, and the doctrine's central promise — revision on evidence — cannot be kept. |
| **No efficacy evidence for any of it.** | Stated openly, and the reason measurement is a design requirement rather than a feature. |

**Fog remaining** — in scope, not yet sharp: how the doctrine gets validated before the rewrite;
what happens to briefs and copy already approved under the old model; whether agent-level gates
change shape; whether the image-prompt chain needs anything different from a redesigned brief;
whether compliance becomes its own pipeline step; and whether to take one of the market's open gaps
(maintenance/regain, men, comorbidity, candour, visible compliance) as an explicit position.

**Out of scope**: mining historical performance to *choose* the doctrine (measurement forward is
required; retrofitting is not), and the implementation itself.

**Still open, low priority**: whether the Messenger referral webhook carries the DCO-selected
variant. It was the highest-value probe only while asset-level outcomes were believed unavailable.

---

## Appendix A — Decision index

| # | Ticket | Decision in one line |
|---|---|---|
| 01 | [Canon sweep](./issues/01-canon-sweep.md) | Field is structures; generators scarce; three operator premises tested, two failed |
| 02 | [Market teardown](./issues/02-market-teardown.md) | Folk doctrine; law strips the proof devices; funnel is inbox, not checkout |
| 03 | [Doctrine home](./issues/03-doctrine-home.md) | Skills = structure, KB = judgement; new spine doc + edits; no duplicated floor |
| 04 | [Framework spine](./issues/04-framework-spine.md) | RMBC → Schwartz → lead type → varied toolkit; mechanism mandatory |
| 05 | [Stage structure](./issues/05-stage-structure.md) | Four stages survive; Approaches and Ideate get new jobs |
| 06 | [Brief model](./issues/06-brief-model.md) | Mechanism on the idea; axes recorded per asset; `cta` demoted to direction |
| 07 | [Application table](./issues/07-copy-application-table.md) | Six-item floor; per-section axes; fold per lead; batch size unset |
| 08 | [Variation mechanics](./issues/08-variation-mechanics.md) | Coverage not comparison; four axes; scoring split |
| 09 | [Strategy & plan layer](./issues/09-strategy-plan-layer.md) | Volume = head, coverage shape = channel; three things handed down |
| 10 | [Vietnamese adaptation](./issues/10-vietnamese-adaptation.md) | Urgency implied; authority first-person; candour bounded; KB registers |
| 11 | [Observed ads](./issues/11-observe-real-ads.md) | Policy unenforced; clinical gap narrower; obfuscation refused; mechanism absent |
| 12 | [Proof problem](./issues/12-proof-problem.md) | Four families adopted; numbers withheld; refusals with legal basis |
| 13 | [Ad's job](./issues/13-what-the-ad-is-for.md) | Messenger only; close qualifies **and** pre-sells |
| 14 | [Opening beat](./issues/14-opening-beat-policy.md) | Grammatical rule; four permitted frames |
| 15 | [Layer vs spine](./issues/15-layer-vs-spine.md) | Layer survives as funnel role + KPI; close rule is per layer |
| 16 | [Evidence-based tradition](./issues/16-evidence-based-counter-tradition.md) | Three checkable rules; no spend split |
| 17 | [Measurement loop](./issues/17-testing-loop.md) | Axes as taxonomy kinds; monthly ranks, quarterly revises |
| 18 | [Meta asset reporting](./issues/18-meta-asset-reporting.md) | Documented limits — central verdict later overturned in part |
| 19 | [API probes](./issues/19-meta-api-probes.md) | Copy-level outcomes available; aggregate by text |

## Appendix B — Evidence base

| File | What it is | Confidence |
|---|---|---|
| [`canon.md`](./research/canon.md) | ~900 lines; 20 flows classified; 18 documented source conflicts; 5 attribution errors corrected | High on sourcing, nil on efficacy — none exists |
| [`market.md`](./research/market.md) | ~60 cited sources on law, platform policy, category practice, trust collapse | High on law/policy; creative claims superseded by observation |
| [`meta-measurement.md`](./research/meta-measurement.md) | 882 lines from Meta's own docs; 21 flagged silences and contradictions | High on what is written; central verdict corrected by probes |
| [`ads-observed.md`](./research/ads-observed.md) | ~45 live VN ads, primary text as served | High — first-hand; shows what runs, not what works |
| [`meta-probes.md`](./research/meta-probes.md) | Read-only live API probes; P1–P3 answered, P4–P6 open or not run | High — observed request/response |

**Deliberately not run**: any probe requiring an ad or ad-set **write**, since those mean real
spend and outward-facing objects. None of the load-bearing questions needed one.
